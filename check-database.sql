-- Check if database functions exist
SELECT 
    proname AS function_name,
    prokind AS function_type,
    prorettype::regtype AS return_type
FROM pg_proc 
WHERE proname IN ('get_or_create_profile', 'create_missing_profiles', 'handle_new_user')
ORDER BY proname;

-- Check users vs profiles
SELECT 
    (SELECT COUNT(*) FROM auth.users) as auth_users,
    (SELECT COUNT(*) FROM public.profiles) as profiles,
    (SELECT COUNT(*) FROM public.workspaces) as workspaces;

-- Check existing profiles status
SELECT 
    id,
    email,
    subscription_status,
    trial_ends_at,
    workspace_id,
    created_at
FROM public.profiles 
ORDER BY created_at DESC
LIMIT 5;