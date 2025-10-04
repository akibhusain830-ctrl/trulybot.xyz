import { supabaseAdmin } from '@/lib/supabase/admin';
import { UserProfile, SubscriptionTier } from '@/lib/subscription';
import { logger } from '@/lib/logger';

export class ProfileManager {
  static async getOrCreateProfile(userId: string, email: string): Promise<UserProfile> {
    try {
      logger.info('Getting or creating profile', { userId, email });
      
      // Skip RPC for now and use direct database operations
      return await this.fallbackGetOrCreateProfile(userId, email);
      
      /* TODO: Uncomment when database functions are confirmed working
      // Use the robust database function to get or create profile
      const { data: profiles, error: functionError } = await supabaseAdmin
        .rpc('get_or_create_profile', {
          p_user_id: userId,
          p_email: email
        });

      if (functionError) {
        logger.error('Database function error:', functionError);
        // Fallback to direct database operations
        return await this.fallbackGetOrCreateProfile(userId, email);
      }

      if (profiles && profiles.length > 0) {
        return profiles[0] as UserProfile;
      }

      // If no profile returned, try fallback
      return await this.fallbackGetOrCreateProfile(userId, email);
      */
    } catch (error) {
      logger.error('Error in getOrCreateProfile', error);
      // Final fallback
      return await this.fallbackGetOrCreateProfile(userId, email);
    }
  }

  // Fallback method for profile creation
  private static async fallbackGetOrCreateProfile(userId: string, email: string): Promise<UserProfile> {
    try {
      // First try to get existing profile
      const { data: profile, error: fetchError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        logger.error('Profile fetch error:', fetchError);
        throw new Error(`Failed to fetch profile: ${fetchError.message}`);
      }

      if (!profile) {
        logger.info('Creating new profile', { userId });
        
        let workspaceId = null;
        
        // Try to create workspace, but don't fail if workspaces table doesn't exist
        try {
          const { data: workspace, error: workspaceError } = await supabaseAdmin
            .from('workspaces')
            .insert({
              name: 'Personal Workspace',
              slug: `${email.split('@')[0]}-${userId.slice(0, 8)}`.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (workspaceError) {
            logger.warn('Workspace creation failed', { error: workspaceError });
          } else {
            workspaceId = workspace.id;
          }
        } catch (workspaceErr) {
          logger.warn('Workspace table error', { error: workspaceErr });
        }

        // Create new profile with or without workspace
        const profileData: any = {
          id: userId,
          email,
          full_name: email.split('@')[0],
          role: 'owner',
          chatbot_name: 'Assistant',
          welcome_message: 'Hello! How can I help you today?',
          accent_color: '#2563EB',
          trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          subscription_status: 'trial',
          subscription_tier: 'ultra', // Give trial users ultra features
          has_used_trial: true, // Mark as used since we're starting a trial
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (workspaceId) {
          profileData.workspace_id = workspaceId;
        }

        const { data: newProfile, error: createError } = await supabaseAdmin
          .from('profiles')
          .insert(profileData)
          .select()
          .single();

        if (createError) {
          logger.error('Profile creation error:', createError);
          throw new Error(`Failed to create profile: ${createError.message}`);
        }

        // Try to initialize usage counters, but don't fail if table doesn't exist
        try {
          await supabaseAdmin
            .from('usage_counters')
            .insert({
              user_id: userId,
              workspace_id: workspaceId || userId, // Use user ID as fallback
              month: new Date().toISOString().slice(0, 7), // YYYY-MM format
              monthly_uploads: 0,
              monthly_conversations: 0,
              monthly_words: 0,
              total_stored_words: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
        } catch (usageErr) {
          logger.warn('Usage counters initialization failed', { error: usageErr });
        }

        logger.info('Successfully created profile', { userId });
        return newProfile as UserProfile;
      }

      logger.info('Found existing profile', { userId });
      return profile as UserProfile;
    } catch (error) {
      logger.error('Error in fallbackGetOrCreateProfile:', error);
      throw error;
    }
  }  static async updateSubscription(
    userId: string,
    updates: Partial<Pick<UserProfile, 'subscription_status' | 'subscription_tier' | 'trial_ends_at' | 'subscription_ends_at' | 'payment_id' | 'has_used_trial'>>
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
   * Start a trial for the user if they haven't used a trial before and don't have an active subscription.
   * Industry standard: One trial per user account to prevent abuse.
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

    // Check if user has already used their one trial (industry standard)
    if (profile.has_used_trial) {
      return { profile: profile as UserProfile, started: false, reason: 'trial-already-used' };
    }

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

    // Start new 7-day trial and mark as used
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    const updated = await this.updateSubscription(userId, {
      trial_ends_at: trialEndDate.toISOString(),
      subscription_status: 'trial',
      subscription_tier: 'ultra',
      has_used_trial: true // Permanently mark trial as used
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
