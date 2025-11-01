const { successResponse, errorResponse } = require('../service/helpers/api-response.helper');

class WatchlistController {
  constructor(models) {
    this.UserWatchlist = models.UserWatchlist;
    this.Movie = models.Movie;
    this.User = models.User;
    this.UserMovieInteraction = models.UserMovieInteraction;
  }

  // GET /api/watchlist/:userId - Felhasználó watchlist-je
  async getUserWatchlist(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20, sortBy = 'added_date', sortOrder = 'DESC' } = req.query;

      // Paginálás számítása
      const offset = (page - 1) * limit;

      // Rendezési beállítások validálása
      const validSortFields = ['added_date', 'title', 'release_date', 'vote_average'];
      const validSortOrders = ['ASC', 'DESC'];
      
      const orderField = validSortFields.includes(sortBy) ? sortBy : 'added_date';
      const orderDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

      // Rendezés beállítása
      let orderClause;
      if (orderField === 'added_date') {
        orderClause = [['added_date', orderDirection]];
      } else {
        orderClause = [[{ model: this.Movie, as: 'movie' }, orderField, orderDirection]];
      }

      const { count, rows: watchlistItems } = await this.UserWatchlist.findAndCountAll({
        where: { user_id: userId },
        include: [{
          model: this.Movie,
          as: 'movie',
          attributes: [
            'id', 'tmdb_id', 'title', 'original_title', 'overview',
            'poster_path', 'backdrop_path', 'release_date', 'vote_average',
            'runtime', 'genre_ids'
          ]
        }],
        order: orderClause,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Kép URL-ek hozzáadása és adatok feldolgozása
      const processedWatchlist = watchlistItems.map(item => {
        const itemData = item.toJSON();
        if (itemData.movie) {
          if (itemData.movie.poster_path) {
            itemData.movie.poster_url = `https://image.tmdb.org/t/p/w500${itemData.movie.poster_path}`;
          }
          if (itemData.movie.backdrop_path) {
            itemData.movie.backdrop_url = `https://image.tmdb.org/t/p/w500${itemData.movie.backdrop_path}`;
          }
          // Genre IDs feldolgozása
          if (itemData.movie.genre_ids) {
            try {
              itemData.movie.genres = JSON.parse(itemData.movie.genre_ids);
            } catch (e) {
              itemData.movie.genres = [];
            }
          }
        }
        return itemData;
      });

      return successResponse(res, 'Watchlist retrieved successfully', {
        watchlist: processedWatchlist,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Error getting user watchlist:', error);
      return errorResponse(res, 'Failed to get user watchlist', 500);
    }
  }

  // POST /api/watchlist - Film hozzáadása watchlist-hez
  async addToWatchlist(req, res) {
    try {
      const { userId, movieId } = req.body;

      if (!userId || !movieId) {
        return errorResponse(res, 'userId and movieId are required', 400);
      }

      // Ellenőrizzük hogy létezik-e a felhasználó
      const user = await this.User.findByPk(userId);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      // Film keresése tmdb_id alapján
      const movie = await this.Movie.findOne({
        where: { tmdb_id: movieId }
      });

      if (!movie) {
        return errorResponse(res, 'Movie not found. Please load movie data first.', 404);
      }

      // Ellenőrizzük hogy már van-e a watchlist-en
      const existingWatchlistItem = await this.UserWatchlist.findOne({
        where: {
          user_id: userId,
          movie_id: movie.id
        }
      });

      if (existingWatchlistItem) {
        return errorResponse(res, 'Movie already in watchlist', 409);
      }

      // Hozzáadás watchlist-hez
      const watchlistItem = await this.UserWatchlist.create({
        user_id: userId,
        movie_id: movie.id,
        added_date: new Date()
      });

      // Automatikus LIKE interakció létrehozása (ha még nincs)
      const existingInteraction = await this.UserMovieInteraction.findOne({
        where: {
          user_id: userId,
          movie_id: movie.id
        }
      });

      if (!existingInteraction) {
        await this.UserMovieInteraction.create({
          user_id: userId,
          movie_id: movie.id,
          interaction_type: 'LIKE',
          interaction_date: new Date()
        });
      } else if (existingInteraction.interaction_type !== 'LIKE') {
        // Ha volt DISLIKE, frissítjük LIKE-ra
        await this.UserMovieInteraction.update(
          { 
            interaction_type: 'LIKE',
            interaction_date: new Date()
          },
          {
            where: {
              user_id: userId,
              movie_id: movie.id
            }
          }
        );
      }

      return successResponse(res, 'Movie added to watchlist successfully', {
        watchlistItem: watchlistItem,
        movie: {
          id: movie.id,
          tmdb_id: movie.tmdb_id,
          title: movie.title
        }
      });

    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return errorResponse(res, 'Failed to add movie to watchlist', 500);
    }
  }

  // DELETE /api/watchlist/:userId/:movieId - Film eltávolítása watchlist-ből
  async removeFromWatchlist(req, res) {
    try {
      const { userId, movieId } = req.params;

      // Film keresése tmdb_id alapján
      const movie = await this.Movie.findOne({
        where: { tmdb_id: movieId }
      });

      if (!movie) {
        return errorResponse(res, 'Movie not found', 404);
      }

      // Eltávolítás watchlist-ből
      const deleted = await this.UserWatchlist.destroy({
        where: {
          user_id: userId,
          movie_id: movie.id
        }
      });

      if (deleted === 0) {
        return errorResponse(res, 'Movie not found in watchlist', 404);
      }

      return successResponse(res, 'Movie removed from watchlist successfully', {
        removed: true,
        movie: {
          tmdb_id: movie.tmdb_id,
          title: movie.title
        }
      });

    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return errorResponse(res, 'Failed to remove movie from watchlist', 500);
    }
  }

  // GET /api/watchlist/:userId/stats - Watchlist statisztikák
  async getWatchlistStats(req, res) {
    try {
      const { userId } = req.params;

      // Összes film száma
      const totalMovies = await this.UserWatchlist.count({
        where: { user_id: userId }
      });

      // Műfaj statisztikák
      const watchlistWithGenres = await this.UserWatchlist.findAll({
        where: { user_id: userId },
        include: [{
          model: this.Movie,
          as: 'movie',
          attributes: ['genre_ids', 'runtime', 'release_date', 'vote_average']
        }]
      });

      // Statisztikák számítása
      const stats = {
        totalMovies: totalMovies,
        genres: {},
        averageRating: 0,
        averageRuntime: 0,
        decadeDistribution: {},
        addedThisWeek: 0,
        addedThisMonth: 0
      };

      let totalRating = 0;
      let totalRuntime = 0;
      let moviesWithRating = 0;
      let moviesWithRuntime = 0;

      // Dátum határok
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      watchlistWithGenres.forEach(item => {
        const movie = item.movie;
        const addedDate = new Date(item.added_date);

        // Hozzáadási időpont statisztikák
        if (addedDate >= oneWeekAgo) {
          stats.addedThisWeek++;
        }
        if (addedDate >= oneMonthAgo) {
          stats.addedThisMonth++;
        }

        // Rating statisztikák
        if (movie.vote_average && movie.vote_average > 0) {
          totalRating += movie.vote_average;
          moviesWithRating++;
        }

        // Runtime statisztikák
        if (movie.runtime && movie.runtime > 0) {
          totalRuntime += movie.runtime;
          moviesWithRuntime++;
        }

        // Évtized statisztikák
        if (movie.release_date) {
          const year = new Date(movie.release_date).getFullYear();
          const decade = Math.floor(year / 10) * 10;
          stats.decadeDistribution[decade] = (stats.decadeDistribution[decade] || 0) + 1;
        }

        // Műfaj statisztikák
        if (movie.genre_ids) {
          try {
            const genres = JSON.parse(movie.genre_ids);
            genres.forEach(genreId => {
              const genreName = this.getGenreName(genreId);
              stats.genres[genreName] = (stats.genres[genreName] || 0) + 1;
            });
          } catch (e) {
            // Hibás JSON esetén folytatjuk
          }
        }
      });

      // Átlagok számítása
      stats.averageRating = moviesWithRating > 0 ? 
        parseFloat((totalRating / moviesWithRating).toFixed(1)) : 0;
      
      stats.averageRuntime = moviesWithRuntime > 0 ? 
        Math.round(totalRuntime / moviesWithRuntime) : 0;

      return successResponse(res, 'Watchlist stats retrieved successfully', stats);

    } catch (error) {
      console.error('Error getting watchlist stats:', error);
      return errorResponse(res, 'Failed to get watchlist stats', 500);
    }
  }

  // Helper metódus - Műfaj ID-ból név
  getGenreName(genreId) {
    const genreMap = {
      28: 'Action',
      12: 'Adventure', 
      16: 'Animation',
      35: 'Comedy',
      80: 'Crime',
      99: 'Documentary',
      18: 'Drama',
      10751: 'Family',
      14: 'Fantasy',
      36: 'History',
      27: 'Horror',
      10402: 'Music',
      9648: 'Mystery',
      10749: 'Romance',
      878: 'Science Fiction',
      53: 'Thriller',
      10752: 'War',
      37: 'Western'
    };

    return genreMap[genreId] || 'Unknown';
  }
}

module.exports = WatchlistController;