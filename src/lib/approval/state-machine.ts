/**
 * Approval Workflow State Machine
 *
 * Manages state transitions for the approval workflow system
 * Ensures valid state changes and enforces business rules
 */

export type WorkflowState =
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

export type WorkflowAction =
  | "submit"
  | "start_review"
  | "approve"
  | "reject"
  | "request_revision"
  | "escalate"
  | "emergency_bypass"
  | "cancel"
  | "resubmit"
  | "complete_revision";

export interface StateTransition {
  from: WorkflowState;
  to: WorkflowState;
  action: WorkflowAction;
  requiredRole?: string;
  requiredAuthority?: number;
  conditions?: string[];
  sideEffects?: string[];
}

export interface WorkflowContext {
  itemId: string;
  currentLevel: number;
  totalLevels: number;
  approverRole: string;
  approverAuthority: number;
  isOverdue: boolean;
  isEscalated: boolean;
  canBypass: boolean;
  complianceFlags: string[];
  metadata: Record<string, any>;
}

/**
 * Workflow State Machine
 * Manages state transitions and validates business rules
 */
export class WorkflowStateMachine {
  private static readonly VALID_TRANSITIONS: StateTransition[] = [
    // Initial submission
    {
      from: "pending_submission",
      to: "submitted",
      action: "submit",
      sideEffects: ["lock_content", "assign_reviewers", "send_notifications"],
    },

    // Start review process
    {
      from: "submitted",
      to: "in_review",
      action: "start_review",
      requiredRole: "reviewer",
      sideEffects: ["start_review_timer", "notify_approvers"],
    },

    // Review to approval pending
    {
      from: "in_review",
      to: "pending_approval",
      action: "approve",
      requiredRole: "reviewer",
      sideEffects: ["advance_level", "assign_next_approver"],
    },

    // Approval workflows
    {
      from: "pending_approval",
      to: "approved",
      action: "approve",
      requiredRole: "approver",
      requiredAuthority: 1,
      conditions: ["is_final_level"],
      sideEffects: ["unlock_content", "notify_completion", "update_metrics"],
    },

    {
      from: "pending_approval",
      to: "pending_approval",
      action: "approve",
      requiredRole: "approver",
      requiredAuthority: 1,
      conditions: ["not_final_level"],
      sideEffects: ["advance_level", "assign_next_approver", "notify_progress"],
    },

    // Rejection workflows
    {
      from: "pending_approval",
      to: "rejected",
      action: "reject",
      requiredRole: "approver",
      sideEffects: ["unlock_content", "notify_rejection", "create_audit_log"],
    },

    {
      from: "in_review",
      to: "rejected",
      action: "reject",
      requiredRole: "reviewer",
      sideEffects: ["unlock_content", "notify_rejection", "create_audit_log"],
    },

    // Revision workflows
    {
      from: "in_review",
      to: "needs_revision",
      action: "request_revision",
      requiredRole: "reviewer",
      sideEffects: ["unlock_content", "notify_revision_needed", "reset_timer"],
    },

    {
      from: "pending_approval",
      to: "needs_revision",
      action: "request_revision",
      requiredRole: "approver",
      sideEffects: ["unlock_content", "notify_revision_needed", "reset_timer"],
    },

    {
      from: "needs_revision",
      to: "submitted",
      action: "resubmit",
      sideEffects: ["lock_content", "increment_version", "restart_workflow"],
    },

    // Escalation workflows
    {
      from: "pending_approval",
      to: "escalated",
      action: "escalate",
      conditions: ["is_overdue", "escalation_enabled"],
      sideEffects: [
        "notify_escalation",
        "assign_escalation_approvers",
        "update_priority",
      ],
    },

    {
      from: "in_review",
      to: "escalated",
      action: "escalate",
      conditions: ["is_overdue", "escalation_enabled"],
      sideEffects: [
        "notify_escalation",
        "assign_escalation_approvers",
        "update_priority",
      ],
    },

    {
      from: "escalated",
      to: "approved",
      action: "approve",
      requiredRole: "escalation_approver",
      requiredAuthority: 2,
      sideEffects: [
        "unlock_content",
        "notify_completion",
        "log_escalation_resolution",
      ],
    },

    {
      from: "escalated",
      to: "rejected",
      action: "reject",
      requiredRole: "escalation_approver",
      requiredAuthority: 2,
      sideEffects: [
        "unlock_content",
        "notify_rejection",
        "log_escalation_resolution",
      ],
    },

    // Emergency bypass
    {
      from: "pending_approval",
      to: "emergency_bypass",
      action: "emergency_bypass",
      requiredRole: "emergency_approver",
      requiredAuthority: 5,
      conditions: ["can_bypass"],
      sideEffects: [
        "unlock_content",
        "notify_emergency_bypass",
        "create_audit_log",
        "alert_executives",
      ],
    },

    {
      from: "in_review",
      to: "emergency_bypass",
      action: "emergency_bypass",
      requiredRole: "emergency_approver",
      requiredAuthority: 5,
      conditions: ["can_bypass"],
      sideEffects: [
        "unlock_content",
        "notify_emergency_bypass",
        "create_audit_log",
        "alert_executives",
      ],
    },

    {
      from: "escalated",
      to: "emergency_bypass",
      action: "emergency_bypass",
      requiredRole: "emergency_approver",
      requiredAuthority: 5,
      conditions: ["can_bypass"],
      sideEffects: [
        "unlock_content",
        "notify_emergency_bypass",
        "create_audit_log",
        "alert_executives",
      ],
    },

    // Cancellation
    {
      from: "submitted",
      to: "cancelled",
      action: "cancel",
      requiredRole: "submitter",
      sideEffects: [
        "unlock_content",
        "notify_cancellation",
        "cleanup_assignments",
      ],
    },

    {
      from: "in_review",
      to: "cancelled",
      action: "cancel",
      requiredRole: "submitter",
      sideEffects: [
        "unlock_content",
        "notify_cancellation",
        "cleanup_assignments",
      ],
    },

    {
      from: "pending_approval",
      to: "cancelled",
      action: "cancel",
      requiredRole: "submitter",
      sideEffects: [
        "unlock_content",
        "notify_cancellation",
        "cleanup_assignments",
      ],
    },

    {
      from: "needs_revision",
      to: "cancelled",
      action: "cancel",
      requiredRole: "submitter",
      sideEffects: [
        "unlock_content",
        "notify_cancellation",
        "cleanup_assignments",
      ],
    },
  ];

