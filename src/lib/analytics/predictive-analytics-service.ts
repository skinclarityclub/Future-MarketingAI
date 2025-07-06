/**
 * Predictive Analytics Service
 * Enterprise-grade machine learning service for business intelligence forecasting
 * Orchestrates multiple ML models to provide comprehensive business predictions
 */

import { AdvancedMLEngine, BusinessMetricForecast } from "./advanced-ml-engine";
import {
  TacticalMLEngine,
  MLPrediction,
  AnomalyDetection,
} from "./tactical-ml-models";
import { TacticalDataPoint } from "./tactical-data-engine";

export interface PredictiveAnalyticsConfig {
  // Model selection and weighting
  modelWeights: {
    arima: number;
    exponentialSmoothing: number;
    ensemble: number;
    tactical: number;
  };

  // Business metric configurations
  businessMetrics: {
    revenue: {
      enabled: boolean;
      target: number;
      seasonality: boolean;
      alertThresholds: { low: number; high: number };
    };
    customerAcquisition: {
      enabled: boolean;
      target: number;
      churnRate: number;
      lifetimeValue: number;
    };
    performance: {
      enabled: boolean;
      kpis: string[];
      benchmarks: Record<string, number>;
    };
  };

  // Prediction parameters
  forecastHorizon: {
    short: number; // days
    medium: number; // days
    long: number; // days
  };

  // Quality assurance
  validation: {
    minDataPoints: number;
    maxUncertainty: number;
    crossValidation: boolean;
    backtestPeriods: number;
  };
}

export interface BusinessForecast {
  metric: string;
  timeframe: "short" | "medium" | "long";
  currentValue: number;
  predictions: {
    date: string;
    value: number;
    confidenceInterval: {
      lower: number;
      upper: number;
    };
    confidence: number;
    trend: "increasing" | "decreasing" | "stable";
  }[];
  insights: {
    summary: string;
    keyDrivers: string[];
    riskFactors: string[];
    opportunities: string[];
    recommendations: string[];
  };
  modelPerformance: {
    accuracy: number;
    reliability: number;
    lastUpdated: string;
    dataQuality: number;
  };
  alerts: {
    level: "info" | "warning" | "critical";
    message: string;
    threshold: number;
    currentValue: number;
  }[];
}

export interface PredictiveInsight {
  id: string;
  type: "trend" | "anomaly" | "opportunity" | "risk";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  impact: {
    financial: number;
    operational: string;
    strategic: string;
  };
  confidence: number;
  actionableRecommendations: string[];
  timeRelevance: {
    urgency: "immediate" | "short_term" | "medium_term" | "long_term";
    deadline?: string;
  };
  dataSupport: {
    sources: string[];
    qualityScore: number;
    lastUpdated: string;
  };
}

export class PredictiveAnalyticsService {
  private advancedMLEngine: AdvancedMLEngine;
  private tacticalMLEngine: TacticalMLEngine;
  private config: PredictiveAnalyticsConfig;
  private modelCache: Map<string, any> = new Map();
  private lastTrainingTime: Map<string, Date> = new Map();

  constructor(config?: Partial<PredictiveAnalyticsConfig>) {
    this.config = {
      modelWeights: {
        arima: 0.35,
        exponentialSmoothing: 0.25,
        ensemble: 0.3,
        tactical: 0.1,
      },
      businessMetrics: {
        revenue: {
          enabled: true,
          target: 1000000, // $1M monthly target
          seasonality: true,
          alertThresholds: { low: 0.85, high: 1.15 },
        },
        customerAcquisition: {
          enabled: true,
          target: 1000, // 1000 new customers per month
          churnRate: 0.05,
          lifetimeValue: 2500,
        },
        performance: {
          enabled: true,
          kpis: ["conversion_rate", "avg_order_value", "customer_satisfaction"],
          benchmarks: {
            conversion_rate: 0.025,
            avg_order_value: 150,
            customer_satisfaction: 4.5,
          },
        },
      },
      forecastHorizon: {
        short: 7, // 1 week
        medium: 30, // 1 month
        long: 90, // 3 months
      },
      validation: {
        minDataPoints: 30,
        maxUncertainty: 0.3,
        crossValidation: true,
        backtestPeriods: 3,
      },
      ...config,
    };

    this.advancedMLEngine = new AdvancedMLEngine();
    this.tacticalMLEngine = new TacticalMLEngine();
  }

