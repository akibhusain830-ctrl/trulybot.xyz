// Chat session tracking types and interfaces
// Provides comprehensive conversation flow tracking for customer support

export type SessionStatus = 'active' | 'completed' | 'abandoned' | 'transferred' | 'expired';

export type ResolutionType = 
  | 'self_service'
  | 'information_provided' 
  | 'lead_converted'
  | 'escalated'
  | 'unresolved'
  | 'abandoned';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';
export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown';

export interface ChatSession {
  id?: string;
  session_id: string;
  user_id?: string;
  workspace_id: string;
  
  // Context
  user_agent?: string;
  ip_address?: string;
  referrer_url?: string;
  page_url?: string;
  device_type?: DeviceType;
  
  // Status & Flow
  status: SessionStatus;
  total_messages: number;
  user_messages: number;
  bot_messages: number;
  duration_seconds?: number;
  
  // Business Intelligence
  intent_category?: string;
  satisfaction_rating?: number; // 1-5
  lead_captured: boolean;
  issue_resolved?: boolean;
  escalated_to_human: boolean;
  
  // Performance
  avg_response_time_ms?: number;
  fallback_count: number;
  knowledge_base_hits: number;
  
  // Support Data
  support_category?: string;
  urgency_level?: UrgencyLevel;
  tags?: string[];
  resolution_type?: ResolutionType;
  
  // Geographic
  timezone?: string;
  language_detected?: string;
  country_code?: string;
  
  // Timestamps
  started_at: string;
  last_activity_at: string;
  ended_at?: string;
  metadata?: Record<string, any>;
}

export interface SessionSummary {
  session_info: {
    id: string;
    session_id: string;
    status: SessionStatus;
    started_at: string;
    duration?: number;
    resolution_type?: ResolutionType;
    satisfaction?: number;
    tags?: string[];
  };
  conversation_flow: {
    total_messages: number;
    user_messages: number;
    bot_messages: number;
    intent_category?: string;
    lead_captured: boolean;
    escalated: boolean;
  };
  performance_metrics: {
    avg_response_time?: number;
    fallback_count: number;
    knowledge_hits: number;
    device_type?: DeviceType;
    country?: string;
  };
}

export interface ConversationAnalytics {
  total_sessions: number;
  avg_duration: number;
  resolution_breakdown: Record<string, number>;
  satisfaction_avg: number;
  top_support_categories: Array<{
    category: string;
    count: number;
  }>;
}

export interface SessionMetrics {
  // Volume metrics
  sessions_today: number;
  sessions_this_week: number;
  sessions_this_month: number;
  
  // Quality metrics
  avg_satisfaction: number;
  resolution_rate: number;
  escalation_rate: number;
  
  // Performance metrics
  avg_response_time: number;
  avg_session_duration: number;
  fallback_rate: number;
  
  // Support metrics
  active_sessions: number;
  pending_escalations: number;
  unresolved_sessions: number;
}

// Session builder for creating new sessions
export class SessionBuilder {
  private session: Partial<ChatSession>;

  constructor(sessionId: string, workspaceId: string) {
    this.session = {
      session_id: sessionId,
      workspace_id: workspaceId,
      status: 'active',
      total_messages: 0,
      user_messages: 0,
      bot_messages: 0,
      lead_captured: false,
      escalated_to_human: false,
      fallback_count: 0,
      knowledge_base_hits: 0,
      tags: []
    };
  }

  setUser(userId: string): SessionBuilder {
    this.session.user_id = userId;
    return this;
  }

  setContext(context: {
    user_agent?: string;
    ip_address?: string;
    referrer_url?: string;
    page_url?: string;
    device_type?: DeviceType;
    timezone?: string;
    country_code?: string;
  }): SessionBuilder {
    Object.assign(this.session, context);
    return this;
  }

  setIntent(category: string): SessionBuilder {
    this.session.intent_category = category;
    return this;
  }

  setSupport(category: string, urgency: UrgencyLevel = 'medium'): SessionBuilder {
    this.session.support_category = category;
    this.session.urgency_level = urgency;
    return this;
  }

  addTags(tags: string[]): SessionBuilder {
    this.session.tags = [...(this.session.tags || []), ...tags];
    return this;
  }

  setMetadata(metadata: Record<string, any>): SessionBuilder {
    this.session.metadata = { ...this.session.metadata, ...metadata };
    return this;
  }

  build(): ChatSession {
    return {
      ...this.session,
      started_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString()
    } as ChatSession;
  }
}

// Message counter for updating session stats
export class SessionMessageTracker {
  private userMessages = 0;
  private botMessages = 0;
  private fallbacks = 0;
  private knowledgeHits = 0;
  private responseTimes: number[] = [];

  incrementUserMessage(): void {
    this.userMessages++;
  }

  incrementBotMessage(responseTime?: number, usedKnowledge: boolean = false, isFallback: boolean = false): void {
    this.botMessages++;
    
    if (responseTime) {
      this.responseTimes.push(responseTime);
    }
    
    if (usedKnowledge) {
      this.knowledgeHits++;
    }
    
    if (isFallback) {
      this.fallbacks++;
    }
  }

  getStats(): {
    total_messages: number;
    user_messages: number;
    bot_messages: number;
    fallback_count: number;
    knowledge_base_hits: number;
    avg_response_time_ms?: number;
  } {
    return {
      total_messages: this.userMessages + this.botMessages,
      user_messages: this.userMessages,
      bot_messages: this.botMessages,
      fallback_count: this.fallbacks,
      knowledge_base_hits: this.knowledgeHits,
      avg_response_time_ms: this.responseTimes.length > 0 
        ? Math.round(this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length)
        : undefined
    };
  }
}