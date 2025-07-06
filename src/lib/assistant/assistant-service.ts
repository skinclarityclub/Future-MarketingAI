import { parseIntent } from "./nlp/intent-parser.ts";
import { getDataSource } from "./data-source-registry.ts";
import { mlOrchestrator, type MLQuery } from "./ml/ml-orchestrator";
import { mlModelRegistry } from "./ml/model-registry";
import {
  processComplexQuery,
  type ConversationContext,
} from "./complex-query-handler";
import { OpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import {
  getPersonalityEngine,
  type PersonalityContext,
} from "../ai-configuration/personality-engine";

// Context-aware imports
import {
  ContextAwareAssistant,
  type ContextAwareQuery,
  type ContextAwareResponse,
  type ContextEnhancedConversationContext,
} from "./context/context-aware-assistant";

// Get context-aware assistant singleton instance
const contextAwareAssistant = ContextAwareAssistant.getInstance();

export interface AssistantAnswer {
  answer: string;
  sources: string[];
  insights?: any[];
  confidence?: number;
  modelData?: any;
  detailedExplanation?: string;
  visualizationSuggestions?: any[];
  followUpQuestions?: string[];
  executionTime?: number;
  isComplexQuery?: boolean;
}

export interface AdvancedQuery {
  question: string;
  includeMLInsights?: boolean;
  domain?: "customer" | "content" | "revenue" | "general";
  analysisType?: "analysis" | "prediction" | "optimization" | "insights";
  explanationLevel?: "basic" | "detailed" | "expert";
  context?: ConversationContext;
  enableComplexHandling?: boolean;
}

// Initialize OpenAI with fallback for missing API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key",
});

function hasValidOpenAIKey(): boolean {
  return !!(
    process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "dummy-key"
  );
}

/**
 * Enhanced ask function that automatically detects complex queries
 */
export async function ask(
  question: string,
  context?: ConversationContext
): Promise<AssistantAnswer> {
  return askAdvanced({
    question,
    enableComplexHandling: true,
    context,
  });
}

/**
 * Detect if a query is complex and requires advanced handling
 */
function detectComplexQuery(question: string): boolean {
  const complexIndicators = [
    // Multi-domain keywords
    /\b(correlation|relationship|impact|effect|influence)\b/i,
    /\b(compare|vs|versus|against)\b/i,
    /\b(optimize|optimization|improve|enhance)\b/i,

    // Multi-metric queries
    /\b(and|while|but|however|whereas)\b/i,

    // Complex analytical terms
    /\b(forecast|predict|trend|pattern|insight)\b/i,
    /\b(why|how|what if|what would happen)\b/i,

    // Cross-functional analysis
    /\b(marketing.*sales|customer.*revenue|content.*conversion)\b/i,
    /\b(retention.*churn|growth.*cost|performance.*roi)\b/i,

    // Multi-step questions
    /\b(first.*then|after.*analyze|once.*determine)\b/i,
  ];

  // Check if question contains multiple complex indicators
  const matches = complexIndicators.filter(pattern => pattern.test(question));
  return matches.length >= 2 || question.split(/[.!?]/).length > 2;
}

