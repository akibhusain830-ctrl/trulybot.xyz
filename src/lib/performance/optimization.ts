import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

interface CompressionOptions {
  threshold?: number; // Minimum size to compress (bytes)
  level?: number; // Compression level (1-9)
  types?: string[]; // MIME types to compress
}

export class CompressionMiddleware {
  private options: Required<CompressionOptions>;

  constructor(options: CompressionOptions = {}) {
    this.options = {
      threshold: options.threshold || 1024, // 1KB default
      level: options.level || 6,
      types: options.types || [
        'text/html',
        'text/css',
        'text/javascript',
        'application/javascript',
        'application/json',
        'application/xml',
        'text/xml',
        'text/plain',
        'image/svg+xml',
      ],
    };
  }

  shouldCompress(contentType: string, contentLength: number): boolean {
    if (contentLength < this.options.threshold) {
      return false;
    }

    const type = contentType.split(';')[0].trim().toLowerCase();
    return this.options.types.includes(type);
  }

  async compress(data: string): Promise<Buffer> {
    // In a real implementation, you would use a compression library like:
    // - zlib (built into Node.js)
    // - brotli
    // - or a third-party library
    
    // For now, we'll simulate compression
    const buffer = Buffer.from(data, 'utf8');
    
    // Simulate compression (in reality, use zlib.gzip or similar)
    return buffer;
  }

  createMiddleware() {
    return async (req: NextRequest, response: NextResponse) => {
      const acceptEncoding = req.headers.get('accept-encoding') || '';
      const supportsGzip = acceptEncoding.includes('gzip');
      const supportsBrotli = acceptEncoding.includes('br');

      if (!supportsGzip && !supportsBrotli) {
        return response;
      }

      // Only compress successful responses
      if (response.status !== 200) {
        return response;
      }

      const contentType = response.headers.get('content-type') || '';
      const contentLength = parseInt(response.headers.get('content-length') || '0');

      if (!this.shouldCompress(contentType, contentLength)) {
        return response;
      }

      try {
        // Note: In a real implementation, you would:
        // 1. Read the response body
        // 2. Compress it using zlib or brotli
        // 3. Set appropriate headers
        // 4. Return the compressed response

        // For now, just set the headers to indicate compression support
        if (supportsBrotli) {
          response.headers.set('Content-Encoding', 'br');
        } else if (supportsGzip) {
          response.headers.set('Content-Encoding', 'gzip');
        }

        response.headers.set('Vary', 'Accept-Encoding');

        logger.debug('Response compressed', {
          contentType,
          originalSize: contentLength,
          encoding: supportsBrotli ? 'br' : 'gzip',
        });

        return response;
      } catch (error) {
        logger.error('Compression error', { error });
        return response;
      }
    };
  }
}

// CDN and Static Asset Optimization
export class StaticAssetOptimizer {
  private cdnBaseUrl?: string;
  private versionHash?: string;

  constructor(cdnBaseUrl?: string, versionHash?: string) {
    this.cdnBaseUrl = cdnBaseUrl || process.env.CDN_URL;
    this.versionHash = versionHash || process.env.VERSION_HASH || Date.now().toString();
  }

  getOptimizedUrl(path: string): string {
    // If CDN is configured, use it for static assets
    if (this.cdnBaseUrl && this.isStaticAsset(path)) {
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      return `${this.cdnBaseUrl}/${cleanPath}?v=${this.versionHash}`;
    }

    // Add version hash for cache busting
    const separator = path.includes('?') ? '&' : '?';
    return `${path}${separator}v=${this.versionHash}`;
  }

  private isStaticAsset(path: string): boolean {
    const staticExtensions = [
      '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
      '.woff', '.woff2', '.ttf', '.eot', '.pdf', '.zip'
    ];

    return staticExtensions.some(ext => path.toLowerCase().endsWith(ext));
  }

  generateCacheHeaders(path: string): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.isStaticAsset(path)) {
      // Long-term caching for static assets with versioning
      headers['Cache-Control'] = 'public, max-age=31536000, immutable'; // 1 year
      headers['ETag'] = `"${this.versionHash}"`;
    } else if (path.startsWith('/api/')) {
      // No caching for API endpoints by default
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    } else {
      // Short-term caching for pages
      headers['Cache-Control'] = 'public, max-age=3600, stale-while-revalidate=86400'; // 1 hour
    }

    return headers;
  }
}

// Performance monitoring middleware
export class PerformanceMiddleware {
  private slowRequestThreshold: number;

