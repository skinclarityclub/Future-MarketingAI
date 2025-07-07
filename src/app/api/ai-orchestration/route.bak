/**
 * AI Orchestration API Route
 * Task 80.6: Connect and Orchestrate AI Assistants
 *
 * HTTP API endpoints for AI orchestration and workflow management
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAIOrchestrator,
  orchestrateAIRequest,
  type AIAssistantType,
  type AssistantRequest,
} from "@/lib/ai-configuration/ai-orchestrator";
import {
  getAIWorkflowOrchestrator,
  executeAIWorkflow,
  AI_WORKFLOWS,
} from "@/lib/workflows/ai-workflow-orchestrator";

// Handle GET requests - Status and configuration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    const orchestrator = getAIOrchestrator();
    const workflowOrchestrator = getAIWorkflowOrchestrator();

    switch (action) {
      case "status":
        const status = await orchestrator.getStatus();
        const workflowStatus = {
          availableWorkflows: Object.keys(AI_WORKFLOWS).length,
          activeExecutions: workflowOrchestrator.getActiveExecutions().length,
          workflows: workflowOrchestrator.listWorkflows().map(w => ({
            id: w.id,
            name: w.name,
            category: w.category,
            steps: w.steps.length,
          })),
        };

        return NextResponse.json({
          success: true,
          data: {
            orchestrator: status,
            workflows: workflowStatus,
            timestamp: new Date().toISOString(),
          },
        });

      case "config":
        const config = orchestrator.getConfig();
        return NextResponse.json({
          success: true,
          data: { config },
        });

      case "workflows":
        const workflows = workflowOrchestrator.listWorkflows();
        return NextResponse.json({
          success: true,
          data: { workflows },
        });

      case "executions":
        const executions = workflowOrchestrator.getActiveExecutions();
        return NextResponse.json({
          success: true,
          data: { executions },
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            message: "AI Orchestration API is running",
            endpoints: {
              status: "/api/ai-orchestration?action=status",
              config: "/api/ai-orchestration?action=config",
              workflows: "/api/ai-orchestration?action=workflows",
              executions: "/api/ai-orchestration?action=executions",
              orchestrate: "POST /api/ai-orchestration",
              execute: "POST /api/ai-orchestration with action=execute",
            },
          },
        });
    }
  } catch (error) {
    console.error("AI Orchestration API GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Handle POST requests - Execute orchestration and workflows
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case "orchestrate":
        return await handleOrchestrate(data);

      case "execute":
        return await handleExecuteWorkflow(data);

      case "test":
        return await handleTestAssistant(data);

      default:
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid action. Supported actions: orchestrate, execute, test",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("AI Orchestration API POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Handle AI request orchestration
async function handleOrchestrate(data: {
  query: string;
  assistantType?: AIAssistantType;
  context?: any;
  priority?: "low" | "medium" | "high" | "critical";
  sessionId: string;
  userId: string;
}) {
  const { query, assistantType, context, priority, sessionId, userId } = data;

  if (!query || !sessionId || !userId) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing required fields: query, sessionId, userId",
      },
      { status: 400 }
    );
  }

  try {
    const response = await orchestrateAIRequest(query, {
      type: assistantType,
      context,
      priority: priority || "medium",
      sessionId,
      userId,
    });

    return NextResponse.json({
      success: true,
      data: {
        response,
        metadata: {
          timestamp: new Date().toISOString(),
          processingTime: response.orchestrationMetrics.totalProcessingTime,
          assistantsUsed: response.orchestrationMetrics.assistantsInvolved,
          qualityScore: response.orchestrationMetrics.qualityScore,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Orchestration failed",
      },
      { status: 500 }
    );
  }
}

// Handle workflow execution
async function handleExecuteWorkflow(data: {
  workflowId: string;
  userId: string;
  sessionId: string;
  variables?: Record<string, any>;
}) {
  const { workflowId, userId, sessionId, variables } = data;

  if (!workflowId || !userId || !sessionId) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing required fields: workflowId, userId, sessionId",
      },
      { status: 400 }
    );
  }

  try {
    const workflowOrchestrator = getAIWorkflowOrchestrator();

    // Check if workflow exists
    const workflow = workflowOrchestrator.getWorkflow(workflowId);
    if (!workflow) {
      return NextResponse.json(
        {
          success: false,
          error: `Workflow not found: ${workflowId}`,
        },
        { status: 404 }
      );
    }

    const execution = await workflowOrchestrator.executeWorkflow(workflowId, {
      userId,
      sessionId,
      triggerType: "manual",
      variables,
    });

    return NextResponse.json({
      success: true,
      data: {
        execution: {
          id: execution.executionId,
          workflowId: execution.workflowId,
          status: execution.status,
          startTime: execution.startTime,
          currentStep: execution.currentStep,
        },
        workflow: {
          id: workflow.id,
          name: workflow.name,
          steps: workflow.steps.length,
          category: workflow.category,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Workflow execution failed",
      },
      { status: 500 }
    );
  }
}

// Handle assistant testing
async function handleTestAssistant(data: {
  assistantType: AIAssistantType;
  query: string;
  sessionId: string;
  userId: string;
}) {
  const { assistantType, query, sessionId, userId } = data;

  if (!assistantType || !query || !sessionId || !userId) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Missing required fields: assistantType, query, sessionId, userId",
      },
      { status: 400 }
    );
  }

  try {
    const orchestrator = getAIOrchestrator();

    const request: AssistantRequest = {
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: assistantType,
      query,
      context: { isTest: true },
      priority: "medium",
      sessionId,
      userId,
      timestamp: new Date(),
      metadata: { testMode: true },
    };

    const response = await orchestrator.orchestrateRequest(request);

    return NextResponse.json({
      success: true,
      data: {
        test: {
          assistantType,
          query,
          response: response.primaryResponse,
          metrics: response.orchestrationMetrics,
          recommendations: response.recommendations,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          testId: request.id,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Assistant test failed",
      },
      { status: 500 }
    );
  }
}

// Handle PUT requests - Update configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing config data",
        },
        { status: 400 }
      );
    }

    const orchestrator = getAIOrchestrator();
    orchestrator.updateConfig(config);

    return NextResponse.json({
      success: true,
      data: {
        message: "Configuration updated successfully",
        newConfig: orchestrator.getConfig(),
      },
    });
  } catch (error) {
    console.error("AI Orchestration API PUT error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Configuration update failed",
      },
      { status: 500 }
    );
  }
}

// Handle DELETE requests - Cancel workflows
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const executionId = searchParams.get("executionId");

    if (!executionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing executionId parameter",
        },
        { status: 400 }
      );
    }

    const workflowOrchestrator = getAIWorkflowOrchestrator();
    await workflowOrchestrator.cancelWorkflow(executionId);

    return NextResponse.json({
      success: true,
      data: {
        message: `Workflow execution ${executionId} cancelled successfully`,
      },
    });
  } catch (error) {
    console.error("AI Orchestration API DELETE error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Workflow cancellation failed",
      },
      { status: 500 }
    );
  }
}
