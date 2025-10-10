// Test if new users get automatic free access as intended

const TIER_FEATURES = {
  free: ['Core AI Chatbot', '100 Conversations/month', 'Basic Knowledge Base (500 words)', '1 Knowledge Upload', 'Website Embedding'],
  basic: ['Core AI Chatbot', 'Unlimited Conversations', '1,000 Messages/month'],
  pro: ['Core AI Chatbot', 'Unlimited Conversations', 'Maximum Knowledge Base', 'Basic Customization'],
  ultra: ['Core AI Chatbot', 'Unlimited Conversations', 'Maximum Knowledge Base', 'Full Brand Customization', 'Enhanced Lead Capture', 'Priority Support Queue']
};

function calculateSubscriptionAccess(profile) {
  const now = new Date();
  
  if (!profile) {
    return {
      status: 'none',
      tier: 'free',
      trial_ends_at: null,
      subscription_ends_at: null,
      is_trial_active: false,
      has_access: true, // ✅ CORRECT: Auto free access
      days_remaining: 0,
      features: TIER_FEATURES.free
    };
  }
  
  // Check for active paid subscription first (highest priority)
  if (profile.subscription_status === 'active' && profile.subscription_ends_at) {
    const subEndDate = new Date(profile.subscription_ends_at);
    const hasAccess = subEndDate > now;
    const daysRemaining = hasAccess ? Math.ceil((subEndDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)) : 0;
    
    return {
      status: hasAccess ? 'active' : 'expired',
      tier: profile.subscription_tier || 'basic',
      trial_ends_at: null,
      subscription_ends_at: profile.subscription_ends_at,
      is_trial_active: false,
      has_access: hasAccess,
      days_remaining: daysRemaining,
      features: TIER_FEATURES[profile.subscription_tier || 'basic']
    };
  }
  
  // ROBUST TRIAL LOGIC: Check both subscription_status and trial_ends_at
  const trialEndDate = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
  const isTrialStatus = profile.subscription_status === 'trial';
  const hasValidTrialDate = trialEndDate && trialEndDate > now;
  
  // Active trial - both status and date must be valid for access
  if (isTrialStatus && hasValidTrialDate) {
    const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    
    return {
      status: 'trial',
      tier: 'ultra',
      trial_ends_at: profile.trial_ends_at,
      subscription_ends_at: null,
      is_trial_active: true,
      has_access: true,
      days_remaining: Math.max(0, daysRemaining),
      features: TIER_FEATURES.ultra
    };
  }
  
  // Check if user is eligible for a new trial (hasn't used trial yet)
  const hasNotUsedTrial = !profile.has_used_trial;
  const hasNoStripeCustomer = !profile.stripe_customer_id || profile.stripe_customer_id === '';
  
  if (hasNotUsedTrial && hasNoStripeCustomer) {
    return {
      status: 'eligible',
      tier: 'basic',
      trial_ends_at: null,
      subscription_ends_at: null,
      is_trial_active: false,
      has_access: false, // 🚨 ISSUE: Should get free access!
      days_remaining: 7,
      features: [] // 🚨 ISSUE: Should get free features!
    };
  }
  
  // Handle expired trial or used trial cases
  if (isTrialStatus || profile.has_used_trial) {
    return {
      status: 'expired',
      tier: 'basic',
      trial_ends_at: profile.trial_ends_at || null,
      subscription_ends_at: null,
      is_trial_active: false,
      has_access: false, // 🚨 ISSUE: Should fall back to free access!
      days_remaining: 0,
      features: [] // 🚨 ISSUE: Should get free features!
    };
  }
  
  // Final fallback - should give free access
  return {
    status: 'none',
    tier: 'free',
    trial_ends_at: null,
    subscription_ends_at: null,
    is_trial_active: false,
    has_access: true, // ✅ CORRECT: Free access fallback
    days_remaining: 0,
    features: TIER_FEATURES.free
  };
}

console.log('🔍 TESTING AUTOMATIC FREE ACCESS FLOW\n');

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
  
  // Check if it matches your intent
  const shouldHaveFreeAccess = scenario.expected.includes('FREE');
  const actuallyHasAccess = result.has_access;
  const isWorking = shouldHaveFreeAccess === actuallyHasAccess;
  
  console.log(`   📊 RESULT: ${isWorking ? '✅ WORKING AS INTENDED' : '🚨 NOT WORKING - NEEDS FIX'}`);
  
  if (!isWorking) {
    console.log(`   🔧 ISSUE: Expected ${shouldHaveFreeAccess ? 'FREE access' : 'NO access'} but got ${actuallyHasAccess ? 'access' : 'no access'}`);
  }
  console.log('');
});

console.log('🎯 SUMMARY FOR AUTOMATIC FREE PLAN:');
console.log('='.repeat(50));
console.log('✅ Null profiles get free access (graceful degradation)');
console.log('❌ New users with profiles get NO access (should get free)');
console.log('❌ Expired trial users get NO access (should fall back to free)');
console.log('');
console.log('🔧 FIXES NEEDED:');
console.log('1. New users should get free access instead of "eligible" status');
console.log('2. Expired users should fall back to free access');
console.log('3. Consider making subscription_tier default to "free" in database');

console.log('\n🏁 ANALYSIS COMPLETED!');