/**
 * N8N Workflows API Endpoint
 * Task 61.7: Enterprise N8N Integration - API endpoint for workflow monitoring
 * Task 62: Enhanced with Error Handling Master Control
 */

import { NextRequest, NextResponse } from "next/server";
import { n8nClient } from "@/lib/workflows/n8n-client";
import {
  isN8NConfigured,
  getFallbackResponse,
  logError,
} from "@/lib/error-handling/error-config";

export async function GET(request: NextRequest) {
  try {
    // Check if N8N is configured
    if (!isN8NConfigured()) {
      const { searchParams } = new URL(request.url);
      const action = searchParams.get("action") || "list";

      logError(
        new Error("N8N not configured"),
        `workflows-api-${action}`,
        "API_ERROR"
      );

      return NextResponse.json(
        getFallbackResponse(`workflows?action=${action}`),
        { status: 200 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "list";
    const workflowId = searchParams.get("workflowId");
    const days = parseInt(searchParams.get("days") || "7");

    switch (action) {
      case "list":
        const workflows = await n8nClient.getWorkflows();
        return NextResponse.json({
          success: true,
          data: workflows,
          count: workflows.length,
        });

      case "stats":
        if (workflowId) {
          const stats = await n8nClient.getWorkflowAnalytics(workflowId, days);
          return NextResponse.json({
            success: true,
            data: stats,
            workflowId,
            period: `${days} days`,
          });
        } else {
          const allStats = await n8nClient.getAllWorkflowStats();
          return NextResponse.json({
            success: true,
            data: allStats,
            period: `${days} days`,
          });
        }

      case "executions":
        if (!workflowId) {
          return NextResponse.json(
            {
              success: false,
              error: "workflowId is required for executions",
            },
            { status: 400 }
          );
        }

        const limit = parseInt(searchParams.get("limit") || "10");
        const executions = await n8nClient.getWorkflowExecutions(
          workflowId,
          limit
        );
        return NextResponse.json({
          success: true,
          data: executions,
          workflowId,
          limit,
        });

      case "health":
        const health = await n8nClient.healthCheck();
        return NextResponse.json({
          success: true,
          data: health,
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid action. Supported actions: list, stats, executions, health",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("N8N API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: "Failed to communicate with N8N service",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, workflowId, data } = body;

    switch (action) {
      case "execute":
        if (!workflowId) {
          return NextResponse.json(
            {
              success: false,
              error: "workflowId is required for execution",
            },
            { status: 400 }
          );
        }

        const execution = await n8nClient.executeWorkflow(workflowId, data);
        return NextResponse.json({
          success: true,
          data: execution,
        });

      case "activate":
        if (!workflowId) {
          return NextResponse.json(
            {
              success: false,
              error: "workflowId is required for activation",
            },
            { status: 400 }
          );
        }

        const activated = await n8nClient.activateWorkflow(workflowId);
        return NextResponse.json({
          success: activated,
          message: activated
            ? "Workflow activated successfully"
            : "Failed to activate workflow",
        });

      case "deactivate":
        if (!workflowId) {
          return NextResponse.json(
            {
              success: false,
              error: "workflowId is required for deactivation",
            },
            { status: 400 }
          );
        }

        const deactivated = await n8nClient.deactivateWorkflow(workflowId);
        return NextResponse.json({
          success: deactivated,
          message: deactivated
            ? "Workflow deactivated successfully"
            : "Failed to deactivate workflow",
        });

      case "create-content":
        const { type, topic, targetAudience, brand, chatId } = data;
        if (!type || !topic || !targetAudience) {
          return NextResponse.json(
            {
              success: false,
              error:
                "type, topic, and targetAudience are required for content creation",
            },
            { status: 400 }
          );
        }

        const contentExecution = await n8nClient.createMarketingContent({
          type,
          topic,
          targetAudience,
          brand,
          chatId,
        });

        return NextResponse.json({
          success: true,
          data: contentExecution,
        });

      case "webhook":
        const { webhookPath, webhookData, method = "POST" } = data;
        if (!webhookPath) {
          return NextResponse.json(
            {
              success: false,
              error: "webhookPath is required for webhook trigger",
            },
            { status: 400 }
          );
        }

        const webhookResult = await n8nClient.triggerWebhook(
          webhookPath,
          webhookData || {},
          method
        );

        return NextResponse.json({
          success: true,
          data: webhookResult,
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid action. Supported actions: execute, activate, deactivate, create-content, webhook",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("N8N API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: "Failed to execute N8N operation",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const executionId = searchParams.get("executionId");

    if (!executionId) {
      return NextResponse.json(
        {
          success: false,
          error: "executionId is required for deletion",
        },
        { status: 400 }
      );
    }

    const deleted = await n8nClient.deleteExecution(executionId);
    return NextResponse.json({
      success: deleted,
      message: deleted
        ? "Execution deleted successfully"
        : "Failed to delete execution",
    });
  } catch (error) {
    console.error("N8N API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: "Failed to delete execution",
      },
      { status: 500 }
    );
  }
}
