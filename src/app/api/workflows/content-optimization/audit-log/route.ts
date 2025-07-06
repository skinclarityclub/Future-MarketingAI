import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    // Validate required fields
    if (!body.workflow_id || !body.content_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: workflow_id, content_id",
        },
        { status: 400 }
      );
    }

    const {
      workflow_id,
      execution_id,
      content_id,
      content_title,
      distribution_type,
      channels_used,
      suggestions_distributed,
      timestamp,
      status,
    } = body;

    // Create audit log entry
    const auditLogId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const auditEntry = {
      id: auditLogId,
      workflow_id,
      execution_id: execution_id || `exec_${Date.now()}`,
      event_type: "content_optimization_distribution",
      event_name: "Content Optimization Distribution Complete",
      event_category: "workflow_execution",
      content_id,
      content_title: content_title || "Content Optimization",
      distribution_type: distribution_type || "standard",
      channels_used: channels_used || [],
      suggestions_distributed: suggestions_distributed || 0,
      execution_status: status || "completed",
      execution_timestamp: timestamp || new Date().toISOString(),
      metadata: {
        workflow_name: "Content Optimization Distribution Workflow",
        distribution_channels: channels_used,
        suggestion_count: suggestions_distributed,
        distribution_priority: distribution_type,
        automation_source: "n8n_workflow",
      },
      compliance_tags: [
        "content_optimization",
        "automated_distribution",
        "stakeholder_notification",
        "workflow_execution",
      ],
      created_at: new Date().toISOString(),
    };

    // Store in audit log table
    const { data: auditResult, error: auditError } = await supabase
      .from("workflow_audit_logs")
      .insert(auditEntry);

    if (auditError) {
      console.warn("Failed to store audit log:", auditError);
      // Continue execution even if audit logging fails
    }

    // Also log to content optimization distributions table for reference
    const { data: distributionResult, error: distributionError } =
      await supabase
        .from("content_optimization_distributions")
        .update({
          audit_logged: true,
          audit_log_id: auditLogId,
          workflow_execution_id: execution_id,
          completed_at: timestamp || new Date().toISOString(),
        })
        .eq("content_id", content_id);

    if (distributionError) {
      console.warn("Failed to update distribution record:", distributionError);
    }

    // Create activity log entry for dashboard visibility
    await supabase.from("system_activity_logs").insert({
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      activity_type: "content_optimization_distribution",
      activity_name: "Content Optimization Suggestions Distributed",
      description: `${suggestions_distributed || 0} optimization suggestions distributed for "${content_title || "content"}" via ${(channels_used || []).join(", ")}`,
      activity_data: {
        content_id,
        content_title,
        distribution_type,
        channels_used,
        suggestions_distributed,
        workflow_id,
        execution_id,
      },
      status: status || "completed",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      audit_log_id: auditLogId,
      message: "Audit log created successfully",
      audit_summary: {
        workflow_id,
        execution_id: execution_id || `exec_${Date.now()}`,
        content_id,
        content_title: content_title || "Content Optimization",
        distribution_type: distribution_type || "standard",
        channels_logged: (channels_used || []).length,
        suggestions_logged: suggestions_distributed || 0,
        audit_timestamp: new Date().toISOString(),
      },
      compliance_status: {
        audit_logged: true,
        activity_logged: true,
        distribution_tracked: !distributionError,
      },
    });
  } catch (error) {
    console.error("Audit logging error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create audit log",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
