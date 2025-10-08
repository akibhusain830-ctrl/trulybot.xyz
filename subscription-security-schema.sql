-- Subscription Security Database Schema
-- This creates tables for subscription security and access control

-- 1. SUBSCRIPTION AUDIT TABLE
DROP TABLE IF EXISTS subscription_audit CASCADE;

CREATE TABLE subscription_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID,
    old_tier TEXT,
    new_tier TEXT,
    change_type TEXT NOT NULL, -- 'upgrade', 'downgrade', 'cancel', 'reactivate', 'expire'
    change_reason TEXT, -- 'payment_success', 'payment_failed', 'manual', 'trial_end'
    order_id TEXT,
    payment_id TEXT,
    amount_paid DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    ip_address INET,
    user_agent TEXT,
    request_id TEXT,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT subscription_audit_change_type_check CHECK (
        change_type IN ('upgrade', 'downgrade', 'cancel', 'reactivate', 'expire', 'trial_start', 'trial_end')
    ),
    CONSTRAINT subscription_audit_change_reason_check CHECK (
        change_reason IN ('payment_success', 'payment_failed', 'manual', 'trial_end', 'trial_start', 'admin', 'system')
    )
);

-- Subscription audit indexes
CREATE INDEX IF NOT EXISTS subscription_audit_user_id_idx ON subscription_audit(user_id);
CREATE INDEX IF NOT EXISTS subscription_audit_workspace_id_idx ON subscription_audit(workspace_id);
CREATE INDEX IF NOT EXISTS subscription_audit_change_type_idx ON subscription_audit(change_type);
CREATE INDEX IF NOT EXISTS subscription_audit_created_at_idx ON subscription_audit(created_at);
CREATE INDEX IF NOT EXISTS subscription_audit_order_id_idx ON subscription_audit(order_id);
CREATE INDEX IF NOT EXISTS subscription_audit_metadata_idx ON subscription_audit USING GIN(metadata);

-- 2. SUBSCRIPTION ACCESS LOG TABLE
DROP TABLE IF EXISTS subscription_access_log CASCADE;

CREATE TABLE subscription_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID,
    subscription_tier TEXT NOT NULL,
    feature_accessed TEXT NOT NULL, -- 'chat', 'upload', 'knowledge_base', 'api', 'dashboard'
    access_granted BOOLEAN NOT NULL,
    denial_reason TEXT, -- 'tier_insufficient', 'usage_exceeded', 'subscription_expired', 'feature_disabled'
    usage_count INTEGER DEFAULT 0,
    usage_limit INTEGER,
    endpoint TEXT,
    ip_address INET,
    user_agent TEXT,
    request_id TEXT,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT subscription_access_tier_check CHECK (
        subscription_tier IN ('free', 'basic', 'pro', 'ultra', 'enterprise', 'demo')
    ),
    CONSTRAINT subscription_access_feature_check CHECK (
        feature_accessed IN ('chat', 'upload', 'knowledge_base', 'api', 'dashboard', 'settings', 'billing', 'analytics')
    )
);

-- Subscription access log indexes
CREATE INDEX IF NOT EXISTS subscription_access_log_user_id_idx ON subscription_access_log(user_id);
CREATE INDEX IF NOT EXISTS subscription_access_log_workspace_id_idx ON subscription_access_log(workspace_id);
CREATE INDEX IF NOT EXISTS subscription_access_log_feature_idx ON subscription_access_log(feature_accessed);
CREATE INDEX IF NOT EXISTS subscription_access_log_granted_idx ON subscription_access_log(access_granted);
CREATE INDEX IF NOT EXISTS subscription_access_log_created_at_idx ON subscription_access_log(created_at);
CREATE INDEX IF NOT EXISTS subscription_access_log_tier_idx ON subscription_access_log(subscription_tier);

-- 3. SUBSCRIPTION VIOLATIONS TABLE
DROP TABLE IF EXISTS subscription_violations CASCADE;

