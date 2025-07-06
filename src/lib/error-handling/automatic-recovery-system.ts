/**
 * Automatic Recovery System for Enterprise Error Handling
 * Task 62.2: Automatic Recovery & Retry Logic
 *
 * This system provides intelligent automatic recovery capabilities with multiple strategies,
 * circuit breaker patterns, and comprehensive monitoring for enterprise applications.
 */

import { errorDetectionEngine } from "./error-detection-engine";
import { logger, LogCategory } from "../logger";
import { ErrorType, ErrorSeverity } from "../telegram/error-handler";

// Recovery strategy types
export enum RecoveryStrategy {
  IMMEDIATE_RETRY = "immediate_retry",
  EXPONENTIAL_BACKOFF = "exponential_backoff",
  CIRCUIT_BREAKER = "circuit_breaker",
  HEALTH_CHECK_RECOVERY = "health_check_recovery",
  FAILOVER = "failover",
  GRACEFUL_DEGRADATION = "graceful_degradation",
  RATE_LIMIT_BACKOFF = "rate_limit_backoff",
  RESOURCE_CLEANUP = "resource_cleanup",
}

// Circuit breaker states
export enum CircuitBreakerState {
  CLOSED = "closed", // Normal operation
  OPEN = "open", // Failing fast
  HALF_OPEN = "half_open", // Testing recovery
}

// Recovery configuration
export interface RecoveryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  circuitBreakerThreshold: number;
  circuitBreakerTimeout: number;
  healthCheckInterval: number;
  enableAutoRecovery: boolean;
  strategies: RecoveryStrategy[];
}

// Circuit breaker configuration
export interface CircuitBreakerConfig {
  failureThreshold: number;
  timeoutMs: number;
  monitoringPeriodMs: number;
  minimumThroughput: number;
}

// Recovery attempt result
export interface RecoveryAttempt {
  attemptNumber: number;
  strategy: RecoveryStrategy;
  success: boolean;
  error?: Error;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Service health status
export interface ServiceHealth {
  serviceName: string;
  status: "healthy" | "degraded" | "unhealthy" | "unknown";
  lastCheck: Date;
  responseTime: number;
  errorRate: number;
  consecutiveFailures: number;
  uptime: number;
}

// Circuit breaker instance
export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private nextAttemptTime: number = 0;
  private successCount: number = 0;

  constructor(
    private serviceName: string,
    private config: CircuitBreakerConfig
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error(`Circuit breaker OPEN for ${this.serviceName}`);
      }
      this.state = CircuitBreakerState.HALF_OPEN;
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.successCount++;

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.state = CircuitBreakerState.CLOSED;
      logger.info("Circuit breaker closed - service recovered", {
        category: LogCategory.SYSTEM,
        service: this.serviceName,
        success_count: this.successCount,
      });
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
      this.nextAttemptTime = Date.now() + this.config.timeoutMs;

      logger.warn("Circuit breaker opened - service failing", {
        category: LogCategory.SYSTEM,
        service: this.serviceName,
        failure_count: this.failureCount,
        timeout_ms: this.config.timeoutMs,
      });
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  getMetrics() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
    };
  }
}

// Main automatic recovery system
export class AutomaticRecoverySystem {
  private static instance: AutomaticRecoverySystem;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private serviceHealth: Map<string, ServiceHealth> = new Map();
  private recoveryAttempts: Map<string, RecoveryAttempt[]> = new Map();
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();
  private isInitialized: boolean = false;

  private defaultConfig: RecoveryConfig = {
    maxRetries: 5,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    circuitBreakerThreshold: 5,
    circuitBreakerTimeout: 60000,
    healthCheckInterval: 30000,
    enableAutoRecovery: true,
    strategies: [
      RecoveryStrategy.EXPONENTIAL_BACKOFF,
      RecoveryStrategy.CIRCUIT_BREAKER,
      RecoveryStrategy.HEALTH_CHECK_RECOVERY,
    ],
  };

  private constructor() {}

