import { NextRequest, NextResponse } from "next/server";
import { TelegramApiClient } from "@/lib/telegram/api-client";
import { getBotConfig } from "@/lib/telegram/bot-config";

interface AlertmanagerWebhook {
  version: string;
  groupKey: string;
  status: "firing" | "resolved";
  receiver: string;
  groupLabels: Record<string, string>;
  commonLabels: Record<string, string>;
  commonAnnotations: Record<string, string>;
  externalURL: string;
  alerts: Array<{
    status: "firing" | "resolved";
    labels: Record<string, string>;
    annotations: Record<string, string>;
    startsAt: string;
    endsAt?: string;
    generatorURL: string;
  }>;
}

const TELEGRAM_CHANNELS = {
  critical: process.env.TELEGRAM_CRITICAL_CHAT_ID || "-1001234567890",
  warning: process.env.TELEGRAM_WARNING_CHAT_ID || "-1001234567891",
  info: process.env.TELEGRAM_INFO_CHAT_ID || "-1001234567892",
  sla: process.env.TELEGRAM_SLA_CHAT_ID || "-1001234567893",
};

export async function POST(request: NextRequest) {
  try {
    const webhook: AlertmanagerWebhook = await request.json();

    // Initialize Telegram API client
    const config = getBotConfig();
    const telegramClient = new TelegramApiClient(config);

    // Format alert message
    const message = formatAlertMessage(webhook);

    // Determine target channel based on severity
    const chatId = determineChatId(webhook);

    // Send message to Telegram
    await telegramClient.sendMessage(chatId, message, {
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    });

    return NextResponse.json({
      success: true,
      message: "Alert sent to Telegram",
      chatId,
      alertCount: webhook.alerts.length,
    });
  } catch (error: any) {
    console.error("Failed to send alert to Telegram:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

function formatAlertMessage(webhook: AlertmanagerWebhook): string {
  const { status, groupLabels, commonAnnotations, alerts } = webhook;

  const statusEmoji = status === "firing" ? "🔥" : "✅";
  const severityEmoji = getSeverityEmoji(groupLabels.severity);

  let message = `${statusEmoji} **ALERT ${status.toUpperCase()}** ${severityEmoji}\n\n`;

  // Service and basic info
  message += `**Service:** ${groupLabels.service || "Unknown"}\n`;
  message += `**Environment:** ${groupLabels.environment || "production"}\n`;
  message += `**Severity:** ${groupLabels.severity || "unknown"}\n\n`;

  // Alert details
  alerts.forEach((alert, index) => {
    if (index > 0) message += "\n---\n\n";

    message += `**Alert:** ${alert.annotations.summary || "No summary"}\n`;
    message += `**Description:** ${alert.annotations.description || "No description"}\n`;

    if (alert.labels.instance) {
      message += `**Instance:** ${alert.labels.instance}\n`;
    }

    message += `**Started:** ${new Date(alert.startsAt).toLocaleString(
      "nl-NL",
      {
        timeZone: "Europe/Amsterdam",
      }
    )}\n`;

    if (alert.endsAt && status === "resolved") {
      message += `**Ended:** ${new Date(alert.endsAt).toLocaleString("nl-NL", {
        timeZone: "Europe/Amsterdam",
      })}\n`;
    }

    if (alert.annotations.runbook_url) {
      message += `[📖 Runbook](${alert.annotations.runbook_url})\n`;
    }
  });

  // Dashboard links
  message += "\n**Dashboard Links:**\n";
  message += "• [🎯 SKC Dashboard](http://localhost:3000)\n";
  message += "• [📊 Grafana](http://grafana.localhost:3000)\n";
  message += "• [🔍 Prometheus](http://prometheus.localhost:9090)\n";
  message += "• [🚨 Alertmanager](http://alertmanager.localhost:9093)\n";

  // Add actionable buttons for critical alerts
  if (groupLabels.severity === "critical" && status === "firing") {
    message += "\n**⚡ IMMEDIATE ACTION REQUIRED**\n";
    message += "This alert may impact our 99.99% SLA commitment.\n";
  }

  return message;
}

function getSeverityEmoji(severity?: string): string {
  switch (severity?.toLowerCase()) {
    case "critical":
      return "🚨";
    case "high":
      return "⚠️";
    case "warning":
      return "⚠️";
    case "info":
      return "ℹ️";
    default:
      return "📋";
  }
}

function determineChatId(webhook: AlertmanagerWebhook): string {
  const severity = webhook.groupLabels.severity?.toLowerCase();
  const alertname = webhook.groupLabels.alertname?.toLowerCase();

  // SLA breach alerts go to dedicated SLA channel
  if (
    alertname?.includes("sla") ||
    webhook.commonLabels.sla_impact === "true"
  ) {
    return TELEGRAM_CHANNELS.sla;
  }

  // Route based on severity
  switch (severity) {
    case "critical":
    case "sla-breach":
      return TELEGRAM_CHANNELS.critical;
    case "warning":
    case "high":
      return TELEGRAM_CHANNELS.warning;
    case "info":
    case "low":
      return TELEGRAM_CHANNELS.info;
    default:
      return TELEGRAM_CHANNELS.warning;
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "telegram-alerts-webhook",
    timestamp: new Date().toISOString(),
  });
}
