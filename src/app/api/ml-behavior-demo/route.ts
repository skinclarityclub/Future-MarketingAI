/**
 * ML Behavior Prediction Demo API
 * Demo endpoint to test user behavior prediction system
 * Task 18.3: Implement Machine Learning for User Behavior Prediction
 */

import { NextRequest, NextResponse } from "next/server";
import { enhancedContextAwareAssistant } from "../../../lib/assistant/context/enhanced-context-aware-assistant";
import { userBehaviorPredictionEngine } from "../../../lib/assistant/ml/user-behavior-prediction";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, query, context } = body;

    switch (action) {
      case "predict":
        return await handlePredictBehavior(userId, query, context);

      case "analyze":
        return await handleAnalyzeBehavior(userId);

      case "insights":
        return await handleGetInsights(userId, context);

      case "enhanced_query":
        return await handleEnhancedQuery(userId, query, context);

      default:
        return NextResponse.json(
          {
            error:
              "Invalid action. Use: predict, analyze, insights, or enhanced_query",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("ML Behavior Demo API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handlePredictBehavior(
  userId: string,
  query: string,
  context: any
) {
  try {
    // Create mock prediction context
    const predictionContext = {
      currentSession: {
        sessionId: `demo-session-${Date.now()}`,
        userId,
        startTime: new Date(Date.now() - 30 * 60 * 1000),
        lastActivity: new Date(),
        activeTopics: ["analytics", "dashboard"],
        userIntent: "analysis",
        contextSummary: "Demo session for ML behavior prediction",
        queries: [], // Add required queries field
      },
      recentQueries: [query],
      timeContext: {
        hour: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        timeInSession: 30,
      },
      environmentContext: context || {},
    };

    const predictions = await userBehaviorPredictionEngine.predictUserBehavior(
      userId,
      predictionContext,
      [
        "query_type",
        "content_preference",
        "interaction_pattern",
        "timing_pattern",
      ]
    );

    const responseStyle =
      await userBehaviorPredictionEngine.getRecommendedResponseStyle(userId);

    const followUpQuestions =
      await userBehaviorPredictionEngine.predictFollowUpQuestions(
        userId,
        query,
        predictionContext
      );

    const personalizedRecommendations =
      await userBehaviorPredictionEngine.getPersonalizedRecommendations(
        userId,
        predictionContext
      );

    return NextResponse.json({
      success: true,
      data: {
        predictions,
        responseStyle,
        followUpQuestions,
        personalizedRecommendations,
        predictionContext: {
          timeContext: predictionContext.timeContext,
          sessionInfo: {
            duration: predictionContext.timeContext.timeInSession,
            activeTopics: predictionContext.currentSession.activeTopics,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error in handlePredictBehavior:", error);
    return NextResponse.json(
      { error: "Failed to predict behavior" },
      { status: 500 }
    );
  }
}

async function handleAnalyzeBehavior(userId: string) {
  try {
    const analysis =
      await enhancedContextAwareAssistant.analyzeUserBehavior(userId);

    return NextResponse.json({
      success: true,
      data: {
        analysis,
        summary: {
          totalPatterns: analysis.patterns.length,
          totalRecommendations: analysis.recommendations.length,
          overallExpertise: analysis.expertiseProfile.overall,
          topDomains: Object.entries(analysis.expertiseProfile.domains)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 3)
            .map(([domain, score]) => ({ domain, score })),
        },
      },
    });
  } catch (error) {
    console.error("Error in handleAnalyzeBehavior:", error);
    return NextResponse.json(
      { error: "Failed to analyze behavior" },
      { status: 500 }
    );
  }
}

async function handleGetInsights(userId: string, context: any) {
  try {
    const insights =
      await enhancedContextAwareAssistant.getPersonalizedInsights(
        userId,
        context
      );
    const proactiveSuggestions =
      await enhancedContextAwareAssistant.getProactiveSuggestions(
        userId,
        context || {}
      );

    return NextResponse.json({
      success: true,
      data: {
        insights,
        proactiveSuggestions,
        metadata: {
          timestamp: new Date().toISOString(),
          userId,
          context: context || {},
        },
      },
    });
  } catch (error) {
    console.error("Error in handleGetInsights:", error);
    return NextResponse.json(
      { error: "Failed to get insights" },
      { status: 500 }
    );
  }
}

async function handleEnhancedQuery(
  userId: string,
  query: string,
  context: any
) {
  try {
    const contextQuery = {
      query,
      userId,
      sessionId: `demo-session-${Date.now()}`,
      userRole: context?.userRole || "analyst",
      dashboardContext: context?.dashboardContext || {},
      preferences: context?.preferences || {},
    };

    const enhancedResponse =
      await enhancedContextAwareAssistant.askWithMLPredictions(contextQuery);

    return NextResponse.json({
      success: true,
      data: {
        response: enhancedResponse,
        mlEnhancements: {
          behaviorPredictions: enhancedResponse.behaviorPredictions || [],
          predictedFollowUps: enhancedResponse.predictedFollowUps || [],
          recommendedResponseStyle: enhancedResponse.recommendedResponseStyle,
          hasMLEnhancements: !!(
            enhancedResponse.behaviorPredictions?.length ||
            enhancedResponse.predictedFollowUps?.length ||
            enhancedResponse.recommendedResponseStyle
          ),
        },
        performance: {
          executionTime: enhancedResponse.executionTime,
          confidence: enhancedResponse.confidence,
        },
      },
    });
  } catch (error) {
    console.error("Error in handleEnhancedQuery:", error);
    return NextResponse.json(
      { error: "Failed to process enhanced query" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "ML Behavior Prediction Demo API",
    description: "Demo endpoint for testing user behavior prediction ML system",
    endpoints: {
      POST: {
        actions: [
          {
            action: "predict",
            description: "Predict user behavior based on context",
            parameters: ["userId", "query", "context"],
          },
          {
            action: "analyze",
            description: "Analyze user behavior patterns",
            parameters: ["userId"],
          },
          {
            action: "insights",
            description: "Get personalized insights and proactive suggestions",
            parameters: ["userId", "context"],
          },
          {
            action: "enhanced_query",
            description:
              "Process query with ML behavior prediction enhancements",
            parameters: ["userId", "query", "context"],
          },
        ],
      },
    },
    examples: {
      predict: {
        method: "POST",
        body: {
          action: "predict",
          userId: "demo-user",
          query: "Show me the revenue trends",
          context: { userRole: "analyst", currentPage: "dashboard" },
        },
      },
      analyze: {
        method: "POST",
        body: {
          action: "analyze",
          userId: "demo-user",
        },
      },
      insights: {
        method: "POST",
        body: {
          action: "insights",
          userId: "demo-user",
          context: { currentDashboard: "analytics" },
        },
      },
      enhanced_query: {
        method: "POST",
        body: {
          action: "enhanced_query",
          userId: "demo-user",
          query: "What are the key performance indicators?",
          context: {
            userRole: "manager",
            dashboardContext: { currentView: "overview" },
            preferences: { responseStyle: "concise" },
          },
        },
      },
    },
  });
}
