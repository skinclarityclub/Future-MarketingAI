/**
 * Role-Based Access Control (RBAC) System
 * for Approval Workflow Management
 */

export interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  permissions: Permission[];
  workflows: string[];
  canBypass: boolean;
  maxItems: number;
  timeConstraints?: TimeConstraint;
  approvalAuthority: number;
}

export interface Permission {
  action: string;
  resource: string;
  conditions?: Record<string, any>;
  restrictions?: Record<string, any>;
}

export interface TimeConstraint {
  allowedHours?: number[];
  allowedDays?: number[];
  timezone?: string;
  maxSessionTime?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  department: string;
  manager?: string;
  active: boolean;
  lastLogin?: string;
  settings: UserSettings;
}

export interface UserSettings {
  notifications: NotificationSettings;
  preferences: WorkflowPreferences;
  delegation?: DelegationSettings;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  inApp: boolean;
  webhooks: string[];
  frequency: "immediate" | "hourly" | "daily";
}

export interface WorkflowPreferences {
  autoAssign: boolean;
  bulkOperations: boolean;
  showAnalytics: boolean;
  defaultView: "list" | "grid" | "kanban";
}

export interface DelegationSettings {
  enabled: boolean;
  delegateTo?: string;
  startDate?: string;
  endDate?: string;
  scope: "all" | "specific";
  workflows?: string[];
}

/**
 * Role-Based Access Control Manager
 */
export class RBACManager {
  private static readonly SYSTEM_ROLES: Role[] = [
    {
      id: "content_creator",
      name: "Content Creator",
      description: "Creates and submits content for approval",
      level: 1,
      permissions: [
        { action: "create", resource: "content" },
        { action: "submit", resource: "workflow" },
        { action: "view", resource: "own_submissions" },
        { action: "cancel", resource: "own_submissions" },
        { action: "revise", resource: "own_submissions" },
      ],
      workflows: ["standard", "social", "email"],
      canBypass: false,
      maxItems: 50,
      approvalAuthority: 0,
    },
    {
      id: "content_reviewer",
      name: "Content Reviewer",
      description: "Reviews content quality and compliance",
      level: 2,
      permissions: [
        { action: "view", resource: "assigned_content" },
        { action: "review", resource: "assigned_content" },
        { action: "approve", resource: "level_1" },
        { action: "reject", resource: "level_1" },
        { action: "request_revision", resource: "level_1" },
        { action: "add_annotation", resource: "content" },
        { action: "view", resource: "analytics" },
      ],
      workflows: ["standard", "social", "email", "legal"],
      canBypass: false,
      maxItems: 25,
      approvalAuthority: 1,
    },
    {
      id: "content_manager",
      name: "Content Manager",
      description: "Manages content workflow and approves final content",
      level: 3,
      permissions: [
        { action: "view", resource: "all_content" },
        { action: "approve", resource: "level_2" },
        { action: "reject", resource: "level_2" },
        { action: "request_revision", resource: "level_2" },
        { action: "reassign", resource: "workflow" },
        { action: "escalate", resource: "workflow" },
        { action: "bulk_approve", resource: "content" },
        { action: "view", resource: "analytics" },
        { action: "manage", resource: "templates" },
      ],
      workflows: ["standard", "social", "email", "legal", "executive"],
      canBypass: false,
      maxItems: 100,
      approvalAuthority: 2,
    },
    {
      id: "marketing_director",
      name: "Marketing Director",
      description: "Senior approval authority for marketing content",
      level: 4,
      permissions: [
        { action: "view", resource: "all_content" },
        { action: "approve", resource: "level_3" },
        { action: "reject", resource: "level_3" },
        { action: "emergency_bypass", resource: "workflow" },
        { action: "bulk_operations", resource: "content" },
        { action: "manage", resource: "workflows" },
        { action: "view", resource: "executive_analytics" },
        { action: "delegate", resource: "authority" },
      ],
      workflows: [
        "standard",
        "social",
        "email",
        "legal",
        "executive",
        "crisis",
      ],
      canBypass: true,
      maxItems: 500,
      approvalAuthority: 3,
    },
    {
      id: "executive_approver",
      name: "Executive Approver",
      description: "C-level approval for sensitive content",
      level: 5,
      permissions: [
        { action: "view", resource: "all_content" },
        { action: "approve", resource: "executive_level" },
        { action: "reject", resource: "executive_level" },
        { action: "emergency_bypass", resource: "any_workflow" },
        { action: "override", resource: "any_decision" },
        { action: "manage", resource: "system_settings" },
        { action: "audit", resource: "all_activities" },
      ],
      workflows: ["executive", "crisis", "legal", "compliance"],
      canBypass: true,
      maxItems: 1000,
      approvalAuthority: 5,
    },
    {
      id: "system_admin",
      name: "System Administrator",
      description: "System administration and configuration",
      level: 6,
      permissions: [
        { action: "manage", resource: "system" },
        { action: "configure", resource: "workflows" },
        { action: "manage", resource: "users" },
        { action: "manage", resource: "roles" },
        { action: "audit", resource: "system_logs" },
        { action: "backup", resource: "data" },
        { action: "restore", resource: "data" },
      ],
      workflows: ["all"],
      canBypass: true,
      maxItems: -1, // unlimited
      approvalAuthority: 10,
    },
  ];

