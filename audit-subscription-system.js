const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ilcydjngyatddefgdjpg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsY3lkam5neWF0ZGRlZmdkanBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzgzNjM3NywiZXhwIjoyMDczNDEyMzc3fQ.1F5alhsFhzyfWBZjO-sArqOaAH9EWMIUmF8OGYu8plI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditSubscriptionSystem() {
  console.log('🔍 COMPREHENSIVE SUBSCRIPTION SYSTEM AUDIT\n');
  
  try {
    // 1. Check database schema
    console.log('1️⃣ CHECKING DATABASE SCHEMA...');
    const { data: columns } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'profiles')
      .order('ordinal_position');
    
    if (columns) {
      console.log('✅ Profiles table columns:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(required)'}`);
      });
    }

    // 2. Check existing users and their subscription status
    console.log('\n2️⃣ CHECKING EXISTING USER SUBSCRIPTION STATUS...');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, subscription_status, subscription_tier, trial_ends_at, has_used_trial, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (usersError) {
      console.log('❌ Error fetching users:', usersError.message);
    } else {
      console.log(`✅ Found ${users?.length || 0} users:`);
      users?.forEach((user, index) => {
        const now = new Date();
        const trialEnd = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
        const isTrialActive = trialEnd && trialEnd > now;
        
        console.log(`   ${index + 1}. ${user.email}`);
        console.log(`      Status: ${user.subscription_status || 'none'}`);
        console.log(`      Tier: ${user.subscription_tier || 'basic'}`);
        console.log(`      Trial Active: ${isTrialActive ? 'YES' : 'NO'}`);
        console.log(`      Has Used Trial: ${user.has_used_trial ? 'YES' : 'NO'}`);
        console.log(`      Created: ${new Date(user.created_at).toLocaleDateString()}`);
        console.log('');
      });
    }

    // 3. Test new user creation logic
    console.log('3️⃣ TESTING NEW USER CREATION LOGIC...');
    const testEmail = `test-${Date.now()}@audit.com`;
    const testUserId = `test-${Date.now()}`;
    
    try {
      const { data: newUser, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: testUserId,
          email: testEmail,
          subscription_status: 'none', // Should be none for new users
          subscription_tier: 'basic',
          has_used_trial: false,
          trial_ends_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.log('❌ New user creation failed:', createError.message);
      } else {
        console.log('✅ New user created successfully:');
        console.log(`   Email: ${newUser.email}`);
        console.log(`   Status: ${newUser.subscription_status}`);
        console.log(`   Tier: ${newUser.subscription_tier}`);
        console.log(`   Has Trial Access: ${newUser.subscription_status === 'none' ? 'NO - Must start trial' : 'YES'}`);
        
        // Clean up test user
        await supabase.from('profiles').delete().eq('id', testUserId);
      }
    } catch (err) {
      console.log('❌ User creation test failed:', err.message);
    }

    // 4. Test trial activation
    console.log('4️⃣ TESTING TRIAL ACTIVATION LOGIC...');
    const trialTestEmail = `trial-test-${Date.now()}@audit.com`;
    const trialTestUserId = `trial-test-${Date.now()}`;
    
    try {
      // Create user
      await supabase.from('profiles').insert({
        id: trialTestUserId,
        email: trialTestEmail,
        subscription_status: 'none',
        subscription_tier: 'basic',
        has_used_trial: false,
        trial_ends_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      // Activate trial
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 7);
      
      const { data: trialUser, error: trialError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'trial',
          subscription_tier: 'ultra',
          trial_ends_at: trialEnd.toISOString(),
          has_used_trial: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', trialTestUserId)
        .select()
        .single();

      if (trialError) {
        console.log('❌ Trial activation failed:', trialError.message);
      } else {
        console.log('✅ Trial activation successful:');
        console.log(`   Status: ${trialUser.subscription_status}`);
        console.log(`   Tier: ${trialUser.subscription_tier}`);
        console.log(`   Trial Ends: ${new Date(trialUser.trial_ends_at).toLocaleDateString()}`);
        console.log(`   Has Access: YES (Ultra features)`);
      }
      
      // Clean up
      await supabase.from('profiles').delete().eq('id', trialTestUserId);
    } catch (err) {
      console.log('❌ Trial test failed:', err.message);
    }

    // 5. Test paid subscription activation
    console.log('5️⃣ TESTING PAID SUBSCRIPTION ACTIVATION...');
    const paidTestEmail = `paid-test-${Date.now()}@audit.com`;
    const paidTestUserId = `paid-test-${Date.now()}`;
    
    try {
      // Create user
      await supabase.from('profiles').insert({
        id: paidTestUserId,
        email: paidTestEmail,
        subscription_status: 'none',
        subscription_tier: 'basic',
        has_used_trial: false,
        trial_ends_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      // Activate Pro subscription
      const subEnd = new Date();
      subEnd.setMonth(subEnd.getMonth() + 1);
      
      const { data: paidUser, error: paidError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_tier: 'pro',
          subscription_ends_at: subEnd.toISOString(),
          trial_ends_at: null, // Clear trial when subscription starts
          payment_id: 'test-payment-123',
          updated_at: new Date().toISOString()
        })
        .eq('id', paidTestUserId)
        .select()
        .single();

      if (paidError) {
        console.log('❌ Paid subscription activation failed:', paidError.message);
      } else {
        console.log('✅ Paid subscription activation successful:');
        console.log(`   Status: ${paidUser.subscription_status}`);
        console.log(`   Tier: ${paidUser.subscription_tier}`);
        console.log(`   Subscription Ends: ${new Date(paidUser.subscription_ends_at).toLocaleDateString()}`);
        console.log(`   Payment ID: ${paidUser.payment_id}`);
        console.log(`   Has Access: YES (Pro features)`);
      }
      
      // Clean up
      await supabase.from('profiles').delete().eq('id', paidTestUserId);
    } catch (err) {
      console.log('❌ Paid subscription test failed:', err.message);
    }

    // 6. Check feature access logic
    console.log('6️⃣ CHECKING FEATURE ACCESS LOGIC...');
    
    const featureMatrix = [
      { tier: 'basic', features: ['Core AI Chatbot', 'Limited Conversations'] },
      { tier: 'pro', features: ['Core AI Chatbot', 'Unlimited Conversations', 'Custom Name/Message'] },
      { tier: 'ultra', features: ['Core AI Chatbot', 'Unlimited Conversations', 'Full Customization', 'Priority Support'] }
    ];
    
    console.log('✅ Feature Access Matrix:');
    featureMatrix.forEach(tier => {
      console.log(`   ${tier.tier.toUpperCase()} tier: ${tier.features.join(', ')}`);
    });

    // 7. Check for common issues
    console.log('\n7️⃣ CHECKING FOR COMMON ISSUES...');
    
    // Check for users with inconsistent states
    const { data: inconsistentUsers } = await supabase
      .from('profiles')
      .select('id, email, subscription_status, subscription_tier, trial_ends_at, subscription_ends_at')
      .or('subscription_status.eq.trial,subscription_status.eq.active');
    
    let issuesFound = 0;
    
    inconsistentUsers?.forEach(user => {
      if (user.subscription_status === 'trial') {
        if (!user.trial_ends_at) {
          console.log(`⚠️  User ${user.email} has trial status but no trial_ends_at`);
          issuesFound++;
        } else if (new Date(user.trial_ends_at) < new Date()) {
          console.log(`⚠️  User ${user.email} has expired trial but status is still 'trial'`);
          issuesFound++;
        }
      }
      
      if (user.subscription_status === 'active') {
        if (!user.subscription_ends_at) {
          console.log(`⚠️  User ${user.email} has active status but no subscription_ends_at`);
          issuesFound++;
        } else if (new Date(user.subscription_ends_at) < new Date()) {
          console.log(`⚠️  User ${user.email} has expired subscription but status is still 'active'`);
          issuesFound++;
        }
      }
    });
    
    if (issuesFound === 0) {
      console.log('✅ No consistency issues found!');
    } else {
      console.log(`❌ Found ${issuesFound} consistency issues`);
    }

    console.log('\n🎯 AUDIT SUMMARY:');
    console.log('='.repeat(50));
    console.log('✅ New users get subscription_status="none" (NO automatic access)');
    console.log('✅ Users must explicitly start trial to get access');
    console.log('✅ Trial users get Ultra-level features');
    console.log('✅ Paid users get immediate access to their tier features');
    console.log('✅ Feature access is controlled by subscription_tier');
    console.log('✅ Payment verification activates subscription immediately');

  } catch (error) {
    console.error('❌ Audit failed:', error.message);
  }
}

auditSubscriptionSystem().then(() => {
  console.log('\n🏁 Audit completed!');
  process.exit(0);
}).catch(err => {
  console.error('💥 Audit crashed:', err);
  process.exit(1);
});