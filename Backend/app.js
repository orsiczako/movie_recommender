require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, models } = require('./dbo');
const routerFactory = require('./routers');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes - átadjuk a modelleket a router factory-nak
app.use('/', routerFactory(models));

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error occurred:', error);
  
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.errors.map(err => err.message)
    });
  }
  
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      error: 'Duplicate entry',
      field: error.errors[0].path
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  try {
    await sequelize.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start server and connect to database
async function startServer() {
  try {
    console.log('🔄 Connecting to database...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync models (create tables if they don't exist)
    await sequelize.sync({ alter: false }); // alter: false in production
    console.log('✅ Database models synchronized');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Movie Recommender API running on port ${PORT}`);
      console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
      console.log('✅ Server is ready to accept connections');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the application
startServer();

module.exports = app;