import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface SecurityEvent {
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  eventData?: Record<string, any>;
  additionalContext?: Record<string, any>;
  sessionId?: string;
  requestId?: string;
}

export interface AuditTrailEntry {
  tableName: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT_SENSITIVE';
  recordId?: string;
  userId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  endpoint?: string;
  requestId?: string;
  reason?: string;
}

export interface RateLimitViolation {
  userId?: string;
  ipAddress: string;
  endpoint: string;
  limitType: 'per_user' | 'per_ip' | 'per_endpoint' | 'burst' | 'concurrent';
  currentCount: number;
  limitThreshold: number;
  windowDurationSeconds: number;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
  requestData?: Record<string, any>;
}

export interface AuthenticationEvent {
  eventType: 'login_attempt' | 'login_success' | 'login_failure' | 'logout' | 'session_refresh' | 'password_reset' | 'account_lockout' | 'suspicious_login';
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
  success: boolean;
  failureReason?: string;
  eventData?: Record<string, any>;
  suspicious?: boolean;
  requiresReview?: boolean;
}

export interface SecurityAlert {
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  userId?: string;
  securityEventId?: string;
  thresholdValue?: number;
  currentValue?: number;
  timeWindowMinutes?: number;
}

export class SecurityMonitoringService {
  private supabase: any = null;

  constructor() {
    // Don't initialize at constructor time - lazy load when needed
  }

  private getSupabase() {
    if (!this.supabase) {
      this.supabase = createServerSupabaseClient();
    }
    return this.supabase;
  }

  /**
   * Log a security event
   */
  async logSecurityEvent(event: SecurityEvent): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.rpc('log_security_event', {
        p_event_type: event.eventType,
        p_severity: event.severity,
        p_user_id: event.userId || null,
        p_ip_address: event.ipAddress || null,
        p_user_agent: event.userAgent || null,
        p_endpoint: event.endpoint || null,
        p_method: event.method || null,
        p_event_data: event.eventData || {},
        p_additional_context: event.additionalContext || {},
        p_session_id: event.sessionId || null,
        p_request_id: event.requestId || null
      });

