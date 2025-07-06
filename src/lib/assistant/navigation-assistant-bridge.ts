/**
 * Navigation Assistant Bridge
 * Integrates the AI Assistant with the Navigation ML Engine for context-aware navigation
 */

import { askAdvanced } from "./assistant-service";
import { NavigationMLEngine } from "@/lib/analytics/navigation-ml-engine";
import {
  NavigationRecommendation,
  RealtimeMLConfig,
} from "@/lib/analytics/ml-navigation-types";
import type { ConversationContext } from "./complex-query-handler";

export interface NavigationContext {
  currentPage: string;
  sessionId: string;
  userId?: string;
  previousPages: string[];
  currentQuery?: string;
  dashboardContext?: unknown;
  userIntent?: string;
  timeOnPage?: number;
  userProfile: unknown;
  sessionData: unknown;
  preferences: unknown;
}

export interface ContextualNavigationSuggestion {
  page_url: string;
  page_title: string;
  recommendation_type:
    | "ai_suggested"
    | "ml_predicted"
    | "contextual"
    | "intelligent";
  confidence: number;
  reasoning: string;
  ai_context?: string;
  ml_prediction?: boolean;
  expected_value: number;
  personalization_factors: string[];
  display_priority: number;
}

export interface EnhancedNavigationResponse {
  suggestions: ContextualNavigationSuggestion[];
  ai_insights?: string[];
  contextual_explanation?: string;
  suggested_actions?: string[];
  related_queries?: string[];
  navigation_strategy?:
    | "exploration"
    | "task_completion"
    | "information_seeking"
    | "analysis";
}

// Initialize ML engine with optimized config for AI integration
const mlConfig: RealtimeMLConfig = {
  enabled: true,
  prediction_interval: 500,
  batch_size: 15,
  cache_predictions: true,
  cache_ttl: 180,
  fallback_strategy: "popular_pages",
  min_data_points: 50,
  retrain_threshold: 0.8,
  auto_retrain: false,
};

const navigationML = new NavigationMLEngine(mlConfig);

export class NavigationAssistantBridge {
  private readonly navigationML: NavigationMLEngine;
  private predictionCache: Map<string, { data: unknown; expires: number }>;

  constructor() {
    this.navigationML = navigationML;
    this.predictionCache = new Map();
  }

  /**
   * Get intelligent navigation suggestions based on AI context and ML predictions
   */
  async getContextualNavigationSuggestions(
    context: NavigationContext,
    conversationContext?: ConversationContext
  ): Promise<EnhancedNavigationResponse> {
    try {
      // Get ML-based predictions
      const mlRecommendations = await this.getMLNavigationPredictions(context);

      // Get AI-enhanced suggestions based on current conversation/query
      const aiSuggestions = await this.getAINavigationSuggestions(
        context,
        conversationContext
      );

      // Combine and rank suggestions
      const combinedSuggestions = await this.combineAndRankSuggestions(
        mlRecommendations,
        aiSuggestions.suggestions,
        context
      );

      // Generate contextual explanation
      const explanation = await this.generateNavigationExplanation(
        combinedSuggestions,
        context,
        conversationContext
      );

      // Determine navigation strategy
      const strategy = this.determineNavigationStrategy(
        context,
        conversationContext
      );

      return {
        suggestions: combinedSuggestions,
        ai_insights: aiSuggestions.insights,
        contextual_explanation: explanation,
        suggested_actions: this.generateSuggestedActions(
          combinedSuggestions,
          context
        ),
        related_queries: this.generateRelatedQueries(
          context,
          conversationContext
        ),
        navigation_strategy: strategy,
      };
    } catch {
      // Error getting contextual navigation suggestions
      return this.getFallbackSuggestions(context);
    }
  }

  /**
   * Get ML-based navigation predictions
   */
  private async getMLNavigationPredictions(
    context: NavigationContext
  ): Promise<NavigationRecommendation[]> {
    try {
      const recommendations =
        await this.navigationML.getRealtimeRecommendations(
          context.sessionId,
          context.currentPage,
          context.userId
        );

      return recommendations;
    } catch {
      // ML navigation predictions failed
      return [];
    }
  }

