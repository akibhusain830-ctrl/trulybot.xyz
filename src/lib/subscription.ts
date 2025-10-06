export type SubscriptionStatus = 'none' | 'trial' | 'active' | 'past_due' | 'canceled' | 'expired';
export type SubscriptionTier = 'basic' | 'pro' | 'ultra';

export interface UserSubscription {
  status: SubscriptionStatus;
  tier: SubscriptionTier;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
  is_trial_active: boolean;
  has_access: boolean;
  days_remaining: number;
  features: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  subscription_status: SubscriptionStatus;
  subscription_tier: SubscriptionTier;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
  payment_id: string | null;
  has_used_trial: boolean;
  created_at: string;
  updated_at: string;
}

const TIER_FEATURES = {
  basic: ['Core AI Chatbot', 'Unlimited Conversations', '1,000 Messages/month'],
  pro: ['Core AI Chatbot', 'Unlimited Conversations', 'Maximum Knowledge Base', 'Basic Customization'],
  ultra: ['Core AI Chatbot', 'Unlimited Conversations', 'Maximum Knowledge Base', 'Full Brand Customization', 'Enhanced Lead Capture', 'Priority Support Queue']
};

export function calculateSubscriptionAccess(profile: Partial<UserProfile> | null): UserSubscription {
  const now = new Date();
  
  if (!profile) {
    return {
      status: 'none',
      tier: 'basic',
      trial_ends_at: null,
      subscription_ends_at: null,
      is_trial_active: false,
      has_access: false,
      days_remaining: 0,
      features: [] // No access - empty features
    };
  }
  
  // Check for active paid subscription first (highest priority)
  if (profile.subscription_status === 'active' && profile.subscription_ends_at) {
    const subEndDate = new Date(profile.subscription_ends_at);
    const hasAccess = subEndDate > now;
    const daysRemaining = hasAccess ? Math.ceil((subEndDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)) : 0;
    
    return {
      status: hasAccess ? 'active' : 'expired',
      tier: profile.subscription_tier || 'basic',
      trial_ends_at: null,
      subscription_ends_at: profile.subscription_ends_at,
      is_trial_active: false,
      has_access: hasAccess,
      days_remaining: daysRemaining,
      features: TIER_FEATURES[profile.subscription_tier || 'basic']
    };
  }
  
  // Check for active trial (second priority)
  if (profile.trial_ends_at) {
    const trialEndDate = new Date(profile.trial_ends_at);
    const isTrialActive = trialEndDate > now;
    const daysRemaining = isTrialActive ? Math.ceil((trialEndDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)) : 0;
    
    return {
      status: isTrialActive ? 'trial' : 'expired',
      tier: isTrialActive ? 'ultra' : 'basic',
      trial_ends_at: profile.trial_ends_at,
      subscription_ends_at: null,
      is_trial_active: isTrialActive,
      has_access: isTrialActive,
      days_remaining: daysRemaining,
      features: isTrialActive ? TIER_FEATURES.ultra : [] // No access after trial expires
    };
  }
  
  // No active subscription or trial - no access
  return {
    status: 'none',
    tier: 'basic',
    trial_ends_at: null,
    subscription_ends_at: null,
    is_trial_active: false,
    has_access: false,
    days_remaining: 0,
    features: [] // No access - empty features
  };
}

export function formatSubscriptionStatus(subscription: UserSubscription): string {
  switch (subscription.status) {
    case 'active':
      return `Active ${subscription.tier.toUpperCase()} plan (${subscription.days_remaining} days remaining)`;
    case 'trial':
      return `Free trial active (${subscription.days_remaining} days remaining)`;
    case 'expired':
      return 'Subscription expired';
    case 'past_due':
      return 'Payment past due';
    case 'canceled':
      return 'Subscription canceled';
    default:
      return 'No active subscription';
  }
}

export type NormalizedSubscription = {
  status: SubscriptionStatus; // normalized status
  tier: SubscriptionTier;
  isTrial: boolean;
  hasAccess: boolean;
};

// Normalizes various raw status/tier combos (e.g., trialing vs trial, none vs expired).
export function normalizeSubscription(profile: Partial<UserProfile> | null): NormalizedSubscription {
  const sub = calculateSubscriptionAccess(profile as any);
  // Map expired active subscription to 'expired'
  let status: SubscriptionStatus = sub.status;
  if (status === 'none' && sub.is_trial_active) status = 'trial';
  return {
    status,
    tier: sub.tier,
    isTrial: sub.is_trial_active,
    hasAccess: sub.has_access
  };
}
