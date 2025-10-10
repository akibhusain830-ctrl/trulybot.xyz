// Test automatic free access using the REAL subscription logic

import { calculateSubscriptionAccess } from './src/lib/subscription.js';

console.log('🔍 TESTING AUTOMATIC FREE ACCESS WITH REAL CODE\n');

// Test your intended user journey
const userScenarios = [
  {
    name: 'BRAND NEW USER (Just signed up)',
    profile: {
      id: 'new-user-123',
      email: 'newuser@test.com',
      subscription_status: 'none',
      subscription_tier: 'basic',
      has_used_trial: false,
      trial_ends_at: null,
      subscription_ends_at: null,
      stripe_customer_id: null
    },
    expected: 'Should get FREE access automatically'
  },
  {
    name: 'NULL PROFILE (Profile loading failed)',
    profile: null,
    expected: 'Should get FREE access as graceful fallback'
  },
  {
    name: 'USER AFTER TRIAL EXPIRES', 
    profile: {
      id: 'expired-user-123',
      email: 'expired@test.com',
      subscription_status: 'trial',
      subscription_tier: 'ultra',
      has_used_trial: true,
      trial_ends_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      subscription_ends_at: null,
      stripe_customer_id: null
    },
    expected: 'Should fall back to FREE access'
  }
];

userScenarios.forEach((scenario, index) => {
  console.log(`${index + 1}. ${scenario.name}`);
  console.log(`   Expected: ${scenario.expected}`);
  
  const result = calculateSubscriptionAccess(scenario.profile);
  console.log(`   🎯 ACTUAL RESULT:`);
  console.log(`      Has Access: ${result.has_access ? '✅ YES' : '❌ NO'}`);
  console.log(`      Tier: ${result.tier}`);
  console.log(`      Status: ${result.status}`);
  console.log(`      Features: ${result.features.length} features`);
  if (result.features.length > 0) {
    console.log(`      Feature List: ${result.features.join(', ')}`);
  }
  
  // Check if it matches your intent
  const shouldHaveFreeAccess = scenario.expected.includes('FREE');
  const actuallyHasAccess = result.has_access;
  const hasFreeFeatures = result.features.length >= 5; // Free tier has 5 features
  const isWorking = shouldHaveFreeAccess === actuallyHasAccess && shouldHaveFreeAccess ? hasFreeFeatures : true;
  
  console.log(`   📊 RESULT: ${isWorking ? '✅ WORKING AS INTENDED' : '🚨 NOT WORKING - NEEDS FIX'}`);
  
  if (!isWorking) {
    console.log(`   🔧 ISSUE: Expected ${shouldHaveFreeAccess ? 'FREE access' : 'NO access'} but got ${actuallyHasAccess ? 'access' : 'no access'}`);
  }
  console.log('');
});

console.log('🎯 ANALYSIS COMPLETED!');