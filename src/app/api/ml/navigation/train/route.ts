/**
 * Navigation Model Training API
 * Endpoint for training the ML navigation model
 */

import { NextRequest, NextResponse } from "next/server";
import { NavigationMLEngine } from "@/lib/analytics/navigation-ml-engine";
import { NavigationDataProcessor } from "@/lib/analytics/navigation-data-processor";
import {
  MLModelConfig,
  RealtimeMLConfig,
  ModelTrainingJob,
} from "@/lib/analytics/ml-navigation-types";
import { createClient } from "@/lib/supabase/server";

// Initialize components
const mlConfig: RealtimeMLConfig = {
  enabled: true,
  prediction_interval: 1000,
  batch_size: 10,
  cache_predictions: true,
  cache_ttl: 300,
  fallback_strategy: "popular_pages",
  min_data_points: 100,
  retrain_threshold: 0.7,
  auto_retrain: false,
};

const mlEngine = new NavigationMLEngine(mlConfig);
const dataProcessor = new NavigationDataProcessor();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model_config, data_range, training_options = {} } = body;

    // Validate required fields
    if (!model_config || !data_range) {
      return NextResponse.json(
        { error: "Missing required fields: model_config and data_range" },
        { status: 400 }
      );
    }

    // Create training job
    const trainingJob: ModelTrainingJob = {
      id: `train_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: "pending",
      started_at: new Date().toISOString(),
      config: model_config,
      data_range,
      model_version: `v${Date.now()}`,
    };

    // Log training job start
    await logTrainingJob(trainingJob);

    // Start training (run asynchronously)
    trainModelAsync(trainingJob, training_options);

    return NextResponse.json({
      message: "Model training started",
      job_id: trainingJob.id,
      status: trainingJob.status,
    });
  } catch (error) {
    console.error("Error starting model training:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("job_id");

    if (jobId) {
      // Get specific training job status
      const jobStatus = await getTrainingJobStatus(jobId);
      if (!jobStatus) {
        return NextResponse.json(
          { error: "Training job not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(jobStatus);
    }

    // Get model status and metrics
    const modelMetrics = mlEngine.getModelMetrics();
    const needsRetraining = mlEngine.needsRetraining();

    return NextResponse.json({
      model_status: {
        loaded: modelMetrics.accuracy > 0,
        version: modelMetrics.last_trained,
        performance: modelMetrics,
        needs_retraining: needsRetraining,
      },
      suggested_config: getSuggestedModelConfig(),
    });
  } catch (error) {
    console.error("Error getting model status:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Async training function
async function trainModelAsync(trainingJob: ModelTrainingJob, options: any) {
  try {
    // Update job status
    trainingJob.status = "running";
    await updateTrainingJob(trainingJob);

    console.log(`Starting model training for job ${trainingJob.id}...`);

    // Prepare training data
    const trainingData = await dataProcessor.prepareTrainingData(
      trainingJob.data_range.start_date,
      trainingJob.data_range.end_date,
      {
        minSessionDuration: options.min_session_duration || 30,
        excludeBounceSessions: options.exclude_bounce_sessions || true,
        sampleSize: options.sample_size,
      }
    );

    if (trainingData.length < mlConfig.min_data_points) {
      throw new Error(
        `Insufficient training data: ${trainingData.length} points (minimum: ${mlConfig.min_data_points})`
      );
    }

    console.log(`Training with ${trainingData.length} data points...`);

    // Train the model
    const trainingStartTime = Date.now();
    const metrics = await mlEngine.trainModel(trainingData, trainingJob.config);
    const trainingDuration = Date.now() - trainingStartTime;

    // Update job with results
    trainingJob.status = "completed";
    trainingJob.completed_at = new Date().toISOString();
    trainingJob.metrics = metrics;
    trainingJob.training_duration = trainingDuration;

    await updateTrainingJob(trainingJob);

    console.log(
      `Model training completed for job ${trainingJob.id}. Accuracy: ${metrics.accuracy.toFixed(3)}`
    );
  } catch (error) {
    console.error(`Error in training job ${trainingJob.id}:`, error);

    // Update job with error
    trainingJob.status = "failed";
    trainingJob.completed_at = new Date().toISOString();
    trainingJob.error_message =
      error instanceof Error ? error.message : "Unknown error";

    await updateTrainingJob(trainingJob);
  }
}

// Database helper functions
async function logTrainingJob(job: ModelTrainingJob) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("ml_training_jobs").insert({
      id: job.id,
      status: job.status,
      started_at: job.started_at,
      model_config: job.config,
      data_range: job.data_range,
      model_version: job.model_version,
    });

    if (error) {
      console.warn("Error logging training job:", error);
    }
  } catch (error) {
    console.warn("Error in training job logging:", error);
  }
}

async function updateTrainingJob(job: ModelTrainingJob) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("ml_training_jobs")
      .update({
        status: job.status,
        completed_at: job.completed_at,
        metrics: job.metrics,
        error_message: job.error_message,
        training_duration: job.training_duration,
        updated_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    if (error) {
      console.warn("Error updating training job:", error);
    }
  } catch (error) {
    console.warn("Error in training job update:", error);
  }
}

async function getTrainingJobStatus(
  jobId: string
): Promise<ModelTrainingJob | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("ml_training_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      status: data.status,
      started_at: data.started_at,
      completed_at: data.completed_at,
      config: data.model_config,
      data_range: data.data_range,
      metrics: data.metrics,
      error_message: data.error_message,
      model_version: data.model_version,
      training_duration: data.training_duration,
    };
  } catch (error) {
    console.warn("Error getting training job status:", error);
    return null;
  }
}

function getSuggestedModelConfig(): MLModelConfig {
  return {
    model_type: "random_forest",
    parameters: {
      n_estimators: 100,
      max_depth: 10,
      min_samples_split: 5,
      min_samples_leaf: 2,
      random_state: 42,
    },
    feature_selection: {
      enabled: true,
      method: "variance_threshold",
      n_features: 20,
    },
    cross_validation: {
      enabled: true,
      folds: 5,
      scoring: "accuracy",
    },
    hyperparameter_tuning: {
      enabled: false,
      method: "grid_search",
      param_distributions: {
        n_estimators: [50, 100, 200],
        max_depth: [5, 10, 15],
        min_samples_split: [2, 5, 10],
      },
    },
  };
}
