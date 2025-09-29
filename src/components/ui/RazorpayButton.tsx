'use client';
import React, { useState } from 'react';

declare const window: any;

interface Props {
  amount: number;
  currency: 'INR' | 'USD';
  label: string;
  notes: Record<string, any>;
  user_id: string;
  plan_id: string;
  className?: string;
  disabled?: boolean;
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
  disabled,
  onSuccess,
  onFailure,
}: Props) {
  const [loading, setLoading] = useState(false);

  const createOrder = async () => {
// ... existing code
    }
  };

  return (
    <button
      className={className}
      onClick={createOrder}
      disabled={loading || disabled}
    >
      {loading ? 'Processing...' : label}
    </button>
  );
}