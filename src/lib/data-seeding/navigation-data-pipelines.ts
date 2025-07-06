/**
 * Navigation & UX Data Seeding Pipelines
 * Task 74.2: Ontwerp data seeding pipelines en mapping naar n8n workflows
 *
 * Complete pipeline architectuur voor:
 * 1. User behavior data collection en processing
 * 2. Performance metrics aggregation
 * 3. A/B testing data analysis
 * 4. Real-time navigation optimization
 * 5. n8n workflow integration
 */

import { ModuleConfiguration } from "./modular-scaling-architecture";

export interface NavigationDataPipeline {
  pipelineId: string;
  pipelineName: string;
  description: string;
  inputSources: DataSource[];
  processingSteps: ProcessingStep[];
  outputTargets: OutputTarget[];
  n8nWorkflowMapping: N8nWorkflowMapping;
  schedulingConfig: SchedulingConfig;
  qualityControls: QualityControl[];
  scalingConfiguration: ScalingConfig;
  monitoringConfig: MonitoringConfig;
  costOptimization: CostOptimization;
}

export interface DataSource {
  sourceId: string;
  sourceName: string;
  sourceType: "real_time" | "batch" | "api" | "database" | "file";
  connectionConfig: Record<string, any>;
  dataFormat: "json" | "csv" | "xml" | "avro" | "parquet";
  updateFrequency: string;
  retentionPeriod: number;
  accessCredentials?: string;
  rateLimits?: {
    requests_per_second: number;
    daily_limit: number;
  };
}

export interface ProcessingStep {
  stepId: string;
  stepName: string;
  stepType: "transform" | "validate" | "enrich" | "aggregate" | "filter";
  processingLogic: string;
  dependencies: string[];
  errorHandling: ErrorHandling;
  performance: {
    max_processing_time_ms: number;
    memory_limit_mb: number;
    cpu_cores: number;
  };
}

export interface OutputTarget {
  targetId: string;
  targetName: string;
  targetType: "database" | "api" | "file" | "stream" | "cache";
  connectionConfig: Record<string, any>;
  dataFormat: string;
  deliveryMethod: "push" | "pull" | "webhook";
  compressionEnabled: boolean;
}

export interface N8nWorkflowMapping {
  workflowId: string;
  workflowName: string;
  triggerType: "webhook" | "cron" | "manual" | "event";
  triggerConfig: Record<string, any>;
  nodeConfiguration: N8nNode[];
  errorWorkflow?: string;
  monitoringWebhook?: string;
}

export interface N8nNode {
  nodeId: string;
  nodeType: string;
  nodeName: string;
  parameters: Record<string, any>;
  position: { x: number; y: number };
  connections: string[];
}

export interface SchedulingConfig {
  executionType: "real_time" | "scheduled" | "event_driven";
  cronExpression?: string;
  retryPolicy: {
    max_retries: number;
    retry_delay_ms: number;
    exponential_backoff: boolean;
  };
  executionTimeout: number;
  concurrencyLimit: number;
}

export interface QualityControl {
  controlId: string;
  controlName: string;
  validationType: "schema" | "business_rule" | "data_quality" | "completeness";
  validationLogic: string;
  thresholds: {
    warning_threshold: number;
    error_threshold: number;
  };
  actionOnFailure: "stop" | "warn" | "quarantine" | "fix";
}

export interface ScalingConfig {
  minInstances: number;
  maxInstances: number;
  scaleUpTrigger: {
    metric: string;
    threshold: number;
  };
  scaleDownTrigger: {
    metric: string;
    threshold: number;
  };
  autoScalingEnabled: boolean;
}

export interface MonitoringConfig {
  metricsCollection: string[];
  alertingRules: AlertingRule[];
  dashboardConfig: string;
  logLevel: "debug" | "info" | "warn" | "error";
}

export interface AlertingRule {
  ruleName: string;
  condition: string;
  severity: "low" | "medium" | "high" | "critical";
  notificationChannels: string[];
}

export interface CostOptimization {
  budgetLimit: number;
  costAlerts: CostAlert[];
  optimizationStrategies: string[];
  resourceSharing: boolean;
}

export interface CostAlert {
  threshold: number;
  period: string;
  action: string;
}

export interface ErrorHandling {
  errorTypes: string[];
  retryStrategies: Record<string, any>;
  fallbackActions: string[];
  notificationConfig: Record<string, any>;
}

