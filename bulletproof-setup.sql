-- ================================================================
-- BULLETPROOF TRULYBOT DATABASE SETUP
-- Guaranteed to work with any Supabase project
-- Run this ONCE in Supabase SQL Editor
-- ================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- 1. CLEAN SLATE - DROP EVERYTHING SAFELY
-- ================================================================

-- Drop triggers first (prevents cascading issues)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS handle_updated_at_workspaces ON public.workspaces CASCADE;
DROP TRIGGER IF EXISTS handle_updated_at_profiles ON public.profiles CASCADE;
DROP TRIGGER IF EXISTS handle_updated_at_usage_counters ON public.usage_counters CASCADE;
DROP TRIGGER IF EXISTS handle_updated_at_leads ON public.leads CASCADE;

-- Drop all functions (prevents dependency issues)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_missing_profiles() CASCADE;
DROP FUNCTION IF EXISTS public.get_or_create_profile(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.ensure_user_workspace(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- Drop all tables in reverse dependency order (CASCADE removes all dependencies)
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.usage_counters CASCADE; 
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.workspaces CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;

-- Also drop any leftover sequences or indexes
DROP SEQUENCE IF EXISTS public.workspaces_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.profiles_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.usage_counters_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.leads_id_seq CASCADE;

-- Policies will be dropped automatically when tables are dropped

-- ================================================================
-- 2. CREATE UTILITY FUNCTIONS FIRST
-- ================================================================

-- Updated at timestamp function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 3. CREATE WORKSPACES TABLE
-- ================================================================

CREATE TABLE public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'My Workspace',
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT workspaces_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT workspaces_slug_format CHECK (slug ~ '^[a-z0-9\-]+$')
);

-- Workspace indexes
CREATE INDEX IF NOT EXISTS workspaces_slug_idx ON public.workspaces(slug);
CREATE INDEX IF NOT EXISTS workspaces_created_at_idx ON public.workspaces(created_at);

-- Workspace updated_at trigger
CREATE TRIGGER handle_updated_at_workspaces
    BEFORE UPDATE ON public.workspaces
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ================================================================
-- 4. CREATE PROFILES TABLE
-- ================================================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'owner',
    
    -- Chatbot customization
    chatbot_name TEXT NOT NULL DEFAULT 'Assistant',
    welcome_message TEXT NOT NULL DEFAULT 'Hello! How can I help you today?',
    accent_color TEXT NOT NULL DEFAULT '#2563EB',
    
    -- Subscription management
    trial_ends_at TIMESTAMPTZ,
    subscription_status TEXT NOT NULL DEFAULT 'trial',
    subscription_tier TEXT NOT NULL DEFAULT 'ultra',
    subscription_ends_at TIMESTAMPTZ,
    payment_id TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT profiles_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT profiles_role_check CHECK (role IN ('owner', 'admin', 'member')),
    CONSTRAINT profiles_subscription_status_check CHECK (
        subscription_status IN ('trial', 'active', 'cancelled', 'expired', 'none')
    ),
    CONSTRAINT profiles_subscription_tier_check CHECK (
        subscription_tier IN ('free', 'basic', 'pro', 'ultra')
    ),
    CONSTRAINT profiles_accent_color_check CHECK (accent_color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Profile indexes
CREATE INDEX IF NOT EXISTS profiles_workspace_id_idx ON public.profiles(workspace_id);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_trial_ends_at_idx ON public.profiles(trial_ends_at);
CREATE INDEX IF NOT EXISTS profiles_subscription_status_idx ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles(created_at);

-- Profile updated_at trigger
CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ================================================================
-- 5. CREATE USAGE COUNTERS TABLE
-- ================================================================

CREATE TABLE public.usage_counters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- Format: 'YYYY-MM'
    
    -- Usage metrics
    monthly_uploads INTEGER NOT NULL DEFAULT 0,
    monthly_conversations INTEGER NOT NULL DEFAULT 0,
    monthly_words INTEGER NOT NULL DEFAULT 0,
    total_stored_words INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT usage_counters_month_format CHECK (month ~ '^\d{4}-\d{2}$'),
    CONSTRAINT usage_counters_positive_values CHECK (
        monthly_uploads >= 0 AND 
        monthly_conversations >= 0 AND 
        monthly_words >= 0 AND 
        total_stored_words >= 0
    ),
    
    -- Unique constraint
    UNIQUE(user_id, workspace_id, month)
);

-- Usage counters indexes
CREATE INDEX IF NOT EXISTS usage_counters_user_id_idx ON public.usage_counters(user_id);
CREATE INDEX IF NOT EXISTS usage_counters_workspace_id_idx ON public.usage_counters(workspace_id);
CREATE INDEX IF NOT EXISTS usage_counters_month_idx ON public.usage_counters(month);
CREATE INDEX IF NOT EXISTS usage_counters_created_at_idx ON public.usage_counters(created_at);

-- Usage counters updated_at trigger
CREATE TRIGGER handle_updated_at_usage_counters
    BEFORE UPDATE ON public.usage_counters
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ================================================================
-- 6. CREATE LEADS TABLE
-- ================================================================

CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    
    -- Lead information
    name TEXT,
    email TEXT,
    phone TEXT,
    message TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Lead status
    status TEXT NOT NULL DEFAULT 'new',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT leads_email_format CHECK (
        email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    ),
    CONSTRAINT leads_status_check CHECK (
        status IN ('new', 'contacted', 'qualified', 'converted', 'closed')
    )
);

