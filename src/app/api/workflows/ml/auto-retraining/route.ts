/**
 * ML Auto-Retraining API voor n8n Workflow Integration
 * Task 71.5: Automatiseer retraining en deployment van ML-modellen
 *
 * API endpoints voor n8n workflows om ML model retraining en deployment te orchestreren
 */

import { NextRequest, NextResponse } from "next/server";
import { ContinuousLearningEngine } from "@/lib/ml/continuous-learning-engine";
import { ModelValidationFramework } from "@/lib/ml/model-validation-framework";
import { ContentPerformanceMLEngine } from "@/lib/ml/content-performance-ml-engine";
import { createClient } from "@/lib/supabase/client";

// Initialize ML engines
const learningEngine = new ContinuousLearningEngine({
  retraining_threshold: 0.03, // 3% accuracy drop triggers retraining
  auto_deployment_threshold: 0.02, // 2% improvement triggers auto-deployment
  update_frequency: "daily",
  min_training_samples: 100,
});

const validationFramework = new ModelValidationFramework();
const mlEngine = new ContentPerformanceMLEngine();
const supabase = createClient();

/**
 * POST /api/workflows/ml/auto-retraining
 * Trigger ML model retraining from n8n workflow
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "trigger_retraining";
    const body = await request.json().catch(() => ({}));

    switch (action) {
      case "trigger_retraining":
        return await handleTriggerRetraining(body);

      case "check_performance":
        return await handleCheckPerformance(body);

      case "validate_models":
        return await handleValidateModels(body);

      case "deploy_model":
        return await handleDeployModel(body);

      case "get_training_status":
        return await handleGetTrainingStatus(body);

      case "schedule_retraining":
        return await handleScheduleRetraining(body);

      default:
        return NextResponse.json(
          {
            error: "Invalid action",
            available_actions: [
              "trigger_retraining",
              "check_performance",
              "validate_models",
              "deploy_model",
              "get_training_status",
              "schedule_retraining",
            ],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("ML Auto-Retraining API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/workflows/ml/auto-retraining
 * Get current training status and metrics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "status";

    switch (action) {
      case "status":
        return await handleGetStatus();

      case "metrics":
        return await handleGetMetrics();

      case "models":
        return await handleGetModels();

      case "history":
        return await handleGetTrainingHistory();

      default:
        return NextResponse.json(
          {
            error: "Invalid action",
            available_actions: ["status", "metrics", "models", "history"],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("ML Auto-Retraining API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Handler functions

/**
 * Trigger model retraining
 */
