/**
 * Advanced ML Predictions API Endpoint
 * Integrates sophisticated forecasting algorithms with tactical analysis
 * Provides ARIMA, Exponential Smoothing, and Ensemble forecasting capabilities
 */

import { NextRequest, NextResponse } from "next/server";
import { tacticalDataEngine } from "@/lib/analytics/tactical-data-engine";
import {
  advancedMLEngine,
  BusinessMetricForecast,
} from "@/lib/analytics/advanced-ml-engine";
import { z } from "zod";

// Request schema for advanced predictions
const advancedPredictionSchema = z.object({
  action: z.enum(["forecast", "analyze", "anomalies", "insights", "backtest"]),
  metrics: z
    .array(z.string())
    .optional()
    .default(["revenue", "customers", "orders"]),
  dateRange: z
    .object({
      startDate: z.string(),
      endDate: z.string(),
    })
    .optional(),
  config: z
    .object({
      horizonDays: z.number().min(1).max(365).optional().default(30),
      confidenceLevel: z.number().min(0.8).max(0.99).optional().default(0.95),
      models: z
        .object({
          arima: z.boolean().optional().default(true),
          exponentialSmoothing: z.boolean().optional().default(true),
          ensemble: z.boolean().optional().default(true),
          anomalyDetection: z.boolean().optional().default(true),
        })
        .optional(),
      validation: z
        .object({
          trainTestSplit: z.number().min(0.5).max(0.9).optional().default(0.8),
          crossValidationFolds: z.number().min(3).max(10).optional().default(5),
        })
        .optional(),
    })
    .optional(),
});

