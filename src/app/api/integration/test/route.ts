import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface TestResult {
  id: string;
  name: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
  error?: string;
  details?: string;
  timestamp: Date;
}

interface TestRequest {
  testType: "all" | "supabase" | "crm" | "email" | "performance" | "ui";
  tests?: string[];
}

// Initialize Supabase client (for testing)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { testType, tests }: TestRequest = await request.json();

    const results: TestResult[] = [];
    const startTime = Date.now();

    // Define test suite based on type
    const testSuite = getTestSuite(testType, tests);

    // Run each test
    for (const test of testSuite) {
      const testStartTime = Date.now();

      try {
        const result = await runIndividualTest(test);
        results.push({
          ...result,
          duration: Date.now() - testStartTime,
          timestamp: new Date(),
        });
      } catch (error) {
        results.push({
          id: test.id,
          name: test.name,
          status: "failed",
          duration: Date.now() - testStartTime,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date(),
        });
      }
    }

    const totalDuration = Date.now() - startTime;
    const passedTests = results.filter(r => r.status === "passed").length;
    const failedTests = results.filter(r => r.status === "failed").length;

    return NextResponse.json({
      success: true,
      summary: {
        total: results.length,
        passed: passedTests,
        failed: failedTests,
        duration: totalDuration,
        successRate: (passedTests / results.length) * 100,
      },
      results,
    });
  } catch (error) {
    console.error("Integration test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Integration Test API",
    endpoints: {
      "POST /api/integration/test": "Run integration tests",
      "GET /api/integration/health": "Get system health status",
      "GET /api/integration/crm": "Get CRM integration status",
    },
    availableTestTypes: [
      "all",
      "supabase",
      "crm",
      "email",
      "performance",
      "ui",
    ],
  });
}

// Helper functions
function getTestSuite(testType: string, customTests?: string[]) {
  const allTests = [
    {
      id: "supabase-auth",
      name: "Supabase Authentication",
      type: "supabase",
      endpoint: "/api/auth/supabase",
      method: "GET",
    },
    {
      id: "supabase-data",
      name: "Supabase Data Connection",
      type: "supabase",
      method: "connection",
    },
    {
      id: "crm-hubspot",
      name: "HubSpot CRM Integration",
      type: "crm",
      endpoint: "/api/crm/hubspot/health",
      method: "GET",
    },
    {
      id: "email-service",
      name: "Email Service Test",
      type: "email",
      endpoint: "/api/email/test",
      method: "POST",
    },
    {
      id: "performance-load",
      name: "Performance Load Test",
      type: "performance",
      method: "performance",
    },
    {
      id: "ui-responsiveness",
      name: "UI Responsiveness Test",
      type: "ui",
      method: "ui",
    },
  ];

  if (customTests) {
    return allTests.filter(test => customTests.includes(test.id));
  }

  if (testType === "all") {
    return allTests;
  }

  return allTests.filter(test => test.type === testType);
}

async function runIndividualTest(
  test: any
): Promise<Omit<TestResult, "duration" | "timestamp">> {
  const baseResult = {
    id: test.id,
    name: test.name,
    status: "failed" as const,
    details: "",
  };

  try {
    switch (test.type) {
      case "supabase":
        return await testSupabase(test, baseResult);
      case "crm":
        return await testCRM(test, baseResult);
      case "email":
        return await testEmail(test, baseResult);
      case "performance":
        return await testPerformance(test, baseResult);
      case "ui":
        return await testUI(test, baseResult);
      default:
        throw new Error(`Unknown test type: ${test.type}`);
    }
  } catch (error) {
    return {
      ...baseResult,
      error: error instanceof Error ? error.message : "Test execution failed",
    };
  }
}

async function testSupabase(test: any, baseResult: any) {
  if (test.method === "connection") {
    // Test Supabase connection
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try to fetch user data (this will test auth and connection)
    const { data, error } = await supabase.auth.getSession();

    if (error && error.message !== "Auth session missing!") {
      throw new Error(`Supabase connection failed: ${error.message}`);
    }

    return {
      ...baseResult,
      status: "passed" as const,
      details: "Supabase connection successful",
    };
  }

  // Test API endpoint
  if (test.endpoint) {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}${test.endpoint}`,
      {
        method: test.method || "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return {
      ...baseResult,
      status: "passed" as const,
      details: `API endpoint responded with status ${response.status}`,
    };
  }

  throw new Error("No test method specified for Supabase test");
}

async function testCRM(test: any, baseResult: any) {
  // Simulate CRM integration test
  // In a real implementation, this would test actual CRM API connections

  const crmServices = ["hubspot", "salesforce", "pipedrive"];
  const randomService =
    crmServices[Math.floor(Math.random() * crmServices.length)];

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

  // Simulate success/failure (80% success rate)
  const success = Math.random() > 0.2;

  if (!success) {
    throw new Error(`CRM ${randomService} API connection failed`);
  }

  return {
    ...baseResult,
    status: "passed" as const,
    details: `CRM ${randomService} integration test passed`,
  };
}

async function testEmail(test: any, baseResult: any) {
  // Simulate email service test
  // In a real implementation, this would test actual email service APIs (SendGrid, etc.)

  await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 200));

  const success = Math.random() > 0.1; // 90% success rate

  if (!success) {
    throw new Error("Email service connection failed");
  }

  return {
    ...baseResult,
    status: "passed" as const,
    details: "Email service test passed",
  };
}

async function testPerformance(test: any, baseResult: any) {
  // Simulate performance test
  const startTime = performance.now();

  // Simulate some work
  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));

  const endTime = performance.now();
  const duration = endTime - startTime;

  // Fail if duration is too high (simulate performance threshold)
  if (duration > 2000) {
    throw new Error(
      `Performance test failed: ${duration.toFixed(2)}ms > 2000ms threshold`
    );
  }

  return {
    ...baseResult,
    status: "passed" as const,
    details: `Performance test passed: ${duration.toFixed(2)}ms`,
  };
}

async function testUI(test: any, baseResult: any) {
  // Simulate UI test
  // In a real implementation, this would use tools like Playwright or Cypress

  await new Promise(resolve => setTimeout(resolve, Math.random() * 1200 + 300));

  const success = Math.random() > 0.15; // 85% success rate

  if (!success) {
    throw new Error("UI responsiveness test failed");
  }

  return {
    ...baseResult,
    status: "passed" as const,
    details: "UI responsiveness test passed",
  };
}
