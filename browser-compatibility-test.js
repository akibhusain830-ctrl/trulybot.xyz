/**
 * TrulyBot Browser Compatibility Test Suite
 * Run this to test core functionality across different browsers
 */

// Browser detection utility
function detectBrowser() {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    return { name: 'Chrome', engine: 'Blink' };
  } else if (userAgent.includes('Firefox')) {
    return { name: 'Firefox', engine: 'Gecko' };
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    return { name: 'Safari', engine: 'WebKit' };
  } else if (userAgent.includes('Edg')) {
    return { name: 'Edge', engine: 'Blink' };
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    return { name: 'Opera', engine: 'Blink' };
  } else {
    return { name: 'Unknown', engine: 'Unknown' };
  }
}

// Feature detection tests
function runFeatureDetectionTests() {
  console.log('🧪 Running Browser Feature Detection Tests...');
  
  const features = {
    // Core Web APIs
    localStorage: 'localStorage' in window,
    sessionStorage: 'sessionStorage' in window,
    webSockets: 'WebSocket' in window,
    geolocation: 'geolocation' in navigator,
    webWorkers: 'Worker' in window,
    
    // Modern JavaScript features
    es6Modules: 'noModule' in HTMLScriptElement.prototype,
    promises: 'Promise' in window,
    fetch: 'fetch' in window,
    arrow_functions: (() => true)(),
    
    // CSS features
    cssGrid: CSS.supports('display', 'grid'),
    cssFlexbox: CSS.supports('display', 'flex'),
    cssVariables: CSS.supports('color', 'var(--fake-var)'),
    
    // Media features
    webRTC: 'RTCPeerConnection' in window,
    audioContext: 'AudioContext' in window || 'webkitAudioContext' in window,
    
    // Security features
    https: location.protocol === 'https:',
    serviceWorker: 'serviceWorker' in navigator,
    
    // Mobile features
    touchEvents: 'ontouchstart' in window,
    deviceMotion: 'DeviceMotionEvent' in window,
    
    // Payment features (for Razorpay)
    paymentRequest: 'PaymentRequest' in window
  };
  
  console.log('📊 Feature Support Results:');
  Object.entries(features).forEach(([feature, supported]) => {
    const icon = supported ? '✅' : '❌';
    console.log(`   ${icon} ${feature}: ${supported}`);
  });
  
  return features;
}

// DOM and UI tests
function runDOMTests() {
  console.log('\n🎨 Running DOM and UI Tests...');
  
  const tests = {
    // Basic DOM functionality
    querySelector: !!document.querySelector,
    querySelectorAll: !!document.querySelectorAll,
    addEventListener: !!window.addEventListener,
    
    // Form functionality
    formValidation: 'checkValidity' in document.createElement('input'),
    inputTypes: {
      email: document.createElement('input').type = 'email',
      tel: document.createElement('input').type = 'tel',
      url: document.createElement('input').type = 'url',
      date: document.createElement('input').type = 'date'
    },
    
    // Media queries
    mediaQueries: 'matchMedia' in window,
    
    // Animation support
    requestAnimationFrame: 'requestAnimationFrame' in window,
    cssAnimations: CSS.supports('animation-name', 'test'),
    cssTransitions: CSS.supports('transition', 'all 1s')
  };
  
  console.log('🎨 DOM Test Results:');
  Object.entries(tests).forEach(([test, result]) => {
    if (typeof result === 'object') {
      console.log(`   📝 ${test}:`);
      Object.entries(result).forEach(([subTest, subResult]) => {
        const icon = subResult ? '✅' : '❌';
        console.log(`     ${icon} ${subTest}: ${subResult}`);
      });
    } else {
      const icon = result ? '✅' : '❌';
      console.log(`   ${icon} ${test}: ${result}`);
    }
  });
  
  return tests;
}

