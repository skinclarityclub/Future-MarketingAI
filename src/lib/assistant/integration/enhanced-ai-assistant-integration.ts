/**
 * Enhanced AI Assistant Integration Service
 * Task 19.5: Seamless Integration with Existing AI Assistant
 *
 * This service provides a unified interface that seamlessly integrates
 * the Enhanced Context Awareness System (Task 19) with the existing
 * AI Assistant (Task 10), ensuring backward compatibility and smooth operation.
 */

import { ask as originalAsk } from "../assistant-service";
import { ContextAwareAssistant } from "../context/context-aware-assistant";
import { enhancedContextRecognitionIntegration } from "../context/enhanced-context-recognition-integration";
import { enhancedContextualDataIntegration } from "../context/enhanced-contextual-data-integration";
import type {
  AssistantAnswer,
  ConversationContext,
} from "../assistant-service";
import type {
  ContextAwareQuery,
  ContextAwareResponse,
} from "../context/context-aware-assistant";
import type {
  EnhancedContextualRequest,
  EnhancedContextualResponse,
} from "../context/enhanced-contextual-data-integration";

// Integration Configuration
export interface IntegrationConfig {
  enableEnhancedContext: boolean;
  enableMLProcessing: boolean;
  enableDataIntegration: boolean;
  fallbackToOriginal: boolean;
  performanceThreshold: number;
  confidenceThreshold: number;
}

// Enhanced Assistant Response combining both systems
export interface EnhancedAssistantResponse extends AssistantAnswer {
  // Original assistant fields preserved
  contextAware?: boolean;
  enhancedProcessing?: {
    contextRecognition?: any;
    mlEnhancements?: any;
    adaptiveResponse?: any;
    dataIntegration?: any;
  };
  performance?: {
    processingTime: number;
    systemUsed: "original" | "enhanced" | "hybrid";
    fallbackReason?: string;
  };
}

/**
 * Enhanced AI Assistant Integration Service
 * Provides intelligent routing between original and enhanced systems
 */
export class EnhancedAIAssistantIntegration {
  private static instance: EnhancedAIAssistantIntegration;
  private contextAwareAssistant: ContextAwareAssistant;
  private config: IntegrationConfig;

  private constructor(config: Partial<IntegrationConfig> = {}) {
    this.config = {
      enableEnhancedContext: true,
      enableMLProcessing: true,
      enableDataIntegration: true,
      fallbackToOriginal: true,
      performanceThreshold: 2000, // 2 seconds max for enhanced processing
      confidenceThreshold: 0.7,
      ...config,
    };

    this.contextAwareAssistant = ContextAwareAssistant.getInstance();
  }

  public static getInstance(
    config?: Partial<IntegrationConfig>
  ): EnhancedAIAssistantIntegration {
    if (!EnhancedAIAssistantIntegration.instance) {
      EnhancedAIAssistantIntegration.instance =
        new EnhancedAIAssistantIntegration(config);
    }
    return EnhancedAIAssistantIntegration.instance;
  }

  /**
   * Unified Ask Function - Intelligent routing between systems
   * Maintains compatibility with existing AI assistant while providing enhanced capabilities
   */
  async ask(
    question: string,
    context?:
      | ConversationContext
      | ContextAwareQuery
      | EnhancedContextualRequest
  ): Promise<EnhancedAssistantResponse> {
    const startTime = Date.now();

    try {
      // Analyze query complexity and determine optimal processing path
      const processingDecision = await this.determineProcessingStrategy(
        question,
        context
      );

      switch (processingDecision.strategy) {
        case "enhanced":
          return await this.processWithEnhancedSystem(
            question,
            context as ContextAwareQuery,
            startTime
          );

        case "enhanced-data":
          return await this.processWithEnhancedDataIntegration(
            question,
            context as EnhancedContextualRequest,
            startTime
          );

        case "hybrid":
          return await this.processWithHybridApproach(
            question,
            context,
            startTime
          );

        case "original":
        default:
          return await this.processWithOriginalSystem(
            question,
            context as ConversationContext,
            startTime
          );
      }
    } catch (error) {
      console.error("Enhanced AI Assistant Integration error:", error);

      // Fallback to original system in case of errors
      if (this.config.fallbackToOriginal) {
        return await this.processWithOriginalSystem(
          question,
          context as ConversationContext,
          startTime,
          error
        );
      }

      throw error;
    }
  }

