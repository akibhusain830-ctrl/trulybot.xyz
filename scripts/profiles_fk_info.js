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
async function main() {
  const fk = await pool.query(`
    SELECT tc.constraint_name, tc.table_name, kcu.column_name,
           ccu.table_name AS foreign_table, ccu.column_name AS foreign_column
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='profiles'`);
  console.log(JSON.stringify({ fks: fk.rows }, null, 2));
  await pool.end();
}
main().catch(async (e) => {
  console.error(JSON.stringify({ error: e.message }));
  await pool.end();
  process.exit(1);
});
