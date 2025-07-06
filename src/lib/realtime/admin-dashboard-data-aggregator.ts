/**
 * Admin Dashboard Real-Time Data Aggregator
 * Subtask 82.3: Establish Real-Time Data Integration Framework
 *
 * Centralizes and orchestrates all real-time data sources for the Master Command Center.
 * Provides unified data streams from system health, business analytics, workflows,
 * customer intelligence, and security/compliance systems.
 */

import { createClient } from "@/lib/supabase/client";
import { HealthMonitoringEngine } from "@/lib/monitoring/health-monitoring-engine";
import { WorkflowMonitor } from "@/lib/monitoring/workflow-monitor";
import { TacticalRealtimeEngine } from "@/lib/realtime/tactical-realtime-engine";
import { WebSocketManager } from "@/lib/realtime/websocket-manager";
import { RealTimeKPIService } from "@/lib/workflows/real-time-kpi-updates";
import { MonitoringService } from "@/lib/services/monitoring-service";
import { TacticalPerformanceEngine } from "@/lib/analytics/tactical-performance-engine";
import { AdminDashboardRBACService } from "@/lib/rbac/admin-dashboard-rbac";

// ====================================================================
// REAL-TIME DATA TYPES FOR ADMIN DASHBOARD
// ====================================================================

export interface AdminDashboardDataPoint {
  id: string;
  timestamp: Date;
  source: DataSource;
  category: DataCategory;
  metric: string;
  value: number;
  status: "healthy" | "warning" | "critical";
  metadata?: Record<string, any>;
  moduleAccess: string[]; // Which dashboard modules can access this data
}

export type DataSource =
  | "system_health"
  | "business_analytics"
  | "workflow_performance"
  | "customer_intelligence"
  | "security_compliance"
  | "infrastructure";

export type DataCategory =
  | "cpu_usage"
  | "memory_usage"
  | "response_time"
  | "uptime"
  | "error_rate"
  | "revenue"
  | "conversions"
  | "customer_count"
  | "churn_rate"
  | "workflow_success_rate"
  | "execution_time"
  | "queue_size"
  | "active_users"
  | "support_tickets"
  | "health_score"
  | "auth_failures"
  | "api_requests"
  | "compliance_violations"
  | "disk_usage"
  | "network_latency"
  | "database_connections";

export interface DataAggregationConfig {
  updateIntervalMs: number;
  bufferSizePerSource: number;
  enableRealTimeStreaming: boolean;
  enableDataBuffering: boolean;
  enableMLForecasting: boolean;
  retentionPeriodMs: number;
  alertThresholds: Record<string, { warning: number; critical: number }>;
}

export interface AdminDashboardSnapshot {
  timestamp: Date;
  systemHealth: {
    overall_status: "healthy" | "warning" | "critical";
    cpu_usage: number;
    memory_usage: number;
    response_time: number;
    uptime_percentage: number;
    active_services: number;
    failed_services: number;
  };
  businessMetrics: {
    revenue_today: number;
    revenue_trend: number;
    active_customers: number;
    conversion_rate: number;
    churn_rate: number;
    mrr: number;
  };
  workflowPerformance: {
    active_executions: number;
    success_rate: number;
    average_execution_time: number;
    queue_size: number;
    failed_workflows: number;
    throughput_per_hour: number;
  };
  customerIntelligence: {
    active_users_now: number;
    user_growth_rate: number;
    support_tickets_open: number;
    average_health_score: number;
    user_engagement_rate: number;
    bounce_rate: number;
  };
  securityCompliance: {
    failed_auth_attempts: number;
    api_requests_per_minute: number;
    compliance_score: number;
    active_sessions: number;
    security_incidents: number;
    audit_events_today: number;
  };
  alerts: AdminDashboardAlert[];
  performance: {
    data_sources_active: number;
    aggregation_latency: number;
    total_data_points: number;
    memory_usage_mb: number;
  };
}