  /**
   * Get AI-enhanced navigation suggestions
   */
  private async getAINavigationSuggestions(
    context: NavigationContext,
    conversationContext?: ConversationContext
  ): Promise<{
    suggestions: ContextualNavigationSuggestion[];
    insights: string[];
  }> {
    try {
      const aiQuery = this.buildNavigationAIQuery(context, conversationContext);

      const aiResponse = await askAdvanced({
        question: aiQuery,
        includeMLInsights: true,
        domain: "general",
        analysisType: "insights",
        explanationLevel: "detailed",
        context: conversationContext,
        enableComplexHandling: true,
      });

      const suggestions = this.parseAINavigationResponse(aiResponse, context);
      const insights =
        aiResponse.insights?.map(insight => insight.description) || [];

      return { suggestions, insights };
    } catch {
      // AI navigation suggestions failed
      return { suggestions: [], insights: [] };
    }
  }

  /**
   * Build AI query for navigation assistance
   */
  private buildNavigationAIQuery(
    context: NavigationContext,
    conversationContext?: ConversationContext
  ): string {
    const { currentPage, currentQuery, previousPages, timeOnPage } = context;

    let query = `Als een slimme navigatie-assistent, help me bepalen welke pagina's het meest relevant zijn voor de gebruiker.

Huidige context:
- Huidige pagina: ${currentPage}
- Tijd op pagina: ${timeOnPage || 0} seconden
- Vorige pagina's: ${previousPages.join(", ") || "Geen"}`;

    if (currentQuery) {
      query += `\n- Huidige vraag/query: "${currentQuery}"`;
    }

    if (conversationContext?.previousQueries?.length) {
      query += `\n- Eerdere vragen: ${conversationContext.previousQueries.slice(-3).join(", ")}`;
    }

    query += `\n\nBeschikbare pagina's:
- / (Dashboard overview)
- /revenue (Revenue analytics)
- /performance (Performance metrics)
- /customers (Customer insights)
- /customer-intelligence (Customer intelligence)
- /reports (Reports)
- /analytics (Advanced analytics)
- /calendar (Calendar/meetings)
- /settings (Settings)

Geef 3-5 meest relevante pagina's met waarom deze relevant zijn voor de gebruiker's huidige context.`;

    return query;
  }

  /**
   * Parse AI response for navigation suggestions
   */
  private parseAINavigationResponse(
    aiResponse: unknown,
    context: NavigationContext
  ): ContextualNavigationSuggestion[] {
    const suggestions: ContextualNavigationSuggestion[] = [];

    const answer = (aiResponse as { answer?: string }).answer || "";

    const pages = [
      {
        url: "/",
        title: "Dashboard Overview",
        keywords: ["dashboard", "overzicht", "overview"],
      },
      {
        url: "/revenue",
        title: "Revenue Analytics",
        keywords: ["revenue", "omzet", "inkomsten"],
      },
      {
        url: "/performance",
        title: "Performance Metrics",
        keywords: ["performance", "prestaties", "kpi"],
      },
      {
        url: "/customers",
        title: "Customer Insights",
        keywords: ["customer", "klant", "insights"],
      },
      {
        url: "/customer-intelligence",
        title: "Customer Intelligence",
        keywords: ["intelligence", "intelligentie", "360"],
      },
      {
        url: "/reports",
        title: "Reports",
        keywords: ["report", "rapport", "rapportage"],
      },
      {
        url: "/analytics",
        title: "Advanced Analytics",
        keywords: ["analytics", "analyse", "advanced"],
      },
      {
        url: "/calendar",
        title: "Calendar",
        keywords: ["calendar", "kalender", "meeting"],
      },
      {
        url: "/settings",
        title: "Settings",
        keywords: ["settings", "instellingen", "configuratie"],
      },
    ];

    let priority = 1;

    for (const page of pages) {
      const isRelevant = page.keywords.some(keyword =>
        answer.toLowerCase().includes(keyword.toLowerCase())
      );

      if (isRelevant && page.url !== context.currentPage) {
        const confidence = this.calculateAIConfidence(answer, page.keywords);

        suggestions.push({
          page_url: page.url,
          page_title: page.title,
          recommendation_type: "ai_suggested",
          confidence,
          reasoning: `AI suggests this page based on your current context and query pattern`,
          ai_context: context.currentQuery,
          ml_prediction: false,
          expected_value: Math.min(confidence * 10, 10),
          personalization_factors: [
            "ai_context",
            "query_relevance",
            "conversation_history",
          ],
          display_priority: priority++,
        });
      }
    }

    return suggestions.slice(0, 5);
  }

