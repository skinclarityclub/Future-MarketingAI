// Real-time Analytics Core
// Core analytics engine met real-time data processing

export type MetricType =
  | "ctr"
  | "engagement"
  | "reach"
  | "conversions"
  | "revenue";

export type TimeFrame = "5m" | "15m" | "1h" | "6h" | "24h" | "7d" | "30d";

export interface MetricDataPoint {
  timestamp: Date;
  value: number;
  metadata?: {
    source?: string;
    platform?: string;
    campaign?: string;
    contentId?: string;
    event?: string;
    [key: string]: any;
  };
}

export interface MetricDefinition {
  id: string;
  name: string;
  type: MetricType;
  description: string;
  unit: string;
  threshold?: {
    warning: number;
    critical: number;
    target?: number;
  };
  isRealTime: boolean;
}

export interface AnalyticsSnapshot {
  timestamp: Date;
  timeFrame: TimeFrame;
  metrics: Map<
    string,
    {
      current: number;
      previous: number;
      change: number;
      changePercent: number;
      trend: "up" | "down" | "stable";
      status: "good" | "warning" | "critical";
    }
  >;
  alerts: Alert[];
  performance: {
    totalEvents: number;
    processingLatency: number;
    throughput: number;
  };
}

export interface Alert {
  id: string;
  level: "info" | "warning" | "critical";
  metric: string;
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
}

export class RealTimeAnalyticsCore {
  private metrics: Map<string, MetricDefinition> = new Map();
  private dataPoints: Map<string, MetricDataPoint[]> = new Map();
  private alerts: Alert[] = [];
  private subscribers: Map<string, (snapshot: AnalyticsSnapshot) => void> =
    new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(
    private config: {
      updateIntervalMs: number;
      retentionPeriodMs: number;
      maxDataPointsPerMetric: number;
      enableRealTimeUpdates: boolean;
    }
  ) {
    this.initializeDefaultMetrics();

    if (config.enableRealTimeUpdates) {
      this.start();
    }
  }

  /**
   * Start real-time processing
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.updateInterval = setInterval(() => {
      this.processRealTimeUpdates();
    }, this.config.updateIntervalMs);

    console.log("Real-time analytics core gestart");
  }

  /**
   * Stop real-time processing
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    console.log("Real-time analytics core gestopt");
  }

  /**
   * Voeg metric data point toe
   */
  addDataPoint(metricId: string, dataPoint: MetricDataPoint): void {
    if (!this.metrics.has(metricId)) {
      throw new Error("Metric " + metricId + " not defined");
    }

    if (!this.dataPoints.has(metricId)) {
      this.dataPoints.set(metricId, []);
    }

    const points = this.dataPoints.get(metricId)!;
    points.push(dataPoint);

    // Sort by timestamp en limit aantal points
    points.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    if (points.length > this.config.maxDataPointsPerMetric) {
      points.splice(0, points.length - this.config.maxDataPointsPerMetric);
    }

    // Check voor alerts
    this.checkAlerts(metricId, dataPoint.value);

    // Trigger real-time update indien enabled
    if (
      this.config.enableRealTimeUpdates &&
      this.metrics.get(metricId)?.isRealTime
    ) {
      this.triggerRealTimeUpdate();
    }
  }

  /**
   * Krijg current analytics snapshot
   */
  getSnapshot(timeFrame: TimeFrame = "1h"): AnalyticsSnapshot {
    const snapshot: AnalyticsSnapshot = {
      timestamp: new Date(),
      timeFrame,
      metrics: new Map(),
      alerts: this.getActiveAlerts(),
      performance: {
        totalEvents: this.getTotalEventCount(),
        processingLatency: 50, // ms
        throughput: this.getCurrentThroughput(),
      },
    };

    // Calculate metrics
    for (const [metricId, metric] of this.metrics) {
      const currentPeriod = this.getTimeFrameData(metricId, timeFrame);
      const previousPeriod = this.getTimeFrameData(metricId, timeFrame, 1);

      const currentValue = this.calculateMetricValue(
        currentPeriod,
        metric.type
      );
      const previousValue = this.calculateMetricValue(
        previousPeriod,
        metric.type
      );

      const change = currentValue - previousValue;
      const changePercent =
        previousValue > 0 ? (change / previousValue) * 100 : 0;

      snapshot.metrics.set(metricId, {
        current: currentValue,
        previous: previousValue,
        change,
        changePercent,
        trend: change > 0 ? "up" : change < 0 ? "down" : "stable",
        status: this.getMetricStatus(metricId, currentValue),
      });
    }

    return snapshot;
  }

