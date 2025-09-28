const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    account_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: 'Account identifier'
    },
    login_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Name used for login'
    },
    login_password_hash: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Hash for the account password'
    },
    password_recovery_expires: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'The recovery code can not be used beyond this date'
    },
    password_recovery_hash: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'The hash of the last sent recovery code'
    },
    email_address: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'User email address'
    },
    full_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Full name for the user'
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'User bio/description'
    }
  }, {
    tableName: 'account',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  User.associate = function(models) {
    User.hasOne(models.Settings, {
      foreignKey: 'user_id',
      sourceKey: 'account_id',
      as: 'settings'
    });

    User.hasOne(models.UserPreferences, {
      foreignKey: 'user_id',
      sourceKey: 'account_id',
      as: 'preferences'
    });

    User.hasMany(models.UserMovieInteraction, {
      foreignKey: 'user_id',
      sourceKey: 'account_id',
      as: 'interactions'
    });

    User.hasMany(models.UserWatchlist, {
      foreignKey: 'user_id',
      sourceKey: 'account_id',
      as: 'watchlist'
    });
  };

  return User;
};
