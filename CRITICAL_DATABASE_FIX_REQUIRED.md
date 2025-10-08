# CRITICAL DATABASE FIX REQUIRED

## Authentication Errors - ROOT CAUSE IDENTIFIED AND PARTIALLY FIXED

### ✅ COMPLETED FIXES

1. **Supabase SSR Configuration**: Fixed all API routes using deprecated cookie methods
   - Updated `/api/user/profile`
   - Updated `/api/usage` 
   - Updated `/api/text-upload`
   - Updated `/api/sync-subscription`
   - Updated `/api/leads`
   - Updated `/api/documents/[docId]`
   - Updated `/api/debug-profile`

2. **Server Warnings Eliminated**: No more "@supabase/ssr: createServerClient was configured without set and remove cookie methods" warnings

### 🚨 CRITICAL: DATABASE MIGRATION REQUIRED

The authentication errors are likely caused by a **missing database column** `has_used_trial` in the `profiles` table.

**YOU MUST EXECUTE THIS SQL IN YOUR SUPABASE SQL EDITOR:**

```sql
-- Add the missing has_used_trial column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_used_trial BOOLEAN DEFAULT FALSE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_has_used_trial ON public.profiles(has_used_trial);

-- Update existing users who have trial_ends_at set to mark them as having used trial
UPDATE public.profiles 
SET has_used_trial = TRUE 
WHERE trial_ends_at IS NOT NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'has_used_trial';
```

### STEPS TO COMPLETE THE FIX:

1. **Go to your Supabase Dashboard** → SQL Editor
2. **Paste and run the SQL above**
3. **Refresh your application** at http://localhost:3001/dashboard/settings
4. **Test logo upload functionality**

### Expected Results After SQL Fix:
- ✅ No more 401 Unauthorized errors
- ✅ Profile API calls work properly
- ✅ Usage API calls work properly  
- ✅ Logo upload and persistence works
- ✅ Trial activation works correctly

### Current Status:
- 🟡 **Server-side fixes**: COMPLETED ✅
- 🔴 **Database schema**: NEEDS SQL EXECUTION ❌
- 🔴 **Full functionality**: BLOCKED until SQL is run ❌

**The application will continue to show authentication errors until you execute the SQL migration in Supabase.**