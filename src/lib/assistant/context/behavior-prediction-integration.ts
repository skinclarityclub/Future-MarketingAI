/**
 * Behavior Prediction Integration
 * Integration layer between ML behavior prediction and context-aware assistant
 * Task 18.3: Implement Machine Learning for User Behavior Prediction
 */

import {
  userBehaviorPredictionEngine,
  type BehaviorPrediction,
  type BehaviorPredictionContext,
} from "../ml/user-behavior-prediction";
import { ContextRetentionEngine } from "./context-retention-engine";
import type { ConversationEntry, SessionMemory } from "./types";
import type {
  ContextAwareQuery,
  ContextAwareResponse,
} from "./context-aware-assistant";

export interface EnhancedContextAwareResponse extends ContextAwareResponse {
  behaviorPredictions?: BehaviorPrediction[];
  predictedFollowUps?: string[];
  recommendedResponseStyle?: {
    style: string;
    reasoning: string[];
    confidence: number;
  };
}

export class BehaviorPredictionIntegration {
  private static instance: BehaviorPredictionIntegration;
  private contextEngine: ContextRetentionEngine;
  private predictionEngine = userBehaviorPredictionEngine;

  private constructor() {
    this.contextEngine = ContextRetentionEngine.getInstance();
  }

  public static getInstance(): BehaviorPredictionIntegration {
    if (!BehaviorPredictionIntegration.instance) {
      BehaviorPredictionIntegration.instance =
        new BehaviorPredictionIntegration();
    }
    return BehaviorPredictionIntegration.instance;
  }

  /**
   * Enhance a context-aware response with ML behavior predictions
   */
  async enhanceResponseWithPredictions(
    query: ContextAwareQuery,
    baseResponse: ContextAwareResponse,
    sessionMemory: SessionMemory
  ): Promise<EnhancedContextAwareResponse> {
    try {
      // Create behavior prediction context
      const predictionContext = await this.createPredictionContext(
        query,
        sessionMemory
      );

      // Generate behavior predictions
      const behaviorPredictions =
        await this.predictionEngine.predictUserBehavior(
          query.userId,
          predictionContext,
          ["query_type", "content_preference"]
        );

      // Get recommended response style
      const recommendedResponseStyle =
        await this.predictionEngine.getRecommendedResponseStyle(query.userId);

      // Predict follow-up questions
      const predictedFollowUps =
        await this.predictionEngine.predictFollowUpQuestions(
          query.userId,
          query.query,
          predictionContext
        );

      return {
        ...baseResponse,
        behaviorPredictions,
        predictedFollowUps,
        recommendedResponseStyle,
      };
    } catch (error) {
      console.error("Error enhancing response with predictions:", error);
      return baseResponse;
    }
  }

  /**
   * Update ML model with new conversation data
   */
  async updateModelWithConversation(
    userId: string,
    conversationEntry: ConversationEntry,
    sessionMemory: SessionMemory
  ): Promise<void> {
    try {
      await this.predictionEngine.updateUserModel(
        userId,
        conversationEntry,
        sessionMemory
      );
    } catch (error) {
      console.error("Error updating user behavior model:", error);
    }
  }

  /**
   * Get proactive insights for user dashboard
   */
  async getProactiveInsights(
    userId: string,
    currentContext?: Record<string, any>
  ): Promise<{
    insights: Array<{
      type: "suggestion" | "warning" | "opportunity";
      title: string;
      description: string;
      confidence: number;
      actionable: boolean;
      metadata: Record<string, any>;
    }>;
    urgentNotifications: Array<{
      message: string;
      priority: "high" | "medium" | "low";
      category: string;
    }>;
  }> {
    try {
      // Get current session or create mock context
      const sessionMemory = await this.getMostRecentSession(userId);
      if (!sessionMemory) {
        return { insights: [], urgentNotifications: [] };
      }

      const predictionContext = await this.createPredictionContext(
        { userId, query: "", sessionId: sessionMemory.sessionId },
        sessionMemory
      );

      // Get behavior predictions
      const predictions = await this.predictionEngine.predictUserBehavior(
        userId,
        predictionContext,
        ["query_type", "content_preference", "timing_pattern"]
      );

      // Convert predictions to actionable insights
      const insights = predictions.map(prediction => ({
        type: this.mapPredictionToInsightType(prediction),
        title: this.generateInsightTitle(prediction),
        description: prediction.predictedAction,
        confidence: prediction.confidence,
        actionable: this.isActionablePrediction(prediction),
        metadata: prediction.metadata,
      }));

      // Generate urgent notifications for high-confidence predictions
      const urgentNotifications = predictions
        .filter(p => p.confidence > 0.8 && p.timeframe === "immediate")
        .map(p => ({
          message: `Predicted user need: ${p.predictedAction}`,
          priority: "high" as const,
          category: p.category,
        }));

      return { insights, urgentNotifications };
    } catch (error) {
      console.error("Error getting proactive insights:", error);
      return { insights: [], urgentNotifications: [] };
    }
  }

