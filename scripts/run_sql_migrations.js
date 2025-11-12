const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
require('dotenv').config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function runFile(pool, filePath) {
  const sqlPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(sqlPath)) {
    throw new Error(`SQL file not found: ${sqlPath}`);
  }
  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log(`\n📄 Executing ${filePath} (${sql.length} chars)`);
  const start = Date.now();
  await pool.query(sql);
  console.log(`✅ Success: ${filePath} in ${Date.now() - start}ms`);
}

async function verify(pool) {
  console.log('\n🔍 Verifying migration results...');
  const cons = await pool.query(`
    SELECT conname, pg_get_constraintdef(oid) AS def
    FROM pg_constraint
    WHERE conname IN ('profiles_subscription_tier_check','orders_plan_id_check')
    ORDER BY conname
  `);
  for (const r of cons.rows) {
    console.log(`   • ${r.conname}: ${r.def}`);
  }

  const funcs = await pool.query(`
    SELECT n.nspname AS schema, p.proname AS name
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'start_user_trial'
  `);
  if (funcs.rowCount > 0) {
    console.log('   • Function public.start_user_trial exists');
  } else {
    console.log('   ⚠️ Function public.start_user_trial NOT found');
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ Missing DATABASE_URL in env. Add it to .env.local');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  try {
    const connInfo = await pool.query('select current_user as user, current_database() as database');
    console.log(`🚀 Connected as ${connInfo.rows[0]?.user} to ${connInfo.rows[0]?.database}`);

    // Drop constraints first to safely normalize data
    console.log('\n🔧 Dropping existing check constraints to allow normalization…');
    await pool.query(`ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;`);
    await pool.query(`ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_plan_id_check;`);

    // Pre-normalize existing data to avoid constraint violations
    console.log('\n🧹 Normalizing existing data (ultra → enterprise)…');
    const normStart = Date.now();
    await pool.query(`UPDATE public.profiles SET subscription_tier = 'enterprise' WHERE subscription_tier = 'ultra';`);
    await pool.query(`UPDATE public.orders SET plan_id = 'enterprise' WHERE plan_id = 'ultra';`);
    console.log(`✅ Normalization done in ${Date.now() - normStart}ms`);

    await runFile(pool, 'database/migrations/017_remove_ultra_update_profiles_trial_function.sql');
    await runFile(pool, 'database/migrations/018_update_orders_plan_id_check.sql');

    await verify(pool);
  } catch (err) {
    console.error('💥 Migration execution failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();