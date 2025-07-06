/**
 * Tactical Scalability Engine
 * Advanced auto-scaling, load balancing, and resource optimization for tactical analysis
 */

import { EventEmitter } from "events";

// Core Scalability Types
export interface ScalabilityMetrics {
  timestamp: number;
  cpu_usage: number;
  memory_usage: number;
  active_connections: number;
  queue_size: number;
  throughput_per_second: number;
  response_time_avg: number;
  error_rate: number;
  cache_hit_rate: number;
  disk_io: number;
  network_io: number;
}

export interface WorkerNode {
  id: string;
  status: "active" | "standby" | "overloaded" | "offline";
  cpu_usage: number;
  memory_usage: number;
  active_tasks: number;
  max_tasks: number;
  created_at: number;
  last_heartbeat: number;
  performance_score: number;
}

export interface LoadBalancingStrategy {
  type: "round_robin" | "least_connections" | "cpu_based" | "performance_based";
  weight_factors: {
    cpu: number;
    memory: number;
    connections: number;
    response_time: number;
  };
}

export interface AutoScalingConfig {
  enabled: boolean;
  min_workers: number;
  max_workers: number;
  scale_up_threshold: {
    cpu_percent: number;
    memory_percent: number;
    queue_size: number;
    response_time_ms: number;
  };
  scale_down_threshold: {
    cpu_percent: number;
    memory_percent: number;
    idle_time_minutes: number;
  };
  cooldown_period_ms: number;
}

export interface ResourcePool {
  connections: Map<string, any>;
  workers: Map<string, WorkerNode>;
  caches: Map<string, any>;
  queues: Map<string, any[]>;
}

/**
 * Advanced Tactical Scalability Engine
 */
