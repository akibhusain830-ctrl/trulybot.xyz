import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultSecurityMiddleware } from '@/lib/security/middleware';

export async function middleware(request: NextRequest) {
  // Apply comprehensive security middleware first
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