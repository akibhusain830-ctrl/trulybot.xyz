// Create chatbot-assets bucket if it doesn't exist
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for admin operations
);

async function createBucket() {
  console.log('🪣 Creating chatbot-assets bucket...\n');

  try {
    // First, check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      return;
    }

    const existingBucket = buckets.find(b => b.name === 'chatbot-assets');
    if (existingBucket) {
      console.log('✅ chatbot-assets bucket already exists');
      return;
    }

    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('chatbot-assets', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (error) {
      console.error('❌ Failed to create bucket:', error.message);
      console.error('   Error details:', error);
      
      if (error.message.includes('permission')) {
        console.log('\n🚨 PERMISSION ISSUE:');
        console.log('   - Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env.local');
        console.log('   - The service role key has admin permissions');
      }
      return;
    }

    console.log('✅ chatbot-assets bucket created successfully!');
    console.log('   - Bucket ID:', data.id);
    console.log('   - Public access: enabled');
    console.log('   - File size limit: 5MB');
    
  } catch (err) {
    console.error('❌ Bucket creation failed:', err.message);
  }
}

createBucket().catch(console.error);