import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/secrets';
import { logger } from '@/lib/logger';
import { BotAnalyticsEvent, BotAnalyticsEventType, ResponseType, AnalyticsSummary, ConversationMetrics } from './types';

// Use admin client for analytics (system-level operations)
const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  { auth: { persistSession: false } }
);

export class BotAnalyticsService {
  
  /**
   * Track a bot interaction event
   */
  static async trackEvent(event: BotAnalyticsEvent): Promise<void> {
    try {
      // Sanitize sensitive data
      const sanitizedEvent = this.sanitizeEvent(event);
      
      const { error } = await supabaseAdmin
        .from('bot_analytics_events')
        .insert([sanitizedEvent]);

      if (error) {
        logger.error('Failed to track analytics event:', error);
        // Don't throw - analytics failures shouldn't break user experience
      }
    } catch (err) {
      logger.error('Analytics tracking error:', err);
    }
  }

  /**
   * Track a conversation start
   */
  static async trackConversationStart(
    sessionId: string,
    workspaceId: string,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      session_id: sessionId,
      workspace_id: workspaceId,
      user_id: userId,
      event_type: 'conversation_start',
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Track a message exchange with performance metrics
   */
  static async trackMessageExchange(
    sessionId: string,
    workspaceId: string,
    userMessage: string,
    botResponse: string,
    responseType: ResponseType,
    responseTimeMs: number,
    confidenceScore?: number,
    sourcesUsed: number = 0,
    userId?: string
  ): Promise<void> {
    await this.trackEvent({
      session_id: sessionId,
      workspace_id: workspaceId,
      user_id: userId,
      event_type: 'message_received',
      message_content: this.truncateMessage(userMessage),
      response_content: this.truncateMessage(botResponse),
      response_type: responseType,
      response_time_ms: responseTimeMs,
      confidence_score: confidenceScore,
      sources_used: sourcesUsed
    });
  }

  /**
   * Track lead capture events
   */
  static async trackLeadCapture(
    sessionId: string,
    workspaceId: string,
    intent: string,
    userId?: string
  ): Promise<void> {
    await this.trackEvent({
      session_id: sessionId,
      workspace_id: workspaceId,
      user_id: userId,
      event_type: 'lead_captured',
      intent_detected: intent,
      lead_converted: true
    });
  }

  /**
   * Track fallback responses (important for improving AI)
   */
  static async trackFallback(
    sessionId: string,
    workspaceId: string,
    userMessage: string,
    userId?: string
  ): Promise<void> {
    await this.trackEvent({
      session_id: sessionId,
      workspace_id: workspaceId,
      user_id: userId,
      event_type: 'fallback_triggered',
      message_content: this.truncateMessage(userMessage),
      response_type: 'fallback'
    });
  }

  /**
   * Get analytics summary for a workspace
   */
  static async getAnalyticsSummary(workspaceId: string): Promise<AnalyticsSummary> {
    try {
      const [today, week, month, topIntents, hourlyDist] = await Promise.all([
        this.getMetricsForPeriod(workspaceId, '1 day'),
        this.getMetricsForPeriod(workspaceId, '1 week'),
        this.getMetricsForPeriod(workspaceId, '1 month'),
        this.getTopIntents(workspaceId),
        this.getHourlyDistribution(workspaceId)
      ]);

      return {
        today,
        week,
        month,
        top_intents: topIntents,
        hourly_distribution: hourlyDist
      };
    } catch (error) {
      logger.error('Failed to get analytics summary:', error);
      throw new Error('Analytics summary unavailable');
    }
  }

  /**
   * Get conversation metrics for a time period
   */
  private static async getMetricsForPeriod(
    workspaceId: string,
    period: string
  ): Promise<ConversationMetrics> {
    const { data, error } = await supabaseAdmin
      .from('bot_analytics_events')
      .select('*')
      .eq('workspace_id', workspaceId)
      .gte('created_at', `now() - interval '${period}'`);

    if (error) {
      logger.error('Failed to get metrics:', error);
      return this.getEmptyMetrics();
    }

    return this.calculateMetrics(data || []);
  }

  /**
   * Calculate metrics from raw event data
   */
  private static calculateMetrics(events: any[]): ConversationMetrics {
    if (events.length === 0) return this.getEmptyMetrics();

    const conversations = new Set(events.map(e => e.session_id)).size;
    const messageEvents = events.filter(e => e.event_type === 'message_received');
    const leadEvents = events.filter(e => e.lead_converted === true);
    const fallbackEvents = events.filter(e => e.response_type === 'fallback');
    const docEvents = events.filter(e => e.sources_used > 0);
    const satisfactionEvents = events.filter(e => e.satisfaction_score !== null);

    const avgResponseTime = messageEvents.length > 0
      ? messageEvents.reduce((sum, e) => sum + (e.response_time_ms || 0), 0) / messageEvents.length
      : 0;

    const avgConfidence = messageEvents.length > 0
      ? messageEvents.reduce((sum, e) => sum + (e.confidence_score || 0), 0) / messageEvents.length
      : 0;

    const avgSatisfaction = satisfactionEvents.length > 0
      ? satisfactionEvents.reduce((sum, e) => sum + e.satisfaction_score, 0) / satisfactionEvents.length
      : 0;

    return {
      total_conversations: conversations,
      avg_response_time: Math.round(avgResponseTime),
      avg_confidence_score: Math.round(avgConfidence * 100) / 100,
      lead_conversion_rate: conversations > 0 ? Math.round((leadEvents.length / conversations) * 100) / 100 : 0,
      satisfaction_avg: Math.round(avgSatisfaction * 100) / 100,
      fallback_rate: messageEvents.length > 0 ? Math.round((fallbackEvents.length / messageEvents.length) * 100) / 100 : 0,
      document_usage_rate: messageEvents.length > 0 ? Math.round((docEvents.length / messageEvents.length) * 100) / 100 : 0
    };
  }

  /**
   * Get top user intents
   */
  private static async getTopIntents(workspaceId: string): Promise<Array<{intent: string, count: number, conversion_rate: number}>> {
    const { data, error } = await supabaseAdmin
      .from('bot_analytics_events')
      .select('intent_detected, lead_converted')
      .eq('workspace_id', workspaceId)
      .not('intent_detected', 'is', null)
      .gte('created_at', `now() - interval '1 month'`);

    if (error || !data) return [];

    const intentMap = new Map<string, {count: number, conversions: number}>();
    
    data.forEach(event => {
      const intent = event.intent_detected;
      const current = intentMap.get(intent) || {count: 0, conversions: 0};
      current.count++;
      if (event.lead_converted) current.conversions++;
      intentMap.set(intent, current);
    });

    return Array.from(intentMap.entries())
      .map(([intent, stats]) => ({
        intent,
        count: stats.count,
        conversion_rate: Math.round((stats.conversions / stats.count) * 100) / 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Get hourly conversation distribution
   */
  private static async getHourlyDistribution(workspaceId: string): Promise<Array<{hour: number, conversations: number}>> {
    const { data, error } = await supabaseAdmin.rpc('get_hourly_conversation_distribution', {
      workspace_id_param: workspaceId
    });

    if (error || !data) {
      // Fallback to simple query if RPC doesn't exist
      return Array.from({length: 24}, (_, i) => ({hour: i, conversations: 0}));
    }

    return data;
  }

  /**
   * Utility methods
   */
  private static getEmptyMetrics(): ConversationMetrics {
    return {
      total_conversations: 0,
      avg_response_time: 0,
      avg_confidence_score: 0,
      lead_conversion_rate: 0,
      satisfaction_avg: 0,
      fallback_rate: 0,
      document_usage_rate: 0
    };
  }

  private static sanitizeEvent(event: BotAnalyticsEvent): BotAnalyticsEvent {
    return {
      ...event,
      message_content: event.message_content ? this.truncateMessage(event.message_content) : undefined,
      response_content: event.response_content ? this.truncateMessage(event.response_content) : undefined,
      // Remove potentially sensitive data from metadata
      metadata: this.sanitizeMetadata(event.metadata)
    };
  }

  private static truncateMessage(message: string, maxLength: number = 500): string {
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  }

  private static sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> {
    if (!metadata) return {};
    
    // Remove sensitive fields
    const sanitized = {...metadata};
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;
    delete sanitized.api_key;
    
    return sanitized;
  }
}

// Helper function for database RPC (add this to your database if needed)
export const hourlyDistributionSQL = `
CREATE OR REPLACE FUNCTION get_hourly_conversation_distribution(workspace_id_param UUID)
RETURNS TABLE(hour INT, conversations BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(HOUR FROM created_at)::INT as hour,
    COUNT(DISTINCT session_id) as conversations
  FROM bot_analytics_events 
  WHERE workspace_id = workspace_id_param
    AND created_at >= NOW() - INTERVAL '7 days'
    AND event_type = 'conversation_start'
  GROUP BY EXTRACT(HOUR FROM created_at)
  ORDER BY hour;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;