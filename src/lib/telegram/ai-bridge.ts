import {
  askAdvancedWithContext,
  getUserConversationHistory,
  clearSessionContext,
  updateUserContextPreferences,
  type AdvancedQuery,
} from "@/lib/assistant/assistant-service";
import {
  ContextAwareAssistant,
  type ContextAwareResponse,
} from "@/lib/assistant/context/context-aware-assistant";
import { TelegramAuthService } from "./auth-service";

export interface TelegramAIQuery {
  message: string;
  userId: string;
  chatId: number;
  username?: string;
  messageId?: number;
  userRole?: string;
  sessionId?: string;
  language?: string;
  includeMLInsights?: boolean;
  analysisType?: "analysis" | "prediction" | "optimization" | "insights";
  explanationLevel?: "basic" | "detailed" | "expert";
}

export interface TelegramAIResponse {
  text: string;
  sources?: string[];
  suggestions?: string[];
  hasVisualizations?: boolean;
  actionButtons?: TelegramInlineButton[];
  followUpQuestions?: string[];
  confidence?: number;
  executionTime?: number;
  sessionId?: string;
}

export interface TelegramInlineButton {
  text: string;
  callbackData: string;
  url?: string;
}

export interface TelegramDashboardContext {
  currentPage?: string;
  accessibleData?: string[];
  userPreferences?: {
    timezone?: string;
    language?: string;
    dashboardTheme?: string;
    preferredCharts?: string[];
  };
  recentActivity?: {
    viewedReports?: string[];
    executedQueries?: string[];
    savedFilters?: Record<string, any>[];
  };
}

export class TelegramAIBridge {
  private authService: TelegramAuthService;
  private contextAwareAssistant: ContextAwareAssistant;
  private sessionContexts: Map<string, any> = new Map();

  constructor(authService: TelegramAuthService) {
    this.authService = authService;
    this.contextAwareAssistant = ContextAwareAssistant.getInstance();
  }

