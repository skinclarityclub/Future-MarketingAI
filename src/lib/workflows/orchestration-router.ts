/**
 * Orchestration Router
 * Task 73: Geleidelijke integratie van Master Workflow Controller
 *
 * Intelligente router die bepaalt of een request naar de bestaande Webhook Orchestrator
 * of naar de nieuwe Master Workflow Controller moet voor AI-enhanced processing
 */

import { logger } from "@/lib/logger";

export interface RequestAnalysis {
  useAIEnhancement: boolean;
  complexity: "simple" | "medium" | "complex";
  targetOrchestrator: "webhook" | "master";
  reasoning: string[];
  confidence: number;
}

export interface IncomingRequest {
  body: any;
  headers: Record<string, string>;
  source?: string;
  type?: string;
}

export class OrchestrationRouter {
  private aiEnhancementThreshold = 0.7; // 70% confidence threshold
  private complexityFactors: Record<string, number> = {
    telegram_callback: 0.2,
    telegram_message: 0.3,
    scheduled_content: 0.5,
    content_creation: 0.8,
    ml_request: 0.9,
    api_request: 0.6,
    admin_request: 0.7,
  };

  /**
   * Analyzeert een request en bepaalt welke orchestrator te gebruiken
   */
  analyzeRequest(request: IncomingRequest): RequestAnalysis {
    const analysis: RequestAnalysis = {
      useAIEnhancement: false,
      complexity: "simple",
      targetOrchestrator: "webhook",
      reasoning: [],
      confidence: 0,
    };

    // Basis analyse van request type
    const requestType = this.determineRequestType(request);
    analysis.reasoning.push(`Request type: ${requestType}`);

    // Complexity scoring
    const complexityScore = this.calculateComplexityScore(request, requestType);
    analysis.complexity = this.mapComplexityScore(complexityScore);
    analysis.reasoning.push(
      `Complexity score: ${complexityScore}/1.0 (${analysis.complexity})`
    );

    // AI Enhancement criteria
    const aiCriteria = this.evaluateAICriteria(request, requestType);
    analysis.reasoning.push(...aiCriteria.reasons);

    // Decision logic
    if (aiCriteria.score >= this.aiEnhancementThreshold) {
      analysis.useAIEnhancement = true;
      analysis.targetOrchestrator = "master";
      analysis.reasoning.push(
        "✨ AI Enhancement enabled - routing to Master Controller"
      );
    } else {
      analysis.useAIEnhancement = false;
      analysis.targetOrchestrator = "webhook";
      analysis.reasoning.push(
        "🔄 Standard processing - routing to Webhook Orchestrator"
      );
    }

    analysis.confidence = Math.min(0.95, Math.max(0.6, aiCriteria.score));

    logger.logSystem("Orchestration routing decision", "info", {
      targetOrchestrator: analysis.targetOrchestrator,
      complexity: analysis.complexity,
      confidence: analysis.confidence,
      reasoning: analysis.reasoning,
    });

    return analysis;
  }

  /**
   * Bepaalt het type van de request
   */
  private determineRequestType(request: IncomingRequest): string {
    const body = request.body || {};

    // Telegram callbacks (eenvoudig)
    if (body.update_id && body.callback_query) {
      const callbackData = body.callback_query.data || "";
      const stateCallbackPattern =
        /^(AIP|RIP|MIP|AFP|RFP|MFP|AIC|MIC|AFC|MFC|AIS|MIS|AFS|MFS|AIR|MIR|AFR|MFR)_/;

      if (stateCallbackPattern.test(callbackData)) {
        return "telegram_callback";
      }
    }

    // Telegram messages
    if (body.update_id && body.message) {
      return "telegram_message";
    }

    // Scheduled content
    if (body.scheduled_execution || body.contentType) {
      return "scheduled_content";
    }

    // Content creation requests
    if (body.request_type || body.workflow_type) {
      const contentTypes = [
        "post_creation",
        "carousel_creation",
        "reel_creation",
        "story_creation",
      ];
      if (
        contentTypes.includes(body.request_type) ||
        contentTypes.includes(body.workflow_type)
      ) {
        return "content_creation";
      }
    }

    // ML/AI requests
    if (body.model_id || body.ml_request || body.ai_enhanced) {
      return "ml_request";
    }

    // Admin requests
    const userId = body.callback_query?.from?.id || body.message?.from?.id;
    const adminUsers = [6475835412, 7543174110];
    if (adminUsers.includes(userId)) {
      return "admin_request";
    }

    // API requests
    if (
      request.headers["content-type"]?.includes("application/json") &&
      Object.keys(body).length > 0
    ) {
      return "api_request";
    }

    return "unknown";
  }