  public static getInstance(): AutomaticRecoverySystem {
    if (!AutomaticRecoverySystem.instance) {
      AutomaticRecoverySystem.instance = new AutomaticRecoverySystem();
    }
    return AutomaticRecoverySystem.instance;
  }

  public async initialize(config?: Partial<RecoveryConfig>): Promise<void> {
    if (this.isInitialized) return;

    this.defaultConfig = { ...this.defaultConfig, ...config };

    // Initialize circuit breakers for critical services
    this.initializeCircuitBreakers();

    // Start health monitoring
    this.startHealthMonitoring();

    this.isInitialized = true;

    logger.info("Automatic recovery system initialized", {
      category: LogCategory.SYSTEM,
      component: "automatic_recovery_system",
      config: this.defaultConfig,
    });
  }

  /**
   * Attempt automatic recovery for a failed operation
   */
  public async attemptRecovery<T>(
    serviceName: string,
    operation: () => Promise<T>,
    error: Error,
    config?: Partial<RecoveryConfig>
  ): Promise<T> {
    const recoveryConfig = { ...this.defaultConfig, ...config };
    const attemptId = `${serviceName}-${Date.now()}`;

    logger.info("Starting automatic recovery", {
      category: LogCategory.SYSTEM,
      service: serviceName,
      error_message: error.message,
      strategies: recoveryConfig.strategies,
    });

    // Classify the error to determine best recovery strategy
    const errorClassification = await errorDetectionEngine.detectError(error, {
      timestamp: new Date(),
      action: "recovery_attempt",
      resource: serviceName,
    });

    // Select appropriate recovery strategies based on error type
    const strategies = this.selectRecoveryStrategies(
      errorClassification,
      recoveryConfig
    );

    for (const strategy of strategies) {
      try {
        const result = await this.executeRecoveryStrategy(
          strategy,
          serviceName,
          operation,
          recoveryConfig,
          attemptId
        );

        // Recovery successful
        this.recordSuccessfulRecovery(serviceName, strategy, attemptId);
        return result;
      } catch (recoveryError) {
        this.recordFailedRecovery(
          serviceName,
          strategy,
          recoveryError,
          attemptId
        );

        // Continue to next strategy
        logger.warn("Recovery strategy failed, trying next", {
          category: LogCategory.SYSTEM,
          service: serviceName,
          strategy,
          error:
            recoveryError instanceof Error
              ? recoveryError.message
              : "Unknown error",
        });
      }
    }

    // All recovery strategies failed
    logger.error("All recovery strategies exhausted", {
      category: LogCategory.SYSTEM,
      service: serviceName,
      strategies_tried: strategies.length,
    });

    throw new Error(
      `Recovery failed for ${serviceName} after trying ${strategies.length} strategies`
    );
  }

  /**
   * Execute a specific recovery strategy
   */
  private async executeRecoveryStrategy<T>(
    strategy: RecoveryStrategy,
    serviceName: string,
    operation: () => Promise<T>,
    config: RecoveryConfig,
    attemptId: string
  ): Promise<T> {
    switch (strategy) {
      case RecoveryStrategy.IMMEDIATE_RETRY:
        return await this.immediateRetry(operation);

      case RecoveryStrategy.EXPONENTIAL_BACKOFF:
        return await this.exponentialBackoffRetry(operation, config);

      case RecoveryStrategy.CIRCUIT_BREAKER:
        return await this.circuitBreakerRetry(serviceName, operation);

      case RecoveryStrategy.HEALTH_CHECK_RECOVERY:
        return await this.healthCheckRecovery(serviceName, operation);

      case RecoveryStrategy.FAILOVER:
        return await this.failoverRecovery(serviceName, operation);

      case RecoveryStrategy.GRACEFUL_DEGRADATION:
        return await this.gracefulDegradation(serviceName, operation);

      case RecoveryStrategy.RATE_LIMIT_BACKOFF:
        return await this.rateLimitBackoff(operation, config);

      case RecoveryStrategy.RESOURCE_CLEANUP:
        return await this.resourceCleanupRecovery(serviceName, operation);

      default:
        throw new Error(`Unknown recovery strategy: ${strategy}`);
    }
  }

