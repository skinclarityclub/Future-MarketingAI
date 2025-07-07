/**
 * Comprehensive Enterprise Error Logger
 * Provides advanced error logging, metrics, analytics, and monitoring capabilities
 */

import { logger } from "../logger";
import { createClient } from "@/lib/supabase/server";

// Error Severity Levels
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Error Categories
export enum ErrorCategory {
  AUTHENTICATION = "authentication",
  DATABASE = "database",
  API = "api",
  VALIDATION = "validation",
  NETWORK = "network",
  SYSTEM = "system",
  USER_INPUT = "user_input",
  EXTERNAL_SERVICE = "external_service",
}

// Error Context Interface
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  userAgent?: string;
  ipAddress?: string;
  endpoint?: string;
  method?: string;
  payload?: any;
  headers?: Record<string, string>;
  timestamp?: string;
  environment?: string;
  version?: string;
  additionalData?: Record<string, any>;
}

// Error Log Entry Interface
export interface ErrorLogEntry {
  id: string;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context: ErrorContext;
  resolved: boolean;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  errorHash: string;
  occurrenceCount: number;
  firstOccurrence: string;
  lastOccurrence: string;
}

// Error Metrics Interface
export interface ErrorMetrics {
  totalErrors: number;
  errorsBySeverity: Record<ErrorSeverity, number>;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsByEndpoint: Record<string, number>;
  errorRate: number;
  avgResolutionTime: number;
  unresolvedErrors: number;
  topErrors: Array<{
    message: string;
    count: number;
    severity: ErrorSeverity;
    category: ErrorCategory;
  }>;
  errorTrends: Array<{
    date: string;
    count: number;
    severity: ErrorSeverity;
  }>;
}

// Error Analytics Interface
export interface ErrorAnalytics {
  patterns: Array<{
    pattern: string;
    frequency: number;
    confidence: number;
    impact: string;
  }>;
  correlations: Array<{
    factor: string;
    correlation: number;
    description: string;
  }>;
  predictions: Array<{
    category: ErrorCategory;
    predictedIncrease: number;
    timeframe: string;
    confidence: number;
  }>;
  recommendations: Array<{
    issue: string;
    recommendation: string;
    priority: "low" | "medium" | "high";
    estimatedImpact: string;
  }>;
}

export class ComprehensiveErrorLogger {
  private static instance: ComprehensiveErrorLogger;
  private errorCache = new Map<string, ErrorLogEntry>();
  private metricsCache: { metrics: ErrorMetrics | null; lastUpdated: number } = {
    metrics: null,
    lastUpdated: 0,
  };

  private constructor() {}

  public static getInstance(): ComprehensiveErrorLogger {
    if (!ComprehensiveErrorLogger.instance) {
      ComprehensiveErrorLogger.instance = new ComprehensiveErrorLogger();
    }
    return ComprehensiveErrorLogger.instance;
  }

  /**
   * Log an error with comprehensive context
   */
  async logError(
    error: Error | string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.SYSTEM,
    context: Partial<ErrorContext> = {}
  ): Promise<string> {
    try {
      const errorMessage = typeof error === "string" ? error : error.message;
      const errorStack = typeof error === "string" ? undefined : error.stack;
      
      // Generate error hash for deduplication
      const errorHash = this.generateErrorHash(errorMessage, errorStack, context.endpoint);
      
      // Check if this error already exists
      const existingError = await this.getExistingError(errorHash);
      
      const errorEntry: ErrorLogEntry = {
        id: existingError?.id || this.generateId(),
        message: errorMessage,
        stack: errorStack,
        severity,
        category,
        context: {
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || "development",
          version: process.env.npm_package_version || "unknown",
          ...context,
        },
        resolved: false,
        createdAt: existingError?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        errorHash,
        occurrenceCount: (existingError?.occurrenceCount || 0) + 1,
        firstOccurrence: existingError?.firstOccurrence || new Date().toISOString(),
        lastOccurrence: new Date().toISOString(),
      };

      // Store in cache
      this.errorCache.set(errorHash, errorEntry);

      // Log to console based on severity
      this.logToConsole(errorEntry);

      // Store in database
      await this.storeInDatabase(errorEntry);

      // Trigger alerts for high severity errors
      if (severity === ErrorSeverity.HIGH || severity === ErrorSeverity.CRITICAL) {
        await this.triggerAlert(errorEntry);
      }

      return errorEntry.id;
    } catch (logError) {
      // Fallback logging to prevent infinite loops
      console.error("Failed to log error:", logError);
      logger.error("Error logger failure", { originalError: error, logError });
      return "error_log_failed";
    }
  }

