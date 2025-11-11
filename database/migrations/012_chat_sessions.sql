-- 012_chat_sessions.sql
-- Creates chat_sessions table for tracking complete conversation flows
-- Essential for customer support, user journey analysis, and conversation optimization

CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Session Identity
    session_id TEXT UNIQUE NOT NULL, -- External session identifier
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for anonymous users
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    
    -- Session Context
    user_agent TEXT, -- Browser/client information
    ip_address INET, -- User's IP (hashed for privacy)
    referrer_url TEXT, -- Where user came from
    page_url TEXT, -- Page where chat was initiated
    device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
    
    -- Conversation Flow
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
        'active',      -- Currently ongoing
        'completed',   -- Naturally ended
        'abandoned',   -- User left without proper closure
        'transferred', -- Handed off to human support
        'expired'      -- Timed out
    )),
    
    -- Conversation Metrics
    total_messages INTEGER DEFAULT 0, -- Total messages in conversation
    user_messages INTEGER DEFAULT 0,  -- Messages from user
    bot_messages INTEGER DEFAULT 0,   -- Messages from bot
    duration_seconds INTEGER,         -- How long the conversation lasted
    
    -- Business Intelligence
    intent_category TEXT, -- Primary intent (support, sales, information, etc.)
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
    lead_captured BOOLEAN DEFAULT FALSE,
    issue_resolved BOOLEAN, -- Did we solve their problem?
    escalated_to_human BOOLEAN DEFAULT FALSE,
    
    -- Performance Metrics
    avg_response_time_ms INTEGER, -- Average bot response time
    fallback_count INTEGER DEFAULT 0, -- How many fallback responses
    knowledge_base_hits INTEGER DEFAULT 0, -- Successful KB matches
    
    -- Customer Support Data
    support_category TEXT, -- billing, technical, general, etc.
    urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
    tags TEXT[], -- Flexible tagging system for categorization
    
    -- Resolution Tracking
    resolution_type TEXT CHECK (resolution_type IN (
        'self_service',    -- User found answer via bot
        'information_provided', -- Bot provided sufficient info
        'lead_converted',  -- User became a lead/customer
        'escalated',      -- Sent to human support
        'unresolved',     -- No satisfactory resolution
        'abandoned'       -- User left without resolution
    )),
    
    -- Geographic & Temporal Data
    timezone TEXT, -- User's timezone
    language_detected TEXT, -- Detected user language
    country_code TEXT, -- Derived from IP
    
    -- Session Lifecycle
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}', -- Flexible storage for future data
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_duration CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
    CONSTRAINT valid_message_counts CHECK (
        total_messages >= 0 AND 
        user_messages >= 0 AND 
        bot_messages >= 0 AND
        total_messages >= user_messages + bot_messages
    )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS chat_sessions_workspace_id_idx ON public.chat_sessions(workspace_id);
CREATE INDEX IF NOT EXISTS chat_sessions_user_id_idx ON public.chat_sessions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS chat_sessions_status_idx ON public.chat_sessions(status);
CREATE INDEX IF NOT EXISTS chat_sessions_started_at_idx ON public.chat_sessions(started_at);
CREATE INDEX IF NOT EXISTS chat_sessions_session_id_idx ON public.chat_sessions(session_id);

-- Composite indexes for analytics
CREATE INDEX IF NOT EXISTS chat_sessions_workspace_date_idx ON public.chat_sessions(workspace_id, started_at);
CREATE INDEX IF NOT EXISTS chat_sessions_analytics_idx ON public.chat_sessions(workspace_id, status, resolution_type, started_at);
CREATE INDEX IF NOT EXISTS chat_sessions_support_idx ON public.chat_sessions(workspace_id, support_category, urgency_level) WHERE support_category IS NOT NULL;

-- Text search index for tags
CREATE INDEX IF NOT EXISTS chat_sessions_tags_idx ON public.chat_sessions USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view sessions for their workspace" ON public.chat_sessions
    FOR SELECT USING (
        workspace_id IN (
            SELECT w.id FROM public.workspaces w 
            JOIN public.profiles p ON p.workspace_id = w.id 
            WHERE p.user_id = auth.uid()
        )
    );

CREATE POLICY "System can manage all chat sessions" ON public.chat_sessions
    FOR ALL USING (true); -- System operations need full access