  /**
   * Process with Enhanced Context Awareness System
   */
  private async processWithEnhancedSystem(
    question: string,
    context: ContextAwareQuery,
    startTime: number
  ): Promise<EnhancedAssistantResponse> {
    try {
      // Use enhanced context recognition integration
      const enhancedResponse =
        await enhancedContextRecognitionIntegration.askWithAdvancedContextRecognition(
          this.normalizeToContextAwareQuery(question, context)
        );

      return {
        answer: enhancedResponse.answer,
        sources: enhancedResponse.sources || [],
        insights: enhancedResponse.insights,
        confidence: enhancedResponse.confidence || 0.8,
        detailedExplanation: enhancedResponse.detailedExplanation,
        visualizationSuggestions: enhancedResponse.visualizationSuggestions,
        followUpQuestions: enhancedResponse.followUpQuestions,
        executionTime: Date.now() - startTime,
        contextAware: true,
        enhancedProcessing: {
          contextRecognition: enhancedResponse.contextRecognition,
          mlEnhancements: enhancedResponse.mlEnhancements,
          adaptiveResponse: enhancedResponse.adaptiveResponse,
        },
        performance: {
          processingTime: Date.now() - startTime,
          systemUsed: "enhanced",
        },
      };
    } catch (error) {
      console.error("Enhanced context processing failed:", error);

      if (this.config.fallbackToOriginal) {
        return await this.processWithOriginalSystem(
          question,
          context as ConversationContext,
          startTime,
          error
        );
      }

      throw error;
    }
  }

  /**
   * Process with Enhanced Data Integration
   */
  private async processWithEnhancedDataIntegration(
    question: string,
    context: EnhancedContextualRequest,
    startTime: number
  ): Promise<EnhancedAssistantResponse> {
    try {
      const enhancedResponse =
        await enhancedContextualDataIntegration.processEnhancedContextualRequest(
          this.normalizeToEnhancedContextualRequest(question, context)
        );

      return {
        answer: enhancedResponse.response,
        sources: enhancedResponse.metadata.sourcesUsed || [],
        insights: enhancedResponse.contextualData.insights,
        confidence: enhancedResponse.metadata.confidenceScore || 0.8,
        detailedExplanation:
          enhancedResponse.detailedAnalysis || enhancedResponse.response,
        visualizationSuggestions:
          enhancedResponse.contextualData.visualizationSuggestions || [],
        followUpQuestions:
          enhancedResponse.contextualData.followUpQuestions || [],
        executionTime: enhancedResponse.performance.totalProcessingTime,
        contextAware: true,
        enhancedProcessing: {
          dataIntegration: {
            sourcesUsed: enhancedResponse.metadata.sourcesUsed,
            totalRecords: enhancedResponse.contextualData.metadata.totalRecords,
            processingTime: enhancedResponse.performance.dataIntegrationTime,
          },
        },
        performance: {
          processingTime: enhancedResponse.performance.totalProcessingTime,
          systemUsed: "enhanced",
        },
      };
    } catch (error) {
      console.error("Enhanced data integration failed:", error);

      if (this.config.fallbackToOriginal) {
        return await this.processWithOriginalSystem(
          question,
          context as ConversationContext,
          startTime,
          error
        );
      }

      throw error;
    }
  }

