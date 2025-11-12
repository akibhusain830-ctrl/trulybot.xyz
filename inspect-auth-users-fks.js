const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  if (!url || !key) {
    console.error('Missing Supabase env');
    process.exit(1);
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase.rpc('list_auth_user_fks');
  if (error) {
    console.error(error);
    process.exit(1);
  }
  for (const row of data) {
    console.log(`${row.table_name} | ${row.constraint_name} | ${row.delete_rule}`);
  }
}

main();

