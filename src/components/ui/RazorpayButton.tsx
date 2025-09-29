'use client';
import React, { useState } from 'react';

// ... existing code

interface Props {
  amount: number;
  currency: 'INR' | 'USD';
  label: string;
  notes: Record<string, any>;
  user_id: string;
  plan_id: string;
  className?: string;
  disabled?: boolean; // Add disabled prop
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
  disabled, // Destructure disabled prop
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
      disabled={loading || disabled} // Use disabled prop here
    >
      {loading ? 'Processing...' : label}
    </button>
  );
}