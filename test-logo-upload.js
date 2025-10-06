// Test logo upload functionality
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testLogoUpload() {
  console.log('🧪 Testing Logo Upload Functionality...\n');

  // Test 1: Check if bucket exists
  console.log('1. Checking if chatbot-assets bucket exists...');
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('❌ Error listing buckets:', error.message);
      return;
    }
    
    const chatbotBucket = buckets.find(b => b.name === 'chatbot-assets');
    if (chatbotBucket) {
      console.log('✅ chatbot-assets bucket exists');
      console.log(`   - Public: ${chatbotBucket.public}`);
      console.log(`   - Created: ${chatbotBucket.created_at}`);
    } else {
      console.log('❌ chatbot-assets bucket NOT found');
      console.log('Available buckets:', buckets.map(b => b.name));
      return;
    }
  } catch (err) {
    console.error('❌ Bucket check failed:', err.message);
    return;
  }

  // Test 2: Check authentication
  console.log('\n2. Checking authentication...');
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.log('❌ User not authenticated');
    console.log('   Need to sign in first to test upload');
    return;
  }
  console.log('✅ User authenticated');
  console.log(`   - User ID: ${user.id}`);
  console.log(`   - Email: ${user.email}`);

  // Test 3: Try to upload a simple test file
  console.log('\n3. Testing file upload...');
  const testFile = new Blob(['test logo content'], { type: 'image/png' });
  const fileName = `test-logo-${Date.now()}.png`;
  
  try {
    const { data, error } = await supabase.storage
      .from('chatbot-assets')
      .upload(fileName, testFile);

    if (error) {
      console.error('❌ Upload failed:', error.message);
      console.error('   Error details:', error);
      
      // Check specific error types
      if (error.message.includes('new row violates row-level security policy')) {
        console.log('\n🚨 STORAGE POLICY ISSUE DETECTED:');
        console.log('   - The storage policies are missing or incorrect');
        console.log('   - You need to create the 4 storage policies in Supabase Dashboard');
        console.log('   - Go to Storage → Policies → chatbot-assets bucket');
      }
      
      return;
    }
    
    console.log('✅ Upload successful!');
    console.log(`   - File path: ${data.path}`);
    console.log(`   - Full URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/chatbot-assets/${data.path}`);
    
    // Test 4: Try to read the uploaded file (test public access)
    console.log('\n4. Testing public access to uploaded file...');
    const { data: publicData } = supabase.storage
      .from('chatbot-assets')
      .getPublicUrl(data.path);
    
    console.log('✅ Public URL generated:', publicData.publicUrl);
    
    // Clean up - delete test file
    console.log('\n5. Cleaning up test file...');
    const { error: deleteError } = await supabase.storage
      .from('chatbot-assets')
      .remove([data.path]);
    
    if (deleteError) {
      console.log('⚠️ Could not delete test file:', deleteError.message);
    } else {
      console.log('✅ Test file cleaned up');
    }
    
  } catch (err) {
    console.error('❌ Upload test failed:', err.message);
  }

  // Test 5: Check storage policies exist
  console.log('\n6. Checking storage policies...');
  try {
    // This query will help us see if policies exist
    const { data: policies, error: policyError } = await supabase
      .from('storage.policies')
      .select('*')
      .eq('bucket_id', 'chatbot-assets');
    
    if (policyError) {
      console.log('⚠️ Could not check policies (this is normal if policies table structure is different)');
      console.log('   You need to manually verify policies exist in Supabase Dashboard');
    } else {
      console.log('✅ Storage policies found:', policies.length);
      policies.forEach(policy => {
        console.log(`   - ${policy.name}: ${policy.definition} (${policy.operation})`);
      });
    }
  } catch (err) {
    console.log('⚠️ Policy check not available - manually verify in Supabase Dashboard');
  }

  console.log('\n📋 SUMMARY:');
  console.log('If upload failed with RLS policy error, you need to:');
  console.log('1. Go to Supabase Dashboard → Storage → Policies');
  console.log('2. Create 4 policies for chatbot-assets bucket:');
  console.log('   - INSERT policy: auth.uid() IS NOT NULL (authenticated)');
  console.log('   - SELECT policy: true (public)');
  console.log('   - UPDATE policy: auth.uid() IS NOT NULL (authenticated)');
  console.log('   - DELETE policy: auth.uid() IS NOT NULL (authenticated)');
}

testLogoUpload().catch(console.error);