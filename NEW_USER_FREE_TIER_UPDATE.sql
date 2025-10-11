-- ===============================================================
-- NEW USER SIGNUP: FREE TIER (NOT AUTOMATIC TRIAL)
-- ===============================================================
-- This SQL updates the database to give new users FREE tier access
-- instead of automatic 7-day Ultra trial upon signup.
-- Trial access must be explicitly requested from the trial page.

-- 1. Update the trigger function for new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_workspace_id UUID;
BEGIN
    -- Create a personal workspace for the new user
    INSERT INTO public.workspaces (name, slug, created_at, updated_at)
    VALUES (
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Personal Workspace'),
        LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), ' ', '-')) || '-' || substr(NEW.id::text, 1, 8),
        NOW(),
        NOW()
    )
    RETURNING id INTO default_workspace_id;

    -- Create the user profile with FREE TIER ACCESS (no automatic trial)
    INSERT INTO public.profiles (
        id,
        workspace_id,
        email,
        full_name,
        avatar_url,
        role,
        chatbot_name,
        welcome_message,
        accent_color,
        trial_ends_at,
        subscription_status,
        subscription_tier,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        default_workspace_id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url',
        'owner',
        'Assistant',
        'Hello! How can I help you today?',
        '#2563EB',
        NULL, -- 🚫 NO AUTOMATIC TRIAL
        'none', -- 🆕 STARTS WITH 'NONE' STATUS
        'basic', -- 🆕 BASIC TIER (GETS FREE ACCESS VIA LOGIC)
        NOW(),
        NOW()
    );

    -- Initialize usage counters for the new user
    INSERT INTO public.usage_counters (
        user_id,
        workspace_id,
        month,
        monthly_uploads,
        monthly_conversations,
        monthly_words,
        total_stored_words,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        default_workspace_id,
        TO_CHAR(NOW(), 'YYYY-MM'),
        0,
        0,
        0,
        0,
        NOW(),
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Verify the function exists and is properly set
SELECT proname, prosrc FROM pg_proc WHERE proname = 'handle_new_user';

-- 3. Test the changes (optional - creates a test user)
-- UNCOMMENT TO RUN TEST:
/*
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_email TEXT := 'test-free-tier-' || extract(epoch from now()) || '@test.com';
BEGIN
    -- Simulate new user creation
    INSERT INTO auth.users (
        id,
        email,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_user_meta_data
    ) VALUES (
        test_user_id,
        test_email,
        NOW(),
        NOW(),
        NOW(),
        '{"full_name": "Test Free User"}'::jsonb
    );
    
    -- Check what got created
    RAISE NOTICE 'Test user created: %', test_email;
    RAISE NOTICE 'Profile status: %', (SELECT subscription_status FROM profiles WHERE id = test_user_id);
    RAISE NOTICE 'Profile tier: %', (SELECT subscription_tier FROM profiles WHERE id = test_user_id);
    RAISE NOTICE 'Trial ends: %', (SELECT trial_ends_at FROM profiles WHERE id = test_user_id);
    
    -- Clean up test user
    DELETE FROM auth.users WHERE id = test_user_id;
    
    RAISE NOTICE 'Test completed and cleaned up';
END $$;
*/

-- 4. Summary of changes
SELECT 
    'NEW USER SIGNUP BEHAVIOR' as change_type,
    'Users now get FREE tier access immediately' as description,
    'Trial must be explicitly started from /start-trial page' as trial_access,
    'No more automatic 7-day Ultra trials' as important_note;

-- ===============================================================
-- VERIFICATION QUERIES
-- ===============================================================

-- Check recent users and their signup behavior
SELECT 
    email,
    subscription_status,
    subscription_tier,
    trial_ends_at,
    has_used_trial,
    created_at,
    CASE 
        WHEN subscription_status = 'none' AND trial_ends_at IS NULL THEN '✅ FREE TIER ACCESS'
        WHEN subscription_status = 'trial' AND trial_ends_at > NOW() THEN '🔥 ACTIVE TRIAL'
        WHEN subscription_status = 'trial' AND trial_ends_at <= NOW() THEN '⏰ EXPIRED TRIAL'
        ELSE '❓ OTHER STATUS'
    END as access_level
FROM profiles 
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC 
LIMIT 10;

-- ===============================================================
-- NOTES
-- ===============================================================
-- ✅ New users get immediate FREE tier access with 5 features:
--    - Core AI Chatbot
--    - 100 Conversations/month  
--    - Basic Knowledge Base (500 words)
--    - 1 Knowledge Upload
--    - Website Embedding
--
-- ✅ Trial activation is now EXPLICIT:
--    - Users must visit /start-trial page
--    - 7-day Ultra trial with 6 premium features
--    - After trial expires, falls back to FREE tier
--
-- ✅ This encourages engagement while providing immediate value!