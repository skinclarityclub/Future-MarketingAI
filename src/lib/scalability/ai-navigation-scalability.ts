/**
 * AI Navigation Scalability Framework
 * Task 13.5: Ensure Scalability and Data Security
 *
 * Comprehensive scalability solutions for the AI Navigation System
 * including caching, load balancing, and performance optimization
 */

export interface ScalabilityConfig {
  caching: {
    enabled: boolean;
    ttl: number; // Time to live in milliseconds
    maxSize: number; // Maximum cache size
    strategy: "lru" | "fifo" | "lfu";
  };
  performance: {
    batchSize: number;
    maxConcurrentRequests: number;
    requestTimeout: number;
    enableCompression: boolean;
  };
  monitoring: {
    enabled: boolean;
    metricsInterval: number;
    alertThresholds: {
      responseTime: number;
      errorRate: number;
      memoryUsage: number;
    };
  };
  optimization: {
    enableLazyLoading: boolean;
    enablePrefetching: boolean;
    debounceDelay: number;
    throttleDelay: number;
  };
}

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  memoryUsage: number;
  cacheHitRate: number;
  activeConnections: number;
  timestamp: Date;
}

export interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: Date;
  accessCount: number;
  lastAccessed: Date;
  ttl: number;
}

export class AINavigationScalability {
  private config: ScalabilityConfig;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private metrics: PerformanceMetrics[] = [];
  private activeRequests: Map<string, Promise<any>> = new Map();
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;

  constructor(config: Partial<ScalabilityConfig> = {}) {
    this.config = {
      caching: {
        enabled: true,
        ttl: 5 * 60 * 1000, // 5 minutes
        maxSize: 1000,
        strategy: "lru",
        ...config.caching,
      },
      performance: {
        batchSize: 50,
        maxConcurrentRequests: 10,
        requestTimeout: 30000, // 30 seconds
        enableCompression: true,
        ...config.performance,
      },
      monitoring: {
        enabled: true,
        metricsInterval: 60000, // 1 minute
        alertThresholds: {
          responseTime: 2000, // 2 seconds
          errorRate: 0.05, // 5%
          memoryUsage: 0.8, // 80%
        },
        ...config.monitoring,
      },
      optimization: {
        enableLazyLoading: true,
        enablePrefetching: true,
        debounceDelay: 300,
        throttleDelay: 100,
        ...config.optimization,
      },
    };

    this.startMonitoring();
  }

  /**
   * Cache management with different strategies
   */
  async getCached<T>(key: string): Promise<T | null> {
    if (!this.config.caching.enabled) {
      return null;
    }

    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check TTL
    const now = new Date();
    if (now.getTime() - entry.timestamp.getTime() > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;
    this.cache.set(key, entry);

    return entry.value;
  }

  async setCached<T>(key: string, value: T, customTtl?: number): Promise<void> {
    if (!this.config.caching.enabled) {
      return;
    }

    // Check cache size and evict if necessary
    if (this.cache.size >= this.config.caching.maxSize) {
      this.evictCache();
    }

    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: new Date(),
      accessCount: 1,
      lastAccessed: new Date(),
      ttl: customTtl || this.config.caching.ttl,
    };

    this.cache.set(key, entry);
  }

  /**
   * Request batching and queuing
   */
  async batchRequest<T>(
    requests: Array<() => Promise<T>>,
    batchSize?: number
  ): Promise<T[]> {
    const size = batchSize || this.config.performance.batchSize;
    const results: T[] = [];

    for (let i = 0; i < requests.length; i += size) {
      const batch = requests.slice(i, i + size);
      const batchResults = await Promise.allSettled(
        batch.map(request => this.executeWithTimeout(request))
      );

      batchResults.forEach(result => {
        if (result.status === "fulfilled") {
          results.push(result.value);
        } else {
          console.error("Batch request failed:", result.reason);
        }
      });
    }

    return results;
  }

