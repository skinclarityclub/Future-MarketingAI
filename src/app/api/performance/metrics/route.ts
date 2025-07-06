import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  try {
    // Dynamic import to avoid SSR issues
    const { memoryMonitor } = await import("@/lib/monitoring/memory-monitor");

    // Get memory metrics
    const memoryMetrics = memoryMonitor.getCurrentMemory();
    const memorySummary = memoryMonitor.getMemorySummary();

    // Get system performance metrics
    const performanceMetrics = {
      uptime: process.uptime(),
      cpuUsage: process.cpuUsage(),
      memoryUsage: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version,
    };

    // Get API metrics (if available)
    const apiMetrics = {
      totalRequests: 0, // Will be tracked by middleware
      averageResponseTime: 0,
      errorRate: 0,
      cacheHitRate: 0,
    };

    const metrics = {
      timestamp: new Date().toISOString(),
      memory: {
        current: memoryMetrics,
        summary: memorySummary,
        thresholds: {
          warning: 75,
          critical: 90,
        },
      },
      performance: performanceMetrics,
      api: apiMetrics,
    };

    return NextResponse.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error("[Performance API] Error getting metrics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve performance metrics",
      },
      { status: 500 }
    );
  }
}
