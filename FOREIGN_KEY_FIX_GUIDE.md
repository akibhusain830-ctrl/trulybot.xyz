# Foreign Key Violation Fix Guide

## What Went Wrong

You got this error:
```
ERROR:  23503: insert or update on table "orders" violates foreign key constraint "fk_orders_user_id"
Key (user_id)=(6b47cbac-9009-42e3-9a37-b1106bf0cba0) is not present in table "profiles".
```

**This means:** Your `orders` table contains `user_id` values that don't exist in the `profiles` table (orphaned records).

The migration tried to create a foreign key that enforces referential integrity, but your existing data violates this constraint.

---

## Solution: 3 Steps

### Step 1️⃣: Diagnose Your Schema (5 minutes)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy the entire content of `diagnose-schema.sql` from your workspace
3. Paste it into Supabase SQL Editor
4. Run each query one by one and document the results:
   - How many profiles exist?
   - How many orders exist?
   - Which orders have user_ids not in profiles? (ORPHANED)
   - What table structure does profiles have?

**Expected Questions You'll Answer:**
- Are there 0 orphaned orders, or many?
- Do the orphaned orders have important data you want to keep?
- Are profile IDs UUIDs or some other type?

### Step 2️⃣: Run the Safe Migration (5 minutes)

Once you understand your data:

1. Go to **Supabase SQL Editor** → **New Query**
2. Copy the entire content of `migrations/002_safe_foreign_keys.sql`
3. **IMPORTANT:** Run this migration in Supabase
4. This migration will:
   - ✅ Find and DELETE orphaned orders (logs them first)
   - ✅ Find and DELETE orphaned chat_messages
   - ✅ Find and DELETE orphaned conversations
   - ✅ Find and DELETE orphaned leads
   - ✅ Then safely add foreign key constraints
   - ✅ Add indexes for performance
   - ✅ Add audit/error logging

**Why this approach?**
- It cleans your data BEFORE adding constraints
- Prevents cascading orphaned records
- Makes your data consistent
- Logs what was deleted for audit trail

### Step 3️⃣: Verify It Worked (2 minutes)

After the migration runs, check:

```sql
-- Should return 0
SELECT COUNT(*) as orphaned_count
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
WHERE p.id IS NULL;

-- Should return your foreign key constraints
SELECT constraint_name 
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
ORDER BY constraint_name;
```

---

## What Gets Deleted?

The `002_safe_foreign_keys.sql` migration deletes:

| Table | Deleted Records | Reason |
|-------|-----------------|--------|
| `orders` | Rows where `user_id` ∉ profiles.id | FK violation |
| `chat_messages` | Rows where `user_id` ∉ profiles.id | FK violation |
| `conversations` | Rows where `user_id` ∉ profiles.id | FK violation |
| `leads` | Rows where `user_id` ∉ profiles.id | FK violation |

**How many will be deleted?**
- Run the diagnostic to find out
- Logged in `error_logs` table with type `ORPHANED_ORDER_DETECTED`

---

## Why Orphaned Records Existed

Possible reasons:

1. **Users were deleted** → Orders still reference deleted user
2. **Data import issue** → user_ids were generated without profiles
3. **Auth mismatch** → System using wrong ID format (UUID vs string)
4. **Partial migration** → Old data from before constraints existed

---

## If You Want to Keep Orphaned Data

Instead of deleting, you can:

1. **Create a staging table** to backup orphaned records
2. **Fix the user_ids** to reference valid profiles
3. **Assign to a "system" user** instead of deleting

Contact support if you need help with this approach.

---

## Migration Files Reference

- `diagnose-schema.sql` - Understand your current data
- `002_safe_foreign_keys.sql` - Fix orphaned data and add constraints
- `001_production_schema.sql` - Original migration (not needed after 002)

---

## Next Steps After Migration

1. ✅ Run `002_safe_foreign_keys.sql` in Supabase
2. ✅ Verify no orphaned records remain
3. ✅ Build locally: `npm run build`
4. ✅ Deploy: `./deploy.sh production vercel`
5. ✅ Check health: `curl https://trulybot.xyz/api/health`

---

## Questions?

Check these logs in Supabase:

```sql
-- See what was deleted during migration
SELECT * FROM error_logs 
WHERE error_type = 'ORPHANED_ORDER_DETECTED'
ORDER BY created_at DESC;

-- Verify constraints are in place
SELECT * FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY';

-- Check for any remaining orphaned data
SELECT 'orders' as table_name, COUNT(*) as orphaned
FROM orders o LEFT JOIN profiles p ON o.user_id = p.id
WHERE p.id IS NULL
UNION ALL
SELECT 'chat_messages', COUNT(*)
FROM chat_messages m LEFT JOIN profiles p ON m.user_id = p.id
WHERE p.id IS NULL;
```