  /**
   * Request throttling and debouncing
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    delay?: number
  ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    const debounceDelay = delay || this.config.optimization.debounceDelay;
    let timeoutId: NodeJS.Timeout;

    return (...args: Parameters<T>): Promise<ReturnType<T>> => {
      return new Promise(resolve => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          resolve(func(...args));
        }, debounceDelay);
      });
    };
  }

  throttle<T extends (...args: any[]) => any>(
    func: T,
    delay?: number
  ): (...args: Parameters<T>) => Promise<ReturnType<T> | null> {
    const throttleDelay = delay || this.config.optimization.throttleDelay;
    let lastCall = 0;

    return (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
      return new Promise(resolve => {
        const now = Date.now();
        if (now - lastCall >= throttleDelay) {
          lastCall = now;
          resolve(func(...args));
        } else {
          resolve(null);
        }
      });
    };
  }

  /**
   * Lazy loading implementation
   */
  async lazyLoad<T>(loader: () => Promise<T>, cacheKey?: string): Promise<T> {
    if (!this.config.optimization.enableLazyLoading) {
      return loader();
    }

    // Check cache first
    if (cacheKey) {
      const cached = await this.getCached<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Load and cache
    const result = await loader();
    if (cacheKey) {
      await this.setCached(cacheKey, result);
    }

    return result;
  }

  /**
   * Prefetching for anticipated requests
   */
  async prefetch<T>(
    loaders: Array<{ key: string; loader: () => Promise<T> }>,
    priority: "high" | "medium" | "low" = "medium"
  ): Promise<void> {
    if (!this.config.optimization.enablePrefetching) {
      return;
    }

    const delay = priority === "high" ? 0 : priority === "medium" ? 100 : 500;

    setTimeout(async () => {
      for (const { key, loader } of loaders) {
        try {
          const cached = await this.getCached(key);
          if (!cached) {
            const result = await loader();
            await this.setCached(key, result);
          }
        } catch (error) {
          console.warn(`Prefetch failed for ${key}:`, error);
        }
      }
    }, delay);
  }

  /**
   * Memory optimization
   */
  optimizeMemory(): {
    cacheCleared: number;
    memoryFreed: number;
  } {
    const initialCacheSize = this.cache.size;
    const initialMemory = this.getMemoryUsage();

    // Clear expired cache entries
    this.clearExpiredCache();

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const finalMemory = this.getMemoryUsage();

    return {
      cacheCleared: initialCacheSize - this.cache.size,
      memoryFreed: initialMemory - finalMemory,
    };
  }

  /**
   * Performance monitoring
   */
  recordMetrics(responseTime: number, success: boolean): void {
    if (!this.config.monitoring.enabled) {
      return;
    }

    const metrics: PerformanceMetrics = {
      responseTime,
      throughput: this.calculateThroughput(),
      errorRate: this.calculateErrorRate(success),
      memoryUsage: this.getMemoryUsage(),
      cacheHitRate: this.calculateCacheHitRate(),
      activeConnections: this.activeRequests.size,
      timestamp: new Date(),
    };

    this.metrics.push(metrics);

    // Keep only recent metrics
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 1); // Keep last hour
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);