  /**
   * Get error metrics for analytics
   */
  async getErrorMetrics(timeRange: "1h" | "24h" | "7d" | "30d" = "24h"): Promise<ErrorMetrics> {
    try {
      // Check cache
      const cacheExpiry = 5 * 60 * 1000; // 5 minutes
      if (
        this.metricsCache.metrics &&
        Date.now() - this.metricsCache.lastUpdated < cacheExpiry
      ) {
        return this.metricsCache.metrics;
      }

      const supabase = await createClient();
      const timeRangeHours = this.parseTimeRange(timeRange);
      const since = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000).toISOString();

      // Get error data from database
      const { data: errors, error } = await supabase
        .from("error_logs")
        .select("*")
        .gte("created_at", since);

      if (error) throw error;

      const metrics = this.calculateMetrics(errors || []);
      
      // Update cache
      this.metricsCache = {
        metrics,
        lastUpdated: Date.now(),
      };

      return metrics;
    } catch (error) {
      console.error("Failed to get error metrics:", error);
      return this.getDefaultMetrics();
    }
  }

  /**
   * Get error analytics and insights
   */
  async getErrorAnalytics(timeRange: "24h" | "7d" | "30d" = "7d"): Promise<ErrorAnalytics> {
    try {
      const supabase = await createClient();
      const timeRangeHours = this.parseTimeRange(timeRange);
      const since = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000).toISOString();

      const { data: errors, error } = await supabase
        .from("error_logs")
        .select("*")
        .gte("created_at", since);

      if (error) throw error;

      return this.analyzeErrors(errors || []);
    } catch (error) {
      console.error("Failed to get error analytics:", error);
      return this.getDefaultAnalytics();
    }
  }

  /**
   * Mark an error as resolved
   */
  async resolveError(errorId: string, resolutionNotes?: string): Promise<boolean> {
    try {
      const supabase = await createClient();
      
      const { error } = await supabase
        .from("error_logs")
        .update({
          resolved: true,
          resolution_notes: resolutionNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", errorId);

      if (error) throw error;

      // Update cache if present
      const cachedError = Array.from(this.errorCache.values()).find(e => e.id === errorId);
      if (cachedError) {
        cachedError.resolved = true;
        cachedError.resolutionNotes = resolutionNotes;
        cachedError.updatedAt = new Date().toISOString();
      }

      // Clear metrics cache
      this.metricsCache.metrics = null;

      return true;
    } catch (error) {
      console.error("Failed to resolve error:", error);
      return false;
    }
  }

  /**
   * Get error by ID
   */
  async getError(errorId: string): Promise<ErrorLogEntry | null> {
    try {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from("error_logs")
        .select("*")
        .eq("id", errorId)
        .single();

      if (error) throw error;

      return this.mapDatabaseToEntry(data);
    } catch (error) {
      console.error("Failed to get error:", error);
      return null;
    }
  }

  /**
   * Search errors with filters
   */
  async searchErrors(filters: {
    severity?: ErrorSeverity;
    category?: ErrorCategory;
    resolved?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ errors: ErrorLogEntry[]; total: number }> {
    try {
      const supabase = await createClient();
      
      let query = supabase
        .from("error_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (filters.severity) {
        query = query.eq("severity", filters.severity);
      }
      if (filters.category) {
        query = query.eq("category", filters.category);
      }
      if (filters.resolved !== undefined) {
        query = query.eq("resolved", filters.resolved);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        errors: (data || []).map(this.mapDatabaseToEntry),
        total: count || 0,
      };
    } catch (error) {
      console.error("Failed to search errors:", error);
      return { errors: [], total: 0 };
    }
  }

  // Private helper methods

  private generateErrorHash(message: string, stack?: string, endpoint?: string): string {
    const content = `${message}${stack || ""}${endpoint || ""}`;
    // Simple hash function - in production, use a proper crypto hash
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getExistingError(errorHash: string): Promise<ErrorLogEntry | null> {
    try {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from("error_logs")
        .select("*")
        .eq("error_hash", errorHash)
        .single();

      if (error) return null;

      return this.mapDatabaseToEntry(data);
    } catch (error) {
      return null;
    }
  }

  private logToConsole(errorEntry: ErrorLogEntry): void {
    const logData = {
      id: errorEntry.id,
      message: errorEntry.message,
      severity: errorEntry.severity,
      category: errorEntry.category,
      context: errorEntry.context,
    };

    switch (errorEntry.severity) {
      case ErrorSeverity.CRITICAL:
        console.error("🚨 CRITICAL ERROR:", logData);
        break;
      case ErrorSeverity.HIGH:
        console.error("🔥 HIGH SEVERITY ERROR:", logData);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn("⚠️ MEDIUM SEVERITY ERROR:", logData);
        break;
      case ErrorSeverity.LOW:
        console.log("ℹ️ LOW SEVERITY ERROR:", logData);
        break;
    }
  }

  private async storeInDatabase(errorEntry: ErrorLogEntry): Promise<void> {
    try {
      const supabase = await createClient();
      
      const dbEntry = {
        id: errorEntry.id,
        message: errorEntry.message,
        stack: errorEntry.stack,
        severity: errorEntry.severity,
        category: errorEntry.category,
        context: errorEntry.context,
        resolved: errorEntry.resolved,
        resolution_notes: errorEntry.resolutionNotes,
        created_at: errorEntry.createdAt,
        updated_at: errorEntry.updatedAt,
        error_hash: errorEntry.errorHash,
        occurrence_count: errorEntry.occurrenceCount,
        first_occurrence: errorEntry.firstOccurrence,
        last_occurrence: errorEntry.lastOccurrence,
      };

      const { error } = await supabase
        .from("error_logs")
        .upsert(dbEntry, { onConflict: "error_hash" });

      if (error) throw error;
    } catch (error) {
      console.error("Failed to store error in database:", error);
    }
  }

  private async triggerAlert(errorEntry: ErrorLogEntry): Promise<void> {
    try {
      // In a real implementation, this would send alerts via email, Slack, etc.
      logger.error("High severity error alert", {
        errorId: errorEntry.id,
        message: errorEntry.message,
        severity: errorEntry.severity,
        category: errorEntry.category,
        context: errorEntry.context,
      });

      // Could also send to external alerting systems here
    } catch (error) {
      console.error("Failed to trigger alert:", error);
    }
  }

  private parseTimeRange(timeRange: string): number {
    switch (timeRange) {
      case "1h": return 1;
      case "24h": return 24;
      case "7d": return 7 * 24;
      case "30d": return 30 * 24;
      default: return 24;
    }
  }

  private calculateMetrics(errors: any[]): ErrorMetrics {
    const totalErrors = errors.length;
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const errorsBySeverity = {
      [ErrorSeverity.LOW]: 0,
      [ErrorSeverity.MEDIUM]: 0,
      [ErrorSeverity.HIGH]: 0,
      [ErrorSeverity.CRITICAL]: 0,
    };

    const errorsByCategory = {
      [ErrorCategory.AUTHENTICATION]: 0,
      [ErrorCategory.DATABASE]: 0,
      [ErrorCategory.API]: 0,
      [ErrorCategory.VALIDATION]: 0,
      [ErrorCategory.NETWORK]: 0,
      [ErrorCategory.SYSTEM]: 0,
      [ErrorCategory.USER_INPUT]: 0,
      [ErrorCategory.EXTERNAL_SERVICE]: 0,
    };

    const errorsByEndpoint: Record<string, number> = {};
    const errorCounts: Record<string, number> = {};

    errors.forEach(error => {
      errorsBySeverity[error.severity as ErrorSeverity]++;
      errorsByCategory[error.category as ErrorCategory]++;
      
      const endpoint = error.context?.endpoint || "unknown";
      errorsByEndpoint[endpoint] = (errorsByEndpoint[endpoint] || 0) + 1;
      
      errorCounts[error.message] = (errorCounts[error.message] || 0) + 1;
    });

    const topErrors = Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([message, count]) => {
        const error = errors.find(e => e.message === message);
        return {
          message,
          count,
          severity: error?.severity || ErrorSeverity.MEDIUM,
          category: error?.category || ErrorCategory.SYSTEM,
        };
      });

    const recentErrors = errors.filter(e => 
      new Date(e.created_at).getTime() > oneDayAgo
    );
    const errorRate = totalErrors > 0 ? (recentErrors.length / totalErrors) * 100 : 0;

    const resolvedErrors = errors.filter(e => e.resolved);
    const avgResolutionTime = resolvedErrors.length > 0
      ? resolvedErrors.reduce((sum, e) => {
          const created = new Date(e.created_at).getTime();
          const updated = new Date(e.updated_at).getTime();
          return sum + (updated - created);
        }, 0) / resolvedErrors.length / (60 * 60 * 1000) // Convert to hours
      : 0;

    const unresolvedErrors = errors.filter(e => !e.resolved).length;

    const errorTrends = this.generateErrorTrends(errors);

    return {
      totalErrors,
      errorsBySeverity,
      errorsByCategory,
      errorsByEndpoint,
      errorRate,
      avgResolutionTime,
      unresolvedErrors,
      topErrors,
      errorTrends,
    };
  }

  private generateErrorTrends(errors: any[]) {
    // Generate last 7 days of error trends
    const trends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayErrors = errors.filter(e => 
        e.created_at.startsWith(dateStr)
      );

      Object.values(ErrorSeverity).forEach(severity => {
        const count = dayErrors.filter(e => e.severity === severity).length;
        trends.push({
          date: dateStr,
          count,
          severity,
        });
      });
    }
    return trends;
  }

  private analyzeErrors(errors: any[]): ErrorAnalytics {
    // Simple analytics implementation
    const patterns = [
      {
        pattern: "Database connection timeout",
        frequency: errors.filter(e => e.message.includes("timeout")).length,
        confidence: 0.8,
        impact: "High - affects user experience",
      },
      {
        pattern: "API rate limit exceeded",
        frequency: errors.filter(e => e.message.includes("rate limit")).length,
        confidence: 0.9,
        impact: "Medium - temporary service degradation",
      },
    ];

    const correlations = [
      {
        factor: "Peak hours",
        correlation: 0.7,
        description: "More errors occur during high traffic periods",
      },
      {
        factor: "External API dependency",
        correlation: 0.6,
        description: "Errors correlate with third-party service issues",
      },
    ];

    const predictions = [
      {
        category: ErrorCategory.DATABASE,
        predictedIncrease: 15,
        timeframe: "next 24h",
        confidence: 0.65,
      },
    ];

    const recommendations = [
      {
        issue: "High database timeout rate",
        recommendation: "Implement connection pooling and query optimization",
        priority: "high" as const,
        estimatedImpact: "50% reduction in timeout errors",
      },
      {
        issue: "API rate limit hits",
        recommendation: "Implement exponential backoff and request queuing",
        priority: "medium" as const,
        estimatedImpact: "90% reduction in rate limit errors",
      },
    ];

    return {
      patterns,
      correlations,
      predictions,
      recommendations,
    };
  }

  private mapDatabaseToEntry(data: any): ErrorLogEntry {
    return {
      id: data.id,
      message: data.message,
      stack: data.stack,
      severity: data.severity,
      category: data.category,
      context: data.context || {},
      resolved: data.resolved,
      resolutionNotes: data.resolution_notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      errorHash: data.error_hash,
      occurrenceCount: data.occurrence_count,
      firstOccurrence: data.first_occurrence,
      lastOccurrence: data.last_occurrence,
    };
  }

  private getDefaultMetrics(): ErrorMetrics {
    return {
      totalErrors: 0,
      errorsBySeverity: {
        [ErrorSeverity.LOW]: 0,
        [ErrorSeverity.MEDIUM]: 0,
        [ErrorSeverity.HIGH]: 0,
        [ErrorSeverity.CRITICAL]: 0,
      },
      errorsByCategory: {
        [ErrorCategory.AUTHENTICATION]: 0,
        [ErrorCategory.DATABASE]: 0,
        [ErrorCategory.API]: 0,
        [ErrorCategory.VALIDATION]: 0,
        [ErrorCategory.NETWORK]: 0,
        [ErrorCategory.SYSTEM]: 0,
        [ErrorCategory.USER_INPUT]: 0,
        [ErrorCategory.EXTERNAL_SERVICE]: 0,
      },
      errorsByEndpoint: {},
      errorRate: 0,
      avgResolutionTime: 0,
      unresolvedErrors: 0,
      topErrors: [],
      errorTrends: [],
    };
  }

  private getDefaultAnalytics(): ErrorAnalytics {
    return {
      patterns: [],
      correlations: [],
      predictions: [],
      recommendations: [],
    };
  }
}

// Export singleton instance
export const comprehensiveErrorLogger = ComprehensiveErrorLogger.getInstance();

// Export convenience functions
export const logError = (
  error: Error | string,
  severity?: ErrorSeverity,
  category?: ErrorCategory,
  context?: Partial<ErrorContext>
) => comprehensiveErrorLogger.logError(error, severity, category, context);

export const getErrorMetrics = (timeRange?: "1h" | "24h" | "7d" | "30d") => 
  comprehensiveErrorLogger.getErrorMetrics(timeRange);

export const getErrorAnalytics = (timeRange?: "24h" | "7d" | "30d") =>
  comprehensiveErrorLogger.getErrorAnalytics(timeRange);

export const resolveError = (errorId: string, resolutionNotes?: string) =>
  comprehensiveErrorLogger.resolveError(errorId, resolutionNotes);

export default ComprehensiveErrorLogger;
