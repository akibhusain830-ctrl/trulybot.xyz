-- 011_bot_analytics_events.sql
-- Creates bot_analytics_events table for tracking chatbot performance and user interactions
-- This table provides business insights, conversion tracking, and optimization data

CREATE TABLE IF NOT EXISTS public.bot_analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Session and User Context
    session_id UUID NOT NULL, -- Unique per conversation session
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for anonymous users
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    
    -- Event Classification
    event_type TEXT NOT NULL CHECK (event_type IN (
        'conversation_start',
        'message_sent',
        'message_received', 
        'lead_captured',
        'document_referenced',
        'fallback_triggered',
        'conversation_end',
        'widget_opened',
        'widget_closed',
        'suggestion_clicked'
    )),
    
    -- Event Data
    message_content TEXT, -- The actual message (anonymized if needed)
    response_content TEXT, -- Bot's response
    response_type TEXT CHECK (response_type IN ('knowledge', 'general', 'fallback', 'error')),
    
    -- Performance Metrics
    response_time_ms INTEGER, -- How long the bot took to respond
    confidence_score DECIMAL(3,2), -- AI confidence in response (0-1)
    sources_used INTEGER DEFAULT 0, -- Number of knowledge sources referenced
    
    -- Business Intelligence
    intent_detected TEXT, -- What the user was trying to do
    satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 5), -- User rating if provided
    lead_converted BOOLEAN DEFAULT FALSE, -- If this interaction led to a lead
    
    -- Technical Context
    user_agent TEXT, -- Browser info for analytics
    ip_address INET, -- For geographic analytics (hash for privacy)
    referrer_url TEXT, -- Where the user came from
    page_url TEXT, -- What page they were on
    
    -- Metadata
    metadata JSONB DEFAULT '{}', -- Flexible data for future use
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT valid_confidence CHECK (confidence_score IS NULL OR confidence_score BETWEEN 0 AND 1)
);

-- Indexes for fast analytics queries
CREATE INDEX IF NOT EXISTS bot_analytics_events_workspace_id_idx ON public.bot_analytics_events(workspace_id);
CREATE INDEX IF NOT EXISTS bot_analytics_events_session_id_idx ON public.bot_analytics_events(session_id);
CREATE INDEX IF NOT EXISTS bot_analytics_events_event_type_idx ON public.bot_analytics_events(event_type);
CREATE INDEX IF NOT EXISTS bot_analytics_events_created_at_idx ON public.bot_analytics_events(created_at);
CREATE INDEX IF NOT EXISTS bot_analytics_events_user_id_idx ON public.bot_analytics_events(user_id) WHERE user_id IS NOT NULL;

-- Composite indexes for common analytics queries
CREATE INDEX IF NOT EXISTS bot_analytics_events_workspace_date_idx ON public.bot_analytics_events(workspace_id, created_at);
CREATE INDEX IF NOT EXISTS bot_analytics_events_analytics_idx ON public.bot_analytics_events(workspace_id, event_type, created_at);

-- Enable Row Level Security
ALTER TABLE public.bot_analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view analytics for their workspace" ON public.bot_analytics_events
    FOR SELECT USING (
        workspace_id IN (
            SELECT w.id FROM public.workspaces w 
            JOIN public.profiles p ON p.workspace_id = w.id 
            WHERE p.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert analytics events" ON public.bot_analytics_events
    FOR INSERT WITH CHECK (true); -- Allow system to insert events

-- Function to clean old analytics data (optional - for GDPR compliance)
CREATE OR REPLACE FUNCTION clean_old_analytics_events()
RETURNS void AS $$
BEGIN
    -- Delete events older than 2 years (adjust as needed)
    DELETE FROM public.bot_analytics_events 
    WHERE created_at < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE public.bot_analytics_events IS 'Tracks all bot interactions for analytics and business intelligence';
COMMENT ON COLUMN public.bot_analytics_events.session_id IS 'Groups related messages in a conversation';
COMMENT ON COLUMN public.bot_analytics_events.response_time_ms IS 'Bot response latency for performance monitoring';
COMMENT ON COLUMN public.bot_analytics_events.confidence_score IS 'AI confidence in response quality (0-1)';
COMMENT ON COLUMN public.bot_analytics_events.intent_detected IS 'Detected user intent for business insights';
COMMENT ON COLUMN public.bot_analytics_events.lead_converted IS 'Whether this interaction resulted in lead capture';