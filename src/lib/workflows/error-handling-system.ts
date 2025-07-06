/**
 * Task 71.10: Advanced Workflow Error Handling System
 * Comprehensive error management with automatic recovery, classification, and resolution
 */

import { logger } from "@/lib/logger";
import {
  auditTrailSystem,
  AuditEventType,
  SecurityEvent,
} from "./audit-trail-system";

// Error Classifications
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum ErrorCategory {
  NETWORK = "network",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  VALIDATION = "validation",
  BUSINESS_LOGIC = "business_logic",
  EXTERNAL_API = "external_api",
  DATABASE = "database",
  TIMEOUT = "timeout",
  RATE_LIMIT = "rate_limit",
  SYSTEM = "system",
  UNKNOWN = "unknown",
}

export enum RecoveryStrategy {
  RETRY = "retry",
  FALLBACK = "fallback",
  SKIP = "skip",
  ESCALATE = "escalate",
  MANUAL_INTERVENTION = "manual_intervention",
  CIRCUIT_BREAKER = "circuit_breaker",
}

// Error Context Interface
export interface ErrorContext {
  workflow_id: string;
  execution_id: string;
  node_id: string;
  node_name: string;
  error: Error;
  input_data?: any;
  node_config?: any;
  retry_count: number;
  max_retries: number;
  user_id?: string;
  timestamp: string;
  environment: string;
  correlation_id?: string;
}

// Error Classification Result
export interface ErrorClassification {
  category: ErrorCategory;
  severity: ErrorSeverity;
  is_transient: boolean;
  is_recoverable: boolean;
  recommended_strategy: RecoveryStrategy;
  estimated_recovery_time?: number;
  business_impact: "low" | "medium" | "high" | "critical";
  requires_user_intervention: boolean;
}

// Recovery Action Result
export interface RecoveryResult {
  success: boolean;
  strategy_used: RecoveryStrategy;
  recovery_time: number;
  new_error?: Error;
  fallback_data?: any;
  requires_manual_review: boolean;
  next_action?: string;
}

// Circuit Breaker State
interface CircuitBreakerState {
  failure_count: number;
  last_failure: Date;
  state: "closed" | "open" | "half_open";
  next_attempt: Date;
}

class WorkflowErrorHandler {
  private circuitBreakers = new Map<string, CircuitBreakerState>();
  private errorPatterns = new Map<string, ErrorPattern>();
  private recoveryHistory = new Map<string, RecoveryAttempt[]>();

  constructor() {
    this.initializeErrorPatterns();
  }

  // Main error handling entry point
  async handleWorkflowError(context: ErrorContext): Promise<RecoveryResult> {
    try {
      // Log the error occurrence
      logger.error("Workflow error detected", context.error, {
        workflow_id: context.workflow_id,
        execution_id: context.execution_id,
        node_id: context.node_id,
        retry_count: context.retry_count,
      });

      // Record audit trail
      await this.recordErrorAudit(context);

      // Classify the error
      const classification = await this.classifyError(context);

      // Check circuit breaker
      if (await this.isCircuitBreakerOpen(context, classification)) {
        return this.createFailedRecovery(
          RecoveryStrategy.CIRCUIT_BREAKER,
          "Circuit breaker is open"
        );
      }

      // Determine and execute recovery strategy
      const recoveryResult = await this.executeRecoveryStrategy(
        context,
        classification
      );

      // Update circuit breaker state
      await this.updateCircuitBreaker(context, recoveryResult.success);

      // Record recovery attempt
      await this.recordRecoveryAttempt(context, classification, recoveryResult);

      // Check for escalation conditions
      await this.checkEscalationConditions(
        context,
        classification,
        recoveryResult
      );

      return recoveryResult;
    } catch (handlingError) {
      logger.error("Error in error handling system", handlingError as Error, {
        original_error: context.error.message,
        workflow_id: context.workflow_id,
      });

      return this.createFailedRecovery(
        RecoveryStrategy.MANUAL_INTERVENTION,
        "Error handling system failure"
      );
    }
  }

