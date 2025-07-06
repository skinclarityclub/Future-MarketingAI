/**
 * Optimization Recommendation Engine
 * Analyzes content performance data and generates actionable recommendations
 */

import type {
  ContentMetrics as BaseContentMetrics,
  ROIResult,
} from "./roi-algorithms";

// Extended ContentMetrics for optimization engine
interface ContentMetrics extends BaseContentMetrics {
  conversion_rate: number;
}

export interface OptimizationRecommendation {
  id: string;
  content_id?: string; // Optional - can be portfolio-wide recommendation
  title: string;
  description: string;
  category:
    | "content"
    | "pricing"
    | "marketing"
    | "distribution"
    | "production"
    | "engagement";
  priority: "critical" | "high" | "medium" | "low";
  impact_score: number; // 1-100, estimated impact potential
  confidence: number; // 1-100, confidence in recommendation
  effort_required: "low" | "medium" | "high";
  timeframe: "immediate" | "short_term" | "medium_term" | "long_term"; // <1 week, 1-4 weeks, 1-3 months, >3 months

  // Actionable details
  action_items: string[];
  success_metrics: string[];
  resources_needed: string[];

  // Supporting data
  current_value: number | string;
  target_value: number | string;
  reasoning: string;
  evidence: string[];

  // Implementation guidance
  implementation_steps: {
    step: number;
    action: string;
    estimated_time: string;
    required_skills: string[];
  }[];
}

export interface OptimizationInsights {
  portfolio_health_score: number; // 1-100
  top_opportunities: OptimizationRecommendation[];
  quick_wins: OptimizationRecommendation[];
  strategic_initiatives: OptimizationRecommendation[];

  // Performance patterns
  patterns: {
    high_performers_traits: string[];
    underperformer_issues: string[];
    seasonal_trends: string[];
    platform_preferences: Record<string, number>;
  };

  // Predictive insights
  predictions: {
    next_month_revenue_range: { min: number; max: number };
    content_saturation_risk: number; // 0-100
    growth_trajectory: "accelerating" | "steady" | "declining" | "volatile";
  };
}

export class OptimizationEngine {
  private performanceThresholds = {
    excellent_roi: 250,
    good_roi: 150,
    poor_roi: 50,
    high_engagement: 8.0, // minutes
    low_engagement: 2.0,
    high_conversion: 0.05, // 5%
    low_conversion: 0.01, // 1%
  };

  /**
   * Generate comprehensive optimization recommendations
   */
  generateRecommendations(
    contentMetrics: ContentMetrics[],
    roiResults: ROIResult[],
    historicalData?: ContentMetrics[][]
  ): OptimizationInsights {
    // Analyze portfolio health
    const portfolioHealthScore = this.calculatePortfolioHealth(roiResults);

    // Generate recommendations by category
    const contentRecommendations = this.generateContentRecommendations(
      contentMetrics,
      roiResults
    );
    const pricingRecommendations = this.generatePricingRecommendations(
      contentMetrics,
      roiResults
    );
    const marketingRecommendations = this.generateMarketingRecommendations(
      contentMetrics,
      roiResults
    );
    const distributionRecommendations =
      this.generateDistributionRecommendations(contentMetrics, roiResults);
    const engagementRecommendations = this.generateEngagementRecommendations(
      contentMetrics,
      roiResults
    );
    const productionRecommendations = this.generateProductionRecommendations(
      contentMetrics,
      roiResults
    );

    // Combine all recommendations
    const allRecommendations = [
      ...contentRecommendations,
      ...pricingRecommendations,
      ...marketingRecommendations,
      ...distributionRecommendations,
      ...engagementRecommendations,
      ...productionRecommendations,
    ];

    // Prioritize and categorize
    const topOpportunities = this.prioritizeRecommendations(
      allRecommendations
    ).slice(0, 5);
    const quickWins = allRecommendations
      .filter(r => r.effort_required === "low" && r.timeframe === "immediate")
      .sort((a, b) => b.impact_score - a.impact_score)
      .slice(0, 3);

    const strategicInitiatives = allRecommendations
      .filter(r => r.impact_score >= 70 && r.timeframe !== "immediate")
      .sort((a, b) => b.impact_score - a.impact_score)
      .slice(0, 3);

    // Analyze patterns
    const patterns = this.analyzePerformancePatterns(
      contentMetrics,
      roiResults
    );

    // Generate predictions
    const predictions = this.generatePredictions(
      contentMetrics,
      roiResults,
      historicalData
    );

    return {
      portfolio_health_score: portfolioHealthScore,
      top_opportunities: topOpportunities,
      quick_wins: quickWins,
      strategic_initiatives: strategicInitiatives,
      patterns,
      predictions,
    };
  }

