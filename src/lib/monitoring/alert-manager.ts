import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export type AlertSeverity = "low" | "medium" | "high" | "critical";

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  service_name?: string;
  metric_type?: string;
  condition: {
    operator: "greater_than" | "less_than" | "equals";
    threshold: number;
    duration_minutes: number;
    evaluation_window_minutes: number;
  };
  severity: AlertSeverity;
  enabled: boolean;
}

export interface SystemAlert {
  id?: string;
  alert_type: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  source_service?: string;
  source_metric_id?: string;
  status: "active" | "acknowledged" | "resolved" | "dismissed";
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_by?: string;
  resolved_at?: string;
  auto_resolve: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  channel: "email" | "slack" | "webhook" | "in_app";
  template: string;
  enabled: boolean;
}

export interface EscalationLevel {
  level: number;
  delay_minutes: number;
  recipients: string[];
  channels: ("email" | "slack" | "in_app")[];
}

export interface AlertStatistics {
  total_alerts: number;
  active_alerts: number;
  resolved_alerts: number;
  by_severity: Record<AlertSeverity, number>;
  avg_resolution_time_minutes: number;
  escalations_triggered: number;
}

export class AlertManager {
  private alertRules: Map<string, AlertRule> = new Map();
  private notificationTemplates: Map<string, NotificationTemplate> = new Map();
  private escalationLevels: EscalationLevel[] = [];
  private evaluationInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor() {
    this.initializeDefaultAlertRules();
    this.initializeNotificationTemplates();
    this.initializeEscalationLevels();
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultAlertRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: "high_response_time",
        name: "High API Response Time",
        description:
          "Alert when API response time exceeds acceptable threshold",
        service_name: "dashboard_api",
        metric_type: "response_time",
        condition: {
          operator: "greater_than",
          threshold: 2000,
          duration_minutes: 3,
          evaluation_window_minutes: 10,
        },
        severity: "high",
        enabled: true,
      },
      {
        id: "critical_response_time",
        name: "Critical API Response Time",
        description: "Alert when API response time reaches critical levels",
        service_name: "dashboard_api",
        metric_type: "response_time",
        condition: {
          operator: "greater_than",
          threshold: 5000,
          duration_minutes: 1,
          evaluation_window_minutes: 5,
        },
        severity: "critical",
        enabled: true,
      },
      {
        id: "high_cpu_usage",
        name: "High CPU Usage",
        description: "Alert when CPU usage is consistently high",
        metric_type: "cpu_usage",
        condition: {
          operator: "greater_than",
          threshold: 85,
          duration_minutes: 5,
          evaluation_window_minutes: 15,
        },
        severity: "medium",
        enabled: true,
      },
      {
        id: "critical_memory_usage",
        name: "Critical Memory Usage",
        description: "Alert when memory usage reaches critical levels",
        metric_type: "memory_usage",
        condition: {
          operator: "greater_than",
          threshold: 90,
          duration_minutes: 2,
          evaluation_window_minutes: 8,
        },
        severity: "critical",
        enabled: true,
      },
      {
        id: "service_downtime",
        name: "Service Downtime",
        description: "Alert when service uptime drops significantly",
        metric_type: "uptime",
        condition: {
          operator: "less_than",
          threshold: 98.0,
          duration_minutes: 2,
          evaluation_window_minutes: 5,
        },
        severity: "critical",
        enabled: true,
      },
      {
        id: "high_error_rate",
        name: "High Error Rate",
        description: "Alert when error rate exceeds acceptable levels",
        metric_type: "error_rate",
        condition: {
          operator: "greater_than",
          threshold: 3,
          duration_minutes: 5,
          evaluation_window_minutes: 15,
        },
        severity: "high",
        enabled: true,
      },
    ];

    defaultRules.forEach(rule => {
      this.alertRules.set(rule.id, rule);
    });
  }

  /**
   * Initialize notification templates
   */
  private initializeNotificationTemplates(): void {
    const templates: NotificationTemplate[] = [
      {
        id: "email_critical",
        name: "Critical Alert Email",
        channel: "email",
        template: `
🚨 CRITICAL ALERT: {{title}}

Service: {{service_name}}
Description: {{description}}
Current Value: {{current_value}}
Threshold: {{threshold}}
Time: {{timestamp}}

Please investigate immediately.
        `,
        enabled: true,
      },
      {
        id: "slack_general",
        name: "General Slack Alert",
        channel: "slack",
        template: `
⚠️ ALERT: {{title}}
{{description}}
Severity: {{severity}}
Service: {{service_name}}
        `,
        enabled: true,
      },
      {
        id: "in_app_notification",
        name: "In-App Notification",
        channel: "in_app",
        template: `{{title}}: {{description}}`,
        enabled: true,
      },
    ];

    templates.forEach(template => {
      this.notificationTemplates.set(template.id, template);
    });
  }

  /**
   * Initialize escalation levels
   */
  private initializeEscalationLevels(): void {
    this.escalationLevels = [
      {
        level: 1,
        delay_minutes: 0,
        recipients: ["on-call@company.com"],
        channels: ["in_app", "email"],
      },
      {
        level: 2,
        delay_minutes: 15,
        recipients: ["team-lead@company.com", "ops-manager@company.com"],
        channels: ["email", "slack"],
      },
      {
        level: 3,
        delay_minutes: 45,
        recipients: ["engineering-director@company.com"],
        channels: ["email"],
      },
    ];
  }

  /**
   * Start the alert monitoring system
   */
  start(intervalMs: number = 60000): void {
    if (this.isRunning) {
      console.warn("Alert manager is already running");
      return;
    }

    this.isRunning = true;
    console.log("Starting alert manager...");

    // Start periodic evaluation
    this.evaluationInterval = setInterval(async () => {
      await this.evaluateAllRules();
    }, intervalMs);
  }

  /**
   * Stop the alert monitoring system
   */
  stop(): void {
    if (this.evaluationInterval) {
      clearInterval(this.evaluationInterval);
      this.evaluationInterval = null;
    }

    this.isRunning = false;
    console.log("Alert manager stopped");
  }

  /**
   * Evaluate all enabled alert rules
   */
  private async evaluateAllRules(): Promise<void> {
    try {
      console.log("Evaluating alert rules...");

      for (const rule of this.alertRules.values()) {
        if (!rule.enabled) continue;
        await this.evaluateRule(rule);
      }
    } catch (error) {
      console.error("Error evaluating alert rules:", error);
    }
  }

  /**
   * Evaluate a specific alert rule
   */
  private async evaluateRule(rule: AlertRule): Promise<void> {
    try {
      const windowStart = new Date(
        Date.now() - rule.condition.evaluation_window_minutes * 60 * 1000
      );

      // Build query for metrics
      let query = supabase
        .from("system_health_metrics")
        .select("*")
        .gte("timestamp", windowStart.toISOString())
        .order("timestamp", { ascending: false });

      if (rule.metric_type) {
        query = query.eq("metric_type", rule.metric_type);
      }

      if (rule.service_name) {
        query = query.eq("service_name", rule.service_name);
      }

      const { data: metrics, error } = await query;

      if (error) {
        console.error("Error fetching metrics for rule evaluation:", error);
        return;
      }

      if (!metrics || metrics.length === 0) {
        console.log(`No metrics found for rule ${rule.id}`);
        return;
      }

      // Check if condition is met
      const conditionMet = this.evaluateCondition(metrics, rule.condition);

      if (conditionMet) {
        // Check if alert already exists
        const existingAlert = await this.findExistingActiveAlert(rule);

        if (!existingAlert) {
          console.log(`Creating alert for rule: ${rule.id}`);
          await this.createAlert(rule, metrics[0]);
        } else {
          console.log(`Alert already exists for rule: ${rule.id}`);
        }
      } else {
        // Auto-resolve existing alerts if condition is no longer met
        await this.autoResolveAlerts(rule);
      }
    } catch (error) {
      console.error(`Error evaluating rule ${rule.id}:`, error);
    }
  }

  /**
   * Evaluate if alert condition is met
   */
  private evaluateCondition(
    metrics: any[],
    condition: AlertRule["condition"]
  ): boolean {
    if (metrics.length === 0) return false;

    const now = Date.now();
    const durationMs = condition.duration_minutes * 60 * 1000;
    const cutoffTime = now - durationMs;

    // Filter metrics within the duration window
    const recentMetrics = metrics.filter(
      metric => new Date(metric.timestamp).getTime() >= cutoffTime
    );

    if (recentMetrics.length === 0) return false;

    // Check if condition is continuously met for the duration
    return recentMetrics.every(metric => {
      switch (condition.operator) {
        case "greater_than":
          return metric.metric_value > condition.threshold;
        case "less_than":
          return metric.metric_value < condition.threshold;
        case "equals":
          return metric.metric_value === condition.threshold;
        default:
          return false;
      }
    });
  }

  /**
   * Find existing active alert for a rule
   */
  private async findExistingActiveAlert(
    rule: AlertRule
  ): Promise<SystemAlert | null> {
    try {
      const { data, error } = await supabase
        .from("system_alerts")
        .select("*")
        .eq("alert_type", rule.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error finding existing alert:", error);
        return null;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error("Error finding existing alert:", error);
      return null;
    }
  }

  /**
   * Create a new alert
   */
  private async createAlert(
    rule: AlertRule,
    triggerMetric: any
  ): Promise<void> {
    try {
      const alertData: Omit<SystemAlert, "id" | "created_at" | "updated_at"> = {
        alert_type: rule.id,
        severity: rule.severity,
        title: rule.name,
        description: this.generateAlertDescription(rule, triggerMetric),
        source_service: rule.service_name,
        source_metric_id: triggerMetric.id,
        status: "active",
        auto_resolve: this.shouldAutoResolve(rule),
      };

      const { data: createdAlert, error } = await supabase
        .from("system_alerts")
        .insert([alertData])
        .select()
        .single();

      if (error) {
        console.error("Error creating alert:", error);
        return;
      }

      console.log("Alert created successfully:", createdAlert);

      // Send notifications
      await this.sendNotifications(createdAlert, rule, triggerMetric);
    } catch (error) {
      console.error("Error creating alert:", error);
    }
  }

  /**
   * Generate alert description
   */
  private generateAlertDescription(rule: AlertRule, metric: any): string {
    const servicePart = rule.service_name ? `${rule.service_name}: ` : "";
    const metricPart = rule.metric_type ? `${rule.metric_type} ` : "";
    const operatorText = this.getOperatorText(rule.condition.operator);
    const thresholdPart = `${rule.condition.threshold}${metric.unit || ""}`;
    const currentValue = `${metric.metric_value}${metric.unit || ""}`;

    return `${servicePart}${metricPart}${operatorText} ${thresholdPart}. Current: ${currentValue}`;
  }

  /**
   * Get human-readable operator text
   */
  private getOperatorText(operator: string): string {
    switch (operator) {
      case "greater_than":
        return "exceeded threshold of";
      case "less_than":
        return "dropped below threshold of";
      case "equals":
        return "equals threshold of";
      default:
        return "met condition for";
    }
  }

  /**
   * Determine if alert should auto-resolve
   */
  private shouldAutoResolve(rule: AlertRule): boolean {
    // Auto-resolve performance metrics when condition is no longer met
    const autoResolveMetrics = [
      "response_time",
      "cpu_usage",
      "memory_usage",
      "error_rate",
    ];
    return autoResolveMetrics.includes(rule.metric_type || "");
  }

  /**
   * Send notifications for an alert
   */
  private async sendNotifications(
    alert: SystemAlert,
    rule: AlertRule,
    metric: any
  ): Promise<void> {
    try {
      // Always send in-app notification
      await this.sendInAppNotification(alert);

      // Send email for high/critical alerts
      if (alert.severity === "high" || alert.severity === "critical") {
        await this.sendEmailNotification(alert, rule, metric);
      }

      // Send Slack for critical alerts
      if (alert.severity === "critical") {
        await this.sendSlackNotification(alert, rule, metric);
      }
    } catch (error) {
      console.error("Error sending notifications:", error);
    }
  }

  /**
   * Send in-app notification
   */
  private async sendInAppNotification(alert: SystemAlert): Promise<void> {
    try {
      const template = this.notificationTemplates.get("in_app_notification");
      if (!template || !template.enabled) return;

      const message = this.renderTemplate(template.template, alert);

      console.log("📱 In-App Notification:", {
        title: alert.title,
        message,
        severity: alert.severity,
        alert_id: alert.id,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error sending in-app notification:", error);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    alert: SystemAlert,
    rule: AlertRule,
    metric: any
  ): Promise<void> {
    try {
      const template = this.notificationTemplates.get("email_critical");
      if (!template || !template.enabled) return;

      const emailBody = this.renderTemplate(template.template, {
        ...alert,
        current_value: `${metric.metric_value}${metric.unit || ""}`,
        threshold: `${rule.condition.threshold}${metric.unit || ""}`,
        timestamp: new Date().toISOString(),
      });

      console.log("📧 Email Notification:", {
        to: ["ops-team@company.com", "alerts@company.com"],
        subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
        body: emailBody,
        alert_id: alert.id,
      });
    } catch (error) {
      console.error("Error sending email notification:", error);
    }
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(
    alert: SystemAlert,
    rule: AlertRule,
    metric: any
  ): Promise<void> {
    try {
      const template = this.notificationTemplates.get("slack_general");
      if (!template || !template.enabled) return;

      const slackMessage = this.renderTemplate(template.template, alert);

      console.log("💬 Slack Notification:", {
        channel: "#critical-alerts",
        text: slackMessage,
        attachments: [
          {
            color: this.getSeverityColor(alert.severity),
            fields: [
              {
                title: "Service",
                value: alert.source_service || "Unknown",
                short: true,
              },
              {
                title: "Current Value",
                value: `${metric.metric_value}${metric.unit || ""}`,
                short: true,
              },
              {
                title: "Threshold",
                value: `${rule.condition.threshold}${metric.unit || ""}`,
                short: true,
              },
              {
                title: "Time",
                value: new Date().toISOString(),
                short: true,
              },
            ],
          },
        ],
      });
    } catch (error) {
      console.error("Error sending Slack notification:", error);
    }
  }

  /**
   * Render notification template with data
   */
  private renderTemplate(template: string, data: any): string {
    let rendered = template;

    Object.keys(data).forEach(key => {
      const value = data[key] || "N/A";
      rendered = rendered.replace(new RegExp(`{{${key}}}`, "g"), value);
    });

    return rendered;
  }

  /**
   * Get color for severity level
   */
  private getSeverityColor(severity: AlertSeverity): string {
    switch (severity) {
      case "low":
        return "#36a64f";
      case "medium":
        return "#ffb347";
      case "high":
        return "#ff6b47";
      case "critical":
        return "#ff0000";
      default:
        return "#808080";
    }
  }

  /**
   * Auto-resolve alerts when condition is no longer met
   */
  private async autoResolveAlerts(rule: AlertRule): Promise<void> {
    try {
      const { data: activeAlerts, error } = await supabase
        .from("system_alerts")
        .select("*")
        .eq("alert_type", rule.id)
        .eq("status", "active")
        .eq("auto_resolve", true);

      if (error || !activeAlerts || activeAlerts.length === 0) return;

      for (const alert of activeAlerts) {
        await this.resolveAlert(
          alert.id,
          "system",
          "Condition no longer met - auto-resolved"
        );
        console.log(`Auto-resolved alert: ${alert.id}`);
      }
    } catch (error) {
      console.error("Error auto-resolving alerts:", error);
    }
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(
    alertId: string,
    acknowledgedBy: string,
    notes?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("system_alerts")
        .update({
          status: "acknowledged",
          acknowledged_by: acknowledgedBy,
          acknowledged_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", alertId);

      if (error) {
        console.error("Error acknowledging alert:", error);
        return false;
      }

      console.log(`Alert acknowledged: ${alertId} by ${acknowledgedBy}`);
      return true;
    } catch (error) {
      console.error("Error acknowledging alert:", error);
      return false;
    }
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(
    alertId: string,
    resolvedBy: string,
    resolutionNotes?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("system_alerts")
        .update({
          status: "resolved",
          resolved_by: resolvedBy,
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", alertId);

      if (error) {
        console.error("Error resolving alert:", error);
        return false;
      }

      console.log(`Alert resolved: ${alertId} by ${resolvedBy}`);
      return true;
    } catch (error) {
      console.error("Error resolving alert:", error);
      return false;
    }
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts(): Promise<SystemAlert[]> {
    try {
      const { data, error } = await supabase
        .from("system_alerts")
        .select("*")
        .eq("status", "active")
        .order("severity", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error getting active alerts:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error getting active alerts:", error);
      return [];
    }
  }

  /**
   * Get alert statistics
   */
  async getAlertStatistics(
    timeRange: "1h" | "24h" | "7d" | "30d" = "24h"
  ): Promise<AlertStatistics> {
    try {
      const timeRangeMs = {
        "1h": 60 * 60 * 1000,
        "24h": 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000,
        "30d": 30 * 24 * 60 * 60 * 1000,
      };

      const startTime = new Date(
        Date.now() - timeRangeMs[timeRange]
      ).toISOString();

      const { data: alerts, error } = await supabase
        .from("system_alerts")
        .select("*")
        .gte("created_at", startTime);

      if (error) {
        console.error("Error getting alert statistics:", error);
        return this.getEmptyStatistics();
      }

      const stats: AlertStatistics = {
        total_alerts: alerts?.length || 0,
        active_alerts: alerts?.filter(a => a.status === "active").length || 0,
        resolved_alerts:
          alerts?.filter(a => a.status === "resolved").length || 0,
        by_severity: { low: 0, medium: 0, high: 0, critical: 0 },
        avg_resolution_time_minutes: 0,
        escalations_triggered: 0,
      };

      // Calculate severity distribution
      alerts?.forEach(alert => {
        stats.by_severity[alert.severity as AlertSeverity]++;
      });

      // Calculate average resolution time
      const resolvedAlerts =
        alerts?.filter(a => a.status === "resolved" && a.resolved_at) || [];
      if (resolvedAlerts.length > 0) {
        const totalResolutionTime = resolvedAlerts.reduce((sum, alert) => {
          const created = new Date(alert.created_at!).getTime();
          const resolved = new Date(alert.resolved_at!).getTime();
          return sum + (resolved - created);
        }, 0);

        stats.avg_resolution_time_minutes =
          totalResolutionTime / resolvedAlerts.length / (1000 * 60);
      }

      return stats;
    } catch (error) {
      console.error("Error calculating alert statistics:", error);
      return this.getEmptyStatistics();
    }
  }

  /**
   * Get empty statistics object
   */
  private getEmptyStatistics(): AlertStatistics {
    return {
      total_alerts: 0,
      active_alerts: 0,
      resolved_alerts: 0,
      by_severity: { low: 0, medium: 0, high: 0, critical: 0 },
      avg_resolution_time_minutes: 0,
      escalations_triggered: 0,
    };
  }

  /**
   * Get current system status
   */
  getStatus(): {
    is_running: boolean;
    active_rules: number;
    notification_templates: number;
    escalation_levels: number;
  } {
    return {
      is_running: this.isRunning,
      active_rules: Array.from(this.alertRules.values()).filter(r => r.enabled)
        .length,
      notification_templates: Array.from(
        this.notificationTemplates.values()
      ).filter(t => t.enabled).length,
      escalation_levels: this.escalationLevels.length,
    };
  }

  /**
   * Add custom alert rule
   */
  addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
    console.log(`Added alert rule: ${rule.id}`);
  }

  /**
   * Remove alert rule
   */
  removeAlertRule(ruleId: string): void {
    if (this.alertRules.delete(ruleId)) {
      console.log(`Removed alert rule: ${ruleId}`);
    }
  }

  /**
   * Enable/disable alert rule
   */
  toggleAlertRule(ruleId: string, enabled: boolean): void {
    const rule = this.alertRules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
      console.log(`${enabled ? "Enabled" : "Disabled"} alert rule: ${ruleId}`);
    }
  }
}

// Export singleton instance
export const alertManager = new AlertManager();
