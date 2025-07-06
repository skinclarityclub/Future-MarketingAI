import { createBrowserClient } from "@supabase/ssr";

// Enhanced approval workflow interfaces
export interface ApprovalWorkflowItem {
  id: string;
  content_id: string;
  content_type:
    | "blog_post"
    | "social_media"
    | "email_campaign"
    | "video"
    | "creative"
    | "copy"
    | "landing_page"
    | "whitepaper";
  title: string;
  content_preview: string;
  workflow_template_id: string;
  current_level: number;
  total_levels: number;
  status:
    | "pending_submission"
    | "submitted"
    | "in_review"
    | "pending_approval"
    | "approved"
    | "rejected"
    | "needs_revision"
    | "escalated"
    | "emergency_bypass"
    | "cancelled";
  priority: "low" | "medium" | "high" | "urgent" | "emergency";
  submitted_by: string;
  submitted_at: string;
  due_date?: string;
  escalation_date?: string;
  completed_at?: string;
  version: number;
  locked: boolean;
  locked_by?: string;
  locked_at?: string;
  approval_history: ApprovalStep[];
  metadata: Record<string, any>;
  tags: string[];
  compliance_flags: string[];
  created_at: string;
  updated_at: string;
}

export interface ApprovalStep {
  id: string;
  workflow_item_id: string;
  level: number;
  approver_id: string;
  approver_name: string;
  approver_role: string;
  status: "pending" | "approved" | "rejected" | "skipped" | "escalated";
  action_date?: string;
  feedback?: string;
  decision_reason?: string;
  time_spent_minutes?: number;
  annotations: ApprovalAnnotation[];
  authority_level: number;
  can_bypass: boolean;
  escalation_triggered: boolean;
}

export interface ApprovalAnnotation {
  id: string;
  step_id: string;
  x_position: number;
  y_position: number;
  annotation_text: string;
  annotation_type:
    | "comment"
    | "suggestion"
    | "correction"
    | "approval"
    | "rejection";
  created_by: string;
  created_at: string;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  content_types: string[];
  levels: ApprovalLevel[];
  rules: WorkflowRule[];
  sla_hours: number;
  escalation_hours: number;
  emergency_bypass_roles: string[];
  compliance_requirements: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApprovalLevel {
  level: number;
  name: string;
  description: string;
  required_roles: string[];
  min_approvers: number;
  max_approvers: number;
  authority_required: number;
  can_parallel_review: boolean;
  auto_advance_conditions?: string[];
  escalation_rules: EscalationRule[];
}

export interface EscalationRule {
  trigger_after_hours: number;
  escalate_to_roles: string[];
  notification_template: string;
  auto_approve_conditions?: string[];
}

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  rule_type:
    | "validation"
    | "routing"
    | "approval"
    | "escalation"
    | "notification";
  conditions: Record<string, any>;
  actions: Record<string, any>;
  priority: number;
  active: boolean;
}

export interface BulkApprovalOperation {
  id: string;
  operation_type: "approve" | "reject" | "request_revision";
  item_ids: string[];
  approver_id: string;
  feedback?: string;
  criteria_filter?: Record<string, any>;
  processed_count: number;
  failed_count: number;
  status: "pending" | "processing" | "completed" | "failed";
  started_at: string;
  completed_at?: string;
  results: BulkOperationResult[];
}

export interface BulkOperationResult {
  item_id: string;
  success: boolean;
  error_message?: string;
  previous_status: string;
  new_status: string;
}

export interface ApprovalAnalytics {
  total_submissions: number;
  pending_approvals: number;
  approval_rate: number;
  average_approval_time_hours: number;
  bottleneck_analysis: BottleneckMetric[];
  approver_performance: ApproverMetric[];
  escalation_rate: number;
  sla_compliance_rate: number;
  workflow_efficiency_score: number;
}

export interface BottleneckMetric {
  level: number;
  level_name: string;
  average_time_hours: number;
  pending_count: number;
  escalation_count: number;
  efficiency_score: number;
}

export interface ApproverMetric {
  approver_id: string;
  approver_name: string;
  total_assigned: number;
  total_completed: number;
  average_response_time_hours: number;
  approval_rate: number;
  quality_score: number;
  workload_score: number;
}

