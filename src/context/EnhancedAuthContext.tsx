/**
 * Enhanced Auth Context with Intelligent Caching and Optimistic Navigation
 * Eliminates repeated "Checking access permissions..." screens during navigation
 */
'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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

interface CachedAuthData {
  user: UserProfile | null;
  subscriptionStatus: SubscriptionStatus;
  trialInfo: TrialInfo | null;
  timestamp: number;
  profileData?: any;
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
  isNavigationReady: boolean; // New: indicates if we can navigate without showing loading
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  subscriptionStatus: 'none',
  subscriptionLoading: true,
  trialInfo: null,
  hasAccess: false,
  signOut: async () => {},
  refreshSubscriptionStatus: async () => {},
  isNavigationReady: false,
});

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'trulybot_auth_cache';

export function EnhancedAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('none');
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null);
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  
  const lastRefreshTime = useRef<number>(0);
  const refreshInProgress = useRef<boolean>(false);

  // Cache management functions
  const getCachedAuthData = useCallback((): CachedAuthData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const data: CachedAuthData = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - data.timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      
      return data;
    } catch (error) {
      console.warn('Failed to read auth cache:', error);
      return null;
    }
  }, []);

  const setCachedAuthData = useCallback((data: Omit<CachedAuthData, 'timestamp'>) => {
    try {
      const cachedData: CachedAuthData = {
        ...data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));
    } catch (error) {
      console.warn('Failed to cache auth data:', error);
    }
  }, []);

  const clearAuthCache = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.warn('Failed to clear auth cache:', error);
    }
  }, []);

  // Load cached data immediately for optimistic navigation
  const loadCachedData = useCallback(() => {
    const cached = getCachedAuthData();
    if (cached && cached.user) {
      setUser(cached.user);
      setSubscriptionStatus(cached.subscriptionStatus);
      setTrialInfo(cached.trialInfo);
      setSubscriptionLoading(false);
      setIsNavigationReady(true);
      return true;
    }
    return false;
  }, [getCachedAuthData]);

  // Optimized subscription status refresh with intelligent caching
  const refreshSubscriptionStatus = useCallback(async (force: boolean = false) => {
    if (!user?.id) return;

    const now = Date.now();
    
    // Prevent multiple simultaneous refreshes
    if (refreshInProgress.current) return;
    
    // Skip refresh if recently refreshed (unless forced)
    if (!force && now - lastRefreshTime.current < 30000) { // 30 seconds
      return;
    }

    try {
      refreshInProgress.current = true;
      lastRefreshTime.current = now;

      // Use the profile API endpoint
      const response = await fetch('/api/user/profile');
      
      if (!response.ok) {
        throw new Error(`Profile API failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.subscription) {
        const validation = validateSubscriptionFromProfile(data.profile || {});
        const authStatus = toAuthContextStatus(validation.status, validation.isTrialActive);
        
        const newTrialInfo = validation.isTrialActive && data.subscription.trial_ends_at
          ? calculateTrialInfo(data.subscription.trial_ends_at)
          : null;

        // Update state
        setSubscriptionStatus(authStatus);
        setTrialInfo(newTrialInfo);
        
        // Cache the updated data
        setCachedAuthData({
          user,
          subscriptionStatus: authStatus,
          trialInfo: newTrialInfo,
          profileData: data.profile,
        });
      } else {
        setSubscriptionStatus('none');
        setTrialInfo(null);
        
        setCachedAuthData({
          user,
          subscriptionStatus: 'none',
          trialInfo: null,
        });
      }
      
      setSubscriptionLoading(false);
      setIsNavigationReady(true);

    } catch (error) {
      logger.error('Error refreshing subscription status:', error);
      
      // Don't clear existing state on error - use cached data
      const cached = getCachedAuthData();
      if (cached && cached.user?.id === user.id) {
        // Keep using cached data
        setSubscriptionStatus(cached.subscriptionStatus);
        setTrialInfo(cached.trialInfo);
      } else {
        // Fallback to 'none'
        setSubscriptionStatus('none');
        setTrialInfo(null);
      }
      
      setSubscriptionLoading(false);
      setIsNavigationReady(true);
    } finally {
      refreshInProgress.current = false;
    }
  }, [user?.id, setCachedAuthData, getCachedAuthData]);

  // Calculate access status
  const hasAccess = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        // Try to load cached data first for instant navigation
        const hasCachedData = loadCachedData();
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          logger.info('Auth session found:', { userId: session.user.id, email: session.user.email });
          setUser(session.user as UserProfile);
          
          // If we don't have cached data or user changed, fetch fresh data
          if (!hasCachedData || getCachedAuthData()?.user?.id !== session.user.id) {
            await refreshSubscriptionStatus(true);
          }
        } else {
          logger.info('No auth session found');
          clearAuthCache();
          setUser(null);
          setSubscriptionStatus('none');
          setTrialInfo(null);
          setSubscriptionLoading(false);
          setIsNavigationReady(true);
        }
      } catch (error) {
        logger.error('Auth initialization error:', error);
        setSubscriptionLoading(false);
        setIsNavigationReady(true);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info('Auth state change:', { event, hasSession: !!session, hasUser: !!session?.user });
        
        if (session?.user) {
          logger.info('User authenticated:', { userId: session.user.id, email: session.user.email });
          setUser(session.user as UserProfile);
          
          // Check if this is a different user
          const cached = getCachedAuthData();
          if (!cached || cached.user?.id !== session.user.id) {
            // New user or no cache, fetch fresh data
            await refreshSubscriptionStatus(true);
          }
        } else {
          logger.info('User signed out');
          clearAuthCache();
          setUser(null);
          setSubscriptionStatus('none');
          setTrialInfo(null);
          setSubscriptionLoading(false);
          setIsNavigationReady(true);
        }
        setLoading(false);
      }
    );

    // Handle manual auth refresh events
    const handleAuthRefresh = async () => {
      logger.info('Manual auth refresh requested');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        logger.info('Auth refresh found session:', { userId: session.user.id });
        setUser(session.user as UserProfile);
        await refreshSubscriptionStatus(true);
      }
    };

    window.addEventListener('auth-state-refresh', handleAuthRefresh);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('auth-state-refresh', handleAuthRefresh);
    };
  }, []); // No dependencies to avoid infinite loops

  const signOut = async () => {
    clearAuthCache();
    await supabase.auth.signOut();
    setUser(null);
    setSubscriptionStatus('none');
    setTrialInfo(null);
    setSubscriptionLoading(false);
    setIsNavigationReady(true);
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    subscriptionStatus,
    subscriptionLoading,
    trialInfo,
    hasAccess,
    signOut,
    refreshSubscriptionStatus: () => refreshSubscriptionStatus(false),
    isNavigationReady,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an EnhancedAuthProvider');
  }
  return context;
};

// Legacy export for backward compatibility
export { EnhancedAuthProvider as AuthProvider };
