<template>
  <div class="track-item" :class="{ 'loading': track.loading, 'error': hasError }">
    <!-- Loading state -->
    <div v-if="track.loading" class="track-loading">
      <div class="loading-spinner"></div>
      <div class="loading-info">
        <span class="track-title">{{ track.title }}</span>
        <span class="track-artist">{{ track.artist }}</span>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="hasError" class="track-error">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" class="error-icon">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      <div class="error-info">
        <span class="track-title">{{ track.title }}</span>
        <span class="track-artist">{{ track.artist }}</span>
        <span class="error-message">{{ track.error || $t('soundtrack.tracks.notFoundOnSpotify') }}</span>
      </div>
    </div>

    <!-- Success state -->
    <div v-else class="track-success">
      <div class="track-image">
        <img 
          v-if="track.albumCover && !imageError"
          :src="track.albumCover"
          :alt="track.album"
          @error="handleImageError"
        />
        <div v-else class="no-image">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3V13.55C11.41 13.21 10.73 13 10 13C7.79 13 6 14.79 6 17S7.79 21 10 21 14 19.21 14 17V7H18V3H12Z"/>
          </svg>
        </div>
      </div>

      <div class="track-info">
        <h4 class="track-title">{{ track.title }}</h4>
        <p class="track-artist">{{ track.artist }}</p>
        <div class="track-meta">
          <span class="track-album" v-if="track.album">{{ track.album }}</span>
          <span class="track-duration" v-if="track.duration">
            {{ formatDuration(track.duration) }}
          </span>
          <span class="track-year" v-if="track.year">
            {{ track.year }}
          </span>
        </div>
        
        <!-- Spotify link -->
        <a 
          v-if="track.spotifyUrl"
          :href="track.spotifyUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="spotify-link"
          :title="$t('soundtrack.tracks.openInSpotify')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 14.4c-.17 0-.33-.09-.44-.24-1.15-1.4-2.86-2.16-4.81-2.16-1.77 0-3.44.69-4.7 1.95-.09.09-.2.14-.33.14-.25 0-.45-.2-.45-.45 0-.12.05-.23.14-.32 1.36-1.36 3.17-2.11 5.09-2.11 2.11 0 4.05.8 5.46 2.27.09.09.14.2.14.32 0 .25-.2.45-.45.45-.05 0-.1-.01-.14-.03-.53-.64-1.26-1.01-2.06-1.01-.8 0-1.54.37-2.06 1.01-.09.11-.22.18-.37.18-.25 0-.45-.2-.45-.45 0-.12.05-.23.14-.32.61-.61 1.42-.95 2.28-.95.86 0 1.67.34 2.28.95.09.09.14.2.14.32 0 .25-.2.45-.45.45z"/>
          </svg>
          Spotify
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TrackItem',
  props: {
    track: {
      type: Object,
      required: true
      // { title, artist, album, year, spotifyUrl, previewUrl, albumCover, duration, loading, error }
    }
  },
  
  data() {
    return {
      imageError: false
    }
  },
  
  computed: {
    hasError() {
      return this.track.error || (this.track.loading === false && !this.track.spotifyUrl)
    }
  },
  
  methods: {
    handleImageError() {
      this.imageError = true
    },
    
    formatDuration(ms) {
      if (!ms) return ''
      
      const seconds = Math.floor(ms / 1000)
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
.track-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: var(--bg-secondary, #ffffff);
  border: 1px solid var(--border-primary, #dee2e6);
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
}

.track-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.track-item.loading {
  opacity: 0.7;
}

.track-item.error {
  border-color: #dc3545;
  background: #f8d7da;
}

/* Loading State */
.track-loading, .track-success {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--border-primary, #dee2e6);
  border-top: 3px solid var(--primary, #007bff);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* Error State */
.track-error {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.error-icon {
  width: 48px;
  height: 48px;
  color: #dc3545;
  flex-shrink: 0;
}

.error-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.error-message {
  font-size: 0.85rem;
  color: #dc3545;
  font-style: italic;
}

/* Track Image and Play Button */
.track-image {
  position: relative;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.track-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.no-image {
  width: 100%;
  height: 100%;
  background: var(--bg-primary, #f8f9fa);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 1.5rem;
  color: var(--text-secondary, #6c757d);
}

/* Track Info */
.track-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0; /* Allow text truncation */
  overflow: hidden; /* Prevent overflow */
}

.track-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary, #212529);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.track-artist {
  font-size: 0.9rem;
  color: var(--text-secondary, #6c757d);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.track-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: var(--text-secondary, #6c757d);
  flex-wrap: wrap;
  overflow: hidden;
}

.track-album {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
  flex-shrink: 1;
}

.track-duration, .track-year {
  font-weight: 500;
}

.spotify-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #1db954; /* Spotify green */
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  margin-top: 0.25rem;
  transition: color 0.2s ease;
}

.spotify-link:hover {
  color: #1ed760;
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 768px) {
  .track-item {
    padding: 0.5rem;
    overflow: hidden;
  }
  
  .track-loading, .track-success, .track-error {
    gap: 0.6rem;
    overflow: hidden;
  }
  
  .track-image {
    width: 40px;
    height: 40px;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
  }
  
  .error-icon {
    width: 40px;
    height: 40px;
  }
  
  .track-title {
    font-size: 0.85rem;
  }
  
  .track-artist {
    font-size: 0.75rem;
  }
  
  .track-meta {
    font-size: 0.7rem;
    gap: 0.4rem;
  }
  
  .spotify-link {
    font-size: 0.75rem;
  }
  
  .track-info {
    max-width: calc(100vw - 120px);
  }
  
  .track-album {
    max-width: 120px;
  }
}

@media (max-width: 480px) {
  .track-item {
    padding: 0.4rem;
  }
  
  .track-image {
    width: 36px;
    height: 36px;
  }
  
  .loading-spinner {
    width: 36px;
    height: 36px;
  }
  
  .error-icon {
    width: 36px;
    height: 36px;
  }
  
  .track-title {
    font-size: 0.8rem;
  }
  
  .track-artist {
    font-size: 0.7rem;
  }
  
  .track-meta {
    font-size: 0.65rem;
    flex-direction: column;
    gap: 0.2rem;
  }
  
  .spotify-link {
    font-size: 0.7rem;
  }
  
  .track-info {
    max-width: calc(100vw - 100px);
  }
  
  .track-album {
    max-width: 100%;
  }
}

/* Dark theme support using theme-dark class */
.theme-dark .track-item {
  background: var(--bg-secondary);
  border-color: var(--border-primary);
}

.theme-dark .track-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.theme-dark .track-item.error {
  border-color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
}

.theme-dark .loading-spinner {
  border-color: var(--border-primary);
  border-top-color: var(--primary);
}

.theme-dark .no-image {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.theme-dark .track-title {
  color: var(--text-primary);
}

.theme-dark .track-artist,
.theme-dark .track-meta {
  color: var(--text-secondary);
}
</style>