"use client";

import { dashboardClient } from "@/lib/supabase/dashboard-client";
import { useState, useEffect, useCallback } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Real-time data types
export interface RealtimeDataPoint {
  id: string;
  timestamp: string;
  metric_type: string;
  value: number;
  metadata?: Record<string, any>;
}

export interface RealtimeSubscriptionConfig {
  table: string;
  metric_types?: string[];
  refresh_interval?: number; // fallback polling interval in ms
  enable_polling?: boolean; // fallback when real-time fails
}

export interface ChartDataSubscription {
  data: any[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isRealtime: boolean;
}

/**
 * Real-time Data Service
 * Manages Supabase real-time subscriptions and provides fallback polling
 */
class RealTimeDataService {
  private subscriptions = new Map<string, RealtimeChannel>();
  private callbacks = new Map<string, Set<(data: any) => void>>();
  private pollingIntervals = new Map<string, NodeJS.Timeout>();
  private dataCache = new Map<string, any>();

  /**
   * Subscribe to real-time data updates
   */
  subscribe(
    key: string,
    config: RealtimeSubscriptionConfig,
    callback: (data: any) => void
  ): () => void {
    // Add callback to the set
    if (!this.callbacks.has(key)) {
      this.callbacks.set(key, new Set());
    }
    this.callbacks.get(key)!.add(callback);

    // Setup real-time subscription if not already done
    if (!this.subscriptions.has(key)) {
      this.setupRealtimeSubscription(key, config);
    }

    // Setup fallback polling if enabled
    if (config.enable_polling && !this.pollingIntervals.has(key)) {
      this.setupPolling(key, config);
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribe(key, callback);
    };
  }

  /**
   * Unsubscribe from real-time updates
   */
  private unsubscribe(key: string, callback: (data: any) => void) {
    const callbackSet = this.callbacks.get(key);
    if (callbackSet) {
      callbackSet.delete(callback);

      // If no more callbacks, cleanup subscription
      if (callbackSet.size === 0) {
        this.cleanup(key);
      }
    }
  }

  /**
   * Setup Supabase real-time subscription
   */
  private setupRealtimeSubscription(
    key: string,
    config: RealtimeSubscriptionConfig
  ) {
    try {
      const subscription = dashboardClient.subscribeToChanges(
        config.table,
        (payload: any) => {
          this.handleRealtimeUpdate(key, payload, config);
        },
        (error: string) => {
          console.warn(`Real-time subscription failed for ${key}: ${error}`);
          this.notifyCallbacks(key, { error, isRealtime: false });
        }
      );

      this.subscriptions.set(key, subscription);
    } catch (error) {
      console.error(
        `Failed to setup real-time subscription for ${key}:`,
        error
      );
    }
  }

  /**
   * Setup fallback polling
   */
  private setupPolling(key: string, config: RealtimeSubscriptionConfig) {
    const interval = setInterval(async () => {
      try {
        await this.fetchData(key, config);
      } catch (error) {
        console.warn(`Polling failed for ${key}:`, error);
      }
    }, config.refresh_interval || 30000);

    this.pollingIntervals.set(key, interval);
  }

  /**
   * Handle real-time data updates
   */
  private handleRealtimeUpdate(
    key: string,
    payload: any,
    config: RealtimeSubscriptionConfig
  ) {
    try {
      // Process the payload based on the event type
      const processedData = this.processRealtimePayload(payload, config);

      // Update cache
      this.dataCache.set(key, processedData);

      // Notify all callbacks
      this.notifyCallbacks(key, {
        data: processedData,
        lastUpdated: new Date(),
        isRealtime: true,
        error: null,
      });
    } catch (error) {
      console.error(`Error processing real-time update for ${key}:`, error);
      this.notifyCallbacks(key, {
        error: error instanceof Error ? error.message : "Unknown error",
        isRealtime: true,
      });
    }
  }

  /**
   * Process real-time payload into chart-friendly format
   */
  private processRealtimePayload(
    payload: any,
    config: RealtimeSubscriptionConfig
  ) {
    // Extract the actual data from Supabase real-time payload
    const record = payload.new || payload.old || payload.record;

    if (!record) {
      return null;
    }

    // Filter by metric types if specified
    if (
      config.metric_types &&
      !config.metric_types.includes(record.metric_type)
    ) {
      return null;
    }

    return record;
  }

  /**
   * Fetch data directly from Supabase (for polling fallback)
   */
  private async fetchData(key: string, config: RealtimeSubscriptionConfig) {
    try {
      const client = dashboardClient.getClient();
      let query = client.from(config.table).select("*");

      // Filter by metric types
      if (config.metric_types && config.metric_types.length > 0) {
        query = query.in("metric_type", config.metric_types);
      }

      // Order by timestamp desc, limit recent data
      query = query.order("timestamp", { ascending: false }).limit(100);

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      // Update cache and notify callbacks
      this.dataCache.set(key, data);
      this.notifyCallbacks(key, {
        data: data || [],
        lastUpdated: new Date(),
        isRealtime: false,
        error: null,
      });
    } catch (error) {
      console.error(`Failed to fetch data for ${key}:`, error);
      this.notifyCallbacks(key, {
        error: error instanceof Error ? error.message : "Unknown error",
        isRealtime: false,
      });
    }
  }

