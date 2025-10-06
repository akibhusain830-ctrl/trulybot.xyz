-- ==========================================
-- VERIFY ROBUST USER FLOW CONFIGURATION
-- ==========================================
-- Run this after remove-free-tier.sql to verify everything is working correctly

-- 1. Check database constraints are in place
SELECT 
    'Database Constraints Check' as check_type,
    conname as constraint_name,
    consrc as constraint_definition
FROM pg_constraint 
WHERE conname LIKE '%subscription_tier%'
AND conrelid = 'public.profiles'::regclass;

-- 2. Check database defaults
SELECT 
    'Database Defaults Check' as check_type,
    column_name,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles' 
AND column_name IN ('subscription_tier', 'subscription_status');

-- 3. Check trigger functions exist and are updated
SELECT 
    'Trigger Functions Check' as check_type,
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('handle_new_user', 'create_missing_profiles')
ORDER BY routine_name;

-- 4. Check triggers are active
SELECT 
    'Active Triggers Check' as check_type,
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name = 'on_auth_user_created';

-- 5. Verify no users have 'free' tier
SELECT 
    'Free Tier Cleanup Check' as check_type,
    COUNT(*) as free_tier_users
FROM public.profiles 
WHERE subscription_tier = 'free';

-- 6. Check profile distribution
SELECT 
    'Profile Distribution' as check_type,
    subscription_tier,
    subscription_status,
    COUNT(*) as user_count
FROM public.profiles 
GROUP BY subscription_tier, subscription_status
ORDER BY subscription_tier, subscription_status;

-- 7. Check for users with automatic access (should be minimal)
SELECT 
    'Automatic Access Check' as check_type,
    COUNT(*) as users_with_auto_access,
    'These users got access automatically (should be existing only)' as note
FROM public.profiles 
WHERE subscription_status IN ('trial', 'active')
AND trial_ends_at > NOW();

-- 8. Verify trial system integrity
SELECT 
    'Trial System Check' as check_type,
    subscription_status,
    COUNT(*) as count,
    MIN(trial_ends_at) as earliest_trial_end,
    MAX(trial_ends_at) as latest_trial_end
FROM public.profiles 
WHERE trial_ends_at IS NOT NULL
GROUP BY subscription_status;

-- 9. Check for orphaned data
SELECT 
    'Data Integrity Check' as check_type,
    'profiles_without_workspaces' as issue_type,
    COUNT(*) as count
FROM public.profiles p
LEFT JOIN public.workspaces w ON p.workspace_id = w.id
WHERE w.id IS NULL

UNION ALL

SELECT 
    'Data Integrity Check' as check_type,
    'workspaces_without_profiles' as issue_type,
    COUNT(*) as count
FROM public.workspaces w
LEFT JOIN public.profiles p ON w.id = p.workspace_id
WHERE p.id IS NULL;

-- 10. Final robustness summary
DO $$
DECLARE
    free_tier_count INTEGER;
    auto_access_count INTEGER;
    constraint_count INTEGER;
    trigger_count INTEGER;
BEGIN
    -- Count problematic configurations
    SELECT COUNT(*) INTO free_tier_count FROM public.profiles WHERE subscription_tier = 'free';
    SELECT COUNT(*) INTO auto_access_count FROM public.profiles WHERE subscription_status = 'trial' AND created_at > NOW() - INTERVAL '1 hour';
    SELECT COUNT(*) INTO constraint_count FROM pg_constraint WHERE conname LIKE '%subscription_tier%';
    SELECT COUNT(*) INTO trigger_count FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
    
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'ROBUSTNESS VERIFICATION SUMMARY';
    RAISE NOTICE '==========================================';
    
    IF free_tier_count = 0 THEN
        RAISE NOTICE '✅ No free tier users found';
    ELSE
        RAISE NOTICE '❌ % users still have free tier', free_tier_count;
    END IF;
    
    IF constraint_count > 0 THEN
        RAISE NOTICE '✅ Database constraints in place';
    ELSE
        RAISE NOTICE '❌ Database constraints missing';
    END IF;
    
    IF trigger_count > 0 THEN
        RAISE NOTICE '✅ Database triggers active';
    ELSE
        RAISE NOTICE '❌ Database triggers missing';
    END IF;
    
    IF auto_access_count = 0 THEN
        RAISE NOTICE '✅ No recent automatic access granted';
    ELSE
        RAISE NOTICE '⚠️ % recent users got automatic access', auto_access_count;
    END IF;
    
    RAISE NOTICE '==========================================';
    
    IF free_tier_count = 0 AND constraint_count > 0 AND trigger_count > 0 THEN
        RAISE NOTICE '🟢 SYSTEM STATUS: ROBUST ✅';
        RAISE NOTICE 'New users will get NO automatic access';
        RAISE NOTICE 'They must explicitly start trial';
    ELSE
        RAISE NOTICE '🔴 SYSTEM STATUS: NEEDS FIXES ❌';
        RAISE NOTICE 'Check the issues above';
    END IF;
    
    RAISE NOTICE '==========================================';
END $$;