// Chat session service for conversation tracking and analytics
// Provides comprehensive session management for customer support

import { createClient } from '@supabase/supabase-js';
import { ChatSession, SessionSummary, ConversationAnalytics, SessionMetrics, SessionBuilder, SessionMessageTracker } from './types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class ChatSessionService {
  /**
   * Create a new chat session
   */
  static async createSession(session: ChatSession): Promise<ChatSession | null> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([session])
        .select()
        .single();

      if (error) {
        console.error('Error creating chat session:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Chat session creation failed:', error);
      return null;
    }
  }

  /**
   * Update session statistics and activity
   */
  static async updateSessionActivity(
    sessionId: string,
    updates: {
      total_messages?: number;
      user_messages?: number;
      bot_messages?: number;
      fallback_count?: number;
      knowledge_base_hits?: number;
      avg_response_time_ms?: number;
      intent_category?: string;
      lead_captured?: boolean;
      escalated_to_human?: boolean;
      metadata?: Record<string, any>;
    }
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({
          ...updates,
          last_activity_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);

      if (error) {
        console.error('Error updating session activity:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session activity update failed:', error);
      return false;
    }
  }

  /**
   * End a chat session with resolution data
   */
  static async endSession(
    sessionId: string,
    resolution: {
      status: 'completed' | 'abandoned' | 'transferred' | 'expired';
      resolution_type?: 'self_service' | 'information_provided' | 'lead_converted' | 'escalated' | 'unresolved' | 'abandoned';
      issue_resolved?: boolean;
      satisfaction_rating?: number;
      support_category?: string;
      tags?: string[];
      duration_seconds?: number;
    }
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({
          ...resolution,
          ended_at: new Date().toISOString(),
          last_activity_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);

      if (error) {
        console.error('Error ending session:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session end failed:', error);
      return false;
    }
  }

  /**
   * Get session summary for customer support
   */
  static async getSessionSummary(sessionId: string): Promise<SessionSummary | null> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error || !data) {
        console.error('Error fetching session:', error);
        return null;
      }

      return {
        session_info: {
          id: data.id,
          session_id: data.session_id,
          status: data.status,
          started_at: data.started_at,
          duration: data.duration_seconds,
          resolution_type: data.resolution_type,
          satisfaction: data.satisfaction_rating,
          tags: data.tags
        },
        conversation_flow: {
          total_messages: data.total_messages,
          user_messages: data.user_messages,
          bot_messages: data.bot_messages,
          intent_category: data.intent_category,
          lead_captured: data.lead_captured,
          escalated: data.escalated_to_human
        },
        performance_metrics: {
          avg_response_time: data.avg_response_time_ms,
          fallback_count: data.fallback_count,
          knowledge_hits: data.knowledge_base_hits,
          device_type: data.device_type,
          country: data.country_code
        }
      };
    } catch (error) {
      console.error('Session summary failed:', error);
      return null;
    }
  }

  /**
   * Get workspace conversation analytics
   */
  static async getConversationAnalytics(
    workspaceId: string,
    days: number = 30
  ): Promise<ConversationAnalytics | null> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .rpc('get_conversation_analytics', {
          p_workspace_id: workspaceId,
          p_start_date: startDate.toISOString()
        });

      if (error) {
        console.error('Error getting conversation analytics:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Conversation analytics failed:', error);
      return null;
    }
  }

  /**
   * Get current session metrics for dashboard
   */
  static async getSessionMetrics(workspaceId: string): Promise<SessionMetrics | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_session_metrics', {
          p_workspace_id: workspaceId
        });

      if (error) {
        console.error('Error getting session metrics:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Session metrics failed:', error);
      return null;
    }
  }

  /**
   * Get active sessions for workspace
   */
  static async getActiveSessions(workspaceId: string): Promise<ChatSession[]> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('status', 'active')
        .order('last_activity_at', { ascending: false });

      if (error) {
        console.error('Error getting active sessions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Active sessions fetch failed:', error);
      return [];
    }
  }

  /**
   * Get sessions requiring escalation
   */
  static async getEscalationQueue(workspaceId: string): Promise<ChatSession[]> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('escalated_to_human', true)
        .eq('status', 'active')
        .order('started_at', { ascending: true });

      if (error) {
        console.error('Error getting escalation queue:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Escalation queue fetch failed:', error);
      return [];
    }
  }

  /**
   * Search sessions by criteria
   */
  static async searchSessions(
    workspaceId: string,
    criteria: {
      status?: string;
      support_category?: string;
      resolution_type?: string;
      date_from?: string;
      date_to?: string;
      satisfaction_min?: number;
      tags?: string[];
      limit?: number;
    }
  ): Promise<ChatSession[]> {
    try {
      let query = supabase
        .from('chat_sessions')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (criteria.status) {
        query = query.eq('status', criteria.status);
      }

      if (criteria.support_category) {
        query = query.eq('support_category', criteria.support_category);
      }

      if (criteria.resolution_type) {
        query = query.eq('resolution_type', criteria.resolution_type);
      }

      if (criteria.date_from) {
        query = query.gte('started_at', criteria.date_from);
      }

      if (criteria.date_to) {
        query = query.lte('started_at', criteria.date_to);
      }

      if (criteria.satisfaction_min) {
        query = query.gte('satisfaction_rating', criteria.satisfaction_min);
      }

      if (criteria.tags && criteria.tags.length > 0) {
        query = query.overlaps('tags', criteria.tags);
      }

      const { data, error } = await query
        .order('started_at', { ascending: false })
        .limit(criteria.limit || 100);

      if (error) {
        console.error('Error searching sessions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Session search failed:', error);
      return [];
    }
  }

  /**
   * Bulk update session tags
   */
  static async updateSessionTags(
    sessionIds: string[],
    tags: string[]
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ tags })
        .in('session_id', sessionIds);

      if (error) {
        console.error('Error updating session tags:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session tags update failed:', error);
      return false;
    }
  }

  /**
   * Get session trends for analytics
   */
  static async getSessionTrends(
    workspaceId: string,
    days: number = 30
  ): Promise<Array<{
    date: string;
    total_sessions: number;
    completed_sessions: number;
    avg_satisfaction: number;
    avg_duration: number;
  }> | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_session_trends', {
          p_workspace_id: workspaceId,
          p_days: days
        });

      if (error) {
        console.error('Error getting session trends:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Session trends failed:', error);
      return null;
    }
  }
}

export { SessionBuilder, SessionMessageTracker };