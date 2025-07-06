/**
 * Task 33.2: Develop State Management System
 * API endpoints for workflow state management
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Types
type WorkflowState =
  | "idle"
  | "pending"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled"
  | "retrying"
  | "scheduled";

type StateTransition =
  | "start"
  | "pause"
  | "resume"
  | "complete"
  | "fail"
  | "cancel"
  | "retry"
  | "schedule"
  | "reset";

/**
 * GET /api/workflows/state
 * Get workflow state(s)
 * Query params:
 * - workflow_id: single workflow ID
 * - workflow_ids: comma-separated list of workflow IDs
 * - include_history: include transition history
 * - include_aggregates: include performance aggregates
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get("workflow_id");
    const workflowIds = searchParams.get("workflow_ids");
    const includeHistory = searchParams.get("include_history") === "true";
    const includeAggregates = searchParams.get("include_aggregates") === "true";

    if (!workflowId && !workflowIds) {
      return NextResponse.json(
        { error: "workflow_id or workflow_ids parameter is required" },
        { status: 400 }
      );
    }

    // Create Supabase client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    if (workflowId) {
      // Single workflow state
      const { data: state, error: stateError } = await supabase
        .from("workflow_states")
        .select("*")
        .eq("workflow_id", workflowId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (stateError && stateError.code !== "PGRST116") {
        throw stateError;
      }

      if (!state) {
        return NextResponse.json(
          { error: "Workflow state not found" },
          { status: 404 }
        );
      }

      const result: any = { state };

      // Include history if requested
      if (includeHistory) {
        const { data: transitions, error: transitionError } = await supabase
          .from("workflow_state_transitions")
          .select("*")
          .eq("workflow_state_id", state.id)
          .order("timestamp", { ascending: false })
          .limit(50);

        if (transitionError) throw transitionError;
        result.history = transitions;
      }

      // Include aggregates if requested
      if (includeAggregates) {
        const { data: aggregates, error: aggregateError } = await supabase
          .from("workflow_state_aggregates")
          .select("*")
          .eq("workflow_id", workflowId)
          .single();

        if (aggregateError && aggregateError.code !== "PGRST116") {
          throw aggregateError;
        }

        result.aggregates = aggregates;
      }

      return NextResponse.json(result);
    } else if (workflowIds) {
      // Multiple workflow states
      const ids = workflowIds
        .split(",")
        .map(id => id.trim())
        .filter(Boolean);

      if (ids.length === 0) {
        return NextResponse.json(
          { error: "No valid workflow IDs provided" },
          { status: 400 }
        );
      }

      const { data: states, error: statesError } = await supabase
        .from("workflow_states")
        .select("*")
        .in("workflow_id", ids)
        .order("updated_at", { ascending: false });

      if (statesError) throw statesError;

      // Group by workflow_id and take the most recent
      const statesMap = new Map();
      states?.forEach(state => {
        if (
          !statesMap.has(state.workflow_id) ||
          new Date(state.updated_at) >
            new Date(statesMap.get(state.workflow_id).updated_at)
        ) {
          statesMap.set(state.workflow_id, state);
        }
      });

      const result: any = {
        states: Object.fromEntries(statesMap),
      };

      // Include aggregates if requested
      if (includeAggregates) {
        const { data: aggregates, error: aggregateError } = await supabase
          .from("workflow_state_aggregates")
          .select("*")
          .in("workflow_id", ids);

        if (aggregateError) throw aggregateError;

        result.aggregates = Object.fromEntries(
          aggregates?.map(agg => [agg.workflow_id, agg]) || []
        );
      }

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("Error fetching workflow state:", error);
    return NextResponse.json(
      { error: "Failed to fetch workflow state" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflows/state
 * Create or update workflow state
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      workflow_id,
      new_state,
      transition_type,
      execution_id,
      progress,
      metadata,
      triggered_by,
      reason,
    } = body;

    // Validate required fields
    if (!workflow_id || !new_state || !transition_type) {
      return NextResponse.json(
        { error: "workflow_id, new_state, and transition_type are required" },
        { status: 400 }
      );
    }

    // Validate state and transition values
    const validStates: WorkflowState[] = [
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
    const validTransitions: StateTransition[] = [
      "start",
      "pause",
      "resume",
      "complete",
      "fail",
      "cancel",
      "retry",
      "schedule",
      "reset",
    ];

    if (!validStates.includes(new_state)) {
      return NextResponse.json(
        { error: `Invalid state: ${new_state}` },
        { status: 400 }
      );
    }

    if (!validTransitions.includes(transition_type)) {
      return NextResponse.json(
        { error: `Invalid transition type: ${transition_type}` },
        { status: 400 }
      );
    }

    // Create Supabase client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Get current state
    const { data: currentState, error: getCurrentError } = await supabase
      .from("workflow_states")
      .select("*")
      .eq("workflow_id", workflow_id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (getCurrentError) throw getCurrentError;

    const now = new Date().toISOString();
    let stateData: any;

    if (!currentState) {
      // Create new state
      const stateId = `state_${workflow_id}_${Date.now()}`;

      stateData = {
        id: stateId,
        workflow_id,
        current_state: new_state,
        previous_state: null,
        execution_id,
        updated_at: now,
        progress_percentage: progress || 0,
        metadata: metadata || {},
      };

      // Set timestamps based on state
      if (new_state === "running") {
        stateData.started_at = now;
      }

      if (["completed", "failed", "cancelled"].includes(new_state)) {
        stateData.completed_at = now;
        stateData.duration = 0; // No previous start time
      }

      const { data: insertedState, error: insertError } = await supabase
        .from("workflow_states")
        .insert(stateData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Record transition
      await supabase.from("workflow_state_transitions").insert({
        workflow_state_id: stateId,
        from_state: "idle",
        to_state: new_state,
        transition_type,
        timestamp: now,
        triggered_by,
        reason,
      });

      return NextResponse.json({
        state: insertedState,
        transition: "created",
      });
    } else {
      // Update existing state
      const previousState = currentState.current_state;

      // Calculate duration in previous state
      const durationInPreviousState =
        new Date(now).getTime() - new Date(currentState.updated_at).getTime();

      // Prepare update data
      const updateData: any = {
        current_state: new_state,
        previous_state: previousState,
        updated_at: now,
        progress_percentage: progress ?? currentState.progress_percentage,
        metadata: {
          ...currentState.metadata,
          ...metadata,
        },
      };

      if (execution_id) {
        updateData.execution_id = execution_id;
      }

      // Set timestamps based on state
      if (new_state === "running" && !currentState.started_at) {
        updateData.started_at = now;
      }

      if (["completed", "failed", "cancelled"].includes(new_state)) {
        updateData.completed_at = now;
        updateData.duration = currentState.started_at
          ? new Date(now).getTime() -
            new Date(currentState.started_at).getTime()
          : undefined;
      }

      const { data: updatedState, error: updateError } = await supabase
        .from("workflow_states")
        .update(updateData)
        .eq("id", currentState.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Record transition
      await supabase.from("workflow_state_transitions").insert({
        workflow_state_id: currentState.id,
        from_state: previousState,
        to_state: new_state,
        transition_type,
        timestamp: now,
        duration_in_previous_state: durationInPreviousState,
        triggered_by,
        reason,
        metadata,
      });

      return NextResponse.json({
        state: updatedState,
        transition: "updated",
      });
    }
  } catch (error) {
    console.error("Error updating workflow state:", error);
    return NextResponse.json(
      { error: "Failed to update workflow state" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workflows/state
 * Clean up old workflow states
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daysOld = parseInt(searchParams.get("days_old") || "30");
    const workflowId = searchParams.get("workflow_id");

    // Create Supabase client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    let query = supabase
      .from("workflow_states")
      .delete()
      .lt("updated_at", cutoffDate.toISOString())
      .in("current_state", ["completed", "failed", "cancelled"]);

    if (workflowId) {
      query = query.eq("workflow_id", workflowId);
    }

    const { count, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      message: `Cleaned up ${count || 0} old workflow states`,
      deleted_count: count || 0,
      cutoff_date: cutoffDate.toISOString(),
    });
  } catch (error) {
    console.error("Error cleaning up workflow states:", error);
    return NextResponse.json(
      { error: "Failed to clean up workflow states" },
      { status: 500 }
    );
  }
}
