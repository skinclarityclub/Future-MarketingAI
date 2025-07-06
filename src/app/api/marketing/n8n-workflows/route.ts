/**
 * n8n Workflow Integration API
 * Task 32.5: Integrate with n8n Workflows and Predictive Analytics
 */

import { NextRequest, NextResponse } from "next/server";
import { createN8nWorkflowService } from "@/lib/marketing/n8n-workflow-service";
import { z } from "zod";

// Request schema validation
const workflowActionSchema = z.object({
  action: z.enum([
    "list_workflows",
    "get_workflow",
    "execute_workflow",
    "get_executions",
    "get_metrics",
    "get_predictive_insights",
    "set_workflow_status",
    "get_dashboard_data",
  ]),
  workflowId: z.string().optional(),
  inputData: z.record(z.any()).optional(),
  limit: z.number().min(1).max(200).optional(),
  offset: z.number().min(0).optional(),
  active: z.boolean().optional(),
});

type WorkflowActionRequest = z.infer<typeof workflowActionSchema>;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const workflowId = searchParams.get("workflowId");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    if (!action) {
      return NextResponse.json(
        { error: "Action parameter is required" },
        { status: 400 }
      );
    }

    const requestData: WorkflowActionRequest = {
      action: action as any,
      workflowId: workflowId || undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    };

    const validation = workflowActionSchema.safeParse(requestData);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request parameters",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    return await handleWorkflowAction(validation.data);
  } catch (error) {
    console.error("n8n Workflow API GET error:", error);
    return NextResponse.json(
      {
        error: "Failed to process workflow request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = workflowActionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    return await handleWorkflowAction(validation.data);
  } catch (error) {
    console.error("n8n Workflow API POST error:", error);
    return NextResponse.json(
      {
        error: "Failed to process workflow request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function handleWorkflowAction(data: WorkflowActionRequest) {
  const n8nService = createN8nWorkflowService();
  const startTime = Date.now();

  try {
    switch (data.action) {
      case "list_workflows":
        return await handleListWorkflows(n8nService, startTime);

      case "get_workflow":
        if (!data.workflowId) {
          return NextResponse.json(
            { error: "Workflow ID is required" },
            { status: 400 }
          );
        }
        return await handleGetWorkflow(n8nService, data.workflowId, startTime);

      case "execute_workflow":
        if (!data.workflowId) {
          return NextResponse.json(
            { error: "Workflow ID is required" },
            { status: 400 }
          );
        }
        return await handleExecuteWorkflow(
          n8nService,
          data.workflowId,
          data.inputData,
          startTime
        );

      case "get_executions":
        if (!data.workflowId) {
          return NextResponse.json(
            { error: "Workflow ID is required" },
            { status: 400 }
          );
        }
        return await handleGetExecutions(
          n8nService,
          data.workflowId,
          data.limit || 50,
          data.offset || 0,
          startTime
        );

      case "get_metrics":
        if (!data.workflowId) {
          return NextResponse.json(
            { error: "Workflow ID is required" },
            { status: 400 }
          );
        }
        return await handleGetMetrics(n8nService, data.workflowId, startTime);

      case "get_predictive_insights":
        if (!data.workflowId) {
          return NextResponse.json(
            { error: "Workflow ID is required" },
            { status: 400 }
          );
        }
        return await handleGetPredictiveInsights(
          n8nService,
          data.workflowId,
          startTime
        );

      case "set_workflow_status":
        if (!data.workflowId || data.active === undefined) {
          return NextResponse.json(
            { error: "Workflow ID and active status are required" },
            { status: 400 }
          );
        }
        return await handleSetWorkflowStatus(
          n8nService,
          data.workflowId,
          data.active,
          startTime
        );

      case "get_dashboard_data":
        return await handleGetDashboardData(n8nService, startTime);

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error(`Error handling workflow action ${data.action}:`, error);
    return NextResponse.json(
      {
        error: `Failed to ${data.action}`,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function handleListWorkflows(n8nService: any, startTime: number) {
  const workflows = await n8nService.getAllWorkflows();
  const processingTime = Date.now() - startTime;

  return NextResponse.json({
    success: true,
    data: {
      workflows,
      count: workflows.length,
      active_workflows: workflows.filter((w: any) => w.status === "active")
        .length,
      processing_time_ms: processingTime,
    },
    meta: {
      action: "list_workflows",
      timestamp: new Date().toISOString(),
    },
  });
}

async function handleGetWorkflow(
  n8nService: any,
  workflowId: string,
  startTime: number
) {
  const workflow = await n8nService.getWorkflow(workflowId);
  const processingTime = Date.now() - startTime;

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  // Get additional metrics for the workflow
  const metrics = await n8nService.getWorkflowMetrics(workflowId);

  return NextResponse.json({
    success: true,
    data: {
      workflow,
      metrics,
      processing_time_ms: processingTime,
    },
    meta: {
      action: "get_workflow",
      workflow_id: workflowId,
      timestamp: new Date().toISOString(),
    },
  });
}

async function handleExecuteWorkflow(
  n8nService: any,
  workflowId: string,
  inputData: Record<string, any> | undefined,
  startTime: number
) {
  const execution = await n8nService.executeWorkflow(workflowId, inputData);
  const processingTime = Date.now() - startTime;

  return NextResponse.json({
    success: execution.status !== "error",
    data: {
      execution,
      processing_time_ms: processingTime,
    },
    meta: {
      action: "execute_workflow",
      workflow_id: workflowId,
      execution_id: execution.id,
      timestamp: new Date().toISOString(),
    },
  });
}

async function handleGetExecutions(
  n8nService: any,
  workflowId: string,
  limit: number,
  offset: number,
  startTime: number
) {
  const executions = await n8nService.getWorkflowExecutions(
    workflowId,
    limit,
    offset
  );
  const processingTime = Date.now() - startTime;

  return NextResponse.json({
    success: true,
    data: {
      executions,
      count: executions.length,
      limit,
      offset,
      processing_time_ms: processingTime,
    },
    meta: {
      action: "get_executions",
      workflow_id: workflowId,
      timestamp: new Date().toISOString(),
    },
  });
}

async function handleGetMetrics(
  n8nService: any,
  workflowId: string,
  startTime: number
) {
  const metrics = await n8nService.getWorkflowMetrics(workflowId);
  const processingTime = Date.now() - startTime;

  return NextResponse.json({
    success: true,
    data: {
      metrics,
      processing_time_ms: processingTime,
    },
    meta: {
      action: "get_metrics",
      workflow_id: workflowId,
      timestamp: new Date().toISOString(),
    },
  });
}

async function handleGetPredictiveInsights(
  n8nService: any,
  workflowId: string,
  startTime: number
) {
  const insights = await n8nService.generatePredictiveInsights(workflowId);
  const processingTime = Date.now() - startTime;

  return NextResponse.json({
    success: true,
    data: {
      insights,
      count: insights.length,
      processing_time_ms: processingTime,
    },
    meta: {
      action: "get_predictive_insights",
      workflow_id: workflowId,
      timestamp: new Date().toISOString(),
    },
  });
}

async function handleSetWorkflowStatus(
  n8nService: any,
  workflowId: string,
  active: boolean,
  startTime: number
) {
  const success = await n8nService.setWorkflowStatus(workflowId, active);
  const processingTime = Date.now() - startTime;

  return NextResponse.json({
    success,
    data: {
      workflow_id: workflowId,
      new_status: active ? "active" : "inactive",
      processing_time_ms: processingTime,
    },
    meta: {
      action: "set_workflow_status",
      workflow_id: workflowId,
      timestamp: new Date().toISOString(),
    },
  });
}

async function handleGetDashboardData(n8nService: any, startTime: number) {
  const dashboardData = await n8nService.getWorkflowDashboardData();
  const processingTime = Date.now() - startTime;

  return NextResponse.json({
    success: true,
    data: {
      ...dashboardData,
      processing_time_ms: processingTime,
    },
    meta: {
      action: "get_dashboard_data",
      timestamp: new Date().toISOString(),
    },
  });
}
