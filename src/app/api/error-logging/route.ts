/**
 * Comprehensive Error Logging API Endpoint
 * Task 62.3: Comprehensive Error Logging & Audit Trail
 */

import { NextRequest, NextResponse } from "next/server";
import {
  comprehensiveErrorLogger,
  getErrorAnalytics,
  exportComplianceLogs,
  AuditEventType,
  ErrorLogLevel,
} from "@/lib/error-handling/comprehensive-error-logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "status";

    switch (action) {
      case "status":
        return NextResponse.json({
          success: true,
          data: {
            status: "operational",
            initialized: true,
            timestamp: new Date().toISOString(),
            version: "1.0.0",
          },
        });

      case "analytics":
        const timeRangeParam = searchParams.get("timeRange");
        let timeRange: { from: Date; to: Date } | undefined;

        if (timeRangeParam) {
          const [from, to] = timeRangeParam.split(",");
          timeRange = {
            from: new Date(from),
            to: new Date(to),
          };
        }

        const analytics = getErrorAnalytics(timeRange);
        return NextResponse.json({
          success: true,
          data: analytics,
          timeRange: timeRange || "all_time",
        });

      case "correlated":
        const correlationId = searchParams.get("correlationId");
        if (!correlationId) {
          return NextResponse.json(
            {
              success: false,
              error: "correlationId parameter is required",
            },
            { status: 400 }
          );
        }

        const correlatedErrors =
          comprehensiveErrorLogger.getCorrelatedErrors(correlationId);
        return NextResponse.json({
          success: true,
          data: correlatedErrors,
          correlationId,
          count: correlatedErrors.length,
        });

      case "audit":
        const eventType = searchParams.get("eventType") as AuditEventType;
        const actor = searchParams.get("actor");
        const resource = searchParams.get("resource");
        const complianceRelevant =
          searchParams.get("complianceRelevant") === "true";
        const auditTimeRange = searchParams.get("timeRange");

        const auditFilters: any = {};
        if (eventType) auditFilters.eventType = eventType;
        if (actor) auditFilters.actor = actor;
        if (resource) auditFilters.resource = resource;
        if (searchParams.has("complianceRelevant"))
          auditFilters.complianceRelevant = complianceRelevant;

        if (auditTimeRange) {
          const [from, to] = auditTimeRange.split(",");
          auditFilters.timeRange = {
            from: new Date(from),
            to: new Date(to),
          };
        }

        const auditTrail = comprehensiveErrorLogger.getAuditTrail(auditFilters);
        return NextResponse.json({
          success: true,
          data: auditTrail,
          filters: auditFilters,
          count: auditTrail.length,
        });

      case "compliance":
        const regulation = searchParams.get("regulation");
        if (!regulation) {
          return NextResponse.json(
            {
              success: false,
              error:
                "regulation parameter is required (GDPR, SOX, HIPAA, PCI-DSS, ISO27001, CUSTOM)",
            },
            { status: 400 }
          );
        }

        const complianceData = exportComplianceLogs(regulation as any);
        return NextResponse.json({
          success: true,
          data: complianceData,
          regulation,
          exportedAt: new Date().toISOString(),
        });

      case "test":
        // Test endpoint to verify all components are working
        const testResults = await runComprehensiveTests();
        return NextResponse.json({
          success: true,
          data: testResults,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid action. Supported actions: status, analytics, correlated, audit, compliance, test",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error logging API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: "Failed to process error logging request",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "log-error":
        const { error, context, options } = body;
        if (!error || !context) {
          return NextResponse.json(
            {
              success: false,
              error: "error and context are required",
            },
            { status: 400 }
          );
        }

        // Convert plain object back to Error instance
        const errorInstance = new Error(error.message);
        errorInstance.name = error.name;
        errorInstance.stack = error.stack;

        const logId = await comprehensiveErrorLogger.logError(
          errorInstance,
          context,
          options
        );

        return NextResponse.json({
          success: true,
          data: {
            logId,
            timestamp: new Date().toISOString(),
          },
        });

      case "resolve-error":
        const { errorId, resolvedBy, resolution, preventionMeasures } = body;
        if (!errorId || !resolvedBy || !resolution) {
          return NextResponse.json(
            {
              success: false,
              error: "errorId, resolvedBy, and resolution are required",
            },
            { status: 400 }
          );
        }

        const resolved = await comprehensiveErrorLogger.resolveError(
          errorId,
          resolvedBy,
          resolution,
          preventionMeasures
        );

        return NextResponse.json({
          success: resolved,
          data: {
            errorId,
            resolved,
            resolvedAt: new Date().toISOString(),
          },
        });

      case "log-audit":
        const auditEvent = body.event;
        if (!auditEvent) {
          return NextResponse.json(
            {
              success: false,
              error: "event object is required",
            },
            { status: 400 }
          );
        }

        const auditId =
          await comprehensiveErrorLogger.logAuditEvent(auditEvent);
        return NextResponse.json({
          success: true,
          data: {
            auditId,
            timestamp: new Date().toISOString(),
          },
        });

      case "initialize":
        const config = body.config || {};
        await comprehensiveErrorLogger.initialize(config);
        return NextResponse.json({
          success: true,
          data: {
            initialized: true,
            config,
            timestamp: new Date().toISOString(),
          },
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid action. Supported actions: log-error, resolve-error, log-audit, initialize",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error logging API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: "Failed to process error logging request",
      },
      { status: 500 }
    );
  }
}

/**
 * Run comprehensive tests for the error logging system
 */
async function runComprehensiveTests() {
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [] as Array<{
      name: string;
      status: "passed" | "failed";
      duration: number;
      details?: any;
      error?: string;
    }>,
  };

  // Test 1: Error logging functionality
  const test1Start = Date.now();
  try {
    const testError = new Error("Test error for comprehensive logging");
    const logId = await comprehensiveErrorLogger.logError(
      testError,
      {
        component: "error-logging-api",
        service: "test-service",
        traceId: "test-trace-123",
        userId: "test-user",
      },
      {
        level: ErrorLogLevel.ERROR,
        category: "test",
        severity: "low",
        impact: "none",
        tags: ["test", "api"],
        metadata: { testRun: true },
      }
    );

    testResults.tests.push({
      name: "Error Logging",
      status: "passed",
      duration: Date.now() - test1Start,
      details: { logId },
    });
  } catch (error) {
    testResults.tests.push({
      name: "Error Logging",
      status: "failed",
      duration: Date.now() - test1Start,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }

  // Test 2: Audit trail functionality
  const test2Start = Date.now();
  try {
    const auditId = await comprehensiveErrorLogger.logAuditEvent({
      eventType: AuditEventType.SYSTEM_ALERT,
      actor: "test-system",
      action: "test-audit-log",
      resource: "error-logging-system",
      outcome: "success",
      details: { testRun: true },
      complianceRelevant: true,
    });

    testResults.tests.push({
      name: "Audit Trail",
      status: "passed",
      duration: Date.now() - test2Start,
      details: { auditId },
    });
  } catch (error) {
    testResults.tests.push({
      name: "Audit Trail",
      status: "failed",
      duration: Date.now() - test2Start,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }

  // Test 3: Analytics generation
  const test3Start = Date.now();
  try {
    const analytics = getErrorAnalytics();
    testResults.tests.push({
      name: "Analytics Generation",
      status: "passed",
      duration: Date.now() - test3Start,
      details: {
        totalErrors: analytics.totalErrors,
        categoriesCount: Object.keys(analytics.errorsByCategory).length,
      },
    });
  } catch (error) {
    testResults.tests.push({
      name: "Analytics Generation",
      status: "failed",
      duration: Date.now() - test3Start,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }

  // Test 4: Compliance export
  const test4Start = Date.now();
  try {
    const complianceData = exportComplianceLogs("GDPR");
    testResults.tests.push({
      name: "Compliance Export",
      status: "passed",
      duration: Date.now() - test4Start,
      details: {
        errorsCount: complianceData.errors.length,
        auditEventsCount: complianceData.auditTrail.length,
      },
    });
  } catch (error) {
    testResults.tests.push({
      name: "Compliance Export",
      status: "failed",
      duration: Date.now() - test4Start,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }

  // Calculate overall status
  const passedTests = testResults.tests.filter(
    test => test.status === "passed"
  ).length;
  const totalTests = testResults.tests.length;
  const overallStatus =
    passedTests === totalTests
      ? "all_passed"
      : `${passedTests}/${totalTests}_passed`;

  return {
    ...testResults,
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: totalTests - passedTests,
      status: overallStatus,
      totalDuration: testResults.tests.reduce(
        (sum, test) => sum + test.duration,
        0
      ),
    },
  };
}