  /**
   * Get valid transitions from current state
   */
  static getValidTransitions(currentState: WorkflowState): StateTransition[] {
    return this.VALID_TRANSITIONS.filter(
      transition => transition.from === currentState
    );
  }

  /**
   * Check if a state transition is valid
   */
  static isValidTransition(
    from: WorkflowState,
    to: WorkflowState,
    action: WorkflowAction,
    context: WorkflowContext
  ): boolean {
    const transition = this.VALID_TRANSITIONS.find(
      t => t.from === from && t.to === to && t.action === action
    );

    if (!transition) {
      return false;
    }

    // Check role requirements
    if (
      transition.requiredRole &&
      !this.hasRequiredRole(transition.requiredRole, context)
    ) {
      return false;
    }

    // Check authority requirements
    if (
      transition.requiredAuthority &&
      context.approverAuthority < transition.requiredAuthority
    ) {
      return false;
    }

    // Check conditions
    if (
      transition.conditions &&
      !this.checkConditions(transition.conditions, context)
    ) {
      return false;
    }

    return true;
  }

  /**
   * Execute state transition
   */
  static async executeTransition(
    from: WorkflowState,
    to: WorkflowState,
    action: WorkflowAction,
    context: WorkflowContext
  ): Promise<{
    success: boolean;
    newState: WorkflowState;
    sideEffects: string[];
    errors?: string[];
  }> {
    if (!this.isValidTransition(from, to, action, context)) {
      return {
        success: false,
        newState: from,
        sideEffects: [],
        errors: ["Invalid state transition"],
      };
    }

    const transition = this.VALID_TRANSITIONS.find(
      t => t.from === from && t.to === to && t.action === action
    );

    if (!transition) {
      return {
        success: false,
        newState: from,
        sideEffects: [],
        errors: ["Transition not found"],
      };
    }

    try {
      // Execute side effects
      const sideEffects = transition.sideEffects || [];
      await this.executeSideEffects(sideEffects, context);

      return {
        success: true,
        newState: to,
        sideEffects,
      };
    } catch (error) {
      return {
        success: false,
        newState: from,
        sideEffects: [],
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  /**
   * Get next possible states from current state
   */
  static getNextStates(
    currentState: WorkflowState,
    context: WorkflowContext
  ): {
    state: WorkflowState;
    action: WorkflowAction;
    canExecute: boolean;
    reason?: string;
  }[] {
    const transitions = this.getValidTransitions(currentState);

    return transitions.map(transition => {
      const canExecute = this.isValidTransition(
        currentState,
        transition.to,
        transition.action,
        context
      );

      let reason;
      if (!canExecute) {
        if (
          transition.requiredRole &&
          !this.hasRequiredRole(transition.requiredRole, context)
        ) {
          reason = `Requires ${transition.requiredRole} role`;
        } else if (
          transition.requiredAuthority &&
          context.approverAuthority < transition.requiredAuthority
        ) {
          reason = `Requires authority level ${transition.requiredAuthority}`;
        } else if (
          transition.conditions &&
          !this.checkConditions(transition.conditions, context)
        ) {
          reason = "Conditions not met";
        }
      }

      return {
        state: transition.to,
        action: transition.action,
        canExecute,
        reason,
      };
    });
  }

  /**
   * Check if user has required role
   */
  private static hasRequiredRole(
    requiredRole: string,
    context: WorkflowContext
  ): boolean {
    const roleHierarchy = {
      submitter: 1,
      reviewer: 2,
      approver: 3,
      escalation_approver: 4,
      emergency_approver: 5,
    };

    const userRoleLevel =
      roleHierarchy[context.approverRole as keyof typeof roleHierarchy] || 0;
    const requiredRoleLevel =
      roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    return userRoleLevel >= requiredRoleLevel;
  }

  /**
   * Check workflow conditions
   */
  private static checkConditions(
    conditions: string[],
    context: WorkflowContext
  ): boolean {
    return conditions.every(condition => {
      switch (condition) {
        case "is_final_level":
          return context.currentLevel >= context.totalLevels;
        case "not_final_level":
          return context.currentLevel < context.totalLevels;
        case "is_overdue":
          return context.isOverdue;
        case "escalation_enabled":
          return context.isEscalated;
        case "can_bypass":
          return context.canBypass;
        default:
          return true;
      }
    });
  }

  /**
   * Execute side effects
   */
  private static async executeSideEffects(
    sideEffects: string[],
    context: WorkflowContext
  ): Promise<void> {
    for (const effect of sideEffects) {
      switch (effect) {
        case "lock_content":
          console.log(`Locking content for item ${context.itemId}`);
          break;
        case "unlock_content":
          console.log(`Unlocking content for item ${context.itemId}`);
          break;
        case "assign_reviewers":
          console.log(`Assigning reviewers for item ${context.itemId}`);
          break;
        case "assign_next_approver":
          console.log(`Assigning next approver for item ${context.itemId}`);
          break;
        case "assign_escalation_approvers":
          console.log(
            `Assigning escalation approvers for item ${context.itemId}`
          );
          break;
        case "send_notifications":
          console.log(`Sending notifications for item ${context.itemId}`);
          break;
        case "notify_completion":
          console.log(`Notifying completion for item ${context.itemId}`);
          break;
        case "notify_rejection":
          console.log(`Notifying rejection for item ${context.itemId}`);
          break;
        case "notify_revision_needed":
          console.log(`Notifying revision needed for item ${context.itemId}`);
          break;
        case "notify_escalation":
          console.log(`Notifying escalation for item ${context.itemId}`);
          break;
        case "notify_emergency_bypass":
          console.log(`Notifying emergency bypass for item ${context.itemId}`);
          break;
        case "notify_cancellation":
          console.log(`Notifying cancellation for item ${context.itemId}`);
          break;
        case "advance_level":
          console.log(`Advancing level for item ${context.itemId}`);
          break;
        case "increment_version":
          console.log(`Incrementing version for item ${context.itemId}`);
          break;
        case "restart_workflow":
          console.log(`Restarting workflow for item ${context.itemId}`);
          break;
        case "start_review_timer":
          console.log(`Starting review timer for item ${context.itemId}`);
          break;
        case "reset_timer":
          console.log(`Resetting timer for item ${context.itemId}`);
          break;
        case "update_priority":
          console.log(`Updating priority for item ${context.itemId}`);
          break;
        case "create_audit_log":
          console.log(`Creating audit log for item ${context.itemId}`);
          break;
        case "log_escalation_resolution":
          console.log(
            `Logging escalation resolution for item ${context.itemId}`
          );
          break;
        case "alert_executives":
          console.log(`Alerting executives for item ${context.itemId}`);
          break;
        case "cleanup_assignments":
          console.log(`Cleaning up assignments for item ${context.itemId}`);
          break;
        case "update_metrics":
          console.log(`Updating metrics for item ${context.itemId}`);
          break;
        default:
          console.log(
            `Unknown side effect: ${effect} for item ${context.itemId}`
          );
      }
    }
  }

  /**
   * Get workflow state description
   */
  static getStateDescription(state: WorkflowState): string {
    const descriptions = {
      pending_submission: "Awaiting submission to workflow",
      submitted: "Submitted for review",
      in_review: "Currently being reviewed",
      pending_approval: "Pending approval decision",
      approved: "Approved and ready for publication",
      rejected: "Rejected - workflow complete",
      needs_revision: "Requires revision before resubmission",
      escalated: "Escalated to higher authority",
      emergency_bypass: "Emergency bypass - approved without standard workflow",
      cancelled: "Cancelled by submitter",
    };

    return descriptions[state] || "Unknown state";
  }

  /**
   * Get action description
   */
  static getActionDescription(action: WorkflowAction): string {
    const descriptions = {
      submit: "Submit content for approval",
      start_review: "Start reviewing content",
      approve: "Approve content",
      reject: "Reject content",
      request_revision: "Request revision",
      escalate: "Escalate to higher authority",
      emergency_bypass: "Emergency bypass approval",
      cancel: "Cancel workflow",
      resubmit: "Resubmit after revision",
      complete_revision: "Complete revision",
    };

    return descriptions[action] || "Unknown action";
  }
}
