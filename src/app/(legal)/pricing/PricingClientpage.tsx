'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import RazorpayButton from '@/components/RazorpayButton';
import { PRICING_TIERS } from '@/lib/constants/pricing';

export default function PricingClientPage() {
  const { user, loading } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [country, setCountry] = useState('US');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('USD');

  useEffect(() => {
    // Read country from cookie set by middleware
    if (typeof document !== 'undefined') {
      const cookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('country='))
        ?.split('=')[1];
      if (cookie) {
        setCountry(cookie);
        setCurrency(cookie === 'IN' ? 'INR' : 'USD');
      }
    }
  }, []);

  const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 flex-shrink-0">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );

  const SignInPromptModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold text-white mb-4">Sign in to continue</h3>
        <p className="text-slate-400 mb-6">Please sign in to subscribe to a plan.</p>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = '/sign-in'}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl">Simple, Transparent Pricing</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400">
          Choose the plan that's right for you. All plans are designed to scale with your business.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {PRICING_TIERS.map((plan) => {
          const price = currency === 'INR' ? plan.monthlyInr : plan.monthlyUsd;
          // THE FIX IS ON THIS LINE:
          const symbol = currency === 'INR' ? '₹' : '$';

          return (
            <div
              key={plan.id}
              className={`relative border rounded-lg p-8 flex flex-col transition-all duration-300 ${
                plan.highlight 
                  ? 'border-blue-500 bg-slate-900/50 shadow-2xl shadow-blue-900/20' 
                  : 'border-slate-800 bg-slate-900/50'
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                  MOST POPULAR
                </div>
              )}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
                <p className="mt-2 text-slate-400 text-sm">{plan.description}</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-white">{symbol}{price}</span>
                  <span className="text-slate-400">/ month</span>
                </div>
              </div>
              <ul className="mt-6 space-y-4 text-slate-300 flex-grow">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex gap-3">
                    <div className="pt-1">
                      <CheckIcon />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {user ? (
                  <RazorpayButton
                    amount={price}
                    currency={currency}
                    billingPeriod="monthly"
                    label="Get Started"
                    notes={{ plan: plan.id }}
                    user_id={user.id}
                    plan_id={plan.id}
                    disabled={loading}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                      plan.highlight
                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                    onSuccess={() => { window.location.href = '/dashboard'; }}
                    onFailure={(e) => { alert(`Payment failed: ${e?.error?.description || e?.message || 'Unknown error'}`); }}
                  />
                ) : (
                  <button 
                    onClick={() => setShowSignInModal(true)}
                    disabled={loading}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                      plan.highlight
                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                  >
                    Get Started
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-12 text-center text-slate-500 text-sm">
        <p>
          Need a custom solution or have a high-volume use case? 
          <a href="/contact" className="font-medium text-blue-400 hover:underline"> Contact us </a> 
          for enterprise pricing.
        </p>
      </div>
      {showSignInModal && <SignInPromptModal onClose={() => setShowSignInModal(false)} />}
    </div>
  );
}
