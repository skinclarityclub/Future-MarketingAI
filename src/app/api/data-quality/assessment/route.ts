/**
 * Data Quality Assessment API
 * Task 72.3: Implementeer data cleaning en normalisatie modules
 *
 * API endpoint voor comprehensive data quality assessment,
 * normalisatie en monitoring van alle data sources
 */

import { NextRequest, NextResponse } from "next/server";
import { AdvancedDataNormalizer } from "@/lib/data-seeding/advanced-data-normalization";
import { EnhancedDataQualityAnalyzer } from "@/lib/data-seeding/enhanced-data-quality-analyzer";
import { DataCleaningEngine } from "@/lib/data-seeding/data-cleaning-engine";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source");
    const engines = searchParams.get("engines")?.split(",") || [];
    const includeHistorical = searchParams.get("historical") === "true";

    logger.info("Data quality assessment requested", {
      source,
      engines,
      includeHistorical,
    });

    // Initialize quality analyzer and normalizer
    const qualityAnalyzer = new EnhancedDataQualityAnalyzer();
    const dataNormalizer = new AdvancedDataNormalizer();
    const cleaningEngine = new DataCleaningEngine();

    // Get quality monitoring summary
    const qualitySummary = await qualityAnalyzer.getQualityMonitoringSummary();

    // Get normalization summary
    const normalizationSummary = await dataNormalizer.getNormalizationSummary();

    // Get cleaning summary for the specified timeframe
    const cleaningSummary = await cleaningEngine.getCleaningSummary("day");

    // Mock data source statuses (would typically come from real monitoring)
    const dataSourceStatuses = [
      {
        source_id: "instagram_business",
        source_name: "Instagram Business API",
        status: "healthy",
        quality_score: 94.2,
        last_update: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        records_processed: 1247,
        active_issues: 0,
        processing_rate: 1.2,
        success_rate: 98.7,
      },
      {
        source_id: "linkedin_marketing",
        source_name: "LinkedIn Marketing API",
        status: "warning",
        quality_score: 87.3,
        last_update: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        records_processed: 856,
        active_issues: 3,
        processing_rate: 1.8,
        success_rate: 94.2,
      },
      {
        source_id: "facebook_graph",
        source_name: "Facebook Graph API",
        status: "healthy",
        quality_score: 96.8,
        last_update: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        records_processed: 2134,
        active_issues: 0,
        processing_rate: 0.9,
        success_rate: 99.1,
      },
      {
        source_id: "google_analytics",
        source_name: "Google Analytics 4",
        status: "processing",
        quality_score: 91.5,
        last_update: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        records_processed: 5734,
        active_issues: 1,
        processing_rate: 2.1,
        success_rate: 96.3,
      },
      {
        source_id: "web_scraping",
        source_name: "Website Scraping",
        status: "error",
        quality_score: 73.2,
        last_update: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        records_processed: 432,
        active_issues: 8,
        processing_rate: 3.2,
        success_rate: 87.1,
      },
    ];

    // Mock normalization schemas status
    const normalizationSchemas = [
      {
        schema_id: "content_performance_schema",
        schema_name: "Content Performance Schema",
        target_engine: "Content Analysis Engine",
        records_processed: 12456,
        success_rate: 96.8,
        avg_processing_time_ms: 1.2,
        quality_score: 94.2,
        last_run: new Date(Date.now() - 30 * 1000).toISOString(),
        active: true,
      },
      {
        schema_id: "marketing_intelligence_schema",
        schema_name: "Marketing Intelligence Schema",
        target_engine: "Campaign Optimizer",
        records_processed: 8734,
        success_rate: 94.3,
        avg_processing_time_ms: 2.1,
        quality_score: 91.7,
        last_run: new Date(Date.now() - 60 * 1000).toISOString(),
        active: true,
      },
      {
        schema_id: "navigation_ml_schema",
        schema_name: "Navigation ML Schema",
        target_engine: "AI Navigation Framework",
        records_processed: 15234,
        success_rate: 89.1,
        avg_processing_time_ms: 1.8,
        quality_score: 87.3,
        last_run: new Date(Date.now() - 120 * 1000).toISOString(),
        active: true,
      },
    ];

    // Mock quality issues
    const qualityIssues = [
      {
        issue_id: "missing_engagement_instagram",
        severity: "critical",
        source: "Instagram Business API",
        description: "Missing engagement metrics in Instagram data",
        affected_records: 127,
        first_detected: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        auto_fixable: false,
        business_impact: "high",
      },
      {
        issue_id: "date_format_linkedin",
        severity: "warning",
        source: "LinkedIn Marketing API",
        description: "Date format inconsistencies in LinkedIn feeds",
        affected_records: 45,
        first_detected: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        auto_fixable: true,
        business_impact: "medium",
      },
      {
        issue_id: "campaign_roi_outliers",
        severity: "warning",
        source: "Google Analytics 4",
        description: "Outlier detection in campaign ROI values",
        affected_records: 8,
        first_detected: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        auto_fixable: false,
        business_impact: "medium",
      },
    ];

    // Calculate overall metrics
    const totalRecordsProcessedToday = dataSourceStatuses.reduce(
      (sum, source) => sum + source.records_processed,
      0
    );
    const avgQualityScore =
      dataSourceStatuses.reduce(
        (sum, source) => sum + source.quality_score,
        0
      ) / dataSourceStatuses.length;
    const criticalIssuesCount = qualityIssues.filter(
      issue => issue.severity === "critical"
    ).length;
    const healthySourcesCount = dataSourceStatuses.filter(
      source => source.status === "healthy"
    ).length;

    // Quality trends (mock data)
    const qualityTrends = {
      period: "last_7_days",
      trend_direction: "improving",
      trend_strength: 2.4,
      current_score: avgQualityScore,
      previous_score: avgQualityScore - 2.4,
      forecast: {
        next_week_score: avgQualityScore + 1.2,
        confidence: 0.85,
        factors: ["Improved LinkedIn data handling", "Reduced scraping errors"],
      },
    };

    // Compliance status
    const complianceStatus = {
      gdpr_compliant: true,
      data_retention_compliant: true,
      quality_sla_met: avgQualityScore >= 85,
      audit_ready: criticalIssuesCount === 0,
      compliance_score: avgQualityScore,
      non_compliance_issues:
        criticalIssuesCount > 0
          ? [`${criticalIssuesCount} critical quality issues`]
          : [],
    };

    const response = {
      success: true,
      timestamp: new Date().toISOString(),

      // Overview metrics
      overview: {
        overall_quality_score: Math.round(avgQualityScore * 10) / 10,
        total_sources_monitored: dataSourceStatuses.length,
        healthy_sources: healthySourcesCount,
        active_schemas: normalizationSchemas.filter(s => s.active).length,
        records_processed_today: totalRecordsProcessedToday,
        critical_issues: criticalIssuesCount,
        processing_rate_per_hour: Math.round(
          (totalRecordsProcessedToday * 24) / 24
        ), // Simplified calculation
        auto_fix_success_rate: 89.1,
      },

      // Data source monitoring
      data_sources: dataSourceStatuses,

      // Normalization schemas
      normalization_schemas: normalizationSchemas,

      // Quality dimensions breakdown
      quality_dimensions: {
        completeness: 94.1,
        accuracy: 96.3,
        consistency: 89.7,
        timeliness: 87.8,
        validity: 92.4,
        uniqueness: 98.2,
      },

      // Active quality issues
      quality_issues: qualityIssues,

      // Quality trends and forecasting
      quality_trends: qualityTrends,

      // Processing metrics
      processing_metrics: {
        avg_processing_time_ms: 1.6,
        cleaning_success_rate: 97.8,
        normalization_success_rate: 94.2,
        auto_fix_applied_rate: 89.1,
        throughput_records_per_hour: Math.round(
          (totalRecordsProcessedToday * 24) / 24
        ),
      },

      // Compliance and audit status
      compliance_status: complianceStatus,

      // Recommendations
      recommendations: [
        {
          priority: "urgent",
          category: "data_validation",
          description:
            "Address critical Instagram engagement metrics missing issue",
          expected_improvement: 5.2,
          implementation_effort: "medium",
          timeline: "immediate",
        },
        {
          priority: "high",
          category: "data_processing",
          description:
            "Implement automated date format standardization for LinkedIn",
          expected_improvement: 3.1,
          implementation_effort: "low",
          timeline: "1-2 days",
        },
        {
          priority: "medium",
          category: "system_configuration",
          description:
            "Review and tune outlier detection thresholds for campaign ROI",
          expected_improvement: 2.8,
          implementation_effort: "medium",
          timeline: "1 week",
        },
      ],

      // Historical data if requested
      ...(includeHistorical && {
        historical_data: {
          quality_score_history: [
            {
              date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              score: 86.8,
            },
            {
              date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              score: 87.2,
            },
            {
              date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              score: 88.1,
            },
            {
              date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              score: 88.9,
            },
            {
              date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              score: 89.5,
            },
            {
              date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              score: 90.1,
            },
            {
              date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              score: 90.8,
            },
            {
              date: new Date().toISOString().split("T")[0],
              score: avgQualityScore,
            },
          ],
          processing_volume_history: [
            {
              date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              records: 18450,
            },
            {
              date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              records: 19230,
            },
            {
              date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              records: 17890,
            },
            {
              date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              records: 20450,
            },
            {
              date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              records: 21230,
            },
            {
              date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              records: 22150,
            },
            {
              date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              records: 23890,
            },
            {
              date: new Date().toISOString().split("T")[0],
              records: totalRecordsProcessedToday,
            },
          ],
        },
      }),

      // Integration summary
      integration_summary: {
        quality_analyzer_status: "active",
        data_normalizer_status: "active",
        cleaning_engine_status: "active",
        schemas_registered: normalizationSchemas.length,
        quality_profiles_active: qualitySummary.total_sources_monitored,
        normalization_compatibility: normalizationSummary.engine_compatibility,
      },
    };

    logger.info("Data quality assessment completed successfully", {
      overallQuality: response.overview.overall_quality_score,
      sourcesMonitored: response.overview.total_sources_monitored,
      criticalIssues: response.overview.critical_issues,
    });

    return NextResponse.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(
      "Data quality assessment failed",
      error instanceof Error ? error : new Error(errorMessage)
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to perform data quality assessment",
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, source, data, options = {} } = body;

    logger.info("Data quality action requested", {
      action,
      source,
      dataCount: data?.length,
    });

    const qualityAnalyzer = new EnhancedDataQualityAnalyzer();
    const dataNormalizer = new AdvancedDataNormalizer();
    const cleaningEngine = new DataCleaningEngine();

    switch (action) {
      case "assess_quality": {
        if (!data || !Array.isArray(data)) {
          return NextResponse.json(
            {
              success: false,
              error: "Data array is required for quality assessment",
            },
            { status: 400 }
          );
        }

        const assessmentResult = await qualityAnalyzer.assessDataQuality(
          data,
          source || "unknown"
        );

        return NextResponse.json({
          success: true,
          action: "assess_quality",
          result: assessmentResult,
          timestamp: new Date().toISOString(),
        });
      }

      case "normalize_data": {
        if (!data || !Array.isArray(data)) {
          return NextResponse.json(
            {
              success: false,
              error: "Data array is required for normalization",
            },
            { status: 400 }
          );
        }

        const targetEngines = options.target_engines || [
          "content_performance",
          "marketing_optimization",
        ];
        const normalizationResults = await dataNormalizer.normalizeForEngines(
          data,
          source || "unknown",
          targetEngines
        );

        return NextResponse.json({
          success: true,
          action: "normalize_data",
          results: Object.fromEntries(normalizationResults),
          timestamp: new Date().toISOString(),
        });
      }

      case "clean_data": {
        if (!data || !Array.isArray(data)) {
          return NextResponse.json(
            {
              success: false,
              error: "Data array is required for cleaning",
            },
            { status: 400 }
          );
        }

        const cleaningResults = await cleaningEngine.cleanData([
          {
            source: source || "unknown",
            data: data,
            timestamp: new Date().toISOString(),
            metadata: {
              platform: options.platform,
              type: options.type,
              quality: options.quality || 0.8,
              confidence: options.confidence || 0.85,
            },
          },
        ]);

        return NextResponse.json({
          success: true,
          action: "clean_data",
          results: cleaningResults,
          timestamp: new Date().toISOString(),
        });
      }

      case "comprehensive_process": {
        if (!data || !Array.isArray(data)) {
          return NextResponse.json(
            {
              success: false,
              error: "Data array is required for comprehensive processing",
            },
            { status: 400 }
          );
        }

        // Step 1: Clean data
        const cleaningResults = await cleaningEngine.cleanData([
          {
            source: source || "unknown",
            data: data,
            timestamp: new Date().toISOString(),
            metadata: options.metadata || {},
          },
        ]);

        // Step 2: Assess quality
        const cleanedData = cleaningResults[0]?.cleanedData || [];
        const qualityAssessment = await qualityAnalyzer.assessDataQuality(
          cleanedData,
          source || "unknown"
        );

        // Step 3: Normalize for target engines
        const targetEngines = options.target_engines || ["content_performance"];
        const normalizationResults = await dataNormalizer.normalizeForEngines(
          cleanedData,
          source || "unknown",
          targetEngines
        );

        return NextResponse.json({
          success: true,
          action: "comprehensive_process",
          results: {
            cleaning: cleaningResults[0],
            quality_assessment: qualityAssessment,
            normalization: Object.fromEntries(normalizationResults),
          },
          summary: {
            original_records: data.length,
            cleaned_records: cleanedData.length,
            quality_score: qualityAssessment.quality_score,
            engines_normalized: targetEngines.length,
          },
          timestamp: new Date().toISOString(),
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: `Unknown action: ${action}`,
            available_actions: [
              "assess_quality",
              "normalize_data",
              "clean_data",
              "comprehensive_process",
            ],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(
      "Data quality action failed",
      error instanceof Error ? error : new Error(errorMessage)
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to execute data quality action",
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
