/**
 * AI Workflow Orchestrator
 * Task 80.6: Connect and Orchestrate AI Assistants
 *
 * Coordinates AI assistants to execute complex multi-step workflows
 * automatically and intelligently.
 */

import {
  AIOrchestrator,
  getAIOrchestrator,
  type AIAssistantType,
  type AssistantRequest,
  type OrchestratedResponse,
  type OrchestrationEvent,
} from "../ai-configuration/ai-orchestrator";
import { MasterWorkflowController } from "./master-workflow-controller";
import { WorkflowStateManager } from "./workflow-state-manager";
import { AuditTrailSystem } from "./audit-trail-system";

// Workflow Step Definition
export interface AIWorkflowStep {
  id: string;
  name: string;
  description: string;
  assistantType: AIAssistantType;
  input: {
    query: string;
    context?: any;
    dependencies?: string[]; // IDs of previous steps
  };
  output: {
    expectedFormat: "text" | "data" | "analysis" | "recommendation" | "action";
    saveTo?: string; // Variable name to store result
  };
  conditions?: {
    skipIf?: string; // Condition to skip this step
    retryIf?: string; // Condition to retry this step
  };
  timeout?: number;
  priority: "low" | "medium" | "high" | "critical";
}

// Workflow Definition
export interface AIWorkflow {
  id: string;
  name: string;
  description: string;
  category:
    | "marketing"
    | "financial"
    | "operational"
    | "analytical"
    | "content";
  steps: AIWorkflowStep[];
  triggers: {
    manual?: boolean;
    scheduled?: {
      cron: string;
      timezone?: string;
    };
    eventBased?: {
      events: string[];
      conditions?: Record<string, any>;
    };
  };
  config: {
    maxParallelSteps: number;
    enableRollback: boolean;
    enableAuditTrail: boolean;
    notifyOnCompletion: boolean;
    retryAttempts: number;
  };
  metadata?: Record<string, any>;
}

// Workflow Execution Context
export interface WorkflowExecutionContext {
  workflowId: string;
  executionId: string;
  userId: string;
  sessionId: string;
  triggerType: "manual" | "scheduled" | "event";
  triggerData?: any;
  variables: Map<string, any>;
  stepResults: Map<string, OrchestratedResponse>;
  startTime: Date;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  currentStep?: string;
  errorReason?: string;
}

