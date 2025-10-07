// Payment Integration Test Script
// Run this in the browser console when logged in

console.log('🧪 Testing Razorpay Payment Integration...');

// Test 1: Check if user is authenticated
async function testAuthentication() {
  console.log('\n📋 Test 1: Authentication Check');
  try {
    const response = await fetch('/api/user/profile');
    const data = await response.json();
    
    if (response.ok && data.user) {
      console.log('✅ User authenticated:', data.user.id);
      console.log('📧 Email:', data.user.email);
      return data.user;
    } else {
      console.log('❌ User not authenticated');
      return null;
    }
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    return null;
  }
}

// Test 2: Test order creation API
async function testOrderCreation(user) {
  console.log('\n📋 Test 2: Order Creation API');
  try {
    const orderData = {
      plan_id: 'basic',
      currency: 'INR',
      billing_period: 'monthly',
      user_id: user.id,
      notes: { test: 'payment_integration_test' }
    };
    
    console.log('📤 Creating order with data:', orderData);
    
    const response = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    
    console.log('📊 Response status:', response.status);
    
    const result = await response.json();
    console.log('📊 Response data:', result);
    
    if (response.ok && result.order) {
      console.log('✅ Order created successfully!');
      console.log('🎯 Order ID:', result.order.id);
      console.log('💰 Amount:', result.order.amount, result.order.currency);
      return result.order;
    } else {
      console.log('❌ Order creation failed:', result.error || 'Unknown error');
      return null;
    }
  } catch (error) {
    console.error('❌ Order creation test failed:', error);
    return null;
  }
}

// Test 3: Check CSP by testing Razorpay script loading
async function testRazorpayLoading() {
  console.log('\n📋 Test 3: Razorpay SDK Loading');
  try {
    // Check if Razorpay script can be loaded
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    
    return new Promise((resolve) => {
      script.onload = () => {
        console.log('✅ Razorpay SDK loaded successfully');
        console.log('✅ CSP allows Razorpay scripts');
        resolve(true);
      };
      
      script.onerror = () => {
        console.log('❌ Failed to load Razorpay SDK');
        console.log('❌ CSP might be blocking Razorpay');
        resolve(false);
      };
      
      document.head.appendChild(script);
    });
  } catch (error) {
    console.error('❌ Razorpay loading test failed:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Payment Integration Tests...\n');
  
  // Test authentication
  const user = await testAuthentication();
  if (!user) {
    console.log('\n❌ Cannot proceed without authentication');
    return;
  }
  
  // Test order creation
  const order = await testOrderCreation(user);
  
  // Test Razorpay loading
  const razorpayLoaded = await testRazorpayLoading();
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('✅ Authentication:', user ? 'PASS' : 'FAIL');
  console.log('✅ Order Creation:', order ? 'PASS' : 'FAIL');
  console.log('✅ Razorpay Loading:', razorpayLoaded ? 'PASS' : 'FAIL');
  
  if (user && order && razorpayLoaded) {
    console.log('\n🎉 All tests passed! Payment integration should work.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the issues above.');
  }
}

// Auto-run tests
runAllTests();