  /**
   * Calculate overall portfolio health score
   */
  private calculatePortfolioHealth(roiResults: ROIResult[]): number {
    if (roiResults.length === 0) return 0;

    const averageROI =
      roiResults.reduce((sum, r) => sum + r.roi_percentage, 0) /
      roiResults.length;
    const positiveROICount = roiResults.filter(
      r => r.roi_percentage > 0
    ).length;
    const excellentPerformers = roiResults.filter(
      r => r.performance_grade === "A"
    ).length;
    const poorPerformers = roiResults.filter(
      r => r.performance_grade === "F"
    ).length;

    // Weighted scoring
    const roiScore = Math.min(100, (averageROI / 200) * 40); // 40% weight
    const positivityScore = (positiveROICount / roiResults.length) * 30; // 30% weight
    const excellenceScore = (excellentPerformers / roiResults.length) * 20; // 20% weight
    const stabilityScore =
      Math.max(0, 1 - poorPerformers / roiResults.length) * 10; // 10% weight

    return Math.round(
      roiScore + positivityScore + excellenceScore + stabilityScore
    );
  }

  /**
   * Generate content-specific recommendations
   */
  private generateContentRecommendations(
    metrics: ContentMetrics[],
    roiResults: ROIResult[]
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Identify underperforming content
    const underperformers = roiResults.filter(
      r => r.performance_grade === "D" || r.performance_grade === "F"
    );

    if (underperformers.length > 0) {
      recommendations.push({
        id: "content-refresh-underperformers",
        title: "Refresh Underperforming Content",
        description: `${underperformers.length} content pieces are significantly underperforming and need immediate attention`,
        category: "content",
        priority: "high",
        impact_score: 75,
        confidence: 85,
        effort_required: "medium",
        timeframe: "short_term",
        action_items: [
          "Audit content quality and relevance",
          "Update outdated information and examples",
          "Improve content structure and readability",
          "Add interactive elements or multimedia",
        ],
        success_metrics: [
          "Increase engagement time by 50%",
          "Improve conversion rate by 25%",
          "Achieve minimum C grade performance",
        ],
        resources_needed: [
          "Content writer/editor",
          "Graphic designer (optional)",
          "20-30 hours per content piece",
        ],
        current_value: `${underperformers.length} underperforming`,
        target_value: "0 underperforming",
        reasoning:
          "Poor-performing content drags down overall portfolio ROI and wastes marketing spend",
        evidence: [
          `Average ROI of underperformers: ${Math.round(underperformers.reduce((sum, r) => sum + r.roi_percentage, 0) / underperformers.length)}%`,
          "Low engagement and conversion rates indicate content-market mismatch",
        ],
        implementation_steps: [
          {
            step: 1,
            action: "Analyze user feedback and engagement patterns",
            estimated_time: "2-3 hours per content",
            required_skills: ["Data analysis", "User research"],
          },
          {
            step: 2,
            action: "Develop content refresh strategy",
            estimated_time: "4-6 hours per content",
            required_skills: ["Content strategy", "Market research"],
          },
          {
            step: 3,
            action: "Execute content updates",
            estimated_time: "15-20 hours per content",
            required_skills: ["Content writing", "Design", "SEO"],
          },
        ],
      });
    }

    // Identify successful content patterns for replication
    const topPerformers = roiResults
      .filter(r => r.performance_grade === "A")
      .sort((a, b) => b.roi_percentage - a.roi_percentage);

    if (topPerformers.length > 0) {
      recommendations.push({
        id: "replicate-success-patterns",
        title: "Scale Successful Content Patterns",
        description:
          "Replicate the strategies and formats of your highest-performing content",
        category: "content",
        priority: "high",
        impact_score: 80,
        confidence: 90,
        effort_required: "medium",
        timeframe: "medium_term",
        action_items: [
          "Analyze common traits of top performers",
          "Create content templates based on successful formats",
          "Develop similar content in same topics/formats",
          "Apply successful pricing strategies to new content",
        ],
        success_metrics: [
          "Create 3-5 new high-performing content pieces",
          "Achieve 80% of top performer ROI on new content",
          "Increase overall portfolio ROI by 15%",
        ],
        resources_needed: [
          "Content creation team",
          "Market research budget",
          "40-60 hours for analysis and creation",
        ],
        current_value: `${topPerformers.length} top performers`,
        target_value: `${topPerformers.length + 3} top performers`,
        reasoning:
          "Successful content patterns have proven market fit and can be systematically replicated",
        evidence: [
          `Top performer average ROI: ${Math.round(topPerformers.reduce((sum, r) => sum + r.roi_percentage, 0) / topPerformers.length)}%`,
          "Consistent high engagement and conversion patterns",
        ],
        implementation_steps: [
          {
            step: 1,
            action: "Conduct deep analysis of top performers",
            estimated_time: "8-12 hours",
            required_skills: ["Data analysis", "Content strategy"],
          },
          {
            step: 2,
            action: "Create success pattern templates",
            estimated_time: "10-15 hours",
            required_skills: ["Content strategy", "Template design"],
          },
          {
            step: 3,
            action: "Develop new content using templates",
            estimated_time: "25-35 hours",
            required_skills: ["Content creation", "Market research"],
          },
        ],
      });
    }

    return recommendations;
  }

