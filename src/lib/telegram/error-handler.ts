import { TelegramApiClient } from "./api-client";
import { TelegramUserProfile } from "./auth-service";

export enum ErrorType {
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  VALIDATION = "validation",
  RATE_LIMIT = "rate_limit",
  NETWORK = "network",
  DATABASE = "database",
  AI_SERVICE = "ai_service",
  TELEGRAM_API = "telegram_api",
  INTERNAL = "internal",
  USER_INPUT = "user_input",
  TIMEOUT = "timeout",
  WEBHOOK = "webhook",
}

export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export interface ErrorContext {
  userId?: string;
  chatId?: number;
  messageId?: number;
  command?: string;
  resource?: string;
  action?: string;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
  sessionId?: string;
  requestId?: string;
}

export interface ErrorDetails {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  originalError?: Error;
  context: ErrorContext;
  stack?: string;
  recovery?: RecoveryStrategy;
  userMessage?: string;
  technicalInfo?: any;
}

export interface RecoveryStrategy {
  canRecover: boolean;
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  fallbackAction?: string;
  userAction?: string;
}

export interface ErrorResponse {
  handled: boolean;
  userMessage: string;
  actionButtons?: Array<{
    text: string;
    callbackData: string;
  }>;
  shouldRetry?: boolean;
  retryAfter?: number;
}

export class TelegramErrorHandler {
  private apiClient: TelegramApiClient;
  private errorCount: Map<string, number> = new Map();
  private lastErrorTime: Map<string, Date> = new Map();

