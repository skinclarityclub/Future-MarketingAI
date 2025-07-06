import { createClient } from "@supabase/supabase-js";

interface WorkflowExecutionData {
  workflowId: string;
  workflowName: string;
  executionId: string;
  status: "success" | "error" | "running" | "waiting";
  startTime: string;
  endTime?: string;
  duration?: number;
  inputData?: any;
  outputData?: any;
  errorMessage?: string;
  chatId?: string;
  contentStrategy?: string;
  priority?: string;
}

export class N8NWebhookCollector {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Store workflow execution data from N8N webhook
   */
  async storeExecution(data: WorkflowExecutionData): Promise<void> {
    try {
      const { error } = await this.supabase.from("workflow_executions").insert({
        workflow_id: data.workflowId,
        workflow_name: data.workflowName,
        execution_id: data.executionId,
        status: data.status,
        start_time: data.startTime,
        end_time: data.endTime,
        duration_ms: data.duration,
        input_data: data.inputData,
        output_data: data.outputData,
        error_message: data.errorMessage,
        chat_id: data.chatId,
        content_strategy: data.contentStrategy,
        priority: data.priority,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Failed to store execution:", error);
        throw error;
      }

      console.log(
        `✅ Stored execution ${data.executionId} for ${data.workflowName}`
      );
    } catch (error) {
      console.error("Error storing execution:", error);
      throw error;
    }
  }

  /**
   * Get workflow analytics from stored execution data
   */
  async getWorkflowAnalytics(workflowName: string, days: number = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data: executions, error } = await this.supabase
        .from("workflow_executions")
        .select("*")
        .eq("workflow_name", workflowName)
        .gte("created_at", cutoffDate.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      const totalExecutions = executions?.length || 0;
      const successfulExecutions =
        executions?.filter(e => e.status === "success").length || 0;
      const failedExecutions =
        executions?.filter(e => e.status === "error").length || 0;

      const successRate =
        totalExecutions > 0
          ? (successfulExecutions / totalExecutions) * 100
          : 0;
      const errorRate =
        totalExecutions > 0 ? (failedExecutions / totalExecutions) * 100 : 0;

      // Calculate average execution time
      const completedExecutions = executions?.filter(e => e.duration_ms) || [];
      const averageExecutionTime =
        completedExecutions.length > 0
          ? completedExecutions.reduce(
              (sum, e) => sum + (e.duration_ms || 0),
              0
            ) / completedExecutions.length
          : 0;

      // Daily stats
      const dailyStats = this.calculateDailyStats(executions || [], days);

      return {
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        successRate: Math.round(successRate * 100) / 100,
        errorRate: Math.round(errorRate * 100) / 100,
        averageExecutionTime: Math.round(averageExecutionTime),
        dailyStats,
        recentExecutions: executions?.slice(0, 10) || [],
      };
    } catch (error) {
      console.error(`Error getting analytics for ${workflowName}:`, error);
      return {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        successRate: 0,
        errorRate: 0,
        averageExecutionTime: 0,
        dailyStats: [],
        recentExecutions: [],
      };
    }
  }

  /**
   * Get all workflows analytics
   */
  async getAllWorkflowsAnalytics(days: number = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data: executions, error } = await this.supabase
        .from("workflow_executions")
        .select("*")
        .gte("created_at", cutoffDate.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group by workflow name
      const workflowGroups =
        executions?.reduce((groups: any, execution) => {
          const name = execution.workflow_name;
          if (!groups[name]) {
            groups[name] = [];
          }
          groups[name].push(execution);
          return groups;
        }, {}) || {};

      // Calculate analytics for each workflow
      const workflowAnalytics: any = {};
      for (const [workflowName, workflowExecutions] of Object.entries(
        workflowGroups
      )) {
        const execArray = workflowExecutions as any[];
        const totalExecutions = execArray.length;
        const successfulExecutions = execArray.filter(
          e => e.status === "success"
        ).length;
        const failedExecutions = execArray.filter(
          e => e.status === "error"
        ).length;

        const successRate =
          totalExecutions > 0
            ? (successfulExecutions / totalExecutions) * 100
            : 0;
        const errorRate =
          totalExecutions > 0 ? (failedExecutions / totalExecutions) * 100 : 0;

        const completedExecutions = execArray.filter(e => e.duration_ms);
        const averageExecutionTime =
          completedExecutions.length > 0
            ? completedExecutions.reduce(
                (sum, e) => sum + (e.duration_ms || 0),
                0
              ) / completedExecutions.length
            : 0;

        const lastExecution = execArray[0]; // Most recent (already sorted)

        workflowAnalytics[workflowName] = {
          name: workflowName,
          active: true, // Assume active if we have recent executions
          totalExecutions,
          successfulExecutions,
          failedExecutions,
          successRate: Math.round(successRate * 100) / 100,
          errorRate: Math.round(errorRate * 100) / 100,
          averageExecutionTime: Math.round(averageExecutionTime),
          lastExecution: lastExecution
            ? {
                id: lastExecution.execution_id,
                status: lastExecution.status,
                startedAt: lastExecution.start_time,
                finishedAt: lastExecution.end_time,
              }
            : null,
          executionsByDay: this.calculateDailyStats(execArray, days),
        };
      }

      return workflowAnalytics;
    } catch (error) {
      console.error("Error getting all workflows analytics:", error);
      return {};
    }
  }

  /**
   * Calculate daily execution statistics
   */
  private calculateDailyStats(executions: any[], days: number) {
    const dailyStats = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayExecutions = executions.filter(e =>
        e.created_at.startsWith(dateStr)
      );

      dailyStats.unshift({
        date: dateStr,
        count: dayExecutions.length,
        success: dayExecutions.filter(e => e.status === "success").length,
        failure: dayExecutions.filter(e => e.status === "error").length,
      });
    }

    return dailyStats;
  }

  /**
   * Get real-time workflow status
   */
  async getWorkflowStatus(workflowName: string) {
    try {
      const { data: recentExecution, error } = await this.supabase
        .from("workflow_executions")
        .select("*")
        .eq("workflow_name", workflowName)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw error;
      }

      return {
        name: workflowName,
        active: true,
        lastExecution: recentExecution
          ? {
              id: recentExecution.execution_id,
              status: recentExecution.status,
              startedAt: recentExecution.start_time,
              finishedAt: recentExecution.end_time,
            }
          : null,
        isRunning: recentExecution?.status === "running" || false,
      };
    } catch (error) {
      console.error(`Error getting status for ${workflowName}:`, error);
      return {
        name: workflowName,
        active: false,
        lastExecution: null,
        isRunning: false,
      };
    }
  }
}
