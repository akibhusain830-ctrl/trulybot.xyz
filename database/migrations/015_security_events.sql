-- Security Events Table for Advanced Threat Detection and Security Monitoring
-- Provides real-time security monitoring, threat detection, and automated response systems

-- Create security_events table
CREATE TABLE IF NOT EXISTS security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Security Identity
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  
  -- Event Classification
  security_event_type TEXT NOT NULL CHECK (
    security_event_type IN (
      'login_attempt', 'failed_login', 'suspicious_login', 'brute_force',
      'privilege_escalation', 'unauthorized_access', 'data_breach',
      'malware_detection', 'ddos_attempt', 'sql_injection', 'xss_attempt',
      'rate_limit_exceeded', 'ip_blocked', 'geofencing_violation',
      'device_anomaly', 'session_hijack', 'csrf_attempt', 'bot_detection',
      'credential_stuffing', 'account_takeover', 'insider_threat'
    )
  ),
  severity_level TEXT NOT NULL DEFAULT 'medium' CHECK (
    severity_level IN ('info', 'low', 'medium', 'high', 'critical')
  ),
  threat_category TEXT NOT NULL CHECK (
    threat_category IN (
      'authentication', 'authorization', 'data_access', 'network', 'malware',
      'social_engineering', 'insider', 'external', 'automated', 'manual'
    )
  ),
  
  -- Attack Details
  attack_vector TEXT CHECK (
    attack_vector IN (
      'web_application', 'api', 'mobile_app', 'email', 'social_media',
      'direct_network', 'physical', 'supply_chain', 'third_party'
    )
  ),
  attack_signature TEXT, -- Known attack pattern signature
  vulnerability_exploited TEXT, -- CVE or vulnerability identifier
  
  -- Source Information
  source_ip INET NOT NULL,
  source_country TEXT,
  source_region TEXT,
  source_asn INTEGER, -- Autonomous System Number
  source_isp TEXT,
  
  -- Target Information
  target_resource TEXT, -- What was targeted
  target_endpoint TEXT, -- Specific endpoint/URL
  target_user_id UUID REFERENCES auth.users(id),
  
  -- Request Context
  user_agent TEXT,
  request_headers JSONB,
  request_payload JSONB,
  response_code INTEGER,
  
  -- Detection Information
  detection_method TEXT NOT NULL CHECK (
    detection_method IN (
      'rule_based', 'ml_model', 'anomaly_detection', 'signature_match',
      'behavior_analysis', 'rate_limiting', 'manual_review', 'third_party'
    )
  ),
  detection_confidence DECIMAL(3,2) DEFAULT 0.50 CHECK (
    detection_confidence >= 0.00 AND detection_confidence <= 1.00
  ),
  false_positive_probability DECIMAL(3,2) DEFAULT 0.10,
  
  -- Threat Intelligence
  known_threat BOOLEAN DEFAULT FALSE,
  threat_source TEXT, -- Threat intelligence source
  threat_indicators JSONB DEFAULT '[]', -- IOCs (Indicators of Compromise)
  attribution TEXT, -- Known threat actor/group
  
  -- Impact Assessment
  potential_impact TEXT CHECK (
    potential_impact IN ('none', 'minimal', 'moderate', 'significant', 'catastrophic')
  ),
  business_impact TEXT,
  affected_systems JSONB DEFAULT '[]',
  data_at_risk TEXT,
  
  -- Response Information
  response_status TEXT DEFAULT 'detected' CHECK (
    response_status IN (
      'detected', 'investigating', 'contained', 'mitigated', 
      'resolved', 'false_positive', 'escalated'
    )
  ),
  response_actions JSONB DEFAULT '[]', -- Actions taken
  automated_response BOOLEAN DEFAULT FALSE,
  escalated_to TEXT, -- Security team member
  
  -- Timeline
  first_detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  response_time_seconds INTEGER, -- Time to first response
  
  -- Analysis Data
  event_frequency INTEGER DEFAULT 1, -- How many times this occurred
  similar_events_count INTEGER DEFAULT 0,
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  
  -- Communication
  notifications_sent JSONB DEFAULT '[]', -- Who was notified
  external_reports JSONB DEFAULT '[]', -- External agencies notified
  
  -- Technical Details
  evidence JSONB DEFAULT '{}', -- Technical evidence
  forensic_data JSONB DEFAULT '{}', -- Forensic analysis data
  network_flows JSONB DEFAULT '[]', -- Network traffic details
  
  -- Compliance & Legal
  regulatory_impact BOOLEAN DEFAULT FALSE,
  breach_notification_required BOOLEAN DEFAULT FALSE,
  law_enforcement_contacted BOOLEAN DEFAULT FALSE,
  compliance_violations JSONB DEFAULT '[]',
  
  -- Additional Context
  tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for security monitoring and analysis
