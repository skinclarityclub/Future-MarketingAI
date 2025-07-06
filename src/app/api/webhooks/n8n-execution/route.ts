import { NextRequest, NextResponse } from "next/server";
import { N8NWebhookCollector } from "@/lib/marketing/n8n-webhook-collector";

export async function POST(request: NextRequest) {
  try {
    const webhookData = await request.json();
    console.log(
      "📥 Received N8N webhook:",
      JSON.stringify(webhookData, null, 2)
    );

    // Initialize the collector
    const collector = new N8NWebhookCollector();

    // Extract execution data from N8N webhook payload
    const executionData = {
      workflowId:
        webhookData.workflowId || webhookData.workflow_id || "unknown",
      workflowName:
        webhookData.workflowName || webhookData.workflow_name || "unknown",
      executionId:
        webhookData.executionId ||
        webhookData.execution_id ||
        `wh_${Date.now()}`,
      status: mapN8NStatus(webhookData.status || webhookData.executionStatus),
      startTime:
        webhookData.startTime ||
        webhookData.start_time ||
        new Date().toISOString(),
      endTime: webhookData.endTime || webhookData.end_time,
      duration: webhookData.duration || webhookData.duration_ms,
      inputData:
        webhookData.inputData || webhookData.input_data || webhookData.data,
      outputData:
        webhookData.outputData || webhookData.output_data || webhookData.result,
      errorMessage:
        webhookData.errorMessage ||
        webhookData.error_message ||
        webhookData.error,
      chatId: webhookData.chatId || webhookData.chat_id,
      contentStrategy:
        webhookData.contentStrategy || webhookData.content_strategy,
      priority: webhookData.priority,
    };

    // Store the execution data
    await collector.storeExecution(executionData);

    return NextResponse.json({
      success: true,
      message: "Execution data stored successfully",
      executionId: executionData.executionId,
    });
  } catch (error) {
    console.error("❌ Error processing N8N webhook:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Health check endpoint
  return NextResponse.json({
    success: true,
    message: "N8N webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}

/**
 * Map N8N status values to our standardized status
 */
function mapN8NStatus(
  n8nStatus: string
): "success" | "error" | "running" | "waiting" {
  if (!n8nStatus) return "waiting";

  const status = n8nStatus.toLowerCase();

  switch (status) {
    case "success":
    case "completed":
    case "finished":
      return "success";

    case "error":
    case "failed":
    case "crashed":
      return "error";

    case "running":
    case "executing":
    case "active":
      return "running";

    case "waiting":
    case "new":
    case "pending":
    default:
      return "waiting";
  }
}
