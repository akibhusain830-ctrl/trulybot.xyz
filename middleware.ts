import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultSecurityMiddleware } from '@/lib/security/middleware';

export async function middleware(request: NextRequest) {
  // Apply comprehensive security middleware first
  const securityResponse = await defaultSecurityMiddleware.process(request);
  if (securityResponse && securityResponse.status !== 200) {
    return securityResponse;
  }

  const country = request.headers.get('x-vercel-ip-country') || 'US';
  const res = securityResponse || NextResponse.next();
  
  // Set country cookie for personalization
  res.cookies.set('country', country, { 
    path: '/', 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};