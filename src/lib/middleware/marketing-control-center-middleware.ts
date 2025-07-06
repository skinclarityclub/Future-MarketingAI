// Marketing Control Center - Middleware Layer
// Task 80.3: Central middleware for connecting all marketing modules

import { NextRequest, NextResponse } from "next/server";
import {
  ControlCenterState,
  WorkflowExecution,
  ContentPost,
  Platform,
  Alert,
  APIResponse,
  QueueItem,
  PlatformStatus,
} from "@/lib/types/marketing-control-center";

// ====================================================================
// 1. MAIN CONTROL CENTER MIDDLEWARE
// ====================================================================

export class MarketingControlCenterMiddleware {
  private static instance: MarketingControlCenterMiddleware;
  private controlCenterState: ControlCenterState;
  private activeConnections: Map<string, WebSocket> = new Map();
  private moduleRegistry: Map<string, MarketingModule> = new Map();

  private constructor() {
    this.controlCenterState = this.initializeControlCenterState();
    this.setupEventListeners();
    console.log("[ControlCenter] Middleware initialized");
  }

  public static getInstance(): MarketingControlCenterMiddleware {
    if (!MarketingControlCenterMiddleware.instance) {
      MarketingControlCenterMiddleware.instance =
        new MarketingControlCenterMiddleware();
    }
    return MarketingControlCenterMiddleware.instance;
  }

  // Initialize control center state
  private initializeControlCenterState(): ControlCenterState {
    return {
      systemHealth: {
        overall: "healthy",
        uptime: Date.now(),
        apiConnectivity: {},
        databaseHealth: "healthy",
        queueHealth: 100,
        errorRate: 0,
      },
      activeWorkflows: [],
      publishingQueue: [],
      realTimeMetrics: {
        activeUsers: 0,
        postsPublishedToday: 0,
        totalEngagementToday: 0,
        averageResponseTime: 0,
        successRate: 100,
        queueSize: 0,
        aiRecommendationsGenerated: 0,
        revenueToday: 0,
      },
      platformStatus: this.initializePlatformStatus(),
      activeAlerts: [],
      recentNotifications: [],
      selectedModule: undefined,
      activeFilters: {
        platforms: [],
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: new Date(),
        },
        status: [],
        contentTypes: [],
        campaigns: [],
        sortBy: "createdAt",
        sortOrder: "desc",
      },
      viewMode: "overview",
      lastUpdated: new Date(),
      autoRefresh: true,
      refreshInterval: 30000,
    };
  }

  private initializePlatformStatus(): Record<Platform, PlatformStatus> {
    const platforms: Platform[] = [
      "instagram",
      "tiktok",
      "linkedin",
      "twitter",
      "facebook",
      "youtube",
      "pinterest",
      "email",
      "blog",
    ];

    const status: Record<Platform, PlatformStatus> = {} as Record<
      Platform,
      PlatformStatus
    >;

    platforms.forEach(platform => {
      status[platform] = {
        platform,
        isConnected: false,
        isActive: false,
        lastSync: new Date(),
        rateLimitRemaining: 100,
        apiLatency: 0,
        errorCount: 0,
        queuedPosts: 0,
      };
    });

    return status;
  }

  // ====================================================================
  // 2. MODULE REGISTRATION & MANAGEMENT
  // ====================================================================

  public registerModule(module: MarketingModule): void {
    this.moduleRegistry.set(module.id, module);
    console.log(`[ControlCenter] Registered module: ${module.name}`);

    // Initialize module state
    module.initialize(this);

    // Update system metrics
    this.updateSystemMetrics();
  }

  public getModule(moduleId: string): MarketingModule | undefined {
    return this.moduleRegistry.get(moduleId);
  }

  public getAllModules(): MarketingModule[] {
    return Array.from(this.moduleRegistry.values());
  }

  // ====================================================================
  // 3. WORKFLOW ORCHESTRATION
  // ====================================================================

  public async executeWorkflow(
    workflowId: string,
    inputData: Record<string, any>
  ): Promise<APIResponse<WorkflowExecution>> {
    try {
      const execution: WorkflowExecution = {
        id: this.generateId(),
        workflowId,
        workflowName: `Workflow-${workflowId}`,
        executionId: this.generateId(),
        status: "running",
        startTime: new Date(),
        inputData,
        metadata: {
          triggeredBy: "user",
          priority: "medium",
          tags: [],
          retryCount: 0,
          maxRetries: 3,
        },
      };

      // Add to active workflows
      this.controlCenterState.activeWorkflows.push(execution);

      // Notify all connected clients
      this.broadcastUpdate("workflow-started", execution);

      // Execute workflow logic
      const result = await this.processWorkflow(execution);

      return {
        success: true,
        data: result,
        metadata: {
          timestamp: new Date(),
          requestId: execution.id,
          duration: Date.now() - execution.startTime.getTime(),
        },
      };
    } catch (error) {
      console.error("[ControlCenter] Workflow execution failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        metadata: {
          timestamp: new Date(),
          requestId: this.generateId(),
          duration: 0,
        },
      };
    }
  }

  private async processWorkflow(
    execution: WorkflowExecution
  ): Promise<WorkflowExecution> {
    // Simulate workflow processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    execution.status = "success";
    execution.endTime = new Date();
    execution.duration =
      execution.endTime.getTime() - execution.startTime.getTime();
    execution.outputData = { result: "success", processed: true };

    // Update workflow in state
    const index = this.controlCenterState.activeWorkflows.findIndex(
      w => w.id === execution.id
    );
    if (index !== -1) {
      this.controlCenterState.activeWorkflows[index] = execution;
    }

    // Broadcast update
    this.broadcastUpdate("workflow-completed", execution);

    return execution;
  }

  // ====================================================================
  // 4. CONTENT PUBLISHING QUEUE
  // ====================================================================

  public async addToPublishingQueue(
    contentPost: ContentPost,
    scheduledTime?: Date
  ): Promise<APIResponse<QueueItem>> {
    try {
      const queueItem: QueueItem = {
        id: this.generateId(),
        type: "publish",
        contentId: contentPost.id,
        platform: contentPost.targetPlatforms[0], // Use first platform
        scheduledTime: scheduledTime || new Date(),
        priority: "medium",
        status: "waiting",
        retryCount: 0,
        estimatedDuration: 30000, // 30 seconds
      };

      // Add to queue
      this.controlCenterState.publishingQueue.push(queueItem);

      // Update metrics
      this.controlCenterState.realTimeMetrics.queueSize =
        this.controlCenterState.publishingQueue.length;

      // Process queue
      this.processPublishingQueue();

      return {
        success: true,
        data: queueItem,
        metadata: {
          timestamp: new Date(),
          requestId: queueItem.id,
          duration: 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to queue content",
        metadata: {
          timestamp: new Date(),
          requestId: this.generateId(),
          duration: 0,
        },
      };
    }
  }

  private async processPublishingQueue(): Promise<void> {
    const pendingItems = this.controlCenterState.publishingQueue.filter(
      item => item.status === "waiting" && item.scheduledTime <= new Date()
    );

    for (const item of pendingItems) {
      await this.processQueueItem(item);
    }
  }

  private async processQueueItem(item: QueueItem): Promise<void> {
    try {
      item.status = "processing";
      this.broadcastUpdate("queue-item-processing", item);

      // Simulate publishing
      await new Promise(resolve => setTimeout(resolve, item.estimatedDuration));

      item.status = "completed";
      this.controlCenterState.realTimeMetrics.postsPublishedToday++;

      this.broadcastUpdate("queue-item-completed", item);
    } catch (error) {
      item.status = "failed";
      item.retryCount++;

      this.addAlert({
        id: this.generateId(),
        type: "error",
        severity: "medium",
        title: "Publishing Failed",
        message: `Failed to publish content to ${item.platform}`,
        platform: item.platform,
        actionRequired: true,
        createdAt: new Date(),
      });
    }
  }

  // ====================================================================
  // 5. REAL-TIME COMMUNICATION
  // ====================================================================

  public addConnection(connectionId: string, ws: any): void {
    this.activeConnections.set(connectionId, ws);

    // Send current state to new connection
    this.sendToConnection(connectionId, {
      type: "state-update",
      data: this.controlCenterState,
    });
  }

  public removeConnection(connectionId: string): void {
    this.activeConnections.delete(connectionId);
  }

  private broadcastUpdate(type: string, data: any): void {
    const message = JSON.stringify({ type, data, timestamp: new Date() });

    this.activeConnections.forEach((ws, connectionId) => {
      try {
        if (ws.readyState === 1) {
          // WebSocket.OPEN
          ws.send(message);
        } else {
          this.activeConnections.delete(connectionId);
        }
      } catch (error) {
        console.error(`Failed to send to connection ${connectionId}:`, error);
        this.activeConnections.delete(connectionId);
      }
    });
  }

  private sendToConnection(connectionId: string, message: any): void {
    const ws = this.activeConnections.get(connectionId);
    if (ws && ws.readyState === 1) {
      // WebSocket.OPEN
      ws.send(JSON.stringify(message));
    }
  }

  // ====================================================================
  // 6. ALERT & NOTIFICATION SYSTEM
  // ====================================================================

  public addAlert(alert: Alert): void {
    this.controlCenterState.activeAlerts.push(alert);

    // Keep only last 50 alerts
    if (this.controlCenterState.activeAlerts.length > 50) {
      this.controlCenterState.activeAlerts =
        this.controlCenterState.activeAlerts.slice(-50);
    }

    this.broadcastUpdate("new-alert", alert);
  }

  public resolveAlert(alertId: string): void {
    const alert = this.controlCenterState.activeAlerts.find(
      a => a.id === alertId
    );
    if (alert) {
      alert.resolvedAt = new Date();
      this.broadcastUpdate("alert-resolved", alert);
    }
  }

  // ====================================================================
  // 7. PLATFORM MANAGEMENT
  // ====================================================================

  public updatePlatformStatus(
    platform: Platform,
    status: Partial<PlatformStatus>
  ): void {
    this.controlCenterState.platformStatus[platform] = {
      ...this.controlCenterState.platformStatus[platform],
      ...status,
    };

    this.broadcastUpdate("platform-status-updated", {
      platform,
      status: this.controlCenterState.platformStatus[platform],
    });
  }

  public async testPlatformConnection(platform: Platform): Promise<boolean> {
    try {
      // Simulate platform connection test
      await new Promise(resolve => setTimeout(resolve, 1000));

      const isConnected = Math.random() > 0.1; // 90% success rate

      this.updatePlatformStatus(platform, {
        isConnected,
        lastSync: new Date(),
        apiLatency: Math.random() * 200 + 50, // 50-250ms
      });

      return isConnected;
    } catch (error) {
      this.updatePlatformStatus(platform, {
        isConnected: false,
        errorCount:
          this.controlCenterState.platformStatus[platform].errorCount + 1,
      });
      return false;
    }
  }

  // ====================================================================
  // 8. SYSTEM MONITORING
  // ====================================================================

  private setupEventListeners(): void {
    // Auto-refresh system metrics every 30 seconds
    setInterval(() => {
      this.updateSystemMetrics();
    }, 30000);

    // Process publishing queue every 10 seconds
    setInterval(() => {
      this.processPublishingQueue();
    }, 10000);

    // Clean up old data every hour
    setInterval(() => {
      this.cleanupOldData();
    }, 3600000);
  }

  private updateSystemMetrics(): void {
    const now = new Date();

    // Update uptime
    this.controlCenterState.systemHealth.uptime = now.getTime();

    // Update queue health
    const queueSize = this.controlCenterState.publishingQueue.length;
    this.controlCenterState.systemHealth.queueHealth = Math.max(
      0,
      100 - queueSize * 2
    );

    // Update error rate
    const totalAlerts = this.controlCenterState.activeAlerts.length;
    const errorAlerts = this.controlCenterState.activeAlerts.filter(
      a => a.type === "error"
    ).length;
    this.controlCenterState.systemHealth.errorRate =
      totalAlerts > 0 ? (errorAlerts / totalAlerts) * 100 : 0;

    // Update overall health
    const healthMetrics = [
      this.controlCenterState.systemHealth.queueHealth,
      100 - this.controlCenterState.systemHealth.errorRate,
      this.controlCenterState.systemHealth.databaseHealth === "healthy"
        ? 100
        : 50,
    ];
    const averageHealth =
      healthMetrics.reduce((a, b) => a + b, 0) / healthMetrics.length;

    this.controlCenterState.systemHealth.overall =
      averageHealth > 80
        ? "healthy"
        : averageHealth > 50
          ? "warning"
          : "critical";

    // Update last updated time
    this.controlCenterState.lastUpdated = now;

    // Broadcast metrics update
    this.broadcastUpdate(
      "metrics-updated",
      this.controlCenterState.realTimeMetrics
    );
  }

  private cleanupOldData(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Clean old workflows
    this.controlCenterState.activeWorkflows =
      this.controlCenterState.activeWorkflows.filter(w =>
        w.endTime ? w.endTime > oneDayAgo : w.startTime > oneDayAgo
      );

    // Clean completed queue items
    this.controlCenterState.publishingQueue =
      this.controlCenterState.publishingQueue.filter(
        item => item.status !== "completed" || item.scheduledTime > oneDayAgo
      );

    // Clean old notifications
    this.controlCenterState.recentNotifications =
      this.controlCenterState.recentNotifications.filter(
        n => n.createdAt > oneDayAgo
      );
  }

  // ====================================================================
  // 9. API ENDPOINTS
  // ====================================================================

  public getControlCenterState(): ControlCenterState {
    return { ...this.controlCenterState };
  }

  public updateFilters(
    filters: Partial<typeof this.controlCenterState.activeFilters>
  ): void {
    this.controlCenterState.activeFilters = {
      ...this.controlCenterState.activeFilters,
      ...filters,
    };

    this.broadcastUpdate(
      "filters-updated",
      this.controlCenterState.activeFilters
    );
  }

  public setViewMode(mode: "overview" | "detailed" | "modules"): void {
    this.controlCenterState.viewMode = mode;
    this.broadcastUpdate("view-mode-changed", mode);
  }

  public selectModule(moduleId?: string): void {
    this.controlCenterState.selectedModule = moduleId;
    this.broadcastUpdate("module-selected", moduleId);
  }

  // ====================================================================
  // 10. UTILITY METHODS
  // ====================================================================

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ====================================================================
// 11. MARKETING MODULE INTERFACE
// ====================================================================

export interface MarketingModule {
  id: string;
  name: string;
  version: string;
  description: string;
  capabilities: string[];
  isActive: boolean;

  // Lifecycle methods
  initialize(controlCenter: MarketingControlCenterMiddleware): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;

  // Data methods
  getData(filters?: any): Promise<any>;
  updateData(data: any): Promise<void>;

  // Event handling
  handleEvent(event: string, data: any): Promise<void>;

  // Health check
  healthCheck(): Promise<boolean>;
}

// ====================================================================
// 12. MIDDLEWARE INTEGRATION HELPERS
// ====================================================================

export function createControlCenterAPI() {
  const controlCenter = MarketingControlCenterMiddleware.getInstance();

  return {
    // State management
    getState: () => controlCenter.getControlCenterState(),
    updateFilters: (filters: any) => controlCenter.updateFilters(filters),
    setViewMode: (mode: "overview" | "detailed" | "modules") =>
      controlCenter.setViewMode(mode),
    selectModule: (moduleId?: string) => controlCenter.selectModule(moduleId),

    // Workflow management
    executeWorkflow: (workflowId: string, data: any) =>
      controlCenter.executeWorkflow(workflowId, data),

    // Publishing management
    addToQueue: (content: ContentPost, scheduledTime?: Date) =>
      controlCenter.addToPublishingQueue(content, scheduledTime),

    // Platform management
    testConnection: (platform: Platform) =>
      controlCenter.testPlatformConnection(platform),
    updatePlatformStatus: (platform: Platform, status: any) =>
      controlCenter.updatePlatformStatus(platform, status),

    // Alert management
    addAlert: (alert: Alert) => controlCenter.addAlert(alert),
    resolveAlert: (alertId: string) => controlCenter.resolveAlert(alertId),

    // Module management
    registerModule: (module: MarketingModule) =>
      controlCenter.registerModule(module),
    getModule: (moduleId: string) => controlCenter.getModule(moduleId),
    getAllModules: () => controlCenter.getAllModules(),

    // Real-time connections
    addConnection: (id: string, ws: any) => controlCenter.addConnection(id, ws),
    removeConnection: (id: string) => controlCenter.removeConnection(id),
  };
}

// Export singleton instance
export const controlCenterAPI = createControlCenterAPI();
export default MarketingControlCenterMiddleware;
