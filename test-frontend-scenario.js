// Test script to simulate the exact frontend scenario
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

async function testFrontendScenario() {
  console.log('🎯 TESTING FRONTEND SCENARIO');
  console.log('='.repeat(50));
  
  // Create client like the frontend does
  const clientSupabase = createClient(
    envVars.NEXT_PUBLIC_SUPABASE_URL, 
    envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  const testUserId = '6b47cbac-9009-42e3-9a37-b1106bf0cba0';
  
  console.log('\n1️⃣ Testing WITHOUT authentication (like broken frontend)...');
  
  const testSettings = {
    chatbot_name: 'Frontend Test',
    welcome_message: 'This should fail without auth',
    accent_color: '#123456'
  };
  
  // Try to update without being authenticated (should fail)
  const { data: unauthUpdate, error: unauthError } = await clientSupabase
    .from('profiles')
    .upsert({
      id: testUserId,
      ...testSettings,
      updated_at: new Date().toISOString()
    });
  
  if (unauthError) {
    console.log('❌ Expected failure (no auth):', unauthError.message);
  } else {
    console.log('🚨 UNEXPECTED: Update worked without auth!');
  }
  
  console.log('\n2️⃣ Testing authentication requirements...');
  
  // Check what auth methods are available
  const { data: authUser, error: authError } = await clientSupabase.auth.getUser();
  console.log('Auth user check:', authError ? 'No user' : 'Has user');
  
  console.log('\n3️⃣ Testing different update approaches...');
  
  // Test with admin client to confirm the action works
  const adminSupabase = createClient(
    envVars.NEXT_PUBLIC_SUPABASE_URL, 
    envVars.SUPABASE_SERVICE_ROLE_KEY
  );
  
  // Method 1: Standard update (not upsert)
  console.log('Method 1: Using UPDATE instead of UPSERT');
  const { data: updateData, error: updateError } = await adminSupabase
    .from('profiles')
    .update({
      chatbot_name: 'Method 1 Test',
      welcome_message: 'Testing UPDATE method',
      accent_color: '#FF0000',
      updated_at: new Date().toISOString()
    })
    .eq('id', testUserId)
    .select();
  
  if (updateError) {
    console.log('❌ UPDATE failed:', updateError.message);
  } else {
    console.log('✅ UPDATE worked:', updateData[0]?.chatbot_name);
  }
  
  // Method 2: Upsert with admin
  console.log('\nMethod 2: Using UPSERT with admin client');
  const { data: upsertData, error: upsertError } = await adminSupabase
    .from('profiles')
    .upsert({
      id: testUserId,
      chatbot_name: 'Method 2 Test',
      welcome_message: 'Testing UPSERT method',
      accent_color: '#00FF00',
      updated_at: new Date().toISOString()
    })
    .select();
  
  if (upsertError) {
    console.log('❌ UPSERT failed:', upsertError.message);
  } else {
    console.log('✅ UPSERT worked:', upsertData[0]?.chatbot_name);
  }
  
  console.log('\n4️⃣ Checking what the frontend form should use...');
  
  // Recommendation
  console.log('📋 RECOMMENDATIONS:');
  console.log('1. Frontend MUST use UPDATE, not UPSERT (profiles already exist)');
  console.log('2. Authentication session must be properly maintained');
  console.log('3. Use .eq(id, user.id) instead of upsert with id field');
  
  console.log('\n5️⃣ Testing correct frontend pattern...');
  
  // This is how the frontend should work
  const correctPattern = {
    chatbot_name: 'Correct Pattern',
    welcome_message: 'This is the right way',
    accent_color: '#0000FF',
    updated_at: new Date().toISOString()
  };
  
  const { data: correctData, error: correctError } = await adminSupabase
    .from('profiles')
    .update(correctPattern)
    .eq('id', testUserId)
    .select('chatbot_name, welcome_message, accent_color');
  
  if (correctError) {
    console.log('❌ Correct pattern failed:', correctError.message);
  } else {
    console.log('✅ Correct pattern worked:');
    console.log('   Chatbot Name:', correctData[0]?.chatbot_name);
    console.log('   Welcome Message:', correctData[0]?.welcome_message);
    console.log('   Accent Color:', correctData[0]?.accent_color);
  }
}

testFrontendScenario().catch(console.error);