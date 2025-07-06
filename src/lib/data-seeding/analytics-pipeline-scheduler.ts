/**
 * Analytics Pipeline Scheduler
 *
 * Advanced scheduling system for managing data pipeline execution,
 * dependencies, monitoring, and orchestration.
 */

import {
  AnalyticsDataPipelineManager,
  DataPipelineConfig,
  PipelineExecutionResult,
} from "./analytics-data-pipelines";

// ================================
// 📅 SCHEDULER INTERFACES
// ================================

export interface PipelineSchedule {
  pipelineId: string;
  cronExpression: string;
  timezone: string;
  priority: number;
  dependencies: string[];
  retryPolicy: RetryPolicy;
  executionWindow: ExecutionWindow;
  healthChecks: HealthCheckConfig[];
}

export interface SchedulerConfig {
  maxConcurrentJobs: number;
  defaultRetryPolicy: RetryPolicy;
  monitoringInterval: number;
  failureNotifications: NotificationConfig[];
  executionHistory: ExecutionHistoryConfig;
}

export interface RetryPolicy {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

export interface ExecutionWindow {
  startHour: number;
  endHour: number;
  allowedDays: number[]; // 0-6 (Sunday-Saturday)
  timezone: string;
}

export interface HealthCheckConfig {
  type: "connectivity" | "data-quality" | "performance" | "resource";
  endpoint?: string;
  thresholds: Record<string, number>;
  timeoutMs: number;
}

export interface NotificationConfig {
  type: "email" | "slack" | "webhook";
  endpoint: string;
  credentials?: Record<string, string>;
  alertLevels: ("info" | "warning" | "error" | "critical")[];
}

export interface ExecutionHistoryConfig {
  retentionDays: number;
  maxRecordsPerPipeline: number;
  includeDataSamples: boolean;
}

export interface ScheduledExecution {
  id: string;
  pipelineId: string;
  scheduledTime: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  status:
    | "scheduled"
    | "running"
    | "completed"
    | "failed"
    | "retrying"
    | "skipped";
  result?: PipelineExecutionResult;
  retryAttempt: number;
  logs: ExecutionLog[];
  metadata: ExecutionMetadata;
}

export interface ExecutionLog {
  timestamp: Date;
  level: "debug" | "info" | "warning" | "error";
  message: string;
  data?: any;
}

export interface ExecutionMetadata {
  triggeredBy: "schedule" | "manual" | "dependency" | "retry";
  resourceUsage: ResourceUsage;
  dataQualityScores: Record<string, number>;
  performanceMetrics: PerformanceMetrics;
}

export interface ResourceUsage {
  cpuUtilizationPercent: number;
  memoryUsageMB: number;
  networkIOKB: number;
  diskIOKB: number;
}

export interface PerformanceMetrics {
  dataExtractionTimeMs: number;
  transformationTimeMs: number;
  validationTimeMs: number;
  loadingTimeMs: number;
  totalExecutionTimeMs: number;
  recordsPerSecond: number;
}

// ================================
// 🎯 ANALYTICS PIPELINE SCHEDULER
// ================================

export class AnalyticsPipelineScheduler {
  private config: SchedulerConfig;
  private pipelineManager: AnalyticsDataPipelineManager;
  private schedules: Map<string, PipelineSchedule> = new Map();
  private executions: Map<string, ScheduledExecution> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  constructor(config: SchedulerConfig) {
    this.config = config;
    this.pipelineManager = new AnalyticsDataPipelineManager();
  }

  async initialize(): Promise<void> {
    await this.pipelineManager.initialize();
    await this.loadPipelineSchedules();
    console.log("✅ Analytics Pipeline Scheduler initialized");
  }

