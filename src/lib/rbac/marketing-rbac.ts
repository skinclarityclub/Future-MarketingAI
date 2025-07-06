import { RBACService } from "./rbac-service";

// Marketing-specific role definitions
export type MarketingRoleType =
  | "super_admin"
  | "admin"
  | "marketing_director"
  | "marketing_manager"
  | "content_manager"
  | "content_creator"
  | "analyst"
  | "executive";

// Marketing-specific permissions
export interface MarketingPermission {
  resource: MarketingResource;
  action: MarketingAction;
}

export type MarketingResource =
  | "campaigns"
  | "content"
  | "analytics"
  | "budget"
  | "team"
  | "approval"
  | "schedule"
  | "roi_data"
  | "ab_testing"
  | "custom_widgets"
  | "collaboration"
  | "comments"
  | "assignments";

export type MarketingAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "approve"
  | "reject"
  | "assign"
  | "comment"
  | "export"
  | "manage"
  | "configure";

// Marketing role hierarchy with permissions
export const MARKETING_ROLE_PERMISSIONS: Record<
  MarketingRoleType,
  MarketingPermission[]
> = {
  super_admin: [
    // Full access to everything
    { resource: "campaigns", action: "manage" },
    { resource: "content", action: "manage" },
    { resource: "analytics", action: "manage" },
    { resource: "budget", action: "manage" },
    { resource: "team", action: "manage" },
    { resource: "approval", action: "manage" },
    { resource: "schedule", action: "manage" },
    { resource: "roi_data", action: "manage" },
    { resource: "ab_testing", action: "manage" },
    { resource: "custom_widgets", action: "manage" },
    { resource: "collaboration", action: "manage" },
    { resource: "comments", action: "manage" },
    { resource: "assignments", action: "manage" },
  ],
  admin: [
    // Full access to marketing operations
    { resource: "campaigns", action: "manage" },
    { resource: "content", action: "manage" },
    { resource: "analytics", action: "view" },
    { resource: "budget", action: "view" },
    { resource: "team", action: "manage" },
    { resource: "approval", action: "approve" },
    { resource: "schedule", action: "manage" },
    { resource: "roi_data", action: "view" },
    { resource: "ab_testing", action: "manage" },
    { resource: "custom_widgets", action: "manage" },
    { resource: "collaboration", action: "manage" },
    { resource: "comments", action: "manage" },
    { resource: "assignments", action: "manage" },
  ],
  marketing_director: [
    // Strategic oversight and approval authority
    { resource: "campaigns", action: "manage" },
    { resource: "content", action: "approve" },
    { resource: "analytics", action: "view" },
    { resource: "budget", action: "manage" },
    { resource: "team", action: "manage" },
    { resource: "approval", action: "approve" },
    { resource: "schedule", action: "approve" },
    { resource: "roi_data", action: "view" },
    { resource: "ab_testing", action: "manage" },
    { resource: "custom_widgets", action: "create" },
    { resource: "collaboration", action: "manage" },
    { resource: "comments", action: "manage" },
    { resource: "assignments", action: "assign" },
  ],
  marketing_manager: [
    // Operational management with team coordination
    { resource: "campaigns", action: "edit" },
    { resource: "content", action: "edit" },
    { resource: "analytics", action: "view" },
    { resource: "budget", action: "view" },
    { resource: "team", action: "view" },
    { resource: "approval", action: "view" },
    { resource: "schedule", action: "edit" },
    { resource: "roi_data", action: "view" },
    { resource: "ab_testing", action: "view" },
    { resource: "custom_widgets", action: "create" },
    { resource: "collaboration", action: "manage" },
    { resource: "comments", action: "create" },
    { resource: "assignments", action: "assign" },
  ],
  content_manager: [
    // Content workflow management
    { resource: "campaigns", action: "view" },
    { resource: "content", action: "manage" },
    { resource: "analytics", action: "view" },
    { resource: "budget", action: "view" },
    { resource: "team", action: "view" },
    { resource: "approval", action: "approve" },
    { resource: "schedule", action: "manage" },
    { resource: "roi_data", action: "view" },
    { resource: "ab_testing", action: "view" },
    { resource: "custom_widgets", action: "view" },
    { resource: "collaboration", action: "create" },
    { resource: "comments", action: "create" },
    { resource: "assignments", action: "assign" },
  ],
  content_creator: [
    // Content creation and submission
    { resource: "campaigns", action: "view" },
    { resource: "content", action: "create" },
    { resource: "analytics", action: "view" },
    { resource: "budget", action: "view" },
    { resource: "team", action: "view" },
    { resource: "approval", action: "view" },
    { resource: "schedule", action: "view" },
    { resource: "roi_data", action: "view" },
    { resource: "ab_testing", action: "view" },
    { resource: "custom_widgets", action: "view" },
    { resource: "collaboration", action: "create" },
    { resource: "comments", action: "create" },
    { resource: "assignments", action: "view" },
  ],
  analyst: [
    // Data analysis and reporting
    { resource: "campaigns", action: "view" },
    { resource: "content", action: "view" },
    { resource: "analytics", action: "manage" },
    { resource: "budget", action: "view" },
    { resource: "team", action: "view" },
    { resource: "approval", action: "view" },
    { resource: "schedule", action: "view" },
    { resource: "roi_data", action: "view" },
    { resource: "ab_testing", action: "manage" },
    { resource: "custom_widgets", action: "create" },
    { resource: "collaboration", action: "create" },
    { resource: "comments", action: "create" },
    { resource: "assignments", action: "view" },
  ],
  executive: [
    // High-level overview and strategic insights
    { resource: "campaigns", action: "view" },
    { resource: "content", action: "view" },
    { resource: "analytics", action: "view" },
    { resource: "budget", action: "view" },
    { resource: "team", action: "view" },
    { resource: "approval", action: "view" },
    { resource: "schedule", action: "view" },
    { resource: "roi_data", action: "view" },
    { resource: "ab_testing", action: "view" },
    { resource: "custom_widgets", action: "view" },
    { resource: "collaboration", action: "view" },
    { resource: "comments", action: "view" },
    { resource: "assignments", action: "view" },
  ],
};

