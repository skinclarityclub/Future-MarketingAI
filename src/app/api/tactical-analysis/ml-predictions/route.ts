/**
 * Tactical ML Predictions API Endpoint
 * Handles ML model training, predictions, and insights generation
 */

import { NextRequest, NextResponse } from "next/server";
import { tacticalDataEngine } from "@/lib/analytics/tactical-data-engine";
import { tacticalMLEngine } from "@/lib/analytics/tactical-ml-models";
import {
  tacticalRecommendationEngine,
  RecommendationContext,
} from "@/lib/analytics/tactical-recommendation-engine";
import { z } from "zod";

// Request schema validation
const mlPredictionSchema = z.object({
  action: z.enum(["train", "predict", "insights", "recommendations", "status"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  horizon: z.enum(["1week", "1month", "3months"]).optional(),
  modelTypes: z.array(z.string()).optional(),
  config: z
    .object({
      confidence_threshold: z.number().min(0).max(100).optional(),
      prediction_horizon_days: z.number().min(1).max(365).optional(),
      include_anomalies: z.boolean().optional(),
      include_trends: z.boolean().optional(),
    })
    .optional(),
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
});

type MLPredictionRequest = z.infer<typeof mlPredictionSchema>;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "status";

    // Return ML engine status
    if (action === "status") {
      return NextResponse.json({
        success: true,
        data: {
          ml_engine_status: "operational",
          available_models: [
            "revenue_trend",
            "general_anomaly",
            "financial_forecast",
          ],
          capabilities: [
            "trend_analysis",
            "anomaly_detection",
            "forecasting",
            "predictive_insights",
          ],
          supported_algorithms: [
            "linear_regression",
            "moving_average",
            "isolation_forest",
          ],
          version: "1.0.0",
        },
        meta: {
          action: "ml_status",
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
    console.error("ML Predictions GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process ML request",
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
    const validation = mlPredictionSchema.safeParse(body);
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

    const { action, startDate, endDate, horizon, modelTypes, config, context } =
      validation.data;

    switch (action) {
      case "train":
        return await handleTrainModels(startDate, endDate, config);

      case "predict":
        return await handleGeneratePredictions(
          startDate,
          endDate,
          modelTypes,
          config
        );

      case "insights":
        return await handleGenerateInsights(
          startDate,
          endDate,
          horizon,
          config
        );

      case "recommendations":
        return await handleGenerateRecommendations(
          startDate,
          endDate,
          context,
          config
        );

      default:
        return NextResponse.json(
          {
            success: false,
            error: `Unsupported action: ${action}`,
            supported_actions: [
              "train",
              "predict",
              "insights",
              "recommendations",
              "status",
            ],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("ML Predictions POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process ML request",
        message: String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Handle model training request
 */
async function handleTrainModels(
  startDate?: string,
  endDate?: string,
  config?: any
): Promise<NextResponse> {
  try {
    // Set default date range if not provided
    const defaultEndDate = endDate || new Date().toISOString();
    const defaultStartDate =
      startDate ||
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    // Get training data from tactical data engine
    const dataResult = await tacticalDataEngine.integrateData({
      startDate: defaultStartDate,
      endDate: defaultEndDate,
    });

    if (!dataResult.success || dataResult.data_points.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient training data available",
          data_points_found: dataResult.data_points.length,
          meta: {
            action: "train",
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

    // Train ML models
    const trainResult = await tacticalMLEngine.trainModels(
      dataResult.data_points
    );

    return NextResponse.json({
      success: trainResult.success,
      data: {
        training_result: trainResult,
        data_points_used: dataResult.data_points.length,
        training_period: {
          start: defaultStartDate,
          end: defaultEndDate,
          days: Math.ceil(
            (new Date(defaultEndDate).getTime() -
              new Date(defaultStartDate).getTime()) /
              (24 * 60 * 60 * 1000)
          ),
        },
      },
      meta: {
        action: "train",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Model training error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to train models",
        message: String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Handle predictions generation request
 */
async function handleGeneratePredictions(
  startDate?: string,
  endDate?: string,
  modelTypes?: string[],
  config?: any
): Promise<NextResponse> {
  try {
    // Set default date range if not provided
    const defaultEndDate = endDate || new Date().toISOString();
    const defaultStartDate =
      startDate ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Get recent data for predictions
    const dataResult = await tacticalDataEngine.integrateData({
      startDate: defaultStartDate,
      endDate: defaultEndDate,
    });

    if (!dataResult.success || dataResult.data_points.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient data for predictions",
          data_points_found: dataResult.data_points.length,
          meta: {
            action: "predict",
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

    // Generate predictions
    const predictions = await tacticalMLEngine.generatePredictions(
      dataResult.data_points,
      modelTypes
    );

    return NextResponse.json({
      success: true,
      data: {
        predictions,
        data_points_analyzed: dataResult.data_points.length,
        models_used: modelTypes || ["all_available"],
        prediction_period: {
          start: defaultStartDate,
          end: defaultEndDate,
        },
      },
      meta: {
        action: "predict",
        predictions_count: predictions.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Predictions generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate predictions",
        message: String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Handle insights generation request
 */
async function handleGenerateInsights(
  startDate?: string,
  endDate?: string,
  horizon?: "1week" | "1month" | "3months",
  config?: any
): Promise<NextResponse> {
  try {
    // Set default date range if not provided
    const defaultEndDate = endDate || new Date().toISOString();
    const defaultStartDate =
      startDate ||
      new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const defaultHorizon = horizon || "1month";

    // Get data for insights generation
    const dataResult = await tacticalDataEngine.integrateData({
      startDate: defaultStartDate,
      endDate: defaultEndDate,
    });

    if (!dataResult.success || dataResult.data_points.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient data for insights generation",
          data_points_found: dataResult.data_points.length,
          meta: {
            action: "insights",
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

    // Generate comprehensive insights
    const insights = await tacticalMLEngine.generatePredictiveInsights(
      dataResult.data_points,
      defaultHorizon
    );

    // Calculate insights summary
    const insightsSummary = {
      total_insights: insights.length,
      high_confidence: insights.filter(i => i.confidence_score >= 80).length,
      high_impact: insights.filter(i => i.impact_score >= 70).length,
      critical_recommendations: insights.filter(
        i => i.recommendations.length > 0
      ).length,
      avg_confidence:
        insights.length > 0
          ? Math.round(
              insights.reduce((sum, i) => sum + i.confidence_score, 0) /
                insights.length
            )
          : 0,
      avg_impact:
        insights.length > 0
          ? Math.round(
              insights.reduce((sum, i) => sum + i.impact_score, 0) /
                insights.length
            )
          : 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        insights,
        summary: insightsSummary,
        data_points_analyzed: dataResult.data_points.length,
        analysis_period: {
          start: defaultStartDate,
          end: defaultEndDate,
          horizon: defaultHorizon,
        },
      },
      meta: {
        action: "insights",
        insights_count: insights.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Insights generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate insights",
        message: String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Handle recommendations generation request
 */
async function handleGenerateRecommendations(
  startDate?: string,
  endDate?: string,
  context?: RecommendationContext,
  config?: any
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
            action: "recommendations",
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

    // Generate ML predictions first
    const predictions = await tacticalMLEngine.generatePredictions(
      dataResult.data_points
    );

    // Generate insights
    const insights = await tacticalMLEngine.generatePredictiveInsights(
      dataResult.data_points,
      "1month"
    );

    // Generate recommendations using the recommendation engine
    const recommendations =
      await tacticalRecommendationEngine.generateRecommendations(
        predictions,
        insights,
        context
      );

    // Calculate recommendation summary
    const recommendationSummary = {
      total_recommendations: recommendations.length,
      by_priority: {
        critical: recommendations.filter(r => r.priority === "critical").length,
        high: recommendations.filter(r => r.priority === "high").length,
        medium: recommendations.filter(r => r.priority === "medium").length,
        low: recommendations.filter(r => r.priority === "low").length,
      },
      by_category: {
        revenue_optimization: recommendations.filter(
          r => r.category === "revenue_optimization"
        ).length,
        cost_reduction: recommendations.filter(
          r => r.category === "cost_reduction"
        ).length,
        market_opportunity: recommendations.filter(
          r => r.category === "market_opportunity"
        ).length,
        risk_mitigation: recommendations.filter(
          r => r.category === "risk_mitigation"
        ).length,
        operational_efficiency: recommendations.filter(
          r => r.category === "operational_efficiency"
        ).length,
      },
      avg_confidence:
        recommendations.length > 0
          ? Math.round(
              recommendations.reduce((sum, r) => sum + r.confidence_score, 0) /
                recommendations.length
            )
          : 0,
      estimated_total_impact: recommendations.reduce(
        (sum, r) =>
          sum +
          r.potential_impact.revenue_impact +
          Math.abs(r.potential_impact.cost_impact),
        0
      ),
    };

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        summary: recommendationSummary,
        analysis_basis: {
          data_points_analyzed: dataResult.data_points.length,
          predictions_generated: predictions.length,
          insights_generated: insights.length,
        },
        analysis_period: {
          start: defaultStartDate,
          end: defaultEndDate,
        },
        context_applied: !!context,
      },
      meta: {
        action: "recommendations",
        recommendations_count: recommendations.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Recommendations generation error:", error);
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
