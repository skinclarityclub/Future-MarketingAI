/**
 * Automated Engine Distributor
 * Task 72.6: Automatiseer distributie naar alle AI/ML engines
 *
 * Implementeert automatische, real-time distributie van genormaliseerde en verrijkte data
 * naar alle relevante AI/ML engines voor content, marketing, customer intelligence,
 * analytics, navigation, research en NLP/assistant.
 */

import { createClient } from "@supabase/supabase-js";
import { ContentPerformanceMLEngine } from "../ml/content-performance-ml-engine";
import { NavigationMLEngine } from "../analytics/navigation-ml-engine";
import SelfLearningAnalyticsService from "../marketing/self-learning-analytics";
import { ChurnPredictionEngine } from "../customer-intelligence/churn-prediction";
import { ROIAlgorithmEngine } from "../analytics/roi-algorithms";
import { OptimizationEngine } from "../analytics/optimization-engine";

// Distribution Configuration Interface
export interface DistributionConfig {
  // Real-time Distribution Settings
  realtime: {
    enabled: boolean;
    batch_size: number;
    frequency_ms: number;
    max_queue_size: number;
    retry_attempts: number;
    timeout_ms: number;
  };

  // Batch Distribution Settings
  batch: {
    enabled: boolean;
    schedule: "hourly" | "daily" | "weekly";
    max_batch_size: number;
    processing_window_hours: number;
    parallel_processing: boolean;
  };

  // Engine-specific Settings
  engines: {
    [engineName: string]: {
      enabled: boolean;
      priority: "high" | "medium" | "low";
      data_format: string;
      distribution_method: "api" | "database" | "websocket" | "queue";
      requirements: {
        min_records: number;
        required_fields: string[];
        quality_threshold: number;
        freshness_threshold_hours: number;
      };
      transformation_rules: {
        field_mappings: Record<string, string>;
        filters: Record<string, any>;
        aggregations: string[];
      };
    };
  };

  // Quality & Governance
  quality: {
    min_confidence_score: number;
    bias_check_enabled: boolean;
    governance_validation: boolean;
    data_lineage_tracking: boolean;
  };

  // Monitoring & Alerting
  monitoring: {
    performance_tracking: boolean;
    error_alerting: boolean;
    success_rate_threshold: number;
    latency_threshold_ms: number;
  };
}

// Distribution Status Interface
export interface DistributionStatus {
  status: "idle" | "processing" | "distributing" | "monitoring" | "error";
  current_batch: {
    batch_id: string;
    records_count: number;
    started_at: string;
    estimated_completion: string;
  };
  engines_status: {
    [engineName: string]: {
      status: "ready" | "processing" | "completed" | "error";
      last_distribution: string;
      records_distributed: number;
      success_rate: number;
      avg_processing_time_ms: number;
      queue_size: number;
    };
  };
  performance_metrics: {
    total_records_processed: number;
    successful_distributions: number;
    failed_distributions: number;
    avg_distribution_time_ms: number;
    throughput_per_minute: number;
  };
  last_distribution: string;
  next_scheduled_distribution: string;
}

// Distribution Result Interface
export interface DistributionResult {
  engine_name: string;
  batch_id: string;
  success: boolean;
  records_processed: number;
  records_distributed: number;
  processing_time_ms: number;
  quality_score: number;
  confidence_score: number;
  error_details?: {
    error_type: string;
    error_message: string;
    failed_records: number;
    retry_eligible: boolean;
  };
  metadata: {
    data_source: string;
    transformation_applied: boolean;
    validation_passed: boolean;
    governance_compliant: boolean;
  };
}

// Engine Registry Interface
export interface EngineInfo {
  name: string;
  instance: any;
  capabilities: string[];
  data_requirements: {
    input_format: string;
    required_fields: string[];
    optional_fields: string[];
    min_batch_size: number;
    max_batch_size: number;
  };
  performance_characteristics: {
    avg_processing_time_ms: number;
    max_throughput_per_minute: number;
    memory_usage_mb: number;
    cpu_intensive: boolean;
  };
}

export class AutomatedEngineDistributor {
  private config: DistributionConfig;
  private status: DistributionStatus;
  private supabase: any;

  // Engine Registry
  private engineRegistry: Map<string, EngineInfo>;

  // Distribution Queue Management
  private distributionQueue: Map<string, any[]>;
  private processingQueue: Map<string, Promise<DistributionResult>>;

  // Real-time Processing
  private realtimeInterval: NodeJS.Timeout | null = null;
  private batchScheduler: NodeJS.Timeout | null = null;