  /**
   * Subscribe to real-time updates
   */
  subscribe(id: string, callback: (snapshot: AnalyticsSnapshot) => void): void {
    this.subscribers.set(id, callback);
  }

  /**
   * Unsubscribe from real-time updates
   */
  unsubscribe(id: string): void {
    this.subscribers.delete(id);
  }

  /**
   * Registreer nieuwe metric
   */
  registerMetric(metric: MetricDefinition): void {
    this.metrics.set(metric.id, metric);
    this.dataPoints.set(metric.id, []);
  }

  /**
   * Krijg alle geregistreerde metrics
   */
  getMetrics(): MetricDefinition[] {
    return Array.from(this.metrics.values());
  }

  // Private helper methods

  private initializeDefaultMetrics(): void {
    // CTR Metric
    this.registerMetric({
      id: "ctr",
      name: "Click-Through Rate",
      type: "ctr",
      description: "Percentage van clicks vs impressions",
      unit: "%",
      threshold: { warning: 2.0, critical: 1.0, target: 3.2 },
      isRealTime: true,
    });

    // Engagement Rate
    this.registerMetric({
      id: "engagement_rate",
      name: "Engagement Rate",
      type: "engagement",
      description: "Percentage van interactions vs reach",
      unit: "%",
      threshold: { warning: 5.0, critical: 2.0, target: 12.0 },
      isRealTime: true,
    });

    // Conversions
    this.registerMetric({
      id: "conversions",
      name: "Conversions",
      type: "conversions",
      description: "Aantal conversies",
      unit: "count",
      threshold: { warning: 10, critical: 5, target: 50 },
      isRealTime: true,
    });

    // Revenue
    this.registerMetric({
      id: "revenue",
      name: "Revenue",
      type: "revenue",
      description: "Totale omzet",
      unit: "EUR",
      threshold: { warning: 1000, critical: 500, target: 5000 },
      isRealTime: true,
    });

    // Reach
    this.registerMetric({
      id: "reach",
      name: "Reach",
      type: "reach",
      description: "Aantal unieke gebruikers bereikt",
      unit: "count",
      threshold: { warning: 1000, critical: 500, target: 10000 },
      isRealTime: true,
    });
  }

  private processRealTimeUpdates(): void {
    // Cleanup old data
    this.cleanup();

    // Trigger snapshot update voor subscribers
    if (this.subscribers.size > 0) {
      const snapshot = this.getSnapshot();
      this.subscribers.forEach(callback => {
        try {
          callback(snapshot);
        } catch (error) {
          console.error("Error in analytics subscriber callback:", error);
        }
      });
    }
  }

  private triggerRealTimeUpdate(): void {
    // Debounced real-time update
    setTimeout(() => {
      if (this.subscribers.size > 0) {
        const snapshot = this.getSnapshot("5m");
        this.subscribers.forEach(callback => callback(snapshot));
      }
    }, 100);
  }

  private calculateMetricValue(
    dataPoints: MetricDataPoint[],
    metricType: MetricType
  ): number {
    if (dataPoints.length === 0) return 0;

    switch (metricType) {
      case "ctr":
        const clicks = dataPoints.filter(
          p => p.metadata?.event === "click"
        ).length;
        const impressions = dataPoints.filter(
          p => p.metadata?.event === "impression"
        ).length;
        return impressions > 0 ? (clicks / impressions) * 100 : 0;

      case "engagement":
        const interactions = dataPoints.filter(p =>
          ["like", "comment", "share", "save"].includes(p.metadata?.event || "")
        ).length;
        const reach = dataPoints.filter(
          p => p.metadata?.event === "reach"
        ).length;
        return reach > 0 ? (interactions / reach) * 100 : 0;

      case "conversions":
        return dataPoints.filter(p => p.metadata?.event === "conversion")
          .length;

      case "revenue":
        return dataPoints
          .filter(p => p.metadata?.event === "purchase")
          .reduce((sum, p) => sum + p.value, 0);

      case "reach":
        const uniqueUsers = new Set(dataPoints.map(p => p.metadata?.userId))
          .size;
        return uniqueUsers;

      default:
        return (
          dataPoints.reduce((sum, p) => sum + p.value, 0) / dataPoints.length
        );
    }
  }

