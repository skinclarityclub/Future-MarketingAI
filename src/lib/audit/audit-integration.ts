/**
 * Audit Integration Service
 * Task 37.15: Integrate Audit Logging System with Existing Systems
 *
 * Provides seamless integration of audit logging with all existing enterprise systems
 */

import { NextRequest, NextResponse } from "next/server";
import { AuditLogger, AuditLogEntry } from "@/lib/security/audit-logger";
import { AuditSecurityService } from "@/lib/security/audit-security";
import { RBACService } from "@/lib/rbac/rbac-service";

export interface SystemIntegrationConfig {
  systemName: string;
  enabled: boolean;
  logLevel: "minimal" | "standard" | "detailed";
  encryptSensitiveData: boolean;
  realTimeAlerts: boolean;
  complianceMode: boolean;
}

export interface AuditableRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditableResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body?: any;
  processingTime: number;
}

export interface SystemEvent {
  system: string;
  eventType: string;
  eventName: string;
  description: string;
  data?: any;
  userId?: string;
  severity: "low" | "medium" | "high" | "critical";
  category: string;
}

/**
 * Centralized audit integration service for all enterprise systems
 */
export class AuditIntegrationService {
  private static instance: AuditIntegrationService;
  private auditLogger: AuditLogger;
  private securityService: AuditSecurityService;
  private rbacService: RBACService;
  private systemConfigs: Map<string, SystemIntegrationConfig> = new Map();

  private constructor() {
    this.auditLogger = AuditLogger.getInstance();
    this.securityService = AuditSecurityService.getInstance();
    this.rbacService = new RBACService(true); // Server-side RBAC service
    this.initializeSystemConfigs();
  }

  public static getInstance(): AuditIntegrationService {
    if (!AuditIntegrationService.instance) {
      AuditIntegrationService.instance = new AuditIntegrationService();
    }
    return AuditIntegrationService.instance;
  }

  /**
   * Initialize default configurations for all systems
   */
  private initializeSystemConfigs(): void {
    const systems = [
      "authentication",
      "authorization",
      "financial",
      "dashboard",
      "monitoring",
      "predictive-analytics",
      "customer-intelligence",
      "marketing",
      "security",
      "workflows",
      "webhooks",
      "oauth",
      "tracking",
      "ml",
      "nlp",
      "crypto",
      "budget",
      "performance",
      "tactical-analysis",
      "content-roi",
      "optimization",
    ];

    systems.forEach(system => {
      this.systemConfigs.set(system, {
        systemName: system,
        enabled: true,
        logLevel:
          system.includes("security") || system.includes("auth")
            ? "detailed"
            : "standard",
        encryptSensitiveData:
          system.includes("financial") ||
          system.includes("security") ||
          system.includes("auth"),
        realTimeAlerts: system.includes("security") || system.includes("auth"),
        complianceMode: true,
      });
    });
  }

  /**
   * Audit HTTP API request/response cycle
   */
  public async auditAPIRequest(
    request: AuditableRequest,
    response: AuditableResponse,
    systemName: string,
    additionalContext?: any
  ): Promise<void> {
    const config = this.systemConfigs.get(systemName);
    if (!config?.enabled) return;

    try {
      // Determine if this is a sensitive operation
      const isSensitive = this.isSensitiveOperation(request, systemName);

      // Create audit entry
      const auditEntry: AuditLogEntry = {
        eventCategory: "api_access",
        eventType: "http_request",
        eventName: `${systemName.toUpperCase()} API Request`,
        message: `${request.method} ${request.url} -> ${response.status}`,
        status: response.status >= 400 ? "failure" : "success",
        severity: this.determineSeverity(request, response, systemName),
        userId: request.userId,
        sessionId: request.sessionId,
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        resourceType: "api_endpoint",
        resourceName: request.url,
        requestMethod: request.method,
        requestPath: request.url,
        responseStatus: response.status,
        responseTimeMs: response.processingTime,
        details: {
          system: systemName,
          method: request.method,
          url: request.url,
          statusCode: response.status,
          processingTimeMs: response.processingTime,
          requestHeaders: this.sanitizeHeaders(request.headers),
          responseHeaders: this.sanitizeHeaders(response.headers),
          ...(config.logLevel === "detailed" && {
            requestBody:
              config.encryptSensitiveData && isSensitive
                ? this.securityService.encryptAuditData(request.body)
                : request.body,
            responseBody:
              config.encryptSensitiveData && isSensitive
                ? this.securityService.encryptAuditData(response.body)
                : response.body,
          }),
          additionalContext,
        },
        complianceTags: this.getComplianceTags(systemName, request),
        eventTimestamp: new Date(),
      };

      // Log the audit entry
      await this.auditLogger.log(auditEntry);

      // Send real-time alerts if configured
      if (config.realTimeAlerts && this.shouldAlert(auditEntry)) {
        await this.sendRealTimeAlert(auditEntry, systemName);
      }
    } catch (error) {
      console.error(`Failed to audit API request for ${systemName}:`, error);
      // Log the audit failure itself
      await this.auditLogger.log({
        eventCategory: "system_configuration",
        eventType: "audit_failure",
        eventName: "API Audit Failed",
        message: `Failed to audit ${systemName} API request: ${(error as Error).message}`,
        status: "failure",
        severity: "error",
        details: { error: (error as Error).message, system: systemName },
        eventTimestamp: new Date(),
      });
    }
  }

