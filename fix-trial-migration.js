const { createClient } = require('@supabase/supabase-js');

// Read environment variables directly
const supabaseUrl = 'https://ilcydjngyatddefgdjpg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsY3lkam5neWF0ZGRlZmdkanBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzgzNjM3NywiZXhwIjoyMDczNDEyMzc3fQ.1F5alhsFhzyfWBZjO-sArqOaAH9EWMIUmF8OGYu8plI';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('Required:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function runTrialMigration() {
  console.log('🔧 Adding has_used_trial column to profiles table...');
  
  try {
    // First check if column exists
    const { data: columns } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'profiles')
      .eq('column_name', 'has_used_trial');
    
    if (columns && columns.length > 0) {
      console.log('✅ Column has_used_trial already exists');
      return;
    }
    
    console.log('❌ Column missing, attempting manual database fix...');
    console.log('');
    console.log('🔧 MANUAL FIX REQUIRED:');
    console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste this SQL:');
    console.log('');
    console.log('-- Add has_used_trial column');
    console.log('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_used_trial BOOLEAN DEFAULT FALSE;');
    console.log('');
    console.log('-- Create index');
    console.log('CREATE INDEX IF NOT EXISTS idx_profiles_has_used_trial ON profiles(has_used_trial);');
    console.log('');
    console.log('-- Update existing users');
    console.log('UPDATE profiles SET has_used_trial = TRUE WHERE trial_ends_at IS NOT NULL;');
    console.log('');
    console.log('4. Click "Run" to execute the SQL');
    console.log('5. Restart your dev server: npm run dev');
    
  } catch (error) {
    console.error('❌ Migration check failed:', error);
  }
}

runTrialMigration();