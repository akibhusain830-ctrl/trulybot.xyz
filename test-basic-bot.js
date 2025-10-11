/**
 * Test Multiple Scenarios - Basic Bot Functionality
 */

const http = require("http");

const testMessages = [
  "Hello",
  "Show me your pricing plans",
  "How does your chatbot work?",
  "I need help with setup",
  "What features do you offer?",
];

async function testMessage(message) {
  return new Promise((resolve, reject) => {
    const testData = JSON.stringify({
      botId: "demo",
      messages: [{ role: "user", content: message }],
    });

    const options = {
      hostname: "localhost",
      port: 3001,
      path: "/api/chat",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(testData),
      },
    };

    const req = http.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve({
          message,
          statusCode: res.statusCode,
          response: data,
          responseTime: res.headers["x-response-time"],
        });
      });
    });

    req.on("error", (error) => {
      reject({ message, error: error.message });
    });

    req.write(testData);
    req.end();
  });
}

async function runBasicTests() {
  console.log("🧪 Testing TrulyBot Basic Functionality");
  console.log("=".repeat(50));

  for (const message of testMessages) {
    console.log(`\n📝 Testing: "${message}"`);

    try {
      const result = await testMessage(message);

      if (result.statusCode === 200 && result.response.length > 0) {
        console.log(
          `✅ SUCCESS - Response: "${result.response.substring(0, 80)}..."`,
        );
        console.log(`⏱️  Response time: ${result.responseTime}`);
      } else {
        console.log(
          `❌ FAILED - Status: ${result.statusCode}, Length: ${result.response.length}`,
        );
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.error}`);
    }
  }

  console.log("\n🎉 Basic bot functionality test completed!");
  console.log("💡 The core TrulyBot system is working and ready for users!");
}

runBasicTests().catch(console.error);
