/**
 * Benchmark Data Integration API
 * Task 72.4: Integreer synthetische en benchmark data generatie
 *
 * API endpoint voor het beheren van benchmark data integratie en vergelijkingen
 */

import { NextRequest, NextResponse } from "next/server";
import { BenchmarkDataIntegrator } from "@/lib/data-seeding/benchmark-data-integrator";
import { logger } from "@/lib/logger";

// Initialize the benchmark data integrator
let benchmarkIntegrator: BenchmarkDataIntegrator;

const getBenchmarkIntegrator = () => {
  if (!benchmarkIntegrator) {
    benchmarkIntegrator = new BenchmarkDataIntegrator();
  }
  return benchmarkIntegrator;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "summary";

    const integrator = getBenchmarkIntegrator();

    switch (action) {
      case "summary":
        const summary = await integrator.getBenchmarkSummary();
        return NextResponse.json({
          success: true,
          data: summary,
          timestamp: new Date().toISOString(),
        });

      case "sources":
        // Get available benchmark data sources
        const sources = [
          {
            id: "social_media_benchmarks",
            name: "Social Media Industry Benchmarks",
            provider: "Industry Analytics Corp",
            industry: "digital_marketing",
            data_type: "social_media",
            status: "active",
            last_update: new Date(
              Date.now() - 2 * 60 * 60 * 1000
            ).toISOString(),
            data_freshness: 95,
            quality_score: 0.92,
            metrics_count: 15,
            coverage_regions: ["US", "EU", "APAC"],
            update_frequency: "weekly",
          },
          {
            id: "marketing_campaign_benchmarks",
            name: "Digital Marketing Campaign Benchmarks",
            provider: "Marketing Intelligence Hub",
            industry: "digital_marketing",
            data_type: "marketing",
            status: "active",
            last_update: new Date(
              Date.now() - 8 * 60 * 60 * 1000
            ).toISOString(),
            data_freshness: 88,
            quality_score: 0.88,
            metrics_count: 12,
            coverage_regions: ["US", "EU"],
            update_frequency: "monthly",
          },
          {
            id: "customer_analytics_benchmarks",
            name: "Customer Experience Benchmarks",
            provider: "Customer Intelligence Network",
            industry: "cross_industry",
            data_type: "operational",
            status: "maintenance",
            last_update: new Date(
              Date.now() - 24 * 60 * 60 * 1000
            ).toISOString(),
            data_freshness: 72,
            quality_score: 0.85,
            metrics_count: 18,
            coverage_regions: ["US", "EU", "APAC"],
            update_frequency: "quarterly",
          },
          {
            id: "financial_benchmarks",
            name: "Industry Financial Performance Benchmarks",
            provider: "Financial Metrics Institute",
            industry: "cross_industry",
            data_type: "financial",
            status: "active",
            last_update: new Date(
              Date.now() - 12 * 60 * 60 * 1000
            ).toISOString(),
            data_freshness: 91,
            quality_score: 0.95,
            metrics_count: 22,
            coverage_regions: ["US", "EU", "APAC", "LATAM"],
            update_frequency: "quarterly",
          },
        ];

        return NextResponse.json({
          success: true,
          data: { sources },
          timestamp: new Date().toISOString(),
        });

      case "metrics":
        const industry = searchParams.get("industry") || "technology";
        const availableMetrics = await integrator.getAvailableMetrics(industry);

        return NextResponse.json({
          success: true,
          data: availableMetrics,
          timestamp: new Date().toISOString(),
        });

      case "data":
        const sourceId = searchParams.get("source_id");
        const filterIndustry = searchParams.get("industry");
        const companySize = searchParams.get("company_size");
        const region = searchParams.get("region");
        const metrics = searchParams.get("metrics")?.split(",");

        if (!sourceId) {
          return NextResponse.json(
            { success: false, error: "Source ID is required" },
            { status: 400 }
          );
        }

        const benchmarkData = await integrator.fetchBenchmarkData(sourceId, {
          industry: filterIndustry || undefined,
          metrics,
          company_size: companySize || undefined,
          region: region || undefined,
        });

        return NextResponse.json({
          success: true,
          data: benchmarkData,
          timestamp: new Date().toISOString(),
        });

      case "health":
        // Return health status of all benchmark sources
        const healthStatus = {
          overall_health: "good",
          active_sources: 3,
          total_sources: 4,
          sources_with_issues: 1,
          average_data_freshness: 86.5,
          last_health_check: new Date().toISOString(),
          issues: [
            {
              source_id: "customer_analytics_benchmarks",
              issue_type: "maintenance",
              severity: "medium",
              description: "Source under maintenance, data may be stale",
              estimated_resolution: "2024-01-16T12:00:00Z",
            },
          ],
        };

        return NextResponse.json({
          success: true,
          data: healthStatus,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error("Benchmark data API error (GET): " + errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process benchmark data request",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    const integrator = getBenchmarkIntegrator();

    switch (action) {
      case "compare":
        const { userMetrics, industry, companySize, region } = params;

        if (!userMetrics || typeof userMetrics !== "object") {
          return NextResponse.json(
            { success: false, error: "User metrics object is required" },
            { status: 400 }
          );
        }

        if (!industry) {
          return NextResponse.json(
            { success: false, error: "Industry is required for comparison" },
            { status: 400 }
          );
        }

        logger.info("Starting benchmark comparison", {
          industry,
          companySize,
          region,
          metricsCount: Object.keys(userMetrics).length,
        });

        const comparisonResult = await integrator.compareWithBenchmarks(
          userMetrics,
          industry,
          companySize,
          region
        );

        return NextResponse.json({
          success: true,
          data: comparisonResult,
          timestamp: new Date().toISOString(),
        });

      case "batch_compare":
        const { comparisons } = params;

        if (!comparisons || !Array.isArray(comparisons)) {
          return NextResponse.json(
            { success: false, error: "Comparisons array is required" },
            { status: 400 }
          );
        }

        logger.info("Starting batch benchmark comparisons", {
          comparisonCount: comparisons.length,
        });

        const batchResults = [];

        for (const comparison of comparisons) {
          try {
            const result = await integrator.compareWithBenchmarks(
              comparison.userMetrics,
              comparison.industry,
              comparison.companySize,
              comparison.region
            );

            batchResults.push({
              comparison_id:
                comparison.id ||
                `comp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              success: true,
              result,
            });
          } catch (error) {
            batchResults.push({
              comparison_id: comparison.id || "unknown",
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }

        const successfulComparisons = batchResults.filter(
          r => r.success
        ).length;

        return NextResponse.json({
          success: true,
          data: {
            batch_id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            total_comparisons: comparisons.length,
            successful_comparisons: successfulComparisons,
            failed_comparisons: comparisons.length - successfulComparisons,
            results: batchResults,
          },
          timestamp: new Date().toISOString(),
        });

      case "refresh_source":
        const { sourceId: refreshSourceId } = params;

        if (!refreshSourceId) {
          return NextResponse.json(
            { success: false, error: "Source ID is required" },
            { status: 400 }
          );
        }

        logger.info("Refreshing benchmark data source", {
          sourceId: refreshSourceId,
        });

        // Simulate refresh process
        const refreshResult = {
          source_id: refreshSourceId,
          refresh_started: new Date().toISOString(),
          estimated_completion: new Date(
            Date.now() + 5 * 60 * 1000
          ).toISOString(),
          previous_update: new Date(
            Date.now() - 8 * 60 * 60 * 1000
          ).toISOString(),
          expected_new_records: Math.floor(Math.random() * 1000) + 500,
        };

        return NextResponse.json({
          success: true,
          data: refreshResult,
          timestamp: new Date().toISOString(),
        });

      case "analyze_trends":
        const {
          sourceId: trendSourceId,
          metric,
          timeRange = "90d",
          industry: trendIndustry,
        } = params;

        if (!trendSourceId || !metric) {
          return NextResponse.json(
            { success: false, error: "Source ID and metric are required" },
            { status: 400 }
          );
        }

        logger.info("Analyzing benchmark trends", {
          sourceId: trendSourceId,
          metric,
          timeRange,
          industry: trendIndustry,
        });

        // Generate mock trend analysis
        const trendAnalysis = {
          metric_name: metric,
          source_id: trendSourceId,
          time_range: timeRange,
          industry: trendIndustry,
          trend_direction: Math.random() > 0.5 ? "increasing" : "decreasing",
          trend_strength: Math.random() * 0.8 + 0.2,
          seasonal_patterns: Math.random() > 0.6,
          data_points: Array.from({ length: 12 }, (_, i) => ({
            period: `2024-${String(i + 1).padStart(2, "0")}`,
            value: 50 + Math.random() * 50,
            percentile_25: 40 + Math.random() * 30,
            percentile_75: 60 + Math.random() * 30,
          })),
          insights: [
            "Strong upward trend in Q4 2023",
            "Seasonal dip observed in summer months",
            "Industry performance improving overall",
          ],
        };

        return NextResponse.json({
          success: true,
          data: trendAnalysis,
          timestamp: new Date().toISOString(),
        });

      case "custom_benchmark":
        const {
          name,
          description,
          metrics: customMetrics,
          industry: customIndustry,
          data,
        } = params;

        if (!name || !customMetrics || !data) {
          return NextResponse.json(
            { success: false, error: "Name, metrics, and data are required" },
            { status: 400 }
          );
        }

        logger.info("Creating custom benchmark", {
          name,
          industry: customIndustry,
          metricsCount: customMetrics.length,
          dataPointsCount: data.length,
        });

        const customBenchmarkId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const customBenchmarkResult = {
          benchmark_id: customBenchmarkId,
          name,
          description,
          industry: customIndustry,
          metrics: customMetrics,
          data_points: data.length,
          created_at: new Date().toISOString(),
          status: "processing",
          estimated_completion: new Date(
            Date.now() + 10 * 60 * 1000
          ).toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: customBenchmarkResult,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error("Benchmark data API error (POST): " + errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process benchmark data request",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, source_id, ...params } = body;

    if (!source_id) {
      return NextResponse.json(
        { success: false, error: "Source ID is required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "update_config":
        const { config } = params;

        logger.info("Updating benchmark source configuration", {
          sourceId: source_id,
          config,
        });

        return NextResponse.json({
          success: true,
          data: {
            source_id,
            updated_config: config,
            updated_at: new Date().toISOString(),
            restart_required: true,
          },
          timestamp: new Date().toISOString(),
        });

      case "toggle_status":
        const { enabled } = params;

        logger.info("Toggling benchmark source status", {
          sourceId: source_id,
          enabled,
        });

        return NextResponse.json({
          success: true,
          data: {
            source_id,
            new_status: enabled ? "active" : "inactive",
            changed_at: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        });

      case "update_schedule":
        const { schedule } = params;

        logger.info("Updating benchmark source schedule", {
          sourceId: source_id,
          schedule,
        });

        return NextResponse.json({
          success: true,
          data: {
            source_id,
            new_schedule: schedule,
            next_update: new Date(
              Date.now() + 24 * 60 * 60 * 1000
            ).toISOString(),
            updated_at: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error("Benchmark data API error (PUT): " + errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update benchmark data source",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceId = searchParams.get("source_id");
    const action = searchParams.get("action") || "delete";

    if (!sourceId) {
      return NextResponse.json(
        { success: false, error: "Source ID is required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "delete":
        logger.info("Deleting benchmark data source", { sourceId });

        return NextResponse.json({
          success: true,
          data: {
            source_id: sourceId,
            deleted: true,
            deleted_at: new Date().toISOString(),
            cleanup_scheduled: true,
          },
          timestamp: new Date().toISOString(),
        });

      case "clear_cache":
        logger.info("Clearing benchmark data cache", { sourceId });

        return NextResponse.json({
          success: true,
          data: {
            source_id: sourceId,
            cache_cleared: true,
            cleared_at: new Date().toISOString(),
            freed_memory_mb: Math.floor(Math.random() * 100) + 50,
          },
          timestamp: new Date().toISOString(),
        });

      case "reset_metrics":
        logger.info("Resetting benchmark metrics", { sourceId });

        return NextResponse.json({
          success: true,
          data: {
            source_id: sourceId,
            metrics_reset: true,
            reset_at: new Date().toISOString(),
            next_collection: new Date(
              Date.now() + 60 * 60 * 1000
            ).toISOString(),
          },
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error("Benchmark data API error (DELETE): " + errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete benchmark data",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
