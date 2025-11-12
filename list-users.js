const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  let page = 1;
  const perPage = 200;
  const all = [];
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
    all.push(...data.users.map(u => ({ id: u.id, email: u.email })));
    if (data.users.length < perPage) break;
    page++;
  }
  require('fs').writeFileSync('users.json', JSON.stringify(all, null, 2));
  console.log(`Wrote ${all.length} users to users.json`);
}

main();