export interface AdminDashboardAlert {
  id: string;
  severity: "info" | "warning" | "critical";
  source: DataSource;
  metric: string;
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
  acknowledged: boolean;
  moduleAccess: string[];
}

export interface DataStreamSubscription {
  id: string;
  userId: string;
  moduleAccess: string[];
  sources: DataSource[];
  categories: DataCategory[];
  callback: (data: AdminDashboardDataPoint[]) => void;
  lastUpdate: Date;
  active: boolean;
}

// ====================================================================
// ADMIN DASHBOARD DATA AGGREGATOR
// ====================================================================

export class AdminDashboardDataAggregator {
  private supabase = createClient();
  private healthMonitor = new HealthMonitoringEngine();
  private workflowMonitor = new WorkflowMonitor();
  private tacticalEngine = new TacticalRealtimeEngine();
  private webSocketManager: WebSocketManager;
  private kpiService = new RealTimeKPIService();
  private monitoringService = new MonitoringService();
  private performanceEngine = new TacticalPerformanceEngine();
  private rbacService = new AdminDashboardRBACService();

  private config: DataAggregationConfig;
  private dataBuffer = new Map<DataSource, AdminDashboardDataPoint[]>();
  private subscriptions = new Map<string, DataStreamSubscription>();
  private aggregationInterval?: NodeJS.Timeout;
  private isRunning = false;
  private latestSnapshot?: AdminDashboardSnapshot;
  private alerts = new Map<string, AdminDashboardAlert>();

  constructor(config?: Partial<DataAggregationConfig>) {
    this.config = {
      updateIntervalMs: 5000, // 5 seconds
      bufferSizePerSource: 1000,
      enableRealTimeStreaming: true,
      enableDataBuffering: true,
      enableMLForecasting: true,
      retentionPeriodMs: 24 * 60 * 60 * 1000, // 24 hours
      alertThresholds: {
        cpu_usage: { warning: 70, critical: 85 },
        memory_usage: { warning: 75, critical: 90 },
        response_time: { warning: 1000, critical: 3000 },
        error_rate: { warning: 5, critical: 10 },
        workflow_success_rate: { warning: 90, critical: 80 },
        active_users_now: { warning: 100, critical: 50 },
        failed_auth_attempts: { warning: 10, critical: 25 },
      },
      ...config,
    };

    this.webSocketManager = new WebSocketManager({
      url: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      enableLogging: true,
    });

    this.initializeDataSources();
  }

  // ====================================================================
  // INITIALIZATION & STARTUP
  // ====================================================================

