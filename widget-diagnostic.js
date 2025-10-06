// Widget Embedding Diagnostic Tool
// Run this in browser console on the website where widget should appear

console.log('🔍 TrulyBot Widget Diagnostic Tool');
console.log('=====================================\n');

// Test 1: Check if script is loaded
console.log('1. Checking script loading...');
const scripts = document.querySelectorAll('script[src*="trulybot"]');
if (scripts.length > 0) {
  console.log('✅ TrulyBot script found:', scripts[0].src);
  console.log('   - Chatbot ID:', scripts[0].getAttribute('data-chatbot-id'));
  console.log('   - API URL:', scripts[0].getAttribute('data-api-url'));
} else {
  console.log('❌ TrulyBot script not found in DOM');
}

// Test 2: Check if widget container exists
console.log('\n2. Checking widget container...');
const widgetContainer = document.getElementById('trulybot-widget');
if (widgetContainer) {
  console.log('✅ Widget container found');
  console.log('   - Visibility:', getComputedStyle(widgetContainer).visibility);
  console.log('   - Display:', getComputedStyle(widgetContainer).display);
  console.log('   - Z-index:', getComputedStyle(widgetContainer).zIndex);
} else {
  console.log('❌ Widget container not found');
}

// Test 3: Check for widget launcher button
console.log('\n3. Checking widget launcher...');
const launcher = document.querySelector('[id*="trulybot"], [class*="trulybot"], [data-widget="trulybot"]');
if (launcher) {
  console.log('✅ Widget launcher found:', launcher);
} else {
  console.log('❌ Widget launcher not found');
}

// Test 4: Check network requests
console.log('\n4. Checking network connectivity...');
fetch('https://www.trulybot.xyz/widget/loader.js')
  .then(response => {
    if (response.ok) {
      console.log('✅ Widget loader accessible');
    } else {
      console.log('❌ Widget loader failed:', response.status);
    }
  })
  .catch(error => {
    console.log('❌ Network error:', error.message);
  });

// Test 5: Check for JavaScript errors
console.log('\n5. Checking for errors...');
window.addEventListener('error', (e) => {
  if (e.filename && e.filename.includes('trulybot')) {
    console.log('❌ TrulyBot error:', e.message);
  }
});

// Test 6: Check iframe content
console.log('\n6. Checking for widget iframe...');
const iframes = document.querySelectorAll('iframe');
const trulyBotIframe = Array.from(iframes).find(iframe => 
  iframe.src && iframe.src.includes('trulybot')
);
if (trulyBotIframe) {
  console.log('✅ TrulyBot iframe found:', trulyBotIframe.src);
} else {
  console.log('❌ TrulyBot iframe not found');
}

// Test 7: Manual widget creation test
console.log('\n7. Manual widget test...');
console.log('Attempting to manually create widget...');

// Create test widget
const testWidget = document.createElement('div');
testWidget.id = 'trulybot-test-widget';
testWidget.style.cssText = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  cursor: pointer;
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
`;
testWidget.innerHTML = '💬';
testWidget.onclick = () => alert('Test widget clicked! If you see this, the issue is with the TrulyBot script loading.');

document.body.appendChild(testWidget);
console.log('✅ Test widget created (should appear in bottom-right)');

// Summary
console.log('\n📋 DIAGNOSTIC SUMMARY:');
console.log('- Check each ✅/❌ above to identify the issue');
console.log('- If test widget appears but TrulyBot doesn\'t, it\'s a script issue');
console.log('- If nothing appears, it may be a CSS/z-index conflict');
console.log('\n💡 COMMON FIXES:');
console.log('1. Clear browser cache and reload');
console.log('2. Check browser console for errors');
console.log('3. Verify script src URL is accessible');
console.log('4. Check if other scripts are blocking execution');
console.log('5. Try adding script to <head> instead of footer');

setTimeout(() => {
  console.log('\n🔄 Removing test widget...');
  const testEl = document.getElementById('trulybot-test-widget');
  if (testEl) testEl.remove();
}, 10000);