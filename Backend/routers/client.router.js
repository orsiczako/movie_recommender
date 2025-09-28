/**
 * Frontend router
 *
 * itt kezeljük a frontendhez tartozó statikus fájlokat és az SPA route-okat
 */

const path = require('path');
const express = require('express');
const router = express.Router();

const frontendHome = path.resolve(__dirname, '../../Frontend'); 
const indexFile = path.join(frontendHome, 'index.html');

// SPA routes - ezeket mind az index.html-nek kell kiszolgálni
const spaRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/dashboard',
  '/preferences',
  '/profile',
  '/settings'
];

// SPA route handler
router.get(spaRoutes, (req, res, next) => {
  res.sendFile(indexFile, (err) => {
    if (err) next(err);
  });
});

// Statikus fájlok kiszolgálása
router.use(express.static(frontendHome));

module.exports = router;
