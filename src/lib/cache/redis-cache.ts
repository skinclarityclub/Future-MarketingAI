import { Redis } from "ioredis";

interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  defaultTTL?: number;
}

interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number;
}

class RedisCacheService {
  private static instance: RedisCacheService;
  private redis: Redis | null = null;
  private config: CacheConfig;
  private isConnected = false;
  private fallbackCache = new Map<string, CacheItem>();

  private constructor(config: CacheConfig) {
    this.config = {
      defaultTTL: 300, // 5 minutes
      keyPrefix: "skc-bi:",
      ...config,
    };
  }

  static getInstance(config?: CacheConfig): RedisCacheService {
    if (!RedisCacheService.instance) {
      if (!config) {
        throw new Error("RedisCacheService requires initial configuration");
      }
      RedisCacheService.instance = new RedisCacheService(config);
    }
    return RedisCacheService.instance;
  }

  // Initialize Redis connection
  async connect(): Promise<boolean> {
    try {
      this.redis = new Redis({
        host: this.config.host,
        port: this.config.port,
        password: this.config.password,
        db: this.config.db || 0,
        keyPrefix: this.config.keyPrefix,
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });

      this.redis.on("connect", () => {
        console.log("[Redis Cache] Connected to Redis server");
        this.isConnected = true;
      });

      this.redis.on("error", err => {
        console.error("[Redis Cache] Redis connection error:", err);
        this.isConnected = false;
      });

      this.redis.on("close", () => {
        console.log("[Redis Cache] Redis connection closed");
        this.isConnected = false;
      });

      await this.redis.connect();
      return true;
    } catch (error) {
      console.error("[Redis Cache] Failed to connect to Redis:", error);
      this.isConnected = false;
      return false;
    }
  }

  // Get item from cache
  async get<T = any>(key: string): Promise<T | null> {
    try {
      if (this.isConnected && this.redis) {
        const value = await this.redis.get(key);
        if (value) {
          return JSON.parse(value) as T;
        }
      } else {
        // Fallback to memory cache
        const item = this.fallbackCache.get(key);
        if (item && Date.now() - item.timestamp < item.ttl * 1000) {
          return item.data as T;
        } else if (item) {
          this.fallbackCache.delete(key);
        }
      }
      return null;
    } catch (error) {
      console.error(`[Redis Cache] Error getting key ${key}:`, error);
      return null;
    }
  }

  // Set item in cache
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const serializedValue = JSON.stringify(value);
      const expireTime = ttl || this.config.defaultTTL || 300;