// Pre-defined AI Workflows
export const AI_WORKFLOWS: Record<string, AIWorkflow> = {
  // Marketing Campaign Analysis Workflow
  marketing_campaign_analysis: {
    id: "marketing_campaign_analysis",
    name: "AI-Powered Marketing Campaign Analysis",
    description:
      "Comprehensive analysis of marketing campaign performance using multiple AI assistants",
    category: "marketing",
    steps: [
      {
        id: "data_collection",
        name: "Collect Campaign Data",
        description: "Gather all relevant campaign performance data",
        assistantType: "business-intelligence",
        input: {
          query:
            "Collect latest marketing campaign performance data including CTR, conversion rates, and ROI",
          context: {
            timeframe: "last_30_days",
            includeComparisons: true,
          },
        },
        output: {
          expectedFormat: "data",
          saveTo: "campaignData",
        },
        priority: "high",
      },
      {
        id: "performance_analysis",
        name: "Analyze Performance Metrics",
        description: "Deep analysis of campaign performance using AI",
        assistantType: "complex-query",
        input: {
          query:
            "Analyze the campaign performance data and identify trends, patterns, and optimization opportunities",
          dependencies: ["data_collection"],
        },
        output: {
          expectedFormat: "analysis",
          saveTo: "performanceAnalysis",
        },
        priority: "high",
      },
      {
        id: "recommendations",
        name: "Generate Recommendations",
        description: "Create actionable recommendations based on analysis",
        assistantType: "marketing",
        input: {
          query:
            "Based on the performance analysis, generate specific recommendations for campaign optimization",
          dependencies: ["performance_analysis"],
        },
        output: {
          expectedFormat: "recommendation",
          saveTo: "recommendations",
        },
        priority: "medium",
      },
      {
        id: "report_generation",
        name: "Generate Executive Report",
        description: "Create comprehensive report for stakeholders",
        assistantType: "general",
        input: {
          query:
            "Create an executive summary report combining the campaign data, analysis, and recommendations",
          dependencies: [
            "data_collection",
            "performance_analysis",
            "recommendations",
          ],
        },
        output: {
          expectedFormat: "text",
          saveTo: "executiveReport",
        },
        priority: "medium",
      },
    ],
    triggers: {
      manual: true,
      scheduled: {
        cron: "0 9 * * MON", // Every Monday at 9 AM
        timezone: "UTC",
      },
    },
    config: {
      maxParallelSteps: 2,
      enableRollback: true,
      enableAuditTrail: true,
      notifyOnCompletion: true,
      retryAttempts: 2,
    },
  },

  // Financial Intelligence Workflow
  financial_intelligence_analysis: {
    id: "financial_intelligence_analysis",
    name: "Financial Intelligence Analysis",
    description:
      "Automated financial analysis and forecasting using AI assistants",
    category: "financial",
    steps: [
      {
        id: "financial_data_gathering",
        name: "Gather Financial Data",
        description: "Collect latest financial performance data",
        assistantType: "financial",
        input: {
          query:
            "Collect comprehensive financial data including revenue, expenses, profit margins, and cash flow",
          context: {
            period: "quarterly",
            includeForecasts: true,
          },
        },
        output: {
          expectedFormat: "data",
          saveTo: "financialData",
        },
        priority: "high",
      },
      {
        id: "trend_analysis",
        name: "Analyze Financial Trends",
        description: "Identify financial trends and patterns",
        assistantType: "complex-query",
        input: {
          query:
            "Analyze financial trends and identify key patterns in revenue, costs, and profitability",
          dependencies: ["financial_data_gathering"],
        },
        output: {
          expectedFormat: "analysis",
          saveTo: "trendAnalysis",
        },
        priority: "high",
      },
      {
        id: "risk_assessment",
        name: "Financial Risk Assessment",
        description: "Assess financial risks and opportunities",
        assistantType: "business-intelligence",
        input: {
          query:
            "Perform comprehensive financial risk assessment and identify potential opportunities",
          dependencies: ["trend_analysis"],
        },
        output: {
          expectedFormat: "analysis",
          saveTo: "riskAssessment",
        },
        priority: "high",
      },
      {
        id: "forecasting",
        name: "Generate Financial Forecasts",
        description: "Create financial forecasts and projections",
        assistantType: "complex-query",
        input: {
          query:
            "Generate detailed financial forecasts for the next quarter and year based on current trends",
          dependencies: ["trend_analysis", "risk_assessment"],
        },
        output: {
          expectedFormat: "analysis",
          saveTo: "forecasts",
        },
        priority: "medium",
      },
    ],
    triggers: {
      manual: true,
      scheduled: {
        cron: "0 6 1 * *", // First day of each month at 6 AM
        timezone: "UTC",
      },
    },
    config: {
      maxParallelSteps: 1,
      enableRollback: true,
      enableAuditTrail: true,
      notifyOnCompletion: true,
      retryAttempts: 3,
    },
  },

  // Content Intelligence Workflow
  content_intelligence_workflow: {
    id: "content_intelligence_workflow",
    name: "AI Content Intelligence Workflow",
    description:
      "Automated content analysis and optimization using AI assistants",
    category: "content",
    steps: [
      {
        id: "content_audit",
        name: "Content Performance Audit",
        description: "Analyze current content performance",
        assistantType: "marketing",
        input: {
          query:
            "Analyze content performance metrics including engagement, reach, and conversion rates",
          context: {
            contentTypes: ["blog", "social", "video", "email"],
            timeframe: "last_60_days",
          },
        },
        output: {
          expectedFormat: "analysis",
          saveTo: "contentAudit",
        },
        priority: "high",
      },
      {
        id: "audience_insights",
        name: "Audience Intelligence Analysis",
        description: "Gather insights about content audience",
        assistantType: "business-intelligence",
        input: {
          query:
            "Analyze audience demographics, behavior patterns, and content preferences",
          dependencies: ["content_audit"],
        },
        output: {
          expectedFormat: "analysis",
          saveTo: "audienceInsights",
        },
        priority: "high",
      },
      {
        id: "content_gaps",
        name: "Identify Content Gaps",
        description: "Find content opportunities and gaps",
        assistantType: "complex-query",
        input: {
          query:
            "Identify content gaps and opportunities based on performance data and audience insights",
          dependencies: ["content_audit", "audience_insights"],
        },
        output: {
          expectedFormat: "analysis",
          saveTo: "contentGaps",
        },
        priority: "medium",
      },
      {
        id: "content_strategy",
        name: "Generate Content Strategy",
        description: "Create data-driven content strategy",
        assistantType: "marketing",
        input: {
          query:
            "Create comprehensive content strategy recommendations based on audit, insights, and gap analysis",
          dependencies: ["content_audit", "audience_insights", "content_gaps"],
        },
        output: {
          expectedFormat: "recommendation",
          saveTo: "contentStrategy",
        },
        priority: "medium",
      },
    ],
    triggers: {
      manual: true,
      scheduled: {
        cron: "0 10 15 * *", // 15th of each month at 10 AM
        timezone: "UTC",
      },
    },
    config: {
      maxParallelSteps: 2,
      enableRollback: true,
      enableAuditTrail: true,
      notifyOnCompletion: true,
      retryAttempts: 2,
    },
  },
};

