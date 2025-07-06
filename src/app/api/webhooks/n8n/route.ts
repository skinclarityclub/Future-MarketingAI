/**
 * n8n Webhook API Endpoint
 * Task 33.1: Setup Webhook Orchestration
 * Handles incoming webhooks from n8n workflows
 */

import { NextRequest, NextResponse } from "next/server";
import { createN8nWebhookOrchestrator } from "@/lib/webhooks/n8n-webhook-orchestrator";
import { createN8nWorkflowService } from "@/lib/marketing/n8n-workflow-service";

// Initialize services
const n8nService = createN8nWorkflowService();
const webhookOrchestrator = createN8nWebhookOrchestrator(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  n8nService
);

/**
 * Handle incoming webhooks from n8n
 */
export async function POST(request: NextRequest) {
  try {
    // Validate webhook signature if configured
    const signature = request.headers.get("x-n8n-signature");
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const isValid = await validateWebhookSignature(
        await request.clone().text(),
        signature,
        webhookSecret
      );

      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid webhook signature" },
          { status: 401 }
        );
      }
    }

    // Process the webhook
    const response = await webhookOrchestrator.handleN8nWebhook(request);

    return response;
  } catch (error) {
    console.error("Error in n8n webhook endpoint:", error);
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
 * Handle webhook registration requests
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, url, method, security, triggers, errorHandling } = body;

    if (!name || !url) {
      return NextResponse.json(
        { error: "Missing required fields: name, url" },
        { status: 400 }
      );
    }

    const endpointId = await webhookOrchestrator.registerWebhookEndpoint({
      name,
      url,
      method: method || "POST",
      isActive: true,
      security: security || { authentication: "none" },
      triggers: triggers || [],
      responseMapping: {},
      errorHandling: errorHandling || {
        retryAttempts: 3,
        retryDelay: 1000,
        fallbackAction: "log",
      },
    });

    return NextResponse.json({
      success: true,
      endpointId,
      message: "Webhook endpoint registered successfully",
    });
  } catch (error) {
    console.error("Error registering webhook endpoint:", error);
    return NextResponse.json(
      {
        error: "Failed to register webhook endpoint",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Get webhook orchestration status
 */
export async function GET() {
  try {
    const status = await webhookOrchestrator.getOrchestrationStatus();

    return NextResponse.json({
      success: true,
      status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error getting orchestration status:", error);
    return NextResponse.json(
      {
        error: "Failed to get orchestration status",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Send webhook to n8n workflow
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowId, data, triggerType } = body;

    if (!workflowId || !data) {
      return NextResponse.json(
        { error: "Missing required fields: workflowId, data" },
        { status: 400 }
      );
    }

    const success = await webhookOrchestrator.sendWebhookToN8n(
      workflowId,
      data,
      triggerType
    );

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Webhook sent to n8n workflow successfully",
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send webhook to n8n workflow" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending webhook to n8n:", error);
    return NextResponse.json(
      {
        error: "Failed to send webhook to n8n",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Validate webhook signature using HMAC
 */
async function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const crypto = await import("crypto");
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(payload);
    const expectedSignature = `sha256=${hmac.digest("hex")}`;

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error("Error validating webhook signature:", error);
    return false;
  }
}
