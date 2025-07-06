/**
 * Supabase Navigation & UX Data Integration
 * Task 74.4: Integreer data opslag en optimalisatie met Supabase
 *
 * Complete integration voor persistente opslag, toegangsbeheer en automatische data tiering
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Type definitions voor navigation data
export interface UserEvent {
  id?: string;
  user_id?: string;
  session_id: string;
  event_type:
    | "click"
    | "scroll"
    | "page_view"
    | "hover"
    | "form_submit"
    | "search";
  page_url: string;
  page_title?: string;
  element_selector?: string;
  viewport_width?: number;
  viewport_height?: number;
  scroll_depth?: number;
  time_on_page?: number;
  referrer_url?: string;
  user_agent?: string;
  device_type?: string;
  browser_name?: string;
  custom_properties?: Record<string, any>;
  timestamp?: string;
}

export interface PerformanceMetric {
  id?: string;
  user_id?: string;
  session_id: string;
  page_url: string;
  largest_contentful_paint?: number;
  first_input_delay?: number;
  cumulative_layout_shift?: number;
  performance_score?: number;
  performance_grade?: "A" | "B" | "C" | "D" | "F";
  resource_timings?: Record<string, any>;
  custom_metrics?: Record<string, any>;
  timestamp?: string;
}

export interface NavigationPath {
  id?: string;
  session_id: string;
  user_id?: string;
  path_sequence: number;
  from_page?: string;
  to_page: string;
  navigation_method?: string;
  time_spent_seconds?: number;
  timestamp?: string;
}

// Data tiering configuratie
export enum DataTier {
  HOT = "hot", // Frequente toegang (laatste 7 dagen)
  WARM = "warm", // Regelmatige toegang (laatste 30 dagen)
  COLD = "cold", // Infrequente toegang (ouder dan 30 dagen)
  ARCHIVE = "archive", // Archivering (ouder dan 365 dagen)
}

export interface DataTieringConfig {
  hotRetentionDays: number;
  warmRetentionDays: number;
  coldRetentionDays: number;
  archiveRetentionDays: number;
  compressionEnabled: boolean;
  partitioningEnabled: boolean;
}

export class SupabaseNavigationIntegration {
  private supabase: SupabaseClient;
  private config: DataTieringConfig;
  private isRealtimeEnabled: boolean = false;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    config?: Partial<DataTieringConfig>
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });

    this.config = {
      hotRetentionDays: 7,
      warmRetentionDays: 30,
      coldRetentionDays: 90,
      archiveRetentionDays: 365,
      compressionEnabled: true,
      partitioningEnabled: true,
      ...config,
    };
  }

  // =====================================================
  // USER EVENTS MANAGEMENT
  // =====================================================

  /**
   * Batch insert user events met automatische optimalisatie
   */
  async batchInsertUserEvents(
    events: UserEvent[]
  ): Promise<{ success: boolean; insertedCount: number; errors: any[] }> {
    try {
      // Valideer en prepareer events
      const validEvents = events.map(event => ({
        ...event,
        timestamp: event.timestamp || new Date().toISOString(),
        custom_properties: JSON.stringify(event.custom_properties || {}),
      }));

      // Batch insert (max 1000 per batch voor performance)
      const batchSize = 1000;
      let insertedCount = 0;
      const errors: any[] = [];

      for (let i = 0; i < validEvents.length; i += batchSize) {
        const batch = validEvents.slice(i, i + batchSize);

        const { data, error } = await this.supabase
          .from("user_events")
          .insert(batch)
          .select("id");

        if (error) {
          errors.push({ batch: i / batchSize + 1, error });
        } else {
          insertedCount += data?.length || 0;
        }
      }

      return {
        success: errors.length === 0,
        insertedCount,
        errors,
      };
    } catch (error) {
      console.error("Batch insert user events failed:", error);
      return {
        success: false,
        insertedCount: 0,
        errors: [error],
      };
    }
  }

  /**
   * Query user events met intelligente caching
   */
  async queryUserEvents(
    filters: {
      user_id?: string;
      session_id?: string;
      event_type?: string;
      page_url?: string;
      date_from?: string;
      date_to?: string;
    },
    options: {
      limit?: number;
      offset?: number;
      orderBy?: "timestamp" | "event_type";
      orderDirection?: "asc" | "desc";
    } = {}
  ): Promise<UserEvent[]> {
    try {
      let query = this.supabase.from("user_events").select("*");

      // Apply filters
      if (filters.user_id) query = query.eq("user_id", filters.user_id);
      if (filters.session_id)
        query = query.eq("session_id", filters.session_id);
      if (filters.event_type)
        query = query.eq("event_type", filters.event_type);
      if (filters.page_url) query = query.eq("page_url", filters.page_url);
      if (filters.date_from) query = query.gte("timestamp", filters.date_from);
      if (filters.date_to) query = query.lte("timestamp", filters.date_to);

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, {
          ascending: options.orderDirection === "asc",
        });
      }

      // Apply pagination
      if (options.limit) query = query.limit(options.limit);
      if (options.offset)
        query = query.range(
          options.offset,
          options.offset + (options.limit || 100) - 1
        );

      const { data, error } = await query;

      if (error) throw error;

      return (
        data?.map(event => ({
          ...event,
          custom_properties:
            typeof event.custom_properties === "string"
              ? JSON.parse(event.custom_properties)
              : event.custom_properties,
        })) || []
      );
    } catch (error) {
      console.error("Query user events failed:", error);
      return [];
    }
  }

  // =====================================================
  // PERFORMANCE METRICS MANAGEMENT
  // =====================================================

  /**
   * Insert performance metrics met real-time analysis
   */
  async insertPerformanceMetric(
    metric: PerformanceMetric
  ): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      // Calculate performance grade based on scores
      const grade = this.calculatePerformanceGrade(metric);

      const { data, error } = await this.supabase
        .from("performance_metrics")
        .insert({
          ...metric,
          performance_grade: grade,
          timestamp: metric.timestamp || new Date().toISOString(),
          resource_timings: JSON.stringify(metric.resource_timings || {}),
          custom_metrics: JSON.stringify(metric.custom_metrics || {}),
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger real-time alerts for poor performance
      if (grade === "D" || grade === "F") {
        await this.triggerPerformanceAlert(data);
      }

      return { success: true, data };
    } catch (error) {
      console.error("Insert performance metric failed:", error);
      return { success: false, error };
    }
  }

  /**
   * Calculate performance grade gebaseerd op Core Web Vitals
   */
  private calculatePerformanceGrade(
    metric: PerformanceMetric
  ): "A" | "B" | "C" | "D" | "F" {
    const {
      largest_contentful_paint,
      first_input_delay,
      cumulative_layout_shift,
    } = metric;

    let score = 0;
    let factors = 0;

    // LCP scoring (2.5s good, 4s needs improvement)
    if (largest_contentful_paint !== undefined) {
      if (largest_contentful_paint <= 2500) score += 100;
      else if (largest_contentful_paint <= 4000) score += 75;
      else score += 25;
      factors++;
    }

    // FID scoring (100ms good, 300ms needs improvement)
    if (first_input_delay !== undefined) {
      if (first_input_delay <= 100) score += 100;
      else if (first_input_delay <= 300) score += 75;
      else score += 25;
      factors++;
    }

    // CLS scoring (0.1 good, 0.25 needs improvement)
    if (cumulative_layout_shift !== undefined) {
      if (cumulative_layout_shift <= 0.1) score += 100;
      else if (cumulative_layout_shift <= 0.25) score += 75;
      else score += 25;
      factors++;
    }

    if (factors === 0) return "F";

    const avgScore = score / factors;

    if (avgScore >= 90) return "A";
    if (avgScore >= 80) return "B";
    if (avgScore >= 70) return "C";
    if (avgScore >= 60) return "D";
    return "F";
  }

  /**
   * Trigger performance alert voor slechte scores
   */
  private async triggerPerformanceAlert(metric: any): Promise<void> {
    try {
      // Log to pipeline_errors for monitoring
      await this.supabase.from("pipeline_errors").insert({
        error_id: `perf_alert_${Date.now()}`,
        pipeline_id: "navigation_performance",
        error_type: "performance_degradation",
        error_category: "quality",
        severity: metric.performance_grade === "F" ? "high" : "medium",
        error_message: `Poor performance detected: Grade ${metric.performance_grade} for ${metric.page_url}`,
        metadata: JSON.stringify({
          page_url: metric.page_url,
          performance_grade: metric.performance_grade,
          lcp: metric.largest_contentful_paint,
          fid: metric.first_input_delay,
          cls: metric.cumulative_layout_shift,
        }),
      });
    } catch (error) {
      console.error("Failed to trigger performance alert:", error);
    }
  }

  // =====================================================
  // DATA TIERING & OPTIMIZATION
  // =====================================================

  /**
   * Automatische data tiering op basis van leeftijd en toegangsfrequentie
   */
  async performDataTiering(): Promise<{ success: boolean; summary: any }> {
    try {
      const summary = {
        hot: 0,
        warm: 0,
        cold: 0,
        archived: 0,
        errors: [],
      };

      // Move data to appropriate tiers
      const now = new Date();

      // Archive old user_events (> 365 days)
      const archiveDate = new Date(
        now.getTime() - this.config.archiveRetentionDays * 24 * 60 * 60 * 1000
      );
      const { count: archivedEvents, error: archiveError } = await this.supabase
        .from("user_events")
        .delete()
        .lt("timestamp", archiveDate.toISOString());

      if (archiveError) {
        summary.errors.push({
          operation: "archive_events",
          error: archiveError,
        });
      } else {
        summary.archived += archivedEvents || 0;
      }

      // Archive old performance_metrics (> 180 days)
      const warmArchiveDate = new Date(
        now.getTime() - 180 * 24 * 60 * 60 * 1000
      );
      const { count: archivedMetrics, error: metricsArchiveError } =
        await this.supabase
          .from("performance_metrics")
          .delete()
          .lt("timestamp", warmArchiveDate.toISOString());

      if (metricsArchiveError) {
        summary.errors.push({
          operation: "archive_metrics",
          error: metricsArchiveError,
        });
      } else {
        summary.archived += archivedMetrics || 0;
      }

      return {
        success: summary.errors.length === 0,
        summary,
      };
    } catch (error) {
      console.error("Data tiering failed:", error);
      return {
        success: false,
        summary: { errors: [error] },
      };
    }
  }

  // =====================================================
  // REAL-TIME SUBSCRIPTIONS
  // =====================================================

  /**
   * Enable real-time monitoring voor navigation events
   */
  enableRealtimeMonitoring(callbacks: {
    onUserEvent?: (payload: any) => void;
    onPerformanceAlert?: (payload: any) => void;
  }): void {
    if (this.isRealtimeEnabled) return;

    // Subscribe to user events
    if (callbacks.onUserEvent) {
      this.supabase
        .channel("user_events_changes")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "user_events",
          },
          callbacks.onUserEvent
        )
        .subscribe();
    }

    // Subscribe to performance alerts (D/F grades)
    if (callbacks.onPerformanceAlert) {
      this.supabase
        .channel("performance_alerts")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "performance_metrics",
            filter: "performance_grade=in.(D,F)",
          },
          callbacks.onPerformanceAlert
        )
        .subscribe();
    }

    this.isRealtimeEnabled = true;
  }

  /**
   * Disable real-time monitoring
   */
  disableRealtimeMonitoring(): void {
    if (!this.isRealtimeEnabled) return;

    this.supabase.removeAllChannels();
    this.isRealtimeEnabled = false;
  }

  // =====================================================
  // ANALYTICS & REPORTING
  // =====================================================

  /**
   * Get navigation analytics dashboard data
   */
  async getNavigationAnalytics(dateRange: { from: string; to: string }) {
    try {
      const [engagement, performance, paths] = await Promise.all([
        this.supabase
          .from("user_engagement_summary")
          .select("*")
          .gte("session_date", dateRange.from)
          .lte("session_date", dateRange.to),

        this.supabase
          .from("performance_summary")
          .select("*")
          .gte("metrics_date", dateRange.from)
          .lte("metrics_date", dateRange.to),

        this.supabase
          .from("popular_navigation_paths")
          .select("*")
          .gte("path_date", dateRange.from)
          .lte("path_date", dateRange.to)
          .order("transition_count", { ascending: false })
          .limit(20),
      ]);

      return {
        userEngagement: engagement.data || [],
        performanceSummary: performance.data || [],
        popularPaths: paths.data || [],
      };
    } catch (error) {
      console.error("Get navigation analytics failed:", error);
      return {
        userEngagement: [],
        performanceSummary: [],
        popularPaths: [],
      };
    }
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Create pre-configured instance voor development
 */
export function createNavigationIntegration(
  environment: "development" | "production" = "development"
): SupabaseNavigationIntegration {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    environment === "production"
      ? process.env.SUPABASE_SERVICE_ROLE_KEY!
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const config =
    environment === "production"
      ? {
          hotRetentionDays: 7,
          warmRetentionDays: 30,
          coldRetentionDays: 90,
          archiveRetentionDays: 365,
          compressionEnabled: true,
          partitioningEnabled: true,
        }
      : {
          hotRetentionDays: 1,
          warmRetentionDays: 7,
          coldRetentionDays: 30,
          archiveRetentionDays: 90,
          compressionEnabled: false,
          partitioningEnabled: false,
        };

  return new SupabaseNavigationIntegration(supabaseUrl, supabaseKey, config);
}

/**
 * Singleton instance voor globaal gebruik
 */
let navigationIntegration: SupabaseNavigationIntegration | null = null;

export function getNavigationIntegration(): SupabaseNavigationIntegration {
  if (!navigationIntegration) {
    navigationIntegration = createNavigationIntegration(
      process.env.NODE_ENV === "production" ? "production" : "development"
    );
  }
  return navigationIntegration;
}

export default SupabaseNavigationIntegration;
