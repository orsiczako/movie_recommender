const { successResponse, errorResponse } = require('../service/helpers/api-response.helper');
const axios = require('axios');

class RecommendationController {
  constructor(models) {
    this.UserPreferences = models.UserPreferences;
    this.UserMovieInteraction = models.UserMovieInteraction;
    this.UserWatchlist = models.UserWatchlist;
    this.Movie = models.Movie;
    this.User = models.User;
    
    this.tmdbBaseUrl = 'https://api.themoviedb.org/3';
    this.tmdbApiKey = process.env.TMDB_API_KEY;
    this.tmdbImageBaseUrl = 'https://image.tmdb.org/t/p/w500';
  }

  // GET /api/recommendations/:userId - Személyre szabott film ajánlások
  async getPersonalizedRecommendations(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 20, excludeWatched = true } = req.query;

      if (!this.tmdbApiKey) {
        return errorResponse(res, 'TMDB API key not configured', 500);
      }

      // Felhasználó preferenciáinak és interakcióinak lekérése
      const userProfile = await this.getUserProfile(userId);
      
      if (!userProfile) {
        return errorResponse(res, 'User not found', 404);
      }

      // Intelligens ajánlás algoritmus
      const recommendations = await this.generateRecommendations(
        userProfile, 
        parseInt(limit), 
        excludeWatched === 'true'
      );

