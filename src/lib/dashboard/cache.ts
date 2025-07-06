interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class DashboardCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0,
      hits: this.hitCount,
      misses: this.missCount,
    };
  }

  // Performance tracking
  private hitCount = 0;
  private missCount = 0;

  getWithStats<T>(key: string): T | null {
    const result = this.get<T>(key);

    if (result !== null) {
      this.hitCount++;
    } else {
      this.missCount++;
    }

    return result;
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Auto cleanup every 10 minutes
  startAutoCleanup(): void {
    setInterval(
      () => {
        this.cleanup();
      },
      10 * 60 * 1000
    );
  }
}

// Singleton instance
export const dashboardCache = new DashboardCache();

// Start auto cleanup
if (typeof window !== "undefined") {
  dashboardCache.startAutoCleanup();
}

// Cache key generators
export const cacheKeys = {
  kpiMetrics: () => "kpi-metrics",
  userMetrics: (userId: string) => `user-metrics-${userId}`,
  chartData: (chartType: string, timeRange: string) =>
    `chart-${chartType}-${timeRange}`,
  dashboardData: (page: string) => `dashboard-${page}`,
} as const;

// Helper function for API response caching
export async function cachedApiCall<T>(
  key: string,
  apiCall: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache first
  const cached = dashboardCache.getWithStats<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Make API call if not in cache
  try {
    const data = await apiCall();
    dashboardCache.set(key, data, ttl);
    return data;
  } catch (error) {
    // If API call fails, just throw the error
    throw error;
  }
}
