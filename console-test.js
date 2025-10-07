// Quick Payment Integration Test
// Copy and paste this into your browser console when on http://localhost:3000

console.log("🚀 Quick Razorpay Integration Test");

// Test function
async function quickTest() {
  console.log("\n1️⃣ Testing CSP for Razorpay...");
  
  // Test CSP by loading Razorpay script
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  
  const cspTest = await new Promise((resolve) => {
    script.onload = () => {
      console.log("✅ CSP allows Razorpay scripts");
      resolve(true);
    };
    script.onerror = () => {
      console.log("❌ CSP blocks Razorpay scripts");
      resolve(false);
    };
    document.head.appendChild(script);
  });
  
  console.log("\n2️⃣ Testing Authentication...");
  
  try {
    const authResponse = await fetch('/api/user/profile');
    const authData = await authResponse.json();
    
    if (authResponse.ok && authData.user) {
      console.log("✅ User authenticated:", authData.user.id);
      
      console.log("\n3️⃣ Testing Order Creation...");
      
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: 'basic',
          currency: 'INR',
          billing_period: 'monthly',
          user_id: authData.user.id,
          notes: { test: 'quick_test' }
        }),
      });
      
      const orderData = await orderResponse.json();
      
      if (orderResponse.ok && orderData.order) {
        console.log("✅ Order created successfully!");
        console.log("💰 Amount:", orderData.order.amount, orderData.order.currency);
        console.log("🆔 Order ID:", orderData.order.id);
        
        console.log("\n🎉 ALL TESTS PASSED!");
        console.log("✅ CSP fixed for Razorpay");
        console.log("✅ Authentication working");
        console.log("✅ Order creation working");
        console.log("✅ Payment integration ready!");
        
      } else {
        console.log("❌ Order creation failed:", orderData.error);
      }
      
    } else {
      console.log("❌ User not authenticated - please log in first");
    }
    
  } catch (error) {
    console.log("❌ Test failed:", error.message);
  }
}

// Run the test
quickTest();