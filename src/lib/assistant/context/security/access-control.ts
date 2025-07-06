import { NextRequest, NextResponse } from "next/server";
import { createBrowserClient } from "@supabase/ssr";
import { auditLogger } from "./audit-logger";
import { consentManager } from "./consent-manager";

// Permission types
export type Permission =
  | "context.read"
  | "context.write"
  | "context.delete"
  | "user.read"
  | "user.write"
  | "user.delete"
  | "admin.read"
  | "admin.write"
  | "audit.read"
  | "system.manage";

export type Role = "user" | "admin" | "system" | "anonymous";

// Access control configuration
export interface AccessControlConfig {
  requireAuth: boolean;
  requiredPermissions: Permission[];
  requiredRole?: Role;
  requiredConsents?: string[];
  rateLimiting?: {
    maxRequests: number;
    windowMs: number;
  };
  ipWhitelist?: string[];
  allowedOrigins?: string[];
}

// User context for access control
export interface UserContext {
  userId?: string;
  role: Role;
  permissions: Permission[];
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  authenticated: boolean;
}

// Rate limiting store
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();

  check(
    key: string,
    maxRequests: number,
    windowMs: number
  ): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // New window or expired entry
      this.store.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs,
      };
    }

    if (entry.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

export class AccessController {
  private static instance: AccessController;
  private rateLimiter: RateLimiter;

  // Role-based permissions
  private static readonly ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    anonymous: [],
    user: ["context.read", "context.write", "user.read", "user.write"],
    admin: [
      "context.read",
      "context.write",
      "context.delete",
      "user.read",
      "user.write",
      "user.delete",
      "admin.read",
      "admin.write",
      "audit.read",
    ],
    system: [
      "context.read",
      "context.write",
      "context.delete",
      "user.read",
      "user.write",
      "user.delete",
      "admin.read",
      "admin.write",
      "audit.read",
      "system.manage",
    ],
  };

  private constructor() {
    this.rateLimiter = new RateLimiter();

    // Cleanup rate limiter every 5 minutes
    setInterval(
      () => {
        this.rateLimiter.cleanup();
      },
      5 * 60 * 1000
    );
  }

  public static getInstance(): AccessController {
    if (!AccessController.instance) {
      AccessController.instance = new AccessController();
    }
    return AccessController.instance;
  }

  /**
   * Middleware function for API route protection
   */
  public async middleware(
    request: NextRequest,
    config: AccessControlConfig
  ): Promise<NextResponse | null> {
    try {
      const userContext = await this.getUserContext(request);
      const accessCheck = await this.checkAccess(userContext, config, request);

      if (!accessCheck.allowed) {
        await this.logAccessDenied(userContext, accessCheck.reason, request);
        return this.createErrorResponse(
          accessCheck.reason,
          accessCheck.statusCode
        );
      }

      // Log successful access
      await this.logSuccessfulAccess(userContext, request);

      return null; // Allow request to proceed
    } catch (error) {
      await auditLogger.logFailure("system.error", error as Error, "high", {
        resource: "access_control",
        details: { url: request.url },
      });

      return this.createErrorResponse("Internal server error", 500);
    }
  }

  /**
   * Check if user has access to a resource
   */
  public async checkAccess(
    userContext: UserContext,
    config: AccessControlConfig,
    request?: NextRequest
  ): Promise<{
    allowed: boolean;
    reason?: string;
    statusCode?: number;
  }> {
    // Check authentication requirement
    if (config.requireAuth && !userContext.authenticated) {
      return {
        allowed: false,
        reason: "Authentication required",
        statusCode: 401,
      };
    }

    // Check role requirement
    if (config.requiredRole && userContext.role !== config.requiredRole) {
      return {
        allowed: false,
        reason: "Insufficient role privileges",
        statusCode: 403,
      };
    }

    // Check permissions
    if (config.requiredPermissions.length > 0) {
      const hasPermissions = config.requiredPermissions.every(permission =>
        userContext.permissions.includes(permission)
      );

      if (!hasPermissions) {
        return {
          allowed: false,
          reason: "Insufficient permissions",
          statusCode: 403,
        };
      }
    }

    // Check consent requirements
    if (config.requiredConsents && userContext.userId) {
      const consents = await consentManager.hasValidConsents(
        userContext.userId,
        config.requiredConsents as any[]
      );

      const hasAllConsents = Object.values(consents).every(Boolean);
      if (!hasAllConsents) {
        return {
          allowed: false,
          reason: "Required consent not granted",
          statusCode: 403,
        };
      }
    }

    // Check IP whitelist
    if (config.ipWhitelist && userContext.ipAddress) {
      if (!config.ipWhitelist.includes(userContext.ipAddress)) {
        return {
          allowed: false,
          reason: "IP address not whitelisted",
          statusCode: 403,
        };
      }
    }

    // Check origin
    if (config.allowedOrigins && request) {
      const origin = request.headers.get("origin");
      if (origin && !config.allowedOrigins.includes(origin)) {
        return {
          allowed: false,
          reason: "Origin not allowed",
          statusCode: 403,
        };
      }
    }

    // Check rate limiting
    if (config.rateLimiting) {
      const rateLimitKey = this.getRateLimitKey(userContext, request);
      const rateLimitCheck = this.rateLimiter.check(
        rateLimitKey,
        config.rateLimiting.maxRequests,
        config.rateLimiting.windowMs
      );

      if (!rateLimitCheck.allowed) {
        return {
          allowed: false,
          reason: "Rate limit exceeded",
          statusCode: 429,
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Get user context from request
   */
  public async getUserContext(request: NextRequest): Promise<UserContext> {
    try {
      const supabase = createMiddlewareClient({
        req: request,
        res: NextResponse.next(),
      });
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const ipAddress = this.getClientIP(request);
      const userAgent = request.headers.get("user-agent") || undefined;

      if (session?.user) {
        // Authenticated user
        const userId = session.user.id;
        const role = await this.getUserRole(userId);
        const permissions = this.getRolePermissions(role);

        return {
          userId,
          role,
          permissions,
          sessionId: session.access_token,
          ipAddress,
          userAgent,
          authenticated: true,
        };
      } else {
        // Anonymous user
        return {
          role: "anonymous",
          permissions: this.getRolePermissions("anonymous"),
          ipAddress,
          userAgent,
          authenticated: false,
        };
      }
    } catch (error) {
      console.error("Failed to get user context:", error);

      // Fallback to anonymous user
      return {
        role: "anonymous",
        permissions: [],
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get("user-agent") || undefined,
        authenticated: false,
      };
    }
  }

  /**
   * Create middleware for specific endpoints
   */
  public createEndpointMiddleware(config: AccessControlConfig) {
    return async (request: NextRequest) => {
      return await this.middleware(request, config);
    };
  }

  /**
   * Helper function to check single permission
   */
  public async hasPermission(
    request: NextRequest,
    permission: Permission
  ): Promise<boolean> {
    const userContext = await this.getUserContext(request);
    return userContext.permissions.includes(permission);
  }

  /**
   * Helper function to require authentication
   */
  public async requireAuth(request: NextRequest): Promise<UserContext | null> {
    const userContext = await this.getUserContext(request);
    if (!userContext.authenticated) {
      return null;
    }
    return userContext;
  }

  /**
   * Helper function to require admin role
   */
  public async requireAdmin(request: NextRequest): Promise<UserContext | null> {
    const userContext = await this.getUserContext(request);
    if (userContext.role !== "admin" && userContext.role !== "system") {
      return null;
    }
    return userContext;
  }

  // Private helper methods
  private async getUserRole(userId: string): Promise<Role> {
    try {
      // Check if user is admin (you can implement your own logic here)
      const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

      // For now, return 'user' as default
      // You can implement database lookup for roles here
      return "user";
    } catch (error) {
      console.error("Failed to get user role:", error);
      return "user";
    }
  }

  private getRolePermissions(role: Role): Permission[] {
    return AccessController.ROLE_PERMISSIONS[role] || [];
  }

  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");

    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }

    if (realIP) {
      return realIP;
    }

    return "unknown";
  }

  private getRateLimitKey(
    userContext: UserContext,
    request?: NextRequest
  ): string {
    if (userContext.userId) {
      return `user:${userContext.userId}`;
    }

    if (userContext.ipAddress) {
      return `ip:${userContext.ipAddress}`;
    }

    return "anonymous";
  }

  private async logAccessDenied(
    userContext: UserContext,
    reason: string,
    request: NextRequest
  ): Promise<void> {
    await auditLogger.logFailure("auth.failed", reason, "medium", {
      userId: userContext.userId,
      sessionId: userContext.sessionId,
      ipAddress: userContext.ipAddress,
      userAgent: userContext.userAgent,
      resource: request.url,
      details: {
        reason,
        role: userContext.role,
        permissions: userContext.permissions,
      },
    });
  }

  private async logSuccessfulAccess(
    userContext: UserContext,
    request: NextRequest
  ): Promise<void> {
    await auditLogger.logSuccess("auth.login", "low", {
      userId: userContext.userId,
      sessionId: userContext.sessionId,
      ipAddress: userContext.ipAddress,
      userAgent: userContext.userAgent,
      resource: request.url,
      details: {
        role: userContext.role,
        authenticated: userContext.authenticated,
      },
    });
  }

  private createErrorResponse(message: string, status: number): NextResponse {
    return NextResponse.json(
      { error: message, timestamp: new Date().toISOString() },
      { status }
    );
  }
}

// Singleton instance
export const accessController = AccessController.getInstance();

// Predefined middleware configurations
export const accessConfigs = {
  // Public endpoints (no authentication required)
  public: {
    requireAuth: false,
    requiredPermissions: [],
  } as AccessControlConfig,

  // User endpoints (requires authentication)
  user: {
    requireAuth: true,
    requiredPermissions: ["context.read"],
    rateLimiting: {
      maxRequests: 100,
      windowMs: 15 * 60 * 1000, // 15 minutes
    },
  } as AccessControlConfig,

  // Context read endpoints
  contextRead: {
    requireAuth: true,
    requiredPermissions: ["context.read"],
    requiredConsents: ["data_collection", "data_processing"],
    rateLimiting: {
      maxRequests: 60,
      windowMs: 15 * 60 * 1000,
    },
  } as AccessControlConfig,

  // Context write endpoints
  contextWrite: {
    requireAuth: true,
    requiredPermissions: ["context.write"],
    requiredConsents: [
      "data_collection",
      "data_processing",
      "context_retention",
    ],
    rateLimiting: {
      maxRequests: 30,
      windowMs: 15 * 60 * 1000,
    },
  } as AccessControlConfig,

  // Admin endpoints
  admin: {
    requireAuth: true,
    requiredRole: "admin",
    requiredPermissions: ["admin.read", "admin.write"],
    rateLimiting: {
      maxRequests: 200,
      windowMs: 15 * 60 * 1000,
    },
  } as AccessControlConfig,

  // Audit endpoints
  audit: {
    requireAuth: true,
    requiredPermissions: ["audit.read"],
    requiredRole: "admin",
    rateLimiting: {
      maxRequests: 50,
      windowMs: 15 * 60 * 1000,
    },
  } as AccessControlConfig,

  // High security endpoints
  sensitive: {
    requireAuth: true,
    requiredPermissions: ["context.read", "context.write"],
    requiredConsents: [
      "data_collection",
      "data_processing",
      "context_retention",
    ],
    rateLimiting: {
      maxRequests: 10,
      windowMs: 15 * 60 * 1000,
    },
  } as AccessControlConfig,
};

// Helper functions for common access control tasks
export const access = {
  /**
   * Check if user is authenticated
   */
  isAuthenticated: (request: NextRequest) =>
    accessController.requireAuth(request),

  /**
   * Check if user is admin
   */
  isAdmin: (request: NextRequest) => accessController.requireAdmin(request),

  /**
   * Check specific permission
   */
  hasPermission: (request: NextRequest, permission: Permission) =>
    accessController.hasPermission(request, permission),

  /**
   * Get user context
   */
  getUserContext: (request: NextRequest) =>
    accessController.getUserContext(request),

  /**
   * Create middleware with config
   */
  withConfig: (config: AccessControlConfig) =>
    accessController.createEndpointMiddleware(config),
};
