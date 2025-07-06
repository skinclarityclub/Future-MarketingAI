/**
 * Message Configuration Schema Validator
 *
 * Comprehensive validation for message configuration schema
 * with detailed error reporting and validation rules.
 */

import {
  MessageConfigurationSchema,
  MessageTemplate,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  MessageCategory,
  MessagePriority,
  DisplayType,
  Environment,
} from "../schemas/message-config-schema";

export class MessageConfigurationValidator {
  private errors: ValidationError[] = [];
  private warnings: ValidationWarning[] = [];

  /**
   * Validate a complete message configuration schema
   */
  public validate(config: MessageConfigurationSchema): ValidationResult {
    this.errors = [];
    this.warnings = [];

    // Validate schema structure
    this.validateSchemaStructure(config);

    // Validate configuration section
    this.validateConfiguration(config.configuration);

    // Validate templates
    this.validateTemplates(config.templates);

    // Validate template references and dependencies
    this.validateTemplateReferences(config);

    // Validate inheritance if present
    if (config.inheritance) {
      this.validateInheritance(config.inheritance, config.templates);
    }

    // Validate experiments if present
    if (config.experiments) {
      this.validateExperiments(config.experiments, config.templates);
    }

    // Validate analytics configuration
    if (config.analytics) {
      this.validateAnalytics(config.analytics);
    }

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    };
  }

  /**
   * Validate individual message template
   */
  public validateTemplate(template: MessageTemplate): ValidationResult {
    this.errors = [];
    this.warnings = [];

    this.validateSingleTemplate(template, 0);

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    };
  }

  private validateSchemaStructure(config: MessageConfigurationSchema): void {
    // Check required fields
    if (!config.version) {
      this.addError("version", "Version is required", "MISSING_VERSION");
    }

    if (!config.schemaVersion) {
      this.addError(
        "schemaVersion",
        "Schema version is required",
        "MISSING_SCHEMA_VERSION"
      );
    }

    if (!config.configuration) {
      this.addError(
        "configuration",
        "Configuration is required",
        "MISSING_CONFIGURATION"
      );
    }

    if (!config.templates || !Array.isArray(config.templates)) {
      this.addError(
        "templates",
        "Templates array is required",
        "MISSING_TEMPLATES"
      );
    }

    if (!config.metadata) {
      this.addError("metadata", "Metadata is required", "MISSING_METADATA");
    }

    // Validate version format
    if (config.version && !this.isValidVersion(config.version)) {
      this.addError(
        "version",
        "Invalid version format. Use semantic versioning (e.g., 1.0.0)",
        "INVALID_VERSION_FORMAT"
      );
    }
  }

  private validateConfiguration(
    config: MessageConfigurationSchema["configuration"]
  ): void {
    if (!config) return;

    // Validate localization
    if (config.localization) {
      this.validateLocalization(config.localization);
    }

    // Validate environment
    if (config.environment) {
      this.validateEnvironment(config.environment);
    }

    // Validate categories
    if (config.categories) {
      this.validateCategories(config.categories);
    }

    // Validate cache configuration
    if (config.cache) {
      this.validateCacheConfig(config.cache);
    }
  }

  private validateLocalization(
    localization: MessageConfigurationSchema["configuration"]["localization"]
  ): void {
    if (!localization.defaultLocale) {
      this.addError(
        "configuration.localization.defaultLocale",
        "Default locale is required",
        "MISSING_DEFAULT_LOCALE"
      );
    }

    if (
      !localization.supportedLocales ||
      localization.supportedLocales.length === 0
    ) {
      this.addError(
        "configuration.localization.supportedLocales",
        "At least one supported locale is required",
        "MISSING_SUPPORTED_LOCALES"
      );
    }

    if (
      localization.defaultLocale &&
      localization.supportedLocales &&
      !localization.supportedLocales.includes(localization.defaultLocale)
    ) {
      this.addError(
        "configuration.localization.defaultLocale",
        "Default locale must be included in supported locales",
        "DEFAULT_LOCALE_NOT_SUPPORTED"
      );
    }

    // Validate locale format
    if (localization.supportedLocales) {
      localization.supportedLocales.forEach((locale, index) => {
        if (!this.isValidLocale(locale)) {
          this.addError(
            `configuration.localization.supportedLocales[${index}]`,
            `Invalid locale format: ${locale}`,
            "INVALID_LOCALE_FORMAT"
          );
        }
      });
    }
  }

  private validateEnvironment(
    environment: MessageConfigurationSchema["configuration"]["environment"]
  ): void {
    const validEnvironments: Environment[] = [
      "development",
      "staging",
      "production",
    ];

    if (!validEnvironments.includes(environment.environment)) {
      this.addError(
        "configuration.environment.environment",
        `Invalid environment. Must be one of: ${validEnvironments.join(", ")}`,
        "INVALID_ENVIRONMENT"
      );
    }

    if (environment.settings) {
      const { settings } = environment;

      if (typeof settings.enableCaching !== "boolean") {
        this.addError(
          "configuration.environment.settings.enableCaching",
          "enableCaching must be a boolean",
          "INVALID_ENABLE_CACHING"
        );
      }

      if (
        typeof settings.cacheTimeout !== "number" ||
        settings.cacheTimeout < 0
      ) {
        this.addError(
          "configuration.environment.settings.cacheTimeout",
          "cacheTimeout must be a positive number",
          "INVALID_CACHE_TIMEOUT"
        );
      }

      if (
        !settings.fallbackLocale ||
        !this.isValidLocale(settings.fallbackLocale)
      ) {
        this.addError(
          "configuration.environment.settings.fallbackLocale",
          "fallbackLocale must be a valid locale",
          "INVALID_FALLBACK_LOCALE"
        );
      }
    }
  }

  private validateCategories(
    categories: MessageConfigurationSchema["configuration"]["categories"]
  ): void {
    const validCategories: MessageCategory[] = [
      "error",
      "success",
      "warning",
      "info",
      "notification",
      "system",
    ];

    Object.keys(categories).forEach(category => {
      if (!validCategories.includes(category as MessageCategory)) {
        this.addWarning(
          `configuration.categories.${category}`,
          `Unknown category: ${category}`,
          "UNKNOWN_CATEGORY"
        );
      }

      const categoryConfig = categories[category];
      const validPriorities: MessagePriority[] = [
        "low",
        "medium",
        "high",
        "critical",
      ];

      if (!validPriorities.includes(categoryConfig.defaultPriority)) {
        this.addError(
          `configuration.categories.${category}.defaultPriority`,
          `Invalid priority: ${categoryConfig.defaultPriority}`,
          "INVALID_PRIORITY"
        );
      }
    });
  }

  private validateCacheConfig(
    cache: NonNullable<MessageConfigurationSchema["configuration"]["cache"]>
  ): void {
    const validStrategies = ["memory", "redis", "database", "hybrid"];

    if (!validStrategies.includes(cache.strategy)) {
      this.addError(
        "configuration.cache.strategy",
        `Invalid cache strategy. Must be one of: ${validStrategies.join(", ")}`,
        "INVALID_CACHE_STRATEGY"
      );
    }

    if (cache.ttl < 0) {
      this.addError(
        "configuration.cache.ttl",
        "TTL must be a positive number",
        "INVALID_TTL"
      );
    }

    if (cache.maxSize < 1) {
      this.addError(
        "configuration.cache.maxSize",
        "Max size must be at least 1",
        "INVALID_MAX_SIZE"
      );
    }
  }

  private validateTemplates(templates: MessageTemplate[]): void {
    if (!templates || templates.length === 0) {
      this.addWarning("templates", "No templates defined", "NO_TEMPLATES");
      return;
    }

    const templateIds = new Set<string>();
    const templateKeys = new Set<string>();

    templates.forEach((template, index) => {
      this.validateSingleTemplate(template, index);

      // Check for duplicate IDs
      if (templateIds.has(template.id)) {
        this.addError(
          `templates[${index}].id`,
          `Duplicate template ID: ${template.id}`,
          "DUPLICATE_ID"
        );
      } else {
        templateIds.add(template.id);
      }

      // Check for duplicate keys
      if (templateKeys.has(template.key)) {
        this.addError(
          `templates[${index}].key`,
          `Duplicate template key: ${template.key}`,
          "DUPLICATE_KEY"
        );
      } else {
        templateKeys.add(template.key);
      }
    });
  }

  private validateSingleTemplate(
    template: MessageTemplate,
    index: number
  ): void {
    const basePath = `templates[${index}]`;

    // Required fields
    if (!template.id) {
      this.addError(`${basePath}.id`, "Template ID is required", "MISSING_ID");
    }

    if (!template.key) {
      this.addError(
        `${basePath}.key`,
        "Template key is required",
        "MISSING_KEY"
      );
    }

    if (!template.category) {
      this.addError(
        `${basePath}.category`,
        "Template category is required",
        "MISSING_CATEGORY"
      );
    }

    if (!template.content || Object.keys(template.content).length === 0) {
      this.addError(
        `${basePath}.content`,
        "Template content is required",
        "MISSING_CONTENT"
      );
    }

    // Validate category
    const validCategories: MessageCategory[] = [
      "error",
      "success",
      "warning",
      "info",
      "notification",
      "system",
    ];
    if (template.category && !validCategories.includes(template.category)) {
      this.addError(
        `${basePath}.category`,
        `Invalid category: ${template.category}`,
        "INVALID_CATEGORY"
      );
    }

    // Validate priority
    const validPriorities: MessagePriority[] = [
      "low",
      "medium",
      "high",
      "critical",
    ];
    if (template.priority && !validPriorities.includes(template.priority)) {
      this.addError(
        `${basePath}.priority`,
        `Invalid priority: ${template.priority}`,
        "INVALID_PRIORITY"
      );
    }

    // Validate content
    if (template.content) {
      Object.keys(template.content).forEach(locale => {
        if (!this.isValidLocale(locale)) {
          this.addError(
            `${basePath}.content.${locale}`,
            `Invalid locale format: ${locale}`,
            "INVALID_LOCALE_FORMAT"
          );
        }

        const content = template.content[locale];
        if (!content.message) {
          this.addError(
            `${basePath}.content.${locale}.message`,
            "Message is required for each locale",
            "MISSING_MESSAGE"
          );
        }
      });
    }

    // Validate variables
    if (template.variables) {
      Object.keys(template.variables).forEach(varName => {
        const variable = template.variables![varName];
        const validTypes = [
          "string",
          "number",
          "date",
          "boolean",
          "array",
          "object",
        ];

        if (!validTypes.includes(variable.type)) {
          this.addError(
            `${basePath}.variables.${varName}.type`,
            `Invalid variable type: ${variable.type}`,
            "INVALID_VARIABLE_TYPE"
          );
        }

        if (typeof variable.required !== "boolean") {
          this.addError(
            `${basePath}.variables.${varName}.required`,
            "Variable required field must be boolean",
            "INVALID_REQUIRED_FIELD"
          );
        }
      });
    }

    // Validate display configuration
    if (template.display) {
      this.validateDisplayConfig(template.display, `${basePath}.display`);
    }

    // Validate metadata
    if (template.metadata) {
      this.validateTemplateMetadata(template.metadata, `${basePath}.metadata`);
    }
  }

  private validateDisplayConfig(
    display: NonNullable<MessageTemplate["display"]>,
    path: string
  ): void {
    const validTypes: DisplayType[] = [
      "toast",
      "modal",
      "banner",
      "inline",
      "notification",
    ];

    if (!validTypes.includes(display.type)) {
      this.addError(
        `${path}.type`,
        `Invalid display type: ${display.type}`,
        "INVALID_DISPLAY_TYPE"
      );
    }

    if (display.duration !== undefined && display.duration < 0) {
      this.addError(
        `${path}.duration`,
        "Duration must be non-negative",
        "INVALID_DURATION"
      );
    }

    if (display.position) {
      const validPositions = [
        "top",
        "bottom",
        "center",
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
      ];
      if (!validPositions.includes(display.position)) {
        this.addError(
          `${path}.position`,
          `Invalid position: ${display.position}`,
          "INVALID_POSITION"
        );
      }
    }
  }

  private validateTemplateMetadata(
    metadata: MessageTemplate["metadata"],
    path: string
  ): void {
    if (!metadata.created) {
      this.addError(
        `${path}.created`,
        "Created timestamp is required",
        "MISSING_CREATED"
      );
    }

    if (!metadata.updated) {
      this.addError(
        `${path}.updated`,
        "Updated timestamp is required",
        "MISSING_UPDATED"
      );
    }

    if (!metadata.createdBy) {
      this.addError(
        `${path}.createdBy`,
        "CreatedBy is required",
        "MISSING_CREATED_BY"
      );
    }

    if (!metadata.updatedBy) {
      this.addError(
        `${path}.updatedBy`,
        "UpdatedBy is required",
        "MISSING_UPDATED_BY"
      );
    }

    if (metadata.created && !this.isValidISO8601(metadata.created)) {
      this.addError(
        `${path}.created`,
        "Created timestamp must be valid ISO 8601 format",
        "INVALID_CREATED_FORMAT"
      );
    }

    if (metadata.updated && !this.isValidISO8601(metadata.updated)) {
      this.addError(
        `${path}.updated`,
        "Updated timestamp must be valid ISO 8601 format",
        "INVALID_UPDATED_FORMAT"
      );
    }

    const validStatuses = ["draft", "active", "deprecated", "archived"];
    if (metadata.status && !validStatuses.includes(metadata.status)) {
      this.addError(
        `${path}.status`,
        `Invalid status: ${metadata.status}`,
        "INVALID_STATUS"
      );
    }
  }

  private validateTemplateReferences(config: MessageConfigurationSchema): void {
    const templateIds = new Set(config.templates.map(t => t.id));

    // Check inheritance references
    if (config.inheritance) {
      Object.keys(config.inheritance).forEach(templateId => {
        if (!templateIds.has(templateId)) {
          this.addError(
            `inheritance.${templateId}`,
            `Template ID not found: ${templateId}`,
            "TEMPLATE_NOT_FOUND"
          );
        }

        const inheritance = config.inheritance![templateId];
        if (!templateIds.has(inheritance.extends)) {
          this.addError(
            `inheritance.${templateId}.extends`,
            `Extended template not found: ${inheritance.extends}`,
            "EXTENDED_TEMPLATE_NOT_FOUND"
          );
        }
      });
    }

    // Check experiment references
    if (config.experiments) {
      Object.keys(config.experiments).forEach(experimentId => {
        const experiment = config.experiments![experimentId];
        Object.keys(experiment.variants).forEach(variantId => {
          const variant = experiment.variants[variantId];
          if (!templateIds.has(variant.templateId)) {
            this.addError(
              `experiments.${experimentId}.variants.${variantId}.templateId`,
              `Template ID not found: ${variant.templateId}`,
              "TEMPLATE_NOT_FOUND"
            );
          }
        });
      });
    }
  }

  private validateInheritance(
    inheritance: NonNullable<MessageConfigurationSchema["inheritance"]>,
    templates: MessageTemplate[]
  ): void {
    // Check for circular inheritance
    const inheritanceGraph = new Map<string, string>();
    Object.keys(inheritance).forEach(templateId => {
      inheritanceGraph.set(templateId, inheritance[templateId].extends);
    });

    // Detect cycles using DFS
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (node: string): boolean => {
      if (recursionStack.has(node)) return true;
      if (visited.has(node)) return false;

      visited.add(node);
      recursionStack.add(node);

      const parent = inheritanceGraph.get(node);
      if (parent && hasCycle(parent)) return true;

      recursionStack.delete(node);
      return false;
    };

    Object.keys(inheritance).forEach(templateId => {
      if (hasCycle(templateId)) {
        this.addError(
          `inheritance.${templateId}`,
          "Circular inheritance detected",
          "CIRCULAR_INHERITANCE"
        );
      }
    });
  }

  private validateExperiments(
    experiments: NonNullable<MessageConfigurationSchema["experiments"]>,
    templates: MessageTemplate[]
  ): void {
    Object.keys(experiments).forEach(experimentId => {
      const experiment = experiments[experimentId];

      // Validate experiment structure
      if (!experiment.name) {
        this.addError(
          `experiments.${experimentId}.name`,
          "Experiment name is required",
          "MISSING_EXPERIMENT_NAME"
        );
      }

      if (
        !experiment.variants ||
        Object.keys(experiment.variants).length === 0
      ) {
        this.addError(
          `experiments.${experimentId}.variants`,
          "At least one variant is required",
          "MISSING_VARIANTS"
        );
      }

      // Validate variant weights sum to 1
      if (experiment.variants) {
        const totalWeight = Object.values(experiment.variants).reduce(
          (sum, variant) => sum + variant.weight,
          0
        );
        if (Math.abs(totalWeight - 1) > 0.001) {
          this.addError(
            `experiments.${experimentId}.variants`,
            "Variant weights must sum to 1.0",
            "INVALID_VARIANT_WEIGHTS"
          );
        }
      }

      // Validate dates
      if (experiment.startDate && !this.isValidISO8601(experiment.startDate)) {
        this.addError(
          `experiments.${experimentId}.startDate`,
          "Start date must be valid ISO 8601 format",
          "INVALID_START_DATE"
        );
      }

      if (experiment.endDate && !this.isValidISO8601(experiment.endDate)) {
        this.addError(
          `experiments.${experimentId}.endDate`,
          "End date must be valid ISO 8601 format",
          "INVALID_END_DATE"
        );
      }

      if (
        experiment.startDate &&
        experiment.endDate &&
        experiment.startDate >= experiment.endDate
      ) {
        this.addError(
          `experiments.${experimentId}`,
          "End date must be after start date",
          "INVALID_DATE_RANGE"
        );
      }
    });
  }

  private validateAnalytics(
    analytics: NonNullable<MessageConfigurationSchema["analytics"]>
  ): void {
    if (typeof analytics.enabled !== "boolean") {
      this.addError(
        "analytics.enabled",
        "Analytics enabled must be boolean",
        "INVALID_ANALYTICS_ENABLED"
      );
    }

    if (analytics.events) {
      Object.keys(analytics.events).forEach(eventName => {
        if (
          typeof analytics.events[
            eventName as keyof typeof analytics.events
          ] !== "boolean"
        ) {
          this.addError(
            `analytics.events.${eventName}`,
            `Event ${eventName} must be boolean`,
            "INVALID_EVENT_CONFIG"
          );
        }
      });
    }
  }

  // Utility methods
  private isValidVersion(version: string): boolean {
    const semverRegex =
      /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
    return semverRegex.test(version);
  }

  private isValidLocale(locale: string): boolean {
    const localeRegex = /^[a-z]{2,3}(?:-[A-Z]{2})?$/;
    return localeRegex.test(locale);
  }

  private isValidISO8601(dateString: string): boolean {
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?$/;
    return iso8601Regex.test(dateString) && !isNaN(Date.parse(dateString));
  }

  private addError(path: string, message: string, code: string): void {
    this.errors.push({
      path,
      message,
      code,
      severity: "error",
    });
  }

  private addWarning(
    path: string,
    message: string,
    code: string,
    suggestion?: string
  ): void {
    this.warnings.push({
      path,
      message,
      code,
      severity: "warning",
      suggestion,
    });
  }
}

// Factory function for easy validation
export function validateMessageConfiguration(
  config: MessageConfigurationSchema
): ValidationResult {
  const validator = new MessageConfigurationValidator();
  return validator.validate(config);
}

// Utility function to validate a single template
export function validateMessageTemplate(
  template: MessageTemplate
): ValidationResult {
  const validator = new MessageConfigurationValidator();
  return validator.validateTemplate(template);
}

// Export the validator class as default
export default MessageConfigurationValidator;