/**
 * USER BEHAVIOR DATA PIPELINE
 * Real-time collection en processing van user interaction data
 */
export const USER_BEHAVIOR_PIPELINE: NavigationDataPipeline = {
  pipelineId: "nav_pipeline_001",
  pipelineName: "User Behavior Data Pipeline",
  description:
    "Real-time collection en verwerking van user clicks, scrolls, navigation patterns en session data voor Navigation ML Engine",

  inputSources: [
    {
      sourceId: "src_001",
      sourceName: "Frontend Analytics Events",
      sourceType: "real_time",
      connectionConfig: {
        endpoint: "/api/analytics/events",
        authentication: "bearer_token",
        bufferSize: 1000,
        batchTimeout: 5000,
      },
      dataFormat: "json",
      updateFrequency: "real-time",
      retentionPeriod: 90,
      rateLimits: {
        requests_per_second: 1000,
        daily_limit: 10000000,
      },
    },
    {
      sourceId: "src_002",
      sourceName: "Session Recording Data",
      sourceType: "batch",
      connectionConfig: {
        bucketName: "session-recordings",
        region: "eu-west-1",
        compressionType: "gzip",
      },
      dataFormat: "json",
      updateFrequency: "hourly",
      retentionPeriod: 30,
    },
    {
      sourceId: "src_003",
      sourceName: "Supabase User Events",
      sourceType: "database",
      connectionConfig: {
        connectionString: "postgresql://supabase_url",
        table: "user_events",
        incrementalColumn: "created_at",
      },
      dataFormat: "json",
      updateFrequency: "real-time",
      retentionPeriod: 365,
    },
  ],

  processingSteps: [
    {
      stepId: "step_001",
      stepName: "Event Validation & Enrichment",
      stepType: "validate",
      processingLogic: `
        Valideer incoming events voor:
        - Required fields (user_id, event_type, timestamp)
        - Data types en formats
        - Enrich met device/browser info
        - Add geolocation data
        - Calculate session context
      `,
      dependencies: [],
      errorHandling: {
        errorTypes: ["validation_error", "missing_fields", "invalid_format"],
        retryStrategies: {
          validation_error: "quarantine_with_notification",
          missing_fields: "attempt_field_inference",
          invalid_format: "transform_or_discard",
        },
        fallbackActions: ["log_error", "send_to_dead_letter_queue"],
        notificationConfig: {
          slack_webhook: "webhook_url",
          email_alerts: ["dev-team@company.com"],
        },
      },
      performance: {
        max_processing_time_ms: 100,
        memory_limit_mb: 256,
        cpu_cores: 2,
      },
    },
    {
      stepId: "step_002",
      stepName: "User Journey Reconstruction",
      stepType: "aggregate",
      processingLogic: `
        Bouw complete user journeys:
        - Groepeer events per session
        - Construct navigation paths
        - Identify conversion funnels
        - Calculate engagement metrics
        - Detect behavioral patterns
      `,
      dependencies: ["step_001"],
      errorHandling: {
        errorTypes: ["incomplete_journey", "session_timeout", "data_gaps"],
        retryStrategies: {
          incomplete_journey: "merge_with_historical_data",
          session_timeout: "mark_as_partial_journey",
          data_gaps: "interpolate_missing_events",
        },
        fallbackActions: ["use_partial_data", "flag_for_manual_review"],
        notificationConfig: {
          dashboard_alert: true,
          severity_threshold: "medium",
        },
      },
      performance: {
        max_processing_time_ms: 500,
        memory_limit_mb: 512,
        cpu_cores: 4,
      },
    },
    {
      stepId: "step_003",
      stepName: "Behavioral Pattern Analysis",
      stepType: "transform",
      processingLogic: `
        Analyseer behavioral patterns:
        - Cluster similar user behaviors
        - Identify navigation preferences
        - Calculate engagement scores
        - Detect anomalous behaviors
        - Generate insights for ML training
      `,
      dependencies: ["step_002"],
      errorHandling: {
        errorTypes: [
          "clustering_failure",
          "insufficient_data",
          "anomaly_detection_error",
        ],
        retryStrategies: {
          clustering_failure: "use_fallback_algorithm",
          insufficient_data: "extend_time_window",
          anomaly_detection_error: "disable_anomaly_detection",
        },
        fallbackActions: [
          "use_rule_based_analysis",
          "generate_synthetic_patterns",
        ],
        notificationConfig: {
          ml_team_notification: true,
          include_data_sample: true,
        },
      },
      performance: {
        max_processing_time_ms: 2000,
        memory_limit_mb: 1024,
        cpu_cores: 8,
      },
    },
  ],

  outputTargets: [
    {
      targetId: "tgt_001",
      targetName: "Navigation ML Training Dataset",
      targetType: "database",
      connectionConfig: {
        connectionString: "postgresql://supabase_url",
        table: "navigation_training_data",
        upsertKey: "user_session_id",
      },
      dataFormat: "json",
      deliveryMethod: "push",
      compressionEnabled: true,
    },
    {
      targetId: "tgt_002",
      targetName: "Real-time Recommendation Engine",
      targetType: "api",
      connectionConfig: {
        endpoint: "/api/recommendations/update",
        authentication: "api_key",
        timeout: 5000,
      },
      dataFormat: "json",
      deliveryMethod: "push",
      compressionEnabled: false,
    },
    {
      targetId: "tgt_003",
      targetName: "Analytics Dashboard Cache",
      targetType: "cache",
      connectionConfig: {
        redis_url: "redis://localhost:6379",
        key_prefix: "nav_analytics:",
        ttl: 3600,
      },
      dataFormat: "json",
      deliveryMethod: "push",
      compressionEnabled: false,
    },
  ],

  n8nWorkflowMapping: {
    workflowId: "wf_nav_001",
    workflowName: "User Behavior Data Processing",
    triggerType: "webhook",
    triggerConfig: {
      path: "/webhook/user-behavior",
      method: "POST",
      authentication: "header_auth",
    },
    nodeConfiguration: [
      {
        nodeId: "node_001",
        nodeType: "Webhook",
        nodeName: "Receive User Events",
        parameters: {
          path: "/user-events",
          httpMethod: "POST",
          responseMode: "responseNode",
        },
        position: { x: 100, y: 100 },
        connections: ["node_002"],
      },
      {
        nodeId: "node_002",
        nodeType: "Function",
        nodeName: "Validate & Enrich Events",
        parameters: {
          functionCode: `
            // Event validation and enrichment logic
            const events = items.map(item => {
              const data = item.json;
              
              // Validate required fields
              if (!data.user_id || !data.event_type || !data.timestamp) {
                throw new Error('Missing required fields');
              }
              
              // Enrich with metadata
              data.processed_at = new Date().toISOString();
              data.pipeline_version = '1.0.0';
              
              return { json: data };
            });
            
            return events;
          `,
        },
        position: { x: 300, y: 100 },
        connections: ["node_003"],
      },
      {
        nodeId: "node_003",
        nodeType: "Supabase",
        nodeName: "Store in Database",
        parameters: {
          operation: "insert",
          table: "user_events_processed",
          columns: ["user_id", "event_type", "timestamp", "metadata"],
        },
        position: { x: 500, y: 100 },
        connections: ["node_004"],
      },
      {
        nodeId: "node_004",
        nodeType: "HTTP Request",
        nodeName: "Trigger ML Pipeline",
        parameters: {
          requestMethod: "POST",
          url: "/api/ml/navigation/trigger",
          sendHeaders: true,
          headerParameters: {
            "Content-Type": "application/json",
            Authorization: "Bearer {{$env.ML_API_TOKEN}}",
          },
        },
        position: { x: 700, y: 100 },
        connections: [],
      },
    ],
    errorWorkflow: "wf_nav_error_handler",
    monitoringWebhook: "/webhook/pipeline-monitor",
  },

  schedulingConfig: {
    executionType: "real_time",
    retryPolicy: {
      max_retries: 3,
      retry_delay_ms: 1000,
      exponential_backoff: true,
    },
    executionTimeout: 30000,
    concurrencyLimit: 10,
  },

  qualityControls: [
    {
      controlId: "qc_001",
      controlName: "Event Schema Validation",
      validationType: "schema",
      validationLogic: "JSON Schema validation voor incoming events",
      thresholds: {
        warning_threshold: 95,
        error_threshold: 90,
      },
      actionOnFailure: "quarantine",
    },
    {
      controlId: "qc_002",
      controlName: "Data Completeness Check",
      validationType: "completeness",
      validationLogic: "Check voor missing required fields",
      thresholds: {
        warning_threshold: 98,
        error_threshold: 95,
      },
      actionOnFailure: "warn",
    },
    {
      controlId: "qc_003",
      controlName: "Business Rule Validation",
      validationType: "business_rule",
      validationLogic: "Validate business logic constraints",
      thresholds: {
        warning_threshold: 99,
        error_threshold: 97,
      },
      actionOnFailure: "fix",
    },
  ],

  scalingConfiguration: {
    minInstances: 2,
    maxInstances: 10,
    scaleUpTrigger: {
      metric: "cpu_utilization",
      threshold: 70,
    },
    scaleDownTrigger: {
      metric: "cpu_utilization",
      threshold: 30,
    },
    autoScalingEnabled: true,
  },

  monitoringConfig: {
    metricsCollection: [
      "events_processed_per_second",
      "processing_latency_ms",
      "error_rate_percentage",
      "data_quality_score",
      "pipeline_throughput",
    ],
    alertingRules: [
      {
        ruleName: "High Error Rate",
        condition: "error_rate_percentage > 5",
        severity: "high",
        notificationChannels: ["slack", "email"],
      },
      {
        ruleName: "Processing Latency High",
        condition: "processing_latency_ms > 1000",
        severity: "medium",
        notificationChannels: ["slack"],
      },
      {
        ruleName: "Data Quality Degradation",
        condition: "data_quality_score < 90",
        severity: "high",
        notificationChannels: ["slack", "email", "pagerduty"],
      },
    ],
    dashboardConfig: "navigation_user_behavior_dashboard",
    logLevel: "info",
  },

  costOptimization: {
    budgetLimit: 200,
    costAlerts: [
      {
        threshold: 150,
        period: "monthly",
        action: "email_notification",
      },
      {
        threshold: 180,
        period: "monthly",
        action: "reduce_processing_frequency",
      },
    ],
    optimizationStrategies: [
      "Use spot instances for batch processing",
      "Implement data compression",
      "Cache frequently accessed data",
      "Optimize query patterns",
    ],
    resourceSharing: true,
  },
};

