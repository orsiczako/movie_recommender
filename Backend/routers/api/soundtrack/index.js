const express = require('express');
const SoundtrackController = require('../../../controllers/soundtrack.controller');

function createSoundtrackRouter() {
  const router = express.Router();
  const soundtrackController = new SoundtrackController();

  // Support both query-based: GET /api/soundtrack?originalTitle=...&movieYear=...
  // and path-based:   GET /api/soundtrack/:movieTitle
  router.get('/', async (req, res) => {
    await soundtrackController.getMovieSoundtrack(req, res);
  });

  router.get('/:movieTitle', async (req, res) => {
    await soundtrackController.getMovieSoundtrack(req, res);
  });

  return router;
}

module.exports = createSoundtrackRouter;
