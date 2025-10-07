// ROBUSTNESS TEST: Payment System Backend Testing
// Node.js version for server-side testing

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

console.log("🔧 PAYMENT SYSTEM ROBUSTNESS TEST (Node.js)");
console.log("=".repeat(50));

// Configuration
const config = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  BASE_URL: 'http://localhost:3000' // Adjust if different
};

// Test state
const testState = {
  results: {},
  failures: [],
  userId: null,
  authToken: null
};

// Helper function to make API requests
async function makeRequest(endpoint, options = {}) {
  const url = config.BASE_URL + endpoint;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(testState.authToken && { 'Authorization': `Bearer ${testState.authToken}` })
    }
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, finalOptions);
    const data = await response.json();
    return { response, data, success: response.ok };
  } catch (error) {
    return { error, success: false };
  }
}

// Test 1: Database Connection Robustness
async function testDatabaseConnection() {
  console.log("\n🗄️  Test 1: Database Connection Robustness");
  
  try {
    if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
      console.log("❌ Missing Supabase configuration");
      testState.failures.push("Missing Supabase environment variables");
      return false;
    }

    const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
    
    // Test connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.log("❌ Database connection failed:", error.message);
      testState.failures.push(`Database connection: ${error.message}`);
      return false;
    }
    
    console.log("✅ Database connection successful");
    
    // Test orders table exists
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('count')
      .limit(1);
    
    if (orderError) {
      console.log("❌ Orders table access failed:", orderError.message);
      testState.failures.push(`Orders table: ${orderError.message}`);
      return false;
    }
    
    console.log("✅ Orders table accessible");
    return true;
    
  } catch (error) {
    console.log("❌ Database test failed:", error.message);
    testState.failures.push(`Database test: ${error.message}`);
    return false;
  }
}

// Test 2: Payment API Endpoints
async function testPaymentEndpoints() {
  console.log("\n💳 Test 2: Payment API Endpoints");
  
  try {
    // Test create order endpoint (should fail without auth)
    const createOrderResult = await makeRequest('/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({
        plan_id: 'basic',
        amount: 9900
      })
    });
    
    if (createOrderResult.success) {
      console.log("⚠️  Create order succeeded without auth (potential security issue)");
      testState.failures.push("Create order endpoint allows unauthenticated requests");
    } else {
      console.log("✅ Create order properly requires authentication");
    }
    
    // Test verify payment endpoint
    const verifyResult = await makeRequest('/api/payments/verify-payment', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: 'test_order',
        razorpay_payment_id: 'test_payment', 
        razorpay_signature: 'test_signature'
      })
    });
    
    if (verifyResult.success) {
      console.log("⚠️  Verify payment succeeded with fake data");
      testState.failures.push("Payment verification accepts invalid signatures");
    } else {
      console.log("✅ Payment verification properly rejects invalid data");
    }
    
    // Test subscription endpoints
    const statusResult = await makeRequest('/api/subscription/status');
    if (statusResult.success) {
      console.log("⚠️  Subscription status accessible without auth");
      testState.failures.push("Subscription status endpoint allows unauthenticated access");
    } else {
      console.log("✅ Subscription status properly requires authentication");
    }
    
    return true;
    
  } catch (error) {
    console.log("❌ Payment endpoints test failed:", error.message);
    testState.failures.push(`Payment endpoints: ${error.message}`);
    return false;
  }
}

// Test 3: Error Handling Robustness
async function testErrorHandling() {
  console.log("\n🚨 Test 3: Error Handling Robustness");
  
  try {
    // Test malformed JSON
    const malformedResult = await makeRequest('/api/payments/create-order', {
      method: 'POST',
      body: 'invalid json'
    });
    
    if (malformedResult.data && malformedResult.data.error) {
      console.log("✅ Malformed JSON handled gracefully");
    } else {
      console.log("❌ Malformed JSON not handled properly");
      testState.failures.push("Poor malformed JSON handling");
    }
    
    // Test missing required fields
    const missingFieldsResult = await makeRequest('/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({})
    });
    
    if (missingFieldsResult.data && missingFieldsResult.data.error) {
      console.log("✅ Missing fields handled gracefully");
    } else {
      console.log("❌ Missing fields not validated properly");
      testState.failures.push("Poor missing fields validation");
    }
    
    // Test oversized requests
    const largeData = 'x'.repeat(1000000); // 1MB of data
    const oversizedResult = await makeRequest('/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ data: largeData })
    });
    
    if (!oversizedResult.success) {
      console.log("✅ Oversized requests rejected");
    } else {
      console.log("⚠️  Oversized requests accepted (potential DoS vulnerability)");
      testState.failures.push("Oversized requests not limited");
    }
    
    return true;
    
  } catch (error) {
    console.log("❌ Error handling test failed:", error.message);
    testState.failures.push(`Error handling: ${error.message}`);
    return false;
  }
}

