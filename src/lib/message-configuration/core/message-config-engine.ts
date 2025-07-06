/**
 * Message Configuration Engine
 *
 * Core engine for managing message configurations with support for:
 * - Multi-language localization
 * - Dynamic variable interpolation
 * - Context-aware message retrieval
 * - Performance-optimized caching
 * - Real-time configuration updates
 */

import {
  MessageConfigurationSchema,
  MessageTemplate,
  MessageInstance,
  MessageCategory,
} from "../schemas/message-config-schema";
import { validateMessageConfiguration } from "../validators/schema-validator";

// Context for message retrieval
export interface MessageContext {
  userRole?: string;
  pageRoute?: string;
  deviceType?: "desktop" | "tablet" | "mobile";
  userAgent?: string;
  locale?: string;
  systemState?: Record<string, any>;
  featureFlags?: Record<string, boolean>;
  userPreferences?: Record<string, any>;
  sessionData?: Record<string, any>;
}

// Variables for dynamic content
export interface MessageVariables {
  [key: string]: string | number | Date | boolean | any[];
}

// Engine configuration
export interface EngineConfig {
  enableCaching: boolean;
  cacheTimeout: number; // milliseconds
  fallbackLocale: string;
  debugMode: boolean;
  validateOnLoad: boolean;
  maxCacheSize: number;
}

// Engine statistics
export interface EngineStats {
  messagesLoaded: number;
  cacheHits: number;
  cacheMisses: number;
  retrievalCount: number;
  averageRetrievalTime: number;
  errorCount: number;
  lastUpdate: string;
}

// Cache entry
interface CacheEntry {
  content: MessageInstance;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

// Default engine configuration
const DEFAULT_CONFIG: EngineConfig = {
  enableCaching: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  fallbackLocale: "en-US",
  debugMode: false,
  validateOnLoad: true,
  maxCacheSize: 1000,
};

export class MessageConfigurationEngine {
  private config: EngineConfig;
  private messageConfig: MessageConfigurationSchema | null = null;
  private messageCache = new Map<string, CacheEntry>();
  private variableCache = new Map<string, any>();
  private contextCache = new Map<string, MessageContext>();
  private stats: EngineStats;
  private isInitialized = false;

  constructor(config: Partial<EngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.stats = {
      messagesLoaded: 0,
      cacheHits: 0,
      cacheMisses: 0,
      retrievalCount: 0,
      averageRetrievalTime: 0,
      errorCount: 0,
      lastUpdate: new Date().toISOString(),
    };

    // Set up cache cleanup interval
    if (this.config.enableCaching) {
      setInterval(() => this.cleanupCache(), 60000); // Clean every minute
    }
  }

  /**
   * Initialize the engine with a message configuration
   */
  public async initialize(config: MessageConfigurationSchema): Promise<void> {
    try {
      if (this.config.validateOnLoad) {
        const validation = validateMessageConfiguration(config);
        if (!validation.isValid) {
          throw new Error(
            `Configuration validation failed: ${validation.errors.map(e => e.message).join(", ")}`
          );
        }
      }

      this.messageConfig = config;
      this.stats.messagesLoaded = config.templates.length;
      this.stats.lastUpdate = new Date().toISOString();
      this.isInitialized = true;

      if (this.config.debugMode) {
        console.log(
          "MessageConfigurationEngine initialized with",
          config.templates.length,
          "templates"
        );
      }
    } catch (error) {
      this.stats.errorCount++;
      throw new Error(`Failed to initialize message engine: ${error}`);
    }
  }

  /**
   * Get a message by key with context and variables
   */
  public async getMessage(
    key: string,
    context: MessageContext = {},
    variables: MessageVariables = {}
  ): Promise<MessageInstance | null> {
    const startTime = performance.now();

    try {
      if (!this.isInitialized || !this.messageConfig) {
        throw new Error("Engine not initialized. Call initialize() first.");
      }

      // Generate cache key
      const cacheKey = this.generateCacheKey(key, context, variables);

      // Check cache first
      if (this.config.enableCaching) {
        const cached = this.getCachedMessage(cacheKey);
        if (cached) {
          this.stats.cacheHits++;
          this.updateStats(startTime);
          return cached;
        }
      }

      // Find template
      const template = this.findTemplate(key);
      if (!template) {
        this.stats.cacheMisses++;
        this.updateStats(startTime);
        return null;
      }

      // Check context match
      if (!this.isContextMatch(template, context)) {
        this.stats.cacheMisses++;
        this.updateStats(startTime);
        return null;
      }

      // Resolve locale
      const locale = this.resolveLocale(template, context.locale);

      // Get content for locale
      const localeContent = template.content[locale];
      if (!localeContent) {
        // Try fallback locale
        const fallbackContent = template.content[this.config.fallbackLocale];
        if (!fallbackContent) {
          this.stats.cacheMisses++;
          this.updateStats(startTime);
          return null;
        }
      }

      // Create message instance
      const messageInstance = await this.createMessageInstance(
        template,
        locale,
        context,
        variables
      );

      // Cache the result
      if (this.config.enableCaching) {
        this.cacheMessage(cacheKey, messageInstance);
      }

      this.stats.cacheMisses++;
      this.updateStats(startTime);
      return messageInstance;
    } catch (error) {
      this.stats.errorCount++;
      this.updateStats(startTime);

      if (this.config.debugMode) {
        console.error("Error retrieving message:", error);
      }

      throw error;
    }
  }

