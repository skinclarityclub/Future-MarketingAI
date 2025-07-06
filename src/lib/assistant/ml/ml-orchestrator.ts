/**
 * ML Orchestrator for AI Assistant
 * Coordinates multiple ML models to answer complex business intelligence queries
 */

import {
  mlModelRegistry,
  type StrategicInsight,
  type BusinessIntelligenceQuery,
} from "./model-registry";
import { getDataSources } from "@/lib/assistant/data-source-registry";

export interface MLQuery {
  type: "analysis" | "prediction" | "optimization" | "insights";
  domain: "customer" | "content" | "revenue" | "general";
  parameters: Record<string, any>;
  context?: string;
}

export interface MLResponse {
  success: boolean;
  insights: StrategicInsight[];
  data?: any;
  confidence: number;
  modelsUsed: string[];
  executionTime: number;
  recommendations?: string[];
}

export interface DataContext {
  customers?: any[];
  contentMetrics?: any[];
  financialData?: any[];
  historicalData?: any[];
}

export class MLOrchestrator {
  private static instance: MLOrchestrator;
  private registry = mlModelRegistry;

  private constructor() {}

  public static getInstance(): MLOrchestrator {
    if (!MLOrchestrator.instance) {
      MLOrchestrator.instance = new MLOrchestrator();
    }
    return MLOrchestrator.instance;
  }

