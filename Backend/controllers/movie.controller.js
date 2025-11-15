const axios = require('axios');
const ApiResponse = require('../service/helpers/api-response.helper');

/**
 * Movie Controller - Handles all movie-related API operations
 * 
 * This controller integrates with The Movie Database (TMDB) API to provide:
 * - Movie discovery based on user preferences
 * - Search functionality
 * - Popular and trending movies
 * - Genre-specific movie filtering
 * - User interaction tracking (likes/dislikes)
 * 
 * Source for movie genre IDs: https://developer.themoviedb.org/reference/genre-movie-list
 */
class MovieController {
  /**
   * Initialize MovieController with TMDB API configuration and database models
   * Sets up access to UserPreferences, UserMovieInteraction, and Movie models
   */
  constructor() {
    // TMDB API configuration - requires TMDB_API_KEY environment variable
    this.tmdbApiKey = process.env.TMDB_API_KEY;
    this.tmdbBaseUrl = 'https://api.themoviedb.org/3';

    // Database model dependencies - imported from DBO layer
    const { UserPreferences, UserMovieInteraction, Movie } = require('../dbo');
    this.UserPreferences = UserPreferences;
    this.UserMovieInteraction = UserMovieInteraction;
    this.Movie = Movie;
  }

  /**
   * GET /api/movies/discover - Discover movies based on user preferences
   * 
   * This method implements a sophisticated movie discovery algorithm that:
   * 1. Filters out movies the user has already liked
   * 2. Applies user-specific genre preferences
   * 3. Uses fallback strategies if no specific preferences are set
   * 4. Returns paginated results with TMDB integration
   * 
   * @param {Object} req - Express request object
   * @param {string} req.query.userId - Required user ID for personalization
   * @param {number} req.query.page - Optional page number (default: 1)
   * @param {string} req.query.language - Optional language code (default: 'hu')
   */
  async discoverMovies(req, res) {
    try {
      const { userId, page = 1, language = 'hu' } = req.query;

      // Validate required parameters
      if (!userId) {
        return ApiResponse.error(res, 'user.errors.missing_params', 400);
      }

      

      // Query user's previously liked movies to filter them out from recommendations
      // This prevents showing movies the user has already interacted with positively
      const likedInteractions = await this.UserMovieInteraction.findAll({
        where: {
          user_id: userId,
          interaction_type: 'LIKE'
        },
        include: [{
          model: this.Movie,
          as: 'movie',
          attributes: ['tmdb_id']
        }]
      });
      
      const likedTmdbIds = likedInteractions.map(interaction => interaction.movie.tmdb_id);
      

      // Fetch user preferences to determine which movie discovery strategy to use
      const preferences = await this.UserPreferences.findOne({
        where: { user_id: userId }
      });

      let movies;
      
      // Apply preference-based movie discovery with fallback logic
      if (preferences) {
        
        
        // PRIORITY GENRE: Documentary movies
        // Documentary has highest priority due to specific user interest patterns
        if (preferences.genre_documentary === 1) {
          
          movies = await this.getGenreMovies(page, 99, userId, language); // 99 = Documentary genre ID
          
          return ApiResponse.success(res, 'user.success.data_retrieved', {
            movies: movies,
            totalResults: movies.length,
            totalPages: Math.ceil(movies.length / 20),
            currentPage: parseInt(page)
          });
        }
        // SPECIAL CASE: Anime movies (Animation genre + Japan origin country)
        else if (preferences.genre_anime === 1) {
          movies = await this.getAnimeMovies(page, userId, language);
        }
        // ACTION GENRE: High-energy, action-packed movies
        else if (preferences.genre_action === 1) {
          movies = await this.getGenreMovies(page, 28, userId, language); // 28 = Action genre ID
        }
        // ADDITIONAL GENRES: Handle other user preferences
        else if (preferences.genre_animation === 1) {
          movies = await this.getGenreMovies(page, 16, userId, language); // 16 = Animation
        }
        else if (preferences.genre_adventure === 1) {
          movies = await this.getGenreMovies(page, 12, userId, language); // 12 = Adventure
        }
        else if (preferences.genre_comedy === 1) {
          movies = await this.getGenreMovies(page, 35, userId, language); // 35 = Comedy
        }
        else if (preferences.genre_horror === 1) {
          movies = await this.getGenreMovies(page, 27, userId, language);
        }
        else if (preferences.genre_drama === 1) {
          movies = await this.getGenreMovies(page, 18, userId, language);
        }
        else if (preferences.genre_fantasy === 1) {
          movies = await this.getGenreMovies(page, 14, userId, language);
        }
        else if (preferences.genre_science_fiction === 1) {
          movies = await this.getGenreMovies(page, 878, userId, language); // 878 = Science Fiction
        }
        else if (preferences.genre_romance === 1) {
          movies = await this.getGenreMovies(page, 10749, userId, language); // 10749 = Romance
        }
        else if (preferences.genre_thriller === 1) {
          movies = await this.getGenreMovies(page, 53, userId, language); // 53 = Thriller
        }
        else if (preferences.genre_crime === 1) {
          movies = await this.getGenreMovies(page, 80, userId, language); // 80 = Crime
        }
        else if (preferences.genre_family === 1) {
          movies = await this.getGenreMovies(page, 10751, userId, language); // 10751 = Family
        }
        else if (preferences.genre_history === 1) {
          movies = await this.getGenreMovies(page, 36, userId, language); // 36 = History
        }
        else if (preferences.genre_music === 1) {
          movies = await this.getGenreMovies(page, 10402, userId, language); // 10402 = Music
        }
        else if (preferences.genre_mystery === 1) {
          movies = await this.getGenreMovies(page, 9648, userId, language); // 9648 = Mystery
        }
        else if (preferences.genre_war === 1) {
          movies = await this.getGenreMovies(page, 10752, userId, language); // 10752 = War
        }
        else if (preferences.genre_western === 1) {
          movies = await this.getGenreMovies(page, 37, userId, language); // 37 = Western
        }
        // FALLBACK STRATEGY: When no specific genre preferences are active, default to popular movies
        else {
          
          movies = await this.getDefaultMovies(page, userId, language);
        }
      } else {
        // NO PREFERENCES FOUND: User hasn't set any preferences yet, show popular content
        movies = await this.getDefaultMovies(page, userId);
      }

      return ApiResponse.success(res, 'user.success.data_retrieved', {
        movies: movies,
        totalResults: movies.length,
        totalPages: Math.ceil(movies.length / 20),
        currentPage: parseInt(page)
      });

    } catch (error) {
      console.error('Error in discoverMovies:', error);
      return ApiResponse.serverError(res, error);
    }
  }

