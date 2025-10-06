/**
 * TrulyBot Widget Robustness Test Suite
 * Tests all widget functionality with error scenarios
 */

const fetch = require('node-fetch');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://trulybot.xyz';
const TEST_USER_ID = 'test-user-id-123'; // Replace with actual user ID for testing

async function testWidgetRobustness() {
  console.log('🧪 Starting TrulyBot Widget Robustness Tests...\n');

  // Test 1: Widget Configuration API
  await testConfigurationAPI();
  
  // Test 2: Widget Loader Script
  await testWidgetLoader();
  
  // Test 3: CORS Headers
  await testCORSHeaders();
  
  // Test 4: Error Handling
  await testErrorHandling();
  
  // Test 5: Fallback Configuration
  await testFallbackConfiguration();

  console.log('\n✅ Widget robustness testing completed!');
}

async function testConfigurationAPI() {
  console.log('📡 Testing Widget Configuration API...');
  
  try {
    // Test valid user ID
    const response = await fetch(`${BASE_URL}/api/widget/config/${TEST_USER_ID}`, {
      method: 'GET',
      headers: {
        'Origin': 'https://external-website.com',
        'Referer': 'https://external-website.com/page'
      }
    });

    if (response.ok) {
      const config = await response.json();
      console.log('✅ Configuration API working');
      console.log('   Config keys:', Object.keys(config));
      console.log('   Fallback mode:', config.fallback || false);
      console.log('   Subscription tier:', config.subscription_tier || config.tier);
    } else {
      console.log('⚠️ Configuration API returned error:', response.status);
    }

    // Test CORS headers
    const corsHeaders = [
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers'
    ];
    
    corsHeaders.forEach(header => {
      if (response.headers.get(header)) {
        console.log(`✅ CORS header present: ${header}`);
      } else {
        console.log(`❌ Missing CORS header: ${header}`);
      }
    });

  } catch (error) {
    console.log('❌ Configuration API test failed:', error.message);
  }
}

async function testWidgetLoader() {
  console.log('\n📜 Testing Widget Loader Script...');
  
  try {
    const response = await fetch(`${BASE_URL}/widget/loader.js`);
    
    if (response.ok) {
      const script = await response.text();
      console.log('✅ Loader script accessible');
      console.log('   Script size:', (script.length / 1024).toFixed(2), 'KB');
      
      // Check for key features in script
      const features = [
        'fetchWithRetry',
        'loadConfiguration',
        'createBubble',
        'toggleChat',
        'WIDGET_CONFIG',
        'cleanup'
      ];
      
      features.forEach(feature => {
        if (script.includes(feature)) {
          console.log(`✅ Feature present: ${feature}`);
        } else {
          console.log(`❌ Missing feature: ${feature}`);
        }
      });

      // Check for robustness features
      const robustnessFeatures = [
        'retryAttempts',
        'fallback',
        'error handling',
        'AbortController',
        'exponential backoff'
      ];
      
      robustnessFeatures.forEach(feature => {
        const searchTerm = feature.replace(' ', '').toLowerCase();
        if (script.toLowerCase().includes(searchTerm)) {
          console.log(`✅ Robustness feature: ${feature}`);
        } else {
          console.log(`⚠️ Missing robustness: ${feature}`);
        }
      });

    } else {
      console.log('❌ Loader script not accessible:', response.status);
    }

    // Test Content-Type header
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('javascript')) {
      console.log('✅ Correct Content-Type header');
    } else {
      console.log('⚠️ Incorrect Content-Type:', contentType);
    }

  } catch (error) {
    console.log('❌ Loader script test failed:', error.message);
  }
}

async function testCORSHeaders() {
  console.log('\n🌐 Testing CORS Configuration...');
  
  try {
    // Test OPTIONS request
    const optionsResponse = await fetch(`${BASE_URL}/api/widget/config/${TEST_USER_ID}`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://customer-website.com',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    if (optionsResponse.ok) {
      console.log('✅ OPTIONS request successful');
      
      const allowOrigin = optionsResponse.headers.get('access-control-allow-origin');
      const allowMethods = optionsResponse.headers.get('access-control-allow-methods');
      const maxAge = optionsResponse.headers.get('access-control-max-age');
      
      console.log('   Allow-Origin:', allowOrigin);
      console.log('   Allow-Methods:', allowMethods);
      console.log('   Max-Age:', maxAge);
      
      if (allowOrigin === '*') {
        console.log('✅ CORS allows all origins');
      } else {
        console.log('⚠️ CORS may be restrictive');
      }
      
    } else {
      console.log('❌ OPTIONS request failed:', optionsResponse.status);
    }

  } catch (error) {
    console.log('❌ CORS test failed:', error.message);
  }
}