-- Leads indexes
CREATE INDEX IF NOT EXISTS leads_workspace_id_idx ON public.leads(workspace_id);
CREATE INDEX IF NOT EXISTS leads_email_idx ON public.leads(email);
CREATE INDEX IF NOT EXISTS leads_status_idx ON public.leads(status);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON public.leads(created_at);

-- Leads updated_at trigger
CREATE TRIGGER handle_updated_at_leads
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ================================================================
-- 7. ENABLE ROW LEVEL SECURITY
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- 8. CREATE ROW LEVEL SECURITY POLICIES
-- ================================================================

-- Workspace policies
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

-- Profile policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- Usage counter policies
CREATE POLICY "Users can view their own usage counters" ON public.usage_counters
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own usage counters" ON public.usage_counters
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own usage counters" ON public.usage_counters
    FOR UPDATE USING (user_id = auth.uid());

-- Lead policies
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

CREATE POLICY "Users can update leads in their workspace" ON public.leads
    FOR UPDATE USING (
        workspace_id IN (
            SELECT workspace_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- ================================================================
-- 9. CREATE AUTOMATIC PROFILE CREATION SYSTEM
-- ================================================================

-- Function to handle new user registration
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
        COALESCE(user_name, 'workspace') || '-' || substr(NEW.id::text, 1, 8),
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
    
    -- Create user profile
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

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- 10. CREATE PROFILE RECOVERY FUNCTION
-- ================================================================

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
                missing_user.raw_user_meta_data->>'name',
                split_part(missing_user.email, '@', 1)
            );
            
            -- Generate workspace name
            workspace_name := COALESCE(user_name || '''s Workspace', 'My Workspace');
            
            -- Generate unique workspace slug
            workspace_slug := LOWER(REGEXP_REPLACE(
                COALESCE(user_name, 'workspace') || '-' || substr(missing_user.id::text, 1, 8),
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
            
            -- Create profile
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
            ) VALUES (
                missing_user.id,
                new_workspace_id,
                missing_user.email,
                user_name,
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
            
            -- Return success
            user_id := missing_user.id;
            email := missing_user.email;
            action := 'profile_created';
            RETURN NEXT;
            
        EXCEPTION
            WHEN OTHERS THEN
                -- Return error info
                user_id := missing_user.id;
                email := missing_user.email;
                action := 'error: ' || SQLERRM;
                RETURN NEXT;
        END;
    END LOOP;
    
    RETURN;
END;
$$;

-- ================================================================
-- 11. GRANT PERMISSIONS
-- ================================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_missing_profiles() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO authenticated, service_role;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE ON public.workspaces TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.usage_counters TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated, service_role;

-- ================================================================
-- 12. FINAL VERIFICATION AND CLEANUP
-- ================================================================

-- Create any missing profiles for existing users (safe to run)
SELECT * FROM public.create_missing_profiles();

-- Final verification
DO $$
DECLARE
    table_count INTEGER;
    function_count INTEGER;
    trigger_count INTEGER;
BEGIN
    -- Count tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('workspaces', 'profiles', 'usage_counters', 'leads');
    
    -- Count functions
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN ('handle_new_user', 'create_missing_profiles', 'handle_updated_at');
    
    -- Count triggers
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public'
    AND trigger_name = 'on_auth_user_created';
    
    -- Report results
    RAISE NOTICE '=== SETUP VERIFICATION ===';
    RAISE NOTICE 'Tables created: % of 4 expected', table_count;
    RAISE NOTICE 'Functions created: % of 3 expected', function_count;
    RAISE NOTICE 'Triggers created: % of 1 expected', trigger_count;
    
    IF table_count = 4 AND function_count = 3 AND trigger_count = 1 THEN
        RAISE NOTICE '✅ DATABASE SETUP COMPLETED SUCCESSFULLY!';
        RAISE NOTICE '🎉 Your TrulyBot database is ready to use!';
    ELSE
        RAISE WARNING '⚠️  Some components may not have been created properly.';
    END IF;
END $$;

-- Show final status
SELECT 
    'workspaces' as table_name, 
    COUNT(*) as row_count,
    'Ready for use' as status
FROM public.workspaces
UNION ALL
SELECT 
    'profiles' as table_name, 
    COUNT(*) as row_count,
    'Ready for use' as status
FROM public.profiles
UNION ALL
SELECT 
    'usage_counters' as table_name, 
    COUNT(*) as row_count,
    'Ready for use' as status
FROM public.usage_counters
UNION ALL
SELECT 
    'leads' as table_name, 
    COUNT(*) as row_count,
    'Ready for use' as status
FROM public.leads
ORDER BY table_name;