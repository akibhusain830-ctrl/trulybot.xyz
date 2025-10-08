import crypto from 'crypto';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SubscriptionService } from '@/lib/subscription/subscriptionService.server';

export interface PaymentValidationResult {
  isValid: boolean;
  error?: string;
  details?: any;
}

export interface WebhookValidationResult {
  isValid: boolean;
  event?: any;
  error?: string;
}

export interface OrderSecurityCheck {
  isValid: boolean;
  userId?: string;
  planId?: string;
  amount?: number;
  error?: string;
}

export interface PaymentEvent {
  type: 'payment.captured' | 'payment.failed' | 'order.paid';
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  userId: string;
  planId: string;
  timestamp: Date;
}

export class SecurePaymentService {
  private supabase: any = null;
  private subscriptionService: SubscriptionService | null = null;

  constructor() {
    // Don't initialize at constructor time - lazy load when needed
  }

  private getSupabase() {
    if (!this.supabase) {
      this.supabase = createServerSupabaseClient();
    }
    return this.supabase;
  }

  private getSubscriptionService() {
    if (!this.subscriptionService) {
      this.subscriptionService = new SubscriptionService();
    }
    return this.subscriptionService;
  }

  /**
   * Validate payment webhook signature with timing-safe comparison
   */
  async validateWebhookSignature(
    rawBody: string,
    signature: string,
    secret: string
  ): Promise<WebhookValidationResult> {
    try {
      if (!rawBody || !signature || !secret) {
        return {
          isValid: false,
          error: 'Missing webhook validation parameters'
        };
      }

      // Generate expected signature
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody, 'utf8')
        .digest('hex');

      // Timing-safe comparison to prevent timing attacks
      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );

      if (!isValid) {
        await this.logSecurityEvent('webhook_signature_invalid', {
          providedSignature: signature.substring(0, 10) + '...',
          expectedLength: expectedSignature.length,
          providedLength: signature.length
        });

        return {
          isValid: false,
          error: 'Invalid webhook signature'
        };
      }

      // Parse and validate event structure
      let event;
      try {
        event = JSON.parse(rawBody);
      } catch (parseError) {
        return {
          isValid: false,
          error: 'Invalid JSON in webhook payload'
        };
      }

      // Validate event structure
      if (!event.event || !event.payload) {
        return {
          isValid: false,
          error: 'Invalid webhook event structure'
        };
      }

