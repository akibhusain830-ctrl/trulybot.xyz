// OAuth Security and Validation Utilities
// This module provides enhanced security measures for OAuth authentication

/**
 * Validates OAuth state parameter to prevent CSRF attacks
 */
export function generateOAuthState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates OAuth redirect URL to prevent open redirect attacks
 */
export function validateRedirectUrl(url: string, allowedDomains: string[]): boolean {
  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.toLowerCase();
    
    // Check if domain is in allowed list
    return allowedDomains.some(allowed => {
      const allowedDomain = allowed.toLowerCase();
      return domain === allowedDomain || domain.endsWith('.' + allowedDomain);
    });
  } catch {
    return false;
  }
}

/**
 * Sanitizes OAuth error messages to prevent XSS
 */
export function sanitizeOAuthError(error: string): string {
  // Remove potential script tags and HTML
  return error
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"&]/g, '') // Remove dangerous characters
    .substring(0, 200); // Limit length
}

/**
 * Rate limiting for OAuth attempts
 */
export class OAuthRateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private readonly maxAttempts = 5;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier);

    if (!userAttempts) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    // Reset if window has passed
    if (now - userAttempts.lastAttempt > this.windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    // Check if under limit
    if (userAttempts.count < this.maxAttempts) {
      userAttempts.count++;
      userAttempts.lastAttempt = now;
      return true;
    }

    return false;
  }

  getRemainingTime(identifier: string): number {
    const userAttempts = this.attempts.get(identifier);
    if (!userAttempts) return 0;

    const elapsed = Date.now() - userAttempts.lastAttempt;
    return Math.max(0, this.windowMs - elapsed);
  }
}

/**
 * Validates OAuth provider configuration
 */
export function validateOAuthConfig(): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    errors.push('GOOGLE_CLIENT_ID is required');
  }

  if (!process.env.GOOGLE_CLIENT_SECRET) {
    errors.push('GOOGLE_CLIENT_SECRET is required');
  }

  // Validate Google Client ID format
  if (process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com')) {
    errors.push('GOOGLE_CLIENT_ID format is invalid');
  }

  // Validate Supabase URL format
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('.supabase.co')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL format is invalid');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Security headers for OAuth endpoints
 */
export const OAUTH_SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
} as const;