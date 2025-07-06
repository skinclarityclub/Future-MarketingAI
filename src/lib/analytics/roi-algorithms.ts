/**
 * Advanced ROI Calculation Algorithms
 * Modular and configurable algorithms for content performance analysis
 */

// Core data types for ROI calculations
interface ContentMetrics {
  content_id: string;
  title: string;
  type: "product" | "course" | "community" | "blog" | "video";
  platform: "shopify" | "kajabi" | "youtube" | "blog" | "social";

  // Revenue metrics
  revenue: number;
  sales_count: number;
  average_order_value: number;

  // Engagement metrics
  views: number;
  clicks: number;
  conversions: number;
  engagement_time: number; // in minutes
  bounce_rate: number; // 0-1

  // Cost metrics
  production_cost: number;
  marketing_spend: number;
  operational_cost: number;

  // Time metrics
  created_date: string;
  first_sale_date?: string;
  period_start: string;
  period_end: string;
}

interface ROICalculationConfig {
  // Algorithm weights (should sum to 1.0)
  revenue_weight: number;
  engagement_weight: number;
  conversion_weight: number;
  time_weight: number;

  // Normalization factors
  engagement_normalizer: number;
  conversion_normalizer: number;

  // Cost allocation methods
  cost_allocation: "equal" | "proportional" | "time_based" | "custom";

  // Risk factors
  seasonality_factor: number;
  market_volatility: number;

  // Performance thresholds
  excellent_threshold: number;
  good_threshold: number;
  poor_threshold: number;
}

interface ROIResult {
  content_id: string;
  roi_percentage: number;
  roi_score: number; // Normalized 0-100
  performance_grade: "A" | "B" | "C" | "D" | "F";

  // Detailed breakdown
  revenue_score: number;
  engagement_score: number;
  conversion_score: number;
  efficiency_score: number;

  // Financial metrics
  total_cost: number;
  net_profit: number;
  profit_margin: number;
  payback_period_days: number;

  // Performance indicators
  cost_per_acquisition: number;
  lifetime_value_ratio: number;
  viral_coefficient: number;

  // Recommendations
  optimization_opportunities: string[];
  risk_factors: string[];
  suggested_actions: string[];
}

interface TrendAnalysis {
  content_id: string;
  trend_direction: "increasing" | "decreasing" | "stable" | "volatile";
  trend_strength: number; // 0-1
  velocity: number; // rate of change
  momentum: number; // acceleration
  seasonal_pattern: boolean;
  prediction_confidence: number;
}

// Default configuration for ROI calculations
const DEFAULT_ROI_CONFIG: ROICalculationConfig = {
  revenue_weight: 0.4,
  engagement_weight: 0.25,
  conversion_weight: 0.25,
  time_weight: 0.1,

  engagement_normalizer: 1000, // Normalize per 1000 views
  conversion_normalizer: 100, // Normalize per 100 conversions

  cost_allocation: "proportional",

  seasonality_factor: 1.0,
  market_volatility: 0.15,

  excellent_threshold: 300, // 300% ROI
  good_threshold: 150, // 150% ROI
  poor_threshold: 50, // 50% ROI
};

export class ROIAlgorithmEngine {
  private config: ROICalculationConfig;

  constructor(config: Partial<ROICalculationConfig> = {}) {
    this.config = { ...DEFAULT_ROI_CONFIG, ...config };
  }