  // Error classification using patterns and ML
  async classifyError(context: ErrorContext): Promise<ErrorClassification> {
    const error = context.error;
    const errorMessage = error.message.toLowerCase();
    const stackTrace = error.stack || "";

    // Check known error patterns
    for (const [pattern, classification] of this.errorPatterns) {
      if (this.matchesPattern(errorMessage, stackTrace, pattern)) {
        return classification;
      }
    }

    // Classify based on error characteristics
    const category = this.categorizeError(error, context);
    const severity = this.assessSeverity(error, context);
    const isTransient = this.isTransientError(error, context);
    const isRecoverable = this.isRecoverableError(error, context);
    const businessImpact = this.assessBusinessImpact(context, severity);

    return {
      category,
      severity,
      is_transient: isTransient,
      is_recoverable: isRecoverable,
      recommended_strategy: this.recommendRecoveryStrategy(
        category,
        severity,
        isTransient
      ),
      estimated_recovery_time: this.estimateRecoveryTime(category, isTransient),
      business_impact: businessImpact,
      requires_user_intervention:
        !isRecoverable || severity === ErrorSeverity.CRITICAL,
    };
  }

  // Execute recovery strategy
  async executeRecoveryStrategy(
    context: ErrorContext,
    classification: ErrorClassification
  ): Promise<RecoveryResult> {
    const startTime = Date.now();
    const strategy = classification.recommended_strategy;

    try {
      switch (strategy) {
        case RecoveryStrategy.RETRY:
          return await this.executeRetryStrategy(context, classification);

        case RecoveryStrategy.FALLBACK:
          return await this.executeFallbackStrategy(context, classification);

        case RecoveryStrategy.SKIP:
          return await this.executeSkipStrategy(context, classification);

        case RecoveryStrategy.CIRCUIT_BREAKER:
          return await this.executeCircuitBreakerStrategy(
            context,
            classification
          );

        case RecoveryStrategy.ESCALATE:
          return await this.executeEscalationStrategy(context, classification);

        case RecoveryStrategy.MANUAL_INTERVENTION:
        default:
          return await this.executeManualInterventionStrategy(
            context,
            classification
          );
      }
    } catch (recoveryError) {
      const recoveryTime = Date.now() - startTime;

      logger.error("Recovery strategy failed", recoveryError as Error, {
        strategy,
        workflow_id: context.workflow_id,
        recovery_time: recoveryTime,
      });

      return {
        success: false,
        strategy_used: strategy,
        recovery_time: recoveryTime,
        new_error: recoveryError as Error,
        requires_manual_review: true,
        next_action: "manual_intervention",
      };
    }
  }

  // Retry strategy implementation
  private async executeRetryStrategy(
    context: ErrorContext,
    classification: ErrorClassification
  ): Promise<RecoveryResult> {
    const startTime = Date.now();

    if (context.retry_count >= context.max_retries) {
      return {
        success: false,
        strategy_used: RecoveryStrategy.RETRY,
        recovery_time: Date.now() - startTime,
        requires_manual_review: true,
        next_action: "escalate",
      };
    }

    // Calculate retry delay with exponential backoff
    const delay = this.calculateRetryDelay(context.retry_count, classification);
    await this.sleep(delay);

    // Attempt retry with modified parameters if necessary
    const retryData = await this.prepareRetryData(context, classification);

    return {
      success: true, // Assuming retry will be handled by the workflow engine
      strategy_used: RecoveryStrategy.RETRY,
      recovery_time: Date.now() - startTime,
      fallback_data: retryData,
      requires_manual_review: false,
      next_action: "retry_execution",
    };
  }

  // Fallback strategy implementation
  private async executeFallbackStrategy(
    context: ErrorContext,
    classification: ErrorClassification
  ): Promise<RecoveryResult> {
    const startTime = Date.now();

    try {
      const fallbackData = await this.generateFallbackData(
        context,
        classification
      );

      return {
        success: true,
        strategy_used: RecoveryStrategy.FALLBACK,
        recovery_time: Date.now() - startTime,
        fallback_data: fallbackData,
        requires_manual_review: false,
        next_action: "continue_with_fallback",
      };
    } catch (fallbackError) {
      return {
        success: false,
        strategy_used: RecoveryStrategy.FALLBACK,
        recovery_time: Date.now() - startTime,
        new_error: fallbackError as Error,
        requires_manual_review: true,
        next_action: "manual_intervention",
      };
    }
  }

  // Skip strategy implementation
  private async executeSkipStrategy(
    context: ErrorContext,
    classification: ErrorClassification
  ): Promise<RecoveryResult> {
    const startTime = Date.now();

    logger.warn("Skipping failed node", {
      workflow_id: context.workflow_id,
      node_id: context.node_id,
      reason: "Skip recovery strategy applied",
    });

    return {
      success: true,
      strategy_used: RecoveryStrategy.SKIP,
      recovery_time: Date.now() - startTime,
      requires_manual_review: classification.severity === ErrorSeverity.HIGH,
      next_action: "continue_workflow",
    };
  }

