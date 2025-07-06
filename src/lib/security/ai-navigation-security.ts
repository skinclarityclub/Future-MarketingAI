/**
 * AI Navigation Security Framework
 * Task 13.5: Ensure Scalability and Data Security
 *
 * Comprehensive security measures for the AI Navigation System
 * including data encryption, access controls, and privacy compliance
 */

import {
  createHash,
  randomBytes,
  createCipheriv,
  createDecipheriv,
} from "crypto";

export interface SecurityConfig {
  encryption: {
    algorithm: string;
    keyLength: number;
    ivLength: number;
  };
  accessControl: {
    sessionTimeout: number;
    maxFailedAttempts: number;
    lockoutDuration: number;
  };
  privacy: {
    dataRetentionDays: number;
    anonymizeAfterDays: number;
    enableGDPRCompliance: boolean;
  };
  audit: {
    enableLogging: boolean;
    logLevel: "minimal" | "standard" | "detailed";
    retentionDays: number;
  };
}

export interface UserSession {
  userId: string;
  sessionId: string;
  createdAt: Date;
  lastActivity: Date;
  permissions: string[];
  encryptedData?: string;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  details?: Record<string, any>;
}

export class AINavigationSecurity {
  private config: SecurityConfig;
  private activeSessions: Map<string, UserSession> = new Map();
  private failedAttempts: Map<string, { count: number; lastAttempt: Date }> =
    new Map();
  private auditLogs: SecurityAuditLog[] = [];

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      encryption: {
        algorithm: "aes-256-gcm",
        keyLength: 32,
        ivLength: 16,
        ...config.encryption,
      },
      accessControl: {
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
        maxFailedAttempts: 5,
        lockoutDuration: 15 * 60 * 1000, // 15 minutes
        ...config.accessControl,
      },
      privacy: {
        dataRetentionDays: 90,
        anonymizeAfterDays: 365,
        enableGDPRCompliance: true,
        ...config.privacy,
      },
      audit: {
        enableLogging: true,
        logLevel: "standard",
        retentionDays: 365,
        ...config.audit,
      },
    };

    // Start cleanup intervals
    this.startCleanupTasks();
  }

  /**
   * Encrypt sensitive data
   */
  encryptData(
    data: string,
    key?: string
  ): { encrypted: string; iv: string; tag: string } {
    const encryptionKey = key ? Buffer.from(key, "hex") : this.generateKey();
    const iv = randomBytes(this.config.encryption.ivLength);

    const cipher = createCipheriv(
      this.config.encryption.algorithm,
      encryptionKey,
      iv
    );

    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString("hex"),
      tag: tag.toString("hex"),
    };
  }

  /**
   * Decrypt sensitive data
   */
  decryptData(
    encryptedData: string,
    iv: string,
    tag: string,
    key?: string
  ): string {
    const encryptionKey = key ? Buffer.from(key, "hex") : this.generateKey();
    const ivBuffer = Buffer.from(iv, "hex");
    const tagBuffer = Buffer.from(tag, "hex");

    const decipher = createDecipheriv(
      this.config.encryption.algorithm,
      encryptionKey,
      ivBuffer
    );
    decipher.setAuthTag(tagBuffer);

    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  /**
   * Create secure user session
   */
  createSession(userId: string, permissions: string[] = []): UserSession {
    const sessionId = this.generateSessionId();
    const session: UserSession = {
      userId,
      sessionId,
      createdAt: new Date(),
      lastActivity: new Date(),
      permissions,
    };

    this.activeSessions.set(sessionId, session);

    this.logAuditEvent({
      userId,
      action: "session_created",
      resource: "navigation_system",
      success: true,
    });

    return session;
  }

  /**
   * Validate user session
   */
  validateSession(sessionId: string): {
    valid: boolean;
    session?: UserSession;
    reason?: string;
  } {
    const session = this.activeSessions.get(sessionId);

    if (!session) {
      return { valid: false, reason: "Session not found" };
    }

    const now = new Date();
    const sessionAge = now.getTime() - session.lastActivity.getTime();

    if (sessionAge > this.config.accessControl.sessionTimeout) {
      this.activeSessions.delete(sessionId);
      this.logAuditEvent({
        userId: session.userId,
        action: "session_expired",
        resource: "navigation_system",
        success: false,
        details: {
          sessionAge,
          timeout: this.config.accessControl.sessionTimeout,
        },
      });
      return { valid: false, reason: "Session expired" };
    }

    // Update last activity
    session.lastActivity = now;
    this.activeSessions.set(sessionId, session);

    return { valid: true, session };
  }

  /**
   * Check user permissions
   */
  hasPermission(sessionId: string, requiredPermission: string): boolean {
    const validation = this.validateSession(sessionId);

    if (!validation.valid || !validation.session) {
      return false;
    }

    return (
      validation.session.permissions.includes(requiredPermission) ||
      validation.session.permissions.includes("admin")
    );
  }

  /**
   * Rate limiting for API calls
   */
  checkRateLimit(
    userId: string,
    action: string
  ): { allowed: boolean; retryAfter?: number } {
    const key = `${userId}:${action}`;
    const attempts = this.failedAttempts.get(key);

    if (!attempts) {
      return { allowed: true };
    }

    const now = new Date();
    const timeSinceLastAttempt = now.getTime() - attempts.lastAttempt.getTime();

    if (timeSinceLastAttempt > this.config.accessControl.lockoutDuration) {
      // Reset attempts after lockout period
      this.failedAttempts.delete(key);
      return { allowed: true };
    }

    if (attempts.count >= this.config.accessControl.maxFailedAttempts) {
      const retryAfter =
        this.config.accessControl.lockoutDuration - timeSinceLastAttempt;
      return { allowed: false, retryAfter };
    }

    return { allowed: true };
  }

  /**
   * Record failed attempt
   */
  recordFailedAttempt(userId: string, action: string): void {
    const key = `${userId}:${action}`;
    const existing = this.failedAttempts.get(key);

    this.failedAttempts.set(key, {
      count: (existing?.count || 0) + 1,
      lastAttempt: new Date(),
    });

    this.logAuditEvent({
      userId,
      action: "failed_attempt",
      resource: action,
      success: false,
    });
  }

  /**
   * Sanitize user input
   */
  sanitizeInput(input: string): string {
    // Remove potentially dangerous characters and scripts
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .replace(/[<>'"&]/g, char => {
        const entities: Record<string, string> = {
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#x27;",
          "&": "&amp;",
        };
        return entities[char] || char;
      })
      .trim();
  }

  /**
   * Anonymize user data for privacy compliance
   */
  anonymizeUserData(data: Record<string, any>): Record<string, any> {
    const sensitiveFields = ["email", "name", "phone", "address", "ip"];
    const anonymized = { ...data };

    sensitiveFields.forEach(field => {
      if (anonymized[field]) {
        anonymized[field] = this.hashData(anonymized[field]);
      }
    });

    return anonymized;
  }

  /**
   * Log security audit event
   */
  private logAuditEvent(
    event: Omit<SecurityAuditLog, "id" | "timestamp">
  ): void {
    if (!this.config.audit.enableLogging) {
      return;
    }

    const auditLog: SecurityAuditLog = {
      id: this.generateId(),
      timestamp: new Date(),
      ...event,
    };

    this.auditLogs.push(auditLog);

    // In production, this would be sent to a secure logging service
    if (this.config.audit.logLevel === "detailed") {
      console.log("[SECURITY AUDIT]", auditLog);
    }
  }

  /**
   * Get security metrics
   */
  getSecurityMetrics(): {
    activeSessions: number;
    failedAttempts: number;
    auditLogs: number;
    sessionTimeouts: number;
  } {
    const now = new Date();
    const sessionTimeouts = Array.from(this.activeSessions.values()).filter(
      session =>
        now.getTime() - session.lastActivity.getTime() >
        this.config.accessControl.sessionTimeout
    ).length;

    return {
      activeSessions: this.activeSessions.size,
      failedAttempts: this.failedAttempts.size,
      auditLogs: this.auditLogs.length,
      sessionTimeouts,
    };
  }

  /**
   * Generate secure session ID
   */
  private generateSessionId(): string {
    return randomBytes(32).toString("hex");
  }

  /**
   * Generate encryption key
   */
  private generateKey(): Buffer {
    return randomBytes(this.config.encryption.keyLength);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return randomBytes(16).toString("hex");
  }

  /**
   * Hash data for anonymization
   */
  private hashData(data: string): string {
    return (
      createHash("sha256").update(data).digest("hex").substring(0, 8) + "***"
    );
  }

  /**
   * Start cleanup tasks
   */
  private startCleanupTasks(): void {
    // Clean up expired sessions every hour
    setInterval(
      () => {
        this.cleanupExpiredSessions();
      },
      60 * 60 * 1000
    );

    // Clean up old audit logs daily
    setInterval(
      () => {
        this.cleanupAuditLogs();
      },
      24 * 60 * 60 * 1000
    );
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = new Date();
    const expiredSessions: string[] = [];

    this.activeSessions.forEach((session, sessionId) => {
      const sessionAge = now.getTime() - session.lastActivity.getTime();
      if (sessionAge > this.config.accessControl.sessionTimeout) {
        expiredSessions.push(sessionId);
      }
    });

    expiredSessions.forEach(sessionId => {
      this.activeSessions.delete(sessionId);
    });

    if (expiredSessions.length > 0) {
      console.log(
        `[SECURITY] Cleaned up ${expiredSessions.length} expired sessions`
      );
    }
  }

  /**
   * Clean up old audit logs
   */
  private cleanupAuditLogs(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.audit.retentionDays);

    const initialCount = this.auditLogs.length;
    this.auditLogs = this.auditLogs.filter(log => log.timestamp > cutoffDate);

    const removedCount = initialCount - this.auditLogs.length;
    if (removedCount > 0) {
      console.log(`[SECURITY] Cleaned up ${removedCount} old audit logs`);
    }
  }

  /**
   * Destroy security instance
   */
  destroy(): void {
    this.activeSessions.clear();
    this.failedAttempts.clear();
    this.auditLogs.length = 0;
  }
}
