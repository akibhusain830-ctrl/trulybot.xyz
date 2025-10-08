/**
 * CRITICAL SECURITY FIX: Enhanced Rate Limiting System
 * Provides granular rate limiting for different API endpoints
 * 
 * Features:
 * - Per-IP rate limiting
 * - Per-user rate limiting 
 * - Different limits for different endpoint types
 * - Redis-backed for distributed systems
 * - Automatic cleanup of expired entries
 */

import { NextRequest } from 'next/server';
import Redis from 'ioredis';
import { logger } from '@/lib/logger';

// Redis client setup
let redis: Redis | null = null;

try {
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      enableReadyCheck: false,
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });
  }
} catch (error) {
  logger.warn('Redis not available, using in-memory rate limiting', { error });
}

// Fallback in-memory store
const memoryStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
  resetTime: number;
  remaining: number;
}

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
  keyPrefix: string;  // Redis key prefix
}

class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  private getClientKey(req: NextRequest, prefix?: string): string {
    const ip = this.getClientIP(req);
    const userAgent = req.headers.get('user-agent')?.substring(0, 50) || 'unknown';
    const baseKey = `${this.config.keyPrefix}:${ip}:${userAgent}`;
    return prefix ? `${prefix}:${baseKey}` : baseKey;
  }

  private getClientIP(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    const cloudflareIP = req.headers.get('cf-connecting-ip');
    
    return cloudflareIP || realIP || forwarded?.split(',')[0] || 'unknown';
  }

  async check(req: NextRequest, userId?: string): Promise<RateLimitResult> {
    const key = userId ? 
      `${this.config.keyPrefix}:user:${userId}` : 
      this.getClientKey(req);
    
    const now = Date.now();
    const resetTime = Math.ceil(now / this.config.windowMs) * this.config.windowMs;

    try {
      if (redis) {
        return await this.checkRedis(key, now, resetTime);
      } else {
        return await this.checkMemory(key, now, resetTime);
      }
    } catch (error) {
      logger.error('Rate limit check failed', { error, key });
      // Fail open for availability
      return {
        allowed: true,
        count: 0,
        limit: this.config.maxRequests,
        resetTime,
        remaining: this.config.maxRequests
      };
    }
  }

  private async checkRedis(key: string, now: number, resetTime: number): Promise<RateLimitResult> {
    const multi = redis!.multi();
    multi.incr(key);
    multi.expire(key, Math.ceil(this.config.windowMs / 1000));
    
    const results = await multi.exec();
    const count = results?.[0]?.[1] as number || 1;

    const allowed = count <= this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - count);

    return {
      allowed,
      count,
      limit: this.config.maxRequests,
      resetTime,
      remaining
    };
  }

  private async checkMemory(key: string, now: number, resetTime: number): Promise<RateLimitResult> {
    const entry = memoryStore.get(key);
    
    if (!entry || now >= entry.resetTime) {
      // New window or expired entry
      memoryStore.set(key, { count: 1, resetTime });
      return {
        allowed: true,
        count: 1,
        limit: this.config.maxRequests,
        resetTime,
        remaining: this.config.maxRequests - 1
      };
    }

    entry.count++;
    const allowed = entry.count <= this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - entry.count);

    return {
      allowed,
      count: entry.count,
      limit: this.config.maxRequests,
      resetTime: entry.resetTime,
      remaining
    };
  }

  // Clean up expired entries (memory store only)
  cleanup(): void {
    if (redis) return; // Redis handles expiration automatically
    
    const now = Date.now();
    for (const [key, entry] of memoryStore.entries()) {
      if (now >= entry.resetTime) {
        memoryStore.delete(key);
      }
    }
  }
}

// Pre-configured rate limiters for different endpoints
export const rateLimit = {
  // Authentication endpoints - stricter limits
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    keyPrefix: 'rl:auth'
  }),

  // Chat endpoints - moderate limits
  chat: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 messages per minute
    keyPrefix: 'rl:chat'
  }),

  // Widget config - lighter limits since it's cached
  widget: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    keyPrefix: 'rl:widget'
  }),

  // Upload endpoints - strict limits
  upload: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 uploads per minute
    keyPrefix: 'rl:upload'
  }),

  // Payment endpoints - very strict
  payment: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 3, // 3 payment attempts per minute
    keyPrefix: 'rl:payment'
  }),

  // General API endpoints
  api: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    keyPrefix: 'rl:api'
  }),

  // Admin endpoints - very strict
  admin: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
    keyPrefix: 'rl:admin'
  })
};

// Cleanup task for memory store
if (!redis) {
  setInterval(() => {
    Object.values(rateLimit).forEach(limiter => limiter.cleanup());
  }, 5 * 60 * 1000); // Cleanup every 5 minutes
}

// Helper function for middleware integration
export async function checkRateLimit(
  req: NextRequest, 
  limiter: RateLimiter, 
  userId?: string
): Promise<RateLimitResult> {
  return await limiter.check(req, userId);
}

// Rate limit response headers helper
export function addRateLimitHeaders(
  response: Response, 
  result: RateLimitResult
): void {
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString());
  
  if (!result.allowed) {
    response.headers.set('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000).toString());
  }
}
