/**
 * Tactical Real-Time Data Processing Engine
 * Provides live streaming analytics, real-time predictions, and instant business insights
 * Integrates with the Advanced ML Engine for continuous forecasting
 */

import { TacticalDataPoint } from "@/lib/analytics/tactical-data-engine";
import {
  advancedMLEngine,
  BusinessMetricForecast,
} from "@/lib/analytics/advanced-ml-engine";
import { createClient } from "@/lib/supabase/client";

export interface RealtimeDataStream {
  id: string;
  source: "shopify" | "kajabi" | "financial" | "marketing" | "external";
  metric: string;
  value: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface RealtimeInsight {
  id: string;
  type:
    | "prediction"
    | "anomaly"
    | "trend_change"
    | "threshold_alert"
    | "opportunity";
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  confidence_score: number;
  metric_affected: string;
  current_value: number;
  expected_value?: number;
  recommendations: string[];
  timestamp: string;
  expires_at?: string;
}

export interface RealtimeAlert {
  id: string;
  type: "anomaly" | "threshold" | "trend_reversal" | "forecast_deviation";
  metric: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  current_value: number;
  threshold_value?: number;
  confidence: number;
  timestamp: string;
  action_required: boolean;
  suggested_actions: string[];
}

export interface StreamingForecast {
  metric: string;
  current_value: number;
  short_term_forecast: {
    next_hour: number;
    next_day: number;
    next_week: number;
  };
  confidence_levels: {
    next_hour: number;
    next_day: number;
    next_week: number;
  };
  trend_direction: "up" | "down" | "stable";
  volatility_index: number;
  last_updated: string;
}

export interface RealtimeConfig {
  update_interval_ms: number;
  prediction_refresh_ms: number;
  anomaly_threshold: number;
  forecast_horizon_hours: number;
  enabled_sources: string[];
  alert_thresholds: Record<string, { min?: number; max?: number }>;
  ml_config: {
    enable_streaming_predictions: boolean;
    enable_anomaly_detection: boolean;
    enable_trend_monitoring: boolean;
    confidence_threshold: number;
  };
}

export class TacticalRealtimeEngine {
  private config: RealtimeConfig;
  private subscribers: Map<string, (data: any) => void> = new Map();
  private dataBuffer: Map<string, RealtimeDataStream[]> = new Map();
  private lastForecasts: Map<string, StreamingForecast> = new Map();
  private activeAlerts: Map<string, RealtimeAlert> = new Map();
  private processingInterval?: NodeJS.Timeout;
  private supabase = createClient();
  private isProcessing = false;

  constructor(config?: Partial<RealtimeConfig>) {
    this.config = {
      update_interval_ms: 30000, // 30 seconds
      prediction_refresh_ms: 60000, // 1 minute
      anomaly_threshold: 2.5,
      forecast_horizon_hours: 24,
      enabled_sources: ["shopify", "kajabi", "financial", "marketing"],
      alert_thresholds: {
        revenue: { min: 0 },
        customers: { min: 0 },
        orders: { min: 0 },
        conversion_rate: { min: 0, max: 100 },
      },
      ml_config: {
        enable_streaming_predictions: true,
        enable_anomaly_detection: true,
        enable_trend_monitoring: true,
        confidence_threshold: 70,
      },
      ...config,
    };

    this.initializeDataBuffers();
  }

  /**
   * Start the real-time processing engine
   */
  async start(): Promise<void> {
    if (this.processingInterval) {
      console.warn("Real-time engine already running");
      return;
    }

    console.log("Starting Tactical Real-Time Engine...");

    // Initialize Supabase real-time subscriptions
    await this.initializeRealtimeSubscriptions();

    // Start periodic processing
    this.processingInterval = setInterval(
      () => this.processRealtimeData(),
      this.config.update_interval_ms
    );

    // Start ML prediction updates
    setInterval(
      () => this.updateStreamingForecasts(),
      this.config.prediction_refresh_ms
    );

    console.log("Real-time engine started successfully");
  }

  /**
   * Stop the real-time processing engine
   */
  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = undefined;
    }

