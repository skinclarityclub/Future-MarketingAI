#!/usr/bin/env tsx

/**
 * Test Complex Query Handler
 *
 * This script tests the complex query handling system with various
 * business intelligence questions to validate functionality.
 */

import { processComplexQuery } from "../src/lib/assistant/complex-query-handler";
import type { ConversationContext } from "../src/lib/assistant/complex-query-handler";

// Test queries ranging from simple to complex
const testQueries = [
  {
    question: "What are our current sales numbers?",
    expectedComplexity: "simple",
    description: "Basic KPI query",
  },
  {
    question:
      "How do our marketing campaigns affect customer churn and which content performs best for retention?",
    expectedComplexity: "complex",
    description: "Multi-domain correlation analysis",
  },
  {
    question:
      "What's the correlation between our top-selling products and customer satisfaction scores over the last quarter?",
    expectedComplexity: "complex",
    description: "Cross-domain temporal analysis",
  },
  {
    question:
      "How can we optimize our content strategy based on seasonal sales trends and customer behavior patterns?",
    expectedComplexity: "complex",
    description: "Strategic optimization with multiple factors",
  },
  {
    question: "Which customers are at risk of churning?",
    expectedComplexity: "simple",
    description: "Single ML prediction query",
  },
  {
    question:
      "If we increase our marketing spend by 20%, what would be the impact on customer acquisition cost and lifetime value?",
    expectedComplexity: "complex",
    description: "Scenario analysis with multiple metrics",
  },
];

// Mock conversation context for testing
const mockContext: ConversationContext = {
  previousQueries: [
    "What's our revenue this month?",
    "Show me customer churn rates",
  ],
  userPreferences: {
    preferredChartTypes: ["line", "bar"],
    detailLevel: "detailed",
    language: "nl",
  },
  currentDashboardState: {
    page: "analytics",
    visibleMetrics: ["revenue", "churn", "cac"],
    timeframe: "last_30_days",
  },
  sessionData: {
    userId: "test-user",
    role: "admin",
    timezone: "Europe/Amsterdam",
  },
};

async function runTests() {
  console.log("🧪 Testing Complex Query Handler");
  console.log("================================\n");

  let passCount = 0;
  let totalCount = testQueries.length;

  for (let i = 0; i < testQueries.length; i++) {
    const test = testQueries[i];
    console.log(`Test ${i + 1}/${totalCount}: ${test.description}`);
    console.log(`Question: "${test.question}"`);
    console.log(`Expected: ${test.expectedComplexity}`);

    try {
      const startTime = Date.now();

      const result = await processComplexQuery(
        test.question,
        mockContext,
        "detailed"
      );

      const duration = Date.now() - startTime;

      // Validate result structure
      const hasRequiredFields = !!(
        result.answer &&
        result.detailedExplanation &&
        Array.isArray(result.sources) &&
        Array.isArray(result.insights) &&
        Array.isArray(result.followUpQuestions) &&
        typeof result.confidence === "number" &&
        typeof result.executionTime === "number"
      );

      if (hasRequiredFields) {
        console.log(`✅ PASS (${duration}ms)`);
        console.log(`   Answer: ${result.answer.slice(0, 100)}...`);
        console.log(`   Sources: ${result.sources.join(", ")}`);
        console.log(`   Insights: ${result.insights.length}`);
        console.log(`   Confidence: ${Math.round(result.confidence * 100)}%`);
        console.log(`   Follow-ups: ${result.followUpQuestions.length}`);
        passCount++;
      } else {
        console.log(`❌ FAIL - Missing required fields`);
        console.log(`   Result structure:`, Object.keys(result));
      }
    } catch (error) {
      console.log(
        `❌ FAIL - Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    console.log("");
  }

  // Summary
  console.log("=====================================");
  console.log(`Test Results: ${passCount}/${totalCount} passed`);

  if (passCount === totalCount) {
    console.log(
      "🎉 All tests passed! Complex query handler is working correctly."
    );
  } else {
    console.log(
      `⚠️  ${totalCount - passCount} tests failed. Check implementation.`
    );
  }

  return passCount === totalCount;
}

// Test individual components
async function testQueryDecomposition() {
  console.log("\n🔍 Testing Query Decomposition");
  console.log("==============================");

  const complexQuery =
    "How do our marketing campaigns affect customer churn and which content performs best for retention?";

  try {
    const { decomposeComplexQuery } = await import(
      "../src/lib/assistant/complex-query-handler"
    );
    const decomposed = await decomposeComplexQuery(complexQuery, mockContext);

    console.log(`Original: ${decomposed.originalQuestion}`);
    console.log(`Sub-queries: ${decomposed.decomposedQueries.length}`);
    console.log(`Cross-domain: ${decomposed.crossDomainAnalysis}`);
    console.log(`Explanation level: ${decomposed.explanationLevel}`);

    decomposed.decomposedQueries.forEach((subQ, index) => {
      console.log(`  ${index + 1}. ${subQ.subQuestion}`);
      console.log(`     Domain: ${subQ.domain}`);
      console.log(`     Priority: ${subQ.priority}`);
      console.log(`     ML needed: ${subQ.mlAnalysisNeeded}`);
    });

    console.log("✅ Query decomposition working");
  } catch (error) {
    console.log(
      `❌ Query decomposition failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Main execution
async function main() {
  try {
    // Test main functionality
    const allTestsPassed = await runTests();

    // Test individual components
    await testQueryDecomposition();

    // Exit with appropriate code
    process.exit(allTestsPassed ? 0 : 1);
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exit(1);
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { runTests, testQueryDecomposition };
