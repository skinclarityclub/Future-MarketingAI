/**
 * Orchestration Gateway API
 * Task 73: Geleidelijke integratie - Entry point voor alle workflow requests
 *
 * Deze gateway analyseert inkomende requests en routeert ze naar:
 * - Webhook Orchestrator v2.0 (bestaand systeem) voor eenvoudige requests
 * - Master Workflow Controller v3.0 (AI-enhanced) voor complexe requests
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

// Simplified router for now to avoid dependency issues
interface RequestAnalysis {
  useAIEnhancement: boolean;
  complexity: "simple" | "medium" | "complex";
  targetOrchestrator: "webhook" | "master";
  reasoning: string[];
  confidence: number;
}

function analyzeRequest(
  body: any,
  headers: Record<string, string>
): RequestAnalysis {
  const analysis: RequestAnalysis = {
    useAIEnhancement: false,
    complexity: "simple",
    targetOrchestrator: "webhook",
    reasoning: [],
    confidence: 0.8,
  };

  // Simple analysis logic
  if (body.ai_enhanced === true || body.learning_enabled === true) {
    analysis.useAIEnhancement = true;
    analysis.targetOrchestrator = "master";
    analysis.complexity = "complex";
    analysis.reasoning.push("AI enhancement requested");
  } else if (body.update_id && body.callback_query) {
    analysis.targetOrchestrator = "webhook";
    analysis.complexity = "simple";
    analysis.reasoning.push("Simple Telegram callback");
  } else {
    analysis.targetOrchestrator = "webhook";
    analysis.reasoning.push("Default routing to webhook");
  }

  return analysis;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse request body
    const body = await request.json();
    const headers = Object.fromEntries(request.headers.entries());

    // Analyze request for routing decision
    const analysis = analyzeRequest(body, headers);

    // Route to appropriate orchestrator
    let response;
    const processingStartTime = Date.now();

    if (analysis.targetOrchestrator === "master") {
      // Route to Master Workflow Controller (AI-Enhanced)
      response = await routeToMasterController(body, headers);
    } else {
      // Route to existing Webhook Orchestrator
      response = await routeToWebhookOrchestrator(body, headers);
    }

    const processingTime = Date.now() - processingStartTime;
    const totalTime = Date.now() - startTime;

    // Enhanced response with orchestration metadata
    const enhancedResponse = {
      ...response,
      orchestration_metadata: {
        gateway_version: "1.0",
        routing_decision: {
          target_orchestrator: analysis.targetOrchestrator,
          complexity: analysis.complexity,
          confidence: analysis.confidence,
          ai_enhanced: analysis.useAIEnhancement,
          reasoning: analysis.reasoning,
        },
        performance_metrics: {
          analysis_time_ms: processingStartTime - startTime,
          processing_time_ms: processingTime,
          total_time_ms: totalTime,
          timestamp: new Date().toISOString(),
        },
      },
    };

    return NextResponse.json(enhancedResponse, {
      status: 200,
      headers: {
        "X-Orchestration-Gateway": "v1.0",
        "X-Target-Orchestrator": analysis.targetOrchestrator,
        "X-AI-Enhanced": analysis.useAIEnhancement.toString(),
        "X-Processing-Time": totalTime.toString(),
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "error",
        message: "Orchestration Gateway Error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        processing_time_ms: totalTime,
      },
      {
        status: 500,
        headers: {
          "X-Orchestration-Gateway": "v1.0",
          "X-Error": "true",
          "Content-Type": "application/json",
        },
      }
    );
  }
}

/**
 * Routes request to Master Workflow Controller (AI-Enhanced)
 */
async function routeToMasterController(
  body: any,
  headers: Record<string, string>
): Promise<any> {
  try {
    // Enhance body with AI orchestration metadata
    const enhancedBody = {
      ...body,
      ai_orchestration: true,
      orchestration_source: "gateway",
      gateway_version: "1.0",
    };

    // Internal API call to Master Controller
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/workflows/master-controller`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Request": "true",
          "X-Source-Gateway": "orchestration-gateway",
        },
        body: JSON.stringify(enhancedBody),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Master Controller responded with status: ${response.status}`
      );
    }

    const result = await response.json();

    return {
      status: "success",
      message: "Request processed by Master Workflow Controller",
      orchestrator: "master",
      ai_enhanced: true,
      result,
    };
  } catch (error) {
    // Fallback to Webhook Orchestrator
    return await routeToWebhookOrchestrator(body, headers);
  }
}

/**
 * Routes request to existing Webhook Orchestrator
 */
async function routeToWebhookOrchestrator(
  body: any,
  headers: Record<string, string>
): Promise<any> {
  try {
    // Route to existing n8n webhook orchestrator
    const webhookUrl =
      process.env.N8N_WEBHOOK_ORCHESTRATOR_URL ||
      "https://skinclarityclub.app.n8n.cloud/webhook/orchestrator-v2";

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Source-Gateway": "orchestration-gateway",
        "User-Agent": headers["user-agent"] || "Orchestration-Gateway/1.0",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(
        `Webhook Orchestrator responded with status: ${response.status}`
      );
    }

    const result = await response.json();

    return {
      status: "success",
      message: "Request processed by Webhook Orchestrator",
      orchestrator: "webhook",
      ai_enhanced: false,
      result,
    };
  } catch (error) {
    throw new Error(
      `Webhook Orchestrator failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  try {
    const health = {
      status: "healthy",
      gateway_version: "1.0",
      timestamp: new Date().toISOString(),
      orchestrators: {
        webhook: { status: "available" },
        master: { status: "available" },
      },
      routing_active: true,
    };

    return NextResponse.json(health, {
      headers: {
        "X-Orchestration-Gateway": "v1.0",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "X-Orchestration-Gateway": "v1.0",
          "Content-Type": "application/json",
        },
      }
    );
  }
}
