<template>
  <DashboardLayout 
    :title="$t('favoriteMovies.title')" 
    :show-back-button="true"
    class="favorites-page"
  >
    <div class="refresh-section">
      <BaseButton 
        @click="loadFavoriteMovies" 
        :loading="loading"
        variant="secondary"
        size="medium"
        icon="refresh"
      >
        {{ loading ? $t('favoriteMovies.loading') : $t('favoriteMovies.refresh') }}
      </BaseButton>
    </div>

    <!-- Movies content -->
    <div class="movies-content">
      <!-- Loading state -->
      <BaseSpinner 
        v-if="loading" 
        size="large"
        :text="$t('favoriteMovies.loading')"
        centered
      />

      <!-- Error state -->
      <BaseErrorState
        v-else-if="error"
        type="error"
        :title="$t('favoriteMovies.errorTitle')"
        :message="error"
        show-retry
        @retry="loadFavoriteMovies"
      />

      <!-- Empty state -->
      <BaseEmptyState
        v-else-if="favoriteMovies.length === 0"
        :title="$t('favoriteMovies.emptyTitle')"
        :description="$t('favoriteMovies.emptyMessage')"
                icon="movie"
        show-action
        :action-text="$t('favoriteMovies.startBrowsing')"
        action-variant="primary"
        action-size="large"
        @action="$router.push('/movies')"
      />

      <!-- Movies grid -->
      <div v-else class="movies-grid">
        <div 
          v-for="movie in favoriteMovies" 
          :key="movie.id"
          class="movie-card"
        >
          <div class="movie-poster">
            <img 
              :src="movie.poster_url || 'https://via.placeholder.com/300x450'" 
              :alt="movie.title"
              @error="handleImageError"
            />
          </div>
          <div class="movie-info">
            <h3 class="movie-title">{{ movie.title || 'Unknown Movie' }}</h3>
            <p class="movie-year" v-if="movie.release_year">{{ movie.release_year }}</p>
            <div class="movie-genres" v-if="getMovieGenres(movie).length > 0">
              <span 
                v-for="genre in getMovieGenres(movie).slice(0, 3)" 
                :key="genre"
                class="genre-tag"
              >
                {{ getLocalizedGenre(genre) }}
              </span>
            </div>
            <div class="movie-rating" v-if="movie.rating && movie.rating > 0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
              <span>{{ Number(movie.rating).toFixed(1) }}/10</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script>
import { ref, onMounted, onActivated, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useLocale } from '@/composables/useLocale'
import { useNotification } from '@/composables/useNotification'
import { interactionsService } from '@/services/api'
import { translateMoviesArray, processAndTranslateGenres } from '@/services/movieTranslation'

// UI Components
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import BaseErrorState from '@/components/ui/BaseErrorState.vue'
import BaseEmptyState from '@/components/ui/BaseEmptyState.vue'

