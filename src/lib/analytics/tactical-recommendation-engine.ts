/**
 * Tactical Recommendation Engine
 * Generates actionable business recommendations based on predictive insights
 */

import {
  MLPrediction,
  AnomalyDetection,
  TrendAnalysis,
} from "./tactical-ml-models";
import { PredictiveInsight } from "./tactical-data-engine";

// Recommendation Types
export interface BusinessRecommendation {
  id: string;
  title: string;
  description: string;
  category:
    | "revenue_optimization"
    | "cost_reduction"
    | "market_opportunity"
    | "risk_mitigation"
    | "operational_efficiency";
  priority: "low" | "medium" | "high" | "critical";
  urgency: "immediate" | "short_term" | "long_term"; // immediate: <1 week, short_term: 1-4 weeks, long_term: >1 month
  action_type: "monitor" | "investigate" | "implement" | "optimize" | "pivot";

  // Impact Assessment
  confidence_score: number; // 0-100
  potential_impact: {
    revenue_impact: number; // estimated $ impact
    cost_impact: number; // estimated $ impact (negative = cost reduction)
    risk_impact: number; // 0-100 risk reduction score
    timeline_days: number; // expected days to see impact
  };

  // Actionable Details
  specific_actions: string[];
  success_metrics: string[];
  risk_factors: string[];
  resource_requirements: string[];

  // Data Context
  supporting_data: {
    predictions: MLPrediction[];
    insights: PredictiveInsight[];
    anomalies?: AnomalyDetection[];
    trends?: TrendAnalysis[];
  };

  created_at: string;
  expires_at: string; // recommendations have relevance timeframe
}

export interface RecommendationContext {
  business_sector?: string;
  company_size?: "startup" | "small" | "medium" | "enterprise";
  risk_tolerance?: "conservative" | "moderate" | "aggressive";
  budget_constraints?: {
    max_investment?: number;
    preferred_roi_months?: number;
  };
  current_priorities?: string[];
}

/**
 * Advanced Recommendation Engine
 */
export class TacticalRecommendationEngine {
  private businessRules: Map<string, (data: any) => BusinessRecommendation[]> =
    new Map();
  private impactCalculators: Map<string, (data: any) => number> = new Map();

  constructor() {
    this.initializeBusinessRules();
    this.initializeImpactCalculators();
  }

