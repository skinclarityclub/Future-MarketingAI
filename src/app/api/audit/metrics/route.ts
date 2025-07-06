/**
 * Audit Metrics API Endpoint
 * Task 37.8: Create API Endpoints for Log Management
 *
 * RESTful API for audit metrics and statistics
 */

import { NextRequest, NextResponse } from "next/server";
import { AuditLogger } from "@/lib/security/audit-logger";
import { protectAPIRoute } from "@/lib/rbac/rbac-middleware";

/**
 * GET /api/audit/metrics
 * Get audit metrics and statistics
 * Requires: auditor, security_admin, admin, or super_admin role
 */
export async function GET(request: NextRequest) {
  try {
    // Protect route with RBAC
    const authResult = await protectAPIRoute(request, [
      "auditor",
      "security_admin",
      "admin",
      "super_admin",
    ]);
    if (!authResult.allowed) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", message: authResult.reason },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const auditLogger = AuditLogger.getInstance();

    // Get time range for metrics (default to last 24 hours)
    const timeRange = searchParams.get("timeRange") || "24h";
    let startDate: Date;

    switch (timeRange) {
      case "1h":
        startDate = new Date(Date.now() - 60 * 60 * 1000);
        break;
      case "24h":
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    const endDate = new Date();

    // Get audit logs for the time range
    const result = await auditLogger.getAuditLogs({
      startDate,
      endDate,
      limit: 10000, // Get more records for accurate metrics
    });

    const logs = result.data;

    // Calculate metrics
    const metrics = {
      overview: {
        totalEvents: logs.length,
        totalUsers: new Set(
          logs.filter((log: any) => log.user_id).map((log: any) => log.user_id)
        ).size,
        totalSessions: new Set(
          logs
            .filter((log: any) => log.session_id)
            .map((log: any) => log.session_id)
        ).size,
        averageRiskScore:
          logs.reduce(
            (sum: number, log: any) => sum + (log.risk_score || 0),
            0
          ) / logs.length || 0,
      },

      eventsByCategory: logs.reduce((acc: any, log: any) => {
        acc[log.event_category] = (acc[log.event_category] || 0) + 1;
        return acc;
      }, {}),

      eventsBySeverity: logs.reduce((acc: any, log: any) => {
        acc[log.severity] = (acc[log.severity] || 0) + 1;
        return acc;
      }, {}),

      eventsByStatus: logs.reduce((acc: any, log: any) => {
        acc[log.status] = (acc[log.status] || 0) + 1;
        return acc;
      }, {}),

      securityEvents: {
        total: logs.filter(
          (log: any) => log.event_category === "security_event"
        ).length,
        highRisk: logs.filter((log: any) => (log.risk_score || 0) >= 7).length,
        requiresReview: logs.filter((log: any) => log.requires_review).length,
        failedAuthentications: logs.filter(
          (log: any) =>
            log.event_category === "authentication" && log.status === "failure"
        ).length,
      },

      compliance: {
        soc2Events: logs.filter((log: any) =>
          (log.compliance_tags || []).includes("soc2")
        ).length,
        gdprEvents: logs.filter((log: any) =>
          (log.compliance_tags || []).includes("gdpr")
        ).length,
        auditAccess: logs.filter((log: any) =>
          (log.compliance_tags || []).includes("audit_access")
        ).length,
      },

      trends: {
        hourlyDistribution: logs.reduce((acc: any, log: any) => {
          const hour = new Date(log.event_timestamp).getHours();
          acc[hour] = (acc[hour] || 0) + 1;
          return acc;
        }, {}),

        dailyTrend: (() => {
          const days: any = {};
          logs.forEach((log: any) => {
            const day = new Date(log.event_timestamp)
              .toISOString()
              .split("T")[0];
            days[day] = (days[day] || 0) + 1;
          });
          return days;
        })(),
      },

      topUsers: (() => {
        const userCounts = logs.reduce((acc: any, log: any) => {
          if (log.user_id) {
            acc[log.user_id] = (acc[log.user_id] || 0) + 1;
          }
          return acc;
        }, {});

        return Object.entries(userCounts)
          .sort(([, a]: any, [, b]: any) => b - a)
          .slice(0, 10)
          .map(([userId, count]) => ({ userId, count }));
      })(),

      topIpAddresses: (() => {
        const ipCounts = logs.reduce((acc: any, log: any) => {
          if (log.ip_address) {
            acc[log.ip_address] = (acc[log.ip_address] || 0) + 1;
          }
          return acc;
        }, {});

        return Object.entries(ipCounts)
          .sort(([, a]: any, [, b]: any) => b - a)
          .slice(0, 10)
          .map(([ipAddress, count]) => ({ ipAddress, count }));
      })(),

      recentCriticalEvents: logs
        .filter(
          (log: any) =>
            log.severity === "critical" || log.severity === "security"
        )
        .sort(
          (a: any, b: any) =>
            new Date(b.event_timestamp).getTime() -
            new Date(a.event_timestamp).getTime()
        )
        .slice(0, 5)
        .map((log: any) => ({
          eventId: log.event_id,
          eventName: log.event_name,
          category: log.event_category,
          severity: log.severity,
          timestamp: log.event_timestamp,
          userId: log.user_id,
          riskScore: log.risk_score,
        })),
    };

    // Log metrics access
    await auditLogger.log({
      eventCategory: "data_access",
      eventType: "metrics_access",
      eventName: "Audit Metrics Access",
      message: `User ${authResult.user?.id} accessed audit metrics for ${timeRange}`,
      status: "success",
      severity: "info",
      userId: authResult.user?.id,
      resourceType: "audit_metrics",
      details: {
        timeRange,
        totalEvents: metrics.overview.totalEvents,
        requestedBy: authResult.user?.id,
      },
      complianceTags: ["audit_access", "metrics_viewing"],
    });

    return NextResponse.json({
      success: true,
      metrics,
      timeRange,
      generatedAt: new Date().toISOString(),
      dataPoints: logs.length,
    });
  } catch (error) {
    console.error("Error fetching audit metrics:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch audit metrics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
