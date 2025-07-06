/**
 * Enhanced Audit Access Control System
 * Task 37.14: Implement Security and Encryption for Audit Logs
 *
 * Advanced access control for audit logs with:
 * - Multi-factor authentication
 * - Time-based access controls
 * - IP-based restrictions
 * - Session management
 * - Real-time monitoring
 */

import { createClient } from "@supabase/supabase-js";
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { RBACService } from "../rbac/rbac-service";

export interface AccessControlConfig {
  mfaRequired: boolean;
  sessionTimeoutMinutes: number;
  maxFailedAttempts: number;
  lockoutDurationMinutes: number;
  ipWhitelistEnabled: boolean;
  timeBasedAccessEnabled: boolean;
}

export interface AuditAccessRequest {
  userId: string;
  requestedResource: string;
  requestedAction: string;
  ipAddress?: string;
  userAgent?: string;
  mfaToken?: string;
  justification?: string;
}

export interface AccessControlResult {
  granted: boolean;
  reason: string;
  sessionId?: string;
  expiresAt?: Date;
  requiresMFA?: boolean;
  additionalChallenges?: string[];
}

export interface AuditSession {
  sessionId: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
  permissions: string[];
  isActive: boolean;
  mfaVerified: boolean;
}

export interface SecurityEvent {
  eventType:
    | "access_granted"
    | "access_denied"
    | "suspicious_activity"
    | "mfa_challenge"
    | "session_expired";
  userId: string;
  ipAddress: string;
  userAgent: string;
  resource: string;
  reason: string;
  riskScore: number;
  timestamp: Date;
}

/**
 * Enhanced Audit Access Control Service
 */
export class AuditAccessControlService {
  private static instance: AuditAccessControlService;
  private supabase: any;
  private rbacService: RBACService;
  private config: AccessControlConfig;
  private activeSessions: Map<string, AuditSession> = new Map();
  private failedAttempts: Map<
    string,
    { count: number; lastAttempt: Date; lockedUntil?: Date }
  > = new Map();
  private ipWhitelist: Set<string> = new Set();
  private timeBasedRules: Map<
    string,
    { startTime: string; endTime: string; timezone: string }
  > = new Map();

  private constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    this.rbacService = RBACService.getInstance();

    this.config = {
      mfaRequired: true,
      sessionTimeoutMinutes: 60,
      maxFailedAttempts: 3,
      lockoutDurationMinutes: 30,
      ipWhitelistEnabled: false,
      timeBasedAccessEnabled: false,
    };

