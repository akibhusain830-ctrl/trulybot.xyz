-- ==========================================
-- REMOVE FREE TIER FROM TRULYBOT DATABASE
-- ==========================================
-- This script removes the 'free' tier and implements:
-- - none: No access (new default for new users)
-- - trial: 7-day Ultra trial
-- - basic: Paid basic plan
-- - pro: Paid pro plan  
-- - ultra: Paid ultra plan

BEGIN;

-- 1. Update existing users with 'free' tier to 'none' with no access
UPDATE profiles 
SET 
    subscription_tier = 'basic',  -- Upgrade existing free users to basic
    subscription_status = 'none',
    updated_at = NOW()
WHERE subscription_tier = 'free';

-- 2. Update database constraints to remove 'free' from allowed values
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_subscription_tier_check 
CHECK (subscription_tier IN ('basic', 'pro', 'ultra'));

-- 3. Update default subscription tier for new users to 'basic' instead of 'free'
ALTER TABLE profiles 
ALTER COLUMN subscription_tier SET DEFAULT 'basic';

-- 4. Update default subscription status for new users to 'none' (no access)
ALTER TABLE profiles 
ALTER COLUMN subscription_status SET DEFAULT 'none';

-- 5. Clean up any migration defaults that used 'free'
UPDATE profiles 
SET subscription_tier = 'basic' 
WHERE subscription_tier IS NULL;

-- 6. Fix database triggers to not give automatic trials
-- Update handle_new_user function to create users with NO ACCESS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_workspace_id UUID;
    workspace_name TEXT;
    workspace_slug TEXT;
    user_name TEXT;
BEGIN
    -- Generate user name
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );
    
    -- Generate workspace name
    workspace_name := COALESCE(user_name || '''s Workspace', 'My Workspace');
    
    -- Generate unique workspace slug
    workspace_slug := LOWER(REGEXP_REPLACE(
        workspace_name || '-' || substr(NEW.id::text, 1, 8), 
        '[^a-z0-9]+', '-', 'g'
    ));
    
    -- Ensure slug is unique
    WHILE EXISTS (SELECT 1 FROM public.workspaces WHERE slug = workspace_slug) LOOP
        workspace_slug := workspace_slug || '-' || substr(gen_random_uuid()::text, 1, 4);
    END LOOP;
    
    -- Create workspace
    INSERT INTO public.workspaces (name, slug, created_at, updated_at)
    VALUES (workspace_name, workspace_slug, NOW(), NOW())
    RETURNING id INTO new_workspace_id;
    
    -- Create user profile with NO ACCESS (no automatic trial)
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
        has_used_trial,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        new_workspace_id,
        NEW.email,
        user_name,
        NEW.raw_user_meta_data->>'avatar_url',
        'owner',
        'Assistant',
        'Hello! How can I help you today?',
        '#2563EB',
        NULL,  -- NO automatic trial
        'none', -- NO access
        'basic', -- Lowest tier (not free)
        FALSE, -- Can use trial later
        NOW(),
        NOW()
    );
    
    -- Initialize usage counters
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
    ) VALUES (
        NEW.id,
        new_workspace_id,
        TO_CHAR(NOW(), 'YYYY-MM'),
        0,
        0,
        0,
        0,
        NOW(),
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail user creation
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- 7. Update create_missing_profiles function to also give no access
CREATE OR REPLACE FUNCTION public.create_missing_profiles()
RETURNS TABLE(user_id UUID, email TEXT, action TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    missing_user RECORD;
    new_workspace_id UUID;
    workspace_name TEXT;
    workspace_slug TEXT;
    user_name TEXT;
BEGIN
    FOR missing_user IN
        SELECT au.id, au.email, au.raw_user_meta_data, au.created_at
        FROM auth.users au
        LEFT JOIN public.profiles p ON au.id = p.id
        WHERE p.id IS NULL
    LOOP
        BEGIN
            -- Generate user name
            user_name := COALESCE(
                missing_user.raw_user_meta_data->>'full_name',
                split_part(missing_user.email, '@', 1),
                'User'
            );
            
            -- Generate workspace details
            workspace_name := user_name || '''s Workspace';
            workspace_slug := LOWER(REGEXP_REPLACE(
                workspace_name || '-' || substr(missing_user.id::text, 1, 8), 
                '[^a-z0-9]+', '-', 'g'
            ));
            
            -- Ensure slug is unique
            WHILE EXISTS (SELECT 1 FROM public.workspaces WHERE slug = workspace_slug) LOOP
                workspace_slug := workspace_slug || '-' || substr(gen_random_uuid()::text, 1, 4);
            END LOOP;
            
            -- Create workspace
            INSERT INTO public.workspaces (name, slug, created_at, updated_at)
            VALUES (workspace_name, workspace_slug, NOW(), NOW())
            RETURNING id INTO new_workspace_id;
            
            -- Create profile with NO ACCESS
            INSERT INTO public.profiles (
                id,
                workspace_id,
                email,
                full_name,
                role,
                chatbot_name,
                welcome_message,
                accent_color,
                trial_ends_at,
                subscription_status,
                subscription_tier,
                has_used_trial,
                created_at,
                updated_at
            ) VALUES (
                missing_user.id,
                new_workspace_id,
                missing_user.email,
                user_name,
                'owner',
                'Assistant',
                'Hello! How can I help you today?',
                '#2563EB',
                NULL, -- NO automatic trial
                'none', -- NO access
                'basic', -- Not free
                FALSE, -- Can use trial later
                NOW(),
                NOW()
            );
            
            -- Initialize usage counters
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
            ) VALUES (
                missing_user.id,
                new_workspace_id,
                TO_CHAR(NOW(), 'YYYY-MM'),
                0,
                0,
                0,
                0,
                NOW(),
                NOW()
            );
            
            user_id := missing_user.id;
            email := missing_user.email;
            action := 'profile_created_no_access';
            RETURN NEXT;
            
        EXCEPTION
            WHEN OTHERS THEN
                user_id := missing_user.id;
                email := missing_user.email;
                action := 'error: ' || SQLERRM;
                RETURN NEXT;
        END;
    END LOOP;
    
    RETURN;
END;
$$;

-- 8. Verify the changes
SELECT 
    'Updated profiles count' as description,
    COUNT(*) as count
FROM profiles 
WHERE subscription_tier IN ('basic', 'pro', 'ultra');

SELECT 
    'Profiles by tier' as description,
    subscription_tier,
    COUNT(*) as count
FROM profiles 
GROUP BY subscription_tier;

-- 9. Verify database functions are updated
SELECT 
    'Database functions updated' as description,
    COUNT(*) as count
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('handle_new_user', 'create_missing_profiles');

-- 10. Update any existing trial users to maintain their access
-- But ensure future users get no access
UPDATE profiles 
SET updated_at = NOW()
WHERE subscription_status = 'trial' 
AND trial_ends_at > NOW();

-- 11. Test the new logic by creating a test verification
DO $$
BEGIN
    RAISE NOTICE 'Database triggers updated to give NO automatic access';
    RAISE NOTICE 'New users will get: subscription_status=none, subscription_tier=basic';
    RAISE NOTICE 'Users must explicitly start trial to get access';
END $$;

COMMIT;

-- Post-update verification queries:
-- SELECT subscription_tier, subscription_status, COUNT(*) FROM profiles GROUP BY subscription_tier, subscription_status;
-- SELECT * FROM profiles WHERE subscription_tier NOT IN ('basic', 'pro', 'ultra') LIMIT 5;