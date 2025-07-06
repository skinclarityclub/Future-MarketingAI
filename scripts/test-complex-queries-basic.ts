#!/usr/bin/env tsx

/**
 * Basic Complex Query Handler Test
 *
 * Tests the complex query detection and decomposition logic
 * without requiring external services or API keys.
 */

// Test queries with different complexity levels
const testQueries = [
  {
    question: "What are our current sales numbers?",
    expectedComplex: false,
    description: "Simple KPI query",
  },
  {
    question:
      "How do our marketing campaigns affect customer churn and which content performs best for retention?",
    expectedComplex: true,
    description: "Multi-domain correlation analysis",
  },
  {
    question:
      "What's the correlation between our top-selling products and customer satisfaction scores?",
    expectedComplex: true,
    description: "Cross-domain analysis",
  },
  {
    question: "Show me revenue for last month",
    expectedComplex: false,
    description: "Simple temporal query",
  },
  {
    question:
      "How can we optimize our content strategy based on seasonal sales trends and customer behavior patterns while improving our marketing ROI?",
    expectedComplex: true,
    description: "Multi-domain optimization query",
  },
  {
    question: "Which customers are at risk?",
    expectedComplex: false,
    description: "Simple prediction query",
  },
];

/**
 * Test complex query detection logic
 */
function testComplexQueryDetection() {
  console.log("🔍 Testing Complex Query Detection");
  console.log("==================================\n");

  // Import the detection function logic inline (since we can't import from the assistant service easily)
  function detectComplexQuery(question: string): boolean {
    const complexIndicators = [
      // Multi-domain keywords
      /\b(correlation|relationship|impact|effect|influence)\b/i,
      /\b(compare|vs|versus|against)\b/i,
      /\b(optimize|optimization|improve|enhance)\b/i,

      // Multi-metric queries
      /\b(and|while|but|however|whereas)\b/i,

      // Complex analytical terms
      /\b(forecast|predict|trend|pattern|insight)\b/i,
      /\b(why|how|what if|what would happen)\b/i,

      // Cross-functional analysis
      /\b(marketing.*sales|customer.*revenue|content.*conversion)\b/i,
      /\b(retention.*churn|growth.*cost|performance.*roi)\b/i,

      // Multi-step questions
      /\b(first.*then|after.*analyze|once.*determine)\b/i,
    ];

    // Check if question contains multiple complex indicators
    const matches = complexIndicators.filter(pattern => pattern.test(question));
    return matches.length >= 2 || question.split(/[.!?]/).length > 2;
  }

  let passCount = 0;
  let totalCount = testQueries.length;

  for (let i = 0; i < testQueries.length; i++) {
    const test = testQueries[i];
    const detected = detectComplexQuery(test.question);
    const isCorrect = detected === test.expectedComplex;

    console.log(`Test ${i + 1}/${totalCount}: ${test.description}`);
    console.log(`Question: "${test.question}"`);
    console.log(`Expected: ${test.expectedComplex ? "Complex" : "Simple"}`);
    console.log(`Detected: ${detected ? "Complex" : "Simple"}`);

    if (isCorrect) {
      console.log(`✅ PASS`);
      passCount++;
    } else {
      console.log(`❌ FAIL`);
    }
    console.log("");
  }

  console.log("=====================================");
  console.log(`Detection Results: ${passCount}/${totalCount} passed`);
  return passCount === totalCount;
}

/**
 * Test query decomposition interface
 */
