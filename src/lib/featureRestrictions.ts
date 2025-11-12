/**
 * Feature restriction system for different subscription tiers
 * Enforces free plan limitations as specified
 */

import { SubscriptionTier } from './subscription';

export interface FeatureRestrictions {
  canCustomizeName: boolean;
  canCustomizeWelcomeMessage: boolean;
  canUploadLogo: boolean;
  canChangeColors: boolean;
  canCaptureLead: boolean;
  canRemoveBranding: boolean;
  maxKnowledgeUploads: number;
  maxKnowledgeWords: number;
  monthlyConversationLimit: number | null; // null means unlimited
}

// Feature restrictions by tier - SOFT CAPS
// Upload and word limits show upgrade prompts but don't block

export const FEATURE_RESTRICTIONS = {
  free: {
    maxKnowledgeUploads: 10,    // Soft cap - show toast when reached
    maxKnowledgeWords: 2000,    // Soft cap - show toast when reached
    allowCustomization: false,
    allowBranding: false,
    allowLeadCapture: false,
    allowAnalytics: false,
  },
  basic: {
    maxKnowledgeUploads: 20,    // Soft cap - show toast when reached
    maxKnowledgeWords: 5000,    // Soft cap - show toast when reached
    allowCustomization: true,
    allowBranding: false,
    allowLeadCapture: true,
    allowAnalytics: true,
  },
  pro: {
    maxKnowledgeUploads: 50,    // Soft cap - show toast when reached
    maxKnowledgeWords: 15000,   // Soft cap - show toast when reached
    allowCustomization: true,
    allowBranding: true,
    allowLeadCapture: true,
    allowAnalytics: true,
  },
  enterprise: {
    maxKnowledgeUploads: 100,   // Soft cap - show toast when reached
    maxKnowledgeWords: 30000,   // Soft cap - show toast when reached
    allowCustomization: true,
    allowBranding: true,
    allowLeadCapture: true,
    allowAnalytics: true,
  },
};

// Tier restrictions mapping to FeatureRestrictions interface
const TIER_RESTRICTIONS: Record<SubscriptionTier, FeatureRestrictions> = {
  free: {
    canCustomizeName: false,
    canCustomizeWelcomeMessage: false,
    canUploadLogo: false,
    canChangeColors: false,
    canCaptureLead: false,
    canRemoveBranding: false,
    maxKnowledgeUploads: 10,      // Soft cap
    maxKnowledgeWords: 2000,      // Soft cap
    monthlyConversationLimit: 300,
  },
  basic: {
    canCustomizeName: true,
    canCustomizeWelcomeMessage: true,
    canUploadLogo: false,
    canChangeColors: false,
    canCaptureLead: true,
    canRemoveBranding: true,
    maxKnowledgeUploads: 20,      // Soft cap
    maxKnowledgeWords: 5000,      // Soft cap
    monthlyConversationLimit: 1000,
  },
  pro: {
    canCustomizeName: true,
    canCustomizeWelcomeMessage: true,
    canUploadLogo: true,
    canChangeColors: true,
    canCaptureLead: true,
    canRemoveBranding: true,
    maxKnowledgeUploads: 50,      // Soft cap
    maxKnowledgeWords: 15000,     // Soft cap
    monthlyConversationLimit: 3000,
  },
  enterprise: {
    canCustomizeName: true,
    canCustomizeWelcomeMessage: true,
    canUploadLogo: true,
    canChangeColors: true,
    canCaptureLead: true,
    canRemoveBranding: true,
    maxKnowledgeUploads: 100,     // Soft cap
    maxKnowledgeWords: 30000,     // Soft cap
    monthlyConversationLimit: 15000,
  },
};

/**
 * Get feature restrictions for a specific tier
 */
export function getFeatureRestrictions(tier: SubscriptionTier): FeatureRestrictions {
  return TIER_RESTRICTIONS[tier];
}

/**
 * Check if a user can access a specific feature
 */
export function canAccessFeature(
  userTier: SubscriptionTier,
  feature: keyof FeatureRestrictions
): boolean {
  const restrictions = getFeatureRestrictions(userTier);
  const value = restrictions[feature];
  
  // For boolean features, return the boolean value
  if (typeof value === 'boolean') {
    return value;
  }
  
  // For numeric features, return true if > 0
  if (typeof value === 'number') {
    return value > 0;
  }
  
  // For null values (unlimited), return true
  return value !== null;
}

/**
 * Get upgrade message for restricted features
 */
export function getUpgradeMessage(
  currentTier: SubscriptionTier,
  feature: string
): string {
  const upgradeMessages: Record<string, string> = {
    canCustomizeName: 'Upgrade to Basic plan to customize your chatbot name',
    canCustomizeWelcomeMessage: 'Upgrade to Basic plan to customize welcome messages',
    canUploadLogo: 'Upgrade to Pro plan to upload custom logos',
    canChangeColors: 'Upgrade to Pro plan to customize colors and themes',
    canCaptureLead: 'Upgrade to Pro plan to enable lead capture',
    canRemoveBranding: 'Upgrade to Basic plan to remove TrulyBot branding',
  };
  
  return upgradeMessages[feature] || 'Upgrade your plan to access this feature';
}

/**
 * Check if user has reached their monthly conversation limit
 */
export function hasReachedConversationLimit(
  userTier: SubscriptionTier,
  currentMonthConversations: number
): boolean {
  const restrictions = getFeatureRestrictions(userTier);
  
  if (restrictions.monthlyConversationLimit === null) {
    return false; // unlimited
  }
  
  return currentMonthConversations >= restrictions.monthlyConversationLimit;
}

/**
 * Check if user has reached their knowledge upload limit
 */
export function hasReachedUploadLimit(
  userTier: SubscriptionTier,
  currentUploads: number
): boolean {
  const restrictions = getFeatureRestrictions(userTier);
  return currentUploads >= restrictions.maxKnowledgeUploads;
}

/**
 * Check if user has reached their knowledge word limit
 */
export function hasReachedWordLimit(
  userTier: SubscriptionTier,
  currentWords: number
): boolean {
  const restrictions = getFeatureRestrictions(userTier);
  return currentWords >= restrictions.maxKnowledgeWords;
}
