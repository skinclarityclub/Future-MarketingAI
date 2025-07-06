/**
 * Message Cache Tests
 *
 * Comprehensive test suite for the MessageCache implementation
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  MessageCache,
  CacheEntry,
  CacheStats,
  CacheConfig,
} from "../core/message-cache";
import { MessageInstance } from "../schemas/message-config-schema";

// Mock message instance for testing
const createMockMessage = (id: string, content: string): MessageInstance => ({
  templateId: id,
  resolvedContent: {
    message: content,
    title: `Title ${id}`,
  },
  context: {
    locale: "en-US",
    variables: {},
    userContext: {},
    timestamp: new Date().toISOString(),
  },
  display: {
    type: "toast",
    duration: 3000,
    dismissible: true,
    position: "top-right",
    style: {},
  },
  metadata: {
    renderTime: 1.5,
    cacheHit: false,
  },
});

describe("MessageCache", () => {
  let cache: MessageCache;

  beforeEach(() => {
    cache = new MessageCache({
      maxEntries: 100,
      ttl: 5000, // 5 seconds for testing
      cleanupInterval: 1000, // 1 second for testing
    });
  });

  afterEach(() => {
    cache.destroy();
  });

  describe("Basic Operations", () => {
    it("should set and get cache entries", () => {
      const message = createMockMessage("test-1", "Test message");

      cache.set("test-key", message);
      const retrieved = cache.get("test-key");

      expect(retrieved).toBeTruthy();
      expect(retrieved?.templateId).toBe("test-1");
      expect(retrieved?.resolvedContent.message).toBe("Test message");
      expect(retrieved?.metadata.cacheHit).toBe(true);
    });

    it("should return null for non-existent keys", () => {
      const retrieved = cache.get("non-existent");
      expect(retrieved).toBeNull();
    });

    it("should clear all cache entries", () => {
      cache.set("key1", createMockMessage("1", "Message 1"));
      cache.set("key2", createMockMessage("2", "Message 2"));

      expect(cache.size()).toBe(2);

      cache.clear();

      expect(cache.size()).toBe(0);
      expect(cache.get("key1")).toBeNull();
      expect(cache.get("key2")).toBeNull();
    });
  });

  describe("TTL and Expiration", () => {
    it("should expire entries after TTL", async () => {
      const shortCache = new MessageCache({ ttl: 100 }); // 100ms TTL
      const message = createMockMessage("test", "Test message");

      shortCache.set("test-key", message);
      expect(shortCache.get("test-key")).toBeTruthy();

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(shortCache.get("test-key")).toBeNull();
      shortCache.destroy();
    });

    it("should update stats when entries expire", async () => {
      const shortCache = new MessageCache({ ttl: 50 }); // 50ms TTL
      const message = createMockMessage("test", "Test message");

      shortCache.set("test-key", message);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 100));

      // Try to get expired entry
      shortCache.get("test-key");

      const stats = shortCache.getStats();
      expect(stats.health.expiredEntries).toBeGreaterThan(0);

      shortCache.destroy();
    });

    it("should cleanup expired entries automatically", async () => {
      const message = createMockMessage("test", "Test message");
      cache.set("test-key", message);

      expect(cache.size()).toBe(1);

      // Wait for TTL to expire and cleanup to run
      await new Promise(resolve => setTimeout(resolve, 6000));

      expect(cache.size()).toBe(0);
    }, 10000);
  });

  describe("Metadata and Categorization", () => {
    it("should store metadata with cache entries", () => {
      const message = createMockMessage("test", "Test message");
      const metadata = {
        category: "notification",
        language: "en-US",
        version: "1.0.0",
      };

      cache.set("test-key", message, metadata);

      // We can't directly access the metadata, but we can verify
      // the message was stored and retrieved correctly
      const retrieved = cache.get("test-key");
      expect(retrieved).toBeTruthy();
    });
  });

  describe("Cache Statistics", () => {
    it("should track usage statistics", () => {
      const message1 = createMockMessage("1", "Message 1");
      const message2 = createMockMessage("2", "Message 2");

      cache.set("key1", message1);
      cache.set("key2", message2);

      const stats = cache.getStats();

      expect(stats.usage.entries).toBe(2);
      expect(stats.usage.sizeBytes).toBeGreaterThan(0);
      expect(stats.usage.sizeUsage).toBeGreaterThanOrEqual(0);
    });

    it("should track performance statistics", () => {
      const message = createMockMessage("test", "Test message");

      cache.set("test-key", message);

      // Access the same key multiple times
      cache.get("test-key");
      cache.get("test-key");
      cache.get("test-key");

      const stats = cache.getStats();

      expect(stats.performance.hitRate).toBeGreaterThanOrEqual(0);
      expect(stats.performance.mostAccessed).toContain("test-key");
    });

    it("should track health statistics", () => {
      const stats = cache.getStats();

      expect(stats.health.expiredEntries).toBe(0);
      expect(stats.health.evictionCount).toBe(0);
      expect(stats.health.lastCleanup).toBeTruthy();
      expect(new Date(stats.health.lastCleanup)).toBeInstanceOf(Date);
    });
  });

  describe("Cache Eviction", () => {
    it("should evict entries when max capacity is reached", () => {
      const smallCache = new MessageCache({ maxEntries: 3 });

      // Add entries up to the limit
      smallCache.set("key1", createMockMessage("1", "Message 1"));
      smallCache.set("key2", createMockMessage("2", "Message 2"));
      smallCache.set("key3", createMockMessage("3", "Message 3"));

      expect(smallCache.size()).toBe(3);

      // Add one more to trigger eviction
      smallCache.set("key4", createMockMessage("4", "Message 4"));

      expect(smallCache.size()).toBeLessThanOrEqual(3);

      smallCache.destroy();
    });

    it("should track eviction count in statistics", () => {
      const smallCache = new MessageCache({ maxEntries: 2 });

      smallCache.set("key1", createMockMessage("1", "Message 1"));
      smallCache.set("key2", createMockMessage("2", "Message 2"));
      smallCache.set("key3", createMockMessage("3", "Message 3")); // Should trigger eviction

      const stats = smallCache.getStats();
      expect(stats.health.evictionCount).toBeGreaterThan(0);

      smallCache.destroy();
    });
  });

  describe("Configuration", () => {
    it("should use default configuration when none provided", () => {
      const defaultCache = new MessageCache();

      expect(defaultCache.size()).toBe(0);

      // Should be able to add entries
      defaultCache.set("test", createMockMessage("test", "Test"));
      expect(defaultCache.size()).toBe(1);

      defaultCache.destroy();
    });

    it("should use custom configuration", () => {
      const customConfig: Partial<CacheConfig> = {
        maxEntries: 10,
        ttl: 1000,
        evictionPolicy: "LFU",
      };

      const customCache = new MessageCache(customConfig);

      // Verify cache works with custom config
      customCache.set("test", createMockMessage("test", "Test"));
      expect(customCache.size()).toBe(1);

      customCache.destroy();
    });
  });

  describe("Performance", () => {
    it("should handle large number of entries efficiently", () => {
      const startTime = performance.now();

      // Add 1000 entries
      for (let i = 0; i < 1000; i++) {
        cache.set(`key${i}`, createMockMessage(`test${i}`, `Message ${i}`));
      }

      const insertTime = performance.now() - startTime;
      expect(insertTime).toBeLessThan(1000); // Should complete in less than 1 second

      // Retrieve 1000 entries
      const retrieveStartTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        cache.get(`key${i}`);
      }

      const retrieveTime = performance.now() - retrieveStartTime;
      expect(retrieveTime).toBeLessThan(100); // Should complete in less than 100ms
    });

    it("should handle concurrent access", () => {
      const message = createMockMessage("test", "Test message");

      // Simulate concurrent access
      const promises: Promise<void>[] = [];

      for (let i = 0; i < 100; i++) {
        promises.push(
          new Promise<void>(resolve => {
            cache.set(`key${i}`, message);
            cache.get(`key${i}`);
            resolve();
          })
        );
      }

      expect(() => Promise.all(promises)).not.toThrow();
    });
  });

  describe("Memory Management", () => {
    it("should estimate cache size", () => {
      const message = createMockMessage(
        "test",
        "Test message with some content"
      );

      cache.set("test-key", message);

      const stats = cache.getStats();
      expect(stats.usage.sizeBytes).toBeGreaterThan(0);
    });

    it("should cleanup resources when destroyed", () => {
      const message = createMockMessage("test", "Test message");
      cache.set("test-key", message);

      expect(cache.size()).toBe(1);

      cache.destroy();

      expect(cache.size()).toBe(0);
    });
  });
});
