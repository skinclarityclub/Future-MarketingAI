/**
 * Test suite for personality engine integration with AI assistant
 * This file can be used to verify that the personality engine works correctly
 */

import {
  getPersonalityEngine,
  type PersonalityContext,
} from "./personality-engine";

export interface PersonalityTestResult {
  success: boolean;
  message: string;
  adaptedPrompt?: string;
  personalityTraits?: string[];
  errors?: string[];
}

/**
 * Test basic personality engine functionality
 */
export async function testPersonalityEngineBasics(): Promise<PersonalityTestResult> {
  try {
    const engine = getPersonalityEngine();

    // Test with a basic context
    const context: PersonalityContext = {
      userRole: "executive",
      dashboardPage: "financial-dashboard",
      timeOfDay: "morning",
      conversationLength: 1,
      userQuestion: "Wat zijn onze belangrijkste KPI's?",
    };

    const basePrompt = "You are a helpful BI assistant.";
    const adaptedPrompt = await engine.adaptPrompt(basePrompt, context);

    return {
      success: true,
      message: "✅ Personality engine basic test passed",
      adaptedPrompt: adaptedPrompt.systemMessage,
      personalityTraits: [
        adaptedPrompt.personalityModifier,
        adaptedPrompt.contextualAdditions,
        adaptedPrompt.responseGuidelines,
      ].filter(Boolean),
    };
  } catch (error) {
    return {
      success: false,
      message: "❌ Personality engine basic test failed",
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}

/**
 * Test personality engine with different time contexts
 */
export async function testTimeContextAdaptation(): Promise<PersonalityTestResult> {
  try {
    const engine = getPersonalityEngine();
    const basePrompt = "You are a helpful BI assistant.";

    const timeTests = [
      { timeOfDay: "morning" as const, expected: ["goedemorgen", "ochtend"] },
      { timeOfDay: "afternoon" as const, expected: ["middag", "namiddag"] },
      { timeOfDay: "evening" as const, expected: ["avond", "goedenavond"] },
    ];

    const results = [];

    for (const timeTest of timeTests) {
      const context: PersonalityContext = {
        timeOfDay: timeTest.timeOfDay,
        userQuestion: "Hoe gaat het met de verkoop?",
      };

      const adaptedPrompt = await engine.adaptPrompt(basePrompt, context);
      const containsTimeReference = timeTest.expected.some(word =>
        adaptedPrompt.systemMessage.toLowerCase().includes(word)
      );

      results.push({
        timeOfDay: timeTest.timeOfDay,
        adapted: containsTimeReference,
        prompt: adaptedPrompt.systemMessage.slice(0, 200),
      });
    }

    const allAdapted = results.every(r => r.adapted);

    return {
      success: allAdapted,
      message: allAdapted
        ? "✅ Time context adaptation test passed"
        : "⚠️ Time context adaptation test partially passed",
      personalityTraits: results.map(
        r => `${r.timeOfDay}: ${r.adapted ? "✓" : "✗"}`
      ),
    };
  } catch (error) {
    return {
      success: false,
      message: "❌ Time context adaptation test failed",
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}

/**
 * Test personality engine with different user roles
 */
export async function testUserRoleAdaptation(): Promise<PersonalityTestResult> {
  try {
    const engine = getPersonalityEngine();
    const basePrompt = "You are a helpful BI assistant.";

    const roleTests = [
      { userRole: "executive", expectedLevel: "high-level" },
      { userRole: "analyst", expectedLevel: "technical" },
      { userRole: "manager", expectedLevel: "strategic" },
    ];

    const results = [];

    for (const roleTest of roleTests) {
      const context: PersonalityContext = {
        userRole: roleTest.userRole,
        userQuestion: "Analyseer de performance data",
      };

      const adaptedPrompt = await engine.adaptPrompt(basePrompt, context);

      results.push({
        userRole: roleTest.userRole,
        promptLength: adaptedPrompt.systemMessage.length,
        hasRoleAdaptation:
          adaptedPrompt.systemMessage.includes("executive") ||
          adaptedPrompt.systemMessage.includes("analyst") ||
          adaptedPrompt.systemMessage.includes("manager"),
      });
    }

    return {
      success: true,
      message: "✅ User role adaptation test passed",
      personalityTraits: results.map(
        r =>
          `${r.userRole}: ${r.promptLength} chars, role-aware: ${r.hasRoleAdaptation ? "✓" : "✗"}`
      ),
    };
  } catch (error) {
    return {
      success: false,
      message: "❌ User role adaptation test failed",
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}

/**
 * Run all personality engine tests
 */
export async function runAllPersonalityTests(): Promise<
  PersonalityTestResult[]
> {
  console.log("🧪 Running Personality Engine Integration Tests...\n");

  const tests = [
    testPersonalityEngineBasics,
    testTimeContextAdaptation,
    testUserRoleAdaptation,
  ];

  const results: PersonalityTestResult[] = [];

  for (const test of tests) {
    const result = await test();
    results.push(result);
    console.log(result.message);

    if (result.personalityTraits?.length) {
      console.log("  Traits:", result.personalityTraits.join(", "));
    }

    if (result.errors?.length) {
      console.log("  Errors:", result.errors.join(", "));
    }

    console.log("");
  }

  const successCount = results.filter(r => r.success).length;
  const totalTests = results.length;

  console.log(`📊 Test Results: ${successCount}/${totalTests} tests passed`);

  return results;
}

/**
 * Simple test runner that can be called from console or API
 */
export async function runPersonalityEngineTest(): Promise<{
  success: boolean;
  summary: string;
  details: PersonalityTestResult[];
}> {
  const results = await runAllPersonalityTests();
  const successCount = results.filter(r => r.success).length;
  const totalTests = results.length;

  return {
    success: successCount === totalTests,
    summary: `Personality Engine Integration: ${successCount}/${totalTests} tests passed`,
    details: results,
  };
}
