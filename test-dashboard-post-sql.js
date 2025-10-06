// Test Dashboard After SQL Fixes
const http = require('http');

console.log('🎯 Testing Dashboard Functionality After SQL Fixes...\n');

async function testDashboard() {
  // Test 1: Basic connectivity
  console.log('1. Testing Server Connectivity:');
  
  const testEndpoint = (url, name) => {
    return new Promise((resolve) => {
      const request = http.get(url, (res) => {
        console.log(`   ${res.statusCode === 200 ? '✅' : '❌'} ${name}: ${res.statusCode}`);
        resolve(res.statusCode === 200);
      }).on('error', (err) => {
        console.log(`   ❌ ${name}: ${err.message}`);
        resolve(false);
      });
      
      request.setTimeout(3000, () => {
        console.log(`   ❌ ${name}: Timeout`);
        request.destroy();
        resolve(false);
      });
    });
  };

  const serverOk = await testEndpoint('http://localhost:3001', 'Homepage');
  const apiOk = await testEndpoint('http://localhost:3001/api/health', 'Health API');
  const dashboardOk = await testEndpoint('http://localhost:3001/dashboard', 'Dashboard');

  if (serverOk && dashboardOk) {
    console.log('\n✅ SERVER IS WORKING! Dashboard should now function properly.\n');
    
    console.log('🧪 MANUAL TESTING CHECKLIST:');
    console.log('1. Open http://localhost:3001/dashboard in your browser');
    console.log('2. Try uploading a logo in Settings → should work now ✅');
    console.log('3. Try adding knowledge base content → should work now ✅');
    console.log('4. Check browser console → should see fewer/no errors ✅');
    console.log('5. Test payment buttons → Razorpay should load ✅');
    
    console.log('\n🎉 If these work, your dashboard is now 100% functional!');
  } else {
    console.log('\n❌ Server issues detected. Make sure npm run dev is running.');
  }
}

testDashboard();