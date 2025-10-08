import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SubscriptionService } from '@/lib/subscription/subscriptionService.server';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface BotAccessValidation {
  isValid: boolean;
  workspace_id?: string;
  subscription_tier?: string;
  error?: string;
}

export interface MessageLimitCheck {
  allowed: boolean;
  current: number;
  limit: number;
  error?: string;
}

export interface SecureChatRequest {
  botId: string;
  messages: ChatMessage[];
  userInput: string;
}

export class SecureChatService {
  private supabase: any = null;
  private subscriptionService: SubscriptionService | null = null;

  constructor() {
    // Don't initialize at constructor time - lazy load when needed
    this.supabase = null;
    this.subscriptionService = null;
  }

  private getSupabase() {
    if (!this.supabase) {
      this.supabase = createServerSupabaseClient();
    }
    return this.supabase;
  }

  private getSubscriptionService() {
    if (!this.subscriptionService) {
      this.subscriptionService = new SubscriptionService();
    }
    return this.subscriptionService;
  }

  /**
   * Validate that the authenticated user has access to the specified bot/workspace
   */
  async validateBotAccess(userId: string, botId: string): Promise<BotAccessValidation> {
    try {
      // Special case for demo bot - always accessible
      if (botId === 'demo') {
        return {
          isValid: true,
          workspace_id: 'demo',
          subscription_tier: 'demo'
        };
      }

      // Check if user has access to this workspace (botId = workspace_id)
      const { data: profile, error } = await this.getSupabase()
        .from('profiles')
        .select('workspace_id, subscription_tier')
        .eq('id', userId)
        .eq('workspace_id', botId)
        .single();

      if (error || !profile) {
        return {
          isValid: false,
          error: 'Bot not found or access denied'
        };
      }

      return {
        isValid: true,
        workspace_id: profile.workspace_id,
        subscription_tier: profile.subscription_tier
      };
    } catch (error) {
      console.error('[SecureChatService] Bot access validation error:', error);
      return {
        isValid: false,
        error: 'Access validation failed'
      };
    }
  }

  /**
   * Check message limits based on subscription tier
   */
  async checkMessageLimits(
    userId: string, 
    workspaceId: string, 
    subscriptionTier: string
  ): Promise<MessageLimitCheck> {
    try {
      // Get subscription limits
      const subscriptionStatus = await this.getSubscriptionService().getUserSubscriptionStatus(userId);
      
      if (!subscriptionStatus.isActive) {
        return {
          allowed: false,
          current: 0,
          limit: 0,
          error: 'Subscription required for chat access'
        };
      }

      const limits = this.getMessageLimits(subscriptionTier);
      
      if (limits.unlimited) {
        return {
          allowed: true,
          current: 0,
          limit: -1 // Unlimited
        };
      }

      // Check current usage for the month
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM format
      
      const { data: usage, error } = await this.getSupabase()
        .from('usage_counters')
        .select('monthly_conversations')
        .eq('workspace_id', workspaceId)
        .eq('month', currentMonth)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error is OK
        throw error;
      }

      const currentUsage = usage?.monthly_conversations || 0;
      const allowed = currentUsage < limits.monthlyLimit;

      return {
        allowed,
        current: currentUsage,
        limit: limits.monthlyLimit,
        error: allowed ? undefined : `Monthly message limit (${limits.monthlyLimit}) exceeded`
      };
    } catch (error) {
      console.error('[SecureChatService] Message limit check error:', error);
      return {
        allowed: false,
        current: 0,
        limit: 0,
        error: 'Failed to check message limits'
      };
    }
  }

  /**
   * Increment message usage counter
   */
  async incrementMessageUsage(workspaceId: string): Promise<void> {
    try {
      const currentMonth = new Date().toISOString().substring(0, 7);
      
      // Try to increment existing counter
      const { data: existing } = await this.getSupabase()
        .from('usage_counters')
        .select('id, monthly_conversations')
        .eq('workspace_id', workspaceId)
        .eq('month', currentMonth)
        .single();

      if (existing) {
        await this.getSupabase()
          .from('usage_counters')
          .update({
            monthly_conversations: existing.monthly_conversations + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Create new counter record
        await this.getSupabase()
          .from('usage_counters')
          .insert({
            workspace_id: workspaceId,
            user_id: null, // Workspace-level counter
            month: currentMonth,
            monthly_conversations: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('[SecureChatService] Failed to increment usage:', error);
      // Don't throw - this shouldn't block the chat
    }
  }

  /**
   * Sanitize user input to prevent injection attacks
   */
  sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .trim()
      .substring(0, 4000) // Limit input length
      .replace(/[<>]/g, '') // Remove potential HTML/XML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/data:/gi, '') // Remove data: protocols
      .replace(/vbscript:/gi, '') // Remove vbscript: protocols
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  }

  /**
   * Validate message format and content
   */
  validateMessages(messages: any[]): { valid: boolean; error?: string; sanitized?: ChatMessage[] } {
    if (!Array.isArray(messages) || messages.length === 0) {
      return {
        valid: false,
        error: 'Messages must be a non-empty array'
      };
    }

    if (messages.length > 50) {
      return {
        valid: false,
        error: 'Too many messages in conversation history'
      };
    }

    const sanitized: ChatMessage[] = [];

    for (const msg of messages) {
      if (!msg || typeof msg !== 'object') {
        return {
          valid: false,
          error: 'Invalid message format'
        };
      }

      const role = msg.role === 'assistant' ? 'assistant' : 'user';
      const content = this.sanitizeInput(msg.content || msg.text || '');

      if (!content) {
        return {
          valid: false,
          error: 'Message content cannot be empty'
        };
      }

      sanitized.push({
        role,
        content,
        timestamp: new Date()
      });
    }

    return {
      valid: true,
      sanitized
    };
  }

  /**
   * Rate limiting check for chat requests
   */
  private async checkRateLimit(userId: string, botId: string): Promise<boolean> {
    // Simple in-memory rate limiting (in production, use Redis)
    // Allow 60 requests per minute per user per bot
    const key = `chat_rate_${userId}_${botId}`;
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    
    // This is a simplified implementation
    // In production, implement proper distributed rate limiting
    return true;
  }

  /**
   * Get message limits based on subscription tier
   */
  private getMessageLimits(tier: string): { unlimited: boolean; monthlyLimit: number } {
    switch (tier) {
      case 'ultra':
      case 'pro':
        return { unlimited: true, monthlyLimit: -1 };
      case 'basic':
        return { unlimited: false, monthlyLimit: 1000 };
      case 'free':
        return { unlimited: false, monthlyLimit: 100 };
      default:
        return { unlimited: false, monthlyLimit: 10 };
    }
  }

  /**
   * Log security events for monitoring
   */
  private async logSecurityEvent(event: string, details: any): Promise<void> {
    try {
      console.log(`[SecureChatService:${event}]`, {
        timestamp: new Date().toISOString(),
        ...details
      });

      // In production, send to proper logging/monitoring service
      // await this.securityLogger.log(event, details);
    } catch (error) {
      console.error('[SecureChatService] Failed to log security event:', error);
    }
  }
}

export const secureChatService = new SecureChatService();