export default {
  name: 'FavoriteMoviesView',
  components: {
    DashboardLayout,
    BaseButton,
    BaseSpinner,
    BaseErrorState,
    BaseEmptyState
  },
  setup() {
    const { t } = useI18n()
    const route = useRoute()
    const router = useRouter()
    const { currentLocale } = useLocale()
    const { notify } = useNotification()
    const favoriteMovies = ref([])
    const loading = ref(true)
    const error = ref(null)

    const getMovieGenres = (movie) => {
      const processedGenres = processAndTranslateGenres(movie.genres, currentLocale.value)
      return processedGenres
    }

    const getLocalizedGenre = (genre) => {
      // Handle different genre formats
      if (typeof genre === 'object' && genre.name) {
        return genre.name
      } else if (typeof genre === 'string') {
        return genre
      } else if (typeof genre === 'number') {
        // If it's just a number, try to get the Hungarian name
        return processAndTranslateGenres([genre], currentLocale.value)[0]?.name || `Genre ${genre}`
      }
      // Fallback
      return genre?.toString() || 'Unknown Genre'
    }

    const handleImageError = (event) => {
      event.target.src = 'https://via.placeholder.com/300x450?text=No+Image'
    }

    const loadFavoriteMovies = async () => {
      try {
        loading.value = true
        error.value = null
        
        // HARDCODED TEST USER ID (ugyanaz mint MovieBrowsingView-ban)
        const userId = 3;


        // Get favorite movies from API (higher limit to get all favorites)
        // SZUPER AGRESSZÍV CACHE-BUSTING
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        
        const response = await interactionsService.getFavoriteMovies(userId, 1, 100, {
          _t: timestamp,
          _r: randomId,
          _cb: `cache_bust_${timestamp}`,
          _force: 'true'
        });
        
        console.log('API response:', response)
        
        if (response.success && response.data?.data?.interactions) {
          // Process the interactions to extract movie data
          console.log('Processing interactions:', response.data.data.interactions)
          const movieData = response.data.data.interactions.map(interaction => {
            // Process genres properly
            let genres = []
            if (interaction.movie.genres) {
              if (Array.isArray(interaction.movie.genres)) {
                genres = interaction.movie.genres
              } else if (typeof interaction.movie.genres === 'string') {
                try {
                  genres = JSON.parse(interaction.movie.genres)

                } catch (e) {
                  console.warn('Cannot parse genres for movie:', interaction.movie.title, interaction.movie.genres)
                  genres = []
                }
              }
            }
            
            return {
              id: interaction.movie.tmdb_id,
              title: interaction.movie.title,
              poster_url: interaction.movie.poster_url,
              release_year: interaction.movie.release_date ? new Date(interaction.movie.release_date).getFullYear() : null,
              rating: interaction.movie.tmdb_rating,
              genres: genres,
              interactionDate: interaction.created_at
            }
          })
          
          console.log('Processed movie data before translation:', movieData)
          // Apply translation to the loaded movies using shared service
          const translatedMovies = translateMoviesArray(movieData, currentLocale.value)
          console.log('Translated movie data:', translatedMovies)
          favoriteMovies.value = translatedMovies
          
          // Global cache update
          if (!window.favoriteMoviesCache) {
            window.favoriteMoviesCache = {
              data: movieData,
              timestamp: Date.now(),
              invalidate: () => {
                window.favoriteMoviesCache = null;
              }
            };
          } else {
            window.favoriteMoviesCache.data = movieData;
            window.favoriteMoviesCache.timestamp = Date.now();
          }
          
        } else {
          // If no interactions found, show empty state

          favoriteMovies.value = []
        }
        
        loading.value = false
      } catch (err) {
        console.error('Error loading favorite movies:', err)
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          response: err.response
        })
        error.value = t('favoriteMovies.loadError')
        loading.value = false
      }
    }

    // Optimistic UI update - azonnali film hozzáadás
    const addOptimisticMovie = (movieData) => {
      // Ellenőrizzük hogy már nincs-e benne (duplikáció elkerülése)
      const exists = favoriteMovies.value.some(movie => movie.id === movieData.id);
      
      if (!exists) {
        favoriteMovies.value = [movieData, ...favoriteMovies.value];
      }
    };

    onMounted(() => {
      loadFavoriteMovies()
      
      // EGYSÉGES EVENT HANDLER - elkerüljük a duplikált listener konfliktusokat
      const handleAllFavoritesEvents = (event) => {
        const { action, movie } = event.detail || {};
        
        if (action === 'LIKE_OPTIMISTIC' && movie) {
          // 1. AZONNAL optimistic update (nincs API hívás!)
          addOptimisticMovie(movie);
          
          // 2. NEM töltjük újra a listát azonnal - hagyjuk az optimistic update-et!
          // Csak 1 másodperc múlva validáljuk háttérben (de nem írjuk felül a UI-t)
          setTimeout(() => {
            loadFavoriteMovies();  // Cache-refresh, UI már helyes
          }, 1000);
          
        } else if (action === 'LIKE_CONFIRMED') {
          // Backend megerősítés - csak background cache refresh
          // UI már helyesen mutatja, csak cache-t frissítjük
          setTimeout(() => loadFavoriteMovies(), 300);
          
        } else if (action === 'LIKE_ROLLBACK' && movie) {
          // Rollback - távolítsuk el a hibás optimistic update-et

          favoriteMovies.value = favoriteMovies.value.filter(m => m.id !== movie.id);
          
        } else {
          // Egyéb események - standard refresh

          setTimeout(() => loadFavoriteMovies(), 150);
        }
      };
      
      // EGYSZERI event listener regisztráció + GLOBÁLIS relay
      window.addEventListener('favorites-updated', handleAllFavoritesEvents);
      window.addEventListener('global-favorites-refresh', handleAllFavoritesEvents); // App.vue relay
      window.addEventListener('movie-liked', handleAllFavoritesEvents); // Fallback csak
      document.addEventListener('favorites-refresh', handleAllFavoritesEvents); // Fallback csak
      
  console.log('FavoriteMoviesView event listeners registered!')
      
      // Cleanup on unmount
      onUnmounted(() => {
        window.removeEventListener('favorites-updated', handleAllFavoritesEvents);
        window.removeEventListener('global-favorites-refresh', handleAllFavoritesEvents);
        window.removeEventListener('movie-liked', handleAllFavoritesEvents);
        document.removeEventListener('favorites-refresh', handleAllFavoritesEvents);
  console.log('FavoriteMoviesView event listeners cleaned up!')
      });
      
      // Auto-refresh minden 30 másodpercben (fallback)
      const autoRefreshInterval = setInterval(() => {
        if (!loading.value) {

          loadFavoriteMovies();
        }
      }, 30000);
      
      onUnmounted(() => {
        clearInterval(autoRefreshInterval);
      });
      
      // Visibility change refresh (amikor visszatér a user)
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && !loading.value) {

          setTimeout(() => loadFavoriteMovies(), 200);
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      onUnmounted(() => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      });
    });

    // Automatikus frissítés amikor visszatérsz erre az oldalra
    onActivated(() => {
  console.log('FavoriteMoviesView activated - refreshing favorites')
      loadFavoriteMovies()
    })

    // Frissítés amikor navigálsz erre az oldalra
    watch(() => route.path, (newPath) => {
      if (newPath === '/favorites') {
  console.log('Navigated to favorites - refreshing data')
        loadFavoriteMovies()
      }
    })

    // Re-translate movies when locale changes
    watch(currentLocale, (newLocale) => {
      console.log('Locale changed to:', newLocale)
      if (favoriteMovies.value && favoriteMovies.value.length > 0) {
        console.log('Re-translating movies for new locale')
        // Get the original untranslated data and retranslate
        const originalData = window.favoriteMoviesCache?.data || favoriteMovies.value
        favoriteMovies.value = translateMoviesArray(originalData, newLocale)
        console.log('Movies after retranslation:', favoriteMovies.value)
      }
    })

    return {
      favoriteMovies,
      loading,
      error,
      getLocalizedGenre,
      getMovieGenres,
      handleImageError,
      loadFavoriteMovies,
      router
    }
  }
}
</script>