-- Function to automatically update last_activity_at
CREATE OR REPLACE FUNCTION update_chat_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_activity_at = NOW();
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update activity timestamp
CREATE TRIGGER chat_sessions_update_activity
    BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_session_activity();

-- Function to calculate session duration on completion
CREATE OR REPLACE FUNCTION finalize_chat_session()
RETURNS TRIGGER AS $$
BEGIN
    -- If session is being marked as completed/ended and doesn't have duration
    IF NEW.status IN ('completed', 'abandoned', 'transferred', 'expired') 
       AND OLD.status = 'active' 
       AND NEW.duration_seconds IS NULL THEN
        
        NEW.ended_at = NOW();
        NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to finalize session data
CREATE TRIGGER chat_sessions_finalize
    BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION finalize_chat_session();

-- Function to get session summary for customer support
CREATE OR REPLACE FUNCTION get_session_summary(session_uuid UUID)
RETURNS TABLE(
    session_info JSONB,
    conversation_flow JSONB,
    performance_metrics JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        jsonb_build_object(
            'id', cs.id,
            'session_id', cs.session_id,
            'status', cs.status,
            'started_at', cs.started_at,
            'duration', cs.duration_seconds,
            'resolution_type', cs.resolution_type,
            'satisfaction', cs.satisfaction_rating,
            'tags', cs.tags
        ) as session_info,
        
        jsonb_build_object(
            'total_messages', cs.total_messages,
            'user_messages', cs.user_messages,
            'bot_messages', cs.bot_messages,
            'intent_category', cs.intent_category,
            'lead_captured', cs.lead_captured,
            'escalated', cs.escalated_to_human
        ) as conversation_flow,
        
        jsonb_build_object(
            'avg_response_time', cs.avg_response_time_ms,
            'fallback_count', cs.fallback_count,
            'knowledge_hits', cs.knowledge_base_hits,
            'device_type', cs.device_type,
            'country', cs.country_code
        ) as performance_metrics
        
    FROM public.chat_sessions cs
    WHERE cs.id = session_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get workspace conversation analytics
CREATE OR REPLACE FUNCTION get_conversation_analytics(
    workspace_uuid UUID,
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
    total_sessions BIGINT,
    avg_duration NUMERIC,
    resolution_breakdown JSONB,
    satisfaction_avg NUMERIC,
    top_support_categories JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_sessions,
        ROUND(AVG(duration_seconds), 2) as avg_duration,
        
        jsonb_object_agg(
            COALESCE(resolution_type, 'unknown'), 
            resolution_count
        ) as resolution_breakdown,
        
        ROUND(AVG(satisfaction_rating), 2) as satisfaction_avg,
        
        jsonb_agg(
            jsonb_build_object(
                'category', support_category,
                'count', category_count
            ) ORDER BY category_count DESC
        ) as top_support_categories
        
    FROM (
        -- Main session data
        SELECT 
            duration_seconds,
            resolution_type,
            satisfaction_rating,
            support_category
        FROM public.chat_sessions
        WHERE workspace_id = workspace_uuid
          AND started_at >= NOW() - INTERVAL '1 day' * days_back
    ) sessions
    
    LEFT JOIN (
        -- Resolution type counts
        SELECT 
            resolution_type,
            COUNT(*) as resolution_count
        FROM public.chat_sessions
        WHERE workspace_id = workspace_uuid
          AND started_at >= NOW() - INTERVAL '1 day' * days_back
        GROUP BY resolution_type
    ) resolution_data ON TRUE
    
    LEFT JOIN (
        -- Support category counts
        SELECT 
            support_category,
            COUNT(*) as category_count
        FROM public.chat_sessions
        WHERE workspace_id = workspace_uuid
          AND started_at >= NOW() - INTERVAL '1 day' * days_back
          AND support_category IS NOT NULL
        GROUP BY support_category
    ) category_data ON TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE public.chat_sessions IS 'Complete conversation tracking for customer support and analytics';
COMMENT ON COLUMN public.chat_sessions.session_id IS 'External session identifier linking to analytics events';
COMMENT ON COLUMN public.chat_sessions.resolution_type IS 'How the conversation was resolved - critical for CS metrics';
COMMENT ON COLUMN public.chat_sessions.satisfaction_rating IS 'User satisfaction score (1-5) for service quality';
COMMENT ON COLUMN public.chat_sessions.escalated_to_human IS 'Whether conversation required human intervention';
COMMENT ON COLUMN public.chat_sessions.tags IS 'Flexible tagging system for conversation categorization';