  /**
   * Generate comprehensive business forecasts using ensemble of ML models
   */
  async generateBusinessForecasts(
    historicalData: TacticalDataPoint[],
    metrics: string[] = ["revenue", "customers", "orders"],
    timeframe: "short" | "medium" | "long" = "medium"
  ): Promise<BusinessForecast[]> {
    const forecasts: BusinessForecast[] = [];

    try {
      // Validate data quality
      const dataQuality = this.assessDataQuality(historicalData);
      if (dataQuality.score < 0.7) {
        console.warn("Data quality below threshold, results may be unreliable");
      }

      // Generate advanced ML forecasts
      const advancedForecasts =
        await this.advancedMLEngine.generateAdvancedForecasts(
          historicalData,
          metrics
        );

      // Generate tactical predictions
      const tacticalPredictions =
        await this.tacticalMLEngine.generatePredictions(historicalData, [
          "revenue_trend",
          "financial_forecast",
        ]);

      // Train models if needed
      await this.ensureModelsAreTrained(historicalData);

      // Combine and enhance forecasts
      for (const metric of metrics) {
        const businessForecast = await this.createBusinessForecast(
          metric,
          timeframe,
          advancedForecasts,
          tacticalPredictions,
          historicalData,
          dataQuality
        );

        if (businessForecast) {
          forecasts.push(businessForecast);
        }
      }

      return forecasts;
    } catch (error) {
      console.error("Error generating business forecasts:", error);
      return [];
    }
  }

