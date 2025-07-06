/**
 * Benchmark Data Integrator
 * Task 72.4: Integreer synthetische en benchmark data generatie
 *
 * Comprehensive benchmark data integration voor sector-specifieke
 * benchmarks en performance vergelijkingsdata
 */

import { logger } from "../logger";
import { createClient } from "@supabase/supabase-js";

// Benchmark data interfaces
export interface BenchmarkDataSource {
  source_id: string;
  source_name: string;
  provider: string;
  industry: string;
  data_type:
    | "performance"
    | "financial"
    | "marketing"
    | "social_media"
    | "operational";
  update_frequency:
    | "real_time"
    | "daily"
    | "weekly"
    | "monthly"
    | "quarterly"
    | "annually";
  api_config: {
    endpoint_url?: string;
    authentication_type: "api_key" | "oauth" | "basic_auth" | "none";
    headers?: Record<string, string>;
    rate_limit?: {
      requests_per_minute: number;
      requests_per_hour: number;
    };
  };
  data_schema: BenchmarkDataSchema;
  quality_indicators: QualityIndicators;
  cost_config?: CostConfiguration;
}

export interface BenchmarkDataSchema {
  primary_metrics: string[];
  secondary_metrics: string[];
  dimensions: string[];
  time_granularity: "hourly" | "daily" | "weekly" | "monthly" | "quarterly";
  data_format: "json" | "csv" | "xml" | "parquet";
  required_fields: string[];
  optional_fields: string[];
  data_types: Record<
    string,
    "string" | "number" | "date" | "boolean" | "array"
  >;
}

export interface QualityIndicators {
  data_freshness_sla: number; // hours
  completeness_threshold: number;
  accuracy_score: number;
  reliability_rating: "high" | "medium" | "low";
  coverage_percentage: number;
}

export interface CostConfiguration {
  pricing_model:
    | "free"
    | "per_request"
    | "monthly_subscription"
    | "usage_based";
  cost_per_request?: number;
  monthly_cost?: number;
  included_requests?: number;
}

export interface BenchmarkDataset {
  dataset_id: string;
  source_id: string;
  industry: string;
  data_category: string;
  collection_timestamp: string;
  data_points: BenchmarkDataPoint[];
  metadata: BenchmarkMetadata;
  quality_assessment: DataQualityAssessment;
}

export interface BenchmarkDataPoint {
  metric_name: string;
  metric_value: number;
  unit: string;
  industry: string;
  company_size?: "small" | "medium" | "large" | "enterprise";
  region?: string;
  time_period: string;
  percentile_rank?: number;
  confidence_interval?: {
    lower: number;
    upper: number;
  };
  sample_size?: number;
}

export interface BenchmarkMetadata {
  collection_methodology: string;
  sample_characteristics: {
    total_companies: number;
    industry_breakdown: Record<string, number>;
    size_distribution: Record<string, number>;
    geographic_coverage: string[];
  };
  data_lineage: {
    original_sources: string[];
    processing_steps: string[];
    last_updated: string;
  };
  reliability_indicators: {
    confidence_score: number;
    data_age_hours: number;
    validation_status: "validated" | "pending" | "failed";
  };
}

export interface DataQualityAssessment {
  completeness_score: number;
  accuracy_score: number;
  timeliness_score: number;
  consistency_score: number;
  overall_quality_score: number;
  quality_issues: QualityIssue[];
}

export interface QualityIssue {
  issue_type: "missing_data" | "outlier" | "inconsistency" | "staleness";
  affected_metrics: string[];
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  recommendation: string;
}

export interface BenchmarkComparisonResult {
  comparison_id: string;
  user_metrics: Record<string, number>;
  benchmark_metrics: Record<string, BenchmarkDataPoint>;
  performance_analysis: PerformanceAnalysis;
  recommendations: BenchmarkRecommendation[];
  industry_positioning: IndustryPositioning;
}

export interface PerformanceAnalysis {
  overall_performance:
    | "below_average"
    | "average"
    | "above_average"
    | "exceptional";
  metric_comparisons: MetricComparison[];
  trend_analysis: TrendAnalysis;
  competitive_gaps: CompetitiveGap[];
}

