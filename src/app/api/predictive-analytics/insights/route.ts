import { NextRequest, NextResponse } from "next/server";
import {
  PredictiveAnalyticsService,
  PredictiveInsight,
} from "@/lib/analytics/predictive-analytics-service";
import { TacticalDataPoint } from "@/lib/analytics/tactical-data-engine";

const predictiveService = new PredictiveAnalyticsService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      historicalData,
      forecasts = [],
      includeAnomalies = true,
      includeOpportunities = true,
      includeStrategicInsights = true,
      priority = "all",
    } = body;

    if (!historicalData || !Array.isArray(historicalData)) {
      return NextResponse.json(
        { error: "Historical data is required and must be an array" },
        { status: 400 }
      );
    }

    const formattedData: TacticalDataPoint[] = historicalData.map(
      (point: any, index: number) => ({
        timestamp: point.timestamp || point.date || new Date().toISOString(),
        value: parseFloat(point.value || point.amount || point.count || 0),
        category: point.category || point.metric || "general",
        source: point.source || "financial",
        metadata: {
          ...point.metadata,
          context: point.context || {},
        },
      })
    );

    // Generate insights
    const insights = await predictiveService.generatePredictiveInsights(
      formattedData,
      forecasts
    );

    // Filter insights based on preferences
    let filteredInsights = insights;

    if (priority !== "all") {
      filteredInsights = insights.filter(
        insight => insight.priority === priority
      );
    }

    if (!includeAnomalies) {
      filteredInsights = filteredInsights.filter(
        insight => insight.type !== "anomaly"
      );
    }

    if (!includeOpportunities) {
      filteredInsights = filteredInsights.filter(
        insight => insight.type !== "opportunity"
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        insights: filteredInsights,
        metadata: {
          generated_at: new Date().toISOString(),
          total_insights: insights.length,
          filtered_insights: filteredInsights.length,
          data_points_analyzed: formattedData.length,
          filters_applied: {
            priority,
            includeAnomalies,
            includeOpportunities,
            includeStrategicInsights,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error generating insights:", error);

    return NextResponse.json(
      {
        error: "Failed to generate insights",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const priority = searchParams.get("priority") || "all";
    const includeAnomalies = searchParams.get("anomalies") !== "false";
    const includeOpportunities = searchParams.get("opportunities") !== "false";

    // Generate demo insights
    const demoData = generateDemoHistoricalData();
    const demoForecasts = await predictiveService.generateBusinessForecasts(
      demoData,
      ["revenue", "customers", "orders"],
      "medium"
    );

    const insights = await predictiveService.generatePredictiveInsights(
      demoData,
      demoForecasts
    );

    // Apply filters
    let filteredInsights = insights;
    if (priority !== "all") {
      filteredInsights = insights.filter(
        insight => insight.priority === priority
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        insights: filteredInsights,
        metadata: {
          generated_at: new Date().toISOString(),
          total_insights: insights.length,
          filtered_insights: filteredInsights.length,
          demo_mode: true,
          filters_applied: {
            priority,
            includeAnomalies,
            includeOpportunities,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error generating demo insights:", error);

    return NextResponse.json(
      {
        error: "Failed to generate demo insights",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function generateDemoHistoricalData(): TacticalDataPoint[] {
  const data: TacticalDataPoint[] = [];
  const now = new Date();

  for (let i = 60; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const baseRevenue = 100000;
    const seasonalFactor =
      1 + 0.2 * Math.sin((date.getMonth() / 12) * 2 * Math.PI);
    const growthFactor = 1 + (60 - i) * 0.002;
    const noise = 1 + (Math.random() - 0.5) * 0.1;

    data.push({
      timestamp: date.toISOString(),
      value: Math.round(baseRevenue * seasonalFactor * growthFactor * noise),
      category: "revenue",
      source: "financial",
      metadata: {
        day_of_week: date.getDay(),
        month: date.getMonth(),
        demo: true,
      },
    });
  }

  return data;
}
