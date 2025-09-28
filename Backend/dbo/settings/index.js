const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Settings = sequelize.define('Settings', {
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'account',
        key: 'account_id'
      },
      onDelete: 'CASCADE'
    },
    
    // Általános beállítások
    language: {
      type: DataTypes.STRING(8),
      allowNull: false,
      defaultValue: 'hu'
    },
    theme: {
      type: DataTypes.STRING(20),
      defaultValue: 'light'
    },
    
    // Alkalmazás beállítások
    auto_save_interval: {
      type: DataTypes.INTEGER,
      defaultValue: 60
    },
    results_per_page: {
      type: DataTypes.INTEGER,
      defaultValue: 25
    },
    animation_speed: {
      type: DataTypes.STRING(20),
      defaultValue: 'normal'
    }
  }, {
    tableName: 'settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Settings;
};