  /**
   * Start the real-time data aggregation system
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn("AdminDashboardDataAggregator is already running");
      return;
    }

    console.log("🚀 Starting Admin Dashboard Data Aggregator...");

    try {
      // Start all monitoring engines
      await this.healthMonitor.startMonitoring(30000); // 30 second intervals
      await this.workflowMonitor.initialize();
      await this.tacticalEngine.start();
      await this.performanceEngine.startRealTimeProcessing(data => {
        this.handleTacticalData(data);
      });

      // Connect WebSocket for live updates
      if (this.config.enableRealTimeStreaming) {
        await this.webSocketManager.connect();
        this.setupWebSocketSubscriptions();
      }

      // Setup Supabase real-time subscriptions
      this.setupSupabaseSubscriptions();

      // Start periodic data aggregation
      this.aggregationInterval = setInterval(
        () => this.aggregateData(),
        this.config.updateIntervalMs
      );

      this.isRunning = true;
      console.log("✅ Admin Dashboard Data Aggregator started successfully");
    } catch (error) {
      console.error(
        "❌ Failed to start Admin Dashboard Data Aggregator:",
        error
      );
      throw error;
    }
  }

  /**
   * Stop the data aggregation system
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return;

    console.log("🛑 Stopping Admin Dashboard Data Aggregator...");

    // Stop all monitoring engines
    this.healthMonitor.stopMonitoring();
    await this.tacticalEngine.stop();

    // Disconnect WebSocket
    this.webSocketManager.disconnect();

    // Clear intervals
    if (this.aggregationInterval) {
      clearInterval(this.aggregationInterval);
    }

    // Clear subscriptions
    this.subscriptions.clear();
    this.dataBuffer.clear();

    this.isRunning = false;
    console.log("✅ Admin Dashboard Data Aggregator stopped");
  }

  // ====================================================================
  // DATA SOURCE INITIALIZATION
  // ====================================================================

  private async initializeDataSources(): Promise<void> {
    // Initialize data buffers for each source
    const sources: DataSource[] = [
      "system_health",
      "business_analytics",
      "workflow_performance",
      "customer_intelligence",
      "security_compliance",
      "infrastructure",
    ];

    sources.forEach(source => {
      this.dataBuffer.set(source, []);
    });
  }

  private setupWebSocketSubscriptions(): void {
    // Subscribe to workflow updates
    this.webSocketManager.subscribeToWorkflows(workflows => {
      const dataPoints = workflows.map(workflow => ({
        id: `workflow-${workflow.id}-${Date.now()}`,
        timestamp: new Date(),
        source: "workflow_performance" as DataSource,
        category: "workflow_success_rate" as DataCategory,
        metric: "execution_status",
        value: workflow.status === "success" ? 1 : 0,
        status: workflow.status === "success" ? "healthy" : ("warning" as any),
        metadata: { workflowId: workflow.id, duration: workflow.duration },
        moduleAccess: ["workflow_performance", "executive_summary"],
      }));

      this.addDataPoints("workflow_performance", dataPoints);
    });

    // Subscribe to real-time metrics
    this.webSocketManager.subscribeToMetrics(metrics => {
      const dataPoints: AdminDashboardDataPoint[] = [
        {
          id: `metrics-${Date.now()}`,
          timestamp: new Date(),
          source: "system_health",
          category: "response_time",
          metric: "api_response_time",
          value: metrics.averageResponseTime || 0,
          status: this.getHealthStatus(
            "response_time",
            metrics.averageResponseTime || 0
          ),
          metadata: { service: "api" },
          moduleAccess: ["system_health", "executive_summary"],
        },
      ];

      this.addDataPoints("system_health", dataPoints);
    });

    // Subscribe to alerts
    this.webSocketManager.subscribeToAlerts(alerts => {
      alerts.forEach(alert => {
        this.handleAlert({
          id: alert.id,
          severity: alert.severity as "info" | "warning" | "critical",
          source: "system_health",
          metric: alert.type,
          message: alert.message,
          value: alert.value || 0,
          threshold: alert.threshold || 0,
          timestamp: new Date(),
          acknowledged: false,
          moduleAccess: ["system_health", "security_compliance"],
        });
      });
    });
  }

  private setupSupabaseSubscriptions(): void {
    // Subscribe to system health metrics
    this.supabase
      .channel("admin-dashboard-health")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "system_health_metrics",
        },
        payload => {
          this.handleSystemHealthUpdate(payload.new);
        }
      )
      .subscribe();

    // Subscribe to workflow executions
    this.supabase
      .channel("admin-dashboard-workflows")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workflow_executions",
        },
        payload => {
          this.handleWorkflowUpdate(payload);
        }
      )
      .subscribe();

    // Subscribe to user behavior events for customer intelligence
    this.supabase
      .channel("admin-dashboard-users")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_behavior_events",
        },
        payload => {
          this.handleUserBehaviorUpdate(payload.new);
        }
      )
      .subscribe();

    // Subscribe to security events
    this.supabase
      .channel("admin-dashboard-security")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "auth_logs",
        },
        payload => {
          this.handleSecurityUpdate(payload.new);
        }
      )
      .subscribe();
  }

  // ====================================================================
  // DATA INGESTION HANDLERS
  // ====================================================================

  private handleSystemHealthUpdate(healthMetric: any): void {
    const dataPoint: AdminDashboardDataPoint = {
      id: `health-${healthMetric.id}`,
      timestamp: new Date(healthMetric.timestamp),
      source: "system_health",
      category: healthMetric.metric_type as DataCategory,
      metric: healthMetric.metric_type,
      value: healthMetric.metric_value,
      status: healthMetric.status,
      metadata: {
        service: healthMetric.service_name,
        unit: healthMetric.unit,
        threshold_min: healthMetric.threshold_min,
        threshold_max: healthMetric.threshold_max,
      },
      moduleAccess: ["system_health", "executive_summary"],
    };

    this.addDataPoints("system_health", [dataPoint]);
    this.checkAndCreateAlert(dataPoint);
  }

  private handleWorkflowUpdate(payload: any): void {
    const workflowData = payload.new || payload.old;
    if (!workflowData) return;

    const dataPoint: AdminDashboardDataPoint = {
      id: `workflow-${workflowData.id}`,
      timestamp: new Date(),
      source: "workflow_performance",
      category: "workflow_success_rate",
      metric: "execution_status",
      value: workflowData.status === "success" ? 1 : 0,
      status: workflowData.status === "success" ? "healthy" : "warning",
      metadata: {
        workflowId: workflowData.workflow_id,
        executionId: workflowData.execution_id,
        duration: workflowData.execution_time,
        eventType: payload.eventType,
      },
      moduleAccess: ["workflow_performance", "executive_summary"],
    };

    this.addDataPoints("workflow_performance", [dataPoint]);
  }

  private handleUserBehaviorUpdate(behaviorEvent: any): void {
    const dataPoint: AdminDashboardDataPoint = {
      id: `user-${behaviorEvent.id}`,
      timestamp: new Date(behaviorEvent.created_at),
      source: "customer_intelligence",
      category: "active_users_now" as DataCategory,
      metric: behaviorEvent.event_type,
      value: 1, // Count of events
      status: "healthy",
      metadata: {
        userId: behaviorEvent.user_id,
        sessionId: behaviorEvent.session_id,
        pageUrl: behaviorEvent.page_url,
        eventType: behaviorEvent.event_type,
      },
      moduleAccess: ["customer_intelligence", "executive_summary"],
    };

    this.addDataPoints("customer_intelligence", [dataPoint]);
  }

  private handleSecurityUpdate(securityEvent: any): void {
    const isFailure = securityEvent.success === false;

    const dataPoint: AdminDashboardDataPoint = {
      id: `security-${securityEvent.id}`,
      timestamp: new Date(securityEvent.created_at),
      source: "security_compliance",
      category: "failed_auth_attempts" as DataCategory,
      metric: "auth_attempt",
      value: isFailure ? 1 : 0,
      status: isFailure ? "warning" : "healthy",
      metadata: {
        userId: securityEvent.user_id,
        ipAddress: securityEvent.ip_address,
        userAgent: securityEvent.user_agent,
        success: securityEvent.success,
      },
      moduleAccess: ["security_compliance", "executive_summary"],
    };

    this.addDataPoints("security_compliance", [dataPoint]);

    if (isFailure) {
      this.checkAndCreateAlert(dataPoint);
    }
  }

  private handleTacticalData(data: any[]): void {
    const dataPoints: AdminDashboardDataPoint[] = data.map(item => ({
      id: `tactical-${Date.now()}-${Math.random()}`,
      timestamp: new Date(item.timestamp),
      source: "business_analytics",
      category: item.category as DataCategory,
      metric: item.category,
      value: item.value,
      status: "healthy",
      metadata: {
        source: item.source,
        originalMetadata: item.metadata,
      },
      moduleAccess: ["business_analytics", "executive_summary"],
    }));

    this.addDataPoints("business_analytics", dataPoints);
  }

  // ====================================================================
  // DATA MANAGEMENT
  // ====================================================================

  private addDataPoints(
    source: DataSource,
    dataPoints: AdminDashboardDataPoint[]
  ): void {
    if (!this.config.enableDataBuffering) return;

    const buffer = this.dataBuffer.get(source) || [];
    buffer.push(...dataPoints);

    // Maintain buffer size
    if (buffer.length > this.config.bufferSizePerSource) {
      buffer.splice(0, buffer.length - this.config.bufferSizePerSource);
    }

    this.dataBuffer.set(source, buffer);

    // Notify subscribers
    this.notifySubscribers(dataPoints);
  }

  private async aggregateData(): Promise<void> {
    try {
      const snapshot = await this.generateSnapshot();
      this.latestSnapshot = snapshot;

      // Emit snapshot to subscribers
      this.notifySnapshotSubscribers(snapshot);
    } catch (error) {
      console.error("Error during data aggregation:", error);
    }
  }

  private async generateSnapshot(): Promise<AdminDashboardSnapshot> {
    const timestamp = new Date();

    // Get system health summary
    const systemHealthSummary =
      await this.healthMonitor.getSystemHealthSummary();

    // Get workflow dashboard data
    const workflowData = await this.workflowMonitor.getDashboardData();

    // Calculate business metrics from recent data
    const businessBuffer = this.dataBuffer.get("business_analytics") || [];
    const recentBusinessData = this.getRecentData(
      businessBuffer,
      60 * 60 * 1000
    ); // Last hour

    // Calculate customer intelligence from recent user events
    const customerBuffer = this.dataBuffer.get("customer_intelligence") || [];
    const recentCustomerData = this.getRecentData(
      customerBuffer,
      60 * 60 * 1000
    );

    // Calculate security metrics
    const securityBuffer = this.dataBuffer.get("security_compliance") || [];
    const recentSecurityData = this.getRecentData(
      securityBuffer,
      60 * 60 * 1000
    );

    const snapshot: AdminDashboardSnapshot = {
      timestamp,
      systemHealth: {
        overall_status: systemHealthSummary.overall_status,
        cpu_usage: this.getLatestMetricValue("system_health", "cpu_usage") || 0,
        memory_usage:
          this.getLatestMetricValue("system_health", "memory_usage") || 0,
        response_time: systemHealthSummary.average_response_time,
        uptime_percentage: systemHealthSummary.uptime_percentage,
        active_services: systemHealthSummary.healthy_services,
        failed_services: systemHealthSummary.critical_services,
      },
      businessMetrics: {
        revenue_today: this.sumMetricValues(recentBusinessData, "revenue") || 0,
        revenue_trend: this.calculateTrend(businessBuffer, "revenue"),
        active_customers:
          this.getLatestMetricValue("business_analytics", "customer_count") ||
          0,
        conversion_rate:
          this.getLatestMetricValue("business_analytics", "conversion_rate") ||
          0,
        churn_rate:
          this.getLatestMetricValue("business_analytics", "churn_rate") || 0,
        mrr: this.getLatestMetricValue("business_analytics", "mrr") || 0,
      },
      workflowPerformance: {
        active_executions: workflowData.activeExecutions,
        success_rate: this.calculateSuccessRate("workflow_performance"),
        average_execution_time: workflowData.averageExecutionTime,
        queue_size:
          this.getLatestMetricValue("workflow_performance", "queue_size") || 0,
        failed_workflows: workflowData.totalErrors,
        throughput_per_hour: this.calculateThroughput("workflow_performance"),
      },
      customerIntelligence: {
        active_users_now: this.countUniqueUsers(recentCustomerData),
        user_growth_rate: this.calculateUserGrowthRate(customerBuffer),
        support_tickets_open:
          this.getLatestMetricValue(
            "customer_intelligence",
            "support_tickets"
          ) || 0,
        average_health_score:
          this.getLatestMetricValue("customer_intelligence", "health_score") ||
          0,
        user_engagement_rate: this.calculateEngagementRate(recentCustomerData),
        bounce_rate:
          this.getLatestMetricValue("customer_intelligence", "bounce_rate") ||
          0,
      },
      securityCompliance: {
        failed_auth_attempts: this.sumMetricValues(
          recentSecurityData,
          "auth_attempt",
          dp => dp.value === 1
        ),
        api_requests_per_minute: this.calculateAPIRequestRate(),
        compliance_score:
          this.getLatestMetricValue(
            "security_compliance",
            "compliance_score"
          ) || 100,
        active_sessions:
          this.getLatestMetricValue("security_compliance", "active_sessions") ||
          0,
        security_incidents:
          this.getLatestMetricValue(
            "security_compliance",
            "security_incidents"
          ) || 0,
        audit_events_today: this.countTodayEvents(securityBuffer),
      },
      alerts: Array.from(this.alerts.values()).filter(
        alert => !alert.acknowledged
      ),
      performance: {
        data_sources_active: this.dataBuffer.size,
        aggregation_latency: this.calculateAggregationLatency(),
        total_data_points: this.getTotalDataPoints(),
        memory_usage_mb: this.getMemoryUsageMB(),
      },
    };

    return snapshot;
  }

  // ====================================================================
  // SUBSCRIPTION MANAGEMENT
  // ====================================================================

  /**
   * Subscribe to real-time data updates with RBAC filtering
   */
  async subscribe(
    userId: string,
    userRole: string,
    callback: (data: AdminDashboardDataPoint[]) => void,
    options?: {
      sources?: DataSource[];
      categories?: DataCategory[];
    }
  ): Promise<string> {
    // Check user permissions
    const hasAccess = await this.rbacService.hasGlobalPermission(
      userId,
      userRole,
      "real_time_monitor"
    );
    if (!hasAccess) {
      throw new Error(
        "Insufficient permissions for real-time data subscription"
      );
    }

    // Get user's module access
    const moduleAccess = await this.rbacService.getUserAccessibleModules(
      userId,
      userRole
    );

    const subscriptionId = `sub-${Date.now()}-${Math.random()}`;
    const subscription: DataStreamSubscription = {
      id: subscriptionId,
      userId,
      moduleAccess,
      sources: options?.sources || [
        "system_health",
        "business_analytics",
        "workflow_performance",
        "customer_intelligence",
        "security_compliance",
      ],
      categories: options?.categories || [],
      callback,
      lastUpdate: new Date(),
      active: true,
    };

    this.subscriptions.set(subscriptionId, subscription);

    console.log(
      `📡 New data subscription created for user ${userId}: ${subscriptionId}`
    );
    return subscriptionId;
  }