      if (error) {
        console.error('[SecurityMonitoring] Failed to log security event:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[SecurityMonitoring] Error logging security event:', error);
      return null;
    }
  }

  /**
   * Log an audit trail entry
   */
  async logAuditTrail(entry: AuditTrailEntry): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.rpc('log_audit_trail', {
        p_table_name: entry.tableName,
        p_operation: entry.operation,
        p_record_id: entry.recordId || null,
        p_user_id: entry.userId || null,
        p_old_values: entry.oldValues || null,
        p_new_values: entry.newValues || null,
        p_endpoint: entry.endpoint || null,
        p_request_id: entry.requestId || null,
        p_reason: entry.reason || null
      });

      if (error) {
        console.error('[SecurityMonitoring] Failed to log audit trail:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[SecurityMonitoring] Error logging audit trail:', error);
      return null;
    }
  }

  /**
   * Log rate limit violation
   */
  async logRateLimitViolation(violation: RateLimitViolation): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('rate_limit_violations')
        .insert({
          user_id: violation.userId || null,
          ip_address: violation.ipAddress,
          endpoint: violation.endpoint,
          limit_type: violation.limitType,
          current_count: violation.currentCount,
          limit_threshold: violation.limitThreshold,
          window_duration_seconds: violation.windowDurationSeconds,
          user_agent: violation.userAgent || null,
          session_id: violation.sessionId || null,
          request_id: violation.requestId || null,
          request_data: violation.requestData || {}
        });

      if (error) {
        console.error('[SecurityMonitoring] Failed to log rate limit violation:', error);
      }

      // Also log as security event
      await this.logSecurityEvent({
        eventType: 'rate_limit_exceeded',
        severity: 'medium',
        userId: violation.userId,
        ipAddress: violation.ipAddress,
        endpoint: violation.endpoint,
        requestId: violation.requestId,
        eventData: {
          limitType: violation.limitType,
          currentCount: violation.currentCount,
          limitThreshold: violation.limitThreshold
        }
      });
    } catch (error) {
      console.error('[SecurityMonitoring] Error logging rate limit violation:', error);
    }
  }

  /**
   * Log authentication event
   */
  async logAuthenticationEvent(event: AuthenticationEvent): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('authentication_events')
        .insert({
          event_type: event.eventType,
          user_id: event.userId || null,
          email: event.email || null,
          ip_address: event.ipAddress || null,
          user_agent: event.userAgent || null,
          session_id: event.sessionId || null,
          request_id: event.requestId || null,
          success: event.success,
          failure_reason: event.failureReason || null,
          event_data: event.eventData || {},
          suspicious: event.suspicious || false,
          requires_review: event.requiresReview || false
        });

      if (error) {
        console.error('[SecurityMonitoring] Failed to log authentication event:', error);
      }

      // Log as security event if failed or suspicious
      if (!event.success || event.suspicious) {
        await this.logSecurityEvent({
          eventType: event.success ? 'suspicious_authentication' : 'authentication_failure',
          severity: event.suspicious ? 'high' : 'medium',
          userId: event.userId,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          requestId: event.requestId,
          eventData: {
            eventType: event.eventType,
            success: event.success,
            failureReason: event.failureReason,
            suspicious: event.suspicious
          }
        });
      }
    } catch (error) {
      console.error('[SecurityMonitoring] Error logging authentication event:', error);
    }
  }

  /**
   * Create security alert
   */
  async createSecurityAlert(alert: SecurityAlert): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('security_alerts')
        .insert({
          alert_type: alert.alertType,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          user_id: alert.userId || null,
          security_event_id: alert.securityEventId || null,
          threshold_value: alert.thresholdValue || null,
          current_value: alert.currentValue || null,
          time_window_minutes: alert.timeWindowMinutes || null
        });

      if (error) {
        console.error('[SecurityMonitoring] Failed to create security alert:', error);
      }

      // Send notifications for high/critical alerts
      if (alert.severity === 'high' || alert.severity === 'critical') {
        await this.sendAlertNotification(alert);
      }
    } catch (error) {
      console.error('[SecurityMonitoring] Error creating security alert:', error);
    }
  }

  /**
   * Get recent security events
   */
  async getRecentSecurityEvents(limit: number = 100): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[SecurityMonitoring] Failed to get security events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[SecurityMonitoring] Error getting security events:', error);
      return [];
    }
  }

  /**
   * Get active security alerts
   */
  async getActiveSecurityAlerts(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('security_alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[SecurityMonitoring] Failed to get security alerts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[SecurityMonitoring] Error getting security alerts:', error);
      return [];
    }
  }

  /**
   * Get security metrics for dashboard
   */
  async getSecurityMetrics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<any> {
    try {
      const intervals = {
        '1h': '1 hour',
        '24h': '24 hours',
        '7d': '7 days',
        '30d': '30 days'
      };

      const interval = intervals[timeRange];

      // Get various metrics in parallel
      const [
        securityEvents,
        authEvents,
        rateLimitViolations,
        activeAlerts
      ] = await Promise.all([
        this.supabase
          .from('security_events')
          .select('event_type, severity, created_at')
          .gte('created_at', new Date(Date.now() - this.getTimeRangeMs(timeRange)).toISOString()),

        this.supabase
          .from('authentication_events')
          .select('event_type, success, created_at')
          .gte('created_at', new Date(Date.now() - this.getTimeRangeMs(timeRange)).toISOString()),

        this.supabase
          .from('rate_limit_violations')
          .select('limit_type, created_at')
          .gte('created_at', new Date(Date.now() - this.getTimeRangeMs(timeRange)).toISOString()),

        this.supabase
          .from('security_alerts')
          .select('severity, status')
          .eq('status', 'active')
      ]);

      return {
        timeRange,
        securityEvents: {
          total: securityEvents.data?.length || 0,
          bySeverity: this.groupBy(securityEvents.data || [], 'severity'),
          byType: this.groupBy(securityEvents.data || [], 'event_type')
        },
        authenticationEvents: {
          total: authEvents.data?.length || 0,
          successful: authEvents.data?.filter((e: any) => e.success).length || 0,
          failed: authEvents.data?.filter((e: any) => !e.success).length || 0,
          byType: this.groupBy(authEvents.data || [], 'event_type')
        },
        rateLimitViolations: {
          total: rateLimitViolations.data?.length || 0,
          byType: this.groupBy(rateLimitViolations.data || [], 'limit_type')
        },
        activeAlerts: {
          total: activeAlerts.data?.length || 0,
          bySeverity: this.groupBy(activeAlerts.data || [], 'severity')
        }
      };
    } catch (error) {
      console.error('[SecurityMonitoring] Error getting security metrics:', error);
      return null;
    }
  }

  /**
   * Detect anomalies in user behavior
   */
  async detectUserAnomalies(userId: string): Promise<any[]> {
    try {
      const anomalies = [];
      const now = new Date();
      const oneHour = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDay = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Check for unusual login patterns
      const { data: recentLogins } = await this.supabase
        .from('authentication_events')
        .select('ip_address, user_agent, created_at')
        .eq('user_id', userId)
        .eq('event_type', 'login_success')
        .gte('created_at', oneDay.toISOString());

      if (recentLogins && recentLogins.length > 0) {
        // Check for multiple IP addresses
        const uniqueIPs = new Set(recentLogins.map((l: any) => l.ip_address));
        if (uniqueIPs.size > 3) {
          anomalies.push({
            type: 'multiple_ip_addresses',
            severity: 'medium',
            description: `User logged in from ${uniqueIPs.size} different IP addresses in 24h`,
            details: { ipCount: uniqueIPs.size, ips: Array.from(uniqueIPs) }
          });
        }

        // Check for unusual time patterns
        const hourCounts = new Array(24).fill(0);
        recentLogins.forEach((login: any) => {
          const hour = new Date(login.created_at).getHours();
          hourCounts[hour]++;
        });

        const maxHourCount = Math.max(...hourCounts);
        if (maxHourCount > 5) {
          anomalies.push({
            type: 'unusual_time_pattern',
            severity: 'low',
            description: `Concentrated login activity during specific hours`,
            details: { maxHourlyLogins: maxHourCount }
          });
        }
      }

      return anomalies;
    } catch (error) {
      console.error('[SecurityMonitoring] Error detecting user anomalies:', error);
      return [];
    }
  }

  /**
   * Send alert notification (placeholder for integration with notification service)
   */
  private async sendAlertNotification(alert: SecurityAlert): Promise<void> {
    try {
      // In production, integrate with notification services like:
      // - Email service (SendGrid, AWS SES)
      // - Slack/Discord webhooks
      // - SMS service (Twilio)
      // - Push notifications
      // - Incident management (PagerDuty, Opsgenie)

      console.log(`🚨 SECURITY ALERT [${alert.severity.toUpperCase()}]: ${alert.title}`);
      console.log(`Description: ${alert.description}`);
      
      if (alert.userId) {
        console.log(`User ID: ${alert.userId}`);
      }

      // Log the notification attempt
      await this.logSecurityEvent({
        eventType: 'alert_notification_sent',
        severity: 'low',
        eventData: {
          alertType: alert.alertType,
          alertSeverity: alert.severity,
          title: alert.title
        }
      });
    } catch (error) {
      console.error('[SecurityMonitoring] Error sending alert notification:', error);
    }
  }

  /**
   * Helper method to group array by property
   */
  private groupBy(array: any[], property: string): Record<string, number> {
    return array.reduce((acc, item) => {
      const key = item[property] || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Helper method to convert time range to milliseconds
   */
  private getTimeRangeMs(timeRange: '1h' | '24h' | '7d' | '30d'): number {
    const ranges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    return ranges[timeRange];
  }
}

// Lazy-loaded singleton to avoid calling cookies() at module level
let _securityMonitoringService: SecurityMonitoringService | null = null;

export function getSecurityMonitoringService(): SecurityMonitoringService {
  if (!_securityMonitoringService) {
    _securityMonitoringService = new SecurityMonitoringService();
  }
  return _securityMonitoringService;
}

// For backward compatibility - use proxy to avoid type issues
export const securityMonitoringService = new Proxy({} as SecurityMonitoringService, {
  get(target, prop) {
    return (...args: any[]) => {
      const service = getSecurityMonitoringService();
      return (service as any)[prop](...args);
    };
  }
});