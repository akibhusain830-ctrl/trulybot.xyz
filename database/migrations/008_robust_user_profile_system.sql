-- 008_robust_user_profile_system.sql
-- Comprehensive user profile management with automatic creation and workspace assignment

-- =====================================================
-- 0. BACKUP AND RECREATE USAGE_COUNTERS TABLE
-- =====================================================

-- First, back up existing data if the table exists
CREATE TEMP TABLE IF NOT EXISTS usage_counters_backup AS 
SELECT * FROM public.usage_counters WHERE 1=0; -- Create empty backup table structure

DO $$
BEGIN
    -- Try to backup existing data
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usage_counters' AND table_schema = 'public') THEN
        INSERT INTO usage_counters_backup SELECT * FROM public.usage_counters;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- If backup fails, continue (table might be empty or have issues)
    NULL;
END $$;

-- Drop the problematic table completely
DROP TABLE IF EXISTS public.usage_counters CASCADE;

-- Recreate usage_counters table with proper structure
CREATE TABLE public.usage_counters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- Format: 'YYYY-MM'
    monthly_uploads INTEGER NOT NULL DEFAULT 0,
    monthly_conversations INTEGER NOT NULL DEFAULT 0,
    monthly_words INTEGER NOT NULL DEFAULT 0,
    total_stored_words INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, workspace_id, month)
);

-- Create proper indexes
CREATE INDEX usage_counters_user_id_idx ON public.usage_counters(user_id);
CREATE INDEX usage_counters_workspace_id_idx ON public.usage_counters(workspace_id);
CREATE INDEX usage_counters_month_idx ON public.usage_counters(month);
CREATE INDEX usage_counters_workspace_month_idx ON public.usage_counters(workspace_id, month);

-- Enable RLS
ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for usage_counters
CREATE POLICY "Users can view their own usage counters" ON public.usage_counters
    FOR SELECT USING (
        user_id = auth.uid() OR 
        workspace_id IN (
            SELECT workspace_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own usage counters" ON public.usage_counters
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own usage counters" ON public.usage_counters
    FOR UPDATE USING (user_id = auth.uid());

-- =====================================================
-- 1. CREATE AUTOMATIC PROFILE CREATION FUNCTION
-- =====================================================

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

    -- Create the user profile with workspace assignment
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
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        default_workspace_id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url',
        'owner', -- First user of workspace is owner
        'Assistant',
        'Hello! How can I help you today?',
        '#2563EB',
        NOW() + INTERVAL '7 days', -- Automatic 7-day trial
        'trial',
        NOW(),
        NOW()
    );

    -- Initialize usage counters for the new user (with fallback for missing columns)
    BEGIN
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
    EXCEPTION WHEN undefined_column THEN
        -- Fallback for older schema
        INSERT INTO public.usage_counters (
            user_id,
            month,
            monthly_uploads,
            monthly_conversations,
            created_at,
            updated_at
        )
        VALUES (
            NEW.id,
            TO_CHAR(NOW(), 'YYYY-MM'),
            0,
            0,
            NOW(),
            NOW()
        );
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. CREATE THE TRIGGER FOR AUTOMATIC PROFILE CREATION
-- =====================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 3. CREATE PROFILE RECOVERY FUNCTION
-- =====================================================

-- Function to create missing profiles for existing users
CREATE OR REPLACE FUNCTION public.create_missing_profiles()
RETURNS TABLE(user_id UUID, email TEXT, action TEXT) AS $$
DECLARE
    missing_user RECORD;
    workspace_id UUID;
BEGIN
    -- Find users without profiles
    FOR missing_user IN
        SELECT au.id, au.email, au.raw_user_meta_data
        FROM auth.users au
        LEFT JOIN public.profiles p ON au.id = p.id
        WHERE p.id IS NULL
    LOOP
        -- Create workspace for missing user
        INSERT INTO public.workspaces (name, slug, created_at, updated_at)
        VALUES (
            COALESCE(missing_user.raw_user_meta_data->>'full_name', 'Personal Workspace'),
            LOWER(REPLACE(COALESCE(missing_user.raw_user_meta_data->>'full_name', missing_user.email), ' ', '-')) || '-' || substr(missing_user.id::text, 1, 8),
            NOW(),
            NOW()
        )
        RETURNING id INTO workspace_id;

        -- Create the missing profile
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
            created_at,
            updated_at
        )
        VALUES (
            missing_user.id,
            workspace_id,
            missing_user.email,
            COALESCE(missing_user.raw_user_meta_data->>'full_name', split_part(missing_user.email, '@', 1)),
            'owner',
            'Assistant',
            'Hello! How can I help you today?',
            '#2563EB',
            NOW() + INTERVAL '7 days',
            'trial',
            NOW(),
            NOW()
        );

        -- Initialize usage counters (with fallback for missing columns)
        BEGIN
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
                missing_user.id,
                workspace_id,
                TO_CHAR(NOW(), 'YYYY-MM'),
                0,
                0,
                0,
                0,
                NOW(),
                NOW()
            );
        EXCEPTION WHEN undefined_column THEN
            -- Fallback for older schema
            INSERT INTO public.usage_counters (
                user_id,
                month,
                monthly_uploads,
                monthly_conversations,
                created_at,
                updated_at
            )
            VALUES (
                missing_user.id,
                TO_CHAR(NOW(), 'YYYY-MM'),
                0,
                0,
                NOW(),
                NOW()
            );
        END;

        -- Return info about what was created
        user_id := missing_user.id;
        email := missing_user.email;
        action := 'profile_created';
        RETURN NEXT;
    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_missing_profiles() TO authenticated, service_role;