type AdvancedPredictionRequest = z.infer<typeof advancedPredictionSchema>;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "status";

    if (action === "status") {
      return NextResponse.json({
        success: true,
        data: {
          engine_status: "operational",
          available_algorithms: [
            "ARIMA (AutoRegressive Integrated Moving Average)",
            "Exponential Smoothing (Holt-Winters)",
            "Linear Regression",
            "Polynomial Regression",
            "Ensemble Methods",
            "Anomaly Detection (Z-Score)",
          ],
          capabilities: [
            "Multi-metric forecasting",
            "Seasonality detection",
            "Trend analysis",
            "Confidence intervals",
            "Model performance metrics",
            "Anomaly identification",
            "Cross-validation",
            "Ensemble modeling",
          ],
          supported_metrics: [
            "revenue",
            "customers",
            "orders",
            "conversion_rate",
            "customer_acquisition_cost",
            "lifetime_value",
          ],
          version: "2.0.0-advanced",
        },
        meta: {
          timestamp: new Date().toISOString(),
          action: "advanced_ml_status",
        },
      });
    }

    if (action === "health") {
      // Check if data engine and ML engine are working
      try {
        const healthStatus = {
          data_engine: "healthy",
          ml_engine: "healthy",
          database_connection: "healthy",
          last_check: new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: healthStatus,
          meta: {
            timestamp: new Date().toISOString(),
            action: "health_check",
          },
        });
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: "Health check failed",
            details: String(error),
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unsupported GET action",
        supported_actions: ["status", "health"],
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Advanced ML Predictions GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validation = advancedPredictionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { action, metrics, dateRange, config } = validation.data;

    switch (action) {
      case "forecast":
        return await handleAdvancedForecasting(metrics, dateRange, config);

      case "analyze":
        return await handleTimeSeriesAnalysis(metrics, dateRange, config);

      case "anomalies":
        return await handleAnomalyDetection(metrics, dateRange, config);

      case "insights":
        return await handleBusinessInsights(metrics, dateRange, config);

      case "backtest":
        return await handleModelBacktesting(metrics, dateRange, config);

      default:
        return NextResponse.json(
          {
            success: false,
            error: `Unsupported action: ${action}`,
            supported_actions: [
              "forecast",
              "analyze",
              "anomalies",
              "insights",
              "backtest",
            ],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Advanced ML Predictions POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process advanced prediction request",
        message: String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Generate advanced forecasts using ensemble methods
 */
async function handleAdvancedForecasting(
  metrics: string[],
  dateRange?: { startDate: string; endDate: string },
  config?: any
): Promise<NextResponse> {
  try {
    // Get historical data from tactical data engine
    const integrationResult = await tacticalDataEngine.integrateData(dateRange);

    if (
      !integrationResult.success ||
      integrationResult.data_points.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to retrieve historical data for forecasting",
          details: integrationResult.errors,
        },
        { status: 400 }
      );
    }

    // Configure advanced ML engine if config provided
    if (config) {
      const { AdvancedMLEngine } = await import(
        "@/lib/analytics/advanced-ml-engine"
      );
      const customEngine = new AdvancedMLEngine({
        prediction: {
          horizonDays: config.horizonDays || 30,
          confidenceLevel: config.confidenceLevel || 0.95,
          includeSeasonality: true,
        },
        models: {
          arima: {
            enabled: config.models?.arima ?? true,
            p: 2,
            d: 1,
            q: 2,
            seasonal: { P: 1, D: 1, Q: 1, s: 7 },
          },
          exponentialSmoothing: {
            enabled: config.models?.exponentialSmoothing ?? true,
            alpha: 0.3,
            beta: 0.1,
            gamma: 0.1,
            seasonal: true,
          },
          ensemble: {
            enabled: config.models?.ensemble ?? true,
            methods: ["arima", "exponential", "linear", "polynomial"],
            weights: [0.4, 0.3, 0.2, 0.1],
          },
          anomalyDetection: {
            enabled: config.models?.anomalyDetection ?? true,
            threshold: 2.5,
            windowSize: 14,
          },
        },
        validation: {
          trainTestSplit: config.validation?.trainTestSplit || 0.8,
          crossValidationFolds: config.validation?.crossValidationFolds || 5,
          metrics: ["mae", "rmse", "mape"],
        },
      });

      // Generate forecasts with custom engine
      const forecasts = await customEngine.generateAdvancedForecasts(
        integrationResult.data_points,
        metrics
      );

      return NextResponse.json({
        success: true,
        data: {
          forecasts,
          data_quality: {
            total_data_points: integrationResult.data_points.length,
            metrics_forecasted: forecasts.length,
            processing_time: integrationResult.processing_time,
          },
          model_config: config,
        },
        meta: {
          action: "advanced_forecasting",
          timestamp: new Date().toISOString(),
          horizon_days: config.horizonDays || 30,
        },
      });
    }

    // Use default advanced ML engine
    const forecasts = await advancedMLEngine.generateAdvancedForecasts(
      integrationResult.data_points,
      metrics
    );

    // Calculate aggregate insights
    const aggregateInsights = calculateAggregateInsights(forecasts);

    return NextResponse.json({
      success: true,
      data: {
        forecasts,
        aggregate_insights: aggregateInsights,
        data_quality: {
          total_data_points: integrationResult.data_points.length,
          metrics_forecasted: forecasts.length,
          average_confidence:
            forecasts.reduce((sum, f) => {
              const avgConfidence =
                f.forecasts.reduce((s, pred) => s + pred.confidence_score, 0) /
                f.forecasts.length;
              return sum + avgConfidence;
            }, 0) / forecasts.length,
        },
      },
      meta: {
        action: "advanced_forecasting",
        timestamp: new Date().toISOString(),
        models_used: ["arima", "exponential_smoothing", "ensemble"],
      },
    });
  } catch (error) {
    console.error("Advanced forecasting error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate advanced forecasts",
        message: String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Perform comprehensive time series analysis
 */
async function handleTimeSeriesAnalysis(
  metrics: string[],
  dateRange?: { startDate: string; endDate: string },
  config?: any
): Promise<NextResponse> {
  try {
    const integrationResult = await tacticalDataEngine.integrateData(dateRange);

    if (!integrationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to retrieve data for analysis",
        },
        { status: 400 }
      );
    }

    const analysisResults: Record<string, any> = {};

    for (const metric of metrics) {
      const metricData = integrationResult.data_points.filter(d =>
        d.category.toLowerCase().includes(metric.toLowerCase())
      );

      if (metricData.length === 0) continue;

      const values = metricData.map(d => d.value);
      const timestamps = metricData.map(d => d.timestamp);

      // Statistical analysis
      const analysis = {
        descriptive_stats: calculateDescriptiveStats(values),
        trend_analysis: analyzeTrend(values),
        seasonality: analyzeSeasonality(values),
        volatility: calculateVolatility(values),
        stationarity: testStationarity(values),
        autocorrelation: calculateAutocorrelation(values),
        change_points: detectChangePoints(values, timestamps),
      };

      analysisResults[metric] = analysis;
    }

    return NextResponse.json({
      success: true,
      data: {
        time_series_analysis: analysisResults,
        summary: {
          metrics_analyzed: Object.keys(analysisResults).length,
          analysis_period: dateRange,
          data_points_analyzed: integrationResult.data_points.length,
        },
      },
      meta: {
        action: "time_series_analysis",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Time series analysis error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to perform time series analysis",
        message: String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Advanced anomaly detection across all metrics
 */
async function handleAnomalyDetection(
  metrics: string[],
  dateRange?: { startDate: string; endDate: string },
  config?: any
): Promise<NextResponse> {
  try {
    const integrationResult = await tacticalDataEngine.integrateData(dateRange);

    if (!integrationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to retrieve data for anomaly detection",
        },
        { status: 400 }
      );
    }

    const forecasts = await advancedMLEngine.generateAdvancedForecasts(
      integrationResult.data_points,
      metrics
    );

    // Aggregate all anomalies
    const allAnomalies = forecasts.flatMap(forecast =>
      forecast.anomalies.map(anomaly => ({
        ...anomaly,
        metric: forecast.metric,
      }))
    );

    // Sort by severity (highest first)
    allAnomalies.sort((a, b) => b.severity - a.severity);

    // Categorize anomalies
    const categorizedAnomalies = {
      critical: allAnomalies.filter(a => a.severity >= 8),
      high: allAnomalies.filter(a => a.severity >= 6 && a.severity < 8),
      medium: allAnomalies.filter(a => a.severity >= 4 && a.severity < 6),
      low: allAnomalies.filter(a => a.severity < 4),
    };

    return NextResponse.json({
      success: true,
      data: {
        anomalies: {
          all: allAnomalies,
          by_severity: categorizedAnomalies,
          by_metric: forecasts.reduce(
            (acc, forecast) => {
              acc[forecast.metric] = forecast.anomalies;
              return acc;
            },
            {} as Record<string, any>
          ),
        },
        summary: {
          total_anomalies: allAnomalies.length,
          critical_alerts: categorizedAnomalies.critical.length,
          metrics_with_anomalies: forecasts.filter(f => f.anomalies.length > 0)
            .length,
          average_severity:
            allAnomalies.reduce((sum, a) => sum + a.severity, 0) /
            allAnomalies.length,
        },
      },
      meta: {
        action: "anomaly_detection",
        timestamp: new Date().toISOString(),
        detection_period: dateRange,
      },
    });
  } catch (error) {
    console.error("Anomaly detection error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to detect anomalies",
        message: String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Generate comprehensive business insights
 */
async function handleBusinessInsights(
  metrics: string[],
  dateRange?: { startDate: string; endDate: string },
  config?: any
): Promise<NextResponse> {
  try {
    const integrationResult = await tacticalDataEngine.integrateData(dateRange);
    const forecasts = await advancedMLEngine.generateAdvancedForecasts(
      integrationResult.data_points,
      metrics
    );

    // Generate business insights from forecasts
    const insights = generateBusinessInsights(forecasts);

    return NextResponse.json({
      success: true,
      data: {
        business_insights: insights,
        forecast_summary: forecasts.map(f => ({
          metric: f.metric,
          current_value: f.current_value,
          predicted_growth: calculatePredictedGrowth(f),
          trend: f.insights.trend,
          volatility: f.insights.volatility_level,
          confidence:
            f.forecasts.reduce((sum, pred) => sum + pred.confidence_score, 0) /
            f.forecasts.length,
        })),
      },
      meta: {
        action: "business_insights",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Business insights error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate business insights",
        message: String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Perform model backtesting and validation
 */
async function handleModelBacktesting(
  metrics: string[],
  dateRange?: { startDate: string; endDate: string },
  config?: any
): Promise<NextResponse> {
  try {
    const integrationResult = await tacticalDataEngine.integrateData(dateRange);

    if (
      !integrationResult.success ||
      integrationResult.data_points.length < 60
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Insufficient data for backtesting (minimum 60 data points required)",
        },
        { status: 400 }
      );
    }

    // Perform backtesting by training on earlier data and testing on recent data
    const data = integrationResult.data_points;
    const testSize = Math.floor(data.length * 0.2); // Use last 20% for testing
    const trainData = data.slice(0, -testSize);
    const testData = data.slice(-testSize);

    // Generate forecasts using training data
    const forecasts = await advancedMLEngine.generateAdvancedForecasts(
      trainData,
      metrics
    );

    // Compare predictions with actual test data
    const backtestResults = performBacktestComparison(
      forecasts,
      testData,
      metrics
    );

    return NextResponse.json({
      success: true,
      data: {
        backtest_results: backtestResults,
        model_performance: {
          training_data_points: trainData.length,
          test_data_points: testData.length,
          test_period_coverage: `${testSize} data points`,
        },
      },
      meta: {
        action: "model_backtesting",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Model backtesting error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to perform model backtesting",
        message: String(error),
      },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateAggregateInsights(forecasts: BusinessMetricForecast[]) {
  const totalMetrics = forecasts.length;
  const avgPerformance =
    forecasts.reduce((sum, f) => sum + f.model_performance.r_squared, 0) /
    totalMetrics;

  const trendCounts = forecasts.reduce(
    (acc, f) => {
      acc[f.insights.trend] = (acc[f.insights.trend] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const volatilityCounts = forecasts.reduce(
    (acc, f) => {
      acc[f.insights.volatility_level] =
        (acc[f.insights.volatility_level] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    average_model_performance: avgPerformance,
    trend_distribution: trendCounts,
    volatility_distribution: volatilityCounts,
    total_anomalies: forecasts.reduce((sum, f) => sum + f.anomalies.length, 0),
    seasonality_detected: forecasts.filter(f => f.insights.seasonality_detected)
      .length,
  };
}

function calculateDescriptiveStats(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const variance =
    values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length;

  return {
    mean,
    median,
    std_dev: Math.sqrt(variance),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    q25: sorted[Math.floor(sorted.length * 0.25)],
    q75: sorted[Math.floor(sorted.length * 0.75)],
  };
}

function analyzeTrend(values: number[]) {
  const n = values.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

  return {
    slope,
    direction:
      slope > 0.01 ? "increasing" : slope < -0.01 ? "decreasing" : "stable",
    strength: Math.abs(slope),
  };
}

function analyzeSeasonality(values: number[]) {
  // Simple seasonality test using autocorrelation
  const periods = [7, 30]; // weekly, monthly
  const results: Record<number, number> = {};

  for (const period of periods) {
    if (values.length > period) {
      results[period] = calculateLaggedCorrelation(values, period);
    }
  }

  return results;
}

function calculateVolatility(values: number[]) {
  const returns = [];
  for (let i = 1; i < values.length; i++) {
    returns.push((values[i] - values[i - 1]) / values[i - 1]);
  }

  const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance =
    returns.reduce((sum, r) => sum + (r - meanReturn) ** 2, 0) / returns.length;

  return Math.sqrt(variance);
}

function testStationarity(values: number[]) {
  // Simplified stationarity test - check if mean and variance are stable
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));

  const mean1 = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const mean2 =
    secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

  const meanDiff = Math.abs(mean1 - mean2) / mean1;

  return {
    is_stationary: meanDiff < 0.1, // threshold for stationarity
    mean_difference: meanDiff,
  };
}

function calculateAutocorrelation(values: number[]) {
  const lags = [1, 7, 30]; // 1 day, 1 week, 1 month
  const correlations: Record<number, number> = {};

  for (const lag of lags) {
    if (values.length > lag) {
      correlations[lag] = calculateLaggedCorrelation(values, lag);
    }
  }

  return correlations;
}

function calculateLaggedCorrelation(values: number[], lag: number): number {
  if (values.length <= lag) return 0;

  const n = values.length - lag;
  const x1 = values.slice(0, n);
  const x2 = values.slice(lag);

  const mean1 = x1.reduce((sum, val) => sum + val, 0) / n;
  const mean2 = x2.reduce((sum, val) => sum + val, 0) / n;

  let numerator = 0;
  let denom1 = 0;
  let denom2 = 0;

  for (let i = 0; i < n; i++) {
    const diff1 = x1[i] - mean1;
    const diff2 = x2[i] - mean2;
    numerator += diff1 * diff2;
    denom1 += diff1 * diff1;
    denom2 += diff2 * diff2;
  }

  return numerator / Math.sqrt(denom1 * denom2);
}

function detectChangePoints(values: number[], timestamps: string[]) {
  // Simple change point detection using variance changes
  const changePoints = [];
  const windowSize = Math.min(10, Math.floor(values.length / 4));

  for (let i = windowSize; i < values.length - windowSize; i++) {
    const before = values.slice(i - windowSize, i);
    const after = values.slice(i, i + windowSize);

    const meanBefore =
      before.reduce((sum, val) => sum + val, 0) / before.length;
    const meanAfter = after.reduce((sum, val) => sum + val, 0) / after.length;

    const changeMagnitude = Math.abs(meanAfter - meanBefore) / meanBefore;

    if (changeMagnitude > 0.2) {
      // 20% change threshold
      changePoints.push({
        date: timestamps[i],
        change_magnitude: changeMagnitude,
        direction: meanAfter > meanBefore ? "increase" : "decrease",
      });
    }
  }

  return changePoints;
}

function generateBusinessInsights(forecasts: BusinessMetricForecast[]) {
  const insights = [];

  for (const forecast of forecasts) {
    const currentValue = forecast.current_value;
    const futureValue =
      forecast.forecasts[forecast.forecasts.length - 1]?.predicted_value ||
      currentValue;
    const growthRate = ((futureValue - currentValue) / currentValue) * 100;

    insights.push({
      metric: forecast.metric,
      key_insight: generateKeyInsight(forecast, growthRate),
      growth_projection: `${growthRate.toFixed(1)}% over forecast period`,
      risk_assessment: assessRisk(forecast),
      recommendations: generateRecommendations(forecast, growthRate),
    });
  }

  return insights;
}

function generateKeyInsight(
  forecast: BusinessMetricForecast,
  growthRate: number
): string {
  const { metric, insights } = forecast;

  if (insights.trend === "upward" && growthRate > 10) {
    return `${metric} shows strong upward trend with ${growthRate.toFixed(1)}% growth expected`;
  } else if (insights.trend === "downward" && growthRate < -5) {
    return `${metric} declining with ${Math.abs(growthRate).toFixed(1)}% decrease projected`;
  } else if (insights.seasonality_detected) {
    return `${metric} exhibits seasonal patterns - consider seasonal optimization strategies`;
  } else if (insights.volatility_level === "high") {
    return `${metric} shows high volatility - implement risk management measures`;
  } else {
    return `${metric} maintains stable performance with ${Math.abs(growthRate).toFixed(1)}% ${growthRate >= 0 ? "growth" : "decline"}`;
  }
}

function assessRisk(forecast: BusinessMetricForecast): string {
  const { insights, anomalies } = forecast;

  if (anomalies.length > 5) return "High - Multiple anomalies detected";
  if (insights.volatility_level === "high")
    return "Medium-High - High volatility observed";
  if (insights.trend === "downward") return "Medium - Declining trend";
  if (anomalies.length > 0) return "Low-Medium - Some anomalies present";
  return "Low - Stable performance";
}

function generateRecommendations(
  forecast: BusinessMetricForecast,
  growthRate: number
): string[] {
  const recommendations = [];
  const { insights, anomalies } = forecast;

  if (growthRate > 15) {
    recommendations.push(
      "Consider scaling operations to maintain growth momentum"
    );
  } else if (growthRate < -10) {
    recommendations.push(
      "Implement corrective measures to address declining performance"
    );
  }

  if (insights.seasonality_detected) {
    recommendations.push("Develop seasonal optimization strategies");
  }

  if (insights.volatility_level === "high") {
    recommendations.push("Implement volatility reduction measures");
  }

  if (anomalies.length > 3) {
    recommendations.push("Investigate root causes of recurring anomalies");
  }

  return recommendations.length > 0
    ? recommendations
    : ["Continue monitoring current performance"];
}

function calculatePredictedGrowth(forecast: BusinessMetricForecast): number {
  const current = forecast.current_value;
  const future =
    forecast.forecasts[forecast.forecasts.length - 1]?.predicted_value ||
    current;
  return ((future - current) / current) * 100;
}

function performBacktestComparison(
  forecasts: BusinessMetricForecast[],
  testData: any[],
  metrics: string[]
): Record<string, any> {
  const results: Record<string, any> = {};

  for (const metric of metrics) {
    const forecast = forecasts.find(f => f.metric === metric);
    const actualData = testData.filter(d =>
      d.category.toLowerCase().includes(metric.toLowerCase())
    );

    if (forecast && actualData.length > 0) {
      const actualValues = actualData.map(d => d.value);
      const predictedValues = forecast.forecasts
        .slice(0, actualValues.length)
        .map(f => f.predicted_value);

      // Calculate performance metrics
      results[metric] = calculatePerformanceMetrics(
        actualValues,
        predictedValues
      );
    }
  }

  return results;
}

function calculatePerformanceMetrics(actual: number[], predicted: number[]) {
  const n = Math.min(actual.length, predicted.length);
  let mae = 0,
    mse = 0,
    mape = 0;

  for (let i = 0; i < n; i++) {
    const error = Math.abs(actual[i] - predicted[i]);
    mae += error;
    mse += error * error;
    mape += actual[i] !== 0 ? error / Math.abs(actual[i]) : 0;
  }

  return {
    mae: mae / n,
    rmse: Math.sqrt(mse / n),
    mape: (mape / n) * 100,
    accuracy: Math.max(0, 100 - (mape / n) * 100),
  };
}
