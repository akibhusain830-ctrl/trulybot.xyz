-- SIMPLE VERSION: Run these one by one if you prefer

-- Step 1: Add quality_score column
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS quality_score INTEGER DEFAULT 0;

-- Step 2: Add source_page column  
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS source_page TEXT;

-- Step 3: Create the quality calculation function
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

-- Step 4: Update existing leads with quality scores
UPDATE public.leads 
SET quality_score = calculate_lead_quality(email, phone, message)
WHERE quality_score = 0 OR quality_score IS NULL;

-- Step 5: Create index for performance
CREATE INDEX IF NOT EXISTS leads_quality_score_idx ON public.leads(quality_score DESC);