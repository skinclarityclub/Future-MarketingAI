/**
 * Error Detection Middleware
 * Task 62.1: Automatic error detection integration for all API endpoints
 */

import { NextRequest, NextResponse } from "next/server";
import {
  errorDetectionEngine,
  ErrorClassification,
} from "./error-detection-engine";
import { logger, LogCategory } from "../logger";
import { ErrorContext } from "../telegram/error-handler";

export interface ErrorDetectionConfig {
  enableAutoDetection: boolean;
  enableAutoRecovery: boolean;
  enableRealTimeAlerts: boolean;
  excludePaths: string[];
  sensitiveDataPatterns: RegExp[];
}

export interface ErrorHandlingResult {
  handled: boolean;
  classification: ErrorClassification;
  response?: NextResponse;
  shouldRetry: boolean;
  retryAfter?: number;
}

export class ErrorDetectionMiddleware {
  private static instance: ErrorDetectionMiddleware;
  private config: ErrorDetectionConfig;
  private isInitialized = false;

  private constructor() {
    this.config = {
      enableAutoDetection: true,
      enableAutoRecovery: true,
      enableRealTimeAlerts: true,
      excludePaths: ["/api/health", "/api/ping"],
      sensitiveDataPatterns: [
        /password/i,
        /token/i,
        /secret/i,
        /key/i,
        /auth/i,
      ],
    };
  }

  public static getInstance(): ErrorDetectionMiddleware {
    if (!ErrorDetectionMiddleware.instance) {
      ErrorDetectionMiddleware.instance = new ErrorDetectionMiddleware();
    }
    return ErrorDetectionMiddleware.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    logger.info("Initializing Error Detection Middleware...", {
      category: LogCategory.SYSTEM,
      component: "error_detection_middleware",
    });

    await errorDetectionEngine.initialize();
    this.isInitialized = true;

    logger.info("Error Detection Middleware initialized successfully", {
      category: LogCategory.SYSTEM,
      component: "error_detection_middleware",
    });
  }

  public async handleRequest(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    const requestId = this.generateRequestId();
    const context = this.createErrorContext(request, requestId);

    try {
      logger.info("API request started", {
        category: LogCategory.HTTP_REQUEST,
        component: "error_detection_middleware",
        request_id: requestId,
        method: request.method,
        url: request.url,
      });

      const response = await handler(request);

      const duration = Date.now() - startTime;
      logger.info("API request completed successfully", {
        category: LogCategory.HTTP_REQUEST,
        component: "error_detection_middleware",
        request_id: requestId,
        status: response.status,
        duration_ms: duration,
      });

      return response;
    } catch (error) {
      const handlingResult = await this.handleError(error, context);
      return (
        handlingResult.response ||
        this.createErrorResponse(error, handlingResult.classification)
      );
    }
  }

  public async handleError(
    error: Error | any,
    context: ErrorContext
  ): Promise<ErrorHandlingResult> {
    try {
      const classification = await errorDetectionEngine.detectError(
        error,
        context
      );

      logger.info("Error handled by detection middleware", {
        category: LogCategory.SYSTEM,
        component: "error_detection_middleware",
        error_id: classification.errorId,
        error_type: classification.type,
        severity: classification.severity,
      });

      let recoveryAttempted = false;
      if (
        this.config.enableAutoRecovery &&
        this.canAutoRecover(classification)
      ) {
        recoveryAttempted = await this.attemptAutoRecovery(
          error,
          classification,
          context
        );
      }

      if (
        this.config.enableRealTimeAlerts &&
        this.shouldAlert(classification)
      ) {
        await this.sendRealTimeAlert(classification, context);
      }

      const shouldRetry =
        this.shouldRetry(classification) && !recoveryAttempted;

      return {
        handled: true,
        classification,
        shouldRetry,
        retryAfter: shouldRetry
          ? this.calculateRetryDelay(classification)
          : undefined,
      };
    } catch (handlingError) {
      logger.error("Error in error handling process", handlingError, {
        category: LogCategory.SYSTEM,
        component: "error_detection_middleware",
      });

      return {
        handled: false,
        classification: {
          errorId: `fallback_${Date.now()}`,
          type: "internal" as any,
          severity: "high" as any,
          confidence: 0,
          patterns: [],
          tags: ["unhandled"],
          category: "System",
          businessImpact: "high",
          userImpact: "severe",
          estimatedResolutionTime: 120,
        },
        shouldRetry: false,
      };
    }
  }

