/**
 * Automatic Winner Selection Scheduler
 * Continuously monitors A/B tests and triggers automatic winner selection when criteria are met
 */

import { createClient } from "@/lib/supabase/client";
import {
  TestConclusionEngine,
  createTestConclusionEngine,
} from "./test-conclusion-engine";
import {
  StatisticalSignificanceEngine,
  PerformanceMonitor,
} from "./statistical-engine";

export interface SchedulerConfig {
  enabled: boolean;
  checkInterval: number; // minutes
  maxConcurrentEvaluations: number;
  defaultCriteria: {
    minimumConfidence: number;
    minimumImprovement: number;
    riskTolerance: "conservative" | "moderate" | "aggressive";
  };
  notifications: {
    enabled: boolean;
    channels: string[];
    stakeholders: string[];
  };
}

export interface TestEvaluationResult {
  testId: string;
  evaluated: boolean;
  winnerSelected: boolean;
  winnerVariantId?: string;
  confidence?: number;
  improvement?: number;
  implementationStrategy?: string;
  error?: string;
}

export interface SchedulerMetrics {
  totalTestsMonitored: number;
  testsEvaluatedToday: number;
  winnersSelectedToday: number;
  averageEvaluationTime: number;
  successRate: number;
  lastRunTime: Date;
  nextRunTime: Date;
}

export class AutomaticWinnerScheduler {
  private config: SchedulerConfig;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private conclusionEngine: TestConclusionEngine;
  private metrics: SchedulerMetrics;
  private activeEvaluations: Set<string> = new Set();

  constructor(config: Partial<SchedulerConfig> = {}) {
    this.config = {
      enabled: true,
      checkInterval: 30, // 30 minutes
      maxConcurrentEvaluations: 5,
      defaultCriteria: {
        minimumConfidence: 95,
        minimumImprovement: 5,
        riskTolerance: "moderate",
      },
      notifications: {
        enabled: true,
        channels: ["email", "slack"],
        stakeholders: ["marketing@company.com", "data@company.com"],
      },
      ...config,
    };

    // Initialize engines
    const statisticalEngine = new StatisticalSignificanceEngine();
    const performanceMonitor = new PerformanceMonitor();
    this.conclusionEngine = createTestConclusionEngine(
      statisticalEngine,
      performanceMonitor,
      this.config.defaultCriteria
    );

    // Initialize metrics
    this.metrics = {
      totalTestsMonitored: 0,
      testsEvaluatedToday: 0,
      winnersSelectedToday: 0,
      averageEvaluationTime: 0,
      successRate: 100,
      lastRunTime: new Date(),
      nextRunTime: this.calculateNextRunTime(),
    };
  }

  /**
   * Start the automatic scheduler
   */
  start(): void {
    if (this.isRunning) {
      console.log("[AutoWinnerScheduler] Already running");
      return;
    }

    if (!this.config.enabled) {
      console.log("[AutoWinnerScheduler] Scheduler is disabled");
      return;
    }

    console.log(
      `[AutoWinnerScheduler] Starting with ${this.config.checkInterval}min intervals`
    );

    this.isRunning = true;

    // Run immediately
    this.runEvaluationCycle();

    // Set up recurring schedule
    this.intervalId = setInterval(
      () => {
        this.runEvaluationCycle();
      },
      this.config.checkInterval * 60 * 1000
    );
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      console.log("[AutoWinnerScheduler] Not running");
      return;
    }

    console.log("[AutoWinnerScheduler] Stopping scheduler");

    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Force run evaluation cycle
   */
  async forceRun(): Promise<TestEvaluationResult[]> {
    console.log("[AutoWinnerScheduler] Force running evaluation cycle");
    return await this.runEvaluationCycle();
  }

  /**
   * Get current scheduler metrics
   */
  getMetrics(): SchedulerMetrics {
    return { ...this.metrics };
  }

  /**
   * Update scheduler configuration
   */
  updateConfig(newConfig: Partial<SchedulerConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (this.isRunning && this.intervalId) {
      // Restart with new interval if changed
      this.stop();
      this.start();
    }

    console.log("[AutoWinnerScheduler] Configuration updated");
  }

