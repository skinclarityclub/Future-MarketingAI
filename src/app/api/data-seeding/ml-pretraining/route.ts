/**
 * ML Pre-training Pipeline API Routes
 * Task 70.6: Implementeer ML Pre-training Pipelines en Batch Training
 *
 * API endpoints for managing ML pre-training pipelines and batch training operations
 */

import { NextRequest, NextResponse } from "next/server";
import {
  MLPreTrainingPipeline,
  TrainingConfig,
} from "@/lib/data-seeding/ml-pretraining-pipeline";
// Temporarily disable logger to avoid webpack issues
// import { logger } from '@/lib/logger';
const logger = {
  info: (msg: string, data?: any) => console.log(`[INFO] ${msg}`, data || ""),
  error: (msg: string, data?: any) =>
    console.error(`[ERROR] ${msg}`, data || ""),
  warn: (msg: string, data?: any) => console.warn(`[WARN] ${msg}`, data || ""),
  debug: (msg: string, data?: any) =>
    console.debug(`[DEBUG] ${msg}`, data || ""),
};

const mlPipeline = new MLPreTrainingPipeline({
  maxConcurrentJobs: 3,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const pipelineId = searchParams.get("pipeline_id");

    if (action === "status" && pipelineId) {
      // Get pipeline status
      const status = await mlPipeline.getPipelineStatus(pipelineId);

      return NextResponse.json({
        success: true,
        data: status,
        timestamp: new Date().toISOString(),
      });
    }

    if (action === "test") {
      // Test endpoint
      return NextResponse.json({
        success: true,
        message: "ML Pre-training Pipeline API is operational",
        capabilities: [
          "Batch training pipeline creation",
          "Multi-model training orchestration",
          "Real-time progress monitoring",
          "Automated data preprocessing",
          "Model validation and deployment",
        ],
        endpoints: {
          "GET /api/data-seeding/ml-pretraining?action=test":
            "Test API connectivity",
          "GET /api/data-seeding/ml-pretraining?action=status&pipeline_id=X":
            "Get pipeline status",
          "POST /api/data-seeding/ml-pretraining":
            "Create and execute training pipeline",
        },
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid action or missing parameters",
        available_actions: ["test", "status"],
      },
      { status: 400 }
    );
  } catch (error) {
    logger.error("ML Pre-training API GET error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...config } = body;

    logger.info("ML Pre-training Pipeline API called", {
      action,
      has_config: !!config,
    });

    if (action === "create_pipeline") {
      // Validate required fields
      if (
        !config.pipeline_name ||
        !config.model_types ||
        !config.data_sources
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing required fields",
            required_fields: ["pipeline_name", "model_types", "data_sources"],
          },
          { status: 400 }
        );
      }

      // Create batch training pipeline
      const result = await mlPipeline.createBatchTrainingPipeline({
        pipeline_name: config.pipeline_name,
        model_types: config.model_types,
        data_sources: config.data_sources,
        training_config: config.training_config || {},
      });

      logger.info("Batch training pipeline created", {
        pipeline_id: result.pipeline.pipeline_id,
        total_jobs: result.pipeline.total_jobs,
        datasets: result.datasets.length,
      });

      return NextResponse.json({
        success: true,
        data: {
          pipeline: result.pipeline,
          datasets: result.datasets,
          estimated_completion: result.estimated_completion,
        },
        message: "Batch training pipeline created successfully",
        timestamp: new Date().toISOString(),
      });
    }

    if (action === "execute_pipeline") {
      if (!config.pipeline_id) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing pipeline_id",
          },
          { status: 400 }
        );
      }

      // Execute training pipeline
      const result = await mlPipeline.executePipeline(config.pipeline_id);

      logger.info("Pipeline execution started", {
        pipeline_id: config.pipeline_id,
        active_jobs: result.active_jobs.length,
        queued_jobs: result.queued_jobs.length,
      });

      return NextResponse.json({
        success: true,
        data: result,
        message: "Pipeline execution started successfully",
        timestamp: new Date().toISOString(),
      });
    }

    if (action === "demo_pipeline") {
      // Create demo training pipeline for testing
      const demoResult = await mlPipeline.createBatchTrainingPipeline({
        pipeline_name: "Demo ML Training Pipeline",
        model_types: [
          "content_performance",
          "hashtag_effectiveness",
          "engagement_prediction",
        ],
        data_sources: [
          {
            table_name: "content_posts",
            date_range: {
              start: "2024-01-01",
              end: "2024-12-31",
            },
          },
          {
            table_name: "content_analytics",
            date_range: {
              start: "2024-01-01",
              end: "2024-12-31",
            },
          },
        ],
        training_config: {
          model_types: ["content_performance", "hashtag_effectiveness"],
          batch_size: 32,
          learning_rate: 0.001,
          epochs: 50,
          validation_split: 0.2,
          early_stopping: {
            enabled: true,
            patience: 10,
            min_delta: 0.001,
          },
        },
      });

      // Auto-execute the demo pipeline
      const executionResult = await mlPipeline.executePipeline(
        demoResult.pipeline.pipeline_id
      );

      logger.info("Demo pipeline created and executed", {
        pipeline_id: demoResult.pipeline.pipeline_id,
        total_jobs: demoResult.pipeline.total_jobs,
        execution_started: executionResult.execution_started,
      });

      return NextResponse.json({
        success: true,
        data: {
          pipeline: demoResult.pipeline,
          datasets: demoResult.datasets,
          execution: executionResult,
          estimated_completion: demoResult.estimated_completion,
        },
        message: "Demo ML training pipeline created and executed successfully",
        pipeline_details: {
          name: demoResult.pipeline.pipeline_name,
          id: demoResult.pipeline.pipeline_id,
          total_jobs: demoResult.pipeline.total_jobs,
          model_types: [
            "content_performance",
            "hashtag_effectiveness",
            "engagement_prediction",
          ],
          datasets_count: demoResult.datasets.length,
          status: demoResult.pipeline.overall_status,
        },
        next_steps: [
          `Monitor progress: GET /api/data-seeding/ml-pretraining?action=status&pipeline_id=${demoResult.pipeline.pipeline_id}`,
          "Check training logs for model performance metrics",
          "Review completed models for deployment readiness",
        ],
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid action",
        available_actions: [
          "create_pipeline",
          "execute_pipeline",
          "demo_pipeline",
        ],
      },
      { status: 400 }
    );
  } catch (error) {
    logger.error("ML Pre-training API POST error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
