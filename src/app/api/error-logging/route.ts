/**
 * Error Logging API - Enterprise Grade Error Management
 * Provides comprehensive error logging, analytics, and management capabilities
 */

import { NextRequest, NextResponse } from "next/server";
import {
  comprehensiveErrorLogger,
  ErrorSeverity,
  ErrorCategory,
  type ErrorContext,
} from "@/lib/error-handling/comprehensive-error-logger";
import { logger } from "@/lib/logger";

// Rate limiting for error logging
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientId: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const current = rateLimitMap.get(clientId);

  if (!current || now > current.resetTime) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  current.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Rate limiting
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      error: errorData,
      severity = ErrorSeverity.MEDIUM,
      category = ErrorCategory.SYSTEM,
      context = {},
    } = body;

    // Validate required fields
    if (!errorData) {
      return NextResponse.json(
        { error: "Error data is required" },
        { status: 400 }
      );
    }

    // Prepare error context
    const errorContext: Partial<ErrorContext> = {
      userAgent,
      ipAddress: clientIp,
      endpoint: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      ...context,
    };

    // Log the error
    const errorId = await comprehensiveErrorLogger.logError(
      errorData,
      severity,
      category,
      errorContext
    );

    // Return success response
    return NextResponse.json({
      success: true,
      errorId,
      message: "Error logged successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error logging API failed:", error);
    
    // Fallback error logging
    logger.error("Error logging API failure", error instanceof Error ? error : new Error(String(error)));

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "metrics": {
        const timeRange = searchParams.get("timeRange") as "1h" | "24h" | "7d" | "30d" || "24h";
        const metrics = await comprehensiveErrorLogger.getErrorMetrics(timeRange);
        
        return NextResponse.json({
          success: true,
          data: metrics,
          timestamp: new Date().toISOString(),
        });
      }

      case "analytics": {
        const timeRange = searchParams.get("timeRange") as "24h" | "7d" | "30d" || "7d";
        const analytics = await comprehensiveErrorLogger.getErrorAnalytics(timeRange);
        
        return NextResponse.json({
          success: true,
          data: analytics,
          timestamp: new Date().toISOString(),
        });
      }

      case "search": {
        const severity = searchParams.get("severity") as ErrorSeverity || undefined;
        const category = searchParams.get("category") as ErrorCategory || undefined;
        const resolved = searchParams.get("resolved") === "true" ? true : 
                        searchParams.get("resolved") === "false" ? false : undefined;
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");

        const results = await comprehensiveErrorLogger.searchErrors({
          severity,
          category,
          resolved,
          limit,
          offset,
        });

        return NextResponse.json({
          success: true,
          data: results,
          timestamp: new Date().toISOString(),
        });
      }

      case "error": {
        const errorId = searchParams.get("errorId");
        
        if (!errorId) {
          return NextResponse.json(
            { error: "Error ID is required" },
            { status: 400 }
          );
        }

        const errorEntry = await comprehensiveErrorLogger.getError(errorId);
        
        if (!errorEntry) {
          return NextResponse.json(
            { error: "Error not found" },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: errorEntry,
          timestamp: new Date().toISOString(),
        });
      }

      default:
        return NextResponse.json(
          { 
            error: "Invalid action",
            supportedActions: ["metrics", "analytics", "search", "error"]
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error logging GET API failed:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, errorId, ...data } = body;

    switch (action) {
      case "resolve": {
        if (!errorId) {
          return NextResponse.json(
            { error: "Error ID is required" },
            { status: 400 }
          );
        }

        const success = await comprehensiveErrorLogger.resolveError(
          errorId,
          data.resolutionNotes
        );

        if (!success) {
          return NextResponse.json(
            { error: "Failed to resolve error" },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Error resolved successfully",
          timestamp: new Date().toISOString(),
        });
      }

      default:
        return NextResponse.json(
          { 
            error: "Invalid action",
            supportedActions: ["resolve"]
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error logging PUT API failed:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "clear-rate-limit": {
        const clientId = searchParams.get("clientId");
        
        if (!clientId) {
          return NextResponse.json(
            { error: "Client ID is required" },
            { status: 400 }
          );
        }

        rateLimitMap.delete(clientId);

        return NextResponse.json({
          success: true,
          message: "Rate limit cleared",
          timestamp: new Date().toISOString(),
        });
      }

      default:
        return NextResponse.json(
          { 
            error: "Invalid action",
            supportedActions: ["clear-rate-limit"]
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error logging DELETE API failed:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 