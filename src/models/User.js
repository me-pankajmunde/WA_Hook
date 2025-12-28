const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastSeenAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;
