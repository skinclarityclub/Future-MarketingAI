import { NextRequest, NextResponse } from "next/server";
import { rbacService, UserRoleType } from "./rbac-service";

export interface RBACMiddlewareConfig {
  requireAuth?: boolean;
  requiredRoles?: UserRoleType[];
  requiredPermissions?: Array<{
    resource: string;
    action: string;
  }>;
  allowOwnerAccess?: boolean; // Allow access if user owns the resource
  getResourceId?: (req: NextRequest) => string; // Extract resource ID from request
}

export interface RBACContext {
  userId: string;
  roles: UserRoleType[];
  highestRole: UserRoleType | null;
  isAuthenticated: boolean;
  permissions: Array<{
    resource: string;
    action: string;
    conditions: Record<string, any>;
  }>;
}

/**
 * RBAC Middleware for Next.js API routes
 */
export function withRBAC(config: RBACMiddlewareConfig = {}) {
  return function (handler: Function) {
    return async function (req: NextRequest, ...args: any[]) {
      let session: any = null;
      try {
        // Get user from Supabase session
        const sessionResponse = await rbacService["supabase"].auth.getSession();
        session = sessionResponse.data.session;

        if (config.requireAuth !== false && !session?.user) {
          return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 }
          );
        }

        let rbacContext: RBACContext | null = null;

        if (session?.user) {
          const userId = session.user.id;
          const userRoles = await rbacService.getUserRoles(userId);
          const highestRole = await rbacService.getUserHighestRole(userId);
          const permissions = await rbacService.getUserPermissions(userId);

          rbacContext = {
            userId,
            roles: userRoles.map(r => r.role),
            highestRole,
            isAuthenticated: true,
            permissions: permissions.map(p => ({
              resource: p.resource,
              action: p.action,
              conditions: p.conditions,
            })),
          };

          // Check required roles
          if (config.requiredRoles?.length) {
            const hasRequiredRole = config.requiredRoles.some(role =>
              rbacContext!.roles.includes(role)
            );

            if (!hasRequiredRole) {
              return NextResponse.json(
                { error: "Insufficient role privileges" },
                { status: 403 }
              );
            }
          }

          // Check required permissions
          if (config.requiredPermissions?.length) {
            for (const { resource, action } of config.requiredPermissions) {
              const hasPermission = await rbacService.hasPermission(
                userId,
                resource,
                action
              );

              if (!hasPermission) {
                // Check owner access if configured
                if (config.allowOwnerAccess && config.getResourceId) {
                  const resourceId = config.getResourceId(req);
                  const context = { user_id: userId, resource_id: resourceId };

                  const access = await rbacService.canAccess(
                    userId,
                    resource,
                    action,
                    context
                  );
                  if (!access.allowed) {
                    return NextResponse.json(
                      {
                        error: `Insufficient permissions for ${resource}:${action}`,
                      },
                      { status: 403 }
                    );
                  }
                } else {
                  return NextResponse.json(
                    {
                      error: `Insufficient permissions for ${resource}:${action}`,
                    },
                    { status: 403 }
                  );
                }
              }
            }
          }

          // Log successful access
          await rbacService.logSecurityEvent(
            userId,
            userId,
            "api_access",
            "api_endpoint",
            req.url,
            undefined,
            {
              method: req.method,
              endpoint: req.url,
              roles: rbacContext.roles,
              permissions: rbacContext.permissions.length,
            },
            req.headers.get("x-forwarded-for") ||
              req.headers.get("x-real-ip") ||
              "unknown",
            req.headers.get("user-agent") || undefined
          );
        } else {
          rbacContext = {
            userId: "",
            roles: [],
            highestRole: null,
            isAuthenticated: false,
            permissions: [],
          };
        }

        // Add RBAC context to request
        (req as any).rbac = rbacContext;

        return handler(req, ...args);
      } catch (error) {
        console.error("RBAC middleware error:", error);

        // Log failed access
        if (session?.user) {
          await rbacService.logSecurityEvent(
            session.user.id,
            session.user.id,
            "api_access_failed",
            "api_endpoint",
            req.url,
            undefined,
            {
              error: error instanceof Error ? error.message : "Unknown error",
              method: req.method,
              endpoint: req.url,
            },
            req.headers.get("x-forwarded-for") ||
              req.headers.get("x-real-ip") ||
              "unknown",
            req.headers.get("user-agent") || undefined,
            undefined,
            false,
            error instanceof Error ? error.message : "Unknown error"
          );
        }

        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
      }
    };
  };
}

/**
 * Simple API route protection function
 */
export async function protectAPIRoute(
  req: NextRequest,
  requiredRoles: UserRoleType[]
) {
  try {
    const {
      data: { session },
    } = await rbacService["supabase"].auth.getSession();

    if (!session?.user) {
      return {
        allowed: false,
        reason: "Authentication required",
        user: null,
      };
    }

    const userId = session.user.id;
    const userRoles = await rbacService.getUserRoles(userId);
    const userRoleNames = userRoles.map(r => r.role);

    // Check if user has any of the required roles
    const hasRequiredRole = requiredRoles.some(role =>
      userRoleNames.includes(role)
    );

    if (!hasRequiredRole) {
      return {
        allowed: false,
        reason: `Requires one of: ${requiredRoles.join(", ")}`,
        user: { id: userId, roles: userRoleNames },
      };
    }

    return {
      allowed: true,
      reason: "Authorized",
      user: { id: userId, roles: userRoleNames },
    };
  } catch (error) {
    console.error("API route protection error:", error);
    return {
      allowed: false,
      reason: "Authentication error",
      user: null,
    };
  }
}

