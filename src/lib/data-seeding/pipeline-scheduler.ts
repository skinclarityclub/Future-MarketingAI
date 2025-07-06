/**
 * Analytics Data Pipeline Scheduler
 *
 * Manages execution timing, dependencies, and orchestration
 * for analytics data seeding pipelines.
 */

// ================================
// 📅 SCHEDULER CORE
// ================================

export interface PipelineSchedule {
  pipelineId: string;
  frequency: "hourly" | "daily" | "weekly" | "real-time";
  priority: number;
  dependencies: string[];
  executionWindow: {
    startHour: number;
    endHour: number;
    timezone: string;
  };
}

export interface ScheduledExecution {
  id: string;
  pipelineId: string;
  scheduledTime: Date;
  status: "scheduled" | "running" | "completed" | "failed" | "skipped";
  retryAttempt: number;
  processingTimeMs?: number;
  recordsProcessed?: number;
}

export class AnalyticsPipelineScheduler {
  private schedules: Map<string, PipelineSchedule> = new Map();
  private executions: Map<string, ScheduledExecution> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  constructor() {
    this.loadDefaultSchedules();
  }

  private loadDefaultSchedules(): void {
    const defaultSchedules: PipelineSchedule[] = [
      {
        pipelineId: "advanced-ml-pipeline",
        frequency: "hourly",
        priority: 1,
        dependencies: [],
        executionWindow: { startHour: 0, endHour: 23, timezone: "UTC" },
      },
      {
        pipelineId: "tactical-ml-pipeline",
        frequency: "hourly",
        priority: 2,
        dependencies: [],
        executionWindow: { startHour: 1, endHour: 23, timezone: "UTC" },
      },
      {
        pipelineId: "roi-algorithm-pipeline",
        frequency: "daily",
        priority: 3,
        dependencies: ["advanced-ml-pipeline"],
        executionWindow: { startHour: 2, endHour: 6, timezone: "UTC" },
      },
      {
        pipelineId: "optimization-engine-pipeline",
        frequency: "daily",
        priority: 4,
        dependencies: ["roi-algorithm-pipeline"],
        executionWindow: { startHour: 3, endHour: 7, timezone: "UTC" },
      },
      {
        pipelineId: "predictive-analytics-pipeline",
        frequency: "real-time",
        priority: 5,
        dependencies: [],
        executionWindow: { startHour: 0, endHour: 23, timezone: "UTC" },
      },
    ];

    defaultSchedules.forEach(schedule => {
      this.schedules.set(schedule.pipelineId, schedule);
    });
  }

  async start(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log("🚀 Starting Analytics Pipeline Scheduler");

    for (const [pipelineId, schedule] of this.schedules) {
      await this.schedulePipeline(pipelineId, schedule);
    }

    console.log("✅ Analytics Pipeline Scheduler started");
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    this.isRunning = false;
    console.log("🛑 Stopping Analytics Pipeline Scheduler");

    for (const timer of this.timers.values()) {
      clearTimeout(timer);
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
        await this.executePipeline(pipelineId);
        await this.schedulePipeline(pipelineId, schedule);
      }, delay);

      this.timers.set(pipelineId, timer);
      console.log(
        `📅 Scheduled ${pipelineId} for ${nextExecution.toISOString()}`
      );
    }
  }

  private calculateNextExecution(schedule: PipelineSchedule): Date {
    const now = new Date();
    const next = new Date(now);

    switch (schedule.frequency) {
      case "hourly":
        next.setHours(next.getHours() + 1, 0, 0, 0);
        break;
      case "daily":
        next.setDate(next.getDate() + 1);
        next.setHours(schedule.executionWindow.startHour, 0, 0, 0);
        break;
      case "real-time":
        next.setMinutes(next.getMinutes() + 5, 0, 0); // Every 5 minutes
        break;
      default:
        next.setHours(next.getHours() + 1, 0, 0, 0);
    }

    return next;
  }

  private async executePipeline(
    pipelineId: string
  ): Promise<ScheduledExecution> {
    const executionId = `${pipelineId}-${Date.now()}`;
    const schedule = this.schedules.get(pipelineId);

    if (!schedule) {
      throw new Error(`No schedule found for pipeline: ${pipelineId}`);
    }

    // Check dependencies
    if (!(await this.checkDependencies(schedule.dependencies))) {
      console.log(`⏸️ Skipping ${pipelineId} - dependencies not met`);
      return this.createSkippedExecution(executionId, pipelineId);
    }

    const execution: ScheduledExecution = {
      id: executionId,
      pipelineId,
      scheduledTime: new Date(),
      status: "running",
      retryAttempt: 0,
    };

    this.executions.set(executionId, execution);
    console.log(`🚀 Executing pipeline: ${pipelineId}`);

    try {
      const startTime = Date.now();

      // Simulate pipeline execution
      await new Promise(resolve => setTimeout(resolve, 2000));

      execution.status = "completed";
      execution.processingTimeMs = Date.now() - startTime;
      execution.recordsProcessed = Math.floor(Math.random() * 10000) + 1000;

      console.log(`✅ Pipeline ${pipelineId} completed successfully`);

      // Trigger dependent pipelines
      await this.triggerDependentPipelines(pipelineId);
    } catch (error) {
      execution.status = "failed";
      console.error(`❌ Pipeline ${pipelineId} failed:`, error);
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
    const executions = Array.from(this.executions.values())
      .filter(ex => ex.pipelineId === pipelineId)
      .sort((a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime());

    return executions.length > 0 ? executions[0] : null;
  }

  private createSkippedExecution(
    executionId: string,
    pipelineId: string
  ): ScheduledExecution {
    const execution: ScheduledExecution = {
      id: executionId,
      pipelineId,
      scheduledTime: new Date(),
      status: "skipped",
      retryAttempt: 0,
    };

    this.executions.set(executionId, execution);
    return execution;
  }

  private async triggerDependentPipelines(
    completedPipelineId: string
  ): Promise<void> {
    for (const [pipelineId, schedule] of this.schedules) {
      if (schedule.dependencies.includes(completedPipelineId)) {
        console.log(`🔗 Triggering dependent pipeline: ${pipelineId}`);
        await this.executePipeline(pipelineId);
      }
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

    return executions.sort(
      (a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime()
    );
  }

  async getSchedulerStatus(): Promise<any> {
    return {
      isRunning: this.isRunning,
      totalPipelines: this.schedules.size,
      activeExecutions: Array.from(this.executions.values()).filter(
        ex => ex.status === "running"
      ).length,
      recentExecutions: Array.from(this.executions.values())
        .sort((a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime())
        .slice(0, 10),
    };
  }

  async manualTrigger(pipelineId: string): Promise<ScheduledExecution> {
    console.log(`🔄 Manual trigger for pipeline: ${pipelineId}`);
    return await this.executePipeline(pipelineId);
  }
}

export default AnalyticsPipelineScheduler;
