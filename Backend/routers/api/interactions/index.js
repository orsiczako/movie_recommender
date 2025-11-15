const express = require('express');
const InteractionController = require('../../../controllers/interaction.controller');
const auth = require('../../../service/middlewares/auth.middleware');

function createInteractionRouter(models) {
  const router = express.Router();
  const interactionController = new InteractionController(models);

  // POST /api/interactions - Film swipe (LIKE/DISLIKE)
  router.post('/',
    // ÁTMENETILEG ELTÁVOLÍTOM AUTH-ot: auth.authenticateToken,
    async (req, res) => {
      await interactionController.swipeMovie(req, res);
    }
  );

  // GET /api/interactions/:userId - Felhasználó összes interakciója
  router.get('/:userId',
    // ÁTMENETILEG ELTÁVOLÍTOM AUTH-ot: auth.authenticateToken,
    async (req, res) => {
      await interactionController.getUserInteractions(req, res);
    }
  );

  // GET /api/interactions/:userId/stats - Felhasználó interakciós statisztikái
  router.get('/:userId/stats',
    auth.authenticateToken,
    async (req, res) => {
      await interactionController.getUserInteractionStats(req, res);
    }
  );

  // DELETE /api/interactions/:userId/favorites - Összes kedvenc törlése (ezt előre kell tenni!)
  router.delete('/:userId/favorites',
    // ÁTMENETILEG ELTÁVOLÍTOM AUTH-ot: auth.authenticateToken,
    async (req, res) => {
      await interactionController.clearAllFavorites(req, res);
    }
  );

  // DELETE /api/interactions/:userId/:movieId - Interakció törlése
  router.delete('/:userId/:movieId',
    auth.authenticateToken,
    async (req, res) => {
      await interactionController.removeInteraction(req, res);
    }
  );

  // PATCH /api/interactions/:userId/item - Update a watchlist item (e.g., watched status)
  router.patch('/:userId/item',
    // auth.authenticateToken, // Consider re-enabling authentication
    async (req, res) => {
      await interactionController.updateWatchlistItem(req, res);
    }
  );

  return router;
}

module.exports = createInteractionRouter;