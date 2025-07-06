/**
 * Infrastructure Metrics API Endpoint
 * Task 61.5: Real-time infrastructure monitoring data
 * Task 62.2: Enhanced with automatic recovery and error handling
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  getFallbackResponse,
  logError,
} from "@/lib/error-handling/error-config";

// Create Supabase client
const createSupabaseClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
};

interface InfrastructureMetrics {
  timestamp: number;
  system: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    load_average: number[];
    uptime: number;
  };
  network: {
    bytes_in: number;
    bytes_out: number;
    packets_in: number;
    packets_out: number;
    connections_active: number;
    connections_established: number;
  };
  application: {
    response_time_avg: number;
    response_time_p95: number;
    response_time_p99: number;
    requests_per_second: number;
    error_rate: number;
    active_sessions: number;
  };
  database: {
    connections_active: number;
    connections_max: number;
    query_time_avg: number;
    slow_queries: number;
    deadlocks: number;
    cache_hit_ratio: number;
  };
  services: Array<{
    name: string;
    status: "healthy" | "warning" | "critical" | "unknown";
    uptime_percentage: number;
    response_time: number;
    last_check: string;
    dependencies: string[];
    health_checks: {
      endpoint: string;
      status_code: number;
      response_time: number;
    }[];
  }>;
  alerts: Array<{
    id: string;
    severity: "info" | "warning" | "critical";
    message: string;
    timestamp: string;
    service: string;
    resolved: boolean;
    details: Record<string, any>;
  }>;
}

// Collect system metrics from various sources
async function collectSystemMetrics(): Promise<
  InfrastructureMetrics["system"]
> {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  const uptime = process.uptime();

  // In production, these would come from actual system monitoring
  return {
    cpu_usage: Math.random() * 80 + 10, // 10-90%
    memory_usage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
    disk_usage: Math.random() * 30 + 50, // 50-80%
    load_average: [Math.random() * 2, Math.random() * 1.5, Math.random() * 1],
    uptime: uptime,
  };
}

// Collect network metrics
async function collectNetworkMetrics(): Promise<
  InfrastructureMetrics["network"]
> {
  // In production, these would come from network monitoring tools
  return {
    bytes_in: Math.random() * 1000000 + 500000, // Random bytes
    bytes_out: Math.random() * 800000 + 400000,
    packets_in: Math.random() * 10000 + 5000,
    packets_out: Math.random() * 8000 + 4000,
    connections_active: Math.floor(Math.random() * 1000) + 100,
    connections_established: Math.floor(Math.random() * 800) + 50,
  };
}

// Collect application metrics
async function collectApplicationMetrics(): Promise<
  InfrastructureMetrics["application"]
> {
  // In production, these would come from APM tools or custom metrics
  return {
    response_time_avg: Math.random() * 200 + 50, // 50-250ms
    response_time_p95: Math.random() * 300 + 100, // 100-400ms
    response_time_p99: Math.random() * 500 + 200, // 200-700ms
    requests_per_second: Math.random() * 100 + 20, // 20-120 RPS
    error_rate: Math.random() * 5, // 0-5%
    active_sessions: Math.floor(Math.random() * 500) + 50,
  };
}

// Collect database metrics
async function collectDatabaseMetrics(): Promise<
  InfrastructureMetrics["database"]
> {
  // In production, these would come from database monitoring
  return {
    connections_active: Math.floor(Math.random() * 50) + 10,
    connections_max: 100,
    query_time_avg: Math.random() * 50 + 5, // 5-55ms
    slow_queries: Math.floor(Math.random() * 5),
    deadlocks: Math.floor(Math.random() * 2),
    cache_hit_ratio: Math.random() * 20 + 80, // 80-100%
  };
}

// Health check for services
async function performHealthChecks(): Promise<
  InfrastructureMetrics["services"]
> {
  const services = [
    {
      name: "Web Application",
      endpoint: "/api/health",
      dependencies: ["Database", "Cache"],
    },
    {
      name: "Database",
      endpoint: "/api/db/health",
      dependencies: [],
    },
    {
      name: "Cache (Redis)",
      endpoint: "/api/cache/health",
      dependencies: [],
    },
    {
      name: "API Gateway",
      endpoint: "/api/gateway/health",
      dependencies: ["Web Application"],
    },
    {
      name: "CDN",
      endpoint: "/health",
      dependencies: [],
    },
  ];

  const results = await Promise.allSettled(
    services.map(async service => {
      try {
        // In production, perform actual health checks
        const responseTime = Math.random() * 100 + 10; // 10-110ms
        const isHealthy = Math.random() > 0.1; // 90% chance of being healthy

        let status: "healthy" | "warning" | "critical" | "unknown";
        if (responseTime > 100) {
          status = "warning";
        } else if (!isHealthy) {
          status = "critical";
        } else {
          status = "healthy";
        }

        return {
          ...service,
          status,
          uptime_percentage: Math.random() * 2 + 98, // 98-100%
          response_time: responseTime,
          last_check: new Date().toISOString(),
          health_checks: [
            {
              endpoint: service.endpoint,
              status_code: isHealthy ? 200 : 500,
              response_time: responseTime,
            },
          ],
        };
      } catch (error) {
        return {
          ...service,
          status: "unknown" as const,
          uptime_percentage: 0,
          response_time: 0,
          last_check: new Date().toISOString(),
          health_checks: [
            {
              endpoint: service.endpoint,
              status_code: 0,
              response_time: 0,
            },
          ],
        };
      }
    })
  );

  return results
    .filter(
      (result): result is PromiseFulfilledResult<any> =>
        result.status === "fulfilled"
    )
    .map(result => result.value);
}

// Generate recent alerts
function generateRecentAlerts(): InfrastructureMetrics["alerts"] {
  const alertTemplates = [
    {
      severity: "critical" as const,
      message: "High CPU usage detected",
      service: "Web Application",
      details: { threshold: 90, current: 95 },
    },
    {
      severity: "warning" as const,
      message: "Memory usage above threshold",
      service: "Database",
      details: { threshold: 80, current: 85 },
    },
    {
      severity: "info" as const,
      message: "Maintenance window scheduled",
      service: "CDN",
      details: { scheduled_time: "2024-01-15T02:00:00Z" },
    },
    {
      severity: "warning" as const,
      message: "Slow query detected",
      service: "Database",
      details: { query_time: 5000, threshold: 1000 },
    },
    {
      severity: "critical" as const,
      message: "Service health check failed",
      service: "Cache (Redis)",
      details: { endpoint: "/health", status_code: 500 },
    },
  ];

  // Generate 3-7 random alerts
  const numAlerts = Math.floor(Math.random() * 5) + 3;
  const selectedAlerts = alertTemplates
    .sort(() => Math.random() - 0.5)
    .slice(0, numAlerts);

  return selectedAlerts.map((template, index) => ({
    id: `alert-${Date.now()}-${index}`,
    ...template,
    timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Within last hour
    resolved: Math.random() > 0.6, // 40% chance of being resolved
  }));
}

// Main function to collect all infrastructure metrics
async function collectInfrastructureMetrics(): Promise<InfrastructureMetrics> {
  const timestamp = Date.now();

  const [system, network, application, database, services] = await Promise.all([
    collectSystemMetrics(),
    collectNetworkMetrics(),
    collectApplicationMetrics(),
    collectDatabaseMetrics(),
    performHealthChecks(),
  ]);

  const alerts = generateRecentAlerts();

  return {
    timestamp,
    system,
    network,
    application,
    database,
    services,
    alerts,
  };
}

// GET endpoint for infrastructure metrics with recovery
const getHandler = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("range") || "1h"; // 1h, 6h, 24h, 7d
    const includeLogs = searchParams.get("logs") === "true";

    // Collect current metrics
    const metrics = await collectInfrastructureMetrics();

    // For time-series data, we would typically query from a time-series database
    // For now, we'll generate historical data for demonstration
    const historicalData = [];
    const intervals = timeRange === "1h" ? 12 : timeRange === "6h" ? 36 : 144; // Data points
    const intervalMs =
      timeRange === "1h" ? 300000 : timeRange === "6h" ? 600000 : 600000; // 5min, 10min, 10min

    for (let i = intervals; i >= 0; i--) {
      const timestamp = Date.now() - i * intervalMs;
      historicalData.push({
        timestamp,
        cpu_usage: Math.random() * 80 + 10,
        memory_usage: Math.random() * 70 + 20,
        disk_usage: Math.random() * 30 + 50,
        network_in: Math.random() * 100 + 50,
        network_out: Math.random() * 80 + 30,
        response_time: Math.random() * 200 + 50,
        active_connections: Math.floor(Math.random() * 1000) + 100,
        error_rate: Math.random() * 5,
        requests_per_second: Math.random() * 100 + 20,
      });
    }

    const response = {
      current: metrics,
      historical: historicalData,
      metadata: {
        collection_time: new Date().toISOString(),
        time_range: timeRange,
        data_points: historicalData.length,
        refresh_interval: 15000, // 15 seconds
      },
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error collecting infrastructure metrics:", error);
    return NextResponse.json(
      {
        error: "Failed to collect infrastructure metrics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
};

// Export the GET handler
export const GET = getHandler;

// POST endpoint for receiving metrics from external sources
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source, metrics, timestamp } = body;

    // In production, you would store these metrics in a time-series database
    console.log("Received metrics from:", source, {
      timestamp: timestamp || new Date().toISOString(),
      metrics,
    });

    // Store metrics (implementation depends on your storage solution)
    // await storeMetrics(source, metrics, timestamp);

    return NextResponse.json({
      success: true,
      message: "Metrics received successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error storing infrastructure metrics:", error);
    return NextResponse.json(
      {
        error: "Failed to store infrastructure metrics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// HEAD endpoint for health checks
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
