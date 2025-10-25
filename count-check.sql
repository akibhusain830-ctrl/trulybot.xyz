-- Show just the critical numbers

-- Row counts
SELECT 'PROFILES_COUNT' as metric, COUNT(*) as value FROM profiles
UNION ALL
SELECT 'ORDERS_COUNT' as metric, COUNT(*) as value FROM orders
UNION ALL
SELECT 'ORPHANED_ORDERS_COUNT' as metric, COUNT(*) as value FROM orders o 
LEFT JOIN profiles p ON o.user_id = p.id 
WHERE p.id IS NULL;