  /**
   * Subscribe to snapshot updates
   */
  subscribeToSnapshots(
    userId: string,
    userRole: string,
    callback: (snapshot: AdminDashboardSnapshot) => void
  ): Promise<string> {
    // Implement snapshot subscription logic
    return this.subscribe(userId, userRole, () => {
      if (this.latestSnapshot) {
        callback(this.latestSnapshot);
      }
    });
  }

  /**
   * Unsubscribe from data updates
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.active = false;
      this.subscriptions.delete(subscriptionId);
      console.log(`📡 Subscription removed: ${subscriptionId}`);
    }
  }

  private notifySubscribers(dataPoints: AdminDashboardDataPoint[]): void {
    this.subscriptions.forEach(subscription => {
      if (!subscription.active) return;

      // Filter data points based on user's module access and source preferences
      const filteredData = dataPoints.filter(dataPoint => {
        // Check if user has access to the module that can view this data
        const hasModuleAccess = dataPoint.moduleAccess.some(module =>
          subscription.moduleAccess.includes(module)
        );

        // Check if user subscribed to this source
        const hasSourceAccess = subscription.sources.includes(dataPoint.source);

        // Check category filter if specified
        const hasCategoryAccess =
          subscription.categories.length === 0 ||
          subscription.categories.includes(dataPoint.category);

        return hasModuleAccess && hasSourceAccess && hasCategoryAccess;
      });

      if (filteredData.length > 0) {
        try {
          subscription.callback(filteredData);
          subscription.lastUpdate = new Date();
        } catch (error) {
          console.error(
            `Error notifying subscriber ${subscription.id}:`,
            error
          );
        }
      }
    });
  }

  private notifySnapshotSubscribers(snapshot: AdminDashboardSnapshot): void {
    // Snapshot notification logic would be similar to data point notifications
    // but would send the full snapshot to subscribers
  }

  // ====================================================================
  // UTILITY METHODS
  // ====================================================================

  private getHealthStatus(
    metric: string,
    value: number
  ): "healthy" | "warning" | "critical" {
    const thresholds = this.config.alertThresholds[metric];
    if (!thresholds) return "healthy";

    if (value >= thresholds.critical) return "critical";
    if (value >= thresholds.warning) return "warning";
    return "healthy";
  }

  private checkAndCreateAlert(dataPoint: AdminDashboardDataPoint): void {
    const threshold = this.config.alertThresholds[dataPoint.metric];
    if (!threshold) return;

    if (dataPoint.value >= threshold.warning) {
      const severity =
        dataPoint.value >= threshold.critical ? "critical" : "warning";

      const alert: AdminDashboardAlert = {
        id: `alert-${dataPoint.metric}-${Date.now()}`,
        severity,
        source: dataPoint.source,
        metric: dataPoint.metric,
        message: `${dataPoint.metric} is ${severity}: ${dataPoint.value} (threshold: ${threshold[severity]})`,
        value: dataPoint.value,
        threshold: threshold[severity],
        timestamp: dataPoint.timestamp,
        acknowledged: false,
        moduleAccess: dataPoint.moduleAccess,
      };

      this.alerts.set(alert.id, alert);
    }
  }

  private handleAlert(alert: AdminDashboardAlert): void {
    this.alerts.set(alert.id, alert);
  }

  private getRecentData(
    buffer: AdminDashboardDataPoint[],
    timeWindowMs: number
  ): AdminDashboardDataPoint[] {
    const cutoff = new Date(Date.now() - timeWindowMs);
    return buffer.filter(dp => dp.timestamp > cutoff);
  }

  private getLatestMetricValue(
    source: DataSource,
    metric: string
  ): number | null {
    const buffer = this.dataBuffer.get(source) || [];
    const metricData = buffer
      .filter(dp => dp.metric === metric)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return metricData.length > 0 ? metricData[0].value : null;
  }

  private sumMetricValues(
    data: AdminDashboardDataPoint[],
    metric: string,
    filter?: (dp: AdminDashboardDataPoint) => boolean
  ): number {
    return data
      .filter(dp => dp.metric === metric)
      .filter(filter || (() => true))
      .reduce((sum, dp) => sum + dp.value, 0);
  }

  private calculateTrend(
    buffer: AdminDashboardDataPoint[],
    metric: string
  ): number {
    const metricData = buffer
      .filter(dp => dp.metric === metric)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    if (metricData.length < 2) return 0;

    const recent = metricData.slice(-5); // Last 5 points
    const older = metricData.slice(-10, -5); // Previous 5 points

    const recentAvg =
      recent.reduce((sum, dp) => sum + dp.value, 0) / recent.length;
    const olderAvg =
      older.reduce((sum, dp) => sum + dp.value, 0) / older.length;

    return olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
  }

  private calculateSuccessRate(source: DataSource): number {
    const buffer = this.dataBuffer.get(source) || [];
    const executions = buffer.filter(dp => dp.metric === "execution_status");
    if (executions.length === 0) return 100;

    const successes = executions.filter(dp => dp.value === 1).length;
    return (successes / executions.length) * 100;
  }

  private calculateThroughput(source: DataSource): number {
    const buffer = this.dataBuffer.get(source) || [];
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentExecutions = buffer.filter(
      dp => dp.timestamp > oneHourAgo && dp.metric === "execution_status"
    );
    return recentExecutions.length;
  }

  private countUniqueUsers(data: AdminDashboardDataPoint[]): number {
    const userIds = new Set(
      data.map(dp => dp.metadata?.userId).filter(Boolean)
    );
    return userIds.size;
  }

  private calculateUserGrowthRate(buffer: AdminDashboardDataPoint[]): number {
    // Simplified growth rate calculation
    const today = this.countUniqueUsers(
      this.getRecentData(buffer, 24 * 60 * 60 * 1000)
    );
    const yesterday = this.countUniqueUsers(
      this.getRecentData(buffer, 48 * 60 * 60 * 1000).filter(
        dp => dp.timestamp < new Date(Date.now() - 24 * 60 * 60 * 1000)
      )
    );

    return yesterday > 0 ? ((today - yesterday) / yesterday) * 100 : 0;
  }

  private calculateEngagementRate(data: AdminDashboardDataPoint[]): number {
    const engagementEvents = data.filter(
      dp =>
        dp.metadata?.eventType &&
        ["click", "scroll", "interaction"].includes(dp.metadata.eventType)
    );
    const totalEvents = data.length;
    return totalEvents > 0 ? (engagementEvents.length / totalEvents) * 100 : 0;
  }

  private calculateAPIRequestRate(): number {
    const securityBuffer = this.dataBuffer.get("security_compliance") || [];
    const lastMinute = this.getRecentData(securityBuffer, 60 * 1000);
    return lastMinute.filter(dp => dp.metric === "api_request").length;
  }

  private countTodayEvents(buffer: AdminDashboardDataPoint[]): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return buffer.filter(dp => dp.timestamp >= today).length;
  }

  private calculateAggregationLatency(): number {
    // Simplified latency calculation - would measure actual processing time
    return Math.random() * 50 + 10; // Mock: 10-60ms
  }

  private getTotalDataPoints(): number {
    return Array.from(this.dataBuffer.values()).reduce(
      (total, buffer) => total + buffer.length,
      0
    );
  }

  private getMemoryUsageMB(): number {
    // Simplified memory calculation
    return this.getTotalDataPoints() * 0.001; // Rough estimate
  }

  // ====================================================================
  // PUBLIC API METHODS
  // ====================================================================

  /**
   * Get the latest dashboard snapshot
   */
  getLatestSnapshot(): AdminDashboardSnapshot | null {
    return this.latestSnapshot || null;
  }

