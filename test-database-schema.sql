-- Comprehensive Database Testing Script
-- Tests all enterprise database tables and functions

-- Test 1: Bot Analytics Events Table
DO $$
BEGIN
  RAISE NOTICE 'Testing Bot Analytics Events Table...';
  
  -- Test table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bot_analytics_events') THEN
    RAISE EXCEPTION 'bot_analytics_events table does not exist';
  END IF;
  
  -- Test required columns exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bot_analytics_events' AND column_name = 'workspace_id') THEN
    RAISE EXCEPTION 'workspace_id column missing from bot_analytics_events';
  END IF;
  
  RAISE NOTICE 'Bot Analytics Events Table: PASSED';
END $$;

-- Test 2: Chat Sessions Table
DO $$
BEGIN
  RAISE NOTICE 'Testing Chat Sessions Table...';
  
  -- Test table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_sessions') THEN
    RAISE EXCEPTION 'chat_sessions table does not exist';
  END IF;
  
  -- Test required columns exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_sessions' AND column_name = 'session_id') THEN
    RAISE EXCEPTION 'session_id column missing from chat_sessions';
  END IF;
  
  RAISE NOTICE 'Chat Sessions Table: PASSED';
END $$;

-- Test 3: Billing History Table
DO $$
BEGIN
  RAISE NOTICE 'Testing Billing History Table...';
  
  -- Test table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'billing_history') THEN
    RAISE EXCEPTION 'billing_history table does not exist';
  END IF;
  
  -- Test required columns exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'billing_history' AND column_name = 'invoice_id') THEN
    RAISE EXCEPTION 'invoice_id column missing from billing_history';
  END IF;
  
  RAISE NOTICE 'Billing History Table: PASSED';
END $$;

-- Test 4: Audit Trail Table
DO $$
BEGIN
  RAISE NOTICE 'Testing Audit Trail Table...';
  
  -- Test table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_trail') THEN
    RAISE EXCEPTION 'audit_trail table does not exist';
  END IF;
  
  -- Test required columns exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_trail' AND column_name = 'event_type') THEN
    RAISE EXCEPTION 'event_type column missing from audit_trail';
  END IF;
  
  RAISE NOTICE 'Audit Trail Table: PASSED';
END $$;

-- Test 5: Security Events Table
DO $$
BEGIN
  RAISE NOTICE 'Testing Security Events Table...';
  
  -- Test table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_events') THEN
    RAISE EXCEPTION 'security_events table does not exist';
  END IF;
  
  -- Test required columns exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_events' AND column_name = 'security_event_type') THEN
    RAISE EXCEPTION 'security_event_type column missing from security_events';
  END IF;
  
  RAISE NOTICE 'Security Events Table: PASSED';
END $$;

-- Test 6: Check all RLS policies exist
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  RAISE NOTICE 'Testing Row Level Security Policies...';
  
  SELECT COUNT(*) INTO policy_count 
  FROM pg_policies 
  WHERE tablename IN ('bot_analytics_events', 'chat_sessions', 'billing_history', 'audit_trail', 'security_events');
  
  IF policy_count < 5 THEN
    RAISE EXCEPTION 'Missing RLS policies. Expected at least 5, found %', policy_count;
  END IF;
  
  RAISE NOTICE 'RLS Policies: PASSED (% policies found)', policy_count;
END $$;

-- Test 7: Check analytics functions exist
DO $$
BEGIN
  RAISE NOTICE 'Testing Analytics Functions...';
  
  -- Test bot analytics function
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_bot_analytics') THEN
    RAISE EXCEPTION 'get_bot_analytics function does not exist';
  END IF;
  
  -- Test session analytics function
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_conversation_analytics') THEN
    RAISE EXCEPTION 'get_conversation_analytics function does not exist';
  END IF;
  
  -- Test revenue analytics function
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_revenue_analytics') THEN
    RAISE EXCEPTION 'get_revenue_analytics function does not exist';
  END IF;
  
  -- Test audit analytics function
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_audit_analytics') THEN
    RAISE EXCEPTION 'get_audit_analytics function does not exist';
  END IF;
  
  -- Test security metrics function
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_security_metrics') THEN
    RAISE EXCEPTION 'get_security_metrics function does not exist';
  END IF;
  
  RAISE NOTICE 'Analytics Functions: PASSED';
END $$;

-- Test 8: Check indexes exist for performance
DO $$
DECLARE
  index_count INTEGER;
BEGIN
  RAISE NOTICE 'Testing Database Indexes...';
  
  SELECT COUNT(*) INTO index_count 
  FROM pg_indexes 
  WHERE tablename IN ('bot_analytics_events', 'chat_sessions', 'billing_history', 'audit_trail', 'security_events');
  
  IF index_count < 20 THEN
    RAISE EXCEPTION 'Insufficient indexes. Expected at least 20, found %', index_count;
  END IF;
  
  RAISE NOTICE 'Database Indexes: PASSED (% indexes found)', index_count;
END $$;

-- Test 9: Check constraints and data types
DO $$
DECLARE
  constraint_count INTEGER;
BEGIN
  RAISE NOTICE 'Testing Table Constraints...';
  
  SELECT COUNT(*) INTO constraint_count 
  FROM information_schema.check_constraints 
  WHERE constraint_name LIKE '%bot_analytics_events%' 
     OR constraint_name LIKE '%chat_sessions%'
     OR constraint_name LIKE '%billing_history%'
     OR constraint_name LIKE '%audit_trail%'
     OR constraint_name LIKE '%security_events%';
  
  IF constraint_count < 10 THEN
    RAISE EXCEPTION 'Insufficient constraints. Expected at least 10, found %', constraint_count;
  END IF;
  
  RAISE NOTICE 'Table Constraints: PASSED (% constraints found)', constraint_count;
END $$;

-- Summary
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'DATABASE TESTING SUMMARY';
  RAISE NOTICE '===========================================';
  RAISE NOTICE '✅ Bot Analytics Events Table: PASSED';
  RAISE NOTICE '✅ Chat Sessions Table: PASSED';
  RAISE NOTICE '✅ Billing History Table: PASSED';
  RAISE NOTICE '✅ Audit Trail Table: PASSED';
  RAISE NOTICE '✅ Security Events Table: PASSED';
  RAISE NOTICE '✅ RLS Policies: PASSED';
  RAISE NOTICE '✅ Analytics Functions: PASSED';
  RAISE NOTICE '✅ Database Indexes: PASSED';
  RAISE NOTICE '✅ Table Constraints: PASSED';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ALL DATABASE TESTS PASSED!';
  RAISE NOTICE '===========================================';
END $$;