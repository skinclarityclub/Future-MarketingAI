/**
 * Tactical Data Analysis - Data Integration API Endpoint
 * Handles data integration and preprocessing from Shopify, Kajabi, and financial sources
 */

import { NextRequest, NextResponse } from "next/server";
import {
  tacticalDataEngine,
  type TacticalEngineConfig,
} from "@/lib/analytics/tactical-data-engine";
import { z } from "zod";

// Request schema validation
const dataIntegrationSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sources: z
    .array(z.enum(["shopify", "kajabi", "financial", "marketing"]))
    .optional(),
  config: z
    .object({
      shopify_enabled: z.boolean().optional(),
      kajabi_enabled: z.boolean().optional(),
      financial_enabled: z.boolean().optional(),
      marketing_enabled: z.boolean().optional(),
      lookback_days: z.number().min(1).max(365).optional(),
      prediction_horizon_days: z.number().min(1).max(365).optional(),
      min_confidence_threshold: z.number().min(0).max(100).optional(),
    })
    .optional(),
});

const aggregationSchema = z.object({
  categories: z.array(z.string()).optional(),
  sources: z
    .array(z.enum(["shopify", "kajabi", "financial", "marketing"]))
    .optional(),
  groupBy: z.enum(["day", "week", "month"]),
  startDate: z.string(),
  endDate: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "integrate";

    switch (action) {
      case "integrate":
        return await integrateData(request);
      case "aggregate":
        return await getAggregatedData(request);
      case "summary":
        return await getDataSummary(request);
      case "clean":
        return await cleanData(request);
      default:
        return NextResponse.json(
          {
            error:
              "Invalid action. Use: integrate, aggregate, summary, or clean",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Tactical Data Analysis API Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "status";

    switch (action) {
      case "status":
        return getEngineStatus();
      case "health":
        return getHealthCheck();
      default:
        return NextResponse.json(
          { error: "Invalid action. Use: status or health" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Tactical Data Analysis GET API Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Integrate data from all configured sources
 */
async function integrateData(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = dataIntegrationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { startDate, endDate, config } = validation.data;

    // Create engine instance with custom config if provided
    let engine = tacticalDataEngine;
    if (config) {
      const { TacticalDataAnalysisEngine } = await import(
        "@/lib/analytics/tactical-data-engine"
      );
      engine = new TacticalDataAnalysisEngine(config as TacticalEngineConfig);
    }

    // Set date range
    const dateRange = startDate && endDate ? { startDate, endDate } : undefined;

    // Integrate data from all sources
    const result = await engine.integrateData(dateRange);

    // Generate summary for the response
    const summary = engine.generateDataSummary(result.data_points);

    return NextResponse.json({
      success: result.success,
      data: {
        integration_result: result,
        summary,
        processed_points: result.data_points.length,
        processing_time_ms: result.processing_time,
      },
      meta: {
        action: "data_integration",
        timestamp: new Date().toISOString(),
        config_used: config || "default",
      },
    });
  } catch (error) {
    console.error("Data integration error:", error);
    return NextResponse.json(
      {
        error: "Failed to integrate data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Get aggregated data by time period and categories
 */
async function getAggregatedData(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = aggregationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid aggregation parameters",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const params = validation.data;
    const aggregatedData = await tacticalDataEngine.getAggregatedData(params);

    // Calculate aggregation statistics
    const totalPeriods = Object.keys(aggregatedData).length;
    const totalDataPoints = Object.values(aggregatedData).reduce(
      (sum, points) => sum + points.length,
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        aggregated_data: aggregatedData,
        periods: Object.keys(aggregatedData).sort(),
        statistics: {
          total_periods: totalPeriods,
          total_data_points: totalDataPoints,
          avg_points_per_period:
            totalPeriods > 0 ? totalDataPoints / totalPeriods : 0,
        },
      },
      meta: {
        action: "data_aggregation",
        timestamp: new Date().toISOString(),
        params: params,
      },
    });
  } catch (error) {
    console.error("Data aggregation error:", error);
    return NextResponse.json(
      {
        error: "Failed to aggregate data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Get data summary and statistics
 */
async function getDataSummary(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, endDate } = body;

    // Get recent data if no range specified
    const dateRange = startDate && endDate ? { startDate, endDate } : undefined;
    const result = await tacticalDataEngine.integrateData(dateRange);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Failed to fetch data for summary",
          details: result.errors,
        },
        { status: 500 }
      );
    }

    const summary = tacticalDataEngine.generateDataSummary(result.data_points);

    return NextResponse.json({
      success: true,
      data: {
        summary,
        integration_status: {
          success: result.success,
          errors: result.errors,
          processing_time: result.processing_time,
          last_updated: result.last_updated,
        },
      },
      meta: {
        action: "data_summary",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Data summary error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate data summary",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Clean and normalize data
 */
async function cleanData(request: NextRequest) {
  try {
    const body = await request.json();
    const { data_points } = body;

    if (!Array.isArray(data_points)) {
      return NextResponse.json(
        { error: "data_points must be an array" },
        { status: 400 }
      );
    }

    const cleanedData = tacticalDataEngine.cleanData(data_points);
    const originalCount = data_points.length;
    const cleanedCount = cleanedData.length;
    const removedCount = originalCount - cleanedCount;

    return NextResponse.json({
      success: true,
      data: {
        cleaned_data: cleanedData,
        statistics: {
          original_count: originalCount,
          cleaned_count: cleanedCount,
          removed_count: removedCount,
          cleaning_efficiency:
            originalCount > 0 ? (cleanedCount / originalCount) * 100 : 0,
        },
      },
      meta: {
        action: "data_cleaning",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Data cleaning error:", error);
    return NextResponse.json(
      {
        error: "Failed to clean data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Get engine status and configuration
 */
async function getEngineStatus() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        engine_status: "operational",
        capabilities: [
          "shopify_integration",
          "kajabi_integration",
          "financial_data_integration",
          "marketing_data_integration",
          "data_cleaning",
          "time_series_aggregation",
          "statistical_analysis",
        ],
        supported_sources: ["shopify", "kajabi", "financial", "marketing"],
        supported_categories: [
          "revenue",
          "expenses",
          "investments",
          "cash_flow",
          "clicks",
          "impressions",
          "ad_spend",
          "units_sold",
        ],
        version: "1.0.0",
      },
      meta: {
        action: "engine_status",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Engine status error:", error);
    return NextResponse.json(
      {
        error: "Failed to get engine status",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Health check for all data sources
 */
async function getHealthCheck() {
  try {
    const healthStatus = {
      overall: "healthy",
      components: {
        supabase: "unknown",
        shopify: "unknown",
        kajabi: "unknown",
        data_engine: "healthy",
      },
      last_check: new Date().toISOString(),
    };

    // Test data integration (simplified health check)
    try {
      const testResult = await tacticalDataEngine.integrateData({
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      });

      if (testResult.success) {
        healthStatus.components.supabase = "healthy";
        if (testResult.data_points.some(p => p.source === "shopify")) {
          healthStatus.components.shopify = "healthy";
        }
        if (testResult.data_points.some(p => p.source === "kajabi")) {
          healthStatus.components.kajabi = "healthy";
        }
      } else {
        healthStatus.overall = "degraded";
        healthStatus.components.supabase = "degraded";
      }
    } catch (error) {
      healthStatus.overall = "unhealthy";
      healthStatus.components.supabase = "unhealthy";
    }

    return NextResponse.json({
      success: true,
      data: healthStatus,
      meta: {
        action: "health_check",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        error: "Failed to perform health check",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
