import { NextRequest, NextResponse } from "next/server";
import {
  ClickUpWebhookService,
  ClickUpEventType,
} from "@/lib/webhooks/clickup-webhooks";

export const runtime = "nodejs";

// Initialize webhook service
const getWebhookService = () => {
  const apiKey = process.env.CLICKUP_API_KEY;
  if (!apiKey) {
    throw new Error("CLICKUP_API_KEY is not configured");
  }
  return new ClickUpWebhookService(apiKey);
};

/**
 * POST: Setup ClickUp webhooks for content workflow
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { team_id, space_id, list_id, force_recreate = false } = body;

    if (!team_id) {
      return NextResponse.json(
        { error: "team_id is required" },
        { status: 400 }
      );
    }

    const webhookService = getWebhookService();

    // Define the webhook endpoint URL
    const webhookEndpoint = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/clickup/webhooks`;

    // Define events we want to listen to for content workflow
    const contentWorkflowEvents = [
      ClickUpEventType.TASK_STATUS_UPDATED,
      ClickUpEventType.TASK_TAG_UPDATED,
      ClickUpEventType.TASK_UPDATED,
      ClickUpEventType.TASK_CREATED,
    ];

    // Check if webhook already exists
    const existingWebhooks = await webhookService.getWebhooks(team_id);
    const existingWebhook = existingWebhooks.find(
      webhook => webhook.endpoint === webhookEndpoint
    );

    if (existingWebhook && !force_recreate) {
      return NextResponse.json({
        success: true,
        message: "Webhook already exists",
        webhook: existingWebhook,
        action: "existing",
      });
    }

    // Remove existing webhook if force_recreate is true
    if (existingWebhook && force_recreate) {
      try {
        await webhookService.deleteWebhook(existingWebhook.id);
        console.log(`Deleted existing webhook ${existingWebhook.id}`);
      } catch (error) {
        console.warn(`Warning: Could not delete existing webhook:`, error);
      }
    }

    // Create webhook configuration
    const webhookConfig = {
      endpoint: webhookEndpoint,
      events: contentWorkflowEvents,
      ...(space_id && { space_id }),
      ...(list_id && { list_id }),
    };

    // Generate a secret for webhook verification
    const webhookSecret =
      process.env.CLICKUP_WEBHOOK_SECRET ||
      `clickup_webhook_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    // Register the webhook
    const webhook = await webhookService.registerWebhook(
      team_id,
      webhookEndpoint,
      contentWorkflowEvents,
      webhookSecret
    );

    console.log(`Successfully registered ClickUp webhook:`, {
      id: webhook.id,
      endpoint: webhook.endpoint,
      events: webhook.events,
      team_id: webhook.team_id,
    });

    return NextResponse.json({
      success: true,
      message: "Webhook registered successfully",
      webhook: {
        id: webhook.id,
        endpoint: webhook.endpoint,
        events: webhook.events,
        team_id: webhook.team_id,
        health: webhook.health,
      },
      action: force_recreate ? "recreated" : "created",
      configuration: {
        content_workflow_enabled: true,
        events_monitored: contentWorkflowEvents,
        auto_extraction: true,
        blotato_integration: !!process.env.BLOTATO_API_URL,
      },
    });
  } catch (error) {
    console.error("Error setting up webhook:", error);
    return NextResponse.json(
      {
        error: "Failed to setup webhook",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET: Get webhook setup status and configuration
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("team_id");

    if (!teamId) {
      return NextResponse.json(
        { error: "team_id is required" },
        { status: 400 }
      );
    }

    const webhookService = getWebhookService();
    const expectedEndpoint = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/clickup/webhooks`;

    // Get all webhooks for the team
    const webhooks = await webhookService.getWebhooks(teamId);
    const contentWebhook = webhooks.find(
      webhook => webhook.endpoint === expectedEndpoint
    );

    // Get webhook health if webhook exists
    let health = null;
    if (contentWebhook) {
      try {
        health = await webhookService.getWebhookHealth(contentWebhook.id);
      } catch (error) {
        console.warn("Could not get webhook health:", error);
      }
    }

    // Check environment configuration
    const configuration = {
      clickup_api_configured: !!process.env.CLICKUP_API_KEY,
      webhook_secret_configured: !!process.env.CLICKUP_WEBHOOK_SECRET,
      blotato_api_configured: !!(
        process.env.BLOTATO_API_URL && process.env.BLOTATO_API_KEY
      ),
      supabase_configured: !!(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.SUPABASE_SERVICE_ROLE_KEY
      ),
      site_url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    };

    return NextResponse.json({
      success: true,
      webhook_configured: !!contentWebhook,
      webhook: contentWebhook
        ? {
            id: contentWebhook.id,
            endpoint: contentWebhook.endpoint,
            events: contentWebhook.events,
            team_id: contentWebhook.team_id,
            health,
          }
        : null,
      total_webhooks: webhooks.length,
      all_webhooks: webhooks.map(w => ({
        id: w.id,
        endpoint: w.endpoint,
        events: w.events,
      })),
      configuration,
      ready_for_content_workflow: !!(
        contentWebhook &&
        configuration.clickup_api_configured &&
        configuration.supabase_configured
      ),
    });
  } catch (error) {
    console.error("Error getting webhook setup status:", error);
    return NextResponse.json(
      {
        error: "Failed to get webhook status",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Remove content workflow webhook
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("team_id");
    const webhookId = searchParams.get("webhook_id");

    if (!teamId && !webhookId) {
      return NextResponse.json(
        { error: "Either team_id or webhook_id is required" },
        { status: 400 }
      );
    }

    const webhookService = getWebhookService();
    const expectedEndpoint = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/clickup/webhooks`;

    let targetWebhookId = webhookId;

    // If only team_id provided, find the content workflow webhook
    if (!targetWebhookId && teamId) {
      const webhooks = await webhookService.getWebhooks(teamId);
      const contentWebhook = webhooks.find(
        webhook => webhook.endpoint === expectedEndpoint
      );

      if (!contentWebhook) {
        return NextResponse.json(
          { error: "No content workflow webhook found for this team" },
          { status: 404 }
        );
      }

      targetWebhookId = contentWebhook.id;
    }

    // Delete the webhook
    await webhookService.deleteWebhook(targetWebhookId!);

    console.log(`Successfully deleted ClickUp webhook ${targetWebhookId}`);

    return NextResponse.json({
      success: true,
      message: "Webhook deleted successfully",
      webhook_id: targetWebhookId,
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
 * PATCH: Update webhook configuration
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { webhook_id, events, status, endpoint } = body;

    if (!webhook_id) {
      return NextResponse.json(
        { error: "webhook_id is required" },
        { status: 400 }
      );
    }

    const webhookService = getWebhookService();

    // Update webhook
    const updatedWebhook = await webhookService.updateWebhook(
      webhook_id,
      endpoint,
      events,
      status
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