  // Circuit breaker strategy
  private async executeCircuitBreakerStrategy(
    context: ErrorContext,
    classification: ErrorClassification
  ): Promise<RecoveryResult> {
    const startTime = Date.now();

    return {
      success: false,
      strategy_used: RecoveryStrategy.CIRCUIT_BREAKER,
      recovery_time: Date.now() - startTime,
      requires_manual_review: true,
      next_action: "wait_for_circuit_breaker_reset",
    };
  }

  // Escalation strategy
  private async executeEscalationStrategy(
    context: ErrorContext,
    classification: ErrorClassification
  ): Promise<RecoveryResult> {
    const startTime = Date.now();

    // Create escalation ticket
    await this.createEscalationTicket(context, classification);

    // Notify administrators
    await this.notifyAdministrators(context, classification);

    return {
      success: false,
      strategy_used: RecoveryStrategy.ESCALATE,
      recovery_time: Date.now() - startTime,
      requires_manual_review: true,
      next_action: "await_manual_resolution",
    };
  }

  // Manual intervention strategy
  private async executeManualInterventionStrategy(
    context: ErrorContext,
    classification: ErrorClassification
  ): Promise<RecoveryResult> {
    const startTime = Date.now();

    await this.createManualReviewTask(context, classification);

    return {
      success: false,
      strategy_used: RecoveryStrategy.MANUAL_INTERVENTION,
      recovery_time: Date.now() - startTime,
      requires_manual_review: true,
      next_action: "manual_review_required",
    };
  }

  // Circuit breaker management
  private async isCircuitBreakerOpen(
    context: ErrorContext,
    classification: ErrorClassification
  ): Promise<boolean> {
    const key = `${context.workflow_id}:${context.node_id}`;
    const breaker = this.circuitBreakers.get(key);

    if (!breaker) return false;

    if (breaker.state === "open") {
      if (Date.now() >= breaker.next_attempt.getTime()) {
        breaker.state = "half_open";
        return false;
      }
      return true;
    }

    return false;
  }

  private async updateCircuitBreaker(
    context: ErrorContext,
    success: boolean
  ): Promise<void> {
    const key = `${context.workflow_id}:${context.node_id}`;
    let breaker = this.circuitBreakers.get(key);

    if (!breaker) {
      breaker = {
        failure_count: 0,
        last_failure: new Date(),
        state: "closed",
        next_attempt: new Date(),
      };
      this.circuitBreakers.set(key, breaker);
    }

    if (success) {
      breaker.failure_count = 0;
      breaker.state = "closed";
    } else {
      breaker.failure_count++;
      breaker.last_failure = new Date();

      if (breaker.failure_count >= 5) {
        breaker.state = "open";
        breaker.next_attempt = new Date(Date.now() + 60000); // 1 minute
      }
    }
  }

  // Helper methods
  private initializeErrorPatterns(): void {
    // Network-related errors
    this.errorPatterns.set("network_timeout", {
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      is_transient: true,
      is_recoverable: true,
      recommended_strategy: RecoveryStrategy.RETRY,
      estimated_recovery_time: 30000,
      business_impact: "medium",
      requires_user_intervention: false,
    });

    // Authentication errors
    this.errorPatterns.set("auth_failed", {
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      is_transient: false,
      is_recoverable: false,
      recommended_strategy: RecoveryStrategy.MANUAL_INTERVENTION,
      business_impact: "high",
      requires_user_intervention: true,
    });

    // Rate limit errors
    this.errorPatterns.set("rate_limit", {
      category: ErrorCategory.RATE_LIMIT,
      severity: ErrorSeverity.MEDIUM,
      is_transient: true,
      is_recoverable: true,
      recommended_strategy: RecoveryStrategy.RETRY,
      estimated_recovery_time: 300000, // 5 minutes
      business_impact: "medium",
      requires_user_intervention: false,
    });
  }

