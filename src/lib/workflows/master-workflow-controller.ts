/**
 * Master Workflow Controller
 * Task 73: Universal n8n AI/ML Workflow Orchestration Platform
 *
 * Upgrades the existing Webhook Orchestrator to a comprehensive Master Workflow Controller
 * that orchestrates all AI/ML systems within the SKC BI Dashboard project with:
 * - Intelligent orchestration and cross-platform learning
 * - Automated optimization feedback loops
 * - Intelligent scheduling and A/B testing
 * - Model retraining, anomaly detection, and performance monitoring
 */

import { createClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import {
  N8nWebhookOrchestrator,
} from "@/lib/webhooks/n8n-webhook-orchestrator";
import { N8nWorkflowService } from "@/lib/marketing/n8n-workflow-service";

// Enhanced workflow types for AI/ML orchestration
export interface WorkflowOrchestrationConfig {
  id: string;
  name: string;
  type:
    | "ai_agent"
    | "content_creation"
    | "ml_pipeline"
    | "analytics"
    | "monitoring";
  priority: "critical" | "high" | "medium" | "low";
  dependencies: string[];
  triggers: WorkflowTrigger[];
  aiConfig?: {
    modelType: string;
    learningEnabled: boolean;
    optimizationTarget: string;
    feedbackLoop: boolean;
  };
  scheduling?: {
    type: "immediate" | "delayed" | "scheduled" | "intelligent";
    schedule?: string;
    conditions?: Record<string, any>;
  };
  abTesting?: {
    enabled: boolean;
    variants: string[];
    successMetrics: string[];
  };
}

export interface WorkflowTrigger {
  id: string;
  type:
    | "webhook"
    | "schedule"
    | "event"
    | "ai_prediction"
    | "performance_threshold";
  conditions: Record<string, any>;
  enabled: boolean;
  aiEnhanced?: boolean;
}

export interface CrossPlatformLearning {
  sourceWorkflow: string;
  targetWorkflows: string[];
  learningPattern: string;
  confidence: number;
  appliedAt: string;
  results?: {
    performanceImprovement: number;
    metrics: Record<string, number>;
  };
}

export interface OptimizationFeedback {
  workflowId: string;
  metric: string;
  currentValue: number;
  targetValue: number;
  suggestions: string[];
  priority: number;
  implemented: boolean;
}

export interface IntelligentScheduling {
  workflowId: string;
  suggestedTime: string;
  reasoning: string[];
  resourceOptimization: number;
  conflictResolution: string[];
}

export interface ModelPerformanceMetrics {
  modelId: string;
  accuracy: number;
  latency: number;
  throughput: number;
  errorRate: number;
  driftDetected: boolean;
  lastRetrained: string;
  nextRetrainingDue: string;
}

export interface AnomalyDetection {
  id: string;
  workflowId: string;
  type: "performance" | "data" | "behavior" | "security";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  detectedAt: string;
  resolved: boolean;
  recommendations: string[];
}

export class MasterWorkflowController {
  private supabase: ReturnType<typeof createClient>;
  private webhookOrchestrator: N8nWebhookOrchestrator;
  private n8nService: N8nWorkflowService;
  private workflows: Map<string, WorkflowOrchestrationConfig> = new Map();
  private learningSystem: Map<string, CrossPlatformLearning[]> = new Map();
  private optimizationEngine: OptimizationFeedback[] = [];
  private schedulingEngine: Map<string, IntelligentScheduling> = new Map();
  private modelMetrics: Map<string, ModelPerformanceMetrics> = new Map();
  private anomalies: AnomalyDetection[] = [];

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    n8nService: N8nWorkflowService
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.n8nService = n8nService;
    this.webhookOrchestrator = new N8nWebhookOrchestrator(
      supabaseUrl,
      supabaseKey,
      n8nService
    );

    this.initializeMasterController();
  }

  /**
   * Initialize the Master Workflow Controller
   */
  private async initializeMasterController(): Promise<void> {
    try {
      await this.loadWorkflowConfigurations();
      await this.initializeCrossPlatformLearning();
      await this.startOptimizationEngine();
      await this.initializeIntelligentScheduling();
      await this.setupAnomalyDetection();

      logger.logSystem(
        "Master Workflow Controller initialized successfully",
        "info",
        {
          workflowsLoaded: this.workflows.size,
          learningSystemActive: true,
          optimizationEngineActive: true,
        }
      );
    } catch (error) {
      logger.logSystem(
        "Failed to initialize Master Workflow Controller",
        "error",
        { error }
      );
      throw error;
    }
  }

  /**
   * Register a new AI/ML workflow with the master controller
   */
  async registerWorkflow(config: WorkflowOrchestrationConfig): Promise<void> {
    try {
      // Validate configuration
      await this.validateWorkflowConfig(config);

      // Store in local memory
      this.workflows.set(config.id, config);

      // Store in database
      await this.supabase.from("workflow_orchestration_configs").upsert({
        id: config.id,
        name: config.name,
        type: config.type,
        priority: config.priority,
        dependencies: config.dependencies,
        triggers: config.triggers,
        ai_config: config.aiConfig,
        scheduling: config.scheduling,
        ab_testing: config.abTesting,
        updated_at: new Date().toISOString(),
      });

      // Initialize learning patterns if AI enabled
      if (config.aiConfig?.learningEnabled) {
        await this.initializeWorkflowLearning(config.id);
      }

      logger.logSystem("Workflow registered with Master Controller", "info", {
        workflowId: config.id,
        type: config.type,
        aiEnabled: !!config.aiConfig,
      });
    } catch (error) {
      logger.logSystem("Failed to register workflow", "error", {
        workflowId: config.id,
        error,
      });
      throw error;
    }
  }

  /**
   * Execute workflow with intelligent orchestration
   */
  async executeWorkflow(
    workflowId: string,
    inputData: Record<string, any>,
    options?: {
      priority?: "critical" | "high" | "medium" | "low";
      scheduling?: "immediate" | "intelligent" | "optimized";
      learningEnabled?: boolean;
    }
  ): Promise<{
    executionId: string;
    status: "queued" | "running" | "completed" | "failed";
    estimatedDuration?: number;
    scheduledFor?: string;
    optimizations?: string[];
  }> {
    try {
      const config = this.workflows.get(workflowId);
      if (!config) {
        throw new Error(`Workflow ${workflowId} not found in registry`);
      }

      // Apply intelligent scheduling
      const scheduling = await this.applyIntelligentScheduling(
        workflowId,
        options?.scheduling
      );

      // Apply cross-platform learning optimizations
      const optimizations = await this.applyCrossPlatformLearning(
        workflowId,
        inputData
      );

      // Enhanced input data with AI insights
      const enhancedData = {
        ...inputData,
        orchestration_metadata: {
          masterController: true,
          schedulingDecision: scheduling,
          appliedOptimizations: optimizations,
          learningEnabled:
            options?.learningEnabled ?? config.aiConfig?.learningEnabled,
          crossPlatformInsights:
            await this.getCrossPlatformInsights(workflowId),
          timestamp: new Date().toISOString(),
        },
      };

      // Execute via webhook orchestrator with enhancements
      const success = await this.webhookOrchestrator.sendWebhookToN8n(
        workflowId,
        enhancedData,
        "master_controller"
      );

      const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store execution record
      await this.supabase.from("master_workflow_executions").insert({
        execution_id: executionId,
        workflow_id: workflowId,
        input_data: enhancedData,
        scheduling_decision: scheduling,
        applied_optimizations: optimizations,
        status: success ? "running" : "failed",
        created_at: new Date().toISOString(),
      });

      // Start performance monitoring
      if (success) {
        this.startPerformanceMonitoring(executionId, workflowId);
      }

      return {
        executionId,
        status: success ? "running" : "failed",
        estimatedDuration: scheduling.estimatedDuration,
        scheduledFor: scheduling.suggestedTime,
        optimizations: optimizations.map(o => o.description),
      };
    } catch (error) {
      logger.logSystem(
        "Failed to execute workflow via Master Controller",
        "error",
        {
          workflowId,
          error,
        }
      );
      throw error;
    }
  }

  /**
   * Apply cross-platform learning to optimize workflow execution
   */
  private async applyCrossPlatformLearning(
    workflowId: string,
    _inputData: Record<string, any>
  ): Promise<Array<{ type: string; description: string; confidence: number }>> {
    try {
      const learningPatterns = this.learningSystem.get(workflowId) || [];
      const optimizations: Array<{
        type: string;
        description: string;
        confidence: number;
      }> = [];

      for (const pattern of learningPatterns) {
        if (pattern.confidence > 0.7) {
          // Apply high-confidence learning patterns
          optimizations.push({
            type: "cross_platform_learning",
            description: `Applied learning from ${pattern.sourceWorkflow}: ${pattern.learningPattern}`,
            confidence: pattern.confidence,
          });

          // Update performance metrics if available
          if (pattern.results) {
            await this.updateLearningMetrics(workflowId, pattern);
          }
        }
      }

      return optimizations;
    } catch (error) {
      logger.logSystem("Error applying cross-platform learning", "error", {
        workflowId,
        error,
      });
      return [];
    }
  }

  /**
   * Apply intelligent scheduling based on resource optimization and dependencies
   */
  private async applyIntelligentScheduling(
    workflowId: string,
    schedulingPreference?: string
  ): Promise<IntelligentScheduling> {
    try {
      const config = this.workflows.get(workflowId);
      if (!config) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      // Check dependencies
      const dependencyStatus = await this.checkDependencies(
        config.dependencies
      );

      // Analyze resource availability
      const resourceAnalysis = await this.analyzeResourceAvailability();

      // Calculate optimal timing
      const suggestedTime =
        schedulingPreference === "immediate"
          ? new Date().toISOString()
          : await this.calculateOptimalExecutionTime(
              workflowId,
              resourceAnalysis
            );

      const scheduling: IntelligentScheduling = {
        workflowId,
        suggestedTime,
        reasoning: [
          `Dependencies: ${dependencyStatus.ready ? "Ready" : "Waiting"}`,
          `Resource optimization: ${resourceAnalysis.efficiency}%`,
          `Priority: ${config.priority}`,
          `Scheduling preference: ${schedulingPreference || "intelligent"}`,
        ],
        resourceOptimization: resourceAnalysis.efficiency,
        conflictResolution: resourceAnalysis.conflicts || [],
      };

      this.schedulingEngine.set(workflowId, scheduling);
      return scheduling;
    } catch (error) {
      logger.logSystem("Error in intelligent scheduling", "error", {
        workflowId,
        error,
      });
      return {
        workflowId,
        suggestedTime: new Date().toISOString(),
        reasoning: ["Fallback to immediate execution due to scheduling error"],
        resourceOptimization: 50,
        conflictResolution: [],
      };
    }
  }

  /**
   * Start automated optimization feedback loops
   */
  private async startOptimizationEngine(): Promise<void> {
    // Run optimization analysis every 5 minutes
    setInterval(
      async () => {
        try {
          await this.analyzeWorkflowPerformance();
          await this.generateOptimizationFeedback();
          await this.implementAutomatedOptimizations();
        } catch (error) {
          logger.logSystem("Error in optimization engine", "error", { error });
        }
      },
      5 * 60 * 1000
    ); // 5 minutes
  }

  /**
   * Initialize anomaly detection system
   */
  private async setupAnomalyDetection(): Promise<void> {
    // Monitor for anomalies every minute
    setInterval(async () => {
      try {
        await this.detectPerformanceAnomalies();
        await this.detectDataAnomalies();
        await this.detectBehaviorAnomalies();
      } catch (error) {
        logger.logSystem("Error in anomaly detection", "error", { error });
      }
    }, 60 * 1000); // 1 minute
  }

  /**
   * Detect performance anomalies across all workflows
   */
  private async detectPerformanceAnomalies(): Promise<void> {
    try {
      const { data: executions, error } = await this.supabase
        .from("master_workflow_executions")
        .select("*")
        .gte(
          "created_at",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Analyze execution patterns for anomalies
      const workflowMetrics = new Map<string, number[]>();

      executions?.forEach(exec => {
        if (!workflowMetrics.has(exec.workflow_id)) {
          workflowMetrics.set(exec.workflow_id, []);
        }
        if (exec.duration_ms) {
          workflowMetrics.get(exec.workflow_id)!.push(exec.duration_ms);
        }
      });

      // Detect statistical anomalies
      for (const [workflowId, durations] of workflowMetrics) {
        if (durations.length >= 5) {
          const anomalies = this.detectStatisticalAnomalies(durations);
          if (anomalies.length > 0) {
            await this.reportAnomaly({
              id: `perf_${Date.now()}_${workflowId}`,
              workflowId,
              type: "performance",
              severity: "medium",
              description: `Performance anomalies detected: ${anomalies.length} outliers`,
              detectedAt: new Date().toISOString(),
              resolved: false,
              recommendations: [
                "Review workflow optimization settings",
                "Check resource allocation",
                "Analyze recent changes",
              ],
            });
          }
        }
      }
    } catch (error) {
      logger.logSystem("Error detecting performance anomalies", "error", {
        error,
      });
    }
  }

  /**
   * Implement automated ML model retraining
   */
  async triggerModelRetraining(
    modelId: string,
    reason: "scheduled" | "performance_degradation" | "data_drift" | "manual"
  ): Promise<void> {
    try {
      const metrics = this.modelMetrics.get(modelId);
      if (!metrics) {
        throw new Error(`Model ${modelId} not found in metrics registry`);
      }

      // Create retraining workflow data
      const retrainingData = {
        model_id: modelId,
        trigger_reason: reason,
        current_metrics: metrics,
        retraining_config: {
          data_window: "30_days",
          validation_split: 0.2,
          early_stopping: true,
          performance_threshold: metrics.accuracy * 0.95,
        },
        orchestration_metadata: {
          masterController: true,
          automatedRetraining: true,
          originalMetrics: metrics,
        },
      };

      // Execute ML retraining workflow
      await this.executeWorkflow(
        "ML_Auto_Retraining_Workflow",
        retrainingData,
        {
          priority: "high",
          scheduling: "optimized",
          learningEnabled: true,
        }
      );

      // Update model status
      await this.supabase
        .from("ml_model_metrics")
        .update({
          retraining_status: "in_progress",
          last_retrain_triggered: new Date().toISOString(),
          trigger_reason: reason,
        })
        .eq("model_id", modelId);

      logger.logSystem("Model retraining triggered", "info", {
        modelId,
        reason,
        currentAccuracy: metrics.accuracy,
      });
    } catch (error) {
      logger.logSystem("Failed to trigger model retraining", "error", {
        modelId,
        error,
      });
      throw error;
    }
  }

  /**
   * Get cross-platform insights for a workflow
   */
  private async getCrossPlatformInsights(
    workflowId: string
  ): Promise<Record<string, any>> {
    try {
      const insights = {
        similarWorkflows: await this.findSimilarWorkflows(workflowId),
        bestPractices: await this.getBestPracticesForWorkflow(workflowId),
        performanceComparisons:
          await this.getPerformanceComparisons(workflowId),
        optimizationOpportunities:
          await this.identifyOptimizationOpportunities(workflowId),
      };

      return insights;
    } catch (error) {
      logger.logSystem("Error getting cross-platform insights", "error", {
        workflowId,
        error,
      });
      return {};
    }
  }

  // Helper methods for internal operations
  private async loadWorkflowConfigurations(): Promise<void> {
    // Load existing workflow configurations from database
    const { data: configs, error } = await this.supabase
      .from("workflow_orchestration_configs")
      .select("*");

    if (error) throw error;

    configs?.forEach(config => {
      this.workflows.set(config.id, {
        id: config.id,
        name: config.name,
        type: config.type,
        priority: config.priority,
        dependencies: config.dependencies || [],
        triggers: config.triggers || [],
        aiConfig: config.ai_config,
        scheduling: config.scheduling,
        abTesting: config.ab_testing,
      });
    });
  }

  private async validateWorkflowConfig(
    config: WorkflowOrchestrationConfig
  ): Promise<void> {
    // Validate workflow configuration structure and dependencies
    if (!config.id || !config.name || !config.type) {
      throw new Error(
        "Invalid workflow configuration: missing required fields"
      );
    }

    // Check dependency validity
    for (const dep of config.dependencies) {
      if (!this.workflows.has(dep)) {
        logger.logSystem(
          "Workflow dependency not found, will be validated at runtime",
          "warn",
          {
            workflowId: config.id,
            missingDependency: dep,
          }
        );
      }
    }
  }

  /**
   * Initialize the cross-platform learning system
   */
  private async initializeCrossPlatformLearning(): Promise<void> {
    // Implementation for cross-platform learning initialization
    logger.logSystem("Cross-platform learning system initialized", "info");
  }

  /**
   * Initialize the intelligent scheduling system
   */
  private async initializeIntelligentScheduling(): Promise<void> {
    try {
      // Load existing scheduling configurations
      const { data: schedulingConfigs, error } = await this.supabase
        .from("intelligent_scheduling")
        .select("*")
        .eq("active", true);

      if (error && error.code !== "42P01") { // Table doesn't exist
        logger.logSystem("Error loading scheduling configs", "warn", { error });
      }

      // Initialize scheduling engine for each workflow
      for (const [workflowId, config] of this.workflows) {
        if (config.scheduling?.type === "intelligent") {
          const scheduling: IntelligentScheduling = {
            workflowId,
            suggestedTime: new Date(Date.now() + 60000).toISOString(), // Default 1 minute from now
            reasoning: ["Default intelligent scheduling initialized"],
            resourceOptimization: 0.8,
            conflictResolution: []
          };
          this.schedulingEngine.set(workflowId, scheduling);
        }
      }

      logger.logSystem("Intelligent scheduling system initialized", "info", {
        scheduledWorkflows: this.schedulingEngine.size
      });
    } catch (error) {
      logger.logSystem("Failed to initialize intelligent scheduling", "error", { error });
      // Don't throw - allow controller to continue without intelligent scheduling
    }
  }

  /**
   * Initialize the workflow learning for a specific workflow
   */
  private async initializeWorkflowLearning(workflowId: string): Promise<void> {
    // Initialize learning patterns for a specific workflow
    this.learningSystem.set(workflowId, []);
  }

  private async checkDependencies(
    dependencies: string[]
  ): Promise<{ ready: boolean; waiting: string[] }> {
    // Check if all dependencies are satisfied
    const waiting: string[] = [];

    for (const dep of dependencies) {
      // Check if dependency workflow is running or recently completed successfully
      const { data: executions } = await this.supabase
        .from("master_workflow_executions")
        .select("status")
        .eq("workflow_id", dep)
        .order("created_at", { ascending: false })
        .limit(1);

      if (
        !executions ||
        executions.length === 0 ||
        executions[0].status !== "completed"
      ) {
        waiting.push(dep);
      }
    }

    return { ready: waiting.length === 0, waiting };
  }

  private async analyzeResourceAvailability(): Promise<{
    efficiency: number;
    conflicts: string[];
  }> {
    // Analyze current resource usage and availability
    return { efficiency: 85, conflicts: [] }; // Placeholder implementation
  }

  private async calculateOptimalExecutionTime(
    workflowId: string,
    resourceAnalysis: any
  ): Promise<string> {
    // Calculate optimal execution time based on various factors
    const now = new Date();
    const optimalTime = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes from now as example
    return optimalTime.toISOString();
  }

  private startPerformanceMonitoring(
    executionId: string,
    workflowId: string
  ): void {
    // Start monitoring workflow execution performance
    setTimeout(async () => {
      try {
        await this.collectExecutionMetrics(executionId, workflowId);
      } catch (error) {
        logger.logSystem("Error collecting execution metrics", "error", {
          executionId,
          error,
        });
      }
    }, 10000); // Check after 10 seconds
  }

  private async collectExecutionMetrics(
    executionId: string,
    workflowId: string
  ): Promise<void> {
    // Collect and store execution metrics
    // Implementation would involve querying n8n API for execution details
  }

  private async analyzeWorkflowPerformance(): Promise<void> {
    // Analyze performance across all workflows
    // Implementation would analyze metrics and identify optimization opportunities
  }

  private async generateOptimizationFeedback(): Promise<void> {
    // Generate optimization suggestions based on performance analysis
    // Implementation would create optimization feedback records
  }

  private async implementAutomatedOptimizations(): Promise<void> {
    // Implement low-risk automated optimizations
    // Implementation would apply safe, automated improvements
  }

  private async detectDataAnomalies(): Promise<void> {
    // Detect data quality and consistency anomalies
    // Implementation would analyze data patterns and quality metrics
  }

  private async detectBehaviorAnomalies(): Promise<void> {
    // Detect unusual behavior patterns in workflow executions
    // Implementation would analyze execution patterns and user behavior
  }

  private detectStatisticalAnomalies(values: number[]): number[] {
    // Simple statistical anomaly detection using IQR method
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    return values.filter(v => v < lowerBound || v > upperBound);
  }

  private async reportAnomaly(anomaly: AnomalyDetection): Promise<void> {
    this.anomalies.push(anomaly);

    // Store in database
    await this.supabase.from("workflow_anomalies").insert({
      id: anomaly.id,
      workflow_id: anomaly.workflowId,
      type: anomaly.type,
      severity: anomaly.severity,
      description: anomaly.description,
      detected_at: anomaly.detectedAt,
      resolved: anomaly.resolved,
      recommendations: anomaly.recommendations,
    });

    logger.logSystem("Anomaly detected and reported", "warn", {
      anomalyId: anomaly.id,
      workflowId: anomaly.workflowId,
      severity: anomaly.severity,
    });
  }

  private async updateLearningMetrics(
    workflowId: string,
    pattern: CrossPlatformLearning
  ): Promise<void> {
    // Update learning pattern performance metrics
    // Implementation would track the effectiveness of applied learning patterns
  }

  private async findSimilarWorkflows(workflowId: string): Promise<string[]> {
    // Find workflows with similar patterns or configurations
    return []; // Placeholder implementation
  }

  private async getBestPracticesForWorkflow(
    workflowId: string
  ): Promise<string[]> {
    // Get best practices recommendations for this type of workflow
    return []; // Placeholder implementation
  }

  private async getPerformanceComparisons(
    workflowId: string
  ): Promise<Record<string, number>> {
    // Get performance comparisons with similar workflows
    return {}; // Placeholder implementation
  }

  private async identifyOptimizationOpportunities(
    workflowId: string
  ): Promise<string[]> {
    // Identify specific optimization opportunities for this workflow
    return []; // Placeholder implementation
  }

  /**
   * Get comprehensive system status
   */
  async getSystemStatus(): Promise<{
    controller: { status: string; workflows: number; active: number };
    learning: { patterns: number; confidence: number };
    optimization: { feedbacks: number; implemented: number };
    anomalies: { total: number; unresolved: number };
    models: { total: number; needRetraining: number };
  }> {
    const activeWorkflows = Array.from(this.workflows.values()).filter(w =>
      w.triggers.some(t => t.enabled)
    ).length;

    const totalPatterns = Array.from(this.learningSystem.values()).reduce(
      (total, patterns) => total + patterns.length,
      0
    );

    const avgConfidence =
      totalPatterns > 0
        ? Array.from(this.learningSystem.values())
            .flat()
            .reduce((sum, p) => sum + p.confidence, 0) / totalPatterns
        : 0;

    const implementedOptimizations = this.optimizationEngine.filter(
      o => o.implemented
    ).length;
    const unresolvedAnomalies = this.anomalies.filter(a => !a.resolved).length;
    const modelsNeedingRetraining = Array.from(
      this.modelMetrics.values()
    ).filter(
      m => m.driftDetected || new Date(m.nextRetrainingDue) <= new Date()
    ).length;

    return {
      controller: {
        status: "active",
        workflows: this.workflows.size,
        active: activeWorkflows,
      },
      learning: {
        patterns: totalPatterns,
        confidence: Math.round(avgConfidence * 100) / 100,
      },
      optimization: {
        feedbacks: this.optimizationEngine.length,
        implemented: implementedOptimizations,
      },
      anomalies: {
        total: this.anomalies.length,
        unresolved: unresolvedAnomalies,
      },
      models: {
        total: this.modelMetrics.size,
        needRetraining: modelsNeedingRetraining,
      },
    };
  }
}

// Export singleton instance
export const masterWorkflowController = new MasterWorkflowController(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  new N8nWorkflowService({
    apiKey: process.env.N8N_API_KEY!,
    baseUrl: process.env.N8N_BASE_URL!,
  })
);

export default MasterWorkflowController;
