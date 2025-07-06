import { createClient } from "@/lib/supabase/client";
import { healthMonitoringEngine } from "./health-monitoring-engine";

const supabase = createClient();

// Types and Interfaces
export interface AlertRule {
  id: string;
  name: string;
  description: string;
  service_name?: string;
  metric_type?: string;
  condition: AlertCondition;
  severity: AlertSeverity;
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AlertCondition {
  operator:
    | "greater_than"
    | "less_than"
    | "equals"
    | "not_equals"
    | "between"
    | "outside";
  threshold: number;
  threshold_max?: number; // For 'between' and 'outside' operators
  duration_minutes: number; // How long condition must persist
  evaluation_window_minutes: number; // Time window to evaluate
}

export type AlertSeverity = "low" | "medium" | "high" | "critical";

export interface SystemAlert {
  id?: string;
  alert_type: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  source_service?: string;
  source_metric_id?: string;
  trigger_condition?: Record<string, any>;
  alert_data?: Record<string, any>;
  status: "active" | "acknowledged" | "resolved" | "dismissed";
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_by?: string;
  resolved_at?: string;
  auto_resolve: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationChannel {
  type: "email" | "slack" | "webhook" | "sms" | "pagerduty" | "in_app";
  enabled: boolean;
  config: Record<string, any>;
  filter?: {
    min_severity?: AlertSeverity;
    services?: string[];
    alert_types?: string[];
  };
}

export interface EscalationLevel {
  level: number;
  delay_minutes: number;
  channels: NotificationChannel[];
  recipients: string[];
  conditions?: {
    if_not_acknowledged?: boolean;
    if_not_resolved?: boolean;
    if_severity_at_least?: AlertSeverity;
  };
}

export interface EscalationPolicy {
  id: string;
  name: string;
  description: string;
  levels: EscalationLevel[];
  enabled: boolean;
  applies_to: {
    services?: string[];
    alert_types?: string[];
    severities?: AlertSeverity[];
  };
}

export interface IncidentContext {
  alert_id: string;
  incident_id: string;
  escalation_level: number;
  next_escalation_at?: string;
  notifications_sent: {
    channel: string;
    sent_at: string;
    success: boolean;
    error?: string;
  }[];
}

export class AlertingEngine {
  private alertRules: Map<string, AlertRule> = new Map();
  private escalationPolicies: Map<string, EscalationPolicy> = new Map();
  private activeIncidents: Map<string, IncidentContext> = new Map();
  private evaluationInterval: NodeJS.Timeout | null = null;
  private escalationInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor() {
    this.initializeDefaultAlertRules();
    this.initializeDefaultEscalationPolicies();
  }

