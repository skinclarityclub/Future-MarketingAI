/**
 * Enhanced Logging Utility for SKC BI Dashboard
 * Task 41.3: Structured logging with ELK stack integration
 */

import winston from "winston";
import "winston-daily-rotate-file";

// Log levels
export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  HTTP = "http",
  DEBUG = "debug",
}

// Log categories for better organization
export enum LogCategory {
  APPLICATION = "application",
  HTTP_REQUEST = "http_request",
  DATABASE = "database",
  AUTHENTICATION = "authentication",
  BUSINESS = "business",
  SECURITY = "security",
  PERFORMANCE = "performance",
  SYSTEM = "system",
}

// Interface for structured log data
export interface LogData {
  message: string;
  level: LogLevel;
  category: LogCategory;
  userId?: string;
  tenantId?: string;
  sessionId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  ipAddress?: string;
  userAgent?: string;
  error?: Error;
  stack?: string;
  metadata?: Record<string, any>;
}

// Performance tracking interface
export interface PerformanceData {
  operation: string;
  duration: number;
  success: boolean;
  metadata?: Record<string, any>;
}

// Security event interface
export interface SecurityEvent {
  event: string;
  severity: "low" | "medium" | "high" | "critical";
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

// Business metrics interface
export interface BusinessMetrics {
  event: string;
  value?: number;
  currency?: string;
  userId?: string;
  tenantId?: string;
  feature?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private winston: winston.Logger;
  private requestId: string | null = null;

