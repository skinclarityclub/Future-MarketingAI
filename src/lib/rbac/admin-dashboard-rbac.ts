import { RBACService, UserRoleType } from "./rbac-service";

/**
 * Admin Dashboard Specific Role Types
 * Extends the existing UserRoleType with dashboard-specific capabilities
 */
export type AdminDashboardRole =
  | "master_admin" // Platform owner - full access to everything
  | "business_admin" // Business metrics and customer intelligence (read-only)
  | "technical_admin" // System health, workflows, security monitoring
  | "read_only_viewer" // Executive summary and basic metrics only
  | "compliance_admin" // Security, compliance, and audit access
  | "operations_admin"; // Operational controls and workflow management

/**
 * Dashboard Module Access Levels
 */
export type DashboardModule =
  | "executive_summary"
  | "system_health"
  | "business_analytics"
  | "workflow_performance"
  | "customer_intelligence"
  | "operational_controls"
  | "security_compliance";

/**
 * Dashboard Widget Categories
 */
export type WidgetCategory =
  | "revenue_analytics"
  | "customer_metrics"
  | "system_monitoring"
  | "workflow_analytics"
  | "security_monitoring"
  | "compliance_tracking"
  | "operational_tools"
  | "ai_analytics"
  | "infrastructure_health"
  | "user_analytics";

/**
 * Action Types for Dashboard Operations
 */
export type DashboardAction =
  | "view" // Read access to data and widgets
  | "export" // Export data and reports
  | "configure" // Modify dashboard layouts and settings
  | "control" // Execute operational controls (kill switches, etc.)
  | "audit" // Access audit logs and security data
  | "manage_users" // User and permission management
  | "system_admin" // System-level administrative functions
  | "real_time_monitor" // Access to real-time monitoring feeds
  | "alert_config" // Configure alerts and notifications
  | "bulk_operations"; // Execute bulk operations

/**
 * Permission Context for Advanced Access Control
 */
export interface DashboardPermissionContext {
  timeRange?: "real-time" | "historical" | "archived";
  dataScope?: "all" | "organization" | "team" | "personal";
  sensitivityLevel?: "public" | "internal" | "confidential" | "restricted";
  exportFormat?: "view" | "csv" | "pdf" | "excel" | "api";
  ipRestriction?: string[];
  timeRestriction?: {
    allowedHours: number[];
    timezone: string;
  };
}

/**
 * Dashboard Role Configuration
 */
export interface AdminDashboardRoleConfig {
  role: AdminDashboardRole;
  name: string;
  description: string;
  modules: Partial<Record<DashboardModule, DashboardAction[]>>;
  widgets: Partial<Record<WidgetCategory, DashboardAction[]>>;
  globalPermissions: DashboardAction[];
  restrictions: {
    maxConcurrentSessions?: number;
    sessionTimeout?: number; // minutes
    mfaRequired: boolean;
    ipAllowlist?: string[];
    timeRestrictions?: {
      allowedHours: number[];
      timezone: string;
    };
  };
  auditLevel: "minimal" | "standard" | "comprehensive";
}

/**
 * Master Command Center RBAC Service
 * Specialized service for Admin Dashboard access control
 */
export class AdminDashboardRBACService {
  private rbacService: RBACService;
  private roleConfigurations: Map<AdminDashboardRole, AdminDashboardRoleConfig>;

  constructor() {
    this.rbacService = new RBACService();
    this.roleConfigurations = new Map();
    this.initializeRoleConfigurations();
  }

