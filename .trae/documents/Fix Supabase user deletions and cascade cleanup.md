## Diagnosis
- Dashboard error "Failed to delete user: Database error deleting user" typically indicates a foreign‑key violation when deleting `auth.users` without `ON DELETE` behavior on referencing tables.
- Supabase is integrated via clients:
  - Admin client: `src/lib/supabase/admin.ts:17-26`
  - Browser client: `src/lib/supabaseClient.ts:1-15`
  - Multiple server routes initialize with `SUPABASE_SERVICE_ROLE_KEY` (e.g., `src/app/api/payments/webhook/route.ts:12-15`, `src/app/api/documents/[docId]/route.ts:10-14`).
- Key FKs to `auth.users`:
  - `database/migrations/001_initial_schema.sql:16-18` `profiles.id REFERENCES auth.users(id) ON DELETE CASCADE`
  - `database/migrations/001_initial_schema.sql:40-42` `subscriptions.user_id ... ON DELETE CASCADE`
  - `database/migrations/001_initial_schema.sql:65-67` `documents.user_id ... ON DELETE CASCADE`
  - `database/migrations/012_chat_sessions.sql:10-11` `user_id ... ON DELETE SET NULL`
  - `database/migrations/011_bot_analytics_events.sql:10-11` `user_id ... ON DELETE SET NULL`
  - `database/migrations/014_audit_trail.sql:10` `user_id ... ON DELETE SET NULL`
  - `database/migrations/015_security_events.sql:10` `user_id ... ON DELETE SET NULL`
  - Potential blocker: `database/migrations/001_initial_schema.sql:106-110` `leads.assigned_to UUID REFERENCES auth.users(id)` (no `ON DELETE` specified → defaults to NO ACTION).
- No `AFTER DELETE ON auth.users` trigger for cleanup; creation exists only for `AFTER INSERT` (`database/migrations/008_robust_user_profile_system.sql:69-175`).
- No programmatic path to delete users via Admin API (`supabase.auth.admin.deleteUser`) found.

## Plan
### Phase 1: Identify blockers
- Write a short DB inspection script using the service role to list constraints referencing `auth.users(id)` that use NO ACTION, via `pg_constraint`/`pg_class` joins; output table, constraint name, delete rule.
- Run against the target project DB to confirm which constraints fail (likely `leads.assigned_to`).

### Phase 2: Fix schema
- Create a migration `database/migrations/xxx_fix_user_delete_cascade.sql` to:
  - Ensure `leads.assigned_to` is nullable, then drop the existing FK and re‑add with `ON DELETE SET NULL`.
  - Normalize any other NO ACTION FKs referencing `auth.users(id)` to `SET NULL` or `CASCADE` according to domain rules (ownership → CASCADE; references/assignments → SET NULL).
- Example change (for reference):
  - `ALTER TABLE public.leads ALTER COLUMN assigned_to DROP NOT NULL;`
  - `ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_assigned_to_fkey;`
  - `ALTER TABLE public.leads ADD CONSTRAINT leads_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL;`

### Phase 3: Defensive cleanup
- Add a safe `public.cleanup_user(p_user_id uuid)` function to clear residual references not covered by FKs (e.g., `UPDATE public.leads SET assigned_to = NULL WHERE assigned_to = p_user_id;`).
- Optionally attach `AFTER DELETE ON auth.users` trigger to call `cleanup_user` as final guard.

### Phase 4: Admin delete pathway
- Implement a server‑only route `src/app/api/admin/users/[id]/delete/route.ts` that:
  - Authenticates admin access.
  - Uses `supabase.auth.admin.deleteUser(userId)` via `SUPABASE_SERVICE_ROLE_KEY`.
  - Returns detailed errors and, on failure, calls a helper to enumerate blocking constraints.
- Add a maintenance script to batch‑delete users and produce a report (ids deleted, ids failed, and blocking constraints).

### Phase 5: Verification
- Seed a user with rows across `profiles`, `subscriptions`, `documents`, `usage_counters`, `leads`, `analytics`.
- Attempt deletion via Admin API and dashboard; expect cascades for CASCADE tables and nulling for SET NULL tables.
- Confirm no orphaned rows and that RLS policies are unaffected (dashboard/service role bypasses RLS).

### Phase 6: Observability
- Log admin user deletions to `security_events`/`audit_trail` with `user_id` SET NULL semantics, preserving historical entries.

### Deliverables
- Migration file adjusting FKs to allow user deletion.
- `cleanup_user` SQL function and optional trigger.
- Admin deletion API route and maintenance script with constraint diagnostics.
- Test script/steps verifying deletion behavior end‑to‑end.

Confirm and I will implement the changes, run the inspections, and provide the exact constraint report from your database along with the migration and routes.