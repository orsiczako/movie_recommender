<template>
  <div v-if="!isNoSoundtrackError" class="soundtrack-section">
    <div class="section-header">
      <h2 class="section-title">
        {{ title }}
      </h2>
      <button 
        v-if="!autoLoad && !loading && !loadError && tracks.length === 0"
        @click="loadSoundtrack"
        class="load-btn"
        :disabled="isLoading"
      >
        <svg v-if="isLoading" width="16" height="16" viewBox="0 0 24 24" class="loading-icon">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
        </svg>
        {{ loadButtonText }}
      </button>
    </div>

    <!-- Description -->
    <p v-if="description" class="section-description">{{ description }}</p>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner-large"></div>
      <p class="loading-text">{{ loadingText }}</p>
    </div>

    <!-- Error State - Don't show if no soundtrack found -->
    <div v-else-if="loadError && !isNoSoundtrackError" class="error-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" class="error-icon">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      <p class="error-message">{{ loadError }}</p>
      <button @click="loadSoundtrack" class="retry-btn">
        {{ retryText }}
      </button>
    </div>

    <!-- Tracks List -->
    <div v-if="tracks.length > 0" class="tracks-container">
      <!-- Track items -->
      <div class="tracks-list">
        <TrackItem
          v-for="(track, index) in tracks"
          :key="`${track.title}-${index}`"
          :track="track"
        />
      </div>
    </div>
  </div>
</template>

<script>
import TrackItem from './TrackItem.vue'
import api from '@/services/api'

export default {
  name: 'SoundtrackSection',
  components: {
    TrackItem
  },
  
  props: {
    originalTitle: {
      type: String,
      default: null
    },
    movieTitle: {
      type: String,
      required: true
    },
    movieYear: {
      type: [Number, String],
      default: null
    },
    locale: {
      type: String,
      default: 'en'
    },
    autoLoad: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      loading: false,
      isLoading: false,
      loadError: null,
      tracks: [],
      soundtrackDescription: '',
      playlistUrl: null
      ,lastSearchTitle: null
    }
  },
  
  computed: {
    title() {
      return this.$t('soundtrack.section.title')
    },
    
    description() {
      return this.soundtrackDescription || this.$t('soundtrack.section.description')
    },
    
    loadButtonText() {
      return this.$t('soundtrack.section.loadButton')
    },
    
    loadingText() {
      return this.$t('soundtrack.section.loading')
    },
    
    retryText() {
      return this.$t('soundtrack.section.retry')
    },
    
    emptyMessage() {
      return this.$t('soundtrack.section.empty')
    },
    
    isNoSoundtrackError() {
      // Check if the error is "no soundtrack found" type error
      return this.loadError && (
        this.loadError.includes('No soundtrack') ||
        this.loadError.includes('no soundtrack') ||
        this.loadError.includes('No official soundtrack') ||
        this.loadError.includes('nem található')
      )
    },
    
    shouldShowSection() {
      // Show section if:
      // - Loading
      // - Has tracks
      // - Has error but NOT "no soundtrack" error
      return this.loading || 
             this.tracks.length > 0 || 
             (this.loadError && !this.isNoSoundtrackError)
    }
  },
  
  mounted() {
    // Auto-load soundtrack if enabled. If originalTitle is not yet available,
    // we still attempt load but will re-run when originalTitle arrives.
    if (this.autoLoad) {
      this.loadSoundtrack()
    }
  },
  
  methods: {
    normalizeString(str) {
      if (!str) return str
      return String(str).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
    },
    async loadSoundtrack() {
      this.loading = true
      this.isLoading = true
      this.loadError = null
      this.tracks = []
      this.soundtrackDescription = ''
      this.playlistUrl = null
      
      try {
        // Get soundtrack from backend Spotify API
        console.log(`Getting soundtrack for: ${this.movieTitle} (${this.movieYear})`)
        
        // Prefer sending the original (English) title as a query param when available
        const rawTitle = (this.originalTitle && this.originalTitle.trim() !== '') ? this.originalTitle : this.movieTitle
        const searchTitle = this.normalizeString(rawTitle)
        console.log('Soundtrack request - originalTitle prop:', this.originalTitle, 'movieTitle prop:', this.movieTitle)
        console.log('Soundtrack request - normalized searchTitle:', searchTitle, 'movieYear:', this.movieYear)

        const params = { originalTitle: searchTitle }
        if (this.movieYear) params.movieYear = this.movieYear

        // Avoid duplicate searches for the same title
        if (this.lastSearchTitle && this.lastSearchTitle === searchTitle) {
          console.log('SoundtrackSection: same searchTitle as last time, skipping duplicate request')
        } else {
          this.lastSearchTitle = searchTitle
          const response = await api.get(`/api/soundtrack`, { params })

          if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to get soundtrack')
          }

          const soundtrackData = response.data.data

          if (!soundtrackData.songs || soundtrackData.songs.length === 0) {
            throw new Error(this.$t('soundtrack.errors.noSoundtrack'))
          }

          console.log(`Backend returned ${soundtrackData.songs.length} songs from Spotify`)
          console.log('First song data:', soundtrackData.songs[0])

          // Set description and playlist URL
          this.soundtrackDescription = soundtrackData.description
          this.playlistUrl = soundtrackData.playlistUrl

          // Map songs to track format
          this.tracks = soundtrackData.songs.map(song => ({
            title: song.title,
            artist: song.artist,
            album: song.album,
            year: song.year,
            spotifyUrl: song.spotifyUrl,
            previewUrl: song.previewUrl,
            albumCover: song.albumCover,
            duration: song.duration,
            loading: false,
            error: null
          }))
        }
        
      } catch (error) {
        console.error('Error loading soundtrack:', error)
        this.loadError = error.message
        this.tracks = []
      } finally {
        this.loading = false
        this.isLoading = false
      }
    }
  },
  
  beforeUnmount() {
    // No cleanup needed
  }
  ,
  watch: {
    originalTitle(newVal) {
      if (this.autoLoad && newVal && !this.loading && this.tracks.length === 0) {
        console.log('originalTitle prop updated, reloading soundtrack with:', newVal)
        this.loadSoundtrack()
      }
    }
  }
}
</script>

