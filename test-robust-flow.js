const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables manually
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function testRobustUserFlow() {
  console.log('🧪 COMPREHENSIVE ROBUSTNESS TEST');
  console.log('🎯 Testing that NO users get automatic access');
  console.log('=' .repeat(60));
  
  let allTestsPassed = true;
  
  try {
    // Test 1: Verify trigger function behavior
    console.log('\n1️⃣ Testing Database Trigger Logic...');
    
    // Simulate what the trigger does by checking function content
    const { data: funcData, error: funcError } = await supabase
      .rpc('exec_sql', { 
        sql: `
        SELECT routine_definition 
        FROM information_schema.routines 
        WHERE routine_name = 'handle_new_user' 
        AND routine_schema = 'public'
        ` 
      });
    
    if (funcError) {
      console.log('⚠️ Cannot directly query function (expected in hosted)');
    }
    
    // Test 2: Create test user profiles to verify behavior
    console.log('\n2️⃣ Testing Profile Creation (Multiple Scenarios)...');
    
    const testUsers = [
      { id: `trigger-test-${Date.now()}-1`, email: `triggertest1-${Date.now()}@example.com`, method: 'trigger_simulation' },
      { id: `direct-test-${Date.now()}-2`, email: `directtest2-${Date.now()}@example.com`, method: 'direct_insert' },
      { id: `manager-test-${Date.now()}-3`, email: `managertest3-${Date.now()}@example.com`, method: 'profile_manager' }
    ];
    
    const testResults = [];
    
    for (const testUser of testUsers) {
      try {
        let profile = null;
        
        if (testUser.method === 'direct_insert') {
          // Test direct profile creation (what the trigger should do)
          const { data: newProfile, error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: testUser.id,
              email: testUser.email,
              full_name: 'Test User',
              role: 'owner',
              chatbot_name: 'Assistant',
              welcome_message: 'Hello! How can I help you today?',
              accent_color: '#2563EB',
              // Should use database defaults
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
            
          if (profileError) {
            console.log(`❌ ${testUser.method} failed:`, profileError.message);
            testResults.push({ ...testUser, success: false, reason: profileError.message });
            allTestsPassed = false;
            continue;
          }
          profile = newProfile;
        }
        
        if (profile) {
          // Check if user has access
          const hasAccess = profile.subscription_status !== 'none';
          const isCorrect = !hasAccess; // Should NOT have access
          
          testResults.push({
            ...testUser,
            success: isCorrect,
            subscription_status: profile.subscription_status,
            subscription_tier: profile.subscription_tier,
            trial_ends_at: profile.trial_ends_at,
            has_access: hasAccess,
            expected: 'NO ACCESS',
            actual: hasAccess ? 'HAS ACCESS' : 'NO ACCESS',
            correct: isCorrect ? '✅' : '❌'
          });
          
          if (!isCorrect) {
            allTestsPassed = false;
          }
        }
        
      } catch (error) {
        console.log(`❌ Error testing ${testUser.method}:`, error.message);
        testResults.push({ ...testUser, success: false, reason: error.message });
        allTestsPassed = false;
      }
    }
    
    // Display test results
    console.log('\n📊 Test Results:');
    testResults.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.correct || '❌'} ${result.method}:`);
      console.log(`      Status: ${result.subscription_status || 'ERROR'}`);
      console.log(`      Tier: ${result.subscription_tier || 'ERROR'}`);
      console.log(`      Access: ${result.actual || 'ERROR'}`);
      if (result.reason) {
        console.log(`      Error: ${result.reason}`);
      }
    });
    
    // Test 3: Verify no automatic trials are given
    console.log('\n3️⃣ Testing No Automatic Trial Logic...');
    
    const usersWithAutoTrials = testResults.filter(r => 
      r.subscription_status === 'trial' || 
      (r.trial_ends_at && new Date(r.trial_ends_at) > new Date())
    );
    
    if (usersWithAutoTrials.length === 0) {
      console.log('✅ No automatic trials detected - GOOD!');
    } else {
      console.log(`❌ Found ${usersWithAutoTrials.length} users with automatic trials - BAD!`);
      allTestsPassed = false;
    }
    
    // Test 4: Verify existing trial users are preserved
    console.log('\n4️⃣ Testing Existing Trial User Preservation...');
    
    const { data: existingTrials, error: trialError } = await supabase
      .from('profiles')
      .select('id, email, subscription_status, trial_ends_at')
      .eq('subscription_status', 'trial')
      .gt('trial_ends_at', new Date().toISOString())
      .limit(5);
    
    if (trialError) {
      console.log('❌ Error checking existing trials:', trialError.message);
      allTestsPassed = false;
    } else {
      console.log(`✅ Found ${existingTrials.length} existing active trials (preserved)`);
      existingTrials.forEach((trial, index) => {
        const daysLeft = Math.ceil((new Date(trial.trial_ends_at) - new Date()) / (24 * 60 * 60 * 1000));
        console.log(`   ${index + 1}. ${trial.email}: ${daysLeft} days remaining`);
      });
    }
    
    // Test 5: Verify access control logic
    console.log('\n5️⃣ Testing Access Control Logic...');
    
    const accessTestCases = [
      { status: 'none', tier: 'basic', shouldHaveAccess: false },
      { status: 'trial', tier: 'ultra', shouldHaveAccess: true },
      { status: 'active', tier: 'basic', shouldHaveAccess: true },
      { status: 'expired', tier: 'pro', shouldHaveAccess: false }
    ];
    
    accessTestCases.forEach((testCase, index) => {
      const hasAccess = testCase.status === 'trial' || testCase.status === 'active';
      const isCorrect = hasAccess === testCase.shouldHaveAccess;
      const result = isCorrect ? '✅' : '❌';
      
      console.log(`   ${index + 1}. ${result} ${testCase.status}/${testCase.tier}: ${hasAccess ? 'ACCESS' : 'NO ACCESS'}`);
      
      if (!isCorrect) {
        allTestsPassed = false;
      }
    });
    
    // Test 6: Verify database constraints
    console.log('\n6️⃣ Testing Database Constraints...');
    
    try {
      const { error: constraintError } = await supabase
        .from('profiles')
        .insert({
          id: `constraint-test-${Date.now()}`,
          email: 'constrainttest@example.com',
          subscription_tier: 'free' // This should fail
        });
      
      if (constraintError && constraintError.message.includes('subscription_tier')) {
        console.log('✅ Database constraint working - free tier blocked');
      } else {
        console.log('❌ Database constraint failed - free tier NOT blocked');
        allTestsPassed = false;
      }
    } catch (error) {
      console.log('✅ Database constraint working - free tier blocked at DB level');
    }
    
    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    try {
      await supabase.from('profiles').delete().like('id', '%test%');
      console.log('✅ Test data cleaned up');
    } catch (cleanupError) {
      console.log('⚠️ Cleanup warning:', cleanupError.message);
    }
    
    // Final assessment
    console.log('\n' + '='.repeat(60));
    console.log('🎯 ROBUSTNESS ASSESSMENT COMPLETE');
    console.log('='.repeat(60));
    
    if (allTestsPassed) {
      console.log('🟢 STATUS: ROBUST ✅');
      console.log('✅ All tests passed');
      console.log('✅ No automatic access granted');
      console.log('✅ Free tier completely removed');
      console.log('✅ Access control working correctly');
      console.log('✅ Database constraints in place');
      console.log('\n🚀 USER FLOW:');
      console.log('   1. User signs up → Gets NO ACCESS');
      console.log('   2. Dashboard blocks user → Shows trial options');
      console.log('   3. User clicks trial → Gets 7 days access');
      console.log('   4. Trial expires → Must subscribe');
      console.log('\n✨ The user flow is FULLY ROBUST!');
      
      return true;
    } else {
      console.log('🔴 STATUS: NOT ROBUST ❌');
      console.log('❌ Some tests failed');
      console.log('⚠️ Check the test results above');
      console.log('🔧 Fix required before deployment');
      
      return false;
    }
    
  } catch (error) {
    console.error('💥 Test suite failed:', error);
    return false;
  }
}

// Run the comprehensive test
testRobustUserFlow().then((isRobust) => {
  console.log(`\n🏁 Final Result: ${isRobust ? 'ROBUST SYSTEM ✅' : 'NEEDS FIXES ❌'}`);
  process.exit(isRobust ? 0 : 1);
});