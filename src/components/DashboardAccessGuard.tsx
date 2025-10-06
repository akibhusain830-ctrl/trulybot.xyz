'use client';

import { useEffect, useState, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { useRouter } from 'next/navigation';
import { UserSubscription } from '@/lib/subscription';

interface DashboardAccessGuardProps {
  children: React.ReactNode;
}

export default function DashboardAccessGuard({ children }: DashboardAccessGuardProps) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAccess = useCallback(async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        router.push('/sign-in');
        return;
      }

      const data = await response.json();
      setSubscription(data.subscription);

      // If no access, redirect to start trial or pricing
      if (!data.subscription.has_access) {
        router.push('/start-trial');
      }
    } catch (error) {
      logger.error('Access check error:', error);
      router.push('/sign-in');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  const syncSubscription = async () => {
    try {
      // This would be called after a successful payment
      await fetch('/api/sync-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription_tier: 'pro' })
      });
      
      // Refresh access check
      checkAccess();
    } catch (error) {
      logger.error('Sync error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!subscription?.has_access) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            🔒
          </div>
          <h2 className="text-xl font-bold mb-2">Access Restricted</h2>
          <p className="text-slate-400 mb-6">
            Your subscription status is <span className="text-red-400">{subscription?.status || 'unknown'}</span>
          </p>
          
          {/* If user has a paid plan but it's not synced */}
          <div className="space-y-3">
            <button
              onClick={syncSubscription}
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg font-medium"
            >
              I Just Purchased - Sync Now
            </button>
            
            <button
              onClick={() => router.push('/start-trial')}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
            >
              Start Free Trial
            </button>
            
            <button
              onClick={() => router.push('/pricing')}
              className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium"
            >
              View Pricing Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
