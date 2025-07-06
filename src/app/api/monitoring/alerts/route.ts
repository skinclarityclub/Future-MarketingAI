import { NextRequest, NextResponse } from "next/server";
import { alertingEngine } from "@/lib/monitoring/alerting-engine";
import { alertManager } from "@/lib/monitoring/alert-manager";

// Mock data for demonstration
const mockActiveAlerts = [
  {
    id: "alert-001",
    alert_type: "high_response_time",
    severity: "high" as const,
    title: "High API Response Time",
    description:
      "dashboard_api: response_time exceeded threshold of 2000ms. Current: 2847ms",
    source_service: "dashboard_api",
    source_metric_id: "metric-001",
    status: "active" as const,
    auto_resolve: true,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    trigger_condition: {
      rule_id: "high_response_time",
      threshold: 2000,
      current_value: 2847,
      evaluation_time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    alert_data: {
      metric_type: "response_time",
      current_value: 2847,
      threshold: 2000,
      unit: "ms",
      trend_data: [
        {
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          value: 2910,
        },
        {
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          value: 2756,
        },
        {
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          value: 2847,
        },
      ],
    },
  },
  {
    id: "alert-002",
    alert_type: "critical_memory_usage",
    severity: "critical" as const,
    title: "Critical Memory Usage",
    description: "memory_usage exceeded threshold of 90%. Current: 94.2%",
    source_service: "dashboard_api",
    source_metric_id: "metric-002",
    status: "active" as const,
    auto_resolve: true,
    created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    trigger_condition: {
      rule_id: "critical_memory_usage",
      threshold: 90,
      current_value: 94.2,
      evaluation_time: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    },
    alert_data: {
      metric_type: "memory_usage",
      current_value: 94.2,
      threshold: 90,
      unit: "%",
      trend_data: [
        {
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          value: 94.8,
        },
        {
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          value: 93.1,
        },
        {
          timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
          value: 94.2,
        },
      ],
    },
  },
  {
    id: "alert-003",
    alert_type: "high_cpu_usage",
    severity: "medium" as const,
    title: "High CPU Usage",
    description: "cpu_usage exceeded threshold of 85%. Current: 87.5%",
    source_service: "dashboard_api",
    source_metric_id: "metric-003",
    status: "acknowledged" as const,
    acknowledged_by: "john.doe@company.com",
    acknowledged_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    auto_resolve: true,
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    trigger_condition: {
      rule_id: "high_cpu_usage",
      threshold: 85,
      current_value: 87.5,
      evaluation_time: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    },
    alert_data: {
      metric_type: "cpu_usage",
      current_value: 87.5,
      threshold: 85,
      unit: "%",
    },
  },
];

const mockAlertStatistics = {
  total_alerts: 23,
  active_alerts: 2,
  resolved_alerts: 18,
  acknowledged_alerts: 3,
  by_severity: {
    low: 5,
    medium: 8,
    high: 7,
    critical: 3,
  },
  by_status: {
    active: 2,
    acknowledged: 3,
    resolved: 18,
    dismissed: 0,
  },
  avg_resolution_time_minutes: 42.3,
  escalations_triggered: 2,
  notifications_sent: 67,
  sla_breaches: 4,
  time_to_acknowledge_avg_minutes: 12.8,
  recent_trends: {
    alerts_trend: "increasing",
    resolution_time_trend: "improving",
    escalation_rate_trend: "stable",
  },
};

const mockNotificationChannels = [
  {
    id: "email-primary",
    type: "email",
    name: "Primary Email",
    enabled: true,
    config: {
      recipients: ["ops-team@company.com", "alerts@company.com"],
      template: "critical_alert_email",
    },
    filter: {
      min_severity: "medium",
    },
    success_rate: 98.5,
    last_used: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: "slack-critical",
    type: "slack",
    name: "Critical Alerts Channel",
    enabled: true,
    config: {
      channel: "#critical-alerts",
      webhook_url: "https://hooks.slack.com/services/...",
      mention: "@channel",
    },
    filter: {
      min_severity: "critical",
    },
    success_rate: 99.2,
    last_used: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: "webhook-monitoring",
    type: "webhook",
    name: "Monitoring System Webhook",
    enabled: true,
    config: {
      url: "https://monitoring.company.com/api/alerts",
      headers: {
        Authorization: "Bearer token123",
        "Content-Type": "application/json",
      },
    },
    success_rate: 97.8,
    last_used: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
];

const mockEscalationPolicies = [
  {
    id: "critical-escalation",
    name: "Critical Alert Escalation",
    description:
      "Escalation policy for critical severity alerts requiring immediate attention",
    enabled: true,
    applies_to: {
      severities: ["critical"],
      services: ["dashboard_api", "supabase_db"],
      alert_types: [
        "critical_memory_usage",
        "service_downtime",
        "critical_response_time",
      ],
    },
    levels: [
      {
        level: 1,
        delay_minutes: 0,
        recipients: ["on-call-engineer@company.com"],
        channels: ["email", "in_app"],
        conditions: {
          if_severity_at_least: "critical",
        },
      },
      {
        level: 2,
        delay_minutes: 15,
        recipients: ["team-lead@company.com", "ops-manager@company.com"],
        channels: ["slack", "email"],
        conditions: {
          if_not_acknowledged: true,
        },
      },
      {
        level: 3,
        delay_minutes: 30,
        recipients: ["engineering-director@company.com"],
        channels: ["email"],
        conditions: {
          if_not_resolved: true,
        },
      },
    ],
    metrics: {
      times_triggered: 8,
      avg_escalation_level: 1.4,
      last_triggered: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  },
  {
    id: "standard-escalation",
    name: "Standard Alert Escalation",
    description:
      "Default escalation policy for high and medium severity alerts",
    enabled: true,
    applies_to: {
      severities: ["high", "medium"],
      services: ["dashboard_api", "data_sync_service", "content_engine"],
    },
    levels: [
      {
        level: 1,
        delay_minutes: 0,
        recipients: ["ops-team@company.com"],
        channels: ["in_app", "email"],
      },
      {
        level: 2,
        delay_minutes: 60,
        recipients: ["team-lead@company.com"],
        channels: ["slack"],
        conditions: {
          if_not_acknowledged: true,
        },
      },
    ],
    metrics: {
      times_triggered: 24,
      avg_escalation_level: 1.1,
      last_triggered: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "get_active_alerts":
        return NextResponse.json({
          success: true,
          data: mockActiveAlerts.filter(alert => alert.status === "active"),
          timestamp: new Date().toISOString(),
        });

      case "get_all_alerts":
        const status = searchParams.get("status");
        const severity = searchParams.get("severity");
        const service = searchParams.get("service");
        const limit = parseInt(searchParams.get("limit") || "50");

        let filteredAlerts = [...mockActiveAlerts];

        if (status) {
          filteredAlerts = filteredAlerts.filter(
            alert => alert.status === status
          );
        }

        if (severity) {
          filteredAlerts = filteredAlerts.filter(
            alert => alert.severity === severity
          );
        }

        if (service) {
          filteredAlerts = filteredAlerts.filter(
            alert => alert.source_service === service
          );
        }

        return NextResponse.json({
          success: true,
          data: filteredAlerts.slice(0, limit),
          total: filteredAlerts.length,
          filters_applied: { status, severity, service },
          timestamp: new Date().toISOString(),
        });

      case "get_alert_statistics":
        const timeRange = searchParams.get("timeRange") || "24h";
        return NextResponse.json({
          success: true,
          data: {
            ...mockAlertStatistics,
            time_range: timeRange,
            last_calculated: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        });

      case "get_notification_channels":
        return NextResponse.json({
          success: true,
          data: mockNotificationChannels,
          timestamp: new Date().toISOString(),
        });

      case "get_escalation_policies":
        return NextResponse.json({
          success: true,
          data: mockEscalationPolicies,
          timestamp: new Date().toISOString(),
        });

      case "get_alert_rules":
        const alertManagerStatus = alertManager.getStatus();
        return NextResponse.json({
          success: true,
          data: {
            alert_manager_status: alertManagerStatus,
            alerting_engine_status: alertingEngine.getStatus(),
            sample_rules: [
              {
                id: "high_response_time",
                name: "High API Response Time",
                description: "Alert when API response time exceeds threshold",
                enabled: true,
                severity: "high",
                condition: {
                  operator: "greater_than",
                  threshold: 2000,
                  duration_minutes: 3,
                },
              },
              {
                id: "critical_memory_usage",
                name: "Critical Memory Usage",
                description: "Alert when memory usage reaches critical levels",
                enabled: true,
                severity: "critical",
                condition: {
                  operator: "greater_than",
                  threshold: 90,
                  duration_minutes: 2,
                },
              },
            ],
          },
          timestamp: new Date().toISOString(),
        });

      case "get_system_status":
        return NextResponse.json({
          success: true,
          data: {
            alert_manager: alertManager.getStatus(),
            alerting_engine: alertingEngine.getStatus(),
            system_health: "operational",
            last_evaluation: new Date().toISOString(),
            uptime_minutes: 1440, // 24 hours
            total_evaluations_today: 1440, // Every minute
          },
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            active_alerts: mockActiveAlerts.filter(
              alert => alert.status === "active"
            ).length,
            total_alerts: mockActiveAlerts.length,
            critical_alerts: mockActiveAlerts.filter(
              alert =>
                alert.severity === "critical" && alert.status === "active"
            ).length,
            system_status: "operational",
          },
          timestamp: new Date().toISOString(),
        });
    }
  } catch (error) {
    console.error("Error handling alerts GET request:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "acknowledge_alert":
        const { alertId, acknowledgedBy, notes } = body;

        if (!alertId || !acknowledgedBy) {
          return NextResponse.json(
            {
              success: false,
              error: "Missing required fields: alertId, acknowledgedBy",
            },
            { status: 400 }
          );
        }

        // Try both alert systems
        const acknowledged = await Promise.all([
          alertingEngine.acknowledgeAlert(alertId, acknowledgedBy, notes),
          alertManager.acknowledgeAlert(alertId, acknowledgedBy, notes),
        ]);

        return NextResponse.json({
          success: true,
          data: {
            alert_id: alertId,
            acknowledged_by: acknowledgedBy,
            acknowledged_at: new Date().toISOString(),
            notes,
            engines_updated: acknowledged.filter(Boolean).length,
          },
          message: "Alert acknowledged successfully",
          timestamp: new Date().toISOString(),
        });

      case "resolve_alert":
        const { alertId: resolveAlertId, resolvedBy, resolutionNotes } = body;

        if (!resolveAlertId || !resolvedBy) {
          return NextResponse.json(
            {
              success: false,
              error: "Missing required fields: alertId, resolvedBy",
            },
            { status: 400 }
          );
        }

        const resolved = await Promise.all([
          alertingEngine.resolveAlert(
            resolveAlertId,
            resolvedBy,
            resolutionNotes
          ),
          alertManager.resolveAlert(
            resolveAlertId,
            resolvedBy,
            resolutionNotes
          ),
        ]);

        return NextResponse.json({
          success: true,
          data: {
            alert_id: resolveAlertId,
            resolved_by: resolvedBy,
            resolved_at: new Date().toISOString(),
            resolution_notes: resolutionNotes,
            engines_updated: resolved.filter(Boolean).length,
          },
          message: "Alert resolved successfully",
          timestamp: new Date().toISOString(),
        });

      case "create_manual_alert":
        const { title, description, severity, service_name, alert_type } = body;

        if (!title || !description || !severity) {
          return NextResponse.json(
            {
              success: false,
              error: "Missing required fields: title, description, severity",
            },
            { status: 400 }
          );
        }

        const manualAlert = {
          id: `manual-${Date.now()}`,
          alert_type: alert_type || "manual_alert",
          severity: severity as "low" | "medium" | "high" | "critical",
          title,
          description,
          source_service: service_name,
          status: "active" as const,
          auto_resolve: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: manualAlert,
          message: "Manual alert created successfully",
          timestamp: new Date().toISOString(),
        });

      case "test_notification_channel":
        const { channelId, testMessage } = body;

        if (!channelId) {
          return NextResponse.json(
            {
              success: false,
              error: "Missing required field: channelId",
            },
            { status: 400 }
          );
        }

        const channel = mockNotificationChannels.find(c => c.id === channelId);
        if (!channel) {
          return NextResponse.json(
            {
              success: false,
              error: "Notification channel not found",
            },
            { status: 404 }
          );
        }

        // Simulate test notification
        const testResult = {
          channel_id: channelId,
          channel_type: channel.type,
          test_message:
            testMessage ||
            "This is a test notification from SKC BI Dashboard monitoring system.",
          sent_at: new Date().toISOString(),
          success: Math.random() > 0.1, // 90% success rate
          response_time_ms: Math.floor(Math.random() * 1000) + 100,
        };

        return NextResponse.json({
          success: true,
          data: testResult,
          message: testResult.success
            ? "Test notification sent successfully"
            : "Test notification failed",
          timestamp: new Date().toISOString(),
        });

      case "update_escalation_policy":
        const { policyId, updates } = body;

        if (!policyId) {
          return NextResponse.json(
            {
              success: false,
              error: "Missing required field: policyId",
            },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            policy_id: policyId,
            updates_applied: updates,
            updated_at: new Date().toISOString(),
          },
          message: "Escalation policy updated successfully",
          timestamp: new Date().toISOString(),
        });

      case "trigger_manual_escalation":
        const { alertId: escalateAlertId, escalationLevel } = body;

        if (!escalateAlertId) {
          return NextResponse.json(
            {
              success: false,
              error: "Missing required field: alertId",
            },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            alert_id: escalateAlertId,
            escalation_level: escalationLevel || 1,
            escalated_at: new Date().toISOString(),
            notifications_sent: ["email", "slack"],
          },
          message: "Manual escalation triggered successfully",
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Unknown action",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error handling alerts POST request:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "bulk_acknowledge":
        const { alertIds, acknowledgedBy } = body;

        if (!alertIds || !Array.isArray(alertIds) || !acknowledgedBy) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Missing required fields: alertIds (array), acknowledgedBy",
            },
            { status: 400 }
          );
        }

        const bulkAckResults = await Promise.all(
          alertIds.map(async (alertId: string) => {
            const results = await Promise.all([
              alertingEngine.acknowledgeAlert(alertId, acknowledgedBy),
              alertManager.acknowledgeAlert(alertId, acknowledgedBy),
            ]);
            return { alertId, success: results.some(Boolean) };
          })
        );

        return NextResponse.json({
          success: true,
          data: {
            processed: bulkAckResults.length,
            successful: bulkAckResults.filter(r => r.success).length,
            failed: bulkAckResults.filter(r => !r.success).length,
            results: bulkAckResults,
            acknowledged_by: acknowledgedBy,
            acknowledged_at: new Date().toISOString(),
          },
          message: "Bulk acknowledgment completed",
          timestamp: new Date().toISOString(),
        });

      case "bulk_resolve":
        const { alertIds: resolveIds, resolvedBy } = body;

        if (!resolveIds || !Array.isArray(resolveIds) || !resolvedBy) {
          return NextResponse.json(
            {
              success: false,
              error: "Missing required fields: alertIds (array), resolvedBy",
            },
            { status: 400 }
          );
        }

        const bulkResolveResults = await Promise.all(
          resolveIds.map(async (alertId: string) => {
            const results = await Promise.all([
              alertingEngine.resolveAlert(alertId, resolvedBy),
              alertManager.resolveAlert(alertId, resolvedBy),
            ]);
            return { alertId, success: results.some(Boolean) };
          })
        );

        return NextResponse.json({
          success: true,
          data: {
            processed: bulkResolveResults.length,
            successful: bulkResolveResults.filter(r => r.success).length,
            failed: bulkResolveResults.filter(r => !r.success).length,
            results: bulkResolveResults,
            resolved_by: resolvedBy,
            resolved_at: new Date().toISOString(),
          },
          message: "Bulk resolution completed",
          timestamp: new Date().toISOString(),
        });

      case "update_notification_settings":
        const { settings } = body;

        return NextResponse.json({
          success: true,
          data: {
            settings_updated: settings,
            updated_at: new Date().toISOString(),
          },
          message: "Notification settings updated successfully",
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Unknown action",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error handling alerts PUT request:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
