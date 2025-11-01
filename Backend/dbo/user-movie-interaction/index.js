const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserMovieInteraction = sequelize.define('UserMovieInteraction', {
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
    
    // Interakció típusa
    interaction_type: {
      type: DataTypes.ENUM('LIKE', 'DISLIKE'),
      allowNull: false,
      comment: 'User swipe action: LIKE (right swipe) or DISLIKE (left swipe)'
    }
  }, {
    tableName: 'user_movie_interactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, // Nem kell updated_at, ez fix interakció
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'movie_id'],
        name: 'unique_user_movie'
      },
      {
        fields: ['user_id', 'created_at'],
        name: 'idx_user_interactions'
      },
      {
        fields: ['movie_id', 'interaction_type'],
        name: 'idx_movie_interactions'
      }
    ]
  });

  // Associations will be defined in dbo/index.js
  UserMovieInteraction.associate = function(models) {
    UserMovieInteraction.belongsTo(models.User, {
      foreignKey: 'user_id',
      targetKey: 'account_id',
      as: 'user'
    });
    
    UserMovieInteraction.belongsTo(models.Movie, {
      foreignKey: 'movie_id',
      as: 'movie'
    });
  };

  return UserMovieInteraction;
};