<style scoped>
/* Favorites view specific styles - consistent with design system */
.refresh-section {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.movies-content {
  min-height: 60vh;
}

/* Movies grid */
.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.movie-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 2px solid rgba(222, 226, 230, 0.3);
  border-radius: 16px;
  padding: 12px;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md);
}

.theme-dark .movie-card {
  background: rgba(33, 37, 41, 0.8);
  border-color: rgba(108, 117, 125, 0.3);
}

.movie-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(229, 9, 20, 0.5);
  box-shadow: var(--shadow-lg);
}

.theme-dark .movie-card:hover {
  background: rgba(33, 37, 41, 0.9);
  border-color: rgba(229, 9, 20, 0.7);
}

.movie-poster {
  width: 100%;
  height: 160px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.movie-poster img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.movie-card:hover .movie-poster img {
  transform: scale(1.05);
}

.movie-info {
  text-align: center;
}

.movie-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.4;
}

.movie-year {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 12px;
  font-weight: 500;
}

.movie-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  margin-bottom: 12px;
}

.genre-tag {
  background: var(--bg-accent);
  color: var(--text-primary);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid var(--border-accent);
}

.movie-rating {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--accent-primary);
  font-weight: 600;
  font-size: 0.9rem;
}

.movie-rating svg {
  width: 16px;
  height: 16px;
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive design */
@media (max-width: 768px) {
  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }
  
  .movie-card {
    padding: 10px;
  }
  
  .movie-poster {
    height: 140px;
  }
  
  .refresh-section {
    margin-bottom: 20px;
  }
}

@media (max-width: 480px) {
  .movies-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .movie-card {
    padding: 8px;
  }
  
  .movie-poster {
    height: 120px;
  }
}
</style>
