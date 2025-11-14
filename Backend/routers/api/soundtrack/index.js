const express = require('express');
const SoundtrackController = require('../../../controllers/soundtrack.controller');

function createSoundtrackRouter() {
  const router = express.Router();
  const soundtrackController = new SoundtrackController();

  // GET /api/soundtrack/:movieTitle - Get movie soundtrack from Spotify
  router.get('/:movieTitle',
    async (req, res) => {
      await soundtrackController.getMovieSoundtrack(req, res);
    }
  );

  return router;
}

module.exports = createSoundtrackRouter;
