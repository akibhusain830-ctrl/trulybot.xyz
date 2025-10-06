/**
 * Quick Validation Test Runner
 * Simple tests to validate basic functionality
 */

const BASE_URL = 'http://localhost:3000';

async function runQuickValidation() {
  console.log('🚀 Running Quick TrulyBot Validation Tests...');
  console.log('============================================');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Health Check
  try {
    console.log('🔍 Testing health endpoint...');
    const response = await fetch(`${BASE_URL}/api/health`);
    const result = {
      name: 'Health Check',
      passed: response.ok,
      status: response.status,
      details: response.ok ? 'Server is responding' : 'Server not responding'
    };
    results.tests.push(result);
    results.total++;
    if (result.passed) results.passed++;
    else results.failed++;
    console.log(`   ${result.passed ? '✅' : '❌'} ${result.name}: ${result.details}`);
  } catch (error) {
    const result = {
      name: 'Health Check',
      passed: false,
      status: 'ERROR',
      details: `Connection error: ${error.message}`
    };
    results.tests.push(result);
    results.total++;
    results.failed++;
    console.log(`   ❌ ${result.name}: ${result.details}`);
  }

  // Test 2: Widget API Security
  try {
    console.log('🔒 Testing widget API security...');
    const response = await fetch(`${BASE_URL}/api/widget/config/test-user`);
    const result = {
      name: 'Widget API Security',
      passed: response.status === 401 || response.status === 403,
      status: response.status,
      details: response.status === 401 || response.status === 403 
        ? 'Correctly rejects unauthorized access' 
        : 'May allow unauthorized access'
    };
    results.tests.push(result);
    results.total++;
    if (result.passed) results.passed++;
    else results.failed++;
    console.log(`   ${result.passed ? '✅' : '❌'} ${result.name}: ${result.details}`);
  } catch (error) {
    const result = {
      name: 'Widget API Security',
      passed: false,
      status: 'ERROR',
      details: `Test error: ${error.message}`
    };
    results.tests.push(result);
    results.total++;
    results.failed++;
    console.log(`   ❌ ${result.name}: ${result.details}`);
  }

  // Test 3: Chat API Security
  try {
    console.log('🤖 Testing chat API security...');
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'test' }]
      })
    });
    const result = {
      name: 'Chat API Security',
      passed: response.status === 401 || response.status === 403,
      status: response.status,
      details: response.status === 401 || response.status === 403 
        ? 'Correctly rejects unauthorized access' 
        : 'May allow unauthorized access'
    };
    results.tests.push(result);
    results.total++;
    if (result.passed) results.passed++;
    else results.failed++;
    console.log(`   ${result.passed ? '✅' : '❌'} ${result.name}: ${result.details}`);
  } catch (error) {
    const result = {
      name: 'Chat API Security',
      passed: false,
      status: 'ERROR',
      details: `Test error: ${error.message}`
    };
    results.tests.push(result);
    results.total++;
    results.failed++;
    console.log(`   ❌ ${result.name}: ${result.details}`);
  }

  // Test 4: Input Validation
  try {
    console.log('🛡️ Testing input validation...');
    const maliciousPayload = '<script>alert("xss")</script>';
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: maliciousPayload }]
      })
    });
    
    // Even if unauthorized, should not crash
    const result = {
      name: 'Input Validation',
      passed: response.status < 500, // No server error
      status: response.status,
      details: response.status < 500 
        ? 'API handles malicious input without crashing' 
        : 'API may be vulnerable to malicious input'
    };
    results.tests.push(result);
    results.total++;
    if (result.passed) results.passed++;
    else results.failed++;
    console.log(`   ${result.passed ? '✅' : '❌'} ${result.name}: ${result.details}`);
  } catch (error) {
    const result = {
      name: 'Input Validation',
      passed: false,
      status: 'ERROR',
      details: `Test error: ${error.message}`
    };
    results.tests.push(result);
    results.total++;
    results.failed++;
    console.log(`   ❌ ${result.name}: ${result.details}`);
  }

  // Test 5: Rate Limiting
  try {
    console.log('⏱️ Testing rate limiting...');
    const promises = Array.from({ length: 20 }, () => 
      fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'rate limit test' }]
        })
      })
    );
    
    const responses = await Promise.all(promises);
    const rateLimitedCount = responses.filter(r => r.status === 429).length;
    
    const result = {
      name: 'Rate Limiting',
      passed: rateLimitedCount > 0,
      status: `${rateLimitedCount}/20 rate limited`,
      details: rateLimitedCount > 0 
        ? 'Rate limiting is active' 
        : 'Rate limiting may not be working'
    };
    results.tests.push(result);
    results.total++;
    if (result.passed) results.passed++;
    else results.failed++;
    console.log(`   ${result.passed ? '✅' : '❌'} ${result.name}: ${result.details}`);
  } catch (error) {
    const result = {
      name: 'Rate Limiting',
      passed: false,
      status: 'ERROR',
      details: `Test error: ${error.message}`
    };
    results.tests.push(result);
    results.total++;
    results.failed++;
    console.log(`   ❌ ${result.name}: ${result.details}`);
  }

  // Summary
  console.log('\n📊 Test Summary');
  console.log('================');
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${results.passed} ✅`);
  console.log(`Failed: ${results.failed} ❌`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  const overallPassed = results.failed === 0;
  console.log(`\n🎯 Overall Status: ${overallPassed ? '✅ BASIC VALIDATION PASSED' : '❌ ISSUES DETECTED'}`);
  
  if (!overallPassed) {
    console.log('\n🚨 Failed Tests:');
    results.tests.filter(t => !t.passed).forEach(test => {
      console.log(`   - ${test.name}: ${test.details}`);
    });
  }

  return results;
}

// Run the validation
runQuickValidation().catch(console.error);