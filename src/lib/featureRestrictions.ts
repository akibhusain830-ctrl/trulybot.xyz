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

export const TIER_RESTRICTIONS: Record<SubscriptionTier, FeatureRestrictions> = {
  free: {
    canCustomizeName: false,
    canCustomizeWelcomeMessage: false,
    canUploadLogo: false,
    canChangeColors: false,
    canCaptureLead: false,
    canRemoveBranding: false,
    maxKnowledgeUploads: 1,
    maxKnowledgeWords: 500,
    monthlyConversationLimit: 100,
  },
  basic: {
    canCustomizeName: true,
    canCustomizeWelcomeMessage: true,
    canUploadLogo: false,
    canChangeColors: false,
    canCaptureLead: false,
    canRemoveBranding: true,
    maxKnowledgeUploads: 4,
    maxKnowledgeWords: 2000,
    monthlyConversationLimit: 1000,
  },
  pro: {
    canCustomizeName: true,
    canCustomizeWelcomeMessage: true,
    canUploadLogo: true,
    canChangeColors: true,
    canCaptureLead: true,
    canRemoveBranding: true,
    maxKnowledgeUploads: 10,
    maxKnowledgeWords: 15000,
    monthlyConversationLimit: null, // unlimited
  },
  ultra: {
    canCustomizeName: true,
    canCustomizeWelcomeMessage: true,
    canUploadLogo: true,
    canChangeColors: true,
    canCaptureLead: true,
    canRemoveBranding: true,
    maxKnowledgeUploads: 25,
    maxKnowledgeWords: 50000,
    monthlyConversationLimit: null, // unlimited
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