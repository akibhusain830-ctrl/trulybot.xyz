import { NextRequest, NextResponse } from 'next/server';

export interface SecurityConfig {
  csp?: string;
  hsts?: boolean;
  noSniff?: boolean;
  frameOptions?: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
  xssProtection?: boolean;
  referrerPolicy?: string;
  permissionsPolicy?: string;
}

const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  csp: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://api.razorpay.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.openai.com https://api.razorpay.com wss: ws:; frame-src https://api.razorpay.com https://checkout.razorpay.com;",
  hsts: true,
  noSniff: true,
  frameOptions: 'SAMEORIGIN',
  xssProtection: true,
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: 'camera=(), microphone=(), geolocation=(), payment=(self)'
};

export function createSecurityHeaders(config: SecurityConfig = {}) {
  const mergedConfig = { ...DEFAULT_SECURITY_CONFIG, ...config };
  
  return function securityMiddleware(request: NextRequest) {
    const response = NextResponse.next();
    
    // Content Security Policy
    if (mergedConfig.csp) {
      response.headers.set('Content-Security-Policy', mergedConfig.csp);
    }
    
    // HTTP Strict Transport Security
    if (mergedConfig.hsts && request.url.startsWith('https://')) {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }
    
    // X-Content-Type-Options
    if (mergedConfig.noSniff) {
      response.headers.set('X-Content-Type-Options', 'nosniff');
    }
    
    // X-Frame-Options
    if (mergedConfig.frameOptions) {
      response.headers.set('X-Frame-Options', mergedConfig.frameOptions);
    }
    
    // X-XSS-Protection
    if (mergedConfig.xssProtection) {
      response.headers.set('X-XSS-Protection', '1; mode=block');
    }
    
    // Referrer Policy
    if (mergedConfig.referrerPolicy) {
      response.headers.set('Referrer-Policy', mergedConfig.referrerPolicy);
    }
    
    // Permissions Policy
    if (mergedConfig.permissionsPolicy) {
      response.headers.set('Permissions-Policy', mergedConfig.permissionsPolicy);
    }
    
    // Additional security headers
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
    response.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Remove server information
    response.headers.delete('Server');
    response.headers.delete('X-Powered-By');
    
    return response;
  };
}

// CORS configuration for API routes
export function createCORSHeaders(allowedOrigins: string[] = []) {
  return function corsMiddleware(request: NextRequest) {
    const response = NextResponse.next();
    const origin = request.headers.get('origin');
    
    // Allow specific origins or fallback to same-origin
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else if (allowedOrigins.length === 0) {
      response.headers.set('Access-Control-Allow-Origin', '*');
    }
    
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With'
    );
    response.headers.set('Access-Control-Max-Age', '86400');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return NextResponse.json(null, { status: 200, headers: response.headers });
    }
    
    return response;
  };
}

// Rate limiting headers
export function addRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  resetTime: number
) {
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());
  
  if (remaining === 0) {
    response.headers.set('Retry-After', Math.ceil((resetTime - Date.now()) / 1000).toString());
  }
  
  return response;
}

// Security audit helper
export function auditSecurityHeaders(headers: Headers): {
  score: number;
  missing: string[];
  recommendations: string[];
} {
  const requiredHeaders = [
    'Content-Security-Policy',
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Referrer-Policy'
  ];
  
  const recommendedHeaders = [
    'Strict-Transport-Security',
    'Permissions-Policy',
    'Cross-Origin-Opener-Policy'
  ];
  
  const missing: string[] = [];
  const recommendations: string[] = [];
  
  requiredHeaders.forEach(header => {
    if (!headers.get(header)) {
      missing.push(header);
    }
  });
  
  recommendedHeaders.forEach(header => {
    if (!headers.get(header)) {
      recommendations.push(header);
    }
  });
  
  const score = Math.round(
    ((requiredHeaders.length - missing.length) / requiredHeaders.length) * 100
  );
  
  return { score, missing, recommendations };
}
