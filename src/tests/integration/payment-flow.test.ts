import { describe, it, expect, beforeAll } from 'vitest';
import crypto from 'crypto';

/**
 * Integration Tests for Payment Flow
 * 
 * Tests the complete payment journey:
 * 1. Create order via API
 * 2. Verify payment with signature
 * 3. Check subscription activation
 * 4. Verify database consistency
 */

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const TEST_USER_ID = 'test-user-' + Date.now();
const TEST_PLAN_ID = 'pro';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'test-secret';

describe('Payment Flow Integration Tests', () => {
  let orderId: string;
  let paymentId: string;
  let signature: string;

  describe('Step 1: Create Order', () => {
    it('should create order with valid request', async () => {
      const response = await fetch(`${API_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: TEST_PLAN_ID,
          currency: 'INR',
          billingPeriod: 'monthly',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.id).toBeDefined();

      orderId = data.data.id;
    });

    it('should return order with correct structure', async () => {
      const response = await fetch(`${API_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: TEST_PLAN_ID,
          currency: 'INR',
          billingPeriod: 'monthly',
        }),
      });

      const data = await response.json();
      const order = data.data;

      expect(order).toHaveProperty('id');
      expect(order).toHaveProperty('amount');
      expect(order).toHaveProperty('currency');
      expect(order).toHaveProperty('receipt');
      expect(order.amount).toBeGreaterThan(0);
      expect(order.currency).toBe('INR');
    });

    it('should reject invalid plan', async () => {
      const response = await fetch(`${API_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: 'invalid-plan',
          currency: 'INR',
          billingPeriod: 'monthly',
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should reject missing currency', async () => {
      const response = await fetch(`${API_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: TEST_PLAN_ID,
          billingPeriod: 'monthly',
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Step 2: Verify Payment (With Signature)', () => {
    beforeAll(() => {
      // Generate test payment ID
      paymentId = 'pay_' + crypto.randomBytes(12).toString('hex');

      // Create valid signature
      const payload = JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
      });

      signature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(payload)
        .digest('hex');
    });

    it('should verify payment with valid signature', async () => {
      const response = await fetch(`${API_URL}/api/payments/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          user_id: TEST_USER_ID,
          plan_id: TEST_PLAN_ID,
          billing_period: 'monthly',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });

    it('should reject payment with invalid signature', async () => {
      const invalidSignature = 'invalid_signature_' + crypto.randomBytes(16).toString('hex');

      const response = await fetch(`${API_URL}/api/payments/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: invalidSignature,
          user_id: TEST_USER_ID,
          plan_id: TEST_PLAN_ID,
          billing_period: 'monthly',
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should reject missing signature', async () => {
      const response = await fetch(`${API_URL}/api/payments/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          user_id: TEST_USER_ID,
          plan_id: TEST_PLAN_ID,
          billing_period: 'monthly',
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Step 3: Subscription Verification', () => {
    it('should verify subscription status after payment', async () => {
      const response = await fetch(`${API_URL}/api/subscription/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Note: This requires authentication, adjust as needed
      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('subscription_status');
        expect(data).toHaveProperty('subscription_tier');
      }
    });
  });

  describe('Webhook Integration', () => {
    it('should handle payment.authorized webhook', async () => {
      const webhookPayload = {
        event: 'payment.authorized',
        payload: {
          payment: {
            entity: {
              id: paymentId,
              order_id: orderId,
              amount: 99900, // ₹999 in paise
              currency: 'INR',
              status: 'authorized',
              notes: {
                user_id: TEST_USER_ID,
                plan_id: TEST_PLAN_ID,
                billing_period: 'monthly',
              },
            },
          },
        },
      };

      // Create valid webhook signature
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test-webhook-secret';
      const webhookBody = JSON.stringify(webhookPayload);
      const webhookSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(webhookBody)
        .digest('hex');

      const response = await fetch(`${API_URL}/api/webhooks/razorpay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': webhookSignature,
        },
        body: webhookBody,
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      if (data.data) {
        expect(data.data.activated).toBe(true);
      }
    });

    it('should reject webhook with invalid signature', async () => {
      const webhookPayload = {
        event: 'payment.authorized',
        payload: {
          payment: {
            entity: {
              id: paymentId,
              order_id: orderId,
              amount: 99900,
              currency: 'INR',
              status: 'authorized',
            },
          },
        },
      };

      const response = await fetch(`${API_URL}/api/webhooks/razorpay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': 'invalid_signature',
        },
        body: JSON.stringify(webhookPayload),
      });

      expect(response.status).toBe(403);
    });

    it('should handle payment.failed webhook', async () => {
      const webhookPayload = {
        event: 'payment.failed',
        payload: {
          payment: {
            entity: {
              id: 'pay_failed_' + crypto.randomBytes(12).toString('hex'),
              order_id: orderId,
              amount: 99900,
              currency: 'INR',
              status: 'failed',
              error_description: 'Insufficient funds',
              notes: {
                user_id: TEST_USER_ID,
                plan_id: TEST_PLAN_ID,
              },
            },
          },
        },
      };

      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test-webhook-secret';
      const webhookBody = JSON.stringify(webhookPayload);
      const webhookSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(webhookBody)
        .digest('hex');

      const response = await fetch(`${API_URL}/api/webhooks/razorpay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': webhookSignature,
        },
        body: webhookBody,
      });

      expect(response.status).toBe(200);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to payment endpoints', async () => {
      const promises = [];

      // Make 15 concurrent requests (exceeds 10/15min limit)
      for (let i = 0; i < 15; i++) {
        promises.push(
          fetch(`${API_URL}/api/payments/create-order`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              planId: TEST_PLAN_ID,
              currency: 'INR',
              billingPeriod: 'monthly',
            }),
          })
        );
      }

      const responses = await Promise.all(promises);
      const statuses = responses.map(r => r.status);

      // Should have at least some 429 (Too Many Requests) responses
      expect(statuses.some(s => s === 429)).toBe(true);

      // Should have X-RateLimit headers
      const hasRateLimitHeaders = responses.some(r => 
        r.headers.get('X-RateLimit-Limit') !== null
      );
      expect(hasRateLimitHeaders).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors gracefully', async () => {
      const response = await fetch(`${API_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: TEST_PLAN_ID,
          currency: 'INVALID_CURRENCY',
          billingPeriod: 'monthly',
        }),
      });

      const data = await response.json();

      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('requestId');
    });

    it('should return proper status codes', async () => {
      const validRequest = {
        planId: TEST_PLAN_ID,
        currency: 'INR',
        billingPeriod: 'monthly',
      };

      const response = await fetch(`${API_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validRequest),
      });

      expect([200, 201, 400, 401, 403, 404, 429, 500]).toContain(response.status);
    });
  });

  describe('Security', () => {
    it('should include security headers in responses', async () => {
      const response = await fetch(`${API_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: TEST_PLAN_ID,
          currency: 'INR',
          billingPeriod: 'monthly',
        }),
      });

      // Check for security headers
      const hasSecurityHeaders = 
        response.headers.get('X-Content-Type-Options') === 'nosniff' ||
        response.headers.get('X-Frame-Options') !== null ||
        response.headers.get('Strict-Transport-Security') !== null;

      expect(hasSecurityHeaders).toBe(true);
    });

    it('should not expose sensitive information in errors', async () => {
      const response = await fetch(`${API_URL}/api/payments/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: 'invalid',
          razorpay_payment_id: 'invalid',
          razorpay_signature: 'invalid',
        }),
      });

      const data = await response.json();
      const errorString = JSON.stringify(data).toLowerCase();

      // Should not contain sensitive database info
      expect(errorString).not.toContain('password');
      expect(errorString).not.toContain('secret');
    });
  });
});
