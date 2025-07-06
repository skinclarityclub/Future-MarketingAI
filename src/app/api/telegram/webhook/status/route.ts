import { NextRequest, NextResponse } from "next/server";
import { getBotConfig } from "@/lib/telegram/bot-config";
import TelegramWebhookManager from "@/lib/telegram/webhook-config";

export async function GET(request: NextRequest) {
  try {
    // Check if this is an authenticated request (basic auth or API key)
    const authHeader = request.headers.get("authorization");
    const apiKey = request.headers.get("x-api-key");

    // Simple authentication - in production, use proper auth
    const validApiKey = process.env.TELEGRAM_ADMIN_API_KEY;
    if (validApiKey && apiKey !== validApiKey) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid API key" },
        { status: 401 }
      );
    }

    const config = getBotConfig();
    const webhookManager = new TelegramWebhookManager(config);

    // Get comprehensive webhook status
    const [webhookInfo, healthStatus, performanceMetrics] = await Promise.all([
      webhookManager.getWebhookInfo(),
      webhookManager.getHealthStatus(),
      Promise.resolve(webhookManager.getPerformanceMetrics()),
    ]);

    // Get current environment info
    const environment = {
      nodeEnv: process.env.NODE_ENV || "development",
      platform: process.platform,
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    };

    // Webhook security status
    const security = {
      webhookSecretConfigured: !!process.env.TELEGRAM_WEBHOOK_SECRET,
      botTokenConfigured: !!config.token,
      httpsRequired: performanceMetrics.securityConfig.requireHttps,
      signatureVerification:
        performanceMetrics.securityConfig.enableSignatureVerification,
      rateLimiting: performanceMetrics.securityConfig.enableRateLimit,
      ipFiltering: !!performanceMetrics.securityConfig.allowedIPs,
    };

    // Calculate uptime and performance indicators
    const uptimeSeconds = process.uptime();
    const uptimeFormatted = formatUptime(uptimeSeconds);

    // Detailed response
    const response = {
      status: "success",
      webhook: {
        configured: !!webhookInfo?.url,
        url: webhookInfo?.url,
        healthy: healthStatus.healthy,
        pendingUpdates: webhookInfo?.pending_update_count || 0,
        maxConnections: webhookInfo?.max_connections,
        allowedUpdates: webhookInfo?.allowed_updates,
        lastError: webhookInfo?.last_error_date
          ? {
              date: new Date(webhookInfo.last_error_date * 1000).toISOString(),
              message: webhookInfo.last_error_message,
              hoursAgo: Math.round(
                (Date.now() - webhookInfo.last_error_date * 1000) /
                  (1000 * 60 * 60)
              ),
            }
          : null,
      },
      health: {
        status: healthStatus.healthy ? "healthy" : "issues",
        issues: healthStatus.issues,
        uptime: {
          seconds: Math.round(uptimeSeconds),
          formatted: uptimeFormatted,
        },
      },
      security,
      performance: {
        ...performanceMetrics,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      },
      environment,
      monitoring: {
        endpoints: {
          webhook: "/api/telegram/webhook",
          status: "/api/telegram/webhook/status",
          admin: "/api/telegram/admin",
        },
        lastChecked: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Webhook status error:", error);

    return NextResponse.json(
      {
        status: "error",
        error: "Failed to retrieve webhook status",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const apiKey = request.headers.get("x-api-key");
    const validApiKey = process.env.TELEGRAM_ADMIN_API_KEY;

    if (!validApiKey || apiKey !== validApiKey) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid API key" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const action = body.action;

    if (!action) {
      return NextResponse.json(
        { error: "Missing action parameter" },
        { status: 400 }
      );
    }

    const config = getBotConfig();
    const webhookManager = new TelegramWebhookManager(config);

    switch (action) {
      case "setup":
        if (!body.url) {
          return NextResponse.json(
            { error: "Missing URL for webhook setup" },
            { status: 400 }
          );
        }

        const setupSuccess = await webhookManager.setupWebhook(
          body.url,
          body.secretToken || process.env.TELEGRAM_WEBHOOK_SECRET
        );

        return NextResponse.json({
          success: setupSuccess,
          message: setupSuccess
            ? "Webhook set up successfully"
            : "Failed to set up webhook",
        });

      case "delete":
        const deleteSuccess = await webhookManager.deleteWebhook();

        return NextResponse.json({
          success: deleteSuccess,
          message: deleteSuccess
            ? "Webhook deleted successfully"
            : "Failed to delete webhook",
        });

      case "info":
        const info = await webhookManager.getWebhookInfo();
        const health = await webhookManager.getHealthStatus();

        return NextResponse.json({
          webhook: info,
          health: health,
        });

      case "generate-token":
        const token = webhookManager.generateSecretToken();

        return NextResponse.json({
          secretToken: token,
          message:
            "New secret token generated. Add this to your environment variables.",
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Webhook management error:", error);

    return NextResponse.json(
      {
        error: "Failed to perform webhook management action",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0 || parts.length === 0)
    parts.push(`${remainingSeconds}s`);

  return parts.join(" ");
}
