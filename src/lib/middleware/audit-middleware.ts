/**
 * Audit Middleware Integration
 * Task 37.15: Integrate Audit Logging System with Existing Systems
 *
 * Middleware that automatically audits all API requests and system events
 */

import { NextRequest, NextResponse } from "next/server";
import { AuditLogger } from "@/lib/security/audit-logger";

interface MiddlewareAuditContext {
  startTime: number;
  requestId: string;
  systemName: string;
  userId?: string;
  sessionId?: string;
}

/**
 * Enhanced middleware with audit logging capabilities
 */
export class AuditMiddleware {
  private static auditLogger = AuditLogger.getInstance();

  /**
   * Create audit-enabled middleware wrapper
   */
  static withAudit(systemName: string) {
    return async (request: NextRequest): Promise<NextResponse> => {
      const startTime = Date.now();
      const requestId = crypto.randomUUID();

      // Extract user context from headers or cookies
      const userId =
        request.headers.get("x-user-id") ||
        request.cookies.get("user_id")?.value;
      const sessionId =
        request.headers.get("x-session-id") ||
        request.cookies.get("session_id")?.value;

      // Create audit context
      const auditContext: MiddlewareAuditContext = {
        startTime,
        requestId,
        systemName,
        userId,
        sessionId,
      };

      // Add audit context to request
      (request as any).auditContext = auditContext;

      // Log request initiation
      await this.auditLogger.log({
        eventCategory: "api_access",
        eventType: "request_initiated",
        eventName: `${systemName} Request Started`,
        message: `${request.method} ${request.url}`,
        userId,
        sessionId,
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get("user-agent") || undefined,
        resourceType: "api_endpoint",
        resourceName: request.url,
        requestMethod: request.method,
        requestPath: request.url,
        details: {
          requestId,
          system: systemName,
          headers: this.sanitizeHeaders(request.headers),
        },
        eventTimestamp: new Date(),
      });

      return NextResponse.next();
    };
  }

  /**
   * Log response completion
   */
  static async logResponse(
    request: NextRequest,
    response: NextResponse
  ): Promise<void> {
    const auditContext = (request as any)
      .auditContext as MiddlewareAuditContext;
    if (!auditContext) return;

    const processingTime = Date.now() - auditContext.startTime;
    const isError = response.status >= 400;

    await this.auditLogger.log({
      eventCategory: "api_access",
      eventType: "request_completed",
      eventName: `${auditContext.systemName} Request Completed`,
      message: `${request.method} ${request.url} -> ${response.status}`,
      status: isError ? "failure" : "success",
      severity: this.determineSeverity(response.status),
      userId: auditContext.userId,
      sessionId: auditContext.sessionId,
      ipAddress: this.getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
      resourceType: "api_endpoint",
      resourceName: request.url,
      requestMethod: request.method,
      requestPath: request.url,
      responseStatus: response.status,
      responseTimeMs: processingTime,
      details: {
        requestId: auditContext.requestId,
        system: auditContext.systemName,
        processingTimeMs: processingTime,
        responseHeaders: this.sanitizeHeaders(response.headers),
      },
      eventTimestamp: new Date(),
    });
  }

  /**
   * Extract client IP address
   */
  private static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");
    const cfIP = request.headers.get("cf-connecting-ip");

    if (forwarded) return forwarded.split(",")[0].trim();
    if (realIP) return realIP;
    if (cfIP) return cfIP;

    return "unknown";
  }

  /**
   * Sanitize headers to remove sensitive data
   */
  private static sanitizeHeaders(headers: Headers): Record<string, string> {
    const sanitized: Record<string, string> = {};
    const sensitiveHeaders = [
      "authorization",
      "cookie",
      "x-api-key",
      "x-access-token",
    ];

    headers.forEach((value, key) => {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

  /**
   * Determine log severity based on response status
   */
  private static determineSeverity(
    status: number
  ): "info" | "warning" | "error" | "critical" {
    if (status >= 500) return "critical";
    if (status >= 400) return "error";
    if (status >= 300) return "warning";
    return "info";
  }
}

/**
 * Pre-built middleware for common systems
 */
export const createSystemMiddleware = {
  authentication: () => AuditMiddleware.withAudit("authentication"),
  financial: () => AuditMiddleware.withAudit("financial"),
  security: () => AuditMiddleware.withAudit("security"),
  dashboard: () => AuditMiddleware.withAudit("dashboard"),
  analytics: () => AuditMiddleware.withAudit("analytics"),
  monitoring: () => AuditMiddleware.withAudit("monitoring"),
  workflows: () => AuditMiddleware.withAudit("workflows"),
  webhooks: () => AuditMiddleware.withAudit("webhooks"),
  customerIntelligence: () =>
    AuditMiddleware.withAudit("customer-intelligence"),
  marketing: () => AuditMiddleware.withAudit("marketing"),
};