  /**
   * Audit general system events
   */
  public async auditSystemEvent(event: SystemEvent): Promise<void> {
    const config = this.systemConfigs.get(event.system);
    if (!config?.enabled) return;

    try {
      const auditEntry: AuditLogEntry = {
        eventCategory: event.category,
        eventType: event.eventType,
        eventName: event.eventName,
        message: event.description,
        status: "success",
        severity: event.severity,
        userId: event.userId,
        resourceType: "system_component",
        resourceName: event.system,
        details: {
          system: event.system,
          eventData:
            config.encryptSensitiveData && this.isSensitiveEvent(event)
              ? this.securityService.encryptAuditData(event.data)
              : event.data,
        },
        compliance_tags: this.getComplianceTags(event.system),
        event_timestamp: new Date(),
      };

      await this.auditLogger.log(auditEntry);

      // Real-time alerts for critical events
      if (config.realTimeAlerts && event.severity === "critical") {
        await this.sendRealTimeAlert(auditEntry, event.system);
      }
    } catch (error) {
      console.error(`Failed to audit system event for ${event.system}:`, error);
    }
  }

  /**
   * Audit user authentication events
   */
  public async auditAuthenticationEvent(
    eventType:
      | "login"
      | "logout"
      | "failed_login"
      | "password_change"
      | "mfa_challenge",
    userId: string,
    details: any,
    request?: AuditableRequest
  ): Promise<void> {
    try {
      const auditEntry: AuditLogEntry = {
        eventCategory: "authentication",
        eventType: eventType,
        eventName: `User ${eventType.replace("_", " ")}`,
        message: `User authentication event: ${eventType}`,
        status: eventType.includes("failed") ? "failure" : "success",
        severity: eventType.includes("failed") ? "warning" : "info",
        userId: userId,
        ipAddress: request?.ipAddress,
        userAgent: request?.userAgent,
        resourceType: "user_session",
        resourceName: userId,
        details: {
          system: "authentication",
          authenticationMethod: details.method,
          ...details,
        },
        compliance_tags: ["authentication", "security", "gdpr"],
        event_timestamp: new Date(),
      };

      await this.auditLogger.log(auditEntry);

      // Alert on failed login attempts
      if (eventType === "failed_login") {
        await this.sendRealTimeAlert(auditEntry, "authentication");
      }
    } catch (error) {
      console.error("Failed to audit authentication event:", error);
    }
  }

  /**
   * Audit data access events for compliance
   */
  public async auditDataAccess(
    operation: "read" | "write" | "delete" | "export",
    dataType: string,
    recordId: string,
    userId: string,
    details?: any
  ): Promise<void> {
    try {
      const auditEntry: AuditLogEntry = {
        eventCategory: "data_access",
        eventType: operation,
        eventName: `Data ${operation} operation`,
        message: `User ${operation} ${dataType} record ${recordId}`,
        status: "success",
        severity:
          operation === "delete"
            ? "high"
            : operation === "export"
              ? "medium"
              : "low",
        userId: userId,
        resourceType: dataType,
        resourceName: recordId,
        details: {
          system: "data_access",
          operation,
          dataType,
          recordId,
          ...details,
        },
        compliance_tags: ["data_access", "gdpr", "audit_trail"],
        event_timestamp: new Date(),
      };

      await this.auditLogger.log(auditEntry);
    } catch (error) {
      console.error("Failed to audit data access:", error);
    }
  }

  /**
   * Create audit middleware for Next.js API routes
   */
  public createAuditMiddleware(systemName: string) {
    return async (request: NextRequest): Promise<NextResponse | void> => {
      const startTime = Date.now();

      // Extract request information
      const auditableRequest: AuditableRequest = {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
        userId: request.headers.get("x-user-id") || undefined,
        sessionId: request.headers.get("x-session-id") || undefined,
        ipAddress:
          request.headers.get("x-forwarded-for")?.split(",")[0] ||
          request.headers.get("x-real-ip") ||
          "unknown",
        userAgent: request.headers.get("user-agent") || undefined,
      };

      // Add body for POST/PUT requests
      if (["POST", "PUT", "PATCH"].includes(request.method)) {
        try {
          auditableRequest.body = await request.json();
        } catch {
          // Body might not be JSON or might be empty
        }
      }

      // Store for later use in response handler
      (request as any).auditContext = {
        startTime,
        auditableRequest,
        systemName,
      };
    };
  }