  /**
   * Process with Hybrid Approach - Best of both systems
   */
  private async processWithHybridApproach(
    question: string,
    context: any,
    startTime: number
  ): Promise<EnhancedAssistantResponse> {
    try {
      // Process with both systems in parallel for comparison
      const [originalResponse, enhancedResponse] = await Promise.allSettled([
        this.processWithOriginalSystem(
          question,
          context as ConversationContext,
          startTime
        ),
        this.processWithEnhancedSystem(
          question,
          context as ContextAwareQuery,
          startTime
        ),
      ]);

      // Choose the best response based on confidence and performance
      if (
        enhancedResponse.status === "fulfilled" &&
        enhancedResponse.value.confidence &&
        enhancedResponse.value.confidence >= this.config.confidenceThreshold
      ) {
        return {
          ...enhancedResponse.value,
          performance: {
            ...enhancedResponse.value.performance,
            systemUsed: "hybrid",
          },
        };
      } else if (originalResponse.status === "fulfilled") {
        return {
          ...originalResponse.value,
          performance: {
            ...originalResponse.value.performance,
            systemUsed: "hybrid",
            fallbackReason: "Enhanced system confidence too low",
          },
        };
      } else {
        throw new Error("Both systems failed in hybrid processing");
      }
    } catch (error) {
      console.error("Hybrid processing failed:", error);
      return await this.processWithOriginalSystem(
        question,
        context as ConversationContext,
        startTime,
        error
      );
    }
  }

  /**
   * Process with Original System (Backward compatibility)
   */
  private async processWithOriginalSystem(
    question: string,
    context?: ConversationContext,
    startTime?: number,
    fallbackError?: any
  ): Promise<EnhancedAssistantResponse> {
    const processStartTime = startTime || Date.now();

    try {
      const originalResponse = await originalAsk(question, context);

      return {
        ...originalResponse,
        contextAware: false,
        performance: {
          processingTime: Date.now() - processStartTime,
          systemUsed: "original",
          fallbackReason: fallbackError ? "Enhanced system error" : undefined,
        },
      };
    } catch (error) {
      console.error("Original system also failed:", error);

      // Return minimal error response
      return {
        answer:
          "Sorry, ik kon geen antwoord genereren. Probeer het later opnieuw.",
        sources: [],
        confidence: 0,
        executionTime: Date.now() - processStartTime,
        contextAware: false,
        performance: {
          processingTime: Date.now() - processStartTime,
          systemUsed: "original",
          fallbackReason: "System error",
        },
      };
    }
  }

  /**
   * Determine optimal processing strategy based on query and context
   */
  private async determineProcessingStrategy(
    question: string,
    context?: any
  ): Promise<{
    strategy: "original" | "enhanced" | "enhanced-data" | "hybrid";
    reasoning: string;
  }> {
    // Simple heuristics for determining processing strategy
    const questionLength = question.length;
    const hasComplexContext =
      context &&
      (context.userProfile ||
        context.sessionMemory ||
        context.dataSourceOptions ||
        context.permissions);
    const hasDataRequest = this.containsDataRequest(question);
    const isComplexQuery =
      questionLength > 100 || this.isComplexBusinessQuery(question);

    // Decision logic
    if (!this.config.enableEnhancedContext) {
      return { strategy: "original", reasoning: "Enhanced context disabled" };
    }

    if (hasDataRequest && this.config.enableDataIntegration) {
      return {
        strategy: "enhanced-data",
        reasoning: "Data integration required",
      };
    }

    if (isComplexQuery || hasComplexContext) {
      if (this.config.enableMLProcessing) {
        return {
          strategy: "enhanced",
          reasoning: "Complex query benefits from ML processing",
        };
      } else {
        return { strategy: "hybrid", reasoning: "Complex query, ML disabled" };
      }
    }

    return {
      strategy: "original",
      reasoning: "Simple query, original system sufficient",
    };
  }

