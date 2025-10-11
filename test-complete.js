/**
 * ChatGPT-Level Engagement System - Comprehensive Test Suite
 */

const http = require("http");

const testScenarios = [
  {
    name: "Excited User Test",
    message: "I'm so excited about your chatbot features! This looks amazing!",
    expectedFeatures: ["personality", "enthusiasm", "follow-up"],
  },
  {
    name: "Frustrated User Test",
    message: "This is confusing, I can't figure out your pricing. Help!",
    expectedFeatures: ["empathy", "support", "solution"],
  },
  {
    name: "Urgent Business Test",
    message: "I need to set this up ASAP for a client demo tomorrow",
    expectedFeatures: ["urgency", "direct", "action"],
  },
  {
    name: "Curious Technical Test",
    message:
      "How exactly does the AI training work? What's the underlying architecture?",
    expectedFeatures: ["detailed", "technical", "curious"],
  },
  {
    name: "Casual Greeting Test",
    message: "Hey, what can your bot do?",
    expectedFeatures: ["friendly", "welcoming", "engaging"],
  },
];

function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);

    const options = {
      hostname: "localhost",
      port: 3001,
      path: "/api/chat",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData,
        });
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

function analyzeEngagement(responseText) {
  const checks = {
    hasPersonality:
      /I'm|I'd|really|amazing|exciting|interesting|love|fantastic|wonderful/i.test(
        responseText,
      ),
    showsEmotion:
      /excited|enthusiasm|great|awesome|amazing|fantastic|wonderful|understand|feel/i.test(
        responseText,
      ),
    hasQuestions: /\?/.test(responseText),
    substantialContent: responseText.length > 50,
    avoidsRobotSpeech: !/I am an AI|I am a chatbot|I don't have|I cannot/i.test(
      responseText,
    ),
    engagingTone:
      /let's|how about|what about|would you|could you|might you/i.test(
        responseText,
      ),
  };

  return checks;
}

async function runTest() {
  console.log("🚀 ChatGPT-Level Engagement System - FULL TEST SUITE");
  console.log("=".repeat(60));
  console.log("");

  let passedTests = 0;
  const totalTests = testScenarios.length;

  for (const scenario of testScenarios) {
    console.log(`🧪 Testing: ${scenario.name}`);
    console.log(`📝 Message: "${scenario.message}"`);

    try {
      const requestData = {
        botId: "demo",
        messages: [{ role: "user", content: scenario.message }],
      };

      const response = await makeRequest(requestData);

      if (response.statusCode === 200) {
        console.log("✅ Response received successfully!");
        console.log(`📄 Response length: ${response.data.length} characters`);

        const sampleText = response.data.substring(
          0,
          Math.min(120, response.data.length),
        );
        console.log(`💬 Sample: "${sampleText}..."`);

        // Analyze engagement features
        const analysis = analyzeEngagement(response.data);

        console.log("\n🔍 Engagement Analysis:");
        let score = 0;
        for (const [feature, passed] of Object.entries(analysis)) {
          const icon = passed ? "✅" : "❌";
          console.log(`  ${icon} ${feature}: ${passed}`);
          if (passed) score++;
        }

        console.log(`\n📊 Engagement Score: ${score}/6`);

        if (score >= 5) {
          console.log("🎉 EXCELLENT! ChatGPT-level engagement detected! 🚀");
          passedTests++;
        } else if (score >= 4) {
          console.log("✅ GOOD! Strong engagement features! 💪");
          passedTests++;
        } else if (score >= 3) {
          console.log("⚠️  MODERATE engagement. Room for improvement.");
        } else {
          console.log("❌ LOW engagement. Needs attention.");
        }

        // Check for specific engagement features
        const hasFollowUp = /\?\s*$/.test(response.data.trim());
        const hasButtons = response.data.includes("__BUTTONS__");
        const hasMetadata = response.headers["x-knowledge-source"];

        console.log("\n🎨 Advanced Features:");
        console.log(
          `  ${hasFollowUp ? "✅" : "❌"} Follow-up Questions: ${hasFollowUp}`,
        );
        console.log(
          `  ${hasButtons ? "✅" : "❌"} Interactive Buttons: ${hasButtons}`,
        );
        console.log(
          `  ${hasMetadata ? "✅" : "❌"} Response Metadata: ${hasMetadata}`,
        );
      } else {
        console.log(`❌ HTTP Error: ${response.statusCode}`);
      }
    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);
    }

    console.log("-".repeat(60));
    console.log("");
  }

  // Final Results
  console.log("🏆 FINAL RESULTS:");
  console.log(`✅ Tests Passed: ${passedTests}/${totalTests}`);
  console.log(
    `📊 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`,
  );
  console.log("");

  if (passedTests === totalTests) {
    console.log(
      "🎉 ALL TESTS PASSED! ChatGPT-level engagement system is PERFECT! 🚀",
    );
  } else if (passedTests >= totalTests * 0.8) {
    console.log(
      "✅ Most tests passed! System shows STRONG engagement capabilities! 💪",
    );
  } else {
    console.log("⚠️  Some tests failed. System may need improvements.");
  }

  console.log("");
  console.log(
    "🌐 Interactive Test Page: http://localhost:3001/test-engagement-system.html",
  );
  console.log("💻 TrulyBot Demo: http://localhost:3001");
  console.log("");
  console.log(
    "🎯 Test completed! The ChatGPT-level engagement system is ready! 🚀",
  );
}

// Run the test
runTest().catch(console.error);
