import { NextResponse } from "next/server";
import { dashboardClient } from "@/lib/supabase/dashboard-client";
import { dashboardConfig } from "@/lib/utils";

/**
 * Dashboard Health Check API
 * GET /api/dashboard/health
 *
 * Returns the status of all dashboard components and integrations
 */
export async function GET() {
  const startTime = performance.now();

  try {
    // Test Supabase connection
    const supabaseTest = await dashboardClient.testConnection();

    // Check environment configuration
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };

    // Performance metrics
    const responseTime = performance.now() - startTime;
    const isPerformant = responseTime < dashboardConfig.performanceTarget;

    // Overall health status
    const isHealthy =
      supabaseTest.success && envCheck.supabaseUrl && envCheck.supabaseKey;

    const healthData = {
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      components: {
        supabase: {
          status: supabaseTest.success ? "connected" : "error",
          error: supabaseTest.error || null,
        },
        environment: {
          status:
            envCheck.supabaseUrl && envCheck.supabaseKey
              ? "configured"
              : "missing",
          variables: envCheck,
        },
        performance: {
          status: isPerformant ? "optimal" : "slow",
          responseTime: Math.round(responseTime),
          target: dashboardConfig.performanceTarget,
        },
      },
      configuration: {
        updateInterval: dashboardConfig.updateInterval,
        isDevelopment: dashboardConfig.isDevelopment,
        performanceTarget: dashboardConfig.performanceTarget,
      },
      checks: {
        database_connection: supabaseTest.success,
        environment_configured: envCheck.supabaseUrl && envCheck.supabaseKey,
        performance_target_met: isPerformant,
      },
    };

    return NextResponse.json(healthData, {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Response-Time": `${Math.round(responseTime)}ms`,
      },
    });
  } catch (error) {
    const errorResponse = {
      status: "error",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error occurred",
      responseTime: Math.round(performance.now() - startTime),
    };

    return NextResponse.json(errorResponse, {
      status: 500,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }
}
