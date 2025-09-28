const express = require('express');
const { t, detectLocale } = require('../../../service/helpers/messages.helper');

module.exports = (SettingsModel) => {
  const router = express.Router();

  // GET /api/settings
  router.get('/', async (req, res) => {
    const locale = detectLocale(req.headers);
    
    try {
      const setting = await SettingsModel.findOne({ where: { user_id: 1 } });
      
      if (!setting) {
        // Ha nincs beállítás, adjunk vissza alapértelmezett értékeket
        const defaultSettings = {
          language: 'hu',
          theme: 'light',
          auto_save_interval: 60,
          results_per_page: 25,
          animation_speed: 'normal'
        };
        return res.json(defaultSettings);
      }
      
      return res.json(setting.toJSON());
    } catch (err) {
      console.error('[SETTINGS] GET error:', err);
      return res.status(500).json({ message: t(locale, 'user.errors.server_error') });
    }
  });

  // POST /api/settings
  router.post('/', async (req, res) => {
    const locale = detectLocale(req.headers);
    
    try {
      const allowedFields = [
        'language', 'theme', 'auto_save_interval', 'results_per_page', 'animation_speed'
      ];
      
      // Csak az engedélyezett mezőket vegyük figyelembe
      const updateData = {};
      for (const field of allowedFields) {
        if (req.body.hasOwnProperty(field)) {
          updateData[field] = req.body[field];
        }
      }
      
      // Validációk
      if (updateData.language && !['en', 'hu'].includes(updateData.language)) {
        return res.status(400).json({ message: 'Invalid language. Use "en" or "hu".' });
      }
      
      if (updateData.theme && !['light', 'dark'].includes(updateData.theme)) {
        return res.status(400).json({ message: 'Invalid theme. Use "light" or "dark".' });
      }
      
      if (updateData.animation_speed && !['slow', 'normal', 'fast', 'off'].includes(updateData.animation_speed)) {
        return res.status(400).json({ message: 'Invalid animation speed.' });
      }

      const [setting, created] = await SettingsModel.findOrCreate({
        where: { user_id: 1 },
        defaults: { user_id: 1, ...updateData }
      });

      if (!created) {
        // Frissítjük a meglévő beállításokat
        await setting.update(updateData);
      }

      return res.json({ 
        success: true, 
        settings: setting.toJSON(),
        message: t(locale, 'common.ok')
      });
    } catch (err) {
      console.error('[SETTINGS] POST error:', err);
      return res.status(500).json({ message: t(locale, 'user.errors.server_error') });
    }
  });

  return router;
};