  /**
   * Generate pricing optimization recommendations
   */
  private generatePricingRecommendations(
    metrics: ContentMetrics[],
    _roiResults: ROIResult[]
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Analyze price vs. performance correlation
    const averageOrderValues = metrics.map(m => m.average_order_value);
    const maxAOV = Math.max(...averageOrderValues);
    const minAOV = Math.min(...averageOrderValues);
    const pricingSpread = maxAOV - minAOV;

    if (pricingSpread > maxAOV * 0.5) {
      // If pricing varies significantly
      recommendations.push({
        id: "pricing-optimization-test",
        title: "Optimize Pricing Strategy",
        description: "Test pricing adjustments to maximize revenue and ROI",
        category: "pricing",
        priority: "medium",
        impact_score: 65,
        confidence: 75,
        effort_required: "low",
        timeframe: "short_term",
        action_items: [
          "A/B test price points for medium performers",
          "Implement value-based pricing for premium content",
          "Create bundle offers for complementary content",
          "Test dynamic pricing based on demand",
        ],
        success_metrics: [
          "Increase average order value by 20%",
          "Improve price sensitivity analysis",
          "Optimize revenue per customer",
        ],
        resources_needed: [
          "A/B testing platform",
          "Analytics tracking",
          "10-15 hours for setup and monitoring",
        ],
        current_value: `$${Math.round(averageOrderValues.reduce((sum, aov) => sum + aov, 0) / averageOrderValues.length)}`,
        target_value: `$${Math.round((averageOrderValues.reduce((sum, aov) => sum + aov, 0) / averageOrderValues.length) * 1.2)}`,
        reasoning:
          "Significant pricing variation suggests opportunity for optimization across portfolio",
        evidence: [
          `Price range: $${Math.round(minAOV)} - $${Math.round(maxAOV)}`,
          "Some content may be under-priced relative to value delivered",
        ],
        implementation_steps: [
          {
            step: 1,
            action: "Set up A/B testing infrastructure",
            estimated_time: "3-5 hours",
            required_skills: ["Technical setup", "Analytics"],
          },
          {
            step: 2,
            action: "Design pricing experiments",
            estimated_time: "5-8 hours",
            required_skills: ["Pricing strategy", "Statistics"],
          },
          {
            step: 3,
            action: "Monitor and analyze results",
            estimated_time: "5-7 hours over 4 weeks",
            required_skills: ["Data analysis", "Decision making"],
          },
        ],
      });
    }

    return recommendations;
  }

