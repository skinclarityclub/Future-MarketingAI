import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// Types and Interfaces
export interface SystemHealthMetric {
  id?: string;
  service_name: string;
  metric_type:
    | "cpu_usage"
    | "memory_usage"
    | "response_time"
    | "uptime"
    | "error_rate"
    | "throughput"
    | "connection_count"
    | "disk_usage"
    | "network_latency";
  metric_value: number;
  unit:
    | "percentage"
    | "milliseconds"
    | "seconds"
    | "count"
    | "bytes"
    | "mb"
    | "gb";
  status: "healthy" | "warning" | "critical";
  threshold_min?: number;
  threshold_max?: number;
  metadata?: Record<string, any>;
  timestamp?: string;
  created_at?: string;
}

export interface ServiceHealthStatus {
  service_name: string;
  overall_status: "healthy" | "warning" | "critical";
  metrics: SystemHealthMetric[];
  uptime_percentage: number;
  last_check: string;
  sla_compliance: boolean;
  issues: string[];
}

export interface SLATarget {
  service_name: string;
  metric_type: string;
  target_value: number;
  comparison: "less_than" | "greater_than" | "equals";
  uptime_target: number; // percentage
  response_time_target: number; // milliseconds
  availability_target: number; // percentage
}

export interface HealthCheck {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  expected_status: number;
  timeout: number;
  retry_count: number;
}

export interface SystemHealthSummary {
  overall_status: "healthy" | "warning" | "critical";
  total_services: number;
  healthy_services: number;
  warning_services: number;
  critical_services: number;
  uptime_percentage: number;
  average_response_time: number;
  sla_compliance_rate: number;
  last_updated: string;
  trends: {
    response_time_trend: "improving" | "stable" | "degrading";
    uptime_trend: "improving" | "stable" | "degrading";
    error_rate_trend: "improving" | "stable" | "degrading";
  };
}

export class HealthMonitoringEngine {
  private readonly slaTargets: Map<string, SLATarget> = new Map();
  private readonly healthChecks: Map<string, HealthCheck> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  constructor() {
    this.initializeDefaultSLATargets();
    this.initializeHealthChecks();
  }

  /**
   * Initialize default SLA targets for core services
   */
  private initializeDefaultSLATargets(): void {
    const defaultTargets: SLATarget[] = [
      {
        service_name: "dashboard_api",
        metric_type: "response_time",
        target_value: 1000,
        comparison: "less_than",
        uptime_target: 99.8,
        response_time_target: 1000,
        availability_target: 99.8,
      },
      {
        service_name: "supabase_db",
        metric_type: "connection_count",
        target_value: 100,
        comparison: "less_than",
        uptime_target: 99.9,
        response_time_target: 100,
        availability_target: 99.9,
      },
      {
        service_name: "data_sync_service",
        metric_type: "uptime",
        target_value: 99.5,
        comparison: "greater_than",
        uptime_target: 99.5,
        response_time_target: 5000,
        availability_target: 99.5,
      },
      {
        service_name: "content_engine",
        metric_type: "error_rate",
        target_value: 1,
        comparison: "less_than",
        uptime_target: 99.0,
        response_time_target: 2000,
        availability_target: 99.0,
      },
    ];

    defaultTargets.forEach(target => {
      this.slaTargets.set(
        `${target.service_name}_${target.metric_type}`,
        target
      );
    });
  }

  /**
   * Initialize health check configurations
   */
  private initializeHealthChecks(): void {
    const healthChecks: HealthCheck[] = [
      {
        endpoint: "/api/health",
        method: "GET",
        expected_status: 200,
        timeout: 5000,
        retry_count: 3,
      },
      {
        endpoint: "/api/monitoring/ping",
        method: "GET",
        expected_status: 200,
        timeout: 3000,
        retry_count: 2,
      },
    ];

    healthChecks.forEach((check, index) => {
      this.healthChecks.set(`health_check_${index}`, check);
    });
  }