  /**
   * Calculate comprehensive ROI for a single piece of content
   */
  calculateContentROI(metrics: ContentMetrics): ROIResult {
    // 1. Calculate basic ROI
    const totalCost = this.calculateTotalCost(metrics);
    const netProfit = metrics.revenue - totalCost;
    const basicROI = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

    // 2. Calculate weighted component scores
    const revenueScore = this.calculateRevenueScore(metrics);
    const engagementScore = this.calculateEngagementScore(metrics);
    const conversionScore = this.calculateConversionScore(metrics);
    const efficiencyScore = this.calculateEfficiencyScore(metrics);

    // 3. Calculate composite ROI score
    const roiScore = this.calculateCompositeScore({
      revenue: revenueScore,
      engagement: engagementScore,
      conversion: conversionScore,
      efficiency: efficiencyScore,
    });

    // 4. Calculate advanced metrics
    const paybackPeriod = this.calculatePaybackPeriod(metrics);
    const costPerAcquisition = this.calculateCostPerAcquisition(metrics);
    const lifetimeValueRatio = this.calculateLifetimeValueRatio(metrics);
    const viralCoefficient = this.calculateViralCoefficient(metrics);

    // 5. Determine performance grade
    const performanceGrade = this.getPerformanceGrade(basicROI);

    // 6. Generate optimization recommendations
    const optimizationOpportunities = this.identifyOptimizationOpportunities(
      metrics,
      {
        revenue: revenueScore,
        engagement: engagementScore,
        conversion: conversionScore,
        efficiency: efficiencyScore,
      }
    );

    const riskFactors = this.identifyRiskFactors(metrics, basicROI);
    const suggestedActions = this.generateActionableRecommendations(
      metrics,
      optimizationOpportunities
    );

    return {
      content_id: metrics.content_id,
      roi_percentage: basicROI,
      roi_score: roiScore,
      performance_grade: performanceGrade,

      revenue_score: revenueScore,
      engagement_score: engagementScore,
      conversion_score: conversionScore,
      efficiency_score: efficiencyScore,

      total_cost: totalCost,
      net_profit: netProfit,
      profit_margin:
        metrics.revenue > 0 ? (netProfit / metrics.revenue) * 100 : 0,
      payback_period_days: paybackPeriod,

      cost_per_acquisition: costPerAcquisition,
      lifetime_value_ratio: lifetimeValueRatio,
      viral_coefficient: viralCoefficient,

      optimization_opportunities: optimizationOpportunities,
      risk_factors: riskFactors,
      suggested_actions: suggestedActions,
    };
  }

  /**
   * Calculate total cost with configurable allocation method
   */
  private calculateTotalCost(metrics: ContentMetrics): number {
    const baseCost =
      metrics.production_cost +
      metrics.marketing_spend +
      metrics.operational_cost;

    switch (this.config.cost_allocation) {
      case "equal":
        return baseCost;

      case "proportional":
        // Adjust cost based on revenue proportion
        return baseCost * (1 + metrics.revenue / 10000); // Scale factor

      case "time_based":
        // Adjust cost based on content age
        const contentAge = this.getContentAgeDays(metrics);
        return baseCost * (1 + Math.log(contentAge + 1) / 10);

      default:
        return baseCost;
    }
  }

  /**
   * Calculate revenue performance score (0-100)
   */
  private calculateRevenueScore(metrics: ContentMetrics): number {
    const revenuePerView =
      metrics.views > 0 ? metrics.revenue / metrics.views : 0;
    const averageOrderValueScore = Math.min(
      metrics.average_order_value / 100,
      100
    );
    const totalRevenueScore = Math.min(metrics.revenue / 1000, 100);

    return (
      revenuePerView * 40 + averageOrderValueScore * 30 + totalRevenueScore * 30
    );
  }

  /**
   * Calculate engagement performance score (0-100)
   */
  private calculateEngagementScore(metrics: ContentMetrics): number {
    const clickThroughRate =
      metrics.views > 0 ? (metrics.clicks / metrics.views) * 100 : 0;
    const engagementTimeScore = Math.min(metrics.engagement_time / 10, 100);
    const bounceRateScore = (1 - metrics.bounce_rate) * 100;

    return (
      clickThroughRate * 40 + engagementTimeScore * 30 + bounceRateScore * 30
    );
  }

  /**
   * Calculate conversion performance score (0-100)
   */
  private calculateConversionScore(metrics: ContentMetrics): number {
    const conversionRate =
      metrics.clicks > 0 ? (metrics.conversions / metrics.clicks) * 100 : 0;
    const conversionVelocity = this.calculateConversionVelocity(metrics);
    const conversionQuality = this.calculateConversionQuality(metrics);

    return (
      conversionRate * 50 + conversionVelocity * 25 + conversionQuality * 25
    );
  }