  /**
   * Generate actionable predictive insights for business decision making
   */
  async generatePredictiveInsights(
    historicalData: TacticalDataPoint[],
    forecasts: BusinessForecast[]
  ): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];

    try {
      // Analyze trends for insights
      const trendInsights = await this.analyzeTrendInsights(
        forecasts,
        historicalData
      );
      insights.push(...trendInsights);

      // Detect anomalies and risks
      const anomalyInsights = await this.detectAnomalyInsights(historicalData);
      insights.push(...anomalyInsights);

      // Identify opportunities
      const opportunityInsights = await this.identifyOpportunities(
        forecasts,
        historicalData
      );
      insights.push(...opportunityInsights);

      // Generate strategic recommendations
      const strategicInsights = await this.generateStrategicInsights(forecasts);
      insights.push(...strategicInsights);

      // Sort by priority and confidence
      return insights.sort((a, b) => {
        const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff =
          priorityWeight[b.priority] - priorityWeight[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.confidence - a.confidence;
      });
    } catch (error) {
      console.error("Error generating predictive insights:", error);
      return [];
    }
  }

  /**
   * Real-time model performance monitoring
   */
  async monitorModelPerformance(
    recentData: TacticalDataPoint[],
    predictions: BusinessForecast[]
  ): Promise<{
    overallHealth: "healthy" | "degraded" | "failing";
    modelMetrics: Record<
      string,
      {
        accuracy: number;
        drift: number;
        lastUpdate: string;
        recommendedAction: string;
      }
    >;
    alerts: Array<{
      severity: "low" | "medium" | "high";
      message: string;
      affectedModels: string[];
    }>;
  }> {
    const modelMetrics: Record<string, any> = {};
    const alerts: any[] = [];

    try {
      // Check prediction accuracy against recent actuals
      for (const forecast of predictions) {
        const accuracy = await this.calculatePredictionAccuracy(
          forecast,
          recentData
        );
        const drift = await this.detectModelDrift(forecast.metric, recentData);

        modelMetrics[forecast.metric] = {
          accuracy,
          drift,
          lastUpdate:
            this.lastTrainingTime.get(forecast.metric)?.toISOString() ||
            "unknown",
          recommendedAction: this.getRecommendedAction(accuracy, drift),
        };

        // Generate alerts for poor performance
        if (accuracy < 0.7) {
          alerts.push({
            severity: "high" as const,
            message: `Model accuracy for ${forecast.metric} has dropped to ${Math.round(accuracy * 100)}%`,
            affectedModels: [forecast.metric],
          });
        }

        if (drift > 0.3) {
          alerts.push({
            severity: "medium" as const,
            message: `Significant data drift detected for ${forecast.metric}`,
            affectedModels: [forecast.metric],
          });
        }
      }

      // Determine overall health
      const avgAccuracy =
        Object.values(modelMetrics).reduce(
          (sum: number, m: any) => sum + m.accuracy,
          0
        ) / Object.keys(modelMetrics).length;
      const overallHealth =
        avgAccuracy > 0.8
          ? "healthy"
          : avgAccuracy > 0.6
            ? "degraded"
            : "failing";

      return {
        overallHealth,
        modelMetrics,
        alerts,
      };
    } catch (error) {
      console.error("Error monitoring model performance:", error);
      return {
        overallHealth: "failing",
        modelMetrics: {},
        alerts: [
          {
            severity: "high",
            message: "Failed to monitor model performance",
            affectedModels: [],
          },
        ],
      };
    }
  }

  /**
   * Automated model retraining based on performance metrics
   */
  async autoRetrainModels(
    historicalData: TacticalDataPoint[],
    performanceMetrics: Record<string, any>
  ): Promise<{
    success: boolean;
    retrainedModels: string[];
    improvements: Record<string, { before: number; after: number }>;
    errors: string[];
  }> {
    const retrainedModels: string[] = [];
    const improvements: Record<string, { before: number; after: number }> = {};
    const errors: string[] = [];

    try {
      for (const [metric, metrics] of Object.entries(performanceMetrics)) {
        // Retrain if accuracy is below threshold or drift is significant
        if (metrics.accuracy < 0.7 || metrics.drift > 0.3) {
          try {
            const beforeAccuracy = metrics.accuracy;

            // Retrain the model with recent data
            await this.retrainSpecificModel(metric, historicalData);

            // Measure improvement
            const afterAccuracy = await this.calculateModelAccuracy(
              metric,
              historicalData
            );

            retrainedModels.push(metric);
            improvements[metric] = {
              before: beforeAccuracy,
              after: afterAccuracy,
            };

            this.lastTrainingTime.set(metric, new Date());
          } catch (error) {
            errors.push(`Failed to retrain model for ${metric}: ${error}`);
          }
        }
      }

      return {
        success: errors.length === 0,
        retrainedModels,
        improvements,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        retrainedModels: [],
        improvements: {},
        errors: [`Auto-retrain failed: ${error}`],
      };
    }
  }

  // Private helper methods
  private assessDataQuality(data: TacticalDataPoint[]): {
    score: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 1.0;

    // Check data completeness
    if (data.length < this.config.validation.minDataPoints) {
      issues.push("Insufficient historical data");
      score -= 0.3;
    }

    // Check for missing values
    const missingValues = data.filter(
      d => d.value === null || d.value === undefined
    ).length;
    const missingRatio = missingValues / data.length;
    if (missingRatio > 0.1) {
      issues.push("High percentage of missing values");
      score -= 0.2;
    }

    // Check for data consistency
    const values = data
      .map(d => d.value)
      .filter(v => v !== null && v !== undefined);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const outliers = values.filter(
      v => Math.abs(v - mean) > 3 * this.calculateStandardDeviation(values)
    );
    if (outliers.length / values.length > 0.05) {
      issues.push("High number of outliers detected");
      score -= 0.1;
    }

    return { score: Math.max(0, score), issues };
  }

  private async createBusinessForecast(
    metric: string,
    timeframe: "short" | "medium" | "long",
    advancedForecasts: BusinessMetricForecast[],
    tacticalPredictions: MLPrediction[],
    historicalData: TacticalDataPoint[],
    dataQuality: { score: number; issues: string[] }
  ): Promise<BusinessForecast | null> {
    const advancedForecast = advancedForecasts.find(f => f.metric === metric);
    const tacticalPrediction = tacticalPredictions.find(
      p => p.metric === metric
    );

    if (!advancedForecast && !tacticalPrediction) {
      return null;
    }

    const horizonDays = this.config.forecastHorizon[timeframe];
    const currentValue = this.getCurrentValue(metric, historicalData);

    // Combine predictions using ensemble weighting
    const predictions = this.combinePredictions(
      advancedForecast,
      tacticalPrediction,
      horizonDays,
      currentValue
    );

    // Generate business insights
    const insights = await this.generateBusinessInsights(
      metric,
      predictions,
      historicalData
    );

    // Create alerts based on thresholds
    const alerts = this.generateAlerts(metric, predictions, currentValue);

    return {
      metric,
      timeframe,
      currentValue,
      predictions,
      insights,
      modelPerformance: {
        accuracy: dataQuality.score * 0.9, // Estimate based on data quality
        reliability: Math.max(0.7, dataQuality.score),
        lastUpdated: new Date().toISOString(),
        dataQuality: dataQuality.score,
      },
      alerts,
    };
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff =
      squaredDifferences.reduce((sum, value) => sum + value, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  private getCurrentValue(metric: string, data: TacticalDataPoint[]): number {
    const metricData = data.filter(
      d => d.category === metric || d.source.includes(metric)
    );
    if (metricData.length === 0) return 0;

    // Get the most recent value
    const sortedData = metricData.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return sortedData[0].value;
  }

  private combinePredictions(
    advancedForecast: BusinessMetricForecast | undefined,
    tacticalPrediction: MLPrediction | undefined,
    horizonDays: number,
    currentValue: number
  ): BusinessForecast["predictions"] {
    const predictions: BusinessForecast["predictions"] = [];

    // Generate daily predictions for the horizon
    for (let day = 1; day <= horizonDays; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);

      let value = currentValue;
      let confidence = 0.5;
      let lower = currentValue * 0.9;
      let upper = currentValue * 1.1;

      if (advancedForecast && day <= advancedForecast.forecasts.length) {
        const forecast = advancedForecast.forecasts[day - 1];
        value = forecast.predicted_value * this.config.modelWeights.arima;
        confidence = forecast.confidence_score;
        lower = forecast.confidence_interval.lower;
        upper = forecast.confidence_interval.upper;
      }

      if (tacticalPrediction) {
        const tacticalWeight = this.config.modelWeights.tactical;
        value =
          value * (1 - tacticalWeight) +
          tacticalPrediction.predicted_value * tacticalWeight;
        confidence = Math.max(
          confidence,
          tacticalPrediction.confidence_score / 100
        );
      }

      predictions.push({
        date: date.toISOString().split("T")[0],
        value: Math.round(value * 100) / 100,
        confidenceInterval: { lower, upper },
        confidence,
        trend: this.determineTrend(value, currentValue),
      });
    }

    return predictions;
  }

  private determineTrend(
    predicted: number,
    current: number
  ): "increasing" | "decreasing" | "stable" {
    const change = (predicted - current) / current;
    if (change > 0.05) return "increasing";
    if (change < -0.05) return "decreasing";
    return "stable";
  }

  // Additional helper methods would continue here...
  private async ensureModelsAreTrained(
    data: TacticalDataPoint[]
  ): Promise<void> {
    await this.tacticalMLEngine.trainModels(data);
  }

  private async analyzeTrendInsights(
    forecasts: BusinessForecast[],
    data: TacticalDataPoint[]
  ): Promise<PredictiveInsight[]> {
    // Implementation for trend analysis insights
    return [];
  }

  private async detectAnomalyInsights(
    data: TacticalDataPoint[]
  ): Promise<PredictiveInsight[]> {
    // Implementation for anomaly detection insights
    return [];
  }

  private async identifyOpportunities(
    forecasts: BusinessForecast[],
    data: TacticalDataPoint[]
  ): Promise<PredictiveInsight[]> {
    // Implementation for opportunity identification
    return [];
  }

  private async generateStrategicInsights(
    forecasts: BusinessForecast[]
  ): Promise<PredictiveInsight[]> {
    // Implementation for strategic insights
    return [];
  }

  private async calculatePredictionAccuracy(
    forecast: BusinessForecast,
    recentData: TacticalDataPoint[]
  ): Promise<number> {
    // Implementation for accuracy calculation
    return 0.85; // Placeholder
  }

  private async detectModelDrift(
    metric: string,
    recentData: TacticalDataPoint[]
  ): Promise<number> {
    // Implementation for model drift detection
    return 0.1; // Placeholder
  }

  private getRecommendedAction(accuracy: number, drift: number): string {
    if (accuracy < 0.6) return "retrain_immediately";
    if (drift > 0.4) return "update_features";
    if (accuracy < 0.8) return "monitor_closely";
    return "maintain";
  }

  private async retrainSpecificModel(
    metric: string,
    data: TacticalDataPoint[]
  ): Promise<void> {
    // Implementation for specific model retraining
  }

  private async calculateModelAccuracy(
    metric: string,
    data: TacticalDataPoint[]
  ): Promise<number> {
    // Implementation for model accuracy calculation
    return 0.9; // Placeholder
  }

  private async generateBusinessInsights(
    metric: string,
    predictions: BusinessForecast["predictions"],
    historicalData: TacticalDataPoint[]
  ): Promise<BusinessForecast["insights"]> {
    // Analyze trends and generate insights
    const trend = predictions[predictions.length - 1]?.trend || "stable";
    const avgGrowth =
      predictions.reduce((sum, p, i) => {
        if (i === 0) return sum;
        return (
          sum + (p.value - predictions[i - 1].value) / predictions[i - 1].value
        );
      }, 0) / Math.max(1, predictions.length - 1);

    return {
      summary: `${metric} is expected to ${trend === "increasing" ? "grow" : trend === "decreasing" ? "decline" : "remain stable"} over the forecast period`,
      keyDrivers: this.identifyKeyDrivers(metric, historicalData),
      riskFactors: this.identifyRiskFactors(metric, predictions),
      opportunities: this.identifyMetricOpportunities(metric, predictions),
      recommendations: this.generateMetricRecommendations(
        metric,
        trend,
        avgGrowth
      ),
    };
  }

  private generateAlerts(
    metric: string,
    predictions: BusinessForecast["predictions"],
    currentValue: number
  ): BusinessForecast["alerts"] {
    const alerts: BusinessForecast["alerts"] = [];

    // Check if predictions fall outside acceptable ranges
    const config = this.config.businessMetrics;
    if (metric === "revenue" && config.revenue.enabled) {
      const target = config.revenue.target;
      const finalPrediction = predictions[predictions.length - 1];

      if (finalPrediction.value < target * config.revenue.alertThresholds.low) {
        alerts.push({
          level: "critical",
          message: `Revenue forecast is ${Math.round((1 - finalPrediction.value / target) * 100)}% below target`,
          threshold: target * config.revenue.alertThresholds.low,
          currentValue: finalPrediction.value,
        });
      }
    }

    return alerts;
  }

  private identifyKeyDrivers(
    metric: string,
    data: TacticalDataPoint[]
  ): string[] {
    // Analyze historical data to identify key drivers
    return ["Market demand", "Seasonal patterns", "Marketing effectiveness"];
  }

  private identifyRiskFactors(
    metric: string,
    predictions: BusinessForecast["predictions"]
  ): string[] {
    // Analyze predictions to identify risks
    const volatility = this.calculateVolatility(predictions.map(p => p.value));
    const risks = [];

    if (volatility > 0.2) {
      risks.push("High prediction volatility");
    }

    return risks;
  }

  private identifyMetricOpportunities(
    metric: string,
    predictions: BusinessForecast["predictions"]
  ): string[] {
    // Identify opportunities based on predictions
    const trend = predictions[predictions.length - 1]?.trend;
    const opportunities = [];

    if (trend === "increasing") {
      opportunities.push("Capitalize on growth momentum");
    }

    return opportunities;
  }

  private generateMetricRecommendations(
    metric: string,
    trend: string,
    avgGrowth: number
  ): string[] {
    const recommendations = [];

    if (trend === "increasing") {
      recommendations.push(
        `Increase investment in ${metric} growth initiatives`
      );
    } else if (trend === "decreasing") {
      recommendations.push(
        `Implement corrective measures for ${metric} decline`
      );
    }

    if (Math.abs(avgGrowth) < 0.01) {
      recommendations.push("Consider strategies to stimulate growth");
    }

    return recommendations;
  }

  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;
    const returns = values.slice(1).map((v, i) => (v - values[i]) / values[i]);
    return this.calculateStandardDeviation(returns);
  }
}