  /**
   * Record a health metric
   */
  async recordHealthMetric(
    metric: Omit<
      SystemHealthMetric,
      "id" | "timestamp" | "created_at" | "status"
    >
  ): Promise<string | null> {
    try {
      // Determine status based on thresholds
      const status = this.calculateMetricStatus(metric);

      const metricWithStatus: SystemHealthMetric = {
        ...metric,
        status,
        timestamp: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("system_health_metrics")
        .insert([metricWithStatus])
        .select("id")
        .single();

      if (error) {
        console.error("Failed to record health metric:", error);
        return null;
      }

      // Check for SLA violations
      await this.checkSLACompliance(metricWithStatus);

      return data?.id || null;
    } catch (error) {
      console.error("Error recording health metric:", error);
      return null;
    }
  }

  /**
   * Calculate metric status based on thresholds
   */
  private calculateMetricStatus(
    metric: Omit<SystemHealthMetric, "status">
  ): "healthy" | "warning" | "critical" {
    const { metric_value, threshold_min, threshold_max } = metric;

    // Critical thresholds (more restrictive)
    if (threshold_max && metric_value >= threshold_max * 1.2) return "critical";
    if (threshold_min && metric_value <= threshold_min * 0.8) return "critical";

    // Warning thresholds
    if (threshold_max && metric_value >= threshold_max) return "warning";
    if (threshold_min && metric_value <= threshold_min) return "warning";

    return "healthy";
  }

  /**
   * Check SLA compliance for a metric
   */
  private async checkSLACompliance(metric: SystemHealthMetric): Promise<void> {
    const slaKey = `${metric.service_name}_${metric.metric_type}`;
    const slaTarget = this.slaTargets.get(slaKey);

    if (!slaTarget) return;

    let isViolation = false;
    let violationMessage = "";

    switch (slaTarget.comparison) {
      case "less_than":
        if (metric.metric_value >= slaTarget.target_value) {
          isViolation = true;
          violationMessage = `${metric.metric_type} (${metric.metric_value}${metric.unit}) exceeds SLA target (${slaTarget.target_value}${metric.unit})`;
        }
        break;
      case "greater_than":
        if (metric.metric_value <= slaTarget.target_value) {
          isViolation = true;
          violationMessage = `${metric.metric_type} (${metric.metric_value}${metric.unit}) below SLA target (${slaTarget.target_value}${metric.unit})`;
        }
        break;
      case "equals":
        if (metric.metric_value !== slaTarget.target_value) {
          isViolation = true;
          violationMessage = `${metric.metric_type} (${metric.metric_value}${metric.unit}) not equal to SLA target (${slaTarget.target_value}${metric.unit})`;
        }
        break;
    }

    if (isViolation) {
      await this.createSLAViolationAlert(metric, slaTarget, violationMessage);
    }
  }

  /**
   * Create an alert for SLA violation
   */
  private async createSLAViolationAlert(
    metric: SystemHealthMetric,
    slaTarget: SLATarget,
    message: string
  ): Promise<void> {
    try {
      const severity = metric.status === "critical" ? "critical" : "high";

      await supabase.from("system_alerts").insert([
        {
          alert_type: "sla_violation",
          severity,
          title: `SLA Violation: ${metric.service_name}`,
          description: message,
          source_service: metric.service_name,
          source_metric_id: metric.id,
          trigger_condition: {
            metric_type: metric.metric_type,
            actual_value: metric.metric_value,
            sla_target: slaTarget.target_value,
            comparison: slaTarget.comparison,
          },
          alert_data: {
            metric,
            sla_target: slaTarget,
            violation_timestamp: new Date().toISOString(),
          },
          auto_resolve: false,
        },
      ]);
    } catch (error) {
      console.error("Failed to create SLA violation alert:", error);
    }
  }

  /**
   * Get health status for a specific service
   */
  async getServiceHealthStatus(
    serviceName: string
  ): Promise<ServiceHealthStatus | null> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const { data: metrics, error } = await supabase
        .from("system_health_metrics")
        .select("*")
        .eq("service_name", serviceName)
        .gte("timestamp", fiveMinutesAgo)
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Failed to fetch service health status:", error);
        return null;
      }

      if (!metrics || metrics.length === 0) {
        return {
          service_name: serviceName,
          overall_status: "critical",
          metrics: [],
          uptime_percentage: 0,
          last_check: new Date().toISOString(),
          sla_compliance: false,
          issues: ["No recent metrics available"],
        };
      }

      // Calculate overall status
      const criticalCount = metrics.filter(m => m.status === "critical").length;
      const warningCount = metrics.filter(m => m.status === "warning").length;

      const overall_status =
        criticalCount > 0
          ? "critical"
          : warningCount > 0
            ? "warning"
            : "healthy";

      // Calculate uptime percentage
      const uptimeMetrics = metrics.filter(m => m.metric_type === "uptime");
      const uptime_percentage =
        uptimeMetrics.length > 0
          ? uptimeMetrics.reduce((sum, m) => sum + m.metric_value, 0) /
            uptimeMetrics.length
          : 99.0;

      // Check SLA compliance
      const sla_compliance = await this.checkServiceSLACompliance(
        serviceName,
        metrics
      );

      // Collect issues
      const issues = metrics
        .filter(m => m.status !== "healthy")
        .map(m => `${m.metric_type}: ${m.metric_value}${m.unit} (${m.status})`);

