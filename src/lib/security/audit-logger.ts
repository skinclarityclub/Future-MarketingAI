/**
 * Enterprise Audit Logger Service
 * Task 37.3: Develop Centralized Audit Logging System
 *
 * Comprehensive audit logging service for enterprise security compliance
 * Supports SOC 2, GDPR, and general enterprise audit requirements
 */

import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { createHash } from "crypto";

// Types for audit logging
export type AuditLogLevel =
  | "debug"
  | "info"
  | "warning"
  | "error"
  | "critical"
  | "security";

export type AuditEventCategory =
  | "authentication"
  | "authorization"
  | "data_access"
  | "data_modification"
  | "system_configuration"
  | "user_management"
  | "financial_transaction"
  | "api_access"
  | "file_access"
  | "database_operation"
  | "security_event"
  | "compliance_event";

export type AuditEventStatus =
  | "success"
  | "failure"
  | "warning"
  | "blocked"
  | "pending";

export interface AuditLogEntry {
  eventId?: string;
  eventCategory: AuditEventCategory;
  eventType: string;
  eventName: string;
  status?: AuditEventStatus;
  severity?: AuditLogLevel;

  // User context
  userId?: string;
  sessionId?: string;
  impersonatorId?: string;

  // Technical context
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  correlationId?: string;

  // Resource context
  resourceType?: string;
  resourceId?: string;
  resourceName?: string;

  // Event details
  message: string;
  details?: Record<string, any>;
  metadata?: Record<string, any>;

  // Data changes
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changedFields?: string[];

  // Request/Response
  requestMethod?: string;
  requestPath?: string;
  requestParams?: Record<string, any>;
  responseStatus?: number;
  responseTimeMs?: number;

  // Compliance
  complianceTags?: string[];
  riskScore?: number;
  requiresReview?: boolean;

  // Timing
  eventTimestamp?: Date;
}

export interface AuditConfig {
  retentionPeriod: string;
  enabledLevels: AuditLogLevel[];
  defaultLevel: AuditLogLevel;
  complianceStandards: {
    soc2: boolean;
    gdpr: boolean;
    sox: boolean;
    hipaa: boolean;
  };
  autoArchive: {
    enabled: boolean;
    archiveAfter: string;
    compress: boolean;
  };
  realTimeMonitoring: {
    enabled: boolean;
    alertThresholds: Record<string, number>;
  };
}

export interface UserSession {
  sessionId: string;
  userId?: string;
  loginTimestamp: Date;
  logoutTimestamp?: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  isSuspicious?: boolean;
  failedLoginAttempts?: number;
  mfaEnabled?: boolean;
  mfaVerified?: boolean;
  countryCode?: string;
  city?: string;
  timezone?: string;
  metadata?: Record<string, any>;
}

export interface SystemEvent {
  eventType: string;
  component: string;
  message: string;
  severity: AuditLogLevel;
  hostname?: string;
  processId?: number;
  threadId?: string;
  cpuUsage?: number;
  memoryUsageMb?: number;
  diskUsageMb?: number;
  details?: Record<string, any>;
  stackTrace?: string;
}

export interface ComplianceReport {
  reportType: string;
  reportName: string;
  reportPeriodStart: Date;
  reportPeriodEnd: Date;
  generatedBy?: string;
  status?: string;
  totalEvents?: number;
  securityEvents?: number;
  failedEvents?: number;
  highRiskEvents?: number;
  reportData?: Record<string, any>;
  reportFilePath?: string;
  reportFileSize?: number;
}

/**
 * Enterprise Audit Logger Class
 * Provides comprehensive audit logging functionality
 */
export class AuditLogger {
  private supabase: any;
  private config: AuditConfig | null = null;
  private static instance: AuditLogger;

  constructor() {
    // Initialize Supabase client with service role for audit logging
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    this.loadConfig();
  }

