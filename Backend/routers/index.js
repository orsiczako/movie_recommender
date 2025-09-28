const express = require('express');
const apiRouterFactory = require('./api');
const clientRouter = require('./client.router');

// Factory függvény, ami fogadja a modelleket
module.exports = (models) => {
  const router = express.Router();
  
  router.use('/api', apiRouterFactory(models));
  
  // Client router hozzáadása - SPA route-ok kiszolgálása
  router.use('/', clientRouter);
  
  return router;
};