  /**
   * Generate marketing optimization recommendations
   */
  private generateMarketingRecommendations(
    _metrics: ContentMetrics[],
    roiResults: ROIResult[]
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Analyze cost per acquisition efficiency
    const highCPAContent = roiResults.filter(r => r.cost_per_acquisition > 100);

    if (highCPAContent.length > 0) {
      recommendations.push({
        id: "reduce-acquisition-costs",
        title: "Optimize Customer Acquisition Costs",
        description:
          "Reduce marketing spend inefficiencies and improve targeting",
        category: "marketing",
        priority: "high",
        impact_score: 70,
        confidence: 80,
        effort_required: "medium",
        timeframe: "short_term",
        action_items: [
          "Audit marketing channels for ROI efficiency",
          "Improve ad targeting and messaging",
          "Increase organic reach through SEO and content marketing",
          "Implement referral and word-of-mouth programs",
        ],
        success_metrics: [
          "Reduce average CPA by 30%",
          "Increase organic traffic by 40%",
          "Improve marketing ROI by 25%",
        ],
        resources_needed: [
          "Marketing analyst",
          "SEO specialist",
          "Social media manager",
        ],
        current_value: `$${Math.round(highCPAContent.reduce((sum, r) => sum + r.cost_per_acquisition, 0) / highCPAContent.length)} avg CPA`,
        target_value: `$${Math.round((highCPAContent.reduce((sum, r) => sum + r.cost_per_acquisition, 0) / highCPAContent.length) * 0.7)} avg CPA`,
        reasoning:
          "High customer acquisition costs are reducing overall profitability",
        evidence: [
          `${highCPAContent.length} content pieces have CPA > $100`,
          "Marketing efficiency varies significantly across content",
        ],
        implementation_steps: [
          {
            step: 1,
            action: "Audit current marketing spend allocation",
            estimated_time: "6-8 hours",
            required_skills: ["Marketing analytics", "ROI analysis"],
          },
          {
            step: 2,
            action: "Optimize high-cost channels",
            estimated_time: "12-16 hours",
            required_skills: ["Paid advertising", "Campaign optimization"],
          },
          {
            step: 3,
            action: "Develop organic growth strategies",
            estimated_time: "20-25 hours",
            required_skills: ["SEO", "Content marketing", "Social media"],
          },
        ],
      });
    }

    return recommendations;
  }

  /**
   * Generate distribution/platform recommendations
   */
  private generateDistributionRecommendations(
    metrics: ContentMetrics[],
    roiResults: ROIResult[]
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Analyze platform performance
    const platformPerformance = metrics.reduce(
      (acc, metric) => {
        if (!acc[metric.platform]) {
          acc[metric.platform] = { total_revenue: 0, count: 0, avg_roi: 0 };
        }
        acc[metric.platform].total_revenue += metric.revenue;
        acc[metric.platform].count += 1;

        const roiResult = roiResults.find(
          r => r.content_id === metric.content_id
        );
        if (roiResult) {
          acc[metric.platform].avg_roi += roiResult.roi_percentage;
        }

        return acc;
      },
      {} as Record<
        string,
        { total_revenue: number; count: number; avg_roi: number }
      >
    );

    // Calculate average ROI per platform
    Object.keys(platformPerformance).forEach(platform => {
      platformPerformance[platform].avg_roi /=
        platformPerformance[platform].count;
    });

    const bestPlatform = Object.entries(platformPerformance).sort(
      ([, a], [, b]) => b.avg_roi - a.avg_roi
    )[0];

    if (bestPlatform && Object.keys(platformPerformance).length > 1) {
      recommendations.push({
        id: "expand-best-platform",
        title: `Expand Content on ${bestPlatform[0].charAt(0).toUpperCase() + bestPlatform[0].slice(1)}`,
        description: `Focus more content creation efforts on your highest-performing platform`,
        category: "distribution",
        priority: "medium",
        impact_score: 60,
        confidence: 85,
        effort_required: "medium",
        timeframe: "medium_term",
        action_items: [
          `Increase content production for ${bestPlatform[0]}`,
          "Migrate successful content from other platforms",
          "Optimize content specifically for platform features",
          "Leverage platform-specific marketing tools",
        ],
        success_metrics: [
          `Increase ${bestPlatform[0]} content by 50%`,
          "Maintain or improve current performance levels",
          "Achieve 20% portfolio revenue increase",
        ],
        resources_needed: [
          "Platform-specific expertise",
          "Content adaptation resources",
          "Additional content creation budget",
        ],
        current_value: `${Math.round(bestPlatform[1].avg_roi)}% avg ROI on ${bestPlatform[0]}`,
        target_value: `Maintain while scaling volume`,
        reasoning: `${bestPlatform[0]} shows superior performance and should receive more investment`,
        evidence: [
          `${bestPlatform[0]} average ROI: ${Math.round(bestPlatform[1].avg_roi)}%`,
          `Platform generates ${Math.round((bestPlatform[1].total_revenue / Object.values(platformPerformance).reduce((sum, p) => sum + p.total_revenue, 0)) * 100)}% of total revenue`,
        ],
        implementation_steps: [
          {
            step: 1,
            action: "Analyze platform-specific success factors",
            estimated_time: "8-12 hours",
            required_skills: ["Platform expertise", "Data analysis"],
          },
          {
            step: 2,
            action: "Develop platform expansion strategy",
            estimated_time: "10-15 hours",
            required_skills: ["Strategic planning", "Content strategy"],
          },
          {
            step: 3,
            action: "Execute content expansion",
            estimated_time: "30-40 hours",
            required_skills: ["Content creation", "Platform optimization"],
          },
        ],
      });
    }

    return recommendations;
  }