  /**
   * Check if user has permission for specific action
   */
  static hasPermission(
    user: User,
    action: string,
    resource: string,
    context?: Record<string, any>
  ): boolean {
    const userRoles = this.getUserRoles(user);

    return userRoles.some(role => {
      return role.permissions.some(permission => {
        // Check basic permission match
        if (permission.action !== action || permission.resource !== resource) {
          return false;
        }

        // Check conditions if they exist
        if (permission.conditions && context) {
          return this.checkConditions(permission.conditions, context);
        }

        return true;
      });
    });
  }

  /**
   * Get user roles
   */
  static getUserRoles(user: User): Role[] {
    return this.SYSTEM_ROLES.filter(role => user.roles.includes(role.id));
  }

  /**
   * Get user's maximum approval authority
   */
  static getUserMaxAuthority(user: User): number {
    const userRoles = this.getUserRoles(user);
    return Math.max(...userRoles.map(role => role.approvalAuthority), 0);
  }

  /**
   * Check if user can bypass approval
   */
  static canBypassApproval(user: User): boolean {
    const userRoles = this.getUserRoles(user);
    return userRoles.some(role => role.canBypass);
  }

  /**
   * Get workflows accessible to user
   */
  static getAccessibleWorkflows(user: User): string[] {
    const userRoles = this.getUserRoles(user);
    const workflows = new Set<string>();

    userRoles.forEach(role => {
      role.workflows.forEach(workflow => {
        if (workflow === "all") {
          workflows.add("standard");
          workflows.add("social");
          workflows.add("email");
          workflows.add("legal");
          workflows.add("executive");
          workflows.add("crisis");
          workflows.add("compliance");
        } else {
          workflows.add(workflow);
        }
      });
    });

    return Array.from(workflows);
  }

  /**
   * Check if user can approve at specific level
   */
  static canApproveAtLevel(user: User, level: number): boolean {
    const maxAuthority = this.getUserMaxAuthority(user);
    return maxAuthority >= level;
  }

  /**
   * Get user's workload limits
   */
  static getWorkloadLimits(user: User): {
    maxItems: number;
    currentItems: number;
    canAcceptMore: boolean;
  } {
    const userRoles = this.getUserRoles(user);
    const maxItems = Math.max(...userRoles.map(role => role.maxItems));

    // In a real implementation, this would query the database
    const currentItems = 0;

    return {
      maxItems: maxItems === -1 ? Infinity : maxItems,
      currentItems,
      canAcceptMore: maxItems === -1 || currentItems < maxItems,
    };
  }

