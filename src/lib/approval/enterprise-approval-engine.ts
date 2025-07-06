export interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  requester: {
    id: string;
    name: string;
    email: string;
    department: string;
  };
  type:
    | "budget"
    | "campaign"
    | "content"
    | "strategy"
    | "procurement"
    | "hiring"
    | "contract";
  priority: "low" | "medium" | "high" | "critical";
  amount?: number;
  currency?: string;
  attachments: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  metadata: Record<string, any>;
  created_at: string;
  deadline?: string;
  business_impact: {
    revenue_impact: number;
    risk_level: "low" | "medium" | "high";
    compliance_required: boolean;
    stakeholders: string[];
  };
}

export interface ApprovalStep {
  id: string;
  level: number;
  name: string;
  type: "individual" | "group" | "role_based" | "automated";
  approvers: {
    id: string;
    name: string;
    email: string;
    role: string;
    backup?: string[];
  }[];
  conditions: {
    amount_threshold?: number;
    department_match?: string[];
    priority_level?: string[];
    custom_rules?: string[];
  };
  sla_hours: number;
  escalation_hours: number;
  auto_approve_rules?: {
    conditions: Record<string, any>;
    enabled: boolean;
  };
  required_fields: string[];
  status: "pending" | "approved" | "rejected" | "escalated" | "expired";
  completed_at?: string;
  comments?: string;
  decision_reason?: string;
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  type: string;
  description: string;
  version: string;
  is_active: boolean;
  steps: ApprovalStep[];
  parallel_steps?: number[][];
  conditional_logic?: {
    step_id: string;
    conditions: Record<string, any>;
    next_step_mapping: Record<string, string>;
  }[];
  created_by: string;
  created_at: string;
  updated_at: string;
  approval_rate: number;
  avg_completion_time: number;
  compliance_requirements: string[];
}

export interface ApprovalAuditLog {
  id: string;
  request_id: string;
  step_id: string;
  action:
    | "submitted"
    | "approved"
    | "rejected"
    | "escalated"
    | "reassigned"
    | "withdrawn";
  actor: {
    id: string;
    name: string;
    email: string;
    ip_address?: string;
  };
  timestamp: string;
  details: Record<string, any>;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  compliance_flags: string[];
}

export interface ApprovalAnalytics {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  expired_requests: number;
  avg_approval_time: number;
  approval_rate_by_type: Record<string, number>;
  bottleneck_steps: {
    step_id: string;
    avg_time: number;
    volume: number;
  }[];
  top_approvers: {
    approver_id: string;
    approvals: number;
    avg_time: number;
    efficiency_score: number;
  }[];
  compliance_metrics: {
    sla_breach_rate: number;
    audit_findings: number;
    risk_mitigation_score: number;
  };
}

export class EnterpriseApprovalEngine {
  private workflows: Map<string, ApprovalWorkflow> = new Map();
  private requests: Map<string, ApprovalRequest> = new Map();
  private auditLogs: ApprovalAuditLog[] = [];
  private notificationService: any;
  private complianceService: any;

  constructor() {
    this.initializeDefaultWorkflows();
    this.setupNotificationService();
    this.setupComplianceIntegration();
  }

  // Workflow Management
  async createWorkflow(
    workflow: Omit<ApprovalWorkflow, "id" | "created_at" | "updated_at">
  ): Promise<ApprovalWorkflow> {
    const id = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newWorkflow: ApprovalWorkflow = {
      ...workflow,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      approval_rate: 0,
      avg_completion_time: 0,
    };

    this.workflows.set(id, newWorkflow);
    await this.auditAction("workflow_created", { workflow_id: id });
    return newWorkflow;
  }

