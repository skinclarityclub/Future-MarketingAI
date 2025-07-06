export interface MonitoringPerformanceMetrics {
  componentRenderTime: number;
  dataFetchTime: number;
  subscriptionLatency: number;
  memoryUsage: number;
  updatesPerSecond: number;
}

export interface OptimizationConfig {
  maxUpdateFrequency: number; // Hz
  batchSize: number;
  enableVirtualization: boolean;
  cacheTimeout: number; // seconds
  compressionEnabled: boolean;
}

export class MonitoringPerformanceOptimizer {
  private metrics: MonitoringPerformanceMetrics[] = [];
  private config: OptimizationConfig = {
    maxUpdateFrequency: 2, // 2 Hz = every 500ms
    batchSize: 100,
    enableVirtualization: true,
    cacheTimeout: 30,
    compressionEnabled: true,
  };

  private cache = new Map<string, { data: any; timestamp: number }>();
  private updateQueue: Array<() => void> = [];
  private isProcessing = false;

  constructor(config?: Partial<OptimizationConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Start optimization loop
    this.startOptimizationLoop();
  }

  // Performance monitoring
  startMeasurement(): () => MonitoringPerformanceMetrics {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    return () => {
      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();

      const metric: MonitoringPerformanceMetrics = {
        componentRenderTime: endTime - startTime,
        dataFetchTime: 0, // Set by caller
        subscriptionLatency: 0, // Set by caller
        memoryUsage: endMemory - startMemory,
        updatesPerSecond: this.calculateUpdatesPerSecond(),
      };

      this.addMetric(metric);
      return metric;
    };
  }

  private getMemoryUsage(): number {
    if (
      typeof window !== "undefined" &&
      "performance" in window &&
      "memory" in performance
    ) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  private calculateUpdatesPerSecond(): number {
    const now = Date.now();
    const oneSecondAgo = now - 1000;

    const recentMetrics = this.metrics.filter(
      m => (m as any).timestamp && (m as any).timestamp > oneSecondAgo
    );

    return recentMetrics.length;
  }

  private addMetric(metric: MonitoringPerformanceMetrics): void {
    this.metrics.push({
      ...metric,
      timestamp: Date.now(),
    } as any);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  // Data optimization
  optimizeData<T>(data: T[], key: string): T[] {
    const cacheKey = `optimized_${key}`;
    const cached = this.getCachedData(cacheKey);

    if (cached) {
      return cached as T[];
    }

    let optimizedData = data;

    // Remove duplicates
    optimizedData = this.removeDuplicates(optimizedData);

    // Sort by relevance/timestamp
    optimizedData = this.sortByRelevance(optimizedData);

    // Limit data size for performance
    if (optimizedData.length > this.config.batchSize) {
      optimizedData = optimizedData.slice(0, this.config.batchSize);
    }

    // Compress if enabled
    if (this.config.compressionEnabled) {
      optimizedData = this.compressData(optimizedData);
    }

    this.setCachedData(cacheKey, optimizedData);
    return optimizedData;
  }

  private removeDuplicates<T>(data: T[]): T[] {
    const seen = new Set();
    return data.filter(item => {
      const key = JSON.stringify(item);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private sortByRelevance<T>(data: T[]): T[] {
    return data.sort((a: any, b: any) => {
      // Sort by timestamp if available (newest first)
      if (a.timestamp && b.timestamp) {
        return (
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      }

      // Sort by severity if available (highest first)
      if (a.severity && b.severity) {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return (
          (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)
        );
      }

      return 0;
    });
  }

  private compressData<T>(data: T[]): T[] {
    // Simple compression: remove unnecessary fields
    return data.map((item: any) => {
      const compressed = { ...item };

      // Remove verbose descriptions if they're too long
      if (compressed.description && compressed.description.length > 100) {
        compressed.description =
          compressed.description.substring(0, 97) + "...";
      }

      // Round numeric values to reduce precision
      Object.keys(compressed).forEach(key => {
        if (
          typeof compressed[key] === "number" &&
          !Number.isInteger(compressed[key])
        ) {
          compressed[key] = Math.round(compressed[key] * 100) / 100;
        }
      });

      return compressed;
    });
  }

  // Caching
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    const age = (now - cached.timestamp) / 1000;

    if (age > this.config.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });

    // Limit cache size
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  // Update throttling
  throttleUpdate(updateFn: () => void): void {
    this.updateQueue.push(updateFn);

    if (!this.isProcessing) {
      this.processUpdateQueue();
    }
  }

  private async processUpdateQueue(): Promise<void> {
    if (this.isProcessing || this.updateQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const updateInterval = 1000 / this.config.maxUpdateFrequency;

    while (this.updateQueue.length > 0) {
      const updateFn = this.updateQueue.shift();
      if (updateFn) {
        updateFn();
      }

      // Wait for next update cycle
      await new Promise(resolve => setTimeout(resolve, updateInterval));
    }

    this.isProcessing = false;
  }

  private startOptimizationLoop(): void {
    setInterval(() => {
      this.cleanupCache();
      this.analyzePerformance();
    }, 60000); // Every minute
  }

  private cleanupCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, value] of this.cache.entries()) {
      const age = (now - value.timestamp) / 1000;
      if (age > this.config.cacheTimeout) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
  }

  private analyzePerformance(): void {
    if (this.metrics.length < 10) return;

    const recentMetrics = this.metrics.slice(-50);
    const avgRenderTime =
      recentMetrics.reduce((sum, m) => sum + m.componentRenderTime, 0) /
      recentMetrics.length;
    const avgMemoryUsage =
      recentMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) /
      recentMetrics.length;

    // Auto-adjust configuration based on performance
    if (avgRenderTime > 100) {
      // >100ms render time
      this.config.maxUpdateFrequency = Math.max(
        0.5,
        this.config.maxUpdateFrequency * 0.8
      );
      this.config.batchSize = Math.max(50, this.config.batchSize * 0.9);
      console.log(
        "Performance optimization: Reduced update frequency and batch size"
      );
    } else if (avgRenderTime < 50) {
      // <50ms render time
      this.config.maxUpdateFrequency = Math.min(
        5,
        this.config.maxUpdateFrequency * 1.1
      );
      this.config.batchSize = Math.min(200, this.config.batchSize * 1.1);
    }

    if (avgMemoryUsage > 50 * 1024 * 1024) {
      // >50MB memory usage
      this.config.compressionEnabled = true;
      this.config.cacheTimeout = Math.max(10, this.config.cacheTimeout * 0.8);
      console.log(
        "Memory optimization: Enabled compression and reduced cache timeout"
      );
    }
  }

  // Public methods for monitoring
  getPerformanceStats(): {
    averageRenderTime: number;
    averageMemoryUsage: number;
    cacheHitRate: number;
    currentConfig: OptimizationConfig;
  } {
    const recentMetrics = this.metrics.slice(-100);

    return {
      averageRenderTime:
        recentMetrics.length > 0
          ? recentMetrics.reduce((sum, m) => sum + m.componentRenderTime, 0) /
            recentMetrics.length
          : 0,
      averageMemoryUsage:
        recentMetrics.length > 0
          ? recentMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) /
            recentMetrics.length
          : 0,
      cacheHitRate: this.calculateCacheHitRate(),
      currentConfig: { ...this.config },
    };
  }

  private calculateCacheHitRate(): number {
    // This would be implemented with actual cache hit/miss tracking
    return 0.85; // Placeholder
  }

  clearCache(): void {
    this.cache.clear();
  }

  updateConfig(newConfig: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export const performanceOptimizer = new MonitoringPerformanceOptimizer();
