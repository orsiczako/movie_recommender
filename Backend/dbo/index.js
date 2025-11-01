require('dotenv').config();
const { Sequelize } = require('sequelize');

// Database configuration with support for multiple dialects
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || (process.env.DB_TYPE === 'postgres' ? 5432 : 3306),
  dialect: process.env.DB_TYPE || 'mysql',
  logging: process.env.NODE_ENV === 'production' ? false : console.log,
};

// PostgreSQL specific SSL configuration for production
if (process.env.DB_TYPE === 'postgres' && process.env.NODE_ENV === 'production') {
  dbConfig.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
}

// DB kapcsolat létrehozása
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS || process.env.DB_PASSWORD,
  dbConfig
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