  /**
   * Notify all callbacks for a subscription
   */
  private notifyCallbacks(key: string, update: Partial<ChartDataSubscription>) {
    const callbacks = this.callbacks.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        callback(update);
      });
    }
  }

  /**
   * Cleanup subscription
   */
  private cleanup(key: string) {
    // Remove real-time subscription
    const subscription = this.subscriptions.get(key);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(key);
    }

    // Clear polling interval
    const interval = this.pollingIntervals.get(key);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(key);
    }

    // Clear callbacks and cache
    this.callbacks.delete(key);
    this.dataCache.delete(key);
  }

  /**
   * Get cached data for immediate loading
   */
  getCachedData(key: string) {
    return this.dataCache.get(key);
  }
}

// Singleton instance
export const realTimeDataService = new RealTimeDataService();

/**
 * React hook for real-time chart data
 */
export function useRealtimeChartData(
  key: string,
  config: RealtimeSubscriptionConfig,
  initialData?: any[]
): ChartDataSubscription {
  const [state, setState] = useState<ChartDataSubscription>({
    data: initialData || realTimeDataService.getCachedData(key) || [],
    loading: true,
    error: null,
    lastUpdated: null,
    isRealtime: false,
  });

  const updateState = useCallback((update: Partial<ChartDataSubscription>) => {
    setState(prev => ({
      ...prev,
      ...update,
      loading: false,
    }));
  }, []);

  useEffect(() => {
    const unsubscribe = realTimeDataService.subscribe(key, config, updateState);

    // Initial data fetch if no cached data
    if (!realTimeDataService.getCachedData(key)) {
      realTimeDataService["fetchData"](key, config);
    }

    return unsubscribe;
  }, [key, config.table, config.metric_types?.join(","), updateState]);

  return state;
}

/**
 * Transform real-time data for different chart types
 */
export class ChartDataTransformer {
  /**
   * Transform for revenue/financial charts
   */
  static forRevenueChart(data: RealtimeDataPoint[]) {
    const revenueData = data.filter(d => d.metric_type === "revenue");
    const groupedByDate = this.groupByDate(revenueData);

    return Object.entries(groupedByDate).map(([date, values]) => ({
      date,
      revenue: values.reduce((sum, v) => sum + v.value, 0),
      target: values[0]?.metadata?.target || 50000,
    }));
  }

  /**
   * Transform for performance metrics
   */
  static forPerformanceChart(data: RealtimeDataPoint[]) {
    const performanceData = data.filter(d =>
      ["page_views", "sessions", "conversions"].includes(d.metric_type)
    );
    const groupedByDate = this.groupByDateAndMetric(performanceData);

    return Object.entries(groupedByDate).map(([date, metrics]) => ({
      date,
      pageViews: metrics.page_views || 0,
      sessions: metrics.sessions || 0,
      conversions: metrics.conversions || 0,
    }));
  }

  /**
   * Transform for customer analytics
   */
  static forCustomerChart(data: RealtimeDataPoint[]) {
    const customerData = data.filter(d =>
      ["new_customers", "churned_customers", "retention_rate"].includes(
        d.metric_type
      )
    );
    const groupedByDate = this.groupByDateAndMetric(customerData);

    return Object.entries(groupedByDate).map(([date, metrics]) => ({
      date,
      newCustomers: metrics.new_customers || 0,
      churnedCustomers: metrics.churned_customers || 0,
      retentionRate: metrics.retention_rate || 0,
    }));
  }

  /**
   * Group data points by date
   */
  private static groupByDate(data: RealtimeDataPoint[]) {
    return data.reduce(
      (acc, point) => {
        const date = new Date(point.timestamp).toISOString().split("T")[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(point);
        return acc;
      },
      {} as Record<string, RealtimeDataPoint[]>
    );
  }

  /**
   * Group data points by date and metric type
   */
  private static groupByDateAndMetric(data: RealtimeDataPoint[]) {
    return data.reduce(
      (acc, point) => {
        const date = new Date(point.timestamp).toISOString().split("T")[0];
        if (!acc[date]) acc[date] = {};
        acc[date][point.metric_type] = point.value;
        return acc;
      },
      {} as Record<string, Record<string, number>>
    );
  }
}

/**
 * Pre-configured real-time subscriptions for common chart types
 */
export const REALTIME_CONFIGS = {
  revenue: {
    table: "metrics",
    metric_types: ["revenue", "target", "forecast"],
    refresh_interval: 60000, // 1 minute
    enable_polling: true,
  },
  performance: {
    table: "metrics",
    metric_types: ["page_views", "sessions", "conversions", "bounce_rate"],
    refresh_interval: 30000, // 30 seconds
    enable_polling: true,
  },
  customers: {
    table: "metrics",
    metric_types: ["new_customers", "churned_customers", "retention_rate"],
    refresh_interval: 120000, // 2 minutes
    enable_polling: true,
  },
  marketing: {
    table: "metrics",
    metric_types: [
      "google_ads",
      "facebook_ads",
      "email_marketing",
      "organic_search",
    ],
    refresh_interval: 60000, // 1 minute
    enable_polling: true,
  },
} as const;