      return successResponse(res, 'Personalized recommendations generated', {
        recommendations: recommendations,
        userProfile: {
          totalInteractions: userProfile.totalInteractions,
          likeRatio: userProfile.likeRatio,
          topGenres: userProfile.topGenres,
          hasPreferences: userProfile.hasPreferences
        }
      });

    } catch (error) {
      console.error('Error generating recommendations:', error);
      return errorResponse(res, 'Failed to generate recommendations', 500);
    }
  }

  // GET /api/recommendations/:userId/similar/:movieId - Hasonló filmek
  async getSimilarMovies(req, res) {
    try {
      const { userId, movieId } = req.params;
      const { limit = 10 } = req.query;

      // Film lekérése
      const movie = await this.Movie.findOne({
        where: { tmdb_id: movieId }
      });

      if (!movie) {
        return errorResponse(res, 'Movie not found', 404);
      }

      // TMDB similar movies API
      const response = await axios.get(`${this.tmdbBaseUrl}/movie/${movieId}/similar`, {
        params: {
          api_key: this.tmdbApiKey,
          language: 'en-US',
          page: 1
        }
      });

      // Filmek feldolgozása és cache-elése
      let similarMovies = await this.processAndCacheMovies(response.data.results);

      // Felhasználói szűrések alkalmazása
      if (userId !== 'guest') {
        similarMovies = await this.applyUserFilters(userId, similarMovies);
      }

      // Limit alkalmazása
      similarMovies = similarMovies.slice(0, parseInt(limit));

      return successResponse(res, 'Similar movies found', {
        baseMovie: {
          tmdb_id: movie.tmdb_id,
          title: movie.title
        },
        similarMovies: similarMovies
      });

    } catch (error) {
      console.error('Error getting similar movies:', error);
      return errorResponse(res, 'Failed to get similar movies', 500);
    }
  }

  // GET /api/recommendations/:userId/trending - Trending filmek személyre szabva
  async getPersonalizedTrending(req, res) {
    try {
      const { userId } = req.params;
      const { timeWindow = 'week', limit = 20 } = req.query;

      // TMDB trending API
      const response = await axios.get(`${this.tmdbBaseUrl}/trending/movie/${timeWindow}`, {
        params: {
          api_key: this.tmdbApiKey,
          language: 'en-US'
        }
      });

      // Filmek feldolgozása
      let trendingMovies = await this.processAndCacheMovies(response.data.results);

      // Felhasználói preferenciák alapján scoring
      if (userId !== 'guest') {
        const userProfile = await this.getUserProfile(userId);
        if (userProfile) {
          trendingMovies = await this.scoreMoviesForUser(userProfile, trendingMovies);
          // Pontszám szerint rendezés
          trendingMovies.sort((a, b) => (b.userScore || 0) - (a.userScore || 0));
        }
      }

      // Limit alkalmazása
      trendingMovies = trendingMovies.slice(0, parseInt(limit));

      return successResponse(res, 'Personalized trending movies', {
        movies: trendingMovies,
        timeWindow: timeWindow
      });

    } catch (error) {
      console.error('Error getting personalized trending:', error);
      return errorResponse(res, 'Failed to get personalized trending movies', 500);
    }
  }

  // GET /api/recommendations/:userId/discovery - Felfedezés új műfajokban
  async getDiscoveryRecommendations(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 15 } = req.query;

      const userProfile = await this.getUserProfile(userId);
      
      if (!userProfile) {
        return errorResponse(res, 'User not found', 404);
      }

      // Kevésbé preferált vagy új műfajok keresése
      const discoveryGenres = this.getDiscoveryGenres(userProfile);

      if (discoveryGenres.length === 0) {
        return successResponse(res, 'No new genres to discover', {
          movies: [],
          message: 'User has explored most genres'
        });
      }

      // TMDB discover API új műfajokkal
      const response = await axios.get(`${this.tmdbBaseUrl}/discover/movie`, {
        params: {
          api_key: this.tmdbApiKey,
          language: 'en-US',
          sort_by: 'vote_average.desc',
          'vote_count.gte': 100, // Minimum 100 szavazat
          'vote_average.gte': 7.0, // Minimum 7.0 rating
          with_genres: discoveryGenres.slice(0, 3).join(','), // Max 3 műfaj
          page: 1
        }
      });

      let discoveryMovies = await this.processAndCacheMovies(response.data.results);
      
      // Már ismert filmek kiszűrése
      discoveryMovies = await this.applyUserFilters(userId, discoveryMovies);
      
      // Limit alkalmazása
      discoveryMovies = discoveryMovies.slice(0, parseInt(limit));

      return successResponse(res, 'Discovery recommendations generated', {
        movies: discoveryMovies,
        discoveryGenres: discoveryGenres.map(id => this.getGenreName(id)),
        message: 'Explore new genres you might enjoy'
      });

    } catch (error) {
      console.error('Error getting discovery recommendations:', error);
      return errorResponse(res, 'Failed to get discovery recommendations', 500);
    }
  }

  // Helper metódusok

  // Felhasználói profil összegyűjtése
  async getUserProfile(userId) {
    try {
      const user = await this.User.findByPk(userId);
      if (!user) return null;

      // Preferenciák
      const preferences = await this.UserPreferences.findOne({
        where: { user_id: userId }
      });

      // Interakciók
      const interactions = await this.UserMovieInteraction.findAll({
        where: { user_id: userId },
        include: [{
          model: this.Movie,
          as: 'movie',
          attributes: ['genre_ids', 'vote_average', 'release_date']
        }]
      });

      // Watchlist
      const watchlistCount = await this.UserWatchlist.count({
        where: { user_id: userId }
      });

      // Profil elemzés
      const profile = {
        userId: userId,
        hasPreferences: !!preferences,
        preferences: preferences,
        totalInteractions: interactions.length,
        likedMovies: interactions.filter(i => i.interaction_type === 'LIKE'),
        dislikedMovies: interactions.filter(i => i.interaction_type === 'DISLIKE'),
        watchlistCount: watchlistCount,
        topGenres: [],
        likeRatio: 0,
        averageRating: 0,
        preferredYears: null
      };

      if (interactions.length > 0) {
        const likes = profile.likedMovies.length;
        profile.likeRatio = (likes / interactions.length) * 100;

        // Műfaj preferenciák kinyerése
        profile.topGenres = this.extractGenrePreferences(profile.likedMovies);

        // Átlag rating számítása
        const ratingsSum = profile.likedMovies.reduce((sum, interaction) => {
          return sum + (interaction.movie?.vote_average || 0);
        }, 0);
        profile.averageRating = likes > 0 ? ratingsSum / likes : 0;

        // Preferált évek
        profile.preferredYears = this.extractYearPreferences(profile.likedMovies);
      }

      return profile;

    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Ajánlások generálása
  async generateRecommendations(userProfile, limit, excludeWatched) {
    try {
      let allRecommendations = [];

      // 1. Preferencia alapú ajánlások (40%)
      if (userProfile.hasPreferences) {
        const prefRecommendations = await this.getPreferenceBasedRecommendations(userProfile);
        allRecommendations.push(...prefRecommendations.slice(0, Math.ceil(limit * 0.4)));
      }

      // 2. Hasonló ízlés alapú ajánlások (35%)
      if (userProfile.likedMovies.length > 0) {
        const tasteRecommendations = await this.getTasteBasedRecommendations(userProfile);
        allRecommendations.push(...tasteRecommendations.slice(0, Math.ceil(limit * 0.35)));
      }

      // 3. Népszerű filmek felhasználó ízlése szerint (20%)
      const popularRecommendations = await this.getPopularRecommendations(userProfile);
      allRecommendations.push(...popularRecommendations.slice(0, Math.ceil(limit * 0.2)));

      // 4. Felfedezés (5%)
      const discoveryRecommendations = await this.getDiscoveryRecommendationsInternal(userProfile);
      allRecommendations.push(...discoveryRecommendations.slice(0, Math.ceil(limit * 0.05)));

      // Duplikátumok eltávolítása
      const uniqueRecommendations = this.removeDuplicates(allRecommendations);

      // Felhasználói szűrések
      let filteredRecommendations = excludeWatched ? 
        await this.applyUserFilters(userProfile.userId, uniqueRecommendations) :
        uniqueRecommendations;

      // Scoring és rendezés
      filteredRecommendations = await this.scoreMoviesForUser(userProfile, filteredRecommendations);
      filteredRecommendations.sort((a, b) => (b.userScore || 0) - (a.userScore || 0));

      return filteredRecommendations.slice(0, limit);

    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  // Preferencia alapú ajánlások
  async getPreferenceBasedRecommendations(userProfile) {
    const preferences = userProfile.preferences;
    if (!preferences) return [];

    const discoverParams = {
      api_key: this.tmdbApiKey,
      language: 'en-US',
      sort_by: 'vote_average.desc',
      'vote_count.gte': 50,
      page: 1
    };

    // Preferenciák alkalmazása
    if (preferences.min_year) {
      discoverParams['primary_release_date.gte'] = `${preferences.min_year}-01-01`;
    }
    if (preferences.max_year) {
      discoverParams['primary_release_date.lte'] = `${preferences.max_year}-12-31`;
    }
    if (preferences.min_rating) {
      discoverParams['vote_average.gte'] = preferences.min_rating;
    }

    // Preferált műfajok
    const preferredGenres = this.getPreferredGenresFromPreferences(preferences);
    if (preferredGenres.length > 0) {
      discoverParams.with_genres = preferredGenres.join(',');
    }

    const response = await axios.get(`${this.tmdbBaseUrl}/discover/movie`, {
      params: discoverParams
    });

    return await this.processAndCacheMovies(response.data.results);
  }

















  // Ízlés alapú ajánlások
  async getTasteBasedRecommendations(userProfile) {
    // Top liked filmekből hasonló filmek keresése
    const topLikedMovies = userProfile.likedMovies
      .sort((a, b) => (b.movie?.vote_average || 0) - (a.movie?.vote_average || 0))
      .slice(0, 3);

    let recommendations = [];

    for (const interaction of topLikedMovies) {
      try {
        const response = await axios.get(
          `${this.tmdbBaseUrl}/movie/${interaction.movie.tmdb_id}/recommendations`,
          {
            params: {
              api_key: this.tmdbApiKey,
              language: 'en-US',
              page: 1
            }
          }
        );

        const similarMovies = await this.processAndCacheMovies(response.data.results);
        recommendations.push(...similarMovies.slice(0, 5));
      } catch (error) {
        console.error('Error getting taste recommendations:', error);
      }
    }

    return recommendations;
  }

  // Népszerű ajánlások
  async getPopularRecommendations(userProfile) {
    const response = await axios.get(`${this.tmdbBaseUrl}/movie/popular`, {
      params: {
        api_key: this.tmdbApiKey,
        language: 'en-US',
        page: 1
      }
    });

    return await this.processAndCacheMovies(response.data.results);
  }

  // Felfedezési ajánlások (belső)
  async getDiscoveryRecommendationsInternal(userProfile) {
    const discoveryGenres = this.getDiscoveryGenres(userProfile);
    
    if (discoveryGenres.length === 0) return [];

    const response = await axios.get(`${this.tmdbBaseUrl}/discover/movie`, {
      params: {
        api_key: this.tmdbApiKey,
        language: 'en-US',
        sort_by: 'popularity.desc',
        with_genres: discoveryGenres.slice(0, 2).join(','),
        'vote_average.gte': 6.5,
        page: 1
      }
    });

    return await this.processAndCacheMovies(response.data.results);
  }

  // Filmek feldolgozása és cache-elése (átvéve MovieController-ből)
  async processAndCacheMovies(tmdbMovies) {
    const processedMovies = [];

    for (const tmdbMovie of tmdbMovies) {
      let movie = await this.Movie.findOne({
        where: { tmdb_id: tmdbMovie.id }
      });

      if (!movie) {
        movie = await this.Movie.create({
          tmdb_id: tmdbMovie.id,
          title: tmdbMovie.title,
          original_title: tmdbMovie.original_title,
          overview: tmdbMovie.overview,
          release_date: tmdbMovie.release_date || null,
          poster_path: tmdbMovie.poster_path,
          backdrop_path: tmdbMovie.backdrop_path,
          vote_average: tmdbMovie.vote_average || 0,
          vote_count: tmdbMovie.vote_count || 0,
          popularity: tmdbMovie.popularity || 0,
          genre_ids: JSON.stringify(tmdbMovie.genre_ids || []),
          adult: tmdbMovie.adult || false,
          original_language: tmdbMovie.original_language || 'en'
        });
      }

      const movieData = movie.toJSON();
      movieData.poster_url = movieData.poster_path ? 
        `${this.tmdbImageBaseUrl}${movieData.poster_path}` : null;
      movieData.backdrop_url = movieData.backdrop_path ? 
        `${this.tmdbImageBaseUrl}${movieData.backdrop_path}` : null;

      processedMovies.push(movieData);
    }

    return processedMovies;
  }

  // Felhasználói szűrések (már látott filmek kiszűrése + gyerek mód)
  async applyUserFilters(userId, movies) {
    // Felhasználó preferenciáinak lekérése (child_mode ellenőrzéshez)
    const preferences = await this.UserPreferences.findOne({
      where: { user_id: userId }
    });

    const interactedMovieIds = await this.UserMovieInteraction.findAll({
      where: { user_id: userId },
      include: [{
        model: this.Movie,
        as: 'movie',
        attributes: ['tmdb_id']
      }]
    });

    const interactedTmdbIds = new Set(
      interactedMovieIds.map(interaction => interaction.movie.tmdb_id)
    );

    let filteredMovies = movies.filter(movie => !interactedTmdbIds.has(movie.tmdb_id));

    // Gyerek mód szűrés - agresszív szűrés a biztonság érdekében
    if (preferences && preferences.child_mode === 1) {
      filteredMovies = filteredMovies.filter(movie => {
        // Felnőtt tartalom kizárása
        if (movie.adult === true) return false;
        
        // Problémás műfajok kizárása: Horror, Thriller, Crime
        const badGenres = [27, 53, 80]; // Horror, Thriller, Crime
        if (movie.genre_ids && movie.genre_ids.some(id => badGenres.includes(id))) return false;
        
        // Minimum szavazat szám ellenőrzése (csökkentve)
        if (movie.vote_count && movie.vote_count < 50) return false;
        
        // Minimum rating ellenőrzése (csökkentve)
        if (movie.vote_average && movie.vote_average < 5.5) return false;
        
        // Családbarát műfajok ellenőrzése - legalább egy kell VAGY nincs műfaj info
        const familyGenres = [16, 35, 10751, 14, 12, 28, 99]; // Animation, Comedy, Family, Fantasy, Adventure, Action, Documentary
        if (movie.genre_ids && movie.genre_ids.length > 0) {
          // Ha van műfaj info, akkor legalább egy családbarátnak kell lennie
          if (!movie.genre_ids.some(id => familyGenres.includes(id))) return false;
        }
        // Ha nincs műfaj info, akkor elfogadjuk (a TMDB API már szűrt)
        
        return true;
      });
    }

    return filteredMovies;
  }

  // Filmek pontozása felhasználó számára
  async scoreMoviesForUser(userProfile, movies) {
    return movies.map(movie => {
      let score = 0;

      // Alappontszám: TMDB rating
      score += (movie.vote_average || 0) * 10;

      // Műfaj egyezések
      if (movie.genre_ids) {
        try {
          const movieGenres = JSON.parse(movie.genre_ids);
          const genreMatches = movieGenres.filter(genreId => 
            userProfile.topGenres.includes(genreId)
          ).length;
          score += genreMatches * 20;
        } catch (e) {
          // JSON parse error esetén folytatjuk
        }
      }

      // Év preferencia
      if (movie.release_date && userProfile.preferredYears) {
        const movieYear = new Date(movie.release_date).getFullYear();
        const yearDiff = Math.abs(movieYear - userProfile.preferredYears.average);
        score += Math.max(0, 20 - yearDiff); // Minél közelebb az átlaghoz, annál jobb
      }

      // Népszerűség boost
      score += (movie.popularity || 0) * 0.1;

      movie.userScore = Math.round(score);
      return movie;
    });
  }

  // Helper metódusok a profil elemzéshez
  extractGenrePreferences(likedMovies) {
    const genreCounts = {};
    
    likedMovies.forEach(interaction => {
      if (interaction.movie && interaction.movie.genre_ids) {
        try {
          const genres = JSON.parse(interaction.movie.genre_ids);
          genres.forEach(genreId => {
            genreCounts[genreId] = (genreCounts[genreId] || 0) + 1;
          });
        } catch (e) {
          // JSON parse error esetén folytatjuk
        }
      }
    });

    return Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => parseInt(entry[0]));
  }

  extractYearPreferences(likedMovies) {
    const years = likedMovies
      .map(interaction => {
        if (interaction.movie && interaction.movie.release_date) {
          return new Date(interaction.movie.release_date).getFullYear();
        }
        return null;
      })
      .filter(year => year !== null);

    if (years.length === 0) return null;

    const average = years.reduce((sum, year) => sum + year, 0) / years.length;
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    return { average: Math.round(average), min: minYear, max: maxYear };
  }

  getDiscoveryGenres(userProfile) {
    const allGenres = [28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402, 9648, 10749, 878, 53, 10752, 37];
    const userTopGenres = userProfile.topGenres || [];
    
    // Kevésbé preferált műfajok
    return allGenres.filter(genreId => !userTopGenres.includes(genreId));
  }

  getPreferredGenresFromPreferences(preferences) {
    const genreMapping = {
      genre_action: 28, genre_adventure: 12, genre_animation: 16, genre_comedy: 35,
      genre_crime: 80, genre_documentary: 99, genre_drama: 18, genre_family: 10751,
      genre_fantasy: 14, genre_history: 36, genre_horror: 27, genre_music: 10402,
      genre_mystery: 9648, genre_romance: 10749, genre_science_fiction: 878,
      genre_thriller: 53, genre_war: 10752, genre_western: 37,
      // Új műfajok
      genre_anime: 16 // Animation kategória
    };

    const preferredGenres = [];
    for (const [prefKey, tmdbGenreId] of Object.entries(genreMapping)) {
      if (preferences[prefKey] === 1) {
        if (Array.isArray(tmdbGenreId)) {
          preferredGenres.push(...tmdbGenreId);
        } else {
          preferredGenres.push(tmdbGenreId);
        }
      }
    }

    // Duplikátumok eltávolítása
    return [...new Set(preferredGenres)];
  }



  removeDuplicates(movies) {
    const seen = new Set();
    return movies.filter(movie => {
      if (seen.has(movie.tmdb_id)) {
        return false;
      }
      seen.add(movie.tmdb_id);
      return true;
    });
  }

  getGenreName(genreId) {
    const genreMap = {
      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
      99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
      27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
      53: 'Thriller', 10752: 'War', 37: 'Western'
    };
    return genreMap[genreId] || 'Unknown';
  }
}

module.exports = RecommendationController;