  /**
   * Handle audit logging for response
   */
  public async auditResponse(
    request: NextRequest,
    response: NextResponse
  ): Promise<void> {
    const auditContext = (request as any).auditContext;
    if (!auditContext) return;

    const { startTime, auditableRequest, systemName } = auditContext;
    const processingTime = Date.now() - startTime;

    const auditableResponse: AuditableResponse = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      processingTime,
    };

    await this.auditAPIRequest(auditableRequest, auditableResponse, systemName);
  }

  /**
   * Determine if operation contains sensitive data
   */
  private isSensitiveOperation(
    request: AuditableRequest,
    systemName: string
  ): boolean {
    const sensitiveEndpoints = [
      "/api/oauth",
      "/api/auth",
      "/api/financial",
      "/api/security",
      "/api/crypto",
      "/api/budget",
      "/api/customer-intelligence",
    ];

    const sensitiveParams = [
      "password",
      "token",
      "key",
      "secret",
      "credential",
    ];

    return (
      sensitiveEndpoints.some(endpoint => request.url.includes(endpoint)) ||
      sensitiveParams.some(param =>
        JSON.stringify(request.body || {})
          .toLowerCase()
          .includes(param)
      ) ||
      systemName.includes("security") ||
      systemName.includes("auth") ||
      systemName.includes("financial")
    );
  }

  /**
   * Determine if event contains sensitive data
   */
  private isSensitiveEvent(event: SystemEvent): boolean {
    const sensitiveTypes = [
      "password",
      "token",
      "key",
      "credential",
      "payment",
    ];
    return sensitiveTypes.some(
      type =>
        event.eventType.toLowerCase().includes(type) ||
        JSON.stringify(event.data || {})
          .toLowerCase()
          .includes(type)
    );
  }

  /**
   * Determine audit severity based on request/response
   */
  private determineSeverity(
    request: AuditableRequest,
    response: AuditableResponse,
    systemName: string
  ): "info" | "warning" | "error" | "critical" {
    if (response.status >= 500) return "critical";
    if (response.status >= 400) return "error";
    if (systemName.includes("security") || systemName.includes("auth"))
      return "warning";
    return "info";
  }

  /**
   * Sanitize headers to remove sensitive information
   */
  private sanitizeHeaders(
    headers: Record<string, string>
  ): Record<string, string> {
    const sanitized = { ...headers };
    const sensitiveHeaders = [
      "authorization",
      "cookie",
      "x-api-key",
      "x-access-token",
    ];

    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = "[REDACTED]";
      }
    });

    return sanitized;
  }

  /**
   * Get compliance tags for the system
   */
  private getComplianceTags(
    systemName: string,
    request?: AuditableRequest
  ): string[] {
    const baseTags = ["audit_trail"];

    if (systemName.includes("financial") || systemName.includes("budget")) {
      baseTags.push("sox", "financial_compliance");
    }

    if (systemName.includes("security") || systemName.includes("auth")) {
      baseTags.push("security_compliance", "access_control");
    }

    if (systemName.includes("customer") || request?.url.includes("user")) {
      baseTags.push("gdpr", "privacy");
    }

    return baseTags;
  }

  /**
   * Determine if alert should be sent
   */
  private shouldAlert(auditEntry: AuditLogEntry): boolean {
    return (
      auditEntry.severity === "critical" ||
      auditEntry.severity === "error" ||
      (auditEntry.eventCategory === "authentication" &&
        auditEntry.status === "failure")
    );
  }

  /**
   * Send real-time alert for critical events
   */
  private async sendRealTimeAlert(
    auditEntry: AuditLogEntry,
    systemName: string
  ): Promise<void> {
    try {
      // This would integrate with notification system (email, Slack, etc.)
      console.warn(`AUDIT ALERT [${systemName.toUpperCase()}]:`, {
        event: auditEntry.eventName,
        severity: auditEntry.severity,
        user: auditEntry.userId,
        timestamp: auditEntry.event_timestamp,
      });

      // Could also send to monitoring systems like DataDog, New Relic, etc.
    } catch (error) {
      console.error("Failed to send audit alert:", error);
    }
  }

  /**
   * Get integration statistics
   */
  public getIntegrationStats(): {
    enabledSystems: number;
    totalSystems: number;
    encryptedSystems: number;
    realTimeAlerts: number;
  } {
    const enabled = Array.from(this.systemConfigs.values()).filter(
      c => c.enabled
    );
    const encrypted = enabled.filter(c => c.encryptSensitiveData);
    const alerts = enabled.filter(c => c.realTimeAlerts);

    return {
      enabledSystems: enabled.length,
      totalSystems: this.systemConfigs.size,
      encryptedSystems: encrypted.length,
      realTimeAlerts: alerts.length,
    };
  }

  /**
   * Update system configuration
   */
  public updateSystemConfig(
    systemName: string,
    config: Partial<SystemIntegrationConfig>
  ): void {
    const existing = this.systemConfigs.get(systemName);
    if (existing) {
      this.systemConfigs.set(systemName, { ...existing, ...config });
    }
  }
}
