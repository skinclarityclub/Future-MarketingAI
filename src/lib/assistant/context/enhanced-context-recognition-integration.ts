/**
 * Enhanced Context Recognition Integration
 * Integration layer for advanced ML-based context recognition
 * Task 19.3: Develop Machine Learning Models for Context Recognition
 */

import {
  ContextAwareAssistant,
  type ContextAwareQuery,
  type ContextAwareResponse,
} from "./context-aware-assistant";
import {
  contextRecognitionEngine,
  type ContextPrediction,
  type SemanticAnalysis,
} from "../ml/context-recognition-models";
import { userBehaviorPredictionEngine } from "../ml/user-behavior-prediction";
import { ContextRetentionEngine } from "./context-retention-engine";
import type { ConversationEntry, SessionMemory, UserProfile } from "./types";

export interface EnhancedContextResponse extends ContextAwareResponse {
  contextRecognition?: {
    semanticAnalysis: SemanticAnalysis;
    contextPrediction: ContextPrediction;
    processingTime: number;
    modelConfidence: number;
  };
  mlEnhancements?: {
    predictedIntent: string;
    businessImplication: string;
    suggestedActions: string[];
    expectedFollowUp: string[];
    relatedTopics: string[];
  };
  adaptiveResponse?: {
    personalizedTone: string;
    expertiseAdjustment: string;
    languagePreference: "en" | "nl";
    contextualHints: string[];
  };
}

export class EnhancedContextRecognitionIntegration {
  private static instance: EnhancedContextRecognitionIntegration;
  private baseAssistant: ContextAwareAssistant;
  private contextEngine: ContextRetentionEngine;
  private behaviorEngine = userBehaviorPredictionEngine;

  private constructor() {
    this.baseAssistant = ContextAwareAssistant.getInstance();
    this.contextEngine = ContextRetentionEngine.getInstance();
  }

  public static getInstance(): EnhancedContextRecognitionIntegration {
    if (!EnhancedContextRecognitionIntegration.instance) {
      EnhancedContextRecognitionIntegration.instance =
        new EnhancedContextRecognitionIntegration();
    }
    return EnhancedContextRecognitionIntegration.instance;
  }

