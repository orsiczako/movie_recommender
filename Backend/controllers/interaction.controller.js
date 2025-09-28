const ApiResponse = require('../service/helpers/api-response.helper');
const axios = require('axios');

/**
 * Controller for handling user-movie interactions (likes, dislikes, watchlist management)
 * Manages movie swipes, interaction statistics, and automatic TMDB movie creation
 * 
 * @class InteractionController
 */
class InteractionController {
  /**
   * Initialize interaction controller with database models and TMDB API configuration
   * @param {Object} models - Sequelize database models
   * @param {Object} models.UserMovieInteraction - User interaction model
   * @param {Object} models.UserWatchlist - User watchlist model  
   * @param {Object} models.Movie - Movie model
   * @param {Object} models.User - User model
   */
  constructor(models) {
    this.UserMovieInteraction = models.UserMovieInteraction;
    this.UserWatchlist = models.UserWatchlist;
    this.Movie = models.Movie;
    this.User = models.User;
    
    // TMDB API beállítások
    this.tmdbApiKey = process.env.TMDB_API_KEY;
    this.tmdbBaseUrl = 'https://api.themoviedb.org/3';
  }

  /**
   * Static method to add a movie interaction (LIKE/DISLIKE)
   * Creates movie from TMDB if it doesn't exist, handles duplicate interactions
   * 
   * @static
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body
   * @param {string} req.body.movieId - TMDB movie ID
   * @param {string} req.body.interactionType - 'LIKE' or 'DISLIKE'
   * @param {string} req.userId - User ID from auth middleware
   * @param {Object} res - Express response object
   * @returns {Promise<void>} JSON response with interaction data
   */
  static async addInteraction(req, res) {
    try {
      const { movieId, interactionType } = req.body;
      const userId = req.userId;

      if (!movieId || !interactionType) {
        return res.status(400).json({
          success: false,
          message: 'movieId and interactionType are required'
        });
      }

      if (!['LIKE', 'DISLIKE'].includes(interactionType)) {
        return res.status(400).json({
          success: false,
          message: 'interactionType must be either LIKE or DISLIKE'
        });
      }

      // Check if movie exists, if not create it from TMDB
      let movie = await Movie.findByPk(movieId);
      if (!movie) {
        movie = await InteractionController.createMovieFromTmdb(movieId);
        if (!movie) {
          return res.status(404).json({
            success: false,
            message: 'Movie not found and could not be created from TMDB'
          });
        }
      }

      // Check if interaction already exists for this user and movie
      const existingInteraction = await UserMovieInteraction.findOne({
        where: {
          user_id: userId,
          movie_id: movieId,
          interaction_type: interactionType
        }
      });

      if (existingInteraction) {
        return res.status(200).json({
          success: true,
          message: 'Interaction already exists',
          data: existingInteraction
        });
      }

      // Remove any opposite interaction first (if user liked then dislikes, remove the like)
      const oppositeType = interactionType === 'LIKE' ? 'DISLIKE' : 'LIKE';
      await UserMovieInteraction.destroy({
        where: {
          user_id: userId,
          movie_id: movieId,
          interaction_type: oppositeType
        }
      });

      const interaction = await UserMovieInteraction.create({
        user_id: userId,
        movie_id: movieId,
        interaction_type: interactionType
      });

      res.status(201).json({
        success: true,
        message: 'Interaction saved successfully',
        data: interaction
      });

    } catch (error) {
      console.error('Error in addInteraction:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Handle movie swipe interaction with transactional safety
   * Creates/updates user interaction, manages watchlist, creates movie from TMDB if needed
   * 
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body
   * @param {string} req.body.userId - User ID (optional, defaults to test user)
   * @param {string} req.body.movieId - TMDB movie ID
   * @param {string} req.body.interactionType - 'LIKE' or 'DISLIKE'
   * @param {Object} res - Express response object
   * @returns {Promise<void>} JSON response with interaction and movie data
   */
  // POST /api/interactions - Film swipe (LIKE/DISLIKE)
  async swipeMovie(req, res) {
    try {
      const { userId, movieId, interactionType } = req.body;

      // ÁTMENETI FIX: ha nincs userId, használjuk a test user-t
      const finalUserId = userId || 3;

      // Validáció
      if (!movieId || !interactionType) {
        return ApiResponse.error(res, 'user.errors.missing_fields', 400);
      }

      if (!['LIKE', 'DISLIKE'].includes(interactionType)) {
        return ApiResponse.error(res, 'user.errors.invalid_interaction_type', 400);
      }

      console.log('SWIPE REQUEST:', { finalUserId, movieId, interactionType });

      // *** TRANZAKCIÓS BIZTONSÁG - Immediate Response Strategy ***
      const transaction = await this.UserMovieInteraction.sequelize.transaction();
      
      try {
        // Ellenőrizzük hogy létezik-e a felhasználó
        const user = await this.User.findByPk(finalUserId, { transaction });
        if (!user) {
          await transaction.rollback();
          return ApiResponse.error(res, 'user.errors.user_not_found', 404);
        }

        // Ellenőrizzük hogy létezik-e a film, ha nem létezik, létrehozzuk
        let movie = await this.Movie.findOne({
          where: { tmdb_id: movieId },
          transaction
        });
        
        if (!movie) {
          // Film automatikus létrehozása TMDB API-ból
          try {
            console.log('Creating movie from TMDB:', movieId);
            movie = await this.createMovieFromTmdb(movieId, transaction);
            console.log('Movie created:', movie.title);
          } catch (tmdbError) {
            console.error('Error creating movie from TMDB:', tmdbError);
            await transaction.rollback();
            return ApiResponse.error(res, 'user.errors.movie_not_found', 404);
          }
        }

        // Ellenőrizzük hogy van-e már interakció ugyanerre a filmre
        const existingInteraction = await this.UserMovieInteraction.findOne({
          where: {
            user_id: finalUserId,
            movie_id: movie.id
          },
          transaction
        });

        let interaction;
        let isUpdate = false;

        if (existingInteraction) {
          // Frissítjük a meglévő interakciót
          await this.UserMovieInteraction.update(
            { 
              interaction_type: interactionType,
              updated_at: new Date()
            },
            {
              where: {
                user_id: finalUserId,
                movie_id: movie.id
              },
              transaction
            }
          );
          
          interaction = await this.UserMovieInteraction.findOne({
            where: {
              user_id: finalUserId,
              movie_id: movie.id
            },
            transaction
          });
          
          isUpdate = true;
          console.log('Updated existing interaction');
        } else {
          // Új interakció létrehozása
          interaction = await this.UserMovieInteraction.create({
            user_id: finalUserId,
            movie_id: movie.id,
            interaction_type: interactionType
          }, { transaction });
          console.log('Created new interaction');
        }

        // Ha LIKE, automatikusan hozzáadjuk a watchlist-hez
        if (interactionType === 'LIKE') {
          await this.addToWatchlistIfNotExists(finalUserId, movie.id, transaction);
        } else if (interactionType === 'DISLIKE') {
          // Ha DISLIKE, eltávolítjuk a watchlist-ből (ha volt ott)
          await this.removeFromWatchlistIfExists(finalUserId, movie.id, transaction);
        }

        // *** KRITIKUS: COMMIT ELŐBB, RESPONSE UTÁNA ***
        await transaction.commit();
        
        const message = isUpdate ? 
          `Movie interaction updated to ${interactionType}` : 
          `Movie ${interactionType.toLowerCase()}d successfully`;

        console.log('SWIPE SUCCESS:', { 
          movie: movie.title, 
          interactionType, 
          isUpdate,
          interactionId: interaction.id 
        });

        // *** AZONNALI VÁLASZ - A COMMIT UTÁN ***
        return ApiResponse.success(res, 'user.success.interaction_saved', {
          data: {
            interaction: interaction,
            movie: {
              id: movie.id,
              tmdb_id: movie.tmdb_id,
              title: movie.title,
              poster_path: movie.poster_path,
              poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
              release_date: movie.release_date,
              tmdb_rating: movie.tmdb_rating,
              genres: movie.genres
            },
            addedToWatchlist: interactionType === 'LIKE',
            timestamp: Date.now()
          }
        });
        
      } catch (transactionError) {
        await transaction.rollback();
        throw transactionError;
      }

    } catch (error) {
      console.error('Error handling movie swipe:', error);
      return ApiResponse.serverError(res, error);
    }
  }

  /**
   * Retrieve paginated user interactions with movie details
   * Supports filtering by interaction type and includes movie poster URLs
   * 
   * @param {Object} req - Express request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.userId - User ID
   * @param {Object} req.query - Query parameters
   * @param {number} [req.query.page=1] - Page number for pagination
   * @param {number} [req.query.limit=20] - Items per page
   * @param {string} [req.query.interactionType] - Filter by 'LIKE' or 'DISLIKE'
   * @param {Object} res - Express response object
   * @returns {Promise<void>} JSON response with paginated interactions
   */
  // GET /api/interactions/:userId - Felhasználó összes interakciója
  async getUserInteractions(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20, interactionType } = req.query;

      // Szűrési feltételek
      const whereClause = { user_id: userId };
      
      if (interactionType && ['LIKE', 'DISLIKE'].includes(interactionType)) {
        whereClause.interaction_type = interactionType;
      }

      // Paginálás számítása
      const offset = (page - 1) * limit;

      const { count, rows: interactions } = await this.UserMovieInteraction.findAndCountAll({
        where: whereClause,
        include: [{
          model: this.Movie,
          as: 'movie',
          attributes: ['id', 'tmdb_id', 'title', 'poster_path', 'release_date', 'tmdb_rating', 'genres']
        }],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Kép URL-ek hozzáadása
      const processedInteractions = interactions.map(interaction => {
        const interactionData = interaction.toJSON();
        if (interactionData.movie && interactionData.movie.poster_path) {
          interactionData.movie.poster_url = `https://image.tmdb.org/t/p/w500${interactionData.movie.poster_path}`;
        }
        return interactionData;
      });

      return ApiResponse.success(res, 'user.success.interactions_retrieved', {
        data: {
          interactions: processedInteractions,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Error getting user interactions:', error);
      return ApiResponse.serverError(res, error);
    }
  }

  /**
   * Calculate user interaction statistics including like/dislike ratios
   * Provides total counts, recent activity (last 7 days), and like percentage
   * 
   * @param {Object} req - Express request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.userId - User ID
   * @param {Object} res - Express response object
   * @returns {Promise<void>} JSON response with interaction statistics
   */
  // GET /api/interactions/:userId/stats - Felhasználó interakciós statisztikái
  async getUserInteractionStats(req, res) {
    try {
      const { userId } = req.params;

      // Összes interakció száma típus szerint
      const stats = await this.UserMovieInteraction.findAll({
        where: { user_id: userId },
        attributes: [
          'interaction_type',
          [this.UserMovieInteraction.sequelize.fn('COUNT', '*'), 'count']
        ],
        group: ['interaction_type']
      });

      // Legutóbbi interakciók száma (utolsó 7 nap)
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 7);

      const recentStats = await this.UserMovieInteraction.findAll({
        where: {
          user_id: userId,
          created_at: {
            [this.UserMovieInteraction.sequelize.Op.gte]: recentDate
          }
        },
        attributes: [
          'interaction_type',
          [this.UserMovieInteraction.sequelize.fn('COUNT', '*'), 'count']
        ],
        group: ['interaction_type']
      });

      // Összes interakció száma
      const totalInteractions = await this.UserMovieInteraction.count({
        where: { user_id: userId }
      });

      // Statisztikák feldolgozása
      const processedStats = {
        total: totalInteractions,
        likes: 0,
        dislikes: 0,
        recent: {
          likes: 0,
          dislikes: 0,
          total: 0
        }
      };

      stats.forEach(stat => {
        const count = parseInt(stat.dataValues.count);
        if (stat.interaction_type === 'LIKE') {
          processedStats.likes = count;
        } else if (stat.interaction_type === 'DISLIKE') {
          processedStats.dislikes = count;
        }
      });

      recentStats.forEach(stat => {
        const count = parseInt(stat.dataValues.count);
        if (stat.interaction_type === 'LIKE') {
          processedStats.recent.likes = count;
        } else if (stat.interaction_type === 'DISLIKE') {
          processedStats.recent.dislikes = count;
        }
        processedStats.recent.total += count;
      });

      // Like arány számítása
      const likeRatio = totalInteractions > 0 ? 
        (processedStats.likes / totalInteractions * 100).toFixed(1) : 0;

      return ApiResponse.success(res, 'user.success.stats_retrieved', {
        data: {
          ...processedStats,
          likeRatio: parseFloat(likeRatio)
        }
      });

    } catch (error) {
      console.error('Error getting user interaction stats:', error);
      return ApiResponse.serverError(res, error);
    }
  }

  /**
   * Remove a specific user interaction for a movie
   * Also removes the movie from watchlist if it was liked
   * 
   * @param {Object} req - Express request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.userId - User ID
   * @param {string} req.params.movieId - TMDB movie ID
   * @param {Object} res - Express response object
   * @returns {Promise<void>} JSON response confirming removal
   */
  // DELETE /api/interactions/:userId/:movieId - Interakció törlése
  async removeInteraction(req, res) {
    try {
      const { userId, movieId } = req.params;

      // Film keresése tmdb_id alapján
      const movie = await this.Movie.findOne({
        where: { tmdb_id: movieId }
      });

      if (!movie) {
        return ApiResponse.error(res, 'user.errors.movie_not_found', 404);
      }

      // Interakció törlése
      const deleted = await this.UserMovieInteraction.destroy({
        where: {
          user_id: userId,
          movie_id: movie.id
        }
      });

      if (deleted === 0) {
        return ApiResponse.error(res, 'user.errors.interaction_not_found', 404);
      }

      // Watchlist-ből is eltávolítás (ha LIKE volt)
      await this.removeFromWatchlistIfExists(userId, movie.id);

      return ApiResponse.success(res, 'user.success.interaction_removed', {
        data: {
          deleted: true,
          movie: {
            tmdb_id: movie.tmdb_id,
            title: movie.title
          }
        }
      });

    } catch (error) {
      console.error('Error removing interaction:', error);
      return ApiResponse.serverError(res, error);
    }
  }

  /**
   * Clear all favorite movies (LIKE interactions) and watchlist items for a user
   * Uses transaction for data consistency
   * 
   * @param {Object} req - Express request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.userId - User ID
   * @param {Object} res - Express response object
   * @returns {Promise<void>} JSON response with deletion counts
   */
  // DELETE /api/interactions/:userId/favorites - Összes kedvenc törlése
  async clearAllFavorites(req, res) {
    try {
      const { userId } = req.params;

      console.log(`Clearing all favorites for user: ${userId}`);
      console.log('Request params:', req.params);
      console.log('Request path:', req.path);

      const transaction = await this.UserMovieInteraction.sequelize.transaction();
      
      try {
        // Összes LIKE interakció törlése
        const deletedInteractions = await this.UserMovieInteraction.destroy({
          where: {
            user_id: userId,
            interaction_type: 'LIKE'
          },
          transaction
        });

        // Watchlist törlése is
        const deletedWatchlistItems = await this.UserWatchlist.destroy({
          where: {
            user_id: userId
          },
          transaction
        });

        await transaction.commit();

        console.log(`Cleared ${deletedInteractions} favorites and ${deletedWatchlistItems} watchlist items for user ${userId}`);

        return ApiResponse.success(res, 'user.success.favorites_cleared', {
          data: {
            deletedInteractions,
            deletedWatchlistItems,
            cleared: true
          }
        });

      } catch (transactionError) {
        await transaction.rollback();
        throw transactionError;
      }

    } catch (error) {
      console.error('Error clearing all favorites:', error);
      return ApiResponse.serverError(res, error);
    }
  }

  // Helper metódusok

  /**
   * Add movie to user's watchlist if not already present
   * Helper method used when user likes a movie
   * 
   * @param {string} userId - User ID
   * @param {string} movieId - Internal movie ID (not TMDB ID)
   * @param {Object} [transaction=null] - Optional database transaction
   * @returns {Promise<void>} No return value, errors are logged but not thrown
   */
  // Hozzáadás watchlist-hez (ha még nincs ott)
  async addToWatchlistIfNotExists(userId, movieId, transaction = null) {
    try {
      const existingWatchlistItem = await this.UserWatchlist.findOne({
        where: {
          user_id: userId,
          movie_id: movieId
        },
        transaction
      });

      if (!existingWatchlistItem) {
        await this.UserWatchlist.create({
          user_id: userId,
          movie_id: movieId,
          added_at: new Date()
        }, { transaction });
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      // Nem dobunk hibát, mert a fő művelet (swipe) sikerült
    }
  }

  /**
   * Remove movie from user's watchlist if present
   * Helper method used when user dislikes a movie or removes interaction
   * 
   * @param {string} userId - User ID
   * @param {string} movieId - Internal movie ID (not TMDB ID)
   * @param {Object} [transaction=null] - Optional database transaction
   * @returns {Promise<void>} No return value, errors are logged but not thrown
   */
  // Eltávolítás watchlist-ből (ha van ott)
  async removeFromWatchlistIfExists(userId, movieId, transaction = null) {
    try {
      await this.UserWatchlist.destroy({
        where: {
          user_id: userId,
          movie_id: movieId
        },
        transaction
      });
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      // Nem dobunk hibát, mert a fő művelet sikerült
    }
  }

  /**
   * Create a movie record in database from TMDB API data
   * Fetches complete movie details and stores all relevant information
   * 
   * @param {string} tmdbId - TMDB movie ID
   * @param {Object} [transaction=null] - Optional database transaction
   * @returns {Promise<Object>} Created movie record with full details
   * @throws {Error} If TMDB API call fails or movie creation fails
   */
  // Film létrehozása TMDB API alapján
  async createMovieFromTmdb(tmdbId, transaction = null) {
    try {
      console.log(`Creating movie from TMDB: ${tmdbId}`);
      
      // TMDB API hívás a film részletes adataihoz
      const response = await axios.get(`${this.tmdbBaseUrl}/movie/${tmdbId}`, {
        params: {
          api_key: this.tmdbApiKey,
          language: 'en-US'
        }
      });

      const tmdbMovie = response.data;
      console.log(`TMDB movie data received: ${tmdbMovie.title}`);

      // Genres feldolgozása
      const genres = tmdbMovie.genres ? tmdbMovie.genres.map(g => g.name) : [];

      // Film létrehozása az adatbázisban
      const movie = await this.Movie.create({
        tmdb_id: tmdbMovie.id,
        imdb_id: tmdbMovie.imdb_id || null,
        title: tmdbMovie.title,
        original_title: tmdbMovie.original_title,
        year: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : null,
        release_date: tmdbMovie.release_date || null,
        tmdb_rating: tmdbMovie.vote_average || 0,
        tmdb_vote_count: tmdbMovie.vote_count || 0,
        genres: JSON.stringify(genres),
        runtime_minutes: tmdbMovie.runtime || null,
        overview: tmdbMovie.overview || null,
        tagline: tmdbMovie.tagline || null,
        poster_path: tmdbMovie.poster_path || null,
        poster_url: tmdbMovie.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}` : null,
        backdrop_path: tmdbMovie.backdrop_path || null,
        backdrop_url: tmdbMovie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${tmdbMovie.backdrop_path}` : null,
        original_language: tmdbMovie.original_language || 'en',
        spoken_languages: tmdbMovie.spoken_languages ? JSON.stringify(tmdbMovie.spoken_languages) : null,
        production_countries: tmdbMovie.production_countries ? JSON.stringify(tmdbMovie.production_countries) : null,
        budget: tmdbMovie.budget || null,
        revenue: tmdbMovie.revenue || null,
        popularity: tmdbMovie.popularity || 0,
        adult: tmdbMovie.adult || false
      }, { transaction });

      console.log(`Movie created in database: ${movie.title} (ID: ${movie.id})`);
      return movie;

    } catch (error) {
      console.error('Error creating movie from TMDB:', error);
      throw error;
    }
  }
}

module.exports = InteractionController;