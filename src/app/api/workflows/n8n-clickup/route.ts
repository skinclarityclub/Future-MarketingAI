/**
 * n8n ClickUp Workflow Integration API
 * Comprehensive API for managing n8n workflows integrated with ClickUp
 */

import { NextRequest, NextResponse } from "next/server";
import { N8nClickUpIntegrationService } from "@/lib/workflows/n8n-clickup-integration";

const workflowService = new N8nClickUpIntegrationService();

/**
 * GET /api/workflows/n8n-clickup
 * Fetch workflows and executions with filtering options
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "workflows";
    const workflowId = searchParams.get("workflow_id");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    switch (action) {
      case "workflows":
        const workflows = await workflowService.getWorkflows({
          status: status || undefined,
          type: type || undefined,
          limit,
          offset,
        });
        return NextResponse.json({
          success: true,
          data: workflows,
          pagination: { limit, offset },
        });

      case "executions":
        if (!workflowId) {
          return NextResponse.json(
            { success: false, error: "Workflow ID is required for executions" },
            { status: 400 }
          );
        }
        const executions = await workflowService.getWorkflowExecutions(
          workflowId,
          {
            status: status || undefined,
            limit,
            offset,
          }
        );
        return NextResponse.json({
          success: true,
          data: executions,
          pagination: { limit, offset },
        });

      case "analytics":
        const days = parseInt(searchParams.get("days") || "7");
        const analytics = await workflowService.getIntegrationAnalytics(days);
        return NextResponse.json({ success: true, data: analytics });

      case "health":
        const health = await workflowService.getSystemHealth();
        return NextResponse.json({ success: true, data: health });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in n8n workflow GET endpoint:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch workflow data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflows/n8n-clickup
 * Create new workflows, execute workflows, or trigger actions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "create_workflow";

    switch (action) {
      case "create_workflow":
        const {
          n8n_workflow_id,
          workflow_name,
          workflow_description,
          workflow_type,
          workflow_config,
          clickup_integration_config,
          trigger_conditions,
          created_by,
        } = body;

        if (!n8n_workflow_id || !workflow_name || !workflow_type) {
          return NextResponse.json(
            { success: false, error: "Missing required workflow fields" },
            { status: 400 }
          );
        }

        const newWorkflow = await workflowService.createWorkflow({
          n8n_workflow_id,
          workflow_name,
          workflow_description,
          workflow_type,
          workflow_config,
          clickup_integration_config,
          trigger_conditions,
          created_by,
        });

        return NextResponse.json({
          success: true,
          data: newWorkflow,
          message: "Workflow created successfully",
        });

      case "execute_workflow":
        const { workflow_id, execution_mode, input_data, trigger_source } =
          body;

        if (!workflow_id) {
          return NextResponse.json(
            { success: false, error: "Workflow ID is required" },
            { status: 400 }
          );
        }

        const execution = await workflowService.executeWorkflow(workflow_id, {
          execution_mode: execution_mode || "manual",
          input_data,
          trigger_source: trigger_source || "api_call",
        });

        return NextResponse.json({
          success: true,
          data: execution,
          message: "Workflow execution started",
        });

      case "webhook_trigger":
        const { webhook_data, workflow_webhook_id } = body;

        if (!workflow_webhook_id) {
          return NextResponse.json(
            { success: false, error: "Webhook workflow ID is required" },
            { status: 400 }
          );
        }

        const webhookExecution = await workflowService.handleWebhookTrigger(
          workflow_webhook_id,
          webhook_data
        );

        return NextResponse.json({
          success: true,
          data: webhookExecution,
          message: "Webhook processed successfully",
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in n8n workflow POST endpoint:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process workflow request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/workflows/n8n-clickup
 * Update existing workflows
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "update_workflow";
    const workflowId = searchParams.get("workflow_id");

    switch (action) {
      case "update_workflow":
        if (!workflowId) {
          return NextResponse.json(
            { success: false, error: "Workflow ID is required" },
            { status: 400 }
          );
        }

        const updatedWorkflow = await workflowService.updateWorkflow(
          workflowId,
          body
        );
        return NextResponse.json({
          success: true,
          data: updatedWorkflow,
          message: "Workflow updated successfully",
        });

      case "update_status":
        if (!workflowId) {
          return NextResponse.json(
            { success: false, error: "Workflow ID is required" },
            { status: 400 }
          );
        }

        const { status } = body;
        if (!status) {
          return NextResponse.json(
            { success: false, error: "Status is required" },
            { status: 400 }
          );
        }

        const statusUpdate = await workflowService.updateWorkflowStatus(
          workflowId,
          status
        );
        return NextResponse.json({
          success: true,
          data: statusUpdate,
          message: `Workflow status updated to ${status}`,
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in n8n workflow PUT endpoint:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update workflow data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workflows/n8n-clickup
 * Delete workflows
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "delete_workflow";
    const workflowId = searchParams.get("workflow_id");

    switch (action) {
      case "delete_workflow":
        if (!workflowId) {
          return NextResponse.json(
            { success: false, error: "Workflow ID is required" },
            { status: 400 }
          );
        }

        await workflowService.deleteWorkflow(workflowId);
        return NextResponse.json({
          success: true,
          message: "Workflow deleted successfully",
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in n8n workflow DELETE endpoint:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete workflow data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
