'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

type SubscriptionStatus = 'active' | 'trialing' | 'incomplete' | 'past_due' | null;

interface AuthContextType {
  user: User | null;
  subscriptionStatus: SubscriptionStatus;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchSessionAndSubscription = async (sessionUser: User | null) => {
      if (!sessionUser) {
        if (mounted) {
          setUser(null);
          setSubscriptionStatus(null);
          setLoading(false);
        }
        return;
      }

      // Fetch subscription status from the 'profiles' table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', sessionUser.id)
        .single();
      
      if (error) {
        console.error('Error fetching subscription status:', error);
      }

      if (mounted) {
        setUser(sessionUser);
        setSubscriptionStatus(profile?.subscription_status || null);
        setLoading(false);
      }
    };

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchSessionAndSubscription(session?.user ?? null);
    });

    // 2. Subscribe to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchSessionAndSubscription(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSubscriptionStatus(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, subscriptionStatus, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