      if (this.isConnected && this.redis) {
        await this.redis.setex(key, expireTime, serializedValue);
      } else {
        // Fallback to memory cache
        this.fallbackCache.set(key, {
          data: value,
          timestamp: Date.now(),
          ttl: expireTime,
        });

        // Clean up expired items periodically
        this.cleanupFallbackCache();
      }
      return true;
    } catch (error) {
      console.error(`[Redis Cache] Error setting key ${key}:`, error);
      return false;
    }
  }

  // Delete item from cache
  async delete(key: string): Promise<boolean> {
    try {
      if (this.isConnected && this.redis) {
        const result = await this.redis.del(key);
        return result > 0;
      } else {
        return this.fallbackCache.delete(key);
      }
    } catch (error) {
      console.error(`[Redis Cache] Error deleting key ${key}:`, error);
      return false;
    }
  }

  // Clear all cache
  async clear(): Promise<boolean> {
    try {
      if (this.isConnected && this.redis) {
        await this.redis.flushdb();
      } else {
        this.fallbackCache.clear();
      }
      return true;
    } catch (error) {
      console.error("[Redis Cache] Error clearing cache:", error);
      return false;
    }
  }

  // Get or set pattern - useful for expensive operations
  async getOrSet<T = any>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // If not in cache, fetch the data
      const data = await fetcher();

      // Store in cache for next time
      await this.set(key, data, ttl);

      return data;
    } catch (error) {
      console.error(`[Redis Cache] Error in getOrSet for key ${key}:`, error);
      // If caching fails, still return the fetched data
      return await fetcher();
    }
  }

  // Increment counter (useful for rate limiting)
  async increment(key: string, ttl?: number): Promise<number> {
    try {
      if (this.isConnected && this.redis) {
        const result = await this.redis.incr(key);
        if (ttl && result === 1) {
          await this.redis.expire(key, ttl);
        }
        return result;
      } else {
        // Fallback implementation
        const current = (await this.get<number>(key)) || 0;
        const newValue = current + 1;
        await this.set(key, newValue, ttl);
        return newValue;
      }
    } catch (error) {
      console.error(`[Redis Cache] Error incrementing key ${key}:`, error);
      return 1;
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      if (this.isConnected && this.redis) {
        const result = await this.redis.exists(key);
        return result === 1;
      } else {
        const item = this.fallbackCache.get(key);
        return (
          item !== undefined && Date.now() - item.timestamp < item.ttl * 1000
        );
      }
    } catch (error) {
      console.error(
        `[Redis Cache] Error checking existence of key ${key}:`,
        error
      );
      return false;
    }
  }

  // Get cache statistics
  async getStats(): Promise<{
    isConnected: boolean;
    memoryUsage?: string;
    keyCount?: number;
    fallbackCacheSize: number;
  }> {
    const stats = {
      isConnected: this.isConnected,
      fallbackCacheSize: this.fallbackCache.size,
    };

    try {
      if (this.isConnected && this.redis) {
        const info = await this.redis.info("memory");
        const keyCount = await this.redis.dbsize();

        return {
          ...stats,
          memoryUsage: this.parseMemoryUsage(info),
          keyCount,
        };
      }
    } catch (error) {
      console.error("[Redis Cache] Error getting stats:", error);
    }

    return stats;
  }

  private parseMemoryUsage(info: string): string {
    const lines = info.split("\r\n");
    const memoryLine = lines.find(line =>
      line.startsWith("used_memory_human:")
    );
    return memoryLine ? memoryLine.split(":")[1] : "Unknown";
  }

  // Clean up expired items from fallback cache
  private cleanupFallbackCache(): void {
    const now = Date.now();
    for (const [key, item] of this.fallbackCache.entries()) {
      if (now - item.timestamp > item.ttl * 1000) {
        this.fallbackCache.delete(key);
      }
    }
  }

  // Disconnect from Redis
  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
      this.isConnected = false;
    }
  }
}

// Cache middleware for API responses
export function cacheMiddleware(ttl = 300) {
  return async (req: any, res: any, next: any) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const cacheKey = `api:${req.originalUrl}`;
    const cache = RedisCacheService.getInstance();

    try {
      // Try to get cached response
      const cachedResponse = await cache.get(cacheKey);

      if (cachedResponse) {
        res.set("X-Cache", "HIT");
        res.set("Cache-Control", `public, max-age=${ttl}`);
        return res.json(cachedResponse);
      }

      // If not cached, capture the response
      const originalJson = res.json;
      res.json = function (data: any) {
        // Cache the response
        cache.set(cacheKey, data, ttl).catch(console.error);

        res.set("X-Cache", "MISS");
        res.set("Cache-Control", `public, max-age=${ttl}`);

        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error("[Redis Cache] Cache middleware error:", error);
      next();
    }
  };
}

// Helper function to create cache keys
export function createCacheKey(...parts: (string | number)[]): string {
  return parts.join(":");
}

// Initialize cache with environment variables
export function initializeCache(): RedisCacheService {
  const config: CacheConfig = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || "0"),
    keyPrefix: process.env.REDIS_KEY_PREFIX || "skc-bi:",
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || "300"),
  };

  const cache = RedisCacheService.getInstance(config);

  // Try to connect (non-blocking)
  cache.connect().then(connected => {
    if (connected) {
      console.log("[Redis Cache] Successfully initialized Redis cache");
    } else {
      console.warn(
        "[Redis Cache] Failed to connect to Redis, using fallback memory cache"
      );
    }
  });

  return cache;
}

export { RedisCacheService };
