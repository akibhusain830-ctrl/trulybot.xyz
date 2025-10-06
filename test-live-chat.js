// Test the actual chat API endpoint to see if knowledge retrieval works
const http = require('http');

async function testChatAPI() {
  console.log('🔥 Testing Live Chat API...\n');

  const postData = JSON.stringify({
    messages: [
      { role: "user", content: "What calculator tools do you have available? Tell me about your leather products." }
    ],
    botId: "abee6737-7bb9-4da4-969f-899a2792641e"
  });

  const options = {
    hostname: 'localhost',
    port: 3000,  // Back to port 3000
    path: '/api/chat',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          console.log('📡 Raw Response Status:', res.statusCode);
          console.log('📡 Raw Response:', data.substring(0, 500) + (data.length > 500 ? '...' : ''));
          
          const response = JSON.parse(data);
          console.log('\n✅ Chat API Response:');
          console.log('📝 Message:', response.message);
          console.log('🔍 Knowledge Retrieved:', response.knowledgeRetrieved || 'None');
          console.log('📊 Chunks Found:', response.chunksFound || 0);
          
          if (response.message && response.message.toLowerCase().includes('artisan')) {
            console.log('\n🎉 SUCCESS! The chatbot is using the uploaded business knowledge!');
          } else if (response.message && response.message.toLowerCase().includes('trulybot')) {
            console.log('\n⚠️ ISSUE: Still responding about TrulyBot instead of user business');
          } else {
            console.log('\n❓ Unclear if knowledge retrieval worked - check response content');
          }
          
          resolve(response);
        } catch (error) {
          console.error('❌ Failed to parse JSON:', error.message);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      console.log('💡 Make sure the dev server is running: npm run dev');
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  try {
    console.log('📋 Before testing, please ensure:');
    console.log('   1. Apply the SQL fix in APPLY_THIS_SQL_FIX.sql to Supabase');
    console.log('   2. Restart the development server (npm run dev)');
    console.log('   3. Ensure the server is running on localhost:3001\n');  // Updated port

    await testChatAPI();
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Make sure the dev server is running: npm run dev');
    console.log('   - Apply the SQL fix in Supabase SQL Editor');
    console.log('   - Check that the workspace has documents uploaded');
  }
}

main();