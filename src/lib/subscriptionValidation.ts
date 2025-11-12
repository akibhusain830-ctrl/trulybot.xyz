/**
 * Unified subscription status checking utilities
 * Standardizes subscription validation across AuthContext, API routes, and database
 */

import { UserProfile, SubscriptionStatus, SubscriptionTier, calculateSubscriptionAccess } from './subscription';

export interface SubscriptionValidation {
  isValid: boolean;
  status: SubscriptionStatus;
  tier: SubscriptionTier;
  hasAccess: boolean;
  isTrialActive: boolean;
  daysRemaining: number;
  reason?: string;
}

/**
 * Validate subscription status from an existing profile object
 * Use this when you already have the profile data (e.g., from AuthContext)
 */
export function validateSubscriptionFromProfile(profile: Partial<UserProfile>): SubscriptionValidation {
  const subscription = calculateSubscriptionAccess(profile);
  
  return {
    isValid: subscription.has_access,
    status: subscription.status,
    tier: subscription.tier,
    hasAccess: subscription.has_access,
    isTrialActive: subscription.is_trial_active,
    daysRemaining: subscription.days_remaining,
    reason: subscription.has_access ? 'valid_subscription' : 'no_access'
  };
}

/**
 * Check if user has access to a specific tier level
 */
export function hasAccessToTier(userTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
  const tierHierarchy: Record<SubscriptionTier, number> = {
    'free': 0,
    'basic': 1,
    'pro': 2,
    'enterprise': 3
  };

  return tierHierarchy[userTier] >= tierHierarchy[requiredTier];
}

/**
 * Map internal subscription status to user-friendly display
 */
export function getDisplayStatus(status: SubscriptionStatus, isTrialActive: boolean): string {
  switch (status) {
    case 'active':
      return 'Active Subscription';
    case 'trial':
      return isTrialActive ? 'Free Trial' : 'Trial Expired';
    case 'expired':
      return 'Subscription Expired';
    case 'canceled':
      return 'Subscription Canceled';
    case 'past_due':
      return 'Payment Past Due';
    case 'none':
    default:
      return 'No Subscription';
  }
}

/**
 * Normalize AuthContext status to database status
 * Bridges the gap between frontend and backend status types
 */
export function normalizeSubscriptionStatus(
  authStatus: 'active' | 'trialing' | 'expired' | 'none'
): SubscriptionStatus {
  switch (authStatus) {
    case 'trialing':
      return 'trial';
    case 'active':
      return 'active';
    case 'expired':
      return 'expired';
    case 'none':
    default:
      return 'none';
  }
}

/**
 * Convert database status to AuthContext status
 */
export function toAuthContextStatus(
  dbStatus: SubscriptionStatus,
  isTrialActive: boolean
): 'active' | 'trialing' | 'expired' | 'none' {
  switch (dbStatus) {
    case 'active':
      return 'active';
    case 'trial':
      return isTrialActive ? 'trialing' : 'expired';
    case 'expired':
    case 'canceled':
    case 'past_due':
      return 'expired';
    case 'none':
    default:
      return 'none';
  }
}