  /**
   * Get multiple messages by category
   */
  public async getMessagesByCategory(
    category: MessageCategory,
    context: MessageContext = {},
    variables: MessageVariables = {}
  ): Promise<MessageInstance[]> {
    if (!this.isInitialized || !this.messageConfig) {
      throw new Error("Engine not initialized");
    }

    const templates = this.messageConfig.templates.filter(
      t => t.category === category
    );
    const messages: MessageInstance[] = [];

    for (const template of templates) {
      if (this.isContextMatch(template, context)) {
        const locale = this.resolveLocale(template, context.locale);
        const messageInstance = await this.createMessageInstance(
          template,
          locale,
          context,
          variables
        );
        messages.push(messageInstance);
      }
    }

    return messages;
  }

  /**
   * Update configuration with hot reload support
   */
  public async updateConfiguration(
    config: MessageConfigurationSchema
  ): Promise<void> {
    await this.initialize(config);
    this.clearCache();
  }

  /**
   * Get engine statistics
   */
  public getStats(): EngineStats {
    return { ...this.stats };
  }

  /**
   * Clear all caches
   */
  public clearCache(): void {
    this.messageCache.clear();
    this.variableCache.clear();
    this.contextCache.clear();
  }

  /**
   * Get cache information
   */
  public getCacheInfo() {
    return {
      messageCache: {
        size: this.messageCache.size,
        maxSize: this.config.maxCacheSize,
        hitRate:
          this.stats.cacheHits /
            (this.stats.cacheHits + this.stats.cacheMisses) || 0,
      },
      variableCache: {
        size: this.variableCache.size,
      },
      contextCache: {
        size: this.contextCache.size,
      },
    };
  }

  // Private methods

  private findTemplate(key: string): MessageTemplate | undefined {
    return this.messageConfig?.templates.find(
      t => t.key === key || t.id === key
    );
  }

  private isContextMatch(
    template: MessageTemplate,
    context: MessageContext
  ): boolean {
    if (!template.context) return true;

    // Check user roles
    if (template.context.userRoles && context.userRole) {
      if (!template.context.userRoles.includes(context.userRole)) {
        return false;
      }
    }

    // Check page routes
    if (template.context.pageRoutes && context.pageRoute) {
      if (
        !template.context.pageRoutes.some(
          route =>
            context.pageRoute === route || context.pageRoute?.startsWith(route)
        )
      ) {
        return false;
      }
    }

    // Check device types
    if (template.context.deviceTypes && context.deviceType) {
      if (!template.context.deviceTypes.includes(context.deviceType)) {
        return false;
      }
    }

    // Check time conditions
    if (template.context.timeConditions) {
      const now = new Date();
      const timeConditions = template.context.timeConditions;

      if (timeConditions.daysOfWeek) {
        const dayOfWeek = now.getDay();
        if (!timeConditions.daysOfWeek.includes(dayOfWeek)) {
          return false;
        }
      }

      if (timeConditions.startTime && timeConditions.endTime) {
        const currentTime = now.toTimeString().slice(0, 5);
        if (
          currentTime < timeConditions.startTime ||
          currentTime > timeConditions.endTime
        ) {
          return false;
        }
      }
    }

    // Check system states
    if (template.context.systemStates && context.systemState) {
      for (const [key, value] of Object.entries(
        template.context.systemStates
      )) {
        if (context.systemState[key] !== value) {
          return false;
        }
      }
    }

    return true;
  }

  private resolveLocale(
    template: MessageTemplate,
    requestedLocale?: string
  ): string {
    const availableLocales = Object.keys(template.content);

    // Try requested locale first
    if (requestedLocale && availableLocales.includes(requestedLocale)) {
      return requestedLocale;
    }

    // Try fallback locale
    if (availableLocales.includes(this.config.fallbackLocale)) {
      return this.config.fallbackLocale;
    }

    // Return first available locale
    return availableLocales[0];
  }

