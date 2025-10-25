#!/usr/bin/env node
/**
 * WordPress Plugin Connection Debugger
 * Run this to test the TrulyBot → WooCommerce connection flow
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function debugWooCommerceConnection() {
  console.log('\n🔍 TrulyBot WordPress Plugin Debugger');
  console.log('=====================================\n');

  // Get input from user
  const userId = await question('Enter your TrulyBot User ID: ');
  const storeUrl = await question('Enter your WooCommerce store URL (e.g., https://mystore.com): ');
  const apiKey = await question('Enter WooCommerce API Key (ck_...): ');
  const apiSecret = await question('Enter WooCommerce API Secret (cs_...): ');

  console.log('\n📡 Testing connection...\n');

  try {
    // Test 1: Validate User ID format
    console.log('1️⃣  Validating User ID format...');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.log('   ❌ Invalid User ID format. Should be UUID (e.g., 46b08806-5fd6-4fac-a253-6c43920ec396)');
      console.log('   💡 Find your User ID in: Dashboard → Settings → Account Info\n');
      rl.close();
      return;
    }
    console.log('   ✅ User ID format is valid\n');

    // Test 2: Validate Store URL
    console.log('2️⃣  Validating Store URL...');
    try {
      new URL(storeUrl);
      console.log('   ✅ Store URL is valid\n');
    } catch(e) {
      console.log('   ❌ Invalid Store URL format\n');
      rl.close();
      return;
    }

    // Test 3: Validate API credentials format
    console.log('3️⃣  Validating API credentials format...');
    if (!apiKey.startsWith('ck_')) {
      console.log('   ❌ API Key should start with "ck_"');
      console.log('   💡 Generate new credentials in: WooCommerce → Settings → Advanced → REST API\n');
      rl.close();
      return;
    }
    if (!apiSecret.startsWith('cs_')) {
      console.log('   ❌ API Secret should start with "cs_"');
      console.log('   💡 Generate new credentials in: WooCommerce → Settings → Advanced → REST API\n');
      rl.close();
      return;
    }
    console.log('   ✅ API credentials format is valid\n');

    // Test 4: Test WooCommerce API connection
    console.log('4️⃣  Testing WooCommerce API connection...');
    const wooTestUrl = new URL('/wp-json/wc/v3/system_status', storeUrl).toString();
    
    const response = await fetch(wooTestUrl, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(apiKey + ':' + apiSecret).toString('base64'),
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      console.log('   ✅ WooCommerce API is reachable\n');
    } else if (response.status === 401) {
      console.log('   ❌ API authentication failed (401)');
      console.log('   💡 Check if API key/secret are correct\n');
      rl.close();
      return;
    } else {
      console.log(`   ❌ Unexpected response code: ${response.status}\n`);
      rl.close();
      return;
    }

    // Test 5: Test TrulyBot backend connection
    console.log('5️⃣  Testing TrulyBot backend connection...');
    const payload = {
      user_id: userId,
      platform: 'woocommerce',
      store_url: storeUrl,
      api_key: apiKey,
      api_secret: apiSecret,
      permissions: 'read',
      store_name: 'Test Store',
      store_email: 'admin@example.com',
      plugin_version: '1.0.0'
    };

    const trulyBotResponse = await fetch('https://trulybot.xyz/api/integrations/woocommerce/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Plugin-Source': 'woocommerce'
      },
      body: JSON.stringify(payload)
    });

    const responseData = await trulyBotResponse.json();

    if (responseData.success) {
      console.log('   ✅ TrulyBot connection successful!\n');
      console.log('✨ All tests passed! Your plugin is ready to use.\n');
    } else {
      console.log(`   ❌ TrulyBot connection failed`);
      console.log(`   Error: ${responseData.message}\n`);
      
      // Provide specific guidance
      if (responseData.message.includes('User not found')) {
        console.log('💡 Make sure you:\n');
        console.log('   1. Copied your User ID correctly from TrulyBot Dashboard');
        console.log('   2. Are using the exact User ID (case-sensitive)\n');
      }
      if (responseData.message.includes('subscription')) {
        console.log('💡 To enable integrations:\n');
        console.log('   1. Go to TrulyBot Dashboard → Billing\n');
        console.log('   2. Upgrade to Pro plan or activate trial\n');
      }
    }

    // Test 6: Browser requirements
    console.log('6️⃣  Browser requirements for the plugin...\n');
    console.log('   ℹ️  The plugin requires:\n');
    console.log('   - JavaScript enabled');
    console.log('   - jQuery loaded (default in WordPress)');
    console.log('   - Cookies enabled');
    console.log('   - No browser extensions blocking AJAX requests\n');

  } catch(error) {
    console.error('❌ Error during testing:', error.message, '\n');
  }

  rl.close();

  // Print final checklist
  console.log('\n📋 Troubleshooting Checklist:\n');
  console.log('□ User ID is correct (check TrulyBot Dashboard)');
  console.log('□ WooCommerce API key/secret are correct and have "read" permissions');
  console.log('□ WooCommerce is enabled and REST API is enabled');
  console.log('□ TrulyBot has active subscription (trial or paid)');
  console.log('□ Browser JavaScript is enabled');
  console.log('□ No browser extensions blocking requests');
  console.log('□ WordPress debug mode is enabled to see errors\n');

  console.log('📞 Still having issues? Check:\n');
  console.log('   1. Open browser DevTools (F12)');
  console.log('   2. Go to Console tab');
  console.log('   3. Look for red error messages');
  console.log('   4. Share the error message for support\n');
}

debugWooCommerceConnection().catch(console.error);
