const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://etfhyxqtfbfrhvkozgwj.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkUsers() {
  console.log('🔍 Checking existing users...');
  
  try {
    // List auth users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error listing users:', authError);
      return;
    }
    
    console.log(`📊 Found ${authData.users.length} auth users:`);
    
    authData.users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.id}) - Created: ${user.created_at}`);
    });
    
    // Check profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, subscription_status, trial_ends_at, created_at');
      
    if (profileError) {
      console.log('❌ Error fetching profiles:', profileError);
    } else {
      console.log(`\n📊 Found ${profiles.length} profiles:`);
      profiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.email} - Status: ${profile.subscription_status} - Trial: ${profile.trial_ends_at}`);
      });
    }
    
    // If no users exist, create a test user
    if (authData.users.length === 0) {
      console.log('\n🆕 No users found. Creating a test user...');
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: 'test@example.com',
        password: 'testpassword123',
        email_confirm: true
      });
      
      if (createError) {
        console.error('❌ Error creating test user:', createError);
      } else {
        console.log('✅ Created test user:', newUser.user.email);
        console.log('📝 Credentials: test@example.com / testpassword123');
      }
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

checkUsers().then(() => {
  console.log('\n🏁 User check complete');
  process.exit(0);
});