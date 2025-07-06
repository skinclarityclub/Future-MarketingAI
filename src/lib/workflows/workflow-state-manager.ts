/**
 * Task 33.2: Develop State Management System
 * Comprehensive workflow state management system for n8n integration
 */

import { createBrowserClient } from "@supabase/ssr";

// State Management Types
export type WorkflowState =
  | "idle"
  | "pending"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled"
  | "retrying"
  | "scheduled";

export type StateTransition =
  | "start"
  | "pause"
  | "resume"
  | "complete"
  | "fail"
  | "cancel"
  | "retry"
  | "schedule"
  | "reset";

export interface WorkflowStateInfo {
  id: string;
  workflow_id: string;
  current_state: WorkflowState;
  previous_state: WorkflowState | null;
  execution_id?: string;
  started_at?: string;
  updated_at: string;
  completed_at?: string;
  duration?: number;
  progress_percentage?: number;
  metadata: {
    trigger_source?: string;
    user_id?: string;
    input_data?: Record<string, any>;
    output_data?: Record<string, any>;
    step_count?: number;
    current_step?: string;
    error_message?: string;
    retry_count?: number;
    scheduled_for?: string;
  };
}

export interface StateTransitionRecord {
  id: string;
  workflow_state_id: string;
  from_state: WorkflowState;
  to_state: WorkflowState;
  transition_type: StateTransition;
  timestamp: string;
  duration_in_previous_state?: number;
  triggered_by?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface WorkflowStateHistory {
  workflow_id: string;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  cancelled_executions: number;
  average_duration: number;
  success_rate: number;
  last_execution: WorkflowStateInfo | null;
  recent_transitions: StateTransitionRecord[];
  state_statistics: Record<
    WorkflowState,
    {
      count: number;
      total_duration: number;
      average_duration: number;
    }
  >;
}

export interface StateSubscription {
  workflow_id: string;
  callback: (state: WorkflowStateInfo) => void;
  filter?: {
    states?: WorkflowState[];
    transitions?: StateTransition[];
  };
}

export class WorkflowStateManager {
  private supabase;
  private subscriptions: Map<string, StateSubscription> = new Map();
  private stateCache: Map<string, WorkflowStateInfo> = new Map();
  private realtimeChannel: any;
  private isInitialized = false;

  constructor() {
    this.supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Initialize the state manager and set up real-time subscriptions
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Set up real-time channel for workflow state changes
      this.realtimeChannel = this.supabase
        .channel("workflow-states")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "workflow_states",
          },
          payload => {
            this.handleRealtimeStateChange(payload);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "workflow_state_transitions",
          },
          payload => {
            this.handleRealtimeTransitionChange(payload);
          }
        )
        .subscribe();