    this.subscribers.clear();
    console.log("Real-time engine stopped");
  }

  /**
   * Subscribe to real-time insights and alerts
   */
  subscribe(
    channelId: string,
    callback: (
      data: RealtimeInsight | RealtimeAlert | StreamingForecast
    ) => void
  ): void {
    this.subscribers.set(channelId, callback);
  }

  /**
   * Unsubscribe from real-time updates
   */
  unsubscribe(channelId: string): void {
    this.subscribers.delete(channelId);
  }

  /**
   * Manually inject real-time data (for testing or external sources)
   */
  async injectData(dataStream: RealtimeDataStream): Promise<void> {
    const metricBuffer = this.dataBuffer.get(dataStream.metric) || [];
    metricBuffer.push(dataStream);

    // Keep only recent data (last 1000 points)
    if (metricBuffer.length > 1000) {
      metricBuffer.splice(0, metricBuffer.length - 1000);
    }

    this.dataBuffer.set(dataStream.metric, metricBuffer);

    // Process immediately for high-priority data
    if (
      dataStream.source === "financial" ||
      dataStream.metadata?.priority === "high"
    ) {
      await this.processNewDataPoint(dataStream);
    }
  }

  /**
   * Get current streaming forecasts for all metrics
   */
  getCurrentForecasts(): Map<string, StreamingForecast> {
    return new Map(this.lastForecasts);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): RealtimeAlert[] {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Initialize data buffers for each metric
   */
  private initializeDataBuffers(): void {
    const metrics = [
      "revenue",
      "customers",
      "orders",
      "conversion_rate",
      "cac",
      "ltv",
    ];
    metrics.forEach(metric => {
      this.dataBuffer.set(metric, []);
    });
  }

  /**
   * Initialize Supabase real-time subscriptions
   */
  private async initializeRealtimeSubscriptions(): Promise<void> {
    // Subscribe to business KPI updates
    this.supabase
      .channel("business-kpis")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "business_kpi_daily",
        },
        payload => this.handleDatabaseUpdate(payload, "financial")
      )
      .subscribe();

    // Subscribe to Shopify sales updates
    this.supabase
      .channel("shopify-sales")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "shopify_sales",
        },
        payload => this.handleDatabaseUpdate(payload, "shopify")
      )
      .subscribe();

    // Subscribe to Kajabi sales updates
    this.supabase
      .channel("kajabi-sales")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "kajabi_sales",
        },
        payload => this.handleDatabaseUpdate(payload, "kajabi")
      )
      .subscribe();
  }

  /**
   * Handle database updates and convert to real-time data streams
   */
  private async handleDatabaseUpdate(
    payload: any,
    source: RealtimeDataStream["source"]
  ): Promise<void> {
    try {
      const record = payload.new;
      let dataStream: RealtimeDataStream;

      switch (source) {
        case "financial":
          dataStream = {
            id: record.id,
            source: "financial",
            metric: record.metric_name,
            value: record.metric_value,
            timestamp: record.created_at,
            metadata: { table: "business_kpi_daily" },
          };
          break;

        case "shopify":
          dataStream = {
            id: record.id,
            source: "shopify",
            metric: "revenue",
            value: parseFloat(record.total_amount),
            timestamp: record.created_at,
            metadata: {
              table: "shopify_sales",
              product: record.product_name,
              customer: record.customer_email,
            },
          };
          break;

        case "kajabi":
          dataStream = {
            id: record.id,
            source: "kajabi",
            metric: "revenue",
            value: record.amount,
            timestamp: record.created_at,
            metadata: {
              table: "kajabi_sales",
              product: record.product_name,
              customer: record.customer_email,
            },
          };
          break;

        default:
          return;
      }

      await this.injectData(dataStream);
    } catch (error) {
      console.error("Error processing database update:", error);
    }
  }

  /**
   * Process real-time data and generate insights
   */
  private async processRealtimeData(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      for (const [metric, dataPoints] of this.dataBuffer) {
        if (dataPoints.length === 0) continue;

        // Get recent data points (last hour)
        const recentData = this.getRecentDataPoints(dataPoints, 60); // 60 minutes

        if (recentData.length === 0) continue;

        // Generate real-time insights
        await this.generateRealtimeInsights(metric, recentData);

        // Check for anomalies
        if (this.config.ml_config.enable_anomaly_detection) {
          await this.detectRealtimeAnomalies(metric, recentData);
        }

        // Monitor trend changes
        if (this.config.ml_config.enable_trend_monitoring) {
          await this.monitorTrendChanges(metric, recentData);
        }
      }
    } catch (error) {
      console.error("Error processing real-time data:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Update streaming forecasts using ML models
   */
  private async updateStreamingForecasts(): Promise<void> {
    if (!this.config.ml_config.enable_streaming_predictions) return;

    try {
      // Get all recent data for forecasting
      const allDataPoints: TacticalDataPoint[] = [];

      for (const [metric, dataPoints] of this.dataBuffer) {
        const recentData = this.getRecentDataPoints(dataPoints, 24 * 60); // 24 hours

        allDataPoints.push(
          ...recentData
            .filter(dp => dp.source !== "external") // Filter out external sources for ML engine
            .map(dp => ({
              timestamp: dp.timestamp,
              value: dp.value,
              source: dp.source as
                | "shopify"
                | "kajabi"
                | "financial"
                | "marketing",
              category: metric,
              metadata: dp.metadata,
            }))
        );
      }

      if (allDataPoints.length < 10) return; // Need minimum data for forecasting

      // Generate short-term forecasts
      const forecasts = await advancedMLEngine.generateAdvancedForecasts(
        allDataPoints,
        Array.from(this.dataBuffer.keys())
      );

      // Convert to streaming forecasts
      for (const forecast of forecasts) {
        const streamingForecast = this.convertToStreamingForecast(forecast);
        this.lastForecasts.set(forecast.metric, streamingForecast);

        // Notify subscribers
        this.notifySubscribers(streamingForecast);
      }
    } catch (error) {
      console.error("Error updating streaming forecasts:", error);
    }
  }

  /**
   * Process a new data point for immediate insights
   */
  private async processNewDataPoint(
    dataStream: RealtimeDataStream
  ): Promise<void> {
    // Check threshold alerts
    await this.checkThresholdAlerts(dataStream);

    // Generate immediate insights if significant
    if (this.isSignificantDataPoint(dataStream)) {
      const insight = await this.generateImmediateInsight(dataStream);
      if (insight) {
        this.notifySubscribers(insight);
      }
    }
  }

  /**
   * Generate real-time insights for a metric
   */
  private async generateRealtimeInsights(
    metric: string,
    dataPoints: RealtimeDataStream[]
  ): Promise<void> {
    const values = dataPoints.map(dp => dp.value);
    const currentValue = values[values.length - 1];
    const previousValue = values[values.length - 2] || currentValue;

    const changePercent =
      ((currentValue - previousValue) / previousValue) * 100;

    // Generate insights based on change patterns
    if (Math.abs(changePercent) > 5) {
      // 5% change threshold
      const insight: RealtimeInsight = {
        id: `insight_${metric}_${Date.now()}`,
        type: changePercent > 0 ? "opportunity" : "trend_change",
        title: `${metric.toUpperCase()} ${changePercent > 0 ? "Spike" : "Drop"} Detected`,
        description: `${metric} has ${changePercent > 0 ? "increased" : "decreased"} by ${Math.abs(changePercent).toFixed(1)}% in the last update`,
        severity:
          Math.abs(changePercent) > 15
            ? "high"
            : Math.abs(changePercent) > 10
              ? "medium"
              : "low",
        confidence_score: this.calculateConfidenceScore(values),
        metric_affected: metric,
        current_value: currentValue,
        expected_value: previousValue,
        recommendations: this.generateRecommendationsForChange(
          metric,
          changePercent
        ),
        timestamp: new Date().toISOString(),
        expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      };

      this.notifySubscribers(insight);
    }
  }

  /**
   * Detect real-time anomalies in data streams
   */
  private async detectRealtimeAnomalies(
    metric: string,
    dataPoints: RealtimeDataStream[]
  ): Promise<void> {
    if (dataPoints.length < 10) return; // Need minimum data for anomaly detection

    const values = dataPoints.map(dp => dp.value);
    const currentValue = values[values.length - 1];

    // Calculate moving statistics
    const windowSize = Math.min(20, values.length - 1);
    const window = values.slice(-windowSize - 1, -1);
    const mean = window.reduce((sum, val) => sum + val, 0) / window.length;
    const variance =
      window.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      window.length;
    const stdDev = Math.sqrt(variance);

    const zScore = Math.abs((currentValue - mean) / stdDev);

    if (zScore > this.config.anomaly_threshold) {
      const alert: RealtimeAlert = {
        id: `anomaly_${metric}_${Date.now()}`,
        type: "anomaly",
        metric,
        severity: zScore > 4 ? "critical" : zScore > 3 ? "high" : "medium",
        message: `Anomaly detected in ${metric}: value ${currentValue} deviates ${zScore.toFixed(2)} standard deviations from normal`,
        current_value: currentValue,
        threshold_value: mean,
        confidence: Math.min(95, (zScore / this.config.anomaly_threshold) * 75),
        timestamp: new Date().toISOString(),
        action_required: zScore > 3,
        suggested_actions: this.generateAnomalyActions(
          metric,
          currentValue,
          mean
        ),
      };

      this.activeAlerts.set(alert.id, alert);
      this.notifySubscribers(alert);

      // Auto-expire alert after 2 hours
      setTimeout(
        () => {
          this.activeAlerts.delete(alert.id);
        },
        2 * 60 * 60 * 1000
      );
    }
  }

  /**
   * Monitor trend changes in real-time
   */
  private async monitorTrendChanges(
    metric: string,
    dataPoints: RealtimeDataStream[]
  ): Promise<void> {
    if (dataPoints.length < 6) return; // Need minimum data for trend analysis

    const values = dataPoints.map(dp => dp.value);
    const recentTrend = this.calculateTrendDirection(values.slice(-6)); // Last 6 points
    const previousTrend = this.calculateTrendDirection(values.slice(-12, -6)); // Previous 6 points

    if (recentTrend !== previousTrend && previousTrend !== "stable") {
      const insight: RealtimeInsight = {
        id: `trend_change_${metric}_${Date.now()}`,
        type: "trend_change",
        title: `Trend Reversal in ${metric.toUpperCase()}`,
        description: `${metric} trend has changed from ${previousTrend} to ${recentTrend}`,
        severity: "medium",
        confidence_score: 75,
        metric_affected: metric,
        current_value: values[values.length - 1],
        recommendations: this.generateTrendChangeRecommendations(
          metric,
          recentTrend
        ),
        timestamp: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7200000).toISOString(), // 2 hours
      };

      this.notifySubscribers(insight);
    }
  }

  /**
   * Check threshold-based alerts
   */
  private async checkThresholdAlerts(
    dataStream: RealtimeDataStream
  ): Promise<void> {
    const thresholds = this.config.alert_thresholds[dataStream.metric];
    if (!thresholds) return;

    let alertTriggered = false;
    let alertType = "";
    let thresholdValue = 0;

    if (thresholds.min !== undefined && dataStream.value < thresholds.min) {
      alertTriggered = true;
      alertType = "below minimum threshold";
      thresholdValue = thresholds.min;
    }

    if (thresholds.max !== undefined && dataStream.value > thresholds.max) {
      alertTriggered = true;
      alertType = "above maximum threshold";
      thresholdValue = thresholds.max;
    }

    if (alertTriggered) {
      const alert: RealtimeAlert = {
        id: `threshold_${dataStream.metric}_${Date.now()}`,
        type: "threshold",
        metric: dataStream.metric,
        severity: "high",
        message: `${dataStream.metric} ${alertType}: ${dataStream.value}`,
        current_value: dataStream.value,
        threshold_value: thresholdValue,
        confidence: 95,
        timestamp: new Date().toISOString(),
        action_required: true,
        suggested_actions: [
          `Review ${dataStream.metric} processes`,
          `Investigate cause of threshold breach`,
        ],
      };

      this.activeAlerts.set(alert.id, alert);
      this.notifySubscribers(alert);
    }
  }

  // Helper methods
  private getRecentDataPoints(
    dataPoints: RealtimeDataStream[],
    minutes: number
  ): RealtimeDataStream[] {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    return dataPoints.filter(dp => new Date(dp.timestamp) > cutoffTime);
  }

  private isSignificantDataPoint(dataStream: RealtimeDataStream): boolean {
    return (
      dataStream.metadata?.priority === "high" ||
      dataStream.source === "financial" ||
      dataStream.value > 1000
    ); // Configurable significance threshold
  }

  private async generateImmediateInsight(
    dataStream: RealtimeDataStream
  ): Promise<RealtimeInsight | null> {
    // Generate immediate insights for high-priority data
    return {
      id: `immediate_${dataStream.id}`,
      type: "prediction",
      title: `Real-time ${dataStream.metric} Update`,
      description: `New ${dataStream.metric} value: ${dataStream.value}`,
      severity: "low",
      confidence_score: 80,
      metric_affected: dataStream.metric,
      current_value: dataStream.value,
      recommendations: [`Monitor ${dataStream.metric} trends`],
      timestamp: new Date().toISOString(),
    };
  }

  private convertToStreamingForecast(
    forecast: BusinessMetricForecast
  ): StreamingForecast {
    const nextHour =
      forecast.forecasts[0]?.predicted_value || forecast.current_value;
    const nextDay =
      forecast.forecasts[Math.min(23, forecast.forecasts.length - 1)]
        ?.predicted_value || forecast.current_value;
    const nextWeek =
      forecast.forecasts[Math.min(167, forecast.forecasts.length - 1)]
        ?.predicted_value || forecast.current_value;

    return {
      metric: forecast.metric,
      current_value: forecast.current_value,
      short_term_forecast: {
        next_hour: nextHour,
        next_day: nextDay,
        next_week: nextWeek,
      },
      confidence_levels: {
        next_hour: forecast.forecasts[0]?.confidence_score || 50,
        next_day:
          forecast.forecasts[Math.min(23, forecast.forecasts.length - 1)]
            ?.confidence_score || 50,
        next_week:
          forecast.forecasts[Math.min(167, forecast.forecasts.length - 1)]
            ?.confidence_score || 50,
      },
      trend_direction:
        forecast.insights.trend === "upward"
          ? "up"
          : forecast.insights.trend === "downward"
            ? "down"
            : "stable",
      volatility_index:
        forecast.insights.volatility_level === "high"
          ? 80
          : forecast.insights.volatility_level === "medium"
            ? 50
            : 20,
      last_updated: new Date().toISOString(),
    };
  }

  private calculateConfidenceScore(values: number[]): number {
    if (values.length < 3) return 50;

    const variance = this.calculateVariance(values);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const cv = Math.sqrt(variance) / mean;

    return Math.max(30, Math.min(95, 90 - cv * 100));
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return (
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length
    );
  }

  private calculateTrendDirection(values: number[]): "up" | "down" | "stable" {
    if (values.length < 2) return "stable";

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstMean =
      firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondMean =
      secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const changePercent = ((secondMean - firstMean) / firstMean) * 100;

    if (changePercent > 5) return "up";
    if (changePercent < -5) return "down";
    return "stable";
  }

  private generateRecommendationsForChange(
    metric: string,
    changePercent: number
  ): string[] {
    const recommendations = [];

    if (changePercent > 10) {
      recommendations.push(`Investigate drivers of ${metric} increase`);
      recommendations.push(`Consider scaling operations to support growth`);
    } else if (changePercent < -10) {
      recommendations.push(`Review factors causing ${metric} decline`);
      recommendations.push(`Implement corrective measures immediately`);
    }

    recommendations.push(`Continue monitoring ${metric} closely`);
    return recommendations;
  }

  private generateAnomalyActions(
    metric: string,
    _currentValue: number,
    _expectedValue: number
  ): string[] {
    return [
      `Verify data accuracy for ${metric}`,
      `Investigate cause of anomaly`,
      `Review recent changes that might affect ${metric}`,
      `Consider implementing safeguards`,
    ];
  }

  private generateTrendChangeRecommendations(
    metric: string,
    newTrend: string
  ): string[] {
    const recommendations = [];

    if (newTrend === "up") {
      recommendations.push(`Capitalize on positive ${metric} trend`);
    } else if (newTrend === "down") {
      recommendations.push(`Address declining ${metric} immediately`);
    }

    recommendations.push(`Analyze factors contributing to trend change`);
    return recommendations;
  }

  private notifySubscribers(
    data: RealtimeInsight | RealtimeAlert | StreamingForecast
  ): void {
    for (const [channelId, callback] of this.subscribers) {
      try {
        callback(data);
      } catch (_error) {
        // Log error silently or implement proper error tracking
      }
    }
  }
}

// Export singleton instance
export const tacticalRealtimeEngine = new TacticalRealtimeEngine();