/**
 * Marketing RBAC Utility Class
 * Provides role-based access control for marketing dashboard features
 */
export class MarketingRBAC {
  /**
   * Check if user has permission for a specific marketing resource and action
   */
  static hasPermission(
    userRole: MarketingRoleType,
    resource: MarketingResource,
    action: MarketingAction
  ): boolean {
    const rolePermissions = MARKETING_ROLE_PERMISSIONS[userRole] || [];

    return rolePermissions.some(
      permission =>
        permission.resource === resource &&
        (permission.action === action || permission.action === "manage")
    );
  }

  /**
   * Get all permissions for a specific role
   */
  static getRolePermissions(role: MarketingRoleType): MarketingPermission[] {
    return MARKETING_ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Check if user can manage team (assign tasks, add members, etc.)
   */
  static canManageTeam(userRole: MarketingRoleType): boolean {
    return (
      this.hasPermission(userRole, "team", "manage") ||
      ["super_admin", "admin", "marketing_director"].includes(userRole)
    );
  }

  /**
   * Check if user can assign tasks
   */
  static canAssignTasks(userRole: MarketingRoleType): boolean {
    return (
      this.hasPermission(userRole, "assignments", "assign") ||
      [
        "super_admin",
        "admin",
        "marketing_director",
        "marketing_manager",
        "content_manager",
      ].includes(userRole)
    );
  }

  /**
   * Check if user can approve content/campaigns
   */
  static canApprove(userRole: MarketingRoleType): boolean {
    return (
      this.hasPermission(userRole, "approval", "approve") ||
      [
        "super_admin",
        "admin",
        "marketing_director",
        "content_manager",
      ].includes(userRole)
    );
  }

  /**
   * Check if user can view/access budget and ROI data
   */
  static canAccessBudgetData(userRole: MarketingRoleType): boolean {
    return (
      this.hasPermission(userRole, "budget", "view") ||
      this.hasPermission(userRole, "roi_data", "view")
    );
  }

  /**
   * Check if user can create and manage A/B tests
   */
  static canManageABTesting(userRole: MarketingRoleType): boolean {
    return (
      this.hasPermission(userRole, "ab_testing", "manage") ||
      ["super_admin", "admin", "marketing_director", "analyst"].includes(
        userRole
      )
    );
  }

  /**
   * Check if user can create custom widgets
   */
  static canCreateCustomWidgets(userRole: MarketingRoleType): boolean {
    return (
      this.hasPermission(userRole, "custom_widgets", "create") ||
      [
        "super_admin",
        "admin",
        "marketing_director",
        "marketing_manager",
        "analyst",
      ].includes(userRole)
    );
  }

  /**
   * Check if user can view analytics and reports
   */
  static canViewAnalytics(userRole: MarketingRoleType): boolean {
    return (
      this.hasPermission(userRole, "analytics", "view") ||
      this.hasPermission(userRole, "analytics", "manage")
    );
  }

  /**
   * Check if user can schedule content
   */
  static canScheduleContent(userRole: MarketingRoleType): boolean {
    return (
      this.hasPermission(userRole, "schedule", "edit") ||
      this.hasPermission(userRole, "schedule", "manage") ||
      [
        "super_admin",
        "admin",
        "marketing_director",
        "marketing_manager",
        "content_manager",
      ].includes(userRole)
    );
  }

  /**
   * Get user's access level for dashboard visibility
   */
  static getDashboardAccessLevel(
    userRole: MarketingRoleType
  ): "full" | "limited" | "readonly" {
    if (["super_admin", "admin", "marketing_director"].includes(userRole)) {
      return "full";
    }
    if (
      ["marketing_manager", "content_manager", "analyst"].includes(userRole)
    ) {
      return "limited";
    }
    return "readonly";
  }

  /**
   * Get widgets that user can access based on their role
   */
  static getAccessibleWidgets(userRole: MarketingRoleType): string[] {
    const widgets: string[] = [];

    // Basic widgets available to all roles
    widgets.push("kpi-overview");

    if (this.canViewAnalytics(userRole)) {
      widgets.push("analytics", "performance-metrics");
    }

    if (this.canAccessBudgetData(userRole)) {
      widgets.push("roi-budget", "budget-optimization");
    }

    if (this.canManageABTesting(userRole)) {
      widgets.push("ab-testing");
    }

    if (this.canScheduleContent(userRole)) {
      widgets.push("content-calendar", "content-pipeline");
    }

    if (this.canCreateCustomWidgets(userRole)) {
      widgets.push("custom-widget-builder");
    }

    if (
      this.hasPermission(userRole, "collaboration", "create") ||
      this.hasPermission(userRole, "collaboration", "manage")
    ) {
      widgets.push("team-collaboration");
    }

    return widgets;
  }

  /**
   * Get role display information
   */
  static getRoleInfo(role: MarketingRoleType): {
    name: string;
    description: string;
    color: string;
    priority: number;
  } {
    const roleInfo = {
      super_admin: {
        name: "Super Admin",
        description: "Full system access and management",
        color: "bg-red-500",
        priority: 10,
      },
      admin: {
        name: "Administrator",
        description: "Administrative access with user management",
        color: "bg-purple-500",
        priority: 9,
      },
      marketing_director: {
        name: "Marketing Director",
        description: "Strategic oversight and approval authority",
        color: "bg-blue-500",
        priority: 8,
      },
      marketing_manager: {
        name: "Marketing Manager",
        description: "Operational management and team coordination",
        color: "bg-indigo-500",
        priority: 7,
      },
      content_manager: {
        name: "Content Manager",
        description: "Content workflow and approval management",
        color: "bg-green-500",
        priority: 6,
      },
      content_creator: {
        name: "Content Creator",
        description: "Content creation and submission",
        color: "bg-yellow-500",
        priority: 5,
      },
      analyst: {
        name: "Data Analyst",
        description: "Data analysis and reporting capabilities",
        color: "bg-orange-500",
        priority: 4,
      },
      executive: {
        name: "Executive",
        description: "High-level overview and strategic insights",
        color: "bg-pink-500",
        priority: 3,
      },
    };

    return roleInfo[role] || roleInfo.executive;
  }
}

// Helper hook for React components
export function useMarketingRBAC(userRole: MarketingRoleType) {
  return {
    hasPermission: (resource: MarketingResource, action: MarketingAction) =>
      MarketingRBAC.hasPermission(userRole, resource, action),
    canManageTeam: MarketingRBAC.canManageTeam(userRole),
    canAssignTasks: MarketingRBAC.canAssignTasks(userRole),
    canApprove: MarketingRBAC.canApprove(userRole),
    canAccessBudgetData: MarketingRBAC.canAccessBudgetData(userRole),
    canManageABTesting: MarketingRBAC.canManageABTesting(userRole),
    canCreateCustomWidgets: MarketingRBAC.canCreateCustomWidgets(userRole),
    canViewAnalytics: MarketingRBAC.canViewAnalytics(userRole),
    canScheduleContent: MarketingRBAC.canScheduleContent(userRole),
    accessLevel: MarketingRBAC.getDashboardAccessLevel(userRole),
    accessibleWidgets: MarketingRBAC.getAccessibleWidgets(userRole),
    roleInfo: MarketingRBAC.getRoleInfo(userRole),
  };
}
