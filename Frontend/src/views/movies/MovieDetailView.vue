<template>
  <DashboardLayout
    :title="movie?.title || 'Film részletek'"
    :show-back-button="true"
    back-route="/favorites"
    class="movie-detail-view"
  >
    <BaseSpinner
      v-if="loading"
      size="large"
      text="Film betöltése..."
      centered
    />

    <BaseErrorState
      v-else-if="error"
      type="error"
      title="Hiba történt"
      :message="error"
      show-retry
      @retry="loadMovie"
    />

    <div v-else-if="movie" class="movie-content">
      <div class="movie-header">
        <div class="movie-poster">
          <img
            :src="getPosterUrl(movie.poster_path)"
            :alt="movie.title"
            @error="handleImageError"
            class="poster-image"
          />
        </div>

        <div class="movie-info">
          <h1 class="movie-title">{{ movie.title }}</h1>
          <p class="movie-subtitle" v-if="movie.original_title && movie.original_title !== movie.title">
            {{ movie.original_title }}
          </p>

          <div class="movie-meta">
            <span class="year" v-if="movie.release_date">{{ getYear(movie.release_date) }}</span>
            <span class="rating" v-if="movie.tmdb_rating">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
              {{ movie.tmdb_rating.toFixed(1) }}
            </span>
            <span class="runtime" v-if="movie.runtime_minutes">{{ movie.runtime_minutes }} perc</span>
          </div>

          <div class="genres" v-if="movie.genres">
            <span
              v-for="genre in getGenres(movie.genres)"
              :key="genre"
              class="genre-tag"
            >
              {{ genre }}
            </span>
          </div>

          <div class="action-buttons">
            <button
              class="watched-btn"
              :class="{ 'watched': isWatched }"
              @click="toggleWatched"
              :disabled="isTogglingWatched"
            >
              <svg v-if="isTogglingWatched" width="20" height="20" viewBox="0 0 24 24" class="loading">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
              {{ isWatched
                ? (currentLocale === 'hu' ? 'Láttam' : 'Seen')
                : (currentLocale === 'hu' ? 'Nem láttam' : 'Haven\'t Seen')
              }}
            </button>

            <button
              class="delete-btn"
              @click="deleteFromFavorites"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z"/>
              </svg>
              {{ currentLocale === 'hu' ? 'Törlés' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>

      <div class="movie-description" v-if="movie.overview">
        <h2>{{ t('details.description') }}</h2>
        <p>{{ movie.overview }}</p>
      </div>

      <SoundtrackSection
        :original-title="movie.original_title_en || movie.original_title || movie.title"
        :movie-title="movie.title"
        :movie-year="getYear(movie.release_date)"
        :locale="$i18n.locale || 'en'"
        :auto-load="true"
      />
    </div>

    <MovieChatWidget
      v-if="movie"
      :movie-title="movie.original_title || movie.title"
      :movie-year="getYear(movie.release_date)"
      :movie-overview="movie.overview"
    />
  </DashboardLayout>
</template>

<script>
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useLocale } from '@/composables/useLocale'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import BaseErrorState from '@/components/ui/BaseErrorState.vue'
import SoundtrackSection from '@/components/ui/SoundtrackSection.vue'
import MovieChatWidget from '@/components/ui/MovieChatWidget.vue'
import apiClient from '@/services/api'

export default {
  name: 'MovieDetailView',
  components: {
    DashboardLayout,
    BaseSpinner,
    BaseErrorState,
    SoundtrackSection,
    MovieChatWidget
  },

  setup() {
    const router = useRouter()
    const { user } = useAuth()
    const { currentLocale, t } = useLocale()
    return { router, user, currentLocale, t }
  },

  data() {
    return {
      movie: null,
      loading: true,
      error: null,
      isWatched: false,
      isTogglingWatched: false
      ,isInWatchlist: false,
      isTogglingFavorite: false,
      isFavorited: false
    }
  },

  computed: {
    movieId() {
      return this.$route.params.id
    }
  },

  methods: {
    async loadMovie() {
      this.loading = true
      this.error = null

      try {
        const language = this.currentLocale || 'hu'

        // Try direct movie endpoint first with language parameter (use apiClient to include Authorization)
        let response = await apiClient.get(`/api/movies/${this.movieId}`, { params: { language } })

        if (response.status === 200) {
          // Direct movie endpoint worked
          const data = response.data
          console.log('Movie API response:', data)

          if (data.success) {
            // ApiResponse.success spreads the movie data directly into the response
            // Extract movie data from the response (everything except success and message)
            const { success, message, ...movieData } = data
            this.movie = movieData
            console.log('Loaded movie data (direct):', this.movie)
            // Lényeges logolás a hibakereséshez
            console.log('Movie genres:', this.movie.genres, 'Type:', typeof this.movie.genres)
            await this.checkIfWatched()
            return
          }
        }

        // Fallback to search if direct endpoint doesn't work
        console.log('Direct movie endpoint failed, trying search fallback')
        response = await apiClient.get('/api/movies/search', { params: { query: `tmdb:${this.movieId}`, language } })

        if (response.status !== 200) {
          throw new Error('Film betöltése sikertelen')
        }

        const data = response.data
        if (data.success && data.movies && data.movies.length > 0) {
          // Find exact match or use first result
          this.movie = data.movies.find(m => m.tmdb_id == this.movieId) || data.movies[0]
          console.log('Loaded movie data (search):', this.movie)
          // Lényeges logolás a hibakereséshez
          console.log('Movie genres:', this.movie.genres, 'Type:', typeof this.movie.genres)
          await this.checkIfWatched()
        } else {
          throw new Error('Film nem található')
        }
      } catch (error) {
        console.error('Error loading movie:', error)
        this.error = error.message || 'Nem sikerült betölteni a filmet'
      } finally {
        this.loading = false
      }
    },

    async checkIfWatched() {
      if (!this.user || !this.movie) {
        console.log('Cannot check watched: missing user or movie')
        return
      }
      // If there is no token stored, skip the call and ask user to login
      if (!localStorage.getItem('authToken')) {
        console.log('No auth token set, skipping watchlist check')
        return
      }

      try {
        // Use apiClient so token is automatically included
        const response = await apiClient.get(`/api/watchlist/${this.user.id}`)

        console.log('Checking if watched for movie:', this.movie)

        if (response.status === 200) {
          const data = response.data
          console.log('Watchlist response:', data)

          // JAVÍTVA: A válasz struktúra data.watchlist, NEM data.data.watchlist
          if (data.success && data.watchlist) {
            const movieId = this.movie.tmdb_id || this.movie.id
            console.log('Looking for movieId:', movieId)

            const watchlistItem = data.watchlist.find(item => {
              const itemMovieId = item.movie?.tmdb_id || item.movie?.id
              return itemMovieId == movieId
            })
            this.isInWatchlist = !!watchlistItem
            this.isFavorited = !!watchlistItem
            // Always use database value if watchlistItem exists, otherwise keep default (false)
            if (watchlistItem) {
              // KRITIKUS: watched mező ellenőrzése
              console.log('RAW watchlistItem:', watchlistItem)
              console.log('RAW watched value:', watchlistItem.watched, 'type:', typeof watchlistItem.watched)
              this.isWatched = watchlistItem.watched === 1 || watchlistItem.watched === '1' || watchlistItem.watched === true
            }
            console.log('Is watched?', this.isWatched, 'Watchlist item:', watchlistItem, 'DB watched value:', watchlistItem?.watched)
          }
        }
      } catch (error) {
        console.error('Error checking watched status:', error)
        if (error?.response?.status === 401) {
          const message = this.currentLocale === 'hu' ? 'A lekéréshez be kell jelentkezni.' : 'You must be logged in to view this.'
          alert(message)
        }
      }
    },

    // MovieDetailView.vue - toggleWatched metódus javítva

async toggleWatched() {
  if (!this.user || !this.movie) {
    console.log('Cannot toggle watched: missing user or movie', { user: this.user, movie: this.movie })
    return
  }
  if (!localStorage.getItem('authToken')) {
    const message = this.currentLocale === 'hu' ? 'Jelentkezz be a módosításhoz.' : 'Please log in to change this.'
    alert(message)
    return
  }

  this.isTogglingWatched = true
  console.log('Toggling watched. Current state:', this.isWatched)

  try {
    const movieId = this.movie.tmdb_id || this.movie.id
    const newWatchedState = !this.isWatched

    console.log('Updating watched status:', { userId: this.user.id, movieId, watched: newWatchedState })

    // Use the correct endpoint for updating a single watchlist item's status
    const response = await apiClient.patch(`/api/interactions/${this.user.id}/item`, {
      movieId: movieId,
      watched: newWatchedState ? 1 : 0
    })
    
    const data = response.data
    console.log('Update response:', data)

    this.isWatched = newWatchedState
    console.log('Successfully updated watched status to:', newWatchedState)
  } catch (error) {
    console.error('Error toggling watched:', error)
    if (error?.response?.status === 401) {
      const message = this.currentLocale === 'hu' ? 'A módosításhoz be kell jelentkezni.' : 'You must be logged in to change this.'
      alert(message)
    } else {
      // Általános hibaüzenet
      const errorMessage = this.currentLocale === 'hu' 
        ? 'Nem sikerült frissíteni a filmet' 
        : 'Failed to update movie'
      alert(errorMessage)
    }
  } finally {
    this.isTogglingWatched = false
  }
},

    async deleteFromFavorites() {
      if (!this.user || !this.movie) return
      if (!this.isInWatchlist) {
        const message = this.currentLocale === 'hu' ? 'A film nincs a kedvencek között.' : 'This movie is not in your favorites.'
        alert(message)
        return
      }
      if (!localStorage.getItem('authToken')) {
        const message = this.currentLocale === 'hu' ? 'Jelentkezz be a módosításhoz.' : 'Please log in to continue.'
        alert(message)
        return
      }

      const confirmMessage = this.currentLocale === 'hu'
        ? 'Biztosan törölni szeretnéd ezt a filmet a kedvencekből?'
        : 'Are you sure you want to delete this movie from your favorites?'

      if (!confirm(confirmMessage)) {
        return
      }

      this.isTogglingFavorite = true

      try {
        const movieId = this.movie.tmdb_id || this.movie.id
        await apiClient.delete(`/api/interactions/${this.user.id}/${movieId}`)

        // If the request is successful (doesn't throw an error), proceed with UI changes.
        this.isFavorited = false
        // Navigate back to favorites list
        this.router.push('/favorites')
      } catch (error) {
        console.error('Error deleting from favorites:', error)
        const errorMessage = this.currentLocale === 'hu'
          ? 'Nem sikerült törölni a filmet'
          : 'Failed to delete movie'
        alert(errorMessage)
      } finally {
        this.isTogglingFavorite = false
      }
    },

    getPosterUrl(posterPath) {
      if (!posterPath) return '/placeholder-movie.jpg'
      return posterPath.startsWith('http')
        ? posterPath
        : `https://image.tmdb.org/t/p/w500${posterPath}`
    },

    handleImageError(event) {
      event.target.src = '/placeholder-movie.jpg'
    },

    getYear(dateString) {
      return dateString ? new Date(dateString).getFullYear() : ''
    },

    /**
     * @description Megpróbálja a műfajokat a lehető legtöbb formátumból (string, JSON string, objektum tömb, string tömb) kinyerni.
     * @param {any} genres - A film műfaj adata.
     * @returns {string[]} A műfajok string tömbje.
     */
    getGenres(genres) {
      if (!genres) return []
      
      // 1. Ha már tömb
      if (Array.isArray(genres)) {
        // Ha objektumokat tartalmaz (pl. [{id: 28, name: "Action"}])
        if (genres.length > 0 && typeof genres[0] === 'object' && genres[0].name) {
          return genres.map(g => g.name)
        }
        // Ha már stringek (pl. ["Action", "Adventure"])
        return genres.filter(g => g && typeof g === 'string')
      }
      
      // 2. Ha string (JSON vagy vesszővel elválasztott)
      if (typeof genres === 'string') {
        try {
          const parsed = JSON.parse(genres)
          
          if (Array.isArray(parsed)) {
            // JSON tömb: [{name: "Action"}] vagy ["Action"]
            if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0].name) {
              return parsed.map(g => g.name)
            }
            return parsed.filter(g => g && typeof g === 'string')
          }
          
          // Ha egy egyszerű objektumot parse-ol (bár ez ritka a műfajoknál)
          if (typeof parsed === 'object' && parsed !== null) {
            // Megpróbálja kiszedni az értékeket, ha az egy kulcs-érték lista (pl. {0: "Action"})
            const values = Object.values(parsed);
            if (values.length > 0 && typeof values[0] === 'string') {
                 return values.filter(g => g.length > 0);
            }
          }

          return []
        } catch {
          // Ha nem JSON (pl. egy vesszővel elválasztott string: "Action, Adventure")
          return genres.split(',').map(g => g.trim()).filter(g => g.length > 0)
        }
      }
      
      // 3. Ha objektum (de nem tömb és nem string)
      if (typeof genres === 'object' && genres !== null) {
        const values = Object.values(genres)
        // Ha objektumokat tartalmaz (pl. {0: {name: "Action"}})
        if (values.length > 0 && typeof values[0] === 'object' && values[0].name) {
          return values.map(g => g.name)
        }
        // Ha stringeket tartalmaz (pl. {0: "Action"})
        return values.filter(g => g && typeof g === 'string')
      }

      // Egyéb esetben üres tömb
      return []
    }
  },

  mounted() {
    this.loadMovie()
  },

  watch: {
    // Figyeli az útvonal paramétert változását, ha ugyanazon a komponenst használják
    '$route.params.id'() {
      this.loadMovie()
    },
    // Figyeli a nyelv változását, és újra betölti a filmet az új nyelvi adatokkal
    currentLocale() {
      this.loadMovie()
    }
  }
}
</script>