async function handleTriggerRetraining(body: any) {
  const {
    force = false,
    model_types = ["content_performance", "engagement_prediction"],
    performance_threshold = 0.03,
    workflow_id,
    webhook_url,
  } = body;

  try {
    console.log("🚀 Starting ML model retraining...", {
      force,
      model_types,
      performance_threshold,
      workflow_id,
    });

    // Check current model performance
    const performanceCheck = await checkModelPerformance(
      model_types,
      performance_threshold
    );

    if (!force && !performanceCheck.needs_retraining) {
      return NextResponse.json({
        success: true,
        retraining_needed: false,
        message: "Models are performing well, no retraining needed",
        performance_metrics: performanceCheck.metrics,
        next_check: performanceCheck.next_check,
        workflow_id,
      });
    }

    // Trigger retraining
    const retrainingResult = await learningEngine.triggerModelRetraining(force);

    // Send webhook notification if provided
    if (webhook_url) {
      await sendWebhookNotification(webhook_url, {
        type: "retraining_completed",
        workflow_id,
        result: retrainingResult,
        timestamp: new Date().toISOString(),
      });
    }

    // Store training job in database
    await supabase.from("ml_training_jobs").insert({
      job_id: `retraining_${Date.now()}`,
      workflow_id,
      job_type: "auto_retraining",
      model_types,
      status:
        retrainingResult.deployment_status === "deployed"
          ? "completed"
          : "validation_pending",
      performance_improvement: retrainingResult.performance_improvement,
      training_data_size: retrainingResult.training_data_size,
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      metadata: {
        force_retrain: force,
        threshold: performance_threshold,
        validation_metrics: retrainingResult.validation_metrics,
      },
    });

    return NextResponse.json({
      success: true,
      retraining_triggered: true,
      update_id: retrainingResult.update_id,
      model_version: retrainingResult.model_version,
      performance_improvement: retrainingResult.performance_improvement,
      deployment_status: retrainingResult.deployment_status,
      training_data_size: retrainingResult.training_data_size,
      validation_metrics: retrainingResult.validation_metrics,
      workflow_id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error triggering retraining:", error);

    // Send error webhook if provided
    if (body.webhook_url) {
      await sendWebhookNotification(body.webhook_url, {
        type: "retraining_failed",
        workflow_id: body.workflow_id,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
    }

    throw error;
  }
}

/**
 * Check model performance
 */
async function handleCheckPerformance(body: any) {
  const {
    model_types = ["content_performance", "engagement_prediction"],
    threshold = 0.03,
    time_window = 7,
  } = body;

  const performanceCheck = await checkModelPerformance(
    model_types,
    threshold,
    time_window
  );

  return NextResponse.json({
    success: true,
    needs_retraining: performanceCheck.needs_retraining,
    performance_metrics: performanceCheck.metrics,
    recommendations: performanceCheck.recommendations,
    next_check: performanceCheck.next_check,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Validate models
 */
async function handleValidateModels(body: any) {
  const { model_ids = [], validation_config } = body;

  const validationResults = [];

  for (const modelId of model_ids) {
    try {
      const result = await validationFramework.performHoldoutValidation(
        modelId,
        "latest_dataset",
        "holdout_data",
        validation_config
      );
      validationResults.push({
        model_id: modelId,
        validation_status: result.validation_status,
        performance_metrics: result.performance_metrics,
        recommendations: result.recommendations,
      });
    } catch (error) {
      validationResults.push({
        model_id: modelId,
        validation_status: "failed",
        error: error instanceof Error ? error.message : "Validation failed",
      });
    }
  }

  return NextResponse.json({
    success: true,
    validation_results: validationResults,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Deploy model
 */
async function handleDeployModel(body: any) {
  const { model_id, model_version, deployment_config } = body;

  try {
    // Simulate model deployment
    console.log(`🚀 Deploying model ${model_id} version ${model_version}`);

    // In real implementation, this would:
    // 1. Update model serving endpoints
    // 2. Update model registry
    // 3. Run health checks
    // 4. Update routing rules

    await supabase.from("ml_model_deployments").insert({
      model_id,
      model_version,
      deployment_status: "deployed",
      deployed_at: new Date().toISOString(),
      deployment_config,
    });

    return NextResponse.json({
      success: true,
      model_id,
      model_version,
      deployment_status: "deployed",
      deployment_time: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Model deployment failed:", error);

    await supabase.from("ml_model_deployments").insert({
      model_id,
      model_version,
      deployment_status: "failed",
      deployed_at: new Date().toISOString(),
      error_message:
        error instanceof Error ? error.message : "Deployment failed",
    });

    throw error;
  }
}

/**
 * Get training status
 */
async function handleGetTrainingStatus(body: any) {
  const { job_id, workflow_id } = body;

  try {
    let query = supabase.from("ml_training_jobs").select("*");

    if (job_id) {
      query = query.eq("job_id", job_id);
    } else if (workflow_id) {
      query = query.eq("workflow_id", workflow_id);
    }

    const { data: jobs, error } = await query
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Supabase error in handleGetTrainingStatus:", error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      training_jobs: jobs || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in handleGetTrainingStatus:", error);
    return NextResponse.json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get training status",
      training_jobs: [],
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Schedule retraining
 */
async function handleScheduleRetraining(body: any) {
  const {
    schedule_type = "performance_based", // 'performance_based', 'time_based', 'data_based'
    schedule_config,
    workflow_id,
  } = body;

  // Store retraining schedule
  await supabase.from("ml_retraining_schedules").insert({
    schedule_id: `schedule_${Date.now()}`,
    workflow_id,
    schedule_type,
    schedule_config,
    status: "active",
    created_at: new Date().toISOString(),
    next_execution: calculateNextExecution(schedule_type, schedule_config),
  });

  return NextResponse.json({
    success: true,
    message: "Retraining schedule created",
    schedule_type,
    next_execution: calculateNextExecution(schedule_type, schedule_config),
    workflow_id,
  });
}

/**
 * Get general status
 */
async function handleGetStatus() {
  const metrics = await learningEngine.getLearningMetrics();

  return NextResponse.json({
    success: true,
    learning_status: metrics.learning_status,
    current_metrics: metrics.current_metrics,
    model_versions: metrics.model_versions,
    recent_insights: metrics.recent_insights.slice(0, 3),
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get detailed metrics
 */
async function handleGetMetrics() {
  const metrics = await learningEngine.getLearningMetrics();

  return NextResponse.json({
    success: true,
    ...metrics,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get model information
 */
async function handleGetModels() {
  // Get model registry
  const { data: models, error } = await supabase
    .from("ml_models")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return NextResponse.json({
    success: true,
    models: models || [],
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get training history
 */
async function handleGetTrainingHistory() {
  try {
    const { data: history, error } = await supabase
      .from("ml_training_jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Supabase error in handleGetTrainingHistory:", error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      training_history: history || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in handleGetTrainingHistory:", error);
    return NextResponse.json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get training history",
      training_history: [],
      timestamp: new Date().toISOString(),
    });
  }
}

// Helper functions

async function checkModelPerformance(
  modelTypes: string[],
  threshold: number,
  timeWindow: number = 7
): Promise<{
  needs_retraining: boolean;
  metrics: any;
  recommendations: string[];
  next_check: string;
}> {
  const metrics: any = {};
  const recommendations: string[] = [];
  let needsRetraining = false;

  for (const modelType of modelTypes) {
    // Simulate performance check - in real implementation would check actual metrics
    const currentAccuracy = 0.85 + Math.random() * 0.1; // Simulate 85-95% accuracy
    const previousAccuracy = 0.88; // Simulate previous accuracy
    const accuracyDrop = previousAccuracy - currentAccuracy;

    metrics[modelType] = {
      current_accuracy: currentAccuracy,
      previous_accuracy: previousAccuracy,
      accuracy_drop: accuracyDrop,
      needs_retraining: accuracyDrop > threshold,
    };

    if (accuracyDrop > threshold) {
      needsRetraining = true;
      recommendations.push(
        `Model ${modelType} accuracy dropped by ${(accuracyDrop * 100).toFixed(1)}%, retraining recommended`
      );
    }
  }

  return {
    needs_retraining: needsRetraining,
    metrics,
    recommendations,
    next_check: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Next day
  };
}

async function sendWebhookNotification(webhookUrl: string, payload: any) {
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Failed to send webhook notification:", error);
  }
}

function calculateNextExecution(scheduleType: string, config: any): string {
  const now = new Date();

  switch (scheduleType) {
    case "time_based":
      // Daily, weekly, monthly
      const interval = config.interval || "daily";
      const days = interval === "daily" ? 1 : interval === "weekly" ? 7 : 30;
      return new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

    case "performance_based":
      // Check performance daily
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    case "data_based":
      // Check when new data threshold is reached
      return new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString(); // 12 hours

    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  }
}