  constructor(slowRequestThreshold: number = 1000) {
    this.slowRequestThreshold = slowRequestThreshold;
  }

  createMiddleware() {
    return async (req: NextRequest) => {
      const startTime = Date.now();
      const url = req.nextUrl;
      
      const response = NextResponse.next();

      // Add timing information to response
      response.headers.set('X-Response-Time-Start', startTime.toString());

      // Log request start
      logger.debug('Request started', {
        method: req.method,
        path: url.pathname,
        userAgent: req.headers.get('user-agent')?.substring(0, 100),
      });

      return response;
    };
  }

  logSlowRequest(req: NextRequest, duration: number) {
    if (duration > this.slowRequestThreshold) {
      logger.warn('Slow request detected', {
        method: req.method,
        path: req.nextUrl.pathname,
        duration,
        threshold: this.slowRequestThreshold,
      });
    }
  }
}

// Memory usage monitoring
export class MemoryMonitor {
  private warningThreshold: number;
  private criticalThreshold: number;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(warningThreshold: number = 0.8, criticalThreshold: number = 0.9) {
    this.warningThreshold = warningThreshold;
    this.criticalThreshold = criticalThreshold;
  }

  getMemoryUsage(): {
    used: number;
    total: number;
    percentage: number;
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  } {
    const usage = process.memoryUsage();
    const total = usage.heapTotal;
    const used = usage.heapUsed;
    const percentage = used / total;

    return {
      used,
      total,
      percentage,
      rss: usage.rss,
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
    };
  }

  checkMemoryPressure(): 'normal' | 'warning' | 'critical' {
    const { percentage } = this.getMemoryUsage();

    if (percentage >= this.criticalThreshold) {
      return 'critical';
    } else if (percentage >= this.warningThreshold) {
      return 'warning';
    }

    return 'normal';
  }

  startMonitoring(intervalMs: number = 30000) {
    // Clean up existing interval if any
    this.stopMonitoring();
    
    this.monitoringInterval = setInterval(() => {
      const status = this.checkMemoryPressure();
      const usage = this.getMemoryUsage();

      if (status !== 'normal') {
        logger.warn('Memory pressure detected', {
          status,
          memoryUsage: {
            percentage: Math.round(usage.percentage * 100),
            heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
          },
        });

        if (status === 'critical') {
          // Force garbage collection if available
          if (global.gc) {
            global.gc();
            logger.info('Forced garbage collection');
          }
        }
      }
    }, intervalMs);
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}

// Database query optimization helpers
export class DatabaseOptimizer {
  private queryCache = new Map<string, { result: unknown; timestamp: number; ttl: number }>();
  private slowQueryThreshold: number;

  constructor(slowQueryThreshold: number = 1000) {
    this.slowQueryThreshold = slowQueryThreshold;
  }

  async executeWithCache<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    ttl: number = 300000 // 5 minutes default
  ): Promise<T> {
    // Check cache first
    const cached = this.queryCache.get(queryKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.result as T;
    }

    // Execute query with timing
    const startTime = Date.now();
    try {
      const result = await queryFn();
      const duration = Date.now() - startTime;

      // Log slow queries
      if (duration > this.slowQueryThreshold) {
        logger.warn('Slow database query', {
          queryKey,
          duration,
          threshold: this.slowQueryThreshold,
        });
      }

      // Cache successful results
      this.queryCache.set(queryKey, {
        result,
        timestamp: Date.now(),
        ttl,
      });

      // Log successful query
      logger.debug('Database query executed', {
        queryKey,
        duration,
        cached: false,
      });

      return result;
    } catch (error) {
      logger.error('Database query failed', {
        queryKey,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      });
      throw error;
    }
  }

  clearCache(pattern?: string) {
    if (pattern) {
      for (const key of this.queryCache.keys()) {
        if (key.includes(pattern)) {
          this.queryCache.delete(key);
        }
      }
    } else {
      this.queryCache.clear();
    }
  }

  getCacheStats() {
    return {
      size: this.queryCache.size,
      keys: Array.from(this.queryCache.keys()),
    };
  }
}

// Pre-configured instances
export const compression = new CompressionMiddleware();
export const assetOptimizer = new StaticAssetOptimizer();
export const performanceMonitor = new PerformanceMiddleware();
export const memoryMonitor = new MemoryMonitor();
export const dbOptimizer = new DatabaseOptimizer();

// Start memory monitoring
if (process.env.NODE_ENV === 'production') {
  memoryMonitor.startMonitoring();
}
