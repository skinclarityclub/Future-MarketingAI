/**
 * Meta (Facebook/Instagram) Webhook Endpoint
 * Handles real-time updates from Facebook and Instagram platforms
 */

import { NextRequest, NextResponse } from "next/server";
import { webhookProcessor } from "@/lib/webhooks/webhook-handlers";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Get request body and headers
    const body = await request.text();
    const headersList = await headers();

    const signature = headersList.get("x-hub-signature-256") || "";
    const userAgent = headersList.get("user-agent") || "";

    // Parse webhook data
    let webhookData;
    try {
      webhookData = JSON.parse(body);
    } catch (parseError) {
      console.error("Error parsing Meta webhook data:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // Determine platform from webhook data or user agent
    let platform: "facebook" | "instagram" = "facebook";
    if (userAgent.includes("Instagram") || webhookData.object === "instagram") {
      platform = "instagram";
    }

    // Verify webhook signature for security
    const isValidSignature = webhookProcessor.verifyWebhookSignature(
      platform,
      body,
      signature
    );

    if (!isValidSignature) {
      console.error(`Invalid ${platform} webhook signature`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Process each entry in the webhook
    const results = [];
    const entries = webhookData.entry || [webhookData];

    for (const entry of entries) {
      const changes = entry.changes || [];

      for (const change of changes) {
        const eventType = change.field || webhookData.object || "user";
        const payload = {
          ...change.value,
          entry_id: entry.id,
          timestamp: entry.time,
        };

        const result = await webhookProcessor.processWebhook(
          platform,
          eventType,
          payload,
          entry.id
        );
        results.push(result);
      }
    }

    // Check if all results were successful
    const allSuccessful = results.every(r => r.success);
    const messages = results.map(r => r.message);

    if (allSuccessful) {
      console.log(`Meta ${platform} webhook processed successfully`);
      return NextResponse.json(
        {
          success: true,
          message: "All events processed successfully",
          results: messages,
        },
        { status: 200 }
      );
    } else {
      console.error(`Some Meta ${platform} webhook events failed processing`);
      return NextResponse.json(
        {
          success: false,
          message: "Some events failed processing",
          results: messages,
        },
        { status: 207 } // Multi-status
      );
    }
  } catch (error) {
    console.error("Error in Meta webhook endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle webhook verification requests from Meta
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Meta webhook verification
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

    if (mode === "subscribe" && token === verifyToken) {
      console.log("Meta webhook verified successfully");
      return new NextResponse(challenge, { status: 200 });
    } else {
      console.error("Meta webhook verification failed");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } catch (error) {
    console.error("Error in Meta webhook verification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Supported Meta webhook events:
// Facebook:
// - user: User profile changes
// - page: Page updates
// - permissions: Permission changes
// - feed: Page feed updates
// - mention: Page mentions
// - messaging_postbacks: Messenger interactions
//
// Instagram:
// - user: User profile changes
// - media: Media posts
// - story_insights: Story metrics
// - mentions: User mentions
// - comments: Comment interactions
