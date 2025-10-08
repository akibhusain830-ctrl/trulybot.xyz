'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

type SubscriptionTier = 'basic' | 'pro' | 'ultra' | 'trial';
type SubscriptionStatus = 'active' | 'trialing' | 'none';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  subscriptionStatus: SubscriptionStatus | null;
  subscriptionLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshSubscriptionStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  subscriptionStatus: 'none',
  subscriptionLoading: true,
  signOut: async () => {},
  refreshSession: async () => {},
  refreshSubscriptionStatus: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const refreshSubscriptionStatus = useCallback(async () => {
    if (!user) {
      setSubscriptionStatus('none');
      setSubscriptionLoading(false);
      return;
    }

    try {
      setSubscriptionLoading(true);
      const response = await fetch('/api/subscription/status');
      if (response.ok) {
        const data = await response.json();
        const tier = data.tier || 'basic';
        
        // Map subscription tier to status
        if (tier === 'trial') {
          setSubscriptionStatus('trialing');
        } else if (tier === 'basic' || tier === 'pro' || tier === 'ultra') {
          setSubscriptionStatus('active');
        } else {
          setSubscriptionStatus('none');
        }
      } else {
        setSubscriptionStatus('active'); // Default to active for basic
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      setSubscriptionStatus('active'); // Default to active for basic
    } finally {
      setSubscriptionLoading(false);
    }
  }, [user]);

  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Error refreshing session:', error);
      setUser(null);
    }
  }, [supabase]);

  // Check if session is about to expire (within 10 minutes)
  const checkSessionExpiry = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.expires_at) return;

      const expiresAt = session.expires_at * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      const tenMinutes = 10 * 60 * 1000;
      const fiveMinutes = 5 * 60 * 1000;

      // Show warning 5 minutes before expiry
      if (timeUntilExpiry <= fiveMinutes && timeUntilExpiry > 0) {
        console.warn('Session will expire in less than 5 minutes');
        // You could show a toast notification here
      }

      // Auto-refresh if session will expire within 10 minutes
      if (timeUntilExpiry <= tenMinutes && timeUntilExpiry > 0) {
        console.log('Auto-refreshing session due to upcoming expiry');
        const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
        
        if (error || !newSession) {
          console.error('Failed to refresh session:', error);
          // Force logout if refresh fails
          await signOut();
        } else {
          setUser(newSession.user);
        }
      }
    } catch (error) {
      console.error('Error checking session expiry:', error);
    }
  }, [supabase]);

  useEffect(() => {
    // Get initial session
    refreshSession();

    // Set up session refresh interval (every 5 minutes)
    const refreshInterval = setInterval(() => {
      checkSessionExpiry();
    }, 5 * 60 * 1000); // 5 minutes

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN') {
          setUser(session?.user ?? null);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
          setSubscriptionStatus('none');
          setSubscriptionLoading(false);
          router.push('/sign-in');
        } else if (event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null);
          console.log('Token refreshed successfully');
        } else if (event === 'USER_UPDATED') {
          setUser(session?.user ?? null);
        }
      }
    );

    setLoading(false);

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [router, supabase, refreshSession, checkSessionExpiry]);

  // Refresh subscription status when user changes
  useEffect(() => {
    if (user) {
      refreshSubscriptionStatus();
    }
  }, [user, refreshSubscriptionStatus]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [supabase, router]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      subscriptionStatus, 
      subscriptionLoading, 
      signOut, 
      refreshSession,
      refreshSubscriptionStatus 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
