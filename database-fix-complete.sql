-- Complete Database Fix for TrulyBot Trial System
-- Run this in Supabase SQL Editor to fix all schema issues

-- 1. Add missing has_used_trial column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_used_trial BOOLEAN DEFAULT FALSE;

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_has_used_trial ON profiles(has_used_trial);

-- 3. Update existing users who have trials
UPDATE profiles SET has_used_trial = TRUE WHERE trial_ends_at IS NOT NULL;

-- 4. Fix workspace slug uniqueness issues by adding a UUID suffix function
CREATE OR REPLACE FUNCTION generate_unique_workspace_slug(base_slug TEXT)
RETURNS TEXT AS $$
DECLARE
    final_slug TEXT;
    counter INTEGER := 1;
BEGIN
    final_slug := base_slug;
    
    -- Keep trying until we find a unique slug
    WHILE EXISTS (SELECT 1 FROM workspaces WHERE slug = final_slug) LOOP
        final_slug := base_slug || '-' || counter;
        counter := counter + 1;
        
        -- Safety break after 100 attempts
        IF counter > 100 THEN
            final_slug := base_slug || '-' || substr(gen_random_uuid()::text, 1, 8);
            EXIT;
        END IF;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- 5. Create or replace the user profile creation function with better error handling
CREATE OR REPLACE FUNCTION create_user_profile_and_workspace(
    user_id UUID,
    user_email TEXT,
    user_name TEXT DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, workspace_id UUID, profile_id UUID, error_message TEXT) AS $$
DECLARE
    new_workspace_id UUID;
    final_user_name TEXT;
    workspace_slug TEXT;
    base_slug TEXT;
BEGIN
    -- Generate user name
    final_user_name := COALESCE(user_name, split_part(user_email, '@', 1), 'User');
    
    -- Generate base slug
    base_slug := LOWER(REGEXP_REPLACE(final_user_name || '-' || substr(user_id::text, 1, 8), '[^a-z0-9]+', '-', 'g'));
    
    -- Get unique slug
    workspace_slug := generate_unique_workspace_slug(base_slug);
    
    -- Create workspace
    INSERT INTO workspaces (name, slug, created_at, updated_at)
    VALUES (
        final_user_name || '''s Workspace',
        workspace_slug,
        NOW(),
        NOW()
    )
    RETURNING id INTO new_workspace_id;
    
    -- Create profile
    INSERT INTO profiles (
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
        user_id,
        new_workspace_id,
        user_email,
        final_user_name,
        'owner',
        'Assistant',
        'Hello! How can I help you today?',
        '#2563EB',
        NOW() + INTERVAL '7 days',
        'trial',
        'ultra',
        FALSE,
        NOW(),
        NOW()
    );
    
    -- Initialize usage counters
    INSERT INTO usage_counters (
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
        user_id,
        new_workspace_id,
        TO_CHAR(NOW(), 'YYYY-MM'),
        0,
        0,
        0,
        0,
        NOW(),
        NOW()
    );
    
    -- Return success
    RETURN QUERY SELECT TRUE, new_workspace_id, user_id, NULL::TEXT;
    
EXCEPTION WHEN OTHERS THEN
    -- Return error
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::UUID, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant necessary permissions
GRANT EXECUTE ON FUNCTION generate_unique_workspace_slug(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_user_profile_and_workspace(UUID, TEXT, TEXT) TO authenticated, service_role;

-- 7. Verify the fix by checking if all columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
    AND column_name IN ('has_used_trial', 'trial_ends_at', 'subscription_status')
ORDER BY column_name;

-- 8. Test the unique slug function
SELECT generate_unique_workspace_slug('test-user');

-- Success message
SELECT 'Database schema fixed successfully! All trial functionality should now work.' as message;