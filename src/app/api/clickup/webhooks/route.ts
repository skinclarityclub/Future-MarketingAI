import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  ClickUpWebhookService,
  ClickUpWebhookEvent,
  ClickUpEventType,
} from "@/lib/webhooks/clickup-webhooks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Initialize webhook service
const getWebhookService = () => {
  const apiKey = process.env.CLICKUP_API_KEY;
  if (!apiKey) {
    throw new Error("CLICKUP_API_KEY is not configured");
  }
  return new ClickUpWebhookService(apiKey);
};

/**
 * POST: Handle incoming ClickUp webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();

    // Get webhook signature for verification
    const signature = headersList.get("x-signature");
    const webhookId = headersList.get("x-webhook-id");

    if (!body) {
      return NextResponse.json({ error: "No body provided" }, { status: 400 });
    }

    // Parse the webhook event
    let webhookEvent: ClickUpWebhookEvent;
    try {
      webhookEvent = JSON.parse(body);
    } catch (error) {
      console.error("Error parsing webhook body:", error);
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // Add webhook ID from header if not present in body
    if (webhookId && !webhookEvent.webhook_id) {
      webhookEvent.webhook_id = webhookId;
    }

    console.log(`Received ClickUp webhook event: ${webhookEvent.event}`, {
      taskId: webhookEvent.task_id,
      listId: webhookEvent.list_id,
      spaceId: webhookEvent.space_id,
      teamId: webhookEvent.team_id,
      webhookId: webhookEvent.webhook_id,
    });

    // Initialize webhook service
    const webhookService = getWebhookService();

    // Verify webhook signature if provided
    if (signature) {
      const isValid = webhookService.verifyWebhookSignature(
        body,
        signature,
        process.env.CLICKUP_WEBHOOK_SECRET || ""
      );
      if (!isValid) {
        console.warn("Invalid webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    // Process the webhook event asynchronously
    webhookService.processWebhookEvent(webhookEvent).catch(error => {
      console.error("Error processing webhook event:", error);
    });

    // Return success immediately (don't block ClickUp)
    return NextResponse.json(
      {
        success: true,
        message: "Webhook event received and queued for processing",
        event_type: webhookEvent.event,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error handling webhook:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET: Webhook management operations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const teamId = searchParams.get("team_id");
    const webhookId = searchParams.get("webhook_id");

    const webhookService = getWebhookService();

    switch (action) {
      case "list_webhooks":
        if (!teamId) {
          return NextResponse.json(
            { error: "team_id is required for list_webhooks" },
            { status: 400 }
          );
        }

        const webhooks = await webhookService.getWebhooks(teamId);
        return NextResponse.json({
          success: true,
          webhooks,
          count: webhooks.length,
        });

      case "webhook_health":
        if (!webhookId) {
          return NextResponse.json(
            { error: "webhook_id is required for webhook_health" },
            { status: 400 }
          );
        }

        const health = await webhookService.getWebhookHealth(webhookId);
        return NextResponse.json({
          success: true,
          webhook_id: webhookId,
          health,
        });

      case "event_logs":
        const limit = parseInt(searchParams.get("limit") || "50");
        const eventLogs = await webhookService.getWebhookEventLogs(
          webhookId || undefined,
          limit
        );

        return NextResponse.json({
          success: true,
          webhook_id: webhookId,
          event_logs: eventLogs,
          count: eventLogs.length,
        });

      case "endpoint_test":
        // Return a simple response to test if the endpoint is accessible
        return NextResponse.json({
          success: true,
          message: "ClickUp webhook endpoint is accessible",
          timestamp: new Date().toISOString(),
          endpoint_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/clickup/webhooks`,
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in webhook GET handler:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT: Update webhook configuration
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const webhookId = searchParams.get("webhook_id");

    if (!webhookId) {
      return NextResponse.json(
        { error: "webhook_id is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { endpoint, events, status, secret } = body;

    const webhookService = getWebhookService();

    const updatedWebhook = await webhookService.updateWebhook(
      webhookId,
      endpoint,
      events,
      status,
      secret
    );

    return NextResponse.json({
      success: true,
      message: "Webhook updated successfully",
      webhook: updatedWebhook,
    });
  } catch (error) {
    console.error("Error updating webhook:", error);
    return NextResponse.json(
      {
        error: "Failed to update webhook",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Remove webhook
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const webhookId = searchParams.get("webhook_id");

    if (!webhookId) {
      return NextResponse.json(
        { error: "webhook_id is required" },
        { status: 400 }
      );
    }

    const webhookService = getWebhookService();
    await webhookService.deleteWebhook(webhookId);

    return NextResponse.json({
      success: true,
      message: "Webhook deleted successfully",
      webhook_id: webhookId,
    });
  } catch (error) {
    console.error("Error deleting webhook:", error);
    return NextResponse.json(
      {
        error: "Failed to delete webhook",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Register new webhook
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { team_id, endpoint, events, secret } = body;

    if (!team_id || !endpoint || !events) {
      return NextResponse.json(
        { error: "team_id, endpoint, and events are required" },
        { status: 400 }
      );
    }

    // Validate events
    const validEvents = Object.values(ClickUpEventType);
    const invalidEvents = events.filter(
      (event: string) => !validEvents.includes(event as ClickUpEventType)
    );

    if (invalidEvents.length > 0) {
      return NextResponse.json(
        {
          error: "Invalid event types",
          invalid_events: invalidEvents,
          valid_events: validEvents,
        },
        { status: 400 }
      );
    }

    const webhookService = getWebhookService();

    const registration = await webhookService.registerWebhook(
      team_id,
      endpoint,
      events,
      secret
    );

    return NextResponse.json({
      success: true,
      message: "Webhook registered successfully",
      webhook: registration,
    });
  } catch (error) {
    console.error("Error registering webhook:", error);
    return NextResponse.json(
      {
        error: "Failed to register webhook",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
