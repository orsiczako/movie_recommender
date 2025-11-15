<template>
  <div class="movie-card">
    <div class="movie-poster">
      <img 
        :src="movie.poster_url || 'https://via.placeholder.com/300x450'" 
        :alt="movie.title"
        @error="handleImageError"
      />
      <button 
        class="favorite-btn"
        :class="{ 'favorited': isFavorited }"
        @click="toggleFavorite"
        :disabled="isTogglingFavorite"
        :title="isFavorited ? 'Eltávolítás a kedvencekből' : 'Hozzáadás a kedvencekhez'"
      >
        <svg v-if="isTogglingFavorite" width="20" height="20" viewBox="0 0 24 24" class="loading">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"/>
        </svg>
      </button>
    </div>
    <div class="movie-info">
      <h3 class="movie-title">{{ movie.title || 'Unknown Movie' }}</h3>
      <p class="movie-year" v-if="movie.year || movie.release_year">{{ movie.year || movie.release_year }}</p>
      <p class="movie-overview" v-if="movie.overview">
        {{ truncatedOverview }}
      </p>
    </div>
  </div>
</template>

<script>
import { useAuth } from '@/composables/useAuth'

export default {
  name: 'MovieRecommendationCard',
  props: {
    movie: {
      type: Object,
      required: true
    }
  },
  
  setup() {
    const { user } = useAuth()
    return { user }
  },
  
  data() {
    return {
      isFavorited: false,
      isTogglingFavorite: false
    }
  },
  
  computed: {
    truncatedOverview() {
      if (!this.movie.overview) return 'Nincs leírás elérhető.'
      return this.movie.overview.length > 100 
        ? this.movie.overview.substring(0, 100) + '...'
        : this.movie.overview
    }
  },
  
  methods: {
    formatRating(rating) {
      return (rating / 10 * 5).toFixed(1)
    },
    
    handleImageError(event) {
      event.target.src = '/placeholder-movie.jpg'
    },
    
    async toggleFavorite() {
      if (!this.user) {
        console.error('User not authenticated')
        return
      }
      
      this.isTogglingFavorite = true
      
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
        
        if (this.isFavorited) {
          // Remove from favorites - DELETE /api/interactions/:userId/:movieId
          const movieId = this.movie.tmdb_id || this.movie.id
          const response = await fetch(`${API_BASE_URL}/api/interactions/${this.user.id}/${movieId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            this.isFavorited = false
            this.$emit('favoriteToggled', {
              movie: this.movie,
              isFavorited: false
            })
          } else {
            console.error('Error removing favorite:', response.status)
          }
        } else {
          // Add to favorites - POST /api/interactions (LIKE)
          const response = await fetch(`${API_BASE_URL}/api/interactions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: this.user.id,
              movieId: this.movie.tmdb_id || this.movie.id,
              interactionType: 'LIKE'
            })
          })
          
          if (response.ok) {
            this.isFavorited = true
            this.$emit('favoriteToggled', {
              movie: this.movie,
              isFavorited: true
            })
          } else {
            console.error('Error adding favorite:', response.status)
          }
        }
      } catch (error) {
        console.error('Error toggling favorite:', error)
      } finally {
        this.isTogglingFavorite = false
      }
    },
    
    async checkIfFavorited() {
      if (!this.user || !this.movie) return
      
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
        // GET /api/interactions/:userId - Get all user interactions
        const response = await fetch(`${API_BASE_URL}/api/interactions/${this.user.id}`)
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.interactions) {
            const movieId = this.movie.tmdb_id || this.movie.id
            // Check if there's a LIKE interaction for this movie
            this.isFavorited = data.interactions.some(interaction => 
              interaction.interaction_type === 'LIKE' && 
              interaction.movie && 
              (interaction.movie.tmdb_id == movieId || interaction.movie.id == movieId)
            )
          }
        }
      } catch (error) {
        console.error('Error checking favorite status:', error)
      }
    }
  },
  
  mounted() {
    this.checkIfFavorited()
  }
}
</script>

<style scoped>
.movie-card {
  position: relative;
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  min-width: 180px;
  max-width: 220px;
  width: 100%;
  margin: 0 auto;
  border: 1px solid var(--border-primary);
}

.movie-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3);
  border-color: var(--primary);
}

.movie-poster {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 130%;
  overflow: hidden;
  background: var(--bg-tertiary);
}

.movie-poster img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.movie-card:hover .movie-poster img {
  transform: scale(1.05);
}

.favorite-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.favorite-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.favorite-btn.favorited {
  background: rgba(220, 53, 69, 0.9);
  color: white;
}

.favorite-btn.favorited:hover {
  background: rgba(220, 53, 69, 1);
}

.favorite-btn:disabled {
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

.movie-info {
  padding: 12px;
  background: var(--bg-secondary);
  min-height: 100px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.movie-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 6px 0;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.movie-year {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0 0 6px 0;
  font-weight: 500;
}

.movie-overview {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0;
  text-align: justify;
  word-wrap: break-word;
  hyphens: auto;
}

/* Responsive design */
@media (max-width: 768px) {
  .movie-info {
    padding: 16px;
  }
  
  .movie-title {
    font-size: 1.1rem;
  }
  
  .favorite-btn {
    width: 40px;
    height: 40px;
    top: 12px;
    right: 12px;
  }
}
</style>