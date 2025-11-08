// backend/server.js
require('dotenv').config();
const http = require('http');
const connectDB = require('./src/config/db');
const connectRedis = require('./src/config/redis');
const app = require('./src/app');

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    // Connect DBs
    await connectDB();
    await connectRedis();

    // Start server
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port http://127.0.0.1:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (err) {
    console.error('❌ Server startup error:', err);
    process.exit(1);
  }
})();
