const express = require('express');
const WatchlistController = require('../../../controllers/watchlist.controller');
const auth = require('../../../service/middlewares/auth.middleware');

function createWatchlistRouter(models) {
  const router = express.Router();
  const watchlistController = new WatchlistController(models);

  // GET /api/watchlist/:userId - Felhasználó watchlist-je
  router.get('/:userId',
    auth.authenticateToken,
    async (req, res) => {
      await watchlistController.getUserWatchlist(req, res);
    }
  );

  // POST /api/watchlist - Film hozzáadása watchlist-hez
  router.post('/',
    auth.authenticateToken,
    async (req, res) => {
      await watchlistController.addToWatchlist(req, res);
    }
  );

  // DELETE /api/watchlist/:userId/:movieId - Film eltávolítása watchlist-ből
  router.delete('/:userId/:movieId',
    auth.authenticateToken,
    async (req, res) => {
      await watchlistController.removeFromWatchlist(req, res);
    }
  );

  // GET /api/watchlist/:userId/stats - Watchlist statisztikák
  router.get('/:userId/stats',
    auth.authenticateToken,
    async (req, res) => {
      await watchlistController.getWatchlistStats(req, res);
    }
  );

  return router;
}

module.exports = createWatchlistRouter;