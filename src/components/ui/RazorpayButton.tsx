'use client';
import React, { useState } from 'react';

// This declares that a 'window' object with any properties can exist, which is needed for third-party scripts like Razorpay.
declare const window: any;

// Defines the properties (props) the component accepts.
interface Props {
  amount: number;
  currency: 'INR' | 'USD';
  label: string;
  notes: Record<string, any>;
  user_id: string;
  plan_id: string;
  className?: string;
  disabled?: boolean; // The optional 'disabled' prop is correctly defined here.
  onSuccess: () => void;
  onFailure: (e: any) => void;
}

export default function RazorpayButton({
  amount,
  currency,
  label,
  notes,
  user_id,
  plan_id,
  className,
  disabled, // The prop is received here.
  onSuccess,
  onFailure,
}: Props) {
  // Internal loading state for when the payment process is active.
  const [loading, setLoading] = useState(false);

  const createOrder = async () => {
    setLoading(true);
    try {
      // Create a payment order by calling a server-side API endpoint.
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, notes }),
      });

      if (!res.ok) {
        throw new Error('Failed to create order');
      }

      const order = await res.json();

      // Razorpay payment options configuration.
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'TrulyBot',
        description: 'Test Transaction',
        order_id: order.id,
        // Handler function for successful payment.
        handler: async function (response: any) {
          // Verify the payment signature on the server.
          const verificationRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              user_id,
              plan_id,
            }),
          });

          const verificationData = await verificationRes.json();
          if (verificationData.success) {
            onSuccess();
          } else {
            onFailure(new Error('Payment verification failed'));
          }
        },
        prefill: {
          name: 'Test User',
          email: 'test.user@example.com',
          contact: '9999999999',
        },
        notes: {
          address: 'Razorpay Corporate Office',
        },
        theme: {
          color: '#3399cc',
        },
      };

      // Create a new Razorpay instance and open the payment dialog.
      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response: any) {
        onFailure(response.error);
      });
      rzp1.open();
    } catch (error) {
      console.error('Error in payment process:', error);
      onFailure(error);
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
