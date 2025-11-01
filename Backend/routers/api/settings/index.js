const express = require('express');
const { t, detectLocale } = require('../../../service/helpers/messages.helper');
const { authenticateToken } = require('../../../service/middlewares/auth.middleware');

module.exports = (SettingsModel) => {
  const router = express.Router();

  // GET /api/settings
  router.get('/', authenticateToken, async (req, res) => {
    const locale = detectLocale(req.headers);
    const userId = req.user.id;
    
    try {
      const setting = await SettingsModel.findOne({ where: { user_id: userId } });
      
      if (!setting) {
        // Ha nincs beállítás, adjunk vissza alapértelmezett értékeket
        const defaultSettings = {
          user_id: userId,
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
  router.post('/', authenticateToken, async (req, res) => {
    const locale = detectLocale(req.headers);
    const userId = req.user.id;
    
    console.log('[SETTINGS] POST request:', {
      userId,
      body: req.body,
      user: req.user
    });
    
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
      
      console.log('[SETTINGS] Update data:', updateData);
      
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

      // Először próbáljuk megkeresni a meglévő beállítást
      let setting = await SettingsModel.findOne({ where: { user_id: userId } });
      
      if (setting) {
        // Ha létezik, mindig frissítjük (explicit UPDATE)
        console.log('[SETTINGS] Updating existing setting with:', updateData);
        
        // Explicit UPDATE művelet az updated_at mező frissítésével
        const updateResult = await SettingsModel.update(
          { ...updateData, updated_at: new Date() },
          { 
            where: { user_id: userId },
            returning: true 
          }
        );
        
        console.log('[SETTINGS] Update result:', updateResult);
        
        // Újra lekérjük a frissített rekordot
        setting = await SettingsModel.findOne({ where: { user_id: userId } });
      } else {
        // Ha nem létezik, létrehozzuk
        console.log('[SETTINGS] Creating new setting with:', { user_id: userId, ...updateData });
        setting = await SettingsModel.create({ user_id: userId, ...updateData });
      }

      console.log('[SETTINGS] Final setting:', setting.toJSON());

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