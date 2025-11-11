// Analytics tracking for bot interactions and business intelligence
// Provides insights into chatbot performance, user behavior, and conversion metrics

export type BotAnalyticsEventType = 
  | 'conversation_start'
  | 'message_sent'
  | 'message_received'
  | 'lead_captured'
  | 'document_referenced'
  | 'fallback_triggered'
  | 'conversation_end'
  | 'widget_opened'
  | 'widget_closed'
  | 'suggestion_clicked';

export type ResponseType = 'knowledge' | 'general' | 'fallback' | 'error';

export interface BotAnalyticsEvent {
  id?: string;
  session_id: string;
  user_id?: string;
  workspace_id: string;
  event_type: BotAnalyticsEventType;
  message_content?: string;
  response_content?: string;
  response_type?: ResponseType;
  response_time_ms?: number;
  confidence_score?: number; // 0-1
  sources_used?: number;
  intent_detected?: string;
  satisfaction_score?: number; // 1-5
  lead_converted?: boolean;
  user_agent?: string;
  ip_address?: string;
  referrer_url?: string;
  page_url?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface ConversationMetrics {
  total_conversations: number;
  avg_response_time: number;
  avg_confidence_score: number;
  lead_conversion_rate: number;
  satisfaction_avg: number;
  fallback_rate: number;
  document_usage_rate: number;
}

export interface AnalyticsSummary {
  today: ConversationMetrics;
  week: ConversationMetrics;
  month: ConversationMetrics;
  top_intents: Array<{
    intent: string;
    count: number;
    conversion_rate: number;
  }>;
  hourly_distribution: Array<{
    hour: number;
    conversations: number;
  }>;
}

// Session management for tracking conversation flows
export class ChatSession {
  public sessionId: string;
  public startTime: Date;
  public workspaceId: string;
  public userId?: string;
  public messageCount: number = 0;

  constructor(workspaceId: string, userId?: string) {
    this.sessionId = this.generateSessionId();
    this.startTime = new Date();
    this.workspaceId = workspaceId;
    this.userId = userId;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public incrementMessageCount(): void {
    this.messageCount++;
  }

  public getDuration(): number {
    return Date.now() - this.startTime.getTime();
  }
}