      this.isInitialized = true;
      console.log("Workflow State Manager initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Workflow State Manager:", error);
      throw error;
    }
  }

  /**
   * Create a new workflow state
   */
  async createWorkflowState(
    workflowId: string,
    initialState: WorkflowState = "idle",
    metadata: WorkflowStateInfo["metadata"] = {}
  ): Promise<WorkflowStateInfo> {
    try {
      const stateId = `state_${workflowId}_${Date.now()}`;
      const now = new Date().toISOString();

      const stateInfo: WorkflowStateInfo = {
        id: stateId,
        workflow_id: workflowId,
        current_state: initialState,
        previous_state: null,
        updated_at: now,
        metadata,
      };

      // Insert into database
      const { data, error } = await this.supabase
        .from("workflow_states")
        .insert({
          id: stateInfo.id,
          workflow_id: stateInfo.workflow_id,
          current_state: stateInfo.current_state,
          previous_state: stateInfo.previous_state,
          execution_id: stateInfo.execution_id,
          started_at: stateInfo.started_at,
          updated_at: stateInfo.updated_at,
          completed_at: stateInfo.completed_at,
          duration: stateInfo.duration,
          progress_percentage: stateInfo.progress_percentage || 0,
          metadata: stateInfo.metadata,
        })
        .select()
        .single();

      if (error) throw error;

      // Update cache
      this.stateCache.set(workflowId, stateInfo);

      // Create initial transition record
      await this.recordStateTransition(
        stateInfo.id,
        "idle",
        initialState,
        "start",
        "Initial state creation"
      );

      return stateInfo;
    } catch (error) {
      console.error(`Error creating workflow state for ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * Get current state of a workflow
   */
  async getWorkflowState(
    workflowId: string
  ): Promise<WorkflowStateInfo | null> {
    try {
      // Check cache first
      if (this.stateCache.has(workflowId)) {
        return this.stateCache.get(workflowId)!;
      }

      // Fetch from database
      const { data, error } = await this.supabase
        .from("workflow_states")
        .select("*")
        .eq("workflow_id", workflowId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (!data) return null;

      const stateInfo: WorkflowStateInfo = {
        id: data.id,
        workflow_id: data.workflow_id,
        current_state: data.current_state,
        previous_state: data.previous_state,
        execution_id: data.execution_id,
        started_at: data.started_at,
        updated_at: data.updated_at,
        completed_at: data.completed_at,
        duration: data.duration,
        progress_percentage: data.progress_percentage,
        metadata: data.metadata || {},
      };

      // Update cache
      this.stateCache.set(workflowId, stateInfo);

      return stateInfo;
    } catch (error) {
      console.error(`Error getting workflow state for ${workflowId}:`, error);
      return null;
    }
  }

  /**
   * Transition workflow to a new state
   */
  async transitionWorkflowState(
    workflowId: string,
    newState: WorkflowState,
    transitionType: StateTransition,
    options: {
      executionId?: string;
      progress?: number;
      metadata?: Record<string, any>;
      triggeredBy?: string;
      reason?: string;
    } = {}
  ): Promise<WorkflowStateInfo> {
    try {
      const currentState = await this.getWorkflowState(workflowId);

      if (!currentState) {
        // Create new state if it doesn't exist
        return await this.createWorkflowState(
          workflowId,
          newState,
          options.metadata
        );
      }

      // Validate transition
      if (
        !this.isValidTransition(
          currentState.current_state,
          newState,
          transitionType
        )
      ) {
        throw new Error(
          `Invalid transition: ${currentState.current_state} -> ${newState} via ${transitionType}`
        );
      }

      const now = new Date().toISOString();
      const previousState = currentState.current_state;

      // Calculate duration in previous state
      const durationInPreviousState = currentState.updated_at
        ? Date.now() - new Date(currentState.updated_at).getTime()
        : 0;

      // Update state info
      const updatedState: WorkflowStateInfo = {
        ...currentState,
        current_state: newState,
        previous_state: previousState,
        updated_at: now,
        execution_id: options.executionId || currentState.execution_id,
        progress_percentage:
          options.progress ?? currentState.progress_percentage,
        metadata: {
          ...currentState.metadata,
          ...options.metadata,
        },
      };

      // Set timestamps based on state
      if (newState === "running" && !updatedState.started_at) {
        updatedState.started_at = now;
      }

      if (["completed", "failed", "cancelled"].includes(newState)) {
        updatedState.completed_at = now;
        updatedState.duration = updatedState.started_at
          ? Date.now() - new Date(updatedState.started_at).getTime()
          : undefined;
      }

      // Update database
      const { data, error } = await this.supabase
        .from("workflow_states")
        .update({
          current_state: updatedState.current_state,
          previous_state: updatedState.previous_state,
          execution_id: updatedState.execution_id,
          updated_at: updatedState.updated_at,
          completed_at: updatedState.completed_at,
          duration: updatedState.duration,
          progress_percentage: updatedState.progress_percentage,
          metadata: updatedState.metadata,
        })
        .eq("id", currentState.id)
        .select()
        .single();

      if (error) throw error;

      // Update cache
      this.stateCache.set(workflowId, updatedState);

      // Record transition
      await this.recordStateTransition(
        currentState.id,
        previousState,
        newState,
        transitionType,
        options.reason,
        options.triggeredBy,
        durationInPreviousState,
        options.metadata
      );

      // Notify subscribers
      this.notifySubscribers(updatedState);

      return updatedState;
    } catch (error) {
      console.error(
        `Error transitioning workflow ${workflowId} to ${newState}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get workflow state history
   */
  async getWorkflowHistory(
    workflowId: string,
    limit: number = 50
  ): Promise<WorkflowStateHistory> {
    try {
      // Get all states for this workflow
      const { data: states, error: statesError } = await this.supabase
        .from("workflow_states")
        .select("*")
        .eq("workflow_id", workflowId)
        .order("updated_at", { ascending: false })
        .limit(limit);

      if (statesError) throw statesError;

      // Get recent transitions
      const { data: transitions, error: transitionsError } = await this.supabase
        .from("workflow_state_transitions")
        .select("*")
        .in("workflow_state_id", states?.map(s => s.id) || [])
        .order("timestamp", { ascending: false })
        .limit(100);

      if (transitionsError) throw transitionsError;

      // Calculate statistics
      const totalExecutions = states?.length || 0;
      const successfulExecutions =
        states?.filter(s => s.current_state === "completed").length || 0;
      const failedExecutions =
        states?.filter(s => s.current_state === "failed").length || 0;
      const cancelledExecutions =
        states?.filter(s => s.current_state === "cancelled").length || 0;

      const completedStates = states?.filter(s => s.duration) || [];
      const averageDuration =
        completedStates.length > 0
          ? completedStates.reduce((sum, s) => sum + (s.duration || 0), 0) /
            completedStates.length
          : 0;

      const successRate =
        totalExecutions > 0
          ? (successfulExecutions / totalExecutions) * 100
          : 0;

      // Calculate state statistics
      const stateStatistics: WorkflowStateHistory["state_statistics"] =
        {} as any;
      const allStates: WorkflowState[] = [
        "idle",
        "pending",
        "running",
        "paused",
        "completed",
        "failed",
        "cancelled",
        "retrying",
        "scheduled",
      ];

      allStates.forEach(state => {
        const stateOccurrences =
          states?.filter(s => s.current_state === state) || [];
        const stateDurations = stateOccurrences
          .filter(s => s.duration)
          .map(s => s.duration || 0);

        stateStatistics[state] = {
          count: stateOccurrences.length,
          total_duration: stateDurations.reduce((sum, d) => sum + d, 0),
          average_duration:
            stateDurations.length > 0
              ? stateDurations.reduce((sum, d) => sum + d, 0) /
                stateDurations.length
              : 0,
        };
      });

      const history: WorkflowStateHistory = {
        workflow_id: workflowId,
        total_executions: totalExecutions,
        successful_executions: successfulExecutions,
        failed_executions: failedExecutions,
        cancelled_executions: cancelledExecutions,
        average_duration: averageDuration,
        success_rate: successRate,
        last_execution: states?.[0]
          ? {
              id: states[0].id,
              workflow_id: states[0].workflow_id,
              current_state: states[0].current_state,
              previous_state: states[0].previous_state,
              execution_id: states[0].execution_id,
              started_at: states[0].started_at,
              updated_at: states[0].updated_at,
              completed_at: states[0].completed_at,
              duration: states[0].duration,
              progress_percentage: states[0].progress_percentage,
              metadata: states[0].metadata || {},
            }
          : null,
        recent_transitions:
          transitions?.map(t => ({
            id: t.id,
            workflow_state_id: t.workflow_state_id,
            from_state: t.from_state,
            to_state: t.to_state,
            transition_type: t.transition_type,
            timestamp: t.timestamp,
            duration_in_previous_state: t.duration_in_previous_state,
            triggered_by: t.triggered_by,
            reason: t.reason,
            metadata: t.metadata,
          })) || [],
        state_statistics: stateStatistics,
      };

      return history;
    } catch (error) {
      console.error(`Error getting workflow history for ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to workflow state changes
   */
  subscribeToWorkflowState(
    workflowId: string,
    callback: (state: WorkflowStateInfo) => void,
    filter?: StateSubscription["filter"]
  ): string {
    const subscriptionId = `sub_${workflowId}_${Date.now()}`;

    this.subscriptions.set(subscriptionId, {
      workflow_id: workflowId,
      callback,
      filter,
    });

    return subscriptionId;
  }

  /**
   * Unsubscribe from workflow state changes
   */
  unsubscribe(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);
  }

  /**
   * Get multiple workflow states
   */
  async getMultipleWorkflowStates(
    workflowIds: string[]
  ): Promise<Map<string, WorkflowStateInfo>> {
    try {
      const { data, error } = await this.supabase
        .from("workflow_states")
        .select("*")
        .in("workflow_id", workflowIds)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const statesMap = new Map<string, WorkflowStateInfo>();

      // Group by workflow_id and take the most recent
      const groupedStates = new Map<string, any>();
      data?.forEach(state => {
        if (
          !groupedStates.has(state.workflow_id) ||
          new Date(state.updated_at) >
            new Date(groupedStates.get(state.workflow_id).updated_at)
        ) {
          groupedStates.set(state.workflow_id, state);
        }
      });

      groupedStates.forEach((data, workflowId) => {
        const stateInfo: WorkflowStateInfo = {
          id: data.id,
          workflow_id: data.workflow_id,
          current_state: data.current_state,
          previous_state: data.previous_state,
          execution_id: data.execution_id,
          started_at: data.started_at,
          updated_at: data.updated_at,
          completed_at: data.completed_at,
          duration: data.duration,
          progress_percentage: data.progress_percentage,
          metadata: data.metadata || {},
        };

        statesMap.set(workflowId, stateInfo);
        this.stateCache.set(workflowId, stateInfo);
      });

      return statesMap;
    } catch (error) {
      console.error("Error getting multiple workflow states:", error);
      return new Map();
    }
  }

  /**
   * Clean up old state records
   */
  async cleanupOldStates(olderThanDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const { count, error } = await this.supabase
        .from("workflow_states")
        .delete()
        .lt("updated_at", cutoffDate.toISOString())
        .select("*", { count: "exact" });

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error("Error cleaning up old states:", error);
      return 0;
    }
  }

  /**
   * Dispose of the state manager
   */
  async dispose(): Promise<void> {
    if (this.realtimeChannel) {
      await this.supabase.removeChannel(this.realtimeChannel);
    }

    this.subscriptions.clear();
    this.stateCache.clear();
    this.isInitialized = false;
  }

  // Private helper methods

  private async recordStateTransition(
    stateId: string,
    fromState: WorkflowState,
    toState: WorkflowState,
    transitionType: StateTransition,
    reason?: string,
    triggeredBy?: string,
    durationInPreviousState?: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("workflow_state_transitions")
        .insert({
          workflow_state_id: stateId,
          from_state: fromState,
          to_state: toState,
          transition_type: transitionType,
          timestamp: new Date().toISOString(),
          duration_in_previous_state: durationInPreviousState,
          triggered_by: triggeredBy,
          reason,
          metadata,
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error recording state transition:", error);
      // Don't throw here to avoid breaking main workflow
    }
  }

  private isValidTransition(
    currentState: WorkflowState,
    newState: WorkflowState,
    transitionType: StateTransition
  ): boolean {
    // Define valid transitions
    const validTransitions: Record<WorkflowState, WorkflowState[]> = {
      idle: ["pending", "scheduled", "running"],
      pending: ["running", "cancelled", "failed"],
      running: ["paused", "completed", "failed", "cancelled"],
      paused: ["running", "cancelled", "failed"],
      completed: ["idle", "pending"], // For re-runs
      failed: ["retrying", "cancelled", "idle"],
      cancelled: ["idle", "pending"], // For re-runs
      retrying: ["running", "failed", "cancelled"],
      scheduled: ["pending", "running", "cancelled"],
    };

    return validTransitions[currentState]?.includes(newState) || false;
  }

  private handleRealtimeStateChange(payload: any): void {
    try {
      const { new: newRecord, old: oldRecord, eventType } = payload;

      if (eventType === "INSERT" || eventType === "UPDATE") {
        const stateInfo: WorkflowStateInfo = {
          id: newRecord.id,
          workflow_id: newRecord.workflow_id,
          current_state: newRecord.current_state,
          previous_state: newRecord.previous_state,
          execution_id: newRecord.execution_id,
          started_at: newRecord.started_at,
          updated_at: newRecord.updated_at,
          completed_at: newRecord.completed_at,
          duration: newRecord.duration,
          progress_percentage: newRecord.progress_percentage,
          metadata: newRecord.metadata || {},
        };

        // Update cache
        this.stateCache.set(newRecord.workflow_id, stateInfo);

        // Notify subscribers
        this.notifySubscribers(stateInfo);
      }
    } catch (error) {
      console.error("Error handling realtime state change:", error);
    }
  }

  private handleRealtimeTransitionChange(payload: any): void {
    // Handle transition changes if needed for specific use cases
    console.log("Transition change received:", payload);
  }

  private notifySubscribers(stateInfo: WorkflowStateInfo): void {
    this.subscriptions.forEach(subscription => {
      if (subscription.workflow_id === stateInfo.workflow_id) {
        // Apply filters if specified
        if (
          subscription.filter?.states &&
          !subscription.filter.states.includes(stateInfo.current_state)
        ) {
          return;
        }

        try {
          subscription.callback(stateInfo);
        } catch (error) {
          console.error("Error in state subscription callback:", error);
        }
      }
    });
  }
}

// Export singleton instance
export const workflowStateManager = new WorkflowStateManager();

export default WorkflowStateManager;
