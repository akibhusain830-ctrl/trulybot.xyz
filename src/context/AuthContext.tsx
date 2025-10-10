'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { calculateTrialInfo, TrialInfo } from '@/lib/trial';
import { calculateSubscriptionAccess, type UserSubscription, type SubscriptionStatus } from '@/lib/subscription';
import { logger } from '@/lib/logger';

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
  hasAccess: boolean;
  signOut: () => Promise<void>;
  refreshSubscriptionStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  subscriptionStatus: 'none',
  subscriptionLoading: false,
  trialInfo: null,
  hasAccess: true, // Default to free access
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
  const [hasAccess, setHasAccess] = useState(true); // Default to free tier access

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
        // Use the proper subscription calculation that provides automatic free access
        const subscription = calculateSubscriptionAccess(profile);
        
        // Map the calculated status to our AuthContext status
        let status: SubscriptionStatus = subscription.status;
        let trial: TrialInfo | null = null;

        // Handle trial information if applicable
        if (subscription.is_trial_active && subscription.trial_ends_at) {
          trial = calculateTrialInfo(subscription.trial_ends_at);
        }

        setSubscriptionStatus(status);
        setHasAccess(subscription.has_access);
        setTrialInfo(trial);
        setCachedSubscription(userId, status, trial);
      } else {
        // No profile - use automatic free access
        const subscription = calculateSubscriptionAccess(null);
        setSubscriptionStatus(subscription.status); // This will be 'none' but with has_access: true
        setHasAccess(subscription.has_access); // This will be true for free tier
        setTrialInfo(null);
        setCachedSubscription(userId, subscription.status, null);
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
    hasAccess,
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