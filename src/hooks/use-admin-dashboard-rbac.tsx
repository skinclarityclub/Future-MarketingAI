"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import {
  AdminDashboardRole,
  DashboardModule,
  DashboardAction,
  WidgetCategory,
  AdminDashboardRoleConfig,
  adminDashboardRBAC,
} from "@/lib/rbac/admin-dashboard-rbac";

/**
 * Dashboard Access Permissions Interface
 */
export interface DashboardPermissions {
  roles: AdminDashboardRole[];
  modules: Record<DashboardModule, DashboardAction[]>;
  widgets: Record<WidgetCategory, DashboardAction[]>;
  globalPermissions: DashboardAction[];
  restrictions: any;
  isLoading: boolean;
  isPlatformOwner: boolean;
}

/**
 * Session Validation Interface
 */
export interface SessionValidation {
  valid: boolean;
  reason?: string;
  restrictions?: any;
}

/**
 * Admin Dashboard RBAC Hook
 * Provides access control functionality for Master Command Center components
 */
export function useAdminDashboardRBAC() {
  const user = useUser();
  const [permissions, setPermissions] = useState<DashboardPermissions>({
    roles: [],
    modules: {} as Record<DashboardModule, DashboardAction[]>,
    widgets: {} as Record<WidgetCategory, DashboardAction[]>,
    globalPermissions: [],
    restrictions: {},
    isLoading: true,
    isPlatformOwner: false,
  });
  const [sessionValidation, setSessionValidation] = useState<SessionValidation>(
    {
      valid: false,
    }
  );

  /**
   * Load user permissions
   */
  const loadPermissions = useCallback(async () => {
    if (!user?.id) {
      setPermissions(prev => ({
        ...prev,
        isLoading: false,
        roles: [],
        modules: {} as Record<DashboardModule, DashboardAction[]>,
        widgets: {} as Record<WidgetCategory, DashboardAction[]>,
        globalPermissions: [],
        isPlatformOwner: false,
      }));
      return;
    }

    try {
      setPermissions(prev => ({ ...prev, isLoading: true }));

      // Get user permissions and check if platform owner
      const [userPermissions, isPlatformOwner] = await Promise.all([
        adminDashboardRBAC.getUserDashboardPermissions(user.id),
        adminDashboardRBAC.isPlatformOwner(user.id),
      ]);

      setPermissions({
        ...userPermissions,
        isLoading: false,
        isPlatformOwner,
      });

      // Validate session
      const validation = await adminDashboardRBAC.validateUserSession(user.id);
      setSessionValidation(validation);
    } catch (error) {
      console.error("Error loading dashboard permissions:", error);
      setPermissions(prev => ({
        ...prev,
        isLoading: false,
        roles: ["read_only_viewer"], // Default to minimal access on error
        isPlatformOwner: false,
      }));
      setSessionValidation({
        valid: false,
        reason: "Failed to load permissions",
      });
    }
  }, [user?.id]);

  // Load permissions when user changes
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  /**
   * Check if user has access to a specific module
   */
  const hasModuleAccess = useCallback(
    (module: DashboardModule, action: DashboardAction = "view"): boolean => {
      if (!user?.id || !sessionValidation.valid) return false;
      return permissions.modules[module]?.includes(action) || false;
    },
    [user?.id, permissions.modules, sessionValidation.valid]
  );

  /**
   * Check if user has access to a specific widget
   */
  const hasWidgetAccess = useCallback(
    (widget: WidgetCategory, action: DashboardAction = "view"): boolean => {
      if (!user?.id || !sessionValidation.valid) return false;
      return permissions.widgets[widget]?.includes(action) || false;
    },
    [user?.id, permissions.widgets, sessionValidation.valid]
  );

  /**
   * Check if user has a global permission
   */
  const hasGlobalPermission = useCallback(
    (action: DashboardAction): boolean => {
      if (!user?.id || !sessionValidation.valid) return false;
      return permissions.globalPermissions.includes(action);
    },
    [user?.id, permissions.globalPermissions, sessionValidation.valid]
  );

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback(
    (role: AdminDashboardRole): boolean => {
      if (!user?.id || !sessionValidation.valid) return false;
      return permissions.roles.includes(role);
    },
    [user?.id, permissions.roles, sessionValidation.valid]
  );

  /**
   * Get user's highest privilege role
   */
  const getHighestRole = useCallback((): AdminDashboardRole | null => {
    if (
      !user?.id ||
      !sessionValidation.valid ||
      permissions.roles.length === 0
    ) {
      return null;
    }

    // Role hierarchy (highest to lowest)
    const roleHierarchy: AdminDashboardRole[] = [
      "master_admin",
      "technical_admin",
      "operations_admin",
      "business_admin",
      "compliance_admin",
      "read_only_viewer",
    ];

    for (const role of roleHierarchy) {
      if (permissions.roles.includes(role)) {
        return role;
      }
    }

    return "read_only_viewer";
  }, [user?.id, permissions.roles, sessionValidation.valid]);

  /**
   * Get role configuration for a specific role
   */
  const getRoleConfig = useCallback(
    (role: AdminDashboardRole): AdminDashboardRoleConfig | undefined => {
      return adminDashboardRBAC.getRoleConfiguration(role);
    },
    []
  );

  /**
   * Log dashboard access attempt
   */
  const logAccess = useCallback(
    async (
      module: DashboardModule,
      action: DashboardAction,
      success: boolean = true
    ): Promise<void> => {
      if (!user?.id) return;

      try {
        await adminDashboardRBAC.logDashboardAccess(
          user.id,
          module,
          action,
          success,
          // You could get IP address from headers if available
          undefined,
          navigator.userAgent
        );
      } catch (error) {
        console.error("Error logging dashboard access:", error);
      }
    },
    [user?.id]
  );

  /**
   * Check if current time is within allowed access hours
   */
  const isWithinAllowedHours = useCallback((): boolean => {
    if (!permissions.restrictions?.timeRestrictions) return true;

    const now = new Date();
    const currentHour = now.getHours();

    return permissions.restrictions.timeRestrictions.allowedHours.includes(
      currentHour
    );
  }, [permissions.restrictions]);

  /**
   * Get formatted role display name
   */
  const getRoleDisplayName = useCallback(
    (role: AdminDashboardRole): string => {
      const config = getRoleConfig(role);
      return (
        config?.name ||
        role.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())
      );
    },
    [getRoleConfig]
  );

  /**
   * Check if user can perform dangerous operations
   */
  const canPerformDangerousOperations = useCallback((): boolean => {
    return (
      hasGlobalPermission("control") ||
      hasGlobalPermission("system_admin") ||
      permissions.isPlatformOwner
    );
  }, [hasGlobalPermission, permissions.isPlatformOwner]);

  /**
   * Get user access summary for display
   */
  const getAccessSummary = useCallback(() => {
    const highestRole = getHighestRole();
    const roleConfig = highestRole ? getRoleConfig(highestRole) : null;

    return {
      primaryRole: highestRole,
      roleName: highestRole ? getRoleDisplayName(highestRole) : "No Access",
      description: roleConfig?.description || "No dashboard access",
      accessLevel: permissions.isPlatformOwner
        ? "Platform Owner"
        : hasRole("master_admin")
          ? "Full Access"
          : hasRole("technical_admin")
            ? "Technical Access"
            : hasRole("business_admin")
              ? "Business Access"
              : hasRole("operations_admin")
                ? "Operations Access"
                : hasRole("compliance_admin")
                  ? "Compliance Access"
                  : "Read Only",
      moduleCount: Object.keys(permissions.modules).length,
      widgetCount: Object.keys(permissions.widgets).length,
      canExport: hasGlobalPermission("export"),
      canConfigure: hasGlobalPermission("configure"),
      canControl: canPerformDangerousOperations(),
      sessionValid: sessionValidation.valid,
      sessionReason: sessionValidation.reason,
      restrictions: permissions.restrictions,
    };
  }, [
    getHighestRole,
    getRoleConfig,
    getRoleDisplayName,
    permissions,
    hasRole,
    hasGlobalPermission,
    canPerformDangerousOperations,
    sessionValidation,
  ]);

  return {
    // Core permissions data
    permissions,
    sessionValidation,

    // Permission checking functions
    hasModuleAccess,
    hasWidgetAccess,
    hasGlobalPermission,
    hasRole,

    // Utility functions
    getHighestRole,
    getRoleConfig,
    getRoleDisplayName,
    logAccess,
    isWithinAllowedHours,
    canPerformDangerousOperations,
    getAccessSummary,

    // Convenience flags
    isLoading: permissions.isLoading,
    isAuthenticated: !!user?.id,
    isPlatformOwner: permissions.isPlatformOwner,
    hasAnyAccess: permissions.roles.length > 0 && sessionValidation.valid,

    // Actions
    refreshPermissions: loadPermissions,
  };
}

/**
 * Higher-Order Component for Dashboard Access Control
 */
export function withAdminDashboardAccess<P extends object>(
  Component: React.ComponentType<P>,
  requiredModule?: DashboardModule,
  requiredAction: DashboardAction = "view",
  fallback?: React.ComponentType<any>
) {
  return function AdminDashboardAccessWrapper(props: P) {
    const { hasModuleAccess, isLoading, hasAnyAccess } =
      useAdminDashboardRBAC();

    if (isLoading) {
      return null; // This should be handled in the consuming component
    }

    if (!hasAnyAccess) {
      if (fallback) {
        const FallbackComponent = fallback;
        return <FallbackComponent {...props} />;
      }

      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
            <p className="text-gray-500 mt-2">
              You don't have permission to access this dashboard.
            </p>
          </div>
        </div>
      );
    }

    if (requiredModule && !hasModuleAccess(requiredModule, requiredAction)) {
      if (fallback) {
        const FallbackComponent = fallback;
        return <FallbackComponent {...props} />;
      }

      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">
              Insufficient Permissions
            </h3>
            <p className="text-gray-500 mt-2">
              You need {requiredAction} access to{" "}
              {requiredModule.replace("_", " ")} module.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
