/**
 * Web Scraping Scheduler
 * Task 36.14: Web Scraping Engine
 *
 * Handles automatic scheduling and execution of scraping tasks
 */

import WebScraper from "./web-scraper";
import { ScrapingTarget, DEFAULT_SCRAPING_TARGETS } from "./scraper-config";

export interface ScheduledTask {
  id: string;
  targetId: string;
  nextRunTime: Date;
  frequency: "hourly" | "daily" | "weekly" | "monthly";
  lastRunTime?: Date;
  isActive: boolean;
  retryCount: number;
  maxRetries: number;
}

export class ScrapingScheduler {
  private scheduledTasks: Map<string, ScheduledTask> = new Map();
  private intervalId: NodeJS.Timeout | null = null;
  private scraper: WebScraper;
  private isRunning = false;

  constructor() {
    this.scraper = new WebScraper();
    this.initializeScheduledTasks();
  }

  /**
   * Initialize scheduled tasks from scraping targets
   */
  private initializeScheduledTasks(): void {
    DEFAULT_SCRAPING_TARGETS.forEach(target => {
      if (target.enabled) {
        const task: ScheduledTask = {
          id: `scheduled-${target.id}`,
          targetId: target.id,
          nextRunTime: this.calculateNextRunTime(target.scrapeFrequency),
          frequency: target.scrapeFrequency,
          isActive: true,
          retryCount: 0,
          maxRetries: 3,
        };

        this.scheduledTasks.set(task.id, task);
      }
    });

    console.log(
      `Initialized ${this.scheduledTasks.size} scheduled scraping tasks`
    );
  }

  /**
   * Calculate next run time based on frequency
   */
  private calculateNextRunTime(
    frequency: "hourly" | "daily" | "weekly" | "monthly"
  ): Date {
    const now = new Date();

    switch (frequency) {
      case "hourly":
        return new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
      case "daily":
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      case "weekly":
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      case "monthly":
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default to daily
    }
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.isRunning) {
      console.log("Scheduler is already running");
      return;
    }

    this.isRunning = true;
    console.log("Starting scraping scheduler...");

    // Check for due tasks every 5 minutes
    this.intervalId = setInterval(
      () => {
        this.processDueTasks();
      },
      5 * 60 * 1000
    );

