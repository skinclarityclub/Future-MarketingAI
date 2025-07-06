import { createBrowserClient } from "@supabase/ssr";

// Types based on existing migration 025_user_roles_system.sql
export type UserRoleType =
  | "super_admin"
  | "admin"
  | "compliance_officer"
  | "security_admin"
  | "auditor"
  | "risk_manager"
  | "executive"
  | "manager"
  | "analyst"
  | "user";

export interface UserRole {
  id: string;
  user_id: string;
  role: UserRoleType;
  assigned_by?: string;
  assigned_at: Date;
  expires_at?: Date;
  is_active: boolean;
  scope_restrictions: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface RolePermission {
  id: string;
  role: UserRoleType;
  resource: string;
  action: string;
  conditions: Record<string, any>;
  created_at: Date;
}

export interface SecurityAuditLog {
  id: string;
  user_id?: string;
  actor_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  error_message?: string;
  timestamp: Date;
  session_id?: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token?: string;
  ip_address?: string;
  user_agent?: string;
  login_at: Date;
  logout_at?: Date;
  is_active: boolean;
  last_activity: Date;
  created_at: Date;
}

/**
 * Enterprise RBAC Service
 * Manages roles, permissions, and access control for the BI Dashboard
 */
export class RBACService {
  private supabase: any;