  /**
   * Singleton pattern for audit logger
   */
  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Load audit configuration from database
   */
  private async loadConfig(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from("audit_config")
        .select("config_key, config_value")
        .eq("is_active", true);

      if (error) {
        console.error("Failed to load audit config:", error);
        this.setDefaultConfig();
        return;
      }

      const configMap = data.reduce((acc: any, item: any) => {
        acc[item.config_key] = item.config_value;
        return acc;
      }, {});

      this.config = {
        retentionPeriod:
          configMap.retention_policy?.default_period || "7 years",
        enabledLevels: configMap.log_levels?.enabled_levels || [
          "info",
          "warning",
          "error",
          "critical",
          "security",
        ],
        defaultLevel: configMap.log_levels?.default_level || "info",
        complianceStandards: configMap.compliance_standards || {
          soc2: true,
          gdpr: true,
          sox: false,
          hipaa: false,
        },
        autoArchive: configMap.auto_archive || {
          enabled: true,
          archiveAfter: "1 year",
          compress: true,
        },
        realTimeMonitoring: configMap.real_time_monitoring || {
          enabled: true,
          alertThresholds: { critical: 1, security: 1, failed_login: 5 },
        },
      };
    } catch (error) {
      console.error("Error loading audit config:", error);
      this.setDefaultConfig();
    }
  }

  /**
   * Set default configuration
   */
  private setDefaultConfig(): void {
    this.config = {
      retentionPeriod: "7 years",
      enabledLevels: ["info", "warning", "error", "critical", "security"],
      defaultLevel: "info",
      complianceStandards: {
        soc2: true,
        gdpr: true,
        sox: false,
        hipaa: false,
      },
      autoArchive: {
        enabled: true,
        archiveAfter: "1 year",
        compress: true,
      },
      realTimeMonitoring: {
        enabled: true,
        alertThresholds: { critical: 1, security: 1, failed_login: 5 },
      },
    };
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `evt_${timestamp}_${random}`;
  }

  /**
   * Generate checksum for audit entry
   */
  private generateChecksum(entry: any): string {
    const data = `${entry.event_id}${entry.user_id || ""}${entry.event_timestamp}${entry.message}${JSON.stringify(entry.details || {})}${JSON.stringify(entry.old_values || {})}${JSON.stringify(entry.new_values || {})}`;
    return createHash("sha256").update(data).digest("hex");
  }

  /**
   * Determine compliance tags based on event category and type
   */
  private getComplianceTags(
    category: AuditEventCategory,
    eventType: string
  ): string[] {
    const tags: string[] = [];

    if (!this.config) return tags;

    // SOC 2 compliance tags
    if (this.config.complianceStandards.soc2) {
      if (
        ["authentication", "authorization", "security_event"].includes(category)
      ) {
        tags.push("SOC2_SECURITY");
      }
      if (["data_access", "data_modification"].includes(category)) {
        tags.push("SOC2_CONFIDENTIALITY");
      }
      if (category === "system_configuration") {
        tags.push("SOC2_PROCESSING_INTEGRITY");
      }
    }

    // GDPR compliance tags
    if (this.config.complianceStandards.gdpr) {
      if (
        ["data_access", "data_modification", "user_management"].includes(
          category
        )
      ) {
        tags.push("GDPR_DATA_PROCESSING");
      }
      if (eventType.includes("delete") || eventType.includes("export")) {
        tags.push("GDPR_DATA_RIGHTS");
      }
    }

    return tags;
  }

  /**
   * Calculate risk score based on event details
   */
  private calculateRiskScore(entry: AuditLogEntry): number {
    let score = 0;

    // Base score by severity
    switch (entry.severity) {
      case "critical":
        score += 4;
        break;
      case "security":
        score += 4;
        break;
      case "error":
        score += 2;
        break;
      case "warning":
        score += 1;
        break;
      default:
        score += 0;
    }

    // Additional risk factors
    if (entry.status === "failure" || entry.status === "blocked") score += 2;
    if (entry.eventCategory === "security_event") score += 3;
    if (entry.eventCategory === "financial_transaction") score += 2;
    if (entry.impersonatorId) score += 1; // Admin impersonation

    // Failed authentication attempts
    if (entry.eventType === "failed_login") {
      const attempts = entry.details?.attempts || 1;
      score += Math.min(attempts, 3);
    }

    return Math.min(score, 10); // Cap at 10
  }

  /**
   * Log an audit event
   */
  public async log(entry: AuditLogEntry): Promise<boolean> {
    try {
      if (!this.config) {
        await this.loadConfig();
      }

      // Check if log level is enabled
      const severity = entry.severity || this.config!.defaultLevel;
      if (!this.config!.enabledLevels.includes(severity)) {
        return true; // Skip logging but don't error
      }

      // Generate event ID if not provided
      const eventId = entry.eventId || this.generateEventId();

      // Calculate compliance tags and risk score
      const complianceTags =
        entry.complianceTags ||
        this.getComplianceTags(entry.eventCategory, entry.eventType);
      const riskScore = entry.riskScore || this.calculateRiskScore(entry);

      // Prepare audit log record
      const auditRecord = {
        event_id: eventId,
        event_category: entry.eventCategory,
        event_type: entry.eventType,
        event_name: entry.eventName,
        status: entry.status || "success",
        severity: severity,

        user_id: entry.userId || null,
        session_id: entry.sessionId || null,
        impersonator_id: entry.impersonatorId || null,

        ip_address: entry.ipAddress || null,
        user_agent: entry.userAgent || null,
        request_id: entry.requestId || null,
        correlation_id: entry.correlationId || null,

        resource_type: entry.resourceType || null,
        resource_id: entry.resourceId || null,
        resource_name: entry.resourceName || null,

        message: entry.message,
        details: entry.details || {},
        metadata: entry.metadata || {},

        old_values: entry.oldValues || null,
        new_values: entry.newValues || null,
        changed_fields: entry.changedFields || null,

        request_method: entry.requestMethod || null,
        request_path: entry.requestPath || null,
        request_params: entry.requestParams || null,
        response_status: entry.responseStatus || null,
        response_time_ms: entry.responseTimeMs || null,

        compliance_tags: complianceTags,
        risk_score: riskScore,
        requires_review: entry.requiresReview || riskScore >= 7,

        event_timestamp: entry.eventTimestamp || new Date(),
        retention_period: this.config!.retentionPeriod,
      };

      // Insert audit log
      const { error } = await this.supabase
        .from("audit_logs")
        .insert([auditRecord]);

      if (error) {
        console.error("Failed to insert audit log:", error);
        return false;
      }

      // Trigger real-time monitoring if enabled
      if (this.config!.realTimeMonitoring.enabled) {
        await this.checkAlertThresholds(auditRecord);
      }

      return true;
    } catch (error) {
      console.error("Error logging audit event:", error);
      return false;
    }
  }

  /**
   * Log user session events
   */
  public async logSession(session: UserSession): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("audit_user_sessions").upsert(
        [
          {
            session_id: session.sessionId,
            user_id: session.userId || null,
            login_timestamp: session.loginTimestamp,
            logout_timestamp: session.logoutTimestamp || null,
            session_duration: session.logoutTimestamp
              ? `${Math.floor((session.logoutTimestamp.getTime() - session.loginTimestamp.getTime()) / 1000)} seconds`
              : null,
            ip_address: session.ipAddress || null,
            user_agent: session.userAgent || null,
            device_fingerprint: session.deviceFingerprint || null,
            is_suspicious: session.isSuspicious || false,
            failed_login_attempts: session.failedLoginAttempts || 0,
            mfa_enabled: session.mfaEnabled || false,
            mfa_verified: session.mfaVerified || false,
            country_code: session.countryCode || null,
            city: session.city || null,
            timezone: session.timezone || null,
            metadata: session.metadata || {},
          },
        ],
        {
          onConflict: "session_id",
        }
      );

      if (error) {
        console.error("Failed to log user session:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error logging user session:", error);
      return false;
    }
  }

  /**
   * Log system events
   */
  public async logSystemEvent(event: SystemEvent): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("audit_system_events").insert([
        {
          event_type: event.eventType,
          component: event.component,
          message: event.message,
          severity: event.severity,
          hostname: event.hostname || null,
          process_id: event.processId || null,
          thread_id: event.threadId || null,
          cpu_usage: event.cpuUsage || null,
          memory_usage_mb: event.memoryUsageMb || null,
          disk_usage_mb: event.diskUsageMb || null,
          details: event.details || {},
          stack_trace: event.stackTrace || null,
          event_timestamp: new Date(),
        },
      ]);

      if (error) {
        console.error("Failed to log system event:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error logging system event:", error);
      return false;
    }
  }

  /**
   * Check alert thresholds and trigger notifications
   */
  private async checkAlertThresholds(auditRecord: any): Promise<void> {
    if (!this.config?.realTimeMonitoring.enabled) return;

    const thresholds = this.config.realTimeMonitoring.alertThresholds;

    // Check for critical events
    if (auditRecord.severity === "critical" && thresholds.critical <= 1) {
      await this.triggerAlert("critical_event", auditRecord);
    }

    // Check for security events
    if (auditRecord.severity === "security" && thresholds.security <= 1) {
      await this.triggerAlert("security_event", auditRecord);
    }

    // Check for failed login patterns
    if (auditRecord.event_type === "failed_login") {
      const recentFailures = await this.getRecentFailedLogins(
        auditRecord.ip_address
      );
      if (recentFailures >= thresholds.failed_login) {
        await this.triggerAlert("multiple_failed_logins", {
          ...auditRecord,
          failure_count: recentFailures,
        });
      }
    }
  }

  /**
   * Get recent failed login count for IP address
   */
  private async getRecentFailedLogins(ipAddress: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from("audit_logs")
        .select("id")
        .eq("event_type", "failed_login")
        .eq("ip_address", ipAddress)
        .gte(
          "event_timestamp",
          new Date(Date.now() - 60 * 60 * 1000).toISOString()
        ); // Last hour

      if (error) return 0;
      return data?.length || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Trigger security alert
   */
  private async triggerAlert(alertType: string, data: any): Promise<void> {
    // In a real implementation, this would integrate with alerting systems
    // like PagerDuty, Slack, email notifications, etc.
    console.warn(`SECURITY ALERT [${alertType}]:`, {
      timestamp: new Date().toISOString(),
      alert_type: alertType,
      event_id: data.event_id,
      severity: data.severity,
      user_id: data.user_id,
      ip_address: data.ip_address,
      message: data.message,
    });

    // Log the alert as a system event
    await this.logSystemEvent({
      eventType: "security_alert",
      component: "audit_logger",
      message: `Security alert triggered: ${alertType}`,
      severity: "critical",
      details: {
        alert_type: alertType,
        triggered_by: data.event_id,
        original_event: data,
      },
    });
  }

  /**
   * Generate compliance report
   */
  public async generateComplianceReport(
    report: ComplianceReport
  ): Promise<string | null> {
    try {
      // Get audit logs for the specified period
      const { data: auditData, error: auditError } = await this.supabase
        .from("audit_logs")
        .select("*")
        .gte("event_timestamp", report.reportPeriodStart.toISOString())
        .lte("event_timestamp", report.reportPeriodEnd.toISOString());

      if (auditError) {
        console.error("Failed to fetch audit data for report:", auditError);
        return null;
      }

      // Calculate report statistics
      const totalEvents = auditData?.length || 0;
      const securityEvents =
        auditData?.filter(
          log =>
            log.event_category === "security_event" ||
            log.severity === "security"
        ).length || 0;
      const failedEvents =
        auditData?.filter(
          log => log.status === "failure" || log.status === "blocked"
        ).length || 0;
      const highRiskEvents =
        auditData?.filter(log => log.risk_score >= 7).length || 0;

      // Create report data structure
      const reportData = {
        summary: {
          total_events: totalEvents,
          security_events: securityEvents,
          failed_events: failedEvents,
          high_risk_events: highRiskEvents,
          report_period: {
            start: report.reportPeriodStart.toISOString(),
            end: report.reportPeriodEnd.toISOString(),
          },
        },
        events_by_category: this.groupEventsByCategory(auditData || []),
        security_incidents:
          auditData?.filter(
            log =>
              log.severity === "security" ||
              log.event_category === "security_event"
          ) || [],
        compliance_coverage: this.analyzeComplianceCoverage(auditData || []),
        recommendations: this.generateRecommendations(auditData || []),
      };

      // Insert report record
      const { data: reportRecord, error: reportError } = await this.supabase
        .from("audit_compliance_reports")
        .insert([
          {
            report_type: report.reportType,
            report_name: report.reportName,
            report_period_start: report.reportPeriodStart,
            report_period_end: report.reportPeriodEnd,
            generated_by: report.generatedBy || null,
            status: "complete",
            total_events: totalEvents,
            security_events: securityEvents,
            failed_events: failedEvents,
            high_risk_events: highRiskEvents,
            report_data: reportData,
            completed_at: new Date(),
          },
        ])
        .select()
        .single();

      if (reportError) {
        console.error("Failed to save compliance report:", reportError);
        return null;
      }

      return reportRecord.id;
    } catch (error) {
      console.error("Error generating compliance report:", error);
      return null;
    }
  }

  /**
   * Group events by category for reporting
   */
  private groupEventsByCategory(events: any[]): Record<string, number> {
    return events.reduce((acc, event) => {
      acc[event.event_category] = (acc[event.event_category] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Analyze compliance coverage
   */
  private analyzeComplianceCoverage(events: any[]): Record<string, any> {
    const coverage = {
      soc2: {
        security: 0,
        availability: 0,
        processing_integrity: 0,
        confidentiality: 0,
        privacy: 0,
      },
      gdpr: {
        data_processing: 0,
        data_rights: 0,
        consent_management: 0,
      },
    };

    events.forEach(event => {
      if (event.compliance_tags?.includes("SOC2_SECURITY")) {
        coverage.soc2.security++;
      }
      if (event.compliance_tags?.includes("SOC2_CONFIDENTIALITY")) {
        coverage.soc2.confidentiality++;
      }
      if (event.compliance_tags?.includes("SOC2_PROCESSING_INTEGRITY")) {
        coverage.soc2.processing_integrity++;
      }
      if (event.compliance_tags?.includes("GDPR_DATA_PROCESSING")) {
        coverage.gdpr.data_processing++;
      }
      if (event.compliance_tags?.includes("GDPR_DATA_RIGHTS")) {
        coverage.gdpr.data_rights++;
      }
    });

    return coverage;
  }

  /**
   * Generate security recommendations based on audit data
   */
  private generateRecommendations(events: any[]): string[] {
    const recommendations: string[] = [];

    const failedLogins = events.filter(
      e => e.event_type === "failed_login"
    ).length;
    const securityEvents = events.filter(e => e.severity === "security").length;
    const highRiskEvents = events.filter(e => e.risk_score >= 7).length;

    if (failedLogins > 100) {
      recommendations.push(
        "Consider implementing additional rate limiting for login attempts"
      );
    }

    if (securityEvents > 50) {
      recommendations.push(
        "Review security event patterns and consider enhancing monitoring"
      );
    }

    if (highRiskEvents > 20) {
      recommendations.push("Implement automated response for high-risk events");
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Security posture appears healthy based on current audit data"
      );
    }

    return recommendations;
  }

  /**
   * Get audit logs with pagination and filtering
   */
  public async getAuditLogs(
    filters: {
      startDate?: Date;
      endDate?: Date;
      userId?: string;
      category?: AuditEventCategory;
      severity?: AuditLogLevel;
      status?: AuditEventStatus;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ data: any[]; total: number }> {
    try {
      let query = this.supabase
        .from("audit_logs")
        .select("*", { count: "exact" });

      // Apply filters
      if (filters.startDate) {
        query = query.gte("event_timestamp", filters.startDate.toISOString());
      }
      if (filters.endDate) {
        query = query.lte("event_timestamp", filters.endDate.toISOString());
      }
      if (filters.userId) {
        query = query.eq("user_id", filters.userId);
      }
      if (filters.category) {
        query = query.eq("event_category", filters.category);
      }
      if (filters.severity) {
        query = query.eq("severity", filters.severity);
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      // Apply pagination
      const limit = filters.limit || 100;
      const offset = filters.offset || 0;
      query = query.range(offset, offset + limit - 1);

      // Order by timestamp descending
      query = query.order("event_timestamp", { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error("Failed to fetch audit logs:", error);
        return { data: [], total: 0 };
      }

      return { data: data || [], total: count || 0 };
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return { data: [], total: 0 };
    }
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance();

// Convenience methods for common audit events
export const auditEvents = {
  // Authentication events
  loginSuccess: (
    userId: string,
    sessionId: string,
    ipAddress?: string,
    userAgent?: string
  ) =>
    auditLogger.log({
      eventCategory: "authentication",
      eventType: "login_success",
      eventName: "User Login Successful",
      userId,
      sessionId,
      ipAddress,
      userAgent,
      message: `User ${userId} logged in successfully`,
      severity: "info",
    }),

  loginFailure: (
    userId: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string
  ) =>
    auditLogger.log({
      eventCategory: "authentication",
      eventType: "failed_login",
      eventName: "User Login Failed",
      userId,
      ipAddress,
      userAgent,
      message: `Login failed for user ${userId}: ${reason}`,
      severity: "warning",
      status: "failure",
      details: { failure_reason: reason },
    }),

  logout: (userId: string, sessionId: string) =>
    auditLogger.log({
      eventCategory: "authentication",
      eventType: "logout",
      eventName: "User Logout",
      userId,
      sessionId,
      message: `User ${userId} logged out`,
      severity: "info",
    }),

  // Data access events
  dataAccess: (
    userId: string,
    resourceType: string,
    resourceId: string,
    action: string
  ) =>
    auditLogger.log({
      eventCategory: "data_access",
      eventType: "data_read",
      eventName: "Data Access",
      userId,
      resourceType,
      resourceId,
      message: `User ${userId} accessed ${resourceType} ${resourceId} (${action})`,
      severity: "info",
      details: { action },
    }),

  dataModification: (
    userId: string,
    resourceType: string,
    resourceId: string,
    oldValues: any,
    newValues: any
  ) =>
    auditLogger.log({
      eventCategory: "data_modification",
      eventType: "data_update",
      eventName: "Data Modification",
      userId,
      resourceType,
      resourceId,
      message: `User ${userId} modified ${resourceType} ${resourceId}`,
      severity: "info",
      oldValues,
      newValues,
      changedFields: Object.keys(newValues),
    }),

  // Security events
  securityIncident: (
    eventType: string,
    description: string,
    riskScore: number,
    details?: any
  ) =>
    auditLogger.log({
      eventCategory: "security_event",
      eventType,
      eventName: "Security Incident",
      message: description,
      severity: "security",
      riskScore,
      requiresReview: true,
      details,
    }),

  // API access events
  apiAccess: (
    userId: string,
    method: string,
    path: string,
    status: number,
    responseTime: number,
    ipAddress?: string
  ) =>
    auditLogger.log({
      eventCategory: "api_access",
      eventType: "api_call",
      eventName: "API Access",
      userId,
      ipAddress,
      requestMethod: method,
      requestPath: path,
      responseStatus: status,
      responseTimeMs: responseTime,
      message: `API ${method} ${path} - ${status}`,
      severity: status >= 400 ? "warning" : "info",
      status: status >= 400 ? "failure" : "success",
    }),
};

export default AuditLogger;
