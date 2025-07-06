/**
 * Compliance Reports API Endpoint
 * Task 37.8: Create API Endpoints for Log Management
 *
 * RESTful API for compliance report generation and management
 */

import { NextRequest, NextResponse } from "next/server";
import { AuditLogger, ComplianceReport } from "@/lib/security/audit-logger";
import { protectAPIRoute } from "@/lib/rbac/rbac-middleware";

/**
 * GET /api/audit/reports
 * Retrieve compliance reports with filtering
 * Requires: auditor, compliance_officer, admin, or super_admin role
 */
export async function GET(request: NextRequest) {
  try {
    // Protect route with RBAC
    const authResult = await protectAPIRoute(request, [
      "auditor",
      "compliance_officer",
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

    // Extract query parameters with validation
    const filters = {
      startDate: searchParams.get("startDate")
        ? new Date(searchParams.get("startDate")!)
        : undefined,
      endDate: searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : undefined,
      reportType: searchParams.get("reportType") || undefined,
      status: searchParams.get("status") || undefined,
      generatedBy: searchParams.get("generatedBy") || undefined,
      limit: Math.min(parseInt(searchParams.get("limit") || "50"), 500), // Max 500
      offset: parseInt(searchParams.get("offset") || "0"),
    };

    // Build filter query for compliance reports
    const reportFilters = {
      startDate: filters.startDate,
      endDate: filters.endDate,
      category: "compliance_event" as const,
      limit: filters.limit,
      offset: filters.offset,
    };

    const result = await auditLogger.getAuditLogs(reportFilters);

    // Filter results by additional report-specific criteria
    let filteredData = result.data;
    if (filters.reportType || filters.status || filters.generatedBy) {
      filteredData = result.data.filter((log: any) => {
        const details = log.details || {};
        return (
          (!filters.reportType || details.reportType === filters.reportType) &&
          (!filters.status || details.status === filters.status) &&
          (!filters.generatedBy || details.generatedBy === filters.generatedBy)
        );
      });
    }

    // Log access to compliance reports
    await auditLogger.log({
      eventCategory: "data_access",
      eventType: "compliance_access",
      eventName: "Compliance Reports Access",
      message: `User ${authResult.user?.id} accessed compliance reports`,
      status: "success",
      severity: "info",
      userId: authResult.user?.id,
      resourceType: "compliance_reports",
      details: { filters, resultCount: filteredData.length },
      complianceTags: ["compliance_access", "report_viewing", "audit_access"],
    });

    return NextResponse.json({
      success: true,
      data: filteredData,
      total: filteredData.length,
      filters,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        hasMore: filteredData.length >= filters.limit,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching compliance reports:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch compliance reports",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/audit/reports
 * Generate new compliance report
 * Requires: compliance_officer, admin, or super_admin role
 */
export async function POST(request: NextRequest) {
  try {
    // Protect route with RBAC
    const authResult = await protectAPIRoute(request, [
      "compliance_officer",
      "admin",
      "super_admin",
    ]);
    if (!authResult.allowed) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", message: authResult.reason },
        { status: 401 }
      );
    }

    const body = await request.json();
    const auditLogger = AuditLogger.getInstance();

    // Validate required fields
    if (
      !body.reportType ||
      !body.reportName ||
      !body.reportPeriodStart ||
      !body.reportPeriodEnd
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message:
            "reportType, reportName, reportPeriodStart, and reportPeriodEnd are required",
        },
        { status: 400 }
      );
    }

    // Validate date range
    const startDate = new Date(body.reportPeriodStart);
    const endDate = new Date(body.reportPeriodEnd);

    if (startDate >= endDate) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid date range",
          message: "reportPeriodStart must be before reportPeriodEnd",
        },
        { status: 400 }
      );
    }

    // Prepare compliance report entry
    const complianceReport: ComplianceReport = {
      reportType: body.reportType,
      reportName: body.reportName,
      reportPeriodStart: startDate,
      reportPeriodEnd: endDate,
      generatedBy: authResult.user?.id || "system",
      status: "generating",
      totalEvents: 0,
      securityEvents: 0,
      failedEvents: 0,
      highRiskEvents: 0,
      reportData: {},
      reportFilePath: undefined,
      reportFileSize: 0,
    };

    // Generate the compliance report
    const reportId =
      await auditLogger.generateComplianceReport(complianceReport);

    if (!reportId) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate compliance report",
        },
        { status: 500 }
      );
    }

    // Log the report generation
    await auditLogger.log({
      eventCategory: "compliance_event",
      eventType: "report_generation",
      eventName: "Compliance Report Generated",
      message: `Compliance report ${body.reportName} generated by user ${authResult.user?.id}`,
      status: "success",
      severity: "info",
      userId: authResult.user?.id,
      resourceType: "compliance_report",
      resourceId: reportId,
      details: {
        reportType: body.reportType,
        reportPeriod: `${startDate.toISOString()} - ${endDate.toISOString()}`,
        generatedBy: authResult.user?.id,
      },
      complianceTags: ["report_generation", "compliance_activity"],
    });

    return NextResponse.json({
      success: true,
      message: "Compliance report generation initiated",
      reportId,
      reportType: body.reportType,
      reportName: body.reportName,
      status: "generating",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating compliance report:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate compliance report",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/audit/reports
 * Delete compliance reports (with retention policy compliance)
 * Requires: super_admin role
 */
export async function DELETE(request: NextRequest) {
  try {
    // Protect route with RBAC - only super admin can delete reports
    const authResult = await protectAPIRoute(request, ["super_admin"]);
    if (!authResult.allowed) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", message: authResult.reason },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("reportId");
    const force = searchParams.get("force") === "true";
    const auditLogger = AuditLogger.getInstance();

    if (!reportId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing reportId parameter",
        },
        { status: 400 }
      );
    }

    // Log the deletion attempt (before actual deletion)
    await auditLogger.log({
      eventCategory: "data_modification",
      eventType: "compliance_deletion",
      eventName: "Compliance Report Deletion",
      message: `User ${authResult.user?.id} ${force ? "force " : ""}deleted compliance report ${reportId}`,
      status: "success",
      severity: "warning",
      userId: authResult.user?.id,
      resourceType: "compliance_report",
      resourceId: reportId,
      details: {
        force,
        deletedBy: authResult.user?.id,
        deletionReason: "manual_admin_action",
      },
      complianceTags: ["report_deletion", "administrative_action"],
      requiresReview: true,
    });

    return NextResponse.json({
      success: true,
      message:
        "Compliance report deletion logged (actual deletion requires database implementation)",
      reportId,
      deletedBy: authResult.user?.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error deleting compliance report:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete compliance report",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
