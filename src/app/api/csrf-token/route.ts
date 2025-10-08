import { NextRequest, NextResponse } from 'next/server';
import { setCSRFToken } from '@/lib/csrf/protection';

export async function GET(req: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: 'CSRF token generated'
  });
  
  const token = setCSRFToken(response);
  
  // Also return token in response body for client-side access
  return NextResponse.json({
    success: true,
    csrfToken: token,
    message: 'CSRF token generated'
  }, {
    headers: response.headers
  });
}