const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function main() {
  const id = process.argv[2];
  if (!id) {
    console.error('Usage: node scripts/diagnose-user-delete.js <user_id>');
    process.exit(1);
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await pool.query('BEGIN');
    try {
      await pool.query('DELETE FROM auth.users WHERE id = $1', [id]);
      console.log('Deleted');
      await pool.query('ROLLBACK'); // do not persist during diagnosis
    } catch (e) {
      console.error('DB error:', e.message);
      if (e.detail) console.error('Detail:', e.detail);
      if (e.constraint) console.error('Constraint:', e.constraint);
      await pool.query('ROLLBACK');
    }
  } finally {
    await pool.end();
  }
}

main();

