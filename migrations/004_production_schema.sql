-- ============================================
-- PRODUCTION SCHEMA - Complete Setup
-- ============================================
-- This adds all production-grade constraints, indexes, and logging

-- ===== STEP 1: ADD UNIQUE CONSTRAINTS =====

DO $$ 
BEGIN
  ALTER TABLE profiles
    ADD CONSTRAINT unique_email UNIQUE(email);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- ===== STEP 2: ADD CHECK CONSTRAINTS =====

DO $$ 
BEGIN
  ALTER TABLE orders
    ADD CONSTRAINT check_order_amount CHECK (amount > 0);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$ 
BEGIN
  ALTER TABLE orders
    ADD CONSTRAINT check_currency 
      CHECK (currency IN ('USD', 'INR', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'JPY'));
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- ===== STEP 3: CREATE PERFORMANCE INDEXES =====

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- ===== STEP 4: ADD UPDATED_AT COLUMNS =====

DO $$ 
BEGIN
  ALTER TABLE profiles
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
EXCEPTION WHEN duplicate_column THEN
  NULL;
END $$;

DO $$ 
BEGIN
  ALTER TABLE orders
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
EXCEPTION WHEN duplicate_column THEN
  NULL;
END $$;

-- ===== STEP 5: CREATE AUDIT LOGGING TABLE =====

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

-- ===== STEP 6: CREATE ERROR LOGGING TABLE =====

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

-- ===== VERIFICATION =====

SELECT 'Production schema migration complete!' as status;

SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name IN ('orders', 'profiles')
  AND constraint_type IN ('UNIQUE', 'FOREIGN KEY', 'CHECK')
ORDER BY table_name, constraint_type;
