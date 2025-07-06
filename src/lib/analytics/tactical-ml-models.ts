/**
 * Tactical Machine Learning Models
 * Provides predictive capabilities for business intelligence
 * Includes trend analysis, anomaly detection, and forecasting
 */

import { TacticalDataPoint, PredictiveInsight } from "./tactical-data-engine";

// Types for ML models
export interface MLModelConfig {
  model_type:
    | "trend_analysis"
    | "anomaly_detection"
    | "forecasting"
    | "classification";
  algorithm:
    | "linear_regression"
    | "moving_average"
    | "arima"
    | "isolation_forest"
    | "lstm";
  parameters: Record<string, unknown>;
  training_window_days: number;
  prediction_horizon_days: number;
  confidence_threshold: number;
}

export interface MLPrediction {
  id: string;
  model_type: string;
  metric: string;
  current_value: number;
  predicted_value: number;
  confidence_score: number; // 0-100
  change_percentage: number;
  trend: "increasing" | "decreasing" | "stable";
  prediction_date: string;
  created_at: string;
}

export interface AnomalyDetection {
  id: string;
  timestamp: string;
  value: number;
  expected_value: number;
  anomaly_score: number; // 0-100, higher = more anomalous
  severity: "low" | "medium" | "high" | "critical";
  source: string;
  category: string;
  description: string;
  created_at: string;
}

export interface TrendAnalysis {
  id: string;
  metric: string;
  time_period: string;
  trend_direction: "upward" | "downward" | "stable" | "volatile";
  trend_strength: number; // 0-100
  seasonal_pattern: boolean;
  growth_rate: number; // percentage
  volatility_index: number;
  correlation_factors: string[];
  created_at: string;
}

/**
 * Main ML Engine for Tactical Analysis
 */
export class TacticalMLEngine {
  private modelConfigs: Map<string, MLModelConfig> = new Map();
  private trainingData: Map<string, TacticalDataPoint[]> = new Map();

  constructor() {
    this.initializeDefaultModels();
  }

  /**
   * Initialize default ML model configurations
   */
  private initializeDefaultModels(): void {
    // Revenue trend analysis
    this.modelConfigs.set("revenue_trend", {
      model_type: "trend_analysis",
      algorithm: "linear_regression",
      parameters: {
        window_size: 30,
        polynomial_degree: 2,
        seasonal_adjustment: true,
      },
      training_window_days: 90,
      prediction_horizon_days: 30,
      confidence_threshold: 70,
    });

    // Anomaly detection for all metrics
    this.modelConfigs.set("general_anomaly", {
      model_type: "anomaly_detection",
      algorithm: "isolation_forest",
      parameters: {
        contamination: 0.1,
        n_estimators: 100,
        max_samples: 256,
      },
      training_window_days: 60,
      prediction_horizon_days: 7,
      confidence_threshold: 80,
    });

    // Financial forecasting
    this.modelConfigs.set("financial_forecast", {
      model_type: "forecasting",
      algorithm: "moving_average",
      parameters: {
        window_size: 14,
        exponential_smoothing: true,
        alpha: 0.3,
        beta: 0.1,
        gamma: 0.1,
      },
      training_window_days: 120,
      prediction_horizon_days: 60,
      confidence_threshold: 75,
    });
  }

  /**
   * Train models with historical data
   */
  async trainModels(data: TacticalDataPoint[]): Promise<{
    success: boolean;
    models_trained: string[];
    training_summary: Record<string, unknown>;
  }> {
    const trainedModels: string[] = [];
    const trainingSummary: Record<string, unknown> = {};

    try {
      // Group data by source and category for targeted training
      const groupedData = this.groupDataForTraining(data);

      // Train each model type
      for (const [modelName, config] of this.modelConfigs) {
        try {
          const relevantData = this.getRelevantTrainingData(
            groupedData,
            config
          );

          if (relevantData.length < 10) {
            // Insufficient data for model training
            continue;
          }

          // Store training data
          this.trainingData.set(modelName, relevantData);

          // Perform model-specific training
          const trainResult = await this.trainSpecificModel(
            modelName,
            config,
            relevantData
          );

          if (trainResult.success) {
            trainedModels.push(modelName);
            trainingSummary[modelName] = trainResult.summary;
          }
        } catch (modelError) {
          trainingSummary[modelName] = { error: String(modelError) };
        }
      }

      return {
        success: trainedModels.length > 0,
        models_trained: trainedModels,
        training_summary: trainingSummary,
      };
    } catch {
      return {
        success: false,
        models_trained: [],
        training_summary: { error: "Training failed" },
      };
    }
  }

