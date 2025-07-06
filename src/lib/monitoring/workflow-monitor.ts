/**
 * Task 33.3: Implement Real-Time Monitoring
 * Comprehensive real-time workflow monitoring and logging system
 */

import { createBrowserClient } from "@supabase/ssr";
import {
  workflowStateManager,
  WorkflowStateInfo,
} from "@/lib/workflows/workflow-state-manager";

// Real-Time Monitoring Types
export interface WorkflowExecutionLog {
  id: string;
  workflow_id: string;
  execution_id: string;
  log_level: "debug" | "info" | "warn" | "error" | "fatal";
  message: string;
  timestamp: string;
  node_id?: string;
  node_name?: string;
  step_number?: number;
  duration?: number;
  metadata?: {
    input_data?: Record<string, any>;
    output_data?: Record<string, any>;
    error_stack?: string;
    memory_usage?: number;
    cpu_usage?: number;
    network_requests?: number;
  };
}

export interface WorkflowError {
  id: string;
  workflow_id: string;
  execution_id: string;
  error_type:
    | "validation"
    | "network"
    | "timeout"
    | "permission"
    | "data"
    | "system"
    | "unknown";
  error_code?: string;
  error_message: string;
  error_stack?: string;
  timestamp: string;
  node_id?: string;
  node_name?: string;
  severity: "low" | "medium" | "high" | "critical";
  resolved: boolean;
  resolution_notes?: string;
  metadata?: Record<string, any>;
}

export interface WorkflowPerformanceMetrics {
  workflow_id: string;
  execution_id: string;
  timestamp: string;
  total_duration: number;
  node_count: number;
  successful_nodes: number;
  failed_nodes: number;
  memory_peak: number;
  memory_average: number;
  cpu_peak: number;
  cpu_average: number;
  network_requests: number;
  network_data_transferred: number;
  throughput: number; // items per second
  bottleneck_nodes: string[];
}

export interface MonitoringAlert {
  id: string;
  workflow_id: string;
  alert_type: "performance" | "error" | "timeout" | "resource" | "dependency";
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved: boolean;
  resolved_at?: string;
  metadata?: Record<string, any>;
}

export interface LiveExecutionStatus {
  workflow_id: string;
  execution_id: string;
  current_state: string;
  progress_percentage: number;
  current_node?: string;
  current_step?: string;
  elapsed_time: number;
  estimated_remaining_time?: number;
  throughput?: number;
  error_count: number;
  warning_count: number;
  last_activity: string;
}

export interface MonitoringSubscription {
  id: string;
  workflow_ids: string[];
  log_levels: WorkflowExecutionLog["log_level"][];
  include_performance: boolean;
  include_errors: boolean;
  callback: (data: MonitoringEvent) => void;
}

export type MonitoringEvent = {
  type: "log" | "error" | "performance" | "alert" | "state_change";
  workflow_id: string;
  execution_id?: string;
  timestamp: string;
  data:
    | WorkflowExecutionLog
    | WorkflowError
    | WorkflowPerformanceMetrics
    | MonitoringAlert
    | WorkflowStateInfo;
};

export class WorkflowMonitor {
  private supabase;
  private subscriptions: Map<string, MonitoringSubscription> = new Map();
  private realtimeChannels: any[] = [];
  private isInitialized = false;
  private performanceCollector?: NodeJS.Timeout;
  private alertProcessor?: NodeJS.Timeout;