// Test 4: Configuration Validation
async function testConfiguration() {
  console.log("\n⚙️  Test 4: Configuration Validation");
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_RAZORPAY_KEY_ID'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log("❌ Missing environment variables:", missingVars.join(', '));
    testState.failures.push(`Missing env vars: ${missingVars.join(', ')}`);
    return false;
  }
  
  console.log("✅ All required environment variables present");
  
  // Test Razorpay configuration
  if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_ID.startsWith('rzp_')) {
    console.log("❌ Invalid Razorpay key ID format");
    testState.failures.push("Invalid Razorpay key ID format");
    return false;
  }
  
  console.log("✅ Razorpay configuration appears valid");
  return true;
}

// Test 5: Rate Limiting and Security
async function testSecurity() {
  console.log("\n🛡️  Test 5: Security and Rate Limiting");
  
  try {
    // Test rapid requests (simulate DDoS)
    const requests = [];
    for (let i = 0; i < 10; i++) {
      requests.push(makeRequest('/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ plan_id: 'basic' })
      }));
    }
    
    const results = await Promise.all(requests);
    const successCount = results.filter(r => r.success).length;
    
    if (successCount === 10) {
      console.log("⚠️  No rate limiting detected (potential vulnerability)");
      testState.failures.push("No rate limiting on payment endpoints");
    } else {
      console.log("✅ Some rate limiting appears to be in place");
    }
    
    // Test SQL injection attempts
    const sqlInjectionAttempts = [
      "'; DROP TABLE orders; --",
      "1' OR '1'='1",
      "admin'/*",
      "1; DELETE FROM profiles; --"
    ];
    
    for (const injection of sqlInjectionAttempts) {
      const result = await makeRequest('/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ plan_id: injection })
      });
      
      if (result.success) {
        console.log("⚠️  SQL injection attempt succeeded:", injection);
        testState.failures.push(`SQL injection vulnerability: ${injection}`);
      }
    }
    
    console.log("✅ SQL injection tests completed");
    return true;
    
  } catch (error) {
    console.log("❌ Security test failed:", error.message);
    testState.failures.push(`Security test: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runRobustnessTests() {
  console.log("🚀 Starting comprehensive robustness tests...\n");
  
  const tests = [
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'Payment Endpoints', fn: testPaymentEndpoints },
    { name: 'Error Handling', fn: testErrorHandling },
    { name: 'Configuration', fn: testConfiguration },
    { name: 'Security', fn: testSecurity }
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      testState.results[test.name] = result;
      if (result) passedTests++;
    } catch (error) {
      console.log(`❌ Test ${test.name} crashed:`, error.message);
      testState.failures.push(`${test.name} crashed: ${error.message}`);
      testState.results[test.name] = false;
    }
  }
  
  // Final report
  console.log("\n" + "=".repeat(50));
  console.log("📊 ROBUSTNESS TEST RESULTS");
  console.log("=".repeat(50));
  
  console.log(`\n✅ Passed: ${passedTests}/${tests.length} tests`);
  console.log(`❌ Failed: ${tests.length - passedTests}/${tests.length} tests`);
  
  if (testState.failures.length > 0) {
    console.log("\n🚨 CRITICAL ISSUES FOUND:");
    testState.failures.forEach((failure, index) => {
      console.log(`${index + 1}. ${failure}`);
    });
    
    console.log("\n💡 RECOMMENDATIONS:");
    console.log("1. Fix critical security vulnerabilities immediately");
    console.log("2. Implement proper rate limiting");
    console.log("3. Add comprehensive input validation");
    console.log("4. Review authentication flows");
    console.log("5. Test payment flow end-to-end with real auth");
  } else {
    console.log("\n🎉 All robustness tests passed!");
    console.log("System appears to be well-protected against common failure modes.");
  }
  
  console.log("\n🔍 NEXT STEPS:");
  console.log("1. Run this test with authenticated user session");
  console.log("2. Test actual payment flow with Razorpay test keys");
  console.log("3. Monitor logs during high-load scenarios");
  console.log("4. Implement automated monitoring for production");
  
  return {
    passed: passedTests,
    total: tests.length,
    failures: testState.failures,
    results: testState.results
  };
}

// Check if this is being run directly
if (require.main === module) {
  runRobustnessTests()
    .then((results) => {
      process.exit(results.failures.length > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error("Test runner crashed:", error);
      process.exit(1);
    });
}

module.exports = { runRobustnessTests, testState };