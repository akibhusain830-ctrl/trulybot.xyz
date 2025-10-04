'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { calculateTrialInfo, TrialInfo } from '@/lib/trial';
import { logger } from '@/lib/logger';

export type SubscriptionStatus = 'active' | 'trialing' | 'expired' | 'none';

interface UserProfile extends User {
  trial_ends_at?: string | null;
  subscription_status?: SubscriptionStatus;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionLoading: boolean;
  trialInfo: TrialInfo | null;
  signOut: () => Promise<void>;
  refreshSubscriptionStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  subscriptionStatus: 'none',
  subscriptionLoading: true,
  trialInfo: null,
  signOut: async () => {},
  refreshSubscriptionStatus: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('none');
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null);

  const refreshSubscriptionStatus = useCallback(async () => {
    if (!user?.id) return;

    try {
      setSubscriptionLoading(true);
      
      // Use the profile API endpoint which ensures profile exists and calculates subscription
      const response = await fetch('/api/user/profile');
      
      if (!response.ok) {
        // If profile API fails, fall back to direct database check
        console.warn('Profile API failed, falling back to direct database check');
        await fallbackSubscriptionCheck();
        return;
      }
      
      const data = await response.json();
      
      if (data.subscription) {
        // Use the subscription info from ProfileManager + calculateSubscriptionAccess
        if (data.subscription.status === 'trial' && data.subscription.is_trial_active) {
          setSubscriptionStatus('trialing');
          if (data.subscription.trial_ends_at) {
            const trial = calculateTrialInfo(data.subscription.trial_ends_at);
            setTrialInfo(trial);
          } else {
            setTrialInfo(null);
          }
        } else if (data.subscription.status === 'active') {
          setSubscriptionStatus('active');
          setTrialInfo(null);
        } else {
          setSubscriptionStatus('none');
          setTrialInfo(null);
        }
      } else {
        setSubscriptionStatus('none');
        setTrialInfo(null);
      }
      
      setSubscriptionLoading(false);

    } catch (error) {
      logger.error('Error refreshing subscription status:', error);
      // Fall back to direct database check
      await fallbackSubscriptionCheck();
    }
  }, [user?.id]);

  // Fallback method for subscription check (original logic)
  const fallbackSubscriptionCheck = async () => {
    try {
      // Check for active subscription first
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status, current_period_end')
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .maybeSingle();

      if (subscription) {
        setSubscriptionStatus('active');
        setTrialInfo(null);
        setSubscriptionLoading(false);
        return;
      }

      // Check profile for trial info
      const { data: profile } = await supabase
        .from('profiles')
        .select('trial_ends_at, subscription_status')
        .eq('id', user!.id)
        .maybeSingle();

      if (profile?.trial_ends_at) {
        const trial = calculateTrialInfo(profile.trial_ends_at);
        setTrialInfo(trial);
        setSubscriptionStatus(trial.isActive ? 'trialing' : 'expired');
      } else {
        setSubscriptionStatus('none');
        setTrialInfo(null);
      }
      setSubscriptionLoading(false);

    } catch (error) {
      logger.error('Error in fallback subscription check:', error);
      setSubscriptionStatus('none');
      setTrialInfo(null);
      setSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user as UserProfile);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user as UserProfile);
        } else {
          setUser(null);
          setSubscriptionStatus('none');
          setTrialInfo(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Refresh subscription status when user changes
  useEffect(() => {
    if (user && !loading) {
      refreshSubscriptionStatus();
    }
  }, [user, loading, refreshSubscriptionStatus]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSubscriptionStatus('none');
    setTrialInfo(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      subscriptionStatus, 
      subscriptionLoading,
      trialInfo,
      signOut, 
      refreshSubscriptionStatus 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
