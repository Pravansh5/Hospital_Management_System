// backend/src/config/redis.js
const Redis = require('ioredis');

let redis;

const connectRedis = async () => {
  try {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    redis.on('connect', () => console.log('✅ Redis Connected'));
    redis.on('error', (err) => console.error('❌ Redis Error:', err));
    return redis;
  } catch (error) {
    console.error('Redis connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectRedis;
