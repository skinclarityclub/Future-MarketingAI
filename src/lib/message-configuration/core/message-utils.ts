/**
 * Message Configuration Utilities
 *
 * Helper functions and utilities for working with the message configuration engine
 */

import {
  MessageConfigurationEngine,
  MessageContext,
  MessageVariables,
  getDefaultEngine,
} from "./message-config-engine";
import {
  MessageTemplate,
  MessageInstance,
  MessageCategory,
} from "../schemas/message-config-schema";

// Helper class for common message operations
export class MessageHelper {
  constructor(private engine?: MessageConfigurationEngine) {
    this.engine = engine || getDefaultEngine();
  }

  /**
   * Get a message with automatic error handling
   */
  async getMessageSafe(
    key: string,
    context: MessageContext = {},
    variables: MessageVariables = {},
    fallback?: string
  ): Promise<MessageInstance | string> {
    try {
      const message = await this.engine!.getMessage(key, context, variables);
      if (message) {
        return message;
      }
      return fallback || `Message not found: ${key}`;
    } catch (error) {
      console.error("Error getting message:", error);
      return fallback || `Error loading message: ${key}`;
    }
  }

  /**
   * Get multiple messages for a category
   */
  async getCategoryMessages(
    category: MessageCategory,
    context: MessageContext = {},
    variables: MessageVariables = {}
  ): Promise<MessageInstance[]> {
    try {
      return await this.engine!.getMessagesByCategory(
        category,
        context,
        variables
      );
    } catch (error) {
      console.error("Error getting category messages:", error);
      return [];
    }
  }

  /**
   * Get user-specific messages based on role and context
   */
  async getUserMessages(
    userRole: string,
    pageRoute: string,
    additionalContext: Partial<MessageContext> = {}
  ): Promise<MessageInstance[]> {
    const context: MessageContext = {
      userRole,
      pageRoute,
      ...additionalContext,
    };

    const categories: MessageCategory[] = ["notification", "info", "warning"];
    const allMessages: MessageInstance[] = [];

    for (const category of categories) {
      const messages = await this.getCategoryMessages(category, context);
      allMessages.push(...messages);
    }

    return allMessages;
  }

  /**
   * Check if engine is ready
   */
  isReady(): boolean {
    try {
      return this.engine!.getStats().messagesLoaded > 0;
    } catch {
      return false;
    }
  }
}

// Message builder for fluent API
export class MessageBuilder {
  private context: MessageContext = {};
  private variables: MessageVariables = {};
  private engine: MessageConfigurationEngine;

  constructor(engine?: MessageConfigurationEngine) {
    this.engine = engine || getDefaultEngine();
  }

  /**
   * Set user context
   */
  forUser(userRole: string): MessageBuilder {
    this.context.userRole = userRole;
    return this;
  }

  /**
   * Set page context
   */
  onPage(pageRoute: string): MessageBuilder {
    this.context.pageRoute = pageRoute;
    return this;
  }

  /**
   * Set device context
   */
  onDevice(deviceType: "desktop" | "tablet" | "mobile"): MessageBuilder {
    this.context.deviceType = deviceType;
    return this;
  }

  /**
   * Set locale
   */
  inLocale(locale: string): MessageBuilder {
    this.context.locale = locale;
    return this;
  }

  /**
   * Add variables
   */
  withVariables(variables: MessageVariables): MessageBuilder {
    this.variables = { ...this.variables, ...variables };
    return this;
  }

  /**
   * Add a single variable
   */
  withVariable(key: string, value: any): MessageBuilder {
    this.variables[key] = value;
    return this;
  }

  /**
   * Set system state
   */
  withSystemState(state: Record<string, any>): MessageBuilder {
    this.context.systemState = { ...this.context.systemState, ...state };
    return this;
  }

  /**
   * Build and get the message
   */
  async get(key: string): Promise<MessageInstance | null> {
    return this.engine.getMessage(key, this.context, this.variables);
  }

