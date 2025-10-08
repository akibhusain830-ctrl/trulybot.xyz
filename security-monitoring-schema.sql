-- Comprehensive Security Monitoring Database Schema
-- This creates tables for security event logging, audit trails, and monitoring

-- ================================================================
-- 1. SECURITY EVENTS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium',
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    endpoint TEXT,
    method TEXT,
    request_id TEXT,
    
    -- Event details
    event_data JSONB NOT NULL DEFAULT '{}',
    additional_context JSONB DEFAULT '{}',
    
    -- Timing and resolution
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'open',
    notes TEXT,
    
    -- Constraints
    CONSTRAINT security_events_severity_check CHECK (
        severity IN ('low', 'medium', 'high', 'critical')
    ),
    CONSTRAINT security_events_status_check CHECK (
        status IN ('open', 'investigating', 'resolved', 'false_positive')
    )
);

-- Security events indexes
CREATE INDEX IF NOT EXISTS security_events_event_type_idx ON security_events(event_type);
CREATE INDEX IF NOT EXISTS security_events_severity_idx ON security_events(severity);
CREATE INDEX IF NOT EXISTS security_events_user_id_idx ON security_events(user_id);
CREATE INDEX IF NOT EXISTS security_events_created_at_idx ON security_events(created_at);
CREATE INDEX IF NOT EXISTS security_events_ip_address_idx ON security_events(ip_address);
CREATE INDEX IF NOT EXISTS security_events_status_idx ON security_events(status);
CREATE INDEX IF NOT EXISTS security_events_event_data_idx ON security_events USING GIN(event_data);

-- ================================================================
-- 2. AUDIT TRAIL TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    record_id UUID,
    
    -- User and session info
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    
    -- Change tracking
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    
    -- Context
    endpoint TEXT,
    request_id TEXT,
    reason TEXT,
    
    -- Timing
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT audit_trail_operation_check CHECK (
        operation IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT_SENSITIVE')
    )
);

-- Audit trail indexes
CREATE INDEX IF NOT EXISTS audit_trail_table_name_idx ON audit_trail(table_name);
CREATE INDEX IF NOT EXISTS audit_trail_operation_idx ON audit_trail(operation);
CREATE INDEX IF NOT EXISTS audit_trail_user_id_idx ON audit_trail(user_id);
CREATE INDEX IF NOT EXISTS audit_trail_record_id_idx ON audit_trail(record_id);
CREATE INDEX IF NOT EXISTS audit_trail_created_at_idx ON audit_trail(created_at);
CREATE INDEX IF NOT EXISTS audit_trail_old_values_idx ON audit_trail USING GIN(old_values);
CREATE INDEX IF NOT EXISTS audit_trail_new_values_idx ON audit_trail USING GIN(new_values);

-- ================================================================
-- 3. RATE LIMIT VIOLATIONS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS rate_limit_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ip_address INET NOT NULL,
    endpoint TEXT NOT NULL,
    
    -- Rate limit details
    limit_type TEXT NOT NULL,
    current_count INTEGER NOT NULL,
    limit_threshold INTEGER NOT NULL,
    window_duration_seconds INTEGER NOT NULL,
    
    -- Request context
    user_agent TEXT,
    session_id TEXT,
    request_id TEXT,
    
    -- Additional data
    request_data JSONB DEFAULT '{}',
    
    -- Timing
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT rate_limit_violations_limit_type_check CHECK (
        limit_type IN ('per_user', 'per_ip', 'per_endpoint', 'burst', 'concurrent')
    )
);

-- Rate limit violations indexes
CREATE INDEX IF NOT EXISTS rate_limit_violations_user_id_idx ON rate_limit_violations(user_id);
CREATE INDEX IF NOT EXISTS rate_limit_violations_ip_address_idx ON rate_limit_violations(ip_address);
CREATE INDEX IF NOT EXISTS rate_limit_violations_endpoint_idx ON rate_limit_violations(endpoint);
CREATE INDEX IF NOT EXISTS rate_limit_violations_limit_type_idx ON rate_limit_violations(limit_type);
CREATE INDEX IF NOT EXISTS rate_limit_violations_created_at_idx ON rate_limit_violations(created_at);

