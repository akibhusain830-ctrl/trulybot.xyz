-- ============================================
-- DIAGNOSTIC REPORT - Smart Detection
-- Finds only tables that exist
-- Copy and paste ALL of this into Supabase SQL Editor
-- ============================================

-- ===== 1. ALL PUBLIC TABLES =====
SELECT 
  'TABLES_FOUND' as section,
  tablename as name
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- ===== 2. PROFILES TABLE INFO =====
SELECT 
  'PROFILES_STRUCTURE' as section,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- ===== 3. ORDERS TABLE INFO =====
SELECT 
  'ORDERS_STRUCTURE' as section,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- ===== 4. COUNT PROFILES =====
SELECT 
  'ROW_COUNTS' as section,
  'profiles' as table_name, 
  COUNT(*) as record_count 
FROM profiles;

-- ===== 5. COUNT ORDERS =====
SELECT 
  'ROW_COUNTS' as section,
  'orders' as table_name, 
  COUNT(*) as record_count 
FROM orders;

-- ===== 6. SAMPLE VALID PROFILE IDs =====
SELECT 
  'VALID_PROFILE_IDS' as section,
  id,
  email,
  created_at
FROM profiles 
LIMIT 10;

-- ===== 7. SAMPLE ORDERS DATA =====
SELECT 
  'SAMPLE_ORDERS' as section,
  id as order_id,
  user_id,
  amount,
  status,
  created_at
FROM orders 
LIMIT 10;

-- ===== 8. FIND ORPHANED ORDERS =====
SELECT 
  'ORPHANED_ORDERS' as section,
  o.id as order_id,
  o.user_id as invalid_user_id,
  o.amount,
  o.status,
  o.created_at,
  'NEEDS_DELETE' as action
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
WHERE p.id IS NULL
ORDER BY o.created_at DESC
LIMIT 50;

-- ===== 9. ORPHANED ORDERS COUNT =====
SELECT 
  'ORPHANED_COUNT' as section,
  COUNT(*) as orphaned_orders_count
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
WHERE p.id IS NULL;

-- ===== 10. EXISTING FOREIGN KEYS =====
SELECT 
  'EXISTING_FOREIGN_KEYS' as section,
  tc.constraint_name,
  tc.table_name,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'orders'
ORDER BY tc.table_name, tc.constraint_name;

-- ===== 11. ALL EXISTING CONSTRAINTS IN DATABASE =====
SELECT 
  'ALL_CONSTRAINTS' as section,
  table_name,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name IN ('profiles', 'orders')
ORDER BY table_name, constraint_type;