  constructor(_server = false) {
    // For demo purposes, always use browser client
    this.supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // ===== USER ROLE MANAGEMENT =====

  /**
   * Get all roles for a user
   */
  async getUserRoles(userId: string): Promise<UserRole[]> {
    const { data, error } = await this.supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user roles: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Assign a role to a user
   */
  async assignRole(
    userId: string,
    role: UserRoleType,
    assignedBy: string,
    expiresAt?: Date,
    scopeRestrictions?: Record<string, any>
  ): Promise<UserRole> {
    const roleData = {
      user_id: userId,
      role,
      assigned_by: assignedBy,
      expires_at: expiresAt?.toISOString(),
      scope_restrictions: scopeRestrictions || {},
      is_active: true,
    };

    const { data, error } = await this.supabase
      .from("user_roles")
      .insert(roleData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to assign role: ${error.message}`);
    }

    // Log the role assignment
    await this.logSecurityEvent(
      userId,
      assignedBy,
      "role_assigned",
      "user_roles",
      data.id,
      undefined,
      roleData
    );

    return data;
  }

  /**
   * Revoke a role from a user
   */
  async revokeRole(roleId: string, revokedBy: string): Promise<void> {
    // Get current role data for logging
    const { data: currentRole } = await this.supabase
      .from("user_roles")
      .select("*")
      .eq("id", roleId)
      .single();

    const { error } = await this.supabase
      .from("user_roles")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", roleId);

    if (error) {
      throw new Error(`Failed to revoke role: ${error.message}`);
    }

    // Log the role revocation
    if (currentRole) {
      await this.logSecurityEvent(
        currentRole.user_id,
        revokedBy,
        "role_revoked",
        "user_roles",
        roleId,
        currentRole,
        { is_active: false }
      );
    }
  }

  /**
   * Check if user has a specific role
   */
  async hasRole(userId: string, role: UserRoleType): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", role)
      .eq("is_active", true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .limit(1);

    if (error) {
      console.error("Error checking user role:", error);
      return false;
    }

    return data && data.length > 0;
  }

  /**
   * Get highest priority role for a user
   */
  async getUserHighestRole(userId: string): Promise<UserRoleType | null> {
    const roles = await this.getUserRoles(userId);

    if (!roles.length) return null;

    // Role hierarchy (highest to lowest priority)
    const roleHierarchy: UserRoleType[] = [
      "super_admin",
      "admin",
      "security_admin",
      "compliance_officer",
      "risk_manager",
      "auditor",
      "executive",
      "manager",
      "analyst",
      "user",
    ];

    for (const hierarchyRole of roleHierarchy) {
      const hasThisRole = roles.some(
        r =>
          r.role === hierarchyRole &&
          r.is_active &&
          (!r.expires_at || new Date(r.expires_at) > new Date())
      );

      if (hasThisRole) return hierarchyRole;
    }

    return null;
  }

  // ===== PERMISSION MANAGEMENT =====

  /**
   * Get all permissions for a role
   */
  async getRolePermissions(role: UserRoleType): Promise<RolePermission[]> {
    const { data, error } = await this.supabase
      .from("role_permissions")
      .select("*")
      .eq("role", role)
      .order("resource", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch role permissions: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get all permissions for a user (across all their roles)
   */
  async getUserPermissions(userId: string): Promise<RolePermission[]> {
    const userRoles = await this.getUserRoles(userId);
    const activeRoles = userRoles
      .filter(
        r =>
          r.is_active && (!r.expires_at || new Date(r.expires_at) > new Date())
      )
      .map(r => r.role);

    if (!activeRoles.length) return [];

    const { data, error } = await this.supabase
      .from("role_permissions")
      .select("*")
      .in("role", activeRoles)
      .order("resource", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch user permissions: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Check if user has a specific permission
   */
  async hasPermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);

    return permissions.some(
      p => p.resource === resource && p.action === action
    );
  }

  /**
   * Check if user can access a resource with conditions
   */
  async canAccess(
    userId: string,
    resource: string,
    action: string,
    context?: Record<string, any>
  ): Promise<{
    allowed: boolean;
    reason?: string;
    conditions?: Record<string, any>;
  }> {
    const permissions = await this.getUserPermissions(userId);

    const matchingPermissions = permissions.filter(
      p => p.resource === resource && p.action === action
    );

    if (!matchingPermissions.length) {
      return {
        allowed: false,
        reason: "No matching permission found",
      };
    }

    // Check conditions if provided
    for (const permission of matchingPermissions) {
      if (this.evaluateConditions(permission.conditions, context)) {
        return {
          allowed: true,
          conditions: permission.conditions,
        };
      }
    }

    return {
      allowed: matchingPermissions.some(
        p => !p.conditions || Object.keys(p.conditions).length === 0
      ),
      reason: "Permission conditions not met",
    };
  }

  /**
   * Grant permission to a role
   */
  async grantPermission(
    role: UserRoleType,
    resource: string,
    action: string,
    conditions?: Record<string, any>
  ): Promise<RolePermission> {
    const permissionData = {
      role,
      resource,
      action,
      conditions: conditions || {},
    };

    const { data, error } = await this.supabase
      .from("role_permissions")
      .insert(permissionData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to grant permission: ${error.message}`);
    }

    return data;
  }

  /**
   * Revoke permission from a role
   */
  async revokePermission(
    role: UserRoleType,
    resource: string,
    action: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from("role_permissions")
      .delete()
      .eq("role", role)
      .eq("resource", resource)
      .eq("action", action);

    if (error) {
      throw new Error(`Failed to revoke permission: ${error.message}`);
    }
  }

  // ===== SESSION MANAGEMENT =====

  /**
   * Create a user session
   */
  async createSession(
    userId: string,
    sessionToken: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<UserSession> {
    const sessionData = {
      user_id: userId,
      session_token: sessionToken,
      ip_address: ipAddress,
      user_agent: userAgent,
      is_active: true,
      last_activity: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from("user_sessions")
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }

    return data;
  }

  /**
   * Get active sessions for a user
   */
  async getUserSessions(userId: string): Promise<UserSession[]> {
    const { data, error } = await this.supabase
      .from("user_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("last_activity", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user sessions: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(sessionId: string): Promise<void> {
    const { error } = await this.supabase
      .from("user_sessions")
      .update({
        last_activity: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (error) {
      console.error("Failed to update session activity:", error);
    }
  }

  /**
   * Terminate a session
   */
  async terminateSession(sessionId: string): Promise<void> {
    const { error } = await this.supabase
      .from("user_sessions")
      .update({
        is_active: false,
        logout_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (error) {
      throw new Error(`Failed to terminate session: ${error.message}`);
    }
  }

  // ===== AUDIT LOGGING =====

  /**
   * Log a security event
   */
  async logSecurityEvent(
    userId: string | undefined,
    actorId: string | undefined,
    action: string,
    resourceType?: string,
    resourceId?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
    sessionId?: string,
    success = true,
    errorMessage?: string
  ): Promise<void> {
    const logData = {
      user_id: userId,
      actor_id: actorId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: ipAddress,
      user_agent: userAgent,
      session_id: sessionId,
      success,
      error_message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    const { error } = await this.supabase
      .from("security_audit_log")
      .insert(logData);

    if (error) {
      console.error("Failed to log security event:", error);
    }
  }

  /**
   * Get audit logs with filters
   */
  async getAuditLogs(
    userId?: string,
    action?: string,
    resourceType?: string,
    startDate?: Date,
    endDate?: Date,
    limit = 100
  ): Promise<SecurityAuditLog[]> {
    let query = this.supabase.from("security_audit_log").select("*");

    if (userId) query = query.eq("user_id", userId);
    if (action) query = query.eq("action", action);
    if (resourceType) query = query.eq("resource_type", resourceType);
    if (startDate) query = query.gte("timestamp", startDate.toISOString());
    if (endDate) query = query.lte("timestamp", endDate.toISOString());

    query = query.order("timestamp", { ascending: false }).limit(limit);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch audit logs: ${error.message}`);
    }

    return data || [];
  }

  // ===== UTILITY METHODS =====

  /**
   * Evaluate permission conditions against context
   */
  private evaluateConditions(
    conditions: Record<string, any>,
    context?: Record<string, any>
  ): boolean {
    if (!conditions || Object.keys(conditions).length === 0) {
      return true;
    }

    if (!context) {
      return false;
    }

    // Simple condition evaluation - can be extended for complex logic
    for (const [key, value] of Object.entries(conditions)) {
      if (context[key] !== value) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if role is administrative
   */
  isAdministrativeRole(role: UserRoleType): boolean {
    return [
      "super_admin",
      "admin",
      "security_admin",
      "compliance_officer",
    ].includes(role);
  }

  /**
   * Check if role has executive privileges
   */
  isExecutiveRole(role: UserRoleType): boolean {
    return ["super_admin", "admin", "executive", "risk_manager"].includes(role);
  }

  /**
   * Get all available roles
   */
  getAllRoles(): UserRoleType[] {
    return [
      "super_admin",
      "admin",
      "compliance_officer",
      "security_admin",
      "auditor",
      "risk_manager",
      "executive",
      "manager",
      "analyst",
      "user",
    ];
  }

  /**
   * Get role description
   */
  getRoleDescription(role: UserRoleType): string {
    const descriptions: Record<UserRoleType, string> = {
      super_admin: "Full system access with all administrative privileges",
      admin:
        "Administrative access with user and system management capabilities",
      compliance_officer: "SOC 2 compliance management and audit oversight",
      security_admin: "Security controls management and monitoring",
      auditor: "Audit and review access with compliance reporting",
      risk_manager: "Risk assessment and management with executive reporting",
      executive: "Executive dashboard access with strategic insights",
      manager: "Team management access with operational reporting",
      analyst: "Data analysis and reporting capabilities",
      user: "Standard authenticated user with basic dashboard access",
    };

    return descriptions[role] || "Unknown role";
  }
}

// Export singleton instance for server-side usage
export const rbacService = new RBACService(true);

// Export factory function for client-side usage
export const createRBACService = () => new RBACService(false);