      return {
        isValid: true,
        event
      };
    } catch (error) {
      console.error('[SecurePaymentService] Webhook validation error:', error);
      return {
        isValid: false,
        error: 'Webhook validation failed'
      };
    }
  }

  /**
   * Validate payment signature from client
   */
  async validatePaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
    secret: string
  ): Promise<PaymentValidationResult> {
    try {
      if (!orderId || !paymentId || !signature || !secret) {
        return {
          isValid: false,
          error: 'Missing payment validation parameters'
        };
      }

      // Create signature string
      const signatureString = `${orderId}|${paymentId}`;
      
      // Generate expected signature
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(signatureString, 'utf8')
        .digest('hex');

      // Timing-safe comparison
      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );

      if (!isValid) {
        await this.logSecurityEvent('payment_signature_invalid', {
          orderId,
          paymentId,
          providedSignature: signature.substring(0, 10) + '...'
        });
      }

      return {
        isValid,
        error: isValid ? undefined : 'Invalid payment signature'
      };
    } catch (error) {
      console.error('[SecurePaymentService] Payment signature validation error:', error);
      return {
        isValid: false,
        error: 'Payment signature validation failed'
      };
    }
  }

  /**
   * Validate order ownership and integrity
   */
  async validateOrderSecurity(
    orderId: string,
    userId?: string
  ): Promise<OrderSecurityCheck> {
    try {
      // Fetch order details
      const { data: order, error } = await this.getSupabase()
        .from('orders')
        .select('user_id, plan_id, amount, currency, status, created_at')
        .eq('razorpay_order_id', orderId)
        .single();

      if (error || !order) {
        await this.logSecurityEvent('order_not_found', {
          orderId,
          requestedUserId: userId
        });

        return {
          isValid: false,
          error: 'Order not found'
        };
      }

      // Validate user ownership if provided
      if (userId && order.user_id !== userId) {
        await this.logSecurityEvent('order_ownership_violation', {
          orderId,
          orderUserId: order.user_id,
          requestedUserId: userId
        });

        return {
          isValid: false,
          error: 'Order access denied'
        };
      }

      // Check order status - prevent reprocessing
      if (order.status === 'completed' || order.status === 'paid') {
        await this.logSecurityEvent('order_already_processed', {
          orderId,
          currentStatus: order.status,
          userId: order.user_id
        });

        return {
          isValid: false,
          error: 'Order already processed'
        };
      }

      // Check order age - prevent old order reuse
      const orderAge = Date.now() - new Date(order.created_at).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (orderAge > maxAge) {
        await this.logSecurityEvent('order_expired', {
          orderId,
          orderAge: Math.round(orderAge / 1000 / 60), // minutes
          userId: order.user_id
        });

        return {
          isValid: false,
          error: 'Order expired'
        };
      }

      return {
        isValid: true,
        userId: order.user_id,
        planId: order.plan_id,
        amount: order.amount
      };
    } catch (error) {
      console.error('[SecurePaymentService] Order validation error:', error);
      return {
        isValid: false,
        error: 'Order validation failed'
      };
    }
  }

  /**
   * Process secure payment event with idempotency
   */
  async processPaymentEvent(event: PaymentEvent): Promise<{ success: boolean; error?: string }> {
    try {
      // Check for duplicate payment processing (idempotency)
      const { data: existingPayment } = await this.getSupabase()
        .from('billing_history')
        .select('id')
        .eq('razorpay_payment_id', event.paymentId)
        .single();

      if (existingPayment) {
        return {
          success: true // Already processed, return success
        };
      }

      // Validate order one more time
      const orderCheck = await this.validateOrderSecurity(event.orderId, event.userId);
      if (!orderCheck.isValid) {
        return {
          success: false,
          error: orderCheck.error
        };
      }

      // Begin transaction for atomic operations
      const { error: transactionError } = await this.getSupabase().rpc('process_payment_securely', {
        p_user_id: event.userId,
        p_plan_id: event.planId,
        p_payment_id: event.paymentId,
        p_order_id: event.orderId,
        p_amount: event.amount,
        p_currency: event.currency,
        p_status: event.status
      });

      if (transactionError) {
        throw transactionError;
      }

      // Log successful payment
      await this.logSecurityEvent('payment_processed_successfully', {
        paymentId: event.paymentId,
        orderId: event.orderId,
        userId: event.userId,
        planId: event.planId,
        amount: event.amount
      });

      return { success: true };

    } catch (error) {
      console.error('[SecurePaymentService] Payment processing error:', error);
      
      await this.logSecurityEvent('payment_processing_failed', {
        paymentId: event.paymentId,
        orderId: event.orderId,
        userId: event.userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: 'Payment processing failed'
      };
    }
  }

  /**
   * Validate subscription upgrade eligibility
   */
  async validateSubscriptionUpgrade(
    userId: string,
    newPlanId: string,
    amount: number
  ): Promise<{ isValid: boolean; error?: string }> {
    try {
      // Get current subscription status
      const currentStatus = await this.getSubscriptionService().getUserSubscriptionStatus(userId);
      
      // Validate upgrade path
      const upgradeValidation = this.validateUpgradePath(
        currentStatus.tier,
        newPlanId
      );

      if (!upgradeValidation.isValid) {
        return upgradeValidation;
      }

      // Validate amount matches plan
      const expectedAmount = this.getPlanAmount(newPlanId);
      if (amount !== expectedAmount) {
        await this.logSecurityEvent('amount_mismatch', {
          userId,
          planId: newPlanId,
          expectedAmount,
          providedAmount: amount
        });

        return {
          isValid: false,
          error: 'Amount mismatch for selected plan'
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('[SecurePaymentService] Subscription validation error:', error);
      return {
        isValid: false,
        error: 'Subscription validation failed'
      };
    }
  }

  /**
   * Prevent payment bypass attacks
   */
  async validatePaymentFlow(
    userId: string,
    orderId: string,
    sessionData?: any
  ): Promise<{ isValid: boolean; error?: string }> {
    try {
      // Check if user has active session
      if (sessionData?.user?.id !== userId) {
        await this.logSecurityEvent('session_user_mismatch', {
          sessionUserId: sessionData?.user?.id,
          paymentUserId: userId,
          orderId
        });

        return {
          isValid: false,
          error: 'Session validation failed'
        };
      }

      // Check for suspicious payment patterns
      const suspiciousActivity = await this.detectSuspiciousPaymentActivity(userId);
      if (suspiciousActivity.isSuspicious) {
        await this.logSecurityEvent('suspicious_payment_pattern', {
          userId,
          orderId,
          reason: suspiciousActivity.reason
        });

        return {
          isValid: false,
          error: 'Payment validation failed'
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('[SecurePaymentService] Payment flow validation error:', error);
      return {
        isValid: false,
        error: 'Payment flow validation failed'
      };
    }
  }

  /**
   * Detect suspicious payment activity
   */
  private async detectSuspiciousPaymentActivity(
    userId: string
  ): Promise<{ isSuspicious: boolean; reason?: string }> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Check for multiple payment attempts in short time
      const { data: recentAttempts, error } = await this.getSupabase()
        .from('orders')
        .select('id, created_at, status')
        .eq('user_id', userId)
        .gte('created_at', oneHourAgo.toISOString());

      if (error) throw error;

      if (recentAttempts && recentAttempts.length > 5) {
        return {
          isSuspicious: true,
          reason: 'Too many payment attempts in short time'
        };
      }

      // Check for rapid subscription changes
      const failedAttempts = recentAttempts?.filter((a: any) => a.status === 'failed') || [];
      if (failedAttempts.length > 3) {
        return {
          isSuspicious: true,
          reason: 'Multiple failed payment attempts'
        };
      }

      return { isSuspicious: false };
    } catch (error) {
      console.error('[SecurePaymentService] Suspicious activity detection error:', error);
      // Don't block payment on detection error
      return { isSuspicious: false };
    }
  }

  /**
   * Validate upgrade path
   */
  private validateUpgradePath(
    currentTier: string,
    newPlanId: string
  ): { isValid: boolean; error?: string } {
    const tierHierarchy = ['free', 'basic', 'pro', 'ultra'];
    const currentIndex = tierHierarchy.indexOf(currentTier);
    const newIndex = tierHierarchy.indexOf(newPlanId);

    if (newIndex <= currentIndex) {
      return {
        isValid: false,
        error: 'Invalid upgrade path'
      };
    }

    return { isValid: true };
  }

  /**
   * Get plan amount for validation
   */
  private getPlanAmount(planId: string): number {
    const pricing = {
      'basic': 999, // ₹9.99
      'pro': 2999,  // ₹29.99
      'ultra': 4999 // ₹49.99
    };

    return pricing[planId as keyof typeof pricing] || 0;
  }

  /**
   * Log security events for monitoring
   */
  private async logSecurityEvent(event: string, details: any): Promise<void> {
    try {
      console.log(`[SecurePaymentService:${event}]`, {
        timestamp: new Date().toISOString(),
        ...details
      });

      // In production, send to security monitoring service
      // await this.securityLogger.log(event, details);
    } catch (error) {
      console.error('[SecurePaymentService] Failed to log security event:', error);
    }
  }
}

export const securePaymentService = new SecurePaymentService();