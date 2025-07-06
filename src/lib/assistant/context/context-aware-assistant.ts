import { ContextRetentionEngine } from "./context-retention-engine";
import type {
  UserProfile,
  ConversationEntry,
  ContextQuery,
  ContextResponse,
  SessionMemory,
} from "./types";
import type { ConversationContext } from "../complex-query-handler";

export interface ContextAwareQuery {
  query: string;
  userId: string;
  sessionId?: string;
  userRole?: string;
  dashboardContext?: Record<string, any>;
  preferences?: Record<string, any>;
}

export interface ContextAwareResponse {
  answer: string;
  sources: string[];
  insights?: any[];
  confidence: number;
  personalizedContext?: {
    userProfile: UserProfile;
    relevantHistory: ConversationEntry[];
    recommendations: string[];
    predictedNeeds: string[];
  };
  sessionContext?: SessionMemory;
  learningInsights?: string[];
  detailedExplanation?: string;
  visualizationSuggestions?: any[];
  followUpQuestions?: string[];
  executionTime?: number;
}

export interface ContextEnhancedConversationContext
  extends ConversationContext {
  contextAware?: boolean;
  userProfile?: UserProfile;
  sessionMemory?: SessionMemory;
  relevantHistory?: ConversationEntry[];
  learningInsights?: string[];
}

export class ContextAwareAssistant {
  private static instance: ContextAwareAssistant;
  private contextEngine: ContextRetentionEngine;

  private constructor() {
    this.contextEngine = ContextRetentionEngine.getInstance();
  }

  public static getInstance(): ContextAwareAssistant {
    if (!ContextAwareAssistant.instance) {
      ContextAwareAssistant.instance = new ContextAwareAssistant();
    }
    return ContextAwareAssistant.instance;
  }

