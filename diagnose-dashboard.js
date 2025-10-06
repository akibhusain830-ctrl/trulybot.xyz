const fs = require('fs');
const path = require('path');

console.log('🔍 TrulyBot Dashboard Diagnostic Report');
console.log('=====================================\n');

// Check 1: Environment Variables
console.log('1. Environment Variables Check:');
try {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = envContent.split('\n').filter(line => line.includes('=') && !line.startsWith('#'));
    
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'OPENAI_API_KEY',
      'NEXT_PUBLIC_RAZORPAY_KEY_ID',
      'RAZORPAY_KEY_ID',
      'RAZORPAY_KEY_SECRET'
    ];
    
    console.log(`   Found ${envVars.length} environment variables`);
    
    requiredVars.forEach(varName => {
      const found = envVars.some(line => line.startsWith(varName + '='));
      console.log(`   ${found ? '✅' : '❌'} ${varName}`);
    });
  } else {
    console.log('   ❌ .env.local file not found');
  }
} catch (e) {
  console.log('   ❌ Error reading .env.local:', e.message);
}

// Check 2: Critical API Routes
console.log('\n2. API Routes Check:');
const apiRoutes = [
  'src/app/api/health/route.ts',
  'src/app/api/text-upload/route.ts',
  'src/app/api/usage/route.ts',
  'src/app/api/user/profile/route.ts',
  'src/app/api/payments/create-order/route.ts'
];

apiRoutes.forEach(route => {
  const exists = fs.existsSync(path.join(__dirname, route));
  console.log(`   ${exists ? '✅' : '❌'} ${route}`);
});

// Check 3: Dashboard Components
console.log('\n3. Dashboard Components Check:');
const components = [
  'src/app/dashboard/page.tsx',
  'src/app/dashboard/settings/page.tsx',
  'src/components/dashboard/KnowledgeBaseManager.tsx',
  'src/lib/api/dashboard.ts'
];

components.forEach(comp => {
  const exists = fs.existsSync(path.join(__dirname, comp));
  console.log(`   ${exists ? '✅' : '❌'} ${comp}`);
});

// Check 4: Build Status
console.log('\n4. Build Status Check:');
try {
  const { execSync } = require('child_process');
  console.log('   Running TypeScript check...');
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('   ✅ TypeScript compilation successful');
} catch (e) {
  console.log('   ❌ TypeScript compilation failed:');
  console.log('   ', e.message.split('\n')[0]);
}

// Check 5: Database Schema Script
console.log('\n5. Database Schema Requirements:');
const sqlScript = `
-- Required tables and columns for dashboard functionality
-- Run this in Supabase SQL Editor:

-- 1. Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_name text NOT NULL,
    status text NOT NULL,
    current_period_end timestamptz,
    created_at timestamptz DEFAULT now()
);

-- 2. Storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES (gen_random_uuid(), 'chatbot-assets', true)
ON CONFLICT (name) DO UPDATE SET public = true;

-- 3. Missing columns
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS workspace_id uuid;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS chatbot_logo_url text;
`;

fs.writeFileSync('REQUIRED_SQL_FIXES.sql', sqlScript);
console.log('   📝 Created REQUIRED_SQL_FIXES.sql - run this in Supabase');

console.log('\n=====================================');
console.log('💡 DIAGNOSIS COMPLETE');
console.log('=====================================');
console.log('Next steps:');
console.log('1. Fix any ❌ items above');
console.log('2. Run REQUIRED_SQL_FIXES.sql in Supabase');
console.log('3. Restart dev server');
console.log('4. Test dashboard at http://localhost:3001/dashboard');