export async function askAdvanced(
  query: AdvancedQuery
): Promise<AssistantAnswer> {
  const {
    question,
    includeMLInsights = false,
    domain = "general",
    analysisType = "insights",
    explanationLevel = "detailed",
    context,
    enableComplexHandling = true,
  } = query;

  // Check if this is a complex query that should use the advanced handler
  const isComplexQuery = enableComplexHandling && detectComplexQuery(question);

  if (isComplexQuery) {
    try {
      const complexResult = await processComplexQuery(
        question,
        context,
        explanationLevel
      );

      return {
        answer: complexResult.answer,
        detailedExplanation: complexResult.detailedExplanation,
        sources: complexResult.sources,
        insights: complexResult.insights,
        confidence: complexResult.confidence,
        visualizationSuggestions: complexResult.visualizationSuggestions,
        followUpQuestions: complexResult.followUpQuestions,
        executionTime: complexResult.executionTime,
        isComplexQuery: true,
      };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "Complex query processing failed, falling back to simple processing:",
          error
        );
      }
      // Fall back to simple processing
    }
  }

  // Simple query processing (existing logic)
  const { intent, entities } = await parseIntent(question);

  // Very naive routing logic
  const sourcesUsed: string[] = [];
  let contextData: any = null;
  let mlInsights: any[] = [];
  let confidence = 0;
  let modelData: any = {};

  if (intent === "sales_report") {
    const ds = getDataSource("shopify");
    const since = entities["startDate"] ?? undefined;
    contextData = await ds.fetch({
      type: "orders",
      params: { created_at_min: since, limit: 50 },
    } as any);
    sourcesUsed.push("shopify");
  } else if (intent === "customer_lookup") {
    const ds = getDataSource("supabase_customer");
    contextData = await ds.fetch({
      type: "customers",
      params: { email: entities["email"] },
    } as any);
    sourcesUsed.push("supabase_customer");
  } else if (
    intent === "business_analysis" ||
    intent === "performance_analysis" ||
    includeMLInsights
  ) {
    // Execute ML analysis for business intelligence queries
    const mlQuery: MLQuery = {
      type: analysisType,
      domain,
      parameters: entities,
      context: question,
    };

    try {
      const mlResponse = await mlOrchestrator.executeQuery(mlQuery);
      if (mlResponse.success) {
        mlInsights = mlResponse.insights;
        confidence = mlResponse.confidence;
        modelData = mlResponse.data;
        sourcesUsed.push(...mlResponse.modelsUsed);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("ML analysis failed:", error);
      }
    }
  }

  // Enhanced system prompt with personality engine integration
  const baseSystemPrompt =
    includeMLInsights || mlInsights.length > 0
      ? `You are an advanced BI assistant with access to machine learning insights. 
       Provide comprehensive analysis using both data context and ML insights.
       Focus on actionable recommendations and strategic insights.
       When ML insights are available, integrate them naturally into your response.`
      : "You are a helpful BI assistant. Answer user questions using the provided data context.";

  // Apply personality engine adaptations
  const personalityEngine = getPersonalityEngine();
  const personalityContext: PersonalityContext = {
    userRole: context?.currentDashboardState?.userRole,
    dashboardPage: context?.currentDashboardState?.page,
    conversationLength: context?.previousQueries?.length || 1,
    isFirstVisit: (context?.previousQueries?.length || 1) === 1,
    userQuestion: question,
    previousInteractions: context?.previousQueries || [],
  };

  // Enhance context with user input analysis
  const analyzedContext = personalityEngine.analyzeUserContext(
    question,
    personalityContext
  );

  // Adapt the system prompt based on personality and context
  const adaptedPrompt = await personalityEngine.adaptPrompt(
    baseSystemPrompt,
    analyzedContext
  );
  const systemPrompt = adaptedPrompt.systemMessage;

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: question },
  ];

  if (contextData) {
    messages.push({
      role: "assistant",
      content: `Here is relevant data in JSON:\n\n${JSON.stringify(contextData).slice(0, 4000)}`,
    });
  }

  // Add ML insights to context if available
  if (mlInsights.length > 0) {
    const insightsContext = mlInsights.map(insight => ({
      type: insight.type,
      title: insight.title,
      description: insight.description,
      impact: insight.impact,
      urgency: insight.urgency,
      confidence: insight.confidence,
      actionable: insight.actionable,
      metrics: insight.metrics,
    }));

    messages.push({
      role: "assistant",
      content: `ML Insights (confidence: ${Math.round(confidence * 100)}%):\n\n${JSON.stringify(insightsContext, null, 2).slice(0, 3000)}`,
    });
  }

  let answer: string;

  // Check if we have a valid API key
  if (!hasValidOpenAIKey()) {
    // Provide a fallback response when no API key is available
    answer = `Hallo! Ik ben je AI business assistant. Op dit moment ben ik in demo-modus omdat er geen OpenAI API key is geconfigureerd.

Voor de vraag "${question}":

• 📊 **Demo data**: Ik kan demo KPI-data tonen via de dashboard
• 🎯 **ML Demo**: Ik kan demo ML insights genereren  
• 📈 **Context**: Ik zie dat je op pagina "${contextData?.page || "Dashboard"}" bent

Configureer de OPENAI_API_KEY in je .env.local bestand voor volledige functionaliteit.`;
  } else {
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        temperature: 0.7,
        messages,
      });

      answer =
        completion.choices[0].message.content ||
        "Sorry, I couldn't generate an answer.";
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("OpenAI API call failed:", error);
      }
      answer =
        "Sorry, er is een probleem met de AI service. Probeer het later opnieuw.";
    }
  }

  return {
    answer,
    sources: sourcesUsed,
    insights: mlInsights,
    confidence,
    modelData,
    isComplexQuery: false,
  };
}

/**
 * Get available ML model capabilities
 */
export function getMLCapabilities() {
  return mlModelRegistry.getCapabilities();
}

/**
 * Execute specific ML analysis
 */
export async function executeMLAnalysis(query: MLQuery) {
  return mlOrchestrator.executeQuery(query);
}

/**
 * Predict customer churn for specific customer
 */
export async function predictCustomerChurn(
  customerId: string,
  useAdvanced = true
) {
  return mlModelRegistry.predictChurn(customerId, useAdvanced);
}

/**
 * Analyze content ROI
 */
export async function analyzeContentROI(
  contentMetrics: any[],
  historicalData?: any[]
) {
  return mlModelRegistry.analyzeROI(contentMetrics, historicalData);
}

