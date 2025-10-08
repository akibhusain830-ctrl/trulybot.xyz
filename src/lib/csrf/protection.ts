import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

// Generate a random CSRF token
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

// Set CSRF token in HTTP-only cookie
export function setCSRFToken(response: NextResponse): string {
  const token = generateCSRFToken();
  
  response.cookies.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400, // 24 hours
    path: '/'
  });
  
  return token;
}

// Validate CSRF token from request
export function validateCSRFToken(req: NextRequest): boolean {
  const cookieToken = req.cookies.get('csrf-token')?.value;
  const headerToken = req.headers.get('x-csrf-token');
  
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(cookieToken, headerToken);
}

// Timing-safe string comparison
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

// Middleware to check CSRF token for state-changing operations
export function requireCSRF(req: NextRequest): NextResponse | null {
  const method = req.method;
  
  // Only check CSRF for state-changing operations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    if (!validateCSRFToken(req)) {
      return NextResponse.json({
        error: 'Invalid CSRF token',
        code: 'CSRF_INVALID'
      }, { status: 403 });
    }
  }
  
  return null; // Valid, continue
}

// Get CSRF token for client-side use
export function getCSRFToken(req: NextRequest): string | null {
  return req.cookies.get('csrf-token')?.value || null;
}