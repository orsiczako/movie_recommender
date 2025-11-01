// Movie service for handling movie data processing and API calls

// TMDB genre mapping to Hungarian names
const GENRE_MAP = {
  28: 'Akció',
  12: 'Kaland',
  16: 'Animáció', 
  35: 'Vígjáték',
  80: 'Krimi',
  99: 'Dokumentum',
  18: 'Dráma',
  10751: 'Családi',
  14: 'Fantasy',
  36: 'Történelmi',
  27: 'Horror',
  10402: 'Zene',
  9648: 'Rejtély',
  10749: 'Romantikus',
  878: 'Sci-Fi',
  10770: 'TV film',
  53: 'Thriller',
  10752: 'Háborús',
  37: 'Western'
};

/**
 * Process raw movie data from API to standardized format
 * @param {Object} rawMovie - Raw movie data from API
 * @returns {Object} Processed movie data
 */
export function processMovieData(rawMovie) {
  if (!rawMovie) return null;

  // Handle poster URL - OMDb vs TMDB format
  let posterUrl = '/placeholder-movie.jpg';
  if (rawMovie.poster_url) {
    posterUrl = rawMovie.poster_url;
  } else if (rawMovie.poster_path) {
    // Ha a poster_path már teljes URL (OMDb), akkor használjuk azt
    if (rawMovie.poster_path.startsWith('http')) {
      posterUrl = rawMovie.poster_path;
    } else {
      // TMDB formátum
      posterUrl = `https://image.tmdb.org/t/p/w500${rawMovie.poster_path}`;
    }
  }

  // Handle backdrop URL - általában TMDB formátum
  const backdropUrl = rawMovie.backdrop_url || 
    (rawMovie.backdrop_path && !rawMovie.backdrop_path.startsWith('http')
      ? `https://image.tmdb.org/t/p/w780${rawMovie.backdrop_path}` 
      : rawMovie.backdrop_path) || null;

  // Process genres
  const genres = processGenres(rawMovie);

  // Process release date
  const releaseYear = rawMovie.release_date 
    ? new Date(rawMovie.release_date).getFullYear()
    : rawMovie.year || null;

  return {
    id: rawMovie.id,
    tmdb_id: rawMovie.tmdb_id || rawMovie.id,
    imdb_id: rawMovie.imdb_id,
    title: rawMovie.title || 'Ismeretlen cím',
    original_title: rawMovie.original_title,
    overview: rawMovie.overview || 'Nincs leírás elérhető.',
    release_date: rawMovie.release_date,
    year: releaseYear,
    vote_average: parseFloat(rawMovie.vote_average || rawMovie.tmdb_rating || 0),
    vote_count: parseInt(rawMovie.vote_count || rawMovie.tmdb_vote_count || 0),
    popularity: rawMovie.popularity,
    poster_path: rawMovie.poster_path,
    poster_url: posterUrl,
    backdrop_path: rawMovie.backdrop_path,
    backdrop_url: backdropUrl,
    genres: genres,
    adult: rawMovie.adult || false,
    original_language: rawMovie.original_language,
    runtime: rawMovie.runtime || rawMovie.runtime_minutes,
    certification: rawMovie.certification, // OMDb Rated mező
    director: rawMovie.director, // OMDb Director mező
    cast: rawMovie.cast, // OMDb Actors mező feldolgozva
    country: rawMovie.country,
    awards: rawMovie.awards
  };
}

/**
 * Process genres from movie data
 * @param {Object} rawMovie - Raw movie data
 * @returns {Array} Array of genre objects with id and name
 */
function processGenres(rawMovie) {
  let genres = [];
  
  // Handle different genre formats from API
  if (rawMovie.genres) {
    if (Array.isArray(rawMovie.genres)) {
      // Already processed genres array - convert IDs to objects if needed
      if (rawMovie.genres.length > 0 && typeof rawMovie.genres[0] === 'number') {
        genres = rawMovie.genres.map(id => ({
          id: id,
          name: GENRE_MAP[id] || `Műfaj ${id}`
        }));
      } else {
        genres = rawMovie.genres;
      }
    } else if (typeof rawMovie.genres === 'string') {
      // JSON string format - clean the string first
      try {
        const cleanGenres = rawMovie.genres.trim();
        const genreIds = JSON.parse(cleanGenres);
        // Convert genre IDs to objects with names
        genres = genreIds.map(id => ({
          id: id,
          name: GENRE_MAP[id] || `Műfaj ${id}`
        }));
      } catch (e) {
        console.warn('Failed to parse genres JSON:', rawMovie.genres, 'Error:', e.message);
        // Try alternative parsing - extract numbers from string
        try {
          const matches = rawMovie.genres.match(/\d+/g);
          if (matches) {
            const genreIds = matches.map(id => parseInt(id));
            genres = genreIds.map(id => ({
              id: id,
              name: GENRE_MAP[id] || `Műfaj ${id}`
            }));
          }
        } catch (e2) {
          console.error('Alternative parsing also failed:', e2);
          genres = [];
        }
      }
    }
  } else if (rawMovie.genre_ids) {
    // TMDB format with genre IDs
    genres = rawMovie.genre_ids.map(id => ({
      id: id,
      name: GENRE_MAP[id] || `Műfaj ${id}`
    }));
  }

  return genres;
}

