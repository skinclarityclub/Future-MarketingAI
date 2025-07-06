/**
 * Kajabi Webhook Endpoint
 * Handles real-time updates from Kajabi platform
 */

import { NextRequest, NextResponse } from "next/server";
import { webhookProcessor } from "@/lib/webhooks/webhook-handlers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-kajabi-signature") || "";
    const eventType = request.headers.get("x-kajabi-event-type") || "";

    console.log("Received Kajabi webhook:", {
      eventType,
      hasSignature: !!signature,
    });

    // Validate webhook signature
    const secret = process.env.KAJABI_WEBHOOK_SECRET || "";
    if (!secret) {
      console.error("KAJABI_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const isValidSignature = webhookProcessor.validateSignature(
      body,
      signature,
      secret,
      "kajabi"
    );

    if (!isValidSignature) {
      console.error("Invalid Kajabi webhook signature");
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    // Parse webhook data
    const data = JSON.parse(body);

    // Process webhook
    const result = await webhookProcessor.processWebhook(
      "kajabi",
      eventType,
      data,
      request.headers.get("x-kajabi-webhook-id") || "",
      false
    );

    if (!result.success) {
      console.error("Webhook processing failed:", result.message);
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error processing Kajabi webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Health check for webhook endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Kajabi webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}

// Supported Kajabi webhook events:
// - person.created: New person (customer) created
// - person.updated: Person profile updated
// - person.deleted: Person account deleted
// - purchase.created: New purchase made
// - purchase.updated: Purchase status updated
// - purchase.refunded: Purchase refunded
// - subscription.created: New subscription started
// - subscription.updated: Subscription modified
// - subscription.cancelled: Subscription cancelled
