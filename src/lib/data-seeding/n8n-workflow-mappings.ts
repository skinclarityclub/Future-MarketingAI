/**
 * n8n Workflow Mappings voor Navigation & UX Data Seeding
 * Complete workflow definities en configuraties voor n8n integration
 *
 * Features:
 * - Ready-to-import n8n workflow JSON
 * - Error handling workflows
 * - Monitoring en alerting workflows
 * - Cost optimization workflows
 */

export interface N8nWorkflowDefinition {
  workflowId: string;
  name: string;
  description: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  nodes: N8nWorkflowNode[];
  connections: N8nWorkflowConnections;
  settings: N8nWorkflowSettings;
  staticData: Record<string, any>;
  pinData?: Record<string, any>;
}

export interface N8nWorkflowNode {
  parameters: Record<string, any>;
  id: string;
  name: string;
  type: string;
  position: [number, number];
  typeVersion: number;
  credentials?: Record<string, any>;
  webhookId?: string;
  continueOnFail?: boolean;
  retryOnFail?: boolean;
  maxTries?: number;
  waitBetween?: number;
  alwaysOutputData?: boolean;
}

export interface N8nWorkflowConnections {
  [key: string]: {
    main: Array<Array<{ node: string; type: string; index: number }>>;
  };
}

export interface N8nWorkflowSettings {
  executionOrder: "v0" | "v1";
  saveManualExecutions: boolean;
  callerPolicy: string;
  errorWorkflow?: string;
  timezone: string;
}

/**
 * USER BEHAVIOR DATA COLLECTION WORKFLOW
 * Real-time processing van user interaction events
 */
