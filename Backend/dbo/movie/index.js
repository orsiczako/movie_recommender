const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Movie = sequelize.define('Movie', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    tmdb_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'TMDB API movie ID'
    },
    imdb_id: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'IMDB ID in tt1234567 format'
    },
    
    // Alap adatok
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'Movie title'
    },
    original_title: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Original movie title'
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1900,
        max: new Date().getFullYear() + 5
      }
    },
    release_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    
    // Értékelések
    tmdb_rating: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: true,
      validate: {
        min: 0.0,
        max: 10.0
      },
      comment: 'TMDB rating 0.0-10.0'
    },
    tmdb_vote_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    imdb_rating: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: true,
      validate: {
        min: 0.0,
        max: 10.0
      },
      comment: 'IMDB rating 0.0-10.0'
    },
    
    // Kategorizálás
    genres: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of genres like ["Action", "Comedy"]'
    },
    runtime_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 600
      }
    },
    
    // Leírások
    overview: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Movie plot summary'
    },
    tagline: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    
    // Média
    poster_path: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'TMDB poster path (e.g., /abc123.jpg)'
    },
    poster_url: {
      type: DataTypes.STRING(1000),
      allowNull: true,
      comment: 'TMDB poster image URL'
    },
    backdrop_path: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'TMDB backdrop path (e.g., /xyz789.jpg)'
    },
    backdrop_url: {
      type: DataTypes.STRING(1000),
      allowNull: true,
      comment: 'TMDB backdrop image URL'
    },
    
    // Nyelv és ország
    original_language: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'ISO 639-1 language code'
    },
    spoken_languages: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of language objects from TMDB'
    },
    production_countries: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of country objects from TMDB'
    },
    
    // Stáb
    director: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    cast_main: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Top 5 main actors from TMDB'
    },
    
    // Egyéb
    budget: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    revenue: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    popularity: {
      type: DataTypes.DECIMAL(8, 3),
      allowNull: true,
      comment: 'TMDB popularity score'
    },
    adult: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 0,
      comment: 'Adult content flag'
    }
  }, {
    tableName: 'movies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['tmdb_id']
      },
      {
        fields: ['year']
      },
      {
        fields: ['tmdb_rating']
      },
      {
        fields: ['runtime_minutes']
      },
      {
        fields: ['popularity']
      }
    ]
  });

  // Associations will be defined in dbo/index.js
  Movie.associate = function(models) {
    Movie.hasMany(models.UserMovieInteraction, {
      foreignKey: 'movie_id',
      as: 'interactions'
    });
    
    Movie.hasMany(models.UserWatchlist, {
      foreignKey: 'movie_id',
      as: 'watchlistEntries'
    });
  };

  return Movie;
};