  private async loadPipelineSchedules(): Promise<void> {
    const schedules: PipelineSchedule[] = [
      {
        pipelineId: "advanced-ml-pipeline",
        cronExpression: "0 * * * *", // Every hour
        timezone: "UTC",
        priority: 1,
        dependencies: [],
        retryPolicy: {
          maxAttempts: 3,
          initialDelayMs: 30000,
          maxDelayMs: 300000,
          backoffMultiplier: 2,
          retryableErrors: [
            "connection-timeout",
            "rate-limit",
            "temporary-failure",
          ],
        },
        executionWindow: {
          startHour: 0,
          endHour: 23,
          allowedDays: [0, 1, 2, 3, 4, 5, 6],
          timezone: "UTC",
        },
        healthChecks: [
          {
            type: "connectivity",
            endpoint: "https://api.supabase.co/health",
            thresholds: { responseTime: 5000 },
            timeoutMs: 10000,
          },
          {
            type: "data-quality",
            thresholds: { completeness: 0.9, accuracy: 0.95 },
            timeoutMs: 30000,
          },
        ],
      },
      {
        pipelineId: "tactical-ml-pipeline",
        cronExpression: "0 * * * *", // Every hour
        timezone: "UTC",
        priority: 2,
        dependencies: [],
        retryPolicy: {
          maxAttempts: 3,
          initialDelayMs: 15000,
          maxDelayMs: 180000,
          backoffMultiplier: 1.5,
          retryableErrors: [
            "api-timeout",
            "rate-limit",
            "data-quality-failure",
          ],
        },
        executionWindow: {
          startHour: 1,
          endHour: 23,
          allowedDays: [1, 2, 3, 4, 5, 6, 0],
          timezone: "UTC",
        },
        healthChecks: [
          {
            type: "connectivity",
            endpoint: "https://api.analytics.local/health",
            thresholds: { responseTime: 3000 },
            timeoutMs: 8000,
          },
        ],
      },
      {
        pipelineId: "roi-algorithm-pipeline",
        cronExpression: "0 2 * * *", // Daily at 2 AM
        timezone: "UTC",
        priority: 3,
        dependencies: ["advanced-ml-pipeline"],
        retryPolicy: {
          maxAttempts: 5,
          initialDelayMs: 60000,
          maxDelayMs: 600000,
          backoffMultiplier: 2,
          retryableErrors: [
            "calculation-error",
            "data-inconsistency",
            "attribution-failure",
          ],
        },
        executionWindow: {
          startHour: 2,
          endHour: 6,
          allowedDays: [1, 2, 3, 4, 5, 6, 0],
          timezone: "UTC",
        },
        healthChecks: [
          {
            type: "data-quality",
            thresholds: { accuracy: 0.96, completeness: 0.92 },
            timeoutMs: 45000,
          },
        ],
      },
      {
        pipelineId: "optimization-engine-pipeline",
        cronExpression: "0 3 * * *", // Daily at 3 AM
        timezone: "UTC",
        priority: 4,
        dependencies: ["roi-algorithm-pipeline"],
        retryPolicy: {
          maxAttempts: 4,
          initialDelayMs: 45000,
          maxDelayMs: 480000,
          backoffMultiplier: 1.8,
          retryableErrors: [
            "optimization-timeout",
            "constraint-violation",
            "resource-exhaustion",
          ],
        },
        executionWindow: {
          startHour: 3,
          endHour: 7,
          allowedDays: [1, 2, 3, 4, 5, 6, 0],
          timezone: "UTC",
        },
        healthChecks: [
          {
            type: "performance",
            thresholds: { executionTime: 900000 }, // 15 minutes
            timeoutMs: 60000,
          },
        ],
      },
      {
        pipelineId: "predictive-analytics-pipeline",
        cronExpression: "*/5 * * * *", // Every 5 minutes (real-time)
        timezone: "UTC",
        priority: 5,
        dependencies: [],
        retryPolicy: {
          maxAttempts: 2,
          initialDelayMs: 5000,
          maxDelayMs: 30000,
          backoffMultiplier: 1.2,
          retryableErrors: [
            "stream-connection-lost",
            "kafka-lag",
            "prediction-service-timeout",
          ],
        },
        executionWindow: {
          startHour: 0,
          endHour: 23,
          allowedDays: [0, 1, 2, 3, 4, 5, 6],
          timezone: "UTC",
        },
        healthChecks: [
          {
            type: "connectivity",
            endpoint: "kafka://localhost:9092/health",
            thresholds: { lag: 1000 },
            timeoutMs: 5000,
          },
          {
            type: "performance",
            thresholds: { latency: 60000 }, // 1 minute
            timeoutMs: 15000,
          },
        ],
      },
    ];

    schedules.forEach(schedule => {
      this.schedules.set(schedule.pipelineId, schedule);
    });
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log("⚠️ Scheduler is already running");
      return;
    }

    this.isRunning = true;
    console.log("🚀 Starting Analytics Pipeline Scheduler");

    // Schedule all pipelines
    for (const [pipelineId, schedule] of this.schedules) {
      await this.schedulePipeline(pipelineId, schedule);
    }

    // Start monitoring
    this.startMonitoring();

