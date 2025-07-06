import { NextRequest, NextResponse } from "next/server";
import {
  PredictiveAnalyticsService,
  BusinessForecast,
} from "@/lib/analytics/predictive-analytics-service";
import { TacticalDataPoint } from "@/lib/analytics/tactical-data-engine";

// Initialize the predictive analytics service
const predictiveService = new PredictiveAnalyticsService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      metrics = ["revenue", "customers", "orders"],
      timeframe = "medium",
      historicalData,
      config,
    } = body;

    // Validate request data
    if (!historicalData || !Array.isArray(historicalData)) {
      return NextResponse.json(
        { error: "Historical data is required and must be an array" },
        { status: 400 }
      );
    }

    if (historicalData.length < 10) {
      return NextResponse.json(
        {
          error:
            "Insufficient historical data. At least 10 data points required.",
        },
        { status: 400 }
      );
    }

    // Validate timeframe
    const validTimeframes = ["short", "medium", "long"];
    if (!validTimeframes.includes(timeframe)) {
      return NextResponse.json(
        { error: "Invalid timeframe. Must be 'short', 'medium', or 'long'" },
        { status: 400 }
      );
    }

    // Convert raw data to TacticalDataPoint format
    const formattedData: TacticalDataPoint[] = historicalData.map(
      (point: any) => ({
        timestamp: point.timestamp || point.date || new Date().toISOString(),
        value: parseFloat(point.value || point.amount || point.count || 0),
        category: point.category || point.metric || "general",
        source: (point.source || "financial") as
          | "shopify"
          | "kajabi"
          | "financial"
          | "marketing",
        metadata: point.metadata || {},
      })
    );

    // Generate forecasts using the predictive analytics service
    const forecasts = await predictiveService.generateBusinessForecasts(
      formattedData,
      metrics,
      timeframe
    );

    // Return the forecasts
    return NextResponse.json({
      success: true,
      data: {
        forecasts,
        metadata: {
          generated_at: new Date().toISOString(),
          timeframe,
          metrics_analyzed: metrics,
          data_points_used: formattedData.length,
          model_version: "v1.0.0",
        },
      },
    });
  } catch (error) {
    console.error("Error generating forecasts:", error);

    return NextResponse.json(
      {
        error: "Failed to generate forecasts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeframe = searchParams.get("timeframe") || "medium";
    const metrics = searchParams.get("metrics")?.split(",") || ["revenue"];

    // Generate demo/sample forecasts for GET requests
    const demoData = generateDemoHistoricalData();

    const forecasts = await predictiveService.generateBusinessForecasts(
      demoData,
      metrics,
      timeframe as "short" | "medium" | "long"
    );

    return NextResponse.json({
      success: true,
      data: {
        forecasts,
        metadata: {
          generated_at: new Date().toISOString(),
          timeframe,
          metrics_analyzed: metrics,
          data_points_used: demoData.length,
          model_version: "v1.0.0",
          demo_mode: true,
        },
      },
    });
  } catch (error) {
    console.error("Error generating demo forecasts:", error);

    return NextResponse.json(
      {
        error: "Failed to generate demo forecasts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper function to generate demo historical data
function generateDemoHistoricalData(): TacticalDataPoint[] {
  const data: TacticalDataPoint[] = [];
  const now = new Date();

  // Generate 90 days of demo data
  for (let i = 90; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Revenue data with seasonal pattern and growth trend
    const baseRevenue = 100000;
    const seasonalFactor =
      1 + 0.2 * Math.sin((date.getMonth() / 12) * 2 * Math.PI);
    const growthFactor = 1 + (90 - i) * 0.002; // 0.2% growth per day
    const noise = 1 + (Math.random() - 0.5) * 0.1; // 10% noise

    data.push({
      timestamp: date.toISOString(),
      value: Math.round(baseRevenue * seasonalFactor * growthFactor * noise),
      category: "revenue",
      source: "financial",
      metadata: {
        day_of_week: date.getDay(),
        month: date.getMonth(),
        is_weekend: date.getDay() === 0 || date.getDay() === 6,
        demo: true,
      },
    });

    // Customer data
    const baseCustomers = 500;
    const customerGrowth = 1 + (90 - i) * 0.001; // 0.1% growth per day
    const customerNoise = 1 + (Math.random() - 0.5) * 0.15;

    data.push({
      timestamp: date.toISOString(),
      value: Math.round(baseCustomers * customerGrowth * customerNoise),
      category: "customers",
      source: "marketing",
      metadata: {
        day_of_week: date.getDay(),
        month: date.getMonth(),
        demo: true,
      },
    });

    // Orders data
    const baseOrders = 200;
    const orderSeasonal =
      1 + 0.15 * Math.sin((date.getMonth() / 12) * 2 * Math.PI);
    const orderGrowth = 1 + (90 - i) * 0.0015;
    const orderNoise = 1 + (Math.random() - 0.5) * 0.2;

    data.push({
      timestamp: date.toISOString(),
      value: Math.round(baseOrders * orderSeasonal * orderGrowth * orderNoise),
      category: "orders",
      source: "shopify",
      metadata: {
        day_of_week: date.getDay(),
        month: date.getMonth(),
        demo: true,
      },
    });
  }

  return data;
}