export class TacticalScalabilityEngine extends EventEmitter {
  private resourcePool: ResourcePool;
  private scalabilityMetrics: ScalabilityMetrics[] = [];
  private loadBalancer: LoadBalancingStrategy;
  private autoScalingConfig: AutoScalingConfig;
  private performanceBaseline: ScalabilityMetrics | null = null;
  private lastScalingAction: number = 0;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private optimizationInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<AutoScalingConfig> = {}) {
    super();

    this.resourcePool = {
      connections: new Map(),
      workers: new Map(),
      caches: new Map(),
      queues: new Map(),
    };

    this.loadBalancer = {
      type: "performance_based",
      weight_factors: {
        cpu: 0.3,
        memory: 0.25,
        connections: 0.25,
        response_time: 0.2,
      },
    };

    this.autoScalingConfig = {
      enabled: true,
      min_workers: 2,
      max_workers: 10,
      scale_up_threshold: {
        cpu_percent: 75,
        memory_percent: 80,
        queue_size: 100,
        response_time_ms: 3000,
      },
      scale_down_threshold: {
        cpu_percent: 30,
        memory_percent: 40,
        idle_time_minutes: 10,
      },
      cooldown_period_ms: 5 * 60 * 1000, // 5 minutes
      ...config,
    };

    this.initializeScalabilityEngine();
  }

  /**
   * Initialize the scalability engine
   */
  private initializeScalabilityEngine(): void {
    // Create initial worker nodes
    for (let i = 0; i < this.autoScalingConfig.min_workers; i++) {
      this.createWorkerNode();
    }

    // Start monitoring and optimization
    this.startPerformanceMonitoring();
    this.startResourceOptimization();

    // Tactical Scalability Engine initialized
    this.emit("engine_started", {
      workers: this.resourcePool.workers.size,
      strategy: this.loadBalancer.type,
    });
  }

  /**
   * Auto-scaling logic based on current metrics
   */
  async performAutoScaling(): Promise<void> {
    if (!this.autoScalingConfig.enabled) return;

    const currentTime = Date.now();
    const cooldownPeriod = this.autoScalingConfig.cooldown_period_ms;

    // Check cooldown period
    if (currentTime - this.lastScalingAction < cooldownPeriod) {
      return;
    }

    const currentMetrics = this.getCurrentMetrics();
    const workersCount = this.resourcePool.workers.size;
    const scaleUpThreshold = this.autoScalingConfig.scale_up_threshold;
    const scaleDownThreshold = this.autoScalingConfig.scale_down_threshold;

    // Scale up conditions
    const shouldScaleUp =
      workersCount < this.autoScalingConfig.max_workers &&
      (currentMetrics.cpu_usage > scaleUpThreshold.cpu_percent ||
        currentMetrics.memory_usage > scaleUpThreshold.memory_percent ||
        currentMetrics.queue_size > scaleUpThreshold.queue_size ||
        currentMetrics.response_time_avg > scaleUpThreshold.response_time_ms);

    // Scale down conditions
    const shouldScaleDown =
      workersCount > this.autoScalingConfig.min_workers &&
      currentMetrics.cpu_usage < scaleDownThreshold.cpu_percent &&
      currentMetrics.memory_usage < scaleDownThreshold.memory_percent &&
      this.getIdleTime() > scaleDownThreshold.idle_time_minutes * 60 * 1000;

    if (shouldScaleUp) {
      await this.scaleUp();
    } else if (shouldScaleDown) {
      await this.scaleDown();
    }
  }

  /**
   * Intelligent load balancing with multiple strategies
   */
  selectOptimalWorker(
    taskComplexity: "low" | "medium" | "high" = "medium"
  ): WorkerNode | null {
    const availableWorkers = Array.from(
      this.resourcePool.workers.values()
    ).filter(
      worker =>
        worker.status === "active" && worker.active_tasks < worker.max_tasks
    );

    if (availableWorkers.length === 0) return null;

    switch (this.loadBalancer.type) {
      case "performance_based":
      default:
        return this.performanceBasedSelection(availableWorkers, taskComplexity);
    }
  }

  /**
   * Performance-based worker selection
   */
  private performanceBasedSelection(
    workers: WorkerNode[],
    taskComplexity: string
  ): WorkerNode {
    const weights = this.loadBalancer.weight_factors;

    return workers.reduce((best, current) => {
      const currentScore = this.calculateWorkerScore(
        current,
        taskComplexity,
        weights
      );
      const bestScore = this.calculateWorkerScore(
        best,
        taskComplexity,
        weights
      );

      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * Calculate worker performance score
   */
  private calculateWorkerScore(
    worker: WorkerNode,
    taskComplexity: string,
    weights: any
  ): number {
    const cpuScore = Math.max(0, 100 - worker.cpu_usage);
    const memoryScore = Math.max(0, 100 - worker.memory_usage);
    const connectionScore = Math.max(
      0,
      100 - (worker.active_tasks / worker.max_tasks) * 100
    );
    const performanceScore = worker.performance_score;

    // Adjust for task complexity
    const complexityMultiplier =
      taskComplexity === "high" ? 0.8 : taskComplexity === "low" ? 1.2 : 1.0;

    return (
      (cpuScore * weights.cpu +
        memoryScore * weights.memory +
        connectionScore * weights.connections +
        performanceScore * weights.response_time) *
      complexityMultiplier
    );
  }

  /**
   * Get current scalability metrics
   */
  getCurrentMetrics(): ScalabilityMetrics {
    return (
      this.scalabilityMetrics[this.scalabilityMetrics.length - 1] || {
        timestamp: Date.now(),
        cpu_usage: 0,
        memory_usage: 0,
        active_connections: 0,
        queue_size: 0,
        throughput_per_second: 0,
        response_time_avg: 0,
        error_rate: 0,
        cache_hit_rate: 0,
        disk_io: 0,
        network_io: 0,
      }
    );
  }

  /**
   * Get scalability report
   */
  getScalabilityReport(): {
    current_metrics: ScalabilityMetrics;
    workers: WorkerNode[];
    auto_scaling_config: AutoScalingConfig;
    load_balancing: LoadBalancingStrategy;
    performance_trends: {
      cpu_trend: "increasing" | "decreasing" | "stable";
      memory_trend: "increasing" | "decreasing" | "stable";
      throughput_trend: "increasing" | "decreasing" | "stable";
    };
    recommendations: string[];
  } {
    const currentMetrics = this.getCurrentMetrics();
    const trends = this.analyzePerformanceTrends();
    const recommendations = this.generateScalabilityRecommendations(
      currentMetrics,
      trends
    );

    return {
      current_metrics: currentMetrics,
      workers: Array.from(this.resourcePool.workers.values()),
      auto_scaling_config: this.autoScalingConfig,
      load_balancing: this.loadBalancer,
      performance_trends: trends,
      recommendations,
    };
  }

  // Private helper methods
  private createWorkerNode(): WorkerNode {
    const workerId = `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const worker: WorkerNode = {
      id: workerId,
      status: "active",
      cpu_usage: Math.random() * 20 + 10, // 10-30% initial usage
      memory_usage: Math.random() * 30 + 20, // 20-50% initial usage
      active_tasks: 0,
      max_tasks: 50,
      created_at: Date.now(),
      last_heartbeat: Date.now(),
      performance_score: 100,
    };

    this.resourcePool.workers.set(workerId, worker);
    return worker;
  }

  private async scaleUp(): Promise<void> {
    const newWorker = this.createWorkerNode();
    this.lastScalingAction = Date.now();

    console.log(`📈 Scaling UP: Added worker ${newWorker.id}`);
    this.emit("scale_up", {
      workerId: newWorker.id,
      totalWorkers: this.resourcePool.workers.size,
      reason: "High load detected",
    });
  }

  private async scaleDown(): Promise<void> {
    const workers = Array.from(this.resourcePool.workers.values());
    if (workers.length > this.autoScalingConfig.min_workers) {
      const workerToRemove = workers[workers.length - 1];
      this.resourcePool.workers.delete(workerToRemove.id);
      this.lastScalingAction = Date.now();

      console.log(`📉 Scaling DOWN: Removed worker ${workerToRemove.id}`);
      this.emit("scale_down", {
        workerId: workerToRemove.id,
        totalWorkers: this.resourcePool.workers.size,
        reason: "Low load detected",
      });
    }
  }

  private getIdleTime(): number {
    return 15 * 60 * 1000; // Simulate 15 minutes idle time
  }

  private startPerformanceMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      const metrics = this.collectMetrics();
      this.scalabilityMetrics.push(metrics);

      // Keep only last 100 metrics
      if (this.scalabilityMetrics.length > 100) {
        this.scalabilityMetrics = this.scalabilityMetrics.slice(-100);
      }

      // Trigger auto-scaling check
      this.performAutoScaling();

      this.emit("metrics_collected", metrics);
    }, 30000); // Every 30 seconds
  }

  private startResourceOptimization(): void {
    this.optimizationInterval = setInterval(
      () => {
        this.optimizeResources();
      },
      5 * 60 * 1000
    ); // Every 5 minutes
  }

  private collectMetrics(): ScalabilityMetrics {
    const workers = Array.from(this.resourcePool.workers.values());
    const avgCpuUsage =
      workers.reduce((sum, w) => sum + w.cpu_usage, 0) / workers.length || 0;
    const avgMemoryUsage =
      workers.reduce((sum, w) => sum + w.memory_usage, 0) / workers.length || 0;
    const totalConnections = workers.reduce(
      (sum, w) => sum + w.active_tasks,
      0
    );

    // Simulate realistic fluctuations
    const cpuVariation = (Math.random() - 0.5) * 10;
    const memoryVariation = (Math.random() - 0.5) * 8;

    return {
      timestamp: Date.now(),
      cpu_usage: Math.max(0, Math.min(100, avgCpuUsage + cpuVariation)),
      memory_usage: Math.max(
        0,
        Math.min(100, avgMemoryUsage + memoryVariation)
      ),
      active_connections: totalConnections,
      queue_size: Math.floor(Math.random() * 50),
      throughput_per_second: 50 + Math.random() * 100,
      response_time_avg: 200 + Math.random() * 800,
      error_rate: Math.random() * 2,
      cache_hit_rate: 85 + Math.random() * 10,
      disk_io: Math.random() * 30 + 10,
      network_io: Math.random() * 50 + 20,
    };
  }

  private optimizeResources(): void {
    // Update worker performance scores
    for (const worker of this.resourcePool.workers.values()) {
      worker.cpu_usage = Math.max(
        0,
        worker.cpu_usage + (Math.random() - 0.5) * 5
      );
      worker.memory_usage = Math.max(
        0,
        worker.memory_usage + (Math.random() - 0.5) * 3
      );
      worker.last_heartbeat = Date.now();

      // Update performance score based on current load
      const loadFactor = (worker.cpu_usage + worker.memory_usage) / 200;
      worker.performance_score = Math.max(10, 100 - loadFactor * 50);
    }

    this.emit("resources_optimized", {
      timestamp: Date.now(),
      workers: this.resourcePool.workers.size,
    });
  }

  private analyzePerformanceTrends(): {
    cpu_trend: "increasing" | "decreasing" | "stable";
    memory_trend: "increasing" | "decreasing" | "stable";
    throughput_trend: "increasing" | "decreasing" | "stable";
  } {
    const recentMetrics = this.scalabilityMetrics.slice(-10);
    if (recentMetrics.length < 5) {
      return {
        cpu_trend: "stable",
        memory_trend: "stable",
        throughput_trend: "stable",
      };
    }

    const firstHalf = recentMetrics.slice(
      0,
      Math.floor(recentMetrics.length / 2)
    );
    const secondHalf = recentMetrics.slice(
      Math.floor(recentMetrics.length / 2)
    );

    const avgCpuFirst =
      firstHalf.reduce((sum, m) => sum + m.cpu_usage, 0) / firstHalf.length;
    const avgCpuSecond =
      secondHalf.reduce((sum, m) => sum + m.cpu_usage, 0) / secondHalf.length;

    const avgMemoryFirst =
      firstHalf.reduce((sum, m) => sum + m.memory_usage, 0) / firstHalf.length;
    const avgMemorySecond =
      secondHalf.reduce((sum, m) => sum + m.memory_usage, 0) /
      secondHalf.length;

    const avgThroughputFirst =
      firstHalf.reduce((sum, m) => sum + m.throughput_per_second, 0) /
      firstHalf.length;
    const avgThroughputSecond =
      secondHalf.reduce((sum, m) => sum + m.throughput_per_second, 0) /
      secondHalf.length;

    const threshold = 5; // 5% change threshold

    return {
      cpu_trend:
        Math.abs(avgCpuSecond - avgCpuFirst) < threshold
          ? "stable"
          : avgCpuSecond > avgCpuFirst
            ? "increasing"
            : "decreasing",
      memory_trend:
        Math.abs(avgMemorySecond - avgMemoryFirst) < threshold
          ? "stable"
          : avgMemorySecond > avgMemoryFirst
            ? "increasing"
            : "decreasing",
      throughput_trend:
        Math.abs(avgThroughputSecond - avgThroughputFirst) < threshold
          ? "stable"
          : avgThroughputSecond > avgThroughputFirst
            ? "increasing"
            : "decreasing",
    };
  }

  private generateScalabilityRecommendations(
    metrics: ScalabilityMetrics,
    trends: any
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.cpu_usage > 80) {
      recommendations.push(
        "🔥 High CPU usage detected - consider adding more workers"
      );
    }

    if (metrics.memory_usage > 85) {
      recommendations.push(
        "💾 High memory usage - optimize memory allocation or scale up"
      );
    }

    if (metrics.response_time_avg > 3000) {
      recommendations.push(
        "⏰ High response times - check for bottlenecks or increase capacity"
      );
    }

    if (metrics.cache_hit_rate < 70) {
      recommendations.push("📦 Low cache hit rate - review caching strategy");
    }

    if (trends.cpu_trend === "increasing") {
      recommendations.push("📈 CPU usage trending up - prepare for scaling");
    }

    if (this.resourcePool.workers.size < this.autoScalingConfig.min_workers) {
      recommendations.push("⚠️ Below minimum workers - add more worker nodes");
    }

    if (recommendations.length === 0) {
      recommendations.push("✅ System performance is optimal");
    }

    return recommendations;
  }

  /**
   * Shutdown the scalability engine
   */
  shutdown(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
    }

    this.emit("engine_shutdown", {
      final_workers: this.resourcePool.workers.size,
      metrics_collected: this.scalabilityMetrics.length,
    });

    console.log("🛑 Tactical Scalability Engine shutdown");
  }
}

// Singleton instance
export const tacticalScalabilityEngine = new TacticalScalabilityEngine({
  enabled: true,
  min_workers: 3,
  max_workers: 12,
  scale_up_threshold: {
    cpu_percent: 70,
    memory_percent: 75,
    queue_size: 80,
    response_time_ms: 2500,
  },
  scale_down_threshold: {
    cpu_percent: 25,
    memory_percent: 35,
    idle_time_minutes: 8,
  },
  cooldown_period_ms: 3 * 60 * 1000, // 3 minutes
});