-- ================================================================
-- 4. AUTHENTICATION EVENTS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS authentication_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    email TEXT,
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    request_id TEXT,
    
    -- Event details
    success BOOLEAN NOT NULL,
    failure_reason TEXT,
    event_data JSONB DEFAULT '{}',
    
    -- Security flags
    suspicious BOOLEAN DEFAULT FALSE,
    requires_review BOOLEAN DEFAULT FALSE,
    
    -- Timing
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT authentication_events_event_type_check CHECK (
        event_type IN (
            'login_attempt', 'login_success', 'login_failure',
            'logout', 'session_refresh', 'password_reset',
            'account_lockout', 'suspicious_login'
        )
    )
);

-- Authentication events indexes
CREATE INDEX IF NOT EXISTS authentication_events_event_type_idx ON authentication_events(event_type);
CREATE INDEX IF NOT EXISTS authentication_events_user_id_idx ON authentication_events(user_id);
CREATE INDEX IF NOT EXISTS authentication_events_email_idx ON authentication_events(email);
CREATE INDEX IF NOT EXISTS authentication_events_ip_address_idx ON authentication_events(ip_address);
CREATE INDEX IF NOT EXISTS authentication_events_success_idx ON authentication_events(success);
CREATE INDEX IF NOT EXISTS authentication_events_suspicious_idx ON authentication_events(suspicious);
CREATE INDEX IF NOT EXISTS authentication_events_created_at_idx ON authentication_events(created_at);

-- ================================================================
-- 5. SECURITY ALERTS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS security_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Related data
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    security_event_id UUID REFERENCES security_events(id) ON DELETE CASCADE,
    
    -- Alert configuration
    threshold_value DECIMAL,
    current_value DECIMAL,
    time_window_minutes INTEGER,
    
    -- Status and resolution
    status TEXT NOT NULL DEFAULT 'active',
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    
    -- Notification tracking
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_channels TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Timing
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT security_alerts_alert_type_check CHECK (
        alert_type IN (
            'rate_limit_exceeded', 'suspicious_login_pattern', 
            'multiple_failed_logins', 'unusual_activity',
            'potential_bot_behavior', 'data_breach_indicator',
            'privilege_escalation', 'unauthorized_access'
        )
    ),
    CONSTRAINT security_alerts_severity_check CHECK (
        severity IN ('low', 'medium', 'high', 'critical')
    ),
    CONSTRAINT security_alerts_status_check CHECK (
        status IN ('active', 'acknowledged', 'resolved', 'suppressed')
    )
);

-- Security alerts indexes
CREATE INDEX IF NOT EXISTS security_alerts_alert_type_idx ON security_alerts(alert_type);
CREATE INDEX IF NOT EXISTS security_alerts_severity_idx ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS security_alerts_status_idx ON security_alerts(status);
CREATE INDEX IF NOT EXISTS security_alerts_user_id_idx ON security_alerts(user_id);
CREATE INDEX IF NOT EXISTS security_alerts_created_at_idx ON security_alerts(created_at);

-- ================================================================
-- 6. ROW LEVEL SECURITY POLICIES
-- ================================================================

-- Enable RLS on all security tables
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE authentication_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;

-- Only admins can view security data
CREATE POLICY "Admins can view security events" ON security_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'owner')
        )
    );

CREATE POLICY "Admins can view audit trail" ON audit_trail
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'owner')
        )
    );

CREATE POLICY "Admins can view rate limit violations" ON rate_limit_violations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'owner')
        )
    );

CREATE POLICY "Admins can view authentication events" ON authentication_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'owner')
        )
    );

CREATE POLICY "Admins can view security alerts" ON security_alerts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'owner')
        )
    );

-- ================================================================
-- 7. SECURITY MONITORING FUNCTIONS
-- ================================================================

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
    p_event_type TEXT,
    p_severity TEXT DEFAULT 'medium',
    p_user_id UUID DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_endpoint TEXT DEFAULT NULL,
    p_method TEXT DEFAULT NULL,
    p_event_data JSONB DEFAULT '{}'::JSONB,
    p_additional_context JSONB DEFAULT '{}'::JSONB,
    p_session_id TEXT DEFAULT NULL,
    p_request_id TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO security_events (
        event_type, severity, user_id, ip_address, user_agent,
        endpoint, method, event_data, additional_context,
        session_id, request_id
    ) VALUES (
        p_event_type, p_severity, p_user_id, p_ip_address, p_user_agent,
        p_endpoint, p_method, p_event_data, p_additional_context,
        p_session_id, p_request_id
    ) RETURNING id INTO v_event_id;
    
    -- Check if this event should trigger an alert
    PERFORM check_security_alert_triggers(v_event_id, p_event_type, p_user_id);
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check for security alert triggers
CREATE OR REPLACE FUNCTION check_security_alert_triggers(
    p_event_id UUID,
    p_event_type TEXT,
    p_user_id UUID
) RETURNS VOID AS $$
DECLARE
    v_recent_failures INTEGER;
    v_rate_violations INTEGER;
