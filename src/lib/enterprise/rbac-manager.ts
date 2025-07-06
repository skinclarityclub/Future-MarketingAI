/**
 * Enterprise RBAC Manager
 * Task 103.10: Enterprise Features and System Integration
 *
 * Features:
 * - Multi-user access control
 * - Role-based permissions
 * - Team collaboration
 * - White-label management
 * - Advanced reporting permissions
 * - API access control
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  roles: string[];
  teams: string[];
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  metadata: Record<string, any>;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  scope?: "own" | "team" | "organization";
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator:
    | "equals"
    | "not_equals"
    | "in"
    | "not_in"
    | "greater_than"
    | "less_than";
  value: any;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: string[];
  roles: string[];
  isActive: boolean;
  createdAt: Date;
  metadata: Record<string, any>;
}

export interface AccessRequest {
  id: string;
  userId: string;
  resource: string;
  action: string;
  context: Record<string, any>;
  timestamp: Date;
  granted: boolean;
  reason?: string;
}

export class EnterpriseRBACManager {
  private static instance: EnterpriseRBACManager;
  private users: Map<string, User> = new Map();
  private roles: Map<string, Role> = new Map();
  private teams: Map<string, Team> = new Map();
  private accessLog: AccessRequest[] = [];

  private constructor() {
    this.initializeSystemRoles();
  }

  public static getInstance(): EnterpriseRBACManager {
    if (!EnterpriseRBACManager.instance) {
      EnterpriseRBACManager.instance = new EnterpriseRBACManager();
    }
    return EnterpriseRBACManager.instance;
  }

  private initializeSystemRoles(): void {
    // Super Admin Role
    this.roles.set("super_admin", {
      id: "super_admin",
      name: "Super Administrator",
      description: "Full system access with all permissions",
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: [
        { id: "all", resource: "*", action: "*", scope: "organization" },
      ],
    });

    // Admin Role
    this.roles.set("admin", {
      id: "admin",
      name: "Administrator",
      description: "Organization-wide administrative access",
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: [
        {
          id: "user_read",
          resource: "users",
          action: "read",
          scope: "organization",
        },
        {
          id: "user_create",
          resource: "users",
          action: "create",
          scope: "organization",
        },
        {
          id: "user_update",
          resource: "users",
          action: "update",
          scope: "organization",
        },
        {
          id: "team_manage",
          resource: "teams",
          action: "*",
          scope: "organization",
        },
        {
          id: "content_manage",
          resource: "content",
          action: "*",
          scope: "organization",
        },
        {
          id: "analytics_read",
          resource: "analytics",
          action: "read",
          scope: "organization",
        },
        {
          id: "settings_manage",
          resource: "settings",
          action: "*",
          scope: "organization",
        },
      ],
    });

    // Manager Role
    this.roles.set("manager", {
      id: "manager",
      name: "Team Manager",
      description: "Team-level management and content oversight",
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: [
        { id: "team_read", resource: "teams", action: "read", scope: "team" },
        {
          id: "content_manage_team",
          resource: "content",
          action: "*",
          scope: "team",
        },
        {
          id: "analytics_team",
          resource: "analytics",
          action: "read",
          scope: "team",
        },
        {
          id: "user_read_team",
          resource: "users",
          action: "read",
          scope: "team",
        },
        {
          id: "campaigns_manage",
          resource: "campaigns",
          action: "*",
          scope: "team",
        },
      ],
    });

    // Content Creator Role
    this.roles.set("content_creator", {
      id: "content_creator",
      name: "Content Creator",
      description: "Create and manage own content",
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: [
        {
          id: "content_create",
          resource: "content",
          action: "create",
          scope: "own",
        },
        {
          id: "content_read_own",
          resource: "content",
          action: "read",
          scope: "own",
        },
        {
          id: "content_update_own",
          resource: "content",
          action: "update",
          scope: "own",
        },
        {
          id: "content_delete_own",
          resource: "content",
          action: "delete",
          scope: "own",
        },
        {
          id: "analytics_own",
          resource: "analytics",
          action: "read",
          scope: "own",
        },
        {
          id: "profile_update",
          resource: "profile",
          action: "update",
          scope: "own",
        },
      ],
    });

    // Viewer Role
    this.roles.set("viewer", {
      id: "viewer",
      name: "Viewer",
      description: "Read-only access to content and analytics",
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: [
        {
          id: "content_read",
          resource: "content",
          action: "read",
          scope: "team",
        },
        {
          id: "analytics_read",
          resource: "analytics",
          action: "read",
          scope: "team",
        },
        {
          id: "profile_read",
          resource: "profile",
          action: "read",
          scope: "own",
        },
      ],
    });
  }

  // User Management
  public async createUser(
    userData: Omit<User, "id" | "createdAt" | "lastLogin">
  ): Promise<User> {
    const user: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      lastLogin: null,
    };

    this.users.set(user.id, user);
    return user;
  }

  public async updateUser(
    userId: string,
    updates: Partial<User>
  ): Promise<User | null> {
    const user = this.users.get(userId);
    if (!user) return null;

    const updatedUser = { ...user, ...updates };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  public async deleteUser(userId: string): Promise<boolean> {
    return this.users.delete(userId);
  }

  public getUser(userId: string): User | null {
    return this.users.get(userId) || null;
  }

  public getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // Role Management
  public async createRole(
    roleData: Omit<Role, "id" | "createdAt" | "updatedAt">
  ): Promise<Role> {
    const role: Role = {
      ...roleData,
      id: `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.roles.set(role.id, role);
    return role;
  }

  public async updateRole(
    roleId: string,
    updates: Partial<Role>
  ): Promise<Role | null> {
    const role = this.roles.get(roleId);
    if (!role || role.isSystem) return null;

    const updatedRole = { ...role, ...updates, updatedAt: new Date() };
    this.roles.set(roleId, updatedRole);
    return updatedRole;
  }

  public async deleteRole(roleId: string): Promise<boolean> {
    const role = this.roles.get(roleId);
    if (!role || role.isSystem) return false;

    return this.roles.delete(roleId);
  }

  public getRole(roleId: string): Role | null {
    return this.roles.get(roleId) || null;
  }

  public getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  // Team Management
  public async createTeam(
    teamData: Omit<Team, "id" | "createdAt">
  ): Promise<Team> {
    const team: Team = {
      ...teamData,
      id: `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.teams.set(team.id, team);
    return team;
  }

  public async updateTeam(
    teamId: string,
    updates: Partial<Team>
  ): Promise<Team | null> {
    const team = this.teams.get(teamId);
    if (!team) return null;

    const updatedTeam = { ...team, ...updates };
    this.teams.set(teamId, updatedTeam);
    return updatedTeam;
  }

  public async addUserToTeam(userId: string, teamId: string): Promise<boolean> {
    const team = this.teams.get(teamId);
    const user = this.users.get(userId);

    if (!team || !user) return false;

    if (!team.members.includes(userId)) {
      team.members.push(userId);
    }

    if (!user.teams.includes(teamId)) {
      user.teams.push(teamId);
    }

    return true;
  }

  public async removeUserFromTeam(
    userId: string,
    teamId: string
  ): Promise<boolean> {
    const team = this.teams.get(teamId);
    const user = this.users.get(userId);

    if (!team || !user) return false;

    team.members = team.members.filter(id => id !== userId);
    user.teams = user.teams.filter(id => id !== teamId);

    return true;
  }

  // Permission Checking
  public async checkPermission(
    userId: string,
    resource: string,
    action: string,
    context: Record<string, any> = {}
  ): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user || !user.isActive) {
      this.logAccess(
        userId,
        resource,
        action,
        context,
        false,
        "User not found or inactive"
      );
      return false;
    }

    // Check user roles
    for (const roleId of user.roles) {
      const role = this.roles.get(roleId);
      if (!role) continue;

      for (const permission of role.permissions) {
        if (
          this.matchesPermission(permission, resource, action, userId, context)
        ) {
          this.logAccess(userId, resource, action, context, true);
          return true;
        }
      }
    }

    // Check team roles
    for (const teamId of user.teams) {
      const team = this.teams.get(teamId);
      if (!team || !team.isActive) continue;

      for (const roleId of team.roles) {
        const role = this.roles.get(roleId);
        if (!role) continue;

        for (const permission of role.permissions) {
          if (
            this.matchesPermission(permission, resource, action, userId, {
              ...context,
              teamId,
            })
          ) {
            this.logAccess(userId, resource, action, context, true);
            return true;
          }
        }
      }
    }

    this.logAccess(
      userId,
      resource,
      action,
      context,
      false,
      "No matching permissions"
    );
    return false;
  }

  private matchesPermission(
    permission: Permission,
    resource: string,
    action: string,
    userId: string,
    context: Record<string, any>
  ): boolean {
    // Check resource match
    if (permission.resource !== "*" && permission.resource !== resource) {
      return false;
    }

    // Check action match
    if (permission.action !== "*" && permission.action !== action) {
      return false;
    }

    // Check scope
    if (permission.scope) {
      if (!this.checkScope(permission.scope, userId, context)) {
        return false;
      }
    }

    // Check conditions
    if (permission.conditions) {
      for (const condition of permission.conditions) {
        if (!this.evaluateCondition(condition, context)) {
          return false;
        }
      }
    }

    return true;
  }

  private checkScope(
    scope: string,
    userId: string,
    context: Record<string, any>
  ): boolean {
    switch (scope) {
      case "own":
        return context.ownerId === userId || context.userId === userId;

      case "team":
        if (context.teamId) {
          const user = this.users.get(userId);
          return user ? user.teams.includes(context.teamId) : false;
        }
        return false;

      case "organization":
        return true;

      default:
        return false;
    }
  }

  private evaluateCondition(
    condition: PermissionCondition,
    context: Record<string, any>
  ): boolean {
    const fieldValue = context[condition.field];

    switch (condition.operator) {
      case "equals":
        return fieldValue === condition.value;

      case "not_equals":
        return fieldValue !== condition.value;

      case "in":
        return (
          Array.isArray(condition.value) && condition.value.includes(fieldValue)
        );

      case "not_in":
        return (
          Array.isArray(condition.value) &&
          !condition.value.includes(fieldValue)
        );

      case "greater_than":
        return fieldValue > condition.value;

      case "less_than":
        return fieldValue < condition.value;

      default:
        return false;
    }
  }

  // Access Logging
  private logAccess(
    userId: string,
    resource: string,
    action: string,
    context: Record<string, any>,
    granted: boolean,
    reason?: string
  ): void {
    const accessRequest: AccessRequest = {
      id: `access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      resource,
      action,
      context,
      timestamp: new Date(),
      granted,
      reason,
    };

    this.accessLog.push(accessRequest);

    // Keep only last 10000 entries
    if (this.accessLog.length > 10000) {
      this.accessLog = this.accessLog.slice(-10000);
    }
  }

  public getAccessLog(filters?: {
    userId?: string;
    resource?: string;
    action?: string;
    granted?: boolean;
    startDate?: Date;
    endDate?: Date;
  }): AccessRequest[] {
    let filtered = this.accessLog;

    if (filters) {
      if (filters.userId) {
        filtered = filtered.filter(log => log.userId === filters.userId);
      }
      if (filters.resource) {
        filtered = filtered.filter(log => log.resource === filters.resource);
      }
      if (filters.action) {
        filtered = filtered.filter(log => log.action === filters.action);
      }
      if (filters.granted !== undefined) {
        filtered = filtered.filter(log => log.granted === filters.granted);
      }
      if (filters.startDate) {
        filtered = filtered.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filtered = filtered.filter(log => log.timestamp <= filters.endDate!);
      }
    }

    return filtered.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  // User Session Management
  public async recordLogin(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.lastLogin = new Date();
      this.users.set(userId, user);
    }
  }

  // Bulk Operations
  public async assignRoleToUsers(
    roleId: string,
    userIds: string[]
  ): Promise<{ success: string[]; failed: string[] }> {
    const result = { success: [], failed: [] };

    for (const userId of userIds) {
      const user = this.users.get(userId);
      if (user && !user.roles.includes(roleId)) {
        user.roles.push(roleId);
        this.users.set(userId, user);
        result.success.push(userId);
      } else {
        result.failed.push(userId);
      }
    }

    return result;
  }

  public async removeRoleFromUsers(
    roleId: string,
    userIds: string[]
  ): Promise<{ success: string[]; failed: string[] }> {
    const result = { success: [], failed: [] };

    for (const userId of userIds) {
      const user = this.users.get(userId);
      if (user && user.roles.includes(roleId)) {
        user.roles = user.roles.filter(id => id !== roleId);
        this.users.set(userId, user);
        result.success.push(userId);
      } else {
        result.failed.push(userId);
      }
    }

    return result;
  }

  // Analytics and Reporting
  public getUsersByRole(roleId: string): User[] {
    return Array.from(this.users.values()).filter(user =>
      user.roles.includes(roleId)
    );
  }

  public getTeamMembers(teamId: string): User[] {
    const team = this.teams.get(teamId);
    if (!team) return [];

    return team.members
      .map(userId => this.users.get(userId))
      .filter(Boolean) as User[];
  }

  public getActiveUsers(): User[] {
    return Array.from(this.users.values()).filter(user => user.isActive);
  }

  public getInactiveUsers(): User[] {
    return Array.from(this.users.values()).filter(user => !user.isActive);
  }

  public getUserStats(): {
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
    recentLogins: number;
  } {
    const users = Array.from(this.users.values());
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const byRole: Record<string, number> = {};
    let recentLogins = 0;

    users.forEach(user => {
      user.roles.forEach(roleId => {
        byRole[roleId] = (byRole[roleId] || 0) + 1;
      });

      if (user.lastLogin && user.lastLogin > thirtyDaysAgo) {
        recentLogins++;
      }
    });

    return {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length,
      byRole,
      recentLogins,
    };
  }

  // Import/Export
  public exportConfiguration(): {
    users: User[];
    roles: Role[];
    teams: Team[];
    exportDate: Date;
  } {
    return {
      users: Array.from(this.users.values()),
      roles: Array.from(this.roles.values()),
      teams: Array.from(this.teams.values()),
      exportDate: new Date(),
    };
  }

  public async importConfiguration(config: {
    users?: User[];
    roles?: Role[];
    teams?: Team[];
  }): Promise<{ imported: number; errors: string[] }> {
    const errors: string[] = [];
    let imported = 0;

    try {
      if (config.roles) {
        for (const role of config.roles) {
          if (!role.isSystem) {
            this.roles.set(role.id, role);
            imported++;
          }
        }
      }

      if (config.teams) {
        for (const team of config.teams) {
          this.teams.set(team.id, team);
          imported++;
        }
      }

      if (config.users) {
        for (const user of config.users) {
          this.users.set(user.id, user);
          imported++;
        }
      }
    } catch (error) {
      errors.push(
        error instanceof Error ? error.message : "Unknown import error"
      );
    }

    return { imported, errors };
  }
}

// Export singleton instance
export const rbacManager = EnterpriseRBACManager.getInstance();