  /**
   * Calculate AI confidence based on keyword relevance
   */
  private calculateAIConfidence(response: string, keywords: string[]): number {
    const lowerResponse = response.toLowerCase();
    const matchCount = keywords.filter(keyword =>
      lowerResponse.includes(keyword.toLowerCase())
    ).length;

    return Math.min(0.6 + matchCount * 0.1, 0.95);
  }

  /**
   * Combine and rank ML predictions with AI suggestions
   */
  private async combineAndRankSuggestions(
    mlRecommendations: NavigationRecommendation[],
    aiSuggestions: ContextualNavigationSuggestion[],
    _context: NavigationContext
  ): Promise<ContextualNavigationSuggestion[]> {
    const combined: ContextualNavigationSuggestion[] = [];

    // Convert ML recommendations to our format
    for (const mlRec of mlRecommendations) {
      combined.push({
        page_url: mlRec.page_url,
        page_title: mlRec.page_title,
        recommendation_type: "ml_predicted",
        confidence: mlRec.confidence,
        reasoning: mlRec.reasoning,
        ml_prediction: true,
        expected_value: mlRec.expected_engagement_score,
        personalization_factors: mlRec.personalization_factors,
        display_priority: mlRec.display_priority,
      });
    }

    // Add AI suggestions
    combined.push(...aiSuggestions);

    // Remove duplicates and rank by composite score
    const uniqueSuggestions = new Map<string, ContextualNavigationSuggestion>();

    for (const suggestion of combined) {
      const existing = uniqueSuggestions.get(suggestion.page_url);

      if (
        !existing ||
        this.calculateCompositeScore(suggestion) >
          this.calculateCompositeScore(existing)
      ) {
        if (existing) {
          suggestion.reasoning = `${existing.reasoning}; ${suggestion.reasoning}`;
          suggestion.recommendation_type = "intelligent";
          suggestion.confidence = Math.max(
            existing.confidence,
            suggestion.confidence
          );
          suggestion.personalization_factors = [
            ...new Set([
              ...existing.personalization_factors,
              ...suggestion.personalization_factors,
            ]),
          ];
        }

        uniqueSuggestions.set(suggestion.page_url, suggestion);
      }
    }

    return Array.from(uniqueSuggestions.values())
      .sort(
        (a, b) =>
          this.calculateCompositeScore(b) - this.calculateCompositeScore(a)
      )
      .slice(0, 6)
      .map((suggestion, index) => ({
        ...suggestion,
        display_priority: index + 1,
      }));
  }

  /**
   * Calculate composite score for ranking
   */
  private calculateCompositeScore(
    suggestion: ContextualNavigationSuggestion
  ): number {
    let score = suggestion.confidence * 0.4;
    score += Math.min(suggestion.expected_value / 10, 1) * 0.3;

    if (suggestion.recommendation_type === "intelligent") {
      score += 0.2;
    }

    score += Math.min(suggestion.personalization_factors.length * 0.02, 0.1);

    return score;
  }

  /**
   * Generate contextual explanation
   */
  private async generateNavigationExplanation(
    suggestions: ContextualNavigationSuggestion[],
    context: NavigationContext,
    _conversationContext?: ConversationContext
  ): Promise<string> {
    if (suggestions.length === 0) {
      return "Geen specifieke navigatie aanbevelingen beschikbaar op dit moment.";
    }

    const topSuggestion = suggestions[0];
    const hasAI = suggestions.some(
      s =>
        s.recommendation_type === "ai_suggested" ||
        s.recommendation_type === "intelligent"
    );
    const hasML = suggestions.some(
      s =>
        s.recommendation_type === "ml_predicted" ||
        s.recommendation_type === "intelligent"
    );

    let explanation = `Gebaseerd op ${hasAI && hasML ? "AI-analyse en ML-voorspellingen" : hasAI ? "AI-analyse" : "ML-voorspellingen"}, `;

    if (context.currentQuery) {
      explanation += `en je vraag "${context.currentQuery}", `;
    }

    explanation += `stel ik ${topSuggestion.page_title} voor.`;

    return explanation;
  }