  /**
   * Berekent complexity score (0-1)
   */
  private calculateComplexityScore(
    request: IncomingRequest,
    requestType: string
  ): number {
    let score = this.complexityFactors[requestType] || 0.5;

    const body = request.body || {};

    // Verhoog complexity voor specifieke kenmerken
    if (body.ai_enhanced === true) score += 0.2;
    if (body.learning_enabled === true) score += 0.15;
    if (body.optimization_enabled === true) score += 0.15;
    if (body.cross_platform_context) score += 0.1;
    if (body.priority === "critical" || body.priority === "high") score += 0.1;

    // Content creation specifics
    if (requestType === "content_creation") {
      if (
        body.target_platforms &&
        Array.isArray(body.target_platforms) &&
        body.target_platforms.length > 1
      ) {
        score += 0.1; // Multi-platform = complexer
      }
      if (
        body.content_strategy === "premium" ||
        body.content_strategy === "enterprise"
      ) {
        score += 0.1;
      }
    }

    // Scheduled content specifics
    if (requestType === "scheduled_content") {
      if (body.batch_processing) score += 0.1;
      if (body.optimization_required) score += 0.15;
    }

    return Math.min(1.0, Math.max(0.0, score));
  }

  /**
   * Maps complexity score to category
   */
  private mapComplexityScore(score: number): "simple" | "medium" | "complex" {
    if (score < 0.4) return "simple";
    if (score < 0.7) return "medium";
    return "complex";
  }

  /**
   * Evalueert AI enhancement criteria
   */
  private evaluateAICriteria(
    request: IncomingRequest,
    requestType: string
  ): { score: number; reasons: string[] } {
    const body = request.body || {};
    const reasons: string[] = [];
    let score = 0;

    // Basis score per request type
    const baseScores = {
      telegram_callback: 0.1,
      telegram_message: 0.2,
      scheduled_content: 0.4,
      content_creation: 0.6,
      ml_request: 0.9,
      api_request: 0.5,
      admin_request: 0.6,
      unknown: 0.3,
    };

    score = baseScores[requestType] || 0.3;
    reasons.push(`Base AI score for ${requestType}: ${score}`);

    // Expliciete AI flags
    if (body.ai_enhanced === true) {
      score += 0.3;
      reasons.push("Explicit AI enhancement requested (+0.3)");
    }

    if (body.learning_enabled === true) {
      score += 0.2;
      reasons.push("Cross-platform learning enabled (+0.2)");
    }

    if (body.optimization_enabled === true) {
      score += 0.2;
      reasons.push("Optimization enabled (+0.2)");
    }

    // Multi-platform requests
    if (
      body.target_platforms &&
      Array.isArray(body.target_platforms) &&
      body.target_platforms.length > 1
    ) {
      score += 0.15;
      reasons.push("Multi-platform request (+0.15)");
    }

    // Premium/Enterprise content
    if (
      body.content_strategy === "premium" ||
      body.content_strategy === "enterprise"
    ) {
      score += 0.1;
      reasons.push("Premium/Enterprise strategy (+0.1)");
    }

    // Complex content types
    const complexContentTypes = [
      "carousel_creation",
      "reel_creation",
      "marketing_strategy",
    ];
    if (
      complexContentTypes.includes(body.request_type) ||
      complexContentTypes.includes(body.workflow_type)
    ) {
      score += 0.15;
      reasons.push("Complex content type (+0.15)");
    }

    // Admin users get AI enhancement
    const userId = body.callback_query?.from?.id || body.message?.from?.id;
    const adminUsers = [6475835412, 7543174110];
    if (adminUsers.includes(userId)) {
      score += 0.1;
      reasons.push("Admin user (+0.1)");
    }

    // Time-based enhancement (peak hours)
    const currentHour = new Date().getHours();
    if (
      (currentHour >= 8 && currentHour <= 10) ||
      (currentHour >= 14 && currentHour <= 16)
    ) {
      score += 0.05;
      reasons.push("Peak hours - enhanced processing (+0.05)");
    }

    // Reduce score for simple callbacks
    if (requestType === "telegram_callback") {
      const callbackData = body.callback_query?.data || "";
      if (callbackData.startsWith("AIP_") || callbackData.startsWith("AFP_")) {
        score -= 0.1;
        reasons.push("Simple approval callback (-0.1)");
      }
    }

    return {
      score: Math.min(1.0, Math.max(0.0, score)),
      reasons,
    };
  }

