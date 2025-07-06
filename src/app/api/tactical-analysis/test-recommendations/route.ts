/**
 * Test Recommendations API - For validating the recommendation engine
 */

import { NextRequest, NextResponse } from "next/server";
import { tacticalRecommendationEngine } from "@/lib/analytics/tactical-recommendation-engine";
import { MLPrediction } from "@/lib/analytics/tactical-ml-models";
import { PredictiveInsight } from "@/lib/analytics/tactical-data-engine";

export async function GET(request: NextRequest) {
  try {
    // Create sample ML predictions for testing
    const samplePredictions: MLPrediction[] = [
      {
        id: "test_revenue_1",
        model_type: "trend_analysis",
        metric: "shopify_revenue",
        current_value: 50000,
        predicted_value: 42000,
        confidence_score: 85,
        change_percentage: -16,
        trend: "decreasing",
        prediction_date: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: "test_cost_1",
        model_type: "forecasting",
        metric: "operating_costs",
        current_value: 30000,
        predicted_value: 33000,
        confidence_score: 75,
        change_percentage: 10,
        trend: "increasing",
        prediction_date: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: "test_opportunity_1",
        model_type: "trend_analysis",
        metric: "marketing_performance",
        current_value: 15000,
        predicted_value: 22000,
        confidence_score: 90,
        change_percentage: 47,
        trend: "increasing",
        prediction_date: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        created_at: new Date().toISOString(),
      },
    ];

    // Create sample insights for testing
    const sampleInsights: PredictiveInsight[] = [
      {
        id: "insight_revenue_decline",
        title: "Revenue Decline Alert",
        description:
          "Revenue showing significant decline pattern with high confidence",
        confidence_score: 85,
        impact_score: 80,
        time_horizon: "1month",
        data_sources: ["shopify", "financial"],
        predictions: [
          {
            metric: "revenue",
            current_value: 50000,
            predicted_value: 42000,
            change_percentage: -16,
            trend: "decreasing",
          },
        ],
        recommendations: [
          "Review marketing campaigns",
          "Analyze customer retention",
        ],
        risk_factors: ["Customer churn increase", "Market competition"],
        created_at: new Date().toISOString(),
      },
      {
        id: "insight_marketing_opportunity",
        title: "Marketing Performance Growth",
        description: "Marketing metrics showing strong growth potential",
        confidence_score: 90,
        impact_score: 75,
        time_horizon: "1month",
        data_sources: ["marketing", "analytics"],
        predictions: [
          {
            metric: "marketing_performance",
            current_value: 15000,
            predicted_value: 22000,
            change_percentage: 47,
            trend: "increasing",
          },
        ],
        recommendations: [
          "Scale successful campaigns",
          "Increase marketing budget",
        ],
        risk_factors: [],
        created_at: new Date().toISOString(),
      },
    ];

    // Test business context
    const testContext = {
      company_size: "small" as const,
      risk_tolerance: "moderate" as const,
      budget_constraints: {
        max_investment: 25000,
        preferred_roi_months: 6,
      },
      current_priorities: ["revenue_growth", "cost_optimization"],
    };

    // Generate recommendations
    const recommendations =
      await tacticalRecommendationEngine.generateRecommendations(
        samplePredictions,
        sampleInsights,
        testContext
      );

    return NextResponse.json({
      success: true,
      data: {
        test_summary: {
          sample_predictions: samplePredictions.length,
          sample_insights: sampleInsights.length,
          generated_recommendations: recommendations.length,
          context_applied: true,
        },
        sample_data: {
          predictions: samplePredictions,
          insights: sampleInsights,
          context: testContext,
        },
        recommendations,
        recommendation_analysis: {
          by_priority: {
            critical: recommendations.filter(r => r.priority === "critical")
              .length,
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
                  recommendations.reduce(
                    (sum, r) => sum + r.confidence_score,
                    0
                  ) / recommendations.length
                )
              : 0,
        },
      },
      meta: {
        test_type: "recommendation_engine_validation",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Test recommendations error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to test recommendation engine",
        message: String(error),
        stack:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
