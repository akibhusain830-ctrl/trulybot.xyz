import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { logger } from '@/lib/logger';

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters (except tab, line feed, carriage return)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize unicode
    .normalize('NFC')
    // Trim whitespace
    .trim();
};

// HTML sanitization (basic)
export const sanitizeHtml = (input: string): string => {
  return sanitizeInput(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// SQL injection prevention helpers
export const escapeSqlString = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input.replace(/'/g, "''");
};

// NoSQL injection prevention
export const sanitizeMongoQuery = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeMongoQuery);
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    // Remove keys that start with $ (MongoDB operators)
    if (key.startsWith('$')) {
      logger.warn('Blocked potential NoSQL injection attempt', { key, value });
      continue;
    }

    sanitized[key] = sanitizeMongoQuery(value);
  }

  return sanitized;
};

// Path traversal prevention
export const sanitizePath = (path: string): string => {
  return sanitizeInput(path)
    // Remove path traversal attempts
    .replace(/\.\./g, '')
    .replace(/\/+/g, '/')
    // Remove leading/trailing slashes for relative paths
    .replace(/^\/+|\/+$/g, '');
};

// Email validation and sanitization
export const validateEmail = (email: string): boolean => {
  const sanitized = sanitizeInput(email);
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(sanitized) && sanitized.length <= 254;
};

// Phone number validation
export const validatePhoneNumber = (phone: string): boolean => {
  const sanitized = sanitizeInput(phone).replace(/[^\d+\-\(\)\s]/g, '');
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(sanitized.replace(/[^\d+]/g, ''));
};

// URL validation and sanitization
export const validateUrl = (url: string, allowedProtocols: string[] = ['http', 'https']): boolean => {
  try {
    const sanitized = sanitizeInput(url);
    const parsed = new URL(sanitized);
    return allowedProtocols.includes(parsed.protocol.replace(':', ''));
  } catch {
    return false;
  }
};

// Password strength validation
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain lowercase letters');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain uppercase letters');
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    feedback.push('Password must contain numbers');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Password must contain special characters');
  } else {
    score += 1;
  }

  // Check for common patterns
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /abc123/i,
  ];

  if (commonPatterns.some(pattern => pattern.test(password))) {
    feedback.push('Password contains common patterns');
    score = Math.max(0, score - 2);
  }

  return {
    isValid: score >= 4 && feedback.length === 0,
    score,
    feedback,
  };
};

// CSRF token generation and validation
export class CSRFProtection {
  private static secret = process.env.CSRF_SECRET || 'default-csrf-secret';

  static generateToken(sessionId: string): string {
    const timestamp = Date.now().toString();
    const data = `${sessionId}:${timestamp}`;
    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(data)
      .digest('hex');

    return `${timestamp}:${signature}`;
  }

  static validateToken(token: string, sessionId: string, maxAge: number = 3600000): boolean {
    try {
      const [timestamp, signature] = token.split(':');
      
      if (!timestamp || !signature) {
        return false;
      }

      // Check if token is not expired
      const tokenTime = parseInt(timestamp, 10);
      if (Date.now() - tokenTime > maxAge) {
        return false;
      }

      // Validate signature
      const data = `${sessionId}:${timestamp}`;
      const expectedSignature = crypto
        .createHmac('sha256', this.secret)
        .update(data)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch {
      return false;
    }
  }
}

// Request signature validation (for webhooks)
export const validateWebhookSignature = (
  payload: string,
  signature: string,
  secret: string,
  algorithm: string = 'sha256'
): boolean => {
  try {
    const expectedSignature = crypto
      .createHmac(algorithm, secret)
      .update(payload)
      .digest('hex');

    const receivedSignature = signature.startsWith('sha256=') 
      ? signature.slice(7) 
      : signature;

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    );
  } catch {
    return false;
  }
};

// IP address validation and geolocation checks
export const validateIPAddress = (ip: string): boolean => {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

// Check for suspicious patterns in requests
export const detectSuspiciousPatterns = (req: NextRequest): string[] => {
  const suspiciousPatterns: string[] = [];
  const url = req.url;
  const userAgent = req.headers.get('user-agent') || '';
  
  // SQL injection patterns
  const sqlPatterns = [
    /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)/i,
    /(\bOR\s+1\s*=\s*1\b|\bAND\s+1\s*=\s*1\b)/i,
    /'.*(\bOR\b|\bAND\b).*'/i,
  ];

  // XSS patterns
  const xssPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
  ];

  // Path traversal patterns
  const pathTraversalPatterns = [
    /\.\.\//,
    /\.\.\\/,
    /%2e%2e%2f/i,
    /%2e%2e%5c/i,
  ];

  // Check URL for suspicious patterns
  sqlPatterns.forEach((pattern, index) => {
    if (pattern.test(url)) {
      suspiciousPatterns.push(`SQL injection pattern ${index + 1} in URL`);
    }
  });

  xssPatterns.forEach((pattern, index) => {
    if (pattern.test(url)) {
      suspiciousPatterns.push(`XSS pattern ${index + 1} in URL`);
    }
  });

  pathTraversalPatterns.forEach((pattern, index) => {
    if (pattern.test(url)) {
      suspiciousPatterns.push(`Path traversal pattern ${index + 1} in URL`);
    }
  });

  // Check user agent for suspicious patterns
  const suspiciousUserAgents = [
    /sqlmap/i,
    /nmap/i,
    /nikto/i,
    /burp/i,
    /zap/i,
  ];

  suspiciousUserAgents.forEach((pattern, index) => {
    if (pattern.test(userAgent)) {
      suspiciousPatterns.push(`Suspicious user agent pattern ${index + 1}`);
    }
  });

  if (suspiciousPatterns.length > 0) {
    logger.warn('Detected suspicious patterns in request', {
      patterns: suspiciousPatterns,
      url,
      userAgent,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
    });
  }

  return suspiciousPatterns;
};

// Content type validation
export const validateContentType = (
  contentType: string,
  allowedTypes: string[]
): boolean => {
  if (!contentType) return false;
  
  const normalizedType = contentType.split(';')[0].trim().toLowerCase();
  return allowedTypes.includes(normalizedType);
};

// File upload security
export const validateFileUpload = (
  file: File,
  options: {
    maxSize: number;
    allowedTypes: string[];
    allowedExtensions: string[];
  }
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check file size
  if (file.size > options.maxSize) {
    errors.push(`File size exceeds ${options.maxSize} bytes`);
  }

  // Check MIME type
  if (!options.allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !options.allowedExtensions.includes(extension)) {
    errors.push(`File extension .${extension} is not allowed`);
  }

  // Check for malicious file names
  const maliciousPatterns = [
    /\.\./,
    /[<>:"|?*]/,
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i,
  ];

  if (maliciousPatterns.some(pattern => pattern.test(file.name))) {
    errors.push('File name contains invalid characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};