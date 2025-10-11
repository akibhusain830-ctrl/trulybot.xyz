/**
 * Simple test for ChatGPT-level engagement system
 */

const https = require("http");

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
};

console.log("🚀 Testing ChatGPT-level engagement system...");
console.log(
  '📝 Test message: "I\'m so excited about your chatbot features! This looks amazing!"',
);
console.log("");

const req = https.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  console.log(`📊 Headers:`, res.headers);
  console.log("");

  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log("🎉 Response received:");
    console.log("─".repeat(50));
    console.log(data);
    console.log("─".repeat(50));

    // Analyze response for engagement features
    const analysis = {
      hasPersonality:
        /I\\'m|I\\'d|really|amazing|exciting|interesting|love|fantastic/i.test(
          data,
        ),
      hasEmotionalAwareness: /excited|enthusiasm|amazing|great|wonderful/i.test(
        data,
      ),
      hasFollowUpQuestion: data.includes("?"),
      isSubstantial: data.length > 50,
      avoidsRobotic: !/I am an AI|I am a chatbot|I don't have/i.test(data),
    };

    console.log("🔍 Engagement Analysis:");
    Object.entries(analysis).forEach(([feature, passed]) => {
      console.log(`  ${passed ? "✅" : "❌"} ${feature}: ${passed}`);
    });

    const score = Object.values(analysis).filter(Boolean).length;
    console.log("");
    console.log(`📈 Engagement Score: ${score}/5`);

    if (score >= 4) {
      console.log("🎉 EXCELLENT! ChatGPT-level engagement is working! 🚀");
    } else if (score >= 3) {
      console.log("✅ GOOD! Strong engagement features detected! 💪");
    } else {
      console.log("⚠️  Room for improvement in engagement.");
    }
  });
});

req.on("error", (error) => {
  console.error("❌ Error:", error.message);
  console.log(
    "Make sure the development server is running on http://localhost:3001",
  );
});

req.write(testData);
req.end();