/**
 * Generate optimization recommendations
 */
export async function generateOptimizations(
  contentMetrics: any[],
  roiResults: any[],
  historicalData?: any[]
) {
  return mlModelRegistry.generateOptimizations(
    contentMetrics,
    roiResults,
    historicalData
  );
}

// ======================================
// CONTEXT-AWARE ASSISTANT INTEGRATION
// ======================================

/**
 * Enhanced ask function with context awareness
 * Uses the context retention system when user/session ID is provided
 */
export async function askWithContext(
  question: string,
  userId: string,
  sessionId?: string,
  userRole?: string,
  dashboardContext?: Record<string, any>,
  preferences?: Record<string, any>
): Promise<ContextAwareResponse> {
  if (!userId) {
    // Fallback to regular assistant when no user ID provided
    return createFallbackContextResponse(question);
  }

  try {
    const contextQuery: ContextAwareQuery = {
      query: question,
      userId,
      sessionId,
      userRole,
      dashboardContext,
      preferences,
    };

    return await contextAwareAssistant.askWithContext(contextQuery);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Context-aware assistant failed:", error);
    }
    return createFallbackContextResponse(question);
  }
}

/**
 * Enhanced askAdvanced function with context awareness
 */
export async function askAdvancedWithContext(
  query: AdvancedQuery & {
    userId?: string;
    sessionId?: string;
    userRole?: string;
    dashboardContext?: Record<string, any>;
  }
): Promise<ContextAwareResponse> {
  if (!query.userId) {
    // Fallback to regular advanced assistant
    const regularResponse = await askAdvanced(query);
    return {
      answer: regularResponse.answer,
      sources: regularResponse.sources || [],
      insights: regularResponse.insights,
      confidence: regularResponse.confidence || 0.7,
      detailedExplanation: regularResponse.detailedExplanation,
      visualizationSuggestions: regularResponse.visualizationSuggestions,
      followUpQuestions: regularResponse.followUpQuestions,
      executionTime: regularResponse.executionTime,
    };
  }

  try {
    const contextQuery: ContextAwareQuery = {
      query: query.question,
      userId: query.userId,
      sessionId: query.sessionId,
      userRole: query.userRole,
      dashboardContext: query.dashboardContext,
      preferences: query.context?.userPreferences,
    };

    return await contextAwareAssistant.askWithContext(contextQuery);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Context-aware advanced assistant failed:", error);
    }
    return createFallbackContextResponse(query.question);
  }
}

/**
 * Get conversation history for a user
 */
export async function getUserConversationHistory(
  userId: string,
  sessionId?: string,
  limit = 10
) {
  try {
    return await contextAwareAssistant.getConversationHistory(
      userId,
      sessionId,
      limit
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to get conversation history:", error);
    }
    return [];
  }
}

/**
 * Clear session context
 */
export async function clearSessionContext(sessionId: string): Promise<void> {
  try {
    await contextAwareAssistant.clearSessionContext(sessionId);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to clear session context:", error);
    }
  }
}

/**
 * Update user context preferences
 */
export async function updateUserContextPreferences(
  userId: string,
  preferences: {
    expertiseLevel?: "beginner" | "intermediate" | "advanced" | "expert";
    communicationStyle?: "concise" | "detailed" | "visual" | "technical";
    businessFocus?: string[];
    preferredAnalysisDepth?: "basic" | "detailed" | "comprehensive";
    timezone?: string;
    language?: string;
  }
) {
  try {
    return await contextAwareAssistant.updateUserContextPreferences(
      userId,
      preferences
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to update user context preferences:", error);
    }
    return null;
  }
}

/**
 * Get context statistics for analytics
 */
export async function getContextStats(userId: string) {
  try {
    return await contextAwareAssistant.getContextStats(userId);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to get context stats:", error);
    }
    return null;
  }
}

/**
 * Helper function to create enhanced context for existing components
 */
export function createEnhancedContext(
  userId: string,
  sessionId?: string,
  userRole?: string,
  preferences?: Record<string, any>,
  dashboardContext?: Record<string, any>
): ContextEnhancedConversationContext {
  return {
    previousQueries: [],
    userPreferences: preferences || {},
    currentDashboardState: {
      userRole,
      ...dashboardContext,
    },
    sessionData: {
      sessionId: sessionId || `temp_${Date.now()}`,
      userId,
      startTime: new Date(),
    },
    contextAware: true,
  };
}

/**
 * Fallback response when context system is unavailable
 */
function createFallbackContextResponse(question: string): ContextAwareResponse {
  return {
    answer: `I understand your question: "${question}". However, I'm currently operating without full context awareness. I can still help you with basic information and analysis.`,
    sources: [],
    confidence: 0.5,
    executionTime: 100,
  };
}
