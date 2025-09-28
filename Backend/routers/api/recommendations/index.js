const express = require('express');
const RecommendationController = require('../../../controllers/recommendation.controller');
const auth = require('../../../service/middlewares/auth.middleware');

function createRecommendationRouter(models) {
  const router = express.Router();
  const recommendationController = new RecommendationController(models);

  // GET /api/recommendations/:userId - Személyre szabott film ajánlások
  router.get('/:userId',
    auth.authenticateToken,
    async (req, res) => {
      await recommendationController.getPersonalizedRecommendations(req, res);
    }
  );

  // GET /api/recommendations/:userId/similar/:movieId - Hasonló filmek
  router.get('/:userId/similar/:movieId',
    auth.authenticateToken,
    async (req, res) => {
      await recommendationController.getSimilarMovies(req, res);
    }
  );

  // GET /api/recommendations/:userId/trending - Trending filmek személyre szabva
  router.get('/:userId/trending',
    auth.authenticateToken,
    async (req, res) => {
      await recommendationController.getPersonalizedTrending(req, res);
    }
  );

  // GET /api/recommendations/:userId/discovery - Felfedezés új műfajokban
  router.get('/:userId/discovery',
    auth.authenticateToken,
    async (req, res) => {
      await recommendationController.getDiscoveryRecommendations(req, res);
    }
  );

  return router;
}

module.exports = createRecommendationRouter;