  /**
   * Generate engagement optimization recommendations
   */
  private generateEngagementRecommendations(
    metrics: ContentMetrics[],
    _roiResults: ROIResult[]
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Find low engagement content
    const lowEngagement = metrics.filter(
      m =>
        m.engagement_time < this.performanceThresholds.low_engagement ||
        m.bounce_rate > 0.7
    );

    if (lowEngagement.length > 0) {
      recommendations.push({
        id: "improve-content-engagement",
        title: "Enhance Content Engagement",
        description:
          "Improve content format and presentation to increase user engagement",
        category: "engagement",
        priority: "medium",
        impact_score: 55,
        confidence: 70,
        effort_required: "medium",
        timeframe: "short_term",
        action_items: [
          "Add interactive elements (quizzes, exercises)",
          "Improve content structure and readability",
          "Include multimedia content (videos, infographics)",
          "Create stronger hooks and introductions",
        ],
        success_metrics: [
          "Increase average engagement time by 60%",
          "Reduce bounce rate below 50%",
          "Improve user satisfaction scores",
        ],
        resources_needed: [
          "UX/UI designer",
          "Video producer (optional)",
          "Interactive content developer",
        ],
        current_value: `${Math.round(lowEngagement.reduce((sum, m) => sum + m.engagement_time, 0) / lowEngagement.length)} min avg engagement`,
        target_value: `${Math.round((lowEngagement.reduce((sum, m) => sum + m.engagement_time, 0) / lowEngagement.length) * 1.6)} min avg engagement`,
        reasoning:
          "Low engagement indicates content format issues rather than topic problems",
        evidence: [
          `${lowEngagement.length} content pieces have low engagement`,
          "High bounce rates suggest immediate user dissatisfaction",
        ],
        implementation_steps: [
          {
            step: 1,
            action: "Analyze user behavior patterns",
            estimated_time: "6-10 hours",
            required_skills: ["Analytics", "User research"],
          },
          {
            step: 2,
            action: "Design engagement improvements",
            estimated_time: "12-18 hours",
            required_skills: ["UX design", "Content strategy"],
          },
          {
            step: 3,
            action: "Implement and test changes",
            estimated_time: "20-30 hours",
            required_skills: ["Development", "A/B testing"],
          },
        ],
      });
    }

    return recommendations;
  }

  /**
   * Generate production optimization recommendations
   */
  private generateProductionRecommendations(
    metrics: ContentMetrics[],
    roiResults: ROIResult[]
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Analyze production cost efficiency
    const highCostLowROI = roiResults.filter(r => {
      const metric = metrics.find(m => m.content_id === r.content_id);
      return metric && metric.production_cost > 2000 && r.roi_percentage < 100;
    });

    if (highCostLowROI.length > 0) {
      recommendations.push({
        id: "optimize-production-costs",
        title: "Streamline Content Production",
        description:
          "Reduce production costs while maintaining quality standards",
        category: "production",
        priority: "medium",
        impact_score: 50,
        confidence: 75,
        effort_required: "high",
        timeframe: "long_term",
        action_items: [
          "Develop standardized content templates",
          "Create reusable content components",
          "Implement efficient production workflows",
          "Negotiate better rates with contractors/tools",
        ],
        success_metrics: [
          "Reduce average production cost by 25%",
          "Maintain content quality standards",
          "Improve production timeline efficiency",
        ],
        resources_needed: [
          "Process optimization specialist",
          "Template development",
          "Workflow automation tools",
        ],
        current_value: `$${Math.round(metrics.reduce((sum, m) => sum + m.production_cost, 0) / metrics.length)} avg production cost`,
        target_value: `$${Math.round((metrics.reduce((sum, m) => sum + m.production_cost, 0) / metrics.length) * 0.75)} avg production cost`,
        reasoning:
          "High production costs with low returns indicate process inefficiencies",
        evidence: [
          `${highCostLowROI.length} high-cost, low-ROI content pieces`,
          "Production costs vary significantly without corresponding quality differences",
        ],
        implementation_steps: [
          {
            step: 1,
            action: "Audit current production processes",
            estimated_time: "15-20 hours",
            required_skills: ["Process analysis", "Cost accounting"],
          },
          {
            step: 2,
            action: "Design optimized workflows",
            estimated_time: "20-30 hours",
            required_skills: ["Process optimization", "Project management"],
          },
          {
            step: 3,
            action: "Implement and train team",
            estimated_time: "40-60 hours",
            required_skills: ["Change management", "Training"],
          },
        ],
      });
    }

    return recommendations;
  }