  /**
   * Enhanced ask function with context awareness
   */
  async askWithContext(
    contextQuery: ContextAwareQuery
  ): Promise<ContextAwareResponse> {
    const startTime = Date.now();

    try {
      // Get or create user profile
      let userProfile = await this.contextEngine.getUserProfile(
        contextQuery.userId
      );
      if (!userProfile) {
        userProfile = await this.contextEngine.createOrUpdateUserProfile({
          userId: contextQuery.userId,
          expertiseLevel: "intermediate",
          communicationStyle: "detailed",
          businessFocus: [],
          preferredAnalysisDepth: "detailed",
          timezone: "UTC",
          language: "en",
        });
      }

      // Create or get session
      let sessionMemory: SessionMemory;
      if (contextQuery.sessionId) {
        sessionMemory =
          (await this.contextEngine.getSession(contextQuery.sessionId)) ||
          (await this.contextEngine.createSession(
            contextQuery.userId,
            contextQuery.sessionId
          ));
      } else {
        sessionMemory = await this.contextEngine.createSession(
          contextQuery.userId
        );
      }

      // Get relevant context
      const contextResponse = await this.contextEngine.getContext({
        userId: contextQuery.userId,
        sessionId: sessionMemory.sessionId,
        query: contextQuery.query,
        includeHistory: true,
        maxHistoryEntries: 5,
      });

      // Create enhanced conversation context
      const enhancedContext: ContextEnhancedConversationContext = {
        previousQueries: contextResponse.relevantContext.map(
          entry => entry.userQuery
        ),
        userPreferences: contextQuery.preferences || {},
        currentDashboardState: {
          userRole: contextQuery.userRole,
          ...contextQuery.dashboardContext,
        },
        sessionData: {
          sessionId: sessionMemory.sessionId,
          startTime: sessionMemory.startTime,
          activeTopics: sessionMemory.activeTopics,
        },
        contextAware: true,
        userProfile: contextResponse.userProfile,
        sessionMemory,
        relevantHistory: contextResponse.relevantContext,
        learningInsights: [],
      };

      // Generate personalized response using existing AI framework
      const response = await this.generatePersonalizedResponse(
        contextQuery.query,
        enhancedContext,
        contextResponse
      );

      // Store conversation entry
      const conversationEntry: Omit<ConversationEntry, "id"> = {
        timestamp: new Date(),
        userQuery: contextQuery.query,
        assistantResponse: response.answer,
        context: {
          userRole: contextQuery.userRole,
          sessionId: sessionMemory.sessionId,
          ...contextQuery.dashboardContext,
        },
        queryType: this.classifyQueryType(contextQuery.query),
        confidence: response.confidence,
        responseTime: Date.now() - startTime,
        followUp: false,
      };

      await this.contextEngine.addConversationEntry(conversationEntry);

      // Update session with new activity
      await this.contextEngine.updateSession(sessionMemory.sessionId, {
        lastActivity: new Date(),
        activeTopics: await this.extractTopics(contextQuery.query),
        userIntent: await this.extractIntent(contextQuery.query),
        contextSummary: await this.generateSessionSummary(enhancedContext),
      });

      // Extract and store learning insights
      const learningInsights = await this.extractLearningInsights(
        contextQuery,
        response,
        enhancedContext
      );

      for (const insight of learningInsights) {
        await this.contextEngine.addLearningInsight({
          userId: contextQuery.userId,
          insight: insight.insight,
          category: insight.category,
          confidence: insight.confidence,
          evidence: insight.evidence,
          impact: insight.impact,
          createdAt: new Date(),
        });
      }

      return {
        ...response,
        personalizedContext: {
          userProfile: contextResponse.userProfile,
          relevantHistory: contextResponse.relevantContext,
          recommendations: contextResponse.recommendations,
          predictedNeeds: contextResponse.predictedNeeds || [],
        },
        sessionContext: sessionMemory,
        learningInsights: learningInsights.map(li => li.insight),
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error("Context-aware assistant error:", error);

      // Fallback to basic response
      return {
        answer:
          "I apologize, but I encountered an issue while processing your request with full context awareness. Let me try to help you with a basic response.",
        sources: [],
        confidence: 0.3,
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Get conversation history for a user
   */
  async getConversationHistory(
    userId: string,
    sessionId?: string,
    limit = 10
  ): Promise<ConversationEntry[]> {
    const contextResponse = await this.contextEngine.getContext({
      userId,
      sessionId,
      query: "",
      includeHistory: true,
      maxHistoryEntries: limit,
    });

    return contextResponse.relevantContext;
  }

  /**
   * Clear session context
   */
  async clearSessionContext(sessionId: string): Promise<void> {
    await this.contextEngine.updateSession(sessionId, {
      contextSummary: "",
      activeTopics: [],
      userIntent: "",
    });
  }

  /**
   * Update user context preferences
   */
  async updateUserContextPreferences(
    userId: string,
    preferences: Partial<UserProfile>
  ): Promise<UserProfile> {
    return await this.contextEngine.createOrUpdateUserProfile({
      userId,
      ...preferences,
    });
  }

  /**
   * Get context statistics for analytics
   */
  async getContextStats(userId: string) {
    return await this.contextEngine.getContextStats(userId);
  }

  /**
   * Create enhanced conversation context for existing AI components
   */
  createEnhancedContext(
    userProfile: UserProfile,
    sessionMemory: SessionMemory,
    relevantHistory: ConversationEntry[]
  ): ContextEnhancedConversationContext {
    return {
      previousQueries: relevantHistory.map(entry => entry.userQuery),
      userPreferences: {
        communicationStyle: userProfile.communicationStyle,
        analysisDepth: userProfile.preferredAnalysisDepth,
        businessFocus: userProfile.businessFocus,
      },
      currentDashboardState: {
        userRole: "analyst", // Default role
        language: userProfile.language,
        timezone: userProfile.timezone,
      },
      sessionData: {
        sessionId: sessionMemory.sessionId,
        startTime: sessionMemory.startTime,
        activeTopics: sessionMemory.activeTopics,
        userIntent: sessionMemory.userIntent,
      },
      contextAware: true,
      userProfile,
      sessionMemory,
      relevantHistory,
      learningInsights: [],
    };
  }

  // Private helper methods
  private async generatePersonalizedResponse(
    query: string,
    context: ContextEnhancedConversationContext,
    contextResponse: ContextResponse
  ): Promise<ContextAwareResponse> {
    // Use existing AI assistant components with enhanced context
    const { ask } = await import("../assistant-service");

    // Create enhanced query with personalization
    const personalizedQuery = this.personalizeQuery(
      query,
      context,
      contextResponse
    );

    try {
      const response = await ask(personalizedQuery, context);

      return {
        answer: response.answer,
        sources: response.sources || [],
        insights: response.insights,
        confidence: response.confidence || 0.7,
        detailedExplanation: response.detailedExplanation,
        visualizationSuggestions: response.visualizationSuggestions,
        followUpQuestions: response.followUpQuestions,
      };
    } catch (error) {
      console.error("Error generating personalized response:", error);
      return {
        answer: `I understand you're asking about "${query}". Based on your preferences for ${context.userProfile?.communicationStyle} communication, I'll provide a focused response.`,
        sources: [],
        confidence: 0.5,
      };
    }
  }

  private personalizeQuery(
    query: string,
    context: ContextEnhancedConversationContext,
    contextResponse: ContextResponse
  ): string {
    const userProfile = context.userProfile;
    if (!userProfile) return query;

    let personalizedQuery = query;

    // Add communication style context
    if (userProfile.communicationStyle === "concise") {
      personalizedQuery += " (Please provide a brief, to-the-point answer)";
    } else if (userProfile.communicationStyle === "detailed") {
      personalizedQuery +=
        " (Please provide a comprehensive, detailed explanation)";
    } else if (userProfile.communicationStyle === "visual") {
      personalizedQuery +=
        " (Please suggest visualizations and charts where applicable)";
    } else if (userProfile.communicationStyle === "technical") {
      personalizedQuery +=
        " (Please include technical details and methodology)";
    }

    // Add business focus context
    if (userProfile.businessFocus.length > 0) {
      personalizedQuery += ` (Context: User focuses on ${userProfile.businessFocus.join(", ")})`;
    }

    // Add recent context if available
    if (contextResponse.relevantContext.length > 0) {
      const recentQuery =
        contextResponse.relevantContext[
          contextResponse.relevantContext.length - 1
        ];
      personalizedQuery += ` (Previous question was about: ${recentQuery.userQuery})`;
    }

    return personalizedQuery;
  }

  private classifyQueryType(
    query: string
  ): "simple" | "complex" | "clarification" {
    const complexIndicators = [
      /\b(why|how|what if|analyze|compare|optimize|predict)\b/i,
      /\b(correlation|relationship|impact|trend)\b/i,
      /\b(and|while|but|however)\b/i,
    ];

    const clarificationIndicators = [
      /\b(can you explain|what do you mean|clarify|elaborate)\b/i,
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

  private async extractTopics(query: string): Promise<string[]> {
    // Simple topic extraction - in production, use NLP libraries
    const businessTopics = [
      "sales",
      "revenue",
      "customers",
      "marketing",
      "performance",
      "analytics",
      "dashboard",
      "reports",
      "optimization",
      "conversion",
      "retention",
      "churn",
      "roi",
      "cost",
      "profit",
      "growth",
    ];

    const queryLower = query.toLowerCase();
    return businessTopics.filter(topic => queryLower.includes(topic));
  }

  private async extractIntent(query: string): Promise<string> {
    // Simple intent extraction
    const queryLower = query.toLowerCase();

    if (queryLower.includes("show") || queryLower.includes("display")) {
      return "visualization";
    } else if (
      queryLower.includes("optimize") ||
      queryLower.includes("improve")
    ) {
      return "optimization";
    } else if (
      queryLower.includes("analyze") ||
      queryLower.includes("analysis")
    ) {
      return "analysis";
    } else if (
      queryLower.includes("predict") ||
      queryLower.includes("forecast")
    ) {
      return "prediction";
    } else if (
      queryLower.includes("compare") ||
      queryLower.includes("versus")
    ) {
      return "comparison";
    } else {
      return "information";
    }
  }

  private async generateSessionSummary(
    context: ContextEnhancedConversationContext
  ): Promise<string> {
    const topics = context.sessionMemory?.activeTopics || [];
    const queriesCount = context.previousQueries?.length || 0;
    const intent = context.sessionMemory?.userIntent || "general inquiry";

    return `Session with ${queriesCount} queries focusing on ${topics.join(", ")} with primary intent: ${intent}`;
  }

  private async extractLearningInsights(
    query: ContextAwareQuery,
    response: ContextAwareResponse,
    context: ContextEnhancedConversationContext
  ): Promise<
    Array<{
      insight: string;
      category: "preference" | "behavior" | "expertise" | "context";
      confidence: number;
      evidence: string[];
      impact: "high" | "medium" | "low";
    }>
  > {
    const insights = [];

    // Detect communication style preferences
    if (
      query.query.toLowerCase().includes("brief") ||
      query.query.toLowerCase().includes("quick")
    ) {
      insights.push({
        insight: "User prefers concise responses",
        category: "preference" as const,
        confidence: 0.7,
        evidence: [query.query],
        impact: "medium" as const,
      });
    }

    // Detect technical expertise level
    const technicalTerms = [
      "api",
      "sql",
      "algorithm",
      "optimization",
      "regression",
      "correlation",
    ];
    const hasTechnicalTerms = technicalTerms.some(term =>
      query.query.toLowerCase().includes(term)
    );

    if (hasTechnicalTerms) {
      insights.push({
        insight: "User demonstrates technical expertise",
        category: "expertise" as const,
        confidence: 0.8,
        evidence: [query.query],
        impact: "high" as const,
      });
    }

    // Detect behavioral patterns
    const topics = await this.extractTopics(query.query);
    if (topics.length > 0) {
      insights.push({
        insight: `User frequently asks about ${topics.join(", ")}`,
        category: "behavior" as const,
        confidence: 0.6,
        evidence: [query.query],
        impact: "medium" as const,
      });
    }

    return insights;
  }
}

// Export singleton instance for backward compatibility
export const contextAwareAssistant = ContextAwareAssistant.getInstance();
