import { supabaseAdmin } from '@/lib/supabase/admin';
import { UserProfile, SubscriptionTier } from '@/lib/subscription';
import { logger } from '@/lib/logger';
import { withDatabaseFallback, safeAsync } from './robustness/errorHandling';
import { SafeResult } from './robustness/types';
import { withMonitoring, checkDatabaseHealth } from './robustness/monitoring';
import { failsafeTrialActivation, executeWithFailsafe } from './robustness/failsafe';

export class ProfileManager {
  static async getOrCreateProfile(userId: string, email: string): Promise<UserProfile> {
    const result = await withDatabaseFallback(
      // Primary operation: Try direct database operations
      async () => {
        logger.info('Getting or creating profile', { userId, email });
        return await this.fallbackGetOrCreateProfile(userId, email);
      },
      // Fallback operation: Create minimal profile if database fails
      async () => {
        logger.warn('Using minimal profile fallback', { userId });
        return this.createMinimalProfile(userId, email);
      }
    );

    if (result.success && result.data) {
      if (result.fallbackUsed) {
        logger.info('Profile retrieved using fallback', { userId });
      }
      return result.data;
    }

    // Final fallback - return minimal profile structure
    logger.error('All profile operations failed, using emergency fallback', { userId });
    return this.createMinimalProfile(userId, email);
  }

