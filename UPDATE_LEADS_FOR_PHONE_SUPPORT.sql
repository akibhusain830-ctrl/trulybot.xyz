-- UPDATE EXISTING DATABASE FOR ENHANCED LEAD COLLECTION
-- Run this if you have an existing database that needs phone support

-- Check if phone column exists in leads table
DO $$
BEGIN
    -- Add phone column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' 
        AND column_name = 'phone'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.leads ADD COLUMN phone TEXT;
        RAISE NOTICE 'Added phone column to leads table';
    ELSE
        RAISE NOTICE 'Phone column already exists in leads table';
    END IF;
    
    -- Add phone index if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'leads' 
        AND indexname = 'leads_phone_idx'
        AND schemaname = 'public'
    ) THEN
        CREATE INDEX leads_phone_idx ON public.leads(phone);
        RAISE NOTICE 'Created phone index on leads table';
    ELSE
        RAISE NOTICE 'Phone index already exists on leads table';
    END IF;
END
$$;