    // Check alert thresholds
    this.checkAlertThresholds(metrics);
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): {
    current: PerformanceMetrics | null;
    average: Partial<PerformanceMetrics>;
    trends: {
      responseTime: "improving" | "degrading" | "stable";
      errorRate: "improving" | "degrading" | "stable";
    };
  } {
    const current = this.metrics[this.metrics.length - 1] || null;

    if (this.metrics.length === 0) {
      return {
        current: null,
        average: {},
        trends: { responseTime: "stable", errorRate: "stable" },
      };
    }

    const average = {
      responseTime:
        this.metrics.reduce((sum, m) => sum + m.responseTime, 0) /
        this.metrics.length,
      errorRate:
        this.metrics.reduce((sum, m) => sum + m.errorRate, 0) /
        this.metrics.length,
      memoryUsage:
        this.metrics.reduce((sum, m) => sum + m.memoryUsage, 0) /
        this.metrics.length,
      cacheHitRate:
        this.metrics.reduce((sum, m) => sum + m.cacheHitRate, 0) /
        this.metrics.length,
    };

    const trends = this.calculateTrends();

    return { current, average, trends };
  }

  /**
   * Auto-scaling recommendations
   */
  getScalingRecommendations(): {
    action: "scale_up" | "scale_down" | "maintain";
    reason: string;
    confidence: number;
  } {
    const { current, average } = this.getPerformanceMetrics();

    if (!current) {
      return { action: "maintain", reason: "Insufficient data", confidence: 0 };
    }

    // Scale up conditions
    if (
      current.responseTime >
      this.config.monitoring.alertThresholds.responseTime * 1.5
    ) {
      return {
        action: "scale_up",
        reason: "High response time",
        confidence: 0.9,
      };
    }

    if (
      current.errorRate >
      this.config.monitoring.alertThresholds.errorRate * 2
    ) {
      return { action: "scale_up", reason: "High error rate", confidence: 0.8 };
    }

    if (
      current.memoryUsage > this.config.monitoring.alertThresholds.memoryUsage
    ) {
      return {
        action: "scale_up",
        reason: "High memory usage",
        confidence: 0.85,
      };
    }

    // Scale down conditions
    if (
      average.responseTime &&
      average.responseTime <
        this.config.monitoring.alertThresholds.responseTime * 0.3
    ) {
      return {
        action: "scale_down",
        reason: "Low resource utilization",
        confidence: 0.7,
      };
    }

    return {
      action: "maintain",
      reason: "Performance within acceptable range",
      confidence: 0.8,
    };
  }

  /**
   * Private helper methods
   */
  private evictCache(): void {
    const strategy = this.config.caching.strategy;
    const entries = Array.from(this.cache.entries());

    let keyToEvict: string;

    switch (strategy) {
      case "lru":
        // Least Recently Used
        keyToEvict = entries.reduce((oldest, [key, entry]) => {
          const oldestEntry = this.cache.get(oldest);
          return !oldestEntry || entry.lastAccessed < oldestEntry.lastAccessed
            ? key
            : oldest;
        }, entries[0][0]);
        break;

      case "lfu":
        // Least Frequently Used
        keyToEvict = entries.reduce((least, [key, entry]) => {
          const leastEntry = this.cache.get(least);
          return !leastEntry || entry.accessCount < leastEntry.accessCount
            ? key
            : least;
        }, entries[0][0]);
        break;

      case "fifo":
      default:
        // First In, First Out
        keyToEvict = entries.reduce((oldest, [key, entry]) => {
          const oldestEntry = this.cache.get(oldest);
          return !oldestEntry || entry.timestamp < oldestEntry.timestamp
            ? key
            : oldest;
        }, entries[0][0]);
        break;
    }

    this.cache.delete(keyToEvict);
  }

  private clearExpiredCache(): void {
    const now = new Date();
    const expiredKeys: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now.getTime() - entry.timestamp.getTime() > entry.ttl) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.cache.delete(key));
  }

  private async executeWithTimeout<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Request timeout"));
      }, this.config.performance.requestTimeout);

      request()
        .then(result => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  private calculateThroughput(): number {
    const recentMetrics = this.metrics.slice(-10); // Last 10 measurements
    if (recentMetrics.length < 2) return 0;

    const timeSpan =
      recentMetrics[recentMetrics.length - 1].timestamp.getTime() -
      recentMetrics[0].timestamp.getTime();

    return recentMetrics.length / (timeSpan / 1000); // Requests per second
  }

  private calculateErrorRate(currentSuccess: boolean): number {
    const recentMetrics = this.metrics.slice(-100); // Last 100 measurements
    const errors = recentMetrics.filter(m => m.errorRate > 0).length;
    const total = recentMetrics.length + 1; // Include current

    return currentSuccess ? errors / total : (errors + 1) / total;
  }

  private getMemoryUsage(): number {
    if (typeof process !== "undefined" && process.memoryUsage) {
      const usage = process.memoryUsage();
      return usage.heapUsed / usage.heapTotal;
    }
    return 0;
  }

  private calculateCacheHitRate(): number {
    // This would be calculated based on cache hits vs misses
    // For now, return a mock value based on cache size
    return Math.min(this.cache.size / this.config.caching.maxSize, 1);
  }

  private calculateTrends(): {
    responseTime: "improving" | "degrading" | "stable";
    errorRate: "improving" | "degrading" | "stable";
  } {
    if (this.metrics.length < 10) {
      return { responseTime: "stable", errorRate: "stable" };
    }

    const recent = this.metrics.slice(-5);
    const older = this.metrics.slice(-10, -5);

    const recentAvgResponseTime =
      recent.reduce((sum, m) => sum + m.responseTime, 0) / recent.length;
    const olderAvgResponseTime =
      older.reduce((sum, m) => sum + m.responseTime, 0) / older.length;

    const recentAvgErrorRate =
      recent.reduce((sum, m) => sum + m.errorRate, 0) / recent.length;
    const olderAvgErrorRate =
      older.reduce((sum, m) => sum + m.errorRate, 0) / older.length;

    const responseTimeTrend =
      recentAvgResponseTime < olderAvgResponseTime * 0.9
        ? "improving"
        : recentAvgResponseTime > olderAvgResponseTime * 1.1
          ? "degrading"
          : "stable";

    const errorRateTrend =
      recentAvgErrorRate < olderAvgErrorRate * 0.9
        ? "improving"
        : recentAvgErrorRate > olderAvgErrorRate * 1.1
          ? "degrading"
          : "stable";

    return { responseTime: responseTimeTrend, errorRate: errorRateTrend };
  }

  private checkAlertThresholds(metrics: PerformanceMetrics): void {
    const thresholds = this.config.monitoring.alertThresholds;

    if (metrics.responseTime > thresholds.responseTime) {
      console.warn(
        `[SCALABILITY ALERT] High response time: ${metrics.responseTime}ms`
      );
    }

    if (metrics.errorRate > thresholds.errorRate) {
      console.warn(
        `[SCALABILITY ALERT] High error rate: ${(metrics.errorRate * 100).toFixed(2)}%`
      );
    }

    if (metrics.memoryUsage > thresholds.memoryUsage) {
      console.warn(
        `[SCALABILITY ALERT] High memory usage: ${(metrics.memoryUsage * 100).toFixed(2)}%`
      );
    }
  }

  private startMonitoring(): void {
    if (!this.config.monitoring.enabled) {
      return;
    }

    setInterval(() => {
      this.optimizeMemory();
    }, this.config.monitoring.metricsInterval);
  }

  /**
   * Destroy scalability instance
   */
  destroy(): void {
    this.cache.clear();
    this.metrics.length = 0;
    this.activeRequests.clear();
    this.requestQueue.length = 0;
  }
}