  /**
   * Generate comprehensive business recommendations
   */
  async generateRecommendations(
    predictions: MLPrediction[],
    insights: PredictiveInsight[],
    context?: RecommendationContext
  ): Promise<BusinessRecommendation[]> {
    const recommendations: BusinessRecommendation[] = [];

    try {
      // Analyze predictions for opportunities
      const predictionRecs = await this.analyzeMLPredictions(
        predictions,
        context
      );
      recommendations.push(...predictionRecs);

      // Analyze insights for strategic recommendations
      const insightRecs = await this.analyzeInsights(insights, context);
      recommendations.push(...insightRecs);

      // Apply business context and rules
      const contextualRecs = this.applyBusinessContext(
        recommendations,
        context
      );

      // Prioritize and rank recommendations
      const prioritizedRecs = this.prioritizeRecommendations(
        contextualRecs,
        context
      );

      // Filter and deduplicate
      const finalRecs = this.refineRecommendations(prioritizedRecs);

      return finalRecs;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error generating recommendations:", error);
      }
      return [];
    }
  }

  /**
   * Analyze ML predictions for actionable insights
   */
  private async analyzeMLPredictions(
    predictions: MLPrediction[],
    context?: RecommendationContext
  ): Promise<BusinessRecommendation[]> {
    const recommendations: BusinessRecommendation[] = [];

    // Group predictions by metric and trend
    const predictionGroups = this.groupPredictionsByPattern(predictions);

    for (const [pattern, preds] of predictionGroups) {
      const recs = this.generatePatternBasedRecommendations(
        pattern,
        preds,
        context
      );
      recommendations.push(...recs);
    }

    return recommendations;
  }

  /**
   * Analyze insights for strategic recommendations
   */
  private async analyzeInsights(
    insights: PredictiveInsight[],
    context?: RecommendationContext
  ): Promise<BusinessRecommendation[]> {
    const recommendations: BusinessRecommendation[] = [];

    for (const insight of insights) {
      // High-confidence insights deserve immediate attention
      if (insight.confidence_score >= 80) {
        const rec = this.createHighConfidenceRecommendation(insight, context);
        if (rec) recommendations.push(rec);
      }

      // High-impact insights need strategic planning
      if (insight.impact_score >= 70) {
        const rec = this.createHighImpactRecommendation(insight, context);
        if (rec) recommendations.push(rec);
      }

      // Risk-based recommendations
      if (insight.risk_factors && insight.risk_factors.length > 0) {
        const rec = this.createRiskMitigationRecommendation(insight, context);
        if (rec) recommendations.push(rec);
      }
    }

    return recommendations;
  }

  /**
   * Generate recommendations based on prediction patterns
   */
  private generatePatternBasedRecommendations(
    pattern: string,
    predictions: MLPrediction[],
    context?: RecommendationContext
  ): BusinessRecommendation[] {
    const recommendations: BusinessRecommendation[] = [];

    switch (pattern) {
      case "revenue_decline":
        recommendations.push(
          ...this.createRevenueDeclineRecommendations(predictions, context)
        );
        break;

      case "revenue_growth":
        recommendations.push(
          ...this.createRevenueGrowthRecommendations(predictions, context)
        );
        break;

      case "cost_increase":
        recommendations.push(
          ...this.createCostIncreaseRecommendations(predictions, context)
        );
        break;

      case "market_opportunity":
        recommendations.push(
          ...this.createMarketOpportunityRecommendations(predictions, context)
        );
        break;

      case "volatility_high":
        recommendations.push(
          ...this.createVolatilityRecommendations(predictions, context)
        );
        break;
    }

    return recommendations;
  }

  /**
   * Create revenue decline recommendations
   */
  private createRevenueDeclineRecommendations(
    predictions: MLPrediction[],
    _context?: RecommendationContext
  ): BusinessRecommendation[] {
    const recommendations: BusinessRecommendation[] = [];

    const avgDecline =
      predictions.reduce((sum, p) => sum + Math.abs(p.change_percentage), 0) /
      predictions.length;
    const avgConfidence =
      predictions.reduce((sum, p) => sum + p.confidence_score, 0) /
      predictions.length;

    // Immediate action for significant decline
    if (avgDecline > 15) {
      recommendations.push({
        id: `revenue_decline_${Date.now()}`,
        title: "Revenue Decline Mitigation Required",
        description: `Revenue is predicted to decline by ${avgDecline.toFixed(1)}% in the coming period. Immediate action is required to identify and address the root causes.`,
        category: "revenue_optimization",
        priority: "critical",
        urgency: "immediate",
        action_type: "investigate",
        confidence_score: Math.round(avgConfidence),
        potential_impact: {
          revenue_impact: this.estimateRevenueImpact(predictions, "prevention"),
          cost_impact: 0,
          risk_impact: 85,
          timeline_days: 7,
        },
        specific_actions: [
          "Conduct immediate revenue stream analysis",
          "Review recent marketing campaign performance",
          "Analyze customer acquisition and retention metrics",
          "Investigate pricing strategy effectiveness",
          "Assess competitive landscape changes",
        ],
        success_metrics: [
          "Revenue decline stabilization within 2 weeks",
          "Customer acquisition rate improvement",
          "Average order value maintenance",
          "Conversion rate optimization",
        ],
        risk_factors: [
          "Customer churn acceleration",
          "Market share loss to competitors",
          "Brand reputation impact",
          "Investor confidence decline",
        ],
        resource_requirements: [
          "Analytics team for data deep-dive",
          "Marketing team for campaign analysis",
          "Sales team for customer feedback",
          "Executive leadership for strategic decisions",
        ],
        supporting_data: {
          predictions,
          insights: [],
        },
        created_at: new Date().toISOString(),
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      });
    }

    return recommendations;
  }

  /**
   * Create revenue growth recommendations
   */
  private createRevenueGrowthRecommendations(
    predictions: MLPrediction[],
    _context?: RecommendationContext
  ): BusinessRecommendation[] {
    const recommendations: BusinessRecommendation[] = [];

    const avgGrowth =
      predictions.reduce((sum, p) => sum + p.change_percentage, 0) /
      predictions.length;
    const avgConfidence =
      predictions.reduce((sum, p) => sum + p.confidence_score, 0) /
      predictions.length;

    if (avgGrowth > 10) {
      recommendations.push({
        id: `revenue_growth_${Date.now()}`,
        title: "Capitalize on Revenue Growth Opportunity",
        description: `Revenue is predicted to grow by ${avgGrowth.toFixed(1)}%. Consider scaling marketing efforts and optimizing operations to maximize this growth potential.`,
        category: "market_opportunity",
        priority: "high",
        urgency: "short_term",
        action_type: "optimize",
        confidence_score: Math.round(avgConfidence),
        potential_impact: {
          revenue_impact: this.estimateRevenueImpact(
            predictions,
            "amplification"
          ),
          cost_impact: -this.estimateScalingCosts(avgGrowth),
          risk_impact: 15,
          timeline_days: 21,
        },
        specific_actions: [
          "Increase marketing budget by 15-25%",
          "Scale successful advertising campaigns",
          "Optimize inventory and supply chain for increased demand",
          "Prepare customer support for volume increase",
          "Consider expanding product lines or services",
        ],
        success_metrics: [
          "Revenue growth rate acceleration",
          "Customer acquisition cost optimization",
          "Operational efficiency maintenance",
          "Market share expansion",
        ],
        risk_factors: [
          "Overinvestment in scaling too quickly",
          "Quality degradation from rapid growth",
          "Cash flow challenges from investment",
          "Competitive response to growth",
        ],
        resource_requirements: [
          "Additional marketing budget",
          "Operations team scaling",
          "Technology infrastructure upgrades",
          "Quality assurance processes",
        ],
        supporting_data: {
          predictions,
          insights: [],
        },
        created_at: new Date().toISOString(),
        expires_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      });
    }

    return recommendations;
  }

  /**
   * Create cost increase recommendations
   */
  private createCostIncreaseRecommendations(
    predictions: MLPrediction[],
    _context?: RecommendationContext
  ): BusinessRecommendation[] {
    const recommendations: BusinessRecommendation[] = [];

    const costPredictions = predictions.filter(
      p => p.metric.includes("cost") || p.metric.includes("expense")
    );
    if (costPredictions.length === 0) return recommendations;

    const avgIncrease =
      costPredictions.reduce((sum, p) => sum + p.change_percentage, 0) /
      costPredictions.length;
    const avgConfidence =
      costPredictions.reduce((sum, p) => sum + p.confidence_score, 0) /
      costPredictions.length;

    if (avgIncrease > 8) {
      recommendations.push({
        id: `cost_reduction_${Date.now()}`,
        title: "Cost Optimization Initiative Required",
        description: `Operating costs are predicted to increase by ${avgIncrease.toFixed(1)}%. Implement cost optimization strategies to maintain profitability.`,
        category: "cost_reduction",
        priority: "high",
        urgency: "short_term",
        action_type: "optimize",
        confidence_score: Math.round(avgConfidence),
        potential_impact: {
          revenue_impact: 0,
          cost_impact: this.estimateCostSavings(costPredictions),
          risk_impact: 25,
          timeline_days: 14,
        },
        specific_actions: [
          "Conduct comprehensive cost audit",
          "Negotiate better terms with key suppliers",
          "Implement automation to reduce labor costs",
          "Optimize technology stack and subscriptions",
          "Review and eliminate redundant processes",
        ],
        success_metrics: [
          "Cost per unit reduction",
          "Operating margin improvement",
          "Process efficiency gains",
          "Vendor cost optimization",
        ],
        risk_factors: [
          "Quality reduction from cost cutting",
          "Employee morale impact",
          "Customer service degradation",
          "Long-term competitiveness loss",
        ],
        resource_requirements: [
          "Finance team for cost analysis",
          "Operations team for process review",
          "Technology team for automation",
          "Procurement team for vendor negotiations",
        ],
        supporting_data: {
          predictions: costPredictions,
          insights: [],
        },
        created_at: new Date().toISOString(),
        expires_at: new Date(
          Date.now() + 21 * 24 * 60 * 60 * 1000
        ).toISOString(),
      });
    }

    return recommendations;
  }

  /**
   * Create market opportunity recommendations
   */
  private createMarketOpportunityRecommendations(
    predictions: MLPrediction[],
    _context?: RecommendationContext
  ): BusinessRecommendation[] {
    const recommendations: BusinessRecommendation[] = [];

    const opportunityPredictions = predictions.filter(
      p =>
        p.trend === "increasing" &&
        p.confidence_score > 75 &&
        p.change_percentage > 20
    );

    if (opportunityPredictions.length > 0) {
      const avgGrowth =
        opportunityPredictions.reduce(
          (sum, p) => sum + p.change_percentage,
          0
        ) / opportunityPredictions.length;
      const avgConfidence =
        opportunityPredictions.reduce((sum, p) => sum + p.confidence_score, 0) /
        opportunityPredictions.length;

      recommendations.push({
        id: `market_opportunity_${Date.now()}`,
        title: "Strategic Market Opportunity Identified",
        description: `Multiple high-confidence growth indicators suggest a significant market opportunity with ${avgGrowth.toFixed(1)}% potential growth.`,
        category: "market_opportunity",
        priority: "high",
        urgency: "long_term",
        action_type: "implement",
        confidence_score: Math.round(avgConfidence),
        potential_impact: {
          revenue_impact: this.estimateOpportunityValue(opportunityPredictions),
          cost_impact: -this.estimateOpportunityInvestment(avgGrowth),
          risk_impact: 40,
          timeline_days: 60,
        },
        specific_actions: [
          "Develop strategic plan for market expansion",
          "Conduct detailed market research and validation",
          "Identify key partnerships and alliances",
          "Plan product or service enhancements",
          "Create go-to-market strategy",
        ],
        success_metrics: [
          "Market share growth",
          "New customer acquisition rate",
          "Revenue diversification",
          "Brand recognition improvement",
        ],
        risk_factors: [
          "Market timing miscalculation",
          "Competitive response intensity",
          "Resource allocation challenges",
          "Execution complexity",
        ],
        resource_requirements: [
          "Strategic planning team",
          "Market research resources",
          "Product development team",
          "Marketing and sales expansion",
        ],
        supporting_data: {
          predictions: opportunityPredictions,
          insights: [],
        },
        created_at: new Date().toISOString(),
        expires_at: new Date(
          Date.now() + 60 * 24 * 60 * 60 * 1000
        ).toISOString(),
      });
    }

    return recommendations;
  }

  /**
   * Create volatility-based recommendations
   */
  private createVolatilityRecommendations(
    predictions: MLPrediction[],
    _context?: RecommendationContext
  ): BusinessRecommendation[] {
    const recommendations: BusinessRecommendation[] = [];

    const volatilePredictions = predictions.filter(
      p => Math.abs(p.change_percentage) > 25 || p.confidence_score < 60
    );

    if (volatilePredictions.length > 0) {
      recommendations.push({
        id: `volatility_management_${Date.now()}`,
        title: "Market Volatility Risk Management",
        description: `High volatility detected in key metrics. Implement risk management strategies to ensure business stability.`,
        category: "risk_mitigation",
        priority: "medium",
        urgency: "short_term",
        action_type: "monitor",
        confidence_score: 75,
        potential_impact: {
          revenue_impact: 0,
          cost_impact: 0,
          risk_impact: 60,
          timeline_days: 10,
        },
        specific_actions: [
          "Implement enhanced monitoring and alerting",
          "Diversify revenue streams to reduce risk",
          "Create contingency plans for various scenarios",
          "Establish risk management protocols",
          "Regular stakeholder communication plans",
        ],
        success_metrics: [
          "Risk exposure reduction",
          "Business continuity assurance",
          "Stakeholder confidence maintenance",
          "Operational stability metrics",
        ],
        risk_factors: [
          "Unexpected market shifts",
          "Regulatory changes",
          "Competitive disruption",
          "Economic instability",
        ],
        resource_requirements: [
          "Risk management team",
          "Monitoring systems setup",
          "Cross-functional coordination",
          "Communication resources",
        ],
        supporting_data: {
          predictions: volatilePredictions,
          insights: [],
        },
        created_at: new Date().toISOString(),
        expires_at: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
      });
    }

    return recommendations;
  }

  /**
   * Create high-confidence insight recommendations
   */
  private createHighConfidenceRecommendation(
    insight: PredictiveInsight,
    _context?: RecommendationContext
  ): BusinessRecommendation | null {
    return {
      id: `insight_confidence_${insight.id}`,
      title: `High-Confidence Insight: ${insight.title}`,
      description: `${insight.description} This insight has ${insight.confidence_score}% confidence and should be acted upon.`,
      category: this.mapInsightToCategory(insight),
      priority: "high",
      urgency: this.mapTimeHorizonToUrgency(insight.time_horizon),
      action_type: "implement",
      confidence_score: insight.confidence_score,
      potential_impact: {
        revenue_impact: this.estimateInsightRevenueImpact(insight),
        cost_impact: 0,
        risk_impact: insight.impact_score,
        timeline_days: this.mapTimeHorizonToDays(insight.time_horizon),
      },
      specific_actions: insight.recommendations || [],
      success_metrics: [
        "Insight-specific KPI improvement",
        "Target metric achievement",
        "Strategic objective alignment",
      ],
      risk_factors: insight.risk_factors || [],
      resource_requirements: [
        "Analytics team for monitoring",
        "Implementation team",
        "Stakeholder coordination",
      ],
      supporting_data: {
        predictions: [],
        insights: [insight],
      },
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  /**
   * Create high-impact insight recommendations
   */
  private createHighImpactRecommendation(
    insight: PredictiveInsight,
    _context?: RecommendationContext
  ): BusinessRecommendation | null {
    return {
      id: `insight_impact_${insight.id}`,
      title: `High-Impact Opportunity: ${insight.title}`,
      description: `${insight.description} This represents a high-impact opportunity with ${insight.impact_score}% potential impact.`,
      category: this.mapInsightToCategory(insight),
      priority: insight.impact_score > 80 ? "critical" : "high",
      urgency: "long_term",
      action_type: "implement",
      confidence_score: insight.confidence_score,
      potential_impact: {
        revenue_impact: this.estimateInsightRevenueImpact(insight),
        cost_impact: -this.estimateImplementationCost(insight.impact_score),
        risk_impact: insight.impact_score,
        timeline_days: 45,
      },
      specific_actions: insight.recommendations || [
        "Develop detailed implementation plan",
        "Allocate necessary resources",
        "Set up success metrics tracking",
        "Execute phased rollout",
      ],
      success_metrics: [
        "Impact score achievement",
        "ROI target achievement",
        "Strategic goal alignment",
      ],
      risk_factors: insight.risk_factors || [
        "Implementation complexity",
        "Resource availability",
        "Market timing",
      ],
      resource_requirements: [
        "Strategic planning team",
        "Implementation resources",
        "Monitoring and evaluation team",
      ],
      supporting_data: {
        predictions: [],
        insights: [insight],
      },
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  /**
   * Create risk mitigation recommendations
   */
  private createRiskMitigationRecommendation(
    insight: PredictiveInsight,
    _context?: RecommendationContext
  ): BusinessRecommendation | null {
    return {
      id: `risk_mitigation_${insight.id}`,
      title: `Risk Mitigation Required: ${insight.title}`,
      description: `${insight.description} Risk factors identified require proactive mitigation strategies.`,
      category: "risk_mitigation",
      priority: "medium",
      urgency: "immediate",
      action_type: "monitor",
      confidence_score: insight.confidence_score,
      potential_impact: {
        revenue_impact: 0,
        cost_impact: -this.estimateRiskMitigationCost(
          insight.risk_factors?.length || 1
        ),
        risk_impact: 70,
        timeline_days: 7,
      },
      specific_actions: [
        "Assess risk probability and impact",
        "Develop mitigation strategies",
        "Implement monitoring systems",
        "Create contingency plans",
        "Regular risk review processes",
      ],
      success_metrics: [
        "Risk exposure reduction",
        "Mitigation plan effectiveness",
        "Early warning system accuracy",
      ],
      risk_factors: insight.risk_factors || [],
      resource_requirements: [
        "Risk management team",
        "Monitoring systems",
        "Contingency resources",
      ],
      supporting_data: {
        predictions: [],
        insights: [insight],
      },
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  // Helper Methods
  private groupPredictionsByPattern(
    predictions: MLPrediction[]
  ): Map<string, MLPrediction[]> {
    const patterns = new Map<string, MLPrediction[]>();

    for (const pred of predictions) {
      let pattern: string;

      if (pred.metric.includes("revenue") && pred.trend === "decreasing") {
        pattern = "revenue_decline";
      } else if (
        pred.metric.includes("revenue") &&
        pred.trend === "increasing"
      ) {
        pattern = "revenue_growth";
      } else if (pred.metric.includes("cost") && pred.trend === "increasing") {
        pattern = "cost_increase";
      } else if (pred.trend === "increasing" && pred.confidence_score > 80) {
        pattern = "market_opportunity";
      } else if (Math.abs(pred.change_percentage) > 25) {
        pattern = "volatility_high";
      } else {
        pattern = "stable";
      }

      if (!patterns.has(pattern)) {
        patterns.set(pattern, []);
      }
      patterns.get(pattern)!.push(pred);
    }

    return patterns;
  }

  private applyBusinessContext(
    recommendations: BusinessRecommendation[],
    context?: RecommendationContext
  ): BusinessRecommendation[] {
    if (!context) return recommendations;

    return recommendations.map(rec => {
      // Adjust priority based on risk tolerance
      if (
        context.risk_tolerance === "conservative" &&
        rec.category === "market_opportunity"
      ) {
        rec.priority =
          rec.priority === "critical"
            ? "high"
            : rec.priority === "high"
              ? "medium"
              : "low";
      }

      // Adjust based on budget constraints
      if (
        context.budget_constraints &&
        context.budget_constraints.max_investment &&
        rec.potential_impact.cost_impact <
          -context.budget_constraints.max_investment
      ) {
        rec.priority = "low";
        rec.risk_factors.push("Budget constraints limit implementation");
      }

      return rec;
    });
  }

  private prioritizeRecommendations(
    recommendations: BusinessRecommendation[],
    context?: RecommendationContext
  ): BusinessRecommendation[] {
    return recommendations.sort((a, b) => {
      // Priority weight
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff =
        priorityWeight[b.priority] - priorityWeight[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Confidence weight
      const confidenceDiff = b.confidence_score - a.confidence_score;
      if (Math.abs(confidenceDiff) > 10) return confidenceDiff;

      // Impact weight
      const impactDiff =
        b.potential_impact.revenue_impact +
        Math.abs(b.potential_impact.cost_impact) -
        (a.potential_impact.revenue_impact +
          Math.abs(a.potential_impact.cost_impact));

      return impactDiff;
    });
  }

  private refineRecommendations(
    recommendations: BusinessRecommendation[]
  ): BusinessRecommendation[] {
    // Remove duplicates and limit to top recommendations
    const uniqueRecs = recommendations.filter(
      (rec, index, self) => index === self.findIndex(r => r.title === rec.title)
    );

    // Return top 10 recommendations
    return uniqueRecs.slice(0, 10);
  }

  // Utility Methods
  private estimateRevenueImpact(
    predictions: MLPrediction[],
    type: "prevention" | "amplification"
  ): number {
    const avgPrediction =
      predictions.reduce((sum, p) => sum + p.predicted_value, 0) /
      predictions.length;
    const avgChange =
      predictions.reduce((sum, p) => sum + Math.abs(p.change_percentage), 0) /
      predictions.length;

    // Simplified estimation - in production, use more sophisticated models
    return type === "prevention"
      ? avgPrediction * (avgChange / 100)
      : avgPrediction * (avgChange / 100) * 1.5;
  }

  private estimateScalingCosts(growthRate: number): number {
    // Estimate scaling costs as percentage of growth
    return Math.abs(growthRate) * 1000; // Simplified calculation
  }

  private estimateCostSavings(predictions: MLPrediction[]): number {
    const avgIncrease =
      predictions.reduce((sum, p) => sum + p.change_percentage, 0) /
      predictions.length;
    return avgIncrease * 500; // Simplified calculation
  }

  private estimateOpportunityValue(predictions: MLPrediction[]): number {
    const avgValue =
      predictions.reduce((sum, p) => sum + p.predicted_value, 0) /
      predictions.length;
    const avgGrowth =
      predictions.reduce((sum, p) => sum + p.change_percentage, 0) /
      predictions.length;
    return avgValue * (avgGrowth / 100) * 2; // Amplified opportunity value
  }

  private estimateOpportunityInvestment(growthRate: number): number {
    return growthRate * 800; // Investment required for opportunity
  }

  private estimateInsightRevenueImpact(insight: PredictiveInsight): number {
    return insight.impact_score * 1000; // Simplified revenue impact estimation
  }

  private estimateImplementationCost(impactScore: number): number {
    return impactScore * 200; // Implementation cost estimation
  }

  private estimateRiskMitigationCost(riskFactorCount: number): number {
    return riskFactorCount * 500; // Risk mitigation cost estimation
  }

  private mapInsightToCategory(
    insight: PredictiveInsight
  ): BusinessRecommendation["category"] {
    if (insight.title.toLowerCase().includes("revenue"))
      return "revenue_optimization";
    if (insight.title.toLowerCase().includes("cost")) return "cost_reduction";
    if (insight.title.toLowerCase().includes("opportunity"))
      return "market_opportunity";
    if (insight.title.toLowerCase().includes("risk")) return "risk_mitigation";
    return "operational_efficiency";
  }

  private mapTimeHorizonToUrgency(
    horizon: string
  ): BusinessRecommendation["urgency"] {
    switch (horizon) {
      case "1week":
        return "immediate";
      case "1month":
        return "short_term";
      case "3months":
        return "long_term";
      default:
        return "short_term";
    }
  }

  private mapTimeHorizonToDays(horizon: string): number {
    switch (horizon) {
      case "1week":
        return 7;
      case "1month":
        return 30;
      case "3months":
        return 90;
      default:
        return 30;
    }
  }

  private initializeBusinessRules(): void {
    // Initialize business rule engine - placeholder for advanced rules
    this.businessRules.set("revenue_optimization", data => []);
    this.businessRules.set("cost_reduction", data => []);
    this.businessRules.set("market_opportunity", data => []);
    this.businessRules.set("risk_mitigation", data => []);
  }

  private initializeImpactCalculators(): void {
    // Initialize impact calculation functions - placeholder for advanced calculations
    this.impactCalculators.set("revenue_impact", data => 0);
    this.impactCalculators.set("cost_impact", data => 0);
    this.impactCalculators.set("risk_impact", data => 0);
  }
}

// Export singleton instance
export const tacticalRecommendationEngine = new TacticalRecommendationEngine();