  private getTimeFrameMs(timeFrame: TimeFrame): number {
    const timeFrameMap: Record<TimeFrame, number> = {
      "5m": 5 * 60 * 1000,
      "15m": 15 * 60 * 1000,
      "1h": 60 * 60 * 1000,
      "6h": 6 * 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    };
    return timeFrameMap[timeFrame];
  }

  private getTimeFrameData(
    metricId: string,
    timeFrame: TimeFrame,
    offset = 0
  ): MetricDataPoint[] {
    const points = this.dataPoints.get(metricId) || [];
    const timeFrameMs = this.getTimeFrameMs(timeFrame);
    const endTime = Date.now() - offset * timeFrameMs;
    const startTime = endTime - timeFrameMs;

    return points.filter(
      point =>
        point.timestamp.getTime() >= startTime &&
        point.timestamp.getTime() < endTime
    );
  }

  private checkAlerts(metricId: string, value: number): void {
    const metric = this.metrics.get(metricId);
    if (!metric?.threshold) return;

    const { warning, critical } = metric.threshold;
    let level: Alert["level"] | null = null;
    let message = "";

    if (value <= critical) {
      level = "critical";
      message = metric.name + " is kritiek laag: " + value + " " + metric.unit;
    } else if (value <= warning) {
      level = "warning";
      message =
        metric.name +
        " is onder waarschuwingsdrempel: " +
        value +
        " " +
        metric.unit;
    }

    if (level) {
      const alert: Alert = {
        id: metricId + "_" + Date.now(),
        level,
        metric: metricId,
        message,
        value,
        threshold: level === "critical" ? critical : warning,
        timestamp: new Date(),
        acknowledged: false,
      };

      this.alerts.push(alert);
    }
  }

  private getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolvedAt);
  }

  private getMetricStatus(
    metricId: string,
    value: number
  ): "good" | "warning" | "critical" {
    const metric = this.metrics.get(metricId);
    if (!metric?.threshold) return "good";

    const { warning, critical } = metric.threshold;

    if (value <= critical) return "critical";
    if (value <= warning) return "warning";
    return "good";
  }

  private getTotalEventCount(): number {
    return Array.from(this.dataPoints.values()).reduce(
      (total, points) => total + points.length,
      0
    );
  }

  private getCurrentThroughput(): number {
    // Events per second in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    let recentEvents = 0;

    for (const points of this.dataPoints.values()) {
      recentEvents += points.filter(p => p.timestamp > fiveMinutesAgo).length;
    }

    return recentEvents / 300; // events per second
  }

  private cleanup(): void {
    const cutoffTime = new Date(Date.now() - this.config.retentionPeriodMs);

    for (const [metricId, points] of this.dataPoints) {
      const filteredPoints = points.filter(
        point => point.timestamp > cutoffTime
      );
      this.dataPoints.set(metricId, filteredPoints);
    }

    // Clean up resolved alerts
    this.alerts = this.alerts.filter(
      alert => !alert.resolvedAt || alert.resolvedAt > cutoffTime
    );
  }
}

/**
 * Factory function voor real-time analytics core
 */
export function createRealTimeAnalyticsCore(
  config?: Partial<{
    updateIntervalMs: number;
    retentionPeriodMs: number;
    maxDataPointsPerMetric: number;
    enableRealTimeUpdates: boolean;
  }>
): RealTimeAnalyticsCore {
  const defaultConfig = {
    updateIntervalMs: 5000, // 5 seconds
    retentionPeriodMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxDataPointsPerMetric: 10000,
    enableRealTimeUpdates: true,
  };

  return new RealTimeAnalyticsCore({ ...defaultConfig, ...config });
}
