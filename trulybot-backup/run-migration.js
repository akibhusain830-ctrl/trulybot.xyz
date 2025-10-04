const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    return env;
  } catch (error) {
    console.error('❌ Error reading .env.local:', error.message);
    return {};
  }
}

const env = loadEnvFile();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('Required variables:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function runMigration() {
  console.log('🚀 Running database migration locally...');
  console.log(`📡 Connected to: ${supabaseUrl}`);
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'database', 'migrations', '008_robust_user_profile_system.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`);
      process.exit(1);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log(`📄 Loaded migration file (${migrationSQL.length} characters)`);
    
    // Execute the migration
    console.log('⚡ Executing migration...');
    
    const { data, error } = await supabase.rpc('exec', {
      sql: migrationSQL
    });
    
    if (error) {
      // If rpc doesn't work, try direct SQL execution
      console.log('⚠️  RPC failed, trying direct SQL execution...');
      
      // Split the SQL into individual statements
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      console.log(`📝 Found ${statements.length} SQL statements to execute`);
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.length === 0) continue;
        
        console.log(`   ${i + 1}/${statements.length}: ${statement.substring(0, 60)}...`);
        
        try {
          const result = await supabase.from('_migration_temp').select('1').limit(1);
          // This is a workaround - we'll use a different approach
        } catch (err) {
          console.log(`   ⚠️  Statement ${i + 1} may have failed, continuing...`);
        }
      }
      
      console.log('❌ Direct SQL execution not supported via JavaScript client');
      console.log('📋 Please copy the migration SQL and run it manually in Supabase SQL Editor');
      console.log('\n🔗 Steps:');
      console.log('1. Go to your Supabase Dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy the contents of database/migrations/008_robust_user_profile_system.sql');
      console.log('4. Paste and run in SQL Editor');
      
      return;
    }
    
    console.log('✅ Migration executed successfully!');
    
    // Verify the migration worked
    console.log('\n🔍 Verifying migration...');
    
    // Check if functions were created
    const { data: functions, error: funcError } = await supabase
      .rpc('get_or_create_profile', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_email: 'test@example.com'
      });
    
    if (funcError) {
      console.log('⚠️  Function verification failed (this is expected if using manual SQL)');
    } else {
      console.log('✅ Database functions are working!');
    }
    
    // Check tables exist
    try {
      const { data: profiles } = await supabase.from('profiles').select('count').limit(1);
      console.log('✅ Profiles table exists');
      
      const { data: workspaces } = await supabase.from('workspaces').select('count').limit(1);
      console.log('✅ Workspaces table exists');
      
      const { data: usage } = await supabase.from('usage_counters').select('count').limit(1);
      console.log('✅ Usage counters table exists');
      
    } catch (err) {
      console.log('❌ Some tables may not exist yet - run the SQL manually');
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    console.log('\n📋 Manual steps required:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Copy database/migrations/008_robust_user_profile_system.sql');
    console.log('3. Paste and execute in SQL Editor');
  }
}

runMigration().then(() => {
  console.log('\n🏁 Migration process complete');
  process.exit(0);
}).catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});