  /**
   * Initialize default alert rules for common scenarios
   */
  private initializeDefaultAlertRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: "high_response_time",
        name: "High Response Time",
        description: "Alert when API response time exceeds threshold",
        service_name: "dashboard_api",
        metric_type: "response_time",
        condition: {
          operator: "greater_than",
          threshold: 2000,
          duration_minutes: 2,
          evaluation_window_minutes: 5,
        },
        severity: "high",
        enabled: true,
      },
      {
        id: "critical_response_time",
        name: "Critical Response Time",
        description: "Alert when API response time is critically high",
        service_name: "dashboard_api",
        metric_type: "response_time",
        condition: {
          operator: "greater_than",
          threshold: 5000,
          duration_minutes: 1,
          evaluation_window_minutes: 3,
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
          evaluation_window_minutes: 10,
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
          evaluation_window_minutes: 5,
        },
        severity: "critical",
        enabled: true,
      },
      {
        id: "service_downtime",
        name: "Service Downtime",
        description: "Alert when service uptime drops below threshold",
        metric_type: "uptime",
        condition: {
          operator: "less_than",
          threshold: 99.0,
          duration_minutes: 1,
          evaluation_window_minutes: 3,
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
          threshold: 5,
          duration_minutes: 3,
          evaluation_window_minutes: 10,
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
   * Initialize default escalation policies
   */
  private initializeDefaultEscalationPolicies(): void {
    const defaultPolicies: EscalationPolicy[] = [
      {
        id: "critical_escalation",
        name: "Critical Incident Escalation",
        description: "Escalation policy for critical severity alerts",
        levels: [
          {
            level: 1,
            delay_minutes: 0,
            channels: [
              {
                type: "in_app",
                enabled: true,
                config: {},
              },
              {
                type: "email",
                enabled: true,
                config: {
                  template: "critical_alert",
                },
              },
            ],
            recipients: ["on-call-engineer@company.com"],
            conditions: {
              if_severity_at_least: "critical",
            },
          },
          {
            level: 2,
            delay_minutes: 15,
            channels: [
              {
                type: "slack",
                enabled: true,
                config: {
                  channel: "#critical-alerts",
                  mention: "@channel",
                },
              },
              {
                type: "pagerduty",
                enabled: true,
                config: {
                  service_key: "critical-incidents",
                },
              },
            ],
            recipients: ["team-lead@company.com", "ops-manager@company.com"],
            conditions: {
              if_not_acknowledged: true,
            },
          },
          {
            level: 3,
            delay_minutes: 30,
            channels: [
              {
                type: "email",
                enabled: true,
                config: {
                  template: "executive_alert",
                },
              },
            ],
            recipients: ["cto@company.com", "vp-engineering@company.com"],
            conditions: {
              if_not_resolved: true,
            },
          },
        ],
        enabled: true,
        applies_to: {
          severities: ["critical"],
        },
      },
      {
        id: "standard_escalation",
        name: "Standard Alert Escalation",
        description: "Escalation policy for high and medium severity alerts",
        levels: [
          {
            level: 1,
            delay_minutes: 0,
            channels: [
              {
                type: "in_app",
                enabled: true,
                config: {},
              },
              {
                type: "email",
                enabled: true,
                config: {
                  template: "standard_alert",
                },
              },
            ],
            recipients: ["team@company.com"],
          },
          {
            level: 2,
            delay_minutes: 60,
            channels: [
              {
                type: "slack",
                enabled: true,
                config: {
                  channel: "#monitoring-alerts",
                },
              },
            ],
            recipients: ["team-lead@company.com"],
            conditions: {
              if_not_acknowledged: true,
            },
          },
        ],
        enabled: true,
        applies_to: {
          severities: ["high", "medium"],
        },
      },
    ];

    defaultPolicies.forEach(policy => {
      this.escalationPolicies.set(policy.id, policy);
    });
  }

  /**
   * Start the alerting engine
   */
  start(
    evaluationIntervalMs: number = 60000,
    escalationIntervalMs: number = 30000
  ): void {
    if (this.isRunning) {
      console.warn("Alerting engine is already running");
      return;
    }

    this.isRunning = true;
    console.log("Starting alerting engine...");

    // Start rule evaluation
    this.evaluationInterval = setInterval(async () => {
      await this.evaluateAlertRules();
    }, evaluationIntervalMs);

    // Start escalation processing
    this.escalationInterval = setInterval(async () => {
      await this.processEscalations();
    }, escalationIntervalMs);
  }

  /**
   * Stop the alerting engine
   */
  stop(): void {
    if (this.evaluationInterval) {
      clearInterval(this.evaluationInterval);
      this.evaluationInterval = null;
    }

    if (this.escalationInterval) {
      clearInterval(this.escalationInterval);
      this.escalationInterval = null;
    }

    this.isRunning = false;
    console.log("Alerting engine stopped");
  }

  /**
   * Evaluate all enabled alert rules
   */
  private async evaluateAlertRules(): Promise<void> {
    try {
      for (const rule of this.alertRules.values()) {
        if (!rule.enabled) continue;
        await this.evaluateRule(rule);
      }
    } catch (error) {
      console.error("Error during rule evaluation:", error);
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

      // Get metrics for evaluation
      let query = supabase
        .from("system_health_metrics")
        .select("*")
        .gte("timestamp", windowStart.toISOString())
        .eq("metric_type", rule.metric_type!)
        .order("timestamp", { ascending: false });

      if (rule.service_name) {
        query = query.eq("service_name", rule.service_name);
      }

      const { data: metrics, error } = await query;
      if (error) {
        console.error("Error fetching metrics for rule evaluation:", error);
        return;
      }

      if (!metrics || metrics.length === 0) return;

      // Check if condition is met
      const conditionMet = this.evaluateCondition(metrics, rule.condition);

      if (conditionMet) {
        // Check if alert already exists for this rule
        const existingAlert = await this.findExistingAlert(rule);

        if (!existingAlert) {
          await this.createAlert(rule, metrics);
        }
      } else {
        // Check if we should auto-resolve any existing alerts
        await this.autoResolveAlerts(rule);
      }
    } catch (error) {
      console.error("Error evaluating rule:", rule.id, error);
    }
  }

  /**
   * Evaluate if condition is met based on metrics
   */
  private evaluateCondition(
    metrics: any[],
    condition: AlertCondition
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

    // Check if condition is continuously met
    return recentMetrics.every(metric => {
      switch (condition.operator) {
        case "greater_than":
          return metric.metric_value > condition.threshold;
        case "less_than":
          return metric.metric_value < condition.threshold;
        case "equals":
          return metric.metric_value === condition.threshold;
        case "not_equals":
          return metric.metric_value !== condition.threshold;
        case "between":
          return (
            condition.threshold_max !== undefined &&
            metric.metric_value >= condition.threshold &&
            metric.metric_value <= condition.threshold_max
          );
        case "outside":
          return (
            condition.threshold_max !== undefined &&
            (metric.metric_value < condition.threshold ||
              metric.metric_value > condition.threshold_max)
          );
        default:
          return false;
      }
    });
  }

  /**
   * Find existing active alert for a rule
   */
  private async findExistingAlert(
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
    triggerMetrics: any[]
  ): Promise<void> {
    try {
      const latestMetric = triggerMetrics[0];

      const alert: Omit<SystemAlert, "id" | "created_at" | "updated_at"> = {
        alert_type: rule.id,
        severity: rule.severity,
        title: rule.name,
        description: this.generateAlertDescription(rule, latestMetric),
        source_service: rule.service_name,
        source_metric_id: latestMetric.id,
        trigger_condition: {
          rule_id: rule.id,
          condition: rule.condition,
          trigger_value: latestMetric.metric_value,
          evaluation_time: new Date().toISOString(),
        },
        alert_data: {
          metric_type: rule.metric_type,
          current_value: latestMetric.metric_value,
          threshold: rule.condition.threshold,
          unit: latestMetric.unit,
          trend_data: triggerMetrics.slice(0, 10).map(m => ({
            timestamp: m.timestamp,
            value: m.metric_value,
          })),
        },
        status: "active",
        auto_resolve: this.shouldAutoResolve(rule),
      };

      const { data: createdAlert, error } = await supabase
        .from("system_alerts")
        .insert([alert])
        .select()
        .single();

      if (error) {
        console.error("Error creating alert:", error);
        return;
      }

      console.log("Alert created:", createdAlert);

      // Trigger escalation
      await this.triggerEscalation(createdAlert);
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

    return `${servicePart}${metricPart}${operatorText} ${thresholdPart}. Current value: ${currentValue}`;
  }

  /**
   * Get operator text for description
   */
  private getOperatorText(operator: AlertCondition["operator"]): string {
    switch (operator) {
      case "greater_than":
        return "exceeded threshold of";
      case "less_than":
        return "dropped below threshold of";
      case "equals":
        return "equals";
      case "not_equals":
        return "does not equal";
      case "between":
        return "is between";
      case "outside":
        return "is outside range";
      default:
        return "condition met for";
    }
  }

  /**
   * Determine if alert should auto-resolve
   */
  private shouldAutoResolve(rule: AlertRule): boolean {
    // Auto-resolve performance alerts when condition is no longer met
    return [
      "response_time",
      "cpu_usage",
      "memory_usage",
      "error_rate",
    ].includes(rule.metric_type || "");
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

      if (error || !activeAlerts) return;

      for (const alert of activeAlerts) {
        await this.resolveAlert(alert.id, "system", "Condition no longer met");
      }
    } catch (error) {
      console.error("Error auto-resolving alerts:", error);
    }
  }

  /**
   * Trigger escalation for an alert
   */
  private async triggerEscalation(alert: SystemAlert): Promise<void> {
    try {
      const applicablePolicies = this.getApplicableEscalationPolicies(alert);

      for (const policy of applicablePolicies) {
        const incidentId = `incident_${alert.id}_${Date.now()}`;

        const incident: IncidentContext = {
          alert_id: alert.id!,
          incident_id: incidentId,
          escalation_level: 0,
          notifications_sent: [],
        };

        this.activeIncidents.set(incidentId, incident);

        // Process first level immediately
        await this.processEscalationLevel(incident, policy, 0);
      }
    } catch (error) {
      console.error("Error triggering escalation:", error);
    }
  }

  /**
   * Get applicable escalation policies for an alert
   */
  private getApplicableEscalationPolicies(
    alert: SystemAlert
  ): EscalationPolicy[] {
    return Array.from(this.escalationPolicies.values()).filter(policy => {
      if (!policy.enabled) return false;

      const { applies_to } = policy;

      if (
        applies_to.severities &&
        !applies_to.severities.includes(alert.severity)
      ) {
        return false;
      }

      if (
        applies_to.services &&
        alert.source_service &&
        !applies_to.services.includes(alert.source_service)
      ) {
        return false;
      }

      if (
        applies_to.alert_types &&
        !applies_to.alert_types.includes(alert.alert_type)
      ) {
        return false;
      }

      return true;
    });
  }

  /**
   * Process escalations for active incidents
   */
  private async processEscalations(): Promise<void> {
    try {
      for (const [incidentId, incident] of this.activeIncidents) {
        const alert = await this.getAlert(incident.alert_id);
        if (!alert || alert.status !== "active") {
          this.activeIncidents.delete(incidentId);
          continue;
        }

        const policies = this.getApplicableEscalationPolicies(alert);

        for (const policy of policies) {
          if (
            incident.next_escalation_at &&
            new Date(incident.next_escalation_at) <= new Date()
          ) {
            const nextLevel = incident.escalation_level + 1;
            if (nextLevel < policy.levels.length) {
              await this.processEscalationLevel(incident, policy, nextLevel);
              incident.escalation_level = nextLevel;
            }
          }
        }
      }
    } catch (error) {
      console.error("Error processing escalations:", error);
    }
  }

  /**
   * Process a specific escalation level
   */
  private async processEscalationLevel(
    incident: IncidentContext,
    policy: EscalationPolicy,
    levelIndex: number
  ): Promise<void> {
    try {
      const level = policy.levels[levelIndex];
      const alert = await this.getAlert(incident.alert_id);

      if (!alert) return;

      // Check level conditions
      if (level.conditions) {
        if (
          level.conditions.if_not_acknowledged &&
          alert.status === "acknowledged"
        )
          return;
        if (level.conditions.if_not_resolved && alert.status === "resolved")
          return;
        if (
          level.conditions.if_severity_at_least &&
          !this.isSeverityAtLeast(
            alert.severity,
            level.conditions.if_severity_at_least
          )
        ) {
          return;
        }
      }

      // Send notifications through all channels
      for (const channel of level.channels) {
        if (!channel.enabled) continue;

        try {
          const success = await this.sendNotification(
            alert,
            channel,
            level.recipients
          );

          incident.notifications_sent.push({
            channel: channel.type,
            sent_at: new Date().toISOString(),
            success,
            error: success ? undefined : "Failed to send notification",
          });
        } catch (error) {
          incident.notifications_sent.push({
            channel: channel.type,
            sent_at: new Date().toISOString(),
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      // Schedule next escalation
      const nextLevel = levelIndex + 1;
      if (nextLevel < policy.levels.length) {
        const nextLevelDelay = policy.levels[nextLevel].delay_minutes;
        incident.next_escalation_at = new Date(
          Date.now() + nextLevelDelay * 60 * 1000
        ).toISOString();
      }
    } catch (error) {
      console.error("Error processing escalation level:", error);
    }
  }

  /**
   * Check if severity is at least the required level
   */
  private isSeverityAtLeast(
    current: AlertSeverity,
    required: AlertSeverity
  ): boolean {
    const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
    return severityOrder[current] >= severityOrder[required];
  }

  /**
   * Send notification through a specific channel
   */
  private async sendNotification(
    alert: SystemAlert,
    channel: NotificationChannel,
    recipients: string[]
  ): Promise<boolean> {
    try {
      switch (channel.type) {
        case "email":
          return await this.sendEmailNotification(
            alert,
            channel.config,
            recipients
          );
        case "slack":
          return await this.sendSlackNotification(alert, channel.config);
        case "webhook":
          return await this.sendWebhookNotification(alert, channel.config);
        case "in_app":
          return await this.sendInAppNotification(alert, recipients);
        case "sms":
          return await this.sendSMSNotification(
            alert,
            channel.config,
            recipients
          );
        case "pagerduty":
          return await this.sendPagerDutyNotification(alert, channel.config);
        default:
          console.warn("Unknown notification channel type:", channel.type);
          return false;
      }
    } catch (error) {
      console.error(`Error sending ${channel.type} notification:`, error);
      return false;
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    alert: SystemAlert,
    config: Record<string, any>,
    recipients: string[]
  ): Promise<boolean> {
    try {
      // In a real implementation, integrate with email service (SendGrid, SES, etc.)
      console.log("Email notification:", {
        to: recipients,
        subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
        template: config.template || "default",
        alert_data: alert,
      });

      return true;
    } catch (error) {
      console.error("Error sending email notification:", error);
      return false;
    }
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(
    alert: SystemAlert,
    config: Record<string, any>
  ): Promise<boolean> {
    try {
      // In a real implementation, integrate with Slack Web API
      console.log("Slack notification:", {
        channel: config.channel,
        text: `🚨 ${alert.title}`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*${alert.title}*\n${alert.description}`,
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `Severity: ${alert.severity} | Service: ${alert.source_service || "Unknown"}`,
              },
            ],
          },
        ],
      });

      return true;
    } catch (error) {
      console.error("Error sending Slack notification:", error);
      return false;
    }
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(
    alert: SystemAlert,
    config: Record<string, any>
  ): Promise<boolean> {
    try {
      const response = await fetch(config.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...config.headers,
        },
        body: JSON.stringify({
          alert,
          timestamp: new Date().toISOString(),
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Error sending webhook notification:", error);
      return false;
    }
  }

  /**
   * Send in-app notification
   */
  private async sendInAppNotification(
    alert: SystemAlert,
    recipients: string[]
  ): Promise<boolean> {
    try {
      // Store in-app notifications in database
      const notifications = recipients.map(recipient => ({
        user_id: recipient,
        title: alert.title,
        message: alert.description,
        type: "alert",
        severity: alert.severity,
        alert_id: alert.id,
        read: false,
        created_at: new Date().toISOString(),
      }));

      // In a real implementation, insert into notifications table
      console.log("In-app notifications:", notifications);

      return true;
    } catch (error) {
      console.error("Error sending in-app notification:", error);
      return false;
    }
  }

  /**
   * Send SMS notification
   */
  private async sendSMSNotification(
    alert: SystemAlert,
    config: Record<string, any>,
    recipients: string[]
  ): Promise<boolean> {
    try {
      // In a real implementation, integrate with SMS service (Twilio, AWS SNS, etc.)
      console.log("SMS notification:", {
        to: recipients,
        message: `ALERT: ${alert.title} - ${alert.description}`,
        alert_id: alert.id,
      });

      return true;
    } catch (error) {
      console.error("Error sending SMS notification:", error);
      return false;
    }
  }

  /**
   * Send PagerDuty notification
   */
  private async sendPagerDutyNotification(
    alert: SystemAlert,
    config: Record<string, any>
  ): Promise<boolean> {
    try {
      // In a real implementation, integrate with PagerDuty Events API
      console.log("PagerDuty notification:", {
        service_key: config.service_key,
        event_type: "trigger",
        incident_key: alert.id,
        description: alert.title,
        details: alert,
      });

      return true;
    } catch (error) {
      console.error("Error sending PagerDuty notification:", error);
      return false;
    }
  }

  /**
   * Get alert by ID
   */
  private async getAlert(alertId: string): Promise<SystemAlert | null> {
    try {
      const { data, error } = await supabase
        .from("system_alerts")
        .select("*")
        .eq("id", alertId)
        .single();

      if (error) {
        console.error("Error getting alert:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error getting alert:", error);
      return null;
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

      // Remove from active incidents
      for (const [incidentId, incident] of this.activeIncidents) {
        if (incident.alert_id === alertId) {
          this.activeIncidents.delete(incidentId);
        }
      }

      console.log("Alert acknowledged:", alertId);
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

      // Remove from active incidents
      for (const [incidentId, incident] of this.activeIncidents) {
        if (incident.alert_id === alertId) {
          this.activeIncidents.delete(incidentId);
        }
      }

      console.log("Alert resolved:", alertId);
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
    timeRange: "hour" | "day" | "week" | "month" = "day"
  ): Promise<{
    total_alerts: number;
    by_severity: Record<AlertSeverity, number>;
    by_status: Record<string, number>;
    resolution_time_avg_minutes: number;
    escalations_triggered: number;
  }> {
    try {
      const timeRangeMs = {
        hour: 60 * 60 * 1000,
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
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
        return {
          total_alerts: 0,
          by_severity: { low: 0, medium: 0, high: 0, critical: 0 },
          by_status: {},
          resolution_time_avg_minutes: 0,
          escalations_triggered: 0,
        };
      }

      const stats = {
        total_alerts: alerts?.length || 0,
        by_severity: { low: 0, medium: 0, high: 0, critical: 0 },
        by_status: {} as Record<string, number>,
        resolution_time_avg_minutes: 0,
        escalations_triggered: this.activeIncidents.size,
      };

      alerts?.forEach(alert => {
        stats.by_severity[alert.severity as AlertSeverity]++;
        stats.by_status[alert.status] =
          (stats.by_status[alert.status] || 0) + 1;
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

        stats.resolution_time_avg_minutes =
          totalResolutionTime / resolvedAlerts.length / (1000 * 60);
      }

      return stats;
    } catch (error) {
      console.error("Error getting alert statistics:", error);
      return {
        total_alerts: 0,
        by_severity: { low: 0, medium: 0, high: 0, critical: 0 },
        by_status: {},
        resolution_time_avg_minutes: 0,
        escalations_triggered: 0,
      };
    }
  }

  /**
   * Add custom alert rule
   */
  addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
  }

  /**
   * Remove alert rule
   */
  removeAlertRule(ruleId: string): void {
    this.alertRules.delete(ruleId);
  }

  /**
   * Add escalation policy
   */
  addEscalationPolicy(policy: EscalationPolicy): void {
    this.escalationPolicies.set(policy.id, policy);
  }

  /**
   * Remove escalation policy
   */
  removeEscalationPolicy(policyId: string): void {
    this.escalationPolicies.delete(policyId);
  }

  /**
   * Get current status
   */
  getStatus(): {
    is_running: boolean;
    active_rules: number;
    active_policies: number;
    active_incidents: number;
    total_alerts_today: number;
  } {
    const today = new Date().toISOString().split("T")[0];

    return {
      is_running: this.isRunning,
      active_rules: Array.from(this.alertRules.values()).filter(r => r.enabled)
        .length,
      active_policies: Array.from(this.escalationPolicies.values()).filter(
        p => p.enabled
      ).length,
      active_incidents: this.activeIncidents.size,
      total_alerts_today: 0, // Would need to query database for actual count
    };
  }
}

// Export singleton instance
export const alertingEngine = new AlertingEngine();
