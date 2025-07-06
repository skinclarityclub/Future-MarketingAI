/**
 * Error Detection & Classification Engine
 * Task 62.1: Intelligent error detection with categorization and severity levels
 *
 * Centralized error detection system that automatically detects, categorizes,
 * and assigns severity levels to errors across the entire application.
 */

import { logger, LogLevel, LogCategory } from "../logger";
import {
  ErrorType,
  ErrorSeverity,
  ErrorContext,
  ErrorDetails,
} from "../telegram/error-handler";

// Extended error categories for comprehensive classification
export enum ExtendedErrorType {
  // Application errors
  APPLICATION_STARTUP = "application_startup",
  APPLICATION_SHUTDOWN = "application_shutdown",
  CONFIGURATION = "configuration",
  DEPENDENCY_INJECTION = "dependency_injection",

  // API & Network errors
  API_ENDPOINT = "api_endpoint",
  EXTERNAL_SERVICE = "external_service",
  WEBHOOK_PROCESSING = "webhook_processing",
  HTTP_CLIENT = "http_client",

  // Data & Business Logic errors
  DATA_VALIDATION = "data_validation",
  BUSINESS_RULE_VIOLATION = "business_rule_violation",
  DATA_TRANSFORMATION = "data_transformation",
  WORKFLOW_EXECUTION = "workflow_execution",

  // Infrastructure errors
  MEMORY_LEAK = "memory_leak",
  PERFORMANCE_DEGRADATION = "performance_degradation",
  RESOURCE_EXHAUSTION = "resource_exhaustion",
  CIRCUIT_BREAKER = "circuit_breaker",

  // Security errors
  SECURITY_BREACH = "security_breach",
  SUSPICIOUS_ACTIVITY = "suspicious_activity",
  PERMISSION_ESCALATION = "permission_escalation",

  // User Experience errors
  UI_RENDERING = "ui_rendering",
  USER_INTERACTION = "user_interaction",
  ACCESSIBILITY = "accessibility",
}

export interface ErrorPattern {
  id: string;
  name: string;
  description: string;
  pattern: RegExp | string;
  errorType: ErrorType | ExtendedErrorType;
  severity: ErrorSeverity;
  tags: string[];
  confidence: number; // 0-1 confidence score
  actionRequired: boolean;
  autoRecoverable: boolean;
}

export interface ErrorClassification {
  errorId: string;
  type: ErrorType | ExtendedErrorType;
  severity: ErrorSeverity;
  confidence: number;
  patterns: ErrorPattern[];
  tags: string[];
  category: string;
  subcategory?: string;
  businessImpact: "low" | "medium" | "high" | "critical";
  userImpact: "none" | "minimal" | "moderate" | "severe";
  technicalComplexity: "simple" | "moderate" | "complex" | "expert";
  estimatedResolutionTime: number; // in minutes
}

export interface ErrorDetectionMetrics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  averageDetectionTime: number;
  classificationAccuracy: number;
  falsePositives: number;
  falseNegatives: number;
}

export class ErrorDetectionEngine {
  private static instance: ErrorDetectionEngine;
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private recentErrors: Map<string, ErrorDetails[]> = new Map();
  private errorFrequency: Map<string, number> = new Map();
  private detectionMetrics: ErrorDetectionMetrics;
  private isInitialized = false;

  private constructor() {
    this.detectionMetrics = {
      totalErrors: 0,
      errorsByType: {},
      errorsBySeverity: {},
      averageDetectionTime: 0,
      classificationAccuracy: 0,
      falsePositives: 0,
      falseNegatives: 0,
    };
  }

  public static getInstance(): ErrorDetectionEngine {
    if (!ErrorDetectionEngine.instance) {
      ErrorDetectionEngine.instance = new ErrorDetectionEngine();
    }
    return ErrorDetectionEngine.instance;
  }

