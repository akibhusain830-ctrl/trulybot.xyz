-- COMPLETE DATABASE RESET AND SETUP
-- Run this in Supabase SQL Editor to start fresh

-- =====================================================
-- 1. DROP ALL EXISTING TABLES AND FUNCTIONS
-- =====================================================

-- Drop all triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop all functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_missing_profiles() CASCADE;
DROP FUNCTION IF EXISTS public.get_or_create_profile(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.ensure_user_workspace(UUID) CASCADE;

-- Drop all tables (order matters due to foreign keys)
DROP TABLE IF EXISTS public.usage_counters CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.workspaces CASCADE;

-- =====================================================
-- 2. CREATE FRESH WORKSPACES TABLE
-- =====================================================

CREATE TABLE public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- RLS policies will be added after profiles table exists

-- =====================================================
-- 3. CREATE PROFILES TABLE
-- =====================================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'owner',
    chatbot_name TEXT NOT NULL DEFAULT 'Assistant',
    welcome_message TEXT NOT NULL DEFAULT 'Hello! How can I help you today?',
    accent_color TEXT NOT NULL DEFAULT '#2563EB',
    trial_ends_at TIMESTAMPTZ,
    subscription_status TEXT NOT NULL DEFAULT 'trial',
    subscription_tier TEXT NOT NULL DEFAULT 'ultra',
    subscription_ends_at TIMESTAMPTZ,
    payment_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX profiles_workspace_id_idx ON public.profiles(workspace_id);
CREATE INDEX profiles_trial_ends_at_idx ON public.profiles(trial_ends_at);
CREATE INDEX profiles_subscription_status_idx ON public.profiles(subscription_status);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- =====================================================
-- 4. CREATE USAGE COUNTERS TABLE
-- =====================================================

CREATE TABLE public.usage_counters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
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

-- Create indexes
CREATE INDEX usage_counters_user_id_idx ON public.usage_counters(user_id);
CREATE INDEX usage_counters_workspace_id_idx ON public.usage_counters(workspace_id);
CREATE INDEX usage_counters_month_idx ON public.usage_counters(month);

-- Enable RLS
ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own usage counters" ON public.usage_counters
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own usage counters" ON public.usage_counters
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own usage counters" ON public.usage_counters
    FOR UPDATE USING (user_id = auth.uid());

-- =====================================================
-- 5. CREATE LEADS TABLE (IF NEEDED)
-- =====================================================

CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    phone TEXT,
    message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX leads_workspace_id_idx ON public.leads(workspace_id);
CREATE INDEX leads_created_at_idx ON public.leads(created_at);
CREATE INDEX leads_email_idx ON public.leads(email);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view leads in their workspace" ON public.leads
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert leads in their workspace" ON public.leads
    FOR INSERT WITH CHECK (
        workspace_id IN (
            SELECT workspace_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- =====================================================
-- 6. CREATE AUTOMATIC PROFILE CREATION FUNCTION
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
        NOW() + INTERVAL '7 days', -- Automatic 7-day trial
        'trial',
        'ultra',
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

-- =====================================================
-- 7. CREATE THE TRIGGER FOR AUTOMATIC PROFILE CREATION
-- =====================================================

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 8. CREATE PROFILE RECOVERY FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_missing_profiles()
RETURNS TABLE(user_id UUID, email TEXT, action TEXT) AS $$
DECLARE
    missing_user RECORD;
    workspace_id UUID;
BEGIN
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
            subscription_tier,
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
            'ultra',
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
-- 9. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_missing_profiles() TO authenticated, service_role;

-- =====================================================
-- 10. CREATE PROFILES FOR ANY EXISTING USERS (OPTIONAL)
-- =====================================================

-- Only run this if you have existing auth.users
-- SELECT * FROM public.create_missing_profiles();

-- =====================================================
-- 10. ADD WORKSPACE RLS POLICIES AFTER PROFILES EXISTS
-- =====================================================

-- Now add the workspace policies that reference profiles
CREATE POLICY "Users can view their own workspace" ON public.workspaces
    FOR SELECT USING (
        id IN (
            SELECT workspace_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own workspace" ON public.workspaces
    FOR UPDATE USING (
        id IN (
            SELECT workspace_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- =====================================================
-- 11. VERIFICATION
-- =====================================================

-- Check tables exist
SELECT 'workspaces' as table_name, COUNT(*) as count FROM public.workspaces
UNION ALL
SELECT 'profiles' as table_name, COUNT(*) as count FROM public.profiles
UNION ALL
SELECT 'usage_counters' as table_name, COUNT(*) as count FROM public.usage_counters
UNION ALL
SELECT 'leads' as table_name, COUNT(*) as count FROM public.leads;

-- Check trigger exists
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Show setup completion
SELECT 
    'Database setup completed successfully!' as status,
    NOW() as completed_at;