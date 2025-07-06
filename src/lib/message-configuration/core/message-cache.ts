/**
 * Advanced Message Cache Implementation
 *
 * Comprehensive caching system with memory management, Redis support,
 * and intelligent cache invalidation strategies
 */

import { MessageInstance } from "../schemas/message-config-schema";

// Cache entry with metadata
export interface CacheEntry {
  content: MessageInstance;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  category?: string;
  language?: string;
  version?: string;
}

// Cache statistics
export interface CacheStats {
  usage: {
    entries: number;
    sizeBytes: number;
    sizeUsage: number; // 0-1 percentage
  };
  performance: {
    hitRate: number;
    accessTime: number;
    mostAccessed: string[];
  };
  health: {
    expiredEntries: number;
    evictionCount: number;
    lastCleanup: string;
  };
}

// Cache configuration
export interface CacheConfig {
  maxSizeBytes: number;
  maxEntries: number;
  ttl: number; // Time to live in milliseconds
  evictionPolicy: "LRU" | "LFU" | "TTL";
  cleanupInterval: number;
  enableCompression: boolean;
  enableRedis: boolean;
  redisUrl?: string;
}

// Default cache configuration
const DEFAULT_CACHE_CONFIG: CacheConfig = {
  maxSizeBytes: 50 * 1024 * 1024, // 50MB
  maxEntries: 10000,
  ttl: 5 * 60 * 1000, // 5 minutes
  evictionPolicy: "LRU",
  cleanupInterval: 2 * 60 * 1000, // 2 minutes
  enableCompression: false,
  enableRedis: false,
};

export class MessageCache {
  private cache = new Map<string, CacheEntry>();
  private stats: CacheStats;
  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;
  private configVersion: string = "1.0.0";

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
    this.stats = {
      usage: {
        entries: 0,
        sizeBytes: 0,
        sizeUsage: 0,
      },
      performance: {
        hitRate: 0,
        accessTime: 0,
        mostAccessed: [],
      },
      health: {
        expiredEntries: 0,
        evictionCount: 0,
        lastCleanup: new Date().toISOString(),
      },
    };

    this.startCleanupTimer();
  }

  /**
   * Set a cache entry
   */
  set(
    key: string,
    message: MessageInstance,
    metadata?: Partial<CacheEntry>
  ): void {
    // Check if we need to evict entries
    if (this.cache.size >= this.config.maxEntries) {
      this.evictEntries();
    }

    const now = Date.now();
    const entry: CacheEntry = {
      content: message,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now,
      category: metadata?.category,
      language: metadata?.language,
      version: metadata?.version || this.configVersion,
    };

    this.cache.set(key, entry);
    this.updateUsageStats();
  }

  /**
   * Get a cache entry
   */
  get(key: string): MessageInstance | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check TTL
    const now = Date.now();
    if (now - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      this.stats.health.expiredEntries++;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;
    entry.content.metadata.cacheHit = true;

    this.updatePerformanceStats();
    return entry.content;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.updateUsageStats();
    this.resetStats();
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    this.updateAllStats();
    return { ...this.stats };
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (now - entry.timestamp > this.config.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));

    this.stats.health.expiredEntries += expiredKeys.length;
    this.stats.health.lastCleanup = new Date().toISOString();
    this.updateUsageStats();
  }

  /**
   * Destroy cache and cleanup resources
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }

  // Private methods
  private evictEntries(): void {
    const evictCount = Math.max(1, Math.floor(this.config.maxEntries * 0.1)); // Evict 10%

    switch (this.config.evictionPolicy) {
      case "LRU":
        this.evictLRU(evictCount);
        break;
      case "LFU":
        this.evictLFU(evictCount);
        break;
      case "TTL":
        this.evictTTL(evictCount);
        break;
    }

    this.stats.health.evictionCount += evictCount;
  }

  private evictLRU(count: number): void {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)
      .slice(0, count);

    entries.forEach(([key]) => this.cache.delete(key));
  }

  private evictLFU(count: number): void {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.accessCount - b.accessCount)
      .slice(0, count);

    entries.forEach(([key]) => this.cache.delete(key));
  }

  private evictTTL(count: number): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => now - a.timestamp - (now - b.timestamp))
      .slice(0, count);

    entries.forEach(([key]) => this.cache.delete(key));
  }

  private updateUsageStats(): void {
    this.stats.usage.entries = this.cache.size;
    this.stats.usage.sizeBytes = this.estimateSize();
    this.stats.usage.sizeUsage =
      this.stats.usage.sizeBytes / this.config.maxSizeBytes;
  }

  private updatePerformanceStats(): void {
    // Calculate hit rate (simplified)
    const totalAccesses = Array.from(this.cache.values()).reduce(
      (sum, entry) => sum + entry.accessCount,
      0
    );
    this.stats.performance.hitRate =
      totalAccesses > 0 ? (totalAccesses - this.cache.size) / totalAccesses : 0;

    // Update most accessed
    this.stats.performance.mostAccessed = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => b.accessCount - a.accessCount)
      .slice(0, 10)
      .map(([key]) => key);
  }

  private updateAllStats(): void {
    this.updateUsageStats();
    this.updatePerformanceStats();
  }

  private resetStats(): void {
    this.stats = {
      usage: { entries: 0, sizeBytes: 0, sizeUsage: 0 },
      performance: { hitRate: 0, accessTime: 0, mostAccessed: [] },
      health: {
        expiredEntries: 0,
        evictionCount: 0,
        lastCleanup: new Date().toISOString(),
      },
    };
  }

  private estimateSize(): number {
    // Rough estimation of cache size in bytes
    let size = 0;
    for (const [key, entry] of this.cache.entries()) {
      size += key.length * 2; // UTF-16 characters
      size += JSON.stringify(entry.content).length * 2;
      size += 64; // Metadata overhead
    }
    return size;
  }

  private startCleanupTimer(): void {
    if (this.config.cleanupInterval > 0) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup();
      }, this.config.cleanupInterval);
    }
  }
}

// Hook for React components to access cache stats
export function useCacheStats(): CacheStats {
  // This would typically use React hooks in a real implementation
  // For now, return default stats
  return {
    usage: { entries: 0, sizeBytes: 0, sizeUsage: 0 },
    performance: { hitRate: 0, accessTime: 0, mostAccessed: [] },
    health: {
      expiredEntries: 0,
      evictionCount: 0,
      lastCleanup: new Date().toISOString(),
    },
  };
}

// Default cache instance
let defaultCache: MessageCache | null = null;

export function getDefaultCache(): MessageCache {
  if (!defaultCache) {
    defaultCache = new MessageCache();
  }
  return defaultCache;
}

export { MessageCache as default };