  /**
   * Generate suggested actions
   */
  private generateSuggestedActions(
    suggestions: ContextualNavigationSuggestion[],
    _context: NavigationContext
  ): string[] {
    const actions: string[] = [];

    if (suggestions.length > 0) {
      const topSuggestion = suggestions[0];
      actions.push(`Ga naar ${topSuggestion.page_title} voor direct inzicht`);

      if (suggestions.length > 1) {
        actions.push(
          `Verken ${suggestions[1].page_title} voor aanvullende informatie`
        );
      }
    }

    return actions.slice(0, 3);
  }

  /**
   * Generate related queries
   */
  private generateRelatedQueries(
    context: NavigationContext,
    _conversationContext?: ConversationContext
  ): string[] {
    const queries: string[] = [];

    const pageQueries: Record<string, string[]> = {
      "/": [
        "Wat zijn de belangrijkste trends?",
        "Hoe presteren we deze maand?",
      ],
      "/revenue": [
        "Wat zijn de revenue drivers?",
        "Hoe kunnen we omzet verhogen?",
      ],
      "/performance": [
        "Welke KPI's hebben aandacht nodig?",
        "Waar kunnen we optimaliseren?",
      ],
      "/customers": [
        "Welke klanten zijn het meest waardevol?",
        "Wat is onze customer retention?",
      ],
      "/reports": [
        "Welke rapporten zijn het meest gebruikt?",
        "Hoe kan ik een custom rapport maken?",
      ],
      "/analytics": [
        "Wat zeggen de data trends?",
        "Welke analyses zijn beschikbaar?",
      ],
    };

    const currentPageQueries = pageQueries[context.currentPage] || [];
    queries.push(...currentPageQueries);

    return [...new Set(queries)].slice(0, 4);
  }

  /**
   * Determine navigation strategy
   */
  private determineNavigationStrategy(
    context: NavigationContext,
    _conversationContext?: ConversationContext
  ): "exploration" | "task_completion" | "information_seeking" | "analysis" {
    if (context.currentQuery) {
      if (
        context.currentQuery.includes("hoe") ||
        context.currentQuery.includes("help")
      ) {
        return "task_completion";
      }
      if (
        context.currentQuery.includes("wat") ||
        context.currentQuery.includes("welke")
      ) {
        return "information_seeking";
      }
      if (
        context.currentQuery.includes("analyse") ||
        context.currentQuery.includes("trend")
      ) {
        return "analysis";
      }
    }

    if (context.previousPages.length <= 2) {
      return "exploration";
    }

    return "information_seeking";
  }

  /**
   * Fallback suggestions
   */
  private getFallbackSuggestions(
    context: NavigationContext
  ): EnhancedNavigationResponse {
    const fallbackSuggestions: ContextualNavigationSuggestion[] = [
      {
        page_url: "/",
        page_title: "Dashboard Overview",
        recommendation_type: "contextual" as const,
        confidence: 0.7,
        reasoning: "Start with the main dashboard for an overview",
        expected_value: 7,
        personalization_factors: ["fallback"],
        display_priority: 1,
      },
      {
        page_url: "/reports",
        page_title: "Reports",
        recommendation_type: "contextual" as const,
        confidence: 0.6,
        reasoning: "Access comprehensive reports and data exports",
        expected_value: 6,
        personalization_factors: ["fallback"],
        display_priority: 2,
      },
    ].filter(s => s.page_url !== context.currentPage);

    return {
      suggestions: fallbackSuggestions,
      contextual_explanation: "Basis navigatie aanbevelingen beschikbaar.",
      suggested_actions: [
        "Verken het dashboard",
        "Bekijk beschikbare rapporten",
      ],
      related_queries: [
        "Wat kan ik hier doen?",
        "Hoe navigeer ik door het systeem?",
      ],
      navigation_strategy: "exploration",
    };
  }
}

// Export singleton instance
export const navigationAssistantBridge = new NavigationAssistantBridge();
