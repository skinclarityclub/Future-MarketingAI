import { createClient } from "@/lib/supabase/client";

export interface IntelligentAlert {
  id: string;
  type:
    | "performance"
    | "business"
    | "security"
    | "anomaly"
    | "forecast"
    | "workflow";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  source: string;
  metric?: string;
  current_value?: number;
  expected_value?: number;
  threshold?: number;
  confidence: number;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
  auto_resolve: boolean;
  suggested_actions: string[];
  related_alerts: string[];
  notification_channels: (
    | "email"
    | "slack"
    | "telegram"
    | "dashboard"
    | "webhook"
  )[];
  metadata: Record<string, any>;
}

export interface AlertThreshold {
  metric: string;
  warning_min?: number;
  warning_max?: number;
  critical_min?: number;
  critical_max?: number;
  enabled: boolean;
  auto_resolve_timeout?: number; // minutes
}

export interface NotificationChannel {
  type: "email" | "slack" | "telegram" | "webhook" | "dashboard";
  config: {
    endpoint?: string;
    api_key?: string;
    recipients?: string[];
    template?: string;
  };
  enabled: boolean;
  severity_filter: ("low" | "medium" | "high" | "critical")[];
}

export interface IntelligentAlertConfig {
  enabled: boolean;
  update_interval_ms: number;
  max_alerts_per_hour: number;
  auto_acknowledge_duplicates: boolean;
  anomaly_detection: {
    enabled: boolean;
    sensitivity: number; // 1-10
    min_data_points: number;
    confidence_threshold: number;
  };
  notification_settings: {
    rate_limiting: boolean;
    batch_notifications: boolean;
    escalation_enabled: boolean;
    escalation_timeout_minutes: number;
  };
  ml_enhancement: {
    enabled: boolean;
    prediction_horizon_hours: number;
    pattern_learning: boolean;
    auto_threshold_adjustment: boolean;
  };
}

interface AnomalyResult {
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  current_value: number;
  expected_value: number;
  confidence: number;
  z_score: number;
  suggested_actions: string[];
}

export class IntelligentAlertManager {
  private config: IntelligentAlertConfig;
  private supabase = createClient();
  private activeAlerts = new Map<string, IntelligentAlert>();
  private alertHistory: IntelligentAlert[] = [];
  private thresholds = new Map<string, AlertThreshold>();
  private notificationChannels = new Map<string, NotificationChannel>();

  // Processing intervals
  private monitoringInterval?: NodeJS.Timeout;
  private cleanupInterval?: NodeJS.Timeout;

  // Alert rate limiting
  private alertCounts = new Map<string, number>();
  private lastAlertTime = new Map<string, number>();

  constructor(config?: Partial<IntelligentAlertConfig>) {
    this.config = {
      enabled: true,
      update_interval_ms: 30000, // 30 seconds
      max_alerts_per_hour: 100,
      auto_acknowledge_duplicates: true,
      anomaly_detection: {
        enabled: true,
        sensitivity: 7,
        min_data_points: 10,
        confidence_threshold: 0.8,
      },
      notification_settings: {
        rate_limiting: true,
        batch_notifications: true,
        escalation_enabled: true,
        escalation_timeout_minutes: 15,
      },
      ml_enhancement: {
        enabled: true,
        prediction_horizon_hours: 24,
        pattern_learning: true,
        auto_threshold_adjustment: true,
      },
      ...config,
    };

    this.initializeDefaultThresholds();
    this.initializeNotificationChannels();
  }

  /**
   * Start the intelligent alert monitoring system
   */
  public async start(): Promise<void> {
    if (!this.config.enabled) {
      console.log("Intelligent Alert Manager is disabled");
      return;
    }

    console.log("[Alert Manager] Starting Intelligent Alert Manager...");

    // Start monitoring interval
    this.monitoringInterval = setInterval(
      () => this.processAlerts(),
      this.config.update_interval_ms
    );

    // Start cleanup interval (every hour)
    this.cleanupInterval = setInterval(
      () => this.cleanupResolvedAlerts(),
      60 * 60 * 1000
    );

    // Load existing active alerts
    await this.loadActiveAlerts();

    console.log("[Alert Manager] Started successfully");
  }

