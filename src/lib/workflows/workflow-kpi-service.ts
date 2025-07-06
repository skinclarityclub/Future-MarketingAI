/**
 * Workflow KPI Service - Task 61.10
 * Fetches real-time workflow metrics from N8N execution data
 */

import { createBrowserClient } from "@supabase/ssr";

export interface WorkflowKPIMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  contentPieces: number;
  revenueImpact: number;
  totalWorkflows: number;
  activeWorkflows: number;
  lastUpdated: string;
}

export interface WorkflowPerformanceData {
  workflowName: string;
  executions: number;
  successRate: number;
  avgDuration: number;
  lastExecution: string;
  contentGenerated: number;
  estimatedRevenue: number;
}

export class WorkflowKPIService {
  private supabase;

  constructor() {
    this.supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );
  }

  async getWorkflowKPIMetrics(days: number = 30): Promise<WorkflowKPIMetrics> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Get workflow execution stats
      const { data: executions, error: execError } = await this.supabase
        .from("workflow_executions")
        .select("*")
        .gte("created_at", startDate.toISOString());

      if (execError) {
        console.error("Error fetching workflow executions:", execError);
        return this.getFallbackMetrics();
      }

      if (!executions || executions.length === 0) {
        return this.getFallbackMetrics();
      }

      // Calculate metrics
      const totalExecutions = executions.length;
      const successfulExecutions = executions.filter(
        exec => exec.status === "success"
      ).length;
      const failedExecutions = executions.filter(
        exec => exec.status === "error"
      ).length;
      const successRate =
        totalExecutions > 0
          ? (successfulExecutions / totalExecutions) * 100
          : 0;

      // Calculate average execution time
      const completedExecutions = executions.filter(
        exec => exec.duration_ms && exec.duration_ms > 0
      );
      const averageExecutionTime =
        completedExecutions.length > 0
          ? completedExecutions.reduce(
              (acc, exec) => acc + exec.duration_ms,
              0
            ) / completedExecutions.length
          : 0;

      // Count content pieces (PostBuilder, CarouselBuilder, etc.)
      const contentWorkflows = executions.filter(exec =>
        [
          "PostBuilder",
          "CarouselBuilder",
          "StoryBuilder",
          "ReelBuilder",
        ].includes(exec.workflow_name)
      );
      const contentPieces = contentWorkflows.length;

      // Estimate revenue impact (simplified calculation)
      const revenueImpact = successfulExecutions * 150; // Estimated $150 per successful content creation

      // Count unique workflows
      const uniqueWorkflows = new Set(
        executions.map(exec => exec.workflow_name)
      );
      const totalWorkflows = uniqueWorkflows.size;
      const activeWorkflows = new Set(
        executions
          .filter(
            exec =>
              new Date(exec.created_at) >
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          )
          .map(exec => exec.workflow_name)
      ).size;

      return {
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        successRate,
        averageExecutionTime,
        contentPieces,
        revenueImpact,
        totalWorkflows,
        activeWorkflows,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error calculating workflow KPI metrics:", error);
      return this.getFallbackMetrics();
    }
  }

  async getWorkflowPerformanceData(
    days: number = 30
  ): Promise<WorkflowPerformanceData[]> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Use the workflow_analytics view for better performance
      const { data: analytics, error } = await this.supabase
        .from("workflow_analytics")
        .select("*")
        .order("total_executions", { ascending: false });

      if (error) {
        console.error("Error fetching workflow analytics:", error);
        return this.getFallbackPerformanceData();
      }

      if (!analytics || analytics.length === 0) {
        return this.getFallbackPerformanceData();
      }

      return analytics.map(workflow => ({
        workflowName: workflow.workflow_name,
        executions: workflow.total_executions,
        successRate: workflow.success_rate || 0,
        avgDuration: workflow.avg_duration_ms || 0,
        lastExecution: workflow.last_execution_at || new Date().toISOString(),
        contentGenerated: [
          "PostBuilder",
          "CarouselBuilder",
          "StoryBuilder",
          "ReelBuilder",
        ].includes(workflow.workflow_name)
          ? workflow.successful_executions
          : 0,
        estimatedRevenue: workflow.successful_executions * 150, // $150 per successful execution
      }));
    } catch (error) {
      console.error("Error fetching workflow performance data:", error);
      return this.getFallbackPerformanceData();
    }
  }

  async getContentMetrics(days: number = 30): Promise<{
    totalContentPieces: number;
    postBuilderCount: number;
    carouselBuilderCount: number;
    storyBuilderCount: number;
    reelBuilderCount: number;
    totalEngagement: number;
    estimatedReach: number;
  }> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const { data: contentExecutions, error } = await this.supabase
        .from("workflow_executions")
        .select("workflow_name, status, output_data")
        .gte("created_at", startDate.toISOString())
        .in("workflow_name", [
          "PostBuilder",
          "CarouselBuilder",
          "StoryBuilder",
          "ReelBuilder",
        ])
        .eq("status", "success");

      if (error || !contentExecutions) {
        console.error("Error fetching content metrics:", error);
        return {
          totalContentPieces: 0,
          postBuilderCount: 0,
          carouselBuilderCount: 0,
          storyBuilderCount: 0,
          reelBuilderCount: 0,
          totalEngagement: 0,
          estimatedReach: 0,
        };
      }

      const postBuilderCount = contentExecutions.filter(
        exec => exec.workflow_name === "PostBuilder"
      ).length;
      const carouselBuilderCount = contentExecutions.filter(
        exec => exec.workflow_name === "CarouselBuilder"
      ).length;
      const storyBuilderCount = contentExecutions.filter(
        exec => exec.workflow_name === "StoryBuilder"
      ).length;
      const reelBuilderCount = contentExecutions.filter(
        exec => exec.workflow_name === "ReelBuilder"
      ).length;

      const totalContentPieces = contentExecutions.length;
      const totalEngagement = totalContentPieces * 250; // Estimated 250 engagements per content piece
      const estimatedReach = totalContentPieces * 1500; // Estimated 1500 reach per content piece

      return {
        totalContentPieces,
        postBuilderCount,
        carouselBuilderCount,
        storyBuilderCount,
        reelBuilderCount,
        totalEngagement,
        estimatedReach,
      };
    } catch (error) {
      console.error("Error fetching content metrics:", error);
      return {
        totalContentPieces: 0,
        postBuilderCount: 0,
        carouselBuilderCount: 0,
        storyBuilderCount: 0,
        reelBuilderCount: 0,
        totalEngagement: 0,
        estimatedReach: 0,
      };
    }
  }

  private getFallbackMetrics(): WorkflowKPIMetrics {
    return {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      successRate: 0,
      averageExecutionTime: 0,
      contentPieces: 0,
      revenueImpact: 0,
      totalWorkflows: 0,
      activeWorkflows: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  private getFallbackPerformanceData(): WorkflowPerformanceData[] {
    return [
      {
        workflowName: "PostBuilder",
        executions: 0,
        successRate: 0,
        avgDuration: 0,
        lastExecution: new Date().toISOString(),
        contentGenerated: 0,
        estimatedRevenue: 0,
      },
      {
        workflowName: "CarouselBuilder",
        executions: 0,
        successRate: 0,
        avgDuration: 0,
        lastExecution: new Date().toISOString(),
        contentGenerated: 0,
        estimatedRevenue: 0,
      },
    ];
  }
}

export const workflowKPIService = new WorkflowKPIService();