  /**
   * Check time constraints for user actions
   */
  static checkTimeConstraints(user: User, action: string): boolean {
    const userRoles = this.getUserRoles(user);

    for (const role of userRoles) {
      if (role.timeConstraints) {
        const now = new Date();
        const constraints = role.timeConstraints;

        // Check allowed hours
        if (constraints.allowedHours) {
          const currentHour = now.getHours();
          if (!constraints.allowedHours.includes(currentHour)) {
            return false;
          }
        }

        // Check allowed days (0 = Sunday, 6 = Saturday)
        if (constraints.allowedDays) {
          const currentDay = now.getDay();
          if (!constraints.allowedDays.includes(currentDay)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Get delegation settings for user
   */
  static getDelegationSettings(user: User): DelegationSettings | null {
    if (!user.settings.delegation?.enabled) {
      return null;
    }

    const delegation = user.settings.delegation;
    const now = new Date();

    // Check if delegation is active
    if (delegation.startDate && new Date(delegation.startDate) > now) {
      return null;
    }

    if (delegation.endDate && new Date(delegation.endDate) < now) {
      return null;
    }

    return delegation;
  }

  /**
   * Check if user can delegate authority
   */
  static canDelegate(user: User): boolean {
    return this.hasPermission(user, "delegate", "authority");
  }

  /**
   * Get effective approver (considering delegation)
   */
  static getEffectiveApprover(user: User): string {
    const delegation = this.getDelegationSettings(user);
    return delegation?.delegateTo || user.id;
  }

  /**
   * Validate workflow assignment
   */
  static validateWorkflowAssignment(
    user: User,
    workflowType: string,
    itemCount: number
  ): {
    valid: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];

    // Check workflow access
    const accessibleWorkflows = this.getAccessibleWorkflows(user);
    if (!accessibleWorkflows.includes(workflowType)) {
      reasons.push(`User does not have access to ${workflowType} workflow`);
    }

    // Check workload limits
    const workload = this.getWorkloadLimits(user);
    if (
      !workload.canAcceptMore ||
      workload.currentItems + itemCount > workload.maxItems
    ) {
      reasons.push(`User has reached maximum workload capacity`);
    }

    // Check time constraints
    if (!this.checkTimeConstraints(user, "approve")) {
      reasons.push(
        `User is not available at this time due to time constraints`
      );
    }

    // Check if user is active
    if (!user.active) {
      reasons.push(`User account is not active`);
    }

    return {
      valid: reasons.length === 0,
      reasons,
    };
  }

  /**
   * Get approval workflow for user
   */
  static getApprovalWorkflow(
    user: User,
    contentType: string
  ): {
    canApprove: boolean;
    level: number;
    nextLevel?: number;
    escalationPath: string[];
  } {
    const authority = this.getUserMaxAuthority(user);
    const roles = this.getUserRoles(user);

    // Determine escalation path
    const escalationPath = this.SYSTEM_ROLES.filter(
      role => role.approvalAuthority > authority
    )
      .sort((a, b) => a.approvalAuthority - b.approvalAuthority)
      .map(role => role.id);

    return {
      canApprove: authority > 0,
      level: authority,
      nextLevel:
        escalationPath.length > 0
          ? this.SYSTEM_ROLES.find(r => r.id === escalationPath[0])
              ?.approvalAuthority
          : undefined,
      escalationPath,
    };
  }

  /**
   * Check permission conditions
   */
  private static checkConditions(
    conditions: Record<string, any>,
    context: Record<string, any>
  ): boolean {
    return Object.entries(conditions).every(([key, value]) => {
      const contextValue = context[key];

      if (Array.isArray(value)) {
        return value.includes(contextValue);
      }

      return contextValue === value;
    });
  }

  /**
   * Get role hierarchy
   */
  static getRoleHierarchy(): Role[] {
    return [...this.SYSTEM_ROLES].sort((a, b) => a.level - b.level);
  }

  /**
   * Get permissions for role
   */
  static getRolePermissions(roleId: string): Permission[] {
    const role = this.SYSTEM_ROLES.find(r => r.id === roleId);
    return role?.permissions || [];
  }
}
