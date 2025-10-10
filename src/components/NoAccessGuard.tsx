'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface NoAccessPageProps {
  children: React.ReactNode;
}

/**
 * FAST NoAccessGuard - no more infinite loading spinners!
 * Shows content immediately for users with access, blocks for users without
 */
export default function NoAccessGuard({ children }: NoAccessPageProps) {
  const { user, subscriptionStatus, subscriptionLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [forceShowAccess, setForceShowAccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-timeout to prevent infinite loading
  useEffect(() => {
    if (subscriptionLoading && subscriptionStatus === 'none') {
      const timer = setTimeout(() => {
        setForceShowAccess(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [subscriptionLoading, subscriptionStatus]);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // Immediate access for active/trial users - no loading spinner!
  if (subscriptionStatus === 'active' || subscriptionStatus === 'trial') {
    return <>{children}</>;
  }

  // Very brief loading only if truly needed (max 300ms)
  if (subscriptionLoading && subscriptionStatus === 'none' && !forceShowAccess) {
    // Show minimal spinner for just 300ms max
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // No access - show upgrade/trial options
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-5V9m0 0V7m0 2h2m-2 0H10" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold mb-4 text-white">Start Your TrulyBot Journey</h2>
        
        <p className="text-slate-400 mb-6 leading-relaxed">
          Access your AI chatbot dashboard with a free trial or choose a plan that fits your needs.
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
            <button 
              onClick={() => window.location.href = '/sign-out'}
              className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}