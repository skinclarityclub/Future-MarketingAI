/**
 * User Session Audit API Endpoint
 * Task 37.8: Create API Endpoints for Log Management
 *
 * RESTful API for user session audit management
 */

import { NextRequest, NextResponse } from "next/server";
import { AuditLogger, UserSession } from "@/lib/security/audit-logger";
import { protectAPIRoute } from "@/lib/rbac/rbac-middleware";
import { headers } from "next/headers";

/**
 * GET /api/audit/sessions
 * Retrieve user session audit logs with filtering
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
      userId: searchParams.get("userId") || undefined,
      sessionId: searchParams.get("sessionId") || undefined,
      ipAddress: searchParams.get("ipAddress") || undefined,
      suspicious: searchParams.get("suspicious") === "true" ? true : undefined,
      active: searchParams.get("active") === "true" ? true : undefined,
      limit: Math.min(parseInt(searchParams.get("limit") || "100"), 1000), // Max 1000
      offset: parseInt(searchParams.get("offset") || "0"),
    };

    // Build filter query for session logs
    const sessionFilters = {
      ...filters,
      category: "authentication" as const,
      eventType: "session",
      limit: filters.limit,
      offset: filters.offset,
    };

    const result = await auditLogger.getAuditLogs(sessionFilters);

    // Log access to session audit logs
    await auditLogger.log({
      eventCategory: "data_access",
      eventType: "audit_query",
      eventName: "Session Logs Access",
      message: `User ${authResult.user?.id} accessed session audit logs`,
      status: "success",
      severity: "info",
      userId: authResult.user?.id,
      resourceType: "audit_sessions",
      details: { filters, resultCount: result.total },
      complianceTags: ["audit_access", "session_monitoring"],
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
      filters,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        hasMore: result.total > filters.offset + filters.limit,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching session audit logs:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch session audit logs",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/audit/sessions
 * Create new session audit log entry
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
    const headersList = await headers();
    const auditLogger = AuditLogger.getInstance();

    // Extract request context
    const userAgent = headersList.get("user-agent") || undefined;
    const forwarded = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const ipAddress = forwarded?.split(",")[0] || realIp || undefined;

    // Validate required fields
    if (!body.sessionId || !body.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "sessionId and userId are required",
        },
        { status: 400 }
      );
    }

    // Prepare session audit entry
    const sessionData: UserSession = {
      sessionId: body.sessionId,
      userId: body.userId,
      loginTimestamp: body.loginTimestamp
        ? new Date(body.loginTimestamp)
        : new Date(),
      logoutTimestamp: body.logoutTimestamp
        ? new Date(body.logoutTimestamp)
        : undefined,
      ipAddress: body.ipAddress || ipAddress,
      userAgent: body.userAgent || userAgent,
      deviceFingerprint: body.deviceFingerprint || undefined,
      isSuspicious: body.isSuspicious || false,
      failedLoginAttempts: body.failedLoginAttempts || 0,
      mfaEnabled: body.mfaEnabled || false,
      mfaVerified: body.mfaVerified || false,
      countryCode: body.countryCode || undefined,
      city: body.city || undefined,
      timezone: body.timezone || undefined,
      metadata: body.metadata || {},
    };

    // Log the session
    const success = await auditLogger.logSession(sessionData);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create session audit log",
        },
        { status: 500 }
      );
    }

    // Log the API usage
    await auditLogger.log({
      eventCategory: "data_modification",
      eventType: "audit_create",
      eventName: "Session Log Created",
      message: `Session audit log created by user ${authResult.user?.id}`,
      status: "success",
      severity: "info",
      userId: authResult.user?.id,
      resourceType: "audit_session",
      resourceId: body.sessionId,
      details: { targetUserId: body.userId },
      complianceTags: ["audit_creation", "session_tracking"],
    });

    return NextResponse.json({
      success: true,
      message: "Session audit log created successfully",
      sessionId: body.sessionId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error creating session audit log:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create session audit log",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
