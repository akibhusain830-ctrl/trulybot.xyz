// Redis import with fallback
let Redis: any

try {
  Redis = require('ioredis').default || require('ioredis')
} catch (e) {
  // ioredis not installed, use mock
  Redis = class {
    constructor() {}
    ping() { return Promise.resolve('PONG') }
    get() { return Promise.resolve(null) }
    set() { return Promise.resolve('OK') }
    setex() { return Promise.resolve('OK') }
    del() { return Promise.resolve(1) }
    exists() { return Promise.resolve(0) }
    incrby() { return Promise.resolve(1) }
    expire() { return Promise.resolve(1) }
    keys() { return Promise.resolve([]) }
    flushdb() { return Promise.resolve('OK') }
    info() { return Promise.resolve('') }
    on() { return this }
  }
}

import { logger } from '@/lib/logger';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
  compress?: boolean;
}

export class CacheManager {
  private redis: any = null;
  private fallbackStore = new Map<string, { value: any; expires: number }>();
  private isRedisEnabled: boolean;

  constructor() {
    this.isRedisEnabled = !!process.env.REDIS_URL;
    
    if (this.isRedisEnabled) {
      try {
        this.redis = new Redis(process.env.REDIS_URL!, {
          retryDelayOnFailover: 100,
          retryConnectionDelay: 500,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });

        this.redis.on('connect', () => {
          logger.info('Redis connected successfully');
        });

        this.redis.on('error', (error: Error) => {
          logger.error('Redis connection error', { error: error.message });
          // Fall back to in-memory store on Redis failure
        });
      } catch (error) {
        logger.error('Failed to initialize Redis', { error });
        this.isRedisEnabled = false;
      }
    } else {
      logger.info('Redis not configured, using in-memory cache');
    }
  }

  private getKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : `trulybot:${key}`;
  }

  private async useRedis(): Promise<boolean> {
    if (!this.redis || !this.isRedisEnabled) return false;
    
    try {
      await this.redis.ping();
      return true;
    } catch {
      return false;
    }
  }

  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const fullKey = this.getKey(key, options.prefix);

    try {
      if (await this.useRedis()) {
        const value = await this.redis!.get(fullKey);
        if (value) {
          return JSON.parse(value) as T;
        }
      } else {
        // Use fallback store
        const cached = this.fallbackStore.get(fullKey);
        if (cached && cached.expires > Date.now()) {
          return cached.value as T;
        } else if (cached) {
          this.fallbackStore.delete(fullKey);
        }
      }
    } catch (error) {
      logger.error('Cache get error', { key: fullKey, error });
    }

    return null;
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    const fullKey = this.getKey(key, options.prefix);
    const ttl = options.ttl || 300; // Default 5 minutes

    try {
      const serialized = JSON.stringify(value);

      if (await this.useRedis()) {
        if (ttl > 0) {
          await this.redis!.setex(fullKey, ttl, serialized);
        } else {
          await this.redis!.set(fullKey, serialized);
        }
      } else {
        // Use fallback store
        this.fallbackStore.set(fullKey, {
          value,
          expires: ttl > 0 ? Date.now() + (ttl * 1000) : Infinity,
        });
      }

      return true;
    } catch (error) {
      logger.error('Cache set error', { key: fullKey, error });
      return false;
    }
  }

  async delete(key: string, options: CacheOptions = {}): Promise<boolean> {
    const fullKey = this.getKey(key, options.prefix);

    try {
      if (await this.useRedis()) {
        await this.redis!.del(fullKey);
      } else {
        this.fallbackStore.delete(fullKey);
      }
      return true;
    } catch (error) {
      logger.error('Cache delete error', { key: fullKey, error });
      return false;
    }
  }

  async exists(key: string, options: CacheOptions = {}): Promise<boolean> {
    const fullKey = this.getKey(key, options.prefix);

    try {
      if (await this.useRedis()) {
        const exists = await this.redis!.exists(fullKey);
        return exists === 1;
      } else {
        const cached = this.fallbackStore.get(fullKey);
        return cached ? cached.expires > Date.now() : false;
      }
    } catch (error) {
      logger.error('Cache exists error', { key: fullKey, error });
      return false;
    }
  }

  async increment(key: string, amount: number = 1, options: CacheOptions = {}): Promise<number> {
    const fullKey = this.getKey(key, options.prefix);

    try {
      if (await this.useRedis()) {
        const result = await this.redis!.incrby(fullKey, amount);
        if (options.ttl) {
          await this.redis!.expire(fullKey, options.ttl);
        }
        return result;
      } else {
        const current = await this.get<number>(key, options) || 0;
        const newValue = current + amount;
        await this.set(key, newValue, options);
        return newValue;
      }
    } catch (error) {
      logger.error('Cache increment error', { key: fullKey, error });
      return 0;
    }
  }

  async flush(pattern?: string): Promise<boolean> {
    try {
      if (await this.useRedis()) {
        if (pattern) {
          const keys = await this.redis!.keys(`trulybot:${pattern}`);
          if (keys.length > 0) {
            await this.redis!.del(...keys);
          }
        } else {
          await this.redis!.flushdb();
        }
      } else {
        if (pattern) {
          const fullPattern = this.getKey(pattern);
          for (const key of this.fallbackStore.keys()) {
            if (key.includes(fullPattern)) {
              this.fallbackStore.delete(key);
            }
          }
        } else {
          this.fallbackStore.clear();
        }
      }
      return true;
    } catch (error) {
      logger.error('Cache flush error', { pattern, error });
      return false;
    }
  }

  async getStats(): Promise<{
    connected: boolean;
    keys: number;
    memory?: string;
    hits?: number;
    misses?: number;
  }> {
    try {
      if (await this.useRedis()) {
        const info = await this.redis!.info('memory');
        const keyspace = await this.redis!.info('keyspace');
        const stats = await this.redis!.info('stats');
        
        return {
          connected: true,
          keys: keyspace.includes('keys=') ? 
            parseInt(keyspace.split('keys=')[1]?.split(',')[0] || '0') : 0,
          memory: info.includes('used_memory_human:') ?
            info.split('used_memory_human:')[1]?.split('\r')[0] : undefined,
        };
      } else {
        return {
          connected: false,
          keys: this.fallbackStore.size,
        };
      }
    } catch (error) {
      logger.error('Cache stats error', { error });
      return {
        connected: false,
        keys: 0,
      };
    }
  }

  // Cleanup expired keys in fallback store
  private cleanup() {
    const now = Date.now();
    for (const [key, value] of this.fallbackStore.entries()) {
      if (value.expires <= now) {
        this.fallbackStore.delete(key);
      }
    }
  }

  // Start cleanup interval
  startCleanup(intervalMs: number = 60000) {
    if (!this.isRedisEnabled) {
      setInterval(() => this.cleanup(), intervalMs);
    }
  }
}