  /**
   * Genereert routing instructies
   */
  generateRoutingInstructions(analysis: RequestAnalysis): {
    endpoint: string;
    headers: Record<string, string>;
    enhancedData?: any;
  } {
    if (analysis.targetOrchestrator === "master") {
      return {
        endpoint: "/api/workflows/master-controller",
        headers: {
          "X-Orchestration-Type": "master",
          "X-AI-Enhanced": "true",
          "X-Complexity": analysis.complexity,
          "X-Confidence": analysis.confidence.toString(),
        },
        enhancedData: {
          ai_orchestration: true,
          complexity: analysis.complexity,
          enhancement_reasoning: analysis.reasoning,
          confidence: analysis.confidence,
        },
      };
    } else {
      return {
        endpoint: "/webhook/orchestrator-v2",
        headers: {
          "X-Orchestration-Type": "webhook",
          "X-AI-Enhanced": "false",
          "X-Complexity": analysis.complexity,
          "X-Fallback": "standard",
        },
      };
    }
  }

  /**
   * Voert een test uit van de routing logic
   */
  testRouting(
    testCases: Array<{
      name: string;
      request: IncomingRequest;
      expectedTarget: "webhook" | "master";
    }>
  ): void {
    console.log("🧪 Testing Orchestration Router...\n");

    testCases.forEach((testCase, index) => {
      const analysis = this.analyzeRequest(testCase.request);
      const success = analysis.targetOrchestrator === testCase.expectedTarget;

      console.log(`Test ${index + 1}: ${testCase.name}`);
      console.log(
        `Expected: ${testCase.expectedTarget}, Got: ${analysis.targetOrchestrator}`
      );
      console.log(`Result: ${success ? "✅ PASS" : "❌ FAIL"}`);
      console.log(`Reasoning: ${analysis.reasoning.join(", ")}`);
      console.log("---");
    });
  }
}

// Export singleton instance
export const orchestrationRouter = new OrchestrationRouter();

// Test cases voor development
export const testCases = [
  {
    name: "Simple Telegram Callback",
    request: {
      body: {
        update_id: 123,
        callback_query: {
          data: "AIP_1234_image-approval",
          from: { id: 6475835412 },
        },
      },
      headers: { "content-type": "application/json" },
    },
    expectedTarget: "webhook" as const,
  },
  {
    name: "AI-Enhanced Content Creation",
    request: {
      body: {
        request_type: "post_creation",
        ai_enhanced: true,
        learning_enabled: true,
        target_platforms: ["instagram", "linkedin"],
        content_strategy: "premium",
      },
      headers: { "content-type": "application/json" },
    },
    expectedTarget: "master" as const,
  },
  {
    name: "Complex Multi-Platform Request",
    request: {
      body: {
        workflow_type: "carousel_creation",
        target_platforms: ["instagram", "tiktok", "linkedin"],
        optimization_enabled: true,
        priority: "high",
      },
      headers: { "content-type": "application/json" },
    },
    expectedTarget: "master" as const,
  },
  {
    name: "Simple Scheduled Content",
    request: {
      body: {
        scheduled_execution: true,
        contentType: "post",
      },
      headers: { "content-type": "application/json" },
    },
    expectedTarget: "webhook" as const,
  },
];

export default OrchestrationRouter;
