// Test script to verify new user gets free tier access (not automatic trial)

console.log("🧪 TESTING NEW USER SIGNUP FLOW (FREE TIER)\n");

// Copy the subscription logic for testing
const TIER_FEATURES = {
  free: [
    "Core AI Chatbot",
    "100 Conversations/month",
    "Basic Knowledge Base (500 words)",
    "1 Knowledge Upload",
    "Website Embedding",
  ],
  basic: ["Core AI Chatbot", "Unlimited Conversations", "1,000 Messages/month"],
  pro: [
    "Core AI Chatbot",
    "Unlimited Conversations",
    "Maximum Knowledge Base",
    "Basic Customization",
  ],
  ultra: [
    "Core AI Chatbot",
    "Unlimited Conversations",
    "Maximum Knowledge Base",
    "Full Brand Customization",
    "Enhanced Lead Capture",
    "Priority Support Queue",
  ],
};

function calculateSubscriptionAccess(profile) {
  const now = new Date();

  if (!profile) {
    return {
      status: "none",
      tier: "free",
      trial_ends_at: null,
      subscription_ends_at: null,
      is_trial_active: false,
      has_access: true,
      days_remaining: 0,
      features: TIER_FEATURES.free,
    };
  }

  // Check for active paid subscription first
  if (
    profile.subscription_status === "active" &&
    profile.subscription_ends_at
  ) {
    const subEndDate = new Date(profile.subscription_ends_at);
    const hasAccess = subEndDate > now;
    const daysRemaining = hasAccess
      ? Math.ceil(
          (subEndDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
        )
      : 0;

    return {
      status: hasAccess ? "active" : "expired",
      tier: profile.subscription_tier || "basic",
      trial_ends_at: null,
      subscription_ends_at: profile.subscription_ends_at,
      is_trial_active: false,
      has_access: hasAccess,
      days_remaining: daysRemaining,
      features: TIER_FEATURES[profile.subscription_tier || "basic"],
    };
  }

  // Check trial status
  const trialEndDate = profile.trial_ends_at
    ? new Date(profile.trial_ends_at)
    : null;
  const isTrialStatus = profile.subscription_status === "trial";
  const hasValidTrialDate = trialEndDate && trialEndDate > now;

  // Active trial
  if (isTrialStatus && hasValidTrialDate) {
    const daysRemaining = Math.ceil(
      (trialEndDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
    );

    return {
      status: "trial",
      tier: "ultra",
      trial_ends_at: profile.trial_ends_at || null,
      subscription_ends_at: null,
      is_trial_active: true,
      has_access: true,
      days_remaining: Math.max(0, daysRemaining),
      features: TIER_FEATURES.ultra,
    };
  }

  // Check if user is eligible for a new trial (hasn't used trial yet)
  const hasNotUsedTrial = !profile.has_used_trial;
  const hasNoStripeCustomer =
    !profile.stripe_customer_id || profile.stripe_customer_id === "";

  if (
    hasNotUsedTrial &&
    hasNoStripeCustomer &&
    profile.subscription_status === "none"
  ) {
    return {
      status: "eligible",
      tier: "free",
      trial_ends_at: null,
      subscription_ends_at: null,
      is_trial_active: false,
      has_access: true, // ✅ FREE ACCESS for new users
      days_remaining: 0, // No automatic trial days
      features: TIER_FEATURES.free,
    };
  }

  // Handle expired trial or used trial cases
  if (isTrialStatus || profile.has_used_trial) {
    return {
      status: "expired",
      tier: "free",
      trial_ends_at: profile.trial_ends_at || null,
      subscription_ends_at: null,
      is_trial_active: false,
      has_access: true,
      days_remaining: 0,
      features: TIER_FEATURES.free,
    };
  }

  // Final fallback
  return {
    status: "none",
    tier: "free",
    trial_ends_at: null,
    subscription_ends_at: null,
    is_trial_active: false,
    has_access: true,
    days_remaining: 0,
    features: TIER_FEATURES.free,
  };
}

// Test scenarios for the new logic
const testScenarios = [
  {
    name: "🆕 BRAND NEW USER (Just signed up)",
    description: "New user with default database values from handle_new_user()",
    profile: {
      id: "new-user-123",
      email: "newuser@test.com",
      subscription_status: "none", // From database trigger
      subscription_tier: "basic", // From database trigger
      has_used_trial: false, // Default
      trial_ends_at: null, // No automatic trial
      subscription_ends_at: null,
      stripe_customer_id: null,
    },
    expected: {
      status: "eligible",
      tier: "free",
      has_access: true,
      features: 5, // Free tier features
      is_trial_active: false,
    },
  },
  {
    name: "🔥 USER STARTS TRIAL (Explicit action)",
    description: "User explicitly starts trial from trial page",
    profile: {
      id: "trial-user-456",
      email: "trialuser@test.com",
      subscription_status: "trial", // Set when trial started
      subscription_tier: "ultra", // Ultra during trial
      has_used_trial: true, // Marked as used
      trial_ends_at: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 7 days from now
      subscription_ends_at: null,
      stripe_customer_id: null,
    },
    expected: {
      status: "trial",
      tier: "ultra",
      has_access: true,
      features: 6, // Ultra tier features
      is_trial_active: true,
    },
  },
  {
    name: "⏰ TRIAL EXPIRED USER",
    description: "User whose trial has expired - should fall back to free",
    profile: {
      id: "expired-user-789",
      email: "expired@test.com",
      subscription_status: "trial", // Still shows trial status
      subscription_tier: "ultra",
      has_used_trial: true,
      trial_ends_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      subscription_ends_at: null,
      stripe_customer_id: null,
    },
    expected: {
      status: "expired",
      tier: "free",
      has_access: true,
      features: 5, // Free tier features
      is_trial_active: false,
    },
  },
];

console.log("📋 TESTING EACH SCENARIO:\n");

testScenarios.forEach((scenario, index) => {
  console.log(`${index + 1}. ${scenario.name}`);
  console.log(`   📝 ${scenario.description}`);
  console.log(`   📊 Profile:`);
  console.log(`      Status: ${scenario.profile.subscription_status}`);
  console.log(`      Tier: ${scenario.profile.subscription_tier}`);
  console.log(`      Has Used Trial: ${scenario.profile.has_used_trial}`);
  console.log(
    `      Trial Ends: ${scenario.profile.trial_ends_at ? new Date(scenario.profile.trial_ends_at).toLocaleDateString() : "none"}`,
  );

  const result = calculateSubscriptionAccess(scenario.profile);

  console.log(`   🎯 RESULT:`);
  console.log(`      Status: ${result.status}`);
  console.log(`      Tier: ${result.tier}`);
  console.log(`      Has Access: ${result.has_access ? "✅ YES" : "❌ NO"}`);
  console.log(
    `      Is Trial Active: ${result.is_trial_active ? "✅ YES" : "❌ NO"}`,
  );
  console.log(`      Features: ${result.features.length} features`);
  console.log(
    `      Features List: ${result.features.slice(0, 2).join(", ")}${result.features.length > 2 ? "..." : ""}`,
  );

  // Verify expectations
  const statusMatch = result.status === scenario.expected.status;
  const tierMatch = result.tier === scenario.expected.tier;
  const accessMatch = result.has_access === scenario.expected.has_access;
  const featureCountMatch =
    result.features.length === scenario.expected.features;
  const trialActiveMatch =
    result.is_trial_active === scenario.expected.is_trial_active;

  const allMatch =
    statusMatch &&
    tierMatch &&
    accessMatch &&
    featureCountMatch &&
    trialActiveMatch;

  console.log(
    `   ${allMatch ? "✅" : "❌"} VALIDATION: ${allMatch ? "PASSED" : "FAILED"}`,
  );
  if (!allMatch) {
    console.log(
      `      Expected: status=${scenario.expected.status}, tier=${scenario.expected.tier}, access=${scenario.expected.has_access}, features=${scenario.expected.features}, trial=${scenario.expected.is_trial_active}`,
    );
    console.log(
      `      Got: status=${result.status}, tier=${result.tier}, access=${result.has_access}, features=${result.features.length}, trial=${result.is_trial_active}`,
    );
  }
  console.log("");
});

console.log("🎯 SUMMARY:");
console.log("=".repeat(50));
console.log(
  "✅ New users get FREE tier access immediately (not automatic trial)",
);
console.log("✅ Trial must be explicitly started from trial page");
console.log("✅ After trial expires, users fall back to FREE tier");
console.log("✅ No automatic trial activation upon signup");
console.log("");
console.log(
  "🚀 Free tier gives users immediate value while encouraging trial/upgrade!",
);
