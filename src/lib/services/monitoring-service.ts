import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type {
  SystemHealthMetric,
  DataQualityIndicator,
  SystemAlert,
  SystemPerformanceLog,
  InsertSystemHealthMetric,
  InsertDataQualityIndicator,
  InsertSystemAlert,
  InsertSystemPerformanceLog,
  HealthStatus,
  QualityStatus,
  AlertSeverity,
  MetricType,
  QualityMetricType,
} from "@/lib/supabase/types";

export class MonitoringService {
  private async getSupabaseClient() {
    const cookieStore = await cookies();
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          async get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
  }

  // System Health Metrics
  async recordHealthMetric(
    metric: InsertSystemHealthMetric
  ): Promise<SystemHealthMetric> {
    const supabase = await this.getSupabaseClient();
    const { data, error } = await supabase
      .from("system_health_metrics")
      .insert(metric)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getHealthMetrics(
    serviceName?: string,
    metricType?: MetricType,
    limit = 100
  ): Promise<SystemHealthMetric[]> {
    const supabase = await this.getSupabaseClient();
    let query = supabase
      .from("system_health_metrics")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (serviceName) {
      query = query.eq("service_name", serviceName);
    }

    if (metricType) {
      query = query.eq("metric_type", metricType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getLatestHealthMetrics(
    serviceName: string
  ): Promise<SystemHealthMetric[]> {
    const supabase = await this.getSupabaseClient();
    const { data, error } = await supabase
      .from("system_health_metrics")
      .select("*")
      .eq("service_name", serviceName)
      .order("timestamp", { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  }

  // Data Quality Indicators
  async recordDataQualityIndicator(
    indicator: InsertDataQualityIndicator
  ): Promise<DataQualityIndicator> {
    const supabase = await this.getSupabaseClient();
    const { data, error } = await supabase
      .from("data_quality_indicators")
      .insert(indicator)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getDataQualityIndicators(
    dataSource?: string,
    tableName?: string,
    limit = 100
  ): Promise<DataQualityIndicator[]> {
    const supabase = await this.getSupabaseClient();
    let query = supabase
      .from("data_quality_indicators")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (dataSource) {
      query = query.eq("data_source", dataSource);
    }

    if (tableName) {
      query = query.eq("table_name", tableName);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getDataQualityOverview(): Promise<{
    averageScore: number;
    totalSources: number;
    issueCount: number;
    bySource: Record<string, { score: number; status: QualityStatus }>;
  }> {
    const supabase = await this.getSupabaseClient();
    const { data, error } = await supabase
      .from("data_quality_indicators")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const indicators = data || [];
    const bySource: Record<string, { score: number; status: QualityStatus }> =
      {};
    let totalScore = 0;
    let issueCount = 0;

    indicators.forEach(indicator => {
      const source = indicator.data_source;
      if (!bySource[source]) {
        bySource[source] = {
          score: indicator.score,
          status: indicator.status as QualityStatus,
        };
      }
      totalScore += indicator.score;
      if (indicator.status !== "good") {
        issueCount++;
      }
    });

    return {
      averageScore: indicators.length > 0 ? totalScore / indicators.length : 0,
      totalSources: Object.keys(bySource).length,
      issueCount,
      bySource,
    };
  }

  // System Alerts
  async createAlert(alert: InsertSystemAlert): Promise<SystemAlert> {
    const supabase = await this.getSupabaseClient();
    const { data, error } = await supabase
      .from("system_alerts")
      .insert(alert)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getActiveAlerts(severity?: AlertSeverity): Promise<SystemAlert[]> {
    const supabase = await this.getSupabaseClient();
    let query = supabase
      .from("system_alerts")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (severity) {
      query = query.eq("severity", severity);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async acknowledgeAlert(alertId: string, acknowledgedBy: string) {
    const supabase = await this.getSupabaseClient();
    const { data, error } = await supabase
      .from("system_alerts")
      .update({
        status: "acknowledged",
        acknowledged_by: acknowledgedBy,
        acknowledged_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", alertId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async resolveAlert(alertId: string): Promise<SystemAlert> {
    const supabase = await this.getSupabaseClient();
    const { data, error } = await supabase
      .from("system_alerts")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("id", alertId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Performance Logs
  async logPerformance(
    log: InsertSystemPerformanceLog
  ): Promise<SystemPerformanceLog> {
    const supabase = await this.getSupabaseClient();
    const { data, error } = await supabase
      .from("system_performance_logs")
      .insert(log)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPerformanceLogs(
    serviceName?: string,
    operation?: string,
    limit: number = 100
  ): Promise<SystemPerformanceLog[]> {
    const supabase = await this.getSupabaseClient();
    let query = supabase
      .from("system_performance_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (serviceName) {
      query = query.eq("service_name", serviceName);
    }

    if (operation) {
      query = query.eq("operation", operation);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Real-time subscriptions
  async subscribeToHealthMetrics(
    callback: (payload: any) => void,
    serviceName?: string
  ) {
    const supabase = await this.getSupabaseClient();
    const channel = supabase.channel("health_metrics").on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "system_health_metrics",
        filter: serviceName ? `service_name=eq.${serviceName}` : undefined,
      },
      callback
    );

    return channel;
  }

  async subscribeToDataQuality(
    callback: (payload: any) => void,
    dataSource?: string
  ) {
    const supabase = await this.getSupabaseClient();
    const channel = supabase.channel("data_quality").on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "data_quality_indicators",
        filter: dataSource ? `data_source=eq.${dataSource}` : undefined,
      },
      callback
    );

    return channel;
  }

  async subscribeToAlerts(callback: (payload: any) => void) {
    const supabase = await this.getSupabaseClient();
    const channel = supabase.channel("system_alerts").on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "system_alerts",
      },
      callback
    );

    return channel;
  }

  // Health Status Summary
  async getSystemHealthSummary() {
    const [healthMetrics, , alerts] = await Promise.all([
      this.getHealthMetrics(undefined, undefined, 50),
      this.getDataQualityIndicators(undefined, undefined, 50),
      this.getActiveAlerts(),
    ]);

    const criticalCount = healthMetrics.filter(
      m => m.status === "critical"
    ).length;
    const warningCount = healthMetrics.filter(
      m => m.status === "warning"
    ).length;

    const overallStatus: HealthStatus =
      criticalCount > 0 ||
      alerts.filter(a => a.severity === "critical").length > 0
        ? "critical"
        : warningCount > 0 ||
            alerts.filter(a => a.severity === "high").length > 0
          ? "warning"
          : "healthy";

    return {
      status: overallStatus,
      criticalCount,
      warningCount,
      healthyCount: healthMetrics.length - criticalCount - warningCount,
      activeAlerts: alerts.length,
    };
  }
}

// Helper functions
export const createHealthMetric = (
  serviceName: string,
  metricType: MetricType,
  metricValue: number,
  unit: string,
  threshold?: { min?: number; max?: number }
): InsertSystemHealthMetric => ({
  service_name: serviceName,
  metric_type: metricType,
  metric_value: metricValue,
  unit,
  threshold_min: threshold?.min,
  threshold_max: threshold?.max,
  status: getHealthStatus(metricValue, threshold),
});

export const createDataQualityIndicator = (
  dataSource: string,
  tableName: string,
  qualityMetric: QualityMetricType,
  score: number,
  totalRecords = 0,
  validRecords = 0
): InsertDataQualityIndicator => ({
  data_source: dataSource,
  table_name: tableName,
  quality_metric: qualityMetric,
  score,
  total_records: totalRecords,
  valid_records: validRecords,
  invalid_records: totalRecords - validRecords,
  status: getQualityStatus(score),
  issues: [],
});

function getHealthStatus(
  value: number,
  threshold?: { min?: number; max?: number }
): HealthStatus {
  if (!threshold) return "healthy";

  if (threshold.max && value > threshold.max) return "critical";
  if (threshold.min && value < threshold.min) return "critical";
  if (threshold.max && value > threshold.max * 0.8) return "warning";
  if (threshold.min && value < threshold.min * 1.2) return "warning";

  return "healthy";
}

function getQualityStatus(score: number): QualityStatus {
  if (score >= 90) return "good";
  if (score >= 70) return "warning";
  return "poor";
}

// Singleton instance
export const monitoringService = new MonitoringService();
