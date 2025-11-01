const express = require('express');
const MovieController = require('../../../controllers/movie.controller');
const YearRangeHelper = require('../../../service/helpers/year-range.helper');
const auth = require('../../../service/middlewares/auth.middleware');

function createMovieRouter(models) {
  const router = express.Router();
  const movieController = new MovieController(models);

  // GET /api/movies/search - Filmek keresése
  router.get('/search',
    async (req, res) => {
      await movieController.searchMovies(req, res);
    }
  );

  // GET /api/movies/discover - Filmek felfedezése preferenciák alapján
  router.get('/discover',
    async (req, res) => {
      await movieController.discoverMovies(req, res);
    }
  );

  // GET /api/movies/popular - Népszerű filmek
  router.get('/popular',
    async (req, res) => {
      await movieController.getPopularMovies(req, res);
    }
  );

  // GET /api/movies/trending - Trending filmek
  router.get('/trending',
    async (req, res) => {
      await movieController.getTrendingMovies(req, res);
    }
  );

  // GET /api/movies/:movieId - Film részletek
  router.get('/:movieId',
    async (req, res) => {
      await movieController.getMovieDetails(req, res);
    }
  );

  // POST /api/movies/set-year-range - Év tartomány beállítása
  router.post('/set-year-range',
    async (req, res) => {
      try {
        const { userId, fromYear, toYear, preset } = req.body;
        
        if (!userId) {
          return res.status(400).json({ success: false, message: 'userId is required' });
        }

        const result = await YearRangeHelper.setYearRange(userId, fromYear, toYear, preset);
        return res.json({ success: true, data: result });
        
      } catch (error) {
        console.error('Error setting year range:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
      }
    }
  );

  return router;
}

module.exports = createMovieRouter;