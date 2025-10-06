// Test if logos can be viewed in dashboard
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testLogoDisplay() {
  console.log('🖼️ Testing Logo Display Functionality...\n');

  try {
    // Test 1: List files in chatbot-assets bucket
    console.log('1. Checking uploaded logos in bucket...');
    const { data: files, error: listError } = await supabase.storage
      .from('chatbot-assets')
      .list('');

    if (listError) {
      console.error('❌ Error listing files:', listError.message);
      return;
    }

    if (files && files.length > 0) {
      console.log(`✅ Found ${files.length} files in bucket:`);
      files.forEach(file => {
        const publicUrl = supabase.storage
          .from('chatbot-assets')
          .getPublicUrl(file.name).data.publicUrl;
        
        console.log(`   - ${file.name}`);
        console.log(`     Size: ${file.metadata?.size || 'unknown'} bytes`);
        console.log(`     URL: ${publicUrl}`);
        
        // Extract hostname from URL
        try {
          const url = new URL(publicUrl);
          console.log(`     Hostname: ${url.hostname}`);
        } catch (e) {
          console.log(`     Invalid URL: ${publicUrl}`);
        }
        console.log('');
      });
    } else {
      console.log('⚠️ No files found in bucket');
    }

    // Test 2: Check next.config.js domains
    console.log('2. Checking next.config.js configuration...');
    const fs = require('fs');
    const nextConfig = fs.readFileSync('next.config.js', 'utf8');
    
    if (nextConfig.includes('ilcydjngyatddefgdjpg.supabase.co')) {
      console.log('✅ Supabase hostname found in next.config.js');
    } else {
      console.log('❌ Supabase hostname NOT found in next.config.js');
      console.log('   Need to add: ilcydjngyatddefgdjpg.supabase.co');
    }

    // Test 3: Generate test URL and check format
    console.log('3. Testing URL generation...');
    const testFileName = 'test-logo.jpg';
    const { data: urlData } = supabase.storage
      .from('chatbot-assets')
      .getPublicUrl(testFileName);
    
    console.log(`Test URL: ${urlData.publicUrl}`);
    
    try {
      const url = new URL(urlData.publicUrl);
      console.log(`URL hostname: ${url.hostname}`);
      console.log(`URL protocol: ${url.protocol}`);
      console.log(`URL pathname: ${url.pathname}`);
    } catch (e) {
      console.error('❌ Invalid URL format');
    }

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }

  console.log('\n📋 TROUBLESHOOTING:');
  console.log('If logo still not displaying:');
  console.log('1. Hard refresh browser (Ctrl+F5)');
  console.log('2. Clear browser cache');
  console.log('3. Check browser console for errors');
  console.log('4. Restart dev server completely');
}

testLogoDisplay().catch(console.error);