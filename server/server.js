// backend/server.js
require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./src/config/db");
const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const corsOptions = {
  origin: [
    process.env.CLIENT_URL,
    'http://localhost:3000', 
    'http://localhost:3001',
    'http://localhost:5173',
    'https://hospital-management-system-three-sand.vercel.app'
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Connect to MongoDB
connectDB();

// Routes
app.use("/api", require("./src/routes/index"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "Hospital Management System API",
    environment: process.env.NODE_ENV,
    time: new Date().toISOString(),
  });
});

// 404 handler - catch all unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
