/**
 * Error Detection Engine API
 * Task 62.1: API endpoint for monitoring and testing error detection
 */

import { NextRequest, NextResponse } from "next/server";
import {
  errorDetectionEngine,
  analyzeErrorPatterns,
  getErrorMetrics,
} from "../../../lib/error-handling/error-detection-engine";
import { errorDetectionMiddleware } from "../../../lib/error-handling/error-detection-middleware";
import { logger, LogCategory } from "../../../lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "status";

    switch (action) {
      case "status":
        return NextResponse.json({
          status: "operational",
          engine: "initialized",
          middleware: "active",
          timestamp: new Date().toISOString(),
        });

      case "metrics":
        const metrics = getErrorMetrics();
        return NextResponse.json({
          success: true,
          data: metrics,
        });

      case "patterns":
        const analysis = await analyzeErrorPatterns();
        return NextResponse.json({
          success: true,
          data: analysis,
        });

      case "test":
        // Test error detection with various error types
        const testResults = await runErrorDetectionTests();
        return NextResponse.json({
          success: true,
          data: testResults,
        });

      default:
        return NextResponse.json(
          {
            error: "Invalid action",
            availableActions: ["status", "metrics", "patterns", "test"],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error("Error in error detection API", error, {
      category: LogCategory.SYSTEM,
      component: "error_detection_api",
    });

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case "simulate_error":
        // Simulate an error for testing
        const simulatedError = await simulateError(data);
        return NextResponse.json({
          success: true,
          data: simulatedError,
        });

      case "add_pattern":
        // Add custom error pattern
        if (!data.pattern) {
          return NextResponse.json(
            {
              error: "Pattern data required",
            },
            { status: 400 }
          );
        }

        errorDetectionEngine.addErrorPattern(data.pattern);
        return NextResponse.json({
          success: true,
          message: "Pattern added successfully",
        });

      case "update_config":
        // Update middleware configuration
        if (data.config) {
          errorDetectionMiddleware.updateConfig(data.config);
          return NextResponse.json({
            success: true,
            message: "Configuration updated",
          });
        }
        break;

      default:
        return NextResponse.json(
          {
            error: "Invalid action",
            availableActions: [
              "simulate_error",
              "add_pattern",
              "update_config",
            ],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error("Error in error detection API POST", error, {
      category: LogCategory.SYSTEM,
      component: "error_detection_api",
    });

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function runErrorDetectionTests() {
  const testResults = [];

  // Test 1: Database error
  try {
    const dbError = new Error("Connection timeout to database");
    (dbError as any).code = "ECONNREFUSED";
    const classification = await errorDetectionEngine.detectError(dbError, {
      timestamp: new Date(),
      action: "database_query",
      resource: "/api/users",
    });

    testResults.push({
      test: "Database Error Detection",
      passed: classification.type === "database",
      classification,
    });
  } catch (error) {
    testResults.push({
      test: "Database Error Detection",
      passed: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }

  // Test 2: Authentication error
  try {
    const authError = new Error("Token expired");
    (authError as any).statusCode = 401;
    const classification = await errorDetectionEngine.detectError(authError, {
      timestamp: new Date(),
      action: "authenticate",
      resource: "/api/auth",
    });

    testResults.push({
      test: "Authentication Error Detection",
      passed: classification.type === "authentication",
      classification,
    });
  } catch (error) {
    testResults.push({
      test: "Authentication Error Detection",
      passed: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }

  // Test 3: Rate limit error
  try {
    const rateLimitError = new Error("Too many requests");
    (rateLimitError as any).statusCode = 429;
    const classification = await errorDetectionEngine.detectError(
      rateLimitError,
      {
        timestamp: new Date(),
        action: "api_call",
        resource: "/api/data",
      }
    );

    testResults.push({
      test: "Rate Limit Error Detection",
      passed: classification.type === "rate_limit",
      classification,
    });
  } catch (error) {
    testResults.push({
      test: "Rate Limit Error Detection",
      passed: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }

  // Test 4: Workflow execution error
  try {
    const workflowError = new Error("N8N workflow execution failed");
    const classification = await errorDetectionEngine.detectError(
      workflowError,
      {
        timestamp: new Date(),
        action: "execute_workflow",
        resource: "/api/workflows",
      }
    );

    testResults.push({
      test: "Workflow Error Detection",
      passed: classification.type === "workflow_execution",
      classification,
    });
  } catch (error) {
    testResults.push({
      test: "Workflow Error Detection",
      passed: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }

  return {
    total: testResults.length,
    passed: testResults.filter(t => t.passed).length,
    failed: testResults.filter(t => !t.passed).length,
    tests: testResults,
  };
}

async function simulateError(config: any) {
  const errorType = config?.type || "generic";
  const context = {
    timestamp: new Date(),
    action: "simulate_error",
    resource: "/api/error-detection",
  };

  let error: Error;

  switch (errorType) {
    case "database":
      error = new Error("Database connection failed");
      (error as any).code = "ECONNREFUSED";
      break;

    case "authentication":
      error = new Error("Authentication token expired");
      (error as any).statusCode = 401;
      break;

    case "rate_limit":
      error = new Error("Rate limit exceeded");
      (error as any).statusCode = 429;
      break;

    case "network":
      error = new Error("Network timeout");
      (error as any).code = "ETIMEDOUT";
      break;

    case "validation":
      error = new Error("Validation failed: invalid input");
      (error as any).statusCode = 400;
      break;

    default:
      error = new Error(config?.message || "Simulated error");
  }

  const classification = await errorDetectionEngine.detectError(error, context);

  return {
    simulatedError: {
      type: errorType,
      message: error.message,
      code: (error as any).code,
      statusCode: (error as any).statusCode,
    },
    classification,
    timestamp: new Date().toISOString(),
  };
}
