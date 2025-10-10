-- TrulyBot Store Integrations Database Schema
-- Run this in Supabase SQL Editor

-- 1. Create store_integrations table
CREATE TABLE IF NOT EXISTS public.store_integrations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    workspace_id uuid NOT NULL,
    platform text NOT NULL CHECK (platform IN ('woocommerce', 'shopify')),
    
    -- Store information
    store_url text NOT NULL,
    store_name text NOT NULL,
    store_email text,
    
    -- Platform-specific fields
    -- WooCommerce
    api_key_encrypted text,
    api_secret_encrypted text,
    permissions text,
    
    -- Shopify
    access_token_encrypted text,
    shop_domain text,
    
    -- Common fields
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disconnected', 'error')),
    config jsonb DEFAULT '{}',
    
    -- Timestamps
    connected_at timestamptz DEFAULT now(),
    disconnected_at timestamptz,
    last_sync_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Constraints
    UNIQUE(user_id, platform, store_url),
    UNIQUE(user_id, platform, shop_domain) -- For Shopify
);

-- 2. Create user_activities table for integration logs
CREATE TABLE IF NOT EXISTS public.user_activities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    activity_type text NOT NULL,
    description text NOT NULL,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_store_integrations_user_platform 
ON public.store_integrations(user_id, platform);

CREATE INDEX IF NOT EXISTS idx_store_integrations_status 
ON public.store_integrations(status);

CREATE INDEX IF NOT EXISTS idx_store_integrations_workspace 
ON public.store_integrations(workspace_id);

CREATE INDEX IF NOT EXISTS idx_user_activities_user_type 
ON public.user_activities(user_id, activity_type);

CREATE INDEX IF NOT EXISTS idx_user_activities_created 
ON public.user_activities(created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.store_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for store_integrations
CREATE POLICY "Users can view their own integrations" ON public.store_integrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integrations" ON public.store_integrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations" ON public.store_integrations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations" ON public.store_integrations
    FOR DELETE USING (auth.uid() = user_id);

-- 6. Create RLS policies for user_activities
CREATE POLICY "Users can view their own activities" ON public.user_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" ON public.user_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create trigger for updated_at
CREATE TRIGGER update_store_integrations_updated_at 
    BEFORE UPDATE ON public.store_integrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Add missing columns to profiles table if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS chatbot_logo_url text,
ADD COLUMN IF NOT EXISTS chatbot_theme text DEFAULT 'light',
ADD COLUMN IF NOT EXISTS custom_css text;

-- 10. Create integration_stats view for dashboard
CREATE OR REPLACE VIEW public.integration_stats AS
SELECT 
    user_id,
    COUNT(*) as total_integrations,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_integrations,
    COUNT(CASE WHEN platform = 'woocommerce' THEN 1 END) as woocommerce_stores,
    COUNT(CASE WHEN platform = 'shopify' THEN 1 END) as shopify_stores,
    MIN(connected_at) as first_integration_date,
    MAX(last_sync_at) as last_sync_date
FROM public.store_integrations
GROUP BY user_id;

-- 11. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_integrations TO authenticated;
GRANT SELECT, INSERT ON public.user_activities TO authenticated;
GRANT SELECT ON public.integration_stats TO authenticated;

-- 12. Create function to get user integrations with decrypted credentials (for backend use)
CREATE OR REPLACE FUNCTION get_user_integration_credentials(
    p_user_id uuid,
    p_platform text,
    p_store_identifier text DEFAULT NULL
)
RETURNS TABLE (
    integration_id uuid,
    store_url text,
    store_name text,
    config jsonb,
    credentials jsonb
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        si.id,
        si.store_url,
        si.store_name,
        si.config,
        CASE 
            WHEN si.platform = 'woocommerce' THEN
                jsonb_build_object(
                    'api_key', si.api_key_encrypted,
                    'api_secret', si.api_secret_encrypted,
                    'permissions', si.permissions
                )
            WHEN si.platform = 'shopify' THEN
                jsonb_build_object(
                    'access_token', si.access_token_encrypted,
                    'shop_domain', si.shop_domain
                )
            ELSE '{}'::jsonb
        END as credentials
    FROM public.store_integrations si
    WHERE 
        si.user_id = p_user_id 
        AND si.platform = p_platform 
        AND si.status = 'active'
        AND (
            p_store_identifier IS NULL 
            OR si.store_url = p_store_identifier 
            OR si.shop_domain = p_store_identifier
        )
    ORDER BY si.connected_at DESC
    LIMIT 1;
END;
$$;

-- 13. Insert sample integration activity types for reference
INSERT INTO public.user_activities (user_id, activity_type, description, metadata)
SELECT 
    gen_random_uuid(),
    activity_type,
    'Sample activity - ' || activity_type,
    '{}'::jsonb
FROM (VALUES 
    ('integration_connected'),
    ('integration_disconnected'),
    ('integration_error'),
    ('order_tracked'),
    ('widget_customized')
) AS sample_activities(activity_type)
ON CONFLICT DO NOTHING;

-- Delete the sample activities (they were just for schema reference)
DELETE FROM public.user_activities WHERE description LIKE 'Sample activity -%';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'TrulyBot integrations database schema created successfully!';
    RAISE NOTICE 'Tables created: store_integrations, user_activities';
    RAISE NOTICE 'Views created: integration_stats';
    RAISE NOTICE 'Functions created: get_user_integration_credentials';
    RAISE NOTICE 'RLS policies applied for security';
END $$;