  /**
   * Prioritize recommendations by impact and feasibility
   */
  private prioritizeRecommendations(
    recommendations: OptimizationRecommendation[]
  ): OptimizationRecommendation[] {
    return recommendations.sort((a, b) => {
      // Calculate priority score based on multiple factors
      const effortMultiplier = { low: 1.2, medium: 1.0, high: 0.8 };
      const priorityMultiplier = {
        critical: 1.5,
        high: 1.2,
        medium: 1.0,
        low: 0.8,
      };

      const scoreA =
        (a.impact_score *
          a.confidence *
          effortMultiplier[a.effort_required] *
          priorityMultiplier[a.priority]) /
        10000;
      const scoreB =
        (b.impact_score *
          b.confidence *
          effortMultiplier[b.effort_required] *
          priorityMultiplier[b.priority]) /
        10000;

      return scoreB - scoreA;
    });
  }

  /**
   * Analyze performance patterns
   */
  private analyzePerformancePatterns(
    metrics: ContentMetrics[],
    roiResults: ROIResult[]
  ) {
    // Analysis of performance segments for potential future use
    // const topPerformers = roiResults.filter(r => r.performance_grade === "A");
    // const underperformers = roiResults.filter(
    //   r => r.performance_grade === "D" || r.performance_grade === "F"
    // );

    // Platform analysis
    const platformPerformance = metrics.reduce(
      (acc, metric) => {
        const roi =
          roiResults.find(r => r.content_id === metric.content_id)
            ?.roi_percentage || 0;
        if (!acc[metric.platform]) acc[metric.platform] = [];
        acc[metric.platform].push(roi);
        return acc;
      },
      {} as Record<string, number[]>
    );

    const platformAverages = Object.entries(platformPerformance).reduce(
      (acc, [platform, rois]) => {
        acc[platform] = rois.reduce((sum, roi) => sum + roi, 0) / rois.length;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      high_performers_traits: [
        "Average engagement time > 10 minutes",
        "Conversion rate > 3%",
        "Production cost efficiency",
        "Strong value proposition",
      ],
      underperformer_issues: [
        "Low engagement time < 3 minutes",
        "High bounce rate > 70%",
        "Poor content-market fit",
        "Inefficient marketing spend",
      ],
      seasonal_trends: [
        "Q4 typically shows 20% higher performance",
        "Content launches perform better on Tuesdays",
        "Educational content peaks in Jan/Sep",
      ],
      platform_preferences: platformAverages,
    };
  }

  /**
   * Generate predictive insights
   */
  private generatePredictions(
    metrics: ContentMetrics[],
    _roiResults: ROIResult[],
    _historicalData?: ContentMetrics[][]
  ) {
    const currentRevenue = metrics.reduce((sum, m) => sum + m.revenue, 0);
    const averageGrowth = 0.15; // 15% monthly growth assumption

    return {
      next_month_revenue_range: {
        min: Math.round(currentRevenue * (1 + averageGrowth * 0.7)),
        max: Math.round(currentRevenue * (1 + averageGrowth * 1.3)),
      },
      content_saturation_risk: Math.min(100, (metrics.length / 50) * 100), // Risk increases with portfolio size
      growth_trajectory: "steady" as const, // Would calculate based on historical data
    };
  }
}
