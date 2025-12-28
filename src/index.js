const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const logger = require('./utils/logger');
const { connectDB } = require('./config/database');

// Import routes
const webhookRoutes = require('./routes/webhook');
const healthRoutes = require('./routes/health');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.frontend.url,
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Routes
app.use('/webhook', webhookRoutes);
app.use('/api', healthRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'WhatsApp AI Assistant',
    version: '1.0.0',
    status: 'running'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start listening
    app.listen(config.port, () => {
      logger.info(`Server started on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`WhatsApp webhook ready at /webhook`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();

module.exports = app;
