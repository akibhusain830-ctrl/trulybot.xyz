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
async function main() {
  const u = await pool.query(
    "select id from auth.users where email=$1 limit 1",
    [email],
  );
  if (u.rowCount === 0) {
    console.error(
      JSON.stringify({ error: "User email not found in auth.users", email }),
    );
    process.exit(2);
  }
  const user_id = u.rows[0].id;
  const pr = await pool.query("select id from public.profiles where id=$1", [
    user_id,
  ]);
  if (pr.rowCount === 0) {
    await pool.query(
      `insert into public.profiles (id, workspace_id, email, subscription_status, subscription_tier, created_at)
       values ($1, $1, $2, 'active', 'free', now())`,
      [user_id, email],
    );
    console.log(JSON.stringify({ seeded: true, user_id }));
  } else {
    console.log(
      JSON.stringify({ seeded: false, message: "Profile exists", user_id }),
    );
  }
  await pool.end();
}
main().catch(async (e) => {
  console.error(JSON.stringify({ error: e.message }));
  await pool.end();
  process.exit(1);
});
