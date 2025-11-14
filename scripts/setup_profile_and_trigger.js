const { Pool } = require("pg");

const url = process.env.DATABASE_URL;
const email = process.env.EMAIL;
if (!url || !email) {
  console.error("DATABASE_URL or EMAIL missing");
  process.exit(1);
}

const pool = new Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

async function exec(sql, params) {
  return pool.query(sql, params);
}

async function ensureTrigger() {
  const fn = `
  create or replace function public.handle_new_user()
  returns trigger as $$
  declare workspace_id uuid;
  begin
    insert into public.workspaces (name, slug, created_at)
    values (
      coalesce(new.email, 'User') || ' Workspace',
      'workspace-' || substr(new.id::text, 1, 8),
      now()
    )
    returning id into workspace_id;

    insert into public.profiles (
      id, email, full_name, role,
      chatbot_name, welcome_message, accent_color,
      subscription_status, subscription_tier,
      trial_ends_at, has_used_trial,
      workspace_id, created_at, updated_at
    ) values (
      new.id,
      new.email,
      split_part(coalesce(new.email, 'user'), '@', 1),
      'owner',
      'Assistant',
      'Hello! How can I help you today?',
      '#2563EB',
      'none',
      'free',
      null,
      false,
      workspace_id,
      now(),
      now()
    ) on conflict (id) do nothing;

    return new;
  end;
  $$ language plpgsql security definer;
  `;
  await exec(fn);
  await exec("drop trigger if exists on_auth_user_created on auth.users");
  await exec(`
    create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user()
  `);
}

async function ensureStoreIntegrationsConstraints() {
  await exec(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
          AND tablename = 'store_integrations' 
          AND indexname = 'uniq_store_integrations_user_platform'
      ) THEN
        BEGIN
          CREATE UNIQUE INDEX uniq_store_integrations_user_platform
            ON public.store_integrations (user_id, platform);
        EXCEPTION WHEN others THEN NULL;
        END;
      END IF;
    END $$;
  `);

  await exec(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'store_integrations' 
          AND constraint_name = 'fk_store_integrations_user_id'
      ) THEN
        BEGIN
          ALTER TABLE public.store_integrations
            DROP CONSTRAINT fk_store_integrations_user_id;
        EXCEPTION WHEN others THEN NULL;
        END;
      END IF;
    END $$;
  `);

  await exec(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'store_integrations' 
          AND constraint_name = 'fk_store_integrations_user_id_profiles'
      ) THEN
        BEGIN
          ALTER TABLE public.store_integrations
            ADD CONSTRAINT fk_store_integrations_user_id_profiles
              FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
        EXCEPTION WHEN others THEN NULL;
        END;
      END IF;
    END $$;
  `);
}

async function ensureProfileByEmail(email) {
  const u = await exec(
    "select id,email from auth.users where email=$1 limit 1",
    [email],
  );
  if (u.rowCount === 0) {
    return { ok: false, reason: "auth_user_not_found" };
  }
  const user_id = u.rows[0].id;
  const p = await exec("select id from public.profiles where id=$1", [user_id]);
  if (p.rowCount > 0) {
    return { ok: true, seeded: false, user_id };
  }
  // create workspace
  const workspaceName = (email.split("@")[0] || "User") + "'s Workspace";
  const workspaceSlug = `workspace-${String(user_id).slice(0, 8)}`;
  const w = await exec(
    "insert into public.workspaces (name, slug, created_at) values ($1, $2, now()) returning id",
    [workspaceName, workspaceSlug],
  );
  const workspace_id = w.rows[0].id;
  // insert profile
  await exec(
    `insert into public.profiles (
      id, email, full_name, role, chatbot_name, welcome_message, accent_color,
      subscription_status, subscription_tier, trial_ends_at, has_used_trial,
      workspace_id, created_at, updated_at
    ) values (
      $1, $2, split_part($2, '@', 1), 'owner', 'Assistant', 'Hello! How can I help you today?', '#2563EB',
      'none', 'free', null, false, $3, now(), now()
    )`,
    [user_id, email, workspace_id],
  );
  return { ok: true, seeded: true, user_id, workspace_id };
}

async function main() {
  const result = {};
  try {
    await exec("select 1");
    result.db = "ok";
    await ensureTrigger();
    result.trigger = "ensured";
    await ensureStoreIntegrationsConstraints();
    result.store_integrations_constraints = "ensured";
    const seeded = await ensureProfileByEmail(email);
    result.seed = seeded;
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error(JSON.stringify({ error: e.message }));
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
