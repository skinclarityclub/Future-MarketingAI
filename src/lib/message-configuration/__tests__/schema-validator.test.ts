/**
 * Message Configuration Schema Validator Tests
 *
 * Comprehensive test suite for validating message configuration schemas
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  MessageConfigurationValidator,
  validateMessageConfiguration,
  validateMessageTemplate,
} from "../validators/schema-validator";
import {
  MessageConfigurationSchema,
  MessageTemplate,
} from "../schemas/message-config-schema";
import sampleConfig from "../examples/sample-config";

describe("MessageConfigurationValidator", () => {
  let validator: MessageConfigurationValidator;

  beforeEach(() => {
    validator = new MessageConfigurationValidator();
  });

  describe("Complete Schema Validation", () => {
    it("should validate a valid complete schema", () => {
      const result = validator.validate(sampleConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail validation for missing required fields", () => {
      const invalidConfig = {
        // Missing required fields
        templates: [],
      } as unknown as MessageConfigurationSchema;

      const result = validator.validate(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);

      const errorCodes = result.errors.map(e => e.code);
      expect(errorCodes).toContain("MISSING_VERSION");
      expect(errorCodes).toContain("MISSING_SCHEMA_VERSION");
      expect(errorCodes).toContain("MISSING_CONFIGURATION");
      expect(errorCodes).toContain("MISSING_METADATA");
    });

    it("should validate version format", () => {
      const configWithInvalidVersion = {
        ...sampleConfig,
        version: "invalid-version",
      };

      const result = validator.validate(configWithInvalidVersion);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === "INVALID_VERSION_FORMAT")).toBe(
        true
      );
    });
  });

  describe("Localization Validation", () => {
    it("should validate localization configuration", () => {
      const configWithInvalidLocalization = {
        ...sampleConfig,
        configuration: {
          ...sampleConfig.configuration,
          localization: {
            ...sampleConfig.configuration.localization,
            defaultLocale: "invalid-locale",
            supportedLocales: ["invalid", "en-US"],
          },
        },
      };

      const result = validator.validate(configWithInvalidLocalization);

      expect(result.isValid).toBe(false);
      const errorCodes = result.errors.map(e => e.code);
      expect(errorCodes).toContain("DEFAULT_LOCALE_NOT_SUPPORTED");
      expect(errorCodes).toContain("INVALID_LOCALE_FORMAT");
    });

    it("should require default locale in supported locales", () => {
      const configWithMismatchedLocales = {
        ...sampleConfig,
        configuration: {
          ...sampleConfig.configuration,
          localization: {
            ...sampleConfig.configuration.localization,
            defaultLocale: "fr-FR",
            supportedLocales: ["en-US", "nl-NL"],
          },
        },
      };

      const result = validator.validate(configWithMismatchedLocales);

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(e => e.code === "DEFAULT_LOCALE_NOT_SUPPORTED")
      ).toBe(true);
    });
  });

  describe("Template Validation", () => {
    it("should validate individual template structure", () => {
      const validTemplate: MessageTemplate = {
        id: "test_message",
        key: "test.message",
        category: "info",
        priority: "medium",
        content: {
          "en-US": {
            title: "Test Message",
            message: "This is a test message",
            description: "Test description",
            actionLabel: "OK",
          },
        },
        version: "1.0.0",
        metadata: {
          created: "2024-01-15T10:00:00Z",
          updated: "2024-01-15T10:00:00Z",
          createdBy: "test",
          updatedBy: "test",
          status: "active",
        },
      };

      const result = validateMessageTemplate(validTemplate);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail validation for missing required template fields", () => {
      const invalidTemplate = {
        // Missing required fields
        category: "info",
      } as unknown as MessageTemplate;

      const result = validateMessageTemplate(invalidTemplate);

      expect(result.isValid).toBe(false);
      const errorCodes = result.errors.map(e => e.code);
      expect(errorCodes).toContain("MISSING_ID");
      expect(errorCodes).toContain("MISSING_KEY");
      expect(errorCodes).toContain("MISSING_CONTENT");
    });

    it("should validate template categories", () => {
      const templateWithInvalidCategory: MessageTemplate = {
        id: "test_message",
        key: "test.message",
        category: "invalid-category" as any,
        priority: "medium",
        content: {
          "en-US": {
            message: "Test message",
          },
        },
        version: "1.0.0",
        metadata: {
          created: "2024-01-15T10:00:00Z",
          updated: "2024-01-15T10:00:00Z",
          createdBy: "test",
          updatedBy: "test",
          status: "active",
        },
      };

      const result = validateMessageTemplate(templateWithInvalidCategory);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === "INVALID_CATEGORY")).toBe(true);
    });

    it("should validate template priorities", () => {
      const templateWithInvalidPriority: MessageTemplate = {
        id: "test_message",
        key: "test.message",
        category: "info",
        priority: "invalid-priority" as any,
        content: {
          "en-US": {
            message: "Test message",
          },
        },
        version: "1.0.0",
        metadata: {
          created: "2024-01-15T10:00:00Z",
          updated: "2024-01-15T10:00:00Z",
          createdBy: "test",
          updatedBy: "test",
          status: "active",
        },
      };

      const result = validateMessageTemplate(templateWithInvalidPriority);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === "INVALID_PRIORITY")).toBe(true);
    });

    it("should validate content localization", () => {
      const templateWithInvalidLocale: MessageTemplate = {
        id: "test_message",
        key: "test.message",
        category: "info",
        priority: "medium",
        content: {
          "invalid-locale": {
            message: "Test message",
          },
          "en-US": {
            // Missing message
          } as any,
        },
        version: "1.0.0",
        metadata: {
          created: "2024-01-15T10:00:00Z",
          updated: "2024-01-15T10:00:00Z",
          createdBy: "test",
          updatedBy: "test",
          status: "active",
        },
      };

      const result = validateMessageTemplate(templateWithInvalidLocale);

      expect(result.isValid).toBe(false);
      const errorCodes = result.errors.map(e => e.code);
      expect(errorCodes).toContain("INVALID_LOCALE_FORMAT");
      expect(errorCodes).toContain("MISSING_MESSAGE");
    });

    it("should detect duplicate template IDs and keys", () => {
      const configWithDuplicates = {
        ...sampleConfig,
        templates: [
          ...sampleConfig.templates,
          {
            ...sampleConfig.templates[0],
            // Same ID and key as first template
          },
        ],
      };

      const result = validator.validate(configWithDuplicates);

      expect(result.isValid).toBe(false);
      const errorCodes = result.errors.map(e => e.code);
      expect(errorCodes).toContain("DUPLICATE_ID");
      expect(errorCodes).toContain("DUPLICATE_KEY");
    });
  });

  describe("Variable Validation", () => {
    it("should validate template variables", () => {
      const templateWithInvalidVariables: MessageTemplate = {
        id: "test_message",
        key: "test.message",
        category: "info",
        priority: "medium",
        content: {
          "en-US": {
            message: "Hello {{userName}}",
          },
        },
        variables: {
          userName: {
            type: "invalid-type" as any,
            required: "not-boolean" as any,
          },
        },
        version: "1.0.0",
        metadata: {
          created: "2024-01-15T10:00:00Z",
          updated: "2024-01-15T10:00:00Z",
          createdBy: "test",
          updatedBy: "test",
          status: "active",
        },
      };

      const result = validateMessageTemplate(templateWithInvalidVariables);

      expect(result.isValid).toBe(false);
      const errorCodes = result.errors.map(e => e.code);
      expect(errorCodes).toContain("INVALID_VARIABLE_TYPE");
      expect(errorCodes).toContain("INVALID_REQUIRED_FIELD");
    });
  });

  describe("Display Configuration Validation", () => {
    it("should validate display configuration", () => {
      const templateWithInvalidDisplay: MessageTemplate = {
        id: "test_message",
        key: "test.message",
        category: "info",
        priority: "medium",
        content: {
          "en-US": {
            message: "Test message",
          },
        },
        display: {
          type: "invalid-type" as any,
          duration: -100,
          position: "invalid-position" as any,
        },
        version: "1.0.0",
        metadata: {
          created: "2024-01-15T10:00:00Z",
          updated: "2024-01-15T10:00:00Z",
          createdBy: "test",
          updatedBy: "test",
          status: "active",
        },
      };

      const result = validateMessageTemplate(templateWithInvalidDisplay);

      expect(result.isValid).toBe(false);
      const errorCodes = result.errors.map(e => e.code);
      expect(errorCodes).toContain("INVALID_DISPLAY_TYPE");
      expect(errorCodes).toContain("INVALID_DURATION");
      expect(errorCodes).toContain("INVALID_POSITION");
    });
  });

  describe("Metadata Validation", () => {
    it("should validate template metadata", () => {
      const templateWithInvalidMetadata: MessageTemplate = {
        id: "test_message",
        key: "test.message",
        category: "info",
        priority: "medium",
        content: {
          "en-US": {
            message: "Test message",
          },
        },
        version: "1.0.0",
        metadata: {
          created: "invalid-date",
          updated: "invalid-date",
          createdBy: "",
          updatedBy: "",
          status: "invalid-status" as any,
        },
      };

      const result = validateMessageTemplate(templateWithInvalidMetadata);

      expect(result.isValid).toBe(false);
      const errorCodes = result.errors.map(e => e.code);
      expect(errorCodes).toContain("INVALID_CREATED_FORMAT");
      expect(errorCodes).toContain("INVALID_UPDATED_FORMAT");
      expect(errorCodes).toContain("MISSING_CREATED_BY");
      expect(errorCodes).toContain("MISSING_UPDATED_BY");
      expect(errorCodes).toContain("INVALID_STATUS");
    });
  });

  describe("Environment Configuration Validation", () => {
    it("should validate environment configuration", () => {
      const configWithInvalidEnvironment = {
        ...sampleConfig,
        configuration: {
          ...sampleConfig.configuration,
          environment: {
            environment: "invalid-env" as any,
            settings: {
              enableCaching: "not-boolean" as any,
              cacheTimeout: -100,
              fallbackLocale: "invalid-locale",
              debugMode: true,
              logLevel: "info" as const,
            },
          },
        },
      };

      const result = validator.validate(configWithInvalidEnvironment);

      expect(result.isValid).toBe(false);
      const errorCodes = result.errors.map(e => e.code);
      expect(errorCodes).toContain("INVALID_ENVIRONMENT");
      expect(errorCodes).toContain("INVALID_ENABLE_CACHING");
      expect(errorCodes).toContain("INVALID_CACHE_TIMEOUT");
      expect(errorCodes).toContain("INVALID_FALLBACK_LOCALE");
    });
  });

  describe("Cache Configuration Validation", () => {
    it("should validate cache configuration", () => {
      const configWithInvalidCache = {
        ...sampleConfig,
        configuration: {
          ...sampleConfig.configuration,
          cache: {
            enabled: true,
            strategy: "invalid-strategy" as any,
            ttl: -100,
            maxSize: 0,
          },
        },
      };

      const result = validator.validate(configWithInvalidCache);

      expect(result.isValid).toBe(false);
      const errorCodes = result.errors.map(e => e.code);
      expect(errorCodes).toContain("INVALID_CACHE_STRATEGY");
      expect(errorCodes).toContain("INVALID_TTL");
      expect(errorCodes).toContain("INVALID_MAX_SIZE");
    });
  });

  describe("Analytics Configuration Validation", () => {
    it("should validate analytics configuration", () => {
      const configWithInvalidAnalytics = {
        ...sampleConfig,
        analytics: {
          enabled: "not-boolean" as any,
          events: {
            messageShown: "not-boolean" as any,
          },
        },
      };

      const result = validator.validate(configWithInvalidAnalytics);

      expect(result.isValid).toBe(false);
      const errorCodes = result.errors.map(e => e.code);
      expect(errorCodes).toContain("INVALID_ANALYTICS_ENABLED");
      expect(errorCodes).toContain("INVALID_EVENT_CONFIG");
    });
  });

  describe("Factory Functions", () => {
    it("should validate using factory function", () => {
      const result = validateMessageConfiguration(sampleConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate template using factory function", () => {
      const template = sampleConfig.templates[0];
      const result = validateMessageTemplate(template);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty templates array", () => {
      const configWithNoTemplates = {
        ...sampleConfig,
        templates: [],
      };

      const result = validator.validate(configWithNoTemplates);

      expect(result.warnings.some(w => w.code === "NO_TEMPLATES")).toBe(true);
    });

    it("should validate ISO 8601 date formats", () => {
      const validDates = [
        "2024-01-15T10:00:00Z",
        "2024-01-15T10:00:00.000Z",
        "2024-01-15T10:00:00",
      ];

      validDates.forEach(date => {
        const template: MessageTemplate = {
          id: "test",
          key: "test",
          category: "info",
          priority: "medium",
          content: { "en-US": { message: "test" } },
          version: "1.0.0",
          metadata: {
            created: date,
            updated: date,
            createdBy: "test",
            updatedBy: "test",
            status: "active",
          },
        };

        const result = validateMessageTemplate(template);
        expect(result.isValid).toBe(true);
      });
    });

    it("should validate semantic versioning", () => {
      const validVersions = [
        "1.0.0",
        "2.1.3",
        "10.20.30",
        "1.0.0-alpha",
        "1.0.0+build.1",
      ];
      const invalidVersions = ["1.0", "1", "v1.0.0", "1.0.0.0"];

      validVersions.forEach(version => {
        const config = { ...sampleConfig, version };
        const result = validator.validate(config);
        expect(
          result.errors.some(e => e.code === "INVALID_VERSION_FORMAT")
        ).toBe(false);
      });

      invalidVersions.forEach(version => {
        const config = { ...sampleConfig, version };
        const result = validator.validate(config);
        expect(
          result.errors.some(e => e.code === "INVALID_VERSION_FORMAT")
        ).toBe(true);
      });
    });
  });
});
