-- OPTIONAL: Add lead quality scoring and analytics
-- Run this to enhance your lead tracking

-- Add lead quality column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' 
        AND column_name = 'quality_score'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.leads ADD COLUMN quality_score INTEGER DEFAULT 0;
        RAISE NOTICE 'Added quality_score column to leads table';
    END IF;
END
$$;

-- Add lead source tracking if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' 
        AND column_name = 'source_page'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.leads ADD COLUMN source_page TEXT;
        RAISE NOTICE 'Added source_page column to leads table';
    END IF;
END
$$;

-- Create function to calculate lead quality
CREATE OR REPLACE FUNCTION calculate_lead_quality(
    p_email TEXT,
    p_phone TEXT,
    p_message TEXT
) RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    msg_lower TEXT;
BEGIN
    msg_lower := LOWER(COALESCE(p_message, ''));
    
    -- Contact info scoring
    IF p_email IS NOT NULL AND p_email != '' THEN
        score := score + 3;
    END IF;
    
    IF p_phone IS NOT NULL AND p_phone != '' THEN
        score := score + 3;
    END IF;
    
    -- Message quality scoring
    IF LENGTH(COALESCE(p_message, '')) > 50 THEN
        score := score + 1;
    END IF;
    
    -- Buying intent keywords
    IF msg_lower ~* '.*(pricing|price|cost|buy|purchase|trial|demo|quote).*' THEN
        score := score + 2;
    END IF;
    
    -- Decision maker indicators
    IF msg_lower ~* '.*(ceo|cto|manager|director|founder|owner|decision|budget|team of).*' THEN
        score := score + 2;
    END IF;
    
    -- Urgent indicators
    IF msg_lower ~* '.*(urgent|asap|immediately|today|this week).*' THEN
        score := score + 1;
    END IF;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Update existing leads with quality scores
UPDATE public.leads 
SET quality_score = calculate_lead_quality(email, phone, message)
WHERE quality_score = 0 OR quality_score IS NULL;

-- Create index for quality score
CREATE INDEX IF NOT EXISTS leads_quality_score_idx ON public.leads(quality_score DESC);

-- Final success message
DO $$
BEGIN
    RAISE NOTICE 'Lead quality enhancements completed successfully';
END
$$;