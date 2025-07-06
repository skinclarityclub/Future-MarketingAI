/**
 * Executive Dashboard - Type Definitions
 * Defines all data structures and interfaces for KPI metrics
 */

/**
 * KPI Metric Types
 */
export type KPIType =
  | "revenue"
  | "profit"
  | "customers"
  | "conversion"
  | "growth"
  | "satisfaction";

/**
 * Time Period for data aggregation
 */
export type TimePeriod = "hour" | "day" | "week" | "month" | "quarter" | "year";

/**
 * Trend direction indicators
 */
export type TrendDirection = "up" | "down" | "neutral";

/**
 * Base KPI metric interface
 */
export interface KPIMetric {
  id: string;
  type: KPIType;
  title: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercentage?: number;
  trend: TrendDirection;
  unit: string;
  currency?: string;
  updatedAt: Date;
  period: TimePeriod;
}

/**
 * Revenue-specific KPI data
 */
export interface RevenueKPI extends KPIMetric {
  type: "revenue";
  breakdownByCategory?: Array<{
    category: string;
    value: number;
    percentage: number;
  }>;
  forecastValue?: number;
}

/**
 * Customer-specific KPI data
 */
export interface CustomerKPI extends KPIMetric {
  type: "customers";
  newCustomers?: number;
  churned?: number;
  retention?: number;
}

/**
 * Time series data point for charts
 */
export interface TimeSeriesDataPoint {
  timestamp: Date;
  value: number;
  label?: string;
}

/**
 * Chart data structure
 */
export interface ChartData {
  id: string;
  title: string;
  type: "line" | "bar" | "area" | "pie" | "donut";
  data: TimeSeriesDataPoint[];
  color?: string;
  unit?: string;
  currency?: string;
}

/**
 * Dashboard configuration interface
 */
export interface DashboardConfig {
  updateInterval: number;
  performanceTarget: number;
  isDevelopment: boolean;
  kpiRefreshRate: number;
  chartRefreshRate: number;
}

/**
 * Dashboard state interface
 */
export interface DashboardState {
  kpis: KPIMetric[];
  charts: ChartData[];
  lastUpdated: Date;
  isLoading: boolean;
  error: string | null;
}

/**
 * API Response wrapper
 */
export interface APIResponse<T> {
  data: T | null;
  error: string | null;
  timestamp: Date;
  success: boolean;
}

/**
 * Export functionality types
 */
export type ExportFormat = "csv" | "pdf" | "excel";

export interface ExportRequest {
  format: ExportFormat;
  kpiIds?: string[];
  chartIds?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  includeSummary?: boolean;
}

/**
 * Real-time subscription event types
 */
export interface RealtimeKPIUpdate {
  id: string;
  value: number;
  timestamp: Date;
  changeType: "update" | "insert" | "delete";
}

/**
 * Performance monitoring types
 */
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  dataFetchTime: number;
  chartRenderTime: number;
  lastMeasured: Date;
}