  constructor() {
    // Configure Winston logger
    this.winston = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: winston.format.combine(
        winston.format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss.SSS",
        }),
        winston.format.errors({ stack: true }),
        winston.format.metadata({
          fillExcept: ["message", "level", "timestamp"],
        }),
        winston.format.json()
      ),
      defaultMeta: {
        service: "skc-bi-dashboard",
        environment: process.env.NODE_ENV || "development",
        version: process.env.npm_package_version || "1.0.0",
        hostname: process.env.HOSTNAME || "unknown",
        pid: process.pid,
      },
      transports: [
        // Console output for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),

        // Application logs
        new winston.transports.DailyRotateFile({
          filename: "logs/application-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          maxSize: "20m",
          maxFiles: "14d",
          format: winston.format.json(),
        }),

        // Error logs
        new winston.transports.DailyRotateFile({
          filename: "logs/error-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          level: "error",
          maxSize: "20m",
          maxFiles: "30d",
          format: winston.format.json(),
        }),

        // HTTP request logs
        new winston.transports.DailyRotateFile({
          filename: "logs/http-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          level: "http",
          maxSize: "50m",
          maxFiles: "7d",
          format: winston.format.json(),
        }),

        // Security logs
        new winston.transports.DailyRotateFile({
          filename: "logs/security-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          maxSize: "100m",
          maxFiles: "90d",
          format: winston.format.json(),
        }),

        // Business metrics
        new winston.transports.DailyRotateFile({
          filename: "logs/business-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          maxSize: "50m",
          maxFiles: "365d",
          format: winston.format.json(),
        }),
      ],
      exitOnError: false,
    });

    // Handle uncaught exceptions
    this.winston.exceptions.handle(
      new winston.transports.File({ filename: "logs/exceptions.log" })
    );

    // Handle unhandled promise rejections
    this.winston.rejections.handle(
      new winston.transports.File({ filename: "logs/rejections.log" })
    );
  }

  // Set request ID for request correlation
  setRequestId(requestId: string): void {
    this.requestId = requestId;
  }

  // Clear request ID
  clearRequestId(): void {
    this.requestId = null;
  }

  // Generic logging method
  private log(data: LogData): void {
    const logEntry = {
      message: data.message,
      level: data.level,
      category: data.category,
      request_id: data.requestId || this.requestId,
      user_id: data.userId,
      tenant_id: data.tenantId,
      session_id: data.sessionId,
      endpoint: data.endpoint,
      method: data.method,
      status_code: data.statusCode,
      response_time: data.responseTime,
      ip_address: data.ipAddress,
      user_agent: data.userAgent,
      error_message: data.error?.message,
      error_stack: data.error?.stack || data.stack,
      metadata: data.metadata,
      timestamp: new Date().toISOString(),
    };

    // Remove undefined fields
    Object.keys(logEntry).forEach(key => {
      if (logEntry[key as keyof typeof logEntry] === undefined) {
        delete logEntry[key as keyof typeof logEntry];
      }
    });

    this.winston.log(data.level, logEntry);
  }

  // Convenience methods
  info(message: string, metadata?: Record<string, any>): void {
    this.log({
      message,
      level: LogLevel.INFO,
      category: LogCategory.APPLICATION,
      metadata,
    });
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.log({
      message,
      level: LogLevel.WARN,
      category: LogCategory.APPLICATION,
      metadata,
    });
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.log({
      message,
      level: LogLevel.ERROR,
      category: LogCategory.APPLICATION,
      error,
      metadata,
    });
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.log({
      message,
      level: LogLevel.DEBUG,
      category: LogCategory.APPLICATION,
      metadata,
    });
  }

  // HTTP request logging
  logHttpRequest(data: {
    method: string;
    endpoint: string;
    statusCode: number;
    responseTime: number;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
  }): void {
    this.log({
      message: `${data.method} ${data.endpoint} ${data.statusCode} ${data.responseTime}ms`,
      level: LogLevel.HTTP,
      category: LogCategory.HTTP_REQUEST,
      method: data.method,
      endpoint: data.endpoint,
      statusCode: data.statusCode,
      responseTime: data.responseTime,
      userId: data.userId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      requestId: data.requestId,
    });
  }

  // Database operation logging
  logDatabase(data: {
    operation: string;
    table?: string;
    duration: number;
    success: boolean;
    error?: Error;
    metadata?: Record<string, any>;
  }): void {
    this.log({
      message: `Database ${data.operation} ${data.table ? `on ${data.table}` : ""} - ${data.success ? "SUCCESS" : "FAILED"} (${data.duration}ms)`,
      level: data.success ? LogLevel.INFO : LogLevel.ERROR,
      category: LogCategory.DATABASE,
      error: data.error,
      metadata: {
        operation: data.operation,
        table: data.table,
        duration: data.duration,
        success: data.success,
        ...data.metadata,
      },
    });
  }

  // Authentication logging
  logAuth(data: {
    action: string;
    success: boolean;
    userId?: string;
    email?: string;
    ipAddress?: string;
    userAgent?: string;
    error?: Error;
    metadata?: Record<string, any>;
  }): void {
    this.log({
      message: `Authentication ${data.action} - ${data.success ? "SUCCESS" : "FAILED"}`,
      level: data.success ? LogLevel.INFO : LogLevel.WARN,
      category: LogCategory.AUTHENTICATION,
      userId: data.userId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      error: data.error,
      metadata: {
        action: data.action,
        success: data.success,
        email: data.email,
        ...data.metadata,
      },
    });
  }

  // Security event logging
  logSecurity(event: SecurityEvent): void {
    this.log({
      message: `Security Event: ${event.event}`,
      level:
        event.severity === "critical" || event.severity === "high"
          ? LogLevel.ERROR
          : LogLevel.WARN,
      category: LogCategory.SECURITY,
      userId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      metadata: {
        security_event: event.event,
        severity: event.severity,
        ...event.metadata,
      },
    });
  }

  // Performance logging
  logPerformance(data: PerformanceData): void {
    this.log({
      message: `Performance: ${data.operation} completed in ${data.duration}ms`,
      level: LogLevel.INFO,
      category: LogCategory.PERFORMANCE,
      responseTime: data.duration,
      metadata: {
        operation: data.operation,
        duration: data.duration,
        success: data.success,
        performance_category:
          data.duration < 100
            ? "fast"
            : data.duration < 500
              ? "normal"
              : data.duration < 2000
                ? "slow"
                : "very_slow",
        ...data.metadata,
      },
    });
  }

  // Business metrics logging
  logBusiness(metrics: BusinessMetrics): void {
    this.log({
      message: `Business Event: ${metrics.event}`,
      level: LogLevel.INFO,
      category: LogCategory.BUSINESS,
      userId: metrics.userId,
      tenantId: metrics.tenantId,
      metadata: {
        business_event: metrics.event,
        value: metrics.value,
        currency: metrics.currency,
        feature: metrics.feature,
        revenue_impact: metrics.value,
        ...metrics.metadata,
      },
    });
  }

  // System event logging
  logSystem(
    message: string,
    level: LogLevel = LogLevel.INFO,
    metadata?: Record<string, any>
  ): void {
    this.log({
      message,
      level,
      category: LogCategory.SYSTEM,
      metadata,
    });
  }

  // Create child logger with additional context
  child(context: Record<string, any>): Logger {
    const childLogger = new Logger();
    childLogger.winston = this.winston.child(context);
    childLogger.requestId = this.requestId;
    return childLogger;
  }

  // Get Winston instance for advanced usage
  getWinston(): winston.Logger {
    return this.winston;
  }
}

// Create singleton instance
const logger = new Logger();

// Export logger instance and types
export { logger };
export default logger;

// Export utility functions for common logging patterns
export const withRequestLogging = (requestId: string, fn: () => void): void => {
  logger.setRequestId(requestId);
  try {
    fn();
  } finally {
    logger.clearRequestId();
  }
};

export const timeOperation = async <T>(
  operation: string,
  fn: () => Promise<T>,
  category: LogCategory = LogCategory.PERFORMANCE
): Promise<T> => {
  const start = Date.now();
  let success = true;
  let error: Error | undefined;

  try {
    const result = await fn();
    return result;
  } catch (err) {
    success = false;
    error = err as Error;
    throw err;
  } finally {
    const duration = Date.now() - start;

    logger.logPerformance({
      operation,
      duration,
      success,
      metadata: { error: error?.message },
    });
  }
};
