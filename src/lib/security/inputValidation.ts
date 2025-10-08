/**
 * CRITICAL SECURITY FIX: Input Validation & Sanitization
 * Comprehensive input validation to prevent injection attacks
 * 
 * Features:
 * - SQL injection prevention
 * - XSS protection
 * - Path traversal prevention
 * - CSRF token validation
 * - File upload security
 * - Content type validation
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';

// Simple HTML sanitizer (production should use DOMPurify)
function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Common validation patterns
export const ValidationPatterns = {
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  SLUG: /^[a-z0-9\-]+$/,
  HEX_COLOR: /^#[0-9A-Fa-f]{6}$/,
  SAFE_STRING: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
};

// SQL injection patterns to detect
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
  /(--|\*\/|\/\*)/,
  /(\bOR\b.*\b=\b.*\bOR\b)/i,
  /(\bAND\b.*\b=\b.*\bAND\b)/i,
  /(;|\||&)/,
  /(0x[0-9a-f]+)/i,
  /(\bCAST\b|\bCONVERT\b|\bCHAR\b)/i
];

// XSS patterns to detect
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*>/gi,
  /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /data:text\/html/gi,
  /on\w+\s*=/gi
];

// Path traversal patterns
const PATH_TRAVERSAL_PATTERNS = [
  /\.\./,
  /\~\//,
  /\%2e\%2e/i,
  /\%2f/i,
  /\%5c/i
];

export class SecurityValidator {
  
  /**
   * Validates and sanitizes user input against multiple attack vectors
   */
  static validateInput(input: string, options: {
    maxLength?: number;
    allowHtml?: boolean;
    allowSpecialChars?: boolean;
    required?: boolean;
  } = {}): { isValid: boolean; sanitized: string; threats: string[] } {
    
    const threats: string[] = [];
    let isValid = true;
    let sanitized = input;

    // Required validation
    if (options.required && (!input || input.trim().length === 0)) {
      isValid = false;
      threats.push('REQUIRED_FIELD_EMPTY');
      return { isValid, sanitized: '', threats };
    }

    // Length validation
    if (options.maxLength && input.length > options.maxLength) {
      isValid = false;
      threats.push('EXCEEDS_MAX_LENGTH');
    }

    // SQL Injection detection
    for (const pattern of SQL_INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        isValid = false;
        threats.push('SQL_INJECTION_ATTEMPT');
        logger.warn('SQL injection attempt detected', { input: input.substring(0, 100) });
        break;
      }
    }

    // XSS detection
    for (const pattern of XSS_PATTERNS) {
      if (pattern.test(input)) {
        isValid = false;
        threats.push('XSS_ATTEMPT');
        logger.warn('XSS attempt detected', { input: input.substring(0, 100) });
        break;
      }
    }

    // Path traversal detection
    for (const pattern of PATH_TRAVERSAL_PATTERNS) {
      if (pattern.test(input)) {
        isValid = false;
        threats.push('PATH_TRAVERSAL_ATTEMPT');
        logger.warn('Path traversal attempt detected', { input: input.substring(0, 100) });
        break;
      }
    }

    // Sanitization
    if (options.allowHtml) {
      // Basic HTML sanitization (production should use DOMPurify)
      sanitized = input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
        .replace(/<embed\b[^<]*>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    } else {
      // Strip all HTML tags
      sanitized = input.replace(/<[^>]*>/g, '');
    }

    // Additional character restrictions
    if (!options.allowSpecialChars) {
      // Remove potentially dangerous characters
      sanitized = sanitized.replace(/[<>'"&]/g, '');
    }

    // Normalize whitespace
    sanitized = sanitized.trim().replace(/\s+/g, ' ');

    return { isValid, sanitized, threats };
  }

  /**
   * Validates email addresses with comprehensive checks
   */
  static validateEmail(email: string): { isValid: boolean; normalized: string } {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Basic pattern check
    if (!ValidationPatterns.EMAIL.test(normalizedEmail)) {
      return { isValid: false, normalized: normalizedEmail };
    }

    // Additional security checks
    const [localPart, domain] = normalizedEmail.split('@');
    
    // Check for suspicious patterns
    if (localPart.includes('..') || localPart.startsWith('.') || localPart.endsWith('.')) {
      return { isValid: false, normalized: normalizedEmail };
    }

    // Check domain
    if (domain.includes('..') || domain.startsWith('.') || domain.endsWith('.')) {
      return { isValid: false, normalized: normalizedEmail };
    }

    return { isValid: true, normalized: normalizedEmail };
  }

  /**
   * Validates UUID format
   */
  static validateUUID(uuid: string): boolean {
    return ValidationPatterns.UUID.test(uuid);
  }

  /**
   * Validates and sanitizes file uploads
   */
  static validateFileUpload(file: File, options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}): { isValid: boolean; errors: string[] } {
    
    const errors: string[] = [];
    
    // Size validation
    if (options.maxSize && file.size > options.maxSize) {
      errors.push(`File size exceeds maximum of ${options.maxSize} bytes`);
    }

    // Type validation
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} not allowed`);
    }

    // Extension validation
    if (options.allowedExtensions) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !options.allowedExtensions.includes(extension)) {
        errors.push(`File extension .${extension} not allowed`);
      }
    }

    // Filename validation
    if (PATH_TRAVERSAL_PATTERNS.some(pattern => pattern.test(file.name))) {
      errors.push('Filename contains invalid characters');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validates JSON payload
   */
  static validateJSON<T>(
    jsonString: string,
    schema: z.ZodSchema<T>
  ): { isValid: boolean; data?: T; errors: string[] } {
    
    const errors: string[] = [];
    
    try {
      const parsed = JSON.parse(jsonString);
      const result = schema.safeParse(parsed);
      
      if (result.success) {
        return { isValid: true, data: result.data, errors: [] };
      } else {
        return {
          isValid: false,
          errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        };
      }
    } catch (error) {
      errors.push('Invalid JSON format');
      return { isValid: false, errors };
    }
  }

  /**
   * Validates request headers for security
   */
  static validateRequestHeaders(req: NextRequest): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    // Check Content-Type for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.headers.get('content-type');
      if (!contentType) {
        warnings.push('Missing Content-Type header');
      } else if (!contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
        warnings.push('Unexpected Content-Type');
      }
    }

    // Check User-Agent
    const userAgent = req.headers.get('user-agent');
    if (!userAgent) {
      warnings.push('Missing User-Agent header');
    } else {
      // Check for suspicious user agents
      const suspiciousAgents = ['sqlmap', 'nmap', 'nikto', 'burpsuite', 'zaproxy'];
      if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
        warnings.push('Suspicious User-Agent detected');
        return { isValid: false, warnings };
      }
    }

    // Check Origin for CORS requests
    const origin = req.headers.get('origin');
    if (origin) {
      try {
        new URL(origin); // Validate URL format
      } catch {
        warnings.push('Invalid Origin header format');
      }
    }

    return { isValid: warnings.length === 0, warnings };
  }

  /**
   * Rate limiting check
   */
  static isRateLimited(identifier: string, limit: number, windowMs: number): boolean {
    // This would integrate with the rate limiting system
    // Implementation depends on the storage backend (Redis/Memory)
    return false; // Placeholder
  }

  /**
   * CSRF token validation
   */
  static validateCSRFToken(req: NextRequest, expectedToken: string): boolean {
    const token = req.headers.get('x-csrf-token') || 
                  req.headers.get('x-xsrf-token');
    
    return token === expectedToken;
  }

  /**
   * Content Security Policy validation
   */
  static validateCSP(content: string): { isValid: boolean; violations: string[] } {
    const violations: string[] = [];
    
    // Check for inline scripts
    if (/<script(?![^>]*src=)[^>]*>/i.test(content)) {
      violations.push('Inline script detected');
    }

    // Check for inline styles
    if (/<style[^>]*>/i.test(content) || /style\s*=/i.test(content)) {
      violations.push('Inline style detected');
    }

    // Check for javascript: URLs
    if (/javascript:/i.test(content)) {
      violations.push('JavaScript URL detected');
    }

    return { isValid: violations.length === 0, violations };
  }
}

// Common validation schemas
export const commonSchemas = {
  uuid: z.string().uuid('Invalid UUID format'),
  email: z.string().email('Invalid email format').max(255),
  slug: z.string().regex(ValidationPatterns.SLUG, 'Invalid slug format').max(100),
  hexColor: z.string().regex(ValidationPatterns.HEX_COLOR, 'Invalid hex color format'),
  safeString: z.string().regex(ValidationPatterns.SAFE_STRING, 'Contains invalid characters').max(1000),
  url: z.string().url('Invalid URL format').max(2048),
  phone: z.string().regex(ValidationPatterns.PHONE, 'Invalid phone number format').optional(),
  
  // Content validation
  chatbotName: z.string()
    .min(1, 'Chatbot name is required')
    .max(50, 'Chatbot name too long')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Chatbot name contains invalid characters'),
  
  welcomeMessage: z.string()
    .min(1, 'Welcome message is required')
    .max(500, 'Welcome message too long'),
  
  // Security-focused schemas
  fileName: z.string()
    .min(1, 'Filename is required')
    .max(255, 'Filename too long')
    .regex(/^[a-zA-Z0-9\s\-_\.\(\)]+$/, 'Filename contains invalid characters')
    .refine(name => !PATH_TRAVERSAL_PATTERNS.some(pattern => pattern.test(name)), 
            'Filename contains path traversal characters'),
            
  userRole: z.enum(['owner', 'admin', 'member']),
  subscriptionTier: z.enum(['basic', 'pro', 'ultra']),
  subscriptionStatus: z.enum(['trial', 'active', 'cancelled', 'expired', 'none'])
};

// Middleware integration helper
export function createSecureValidator<T>(schema: z.ZodSchema<T>) {
  return async (req: NextRequest): Promise<{ success: true; data: T } | { success: false; error: string }> => {
    try {
      const body = await req.json();
      
      // Validate headers first
      const headerValidation = SecurityValidator.validateRequestHeaders(req);
      if (!headerValidation.isValid) {
        logger.warn('Request header validation failed', { warnings: headerValidation.warnings });
        return { success: false, error: 'Invalid request headers' };
      }

      // Validate and parse body
      const result = schema.safeParse(body);
      if (!result.success) {
        logger.warn('Request body validation failed', { errors: result.error.errors });
        return { success: false, error: 'Invalid request data' };
      }

      return { success: true, data: result.data };
    } catch (error) {
      logger.error('Request validation error', { error });
      return { success: false, error: 'Request validation failed' };
    }
  };
}