  /**
   * Initialize the error detection engine with predefined patterns
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    logger.info("Initializing Error Detection Engine...", {
      category: LogCategory.SYSTEM,
      component: "error_detection_engine",
    });

    await this.loadErrorPatterns();
    await this.initializeMonitoring();

    this.isInitialized = true;

    logger.info("Error Detection Engine initialized successfully", {
      category: LogCategory.SYSTEM,
      component: "error_detection_engine",
      patterns_loaded: this.errorPatterns.size,
    });
  }

  /**
   * Detect and classify errors from various sources
   */
  public async detectError(
    error: Error | any,
    context: Partial<ErrorContext> = {}
  ): Promise<ErrorClassification> {
    const startTime = Date.now();

    try {
      // Generate unique error ID
      const errorId = this.generateErrorId(error, context);

      // Extract error information
      const errorInfo = this.extractErrorInfo(error);

      // Classify the error using pattern matching
      const classification = await this.classifyError(
        errorInfo,
        context,
        errorId
      );

      // Update detection metrics
      this.updateDetectionMetrics(classification, Date.now() - startTime);

      // Store for pattern analysis
      this.storeErrorForAnalysis(classification, errorInfo);

      // Log the detection
      await this.logErrorDetection(classification, errorInfo);

      return classification;
    } catch (detectionError) {
      logger.error("Error in error detection process", detectionError, {
        category: LogCategory.SYSTEM,
        component: "error_detection_engine",
      });

      // Return a fallback classification
      return this.createFallbackClassification(error, context);
    }
  }

  /**
   * Analyze error patterns for proactive issue identification
   */
  public async analyzeErrorPatterns(): Promise<{
    trends: Array<{
      pattern: string;
      frequency: number;
      trend: "increasing" | "decreasing" | "stable";
      severity: ErrorSeverity;
    }>;
    anomalies: Array<{
      type: string;
      description: string;
      severity: ErrorSeverity;
      recommendation: string;
    }>;
    predictions: Array<{
      errorType: string;
      probability: number;
      timeframe: string;
      preventionActions: string[];
    }>;
  }> {
    const analysis = {
      trends: [] as any[],
      anomalies: [] as any[],
      predictions: [] as any[],
    };

    // Analyze error frequency trends
    for (const [errorType, frequency] of Array.from(
      this.errorFrequency.entries()
    )) {
      const recentErrors = this.recentErrors.get(errorType) || [];
      const trend = this.calculateTrend(recentErrors);

      analysis.trends.push({
        pattern: errorType,
        frequency,
        trend,
        severity: this.determineTrendSeverity(frequency, trend),
      });
    }

    // Detect anomalies
    analysis.anomalies = await this.detectAnomalies();

    // Generate predictions
    analysis.predictions = await this.generatePredictions();

    logger.info("Error pattern analysis completed", {
      category: LogCategory.SYSTEM,
      component: "error_detection_engine",
      trends_count: analysis.trends.length,
      anomalies_count: analysis.anomalies.length,
      predictions_count: analysis.predictions.length,
    });

    return analysis;
  }

  /**
   * Get real-time error detection metrics
   */
  public getDetectionMetrics(): ErrorDetectionMetrics {
    return { ...this.detectionMetrics };
  }

  /**
   * Add custom error pattern for detection
   */
  public addErrorPattern(pattern: ErrorPattern): void {
    this.errorPatterns.set(pattern.id, pattern);

    logger.info("Custom error pattern added", {
      category: LogCategory.SYSTEM,
      component: "error_detection_engine",
      pattern_id: pattern.id,
      pattern_name: pattern.name,
    });
  }

  /**
   * Remove error pattern
   */
  public removeErrorPattern(patternId: string): boolean {
    const removed = this.errorPatterns.delete(patternId);

    if (removed) {
      logger.info("Error pattern removed", {
        category: LogCategory.SYSTEM,
        component: "error_detection_engine",
        pattern_id: patternId,
      });
    }

    return removed;
  }