  /**
   * Enhanced ask function with advanced ML context recognition
   */
  async askWithAdvancedContextRecognition(
    contextQuery: ContextAwareQuery
  ): Promise<EnhancedContextResponse> {
    const startTime = Date.now();

    try {
      // Get base context-aware response
      const baseResponse =
        await this.baseAssistant.askWithContext(contextQuery);

      if (!baseResponse.sessionContext) {
        console.warn("No session context available for ML enhancement");
        return baseResponse;
      }

      // Get user profile and session memory
      const userProfile = await this.contextEngine.getUserProfile(
        contextQuery.userId
      );
      const sessionMemory = baseResponse.sessionContext;
      const conversationHistory = await this.getConversationHistory(
        contextQuery.userId,
        sessionMemory.sessionId
      );

      // Perform advanced ML context recognition
      const contextRecognitionResult =
        await contextRecognitionEngine.recognizeContext(
          contextQuery.query,
          conversationHistory,
          userProfile,
          sessionMemory,
          contextQuery.userRole || "user",
          this.extractPermissions(contextQuery)
        );

      // Enhance response with ML insights
      const mlEnhancements = this.createMLEnhancements(
        contextRecognitionResult.contextPrediction,
        contextRecognitionResult.semanticAnalysis
      );

      // Create adaptive response based on user profile and context
      const adaptiveResponse = this.createAdaptiveResponse(
        contextRecognitionResult.semanticAnalysis,
        userProfile,
        contextQuery
      );

      // Update behavior prediction models with new interaction
      await this.updateModelsWithInteraction(
        contextQuery,
        baseResponse,
        contextRecognitionResult,
        sessionMemory
      );

      const processingTime = Date.now() - startTime;

      return {
        ...baseResponse,
        contextRecognition: {
          semanticAnalysis: contextRecognitionResult.semanticAnalysis,
          contextPrediction: contextRecognitionResult.contextPrediction,
          processingTime: contextRecognitionResult.processingTime,
          modelConfidence: contextRecognitionResult.confidence,
        },
        mlEnhancements,
        adaptiveResponse,
        confidence: this.calculateEnhancedConfidence(
          baseResponse.confidence || 0.7,
          contextRecognitionResult.confidence
        ),
        metadata: {
          ...baseResponse.metadata,
          mlProcessingTime: processingTime,
          enhancedWithML: true,
          modelVersion: "1.0.0",
        },
      };
    } catch (error) {
      console.error("Enhanced context recognition failed:", error);
      // Fallback to base response
      const baseResponse =
        await this.baseAssistant.askWithContext(contextQuery);
      return {
        ...baseResponse,
        metadata: {
          ...baseResponse.metadata,
          mlEnhancementFailed: true,
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Analyze query complexity and recommend processing approach
   */
  async analyzeQueryComplexity(
    query: string,
    userProfile: UserProfile,
    conversationHistory: ConversationEntry[]
  ): Promise<{
    complexity: number;
    recommendedProcessing: "simple" | "enhanced" | "expert";
    reasoning: string[];
    estimatedProcessingTime: number;
  }> {
    try {
      // Quick semantic analysis for complexity estimation
      const semanticAnalysis =
        await contextRecognitionEngine.analyzeSemanticRoles(
          query,
          userProfile.preferredLanguage || "en",
          userProfile.businessFocus || []
        );

      const complexity = semanticAnalysis.businessIntent.complexity;
      const entityCount = semanticAnalysis.entities.length;
      const domainRelevanceSum = Object.values(
        semanticAnalysis.domainRelevance
      ).reduce((sum, score) => sum + score, 0);

      let recommendedProcessing: "simple" | "enhanced" | "expert" = "simple";
      const reasoning: string[] = [];

      if (complexity > 0.8 || entityCount > 5) {
        recommendedProcessing = "expert";
        reasoning.push(
          "High complexity detected",
          "Multiple business entities identified"
        );
      } else if (complexity > 0.5 || domainRelevanceSum > 2.0) {
        recommendedProcessing = "enhanced";
        reasoning.push(
          "Moderate complexity",
          "Domain-specific knowledge required"
        );
      } else {
        reasoning.push("Low complexity", "Standard processing sufficient");
      }

      const estimatedProcessingTime = this.estimateProcessingTime(
        complexity,
        entityCount,
        recommendedProcessing
      );

      return {
        complexity,
        recommendedProcessing,
        reasoning,
        estimatedProcessingTime,
      };
    } catch (error) {
      console.error("Query complexity analysis failed:", error);
      return {
        complexity: 0.5,
        recommendedProcessing: "simple",
        reasoning: ["Fallback due to analysis error"],
        estimatedProcessingTime: 500,
      };
    }
  }

  /**
   * Get contextual insights for a user's session
   */
  async getContextualInsights(
    userId: string,
    sessionId: string
  ): Promise<{
    sessionSummary: string;
    identifiedPatterns: string[];
    suggestedTopics: string[];
    nextSteps: string[];
    expertiseAssessment: string;
  }> {
    try {
      const userProfile = await this.contextEngine.getUserProfile(userId);
      const sessionMemory =
        await this.contextEngine.getSessionMemory(sessionId);
      const conversationHistory = await this.getConversationHistory(
        userId,
        sessionId
      );

      // Analyze session patterns
      const sessionPatterns =
        await this.analyzeSessionPatterns(conversationHistory);

      // Generate session summary
      const sessionSummary = this.generateSessionSummary(
        conversationHistory,
        sessionPatterns
      );

      // Identify user's expertise level progression
      const expertiseAssessment = this.assessExpertiseProgression(
        conversationHistory,
        userProfile
      );

      // Suggest next topics based on conversation flow
      const suggestedTopics = this.suggestNextTopics(
        conversationHistory,
        sessionPatterns,
        userProfile
      );

      // Recommend next steps
      const nextSteps = this.recommendNextSteps(
        sessionPatterns,
        userProfile,
        conversationHistory
      );

      return {
        sessionSummary,
        identifiedPatterns: sessionPatterns.map(p => p.description),
        suggestedTopics,
        nextSteps,
        expertiseAssessment,
      };
    } catch (error) {
      console.error("Contextual insights generation failed:", error);
      return {
        sessionSummary: "Unable to generate session summary",
        identifiedPatterns: [],
        suggestedTopics: ["Continue with your current analysis"],
        nextSteps: ["Ask more specific questions"],
        expertiseAssessment: "Assessment unavailable",
      };
    }
  }

  // Private helper methods
  private async getConversationHistory(
    userId: string,
    sessionId: string,
    limit: number = 10
  ): Promise<ConversationEntry[]> {
    try {
      // Get conversation history from context engine
      const sessionMemory =
        await this.contextEngine.getSessionMemory(sessionId);

      // Return recent conversations (would normally fetch from database)
      return sessionMemory.conversations?.slice(-limit) || [];
    } catch (error) {
      console.error("Failed to get conversation history:", error);
      return [];
    }
  }

  private extractPermissions(contextQuery: ContextAwareQuery): string[] {
    // Extract permissions from query context
    return contextQuery.dashboardContext?.permissions || [];
  }

  private createMLEnhancements(
    contextPrediction: ContextPrediction,
    semanticAnalysis: SemanticAnalysis
  ): EnhancedContextResponse["mlEnhancements"] {
    return {
      predictedIntent: contextPrediction.userIntent.goal,
      businessImplication: contextPrediction.businessImplication,
      suggestedActions: contextPrediction.suggestedActions,
      expectedFollowUp: contextPrediction.expectedFollowUp,
      relatedTopics: contextPrediction.relatedTopics,
    };
  }

  private createAdaptiveResponse(
    semanticAnalysis: SemanticAnalysis,
    userProfile: UserProfile,
    contextQuery: ContextAwareQuery
  ): EnhancedContextResponse["adaptiveResponse"] {
    const businessIntent = semanticAnalysis.businessIntent;

    // Determine personalized tone based on user expertise and business context
    let personalizedTone = "professional";
    if (businessIntent.requiredExpertise === "beginner") {
      personalizedTone = "explanatory";
    } else if (businessIntent.requiredExpertise === "expert") {
      personalizedTone = "technical";
    }

    // Adjust for user's expertise level
    const userExpertise = userProfile.expertiseLevel || "intermediate";
    let expertiseAdjustment = "standard";
    if (userExpertise === "beginner" && businessIntent.complexity > 0.6) {
      expertiseAdjustment = "simplified";
    } else if (userExpertise === "expert") {
      expertiseAdjustment = "detailed";
    }

    // Determine language preference
    const languagePreference: "en" | "nl" =
      (userProfile.preferredLanguage as "en" | "nl") || "en";

    // Generate contextual hints
    const contextualHints = this.generateContextualHints(
      semanticAnalysis,
      userProfile,
      contextQuery
    );

    return {
      personalizedTone,
      expertiseAdjustment,
      languagePreference,
      contextualHints,
    };
  }

  private generateContextualHints(
    semanticAnalysis: SemanticAnalysis,
    userProfile: UserProfile,
    contextQuery: ContextAwareQuery
  ): string[] {
    const hints: string[] = [];

    // Based on business intent
    const intent = semanticAnalysis.businessIntent;
    if (intent.urgency === "high" || intent.urgency === "critical") {
      hints.push("This appears to be a time-sensitive request");
    }

    // Based on user's business focus
    const businessFocus = userProfile.businessFocus || [];
    if (businessFocus.length > 0) {
      const relevantFocus = businessFocus.find(
        focus => semanticAnalysis.domainRelevance[focus] > 0.7
      );
      if (relevantFocus) {
        hints.push(`This aligns with your ${relevantFocus} focus area`);
      }
    }

    // Based on complexity
    if (intent.complexity > 0.7) {
      hints.push("This is a complex topic that may require multiple steps");
    }

    return hints.slice(0, 3); // Limit to top 3 hints
  }

  private calculateEnhancedConfidence(
    baseConfidence: number,
    mlConfidence: number
  ): number {
    // Weighted average with higher weight on ML confidence if it's high
    if (mlConfidence > 0.8) {
      return baseConfidence * 0.3 + mlConfidence * 0.7;
    } else {
      return baseConfidence * 0.7 + mlConfidence * 0.3;
    }
  }

  private estimateProcessingTime(
    complexity: number,
    entityCount: number,
    processingType: "simple" | "enhanced" | "expert"
  ): number {
    let baseTime = 200; // Base processing time in ms

    // Adjust for complexity
    baseTime += complexity * 300;

    // Adjust for entity count
    baseTime += entityCount * 50;

    // Adjust for processing type
    switch (processingType) {
      case "expert":
        baseTime *= 2.0;
        break;
      case "enhanced":
        baseTime *= 1.5;
        break;
      default:
        break;
    }

    return Math.round(baseTime);
  }

  private async updateModelsWithInteraction(
    contextQuery: ContextAwareQuery,
    baseResponse: ContextAwareResponse,
    contextRecognitionResult: any,
    sessionMemory: SessionMemory
  ): Promise<void> {
    try {
      const conversationEntry: ConversationEntry = {
        id: `${contextQuery.userId}-${Date.now()}`,
        timestamp: new Date(),
        userQuery: contextQuery.query,
        assistantResponse: baseResponse.answer,
        context: {
          userRole: contextQuery.userRole,
          sessionId: sessionMemory.sessionId,
          ...contextQuery.dashboardContext,
        },
        queryType:
          contextRecognitionResult.semanticAnalysis.businessIntent
            .businessCategory,
        confidence: contextRecognitionResult.confidence,
        responseTime: contextRecognitionResult.processingTime,
        followUp: false,
      };

      // Update context recognition models
      await contextRecognitionEngine.trainWithConversation(conversationEntry);

      // Update behavior prediction models
      await this.behaviorEngine.updateUserModel(
        contextQuery.userId,
        conversationEntry,
        sessionMemory
      );
    } catch (error) {
      console.error("Failed to update models with interaction:", error);
    }
  }

  private async analyzeSessionPatterns(
    conversationHistory: ConversationEntry[]
  ): Promise<Array<{ type: string; description: string; confidence: number }>> {
    // Analyze patterns in conversation history
    const patterns: Array<{
      type: string;
      description: string;
      confidence: number;
    }> = [];

    if (conversationHistory.length >= 3) {
      // Look for topic progression
      const topics = conversationHistory.map(conv => conv.queryType);
      const uniqueTopics = new Set(topics);

      if (uniqueTopics.size === 1) {
        patterns.push({
          type: "focused_inquiry",
          description: `Focused discussion on ${topics[0]}`,
          confidence: 0.8,
        });
      } else if (uniqueTopics.size > topics.length * 0.7) {
        patterns.push({
          type: "exploratory",
          description: "Exploratory conversation across multiple topics",
          confidence: 0.7,
        });
      }
    }

    return patterns;
  }

  private generateSessionSummary(
    conversationHistory: ConversationEntry[],
    patterns: Array<{ type: string; description: string; confidence: number }>
  ): string {
    if (conversationHistory.length === 0) {
      return "No conversation activity in this session";
    }

    const queryCount = conversationHistory.length;
    const topics = [
      ...new Set(conversationHistory.map(conv => conv.queryType)),
    ];
    const primaryPattern =
      patterns[0]?.description || "Mixed conversation topics";

    return `Session with ${queryCount} queries covering ${topics.join(", ")}. ${primaryPattern}.`;
  }

  private assessExpertiseProgression(
    conversationHistory: ConversationEntry[],
    userProfile: UserProfile
  ): string {
    if (conversationHistory.length < 2) {
      return "Insufficient data for expertise assessment";
    }

    // Simple progression analysis
    const complexities = conversationHistory.map(
      conv => conv.context?.complexity || 0.5
    );

    const avgComplexity =
      complexities.reduce((sum, c) => sum + c, 0) / complexities.length;
    const startingExpertise = userProfile.expertiseLevel || "intermediate";

    if (avgComplexity > 0.7) {
      return `Advanced level demonstrated, progressing beyond ${startingExpertise}`;
    } else if (avgComplexity > 0.4) {
      return `Solid ${startingExpertise} level understanding`;
    } else {
      return `Beginning level, building foundation knowledge`;
    }
  }

  private suggestNextTopics(
    conversationHistory: ConversationEntry[],
    patterns: Array<{ type: string; description: string; confidence: number }>,
    userProfile: UserProfile
  ): string[] {
    const suggestions: string[] = [];

    if (conversationHistory.length > 0) {
      const lastQuery = conversationHistory[conversationHistory.length - 1];
      const queryType = lastQuery.queryType;

      // Suggest related topics based on last query
      switch (queryType) {
        case "analytics":
          suggestions.push(
            "Revenue trends",
            "Customer segmentation",
            "Performance metrics"
          );
          break;
        case "finance":
          suggestions.push(
            "ROI analysis",
            "Budget optimization",
            "Cost analysis"
          );
          break;
        case "marketing":
          suggestions.push(
            "Campaign performance",
            "Channel analysis",
            "Conversion rates"
          );
          break;
        default:
          suggestions.push(
            "Data visualization",
            "Trend analysis",
            "Performance review"
          );
      }
    }

    // Add suggestions based on user's business focus
    const businessFocus = userProfile.businessFocus || [];
    businessFocus.forEach(focus => {
      if (
        !suggestions.some(s => s.toLowerCase().includes(focus.toLowerCase()))
      ) {
        suggestions.push(`${focus} insights`);
      }
    });

    return suggestions.slice(0, 5);
  }

  private recommendNextSteps(
    patterns: Array<{ type: string; description: string; confidence: number }>,
    userProfile: UserProfile,
    conversationHistory: ConversationEntry[]
  ): string[] {
    const steps: string[] = [];

    // Based on conversation patterns
    const primaryPattern = patterns[0];
    if (primaryPattern) {
      switch (primaryPattern.type) {
        case "focused_inquiry":
          steps.push("Dive deeper into specific aspects");
          steps.push("Look for related metrics or trends");
          break;
        case "exploratory":
          steps.push("Focus on the most relevant topic");
          steps.push("Create a summary of key findings");
          break;
        default:
          steps.push("Continue with your current analysis");
      }
    }

    // Based on user expertise
    const expertise = userProfile.expertiseLevel || "intermediate";
    if (expertise === "beginner") {
      steps.push("Request explanations for complex terms");
    } else if (expertise === "expert") {
      steps.push("Explore advanced analytical techniques");
    }

    return steps.slice(0, 4);
  }
}

// Export singleton instance
export const enhancedContextRecognitionIntegration =
  EnhancedContextRecognitionIntegration.getInstance();

// Export the function that's being called by other modules
export async function processEnhancedContextRecognition(request: {
  query: string;
  conversationHistory: ConversationEntry[];
  sessionMemory: SessionMemory;
  userProfile: UserProfile;
  userRole: string;
  permissions: string[];
}): Promise<any> {
  try {
    // Use the context recognition engine directly
    const result = await contextRecognitionEngine.recognizeContext(
      request.query,
      request.conversationHistory,
      request.userProfile,
      request.sessionMemory,
      request.userRole,
      request.permissions
    );

    return {
      success: true,
      contextRecognition: {
        semanticAnalysis: result.semanticAnalysis,
        contextPrediction: result.contextPrediction,
        processingTime: result.processingTime,
        modelConfidence: result.confidence,
      },
      mlEnhancements: {
        predictedIntent: result.contextPrediction.userIntent.goal,
        businessImplication: result.contextPrediction.businessImplication,
        suggestedActions: result.contextPrediction.suggestedActions,
        expectedFollowUp: result.contextPrediction.expectedFollowUp,
        relatedTopics: result.contextPrediction.relatedTopics,
      },
      confidence: result.confidence,
    };
  } catch (error) {
    console.error("processEnhancedContextRecognition error:", error);

    // Return fallback response
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      contextRecognition: {
        semanticAnalysis: null,
        contextPrediction: null,
        processingTime: 0,
        modelConfidence: 0.3,
      },
      mlEnhancements: {
        predictedIntent: "general_inquiry",
        businessImplication: "Standard information request",
        suggestedActions: ["Provide general assistance"],
        expectedFollowUp: ["Ask for clarification if needed"],
        relatedTopics: ["general"],
      },
      confidence: 0.3,
    };
  }
}