  /**
   * Immediate retry without delay
   */
  private async immediateRetry<T>(operation: () => Promise<T>): Promise<T> {
    return await operation();
  }

  /**
   * Exponential backoff retry with increasing delays
   */
  private async exponentialBackoffRetry<T>(
    operation: () => Promise<T>,
    config: RecoveryConfig
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === config.maxRetries) {
          throw lastError;
        }

        const delay = Math.min(
          config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt - 1),
          config.maxDelayMs
        );

        logger.info("Exponential backoff retry", {
          category: LogCategory.SYSTEM,
          attempt,
          delay_ms: delay,
          max_retries: config.maxRetries,
        });

        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Circuit breaker protected retry
   */
  private async circuitBreakerRetry<T>(
    serviceName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const circuitBreaker = this.getOrCreateCircuitBreaker(serviceName);
    return await circuitBreaker.execute(operation);
  }

  /**
   * Health check based recovery
   */
  private async healthCheckRecovery<T>(
    serviceName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    // Perform health check first
    const isHealthy = await this.performHealthCheck(serviceName);

    if (!isHealthy) {
      // Wait for service to become healthy
      await this.waitForHealthyService(serviceName, 30000); // 30 second timeout
    }

    return await operation();
  }

  /**
   * Failover to backup service
   */
  private async failoverRecovery<T>(
    serviceName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    // This would implement failover to backup services
    // For now, just retry with a delay
    await this.sleep(5000);
    return await operation();
  }

  /**
   * Graceful degradation - return cached or default data
   */
  private async gracefulDegradation<T>(
    serviceName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    // Try to return cached data or safe defaults
    // This is service-specific implementation
    logger.warn("Attempting graceful degradation", {
      category: LogCategory.SYSTEM,
      service: serviceName,
    });

    // For now, just retry once more
    return await operation();
  }

  /**
   * Rate limit specific backoff
   */
  private async rateLimitBackoff<T>(
    operation: () => Promise<T>,
    config: RecoveryConfig
  ): Promise<T> {
    // Implement rate limit specific logic (e.g., respect Retry-After headers)
    const rateLimitDelay = 5000; // 5 seconds for rate limits

    logger.info("Rate limit backoff", {
      category: LogCategory.SYSTEM,
      delay_ms: rateLimitDelay,
    });

    await this.sleep(rateLimitDelay);
    return await operation();
  }

  /**
   * Resource cleanup and retry
   */
  private async resourceCleanupRecovery<T>(
    serviceName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    // Perform resource cleanup (close connections, clear caches, etc.)
    logger.info("Performing resource cleanup", {
      category: LogCategory.SYSTEM,
      service: serviceName,
    });

    // Trigger garbage collection if available
    if (global.gc) {
      global.gc();
    }

    await this.sleep(2000); // Allow cleanup to complete
    return await operation();
  }

  /**
   * Select appropriate recovery strategies based on error classification
   */
  private selectRecoveryStrategies(
    errorClassification: any,
    config: RecoveryConfig
  ): RecoveryStrategy[] {
    const strategies: RecoveryStrategy[] = [];

    // Strategy selection based on error type
    switch (errorClassification.type) {
      case ErrorType.RATE_LIMIT:
        strategies.push(RecoveryStrategy.RATE_LIMIT_BACKOFF);
        break;

      case ErrorType.NETWORK:
        strategies.push(
          RecoveryStrategy.EXPONENTIAL_BACKOFF,
          RecoveryStrategy.CIRCUIT_BREAKER,
          RecoveryStrategy.FAILOVER
        );
        break;

      case ErrorType.DATABASE:
        strategies.push(
          RecoveryStrategy.EXPONENTIAL_BACKOFF,
          RecoveryStrategy.CIRCUIT_BREAKER,
          RecoveryStrategy.RESOURCE_CLEANUP
        );
        break;

      case ErrorType.AUTHENTICATION:
        strategies.push(
          RecoveryStrategy.IMMEDIATE_RETRY,
          RecoveryStrategy.HEALTH_CHECK_RECOVERY
        );
        break;

      default:
        strategies.push(...config.strategies);
    }

    // Always add graceful degradation as last resort
    if (!strategies.includes(RecoveryStrategy.GRACEFUL_DEGRADATION)) {
      strategies.push(RecoveryStrategy.GRACEFUL_DEGRADATION);
    }

    return strategies;
  }

  /**
   * Initialize circuit breakers for critical services
   */
  private initializeCircuitBreakers(): void {
    const criticalServices = [
      "database",
      "authentication",
      "api_gateway",
      "external_services",
      "cache",
      "metrics_collection",
      "tracking_events",
    ];

    criticalServices.forEach(serviceName => {
      const config: CircuitBreakerConfig = {
        failureThreshold: this.defaultConfig.circuitBreakerThreshold,
        timeoutMs: this.defaultConfig.circuitBreakerTimeout,
        monitoringPeriodMs: 60000,
        minimumThroughput: 10,
      };

      this.circuitBreakers.set(
        serviceName,
        new CircuitBreaker(serviceName, config)
      );
    });
  }

  /**
   * Start health monitoring for services
   */
  private startHealthMonitoring(): void {
    const services = ["database", "api", "cache", "external_services"];

    services.forEach(serviceName => {
      const interval = setInterval(async () => {
        await this.performHealthCheck(serviceName);
      }, this.defaultConfig.healthCheckInterval);

      this.healthCheckIntervals.set(serviceName, interval);
    });
  }

  /**
   * Perform health check for a service
   */
  private async performHealthCheck(serviceName: string): Promise<boolean> {
    const startTime = Date.now();

    try {
      // Service-specific health check logic
      const isHealthy = await this.checkServiceHealth(serviceName);
      const responseTime = Date.now() - startTime;

      this.updateServiceHealth(serviceName, {
        status: isHealthy ? "healthy" : "unhealthy",
        responseTime,
        lastCheck: new Date(),
        errorRate: 0,
        consecutiveFailures: isHealthy
          ? 0
          : (this.serviceHealth.get(serviceName)?.consecutiveFailures || 0) + 1,
        uptime: isHealthy ? 100 : 0,
      });

      return isHealthy;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      this.updateServiceHealth(serviceName, {
        status: "unhealthy",
        responseTime,
        lastCheck: new Date(),
        errorRate: 100,
        consecutiveFailures:
          (this.serviceHealth.get(serviceName)?.consecutiveFailures || 0) + 1,
        uptime: 0,
      });

      return false;
    }
  }

  /**
   * Service-specific health check implementation
   */
  private async checkServiceHealth(serviceName: string): Promise<boolean> {
    switch (serviceName) {
      case "database":
        // Check database connectivity
        return true; // Simplified for demo

      case "api":
        // Check API endpoint
        return true;

      case "cache":
        // Check cache connectivity
        return true;

      case "external_services":
        // Check external service availability
        return true;

      default:
        return true;
    }
  }

  /**
   * Update service health status
   */
  private updateServiceHealth(
    serviceName: string,
    health: Partial<ServiceHealth>
  ): void {
    const current = this.serviceHealth.get(serviceName) || {
      serviceName,
      status: "unknown",
      lastCheck: new Date(),
      responseTime: 0,
      errorRate: 0,
      consecutiveFailures: 0,
      uptime: 0,
    };

    this.serviceHealth.set(serviceName, { ...current, ...health });
  }

  /**
   * Wait for service to become healthy
   */
  private async waitForHealthyService(
    serviceName: string,
    timeoutMs: number
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const isHealthy = await this.performHealthCheck(serviceName);

      if (isHealthy) {
        return;
      }

      await this.sleep(5000); // Check every 5 seconds
    }

    throw new Error(
      `Service ${serviceName} did not become healthy within ${timeoutMs}ms`
    );
  }

  /**
   * Get or create circuit breaker for service
   */
  private getOrCreateCircuitBreaker(serviceName: string): CircuitBreaker {
    if (!this.circuitBreakers.has(serviceName)) {
      const config: CircuitBreakerConfig = {
        failureThreshold: this.defaultConfig.circuitBreakerThreshold,
        timeoutMs: this.defaultConfig.circuitBreakerTimeout,
        monitoringPeriodMs: 60000,
        minimumThroughput: 10,
      };

      this.circuitBreakers.set(
        serviceName,
        new CircuitBreaker(serviceName, config)
      );
    }

    return this.circuitBreakers.get(serviceName)!;
  }

  /**
   * Record successful recovery
   */
  private recordSuccessfulRecovery(
    serviceName: string,
    strategy: RecoveryStrategy,
    attemptId: string
  ): void {
    const attempt: RecoveryAttempt = {
      attemptNumber: 1,
      strategy,
      success: true,
      duration: Date.now(),
      timestamp: new Date(),
    };

    if (!this.recoveryAttempts.has(serviceName)) {
      this.recoveryAttempts.set(serviceName, []);
    }

    this.recoveryAttempts.get(serviceName)!.push(attempt);

    logger.info("Recovery successful", {
      category: LogCategory.SYSTEM,
      service: serviceName,
      strategy,
      attempt_id: attemptId,
    });
  }

  /**
   * Record failed recovery
   */
  private recordFailedRecovery(
    serviceName: string,
    strategy: RecoveryStrategy,
    error: Error,
    attemptId: string
  ): void {
    const attempt: RecoveryAttempt = {
      attemptNumber: 1,
      strategy,
      success: false,
      error,
      duration: Date.now(),
      timestamp: new Date(),
    };

    if (!this.recoveryAttempts.has(serviceName)) {
      this.recoveryAttempts.set(serviceName, []);
    }

    this.recoveryAttempts.get(serviceName)!.push(attempt);
  }

  /**
   * Get recovery metrics for a service
   */
  public getRecoveryMetrics(serviceName?: string) {
    if (serviceName) {
      return {
        service: serviceName,
        health: this.serviceHealth.get(serviceName),
        circuitBreaker: this.circuitBreakers.get(serviceName)?.getMetrics(),
        recoveryAttempts: this.recoveryAttempts.get(serviceName) || [],
      };
    }

    // Return all metrics
    const allMetrics: any = {
      services: {},
      summary: {
        totalServices: this.serviceHealth.size,
        healthyServices: 0,
        unhealthyServices: 0,
        circuitBreakersOpen: 0,
        totalRecoveryAttempts: 0,
      },
    };

    for (const [name, health] of this.serviceHealth.entries()) {
      allMetrics.services[name] = {
        health,
        circuitBreaker: this.circuitBreakers.get(name)?.getMetrics(),
        recoveryAttempts: this.recoveryAttempts.get(name) || [],
      };

      if (health.status === "healthy") {
        allMetrics.summary.healthyServices++;
      } else {
        allMetrics.summary.unhealthyServices++;
      }

      const cb = this.circuitBreakers.get(name);
      if (cb && cb.getState() === CircuitBreakerState.OPEN) {
        allMetrics.summary.circuitBreakersOpen++;
      }

      allMetrics.summary.totalRecoveryAttempts += (
        this.recoveryAttempts.get(name) || []
      ).length;
    }

    return allMetrics;
  }

  /**
   * Utility function for sleep/delay
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    // Clear health check intervals
    for (const interval of this.healthCheckIntervals.values()) {
      clearInterval(interval);
    }

    this.healthCheckIntervals.clear();
    this.circuitBreakers.clear();
    this.serviceHealth.clear();
    this.recoveryAttempts.clear();
    this.isInitialized = false;

    logger.info("Automatic recovery system destroyed", {
      category: LogCategory.SYSTEM,
      component: "automatic_recovery_system",
    });
  }
}

// Export singleton instance
export const automaticRecoverySystem = AutomaticRecoverySystem.getInstance();

// Helper functions
export const attemptRecovery = <T>(
  serviceName: string,
  operation: () => Promise<T>,
  error: Error,
  config?: Partial<RecoveryConfig>
) =>
  automaticRecoverySystem.attemptRecovery(
    serviceName,
    operation,
    error,
    config
  );

export const getRecoveryMetrics = (serviceName?: string) =>
  automaticRecoverySystem.getRecoveryMetrics(serviceName);
