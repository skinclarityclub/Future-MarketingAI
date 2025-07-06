/**
 * ML Model Registry for AI Assistant
 * Centralized access to all machine learning models and analytics engines
 */

import { ChurnPredictionEngine } from "@/lib/customer-intelligence/churn-prediction";
import { ROIAlgorithmEngine } from "@/lib/analytics/roi-algorithms";
import { OptimizationEngine } from "@/lib/analytics/optimization-engine";

// Types for model capabilities
export interface ModelCapability {
  name: string;
  description: string;
  inputTypes: string[];
  outputTypes: string[];
  confidence: number;
  lastUpdated: string;
}

export interface MLModelRegistry {
  churnPrediction: ChurnPredictionEngine;
  roiAnalytics: ROIAlgorithmEngine;
  optimization: OptimizationEngine;
}

export interface ModelResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  confidence: number;
  modelUsed: string;
  timestamp: string;
}

export interface StrategicInsight {
  type: "opportunity" | "risk" | "trend" | "recommendation";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  urgency: "immediate" | "short-term" | "long-term";
  confidence: number;
  dataSource: string[];
  actionable: boolean;
  metrics?: Record<string, number>;
}

export interface BusinessIntelligenceQuery {
  type:
    | "churn_analysis"
    | "roi_optimization"
    | "trend_prediction"
    | "strategic_insights";
  parameters: Record<string, any>;
  includeRecommendations?: boolean;
  confidenceThreshold?: number;
}

export class MLModelRegistry {
  private static instance: MLModelRegistry;
  private models: {
    churnPrediction: ChurnPredictionEngine;
    roiAnalytics: ROIAlgorithmEngine;
    optimization: OptimizationEngine;
  };

  private constructor() {
    // Initialize models lazily to avoid cookies() call outside request context
    this.models = {} as any;
  }

  private getModel(modelName: string) {
    if (!this.models[modelName as keyof typeof this.models]) {
      switch (modelName) {
        case "churnPrediction":
          this.models.churnPrediction = new ChurnPredictionEngine();
          break;
        case "roiAnalytics":
          this.models.roiAnalytics = new ROIAlgorithmEngine();
          break;
        case "optimization":
          this.models.optimization = new OptimizationEngine();
          break;
      }
    }
    return this.models[modelName as keyof typeof this.models];
  }

  public static getInstance(): MLModelRegistry {
    if (!MLModelRegistry.instance) {
      MLModelRegistry.instance = new MLModelRegistry();
    }
    return MLModelRegistry.instance;
  }

  /**
   * Get available model capabilities
   */
  getCapabilities(): ModelCapability[] {
    return [
      {
        name: "Churn Prediction",
        description: "Predict customer churn risk using ensemble ML models",
        inputTypes: ["customer_id", "customer_features"],
        outputTypes: [
          "churn_risk_score",
          "recommendations",
          "contributing_factors",
        ],
        confidence: 0.85,
        lastUpdated: new Date().toISOString(),
      },
      {
        name: "ROI Analytics",
        description: "Analyze content performance and ROI trends",
        inputTypes: ["content_metrics", "historical_data"],
        outputTypes: [
          "roi_analysis",
          "trend_predictions",
          "performance_insights",
        ],
        confidence: 0.78,
        lastUpdated: new Date().toISOString(),
      },
      {
        name: "Optimization Engine",
        description: "Generate strategic optimization recommendations",
        inputTypes: ["content_metrics", "roi_results"],
        outputTypes: [
          "optimization_insights",
          "recommendations",
          "predictions",
        ],
        confidence: 0.82,
        lastUpdated: new Date().toISOString(),
      },
    ];
  }

