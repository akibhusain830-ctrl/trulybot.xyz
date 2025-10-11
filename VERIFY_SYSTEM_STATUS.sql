-- VERIFICATION: Run this after all updates to confirm everything works
-- This will show you the current state of your leads system

-- Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'leads' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check all indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'leads' 
AND schemaname = 'public'
ORDER BY indexname;

-- Check current leads with quality scores
SELECT 
    'lead_quality_summary' as report_type,
    COUNT(*) as total_leads,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as leads_with_email,
    COUNT(CASE WHEN phone IS NOT NULL THEN 1 END) as leads_with_phone,
    COUNT(CASE WHEN email IS NOT NULL AND phone IS NOT NULL THEN 1 END) as leads_with_both,
    ROUND(AVG(quality_score), 2) as avg_quality_score,
    MAX(quality_score) as max_quality_score
FROM public.leads;

-- Show quality distribution
SELECT 
    quality_score,
    COUNT(*) as lead_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM public.leads 
GROUP BY quality_score 
ORDER BY quality_score DESC;

-- Show workspace isolation
SELECT 
    workspace_id,
    COUNT(*) as lead_count,
    COUNT(CASE WHEN quality_score >= 5 THEN 1 END) as high_quality_leads
FROM public.leads 
GROUP BY workspace_id 
ORDER BY lead_count DESC;

-- Show recent leads (last 7 days)
SELECT 
    id,
    email,
    phone,
    quality_score,
    source_page,
    created_at,
    LEFT(message, 100) || '...' as message_preview
FROM public.leads 
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY quality_score DESC, created_at DESC
LIMIT 10;