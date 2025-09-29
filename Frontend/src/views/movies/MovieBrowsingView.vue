<template>
  <div class="movie-browsing-view">
    <!-- Animated background -->
    <AnimatedBackground />

    <!-- Use existing PageHeader component -->
    <PageHeader
      :title="$t('title')"
      :subtitle="$t('subtitle')"
    />
    
    <!-- Main content area -->
    <div class="content-area">
      <!-- Loading state -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>{{ $t('loading') }}</p>
      </div>
      
      <!-- Movie cards stack -->
      <div v-else class="cards-container">
        <div 
          v-for="(movie, index) in visibleMovies" 
          :key="movie.id"
          ref="movieCards"
          :class="['movie-card', { 
            'top-card': index === visibleMovies.length - 1,
            'swiping': index === visibleMovies.length - 1 && isDragging 
          }]"
          :style="getCardStyle(index)"
          @mousedown="startDrag($event, index)"
          @touchstart="startDrag($event, index)"
        >
          <!-- Movie image -->
          <div class="movie-image">
            <img 
              :src="getMoviePosterUrl(movie.poster_path)" 
              :alt="movie.title"
              @error="handleImageError"
              @load="handleImageLoad"
            />
            
            <!-- Overlay indicators -->
            <div class="swipe-indicator like-indicator" :class="{ 'visible': showLikeIndicator }">
              <div class="indicator-content">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M20.84 4.61A5.5 5.5 0 0 0 16 2A5.5 5.5 0 0 0 12 4A5.5 5.5 0 0 0 8 2A5.5 5.5 0 0 0 3.16 4.61C1.99 5.78 1.99 7.64 3.16 8.81L12 17.65L20.84 8.81C22.01 7.64 22.01 5.78 20.84 4.61Z" fill="currentColor"/>
                </svg>
                <span>{{ $t('indicators.like') }}</span>
              </div>
            </div>
            
            <div class="swipe-indicator nope-indicator" :class="{ 'visible': showNopeIndicator }">
              <div class="indicator-content">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ $t('indicators.dislike') }}</span>
              </div>
            </div>
          </div>
          
          <!-- Movie info -->
          <div class="movie-info">
            <!-- Basic info (always visible - like Tinder name/age) -->
            <div class="movie-basic-info">
              <h2 class="movie-title">{{ movie.title }}</h2>
              <span class="movie-age">{{ getMovieYear(movie.release_date) }}</span>
            </div>
            
            <!-- Bio section (like Tinder bio) -->
            <div class="movie-bio">
              <p class="movie-overview">{{ movie.overview || $t('details.no_description') }}</p>
            </div>
            
            <!-- Scrollable details section -->
            <div class="movie-details-scroll">
              <div class="movie-details-content">
                <!-- Rating -->
                <div class="detail-section">
                  <div class="rating">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                    </svg>
                    <span>{{ (movie.vote_average || 0).toFixed(1) }} / 10</span>
                  </div>
                </div>
                
                <!-- Genres -->
                <div class="detail-section" v-if="getMovieGenres(movie).length > 0">
                  <h4 class="detail-title">{{ $t('details.genres') }}</h4>
                  <div class="genres">
                    <span 
                      v-for="genre in getMovieGenres(movie)" 
                      :key="genre.id"
                      class="genre-tag"
                    >
                      {{ genre.name }}
                    </span>
                  </div>
                </div>
                
                <!-- Additional info that can be added later -->
                <div class="detail-section">
                  <h4 class="detail-title">{{ $t('details.basic_info') }}</h4>
                  <div class="additional-info">
                    <div class="info-item">
                      <span class="info-label">{{ $t('details.release_date') }}:</span>
                      <span class="info-value">{{ formatReleaseDate(movie.release_date) }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">{{ $t('details.original_title') }}:</span>
                      <span class="info-value">{{ movie.original_title || movie.title }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">{{ $t('details.language') }}:</span>
                      <span class="info-value">{{ getLanguageName(movie.original_language) }}</span>
                    </div>
                    <div class="info-item" v-if="movie.adult !== undefined">
                      <span class="info-label">{{ $t('details.age_rating') }}:</span>
                      <span class="info-value">{{ movie.adult ? $t('age_rating.adults_only') : $t('age_rating.all_ages') }}</span>
                    </div>
                    <div class="info-item" v-if="getEstimatedRuntime(movie)">
                      <span class="info-label">{{ $t('details.runtime') }}:</span>
                      <span class="info-value">{{ getEstimatedRuntime(movie) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Statistics Section -->
                <div class="detail-section">
                  <h4 class="detail-title">{{ $t('details.statistics') }}</h4>
                  <div class="stats-grid">
                    <div class="stat-item">
                      <div class="stat-value">{{ (movie.vote_average || 0).toFixed(1) }}</div>
                      <div class="stat-label">{{ $t('stats.imdb_rating') }}</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-value">{{ formatNumber(movie.vote_count || 0) }}</div>
                      <div class="stat-label">{{ $t('stats.votes') }}</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-value">{{ Math.round(movie.popularity || 0) }}</div>
                      <div class="stat-label">{{ $t('stats.popularity') }}</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-value">{{ getRatingCategory(movie.vote_average) }}</div>
                      <div class="stat-label">{{ $t('stats.category') }}</div>
                    </div>
                  </div>
                </div>

                <!-- Movie Quality Indicators -->
                <div class="detail-section">
                  <h4 class="detail-title">{{ $t('details.quality_indicators') }}</h4>
                  <div class="quality-indicators">
                    <div class="quality-item" :class="getPopularityClass(movie.popularity)">
                      <span class="quality-icon">*</span>
                      <span class="quality-text">{{ getPopularityText(movie.popularity) }}</span>
                    </div>
                    <div class="quality-item" :class="getRatingClass(movie.vote_average)">
                      <span class="quality-icon">⭐</span>
                      <span class="quality-text">{{ getRatingText(movie.vote_average) }}</span>
                    </div>
                    <div class="quality-item" :class="getVoteCountClass(movie.vote_count)">
                      <span class="quality-icon">*</span>
                      <span class="quality-text">{{ getVoteCountText(movie.vote_count) }}</span>
                    </div>
                    <div class="quality-item" :class="getRecencyClass(movie.release_date)">
                      <span class="quality-icon">◆</span>
                      <span class="quality-text">{{ getRecencyText(movie.release_date) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Fun Facts Section -->
                <div class="detail-section">
                  <h4 class="detail-title">{{ $t('details.fun_facts') }}</h4>
                  <div class="fun-facts">
                    <div class="fun-fact" v-if="getDecade(movie.release_date)">
                      <span class="fact-icon">●</span>
                      <span class="fact-text">{{ t('fun_facts.decade_movie', { decade: getDecade(movie.release_date) }) }}</span>
                    </div>
                    <div class="fun-fact" v-if="isHighlyRated(movie)">
                      <span class="fact-icon">*</span>
                      <span class="fact-text">{{ t('fun_facts.highly_rated') }}</span>
                    </div>
                    <div class="fun-fact" v-if="isPopular(movie)">
                      <span class="fact-icon">▲</span>
                      <span class="fact-text">{{ t('fun_facts.currently_trending') }}</span>
                    </div>
                    <div class="fun-fact" v-if="isClassic(movie)">
                      <span class="fact-icon">■</span>
                      <span class="fact-text">{{ t('fun_facts.classic_film') }}</span>
                    </div>
                    <div class="fun-fact" v-if="getGenreSpecialty(movie)">
                      <span class="fact-icon">◇</span>
                      <span class="fact-text">{{ getGenreSpecialty(movie) }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Extended plot section -->
                <div class="detail-section" v-if="movie.overview && movie.overview.length > 100">
                  <h4 class="detail-title">{{ $t('details.detailed_description') }}</h4>
                  <div class="extended-plot">
                    <p>{{ movie.overview }}</p>
                  </div>
                </div>
                
                <!-- Scroll indicator -->
                <div class="scroll-indicator">
                  <div class="scroll-dot"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- No more movies -->
        <div v-if="visibleMovies.length === 0 && !loading" class="no-movies">
          <div class="no-movies-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <h3>{{ $t('no_movies.title') }}</h3>
          <p>{{ $t('no_movies.description') }}</p>
          <button @click="reloadMovies" class="reload-btn">
            {{ $t('no_movies.reload') }}
          </button>
        </div>
      </div>
      
      <!-- Action buttons -->
      <div v-if="!loading && visibleMovies.length > 0" class="action-buttons">
        <button @click="rejectMovie" class="action-btn reject-btn" :disabled="isDragging">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <button @click="likeMovie" class="action-btn like-btn" :disabled="isDragging">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20.84 4.61A5.5 5.5 0 0 0 16 2A5.5 5.5 0 0 0 12 4A5.5 5.5 0 0 0 8 2A5.5 5.5 0 0 0 3.16 4.61C1.99 5.78 1.99 7.64 3.16 8.81L12 17.65L20.84 8.81C22.01 7.64 22.01 5.78 20.84 4.61Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth.js';
import { useI18n } from 'vue-i18n';
import { useLocale } from '@/composables/useLocale';
import PageHeader from '../../components/ui/PageHeader.vue';
import AnimatedBackground from '../../components/ui/AnimatedBackground.vue';
import { movieService, processMovieData, formatReleaseDate, getMovieYear } from '../../services/movie.js';
import { interactionsService } from '@/services/api';

export default {
  name: 'MovieBrowsingView',
  components: {
    PageHeader,
    AnimatedBackground
  },
  setup() {
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useI18n();
    const { currentLocale } = useLocale();
    
    // Reactive state
    const loading = ref(true);
    const movieStack = ref([]);
    const currentIndex = ref(0);
    const currentPage = ref(1);
    const isLoadingMore = ref(false);
    
    // Drag/swipe state
    const isDragging = ref(false);
    const dragStart = reactive({ x: 0, y: 0 });
    const dragCurrent = reactive({ x: 0, y: 0 });
    const swipeThreshold = 100;
    const rotationMultiplier = 0.1;
    
    // Visual indicators
    const showLikeIndicator = ref(false);
    const showNopeIndicator = ref(false);
    const showSuperLikeIndicator = ref(false);
    
    // Stats
    const stats = reactive({
      likes: 0,
      dislikes: 0,
      superLikes: 0
    });
    
    // Computed
    const visibleMovies = computed(() => {
      return movieStack.value.slice(currentIndex.value, currentIndex.value + 3);
    });
    
    const currentMovie = computed(() => {
      return movieStack.value[currentIndex.value];
    });
    
    // API functions
    const fetchMovies = async () => {
      try {
        loading.value = true;
        
        // Use movie service to discover movies based on user preferences
        const userId = user.value?.id || 1; // Fallback to user 1 if not authenticated
        const language = currentLocale.value === 'hu' ? 'hu' : 'en';
        const result = await movieService.discoverMovies(userId, currentPage.value, language);
        
        if (result.success && result.movies) {
          movieStack.value = result.movies;

          console.log('Elso 3 film:', result.movies.slice(0, 3).map(m => ({ title: m.title, id: m.id, tmdb_id: m.tmdb_id })));
        } else {
          throw new Error('Failed to load movies from service');
        }
        
      } catch (error) {
        console.error('Failed to fetch movies:', error);
        // Ha nem sikerül filmeket betölteni, üres lista
        movieStack.value = [];
      } finally {
        loading.value = false;
      }
    };
    
    // Methods
    const loadMovies = async () => {
      await fetchMovies();
      currentIndex.value = 0;
    };
    
    const reloadMovies = () => {
      loadMovies();
    };
    
    // Drag/Swipe functionality
    const startDrag = (event, index) => {
      if (index !== visibleMovies.value.length - 1) return; // Only top card
      
      isDragging.value = true;
      
      const clientX = event.type === 'mousedown' ? event.clientX : event.touches[0].clientX;
      const clientY = event.type === 'mousedown' ? event.clientY : event.touches[0].clientY;
      
      dragStart.x = clientX;
      dragStart.y = clientY;
      dragCurrent.x = 0;
      dragCurrent.y = 0;
      
      // Add event listeners
      if (event.type === 'mousedown') {
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', endDrag);
      } else {
        document.addEventListener('touchmove', handleDrag, { passive: false });
        document.addEventListener('touchend', endDrag);
      }
      
      event.preventDefault();
    };
    
    const handleDrag = (event) => {
      if (!isDragging.value) return;
      
      const clientX = event.type === 'mousemove' ? event.clientX : event.touches[0].clientX;
      const clientY = event.type === 'mousemove' ? event.clientY : event.touches[0].clientY;
      
      dragCurrent.x = clientX - dragStart.x;
      dragCurrent.y = clientY - dragStart.y;
      
      // Show indicators based on drag direction
      const absX = Math.abs(dragCurrent.x);
      const absY = Math.abs(dragCurrent.y);
      
      if (absX > 50) {
        showLikeIndicator.value = dragCurrent.x > 0;
        showNopeIndicator.value = dragCurrent.x < 0;
        showSuperLikeIndicator.value = false;
      } else if (absY > 50 && dragCurrent.y < 0) {
        showSuperLikeIndicator.value = true;
        showLikeIndicator.value = false;
        showNopeIndicator.value = false;
      } else {
        showLikeIndicator.value = false;
        showNopeIndicator.value = false;
        showSuperLikeIndicator.value = false;
      }
      
      event.preventDefault();
    };
    
    const endDrag = () => {
      if (!isDragging.value) return;
      
      // Remove event listeners
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', endDrag);
      document.removeEventListener('touchmove', handleDrag);
      document.removeEventListener('touchend', endDrag);
      
      const absX = Math.abs(dragCurrent.x);
      const absY = Math.abs(dragCurrent.y);
      
      // Determine action based on drag distance
      if (absX > swipeThreshold) {
        if (dragCurrent.x > 0) {
          // Swipe right - like
          performLike();
        } else {
          // Swipe left - reject
          performReject();
        }
      } else if (absY > swipeThreshold && dragCurrent.y < 0) {
        // Swipe up - super like
        performSuperLike();
      } else {
        // Reset position
        resetCardPosition();
      }
      
      isDragging.value = false;
      showLikeIndicator.value = false;
      showNopeIndicator.value = false;
      showSuperLikeIndicator.value = false;
    };
    
    const resetCardPosition = () => {
      dragCurrent.x = 0;
      dragCurrent.y = 0;
    };
    
    const performLike = async () => {
      // JAVÍTÁS: A FELSŐ kártyát like-oljuk (top-card), nem az alsót!
      const topCardIndex = visibleMovies.value.length - 1; // A felső kártya indexe
      const visibleMovie = visibleMovies.value[topCardIndex]; // A tényleg LÁTHATÓ felső film
      
      if (!visibleMovie) return;
      
      const movie = visibleMovie; // A FELSŐ film használata





      console.log('  - topCardIndex (using this):', topCardIndex);
      console.log('  - visibleMovies[0] (bottom):', visibleMovies.value[0]?.title, '(ID:', visibleMovies.value[0]?.tmdb_id, ')');
      console.log('  - visibleMovies[1] (middle):', visibleMovies.value[1]?.title, '(ID:', visibleMovies.value[1]?.tmdb_id, ')');
      console.log('  - visibleMovies[' + topCardIndex + '] (TOP - USING THIS):', movie.title, '(ID:', movie.tmdb_id || movie.id, ')');

      // *** KRITIKUS: AZONNALI OPTIMISTIC UPDATE ***
      // Rögtön broadcast-eljük hogy a favorites frissüljön, még a backend válasz előtt!
      const optimisticMovieData = {
        id: movie.tmdb_id || movie.id,
        title: movie.title,
        poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        release_year: movie.year || (movie.release_date ? new Date(movie.release_date).getFullYear() : null),
        rating: movie.tmdb_rating || movie.vote_average,
        genres: movie.genres || [],
        interactionDate: new Date().toISOString()
      };

      // Broadcast AZONNAL - optimistic update
      const optimisticEvent = new CustomEvent('favorites-updated', { 
        detail: { 
          action: 'LIKE_OPTIMISTIC', 
          movie: optimisticMovieData,
          timestamp: Date.now()
        } 
      });
      
      window.dispatchEvent(optimisticEvent);

      // API hívás a backend-nek (háttérben)
      try {
        const userId = user.value?.id || 3; // HARDCODED TEST USER
        const movieId = movie.tmdb_id || movie.id;


        if (userId && movieId) {

          // Unique timestamp a cache-busting-hoz
          const timestamp = Date.now();
          const result = await interactionsService.swipeMovie(userId, movieId, 'LIKE');

          if (result.success) {

            // Második broadcast - megerősítés a backend-től
            window.dispatchEvent(new CustomEvent('favorites-updated', { 
              detail: { 
                action: 'LIKE_CONFIRMED', 
                movie: optimisticMovieData,
                movieId,
                timestamp,
                backendData: result.data
              } 
            }));
            
            // Global state frissítés minden komponensnek
            if (window.favoriteMoviesCache) {
              window.favoriteMoviesCache.invalidate();
            }
            
          } else {
            console.error('LIKE mentési hiba:', result.message);
            
            // Ha a backend elutasítja, rollback event
            window.dispatchEvent(new CustomEvent('favorites-update-failed', { 
              detail: { 
                action: 'LIKE_ROLLBACK', 
                movie: optimisticMovieData,
                error: result.message
              } 
            }));
          }
        } else {
          console.warn('Hiányzó adatok - userId:', userId, 'movieId:', movieId);
        }
      } catch (error) {
  console.error('API hiba:', error);
      }
      
      // Csak a sikeres mentés után váltunk a következő filmre
      stats.likes++;
      animateCardExit('like');
      
      // Kis delay hogy az animáció befejeződjön, aztán következő film
      setTimeout(() => {
        nextMovie();
      }, 300);
    };
    
    const performReject = async () => {
      // JAVÍTÁS: A FELSŐ kártyát reject-eljük (top-card)!
      const topCardIndex = visibleMovies.value.length - 1;
      const visibleMovie = visibleMovies.value[topCardIndex];
      
      if (!visibleMovie) {
        console.warn('No visible movie to reject');
        return;
      }
      
      const movie = visibleMovie; // A FELSŐ film használata


      // API hívás a backend-nek
      try {
        const userId = user.value?.id || 3; // Fallback to test user
        const movieId = movie.tmdb_id || movie.id;
        
        if (userId && movieId) {
          const result = await interactionsService.swipeMovie(userId, movieId, 'DISLIKE');
          if (result.success) {

          } else {
            console.error('DISLIKE mentési hiba:', result.message);
          }
        } else {
          console.warn('Hiányzó adatok - userId:', userId, 'movieId:', movieId);
        }
      } catch (error) {
  console.error('API hiba:', error);
      }
      
      stats.dislikes++;
      animateCardExit('reject');
      
      // Kis delay hogy az animáció befejeződjön, aztán következő film
      setTimeout(() => {
        nextMovie();
      }, 300);
    };
    
    const performSuperLike = async () => {
      // JAVÍTÁS: A FELSŐ kártyát super like-oljuk!
      const topCardIndex = visibleMovies.value.length - 1;
      const visibleMovie = visibleMovies.value[topCardIndex];
      
      if (!visibleMovie) return;
      
      const movie = visibleMovie; // A FELSŐ film használata


      // API hívás a backend-nek (super like = sima like az adatbázisban)
      try {
        const userId = user.value?.id || 3; // Fallback to test user
        const movieId = movie.tmdb_id || movie.id;
        
        if (userId && movieId) {
          const result = await interactionsService.swipeMovie(userId, movieId, 'LIKE');
          if (result.success) {

          } else {
            console.error('SUPER LIKE mentési hiba:', result.message);
          }
        } else {
          console.warn('Hiányzó adatok - userId:', userId, 'movieId:', movieId);
        }
      } catch (error) {
  console.error('API hiba:', error);
      }
      
      stats.superLikes++;
      animateCardExit('super-like');
      
      // Kis delay hogy az animáció befejeződjön, aztán következő film
      setTimeout(() => {
        nextMovie();
      }, 300);
    };
    
    const animateCardExit = (direction) => {
      // Reset drag position for smooth animation
      dragCurrent.x = 0;
      dragCurrent.y = 0;
      
      // Card will be removed by nextMovie(), CSS handles exit animation
    };
    
    const nextMovie = () => {



      currentIndex.value++;

      console.log('  - visibleMovies after increment:', visibleMovies.value.map(m => m?.title));
      
      // Load more movies if running low (when 5 or fewer movies remain)
      if (movieStack.value.length - currentIndex.value <= 5) {

        loadMoreMovies();
      }
    };
    
    const loadMoreMovies = async () => {
      if (isLoadingMore.value) return; // Prevent multiple simultaneous loads
      
      try {
        isLoadingMore.value = true;
        currentPage.value++;

        const userId = user.value?.id || 1; // Fallback to user 1 if not authenticated
        const result = await movieService.discoverMovies(userId, currentPage.value);
        
        if (result.success && result.movies && result.movies.length > 0) {
          // Append new movies to the existing stack
          movieStack.value.push(...result.movies);

        } else {

          currentPage.value--; // Revert page increment if no movies found
        }
        
      } catch (error) {
        console.error('Error loading more movies:', error);
        currentPage.value--; // Revert page increment on error
      } finally {
        isLoadingMore.value = false;
      }
    };
    
    // Button actions
    const likeMovie = () => {
      if (isDragging.value) return;
      performLike();
    };
    
    const rejectMovie = () => {
      if (isDragging.value) return;
      performReject();
    };
    
    const superLike = () => {
      if (isDragging.value) return;
      performSuperLike();
    };
    
    // Style calculations
    const getCardStyle = (index) => {
      const isTopCard = index === visibleMovies.value.length - 1;
      
      if (isTopCard && isDragging.value) {
        const rotation = dragCurrent.x * rotationMultiplier;
        return {
          transform: `translate(${dragCurrent.x}px, ${dragCurrent.y}px) rotate(${rotation}deg)`,
          zIndex: 1000,
        };
      }
      
      return {
        transform: `scale(${0.95 - (visibleMovies.value.length - 1 - index) * 0.05}) translateY(${(visibleMovies.value.length - 1 - index) * 10}px)`,
        zIndex: index,
        opacity: index === 0 ? 0.8 : 1,
      };
    };
    
    // Utility methods
    const getMoviePosterUrl = (posterPath) => {
      // Ha nincs poster_path, használjunk placeholder-t
      if (!posterPath) return '/placeholder-movie.jpg';
      
      // Ha már teljes URL (OMDb API esetén), használjuk azt
      if (posterPath.startsWith('http')) {
        return posterPath;
      }
      
      // Ha csak partial path (TMDB API esetén), építsük fel a teljes URL-t
      return `https://image.tmdb.org/t/p/w500${posterPath}`;
    };
    
    const handleImageError = (event) => {
      event.target.src = '/placeholder-movie.jpg';
    };
    
    const handleImageLoad = (event) => {
      // Could add image loaded state here
    };
    
    // Navigation
    const goBack = () => {
      router.push('/dashboard');
    };
    
    const openSettings = () => {
      router.push('/preferences');
    };
    
    // Language name mapping
    const getLanguageName = (languageCode) => {
      const languageMap = {
        'en': 'Angol',
        'hu': 'Magyar',
        'fr': 'Francia',
        'de': 'Német',
        'es': 'Spanyol',
        'it': 'Olasz',
        'ja': 'Japán',
        'ko': 'Koreai',
        'zh': 'Kínai',
        'ru': 'Orosz',
        'pt': 'Portugál',
        'ar': 'Arab',
        'hi': 'Hindi',
        'th': 'Thai',
        'tr': 'Török',
        'pl': 'Lengyel',
        'nl': 'Holland',
        'sv': 'Svéd',
        'da': 'Dán',
        'no': 'Norvég',
        'fi': 'Finn'
      };
      return languageMap[languageCode] || languageCode?.toUpperCase() || t('language.unknown');
    };

    // Additional movie info helpers
    const formatNumber = (num) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
    };

    const getRatingCategory = (rating) => {
      if (rating >= 8.5) return t('rating_categories.excellent');
      if (rating >= 7.5) return t('rating_categories.very_good');
      if (rating >= 6.5) return t('rating_categories.good');
      if (rating >= 5.5) return t('rating_categories.average');
      return t('rating_categories.poor');
    };

    const getEstimatedRuntime = (movie) => {
      // Ha van pontos runtime adat a backend-től (számként)
      if (movie.runtime && typeof movie.runtime === 'number') {
        return `${movie.runtime} ${t('runtime.minutes')}`;
      }
      
      // Ha van kategória alapú runtime adat (runtime_category kulcs)
      if (movie.runtime_category) {
        return t(`runtime.categories.${movie.runtime_category}`);
      }
      
      // Ha van régi formátumú runtime adat (stringként) - backward compatibility
      if (movie.runtime && typeof movie.runtime === 'string') {
        return movie.runtime;
      }
      
      // Ha nincs adat, default szöveg
      return t('runtime.no_data');
    };

    const getPopularityClass = (popularity) => {
      if (popularity >= 100) return 'very-high';
      if (popularity >= 50) return 'high';
      if (popularity >= 20) return 'medium';
      return 'low';
    };

    const getPopularityText = (popularity) => {
      if (popularity >= 100) return t('popularity.very_popular');
      if (popularity >= 50) return t('popularity.popular');
      if (popularity >= 20) return t('popularity.moderately_popular');
      return t('popularity.less_known');
    };

    const getRatingClass = (rating) => {
      if (rating >= 8.5) return 'excellent';
      if (rating >= 7.5) return 'very-good';
      if (rating >= 6.5) return 'good';
      if (rating >= 5.5) return 'average';
      return 'poor';
    };

    const getRatingText = (rating) => {
      if (rating >= 8.5) return t('rating_quality.excellent');
      if (rating >= 7.5) return t('rating_quality.very_good');
      if (rating >= 6.5) return t('rating_quality.good');
      if (rating >= 5.5) return t('rating_quality.average');
      return t('rating_quality.poor');
    };

    const getVoteCountClass = (voteCount) => {
      if (voteCount >= 10000) return 'very-high';
      if (voteCount >= 5000) return 'high';
      if (voteCount >= 1000) return 'medium';
      return 'low';
    };

    const getVoteCountText = (voteCount) => {
      if (voteCount >= 10000) return t('vote_count.many');
      if (voteCount >= 5000) return t('vote_count.enough');
      if (voteCount >= 1000) return t('vote_count.moderate');
      return t('vote_count.few');
    };

    const getRecencyClass = (releaseDate) => {
      if (!releaseDate) return 'unknown';
      const year = new Date(releaseDate).getFullYear();
      const currentYear = new Date().getFullYear();
      if (currentYear - year <= 2) return 'very-recent';
      if (currentYear - year <= 5) return 'recent';
      if (currentYear - year <= 10) return 'modern';
      return 'older';
    };

    const getRecencyText = (releaseDate) => {
      if (!releaseDate) return t('recency.unknown');
      const year = new Date(releaseDate).getFullYear();
      const currentYear = new Date().getFullYear();
      if (currentYear - year <= 2) return t('recency.very_recent');
      if (currentYear - year <= 5) return t('recency.recent');
      if (currentYear - year <= 10) return t('recency.modern');
      return t('recency.older');
    };

    const getDecade = (releaseDate) => {
      if (!releaseDate) return null;
      const year = new Date(releaseDate).getFullYear();
      const decade = Math.floor(year / 10) * 10;
      return `${decade}s`;
    };

    const isHighlyRated = (movie) => {
      return movie.vote_average >= 8.0 && movie.vote_count >= 1000;
    };

    const isPopular = (movie) => {
      return movie.popularity >= 50;
    };

    const isClassic = (movie) => {
      if (!movie.release_date) return false;
      const year = new Date(movie.release_date).getFullYear();
      return year <= 1990 && movie.vote_average >= 7.5;
    };

    const getGenreSpecialty = (movie) => {
      const genres = getGenreIds(movie);
      if (genres.includes(27) && movie.vote_average >= 7.0) return t('fun_facts.horror_classic');
      if (genres.includes(878) && movie.vote_average >= 7.5) return t('fun_facts.scifi_masterpiece');
      if (genres.includes(16) && movie.vote_average >= 8.0) return t('fun_facts.animation_gem');
      if (genres.includes(35) && movie.vote_average >= 7.8) return t('fun_facts.comedy_special');
      if (genres.includes(18) && movie.vote_average >= 8.5) return t('fun_facts.drama_excellence');
      return null;
    };

    const getGenreIds = (movie) => {
      // Ha genre_ids string formátumban van (JSON)
      if (movie.genre_ids && typeof movie.genre_ids === 'string') {
        try {
          return JSON.parse(movie.genre_ids);
        } catch (e) {
          console.warn('Cannot parse genre_ids:', movie.genre_ids);
          return [];
        }
      }
      // Ha genre_ids már array formátumban van
      if (Array.isArray(movie.genre_ids)) {
        return movie.genre_ids;
      }
      // Ha van genres property és abból kinyerjük az id-kat
      if (movie.genres && Array.isArray(movie.genres)) {
        return movie.genres.map(g => g.id);
      }
      return [];
    };

    const getMovieGenres = (movie) => {

      // Ha már van feldolgozott genres property (angol nevekkel a backend-től)
      if (movie.genres && Array.isArray(movie.genres)) {
        return movie.genres.map(genre => ({
          id: genre.id,
          name: t(`genres.${genre.name}`) || t(`genres.${genre.id}`) || genre.name
        }));
      }
      
      // Fallback: ha nincs genres, akkor próbáljuk meg a genre_ids-ból
      const genreIds = getGenreIds(movie);
      return genreIds.map(id => ({
        id: id,
        name: t(`genres.${id}`) || `${t('genres.unknown')} ${id}`
      }));
    };
    
    // Lifecycle
    onMounted(() => {
      loadMovies();
    });

    // Watch for language changes and reload movies
    watch(currentLocale, async (newLocale, oldLocale) => {

      loadMovies();
    });
    
    return {
      // Translation function
      t,
      
      // State
      loading,
      visibleMovies,
      currentMovie,
      isDragging,
      showLikeIndicator,
      showNopeIndicator,
      showSuperLikeIndicator,
      stats,
      
      // Methods
      startDrag,
      likeMovie,
      rejectMovie,
      superLike,
      reloadMovies,
      getCardStyle,
      getMoviePosterUrl,
      getMovieYear,
      formatReleaseDate,
      getLanguageName,
      formatNumber,
      getRatingCategory,
      getEstimatedRuntime,
      getPopularityClass,
      getPopularityText,
      getRatingClass,
      getRatingText,
      getVoteCountClass,
      getVoteCountText,
      getRecencyClass,
      getRecencyText,
      getDecade,
      isHighlyRated,
      isPopular,
      isClassic,
      getGenreSpecialty,
      getMovieGenres,
      handleImageError,
      handleImageLoad,
      goBack,
      openSettings
    };
  }
};
</script>
<style scoped>
.movie-browsing-view {
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Content area */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem;
  padding-top: 20px; /* Much less top padding - closer to bottom */
  min-height: 0; /* Allow flex shrinking */
  max-height: calc(100vh - 80px); /* Adjust for PageHeader */
  position: relative;
  z-index: 10;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(229, 9, 20, 0.3);
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Cards container */
.cards-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  max-width: 600px; /* Wider for better screen usage */
  margin:4rem auto 0 auto;
  width: 100%;
  min-height: 380px; /* Smaller min-height */
}

/* Movie card */
.movie-card {
  position: absolute;
  width: 100%;
  max-width: 500px; /* Wider cards */
  height: 550px; /* Increased to fit larger images */
  background: var(--bg-secondary);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  cursor: grab;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  user-select: none;
  z-index: 10;
}

.movie-card.swiping {
  transition: none;
  cursor: grabbing;
  z-index: 100;
}

.movie-card:not(.top-card) {
  pointer-events: none;
}

/* Movie image */
.movie-image {
  position: relative;
  width: 100%;
  height: 100%; /* More image visible */
  overflow: hidden;
 
}

.movie-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* Swipe indicators */
.swipe-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.swipe-indicator.visible {
  opacity: 1;
}

.indicator-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 16px;
  font-weight: 700;
  font-size: 1.2rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.like-indicator .indicator-content {
  background: rgba(76, 175, 80, 0.9);
  color: white;
  border: 3px solid #4CAF50;
}

.nope-indicator .indicator-content {
  background: rgba(244, 67, 54, 0.9);
  color: white;
  border: 3px solid #F44336;
}

.super-like-indicator .indicator-content {
  background: rgba(33, 150, 243, 0.9);
  color: white;
  border: 3px solid #2196F3;
}

/* Movie info */
.movie-info {
  height: 200px; /* Nagyobb magasság több információnak */
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
}

/* Basic info section (like Tinder name + age) */
.movie-basic-info {
  padding: 1rem 1.5rem 0.5rem;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-light);
}

.movie-title {
  font-size: 1.4rem; /* Slightly smaller */
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
  flex: 1;
  margin-right: 1rem;
}

.movie-age {
  background: var(--bg-accent);
  color: var(--text-secondary);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
}

/* Bio section (like Tinder bio) */
.movie-bio {
  padding: 0.75rem 1.5rem;
  flex: 2; /* Több helyet kap */
  display: flex;
  align-items: flex-start;
}

.movie-overview {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 4; /* Több sor megjelenítése */
  -webkit-box-orient: vertical;
  line-clamp: 4;
  overflow: hidden;
  max-height: none; /* Eltávolítjuk a magasság korlátozást */
}

/* Scrollable details section */
.movie-details-scroll {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: white;
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border-radius: 20px 20px 0 0;
  overflow-y: auto;
  z-index: 10;
}

.movie-card:hover .movie-details-scroll,
.movie-details-scroll:hover {
  transform: translateY(30%);
}

.movie-details-content {
  padding: 2rem 1.5rem;
  padding-top: 3rem;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1rem 0;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff3cd;
  color: #856404;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  display: inline-flex;
}

.rating svg {
  width: 16px;
  height: 16px;
}

.genres {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.genre-tag {
  background: #e3f2fd;
  color: #1565c0;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.additional-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-label {
  color: #666;
  font-weight: 500;
}

.info-value {
  color: #333;
  font-weight: 600;
  text-align: right;
  max-width: 60%;
}

.extended-plot {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid var(--primary-color);
}

.extended-plot p {
  margin: 0;
  color: #555;
  line-height: 1.6;
  font-size: 0.95rem;
}

/* Statistics Grid */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  display: block;
}

.stat-label {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
}

/* Quality Indicators */
.quality-indicators {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quality-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.quality-item.very-high {
  background: #d4edda;
  border-left: 4px solid #28a745;
}

.quality-item.high {
  background: #d1ecf1;
  border-left: 4px solid #17a2b8;
}

.quality-item.medium {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
}

.quality-item.low {
  background: #f8d7da;
  border-left: 4px solid #dc3545;
}

.quality-item.excellent {
  background: #d4edda;
  border-left: 4px solid #28a745;
}

.quality-item.very-good {
  background: #d1ecf1;
  border-left: 4px solid #17a2b8;
}

.quality-item.good {
  background: #e2e3e5;
  border-left: 4px solid #6c757d;
}

.quality-item.average {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
}

.quality-item.poor {
  background: #f8d7da;
  border-left: 4px solid #dc3545;
}

.quality-item.very-recent {
  background: #d4edda;
  border-left: 4px solid #28a745;
}

.quality-item.recent {
  background: #d1ecf1;
  border-left: 4px solid #17a2b8;
}

.quality-item.modern {
  background: #e2e3e5;
  border-left: 4px solid #6c757d;
}

.quality-item.older {
  background: #f8d7da;
  border-left: 4px solid #dc3545;
}

.quality-item.unknown {
  background: #f8f9fa;
  border-left: 4px solid #6c757d;
}

.quality-icon {
  font-size: 1.2rem;
}

.quality-text {
  font-weight: 500;
  color: #333;
}

/* Fun Facts */
.fun-facts {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fun-fact {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 6px;
  font-size: 0.9rem;
}

.fact-icon {
  font-size: 1.1rem;
}

.fact-text {
  font-weight: 500;
}

.scroll-indicator {
  display: flex;
  justify-content: center;
  padding: 2rem 0 1rem;
}

.scroll-dot {
  width: 4px;
  height: 30px;
  background: #ddd;
  border-radius: 2px;
}

/* No more movies */
.no-movies {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: white;
  text-align: center;
}

.no-movies-icon {
  margin-bottom: 1rem;
  opacity: 0.7;
}

.no-movies h3 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
}

.no-movies p {
  margin: 0 0 2rem 0;
  opacity: 0.8;
}

.reload-btn {
  background: white;
  color: #667eea;
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

/* Action buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3rem;
  padding: 1rem 0;
  flex-shrink: 0; /* Prevent shrinking */
}

.action-btn {
  width: 45px; /* Much smaller default size */
  height: 45px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15); /* Smaller shadow */
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}

.reject-btn {
  background: #F44336;
  color: white;
}

.super-like-btn {
  background: #2196F3;
  color: white;
  width: 50px;
  height: 50px;
}

.like-btn {
  background: #4CAF50;
  color: white;
}

.reject-btn:hover:not(:disabled) {
  background: #d32f2f;
}

.super-like-btn:hover:not(:disabled) {
  background: #1976d2;
}

.like-btn:hover:not(:disabled) {
  background: #388e3c;
}

/* Responsive */
@media (min-width: 769px) and (max-width: 1023px) {
  /* Tablet layout */
  .content-area {
    padding: 0.5rem 2rem;
    padding-top: 20px; /* Less top padding - closer to bottom */
  }
  
  .movie-card {
    max-width: 500px;
    height: 400px; /* Increased for larger image */
    flex-direction: column;
  }
  
  .movie-image {
    width: 100%;
    height: 240px; /* More image visible on tablet */
  }
  
  .movie-info {
    width: 100%;
    height: 160px;
  }
  
  .action-buttons {
    gap: 2rem;
    padding: 1rem 0;
  }
  
  .action-btn {
    width: 50px; /* Smaller tablet buttons */
    height: 50px;
  }
}

@media (min-width: 1024px) {
  /* Desktop layout - MUCH wider cards */
  .cards-container {
    max-width: 900px; /* Even wider for desktop */
  }
  
  .movie-card {
    max-width: 800px; /* Much wider cards */
    height: 400px; /* Shorter height */
    display: flex; /* Horizontal layout for desktop */
    flex-direction: row;
  }
  
  .movie-image {
    width: 55%; /* Image takes 55% width */
    height: 100%;
  }
  
  .movie-info {
    width: 45%; /* Info takes 45% width */
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .content-area {
    padding: 1rem 3rem;
    padding-top: 20px; /* Less top padding - closer to bottom */
  }
  
  .action-buttons {
    gap: 4rem;
    padding: 1.5rem 0;
  }
  
  .action-btn {
    width: 55px; /* Smaller desktop buttons */
    height: 55px;
  }
}

@media (min-width: 1440px) {
  /* Extra large desktop - more compact */
  .cards-container {
    max-width: 1000px;
  }
  
  .movie-card {
    max-width: 900px;
    height: 450px; /* Much shorter than before */
  }
}

@media (max-width: 768px) {
  .content-area {
    padding: 0.25rem; /* Even less padding */
    padding-top: 15px; /* Even less top padding for mobile */
    margin-top: 0.25rem;
  }
  
  .movie-card {
    max-width: 360px; /* Wider cards */
    height: 460px; /* Increased for larger image */
    flex-direction: column; /* Vertical layout for mobile */
  }
  
  .movie-image {
    width: 100%;
    height: 280px; /* More image visible on mobile */
  }
  
  .movie-info {
    width: 100%;
    height: 180px; /* Fixed height for info area */
  }
  
  .movie-basic-info {
    padding: 1rem 1rem 0.5rem;
  }
  
  .movie-bio {
    padding: 0.5rem 1rem;
  }
  
  .action-buttons {
    padding: 1rem 0;
    gap: 1rem;
  }
  
  .action-btn {
    width: 40px; /* Much smaller mobile buttons */
    height: 40px;
  }
}

@media (max-width: 480px) {
  .content-area {
    padding: 0.25rem;
    padding-top: 10px; /* Minimal top padding for small mobile */
    margin-top: 0;
  }
  
  .movie-card {
    max-width: 340px; /* Wider on small screens */
    height: 420px; /* Increased for larger image */
  }
  
  .movie-image {
    height: 260px; /* More image visible on small mobile */
  }
  
  .movie-info {
    height: 160px; /* Shorter info area */
  }
  
  .action-buttons {
    padding: 0.5rem 0; /* Less padding */
    gap: 1rem;
  }
  
  .action-btn {
    width: 35px; /* Smallest mobile buttons */
    height: 35px;
  }
}
</style>
