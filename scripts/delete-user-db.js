const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function main() {
  const id = process.argv[2];
  if (!id) {
    console.error('Usage: node scripts/delete-user-db.js <user_id>');
    process.exit(1);
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await pool.query('BEGIN');
    await pool.query('DELETE FROM auth.users WHERE id = $1', [id]);
    await pool.query('COMMIT');
    console.log('Deleted', id);
  } catch (e) {
    console.error('DB error:', e.message);
    if (e.detail) console.error('Detail:', e.detail);
    if (e.constraint) console.error('Constraint:', e.constraint);
    try { await pool.query('ROLLBACK'); } catch {}
    process.exit(2);
  } finally {
    await pool.end();
  }
}

main();