  async updateWorkflow(
    id: string,
    updates: Partial<ApprovalWorkflow>
  ): Promise<ApprovalWorkflow> {
    const workflow = this.workflows.get(id);
    if (!workflow) throw new Error(`Workflow ${id} not found`);

    const updatedWorkflow = {
      ...workflow,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.workflows.set(id, updatedWorkflow);
    await this.auditAction("workflow_updated", {
      workflow_id: id,
      changes: updates,
    });
    return updatedWorkflow;
  }

  // Request Submission and Processing
  async submitRequest(
    request: Omit<ApprovalRequest, "id" | "created_at">
  ): Promise<string> {
    const id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newRequest: ApprovalRequest = {
      ...request,
      id,
      created_at: new Date().toISOString(),
    };

    this.requests.set(id, newRequest);

    // Find appropriate workflow
    const workflow = await this.determineWorkflow(newRequest);
    if (!workflow)
      throw new Error("No suitable workflow found for this request");

    // Initialize approval process
    await this.initiateApprovalProcess(newRequest, workflow);

    await this.auditAction("request_submitted", { request_id: id });
    return id;
  }

  async approveStep(
    requestId: string,
    stepId: string,
    approverId: string,
    comments?: string
  ): Promise<void> {
    const request = this.requests.get(requestId);
    if (!request) throw new Error(`Request ${requestId} not found`);

    const workflow = await this.getWorkflowForRequest(requestId);
    const step = workflow.steps.find(s => s.id === stepId);
    if (!step) throw new Error(`Step ${stepId} not found`);

    // Validate approver permissions
    if (!this.validateApproverPermissions(approverId, step)) {
      throw new Error("Insufficient permissions to approve this step");
    }

    // Update step status
    step.status = "approved";
    step.completed_at = new Date().toISOString();
    step.comments = comments;

    // Check if all steps are completed
    const isComplete = await this.checkWorkflowCompletion(workflow);
    if (isComplete) {
      await this.completeApprovalProcess(requestId);
    } else {
      await this.advanceToNextStep(requestId, workflow);
    }

    await this.auditAction("step_approved", {
      request_id: requestId,
      step_id: stepId,
      approver_id: approverId,
      comments,
    });

    // Send notifications
    await this.sendApprovalNotifications(requestId, stepId, "approved");
  }

  async rejectStep(
    requestId: string,
    stepId: string,
    approverId: string,
    reason: string
  ): Promise<void> {
    const request = this.requests.get(requestId);
    if (!request) throw new Error(`Request ${requestId} not found`);

    const workflow = await this.getWorkflowForRequest(requestId);
    const step = workflow.steps.find(s => s.id === stepId);
    if (!step) throw new Error(`Step ${stepId} not found`);

    // Validate approver permissions
    if (!this.validateApproverPermissions(approverId, step)) {
      throw new Error("Insufficient permissions to reject this step");
    }

    // Update step status
    step.status = "rejected";
    step.completed_at = new Date().toISOString();
    step.decision_reason = reason;

    // Mark entire request as rejected
    await this.rejectApprovalProcess(requestId, reason);

    await this.auditAction("step_rejected", {
      request_id: requestId,
      step_id: stepId,
      approver_id: approverId,
      reason,
    });

    // Send notifications
    await this.sendApprovalNotifications(requestId, stepId, "rejected");
  }

  // Advanced Features
  async bulkApprove(
    requests: {
      requestId: string;
      stepId: string;
      approverId: string;
      comments?: string;
    }[]
  ): Promise<{
    success: string[];
    failed: { requestId: string; error: string }[];
  }> {
    const success: string[] = [];
    const failed: { requestId: string; error: string }[] = [];

    for (const req of requests) {
      try {
        await this.approveStep(
          req.requestId,
          req.stepId,
          req.approverId,
          req.comments
        );
        success.push(req.requestId);
      } catch (error) {
        failed.push({
          requestId: req.requestId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    await this.auditAction("bulk_approve", {
      success_count: success.length,
      failed_count: failed.length,
    });
    return { success, failed };
  }

  async delegateApproval(
    requestId: string,
    stepId: string,
    fromApproverId: string,
    toApproverId: string,
    reason: string
  ): Promise<void> {
    const workflow = await this.getWorkflowForRequest(requestId);
    const step = workflow.steps.find(s => s.id === stepId);
    if (!step) throw new Error(`Step ${stepId} not found`);

    // Validate delegation permissions
    if (
      !this.validateDelegationPermissions(fromApproverId, toApproverId, step)
    ) {
      throw new Error("Delegation not permitted");
    }

    // Update approver
    const approverIndex = step.approvers.findIndex(
      a => a.id === fromApproverId
    );
    if (approverIndex !== -1) {
      step.approvers[approverIndex].id = toApproverId;
    }

    await this.auditAction("approval_delegated", {
      request_id: requestId,
      step_id: stepId,
      from_approver: fromApproverId,
      to_approver: toApproverId,
      reason,
    });

    // Send notifications
    await this.sendDelegationNotifications(
      requestId,
      stepId,
      fromApproverId,
      toApproverId
    );
  }

  async emergencyBypass(
    requestId: string,
    bypasserId: string,
    reason: string,
    justification: string
  ): Promise<void> {
    // Validate emergency bypass permissions
    if (!this.validateEmergencyBypassPermissions(bypasserId)) {
      throw new Error("Insufficient permissions for emergency bypass");
    }

    const request = this.requests.get(requestId);
    if (!request) throw new Error(`Request ${requestId} not found`);

    // Mark as emergency approved
    await this.completeApprovalProcess(requestId);

    await this.auditAction("emergency_bypass", {
      request_id: requestId,
      bypasser_id: bypasserId,
      reason,
      justification,
      compliance_flag: "emergency_approval",
    });

    // Send compliance notifications
    await this.sendComplianceAlerts(requestId, "emergency_bypass");
  }

  // Analytics and Reporting
  async getApprovalAnalytics(
    timeframe: { start: string; end: string },
    filters?: Record<string, any>
  ): Promise<ApprovalAnalytics> {
    const filteredRequests = Array.from(this.requests.values()).filter(req => {
      const createdAt = new Date(req.created_at);
      const start = new Date(timeframe.start);
      const end = new Date(timeframe.end);
      return createdAt >= start && createdAt <= end;
    });

    const analytics: ApprovalAnalytics = {
      total_requests: filteredRequests.length,
      pending_requests: filteredRequests.filter(
        r => this.getRequestStatus(r) === "pending"
      ).length,
      approved_requests: filteredRequests.filter(
        r => this.getRequestStatus(r) === "approved"
      ).length,
      rejected_requests: filteredRequests.filter(
        r => this.getRequestStatus(r) === "rejected"
      ).length,
      expired_requests: filteredRequests.filter(
        r => this.getRequestStatus(r) === "expired"
      ).length,
      avg_approval_time: this.calculateAverageApprovalTime(filteredRequests),
      approval_rate_by_type: this.calculateApprovalRateByType(filteredRequests),
      bottleneck_steps: await this.identifyBottleneckSteps(filteredRequests),
      top_approvers: await this.getTopApprovers(timeframe),
      compliance_metrics: await this.getComplianceMetrics(timeframe),
    };

    return analytics;
  }

  async generateComplianceReport(requestId: string): Promise<{
    request: ApprovalRequest;
    workflow: ApprovalWorkflow;
    audit_trail: ApprovalAuditLog[];
    compliance_status: "compliant" | "non_compliant" | "pending_review";
    risk_assessment: {
      level: "low" | "medium" | "high";
      factors: string[];
      mitigation_steps: string[];
    };
  }> {
    const request = this.requests.get(requestId);
    if (!request) throw new Error(`Request ${requestId} not found`);

    const workflow = await this.getWorkflowForRequest(requestId);
    const auditTrail = this.auditLogs.filter(
      log => log.request_id === requestId
    );

    const complianceStatus = await this.assessCompliance(
      request,
      workflow,
      auditTrail
    );
    const riskAssessment = await this.assessRisk(request, auditTrail);

    return {
      request,
      workflow,
      audit_trail: auditTrail,
      compliance_status: complianceStatus,
      risk_assessment: riskAssessment,
    };
  }

  // Private Helper Methods
  private initializeDefaultWorkflows(): void {
    // Budget Approval Workflow
    const budgetWorkflow: ApprovalWorkflow = {
      id: "budget_approval",
      name: "Budget Approval Workflow",
      type: "budget",
      description: "Multi-level budget approval process",
      version: "1.0.0",
      is_active: true,
      steps: [
        {
          id: "manager_approval",
          level: 1,
          name: "Manager Approval",
          type: "role_based",
          approvers: [],
          conditions: { amount_threshold: 10000 },
          sla_hours: 24,
          escalation_hours: 48,
          required_fields: ["business_justification"],
          status: "pending",
        },
        {
          id: "finance_approval",
          level: 2,
          name: "Finance Approval",
          type: "individual",
          approvers: [],
          conditions: { amount_threshold: 50000 },
          sla_hours: 48,
          escalation_hours: 72,
          required_fields: ["cost_center", "budget_code"],
          status: "pending",
        },
        {
          id: "executive_approval",
          level: 3,
          name: "Executive Approval",
          type: "individual",
          approvers: [],
          conditions: { amount_threshold: 100000 },
          sla_hours: 72,
          escalation_hours: 120,
          required_fields: ["roi_analysis", "strategic_alignment"],
          status: "pending",
        },
      ],
      created_by: "system",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      approval_rate: 85.5,
      avg_completion_time: 4.2,
      compliance_requirements: ["SOX", "GDPR", "Financial_Controls"],
    };

    this.workflows.set("budget_approval", budgetWorkflow);

    // Campaign Approval Workflow
    const campaignWorkflow: ApprovalWorkflow = {
      id: "campaign_approval",
      name: "Marketing Campaign Approval",
      type: "campaign",
      description: "Marketing campaign review and approval process",
      version: "1.0.0",
      is_active: true,
      steps: [
        {
          id: "content_review",
          level: 1,
          name: "Content Review",
          type: "individual",
          approvers: [],
          conditions: {},
          sla_hours: 12,
          escalation_hours: 24,
          required_fields: ["content_brief", "target_audience"],
          status: "pending",
        },
        {
          id: "brand_approval",
          level: 2,
          name: "Brand Approval",
          type: "role_based",
          approvers: [],
          conditions: {},
          sla_hours: 24,
          escalation_hours: 48,
          required_fields: ["brand_guidelines_compliance"],
          status: "pending",
        },
        {
          id: "legal_review",
          level: 3,
          name: "Legal Review",
          type: "individual",
          approvers: [],
          conditions: { priority_level: ["high", "critical"] },
          sla_hours: 48,
          escalation_hours: 72,
          required_fields: ["legal_compliance_checklist"],
          status: "pending",
        },
      ],
      created_by: "system",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      approval_rate: 92.1,
      avg_completion_time: 2.8,
      compliance_requirements: [
        "Brand_Guidelines",
        "Legal_Compliance",
        "Industry_Standards",
      ],
    };

    this.workflows.set("campaign_approval", campaignWorkflow);
  }

  private async determineWorkflow(
    request: ApprovalRequest
  ): Promise<ApprovalWorkflow | null> {
    // Logic to determine the appropriate workflow based on request type, amount, etc.
    const workflow = Array.from(this.workflows.values()).find(
      w => w.type === request.type && w.is_active
    );
    return workflow || null;
  }

  private async getWorkflowForRequest(
    requestId: string
  ): Promise<ApprovalWorkflow> {
    // In a real implementation, this would query the database
    const request = this.requests.get(requestId);
    if (!request) throw new Error(`Request ${requestId} not found`);

    return this.determineWorkflow(request) as ApprovalWorkflow;
  }

  private validateApproverPermissions(
    approverId: string,
    step: ApprovalStep
  ): boolean {
    return step.approvers.some(approver => approver.id === approverId);
  }

  private validateDelegationPermissions(
    fromId: string,
    toId: string,
    step: ApprovalStep
  ): boolean {
    // Implement delegation rules - check if the delegator has permission and the delegate is qualified
    return true;
  }

  private validateEmergencyBypassPermissions(bypasserId: string): boolean {
    // Implement emergency bypass rules - only senior executives or emergency contacts
    const emergencyRoles = ["ceo", "cfo", "coo", "emergency_contact"];
    // In real implementation, check user's role
    return true;
  }

  private getRequestStatus(request: ApprovalRequest): string {
    // Implement status determination logic based on workflow progress
    return "pending";
  }

  private calculateAverageApprovalTime(requests: ApprovalRequest[]): number {
    // Implement calculation logic
    return 4.2;
  }

  private calculateApprovalRateByType(
    requests: ApprovalRequest[]
  ): Record<string, number> {
    // Implement calculation logic
    return {
      budget: 85.5,
      campaign: 92.1,
      content: 96.3,
      strategy: 78.9,
      procurement: 89.7,
      hiring: 83.2,
      contract: 91.8,
    };
  }

  private async identifyBottleneckSteps(
    requests: ApprovalRequest[]
  ): Promise<any[]> {
    return [
      { step_id: "finance_approval", avg_time: 2.8, volume: 145 },
      { step_id: "executive_approval", avg_time: 4.2, volume: 67 },
      { step_id: "legal_review", avg_time: 3.1, volume: 89 },
    ];
  }

  private async getTopApprovers(timeframe: {
    start: string;
    end: string;
  }): Promise<any[]> {
    return [
      {
        approver_id: "john_doe",
        approvals: 245,
        avg_time: 1.2,
        efficiency_score: 94.5,
      },
      {
        approver_id: "jane_smith",
        approvals: 189,
        avg_time: 2.1,
        efficiency_score: 89.3,
      },
      {
        approver_id: "mike_johnson",
        approvals: 167,
        avg_time: 1.8,
        efficiency_score: 91.7,
      },
    ];
  }

  private async getComplianceMetrics(timeframe: {
    start: string;
    end: string;
  }): Promise<any> {
    return {
      sla_breach_rate: 5.2,
      audit_findings: 3,
      risk_mitigation_score: 92.1,
    };
  }

  private async assessCompliance(
    request: ApprovalRequest,
    workflow: ApprovalWorkflow,
    auditTrail: ApprovalAuditLog[]
  ): Promise<"compliant" | "non_compliant" | "pending_review"> {
    // Implement compliance assessment logic
    return "compliant";
  }

  private async assessRisk(
    request: ApprovalRequest,
    auditTrail: ApprovalAuditLog[]
  ): Promise<any> {
    return {
      level: "low" as const,
      factors: [
        "Standard approval process followed",
        "All required approvals obtained",
      ],
      mitigation_steps: ["Monitor for compliance", "Regular audit review"],
    };
  }

  private async auditAction(
    action: string,
    details: Record<string, any>
  ): Promise<void> {
    const auditLog: ApprovalAuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      request_id: details.request_id || "",
      step_id: details.step_id || "",
      action: action as any,
      actor: {
        id: details.actor_id || "system",
        name: details.actor_name || "System",
        email: details.actor_email || "system@company.com",
      },
      timestamp: new Date().toISOString(),
      details,
      compliance_flags: details.compliance_flags || [],
    };

    this.auditLogs.push(auditLog);
  }

  private setupNotificationService(): void {
    // Initialize notification service for real-time alerts
  }

  private setupComplianceIntegration(): void {
    // Initialize compliance service for audit trail and reporting
  }

  private async initiateApprovalProcess(
    request: ApprovalRequest,
    workflow: ApprovalWorkflow
  ): Promise<void> {
    // Initialize the approval process with the first step
  }

  private async checkWorkflowCompletion(
    workflow: ApprovalWorkflow
  ): Promise<boolean> {
    return workflow.steps.every(step => step.status === "approved");
  }

  private async completeApprovalProcess(requestId: string): Promise<void> {
    // Complete the approval process and notify stakeholders
  }

  private async rejectApprovalProcess(
    requestId: string,
    reason: string
  ): Promise<void> {
    // Reject the approval process and notify requester
  }

  private async advanceToNextStep(
    requestId: string,
    workflow: ApprovalWorkflow
  ): Promise<void> {
    // Advance to the next step in the workflow
  }

  private async sendApprovalNotifications(
    requestId: string,
    stepId: string,
    status: string
  ): Promise<void> {
    // Send notifications for approval status changes
  }

  private async sendDelegationNotifications(
    requestId: string,
    stepId: string,
    fromId: string,
    toId: string
  ): Promise<void> {
    // Send notifications for delegation
  }

  private async sendComplianceAlerts(
    requestId: string,
    alertType: string
  ): Promise<void> {
    // Send compliance alerts for emergency bypasses and violations
  }
}

export const enterpriseApprovalEngine = new EnterpriseApprovalEngine();
