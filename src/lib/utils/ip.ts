import { NextRequest } from 'next/server';

/**
 * Get client IP address from request headers
 */
export const getClientIP = (req: NextRequest): string => {
  // Check common proxy headers
  const xForwardedFor = req.headers.get('x-forwarded-for');
  const xRealIp = req.headers.get('x-real-ip');
  const xClientIp = req.headers.get('x-client-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip'); // Cloudflare

  // X-Forwarded-For can contain multiple IPs, get the first one
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',').map(ip => ip.trim());
    return ips[0];
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  if (xRealIp) {
    return xRealIp;
  }

  if (xClientIp) {
    return xClientIp;
  }

  // Fallback to connection IP (may not be available in serverless)
  return 'unknown';
};

/**
 * Check if IP is in private range
 */
export const isPrivateIP = (ip: string): boolean => {
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[01])\./,
    /^192\.168\./,
    /^127\./,
    /^::1$/,
    /^fe80:/,
  ];

  return privateRanges.some(range => range.test(ip));
};

/**
 * Normalize IP address for comparison
 */
export const normalizeIP = (ip: string): string => {
  return ip.trim().toLowerCase();
};

/**
 * Check if IP is in blocked list
 */
export const isBlockedIP = (ip: string, blockedIPs: string[] = []): boolean => {
  const normalized = normalizeIP(ip);
  return blockedIPs.some(blockedIP => normalizeIP(blockedIP) === normalized);
};

/**
 * Get geographical info from IP (placeholder - integrate with actual service)
 */
export const getIPGeolocation = async (ip: string): Promise<{
  country?: string;
  region?: string;
  city?: string;
  isp?: string;
  threat?: boolean;
} | null> => {
  // In production, integrate with services like:
  // - MaxMind GeoIP2
  // - IPStack
  // - IPinfo
  // - Cloudflare Analytics
  
  try {
    // Placeholder implementation
    if (isPrivateIP(ip)) {
      return {
        country: 'Private',
        region: 'Private',
        city: 'Private',
        isp: 'Private Network',
        threat: false,
      };
    }

    // This would be replaced with actual geolocation service
    return null;
  } catch (error) {
    console.error('Error getting IP geolocation:', error);
    return null;
  }
};