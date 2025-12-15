// backend/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { notFound, errorHandler } = require('./middleware/errorHandler.middleware');
const routes = require('./routes/index');

const app = express();

// Core middlewares
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Advanced Patient-Doctor Scheduling API',
    time: new Date().toISOString()
  });
});

// Serve static files (uploaded images)
app.use('/uploads', express.static('uploads'));

// Mount all routes
app.use('/api', routes);

// 404 and centralized error handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;
 