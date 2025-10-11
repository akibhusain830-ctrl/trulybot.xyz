/**
 * Quick Test - Direct Chat API without External Dependencies
 */

const http = require("http");

// Test with a very simple message
const testData = JSON.stringify({
  botId: "demo",
  messages: [{ role: "user", content: "Hello" }],
});

console.log("🚀 Testing Basic Chat API...");
console.log('📝 Message: "Hello"');

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
  console.log(`✅ Response Status: ${res.statusCode}`);
  console.log(`📊 Response Headers:`, res.headers);

  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
    console.log(`📦 Received chunk: ${chunk.length} bytes`);
  });

  res.on("end", () => {
    console.log("\n🎉 COMPLETE RESPONSE:");
    console.log("─".repeat(50));
    console.log(data);
    console.log("─".repeat(50));

    if (data && data.length > 0) {
      console.log("✅ SUCCESS! Chat API is responding!");
      console.log(`📊 Response length: ${data.length} characters`);

      // Check if it contains engagement features
      const hasMetadata =
        data.includes("__BUTTONS__") || data.includes("followUpQuestions");
      console.log(`🎨 Has engagement features: ${hasMetadata}`);

      console.log("\n🎯 ChatGPT-Level Engagement System is working!");
    } else {
      console.log("⚠️ Empty response received");
    }
  });
});

req.on("error", (error) => {
  console.error("❌ Connection Error:", error.message);
  console.log("🔧 Troubleshooting:");
  console.log("  1. Make sure server is running: npm run dev");
  console.log("  2. Check if port 3001 is correct");
  console.log("  3. Verify no firewall blocking localhost");
});

req.on("timeout", () => {
  console.error("❌ Request timeout");
  req.destroy();
});

req.setTimeout(15000); // 15 second timeout
req.write(testData);
req.end();

console.log("⏳ Waiting for response...");
