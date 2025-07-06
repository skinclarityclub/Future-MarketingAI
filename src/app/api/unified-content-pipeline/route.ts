/**
 * Unified Content Pipeline API Routes
 * Task 80.7: Unify Content Pipeline (Research to Publishing)
 */

import { NextRequest, NextResponse } from "next/server";
import { unifiedContentPipeline } from "@/lib/workflows/unified-content-pipeline";

/**
 * GET /api/unified-content-pipeline
 * Get pipeline metrics and active pipelines
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const pipelineId = searchParams.get("pipelineId");

    switch (action) {
      case "metrics":
        const metrics = await unifiedContentPipeline.getPipelineMetrics();
        return NextResponse.json({
          success: true,
          data: metrics,
        });

      case "status":
        if (!pipelineId) {
          return NextResponse.json(
            {
              success: false,
              error: "Pipeline ID required for status check",
            },
            { status: 400 }
          );
        }

        const pipeline =
          await unifiedContentPipeline.getPipelineStatus(pipelineId);
        if (!pipeline) {
          return NextResponse.json(
            {
              success: false,
              error: "Pipeline not found",
            },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            ...pipeline,
            content_data: {
              ...pipeline.content_data,
              optimization_output: pipeline.content_data.optimization_output
                ? {
                    ...pipeline.content_data.optimization_output,
                    platform_variants: Object.fromEntries(
                      pipeline.content_data.optimization_output
                        .platform_variants || new Map()
                    ),
                  }
                : undefined,
              scheduling_data: pipeline.content_data.scheduling_data
                ? {
                    ...pipeline.content_data.scheduling_data,
                    platform_schedules: Object.fromEntries(
                      pipeline.content_data.scheduling_data
                        .platform_schedules || new Map()
                    ),
                  }
                : undefined,
              publishing_data: pipeline.content_data.publishing_data
                ? {
                    ...pipeline.content_data.publishing_data,
                    publish_results: Object.fromEntries(
                      pipeline.content_data.publishing_data.publish_results ||
                        new Map()
                    ),
                    published_urls: Object.fromEntries(
                      pipeline.content_data.publishing_data.published_urls ||
                        new Map()
                    ),
                  }
                : undefined,
            },
            metrics: {
              ...pipeline.metrics,
              stage_durations: Object.fromEntries(
                pipeline.metrics.stage_durations
              ),
            },
          },
        });

      case "active":
        const activePipelines = unifiedContentPipeline.getActivePipelines();
        return NextResponse.json({
          success: true,
          data: activePipelines.map(pipeline => ({
            ...pipeline,
            metrics: {
              ...pipeline.metrics,
              stage_durations: Object.fromEntries(
                pipeline.metrics.stage_durations
              ),
            },
          })),
        });

      default:
        // Return overview
        const overview = {
          metrics: await unifiedContentPipeline.getPipelineMetrics(),
          activePipelines: unifiedContentPipeline.getActivePipelines().length,
        };

        return NextResponse.json({
          success: true,
          data: overview,
        });
    }
  } catch (error) {
    console.error("[UnifiedContentPipeline API] Error in GET:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/unified-content-pipeline
 * Start new pipeline or manage existing ones
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "start":
        const {
          title,
          description,
          campaign_id,
          content_type,
          target_platforms,
          target_audience,
          keywords,
          brand_voice,
          urgency,
          approval_required,
          scheduled_publish_date,
          assigned_to,
        } = body;

        if (!title || !content_type) {
          return NextResponse.json(
            {
              success: false,
              error: "Title and content_type are required",
            },
            { status: 400 }
          );
        }

        const pipeline = await unifiedContentPipeline.startPipeline({
          title,
          description,
          campaign_id,
          content_type,
          target_platforms,
          target_audience,
          keywords,
          brand_voice,
          urgency,
          approval_required,
          scheduled_publish_date,
          assigned_to,
        });

        return NextResponse.json({
          success: true,
          data: {
            ...pipeline,
            metrics: {
              ...pipeline.metrics,
              stage_durations: Object.fromEntries(
                pipeline.metrics.stage_durations
              ),
            },
          },
        });

      case "cancel":
        const { pipelineId } = body;

        if (!pipelineId) {
          return NextResponse.json(
            {
              success: false,
              error: "Pipeline ID is required",
            },
            { status: 400 }
          );
        }

        const cancelled =
          await unifiedContentPipeline.cancelPipeline(pipelineId);

        if (!cancelled) {
          return NextResponse.json(
            {
              success: false,
              error: "Pipeline not found or could not be cancelled",
            },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Pipeline cancelled successfully",
        });

      case "bulk-start":
        const { pipelines } = body;

        if (!Array.isArray(pipelines) || pipelines.length === 0) {
          return NextResponse.json(
            {
              success: false,
              error: "Pipelines array is required",
            },
            { status: 400 }
          );
        }

        const startedPipelines = [];
        const errors = [];

        for (const pipelineData of pipelines) {
          try {
            const startedPipeline =
              await unifiedContentPipeline.startPipeline(pipelineData);
            startedPipelines.push({
              ...startedPipeline,
              metrics: {
                ...startedPipeline.metrics,
                stage_durations: Object.fromEntries(
                  startedPipeline.metrics.stage_durations
                ),
              },
            });
          } catch (error) {
            errors.push({
              title: pipelineData.title,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            started: startedPipelines,
            errors: errors,
          },
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[UnifiedContentPipeline API] Error in POST:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/unified-content-pipeline
 * Update pipeline configuration
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, configuration } = body;

    if (action === "configure") {
      if (!configuration) {
        return NextResponse.json(
          {
            success: false,
            error: "Configuration is required",
          },
          { status: 400 }
        );
      }

      unifiedContentPipeline.updateConfiguration(configuration);

      return NextResponse.json({
        success: true,
        message: "Configuration updated successfully",
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid action",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("[UnifiedContentPipeline API] Error in PUT:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/unified-content-pipeline
 * Cancel pipeline or shutdown system
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const pipelineId = searchParams.get("pipelineId");

    if (action === "cancel" && pipelineId) {
      const cancelled = await unifiedContentPipeline.cancelPipeline(pipelineId);

      if (!cancelled) {
        return NextResponse.json(
          {
            success: false,
            error: "Pipeline not found or could not be cancelled",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Pipeline cancelled successfully",
      });
    }

    if (action === "shutdown") {
      await unifiedContentPipeline.shutdown();

      return NextResponse.json({
        success: true,
        message: "Pipeline system shutdown successfully",
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid action or missing parameters",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("[UnifiedContentPipeline API] Error in DELETE:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