      return {
        service_name: serviceName,
        overall_status,
        metrics,
        uptime_percentage,
        last_check: metrics[0]?.timestamp || new Date().toISOString(),
        sla_compliance,
        issues,
      };
    } catch (error) {
      console.error("Error getting service health status:", error);
      return null;
    }
  }

  /**
   * Check SLA compliance for a service
   */
  private async checkServiceSLACompliance(
    serviceName: string,
    metrics: SystemHealthMetric[]
  ): Promise<boolean> {
    const serviceSLAs = Array.from(this.slaTargets.values()).filter(
      sla => sla.service_name === serviceName
    );

    if (serviceSLAs.length === 0) return true;

    for (const sla of serviceSLAs) {
      const relevantMetrics = metrics.filter(
        m => m.metric_type === sla.metric_type
      );
      if (relevantMetrics.length === 0) continue;

      const latestMetric = relevantMetrics[0];

      switch (sla.comparison) {
        case "less_than":
          if (latestMetric.metric_value >= sla.target_value) return false;
          break;
        case "greater_than":
          if (latestMetric.metric_value <= sla.target_value) return false;
          break;
        case "equals":
          if (latestMetric.metric_value !== sla.target_value) return false;
          break;
      }
    }

    return true;
  }

  /**
   * Get comprehensive system health summary
   */
  async getSystemHealthSummary(): Promise<SystemHealthSummary> {
    try {
      const services = [
        "dashboard_api",
        "supabase_db",
        "data_sync_service",
        "content_engine",
      ];
      const serviceStatuses = await Promise.all(
        services.map(service => this.getServiceHealthStatus(service))
      );

      const validStatuses = serviceStatuses.filter(
        status => status !== null
      ) as ServiceHealthStatus[];

      const total_services = validStatuses.length;
      const healthy_services = validStatuses.filter(
        s => s.overall_status === "healthy"
      ).length;
      const warning_services = validStatuses.filter(
        s => s.overall_status === "warning"
      ).length;
      const critical_services = validStatuses.filter(
        s => s.overall_status === "critical"
      ).length;

      const overall_status =
        critical_services > 0
          ? "critical"
          : warning_services > 0
            ? "warning"
            : "healthy";

      // Calculate aggregate metrics
      const total_uptime = validStatuses.reduce(
        (sum, s) => sum + s.uptime_percentage,
        0
      );
      const uptime_percentage = total_uptime / total_services;

      // Calculate average response time from recent metrics
      const average_response_time = await this.calculateAverageResponseTime();

      // Calculate SLA compliance rate
      const compliant_services = validStatuses.filter(
        s => s.sla_compliance
      ).length;
      const sla_compliance_rate = (compliant_services / total_services) * 100;

      // Calculate trends
      const trends = await this.calculateTrends();

      return {
        overall_status,
        total_services,
        healthy_services,
        warning_services,
        critical_services,
        uptime_percentage,
        average_response_time,
        sla_compliance_rate,
        last_updated: new Date().toISOString(),
        trends,
      };
    } catch (error) {
      console.error("Error getting system health summary:", error);
      return {
        overall_status: "critical",
        total_services: 0,
        healthy_services: 0,
        warning_services: 0,
        critical_services: 0,
        uptime_percentage: 0,
        average_response_time: 0,
        sla_compliance_rate: 0,
        last_updated: new Date().toISOString(),
        trends: {
          response_time_trend: "stable",
          uptime_trend: "stable",
          error_rate_trend: "stable",
        },
      };
    }
  }

  /**
   * Calculate average response time across services
   */
  private async calculateAverageResponseTime(): Promise<number> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const { data: metrics, error } = await supabase
        .from("system_health_metrics")
        .select("metric_value")
        .eq("metric_type", "response_time")
        .gte("timestamp", fiveMinutesAgo);

      if (error || !metrics || metrics.length === 0) {
        return 0;
      }

      const totalResponseTime = metrics.reduce(
        (sum, m) => sum + m.metric_value,
        0
      );
      return totalResponseTime / metrics.length;
    } catch (error) {
      console.error("Error calculating average response time:", error);
      return 0;
    }
  }

  /**
   * Calculate performance trends
   */
  private async calculateTrends(): Promise<SystemHealthSummary["trends"]> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const thirtyMinutesAgo = new Date(
        Date.now() - 30 * 60 * 1000
      ).toISOString();

      // Get metrics from two time periods for comparison
      const [olderMetrics, recentMetrics] = await Promise.all([
        supabase
          .from("system_health_metrics")
          .select("metric_type, metric_value")
          .gte("timestamp", oneHourAgo)
          .lt("timestamp", thirtyMinutesAgo),
        supabase
          .from("system_health_metrics")
          .select("metric_type, metric_value")
          .gte("timestamp", thirtyMinutesAgo),
      ]);

      const calculateTrend = (metricType: string) => {
        const older =
          olderMetrics.data?.filter(m => m.metric_type === metricType) || [];
        const recent =
          recentMetrics.data?.filter(m => m.metric_type === metricType) || [];

        if (older.length === 0 || recent.length === 0) return "stable";

        const olderAvg =
          older.reduce((sum, m) => sum + m.metric_value, 0) / older.length;
        const recentAvg =
          recent.reduce((sum, m) => sum + m.metric_value, 0) / recent.length;

        const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;

        if (Math.abs(changePercent) < 5) return "stable";

        // For response_time and error_rate: increase is bad (degrading)
        // For uptime: decrease is bad (degrading)
        if (metricType === "uptime") {
          return changePercent > 0 ? "improving" : "degrading";
        } else {
          return changePercent < 0 ? "improving" : "degrading";
        }
      };

      return {
        response_time_trend: calculateTrend("response_time"),
        uptime_trend: calculateTrend("uptime"),
        error_rate_trend: calculateTrend("error_rate"),
      };
    } catch (error) {
      console.error("Error calculating trends:", error);
      return {
        response_time_trend: "stable",
        uptime_trend: "stable",
        error_rate_trend: "stable",
      };
    }
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(intervalMs: number = 30000): void {
    if (this.isMonitoring) {
      console.warn("Monitoring is already running");
      return;
    }

    this.isMonitoring = true;
    console.log("Starting health monitoring engine...");

    this.monitoringInterval = setInterval(async () => {
      try {
        // Record system metrics
        await this.recordSystemMetrics();
      } catch (error) {
        console.error("Error during monitoring cycle:", error);
      }
    }, intervalMs);
  }

  /**
   * Stop continuous monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log("Health monitoring engine stopped");
  }

  /**
   * Record current system metrics
   */
  private async recordSystemMetrics(): Promise<void> {
    try {
      // Simulate system metrics collection
      const metrics: Omit<
        SystemHealthMetric,
        "id" | "timestamp" | "created_at" | "status"
      >[] = [
        {
          service_name: "dashboard_api",
          metric_type: "cpu_usage",
          metric_value: Math.random() * 80 + 10, // 10-90%
          unit: "percentage",
          threshold_max: 80,
        },
        {
          service_name: "dashboard_api",
          metric_type: "memory_usage",
          metric_value: Math.random() * 70 + 20, // 20-90%
          unit: "percentage",
          threshold_max: 85,
        },
        {
          service_name: "supabase_db",
          metric_type: "connection_count",
          metric_value: Math.floor(Math.random() * 50 + 5), // 5-55 connections
          unit: "count",
          threshold_max: 100,
        },
        {
          service_name: "data_sync_service",
          metric_type: "uptime",
          metric_value: 99.5 + Math.random() * 0.5, // 99.5-100%
          unit: "percentage",
          threshold_min: 99.0,
        },
      ];

      await Promise.all(metrics.map(metric => this.recordHealthMetric(metric)));
    } catch (error) {
      console.error("Error recording system metrics:", error);
    }
  }

  /**
   * Get system status for API endpoint
   */
  async getSystemStatus(): Promise<{
    status: "healthy" | "warning" | "critical";
    message: string;
    timestamp: string;
    details: SystemHealthSummary;
  }> {
    try {
      const summary = await this.getSystemHealthSummary();

      let message = "";
      switch (summary.overall_status) {
        case "healthy":
          message = "All systems operational";
          break;
        case "warning":
          message = `${summary.warning_services} service(s) experiencing issues`;
          break;
        case "critical":
          message = `${summary.critical_services} service(s) in critical state`;
          break;
      }

      return {
        status: summary.overall_status,
        message,
        timestamp: new Date().toISOString(),
        details: summary,
      };
    } catch (error) {
      console.error("Error getting system status:", error);
      return {
        status: "critical",
        message: "Unable to determine system status",
        timestamp: new Date().toISOString(),
        details: {
          overall_status: "critical",
          total_services: 0,
          healthy_services: 0,
          warning_services: 0,
          critical_services: 0,
          uptime_percentage: 0,
          average_response_time: 0,
          sla_compliance_rate: 0,
          last_updated: new Date().toISOString(),
          trends: {
            response_time_trend: "stable",
            uptime_trend: "stable",
            error_rate_trend: "stable",
          },
        },
      };
    }
  }
}

// Export singleton instance
export const healthMonitoringEngine = new HealthMonitoringEngine();
