/**
 * Smart Route Guard with Optimistic Navigation
 * Eliminates redundant permission checks and loading screens
 */
'use client';

import { useAuth } from '@/context/EnhancedAuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

interface SmartRouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireSubscription?: boolean;
  redirectTo?: string;
  showSkeleton?: boolean;
}

export default function SmartRouteGuard({ 
  children, 
  requireAuth = true,
  requireSubscription = true,
  redirectTo = '/subscription-required',
  showSkeleton = false
}: SmartRouteGuardProps) {
  const { user, loading, hasAccess, isNavigationReady, subscriptionLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const redirected = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Skip if still loading initial auth or not mounted
    if (!mounted || loading) return;
    
    // Prevent multiple redirects
    if (redirected.current) return;

    // Check authentication requirement
    if (requireAuth && !user) {
      redirected.current = true;
      router.push('/sign-in');
      return;
    }

    // Check subscription requirement (only if navigation is ready to avoid flash)
    if (requireSubscription && user && isNavigationReady && !hasAccess) {
      redirected.current = true;
      router.push(redirectTo);
      return;
    }

    // Reset redirect flag if user gains access
    if (user && hasAccess) {
      redirected.current = false;
    }
  }, [user, loading, hasAccess, isNavigationReady, requireAuth, requireSubscription, redirectTo, router, mounted]);

  // Show nothing during initial mount to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // Show minimal loading only during initial auth check
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Authentication required but not present
  if (requireAuth && !user) {
    return null; // Will redirect
  }

  // For subscription-protected routes, show content optimistically if we have cached data
  if (requireSubscription && user) {
    // If navigation is ready and user has access, show content
    if (isNavigationReady && hasAccess) {
      return <>{children}</>;
    }
    
    // If navigation is ready but no access, redirect (handled in useEffect)
    if (isNavigationReady && !hasAccess) {
      return null;
    }
    
    // If still checking subscription but we have cached indication of access, show content optimistically
    if (subscriptionLoading && hasAccess) {
      return <>{children}</>;
    }
    
    // Show skeleton loader while checking subscription (but only if specifically requested)
    if (subscriptionLoading && showSkeleton) {
      return <PageSkeleton />;
    }
    
    // Show minimal loading indicator
    if (subscriptionLoading) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Loading...</p>
          </div>
        </div>
      );
    }
  }

  // Default: render children
  return <>{children}</>;
}

/**
 * Page skeleton for smooth loading experience
 */
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header skeleton */}
      <div className="h-20 border-b border-slate-800 flex items-center justify-between px-6">
        <div className="h-6 w-32 bg-slate-800 rounded animate-pulse"></div>
        <div className="h-8 w-8 bg-slate-800 rounded-full animate-pulse"></div>
      </div>
      
      {/* Content skeleton */}
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-slate-800 rounded animate-pulse"></div>
        <div className="space-y-4">
          <div className="h-4 w-full bg-slate-800 rounded animate-pulse"></div>
          <div className="h-4 w-3/4 bg-slate-800 rounded animate-pulse"></div>
          <div className="h-4 w-1/2 bg-slate-800 rounded animate-pulse"></div>
        </div>
        
        {/* Card skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900 rounded-lg p-6 border border-slate-800">
              <div className="h-6 w-24 bg-slate-800 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-slate-800 rounded animate-pulse"></div>
                <div className="h-4 w-2/3 bg-slate-800 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Dashboard-specific route guard with optimistic navigation
 */
export function DashboardRouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <SmartRouteGuard 
      requireAuth={true} 
      requireSubscription={true} 
      redirectTo="/subscription-required"
      showSkeleton={true}
    >
      {children}
    </SmartRouteGuard>
  );
}

/**
 * Auth-only route guard (no subscription required)
 */
export function AuthRouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <SmartRouteGuard 
      requireAuth={true} 
      requireSubscription={false}
    >
      {children}
    </SmartRouteGuard>
  );
}