  /**
   * Create a minimal profile that ensures the application continues to work
   * even if database operations fail
   */
  private static createMinimalProfile(userId: string, email: string): UserProfile {
    return {
      id: userId,
      email,
      full_name: email.split('@')[0],
      role: 'owner',
      chatbot_name: 'Assistant',
      welcome_message: 'Hello! How can I help you today?',
      accent_color: '#2563EB',
      subscription_status: 'none', // No access until trial/subscription
      subscription_tier: 'basic',
      trial_ends_at: null,
      subscription_ends_at: null,
      payment_id: null,
      has_used_trial: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      workspace_id: userId, // Use userId as fallback workspace_id
      avatar_url: null,
      chatbot_logo_url: null,
      chatbot_theme: null,
      custom_css: null
    } as UserProfile;
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
          // Generate a unique slug to avoid collisions
          const baseSlug = `${email.split('@')[0]}-${userId.slice(0, 8)}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
          const uniqueSlug = `${baseSlug}-${Date.now()}`;
          
          const { data: workspace, error: workspaceError } = await supabaseAdmin
            .from('workspaces')
            .insert({
              name: 'Personal Workspace',
              slug: uniqueSlug,
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

        // Create new profile with or without workspace (NO AUTOMATIC TRIAL)
        const profileData: any = {
          id: userId,
          email,
          full_name: email.split('@')[0],
          role: 'owner',
          chatbot_name: 'Assistant',
          welcome_message: 'Hello! How can I help you today?',
          accent_color: '#2563EB',
          // NO automatic trial - user must explicitly start trial
          trial_ends_at: null,
          subscription_status: 'none', // No access until trial/subscription
          subscription_tier: 'basic',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (workspaceId) {
          profileData.workspace_id = workspaceId;
        }

        // Add has_used_trial if column exists (graceful degradation)
        try {
          profileData.has_used_trial = false; // New users haven't used trial yet
        } catch (e) {
          // Column doesn't exist yet, ignore
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
   * Enhanced trial activation with comprehensive error handling and fallbacks
   */
  static async startTrial(userId: string): Promise<{ profile: UserProfile; started: boolean; reason?: string }> {
    // Use comprehensive failsafe mechanisms for trial activation
    const failsafeResult = await failsafeTrialActivation(async () => {
      return await withMonitoring(async () => {
        return await withDatabaseFallback(
          // Primary operation: Try database function first
          async () => {
            logger.info('Starting trial with database function', { userId });
            
            const { data, error } = await supabaseAdmin.rpc('start_user_trial', {
              p_user_id: userId
            });

            if (error) {
              throw new Error(`Database function failed: ${error.message}`);
            }

            if (!data || typeof data !== 'object') {
              throw new Error('Invalid response from trial activation function');
            }

            const result = data as {
              success: boolean;
              reason: string;
              message: string;
              profile?: any;
              error?: string;
            };

            if (!result.success) {
              const reasonMap: Record<string, string> = {
                'profile_not_found': 'profile-not-found',
                'trial_already_used': 'trial-already-used',
                'active_subscription': 'active-subscription',
                'trial_already_active': 'trial-already-active',
                'database_error': 'database-error'
              };

              return {
                profile: result.profile as UserProfile || await this.getOrCreateProfile(userId, ''),
                started: false,
                reason: reasonMap[result.reason] || 'unknown-error'
              };
            }

            return {
              profile: result.profile as UserProfile,
              started: true
            };
          },
          // Fallback operation: Direct database operations
          async () => {
            logger.info('Using direct trial activation fallback', { userId });
            return await this.startTrialDirectly(userId);
          }
        );
      }, 'trial-activation', { userId });
    });

    // Handle failsafe result with full backward compatibility
    if (failsafeResult.success && failsafeResult.data) {
      const result = failsafeResult.data;
      
      if (result.success && result.data) {
        if (result.fallbackUsed || failsafeResult.failsafeActivated) {
          logger.info('Trial started using enhanced failsafe mechanisms', { 
            userId, 
            fallbackUsed: result.fallbackUsed,
            failsafeActivated: failsafeResult.failsafeActivated,
            retryCount: failsafeResult.retryCount
          });
        }
        return result.data;
      }

      // Handle nested error result
      logger.error('Trial activation failed within failsafe', { 
        userId, 
        error: result.error,
        failsafeActivated: failsafeResult.failsafeActivated
      });
      const profile = await this.getOrCreateProfile(userId, '');
      return { profile, started: false, reason: 'system-error' };
    }

    // Complete failsafe failure - emergency fallback with full compatibility
    logger.error('All failsafe trial activation methods failed', { 
      userId, 
      error: failsafeResult.error?.message,
      failsafeActivated: failsafeResult.failsafeActivated,
      retryCount: failsafeResult.retryCount
    });
    
    const profile = await this.getOrCreateProfile(userId, '');
    return { profile, started: false, reason: 'system-error' };
  }

  /**
   * Direct trial activation using database transactions
   * Robust fallback when start_user_trial function is missing
   */
  private static async startTrialDirectly(userId: string): Promise<{ profile: UserProfile; started: boolean; reason?: string }> {
    try {
      logger.info('Starting trial directly via database operations', { userId });
      
      // Get or create profile first
      const profile = await this.getOrCreateProfile(userId, '');
      
      const now = new Date();
      const trialEnd = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days from now

      // Check if user has already used their trial
      if (profile.has_used_trial === true) {
        logger.info('User already used trial', { userId });
        return { profile, started: false, reason: 'trial-already-used' };
      }

      // Check if user has active subscription
      if (profile.subscription_status === 'active' && 
          profile.subscription_ends_at && 
          new Date(profile.subscription_ends_at) > now) {
        logger.info('User has active subscription', { userId });
        return { profile, started: false, reason: 'active-subscription' };
      }

      // Check if user has active trial
      if (profile.trial_ends_at && new Date(profile.trial_ends_at) > now) {
        logger.info('User already has active trial', { userId });
        return { profile, started: false, reason: 'trial-already-active' };
      }

      // All checks passed - start the trial atomically
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          trial_ends_at: trialEnd.toISOString(),
          subscription_status: 'trial',
          subscription_tier: 'ultra',
          has_used_trial: true, // Mark trial as used permanently
          updated_at: now.toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        logger.error('Failed to update profile for trial', { userId, error: updateError });
        return { profile, started: false, reason: 'database-error' };
      }

      logger.info('Trial started successfully via direct method', { userId, trialEnd });
      return {
        profile: updatedProfile as UserProfile,
        started: true
      };

    } catch (error: any) {
      logger.error('[ProfileManager:startTrialDirectly] Error', { userId, error: error.message });
      
      // Final fallback: return current profile with error
      try {
        const profile = await this.getOrCreateProfile(userId, '');
        return { profile, started: false, reason: 'system-error' };
      } catch {
        throw new Error(`Trial activation failed: ${error.message}`);
      }
    }
  }

  static async activateSubscription(userId: string, tier: SubscriptionTier, paymentId?: string): Promise<UserProfile> {
    const maxRetries = 3;
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`Activating subscription for user ${userId}, attempt ${attempt}/${maxRetries}`, {
          userId,
          tier,
          paymentId,
          attempt
        });
        
        const subscriptionEndDate = new Date();
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

        const updatedProfile = await this.updateSubscription(userId, {
          subscription_status: 'active',
          subscription_tier: tier,
          subscription_ends_at: subscriptionEndDate.toISOString(),
          trial_ends_at: null, // Clear trial when subscription starts
          payment_id: paymentId || null
        });
        
        // Verify the subscription was actually activated
        if (updatedProfile.subscription_status !== 'active' || updatedProfile.subscription_tier !== tier) {
          throw new Error('Subscription activation verification failed');
        }
        
        logger.info('Subscription activated successfully', {
          userId,
          tier,
          paymentId,
          attempt,
          subscriptionStatus: updatedProfile.subscription_status,
          subscriptionTier: updatedProfile.subscription_tier
        });
        
        return updatedProfile;
        
      } catch (error: any) {
        lastError = error;
        logger.error(`Subscription activation attempt ${attempt} failed`, {
          userId,
          tier,
          paymentId,
          attempt,
          error: error.message,
          maxRetries
        });
        
        // If this isn't the last attempt, wait before retrying
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          logger.info(`Retrying subscription activation in ${delay}ms`, { userId, attempt, delay });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // If all attempts failed, log critical error and throw
    logger.error('CRITICAL: Subscription activation failed after all retries', {
      userId,
      tier,
      paymentId,
      maxRetries,
      finalError: lastError.message
    });
    
    throw new Error(`Failed to activate subscription after ${maxRetries} attempts: ${lastError.message}`);
  }
}
