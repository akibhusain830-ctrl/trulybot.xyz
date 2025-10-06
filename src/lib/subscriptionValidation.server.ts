/**
 * Server-only subscription validation utilities
 * These functions require database access and should only be used in API routes
 */

import { UserProfile, SubscriptionStatus, SubscriptionTier } from './subscription';
import { supabaseAdmin } from './supabase/admin';
import { validateSubscriptionFromProfile, SubscriptionValidation } from './subscriptionValidation';

/**
 * Primary function to validate subscription status with database fetch
 * Use this for API routes and server-side validation
 */
export async function validateUserSubscription(userId: string): Promise<SubscriptionValidation> {
  try {
    // Fetch current profile from database
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return {
        isValid: false,
        status: 'none',
        tier: 'basic',
        hasAccess: false,
        isTrialActive: false,
        daysRemaining: 0,
        reason: 'profile_not_found'
      };
    }

    // Use the profile-based validation
    return validateSubscriptionFromProfile(profile);
    
  } catch (error) {
    console.error('[validateUserSubscription] Error:', error);
    return {
      isValid: false,
      status: 'none',
      tier: 'basic', 
      hasAccess: false,
      isTrialActive: false,
      daysRemaining: 0,
      reason: 'validation_error'
    };
  }
}

/**
 * Server-side function to ensure user has valid subscription
 * Returns standardized error responses for API middleware
 */
export async function requireValidSubscription(userId: string, minTier: SubscriptionTier = 'basic') {
  const validation = await validateUserSubscription(userId);
  
  if (!validation.isValid) {
    return {
      success: false,
      status: 402, // Payment Required
      error: 'Subscription required',
      details: {
        current_status: validation.status,
        current_tier: validation.tier,
        required_tier: minTier,
        reason: validation.reason
      }
    };
  }

  // Import hasAccessToTier from the client-safe file
  const { hasAccessToTier } = await import('./subscriptionValidation');
  
  if (!hasAccessToTier(validation.tier, minTier)) {
    return {
      success: false,
      status: 402, // Payment Required
      error: `${minTier} subscription required`,
      details: {
        current_status: validation.status,
        current_tier: validation.tier,
        required_tier: minTier,
        reason: 'insufficient_tier'
      }
    };
  }

  return {
    success: true,
    validation
  };
}