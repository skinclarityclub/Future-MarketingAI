/**
 * Configuration Test Endpoint
 * Task 62: Error Handling Master Control - Configuration Testing
 */

import { NextRequest, NextResponse } from "next/server";
import {
  isN8NConfigured,
  defaultErrorConfig,
  logError,
} from "@/lib/error-handling/error-config";

export async function GET(request: NextRequest) {
  try {
    const configStatus = {
      timestamp: new Date().toISOString(),
      n8nConfiguration: {
        configured: isN8NConfigured(),
        baseUrl: process.env.N8N_BASE_URL ? "✅ Set" : "❌ Missing",
        apiKey: process.env.N8N_API_KEY ? "✅ Set" : "❌ Missing",
        webhookUrl: process.env.N8N_WEBHOOK_URL ? "✅ Set" : "❌ Missing",
        webhookSecret: process.env.N8N_WEBHOOK_SECRET ? "✅ Set" : "❌ Missing",
      },
      supabaseConfiguration: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
          ? "✅ Set"
          : "❌ Missing",
      },
      aiConfiguration: {
        openai: process.env.OPENAI_API_KEY ? "✅ Set" : "❌ Missing",
        anthropic: process.env.ANTHROPIC_API_KEY ? "✅ Set" : "❌ Missing",
        perplexity: process.env.PERPLEXITY_API_KEY ? "✅ Set" : "❌ Missing",
      },
      errorHandlingConfig: defaultErrorConfig,
      recommendations: [] as Array<{
        priority: string;
        category: string;
        message: string;
        action: string;
        example?: any;
      }>,
    };

    // Generate recommendations based on missing config
    if (!configStatus.n8nConfiguration.configured) {
      configStatus.recommendations.push({
        priority: "high",
        category: "N8N Configuration",
        message: "N8N environment variables are missing or incomplete",
        action:
          "Create .env.local file with N8N_BASE_URL, N8N_API_KEY, N8N_WEBHOOK_URL, and N8N_WEBHOOK_SECRET",
        example: {
          N8N_BASE_URL: "https://your-n8n-instance.app.n8n.cloud/api/v1",
          N8N_API_KEY: "your_n8n_api_key_here",
          N8N_WEBHOOK_URL: "https://your-n8n-instance.app.n8n.cloud/webhook",
          N8N_WEBHOOK_SECRET: "your_webhook_secret_here",
        },
      });
    }

    if (
      !configStatus.supabaseConfiguration.url ||
      !configStatus.supabaseConfiguration.serviceKey
    ) {
      configStatus.recommendations.push({
        priority: "high",
        category: "Supabase Configuration",
        message: "Supabase environment variables are missing",
        action:
          "Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local",
      });
    }

    if (
      !configStatus.aiConfiguration.openai &&
      !configStatus.aiConfiguration.anthropic
    ) {
      configStatus.recommendations.push({
        priority: "medium",
        category: "AI Configuration",
        message: "No AI provider configured",
        action:
          "Add at least one AI API key (OPENAI_API_KEY or ANTHROPIC_API_KEY) to .env.local",
      });
    }

    // Only log if explicitly requested via query parameter
    const url = new URL(request.url);
    const logTest = url.searchParams.get("log") === "true";

    if (logTest) {
      logError(
        new Error("Configuration check performed (test log)"),
        "config-test",
        "SYSTEM_ERROR"
      );
    }

    return NextResponse.json({
      success: true,
      data: configStatus,
      message: configStatus.n8nConfiguration.configured
        ? "✅ Configuration looks good!"
        : "⚠️ Configuration issues detected",
    });
  } catch (error) {
    logError(error, "config-test-error", "API_ERROR");

    return NextResponse.json(
      {
        success: false,
        error: "Configuration test failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testType = "basic" } = body;

    const results = {
      timestamp: new Date().toISOString(),
      testType,
      results: {},
    };

    switch (testType) {
      case "n8n-connection":
        // Test N8N connection
        results.results = {
          configured: isN8NConfigured(),
          connectionTest: "Not implemented - requires N8N service running",
          recommendation: isN8NConfigured()
            ? "N8N configuration looks correct"
            : "Please set up N8N environment variables first",
        };
        break;

      case "error-handling":
        // Test error handling system
        results.results = {
          errorCategories: Object.keys(defaultErrorConfig.errorCategories),
          recoveryStrategies: defaultErrorConfig.recovery.recoveryStrategies,
          monitoringEnabled: defaultErrorConfig.monitoring.metricsCollection,
          alertsConfigured:
            defaultErrorConfig.errorCategories.API_ERROR.alertChannels,
        };
        break;

      default:
        results.results = {
          message: "Basic test completed",
          n8nConfigured: isN8NConfigured(),
          timestamp: new Date().toISOString(),
        };
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    logError(error, "config-test-post", "API_ERROR");

    return NextResponse.json(
      {
        success: false,
        error: "Test execution failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