  /**
   * Initialize predefined role configurations
   */
  private initializeRoleConfigurations(): void {
    // Master Admin - Platform Owner
    this.roleConfigurations.set("master_admin", {
      role: "master_admin",
      name: "Master Administrator",
      description:
        "Platform owner with full access to all dashboard features and operational controls",
      modules: {
        executive_summary: ["view", "export", "configure"],
        system_health: [
          "view",
          "export",
          "configure",
          "control",
          "alert_config",
        ],
        business_analytics: ["view", "export", "configure"],
        workflow_performance: ["view", "export", "configure", "control"],
        customer_intelligence: ["view", "export", "configure"],
        operational_controls: [
          "view",
          "configure",
          "control",
          "bulk_operations",
        ],
        security_compliance: [
          "view",
          "export",
          "configure",
          "audit",
          "manage_users",
        ],
      },
      widgets: {
        revenue_analytics: ["view", "export", "configure"],
        customer_metrics: ["view", "export", "configure"],
        system_monitoring: [
          "view",
          "export",
          "configure",
          "control",
          "real_time_monitor",
        ],
        workflow_analytics: ["view", "export", "configure", "control"],
        security_monitoring: ["view", "export", "configure", "audit"],
        compliance_tracking: ["view", "export", "configure", "audit"],
        operational_tools: ["view", "configure", "control", "bulk_operations"],
        ai_analytics: ["view", "export", "configure"],
        infrastructure_health: [
          "view",
          "export",
          "configure",
          "real_time_monitor",
        ],
        user_analytics: ["view", "export", "configure"],
      },
      globalPermissions: [
        "view",
        "export",
        "configure",
        "control",
        "audit",
        "manage_users",
        "system_admin",
        "real_time_monitor",
        "alert_config",
        "bulk_operations",
      ],
      restrictions: {
        maxConcurrentSessions: 5,
        sessionTimeout: 240, // 4 hours
        mfaRequired: true,
        timeRestrictions: {
          allowedHours: Array.from({ length: 24 }, (_, i) => i), // 24/7 access
          timezone: "UTC",
        },
      },
      auditLevel: "comprehensive",
    });

    // Business Admin - Business Intelligence Focus
    this.roleConfigurations.set("business_admin", {
      role: "business_admin",
      name: "Business Administrator",
      description:
        "Business analytics and customer intelligence with read-only access",
      modules: {
        executive_summary: ["view", "export"],
        business_analytics: ["view", "export"],
        customer_intelligence: ["view", "export"],
        workflow_performance: ["view"], // Limited workflow access
      },
      widgets: {
        revenue_analytics: ["view", "export"],
        customer_metrics: ["view", "export"],
        workflow_analytics: ["view"],
        ai_analytics: ["view", "export"],
        user_analytics: ["view", "export"],
      },
      globalPermissions: ["view", "export"],
      restrictions: {
        maxConcurrentSessions: 3,
        sessionTimeout: 180, // 3 hours
        mfaRequired: true,
        timeRestrictions: {
          allowedHours: Array.from({ length: 12 }, (_, i) => i + 6), // 6 AM - 6 PM
          timezone: "Europe/Amsterdam",
        },
      },
      auditLevel: "standard",
    });

    // Technical Admin - System and Infrastructure Focus
    this.roleConfigurations.set("technical_admin", {
      role: "technical_admin",
      name: "Technical Administrator",
      description:
        "System health, workflow performance, and security monitoring",
      modules: {
        executive_summary: ["view"],
        system_health: ["view", "export", "real_time_monitor", "alert_config"],
        workflow_performance: ["view", "export", "configure", "control"],
        security_compliance: ["view", "export", "audit"],
        operational_controls: ["view", "control"], // Limited operational access
      },
      widgets: {
        system_monitoring: ["view", "export", "real_time_monitor"],
        workflow_analytics: ["view", "export", "configure"],
        security_monitoring: ["view", "export", "audit"],
        compliance_tracking: ["view", "export"],
        operational_tools: ["view", "control"],
        infrastructure_health: ["view", "export", "real_time_monitor"],
        ai_analytics: ["view", "export"],
      },
      globalPermissions: [
        "view",
        "export",
        "real_time_monitor",
        "alert_config",
        "control",
      ],
      restrictions: {
        maxConcurrentSessions: 3,
        sessionTimeout: 180,
        mfaRequired: true,
        timeRestrictions: {
          allowedHours: Array.from({ length: 24 }, (_, i) => i), // 24/7 for system monitoring
          timezone: "Europe/Amsterdam",
        },
      },
      auditLevel: "comprehensive",
    });

    // Read-Only Viewer - Executive Overview
    this.roleConfigurations.set("read_only_viewer", {
      role: "read_only_viewer",
      name: "Read-Only Viewer",
      description: "Executive summary and basic metrics with view-only access",
      modules: {
        executive_summary: ["view"],
        business_analytics: ["view"], // Basic metrics only
      },
      widgets: {
        revenue_analytics: ["view"],
        customer_metrics: ["view"],
        system_monitoring: ["view"], // High-level status only
        user_analytics: ["view"],
      },
      globalPermissions: ["view"],
      restrictions: {
        maxConcurrentSessions: 2,
        sessionTimeout: 120, // 2 hours
        mfaRequired: false,
        timeRestrictions: {
          allowedHours: Array.from({ length: 12 }, (_, i) => i + 6), // 6 AM - 6 PM
          timezone: "Europe/Amsterdam",
        },
      },
      auditLevel: "minimal",
    });

    // Compliance Admin - Security and Compliance Focus
    this.roleConfigurations.set("compliance_admin", {
      role: "compliance_admin",
      name: "Compliance Administrator",
      description: "Security monitoring, compliance tracking, and audit access",
      modules: {
        executive_summary: ["view"],
        security_compliance: ["view", "export", "configure", "audit"],
        system_health: ["view"], // Basic system health for compliance
      },
      widgets: {
        security_monitoring: ["view", "export", "audit"],
        compliance_tracking: ["view", "export", "configure", "audit"],
        system_monitoring: ["view"],
        user_analytics: ["view", "audit"],
      },
      globalPermissions: ["view", "export", "audit"],
      restrictions: {
        maxConcurrentSessions: 2,
        sessionTimeout: 180,
        mfaRequired: true,
        timeRestrictions: {
          allowedHours: Array.from({ length: 10 }, (_, i) => i + 8), // 8 AM - 6 PM
          timezone: "Europe/Amsterdam",
        },
      },
      auditLevel: "comprehensive",
    });

    // Operations Admin - Workflow and Operational Controls
    this.roleConfigurations.set("operations_admin", {
      role: "operations_admin",
      name: "Operations Administrator",
      description: "Workflow management and operational controls",
      modules: {
        executive_summary: ["view"],
        workflow_performance: ["view", "export", "configure", "control"],
        operational_controls: [
          "view",
          "configure",
          "control",
          "bulk_operations",
        ],
        customer_intelligence: ["view"], // For operational insights
      },
      widgets: {
        workflow_analytics: ["view", "export", "configure", "control"],
        operational_tools: ["view", "configure", "control", "bulk_operations"],
        ai_analytics: ["view", "export"],
        customer_metrics: ["view"],
        system_monitoring: ["view"],
      },
      globalPermissions: [
        "view",
        "export",
        "configure",
        "control",
        "bulk_operations",
      ],
      restrictions: {
        maxConcurrentSessions: 3,
        sessionTimeout: 180,
        mfaRequired: true,
        timeRestrictions: {
          allowedHours: Array.from({ length: 16 }, (_, i) => i + 6), // 6 AM - 10 PM
          timezone: "Europe/Amsterdam",
        },
      },
      auditLevel: "standard",
    });
  }

