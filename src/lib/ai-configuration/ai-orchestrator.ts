/**
 * AI Orchestrator - Central Coordination System for All AI Assistants
 * Task 80.6: Connect and Orchestrate AI Assistants
 *
 * This orchestrator provides a unified interface for coordinating and managing
 * all AI assistants within the SKC BI Dashboard platform.
 */

import { EnhancedAIAssistantIntegration } from "../assistant/integration/enhanced-ai-assistant-integration";
import { AIComponentsIntegration } from "../navigation/ai-components-integration";
import { ContextAwareAssistant } from "../assistant/context/context-aware-assistant";
import { complexQueryHandler } from "../assistant/complex-query-handler";
import { NavigationNLPIntegration } from "../assistant/nlp/nlp-navigation-integration";
import type { AssistantAnswer } from "../assistant/assistant-service";
import type {
  AIResponse,
  AIIntegrationContext,
} from "../navigation/ai-components-integration";

// AI Assistant Types
export type AIAssistantType =
  | "general"
  | "navigation"
  | "context-aware"
  | "complex-query"
  | "nlp"
  | "voice"
  | "business-intelligence"
  | "marketing"
  | "financial";

// Orchestration Event Types
export type OrchestrationEventType =
  | "assistant_request"
  | "assistant_response"
  | "workflow_start"
  | "workflow_complete"
  | "assistant_collaboration"
  | "error"
  | "performance_metric";

// Orchestrator Configuration
export interface AIOrchestratorConfig {
  // Core Settings
  enableMultiAssistantCollaboration: boolean;
  enableCrossAssistantLearning: boolean;
  enableWorkflowOrchestration: boolean;
  enablePerformanceMonitoring: boolean;

  // Performance Thresholds
  maxResponseTime: number;
  maxConcurrentRequests: number;

  // Quality Thresholds
  minimumConfidenceScore: number;
  enableQualityAssurance: boolean;

  // Integration Settings
  enableFallbackRouting: boolean;
  enableSmartRouting: boolean;

  // Monitoring
  enableRealTimeMetrics: boolean;
  enableEventLogging: boolean;
}

// Assistant Request Context
export interface AssistantRequest {
  id: string;
  type: AIAssistantType;
  query: string;
  context?: any;
  priority: "low" | "medium" | "high" | "critical";
  sessionId: string;
  userId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Orchestrated Response
export interface OrchestratedResponse {
  id: string;
  primaryResponse: AssistantAnswer | AIResponse;
  collaborativeResponses?: Array<{
    assistant: AIAssistantType;
    response: AssistantAnswer | AIResponse;
    confidence: number;
  }>;
  orchestrationMetrics: {
    totalProcessingTime: number;
    assistantsInvolved: AIAssistantType[];
    collaborationLevel: "none" | "basic" | "advanced" | "full";
    qualityScore: number;
  };
  recommendations?: Array<{
    action: string;
    reasoning: string;
    confidence: number;
  }>;
  nextSteps?: string[];
}

// Event for orchestration monitoring
export interface OrchestrationEvent {
  id: string;
  type: OrchestrationEventType;
  timestamp: Date;
  data: any;
  sessionId: string;
  userId?: string;
}

/**
 * Central AI Orchestrator Class
 * Coordinates all AI assistants and manages intelligent workflows
 */
export class AIOrchestrator {
  private static instance: AIOrchestrator;
  private config: AIOrchestratorConfig;

  // AI Assistant Integrations
  private enhancedAssistant: EnhancedAIAssistantIntegration;
  private aiComponents: AIComponentsIntegration;
  private contextAware: ContextAwareAssistant;
  private nlpIntegration: NavigationNLPIntegration;

  // State Management
  private activeRequests: Map<string, AssistantRequest> = new Map();
  private requestQueue: AssistantRequest[] = [];
  private performanceMetrics: Map<AIAssistantType, any> = new Map();
  private eventListeners: Map<OrchestrationEventType, Function[]> = new Map();

  private constructor(config: Partial<AIOrchestratorConfig> = {}) {
    this.config = {
      enableMultiAssistantCollaboration: true,
      enableCrossAssistantLearning: true,
      enableWorkflowOrchestration: true,
      enablePerformanceMonitoring: true,
      maxResponseTime: 5000,
      maxConcurrentRequests: 10,
      minimumConfidenceScore: 0.7,
      enableQualityAssurance: true,
      enableFallbackRouting: true,
      enableSmartRouting: true,
      enableRealTimeMetrics: true,
      enableEventLogging: true,
      ...config,
    };

    this.initializeAssistants();
    this.setupEventListeners();
  }

