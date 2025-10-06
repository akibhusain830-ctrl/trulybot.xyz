const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

const supabaseAdmin = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function debugSettingsIssue() {
  console.log('🔍 DEBUGGING SETTINGS SAVE ISSUE');
  console.log('='.repeat(50));
  
  const testUserId = '6b47cbac-9009-42e3-9a37-b1106bf0cba0'; // akibhusain830@gmail.com
  
  try {
    // Step 1: Check current profile data
    console.log('\n1️⃣ Checking current profile data...');
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', testUserId)
      .single();
    
    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      return;
    }
    
    console.log('📋 Current profile:');
    console.log(`   Email: ${profile.email}`);
    console.log(`   Chatbot Name: "${profile.chatbot_name}"`);
    console.log(`   Welcome Message: "${profile.welcome_message}"`);
    console.log(`   Accent Color: "${profile.accent_color}"`);
    console.log(`   Subscription: ${profile.subscription_status}`);
    
    // Step 2: Test updating specific fields
    console.log('\n2️⃣ Testing settings update...');
    
    const testSettings = {
      chatbot_name: 'TestBot',
      welcome_message: 'Hello from test!',
      accent_color: '#FF5733'
    };
    
    console.log('🔄 Attempting to update:', testSettings);
    
    const { data: updateResult, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        ...testSettings,
        updated_at: new Date().toISOString()
      })
      .eq('id', testUserId)
      .select();
    
    if (updateError) {
      console.error('❌ Update failed:', updateError);
      console.error('Error details:', JSON.stringify(updateError, null, 2));
      
      // Check if it's an RLS issue
      console.log('\n🔐 Testing with user context (RLS check)...');
      
      // Create a user-context client (simulating frontend)
      const userClient = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      
      // This won't work without auth, but let's see the error
      const { data: userUpdate, error: userError } = await userClient
        .from('profiles')
        .update(testSettings)
        .eq('id', testUserId)
        .select();
      
      console.log('User context error:', userError);
      
    } else {
      console.log('✅ Update successful!');
      console.log('Updated data:', updateResult);
      
      // Verify the changes
      const { data: verifyData, error: verifyError } = await supabaseAdmin
        .from('profiles')
        .select('chatbot_name, welcome_message, accent_color')
        .eq('id', testUserId)
        .single();
      
      if (!verifyError) {
        console.log('✅ Verification - Changes saved:');
        console.log(`   Chatbot Name: "${verifyData.chatbot_name}"`);
        console.log(`   Welcome Message: "${verifyData.welcome_message}"`);
        console.log(`   Accent Color: "${verifyData.accent_color}"`);
      }
    }
    
    // Step 3: Check table structure
    console.log('\n3️⃣ Checking table structure...');
    
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public'
        AND column_name IN ('chatbot_name', 'welcome_message', 'accent_color')
        ORDER BY ordinal_position
        ` 
      });
    
    if (!tableError && tableInfo) {
      console.log('📊 Table structure:');
      tableInfo.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    } else {
      console.log('⚠️ Could not query table structure (expected in hosted)');
    }
    
    // Step 4: Check RLS policies
    console.log('\n4️⃣ Checking RLS policies...');
    
    const { data: policies, error: policyError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: `
        SELECT policyname, cmd, qual 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND schemaname = 'public'
        ` 
      });
    
    if (!policyError && policies) {
      console.log('🔐 RLS Policies on profiles:');
      policies.forEach(policy => {
        console.log(`   ${policy.policyname} (${policy.cmd}): ${policy.qual}`);
      });
    } else {
      console.log('⚠️ Could not query RLS policies (expected in hosted)');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

debugSettingsIssue().catch(console.error);