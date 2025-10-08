import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SecurityMiddleware } from './src/lib/security/securityMiddleware'

// Currency mapping based on country codes
const CURRENCY_MAP: Record<string, { currency: string; symbol: string }> = {
  'IN': { currency: 'INR', symbol: '₹' },
  'US': { currency: 'USD', symbol: '$' },
  'GB': { currency: 'GBP', symbol: '£' },
  'EU': { currency: 'EUR', symbol: '€' },
  'CA': { currency: 'CAD', symbol: 'C$' },
  'AU': { currency: 'AUD', symbol: 'A$' },
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Initialize security monitoring
  const securityMiddleware = new SecurityMiddleware();
  const startTime = Date.now();

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Process request for security monitoring
  await securityMiddleware.processRequest(request, response);

  // Handle widget.js requests with special CORS headers
  if (pathname === '/widget.js') {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    response.headers.set('Vary', 'Accept-Encoding');
    return response;
  }

  // Handle embed routes - allow iframe embedding from any domain
  if (pathname.startsWith('/embed')) {
    response.headers.delete('X-Frame-Options');
    response.headers.set('Content-Security-Policy', 'frame-ancestors *');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return response;
  }

  // Create Supabase client for session management
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired
  const { data: { session }, error } = await supabase.auth.getSession()

  // Protected routes
  const protectedPaths = ['/dashboard', '/api/chat', '/api/settings', '/api/knowledge', '/api/leads']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtectedPath && !session) {
    // Redirect to login if accessing protected route without session
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/sign-in'
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Robust geolocation detection using multiple sources
  let country = 'IN'; // Default to India to prevent USD showing to Indians
  
  // Try multiple geolocation headers for maximum accuracy
  const geoSources = [
    request.headers.get('x-vercel-ip-country'),     // Vercel
    request.headers.get('cf-ipcountry'),            // Cloudflare  
    request.headers.get('x-forwarded-geo'),         // Generic
    request.headers.get('x-country-code'),          // Custom proxies
    request.geo?.country,                           // Next.js geo API
  ];
  
  // Use the first non-null geolocation source
  for (const geoCountry of geoSources) {
    if (geoCountry && geoCountry.length === 2) {
      country = geoCountry.toUpperCase();
      break;
    }
  }
  
  // Force India for localhost testing
  if (request.url.includes('localhost') || request.url.includes('127.0.0.1')) {
    country = 'IN';
  }
  
  console.log(`🌍 Detected country: ${country} from IP geolocation`);
  
  // Determine currency based on country - INR for India, USD for others
  const currencyInfo = CURRENCY_MAP[country] || CURRENCY_MAP['US'];
  const isIndia = country === 'IN';
  
  // ROBUST RULE: Indians always get INR, others get USD
  const finalCurrency = isIndia ? 'INR' : 'USD';
  const finalSymbol = isIndia ? '₹' : '$';
  
  console.log(`💰 Setting currency: ${finalCurrency} (${finalSymbol}) for country: ${country}`);
  
  // Set cookies for server-side currency detection (prevents hydration issues)
  response.cookies.set('user-country', country, { 
    path: '/', 
    httpOnly: false, // Allow client-side access
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400 // 24 hours
  });
  
  // Set currency cookies for client-side access
  response.cookies.set('user-currency', finalCurrency, { 
    path: '/', 
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400
  });
  
  response.cookies.set('currency-symbol', finalSymbol, { 
    path: '/', 
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400
  });
  
  response.cookies.set('is-india', isIndia.toString(), { 
    path: '/', 
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400
  });

  // Add CSP headers for Razorpay integration (except for embed routes)
  if (!pathname.startsWith('/embed')) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://va.vercel-scripts.com https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://accounts.google.com https://va.vercel-scripts.com https://api.razorpay.com https://checkout.razorpay.com; frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com; frame-ancestors 'self';"
    );
  }

  // Complete security monitoring
  const responseTime = Date.now() - startTime;
  await securityMiddleware.processResponse(request, response, responseTime);

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}