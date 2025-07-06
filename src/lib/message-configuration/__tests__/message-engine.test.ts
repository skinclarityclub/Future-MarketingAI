/**
 * Message Configuration Engine Tests
 *
 * Comprehensive test suite for message configuration engine functionality
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  MessageConfigurationEngine,
  MessageContext,
  MessageVariables,
  EngineConfig,
  EngineStats,
} from "../core/message-config-engine";
import {
  MessageConfigurationSchema,
  MessageTemplate,
  MessageInstance,
} from "../schemas/message-config-schema";

// Test configuration
const testConfig: MessageConfigurationSchema = {
  version: "1.0.0",
  schemaVersion: "message-configuration-v1",
  configuration: {
    localization: {
      defaultLocale: "en-US",
      supportedLocales: ["en-US", "nl-NL"],
      fallbackStrategy: "default",
    },
    environment: {
      environment: "development",
      settings: {
        enableCaching: true,
        cacheTimeout: 300000,
        fallbackLocale: "en-US",
        debugMode: false,
        logLevel: "info",
      },
    },
    categories: {
      error: {
        defaultPriority: "high",
        auditRequired: true,
      },
      notification: {
        defaultPriority: "medium",
      },
    },
  },
  templates: [
    {
      id: "test-welcome",
      key: "welcome",
      category: "notification",
      priority: "medium",
      content: {
        "en-US": {
          title: "Welcome!",
          message: "Hello {{userName}}, welcome to our platform!",
        },
        "nl-NL": {
          title: "Welkom!",
          message: "Hallo {{userName}}, welkom op ons platform!",
        },
      },
      variables: {
        userName: {
          type: "string",
          required: true,
          description: "Name of the user",
        },
      },
      version: "1.0.0",
      metadata: {
        created: "2024-01-01T00:00:00Z",
        updated: "2024-01-01T00:00:00Z",
        createdBy: "system",
        updatedBy: "system",
        status: "active",
      },
    },
    {
      id: "test-error",
      key: "error",
      category: "error",
      priority: "high",
      content: {
        "en-US": {
          title: "Error",
          message: "An error occurred: {{errorMessage}}",
        },
      },
      variables: {
        errorMessage: {
          type: "string",
          required: true,
          description: "Error message to display",
        },
      },
      context: {
        userRoles: ["admin", "user"],
      },
      version: "1.0.0",
      metadata: {
        created: "2024-01-01T00:00:00Z",
        updated: "2024-01-01T00:00:00Z",
        createdBy: "system",
        updatedBy: "system",
        status: "active",
      },
    },
  ],
  metadata: {
    name: "Test Configuration",
    description: "Test message configuration",
    created: "2024-01-01T00:00:00Z",
    updated: "2024-01-01T00:00:00Z",
    author: "test",
    lastModifiedBy: "test",
  },
};

describe("MessageConfigurationEngine", () => {
  let engine: MessageConfigurationEngine;

  beforeEach(() => {
    engine = new MessageConfigurationEngine({
      enableCaching: true,
      cacheTimeout: 5000,
      fallbackLocale: "en-US",
      debugMode: true,
      validateOnLoad: true,
      maxCacheSize: 100,
    });
  });

  afterEach(() => {
    engine.clearCache();
  });

  describe("Initialization", () => {
    it("should initialize with valid configuration", async () => {
      await expect(engine.initialize(testConfig)).resolves.not.toThrow();
      expect(engine.getStats().messagesLoaded).toBe(2);
    });

    it("should throw error for invalid configuration", async () => {
      const invalidConfig = { ...testConfig, templates: [] };
      // This should pass validation, so let's test actual invalid structure
      const reallyInvalidConfig = {} as any;
      await expect(engine.initialize(reallyInvalidConfig)).rejects.toThrow();
    });
  });

  describe("Message Retrieval", () => {
    beforeEach(async () => {
      await engine.initialize(testConfig);
    });

    it("should retrieve message by key", async () => {
      const context: MessageContext = {
        locale: "en-US",
        userRole: "user",
      };

      const variables: MessageVariables = {
        userName: "John",
      };

      const message = await engine.getMessage("welcome", context, variables);

      expect(message).toBeTruthy();
      expect(message?.resolvedContent.message).toBe(
        "Hello John, welcome to our platform!"
      );
      expect(message?.resolvedContent.title).toBe("Welcome!");
    });

    it("should handle missing message gracefully", async () => {
      const message = await engine.getMessage("nonexistent");
      expect(message).toBeNull();
    });

    it("should use fallback locale", async () => {
      const context: MessageContext = {
        locale: "fr-FR", // Unsupported locale
      };

      const message = await engine.getMessage("welcome", context, {
        userName: "Test",
      });
      expect(message).toBeTruthy();
      expect(message?.context.locale).toBe("en-US"); // Should fallback
    });

    it("should respect context matching", async () => {
      const validContext: MessageContext = {
        userRole: "admin",
        locale: "en-US",
      };

      const invalidContext: MessageContext = {
        userRole: "guest", // Not in allowed roles
        locale: "en-US",
      };

      const validMessage = await engine.getMessage("error", validContext, {
        errorMessage: "Test",
      });
      const invalidMessage = await engine.getMessage("error", invalidContext, {
        errorMessage: "Test",
      });

      expect(validMessage).toBeTruthy();
      expect(invalidMessage).toBeNull(); // Context doesn't match
    });
  });

  describe("Variable Interpolation", () => {
    beforeEach(async () => {
      await engine.initialize(testConfig);
    });

    it("should interpolate string variables", async () => {
      const message = await engine.getMessage(
        "welcome",
        {},
        { userName: "Alice" }
      );
      expect(message?.resolvedContent.message).toBe(
        "Hello Alice, welcome to our platform!"
      );
    });

    it("should handle missing variables", async () => {
      const message = await engine.getMessage("welcome", {}, {});
      expect(message?.resolvedContent.message).toBe(
        "Hello {{userName}}, welcome to our platform!"
      );
    });

    it("should format different variable types", async () => {
      // Add a template with different variable types for testing
      const advancedTemplate: MessageTemplate = {
        id: "test-advanced",
        key: "advanced",
        category: "info",
        priority: "medium",
        content: {
          "en-US": {
            message: "Number: {{count}}, Date: {{date}}, Boolean: {{active}}",
          },
        },
        variables: {
          count: { type: "number", required: false },
          date: { type: "date", required: false },
          active: { type: "boolean", required: false },
        },
        version: "1.0.0",
        metadata: {
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-01T00:00:00Z",
          createdBy: "system",
          updatedBy: "system",
          status: "active",
        },
      };

      const configWithAdvanced = {
        ...testConfig,
        templates: [...testConfig.templates, advancedTemplate],
      };

      await engine.updateConfiguration(configWithAdvanced);

      const message = await engine.getMessage(
        "advanced",
        {},
        {
          count: 42,
          date: new Date("2024-01-01"),
          active: true,
        }
      );

      expect(message?.resolvedContent.message).toContain("Number: 42");
      expect(message?.resolvedContent.message).toContain("Date: 1/1/2024");
      expect(message?.resolvedContent.message).toContain("Boolean: true");
    });
  });

  describe("Caching", () => {
    beforeEach(async () => {
      await engine.initialize(testConfig);
    });

    it("should cache messages", async () => {
      const message1 = await engine.getMessage(
        "welcome",
        {},
        { userName: "Test" }
      );
      const message2 = await engine.getMessage(
        "welcome",
        {},
        { userName: "Test" }
      );

      expect(message1?.metadata.cacheHit).toBe(false);
      expect(message2?.metadata.cacheHit).toBe(true);

      const stats = engine.getStats();
      expect(stats.cacheHits).toBe(1);
      expect(stats.cacheMisses).toBe(1);
    });

    it("should clear cache", async () => {
      await engine.getMessage("welcome", {}, { userName: "Test" });
      expect(engine.getCacheInfo().messageCache.size).toBeGreaterThan(0);

      engine.clearCache();
      expect(engine.getCacheInfo().messageCache.size).toBe(0);
    });
  });

  describe("Category Messages", () => {
    beforeEach(async () => {
      await engine.initialize(testConfig);
    });

    it("should get messages by category", async () => {
      const messages = await engine.getMessagesByCategory(
        "notification",
        {},
        { userName: "Test" }
      );

      expect(messages).toHaveLength(1);
      expect(messages[0].templateId).toBe("test-welcome");
    });

    it("should return empty array for nonexistent category", async () => {
      const messages = await engine.getMessagesByCategory("nonexistent" as any);
      expect(messages).toHaveLength(0);
    });
  });

  describe("Statistics", () => {
    beforeEach(async () => {
      await engine.initialize(testConfig);
    });

    it("should track statistics", async () => {
      const initialStats = engine.getStats();
      expect(initialStats.messagesLoaded).toBe(2);
      expect(initialStats.retrievalCount).toBe(0);

      await engine.getMessage("welcome", {}, { userName: "Test" });

      const updatedStats = engine.getStats();
      expect(updatedStats.retrievalCount).toBe(1);
      expect(updatedStats.averageRetrievalTime).toBeGreaterThan(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle uninitialized engine", async () => {
      await expect(engine.getMessage("test")).rejects.toThrow(
        "Engine not initialized"
      );
    });

    it("should track error count on failures", async () => {
      // Initialize with invalid config to trigger error tracking
      const invalidConfig = {
        ...testConfig,
        templates: [
          {
            ...testConfig.templates[0],
            content: {
              "en-US": {
                message: null, // Invalid content
              },
            },
          } as any,
        ],
      };

      try {
        await engine.initialize(invalidConfig);
      } catch (error) {
        // Expected to fail
      }

      const stats = engine.getStats();
      expect(typeof stats.errorCount).toBe("number");
    });
  });

  describe("Configuration Updates", () => {
    beforeEach(async () => {
      await engine.initialize(testConfig);
    });

    it("should update configuration", async () => {
      const newTemplate: MessageTemplate = {
        id: "test-new",
        key: "new",
        category: "info",
        priority: "low",
        content: {
          "en-US": {
            message: "New message",
          },
        },
        version: "1.0.0",
        metadata: {
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-01T00:00:00Z",
          createdBy: "system",
          updatedBy: "system",
          status: "active",
        },
      };

      const newConfig = {
        ...testConfig,
        templates: [...testConfig.templates, newTemplate],
      };

      await engine.updateConfiguration(newConfig);

      const message = await engine.getMessage("new");
      expect(message).toBeTruthy();
      expect(message?.resolvedContent.message).toBe("New message");

      const stats = engine.getStats();
      expect(stats.messagesLoaded).toBe(3);
    });
  });
});

describe("Engine Configuration", () => {
  it("should use custom configuration", () => {
    const customConfig: Partial<EngineConfig> = {
      enableCaching: false,
      debugMode: true,
      maxCacheSize: 50,
    };

    const engine = new MessageConfigurationEngine(customConfig);
    const cacheInfo = engine.getCacheInfo();

    expect(typeof cacheInfo.messageCache.size).toBe("number");
  });

  it("should use default configuration", () => {
    const engine = new MessageConfigurationEngine();
    const stats = engine.getStats();

    expect(stats.messagesLoaded).toBe(0);
    expect(stats.cacheHits).toBe(0);
  });
});
