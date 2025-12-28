const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Media = sequelize.define('Media', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  messageId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'messages',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  sessionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'sessions',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('image', 'document', 'audio', 'video'),
    allowNull: false
  },
  originalUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  storedPath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  extractedText: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  classification: {
    type: DataTypes.STRING,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  isProcessed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'media',
  timestamps: true
});

module.exports = Media;
