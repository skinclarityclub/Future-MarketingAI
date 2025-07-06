/**
 * Advanced Cache Manager for Message Configuration System
 *
 * Features:
 * - LRU (Least Recently Used) cache eviction
 * - Memory usage monitoring and limits
 * - Cache statistics and performance metrics
 * - Browser storage persistence (localStorage/sessionStorage)
 * - Automatic cache cleanup and maintenance
 * - Cache warming and preloading
 */

export interface CacheEntry<T = any> {
  value: T;
  timestamp: number;
  lastAccessed: number;
  accessCount: number;
  expiresAt?: number;
  size: number; // Estimated size in bytes
  tags: string[];
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalEntries: number;
  totalSize: number;
  averageAccessTime: number;
  evictions: number;
  lastCleanup: number;
}

export interface CacheConfig {
  maxSize: number; // Maximum cache size in bytes
  maxEntries: number; // Maximum number of entries
  defaultTTL: number; // Default time to live in milliseconds
  cleanupInterval: number; // Cleanup interval in milliseconds
  enablePersistence: boolean; // Enable browser storage persistence
  persistenceKey: string; // Key for browser storage
  storageType: "localStorage" | "sessionStorage";
  enableCompression: boolean; // Enable value compression
  warningThreshold: number; // Memory warning threshold (0-1)
}

const DEFAULT_CONFIG: CacheConfig = {
  maxSize: 50 * 1024 * 1024, // 50MB
  maxEntries: 1000,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  cleanupInterval: 60 * 1000, // 1 minute
  enablePersistence: true,
  persistenceKey: "message-cache",
  storageType: "localStorage",
  enableCompression: false,
  warningThreshold: 0.8,
};

