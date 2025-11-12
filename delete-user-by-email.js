const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function findUserByEmail(supabase, email) {
  let page = 1;
  const perPage = 200;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const hit = data.users.find(u => (u.email || '').toLowerCase() === email.toLowerCase());
    if (hit) return hit;
    if (data.users.length < perPage) return null;
    page++;
  }
}

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node delete-user-by-email.js <email>');
    process.exit(1);
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const user = await findUserByEmail(supabase, email);
  if (!user) {
    console.error('User not found:', email);
    process.exit(2);
  }
  console.log('Deleting user', user.id, user.email);
  const { error } = await supabase.auth.admin.deleteUser(user.id);
  if (error) {
    console.error('Delete error:', error.message);
    process.exit(3);
  } else {
    console.log('Deleted:', user.id);
  }
}

main();

