const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserPreferences = sequelize.define('UserPreferences', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      unique: true,
      allowNull: false,
      references: {
        model: 'account',
        key: 'account_id'
      },
      onDelete: 'CASCADE',
      comment: 'Reference to account table'
    },
    
    // Műfaj preferenciák (bináris: 1=szereti, 0=nem szereti, NULL=nem állította be)
    genre_action: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: null
    },
    genre_adventure: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: null
    },
    genre_animation: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: null
    },
    genre_comedy: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: null
    },
    genre_crime: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: null
    },
    genre_documentary: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: null
    },
    genre_drama: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: null
    },
    genre_family: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: null
    },
    genre_fantasy: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: null
    },
    genre_history: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: null
    },
    genre_horror: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: null
    },
    genre_music: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: null
    },
    genre_mystery: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: null
    },
    genre_romance: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: null
    },
    genre_science_fiction: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: null
    },
    genre_thriller: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: null
    },
    genre_war: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: null
    },
    genre_western: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: null
    },
    
    // Új műfajok
    genre_anime: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: null
    },
    
    // Időszak preferenciák
    min_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1900,
      validate: {
        min: 1900,
        max: new Date().getFullYear()
      }
    },
    max_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: new Date().getFullYear(),
      validate: {
        min: 1900,
        max: new Date().getFullYear() + 5
      }
    },
    
    // Értékelés preferenciák
    min_rating: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: true,
      defaultValue: 0.0,
      validate: {
        min: 0.0,
        max: 10.0
      },
      comment: 'Minimum TMDB/IMDB rating 0.0-10.0'
    },
    
    // Futási idő preferenciák
    runtime_preference: {
      type: DataTypes.ENUM('short', 'medium', 'long', 'any'),
      allowNull: true,
      defaultValue: 'any',
      comment: 'short: <90 min, medium: 90-150 min, long: >150 min'
    },
    
    // Nyelvi preferenciák
    preferred_languages: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      comment: 'Array of language codes like ["en", "hu", "de"]'
    },
    
    // Évszázad/évtized preferenciák
    prefer_classic: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 0,
      comment: 'Prefer movies before 1980'
    },
    prefer_modern: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 1,
      comment: 'Prefer movies after 2000'
    },
    prefer_recent: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 1,
      comment: 'Prefer movies after 2015'
    },
    
    // Gyerek mód - korhatáros tartalom szűrése
    child_mode: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 0,
      comment: 'Enable child mode - show only movies suitable for children 12 and under'
    }
  }, {
    tableName: 'user_preferences',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['user_id']
      }
    ]
  });

  // Associations will be defined in dbo/index.js
  UserPreferences.associate = function(models) {
    UserPreferences.belongsTo(models.User, {
      foreignKey: 'user_id',
      targetKey: 'account_id',
      as: 'user'
    });
  };

  return UserPreferences;
};