  public static getInstance(
    config?: Partial<AIOrchestratorConfig>
  ): AIOrchestrator {
    if (!AIOrchestrator.instance) {
      AIOrchestrator.instance = new AIOrchestrator(config);
    }
    return AIOrchestrator.instance;
  }

  /**
   * Main orchestration method - intelligently routes and coordinates AI requests
   */
  async orchestrateRequest(
    request: AssistantRequest
  ): Promise<OrchestratedResponse> {
    const startTime = Date.now();

    try {
      // Add to active requests
      this.activeRequests.set(request.id, request);

      // Emit orchestration start event
      this.emitEvent({
        id: `event_${Date.now()}`,
        type: "workflow_start",
        timestamp: new Date(),
        data: { requestId: request.id, type: request.type },
        sessionId: request.sessionId,
        userId: request.userId,
      });

      // Determine optimal processing strategy
      const strategy = await this.determineProcessingStrategy(request);

      // Execute the strategy
      const response = await this.executeStrategy(strategy, request, startTime);

      // Clean up
      this.activeRequests.delete(request.id);

      // Emit completion event
      this.emitEvent({
        id: `event_${Date.now()}`,
        type: "workflow_complete",
        timestamp: new Date(),
        data: {
          requestId: request.id,
          processingTime: response.orchestrationMetrics.totalProcessingTime,
          qualityScore: response.orchestrationMetrics.qualityScore,
        },
        sessionId: request.sessionId,
        userId: request.userId,
      });

      return response;
    } catch (error) {
      this.activeRequests.delete(request.id);

      this.emitEvent({
        id: `event_${Date.now()}`,
        type: "error",
        timestamp: new Date(),
        data: {
          requestId: request.id,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        sessionId: request.sessionId,
        userId: request.userId,
      });

      throw error;
    }
  }

  /**
   * Determine the best processing strategy for a request
   */
  private async determineProcessingStrategy(
    request: AssistantRequest
  ): Promise<{
    primary: AIAssistantType;
    collaborators: AIAssistantType[];
    mode: "single" | "collaborative" | "sequential" | "parallel";
  }> {
    const query = request.query.toLowerCase();
    const context = request.context || {};

    // Business Intelligence queries
    if (this.isBusinessIntelligenceQuery(query)) {
      return {
        primary: "business-intelligence",
        collaborators: ["context-aware", "complex-query"],
        mode: "collaborative",
      };
    }

    // Navigation queries
    if (this.isNavigationQuery(query)) {
      return {
        primary: "navigation",
        collaborators: ["nlp"],
        mode: "parallel",
      };
    }

    // Complex analytical queries
    if (this.isComplexQuery(query)) {
      return {
        primary: "complex-query",
        collaborators: ["context-aware", "business-intelligence"],
        mode: "sequential",
      };
    }

    // Marketing-specific queries
    if (this.isMarketingQuery(query)) {
      return {
        primary: "marketing",
        collaborators: ["business-intelligence", "context-aware"],
        mode: "collaborative",
      };
    }

    // Financial queries
    if (this.isFinancialQuery(query)) {
      return {
        primary: "financial",
        collaborators: ["business-intelligence", "complex-query"],
        mode: "collaborative",
      };
    }

    // Default to general assistant with context awareness
    return {
      primary: "general",
      collaborators: ["context-aware"],
      mode: "collaborative",
    };
  }

  /**
   * Execute the determined strategy
   */
  private async executeStrategy(
    strategy: {
      primary: AIAssistantType;
      collaborators: AIAssistantType[];
      mode: "single" | "collaborative" | "sequential" | "parallel";
    },
    request: AssistantRequest,
    startTime: number
  ): Promise<OrchestratedResponse> {
    switch (strategy.mode) {
      case "single":
        return await this.executeSingleAssistant(
          strategy.primary,
          request,
          startTime
        );

      case "collaborative":
        return await this.executeCollaborative(strategy, request, startTime);

      case "sequential":
        return await this.executeSequential(strategy, request, startTime);

      case "parallel":
        return await this.executeParallel(strategy, request, startTime);

      default:
        throw new Error(`Unknown execution mode: ${strategy.mode}`);
    }
  }

  /**
   * Execute with single assistant
   */
  private async executeSingleAssistant(
    assistantType: AIAssistantType,
    request: AssistantRequest,
    startTime: number
  ): Promise<OrchestratedResponse> {
    const primaryResponse = await this.invokeAssistant(assistantType, request);

    return {
      id: request.id,
      primaryResponse,
      orchestrationMetrics: {
        totalProcessingTime: Date.now() - startTime,
        assistantsInvolved: [assistantType],
        collaborationLevel: "none",
        qualityScore: this.calculateQualityScore(primaryResponse),
      },
    };
  }

  /**
   * Execute collaborative mode - assistants work together
   */
  private async executeCollaborative(
    strategy: {
      primary: AIAssistantType;
      collaborators: AIAssistantType[];
    },
    request: AssistantRequest,
    startTime: number
  ): Promise<OrchestratedResponse> {
    // Get primary response
    const primaryResponse = await this.invokeAssistant(
      strategy.primary,
      request
    );

    // Get collaborative responses
    const collaborativeResponses = await Promise.all(
      strategy.collaborators.map(async assistantType => {
        const response = await this.invokeAssistant(assistantType, {
          ...request,
          context: {
            ...request.context,
            primaryResponse,
          },
        });

        return {
          assistant: assistantType,
          response,
          confidence: this.extractConfidence(response),
        };
      })
    );

    // Synthesize responses
    const synthesizedResponse = await this.synthesizeResponses(
      primaryResponse,
      collaborativeResponses
    );

    return {
      id: request.id,
      primaryResponse: synthesizedResponse,
      collaborativeResponses,
      orchestrationMetrics: {
        totalProcessingTime: Date.now() - startTime,
        assistantsInvolved: [strategy.primary, ...strategy.collaborators],
        collaborationLevel: "full",
        qualityScore: this.calculateQualityScore(synthesizedResponse),
      },
      recommendations: await this.generateRecommendations(
        primaryResponse,
        collaborativeResponses
      ),
    };
  }

  /**
   * Execute sequential mode - assistants build on each other
   */
  private async executeSequential(
    strategy: {
      primary: AIAssistantType;
      collaborators: AIAssistantType[];
    },
    request: AssistantRequest,
    startTime: number
  ): Promise<OrchestratedResponse> {
    let currentResponse = await this.invokeAssistant(strategy.primary, request);
    const responses = [
      {
        assistant: strategy.primary,
        response: currentResponse,
        confidence: this.extractConfidence(currentResponse),
      },
    ];

    // Process each collaborator sequentially, building context
    for (const assistantType of strategy.collaborators) {
      const enhancedRequest = {
        ...request,
        context: {
          ...request.context,
          previousResponses: responses,
          currentResponse,
        },
      };

      currentResponse = await this.invokeAssistant(
        assistantType,
        enhancedRequest
      );

      responses.push({
        assistant: assistantType,
        response: currentResponse,
        confidence: this.extractConfidence(currentResponse),
      });
    }

    return {
      id: request.id,
      primaryResponse: currentResponse,
      collaborativeResponses: responses.slice(1), // Exclude primary
      orchestrationMetrics: {
        totalProcessingTime: Date.now() - startTime,
        assistantsInvolved: [strategy.primary, ...strategy.collaborators],
        collaborationLevel: "advanced",
        qualityScore: this.calculateQualityScore(currentResponse),
      },
    };
  }

  /**
   * Execute parallel mode - assistants work independently
   */
  private async executeParallel(
    strategy: {
      primary: AIAssistantType;
      collaborators: AIAssistantType[];
    },
    request: AssistantRequest,
    startTime: number
  ): Promise<OrchestratedResponse> {
    // Execute all assistants in parallel
    const allPromises = [
      this.invokeAssistant(strategy.primary, request),
      ...strategy.collaborators.map(type =>
        this.invokeAssistant(type, request)
      ),
    ];

    const allResponses = await Promise.all(allPromises);
    const primaryResponse = allResponses[0];
    const collaborativeResponses = allResponses
      .slice(1)
      .map((response, index) => ({
        assistant: strategy.collaborators[index],
        response,
        confidence: this.extractConfidence(response),
      }));

    // Select best response or synthesize
    const finalResponse = await this.selectBestResponse(
      primaryResponse,
      collaborativeResponses
    );

    return {
      id: request.id,
      primaryResponse: finalResponse,
      collaborativeResponses,
      orchestrationMetrics: {
        totalProcessingTime: Date.now() - startTime,
        assistantsInvolved: [strategy.primary, ...strategy.collaborators],
        collaborationLevel: "basic",
        qualityScore: this.calculateQualityScore(finalResponse),
      },
    };
  }

  /**
   * Invoke specific assistant based on type
   */
  private async invokeAssistant(
    type: AIAssistantType,
    request: AssistantRequest
  ): Promise<AssistantAnswer | AIResponse> {
    switch (type) {
      case "general":
      case "context-aware":
        return await this.enhancedAssistant.ask(request.query, request.context);

      case "navigation":
      case "nlp":
      case "voice":
        return await this.aiComponents.processAIRequest(
          this.createAIIntegrationContext(request),
          {
            type: "text",
            input: request.query,
            options: request.context,
          }
        );

      case "complex-query":
        return await complexQueryHandler.handleComplexQuery(
          request.query,
          request.context
        );

      case "business-intelligence":
      case "marketing":
      case "financial":
        // Route to specialized business logic
        return await this.enhancedAssistant.ask(request.query, {
          ...request.context,
          specialization: type,
        });

      default:
        throw new Error(`Unknown assistant type: ${type}`);
    }
  }

  /**
   * Query classification methods
   */
  private isBusinessIntelligenceQuery(query: string): boolean {
    const biKeywords = [
      "analytics",
      "dashboard",
      "kpi",
      "metrics",
      "performance",
      "revenue",
      "sales",
      "profit",
      "roi",
      "conversion",
      "trends",
    ];
    return biKeywords.some(keyword => query.includes(keyword));
  }

  private isNavigationQuery(query: string): boolean {
    const navKeywords = [
      "navigate",
      "go to",
      "show me",
      "open",
      "find",
      "search",
      "page",
      "section",
      "dashboard",
      "view",
    ];
    return navKeywords.some(keyword => query.includes(keyword));
  }

  private isComplexQuery(query: string): boolean {
    const complexIndicators = [
      "analyze",
      "compare",
      "correlate",
      "predict",
      "forecast",
      "what if",
      "scenario",
      "optimization",
      "recommendation",
    ];
    return complexIndicators.some(indicator => query.includes(indicator));
  }

  private isMarketingQuery(query: string): boolean {
    const marketingKeywords = [
      "campaign",
      "marketing",
      "ctr",
      "engagement",
      "conversion",
      "audience",
      "targeting",
      "content",
      "social media",
      "advertising",
    ];
    return marketingKeywords.some(keyword => query.includes(keyword));
  }

  private isFinancialQuery(query: string): boolean {
    const financialKeywords = [
      "budget",
      "cost",
      "expense",
      "income",
      "profit",
      "loss",
      "cash flow",
      "financial",
      "accounting",
      "invoice",
    ];
    return financialKeywords.some(keyword => query.includes(keyword));
  }

  /**
   * Helper methods
   */
  private createAIIntegrationContext(
    request: AssistantRequest
  ): AIIntegrationContext {
    return {
      userId: request.userId,
      sessionId: request.sessionId,
      currentPage: request.context?.currentPage || "/dashboard",
      userPreferences: request.context?.userPreferences || {},
      conversationHistory: request.context?.conversationHistory || [],
    };
  }

  private extractConfidence(response: AssistantAnswer | AIResponse): number {
    if ("confidence" in response) {
      return response.confidence || 0.5;
    }
    if ("metadata" in response && response.metadata?.confidence) {
      return response.metadata.confidence;
    }
    return 0.5;
  }

  private calculateQualityScore(
    response: AssistantAnswer | AIResponse
  ): number {
    const confidence = this.extractConfidence(response);
    const hasAnswer = "answer" in response && response.answer?.length > 0;
    const hasSources = "sources" in response && response.sources?.length > 0;
    const hasInsights = "insights" in response && response.insights?.length > 0;

    let score = confidence * 0.4;
    if (hasAnswer) score += 0.3;
    if (hasSources) score += 0.2;
    if (hasInsights) score += 0.1;

    return Math.min(score, 1.0);
  }

  private async synthesizeResponses(
    primary: AssistantAnswer | AIResponse,
    collaborative: Array<{
      assistant: AIAssistantType;
      response: AssistantAnswer | AIResponse;
      confidence: number;
    }>
  ): Promise<AssistantAnswer> {
    // Implement intelligent response synthesis
    // For now, return enhanced primary response

    const bestCollaborativeResponse = collaborative.sort(
      (a, b) => b.confidence - a.confidence
    )[0];

    return {
      answer:
        "answer" in primary
          ? primary.answer
          : "Synthesized response from multiple AI assistants",
      sources: [
        ...("sources" in primary ? primary.sources || [] : []),
        ...("sources" in bestCollaborativeResponse.response
          ? bestCollaborativeResponse.response.sources || []
          : []),
      ],
      insights: [
        ...("insights" in primary ? primary.insights || [] : []),
        ...("insights" in bestCollaborativeResponse.response
          ? bestCollaborativeResponse.response.insights || []
          : []),
      ],
      confidence: Math.max(
        this.extractConfidence(primary),
        bestCollaborativeResponse.confidence
      ),
      executionTime: 0,
    };
  }

  private async selectBestResponse(
    primary: AssistantAnswer | AIResponse,
    collaborative: Array<{
      assistant: AIAssistantType;
      response: AssistantAnswer | AIResponse;
      confidence: number;
    }>
  ): Promise<AssistantAnswer> {
    const allResponses = [
      { response: primary, confidence: this.extractConfidence(primary) },
      ...collaborative,
    ];

    const bestResponse = allResponses.sort(
      (a, b) => b.confidence - a.confidence
    )[0];

    return "answer" in bestResponse.response
      ? (bestResponse.response as AssistantAnswer)
      : {
          answer: "Best response selected from multiple AI assistants",
          sources: [],
          insights: [],
          confidence: bestResponse.confidence,
          executionTime: 0,
        };
  }

  private async generateRecommendations(
    primary: AssistantAnswer | AIResponse,
    collaborative: Array<{
      assistant: AIAssistantType;
      response: AssistantAnswer | AIResponse;
      confidence: number;
    }>
  ): Promise<
    Array<{
      action: string;
      reasoning: string;
      confidence: number;
    }>
  > {
    const recommendations = [];

    // Generate recommendations based on response analysis
    if (this.extractConfidence(primary) < 0.7) {
      recommendations.push({
        action: "Request more specific information",
        reasoning: "Primary response has low confidence",
        confidence: 0.8,
      });
    }

    const hasHighConfidenceCollaborator = collaborative.some(
      c => c.confidence > 0.8
    );
    if (hasHighConfidenceCollaborator) {
      recommendations.push({
        action: "Consider alternative analysis approach",
        reasoning:
          "Collaborative assistant provided high-confidence alternative",
        confidence: 0.7,
      });
    }

    return recommendations;
  }

  /**
   * Initialize all assistant integrations
   */
  private initializeAssistants(): void {
    this.enhancedAssistant = EnhancedAIAssistantIntegration.getInstance();
    this.aiComponents = new AIComponentsIntegration();
    this.contextAware = ContextAwareAssistant.getInstance();
    this.nlpIntegration = new NavigationNLPIntegration();
  }

  /**
   * Setup event listeners and monitoring
   */
  private setupEventListeners(): void {
    // Initialize event listener maps
    Object.values([
      "assistant_request",
      "assistant_response",
      "workflow_start",
      "workflow_complete",
      "assistant_collaboration",
      "error",
      "performance_metric",
    ] as OrchestrationEventType[]).forEach(eventType => {
      this.eventListeners.set(eventType, []);
    });
  }

  /**
   * Event management
   */
  public addEventListener(
    eventType: OrchestrationEventType,
    listener: (event: OrchestrationEvent) => void
  ): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.push(listener);
    this.eventListeners.set(eventType, listeners);
  }