  /**
   * Build and get messages by category
   */
  async getByCategory(category: MessageCategory): Promise<MessageInstance[]> {
    return this.engine.getMessagesByCategory(
      category,
      this.context,
      this.variables
    );
  }

  /**
   * Reset builder state
   */
  reset(): MessageBuilder {
    this.context = {};
    this.variables = {};
    return this;
  }
}

// Time-based message helpers
export class TimeBasedMessages {
  private helper: MessageHelper;

  constructor(engine?: MessageConfigurationEngine) {
    this.helper = new MessageHelper(engine);
  }

  /**
   * Get greeting message based on time of day
   */
  async getGreeting(
    userName?: string,
    context: MessageContext = {}
  ): Promise<MessageInstance | string> {
    const hour = new Date().getHours();
    let greetingKey = "greeting.general";

    if (hour < 12) {
      greetingKey = "greeting.morning";
    } else if (hour < 17) {
      greetingKey = "greeting.afternoon";
    } else {
      greetingKey = "greeting.evening";
    }

    const variables: MessageVariables = {};
    if (userName) {
      variables.userName = userName;
    }

    return this.helper.getMessageSafe(
      greetingKey,
      context,
      variables,
      "Hello!"
    );
  }

  /**
   * Get business hours message
   */
  async getBusinessHoursMessage(
    context: MessageContext = {}
  ): Promise<MessageInstance | string> {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // Weekend (0 = Sunday, 6 = Saturday)
    if (day === 0 || day === 6) {
      return this.helper.getMessageSafe(
        "hours.weekend",
        context,
        {},
        "We are closed on weekends"
      );
    }

    // Outside business hours (9 AM - 5 PM)
    if (hour < 9 || hour >= 17) {
      return this.helper.getMessageSafe(
        "hours.closed",
        context,
        {},
        "We are currently closed"
      );
    }

    return this.helper.getMessageSafe(
      "hours.open",
      context,
      {},
      "We are open!"
    );
  }
}

// Batch message operations
export class BatchMessageOperations {
  private engine: MessageConfigurationEngine;

  constructor(engine?: MessageConfigurationEngine) {
    this.engine = engine || getDefaultEngine();
  }

  /**
   * Get multiple messages in parallel
   */
  async getMessages(
    requests: Array<{
      key: string;
      context?: MessageContext;
      variables?: MessageVariables;
    }>
  ): Promise<Array<MessageInstance | null>> {
    const promises = requests.map(req =>
      this.engine.getMessage(req.key, req.context || {}, req.variables || {})
    );

    return Promise.all(promises);
  }

  /**
   * Get all messages for multiple categories
   */
  async getMultipleCategories(
    categories: MessageCategory[],
    context: MessageContext = {},
    variables: MessageVariables = {}
  ): Promise<Record<string, MessageInstance[]>> {
    const promises = categories.map(async category => ({
      category,
      messages: await this.engine.getMessagesByCategory(
        category,
        context,
        variables
      ),
    }));

    const results = await Promise.all(promises);

    return results.reduce(
      (acc, { category, messages }) => {
        acc[category] = messages;
        return acc;
      },
      {} as Record<string, MessageInstance[]>
    );
  }
}

// Domain-specific message helpers
export class AuthMessages {
  private helper: MessageHelper;

  constructor(engine?: MessageConfigurationEngine) {
    this.helper = new MessageHelper(engine);
  }

  async getLoginSuccess(userName: string): Promise<MessageInstance | string> {
    return this.helper.getMessageSafe(
      "auth.login.success",
      { pageRoute: "/login" },
      { userName },
      `Welcome back, ${userName}!`
    );
  }

  async getLoginError(errorCode?: string): Promise<MessageInstance | string> {
    return this.helper.getMessageSafe(
      "auth.login.error",
      { pageRoute: "/login" },
      { errorCode: errorCode || "UNKNOWN" },
      "Login failed. Please try again."
    );
  }

