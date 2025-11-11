-- TrulyBot Production Database Schema Migration
-- Safe version that checks for table existence first
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/[YOUR_PROJECT_ID]/sql

-- Check what tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
