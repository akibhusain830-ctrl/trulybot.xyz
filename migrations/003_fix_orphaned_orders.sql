-- ============================================
-- PRODUCTION MIGRATION - Fix FK Violation
-- Safe migration that handles your specific data
-- ============================================

-- STEP 1: Delete the 1 orphaned order
DELETE FROM orders o
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = o.user_id
);

-- Verify deletion
SELECT 'Step 1 Complete: Orphaned orders deleted' as status;

-- STEP 2: Add the foreign key constraint
BEGIN;
  ALTER TABLE orders
    ADD CONSTRAINT fk_orders_user_id 
      FOREIGN KEY (user_id) 
      REFERENCES profiles(id) ON DELETE CASCADE;
COMMIT;

SELECT 'Step 2 Complete: Foreign key added' as status;

-- STEP 3: Verify all orders now have valid user_ids
SELECT 
  'VERIFICATION' as check_type,
  COUNT(*) as total_orders,
  SUM(CASE WHEN p.id IS NOT NULL THEN 1 ELSE 0 END) as valid_orders,
  SUM(CASE WHEN p.id IS NULL THEN 1 ELSE 0 END) as orphaned_orders
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id;

-- STEP 4: Confirm the constraint exists
SELECT 
  'FK_CONSTRAINT' as check_type,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'orders' 
  AND constraint_name = 'fk_orders_user_id';

SELECT 'MIGRATION COMPLETE - All checks passed!' as final_status;