  private emitEvent(event: OrchestrationEvent): void {
    if (this.config.enableEventLogging) {
      console.log(`AI Orchestrator Event: ${event.type}`, event);
    }

    const listeners = this.eventListeners.get(event.type) || [];
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in event listener for ${event.type}:`, error);
      }
    });
  }

  /**
   * Public API methods
   */
  public async getStatus(): Promise<{
    isHealthy: boolean;
    activeRequests: number;
    queueLength: number;
    metrics: Map<AIAssistantType, any>;
  }> {
    return {
      isHealthy: true, // Could implement health checks
      activeRequests: this.activeRequests.size,
      queueLength: this.requestQueue.length,
      metrics: this.performanceMetrics,
    };
  }

  public updateConfig(newConfig: Partial<AIOrchestratorConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): AIOrchestratorConfig {
    return { ...this.config };
  }
}

// Export singleton instance getter
export const getAIOrchestrator = (config?: Partial<AIOrchestratorConfig>) =>
  AIOrchestrator.getInstance(config);

// Export convenience function for quick access
export async function orchestrateAIRequest(
  query: string,
  options: {
    type?: AIAssistantType;
    context?: any;
    priority?: "low" | "medium" | "high" | "critical";
    sessionId: string;
    userId: string;
  }
): Promise<OrchestratedResponse> {
  const orchestrator = getAIOrchestrator();

  const request: AssistantRequest = {
    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: options.type || "general",
    query,
    context: options.context,
    priority: options.priority || "medium",
    sessionId: options.sessionId,
    userId: options.userId,
    timestamp: new Date(),
  };

  return await orchestrator.orchestrateRequest(request);
}