  /**
   * Execute a complex ML query by orchestrating multiple models
   */
  async executeQuery(query: MLQuery): Promise<MLResponse> {
    const startTime = Date.now();
    const modelsUsed: string[] = [];
    const insights: StrategicInsight[] = [];
    let data: any = {};

    try {
      // Gather relevant data based on query domain
      const context = await this.gatherDataContext(query);

      // Execute appropriate ML workflows based on query type
      switch (query.type) {
        case "analysis":
          const analysisResults = await this.executeAnalysisWorkflow(
            query,
            context
          );
          insights.push(...analysisResults.insights);
          modelsUsed.push(...analysisResults.modelsUsed);
          data = { ...data, ...analysisResults.data };
          break;

        case "prediction":
          const predictionResults = await this.executePredictionWorkflow(
            query,
            context
          );
          insights.push(...predictionResults.insights);
          modelsUsed.push(...predictionResults.modelsUsed);
          data = { ...data, ...predictionResults.data };
          break;

        case "optimization":
          const optimizationResults = await this.executeOptimizationWorkflow(
            query,
            context
          );
          insights.push(...optimizationResults.insights);
          modelsUsed.push(...optimizationResults.modelsUsed);
          data = { ...data, ...optimizationResults.data };
          break;

        case "insights":
          const insightsResults = await this.executeInsightsWorkflow(
            query,
            context
          );
          insights.push(...insightsResults.insights);
          modelsUsed.push(...insightsResults.modelsUsed);
          data = { ...data, ...insightsResults.data };
          break;
      }

      // Generate cross-model insights
      const crossModelInsights = await this.generateCrossModelInsights(
        insights,
        context
      );
      insights.push(...crossModelInsights);

      // Calculate overall confidence
      const confidence = this.calculateOverallConfidence(insights);

      // Generate actionable recommendations
      const recommendations = this.generateRecommendations(insights, query);

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        insights,
        data,
        confidence,
        modelsUsed: [...new Set(modelsUsed)], // Remove duplicates
        executionTime,
        recommendations,
      };
    } catch (error) {
      return {
        success: false,
        insights: [],
        confidence: 0,
        modelsUsed,
        executionTime: Date.now() - startTime,
        recommendations: [
          `Error executing query: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
      };
    }
  }

  /**
   * Gather relevant data based on query domain and type
   */
  private async gatherDataContext(query: MLQuery): Promise<DataContext> {
    const context: DataContext = {};

    try {
      // Gather customer data if needed
      if (query.domain === "customer" || query.domain === "general") {
        context.customers = await this.fetchCustomerData();
      }

      // Gather content metrics if needed
      if (query.domain === "content" || query.domain === "general") {
        context.contentMetrics = await this.fetchContentMetrics();
      }

      // Gather financial data if needed
      if (query.domain === "revenue" || query.domain === "general") {
        context.financialData = await this.fetchFinancialData();
      }

      // Gather historical data for trend analysis
      if (query.type === "prediction" || query.type === "analysis") {
        context.historicalData = await this.fetchHistoricalData(query.domain);
      }
    } catch (error) {
      console.warn("Error gathering data context:", error);
    }

    return context;
  }

  /**
   * Execute analysis workflow
   */
  private async executeAnalysisWorkflow(
    query: MLQuery,
    context: DataContext
  ): Promise<{
    insights: StrategicInsight[];
    modelsUsed: string[];
    data: any;
  }> {
    const insights: StrategicInsight[] = [];
    const modelsUsed: string[] = [];
    const data: any = {};

    // ROI Analysis
    if (context.contentMetrics && context.contentMetrics.length > 0) {
      const roiResult = await this.registry.analyzeROI(
        context.contentMetrics,
        context.historicalData
      );
      if (roiResult.success) {
        modelsUsed.push(roiResult.modelUsed);
        data.roiAnalysis = roiResult.data;
        insights.push(...this.convertROIToInsights(roiResult.data));
      }
    }

    return { insights, modelsUsed, data };
  }

  /**
   * Execute prediction workflow
   */
  private async executePredictionWorkflow(
    query: MLQuery,
    context: DataContext
  ): Promise<{
    insights: StrategicInsight[];
    modelsUsed: string[];
    data: any;
  }> {
    const insights: StrategicInsight[] = [];
    const modelsUsed: string[] = [];
    const data: any = {};

    // Revenue predictions using optimization engine
    if (context.contentMetrics && context.historicalData) {
      const optimizationResult = await this.registry.generateOptimizations(
        context.contentMetrics,
        [],
        context.historicalData
      );

      if (optimizationResult.success) {
        modelsUsed.push(optimizationResult.modelUsed);
        data.predictions = optimizationResult.data.predictions;

        insights.push({
          type: "trend",
          title: "Revenue Prediction",
          description: `Revenue trends analyzed with predictive insights`,
          impact: "medium",
          urgency: "short-term",
          confidence: 0.75,
          dataSource: ["optimization_engine"],
          actionable: true,
          metrics: optimizationResult.data.predictions || {},
        });
      }
    }

    return { insights, modelsUsed, data };
  }

  /**
   * Execute optimization workflow
   */
  private async executeOptimizationWorkflow(
    query: MLQuery,
    context: DataContext
  ): Promise<{
    insights: StrategicInsight[];
    modelsUsed: string[];
    data: any;
  }> {
    const insights: StrategicInsight[] = [];
    const modelsUsed: string[] = [];
    const data: any = {};

    if (context.contentMetrics) {
      const roiResult = await this.registry.analyzeROI(context.contentMetrics);

      if (roiResult.success) {
        const optimizationResult = await this.registry.generateOptimizations(
          context.contentMetrics,
          roiResult.data.roiResults,
          context.historicalData
        );

        if (optimizationResult.success) {
          modelsUsed.push(roiResult.modelUsed, optimizationResult.modelUsed);
          data.optimizations = optimizationResult.data;
          insights.push(
            ...this.convertOptimizationsToInsights(optimizationResult.data)
          );
        }
      }
    }

    return { insights, modelsUsed, data };
  }

  /**
   * Execute comprehensive insights workflow
   */
  private async executeInsightsWorkflow(
    query: MLQuery,
    context: DataContext
  ): Promise<{
    insights: StrategicInsight[];
    modelsUsed: string[];
    data: any;
  }> {
    const analysisResults = await this.executeAnalysisWorkflow(query, context);
    const predictionResults = await this.executePredictionWorkflow(
      query,
      context
    );
    const optimizationResults = await this.executeOptimizationWorkflow(
      query,
      context
    );

    return {
      insights: [
        ...analysisResults.insights,
        ...predictionResults.insights,
        ...optimizationResults.insights,
      ],
      modelsUsed: [
        ...analysisResults.modelsUsed,
        ...predictionResults.modelsUsed,
        ...optimizationResults.modelsUsed,
      ],
      data: {
        ...analysisResults.data,
        ...predictionResults.data,
        ...optimizationResults.data,
      },
    };
  }

  /**
   * Generate cross-model insights
   */
  private async generateCrossModelInsights(
    insights: StrategicInsight[],
    context: DataContext
  ): Promise<StrategicInsight[]> {
    const crossInsights: StrategicInsight[] = [];

    const risks = insights.filter(i => i.type === "risk");
    const opportunities = insights.filter(i => i.type === "opportunity");

    if (risks.length > 0 && opportunities.length > 0) {
      crossInsights.push({
        type: "recommendation",
        title: "Strategic Balance",
        description: `Balance ${risks.length} risks with ${opportunities.length} opportunities`,
        impact: "high",
        urgency: "short-term",
        confidence: 0.8,
        dataSource: ["cross_model_analysis"],
        actionable: true,
        metrics: {
          risks_identified: risks.length,
          opportunities_available: opportunities.length,
        },
      });
    }

    return crossInsights;
  }

  /**
   * Helper methods for data fetching
   */
  private async fetchCustomerData(): Promise<any[]> {
    return [
      { id: "customer-1", name: "Sample Customer", total_lifetime_value: 1500 },
    ];
  }

  private async fetchContentMetrics(): Promise<any[]> {
    return [
      {
        content_id: "content-1",
        title: "Sample Content",
        type: "course",
        platform: "kajabi",
        revenue: 5000,
        views: 1000,
        clicks: 100,
        conversions: 10,
        engagement_time: 15,
        bounce_rate: 0.3,
        production_cost: 1000,
        marketing_spend: 500,
        operational_cost: 200,
        sales_count: 10,
        average_order_value: 500,
        created_date: "2024-01-01",
        period_start: "2024-01-01",
        period_end: "2024-12-31",
      },
    ];
  }

  private async fetchFinancialData(): Promise<any[]> {
    return [];
  }

  private async fetchHistoricalData(domain: string): Promise<any[]> {
    return [];
  }

  /**
   * Helper methods for converting model outputs to insights
   */
  private convertROIToInsights(roiData: any): StrategicInsight[] {
    const insights: StrategicInsight[] = [];

    if (roiData.summary) {
      const { topPerformers, underperformers, averageROI } = roiData.summary;

      if (topPerformers > 0) {
        insights.push({
          type: "opportunity",
          title: "High-Performing Content",
          description: `${topPerformers} content pieces performing above average`,
          impact: "medium",
          urgency: "short-term",
          confidence: 0.78,
          dataSource: ["roi_analysis"],
          actionable: true,
          metrics: { top_performers: topPerformers, average_roi: averageROI },
        });
      }
    }

    return insights;
  }

  private convertOptimizationsToInsights(
    optimizationData: any
  ): StrategicInsight[] {
    const insights: StrategicInsight[] = [];

    if (optimizationData.top_opportunities) {
      optimizationData.top_opportunities.slice(0, 3).forEach((opp: any) => {
        insights.push({
          type: "opportunity",
          title: opp.title || "Optimization Opportunity",
          description: opp.description || "Strategic optimization identified",
          impact: opp.impact_score > 70 ? "high" : "medium",
          urgency: opp.timeframe === "immediate" ? "immediate" : "short-term",
          confidence: 0.82,
          dataSource: ["optimization_engine"],
          actionable: true,
          metrics: { impact_score: opp.impact_score },
        });
      });
    }

    return insights;
  }

  private calculateOverallConfidence(insights: StrategicInsight[]): number {
    if (insights.length === 0) return 0;
    const totalConfidence = insights.reduce(
      (sum, insight) => sum + insight.confidence,
      0
    );
    return totalConfidence / insights.length;
  }

  private generateRecommendations(
    insights: StrategicInsight[],
    query: MLQuery
  ): string[] {
    const recommendations: string[] = [];

    const highImpactInsights = insights.filter(i => i.impact === "high");
    const immediateInsights = insights.filter(i => i.urgency === "immediate");

    if (immediateInsights.length > 0) {
      recommendations.push(
        `Address ${immediateInsights.length} immediate priority items`
      );
    }

    if (highImpactInsights.length > 0) {
      recommendations.push(
        `Focus on ${highImpactInsights.length} high-impact opportunities`
      );
    }

    switch (query.domain) {
      case "customer":
        recommendations.push("Implement customer retention strategies");
        break;
      case "content":
        recommendations.push(
          "Optimize content performance based on ROI analysis"
        );
        break;
      case "revenue":
        recommendations.push("Focus on revenue optimization opportunities");
        break;
    }

    return recommendations;
  }
}

export const mlOrchestrator = MLOrchestrator.getInstance();