  private createErrorContext(
    request: NextRequest,
    requestId: string
  ): ErrorContext {
    const url = new URL(request.url);

    return {
      timestamp: new Date(),
      requestId,
      action: `${request.method} ${url.pathname}`,
      resource: url.pathname,
      ip: request.ip || request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private canAutoRecover(classification: ErrorClassification): boolean {
    const recoverableTypes = ["rate_limit", "network", "timeout"];
    const recoverableSeverities = ["low", "medium"];

    return (
      (recoverableTypes.includes(classification.type as string) ||
        recoverableSeverities.includes(classification.severity as string)) &&
      classification.confidence > 0.7
    );
  }

  private async attemptAutoRecovery(
    error: any,
    classification: ErrorClassification,
    context: ErrorContext
  ): Promise<boolean> {
    logger.info("Attempting automatic error recovery", {
      category: LogCategory.SYSTEM,
      component: "error_detection_middleware",
      error_id: classification.errorId,
      error_type: classification.type,
    });

    try {
      switch (classification.type) {
        case "rate_limit":
          await this.delay(this.calculateRetryDelay(classification) * 1000);
          return true;
        case "network":
          return await this.handleNetworkError(error, context);
        case "database":
          return await this.handleDatabaseError(error, context);
        default:
          return false;
      }
    } catch (recoveryError) {
      logger.error("Auto-recovery failed", recoveryError, {
        category: LogCategory.SYSTEM,
        component: "error_detection_middleware",
        error_id: classification.errorId,
      });
      return false;
    }
  }

  private async handleNetworkError(
    error: any,
    context: ErrorContext
  ): Promise<boolean> {
    const errorKey = `network_error_${context.resource}`;
    const errorCount = await this.getErrorCount(errorKey);

    if (errorCount > 5) {
      logger.warn("Circuit breaker opened for network errors", {
        category: LogCategory.SYSTEM,
        component: "error_detection_middleware",
        resource: context.resource,
        error_count: errorCount,
      });
      return false;
    }

    await this.incrementErrorCount(errorKey);
    return true;
  }

  private async handleDatabaseError(
    error: any,
    context: ErrorContext
  ): Promise<boolean> {
    logger.info("Attempting database error recovery", {
      category: LogCategory.SYSTEM,
      component: "error_detection_middleware",
      error_message: error.message,
    });

    return false;
  }

  private shouldAlert(classification: ErrorClassification): boolean {
    const alertCriteria = [
      classification.severity === "critical",
      classification.businessImpact === "critical",
      classification.userImpact === "severe",
      classification.tags.includes("security"),
    ];

    return alertCriteria.some(criteria => criteria);
  }

  private async sendRealTimeAlert(
    classification: ErrorClassification,
    context: ErrorContext
  ): Promise<void> {
    logger.warn("Sending real-time alert for critical error", {
      category: LogCategory.SECURITY,
      component: "error_detection_middleware",
      error_id: classification.errorId,
      error_type: classification.type,
      severity: classification.severity,
    });
  }

  private shouldRetry(classification: ErrorClassification): boolean {
    const retryableTypes = ["rate_limit", "network", "timeout", "database"];
    const retryableSeverities = ["low", "medium"];

    return (
      retryableTypes.includes(classification.type as string) &&
      retryableSeverities.includes(classification.severity as string) &&
      classification.confidence > 0.6
    );
  }

  private calculateRetryDelay(classification: ErrorClassification): number {
    const baseDelay = 1;
    const severityMultiplier = {
      low: 1,
      medium: 2,
      high: 4,
      critical: 8,
    };

    return (
      baseDelay *
      (severityMultiplier[
        classification.severity as keyof typeof severityMultiplier
      ] || 2)
    );
  }

  private createErrorResponse(
    error: any,
    classification: ErrorClassification
  ): NextResponse {
    const sanitizedError = this.sanitizeErrorForResponse(error, classification);

    const errorResponse = {
      error: true,
      message: sanitizedError.message,
      type: classification.type,
      severity: classification.severity,
      errorId: classification.errorId,
      timestamp: new Date().toISOString(),
      estimatedResolutionTime: classification.estimatedResolutionTime,
    };

    const statusCode = this.getHttpStatusCode(classification);
    return NextResponse.json(errorResponse, { status: statusCode });
  }

  private sanitizeErrorForResponse(
    error: any,
    classification: ErrorClassification
  ): any {
    let message = error?.message || "An error occurred";

    this.config.sensitiveDataPatterns.forEach(pattern => {
      message = message.replace(pattern, "[REDACTED]");
    });

    const userFriendlyMessages: Record<string, string> = {
      authentication: "Authentication required. Please log in.",
      authorization: "Access denied. Insufficient permissions.",
      validation: "Invalid input data. Please check your request.",
      rate_limit: "Too many requests. Please try again later.",
      database: "Service temporarily unavailable. Please try again.",
      network: "Network error. Please check your connection.",
    };

    return {
      message: userFriendlyMessages[classification.type as string] || message,
      originalMessage:
        process.env.NODE_ENV === "development" ? error?.message : undefined,
    };
  }

  private getHttpStatusCode(classification: ErrorClassification): number {
    const statusCodes: Record<string, number> = {
      authentication: 401,
      authorization: 403,
      validation: 400,
      rate_limit: 429,
      database: 503,
      network: 502,
      timeout: 504,
      internal: 500,
    };

    return statusCodes[classification.type as string] || 500;
  }

  private errorCounts: Map<string, number> = new Map();

  private async getErrorCount(key: string): Promise<number> {
    return this.errorCounts.get(key) || 0;
  }

  private async incrementErrorCount(key: string): Promise<void> {
    const current = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, current + 1);

    setTimeout(
      () => {
        this.errorCounts.delete(key);
      },
      5 * 60 * 1000
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const errorDetectionMiddleware = ErrorDetectionMiddleware.getInstance();

export const withErrorDetection = (
  handler: (req: NextRequest) => Promise<NextResponse>
) => {
  return async (req: NextRequest): Promise<NextResponse> => {
    return errorDetectionMiddleware.handleRequest(req, handler);
  };
};
