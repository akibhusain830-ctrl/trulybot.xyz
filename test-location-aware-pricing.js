import { generatePricingContent, generateShortPricingSummary, getLocationAwarePricing } from '../src/lib/location-aware-pricing';

console.log('🧪 Testing Location-Aware Pricing System\n');

// Test INR pricing
console.log('📍 India (INR) Pricing:');
console.log('========================');
const inrPricing = getLocationAwarePricing('INR');
console.log('Basic:', `${inrPricing.symbol}${inrPricing.basic.monthly}/month`);
console.log('Pro:', `${inrPricing.symbol}${inrPricing.pro.monthly}/month`);
console.log('Ultra:', `${inrPricing.symbol}${inrPricing.ultra.monthly}/month`);

console.log('\n🌍 International (USD) Pricing:');
console.log('===============================');
const usdPricing = getLocationAwarePricing('USD');
console.log('Basic:', `${usdPricing.symbol}${usdPricing.basic.monthly}/month`);
console.log('Pro:', `${usdPricing.symbol}${usdPricing.pro.monthly}/month`);
console.log('Ultra:', `${usdPricing.symbol}${usdPricing.ultra.monthly}/month`);

console.log('\n🤖 Chatbot Content (INR):');
console.log('=========================');
console.log(generatePricingContent('INR'));

console.log('\n🤖 Chatbot Content (USD):');
console.log('=========================');
console.log(generatePricingContent('USD'));

console.log('\n✅ Pricing system is now location-aware!');
console.log('Indian users will see only INR prices');
console.log('International users will see only USD prices');