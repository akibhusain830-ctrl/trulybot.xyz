// Quick test of automatic free access fixes

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kztnmitslqqqlnzrsxxx.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6dG5taXRzbHFxcWxuenJzeHh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNTc4MzI4OSwiZXhwIjoyMDQxMzU5Mjg5fQ.wXsaGKJcLSNE4ZLGPhA5wf3cSI5Hxq-FeVWj7Uqh-PQ';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test the subscription API directly
async function testAutomaticFreeAccess() {
    console.log('🔍 TESTING AUTOMATIC FREE ACCESS VIA API\n');
    
    // Test scenarios
    const testCases = [
        {
            name: 'NEW USER WITH NO TRIAL',
            userId: 'test-new-user-123',
            shouldGetFreeAccess: true
        },
        {
            name: 'USER AFTER TRIAL EXPIRES',
            userId: 'test-expired-user-123', 
            shouldGetFreeAccess: true
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`📝 Testing: ${testCase.name}`);
        
        try {
            // Call the subscription status API
            const response = await fetch('http://localhost:3000/api/subscription/status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: testCase.userId
                })
            });
            
            if (!response.ok) {
                console.log(`   ❌ API Error: ${response.status}`);
                continue;
            }
            
            const result = await response.json();
            
            console.log(`   🎯 Result:`);
            console.log(`      Has Access: ${result.has_access ? '✅ YES' : '❌ NO'}`);
            console.log(`      Tier: ${result.tier}`);
            console.log(`      Status: ${result.status}`);
            console.log(`      Features: ${result.features?.length || 0} features`);
            
            const isWorking = result.has_access === testCase.shouldGetFreeAccess;
            console.log(`   📊 RESULT: ${isWorking ? '✅ WORKING' : '🚨 NEEDS FIX'}`);
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        console.log('');
    }
    
    console.log('🏁 API Test Complete!');
}

// Also test by creating actual test profiles
async function testWithRealProfiles() {
    console.log('🔍 TESTING WITH REAL DATABASE PROFILES\n');
    
    // Create a test user that should get free access
    const testUser = {
        id: 'test-free-access-' + Date.now(),
        email: 'test-free@example.com',
        subscription_status: 'none',
        subscription_tier: 'basic',
        has_used_trial: false,
        trial_ends_at: null,
        subscription_ends_at: null,
        stripe_customer_id: null
    };
    
    try {
        // Insert test user
        const { data, error } = await supabase
            .from('profiles')
            .insert([testUser])
            .select()
            .single();
            
        if (error) {
            console.log('❌ Failed to create test user:', error.message);
            return;
        }
        
        console.log('✅ Created test user:', testUser.id);
        
        // Now test subscription access
        const response = await fetch('http://localhost:3000/api/subscription/status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: testUser.id
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log(`📊 Test Result for new user:`);
            console.log(`   Has Access: ${result.has_access ? '✅ YES' : '❌ NO'}`);
            console.log(`   Tier: ${result.tier}`);
            console.log(`   Features: ${result.features?.length || 0} features`);
            
            if (result.has_access && result.tier === 'free' && result.features?.length >= 5) {
                console.log('🎉 SUCCESS: New user gets automatic free access!');
            } else {
                console.log('🚨 ISSUE: New user not getting proper free access');
            }
        }
        
        // Clean up test user
        await supabase
            .from('profiles')
            .delete()
            .eq('id', testUser.id);
            
        console.log('🧹 Cleaned up test user');
        
    } catch (error) {
        console.log('❌ Test error:', error.message);
    }
}

// Start the server first, then run tests
console.log('🚀 Starting server for API tests...');

// Give some time for server to start if needed
setTimeout(async () => {
    await testWithRealProfiles();
}, 2000);