  /**
   * Main evaluation cycle
   */
  private async runEvaluationCycle(): Promise<TestEvaluationResult[]> {
    const startTime = Date.now();
    console.log("[AutoWinnerScheduler] Starting evaluation cycle");

    try {
      // Fetch eligible tests
      const eligibleTests = await this.fetchEligibleTests();
      console.log(
        `[AutoWinnerScheduler] Found ${eligibleTests.length} eligible tests`
      );

      this.metrics.totalTestsMonitored = eligibleTests.length;

      if (eligibleTests.length === 0) {
        this.metrics.lastRunTime = new Date();
        this.metrics.nextRunTime = this.calculateNextRunTime();
        return [];
      }

      // Limit concurrent evaluations
      const testsToEvaluate = eligibleTests.slice(
        0,
        this.config.maxConcurrentEvaluations
      );

      // Evaluate tests in parallel
      const evaluationPromises = testsToEvaluate.map(test =>
        this.evaluateTest(test)
      );

      const results = await Promise.allSettled(evaluationPromises);

      // Process results
      const evaluationResults: TestEvaluationResult[] = [];
      let successCount = 0;

      results.forEach((result, index) => {
        const testId = testsToEvaluate[index].id;

        if (result.status === "fulfilled") {
          evaluationResults.push(result.value);
          if (result.value.evaluated) {
            successCount++;
            this.metrics.testsEvaluatedToday++;

            if (result.value.winnerSelected) {
              this.metrics.winnersSelectedToday++;
            }
          }
        } else {
          console.error(
            `[AutoWinnerScheduler] Error evaluating test ${testId}:`,
            result.reason
          );
          evaluationResults.push({
            testId,
            evaluated: false,
            winnerSelected: false,
            error: result.reason?.message || "Unknown error",
          });
        }
      });

      // Update metrics
      const endTime = Date.now();
      const evaluationTime = endTime - startTime;

      this.metrics.averageEvaluationTime = evaluationTime;
      this.metrics.successRate = (successCount / testsToEvaluate.length) * 100;
      this.metrics.lastRunTime = new Date();
      this.metrics.nextRunTime = this.calculateNextRunTime();

      // Log cycle summary
      console.log(
        `[AutoWinnerScheduler] Cycle completed: ${successCount}/${testsToEvaluate.length} successful, ${evaluationResults.filter(r => r.winnerSelected).length} winners selected`
      );

      // Send notifications if any winners were selected
      const winnersSelected = evaluationResults.filter(r => r.winnerSelected);
      if (winnersSelected.length > 0 && this.config.notifications.enabled) {
        await this.sendCycleNotifications(winnersSelected);
      }

      return evaluationResults;
    } catch (error) {
      console.error("[AutoWinnerScheduler] Error in evaluation cycle:", error);
      this.metrics.lastRunTime = new Date();
      this.metrics.nextRunTime = this.calculateNextRunTime();
      return [];
    }
  }

