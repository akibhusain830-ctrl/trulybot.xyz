const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function runFile(pool, relPath) {
  const sqlPath = path.resolve(process.cwd(), relPath);
  if (!fs.existsSync(sqlPath)) throw new Error(`SQL file not found: ${sqlPath}`);
  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log(`\n📄 Executing ${relPath} (${sql.length} chars)`);
  const start = Date.now();
  await pool.query(sql);
  console.log(`✅ Success: ${relPath} in ${Date.now() - start}ms`);
}

async function verify(pool) {
  console.log('\n🔍 Verifying FK delete rules for auth.users references...');
  const res = await pool.query(`
    SELECT
      c.relname AS table_name,
      con.conname AS constraint_name,
      CASE con.confdeltype
        WHEN 'a' THEN 'NO ACTION'
        WHEN 'c' THEN 'CASCADE'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'd' THEN 'SET DEFAULT'
        WHEN 'r' THEN 'RESTRICT'
        ELSE con.confdeltype::text
      END AS delete_rule
    FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_class cr ON cr.oid = con.confrelid
    JOIN pg_namespace np ON np.oid = c.relnamespace
    JOIN pg_namespace nr ON nr.oid = cr.relnamespace
    WHERE con.contype = 'f' AND cr.relname = 'users' AND nr.nspname = 'auth'
    ORDER BY table_name, constraint_name;
  `);
  for (const r of res.rows) {
    console.log(`   • ${r.table_name} | ${r.constraint_name} | ${r.delete_rule}`);
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ Missing DATABASE_URL in .env.local');
    process.exit(1);
  }
  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  try {
    const connInfo = await pool.query('select current_user as user, current_database() as database');
    console.log(`🚀 Connected as ${connInfo.rows[0].user} to ${connInfo.rows[0].database}`);

    await runFile(pool, 'database/migrations/019_fix_user_delete_blockers.sql');
    await runFile(pool, 'database/migrations/020_auth_user_delete_cleanup.sql');
    await runFile(pool, 'database/migrations/021_list_auth_user_fks.sql');

    await verify(pool);
  } catch (err) {
    console.error('💥 Execution failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