CREATE TABLE subscription_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID,
    violation_type TEXT NOT NULL, -- 'usage_exceeded', 'feature_abuse', 'tier_bypass_attempt', 'invalid_access'
    severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    feature_attempted TEXT,
    current_tier TEXT,
    required_tier TEXT,
    usage_count INTEGER DEFAULT 0,
    usage_limit INTEGER,
    endpoint TEXT,
    ip_address INET,
    user_agent TEXT,
    request_id TEXT,
    session_id TEXT,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT subscription_violations_type_check CHECK (
        violation_type IN ('usage_exceeded', 'feature_abuse', 'tier_bypass_attempt', 'invalid_access', 'payment_fraud')
    ),
    CONSTRAINT subscription_violations_severity_check CHECK (
        severity IN ('low', 'medium', 'high', 'critical')
    )
);

-- Subscription violations indexes
CREATE INDEX IF NOT EXISTS subscription_violations_user_id_idx ON subscription_violations(user_id);
CREATE INDEX IF NOT EXISTS subscription_violations_type_idx ON subscription_violations(violation_type);
CREATE INDEX IF NOT EXISTS subscription_violations_severity_idx ON subscription_violations(severity);
CREATE INDEX IF NOT EXISTS subscription_violations_resolved_idx ON subscription_violations(resolved);
CREATE INDEX IF NOT EXISTS subscription_violations_created_at_idx ON subscription_violations(created_at);

-- Enable RLS on all tables
ALTER TABLE subscription_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_violations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_audit
CREATE POLICY "Users can view their own subscription audit logs" 
ON subscription_audit FOR SELECT USING (
    auth.uid() = user_id
);

CREATE POLICY "Service role can manage subscription audit logs"
ON subscription_audit FOR ALL USING (
    auth.role() = 'service_role'
);

-- RLS Policies for subscription_access_log
CREATE POLICY "Users can view their own access logs" 
ON subscription_access_log FOR SELECT USING (
    auth.uid() = user_id
);

CREATE POLICY "Service role can manage access logs"
ON subscription_access_log FOR ALL USING (
    auth.role() = 'service_role'
);

-- RLS Policies for subscription_violations
CREATE POLICY "Users can view their own violations" 
ON subscription_violations FOR SELECT USING (
    auth.uid() = user_id
);

CREATE POLICY "Service role can manage violations"
ON subscription_violations FOR ALL USING (
    auth.role() = 'service_role'
);

-- 4. SUBSCRIPTION SECURITY FUNCTIONS