export const USER_BEHAVIOR_N8N_WORKFLOW: N8nWorkflowDefinition = {
  workflowId: "wf_user_behavior_001",
  name: "Navigation User Behavior Data Pipeline",
  description:
    "Real-time collection en processing van user clicks, scrolls en navigation patterns",
  version: "1.0.0",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  active: true,
  nodes: [
    {
      parameters: {
        path: "user-behavior",
        options: {
          rawBody: true,
        },
        responseMode: "responseNode",
        responseData: "allEntries",
      },
      id: "webhook_user_events",
      name: "User Events Webhook",
      type: "n8n-nodes-base.webhook",
      position: [100, 100],
      typeVersion: 1,
      webhookId: "user-behavior-webhook",
    },
    {
      parameters: {
        jsCode: `
// Valideer en verrijk user events
const processedEvents = [];

for (const item of $input.all()) {
  const event = item.json;
  
  // Validatie
  if (!event.user_id || !event.event_type || !event.timestamp) {
    console.log('Skipping invalid event:', event);
    continue;
  }
  
  // Verrijking
  const enrichedEvent = {
    ...event,
    processed_at: new Date().toISOString(),
    pipeline_version: '1.0.0',
    session_id: event.session_id || 'anonymous_' + Date.now(),
    user_agent_parsed: {
      browser: event.user_agent ? event.user_agent.split(' ')[0] : 'unknown',
      device_type: event.screen_width > 768 ? 'desktop' : 'mobile'
    },
    page_metadata: {
      domain: event.page_url ? new URL(event.page_url).hostname : 'unknown',
      path: event.page_url ? new URL(event.page_url).pathname : 'unknown'
    }
  };
  
  // Behavioral scoring
  let engagement_score = 0;
  if (event.event_type === 'click') engagement_score += 2;
  if (event.event_type === 'scroll') engagement_score += 1;
  if (event.event_type === 'page_view') engagement_score += 1;
  if (event.time_on_page > 30) engagement_score += 3;
  if (event.time_on_page > 120) engagement_score += 5;
  
  enrichedEvent.engagement_score = engagement_score;
  
  processedEvents.push(enrichedEvent);
}

return processedEvents.map(event => ({ json: event }));
        `,
      },
      id: "process_user_events",
      name: "Process & Enrich Events",
      type: "n8n-nodes-base.code",
      position: [300, 100],
      typeVersion: 2,
      continueOnFail: true,
    },
    {
      parameters: {
        operation: "insert",
        table: "user_events_processed",
        columns: {
          mappingMode: "defineBelow",
          value: {
            user_id: "={{ $json.user_id }}",
            session_id: "={{ $json.session_id }}",
            event_type: "={{ $json.event_type }}",
            page_url: "={{ $json.page_url }}",
            timestamp: "={{ $json.timestamp }}",
            metadata: "={{ $json }}",
            engagement_score: "={{ $json.engagement_score }}",
            processed_at: "={{ $json.processed_at }}",
          },
        },
      },
      id: "store_supabase",
      name: "Store in Supabase",
      type: "n8n-nodes-base.supabase",
      position: [500, 100],
      typeVersion: 1,
      credentials: {
        supabaseApi: {
          id: "supabase_credentials",
          name: "Supabase Navigation DB",
        },
      },
      continueOnFail: true,
      retryOnFail: true,
      maxTries: 3,
      waitBetween: 1000,
    },
    {
      parameters: {
        conditions: {
          options: {
            caseSensitive: true,
            leftValue: "",
            typeValidation: "strict",
          },
          conditions: [
            {
              leftValue: "={{ $json.engagement_score }}",
              rightValue: 5,
              operator: {
                type: "number",
                operation: "gte",
              },
            },
          ],
          combinator: "and",
        },
      },
      id: "high_engagement_filter",
      name: "High Engagement Filter",
      type: "n8n-nodes-base.if",
      position: [700, 100],
      typeVersion: 2,
    },
    {
      parameters: {
        url: "={{ $env.ML_API_ENDPOINT }}/navigation/training-data",
        authentication: "genericCredentialType",
        genericAuthType: "httpHeaderAuth",
        sendHeaders: true,
        headerParameters: {
          parameters: [
            {
              name: "Content-Type",
              value: "application/json",
            },
          ],
        },
        sendBody: true,
        bodyParameters: {
          parameters: [
            {
              name: "events",
              value: "={{ $json }}",
            },
            {
              name: "pipeline_source",
              value: "user_behavior_n8n",
            },
          ],
        },
      },
      id: "trigger_ml_training",
      name: "Trigger ML Training",
      type: "n8n-nodes-base.httpRequest",
      position: [900, 100],
      typeVersion: 4.2,
      credentials: {
        httpHeaderAuth: {
          id: "ml_api_credentials",
          name: "ML API Bearer Token",
        },
      },
      continueOnFail: true,
    },
    {
      parameters: {
        respondWith: "json",
        responseBody:
          '={{ { "status": "success", "processed_events": $("process_user_events").all().length, "timestamp": new Date().toISOString() } }}',
      },
      id: "webhook_response",
      name: "Webhook Response",
      type: "n8n-nodes-base.respondToWebhook",
      position: [1100, 100],
      typeVersion: 1,
    },
    {
      parameters: {
        conditions: {
          options: {
            caseSensitive: true,
            leftValue: "",
            typeValidation: "strict",
          },
          conditions: [
            {
              leftValue: "={{ $json.error }}",
              rightValue: "",
              operator: {
                type: "string",
                operation: "exists",
              },
            },
          ],
          combinator: "and",
        },
      },
      id: "error_detection",
      name: "Error Detection",
      type: "n8n-nodes-base.if",
      position: [300, 300],
      typeVersion: 2,
    },
    {
      parameters: {
        channel: "#navigation-alerts",
        text: "Navigation User Behavior Pipeline Error",
        attachments: [
          {
            color: "danger",
            fields: [
              {
                title: "Error Type",
                value: '={{ $json.error_type || "Unknown" }}',
                short: true,
              },
              {
                title: "Pipeline",
                value: "User Behavior Data Collection",
                short: true,
              },
              {
                title: "Timestamp",
                value: "={{ new Date().toISOString() }}",
                short: true,
              },
              {
                title: "Error Details",
                value: "={{ JSON.stringify($json.error, null, 2) }}",
                short: false,
              },
            ],
          },
        ],
      },
      id: "slack_error_alert",
      name: "Slack Error Alert",
      type: "n8n-nodes-base.slack",
      position: [500, 300],
      typeVersion: 2,
      credentials: {
        slackApi: {
          id: "slack_credentials",
          name: "Navigation Team Slack",
        },
      },
    },
  ],
  connections: {
    webhook_user_events: {
      main: [
        [
          {
            node: "process_user_events",
            type: "main",
            index: 0,
          },
        ],
      ],
    },
    process_user_events: {
      main: [
        [
          {
            node: "store_supabase",
            type: "main",
            index: 0,
          },
          {
            node: "error_detection",
            type: "main",
            index: 0,
          },
        ],
      ],
    },
    store_supabase: {
      main: [
        [
          {
            node: "high_engagement_filter",
            type: "main",
            index: 0,
          },
        ],
      ],
    },
    high_engagement_filter: {
      main: [
        [
          {
            node: "trigger_ml_training",
            type: "main",
            index: 0,
          },
        ],
        [
          {
            node: "webhook_response",
            type: "main",
            index: 0,
          },
        ],
      ],
    },
    trigger_ml_training: {
      main: [
        [
          {
            node: "webhook_response",
            type: "main",
            index: 0,
          },
        ],
      ],
    },
    error_detection: {
      main: [
        [
          {
            node: "slack_error_alert",
            type: "main",
            index: 0,
          },
        ],
      ],
    },
  },
  settings: {
    executionOrder: "v1",
    saveManualExecutions: true,
    callerPolicy: "workflowsFromSameOwner",
    errorWorkflow: "wf_error_handler_001",
    timezone: "Europe/Amsterdam",
  },
  staticData: {
    pipeline_metadata: {
      version: "1.0.0",
      created_by: "navigation_team",
      purpose: "user_behavior_data_collection",
    },
  },
};

