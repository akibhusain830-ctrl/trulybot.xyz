// Comprehensive Payment Integration Test
// Copy this entire script and paste it into your browser console at http://localhost:3000

console.log("🚀 Testing Razorpay Payment Integration - All Fixes Applied");
console.log("="=50);

// Global test results
window.testResults = {
  auth: false,
  orders_table: false,
  order_creation: false,
  razorpay_sdk: false,
  csp: false
};

// Test 1: Check Authentication
async function testAuth() {
  console.log("\n🔐 Test 1: Authentication");
  try {
    const response = await fetch('/api/user/profile');
    const data = await response.json();
    
    if (response.ok && data.user) {
      console.log("✅ User authenticated:", data.user.id);
      console.log("📧 Email:", data.user.email);
      window.testUser = data.user;
      window.testResults.auth = true;
      return true;
    } else {
      console.log("❌ User not authenticated");
      console.log("Please log in to test the payment integration");
      return false;
    }
  } catch (error) {
    console.error("❌ Authentication test failed:", error);
    return false;
  }
}

// Test 2: Check Orders Table
async function testOrdersTable() {
  console.log("\n🗄️ Test 2: Orders Table Access");
  try {
    const response = await fetch('/api/test/orders');
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log("✅ Orders table exists and is accessible");
      console.log("📊 Has existing data:", data.hasData);
      window.testResults.orders_table = true;
      return true;
    } else {
      console.log("❌ Orders table error:", data.error);
      console.log("🔧 Error code:", data.code);
      console.log("💡 Hint:", data.hint || "Run the fix-orders-table.sql script");
      return false;
    }
  } catch (error) {
    console.error("❌ Orders table test failed:", error);
    return false;
  }
}

// Test 3: Test Order Creation API
async function testOrderCreation() {
  console.log("\n📝 Test 3: Order Creation API");
  
  if (!window.testUser) {
    console.log("❌ Skipping - user not authenticated");
    return false;
  }
  
  try {
    const orderData = {
      plan_id: 'basic',
      currency: 'INR',
      billing_period: 'monthly',
      user_id: window.testUser.id,
      notes: { test: 'integration_test', timestamp: Date.now() }
    };
    
    console.log("📤 Creating test order...");
    
    const response = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    
    console.log("📊 Response status:", response.status);
    
    const result = await response.json();
    console.log("📊 Response data:", result);
    
    if (response.ok && ((result.order && result.order.id) || (result.data && result.data.order && result.data.order.id))) {
      const order = result.order || result.data.order;
      console.log("✅ Order created successfully!");
      console.log("🆔 Order ID:", order.id);
      console.log("💰 Amount:", order.amount, order.currency);
      console.log("📋 Plan:", order.plan_id, "-", order.billing_period);
      window.testOrder = order;
      window.testResults.order_creation = true;
      return true;
    } else {
      console.log("❌ Order creation failed");
      console.log("🔍 Error details:", result.error || result.message || "Unknown error");
      return false;
    }
  } catch (error) {
    console.error("❌ Order creation test failed:", error);
    return false;
  }
}

// Test 4: Test Razorpay SDK Loading
async function testRazorpaySDK() {
  console.log("\n🔧 Test 4: Razorpay SDK Loading");
  try {
    // Check if already loaded
    if (typeof window.Razorpay !== 'undefined') {
      console.log("✅ Razorpay SDK already loaded");
      window.testResults.razorpay_sdk = true;
      return true;
    }
    
    console.log("📥 Loading Razorpay SDK...");
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    
    const loaded = await new Promise((resolve) => {
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
    
    if (loaded && typeof window.Razorpay !== 'undefined') {
      console.log("✅ Razorpay SDK loaded successfully");
      
      // Test creating instance
      try {
        const testInstance = new window.Razorpay({
          key: 'test_key',
          amount: 100,
          currency: 'INR',
          name: 'Test'
        });
        console.log("✅ Razorpay instance can be created");
        window.testResults.razorpay_sdk = true;
        return true;
      } catch (rzpError) {
        console.log("⚠️ Razorpay SDK loaded but instance creation failed:", rzpError.message);
        return false;
      }
    } else {
      console.log("❌ Failed to load Razorpay SDK");
      return false;
    }
  } catch (error) {
    console.error("❌ Razorpay SDK test failed:", error);
    return false;
  }
}

// Test 5: Test CSP
async function testCSP() {
  console.log("\n🛡️ Test 5: Content Security Policy");
  try {
    // Test script loading (should pass if SDK test passed)
    const scriptTest = window.testResults.razorpay_sdk;
    
    // Test iframe creation
    console.log("🖼️ Testing iframe creation...");
    const iframe = document.createElement('iframe');
    iframe.src = 'https://api.razorpay.com/v1/checkout/frame';
    iframe.style.display = 'none';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    
    const iframeTest = await new Promise((resolve) => {
      let resolved = false;
      
      iframe.onload = () => {
        if (!resolved) {
          resolved = true;
          resolve(true);
        }
      };
      
      iframe.onerror = () => {
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      };
      
      document.body.appendChild(iframe);
      
      // Timeout after 3 seconds
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      }, 3000);
    });
    
    iframe.remove();
    
    if (scriptTest && iframeTest) {
      console.log("✅ CSP allows Razorpay scripts and iframes");
      window.testResults.csp = true;
      return true;
    } else {
      console.log("❌ CSP blocking detected");
      console.log("   Script loading:", scriptTest ? "✅" : "❌");
      console.log("   Iframe creation:", iframeTest ? "✅" : "❌");
      return false;
    }
  } catch (error) {
    console.error("❌ CSP test failed:", error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log("🏃‍♂️ Running comprehensive payment integration tests...\n");
  
  const authResult = await testAuth();
  const tableResult = await testOrdersTable();
  const orderResult = await testOrderCreation();
  const sdkResult = await testRazorpaySDK();
  const cspResult = await testCSP();
  
  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(50));
  console.log("🔐 Authentication:    ", authResult ? "✅ PASS" : "❌ FAIL");
  console.log("🗄️ Orders Table:      ", tableResult ? "✅ PASS" : "❌ FAIL");
  console.log("📝 Order Creation:    ", orderResult ? "✅ PASS" : "❌ FAIL");
  console.log("🔧 Razorpay SDK:      ", sdkResult ? "✅ PASS" : "❌ FAIL");
  console.log("🛡️ CSP Configuration: ", cspResult ? "✅ PASS" : "❌ FAIL");
  console.log("=".repeat(50));
  
  const passedTests = Object.values(window.testResults).filter(Boolean).length;
  const totalTests = Object.keys(window.testResults).length;
  
  console.log(`\n🎯 Score: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log("\n🎉 ALL TESTS PASSED!");
    console.log("✅ Your Razorpay payment integration is ready!");
    console.log("✅ You can now test payments on the pricing page");
  } else {
    console.log("\n⚠️ Some tests failed. Issues to fix:");
    
    if (!window.testResults.auth) {
      console.log("   • Please log in to your application");
    }
    if (!window.testResults.orders_table) {
      console.log("   • Run the fix-orders-table.sql script in Supabase");
    }
    if (!window.testResults.order_creation) {
      console.log("   • Check server logs for order creation errors");
    }
    if (!window.testResults.razorpay_sdk) {
      console.log("   • Check CSP settings for Razorpay scripts");
    }
    if (!window.testResults.csp) {
      console.log("   • Update CSP to allow Razorpay domains");
    }
  }
  
  return passedTests === totalTests;
}

// Auto-run tests
console.log("Starting tests in 2 seconds...");
setTimeout(runAllTests, 2000);