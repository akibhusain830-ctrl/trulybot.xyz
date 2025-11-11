export type SubscriptionStatus =
  | "none"
  | "trial"
  | "active"
  | "past_due"
  | "canceled"
  | "expired"
  | "eligible";
export type SubscriptionTier = "free" | "basic" | "pro" | "ultra";

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
  stripe_customer_id?: string | null;
  has_used_trial: boolean;
  created_at: string;
  updated_at: string;
}

const TIER_FEATURES = {
  free: [
    "Core AI Chatbot",
    "100 Replies/month",
    "Basic Knowledge Base (500 words)",
    "1 Knowledge Upload",
    "Website Embedding",
  ],
  basic: ["Core AI Chatbot", "Unlimited Replies", "1,000 Messages/month"],
  pro: [
    "Core AI Chatbot",
    "Unlimited Replies",
    "Maximum Knowledge Base",
    "Basic Customization",
  ],
  ultra: [
    "Core AI Chatbot",
    "Unlimited Replies",
    "Maximum Knowledge Base",
    "Full Brand Customization",
    "Enhanced Lead Capture",
    "Priority Support Queue",
  ],
};

export function calculateSubscriptionAccess(
  profile: Partial<UserProfile> | null,
): UserSubscription {
  const now = new Date();

  if (!profile) {
    return {
      status: "none",
      tier: "free",
      trial_ends_at: null,
      subscription_ends_at: null,
      is_trial_active: false,
      has_access: true, // Free tier has basic access
      days_remaining: 0,
      features: TIER_FEATURES.free,
    };
  }

  // Check for active paid subscription first (highest priority)
  if (
    profile.subscription_status === "active" &&
    profile.subscription_ends_at
  ) {
    const subEndDate = new Date(profile.subscription_ends_at);
    const hasAccess = subEndDate > now;
    const daysRemaining = hasAccess
      ? Math.ceil(
          (subEndDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
        )
      : 0;

    return {
      status: hasAccess ? "active" : "expired",
      tier: profile.subscription_tier || "basic",
      trial_ends_at: null,
      subscription_ends_at: profile.subscription_ends_at,
      is_trial_active: false,
      has_access: hasAccess,
      days_remaining: daysRemaining,
      features: TIER_FEATURES[profile.subscription_tier || "basic"],
    };
  }

  // ROBUST TRIAL LOGIC: Check both subscription_status and trial_ends_at
  const trialEndDate = profile.trial_ends_at
    ? new Date(profile.trial_ends_at)
    : null;
  const isTrialStatus = profile.subscription_status === "trial";
  const hasValidTrialDate = trialEndDate && trialEndDate > now;

  // Active trial - both status and date must be valid for access
  if (isTrialStatus && hasValidTrialDate) {
    const daysRemaining = Math.ceil(
      (trialEndDate!.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
    );

    return {
      status: "trial",
      tier: "ultra",
      trial_ends_at: profile.trial_ends_at || null,
      subscription_ends_at: null,
      is_trial_active: true,
      has_access: true,
      days_remaining: Math.max(0, daysRemaining),
      features: TIER_FEATURES.ultra,
    };
  }

  // Check if user is eligible for a new trial (hasn't used trial yet)
  const hasNotUsedTrial = !profile.has_used_trial;
  const hasNoStripeCustomer =
    !profile.stripe_customer_id || profile.stripe_customer_id === "";

  if (
    hasNotUsedTrial &&
    hasNoStripeCustomer &&
    profile.subscription_status === "none"
  ) {
    return {
      status: "eligible", // Eligible for trial but gets free access by default
      tier: "free", // Give free tier access by default
      trial_ends_at: null,
      subscription_ends_at: null,
      is_trial_active: false,
      has_access: true, // ✅ FREE ACCESS for new users (not automatic trial)
      days_remaining: 0, // No trial days automatically given
      features: TIER_FEATURES.free, // ✅ Give free features immediately
    };
  }

  // Handle expired trial or used trial cases
  if (isTrialStatus || profile.has_used_trial) {
    return {
      status: "expired",
      tier: "free", // Fall back to free tier
      trial_ends_at: profile.trial_ends_at || null,
      subscription_ends_at: null,
      is_trial_active: false,
      has_access: true, // ✅ FALL BACK TO FREE ACCESS
      days_remaining: 0,
      features: TIER_FEATURES.free, // ✅ Give free features after trial expires
    };
  }

  // Final fallback - no subscription, no trial - default to free tier
  return {
    status: "none",
    tier: "free",
    trial_ends_at: null,
    subscription_ends_at: null,
    is_trial_active: false,
    has_access: true, // Free tier has basic access
    days_remaining: 0,
    features: TIER_FEATURES.free,
  };
}

export function formatSubscriptionStatus(
  subscription: UserSubscription,
): string {
  switch (subscription.status) {
    case "active":
      return `Active ${subscription.tier.toUpperCase()} plan (${subscription.days_remaining} days remaining)`;
    case "trial":
      return `Free trial active (${subscription.days_remaining} days remaining)`;
    case "eligible":
      return `Eligible for ${subscription.days_remaining}-day free trial`;
    case "expired":
      return "Subscription expired";
    case "past_due":
      return "Payment past due";
    case "canceled":
      return "Subscription canceled";
    default:
      return "No active subscription";
  }
}

export type NormalizedSubscription = {
  status: SubscriptionStatus; // normalized status
  tier: SubscriptionTier;
  isTrial: boolean;
  hasAccess: boolean;
};

// Normalizes various raw status/tier combos (e.g., trialing vs trial, none vs expired).
export function normalizeSubscription(
  profile: Partial<UserProfile> | null,
): NormalizedSubscription {
  const sub = calculateSubscriptionAccess(profile as any);
  // Map expired active subscription to 'expired'
  let status: SubscriptionStatus = sub.status;
  if (status === "none" && sub.is_trial_active) status = "trial";
  return {
    status,
    tier: sub.tier,
    isTrial: sub.is_trial_active,
    hasAccess: sub.has_access,
  };
}
