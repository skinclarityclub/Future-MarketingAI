/**
 * Shopify Webhook Endpoint
 * Handles real-time updates from Shopify platform
 */

import { NextRequest, NextResponse } from "next/server";
import { webhookProcessor } from "@/lib/webhooks/webhook-handlers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-shopify-hmac-sha256") || "";
    const topic = request.headers.get("x-shopify-topic") || "";

    console.log("Received Shopify webhook:", {
      topic,
      hasSignature: !!signature,
    });

    // Validate webhook signature
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET || "";
    if (!secret) {
      console.error("SHOPIFY_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const isValidSignature = webhookProcessor.validateSignature(
      body,
      signature,
      secret,
      "shopify"
    );

    if (!isValidSignature) {
      console.error("Invalid Shopify webhook signature");
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    // Parse webhook data
    const data = JSON.parse(body);

    // Process webhook
    const result = await webhookProcessor.processWebhook(
      "shopify",
      topic,
      data,
      request.headers.get("x-shopify-webhook-id") || "",
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
    console.error("Error processing Shopify webhook:", error);
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
    message: "Shopify webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}

// Supported Shopify webhook topics:
// - customers/create: New customer registration
// - customers/update: Customer profile updates
// - customers/delete: Customer account deletion
// - orders/create: New order placed
// - orders/updated: Order status changes
// - orders/cancelled: Order cancellation
// - orders/fulfilled: Order fulfillment
// - checkouts/create: Checkout initiated
// - checkouts/update: Checkout modifications