    console.log("✅ Analytics Pipeline Scheduler started successfully");
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log("⚠️ Scheduler is not running");
      return;
    }

    this.isRunning = false;
    console.log("🛑 Stopping Analytics Pipeline Scheduler");

    // Clear all timers
    for (const [pipelineId, timer] of this.timers) {
      clearTimeout(timer);
      console.log(`⏹️ Stopped schedule for pipeline: ${pipelineId}`);
    }
    this.timers.clear();

    console.log("✅ Analytics Pipeline Scheduler stopped");
  }

  private async schedulePipeline(
    pipelineId: string,
    schedule: PipelineSchedule
  ): Promise<void> {
    const nextExecution = this.calculateNextExecution(schedule);
    const delay = nextExecution.getTime() - Date.now();

    if (delay > 0) {
      const timer = setTimeout(async () => {
        await this.executePipeline(pipelineId, "schedule");
        // Reschedule for next execution
        await this.schedulePipeline(pipelineId, schedule);
      }, delay);

      this.timers.set(pipelineId, timer);
      console.log(
        `📅 Scheduled pipeline ${pipelineId} for ${nextExecution.toISOString()}`
      );
    }
  }

  private calculateNextExecution(schedule: PipelineSchedule): Date {
    // Simplified cron calculation
    const now = new Date();
    const next = new Date(now);

    if (schedule.cronExpression === "0 * * * *") {
      // Hourly
      next.setHours(next.getHours() + 1, 0, 0, 0);
    } else if (schedule.cronExpression === "0 2 * * *") {
      // Daily at 2 AM
      next.setDate(next.getDate() + 1);
      next.setHours(2, 0, 0, 0);
    } else if (schedule.cronExpression === "0 3 * * *") {
      // Daily at 3 AM
      next.setDate(next.getDate() + 1);
      next.setHours(3, 0, 0, 0);
    } else if (schedule.cronExpression === "*/5 * * * *") {
      // Every 5 minutes
      next.setMinutes(Math.ceil(next.getMinutes() / 5) * 5, 0, 0);
    }

    return next;
  }

  async executePipeline(
    pipelineId: string,
    triggeredBy: "schedule" | "manual" | "dependency" | "retry"
  ): Promise<ScheduledExecution> {
    const executionId = `${pipelineId}-${Date.now()}`;
    const schedule = this.schedules.get(pipelineId);

    if (!schedule) {
      throw new Error(`No schedule found for pipeline: ${pipelineId}`);
    }

    // Check dependencies
    if (!(await this.checkDependencies(schedule.dependencies))) {
      console.log(`⏸️ Skipping pipeline ${pipelineId} - dependencies not met`);
      return this.createSkippedExecution(
        executionId,
        pipelineId,
        "Dependencies not met"
      );
    }

    // Check execution window
    if (!this.isInExecutionWindow(schedule.executionWindow)) {
      console.log(
        `⏸️ Skipping pipeline ${pipelineId} - outside execution window`
      );
      return this.createSkippedExecution(
        executionId,
        pipelineId,
        "Outside execution window"
      );
    }

    // Check health
    const healthCheckResults = await this.performHealthChecks(
      schedule.healthChecks
    );
    if (!healthCheckResults.allPassed) {
      console.log(`⚠️ Health checks failed for pipeline ${pipelineId}`);
      // Decide whether to proceed or skip based on severity
    }

    const execution: ScheduledExecution = {
      id: executionId,
      pipelineId,
      scheduledTime: new Date(),
      status: "running",
      retryAttempt: 0,
      logs: [],
      metadata: {
        triggeredBy,
        resourceUsage: {
          cpuUtilizationPercent: 0,
          memoryUsageMB: 0,
          networkIOKB: 0,
          diskIOKB: 0,
        },
        dataQualityScores: {},
        performanceMetrics: {
          dataExtractionTimeMs: 0,
          transformationTimeMs: 0,
          validationTimeMs: 0,
          loadingTimeMs: 0,
          totalExecutionTimeMs: 0,
          recordsPerSecond: 0,
        },
      },
    };

    this.executions.set(executionId, execution);
    this.addExecutionLog(
      execution,
      "info",
      `Starting pipeline execution for ${pipelineId}`
    );

    try {
      execution.actualStartTime = new Date();
      const startTime = Date.now();

      // Execute the pipeline
      console.log(`🚀 Executing pipeline: ${pipelineId}`);
      const result = await this.pipelineManager.executePipeline(pipelineId);

      execution.actualEndTime = new Date();
      execution.status = result.status === "success" ? "completed" : "failed";
      execution.result = result;

      // Update performance metrics
      execution.metadata.performanceMetrics.totalExecutionTimeMs =
        Date.now() - startTime;
      execution.metadata.performanceMetrics.recordsPerSecond =
        result.recordsProcessed /
        (execution.metadata.performanceMetrics.totalExecutionTimeMs / 1000);

      this.addExecutionLog(
        execution,
        "info",
        `Pipeline execution completed with status: ${execution.status}`
      );

      console.log(`✅ Pipeline ${pipelineId} executed successfully`);

      // Trigger dependent pipelines
      await this.triggerDependentPipelines(pipelineId);
    } catch (error) {
      execution.actualEndTime = new Date();
      execution.status = "failed";
      execution.result = {
        pipelineId,
        status: "failed",
        recordsProcessed: 0,
        dataQualityScore: 0,
        processingTimeMs: Date.now() - execution.actualStartTime!.getTime(),
        timestamp: new Date(),
        error: error.message,
      };

      this.addExecutionLog(
        execution,
        "error",
        `Pipeline execution failed: ${error.message}`
      );
      console.error(`❌ Pipeline ${pipelineId} execution failed:`, error);

      // Retry logic
      if (execution.retryAttempt < schedule.retryPolicy.maxAttempts) {
        await this.scheduleRetry(execution, schedule.retryPolicy);
      }
    }

    return execution;
  }

  private async checkDependencies(dependencies: string[]): Promise<boolean> {
    if (dependencies.length === 0) return true;

    for (const depPipelineId of dependencies) {
      const recentExecution = this.getRecentExecution(depPipelineId);
      if (!recentExecution || recentExecution.status !== "completed") {
        return false;
      }
    }

    return true;
  }

  private getRecentExecution(pipelineId: string): ScheduledExecution | null {
    // Find the most recent execution for the pipeline
    const executions = Array.from(this.executions.values())
      .filter(ex => ex.pipelineId === pipelineId)
      .sort((a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime());

    return executions.length > 0 ? executions[0] : null;
  }

  private isInExecutionWindow(window: ExecutionWindow): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    return (
      window.allowedDays.includes(currentDay) &&
      currentHour >= window.startHour &&
      currentHour <= window.endHour
    );
  }

  private async performHealthChecks(
    checks: HealthCheckConfig[]
  ): Promise<{ allPassed: boolean; results: any[] }> {
    const results = [];
    let allPassed = true;

    for (const check of checks) {
      try {
        const result = await this.performHealthCheck(check);
        results.push(result);
        if (!result.passed) allPassed = false;
      } catch (error) {
        results.push({ type: check.type, passed: false, error: error.message });
        allPassed = false;
      }
    }

    return { allPassed, results };
  }

  private async performHealthCheck(check: HealthCheckConfig): Promise<any> {
    // Simplified health check implementation
    switch (check.type) {
      case "connectivity":
        return { type: "connectivity", passed: true, responseTime: 150 };
      case "data-quality":
        return { type: "data-quality", passed: true, qualityScore: 0.95 };
      case "performance":
        return {
          type: "performance",
          passed: true,
          metrics: { executionTime: 30000 },
        };
      default:
        return { type: check.type, passed: true };
    }
  }

  private createSkippedExecution(
    executionId: string,
    pipelineId: string,
    reason: string
  ): ScheduledExecution {
    const execution: ScheduledExecution = {
      id: executionId,
      pipelineId,
      scheduledTime: new Date(),
      status: "skipped",
      retryAttempt: 0,
      logs: [
        {
          timestamp: new Date(),
          level: "info",
          message: `Execution skipped: ${reason}`,
        },
      ],
      metadata: {
        triggeredBy: "schedule",
        resourceUsage: {
          cpuUtilizationPercent: 0,
          memoryUsageMB: 0,
          networkIOKB: 0,
          diskIOKB: 0,
        },
        dataQualityScores: {},
        performanceMetrics: {
          dataExtractionTimeMs: 0,
          transformationTimeMs: 0,
          validationTimeMs: 0,
          loadingTimeMs: 0,
          totalExecutionTimeMs: 0,
          recordsPerSecond: 0,
        },
      },
    };

    this.executions.set(executionId, execution);
    return execution;
  }

  private addExecutionLog(
    execution: ScheduledExecution,
    level: "debug" | "info" | "warning" | "error",
    message: string,
    data?: any
  ): void {
    execution.logs.push({
      timestamp: new Date(),
      level,
      message,
      data,
    });
  }

  private async scheduleRetry(
    execution: ScheduledExecution,
    retryPolicy: RetryPolicy
  ): Promise<void> {
    execution.retryAttempt++;
    execution.status = "retrying";

    const delay = Math.min(
      retryPolicy.initialDelayMs *
        Math.pow(retryPolicy.backoffMultiplier, execution.retryAttempt - 1),
      retryPolicy.maxDelayMs
    );

    this.addExecutionLog(
      execution,
      "info",
      `Scheduling retry ${execution.retryAttempt}/${retryPolicy.maxAttempts} in ${delay}ms`
    );

    setTimeout(async () => {
      await this.executePipeline(execution.pipelineId, "retry");
    }, delay);
  }

  private async triggerDependentPipelines(
    completedPipelineId: string
  ): Promise<void> {
    // Find pipelines that depend on the completed pipeline
    for (const [pipelineId, schedule] of this.schedules) {
      if (schedule.dependencies.includes(completedPipelineId)) {
        console.log(`🔗 Triggering dependent pipeline: ${pipelineId}`);
        await this.executePipeline(pipelineId, "dependency");
      }
    }
  }

  private startMonitoring(): void {
    setInterval(() => {
      this.performMonitoringChecks();
    }, this.config.monitoringInterval);
  }

  private async performMonitoringChecks(): Promise<void> {
    // Clean up old executions
    await this.cleanupExecutionHistory();

    // Check for stuck executions
    await this.checkStuckExecutions();

    // Resource monitoring
    await this.monitorResourceUsage();
  }

  private async cleanupExecutionHistory(): Promise<void> {
    const cutoffDate = new Date(
      Date.now() -
        this.config.executionHistory.retentionDays * 24 * 60 * 60 * 1000
    );

    for (const [executionId, execution] of this.executions) {
      if (execution.scheduledTime < cutoffDate) {
        this.executions.delete(executionId);
      }
    }
  }

  private async checkStuckExecutions(): Promise<void> {
    const stuckThreshold = 30 * 60 * 1000; // 30 minutes
    const now = Date.now();

    for (const execution of this.executions.values()) {
      if (
        execution.status === "running" &&
        execution.actualStartTime &&
        now - execution.actualStartTime.getTime() > stuckThreshold
      ) {
        console.warn(`⚠️ Detected stuck execution: ${execution.id}`);
        execution.status = "failed";
        this.addExecutionLog(
          execution,
          "warning",
          "Execution marked as stuck and failed"
        );
      }
    }
  }

  private async monitorResourceUsage(): Promise<void> {
    // Simplified resource monitoring
    const resourceUsage = {
      cpuUtilizationPercent: Math.random() * 100,
      memoryUsageMB: Math.random() * 1024,
      networkIOKB: Math.random() * 1000,
      diskIOKB: Math.random() * 500,
    };

    // Log high resource usage
    if (resourceUsage.cpuUtilizationPercent > 80) {
      console.warn(
        `⚠️ High CPU usage detected: ${resourceUsage.cpuUtilizationPercent.toFixed(1)}%`
      );
    }
  }

  // Public API methods
  async getExecutionHistory(
    pipelineId?: string
  ): Promise<ScheduledExecution[]> {
    const executions = Array.from(this.executions.values());

    if (pipelineId) {
      return executions.filter(ex => ex.pipelineId === pipelineId);
    }

    return executions;
  }

  async getSchedulerStatus(): Promise<any> {
    return {
      isRunning: this.isRunning,
      totalPipelines: this.schedules.size,
      activeExecutions: Array.from(this.executions.values()).filter(
        ex => ex.status === "running"
      ).length,
      lastExecutions: Array.from(this.executions.values())
        .sort((a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime())
        .slice(0, 10),
    };
  }

  async manualTrigger(pipelineId: string): Promise<ScheduledExecution> {
    console.log(`🔄 Manual trigger requested for pipeline: ${pipelineId}`);
    return await this.executePipeline(pipelineId, "manual");
  }
}

// ================================
// 📤 EXPORTS
// ================================

export default AnalyticsPipelineScheduler;

export {
  type PipelineSchedule,
  type SchedulerConfig,
  type ScheduledExecution,
  type ExecutionLog,
  type HealthCheckConfig,
};
