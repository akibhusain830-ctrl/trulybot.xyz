'use client';

import RazorpayButton from '@/components/RazorpayButton';
import { useAuth } from '@/context/AuthContext';
import { useMemo } from 'react';

export default function CheckoutPage() {
  const { user } = useAuth();

  // Generate a unique receipt ID for each transaction
  const receiptId = useMemo(() => `rcpt_${Date.now()}`, []);

  return (
    <div className="min-h-screen bg-[#0f1220] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#15192c] rounded-xl p-6 shadow-lg">
        <h1 className="text-2xl font-semibold mb-2">TrulyBot Pro</h1>
        <p className="text-slate-300 mb-6">Unlock unlimited chats and priority support.</p>

        <RazorpayButton
          amount={499} // ₹499.00
          currency="INR"
          billingPeriod="monthly"
          notes={{ plan: 'pro' }}
          label="Buy Pro — ₹499"
          user_id={user?.id || ''}
          plan_id="pro"
          onSuccess={() => alert('Payment successful!')}
          onFailure={(e) =>
            alert(`Payment failed: ${e?.error?.description || e?.message || 'Unknown error'}`)
          }
        />
      </div>
    </div>
  );
}
