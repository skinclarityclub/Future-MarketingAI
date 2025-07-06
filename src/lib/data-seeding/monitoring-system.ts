/**
 * Enhanced Monitoring System
 * Task 72.8: Implementeer continue data enrichment en performance benchmarking
 */

import { createClient } from "@supabase/supabase-js";

export interface MonitoringMetrics {
  timestamp: string;
  system_health: "healthy" | "warning" | "critical";
  performance_metrics: {
    response_time_ms: number;
    throughput_rps: number;
    error_rate_percentage: number;
    cpu_usage_percentage: number;
    memory_usage_mb: number;
  };
  business_metrics: {
    data_processed_count: number;
    enrichment_success_rate: number;
    ml_prediction_accuracy: number;
  };
  quality_metrics: {
    data_quality_score: number;
    enrichment_quality_score: number;
  };
}

export interface Alert {
  alert_id: string;
  alert_name: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  triggered_at: string;
  status: "active" | "resolved";
  affected_components: string[];
}

export interface AlertRule {
  rule_id: string;
  rule_name: string;
  metric_path: string;
  condition: "greater_than" | "less_than";
  threshold_value: number;
  severity: "low" | "medium" | "high" | "critical";
  enabled: boolean;
}

export class MonitoringSystem {
  private supabase: any;
  private metrics: MonitoringMetrics[];
  private alerts: Map<string, Alert>;
  private alertRules: Map<string, AlertRule>;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    this.metrics = [];
    this.alerts = new Map();
    this.alertRules = new Map();