/**
 * Enterprise Approval Workflow Engine
 * Handles multi-level content approval with role-based permissions,
 * automated routing, deadline tracking, and comprehensive analytics
 */
export class ApprovalWorkflowEngine {
  private supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  /**
   * Submit content for approval workflow
   */
  async submitForApproval(
    contentId: string,
    contentType: string,
    submittedBy: string,
    priority: ApprovalWorkflowItem["priority"] = "medium",
    metadata: Record<string, any> = {}
  ): Promise<ApprovalWorkflowItem> {
    try {
      // Get appropriate workflow template
      const template = await this.selectWorkflowTemplate(contentType, priority);

      // Create workflow item
      const workflowItem: ApprovalWorkflowItem = {
        id: `wf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content_id: contentId,
        content_type: contentType as any,
        title: metadata.title || `${contentType} Content`,
        content_preview: metadata.preview || "",
        workflow_template_id: template.id,
        current_level: 1,
        total_levels: template.levels.length,
        status: "submitted",
        priority,
        submitted_by: submittedBy,
        submitted_at: new Date().toISOString(),
        due_date: this.calculateDueDate(template.sla_hours),
        escalation_date: this.calculateEscalationDate(
          template.escalation_hours
        ),
        version: 1,
        locked: false,
        approval_history: [],
        metadata,
        tags: metadata.tags || [],
        compliance_flags: await this.checkComplianceFlags(
          contentId,
          contentType
        ),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Assign initial approvers
      await this.assignApprovers(workflowItem, template);

      // Lock content for review
      await this.lockContent(workflowItem.id, submittedBy);

      // Trigger notifications
      await this.sendNotifications(workflowItem, "submitted");

      return workflowItem;
    } catch (error) {
      console.error("Error submitting for approval:", error);
      throw new Error(`Failed to submit content for approval: ${error}`);
    }
  }

  /**
   * Process approval decision
   */
  async processApprovalDecision(
    workflowItemId: string,
    approverId: string,
    decision: "approve" | "reject" | "request_revision",
    feedback?: string,
    annotations?: ApprovalAnnotation[]
  ): Promise<ApprovalWorkflowItem> {
    try {
      const workflowItem = await this.getWorkflowItem(workflowItemId);
      const template = await this.getWorkflowTemplate(
        workflowItem.workflow_template_id
      );

      // Validate approver authority
      await this.validateApproverAuthority(workflowItem, approverId);

      // Create approval step
      const approvalStep: ApprovalStep = {
        id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        workflow_item_id: workflowItemId,
        level: workflowItem.current_level,
        approver_id: approverId,
        approver_name: await this.getApproverName(approverId),
        approver_role: await this.getApproverRole(approverId),
        status:
          decision === "approve"
            ? "approved"
            : decision === "reject"
              ? "rejected"
              : "pending",
        action_date: new Date().toISOString(),
        feedback,
        annotations: annotations || [],
        authority_level: await this.getApproverAuthority(approverId),
        can_bypass: await this.canBypassApproval(approverId),
        escalation_triggered: false,
      };

      // Add step to history
      workflowItem.approval_history.push(approvalStep);

      // Process decision
      switch (decision) {
        case "approve":
          await this.processApproval(workflowItem, template);
          break;
        case "reject":
          await this.processRejection(workflowItem);
          break;
        case "request_revision":
          await this.processRevisionRequest(workflowItem);
          break;
      }

      // Update workflow item
      workflowItem.updated_at = new Date().toISOString();

      // Send notifications
      await this.sendNotifications(workflowItem, decision);

      return workflowItem;
    } catch (error) {
      console.error("Error processing approval decision:", error);
      throw new Error(`Failed to process approval decision: ${error}`);
    }
  }

  /**
   * Bulk approval operations
   */
  async executeBulkOperation(
    operation: Omit<
      BulkApprovalOperation,
      | "id"
      | "status"
      | "started_at"
      | "results"
      | "processed_count"
      | "failed_count"
    >
  ): Promise<BulkApprovalOperation> {
    const bulkOp: BulkApprovalOperation = {
      ...operation,
      id: `bulk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: "processing",
      started_at: new Date().toISOString(),
      processed_count: 0,
      failed_count: 0,
      results: [],
    };

    try {
      for (const itemId of operation.item_ids) {
        try {
          const workflowItem = await this.getWorkflowItem(itemId);
          const previousStatus = workflowItem.status;

          await this.processApprovalDecision(
            itemId,
            operation.approver_id,
            operation.operation_type,
            operation.feedback
          );

          bulkOp.results.push({
            item_id: itemId,
            success: true,
            previous_status: previousStatus,
            new_status:
              operation.operation_type === "approve"
                ? "approved"
                : operation.operation_type === "reject"
                  ? "rejected"
                  : "needs_revision",
          });
          bulkOp.processed_count++;
        } catch (error) {
          bulkOp.results.push({
            item_id: itemId,
            success: false,
            error_message:
              error instanceof Error ? error.message : "Unknown error",
            previous_status: "unknown",
            new_status: "error",
          });
          bulkOp.failed_count++;
        }
      }

      bulkOp.status = "completed";
      bulkOp.completed_at = new Date().toISOString();

      return bulkOp;
    } catch (error) {
      bulkOp.status = "failed";
      bulkOp.completed_at = new Date().toISOString();
      throw error;
    }
  }

  /**
   * Emergency bypass approval
   */
  async emergencyBypass(
    workflowItemId: string,
    bypasserId: string,
    reason: string
  ): Promise<ApprovalWorkflowItem> {
    try {
      const workflowItem = await this.getWorkflowItem(workflowItemId);

      // Validate emergency bypass authority
      const canBypass = await this.canEmergencyBypass(bypasserId, workflowItem);
      if (!canBypass) {
        throw new Error("Insufficient authority for emergency bypass");
      }

      // Create bypass step
      const bypassStep: ApprovalStep = {
        id: `bypass-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        workflow_item_id: workflowItemId,
        level: workflowItem.current_level,
        approver_id: bypasserId,
        approver_name: await this.getApproverName(bypasserId),
        approver_role: await this.getApproverRole(bypasserId),
        status: "approved",
        action_date: new Date().toISOString(),
        feedback: `EMERGENCY BYPASS: ${reason}`,
        decision_reason: "emergency_bypass",
        annotations: [],
        authority_level: 999, // Emergency bypass authority
        can_bypass: true,
        escalation_triggered: false,
      };

      workflowItem.approval_history.push(bypassStep);
      workflowItem.status = "emergency_bypass";
      workflowItem.updated_at = new Date().toISOString();

      // Unlock content
      await this.unlockContent(workflowItemId);

      // Create audit log
      await this.createAuditLog(
        workflowItemId,
        "emergency_bypass",
        bypasserId,
        reason
      );

      // Send emergency notifications
      await this.sendEmergencyBypassNotifications(
        workflowItem,
        bypasserId,
        reason
      );

      return workflowItem;
    } catch (error) {
      console.error("Error processing emergency bypass:", error);
      throw new Error(`Failed to process emergency bypass: ${error}`);
    }
  }

  /**
   * Get approval analytics
   */
  async getApprovalAnalytics(
    dateRange?: { start: string; end: string },
    filters?: Record<string, any>
  ): Promise<ApprovalAnalytics> {
    try {
      // This would typically query a database
      // For now, returning mock analytics structure
      return {
        total_submissions: 0,
        pending_approvals: 0,
        approval_rate: 0,
        average_approval_time_hours: 0,
        bottleneck_analysis: [],
        approver_performance: [],
        escalation_rate: 0,
        sla_compliance_rate: 0,
        workflow_efficiency_score: 0,
      };
    } catch (error) {
      console.error("Error getting approval analytics:", error);
      throw new Error(`Failed to get approval analytics: ${error}`);
    }
  }

  // Private helper methods
  private async selectWorkflowTemplate(
    contentType: string,
    priority: string
  ): Promise<WorkflowTemplate> {
    // Mock template selection logic
    return {
      id: "template-standard",
      name: "Standard Content Approval",
      description: "Standard multi-level content approval workflow",
      content_types: [contentType],
      levels: [
        {
          level: 1,
          name: "Content Review",
          description: "Initial content review and validation",
          required_roles: ["content_reviewer"],
          min_approvers: 1,
          max_approvers: 1,
          authority_required: 1,
          can_parallel_review: false,
          escalation_rules: [
            {
              trigger_after_hours: 24,
              escalate_to_roles: ["content_manager"],
              notification_template: "escalation_level_1",
            },
          ],
        },
        {
          level: 2,
          name: "Final Approval",
          description: "Final approval for publication",
          required_roles: ["content_manager", "marketing_director"],
          min_approvers: 1,
          max_approvers: 2,
          authority_required: 2,
          can_parallel_review: true,
          escalation_rules: [
            {
              trigger_after_hours: 48,
              escalate_to_roles: ["executive_team"],
              notification_template: "escalation_level_2",
            },
          ],
        },
      ],
      rules: [],
      sla_hours: 72,
      escalation_hours: 24,
      emergency_bypass_roles: ["ceo", "cto", "marketing_director"],
      compliance_requirements: ["legal_review", "brand_compliance"],
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  private calculateDueDate(slaHours: number): string {
    return new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();
  }

  private calculateEscalationDate(escalationHours: number): string {
    return new Date(
      Date.now() + escalationHours * 60 * 60 * 1000
    ).toISOString();
  }

  private async checkComplianceFlags(
    contentId: string,
    contentType: string
  ): Promise<string[]> {
    // Mock compliance check
    return ["brand_review_required"];
  }

  private async assignApprovers(
    item: ApprovalWorkflowItem,
    template: WorkflowTemplate
  ): Promise<void> {
    // Mock approver assignment logic
    console.log("Assigning approvers for workflow item:", item.id);
  }

  private async lockContent(
    workflowItemId: string,
    lockedBy: string
  ): Promise<void> {
    // Mock content locking
    console.log("Locking content for review:", workflowItemId);
  }

  private async unlockContent(workflowItemId: string): Promise<void> {
    // Mock content unlocking
    console.log("Unlocking content:", workflowItemId);
  }

  private async sendNotifications(
    item: ApprovalWorkflowItem,
    action: string
  ): Promise<void> {
    // Mock notification sending
    console.log("Sending notifications for:", item.id, action);
  }

  private async sendEmergencyBypassNotifications(
    item: ApprovalWorkflowItem,
    bypasserId: string,
    reason: string
  ): Promise<void> {
    // Mock emergency notifications
    console.log("Sending emergency bypass notifications:", item.id);
  }

  private async getWorkflowItem(
    workflowItemId: string
  ): Promise<ApprovalWorkflowItem> {
    // Mock workflow item retrieval
    throw new Error("Mock implementation - workflow item not found");
  }

  private async getWorkflowTemplate(
    templateId: string
  ): Promise<WorkflowTemplate> {
    // Mock template retrieval
    return await this.selectWorkflowTemplate("blog_post", "medium");
  }

  private async validateApproverAuthority(
    item: ApprovalWorkflowItem,
    approverId: string
  ): Promise<void> {
    // Mock authority validation
    console.log("Validating approver authority:", approverId);
  }

  private async getApproverName(approverId: string): Promise<string> {
    return `Approver ${approverId}`;
  }

  private async getApproverRole(approverId: string): Promise<string> {
    return "content_reviewer";
  }

  private async getApproverAuthority(approverId: string): Promise<number> {
    return 1;
  }

  private async canBypassApproval(approverId: string): Promise<boolean> {
    return false;
  }

  private async canEmergencyBypass(
    bypasserId: string,
    item: ApprovalWorkflowItem
  ): Promise<boolean> {
    return true; // Mock implementation
  }

  private async processApproval(
    item: ApprovalWorkflowItem,
    template: WorkflowTemplate
  ): Promise<void> {
    if (item.current_level < item.total_levels) {
      item.current_level++;
      item.status = "pending_approval";
    } else {
      item.status = "approved";
      item.completed_at = new Date().toISOString();
      await this.unlockContent(item.id);
    }
  }

  private async processRejection(item: ApprovalWorkflowItem): Promise<void> {
    item.status = "rejected";
    item.completed_at = new Date().toISOString();
    await this.unlockContent(item.id);
  }

  private async processRevisionRequest(
    item: ApprovalWorkflowItem
  ): Promise<void> {
    item.status = "needs_revision";
    await this.unlockContent(item.id);
  }

  private async createAuditLog(
    workflowItemId: string,
    action: string,
    userId: string,
    details: string
  ): Promise<void> {
    // Mock audit logging
    console.log("Creating audit log:", {
      workflowItemId,
      action,
      userId,
      details,
    });
  }
}
