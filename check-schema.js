const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function checkDatabaseSchema() {
  console.log('🔍 CHECKING DATABASE SCHEMA');
  console.log('='.repeat(40));
  
  try {
    // Check existing profiles to see current structure
    console.log('\n📊 Current Profiles Structure:');
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error fetching profiles:', error.message);
    } else if (profiles.length > 0) {
      console.log('✅ Sample profile structure:');
      Object.keys(profiles[0]).forEach(key => {
        const value = profiles[0][key];
        const type = typeof value;
        console.log(`   ${key}: ${type} = ${value}`);
      });
    }
    
    // Check if workspace table exists
    console.log('\n🏢 Checking for workspace tables:');
    const { data: workspaces, error: workspaceError } = await supabase
      .from('workspaces')
      .select('*')
      .limit(1);
    
    if (workspaceError) {
      console.log('❌ No workspaces table or error:', workspaceError.message);
    } else {
      console.log('✅ Workspaces table exists with structure:');
      if (workspaces.length > 0) {
        Object.keys(workspaces[0]).forEach(key => {
          const value = workspaces[0][key];
          const type = typeof value;
          console.log(`   ${key}: ${type} = ${value}`);
        });
      } else {
        console.log('   (No workspace records found)');
      }
    }
    
    // Check current subscription status distribution
    console.log('\n📈 Current User Distribution:');
    const { data: statusDistribution } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_tier, count(*)', { count: 'exact' });
    
    console.log('   Status distribution:');
    if (statusDistribution) {
      const groupedData = {};
      statusDistribution.forEach(row => {
        const key = `${row.subscription_status}-${row.subscription_tier}`;
        groupedData[key] = (groupedData[key] || 0) + 1;
      });
      
      Object.entries(groupedData).forEach(([key, count]) => {
        console.log(`   ${key}: ${count} users`);
      });
    }
    
  } catch (error) {
    console.error('💥 Schema check failed:', error);
  }
}

checkDatabaseSchema();