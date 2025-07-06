"use client";

/**
 * Cache Provider for Message Configuration System
 *
 * React context provider for cache management with hooks for:
 * - Cache operations (get, set, delete)
 * - Cache monitoring and statistics
 * - Memory usage alerts
 * - Cache warming and preloading
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  AdvancedCacheManager,
  CacheStats,
  CacheConfig,
  getDefaultCacheManager,
} from "./cache-manager";

// Context types
interface CacheContextType {
  cacheManager: AdvancedCacheManager;
  stats: CacheStats;
  usage: {
    entries: number;
    maxEntries: number;
    entriesUsage: number;
    sizeBytes: number;
    maxSizeBytes: number;
    sizeUsage: number;
    isWarningThresholdReached: boolean;
  };
  get: <T>(key: string) => T | null;
  set: <T>(key: string, value: T, ttl?: number, tags?: string[]) => boolean;
  delete: (key: string) => boolean;
  clear: () => void;
  cleanup: () => number;
  warmCache: <T>(
    entries: Array<{ key: string; value: T; ttl?: number; tags?: string[] }>
  ) => void;
  getByTags: <T>(tags: string[]) => Array<{ key: string; value: T }>;
  deleteByTags: (tags: string[]) => number;
  refreshStats: () => void;
}

// Default context value
const defaultContextValue: CacheContextType = {
  cacheManager: getDefaultCacheManager(),
  stats: {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalEntries: 0,
    totalSize: 0,
    averageAccessTime: 0,
    evictions: 0,
    lastCleanup: Date.now(),
  },
  usage: {
    entries: 0,
    maxEntries: 1000,
    entriesUsage: 0,
    sizeBytes: 0,
    maxSizeBytes: 50 * 1024 * 1024,
    sizeUsage: 0,
    isWarningThresholdReached: false,
  },
  get: () => null,
  set: () => false,
  delete: () => false,
  clear: () => {},
  cleanup: () => 0,
  warmCache: () => {},
  getByTags: () => [],
  deleteByTags: () => 0,
  refreshStats: () => {},
};

// Create context
const CacheContext = createContext<CacheContextType>(defaultContextValue);

// Provider props
interface CacheProviderProps {
  children: React.ReactNode;
  config?: Partial<CacheConfig>;
  onMemoryWarning?: (usage: number) => void;
  statsUpdateInterval?: number;
}

// Provider component
export function CacheProvider({
  children,
  config,
  onMemoryWarning,
  statsUpdateInterval = 5000,
}: CacheProviderProps) {
  const [cacheManager] = useState(() => {
    return config ? new AdvancedCacheManager(config) : getDefaultCacheManager();
  });

  const [stats, setStats] = useState<CacheStats>(cacheManager.getStats());
  const [usage, setUsage] = useState(cacheManager.getUsage());

  // Track warning state to prevent spam
  const lastWarningRef = useRef<number>(0);

  // Update stats and usage
  const refreshStats = useCallback(() => {
    const newStats = cacheManager.getStats();
    const newUsage = cacheManager.getUsage();

    setStats(newStats);
    setUsage(newUsage);

    // Check for memory warning
    if (newUsage.isWarningThresholdReached) {
      const now = Date.now();
      if (now - lastWarningRef.current > 30000) {
        // Throttle warnings to 30 seconds
        lastWarningRef.current = now;
        onMemoryWarning?.(newUsage.sizeUsage);
      }
    }
  }, [cacheManager, onMemoryWarning]);

  // Set up stats update interval
  useEffect(() => {
    const interval = setInterval(refreshStats, statsUpdateInterval);
    return () => clearInterval(interval);
  }, [refreshStats, statsUpdateInterval]);

  // Cache operations
  const get = useCallback(
    <T,>(key: string): T | null => {
      const result = cacheManager.get(key) as T | null;
      refreshStats(); // Update stats after operation
      return result;
    },
    [cacheManager, refreshStats]
  );

  const set = useCallback(
    <T,>(key: string, value: T, ttl?: number, tags: string[] = []): boolean => {
      const result = cacheManager.set(key, value, ttl, tags);
      refreshStats(); // Update stats after operation
      return result;
    },
    [cacheManager, refreshStats]
  );

  const deleteEntry = useCallback(
    (key: string): boolean => {
      const result = cacheManager.delete(key);
      refreshStats(); // Update stats after operation
      return result;
    },
    [cacheManager, refreshStats]
  );

  const clear = useCallback(() => {
    cacheManager.clear();
    refreshStats(); // Update stats after operation
  }, [cacheManager, refreshStats]);

  const cleanup = useCallback((): number => {
    const result = cacheManager.cleanup();
    refreshStats(); // Update stats after operation
    return result;
  }, [cacheManager, refreshStats]);

  const warmCache = useCallback(
    <T,>(
      entries: Array<{ key: string; value: T; ttl?: number; tags?: string[] }>
    ) => {
      cacheManager.warmCache(entries);
      refreshStats(); // Update stats after operation
    },
    [cacheManager, refreshStats]
  );

  const getByTags = useCallback(
    <T,>(tags: string[]) => {
      return cacheManager.getByTags(tags) as Array<{ key: string; value: T }>;
    },
    [cacheManager]
  );

  const deleteByTags = useCallback(
    (tags: string[]): number => {
      const result = cacheManager.deleteByTags(tags);
      refreshStats(); // Update stats after operation
      return result;
    },
    [cacheManager, refreshStats]
  );

  // Context value
  const contextValue: CacheContextType = {
    cacheManager,
    stats,
    usage,
    get,
    set,
    delete: deleteEntry,
    clear,
    cleanup,
    warmCache,
    getByTags,
    deleteByTags,
    refreshStats,
  };

  return (
    <CacheContext.Provider value={contextValue}>
      {children}
    </CacheContext.Provider>
  );
}

// Hook to use cache
export function useCache() {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error("useCache must be used within a CacheProvider");
  }
  return context;
}

// Hook for cache statistics
export function useCacheStats() {
  const { stats, usage, refreshStats } = useCache();

  useEffect(() => {
    // Refresh stats when component mounts
    refreshStats();
  }, [refreshStats]);

  return {
    stats,
    usage,
    refreshStats,
  };
}

// Hook for cache operations with automatic stats refresh
export function useCacheOperations() {
  const {
    get,
    set,
    delete: deleteEntry,
    clear,
    cleanup,
    warmCache,
    getByTags,
    deleteByTags,
  } = useCache();

  return {
    get,
    set,
    delete: deleteEntry,
    clear,
    cleanup,
    warmCache,
    getByTags,
    deleteByTags,
  };
}

// Hook for memory monitoring
export function useMemoryMonitor(warningCallback?: (usage: number) => void) {
  const { usage } = useCacheStats();
  const callbackRef = useRef(warningCallback);

  useEffect(() => {
    callbackRef.current = warningCallback;
  }, [warningCallback]);

  useEffect(() => {
    if (usage.isWarningThresholdReached && callbackRef.current) {
      callbackRef.current(usage.sizeUsage);
    }
  }, [usage.isWarningThresholdReached, usage.sizeUsage]);

  return {
    usage,
    isWarning: usage.isWarningThresholdReached,
    percentage: Math.round(usage.sizeUsage * 100),
  };
}

// Hook for cache warming
export function useCacheWarming() {
  const { warmCache } = useCacheOperations();
  const [isWarming, setIsWarming] = useState(false);

  const warmCacheAsync = useCallback(
    async <T,>(
      entries: Array<{ key: string; value: T; ttl?: number; tags?: string[] }>,
      batchSize = 50,
      delay = 0
    ) => {
      setIsWarming(true);

      try {
        // Process in batches to avoid blocking
        for (let i = 0; i < entries.length; i += batchSize) {
          const batch = entries.slice(i, i + batchSize);
          warmCache(batch);

          if (delay > 0 && i + batchSize < entries.length) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      } finally {
        setIsWarming(false);
      }
    },
    [warmCache]
  );

  return {
    warmCache: warmCacheAsync,
    isWarming,
  };
}

// Hook for tag-based cache management
export function useTaggedCache(tags: string[]) {
  const { getByTags, deleteByTags, set } = useCacheOperations();

  const setWithTags = useCallback(
    <T,>(
      key: string,
      value: T,
      ttl?: number,
      additionalTags: string[] = []
    ) => {
      return set(key, value, ttl, [...tags, ...additionalTags]);
    },
    [set, tags]
  );

  const getTaggedEntries = useCallback(() => {
    return getByTags(tags);
  }, [getByTags, tags]);

  const clearTaggedEntries = useCallback(() => {
    return deleteByTags(tags);
  }, [deleteByTags, tags]);

  return {
    setWithTags,
    getTaggedEntries,
    clearTaggedEntries,
  };
}

// Hook for automatic cache cleanup
export function useAutoCleanup(interval = 60000) {
  const { cleanup } = useCacheOperations();

  useEffect(() => {
    const timer = setInterval(() => {
      const cleaned = cleanup();
      if (cleaned > 0) {
        console.log(`Cache cleanup: removed ${cleaned} expired entries`);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [cleanup, interval]);
}