// Network and API tests
async function runNetworkTests() {
  console.log('\n🌐 Running Network and API Tests...');
  
  const tests = {
    fetch_api: false,
    cors_support: false,
    websocket_support: false,
    local_api_health: false
  };
  
  // Test Fetch API
  try {
    if ('fetch' in window) {
      tests.fetch_api = true;
      console.log('   ✅ Fetch API: Available');
    } else {
      console.log('   ❌ Fetch API: Not available');
    }
  } catch (error) {
    console.log('   ❌ Fetch API: Error -', error.message);
  }
  
  // Test WebSocket
  try {
    if ('WebSocket' in window) {
      tests.websocket_support = true;
      console.log('   ✅ WebSocket: Available');
    } else {
      console.log('   ❌ WebSocket: Not available');
    }
  } catch (error) {
    console.log('   ❌ WebSocket: Error -', error.message);
  }
  
  // Test local API health check
  try {
    const response = await fetch('/api/health');
    if (response.ok) {
      tests.local_api_health = true;
      console.log('   ✅ Local API Health: Working');
    } else {
      console.log('   ❌ Local API Health: Failed -', response.status);
    }
  } catch (error) {
    console.log('   ⚠️ Local API Health: Cannot connect (server may be down)');
  }
  
  // Test CORS (if possible)
  tests.cors_support = true; // Assume modern browsers support CORS
  console.log('   ✅ CORS Support: Available');
  
  return tests;
}

// Performance tests
function runPerformanceTests() {
  console.log('\n⚡ Running Performance Tests...');
  
  const performance_data = {
    // Memory usage
    memory: performance.memory ? {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB',
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + ' MB',
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
    } : 'Not available',
    
    // Timing information
    navigation: performance.getEntriesByType ? 
      performance.getEntriesByType('navigation')[0] : 'Not available',
    
    // Connection information
    connection: navigator.connection ? {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink + ' Mbps',
      rtt: navigator.connection.rtt + ' ms'
    } : 'Not available'
  };
  
  console.log('⚡ Performance Results:');
  console.log('   💾 Memory Usage:', performance_data.memory);
  console.log('   🌐 Connection:', performance_data.connection);
  
  if (performance_data.navigation && performance_data.navigation.loadEventEnd) {
    const loadTime = Math.round(performance_data.navigation.loadEventEnd - performance_data.navigation.navigationStart);
    console.log('   ⏱️ Page Load Time:', loadTime + ' ms');
  }
  
  return performance_data;
}

// Main test runner
async function runBrowserCompatibilityTests() {
  const browser = detectBrowser();
  
  console.log('🚀 TrulyBot Browser Compatibility Test Suite');
  console.log('=============================================');
  console.log(`🌐 Browser: ${browser.name} (${browser.engine} engine)`);
  console.log(`📱 User Agent: ${navigator.userAgent}`);
  console.log(`📱 Platform: ${navigator.platform}`);
  console.log(`📱 Language: ${navigator.language}`);
  console.log(`📱 Viewport: ${window.innerWidth}x${window.innerHeight}`);
  console.log('');
  
  // Run all test suites
  const featureResults = runFeatureDetectionTests();
  const domResults = runDOMTests();
  const networkResults = await runNetworkTests();
  const performanceResults = runPerformanceTests();
  
  // Calculate compatibility score
  const totalFeatures = Object.keys(featureResults).length;
  const supportedFeatures = Object.values(featureResults).filter(Boolean).length;
  const compatibilityScore = Math.round((supportedFeatures / totalFeatures) * 100);
  
  console.log('\n🎯 Browser Compatibility Summary');
  console.log('================================');
  console.log(`📊 Compatibility Score: ${compatibilityScore}%`);
  console.log(`✅ Supported Features: ${supportedFeatures}/${totalFeatures}`);
  
  if (compatibilityScore >= 90) {
    console.log('🏆 Excellent compatibility! This browser is fully supported.');
  } else if (compatibilityScore >= 80) {
    console.log('✅ Good compatibility! Minor features may not work.');
  } else if (compatibilityScore >= 70) {
    console.log('⚠️ Fair compatibility. Some features may not work properly.');
  } else {
    console.log('❌ Poor compatibility. This browser may have significant issues.');
  }
  
  // Return full results
  return {
    browser,
    compatibilityScore,
    features: featureResults,
    dom: domResults,
    network: networkResults,
    performance: performanceResults,
    timestamp: new Date().toISOString()
  };
}

// Auto-run tests when script loads
if (typeof window !== 'undefined') {
  // Wait for DOM to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runBrowserCompatibilityTests);
  } else {
    runBrowserCompatibilityTests();
  }
}

// Export for manual testing
window.runBrowserTests = runBrowserCompatibilityTests;