import { NextRequest, NextResponse } from "next/server";
import {
  ApprovalWorkflowEngine,
  ApprovalWorkflowItem,
  BulkApprovalOperation,
} from "@/lib/approval/workflow-engine";

const workflowEngine = new ApprovalWorkflowEngine();

/**
 * Approval Workflow API Endpoint
 *
 * Handles all approval workflow operations:
 * - Submit content for approval
 * - Process approval decisions
 * - Bulk operations
 * - Emergency bypass
 * - Analytics and reporting
 * - Workflow management
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const workflowItemId = searchParams.get("workflow_item_id");
    const approverId = searchParams.get("approver_id");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const contentType = searchParams.get("content_type");

    switch (action) {
      case "get_pending_approvals":
        // Mock implementation - in real app would query database
        const pendingApprovals: ApprovalWorkflowItem[] = [
          {
            id: "wf-001",
            content_id: "content-001",
            content_type: "blog_post",
            title: "Q4 Marketing Strategy Blog Post",
            content_preview:
              "Our comprehensive guide to Q4 marketing strategies for maximum ROI...",
            workflow_template_id: "template-standard",
            current_level: 1,
            total_levels: 2,
            status: "pending_approval",
            priority: "high",
            submitted_by: "content-team",
            submitted_at: new Date(
              Date.now() - 2 * 60 * 60 * 1000
            ).toISOString(),
            due_date: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
            escalation_date: new Date(
              Date.now() + 6 * 60 * 60 * 1000
            ).toISOString(),
            version: 1,
            locked: true,
            locked_by: "content-team",
            locked_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            approval_history: [
              {
                id: "step-001",
                workflow_item_id: "wf-001",
                level: 1,
                approver_id: "reviewer-1",
                approver_name: "Sarah Johnson",
                approver_role: "content_reviewer",
                status: "pending",
                annotations: [],
                authority_level: 1,
                can_bypass: false,
                escalation_triggered: false,
              },
            ],
            metadata: {
              campaign_id: "camp-q4-2024",
              target_audience: "B2B decision makers",
              publication_date: "2024-07-01",
            },
            tags: ["marketing", "strategy", "q4"],
            compliance_flags: ["brand_review_required"],
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "wf-002",
            content_id: "content-002",
            content_type: "social_media",
            title: "Product Launch Social Media Campaign",
            content_preview:
              "🚀 Exciting news! Our revolutionary new product is launching next week...",
            workflow_template_id: "template-social",
            current_level: 2,
            total_levels: 2,
            status: "pending_approval",
            priority: "urgent",
            submitted_by: "social-team",
            submitted_at: new Date(
              Date.now() - 4 * 60 * 60 * 1000
            ).toISOString(),
            due_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
            escalation_date: new Date(
              Date.now() + 1 * 60 * 60 * 1000
            ).toISOString(),
            version: 2,
            locked: true,
            locked_by: "social-team",
            locked_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            approval_history: [
              {
                id: "step-002",
                workflow_item_id: "wf-002",
                level: 1,
                approver_id: "reviewer-2",
                approver_name: "Mike Chen",
                approver_role: "content_reviewer",
                status: "approved",
                action_date: new Date(
                  Date.now() - 3 * 60 * 60 * 1000
                ).toISOString(),
                feedback: "Content looks good, approved for final review",
                annotations: [],
                authority_level: 1,
                can_bypass: false,
                escalation_triggered: false,
              },
              {
                id: "step-003",
                workflow_item_id: "wf-002",
                level: 2,
                approver_id: "manager-1",
                approver_name: "Lisa Rodriguez",
                approver_role: "marketing_director",
                status: "pending",
                annotations: [
                  {
                    id: "ann-001",
                    step_id: "step-003",
                    x_position: 150,
                    y_position: 200,
                    annotation_text:
                      "Consider removing the rocket emoji for more professional tone",
                    annotation_type: "suggestion",
                    created_by: "manager-1",
                    created_at: new Date(
                      Date.now() - 1 * 60 * 60 * 1000
                    ).toISOString(),
                    resolved: false,
                  },
                ],
                authority_level: 2,
                can_bypass: false,
                escalation_triggered: false,
              },
            ],
            metadata: {
              campaign_id: "camp-product-launch",
              platforms: ["twitter", "linkedin", "facebook"],
              scheduled_time: "2024-06-25T10:00:00Z",
            },
            tags: ["product-launch", "social-media", "urgent"],
            compliance_flags: ["legal_review_pending"],
            created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          },
        ];

        // Filter based on query parameters
        let filteredApprovals = pendingApprovals;

        if (status) {
          filteredApprovals = filteredApprovals.filter(
            item => item.status === status
          );
        }
        if (priority) {
          filteredApprovals = filteredApprovals.filter(
            item => item.priority === priority
          );
        }
        if (contentType) {
          filteredApprovals = filteredApprovals.filter(
            item => item.content_type === contentType
          );
        }
        if (approverId) {
          filteredApprovals = filteredApprovals.filter(item =>
            item.approval_history.some(
              step =>
                step.approver_id === approverId && step.status === "pending"
            )
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            workflow_items: filteredApprovals,
            total_count: filteredApprovals.length,
            pending_count: filteredApprovals.filter(
              item => item.status === "pending_approval"
            ).length,
            overdue_count: filteredApprovals.filter(
              item => item.due_date && new Date(item.due_date) < new Date()
            ).length,
            escalation_count: filteredApprovals.filter(
              item =>
                item.escalation_date &&
                new Date(item.escalation_date) < new Date()
            ).length,
          },
        });

      case "get_workflow_item":
        if (!workflowItemId) {
          return NextResponse.json(
            { success: false, error: "Workflow item ID is required" },
            { status: 400 }
          );
        }

        // Mock workflow item retrieval - recreate pendingApprovals for this case
        const pendingApprovalsForItem: ApprovalWorkflowItem[] = [
          {
            id: "wf-001",
            content_id: "content-001",
            content_type: "blog_post",
            title: "Q4 Marketing Strategy Blog Post",
            content_preview:
              "Our comprehensive guide to Q4 marketing strategies for maximum ROI...",
            workflow_template_id: "template-standard",
            current_level: 1,
            total_levels: 2,
            status: "pending_approval",
            priority: "high",
            submitted_by: "content-team",
            submitted_at: new Date(
              Date.now() - 2 * 60 * 60 * 1000
            ).toISOString(),
            due_date: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
            escalation_date: new Date(
              Date.now() + 6 * 60 * 60 * 1000
            ).toISOString(),
            version: 1,
            locked: true,
            locked_by: "content-team",
            locked_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            approval_history: [
              {
                id: "step-001",
                workflow_item_id: "wf-001",
                level: 1,
                approver_id: "reviewer-1",
                approver_name: "Sarah Johnson",
                approver_role: "content_reviewer",
                status: "pending",
                annotations: [],
                authority_level: 1,
                can_bypass: false,
                escalation_triggered: false,
              },
            ],
            metadata: {
              campaign_id: "camp-q4-2024",
              target_audience: "B2B decision makers",
              publication_date: "2024-07-01",
            },
            tags: ["marketing", "strategy", "q4"],
            compliance_flags: ["brand_review_required"],
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "wf-002",
            content_id: "content-002",
            content_type: "social_media",
            title: "Product Launch Social Media Campaign",
            content_preview:
              "🚀 Exciting news! Our revolutionary new product is launching next week...",
            workflow_template_id: "template-social",
            current_level: 2,
            total_levels: 2,
            status: "pending_approval",
            priority: "urgent",
            submitted_by: "social-team",
            submitted_at: new Date(
              Date.now() - 4 * 60 * 60 * 1000
            ).toISOString(),
            due_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
            escalation_date: new Date(
              Date.now() + 1 * 60 * 60 * 1000
            ).toISOString(),
            version: 2,
            locked: true,
            locked_by: "social-team",
            locked_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            approval_history: [
              {
                id: "step-002",
                workflow_item_id: "wf-002",
                level: 1,
                approver_id: "reviewer-2",
                approver_name: "Mike Chen",
                approver_role: "content_reviewer",
                status: "approved",
                action_date: new Date(
                  Date.now() - 3 * 60 * 60 * 1000
                ).toISOString(),
                feedback: "Content looks good, approved for final review",
                annotations: [],
                authority_level: 1,
                can_bypass: false,
                escalation_triggered: false,
              },
              {
                id: "step-003",
                workflow_item_id: "wf-002",
                level: 2,
                approver_id: "manager-1",
                approver_name: "Lisa Rodriguez",
                approver_role: "marketing_director",
                status: "pending",
                annotations: [
                  {
                    id: "ann-001",
                    step_id: "step-003",
                    x_position: 150,
                    y_position: 200,
                    annotation_text:
                      "Consider removing the rocket emoji for more professional tone",
                    annotation_type: "suggestion",
                    created_by: "manager-1",
                    created_at: new Date(
                      Date.now() - 1 * 60 * 60 * 1000
                    ).toISOString(),
                    resolved: false,
                  },
                ],
                authority_level: 2,
                can_bypass: false,
                escalation_triggered: false,
              },
            ],
            metadata: {
              campaign_id: "camp-product-launch",
              platforms: ["twitter", "linkedin", "facebook"],
              scheduled_time: "2024-06-25T10:00:00Z",
            },
            tags: ["product-launch", "social-media", "urgent"],
            compliance_flags: ["legal_review_pending"],
            created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          },
        ];

        const mockWorkflowItem = pendingApprovalsForItem.find(
          item => item.id === workflowItemId
        );
        if (!mockWorkflowItem) {
          return NextResponse.json(
            { success: false, error: "Workflow item not found" },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: mockWorkflowItem,
        });

      case "get_analytics":
        const analytics = await workflowEngine.getApprovalAnalytics();

        // Mock enhanced analytics data
        const enhancedAnalytics = {
          ...analytics,
          total_submissions: 42,
          pending_approvals: 8,
          approval_rate: 85.2,
          average_approval_time_hours: 18.5,
          escalation_rate: 12.3,
          sla_compliance_rate: 94.1,
          workflow_efficiency_score: 87,
          bottleneck_analysis: [
            {
              level: 1,
              level_name: "Content Review",
              average_time_hours: 8.2,
              pending_count: 5,
              escalation_count: 1,
              efficiency_score: 92,
            },
            {
              level: 2,
              level_name: "Final Approval",
              average_time_hours: 24.8,
              pending_count: 3,
              escalation_count: 2,
              efficiency_score: 78,
            },
          ],
          approver_performance: [
            {
              approver_id: "reviewer-1",
              approver_name: "Sarah Johnson",
              total_assigned: 15,
              total_completed: 14,
              average_response_time_hours: 6.2,
              approval_rate: 89.3,
              quality_score: 95,
              workload_score: 78,
            },
            {
              approver_id: "manager-1",
              approver_name: "Lisa Rodriguez",
              total_assigned: 12,
              total_completed: 10,
              average_response_time_hours: 18.4,
              approval_rate: 75.0,
              quality_score: 88,
              workload_score: 65,
            },
          ],
        };

        return NextResponse.json({
          success: true,
          data: enhancedAnalytics,
        });

      case "get_workflow_templates":
        // Mock workflow templates
        const templates = [
          {
            id: "template-standard",
            name: "Standard Content Approval",
            description:
              "Standard two-level approval process for most content types",
            content_types: ["blog_post", "whitepaper", "case_study"],
            levels: 2,
            sla_hours: 72,
            escalation_hours: 24,
            active: true,
          },
          {
            id: "template-social",
            name: "Social Media Fast Track",
            description:
              "Expedited approval for time-sensitive social media content",
            content_types: ["social_media"],
            levels: 2,
            sla_hours: 24,
            escalation_hours: 6,
            active: true,
          },
          {
            id: "template-legal",
            name: "Legal Compliance Review",
            description: "Enhanced review process with legal compliance checks",
            content_types: ["email_campaign", "landing_page"],
            levels: 3,
            sla_hours: 120,
            escalation_hours: 48,
            active: true,
          },
        ];

        return NextResponse.json({
          success: true,
          data: templates,
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Approval Workflow GET API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case "submit_for_approval":
        const workflowItem = await workflowEngine.submitForApproval(
          data.content_id,
          data.content_type,
          data.submitted_by,
          data.priority || "medium",
          data.metadata || {}
        );

        return NextResponse.json({
          success: true,
          data: workflowItem,
          message: "Content submitted for approval workflow",
        });

      case "process_approval_decision":
        const updatedItem = await workflowEngine.processApprovalDecision(
          data.workflow_item_id,
          data.approver_id,
          data.decision,
          data.feedback,
          data.annotations
        );

        return NextResponse.json({
          success: true,
          data: updatedItem,
          message: `Content ${
            data.decision === "approve"
              ? "approved"
              : data.decision === "reject"
                ? "rejected"
                : "marked for revision"
          } successfully`,
        });

      case "bulk_approve":
        const bulkOperation = await workflowEngine.executeBulkOperation({
          operation_type: "approve",
          item_ids: data.item_ids,
          approver_id: data.approver_id,
          feedback: data.feedback,
          criteria_filter: data.criteria_filter,
        });

        return NextResponse.json({
          success: true,
          data: bulkOperation,
          message: `Bulk approval operation started for ${data.item_ids.length} items`,
        });

      case "bulk_reject":
        const bulkRejectOperation = await workflowEngine.executeBulkOperation({
          operation_type: "reject",
          item_ids: data.item_ids,
          approver_id: data.approver_id,
          feedback: data.feedback,
          criteria_filter: data.criteria_filter,
        });

        return NextResponse.json({
          success: true,
          data: bulkRejectOperation,
          message: `Bulk rejection operation started for ${data.item_ids.length} items`,
        });

      case "emergency_bypass":
        const bypassedItem = await workflowEngine.emergencyBypass(
          data.workflow_item_id,
          data.bypasser_id,
          data.reason
        );

        return NextResponse.json({
          success: true,
          data: bypassedItem,
          message: "Emergency bypass completed successfully",
        });

      case "add_annotation":
        // Mock annotation addition
        const annotation = {
          id: `ann-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          step_id: data.step_id,
          x_position: data.x_position,
          y_position: data.y_position,
          annotation_text: data.annotation_text,
          annotation_type: data.annotation_type,
          created_by: data.created_by,
          created_at: new Date().toISOString(),
          resolved: false,
        };

        return NextResponse.json({
          success: true,
          data: annotation,
          message: "Annotation added successfully",
        });

      case "resolve_annotation":
        // Mock annotation resolution
        return NextResponse.json({
          success: true,
          data: {
            annotation_id: data.annotation_id,
            resolved: true,
            resolved_by: data.resolved_by,
            resolved_at: new Date().toISOString(),
          },
          message: "Annotation resolved successfully",
        });

      case "lock_content":
        // Mock content locking
        return NextResponse.json({
          success: true,
          data: {
            workflow_item_id: data.workflow_item_id,
            locked: true,
            locked_by: data.locked_by,
            locked_at: new Date().toISOString(),
          },
          message: "Content locked for review",
        });

      case "unlock_content":
        // Mock content unlocking
        return NextResponse.json({
          success: true,
          data: {
            workflow_item_id: data.workflow_item_id,
            locked: false,
            locked_by: null,
            locked_at: null,
          },
          message: "Content unlocked",
        });

      case "escalate_workflow":
        // Mock workflow escalation
        return NextResponse.json({
          success: true,
          data: {
            workflow_item_id: data.workflow_item_id,
            status: "escalated",
            escalated_to: data.escalate_to_roles,
            escalated_by: data.escalated_by,
            escalated_at: new Date().toISOString(),
            reason: data.reason,
          },
          message: "Workflow escalated successfully",
        });

      case "get_approval_history":
        // Mock approval history retrieval
        return NextResponse.json({
          success: true,
          data: {
            workflow_item_id: data.workflow_item_id,
            history: [
              {
                timestamp: new Date(
                  Date.now() - 24 * 60 * 60 * 1000
                ).toISOString(),
                action: "submitted",
                user: "Content Team",
                details: "Content submitted for approval workflow",
              },
              {
                timestamp: new Date(
                  Date.now() - 20 * 60 * 60 * 1000
                ).toISOString(),
                action: "assigned",
                user: "System",
                details: "Assigned to Sarah Johnson for content review",
              },
              {
                timestamp: new Date(
                  Date.now() - 18 * 60 * 60 * 1000
                ).toISOString(),
                action: "annotation_added",
                user: "Sarah Johnson",
                details: "Added comment about brand voice consistency",
              },
              {
                timestamp: new Date(
                  Date.now() - 16 * 60 * 60 * 1000
                ).toISOString(),
                action: "approved",
                user: "Sarah Johnson",
                details:
                  "Level 1 approval completed - content approved for final review",
              },
            ],
          },
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Approval Workflow POST API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
