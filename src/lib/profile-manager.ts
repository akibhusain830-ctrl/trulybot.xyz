import { supabaseAdmin } from '@/lib/supabase/admin';
import { UserProfile, SubscriptionTier } from '@/lib/subscription';
import { logger } from '@/lib/logger';

export class ProfileManager {
  static async getOrCreateProfile(userId: string, userEmail: string): Promise<UserProfile> {
    try {
      const { data: existingProfile, error: fetchError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (existingProfile && !fetchError) {
        return existingProfile as UserProfile;
      }

      if (fetchError?.code === 'PGRST116') { // row not found
  logger.info('Creating new profile', { userId });
        const newProfile: Partial<UserProfile> = {
          id: userId,
            // workspace_id intentionally nullable until user creates/selects workspace
          email: userEmail,
          subscription_status: 'none',
          subscription_tier: 'free',
          trial_ends_at: null,
          subscription_ends_at: null,
          payment_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: createdProfile, error: createError } = await supabaseAdmin
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          logger.error('Profile creation failed', createError);
          throw new Error(`Failed to create profile: ${createError.message}`);
        }

  logger.info('Profile created successfully', { userId });
        return createdProfile as UserProfile;
      }

      throw new Error(`Failed to fetch profile: ${fetchError?.message}`);
    } catch (error: any) {
  logger.error('ProfileManager error', error);
      throw error;
    }
  }

  static async updateSubscription(
    userId: string,
    updates: Partial<Pick<UserProfile, 'subscription_status' | 'subscription_tier' | 'trial_ends_at' | 'subscription_ends_at' | 'payment_id'>>
  ): Promise<UserProfile> {
    try {
      const { data: updatedProfile, error } = await supabaseAdmin
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update subscription: ${error.message}`);
      }

      return updatedProfile as UserProfile;
    } catch (error: any) {
  logger.error('Subscription update failed', error);
      throw error;
    }
  }

  /**
   * Start a trial for the user if they don't currently have an active trial or subscription.
   * Idempotent: If a trial is already active, returns existing profile unchanged with a flag.
   */
  static async startTrial(userId: string): Promise<{ profile: UserProfile; started: boolean; reason?: string }> {
    // Fetch current profile first
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      throw new Error('Profile not found for trial start');
    }

    const now = new Date();

    // If subscription is active and not expired
    if (profile.subscription_status === 'active' && profile.subscription_ends_at) {
      const subEnd = new Date(profile.subscription_ends_at);
      if (subEnd > now) {
        return { profile: profile as UserProfile, started: false, reason: 'active-subscription' };
      }
    }

    // If an active trial still running
    if (profile.trial_ends_at) {
      const trialEnd = new Date(profile.trial_ends_at);
      if (trialEnd > now) {
        return { profile: profile as UserProfile, started: false, reason: 'trial-already-active' };
      }
    }

    // Start new 7-day trial
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    const updated = await this.updateSubscription(userId, {
      trial_ends_at: trialEndDate.toISOString(),
      subscription_status: 'trial',
      subscription_tier: 'ultra'
    });

    return { profile: updated, started: true };
  }

  static async activateSubscription(userId: string, tier: SubscriptionTier, paymentId?: string): Promise<UserProfile> {
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

    return this.updateSubscription(userId, {
      subscription_status: 'active',
      subscription_tier: tier,
      subscription_ends_at: subscriptionEndDate.toISOString(),
      trial_ends_at: null, // Clear trial when subscription starts
      payment_id: paymentId || null
    });
  }
}
