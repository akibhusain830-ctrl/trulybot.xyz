const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scripts/apply_single_sql.js <path-to-sql>');
    process.exit(1);
  }
  const sqlPath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(sqlPath)) {
    console.error(`SQL file not found: ${sqlPath}`);
    process.exit(1);
  }
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Missing DATABASE_URL in .env.local');
    process.exit(1);
  }
  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  try {
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log(`\n📄 Executing ${file} (${sql.length} chars)`);
    const start = Date.now();
    await pool.query(sql);
    console.log(`✅ Success: ${file} in ${Date.now() - start}ms`);
  } catch (err) {
    console.error('💥 Execution failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

