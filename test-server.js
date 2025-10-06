const http = require('http');

console.log('🔍 Testing TrulyBot Server Response...\n');

// Test localhost:3001
const testUrl = (url, description) => {
  return new Promise((resolve) => {
    const request = http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✅ ${description}: Status ${res.statusCode}`);
        if (data.includes('TrulyBot') || data.includes('Dashboard')) {
          console.log('   Content looks correct');
        } else if (res.statusCode === 200) {
          console.log('   Server responding but content might be different');
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log(`❌ ${description}: ${err.message}`);
      resolve();
    });
    
    // Timeout after 5 seconds
    request.setTimeout(5000, () => {
      console.log(`❌ ${description}: Timeout`);
      request.destroy();
      resolve();
    });
  });
};

async function runTests() {
  await testUrl('http://localhost:3001', 'Homepage');
  await testUrl('http://localhost:3001/api/health', 'Health API');
  await testUrl('http://localhost:3001/dashboard', 'Dashboard Page');
  
  console.log('\n📋 Summary:');
  console.log('If you see ✅ responses above, the server is working.');
  console.log('If not, make sure:');
  console.log('1. npm run dev is running');
  console.log('2. No other process is using port 3001');
  console.log('3. All environment variables are set in .env.local');
  console.log('\nTo test dashboard functionality:');
  console.log('1. Open http://localhost:3001/dashboard in browser');
  console.log('2. Run REQUIRED_SQL_FIXES.sql in Supabase SQL Editor');
  console.log('3. Test uploading logo and knowledge base content');
}

runTests();