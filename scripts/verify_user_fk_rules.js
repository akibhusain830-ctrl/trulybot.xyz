const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    const res = await pool.query(`
      SELECT c.relname AS table_name, con.conname AS constraint_name,
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
      console.log(`${r.table_name} | ${r.constraint_name} | ${r.delete_rule}`);
    }
  } finally {
    await pool.end();
  }
}

main();

