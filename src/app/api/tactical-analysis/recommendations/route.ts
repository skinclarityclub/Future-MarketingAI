/**
 * Tactical Recommendations API Endpoint
 * Generates automated business recommendations based on ML predictions and insights
 */

import { NextRequest, NextResponse } from "next/server";
import {
  tacticalRecommendationEngine,
  RecommendationContext,
} from "@/lib/analytics/tactical-recommendation-engine";
import { tacticalMLEngine } from "@/lib/analytics/tactical-ml-models";
import { tacticalDataEngine } from "@/lib/analytics/tactical-data-engine";
import { z } from "zod";

// Request schema validation
const recommendationSchema = z.object({
  action: z.enum(["generate", "status", "context"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  context: z
    .object({
      business_sector: z.string().optional(),
      company_size: z
        .enum(["startup", "small", "medium", "enterprise"])
        .optional(),
      risk_tolerance: z
        .enum(["conservative", "moderate", "aggressive"])
        .optional(),
      budget_constraints: z
        .object({
          max_investment: z.number().optional(),
          preferred_roi_months: z.number().optional(),
        })
        .optional(),
      current_priorities: z.array(z.string()).optional(),
    })
    .optional(),
  filters: z
    .object({
      categories: z.array(z.string()).optional(),
      priorities: z.array(z.string()).optional(),
      urgency: z.array(z.string()).optional(),
    })
    .optional(),
});

type RecommendationRequest = z.infer<typeof recommendationSchema>;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "status";

    // Return recommendation engine status
    if (action === "status") {
      return NextResponse.json({
        success: true,
        data: {
          recommendation_engine_status: "operational",
          capabilities: [
            "automated_recommendations",
            "business_strategy_optimization",
            "risk_assessment",
            "opportunity_identification",
            "actionable_insights",
          ],
          recommendation_categories: [
            "revenue_optimization",
            "cost_reduction",
            "market_opportunity",
            "risk_mitigation",
            "operational_efficiency",
          ],
          supported_contexts: [
            "business_sector",
            "company_size",
            "risk_tolerance",
            "budget_constraints",
            "current_priorities",
          ],
          version: "1.0.0",
        },
        meta: {
          action: "recommendation_status",
          timestamp: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "GET method only supports status action",
        meta: {
          action,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Recommendations GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process recommendation request",
        message: String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request schema
    const validation = recommendationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { action, startDate, endDate, context, filters } = validation.data;

    switch (action) {
      case "generate":
        return await handleGenerateRecommendations(
          startDate,
          endDate,
          context,
          filters
        );

      case "context":
        return await handleContextAnalysis(startDate, endDate, context);

      default:
        return NextResponse.json(
          {
            success: false,
            error: `Unsupported action: ${action}`,
            supported_actions: ["generate", "status", "context"],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Recommendations POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process recommendation request",
        message: String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Handle recommendation generation request
 */
async function handleGenerateRecommendations(
  startDate?: string,
  endDate?: string,
  context?: RecommendationContext,
  filters?: any
): Promise<NextResponse> {
  try {
    // Set default date range if not provided
    const defaultEndDate = endDate || new Date().toISOString();
    const defaultStartDate =
      startDate ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Get recent data for analysis
    const dataResult = await tacticalDataEngine.integrateData({
      startDate: defaultStartDate,
      endDate: defaultEndDate,
    });

    if (!dataResult.success || dataResult.data_points.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient data for recommendation generation",
          data_points_found: dataResult.data_points.length,
          meta: {
            action: "generate_recommendations",
            date_range: {
              startDate: defaultStartDate,
              endDate: defaultEndDate,
            },
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Generate ML predictions
    const predictions = await tacticalMLEngine.generatePredictions(
      dataResult.data_points
    );

    // Generate insights
    const insights = await tacticalMLEngine.generatePredictiveInsights(
      dataResult.data_points,
      "1month"
    );

    // Generate recommendations
    const recommendations =
      await tacticalRecommendationEngine.generateRecommendations(
        predictions,
        insights,
        context
      );

    // Apply filters if provided
    let filteredRecommendations = recommendations;
    if (filters) {
      filteredRecommendations = applyRecommendationFilters(
        recommendations,
        filters
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        recommendations: filteredRecommendations,
        generation_summary: {
          total_recommendations: recommendations.length,
          filtered_recommendations: filteredRecommendations.length,
          data_points_analyzed: dataResult.data_points.length,
          predictions_generated: predictions.length,
          insights_generated: insights.length,
          analysis_period: {
            start: defaultStartDate,
            end: defaultEndDate,
            days: Math.ceil(
              (new Date(defaultEndDate).getTime() -
                new Date(defaultStartDate).getTime()) /
                (24 * 60 * 60 * 1000)
            ),
          },
        },
        recommendation_distribution: {
          by_category: getDistributionByCategory(filteredRecommendations),
          by_priority: getDistributionByPriority(filteredRecommendations),
          by_urgency: getDistributionByUrgency(filteredRecommendations),
        },
      },
      meta: {
        action: "generate_recommendations",
        context_applied: !!context,
        filters_applied: !!filters,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Recommendation generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate recommendations",
        message: String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Handle context analysis request
 */
async function handleContextAnalysis(
  startDate?: string,
  endDate?: string,
  context?: RecommendationContext
): Promise<NextResponse> {
  try {
    // Set default date range if not provided
    const defaultEndDate = endDate || new Date().toISOString();
    const defaultStartDate =
      startDate ||
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    // Get historical data for context analysis
    const dataResult = await tacticalDataEngine.integrateData({
      startDate: defaultStartDate,
      endDate: defaultEndDate,
    });

    if (!dataResult.success || dataResult.data_points.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient data for context analysis",
          data_points_found: dataResult.data_points.length,
        },
        { status: 400 }
      );
    }

    // Analyze business context from data
    const contextAnalysis = analyzeBusinessContext(
      dataResult.data_points,
      context
    );

    return NextResponse.json({
      success: true,
      data: {
        context_analysis: contextAnalysis,
        data_summary: {
          data_points_analyzed: dataResult.data_points.length,
          analysis_period: {
            start: defaultStartDate,
            end: defaultEndDate,
            days: Math.ceil(
              (new Date(defaultEndDate).getTime() -
                new Date(defaultStartDate).getTime()) /
                (24 * 60 * 60 * 1000)
            ),
          },
        },
        recommendations: {
          suggested_context: contextAnalysis.suggested_context,
          optimization_opportunities:
            contextAnalysis.optimization_opportunities,
        },
      },
      meta: {
        action: "context_analysis",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Context analysis error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze context",
        message: String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Apply filters to recommendations
 */
function applyRecommendationFilters(
  recommendations: any[],
  filters: any
): any[] {
  let filtered = recommendations;

  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter(rec =>
      filters.categories.includes(rec.category)
    );
  }

  if (filters.priorities && filters.priorities.length > 0) {
    filtered = filtered.filter(rec =>
      filters.priorities.includes(rec.priority)
    );
  }

  if (filters.urgency && filters.urgency.length > 0) {
    filtered = filtered.filter(rec => filters.urgency.includes(rec.urgency));
  }

  return filtered;
}

/**
 * Get recommendation distribution by category
 */
function getDistributionByCategory(
  recommendations: any[]
): Record<string, number> {
  const distribution: Record<string, number> = {};

  for (const rec of recommendations) {
    distribution[rec.category] = (distribution[rec.category] || 0) + 1;
  }

  return distribution;
}

/**
 * Get recommendation distribution by priority
 */
function getDistributionByPriority(
  recommendations: any[]
): Record<string, number> {
  const distribution: Record<string, number> = {};

  for (const rec of recommendations) {
    distribution[rec.priority] = (distribution[rec.priority] || 0) + 1;
  }

  return distribution;
}

/**
 * Get recommendation distribution by urgency
 */
function getDistributionByUrgency(
  recommendations: any[]
): Record<string, number> {
  const distribution: Record<string, number> = {};

  for (const rec of recommendations) {
    distribution[rec.urgency] = (distribution[rec.urgency] || 0) + 1;
  }

  return distribution;
}

/**
 * Analyze business context from historical data
 */
function analyzeBusinessContext(
  dataPoints: any[],
  providedContext?: RecommendationContext
): any {
  // Calculate business metrics
  const revenuePoints = dataPoints.filter(
    dp => dp.category === "revenue" || dp.source === "shopify"
  );
  const costPoints = dataPoints.filter(
    dp => dp.category === "costs" || dp.category === "expenses"
  );

  const avgRevenue =
    revenuePoints.length > 0
      ? revenuePoints.reduce((sum, dp) => sum + dp.value, 0) /
        revenuePoints.length
      : 0;

  const avgCosts =
    costPoints.length > 0
      ? costPoints.reduce((sum, dp) => sum + dp.value, 0) / costPoints.length
      : 0;

  // Determine company size based on revenue
  let estimatedSize: "startup" | "small" | "medium" | "enterprise" = "startup";
  if (avgRevenue > 50000000) estimatedSize = "enterprise";
  else if (avgRevenue > 10000000) estimatedSize = "medium";
  else if (avgRevenue > 1000000) estimatedSize = "small";

  // Analyze volatility for risk assessment
  const revenueVariance = calculateVariance(revenuePoints.map(dp => dp.value));
  const riskProfile =
    revenueVariance > avgRevenue * 0.3
      ? "aggressive"
      : revenueVariance > avgRevenue * 0.15
        ? "moderate"
        : "conservative";

  return {
    data_insights: {
      average_revenue: avgRevenue,
      average_costs: avgCosts,
      revenue_volatility: revenueVariance,
      profit_margin:
        avgRevenue > 0 ? ((avgRevenue - avgCosts) / avgRevenue) * 100 : 0,
      data_quality_score: Math.min(100, (dataPoints.length / 100) * 100),
    },
    estimated_context: {
      company_size: estimatedSize,
      risk_tolerance: riskProfile,
      business_health: avgRevenue > avgCosts ? "healthy" : "concerning",
    },
    suggested_context: {
      company_size: providedContext?.company_size || estimatedSize,
      risk_tolerance: providedContext?.risk_tolerance || riskProfile,
      budget_constraints: providedContext?.budget_constraints || {
        max_investment: Math.max(10000, avgRevenue * 0.1),
        preferred_roi_months: 6,
      },
    },
    optimization_opportunities: [
      avgRevenue > 0 && avgCosts > avgRevenue * 0.8
        ? "Cost optimization needed"
        : null,
      revenueVariance > avgRevenue * 0.2
        ? "Revenue stabilization opportunity"
        : null,
      dataPoints.length < 50 ? "Data collection improvement needed" : null,
    ].filter(Boolean),
  };
}

/**
 * Calculate variance for risk assessment
 */
function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length;

  return Math.sqrt(variance);
}
