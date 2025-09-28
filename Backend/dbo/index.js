require('dotenv').config();
const { Sequelize } = require('sequelize');

// DB kapcsolat létrehozása
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: console.log, // bekapcsoljuk hogy lássuk mit csinál
  }
);

// Modellek importálása - explicit index.js hivatkozással
const User = require('./user/index.js')(sequelize);
const Settings = require('./settings/index.js')(sequelize);

// Film rendszer modellek
const UserPreferences = require('./user-preferences/index.js')(sequelize);
const Movie = require('./movie/index.js')(sequelize);
const UserMovieInteraction = require('./user-movie-interaction/index.js')(sequelize);
const UserWatchlist = require('./user-watchlist/index.js')(sequelize);

// Modellek összegyűjtése
const models = {
  User,
  Settings,
  UserPreferences,
  Movie,
  UserMovieInteraction,
  UserWatchlist
};

// Asszociációk definiálása
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Backwards compatibility - export models directly AND in models object
module.exports = { 
  sequelize, 
  models,
  // Direct exports for backwards compatibility
  ...models
};
