import Redis from 'ioredis';
import { NextRequest } from 'next/server';
import { logger } from './logger';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyPrefix?: string; // Redis key prefix
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalHits: number;
}

class RedisRateLimiter {
  private redis: Redis | null = null;
  private fallbackStore: Map<string, { count: number; resetTime: number }> = new Map();
  private isRedisAvailable = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      // Try to connect to Redis
      const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
      
      if (redisUrl) {
        this.redis = new Redis(redisUrl, {
          enableReadyCheck: false,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          connectTimeout: 5000,
          commandTimeout: 5000,
        });

        // Test connection
        await this.redis.ping();
        this.isRedisAvailable = true;
        logger.info('Redis rate limiter initialized successfully');
      } else {
        logger.warn('Redis URL not found, falling back to in-memory rate limiting');
      }
    } catch (error) {
      logger.warn('Redis connection failed, using in-memory fallback', { error: error instanceof Error ? error.message : 'Unknown error' });
      this.isRedisAvailable = false;
      this.redis = null;
    }
  }

  /**
   * Enhanced IP detection that works behind proxies and load balancers
   */
  private getClientIP(req: NextRequest): string {
    // Try multiple headers in order of preference
    const headers = [
      'x-real-ip',           // Nginx proxy
      'x-forwarded-for',     // Standard proxy header
      'x-client-ip',         // Apache mod_proxy
      'x-cluster-client-ip', // Cluster environments
      'cf-connecting-ip',    // Cloudflare
      'fastly-client-ip',    // Fastly CDN
      'true-client-ip',      // Akamai and Cloudflare
      'x-azure-clientip',    // Azure
    ];

    for (const header of headers) {
      const value = req.headers.get(header);
      if (value) {
        // Handle comma-separated IPs (x-forwarded-for can contain multiple IPs)
        const ip = value.split(',')[0].trim();
        if (this.isValidIP(ip)) {
          return ip;
        }
      }
    }

    // Fallback to connection remote address
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
      const ip = forwarded.split(',')[0].trim();
      if (this.isValidIP(ip)) {
        return ip;
      }
    }

    // Final fallback
    return req.ip || req.headers.get('remote-addr') || 'unknown';
  }

  private isValidIP(ip: string): boolean {
    // Basic IP validation (IPv4 and IPv6)
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip) || ip === 'localhost' || ip === '127.0.0.1';
  }

  /**
   * Redis-based rate limiting with sliding window
   */
  private async redisRateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    if (!this.redis || !this.isRedisAvailable) {
      throw new Error('Redis not available');
    }

    const now = Date.now();
    const window = config.windowMs;
    const windowStart = now - window;

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = this.redis.pipeline();
      
      // Remove old entries
      pipeline.zremrangebyscore(key, 0, windowStart);
      
      // Count current entries
      pipeline.zcard(key);
      
      // Add current request
      pipeline.zadd(key, now, `${now}-${Math.random()}`);
      
      // Set expiration
      pipeline.expire(key, Math.ceil(window / 1000));
      
      const results = await pipeline.exec();
      
      if (!results) {
        throw new Error('Redis pipeline failed');
      }

      const currentCount = (results[1][1] as number) || 0;
      const totalHits = currentCount + 1;
      const remaining = Math.max(0, config.maxRequests - totalHits);
      const allowed = totalHits <= config.maxRequests;
      
      // If limit exceeded, remove the current request
      if (!allowed) {
        await this.redis.zremrangebyrank(key, -1, -1);
      }

      return {
        allowed,
        remaining,
        resetTime: now + window,
        totalHits
      };
    } catch (error) {
      logger.error('Redis rate limit error', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  /**
   * In-memory fallback rate limiting
   */
  private memoryRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now();
    const stored = this.fallbackStore.get(key);

    if (!stored || now > stored.resetTime) {
      // New window
      this.fallbackStore.set(key, { count: 1, resetTime: now + config.windowMs });
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs,
        totalHits: 1
      };
    }

    stored.count++;
    const allowed = stored.count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - stored.count);

    if (!allowed) {
      stored.count--; // Don't count failed attempts
    }

    return {
      allowed,
      remaining,
      resetTime: stored.resetTime,
      totalHits: stored.count
    };
  }

  /**
   * Clean up old entries from memory store
   */
  private cleanupMemoryStore() {
    const now = Date.now();
    for (const [key, stored] of this.fallbackStore.entries()) {
      if (now > stored.resetTime) {
        this.fallbackStore.delete(key);
      }
    }
  }

  /**
   * Main rate limiting function
   */
  async checkRateLimit(req: NextRequest, config: RateLimitConfig): Promise<RateLimitResult> {
    const clientIP = this.getClientIP(req);
    const keyPrefix = config.keyPrefix || 'rl';
    const key = `${keyPrefix}:${clientIP}`;

    try {
      if (this.isRedisAvailable && this.redis) {
        return await this.redisRateLimit(key, config);
      }
    } catch (error) {
      logger.warn('Redis rate limit failed, falling back to memory', { error: error instanceof Error ? error.message : 'Unknown error' });
      this.isRedisAvailable = false;
    }

    // Fallback to memory-based rate limiting
    this.cleanupMemoryStore();
    return this.memoryRateLimit(key, config);
  }

  /**
   * Reset rate limit for a specific IP (useful for testing or admin override)
   */
  async resetRateLimit(req: NextRequest, keyPrefix: string = 'rl'): Promise<void> {
    const clientIP = this.getClientIP(req);
    const key = `${keyPrefix}:${clientIP}`;

    try {
      if (this.isRedisAvailable && this.redis) {
        await this.redis.del(key);
      } else {
        this.fallbackStore.delete(key);
      }
    } catch (error) {
      logger.error('Failed to reset rate limit', { error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Get current rate limit status without incrementing
   */
  async getRateLimitStatus(req: NextRequest, config: RateLimitConfig): Promise<Omit<RateLimitResult, 'allowed'>> {
    const clientIP = this.getClientIP(req);
    const keyPrefix = config.keyPrefix || 'rl';
    const key = `${keyPrefix}:${clientIP}`;

    try {
      if (this.isRedisAvailable && this.redis) {
        const count = await this.redis.zcard(key);
        const remaining = Math.max(0, config.maxRequests - count);
        const ttl = await this.redis.ttl(key);
        const resetTime = ttl > 0 ? Date.now() + (ttl * 1000) : Date.now() + config.windowMs;

        return {
          remaining,
          resetTime,
          totalHits: count
        };
      }
    } catch (error) {
      logger.warn('Failed to get rate limit status from Redis', { error: error instanceof Error ? error.message : 'Unknown error' });
    }

    // Fallback to memory
    const stored = this.fallbackStore.get(key);
    if (stored && Date.now() <= stored.resetTime) {
      return {
        remaining: Math.max(0, config.maxRequests - stored.count),
        resetTime: stored.resetTime,
        totalHits: stored.count
      };
    }

    return {
      remaining: config.maxRequests,
      resetTime: Date.now() + config.windowMs,
      totalHits: 0
    };
  }
}

// Singleton instance
const rateLimiter = new RedisRateLimiter();

// Pre-configured rate limiters for different endpoints
export const paymentRateLimit = (req: NextRequest) => rateLimiter.checkRateLimit(req, {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
  keyPrefix: 'payment'
});

export const orderRateLimit = (req: NextRequest) => rateLimiter.checkRateLimit(req, {
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 5,
  keyPrefix: 'order'
});

export const trialRateLimit = (req: NextRequest) => rateLimiter.checkRateLimit(req, {
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxRequests: 3,
  keyPrefix: 'trial'
});

export const authRateLimit = (req: NextRequest) => rateLimiter.checkRateLimit(req, {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 20,
  keyPrefix: 'auth'
});

export const apiRateLimit = (req: NextRequest) => rateLimiter.checkRateLimit(req, {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 1000,
  keyPrefix: 'api'
});

// Export the main class for custom configurations
export { RedisRateLimiter };
export default rateLimiter;