/**
 * PERFORMANCE METRICS WORKFLOW
 * Real-time performance monitoring en optimization
 */
export const PERFORMANCE_METRICS_N8N_WORKFLOW: N8nWorkflowDefinition = {
  workflowId: "wf_performance_001",
  name: "Navigation Performance Metrics Pipeline",
  description:
    "Real-time collection van Core Web Vitals en performance optimization",
  version: "1.0.0",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  active: true,
  nodes: [
    {
      parameters: {
        path: "performance-metrics",
        options: {
          rawBody: true,
        },
      },
      id: "performance_webhook",
      name: "Performance Metrics Webhook",
      type: "n8n-nodes-base.webhook",
      position: [100, 200],
      typeVersion: 1,
    },
    {
      parameters: {
        jsCode: `
// Process Core Web Vitals en bereken performance scores
const performanceMetrics = [];

for (const item of $input.all()) {
  const metrics = item.json;
  
  // Core Web Vitals processing
  const lcp = metrics.largestContentfulPaint || 0;
  const fid = metrics.firstInputDelay || 0;
  const cls = metrics.cumulativeLayoutShift || 0;
  const fcp = metrics.firstContentfulPaint || 0;
  const ttfb = metrics.timeToFirstByte || 0;
  
  // Performance score calculation
  let score = 100;
  
  // LCP scoring (0-100 points, 40% weight)
  let lcpScore = 100;
  if (lcp > 2500) lcpScore = Math.max(0, 100 - ((lcp - 2500) / 2500) * 100);
  else if (lcp > 4000) lcpScore = 0;
  
  // FID scoring (0-100 points, 30% weight)
  let fidScore = 100;
  if (fid > 100) fidScore = Math.max(0, 100 - ((fid - 100) / 200) * 100);
  else if (fid > 300) fidScore = 0;
  
  // CLS scoring (0-100 points, 30% weight)
  let clsScore = 100;
  if (cls > 0.1) clsScore = Math.max(0, 100 - ((cls - 0.1) / 0.15) * 100);
  else if (cls > 0.25) clsScore = 0;
  
  // Weighted total score
  const totalScore = Math.round((lcpScore * 0.4) + (fidScore * 0.3) + (clsScore * 0.3));
  
  // Performance grade
  let grade = 'A';
  if (totalScore < 90) grade = 'B';
  if (totalScore < 75) grade = 'C';
  if (totalScore < 60) grade = 'D';
  if (totalScore < 40) grade = 'F';
  
  // Optimization recommendations
  const recommendations = [];
  if (lcp > 2500) recommendations.push('Optimize Largest Contentful Paint');
  if (fid > 100) recommendations.push('Reduce First Input Delay');
  if (cls > 0.1) recommendations.push('Improve Cumulative Layout Shift');
  if (fcp > 1800) recommendations.push('Optimize First Contentful Paint');
  if (ttfb > 600) recommendations.push('Reduce Time to First Byte');
  
  const processedMetrics = {
    ...metrics,
    core_web_vitals: {
      lcp, fid, cls, fcp, ttfb
    },
    performance_score: totalScore,
    performance_grade: grade,
    individual_scores: {
      lcp_score: lcpScore,
      fid_score: fidScore,
      cls_score: clsScore
    },
    recommendations,
    processed_at: new Date().toISOString(),
    needs_optimization: totalScore < 75
  };
  
  performanceMetrics.push(processedMetrics);
}

return performanceMetrics.map(metrics => ({ json: metrics }));
        `,
      },
      id: "calculate_performance_scores",
      name: "Calculate Performance Scores",
      type: "n8n-nodes-base.code",
      position: [300, 200],
      typeVersion: 2,
    },
    {
      parameters: {
        operation: "insert",
        table: "performance_metrics",
        columns: {
          mappingMode: "defineBelow",
          value: {
            page_url: "={{ $json.page_url }}",
            user_id: "={{ $json.user_id }}",
            core_web_vitals: "={{ JSON.stringify($json.core_web_vitals) }}",
            performance_score: "={{ $json.performance_score }}",
            performance_grade: "={{ $json.performance_grade }}",
            recommendations: "={{ JSON.stringify($json.recommendations) }}",
            timestamp: "={{ $json.timestamp }}",
            processed_at: "={{ $json.processed_at }}",
          },
        },
      },
      id: "store_performance_data",
      name: "Store Performance Data",
      type: "n8n-nodes-base.supabase",
      position: [500, 200],
      typeVersion: 1,
      credentials: {
        supabaseApi: {
          id: "supabase_credentials",
          name: "Supabase Navigation DB",
        },
      },
    },
    {
      parameters: {
        conditions: {
          conditions: [
            {
              leftValue: "={{ $json.performance_score }}",
              rightValue: 60,
              operator: {
                type: "number",
                operation: "lt",
              },
            },
          ],
        },
      },
      id: "poor_performance_filter",
      name: "Poor Performance Filter",
      type: "n8n-nodes-base.if",
      position: [700, 200],
      typeVersion: 2,
    },
    {
      parameters: {
        channel: "#performance-alerts",
        text: "Performance Alert: Poor Core Web Vitals Detected",
        attachments: [
          {
            color: "warning",
            fields: [
              {
                title: "Page URL",
                value: "={{ $json.page_url }}",
                short: true,
              },
              {
                title: "Performance Score",
                value: "={{ $json.performance_score }}/100",
                short: true,
              },
              {
                title: "Grade",
                value: "={{ $json.performance_grade }}",
                short: true,
              },
              {
                title: "Recommendations",
                value: '={{ $json.recommendations.join("\\n") }}',
                short: false,
              },
            ],
          },
        ],
      },
      id: "performance_alert",
      name: "Performance Alert",
      type: "n8n-nodes-base.slack",
      position: [900, 200],
      typeVersion: 2,
      credentials: {
        slackApi: {
          id: "slack_credentials",
          name: "Navigation Team Slack",
        },
      },
    },
  ],
  connections: {
    performance_webhook: {
      main: [
        [
          {
            node: "calculate_performance_scores",
            type: "main",
            index: 0,
          },
        ],
      ],
    },
    calculate_performance_scores: {
      main: [
        [
          {
            node: "store_performance_data",
            type: "main",
            index: 0,
          },
        ],
      ],
    },
    store_performance_data: {
      main: [
        [
          {
            node: "poor_performance_filter",
            type: "main",
            index: 0,
          },
        ],
      ],
    },
    poor_performance_filter: {
      main: [
        [
          {
            node: "performance_alert",
            type: "main",
            index: 0,
          },
        ],
      ],
    },
  },
  settings: {
    executionOrder: "v1",
    saveManualExecutions: true,
    callerPolicy: "workflowsFromSameOwner",
    timezone: "Europe/Amsterdam",
  },
  staticData: {},
};

