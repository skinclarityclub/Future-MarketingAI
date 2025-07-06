import { createClient } from "@supabase/supabase-js";

// Audit log entry types
export type AuditAction =
  | "user.create"
  | "user.update"
  | "user.delete"
  | "user.view"
  | "session.create"
  | "session.update"
  | "session.delete"
  | "conversation.create"
  | "conversation.view"
  | "conversation.update"
  | "conversation.delete"
  | "context.query"
  | "context.export"
  | "data.encrypt"
  | "data.decrypt"
  | "data.anonymize"
  | "auth.login"
  | "auth.logout"
  | "auth.failed"
  | "privacy.consent"
  | "privacy.withdraw"
  | "system.error"
  | "system.breach";

export type AuditSeverity = "low" | "medium" | "high" | "critical";

export interface AuditLogEntry {
  id?: string;
  timestamp: Date;
  action: AuditAction;
  severity: AuditSeverity;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  resourceId?: string;
  details: Record<string, any>;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface AuditQueryFilter {
  userId?: string;
  sessionId?: string;
  action?: AuditAction | AuditAction[];
  severity?: AuditSeverity | AuditSeverity[];
  success?: boolean;
  startDate?: Date;
  endDate?: Date;
  ipAddress?: string;
  resource?: string;
  limit?: number;
  offset?: number;
}

export interface AuditStatistics {
  totalEvents: number;
  failedEvents: number;
  uniqueUsers: number;
  topActions: Array<{ action: AuditAction; count: number }>;
  severityBreakdown: Record<AuditSeverity, number>;
  timeline: Array<{ date: string; count: number }>;
}

export class AuditLogger {
  private static instance: AuditLogger;
  private supabase;
  private enableLogging: boolean;
  private logRetentionDays: number;

