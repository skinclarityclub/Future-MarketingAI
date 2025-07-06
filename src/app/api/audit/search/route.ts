/**
 * Advanced Audit Search API Endpoint
 * Task 37.8: Create API Endpoints for Log Management
 *
 * RESTful API for advanced audit log searching and analytics
 */

import { NextRequest, NextResponse } from "next/server";
import { AuditLogger } from "@/lib/security/audit-logger";
import { protectAPIRoute } from "@/lib/rbac/rbac-middleware";

/**
 * POST /api/audit/search
 * Advanced search with full-text capabilities and analytics
 * Requires: auditor, security_admin, admin, or super_admin role
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const auditLogger = AuditLogger.getInstance();

    // Extract search parameters
    const searchParams = {
      query: body.query || "",
      filters: body.filters || {},
      aggregations: body.aggregations || [],
      sort: body.sort || { field: "event_timestamp", direction: "desc" },
      limit: Math.min(body.limit || 100, 1000), // Max 1000
      offset: body.offset || 0,
    };

    // Validate query
    if (!searchParams.query && Object.keys(searchParams.filters).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Either query or filters must be provided",
        },
        { status: 400 }
      );
    }

    // Build enhanced filters from search parameters
    const enhancedFilters = {
      startDate: searchParams.filters.startDate
        ? new Date(searchParams.filters.startDate)
        : undefined,
      endDate: searchParams.filters.endDate
        ? new Date(searchParams.filters.endDate)
        : undefined,
      userId: searchParams.filters.userId || undefined,
      category: searchParams.filters.category || undefined,
      severity: searchParams.filters.severity || undefined,
      status: searchParams.filters.status || undefined,
      ipAddress: searchParams.filters.ipAddress || undefined,
      resourceType: searchParams.filters.resourceType || undefined,
      complianceTags: searchParams.filters.complianceTags || undefined,
      riskScore: searchParams.filters.riskScore || undefined,
      limit: searchParams.limit,
      offset: searchParams.offset,
    };

    // Get audit logs with enhanced filtering
    const result = await auditLogger.getAuditLogs(enhancedFilters);

    // Perform full-text search on results if query provided
    let searchResults = result.data;
    if (searchParams.query) {
      const queryLower = searchParams.query.toLowerCase();
      searchResults = result.data.filter((log: any) => {
        const searchText = [
          log.event_name,
          log.message,
          log.event_type,
          JSON.stringify(log.details || {}),
          JSON.stringify(log.metadata || {}),
        ]
          .join(" ")
          .toLowerCase();

        return searchText.includes(queryLower);
      });
    }

    // Apply additional filtering
    if (searchParams.filters.requiresReview !== undefined) {
      searchResults = searchResults.filter(
        (log: any) =>
          log.requires_review === searchParams.filters.requiresReview
      );
    }

    // Sort results
    if (searchParams.sort.field) {
      searchResults.sort((a: any, b: any) => {
        const aVal = a[searchParams.sort.field] || "";
        const bVal = b[searchParams.sort.field] || "";

        if (searchParams.sort.direction === "asc") {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    // Calculate aggregations
    const aggregationResults: Record<string, any> = {};
    for (const agg of searchParams.aggregations) {
      switch (agg.type) {
        case "count_by_category":
          aggregationResults.countByCategory = searchResults.reduce(
            (acc: any, log: any) => {
              acc[log.event_category] = (acc[log.event_category] || 0) + 1;
              return acc;
            },
            {}
          );
          break;

        case "count_by_severity":
          aggregationResults.countBySeverity = searchResults.reduce(
            (acc: any, log: any) => {
              acc[log.severity] = (acc[log.severity] || 0) + 1;
              return acc;
            },
            {}
          );
          break;

        case "count_by_hour":
          aggregationResults.countByHour = searchResults.reduce(
            (acc: any, log: any) => {
              const hour = new Date(log.event_timestamp).getHours();
              acc[hour] = (acc[hour] || 0) + 1;
              return acc;
            },
            {}
          );
          break;

        case "top_users":
          const userCounts = searchResults.reduce((acc: any, log: any) => {
            if (log.user_id) {
              acc[log.user_id] = (acc[log.user_id] || 0) + 1;
            }
            return acc;
          }, {});
          aggregationResults.topUsers = Object.entries(userCounts)
            .sort(([, a]: any, [, b]: any) => b - a)
            .slice(0, 10)
            .map(([userId, count]) => ({ userId, count }));
          break;

        case "risk_score_distribution":
          aggregationResults.riskScoreDistribution = {
            low: searchResults.filter((log: any) => (log.risk_score || 0) < 3)
              .length,
            medium: searchResults.filter(
              (log: any) =>
                (log.risk_score || 0) >= 3 && (log.risk_score || 0) < 7
            ).length,
            high: searchResults.filter((log: any) => (log.risk_score || 0) >= 7)
              .length,
          };
          break;
      }
    }

    // Log the search activity
    await auditLogger.log({
      eventCategory: "data_access",
      eventType: "audit_search",
      eventName: "Advanced Audit Search",
      message: `User ${authResult.user?.id} performed advanced audit search`,
      status: "success",
      severity: "info",
      userId: authResult.user?.id,
      resourceType: "audit_logs",
      details: {
        query: searchParams.query,
        filters: searchParams.filters,
        resultCount: searchResults.length,
        aggregations: searchParams.aggregations,
      },
      complianceTags: ["audit_access", "advanced_search"],
    });

    return NextResponse.json({
      success: true,
      data: searchResults,
      total: searchResults.length,
      aggregations: aggregationResults,
      query: searchParams.query,
      filters: searchParams.filters,
      pagination: {
        limit: searchParams.limit,
        offset: searchParams.offset,
        hasMore: searchResults.length >= searchParams.limit,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error performing audit search:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to perform audit search",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/audit/search/saved
 * Get saved search queries
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

    const auditLogger = AuditLogger.getInstance();

    // For now, return predefined search templates
    // In a full implementation, this would query saved searches from database
    const savedSearches = [
      {
        id: "failed_logins",
        name: "Failed Login Attempts",
        description: "Show failed authentication attempts in the last 24 hours",
        query: "",
        filters: {
          category: "authentication",
          status: "failure",
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        aggregations: ["count_by_hour", "top_users"],
      },
      {
        id: "high_risk_events",
        name: "High Risk Security Events",
        description: "Show high-risk security events requiring review",
        query: "",
        filters: {
          severity: "critical",
          requiresReview: true,
          riskScore: 7,
        },
        aggregations: ["count_by_category", "risk_score_distribution"],
      },
      {
        id: "admin_actions",
        name: "Administrative Actions",
        description: "Show administrative and configuration changes",
        query: "",
        filters: {
          category: "system_configuration",
          startDate: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        aggregations: ["count_by_category", "top_users"],
      },
      {
        id: "data_access_audit",
        name: "Data Access Audit",
        description: "Track data access and modification events",
        query: "",
        filters: {
          category: "data_access",
        },
        aggregations: ["count_by_hour", "top_users", "count_by_severity"],
      },
    ];

    // Log access to saved searches
    await auditLogger.log({
      eventCategory: "data_access",
      eventType: "saved_searches_access",
      eventName: "Saved Searches Access",
      message: `User ${authResult.user?.id} accessed saved search templates`,
      status: "success",
      severity: "info",
      userId: authResult.user?.id,
      resourceType: "saved_searches",
      complianceTags: ["audit_access"],
    });

    return NextResponse.json({
      success: true,
      savedSearches,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching saved searches:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch saved searches",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
