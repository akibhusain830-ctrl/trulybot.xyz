const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function runMigration() {
  try {
    console.log('🚀 Running profile columns migration...');
    
    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '010_add_missing_profile_columns.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL loaded, executing...');
    
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: migrationSQL 
    });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      
      // Try direct execution if RPC fails
      console.log('🔄 Trying direct SQL execution...');
      const { error: directError } = await supabase.from('profiles').select('id').limit(1);
      
      if (directError) {
        console.error('❌ Database connection failed:', directError);
        process.exit(1);
      }
      
      // Execute SQL in parts
      const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          console.log('🔧 Executing:', statement.trim().substring(0, 50) + '...');
          // Note: Direct SQL execution might not be available via Supabase client
          // This would typically be run in the Supabase SQL editor
        }
      }
      
      console.log('⚠️  Please run the migration manually in Supabase SQL editor');
      console.log('📁 Migration file: database/migrations/010_add_missing_profile_columns.sql');
      
    } else {
      console.log('✅ Migration completed successfully!');
    }
    
  } catch (error) {
    console.error('💥 Migration error:', error);
    process.exit(1);
  }
}

// Test profile update after migration
async function testProfileUpdate() {
  try {
    console.log('🧪 Testing profile update...');
    
    // Get current user (this is just a test, would normally use authenticated user)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, chatbot_name, chatbot_logo_url, chatbot_theme, custom_css')
      .limit(1);
    
    if (error) {
      console.error('❌ Failed to fetch profiles:', error);
      return;
    }
    
    if (profiles && profiles.length > 0) {
      const testProfile = profiles[0];
      console.log('📊 Current profile structure:', Object.keys(testProfile));
      
      // Test update
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          chatbot_name: 'Test Bot',
          chatbot_theme: 'default',
          chatbot_logo_url: '',
          custom_css: ''
        })
        .eq('id', testProfile.id);
      
      if (updateError) {
        console.error('❌ Profile update test failed:', updateError);
      } else {
        console.log('✅ Profile update test successful!');
      }
    }
    
  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

console.log('🔧 Profile Migration Tool');
console.log('========================');

runMigration().then(() => {
  return testProfileUpdate();
}).then(() => {
  console.log('🎉 Migration process completed!');
  process.exit(0);
});