/**
 * Format release date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export function formatReleaseDate(dateString) {
  if (!dateString) return 'Ismeretlen';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}

/**
 * Get year from release date
 * @param {string} dateString - ISO date string
 * @returns {number|string} Year or 'Ismeretlen'
 */
export function getMovieYear(dateString) {
  if (!dateString) return 'Ismeretlen';
  
  try {
    return new Date(dateString).getFullYear();
  } catch (e) {
    return 'Ismeretlen';
  }
}

/**
 * Main movie service class for API communication
 */
class MovieService {
  constructor() {
    this.baseUrl = import.meta.env.DEV ? 'http://localhost:3000/api' : '/api';
  }

  /**
   * Get popular movies
   * @param {number} page - Page number (default: 1)
   * @param {string} language - Language code (default: 'hu')
   * @returns {Promise<Object>} API response with processed movies
   */
  async getPopularMovies(page = 1, language = 'hu') {
    try {
      const response = await fetch(`${this.baseUrl}/movies/popular?page=${page}&language=${language}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.movies) {
        // Process each movie
        const processedMovies = data.movies.map(processMovieData);
        
        return {
          success: true,
          movies: processedMovies,
          totalResults: data.totalResults,
          totalPages: data.totalPages,
          currentPage: data.currentPage
        };
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      throw error;
    }
  }

  /**
   * Get trending movies
   * @param {string} timeWindow - 'day' or 'week'
   * @returns {Promise<Object>} API response with processed movies
   */
  async getTrendingMovies(timeWindow = 'week') {
    try {
      const response = await fetch(`${this.baseUrl}/movies/trending?timeWindow=${timeWindow}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.movies) {
        const processedMovies = data.movies.map(processMovieData);
        
        return {
          success: true,
          movies: processedMovies,
          totalResults: data.totalResults,
          totalPages: data.totalPages,
          currentPage: data.currentPage
        };
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error getting trending movies:', error);
      throw error;
    }
  }

  /**
   * Search movies
   * @param {string} query - Search query
   * @param {Object} options - Search options (page, year, genre, userId)
   * @returns {Promise<Object>} API response with processed movies
   */
  async searchMovies(query, options = {}) {
    try {
      const params = new URLSearchParams({
        query,
        page: options.page || 1,
        ...(options.year && { year: options.year }),
        ...(options.genre && { genre: options.genre }),
        ...(options.userId && { userId: options.userId })
      });
      
      const response = await fetch(`${this.baseUrl}/movies/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.movies) {
        const processedMovies = data.movies.map(processMovieData);
        
        return {
          success: true,
          movies: processedMovies,
          totalResults: data.totalResults,
          totalPages: data.totalPages,
          currentPage: data.currentPage
        };
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  }

  /**
   * Get movie details by ID
   * @param {number} movieId - TMDB movie ID vagy IMDb ID
   * @param {number} userId - User ID (gyerekmod ellenőrzéshez)
   * @returns {Promise<Object>} Movie details
   */
  async getMovieDetails(movieId, userId = null) {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      
      const url = `${this.baseUrl}/movies/${movieId}${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.movie) {
        return {
          success: true,
          movie: processMovieData(data.movie)
        };
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error getting movie details:', error);
      throw error;
    }
  }

  /**
   * Discover movies based on preferences
   * @param {number} userId - User ID
   * @param {number} page - Page number
   * @param {string} language - Language code (default: 'hu')
   * @returns {Promise<Object>} API response with processed movies
   */
  async discoverMovies(userId, page = 1, language = 'hu') {
    try {
      const response = await fetch(`${this.baseUrl}/movies/discover?userId=${userId}&page=${page}&language=${language}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.movies) {
        const processedMovies = data.movies.map(processMovieData);
        
        return {
          success: true,
          movies: processedMovies,
          totalResults: data.totalResults,
          totalPages: data.totalPages,
          currentPage: data.currentPage
        };
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error discovering movies:', error);
      throw error;
    }
  }
}

// Default instance
export const movieService = new MovieService();