-- Log subscription access attempt
CREATE OR REPLACE FUNCTION log_subscription_access(
    p_user_id UUID,
    p_workspace_id UUID,
    p_subscription_tier TEXT,
    p_feature_accessed TEXT,
    p_access_granted BOOLEAN,
    p_denial_reason TEXT DEFAULT NULL,
    p_usage_count INTEGER DEFAULT 0,
    p_usage_limit INTEGER DEFAULT NULL,
    p_endpoint TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_request_id TEXT DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO subscription_access_log (
        user_id, workspace_id, subscription_tier, feature_accessed,
        access_granted, denial_reason, usage_count, usage_limit,
        endpoint, ip_address, user_agent, request_id, session_id, metadata
    ) VALUES (
        p_user_id, p_workspace_id, p_subscription_tier, p_feature_accessed,
        p_access_granted, p_denial_reason, p_usage_count, p_usage_limit,
        p_endpoint, p_ip_address, p_user_agent, p_request_id, p_session_id, p_metadata
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log subscription violation
CREATE OR REPLACE FUNCTION log_subscription_violation(
    p_user_id UUID,
    p_workspace_id UUID,
    p_violation_type TEXT,
    p_severity TEXT DEFAULT 'medium',
    p_feature_attempted TEXT DEFAULT NULL,
    p_current_tier TEXT DEFAULT NULL,
    p_required_tier TEXT DEFAULT NULL,
    p_usage_count INTEGER DEFAULT 0,
    p_usage_limit INTEGER DEFAULT NULL,
    p_endpoint TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_request_id TEXT DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
    violation_id UUID;
BEGIN
    INSERT INTO subscription_violations (
        user_id, workspace_id, violation_type, severity,
        feature_attempted, current_tier, required_tier,
        usage_count, usage_limit, endpoint, ip_address,
        user_agent, request_id, session_id, metadata
    ) VALUES (
        p_user_id, p_workspace_id, p_violation_type, p_severity,
        p_feature_attempted, p_current_tier, p_required_tier,
        p_usage_count, p_usage_limit, p_endpoint, p_ip_address,
        p_user_agent, p_request_id, p_session_id, p_metadata
    ) RETURNING id INTO violation_id;
    
    RETURN violation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log subscription change
CREATE OR REPLACE FUNCTION log_subscription_change(
    p_user_id UUID,
    p_workspace_id UUID,
    p_old_tier TEXT,
    p_new_tier TEXT,
    p_change_type TEXT,
    p_change_reason TEXT,
    p_order_id TEXT DEFAULT NULL,
    p_payment_id TEXT DEFAULT NULL,
    p_amount_paid DECIMAL DEFAULT NULL,
    p_currency TEXT DEFAULT 'USD',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_request_id TEXT DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
    audit_id UUID;
BEGIN
    INSERT INTO subscription_audit (
        user_id, workspace_id, old_tier, new_tier,
        change_type, change_reason, order_id, payment_id,
        amount_paid, currency, ip_address, user_agent,
        request_id, session_id, metadata
    ) VALUES (
        p_user_id, p_workspace_id, p_old_tier, p_new_tier,
        p_change_type, p_change_reason, p_order_id, p_payment_id,
        p_amount_paid, p_currency, p_ip_address, p_user_agent,
        p_request_id, p_session_id, p_metadata
    ) RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get subscription security metrics
CREATE OR REPLACE FUNCTION get_subscription_security_metrics(
    p_user_id UUID DEFAULT NULL,
    p_hours INTEGER DEFAULT 24
) RETURNS TABLE(
    total_access_attempts BIGINT,
    denied_access_attempts BIGINT,
    total_violations BIGINT,
    critical_violations BIGINT,
    subscription_changes BIGINT,
    most_accessed_feature TEXT,
    most_violated_feature TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH access_stats AS (
        SELECT 
            COUNT(*) as total_attempts,
            COUNT(*) FILTER (WHERE NOT access_granted) as denied_attempts,
            MODE() WITHIN GROUP (ORDER BY feature_accessed) as top_feature
        FROM subscription_access_log
        WHERE (p_user_id IS NULL OR user_id = p_user_id)
        AND created_at >= NOW() - (p_hours * INTERVAL '1 hour')
    ),
    violation_stats AS (
        SELECT 
            COUNT(*) as total_viols,
            COUNT(*) FILTER (WHERE severity = 'critical') as critical_viols,
            MODE() WITHIN GROUP (ORDER BY feature_attempted) as top_violation_feature
        FROM subscription_violations
        WHERE (p_user_id IS NULL OR user_id = p_user_id)
        AND created_at >= NOW() - (p_hours * INTERVAL '1 hour')
    ),
    change_stats AS (
        SELECT COUNT(*) as total_changes
        FROM subscription_audit
        WHERE (p_user_id IS NULL OR user_id = p_user_id)
        AND created_at >= NOW() - (p_hours * INTERVAL '1 hour')
    )
    SELECT 
        a.total_attempts,
        a.denied_attempts,
        v.total_viols,
        v.critical_viols,
        c.total_changes,
        a.top_feature,
        v.top_violation_feature
    FROM access_stats a, violation_stats v, change_stats c;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON subscription_audit TO authenticated;
GRANT SELECT, INSERT, UPDATE ON subscription_access_log TO authenticated;
GRANT SELECT, INSERT, UPDATE ON subscription_violations TO authenticated;
GRANT EXECUTE ON FUNCTION log_subscription_access TO authenticated;
GRANT EXECUTE ON FUNCTION log_subscription_violation TO authenticated;
GRANT EXECUTE ON FUNCTION log_subscription_change TO authenticated;
GRANT EXECUTE ON FUNCTION get_subscription_security_metrics TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Subscription Security schema created successfully!';
    RAISE NOTICE 'Tables created: subscription_audit, subscription_access_log, subscription_violations';
    RAISE NOTICE 'Functions created: log_subscription_access, log_subscription_violation, log_subscription_change, get_subscription_security_metrics';
END $$;