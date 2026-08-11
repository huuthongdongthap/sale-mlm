/**
 * PHASE 4: Redis Session & Cache Adapter
 *
 * For production scaling — replaces in-memory sessions.
 *
 * Setup:
 *   1. Provision Redis (Upstash, Redis Cloud, or self-hosted)
 *   2. Set REDIS_URL env var
 *   3. Install: npm install ioredis
 */

const Redis = require('ioredis');

let redisClient = null;

/**
 * Get or create Redis client
 */
function getRedis() {
  if (redisClient) return redisClient;

  if (!process.env.REDIS_URL) {
    console.log('[Redis] No REDIS_URL set, using in-memory fallback');
    return createMemoryFallback();
  }

  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null; // Stop retrying
      return Math.min(times * 200, 2000);
    }
  });

  redisClient.on('error', (err) => console.error('[Redis] Error:', err.message));
  redisClient.on('connect', () => console.log('[Redis] Connected'));

  return redisClient;
}

/**
 * In-memory fallback when Redis not available
 */
function createMemoryFallback() {
  const store = new Map();
  return {
    async get(key) {
      const item = store.get(key);
      if (!item) return null;
      if (item.expires && Date.now() > item.expires) {
        store.delete(key);
        return null;
      }
      return item.value;
    },
    async set(key, value, ttl) {
      const item = { value, expires: ttl ? Date.now() + (ttl * 1000) : null };
      store.set(key, item);
      return 'OK';
    },
    async del(key) {
      return store.delete(key);
    },
    async keys(pattern) {
      return Array.from(store.keys()).filter(k => k.includes(pattern.replace('*', '')));
    }
  };
}

/**
 * Session management
 */
class SessionManager {
  constructor() {
    this.redis = getRedis();
    this.prefix = 'session:';
    this.defaultTTL = 86400; // 24 hours
  }

  async create(userId, data) {
    const sessionId = require('crypto').randomUUID();
    const session = { ...data, userId, createdAt: Date.now() };
    await this.redis.set(`${this.prefix}${sessionId}`, JSON.stringify(session), this.defaultTTL);
    return sessionId;
  }

  async get(sessionId) {
    const data = await this.redis.get(`${this.prefix}${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  async update(sessionId, data) {
    const existing = await this.get(sessionId);
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: Date.now() };
    await this.redis.set(`${this.prefix}${sessionId}`, JSON.stringify(updated), this.defaultTTL);
    return updated;
  }

  async destroy(sessionId) {
    return await this.redis.del(`${this.prefix}${sessionId}`);
  }
}

/**
 * Cache management
 */
class CacheManager {
  constructor() {
    this.redis = getRedis();
    this.prefix = 'cache:';
  }

  async get(key) {
    const data = await this.redis.get(`${this.prefix}${key}`);
    return data ? JSON.parse(data) : null;
  }

  async set(key, value, ttl = 3600) {
    await this.redis.set(`${this.prefix}${key}`, JSON.stringify(value), ttl);
  }

  async invalidate(key) {
    await this.redis.del(`${this.prefix}${key}`);
  }

  async invalidatePattern(pattern) {
    const keys = await this.redis.keys(`${this.prefix}${pattern}`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

module.exports = { getRedis, SessionManager, CacheManager };