/**
 * Helper function to check if user has administrative access
 */
export async function requireAdmin(
  req: NextRequest
): Promise<RBACContext | null> {
  const {
    data: { session },
  } = await rbacService["supabase"].auth.getSession();

  if (!session?.user) return null;

  const userId = session.user.id;
  const highestRole = await rbacService.getUserHighestRole(userId);

  if (!highestRole || !rbacService.isAdministrativeRole(highestRole)) {
    return null;
  }

  const userRoles = await rbacService.getUserRoles(userId);
  const permissions = await rbacService.getUserPermissions(userId);

  return {
    userId,
    roles: userRoles.map(r => r.role),
    highestRole,
    isAuthenticated: true,
    permissions: permissions.map(p => ({
      resource: p.resource,
      action: p.action,
      conditions: p.conditions,
    })),
  };
}

/**
 * Helper function to check if user has executive access
 */
export async function requireExecutive(
  req: NextRequest
): Promise<RBACContext | null> {
  const {
    data: { session },
  } = await rbacService["supabase"].auth.getSession();

  if (!session?.user) return null;

  const userId = session.user.id;
  const highestRole = await rbacService.getUserHighestRole(userId);

  if (!highestRole || !rbacService.isExecutiveRole(highestRole)) {
    return null;
  }

  const userRoles = await rbacService.getUserRoles(userId);
  const permissions = await rbacService.getUserPermissions(userId);

  return {
    userId,
    roles: userRoles.map(r => r.role),
    highestRole,
    isAuthenticated: true,
    permissions: permissions.map(p => ({
      resource: p.resource,
      action: p.action,
      conditions: p.conditions,
    })),
  };
}

/**
 * Helper function to extract user ID from URL params
 */
export function extractUserIdFromUrl(req: NextRequest): string {
  const url = new URL(req.url);
  const pathSegments = url.pathname.split("/");
  const userIndex = pathSegments.findIndex(segment => segment === "users");

  if (userIndex !== -1 && userIndex + 1 < pathSegments.length) {
    return pathSegments[userIndex + 1];
  }

  return "";
}

/**
 * Helper function to extract resource ID from URL params
 */
export function extractResourceIdFromUrl(
  req: NextRequest,
  resourceType: string
): string {
  const url = new URL(req.url);
  const pathSegments = url.pathname.split("/");
  const resourceIndex = pathSegments.findIndex(
    segment => segment === resourceType
  );

  if (resourceIndex !== -1 && resourceIndex + 1 < pathSegments.length) {
    return pathSegments[resourceIndex + 1];
  }

  return "";
}

// Predefined middleware configurations
export const rbacConfigs = {
  // Public endpoints
  public: {
    requireAuth: false,
  } as RBACMiddlewareConfig,

  // Authenticated user endpoints
  authenticated: {
    requireAuth: true,
  } as RBACMiddlewareConfig,

  // Admin only endpoints
  adminOnly: {
    requireAuth: true,
    requiredRoles: ["super_admin", "admin"],
  } as RBACMiddlewareConfig,

  // Security admin endpoints
  securityAdmin: {
    requireAuth: true,
    requiredRoles: ["super_admin", "admin", "security_admin"],
  } as RBACMiddlewareConfig,

  // Compliance officer endpoints
  complianceOfficer: {
    requireAuth: true,
    requiredRoles: ["super_admin", "admin", "compliance_officer"],
  } as RBACMiddlewareConfig,

  // Executive access endpoints
  executive: {
    requireAuth: true,
    requiredRoles: ["super_admin", "admin", "executive", "risk_manager"],
  } as RBACMiddlewareConfig,

  // Audit read access
  auditRead: {
    requireAuth: true,
    requiredPermissions: [{ resource: "audit_logs", action: "read" }],
  } as RBACMiddlewareConfig,

  // User management
  userManagement: {
    requireAuth: true,
    requiredPermissions: [
      { resource: "users", action: "read" },
      { resource: "users", action: "write" },
    ],
  } as RBACMiddlewareConfig,

  // Role management
  roleManagement: {
    requireAuth: true,
    requiredPermissions: [
      { resource: "roles", action: "read" },
      { resource: "roles", action: "write" },
    ],
  } as RBACMiddlewareConfig,

  // Financial data access
  financialData: {
    requireAuth: true,
    requiredPermissions: [{ resource: "financial_data", action: "read" }],
  } as RBACMiddlewareConfig,

  // Dashboard access
  dashboardAccess: {
    requireAuth: true,
    requiredPermissions: [{ resource: "dashboard", action: "read" }],
  } as RBACMiddlewareConfig,

  // Reports access
  reportsAccess: {
    requireAuth: true,
    requiredPermissions: [{ resource: "reports", action: "read" }],
  } as RBACMiddlewareConfig,

  // Reports generation
  reportsGeneration: {
    requireAuth: true,
    requiredPermissions: [
      { resource: "reports", action: "read" },
      { resource: "reports", action: "write" },
    ],
  } as RBACMiddlewareConfig,

  // Own resource access (user can access their own data)
  ownResourceAccess: {
    requireAuth: true,
    allowOwnerAccess: true,
    getResourceId: extractUserIdFromUrl,
  } as RBACMiddlewareConfig,
};

// Types are already exported at the top of the file
