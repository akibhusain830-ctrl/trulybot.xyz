const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
// Supabase often uses custom CA; disable strict TLS verification for this tooling run
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
require('dotenv').config(); // fallback to .env if present

// Helper: quote identifier safely (schema/table/column names)
function qident(id) {
  return '"' + String(id).replace(/"/g, '""') + '"';
}

// Helper: mask sensitive values by column name
function maskRow(row) {
  const sensitive = /password|secret|token|api[_-]?key|access[_-]?key|refresh[_-]?token|private[_-]?key/i;
  const masked = {};
  for (const k of Object.keys(row)) {
    masked[k] = sensitive.test(k) ? '[REDACTED]' : row[k];
  }
  return masked;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ Missing DATABASE_URL in .env.local or .env');
    console.error('   Example (Supabase): DATABASE_URL=postgresql://postgres:<DB_PASSWORD>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

  const dump = {
    connection: {
      host: null,
      database: null,
      user: null
    },
    schemas: {},
    views: [],
    functions: []
  };

  try {
    // Basic connection info
    const connInfo = await pool.query('select current_user as user, current_database() as database');
    dump.connection.user = connInfo.rows[0]?.user || null;
    dump.connection.database = connInfo.rows[0]?.database || null;

    console.log('🚀 Connected. Inspecting tables…');

    // List base tables in all non-system schemas
    const tablesRes = await pool.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_type = 'BASE TABLE'
        AND table_schema NOT IN ('pg_catalog','information_schema')
      ORDER BY table_schema, table_name
    `);

    // Prepare schema containers
    for (const r of tablesRes.rows) {
      if (!dump.schemas[r.table_schema]) dump.schemas[r.table_schema] = { tables: {} };
    }

    // Iterate tables: columns, count, sample
    for (const r of tablesRes.rows) {
      const schema = r.table_schema;
      const table = r.table_name;
      const fq = `${qident(schema)}.${qident(table)}`;

      // Columns
      const colsRes = await pool.query(
        `SELECT column_name, data_type, is_nullable, column_default
         FROM information_schema.columns
         WHERE table_schema = $1 AND table_name = $2
         ORDER BY ordinal_position`,
        [schema, table]
      );

      // Row count
      let count = 0n;
      try {
        const cntRes = await pool.query(`SELECT COUNT(*)::bigint AS count FROM ${fq}`);
        count = cntRes.rows[0]?.count || 0n;
      } catch (e) {
        console.warn(`⚠️  Count failed for ${schema}.${table}: ${e.message}`);
      }

      // Sample (limited)
      let sample = [];
      try {
        const sampleRes = await pool.query(`SELECT * FROM ${fq} LIMIT 50`);
        sample = sampleRes.rows.map(maskRow);
      } catch (e) {
        console.warn(`⚠️  Sample failed for ${schema}.${table}: ${e.message}`);
      }

      dump.schemas[schema].tables[table] = {
        columns: colsRes.rows,
        row_count: String(count),
        sample_rows: sample
      };
      console.log(`📦 ${schema}.${table} → rows: ${String(count)}; sample: ${sample.length}`);
    }

    // Views
    const viewsRes = await pool.query(`
      SELECT table_schema, table_name
      FROM information_schema.views
      WHERE table_schema NOT IN ('pg_catalog','information_schema')
      ORDER BY table_schema, table_name
    `);
    dump.views = viewsRes.rows;

    // Functions (names only)
    const funcsRes = await pool.query(`
      SELECT n.nspname AS schema, p.proname AS function_name
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname NOT IN ('pg_catalog','information_schema')
      ORDER BY n.nspname, p.proname
    `);
    dump.functions = funcsRes.rows;

    const outPath = path.resolve(process.cwd(), 'db_inventory_dump.json');
    fs.writeFileSync(outPath, JSON.stringify(dump, null, 2));
    console.log(`\n✅ Wrote inventory dump → ${outPath}`);
    console.log('   This includes table schemas, row counts, sample rows (masked), views, and functions.');

  } catch (err) {
    console.error('💥 Dump failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();