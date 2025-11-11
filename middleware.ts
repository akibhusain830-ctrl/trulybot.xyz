import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultSecurityMiddleware } from '@/lib/security/middleware';
import rateLimiter from '@/lib/redisRateLimit';

/**
 * Global rate limiting middleware configuration
 * Applies different rate limits based on route pattern
 */
async function applyGlobalRateLimit(request: NextRequest): Promise<{ allowed: boolean; result?: any }> {
  const pathname = request.nextUrl.pathname;

  // Skip rate limiting for static assets and public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/public') ||
    pathname.startsWith('/health') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.gif') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.woff') ||
    pathname.endsWith('.woff2') ||
    pathname === '/favicon.ico'
  ) {
    return { allowed: true };
  }

  // Apply different rate limits based on route
  let result;
  
  if (pathname.startsWith('/api/payments')) {
    // Strict limit for payment endpoints
    result = await rateLimiter.checkRateLimit(request, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 10,
      keyPrefix: 'payment',
    });
  } else if (pathname.startsWith('/api/auth') || pathname.includes('login') || pathname.includes('signup')) {
    // Strict limit for auth endpoints
    result = await rateLimiter.checkRateLimit(request, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 20,
      keyPrefix: 'auth',
    });
  } else if (pathname.startsWith('/api')) {
    // General API rate limit
    result = await rateLimiter.checkRateLimit(request, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 30,
      keyPrefix: 'api',
    });
  } else {
    // Page requests - lenient limit
    return { allowed: true };
  }

  return { 
    allowed: result.allowed,
    result,
  };
}

export async function middleware(request: NextRequest) {
  // Apply rate limiting first
  const rateLimit = await applyGlobalRateLimit(request);
  if (!rateLimit.allowed && rateLimit.result) {
    // Return 429 Too Many Requests
    const response = NextResponse.json(
      { 
        error: 'Too many requests, please try again later',
        retryAfter: Math.ceil((rateLimit.result.resetTime - Date.now()) / 1000),
      },
      { status: 429 }
    );
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', rateLimit.result.totalHits?.toString() || '0');
    response.headers.set('X-RateLimit-Remaining', Math.max(0, rateLimit.result.remaining).toString());
    response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimit.result.resetTime / 1000).toString());
    response.headers.set('Retry-After', Math.ceil((rateLimit.result.resetTime - Date.now()) / 1000).toString());
    
    return response;
  }

  // Apply comprehensive security middleware
  const securityResponse = await defaultSecurityMiddleware.process(request);
  if (securityResponse && securityResponse.status !== 200) {
    return securityResponse;
  }

  // Simplified - always use INR for all users
  const country = 'IN';
  const currency = 'INR';
  const symbol = '₹';
  const isIndia = true;
  
  console.log(`💰 Simplified pricing: Always INR (₹) for all users`);
  
  const res = securityResponse || NextResponse.next();
  
  // Set cookies for consistency (even though we always use INR)
  res.cookies.set('user-country', country, { 
    path: '/', 
    httpOnly: false, // Allow client-side access
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400 // 24 hours
  });
  
  // Set currency cookies for client-side access
  res.cookies.set('user-currency', currency, { 
    path: '/', 
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400
  });
  
  res.cookies.set('currency-symbol', symbol, { 
    path: '/', 
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400
  });
  
  res.cookies.set('is-india', isIndia.toString(), { 
    path: '/', 
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400
  });

  // Add CSP headers for Razorpay integration
  res.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://va.vercel-scripts.com https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://accounts.google.com https://va.vercel-scripts.com https://api.razorpay.com https://checkout.razorpay.com; frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com; frame-ancestors *;"
  );

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};