CREATE INDEX IF NOT EXISTS idx_security_events_workspace_id ON security_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(security_event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity_level);
CREATE INDEX IF NOT EXISTS idx_security_events_source_ip ON security_events(source_ip);
CREATE INDEX IF NOT EXISTS idx_security_events_threat_category ON security_events(threat_category);
CREATE INDEX IF NOT EXISTS idx_security_events_response_status ON security_events(response_status);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_first_detected ON security_events(first_detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_risk_score ON security_events(risk_score DESC);

-- Composite indexes for threat analysis
CREATE INDEX IF NOT EXISTS idx_security_events_workspace_severity ON security_events(workspace_id, severity_level, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_ip_type ON security_events(source_ip, security_event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_threat_analysis ON security_events(threat_category, severity_level, response_status);
CREATE INDEX IF NOT EXISTS idx_security_events_active_threats ON security_events(response_status, severity_level) WHERE response_status NOT IN ('resolved', 'false_positive');

-- GIN indexes for JSONB fields
CREATE INDEX IF NOT EXISTS idx_security_events_threat_indicators ON security_events USING GIN (threat_indicators);
CREATE INDEX IF NOT EXISTS idx_security_events_response_actions ON security_events USING GIN (response_actions);
CREATE INDEX IF NOT EXISTS idx_security_events_metadata ON security_events USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_security_events_tags ON security_events USING GIN (tags);

-- Enable Row Level Security
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for security_events
CREATE POLICY "Security team can view all security events"
  ON security_events FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can view their own security events"
  ON security_events FOR SELECT
  USING (
    user_id = auth.uid() 
    OR target_user_id = auth.uid()
  );

CREATE POLICY "System can insert security events"
  ON security_events FOR INSERT
  WITH CHECK (true); -- Allow security system to log all events

CREATE POLICY "Security team can update security events"
  ON security_events FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Prevent deletion of security events (compliance requirement)
CREATE POLICY "No deletion of security events"
  ON security_events FOR DELETE
  USING (FALSE);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_security_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_seen_at = NOW();
  RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER trigger_security_events_updated_at
  BEFORE UPDATE ON security_events
  FOR EACH ROW
  EXECUTE FUNCTION update_security_events_updated_at();

-- Helper function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_workspace_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_event_type TEXT DEFAULT 'suspicious_login',
  p_severity TEXT DEFAULT 'medium',
  p_threat_category TEXT DEFAULT 'authentication',
  p_source_ip INET DEFAULT NULL,
  p_target_resource TEXT DEFAULT NULL,
  p_detection_method TEXT DEFAULT 'rule_based',
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO security_events (
    workspace_id, user_id, security_event_type, severity_level, 
    threat_category, source_ip, target_resource, detection_method, metadata
  ) VALUES (
    p_workspace_id, p_user_id, p_event_type, p_severity,
    p_threat_category, p_source_ip, p_target_resource, p_detection_method, p_metadata
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get security dashboard metrics
CREATE OR REPLACE FUNCTION get_security_metrics(
  p_workspace_id UUID,
  p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
  total_events INTEGER,
  critical_events INTEGER,
  high_events INTEGER,
  active_threats INTEGER,
  resolved_events INTEGER,
  false_positives INTEGER,
  unique_source_ips INTEGER,
  top_threat_types JSONB,
  severity_distribution JSONB,
  hourly_activity JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_events,
    COUNT(CASE WHEN se.severity_level = 'critical' THEN 1 END)::INTEGER as critical_events,
    COUNT(CASE WHEN se.severity_level = 'high' THEN 1 END)::INTEGER as high_events,
    COUNT(CASE WHEN se.response_status NOT IN ('resolved', 'false_positive') THEN 1 END)::INTEGER as active_threats,
    COUNT(CASE WHEN se.response_status = 'resolved' THEN 1 END)::INTEGER as resolved_events,
    COUNT(CASE WHEN se.response_status = 'false_positive' THEN 1 END)::INTEGER as false_positives,
    COUNT(DISTINCT se.source_ip)::INTEGER as unique_source_ips,
    
    -- Top threat types
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object('threat_type', security_event_type, 'count', count)
      ) FROM (
        SELECT se2.security_event_type, COUNT(*) as count
        FROM security_events se2
        WHERE se2.workspace_id = p_workspace_id
          AND se2.created_at >= NOW() - INTERVAL '1 hour' * p_hours
        GROUP BY se2.security_event_type
        ORDER BY count DESC
        LIMIT 10
      ) top_threats),
      '[]'::jsonb
    ) as top_threat_types,
    
    -- Severity distribution
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object('severity', severity_level, 'count', count)
      ) FROM (
        SELECT se3.severity_level, COUNT(*) as count
        FROM security_events se3
        WHERE se3.workspace_id = p_workspace_id
          AND se3.created_at >= NOW() - INTERVAL '1 hour' * p_hours
        GROUP BY se3.severity_level
      ) severities),
      '[]'::jsonb
    ) as severity_distribution,
    
    -- Hourly activity
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object('hour', hour, 'count', count)
      ) FROM (
        SELECT EXTRACT(hour FROM se4.created_at) as hour, COUNT(*) as count
        FROM security_events se4
        WHERE se4.workspace_id = p_workspace_id
          AND se4.created_at >= NOW() - INTERVAL '1 hour' * p_hours
        GROUP BY EXTRACT(hour FROM se4.created_at)
        ORDER BY hour
      ) hourly),
      '[]'::jsonb
    ) as hourly_activity
    
  FROM security_events se
  WHERE se.workspace_id = p_workspace_id
    AND se.created_at >= NOW() - INTERVAL '1 hour' * p_hours;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get threat intelligence
