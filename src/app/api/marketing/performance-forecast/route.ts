/**
 * Marketing Performance Forecasting API
 * Simplified version with fallback to mock data when ML services fail
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Request validation schema
const MarketingForecastSchema = z.object({
  metric: z.enum(["roi", "leads", "conversion_rate", "spend", "revenue"]),
  timeframe: z.enum(["short", "medium", "long"]).default("medium"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Mock data generator for fallback
function generateMockForecast(metric: string, timeframe: string) {
  const metricConfig = {
    roi: { base: 325, unit: "%", label: "ROI" },
    leads: { base: 1247, unit: "", label: "Leads" },
    conversion_rate: { base: 3.8, unit: "%", label: "Conversion Rate" },
    spend: { base: 45000, unit: "€", label: "Marketing Spend" },
    revenue: { base: 142000, unit: "€", label: "Revenue" },
  };

  const config =
    metricConfig[metric as keyof typeof metricConfig] || metricConfig.roi;
  const days = timeframe === "short" ? 7 : timeframe === "medium" ? 30 : 90;
  const forecasts = [];

  for (let i = 1; i <= days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    const trendFactor = 1 + Math.sin(i / 10) * 0.1;
    const seasonality = 1 + Math.sin(i / 7) * 0.05; // Weekly pattern
    const noise = 0.95 + Math.random() * 0.1; // ±5% noise

    const predicted_value = config.base * trendFactor * seasonality * noise;
    const uncertainty = predicted_value * 0.15; // 15% uncertainty

    forecasts.push({
      date: date.toISOString(),
      predicted_value: Math.round(predicted_value * 100) / 100,
      confidence_interval: {
        lower: Math.max(
          0,
          Math.round((predicted_value - uncertainty) * 100) / 100
        ),
        upper: Math.round((predicted_value + uncertainty) * 100) / 100,
      },
      confidence_score: 75 + Math.random() * 20, // 75-95% confidence
      trend:
        predicted_value > config.base
          ? "up"
          : predicted_value < config.base * 0.95
            ? "down"
            : "stable",
    });
  }

  const finalValue = forecasts[forecasts.length - 1].predicted_value;
  const changePercent = ((finalValue - config.base) / config.base) * 100;

  return {
    metric,
    current_value: config.base,
    forecasts,
    insights: {
      summary: `${config.label} voorspeld om ${changePercent > 0 ? "te stijgen" : changePercent < -5 ? "te dalen" : "stabiel te blijven"} met ${Math.abs(changePercent).toFixed(1)}% verandering`,
      trend:
        changePercent > 5
          ? "upward"
          : changePercent < -5
            ? "downward"
            : "stable",
      seasonality_detected: Math.random() > 0.5,
      volatility_level:
        Math.abs(changePercent) > 15
          ? "high"
          : Math.abs(changePercent) > 8
            ? "medium"
            : "low",
      key_drivers: [
        "Historical performance",
        "Seasonal patterns",
        "Market trends",
      ],
      risk_factors:
        changePercent < -10 ? ["Budget constraints", "Market saturation"] : [],
      opportunities:
        changePercent > 10
          ? ["Scale successful campaigns", "Invest in growth"]
          : [],
    },
    model_performance: {
      accuracy: 0.85 + Math.random() * 0.1,
      confidence: 0.78 + Math.random() * 0.15,
      last_updated: new Date().toISOString(),
    },
    alerts:
      changePercent < -10
        ? [
            {
              type: "warning" as const,
              message: `${config.label} verwacht significant te dalen`,
              severity: Math.abs(changePercent) / 10,
            },
          ]
        : changePercent > 15
          ? [
              {
                type: "opportunity" as const,
                message: `Sterke groei voorspeld voor ${config.label}`,
                severity: changePercent / 20,
              },
            ]
          : [],
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const rawParams = {
      metric: searchParams.get("metric") || "roi",
      timeframe: searchParams.get("timeframe") || "medium",
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
    };

    const validation = MarketingForecastSchema.safeParse(rawParams);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parameters",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { metric, timeframe } = validation.data;

    // For now, always use mock data for stable operation
    // In production, you would first try ML services, then fallback to mock
    const forecastData = generateMockForecast(metric, timeframe);

    return NextResponse.json({
      success: true,
      data: forecastData,
      metadata: {
        generated_at: new Date().toISOString(),
        metric,
        timeframe,
        data_source: "mock", // Indicates this is mock data
        model_version: "mock-v1.0.0",
      },
    });
  } catch (error) {
    console.error("Marketing forecast API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // POST method implementation (similar to GET but with request body)
  return GET(request); // For simplicity, use same logic
}
