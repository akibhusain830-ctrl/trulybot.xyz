
import { z } from 'zod';
import { NextRequest } from 'next/server';
import { logger } from './logger';

// Core type definitions
export const SubscriptionTier = z.enum(['basic', 'pro', 'ultra']);
export const BillingPeriod = z.enum(['monthly', 'yearly']);
export const UserRole = z.enum(['user', 'admin']);

// Basic validation schemas
export const userIdSchema = z.string().uuid('Invalid user ID format');
export const emailSchema = z.string().email('Invalid email address').max(255);
export const planIdSchema = SubscriptionTier;
export const billingPeriodSchema = BillingPeriod;

// Enhanced profile settings validation
export const profileSettingsSchema = z.object({
  chatbot_name: z.string()
    .min(1, 'Chatbot name is required')
    .max(50, 'Chatbot name must be 50 characters or less')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Chatbot name contains invalid characters')
    .optional(),
  welcome_message: z.string()
    .min(1, 'Welcome message is required')
    .max(500, 'Welcome message must be 500 characters or less')
    .optional(),
  accent_color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format (must be hex color)')
    .optional(),
  is_active: z.boolean().optional(),
});

// Password validation with security requirements
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must be 128 characters or less')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New password and confirmation don't match",
  path: ["confirmPassword"],
});

// Payment validation schemas with enhanced security
export const razorpayOrderIdSchema = z.string()
  .min(1, 'Order ID is required')
  .max(255, 'Order ID too long')
  .regex(/^order_[a-zA-Z0-9]+$/, 'Invalid Razorpay order ID format');

export const razorpayPaymentIdSchema = z.string()
  .min(1, 'Payment ID is required')
  .max(255, 'Payment ID too long')
  .regex(/^pay_[a-zA-Z0-9]+$/, 'Invalid Razorpay payment ID format');

export const razorpaySignatureSchema = z.string()
  .min(1, 'Signature is required')
  .max(512, 'Signature too long')
  .regex(/^[a-f0-9]+$/, 'Invalid signature format');

export const paymentVerificationSchema = z.object({
  razorpay_order_id: razorpayOrderIdSchema,
  razorpay_payment_id: razorpayPaymentIdSchema,
  razorpay_signature: razorpaySignatureSchema,
  user_id: userIdSchema,
  plan_id: planIdSchema,
  billing_period: billingPeriodSchema.optional().default('monthly'),
  amount: z.number().positive('Amount must be positive').max(1000000, 'Amount too large').optional(),
});

// Order creation validation
export const createOrderSchema = z.object({
  plan_id: planIdSchema,
  currency: z.enum(['INR', 'USD']).default('INR'),
  billing_period: billingPeriodSchema.default('monthly'),
  user_id: userIdSchema,
  receipt: z.string().max(255, 'Receipt too long').optional(),
  notes: z.record(z.string().max(500)).optional(),
});

// Trial activation validation
export const trialActivationSchema = z.object({
  user_id: userIdSchema.optional(), // Optional as it can be derived from auth
  tier: z.enum(['ultra']).default('ultra'), // Only ultra tier for trials
});

// Lead management validation
export const leadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: emailSchema,
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  message: z.string().max(1000, 'Message too long').optional(),
  source: z.string().max(50, 'Source too long').optional(),
});

// API key validation
export const apiKeySchema = z.string()
  .min(32, 'API key too short')
  .max(128, 'API key too long')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid API key format');

// Request metadata validation
export const requestMetadataSchema = z.object({
  user_agent: z.string().max(500).optional(),
  ip_address: z.string().ip().optional(),
  referrer: z.string().url().max(500).optional(),
  timestamp: z.number().int().positive().optional(),
});

// Enhanced request validation with security checks
export async function validateRequest<T>(
  req: NextRequest,
  schema: z.ZodSchema<T>,
  options: {
    skipSizeCheck?: boolean;
    maxSize?: number;
    logValidationErrors?: boolean;
  } = {}
): Promise<{ success: true; data: T } | { success: false; error: string; details?: any }> {
  const requestId = req.headers.get('x-request-id') || 'unknown';
  
  try {
    // Security: Check request method
    const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    if (!allowedMethods.includes(req.method)) {
      return { success: false, error: 'Method not allowed' };
    }

    // Security: Check content type for body requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.headers.get('content-type');
      if (!contentType || !contentType.toLowerCase().includes('application/json')) {
        return { success: false, error: 'Content-Type must be application/json' };
      }
    }

    // Security: Check request size
    if (!options.skipSizeCheck) {
      const maxSize = options.maxSize || 1024 * 1024; // 1MB default
      const contentLength = req.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > maxSize) {
        logger.warn('Request size exceeded limit', { requestId, size: contentLength, limit: maxSize });
        return { success: false, error: 'Request too large' };
      }
    }

    // Security: Check for common attack patterns in headers
    const suspiciousHeaders = ['x-forwarded-host', 'x-real-ip'];
    for (const header of suspiciousHeaders) {
      const value = req.headers.get(header);
      if (value && (value.includes('<script') || value.includes('javascript:'))) {
        logger.warn('Suspicious header detected', { requestId, header, value });
        return { success: false, error: 'Invalid request headers' };
      }
    }

    let body;
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      try {
        const text = await req.text();
        
        // Security: Check for common injection patterns
        const injectionPatterns = [
          /<script[^>]*>.*?<\/script>/gi,
          /javascript:/gi,
          /on\w+\s*=/gi,
          /union\s+select/gi,
          /drop\s+table/gi,
        ];
        
        for (const pattern of injectionPatterns) {
          if (pattern.test(text)) {
            logger.warn('Injection attempt detected', { requestId, pattern: pattern.source });
            return { success: false, error: 'Invalid request content' };
          }
        }
        
        body = JSON.parse(text);
      } catch (error) {
        logger.warn('JSON parsing failed', { requestId, error: error instanceof Error ? error.message : 'Unknown error' });
        return { success: false, error: 'Invalid JSON in request body' };
      }
    } else {
      // For GET requests, validate query parameters
      const url = new URL(req.url);
      body = Object.fromEntries(url.searchParams.entries());
    }

    // Schema validation
    const result = schema.safeParse(body);
    
    if (!result.success) {
      const errorDetails = result.error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));
      
      const errorMessage = errorDetails
        .map(err => `${err.path}: ${err.message}`)
        .join(', ');
      
      if (options.logValidationErrors) {
        logger.warn('Request validation failed', { 
          requestId, 
          errors: errorDetails,
          url: req.url,
          method: req.method 
        });
      }
      
      return { 
        success: false, 
        error: `Validation failed: ${errorMessage}`,
        details: errorDetails 
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    logger.error('Request validation error', { 
      requestId, 
      error: error instanceof Error ? error.message : 'Unknown error',
      url: req.url,
      method: req.method 
    });
    return { success: false, error: 'Request validation failed' };
  }
}

// Sanitization utilities
export function sanitizeString(input: string, maxLength: number = 255): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>\"'&\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters and basic XSS
    .replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width characters
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/[^\d+()-\s]/g, '').trim();
}

// Type exports for TypeScript
export type SubscriptionTierType = z.infer<typeof SubscriptionTier>;
export type BillingPeriodType = z.infer<typeof BillingPeriod>;
export type PaymentVerificationData = z.infer<typeof paymentVerificationSchema>;
export type CreateOrderData = z.infer<typeof createOrderSchema>;
export type TrialActivationData = z.infer<typeof trialActivationSchema>;
export type LeadData = z.infer<typeof leadSchema>;
export type ProfileSettingsData = z.infer<typeof profileSettingsSchema>;
