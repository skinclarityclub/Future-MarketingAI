// Analytics Module
// Hoofdexport voor alle analytics componenten

export * from "./real-time-core";
export { RealTimeDashboard } from "@/components/analytics/real-time-dashboard";

// Re-export types
export type {
  MetricType,
  TimeFrame,
  MetricDataPoint,
  MetricDefinition,
  AnalyticsSnapshot,
  Alert,
} from "./real-time-core";

// Factory function voor eenvoudige setup
export const createAnalytics = () => {
  return {
    core: () =>
      import("./real-time-core").then(m => m.createRealTimeAnalyticsCore()),
    dashboard: () =>
      import("@/components/analytics/real-time-dashboard").then(
        m => m.RealTimeDashboard
      ),
  };
};

// Default analytics configuratie
export const defaultAnalyticsConfig = {
  updateIntervalMs: 5000,
  retentionPeriodMs: 30 * 24 * 60 * 60 * 1000, // 30 days
  maxDataPointsPerMetric: 10000,
  enableRealTimeUpdates: true,
  alertThresholds: {
    ctr: { warning: 2.0, critical: 1.0 },
    engagement_rate: { warning: 5.0, critical: 2.0 },
    conversions: { warning: 10, critical: 5 },
    revenue: { warning: 1000, critical: 500 },
    reach: { warning: 1000, critical: 500 },
  },
};
