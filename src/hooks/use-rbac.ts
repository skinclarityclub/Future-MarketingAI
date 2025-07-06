"use client";

import { useState, useEffect, useCallback } from "react";
import {
  createRBACService,
  UserRoleType,
  type UserRole,
  type RolePermission,
} from "@/lib/rbac/rbac-service";
import { createBrowserClient } from "@supabase/ssr";

interface RBACHookState {
  userId: string | null;
  roles: UserRole[];
  highestRole: UserRoleType | null;
  permissions: RolePermission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface RBACHookActions {
  checkPermission: (resource: string, action: string) => boolean;
  hasRole: (role: UserRoleType) => boolean;
  canAccess: (
    resource: string,
    action: string,
    context?: Record<string, any>
  ) => Promise<boolean>;
  isAdmin: () => boolean;
  isExecutive: () => boolean;
  refresh: () => Promise<void>;
}

export type UseRBACReturn = RBACHookState & RBACHookActions;

/**
 * React hook for RBAC functionality
 */
export function useRBAC(): UseRBACReturn {
  const [state, setState] = useState<RBACHookState>({
    userId: null,
    roles: [],
    highestRole: null,
    permissions: [],
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const rbacService = createRBACService();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadUserRBAC = useCallback(
    async (userId: string) => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const [userRoles, permissions] = await Promise.all([
          rbacService.getUserRoles(userId),
          rbacService.getUserPermissions(userId),
        ]);

        const highestRole = await rbacService.getUserHighestRole(userId);

        setState(prev => ({
          ...prev,
          userId,
          roles: userRoles,
          highestRole,
          permissions,
          isAuthenticated: true,
          isLoading: false,
        }));
      } catch (error) {
        console.error("Failed to load user RBAC data:", error);
        setState(prev => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Failed to load RBAC data",
          isLoading: false,
        }));
      }
    },
    [rbacService]
  );

  const refresh = useCallback(async () => {
    if (state.userId) {
      await loadUserRBAC(state.userId);
    }
  }, [state.userId, loadUserRBAC]);

  // Initialize and handle auth state changes
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && isMounted) {
          await loadUserRBAC(session.user.id);
        } else if (isMounted) {
          setState(prev => ({
            ...prev,
            userId: null,
            roles: [],
            highestRole: null,
            permissions: [],
            isAuthenticated: false,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        if (isMounted) {
          setState(prev => ({
            ...prev,
            error: "Failed to initialize authentication",
            isLoading: false,
          }));
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === "SIGNED_IN" && session?.user) {
        await loadUserRBAC(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setState(prev => ({
          ...prev,
          userId: null,
          roles: [],
          highestRole: null,
          permissions: [],
          isAuthenticated: false,
          isLoading: false,
        }));
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth, loadUserRBAC]);

  // RBAC action functions
  const checkPermission = useCallback(
    (resource: string, action: string): boolean => {
      return state.permissions.some(
        p => p.resource === resource && p.action === action
      );
    },
    [state.permissions]
  );

  const hasRole = useCallback(
    (role: UserRoleType): boolean => {
      return state.roles.some(r => r.role === role && r.is_active);
    },
    [state.roles]
  );

  const canAccess = useCallback(
    async (
      resource: string,
      action: string,
      context?: Record<string, any>
    ): Promise<boolean> => {
      if (!state.userId) return false;

      try {
        const result = await rbacService.canAccess(
          state.userId,
          resource,
          action,
          context
        );
        return result.allowed;
      } catch (error) {
        console.error("Failed to check access:", error);
        return false;
      }
    },
    [state.userId, rbacService]
  );

  const isAdmin = useCallback((): boolean => {
    return state.highestRole
      ? rbacService.isAdministrativeRole(state.highestRole)
      : false;
  }, [state.highestRole, rbacService]);

  const isExecutive = useCallback((): boolean => {
    return state.highestRole
      ? rbacService.isExecutiveRole(state.highestRole)
      : false;
  }, [state.highestRole, rbacService]);

  return {
    ...state,
    checkPermission,
    hasRole,
    canAccess,
    isAdmin,
    isExecutive,
    refresh,
  };
}

/**
 * Hook to check if user has specific permission
 */
export function usePermission(
  resource: string,
  action: string
): {
  hasPermission: boolean;
  isLoading: boolean;
  error: string | null;
} {
  const { checkPermission, isLoading, error } = useRBAC();

  return {
    hasPermission: checkPermission(resource, action),
    isLoading,
    error,
  };
}

/**
 * Hook to check if user has specific role
 */
export function useRole(role: UserRoleType): {
  hasRole: boolean;
  isLoading: boolean;
  error: string | null;
} {
  const { hasRole, isLoading, error } = useRBAC();

  return {
    hasRole: hasRole(role),
    isLoading,
    error,
  };
}

/**
 * Hook to check if user is admin
 */
export function useIsAdmin(): {
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
} {
  const { isAdmin, isLoading, error } = useRBAC();

  return {
    isAdmin: isAdmin(),
    isLoading,
    error,
  };
}

/**
 * Hook to check if user is executive
 */
export function useIsExecutive(): {
  isExecutive: boolean;
  isLoading: boolean;
  error: string | null;
} {
  const { isExecutive, isLoading, error } = useRBAC();

  return {
    isExecutive: isExecutive(),
    isLoading,
    error,
  };
}

/**
 * Hook for conditional access checking
 */
export function useConditionalAccess(
  resource: string,
  action: string,
  context?: Record<string, any>
): {
  canAccess: boolean | null; // null while loading
  isLoading: boolean;
  error: string | null;
  checkAccess: () => Promise<void>;
} {
  const {
    canAccess: checkCanAccess,
    isAuthenticated,
    isLoading: rbacLoading,
  } = useRBAC();
  const [state, setState] = useState<{
    canAccess: boolean | null;
    isLoading: boolean;
    error: string | null;
  }>({
    canAccess: null,
    isLoading: true,
    error: null,
  });

  const checkAccess = useCallback(async () => {
    if (!isAuthenticated) {
      setState({ canAccess: false, isLoading: false, error: null });
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await checkCanAccess(resource, action, context);
      setState({ canAccess: result, isLoading: false, error: null });
    } catch (error) {
      setState({
        canAccess: false,
        isLoading: false,
        error: error instanceof Error ? error.message : "Access check failed",
      });
    }
  }, [isAuthenticated, checkCanAccess, resource, action, context]);

  useEffect(() => {
    if (!rbacLoading) {
      checkAccess();
    }
  }, [rbacLoading, checkAccess]);

  return {
    ...state,
    checkAccess,
  };
}