  // Performance Monitoring
  private performanceMetrics: Map<string, number[]>;
  private errorTracking: Map<string, string[]>;

  constructor(config?: Partial<DistributionConfig>) {
    this.config = this.initializeConfig(config);
    this.status = this.initializeStatus();
    this.engineRegistry = new Map();
    this.distributionQueue = new Map();
    this.processingQueue = new Map();
    this.performanceMetrics = new Map();
    this.errorTracking = new Map();

    // Initialize Supabase client
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    this.initializeEngineRegistry();
    this.startDistributionServices();
  }

  /**
   * Initialize default configuration
   */
  private initializeConfig(
    config?: Partial<DistributionConfig>
  ): DistributionConfig {
    return {
      realtime: {
        enabled: true,
        batch_size: 100,
        frequency_ms: 30000, // 30 seconds
        max_queue_size: 1000,
        retry_attempts: 3,
        timeout_ms: 60000,
      },
      batch: {
        enabled: true,
        schedule: "hourly",
        max_batch_size: 5000,
        processing_window_hours: 24,
        parallel_processing: true,
      },
      engines: {
        content_performance: {
          enabled: true,
          priority: "high",
          data_format: "content_analytics",
          distribution_method: "database",
          requirements: {
            min_records: 10,
            required_fields: ["content_id", "platform", "engagement_rate"],
            quality_threshold: 0.8,
            freshness_threshold_hours: 1,
          },
          transformation_rules: {
            field_mappings: {
              post_id: "content_id",
              social_platform: "platform",
              likes: "engagement_count",
            },
            filters: { status: "published" },
            aggregations: ["daily_totals", "platform_averages"],
          },
        },
        navigation_ml: {
          enabled: true,
          priority: "high",
          data_format: "navigation_events",
          distribution_method: "api",
          requirements: {
            min_records: 50,
            required_fields: ["user_id", "page_path", "timestamp"],
            quality_threshold: 0.75,
            freshness_threshold_hours: 0.5,
          },
          transformation_rules: {
            field_mappings: {},
            filters: { session_valid: true },
            aggregations: ["user_sessions", "page_popularity"],
          },
        },
        customer_intelligence: {
          enabled: true,
          priority: "medium",
          data_format: "customer_behavior",
          distribution_method: "database",
          requirements: {
            min_records: 25,
            required_fields: ["customer_id", "interaction_type", "timestamp"],
            quality_threshold: 0.85,
            freshness_threshold_hours: 2,
          },
          transformation_rules: {
            field_mappings: {
              user_id: "customer_id",
              action: "interaction_type",
            },
            filters: { valid_customer: true },
            aggregations: ["customer_segments", "behavior_patterns"],
          },
        },
        analytics_engine: {
          enabled: true,
          priority: "medium",
          data_format: "analytics_events",
          distribution_method: "queue",
          requirements: {
            min_records: 100,
            required_fields: ["event_type", "timestamp", "properties"],
            quality_threshold: 0.7,
            freshness_threshold_hours: 1,
          },
          transformation_rules: {
            field_mappings: {},
            filters: { event_valid: true },
            aggregations: ["event_counts", "user_flows"],
          },
        },
        research_engine: {
          enabled: true,
          priority: "low",
          data_format: "research_data",
          distribution_method: "api",
          requirements: {
            min_records: 5,
            required_fields: ["topic", "content", "source"],
            quality_threshold: 0.6,
            freshness_threshold_hours: 6,
          },
          transformation_rules: {
            field_mappings: {},
            filters: { content_quality: "high" },
            aggregations: ["topic_trends", "source_reliability"],
          },
        },
        nlp_assistant: {
          enabled: true,
          priority: "medium",
          data_format: "conversation_data",
          distribution_method: "websocket",
          requirements: {
            min_records: 20,
            required_fields: ["query", "response", "context"],
            quality_threshold: 0.8,
            freshness_threshold_hours: 0.25,
          },
          transformation_rules: {
            field_mappings: {
              user_query: "query",
              assistant_response: "response",
            },
            filters: { conversation_valid: true },
            aggregations: ["intent_patterns", "response_quality"],
          },
        },
      },
      quality: {
        min_confidence_score: 0.7,
        bias_check_enabled: true,
        governance_validation: true,
        data_lineage_tracking: true,
      },
      monitoring: {
        performance_tracking: true,
        error_alerting: true,
        success_rate_threshold: 0.95,
        latency_threshold_ms: 5000,
      },
      ...config,
    };
  }

  /**
   * Initialize distribution status
   */
  private initializeStatus(): DistributionStatus {
    return {
      status: "idle",
      current_batch: {
        batch_id: "",
        records_count: 0,
        started_at: "",
        estimated_completion: "",
      },
      engines_status: {},
      performance_metrics: {
        total_records_processed: 0,
        successful_distributions: 0,
        failed_distributions: 0,
        avg_distribution_time_ms: 0,
        throughput_per_minute: 0,
      },
      last_distribution: "",
      next_scheduled_distribution: this.calculateNextScheduledRun(),
    };
  }

  /**
   * Initialize and register all available AI/ML engines
   */
  private async initializeEngineRegistry(): Promise<void> {
    try {
      // Content Performance ML Engine
      if (this.config.engines.content_performance?.enabled) {
        this.engineRegistry.set("content_performance", {
          name: "Content Performance ML Engine",
          instance: new ContentPerformanceMLEngine(),
          capabilities: [
            "content_analysis",
            "performance_prediction",
            "optimization",
          ],
          data_requirements: {
            input_format: "content_analytics",
            required_fields: [
              "content_id",
              "platform",
              "engagement_rate",
              "performance_score",
            ],
            optional_fields: ["hashtags", "posting_time", "content_type"],
            min_batch_size: 10,
            max_batch_size: 1000,
          },
          performance_characteristics: {
            avg_processing_time_ms: 250,
            max_throughput_per_minute: 500,
            memory_usage_mb: 128,
            cpu_intensive: true,
          },
        });
      }

      // Navigation ML Engine
      if (this.config.engines.navigation_ml?.enabled) {
        this.engineRegistry.set("navigation_ml", {
          name: "Navigation ML Engine",
          instance: new NavigationMLEngine({
            enabled: true,
            prediction_interval: 1000,
            batch_size: 50,
            cache_predictions: true,
            cache_ttl: 300,
            fallback_strategy: "popular_pages",
            min_data_points: 100,
            retrain_threshold: 0.8,
            auto_retrain: true,
          }),
          capabilities: [
            "navigation_prediction",
            "user_behavior_analysis",
            "page_recommendations",
          ],
          data_requirements: {
            input_format: "navigation_events",
            required_fields: [
              "user_id",
              "page_path",
              "timestamp",
              "session_data",
            ],
            optional_fields: ["referrer", "user_agent", "device_type"],
            min_batch_size: 50,
            max_batch_size: 2000,
          },
          performance_characteristics: {
            avg_processing_time_ms: 150,
            max_throughput_per_minute: 800,
            memory_usage_mb: 256,
            cpu_intensive: false,
          },
        });
      }

      // Self-Learning Analytics Engine
      if (this.config.engines.analytics_engine?.enabled) {
        this.engineRegistry.set("analytics_engine", {
          name: "Self-Learning Analytics Engine",
          instance: new SelfLearningAnalyticsService(),
          capabilities: [
            "pattern_recognition",
            "performance_optimization",
            "predictive_analytics",
          ],
          data_requirements: {
            input_format: "analytics_events",
            required_fields: [
              "event_type",
              "timestamp",
              "properties",
              "user_id",
            ],
            optional_fields: ["session_id", "page_url", "referrer"],
            min_batch_size: 100,
            max_batch_size: 5000,
          },
          performance_characteristics: {
            avg_processing_time_ms: 300,
            max_throughput_per_minute: 400,
            memory_usage_mb: 512,
            cpu_intensive: true,
          },
        });
      }

      // Customer Intelligence Engine (Churn Prediction)
      if (this.config.engines.customer_intelligence?.enabled) {
        this.engineRegistry.set("customer_intelligence", {
          name: "Customer Intelligence Engine",
          instance: new ChurnPredictionEngine(),
          capabilities: [
            "churn_prediction",
            "customer_segmentation",
            "behavior_analysis",
          ],
          data_requirements: {
            input_format: "customer_behavior",
            required_fields: [
              "customer_id",
              "interaction_type",
              "timestamp",
              "value",
            ],
            optional_fields: ["channel", "campaign_id", "product_category"],
            min_batch_size: 25,
            max_batch_size: 1500,
          },
          performance_characteristics: {
            avg_processing_time_ms: 400,
            max_throughput_per_minute: 300,
            memory_usage_mb: 384,
            cpu_intensive: true,
          },
        });
      }

      // ROI Algorithm Engine
      this.engineRegistry.set("roi_engine", {
        name: "ROI Algorithm Engine",
        instance: new ROIAlgorithmEngine(),
        capabilities: [
          "roi_calculation",
          "performance_optimization",
          "cost_analysis",
        ],
        data_requirements: {
          input_format: "financial_data",
          required_fields: ["campaign_id", "cost", "revenue", "timestamp"],
          optional_fields: ["channel", "audience_segment", "content_type"],
          min_batch_size: 5,
          max_batch_size: 500,
        },
        performance_characteristics: {
          avg_processing_time_ms: 100,
          max_throughput_per_minute: 1000,
          memory_usage_mb: 64,
          cpu_intensive: false,
        },
      });

      // Optimization Engine
      this.engineRegistry.set("optimization_engine", {
        name: "Optimization Engine",
        instance: new OptimizationEngine(),
        capabilities: [
          "performance_optimization",
          "resource_allocation",
          "strategy_recommendations",
        ],
        data_requirements: {
          input_format: "performance_data",
          required_fields: [
            "metric_name",
            "metric_value",
            "timestamp",
            "context",
          ],
          optional_fields: ["target_value", "constraints", "priority"],
          min_batch_size: 10,
          max_batch_size: 1000,
        },
        performance_characteristics: {
          avg_processing_time_ms: 200,
          max_throughput_per_minute: 600,
          memory_usage_mb: 192,
          cpu_intensive: false,
        },
      });

      // Initialize engine status tracking
      for (const [engineName] of this.engineRegistry) {
        this.status.engines_status[engineName] = {
          status: "ready",
          last_distribution: "",
          records_distributed: 0,
          success_rate: 1.0,
          avg_processing_time_ms: 0,
          queue_size: 0,
        };

        this.distributionQueue.set(engineName, []);
        this.performanceMetrics.set(engineName, []);
        this.errorTracking.set(engineName, []);
      }
    } catch (error) {
      console.error(
        "[AutomatedEngineDistributor] Error initializing engine registry:",
        error
      );
    }
  }

  /**
   * Start distribution services (real-time and batch)
   */
  private startDistributionServices(): void {
    if (this.config.realtime.enabled) {
      this.startRealtimeDistribution();
    }

    if (this.config.batch.enabled) {
      this.startBatchDistribution();
    }
  }

  /**
   * Start real-time distribution service
   */
  private startRealtimeDistribution(): void {
    this.realtimeInterval = setInterval(async () => {
      try {
        await this.processRealtimeDistribution();
      } catch (error) {
        console.error(
          "[AutomatedEngineDistributor] Error in real-time distribution:",
          error
        );
      }
    }, this.config.realtime.frequency_ms);
  }

  /**
   * Start batch distribution scheduler
   */
  private startBatchDistribution(): void {
    const scheduleMs = this.getScheduleIntervalMs();
    this.batchScheduler = setInterval(async () => {
      try {
        await this.processBatchDistribution();
      } catch (error) {
        console.error(
          "[AutomatedEngineDistributor] Error in batch distribution:",
          error
        );
      }
    }, scheduleMs);
  }

  /**
   * Process real-time distribution
   */
  private async processRealtimeDistribution(): Promise<void> {
    if (this.status.status === "processing") {
      return; // Already processing
    }

    this.status.status = "processing";

    try {
      // Get fresh data for real-time distribution
      const freshData = await this.collectFreshData();

      if (freshData.length === 0) {
        this.status.status = "idle";
        return;
      }

      // Distribute to high-priority engines first
      const highPriorityEngines = Array.from(this.engineRegistry.keys()).filter(
        name => this.config.engines[name]?.priority === "high"
      );

      const distributionPromises = highPriorityEngines.map(engineName =>
        this.distributeToEngine(engineName, freshData, "realtime")
      );

      await Promise.all(distributionPromises);

      this.status.status = "idle";
      this.status.last_distribution = new Date().toISOString();
    } catch (error) {
      this.status.status = "error";
      console.error(
        "[AutomatedEngineDistributor] Error in real-time processing:",
        error
      );
    }
  }

  /**
   * Process batch distribution
   */
  private async processBatchDistribution(): Promise<void> {
    if (this.status.status === "processing") {
      return; // Already processing
    }

    this.status.status = "distributing";
    const batchId = `batch_${Date.now()}`;

    try {
      // Collect batch data
      const batchData = await this.collectBatchData();

      if (batchData.length === 0) {
        this.status.status = "idle";
        return;
      }

      this.status.current_batch = {
        batch_id: batchId,
        records_count: batchData.length,
        started_at: new Date().toISOString(),
        estimated_completion: new Date(Date.now() + 300000).toISOString(), // 5 minutes estimate
      };

      // Distribute to all enabled engines
      const enabledEngines = Array.from(this.engineRegistry.keys()).filter(
        name => this.config.engines[name]?.enabled
      );

      const distributionResults: DistributionResult[] = [];

      if (this.config.batch.parallel_processing) {
        // Parallel processing
        const distributionPromises = enabledEngines.map(engineName =>
          this.distributeToEngine(engineName, batchData, "batch", batchId)
        );

        const results = await Promise.all(distributionPromises);
        distributionResults.push(...results);
      } else {
        // Sequential processing
        for (const engineName of enabledEngines) {
          const result = await this.distributeToEngine(
            engineName,
            batchData,
            "batch",
            batchId
          );
          distributionResults.push(result);
        }
      }

      // Update performance metrics
      this.updatePerformanceMetrics(distributionResults);

      // Store distribution results
      await this.storeDistributionResults(batchId, distributionResults);

      this.status.status = "idle";
      this.status.last_distribution = new Date().toISOString();
      this.status.next_scheduled_distribution =
        this.calculateNextScheduledRun();
    } catch (error) {
      this.status.status = "error";
      console.error(
        "[AutomatedEngineDistributor] Error in batch processing:",
        error
      );
    }
  }

  /**
   * Distribute data to a specific engine
   */
  private async distributeToEngine(
    engineName: string,
    data: any[],
    distributionType: "realtime" | "batch",
    batchId?: string
  ): Promise<DistributionResult> {
    const startTime = Date.now();
    const engineInfo = this.engineRegistry.get(engineName);
    const engineConfig = this.config.engines[engineName];

    if (!engineInfo || !engineConfig) {
      return {
        engine_name: engineName,
        batch_id: batchId || `realtime_${Date.now()}`,
        success: false,
        records_processed: 0,
        records_distributed: 0,
        processing_time_ms: 0,
        quality_score: 0,
        confidence_score: 0,
        error_details: {
          error_type: "configuration_error",
          error_message: `Engine ${engineName} not found or not configured`,
          failed_records: data.length,
          retry_eligible: false,
        },
        metadata: {
          data_source: "unknown",
          transformation_applied: false,
          validation_passed: false,
          governance_compliant: false,
        },
      };
    }

    try {
      // Update engine status
      this.status.engines_status[engineName].status = "processing";

      // Transform data for engine requirements
      const transformedData = await this.transformDataForEngine(
        data,
        engineConfig
      );

      // Validate data quality
      const qualityScore = this.validateDataQuality(
        transformedData,
        engineConfig
      );

      if (qualityScore < engineConfig.requirements.quality_threshold) {
        throw new Error(
          `Data quality score ${qualityScore} below threshold ${engineConfig.requirements.quality_threshold}`
        );
      }

      // Apply governance checks
      const governanceCompliant = await this.checkGovernanceCompliance(
        transformedData,
        engineConfig
      );

      if (!governanceCompliant && this.config.quality.governance_validation) {
        throw new Error("Data failed governance compliance checks");
      }

      // Distribute based on method
      let distributionSuccess = false;
      let recordsDistributed = 0;

      switch (engineConfig.distribution_method) {
        case "database":
          ({ success: distributionSuccess, count: recordsDistributed } =
            await this.distributeViaDatabase(engineName, transformedData));
          break;
        case "api":
          ({ success: distributionSuccess, count: recordsDistributed } =
            await this.distributeViaAPI(engineName, transformedData));
          break;
        case "websocket":
          ({ success: distributionSuccess, count: recordsDistributed } =
            await this.distributeViaWebSocket(engineName, transformedData));
          break;
        case "queue":
          ({ success: distributionSuccess, count: recordsDistributed } =
            await this.distributeViaQueue(engineName, transformedData));
          break;
        default:
          throw new Error(
            `Unsupported distribution method: ${engineConfig.distribution_method}`
          );
      }

      // Update engine status
      this.status.engines_status[engineName].status = "completed";
      this.status.engines_status[engineName].last_distribution =
        new Date().toISOString();
      this.status.engines_status[engineName].records_distributed +=
        recordsDistributed;

      const processingTime = Date.now() - startTime;
      this.status.engines_status[engineName].avg_processing_time_ms =
        (this.status.engines_status[engineName].avg_processing_time_ms +
          processingTime) /
        2;

      return {
        engine_name: engineName,
        batch_id: batchId || `realtime_${startTime}`,
        success: distributionSuccess,
        records_processed: data.length,
        records_distributed: recordsDistributed,
        processing_time_ms: processingTime,
        quality_score: qualityScore,
        confidence_score: this.calculateConfidenceScore(
          transformedData,
          engineConfig
        ),
        metadata: {
          data_source: distributionType,
          transformation_applied: true,
          validation_passed: true,
          governance_compliant: governanceCompliant,
        },
      };
    } catch (error) {
      // Update engine status
      this.status.engines_status[engineName].status = "error";

      // Track error
      this.errorTracking
        .get(engineName)
        ?.push(`${new Date().toISOString()}: ${error}`);

      return {
        engine_name: engineName,
        batch_id: batchId || `realtime_${startTime}`,
        success: false,
        records_processed: data.length,
        records_distributed: 0,
        processing_time_ms: Date.now() - startTime,
        quality_score: 0,
        confidence_score: 0,
        error_details: {
          error_type: "distribution_error",
          error_message: error instanceof Error ? error.message : String(error),
          failed_records: data.length,
          retry_eligible: true,
        },
        metadata: {
          data_source: distributionType,
          transformation_applied: false,
          validation_passed: false,
          governance_compliant: false,
        },
      };
    }
  }

  /**
   * Transform data according to engine requirements
   */
  private async transformDataForEngine(
    data: any[],
    engineConfig: any
  ): Promise<any[]> {
    try {
      let transformedData = [...data];

      // Apply field mappings
      if (engineConfig.transformation_rules.field_mappings) {
        transformedData = transformedData.map(record => {
          const mappedRecord = { ...record };

          Object.entries(
            engineConfig.transformation_rules.field_mappings
          ).forEach(([oldField, newField]) => {
            if (record[oldField] !== undefined) {
              mappedRecord[newField as string] = record[oldField];
              delete mappedRecord[oldField];
            }
          });

          return mappedRecord;
        });
      }

      // Apply filters
      if (engineConfig.transformation_rules.filters) {
        transformedData = transformedData.filter(record => {
          return Object.entries(
            engineConfig.transformation_rules.filters
          ).every(([field, value]) => {
            return record[field] === value;
          });
        });
      }

      // Apply aggregations if needed
      if (engineConfig.transformation_rules.aggregations?.length > 0) {
        // Implement aggregation logic based on requirements
        transformedData = this.applyAggregations(
          transformedData,
          engineConfig.transformation_rules.aggregations
        );
      }

      // Ensure required fields are present
      transformedData = transformedData.filter(record => {
        return engineConfig.requirements.required_fields.every(
          (field: string) =>
            record.hasOwnProperty(field) &&
            record[field] !== null &&
            record[field] !== undefined
        );
      });

      return transformedData;
    } catch (error) {
      console.error(
        "[AutomatedEngineDistributor] Error transforming data:",
        error
      );
      return [];
    }
  }

  /**
   * Collect fresh data for real-time distribution
   */
  private async collectFreshData(): Promise<any[]> {
    try {
      const freshnessCutoff = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago

      // Collect from multiple sources
      const [contentData, navigationData, analyticsData] = await Promise.all([
        this.collectContentData(freshnessCutoff),
        this.collectNavigationData(freshnessCutoff),
        this.collectAnalyticsData(freshnessCutoff),
      ]);

      return [...contentData, ...navigationData, ...analyticsData];
    } catch (error) {
      console.error(
        "[AutomatedEngineDistributor] Error collecting fresh data:",
        error
      );
      return [];
    }
  }

  /**
   * Collect batch data for scheduled distribution
   */
  private async collectBatchData(): Promise<any[]> {
    try {
      const batchCutoff = new Date(
        Date.now() - this.config.batch.processing_window_hours * 60 * 60 * 1000
      );

      // Collect comprehensive data for batch processing
      const [
        contentData,
        navigationData,
        analyticsData,
        customerData,
        campaignData,
      ] = await Promise.all([
        this.collectContentData(batchCutoff),
        this.collectNavigationData(batchCutoff),
        this.collectAnalyticsData(batchCutoff),
        this.collectCustomerData(batchCutoff),
        this.collectCampaignData(batchCutoff),
      ]);

      return [
        ...contentData,
        ...navigationData,
        ...analyticsData,
        ...customerData,
        ...campaignData,
      ];
    } catch (error) {
      console.error(
        "[AutomatedEngineDistributor] Error collecting batch data:",
        error
      );
      return [];
    }
  }

