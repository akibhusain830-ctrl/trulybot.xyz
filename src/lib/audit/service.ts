// Audit trail service for enterprise compliance and security monitoring
// Provides comprehensive system activity tracking and threat detection

import { createClient } from '@supabase/supabase-js';
import { 
  AuditTrail, 
  AuditAnalytics, 
  SecurityAlert, 
  ComplianceReport,
  EventType,
  EventCategory,
  AuditEventBuilder,
  SecurityAnalyzer
} from './types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class AuditTrailService {
  /**
   * Log an audit event
   */
  static async logEvent(event: AuditTrail): Promise<string | null> {
    try {
      // Enhance event with security analysis
      const recentEvents = await this.getRecentUserEvents(event.user_id || '', event.workspace_id, 100);
      const userHistory = await this.getUserHistory(event.user_id || '', event.workspace_id, 50);
      
      // Analyze threat level and anomalies
      event.risk_level = SecurityAnalyzer.analyzeThreatLevel(event, recentEvents);
      event.anomaly_detected = SecurityAnalyzer.detectAnomalies(event, userHistory);
      event.requires_review = SecurityAnalyzer.requiresReview(event);

      // Insert the audit event
      const { data, error } = await supabase
        .from('audit_trail')
        .insert([event])
        .select('id')
        .single();

      if (error) {
        console.error('Error logging audit event:', error);
        return null;
      }

      // If it's a security threat, trigger alert
      if (event.threat_indicator || event.risk_level === 'critical') {
        await this.triggerSecurityAlert(event);
      }

      return data.id;
    } catch (error) {
      console.error('Audit logging failed:', error);
      return null;
    }
  }

  /**
   * Log an audit event using the builder pattern
   */
  static async logEventWithBuilder(builder: AuditEventBuilder): Promise<string | null> {
    return this.logEvent(builder.build());
  }

  /**
   * Quick log function for common events
   */
  static async logUserAction(
    workspaceId: string,
    userId: string,
    action: string,
    resourceType?: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ): Promise<string | null> {
    const builder = new AuditEventBuilder(workspaceId, 'user_action', 'read', action)
      .setUser(userId)
      .setMetadata(metadata || {});

    if (resourceType && resourceId) {
      builder.setResource(resourceType as any, resourceId);
    }

    return this.logEventWithBuilder(builder);
  }

  /**
   * Get audit trail for workspace
   */
  static async getWorkspaceAuditTrail(
    workspaceId: string,
    limit: number = 100,
    offset: number = 0,
    filters?: {
      event_type?: EventType;
      event_category?: EventCategory;
      user_id?: string;
      resource_type?: string;
      risk_level?: string;
      date_from?: string;
      date_to?: string;
    }
  ): Promise<AuditTrail[]> {
    try {
      let query = supabase
        .from('audit_trail')
        .select('*')
        .eq('workspace_id', workspaceId);

      // Apply filters
      if (filters) {
        if (filters.event_type) query = query.eq('event_type', filters.event_type);
        if (filters.event_category) query = query.eq('event_category', filters.event_category);
        if (filters.user_id) query = query.eq('user_id', filters.user_id);
        if (filters.resource_type) query = query.eq('resource_type', filters.resource_type);
        if (filters.risk_level) query = query.eq('risk_level', filters.risk_level);
        if (filters.date_from) query = query.gte('created_at', filters.date_from);
        if (filters.date_to) query = query.lte('created_at', filters.date_to);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching audit trail:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Audit trail fetch failed:', error);
      return [];
    }
  }

  /**
   * Get audit analytics
   */
  static async getAuditAnalytics(
    workspaceId: string,
    startDate?: string,
    endDate?: string
  ): Promise<AuditAnalytics | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_audit_analytics', {
          p_workspace_id: workspaceId,
          p_start_date: startDate,
          p_end_date: endDate
        });

      if (error) {
        console.error('Error getting audit analytics:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Audit analytics failed:', error);
      return null;
    }
  }

  /**
   * Get security alerts
   */
  static async getSecurityAlerts(
    workspaceId?: string,
    hours: number = 24
  ): Promise<SecurityAlert[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_security_alerts', {
          p_workspace_id: workspaceId,
          p_hours: hours
        });

      if (error) {
        console.error('Error getting security alerts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Security alerts fetch failed:', error);
      return [];
    }
  }

  /**
   * Mark events as reviewed
   */
  static async markEventsReviewed(
    eventIds: string[],
    reviewerId: string,
    notes?: string
  ): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('mark_audit_reviewed', {
          p_event_ids: eventIds,
          p_reviewer_id: reviewerId,
          p_notes: notes
        });

      if (error) {
        console.error('Error marking events reviewed:', error);
        return 0;
      }

      return data;
    } catch (error) {
      console.error('Mark reviewed failed:', error);
      return 0;
    }
  }

  /**
   * Get compliance report
   */
  static async getComplianceReport(
    workspaceId: string,
    startDate: string,
    endDate: string,
    complianceCategory?: string
  ): Promise<ComplianceReport | null> {
    try {
      // Get basic audit data
      const auditData = await this.getWorkspaceAuditTrail(workspaceId, 10000, 0, {
        date_from: startDate,
        date_to: endDate
      });

      if (!auditData.length) {
        return null;
      }

      // Filter by compliance category if specified
      const filteredData = complianceCategory 
        ? auditData.filter(event => event.compliance_category === complianceCategory)
        : auditData;

      // Calculate events by type
      const eventsByType = filteredData.reduce((acc, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate user activity summary
      const userActivity = filteredData
        .filter(event => event.user_id)
        .reduce((acc, event) => {
          const userId = event.user_id!;
          if (!acc[userId]) {
            acc[userId] = {
              user_id: userId,
              total_actions: 0,
              high_risk_actions: 0,
              last_activity: event.created_at || ''
            };
          }
          acc[userId].total_actions++;
          if (event.risk_level === 'high' || event.risk_level === 'critical') {
            acc[userId].high_risk_actions++;
          }
          if (event.created_at && event.created_at > acc[userId].last_activity) {
            acc[userId].last_activity = event.created_at;
          }
          return acc;
        }, {} as Record<string, any>);

      // Get security incidents
      const securityIncidents = await this.getSecurityAlerts(workspaceId, 
        Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60))
      );

      // Calculate data access log
      const dataAccessLog = filteredData
        .filter(event => event.resource_type && event.event_category === 'read')
        .reduce((acc, event) => {
          const resourceType = event.resource_type!;
          if (!acc[resourceType]) {
            acc[resourceType] = {
              resource_type: resourceType,
              access_count: 0,
              unique_users: new Set()
            };
          }
          acc[resourceType].access_count++;
          if (event.user_id) {
            acc[resourceType].unique_users.add(event.user_id);
          }
          return acc;
        }, {} as Record<string, any>);

      // Convert to final format
      const dataAccessArray = Object.values(dataAccessLog).map((item: any) => ({
        resource_type: item.resource_type,
        access_count: item.access_count,
        unique_users: item.unique_users.size
      }));

      return {
        workspace_id: workspaceId,
        report_period: {
          start: startDate,
          end: endDate
        },
        compliance_category: complianceCategory as any || 'general',
        total_events: filteredData.length,
        events_by_type: eventsByType,
        user_activity_summary: Object.values(userActivity),
        security_incidents: securityIncidents.filter(alert => 
          alert.created_at >= startDate && alert.created_at <= endDate
        ),
        data_access_log: dataAccessArray
      };
    } catch (error) {
      console.error('Compliance report generation failed:', error);
      return null;
    }
  }

  /**
   * Search audit events
   */
  static async searchAuditEvents(
    workspaceId: string,
    searchTerm: string,
    filters?: {
      event_type?: EventType;
      risk_level?: string;
      user_id?: string;
      limit?: number;
    }
  ): Promise<AuditTrail[]> {
    try {
      let query = supabase
        .from('audit_trail')
        .select('*')
        .eq('workspace_id', workspaceId);

      // Text search in multiple fields
      query = query.or(`event_action.ilike.%${searchTerm}%,resource_name.ilike.%${searchTerm}%,changes_summary.ilike.%${searchTerm}%`);

      if (filters) {
        if (filters.event_type) query = query.eq('event_type', filters.event_type);
        if (filters.risk_level) query = query.eq('risk_level', filters.risk_level);
        if (filters.user_id) query = query.eq('user_id', filters.user_id);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(filters?.limit || 100);

      if (error) {
        console.error('Error searching audit events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Audit search failed:', error);
      return [];
    }
  }

  /**
   * Get events requiring review
   */
  static async getEventsRequiringReview(workspaceId: string): Promise<AuditTrail[]> {
    try {
      const { data, error } = await supabase
        .from('audit_trail')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('requires_review', true)
        .is('reviewed_at', null)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error getting events requiring review:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Review queue fetch failed:', error);
      return [];
    }
  }

  /**
   * Get recent user events for analysis
   */
  private static async getRecentUserEvents(
    userId: string,
    workspaceId: string,
    limit: number = 100
  ): Promise<AuditTrail[]> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('audit_trail')
        .select('*')
        .eq('user_id', userId)
        .eq('workspace_id', workspaceId)
        .gte('created_at', oneHourAgo)
        .order('created_at', { ascending: false })
        .limit(limit);

      return data || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get user history for anomaly detection
   */
  private static async getUserHistory(
    userId: string,
    workspaceId: string,
    limit: number = 50
  ): Promise<AuditTrail[]> {
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('audit_trail')
        .select('*')
        .eq('user_id', userId)
        .eq('workspace_id', workspaceId)
        .gte('created_at', oneWeekAgo)
        .order('created_at', { ascending: false })
        .limit(limit);

      return data || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Trigger security alert (placeholder for integration with alerting system)
   */
  private static async triggerSecurityAlert(event: AuditTrail): Promise<void> {
    try {
      // In a real implementation, this would:
      // 1. Send notifications to security team
      // 2. Log to SIEM system
      // 3. Trigger automated responses
      // 4. Create tickets in security incident management system
      
      console.warn('SECURITY ALERT:', {
        workspace_id: event.workspace_id,
        user_id: event.user_id,
        event_type: event.event_type,
        risk_level: event.risk_level,
        threat_indicator: event.threat_indicator,
        ip_address: event.ip_address,
        created_at: event.created_at
      });
    } catch (error) {
      console.error('Security alert failed:', error);
    }
  }
}

export { AuditEventBuilder, SecurityAnalyzer };