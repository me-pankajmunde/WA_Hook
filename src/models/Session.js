const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('daily', 'task', 'project', 'custom'),
    defaultValue: 'daily'
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'archived'),
    defaultValue: 'active'
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  startedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'sessions',
  timestamps: true
});

module.exports = Session;
