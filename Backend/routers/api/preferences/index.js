const express = require('express');
const PreferencesController = require('../../../controllers/preferences.controller');
const auth = require('../../../service/middlewares/auth.middleware');

function createPreferencesRouter(models) {
  const router = express.Router();
  const preferencesController = new PreferencesController(models);

  // GET /api/preferences/:userId - Felhasználó preferenciáinak lekérése
  router.get('/:userId', 
    async (req, res) => {
      await preferencesController.getPreferences(req, res);
    }
  );

  // POST /api/preferences - Preferenciák létrehozása/frissítése
  router.post('/',
    async (req, res) => {
      await preferencesController.setPreferences(req, res);
    }
  );

  // PUT /api/preferences/:userId - Preferenciák részleges frissítése
  router.put('/:userId',
    async (req, res) => {
      await preferencesController.updatePreferences(req, res);
    }
  );

  // DELETE /api/preferences/:userId - Preferenciák törlése (reset)
  router.delete('/:userId',
    async (req, res) => {
      await preferencesController.deletePreferences(req, res);
    }
  );

  return router;
}

module.exports = createPreferencesRouter;