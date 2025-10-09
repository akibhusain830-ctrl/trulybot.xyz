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
  subscriptionLoading: false,
  trialInfo: null,
  signOut: async () => {},
  refreshSubscriptionStatus: async () => {},
});

// Persistent cache in localStorage
const CACHE_KEY = 'auth_subscription_cache';
const CACHE_DURATION = 60 * 1000; // 1 minute cache

interface CacheData {
  status: SubscriptionStatus;
  trialInfo: TrialInfo | null;
  timestamp: number;
  userId: string;
}

function getCachedSubscription(userId: string): CacheData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data: CacheData = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is valid and for the right user
    if (data.userId === userId && (now - data.timestamp) < CACHE_DURATION) {
      return data;
    }
    
    return null;
  } catch {
    return null;
  }
}

function setCachedSubscription(userId: string, status: SubscriptionStatus, trialInfo: TrialInfo | null) {
  try {
    const cacheData: CacheData = {
      status,
      trialInfo,
      timestamp: Date.now(),
      userId
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch {
    // Ignore localStorage errors
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('none');
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null);

  // Fast subscription check with simple logic
  const checkSubscriptionStatus = useCallback(async (userId: string) => {
    // Check cache first for instant response
    const cached = getCachedSubscription(userId);
    if (cached) {
      setSubscriptionStatus(cached.status);
      setTrialInfo(cached.trialInfo);
      return;
    }

    try {
      // Quick database check with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 1500)
      );
      
      const dbPromise = supabase
        .from('profiles')
        .select('subscription_status, trial_ends_at')
        .eq('id', userId)
        .maybeSingle();

      const { data: profile, error } = await Promise.race([dbPromise, timeoutPromise]) as {
        data: any;
        error: any;
      };

      if (profile) {
        // Simple subscription logic
        let status: SubscriptionStatus = 'none';
        let trial: TrialInfo | null = null;

        if (profile.subscription_status === 'active') {
          status = 'active';
        } else if (profile.subscription_status === 'trial' || profile.subscription_status === 'trialing') {
          if (profile.trial_ends_at) {
            const trialEnd = new Date(profile.trial_ends_at);
            const now = new Date();
            
            if (trialEnd > now) {
              status = 'trialing';
              trial = calculateTrialInfo(profile.trial_ends_at);
            } else {
              status = 'expired';
            }
          } else {
            status = 'expired';
          }
        } else {
          status = 'none';
        }

        setSubscriptionStatus(status);
        setTrialInfo(trial);
        setCachedSubscription(userId, status, trial);
      } else {
        // No profile = no access
        setSubscriptionStatus('none');
        setTrialInfo(null);
        setCachedSubscription(userId, 'none', null);
      }
    } catch (error) {
      logger.warn('Subscription check failed, using cache or defaults', { error: String(error) });
      // On error, default to no access to prevent infinite loading
      setSubscriptionStatus('none');
      setTrialInfo(null);
    }
  }, []);

  const refreshSubscriptionStatus = useCallback(async () => {
    if (!user?.id) return;
    
    setSubscriptionLoading(true);
    await checkSubscriptionStatus(user.id);
    setSubscriptionLoading(false);
  }, [user?.id, checkSubscriptionStatus]);

  const signOut = useCallback(async () => {
    try {
      localStorage.removeItem(CACHE_KEY); // Clear cache
      await supabase.auth.signOut();
      setUser(null);
      setSubscriptionStatus('none');
      setTrialInfo(null);
    } catch (error) {
      logger.error('Sign out error:', error);
    }
  }, []);

  // Initialize authentication
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        
        if (!mounted) return;

        if (error || !currentUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(currentUser as UserProfile);
        
        // Check subscription immediately (with cache)
        await checkSubscriptionStatus(currentUser.id);
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        logger.error('Auth initialization error:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        setSubscriptionStatus('none');
        setTrialInfo(null);
        localStorage.removeItem(CACHE_KEY);
      } else if (event === 'SIGNED_IN' && session.user) {
        setUser(session.user as UserProfile);
        await checkSubscriptionStatus(session.user.id);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkSubscriptionStatus]);

  const value: AuthContextType = {
    user,
    loading,
    subscriptionStatus,
    subscriptionLoading,
    trialInfo,
    signOut,
    refreshSubscriptionStatus,
  };

  return (
    <AuthContext.Provider value={value}>
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