/**
 * Enhanced Context-Aware Assistant with ML Behavior Prediction
 * Integration of machine learning for user behavior prediction and context awareness
 * Task 18.3: Implement Machine Learning for User Behavior Prediction
 */

import {
  ContextAwareAssistant,
  type ContextAwareQuery,
  type ContextAwareResponse,
} from "./context-aware-assistant";
import {
  behaviorPredictionIntegration,
  type EnhancedContextAwareResponse,
} from "./behavior-prediction-integration";
import { userBehaviorPredictionEngine } from "../ml/user-behavior-prediction";
import { ContextRetentionEngine } from "./context-retention-engine";
import type { ConversationEntry, SessionMemory } from "./types";

export class EnhancedContextAwareAssistant {
  private static instance: EnhancedContextAwareAssistant;
  private baseAssistant: ContextAwareAssistant;
  private behaviorIntegration = behaviorPredictionIntegration;
  private contextEngine: ContextRetentionEngine;
  private predictionEngine = userBehaviorPredictionEngine;

  private constructor() {
    this.baseAssistant = ContextAwareAssistant.getInstance();
    this.contextEngine = ContextRetentionEngine.getInstance();
  }

  public static getInstance(): EnhancedContextAwareAssistant {
    if (!EnhancedContextAwareAssistant.instance) {
      EnhancedContextAwareAssistant.instance =
        new EnhancedContextAwareAssistant();
    }
    return EnhancedContextAwareAssistant.instance;
  }

  /**
   * Enhanced ask function with ML behavior prediction
   */
  async askWithMLPredictions(
    contextQuery: ContextAwareQuery
  ): Promise<EnhancedContextAwareResponse> {
    const startTime = Date.now();

    try {
      // Get base context-aware response
      const baseResponse =
        await this.baseAssistant.askWithContext(contextQuery);

      // Get session memory for prediction context
      const sessionMemory = baseResponse.sessionContext;
      if (!sessionMemory) {
        console.warn("No session memory available for ML predictions");
        return baseResponse;
      }

      // Enhance response with ML predictions
      const enhancedResponse =
        await this.behaviorIntegration.enhanceResponseWithPredictions(
          contextQuery,
          baseResponse,
          sessionMemory
        );

      // Store conversation entry for ML model training
      const conversationEntry: ConversationEntry = {
        id: `${contextQuery.userId}-${Date.now()}`,
        timestamp: new Date(),
        userQuery: contextQuery.query,
        assistantResponse: enhancedResponse.answer,
        context: {
          userRole: contextQuery.userRole,
          sessionId: sessionMemory.sessionId,
          ...contextQuery.dashboardContext,
        },
        queryType: this.classifyQueryType(contextQuery.query),
        confidence: enhancedResponse.confidence || 0.7,
        responseTime: Date.now() - startTime,
        followUp: false,
      };

      // Update user behavior model with new conversation data
      await this.behaviorIntegration.updateModelWithConversation(
        contextQuery.userId,
        conversationEntry,
        sessionMemory
      );

      // Add ML insights to response
      if (
        enhancedResponse.behaviorPredictions &&
        enhancedResponse.behaviorPredictions.length > 0
      ) {
        const mlInsights = enhancedResponse.behaviorPredictions
          .filter(p => p.confidence > 0.6)
          .map(
            p =>
              `ML Prediction: ${p.predictedAction} (${(p.confidence * 100).toFixed(1)}% confidence)`
          )
          .slice(0, 2);

        enhancedResponse.learningInsights = [
          ...(enhancedResponse.learningInsights || []),
          ...mlInsights,
        ];
      }

      // Enhance follow-up questions with ML predictions
      if (
        enhancedResponse.predictedFollowUps &&
        enhancedResponse.predictedFollowUps.length > 0
      ) {
        const existingFollowUps = enhancedResponse.followUpQuestions || [];
        enhancedResponse.followUpQuestions = [
          ...new Set([
            ...enhancedResponse.predictedFollowUps.slice(0, 3),
            ...existingFollowUps,
          ]),
        ].slice(0, 5);
      }

      return enhancedResponse;
    } catch (error) {
      console.error("Enhanced context-aware assistant error:", error);

      // Fallback to base assistant if ML enhancement fails
      try {
        return await this.baseAssistant.askWithContext(contextQuery);
      } catch (fallbackError) {
        console.error("Base assistant fallback error:", fallbackError);
        return {
          answer:
            "I apologize, but I encountered an issue processing your request. Please try again.",
          sources: [],
          confidence: 0.1,
          executionTime: Date.now() - startTime,
        };
      }
    }
  }