/**
 * AI Workflow Orchestrator Class
 * Manages and executes AI-driven workflows
 */
export class AIWorkflowOrchestrator {
  private static instance: AIWorkflowOrchestrator;
  private aiOrchestrator: AIOrchestrator;
  private workflowController: MasterWorkflowController;
  private stateManager: WorkflowStateManager;
  private auditTrail: AuditTrailSystem;

  // Execution tracking
  private activeExecutions: Map<string, WorkflowExecutionContext> = new Map();
  private workflowRegistry: Map<string, AIWorkflow> = new Map();
  private scheduledWorkflows: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    this.aiOrchestrator = getAIOrchestrator();
    this.workflowController = new MasterWorkflowController();
    this.stateManager = new WorkflowStateManager();
    this.auditTrail = new AuditTrailSystem();

    this.initializeWorkflows();
    this.setupEventListeners();
  }

  public static getInstance(): AIWorkflowOrchestrator {
    if (!AIWorkflowOrchestrator.instance) {
      AIWorkflowOrchestrator.instance = new AIWorkflowOrchestrator();
    }
    return AIWorkflowOrchestrator.instance;
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflowId: string,
    options: {
      userId: string;
      sessionId: string;
      triggerType?: "manual" | "scheduled" | "event";
      triggerData?: any;
      variables?: Record<string, any>;
    }
  ): Promise<WorkflowExecutionContext> {
    const workflow = this.workflowRegistry.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const context: WorkflowExecutionContext = {
      workflowId,
      executionId,
      userId: options.userId,
      sessionId: options.sessionId,
      triggerType: options.triggerType || "manual",
      triggerData: options.triggerData,
      variables: new Map(Object.entries(options.variables || {})),
      stepResults: new Map(),
      startTime: new Date(),
      status: "pending",
    };

    this.activeExecutions.set(executionId, context);

    try {
      // Start workflow execution
      context.status = "running";

      if (workflow.config.enableAuditTrail) {
        await this.auditTrail.logWorkflowStart(
          workflowId,
          executionId,
          options.userId
        );
      }

      // Execute workflow steps
      await this.executeWorkflowSteps(workflow, context);

      context.status = "completed";

      if (workflow.config.enableAuditTrail) {
        await this.auditTrail.logWorkflowCompletion(
          workflowId,
          executionId,
          context
        );
      }
    } catch (error) {
      context.status = "failed";
      context.errorReason =
        error instanceof Error ? error.message : "Unknown error";

      if (workflow.config.enableAuditTrail) {
        await this.auditTrail.logWorkflowError(workflowId, executionId, error);
      }

      throw error;
    } finally {
      // Clean up after delay
      setTimeout(() => {
        this.activeExecutions.delete(executionId);
      }, 300000); // Keep for 5 minutes
    }

    return context;
  }

  /**
   * Execute workflow steps
   */
  private async executeWorkflowSteps(
    workflow: AIWorkflow,
    context: WorkflowExecutionContext
  ): Promise<void> {
    const completedSteps = new Set<string>();
    const failedSteps = new Set<string>();

    while (
      completedSteps.size < workflow.steps.length &&
      failedSteps.size === 0
    ) {
      // Find steps that can be executed (dependencies met)
      const readySteps = workflow.steps.filter(
        step =>
          !completedSteps.has(step.id) &&
          !failedSteps.has(step.id) &&
          (step.input.dependencies || []).every(dep => completedSteps.has(dep))
      );

      if (readySteps.length === 0) {
        throw new Error(
          "No more steps can be executed - possible circular dependency"
        );
      }

      // Execute steps (respecting parallel limits)
      const stepsToExecute = readySteps.slice(
        0,
        workflow.config.maxParallelSteps
      );

      const stepPromises = stepsToExecute.map(step =>
        this.executeWorkflowStep(step, workflow, context)
      );

      const stepResults = await Promise.allSettled(stepPromises);

      // Process results
      stepResults.forEach((result, index) => {
        const step = stepsToExecute[index];

        if (result.status === "fulfilled") {
          completedSteps.add(step.id);
          context.stepResults.set(step.id, result.value);

          // Save to variables if specified
          if (step.output.saveTo) {
            context.variables.set(step.output.saveTo, result.value);
          }
        } else {
          failedSteps.add(step.id);
          throw new Error(`Step ${step.id} failed: ${result.reason}`);
        }
      });
    }
  }

  /**
   * Execute a single workflow step
   */
  private async executeWorkflowStep(
    step: AIWorkflowStep,
    workflow: AIWorkflow,
    context: WorkflowExecutionContext
  ): Promise<OrchestratedResponse> {
    context.currentStep = step.id;

    // Build request context
    const stepContext = {
      ...step.input.context,
      workflowId: workflow.id,
      executionId: context.executionId,
      stepId: step.id,
      variables: Object.fromEntries(context.variables),
      previousResults: Object.fromEntries(context.stepResults),
    };

    // Create assistant request
    const request: AssistantRequest = {
      id: `${context.executionId}_${step.id}`,
      type: step.assistantType,
      query: step.input.query,
      context: stepContext,
      priority: step.priority,
      sessionId: context.sessionId,
      userId: context.userId,
      timestamp: new Date(),
      metadata: {
        workflowId: workflow.id,
        stepId: step.id,
        executionId: context.executionId,
      },
    };

    // Execute with timeout
    const timeout = step.timeout || 30000;
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error(`Step ${step.id} timed out after ${timeout}ms`)),
        timeout
      );
    });

    return Promise.race([
      this.aiOrchestrator.orchestrateRequest(request),
      timeoutPromise,
    ]);
  }

  /**
   * Register a custom workflow
   */
  registerWorkflow(workflow: AIWorkflow): void {
    this.workflowRegistry.set(workflow.id, workflow);

    // Setup scheduled execution if configured
    if (workflow.triggers.scheduled) {
      this.scheduleWorkflow(workflow);
    }
  }

  /**
   * Schedule a workflow for automatic execution
   */
  private scheduleWorkflow(workflow: AIWorkflow): void {
    if (!workflow.triggers.scheduled) return;

    // This is a simplified scheduler - in production, use a proper cron library
    const cronExpression = workflow.triggers.scheduled.cron;

    // For demo purposes, just log that it would be scheduled
    console.log(
      `Would schedule workflow ${workflow.id} with cron: ${cronExpression}`
    );
  }

  /**
   * Get workflow execution status
   */
  getExecutionStatus(executionId: string): WorkflowExecutionContext | null {
    return this.activeExecutions.get(executionId) || null;
  }

  /**
   * List all available workflows
   */
  listWorkflows(): AIWorkflow[] {
    return Array.from(this.workflowRegistry.values());
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): AIWorkflow | null {
    return this.workflowRegistry.get(workflowId) || null;
  }

  /**
   * Cancel workflow execution
   */
  async cancelWorkflow(executionId: string): Promise<void> {
    const context = this.activeExecutions.get(executionId);
    if (context) {
      context.status = "cancelled";
      this.activeExecutions.delete(executionId);
    }
  }

  /**
   * Get active executions
   */
  getActiveExecutions(): WorkflowExecutionContext[] {
    return Array.from(this.activeExecutions.values());
  }

  /**
   * Initialize predefined workflows
   */
  private initializeWorkflows(): void {
    Object.values(AI_WORKFLOWS).forEach(workflow => {
      this.registerWorkflow(workflow);
    });
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    this.aiOrchestrator.addEventListener(
      "workflow_complete",
      (event: OrchestrationEvent) => {
        console.log("AI Workflow step completed:", event);
      }
    );

    this.aiOrchestrator.addEventListener(
      "error",
      (event: OrchestrationEvent) => {
        console.error("AI Workflow step error:", event);
      }
    );
  }
}

// Export singleton instance getter
export const getAIWorkflowOrchestrator = () =>
  AIWorkflowOrchestrator.getInstance();

// Convenience function for quick workflow execution
export async function executeAIWorkflow(
  workflowId: string,
  options: {
    userId: string;
    sessionId: string;
    variables?: Record<string, any>;
  }
): Promise<WorkflowExecutionContext> {
  const orchestrator = getAIWorkflowOrchestrator();
  return await orchestrator.executeWorkflow(workflowId, {
    ...options,
    triggerType: "manual",
  });
}
