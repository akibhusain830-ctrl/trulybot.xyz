import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

interface SecurityHeaders {
  'Content-Security-Policy'?: string;
  'X-Frame-Options'?: string;
  'X-Content-Type-Options'?: string;
  'Referrer-Policy'?: string;
  'Permissions-Policy'?: string;
  'Strict-Transport-Security'?: string;
  'X-XSS-Protection'?: string;
  'X-DNS-Prefetch-Control'?: string;
}

export class SecurityHeadersMiddleware {
  private headers: SecurityHeaders;

  constructor(customHeaders: Partial<SecurityHeaders> = {}) {
    this.headers = {
      // Content Security Policy
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://js.sentry-cdn.com https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://api.openai.com https://o4507902203453440.ingest.sentry.io https://checkout.razorpay.com wss:",
        "frame-src 'self' https://checkout.razorpay.com",
        "media-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests"
      ].join('; '),

      // Prevent clickjacking
      'X-Frame-Options': 'DENY',

      // Prevent MIME type sniffing
      'X-Content-Type-Options': 'nosniff',

      // Referrer policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',

      // Permissions policy
      'Permissions-Policy': [
        'camera=()',
        'microphone=()',
        'geolocation=(self)',
        'payment=(self "https://checkout.razorpay.com")',
        'usb=()',
        'magnetometer=()',
        'accelerometer=()',
        'gyroscope=()'
      ].join(', '),

      // HSTS (only in production with HTTPS)
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

      // XSS Protection (legacy, but still useful)
      'X-XSS-Protection': '1; mode=block',

      // DNS prefetch control
      'X-DNS-Prefetch-Control': 'off',

      ...customHeaders,
    };
  }

  apply(response: NextResponse): NextResponse {
    Object.entries(this.headers).forEach(([key, value]) => {
      if (value) {
        response.headers.set(key, value);
      }
    });

    // Remove potentially sensitive headers
    response.headers.delete('X-Powered-By');
    response.headers.delete('Server');

    return response;
  }

  createMiddleware() {
    return (req: NextRequest) => {
      const response = NextResponse.next();
      return this.apply(response);
    };
  }
}

// Pre-configured security headers
export const defaultSecurityHeaders = new SecurityHeadersMiddleware();

// Relaxed headers for development
export const developmentSecurityHeaders = new SecurityHeadersMiddleware({
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' ws: wss:",
    "font-src 'self' data:",
  ].join('; '),
});

// API-specific headers
export const apiSecurityHeaders = new SecurityHeadersMiddleware({
  'Content-Security-Policy': "default-src 'none'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
});

// Embed-specific headers (allow iframe embedding)
export const embedSecurityHeaders = new SecurityHeadersMiddleware({
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://accounts.google.com",
    "frame-ancestors *", // Allow embedding from any domain
  ].join('; '),
  // Explicitly remove X-Frame-Options to allow embedding
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
});

// CORS Configuration
export interface CorsOptions {
  origin?: string | string[] | RegExp | ((origin: string) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

export class CorsMiddleware {
  private options: CorsOptions;

  constructor(options: CorsOptions = {}) {
    this.options = {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://trulybot.xyz', 'https://www.trulybot.xyz']
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Cache-Control',
        'X-File-Name'
      ],
      credentials: true,
      maxAge: 86400, // 24 hours
      ...options,
    };
  }

  isOriginAllowed(origin: string): boolean {
    const { origin: allowedOrigin } = this.options;

    if (!allowedOrigin) return true;

    if (typeof allowedOrigin === 'string') {
      return origin === allowedOrigin;
    }

    if (Array.isArray(allowedOrigin)) {
      return allowedOrigin.includes(origin);
    }

    if (allowedOrigin instanceof RegExp) {
      return allowedOrigin.test(origin);
    }

    if (typeof allowedOrigin === 'function') {
      return allowedOrigin(origin);
    }

    return false;
  }

  apply(req: NextRequest, response: NextResponse): NextResponse {
    const origin = req.headers.get('origin') || '';

    // Check if origin is allowed
    if (origin && this.isOriginAllowed(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }

    // Set other CORS headers
    if (this.options.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    response.headers.set(
      'Access-Control-Allow-Methods',
      this.options.methods!.join(', ')
    );

    response.headers.set(
      'Access-Control-Allow-Headers',
      this.options.allowedHeaders!.join(', ')
    );

    response.headers.set(
      'Access-Control-Max-Age',
      this.options.maxAge!.toString()
    );

    return response;
  }

  handlePreflight(req: NextRequest): NextResponse | null {
    if (req.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 });
      return this.apply(req, response);
    }
    return null;
  }

  createMiddleware() {
    return (req: NextRequest) => {
      // Handle preflight requests
      const preflightResponse = this.handlePreflight(req);
      if (preflightResponse) {
        return preflightResponse;
      }

      const response = NextResponse.next();
      return this.apply(req, response);
    };
  }
}

export const defaultCors = new CorsMiddleware();

// Security validation helpers
export const validateUserAgent = (userAgent: string): boolean => {
  // Block known bad user agents
  const blockedPatterns = [
    /bot/i,
    /crawler/i,
    /scraper/i,
    /scanner/i,
    /spider/i,
  ];

  // Allow legitimate bots (Google, etc.)
  const allowedBots = [
    /googlebot/i,
    /bingbot/i,
    /slurp/i,
    /duckduckbot/i,
  ];

  // Check if it's an allowed bot
  if (allowedBots.some(pattern => pattern.test(userAgent))) {
    return true;
  }

  // Block other bots
  if (blockedPatterns.some(pattern => pattern.test(userAgent))) {
    logger.warn('Blocked suspicious user agent', { userAgent });
    return false;
  }

  return true;
};

export const validateReferer = (referer: string, allowedDomains: string[]): boolean => {
  if (!referer) return true; // Allow requests without referer

  try {
    const url = new URL(referer);
    const isAllowed = allowedDomains.some(domain => 
      url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    );

    if (!isAllowed) {
      logger.warn('Blocked suspicious referer', { referer, hostname: url.hostname });
    }

    return isAllowed;
  } catch {
    logger.warn('Invalid referer URL', { referer });
    return false;
  }
};
