/**
 * Debug Pricing Geolocation for Indian Users
 * Run this script to debug why USD is showing instead of INR
 */

// Clear any cached results first
localStorage.removeItem('user_currency');

console.log('🔍 Debugging TrulyBot Pricing Currency Detection...\n');

// Test each geolocation service
async function debugGeolocationServices() {
  console.log('📍 Testing Individual Geolocation Services:\n');

  // Test 1: IPInfo (Primary)
  console.log('1️⃣ Testing IPInfo...');
  try {
    const response = await fetch('https://ipinfo.io/json', {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ IPInfo response:', data);
      console.log('   Country:', data.country);
      console.log('   Is India?:', data.country === 'IN');
      if (data.country === 'IN') {
        console.log('🇮🇳 IPInfo detects India - should show INR');
      }
    } else {
      console.log('❌ IPInfo failed with status:', response.status);
    }
  } catch (error) {
    console.log('❌ IPInfo error:', error.message);
  }

  console.log('\n2️⃣ Testing IPApi.co...');
  try {
    const response = await fetch('https://ipapi.co/json/', {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ IPApi.co response:', data);
      console.log('   Country Code:', data.country_code);
      console.log('   Is India?:', data.country_code === 'IN');
      if (data.country_code === 'IN') {
        console.log('🇮🇳 IPApi.co detects India - should show INR');
      }
    } else {
      console.log('❌ IPApi.co failed with status:', response.status);
    }
  } catch (error) {
    console.log('❌ IPApi.co error:', error.message);
  }

  console.log('\n3️⃣ Testing Cloudflare (only works on Cloudflare CDN)...');
  try {
    const response = await fetch('/cdn-cgi/trace', { 
      cache: 'no-store',
      signal: AbortSignal.timeout(3000) 
    });
    
    if (response.ok) {
      const text = await response.text();
      console.log('✅ Cloudflare trace:', text);
      const lines = text.split('\n');
      const countryLine = lines.find(line => line.startsWith('loc='));
      const country = countryLine ? countryLine.split('=')[1] : 'Unknown';
      console.log('   Country:', country);
      console.log('   Is India?:', country === 'IN');
      if (country === 'IN') {
        console.log('🇮🇳 Cloudflare detects India - should show INR');
      }
    } else {
      console.log('❌ Cloudflare trace failed with status:', response.status);
    }
  } catch (error) {
    console.log('❌ Cloudflare trace error:', error.message);
  }
}

// Test the actual TrulyBot currency detection function
async function testTrulyBotDetection() {
  console.log('\n🤖 Testing TrulyBot Currency Detection Function:\n');
  
  // Import the function if available
  if (typeof window !== 'undefined' && window.location.pathname.includes('/pricing')) {
    try {
      // Try to access the React component's detection
      console.log('Currency detection should be running on this page.');
      console.log('Check the "Pricing shown in..." text above for current detection result.');
      
      // Check localStorage for cached result
      const cached = localStorage.getItem('user_currency');
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log('📦 Cached result:', parsed);
        if (parsed.currency === 'USD' && parsed.country !== 'IN') {
          console.log('⚠️ Cache shows USD - this might be why you see USD pricing');
          console.log('💡 Try clearing cache and refresh: localStorage.removeItem("user_currency")');
        }
      } else {
        console.log('📦 No cached result found');
      }
      
    } catch (error) {
      console.log('❌ Detection test error:', error.message);
    }
  } else {
    console.log('ℹ️ Not on pricing page - currency detection not active here');
  }
}

// Provide manual solutions
function provideManualSolutions() {
  console.log('\n🛠️ Manual Solutions:\n');
  
  console.log('1️⃣ Force INR Currency (for testing):');
  console.log('   localStorage.setItem("user_currency", \'{"currency":"INR","symbol":"₹","country":"IN","isIndia":true}\');');
  console.log('   Then refresh the page.');
  
  console.log('\n2️⃣ Clear Cache and Retry:');
  console.log('   localStorage.removeItem("user_currency");');
  console.log('   Then refresh the page.');
  
  console.log('\n3️⃣ Test with URL Override:');
  console.log('   Visit: /pricing?currency=INR');
  console.log('   This forces INR pricing for testing.');
  
  console.log('\n4️⃣ Check Network:');
  console.log('   - Disable VPN if using one');
  console.log('   - Try different network/mobile data');
  console.log('   - Some corporate networks mask location');
  
  console.log('\n5️⃣ Browser Issues:');
  console.log('   - Try incognito/private mode');
  console.log('   - Check browser console for errors');
  console.log('   - Some browsers block geolocation APIs');
}

// Run all tests
async function runFullDiagnosis() {
  await debugGeolocationServices();
  await testTrulyBotDetection();
  provideManualSolutions();
  
  console.log('\n📊 Summary:');
  console.log('If you\'re in India but seeing USD:');
  console.log('• Check if any geolocation service above detected "IN"');
  console.log('• Clear localStorage cache and refresh');
  console.log('• Try the manual INR override');
  console.log('• If still issues, use ?currency=INR in URL');
}

// Execute diagnosis
runFullDiagnosis();