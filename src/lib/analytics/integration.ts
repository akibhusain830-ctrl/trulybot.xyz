// Integration hook for adding analytics to the chat system
// This updates existing chat routes to track analytics without breaking functionality

import { BotAnalyticsService } from './service';
import { ChatSession, ResponseType } from './types';
import { logger } from '@/lib/logger';

export class ChatAnalyticsIntegration {
  private static sessions = new Map<string, ChatSession>();

  /**
   * Start tracking a new chat session
   */
  static async startSession(
    workspaceId: string,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      const session = new ChatSession(workspaceId, userId);
      this.sessions.set(session.sessionId, session);

      // Track conversation start
      await BotAnalyticsService.trackConversationStart(
        session.sessionId,
        workspaceId,
        userId,
        metadata
      );

      return session.sessionId;
    } catch (error) {
      logger.error('Failed to start analytics session:', error);
      // Return a fallback session ID so chat continues working
      return `fallback_${Date.now()}`;
    }
  }

  /**
   * Track a message exchange
   */
  static async trackMessage(
    sessionId: string,
    userMessage: string,
    botResponse: string,
    responseType: ResponseType,
    responseTimeMs: number,
    options: {
      confidenceScore?: number;
      sourcesUsed?: number;
      intent?: string;
      workspaceId?: string;
      userId?: string;
    } = {}
  ): Promise<void> {
    try {
      const session = this.sessions.get(sessionId);
      if (session) {
        session.incrementMessageCount();
        
        await BotAnalyticsService.trackMessageExchange(
          sessionId,
          options.workspaceId || session.workspaceId,
          userMessage,
          botResponse,
          responseType,
          responseTimeMs,
          options.confidenceScore,
          options.sourcesUsed,
          options.userId || session.userId
        );
      }
    } catch (error) {
      logger.error('Failed to track message analytics:', error);
    }
  }

  /**
   * Track lead capture
   */
  static async trackLead(
    sessionId: string,
    intent: string,
    workspaceId?: string,
    userId?: string
  ): Promise<void> {
    try {
      const session = this.sessions.get(sessionId);
      await BotAnalyticsService.trackLeadCapture(
        sessionId,
        workspaceId || session?.workspaceId || '',
        intent,
        userId || session?.userId
      );
    } catch (error) {
      logger.error('Failed to track lead analytics:', error);
    }
  }

  /**
   * Track fallback responses
   */
  static async trackFallback(
    sessionId: string,
    userMessage: string,
    workspaceId?: string,
    userId?: string
  ): Promise<void> {
    try {
      const session = this.sessions.get(sessionId);
      await BotAnalyticsService.trackFallback(
        sessionId,
        workspaceId || session?.workspaceId || '',
        userMessage,
        userId || session?.userId
      );
    } catch (error) {
      logger.error('Failed to track fallback analytics:', error);
    }
  }

  /**
   * End a session
   */
  static async endSession(sessionId: string): Promise<void> {
    try {
      const session = this.sessions.get(sessionId);
      if (session) {
        await BotAnalyticsService.trackEvent({
          session_id: sessionId,
          workspace_id: session.workspaceId,
          user_id: session.userId,
          event_type: 'conversation_end',
          metadata: {
            duration_ms: session.getDuration(),
            message_count: session.messageCount
          }
        });

        this.sessions.delete(sessionId);
      }
    } catch (error) {
      logger.error('Failed to end analytics session:', error);
    }
  }

  /**
   * Clean up old sessions (call periodically)
   */
  static cleanupOldSessions(): void {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.startTime.getTime() > maxAge) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Get session info
   */
  static getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }
}

// Auto-cleanup old sessions every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    ChatAnalyticsIntegration.cleanupOldSessions();
  }, 10 * 60 * 1000);
}