  private constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for audit logging
    );
    this.enableLogging = process.env.ENABLE_AUDIT_LOGGING !== "false";
    this.logRetentionDays = parseInt(
      process.env.AUDIT_LOG_RETENTION_DAYS || "365"
    );
  }

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Log an audit event
   */
  public async log(
    entry: Omit<AuditLogEntry, "id" | "timestamp">
  ): Promise<void> {
    if (!this.enableLogging) {
      return;
    }

    try {
      const auditEntry: AuditLogEntry = {
        ...entry,
        timestamp: new Date(),
      };

      // Store in database
      const { error } = await this.supabase.from("audit_logs").insert({
        timestamp: auditEntry.timestamp.toISOString(),
        action: auditEntry.action,
        severity: auditEntry.severity,
        user_id: auditEntry.userId,
        session_id: auditEntry.sessionId,
        ip_address: auditEntry.ipAddress,
        user_agent: auditEntry.userAgent,
        resource: auditEntry.resource,
        resource_id: auditEntry.resourceId,
        details: auditEntry.details,
        success: auditEntry.success,
        error_message: auditEntry.errorMessage,
        metadata: auditEntry.metadata,
      });

      if (error) {
        console.error("Failed to log audit entry:", error);
        // Don't throw error to avoid breaking main functionality
      }
    } catch (error) {
      console.error("Audit logging error:", error);
    }
  }

  /**
   * Log successful action
   */
  public async logSuccess(
    action: AuditAction,
    severity: AuditSeverity = "low",
    context: Partial<AuditLogEntry> = {}
  ): Promise<void> {
    await this.log({
      action,
      severity,
      success: true,
      details: {},
      ...context,
    });
  }

  /**
   * Log failed action
   */
  public async logFailure(
    action: AuditAction,
    error: string | Error,
    severity: AuditSeverity = "medium",
    context: Partial<AuditLogEntry> = {}
  ): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : error;

    await this.log({
      action,
      severity,
      success: false,
      errorMessage,
      details: error instanceof Error ? { stack: error.stack } : {},
      ...context,
    });
  }

  /**
   * Log user data access
   */
  public async logDataAccess(
    userId: string,
    resource: string,
    resourceId: string,
    action: "view" | "export" | "modify" | "delete",
    context: Partial<AuditLogEntry> = {}
  ): Promise<void> {
    await this.log({
      action: `${resource}.${action}` as AuditAction,
      severity: action === "delete" ? "high" : "medium",
      userId,
      resource,
      resourceId,
      success: true,
      details: { accessType: action },
      ...context,
    });
  }

  /**
   * Log authentication events
   */
  public async logAuth(
    action: "login" | "logout" | "failed",
    userId?: string,
    context: Partial<AuditLogEntry> = {}
  ): Promise<void> {
    await this.log({
      action: `auth.${action}` as AuditAction,
      severity: action === "failed" ? "medium" : "low",
      userId,
      success: action !== "failed",
      details: {},
      ...context,
    });
  }

  /**
   * Log privacy-related events
   */
  public async logPrivacy(
    action: "consent" | "withdraw",
    userId: string,
    details: Record<string, any> = {},
    context: Partial<AuditLogEntry> = {}
  ): Promise<void> {
    await this.log({
      action: `privacy.${action}` as AuditAction,
      severity: "high",
      userId,
      success: true,
      details,
      ...context,
    });
  }

  /**
   * Log security breaches or suspicious activity
   */
  public async logSecurityIncident(
    details: Record<string, any>,
    context: Partial<AuditLogEntry> = {}
  ): Promise<void> {
    await this.log({
      action: "system.breach",
      severity: "critical",
      success: false,
      details,
      ...context,
    });

    // Also log to console for immediate attention
    console.error("SECURITY INCIDENT DETECTED:", details);
  }

  /**
   * Query audit logs
   */
  public async queryLogs(
    filter: AuditQueryFilter = {}
  ): Promise<AuditLogEntry[]> {
    try {
      let query = this.supabase
        .from("audit_logs")
        .select("*")
        .order("timestamp", { ascending: false });

      // Apply filters
      if (filter.userId) {
        query = query.eq("user_id", filter.userId);
      }
      if (filter.sessionId) {
        query = query.eq("session_id", filter.sessionId);
      }
      if (filter.action) {
        if (Array.isArray(filter.action)) {
          query = query.in("action", filter.action);
        } else {
          query = query.eq("action", filter.action);
        }
      }
      if (filter.severity) {
        if (Array.isArray(filter.severity)) {
          query = query.in("severity", filter.severity);
        } else {
          query = query.eq("severity", filter.severity);
        }
      }
      if (filter.success !== undefined) {
        query = query.eq("success", filter.success);
      }
      if (filter.startDate) {
        query = query.gte("timestamp", filter.startDate.toISOString());
      }
      if (filter.endDate) {
        query = query.lte("timestamp", filter.endDate.toISOString());
      }
      if (filter.ipAddress) {
        query = query.eq("ip_address", filter.ipAddress);
      }
      if (filter.resource) {
        query = query.eq("resource", filter.resource);
      }

      // Apply pagination
      if (filter.limit) {
        query = query.limit(filter.limit);
      }
      if (filter.offset) {
        query = query.range(
          filter.offset,
          filter.offset + (filter.limit || 100) - 1
        );
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data.map(this.mapDbAuditEntry);
    } catch (error) {
      console.error("Failed to query audit logs:", error);
      throw error;
    }
  }

  /**
   * Get audit statistics
   */
  public async getStatistics(
    startDate?: Date,
    endDate?: Date
  ): Promise<AuditStatistics> {
    try {
      let query = this.supabase
        .from("audit_logs")
        .select("action, severity, success, timestamp, user_id");

      if (startDate) {
        query = query.gte("timestamp", startDate.toISOString());
      }
      if (endDate) {
        query = query.lte("timestamp", endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Calculate statistics
      const totalEvents = data.length;
      const failedEvents = data.filter(entry => !entry.success).length;
      const uniqueUsers = new Set(
        data.map(entry => entry.user_id).filter(Boolean)
      ).size;

      // Top actions
      const actionCounts = data.reduce(
        (acc, entry) => {
          acc[entry.action] = (acc[entry.action] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const topActions = Object.entries(actionCounts)
        .map(([action, count]) => ({ action: action as AuditAction, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Severity breakdown
      const severityBreakdown = data.reduce(
        (acc, entry) => {
          acc[entry.severity] = (acc[entry.severity] || 0) + 1;
          return acc;
        },
        {} as Record<AuditSeverity, number>
      );

      // Timeline (daily counts for last 30 days)
      const timeline = this.generateTimeline(data);

      return {
        totalEvents,
        failedEvents,
        uniqueUsers,
        topActions,
        severityBreakdown,
        timeline,
      };
    } catch (error) {
      console.error("Failed to get audit statistics:", error);
      throw error;
    }
  }

  /**
   * Clean up old audit logs based on retention policy
   */
  public async cleanupOldLogs(): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.logRetentionDays);

      const { data, error } = await this.supabase
        .from("audit_logs")
        .delete()
        .lt("timestamp", cutoffDate.toISOString());

      if (error) {
        throw error;
      }

      const deletedCount = Array.isArray(data) ? data.length : 0;
      console.log(`Cleaned up ${deletedCount} old audit log entries`);

      return deletedCount;
    } catch (error) {
      console.error("Failed to cleanup old audit logs:", error);
      throw error;
    }
  }

  /**
   * Export audit logs for compliance
   */
  public async exportLogs(
    filter: AuditQueryFilter = {},
    format: "json" | "csv" = "json"
  ): Promise<string> {
    const logs = await this.queryLogs(filter);

    if (format === "csv") {
      return this.convertToCsv(logs);
    }

    return JSON.stringify(logs, null, 2);
  }

  // Private helper methods
  private mapDbAuditEntry(data: any): AuditLogEntry {
    return {
      id: data.id,
      timestamp: new Date(data.timestamp),
      action: data.action,
      severity: data.severity,
      userId: data.user_id,
      sessionId: data.session_id,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
      resource: data.resource,
      resourceId: data.resource_id,
      details: data.details || {},
      success: data.success,
      errorMessage: data.error_message,
      metadata: data.metadata || {},
    };
  }

  private generateTimeline(
    data: any[]
  ): Array<{ date: string; count: number }> {
    const timeline: Record<string, number> = {};
    const now = new Date();

    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      timeline[dateStr] = 0;
    }

    // Count events per day
    data.forEach(entry => {
      const dateStr = entry.timestamp.split("T")[0];
      if (timeline.hasOwnProperty(dateStr)) {
        timeline[dateStr]++;
      }
    });

    return Object.entries(timeline).map(([date, count]) => ({ date, count }));
  }

  private convertToCsv(logs: AuditLogEntry[]): string {
    if (logs.length === 0) {
      return "";
    }

    const headers = [
      "timestamp",
      "action",
      "severity",
      "userId",
      "sessionId",
      "ipAddress",
      "resource",
      "resourceId",
      "success",
      "errorMessage",
    ];

    const rows = logs.map(log => [
      log.timestamp.toISOString(),
      log.action,
      log.severity,
      log.userId || "",
      log.sessionId || "",
      log.ipAddress || "",
      log.resource || "",
      log.resourceId || "",
      log.success.toString(),
      log.errorMessage || "",
    ]);

    return [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
  }
}

// Singleton instance
export const auditLogger = AuditLogger.getInstance();

// Helper functions for common audit actions
export const audit = {
  userCreated: (userId: string, context?: Partial<AuditLogEntry>) =>
    auditLogger.logSuccess("user.create", "medium", { userId, ...context }),

  userUpdated: (userId: string, context?: Partial<AuditLogEntry>) =>
    auditLogger.logSuccess("user.update", "low", { userId, ...context }),

  userDeleted: (userId: string, context?: Partial<AuditLogEntry>) =>
    auditLogger.logSuccess("user.delete", "high", { userId, ...context }),

  conversationCreated: (
    userId: string,
    sessionId: string,
    context?: Partial<AuditLogEntry>
  ) =>
    auditLogger.logSuccess("conversation.create", "low", {
      userId,
      sessionId,
      ...context,
    }),

  contextQueried: (
    userId: string,
    sessionId: string,
    query: string,
    context?: Partial<AuditLogEntry>
  ) =>
    auditLogger.logSuccess("context.query", "low", {
      userId,
      sessionId,
      details: { query },
      ...context,
    }),

  dataEncrypted: (
    userId: string,
    resource: string,
    context?: Partial<AuditLogEntry>
  ) =>
    auditLogger.logSuccess("data.encrypt", "medium", {
      userId,
      resource,
      ...context,
    }),

  dataDecrypted: (
    userId: string,
    resource: string,
    context?: Partial<AuditLogEntry>
  ) =>
    auditLogger.logSuccess("data.decrypt", "medium", {
      userId,
      resource,
      ...context,
    }),

  privacyConsentGiven: (
    userId: string,
    consentType: string,
    context?: Partial<AuditLogEntry>
  ) => auditLogger.logPrivacy("consent", userId, { consentType }, context),

  privacyConsentWithdrawn: (
    userId: string,
    consentType: string,
    context?: Partial<AuditLogEntry>
  ) => auditLogger.logPrivacy("withdraw", userId, { consentType }, context),

  securityBreach: (
    details: Record<string, any>,
    context?: Partial<AuditLogEntry>
  ) => auditLogger.logSecurityIncident(details, context),
};