  private matchesPattern(
    message: string,
    stack: string,
    pattern: string
  ): boolean {
    // Pattern matching logic
    const patterns: Record<string, RegExp[]> = {
      network_timeout: [/timeout/i, /network.*error/i, /connection.*refused/i],
      auth_failed: [
        /unauthorized/i,
        /authentication.*failed/i,
        /invalid.*token/i,
      ],
      rate_limit: [/rate.*limit/i, /too.*many.*requests/i, /quota.*exceeded/i],
    };

    const regexes = patterns[pattern] || [];
    return regexes.some(regex => regex.test(message) || regex.test(stack));
  }

  private categorizeError(error: Error, context: ErrorContext): ErrorCategory {
    const message = error.message.toLowerCase();

    if (message.includes("timeout") || message.includes("network")) {
      return ErrorCategory.NETWORK;
    }
    if (
      message.includes("unauthorized") ||
      message.includes("authentication")
    ) {
      return ErrorCategory.AUTHENTICATION;
    }
    if (message.includes("validation") || message.includes("invalid")) {
      return ErrorCategory.VALIDATION;
    }
    if (message.includes("rate limit") || message.includes("quota")) {
      return ErrorCategory.RATE_LIMIT;
    }
    if (message.includes("database") || message.includes("sql")) {
      return ErrorCategory.DATABASE;
    }

    return ErrorCategory.UNKNOWN;
  }

  private assessSeverity(error: Error, context: ErrorContext): ErrorSeverity {
    const message = error.message.toLowerCase();

    if (message.includes("critical") || message.includes("fatal")) {
      return ErrorSeverity.CRITICAL;
    }
    if (message.includes("security") || message.includes("unauthorized")) {
      return ErrorSeverity.HIGH;
    }
    if (message.includes("timeout") || message.includes("network")) {
      return ErrorSeverity.MEDIUM;
    }

    return ErrorSeverity.LOW;
  }

  private isTransientError(error: Error, context: ErrorContext): boolean {
    const transientPatterns = [
      /timeout/i,
      /network.*error/i,
      /connection.*refused/i,
      /rate.*limit/i,
      /service.*unavailable/i,
    ];

    return transientPatterns.some(pattern => pattern.test(error.message));
  }

  private isRecoverableError(error: Error, context: ErrorContext): boolean {
    const nonRecoverablePatterns = [
      /authentication.*failed/i,
      /unauthorized/i,
      /permission.*denied/i,
      /syntax.*error/i,
      /configuration.*error/i,
    ];

    return !nonRecoverablePatterns.some(pattern => pattern.test(error.message));
  }

  private recommendRecoveryStrategy(
    category: ErrorCategory,
    severity: ErrorSeverity,
    isTransient: boolean
  ): RecoveryStrategy {
    if (severity === ErrorSeverity.CRITICAL) {
      return RecoveryStrategy.ESCALATE;
    }

    if (category === ErrorCategory.AUTHENTICATION) {
      return RecoveryStrategy.MANUAL_INTERVENTION;
    }

    if (isTransient) {
      return RecoveryStrategy.RETRY;
    }

    if (category === ErrorCategory.VALIDATION) {
      return RecoveryStrategy.FALLBACK;
    }

    return RecoveryStrategy.MANUAL_INTERVENTION;
  }

  private estimateRecoveryTime(
    category: ErrorCategory,
    isTransient: boolean
  ): number {
    if (isTransient) {
      return category === ErrorCategory.RATE_LIMIT ? 300000 : 30000; // 5 min or 30 sec
    }
    return 0; // Non-transient errors require manual intervention
  }