  /**
   * Stop the intelligent alert monitoring system
   */
  public stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }

    console.log("[Alert Manager] Stopped");
  }

  /**
   * Main alert processing loop
   */
  private async processAlerts(): Promise<void> {
    try {
      // Collect alerts from all sources
      const alerts = await this.collectAlertsFromAllSources();

      // Process each alert through the intelligent pipeline
      for (const alert of alerts) {
        await this.processIntelligentAlert(alert);
      }

      // Perform ML-based analysis
      if (this.config.ml_enhancement.enabled) {
        await this.performMLAnalysis();
      }

      // Handle escalations
      if (this.config.notification_settings.escalation_enabled) {
        await this.handleEscalations();
      }
    } catch (error) {
      console.error("[Alert Manager] Error in alert processing:", error);
    }
  }

  /**
   * Collect alerts from all integrated sources
   */
  private async collectAlertsFromAllSources(): Promise<IntelligentAlert[]> {
    const collectedAlerts: IntelligentAlert[] = [];

    try {
      // Get realtime alerts
      const realtimeAlerts = await this.getRealtimeAlerts();
      collectedAlerts.push(...realtimeAlerts);

      // Get performance alerts
      const performanceAlerts = await this.getPerformanceAlerts();
      collectedAlerts.push(...performanceAlerts);

      // Get business metric alerts
      const businessAlerts = await this.getBusinessMetricAlerts();
      collectedAlerts.push(...businessAlerts);

      // Get workflow alerts
      const workflowAlerts = await this.getWorkflowAlerts();
      collectedAlerts.push(...workflowAlerts);
    } catch (error) {
      console.error(
        "[Alert Manager] Error collecting alerts from sources:",
        error
      );
    }

    return collectedAlerts;
  }

  /**
   * Get realtime metric alerts
   */
  private async getRealtimeAlerts(): Promise<IntelligentAlert[]> {
    const alerts: IntelligentAlert[] = [];

    try {
      // Get recent marketing data for anomaly detection
      const { data: marketingData, error } = await this.supabase
        .from("marketing_data")
        .select("*")
        .gte("date", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("date", { ascending: true });

      if (error || !marketingData) {
        return alerts;
      }

      // Analyze key metrics for anomalies
      const metrics = ["revenue", "impressions", "clicks", "conversions"];

      for (const metric of metrics) {
        const values = marketingData
          .map((d: any) => d[metric] || 0)
          .filter((v: number) => v > 0);
        if (values.length < 10) continue;

        const anomaly = this.detectStatisticalAnomaly(metric, values);
        if (anomaly) {
          const alert: IntelligentAlert = {
            id: `realtime_${metric}_${Date.now()}`,
            type: "anomaly",
            severity: anomaly.severity,
            title: `Anomaly detected in ${metric}`,
            message: anomaly.message,
            source: "realtime_monitor",
            metric,
            current_value: anomaly.current_value,
            expected_value: anomaly.expected_value,
            confidence: anomaly.confidence,
            timestamp: new Date().toISOString(),
            acknowledged: false,
            resolved: false,
            auto_resolve: true,
            suggested_actions: anomaly.suggested_actions,
            related_alerts: [],
            notification_channels: this.getNotificationChannelsForSeverity(
              anomaly.severity
            ),
            metadata: {
              detection_method: "statistical_analysis",
              data_points: values.length,
              z_score: anomaly.z_score,
            },
          };

          alerts.push(alert);
        }
      }
    } catch (error) {
      console.error("[Alert Manager] Error getting realtime alerts:", error);
    }

    return alerts;
  }

  /**
   * Get performance alerts
   */
  private async getPerformanceAlerts(): Promise<IntelligentAlert[]> {
    const alerts: IntelligentAlert[] = [];

    try {
      // Check API response times
      const { data: apiMetrics, error } = await this.supabase
        .from("system_metrics")
        .select("*")
        .gte("timestamp", new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .order("timestamp", { ascending: false })
        .limit(100);

      if (error || !apiMetrics) {
        return alerts;
      }

      // Analyze performance metrics
      const avgResponseTime =
        apiMetrics.reduce(
          (sum: number, m: any) => sum + (m.response_time || 0),
          0
        ) / apiMetrics.length;
      const errorRate =
        (apiMetrics.filter((m: any) => m.status_code >= 400).length /
          apiMetrics.length) *
        100;

      // Check response time threshold
      const responseThreshold = this.thresholds.get("response_time");
      if (
        responseThreshold?.enabled &&
        avgResponseTime > (responseThreshold.warning_max || 2000)
      ) {
        const severity =
          avgResponseTime > (responseThreshold.critical_max || 5000)
            ? "critical"
            : "high";

        alerts.push({
          id: `performance_response_${Date.now()}`,
          type: "performance",
          severity,
          title: "High response time detected",
          message: `Average response time is ${avgResponseTime.toFixed(0)}ms`,
          source: "performance_monitor",
          metric: "response_time",
          current_value: avgResponseTime,
          threshold: responseThreshold.warning_max,
          confidence: 0.95,
          timestamp: new Date().toISOString(),
          acknowledged: false,
          resolved: false,
          auto_resolve: true,
          suggested_actions: [
            "Check server resources",
            "Review database queries",
            "Analyze traffic patterns",
            "Consider scaling resources",
          ],
          related_alerts: [],
          notification_channels:
            this.getNotificationChannelsForSeverity(severity),
          metadata: {
            avg_response_time: avgResponseTime,
            sample_size: apiMetrics.length,
          },
        });
      }

      // Check error rate threshold
      const errorThreshold = this.thresholds.get("error_rate");
      if (
        errorThreshold?.enabled &&
        errorRate > (errorThreshold.warning_max || 5)
      ) {
        const severity =
          errorRate > (errorThreshold.critical_max || 10) ? "critical" : "high";

        alerts.push({
          id: `performance_error_${Date.now()}`,
          type: "performance",
          severity,
          title: "High error rate detected",
          message: `Error rate is ${errorRate.toFixed(1)}%`,
          source: "performance_monitor",
          metric: "error_rate",
          current_value: errorRate,
          threshold: errorThreshold.warning_max,
          confidence: 0.95,
          timestamp: new Date().toISOString(),
          acknowledged: false,
          resolved: false,
          auto_resolve: true,
          suggested_actions: [
            "Review error logs",
            "Check external dependencies",
            "Verify configuration",
            "Monitor user reports",
          ],
          related_alerts: [],
          notification_channels:
            this.getNotificationChannelsForSeverity(severity),
          metadata: {
            error_rate: errorRate,
            total_requests: apiMetrics.length,
          },
        });
      }
    } catch (error) {
      console.error("[Alert Manager] Error getting performance alerts:", error);
    }

    return alerts;
  }

  /**
   * Get business metric alerts
   */
  private async getBusinessMetricAlerts(): Promise<IntelligentAlert[]> {
    const alerts: IntelligentAlert[] = [];

    try {
      // Get today's business metrics
      const today = new Date().toISOString().split("T")[0];
      const { data: todayMetrics, error } = await this.supabase
        .from("daily_aggregates")
        .select("*")
        .eq("date", today)
        .single();

      if (error || !todayMetrics) {
        return alerts;
      }

      // Check revenue threshold
      const revenueThreshold = this.thresholds.get("revenue");
      if (
        revenueThreshold?.enabled &&
        todayMetrics.total_revenue < (revenueThreshold.warning_min || 1000)
      ) {
        const severity =
          todayMetrics.total_revenue < (revenueThreshold.critical_min || 500)
            ? "critical"
            : "medium";

        alerts.push({
          id: `business_revenue_${Date.now()}`,
          type: "business",
          severity,
          title: "Low revenue alert",
          message: `Today's revenue (${todayMetrics.total_revenue}) is below threshold`,
          source: "business_monitor",
          metric: "revenue",
          current_value: todayMetrics.total_revenue,
          threshold: revenueThreshold.warning_min,
          confidence: 0.9,
          timestamp: new Date().toISOString(),
          acknowledged: false,
          resolved: false,
          auto_resolve: false,
          suggested_actions: [
            "Review marketing campaigns",
            "Check conversion funnels",
            "Analyze traffic sources",
            "Consider promotional activities",
          ],
          related_alerts: [],
          notification_channels:
            this.getNotificationChannelsForSeverity(severity),
          metadata: {
            date: today,
            total_revenue: todayMetrics.total_revenue,
          },
        });
      }

      // Check conversion rate
      const conversionRate =
        (todayMetrics.total_conversions / todayMetrics.total_sessions) * 100;
      const conversionThreshold = this.thresholds.get("conversion_rate");

      if (
        conversionThreshold?.enabled &&
        conversionRate < (conversionThreshold.warning_min || 2)
      ) {
        const severity =
          conversionRate < (conversionThreshold.critical_min || 1)
            ? "critical"
            : "high";

        alerts.push({
          id: `business_conversion_${Date.now()}`,
          type: "business",
          severity,
          title: "Low conversion rate alert",
          message: `Conversion rate (${conversionRate.toFixed(2)}%) is below threshold`,
          source: "business_monitor",
          metric: "conversion_rate",
          current_value: conversionRate,
          threshold: conversionThreshold.warning_min,
          confidence: 0.85,
          timestamp: new Date().toISOString(),
          acknowledged: false,
          resolved: false,
          auto_resolve: false,
          suggested_actions: [
            "A/B test landing pages",
            "Review checkout process",
            "Analyze user behavior",
            "Optimize call-to-actions",
          ],
          related_alerts: [],
          notification_channels:
            this.getNotificationChannelsForSeverity(severity),
          metadata: {
            conversion_rate: conversionRate,
            conversions: todayMetrics.total_conversions,
            sessions: todayMetrics.total_sessions,
          },
        });
      }
    } catch (error) {
      console.error(
        "[Alert Manager] Error getting business metric alerts:",
        error
      );
    }

    return alerts;
  }

  /**
   * Get workflow alerts
   */
  private async getWorkflowAlerts(): Promise<IntelligentAlert[]> {
    const alerts: IntelligentAlert[] = [];

    try {
      // Check workflow executions in the last hour
      const { data: workflows, error } = await this.supabase
        .from("workflow_executions")
        .select("*")
        .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false });

      if (error || !workflows) {
        return alerts;
      }

      if (workflows.length > 0) {
        const failedWorkflows = workflows.filter(
          (w: any) => w.status === "failed"
        );
        const errorRate = (failedWorkflows.length / workflows.length) * 100;

        if (errorRate > 10) {
          // More than 10% failure rate
          const severity = errorRate > 30 ? "critical" : "high";

          alerts.push({
            id: `workflow_failure_${Date.now()}`,
            type: "workflow",
            severity,
            title: "High workflow failure rate",
            message: `${errorRate.toFixed(1)}% of workflows failed in the last hour`,
            source: "workflow_monitor",
            current_value: errorRate,
            threshold: 10,
            confidence: 0.95,
            timestamp: new Date().toISOString(),
            acknowledged: false,
            resolved: false,
            auto_resolve: false,
            suggested_actions: [
              "Check workflow configurations",
              "Review error logs",
              "Verify external integrations",
              "Check system resources",
            ],
            related_alerts: [],
            notification_channels:
              this.getNotificationChannelsForSeverity(severity),
            metadata: {
              failed_workflows: failedWorkflows.length,
              total_workflows: workflows.length,
              time_window: "1_hour",
            },
          });
        }
      }
    } catch (error) {
      console.error("[Alert Manager] Error getting workflow alerts:", error);
    }

    return alerts;
  }

  /**
   * Detect statistical anomalies in data
   */
  private detectStatisticalAnomaly(
    metric: string,
    values: number[]
  ): AnomalyResult | null {
    if (values.length < 10) return null;

    const currentValue = values[values.length - 1];
    const historicalValues = values.slice(0, -1);

    // Calculate statistical measures
    const mean =
      historicalValues.reduce((sum, val) => sum + val, 0) /
      historicalValues.length;
    const variance =
      historicalValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      historicalValues.length;
    const stdDev = Math.sqrt(variance);
    const zScore = Math.abs((currentValue - mean) / stdDev);

    // Check if anomaly detected
    const threshold = this.config.anomaly_detection.sensitivity / 2; // Convert 1-10 to 0.5-5

    if (zScore > threshold) {
      let severity: "low" | "medium" | "high" | "critical";

      if (zScore > threshold * 2) {
        severity = "critical";
      } else if (zScore > threshold * 1.5) {
        severity = "high";
      } else {
        severity = "medium";
      }

      return {
        severity,
        message: `${metric} value ${currentValue} deviates ${zScore.toFixed(2)} standard deviations from normal`,
        current_value: currentValue,
        expected_value: mean,
        confidence: Math.min(0.95, (zScore / threshold) * 0.5),
        z_score: zScore,
        suggested_actions: [
          `Investigate ${metric} patterns`,
          "Check for external factors",
          "Review recent changes",
          "Monitor trend continuation",
        ],
      };
    }

    return null;
  }

  /**
   * Process an intelligent alert through the pipeline
   */
  private async processIntelligentAlert(
    alert: IntelligentAlert
  ): Promise<void> {
    // Check for duplicates
    if (
      this.config.auto_acknowledge_duplicates &&
      this.isDuplicateAlert(alert)
    ) {
      return;
    }

    // Rate limiting
    if (
      this.config.notification_settings.rate_limiting &&
      this.isRateLimited(alert)
    ) {
      return;
    }

    // Store alert
    this.activeAlerts.set(alert.id, alert);
    this.alertHistory.push(alert);

    // Send notifications
    await this.sendNotifications(alert);

    // Update database
    await this.persistAlert(alert);

    console.log(
      `[Alert Manager] Processed alert: ${alert.title} (${alert.severity})`
    );
  }

  /**
   * Send notifications through configured channels
   */
  private async sendNotifications(alert: IntelligentAlert): Promise<void> {
    for (const channelType of alert.notification_channels) {
      const channel = this.notificationChannels.get(channelType);

      if (
        !channel?.enabled ||
        !channel.severity_filter.includes(alert.severity)
      ) {
        continue;
      }

      try {
        switch (channelType) {
          case "dashboard":
            await this.sendDashboardNotification(alert);
            break;
          case "email":
            console.log(`[Alert Manager] Email notification: ${alert.title}`);
            break;
          case "slack":
            console.log(`[Alert Manager] Slack notification: ${alert.title}`);
            break;
          case "telegram":
            console.log(
              `[Alert Manager] Telegram notification: ${alert.title}`
            );
            break;
          case "webhook":
            console.log(`[Alert Manager] Webhook notification: ${alert.title}`);
            break;
        }
      } catch (error) {
        console.error(
          `[Alert Manager] Error sending ${channelType} notification:`,
          error
        );
      }
    }
  }

  /**
   * Initialize default alert thresholds
   */
  private initializeDefaultThresholds(): void {
    const defaultThresholds: AlertThreshold[] = [
      {
        metric: "revenue",
        warning_min: 1000,
        critical_min: 500,
        enabled: true,
        auto_resolve_timeout: 60,
      },
      {
        metric: "conversion_rate",
        warning_min: 2.0,
        critical_min: 1.0,
        enabled: true,
        auto_resolve_timeout: 30,
      },
      {
        metric: "response_time",
        warning_max: 2000,
        critical_max: 5000,
        enabled: true,
        auto_resolve_timeout: 15,
      },
      {
        metric: "error_rate",
        warning_max: 5,
        critical_max: 10,
        enabled: true,
        auto_resolve_timeout: 10,
      },
    ];

    defaultThresholds.forEach(threshold => {
      this.thresholds.set(threshold.metric, threshold);
    });
  }

  /**
   * Initialize notification channels
   */
  private initializeNotificationChannels(): void {
    // Dashboard notifications (always enabled)
    this.notificationChannels.set("dashboard", {
      type: "dashboard",
      config: {},
      enabled: true,
      severity_filter: ["low", "medium", "high", "critical"],
    });

    // Email notifications
    if (process.env.NEXT_PUBLIC_ALERT_EMAIL_ENABLED === "true") {
      this.notificationChannels.set("email", {
        type: "email",
        config: {
          recipients: process.env.ALERT_EMAIL_RECIPIENTS?.split(",") || [],
        },
        enabled: true,
        severity_filter: ["medium", "high", "critical"],
      });
    }

    // Slack notifications
    if (process.env.SLACK_WEBHOOK_URL) {
      this.notificationChannels.set("slack", {
        type: "slack",
        config: {
          endpoint: process.env.SLACK_WEBHOOK_URL,
        },
        enabled: true,
        severity_filter: ["high", "critical"],
      });
    }

    // Telegram notifications
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      this.notificationChannels.set("telegram", {
        type: "telegram",
        config: {
          api_key: process.env.TELEGRAM_BOT_TOKEN,
          recipients: [process.env.TELEGRAM_CHAT_ID],
        },
        enabled: true,
        severity_filter: ["critical"],
      });
    }
  }

  private getNotificationChannelsForSeverity(
    severity: string
  ): ("email" | "slack" | "telegram" | "dashboard" | "webhook")[] {
    const channels: (
      | "email"
      | "slack"
      | "telegram"
      | "dashboard"
      | "webhook"
    )[] = ["dashboard"];

    switch (severity) {
      case "critical":
        channels.push("email", "slack", "telegram");
        break;
      case "high":
        channels.push("email", "slack");
        break;
      case "medium":
        channels.push("email");
        break;
      default:
        break;
    }

    return channels;
  }

  private isDuplicateAlert(alert: IntelligentAlert): boolean {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    return Array.from(this.activeAlerts.values()).some(
      existing =>
        existing.type === alert.type &&
        existing.metric === alert.metric &&
        existing.severity === alert.severity &&
        new Date(existing.timestamp).getTime() > oneHourAgo &&
        !existing.resolved
    );
  }

  private isRateLimited(alert: IntelligentAlert): boolean {
    const key = `${alert.type}_${alert.metric}`;
    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000;

    const lastAlert = this.lastAlertTime.get(key);
    if (!lastAlert || lastAlert < hourAgo) {
      this.alertCounts.set(key, 0);
    }

    const count = this.alertCounts.get(key) || 0;
    if (count >= this.config.max_alerts_per_hour) {
      return true;
    }

    this.alertCounts.set(key, count + 1);
    this.lastAlertTime.set(key, now);
    return false;
  }

  private async sendDashboardNotification(
    alert: IntelligentAlert
  ): Promise<void> {
    try {
      await this.supabase.from("realtime_alerts").insert([
        {
          alert_id: alert.id,
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
          message: alert.message,
          timestamp: alert.timestamp,
          acknowledged: alert.acknowledged,
          metadata: alert.metadata,
        },
      ]);
    } catch (error) {
      console.error(
        "[Alert Manager] Error sending dashboard notification:",
        error
      );
    }
  }

  private async performMLAnalysis(): Promise<void> {
    // Placeholder for ML-based pattern analysis
    console.log("[Alert Manager] Performing ML analysis...");
  }

  private async handleEscalations(): Promise<void> {
    // Placeholder for alert escalation logic
    console.log("[Alert Manager] Handling escalations...");
  }

  private async loadActiveAlerts(): Promise<void> {
    try {
      const { data: alerts, error } = await this.supabase
        .from("intelligent_alerts")
        .select("*")
        .eq("resolved", false);

      if (error) {
        console.error("[Alert Manager] Error loading active alerts:", error);
        return;
      }

      if (alerts) {
        alerts.forEach((alert: any) => {
          this.activeAlerts.set(alert.alert_id, {
            id: alert.alert_id,
            type: alert.type,
            severity: alert.severity,
            title: alert.title,
            message: alert.message,
            source: alert.source,
            metric: alert.metric,
            current_value: alert.current_value,
            expected_value: alert.expected_value,
            threshold: alert.threshold,
            confidence: alert.confidence,
            timestamp: alert.timestamp,
            acknowledged: alert.acknowledged,
            resolved: alert.resolved,
            auto_resolve: alert.auto_resolve,
            suggested_actions: alert.suggested_actions || [],
            related_alerts: alert.related_alerts || [],
            notification_channels: alert.notification_channels || ["dashboard"],
            metadata: alert.metadata || {},
          });
        });
      }
    } catch (error) {
      console.error("[Alert Manager] Error loading active alerts:", error);
    }
  }

  private async persistAlert(alert: IntelligentAlert): Promise<void> {
    try {
      await this.supabase.from("intelligent_alerts").upsert([
        {
          alert_id: alert.id,
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
          message: alert.message,
          source: alert.source,
          metric: alert.metric,
          current_value: alert.current_value,
          expected_value: alert.expected_value,
          threshold: alert.threshold,
          confidence: alert.confidence,
          timestamp: alert.timestamp,
          acknowledged: alert.acknowledged,
          resolved: alert.resolved,
          auto_resolve: alert.auto_resolve,
          suggested_actions: alert.suggested_actions,
          related_alerts: alert.related_alerts,
          notification_channels: alert.notification_channels,
          metadata: alert.metadata,
        },
      ]);
    } catch (error) {
      console.error("[Alert Manager] Error persisting alert:", error);
    }
  }

  private cleanupResolvedAlerts(): void {
    const resolvedAlerts = Array.from(this.activeAlerts.values()).filter(
      alert => alert.resolved
    );

    resolvedAlerts.forEach(alert => {
      this.activeAlerts.delete(alert.id);
    });

    if (resolvedAlerts.length > 0) {
      console.log(
        `[Alert Manager] Cleaned up ${resolvedAlerts.length} resolved alerts`
      );
    }
  }

  // Public API methods
  public getActiveAlerts(): IntelligentAlert[] {
    return Array.from(this.activeAlerts.values());
  }

  public async acknowledgeAlert(alertId: string): Promise<boolean> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) return false;

    alert.acknowledged = true;
    await this.persistAlert(alert);
    return true;
  }

  public async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) return false;

    alert.resolved = true;
    await this.persistAlert(alert);
    this.activeAlerts.delete(alertId);
    return true;
  }

  public async updateThreshold(
    metric: string,
    threshold: Partial<AlertThreshold>
  ): Promise<void> {
    const existing = this.thresholds.get(metric);
    if (existing) {
      this.thresholds.set(metric, { ...existing, ...threshold });
    }
  }

  public getAlertStatistics(): {
    total: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    acknowledged: number;
    resolved: number;
  } {
    const alerts = Array.from(this.activeAlerts.values());

    return {
      total: alerts.length,
      bySeverity: alerts.reduce(
        (acc, alert) => {
          acc[alert.severity] = (acc[alert.severity] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      byType: alerts.reduce(
        (acc, alert) => {
          acc[alert.type] = (acc[alert.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      acknowledged: alerts.filter(a => a.acknowledged).length,
      resolved: this.alertHistory.filter(a => a.resolved).length,
    };
  }
}

// Export singleton instance
export const intelligentAlertManager = new IntelligentAlertManager();