/**
 * A/B TESTING ANALYSIS WORKFLOW
 * Scheduled statistical analysis van experiment results
 */
export const AB_TESTING_N8N_WORKFLOW: N8nWorkflowDefinition = {
  workflowId: "wf_ab_testing_001",
  name: "A/B Testing Statistical Analysis",
  description:
    "Automated statistical analysis en decision making voor navigation experiments",
  version: "1.0.0",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  active: true,
  nodes: [
    {
      parameters: {
        rule: {
          interval: [
            {
              field: "hours",
            },
          ],
        },
      },
      id: "schedule_trigger",
      name: "Every 4 Hours",
      type: "n8n-nodes-base.scheduleTrigger",
      position: [100, 300],
      typeVersion: 1.2,
    },
    {
      parameters: {
        operation: "select",
        table: "experiments",
        filterType: "manual",
        conditions: {
          conditions: [
            {
              keyName: "status",
              value: "active",
            },
          ],
        },
      },
      id: "fetch_active_experiments",
      name: "Fetch Active Experiments",
      type: "n8n-nodes-base.supabase",
      position: [300, 300],
      typeVersion: 1,
      credentials: {
        supabaseApi: {
          id: "supabase_credentials",
          name: "Supabase Navigation DB",
        },
      },
    },
    {
      parameters: {
        jsCode: `
// Statistical analysis voor elk actief experiment
const analysisResults = [];

for (const item of $input.all()) {
  const experiment = item.json;
  
  // Fetch conversion data (zou normaal een database query zijn)
  const controlConversions = experiment.control_conversions || 0;
  const controlViews = experiment.control_views || 1;
  const treatmentConversions = experiment.treatment_conversions || 0;
  const treatmentViews = experiment.treatment_views || 1;
  
  // Bereken conversion rates
  const controlRate = controlConversions / controlViews;
  const treatmentRate = treatmentConversions / treatmentViews;
  
  // Bereken lift
  const lift = controlRate > 0 ? ((treatmentRate - controlRate) / controlRate) * 100 : 0;
  
  // Chi-square test voor significance
  const totalConversions = controlConversions + treatmentConversions;
  const totalViews = controlViews + treatmentViews;
  const pooledRate = totalConversions / totalViews;
  
  const expectedControlConversions = controlViews * pooledRate;
  const expectedControlNonConversions = controlViews * (1 - pooledRate);
  const expectedTreatmentConversions = treatmentViews * pooledRate;
  const expectedTreatmentNonConversions = treatmentViews * (1 - pooledRate);
  
  // Chi-square statistic
  const chiSquare = 
    Math.pow(controlConversions - expectedControlConversions, 2) / expectedControlConversions +
    Math.pow((controlViews - controlConversions) - expectedControlNonConversions, 2) / expectedControlNonConversions +
    Math.pow(treatmentConversions - expectedTreatmentConversions, 2) / expectedTreatmentConversions +
    Math.pow((treatmentViews - treatmentConversions) - expectedTreatmentNonConversions, 2) / expectedTreatmentNonConversions;
  
  // Critical value voor 95% confidence (df=1)
  const criticalValue = 3.841;
  const isSignificant = chiSquare > criticalValue;
  
  // Sample size adequacy check
  const minSampleSize = 1000;
  const hasAdequateSample = (controlViews + treatmentViews) >= minSampleSize;
  
  // Recommendation logic
  let recommendation = 'continue_test';
  let reason = 'Insufficient sample size or not significant';
  
  if (hasAdequateSample && isSignificant) {
    if (lift > 5) {
      recommendation = 'implement_treatment';
      reason = 'Significant positive lift detected';
    } else if (lift < -5) {
      recommendation = 'stop_test';
      reason = 'Significant negative impact detected';
    } else {
      recommendation = 'inconclusive';
      reason = 'Significant but minimal impact';
    }
  }
  
  const result = {
    experiment_id: experiment.id,
    experiment_name: experiment.name,
    control_rate: Math.round(controlRate * 10000) / 100, // Percentage with 2 decimals
    treatment_rate: Math.round(treatmentRate * 10000) / 100,
    lift_percentage: Math.round(lift * 100) / 100,
    chi_square_statistic: Math.round(chiSquare * 1000) / 1000,
    is_significant: isSignificant,
    confidence_level: 95,
    sample_size: controlViews + treatmentViews,
    has_adequate_sample: hasAdequateSample,
    recommendation: recommendation,
    recommendation_reason: reason,
    analysis_timestamp: new Date().toISOString(),
    requires_action: recommendation !== 'continue_test'
  };
  
  analysisResults.push(result);
}

return analysisResults.map(result => ({ json: result }));
        `,
      },
      id: "statistical_analysis",
      name: "Statistical Analysis",
      type: "n8n-nodes-base.code",
      position: [500, 300],
      typeVersion: 2,
    },
    {
      parameters: {
        operation: "upsert",
        table: "experiment_results",
        columns: {
          mappingMode: "defineBelow",
          value: {
            experiment_id: "={{ $json.experiment_id }}",
            control_rate: "={{ $json.control_rate }}",
            treatment_rate: "={{ $json.treatment_rate }}",
            lift_percentage: "={{ $json.lift_percentage }}",
            is_significant: "={{ $json.is_significant }}",
            sample_size: "={{ $json.sample_size }}",
            recommendation: "={{ $json.recommendation }}",
            analysis_timestamp: "={{ $json.analysis_timestamp }}",
          },
        },
      },
      id: "store_results",
      name: "Store Analysis Results",
      type: "n8n-nodes-base.supabase",
      position: [700, 300],
      typeVersion: 1,
      credentials: {
        supabaseApi: {
          id: "supabase_credentials",
          name: "Supabase Navigation DB",
        },
      },
    },
    {
      parameters: {
        conditions: {
          conditions: [
            {
              leftValue: "={{ $json.requires_action }}",
              rightValue: true,
              operator: {
                type: "boolean",
                operation: "equal",
              },
            },
          ],
        },
      },
      id: "action_required_filter",
      name: "Action Required Filter",
      type: "n8n-nodes-base.if",
      position: [900, 300],
      typeVersion: 2,
    },
    {
      parameters: {
        channel: "#experiment-results",
        text: "A/B Test Results: Action Required",
        attachments: [
          {
            color: "good",
            fields: [
              {
                title: "Experiment",
                value: "={{ $json.experiment_name }}",
                short: true,
              },
              {
                title: "Recommendation",
                value: "={{ $json.recommendation }}",
                short: true,
              },
              {
                title: "Lift",
                value: "={{ $json.lift_percentage }}%",
                short: true,
              },
              {
                title: "Significance",
                value:
                  '={{ $json.is_significant ? "✅ Significant" : "❌ Not Significant" }}',
                short: true,
              },
              {
                title: "Reason",
                value: "={{ $json.recommendation_reason }}",
                short: false,
              },
            ],
          },
        ],
      },
      id: "experiment_notification",
      name: "Experiment Notification",
      type: "n8n-nodes-base.slack",
      position: [1100, 300],
      typeVersion: 2,
      credentials: {
        slackApi: {
          id: "slack_credentials",
          name: "Navigation Team Slack",
        },
      },
    },
  ],
  connections: {
    schedule_trigger: {
      main: [
        [
          {
            node: "fetch_active_experiments",
            type: "main",
            index: 0,
          },
        ],
      ],
    },
    fetch_active_experiments: {
      main: [
        [
          {
            node: "statistical_analysis",
            type: "main",
            index: 0,
          },
        ],
      ],
    },
    statistical_analysis: {
      main: [
        [
          {
            node: "store_results",
            type: "main",
            index: 0,
          },
        ],
      ],
    },
    store_results: {
      main: [
        [
          {
            node: "action_required_filter",
            type: "main",
            index: 0,
          },
        ],
      ],
    },
    action_required_filter: {
      main: [
        [
          {
            node: "experiment_notification",
            type: "main",
            index: 0,
          },
        ],
      ],
    },
  },
  settings: {
    executionOrder: "v1",
    saveManualExecutions: true,
    callerPolicy: "workflowsFromSameOwner",
    timezone: "Europe/Amsterdam",
  },
  staticData: {},
};

