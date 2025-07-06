/**
 * System Events Audit API Endpoint
 * Task 37.8: Create API Endpoints for Log Management
 *
 * RESTful API for system event audit management
 */

import { NextRequest, NextResponse } from "next/server";
import { AuditLogger, SystemEvent } from "@/lib/security/audit-logger";
import { protectAPIRoute } from "@/lib/rbac/rbac-middleware";
import { headers } from "next/headers";

/**
 * GET /api/audit/system
 * Retrieve system event audit logs with filtering
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

    // Extract query parameters with validation
    const filters = {
      startDate: searchParams.get("startDate")
        ? new Date(searchParams.get("startDate")!)
        : undefined,
      endDate: searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : undefined,
      component: searchParams.get("component") || undefined,
      severity: (searchParams.get("severity") as any) || undefined,
      hostname: searchParams.get("hostname") || undefined,
      eventType: searchParams.get("eventType") || undefined,
      limit: Math.min(parseInt(searchParams.get("limit") || "100"), 1000), // Max 1000
      offset: parseInt(searchParams.get("offset") || "0"),
    };

    // Build filter query for system event logs
    const systemFilters = {
      startDate: filters.startDate,
      endDate: filters.endDate,
      category: "system_configuration" as const,
      severity: filters.severity,
      limit: filters.limit,
      offset: filters.offset,
    };

    const result = await auditLogger.getAuditLogs(systemFilters);

    // Filter results by additional system-specific criteria
    let filteredData = result.data;
    if (filters.component || filters.hostname || filters.eventType) {
      filteredData = result.data.filter((log: any) => {
        const details = log.details || {};
        return (
          (!filters.component || details.component === filters.component) &&
          (!filters.hostname || details.hostname === filters.hostname) &&
          (!filters.eventType || log.event_type === filters.eventType)
        );
      });
    }

    // Log access to system audit logs
    await auditLogger.log({
      eventCategory: "data_access",
      eventType: "audit_query",
      eventName: "System Logs Access",
      message: `User ${authResult.user?.id} accessed system audit logs`,
      status: "success",
      severity: "info",
      userId: authResult.user?.id,
      resourceType: "audit_system",
      details: { filters, resultCount: filteredData.length },
      complianceTags: ["audit_access", "system_monitoring"],
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
    console.error("Error fetching system audit logs:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch system audit logs",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/audit/system
 * Create new system event audit log entry
 * Requires: security_admin, admin, or super_admin role
 */
export async function POST(request: NextRequest) {
  try {
    // Protect route with RBAC
    const authResult = await protectAPIRoute(request, [
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

    const body = await request.json();
    const auditLogger = AuditLogger.getInstance();

    // Validate required fields
    if (!body.eventType || !body.component || !body.message || !body.severity) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "eventType, component, message, and severity are required",
        },
        { status: 400 }
      );
    }

    // Prepare system event entry
    const systemEvent: SystemEvent = {
      eventType: body.eventType,
      component: body.component,
      message: body.message,
      severity: body.severity,
      hostname: body.hostname || undefined,
      processId: body.processId || undefined,
      threadId: body.threadId || undefined,
      cpuUsage: body.cpuUsage || undefined,
      memoryUsageMb: body.memoryUsageMb || undefined,
      diskUsageMb: body.diskUsageMb || undefined,
      details: body.details || {},
      stackTrace: body.stackTrace || undefined,
    };

    // Log the system event
    const success = await auditLogger.logSystemEvent(systemEvent);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create system audit log",
        },
        { status: 500 }
      );
    }

    // Log the API usage
    await auditLogger.log({
      eventCategory: "data_modification",
      eventType: "audit_create",
      eventName: "System Log Created",
      message: `System audit log created by user ${authResult.user?.id}`,
      status: "success",
      severity: "info",
      userId: authResult.user?.id,
      resourceType: "audit_system",
      resourceId: body.eventType,
      details: {
        component: body.component,
        severity: body.severity,
      },
      complianceTags: ["audit_creation", "system_monitoring"],
    });

    return NextResponse.json({
      success: true,
      message: "System audit log created successfully",
      eventType: body.eventType,
      component: body.component,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error creating system audit log:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create system audit log",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
