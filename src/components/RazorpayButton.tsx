'use client';

import React, { useCallback, useState } from 'react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

async function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (window.Razorpay) return true;

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

type Props = {
  amount: number; // in major units (e.g., 499 means ₹499.00)
  currency?: string;
  name?: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  receipt?: string;
  onSuccess?: (data: any) => void;
  onFailure?: (err: any) => void;
  className?: string;
  label?: string;
};

export default function RazorpayButton({
  amount,
  currency = 'INR',
  name = 'TrulyBot',
  description = 'Purchase',
  prefill,
  notes,
  receipt,
  onSuccess,
  onFailure,
  className = 'inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white disabled:opacity-50',
  label,
}: Props) {
  const [loading, setLoading] = useState(false);

  const onClick = useCallback(async () => {
    try {
      setLoading(true);

      const ok = await loadRazorpayScript();
      if (!ok) throw new Error('Failed to load Razorpay SDK');

      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, notes, receipt }),
      });

      const { order, error } = await orderRes.json();
      if (error || !order?.id) throw new Error(error || 'Failed to create order');

      const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!key) throw new Error('Missing NEXT_PUBLIC_RAZORPAY_KEY_ID');

      const rzp = new window.Razorpay({
        key,
        name,
        description,
        currency: order.currency,
        amount: order.amount,
        order_id: order.id,
        prefill,
        notes,
        theme: { color: '#4f46e5' },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          const verify = await verifyRes.json();
          if (verify.valid) {
            onSuccess?.(response);
          } else {
            onFailure?.(verify);
          }
          setLoading(false);
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      rzp.on('payment.failed', (resp: any) => {
        setLoading(false);
        onFailure?.(resp?.error || resp);
      });

      rzp.open();
    } catch (e) {
      setLoading(false);
      onFailure?.(e);
    }
  }, [amount, currency, description, name, notes, onFailure, onSuccess, prefill, receipt]);

  return (
    <button onClick={onClick} disabled={loading} className={className}>
      {loading ? 'Processing…' : (label ?? `Pay ${currency} ${amount.toFixed(2)}`)}
    </button>
  );
}