  private async createMessageInstance(
    template: MessageTemplate,
    locale: string,
    context: MessageContext,
    variables: MessageVariables
  ): Promise<MessageInstance> {
    const content = template.content[locale];
    const startTime = performance.now();

    // Interpolate variables in content
    const resolvedContent = {
      title: content.title
        ? this.interpolateVariables(content.title, variables)
        : undefined,
      message: this.interpolateVariables(content.message, variables),
      description: content.description
        ? this.interpolateVariables(content.description, variables)
        : undefined,
      actionLabel: content.actionLabel
        ? this.interpolateVariables(content.actionLabel, variables)
        : undefined,
    };

    // Create display configuration with defaults
    const display = {
      type: template.display?.type || "toast",
      duration: template.display?.duration ?? 3000,
      dismissible: template.display?.dismissible ?? true,
      position: template.display?.position || "top-right",
      style: template.display?.style || {},
    } as Required<NonNullable<MessageTemplate["display"]>>;

    return {
      templateId: template.id,
      resolvedContent,
      context: {
        locale,
        variables,
        userContext: context,
        timestamp: new Date().toISOString(),
      },
      display,
      metadata: {
        renderTime: performance.now() - startTime,
        cacheHit: false,
        experimentVariant: undefined,
      },
    };
  }

  private interpolateVariables(
    text: string,
    variables: MessageVariables
  ): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = variables[key];
      if (value === undefined || value === null) {
        return match; // Keep original placeholder if variable not found
      }

      // Format different types appropriately
      if (value instanceof Date) {
        return value.toLocaleDateString("en-US");
      }

      if (typeof value === "number") {
        return value.toLocaleString();
      }

      return String(value);
    });
  }

  private generateCacheKey(
    key: string,
    context: MessageContext,
    variables: MessageVariables
  ): string {
    const contextString = JSON.stringify({
      userRole: context.userRole,
      pageRoute: context.pageRoute,
      deviceType: context.deviceType,
      locale: context.locale,
    });

    const variablesString = JSON.stringify(variables);

    return `${key}:${contextString}:${variablesString}`;
  }

  private getCachedMessage(cacheKey: string): MessageInstance | null {
    const entry = this.messageCache.get(cacheKey);

    if (!entry) return null;

    // Check if cache entry is expired
    const now = Date.now();
    if (now - entry.timestamp > this.config.cacheTimeout) {
      this.messageCache.delete(cacheKey);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;

    // Return a copy with cacheHit set to true
    return {
      ...entry.content,
      metadata: {
        ...entry.content.metadata,
        cacheHit: true,
      },
    };
  }

  private cacheMessage(cacheKey: string, message: MessageInstance): void {
    // Check cache size limit
    if (this.messageCache.size >= this.config.maxCacheSize) {
      this.evictOldestCacheEntry();
    }

    const now = Date.now();
    this.messageCache.set(cacheKey, {
      content: message,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now,
    });
  }

  private evictOldestCacheEntry(): void {
    let oldestKey = "";
    let oldestTime = Date.now();

    this.messageCache.forEach((entry, key) => {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.messageCache.delete(oldestKey);
    }
  }

  private cleanupCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.messageCache.forEach((entry, key) => {
      if (now - entry.timestamp > this.config.cacheTimeout) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.messageCache.delete(key));

    if (this.config.debugMode && expiredKeys.length > 0) {
      console.log(`Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }

  private updateStats(startTime: number): void {
    this.stats.retrievalCount++;
    const retrievalTime = performance.now() - startTime;
    this.stats.averageRetrievalTime =
      (this.stats.averageRetrievalTime * (this.stats.retrievalCount - 1) +
        retrievalTime) /
      this.stats.retrievalCount;
  }
}

// Singleton instance for convenience
let defaultEngine: MessageConfigurationEngine | null = null;

/**
 * Get default engine instance
 */
export function getDefaultEngine(): MessageConfigurationEngine {
  if (!defaultEngine) {
    defaultEngine = new MessageConfigurationEngine();
  }
  return defaultEngine;
}

/**
 * Initialize default engine with configuration
 */
export async function initializeDefaultEngine(
  config: MessageConfigurationSchema
): Promise<void> {
  const engine = getDefaultEngine();
  await engine.initialize(config);
}

/**
 * Convenience function to get a message using default engine
 */
export async function getMessage(
  key: string,
  context: MessageContext = {},
  variables: MessageVariables = {}
): Promise<MessageInstance | null> {
  return getDefaultEngine().getMessage(key, context, variables);
}