  /**
   * Get personalized insights for user dashboard
   */
  async getPersonalizedInsights(
    userId: string,
    context?: Record<string, any>
  ): Promise<{
    behaviorInsights: Array<{
      type: string;
      title: string;
      description: string;
      confidence: number;
      actionable: boolean;
    }>;
    recommendedActions: Array<{
      category: string;
      action: string;
      reasoning: string[];
      priority: "high" | "medium" | "low";
    }>;
    predictedNeeds: Array<{
      need: string;
      timeframe: string;
      confidence: number;
    }>;
  }> {
    try {
      // Get recommended response style
      const responseStyle =
        await this.predictionEngine.getRecommendedResponseStyle(userId);

      // Get personalized recommendations
      const sessionMemory = await this.getRecentSession(userId);
      if (!sessionMemory) {
        return {
          behaviorInsights: [],
          recommendedActions: [],
          predictedNeeds: [],
        };
      }

      const predictionContext = {
        currentSession: sessionMemory,
        recentQueries: [],
        timeContext: {
          hour: new Date().getHours(),
          dayOfWeek: new Date().getDay(),
          timeInSession: 0,
        },
        environmentContext: context || {},
      };

      const personalizedRecommendations =
        await this.predictionEngine.getPersonalizedRecommendations(
          userId,
          predictionContext
        );

      // Get behavior predictions
      const behaviorPredictions =
        await this.predictionEngine.predictUserBehavior(
          userId,
          predictionContext,
          ["query_type", "content_preference", "timing_pattern"]
        );

      return {
        behaviorInsights: behaviorPredictions.map(prediction => ({
          type: prediction.category,
          title: this.generateInsightTitle(prediction.category),
          description: prediction.predictedAction,
          confidence: prediction.confidence,
          actionable: prediction.confidence > 0.7,
        })),
        recommendedActions: [
          {
            category: "Content Preference",
            action: `Optimize for ${responseStyle.style} communication style`,
            reasoning: responseStyle.reasoning,
            priority: responseStyle.confidence > 0.8 ? "high" : "medium",
          },
          {
            category: "Dashboard Setup",
            action: `Configure dashboard with ${personalizedRecommendations.dashboardWidgets.join(", ")}`,
            reasoning: [
              "Based on historical usage patterns",
              "Aligned with user expertise level",
            ],
            priority: "medium",
          },
        ],
        predictedNeeds: behaviorPredictions
          .filter(
            p => p.timeframe === "immediate" || p.timeframe === "short_term"
          )
          .map(p => ({
            need: p.predictedAction,
            timeframe: p.timeframe,
            confidence: p.confidence,
          })),
      };
    } catch (error) {
      console.error("Error getting personalized insights:", error);
      return {
        behaviorInsights: [],
        recommendedActions: [],
        predictedNeeds: [],
      };
    }
  }

  /**
   * Analyze user behavior for admin dashboard
   */
  async analyzeUserBehavior(userId: string): Promise<{
    patterns: Array<{
      type: string;
      description: string;
      frequency: number;
      trend: "increasing" | "decreasing" | "stable";
    }>;
    recommendations: Array<{
      category: string;
      suggestion: string;
      impact: "high" | "medium" | "low";
    }>;
    expertiseProfile: {
      overall: number;
      domains: Record<string, number>;
      communicationPreferences: Record<string, number>;
    };
  }> {
    try {
      // Get user behavior analysis - mock implementation for now
      return {
        patterns: [
          {
            type: "Query Timing",
            description:
              "User is most active during business hours (9 AM - 5 PM)",
            frequency: 0.85,
            trend: "stable",
          },
          {
            type: "Content Preference",
            description: "Strong preference for visual data representations",
            frequency: 0.75,
            trend: "increasing",
          },
          {
            type: "Interaction Style",
            description: "Prefers detailed explanations with examples",
            frequency: 0.68,
            trend: "stable",
          },
        ],
        recommendations: [
          {
            category: "UI/UX",
            suggestion:
              "Pre-load dashboard during off-peak hours for faster performance",
            impact: "medium",
          },
          {
            category: "Content Strategy",
            suggestion:
              "Prioritize chart-based responses over text-heavy explanations",
            impact: "high",
          },
          {
            category: "Personalization",
            suggestion:
              "Provide more detailed context and examples in responses",
            impact: "medium",
          },
        ],
        expertiseProfile: {
          overall: 0.7,
          domains: {
            analytics: 0.8,
            finance: 0.6,
            marketing: 0.7,
            operations: 0.5,
          },
          communicationPreferences: {
            conciseness: 0.3,
            technicalDepth: 0.8,
            visualPreference: 0.9,
            formality: 0.6,
          },
        },
      };
    } catch (error) {
      console.error("Error analyzing user behavior:", error);
      return {
        patterns: [],
        recommendations: [],
        expertiseProfile: {
          overall: 0.5,
          domains: {},
          communicationPreferences: {},
        },
      };
    }
  }

