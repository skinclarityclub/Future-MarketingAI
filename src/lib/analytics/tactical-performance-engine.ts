/**
 * Tactical Performance Engine
 * High-performance, scalable version of the tactical data analysis engine
 * Optimized for real-time processing and large datasets
 */

import { createClient } from "@/lib/supabase/server";
import { createShopifyService } from "@/lib/apis/shopify";
import { createKajabiService } from "@/lib/apis/kajabi";
import {
  createDemoShopifyService,
  createDemoKajabiService,
  shouldUseDemoMode,
} from "@/lib/apis/demo-services";
import {
  TacticalDataPoint,
  DataIntegrationResult,
  TacticalEngineConfig,
} from "./tactical-data-engine";

// Performance monitoring types
export interface PerformanceMetrics {
  operation: string;
  start_time: number;
  end_time: number;
  duration_ms: number;
  data_points_processed: number;
  memory_usage_mb: number;
  cache_hits?: number;
  cache_misses?: number;
}

export interface CacheEntry {
  key: string;
  data: any;
  created_at: number;
  expires_at: number;
  access_count: number;
  last_accessed: number;
}

export interface ProcessingQueue {
  id: string;
  operation: string;
  priority: "low" | "medium" | "high" | "critical";
  parameters: any;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: number;
  started_at?: number;
  completed_at?: number;
  result?: any;
  error?: string;
}

/**
 * High-Performance Tactical Data Analysis Engine
 */
export class TacticalPerformanceEngine {
  private supabase;
  private shopifyService;
  private kajabiService;
  private config: TacticalEngineConfig;

  // Performance optimization components
  private cache: Map<string, CacheEntry> = new Map();
  private processingQueue: Map<string, ProcessingQueue> = new Map();
  private performanceMetrics: PerformanceMetrics[] = [];
  private connectionPool: Map<string, any> = new Map();
  private batchSize: number = 1000;
  private maxCacheSize: number = 500;
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes
  private maxConcurrentOperations: number = 10;
  private currentOperations: number = 0;

  constructor(config: Partial<TacticalEngineConfig> = {}) {
    this.supabase = createClient();

    // Initialize services based on demo mode
    if (shouldUseDemoMode()) {
      this.shopifyService = createDemoShopifyService();
      this.kajabiService = createDemoKajabiService();
    } else {
      this.shopifyService = createShopifyService();
      this.kajabiService = createKajabiService();
    }

    // Enhanced configuration for performance
    this.config = {
      shopify_enabled: true,
      kajabi_enabled: true,
      financial_enabled: true,
      marketing_enabled: true,
      lookback_days: 90,
      prediction_horizon_days: 30,
      min_confidence_threshold: 70,
      ...config,
    };

    // Initialize performance monitoring
    this.initializePerformanceMonitoring();

    // Start cache cleanup interval
    this.startCacheCleanup();
  }

