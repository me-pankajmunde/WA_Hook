const { Sequelize } = require('sequelize');
const config = require('../config');
const logger = require('../utils/logger');

const sequelize = new Sequelize(config.database.url, {
  dialect: config.database.dialect,
  logging: config.database.logging ? (msg) => logger.debug(msg) : false,
  pool: config.database.pool
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    
    // Sync models in development
    if (config.nodeEnv === 'development') {
      await sequelize.sync({ alter: false });
      logger.info('Database models synchronized');
    }
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
};

module.exports = { sequelize, connectDB };