  /**
   * Calculate efficiency score (0-100)
   */
  private calculateEfficiencyScore(metrics: ContentMetrics): number {
    const costEfficiency = this.calculateCostEfficiency(metrics);
    const timeEfficiency = this.calculateTimeEfficiency(metrics);
    const resourceUtilization = this.calculateResourceUtilization(metrics);

    return costEfficiency * 40 + timeEfficiency * 30 + resourceUtilization * 30;
  }

  /**
   * Calculate composite ROI score using weighted components
   */
  private calculateCompositeScore(scores: {
    revenue: number;
    engagement: number;
    conversion: number;
    efficiency: number;
  }): number {
    return (
      scores.revenue * this.config.revenue_weight +
      scores.engagement * this.config.engagement_weight +
      scores.conversion * this.config.conversion_weight +
      scores.efficiency * this.config.time_weight
    );
  }

  // Helper methods for advanced calculations
  private calculatePaybackPeriod(metrics: ContentMetrics): number {
    const dailyRevenue = this.calculateDailyRevenue(metrics);
    const totalCost = this.calculateTotalCost(metrics);

    return dailyRevenue > 0 ? totalCost / dailyRevenue : Infinity;
  }

  private calculateCostPerAcquisition(metrics: ContentMetrics): number {
    const totalCost = this.calculateTotalCost(metrics);
    return metrics.conversions > 0
      ? totalCost / metrics.conversions
      : totalCost;
  }

  private calculateLifetimeValueRatio(metrics: ContentMetrics): number {
    const estimatedLTV =
      metrics.average_order_value * (1 + metrics.engagement_time / 60);
    const acquisitionCost = this.calculateCostPerAcquisition(metrics);

    return acquisitionCost > 0 ? estimatedLTV / acquisitionCost : 0;
  }

  private calculateViralCoefficient(metrics: ContentMetrics): number {
    const sharingRate = Math.min(metrics.engagement_time / 5, 1);
    const virality =
      (metrics.clicks / Math.max(metrics.views, 1)) * sharingRate;

    return Math.min(virality * 100, 10);
  }

  private calculateConversionVelocity(metrics: ContentMetrics): number {
    const contentAge = this.getContentAgeDays(metrics);
    return contentAge > 0 ? (metrics.conversions / contentAge) * 30 : 0;
  }

  private calculateConversionQuality(metrics: ContentMetrics): number {
    return metrics.conversions > 0
      ? Math.min(metrics.average_order_value / 50, 100)
      : 0;
  }

  private calculateCostEfficiency(metrics: ContentMetrics): number {
    const totalCost = this.calculateTotalCost(metrics);
    const revenuePerDollar = totalCost > 0 ? metrics.revenue / totalCost : 0;

    return Math.min(revenuePerDollar * 20, 100);
  }

  private calculateTimeEfficiency(metrics: ContentMetrics): number {
    const contentAge = this.getContentAgeDays(metrics);
    const revenuePerDay = contentAge > 0 ? metrics.revenue / contentAge : 0;

    return Math.min(revenuePerDay / 10, 100);
  }

  private calculateResourceUtilization(metrics: ContentMetrics): number {
    const engagementPerDollar =
      this.calculateTotalCost(metrics) > 0
        ? metrics.engagement_time / this.calculateTotalCost(metrics)
        : 0;

    return Math.min(engagementPerDollar * 1000, 100);
  }

  private calculateDailyRevenue(metrics: ContentMetrics): number {
    const periodDays = this.getPeriodDays(metrics);
    return periodDays > 0 ? metrics.revenue / periodDays : 0;
  }

  private getContentAgeDays(metrics: ContentMetrics): number {
    const created = new Date(metrics.created_date);
    const now = new Date();
    return Math.max(
      1,
      Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    );
  }

  private getPeriodDays(metrics: ContentMetrics): number {
    const start = new Date(metrics.period_start);
    const end = new Date(metrics.period_end);
    return Math.max(
      1,
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );
  }

