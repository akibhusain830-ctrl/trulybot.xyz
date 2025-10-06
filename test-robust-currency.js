/**
 * Test script to verify robust currency detection
 */

async function testGeolocationAPIs() {
  const apiEndpoints = [
    'https://ipapi.co/json/',
    'https://ipwhois.app/json/',
    'https://ip-api.com/json/',
    'https://freegeoip.app/json/',
    'https://geolocation-db.com/json/'
  ];

  console.log('🌍 Testing Geolocation APIs for Currency Detection\n');

  for (const endpoint of apiEndpoints) {
    try {
      console.log(`Testing: ${endpoint}`);
      const response = await fetch(endpoint);
      const data = await response.json();
      
      console.log('Response:', {
        country: data.country || data.country_name || data.countryName,
        countryCode: data.country_code || data.countryCode,
        timezone: data.timezone,
        currency: data.currency || 'Not provided'
      });
      console.log('---');
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      console.log('---');
    }
  }

  // Test timezone fallback
  console.log('\n⏰ Testing Timezone Fallback:');
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  console.log('Browser timezone:', timezone);
  const isIndianTimezone = timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta');
  console.log('Is Indian timezone:', isIndianTimezone);
  console.log('Currency from timezone:', isIndianTimezone ? 'INR' : 'USD');
}

// Test pricing constants
console.log('💰 Testing Pricing Constants:');
const TIER_PRICING = {
  basic: { monthlyInr: 99, monthlyUsd: 5 },
  pro: { monthlyInr: 399, monthlyUsd: 10 },
  ultra: { monthlyInr: 599, monthlyUsd: 15 }
};

console.log('Pricing verification:');
Object.entries(TIER_PRICING).forEach(([tier, pricing]) => {
  console.log(`${tier.toUpperCase()}: ₹${pricing.monthlyInr} / $${pricing.monthlyUsd}`);
});

console.log('\n🔍 Starting API Tests...\n');
testGeolocationAPIs();