  /**
   * Get proactive suggestions based on current context
   */
  async getProactiveSuggestions(
    userId: string,
    currentContext: Record<string, any>
  ): Promise<{
    suggestions: Array<{
      type: "question" | "insight" | "action";
      title: string;
      description: string;
      confidence: number;
      urgent: boolean;
    }>;
    warnings: Array<{
      message: string;
      severity: "low" | "medium" | "high";
      category: string;
    }>;
  }> {
    try {
      const sessionMemory = await this.getRecentSession(userId);
      if (!sessionMemory) {
        return { suggestions: [], warnings: [] };
      }

      const predictionContext = {
        currentSession: sessionMemory,
        recentQueries: [],
        timeContext: {
          hour: new Date().getHours(),
          dayOfWeek: new Date().getDay(),
          timeInSession: 0,
        },
        environmentContext: currentContext,
      };

      const predictions = await this.predictionEngine.predictUserBehavior(
        userId,
        predictionContext,
        ["query_type", "content_preference", "interaction_pattern"]
      );

      const suggestions = predictions
        .filter(p => p.confidence > 0.6)
        .map(p => ({
          type: this.mapPredictionToSuggestionType(p.category),
          title: this.generateSuggestionTitle(p.category),
          description: p.predictedAction,
          confidence: p.confidence,
          urgent: p.confidence > 0.8 && p.timeframe === "immediate",
        }));

      const warnings = predictions
        .filter(p => p.confidence > 0.8 && p.category === "timing_pattern")
        .map(p => ({
          message: `Predicted high activity: ${p.predictedAction}`,
          severity: "medium" as const,
          category: p.category,
        }));

      return { suggestions, warnings };
    } catch (error) {
      console.error("Error getting proactive suggestions:", error);
      return { suggestions: [], warnings: [] };
    }
  }

  // Private helper methods
  private classifyQueryType(
    query: string
  ): "simple" | "complex" | "clarification" {
    const complexIndicators = [
      /\b(why|how|what if|analyze|compare|optimize|predict)\b/i,
      /\b(correlation|relationship|impact|trend)\b/i,
    ];

    const clarificationIndicators = [
      /\b(can you explain|what do you mean|clarify)\b/i,
      /^(yes|no|maybe|exactly|correct)\b/i,
    ];

    if (clarificationIndicators.some(pattern => pattern.test(query))) {
      return "clarification";
    }

    if (complexIndicators.some(pattern => pattern.test(query))) {
      return "complex";
    }

    return "simple";
  }

  private async getRecentSession(
    userId: string
  ): Promise<SessionMemory | null> {
    try {
      // Mock implementation - in production, get from database
      return {
        sessionId: `session-${userId}-${Date.now()}`,
        userId,
        startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        lastActivity: new Date(),
        activeTopics: ["analytics", "performance"],
        userIntent: "analysis",
        contextSummary: "User analyzing performance metrics",
        queries: [], // Add required queries field
      };
    } catch (error) {
      console.error("Error getting recent session:", error);
      return null;
    }
  }

  private generateInsightTitle(category: string): string {
    const titleMap: Record<string, string> = {
      query_type: "Query Pattern Insight",
      content_preference: "Content Preference Analysis",
      interaction_pattern: "Interaction Behavior",
      timing_pattern: "Usage Timing Pattern",
    };
    return titleMap[category] || "Behavioral Insight";
  }

  private mapPredictionToSuggestionType(
    category: string
  ): "question" | "insight" | "action" {
    const typeMap: Record<string, "question" | "insight" | "action"> = {
      query_type: "question",
      content_preference: "insight",
      interaction_pattern: "action",
      timing_pattern: "insight",
    };
    return typeMap[category] || "insight";
  }

  private generateSuggestionTitle(category: string): string {
    const titleMap: Record<string, string> = {
      query_type: "Suggested Next Question",
      content_preference: "Content Recommendation",
      interaction_pattern: "Suggested Action",
      timing_pattern: "Usage Optimization",
    };
    return titleMap[category] || "Suggestion";
  }
}

// Export singleton instance
export const enhancedContextAwareAssistant =
  EnhancedContextAwareAssistant.getInstance();
