-- 010_add_missing_profile_columns.sql
-- Add missing columns to profiles table for enhanced customization

-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS chatbot_logo_url TEXT,
ADD COLUMN IF NOT EXISTS chatbot_theme VARCHAR(50) DEFAULT 'default',
ADD COLUMN IF NOT EXISTS custom_css TEXT;

-- Update existing profiles to have default values
UPDATE public.profiles 
SET 
  chatbot_logo_url = COALESCE(chatbot_logo_url, ''),
  chatbot_theme = COALESCE(chatbot_theme, 'default'),
  custom_css = COALESCE(custom_css, '')
WHERE chatbot_logo_url IS NULL 
   OR chatbot_theme IS NULL 
   OR custom_css IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.chatbot_logo_url IS 'URL for custom chatbot logo (Ultra plan feature)';
COMMENT ON COLUMN public.profiles.chatbot_theme IS 'Theme for chatbot appearance: default, minimal, corporate, friendly, modern';
COMMENT ON COLUMN public.profiles.custom_css IS 'Custom CSS for chatbot styling (Ultra plan feature)';

-- Grant necessary permissions
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- Update the updated_at timestamp for any modified rows
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();