/**
 * PERFORMANCE METRICS PIPELINE
 * Real-time collection van website performance data
 */
export const PERFORMANCE_METRICS_PIPELINE: NavigationDataPipeline = {
  pipelineId: "nav_pipeline_002",
  pipelineName: "Performance Metrics Pipeline",
  description:
    "Real-time collection en analyse van Core Web Vitals, loading times en performance metrics voor navigation optimization",

  inputSources: [
    {
      sourceId: "perf_001",
      sourceName: "Core Web Vitals",
      sourceType: "real_time",
      connectionConfig: {
        endpoint: "/api/performance/vitals",
        batchSize: 100,
        flushInterval: 1000,
      },
      dataFormat: "json",
      updateFrequency: "real-time",
      retentionPeriod: 90,
    },
    {
      sourceId: "perf_002",
      sourceName: "Navigation Timing API",
      sourceType: "real_time",
      connectionConfig: {
        endpoint: "/api/performance/navigation",
        includeResourceTiming: true,
      },
      dataFormat: "json",
      updateFrequency: "real-time",
      retentionPeriod: 90,
    },
    {
      sourceId: "perf_003",
      sourceName: "Custom Performance Marks",
      sourceType: "real_time",
      connectionConfig: {
        endpoint: "/api/performance/custom",
        allowCustomMetrics: true,
      },
      dataFormat: "json",
      updateFrequency: "real-time",
      retentionPeriod: 180,
    },
  ],

  processingSteps: [
    {
      stepId: "perf_step_001",
      stepName: "Performance Data Aggregation",
      stepType: "aggregate",
      processingLogic: `
        Aggregeer performance metrics:
        - Calculate P50, P90, P95 percentiles
        - Group by page, device, browser
        - Identify performance bottlenecks
        - Generate performance scores
      `,
      dependencies: [],
      errorHandling: {
        errorTypes: [
          "invalid_timing_data",
          "negative_values",
          "extreme_outliers",
        ],
        retryStrategies: {
          invalid_timing_data: "discard_invalid_entries",
          negative_values: "set_to_zero_with_flag",
          extreme_outliers: "cap_at_reasonable_maximum",
        },
        fallbackActions: [
          "use_approximate_values",
          "generate_performance_estimate",
        ],
        notificationConfig: {
          performance_team_alert: true,
        },
      },
      performance: {
        max_processing_time_ms: 200,
        memory_limit_mb: 512,
        cpu_cores: 4,
      },
    },
    {
      stepId: "perf_step_002",
      stepName: "Performance Trend Analysis",
      stepType: "transform",
      processingLogic: `
        Analyseer performance trends:
        - Detect performance regressions
        - Identify improvement opportunities
        - Calculate impact scores
        - Generate optimization recommendations
      `,
      dependencies: ["perf_step_001"],
      errorHandling: {
        errorTypes: ["insufficient_historical_data", "trend_calculation_error"],
        retryStrategies: {
          insufficient_historical_data: "extend_analysis_window",
          trend_calculation_error: "use_simple_moving_average",
        },
        fallbackActions: ["provide_basic_metrics_only"],
        notificationConfig: {
          dev_team_notification: true,
        },
      },
      performance: {
        max_processing_time_ms: 1000,
        memory_limit_mb: 768,
        cpu_cores: 6,
      },
    },
  ],

  outputTargets: [
    {
      targetId: "perf_tgt_001",
      targetName: "Performance Analytics DB",
      targetType: "database",
      connectionConfig: {
        connectionString: "postgresql://supabase_url",
        table: "performance_metrics",
        partitionBy: "date",
      },
      dataFormat: "json",
      deliveryMethod: "push",
      compressionEnabled: true,
    },
    {
      targetId: "perf_tgt_002",
      targetName: "Real-time Performance Dashboard",
      targetType: "stream",
      connectionConfig: {
        streamName: "performance-metrics-stream",
        region: "eu-west-1",
      },
      dataFormat: "json",
      deliveryMethod: "push",
      compressionEnabled: false,
    },
  ],

  n8nWorkflowMapping: {
    workflowId: "wf_perf_001",
    workflowName: "Performance Metrics Processing",
    triggerType: "webhook",
    triggerConfig: {
      path: "/webhook/performance-metrics",
      method: "POST",
    },
    nodeConfiguration: [
      {
        nodeId: "perf_node_001",
        nodeType: "Webhook",
        nodeName: "Receive Performance Data",
        parameters: {
          path: "/performance-data",
          httpMethod: "POST",
        },
        position: { x: 100, y: 200 },
        connections: ["perf_node_002"],
      },
      {
        nodeId: "perf_node_002",
        nodeType: "Function",
        nodeName: "Calculate Performance Scores",
        parameters: {
          functionCode: `
            // Performance scoring logic
            const processedMetrics = items.map(item => {
              const data = item.json;
              
              // Calculate performance score
              const lcp = data.largestContentfulPaint || 0;
              const fid = data.firstInputDelay || 0;
              const cls = data.cumulativeLayoutShift || 0;
              
              let score = 100;
              if (lcp > 2500) score -= 30;
              else if (lcp > 4000) score -= 50;
              
              if (fid > 100) score -= 20;
              else if (fid > 300) score -= 40;
              
              if (cls > 0.1) score -= 25;
              else if (cls > 0.25) score -= 45;
              
              data.performanceScore = Math.max(0, score);
              data.performanceGrade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : 'D';
              
              return { json: data };
            });
            
            return processedMetrics;
          `,
        },
        position: { x: 300, y: 200 },
        connections: ["perf_node_003"],
      },
      {
        nodeId: "perf_node_003",
        nodeType: "Supabase",
        nodeName: "Store Performance Data",
        parameters: {
          operation: "insert",
          table: "performance_metrics",
          columns: [
            "page_url",
            "performance_score",
            "core_web_vitals",
            "timestamp",
          ],
        },
        position: { x: 500, y: 200 },
        connections: [],
      },
    ],
  },

  schedulingConfig: {
    executionType: "real_time",
    retryPolicy: {
      max_retries: 2,
      retry_delay_ms: 500,
      exponential_backoff: true,
    },
    executionTimeout: 15000,
    concurrencyLimit: 15,
  },

  qualityControls: [
    {
      controlId: "perf_qc_001",
      controlName: "Performance Data Validation",
      validationType: "data_quality",
      validationLogic:
        "Validate performance timing values are within reasonable ranges",
      thresholds: {
        warning_threshold: 95,
        error_threshold: 90,
      },
      actionOnFailure: "warn",
    },
  ],

  scalingConfiguration: {
    minInstances: 1,
    maxInstances: 5,
    scaleUpTrigger: {
      metric: "requests_per_second",
      threshold: 100,
    },
    scaleDownTrigger: {
      metric: "requests_per_second",
      threshold: 20,
    },
    autoScalingEnabled: true,
  },

  monitoringConfig: {
    metricsCollection: [
      "performance_events_per_second",
      "processing_latency",
      "data_quality_score",
    ],
    alertingRules: [
      {
        ruleName: "Performance Data Quality Issue",
        condition: "data_quality_score < 85",
        severity: "medium",
        notificationChannels: ["slack"],
      },
    ],
    dashboardConfig: "performance_metrics_dashboard",
    logLevel: "info",
  },

  costOptimization: {
    budgetLimit: 100,
    costAlerts: [
      {
        threshold: 75,
        period: "monthly",
        action: "email_notification",
      },
    ],
    optimizationStrategies: [
      "Batch small performance events",
      "Use efficient data compression",
      "Implement intelligent sampling",
    ],
    resourceSharing: true,
  },
};