  /**
   * Fetch tests eligible for automatic winner selection
   */
  private async fetchEligibleTests(): Promise<any[]> {
    try {
      const supabase = createClient();
      const now = new Date();
      const minimumDurationAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

      // Query multiple test tables
      const queries = [
        supabase
          .from("content_ab_tests")
          .select("*")
          .eq("status", "running")
          .eq("auto_declare_winner", true)
          .lt("start_date", minimumDurationAgo.toISOString()),

        supabase
          .from("workflow_ab_tests")
          .select("*")
          .eq("status", "running")
          .eq("auto_declare_winner", true)
          .lt("start_date", minimumDurationAgo.toISOString()),

        supabase
          .from("campaign_ab_tests")
          .select("*")
          .eq("status", "running")
          .eq("auto_declare_winner", true)
          .lt("start_date", minimumDurationAgo.toISOString()),
      ];

      const results = await Promise.allSettled(queries);

      const allTests: any[] = [];
      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value.data) {
          const testsWithType = result.value.data.map(test => ({
            ...test,
            test_type:
              index === 0 ? "content" : index === 1 ? "workflow" : "campaign",
          }));
          allTests.push(...testsWithType);
        }
      });

      // Filter out tests currently being evaluated
      const eligibleTests = allTests.filter(
        test => !this.activeEvaluations.has(test.id)
      );

      return eligibleTests;
    } catch (error) {
      console.error(
        "[AutoWinnerScheduler] Error fetching eligible tests:",
        error
      );
      return [];
    }
  }

  /**
   * Evaluate a single test for winner selection
   */
  private async evaluateTest(test: any): Promise<TestEvaluationResult> {
    const testId = test.id;

    try {
      // Mark as being evaluated
      this.activeEvaluations.add(testId);

      console.log(`[AutoWinnerScheduler] Evaluating test ${testId}`);

      // Call the automatic winner selection API
      const response = await fetch(
        "/api/ab-testing/automatic-winner-selection",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            test_id: testId,
            force_evaluation: false,
            implementation_strategy: this.determineImplementationStrategy(test),
            custom_criteria: this.config.defaultCriteria,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `API call failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      return {
        testId,
        evaluated: result.evaluation_completed,
        winnerSelected: result.status === "concluded",
        winnerVariantId: result.conclusion?.selectedWinner?.variantId,
        confidence: result.conclusion?.selectedWinner?.confidence,
        improvement: result.conclusion?.selectedWinner?.expectedImprovement,
        implementationStrategy:
          result.conclusion?.selectedWinner?.implementationStrategy,
      };
    } catch (error) {
      console.error(
        `[AutoWinnerScheduler] Error evaluating test ${testId}:`,
        error
      );
      return {
        testId,
        evaluated: false,
        winnerSelected: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      // Remove from active evaluations
      this.activeEvaluations.delete(testId);
    }
  }

  /**
   * Determine implementation strategy based on test characteristics
   */
  private determineImplementationStrategy(
    test: any
  ): "immediate" | "gradual" | "staged" | "delayed" {
    // Business logic to determine strategy
    if (test.test_type === "content" && test.target_audience_size < 10000) {
      return "immediate";
    }

    if (test.test_type === "workflow" || test.target_audience_size > 100000) {
      return "staged";
    }

    return "gradual";
  }

  /**
   * Send notifications about cycle results
   */
  private async sendCycleNotifications(
    winnersSelected: TestEvaluationResult[]
  ) {
    try {
      const notificationData = {
        timestamp: new Date().toISOString(),
        cycle_summary: {
          winners_selected: winnersSelected.length,
          total_tests_monitored: this.metrics.totalTestsMonitored,
          success_rate: this.metrics.successRate,
        },
        winners: winnersSelected.map(winner => ({
          test_id: winner.testId,
          variant_id: winner.winnerVariantId,
          confidence: winner.confidence,
          improvement: winner.improvement,
          strategy: winner.implementationStrategy,
        })),
      };

      // In a real implementation, this would send to notification service
      console.log(
        "[AutoWinnerScheduler] Sending cycle notifications:",
        notificationData
      );

      // Could integrate with:
      // - Email service
      // - Slack webhooks
      // - Teams notifications
      // - Internal notification system
    } catch (error) {
      console.error(
        "[AutoWinnerScheduler] Error sending cycle notifications:",
        error
      );
    }
  }

  /**
   * Calculate next run time
   */
  private calculateNextRunTime(): Date {
    const next = new Date();
    next.setMinutes(next.getMinutes() + this.config.checkInterval);
    return next;
  }

  /**
   * Reset daily metrics (call at midnight)
   */
  resetDailyMetrics(): void {
    this.metrics.testsEvaluatedToday = 0;
    this.metrics.winnersSelectedToday = 0;
    console.log("[AutoWinnerScheduler] Daily metrics reset");
  }
}

// Singleton instance for global use
let schedulerInstance: AutomaticWinnerScheduler | null = null;

/**
 * Get or create the global scheduler instance
 */
export function getSchedulerInstance(
  config?: Partial<SchedulerConfig>
): AutomaticWinnerScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new AutomaticWinnerScheduler(config);
  }
  return schedulerInstance;
}

/**
 * Start the global scheduler
 */
export function startGlobalScheduler(config?: Partial<SchedulerConfig>): void {
  const scheduler = getSchedulerInstance(config);
  scheduler.start();
}

/**
 * Stop the global scheduler
 */
export function stopGlobalScheduler(): void {
  if (schedulerInstance) {
    schedulerInstance.stop();
  }
}

/**
 * Initialize scheduler with environment-based configuration
 */
export function initializeScheduler(): AutomaticWinnerScheduler {
  const config: Partial<SchedulerConfig> = {
    enabled: process.env.AB_TESTING_SCHEDULER_ENABLED !== "false",
    checkInterval: parseInt(process.env.AB_TESTING_CHECK_INTERVAL || "30"),
    maxConcurrentEvaluations: parseInt(
      process.env.AB_TESTING_MAX_CONCURRENT || "5"
    ),
    defaultCriteria: {
      minimumConfidence: parseInt(
        process.env.AB_TESTING_MIN_CONFIDENCE || "95"
      ),
      minimumImprovement: parseInt(
        process.env.AB_TESTING_MIN_IMPROVEMENT || "5"
      ),
      riskTolerance:
        (process.env.AB_TESTING_RISK_TOLERANCE as any) || "moderate",
    },
    notifications: {
      enabled: process.env.AB_TESTING_NOTIFICATIONS_ENABLED !== "false",
      channels: process.env.AB_TESTING_NOTIFICATION_CHANNELS?.split(",") || [
        "email",
      ],
      stakeholders: process.env.AB_TESTING_STAKEHOLDERS?.split(",") || [],
    },
  };

  return getSchedulerInstance(config);
}
