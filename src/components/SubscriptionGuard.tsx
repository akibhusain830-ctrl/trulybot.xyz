'use client';

import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { calculateSubscriptionAccess, type UserProfile } from '@/lib/subscription';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallbackComponent?: React.ComponentType;
}

export default function SubscriptionGuard({ 
  children, 
  redirectTo = '/subscription-required',
  fallbackComponent: FallbackComponent 
}: SubscriptionGuardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const checkSubscriptionAccess = async () => {
      if (!user) {
        // User not authenticated, redirect to sign in
        router.push('/sign-in');
        return;
      }

      try {
        // Fetch user's subscription profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setHasAccess(false);
          setIsChecking(false);
          return;
        }

        setUserProfile(profile);
        
        // Calculate subscription access using existing utility
        const subscription = calculateSubscriptionAccess(profile);
        
        setHasAccess(subscription.has_access);
        setIsChecking(false);

        // If no access, redirect to trial/subscription page
        if (!subscription.has_access) {
          router.push(redirectTo);
        }
      } catch (error) {
        console.error('Subscription check error:', error);
        setHasAccess(false);
        setIsChecking(false);
      }
    };

    checkSubscriptionAccess();
  }, [user, router, redirectTo]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking subscription access...</p>
        </div>
      </div>
    );
  }

  // Show fallback component if provided and no access
  if (!hasAccess && FallbackComponent) {
    return <FallbackComponent />;
  }

  // If has access, render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // Default: show access required message (shouldn't reach here due to redirect)
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="mb-6">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Subscription Required
        </h2>
        <p className="text-gray-400 mb-6">
          You need an active subscription or trial to access the dashboard.
        </p>
        <button
          onClick={() => router.push(redirectTo)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Start Free Trial
        </button>
      </div>
    </div>
  );
}
