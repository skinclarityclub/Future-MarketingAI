export type HealthStatus = "healthy" | "warning" | "critical";

export interface SystemHealthMetric {
  id: string;
  service_name: string;
  metric_type: string;
  metric_value: number;
  status: HealthStatus;
  timestamp: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface InsertSystemHealthMetric {
  service_name: string;
  metric_type: string;
  metric_value: number;
  status: HealthStatus;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface DataQualityIndicator {
  id: string;
  data_source: string;
  table_name: string;
  metric_name: string;
  score: number;
  threshold: number;
  status: HealthStatus;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface InsertDataQualityIndicator {
  data_source: string;
  table_name: string;
  metric_name: string;
  score: number;
  threshold: number;
  status: HealthStatus;
  metadata?: Record<string, any>;
}

export interface SystemAlert {
  id: string;
  alert_type: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  status: "active" | "acknowledged" | "resolved";
  source_service: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  metadata?: Record<string, any>;
}

export interface InsertSystemAlert {
  alert_type: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  source_service: string;
  metadata?: Record<string, any>;
}