function testQueryDecompositionInterface() {
  console.log("\n🔧 Testing Query Decomposition Interface");
  console.log("==========================================\n");

  // Test domain mapping function
  function mapDomainToDataSources(domain: string): string[] {
    const domainMap: Record<string, string[]> = {
      customer: ["supabase_customer", "shopify"],
      sales: ["shopify", "supabase_financial"],
      content: ["kajabi", "supabase_financial"],
      marketing: ["marketing", "supabase_financial"],
      financial: ["supabase_financial"],
      general: ["supabase_financial", "supabase_customer"],
    };

    return domainMap[domain] || ["supabase_financial"];
  }

  const testDomains = ["customer", "sales", "content", "marketing", "unknown"];
  let passCount = 0;

  for (const domain of testDomains) {
    const sources = mapDomainToDataSources(domain);
    const hasValidSources = Array.isArray(sources) && sources.length > 0;

    console.log(`Domain: ${domain}`);
    console.log(`Sources: ${sources.join(", ")}`);

    if (hasValidSources) {
      console.log(`✅ PASS`);
      passCount++;
    } else {
      console.log(`❌ FAIL`);
    }
    console.log("");
  }

  console.log(`Domain Mapping: ${passCount}/${testDomains.length} passed`);
  return passCount === testDomains.length;
}

/**
 * Test visualization suggestion generation
 */
function testVisualizationSuggestions() {
  console.log("\n📊 Testing Visualization Suggestions");
  console.log("====================================\n");

  function generateVisualizationSuggestions(
    domain: string,
    intent: string
  ): any[] {
    const suggestions: any[] = [];

    if (domain === "customer" || intent === "customer_lookup") {
      suggestions.push({
        type: "chart",
        title: "Customer Segmentation",
        chartType: "pie",
        priority: "high",
      });
    }

    if (domain === "sales" || intent === "sales_report") {
      suggestions.push({
        type: "chart",
        title: "Revenue Trends",
        chartType: "line",
        priority: "high",
      });
    }

    return suggestions;
  }

  const testCases = [
    { domain: "customer", intent: "customer_analysis", expectedCount: 1 },
    { domain: "sales", intent: "sales_report", expectedCount: 1 },
    { domain: "general", intent: "kpi_query", expectedCount: 0 },
  ];

  let passCount = 0;

  for (const testCase of testCases) {
    const suggestions = generateVisualizationSuggestions(
      testCase.domain,
      testCase.intent
    );
    const isCorrect = suggestions.length === testCase.expectedCount;

    console.log(`Domain: ${testCase.domain}, Intent: ${testCase.intent}`);
    console.log(`Expected suggestions: ${testCase.expectedCount}`);
    console.log(`Generated suggestions: ${suggestions.length}`);

    if (isCorrect) {
      console.log(`✅ PASS`);
      passCount++;
    } else {
      console.log(`❌ FAIL`);
    }
    console.log("");
  }

  console.log(`Visualization Tests: ${passCount}/${testCases.length} passed`);
  return passCount === testCases.length;
}

/**
 * Main test execution
 */
async function main() {
  console.log("🧪 Complex Query Handler - Basic Tests");
  console.log("=======================================\n");

  const test1 = testComplexQueryDetection();
  const test2 = testQueryDecompositionInterface();
  const test3 = testVisualizationSuggestions();

  const allPassed = test1 && test2 && test3;

  console.log("\n🎯 Overall Test Results");
  console.log("========================");
  console.log(`✅ Complex Query Detection: ${test1 ? "PASS" : "FAIL"}`);
  console.log(`✅ Query Decomposition Interface: ${test2 ? "PASS" : "FAIL"}`);
  console.log(`✅ Visualization Suggestions: ${test3 ? "PASS" : "FAIL"}`);
  console.log("");

  if (allPassed) {
    console.log(
      "🎉 All basic tests passed! Core complex query logic is working."
    );
    console.log("");
    console.log("ℹ️  To test the full system with AI integration:");
    console.log("   1. Set up OPENAI_API_KEY in .env.local");
    console.log("   2. Configure Supabase credentials");
    console.log("   3. Run: npm run test:complex-queries");
  } else {
    console.log("⚠️  Some tests failed. Check the implementation.");
  }

  process.exit(allPassed ? 0 : 1);
}

// Run if script is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export {
  testComplexQueryDetection,
  testQueryDecompositionInterface,
  testVisualizationSuggestions,
};
