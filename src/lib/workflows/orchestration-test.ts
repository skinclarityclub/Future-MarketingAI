/**
 * Orchestration Integration Test Suite
 * Task 73: Geleidelijke integratie testen
 *
 * Test script om de integratie tussen beide orchestrators te valideren
 */

import { logger } from "@/lib/logger";

export interface TestCase {
  name: string;
  description: string;
  requestBody: any;
  expectedOrchestrator: "webhook" | "master";
  expectedComplexity: "simple" | "medium" | "complex";
  testType: "routing" | "performance" | "fallback" | "integration";
}

export class OrchestrationTester {
  private baseUrl: string;
  private testResults: Array<{
    testCase: TestCase;
    success: boolean;
    actualOrchestrator?: string;
    responseTime?: number;
    error?: string;
    metadata?: any;
  }> = [];

  constructor(baseUrl = "http://localhost:3000") {
    this.baseUrl = baseUrl;
  }

  /**
   * Voert alle test cases uit
   */
  async runAllTests(): Promise<void> {
    console.log("🧪 Starting Orchestration Integration Tests...\n");

    const testCases = this.getTestCases();

    for (const testCase of testCases) {
      await this.runSingleTest(testCase);
    }

    this.printTestResults();
  }

  /**
   * Voert een enkele test uit
   */
  async runSingleTest(testCase: TestCase): Promise<void> {
    console.log(`🔄 Running: ${testCase.name}`);

    const startTime = Date.now();

    try {
      const response = await fetch(
        `${this.baseUrl}/api/orchestration/gateway`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Test-Case": testCase.name,
          },
          body: JSON.stringify(testCase.requestBody),
        }
      );

      const responseTime = Date.now() - startTime;
      const result = await response.json();

      const actualOrchestrator =
        result.orchestration_metadata?.routing_decision?.target_orchestrator;
      const success = actualOrchestrator === testCase.expectedOrchestrator;

      this.testResults.push({
        testCase,
        success,
        actualOrchestrator,
        responseTime,
        metadata: result.orchestration_metadata,
      });

