'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface NoAccessPageProps {
  children: React.ReactNode;
}

/**
 * Blocks dashboard access for users with subscription_status = 'none'
 * Redirects them to start trial or view pricing
 */
export default function NoAccessGuard({ children }: NoAccessPageProps) {
  const { user, subscriptionStatus, subscriptionLoading, trialInfo } = useAuth();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Wait for auth context to resolve
    if (!subscriptionLoading) {
      setIsCheckingAccess(false);
    }
  }, [subscriptionLoading]);

  // Show loading while checking auth and subscription status
  if (isCheckingAccess || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  // Block access for users with 'none' subscription status
  if (subscriptionStatus === 'none') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-5V9m0 0V7m0 2h2m-2 0H10" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold mb-4 text-white">Dashboard Access Required</h2>
          
          <p className="text-slate-400 mb-6 leading-relaxed">
            You need an active subscription or trial to access your dashboard. 
            Choose an option below to get started with TrulyBot.
          </p>
          
          <div className="space-y-3">
            <Link 
              href="/start-trial"
              className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              🚀 Start 7-Day Free Trial
            </Link>
            
            <Link 
              href="/pricing"
              className="block w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              View Pricing Plans
            </Link>
            
            <div className="mt-6 pt-4 border-t border-slate-700">
              <Link 
                href="/sign-out"
                className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
              >
                Sign out
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Allow access for users with trial, active, or other valid statuses
  return <>{children}</>;
}