<style scoped>
.soundtrack-section {
  margin-top: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary, #212529);
  margin: 0;
}

.load-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--primary, #007bff);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-btn:hover:not(:disabled) {
  background: var(--primary-dark, #0056b3);
  transform: translateY(-1px);
}

.load-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.section-description {
  color: var(--text-secondary, #6c757d);
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.loading-spinner-large {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-primary, #dee2e6);
  border-top: 4px solid var(--primary, #007bff);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-text {
  color: var(--text-secondary, #6c757d);
  font-size: 1.1rem;
  margin: 0;
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 12px;
}

.error-icon {
  width: 48px;
  height: 48px;
  color: #dc3545;
  margin-bottom: 1rem;
}

.error-message {
  color: #721c24;
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.retry-btn:hover {
  background: #c82333;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  background: var(--bg-primary, #f8f9fa);
  border: 2px dashed var(--border-primary, #dee2e6);
  border-radius: 12px;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: var(--text-secondary, #6c757d);
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-message {
  color: var(--text-secondary, #6c757d);
  font-size: 1.1rem;
  margin: 0;
  line-height: 1.5;
}

/* Tracks Container */
.tracks-container {
  margin-top: 1.5rem;
}

.tracks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .soundtrack-section {
    margin-top: 1rem;
  }
  
  .section-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
  
  .section-title {
    font-size: 1.1rem;
  }
  
  .load-btn {
    justify-content: center;
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }
  
  .section-description {
    font-size: 0.85rem;
    margin-bottom: 1rem;
  }
  
  .loading-state, .error-state, .empty-state {
    padding: 1.5rem 0.75rem;
  }
  
  .loading-spinner-large {
    width: 36px;
    height: 36px;
  }
  
  .loading-text, .error-message, .empty-message {
    font-size: 0.9rem;
  }
  
  .tracks-container {
    margin-top: 1rem;
  }
  
  .tracks-list {
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1rem;
  }
  
  .load-btn {
    padding: 0.35rem 0.7rem;
    font-size: 0.8rem;
  }
  
  .section-description {
    font-size: 0.8rem;
  }
  
  .loading-state, .error-state, .empty-state {
    padding: 1rem 0.5rem;
  }
  
  .loading-spinner-large {
    width: 32px;
    height: 32px;
  }
  
  .loading-text, .error-message, .empty-message {
    font-size: 0.85rem;
  }
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .soundtrack-section {
    --bg-primary: #212529;
    --bg-secondary: #343a40;
    --text-primary: #f8f9fa;
    --text-secondary: #adb5bd;
    --border-primary: #495057;
  }
  
  .error-state {
    background: #2d1b1b;
    border-color: #a94442;
  }
}
</style>