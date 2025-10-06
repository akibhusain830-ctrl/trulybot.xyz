/**
 * Test Geolocation-Based Pricing for Indian Users
 * This will test why USD is showing instead of INR
 */

console.log('🔍 Testing TrulyBot Pricing Geolocation Detection...\n');

// Test the geolocation APIs individually
async function testGeolocationAPIs() {
  console.log('📍 Testing Geolocation APIs:');

  // Test 1: Cloudflare (works only on Cloudflare-hosted sites)
  try {
    const response = await fetch('/cdn-cgi/trace', { 
      cache: 'no-store',
      signal: AbortSignal.timeout(3000) 
    });
    
    if (response.ok) {
      const text = await response.text();
      const lines = text.split('\n');
      const countryLine = lines.find(line => line.startsWith('loc='));
      const country = countryLine ? countryLine.split('=')[1] : 'Unknown';
      console.log('✅ Cloudflare trace:', country);
    }
  } catch (error) {
    console.log('❌ Cloudflare trace failed:', error.message);
  }

  // Test 2: IP-API (free, reliable)
  try {
    const response = await fetch('http://ip-api.com/json/?fields=countryCode', {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ IP-API result:', data.countryCode);
      if (data.countryCode === 'IN') {
        console.log('🇮🇳 Indian location detected by IP-API');
      }
    }
  } catch (error) {
    console.log('❌ IP-API failed:', error.message);
  }

  // Test 3: IPInfo (fallback)
  try {
    const response = await fetch('https://ipinfo.io/json', {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ IPInfo result:', data.country);
      if (data.country === 'IN') {
        console.log('🇮🇳 Indian location detected by IPInfo');
      }
    }
  } catch (error) {
    console.log('❌ IPInfo failed:', error.message);
  }
}

// Test local storage cache
function testLocalStorageCache() {
  console.log('\n💾 Testing Local Storage Cache:');
  
  try {
    const cached = localStorage.getItem('user_currency');
    if (cached) {
      const parsed = JSON.parse(cached);
      console.log('✅ Cached currency found:', parsed);
      if (parsed.currency === 'INR') {
        console.log('🇮🇳 Cache shows Indian currency');
      } else {
        console.log('🌍 Cache shows international currency');
      }
    } else {
      console.log('ℹ️ No cached currency found');
    }
  } catch (error) {
    console.log('❌ Cache test failed:', error.message);
  }
}

// Test browser geolocation API
function testBrowserGeolocation() {
  console.log('\n🌐 Testing Browser Geolocation API:');
  
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ Browser geolocation coordinates:', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        
        // Rough check for India coordinates
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const isInIndiaRegion = (lat >= 6 && lat <= 37) && (lng >= 68 && lng <= 97);
        
        if (isInIndiaRegion) {
          console.log('🇮🇳 Coordinates suggest Indian location');
        } else {
          console.log('🌍 Coordinates suggest non-Indian location');
        }
      },
      (error) => {
        console.log('❌ Browser geolocation failed:', error.message);
      },
      { timeout: 5000 }
    );
  } else {
    console.log('❌ Browser geolocation not supported');
  }
}

// Main test function
async function runPricingTests() {
  await testGeolocationAPIs();
  testLocalStorageCache();
  testBrowserGeolocation();
  
  console.log('\n🔧 Potential Issues:');
  console.log('1. If all APIs fail, pricing defaults to USD');
  console.log('2. Check if VPN is affecting location detection');
  console.log('3. Verify local storage cache is not stuck on USD');
  console.log('4. Some corporate networks block geolocation APIs');
  
  console.log('\n💡 Solutions:');
  console.log('1. Clear browser cache and localStorage');
  console.log('2. Try accessing from different network');
  console.log('3. Check browser console for geolocation errors');
  console.log('4. Manually set currency for testing');
  
  console.log('\n🛠️ Manual Currency Override:');
  console.log('Run this in browser console to force INR:');
  console.log(`localStorage.setItem('user_currency', '{"currency":"INR","symbol":"₹","country":"IN","isIndia":true}');`);
  console.log('Then refresh the pricing page.');
}

// Run the tests
runPricingTests();