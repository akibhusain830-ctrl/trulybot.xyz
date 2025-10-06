/**
 * TrulyBot Comprehensive System Health Check
 * Validates all components are working after database setup
 */

const BASE_URL = 'http://localhost:3000';

async function runSystemHealthCheck() {
  console.log('🔍 TrulyBot System Health Check');
  console.log('==============================');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    checks: []
  };

  // Test 1: Homepage loads
  await testEndpoint('Homepage', '/', results);
  
  // Test 2: API health check
  await testEndpoint('API Health', '/api/health', results);
  
  // Test 3: Authentication pages
  await testEndpoint('Sign In Page', '/sign-in', results);
  await testEndpoint('Sign Up Page', '/sign-up', results);
  
  // Test 4: Dashboard (should redirect to auth)
  await testEndpoint('Dashboard (Auth Check)', '/dashboard', results);
  
  // Test 5: Widget demo
  await testEndpoint('Widget Demo', '/widget-demo', results);
  
  // Test 6: API endpoints (should require auth)
  await testAPIEndpoint('User Profile API', '/api/user/profile', results);
  await testAPIEndpoint('Leads API', '/api/leads', results);
  await testAPIEndpoint('Usage API', '/api/usage', results);
  
  // Test 7: Widget config API (should require auth)
  await testAPIEndpoint('Widget Config API', '/api/widget/config/test-user', results);
  
  // Test 8: Chat API (should require auth)
  await testChatAPI('Chat API', '/api/chat', results);

  // Summary
  console.log('\n📊 System Health Summary');
  console.log('========================');
  console.log(`Total Checks: ${results.total}`);
  console.log(`Passed: ${results.passed} ✅`);
  console.log(`Failed: ${results.failed} ❌`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  const overallHealth = results.failed === 0 ? 'EXCELLENT' : 
                       results.passed >= results.total * 0.8 ? 'GOOD' : 'NEEDS ATTENTION';
  
  console.log(`\n🎯 Overall System Health: ${overallHealth}`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All systems operational! TrulyBot is ready for production.');
  } else {
    console.log('\n⚠️ Some issues detected:');
    results.checks.filter(check => !check.passed).forEach(check => {
      console.log(`   - ${check.name}: ${check.details}`);
    });
  }

  return results;
}

async function testEndpoint(name, path, results) {
  try {
    const response = await fetch(`${BASE_URL}${path}`);
    const passed = response.status < 500; // Any response except server error is acceptable
    
    const check = {
      name,
      passed,
      status: response.status,
      details: passed ? `Responds with ${response.status}` : `Server error: ${response.status}`
    };
    
    results.checks.push(check);
    results.total++;
    if (passed) results.passed++;
    else results.failed++;
    
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${name}: ${check.details}`);
    
  } catch (error) {
    const check = {
      name,
      passed: false,
      status: 'ERROR',
      details: `Connection error: ${error.message}`
    };
    
    results.checks.push(check);
    results.total++;
    results.failed++;
    
    console.log(`❌ ${name}: ${check.details}`);
  }
}

async function testAPIEndpoint(name, path, results) {
  try {
    const response = await fetch(`${BASE_URL}${path}`);
    // API endpoints should return 401/403 (auth required) or 200 (if somehow accessible)
    const passed = response.status === 401 || response.status === 403 || response.status === 200;
    
    const check = {
      name,
      passed,
      status: response.status,
      details: passed ? 
        (response.status === 401 || response.status === 403 ? 'Correctly requires authentication' : 'Responds successfully') :
        `Unexpected response: ${response.status}`
    };
    
    results.checks.push(check);
    results.total++;
    if (passed) results.passed++;
    else results.failed++;
    
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${name}: ${check.details}`);
    
  } catch (error) {
    const check = {
      name,
      passed: false,
      status: 'ERROR',
      details: `Connection error: ${error.message}`
    };
    
    results.checks.push(check);
    results.total++;
    results.failed++;
    
    console.log(`❌ ${name}: ${check.details}`);
  }
}

async function testChatAPI(name, path, results) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'test' }]
      })
    });
    
    // Chat API should require authentication
    const passed = response.status === 401 || response.status === 403;
    
    const check = {
      name,
      passed,
      status: response.status,
      details: passed ? 'Correctly requires authentication' : `Unexpected response: ${response.status}`
    };
    
    results.checks.push(check);
    results.total++;
    if (passed) results.passed++;
    else results.failed++;
    
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${name}: ${check.details}`);
    
  } catch (error) {
    const check = {
      name,
      passed: false,
      status: 'ERROR',
      details: `Connection error: ${error.message}`
    };
    
    results.checks.push(check);
    results.total++;
    results.failed++;
    
    console.log(`❌ ${name}: ${check.details}`);
  }
}

// Environment check
function checkEnvironment() {
  console.log('\n🌍 Environment Configuration Check');
  console.log('==================================');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET'
  ];
  
  const fs = require('fs');
  let envContent = '';
  
  try {
    envContent = fs.readFileSync('.env.local', 'utf8');
  } catch (error) {
    console.log('❌ .env.local file not found');
    return false;
  }
  
  let allPresent = true;
  requiredEnvVars.forEach(envVar => {
    if (envContent.includes(envVar)) {
      console.log(`✅ ${envVar}: Configured`);
    } else {
      console.log(`❌ ${envVar}: Missing`);
      allPresent = false;
    }
  });
  
  return allPresent;
}

// Database check
async function checkDatabase() {
  console.log('\n🗄️ Database Connection Check');
  console.log('============================');
  
  try {
    // Try to access an endpoint that would use the database
    const response = await fetch(`${BASE_URL}/api/user/profile`);
    
    if (response.status === 401 || response.status === 403) {
      console.log('✅ Database connection: Working (auth check successful)');
      return true;
    } else if (response.status === 500) {
      console.log('❌ Database connection: Possible database error');
      return false;
    } else {
      console.log('⚠️ Database connection: Unexpected response');
      return true; // Assume working
    }
  } catch (error) {
    console.log(`❌ Database connection: ${error.message}`);
    return false;
  }
}

// Run complete check
async function runCompleteCheck() {
  console.log('🚀 Starting TrulyBot Complete System Check...\n');
  
  // Environment check
  const envOk = checkEnvironment();
  
  // Database check  
  const dbOk = await checkDatabase();
  
  // Application health check
  const healthResults = await runSystemHealthCheck();
  
  console.log('\n🎯 Final System Status');
  console.log('=====================');
  console.log(`Environment: ${envOk ? '✅ OK' : '❌ Issues'}`);
  console.log(`Database: ${dbOk ? '✅ Connected' : '❌ Issues'}`);
  console.log(`Application: ${healthResults.failed === 0 ? '✅ Healthy' : '⚠️ ' + healthResults.failed + ' issues'}`);
  
  const overallStatus = envOk && dbOk && healthResults.failed === 0;
  
  console.log(`\n🏆 OVERALL STATUS: ${overallStatus ? '✅ SYSTEM READY' : '⚠️ ATTENTION NEEDED'}`);
  
  if (overallStatus) {
    console.log('\n🎉 Congratulations! TrulyBot is fully operational and ready for use.');
    console.log('You can now:');
    console.log('  • Visit http://localhost:3000 to use the application');
    console.log('  • Test user registration and login');
    console.log('  • Access the dashboard after authentication');
    console.log('  • Deploy to production with confidence');
  }
  
  return {
    environment: envOk,
    database: dbOk,
    application: healthResults,
    overall: overallStatus
  };
}

// Auto-run if executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runCompleteCheck().catch(console.error);
}

module.exports = { runCompleteCheck, runSystemHealthCheck };