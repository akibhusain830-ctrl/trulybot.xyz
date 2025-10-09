-- Audit Trail Table for Enterprise Compliance and Security Monitoring
-- Provides comprehensive system activity tracking for security and compliance

-- Create audit_trail table
CREATE TABLE IF NOT EXISTS audit_trail (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Audit Identity
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  
  -- Event Classification
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'user_action', 'data_change', 'security_event', 'admin_action', 
      'system_event', 'api_call', 'file_access', 'configuration_change',
      'authentication', 'authorization', 'compliance_event'
    )
  ),
  event_category TEXT NOT NULL CHECK (
    event_category IN (
      'create', 'read', 'update', 'delete', 'login', 'logout', 
      'access_granted', 'access_denied', 'configuration', 'export',
      'import', 'backup', 'restore', 'migration', 'integration'
    )
  ),
  event_action TEXT NOT NULL, -- Specific action performed
  
  -- Resource Information
  resource_type TEXT CHECK (
    resource_type IN (
      'user', 'workspace', 'bot', 'knowledge_base', 'document', 'chat_session',
      'billing', 'subscription', 'api_key', 'webhook', 'integration',
      'settings', 'role', 'permission', 'policy', 'backup'
    )
  ),
  resource_id TEXT, -- ID of the affected resource
  resource_name TEXT, -- Human readable name
  
  -- Change Tracking
  old_values JSONB, -- Previous state before change
  new_values JSONB, -- New state after change
  changes_summary TEXT, -- Human readable summary of changes
  
  -- Request Context
  ip_address INET,
  user_agent TEXT,
  request_id TEXT, -- Correlation ID for request tracking
  api_endpoint TEXT, -- API endpoint accessed
  http_method TEXT CHECK (http_method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
  request_headers JSONB,
  request_body JSONB,
  response_status INTEGER,
  
  -- Business Context
  business_impact TEXT CHECK (
    business_impact IN ('low', 'medium', 'high', 'critical')
  ),
  compliance_category TEXT CHECK (
    compliance_category IN ('gdpr', 'hipaa', 'sox', 'pci', 'iso27001', 'general')
  ),
  risk_level TEXT DEFAULT 'low' CHECK (
    risk_level IN ('low', 'medium', 'high', 'critical')
  ),
  
  -- Security Context
  threat_indicator BOOLEAN DEFAULT FALSE,
  anomaly_detected BOOLEAN DEFAULT FALSE,
  requires_review BOOLEAN DEFAULT FALSE,
  security_classification TEXT DEFAULT 'internal' CHECK (
    security_classification IN ('public', 'internal', 'confidential', 'restricted')
  ),
  
  -- Actor Information
  actor_type TEXT DEFAULT 'user' CHECK (
    actor_type IN ('user', 'admin', 'system', 'api', 'service', 'anonymous')
  ),
  actor_role TEXT,
  actor_permissions JSONB,
  impersonated_by UUID REFERENCES auth.users(id), -- For admin impersonation
  
  -- Audit Metadata
  event_source TEXT DEFAULT 'web_app' CHECK (
    event_source IN ('web_app', 'api', 'mobile_app', 'system', 'cli', 'webhook')
  ),
  event_version TEXT DEFAULT '1.0',
  correlation_id TEXT, -- Links related events
  parent_event_id UUID REFERENCES audit_trail(id),
  
  -- Geographic & Temporal
  timezone TEXT,
  country_code TEXT,
  region TEXT,
  event_duration_ms INTEGER, -- How long the operation took
  
  -- Success & Error Tracking
  success BOOLEAN DEFAULT TRUE,
  error_code TEXT,
  error_message TEXT,
  error_details JSONB,
  
  -- Compliance & Retention
  retention_period INTERVAL DEFAULT INTERVAL '7 years',
  archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  -- Additional Context
  tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance and compliance queries
CREATE INDEX IF NOT EXISTS idx_audit_trail_workspace_id ON audit_trail(workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_user_id ON audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_event_type ON audit_trail(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_trail_event_category ON audit_trail(event_category);
CREATE INDEX IF NOT EXISTS idx_audit_trail_resource_type ON audit_trail(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_trail_resource_id ON audit_trail(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created_at ON audit_trail(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_ip_address ON audit_trail(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_trail_correlation_id ON audit_trail(correlation_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_session_id ON audit_trail(session_id);

-- Composite indexes for common audit queries
CREATE INDEX IF NOT EXISTS idx_audit_trail_workspace_event ON audit_trail(workspace_id, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_user_actions ON audit_trail(user_id, event_category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_security_events ON audit_trail(threat_indicator, anomaly_detected, risk_level);
CREATE INDEX IF NOT EXISTS idx_audit_trail_compliance ON audit_trail(compliance_category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_review_queue ON audit_trail(requires_review, reviewed_at);

-- GIN indexes for JSONB fields
CREATE INDEX IF NOT EXISTS idx_audit_trail_metadata ON audit_trail USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_audit_trail_tags ON audit_trail USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_audit_trail_old_values ON audit_trail USING GIN (old_values);
CREATE INDEX IF NOT EXISTS idx_audit_trail_new_values ON audit_trail USING GIN (new_values);

-- Enable Row Level Security
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_trail
CREATE POLICY "Users can view their workspace audit trail"
  ON audit_trail FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all workspace audit trail"
  ON audit_trail FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "System can insert audit trail"
  ON audit_trail FOR INSERT
  WITH CHECK (true); -- Allow system to log all events

CREATE POLICY "Only admins can update audit trail (for review)"
  ON audit_trail FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Prevent deletion of audit trail (compliance requirement)
CREATE POLICY "No deletion of audit trail"
  ON audit_trail FOR DELETE
  USING (FALSE);

-- Helper function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_workspace_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_event_type TEXT DEFAULT 'user_action',
  p_event_category TEXT DEFAULT 'read',
  p_event_action TEXT DEFAULT 'unknown',
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id TEXT DEFAULT NULL,
  p_resource_name TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
BEGIN
  INSERT INTO audit_trail (
    workspace_id, user_id, event_type, event_category, event_action,
    resource_type, resource_id, resource_name, old_values, new_values,
    ip_address, user_agent, metadata
  ) VALUES (
    p_workspace_id, p_user_id, p_event_type, p_event_category, p_event_action,
    p_resource_type, p_resource_id, p_resource_name, p_old_values, p_new_values,
    p_ip_address, p_user_agent, p_metadata
  ) RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get audit analytics
CREATE OR REPLACE FUNCTION get_audit_analytics(
  p_workspace_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  total_events INTEGER,
  user_actions INTEGER,
  admin_actions INTEGER,
  security_events INTEGER,
  failed_events INTEGER,
  unique_users INTEGER,
  top_event_types JSONB,
  hourly_activity JSONB,
  risk_distribution JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_events,
    COUNT(CASE WHEN at.event_type = 'user_action' THEN 1 END)::INTEGER as user_actions,
    COUNT(CASE WHEN at.event_type = 'admin_action' THEN 1 END)::INTEGER as admin_actions,
    COUNT(CASE WHEN at.event_type = 'security_event' THEN 1 END)::INTEGER as security_events,
    COUNT(CASE WHEN at.success = FALSE THEN 1 END)::INTEGER as failed_events,
    COUNT(DISTINCT at.user_id)::INTEGER as unique_users,
    
    -- Top event types
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object('event_type', event_type, 'count', count)
      ) FROM (
        SELECT at2.event_type, COUNT(*) as count
        FROM audit_trail at2
        WHERE at2.workspace_id = p_workspace_id
          AND (p_start_date IS NULL OR at2.created_at >= p_start_date)
          AND (p_end_date IS NULL OR at2.created_at <= p_end_date)
        GROUP BY at2.event_type
        ORDER BY count DESC
        LIMIT 10
      ) top_events),
      '[]'::jsonb
    ) as top_event_types,
    
    -- Hourly activity pattern
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object('hour', hour, 'count', count)
      ) FROM (
        SELECT EXTRACT(hour FROM at3.created_at) as hour, COUNT(*) as count
        FROM audit_trail at3
        WHERE at3.workspace_id = p_workspace_id
          AND (p_start_date IS NULL OR at3.created_at >= p_start_date)
          AND (p_end_date IS NULL OR at3.created_at <= p_end_date)
        GROUP BY EXTRACT(hour FROM at3.created_at)
        ORDER BY hour
      ) hourly),
      '[]'::jsonb
    ) as hourly_activity,
    
    -- Risk level distribution
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object('risk_level', risk_level, 'count', count)
      ) FROM (
        SELECT at4.risk_level, COUNT(*) as count
        FROM audit_trail at4
        WHERE at4.workspace_id = p_workspace_id
          AND (p_start_date IS NULL OR at4.created_at >= p_start_date)
          AND (p_end_date IS NULL OR at4.created_at <= p_end_date)
        GROUP BY at4.risk_level
      ) risks),
      '[]'::jsonb
    ) as risk_distribution
    
  FROM audit_trail at
  WHERE at.workspace_id = p_workspace_id
    AND (p_start_date IS NULL OR at.created_at >= p_start_date)
    AND (p_end_date IS NULL OR at.created_at <= p_end_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get security alerts
CREATE OR REPLACE FUNCTION get_security_alerts(
  p_workspace_id UUID DEFAULT NULL,
  p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
  id UUID,
  workspace_id UUID,
  user_id UUID,
  event_type TEXT,
  event_action TEXT,
  risk_level TEXT,
  threat_indicator BOOLEAN,
  anomaly_detected BOOLEAN,
  ip_address INET,
  created_at TIMESTAMPTZ,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    at.id,
    at.workspace_id,
    at.user_id,
    at.event_type,
    at.event_action,
    at.risk_level,
    at.threat_indicator,
    at.anomaly_detected,
    at.ip_address,
    at.created_at,
    at.metadata
  FROM audit_trail at
  WHERE (p_workspace_id IS NULL OR at.workspace_id = p_workspace_id)
    AND at.created_at >= NOW() - INTERVAL '1 hour' * p_hours
    AND (
      at.threat_indicator = TRUE 
      OR at.anomaly_detected = TRUE 
      OR at.risk_level IN ('high', 'critical')
      OR at.requires_review = TRUE
    )
  ORDER BY at.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark events as reviewed
CREATE OR REPLACE FUNCTION mark_audit_reviewed(
  p_event_ids UUID[],
  p_reviewer_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE audit_trail 
  SET 
    reviewed_by = p_reviewer_id,
    reviewed_at = NOW(),
    review_notes = p_notes,
    requires_review = FALSE
  WHERE id = ANY(p_event_ids);
  
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-archive old audit logs
CREATE OR REPLACE FUNCTION auto_archive_audit_logs()
RETURNS VOID AS $$
BEGIN
  UPDATE audit_trail 
  SET 
    archived = TRUE,
    archived_at = NOW()
  WHERE archived = FALSE
    AND created_at < NOW() - retention_period
    AND retention_period IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comments
COMMENT ON TABLE audit_trail IS 'Comprehensive system activity tracking for enterprise compliance and security monitoring';
COMMENT ON COLUMN audit_trail.event_type IS 'High-level categorization of the event';
COMMENT ON COLUMN audit_trail.event_category IS 'CRUD or action-based categorization';
COMMENT ON COLUMN audit_trail.old_values IS 'Previous state before change (for change tracking)';
COMMENT ON COLUMN audit_trail.new_values IS 'New state after change (for change tracking)';
COMMENT ON COLUMN audit_trail.threat_indicator IS 'Flags potential security threats';
COMMENT ON COLUMN audit_trail.compliance_category IS 'Relevant compliance framework';
COMMENT ON COLUMN audit_trail.retention_period IS 'How long to keep this audit record';