  /**
   * Generate predictions using trained models
   */
  async generatePredictions(
    data: TacticalDataPoint[],
    modelTypes?: string[]
  ): Promise<MLPrediction[]> {
    const predictions: MLPrediction[] = [];
    const modelsToUse = modelTypes || Array.from(this.modelConfigs.keys());

    for (const modelName of modelsToUse) {
      const config = this.modelConfigs.get(modelName);
      const trainingData = this.trainingData.get(modelName);

      if (!config || !trainingData || trainingData.length === 0) {
        continue;
      }

      try {
        const modelPredictions = await this.generateModelPredictions(
          modelName,
          config,
          data,
          trainingData
        );
        predictions.push(...modelPredictions);
      } catch {
        // Error generating predictions for model
      }
    }

    return predictions;
  }

  /**
   * Generate comprehensive predictive insights
   */
  async generatePredictiveInsights(
    data: TacticalDataPoint[],
    horizon: "1week" | "1month" | "3months" = "1month"
  ): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];

    try {
      // Generate predictions
      const predictions = await this.generatePredictions(data);

      // Combine insights from different models
      const combinedInsights = this.combineMLInsights(predictions, horizon);

      insights.push(...combinedInsights);
    } catch {
      // Error generating predictive insights
    }

    return insights;
  }

  // Helper methods
  private groupDataForTraining(
    data: TacticalDataPoint[]
  ): Map<string, TacticalDataPoint[]> {
    const grouped = new Map<string, TacticalDataPoint[]>();

    for (const point of data) {
      const key = `${point.source}_${point.category}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(point);
    }

    return grouped;
  }

  private getRelevantTrainingData(
    groupedData: Map<string, TacticalDataPoint[]>,
    config: MLModelConfig
  ): TacticalDataPoint[] {
    const relevantData: TacticalDataPoint[] = [];

    // For now, use all data - in production, filter based on model type
    for (const points of groupedData.values()) {
      relevantData.push(...points);
    }

    // Sort by timestamp and limit to training window
    return relevantData
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      .slice(-config.training_window_days * 10); // Rough approximation
  }

  private async trainSpecificModel(
    modelName: string,
    config: MLModelConfig,
    data: TacticalDataPoint[]
  ): Promise<{ success: boolean; summary: Record<string, unknown> }> {
    // Simplified training logic - in production, use actual ML libraries
    const summary: Record<string, unknown> = {
      model_name: modelName,
      algorithm: config.algorithm,
      data_points: data.length,
      training_period: `${config.training_window_days} days`,
      prediction_horizon: `${config.prediction_horizon_days} days`,
    };

    // Calculate basic statistics for training validation
    const values = data.map(d => d.value);
    summary.data_stats = {
      mean: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      std_dev: this.calculateStandardDeviation(values),
    };

    return { success: true, summary };
  }

  private async generateModelPredictions(
    modelName: string,
    config: MLModelConfig,
    data: TacticalDataPoint[],
    _trainingData: TacticalDataPoint[]
  ): Promise<MLPrediction[]> {
    const predictions: MLPrediction[] = [];

    // Group data by metric for predictions
    const groupedData = this.groupDataForTraining(data);

    for (const [key, points] of groupedData) {
      if (points.length < 3) continue;

      const latestPoint = points[points.length - 1];
      const prediction = this.calculatePrediction(points, config);

      predictions.push({
        id: `${modelName}_${key}_${Date.now()}`,
        model_type: config.model_type,
        metric: key,
        current_value: latestPoint.value,
        predicted_value: prediction.value,
        confidence_score: prediction.confidence,
        change_percentage:
          ((prediction.value - latestPoint.value) / latestPoint.value) * 100,
        trend: this.determineTrend(prediction.value, latestPoint.value),
        prediction_date: new Date(
          Date.now() + config.prediction_horizon_days * 24 * 60 * 60 * 1000
        ).toISOString(),
        created_at: new Date().toISOString(),
      });
    }

    return predictions;
  }

  private combineMLInsights(
    predictions: MLPrediction[],
    horizon: string
  ): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];

    // Create insights from predictions
    const predictionGroups = this.groupPredictionsByMetric(predictions);

    for (const [metric, preds] of predictionGroups) {
      const avgConfidence =
        preds.reduce((sum, p) => sum + p.confidence_score, 0) / preds.length;
      const avgChange =
        preds.reduce((sum, p) => sum + Math.abs(p.change_percentage), 0) /
        preds.length;

      insights.push({
        id: `insight_${metric}_${Date.now()}`,
        title: `${metric.replace("_", " ")} Prediction`,
        description: `Based on historical data, ${metric} is expected to ${preds[0]?.trend || "remain stable"}.`,
        confidence_score: Math.round(avgConfidence),
        impact_score: Math.min(100, Math.round(avgChange)),
        time_horizon: horizon,
        data_sources: [...new Set(preds.map(p => p.metric.split("_")[0]))],
        predictions: preds.map(p => ({
          metric: p.metric,
          current_value: p.current_value,
          predicted_value: p.predicted_value,
          change_percentage: p.change_percentage,
          trend: p.trend,
        })),
        recommendations: this.generateRecommendations(preds),
        risk_factors: [],
        created_at: new Date().toISOString(),
      });
    }

    return insights;
  }

  // Utility methods
  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    return Math.sqrt(variance);
  }

  private calculatePrediction(
    points: TacticalDataPoint[],
    _config: MLModelConfig
  ): { value: number; confidence: number } {
    const values = points.map(p => p.value);

    // Simple moving average prediction
    const windowSize = Math.min(7, values.length);
    const recentValues = values.slice(-windowSize);
    const predictedValue =
      recentValues.reduce((a, b) => a + b, 0) / recentValues.length;

    // Calculate confidence based on variance
    const variance = this.calculateStandardDeviation(recentValues);
    const confidence = Math.max(
      30,
      Math.min(100, 100 - (variance / predictedValue) * 50)
    );

    return {
      value: predictedValue,
      confidence: Math.round(confidence),
    };
  }

  private determineTrend(
    predicted: number,
    current: number
  ): "increasing" | "decreasing" | "stable" {
    const changePercent = Math.abs((predicted - current) / current) * 100;

    if (changePercent < 5) return "stable";
    return predicted > current ? "increasing" : "decreasing";
  }

  private groupPredictionsByMetric(
    predictions: MLPrediction[]
  ): Map<string, MLPrediction[]> {
    const grouped = new Map<string, MLPrediction[]>();

    for (const pred of predictions) {
      if (!grouped.has(pred.metric)) {
        grouped.set(pred.metric, []);
      }
      grouped.get(pred.metric)!.push(pred);
    }

    return grouped;
  }

  private generateRecommendations(predictions: MLPrediction[]): string[] {
    const recommendations: string[] = [];

    // Generate recommendations based on predictions
    for (const pred of predictions) {
      if (
        pred.trend === "decreasing" &&
        Math.abs(pred.change_percentage) > 10
      ) {
        recommendations.push(
          `Monitor ${pred.metric} closely as it's predicted to decline by ${Math.abs(pred.change_percentage).toFixed(1)}%`
        );
      } else if (
        pred.trend === "increasing" &&
        Math.abs(pred.change_percentage) > 15
      ) {
        recommendations.push(
          `Capitalize on ${pred.metric} growth opportunity - predicted increase of ${pred.change_percentage.toFixed(1)}%`
        );
      }
    }

    return recommendations;
  }
}

// Export the ML engine instance
export const tacticalMLEngine = new TacticalMLEngine();