  async getLogoutMessage(): Promise<MessageInstance | string> {
    return this.helper.getMessageSafe(
      "auth.logout.success",
      {},
      {},
      "You have been logged out successfully."
    );
  }
}

export class DashboardMessages {
  private helper: MessageHelper;

  constructor(engine?: MessageConfigurationEngine) {
    this.helper = new MessageHelper(engine);
  }

  async getWelcomeMessage(
    userName: string,
    lastLogin?: Date
  ): Promise<MessageInstance | string> {
    const variables: MessageVariables = { userName };
    if (lastLogin) {
      variables.lastLogin = lastLogin;
    }

    return this.helper.getMessageSafe(
      "dashboard.welcome",
      { pageRoute: "/dashboard" },
      variables,
      `Welcome to your dashboard, ${userName}!`
    );
  }

  async getDataLoadingError(retryCount = 0): Promise<MessageInstance | string> {
    return this.helper.getMessageSafe(
      "dashboard.error.data_loading",
      { pageRoute: "/dashboard" },
      { retryCount },
      "Unable to load data. Please try again."
    );
  }

  async getReportGenerated(
    reportType: string,
    startDate: Date,
    endDate: Date
  ): Promise<MessageInstance | string> {
    return this.helper.getMessageSafe(
      "reports.success.generated",
      { pageRoute: "/reports" },
      { reportType, startDate, endDate },
      `Your ${reportType} report has been generated.`
    );
  }
}

export class AIMessages {
  private helper: MessageHelper;

  constructor(engine?: MessageConfigurationEngine) {
    this.helper = new MessageHelper(engine);
  }

  async getAIResponse(
    responseType: "helpful" | "error" | "clarification",
    context: MessageContext = {}
  ): Promise<MessageInstance | string> {
    const key = `ai.response.${responseType}`;
    return this.helper.getMessageSafe(
      key,
      context,
      {},
      "AI response not available"
    );
  }

  async getAIUnavailable(): Promise<MessageInstance | string> {
    return this.helper.getMessageSafe(
      "ai.unavailable",
      {},
      {},
      "AI assistant is temporarily unavailable."
    );
  }
}

// Convenience factory functions
export function createMessageHelper(
  engine?: MessageConfigurationEngine
): MessageHelper {
  return new MessageHelper(engine);
}

export function createMessageBuilder(
  engine?: MessageConfigurationEngine
): MessageBuilder {
  return new MessageBuilder(engine);
}

export function createTimeBasedMessages(
  engine?: MessageConfigurationEngine
): TimeBasedMessages {
  return new TimeBasedMessages(engine);
}

export function createBatchOperations(
  engine?: MessageConfigurationEngine
): BatchMessageOperations {
  return new BatchMessageOperations(engine);
}

export function createAuthMessages(
  engine?: MessageConfigurationEngine
): AuthMessages {
  return new AuthMessages(engine);
}

export function createDashboardMessages(
  engine?: MessageConfigurationEngine
): DashboardMessages {
  return new DashboardMessages(engine);
}

export function createAIMessages(
  engine?: MessageConfigurationEngine
): AIMessages {
  return new AIMessages(engine);
}

// Quick access functions using default engine
export async function getMessageQuick(
  key: string,
  context: MessageContext = {},
  variables: MessageVariables = {}
): Promise<MessageInstance | null> {
  return getDefaultEngine().getMessage(key, context, variables);
}

export async function getMessageSafeQuick(
  key: string,
  context: MessageContext = {},
  variables: MessageVariables = {},
  fallback = "Message not available"
): Promise<MessageInstance | string> {
  const helper = new MessageHelper();
  return helper.getMessageSafe(key, context, variables, fallback);
}

export async function getCategoryMessagesQuick(
  category: MessageCategory,
  context: MessageContext = {},
  variables: MessageVariables = {}
): Promise<MessageInstance[]> {
  return getDefaultEngine().getMessagesByCategory(category, context, variables);
}
