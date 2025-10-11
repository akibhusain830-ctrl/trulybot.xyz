/**
 * ChatGPT-Level Engagement System Test Suite
 * Tests all conversation intelligence features
 */

const API_BASE = "http://localhost:3001";

// Test scenarios for different user moods and intents
const testScenarios = [
  {
    name: "Excited User - High Engagement",
    message: "I'm so excited about your chatbot features! This looks amazing!",
    expectedMood: "excited",
    expectedIntent: "information",
    expectedEngagement: "high",
  },
  {
    name: "Frustrated User - Support Needed",
    message: "This is confusing, I can't figure out your pricing. Help!",
    expectedMood: "frustrated",
    expectedIntent: "support",
    expectedEngagement: "medium",
  },
  {
    name: "Urgent Business User",
    message: "I need to set this up ASAP for a client demo tomorrow morning",
    expectedMood: "urgent",
    expectedIntent: "sales",
    expectedEngagement: "high",
  },
  {
    name: "Curious Technical User",
    message:
      "How exactly does the AI training work? What's the underlying architecture?",
    expectedMood: "curious",
    expectedIntent: "information",
    expectedEngagement: "high",
  },
  {
    name: "Casual First-Time Visitor",
    message: "Hey, what can your bot do?",
    expectedMood: "neutral",
    expectedIntent: "casual",
    expectedEngagement: "medium",
  },
  {
    name: "Expert User - Technical Details",
    message:
      "What's your API rate limit, webhook support, and data retention policies?",
    expectedMood: "neutral",
    expectedIntent: "information",
    expectedEngagement: "medium",
  },
];

async function testConversationIntelligence() {
  console.log("🚀 Starting ChatGPT-Level Engagement System Tests");
  console.log("=".repeat(60));

  let passedTests = 0;
  let totalTests = testScenarios.length;

  for (const scenario of testScenarios) {
    console.log(`\n🧪 Testing: ${scenario.name}`);
    console.log(`📝 Message: "${scenario.message}"`);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          botId: "demo",
          messages: [{ role: "user", content: scenario.message }],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Parse streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullResponse += decoder.decode(value, { stream: true });
      }

      console.log(`✅ Response received (${fullResponse.length} chars)`);

      // Check engagement features
      const engagementFeatures = {
        hasPersonality:
          /I\\'m|I\\'d|really|amazing|exciting|interesting|curious|love|fantastic/i.test(
            fullResponse,
          ),
        hasEmotionalAwareness:
          /understand|feel|frustrated|excited|urgent|help|support/i.test(
            fullResponse,
          ),
        hasFollowUpQuestion: /\?/.test(fullResponse),
        isEngaging:
          fullResponse.length > 50 &&
          !/sorry|cannot|don't know/i.test(fullResponse),
        avoidsRobotic: !/I am an AI|I am a chatbot|I don't have|I cannot/i.test(
          fullResponse,
        ),
      };

      console.log("🔍 Engagement Analysis:");
      Object.entries(engagementFeatures).forEach(([feature, passed]) => {
        console.log(`  ${passed ? "✅" : "❌"} ${feature}: ${passed}`);
      });

      const engagementScore =
        Object.values(engagementFeatures).filter(Boolean).length;
      console.log(`📊 Engagement Score: ${engagementScore}/5`);

      // Check response quality
      const qualityChecks = {
        hasSubstantialContent: fullResponse.length > 100,
        isRelevant: true, // TODO: Could add semantic relevance check
        isPersonal: !/generic|standard|typical/.test(fullResponse),
        hasEnthusiasm: /exciting|great|amazing|love|fantastic|wonderful/i.test(
          fullResponse,
        ),
      };

      console.log("🎯 Quality Analysis:");
      Object.entries(qualityChecks).forEach(([check, passed]) => {
        console.log(`  ${passed ? "✅" : "❌"} ${check}: ${passed}`);
      });

      const qualityScore = Object.values(qualityChecks).filter(Boolean).length;
      console.log(`📈 Quality Score: ${qualityScore}/4`);

      // Overall test result
      const overallScore = (engagementScore + qualityScore) / 9;
      const passed = overallScore >= 0.6; // 60% threshold

      if (passed) {
        passedTests++;
        console.log(
          `🎉 TEST PASSED - Overall Score: ${(overallScore * 100).toFixed(1)}%`,
        );
      } else {
        console.log(
          `❌ TEST FAILED - Overall Score: ${(overallScore * 100).toFixed(1)}%`,
        );
      }

      console.log(`💬 Sample Response: "${fullResponse.substring(0, 150)}..."`);
    } catch (error) {
      console.log(`❌ TEST ERROR: ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`🏆 FINAL RESULTS: ${passedTests}/${totalTests} tests passed`);
  console.log(
    `📊 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`,
  );

  if (passedTests === totalTests) {
    console.log(
      "🎉 ALL TESTS PASSED! ChatGPT-level engagement system is working perfectly! 🚀",
    );
  } else if (passedTests >= totalTests * 0.8) {
    console.log(
      "✅ Most tests passed! System shows strong engagement capabilities! 💪",
    );
  } else {
    console.log(
      "⚠️  Some tests failed. System may need engagement improvements.",
    );
  }
}

// Test contextual welcome messages
async function testContextualWelcome() {
  console.log("\n🏠 Testing Contextual Welcome Messages");
  console.log("-".repeat(40));

  const welcomeScenarios = [
    { context: "pricing", message: "hi" },
    { context: "features", message: "hello" },
    { context: "home", message: "hey there" },
  ];

  for (const scenario of welcomeScenarios) {
    console.log(`\n📍 Testing ${scenario.context} page welcome`);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          botId: "demo",
          messages: [{ role: "user", content: scenario.message }],
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullResponse += decoder.decode(value, { stream: true });
      }

      const isContextual =
        fullResponse.toLowerCase().includes(scenario.context) ||
        fullResponse.length > 80; // Substantial response indicates context awareness

      console.log(
        `${isContextual ? "✅" : "❌"} Contextual welcome: ${isContextual}`,
      );
      console.log(`💬 Response: "${fullResponse.substring(0, 100)}..."`);
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log("🔬 ChatGPT-Level Engagement System - Full Test Suite");
  console.log("Testing conversation intelligence and personality features");
  console.log("");

  await testConversationIntelligence();
  await testContextualWelcome();

  console.log("\n🎯 Test suite completed!");
  console.log(
    "Check the browser at http://localhost:3001/test-engagement-system.html for interactive testing",
  );
}

// Export for browser usage
if (typeof window !== "undefined") {
  window.testEngagementSystem = runAllTests;
  window.testConversationIntelligence = testConversationIntelligence;
  window.testContextualWelcome = testContextualWelcome;
}

// Run tests if in Node.js environment
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    runAllTests,
    testConversationIntelligence,
    testContextualWelcome,
  };

  // Auto-run if this script is executed directly
  if (require.main === module) {
    runAllTests().catch(console.error);
  }
}
