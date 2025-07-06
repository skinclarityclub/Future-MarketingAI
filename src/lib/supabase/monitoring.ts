import { supabaseInstance } from "@/lib/supabase/instance";
import type {
  SystemHealthMetric,
  DataQualityIndicator,
  SystemAlert,
  HealthStatus,
  InsertSystemHealthMetric,
  InsertDataQualityIndicator,
  InsertSystemAlert,
} from "@/lib/types/monitoring";

/**
 * Monitoring service for system health and data quality
 */
export class MonitoringService {
  private supabase;
  private isServerSide: boolean;

  constructor(isServerSide: boolean = false) {
    this.supabase = supabaseInstance;
    this.isServerSide = isServerSide;
  }

  /**
   * Record system health metric
   */
  async recordHealthMetric(
    metric: Omit<InsertSystemHealthMetric, "id" | "created_at" | "timestamp">
  ): Promise<SystemHealthMetric | null> {
    try {
      const { data, error } = await this.supabase
        .from("system_health_metrics")
        .insert({
          ...metric,
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error recording health metric:", error);
        }
        return null;
      }

      return data;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to record health metric:", error);
      }
      return null;
    }
  }

  /**
   * Record data quality indicator
   */
  async recordDataQuality(
    indicator: Omit<InsertDataQualityIndicator, "id" | "created_at">
  ): Promise<DataQualityIndicator | null> {
    try {
      const { data, error } = await this.supabase
        .from("data_quality_indicators")
        .insert(indicator)
        .select()
        .single();

      if (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error recording data quality indicator:", error);
        }
        return null;
      }

      return data;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to record data quality indicator:", error);
      }
      return null;
    }
  }

  /**
   * Create system alert
   */
  async createAlert(
    alert: Omit<InsertSystemAlert, "id" | "created_at" | "updated_at">
  ): Promise<SystemAlert | null> {
    try {
      const { data, error } = await this.supabase
        .from("system_alerts")
        .insert({
          ...alert,
          status: "active",
        })
        .select()
        .single();

      if (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error creating alert:", error);
        }
        return null;
      }

      return data;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to create alert:", error);
      }
      return null;
    }
  }

  /**
   * Get current system health status
   */
  async getSystemHealth(): Promise<{
    overall_status: HealthStatus;
    metrics: SystemHealthMetric[];
    issues: number;
  }> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const { data: metrics, error } = await this.supabase
        .from("system_health_metrics")
        .select("*")
        .gte("timestamp", fiveMinutesAgo)
        .order("timestamp", { ascending: false });

      if (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error fetching system health:", error);
        }
        return {
          overall_status: "critical",
          metrics: [],
          issues: 1,
        };
      }

      const issues =
        metrics?.filter(
          (m: SystemHealthMetric) =>
            m.status === "critical" || m.status === "warning"
        ).length || 0;
      const criticalIssues =
        metrics?.filter((m: SystemHealthMetric) => m.status === "critical")
          .length || 0;

      let overall_status: HealthStatus = "healthy";
      if (criticalIssues > 0) {
        overall_status = "critical";
      } else if (issues > 0) {
        overall_status = "warning";
      }

      return {
        overall_status,
        metrics: metrics || [],
        issues,
      };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to get system health:", error);
      }
      return {
        overall_status: "critical",
        metrics: [],
        issues: 1,
      };
    }
  }

  /**
   * Get data quality overview
   */
  async getDataQuality(): Promise<{
    overall_score: number;
    indicators: DataQualityIndicator[];
    poor_quality_sources: string[];
  }> {
    try {
      const { data: indicators, error } = await this.supabase
        .from("data_quality_indicators")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error fetching data quality:", error);
        }
        return {
          overall_score: 0,
          indicators: [],
          poor_quality_sources: [],
        };
      }

      const totalScore =
        indicators?.reduce(
          (sum: number, ind: DataQualityIndicator) => sum + ind.score,
          0
        ) || 0;
      const overall_score = indicators?.length
        ? totalScore / indicators.length
        : 0;

      const poor_quality_sources =
        indicators
          ?.filter((ind: DataQualityIndicator) => ind.score < 0.7)
          .map((ind: DataQualityIndicator) => ind.data_source) || [];

      return {
        overall_score,
        indicators: indicators || [],
        poor_quality_sources: [...new Set(poor_quality_sources)] as string[],
      };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to get data quality:", error);
      }
      return {
        overall_score: 0,
        indicators: [],
        poor_quality_sources: [],
      };
    }
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts(): Promise<SystemAlert[]> {
    try {
      const { data, error } = await this.supabase
        .from("system_alerts")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error fetching active alerts:", error);
        }
        return [];
      }

      return data || [];
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to get active alerts:", error);
      }
      return [];
    }
  }
}

// Export convenience functions
export const recordPerformanceMetric = async (
  serviceName: string,
  operation: string,
  durationMs: number,
  memoryUsageMb?: number
) => {
  const monitoring = new MonitoringService();
  return monitoring.recordHealthMetric({
    service_name: serviceName,
    metric_type: operation,
    metric_value: durationMs,
    status: durationMs > 5000 ? "warning" : "healthy",
    metadata: {
      memory_usage_mb: memoryUsageMb,
      operation_type: "performance",
    },
  });
};

export const recordDataSourceQuality = async (
  dataSource: string,
  tableName: string,
  totalRecords: number,
  validRecords: number
) => {
  const monitoring = new MonitoringService();
  const score = totalRecords > 0 ? validRecords / totalRecords : 0;

  return monitoring.recordDataQuality({
    data_source: dataSource,
    table_name: tableName,
    metric_name: "data_completeness",
    score,
    threshold: 0.95,
    status: score >= 0.95 ? "healthy" : score >= 0.8 ? "warning" : "critical",
    metadata: {
      total_records: totalRecords,
      valid_records: validRecords,
      invalid_records: totalRecords - validRecords,
    },
  });
};

// Export instance
export const monitoringService = new MonitoringService();

// Export client-side monitoring instance
export const clientMonitoring = new MonitoringService(false);

// Export server-side monitoring instance
export const serverMonitoring = new MonitoringService(true);