/**
 * ERROR HANDLING WORKFLOW
 * Centralized error handling voor alle navigation pipelines
 */
export const ERROR_HANDLING_N8N_WORKFLOW: N8nWorkflowDefinition = {
  workflowId: "wf_error_handler_001",
  name: "Navigation Pipeline Error Handler",
  description:
    "Centralized error handling, logging en alerting voor navigation data pipelines",
  version: "1.0.0",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  active: true,
  nodes: [
    {
      parameters: {
        path: "pipeline-error",
        options: {
          rawBody: true,
        },
      },
      id: "error_webhook",
      name: "Error Webhook",
      type: "n8n-nodes-base.webhook",
      position: [100, 400],
      typeVersion: 1,
    },
    {
      parameters: {
        jsCode: `
// Process en categoriseer errors
const processedErrors = [];

for (const item of $input.all()) {
  const errorData = item.json;
  
  // Error categorization
  let errorCategory = 'unknown';
  let severity = 'medium';
  let shouldAlert = true;
  
  if (errorData.error_type) {
    if (errorData.error_type.includes('validation')) {
      errorCategory = 'data_validation';
      severity = 'low';
    } else if (errorData.error_type.includes('database')) {
      errorCategory = 'database_error';
      severity = 'high';
    } else if (errorData.error_type.includes('api')) {
      errorCategory = 'external_api';
      severity = 'medium';
    } else if (errorData.error_type.includes('timeout')) {
      errorCategory = 'timeout';
      severity = 'medium';
    }
  }
  
  // Auto-retry logic
  const retryCount = errorData.retry_count || 0;
  const maxRetries = 3;
  const shouldRetry = retryCount < maxRetries && ['timeout', 'external_api'].includes(errorCategory);
  
  const processedError = {
    ...errorData,
    error_category: errorCategory,
    severity: severity,
    should_alert: shouldAlert,
    should_retry: shouldRetry,
    processed_at: new Date().toISOString(),
    error_id: \`err_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`
  };
  
  processedErrors.push(processedError);
}

return processedErrors.map(error => ({ json: error }));
        `,
      },
      id: "process_error",
      name: "Process Error",
      type: "n8n-nodes-base.code",
      position: [300, 400],
      typeVersion: 2,
    },
    {
      parameters: {
        operation: "insert",
        table: "pipeline_errors",
        columns: {
          mappingMode: "defineBelow",
          value: {
            error_id: "={{ $json.error_id }}",
            pipeline_id: "={{ $json.pipeline_id }}",
            error_type: "={{ $json.error_type }}",
            error_category: "={{ $json.error_category }}",
            severity: "={{ $json.severity }}",
            error_message: "={{ $json.error_message }}",
            stack_trace: "={{ JSON.stringify($json.stack_trace) }}",
            metadata: "={{ JSON.stringify($json) }}",
            created_at: "={{ $json.processed_at }}",
          },
        },
      },
      id: "log_error",
      name: "Log Error to Database",
      type: "n8n-nodes-base.supabase",
      position: [500, 400],
      typeVersion: 1,
      credentials: {
        supabaseApi: {
          id: "supabase_credentials",
          name: "Supabase Navigation DB",
        },
      },
    },
    {
      parameters: {
        conditions: {
          conditions: [
            {
              leftValue: "={{ $json.should_alert }}",
              rightValue: true,
              operator: {
                type: "boolean",
                operation: "equal",
              },
            },
          ],
        },
      },
      id: "alert_filter",
      name: "Should Alert Filter",
      type: "n8n-nodes-base.if",
      position: [700, 400],
      typeVersion: 2,
    },
    {
      parameters: {
        channel: "#navigation-errors",
        text: "Navigation Pipeline Error",
        attachments: [
          {
            color: "danger",
            fields: [
              {
                title: "Error ID",
                value: "={{ $json.error_id }}",
                short: true,
              },
              {
                title: "Pipeline",
                value: "={{ $json.pipeline_id }}",
                short: true,
              },
              {
                title: "Category",
                value: "={{ $json.error_category }}",
                short: true,
              },
              {
                title: "Severity",
                value: "={{ $json.severity }}",
                short: true,
              },
              {
                title: "Error Message",
                value: "={{ $json.error_message }}",
                short: false,
              },
            ],
          },
        ],
      },
      id: "error_alert",
      name: "Send Error Alert",
      type: "n8n-nodes-base.slack",
      position: [900, 400],
      typeVersion: 2,
      credentials: {
        slackApi: {
          id: "slack_credentials",
          name: "Navigation Team Slack",
        },
      },
    },
  ],
  connections: {
    error_webhook: {
      main: [
        [
          {
            node: "process_error",
            type: "main",
            index: 0,
          },
        ],
      ],
    },
    process_error: {
      main: [
        [
          {
            node: "log_error",
            type: "main",
            index: 0,
          },
        ],
      ],
    },
    log_error: {
      main: [
        [
          {
            node: "alert_filter",
            type: "main",
            index: 0,
          },
        ],
      ],
    },
    alert_filter: {
      main: [
        [
          {
            node: "error_alert",
            type: "main",
            index: 0,
          },
        ],
      ],
    },
  },
  settings: {
    executionOrder: "v1",
    saveManualExecutions: true,
    callerPolicy: "workflowsFromSameOwner",
    timezone: "Europe/Amsterdam",
  },
  staticData: {},
};

/**
 * WORKFLOW DEPLOYMENT HELPER
 * Utilities voor het importeren van workflows in n8n
 */
export class N8nWorkflowDeployer {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async deployWorkflow(workflow: N8nWorkflowDefinition): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/workflows`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-N8N-API-KEY": this.apiKey,
      },
      body: JSON.stringify(workflow),
    });

    if (!response.ok) {
      throw new Error(`Failed to deploy workflow: ${response.statusText}`);
    }

    console.log(`Successfully deployed workflow: ${workflow.name}`);
  }

  async deployAllNavigationWorkflows(): Promise<void> {
    const workflows = [
      USER_BEHAVIOR_N8N_WORKFLOW,
      PERFORMANCE_METRICS_N8N_WORKFLOW,
      AB_TESTING_N8N_WORKFLOW,
      ERROR_HANDLING_N8N_WORKFLOW,
    ];

    for (const workflow of workflows) {
      await this.deployWorkflow(workflow);
    }

    console.log("All navigation workflows deployed successfully!");
  }
}

export default {
  USER_BEHAVIOR_N8N_WORKFLOW,
  PERFORMANCE_METRICS_N8N_WORKFLOW,
  AB_TESTING_N8N_WORKFLOW,
  ERROR_HANDLING_N8N_WORKFLOW,
  N8nWorkflowDeployer,
};