  private getPerformanceGrade(roi: number): "A" | "B" | "C" | "D" | "F" {
    if (roi >= this.config.excellent_threshold) return "A";
    if (roi >= this.config.good_threshold) return "B";
    if (roi >= this.config.poor_threshold) return "C";
    if (roi >= 0) return "D";
    return "F";
  }

  /**
   * Identify optimization opportunities based on performance scores
   */
  private identifyOptimizationOpportunities(
    metrics: ContentMetrics,
    scores: {
      revenue: number;
      engagement: number;
      conversion: number;
      efficiency: number;
    }
  ): string[] {
    const opportunities: string[] = [];

    if (scores.revenue < 50) {
      opportunities.push(
        "Improve revenue generation through pricing optimization or upselling"
      );
    }

    if (scores.engagement < 50) {
      opportunities.push(
        "Enhance content engagement through better storytelling or interactive elements"
      );
    }

    if (scores.conversion < 50) {
      opportunities.push(
        "Optimize conversion funnel with better CTAs or landing page improvements"
      );
    }

    if (scores.efficiency < 50) {
      opportunities.push(
        "Reduce production costs or improve operational efficiency"
      );
    }

    if (metrics.bounce_rate > 0.7) {
      opportunities.push(
        "Reduce bounce rate by improving content relevance and page load speed"
      );
    }

    if (metrics.engagement_time < 2) {
      opportunities.push(
        "Increase engagement time with more compelling content and better user experience"
      );
    }

    return opportunities;
  }

  /**
   * Identify risk factors that could impact ROI
   */
  private identifyRiskFactors(metrics: ContentMetrics, roi: number): string[] {
    const risks: string[] = [];

    if (roi < 0) {
      risks.push("Negative ROI indicates immediate financial loss");
    }

    if (metrics.bounce_rate > 0.8) {
      risks.push("High bounce rate suggests content-audience mismatch");
    }

    if (metrics.conversions < 5) {
      risks.push("Low conversion volume makes ROI calculations less reliable");
    }

    const contentAge = this.getContentAgeDays(metrics);
    if (contentAge > 365) {
      risks.push("Content aging may impact continued performance");
    }

    if (metrics.marketing_spend > metrics.revenue * 0.8) {
      risks.push(
        "High marketing spend ratio indicates unsustainable acquisition costs"
      );
    }

    return risks;
  }

  /**
   * Generate actionable recommendations based on analysis
   */
  private generateActionableRecommendations(
    metrics: ContentMetrics,
    opportunities: string[]
  ): string[] {
    const actions: string[] = [];

    if (opportunities.some(op => op.includes("revenue"))) {
      actions.push("A/B test pricing strategies and bundle offerings");
    }

    if (opportunities.some(op => op.includes("engagement"))) {
      actions.push("Add interactive elements and improve content format");
    }

    if (opportunities.some(op => op.includes("conversion"))) {
      actions.push("Optimize call-to-action placement and messaging");
    }

    if (
      this.calculateCostPerAcquisition(metrics) > metrics.average_order_value
    ) {
      actions.push(
        "Focus on organic growth and referral programs to reduce acquisition costs"
      );
    }

    return actions;
  }

  /**
   * Analyze trends across multiple time periods
   */
  analyzeTrends(historicalData: ContentMetrics[]): TrendAnalysis[] {
    const trends: TrendAnalysis[] = [];

    // Group by content_id
    const contentGroups = this.groupByContentId(historicalData);

    for (const [contentId, metrics] of contentGroups) {
      if (metrics.length < 2) continue; // Need at least 2 data points

      const trendAnalysis = this.calculateTrendMetrics(contentId, metrics);
      trends.push(trendAnalysis);
    }

    return trends;
  }