  /**
   * Load predefined error patterns
   */
  private async loadErrorPatterns(): Promise<void> {
    const patterns: ErrorPattern[] = [
      // Database errors
      {
        id: "db_connection_timeout",
        name: "Database Connection Timeout",
        description: "Database connection timeout or unavailable",
        pattern:
          /connection.*timeout|connect.*econnrefused|database.*unavailable/i,
        errorType: ErrorType.DATABASE,
        severity: ErrorSeverity.HIGH,
        tags: ["database", "connection", "timeout"],
        confidence: 0.9,
        actionRequired: true,
        autoRecoverable: true,
      },

      // API errors
      {
        id: "rate_limit_exceeded",
        name: "Rate Limit Exceeded",
        description: "API rate limit has been exceeded",
        pattern: /rate.*limit|too.*many.*requests|429/i,
        errorType: ErrorType.RATE_LIMIT,
        severity: ErrorSeverity.MEDIUM,
        tags: ["api", "rate_limit", "throttling"],
        confidence: 0.95,
        actionRequired: false,
        autoRecoverable: true,
      },

      // Authentication errors
      {
        id: "auth_token_expired",
        name: "Authentication Token Expired",
        description: "Authentication token has expired",
        pattern: /token.*expired|unauthorized|401.*auth/i,
        errorType: ErrorType.AUTHENTICATION,
        severity: ErrorSeverity.MEDIUM,
        tags: ["authentication", "token", "expired"],
        confidence: 0.85,
        actionRequired: true,
        autoRecoverable: true,
      },

      // Memory errors
      {
        id: "memory_leak",
        name: "Memory Leak Detected",
        description: "Potential memory leak or high memory usage",
        pattern: /out.*of.*memory|heap.*overflow|memory.*leak/i,
        errorType: ExtendedErrorType.MEMORY_LEAK,
        severity: ErrorSeverity.CRITICAL,
        tags: ["memory", "performance", "leak"],
        confidence: 0.8,
        actionRequired: true,
        autoRecoverable: false,
      },

      // Security errors
      {
        id: "suspicious_activity",
        name: "Suspicious Activity Detected",
        description: "Potentially malicious activity detected",
        pattern: /sql.*injection|xss.*attack|suspicious.*pattern/i,
        errorType: ExtendedErrorType.SUSPICIOUS_ACTIVITY,
        severity: ErrorSeverity.CRITICAL,
        tags: ["security", "attack", "malicious"],
        confidence: 0.7,
        actionRequired: true,
        autoRecoverable: false,
      },

      // Validation errors
      {
        id: "data_validation_failed",
        name: "Data Validation Failed",
        description: "Input data validation failed",
        pattern: /validation.*failed|invalid.*input|schema.*error/i,
        errorType: ErrorType.VALIDATION,
        severity: ErrorSeverity.LOW,
        tags: ["validation", "input", "data"],
        confidence: 0.9,
        actionRequired: false,
        autoRecoverable: true,
      },

      // Network errors
      {
        id: "network_connectivity",
        name: "Network Connectivity Issues",
        description: "Network connectivity problems",
        pattern: /network.*error|connection.*refused|timeout.*error/i,
        errorType: ErrorType.NETWORK,
        severity: ErrorSeverity.HIGH,
        tags: ["network", "connectivity", "timeout"],
        confidence: 0.85,
        actionRequired: true,
        autoRecoverable: true,
      },

      // Workflow errors
      {
        id: "workflow_execution_failed",
        name: "Workflow Execution Failed",
        description: "N8N workflow execution failed",
        pattern: /workflow.*failed|n8n.*error|execution.*error/i,
        errorType: ExtendedErrorType.WORKFLOW_EXECUTION,
        severity: ErrorSeverity.HIGH,
        tags: ["workflow", "n8n", "execution"],
        confidence: 0.9,
        actionRequired: true,
        autoRecoverable: true,
      },
    ];

    patterns.forEach(pattern => {
      this.errorPatterns.set(pattern.id, pattern);
    });
  }

