-- TrulyBot Production Database Schema Migration
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/[YOUR_PROJECT_ID]/sql
-- This migration is SAFE and only modifies tables that exist

-- STEP 1: Check existing tables (run this first to see what you have)
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- ===== PART 1: PROFILES TABLE (Most likely exists) =====

-- If you have a 'profiles' table instead of 'users', uncomment and run this section:

-- Add constraints if they don't exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    BEGIN
      ALTER TABLE profiles
        ADD CONSTRAINT unique_email UNIQUE(email);
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
    
    BEGIN
      ALTER TABLE profiles
        ALTER COLUMN email SET NOT NULL;
    EXCEPTION WHEN others THEN
      NULL;
    END;
  END IF;
END $$;


-- ===== PART 2: FLEXIBLE FOREIGN KEY CONSTRAINTS =====
-- Only creates constraints if tables exist

DO $$ 
BEGIN
  -- Orders table constraints
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' OR table_name = 'users') THEN
      BEGIN
        ALTER TABLE orders
          ADD CONSTRAINT fk_orders_user_id 
            FOREIGN KEY (user_id) 
            REFERENCES profiles(id) ON DELETE CASCADE;
      EXCEPTION WHEN duplicate_object THEN
        NULL;
      END;
    END IF;
  END IF;
  
  -- Chat messages constraints
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' OR table_name = 'users') THEN
      BEGIN
        ALTER TABLE chat_messages
          ADD CONSTRAINT fk_chat_messages_user_id 
            FOREIGN KEY (user_id) 
            REFERENCES profiles(id) ON DELETE CASCADE;
      EXCEPTION WHEN duplicate_object THEN
        NULL;
      END;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
      BEGIN
        ALTER TABLE chat_messages
          ADD CONSTRAINT fk_chat_messages_conversation_id 
            FOREIGN KEY (conversation_id) 
            REFERENCES conversations(id) ON DELETE CASCADE;
      EXCEPTION WHEN duplicate_object THEN
        NULL;
      END;
    END IF;
  END IF;
  
  -- Conversations constraints
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' OR table_name = 'users') THEN
      BEGIN
        ALTER TABLE conversations
          ADD CONSTRAINT fk_conversations_user_id 
            FOREIGN KEY (user_id) 
            REFERENCES profiles(id) ON DELETE CASCADE;
      EXCEPTION WHEN duplicate_object THEN
        NULL;
      END;
    END IF;
  END IF;
  
  -- Leads constraints
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' OR table_name = 'users') THEN
      BEGIN
        ALTER TABLE leads
          ADD CONSTRAINT fk_leads_user_id 
            FOREIGN KEY (user_id) 
            REFERENCES profiles(id) ON DELETE CASCADE;
      EXCEPTION WHEN duplicate_object THEN
        NULL;
      END;
    END IF;
  END IF;
END $$;

-- ===== PART 3: UNIQUE CONSTRAINTS =====

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_keys') THEN
    BEGIN
      ALTER TABLE api_keys
        ADD CONSTRAINT unique_api_key UNIQUE(key);
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'store_integrations') THEN
    BEGIN
      ALTER TABLE store_integrations
        ADD CONSTRAINT unique_integration_per_user 
          UNIQUE(user_id, platform, store_url);
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

-- ===== PART 4: NOT NULL CONSTRAINTS =====

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages') THEN
    BEGIN
      ALTER TABLE chat_messages ALTER COLUMN content SET NOT NULL;
    EXCEPTION WHEN others THEN NULL; END;
    BEGIN
      ALTER TABLE chat_messages ALTER COLUMN user_id SET NOT NULL;
    EXCEPTION WHEN others THEN NULL; END;
    BEGIN
      ALTER TABLE chat_messages ALTER COLUMN conversation_id SET NOT NULL;
    EXCEPTION WHEN others THEN NULL; END;
    BEGIN
      ALTER TABLE chat_messages ALTER COLUMN created_at SET NOT NULL;
    EXCEPTION WHEN others THEN NULL; END;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
    BEGIN
      ALTER TABLE conversations ALTER COLUMN user_id SET NOT NULL;
    EXCEPTION WHEN others THEN NULL; END;
    BEGIN
      ALTER TABLE conversations ALTER COLUMN created_at SET NOT NULL;
    EXCEPTION WHEN others THEN NULL; END;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
    BEGIN
      ALTER TABLE leads ALTER COLUMN created_at SET NOT NULL;
    EXCEPTION WHEN others THEN NULL; END;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    BEGIN
      ALTER TABLE orders ALTER COLUMN user_id SET NOT NULL;
    EXCEPTION WHEN others THEN NULL; END;
    BEGIN
      ALTER TABLE orders ALTER COLUMN amount SET NOT NULL;
    EXCEPTION WHEN others THEN NULL; END;
    BEGIN
      ALTER TABLE orders ALTER COLUMN currency SET NOT NULL;
    EXCEPTION WHEN others THEN NULL; END;
    BEGIN
      ALTER TABLE orders ALTER COLUMN created_at SET NOT NULL;
    EXCEPTION WHEN others THEN NULL; END;
  END IF;
END $$;

-- ===== PART 5: CHECK CONSTRAINTS =====

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    BEGIN
      ALTER TABLE orders
        ADD CONSTRAINT check_order_amount CHECK (amount > 0);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    
    BEGIN
      ALTER TABLE orders
        ADD CONSTRAINT check_currency 
          CHECK (currency IN ('USD', 'INR', 'EUR', 'GBP'));
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    BEGIN
      ALTER TABLE profiles
        ADD CONSTRAINT check_subscription_tier 
          CHECK (subscription_tier IN ('trial', 'basic', 'pro', 'business', 'enterprise', 'ultra'));
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

-- ===== PART 6: CREATE INDEXES FOR PERFORMANCE =====

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC)';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC)';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC)';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'store_integrations') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_store_integrations_user_id ON store_integrations(user_id)';
  END IF;
END $$;

-- ===== PART 7: ADD UPDATED_AT TRACKING =====

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    BEGIN
      ALTER TABLE profiles
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    EXCEPTION WHEN duplicate_column THEN NULL; END;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages') THEN
    BEGIN
      ALTER TABLE chat_messages
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    EXCEPTION WHEN duplicate_column THEN NULL; END;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
    BEGIN
      ALTER TABLE conversations
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    EXCEPTION WHEN duplicate_column THEN NULL; END;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
    BEGIN
      ALTER TABLE leads
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    EXCEPTION WHEN duplicate_column THEN NULL; END;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    BEGIN
      ALTER TABLE orders
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    EXCEPTION WHEN duplicate_column THEN NULL; END;
  END IF;
END $$;

-- ===== PART 8: AUDIT LOGGING TABLE =====

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  workspace_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- ===== PART 9: ERROR LOGGING TABLE =====

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  workspace_id UUID,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  request_id TEXT,
  endpoint TEXT,
  method TEXT,
  status_code INTEGER,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_request_id ON error_logs(request_id);