BEGIN
    -- Check for multiple failed login attempts
    IF p_event_type = 'authentication_failure' AND p_user_id IS NOT NULL THEN
        SELECT COUNT(*) INTO v_recent_failures
        FROM authentication_events
        WHERE user_id = p_user_id
        AND event_type = 'login_failure'
        AND created_at > NOW() - INTERVAL '15 minutes';
        
        IF v_recent_failures >= 5 THEN
            INSERT INTO security_alerts (
                alert_type, severity, title, description,
                user_id, security_event_id, threshold_value,
                current_value, time_window_minutes
            ) VALUES (
                'multiple_failed_logins', 'high',
                'Multiple Failed Login Attempts Detected',
                'User has exceeded the threshold for failed login attempts',
                p_user_id, p_event_id, 5,
                v_recent_failures, 15
            );
        END IF;
    END IF;
    
    -- Check for rate limit violations
    IF p_event_type = 'rate_limit_exceeded' THEN
        SELECT COUNT(*) INTO v_rate_violations
        FROM rate_limit_violations
        WHERE user_id = p_user_id
        AND created_at > NOW() - INTERVAL '1 hour';
        
        IF v_rate_violations >= 3 THEN
            INSERT INTO security_alerts (
                alert_type, severity, title, description,
                user_id, security_event_id, threshold_value,
                current_value, time_window_minutes
            ) VALUES (
                'rate_limit_exceeded', 'medium',
                'Repeated Rate Limit Violations',
                'User has triggered multiple rate limits in short time',
                p_user_id, p_event_id, 3,
                v_rate_violations, 60
            );
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log audit trail
CREATE OR REPLACE FUNCTION log_audit_trail(
    p_table_name TEXT,
    p_operation TEXT,
    p_record_id UUID,
    p_user_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_endpoint TEXT DEFAULT NULL,
    p_request_id TEXT DEFAULT NULL,
    p_reason TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_audit_id UUID;
    v_changed_fields TEXT[];
BEGIN
    -- Calculate changed fields if both old and new values provided
    IF p_old_values IS NOT NULL AND p_new_values IS NOT NULL THEN
        SELECT ARRAY_AGG(key) INTO v_changed_fields
        FROM (
            SELECT key FROM jsonb_each(p_old_values)
            EXCEPT
            SELECT key FROM jsonb_each(p_new_values)
            UNION
            SELECT key FROM jsonb_each(p_new_values)
            EXCEPT  
            SELECT key FROM jsonb_each(p_old_values)
        ) changed_keys;
    END IF;
    
    INSERT INTO audit_trail (
        table_name, operation, record_id, user_id,
        old_values, new_values, changed_fields,
        endpoint, request_id, reason
    ) VALUES (
        p_table_name, p_operation, p_record_id, p_user_id,
        p_old_values, p_new_values, v_changed_fields,
        p_endpoint, p_request_id, p_reason
    ) RETURNING id INTO v_audit_id;
    
    RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 8. GRANTS AND PERMISSIONS
-- ================================================================

-- Grant access to service role for logging
GRANT ALL ON security_events TO service_role;
GRANT ALL ON audit_trail TO service_role;
GRANT ALL ON rate_limit_violations TO service_role;
GRANT ALL ON authentication_events TO service_role;
GRANT ALL ON security_alerts TO service_role;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION log_security_event TO service_role;
GRANT EXECUTE ON FUNCTION check_security_alert_triggers TO service_role;
GRANT EXECUTE ON FUNCTION log_audit_trail TO service_role;

-- Create updated_at trigger for security_alerts
CREATE TRIGGER handle_updated_at_security_alerts
    BEFORE UPDATE ON security_alerts
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();