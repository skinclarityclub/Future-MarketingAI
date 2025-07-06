/**
 * N8N Live Integration API
 * Task 61.9: Marketing Machine Control Center Live Integration
 */

import { NextRequest, NextResponse } from "next/server";
import {
  n8nLiveIntegration,
  WorkflowTriggerRequest,
} from "@/lib/marketing/n8n-live-integration";
import { z } from "zod";

// Request schema validation
const liveActionSchema = z.object({
  action: z.enum([
    "get_live_status",
    "trigger_workflow",
    "get_execution_status",
    "get_dashboard_data",
    "get_approval_queue",
    "process_approval",
  ]),
  executionId: z.string().optional(),
  workflowName: z
    .enum([
      "PostBuilder",
      "CarouselBuilder",
      "StoryBuilder",
      "ReelBuilder",
      "MarketingManager",
    ])
    .optional(),
  inputData: z.record(z.any()).optional(),
  chatId: z.string().optional(),
  contentStrategy: z.enum(["standard", "premium", "campaign"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  decision: z.enum(["approve", "reject", "modify"]).optional(),
  feedback: z.string().optional(),
});

type LiveActionRequest = z.infer<typeof liveActionSchema>;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "get_live_status":
        const workflows = await n8nLiveIntegration.getLiveWorkflowStatuses();
        return NextResponse.json({ success: true, data: workflows });

      case "get_dashboard_data":
        const dashboardData = await n8nLiveIntegration.getDashboardData();
        return NextResponse.json({ success: true, data: dashboardData });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("N8N Live API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "trigger_workflow":
        const execution = await n8nLiveIntegration.triggerWorkflow(body);
        return NextResponse.json({ success: true, data: execution });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("N8N Live API POST error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

async function handleLiveAction(data: LiveActionRequest) {
  const startTime = Date.now();

  try {
    switch (data.action) {
      case "get_live_status":
        return await handleGetLiveStatus(startTime);

      case "trigger_workflow":
        if (!data.workflowName || !data.chatId) {
          return NextResponse.json(
            { error: "Workflow name and chat ID are required" },
            { status: 400 }
          );
        }
        return await handleTriggerWorkflow(data, startTime);

      case "get_execution_status":
        if (!data.executionId) {
          return NextResponse.json(
            { error: "Execution ID is required" },
            { status: 400 }
          );
        }
        return await handleGetExecutionStatus(data.executionId, startTime);

      case "get_dashboard_data":
        return await handleGetDashboardData(startTime);

      case "get_approval_queue":
        return await handleGetApprovalQueue(startTime);

      case "process_approval":
        if (!data.executionId || !data.decision) {
          return NextResponse.json(
            { error: "Execution ID and decision are required" },
            { status: 400 }
          );
        }
        return await handleProcessApproval(data, startTime);

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error(`Error handling live action ${data.action}:`, error);
    return NextResponse.json(
      {
        error: `Failed to ${data.action}`,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function handleGetLiveStatus(startTime: number) {
  try {
    const workflows = await n8nLiveIntegration.getLiveWorkflowStatuses();

    return NextResponse.json({
      success: true,
      data: {
        workflows,
        total: workflows.length,
        active: workflows.filter(
          w => w.status === "active" || w.status === "running"
        ).length,
        lastUpdated: new Date().toISOString(),
      },
      timing: {
        duration_ms: Date.now() - startTime,
        cached: false,
      },
    });
  } catch (error) {
    console.error("Error getting live workflow status:", error);
    return NextResponse.json(
      {
        error: "Failed to get live workflow status",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function handleTriggerWorkflow(
  data: LiveActionRequest,
  startTime: number
) {
  try {
    const triggerRequest: WorkflowTriggerRequest = {
      workflowName: data.workflowName!,
      inputData: data.inputData || {},
      chatId: data.chatId!,
      contentStrategy: data.contentStrategy || "premium",
      priority: data.priority || "high",
    };

    const execution = await n8nLiveIntegration.triggerWorkflow(triggerRequest);

    return NextResponse.json({
      success: true,
      data: {
        execution,
        triggered_at: new Date().toISOString(),
      },
      timing: {
        duration_ms: Date.now() - startTime,
      },
    });
  } catch (error) {
    console.error("Error triggering workflow:", error);
    return NextResponse.json(
      {
        error: "Failed to trigger workflow",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function handleGetExecutionStatus(
  executionId: string,
  startTime: number
) {
  try {
    const execution = await n8nLiveIntegration.getExecutionStatus(executionId);

    if (!execution) {
      return NextResponse.json(
        { error: "Execution not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        execution,
        checked_at: new Date().toISOString(),
      },
      timing: {
        duration_ms: Date.now() - startTime,
      },
    });
  } catch (error) {
    console.error("Error getting execution status:", error);
    return NextResponse.json(
      {
        error: "Failed to get execution status",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function handleGetDashboardData(startTime: number) {
  try {
    const dashboardData = await n8nLiveIntegration.getDashboardData();

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timing: {
        duration_ms: Date.now() - startTime,
        cached: false,
      },
    });
  } catch (error) {
    console.error("Error getting dashboard data:", error);
    return NextResponse.json(
      {
        error: "Failed to get dashboard data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function handleGetApprovalQueue(startTime: number) {
  try {
    const approvalQueue = await n8nLiveIntegration.getApprovalQueue();

    return NextResponse.json({
      success: true,
      data: {
        queue: approvalQueue,
        count: approvalQueue.length,
        lastUpdated: new Date().toISOString(),
      },
      timing: {
        duration_ms: Date.now() - startTime,
      },
    });
  } catch (error) {
    console.error("Error getting approval queue:", error);
    return NextResponse.json(
      {
        error: "Failed to get approval queue",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function handleProcessApproval(
  data: LiveActionRequest,
  startTime: number
) {
  try {
    const result = await n8nLiveIntegration.processApproval(
      data.executionId!,
      data.decision!,
      data.feedback
    );

    return NextResponse.json({
      success: true,
      data: {
        result,
        processed_at: new Date().toISOString(),
      },
      timing: {
        duration_ms: Date.now() - startTime,
      },
    });
  } catch (error) {
    console.error("Error processing approval:", error);
    return NextResponse.json(
      {
        error: "Failed to process approval",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
