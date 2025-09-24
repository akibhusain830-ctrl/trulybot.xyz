'use client';

import RazorpayButton from '@/components/RazorpayButton';

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#0f1220] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#15192c] rounded-xl p-6 shadow-lg">
        <h1 className="text-2xl font-semibold mb-2">TrulyBot Pro</h1>
        <p className="text-slate-300 mb-6">Unlock unlimited chats and priority support.</p>

        <RazorpayButton
          amount={499} // ₹499.00
          currency="INR"
          name="TrulyBot Pro"
          description="One-time demo payment"
          prefill={{ name: 'Test User', email: 'test@example.com', contact: '9999999999' }}
          notes={{ plan: 'pro' }}
          receipt="rcpt_001"
          label="Buy Pro — ₹499"
          onSuccess={() => alert('Payment successful!')}
          onFailure={(e) =>
            alert(`Payment failed: ${e?.error?.description || e?.message || 'Unknown error'}`)
          }
        />
      </div>
    </div>
  );
}