  /**
   * Extract relevant information from error object
   */
  private extractErrorInfo(error: any): {
    message: string;
    stack?: string;
    name?: string;
    code?: string;
    statusCode?: number;
    type?: string;
  } {
    if (error instanceof Error) {
      return {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: (error as any).code,
        statusCode: (error as any).statusCode,
        type: error.constructor.name,
      };
    }

    if (typeof error === "string") {
      return { message: error };
    }

    if (typeof error === "object" && error !== null) {
      return {
        message: error.message || JSON.stringify(error),
        stack: error.stack,
        name: error.name,
        code: error.code,
        statusCode: error.statusCode,
        type: error.type || typeof error,
      };
    }

    return { message: String(error) };
  }

  /**
   * Classify error using pattern matching and ML-like logic
   */
  private async classifyError(
    errorInfo: any,
    context: Partial<ErrorContext>,
    errorId: string
  ): Promise<ErrorClassification> {
    const matchedPatterns: ErrorPattern[] = [];
    let bestMatch: ErrorPattern | null = null;
    let highestConfidence = 0;

    // Pattern matching
    for (const pattern of Array.from(this.errorPatterns.values())) {
      const confidence = this.calculatePatternMatch(errorInfo, pattern);

      if (confidence > 0.5) {
        matchedPatterns.push({ ...pattern, confidence });

        if (confidence > highestConfidence) {
          highestConfidence = confidence;
          bestMatch = pattern;
        }
      }
    }

    // Determine classification based on best match or fallback
    const classification: ErrorClassification = {
      errorId,
      type: bestMatch?.errorType || ErrorType.INTERNAL,
      severity: bestMatch?.severity || this.inferSeverity(errorInfo),
      confidence: highestConfidence,
      patterns: matchedPatterns,
      tags: this.extractTags(errorInfo, matchedPatterns),
      category: this.determineCategory(
        bestMatch?.errorType || ErrorType.INTERNAL
      ),
      businessImpact: this.assessBusinessImpact(
        bestMatch?.errorType || ErrorType.INTERNAL
      ),
      userImpact: this.assessUserImpact(
        bestMatch?.errorType || ErrorType.INTERNAL
      ),
      technicalComplexity: this.assessTechnicalComplexity(
        bestMatch?.errorType || ErrorType.INTERNAL
      ),
      estimatedResolutionTime: this.estimateResolutionTime(
        bestMatch?.errorType || ErrorType.INTERNAL
      ),
    };

    return classification;
  }

