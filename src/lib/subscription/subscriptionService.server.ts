import { createServerSupabaseClient } from '@/lib/supabase/server';

export type SubscriptionTier = 'basic' | 'pro' | 'ultra' | 'trial';

interface SubscriptionStatus {
  tier: SubscriptionTier;
  isActive: boolean;
  isTrial: boolean;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
  daysRemaining: number | null;
  features: {
    canCustomizeName: boolean;
    canCustomizeWelcome: boolean;
    canCustomizeColor: boolean;
    canCustomizeLogo: boolean;
    canCustomizeTheme: boolean;
    canCustomizeCSS: boolean;
    maxKnowledgeItems: number;
    maxMessagesPerMonth: number;
  };
}

const TIER_FEATURES = {
  basic: {
    canCustomizeName: false,
    canCustomizeWelcome: false,
    canCustomizeColor: false,
    canCustomizeLogo: false,
    canCustomizeTheme: false,
    canCustomizeCSS: false,
    maxKnowledgeItems: 10,
    maxMessagesPerMonth: 1000
  },
  pro: {
    canCustomizeName: true,
    canCustomizeWelcome: true,
    canCustomizeColor: false,
    canCustomizeLogo: false,
    canCustomizeTheme: false,
    canCustomizeCSS: false,
    maxKnowledgeItems: 100,
    maxMessagesPerMonth: 10000
  },
  ultra: {
    canCustomizeName: true,
    canCustomizeWelcome: true,
    canCustomizeColor: true,
    canCustomizeLogo: true,
    canCustomizeTheme: true,
    canCustomizeCSS: true,
    maxKnowledgeItems: -1, // unlimited
    maxMessagesPerMonth: -1 // unlimited
  },
  trial: {
    canCustomizeName: true,
    canCustomizeWelcome: true,
    canCustomizeColor: true,
    canCustomizeLogo: true,
    canCustomizeTheme: true,
    canCustomizeCSS: true,
    maxKnowledgeItems: -1,
    maxMessagesPerMonth: -1
  }
};

export async function getUserSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  const supabase = createServerSupabaseClient();
  
  try {
    // Get user profile with trial info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('trial_ends_at, created_at')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return getDefaultSubscriptionStatus();
    }

    // Get active subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('plan_name, status, current_period_end')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    // Check if user has active subscription
    if (subscription && subscription.status === 'active') {
      const tier = getTierFromPlanName(subscription.plan_name);
      const endsAt = new Date(subscription.current_period_end);
      const now = new Date();
      const daysRemaining = Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        tier,
        isActive: true,
        isTrial: false,
        trialEndsAt: null,
        subscriptionEndsAt: subscription.current_period_end,
        daysRemaining,
        features: TIER_FEATURES[tier]
      };
    }

    // Check if user is in trial period
    if (profile?.trial_ends_at) {
      const trialEnd = new Date(profile.trial_ends_at);
      const now = new Date();
      const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysRemaining > 0) {
        return {
          tier: 'trial',
          isActive: true,
          isTrial: true,
          trialEndsAt: profile.trial_ends_at,
          subscriptionEndsAt: null,
          daysRemaining,
          features: TIER_FEATURES.trial
        };
      }
    }

    // Default to basic tier
    return getDefaultSubscriptionStatus();
    
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return getDefaultSubscriptionStatus();
  }
}

function getTierFromPlanName(planName: string): SubscriptionTier {
  const name = planName.toLowerCase();
  if (name.includes('ultra')) return 'ultra';
  if (name.includes('pro')) return 'pro';
  return 'basic';
}

function getDefaultSubscriptionStatus(): SubscriptionStatus {
  return {
    tier: 'basic',
    isActive: true,
    isTrial: false,
    trialEndsAt: null,
    subscriptionEndsAt: null,
    daysRemaining: null,
    features: TIER_FEATURES.basic
  };
}

export async function canAccessFeature(
  userId: string,
  feature: keyof SubscriptionStatus['features']
): Promise<boolean> {
  const status = await getUserSubscriptionStatus(userId);
  return status.features[feature] as boolean;
}

export async function requireFeatureAccess(
  userId: string,
  feature: keyof SubscriptionStatus['features']
): Promise<void> {
  const hasAccess = await canAccessFeature(userId, feature);
  if (!hasAccess) {
    throw new Error(`Feature '${feature}' requires a higher subscription tier`);
  }
}