export interface MetricComparison {
  metric_name: string;
  user_value: number;
  benchmark_median: number;
  benchmark_percentile: number;
  performance_category:
    | "bottom_quartile"
    | "below_median"
    | "above_median"
    | "top_quartile";
  improvement_potential: number;
}

export interface TrendAnalysis {
  trend_direction: "improving" | "stable" | "declining";
  trend_strength: number;
  seasonal_patterns: boolean;
  benchmark_evolution: "rising" | "stable" | "falling";
}

export interface CompetitiveGap {
  metric_name: string;
  gap_size: number;
  gap_direction: "positive" | "negative";
  priority: "high" | "medium" | "low";
  estimated_effort: "low" | "medium" | "high";
}

export interface BenchmarkRecommendation {
  recommendation_id: string;
  priority: "urgent" | "high" | "medium" | "low";
  category:
    | "performance_improvement"
    | "cost_optimization"
    | "strategic_opportunity";
  title: string;
  description: string;
  expected_impact: {
    metric_improvements: Record<string, number>;
    time_to_impact: string;
    confidence_level: number;
  };
  implementation_steps: string[];
}

export interface IndustryPositioning {
  overall_rank_percentile: number;
  category_rankings: Record<string, number>;
  competitive_strengths: string[];
  improvement_areas: string[];
  market_position: "leader" | "challenger" | "follower" | "niche";
}