      console.log(
        `  ${success ? "✅" : "❌"} Expected: ${testCase.expectedOrchestrator}, Got: ${actualOrchestrator}`
      );
      console.log(`  ⏱️  Response time: ${responseTime}ms\n`);
    } catch (error) {
      const responseTime = Date.now() - startTime;

      this.testResults.push({
        testCase,
        success: false,
        responseTime,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      console.log(
        `  ❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      console.log(`  ⏱️  Response time: ${responseTime}ms\n`);
    }
  }

  /**
   * Definieert alle test cases
   */
  private getTestCases(): TestCase[] {
    return [
      // Routing Tests - Simple Cases (should go to Webhook)
      {
        name: "Simple Telegram Callback",
        description: "Basic image approval callback",
        requestBody: {
          update_id: 123456,
          callback_query: {
            id: "test123",
            data: "AIP_1234_image-approval",
            from: { id: 6475835412 },
          },
        },
        expectedOrchestrator: "webhook",
        expectedComplexity: "simple",
        testType: "routing",
      },

      {
        name: "Simple Scheduled Content",
        description: "Standard scheduled post without AI features",
        requestBody: {
          scheduled_execution: true,
          contentType: "post",
          title: "Daily motivation post",
        },
        expectedOrchestrator: "webhook",
        expectedComplexity: "simple",
        testType: "routing",
      },

      // Routing Tests - Complex Cases (should go to Master)
      {
        name: "AI-Enhanced Content Creation",
        description: "Content creation with explicit AI enhancement",
        requestBody: {
          request_type: "post_creation",
          ai_enhanced: true,
          learning_enabled: true,
          content_strategy: "premium",
          target_platforms: ["instagram", "linkedin"],
        },
        expectedOrchestrator: "master",
        expectedComplexity: "complex",
        testType: "routing",
      },

      {
        name: "Multi-Platform Carousel",
        description: "Complex carousel creation for multiple platforms",
        requestBody: {
          workflow_type: "carousel_creation",
          target_platforms: ["instagram", "tiktok", "linkedin", "facebook"],
          optimization_enabled: true,
          priority: "high",
          content_strategy: "enterprise",
        },
        expectedOrchestrator: "master",
        expectedComplexity: "complex",
        testType: "routing",
      },

      {
        name: "Empty Request",
        description: "Test handling of empty/malformed requests",
        requestBody: {},
        expectedOrchestrator: "webhook", // Should fallback to webhook
        expectedComplexity: "simple",
        testType: "routing",
      },
    ];
  }

  /**
   * Print gedetailleerde test resultaten
   */
  private printTestResults(): void {
    console.log("\n" + "=".repeat(80));
    console.log("🎯 ORCHESTRATION INTEGRATION TEST RESULTS");
    console.log("=".repeat(80));

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;

    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(
      `   Passed: ${passedTests} (${Math.round((passedTests / totalTests) * 100)}%)`
    );
    console.log(
      `   Failed: ${failedTests} (${Math.round((failedTests / totalTests) * 100)}%)`
    );

    // Performance metrics
    const responseTimes = this.testResults
      .filter(r => r.responseTime)
      .map(r => r.responseTime!);

    if (responseTimes.length > 0) {
      const avgResponseTime =
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      const minResponseTime = Math.min(...responseTimes);

      console.log(`\n⚡ PERFORMANCE:`);
      console.log(`   Average Response Time: ${Math.round(avgResponseTime)}ms`);
      console.log(`   Min Response Time: ${minResponseTime}ms`);
      console.log(`   Max Response Time: ${maxResponseTime}ms`);
    }

    // Routing distribution
    const webhookRoutes = this.testResults.filter(
      r => r.actualOrchestrator === "webhook"
    ).length;
    const masterRoutes = this.testResults.filter(
      r => r.actualOrchestrator === "master"
    ).length;

    console.log(`\n🎯 ROUTING DISTRIBUTION:`);
    console.log(
      `   Webhook Orchestrator: ${webhookRoutes} (${Math.round((webhookRoutes / totalTests) * 100)}%)`
    );
    console.log(
      `   Master Controller: ${masterRoutes} (${Math.round((masterRoutes / totalTests) * 100)}%)`
    );

    console.log("\n" + "=".repeat(80));
  }

  /**
   * Test specifieke routing scenario
   */
  async testRoutingScenario(
    name: string,
    requestBody: any,
    expectedOrchestrator: "webhook" | "master"
  ): Promise<boolean> {
    const testCase: TestCase = {
      name,
      description: `Custom test: ${name}`,
      requestBody,
      expectedOrchestrator,
      expectedComplexity: "medium",
      testType: "routing",
    };

    await this.runSingleTest(testCase);
    return this.testResults[this.testResults.length - 1].success;
  }
}

// Export voor gebruik in andere modules
export const orchestrationTester = new OrchestrationTester();

// CLI interface voor directe testing
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "test":
      orchestrationTester.runAllTests();
      break;
    case "stress":
      const concurrent = parseInt(args[1]) || 10;
      orchestrationTester.runStressTest(concurrent);
      break;
    case "scenario":
      const scenarioName = args[1] || "Custom Test";
      const requestBody = JSON.parse(args[2] || "{}");
      const expectedOrchestrator =
        (args[3] as "webhook" | "master") || "webhook";
      orchestrationTester.testRoutingScenario(
        scenarioName,
        requestBody,
        expectedOrchestrator
      );
      break;
    default:
      console.log("Usage:");
      console.log("  npm run test:orchestration test          - Run all tests");
      console.log(
        "  npm run test:orchestration stress [n]   - Run stress test with n requests"
      );
      console.log(
        '  npm run test:orchestration scenario "name" "{}" "webhook|master" - Test custom scenario'
      );
  }
}