  constructor(apiClient: TelegramApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Handle error with comprehensive error processing
   */
  async handleError(error: any, context: ErrorContext): Promise<ErrorResponse> {
    const errorDetails = this.analyzeError(error, context);

    // Log error for monitoring
    await this.logError(errorDetails);

    // Check if error is recoverable
    const recovery = this.determineRecoveryStrategy(errorDetails);
    errorDetails.recovery = recovery;

    // Generate user-friendly response
    const response = await this.generateUserResponse(errorDetails);

    // Handle critical errors
    if (errorDetails.severity === ErrorSeverity.CRITICAL) {
      await this.handleCriticalError(errorDetails);
    }

    // Update error statistics
    this.updateErrorStats(errorDetails);

    return response;
  }

  /**
   * Handle specific error types with specialized logic
   */
  async handleAuthenticationError(
    error: any,
    context: ErrorContext
  ): Promise<ErrorResponse> {
    const errorDetails: ErrorDetails = {
      type: ErrorType.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      message: "Authentication failed",
      originalError: error,
      context,
      userMessage:
        "🔐 **Authentication Required**\n\nPlease log in to access this feature.\n\nUse /start to begin the authentication process.",
    };

    if (context.chatId) {
      // Clear any existing session
      await this.clearUserSession(context.userId);

      return {
        handled: true,
        userMessage: errorDetails.userMessage,
        actionButtons: [
          {
            text: "🔑 Login",
            callbackData: "auth_login",
          },
          {
            text: "❓ Help",
            callbackData: "auth_help",
          },
        ],
      };
    }

    return {
      handled: true,
      userMessage: errorDetails.userMessage,
    };
  }

  /**
   * Handle authorization errors with detailed feedback
   */
  async handleAuthorizationError(
    error: any,
    context: ErrorContext
  ): Promise<ErrorResponse> {
    const errorDetails: ErrorDetails = {
      type: ErrorType.AUTHORIZATION,
      severity: ErrorSeverity.MEDIUM,
      message: "Access denied",
      originalError: error,
      context,
    };

    let userMessage = "🚫 **Access Denied**\n\n";

    if (error.details?.reason) {
      userMessage += `**Reason:** ${error.details.reason}\n\n`;
    }

    if (error.details?.requiredRole) {
      userMessage += `**Required Role:** ${error.details.requiredRole}\n`;
    }

    if (error.details?.requiredPermission) {
      userMessage += `**Required Permission:** ${error.details.requiredPermission}\n`;
    }

    userMessage +=
      "\n💡 Contact your administrator if you need additional access.";

    return {
      handled: true,
      userMessage,
      actionButtons: [
        {
          text: "📋 My Permissions",
          callbackData: "show_permissions",
        },
        {
          text: "📞 Contact Admin",
          callbackData: "contact_admin",
        },
      ],
    };
  }

  /**
   * Handle rate limiting errors
   */
  async handleRateLimitError(
    error: any,
    context: ErrorContext
  ): Promise<ErrorResponse> {
    const retryAfter = error.retryAfter || 60;

    const userMessage = `⏱️ **Rate Limit Exceeded**\n\nPlease slow down! You can try again in ${retryAfter} seconds.\n\nThis protection helps keep the bot responsive for everyone.`;

    return {
      handled: true,
      userMessage,
      shouldRetry: true,
      retryAfter,
      actionButtons: [
        {
          text: "🔄 Retry Later",
          callbackData: `retry_after_${retryAfter}`,
        },
      ],
    };
  }

  /**
   * Handle network and API errors
   */
  async handleNetworkError(
    error: any,
    context: ErrorContext
  ): Promise<ErrorResponse> {
    const isTemporary = this.isTemporaryNetworkError(error);

    let userMessage = "🌐 **Connection Issue**\n\n";

    if (isTemporary) {
      userMessage +=
        "We're experiencing temporary network issues. Please try again in a moment.";
    } else {
      userMessage +=
        "There seems to be a persistent network problem. Our team has been notified.";
    }

    return {
      handled: true,
      userMessage,
      shouldRetry: isTemporary,
      retryAfter: isTemporary ? 30 : undefined,
      actionButtons: [
        {
          text: "🔄 Try Again",
          callbackData: "retry_network",
        },
        {
          text: "📊 System Status",
          callbackData: "system_status",
        },
      ],
    };
  }

  /**
   * Handle validation errors with specific guidance
   */
  async handleValidationError(
    error: any,
    context: ErrorContext
  ): Promise<ErrorResponse> {
    let userMessage = "⚠️ **Invalid Input**\n\n";

    if (error.validationErrors && Array.isArray(error.validationErrors)) {
      userMessage += "**Issues found:**\n";
      error.validationErrors.forEach((validationError: any, index: number) => {
        userMessage += `${index + 1}. ${validationError.message}\n`;
      });
    } else if (error.message) {
      userMessage += error.message;
    } else {
      userMessage += "Please check your input and try again.";
    }

    userMessage += "\n💡 Use /help to see valid input formats.";

    return {
      handled: true,
      userMessage,
      actionButtons: [
        {
          text: "📚 Examples",
          callbackData: "show_examples",
        },
        {
          text: "❓ Help",
          callbackData: "show_help",
        },
      ],
    };
  }

  /**
   * Handle AI service errors
   */
  async handleAIServiceError(
    error: any,
    context: ErrorContext
  ): Promise<ErrorResponse> {
    const errorDetails: ErrorDetails = {
      type: ErrorType.AI_SERVICE,
      severity: ErrorSeverity.MEDIUM,
      message: "AI service error",
      originalError: error,
      context,
    };

    let userMessage = "🤖 **AI Assistant Unavailable**\n\n";

    if (error.code === "quota_exceeded") {
      userMessage +=
        "AI service quota has been exceeded. Please try again later.";
    } else if (error.code === "timeout") {
      userMessage +=
        "AI service is taking too long to respond. Please try a simpler query.";
    } else {
      userMessage +=
        "The AI assistant is temporarily unavailable. Please try again in a few minutes.";
    }

    return {
      handled: true,
      userMessage,
      shouldRetry: true,
      retryAfter: 120,
      actionButtons: [
        {
          text: "🔄 Try Again",
          callbackData: "retry_ai",
        },
        {
          text: "📋 Basic Commands",
          callbackData: "show_basic_commands",
        },
      ],
    };
  }

  /**
   * Handle database errors
   */
  async handleDatabaseError(
    error: any,
    context: ErrorContext
  ): Promise<ErrorResponse> {
    const errorDetails: ErrorDetails = {
      type: ErrorType.DATABASE,
      severity: ErrorSeverity.HIGH,
      message: "Database error",
      originalError: error,
      context,
    };

    await this.logError(errorDetails);

    const userMessage =
      "💾 **Data Service Unavailable**\n\nWe're experiencing database issues. Our team has been notified and is working to resolve this quickly.\n\nPlease try again in a few minutes.";

    return {
      handled: true,
      userMessage,
      shouldRetry: true,
      retryAfter: 180,
      actionButtons: [
        {
          text: "🔄 Retry",
          callbackData: "retry_database",
        },
        {
          text: "📊 Status",
          callbackData: "system_status",
        },
      ],
    };
  }

  /**
   * Handle webhook errors
   */
  async handleWebhookError(
    error: any,
    context: ErrorContext
  ): Promise<ErrorResponse> {
    const errorDetails: ErrorDetails = {
      type: ErrorType.WEBHOOK,
      severity: ErrorSeverity.HIGH,
      message: "Webhook processing error",
      originalError: error,
      context,
    };

    await this.logError(errorDetails);

    // Don't send user message for webhook errors - they're internal
    return {
      handled: true,
      userMessage: "",
    };
  }

  /**
   * Analyze error and determine type and severity
   */
  private analyzeError(error: any, context: ErrorContext): ErrorDetails {
    // Analyze error type based on error properties
    if (
      error.code === "auth_required" ||
      error.message?.includes("authentication")
    ) {
      return {
        type: ErrorType.AUTHENTICATION,
        severity: ErrorSeverity.HIGH,
        message: error.message || "Authentication required",
        originalError: error,
        context,
      };
    }

    if (
      error.code === "access_denied" ||
      error.message?.includes("authorization")
    ) {
      return {
        type: ErrorType.AUTHORIZATION,
        severity: ErrorSeverity.MEDIUM,
        message: error.message || "Access denied",
        originalError: error,
        context,
      };
    }

    if (error.code === "rate_limit" || error.status === 429) {
      return {
        type: ErrorType.RATE_LIMIT,
        severity: ErrorSeverity.MEDIUM,
        message: "Rate limit exceeded",
        originalError: error,
        context,
      };
    }

    if (
      error.code === "ECONNREFUSED" ||
      error.code === "ENOTFOUND" ||
      error.code === "TIMEOUT"
    ) {
      return {
        type: ErrorType.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        message: "Network error",
        originalError: error,
        context,
      };
    }

    if (error.code?.startsWith("23") || error.message?.includes("database")) {
      return {
        type: ErrorType.DATABASE,
        severity: ErrorSeverity.HIGH,
        message: "Database error",
        originalError: error,
        context,
      };
    }

    if (error.code === "ai_service_error" || error.message?.includes("AI")) {
      return {
        type: ErrorType.AI_SERVICE,
        severity: ErrorSeverity.MEDIUM,
        message: "AI service error",
        originalError: error,
        context,
      };
    }

    if (error.status >= 400 && error.status < 500) {
      return {
        type: ErrorType.USER_INPUT,
        severity: ErrorSeverity.LOW,
        message: "User input error",
        originalError: error,
        context,
      };
    }

    // Default to internal error
    return {
      type: ErrorType.INTERNAL,
      severity: ErrorSeverity.HIGH,
      message: "Internal error",
      originalError: error,
      context,
    };
  }

  /**
   * Determine recovery strategy for error
   */
  private determineRecoveryStrategy(
    errorDetails: ErrorDetails
  ): RecoveryStrategy {
    switch (errorDetails.type) {
      case ErrorType.NETWORK:
      case ErrorType.TIMEOUT:
        return {
          canRecover: true,
          autoRetry: true,
          maxRetries: 3,
          retryDelay: 5000,
          userAction: "retry",
        };

      case ErrorType.RATE_LIMIT:
        return {
          canRecover: true,
          autoRetry: false,
          userAction: "wait_and_retry",
        };

      case ErrorType.AI_SERVICE:
        return {
          canRecover: true,
          autoRetry: true,
          maxRetries: 2,
          retryDelay: 10000,
          fallbackAction: "basic_response",
        };

      case ErrorType.DATABASE:
        return {
          canRecover: true,
          autoRetry: true,
          maxRetries: 2,
          retryDelay: 15000,
        };

      case ErrorType.AUTHENTICATION:
        return {
          canRecover: true,
          autoRetry: false,
          userAction: "reauthenticate",
        };

      case ErrorType.AUTHORIZATION:
        return {
          canRecover: false,
          userAction: "contact_admin",
        };

      case ErrorType.VALIDATION:
      case ErrorType.USER_INPUT:
        return {
          canRecover: true,
          autoRetry: false,
          userAction: "correct_input",
        };

      default:
        return {
          canRecover: false,
          userAction: "contact_support",
        };
    }
  }

  /**
   * Generate user-friendly response
   */
  private async generateUserResponse(
    errorDetails: ErrorDetails
  ): Promise<ErrorResponse> {
    // Use specific handlers for different error types
    switch (errorDetails.type) {
      case ErrorType.AUTHENTICATION:
        return this.handleAuthenticationError(
          errorDetails.originalError,
          errorDetails.context
        );

      case ErrorType.AUTHORIZATION:
        return this.handleAuthorizationError(
          errorDetails.originalError,
          errorDetails.context
        );

      case ErrorType.RATE_LIMIT:
        return this.handleRateLimitError(
          errorDetails.originalError,
          errorDetails.context
        );

      case ErrorType.NETWORK:
        return this.handleNetworkError(
          errorDetails.originalError,
          errorDetails.context
        );

      case ErrorType.VALIDATION:
      case ErrorType.USER_INPUT:
        return this.handleValidationError(
          errorDetails.originalError,
          errorDetails.context
        );

      case ErrorType.AI_SERVICE:
        return this.handleAIServiceError(
          errorDetails.originalError,
          errorDetails.context
        );

      case ErrorType.DATABASE:
        return this.handleDatabaseError(
          errorDetails.originalError,
          errorDetails.context
        );

      case ErrorType.WEBHOOK:
        return this.handleWebhookError(
          errorDetails.originalError,
          errorDetails.context
        );

      default:
        return this.handleGenericError(errorDetails);
    }
  }

  /**
   * Handle generic errors
   */
  private handleGenericError(errorDetails: ErrorDetails): ErrorResponse {
    const userMessage =
      "❌ **Something went wrong**\n\nWe encountered an unexpected error. Please try again later or contact support if the issue persists.\n\n🆔 Error ID: `" +
      this.generateErrorId(errorDetails) +
      "`";

    return {
      handled: true,
      userMessage,
      actionButtons: [
        {
          text: "🔄 Try Again",
          callbackData: "retry_generic",
        },
        {
          text: "📞 Contact Support",
          callbackData: "contact_support",
        },
      ],
    };
  }

  /**
   * Check if network error is temporary
   */
  private isTemporaryNetworkError(error: any): boolean {
    const temporaryCodes = [
      "ECONNREFUSED",
      "ENOTFOUND",
      "TIMEOUT",
      "ECONNRESET",
    ];
    return temporaryCodes.includes(error.code) || error.status >= 500;
  }

  /**
   * Log error for monitoring and debugging
   */
  private async logError(errorDetails: ErrorDetails): Promise<void> {
    const logEntry = {
      id: this.generateErrorId(errorDetails),
      type: errorDetails.type,
      severity: errorDetails.severity,
      message: errorDetails.message,
      stack: errorDetails.originalError?.stack,
      context: errorDetails.context,
      timestamp: new Date().toISOString(),
      user_id: errorDetails.context.userId,
      chat_id: errorDetails.context.chatId,
      command: errorDetails.context.command,
      resource: errorDetails.context.resource,
      action: errorDetails.context.action,
    };

    try {
      console.error("Telegram Bot Error:", logEntry);

      // Here you could also send to external monitoring service
      // await this.sendToMonitoringService(logEntry);
    } catch (loggingError) {
      console.error("Failed to log error:", loggingError);
    }
  }

  /**
   * Handle critical errors that require immediate attention
   */
  private async handleCriticalError(errorDetails: ErrorDetails): Promise<void> {
    try {
      // Notify administrators about critical errors
      const adminMessage = `🚨 **CRITICAL ERROR ALERT**\n\n**Type:** ${errorDetails.type}\n**Message:** ${errorDetails.message}\n**User:** ${errorDetails.context.userId}\n**Time:** ${errorDetails.context.timestamp.toISOString()}\n\n**Error ID:** ${this.generateErrorId(errorDetails)}`;

      // Send to admin channels (if configured)
      // await this.notifyAdministrators(adminMessage);
    } catch (notificationError) {
      console.error(
        "Failed to send critical error notification:",
        notificationError
      );
    }
  }

  /**
   * Update error statistics for monitoring
   */
  private updateErrorStats(errorDetails: ErrorDetails): void {
    const key = `${errorDetails.type}_${errorDetails.context.userId || "anonymous"}`;
    const currentCount = this.errorCount.get(key) || 0;
    this.errorCount.set(key, currentCount + 1);
    this.lastErrorTime.set(key, errorDetails.context.timestamp);
  }

  /**
   * Generate unique error ID for tracking
   */
  private generateErrorId(errorDetails: ErrorDetails): string {
    const timestamp = errorDetails.context.timestamp.getTime().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const typeCode = errorDetails.type.substring(0, 3).toUpperCase();
    return `${typeCode}-${timestamp}-${random}`;
  }

  /**
   * Clear user session (helper method)
   */
  private async clearUserSession(userId?: string): Promise<void> {
    if (!userId) return;

    try {
      // Implementation would clear user session from database
      console.log(`Clearing session for user: ${userId}`);
    } catch (error) {
      console.error("Failed to clear user session:", error);
    }
  }

  /**
   * Get error statistics for monitoring
   */
  getErrorStats(): { [key: string]: { count: number; lastError: Date } } {
    const stats: { [key: string]: { count: number; lastError: Date } } = {};

    this.errorCount.forEach((count, key) => {
      const lastError = this.lastErrorTime.get(key);
      if (lastError) {
        stats[key] = { count, lastError };
      }
    });

    return stats;
  }

  /**
   * Reset error statistics
   */
  resetErrorStats(): void {
    this.errorCount.clear();
    this.lastErrorTime.clear();
  }
}