  /**
   * High-performance data integration with parallel processing and caching
   */
  async integrateDataOptimized(dateRange?: {
    startDate: string;
    endDate: string;
  }): Promise<DataIntegrationResult> {
    const startTime = Date.now();
    const operation = "integrate_data_optimized";

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey("integrate_data", dateRange);
      const cachedResult = this.getFromCache(cacheKey);

      if (cachedResult) {
        this.recordPerformanceMetric({
          operation: operation + "_cached",
          start_time: startTime,
          end_time: Date.now(),
          duration_ms: Date.now() - startTime,
          data_points_processed: cachedResult.data_points.length,
          memory_usage_mb: this.getMemoryUsage(),
          cache_hits: 1,
          cache_misses: 0,
        });

        return cachedResult;
      }

      // Wait for available processing slot
      await this.waitForProcessingSlot();

      const endDate = dateRange?.endDate || new Date().toISOString();
      const startDate =
        dateRange?.startDate ||
        new Date(
          Date.now() - this.config.lookback_days * 24 * 60 * 60 * 1000
        ).toISOString();

      // Parallel data integration
      const integrationPromises = [];
      const errors: string[] = [];

      if (this.config.shopify_enabled) {
        integrationPromises.push(
          this.integrateShopifyDataOptimized(startDate, endDate).catch(
            error => ({ error: `Shopify: ${error}`, data: [] })
          )
        );
      }

      if (this.config.kajabi_enabled) {
        integrationPromises.push(
          this.integrateKajabiDataOptimized(startDate, endDate).catch(
            error => ({ error: `Kajabi: ${error}`, data: [] })
          )
        );
      }

      if (this.config.financial_enabled) {
        integrationPromises.push(
          this.integrateFinancialDataOptimized(startDate, endDate).catch(
            error => ({ error: `Financial: ${error}`, data: [] })
          )
        );
      }

      if (this.config.marketing_enabled) {
        integrationPromises.push(
          this.integrateMarketingDataOptimized(startDate, endDate).catch(
            error => ({ error: `Marketing: ${error}`, data: [] })
          )
        );
      }

      // Execute all integrations in parallel
      const results = await Promise.all(integrationPromises);
      const allDataPoints: TacticalDataPoint[] = [];

      // Process results
      for (const result of results) {
        if (result.error) {
          errors.push(result.error);
        } else {
          allDataPoints.push(...(result.data || result));
        }
      }

      // Optimize data processing with efficient sorting
      const sortedDataPoints = this.efficientSort(allDataPoints);

      // Batch storage for better performance
      await this.storeTacticalDataBatch(sortedDataPoints);

      const processingTime = Date.now() - startTime;

      const result: DataIntegrationResult = {
        success: errors.length === 0,
        data_points: sortedDataPoints,
        errors,
        processing_time: processingTime,
        last_updated: new Date().toISOString(),
      };

      // Cache the result
      this.setToCache(cacheKey, result);

      // Record performance metrics
      this.recordPerformanceMetric({
        operation,
        start_time: startTime,
        end_time: Date.now(),
        duration_ms: processingTime,
        data_points_processed: sortedDataPoints.length,
        memory_usage_mb: this.getMemoryUsage(),
        cache_hits: 0,
        cache_misses: 1,
      });

      return result;
    } catch (error) {
      const processingTime = Date.now() - startTime;

      this.recordPerformanceMetric({
        operation: operation + "_error",
        start_time: startTime,
        end_time: Date.now(),
        duration_ms: processingTime,
        data_points_processed: 0,
        memory_usage_mb: this.getMemoryUsage(),
      });

      return {
        success: false,
        data_points: [],
        errors: [`Critical error: ${error}`],
        processing_time: processingTime,
        last_updated: new Date().toISOString(),
      };
    } finally {
      this.currentOperations--;
    }
  }

  /**
   * Optimized Shopify data integration with batch processing
   */
  private async integrateShopifyDataOptimized(
    startDate: string,
    endDate: string
  ): Promise<TacticalDataPoint[]> {
    const cacheKey = this.generateCacheKey("shopify_data", {
      startDate,
      endDate,
    });
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return cached;
    }

    const dataPoints: TacticalDataPoint[] = [];

    // Use optimized query with proper indexing
    const supabaseClient = await this.supabase;
    const { data: shopifySales, error: shopifyError } = await supabaseClient
      .from("shopify_sales")
      .select("order_date, total_amount, product_id, customer_id, quantity")
      .gte("order_date", startDate)
      .lte("order_date", endDate)
      .order("order_date", { ascending: true })
      .limit(10000); // Prevent memory issues

    if (shopifyError) {
      throw new Error(`Shopify data fetch error: ${shopifyError.message}`);
    }

    if (shopifySales) {
      // Process in batches for better memory management
      const batches = this.createBatches(shopifySales, this.batchSize);

      for (const batch of batches) {
        const batchDataPoints = batch.map(sale => ({
          timestamp: sale.order_date,
          value: sale.total_amount || 0,
          source: "shopify" as const,
          category: "revenue",
          metadata: {
            product_id: sale.product_id,
            customer_id: sale.customer_id,
            quantity: sale.quantity,
          },
        }));

        dataPoints.push(...batchDataPoints);
      }
    }

    // Cache the result
    this.setToCache(cacheKey, dataPoints);

    return dataPoints;
  }

  /**
   * Optimized Kajabi data integration
   */
  private async integrateKajabiDataOptimized(
    startDate: string,
    endDate: string
  ): Promise<TacticalDataPoint[]> {
    const cacheKey = this.generateCacheKey("kajabi_data", {
      startDate,
      endDate,
    });
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return cached;
    }

    const dataPoints: TacticalDataPoint[] = [];

    // Optimized Kajabi data query
    const { data: kajabiSales, error: kajabiError } = await this.supabase
      .from("kajabi_sales")
      .select("sale_date, amount, product_name, customer_email")
      .gte("sale_date", startDate)
      .lte("sale_date", endDate)
      .order("sale_date", { ascending: true })
      .limit(10000);

    if (kajabiError) {
      throw new Error(`Kajabi data fetch error: ${kajabiError.message}`);
    }

    if (kajabiSales) {
      const batchDataPoints = kajabiSales.map(sale => ({
        timestamp: sale.sale_date,
        value: sale.amount || 0,
        source: "kajabi" as const,
        category: "revenue",
        metadata: {
          product_name: sale.product_name,
          customer_email: sale.customer_email,
        },
      }));

      dataPoints.push(...batchDataPoints);
    }

    this.setToCache(cacheKey, dataPoints);
    return dataPoints;
  }

  /**
   * Optimized financial data integration
   */
  private async integrateFinancialDataOptimized(
    startDate: string,
    endDate: string
  ): Promise<TacticalDataPoint[]> {
    const cacheKey = this.generateCacheKey("financial_data", {
      startDate,
      endDate,
    });
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return cached;
    }

    const dataPoints: TacticalDataPoint[] = [];

    // Optimized financial data queries with parallel execution
    const [expensesResult, revenueResult] = await Promise.allSettled([
      this.supabase
        .from("expenses")
        .select("date, amount, category, description")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true }),

      this.supabase
        .from("revenue_streams")
        .select("date, amount, source, description")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true }),
    ]);

    // Process expenses
    if (expensesResult.status === "fulfilled" && expensesResult.value.data) {
      const expenseDataPoints = expensesResult.value.data.map(expense => ({
        timestamp: expense.date,
        value: -(expense.amount || 0), // Negative for expenses
        source: "financial" as const,
        category: "expenses",
        metadata: {
          expense_category: expense.category,
          description: expense.description,
        },
      }));
      dataPoints.push(...expenseDataPoints);
    }

    // Process revenue
    if (revenueResult.status === "fulfilled" && revenueResult.value.data) {
      const revenueDataPoints = revenueResult.value.data.map(revenue => ({
        timestamp: revenue.date,
        value: revenue.amount || 0,
        source: "financial" as const,
        category: "revenue",
        metadata: {
          revenue_source: revenue.source,
          description: revenue.description,
        },
      }));
      dataPoints.push(...revenueDataPoints);
    }

    this.setToCache(cacheKey, dataPoints);
    return dataPoints;
  }

  /**
   * Optimized marketing data integration
   */
  private async integrateMarketingDataOptimized(
    startDate: string,
    endDate: string
  ): Promise<TacticalDataPoint[]> {
    const cacheKey = this.generateCacheKey("marketing_data", {
      startDate,
      endDate,
    });
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return cached;
    }

    const dataPoints: TacticalDataPoint[] = [];

    // Optimized marketing metrics query
    const { data: marketingMetrics, error: marketingError } =
      await this.supabase
        .from("marketing_metrics")
        .select("date, metric_name, metric_value, campaign_id, channel")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true })
        .limit(20000); // Marketing data can be high-volume

    if (marketingError) {
      throw new Error(`Marketing data fetch error: ${marketingError.message}`);
    }

    if (marketingMetrics) {
      const marketingDataPoints = marketingMetrics.map(metric => ({
        timestamp: metric.date,
        value: metric.metric_value || 0,
        source: "marketing" as const,
        category: metric.metric_name || "general",
        metadata: {
          campaign_id: metric.campaign_id,
          channel: metric.channel,
        },
      }));
      dataPoints.push(...marketingDataPoints);
    }

    this.setToCache(cacheKey, dataPoints);
    return dataPoints;
  }

  /**
   * Efficient batch storage with connection pooling
   */
  private async storeTacticalDataBatch(
    dataPoints: TacticalDataPoint[]
  ): Promise<void> {
    if (dataPoints.length === 0) return;

    const batches = this.createBatches(dataPoints, this.batchSize);

    // Process batches in parallel with controlled concurrency
    const batchPromises = batches.map(async (batch, index) => {
      try {
        const transformedData = batch.map(point => ({
          timestamp: point.timestamp,
          value: point.value,
          source: point.source,
          category: point.category,
          metadata: point.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        // Use upsert for better performance
        const { error } = await this.supabase
          .from("tactical_data_points")
          .upsert(transformedData, {
            onConflict: "timestamp,source,category",
            ignoreDuplicates: false,
          });

        if (error) {
          console.error(`Batch ${index} storage error:`, error);
          throw error;
        }
      } catch (error) {
        console.error(`Error storing batch ${index}:`, error);
        throw error;
      }
    });

    // Wait for all batches to complete
    await Promise.all(batchPromises);
  }

  /**
   * Real-time data streaming for live updates
   */
  async startRealTimeProcessing(
    callback: (data: TacticalDataPoint[]) => void
  ): Promise<void> {
    // Set up real-time subscription to data changes
    const subscription = this.supabase
      .channel("tactical_data_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tactical_data_points",
        },
        payload => {
          // Process new data point
          const newDataPoint: TacticalDataPoint = {
            timestamp: payload.new.timestamp,
            value: payload.new.value,
            source: payload.new.source,
            category: payload.new.category,
            metadata: payload.new.metadata,
          };

          // Trigger callback with new data
          callback([newDataPoint]);

          // Invalidate relevant cache entries
          this.invalidateRelatedCache(newDataPoint);
        }
      )
      .subscribe();

    console.log("Real-time processing started");
  }

  /**
   * Performance-optimized aggregated data retrieval
   */
  async getAggregatedDataOptimized(params: {
    categories?: string[];
    sources?: string[];
    groupBy: "day" | "week" | "month";
    startDate: string;
    endDate: string;
  }): Promise<Record<string, any[]>> {
    const cacheKey = this.generateCacheKey("aggregated_data", params);
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return cached;
    }

    const startTime = Date.now();

    // Build optimized query
    let query = this.supabase
      .from("tactical_data_points")
      .select("timestamp, value, source, category")
      .gte("timestamp", params.startDate)
      .lte("timestamp", params.endDate);

    if (params.categories?.length) {
      query = query.in("category", params.categories);
    }

    if (params.sources?.length) {
      query = query.in("source", params.sources);
    }

    const { data, error } = await query.order("timestamp", { ascending: true });

    if (error) {
      throw new Error(`Aggregated data fetch error: ${error.message}`);
    }

    // Process aggregation efficiently
    const result = this.processAggregationOptimized(data || [], params.groupBy);

    // Cache the result
    this.setToCache(cacheKey, result);

    // Record performance
    this.recordPerformanceMetric({
      operation: "get_aggregated_data_optimized",
      start_time: startTime,
      end_time: Date.now(),
      duration_ms: Date.now() - startTime,
      data_points_processed: data?.length || 0,
      memory_usage_mb: this.getMemoryUsage(),
    });

    return result;
  }

  /**
   * Get performance metrics and health status
   */
  getPerformanceReport(): {
    metrics: PerformanceMetrics[];
    cache_stats: {
      size: number;
      hit_rate: number;
      memory_usage: number;
    };
    system_health: {
      memory_usage_mb: number;
      active_operations: number;
      queue_size: number;
      uptime_ms: number;
    };
  } {
    const cacheHits = this.performanceMetrics.reduce(
      (sum, m) => sum + (m.cache_hits || 0),
      0
    );
    const cacheMisses = this.performanceMetrics.reduce(
      (sum, m) => sum + (m.cache_misses || 0),
      0
    );
    const hitRate =
      cacheHits + cacheMisses > 0 ? cacheHits / (cacheHits + cacheMisses) : 0;

    return {
      metrics: this.performanceMetrics.slice(-100), // Last 100 operations
      cache_stats: {
        size: this.cache.size,
        hit_rate: hitRate,
        memory_usage: this.getCacheMemoryUsage(),
      },
      system_health: {
        memory_usage_mb: this.getMemoryUsage(),
        active_operations: this.currentOperations,
        queue_size: this.processingQueue.size,
        uptime_ms: Date.now() - this.startTime,
      },
    };
  }

  // Helper methods for performance optimization
  private generateCacheKey(operation: string, params?: any): string {
    return `${operation}_${JSON.stringify(params || {})}_${this.hashParams(params)}`;
  }

  private hashParams(params: any): string {
    return params ? btoa(JSON.stringify(params)).slice(0, 8) : "";
  }

  private getFromCache(key: string): any {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expires_at) {
      this.cache.delete(key);
      return null;
    }

    entry.access_count++;
    entry.last_accessed = Date.now();

    return entry.data;
  }

  private setToCache(key: string, data: any): void {
    // Implement LRU cache eviction if needed
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(key, {
      key,
      data,
      created_at: Date.now(),
      expires_at: Date.now() + this.cacheTimeout,
      access_count: 0,
      last_accessed: Date.now(),
    });
  }

  private evictLeastRecentlyUsed(): void {
    let lruKey = "";
    let lruTime = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.last_accessed < lruTime) {
        lruTime = entry.last_accessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  private invalidateRelatedCache(dataPoint: TacticalDataPoint): void {
    // Invalidate cache entries that might be affected by new data
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (key.includes(dataPoint.source) || key.includes(dataPoint.category)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  private createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  private efficientSort(dataPoints: TacticalDataPoint[]): TacticalDataPoint[] {
    // Use efficient sorting algorithm for large datasets
    return dataPoints.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeA - timeB;
    });
  }

  private processAggregationOptimized(
    data: any[],
    groupBy: string
  ): Record<string, any[]> {
    const result: Record<string, any[]> = {};

    // Use efficient grouping
    const groups = new Map<string, any[]>();

    for (const item of data) {
      const key = this.getTimePeriodKey(item.timestamp, groupBy as any);
      const groupKey = `${item.source}_${item.category}`;

      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }

      groups.get(groupKey)!.push({
        period: key,
        value: item.value,
        timestamp: item.timestamp,
      });
    }

    // Convert to result format
    for (const [groupKey, items] of groups) {
      result[groupKey] = items;
    }

    return result;
  }

  private getTimePeriodKey(
    timestamp: string,
    groupBy: "day" | "week" | "month"
  ): string {
    const date = new Date(timestamp);

    switch (groupBy) {
      case "day":
        return date.toISOString().split("T")[0];
      case "week":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return weekStart.toISOString().split("T")[0];
      case "month":
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      default:
        return date.toISOString().split("T")[0];
    }
  }

  private async waitForProcessingSlot(): Promise<void> {
    while (this.currentOperations >= this.maxConcurrentOperations) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    this.currentOperations++;
  }

  private recordPerformanceMetric(metric: PerformanceMetrics): void {
    this.performanceMetrics.push(metric);

    // Keep only recent metrics to prevent memory growth
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-500);
    }
  }

  private getMemoryUsage(): number {
    // Simplified memory usage calculation
    if (typeof process !== "undefined" && process.memoryUsage) {
      return Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    }
    return 0;
  }

  private getCacheMemoryUsage(): number {
    // Estimate cache memory usage
    let size = 0;
    for (const entry of this.cache.values()) {
      size += JSON.stringify(entry.data).length;
    }
    return Math.round(size / 1024 / 1024);
  }

  private startTime: number = Date.now();

  private initializePerformanceMonitoring(): void {
    // Set up periodic performance monitoring
    setInterval(() => {
      this.recordPerformanceMetric({
        operation: "health_check",
        start_time: Date.now(),
        end_time: Date.now(),
        duration_ms: 0,
        data_points_processed: 0,
        memory_usage_mb: this.getMemoryUsage(),
      });
    }, 60000); // Every minute
  }

  private startCacheCleanup(): void {
    // Periodic cache cleanup
    setInterval(
      () => {
        const now = Date.now();
        const keysToDelete: string[] = [];

        for (const [key, entry] of this.cache) {
          if (now > entry.expires_at) {
            keysToDelete.push(key);
          }
        }

        keysToDelete.forEach(key => this.cache.delete(key));
      },
      5 * 60 * 1000
    ); // Every 5 minutes
  }
}

// Export singleton instance
export const tacticalPerformanceEngine = new TacticalPerformanceEngine();