    this.initializeAccessControl();
  }

  public static getInstance(): AuditAccessControlService {
    if (!AuditAccessControlService.instance) {
      AuditAccessControlService.instance = new AuditAccessControlService();
    }
    return AuditAccessControlService.instance;
  }

  /**
   * Initialize access control system
   */
  private async initializeAccessControl(): Promise<void> {
    try {
      await this.loadConfiguration();
      await this.loadIPWhitelist();
      await this.loadTimeBasedRules();
      await this.cleanupExpiredSessions();

      // Start periodic cleanup
      setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000); // Every 5 minutes
    } catch (error) {
      console.error("Failed to initialize access control:", error);
    }
  }

  /**
   * Load access control configuration
   */
  private async loadConfiguration(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from("audit_access_config")
        .select("*")
        .eq("is_active", true)
        .single();

      if (data && !error) {
        this.config = {
          ...this.config,
          ...data.config,
        };
      }
    } catch (error) {
      console.error("Failed to load access control configuration:", error);
    }
  }

  /**
   * Load IP whitelist
   */
  private async loadIPWhitelist(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from("audit_ip_whitelist")
        .select("ip_address")
        .eq("is_active", true);

      if (data && !error) {
        this.ipWhitelist.clear();
        data.forEach((row: any) => this.ipWhitelist.add(row.ip_address));
      }
    } catch (error) {
      console.error("Failed to load IP whitelist:", error);
    }
  }

  /**
   * Load time-based access rules
   */
  private async loadTimeBasedRules(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from("audit_time_based_access")
        .select("*")
        .eq("is_active", true);

      if (data && !error) {
        this.timeBasedRules.clear();
        data.forEach((row: any) => {
          this.timeBasedRules.set(row.user_id, {
            startTime: row.start_time,
            endTime: row.end_time,
            timezone: row.timezone,
          });
        });
      }
    } catch (error) {
      console.error("Failed to load time-based rules:", error);
    }
  }

  /**
   * Check audit log access permission with enhanced security
   */
  public async checkAuditAccess(
    request: AuditAccessRequest
  ): Promise<AccessControlResult> {
    try {
      const startTime = Date.now();

      // 1. Check if user is locked out
      const lockoutCheck = this.checkUserLockout(request.userId);
      if (!lockoutCheck.allowed) {
        await this.logSecurityEvent({
          eventType: "access_denied",
          userId: request.userId,
          ipAddress: request.ipAddress || "unknown",
          userAgent: request.userAgent || "unknown",
          resource: request.requestedResource,
          reason: lockoutCheck.reason,
          riskScore: 8,
          timestamp: new Date(),
        });

        return {
          granted: false,
          reason: lockoutCheck.reason,
        };
      }

      // 2. Check IP whitelist if enabled
      if (this.config.ipWhitelistEnabled && request.ipAddress) {
        if (!this.isIPWhitelisted(request.ipAddress)) {
          await this.recordFailedAttempt(request.userId);
          await this.logSecurityEvent({
            eventType: "access_denied",
            userId: request.userId,
            ipAddress: request.ipAddress,
            userAgent: request.userAgent || "unknown",
            resource: request.requestedResource,
            reason: "IP not whitelisted",
            riskScore: 7,
            timestamp: new Date(),
          });

          return {
            granted: false,
            reason: "Access denied: IP address not authorized",
          };
        }
      }

      // 3. Check time-based access if enabled
      if (this.config.timeBasedAccessEnabled) {
        const timeCheck = this.checkTimeBasedAccess(request.userId);
        if (!timeCheck.allowed) {
          await this.logSecurityEvent({
            eventType: "access_denied",
            userId: request.userId,
            ipAddress: request.ipAddress || "unknown",
            userAgent: request.userAgent || "unknown",
            resource: request.requestedResource,
            reason: timeCheck.reason,
            riskScore: 5,
            timestamp: new Date(),
          });

          return {
            granted: false,
            reason: timeCheck.reason,
          };
        }
      }

      // 4. Check RBAC permissions
      const hasPermission = await this.rbacService.hasPermission(
        request.userId,
        request.requestedResource,
        request.requestedAction
      );

      if (!hasPermission) {
        await this.recordFailedAttempt(request.userId);
        await this.logSecurityEvent({
          eventType: "access_denied",
          userId: request.userId,
          ipAddress: request.ipAddress || "unknown",
          userAgent: request.userAgent || "unknown",
          resource: request.requestedResource,
          reason: "Insufficient permissions",
          riskScore: 6,
          timestamp: new Date(),
        });

        return {
          granted: false,
          reason: "Insufficient permissions for requested resource",
        };
      }

      // 5. Check MFA requirement
      if (this.config.mfaRequired) {
        const mfaCheck = await this.verifyMFA(request.userId, request.mfaToken);
        if (!mfaCheck.verified) {
          await this.logSecurityEvent({
            eventType: "mfa_challenge",
            userId: request.userId,
            ipAddress: request.ipAddress || "unknown",
            userAgent: request.userAgent || "unknown",
            resource: request.requestedResource,
            reason: "MFA verification required",
            riskScore: 4,
            timestamp: new Date(),
          });

          return {
            granted: false,
            reason: "Multi-factor authentication required",
            requiresMFA: true,
            additionalChallenges: mfaCheck.challenges,
          };
        }
      }

      // 6. Create audit session
      const session = await this.createAuditSession(request);

      // 7. Clear failed attempts on success
      this.failedAttempts.delete(request.userId);

      // 8. Log successful access
      await this.logSecurityEvent({
        eventType: "access_granted",
        userId: request.userId,
        ipAddress: request.ipAddress || "unknown",
        userAgent: request.userAgent || "unknown",
        resource: request.requestedResource,
        reason: "Access granted with full verification",
        riskScore: 1,
        timestamp: new Date(),
      });

      const responseTime = Date.now() - startTime;
      console.log(
        `Audit access check completed in ${responseTime}ms for user ${request.userId}`
      );

      return {
        granted: true,
        reason: "Access granted",
        sessionId: session.sessionId,
        expiresAt: session.expiresAt,
      };
    } catch (error) {
      console.error("Audit access check failed:", error);

      await this.logSecurityEvent({
        eventType: "suspicious_activity",
        userId: request.userId,
        ipAddress: request.ipAddress || "unknown",
        userAgent: request.userAgent || "unknown",
        resource: request.requestedResource,
        reason: `Access check error: ${error.message}`,
        riskScore: 9,
        timestamp: new Date(),
      });

      return {
        granted: false,
        reason: "Access check failed due to system error",
      };
    }
  }

  /**
   * Check if user is locked out due to failed attempts
   */
  private checkUserLockout(userId: string): {
    allowed: boolean;
    reason: string;
  } {
    const attempts = this.failedAttempts.get(userId);
    if (!attempts) return { allowed: true, reason: "" };

    if (attempts.lockedUntil && attempts.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (attempts.lockedUntil.getTime() - Date.now()) / (60 * 1000)
      );
      return {
        allowed: false,
        reason: `Account locked due to failed attempts. Try again in ${minutesLeft} minutes.`,
      };
    }

    return { allowed: true, reason: "" };
  }

  /**
   * Check if IP address is whitelisted
   */
  private isIPWhitelisted(ipAddress: string): boolean {
    return this.ipWhitelist.has(ipAddress);
  }

  /**
   * Check time-based access rules
   */
  private checkTimeBasedAccess(userId: string): {
    allowed: boolean;
    reason: string;
  } {
    const rule = this.timeBasedRules.get(userId);
    if (!rule) return { allowed: true, reason: "" };

    const now = new Date();
    const timeZone = rule.timezone || "UTC";

    // This is a simplified check - in production, use proper timezone handling
    const currentTime = now.toLocaleTimeString("en-US", {
      timeZone,
      hour12: false,
    });

    if (currentTime < rule.startTime || currentTime > rule.endTime) {
      return {
        allowed: false,
        reason: `Access only allowed between ${rule.startTime} and ${rule.endTime} ${timeZone}`,
      };
    }

    return { allowed: true, reason: "" };
  }

  /**
   * Verify multi-factor authentication
   */
  private async verifyMFA(
    userId: string,
    mfaToken?: string
  ): Promise<{ verified: boolean; challenges: string[] }> {
    if (!mfaToken) {
      return {
        verified: false,
        challenges: ["totp", "sms", "email"],
      };
    }

    // This is a simplified MFA check - in production, integrate with proper MFA service
    try {
      const { data, error } = await this.supabase
        .from("user_mfa_tokens")
        .select("*")
        .eq("user_id", userId)
        .eq("token_hash", createHash("sha256").update(mfaToken).digest("hex"))
        .gte("expires_at", new Date().toISOString())
        .eq("is_used", false)
        .single();

      if (data && !error) {
        // Mark token as used
        await this.supabase
          .from("user_mfa_tokens")
          .update({ is_used: true, used_at: new Date().toISOString() })
          .eq("id", data.id);

        return { verified: true, challenges: [] };
      }

      return { verified: false, challenges: ["totp"] };
    } catch (error) {
      console.error("MFA verification failed:", error);
      return { verified: false, challenges: ["totp"] };
    }
  }

  /**
   * Create audit session
   */
  private async createAuditSession(
    request: AuditAccessRequest
  ): Promise<AuditSession> {
    const sessionId = this.generateSessionId();
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + this.config.sessionTimeoutMinutes * 60 * 1000
    );

    const userPermissions = await this.rbacService.getUserPermissions(
      request.userId
    );

    const session: AuditSession = {
      sessionId,
      userId: request.userId,
      createdAt: now,
      expiresAt,
      ipAddress: request.ipAddress || "unknown",
      userAgent: request.userAgent || "unknown",
      permissions: userPermissions.map(p => `${p.resource}:${p.action}`),
      isActive: true,
      mfaVerified: true,
    };

    // Store session
    this.activeSessions.set(sessionId, session);

    // Store in database
    await this.supabase.from("audit_sessions").insert({
      session_id: sessionId,
      user_id: request.userId,
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      ip_address: session.ipAddress,
      user_agent: session.userAgent,
      permissions: session.permissions,
      is_active: true,
    });

    return session;
  }

  /**
   * Generate secure session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = randomBytes(16).toString("hex");
    return `audit_${timestamp}_${randomPart}`;
  }

  /**
   * Record failed access attempt
   */
  private async recordFailedAttempt(userId: string): Promise<void> {
    const now = new Date();
    const existing = this.failedAttempts.get(userId);

    if (existing) {
      existing.count++;
      existing.lastAttempt = now;

      if (existing.count >= this.config.maxFailedAttempts) {
        existing.lockedUntil = new Date(
          now.getTime() + this.config.lockoutDurationMinutes * 60 * 1000
        );
      }
    } else {
      this.failedAttempts.set(userId, {
        count: 1,
        lastAttempt: now,
      });
    }

    // Store in database
    await this.supabase.from("audit_failed_attempts").insert({
      user_id: userId,
      attempt_time: now.toISOString(),
      total_failures: existing ? existing.count : 1,
    });
  }

  /**
   * Validate audit session
   */
  public validateSession(sessionId: string): {
    valid: boolean;
    session?: AuditSession;
    reason?: string;
  } {
    const session = this.activeSessions.get(sessionId);

    if (!session) {
      return { valid: false, reason: "Session not found" };
    }

    if (!session.isActive) {
      return { valid: false, reason: "Session inactive" };
    }

    if (session.expiresAt <= new Date()) {
      session.isActive = false;
      return { valid: false, reason: "Session expired" };
    }

    return { valid: true, session };
  }

  /**
   * Cleanup expired sessions
   */
  private async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.expiresAt <= now) {
        session.isActive = false;
        expiredSessions.push(sessionId);
      }
    }

    // Remove from memory
    expiredSessions.forEach(sessionId => this.activeSessions.delete(sessionId));

    // Update database
    if (expiredSessions.length > 0) {
      await this.supabase
        .from("audit_sessions")
        .update({ is_active: false })
        .in("session_id", expiredSessions);
    }

    if (expiredSessions.length > 0) {
      console.log(
        `Cleaned up ${expiredSessions.length} expired audit sessions`
      );
    }
  }

  /**
   * Log security events
   */
  private async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      await this.supabase.from("security_audit_log").insert({
        event_category: "access_control",
        event_type: event.eventType,
        event_name: `Audit Access ${event.eventType}`,
        message: event.reason,
        status: event.eventType === "access_granted" ? "success" : "failure",
        severity:
          event.riskScore >= 7
            ? "critical"
            : event.riskScore >= 5
              ? "warning"
              : "info",
        user_id: event.userId,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        resource_type: "audit_logs",
        resource_name: event.resource,
        details: {
          riskScore: event.riskScore,
          accessType: "audit_log_access",
        },
        risk_score: event.riskScore,
        event_timestamp: event.timestamp.toISOString(),
        compliance_tags: ["access_control", "audit_security"],
      });
    } catch (error) {
      console.error("Failed to log security event:", error);
    }
  }

  /**
   * Get access control statistics
   */
  public getAccessControlStats(): {
    activeSessions: number;
    lockedUsers: number;
    totalFailedAttempts: number;
    averageRiskScore: number;
  } {
    const now = new Date();
    let lockedUsers = 0;
    let totalFailedAttempts = 0;

    for (const attempts of this.failedAttempts.values()) {
      totalFailedAttempts += attempts.count;
      if (attempts.lockedUntil && attempts.lockedUntil > now) {
        lockedUsers++;
      }
    }

    return {
      activeSessions: this.activeSessions.size,
      lockedUsers,
      totalFailedAttempts,
      averageRiskScore: 3.5, // This would be calculated from recent events in production
    };
  }
}
