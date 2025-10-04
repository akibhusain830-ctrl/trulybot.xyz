const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabaseFunctions() {
  console.log('🔍 Checking database functions...');
  
  // Check if get_or_create_profile function exists
  try {
    const { data, error } = await supabase.rpc('get_or_create_profile', {
      p_user_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
      p_email: 'test@example.com'
    });
    
    if (error) {
      console.log('❌ get_or_create_profile function error:', error);
    } else {
      console.log('✅ get_or_create_profile function works:', data);
    }
  } catch (err) {
    console.log('❌ get_or_create_profile function failed:', err.message);
  }
  
  // Check if create_missing_profiles function exists
  try {
    const { data, error } = await supabase.rpc('create_missing_profiles');
    
    if (error) {
      console.log('❌ create_missing_profiles function error:', error);
    } else {
      console.log('✅ create_missing_profiles function works:', data);
    }
  } catch (err) {
    console.log('❌ create_missing_profiles function failed:', err.message);
  }
  
  // Check users and profiles count
  try {
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, subscription_status, trial_ends_at');
    
    console.log('\n📊 Current Status:');
    console.log(`   Auth Users: ${users?.users?.length || 0}`);
    console.log(`   Profiles: ${profiles?.length || 0}`);
    
    if (profiles && profiles.length > 0) {
      console.log('\n👤 Existing profiles:');
      profiles.forEach(profile => {
        console.log(`   - ${profile.email} | Status: ${profile.subscription_status} | Trial: ${profile.trial_ends_at}`);
      });
    }
  } catch (err) {
    console.log('❌ Failed to check users/profiles:', err.message);
  }
}

checkDatabaseFunctions().then(() => {
  console.log('\n🏁 Database check complete');
  process.exit(0);
}).catch(err => {
  console.error('💥 Database check failed:', err);
  process.exit(1);
});