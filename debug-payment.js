// Quick debug script to test authentication
console.log('Testing authentication...');

// Test if we can access the current user
fetch('/api/auth/me')
  .then(res => res.json())
  .then(data => {
    console.log('Auth data:', data);
    if (data.user) {
      console.log('✅ User is authenticated:', data.user.id);
      // Test order creation with real user ID
      return fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: 'basic',
          currency: 'INR',
          billing_period: 'monthly',
          user_id: data.user.id,
          notes: { test: 'order' }
        }),
      });
    } else {
      console.log('❌ User is not authenticated');
      return null;
    }
  })
  .then(res => {
    if (res) {
      console.log('Order creation response status:', res.status);
      return res.json();
    }
    return null;
  })
  .then(orderData => {
    if (orderData) {
      console.log('Order creation result:', orderData);
    }
  })
  .catch(err => {
    console.error('Error:', err);
  });