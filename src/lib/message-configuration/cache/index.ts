// Message Configuration Cache System
// Export all caching functionality

export {
  AdvancedCacheManager,
  getDefaultCacheManager,
  createCacheManager,
} from "./cache-manager";

export type { CacheEntry, CacheStats, CacheConfig } from "./cache-manager";

export {
  CacheProvider,
  useCache,
  useCacheStats,
  useCacheOperations,
  useMemoryMonitor,
  useCacheWarming,
  useTaggedCache,
  useAutoCleanup,
} from "./cache-provider";