// Create singleton instance
export const cache = new CacheManager();

// Start cleanup for fallback store
cache.startCleanup();

// Cache decorators and utilities
export const withCache = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl: number = 300
) => {
  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const key = keyGenerator(...args);
    
    // Try to get from cache first
    const cached = await cache.get<Awaited<ReturnType<T>>>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn(...args);
    await cache.set(key, result, { ttl });
    
    return result;
  };
};

// Common cache patterns
export const ChatCache = {
  async getConversation(userId: string, conversationId: string) {
    return cache.get(`chat:${userId}:${conversationId}`, { ttl: 3600 });
  },

  async setConversation(userId: string, conversationId: string, messages: any[]) {
    return cache.set(`chat:${userId}:${conversationId}`, messages, { ttl: 3600 });
  },

  async invalidateUser(userId: string) {
    return cache.flush(`chat:${userId}:*`);
  },
};

export const UserCache = {
  async getProfile(userId: string) {
    return cache.get(`user:profile:${userId}`, { ttl: 1800 });
  },

  async setProfile(userId: string, profile: any) {
    return cache.set(`user:profile:${userId}`, profile, { ttl: 1800 });
  },

  async getSubscription(userId: string) {
    return cache.get(`user:subscription:${userId}`, { ttl: 600 });
  },

  async setSubscription(userId: string, subscription: any) {
    return cache.set(`user:subscription:${userId}`, subscription, { ttl: 600 });
  },
};

export const KnowledgeCache = {
  async getEmbedding(text: string) {
    const key = `embedding:${Buffer.from(text).toString('base64').slice(0, 50)}`;
    return cache.get(key, { ttl: 86400 }); // 24 hours
  },

  async setEmbedding(text: string, embedding: number[]) {
    const key = `embedding:${Buffer.from(text).toString('base64').slice(0, 50)}`;
    return cache.set(key, embedding, { ttl: 86400 });
  },

  async getAnswer(query: string, context: string) {
    const key = `answer:${Buffer.from(query + context).toString('base64').slice(0, 50)}`;
    return cache.get(key, { ttl: 3600 });
  },

  async setAnswer(query: string, context: string, answer: string) {
    const key = `answer:${Buffer.from(query + context).toString('base64').slice(0, 50)}`;
    return cache.set(key, answer, { ttl: 3600 });
  },
};