    // Run an initial check
    this.processDueTasks();
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      console.log("Scheduler is not running");
      return;
    }

    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log("Scraping scheduler stopped");
  }

  /**
   * Process tasks that are due for execution
   */
  private async processDueTasks(): Promise<void> {
    const now = new Date();
    const dueTasks = Array.from(this.scheduledTasks.values()).filter(
      task => task.isActive && task.nextRunTime <= now
    );

    if (dueTasks.length === 0) {
      return;
    }

    console.log(`Processing ${dueTasks.length} due scraping tasks`);

    for (const task of dueTasks) {
      try {
        await this.executeScheduledTask(task);
      } catch (error) {
        console.error(`Failed to execute scheduled task ${task.id}:`, error);
        this.handleTaskFailure(task, error);
      }
    }
  }

  /**
   * Execute a single scheduled task
   */
  private async executeScheduledTask(task: ScheduledTask): Promise<void> {
    const target = DEFAULT_SCRAPING_TARGETS.find(t => t.id === task.targetId);

    if (!target) {
      console.error(`Target not found for scheduled task: ${task.targetId}`);
      task.isActive = false;
      return;
    }

    console.log(`Executing scheduled scraping task: ${target.name}`);

    try {
      const result = await this.scraper.scrapeTarget(target);

      if (result.success) {
        // Task succeeded - reset retry count and schedule next run
        task.retryCount = 0;
        task.lastRunTime = new Date();
        task.nextRunTime = this.calculateNextRunTime(task.frequency);

        console.log(`Scheduled task completed successfully: ${target.name}`);
      } else {
        throw new Error(result.error || "Scraping failed");
      }
    } catch (error) {
      throw error; // Will be handled by processDueTasks
    }
  }

  /**
   * Handle task failure with retry logic
   */
  private handleTaskFailure(task: ScheduledTask, error: unknown): void {
    task.retryCount++;

    if (task.retryCount >= task.maxRetries) {
      console.error(`Task ${task.id} exceeded max retries, deactivating`);
      task.isActive = false;
    } else {
      // Schedule retry in 30 minutes
      task.nextRunTime = new Date(Date.now() + 30 * 60 * 1000);
      console.log(
        `Task ${task.id} will retry in 30 minutes (attempt ${task.retryCount}/${task.maxRetries})`
      );
    }
  }

  /**
   * Add a new scheduled task
   */
  addScheduledTask(target: ScrapingTarget): void {
    const task: ScheduledTask = {
      id: `scheduled-${target.id}`,
      targetId: target.id,
      nextRunTime: this.calculateNextRunTime(target.scrapeFrequency),
      frequency: target.scrapeFrequency,
      isActive: true,
      retryCount: 0,
      maxRetries: 3,
    };

    this.scheduledTasks.set(task.id, task);
    console.log(`Added scheduled task for target: ${target.name}`);
  }

  /**
   * Remove a scheduled task
   */
  removeScheduledTask(targetId: string): void {
    const taskId = `scheduled-${targetId}`;
    const removed = this.scheduledTasks.delete(taskId);

    if (removed) {
      console.log(`Removed scheduled task for target: ${targetId}`);
    }
  }

  /**
   * Get all scheduled tasks
   */
  getScheduledTasks(): ScheduledTask[] {
    return Array.from(this.scheduledTasks.values());
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    const tasks = Array.from(this.scheduledTasks.values());
    const activeTasks = tasks.filter(t => t.isActive);
    const dueTasks = tasks.filter(
      t => t.isActive && t.nextRunTime <= new Date()
    );

    return {
      isRunning: this.isRunning,
      totalTasks: tasks.length,
      activeTasks: activeTasks.length,
      dueTasks: dueTasks.length,
      nextDueTask: activeTasks.sort(
        (a, b) => a.nextRunTime.getTime() - b.nextRunTime.getTime()
      )[0]?.nextRunTime,
      scraperStatus: this.scraper.getScrapingStats(),
    };
  }

  /**
   * Manually trigger a specific task
   */
  async triggerTask(targetId: string): Promise<void> {
    const task = this.scheduledTasks.get(`scheduled-${targetId}`);

    if (!task) {
      throw new Error(`No scheduled task found for target: ${targetId}`);
    }

    if (!task.isActive) {
      throw new Error(`Task is inactive for target: ${targetId}`);
    }

    await this.executeScheduledTask(task);
  }

  /**
   * Update task frequency
   */
  updateTaskFrequency(
    targetId: string,
    frequency: "hourly" | "daily" | "weekly" | "monthly"
  ): void {
    const task = this.scheduledTasks.get(`scheduled-${targetId}`);

    if (!task) {
      throw new Error(`No scheduled task found for target: ${targetId}`);
    }

    task.frequency = frequency;
    task.nextRunTime = this.calculateNextRunTime(frequency);

    console.log(`Updated frequency for task ${targetId} to ${frequency}`);
  }

  /**
   * Activate/deactivate a task
   */
  setTaskActive(targetId: string, isActive: boolean): void {
    const task = this.scheduledTasks.get(`scheduled-${targetId}`);

    if (!task) {
      throw new Error(`No scheduled task found for target: ${targetId}`);
    }

    task.isActive = isActive;
    task.retryCount = 0; // Reset retry count when reactivating

    if (isActive) {
      task.nextRunTime = this.calculateNextRunTime(task.frequency);
    }

    console.log(`Task ${targetId} ${isActive ? "activated" : "deactivated"}`);
  }
}

// Singleton instance for global use
let schedulerInstance: ScrapingScheduler | null = null;

export function getScrapingScheduler(): ScrapingScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new ScrapingScheduler();
  }
  return schedulerInstance;
}

export default ScrapingScheduler;
