import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const country = request.headers.get('x-vercel-ip-country') || 'US';
  const response = NextResponse.next();
  response.cookies.set('country', country, { path: '/' });
  return response;
}

export const config = {
  matcher: ['/pricing'],
};