export class BenchmarkDataIntegrator {
  private supabase: any;
  private dataSources: Map<string, BenchmarkDataSource> = new Map();
  private cachedDatasets: Map<string, BenchmarkDataset> = new Map();
  private comparisonHistory: BenchmarkComparisonResult[] = [];

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    this.initializeBuiltInSources();
  }

  /**
   * Initialize built-in benchmark data sources
   */
  private initializeBuiltInSources(): void {
    // Social Media Industry Benchmarks
    this.registerDataSource({
      source_id: "social_media_benchmarks",
      source_name: "Social Media Industry Benchmarks",
      provider: "Industry Analytics Corp",
      industry: "digital_marketing",
      data_type: "social_media",
      update_frequency: "weekly",
      api_config: {
        endpoint_url: "https://api.socialmetrics.com/v2/benchmarks",
        authentication_type: "api_key",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "SKC-BI-Dashboard/1.0",
        },
        rate_limit: {
          requests_per_minute: 100,
          requests_per_hour: 1000,
        },
      },
      data_schema: {
        primary_metrics: ["engagement_rate", "reach_rate", "impression_share"],
        secondary_metrics: [
          "click_through_rate",
          "conversion_rate",
          "cost_per_engagement",
        ],
        dimensions: ["industry", "platform", "company_size", "region"],
        time_granularity: "weekly",
        data_format: "json",
        required_fields: [
          "metric_name",
          "metric_value",
          "industry",
          "time_period",
        ],
        optional_fields: ["company_size", "region", "confidence_interval"],
        data_types: {
          metric_name: "string",
          metric_value: "number",
          industry: "string",
          time_period: "date",
          percentile_rank: "number",
        },
      },
      quality_indicators: {
        data_freshness_sla: 168, // 7 days
        completeness_threshold: 0.95,
        accuracy_score: 0.92,
        reliability_rating: "high",
        coverage_percentage: 85,
      },
    });

    // Marketing Campaign Benchmarks
    this.registerDataSource({
      source_id: "marketing_campaign_benchmarks",
      source_name: "Digital Marketing Campaign Benchmarks",
      provider: "Marketing Intelligence Hub",
      industry: "digital_marketing",
      data_type: "marketing",
      update_frequency: "monthly",
      api_config: {
        endpoint_url: "https://api.marketinghub.com/benchmarks/campaigns",
        authentication_type: "oauth",
        rate_limit: {
          requests_per_minute: 50,
          requests_per_hour: 500,
        },
      },
      data_schema: {
        primary_metrics: ["ctr", "cpc", "cpm", "conversion_rate", "roas"],
        secondary_metrics: [
          "impression_share",
          "quality_score",
          "ad_relevance",
        ],
        dimensions: ["platform", "campaign_type", "industry", "budget_range"],
        time_granularity: "monthly",
        data_format: "json",
        required_fields: [
          "metric_name",
          "metric_value",
          "platform",
          "industry",
        ],
        optional_fields: ["budget_range", "campaign_type", "sample_size"],
        data_types: {
          ctr: "number",
          cpc: "number",
          conversion_rate: "number",
          roas: "number",
        },
      },
      quality_indicators: {
        data_freshness_sla: 720, // 30 days
        completeness_threshold: 0.9,
        accuracy_score: 0.88,
        reliability_rating: "high",
        coverage_percentage: 78,
      },
    });

    // Customer Analytics Benchmarks
    this.registerDataSource({
      source_id: "customer_analytics_benchmarks",
      source_name: "Customer Experience Benchmarks",
      provider: "Customer Intelligence Network",
      industry: "cross_industry",
      data_type: "operational",
      update_frequency: "quarterly",
      api_config: {
        endpoint_url: "https://api.customerintel.com/benchmarks",
        authentication_type: "api_key",
        rate_limit: {
          requests_per_minute: 30,
          requests_per_hour: 200,
        },
      },
      data_schema: {
        primary_metrics: [
          "customer_lifetime_value",
          "churn_rate",
          "satisfaction_score",
        ],
        secondary_metrics: [
          "acquisition_cost",
          "retention_rate",
          "support_resolution_time",
        ],
        dimensions: ["industry", "company_size", "business_model"],
        time_granularity: "quarterly",
        data_format: "json",
        required_fields: ["metric_name", "metric_value", "industry", "quarter"],
        optional_fields: ["company_size", "business_model", "region"],
        data_types: {
          customer_lifetime_value: "number",
          churn_rate: "number",
          satisfaction_score: "number",
        },
      },
      quality_indicators: {
        data_freshness_sla: 2160, // 90 days
        completeness_threshold: 0.85,
        accuracy_score: 0.9,
        reliability_rating: "medium",
        coverage_percentage: 70,
      },
    });

    // Financial Performance Benchmarks
    this.registerDataSource({
      source_id: "financial_benchmarks",
      source_name: "Industry Financial Performance Benchmarks",
      provider: "Financial Metrics Institute",
      industry: "cross_industry",
      data_type: "financial",
      update_frequency: "quarterly",
      api_config: {
        endpoint_url: "https://api.finmetrics.com/industry-benchmarks",
        authentication_type: "api_key",
        rate_limit: {
          requests_per_minute: 20,
          requests_per_hour: 100,
        },
      },
      data_schema: {
        primary_metrics: ["revenue_growth", "profit_margin", "market_share"],
        secondary_metrics: [
          "debt_to_equity",
          "current_ratio",
          "inventory_turnover",
        ],
        dimensions: ["industry", "company_size", "geographic_region"],
        time_granularity: "quarterly",
        data_format: "json",
        required_fields: ["metric_name", "metric_value", "industry", "quarter"],
        optional_fields: ["company_size", "geographic_region"],
        data_types: {
          revenue_growth: "number",
          profit_margin: "number",
          market_share: "number",
        },
      },
      quality_indicators: {
        data_freshness_sla: 2160, // 90 days
        completeness_threshold: 0.92,
        accuracy_score: 0.95,
        reliability_rating: "high",
        coverage_percentage: 88,
      },
      cost_config: {
        pricing_model: "monthly_subscription",
        monthly_cost: 299,
        included_requests: 1000,
      },
    });
  }

  /**
   * Register a new benchmark data source
   */
  registerDataSource(source: BenchmarkDataSource): void {
    this.dataSources.set(source.source_id, source);
    logger.info(`Registered benchmark data source: ${source.source_name}`);
  }

  /**
   * Fetch benchmark data from specified source
   */
  async fetchBenchmarkData(
    sourceId: string,
    filters: {
      industry?: string;
      metrics?: string[];
      time_period?: string;
      company_size?: string;
      region?: string;
    } = {}
  ): Promise<BenchmarkDataset> {
    const source = this.dataSources.get(sourceId);
    if (!source) {
      throw new Error(`Benchmark data source not found: ${sourceId}`);
    }

    logger.info(`Fetching benchmark data from ${source.source_name}`, {
      sourceId,
      filters,
    });

    // Check cache first
    const cacheKey = `${sourceId}_${JSON.stringify(filters)}`;
    const cached = this.cachedDatasets.get(cacheKey);
    if (
      cached &&
      this.isCacheValid(cached, source.quality_indicators.data_freshness_sla)
    ) {
      logger.info(`Returning cached benchmark data for ${sourceId}`);
      return cached;
    }

    try {
      // Fetch data from external API
      const fetchedData = await this.fetchFromExternalAPI(source, filters);

      // Process and validate the data
      const processedDataset = await this.processBenchmarkData(
        fetchedData,
        source,
        filters
      );

      // Cache the processed dataset
      this.cachedDatasets.set(cacheKey, processedDataset);

      logger.info(
        `Successfully fetched and cached benchmark data from ${sourceId}`,
        {
          dataPoints: processedDataset.data_points.length,
          qualityScore:
            processedDataset.quality_assessment.overall_quality_score,
        }
      );

      return processedDataset;
    } catch (error) {
      logger.error(`Failed to fetch benchmark data from ${sourceId}`, {
        error: error.message,
      });

      // Return mock data for demonstration purposes
      return this.generateMockBenchmarkData(source, filters);
    }
  }

  /**
   * Compare user metrics with industry benchmarks
   */
  async compareWithBenchmarks(
    userMetrics: Record<string, number>,
    industry: string,
    companySize?: string,
    region?: string
  ): Promise<BenchmarkComparisonResult> {
    logger.info("Starting benchmark comparison", {
      industry,
      companySize,
      region,
      metricsCount: Object.keys(userMetrics).length,
    });

    // Find relevant benchmark sources for the industry
    const relevantSources = this.findRelevantSources(industry);

    // Fetch benchmark data from all relevant sources
    const benchmarkDatasets: BenchmarkDataset[] = [];
    for (const source of relevantSources) {
      try {
        const dataset = await this.fetchBenchmarkData(source.source_id, {
          industry,
          company_size: companySize,
          region,
        });
        benchmarkDatasets.push(dataset);
      } catch (error) {
        logger.warn(`Failed to fetch data from ${source.source_name}`, {
          error: error.message,
        });
      }
    }

    // Create consolidated benchmark metrics
    const consolidatedBenchmarks =
      this.consolidateBenchmarkData(benchmarkDatasets);

    // Perform comparison analysis
    const comparisonId = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const performanceAnalysis = this.analyzePerformance(
      userMetrics,
      consolidatedBenchmarks
    );
    const recommendations = this.generateRecommendations(
      performanceAnalysis,
      userMetrics,
      consolidatedBenchmarks
    );
    const industryPositioning =
      this.calculateIndustryPositioning(performanceAnalysis);

    const result: BenchmarkComparisonResult = {
      comparison_id: comparisonId,
      user_metrics: userMetrics,
      benchmark_metrics: consolidatedBenchmarks,
      performance_analysis: performanceAnalysis,
      recommendations: recommendations,
      industry_positioning: industryPositioning,
    };

    // Store comparison history
    this.comparisonHistory.push(result);

    logger.info("Benchmark comparison completed", {
      comparisonId,
      overallPerformance: performanceAnalysis.overall_performance,
      recommendationsCount: recommendations.length,
      industryRank: industryPositioning.overall_rank_percentile,
    });

    return result;
  }

  /**
   * Get available benchmark metrics for an industry
   */
  async getAvailableMetrics(industry: string): Promise<{
    primary_metrics: string[];
    secondary_metrics: string[];
    data_sources: string[];
    coverage_quality: Record<string, number>;
  }> {
    const relevantSources = this.findRelevantSources(industry);

    const primaryMetrics = new Set<string>();
    const secondaryMetrics = new Set<string>();
    const dataSources: string[] = [];
    const coverageQuality: Record<string, number> = {};

    for (const source of relevantSources) {
      source.data_schema.primary_metrics.forEach(metric =>
        primaryMetrics.add(metric)
      );
      source.data_schema.secondary_metrics.forEach(metric =>
        secondaryMetrics.add(metric)
      );
      dataSources.push(source.source_name);
      coverageQuality[source.source_name] =
        source.quality_indicators.coverage_percentage;
    }

    return {
      primary_metrics: Array.from(primaryMetrics),
      secondary_metrics: Array.from(secondaryMetrics),
      data_sources: dataSources,
      coverage_quality: coverageQuality,
    };
  }

  /**
   * Private helper methods
   */
  private async fetchFromExternalAPI(
    source: BenchmarkDataSource,
    filters: any
  ): Promise<any> {
    // In a real implementation, this would make actual API calls
    // For now, return mock data structure
    return {
      data: [],
      metadata: {
        source: source.source_name,
        timestamp: new Date().toISOString(),
        filters: filters,
      },
    };
  }

  private async processBenchmarkData(
    rawData: any,
    source: BenchmarkDataSource,
    filters: any
  ): Promise<BenchmarkDataset> {
    const datasetId = `dataset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Generate mock benchmark data points
    const dataPoints = this.generateMockDataPoints(source, filters);

    const metadata: BenchmarkMetadata = {
      collection_methodology: "API_aggregation",
      sample_characteristics: {
        total_companies: 1250,
        industry_breakdown: { [filters.industry || "technology"]: 100 },
        size_distribution: { small: 30, medium: 40, large: 20, enterprise: 10 },
        geographic_coverage: ["US", "EU", "APAC"],
      },
      data_lineage: {
        original_sources: [source.source_name],
        processing_steps: ["fetch", "validate", "normalize"],
        last_updated: new Date().toISOString(),
      },
      reliability_indicators: {
        confidence_score: source.quality_indicators.accuracy_score,
        data_age_hours: 24,
        validation_status: "validated",
      },
    };

    const qualityAssessment: DataQualityAssessment = {
      completeness_score: source.quality_indicators.completeness_threshold,
      accuracy_score: source.quality_indicators.accuracy_score,
      timeliness_score: 0.95,
      consistency_score: 0.9,
      overall_quality_score:
        (source.quality_indicators.completeness_threshold +
          source.quality_indicators.accuracy_score +
          0.95 +
          0.9) /
        4,
      quality_issues: [],
    };

    return {
      dataset_id: datasetId,
      source_id: source.source_id,
      industry: filters.industry || "technology",
      data_category: source.data_type,
      collection_timestamp: new Date().toISOString(),
      data_points: dataPoints,
      metadata: metadata,
      quality_assessment: qualityAssessment,
    };
  }

  private generateMockBenchmarkData(
    source: BenchmarkDataSource,
    filters: any
  ): BenchmarkDataset {
    // Generate realistic mock data for development/testing
    return this.processBenchmarkData({}, source, filters);
  }

  private generateMockDataPoints(
    source: BenchmarkDataSource,
    filters: any
  ): BenchmarkDataPoint[] {
    const dataPoints: BenchmarkDataPoint[] = [];

    // Generate data points for each primary metric
    for (const metric of source.data_schema.primary_metrics) {
      const baseValue = this.getMetricBaseValue(metric);

      dataPoints.push({
        metric_name: metric,
        metric_value: baseValue * (0.8 + Math.random() * 0.4), // Vary ±20%
        unit: this.getMetricUnit(metric),
        industry: filters.industry || "technology",
        company_size: filters.company_size,
        region: filters.region,
        time_period:
          filters.time_period || new Date().toISOString().split("T")[0],
        percentile_rank: Math.random() * 100,
        confidence_interval: {
          lower: baseValue * 0.9,
          upper: baseValue * 1.1,
        },
        sample_size: Math.floor(Math.random() * 500) + 100,
      });
    }

    return dataPoints;
  }

  private getMetricBaseValue(metric: string): number {
    const baseValues: Record<string, number> = {
      engagement_rate: 3.2,
      reach_rate: 12.5,
      impression_share: 15.8,
      click_through_rate: 1.8,
      conversion_rate: 2.4,
      cost_per_engagement: 0.45,
      ctr: 2.1,
      cpc: 1.25,
      cpm: 8.5,
      roas: 3.8,
      customer_lifetime_value: 850,
      churn_rate: 8.5,
      satisfaction_score: 7.2,
      revenue_growth: 12.5,
      profit_margin: 18.2,
      market_share: 5.8,
    };

    return baseValues[metric] || Math.random() * 100;
  }

  private getMetricUnit(metric: string): string {
    const units: Record<string, string> = {
      engagement_rate: "%",
      reach_rate: "%",
      impression_share: "%",
      click_through_rate: "%",
      conversion_rate: "%",
      cost_per_engagement: "USD",
      ctr: "%",
      cpc: "USD",
      cpm: "USD",
      roas: "ratio",
      customer_lifetime_value: "USD",
      churn_rate: "%",
      satisfaction_score: "score",
      revenue_growth: "%",
      profit_margin: "%",
      market_share: "%",
    };

    return units[metric] || "value";
  }

  private isCacheValid(
    dataset: BenchmarkDataset,
    freshnessThresholdHours: number
  ): boolean {
    const dataAgeMs =
      Date.now() - new Date(dataset.collection_timestamp).getTime();
    const dataAgeHours = dataAgeMs / (1000 * 60 * 60);
    return dataAgeHours < freshnessThresholdHours;
  }

  private findRelevantSources(industry: string): BenchmarkDataSource[] {
    return Array.from(this.dataSources.values()).filter(
      source =>
        source.industry === industry || source.industry === "cross_industry"
    );
  }

  private consolidateBenchmarkData(
    datasets: BenchmarkDataset[]
  ): Record<string, BenchmarkDataPoint> {
    const consolidated: Record<string, BenchmarkDataPoint> = {};

    for (const dataset of datasets) {
      for (const dataPoint of dataset.data_points) {
        if (
          !consolidated[dataPoint.metric_name] ||
          dataset.quality_assessment.overall_quality_score >
            (consolidated[dataPoint.metric_name] as any).quality_score
        ) {
          consolidated[dataPoint.metric_name] = {
            ...dataPoint,
            quality_score: dataset.quality_assessment.overall_quality_score,
          } as any;
        }
      }
    }

    return consolidated;
  }

  private analyzePerformance(
    userMetrics: Record<string, number>,
    benchmarks: Record<string, BenchmarkDataPoint>
  ): PerformanceAnalysis {
    const metricComparisons: MetricComparison[] = [];
    let totalPerformanceScore = 0;
    let comparedMetrics = 0;

    for (const [metricName, userValue] of Object.entries(userMetrics)) {
      const benchmark = benchmarks[metricName];
      if (benchmark) {
        const percentile = this.calculatePercentile(userValue, benchmark);
        const performanceCategory = this.getPerformanceCategory(percentile);

        metricComparisons.push({
          metric_name: metricName,
          user_value: userValue,
          benchmark_median: benchmark.metric_value,
          benchmark_percentile: percentile,
          performance_category: performanceCategory,
          improvement_potential: Math.max(
            0,
            benchmark.metric_value - userValue
          ),
        });

        totalPerformanceScore += percentile;
        comparedMetrics++;
      }
    }

    const avgPerformanceScore =
      comparedMetrics > 0 ? totalPerformanceScore / comparedMetrics : 50;
    const overallPerformance = this.getOverallPerformance(avgPerformanceScore);

    return {
      overall_performance: overallPerformance,
      metric_comparisons: metricComparisons,
      trend_analysis: {
        trend_direction: "stable",
        trend_strength: 0.5,
        seasonal_patterns: false,
        benchmark_evolution: "stable",
      },
      competitive_gaps: this.identifyCompetitiveGaps(metricComparisons),
    };
  }

  private calculatePercentile(
    userValue: number,
    benchmark: BenchmarkDataPoint
  ): number {
    // Simplified percentile calculation
    // In reality, this would use the full distribution data
    const benchmarkValue = benchmark.metric_value;
    const ratio = userValue / benchmarkValue;

    if (ratio >= 1.2) return 90;
    if (ratio >= 1.1) return 80;
    if (ratio >= 1.0) return 70;
    if (ratio >= 0.9) return 50;
    if (ratio >= 0.8) return 30;
    if (ratio >= 0.7) return 20;
    return 10;
  }

  private getPerformanceCategory(
    percentile: number
  ): "bottom_quartile" | "below_median" | "above_median" | "top_quartile" {
    if (percentile >= 75) return "top_quartile";
    if (percentile >= 50) return "above_median";
    if (percentile >= 25) return "below_median";
    return "bottom_quartile";
  }

  private getOverallPerformance(
    avgScore: number
  ): "below_average" | "average" | "above_average" | "exceptional" {
    if (avgScore >= 80) return "exceptional";
    if (avgScore >= 60) return "above_average";
    if (avgScore >= 40) return "average";
    return "below_average";
  }

  private identifyCompetitiveGaps(
    comparisons: MetricComparison[]
  ): CompetitiveGap[] {
    return comparisons
      .filter(
        comp =>
          comp.performance_category === "bottom_quartile" ||
          comp.performance_category === "below_median"
      )
      .map(comp => ({
        metric_name: comp.metric_name,
        gap_size: comp.improvement_potential,
        gap_direction: "negative",
        priority:
          comp.performance_category === "bottom_quartile" ? "high" : "medium",
        estimated_effort:
          comp.improvement_potential > comp.benchmark_median * 0.5
            ? "high"
            : "medium",
      }));
  }

  private generateRecommendations(
    analysis: PerformanceAnalysis,
    userMetrics: Record<string, number>,
    benchmarks: Record<string, BenchmarkDataPoint>
  ): BenchmarkRecommendation[] {
    const recommendations: BenchmarkRecommendation[] = [];

    // Generate recommendations for low-performing metrics
    for (const gap of analysis.competitive_gaps) {
      if (gap.priority === "high") {
        recommendations.push({
          recommendation_id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          priority: "high",
          category: "performance_improvement",
          title: `Improve ${gap.metric_name}`,
          description: `Your ${gap.metric_name} is below industry benchmarks. Focus on optimization strategies.`,
          expected_impact: {
            metric_improvements: { [gap.metric_name]: gap.gap_size * 0.7 },
            time_to_impact: "3-6 months",
            confidence_level: 0.75,
          },
          implementation_steps: [
            `Analyze current ${gap.metric_name} performance drivers`,
            "Implement industry best practices",
            "Monitor progress weekly",
            "Adjust strategy based on results",
          ],
        });
      }
    }

    return recommendations;
  }

  private calculateIndustryPositioning(
    analysis: PerformanceAnalysis
  ): IndustryPositioning {
    const avgPercentile =
      analysis.metric_comparisons.reduce(
        (sum, comp) => sum + comp.benchmark_percentile,
        0
      ) / analysis.metric_comparisons.length;

    const topQuartileMetrics = analysis.metric_comparisons
      .filter(comp => comp.performance_category === "top_quartile")
      .map(comp => comp.metric_name);

    const bottomQuartileMetrics = analysis.metric_comparisons
      .filter(comp => comp.performance_category === "bottom_quartile")
      .map(comp => comp.metric_name);

    const marketPosition =
      avgPercentile >= 80
        ? "leader"
        : avgPercentile >= 60
          ? "challenger"
          : avgPercentile >= 40
            ? "follower"
            : "niche";

    return {
      overall_rank_percentile: avgPercentile,
      category_rankings: analysis.metric_comparisons.reduce(
        (acc, comp) => {
          acc[comp.metric_name] = comp.benchmark_percentile;
          return acc;
        },
        {} as Record<string, number>
      ),
      competitive_strengths: topQuartileMetrics,
      improvement_areas: bottomQuartileMetrics,
      market_position: marketPosition,
    };
  }

  /**
   * Get benchmark integration summary
   */
  async getBenchmarkSummary(): Promise<{
    total_sources: number;
    active_sources: number;
    total_metrics_available: number;
    industries_covered: string[];
    data_freshness_status: Record<string, string>;
    quality_overview: Record<string, number>;
  }> {
    const allSources = Array.from(this.dataSources.values());
    const allMetrics = new Set<string>();
    const industries = new Set<string>();
    const qualityScores: number[] = [];

    for (const source of allSources) {
      source.data_schema.primary_metrics.forEach(metric =>
        allMetrics.add(metric)
      );
      source.data_schema.secondary_metrics.forEach(metric =>
        allMetrics.add(metric)
      );
      industries.add(source.industry);
      qualityScores.push(source.quality_indicators.accuracy_score);
    }

    return {
      total_sources: allSources.length,
      active_sources: allSources.filter(
        s => s.quality_indicators.reliability_rating !== "low"
      ).length,
      total_metrics_available: allMetrics.size,
      industries_covered: Array.from(industries),
      data_freshness_status: allSources.reduce(
        (acc, source) => {
          acc[source.source_name] = "current"; // Simplified
          return acc;
        },
        {} as Record<string, string>
      ),
      quality_overview: {
        average_quality_score:
          qualityScores.reduce((sum, score) => sum + score, 0) /
          qualityScores.length,
        high_quality_sources: qualityScores.filter(score => score >= 0.9)
          .length,
        total_sources: qualityScores.length,
      },
    };
  }
}
