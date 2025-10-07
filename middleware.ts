import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultSecurityMiddleware } from '@/lib/security/middleware';

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
  // Apply comprehensive security middleware first
  const securityResponse = await defaultSecurityMiddleware.process(request);
  if (securityResponse && securityResponse.status !== 200) {
    return securityResponse;
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
  
  const res = securityResponse || NextResponse.next();
  
  // Determine currency based on country - INR for India, USD for others
  const currencyInfo = CURRENCY_MAP[country] || CURRENCY_MAP['US'];
  const isIndia = country === 'IN';
  
  // ROBUST RULE: Indians always get INR, others get USD
  const finalCurrency = isIndia ? 'INR' : 'USD';
  const finalSymbol = isIndia ? '₹' : '$';
  
  console.log(`💰 Setting currency: ${finalCurrency} (${finalSymbol}) for country: ${country}`);
  
  // Set cookies for server-side currency detection (prevents hydration issues)
  res.cookies.set('user-country', country, { 
    path: '/', 
    httpOnly: false, // Allow client-side access
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400 // 24 hours
  });
  
  // Set currency cookies for client-side access
  res.cookies.set('user-currency', finalCurrency, { 
    path: '/', 
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400
  });
  
  res.cookies.set('currency-symbol', finalSymbol, { 
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