/**
 * A/B TESTING DATA PIPELINE
 * Processing van experiment data en statistical analysis
 */
export const AB_TESTING_PIPELINE: NavigationDataPipeline = {
  pipelineId: "nav_pipeline_003",
  pipelineName: "A/B Testing Data Pipeline",
  description:
    "Processing van experiment data, statistical analysis en automated decision making voor navigation optimizations",

  inputSources: [
    {
      sourceId: "ab_001",
      sourceName: "Experiment Assignment Events",
      sourceType: "real_time",
      connectionConfig: {
        endpoint: "/api/experiments/assignments",
        includeVariantMetadata: true,
      },
      dataFormat: "json",
      updateFrequency: "real-time",
      retentionPeriod: 365,
    },
    {
      sourceId: "ab_002",
      sourceName: "Conversion Events",
      sourceType: "real_time",
      connectionConfig: {
        endpoint: "/api/experiments/conversions",
        trackMultipleGoals: true,
      },
      dataFormat: "json",
      updateFrequency: "real-time",
      retentionPeriod: 365,
    },
    {
      sourceId: "ab_003",
      sourceName: "User Engagement Metrics",
      sourceType: "batch",
      connectionConfig: {
        sourceTable: "user_engagement_metrics",
        incrementalField: "updated_at",
      },
      dataFormat: "json",
      updateFrequency: "hourly",
      retentionPeriod: 180,
    },
  ],

  processingSteps: [
    {
      stepId: "ab_step_001",
      stepName: "Experiment Data Validation",
      stepType: "validate",
      processingLogic: `
        Valideer experiment data:
        - Check experiment ID validity
        - Validate user assignment
        - Verify conversion attribution
        - Check for data completeness
      `,
      dependencies: [],
      errorHandling: {
        errorTypes: [
          "invalid_experiment_id",
          "duplicate_assignment",
          "late_conversion",
        ],
        retryStrategies: {
          invalid_experiment_id: "lookup_experiment_mapping",
          duplicate_assignment: "use_first_assignment",
          late_conversion: "attribute_to_last_valid_assignment",
        },
        fallbackActions: ["quarantine_invalid_data"],
        notificationConfig: {
          experiment_team_alert: true,
        },
      },
      performance: {
        max_processing_time_ms: 150,
        memory_limit_mb: 256,
        cpu_cores: 2,
      },
    },
    {
      stepId: "ab_step_002",
      stepName: "Statistical Analysis",
      stepType: "transform",
      processingLogic: `
        Voer statistical analysis uit:
        - Calculate conversion rates per variant
        - Perform significance testing
        - Calculate confidence intervals
        - Detect early winners/losers
        - Generate recommendations
      `,
      dependencies: ["ab_step_001"],
      errorHandling: {
        errorTypes: [
          "insufficient_sample_size",
          "statistical_calculation_error",
        ],
        retryStrategies: {
          insufficient_sample_size: "extend_collection_period",
          statistical_calculation_error: "use_bootstrap_method",
        },
        fallbackActions: ["provide_descriptive_statistics_only"],
        notificationConfig: {
          data_science_team_alert: true,
        },
      },
      performance: {
        max_processing_time_ms: 2000,
        memory_limit_mb: 1024,
        cpu_cores: 8,
      },
    },
  ],

  outputTargets: [
    {
      targetId: "ab_tgt_001",
      targetName: "Experiment Results Database",
      targetType: "database",
      connectionConfig: {
        connectionString: "postgresql://supabase_url",
        table: "experiment_results",
        upsertKey: "experiment_id",
      },
      dataFormat: "json",
      deliveryMethod: "push",
      compressionEnabled: true,
    },
    {
      targetId: "ab_tgt_002",
      targetName: "Feature Flag Service",
      targetType: "api",
      connectionConfig: {
        endpoint: "/api/feature-flags/update",
        authentication: "api_key",
      },
      dataFormat: "json",
      deliveryMethod: "push",
      compressionEnabled: false,
    },
  ],

  n8nWorkflowMapping: {
    workflowId: "wf_ab_001",
    workflowName: "A/B Test Analysis Workflow",
    triggerType: "cron",
    triggerConfig: {
      cronExpression: "0 */4 * * *", // Every 4 hours
      timezone: "Europe/Amsterdam",
    },
    nodeConfiguration: [
      {
        nodeId: "ab_node_001",
        nodeType: "Cron",
        nodeName: "Scheduled Analysis Trigger",
        parameters: {
          cronExpression: "0 */4 * * *",
        },
        position: { x: 100, y: 300 },
        connections: ["ab_node_002"],
      },
      {
        nodeId: "ab_node_002",
        nodeType: "Supabase",
        nodeName: "Fetch Experiment Data",
        parameters: {
          operation: "select",
          table: "experiments",
          where: "status = active",
        },
        position: { x: 300, y: 300 },
        connections: ["ab_node_003"],
      },
      {
        nodeId: "ab_node_003",
        nodeType: "Function",
        nodeName: "Statistical Analysis",
        parameters: {
          functionCode: `
            // Statistical analysis for A/B tests
            const results = items.map(item => {
              const experiment = item.json;
              
              // Fetch conversion data for each variant
              const controlConversions = experiment.control_conversions || 0;
              const controlViews = experiment.control_views || 1;
              const treatmentConversions = experiment.treatment_conversions || 0;
              const treatmentViews = experiment.treatment_views || 1;
              
              // Calculate conversion rates
              const controlRate = controlConversions / controlViews;
              const treatmentRate = treatmentConversions / treatmentViews;
              
              // Calculate lift
              const lift = ((treatmentRate - controlRate) / controlRate) * 100;
              
              // Simple significance test (Chi-square)
              const pooledRate = (controlConversions + treatmentConversions) / (controlViews + treatmentViews);
              const standardError = Math.sqrt(pooledRate * (1 - pooledRate) * (1/controlViews + 1/treatmentViews));
              const zScore = (treatmentRate - controlRate) / standardError;
              const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));
              
              const result = {
                experiment_id: experiment.id,
                control_rate: controlRate,
                treatment_rate: treatmentRate,
                lift: lift,
                p_value: pValue,
                is_significant: pValue < 0.05,
                confidence_level: 95,
                sample_size: controlViews + treatmentViews,
                recommendation: lift > 0 && pValue < 0.05 ? 'implement_treatment' : 'continue_test'
              };
              
              return { json: result };
            });
            
            function normalCDF(x) {
              // Approximation of normal cumulative distribution function
              return (1.0 + erf(x / Math.sqrt(2.0))) / 2.0;
            }
            
            function erf(x) {
              // Approximation of error function
              const a1 =  0.254829592;
              const a2 = -0.284496736;
              const a3 =  1.421413741;
              const a4 = -1.453152027;
              const a5 =  1.061405429;
              const p  =  0.3275911;
              
              const sign = x < 0 ? -1 : 1;
              x = Math.abs(x);
              
              const t = 1.0 / (1.0 + p * x);
              const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
              
              return sign * y;
            }
            
            return results;
          `,
        },
        position: { x: 500, y: 300 },
        connections: ["ab_node_004"],
      },
      {
        nodeId: "ab_node_004",
        nodeType: "Supabase",
        nodeName: "Update Experiment Results",
        parameters: {
          operation: "upsert",
          table: "experiment_results",
          columns: [
            "experiment_id",
            "control_rate",
            "treatment_rate",
            "lift",
            "p_value",
            "is_significant",
          ],
        },
        position: { x: 700, y: 300 },
        connections: [],
      },
    ],
  },

  schedulingConfig: {
    executionType: "scheduled",
    cronExpression: "0 */4 * * *",
    retryPolicy: {
      max_retries: 2,
      retry_delay_ms: 300000,
      exponential_backoff: false,
    },
    executionTimeout: 60000,
    concurrencyLimit: 3,
  },

  qualityControls: [
    {
      controlId: "ab_qc_001",
      controlName: "Sample Size Validation",
      validationType: "business_rule",
      validationLogic:
        "Ensure minimum sample size for statistical significance",
      thresholds: {
        warning_threshold: 1000,
        error_threshold: 100,
      },
      actionOnFailure: "warn",
    },
  ],

  scalingConfiguration: {
    minInstances: 1,
    maxInstances: 3,
    scaleUpTrigger: {
      metric: "active_experiments",
      threshold: 10,
    },
    scaleDownTrigger: {
      metric: "active_experiments",
      threshold: 3,
    },
    autoScalingEnabled: true,
  },

  monitoringConfig: {
    metricsCollection: [
      "experiments_analyzed_per_hour",
      "statistical_calculation_time",
      "significant_results_ratio",
    ],
    alertingRules: [
      {
        ruleName: "High Number of Significant Results",
        condition: "significant_results_ratio > 0.8",
        severity: "medium",
        notificationChannels: ["slack"],
      },
    ],
    dashboardConfig: "ab_testing_dashboard",
    logLevel: "info",
  },

  costOptimization: {
    budgetLimit: 75,
    costAlerts: [
      {
        threshold: 50,
        period: "monthly",
        action: "email_notification",
      },
    ],
    optimizationStrategies: [
      "Run analysis only for active experiments",
      "Use incremental processing",
      "Cache statistical calculations",
    ],
    resourceSharing: true,
  },
};