export class AdvancedCacheManager<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder: string[] = []; // For LRU tracking
  private config: CacheConfig;
  private stats: CacheStats;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private isWarningThresholdReached = false;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalEntries: 0,
      totalSize: 0,
      averageAccessTime: 0,
      evictions: 0,
      lastCleanup: Date.now(),
    };

    // Load from persistence if enabled
    if (this.config.enablePersistence && typeof window !== "undefined") {
      this.loadFromStorage();
    }

    // Start cleanup timer
    this.startCleanupTimer();
  }

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const startTime = performance.now();
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Update access information
    entry.lastAccessed = Date.now();
    entry.accessCount++;

    // Update LRU order
    this.updateAccessOrder(key);

    // Update stats
    this.stats.hits++;
    this.updateHitRate();
    this.updateAverageAccessTime(performance.now() - startTime);

    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T, ttl?: number, tags: string[] = []): boolean {
    const now = Date.now();
    const expiresAt = ttl ? now + ttl : now + this.config.defaultTTL;
    const size = this.estimateSize(value);

    // Check if we need to make space
    if (!this.makeSpace(size)) {
      console.warn("Cache: Unable to make space for new entry");
      return false;
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: now,
      lastAccessed: now,
      accessCount: 1,
      expiresAt,
      size,
      tags,
    };

    // Remove existing entry if updating
    if (this.cache.has(key)) {
      this.delete(key, false);
    }

    this.cache.set(key, entry);
    this.updateAccessOrder(key);
    this.updateStats();

    // Check memory warning threshold
    this.checkMemoryWarning();

    // Persist if enabled
    if (this.config.enablePersistence) {
      this.saveToStorage();
    }

    return true;
  }

  /**
   * Delete entry from cache
   */
  delete(key: string, updateStats = true): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    this.removeFromAccessOrder(key);

    if (updateStats) {
      this.updateStats();
    }

    return true;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.updateStats();

    if (this.config.enablePersistence) {
      this.clearStorage();
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get entries by tags
   */
  getByTags(tags: string[]): Array<{ key: string; value: T }> {
    const results: Array<{ key: string; value: T }> = [];

    for (const [key, entry] of this.cache.entries()) {
      if (tags.some(tag => entry.tags.includes(tag))) {
        results.push({ key, value: entry.value });
      }
    }

    return results;
  }

  /**
   * Delete entries by tags
   */
  deleteByTags(tags: string[]): number {
    let deleted = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (tags.some(tag => entry.tags.includes(tag))) {
        this.delete(key, false);
        deleted++;
      }
    }

    this.updateStats();
    return deleted;
  }

  /**
   * Warm cache with preloaded data
   */
  warmCache(
    entries: Array<{ key: string; value: T; ttl?: number; tags?: string[] }>
  ): void {
    for (const entry of entries) {
      this.set(entry.key, entry.value, entry.ttl, entry.tags);
    }
  }

  /**
   * Get cache usage information
   */
  getUsage() {
    return {
      entries: this.cache.size,
      maxEntries: this.config.maxEntries,
      entriesUsage: this.cache.size / this.config.maxEntries,
      sizeBytes: this.stats.totalSize,
      maxSizeBytes: this.config.maxSize,
      sizeUsage: this.stats.totalSize / this.config.maxSize,
      isWarningThresholdReached: this.isWarningThresholdReached,
    };
  }

  /**
   * Force cleanup of expired entries
   */
  cleanup(): number {
    let cleaned = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.delete(key, false);
        cleaned++;
      }
    }

    this.stats.lastCleanup = now;
    this.updateStats();

    return cleaned;
  }

  /**
   * Export cache data
   */
  export(): Record<string, any> {
    const data: Record<string, any> = {};

    for (const [key, entry] of this.cache.entries()) {
      data[key] = {
        value: entry.value,
        timestamp: entry.timestamp,
        expiresAt: entry.expiresAt,
        tags: entry.tags,
      };
    }

    return data;
  }

  /**
   * Import cache data
   */
  import(data: Record<string, any>): void {
    this.clear();

    for (const [key, entryData] of Object.entries(data)) {
      const ttl = entryData.expiresAt
        ? entryData.expiresAt - Date.now()
        : undefined;
      if (!ttl || ttl > 0) {
        this.set(key, entryData.value, ttl, entryData.tags || []);
      }
    }
  }

  /**
   * Destroy cache manager
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    this.clear();
  }

  // Private methods

  private makeSpace(requiredSize: number): boolean {
    // Check if we have space
    if (
      this.cache.size < this.config.maxEntries &&
      this.stats.totalSize + requiredSize <= this.config.maxSize
    ) {
      return true;
    }

    // Try to free space by removing expired entries first
    this.cleanup();

    // Check again after cleanup
    if (
      this.cache.size < this.config.maxEntries &&
      this.stats.totalSize + requiredSize <= this.config.maxSize
    ) {
      return true;
    }

    // Use LRU eviction
    while (
      (this.cache.size >= this.config.maxEntries ||
        this.stats.totalSize + requiredSize > this.config.maxSize) &&
      this.accessOrder.length > 0
    ) {
      const lruKey = this.accessOrder[0];
      this.delete(lruKey, false);
      this.stats.evictions++;
    }

    this.updateStats();

    return (
      this.cache.size < this.config.maxEntries &&
      this.stats.totalSize + requiredSize <= this.config.maxSize
    );
  }

  private updateAccessOrder(key: string): void {
    // Remove from current position
    this.removeFromAccessOrder(key);

    // Add to end (most recently used)
    this.accessOrder.push(key);
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  private updateStats(): void {
    this.stats.totalEntries = this.cache.size;
    this.stats.totalSize = Array.from(this.cache.values()).reduce(
      (total, entry) => total + entry.size,
      0
    );
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  private updateAverageAccessTime(accessTime: number): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.averageAccessTime =
      (this.stats.averageAccessTime * (total - 1) + accessTime) / total;
  }

  private estimateSize(value: any): number {
    if (typeof value === "string") {
      return value.length * 2; // UTF-16
    }

    if (typeof value === "number") {
      return 8;
    }

    if (typeof value === "boolean") {
      return 1;
    }

    if (value === null || value === undefined) {
      return 0;
    }

    // Rough estimate for objects/arrays
    try {
      return JSON.stringify(value).length * 2;
    } catch {
      return 1024; // Default estimate
    }
  }

  private checkMemoryWarning(): void {
    const usage = this.stats.totalSize / this.config.maxSize;
    const wasWarning = this.isWarningThresholdReached;
    this.isWarningThresholdReached = usage >= this.config.warningThreshold;

    if (this.isWarningThresholdReached && !wasWarning) {
      console.warn(
        `Cache memory usage has reached ${Math.round(usage * 100)}% of limit`,
        this.getUsage()
      );
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private loadFromStorage(): void {
    try {
      const storage =
        this.config.storageType === "localStorage"
          ? localStorage
          : sessionStorage;

      const data = storage.getItem(this.config.persistenceKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.import(parsed);
      }
    } catch (error) {
      console.error("Failed to load cache from storage:", error);
    }
  }

  private saveToStorage(): void {
    try {
      const storage =
        this.config.storageType === "localStorage"
          ? localStorage
          : sessionStorage;

      const data = this.export();
      storage.setItem(this.config.persistenceKey, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save cache to storage:", error);
    }
  }

  private clearStorage(): void {
    try {
      const storage =
        this.config.storageType === "localStorage"
          ? localStorage
          : sessionStorage;

      storage.removeItem(this.config.persistenceKey);
    } catch (error) {
      console.error("Failed to clear cache storage:", error);
    }
  }
}

// Default cache instance
let defaultCacheManager: AdvancedCacheManager | null = null;

/**
 * Get default cache manager instance
 */
export function getDefaultCacheManager(): AdvancedCacheManager {
  if (!defaultCacheManager) {
    defaultCacheManager = new AdvancedCacheManager();
  }
  return defaultCacheManager;
}

/**
 * Create a new cache manager with custom configuration
 */
export function createCacheManager(
  config: Partial<CacheConfig> = {}
): AdvancedCacheManager {
  return new AdvancedCacheManager(config);
}