  constructor() {
    this.supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Initialize the monitoring system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize state manager if not already done
      await workflowStateManager.initialize();

      // Set up real-time channels for monitoring data
      await this.setupRealtimeChannels();

      // Start performance collection
      this.startPerformanceCollection();

      // Start alert processing
      this.startAlertProcessing();

      this.isInitialized = true;
      console.log("Workflow Monitor initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Workflow Monitor:", error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time monitoring events
   */
  subscribe(
    workflowIds: string[],
    options: {
      logLevels?: WorkflowExecutionLog["log_level"][];
      includePerformance?: boolean;
      includeErrors?: boolean;
    } = {},
    callback: (event: MonitoringEvent) => void
  ): string {
    const subscriptionId = `monitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const subscription: MonitoringSubscription = {
      id: subscriptionId,
      workflow_ids: workflowIds,
      log_levels: options.logLevels || ["info", "warn", "error", "fatal"],
      include_performance: options.includePerformance || true,
      include_errors: options.includeErrors || true,
      callback,
    };

    this.subscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }

  /**
   * Unsubscribe from monitoring events
   */
  unsubscribe(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);
  }

  /**
   * Log workflow execution event
   */
  async logExecution(
    workflowId: string,
    executionId: string,
    level: WorkflowExecutionLog["log_level"],
    message: string,
    options: {
      nodeId?: string;
      nodeName?: string;
      stepNumber?: number;
      duration?: number;
      metadata?: WorkflowExecutionLog["metadata"];
    } = {}
  ): Promise<void> {
    try {
      const logEntry: Omit<WorkflowExecutionLog, "id"> = {
        workflow_id: workflowId,
        execution_id: executionId,
        log_level: level,
        message,
        timestamp: new Date().toISOString(),
        node_id: options.nodeId,
        node_name: options.nodeName,
        step_number: options.stepNumber,
        duration: options.duration,
        metadata: options.metadata,
      };

      // Insert into database
      const { data, error } = await this.supabase
        .from("workflow_execution_logs")
        .insert(logEntry)
        .select()
        .single();

      if (error) throw error;

      // Notify subscribers
      this.notifySubscribers({
        type: "log",
        workflow_id: workflowId,
        execution_id: executionId,
        timestamp: logEntry.timestamp,
        data: { ...logEntry, id: data.id },
      });
    } catch (error) {
      console.error("Error logging workflow execution:", error);
    }
  }

  /**
   * Log workflow error
   */
  async logError(
    workflowId: string,
    executionId: string,
    errorType: WorkflowError["error_type"],
    message: string,
    options: {
      errorCode?: string;
      errorStack?: string;
      nodeId?: string;
      nodeName?: string;
      severity?: WorkflowError["severity"];
      metadata?: Record<string, any>;
    } = {}
  ): Promise<string> {
    try {
      const errorEntry: Omit<WorkflowError, "id"> = {
        workflow_id: workflowId,
        execution_id: executionId,
        error_type: errorType,
        error_code: options.errorCode,
        error_message: message,
        error_stack: options.errorStack,
        timestamp: new Date().toISOString(),
        node_id: options.nodeId,
        node_name: options.nodeName,
        severity: options.severity || "medium",
        resolved: false,
        metadata: options.metadata,
      };

      // Insert into database
      const { data, error } = await this.supabase
        .from("workflow_errors")
        .insert(errorEntry)
        .select()
        .single();

      if (error) throw error;

      // Notify subscribers
      this.notifySubscribers({
        type: "error",
        workflow_id: workflowId,
        execution_id: executionId,
        timestamp: errorEntry.timestamp,
        data: { ...errorEntry, id: data.id },
      });

      // Create alert for high/critical severity errors
      if (
        errorEntry.severity === "high" ||
        errorEntry.severity === "critical"
      ) {
        await this.createAlert(
          workflowId,
          "error",
          errorEntry.severity === "critical" ? "critical" : "warning",
          `Workflow Error: ${errorEntry.error_type}`,
          `${message} (Node: ${options.nodeName || "Unknown"})`,
          { error_id: data.id, ...options.metadata }
        );
      }

      return data.id;
    } catch (error) {
      console.error("Error logging workflow error:", error);
      return "";
    }
  }

  /**
   * Record performance metrics
   */
  async recordPerformanceMetrics(
    workflowId: string,
    executionId: string,
    metrics: Omit<
      WorkflowPerformanceMetrics,
      "workflow_id" | "execution_id" | "timestamp"
    >
  ): Promise<void> {
    try {
      const performanceEntry: Omit<WorkflowPerformanceMetrics, "timestamp"> = {
        workflow_id: workflowId,
        execution_id: executionId,
        ...metrics,
      };

      // Insert into database
      const { error } = await this.supabase
        .from("workflow_performance_metrics")
        .insert({
          ...performanceEntry,
          timestamp: new Date().toISOString(),
        });

      if (error) throw error;

      // Notify subscribers
      this.notifySubscribers({
        type: "performance",
        workflow_id: workflowId,
        execution_id: executionId,
        timestamp: new Date().toISOString(),
        data: { ...performanceEntry, timestamp: new Date().toISOString() },
      });

      // Check for performance alerts
      await this.checkPerformanceAlerts(workflowId, metrics);
    } catch (error) {
      console.error("Error recording performance metrics:", error);
    }
  }

  /**
   * Get workflow execution logs
   */
  async getExecutionLogs(
    workflowId: string,
    executionId?: string,
    options: {
      limit?: number;
      logLevels?: WorkflowExecutionLog["log_level"][];
      startTime?: string;
      endTime?: string;
    } = {}
  ): Promise<WorkflowExecutionLog[]> {
    try {
      let query = this.supabase
        .from("workflow_execution_logs")
        .select("*")
        .eq("workflow_id", workflowId)
        .order("timestamp", { ascending: false });

      if (executionId) {
        query = query.eq("execution_id", executionId);
      }

      if (options.logLevels && options.logLevels.length > 0) {
        query = query.in("log_level", options.logLevels);
      }

      if (options.startTime) {
        query = query.gte("timestamp", options.startTime);
      }

      if (options.endTime) {
        query = query.lte("timestamp", options.endTime);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting execution logs:", error);
      return [];
    }
  }

  /**
   * Get workflow errors
   */
  async getWorkflowErrors(
    workflowId: string,
    options: {
      executionId?: string;
      resolved?: boolean;
      severity?: WorkflowError["severity"][];
      limit?: number;
    } = {}
  ): Promise<WorkflowError[]> {
    try {
      let query = this.supabase
        .from("workflow_errors")
        .select("*")
        .eq("workflow_id", workflowId)
        .order("timestamp", { ascending: false });

      if (options.executionId) {
        query = query.eq("execution_id", options.executionId);
      }

      if (typeof options.resolved === "boolean") {
        query = query.eq("resolved", options.resolved);
      }

      if (options.severity && options.severity.length > 0) {
        query = query.in("severity", options.severity);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting workflow errors:", error);
      return [];
    }
  }

  /**
   * Get live execution status
   */
  async getLiveExecutionStatus(
    workflowId: string
  ): Promise<LiveExecutionStatus | null> {
    try {
      // Get current state from state manager
      const currentState =
        await workflowStateManager.getWorkflowState(workflowId);
      if (!currentState) return null;

      // Get recent logs to determine current activity
      const recentLogs = await this.getExecutionLogs(
        workflowId,
        currentState.execution_id,
        {
          limit: 10,
          logLevels: ["info", "warn", "error"],
        }
      );

      // Get error counts
      const errors = await this.getWorkflowErrors(workflowId, {
        executionId: currentState.execution_id,
        resolved: false,
      });

      const errorCount = errors.filter(
        e => e.severity === "high" || e.severity === "critical"
      ).length;
      const warningCount = errors.filter(
        e => e.severity === "low" || e.severity === "medium"
      ).length;

      // Calculate elapsed time
      const elapsedTime = currentState.started_at
        ? Date.now() - new Date(currentState.started_at).getTime()
        : 0;

      // Estimate remaining time based on progress
      const estimatedRemainingTime =
        currentState.progress_percentage && currentState.progress_percentage > 0
          ? (elapsedTime / currentState.progress_percentage) *
            (100 - currentState.progress_percentage)
          : undefined;

      const status: LiveExecutionStatus = {
        workflow_id: workflowId,
        execution_id: currentState.execution_id || "",
        current_state: currentState.current_state,
        progress_percentage: currentState.progress_percentage || 0,
        current_node: currentState.metadata.current_step,
        current_step: currentState.metadata.current_step,
        elapsed_time: elapsedTime,
        estimated_remaining_time: estimatedRemainingTime,
        error_count: errorCount,
        warning_count: warningCount,
        last_activity: recentLogs[0]?.timestamp || currentState.updated_at,
      };

      return status;
    } catch (error) {
      console.error("Error getting live execution status:", error);
      return null;
    }
  }

  /**
   * Get monitoring alerts
   */
  async getAlerts(
    workflowId?: string,
    options: {
      acknowledged?: boolean;
      resolved?: boolean;
      severity?: MonitoringAlert["severity"][];
      limit?: number;
    } = {}
  ): Promise<MonitoringAlert[]> {
    try {
      let query = this.supabase
        .from("monitoring_alerts")
        .select("*")
        .order("timestamp", { ascending: false });

      if (workflowId) {
        query = query.eq("workflow_id", workflowId);
      }

      if (typeof options.acknowledged === "boolean") {
        query = query.eq("acknowledged", options.acknowledged);
      }

      if (typeof options.resolved === "boolean") {
        query = query.eq("resolved", options.resolved);
      }

      if (options.severity && options.severity.length > 0) {
        query = query.in("severity", options.severity);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting monitoring alerts:", error);
      return [];
    }
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(
    alertId: string,
    acknowledgedBy: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("monitoring_alerts")
        .update({
          acknowledged: true,
          acknowledged_by: acknowledgedBy,
          acknowledged_at: new Date().toISOString(),
        })
        .eq("id", alertId);

      return !error;
    } catch (error) {
      console.error("Error acknowledging alert:", error);
      return false;
    }
  }

  /**
   * Resolve alert
   */
  async resolveAlert(alertId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("monitoring_alerts")
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", alertId);

      return !error;
    } catch (error) {
      console.error("Error resolving alert:", error);
      return false;
    }
  }

  /**
   * Get monitoring dashboard data
   */
  async getDashboardData(): Promise<{
    activeExecutions: number;
    totalErrors: number;
    criticalAlerts: number;
    averageExecutionTime: number;
    systemHealth: "healthy" | "warning" | "critical";
    recentActivity: MonitoringEvent[];
    topErrorWorkflows: Array<{ workflow_id: string; error_count: number }>;
    performanceTrends: Array<{
      timestamp: string;
      average_duration: number;
      throughput: number;
    }>;
  }> {
    try {
      // Get active executions
      const activeStates = await workflowStateManager.getMultipleWorkflowStates(
        []
      );
      const activeExecutions = Array.from(activeStates.values()).filter(
        state => state.current_state === "running"
      ).length;

      // Get total unresolved errors
      const { count: totalErrors } = await this.supabase
        .from("workflow_errors")
        .select("id", { count: "exact" })
        .eq("resolved", false);

      // Get critical alerts
      const { count: criticalAlerts } = await this.supabase
        .from("monitoring_alerts")
        .select("id", { count: "exact" })
        .eq("severity", "critical")
        .eq("resolved", false);

      // Get average execution time from recent performance metrics
      const { data: recentMetrics } = await this.supabase
        .from("workflow_performance_metrics")
        .select("total_duration")
        .gte(
          "timestamp",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        )
        .limit(100);

      const averageExecutionTime =
        recentMetrics && recentMetrics.length > 0
          ? recentMetrics.reduce((sum, m) => sum + m.total_duration, 0) /
            recentMetrics.length
          : 0;

      // Determine system health
      const systemHealth =
        criticalAlerts && criticalAlerts > 0
          ? "critical"
          : totalErrors && totalErrors > 5
            ? "warning"
            : "healthy";

      // Get recent activity (simplified)
      const recentLogs = await this.getExecutionLogs("", undefined, {
        limit: 20,
      });
      const recentActivity: MonitoringEvent[] = recentLogs.map(log => ({
        type: "log" as const,
        workflow_id: log.workflow_id,
        execution_id: log.execution_id,
        timestamp: log.timestamp,
        data: log,
      }));

      return {
        activeExecutions,
        totalErrors: totalErrors || 0,
        criticalAlerts: criticalAlerts || 0,
        averageExecutionTime,
        systemHealth,
        recentActivity,
        topErrorWorkflows: [], // Not implemented in this version
        performanceTrends: [], // Not implemented in this version
      };
    } catch (error) {
      console.error("Error getting dashboard data:", error);
      return {
        activeExecutions: 0,
        totalErrors: 0,
        criticalAlerts: 0,
        averageExecutionTime: 0,
        systemHealth: "critical",
        recentActivity: [],
        topErrorWorkflows: [],
        performanceTrends: [],
      };
    }
  }

  /**
   * Dispose of the monitor
   */
  async dispose(): Promise<void> {
    // Clear intervals
    if (this.performanceCollector) {
      clearInterval(this.performanceCollector);
    }
    if (this.alertProcessor) {
      clearInterval(this.alertProcessor);
    }

    // Remove realtime channels
    for (const channel of this.realtimeChannels) {
      await this.supabase.removeChannel(channel);
    }

    // Clear subscriptions
    this.subscriptions.clear();
    this.isInitialized = false;
  }

  // Private helper methods

  private async setupRealtimeChannels(): Promise<void> {
    // Channel for execution logs
    const logsChannel = this.supabase
      .channel("workflow-logs")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "workflow_execution_logs",
        },
        payload => {
          this.handleRealtimeLog(payload.new);
        }
      )
      .subscribe();

    // Channel for errors
    const errorsChannel = this.supabase
      .channel("workflow-errors")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "workflow_errors",
        },
        payload => {
          this.handleRealtimeError(payload.new);
        }
      )
      .subscribe();

    // Channel for alerts
    const alertsChannel = this.supabase
      .channel("monitoring-alerts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "monitoring_alerts",
        },
        payload => {
          this.handleRealtimeAlert(payload);
        }
      )
      .subscribe();

    this.realtimeChannels = [logsChannel, errorsChannel, alertsChannel];
  }

  private handleRealtimeLog(logData: any): void {
    this.notifySubscribers({
      type: "log",
      workflow_id: logData.workflow_id,
      execution_id: logData.execution_id,
      timestamp: logData.timestamp,
      data: logData,
    });
  }

  private handleRealtimeError(errorData: any): void {
    this.notifySubscribers({
      type: "error",
      workflow_id: errorData.workflow_id,
      execution_id: errorData.execution_id,
      timestamp: errorData.timestamp,
      data: errorData,
    });
  }

  private handleRealtimeAlert(payload: any): void {
    this.notifySubscribers({
      type: "alert",
      workflow_id: payload.new.workflow_id,
      timestamp: payload.new.timestamp,
      data: payload.new,
    });
  }

  private notifySubscribers(event: MonitoringEvent): void {
    this.subscriptions.forEach(subscription => {
      // Check if this event matches the subscription criteria
      if (!subscription.workflow_ids.includes(event.workflow_id)) {
        return;
      }

      if (event.type === "log") {
        const logData = event.data as WorkflowExecutionLog;
        if (!subscription.log_levels.includes(logData.log_level)) {
          return;
        }
      }

      if (event.type === "performance" && !subscription.include_performance) {
        return;
      }

      if (event.type === "error" && !subscription.include_errors) {
        return;
      }

      try {
        subscription.callback(event);
      } catch (error) {
        console.error("Error in monitoring subscription callback:", error);
      }
    });
  }

  private async createAlert(
    workflowId: string,
    alertType: MonitoringAlert["alert_type"],
    severity: MonitoringAlert["severity"],
    title: string,
    description: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await this.supabase.from("monitoring_alerts").insert({
        workflow_id: workflowId,
        alert_type: alertType,
        severity,
        title,
        description,
        timestamp: new Date().toISOString(),
        acknowledged: false,
        resolved: false,
        metadata,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error creating alert:", error);
    }
  }

  private async checkPerformanceAlerts(
    workflowId: string,
    metrics: Omit<
      WorkflowPerformanceMetrics,
      "workflow_id" | "execution_id" | "timestamp"
    >
  ): Promise<void> {
    // Check for performance issues and create alerts
    if (metrics.total_duration > 300000) {
      // 5 minutes
      await this.createAlert(
        workflowId,
        "performance",
        "warning",
        "Long Execution Time",
        `Workflow execution took ${Math.round(metrics.total_duration / 1000)}s, which exceeds the recommended threshold`,
        { duration: metrics.total_duration, threshold: 300000 }
      );
    }

    if (metrics.memory_peak > 1024 * 1024 * 1024) {
      // 1GB
      await this.createAlert(
        workflowId,
        "resource",
        "warning",
        "High Memory Usage",
        `Workflow used ${Math.round(metrics.memory_peak / (1024 * 1024))}MB of memory`,
        { memory_peak: metrics.memory_peak }
      );
    }

    if (metrics.failed_nodes > 0) {
      await this.createAlert(
        workflowId,
        "error",
        "critical",
        "Node Failures Detected",
        `${metrics.failed_nodes} out of ${metrics.node_count} nodes failed during execution`,
        { failed_nodes: metrics.failed_nodes, total_nodes: metrics.node_count }
      );
    }
  }

  private startPerformanceCollection(): void {
    // Collect performance metrics every 30 seconds for active workflows
    this.performanceCollector = setInterval(async () => {
      try {
        // This would integrate with actual performance monitoring
        // For now, we'll just log that collection is running
        console.debug("Performance metrics collection running...");
      } catch (error) {
        console.error("Error in performance collection:", error);
      }
    }, 30000);
  }

  private startAlertProcessing(): void {
    // Process and escalate alerts every minute
    this.alertProcessor = setInterval(async () => {
      try {
        // Get unacknowledged critical alerts older than 5 minutes
        const { data: criticalAlerts } = await this.supabase
          .from("monitoring_alerts")
          .select("*")
          .eq("severity", "critical")
          .eq("acknowledged", false)
          .lt("timestamp", new Date(Date.now() - 5 * 60 * 1000).toISOString());

        // Process escalation logic here
        if (criticalAlerts && criticalAlerts.length > 0) {
          console.warn(
            `${criticalAlerts.length} unacknowledged critical alerts require attention`
          );
        }
      } catch (error) {
        console.error("Error in alert processing:", error);
      }
    }, 60000);
  }
}

// Export singleton instance
export const workflowMonitor = new WorkflowMonitor();

export default WorkflowMonitor;
