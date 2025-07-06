/**
 * Task 33.3: Implement Real-Time Monitoring
 * API endpoints for workflow monitoring, logging, and alerting
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Types
interface MonitoringQuery {
  workflow_id?: string;
  execution_id?: string;
  log_levels?: string[];
  severity?: string[];
  resolved?: boolean;
  acknowledged?: boolean;
  start_time?: string;
  end_time?: string;
  limit?: number;
  offset?: number;
}

interface LogEntry {
  workflow_id: string;
  execution_id: string;
  log_level: "debug" | "info" | "warn" | "error" | "fatal";
  message: string;
  node_id?: string;
  node_name?: string;
  step_number?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface ErrorEntry {
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
  node_id?: string;
  node_name?: string;
  severity?: "low" | "medium" | "high" | "critical";
  metadata?: Record<string, any>;
}

interface PerformanceMetrics {
  workflow_id: string;
  execution_id: string;
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
  throughput: number;
  bottleneck_nodes: string[];
  metadata?: Record<string, any>;
}

interface AlertEntry {
  workflow_id: string;
  alert_type: "performance" | "error" | "timeout" | "resource" | "dependency";
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  metadata?: Record<string, any>;
}

// Helper function to create Supabase client
async function createSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
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
}

// GET: Retrieve monitoring data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "logs"; // logs, errors, performance, alerts, dashboard

    const query: MonitoringQuery = {
      workflow_id: searchParams.get("workflow_id") || undefined,
      execution_id: searchParams.get("execution_id") || undefined,
      log_levels: searchParams.get("log_levels")?.split(",") || undefined,
      severity: searchParams.get("severity")?.split(",") || undefined,
      resolved: searchParams.get("resolved")
        ? searchParams.get("resolved") === "true"
        : undefined,
      acknowledged: searchParams.get("acknowledged")
        ? searchParams.get("acknowledged") === "true"
        : undefined,
      start_time: searchParams.get("start_time") || undefined,
      end_time: searchParams.get("end_time") || undefined,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 50,
      offset: searchParams.get("offset")
        ? parseInt(searchParams.get("offset")!)
        : 0,
    };

    const supabase = await createSupabaseClient();

    switch (type) {
      case "logs":
        return await getExecutionLogs(supabase, query);

      case "errors":
        return await getWorkflowErrors(supabase, query);

      case "performance":
        return await getPerformanceMetrics(supabase, query);

      case "alerts":
        return await getMonitoringAlerts(supabase, query);

      case "dashboard":
        return await getDashboardSummary(supabase, query);

      case "live-status":
        if (!query.workflow_id) {
          return NextResponse.json(
            { error: "workflow_id is required for live status" },
            { status: 400 }
          );
        }
        return await getLiveExecutionStatus(supabase, query.workflow_id);

      default:
        return NextResponse.json(
          {
            error:
              "Invalid type parameter. Must be one of: logs, errors, performance, alerts, dashboard, live-status",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in monitoring GET:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST: Create monitoring entries
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "log";
    const body = await request.json();

    const supabase = await createSupabaseClient();

    switch (type) {
      case "log":
        return await createLogEntry(supabase, body as LogEntry);

      case "error":
        return await createErrorEntry(supabase, body as ErrorEntry);

      case "performance":
        return await createPerformanceEntry(
          supabase,
          body as PerformanceMetrics
        );

      case "alert":
        return await createAlertEntry(supabase, body as AlertEntry);

      case "batch":
        return await createBatchEntries(supabase, body);

      default:
        return NextResponse.json(
          {
            error:
              "Invalid type parameter. Must be one of: log, error, performance, alert, batch",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in monitoring POST:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PATCH: Update monitoring entries (mainly for alerts and errors)
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");
    const body = await request.json();

    if (!type || !id) {
      return NextResponse.json(
        { error: "type and id parameters are required" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseClient();

    switch (type) {
      case "error":
        return await updateError(supabase, id, body);

      case "alert":
        return await updateAlert(supabase, id, body);

      default:
        return NextResponse.json(
          { error: "Invalid type parameter. Must be one of: error, alert" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in monitoring PATCH:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE: Clean up old monitoring data
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const retention_days = parseInt(searchParams.get("retention_days") || "90");

    const supabase = await createSupabaseClient();

    // Call the cleanup function
    const { data, error } = await supabase.rpc("cleanup_old_workflow_states", {
      older_than_days: retention_days,
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      deleted_count: data,
      retention_days,
    });
  } catch (error) {
    console.error("Error in monitoring DELETE:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper functions for GET operations

async function getExecutionLogs(supabase: any, query: MonitoringQuery) {
  let dbQuery = supabase
    .from("workflow_execution_logs")
    .select("*")
    .order("timestamp", { ascending: false });

  if (query.workflow_id) {
    dbQuery = dbQuery.eq("workflow_id", query.workflow_id);
  }

  if (query.execution_id) {
    dbQuery = dbQuery.eq("execution_id", query.execution_id);
  }

  if (query.log_levels && query.log_levels.length > 0) {
    dbQuery = dbQuery.in("log_level", query.log_levels);
  }

  if (query.start_time) {
    dbQuery = dbQuery.gte("timestamp", query.start_time);
  }

  if (query.end_time) {
    dbQuery = dbQuery.lte("timestamp", query.end_time);
  }

  if (query.limit) {
    dbQuery = dbQuery.limit(query.limit);
  }

  if (query.offset) {
    dbQuery = dbQuery.range(
      query.offset,
      query.offset + (query.limit || 50) - 1
    );
  }

  const { data, error, count } = await dbQuery;

  if (error) throw error;

  return NextResponse.json({
    success: true,
    data,
    count,
    query,
  });
}

async function getWorkflowErrors(supabase: any, query: MonitoringQuery) {
  let dbQuery = supabase
    .from("workflow_errors")
    .select("*")
    .order("timestamp", { ascending: false });

  if (query.workflow_id) {
    dbQuery = dbQuery.eq("workflow_id", query.workflow_id);
  }

  if (query.execution_id) {
    dbQuery = dbQuery.eq("execution_id", query.execution_id);
  }

  if (query.severity && query.severity.length > 0) {
    dbQuery = dbQuery.in("severity", query.severity);
  }

  if (typeof query.resolved === "boolean") {
    dbQuery = dbQuery.eq("resolved", query.resolved);
  }

  if (query.start_time) {
    dbQuery = dbQuery.gte("timestamp", query.start_time);
  }

  if (query.end_time) {
    dbQuery = dbQuery.lte("timestamp", query.end_time);
  }

  if (query.limit) {
    dbQuery = dbQuery.limit(query.limit);
  }

  if (query.offset) {
    dbQuery = dbQuery.range(
      query.offset,
      query.offset + (query.limit || 50) - 1
    );
  }

  const { data, error, count } = await dbQuery;

  if (error) throw error;

  return NextResponse.json({
    success: true,
    data,
    count,
    query,
  });
}

async function getPerformanceMetrics(supabase: any, query: MonitoringQuery) {
  let dbQuery = supabase
    .from("workflow_performance_metrics")
    .select("*")
    .order("timestamp", { ascending: false });

  if (query.workflow_id) {
    dbQuery = dbQuery.eq("workflow_id", query.workflow_id);
  }

  if (query.execution_id) {
    dbQuery = dbQuery.eq("execution_id", query.execution_id);
  }

  if (query.start_time) {
    dbQuery = dbQuery.gte("timestamp", query.start_time);
  }

  if (query.end_time) {
    dbQuery = dbQuery.lte("timestamp", query.end_time);
  }

  if (query.limit) {
    dbQuery = dbQuery.limit(query.limit);
  }

  if (query.offset) {
    dbQuery = dbQuery.range(
      query.offset,
      query.offset + (query.limit || 50) - 1
    );
  }

  const { data, error, count } = await dbQuery;

  if (error) throw error;

  return NextResponse.json({
    success: true,
    data,
    count,
    query,
  });
}

async function getMonitoringAlerts(supabase: any, query: MonitoringQuery) {
  let dbQuery = supabase
    .from("monitoring_alerts")
    .select("*")
    .order("timestamp", { ascending: false });

  if (query.workflow_id) {
    dbQuery = dbQuery.eq("workflow_id", query.workflow_id);
  }

  if (query.severity && query.severity.length > 0) {
    dbQuery = dbQuery.in("severity", query.severity);
  }

  if (typeof query.acknowledged === "boolean") {
    dbQuery = dbQuery.eq("acknowledged", query.acknowledged);
  }

  if (typeof query.resolved === "boolean") {
    dbQuery = dbQuery.eq("resolved", query.resolved);
  }

  if (query.start_time) {
    dbQuery = dbQuery.gte("timestamp", query.start_time);
  }

  if (query.end_time) {
    dbQuery = dbQuery.lte("timestamp", query.end_time);
  }

  if (query.limit) {
    dbQuery = dbQuery.limit(query.limit);
  }

  if (query.offset) {
    dbQuery = dbQuery.range(
      query.offset,
      query.offset + (query.limit || 50) - 1
    );
  }

  const { data, error, count } = await dbQuery;

  if (error) throw error;

  return NextResponse.json({
    success: true,
    data,
    count,
    query,
  });
}

async function getDashboardSummary(supabase: any, query: MonitoringQuery) {
  const hoursBack = 24; // Default to 24 hours

  const { data, error } = await supabase.rpc(
    "get_monitoring_dashboard_summary",
    {
      p_workflow_id: query.workflow_id || null,
      p_hours_back: hoursBack,
    }
  );

  if (error) throw error;

  // Get additional metrics
  const [recentLogs, recentErrors, recentAlerts] = await Promise.all([
    supabase
      .from("workflow_execution_logs")
      .select("*")
      .gte(
        "timestamp",
        new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString()
      )
      .order("timestamp", { ascending: false })
      .limit(20),

    supabase
      .from("workflow_errors")
      .select("*")
      .gte(
        "timestamp",
        new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString()
      )
      .order("timestamp", { ascending: false })
      .limit(10),

    supabase
      .from("monitoring_alerts")
      .select("*")
      .gte(
        "timestamp",
        new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString()
      )
      .order("timestamp", { ascending: false })
      .limit(10),
  ]);

  const summary = data[0] || {};

  return NextResponse.json({
    success: true,
    data: {
      ...summary,
      recent_activity: {
        logs: recentLogs.data || [],
        errors: recentErrors.data || [],
        alerts: recentAlerts.data || [],
      },
      timeframe_hours: hoursBack,
    },
  });
}

async function getLiveExecutionStatus(supabase: any, workflowId: string) {
  // Get current workflow state
  const { data: stateData, error: stateError } = await supabase
    .from("workflow_states")
    .select("*")
    .eq("workflow_id", workflowId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (stateError && stateError.code !== "PGRST116") {
    // PGRST116 = no rows found
    throw stateError;
  }

  if (!stateData) {
    return NextResponse.json({
      success: true,
      data: null,
      message: "No active execution found for this workflow",
    });
  }

  // Get recent logs for this execution
  const { data: recentLogs } = await supabase
    .from("workflow_execution_logs")
    .select("*")
    .eq("workflow_id", workflowId)
    .eq("execution_id", stateData.execution_id || "")
    .order("timestamp", { ascending: false })
    .limit(10);

  // Get error counts
  const { data: errorCounts } = await supabase
    .from("workflow_errors")
    .select("severity")
    .eq("workflow_id", workflowId)
    .eq("execution_id", stateData.execution_id || "")
    .eq("resolved", false);

  const errorCount =
    errorCounts?.filter(
      (e: any) => e.severity === "high" || e.severity === "critical"
    ).length || 0;
  const warningCount =
    errorCounts?.filter(
      (e: any) => e.severity === "low" || e.severity === "medium"
    ).length || 0;

  // Calculate elapsed time
  const elapsedTime = stateData.started_at
    ? Date.now() - new Date(stateData.started_at).getTime()
    : 0;

  // Estimate remaining time based on progress
  const estimatedRemainingTime =
    stateData.progress_percentage && stateData.progress_percentage > 0
      ? (elapsedTime / stateData.progress_percentage) *
        (100 - stateData.progress_percentage)
      : undefined;

  const liveStatus = {
    workflow_id: workflowId,
    execution_id: stateData.execution_id || "",
    current_state: stateData.current_state,
    progress_percentage: stateData.progress_percentage || 0,
    current_node: stateData.metadata?.current_step,
    current_step: stateData.metadata?.current_step,
    elapsed_time: elapsedTime,
    estimated_remaining_time: estimatedRemainingTime,
    error_count: errorCount,
    warning_count: warningCount,
    last_activity: recentLogs?.[0]?.timestamp || stateData.updated_at,
    recent_logs: recentLogs || [],
  };

  return NextResponse.json({
    success: true,
    data: liveStatus,
  });
}

// Helper functions for POST operations

async function createLogEntry(supabase: any, logEntry: LogEntry) {
  const { data, error } = await supabase
    .from("workflow_execution_logs")
    .insert({
      ...logEntry,
      timestamp: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return NextResponse.json({
    success: true,
    data,
    message: "Log entry created successfully",
  });
}

async function createErrorEntry(supabase: any, errorEntry: ErrorEntry) {
  const { data, error } = await supabase
    .from("workflow_errors")
    .insert({
      ...errorEntry,
      severity: errorEntry.severity || "medium",
      timestamp: new Date().toISOString(),
      resolved: false,
    })
    .select()
    .single();

  if (error) throw error;

  return NextResponse.json({
    success: true,
    data,
    message: "Error entry created successfully",
  });
}

async function createPerformanceEntry(
  supabase: any,
  performanceEntry: PerformanceMetrics
) {
  const { data, error } = await supabase
    .from("workflow_performance_metrics")
    .insert({
      ...performanceEntry,
      timestamp: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return NextResponse.json({
    success: true,
    data,
    message: "Performance metrics created successfully",
  });
}

async function createAlertEntry(supabase: any, alertEntry: AlertEntry) {
  const { data, error } = await supabase
    .from("monitoring_alerts")
    .insert({
      ...alertEntry,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      resolved: false,
    })
    .select()
    .single();

  if (error) throw error;

  return NextResponse.json({
    success: true,
    data,
    message: "Alert created successfully",
  });
}

async function createBatchEntries(supabase: any, batchData: any) {
  const results = {
    logs: [],
    errors: [],
    performance: [],
    alerts: [],
  };

  // Process logs
  if (batchData.logs && Array.isArray(batchData.logs)) {
    const { data: logData, error: logError } = await supabase
      .from("workflow_execution_logs")
      .insert(
        batchData.logs.map((log: any) => ({
          ...log,
          timestamp: log.timestamp || new Date().toISOString(),
        }))
      )
      .select();

    if (!logError) {
      results.logs = logData;
    }
  }

  // Process errors
  if (batchData.errors && Array.isArray(batchData.errors)) {
    const { data: errorData, error: errorError } = await supabase
      .from("workflow_errors")
      .insert(
        batchData.errors.map((error: any) => ({
          ...error,
          severity: error.severity || "medium",
          timestamp: error.timestamp || new Date().toISOString(),
          resolved: false,
        }))
      )
      .select();

    if (!errorError) {
      results.errors = errorData;
    }
  }

  // Process performance metrics
  if (batchData.performance && Array.isArray(batchData.performance)) {
    const { data: perfData, error: perfError } = await supabase
      .from("workflow_performance_metrics")
      .insert(
        batchData.performance.map((perf: any) => ({
          ...perf,
          timestamp: perf.timestamp || new Date().toISOString(),
        }))
      )
      .select();

    if (!perfError) {
      results.performance = perfData;
    }
  }

  // Process alerts
  if (batchData.alerts && Array.isArray(batchData.alerts)) {
    const { data: alertData, error: alertError } = await supabase
      .from("monitoring_alerts")
      .insert(
        batchData.alerts.map((alert: any) => ({
          ...alert,
          timestamp: alert.timestamp || new Date().toISOString(),
          acknowledged: false,
          resolved: false,
        }))
      )
      .select();

    if (!alertError) {
      results.alerts = alertData;
    }
  }

  return NextResponse.json({
    success: true,
    data: results,
    message: "Batch entries created successfully",
  });
}

// Helper functions for PATCH operations

async function updateError(supabase: any, id: string, updates: any) {
  const allowedFields = ["resolved", "resolution_notes", "resolved_by"];
  const filteredUpdates = Object.keys(updates)
    .filter(key => allowedFields.includes(key))
    .reduce((obj: any, key) => {
      obj[key] = updates[key];
      return obj;
    }, {});

  if (filteredUpdates.resolved) {
    filteredUpdates.resolved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("workflow_errors")
    .update(filteredUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return NextResponse.json({
    success: true,
    data,
    message: "Error updated successfully",
  });
}

async function updateAlert(supabase: any, id: string, updates: any) {
  const allowedFields = [
    "acknowledged",
    "acknowledged_by",
    "resolved",
    "resolved_by",
  ];
  const filteredUpdates = Object.keys(updates)
    .filter(key => allowedFields.includes(key))
    .reduce((obj: any, key) => {
      obj[key] = updates[key];
      return obj;
    }, {});

  if (filteredUpdates.acknowledged) {
    filteredUpdates.acknowledged_at = new Date().toISOString();
  }

  if (filteredUpdates.resolved) {
    filteredUpdates.resolved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("monitoring_alerts")
    .update(filteredUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return NextResponse.json({
    success: true,
    data,
    message: "Alert updated successfully",
  });
}