/**
 * PIPELINE ORCHESTRATION MANAGER
 * Centralized management van alle navigation data pipelines
 */
export class NavigationPipelineOrchestrator {
  private pipelines: Map<string, NavigationDataPipeline> = new Map();
  private executionStatus: Map<
    string,
    "idle" | "running" | "error" | "completed"
  > = new Map();

  constructor() {
    this.registerPipeline(USER_BEHAVIOR_PIPELINE);
    this.registerPipeline(PERFORMANCE_METRICS_PIPELINE);
    this.registerPipeline(AB_TESTING_PIPELINE);
  }

  registerPipeline(pipeline: NavigationDataPipeline): void {
    this.pipelines.set(pipeline.pipelineId, pipeline);
    this.executionStatus.set(pipeline.pipelineId, "idle");
  }

  async executePipeline(pipelineId: string): Promise<void> {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) {
      throw new Error(`Pipeline ${pipelineId} not found`);
    }

    this.executionStatus.set(pipelineId, "running");

    try {
      // Execute pipeline steps in order
      for (const step of pipeline.processingSteps) {
        await this.executeProcessingStep(step, pipeline);
      }

      this.executionStatus.set(pipelineId, "completed");
    } catch (error) {
      this.executionStatus.set(pipelineId, "error");
      throw error;
    }
  }

  private async executeProcessingStep(
    step: ProcessingStep,
    pipeline: NavigationDataPipeline
  ): Promise<void> {
    // Implementation would depend on the specific step type and processing logic
    console.log(
      `Executing step: ${step.stepName} for pipeline: ${pipeline.pipelineName}`
    );

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  getPipelineStatus(pipelineId: string): string {
    return this.executionStatus.get(pipelineId) || "unknown";
  }

  getAllPipelines(): NavigationDataPipeline[] {
    return Array.from(this.pipelines.values());
  }

  async triggerN8nWorkflow(pipelineId: string, data: any): Promise<void> {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) {
      throw new Error(`Pipeline ${pipelineId} not found`);
    }

    const workflow = pipeline.n8nWorkflowMapping;
    console.log(
      `Triggering n8n workflow: ${workflow.workflowName} for pipeline: ${pipeline.pipelineName}`
    );

    // Implementation would make actual HTTP request to n8n webhook
    // For now, just log the action
  }
}

export default {
  USER_BEHAVIOR_PIPELINE,
  PERFORMANCE_METRICS_PIPELINE,
  AB_TESTING_PIPELINE,
  NavigationPipelineOrchestrator,
};
