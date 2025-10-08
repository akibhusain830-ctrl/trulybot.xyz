'use client';
import React, { useState } from 'react';
import { BRAND } from '@/lib/branding';
import { loadRazorpay } from '@/lib/razorpayLoader';
import { logger } from '@/lib/logger';

// This declares that a 'window' object with any properties can exist, which is needed for third-party scripts like Razorpay.
declare const window: any;

// Defines the properties (props) the component accepts.
interface Props {
  amount: number; // retained for display but not trusted by server
  currency: 'INR' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD'; // Accept all currencies
  billingPeriod: 'monthly' | 'yearly'; // IMPROVEMENT: Added billing period
  label: string;
  notes: Record<string, any>;
  user_id: string;
  plan_id: string;
  userName?: string; // IMPROVEMENT: Added optional user name prop
  userEmail?: string; // IMPROVEMENT: Added optional user email prop
  className?: string;
  disabled?: boolean;
  /**
   * If true, we explicitly send an empty prefill object (blank name/email/contact)
   * and instruct Razorpay not to remember customer info. This helps defeat cached
   * dummy data that can persist across sessions.
   */
  forceBlankPrefill?: boolean;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess: () => void;
  onFailure: (e: any) => void;
}

export default function RazorpayButton({
  amount,
  currency,
  billingPeriod,
  label,
  notes,
  user_id,
  plan_id,
  userName,
  userEmail,
  className,
  disabled,
  prefill,
  forceBlankPrefill,
  onSuccess,
  onFailure,
}: Props) {
  // Internal loading state for when the payment process is active.
  const [loading, setLoading] = useState(false);

  // Map currencies to Razorpay-supported currencies
  const getRazorpayCurrency = (currency: string): 'INR' | 'USD' => {
    switch (currency) {
      case 'INR':
        return 'INR';
      case 'USD':
      case 'EUR':
      case 'GBP':
      case 'CAD':
      case 'AUD':
      default:
        return 'USD'; // Default to USD for all non-INR currencies
    }
  };

  const razorpayCurrency = getRazorpayCurrency(currency);

  const createOrder = async () => {
    console.log('Payment button clicked', { plan_id, currency, billingPeriod, user_id });
    setLoading(true);
    try {
      if (typeof window === 'undefined') throw new Error('WINDOW_UNAVAILABLE');
      // Lazy load Razorpay SDK if not already present
      try {
        await loadRazorpay();
        console.log('Razorpay SDK loaded successfully');
      } catch (e) {
        console.error('Failed to load Razorpay SDK:', e);
        throw new Error('Failed to load Razorpay SDK');
      }
      // Create a payment order by calling a server-side API endpoint.
      console.log('Creating order with:', { plan_id, currency: razorpayCurrency, billing_period: billingPeriod, user_id, notes });
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id, currency: razorpayCurrency, billing_period: billingPeriod, user_id, notes }),
      });

      if (!res.ok) {
        let errorMessage = 'Failed to create order';
        let errorCode = 'UNKNOWN_ERROR';
        
        try {
          const errorData = await res.json();
          
          // Handle new API response format
          if (errorData.error) {
            if (typeof errorData.error === 'string') {
              errorMessage = errorData.error;
            } else if (errorData.error.message) {
              errorMessage = errorData.error.message;
              errorCode = errorData.error.code || errorCode;
            }
          }
          
          // Handle legacy format
          else if (errorData.message) {
            errorMessage = errorData.message;
            errorCode = errorData.code || errorCode;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        
        // Provide specific error messages based on status
        if (res.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        } else if (res.status === 403) {
          throw new Error('You are not authorized to create orders for this user.');
        } else if (res.status === 400) {
          throw new Error(`Invalid request: ${errorMessage}`);
        } else if (res.status === 500) {
          throw new Error(`Server error: ${errorMessage} (${errorCode})`);
        } else {
          throw new Error(`${errorMessage} (${errorCode})`);
        }
      }

      const responseData = await res.json();
      
      // Handle new API response format
      let order;
      if (responseData.success && responseData.data?.order) {
        order = responseData.data.order;
      } else if (responseData.order) {
        // Legacy format
        order = responseData.order;
      } else {
        throw new Error('Invalid server order response - no order data found');
      }
      
      if (!order?.id) {
        throw new Error('Invalid server order response - missing order ID');
      }

      const publicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!publicKey) {
        throw new Error('Missing NEXT_PUBLIC_RAZORPAY_KEY_ID');
      }

      // Razorpay payment options configuration.
      const options: any = {
  key: publicKey,
        amount: order.amount, // already in subunits
        currency: order.currency,
        name: BRAND.name,
        description: `Payment for ${notes.plan || plan_id} (${billingPeriod})`, // IMPROVEMENT: Dynamic description with billing period
        order_id: order.id,
        // Handler function for successful payment.
        handler: async function (response: any) {
          try {
            // Verify the payment signature on the server.
            const verificationRes = await fetch('/api/payments/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                user_id,
                plan_id,
                billing_period: billingPeriod, // Pass billing period to verification
              }),
            });
            const verificationData = await verificationRes.json();
            if (verificationData.success) {
              onSuccess();
            } else {
              onFailure(new Error('Payment verification failed'));
            }
          } catch (e) {
            onFailure(e);
          }
        },
        notes: { ...notes, plan_id, billing_period: billingPeriod }, // Include billing period in notes
        theme: {
          color: '#3399cc',
        },
      };
      // SECURITY: Do NOT auto-populate contact details; require user input.
      // If you ever want to re-enable, explicitly pass a `prefill` prop from caller.
      if (prefill) {
        options.prefill = prefill;
      }
      // Forcefully blank out prefill to override any Razorpay remembered cache
      else if (forceBlankPrefill) {
        options.prefill = { name: '', email: '', contact: '' };
      }

      // Attempt to disable Razorpay remembering previous customer details
      options.remember_customer = false;

      // Attempt to purge any cached Razorpay contact (Razorpay stores in localStorage keys like 'rzp_device_id' and may reuse last contact)
      try {
        const ls = typeof window !== 'undefined' ? window.localStorage : null;
        if (ls) {
          Object.keys(ls).forEach(k => {
            if (k.startsWith('rzp_') || k.includes('razorpay')) {
              ls.removeItem(k);
            }
          });
        }
        const ss = typeof window !== 'undefined' ? window.sessionStorage : null;
        if (ss) {
          Object.keys(ss).forEach(k => {
            if (k.startsWith('rzp_') || k.includes('razorpay')) {
              ss.removeItem(k);
            }
          });
        }
      } catch (e) {
        logger.warn('Could not clear Razorpay cached storage', { error: e });
      }

      // Debug: log options to ensure no prefill is present unless explicitly passed
      if (process.env.NODE_ENV !== 'production') {
        logger.debug('[RazorpayButton] Opening checkout with options', { ...options, key: '[redacted]' });
      }

      // Create a new Razorpay instance and open the payment dialog.
      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response: any) {
        onFailure(new Error(response?.error?.description || 'Payment failed (gateway)'));
      });
      rzp1.open();
    } catch (error) {
      logger.error('Error in payment process', error);
      onFailure(error as any);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={className}
      onClick={createOrder}
      // The button is disabled if the internal loading is true OR the external disabled prop is true.
      disabled={loading || disabled}
    >
      {loading ? 'Processing...' : label}
    </button>
  );
}
