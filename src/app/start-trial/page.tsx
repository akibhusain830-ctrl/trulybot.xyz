'use client';

import React, { useState, useEffect } from 'react';
import { PRICING_TIERS } from '@/lib/constants/pricing';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 flex-shrink-0">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );

export default function StartTrialPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before doing auth checks
  useEffect(() => {
    setMounted(true);
  }, []);

  // Optional: Redirect to sign-in if definitely not authenticated
  useEffect(() => {
    if (mounted && !loading && !user) {
      // Only redirect after a delay to avoid false positives
      const timer = setTimeout(() => {
        router.push('/sign-in?redirect=/start-trial');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [mounted, user, loading, router]);

  const ultraPlan = PRICING_TIERS.find(p => p.id === 'ultra');

  const handleStartTrial = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Debug: Check client-side session before API call
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[client] Session before API call:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        accessToken: session?.access_token ? 'present' : 'missing'
      });

      const res = await fetch('/api/start-trial', { 
        method: 'POST',
        credentials: 'include', // Ensure cookies are sent
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        const data = await res.json();
        console.log('[client] API Error Response:', data);
        throw new Error(data.error || 'Failed to start trial');
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication or before mount
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-b from-slate-900 to-[#1c1c1c] rounded-2xl p-8 max-w-lg w-full border border-slate-800 shadow-2xl"
      >
        <h1 className="text-3xl font-bold text-center tracking-tighter">Start Your 7-Day Free Trial</h1>
        <p className="text-slate-400 text-center mt-2">
          You'll get full access to all features from our **Ultra** plan for a week. No credit card required.
        </p>

        <div className="my-8 p-6 bg-slate-800/50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">During your trial, you'll get:</h2>
            <ul className="space-y-3 text-slate-300">
                {ultraPlan?.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                        <div className="pt-1"><CheckIcon /></div>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        </div>

        <button
          onClick={handleStartTrial}
          disabled={isLoading}
          className="w-full py-3 px-6 rounded-lg font-semibold transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Starting Trial...' : 'Confirm & Start My Free Trial'}
        </button>
        {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
      </motion.div>
    </div>
  );
}