  private groupByContentId(
    data: ContentMetrics[]
  ): Map<string, ContentMetrics[]> {
    const groups = new Map<string, ContentMetrics[]>();

    for (const metric of data) {
      if (!groups.has(metric.content_id)) {
        groups.set(metric.content_id, []);
      }
      groups.get(metric.content_id)!.push(metric);
    }

    // Sort each group by date
    for (const [, metrics] of groups) {
      metrics.sort(
        (a, b) =>
          new Date(a.period_start).getTime() -
          new Date(b.period_start).getTime()
      );
    }

    return groups;
  }

  private calculateTrendMetrics(
    contentId: string,
    metrics: ContentMetrics[]
  ): TrendAnalysis {
    const revenues = metrics.map(m => m.revenue);
    const n = revenues.length;

    // Calculate linear regression for trend direction
    const { slope, correlation } = this.linearRegression(revenues);

    // Determine trend direction
    let trendDirection: "increasing" | "decreasing" | "stable" | "volatile";
    if (Math.abs(slope) < 0.1) {
      trendDirection = "stable";
    } else if (Math.abs(correlation) < 0.5) {
      trendDirection = "volatile";
    } else {
      trendDirection = slope > 0 ? "increasing" : "decreasing";
    }

    // Calculate velocity (rate of change)
    const velocity = n > 1 ? (revenues[n - 1] - revenues[0]) / (n - 1) : 0;

    // Calculate momentum (acceleration)
    const momentum = n > 2 ? this.calculateMomentum(revenues) : 0;

    // Detect seasonal patterns (simplified)
    const seasonalPattern = this.detectSeasonality(metrics);

    return {
      content_id: contentId,
      trend_direction: trendDirection,
      trend_strength: Math.abs(correlation),
      velocity,
      momentum,
      seasonal_pattern: seasonalPattern,
      prediction_confidence: Math.abs(correlation),
    };
  }

  private linearRegression(values: number[]): {
    slope: number;
    correlation: number;
  } {
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * values[i], 0);
    const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);
    const sumYY = values.reduce((acc, yi) => acc + yi * yi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    const meanX = sumX / n;
    const meanY = sumY / n;

    const correlation =
      (sumXY - n * meanX * meanY) /
      Math.sqrt((sumXX - n * meanX * meanX) * (sumYY - n * meanY * meanY));

    return { slope, correlation: isNaN(correlation) ? 0 : correlation };
  }

  private calculateMomentum(values: number[]): number {
    if (values.length < 3) return 0;

    const changes = [];
    for (let i = 1; i < values.length; i++) {
      changes.push(values[i] - values[i - 1]);
    }

    const momentumChanges = [];
    for (let i = 1; i < changes.length; i++) {
      momentumChanges.push(changes[i] - changes[i - 1]);
    }

    return momentumChanges.reduce((a, b) => a + b, 0) / momentumChanges.length;
  }

  private detectSeasonality(metrics: ContentMetrics[]): boolean {
    // Simplified seasonality detection
    if (metrics.length < 12) return false;

    const monthlyRevenues = new Map<number, number[]>();

    for (const metric of metrics) {
      const month = new Date(metric.period_start).getMonth();
      if (!monthlyRevenues.has(month)) {
        monthlyRevenues.set(month, []);
      }
      monthlyRevenues.get(month)!.push(metric.revenue);
    }

    const monthlyAverages = Array.from(monthlyRevenues.entries()).map(
      ([month, revenues]) => ({
        month,
        average: revenues.reduce((a, b) => a + b, 0) / revenues.length,
      })
    );

    if (monthlyAverages.length < 6) return false;

    const avgRevenue =
      monthlyAverages.reduce((a, b) => a + b.average, 0) /
      monthlyAverages.length;
    const variance =
      monthlyAverages.reduce(
        (acc, m) => acc + Math.pow(m.average - avgRevenue, 2),
        0
      ) / monthlyAverages.length;
    const coefficientOfVariation = Math.sqrt(variance) / avgRevenue;

    return coefficientOfVariation > 0.3;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ROICalculationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): ROICalculationConfig {
    return { ...this.config };
  }
}

export type { ContentMetrics, ROICalculationConfig, ROIResult, TrendAnalysis };
