const fs = require('fs');
const path = require('path');

console.log('📋 Database Migration SQL for Supabase');
console.log('=====================================\n');

try {
  const migrationPath = path.join(__dirname, 'database', 'migrations', '008_robust_user_profile_system.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`);
    process.exit(1);
  }
  
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('🚀 COPY THE FOLLOWING SQL AND RUN IT IN SUPABASE SQL EDITOR:');
  console.log('=' .repeat(70));
  console.log(migrationSQL);
  console.log('=' .repeat(70));
  console.log('\n✅ Steps to complete:');
  console.log('1. Select ALL the SQL above (Ctrl+A)');
  console.log('2. Copy it (Ctrl+C)');
  console.log('3. Go to your Supabase Dashboard → SQL Editor');
  console.log('4. Paste and run the SQL');
  console.log('5. Come back here and test the authentication!');
  
} catch (error) {
  console.error('❌ Error reading migration file:', error.message);
}