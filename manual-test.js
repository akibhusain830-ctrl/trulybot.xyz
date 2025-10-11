/**
 * Simple Manual Test for ChatGPT-Level Engagement System
 */

const http = require("http");

async function singleTest() {
  console.log("🚀 Testing ChatGPT-Level Engagement System");
  console.log("Testing excited user scenario...");

  const testData = JSON.stringify({
    botId: "demo",
    messages: [
      {
        role: "user",
        content:
          "I'm so excited about your chatbot features! This looks amazing!",
      },
    ],
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
    timeout: 30000,
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log(`✅ Status: ${res.statusCode}`);
      console.log(`📊 Headers:`, JSON.stringify(res.headers, null, 2));

      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log("\n🎉 RAW RESPONSE:");
        console.log("─".repeat(80));
        console.log(data);
        console.log("─".repeat(80));

        // Quick analysis
        const hasPersonality =
          /I'm|really|amazing|exciting|love|fantastic/i.test(data);
        const hasEmotion = /excited|great|wonderful|awesome/i.test(data);
        const hasQuestion = data.includes("?");
        const isLong = data.length > 50;

        console.log("\n🔍 Quick Analysis:");
        console.log(`✅ Has Personality: ${hasPersonality}`);
        console.log(`✅ Shows Emotion: ${hasEmotion}`);
        console.log(`✅ Has Follow-up: ${hasQuestion}`);
        console.log(`✅ Substantial: ${isLong}`);

        const score = [hasPersonality, hasEmotion, hasQuestion, isLong].filter(
          Boolean,
        ).length;
        console.log(`\n📊 Engagement Score: ${score}/4`);

        if (score >= 3) {
          console.log("🎉 SUCCESS! ChatGPT-level engagement is working! 🚀");
        } else {
          console.log("⚠️ Needs improvement in engagement.");
        }

        resolve(data);
      });
    });

    req.on("error", (error) => {
      console.error("❌ Request Error:", error.message);
      reject(error);
    });

    req.on("timeout", () => {
      console.error("❌ Request timed out");
      req.destroy();
      reject(new Error("Timeout"));
    });

    req.write(testData);
    req.end();
  });
}

// Run the test
singleTest()
  .then(() => {
    console.log("\n🎯 Test completed!");
    console.log(
      "🌐 Open http://localhost:3001/test-engagement-system.html to try interactive testing!",
    );
  })
  .catch((error) => {
    console.error("❌ Test failed:", error.message);
  });
