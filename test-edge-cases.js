// Test the ACTUAL issue - check if free tier access is being granted inappropriately

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
      has_access: true, // ⚠️ POTENTIAL ISSUE - Free tier has basic access
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
      status: 'eligible',  // Changed from 'none' to indicate trial eligibility
      tier: 'basic',
      trial_ends_at: null,
      subscription_ends_at: null,
      is_trial_active: false,
      has_access: false, // ✅ CORRECT - No access until they start trial
      days_remaining: 7, // Available trial days
      features: [] // Must start trial to get access
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
      has_access: false, // ✅ CORRECT - No access when expired
      days_remaining: 0,
      features: [] // No access - expired
    };
  }
  
  // Final fallback - no subscription, no trial - default to free tier
  return {
    status: 'none',
    tier: 'free',
    trial_ends_at: null,
    subscription_ends_at: null,
    is_trial_active: false,
    has_access: true, // ⚠️ POTENTIAL ISSUE - Free tier has basic access
    days_remaining: 0,
    features: TIER_FEATURES.free
  };
}

console.log('🚨 TESTING EDGE CASES FOR FREE ACCESS LOOPHOLES\n');

// Test edge cases that might grant inappropriate free access
const edgeCases = [
  {
    description: '❌ NULL PROFILE TEST',
    profile: null,
    expectedAccess: false,
    issue: 'null profile should not get free access'
  },
  {
    description: '❌ EMPTY PROFILE TEST',
    profile: {},
    expectedAccess: false,
    issue: 'empty profile should not get free access'
  },
  {
    description: '❌ UNDEFINED STATUS TEST',
    profile: {
      id: 'test',
      email: 'test@test.com',
      subscription_status: undefined,
      subscription_tier: undefined,
      has_used_trial: undefined
    },
    expectedAccess: false,
    issue: 'undefined status should not get free access'
  },
  {
    description: '❌ WEIRD STATUS TEST',
    profile: {
      id: 'test',
      email: 'test@test.com',
      subscription_status: 'cancelled',
      subscription_tier: 'basic',
      has_used_trial: true
    },
    expectedAccess: false,
    issue: 'cancelled status should not get free access'
  },
  {
    description: '✅ PROPER NEW USER',
    profile: {
      id: 'test',
      email: 'test@test.com',
      subscription_status: 'none',
      subscription_tier: 'basic',
      has_used_trial: false,
      trial_ends_at: null,
      subscription_ends_at: null,
      stripe_customer_id: null
    },
    expectedAccess: false,
    issue: 'new user should be trial eligible with no access'
  }
];

edgeCases.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.description}`);
  const result = calculateSubscriptionAccess(testCase.profile);
  console.log(`   Has Access: ${result.has_access ? '✅ YES' : '❌ NO'}`);
  console.log(`   Status: ${result.status}`);
  console.log(`   Tier: ${result.tier}`);
  console.log(`   Features: ${result.features.length} features`);
  
  const hasUnexpectedAccess = result.has_access && !testCase.expectedAccess;
  if (hasUnexpectedAccess) {
    console.log(`   🚨 SECURITY ISSUE: ${testCase.issue}`);
    console.log(`   🔧 FIX NEEDED: This case grants inappropriate free access!`);
  } else {
    console.log(`   ✅ SECURE: No inappropriate access granted`);
  }
  console.log('');
});

console.log('🎯 SUMMARY OF FINDINGS:');
console.log('='.repeat(50));

// Test the two problematic fallbacks
const nullProfileResult = calculateSubscriptionAccess(null);
const emptyProfileResult = calculateSubscriptionAccess({});

if (nullProfileResult.has_access) {
  console.log('🚨 ISSUE 1: NULL profile grants free access');
  console.log('   Fix: Change has_access to false for null profiles');
}

if (emptyProfileResult.has_access) {
  console.log('🚨 ISSUE 2: Empty profile hits free tier fallback');
  console.log('   Fix: Remove free tier fallback or set has_access to false');
}

console.log('\n📋 RECOMMENDED FIXES:');
console.log('1. Remove "free" tier completely from TypeScript');
console.log('2. Set has_access: false for null/empty profiles');
console.log('3. Remove free tier fallback at end of function');
console.log('4. Only grant access for: active subscriptions, active trials');
console.log('5. All other cases should have has_access: false');

console.log('\n🏁 EDGE CASE ANALYSIS COMPLETED!');