  private assessBusinessImpact(
    context: ErrorContext,
    severity: ErrorSeverity
  ): "low" | "medium" | "high" | "critical" {
    // Business impact assessment based on workflow type and severity
    const criticalWorkflows = ["payment", "order", "user_data"];
    const workflowType = context.workflow_id.toLowerCase();

    if (criticalWorkflows.some(type => workflowType.includes(type))) {
      return severity === ErrorSeverity.LOW ? "medium" : "critical";
    }

    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return "critical";
      case ErrorSeverity.HIGH:
        return "high";
      case ErrorSeverity.MEDIUM:
        return "medium";
      case ErrorSeverity.LOW:
      default:
        return "low";
    }
  }

  private calculateRetryDelay(
    retryCount: number,
    classification: ErrorClassification
  ): number {
    const baseDelay =
      classification.category === ErrorCategory.RATE_LIMIT ? 60000 : 1000;
    return Math.min(baseDelay * Math.pow(2, retryCount), 300000); // Max 5 minutes
  }

  private async prepareRetryData(
    context: ErrorContext,
    classification: ErrorClassification
  ): Promise<any> {
    // Prepare modified data for retry based on error type
    let retryData = { ...context.input_data };

    if (classification.category === ErrorCategory.RATE_LIMIT) {
      retryData = {
        ...retryData,
        retry_delay: this.calculateRetryDelay(
          context.retry_count,
          classification
        ),
      };
    }

    return retryData;
  }

  private async generateFallbackData(
    context: ErrorContext,
    classification: ErrorClassification
  ): Promise<any> {
    // Generate appropriate fallback data based on node type and error
    return {
      fallback: true,
      original_error: context.error.message,
      timestamp: new Date().toISOString(),
      node_id: context.node_id,
    };
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private createFailedRecovery(
    strategy: RecoveryStrategy,
    reason: string
  ): RecoveryResult {
    return {
      success: false,
      strategy_used: strategy,
      recovery_time: 0,
      requires_manual_review: true,
      next_action: reason,
    };
  }

  // Audit and notification methods
  private async recordErrorAudit(context: ErrorContext): Promise<void> {
    await auditTrailSystem.recordAuditEvent({
      event_type: AuditEventType.WORKFLOW_ERROR,
      workflow_id: context.workflow_id,
      execution_id: context.execution_id,
      node_id: context.node_id,
      user_id: context.user_id,
      timestamp: context.timestamp,
      event_data: {
        error_message: context.error.message,
        error_stack: context.error.stack,
        node_name: context.node_name,
        retry_count: context.retry_count,
        input_data: context.input_data,
      },
      sensitivity_level: "confidential",
      retention_period_days: 2555,
      data_classification: "error_log",
      business_impact: "high",
    });
  }

  private async recordRecoveryAttempt(
    context: ErrorContext,
    classification: ErrorClassification,
    result: RecoveryResult
  ): Promise<void> {
    const key = `${context.workflow_id}:${context.execution_id}`;

    if (!this.recoveryHistory.has(key)) {
      this.recoveryHistory.set(key, []);
    }

    this.recoveryHistory.get(key)!.push({
      timestamp: new Date().toISOString(),
      strategy: result.strategy_used,
      success: result.success,
      recovery_time: result.recovery_time,
      classification,
    });
  }

  private async checkEscalationConditions(
    context: ErrorContext,
    classification: ErrorClassification,
    result: RecoveryResult
  ): Promise<void> {
    const key = `${context.workflow_id}:${context.execution_id}`;
    const history = this.recoveryHistory.get(key) || [];

    // Check for repeated failures
    const recentFailures = history.filter(
      attempt =>
        !attempt.success &&
        Date.now() - new Date(attempt.timestamp).getTime() < 3600000
    );

    if (recentFailures.length >= 3) {
      await this.createEscalationTicket(context, classification);
    }

    // Check for critical business impact
    if (classification.business_impact === "critical" && !result.success) {
      await this.notifyAdministrators(context, classification);
    }
  }

  private async createEscalationTicket(
    context: ErrorContext,
    classification: ErrorClassification
  ): Promise<void> {
    logger.error("Creating escalation ticket", undefined, {
      workflow_id: context.workflow_id,
      error_category: classification.category,
      severity: classification.severity,
      business_impact: classification.business_impact,
    });

    // Implementation would integrate with ticketing system
  }

  private async notifyAdministrators(
    context: ErrorContext,
    classification: ErrorClassification
  ): Promise<void> {
    logger.error("Notifying administrators of critical error", undefined, {
      workflow_id: context.workflow_id,
      error_message: context.error.message,
      classification,
    });

    // Implementation would integrate with notification system
  }

  private async createManualReviewTask(
    context: ErrorContext,
    classification: ErrorClassification
  ): Promise<void> {
    logger.info("Creating manual review task", {
      workflow_id: context.workflow_id,
      node_id: context.node_id,
      error_category: classification.category,
    });

    // Implementation would create task in task management system
  }
}

// Types for internal use
interface ErrorPattern extends ErrorClassification {}

interface RecoveryAttempt {
  timestamp: string;
  strategy: RecoveryStrategy;
  success: boolean;
  recovery_time: number;
  classification: ErrorClassification;
}

// Export singleton instance
export const workflowErrorHandler = new WorkflowErrorHandler();

// Export convenience functions
export const handleWorkflowError = (context: ErrorContext) =>
  workflowErrorHandler.handleWorkflowError(context);

export type { ErrorContext, ErrorClassification, RecoveryResult };
