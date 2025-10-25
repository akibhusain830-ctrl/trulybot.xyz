-- ============================================
-- QUICK DIAGNOSTIC - Just the critical data
-- ============================================

-- 1. ROW COUNTS
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'orders' as table_name, COUNT(*) as count FROM orders;

-- 2. SAMPLE PROFILE IDs (these are VALID)
SELECT 'VALID_PROFILE_IDS' as info, id FROM profiles LIMIT 5;

-- 3. HOW MANY ORDERS ARE ORPHANED?
SELECT COUNT(*) as orphaned_orders FROM orders o 
LEFT JOIN profiles p ON o.user_id = p.id 
WHERE p.id IS NULL;

-- 4. WHICH ORDERS ARE ORPHANED? (show first 5)
SELECT 'ORPHANED' as status, o.id, o.user_id, o.amount, o.created_at 
FROM orders o 
LEFT JOIN profiles p ON o.user_id = p.id 
WHERE p.id IS NULL 
LIMIT 5;

-- 5. SAMPLE VALID ORDERS
SELECT 'VALID' as status, o.id, o.user_id, o.amount, o.created_at 
FROM orders o 
JOIN profiles p ON o.user_id = p.id 
LIMIT 5;
