import Redis from 'ioredis';
import { logger } from './logger';

/**
 * Creates a Redis client with proper error handling and connection management
 * @param name - Name for logging purposes
 * @returns Redis client instance or null if Redis URL not configured
 */
export function createRedisClient(name: string = 'default'): Redis | null {
  const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
  
  if (!redisUrl) {
    logger.warn(`Redis client "${name}" not configured. Fallback to memory-based implementation.`, {
      component: 'RedisClient',
      name,
      redisUrlProvided: !!process.env.REDIS_URL,
      upstashUrlProvided: !!process.env.UPSTASH_REDIS_REST_URL,
    });
    return null;
  }

  try {
    const redis = new Redis(redisUrl, {
      enableReadyCheck: false,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      connectTimeout: 5000,
      commandTimeout: 5000,
      enableOfflineQueue: true,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        logger.warn(`Redis retry attempt ${times}, delaying ${delay}ms`, {
          component: 'RedisClient',
          name,
          attempt: times,
          delay,
        });
        return delay;
      },
      reconnectOnError: (err: any) => {
        const targetError = 'READONLY';
        if (err.message?.includes(targetError)) {
          // Reconnect on READONLY error
          logger.warn('Redis READONLY error, attempting reconnection', {
            component: 'RedisClient',
            name,
            error: err.message,
          });
          return 1 as boolean | 1 | 2; // 1 = reconnect
        }
        return false; // false = don't reconnect
      },
    });

    // Setup connection handlers
    redis.on('error', (err: any) => {
      logger.error(`Redis connection error [${name}]`, {
        component: 'RedisClient',
        name,
        error: err.message || String(err),
        code: err.code || 'UNKNOWN',
      });
    });

    redis.on('connect', () => {
      logger.info(`Redis client connected successfully [${name}]`, {
        component: 'RedisClient',
        name,
      });
    });

    redis.on('reconnecting', () => {
      logger.info(`Redis client reconnecting [${name}]`, {
        component: 'RedisClient',
        name,
      });
    });

    redis.on('close', () => {
      logger.info(`Redis connection closed [${name}]`, {
        component: 'RedisClient',
        name,
      });
    });

    return redis;
  } catch (error) {
    logger.error(`Failed to create Redis client [${name}]`, { 
      component: 'RedisClient',
      name,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}

/**
 * Tests Redis connection
 * @param redis - Redis client instance
 * @returns true if connection successful, false otherwise
 */
export async function testRedisConnection(redis: Redis | null): Promise<boolean> {
  if (!redis) {
    logger.info('Redis client is null, skipping connection test');
    return false;
  }

  try {
    const response = await redis.ping();
    logger.info('Redis connection test successful', {
      component: 'RedisClient',
      response,
    });
    return response === 'PONG';
  } catch (error) {
    logger.error('Redis connection test failed', {
      component: 'RedisClient',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

/**
 * Closes Redis connection gracefully
 * @param redis - Redis client instance
 */
export async function closeRedisConnection(redis: Redis | null): Promise<void> {
  if (!redis) {
    return;
  }

  try {
    await redis.quit();
    logger.info('Redis connection closed gracefully', {
      component: 'RedisClient',
    });
  } catch (error) {
    logger.error('Error closing Redis connection', {
      component: 'RedisClient',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    redis.disconnect();
  }
}

// Singleton instance for rate limiting
export const rateLimitingRedis = createRedisClient('rate-limiting');

// Export helper type
export type { Redis };
