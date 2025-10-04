'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { calculateTrialInfo, TrialInfo } from '@/lib/trial';
import { logger } from '@/lib/logger';
import { validateSubscriptionFromProfile, toAuthContextStatus } from '@/lib/subscriptionValidation';

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

  // Fallback method for subscription check using standardized validation
  const fallbackSubscriptionCheck = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      // Check profile for subscription info
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        // Use standardized subscription validation
        const validation = validateSubscriptionFromProfile(profile);
        const authStatus = toAuthContextStatus(validation.status, validation.isTrialActive);
        
        setSubscriptionStatus(authStatus);
        
        // Set trial info if user has active trial
        if (validation.isTrialActive && profile.trial_ends_at) {
          const trial = calculateTrialInfo(profile.trial_ends_at);
          setTrialInfo(trial);
        } else {
          setTrialInfo(null);
        }
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
  }, [user?.id]);

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
        // Use standardized subscription validation
        const validation = validateSubscriptionFromProfile(data.profile || {});
        const authStatus = toAuthContextStatus(validation.status, validation.isTrialActive);
        
        setSubscriptionStatus(authStatus);
        
        // Set trial info if user has active trial
        if (validation.isTrialActive && data.subscription.trial_ends_at) {
          const trial = calculateTrialInfo(data.subscription.trial_ends_at);
          setTrialInfo(trial);
        } else {
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
  }, [user?.id, fallbackSubscriptionCheck]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        logger.info('Initial session found:', { userId: session.user.id, email: session.user.email });
        setUser(session.user as UserProfile);
      } else {
        logger.info('No initial session found');
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info('Auth state change:', { event, hasSession: !!session, hasUser: !!session?.user });
        
        if (session?.user) {
          logger.info('User authenticated:', { userId: session.user.id, email: session.user.email, provider: session.user.app_metadata?.provider });
          setUser(session.user as UserProfile);
        } else {
          logger.info('User signed out');
          setUser(null);
          setSubscriptionStatus('none');
          setTrialInfo(null);
        }
        setLoading(false);
      }
    );

    // Listen for manual auth refresh events (e.g., after OAuth callback)
    const handleAuthRefresh = async () => {
      logger.info('Manual auth refresh requested');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        logger.info('Auth refresh found new session:', { userId: session.user.id });
        setUser(session.user as UserProfile);
        setLoading(false);
      }
    };

    window.addEventListener('auth-state-refresh', handleAuthRefresh);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('auth-state-refresh', handleAuthRefresh);
    };
  }, []); // Remove user dependency to avoid infinite loops

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
