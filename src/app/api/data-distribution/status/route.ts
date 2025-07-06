import { NextRequest, NextResponse } from "next/server";
import { AutomatedEngineDistributor } from "@/lib/data-seeding/automated-engine-distributor";

// Global distributor instance
let distributorInstance: AutomatedEngineDistributor | null = null;

function getDistributorInstance(): AutomatedEngineDistributor {
  if (!distributorInstance) {
    distributorInstance = new AutomatedEngineDistributor({
      realtime: {
        enabled: true,
        batch_size: 50,
        frequency_ms: 30000,
        max_queue_size: 500,
        retry_attempts: 3,
        timeout_ms: 45000,
      },
      batch: {
        enabled: true,
        schedule: "hourly",
        max_batch_size: 2000,
        processing_window_hours: 12,
        parallel_processing: true,
      },
      monitoring: {
        performance_tracking: true,
        error_alerting: true,
        success_rate_threshold: 0.92,
        latency_threshold_ms: 3000,
      },
    });
  }
  return distributorInstance;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const engineName = searchParams.get("engine");

    const distributor = getDistributorInstance();

    switch (action) {
      case "status":
        const status = distributor.getStatus();
        return NextResponse.json({
          success: true,
          data: status,
          timestamp: new Date().toISOString(),
        });

      case "engines":
        const engines = Array.from(
          distributor.getEngineRegistry().entries()
        ).map(([name, info]) => ({
          name,
          displayName: info.name,
          capabilities: info.capabilities,
          status: distributor.getStatus().engines_status[name],
          performance: {
            avg_processing_time:
              info.performance_characteristics.avg_processing_time_ms,
            max_throughput:
              info.performance_characteristics.max_throughput_per_minute,
            memory_usage: info.performance_characteristics.memory_usage_mb,
            cpu_intensive: info.performance_characteristics.cpu_intensive,
          },
          requirements: info.data_requirements,
        }));

        return NextResponse.json({
          success: true,
          data: engines,
          total_engines: engines.length,
          active_engines: engines.filter(
            e =>
              e.status?.status === "ready" || e.status?.status === "processing"
          ).length,
        });

      case "metrics":
        if (!engineName) {
          return NextResponse.json(
            {
              success: false,
              error: "Engine name required for metrics",
            },
            { status: 400 }
          );
        }

        const performanceMetrics =
          distributor.getEnginePerformanceMetrics(engineName);
        const errorHistory = distributor.getEngineErrorHistory(engineName);

        return NextResponse.json({
          success: true,
          data: {
            engine_name: engineName,
            performance_metrics: performanceMetrics,
            error_history: errorHistory.slice(-10), // Last 10 errors
            avg_processing_time:
              performanceMetrics.length > 0
                ? performanceMetrics.reduce((a, b) => a + b, 0) /
                  performanceMetrics.length
                : 0,
            success_rate:
              distributor.getStatus().engines_status[engineName]
                ?.success_rate || 0,
          },
        });

      case "health":
        const healthStatus = distributor.getStatus();
        const isHealthy =
          healthStatus.status !== "error" &&
          healthStatus.performance_metrics.successful_distributions > 0;

        return NextResponse.json({
          success: true,
          data: {
            healthy: isHealthy,
            status: healthStatus.status,
            uptime:
              Date.now() -
              new Date(healthStatus.last_distribution || Date.now()).getTime(),
            total_distributions:
              healthStatus.performance_metrics.successful_distributions +
              healthStatus.performance_metrics.failed_distributions,
            success_rate:
              healthStatus.performance_metrics.successful_distributions /
              Math.max(
                1,
                healthStatus.performance_metrics.successful_distributions +
                  healthStatus.performance_metrics.failed_distributions
              ),
            avg_throughput:
              healthStatus.performance_metrics.throughput_per_minute,
          },
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid action. Available actions: status, engines, metrics, health",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[DistributionAPI] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, config } = body;

    const distributor = getDistributorInstance();

    switch (action) {
      case "trigger_distribution":
        const distributionType = body.type || "batch";
        await distributor.triggerDistribution(
          distributionType as "realtime" | "batch"
        );

        return NextResponse.json({
          success: true,
          message: `${distributionType} distribution triggered successfully`,
          timestamp: new Date().toISOString(),
        });

      case "update_config":
        if (!config) {
          return NextResponse.json(
            {
              success: false,
              error: "Configuration required",
            },
            { status: 400 }
          );
        }

        distributor.updateConfig(config);

        return NextResponse.json({
          success: true,
          message: "Configuration updated successfully",
          timestamp: new Date().toISOString(),
        });

      case "restart_services":
        distributor.stopDistributionServices();
        // Services will restart automatically when needed

        return NextResponse.json({
          success: true,
          message: "Distribution services restarted",
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid action. Available actions: trigger_distribution, update_config, restart_services",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[DistributionAPI] Error in POST:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
