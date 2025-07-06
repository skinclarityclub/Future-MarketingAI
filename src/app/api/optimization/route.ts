import { NextRequest, NextResponse } from "next/server";
import { ContentROIAdapter } from "@/lib/analytics/content-roi-adapter";
import { OptimizationEngine } from "@/lib/analytics/optimization-engine";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeHistorical = searchParams.get("include_historical") === "true";

    // Initialize adapters and engine
    const contentAdapter = new ContentROIAdapter();
    const optimizationEngine = new OptimizationEngine();

    // Get content metrics and ROI results
    const contentMetrics = await contentAdapter.fetchContentMetrics();
    const roiResults = await contentAdapter.calculateContentROI();

    // Get historical data if requested (optional)
    let historicalData;
    if (includeHistorical) {
      // This would fetch historical data from database
      // For now, we'll pass undefined to use current data only
      historicalData = undefined;
    }

    // Generate optimization insights
    const insights = optimizationEngine.generateRecommendations(
      contentMetrics,
      roiResults,
      historicalData
    );

    return NextResponse.json({
      success: true,
      data: insights,
      timestamp: new Date().toISOString(),
      recommendations_count: insights.top_opportunities.length,
      quick_wins_count: insights.quick_wins.length,
      strategic_initiatives_count: insights.strategic_initiatives.length,
    });
  } catch (error) {
    console.error("Optimization API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate optimization recommendations",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content_metrics, roi_results, historical_data } = body;

    // Validate required data
    if (!content_metrics || !roi_results) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required data: content_metrics and roi_results are required",
        },
        { status: 400 }
      );
    }

    const optimizationEngine = new OptimizationEngine();

    // Generate optimization insights with custom data
    const insights = optimizationEngine.generateRecommendations(
      content_metrics,
      roi_results,
      historical_data
    );

    return NextResponse.json({
      success: true,
      data: insights,
      timestamp: new Date().toISOString(),
      input_metrics_count: content_metrics.length,
      input_roi_results_count: roi_results.length,
      recommendations_generated: insights.top_opportunities.length,
    });
  } catch (error) {
    console.error("Optimization POST API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process optimization request",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