CREATE OR REPLACE FUNCTION get_threat_intelligence(
  p_workspace_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  source_ip INET,
  event_count INTEGER,
  max_severity TEXT,
  threat_types JSONB,
  first_seen TIMESTAMPTZ,
  last_seen TIMESTAMPTZ,
  countries JSONB,
  risk_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    se.source_ip,
    COUNT(*)::INTEGER as event_count,
    MAX(se.severity_level) as max_severity,
    jsonb_agg(DISTINCT se.security_event_type) as threat_types,
    MIN(se.created_at) as first_seen,
    MAX(se.last_seen_at) as last_seen,
    jsonb_agg(DISTINCT se.source_country) FILTER (WHERE se.source_country IS NOT NULL) as countries,
    MAX(se.risk_score) as risk_score
  FROM security_events se
  WHERE (p_workspace_id IS NULL OR se.workspace_id = p_workspace_id)
    AND se.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY se.source_ip
  HAVING COUNT(*) > 1 -- Only IPs with multiple events
  ORDER BY event_count DESC, risk_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update security event response
CREATE OR REPLACE FUNCTION update_security_response(
  p_event_id UUID,
  p_response_status TEXT,
  p_response_actions JSONB DEFAULT NULL,
  p_escalated_to TEXT DEFAULT NULL,
  p_response_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated BOOLEAN := FALSE;
BEGIN
  UPDATE security_events 
  SET 
    response_status = p_response_status,
    response_actions = COALESCE(p_response_actions, response_actions),
    escalated_to = p_escalated_to,
    resolved_at = CASE WHEN p_response_status = 'resolved' THEN NOW() ELSE resolved_at END,
    response_time_seconds = CASE 
      WHEN response_time_seconds IS NULL THEN 
        EXTRACT(epoch FROM NOW() - first_detected_at)::INTEGER
      ELSE response_time_seconds 
    END,
    metadata = CASE 
      WHEN p_response_notes IS NOT NULL THEN 
        metadata || jsonb_build_object('response_notes', p_response_notes)
      ELSE metadata 
    END,
    updated_at = NOW()
  WHERE id = p_event_id;
  
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helpful comments
COMMENT ON TABLE security_events IS 'Advanced threat detection and security monitoring with real-time alerts';
COMMENT ON COLUMN security_events.security_event_type IS 'Specific type of security event detected';
COMMENT ON COLUMN security_events.severity_level IS 'Impact level of the security event';
COMMENT ON COLUMN security_events.detection_method IS 'How the threat was detected';
COMMENT ON COLUMN security_events.detection_confidence IS 'Confidence level of threat detection (0.0-1.0)';
COMMENT ON COLUMN security_events.threat_indicators IS 'Indicators of Compromise (IOCs)';
COMMENT ON COLUMN security_events.response_actions IS 'Actions taken in response to the threat';
COMMENT ON COLUMN security_events.risk_score IS 'Calculated risk score (0-100)';