async function testErrorHandling() {
  console.log('\n🚨 Testing Error Handling...');
  
  try {
    // Test invalid user ID
    const invalidResponse = await fetch(`${BASE_URL}/api/widget/config/invalid-user-123`);
    
    if (invalidResponse.ok) {
      const config = await invalidResponse.json();
      if (config.fallback) {
        console.log('✅ Fallback configuration returned for invalid user');
        console.log('   Fallback config:', {
          name: config.chatbot_name,
          message: config.welcome_message,
          color: config.accent_color
        });
      } else {
        console.log('⚠️ No fallback indicator in response');
      }
    } else {
      console.log('❌ Error handling returned HTTP error:', invalidResponse.status);
    }

    // Test empty user ID
    const emptyResponse = await fetch(`${BASE_URL}/api/widget/config/`);
    console.log('   Empty ID response status:', emptyResponse.status);

  } catch (error) {
    console.log('❌ Error handling test failed:', error.message);
  }
}

async function testFallbackConfiguration() {
  console.log('\n🔄 Testing Fallback Configuration...');
  
  try {
    // Test with non-existent user to trigger fallback
    const response = await fetch(`${BASE_URL}/api/widget/config/non-existent-user-999`);
    
    if (response.ok) {
      const config = await response.json();
      
      const expectedFallbacks = {
        chatbot_name: 'Assistant',
        welcome_message: 'Hello! How can I help you today?',
        accent_color: '#2563EB',
        chatbot_theme: 'light',
        subscription_tier: 'basic'
      };
      
      let fallbacksWorking = true;
      
      Object.entries(expectedFallbacks).forEach(([key, expectedValue]) => {
        if (config[key] === expectedValue) {
          console.log(`✅ Fallback ${key}: ${config[key]}`);
        } else {
          console.log(`❌ Fallback ${key}: expected "${expectedValue}", got "${config[key]}"`);
          fallbacksWorking = false;
        }
      });
      
      if (fallbacksWorking) {
        console.log('✅ All fallback configurations working correctly');
      } else {
        console.log('⚠️ Some fallback configurations not working');
      }
      
    } else {
      console.log('❌ Fallback test failed with status:', response.status);
    }

  } catch (error) {
    console.log('❌ Fallback test failed:', error.message);
  }
}

async function generateEmbedCode() {
  console.log('\n📋 Generating Updated Embed Code...');
  
  const embedCode = `
<!-- TrulyBot Widget - Robust Version -->
<script>
  (function() {
    // Remove existing TrulyBot elements first
    const existingBubble = document.getElementById('trulybot-chat-bubble');
    const existingIframe = document.getElementById('trulybot-chat-iframe');
    const existingClose = document.getElementById('trulybot-close-btn');
    
    if (existingBubble) existingBubble.remove();
    if (existingIframe) existingIframe.remove();
    if (existingClose) existingClose.remove();
    
    // Cleanup any existing TrulyBot instance
    if (window.TrulyBot && window.TrulyBot.cleanup) {
      window.TrulyBot.cleanup();
    }
    
    // Load the widget script
    const script = document.createElement('script');
    script.src = '${BASE_URL}/widget/loader.js';
    script.setAttribute('data-chatbot-id', '${TEST_USER_ID}');
    script.setAttribute('data-api-url', '${BASE_URL}');
    script.async = true;
    script.onerror = function() {
      console.error('TrulyBot: Failed to load widget script');
    };
    document.head.appendChild(script);
  })();
</script>`;

  console.log('Updated embed code:');
  console.log(embedCode);
  
  return embedCode;
}

// Run the tests
testWidgetRobustness().then(() => {
  generateEmbedCode();
}).catch(error => {
  console.error('Test suite failed:', error);
});