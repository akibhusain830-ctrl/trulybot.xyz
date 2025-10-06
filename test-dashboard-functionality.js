// Dashboard Functionality Test Script
// Run this in browser console on localhost:3001/dashboard

console.log('🔍 Testing TrulyBot Dashboard Functionality...');

// Test 1: Check if user is authenticated
console.log('\n1. Testing Authentication:');
try {
  const user = window.supabase?.auth?.getUser();
  if (user) {
    console.log('✅ Auth client available');
  } else {
    console.log('❌ Auth client not available');
  }
} catch (e) {
  console.log('❌ Auth error:', e.message);
}

// Test 2: Test API endpoints
console.log('\n2. Testing API Endpoints:');

const testEndpoints = [
  '/api/health',
  '/api/usage',
  '/api/text-upload',
  '/api/user/profile'
];

async function testAPIs() {
  for (const endpoint of testEndpoints) {
    try {
      const response = await fetch(endpoint, { method: 'GET' });
      console.log(`${response.ok ? '✅' : '❌'} ${endpoint}: ${response.status}`);
    } catch (e) {
      console.log(`❌ ${endpoint}: ${e.message}`);
    }
  }
}

testAPIs();

// Test 3: Test Supabase connection
console.log('\n3. Testing Supabase Connection:');
async function testSupabase() {
  try {
    if (window.supabase) {
      const { data, error } = await window.supabase.from('profiles').select('count').limit(1);
      if (error) {
        console.log('❌ Supabase error:', error.message);
      } else {
        console.log('✅ Supabase connected');
      }
    } else {
      console.log('❌ Supabase client not available');
    }
  } catch (e) {
    console.log('❌ Supabase test failed:', e.message);
  }
}

testSupabase();

// Test 4: Check for console errors
console.log('\n4. Current Console Errors:');
const originalError = console.error;
const errors = [];
console.error = function(...args) {
  errors.push(args.join(' '));
  originalError.apply(console, args);
};

setTimeout(() => {
  console.log('Recent errors:');
  errors.forEach(error => console.log('❌', error));
  if (errors.length === 0) {
    console.log('✅ No recent console errors');
  }
}, 3000);

// Test 5: Check if critical elements exist
console.log('\n5. Testing Dashboard Elements:');
const elements = [
  { name: 'Knowledge Base Upload', selector: '[data-testid="knowledge-upload"], input[type="file"], button:contains("Add to Knowledge")' },
  { name: 'Logo Upload', selector: '[data-testid="logo-upload"], input[accept*="image"]' },
  { name: 'Save Settings Button', selector: 'button:contains("Save"), [data-testid="save-settings"]' },
  { name: 'Settings Form', selector: 'form, [data-testid="settings-form"]' }
];

elements.forEach(({ name, selector }) => {
  const element = document.querySelector(selector) || 
                  [...document.querySelectorAll('button')].find(btn => btn.textContent.includes(name.split(' ')[0]));
  console.log(`${element ? '✅' : '❌'} ${name}`);
});

console.log('\n🔍 Dashboard test complete. Check results above.');
console.log('If you see ❌ errors, those are the issues that need fixing.');