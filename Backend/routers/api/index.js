const express = require('express');

// Factory routerek
const usersRouterFactory = require('./user');
const settingsRouterFactory = require('./settings');
const preferencesRouterFactory = require('./preferences');
const moviesRouterFactory = require('./movies');
const interactionsRouterFactory = require('./interactions');
const watchlistRouterFactory = require('./watchlist');
const recommendationsRouterFactory = require('./recommendations');

// Factory függvény, ami fogadja a modelleket
module.exports = (models) => {
  const router = express.Router();
  
  router.use('/user', usersRouterFactory(models.User));
  router.use('/settings', settingsRouterFactory(models.Settings));
  router.use('/preferences', preferencesRouterFactory(models));
  router.use('/movies', moviesRouterFactory(models));
  router.use('/interactions', interactionsRouterFactory(models));
  router.use('/watchlist', watchlistRouterFactory(models));
  router.use('/recommendations', recommendationsRouterFactory(models));

  return router;
};