  /**
   * Check if user has access to a specific dashboard module
   */
  async hasModuleAccess(
    userId: string,
    module: DashboardModule,
    action: DashboardAction = "view"
  ): Promise<boolean> {
    try {
      const userRoles = await this.getUserDashboardRoles(userId);

      for (const role of userRoles) {
        const config = this.roleConfigurations.get(role);
        if (config?.modules[module]?.includes(action)) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error checking module access:", error);
      return false;
    }
  }

  /**
   * Check if user has access to a specific widget category
   */
  async hasWidgetAccess(
    userId: string,
    widget: WidgetCategory,
    action: DashboardAction = "view"
  ): Promise<boolean> {
    try {
      const userRoles = await this.getUserDashboardRoles(userId);

      for (const role of userRoles) {
        const config = this.roleConfigurations.get(role);
        if (config?.widgets[widget]?.includes(action)) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error checking widget access:", error);
      return false;
    }
  }

  /**
   * Get all dashboard roles for a user
   */
  async getUserDashboardRoles(userId: string): Promise<AdminDashboardRole[]> {
    try {
      // Check for master admin first (platform owner)
      const isSuperAdmin = await this.rbacService.hasRole(
        userId,
        "super_admin"
      );
      if (isSuperAdmin) {
        return ["master_admin"];
      }

      const roles: AdminDashboardRole[] = [];

      // Map existing RBAC roles to dashboard roles
      const isAdmin = await this.rbacService.hasRole(userId, "admin");
      const isExecutive = await this.rbacService.hasRole(userId, "executive");
      const isSecurityAdmin = await this.rbacService.hasRole(
        userId,
        "security_admin"
      );
      const isComplianceOfficer = await this.rbacService.hasRole(
        userId,
        "compliance_officer"
      );
      const isManager = await this.rbacService.hasRole(userId, "manager");

      if (isAdmin) roles.push("technical_admin", "operations_admin");
      if (isExecutive) roles.push("business_admin");
      if (isSecurityAdmin) roles.push("compliance_admin");
      if (isComplianceOfficer) roles.push("compliance_admin");
      if (isManager) roles.push("read_only_viewer");

      return roles.length > 0 ? roles : ["read_only_viewer"];
    } catch (error) {
      console.error("Error getting user dashboard roles:", error);
      return ["read_only_viewer"]; // Default to minimal access
    }
  }

  /**
   * Get user's dashboard permissions summary
   */
  async getUserDashboardPermissions(userId: string): Promise<{
    roles: AdminDashboardRole[];
    modules: Record<DashboardModule, DashboardAction[]>;
    widgets: Record<WidgetCategory, DashboardAction[]>;
    globalPermissions: DashboardAction[];
    restrictions: any;
  }> {
    const roles = await this.getUserDashboardRoles(userId);
    const modules: Record<string, DashboardAction[]> = {};
    const widgets: Record<string, DashboardAction[]> = {};
    const globalPermissions = new Set<DashboardAction>();
    let restrictions = {};

    // Aggregate permissions from all roles
    for (const role of roles) {
      const config = this.roleConfigurations.get(role);
      if (config) {
        // Aggregate module permissions
        Object.entries(config.modules).forEach(([module, actions]) => {
          if (!modules[module]) modules[module] = [];
          modules[module] = [...new Set([...modules[module], ...actions])];
        });

        // Aggregate widget permissions
        Object.entries(config.widgets).forEach(([widget, actions]) => {
          if (!widgets[widget]) widgets[widget] = [];
          widgets[widget] = [...new Set([...widgets[widget], ...actions])];
        });

        // Aggregate global permissions
        config.globalPermissions.forEach(permission =>
          globalPermissions.add(permission)
        );

        // Take most restrictive settings (except for master_admin)
        if (role === "master_admin") {
          restrictions = config.restrictions;
        } else if (!restrictions || Object.keys(restrictions).length === 0) {
          restrictions = config.restrictions;
        }
      }
    }

    return {
      roles,
      modules: modules as Record<DashboardModule, DashboardAction[]>,
      widgets: widgets as Record<WidgetCategory, DashboardAction[]>,
      globalPermissions: Array.from(globalPermissions),
      restrictions,
    };
  }

  /**
   * Validate user session and restrictions
   */
  async validateUserSession(userId: string): Promise<{
    valid: boolean;
    reason?: string;
    restrictions?: any;
  }> {
    try {
      const permissions = await this.getUserDashboardPermissions(userId);
      const { restrictions } = permissions;

      // Check time restrictions
      if (restrictions.timeRestrictions) {
        const now = new Date();
        const currentHour = now.getHours();

        if (!restrictions.timeRestrictions.allowedHours.includes(currentHour)) {
          return {
            valid: false,
            reason: "Access not allowed during current time period",
            restrictions,
          };
        }
      }

      // Check concurrent sessions (would need to be implemented with session tracking)
      // This is a placeholder for actual session validation logic

      return {
        valid: true,
        restrictions,
      };
    } catch (error) {
      console.error("Error validating user session:", error);
      return {
        valid: false,
        reason: "Session validation failed",
      };
    }
  }

  /**
   * Log dashboard access attempt
   */
  async logDashboardAccess(
    userId: string,
    module: DashboardModule,
    action: DashboardAction,
    success: boolean,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await this.rbacService.logSecurityEvent(
        userId,
        userId,
        `dashboard_${action}`,
        "admin_dashboard",
        module,
        undefined,
        { module, action, success },
        ipAddress,
        userAgent,
        undefined,
        success
      );
    } catch (error) {
      console.error("Error logging dashboard access:", error);
    }
  }

  /**
   * Get role configuration
   */
  getRoleConfiguration(
    role: AdminDashboardRole
  ): AdminDashboardRoleConfig | undefined {
    return this.roleConfigurations.get(role);
  }

  /**
   * Get all available dashboard roles
   */
  getAllDashboardRoles(): AdminDashboardRole[] {
    return Array.from(this.roleConfigurations.keys());
  }

  /**
   * Check if user is platform owner (master admin)
   */
  async isPlatformOwner(userId: string): Promise<boolean> {
    try {
      return await this.rbacService.hasRole(userId, "super_admin");
    } catch (error) {
      console.error("Error checking platform owner status:", error);
      return false;
    }
  }
}

// Export singleton instance
export const adminDashboardRBAC = new AdminDashboardRBACService();