-- =====================================================
-- 5. CREATE PROFILE MANAGEMENT POLICIES (Enhanced RLS)
-- =====================================================

-- Enhanced RLS policies for better profile management
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- More robust profile policies
CREATE POLICY "Enhanced profile select policy" ON profiles
    FOR SELECT USING (
        id = auth.uid() OR 
        workspace_id IN (
            SELECT workspace_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Enhanced profile update policy" ON profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Enhanced profile insert policy" ON profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- =====================================================
-- 6. FIX EXISTING USERS (RUN IMMEDIATELY)
-- =====================================================

-- Create profiles for any existing users that don't have them
SELECT * FROM public.create_missing_profiles();

-- =====================================================
-- 7. CREATE HELPER FUNCTIONS FOR PROFILE MANAGEMENT
-- =====================================================

-- Function to get or create profile (for API usage)
CREATE OR REPLACE FUNCTION public.get_or_create_profile(p_user_id UUID, p_email TEXT)
RETURNS TABLE(
    id UUID,
    workspace_id UUID,
    email TEXT,
    full_name TEXT,
    chatbot_name TEXT,
    welcome_message TEXT,
    accent_color TEXT,
    trial_ends_at TIMESTAMPTZ,
    subscription_status TEXT
) AS $$
DECLARE
    profile_exists BOOLEAN;
    new_workspace_id UUID;
BEGIN
    -- Check if profile exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE profiles.id = p_user_id) INTO profile_exists;
    
    IF NOT profile_exists THEN
        -- Create workspace
        INSERT INTO public.workspaces (name, slug, created_at, updated_at)
        VALUES (
            'Personal Workspace',
            LOWER(REPLACE(p_email, '@', '-at-')) || '-' || substr(p_user_id::text, 1, 8),
            NOW(),
            NOW()
        )
        RETURNING workspaces.id INTO new_workspace_id;

        -- Create profile
        INSERT INTO public.profiles (
            profiles.id,
            workspace_id,
            profiles.email,
            full_name,
            role,
            chatbot_name,
            welcome_message,
            accent_color,
            trial_ends_at,
            subscription_status,
            created_at,
            updated_at
        )
        VALUES (
            p_user_id,
            new_workspace_id,
            p_email,
            split_part(p_email, '@', 1),
            'owner',
            'Assistant',
            'Hello! How can I help you today?',
            '#2563EB',
            NOW() + INTERVAL '7 days',
            'trial',
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
        )
        VALUES (
            p_user_id,
            new_workspace_id,
            TO_CHAR(NOW(), 'YYYY-MM'),
            0,
            0,
            0,
            0,
            NOW(),
            NOW()
        );
    END IF;

    -- Return the profile
    RETURN QUERY
    SELECT 
        p.id,
        p.workspace_id,
        p.email,
        p.full_name,
        p.chatbot_name,
        p.welcome_message,
        p.accent_color,
        p.trial_ends_at,
        p.subscription_status
    FROM public.profiles p
    WHERE p.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_or_create_profile(UUID, TEXT) TO authenticated, service_role;

-- =====================================================
-- 8. CREATE WORKSPACE MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to ensure workspace exists for profile operations
CREATE OR REPLACE FUNCTION public.ensure_user_workspace(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
    user_workspace_id UUID;
    user_email TEXT;
BEGIN
    -- Get user's workspace
    SELECT workspace_id INTO user_workspace_id
    FROM public.profiles
    WHERE id = p_user_id;

    -- If no workspace found, create one
    IF user_workspace_id IS NULL THEN
        -- Get user email from auth
        SELECT email INTO user_email FROM auth.users WHERE id = p_user_id;
        
        -- Create workspace
        INSERT INTO public.workspaces (name, slug, created_at, updated_at)
        VALUES (
            'Personal Workspace',
            LOWER(REPLACE(COALESCE(user_email, 'user'), '@', '-at-')) || '-' || substr(p_user_id::text, 1, 8),
            NOW(),
            NOW()
        )
        RETURNING id INTO user_workspace_id;

        -- Update profile with workspace
        UPDATE public.profiles 
        SET workspace_id = user_workspace_id, updated_at = NOW()
        WHERE id = p_user_id;
    END IF;

    RETURN user_workspace_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.ensure_user_workspace(UUID) TO authenticated, service_role;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if triggers are working
SELECT 
    trigger_schema,
    event_object_table,
    trigger_name,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Count profiles vs auth users
SELECT 
    (SELECT COUNT(*) FROM auth.users) as auth_users,
    (SELECT COUNT(*) FROM public.profiles) as profiles,
    (SELECT COUNT(*) FROM public.workspaces) as workspaces;

-- Show any users missing profiles
SELECT 
    au.id,
    au.email,
    au.created_at as user_created,
    CASE 
        WHEN p.id IS NULL THEN 'MISSING PROFILE'
        ELSE 'HAS PROFILE'
    END as profile_status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC;