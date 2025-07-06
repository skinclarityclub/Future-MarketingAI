/**
 * ML Pre-training Pipeline System
 * Task 70.6: Implementeer ML Pre-training Pipelines en Batch Training
 *
 * Enterprise-grade ML pre-training system that orchestrates batch training
 * of multiple ML models using cleaned and validated data from the data seeding system
 */

import { DataCleaningEngine, CleanedDataOutput } from "./data-cleaning-engine";
import { ContentPerformanceMLEngine } from "../ml/content-performance-ml-engine";
import { ContinuousLearningEngine } from "../ml/continuous-learning-engine";
import { createClient } from "@supabase/supabase-js";
// Temporarily disable logger to avoid webpack issues in API routes
// import { logger } from '../logger';
const logger = {
  info: (msg: string, data?: any) => console.log(`[INFO] ${msg}`, data || ""),
  error: (msg: string, data?: any) =>
    console.error(`[ERROR] ${msg}`, data || ""),
  warn: (msg: string, data?: any) => console.warn(`[WARN] ${msg}`, data || ""),
  debug: (msg: string, data?: any) =>
    console.debug(`[DEBUG] ${msg}`, data || ""),
};

// Core training configuration interface
export interface TrainingConfig {
  model_types: (
    | "content_performance"
    | "hashtag_effectiveness"
    | "engagement_prediction"
    | "cross_platform"
    | "sentiment_analysis"
  )[];
  batch_size: number;
  learning_rate: number;
  epochs: number;
  validation_split: number;
  early_stopping: {
    enabled: boolean;
    patience: number;
    min_delta: number;
  };
}

// Training dataset structure
export interface TrainingDataset {
  dataset_id: string;
  dataset_name: string;
  source_tables: string[];
  total_records: number;
  features: string[];
  target_variables: string[];
  data_quality_score: number;
  temporal_range: {
    start_date: string;
    end_date: string;
  };
}

// Individual training job
export interface ModelTrainingJob {
  job_id: string;
  model_type: string;
  model_name: string;
  training_config: TrainingConfig;
  dataset: TrainingDataset;
  status:
    | "queued"
    | "preprocessing"
    | "training"
    | "validating"
    | "completed"
    | "failed";
  progress: {
    current_epoch: number;
    total_epochs: number;
    training_loss: number;
    validation_loss: number;
    accuracy: number;
  };
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

// Batch training pipeline
export interface BatchTrainingPipeline {
  pipeline_id: string;
  pipeline_name: string;
  training_jobs: ModelTrainingJob[];
  total_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  overall_status: "pending" | "running" | "completed" | "failed";
  start_time: string;
  estimated_completion: string;
}

export class MLPreTrainingPipeline {
  private dataCleaningEngine: DataCleaningEngine | null = null;
  private contentMLEngine: ContentPerformanceMLEngine | null = null;
  private continuousLearningEngine: ContinuousLearningEngine | null = null;
  private supabase: any;

  private activePipelines: Map<string, BatchTrainingPipeline> = new Map();
  private trainingQueue: ModelTrainingJob[] = [];
  private maxConcurrentJobs: number = 3;
  private isTraining: boolean = false;

  constructor(config?: { maxConcurrentJobs?: number }) {
    // Initialize engines lazily to avoid Supabase connection issues in API routes
    this.maxConcurrentJobs = config?.maxConcurrentJobs || 3;
    this.supabase = null;
  }

  /**
   * Initialize Supabase client
   */
  private async getSupabaseClient() {
    if (!this.supabase) {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.SUPABASE_SERVICE_ROLE_KEY || ""
      );
    }
    return this.supabase;
  }

  /**
   * Lazy initialize data cleaning engine
   */
  private getDataCleaningEngine(): DataCleaningEngine {
    if (!this.dataCleaningEngine) {
      this.dataCleaningEngine = new DataCleaningEngine();
    }
    return this.dataCleaningEngine;
  }

  /**
   * Lazy initialize content ML engine
   */
  private getContentMLEngine(): ContentPerformanceMLEngine {
    if (!this.contentMLEngine) {
      this.contentMLEngine = new ContentPerformanceMLEngine();
    }
    return this.contentMLEngine;
  }

  /**
   * Lazy initialize continuous learning engine
   */
  private getContinuousLearningEngine(): ContinuousLearningEngine {
    if (!this.continuousLearningEngine) {
      this.continuousLearningEngine = new ContinuousLearningEngine();
    }
    return this.continuousLearningEngine;
  }

  /**
   * Create and execute a comprehensive batch training pipeline
   */
  async createBatchTrainingPipeline(config: {
    pipeline_name: string;
    model_types: TrainingConfig["model_types"];
    data_sources: {
      table_name: string;
      filters?: any;
      date_range?: { start: string; end: string };
    }[];
    training_config: Partial<TrainingConfig>;
  }): Promise<{
    pipeline: BatchTrainingPipeline;
    datasets: TrainingDataset[];
    estimated_completion: string;
  }> {
    try {
      logger.info("Creating batch training pipeline", {
        pipeline_name: config.pipeline_name,
        model_types: config.model_types,
        data_sources: config.data_sources.length,
      });

      // Step 1: Prepare and clean training datasets
      const datasets = await this.prepareTrainingDatasets(config.data_sources);

      // Step 2: Create training jobs for each model type
      const trainingJobs = await this.createTrainingJobs(
        config.model_types,
        datasets,
        config.training_config
      );

      // Step 3: Create batch training pipeline
      const pipeline: BatchTrainingPipeline = {
        pipeline_id: `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        pipeline_name: config.pipeline_name,
        training_jobs: trainingJobs,
        total_jobs: trainingJobs.length,
        completed_jobs: 0,
        failed_jobs: 0,
        overall_status: "pending",
        start_time: new Date().toISOString(),
        estimated_completion: this.calculateEstimatedCompletion(trainingJobs),
      };

      // Store pipeline in database
      await this.storePipeline(pipeline);

      // Add to active pipelines
      this.activePipelines.set(pipeline.pipeline_id, pipeline);

      logger.info("Batch training pipeline created successfully", {
        pipeline_id: pipeline.pipeline_id,
        total_jobs: pipeline.total_jobs,
        estimated_completion: pipeline.estimated_completion,
      });

      return {
        pipeline,
        datasets,
        estimated_completion: pipeline.estimated_completion,
      };
    } catch (error) {
      logger.error("Error creating batch training pipeline", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Execute a batch training pipeline
   */
  async executePipeline(pipelineId: string): Promise<{
    execution_started: boolean;
    active_jobs: string[];
    queued_jobs: string[];
  }> {
    try {
      const pipeline = this.activePipelines.get(pipelineId);
      if (!pipeline) {
        throw new Error(`Pipeline ${pipelineId} not found`);
      }

      logger.info("Starting pipeline execution", {
        pipeline_id: pipelineId,
        total_jobs: pipeline.total_jobs,
      });

      // Update pipeline status
      pipeline.overall_status = "running";
      pipeline.start_time = new Date().toISOString();

      // Add jobs to training queue
      this.trainingQueue.push(...pipeline.training_jobs);

      // Start training processor if not already running
      if (!this.isTraining) {
        this.startTrainingProcessor();
      }

      const activeJobs = pipeline.training_jobs
        .filter(
          job => job.status === "training" || job.status === "preprocessing"
        )
        .map(job => job.job_id);

      const queuedJobs = pipeline.training_jobs
        .filter(job => job.status === "queued")
        .map(job => job.job_id);

      return {
        execution_started: true,
        active_jobs: activeJobs,
        queued_jobs: queuedJobs,
      };
    } catch (error) {
      logger.error("Error executing pipeline", {
        pipeline_id: pipelineId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Get pipeline status and progress
   */
  async getPipelineStatus(pipelineId: string): Promise<{
    pipeline: BatchTrainingPipeline;
    job_details: ModelTrainingJob[];
    overall_progress: number;
  }> {
    try {
      const pipeline = this.activePipelines.get(pipelineId);
      if (!pipeline) {
        throw new Error(`Pipeline ${pipelineId} not found`);
      }

      const overallProgress =
        (pipeline.completed_jobs / pipeline.total_jobs) * 100;

      return {
        pipeline,
        job_details: pipeline.training_jobs,
        overall_progress: overallProgress,
      };
    } catch (error) {
      logger.error("Error getting pipeline status", {
        pipeline_id: pipelineId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Prepare training datasets from data sources
   */
  private async prepareTrainingDatasets(
    dataSources: {
      table_name: string;
      filters?: any;
      date_range?: { start: string; end: string };
    }[]
  ): Promise<TrainingDataset[]> {
    const datasets: TrainingDataset[] = [];

    for (const source of dataSources) {
      try {
        // Fetch raw data from source
        const rawData = await this.fetchRawData(source);

        // Clean and validate data
        const cleanedData = await this.getDataCleaningEngine().cleanDataBatch([
          {
            source: source.table_name as any,
            data: rawData,
            timestamp: new Date().toISOString(),
            metadata: {
              type: "training_data",
              quality: 0.9,
              confidence: 0.85,
            },
          },
        ]);

        if (cleanedData.length > 0) {
          const dataset: TrainingDataset = {
            dataset_id: `dataset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            dataset_name: `${source.table_name}_dataset`,
            source_tables: [source.table_name],
            total_records: cleanedData[0].cleanedData.length,
            features: this.extractFeatures(cleanedData[0].cleanedData),
            target_variables: this.identifyTargetVariables(source.table_name),
            data_quality_score: cleanedData[0].metadata.qualityScore,
            temporal_range: {
              start_date:
                source.date_range?.start ||
                this.getDataStartDate(cleanedData[0].cleanedData),
              end_date:
                source.date_range?.end ||
                this.getDataEndDate(cleanedData[0].cleanedData),
            },
          };

          datasets.push(dataset);
          await this.storeDataset(dataset, cleanedData[0].cleanedData);
        }
      } catch (error) {
        logger.error("Error preparing dataset", {
          source: source.table_name,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return datasets;
  }

  /**
   * Create training jobs for different model types
   */
  private async createTrainingJobs(
    modelTypes: TrainingConfig["model_types"],
    datasets: TrainingDataset[],
    trainingConfig: Partial<TrainingConfig>
  ): Promise<ModelTrainingJob[]> {
    const jobs: ModelTrainingJob[] = [];

    for (const modelType of modelTypes) {
      for (const dataset of datasets) {
        const job: ModelTrainingJob = {
          job_id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          model_type: modelType,
          model_name: `${modelType}_model_${Date.now()}`,
          training_config: {
            model_types: [modelType],
            batch_size: 32,
            learning_rate: 0.001,
            epochs: 100,
            validation_split: 0.2,
            early_stopping: {
              enabled: true,
              patience: 10,
              min_delta: 0.001,
            },
            ...trainingConfig,
          },
          dataset: dataset,
          status: "queued",
          progress: {
            current_epoch: 0,
            total_epochs: trainingConfig.epochs || 100,
            training_loss: 0,
            validation_loss: 0,
            accuracy: 0,
          },
          created_at: new Date().toISOString(),
        };

        jobs.push(job);
      }
    }

    return jobs;
  }

  /**
   * Start the training processor that handles queued jobs
   */
  private async startTrainingProcessor(): Promise<void> {
    if (this.isTraining) return;

    this.isTraining = true;
    logger.info("Starting training processor");

    while (this.isTraining && this.trainingQueue.length > 0) {
      const activeJobs = Array.from(this.activePipelines.values())
        .flatMap(pipeline => pipeline.training_jobs)
        .filter(
          job => job.status === "training" || job.status === "preprocessing"
        );

      if (activeJobs.length < this.maxConcurrentJobs) {
        const nextJob = this.trainingQueue.shift();
        if (nextJob) {
          this.executeTrainingJob(nextJob).catch(error => {
            logger.error("Training job failed", {
              job_id: nextJob.job_id,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          });
        }
      }

      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    this.isTraining = false;
    logger.info("Training processor stopped");
  }

  /**
   * Execute individual training job
   */
  private async executeTrainingJob(job: ModelTrainingJob): Promise<void> {
    try {
      logger.info("Starting training job", {
        job_id: job.job_id,
        model_type: job.model_type,
      });

      // Update job status
      job.status = "preprocessing";
      job.started_at = new Date().toISOString();

      // Preprocessing phase
      const preprocessedData = await this.preprocessTrainingData(job);

      // Training phase
      job.status = "training";
      const modelResult = await this.trainModel(job, preprocessedData);

      // Validation phase
      job.status = "validating";
      const validationResults = await this.validateModel(job, modelResult);

      // Complete job
      job.status = "completed";
      job.completed_at = new Date().toISOString();
      job.progress.accuracy = validationResults.accuracy;

      await this.updatePipelineProgress(job);

      logger.info("Training job completed successfully", {
        job_id: job.job_id,
        accuracy: validationResults.accuracy,
      });
    } catch (error) {
      job.status = "failed";
      job.error_message =
        error instanceof Error ? error.message : "Unknown error";
      job.completed_at = new Date().toISOString();

      await this.updatePipelineProgress(job);

      logger.error("Training job failed", {
        job_id: job.job_id,
        error: job.error_message,
      });
    }
  }

  // Helper methods
  private async fetchRawData(source: any): Promise<any[]> {
    const supabase = await this.getSupabaseClient();
    const { data } = await supabase.from(source.table_name).select("*");
    return data || [];
  }

  private extractFeatures(data: any[]): string[] {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter(
      key => !["id", "created_at", "updated_at"].includes(key)
    );
  }

  private identifyTargetVariables(tableName: string): string[] {
    const targetMap: { [key: string]: string[] } = {
      content_posts: ["engagement_rate", "performance_score"],
      content_analytics: ["engagement_rate", "reach", "impressions"],
      social_accounts: ["follower_growth_rate"],
      campaigns: ["roi", "conversion_rate"],
    };

    return targetMap[tableName] || ["performance_score"];
  }

  private getDataStartDate(data: any[]): string {
    const dates = data
      .map(item => item.created_at || item.published_at)
      .filter(Boolean);
    return dates.length > 0
      ? new Date(
          Math.min(...dates.map(d => new Date(d).getTime()))
        ).toISOString()
      : new Date().toISOString();
  }

  private getDataEndDate(data: any[]): string {
    const dates = data
      .map(item => item.created_at || item.published_at)
      .filter(Boolean);
    return dates.length > 0
      ? new Date(
          Math.max(...dates.map(d => new Date(d).getTime()))
        ).toISOString()
      : new Date().toISOString();
  }

  private calculateEstimatedCompletion(jobs: ModelTrainingJob[]): string {
    const avgTrainingTimePerJob = 30 * 60 * 1000; // 30 minutes per job
    const parallelJobs = Math.min(this.maxConcurrentJobs, jobs.length);
    const totalTime = (jobs.length / parallelJobs) * avgTrainingTimePerJob;

    const completionTime = new Date(Date.now() + totalTime);
    return completionTime.toISOString();
  }

  private async preprocessTrainingData(job: ModelTrainingJob): Promise<any> {
    // Mock preprocessing - feature engineering, normalization, etc.
    return { preprocessed: true, features: job.dataset.features };
  }

  private async trainModel(job: ModelTrainingJob, data: any): Promise<any> {
    // Mock training - would train actual ML models
    return {
      trained: true,
      accuracy: 0.85 + Math.random() * 0.1,
      model_path: `/models/${job.model_name}.model`,
    };
  }

  private async validateModel(job: ModelTrainingJob, model: any): Promise<any> {
    // Mock validation
    return {
      accuracy: model.accuracy,
      precision: model.accuracy * 0.95,
      recall: model.accuracy * 0.93,
      f1_score: model.accuracy * 0.94,
    };
  }

  // Database operations
  private async storePipeline(pipeline: BatchTrainingPipeline): Promise<void> {
    const supabase = await this.getSupabaseClient();
    await supabase.from("ml_training_pipelines").insert({
      pipeline_id: pipeline.pipeline_id,
      pipeline_name: pipeline.pipeline_name,
      status: pipeline.overall_status,
      total_jobs: pipeline.total_jobs,
      completed_jobs: pipeline.completed_jobs,
      failed_jobs: pipeline.failed_jobs,
      created_at: pipeline.start_time,
    });
  }

  private async storeDataset(
    dataset: TrainingDataset,
    data: any[]
  ): Promise<void> {
    const supabase = await this.getSupabaseClient();
    await supabase.from("ml_training_datasets").insert({
      dataset_id: dataset.dataset_id,
      dataset_name: dataset.dataset_name,
      source_tables: dataset.source_tables,
      total_records: dataset.total_records,
      features: dataset.features,
      target_variables: dataset.target_variables,
      data_quality_score: dataset.data_quality_score,
      temporal_range: dataset.temporal_range,
      created_at: new Date().toISOString(),
    });
  }

  private async updatePipelineProgress(job: ModelTrainingJob): Promise<void> {
    // Find and update the pipeline containing this job
    for (const [pipelineId, pipeline] of this.activePipelines.entries()) {
      const jobIndex = pipeline.training_jobs.findIndex(
        j => j.job_id === job.job_id
      );
      if (jobIndex !== -1) {
        pipeline.training_jobs[jobIndex] = job;

        if (job.status === "completed") {
          pipeline.completed_jobs++;
        } else if (job.status === "failed") {
          pipeline.failed_jobs++;
        }

        // Check if pipeline is complete
        if (
          pipeline.completed_jobs + pipeline.failed_jobs >=
          pipeline.total_jobs
        ) {
          pipeline.overall_status = "completed";
        }
        break;
      }
    }
  }
}