  /**
   * Calculate pattern match confidence
   */
  private calculatePatternMatch(errorInfo: any, pattern: ErrorPattern): number {
    let confidence = 0;
    const searchText =
      `${errorInfo.message} ${errorInfo.stack || ""} ${errorInfo.name || ""}`.toLowerCase();

    if (pattern.pattern instanceof RegExp) {
      if (pattern.pattern.test(searchText)) {
        confidence = pattern.confidence;
      }
    } else if (typeof pattern.pattern === "string") {
      if (searchText.includes(pattern.pattern.toLowerCase())) {
        confidence = pattern.confidence;
      }
    }

    // Boost confidence based on context
    if (
      errorInfo.statusCode &&
      pattern.tags.includes("api") &&
      [400, 401, 403, 429, 500, 502, 503].includes(errorInfo.statusCode)
    ) {
      confidence *= 1.2;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(error: any, context: Partial<ErrorContext>): string {
    const timestamp = Date.now();
    const errorHash = this.hashError(error);
    const contextHash = this.hashContext(context);

    return `err_${timestamp}_${errorHash}_${contextHash}`.substring(0, 32);
  }

  /**
   * Hash error for ID generation
   */
  private hashError(error: any): string {
    const errorString = JSON.stringify({
      message: error?.message || String(error),
      name: error?.name,
      code: error?.code,
    });

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < errorString.length; i++) {
      const char = errorString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(36);
  }

  /**
   * Hash context for ID generation
   */
  private hashContext(context: Partial<ErrorContext>): string {
    const contextString = JSON.stringify({
      userId: context.userId,
      action: context.action,
      resource: context.resource,
    });

    return contextString.length.toString(36);
  }

  /**
   * Infer severity when no pattern matches
   */
  private inferSeverity(errorInfo: any): ErrorSeverity {
    if (errorInfo.statusCode >= 500) return ErrorSeverity.HIGH;
    if (errorInfo.statusCode >= 400) return ErrorSeverity.MEDIUM;
    if (errorInfo.message?.toLowerCase().includes("critical"))
      return ErrorSeverity.CRITICAL;
    if (errorInfo.message?.toLowerCase().includes("warning"))
      return ErrorSeverity.LOW;

    return ErrorSeverity.MEDIUM;
  }

  /**
   * Extract relevant tags from error and patterns
   */
  private extractTags(errorInfo: any, patterns: ErrorPattern[]): string[] {
    const tags = new Set<string>();

    patterns.forEach(pattern => {
      pattern.tags.forEach(tag => tags.add(tag));
    });

    // Add contextual tags
    if (errorInfo.statusCode) tags.add("http");
    if (errorInfo.stack) tags.add("exception");
    if (errorInfo.code) tags.add("coded_error");

    return Array.from(tags);
  }

  /**
   * Determine error category
   */
  private determineCategory(errorType: ErrorType | ExtendedErrorType): string {
    const categoryMap: Record<string, string> = {
      [ErrorType.AUTHENTICATION]: "Security",
      [ErrorType.AUTHORIZATION]: "Security",
      [ErrorType.VALIDATION]: "Data",
      [ErrorType.DATABASE]: "Infrastructure",
      [ErrorType.NETWORK]: "Infrastructure",
      [ErrorType.AI_SERVICE]: "External Services",
      [ExtendedErrorType.WORKFLOW_EXECUTION]: "Business Logic",
      [ExtendedErrorType.MEMORY_LEAK]: "Performance",
      [ExtendedErrorType.SECURITY_BREACH]: "Security",
    };

    return categoryMap[errorType] || "General";
  }

  /**
   * Assess business impact
   */
  private assessBusinessImpact(
    errorType: ErrorType | ExtendedErrorType
  ): "low" | "medium" | "high" | "critical" {
    const impactMap: Record<string, "low" | "medium" | "high" | "critical"> = {
      [ErrorType.DATABASE]: "critical",
      [ExtendedErrorType.SECURITY_BREACH]: "critical",
      [ExtendedErrorType.WORKFLOW_EXECUTION]: "high",
      [ErrorType.AUTHENTICATION]: "high",
      [ErrorType.NETWORK]: "medium",
      [ErrorType.VALIDATION]: "low",
    };

    return impactMap[errorType] || "medium";
  }

  /**
   * Assess user impact
   */
  private assessUserImpact(
    errorType: ErrorType | ExtendedErrorType
  ): "none" | "minimal" | "moderate" | "severe" {
    const impactMap: Record<
      string,
      "none" | "minimal" | "moderate" | "severe"
    > = {
      [ErrorType.DATABASE]: "severe",
      [ErrorType.AUTHENTICATION]: "severe",
      [ExtendedErrorType.UI_RENDERING]: "severe",
      [ErrorType.NETWORK]: "moderate",
      [ErrorType.VALIDATION]: "minimal",
      [ExtendedErrorType.MEMORY_LEAK]: "moderate",
    };

    return impactMap[errorType] || "moderate";
  }

  /**
   * Assess technical complexity
   */
  private assessTechnicalComplexity(
    errorType: ErrorType | ExtendedErrorType
  ): "simple" | "moderate" | "complex" | "expert" {
    const complexityMap: Record<
      string,
      "simple" | "moderate" | "complex" | "expert"
    > = {
      [ErrorType.VALIDATION]: "simple",
      [ErrorType.AUTHENTICATION]: "moderate",
      [ErrorType.DATABASE]: "complex",
      [ExtendedErrorType.MEMORY_LEAK]: "expert",
      [ExtendedErrorType.SECURITY_BREACH]: "expert",
    };

    return complexityMap[errorType] || "moderate";
  }

  /**
   * Estimate resolution time in minutes
   */
  private estimateResolutionTime(
    errorType: ErrorType | ExtendedErrorType
  ): number {
    const timeMap: Record<string, number> = {
      [ErrorType.VALIDATION]: 15,
      [ErrorType.AUTHENTICATION]: 30,
      [ErrorType.RATE_LIMIT]: 5,
      [ErrorType.NETWORK]: 60,
      [ErrorType.DATABASE]: 120,
      [ExtendedErrorType.WORKFLOW_EXECUTION]: 45,
      [ExtendedErrorType.MEMORY_LEAK]: 240,
      [ExtendedErrorType.SECURITY_BREACH]: 480,
    };

    return timeMap[errorType] || 60;
  }

  /**
   * Create fallback classification for unhandled errors
   */
  private createFallbackClassification(
    error: any,
    context: Partial<ErrorContext>
  ): ErrorClassification {
    return {
      errorId: `fallback_${Date.now()}`,
      type: ErrorType.INTERNAL,
      severity: ErrorSeverity.MEDIUM,
      confidence: 0.1,
      patterns: [],
      tags: ["unclassified", "fallback"],
      category: "General",
      businessImpact: "medium",
      userImpact: "moderate",
      technicalComplexity: "moderate",
      estimatedResolutionTime: 60,
    };
  }

  /**
   * Initialize monitoring and background processes
   */
  private async initializeMonitoring(): Promise<void> {
    // Set up periodic pattern analysis
    setInterval(
      async () => {
        try {
          await this.analyzeErrorPatterns();
        } catch (error) {
          logger.error("Error in periodic pattern analysis", error, {
            category: LogCategory.SYSTEM,
            component: "error_detection_engine",
          });
        }
      },
      5 * 60 * 1000
    ); // Every 5 minutes

    // Clean up old error data
    setInterval(
      () => {
        this.cleanupOldErrors();
      },
      60 * 60 * 1000
    ); // Every hour
  }

  /**
   * Update detection metrics
   */
  private updateDetectionMetrics(
    classification: ErrorClassification,
    detectionTime: number
  ): void {
    this.detectionMetrics.totalErrors++;
    this.detectionMetrics.errorsByType[classification.type] =
      (this.detectionMetrics.errorsByType[classification.type] || 0) + 1;
    this.detectionMetrics.errorsBySeverity[classification.severity] =
      (this.detectionMetrics.errorsBySeverity[classification.severity] || 0) +
      1;

    // Update average detection time
    const currentAvg = this.detectionMetrics.averageDetectionTime;
    const totalErrors = this.detectionMetrics.totalErrors;
    this.detectionMetrics.averageDetectionTime =
      (currentAvg * (totalErrors - 1) + detectionTime) / totalErrors;
  }

  /**
   * Store error for pattern analysis
   */
  private storeErrorForAnalysis(
    classification: ErrorClassification,
    errorInfo: any
  ): void {
    const errorType = classification.type;

    if (!this.recentErrors.has(errorType)) {
      this.recentErrors.set(errorType, []);
    }

    const errors = this.recentErrors.get(errorType)!;
    errors.push({
      type: classification.type as ErrorType,
      severity: classification.severity,
      message: errorInfo.message,
      originalError: errorInfo,
      context: {
        timestamp: new Date(),
        requestId: classification.errorId,
      },
    } as ErrorDetails);

    // Keep only recent errors (last 100)
    if (errors.length > 100) {
      errors.splice(0, errors.length - 100);
    }

    // Update frequency
    this.errorFrequency.set(
      errorType,
      (this.errorFrequency.get(errorType) || 0) + 1
    );
  }

  /**
   * Log error detection
   */
  private async logErrorDetection(
    classification: ErrorClassification,
    errorInfo: any
  ): Promise<void> {
    logger.info("Error detected and classified", {
      category: LogCategory.SYSTEM,
      component: "error_detection_engine",
      error_id: classification.errorId,
      error_type: classification.type,
      severity: classification.severity,
      confidence: classification.confidence,
      business_impact: classification.businessImpact,
      user_impact: classification.userImpact,
      estimated_resolution_time: classification.estimatedResolutionTime,
      tags: classification.tags,
      patterns_matched: classification.patterns.length,
    });
  }

  /**
   * Calculate trend for error frequency
   */
  private calculateTrend(
    errors: ErrorDetails[]
  ): "increasing" | "decreasing" | "stable" {
    if (errors.length < 10) return "stable";

    const recent = errors.slice(-5);
    const older = errors.slice(-10, -5);

    const recentAvg = recent.length;
    const olderAvg = older.length;

    if (recentAvg > olderAvg * 1.2) return "increasing";
    if (recentAvg < olderAvg * 0.8) return "decreasing";
    return "stable";
  }

  /**
   * Determine trend severity
   */
  private determineTrendSeverity(
    frequency: number,
    trend: string
  ): ErrorSeverity {
    if (trend === "increasing" && frequency > 50) return ErrorSeverity.HIGH;
    if (trend === "increasing" && frequency > 20) return ErrorSeverity.MEDIUM;
    return ErrorSeverity.LOW;
  }

  /**
   * Detect anomalies in error patterns
   */
  private async detectAnomalies(): Promise<
    Array<{
      type: string;
      description: string;
      severity: ErrorSeverity;
      recommendation: string;
    }>
  > {
    const anomalies = [];

    // Check for sudden spikes
    for (const [errorType, frequency] of Array.from(
      this.errorFrequency.entries()
    )) {
      if (frequency > 100) {
        anomalies.push({
          type: "frequency_spike",
          description: `Unusual spike in ${errorType} errors (${frequency} occurrences)`,
          severity: ErrorSeverity.HIGH,
          recommendation: "Investigate root cause and implement mitigation",
        });
      }
    }

    return anomalies;
  }

  /**
   * Generate predictions based on error patterns
   */
  private async generatePredictions(): Promise<
    Array<{
      errorType: string;
      probability: number;
      timeframe: string;
      preventionActions: string[];
    }>
  > {
    const predictions = [];

    // Simple prediction based on trends
    for (const [errorType, frequency] of Array.from(
      this.errorFrequency.entries()
    )) {
      const errors = this.recentErrors.get(errorType) || [];
      const trend = this.calculateTrend(errors);

      if (trend === "increasing" && frequency > 10) {
        predictions.push({
          errorType,
          probability: Math.min(0.8, frequency / 100),
          timeframe: "24 hours",
          preventionActions: [
            "Monitor system resources",
            "Review recent deployments",
            "Check external service status",
          ],
        });
      }
    }

    return predictions;
  }

  /**
   * Clean up old error data
   */
  private cleanupOldErrors(): void {
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago

    for (const [errorType, errors] of Array.from(this.recentErrors.entries())) {
      const filteredErrors = errors.filter(
        error =>
          error.context.timestamp &&
          error.context.timestamp.getTime() > cutoffTime
      );

      if (filteredErrors.length === 0) {
        this.recentErrors.delete(errorType);
        this.errorFrequency.delete(errorType);
      } else {
        this.recentErrors.set(errorType, filteredErrors);
        this.errorFrequency.set(errorType, filteredErrors.length);
      }
    }
  }
}

// Export singleton instance
export const errorDetectionEngine = ErrorDetectionEngine.getInstance();

// Export helper functions
export const detectError = (
  error: Error | any,
  context?: Partial<ErrorContext>
) => errorDetectionEngine.detectError(error, context);

export const analyzeErrorPatterns = () =>
  errorDetectionEngine.analyzeErrorPatterns();

export const getErrorMetrics = () => errorDetectionEngine.getDetectionMetrics();
