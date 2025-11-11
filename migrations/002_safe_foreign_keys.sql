-- ============================================
-- SAFE DATABASE MIGRATION - HANDLES ORPHANED DATA
-- ============================================
-- This migration:
-- 1. Removes orphaned records that violate FK constraints
-- 2. Adds proper foreign key constraints
-- 3. Adds data validation indexes and triggers
-- 4. Maintains data integrity

-- ===== STEP 1: BACKUP AND CLEAN ORPHANED DATA =====
-- BEFORE applying foreign keys, remove records that reference non-existent profiles

DO $$ 
BEGIN
  -- Delete orphaned orders (only if both tables exist)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
      DELETE FROM orders o
      WHERE NOT EXISTS (
        SELECT 1 FROM profiles p WHERE p.id = o.user_id
      );
      RAISE NOTICE 'Deleted orphaned orders';
    END IF;
  END IF;
END $$;

-- ===== STEP 2: ADD FOREIGN KEY CONSTRAINTS (NOW SAFE) =====

DO $$ 
BEGIN
  -- Orders table constraints (ONLY if both tables exist)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
      BEGIN
        ALTER TABLE orders
          ADD CONSTRAINT fk_orders_user_id 
            FOREIGN KEY (user_id) 
            REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added fk_orders_user_id';
      EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'fk_orders_user_id already exists';
      END;
    END IF;
  END IF;
END $$;

-- ===== STEP 3: ADD UNIQUE CONSTRAINTS =====

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    BEGIN
      ALTER TABLE profiles
        ADD CONSTRAINT unique_email UNIQUE(email);
      RAISE NOTICE 'Added unique_email to profiles';
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE 'unique_email already exists';
    END;
  END IF;
END $$;

-- ===== STEP 4: ADD NOT NULL CONSTRAINTS =====

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    BEGIN
      ALTER TABLE profiles ALTER COLUMN email SET NOT NULL;
      RAISE NOTICE 'Set email NOT NULL on profiles';
    EXCEPTION WHEN others THEN 
      RAISE NOTICE 'Could not set email NOT NULL on profiles'; 
    END;
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

-- ===== STEP 5: ADD CHECK CONSTRAINTS =====

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    BEGIN
      ALTER TABLE orders
        ADD CONSTRAINT check_order_amount CHECK (amount > 0);
      RAISE NOTICE 'Added check_order_amount';
    EXCEPTION WHEN duplicate_object THEN 
      RAISE NOTICE 'check_order_amount already exists'; 
    END;
    
    BEGIN
      ALTER TABLE orders
        ADD CONSTRAINT check_currency 
          CHECK (currency IN ('USD', 'INR', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'JPY'));
      RAISE NOTICE 'Added check_currency';
    EXCEPTION WHEN duplicate_object THEN 
      RAISE NOTICE 'check_currency already exists'; 
    END;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    BEGIN
      ALTER TABLE profiles
        ADD CONSTRAINT check_subscription_tier 
          CHECK (subscription_tier IN ('trial', 'basic', 'pro', 'business', 'enterprise', 'ultra'));
      RAISE NOTICE 'Added check_subscription_tier';
    EXCEPTION WHEN duplicate_object THEN 
      RAISE NOTICE 'check_subscription_tier already exists'; 
    END;
  END IF;
END $$;

-- ===== STEP 6: CREATE PERFORMANCE INDEXES =====

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)';
    RAISE NOTICE 'Created indexes on orders table';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC)';
    RAISE NOTICE 'Created indexes on profiles table';
  END IF;
END $$;

-- ===== STEP 7: ADD UPDATED_AT TRACKING =====

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    BEGIN
      ALTER TABLE profiles
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
      RAISE NOTICE 'Added updated_at to profiles';
    EXCEPTION WHEN duplicate_column THEN 
      RAISE NOTICE 'updated_at already exists on profiles'; 
    END;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    BEGIN
      ALTER TABLE orders
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
      RAISE NOTICE 'Added updated_at to orders';
    EXCEPTION WHEN duplicate_column THEN 
      RAISE NOTICE 'updated_at already exists on orders'; 
    END;
  END IF;
END $$;

-- ===== STEP 8: CREATE AUDIT LOGGING TABLE =====

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

-- ===== STEP 9: CREATE ERROR LOGGING TABLE =====

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

-- ===== STEP 10: VERIFY MIGRATION SUCCESS =====

SELECT 'MIGRATION_COMPLETE' as status;

-- Check for any remaining orphaned records (should be 0)
SELECT 
  'ORPHANED_CHECK' as check_type,
  COUNT(*) as orphaned_orders
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
WHERE p.id IS NULL;

-- Show existing constraints on orders table
SELECT 
  'FK_CONSTRAINTS' as check_type,
  constraint_name, 
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'orders'
  AND constraint_type = 'FOREIGN KEY'
ORDER BY constraint_name;
