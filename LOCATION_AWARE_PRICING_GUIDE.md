# Location-Aware Pricing System 🌍💰

## Overview
TrulyBot now features a fully location-aware pricing system that automatically shows the appropriate currency and pricing based on the user's location.

## Regional Pricing Strategy

### 🇮🇳 India (INR)
- **Basic Plan**: ₹99/month (optimized for Indian market)
- **Pro Plan**: ₹399/month (most popular)  
- **Ultra Plan**: ₹599/month (enterprise)

### 🌍 International (USD)
- **Basic Plan**: $5/month
- **Pro Plan**: $10/month
- **Ultra Plan**: $15/month

## How It Works

### 1. Automatic Detection
The system detects user location through:
- Browser timezone (`Asia/Kolkata`, `Asia/Calcutta`)
- Browser language (`hi`, `*-IN`)
- Server-side geolocation headers
- Cached preferences in localStorage

### 2. Smart Fallback
If location detection fails, defaults to USD for international users.

### 3. Consistent Experience
- Pricing page shows only relevant currency
- Chatbot responses adapt to user's region
- SEO/structured data includes appropriate pricing
- Payment flows use correct currency

## Testing the System

### Method 1: URL Parameters (Development)
Add `?currency=INR` or `?currency=USD` to any URL:
- `http://localhost:3000/pricing?currency=INR` - Test Indian pricing
- `http://localhost:3000/pricing?currency=USD` - Test international pricing

### Method 2: Browser Settings
1. Change browser language to Hindi (`hi`)
2. Use VPN to India location
3. Set system timezone to `Asia/Kolkata`

### Method 3: localStorage Override
In browser console:
```javascript
// Test Indian pricing
localStorage.setItem('user_currency', JSON.stringify({currency: 'INR'}));

// Test international pricing  
localStorage.setItem('user_currency', JSON.stringify({currency: 'USD'}));

// Refresh page to see changes
```

## Chatbot Integration

The AI chatbot now provides location-appropriate responses:

### For Indian Users:
"💰 TrulyBot Pricing Plans (Indian market):

**Basic Plan** - ₹99/month
• Perfect for small businesses
• Up to 1,000 conversations/month..."

### For International Users:
"💰 TrulyBot Pricing Plans (international market):

**Basic Plan** - $5/month  
• Perfect for small businesses
• Up to 1,000 conversations/month..."

## Key Benefits

### 🎯 Better Customer Experience
- No confusion about which currency applies
- Locally relevant pricing
- Cleaner, more focused presentation

### 💰 Regional Optimization
- INR pricing optimized for Indian purchasing power
- USD pricing for international markets
- No need to show dual currencies

### 🤖 Smart AI Responses
- Chatbot adapts responses to user location
- Consistent messaging across all touchpoints
- Improved conversion rates

## Implementation Details

### Files Modified:
- `/src/lib/location-aware-pricing.ts` - Core pricing logic
- `/src/lib/productKnowledge.ts` - Dynamic chatbot responses
- `/src/app/(legal)/pricing/pricing-client-page.tsx` - Dynamic structured data
- `/src/lib/schema.ts` - SEO FAQ updates
- `/src/lib/professional-seo.ts` - Professional SEO content

### Key Functions:
- `getLocationAwarePricing()` - Get pricing for specific currency
- `generatePricingContent()` - Generate chatbot content
- `detectCurrencyFromBrowser()` - Client-side currency detection
- `detectCurrencyFromContext()` - Server-side currency detection

## Validation

✅ **TypeScript**: All changes are type-safe  
✅ **Build**: No compilation errors  
✅ **Performance**: Minimal overhead with caching  
✅ **SEO**: Dynamic structured data for better search results  
✅ **UX**: Cleaner, more focused pricing presentation

## Next Steps

1. Monitor user behavior and conversion rates
2. Consider adding more regional currencies (EUR, GBP, etc.)
3. A/B test pricing strategies per region
4. Add analytics to track currency detection accuracy

---

**Note**: The system maintains the regional pricing strategy where INR prices are optimized for the Indian market rather than direct USD conversions. This ensures competitive and accessible pricing for each market segment.