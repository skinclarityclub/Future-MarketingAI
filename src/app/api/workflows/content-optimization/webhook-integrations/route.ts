import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    // Validate required fields
    if (!body.event || !body.content_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: event, content_id",
        },
        { status: 400 }
      );
    }

    const {
      event,
      content_id,
      content_title,
      suggestions,
      distribution_type,
      timestamp,
      summary,
    } = body;

    // Define webhook URLs for external integrations
    const webhookConfigs = [
      {
        name: "ClickUp Content Optimization",
        url: process.env.CLICKUP_WEBHOOK_URL,
        enabled: !!process.env.CLICKUP_WEBHOOK_URL,
        payload: {
          event: "content_optimization_suggestions",
          data: {
            content_id,
            content_title: content_title || "Content Optimization",
            suggestions_count: summary?.total_suggestions || 0,
            critical_count: summary?.critical_count || 0,
            high_count: summary?.high_count || 0,
            distribution_type,
            estimated_impact: summary?.estimated_impact || {
              engagement: 0,
              reach: 0,
              roi: 0,
            },
            dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL}/[locale]/content-optimization?content_id=${content_id}`,
            timestamp: timestamp || new Date().toISOString(),
          },
        },
      },
      {
        name: "Slack Incoming Webhook",
        url: process.env.SLACK_WEBHOOK_URL,
        enabled: !!process.env.SLACK_WEBHOOK_URL,
        payload: {
          text: `🎯 Content Optimization Alert: ${content_title || "Content"}`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Content:* ${content_title || "Content Optimization"}\n*Suggestions:* ${summary?.total_suggestions || 0}\n*Critical:* ${summary?.critical_count || 0} | *High Priority:* ${summary?.high_count || 0}`,
              },
            },
            {
              type: "actions",
              elements: [
                {
                  type: "button",
                  text: {
                    type: "plain_text",
                    text: "View Dashboard",
                  },
                  url: `${process.env.NEXT_PUBLIC_APP_URL}/[locale]/content-optimization?content_id=${content_id}`,
                },
              ],
            },
          ],
        },
      },
      {
        name: "Zapier Integration",
        url: process.env.ZAPIER_WEBHOOK_URL,
        enabled: !!process.env.ZAPIER_WEBHOOK_URL,
        payload: {
          trigger: "content_optimization_suggestions",
          content_id,
          content_title,
          suggestions,
          summary,
          timestamp: timestamp || new Date().toISOString(),
        },
      },
      {
        name: "Discord Webhook",
        url: process.env.DISCORD_WEBHOOK_URL,
        enabled: !!process.env.DISCORD_WEBHOOK_URL,
        payload: {
          embeds: [
            {
              title: "🎯 Content Optimization Suggestions",
              description: `New optimization suggestions available for "${content_title || "content"}"`,
              color:
                distribution_type === "urgent"
                  ? 0xff0000
                  : distribution_type === "priority"
                    ? 0xff9900
                    : 0x0099ff,
              fields: [
                {
                  name: "Total Suggestions",
                  value: (summary?.total_suggestions || 0).toString(),
                  inline: true,
                },
                {
                  name: "Critical Issues",
                  value: (summary?.critical_count || 0).toString(),
                  inline: true,
                },
                {
                  name: "High Priority",
                  value: (summary?.high_count || 0).toString(),
                  inline: true,
                },
              ],
              timestamp: timestamp || new Date().toISOString(),
            },
          ],
        },
      },
    ];

    // Send to enabled webhooks
    const webhookResults = [];
    const webhookPromises = webhookConfigs
      .filter(config => config.enabled)
      .map(async config => {
        try {
          const response = await fetch(config.url!, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent": "SKC-BI-Dashboard/1.0",
            },
            body: JSON.stringify(config.payload),
            signal: AbortSignal.timeout(10000), // 10 second timeout
          });

          const result = {
            webhook: config.name,
            url: config.url,
            status: response.ok ? "success" : "failed",
            statusCode: response.status,
            statusText: response.statusText,
            sentAt: new Date().toISOString(),
          };

          webhookResults.push(result);
          return result;
        } catch (error) {
          const result = {
            webhook: config.name,
            url: config.url,
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
            sentAt: new Date().toISOString(),
          };

          webhookResults.push(result);
          return result;
        }
      });

    // Wait for all webhook requests to complete
    await Promise.allSettled(webhookPromises);

    // Log webhook integration activity
    const integrationId = `integration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await supabase.from("webhook_integration_logs").insert({
      id: integrationId,
      event_type: event,
      content_id,
      content_title: content_title || "Content Optimization",
      webhooks_sent: webhookResults.filter(r => r.status === "success").length,
      webhooks_failed: webhookResults.filter(r => r.status !== "success")
        .length,
      webhook_results: webhookResults,
      distribution_type,
      created_at: new Date().toISOString(),
    });

    const successfulWebhooks = webhookResults.filter(
      r => r.status === "success"
    ).length;
    const totalWebhooks = webhookResults.length;

    return NextResponse.json({
      success: totalWebhooks === 0 || successfulWebhooks > 0,
      integration_id: integrationId,
      message:
        totalWebhooks === 0
          ? "No webhook integrations configured"
          : `Webhook integrations completed: ${successfulWebhooks}/${totalWebhooks} successful`,
      webhooks_summary: {
        total_webhooks: totalWebhooks,
        successful: successfulWebhooks,
        failed: totalWebhooks - successfulWebhooks,
        webhooks_sent: webhookResults
          .filter(r => r.status === "success")
          .map(r => r.webhook),
        webhooks_failed: webhookResults
          .filter(r => r.status !== "success")
          .map(r => r.webhook),
      },
      webhook_details: webhookResults,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Webhook integrations error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process webhook integrations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
