#!/usr/bin/env node
/**
 * Robust User Profile Setup Script
 * 
 * This script sets up automatic profile creation and fixes existing users
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase configuration');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runRobustSetup() {
  console.log('🚀 Starting Robust User Profile Setup...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'database', 'migrations', '008_robust_user_profile_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Executing database migration...');
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split('-- =====================================================')
      .filter(statement => statement.trim().length > 0);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement.length === 0) continue;

      console.log(`   Executing section ${i + 1}/${statements.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.log(`   ⚠️ Section ${i + 1} warning:`, error.message);
        } else {
          console.log(`   ✅ Section ${i + 1} completed`);
        }
      } catch (err) {
        console.log(`   ⚠️ Section ${i + 1} skipped:`, err.message);
      }
    }

    console.log('\n🔍 Checking system status...');

    // Check auth users vs profiles
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const { data: profiles } = await supabase.from('profiles').select('id');
    const { data: workspaces } = await supabase.from('workspaces').select('id');

    console.log(`📊 System Status:`);
    console.log(`   Auth Users: ${authUsers?.users?.length || 0}`);
    console.log(`   Profiles: ${profiles?.length || 0}`);
    console.log(`   Workspaces: ${workspaces?.length || 0}`);

    // Run the missing profiles function
    console.log('\n🔧 Creating missing profiles...');
    const { data: fixedProfiles, error: fixError } = await supabase
      .rpc('create_missing_profiles');

    if (fixError) {
      console.error('❌ Error creating missing profiles:', fixError);
    } else if (fixedProfiles && fixedProfiles.length > 0) {
      console.log(`✅ Created ${fixedProfiles.length} missing profiles:`);
      fixedProfiles.forEach(profile => {
        console.log(`   - ${profile.email} (${profile.user_id})`);
      });
    } else {
      console.log('✅ All users already have profiles');
    }

    // Final verification
    console.log('\n🔍 Final verification...');
    const { data: finalCheck } = await supabase
      .from('profiles')
      .select('id, email, workspace_id, trial_ends_at, subscription_status');

    if (finalCheck && finalCheck.length > 0) {
      console.log('✅ Profile setup completed successfully!');
      console.log('\nActive Profiles:');
      finalCheck.forEach(profile => {
        const trialStatus = new Date(profile.trial_ends_at) > new Date() ? 'Active' : 'Expired';
        console.log(`   - ${profile.email}: ${profile.subscription_status} (Trial: ${trialStatus})`);
      });
    }

    console.log('\n🎉 Robust setup completed!');
    console.log('\nNext steps:');
    console.log('1. Test user registration to verify automatic profile creation');
    console.log('2. Check that existing users can now access the start-trial page');
    console.log('3. Verify that workspaces are created properly');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Helper function to execute SQL directly (for systems that support it)
async function executeSQL(sql) {
  try {
    // This is a simplified approach - in production you might want to use a direct SQL connection
    const { error } = await supabase.rpc('exec_sql_statement', { statement: sql });
    return { error };
  } catch (err) {
    return { error: err };
  }
}

if (require.main === module) {
  runRobustSetup().catch(console.error);
}

module.exports = { runRobustSetup };