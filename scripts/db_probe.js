const { Pool } = require("pg");
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}
const pool = new Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});
async function exists(table) {
  const r = await pool.query(`select to_regclass('public.${table}') as t`);
  return !!r.rows[0].t;
}
async function main() {
  const u = process.env.USER_ID || "d66e7a5a-4a28-4c7b-b84d-85bdc2ad782c";
  const ok = await pool.query("select 1");
  console.log(JSON.stringify({ db: "ok", now: new Date().toISOString() }));
  const hasProfiles = await exists("profiles");
  console.log(JSON.stringify({ table: "profiles", exists: hasProfiles }));
  if (hasProfiles) {
    const pr = await pool.query(
      "select id, workspace_id, subscription_status, subscription_tier from profiles where id=$1",
      [u],
    );
    console.log(
      JSON.stringify({
        user_id: u,
        profiles_found: pr.rowCount,
        profile: pr.rows[0] || null,
      }),
    );
  }
  const hasStores = await exists("store_integrations");
  console.log(
    JSON.stringify({ table: "store_integrations", exists: hasStores }),
  );
  if (hasStores) {
    const si = await pool.query(
      "select platform, store_url, status from store_integrations where user_id=$1 order by connected_at desc limit 5",
      [u],
    );
    console.log(
      JSON.stringify({
        integrations_count: si.rowCount,
        integrations: si.rows,
      }),
    );
  }
  const hasActivities = await exists("user_activities");
  console.log(
    JSON.stringify({ table: "user_activities", exists: hasActivities }),
  );
  if (hasActivities) {
    const ua = await pool.query(
      "select activity_type, description, created_at from user_activities where user_id=$1 order by created_at desc limit 5",
      [u],
    );
    console.log(JSON.stringify({ recent_activities: ua.rows }));
  }
  await pool.end();
}
main().catch(async (e) => {
  console.error(JSON.stringify({ error: e.message }));
  await pool.end();
  process.exit(1);
});
