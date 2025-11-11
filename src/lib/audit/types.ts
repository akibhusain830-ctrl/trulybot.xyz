// Audit trail types and interfaces
// Provides comprehensive system activity tracking for enterprise compliance

export type EventType = 
  | 'user_action'
  | 'data_change' 
  | 'security_event'
  | 'admin_action'
  | 'system_event'
  | 'api_call'
  | 'file_access'
  | 'configuration_change'
  | 'authentication'
  | 'authorization'
  | 'compliance_event';

export type EventCategory = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'access_granted'
  | 'access_denied'
  | 'configuration'
  | 'export'
  | 'import'
  | 'backup'
  | 'restore'
  | 'migration'
  | 'integration';

export type ResourceType = 
  | 'user'
  | 'workspace'
  | 'bot'
  | 'knowledge_base'
  | 'document'
  | 'chat_session'
  | 'billing'
  | 'subscription'
  | 'api_key'
  | 'webhook'
  | 'integration'
  | 'settings'
  | 'role'
  | 'permission'
  | 'policy'
  | 'backup';

export type BusinessImpact = 'low' | 'medium' | 'high' | 'critical';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ComplianceCategory = 'gdpr' | 'hipaa' | 'sox' | 'pci' | 'iso27001' | 'general';
export type SecurityClassification = 'public' | 'internal' | 'confidential' | 'restricted';
export type ActorType = 'user' | 'admin' | 'system' | 'api' | 'service' | 'anonymous';
export type EventSource = 'web_app' | 'api' | 'mobile_app' | 'system' | 'cli' | 'webhook';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface AuditTrail {
  id?: string;
  
  // Audit Identity
  workspace_id: string;
  user_id?: string;
  session_id?: string;
  
  // Event Classification
  event_type: EventType;
  event_category: EventCategory;
  event_action: string;
  
  // Resource Information
  resource_type?: ResourceType;
  resource_id?: string;
  resource_name?: string;
  
  // Change Tracking
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  changes_summary?: string;
  
  // Request Context
  ip_address?: string;
  user_agent?: string;
  request_id?: string;
  api_endpoint?: string;
  http_method?: HttpMethod;
  request_headers?: Record<string, any>;
  request_body?: Record<string, any>;
  response_status?: number;
  
  // Business Context
  business_impact?: BusinessImpact;
  compliance_category?: ComplianceCategory;
  risk_level?: RiskLevel;
  
  // Security Context
  threat_indicator?: boolean;
  anomaly_detected?: boolean;
  requires_review?: boolean;
  security_classification?: SecurityClassification;
  
  // Actor Information
  actor_type?: ActorType;
  actor_role?: string;
  actor_permissions?: Record<string, any>;
  impersonated_by?: string;
  
  // Audit Metadata
  event_source?: EventSource;
  event_version?: string;
  correlation_id?: string;
  parent_event_id?: string;
  
  // Geographic & Temporal
  timezone?: string;
  country_code?: string;
  region?: string;
  event_duration_ms?: number;
  
  // Success & Error Tracking
  success?: boolean;
  error_code?: string;
  error_message?: string;
  error_details?: Record<string, any>;
  
  // Compliance & Retention
  retention_period?: string;
  archived?: boolean;
  archived_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  
  // Additional Context
  tags?: string[];
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface AuditAnalytics {
  total_events: number;
  user_actions: number;
  admin_actions: number;
  security_events: number;
  failed_events: number;
  unique_users: number;
  top_event_types: Array<{
    event_type: string;
    count: number;
  }>;
  hourly_activity: Array<{
    hour: number;
    count: number;
  }>;
  risk_distribution: Array<{
    risk_level: string;
    count: number;
  }>;
}

export interface SecurityAlert {
  id: string;
  workspace_id: string;
  user_id?: string;
  event_type: EventType;
  event_action: string;
  risk_level: RiskLevel;
  threat_indicator: boolean;
  anomaly_detected: boolean;
  ip_address?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface ComplianceReport {
  workspace_id: string;
  report_period: {
    start: string;
    end: string;
  };
  compliance_category: ComplianceCategory;
  total_events: number;
  events_by_type: Record<string, number>;
  user_activity_summary: Array<{
    user_id: string;
    total_actions: number;
    high_risk_actions: number;
    last_activity: string;
  }>;
  security_incidents: SecurityAlert[];
  data_access_log: Array<{
    resource_type: string;
    access_count: number;
    unique_users: number;
  }>;
}

// Audit event builder for creating audit logs
export class AuditEventBuilder {
  private event: Partial<AuditTrail>;

  constructor(workspaceId: string, eventType: EventType, eventCategory: EventCategory, eventAction: string) {
    this.event = {
      workspace_id: workspaceId,
      event_type: eventType,
      event_category: eventCategory,
      event_action: eventAction,
      business_impact: 'low',
      risk_level: 'low',
      security_classification: 'internal',
      actor_type: 'user',
      event_source: 'web_app',
      event_version: '1.0',
      success: true,
      threat_indicator: false,
      anomaly_detected: false,
      requires_review: false
    };
  }

  setUser(userId: string, sessionId?: string): AuditEventBuilder {
    this.event.user_id = userId;
    this.event.session_id = sessionId;
    return this;
  }

  setResource(type: ResourceType, id?: string, name?: string): AuditEventBuilder {
    this.event.resource_type = type;
    this.event.resource_id = id;
    this.event.resource_name = name;
    return this;
  }

  setChanges(oldValues?: Record<string, any>, newValues?: Record<string, any>, summary?: string): AuditEventBuilder {
    this.event.old_values = oldValues;
    this.event.new_values = newValues;
    this.event.changes_summary = summary;
    return this;
  }

  setRequestContext(context: {
    ip_address?: string;
    user_agent?: string;
    request_id?: string;
    api_endpoint?: string;
    http_method?: HttpMethod;
    response_status?: number;
  }): AuditEventBuilder {
    Object.assign(this.event, context);
    return this;
  }

  setBusinessContext(
    impact: BusinessImpact,
    compliance?: ComplianceCategory,
    classification?: SecurityClassification
  ): AuditEventBuilder {
    this.event.business_impact = impact;
    this.event.compliance_category = compliance;
    this.event.security_classification = classification;
    return this;
  }

  setSecurityContext(
    riskLevel: RiskLevel,
    threatIndicator: boolean = false,
    anomalyDetected: boolean = false,
    requiresReview: boolean = false
  ): AuditEventBuilder {
    this.event.risk_level = riskLevel;
    this.event.threat_indicator = threatIndicator;
    this.event.anomaly_detected = anomalyDetected;
    this.event.requires_review = requiresReview;
    return this;
  }

  setActor(type: ActorType, role?: string, permissions?: Record<string, any>): AuditEventBuilder {
    this.event.actor_type = type;
    this.event.actor_role = role;
    this.event.actor_permissions = permissions;
    return this;
  }

  setError(errorCode: string, errorMessage: string, errorDetails?: Record<string, any>): AuditEventBuilder {
    this.event.success = false;
    this.event.error_code = errorCode;
    this.event.error_message = errorMessage;
    this.event.error_details = errorDetails;
    return this;
  }

  setMetadata(metadata: Record<string, any>): AuditEventBuilder {
    this.event.metadata = { ...this.event.metadata, ...metadata };
    return this;
  }

  setTags(tags: string[]): AuditEventBuilder {
    this.event.tags = tags;
    return this;
  }

  setCorrelation(correlationId: string, parentEventId?: string): AuditEventBuilder {
    this.event.correlation_id = correlationId;
    this.event.parent_event_id = parentEventId;
    return this;
  }

  setDuration(durationMs: number): AuditEventBuilder {
    this.event.event_duration_ms = durationMs;
    return this;
  }

  setGeographic(timezone?: string, countryCode?: string, region?: string): AuditEventBuilder {
    this.event.timezone = timezone;
    this.event.country_code = countryCode;
    this.event.region = region;
    return this;
  }

  build(): AuditTrail {
    return {
      ...this.event,
      created_at: new Date().toISOString()
    } as AuditTrail;
  }
}

// Security analyzer for detecting threats and anomalies
export class SecurityAnalyzer {
  private static SUSPICIOUS_PATTERNS = {
    MULTIPLE_FAILED_LOGINS: 5,
    RAPID_API_CALLS: 100, // calls per minute
    UNUSUAL_HOURS: [0, 1, 2, 3, 4, 5], // 12 AM - 5 AM
    HIGH_RISK_ACTIONS: ['delete', 'export', 'configuration'],
    ADMIN_ACTIONS: ['admin_action', 'configuration_change']
  };

  static analyzeThreatLevel(event: AuditTrail, recentEvents: AuditTrail[] = []): RiskLevel {
    let score = 0;

    // Check for high-risk actions
    if (this.SUSPICIOUS_PATTERNS.HIGH_RISK_ACTIONS.includes(event.event_category)) {
      score += 2;
    }

    // Check for admin actions
    if (this.SUSPICIOUS_PATTERNS.ADMIN_ACTIONS.includes(event.event_type)) {
      score += 1;
    }

    // Check for failed operations
    if (event.success === false) {
      score += 1;
    }

    // Check for unusual hours
    if (event.created_at) {
      const hour = new Date(event.created_at).getHours();
      if (this.SUSPICIOUS_PATTERNS.UNUSUAL_HOURS.includes(hour)) {
        score += 1;
      }
    }

    // Check for rapid consecutive actions
    if (recentEvents.length > this.SUSPICIOUS_PATTERNS.RAPID_API_CALLS) {
      score += 2;
    }

    // Convert score to risk level
    if (score >= 4) return 'critical';
    if (score >= 3) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  }

  static detectAnomalies(event: AuditTrail, userHistory: AuditTrail[] = []): boolean {
    // Check for unusual IP address
    if (event.ip_address && userHistory.length > 0) {
      const userIps = userHistory.map(e => e.ip_address).filter(Boolean);
      const uniqueIps = new Set(userIps);
      if (!uniqueIps.has(event.ip_address) && uniqueIps.size > 0) {
        return true;
      }
    }

    // Check for unusual user agent
    if (event.user_agent && userHistory.length > 0) {
      const userAgents = userHistory.map(e => e.user_agent).filter(Boolean);
      if (!userAgents.includes(event.user_agent)) {
        return true;
      }
    }

    // Check for unusual activity pattern
    if (userHistory.length > 10) {
      const commonActions = userHistory
        .map(e => e.event_action)
        .reduce((acc, action) => {
          acc[action] = (acc[action] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      const actionCount = commonActions[event.event_action] || 0;
      const avgActionCount = Object.values(commonActions).reduce((a, b) => a + b, 0) / Object.keys(commonActions).length;
      
      // If this action is very rare for this user
      if (actionCount < avgActionCount * 0.1) {
        return true;
      }
    }

    return false;
  }

  static requiresReview(event: AuditTrail): boolean {
    return (
      event.threat_indicator === true ||
      event.anomaly_detected === true ||
      event.risk_level === 'critical' ||
      event.risk_level === 'high' ||
      event.compliance_category === 'sox' ||
      event.compliance_category === 'hipaa' ||
      (event.actor_type === 'admin' && event.event_type === 'admin_action')
    );
  }
}