  /**
   * Process a user query through the AI assistant system
   */
  async processQuery(query: TelegramAIQuery): Promise<TelegramAIResponse> {
    try {
      // Generate session ID if not provided
      const sessionId =
        query.sessionId || this.generateSessionId(query.userId, query.chatId);

      // Get user authentication status and role
      const userSession = await this.authService.getSession(query.userId);
      if (!userSession) {
        return this.createAuthenticationRequiredResponse();
      }

      // Get dashboard context for the user
      const dashboardContext = await this.getDashboardContext(
        query.userId,
        userSession.role
      );

      // Prepare advanced query
      const advancedQuery: AdvancedQuery & {
        userId: string;
        sessionId: string;
        userRole: string;
        dashboardContext: Record<string, any>;
      } = {
        question: query.message,
        includeMLInsights: query.includeMLInsights || false,
        analysisType: query.analysisType || "insights",
        explanationLevel: query.explanationLevel || "detailed",
        userId: query.userId,
        sessionId: sessionId,
        userRole: userSession.role,
        dashboardContext: dashboardContext,
      };

      // Execute AI query with context
      const aiResponse = await askAdvancedWithContext(advancedQuery);

      // Transform AI response to Telegram format
      const telegramResponse = await this.transformToTelegramResponse(
        aiResponse,
        query,
        sessionId,
        userSession.role
      );

      // Store session context for continuity
      this.updateSessionContext(sessionId, {
        lastQuery: query.message,
        lastResponse: aiResponse,
        timestamp: new Date(),
        userId: query.userId,
        chatId: query.chatId,
      });

      return telegramResponse;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("AI Bridge query processing error:", error);
      }
      return this.createErrorResponse(error);
    }
  }

  /**
   * Get conversation history for a user
   */
  async getConversationHistory(
    userId: string,
    sessionId?: string,
    limit = 5
  ): Promise<any[]> {
    try {
      return await getUserConversationHistory(userId, sessionId, limit);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to get conversation history:", error);
      }
      return [];
    }
  }

  /**
   * Clear session context for a user
   */
  async clearSession(sessionId: string): Promise<boolean> {
    try {
      await clearSessionContext(sessionId);
      this.sessionContexts.delete(sessionId);
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to clear session:", error);
      }
      return false;
    }
  }

  /**
   * Update user preferences for AI interactions
   */
  async updateUserPreferences(
    userId: string,
    preferences: {
      expertiseLevel?: "beginner" | "intermediate" | "advanced" | "expert";
      communicationStyle?: "concise" | "detailed" | "visual" | "technical";
      businessFocus?: string[];
      preferredAnalysisDepth?: "basic" | "detailed" | "comprehensive";
      timezone?: string;
      language?: string;
    }
  ): Promise<boolean> {
    try {
      await updateUserContextPreferences(userId, preferences);
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to update user preferences:", error);
      }
      return false;
    }
  }

  /**
   * Get dashboard data access context for a user
   */
  private async getDashboardContext(
    userId: string,
    userRole: string
  ): Promise<TelegramDashboardContext> {
    // Based on user role, determine what data they can access
    const accessibleData = this.getAccessibleDataSources(userRole);

    return {
      accessibleData,
      userPreferences: {
        timezone: "UTC", // Default, could be user-specific
        language: "en",
        dashboardTheme: "default",
        preferredCharts: ["line", "bar", "pie"],
      },
      recentActivity: {
        viewedReports: [],
        executedQueries: [],
        savedFilters: [],
      },
    };
  }

  /**
   * Determine accessible data sources based on user role
   */
  private getAccessibleDataSources(userRole: string): string[] {
    switch (userRole) {
      case "admin":
        return [
          "financial_data",
          "customer_data",
          "sales_data",
          "marketing_data",
          "operational_data",
          "analytics_data",
        ];
      case "analyst":
        return [
          "analytics_data",
          "sales_data",
          "marketing_data",
          "customer_data",
          "performance_metrics",
        ];
      case "user":
        return ["sales_data", "basic_analytics", "customer_insights"];
      case "viewer":
        return ["public_reports", "basic_metrics"];
      default:
        return ["public_reports"];
    }
  }

  /**
   * Transform AI response to Telegram-friendly format
   */
  private async transformToTelegramResponse(
    aiResponse: ContextAwareResponse,
    originalQuery: TelegramAIQuery,
    sessionId: string,
    userRole: string
  ): Promise<TelegramAIResponse> {
    // Truncate response if too long for Telegram (4096 character limit)
    let responseText = aiResponse.answer;
    if (responseText.length > 4000) {
      responseText =
        responseText.substring(0, 3950) + "\n\n... (truncated for Telegram)";
    }

    // Create action buttons based on response context
    const actionButtons = this.createActionButtons(aiResponse, userRole);

    // Format follow-up questions
    const followUpQuestions = aiResponse.followUpQuestions?.slice(0, 3) || [];

    return {
      text: responseText,
      sources: aiResponse.sources,
      suggestions: aiResponse.visualizationSuggestions?.map(v => v.type) || [],
      hasVisualizations: (aiResponse.visualizationSuggestions?.length || 0) > 0,
      actionButtons,
      followUpQuestions,
      confidence: aiResponse.confidence,
      executionTime: aiResponse.executionTime,
      sessionId,
    };
  }

  /**
   * Create action buttons for Telegram inline keyboard
   */
  private createActionButtons(
    aiResponse: ContextAwareResponse,
    userRole: string
  ): TelegramInlineButton[] {
    const buttons: TelegramInlineButton[] = [];

    // Add visualization button if visualizations are suggested
    if (
      aiResponse.visualizationSuggestions &&
      aiResponse.visualizationSuggestions.length > 0
    ) {
      buttons.push({
        text: "📊 View Charts",
        callbackData: "show_visualizations",
      });
    }

    // Add source data button if sources are available
    if (aiResponse.sources && aiResponse.sources.length > 0) {
      buttons.push({
        text: "📋 View Sources",
        callbackData: "show_sources",
      });
    }

    // Add dashboard link for admin/analyst users
    if (userRole === "admin" || userRole === "analyst") {
      buttons.push({
        text: "🖥️ Open Dashboard",
        url: process.env.NEXT_PUBLIC_DASHBOARD_URL || "/dashboard",
      });
    }

    // Add export button for detailed data
    if (aiResponse.insights && aiResponse.insights.length > 0) {
      buttons.push({
        text: "📤 Export Data",
        callbackData: "export_data",
      });
    }

    return buttons;
  }

  /**
   * Generate session ID for tracking conversation context
   */
  private generateSessionId(userId: string, chatId: number): string {
    const timestamp = Date.now();
    return `tg_${userId}_${chatId}_${timestamp}`;
  }

  /**
   * Update session context for conversation continuity
   */
  private updateSessionContext(sessionId: string, context: any): void {
    this.sessionContexts.set(sessionId, {
      ...this.sessionContexts.get(sessionId),
      ...context,
    });

    // Clean up old sessions (keep only last 100)
    if (this.sessionContexts.size > 100) {
      const oldestKey = this.sessionContexts.keys().next().value;
      this.sessionContexts.delete(oldestKey);
    }
  }

  /**
   * Create authentication required response
   */
  private createAuthenticationRequiredResponse(): TelegramAIResponse {
    return {
      text: "🔒 You need to be authenticated to use the AI assistant. Please use /start to begin the authentication process.",
      actionButtons: [
        {
          text: "🚀 Start Authentication",
          callbackData: "start_auth",
        },
      ],
    };
  }

  /**
   * Create error response
   */
  private createErrorResponse(error: any): TelegramAIResponse {
    if (process.env.NODE_ENV === "development") {
      console.error("AI Bridge Error:", error);
    }

    return {
      text: "❌ Sorry, I encountered an error while processing your request. Please try again later or contact support if the issue persists.",
      actionButtons: [
        {
          text: "🔄 Try Again",
          callbackData: "retry_query",
        },
        {
          text: "📞 Contact Support",
          callbackData: "contact_support",
        },
      ],
    };
  }

  /**
   * Handle quick data queries (for common dashboard requests)
   */
  async handleQuickDataQuery(
    queryType: "sales" | "customers" | "revenue" | "performance",
    userId: string,
    period: "today" | "week" | "month" | "quarter" = "month"
  ): Promise<TelegramAIResponse> {
    const quickQueries = {
      sales: `Show me sales performance for the last ${period}`,
      customers: `Analyze customer metrics for the last ${period}`,
      revenue: `Display revenue trends for the last ${period}`,
      performance: `Give me a performance overview for the last ${period}`,
    };

    return this.processQuery({
      message: quickQueries[queryType],
      userId,
      chatId: 0, // Will be overridden
      includeMLInsights: true,
      analysisType: "analysis",
      explanationLevel: "detailed",
    });
  }

  /**
   * Get available quick query types for a user role
   */
  getAvailableQuickQueries(userRole: string): string[] {
    const baseQueries = ["sales", "customers"];

    switch (userRole) {
      case "admin":
        return [...baseQueries, "revenue", "performance"];
      case "analyst":
        return [...baseQueries, "performance"];
      case "user":
        return baseQueries;
      default:
        return [];
    }
  }
}

export default TelegramAIBridge;