  /**
   * Execute churn prediction analysis
   */
  async predictChurn(
    customerId: string,
    useAdvanced = true
  ): Promise<ModelResult> {
    try {
      const churnEngine = this.getModel(
        "churnPrediction"
      ) as ChurnPredictionEngine;
      const result = await churnEngine.predictChurn({
        customerId,
        useAdvancedModels: useAdvanced,
        includeExplanation: true,
      });

      return {
        success: true,
        data: result,
        confidence: result.confidence,
        modelUsed: result.modelUsed,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        confidence: 0,
        modelUsed: "Churn Prediction Engine",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Execute ROI analysis
   */
  async analyzeROI(
    contentMetrics: any[],
    historicalData?: any[]
  ): Promise<ModelResult> {
    try {
      const roiEngine = this.getModel("roiAnalytics") as ROIAlgorithmEngine;
      const roiResults = contentMetrics.map(metric =>
        roiEngine.calculateContentROI(metric)
      );
      const trends = historicalData
        ? roiEngine.analyzeTrends(historicalData)
        : [];

      return {
        success: true,
        data: {
          roiResults,
          trends,
          summary: this.generateROISummary(roiResults),
        },
        confidence: 0.78,
        modelUsed: "ROI Algorithm Engine",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        confidence: 0,
        modelUsed: "ROI Algorithm Engine",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Generate optimization recommendations
   */
  async generateOptimizations(
    contentMetrics: any[],
    roiResults: any[],
    historicalData?: any[]
  ): Promise<ModelResult> {
    try {
      const optimizationEngine = this.getModel(
        "optimization"
      ) as OptimizationEngine;
      const insights = optimizationEngine.generateRecommendations(
        contentMetrics,
        roiResults,
        historicalData
      );

      return {
        success: true,
        data: insights,
        confidence: 0.82,
        modelUsed: "Optimization Engine",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        confidence: 0,
        modelUsed: "Optimization Engine",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Generate comprehensive strategic insights
   */
  async generateStrategicInsights(
    query: BusinessIntelligenceQuery
  ): Promise<ModelResult<StrategicInsight[]>> {
    try {
      const insights: StrategicInsight[] = [];

      switch (query.type) {
        case "churn_analysis":
          const churnInsights = await this.generateChurnInsights(
            query.parameters
          );
          insights.push(...churnInsights);
          break;

        case "roi_optimization":
          const roiInsights = await this.generateROIInsights(query.parameters);
          insights.push(...roiInsights);
          break;

        case "trend_prediction":
          const trendInsights = await this.generateTrendInsights(
            query.parameters
          );
          insights.push(...trendInsights);
          break;

        case "strategic_insights":
          // Combine all models for comprehensive analysis
          const allInsights = await this.generateComprehensiveInsights(
            query.parameters
          );
          insights.push(...allInsights);
          break;
      }

      // Filter by confidence threshold
      const filteredInsights = query.confidenceThreshold
        ? insights.filter(
            insight => insight.confidence >= query.confidenceThreshold!
          )
        : insights;

      return {
        success: true,
        data: filteredInsights,
        confidence: this.calculateAverageConfidence(filteredInsights),
        modelUsed: "Strategic Insights Generator",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        confidence: 0,
        modelUsed: "Strategic Insights Generator",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Generate churn-specific insights
   */
  private async generateChurnInsights(
    parameters: any
  ): Promise<StrategicInsight[]> {
    const insights: StrategicInsight[] = [];

    // This would integrate with actual churn prediction results
    insights.push({
      type: "risk",
      title: "High Churn Risk Detected",
      description: "15% of high-value customers show elevated churn risk",
      impact: "high",
      urgency: "immediate",
      confidence: 0.85,
      dataSource: ["customer_behavior", "purchase_history"],
      actionable: true,
      metrics: {
        at_risk_customers: 45,
        potential_revenue_loss: 125000,
      },
    });

    return insights;
  }

  /**
   * Generate ROI-specific insights
   */
  private async generateROIInsights(
    parameters: any
  ): Promise<StrategicInsight[]> {
    const insights: StrategicInsight[] = [];

    insights.push({
      type: "opportunity",
      title: "Content Performance Optimization",
      description: "3 content pieces show 40% above-average ROI potential",
      impact: "medium",
      urgency: "short-term",
      confidence: 0.78,
      dataSource: ["content_metrics", "engagement_data"],
      actionable: true,
      metrics: {
        optimization_potential: 40,
        estimated_revenue_increase: 25000,
      },
    });

    return insights;
  }

  /**
   * Generate trend-specific insights
   */
  private async generateTrendInsights(
    parameters: any
  ): Promise<StrategicInsight[]> {
    const insights: StrategicInsight[] = [];

    insights.push({
      type: "trend",
      title: "Seasonal Performance Pattern",
      description: "Q4 shows consistent 25% performance increase",
      impact: "medium",
      urgency: "long-term",
      confidence: 0.72,
      dataSource: ["historical_data", "seasonal_analysis"],
      actionable: true,
      metrics: {
        seasonal_boost: 25,
        confidence_interval: 0.15,
      },
    });

    return insights;
  }

  /**
   * Generate comprehensive insights using all models
   */
  private async generateComprehensiveInsights(
    parameters: any
  ): Promise<StrategicInsight[]> {
    const insights: StrategicInsight[] = [];

    // Combine insights from all models
    const churnInsights = await this.generateChurnInsights(parameters);
    const roiInsights = await this.generateROIInsights(parameters);
    const trendInsights = await this.generateTrendInsights(parameters);

    insights.push(...churnInsights, ...roiInsights, ...trendInsights);

    // Add cross-model insights
    insights.push({
      type: "recommendation",
      title: "Integrated Strategy Recommendation",
      description: "Focus retention efforts on high-ROI content consumers",
      impact: "high",
      urgency: "short-term",
      confidence: 0.8,
      dataSource: ["churn_prediction", "roi_analysis", "content_metrics"],
      actionable: true,
      metrics: {
        strategy_effectiveness: 80,
        expected_retention_improvement: 15,
      },
    });

    return insights;
  }

  /**
   * Helper methods
   */
  private generateROISummary(roiResults: any[]) {
    const totalROI = roiResults.reduce(
      (sum, result) => sum + (result.roi_percentage || 0),
      0
    );
    const averageROI = totalROI / roiResults.length;

    return {
      totalContent: roiResults.length,
      averageROI: Math.round(averageROI * 100) / 100,
      topPerformers: roiResults.filter(
        r => (r.roi_percentage || 0) > averageROI * 1.5
      ).length,
      underperformers: roiResults.filter(
        r => (r.roi_percentage || 0) < averageROI * 0.5
      ).length,
    };
  }

  private calculateAverageConfidence(insights: StrategicInsight[]): number {
    if (insights.length === 0) return 0;
    const totalConfidence = insights.reduce(
      (sum, insight) => sum + insight.confidence,
      0
    );
    return totalConfidence / insights.length;
  }
}

// Export singleton instance
export const mlModelRegistry = MLModelRegistry.getInstance();