    this.initializeDefaultAlertRules();
  }

  private initializeDefaultAlertRules(): void {
    const defaultRules: AlertRule[] = [
      {
        rule_id: "high_response_time",
        rule_name: "High Response Time",
        metric_path: "performance_metrics.response_time_ms",
        condition: "greater_than",
        threshold_value: 2000,
        severity: "high",
        enabled: true,
      },
      {
        rule_id: "high_error_rate",
        rule_name: "High Error Rate",
        metric_path: "performance_metrics.error_rate_percentage",
        condition: "greater_than",
        threshold_value: 5,
        severity: "critical",
        enabled: true,
      },
      {
        rule_id: "low_data_quality",
        rule_name: "Low Data Quality",
        metric_path: "quality_metrics.data_quality_score",
        condition: "less_than",
        threshold_value: 0.8,
        severity: "medium",
        enabled: true,
      },
    ];

    for (const rule of defaultRules) {
      this.alertRules.set(rule.rule_id, rule);
    }
  }

  async startRealTimeMonitoring(): Promise<void> {
    if (this.monitoringInterval) {
      console.log("[MonitoringSystem] Monitoring already running");
      return;
    }

    console.log("[MonitoringSystem] Starting real-time monitoring");

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.collectMetrics();
        await this.evaluateAlerts();
      } catch (error) {
        console.error("[MonitoringSystem] Error in monitoring cycle:", error);
      }
    }, 30000); // 30 seconds
  }

  async stopRealTimeMonitoring(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log("[MonitoringSystem] Monitoring stopped");
    }
  }

  async collectMetrics(): Promise<MonitoringMetrics> {
    const timestamp = new Date().toISOString();

    // Mock metrics collection
    const metrics: MonitoringMetrics = {
      timestamp,
      system_health: this.calculateSystemHealth(),
      performance_metrics: {
        response_time_ms: Math.random() * 1000 + 200,
        throughput_rps: Math.random() * 100 + 20,
        error_rate_percentage: Math.random() * 3,
        cpu_usage_percentage: Math.random() * 60 + 20,
        memory_usage_mb: Math.random() * 2000 + 500,
      },
      business_metrics: {
        data_processed_count: Math.floor(Math.random() * 1000) + 500,
        enrichment_success_rate: Math.random() * 0.15 + 0.85,
        ml_prediction_accuracy: Math.random() * 0.2 + 0.8,
      },
      quality_metrics: {
        data_quality_score: Math.random() * 0.2 + 0.8,
        enrichment_quality_score: Math.random() * 0.15 + 0.85,
      },
    };

    this.metrics.push(metrics);

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    await this.storeMetrics(metrics);
    return metrics;
  }

  private calculateSystemHealth(): "healthy" | "warning" | "critical" {
    if (this.metrics.length < 3) return "healthy";

    const recent = this.metrics.slice(-3);
    const avgErrorRate =
      recent.reduce(
        (sum, m) => sum + m.performance_metrics.error_rate_percentage,
        0
      ) / 3;
    const avgResponseTime =
      recent.reduce(
        (sum, m) => sum + m.performance_metrics.response_time_ms,
        0
      ) / 3;

    if (avgErrorRate > 5 || avgResponseTime > 2000) return "critical";
    if (avgErrorRate > 2 || avgResponseTime > 1000) return "warning";
    return "healthy";
  }

  private async evaluateAlerts(): Promise<void> {
    if (this.metrics.length === 0) return;

    const latestMetrics = this.metrics[this.metrics.length - 1];

    for (const rule of this.alertRules.values()) {
      if (!rule.enabled) continue;

      try {
        const shouldTrigger = this.evaluateRule(rule, latestMetrics);

        if (shouldTrigger) {
          await this.triggerAlert(rule, latestMetrics);
        }
      } catch (error) {
        console.error(
          `[MonitoringSystem] Error evaluating rule ${rule.rule_id}:`,
          error
        );
      }
    }
  }

  private evaluateRule(rule: AlertRule, metrics: MonitoringMetrics): boolean {
    const value = this.getMetricValue(rule.metric_path, metrics);

    switch (rule.condition) {
      case "greater_than":
        return value > rule.threshold_value;
      case "less_than":
        return value < rule.threshold_value;
      default:
        return false;
    }
  }

  private getMetricValue(
    metricPath: string,
    metrics: MonitoringMetrics
  ): number {
    const pathParts = metricPath.split(".");
    let value: any = metrics;

    for (const part of pathParts) {
      if (value && typeof value === "object" && part in value) {
        value = value[part];
      } else {
        throw new Error(`Metric path not found: ${metricPath}`);
      }
    }

    return typeof value === "number" ? value : 0;
  }

  private async triggerAlert(
    rule: AlertRule,
    metrics: MonitoringMetrics
  ): Promise<void> {
    // Check if alert already exists
    const existingAlert = Array.from(this.alerts.values()).find(
      alert => alert.alert_name === rule.rule_name && alert.status === "active"
    );

    if (existingAlert) return; // Alert already active

    const alertId = `alert_${Date.now()}`;
    const alert: Alert = {
      alert_id: alertId,
      alert_name: rule.rule_name,
      severity: rule.severity,
      message: this.generateAlertMessage(rule, metrics),
      triggered_at: new Date().toISOString(),
      status: "active",
      affected_components: this.getAffectedComponents(rule),
    };

    this.alerts.set(alertId, alert);
    await this.storeAlert(alert);

    console.log(
      `[MonitoringSystem] Alert triggered: ${alert.alert_name} (${alert.severity})`
    );
  }

  private generateAlertMessage(
    rule: AlertRule,
    metrics: MonitoringMetrics
  ): string {
    const currentValue = this.getMetricValue(rule.metric_path, metrics);
    return `${rule.rule_name}: Current value ${currentValue} exceeds threshold ${rule.threshold_value}`;
  }

  private getAffectedComponents(rule: AlertRule): string[] {
    const componentMap: { [key: string]: string[] } = {
      high_response_time: ["API_Gateway", "ML_Engines"],
      high_error_rate: ["API_Gateway", "Database"],
      low_data_quality: ["EnrichmentEngine", "DataValidation"],
    };

    return componentMap[rule.rule_id] || ["System"];
  }

  private async storeMetrics(metrics: MonitoringMetrics): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("monitoring_metrics")
        .insert(metrics);

      if (error) {
        console.error("[MonitoringSystem] Error storing metrics:", error);
      }
    } catch (error) {
      console.error("[MonitoringSystem] Error in storeMetrics:", error);
    }
  }

  private async storeAlert(alert: Alert): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("monitoring_alerts")
        .insert(alert);

      if (error) {
        console.error("[MonitoringSystem] Error storing alert:", error);
      }
    } catch (error) {
      console.error("[MonitoringSystem] Error in storeAlert:", error);
    }
  }

  // Public API methods
  getCurrentMetrics(): MonitoringMetrics | null {
    return this.metrics.length > 0
      ? this.metrics[this.metrics.length - 1]
      : null;
  }

  getMetricsHistory(hours: number = 24): MonitoringMetrics[] {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metrics.filter(
      metrics => new Date(metrics.timestamp) > cutoffTime
    );
  }

  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(
      alert => alert.status === "active"
    );
  }

  async resolveAlert(alertId: string): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (alert && alert.status === "active") {
      alert.status = "resolved";
      await this.storeAlert(alert);
      console.log(`[MonitoringSystem] Alert resolved: ${alert.alert_name}`);
    }
  }

  getAlertRules(): AlertRule[] {
    return Array.from(this.alertRules.values());
  }

  async addAlertRule(rule: AlertRule): Promise<void> {
    this.alertRules.set(rule.rule_id, rule);
    console.log(`[MonitoringSystem] Alert rule added: ${rule.rule_name}`);
  }

  async updateAlertRule(
    ruleId: string,
    updates: Partial<AlertRule>
  ): Promise<void> {
    const rule = this.alertRules.get(ruleId);
    if (rule) {
      const updatedRule = { ...rule, ...updates };
      this.alertRules.set(ruleId, updatedRule);
      console.log(
        `[MonitoringSystem] Alert rule updated: ${updatedRule.rule_name}`
      );
    }
  }

  async getSystemHealthSummary(): Promise<{
    overall_status: "healthy" | "warning" | "critical";
    active_alerts_count: number;
    last_updated: string;
  }> {
    const currentMetrics = this.getCurrentMetrics();
    const activeAlertsCount = this.getActiveAlerts().length;

    return {
      overall_status: currentMetrics ? currentMetrics.system_health : "warning",
      active_alerts_count: activeAlertsCount,
      last_updated: currentMetrics
        ? currentMetrics.timestamp
        : new Date().toISOString(),
    };
  }

  async getAllMetrics(): Promise<MonitoringMetrics[]> {
    try {
      const { data, error } = await this.supabase
        .from("monitoring_metrics")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(1000);

      if (error) {
        console.error("[MonitoringSystem] Error fetching metrics:", error);
        return this.metrics;
      }

      return data || this.metrics;
    } catch (error) {
      console.error("[MonitoringSystem] Error in getAllMetrics:", error);
      return this.metrics;
    }
  }

  async getAllAlerts(): Promise<Alert[]> {
    try {
      const { data, error } = await this.supabase
        .from("monitoring_alerts")
        .select("*")
        .order("triggered_at", { ascending: false });

      if (error) {
        console.error("[MonitoringSystem] Error fetching alerts:", error);
        return Array.from(this.alerts.values());
      }

      return data || Array.from(this.alerts.values());
    } catch (error) {
      console.error("[MonitoringSystem] Error in getAllAlerts:", error);
      return Array.from(this.alerts.values());
    }
  }
}
