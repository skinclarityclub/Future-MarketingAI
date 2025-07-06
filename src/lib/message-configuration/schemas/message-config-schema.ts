/**
 * Message Configuration Schema
 *
 * Comprehensive TypeScript interfaces for managing system messages
 * with support for localization, dynamic content, and contextual adaptation.
 */

// Core message template interface
export interface MessageTemplate {
  id: string;
  key: string;
  category:
    | "error"
    | "success"
    | "warning"
    | "info"
    | "notification"
    | "system";
  priority: "low" | "medium" | "high" | "critical";

  // Content and localization
  content: {
    [locale: string]: {
      title?: string;
      message: string;
      description?: string;
      actionLabel?: string;
    };
  };

  // Dynamic content variables
  variables?: {
    [key: string]: {
      type: "string" | "number" | "date" | "boolean" | "array" | "object";
      required: boolean;
      default?: any;
      description?: string;
      validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        enum?: any[];
      };
    };
  };

  // Context-based triggers
  context?: {
    userRoles?: string[];
    pageRoutes?: string[];
    deviceTypes?: ("desktop" | "tablet" | "mobile")[];
    timeConditions?: {
      startTime?: string;
      endTime?: string;
      timezone?: string;
      daysOfWeek?: number[];
    };
    systemStates?: {
      [key: string]: any;
    };
  };

  // Display configuration
  display?: {
    type: "toast" | "modal" | "banner" | "inline" | "notification";
    duration?: number;
    dismissible?: boolean;
    position?:
      | "top"
      | "bottom"
      | "center"
      | "top-left"
      | "top-right"
      | "bottom-left"
      | "bottom-right";
    style?: {
      theme?: "light" | "dark" | "auto";
      color?: string;
      icon?: string;
      animation?: string;
    };
  };

  // Versioning and metadata
  version: string;
  metadata: {
    created: string;
    updated: string;
    createdBy: string;
    updatedBy: string;
    description?: string;
    tags?: string[];
    status: "draft" | "active" | "deprecated" | "archived";
  };
}

// Message configuration for different environments
export interface EnvironmentConfig {
  environment: "development" | "staging" | "production";
  settings: {
    enableCaching: boolean;
    cacheTimeout: number;
    fallbackLocale: string;
    debugMode: boolean;
    logLevel: "error" | "warn" | "info" | "debug";
  };
}

// Localization configuration
export interface LocalizationConfig {
  defaultLocale: string;
  supportedLocales: string[];
  fallbackStrategy: "default" | "key" | "empty";
  rtlLocales?: string[];
  dateFormats?: {
    [locale: string]: {
      short: string;
      medium: string;
      long: string;
    };
  };
  numberFormats?: {
    [locale: string]: {
      currency?: string;
      decimal?: number;
      thousand?: string;
    };
  };
}

// Template category configuration
export interface CategoryConfig {
  [category: string]: {
    defaultPriority: "low" | "medium" | "high" | "critical";
    allowedRoles?: string[];
    maxRetention?: number; // days
    auditRequired?: boolean;
    approvalRequired?: boolean;
  };
}

// Performance and caching configuration
export interface CacheConfig {
  enabled: boolean;
  strategy: "memory" | "redis" | "database" | "hybrid";
  ttl: number; // Time to live in seconds
  maxSize: number; // Maximum cache size
  preloadStrategies?: {
    commonMessages?: boolean;
    userSpecificMessages?: boolean;
    contextualMessages?: boolean;
  };
  invalidationRules?: {
    onTemplateUpdate?: boolean;
    onUserRoleChange?: boolean;
    onContextChange?: boolean;
  };
}

// Complete message configuration schema
export interface MessageConfigurationSchema {
  version: string;
  schemaVersion: string;

  // Core configuration
  configuration: {
    localization: LocalizationConfig;
    environment: EnvironmentConfig;
    categories: CategoryConfig;
    cache?: CacheConfig;
  };

  // Message templates
  templates: MessageTemplate[];

  // Template inheritance and overrides
  inheritance?: {
    [templateId: string]: {
      extends: string;
      overrides?: Partial<MessageTemplate>;
    };
  };

  // A/B testing configuration
  experiments?: {
    [experimentId: string]: {
      name: string;
      description: string;
      variants: {
        [variantId: string]: {
          templateId: string;
          weight: number;
        };
      };
      targeting?: {
        userSegments?: string[];
        regions?: string[];
        percentage?: number;
      };
      metrics?: string[];
      startDate: string;
      endDate: string;
    };
  };

  // Analytics and tracking
  analytics?: {
    enabled: boolean;
    events: {
      messageShown?: boolean;
      messageClicked?: boolean;
      messageDismissed?: boolean;
      actionTaken?: boolean;
    };
    customEvents?: {
      [eventName: string]: {
        description: string;
        parameters?: string[];
      };
    };
  };

  // Metadata
  metadata: {
    name: string;
    description: string;
    created: string;
    updated: string;
    author: string;
    lastModifiedBy: string;
    tags?: string[];
  };
}

// Helper types for type safety
export type MessageCategory = MessageTemplate["category"];
export type MessagePriority = MessageTemplate["priority"];
export type DisplayType = NonNullable<MessageTemplate["display"]>["type"];
export type MessageStatus = MessageTemplate["metadata"]["status"];
export type Environment = EnvironmentConfig["environment"];

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  message: string;
  code: string;
  severity: "error" | "warning";
}

export interface ValidationWarning extends ValidationError {
  suggestion?: string;
}

// Runtime message instance
export interface MessageInstance {
  templateId: string;
  resolvedContent: {
    title?: string;
    message: string;
    description?: string;
    actionLabel?: string;
  };
  context: {
    locale: string;
    variables: Record<string, any>;
    userContext: Record<string, any>;
    timestamp: string;
  };
  display: Required<NonNullable<MessageTemplate["display"]>>;
  metadata: {
    renderTime: number;
    cacheHit: boolean;
    experimentVariant?: string;
  };
}

// Export type utilities
export type MessageTemplateKey = MessageTemplate["key"];
export type SupportedLocale = string;
export type VariableType = NonNullable<
  MessageTemplate["variables"]
>[string]["type"];

// Template builder helper type
export interface MessageTemplateBuilder {
  id: (id: string) => MessageTemplateBuilder;
  key: (key: string) => MessageTemplateBuilder;
  category: (category: MessageCategory) => MessageTemplateBuilder;
  priority: (priority: MessagePriority) => MessageTemplateBuilder;
  content: (
    locale: string,
    content: MessageTemplate["content"][string]
  ) => MessageTemplateBuilder;
  variable: (
    name: string,
    config: NonNullable<MessageTemplate["variables"]>[string]
  ) => MessageTemplateBuilder;
  context: (context: MessageTemplate["context"]) => MessageTemplateBuilder;
  display: (display: MessageTemplate["display"]) => MessageTemplateBuilder;
  build: () => MessageTemplate;
}
