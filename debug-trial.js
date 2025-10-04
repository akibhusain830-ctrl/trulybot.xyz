const { createClient } = require('@supabase/supabase-js');

// Load environment variables manually
const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function debugTrial() {
  try {
    console.log('🔍 Testing database function existence...');
    
    // Test if function exists with a fake UUID
    const testUuid = '00000000-0000-0000-0000-000000000000';
    const { data, error } = await supabase.rpc('start_user_trial', { 
      p_user_id: testUuid 
    });
    
    console.log('Function response:', { data, error });
    
    if (error) {
      console.log('❌ Function error:', error.message);
      if (error.message.includes('function public.start_user_trial(uuid) does not exist')) {
        console.log('💡 Issue: Database function start_user_trial does not exist!');
        console.log('💡 Solution: Run database migration 009_atomic_trial_function.sql');
      }
    } else {
      console.log('✅ Function exists and responded');
      if (data && data.reason === 'profile_not_found') {
        console.log('✅ Function working correctly - would fail for non-existent user');
      }
    }
    
    // Check if profiles table has required columns
    console.log('\n🔍 Checking profiles table structure...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, has_used_trial, trial_ends_at, subscription_status')
      .limit(1);
    
    if (profileError) {
      console.log('❌ Profiles table error:', profileError.message);
      if (profileError.message.includes('has_used_trial')) {
        console.log('💡 Issue: has_used_trial column missing!');
        console.log('💡 Solution: Run migration 007_add_trial_tracking.sql');
      }
    } else {
      console.log('✅ Profiles table accessible');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

debugTrial();