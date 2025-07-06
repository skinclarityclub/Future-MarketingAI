import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  navigationAssistantBridge,
  NavigationContext,
} from "@/lib/assistant/navigation-assistant-bridge";
import type { ConversationContext } from "@/lib/assistant/complex-query-handler";

const bodySchema = z.object({
  context: z.object({
    currentPage: z.string(),
    sessionId: z.string(),
    userId: z.string().optional(),
    previousPages: z.array(z.string()).default([]),
    currentQuery: z.string().optional(),
    dashboardContext: z.any().optional(),
    userIntent: z.string().optional(),
    timeOnPage: z.number().optional(),
  }),
  conversationContext: z
    .object({
      previousQueries: z.array(z.string()).optional(),
      userPreferences: z.record(z.any()).optional(),
      currentDashboardState: z.record(z.any()).optional(),
      sessionData: z.record(z.any()).optional(),
    })
    .optional(),
  options: z
    .object({
      includeAIInsights: z.boolean().default(true),
      includeMLPredictions: z.boolean().default(true),
      maxSuggestions: z.number().min(1).max(10).default(5),
    })
    .optional()
    .default({
      includeAIInsights: true,
      includeMLPredictions: true,
      maxSuggestions: 5,
    }),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { context, conversationContext, options } = bodySchema.parse(json);

    // Build navigation context
    const navigationContext: NavigationContext = {
      currentPage: context.currentPage,
      sessionId: context.sessionId,
      userId: context.userId,
      previousPages: context.previousPages,
      currentQuery: context.currentQuery,
      dashboardContext: context.dashboardContext,
      userIntent: context.userIntent,
      timeOnPage: context.timeOnPage,
      userProfile: null, // Default empty profile
      sessionData: {}, // Default empty session data
      preferences: {}, // Default empty preferences
    };

    // Build conversation context if provided
    const conversationCtx: ConversationContext | undefined = conversationContext
      ? {
          previousQueries: conversationContext.previousQueries || [],
          userPreferences: conversationContext.userPreferences || {},
          currentDashboardState:
            conversationContext.currentDashboardState || {},
          sessionData: conversationContext.sessionData || {},
        }
      : undefined;

    // Get contextual navigation suggestions
    const suggestions =
      await navigationAssistantBridge.getContextualNavigationSuggestions(
        navigationContext,
        conversationCtx
      );

    // Limit suggestions based on options
    const limitedSuggestions = {
      ...suggestions,
      suggestions: suggestions.suggestions.slice(0, options.maxSuggestions),
    };

    return NextResponse.json({
      success: true,
      data: limitedSuggestions,
      metadata: {
        timestamp: new Date().toISOString(),
        context: {
          currentPage: context.currentPage,
          sessionId: context.sessionId,
          hasQuery: !!context.currentQuery,
          hasConversationContext: !!conversationContext,
          suggestionsCount: limitedSuggestions.suggestions.length,
        },
        options,
      },
    });
  } catch (error: any) {
    console.error("Navigation Assistant API error:", error);

    // Return fallback response
    return NextResponse.json(
      {
        success: false,
        error: "Navigation assistance temporarily unavailable",
        data: {
          suggestions: [
            {
              page_url: "/",
              page_title: "Dashboard Overview",
              recommendation_type: "contextual",
              confidence: 0.7,
              reasoning: "Navigate to dashboard for an overview",
              expected_value: 7,
              personalization_factors: ["fallback"],
              display_priority: 1,
            },
          ],
          contextual_explanation: "Basis navigatie aanbevelingen beschikbaar.",
          suggested_actions: ["Ga naar dashboard"],
          related_queries: ["Hoe navigeer ik?"],
          navigation_strategy: "exploration",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          fallback: true,
          error:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Unknown error",
        },
      },
      { status: 200 }
    ); // Return 200 to avoid frontend error handling
  }
}

export const runtime = "edge";