  /**
   * Helper functions for query analysis
   */
  private containsDataRequest(question: string): boolean {
    const dataKeywords = [
      "data",
      "metrics",
      "analytics",
      "dashboard",
      "reports",
      "kpi",
      "performance",
    ];
    return dataKeywords.some(keyword =>
      question.toLowerCase().includes(keyword)
    );
  }

  private isComplexBusinessQuery(question: string): boolean {
    const complexKeywords = [
      "analyze",
      "predict",
      "optimize",
      "strategy",
      "recommendation",
      "insight",
    ];
    return complexKeywords.some(keyword =>
      question.toLowerCase().includes(keyword)
    );
  }

  /**
   * Context normalization helpers
   */
  private normalizeToContextAwareQuery(
    question: string,
    context?: any
  ): ContextAwareQuery {
    return {
      query: question,
      userId: context?.userId || "anonymous",
      userRole: context?.userRole || "user",
      sessionId: context?.sessionId,
      preferences: context?.preferences || {},
      dashboardContext:
        context?.dashboardContext || context?.currentDashboardState,
      ...(context || {}),
    };
  }

  private normalizeToEnhancedContextualRequest(
    question: string,
    context?: any
  ): EnhancedContextualRequest {
    return {
      query: question,
      userId: context?.userId || "anonymous",
      userRole: context?.userRole || "user",
      conversationHistory: context?.conversationHistory || [],
      sessionMemory: context?.sessionMemory || {
        sessionId: context?.sessionId || "default",
        startTime: new Date(),
        activeTopics: [],
        userIntent: "general_query",
      },
      userProfile: context?.userProfile || {
        userId: context?.userId || "anonymous",
        communicationStyle: "professional",
        language: "en",
        timezone: "UTC",
      },
      permissions: context?.permissions || ["read"],
      contextualPreferences: context?.contextualPreferences,
      dataSourceOptions: context?.dataSourceOptions,
      ...(context || {}),
    };
  }

  /**
   * Configuration management
   */
  updateConfig(newConfig: Partial<IntegrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): IntegrationConfig {
    return { ...this.config };
  }

  /**
   * Health check for integration systems
   */
  async healthCheck(): Promise<{
    originalSystem: boolean;
    enhancedSystem: boolean;
    dataIntegration: boolean;
    overall: boolean;
  }> {
    try {
      const [originalTest, enhancedTest, dataTest] = await Promise.allSettled([
        originalAsk("test", undefined),
        this.contextAwareAssistant.askWithContext({
          query: "test",
          userId: "health-check",
          userRole: "user",
        }),
        enhancedContextualDataIntegration.processEnhancedContextualRequest({
          query: "test",
          userId: "health-check",
          userRole: "user",
          conversationHistory: [],
          sessionMemory: {
            sessionId: "health",
            startTime: new Date(),
            activeTopics: [],
            userIntent: "test",
          },
          userProfile: {
            userId: "health",
            communicationStyle: "professional",
            language: "en",
            timezone: "UTC",
          },
          permissions: ["read"],
        }),
      ]);

      return {
        originalSystem: originalTest.status === "fulfilled",
        enhancedSystem: enhancedTest.status === "fulfilled",
        dataIntegration: dataTest.status === "fulfilled",
        overall:
          originalTest.status === "fulfilled" &&
          enhancedTest.status === "fulfilled",
      };
    } catch (error) {
      console.error("Health check failed:", error);
      return {
        originalSystem: false,
        enhancedSystem: false,
        dataIntegration: false,
        overall: false,
      };
    }
  }
}

// Export singleton instance
export const enhancedAIAssistantIntegration =
  EnhancedAIAssistantIntegration.getInstance();

// Export unified ask function for backward compatibility
export async function ask(
  question: string,
  context?: ConversationContext | ContextAwareQuery | EnhancedContextualRequest
): Promise<EnhancedAssistantResponse> {
  return enhancedAIAssistantIntegration.ask(question, context);
}

export default enhancedAIAssistantIntegration;
