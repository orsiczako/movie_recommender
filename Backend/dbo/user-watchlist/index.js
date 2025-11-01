const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserWatchlist = sequelize.define('UserWatchlist', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'account',
        key: 'account_id'
      },
      onDelete: 'CASCADE',
      comment: 'Reference to account table'
    },
    movie_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'movies',
        key: 'id'
      },
      onDelete: 'CASCADE',
      comment: 'Reference to movies table'
    },
    
    // Státusz
    watched: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: '0=not watched yet, 1=already watched'
    },
    user_rating: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: true,
      validate: {
        min: 0.0,
        max: 10.0
      },
      comment: 'User personal rating 0.0-10.0'
    },
    
    // Meta
    added_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'When movie was added to watchlist (usually via LIKE)'
    },
    watched_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When user marked movie as watched'
    }
  }, {
    tableName: 'user_watchlist',
    timestamps: false, // Custom timestamps: added_at, watched_at
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'movie_id'],
        name: 'unique_user_watchlist'
      },
      {
        fields: ['user_id', 'watched'],
        name: 'idx_user_watchlist'
      },
      {
        fields: ['added_at'],
        name: 'idx_added_date'
      }
    ]
  });

  // Associations will be defined in dbo/index.js
  UserWatchlist.associate = function(models) {
    UserWatchlist.belongsTo(models.User, {
      foreignKey: 'user_id',
      targetKey: 'account_id',
      as: 'user'
    });
    
    UserWatchlist.belongsTo(models.Movie, {
      foreignKey: 'movie_id',
      as: 'movie'
    });
  };

  return UserWatchlist;
};