  /**
   * GET /api/movies/popular - Get popular movies endpoint handler
   * 
   * Returns currently popular movies from TMDB without user personalization
   * Used as a general endpoint for popular content discovery
   * 
   * @param {Object} req - Express request object
   * @param {number} req.query.page - Optional page number (default: 1)
   * @param {string} req.query.language - Optional language code (default: 'hu')
   */
  async getPopularMovies(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const language = req.query.language || 'hu';
      
      

      const movies = await this.getDefaultMovies(page, null, language);
      
      return ApiResponse.success(res, 'user.success.data_retrieved', {
        movies: movies,
        totalResults: movies.length,
        totalPages: Math.ceil(movies.length / 20),
        currentPage: page
      });

    } catch (error) {
      console.error('Error in getPopularMovies:', error);
      return ApiResponse.serverError(res, error);
    }
  }

  /**
   * Get default movies - Popular movies from TMDB
   * 
   * This method serves as a fallback when:
   * - User has no preferences set
   * - No specific genre preferences are active
   * - General popular content is requested
   * 
   * @param {number} page - Page number for pagination
   * @param {string|null} userId - Optional user ID (for future personalization)
   * @param {string} language - Language code for localized content
   * @returns {Array} Array of movie objects with standardized format
   */
  async getDefaultMovies(page = 1, userId = null, language = 'hu') {
    console.log(`Getting default popular movies for user ${userId}, language: ${language}...`);
    
    try {
      const params = {
        api_key: this.tmdbApiKey,
        page: page,
        sort_by: 'popularity.desc',
        vote_count_gte: 100
      };

      // CSAK magyar esetén adjunk language paramétert!
      if (language === 'hu') {
        params.language = 'hu-HU';
        console.log('Hungarian language requested - adding hu-HU parameter');
      } else {
        console.log('Non-Hungarian language - using original language (no language parameter)');
      }

      console.log('Final TMDB API params:', params);

      // Apply year filters if userId is provided
      if (userId) {
        const userPreferences = await this.UserPreferences.findOne({
          where: { user_id: userId }
        });
        
        if (userPreferences) {
          if (userPreferences.min_year) {
            params['primary_release_date.gte'] = `${userPreferences.min_year}-01-01`;
            console.log(`Applying min year filter: ${userPreferences.min_year}`);
          }
          if (userPreferences.max_year) {
            params['primary_release_date.lte'] = `${userPreferences.max_year}-12-31`;
            console.log(`Applying max year filter: ${userPreferences.max_year}`);
          }
          if (userPreferences.min_rating) {
            params['vote_average.gte'] = userPreferences.min_rating;
            console.log(`Applying min rating filter: ${userPreferences.min_rating}`);
          }
          if (userPreferences.runtime_preference) {
            switch (userPreferences.runtime_preference) {
              case 'short':
                params['with_runtime.lte'] = 89;
                console.log(`Applying runtime filter: short (<90 min)`);
                break;
              case 'medium':
                params['with_runtime.gte'] = 90;
                params['with_runtime.lte'] = 150;
                console.log(`Applying runtime filter: medium (90-150 min)`);
                break;
              case 'long':
                params['with_runtime.gte'] = 151;
                console.log(`Applying runtime filter: long (>150 min)`);
                break;
              case 'any':
              default:
                // No runtime filter
                break;
            }
          }
        }
      }

      const response = await axios.get(`${this.tmdbBaseUrl}/discover/movie`, {
        params: params
      });

      console.log(`TMDB returned ${response.data?.results?.length || 0} movies`);

      if (response.data && response.data.results) {
        const movies = response.data.results.map(movie => this.convertTmdbToFormat(movie));
        const filteredMovies = await this.filterAdultContent(movies, language);
        
        // Get user preferences for runtime enhancement
        let userPrefs = null;
        if (userId) {
          userPrefs = await this.UserPreferences.findOne({ where: { user_id: userId } });
        }
        
        // Kiszűrjük a már LIKE-olt filmeket
        const unlikedMovies = await this.filterAlreadyLikedMovies(filteredMovies, userId);
        
        return await this.enhanceMoviesWithRuntime(unlikedMovies, userPrefs, language);
      }
      
      return [];
    } catch (error) {
      console.error('TMDB API Error:', error.message);
      return [];
    }
  }

  /**
   * Get Anime movies - Animation genre with Japan origin country
   * 
   * Specialized method for anime content discovery that combines:
   * - Animation genre (TMDB ID: 16)
   * - Japan as origin country
   * - User preference filters (year, rating, runtime)
   * 
   * @param {number} page - Page number for pagination
   * @param {string|null} userId - Optional user ID for preference filtering
   * @param {string} language - Language code for localized content
   * @returns {Array} Array of anime movie objects
   */
  async getAnimeMovies(page = 1, userId = null, language = 'hu') {
    console.log(`Getting anime movies (Animation + Japan) for user ${userId}, language: ${language}...`);
    
    try {
      const params = {
        api_key: this.tmdbApiKey,
        page: page,
        sort_by: 'popularity.desc',
        vote_count_gte: 50,
        with_genres: '16',           // 16 = Animation genre
        with_origin_country: 'JP'    // Japan origin country for anime content
      };

      // Apply language parameter only for Hungarian localization
      if (language === 'hu') {
        params.language = 'hu-HU';
      }

      // Apply user preference filters if userId is provided
      if (userId) {
        const userPreferences = await this.UserPreferences.findOne({
          where: { user_id: userId }
        });
        
        if (userPreferences) {
          if (userPreferences.min_year) {
            params['primary_release_date.gte'] = `${userPreferences.min_year}-01-01`;
            console.log(`Applying min year filter: ${userPreferences.min_year}`);
          }
          if (userPreferences.max_year) {
            params['primary_release_date.lte'] = `${userPreferences.max_year}-12-31`;
            console.log(`Applying max year filter: ${userPreferences.max_year}`);
          }
          if (userPreferences.min_rating) {
            params['vote_average.gte'] = userPreferences.min_rating;
            console.log(`Applying min rating filter: ${userPreferences.min_rating}`);
          }
          if (userPreferences.runtime_preference) {
            switch (userPreferences.runtime_preference) {
              case 'short':
                params['with_runtime.lte'] = 89;
                console.log(`Applying runtime filter: short (<90 min)`);
                break;
              case 'medium':
                params['with_runtime.gte'] = 90;
                params['with_runtime.lte'] = 150;
                console.log(`Applying runtime filter: medium (90-150 min)`);
                break;
              case 'long':
                params['with_runtime.gte'] = 151;
                console.log(`Applying runtime filter: long (>150 min)`);
                break;
              case 'any':
              default:
                // No runtime filter
                break;
            }
          }
        }
      }

      const response = await axios.get(`${this.tmdbBaseUrl}/discover/movie`, {
        params: params
      });

      console.log(`TMDB returned ${response.data?.results?.length || 0} anime movies`);

      if (response.data && response.data.results) {
        const movies = response.data.results.map(movie => this.convertTmdbToFormat(movie));
        const filteredMovies = await this.filterAdultContent(movies, language);
        
        // Get user preferences for runtime enhancement
        let userPrefs = null;
        if (userId) {
          userPrefs = await this.UserPreferences.findOne({ where: { user_id: userId } });
        }
        
        // Kiszűrjük a már LIKE-olt filmeket
        const unlikedMovies = await this.filterAlreadyLikedMovies(filteredMovies, userId);
        
        return await this.enhanceMoviesWithRuntime(unlikedMovies, userPrefs, language);
      }
      
      return [];
    } catch (error) {
      console.error('TMDB API Error for anime:', error.message);
      return [];
    }
  }

  // Általános műfaj filmek (Action, Comedy, Horror, stb.)
  /**
   * Get movies by specific genre ID
   * 
   * Universal method for fetching movies of a specific genre from TMDB.
   * Supports all TMDB genre IDs and applies user preference filters.
   * 
   * Genre ID examples:
   * - 28: Action, 35: Comedy, 18: Drama, 27: Horror
   * - 878: Science Fiction, 99: Documentary, 16: Animation
   * - Full list: https://developer.themoviedb.org/reference/genre-movie-list
   * 
   * @param {number} page - Page number for pagination
   * @param {number} genreId - TMDB genre ID to filter by
   * @param {string|null} userId - Optional user ID for preference filtering
   * @param {string} language - Language code for localized content
   * @returns {Array} Array of movie objects matching the specified genre
   */
  async getGenreMovies(page = 1, genreId, userId = null, language = 'hu') {
    console.log(`Getting genre ${genreId} movies for user ${userId}, language: ${language}...`);
    
    try {
      const params = {
        api_key: this.tmdbApiKey,
        page: page,
        sort_by: 'popularity.desc',
        vote_count_gte: 100, // Minimum vote count for quality filtering
        with_genres: genreId.toString()
      };

      // Apply language parameter only for Hungarian localization
      if (language === 'hu') {
        params.language = 'hu-HU';
      }

      // Apply user preference filters if userId is provided
      if (userId) {
        const userPreferences = await this.UserPreferences.findOne({
          where: { user_id: userId }
        });
        
        if (userPreferences) {
          if (userPreferences.min_year) {
            params['primary_release_date.gte'] = `${userPreferences.min_year}-01-01`;
            console.log(`Applying min year filter: ${userPreferences.min_year}`);
          }
          if (userPreferences.max_year) {
            params['primary_release_date.lte'] = `${userPreferences.max_year}-12-31`;
            console.log(`Applying max year filter: ${userPreferences.max_year}`);
          }
          if (userPreferences.min_rating) {
            params['vote_average.gte'] = userPreferences.min_rating;
            console.log(`Applying min rating filter: ${userPreferences.min_rating}`);
          }
          if (userPreferences.runtime_preference) {
            switch (userPreferences.runtime_preference) {
              case 'short':
                params['with_runtime.lte'] = 89;
                console.log(`Applying runtime filter: short (<90 min)`);
                break;
              case 'medium':
                params['with_runtime.gte'] = 90;
                params['with_runtime.lte'] = 150;
                console.log(`Applying runtime filter: medium (90-150 min)`);
                break;
              case 'long':
                params['with_runtime.gte'] = 151;
                console.log(`Applying runtime filter: long (>150 min)`);
                break;
              case 'any':
              default:
                // No runtime filter
                break;
            }
          }
        }
      }
      
      const response = await axios.get(`${this.tmdbBaseUrl}/discover/movie`, {
        params: params
      });

      console.log(`TMDB returned ${response.data?.results?.length || 0} movies for genre ${genreId}`);
      
      // DEBUG: Check what fields TMDB discover actually returns for debugging
      if (response.data?.results?.[0]) {
        console.log('TMDB discover response fields:', Object.keys(response.data.results[0]));
        console.log('Sample movie data:', JSON.stringify(response.data.results[0], null, 2));
      }

      if (response.data && response.data.results) {
        const movies = response.data.results.map(movie => this.convertTmdbToFormat(movie));
        
        // Most minden műfajnál alkalmazzuk a kulcsszó alapú szűrést
        const filteredMovies = await this.filterAdultContent(movies, language);
        
        // Get user preferences for runtime enhancement
        let userPrefs = null;
        if (userId) {
          userPrefs = await this.UserPreferences.findOne({ where: { user_id: userId } });
        }
        
        // Kiszűrjük a már LIKE-olt filmeket
        const unlikedMovies = await this.filterAlreadyLikedMovies(filteredMovies, userId);
        
        return await this.enhanceMoviesWithRuntime(unlikedMovies, userPrefs, language);
        
      }
      
      return [];
    } catch (error) {
      console.error(`TMDB API Error for genre ${genreId}:`, error.message);
      return [];
    }
  }

  // Felnőtt tartalom szűrő - keywords is ellenőrzi
  /**
   * Filter out adult and inappropriate content from movie results
   * 
   * This method implements content filtering to ensure family-friendly recommendations:
   * - Blocks explicit adult films and pornographic content
   * - Filters out problematic titles identified through keywords
   * - Uses TMDB movie keywords API for additional context analysis
   * - Maintains a blacklist of specific problematic films
   * 
   * The filtering is conservative to ensure appropriate content for all users.
   * 
   * @param {Array} movies - Array of movie objects to filter
   * @param {string} language - Language code for keyword fetching
   * @returns {Array} Filtered array of appropriate movie objects
   */
  async filterAdultContent(movies, language = 'hu') {
    // Comprehensive list of adult content keywords and problematic film titles
    const adultKeywords = [
      // Specific problematic film titles identified through testing
      'big gay hairy hit', 'big gay hairy', 'gay hairy hit',
      'tuhog', 'tu hog', 'tu-hog', 
      'stepmoms desire', 'stepmom desire', 'stepmother desire',
      'swingers zwinger', 'zwingerz',
      
      // Explicit adult content - only clear pornographic terms
      'hardcore', 'porn', 'pornographic', 'xxx', 'x-rated',
      'adult film', 'pink film', 'pinku eiga',
      
      // Japanese erotic genres that should be filtered
      'hentai', 'ecchi', 'yaoi', 'yuri', 'shotacon', 'lolicon',
      
      // Known erotic film series
      'emmanuelle', 'caligula', 'nymphomaniac',
      
      // Additional keyword-based filtering from TMDB metadata
      'softcore', 'erotic', 'sexual'
    ];

    console.log(`Filtering adult content from ${movies.length} movies...`);

    const filteredMovies = [];
    
    for (const movie of movies) {
      const title = (movie.title || '').toLowerCase();
      const overview = (movie.overview || '').toLowerCase();
      
      // Fetch movie keywords for additional content filtering
      let movieKeywords = '';
      try {
        const keywordResponse = await axios.get(`${this.tmdbBaseUrl}/movie/${movie.id}/keywords`, {
          params: language === 'hu' 
            ? { api_key: this.tmdbApiKey, language: 'hu-HU' }
            : { api_key: this.tmdbApiKey }
        });
        
        if (keywordResponse.data && keywordResponse.data.keywords) {
          movieKeywords = keywordResponse.data.keywords
            .map(k => k.name.toLowerCase())
            .join(' ');
        }
      } catch (error) {
        // If keywords fetch fails, continue without keyword filtering
      }
      
      // DEBUG: Log potentially problematic movies for content filtering validation
      if (title.includes('tuhog') || title.includes('stepmom') || movieKeywords.includes('softcore')) {
        console.log(`CHECKING PROBLEMATIC MOVIE: "${movie.title}"`);
        console.log(`Title: "${title}"`);
        console.log(`Keywords: "${movieKeywords}"`);
      }
      
      // Specific checks for known problematic films that should be blocked
      if (title.includes('tuhog') || title.includes('tu hog') || title.includes('tu-hog') ||
          title.includes('stepmoms desire') || title.includes('stepmom desire')) {
        console.log(`Blocked specific problematic film: "${movie.title}"`);
        continue; // Skip this movie
      }
      
      // CSAK a legproblémásabb kulcsszavak alapján szűrünk
      const hasAdultKeyword = adultKeywords.some(keyword => 
        title.includes(keyword.toLowerCase()) || 
        overview.includes(keyword.toLowerCase()) ||
        movieKeywords.includes(keyword.toLowerCase())
      );
      
      // Ha találunk problémás kulcsszót
      if (hasAdultKeyword) {
        console.log(`Filtered out adult content: "${movie.title}" (keyword found)`);
        continue; // Skip this movie
      }
      
      // Ha minden rendben, hozzáadjuk a szűrt listához
      filteredMovies.push(movie);
    }

    console.log(`Adult content filter: ${movies.length} → ${filteredMovies.length} movies (${movies.length - filteredMovies.length} filtered out)`);
    
    return filteredMovies;
  }

  // TMDB formátum átalakítása
  convertTmdbToFormat(tmdbMovie) {
    // Műfajok neve angolul (TMDB alapértelmezett)
    const genreMap = {
      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
      99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
      27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
      53: 'Thriller', 10752: 'War', 37: 'Western'
    };

    const genres = tmdbMovie.genre_ids ? tmdbMovie.genre_ids.map(id => ({
      id: id,
      name: genreMap[id] || `Genre ${id}`
    })) : [];

    return {
      id: tmdbMovie.id,
      title: tmdbMovie.title,
      year: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : null,
      rating: tmdbMovie.vote_average,
      overview: tmdbMovie.overview,
      poster_path: tmdbMovie.poster_path,
      poster_url: tmdbMovie.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}` : null,
      backdrop_path: tmdbMovie.backdrop_path,
      backdrop_url: tmdbMovie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${tmdbMovie.backdrop_path}` : null,
      genre_ids: tmdbMovie.genre_ids,
      genres: genres, // Add genres array with English names
      popularity: tmdbMovie.popularity,
      vote_count: tmdbMovie.vote_count,
      adult: tmdbMovie.adult,
      release_date: tmdbMovie.release_date,
      vote_average: tmdbMovie.vote_average,
      runtime: tmdbMovie.runtime || null // Add runtime field if available
    };
  }

  /**
   * Enhanced movie data with runtime information (optimized approach)
   * 
   * This method enriches movie objects with runtime data and applies runtime-based filtering
   * based on user preferences. Instead of making individual API calls for each movie,
   * it uses statistical estimation for better performance.
   * 
   * Runtime preferences:
   * - short: < 90 minutes (typically comedies, animations, documentaries)
   * - medium: 90-150 minutes (most mainstream films)
   * - long: > 150 minutes (epics, extended dramas)
   * - any: no runtime filtering applied
   * 
   * @param {Array} movies - Array of movie objects to enhance
   * @param {Object|null} userPreferences - User preference object with runtime_preference
   * @param {string} language - Language code for localized data
   * @returns {Array} Enhanced and optionally filtered array of movie objects
   */
  async enhanceMoviesWithRuntime(movies, userPreferences = null, language = 'hu') {
    console.log(`Enhancing ${movies.length} movies with runtime data...`);
    
    // If runtime preference exists, apply logical runtime estimation and filtering
    if (userPreferences && userPreferences.runtime_preference) {
      const runtimeInfo = this.getRuntimeInfoFromPreference(userPreferences.runtime_preference);
      
      for (const movie of movies) {
        movie.runtime_category = runtimeInfo.displayKey;
        movie.estimated_runtime = runtimeInfo.averageMinutes;
      }
      
      console.log(`Applied runtime info based on preference: ${userPreferences.runtime_preference}`);
      return movies;
    }
    
    // Ha nincs runtime preferencia, próbáljunk meg lekérni néhány film pontos adatát
    const moviesToEnhance = movies.slice(0, 5); // Csak az első 5 filmhez
    const remainingMovies = movies.slice(5);
    
    const enhancedMovies = [];
    
    for (let i = 0; i < moviesToEnhance.length; i++) {
      const movie = moviesToEnhance[i];
      
      try {
        const response = await axios.get(`${this.tmdbBaseUrl}/movie/${movie.id}`, {
          params: language === 'hu' 
            ? { api_key: this.tmdbApiKey, language: 'hu-HU' }
            : { api_key: this.tmdbApiKey }
        });
        
        if (response.data && response.data.runtime) {
          movie.runtime = response.data.runtime;
          console.log(`Enhanced "${movie.title}" with runtime: ${response.data.runtime} minutes`);
        } else {
          movie.runtime = null;
          console.log(`No runtime data available for "${movie.title}"`);
        }
        
        enhancedMovies.push(movie);
        
        // Small delay for API rate limits
        if (i % 3 === 0 && i > 0) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
      } catch (error) {
        console.error(`Error fetching runtime for movie ${movie.id}:`, error.message);
        movie.runtime = null;
        enhancedMovies.push(movie);
      }
    }
    
    // For remaining movies, set runtime to null
    for (const movie of remainingMovies) {
      movie.runtime = null;
      enhancedMovies.push(movie);
    }
    
    console.log(`Enhanced ${enhancedMovies.length} movies with runtime data`);
    return enhancedMovies;
  }

  // Get runtime info based on user preference
  getRuntimeInfoFromPreference(runtimePreference) {
    switch (runtimePreference) {
      case 'short':
        return {
          displayKey: 'short',
          averageMinutes: 80,
          minMinutes: 0,
          maxMinutes: 89
        };
      case 'medium':
        return {
          displayKey: 'medium', 
          averageMinutes: 120,
          minMinutes: 90,
          maxMinutes: 150
        };
      case 'long':
        return {
          displayKey: 'long',
          averageMinutes: 180,
          minMinutes: 151,
          maxMinutes: null
        };
      default:
        return {
          displayKey: null,
          averageMinutes: null,
          minMinutes: null,
          maxMinutes: null
        };
    }
  }

  // Specifikus műfaj toggle-ölése egy usernek (be/ki kapcsolás)
  /**
   * GET /api/movies/search - Search movies by title
   * 
   * Searches for movies using TMDB API based on query string.
   * Used by AI Chat for finding specific movie titles and converting them to movie cards.
   * 
   * @param {Object} req - Express request object
   * @param {string} req.query.query - Movie title to search for
   * @param {number} req.query.page - Optional page number (default: 1)
   * @param {string} req.query.language - Optional language code (default: 'en')
   */
  async searchMovies(req, res) {
    try {
      const { query, page = 1, language = 'en' } = req.query;

      if (!query) {
        return ApiResponse.error(res, 'Query parameter is required', 400);
      }

      console.log(`Searching for movies with query: "${query}", page: ${page}, language: ${language}`);

      const params = {
        api_key: this.tmdbApiKey,
        query: query,
        page: page,
        include_adult: false
      };

      // Apply language parameter if specified
      if (language && language !== 'en') {
        params.language = language;
      }

      const response = await axios.get(`${this.tmdbBaseUrl}/search/movie`, {
        params: params
      });

      console.log(`TMDB search returned ${response.data?.results?.length || 0} movies`);

      if (response.data && response.data.results) {
        const movies = response.data.results.map(movie => this.convertTmdbToFormat(movie));
        
        return ApiResponse.success(res, 'Movies found successfully', {
          movies: movies,
          totalResults: response.data.total_results,
          totalPages: response.data.total_pages,
          currentPage: parseInt(page)
        });
      }
      
      return ApiResponse.success(res, 'No movies found', {
        movies: [],
        totalResults: 0,
        totalPages: 0,
        currentPage: parseInt(page)
      });

    } catch (error) {
      console.error('Error in searchMovies:', error);
      return ApiResponse.serverError(res, error);
    }
  }

  /**
   * Toggles a specific genre preference for a user (0 → 1 or 1 → 0)
   * @param {string} userId - The user ID
   * @param {string} genreName - The genre field name to toggle
   * @returns {Promise<Object>} Updated preferences and toggle information
   */
  async setGenre(userId, genreName) {
    console.log(`🎭 Toggling genre ${genreName} for user ${userId}`);
    
    try {
      // Ellenőrizzük hogy létezik-e a user preferences
      const preferences = await this.UserPreferences.findOne({
        where: { user_id: userId }
      });

      if (!preferences) {
        throw new Error(`No preferences found for user ${userId}. Create preferences first via preferences controller.`);
      }

      // Jelenlegi érték lekérése
      const currentValue = preferences[genreName];
      console.log(`Current ${genreName} value:`, currentValue);
      
      // Toggle logika: ha 1 → 0, ha 0 vagy null → 1
      const newValue = (currentValue === 1) ? 0 : 1;
      console.log(`Toggling ${genreName}: ${currentValue} → ${newValue}`);

      // Csak az adott műfajt frissítjük
      const genreUpdate = {
        [genreName]: newValue
      };

      await this.UserPreferences.update(genreUpdate, {
        where: { user_id: userId }
      });
      
      // Frissített adatok lekérése
      const updatedPreferences = await this.UserPreferences.findOne({
        where: { user_id: userId }
      });

      console.log(`Genre ${genreName} toggled to ${newValue} for user ${userId}`);
      return {
        preferences: updatedPreferences,
        genreName: genreName,
        oldValue: currentValue,
        newValue: newValue
      };
      
    } catch (error) {
      console.error(`Error toggling genre ${genreName}:`, error.message);
      throw error;
    }
  }

  // Kiszűri a már LIKE-olt filmeket a discovery eredményekből
  /**
   * Filters out movies that the user has already liked to avoid duplicates
   * @param {Array} movies - Array of movies to filter
   * @param {string} userId - The user ID to check interactions for
   * @returns {Promise<Array>} Filtered movies excluding already liked ones
   */
  async filterAlreadyLikedMovies(movies, userId) {
    if (!userId || !movies || movies.length === 0) {
      return movies;
    }

    try {
      // Lekérdezzük a user LIKE-olt filmjeit
      const likedInteractions = await this.UserMovieInteraction.findAll({
        where: {
          user_id: userId,
          interaction_type: 'LIKE'
        },
        include: [{
          model: this.Movie,
          as: 'movie',
          attributes: ['tmdb_id']
        }]
      });
      
      const likedTmdbIds = new Set(likedInteractions.map(interaction => interaction.movie.tmdb_id));
      console.log(`Filtering out ${likedTmdbIds.size} already liked movies from ${movies.length} discovered movies`);
      
      // Kiszűrjük a már LIKE-olt filmeket
      const filteredMovies = movies.filter(movie => {
        const movieTmdbId = movie.tmdb_id || movie.id;
        return !likedTmdbIds.has(movieTmdbId);
      });
      
      console.log(`After filtering: ${filteredMovies.length} movies remaining`);
      return filteredMovies;
      
    } catch (error) {
      console.error('Error filtering liked movies:', error);
      // Ha hiba van, visszaadjuk az eredeti listát
      return movies;
    }
  }

  /**
   * Get detailed information about a specific movie by TMDB ID
   * 
   * @param {Object} req - Express request object
   * @param {string} req.params.movieId - TMDB movie ID
   * @param {string} req.query.language - Optional language code (default: 'en')
   */
  async getMovieDetails(req, res) {
    try {
      const { movieId } = req.params;
      const { language = 'en' } = req.query;

      console.log(`Fetching movie details for TMDB ID: ${movieId}, language: ${language}`);

      if (!movieId) {
        return ApiResponse.error(res, 'Movie ID is required', 400);
      }

      const params = {
        api_key: this.tmdbApiKey,
        language: language,
        append_to_response: 'credits,videos,images'
      };

      const response = await axios.get(`${this.tmdbBaseUrl}/movie/${movieId}`, {
        params: params
      });

      if (response.data) {
        // Use the converter for base properties, but get genres directly from the detailed response.
        const movieData = this.convertTmdbToFormat(response.data);
        
        // *** FIX: Overwrite the genres from the converter with the correct, full genre objects from the API response. ***
        movieData.genres = response.data.genres;

        // Add additional details
        movieData.credits = response.data.credits;
        movieData.videos = response.data.videos?.results || [];
        movieData.images = response.data.images;
        
        return ApiResponse.success(res, 'Movie details retrieved successfully', movieData);
      }
      
      return ApiResponse.error(res, 'Movie not found', 404);
      
    } catch (error) {
      console.error('Error fetching movie details:', error);
      
      if (error.response?.status === 404) {
        return ApiResponse.error(res, 'Movie not found', 404);
      }
      
      return ApiResponse.serverError(res, error);
    }
  }
}

module.exports = MovieController;