<style scoped>
/* Use global CSS variables from design-system.css - they are inherited from :root and .theme-dark */

.movie-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  padding-bottom: 6rem;
}

.movie-header {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.movie-poster {
  position: relative;
}

.poster-image {
  width: 100%;
  height: 450px;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.movie-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.movie-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.movie-subtitle {
  font-size: 1.2rem;
  color: var(--text-secondary);
  font-style: italic;
  margin: 0;
}

.movie-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.year {
  background: var(--bg-primary);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  color: var(--text-primary);
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #fff3cd;
  color: #856404;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
}

/* Dark theme rating */
.theme-dark .rating {
  background: rgba(245, 197, 24, 0.2);
  color: var(--secondary);
  border: 1px solid rgba(245, 197, 24, 0.3);
}

.runtime {
  color: var(--text-secondary);
  font-weight: 500;
}

.genres {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.genre-tag {
  background: var(--primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.genre-tag:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.watched-btn,
.delete-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.watched-btn {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 2px solid var(--border-primary);
}

.watched-btn:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.watched-btn.watched {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.delete-btn {
  background: var(--bg-primary);
  color: #dc3545;
  border: 2px solid #dc3545;
}

.delete-btn:hover {
  background: #dc3545;
  color: white;
}

.watched-btn:disabled,
.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.movie-description {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.movie-description h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.movie-description p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  font-size: 1.1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .movie-content {
    padding: 0.5rem;
    padding-bottom: 8rem;
  }

  .movie-header {
    grid-template-columns: 1fr;
    gap: 0.6rem;
    padding: 0.6rem;
  }

  .movie-poster {
    max-width: 200px;
    margin: 0 auto;
  }

  .poster-image {
    height: auto;
    max-height: 280px;
  }

  .movie-title {
    font-size: 1.2rem;
  }

  .movie-subtitle {
    font-size: 0.9rem;
  }

  .movie-meta {
    font-size: 0.8rem;
  }

  .year, .rating, .runtime {
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
  }

  .genre-tag {
    font-size: 0.75rem;
    padding: 0.4rem 0.8rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }

  .watched-btn,
  .delete-btn {
    padding: 0.8rem 1rem;
    font-size: 0.85rem;
    width: 100%;
    justify-content: center;
  }

  .movie-description {
    padding: 1rem;
  }

  .movie-description h2 {
    font-size: 1.1rem;
  }

  .movie-description p {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .movie-content {
    padding: 0.4rem;
  }

  .movie-header {
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .movie-poster {
    max-width: 160px;
  }

  .poster-image {
    max-height: 240px;
  }

  .movie-title {
    font-size: 1rem;
  }

  .movie-subtitle {
    font-size: 0.8rem;
  }

  .movie-meta {
    font-size: 0.75rem;
  }

  .year, .rating, .runtime {
    padding: 0.3rem 0.6rem;
    font-size: 0.7rem;
  }

  .genre-tag {
    font-size: 0.7rem;
    padding: 0.3rem 0.7rem;
  }

  .watched-btn,
  .delete-btn {
    padding: 0.7rem 0.9rem;
    font-size: 0.8rem;
  }

  .movie-description {
    padding: 0.8rem;
  }

  .movie-description h2 {
    font-size: 1rem;
  }

  .movie-description p {
    font-size: 0.8rem;
  }
}

/* Dark theme is handled globally by .theme-dark class on <html> element */
/* All CSS variables are defined in design-system.css and automatically switch */
</style>