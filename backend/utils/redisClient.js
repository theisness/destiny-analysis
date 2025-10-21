const Redis = require('ioredis');

/**
 * Redis 客户端
 * 支持 REDIS_URL 或单独的 host/port/password/db
 */
function createRedis() {
  const url = process.env.REDIS_URL;
  if (url) {
    return new Redis(url);
  }
  const host = process.env.REDIS_HOST || '127.0.0.1';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD || undefined;
  const db = parseInt(process.env.REDIS_DB || '0', 10);
  return new Redis({ host, port, password, db });
}

const redis = createRedis();

redis.on('connect', () => console.log('✅ Redis 连接成功'));
redis.on('error', (err) => console.error('❌ Redis 连接错误:', err.message));

async function setWithTTL(key, value, ttlSeconds) {
  await redis.set(key, value, 'EX', ttlSeconds);
}

async function get(key) {
  return redis.get(key);
}

async function incr(key) {
  return redis.incr(key);
}

async function exists(key) {
  const r = await redis.exists(key);
  return r === 1;
}

async function del(key) {
  return redis.del(key);
}

module.exports = { redis, setWithTTL, get, incr, exists, del };