  /**
   * Get current alerts
   */
  getActiveAlerts(): AdminDashboardAlert[] {
    return Array.from(this.alerts.values()).filter(
      alert => !alert.acknowledged
    );
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, userId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * Get aggregation system status
   */
  getSystemStatus(): {
    isRunning: boolean;
    dataSourcesActive: number;
    subscriptionsActive: number;
    totalDataPoints: number;
    memoryUsageMB: number;
    alertsActive: number;
  } {
    return {
      isRunning: this.isRunning,
      dataSourcesActive: this.dataBuffer.size,
      subscriptionsActive: Array.from(this.subscriptions.values()).filter(
        s => s.active
      ).length,
      totalDataPoints: this.getTotalDataPoints(),
      memoryUsageMB: this.getMemoryUsageMB(),
      alertsActive: this.getActiveAlerts().length,
    };
  }

  /**
   * Force immediate data aggregation (useful for testing)
   */
  async forceAggregation(): Promise<AdminDashboardSnapshot> {
    await this.aggregateData();
    return this.latestSnapshot!;
  }
}

// ====================================================================
// FACTORY FUNCTION
// ====================================================================

export function createAdminDashboardDataAggregator(
  config?: Partial<DataAggregationConfig>
): AdminDashboardDataAggregator {
  return new AdminDashboardDataAggregator(config);
}

// Default instance for global use
export const adminDashboardDataAggregator =
  createAdminDashboardDataAggregator();
