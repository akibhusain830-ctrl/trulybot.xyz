const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  if (!url || !key) {
    console.error('Missing Supabase env');
    process.exit(1);
  }
  const ids = process.argv.slice(2);
  if (ids.length === 0) {
    console.error('Provide user ids');
    process.exit(1);
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const fs = require('fs');
  for (const id of ids) {
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) {
      const msg = `FAIL ${id} ${error.message}`;
      console.log(msg);
      fs.appendFileSync('delete-log.txt', msg + '\n');
    } else {
      const msg = `OK ${id}`;
      console.log(msg);
      fs.appendFileSync('delete-log.txt', msg + '\n');
    }
  }
}

main();