  /**
   * Analyze user behavior patterns for admin dashboard
   */
  async analyzeUserBehaviorPatterns(userId: string): Promise<{
    patterns: Array<{
      type: string;
      description: string;
      frequency: number;
      confidence: number;
      trend: "increasing" | "decreasing" | "stable";
    }>;
    recommendations: Array<{
      category: string;
      suggestion: string;
      impact: "high" | "medium" | "low";
      implementation: string;
    }>;
    expertiseProfile: {
      overall: number;
      domains: Record<string, number>;
      learningRate: number;
    };
  }> {
    try {
      // This would typically analyze historical data
      // For now, return mock data structure
      return {
        patterns: [
          {
            type: "Query Timing",
            description:
              "User typically asks questions in the morning (9-11 AM)",
            frequency: 0.7,
            confidence: 0.8,
            trend: "stable",
          },
          {
            type: "Content Preference",
            description: "Strong preference for visual data representations",
            frequency: 0.9,
            confidence: 0.9,
            trend: "increasing",
          },
        ],
        recommendations: [
          {
            category: "UI/UX",
            suggestion: "Prepare dashboard widgets for morning sessions",
            impact: "medium",
            implementation:
              "Pre-load relevant charts and data during low-usage periods",
          },
          {
            category: "Content",
            suggestion:
              "Prioritize visual responses over text-heavy explanations",
            impact: "high",
            implementation:
              "Increase chart generation and reduce narrative explanations",
          },
        ],
        expertiseProfile: {
          overall: 0.6,
          domains: {
            analytics: 0.8,
            finance: 0.5,
            marketing: 0.7,
          },
          learningRate: 0.6,
        },
      };
    } catch (error) {
      console.error("Error analyzing user behavior patterns:", error);
      return {
        patterns: [],
        recommendations: [],
        expertiseProfile: { overall: 0.5, domains: {}, learningRate: 0.5 },
      };
    }
  }

  // Private helper methods
  private async createPredictionContext(
    query: ContextAwareQuery,
    sessionMemory: SessionMemory
  ): Promise<BehaviorPredictionContext> {
    const now = new Date();
    const sessionStart =
      sessionMemory.startTime instanceof Date
        ? sessionMemory.startTime
        : new Date(sessionMemory.startTime);

    return {
      currentSession: sessionMemory,
      recentQueries: [query.query],
      timeContext: {
        hour: now.getHours(),
        dayOfWeek: now.getDay(),
        timeInSession: Math.floor(
          (now.getTime() - sessionStart.getTime()) / 1000 / 60
        ),
      },
      environmentContext: {
        userRole: query.userRole || "user",
        dashboardContext: query.dashboardContext || {},
      },
    };
  }

  private async getMostRecentSession(
    userId: string
  ): Promise<SessionMemory | null> {
    try {
      // Get the most recent session for the user
      const sessions = await this.contextEngine.getActiveSessions(userId);
      return sessions.length > 0 ? sessions[0] : null;
    } catch (error) {
      console.error("Error getting recent session:", error);
      return null;
    }
  }

  private mapPredictionToInsightType(
    prediction: BehaviorPrediction
  ): "suggestion" | "warning" | "opportunity" {
    if (prediction.confidence > 0.8) return "opportunity";
    if (prediction.category === "timing_pattern") return "suggestion";
    return "suggestion";
  }

  private generateInsightTitle(prediction: BehaviorPrediction): string {
    switch (prediction.category) {
      case "query_type":
        return "Predicted Query Interest";
      case "content_preference":
        return "Content Preference Insight";
      case "interaction_pattern":
        return "Interaction Pattern";
      case "timing_pattern":
        return "Usage Pattern";
      default:
        return "Behavioral Insight";
    }
  }

  private isActionablePrediction(prediction: BehaviorPrediction): boolean {
    return prediction.confidence > 0.6 && prediction.timeframe !== "long_term";
  }
}

// Export singleton instance
export const behaviorPredictionIntegration =
  BehaviorPredictionIntegration.getInstance();
