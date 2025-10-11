-- QUICK DATABASE HEALTH CHECK FOR ENHANCED LEAD COLLECTION
-- Run this to check if your database is ready for the new lead collection features

-- Check if leads table exists and has all required columns
SELECT 
    'leads_table_check' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'leads' AND table_schema = 'public'
        ) THEN 'EXISTS'
        ELSE 'MISSING'
    END as leads_table_status;

-- Check if phone column exists
SELECT 
    'phone_column_check' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'leads' 
            AND column_name = 'phone'
            AND table_schema = 'public'
        ) THEN 'EXISTS'
        ELSE 'MISSING'
    END as phone_column_status;

-- Check if phone index exists
SELECT 
    'phone_index_check' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'leads' 
            AND indexname = 'leads_phone_idx'
            AND schemaname = 'public'
        ) THEN 'EXISTS'
        ELSE 'MISSING'
    END as phone_index_status;

-- Check leads table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'leads' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check existing leads count
SELECT 
    'leads_count' as check_type,
    COUNT(*) as total_leads,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as leads_with_email,
    COUNT(CASE WHEN phone IS NOT NULL THEN 1 END) as leads_with_phone
FROM public.leads;

-- Check workspace isolation setup
SELECT 
    'workspace_check' as check_type,
    COUNT(DISTINCT workspace_id) as unique_workspaces,
    COUNT(*) as total_leads
FROM public.leads;