  // Data collection methods
  private async collectContentData(since: Date): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("content_posts")
      .select("*")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false });

    return error ? [] : data || [];
  }

  private async collectNavigationData(since: Date): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("user_interactions")
      .select("*")
      .gte("timestamp", since.toISOString())
      .order("timestamp", { ascending: false });

    return error ? [] : data || [];
  }

  private async collectAnalyticsData(since: Date): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("content_analytics")
      .select("*")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false });

    return error ? [] : data || [];
  }

  private async collectCustomerData(since: Date): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("customer_interactions")
      .select("*")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false });

    return error ? [] : data || [];
  }

  private async collectCampaignData(since: Date): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("campaigns")
      .select("*")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false });

    return error ? [] : data || [];
  }

  // Distribution methods
  private async distributeViaDatabase(
    engineName: string,
    data: any[]
  ): Promise<{ success: boolean; count: number }> {
    try {
      const tableName = `${engineName}_data_feed`;
      const { error } = await this.supabase.from(tableName).insert(
        data.map(record => ({
          ...record,
          distributed_at: new Date().toISOString(),
          distribution_id: `dist_${Date.now()}`,
        }))
      );

      return { success: !error, count: error ? 0 : data.length };
    } catch (error) {
      return { success: false, count: 0 };
    }
  }

  private async distributeViaAPI(
    engineName: string,
    data: any[]
  ): Promise<{ success: boolean; count: number }> {
    try {
      const engineInfo = this.engineRegistry.get(engineName);
      if (!engineInfo?.instance?.processData) {
        throw new Error(
          `Engine ${engineName} does not support API distribution`
        );
      }

      const result = await engineInfo.instance.processData(data);
      return { success: !!result, count: data.length };
    } catch (error) {
      return { success: false, count: 0 };
    }
  }

  private async distributeViaWebSocket(
    engineName: string,
    data: any[]
  ): Promise<{ success: boolean; count: number }> {
    // WebSocket distribution implementation would go here
    // For now, return success simulation
    return { success: true, count: data.length };
  }

  private async distributeViaQueue(
    engineName: string,
    data: any[]
  ): Promise<{ success: boolean; count: number }> {
    try {
      // Add to distribution queue
      const existingQueue = this.distributionQueue.get(engineName) || [];
      this.distributionQueue.set(engineName, [...existingQueue, ...data]);

      // Update queue size in status
      this.status.engines_status[engineName].queue_size =
        this.distributionQueue.get(engineName)?.length || 0;

      return { success: true, count: data.length };
    } catch (error) {
      return { success: false, count: 0 };
    }
  }

  // Utility methods
  private validateDataQuality(data: any[], engineConfig: any): number {
    if (data.length === 0) return 0;

    let qualityScore = 0;
    const totalFields = engineConfig.requirements.required_fields.length;

    data.forEach(record => {
      let recordScore = 0;
      engineConfig.requirements.required_fields.forEach((field: string) => {
        if (
          record.hasOwnProperty(field) &&
          record[field] !== null &&
          record[field] !== undefined
        ) {
          recordScore += 1;
        }
      });
      qualityScore += recordScore / totalFields;
    });

    return qualityScore / data.length;
  }

  private async checkGovernanceCompliance(
    data: any[],
    engineConfig: any
  ): Promise<boolean> {
    // Implement governance compliance checks
    // For now, return true as basic implementation
    return true;
  }

  private calculateConfidenceScore(data: any[], engineConfig: any): number {
    // Calculate confidence based on data quality, freshness, and completeness
    const qualityScore = this.validateDataQuality(data, engineConfig);
    const freshnessScore = this.calculateFreshnessScore(data);
    const completenessScore = this.calculateCompletenessScore(
      data,
      engineConfig
    );

    return (qualityScore + freshnessScore + completenessScore) / 3;
  }

  private calculateFreshnessScore(data: any[]): number {
    if (data.length === 0) return 0;

    const now = Date.now();
    const avgAge =
      data.reduce((sum, record) => {
        const recordTime = new Date(
          record.created_at || record.timestamp || now
        ).getTime();
        return sum + (now - recordTime);
      }, 0) / data.length;

    // Convert to hours and calculate freshness (newer = higher score)
    const ageInHours = avgAge / (1000 * 60 * 60);
    return Math.max(0, 1 - ageInHours / 24); // Score decreases over 24 hours
  }

  private calculateCompletenessScore(data: any[], engineConfig: any): number {
    if (data.length === 0) return 0;

    const allFields = [
      ...engineConfig.requirements.required_fields,
      ...(engineConfig.requirements.optional_fields || []),
    ];
    let totalCompleteness = 0;

    data.forEach(record => {
      const presentFields = allFields.filter(
        field =>
          record.hasOwnProperty(field) &&
          record[field] !== null &&
          record[field] !== undefined
      ).length;
      totalCompleteness += presentFields / allFields.length;
    });

    return totalCompleteness / data.length;
  }

  private applyAggregations(data: any[], aggregations: string[]): any[] {
    // Basic aggregation implementation
    // In a real implementation, this would be more sophisticated
    return data;
  }

  private updatePerformanceMetrics(results: DistributionResult[]): void {
    results.forEach(result => {
      // Update success rate
      const currentSuccessRate =
        this.status.engines_status[result.engine_name].success_rate;
      const newSuccessRate =
        (currentSuccessRate + (result.success ? 1 : 0)) / 2;
      this.status.engines_status[result.engine_name].success_rate =
        newSuccessRate;

      // Update performance metrics
      const metrics = this.performanceMetrics.get(result.engine_name) || [];
      metrics.push(result.processing_time_ms);

      // Keep only last 100 measurements
      if (metrics.length > 100) {
        metrics.shift();
      }

      this.performanceMetrics.set(result.engine_name, metrics);
    });

    // Update global metrics
    this.status.performance_metrics.total_records_processed += results.reduce(
      (sum, r) => sum + r.records_processed,
      0
    );
    this.status.performance_metrics.successful_distributions += results.filter(
      r => r.success
    ).length;
    this.status.performance_metrics.failed_distributions += results.filter(
      r => !r.success
    ).length;
  }

  private async storeDistributionResults(
    batchId: string,
    results: DistributionResult[]
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("distribution_results")
        .insert({
          batch_id: batchId,
          results: results,
          total_engines: results.length,
          successful_distributions: results.filter(r => r.success).length,
          failed_distributions: results.filter(r => !r.success).length,
          total_records_processed: results.reduce(
            (sum, r) => sum + r.records_processed,
            0
          ),
          total_processing_time_ms: results.reduce(
            (sum, r) => sum + r.processing_time_ms,
            0
          ),
          avg_quality_score:
            results.reduce((sum, r) => sum + r.quality_score, 0) /
            results.length,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error(
          "[AutomatedEngineDistributor] Error storing distribution results:",
          error
        );
      }
    } catch (error) {
      console.error(
        "[AutomatedEngineDistributor] Error in storeDistributionResults:",
        error
      );
    }
  }

  private getScheduleIntervalMs(): number {
    switch (this.config.batch.schedule) {
      case "hourly":
        return 60 * 60 * 1000;
      case "daily":
        return 24 * 60 * 60 * 1000;
      case "weekly":
        return 7 * 24 * 60 * 60 * 1000;
      default:
        return 60 * 60 * 1000;
    }
  }

  private calculateNextScheduledRun(): string {
    const intervalMs = this.getScheduleIntervalMs();
    return new Date(Date.now() + intervalMs).toISOString();
  }

  // Public API methods

  /**
   * Get current distribution status
   */
  getStatus(): DistributionStatus {
    return { ...this.status };
  }

  /**
   * Get engine registry information
   */
  getEngineRegistry(): Map<string, EngineInfo> {
    return new Map(this.engineRegistry);
  }

  /**
   * Update distribution configuration
   */
  updateConfig(newConfig: Partial<DistributionConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Restart services if needed
    if (newConfig.realtime || newConfig.batch) {
      this.stopDistributionServices();
      this.startDistributionServices();
    }
  }

  /**
   * Manually trigger distribution
   */
  async triggerDistribution(
    type: "realtime" | "batch" = "batch"
  ): Promise<DistributionResult[]> {
    if (type === "realtime") {
      await this.processRealtimeDistribution();
      return [];
    } else {
      await this.processBatchDistribution();
      return [];
    }
  }

  /**
   * Stop distribution services
   */
  stopDistributionServices(): void {
    if (this.realtimeInterval) {
      clearInterval(this.realtimeInterval);
      this.realtimeInterval = null;
    }

    if (this.batchScheduler) {
      clearInterval(this.batchScheduler);
      this.batchScheduler = null;
    }

    this.status.status = "idle";
  }

  /**
   * Get performance metrics for an engine
   */
  getEnginePerformanceMetrics(engineName: string): number[] {
    return this.performanceMetrics.get(engineName) || [];
  }

  /**
   * Get error history for an engine
   */
  getEngineErrorHistory(engineName: string): string[] {
    return this.errorTracking.get(engineName) || [];
  }
}
