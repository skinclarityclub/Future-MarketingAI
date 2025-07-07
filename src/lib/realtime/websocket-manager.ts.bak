/**
 * WebSocket Manager for Marketing Control Center Real-Time Updates
 * Handles real-time data streaming for dashboards, workflows, and metrics
 */

import {
  RealTimeMetrics,
  WorkflowExecution,
  QueueItem,
  Alert,
  PlatformStatus,
  Platform,
} from "@/lib/types/marketing-control-center";

// ====================================================================
// WEBSOCKET MANAGER CLASS
// ====================================================================

export interface WebSocketConfig {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  enableLogging?: boolean;
}

export interface RealTimeUpdate {
  type: "metrics" | "workflow" | "queue" | "alert" | "platform" | "system";
  action: "create" | "update" | "delete" | "status_change";
  data: any;
  timestamp: Date;
  source: string;
}

export type WebSocketEventHandler = (update: RealTimeUpdate) => void;

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private isConnecting = false;
  private eventHandlers = new Map<string, WebSocketEventHandler[]>();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  private config: Required<WebSocketConfig> = {
    url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8080/ws",
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000,
    enableLogging: true,
  };

  constructor(config?: WebSocketConfig) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  // ====================================================================
  // CONNECTION MANAGEMENT
  // ====================================================================

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        return;
      }

      this.isConnecting = true;
      this.log("Attempting to connect to WebSocket...");

      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          this.log("WebSocket connected successfully");
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit("connection", {
            type: "system",
            action: "create",
            data: { status: "connected" },
            timestamp: new Date(),
            source: "websocket",
          });
          resolve();
        };

        this.ws.onmessage = event => {
          try {
            const update: RealTimeUpdate = JSON.parse(event.data);
            update.timestamp = new Date(update.timestamp);
            this.handleMessage(update);
          } catch (error) {
            this.log("Error parsing WebSocket message:", error);
          }
        };

        this.ws.onclose = event => {
          this.log("WebSocket connection closed:", event.code, event.reason);
          this.isConnecting = false;
          this.stopHeartbeat();
          this.emit("connection", {
            type: "system",
            action: "delete",
            data: {
              status: "disconnected",
              code: event.code,
              reason: event.reason,
            },
            timestamp: new Date(),
            source: "websocket",
          });

          if (
            !event.wasClean &&
            this.reconnectAttempts < this.config.maxReconnectAttempts
          ) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = error => {
          this.log("WebSocket error:", error);
          this.isConnecting = false;
          this.emit("connection", {
            type: "system",
            action: "update",
            data: { status: "error", error },
            timestamp: new Date(),
            source: "websocket",
          });
          reject(error);
        };
      } catch (error) {
        this.log("Failed to create WebSocket connection:", error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  public disconnect(): void {
    this.log("Disconnecting WebSocket...");
    this.stopHeartbeat();
    this.clearReconnectTimeout();

    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // ====================================================================
  // EVENT HANDLING
  // ====================================================================

  public on(eventType: string, handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  public off(eventType: string, handler: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(eventType: string, update: RealTimeUpdate): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(update);
        } catch (error) {
          this.log("Error in event handler:", error);
        }
      });
    }

    // Also emit to 'all' handlers
    const allHandlers = this.eventHandlers.get("all");
    if (allHandlers) {
      allHandlers.forEach(handler => {
        try {
          handler(update);
        } catch (error) {
          this.log("Error in all event handler:", error);
        }
      });
    }
  }

  private handleMessage(update: RealTimeUpdate): void {
    this.log("Received update:", update.type, update.action);
    this.emit(update.type, update);
  }

  // ====================================================================
  // HEARTBEAT & RECONNECTION
  // ====================================================================

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: "ping", timestamp: new Date() });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    this.clearReconnectTimeout();
    this.reconnectAttempts++;

    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000
    );

    this.log(
      `Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`
    );

    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch(error => {
        this.log("Reconnect attempt failed:", error);
      });
    }, delay);
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  // ====================================================================
  // MESSAGING
  // ====================================================================

  public send(data: any): void {
    if (this.isConnected() && this.ws) {
      try {
        this.ws.send(JSON.stringify(data));
      } catch (error) {
        this.log("Error sending message:", error);
      }
    } else {
      this.log("Cannot send message: WebSocket not connected");
    }
  }

  // ====================================================================
  // SPECIFIC UPDATE METHODS
  // ====================================================================

  public subscribeToMetrics(handler: (metrics: RealTimeMetrics) => void): void {
    this.on("metrics", update => {
      if (update.action === "update" && update.data) {
        handler(update.data);
      }
    });
  }

  public subscribeToWorkflows(
    handler: (workflows: WorkflowExecution[]) => void
  ): void {
    this.on("workflow", update => {
      if (update.data) {
        handler(Array.isArray(update.data) ? update.data : [update.data]);
      }
    });
  }

  public subscribeToQueue(handler: (queue: QueueItem[]) => void): void {
    this.on("queue", update => {
      if (update.data) {
        handler(Array.isArray(update.data) ? update.data : [update.data]);
      }
    });
  }

  public subscribeToAlerts(handler: (alerts: Alert[]) => void): void {
    this.on("alert", update => {
      if (update.data) {
        handler(Array.isArray(update.data) ? update.data : [update.data]);
      }
    });
  }

  public subscribeToPlatformStatus(
    handler: (status: Record<Platform, PlatformStatus>) => void
  ): void {
    this.on("platform", update => {
      if (update.action === "update" && update.data) {
        handler(update.data);
      }
    });
  }

  public subscribeToConnection(handler: (connected: boolean) => void): void {
    this.on("connection", update => {
      if (update.data?.status) {
        handler(update.data.status === "connected");
      }
    });
  }

  // ====================================================================
  // UTILITY METHODS
  // ====================================================================

  private log(...args: any[]): void {
    if (this.config.enableLogging) {
      console.log("[WebSocketManager]", ...args);
    }
  }

  public getConnectionInfo(): {
    connected: boolean;
    reconnectAttempts: number;
    url: string;
  } {
    return {
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      url: this.config.url,
    };
  }
}

// ====================================================================
// SINGLETON INSTANCE
// ====================================================================

let wsManager: WebSocketManager | null = null;

export function getWebSocketManager(
  config?: WebSocketConfig
): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager(config);
  }
  return wsManager;
}

// ====================================================================
// MOCK DATA GENERATOR (FOR DEVELOPMENT)
// ====================================================================

export class MockWebSocketManager extends WebSocketManager {
  private intervals: NodeJS.Timeout[] = [];

  constructor(config?: WebSocketConfig) {
    super(config);
  }

  public connect(): Promise<void> {
    this.log("Mock WebSocket Manager - simulating connection...");

    // Simulate connection after 1 second
    return new Promise(resolve => {
      setTimeout(() => {
        this.simulateRealTimeUpdates();
        this.emit("connection", {
          type: "system",
          action: "create",
          data: { status: "connected" },
          timestamp: new Date(),
          source: "mock",
        });
        resolve();
      }, 1000);
    });
  }

  public disconnect(): void {
    this.log("Mock WebSocket Manager - disconnecting...");
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];

    this.emit("connection", {
      type: "system",
      action: "delete",
      data: { status: "disconnected" },
      timestamp: new Date(),
      source: "mock",
    });
  }

  public isConnected(): boolean {
    return this.intervals.length > 0;
  }

  private simulateRealTimeUpdates(): void {
    // Simulate metrics updates every 10 seconds
    const metricsInterval = setInterval(() => {
      const mockMetrics: RealTimeMetrics = {
        activeUsers: Math.floor(Math.random() * 20) + 5,
        postsPublishedToday: Math.floor(Math.random() * 100) + 20,
        totalEngagementToday: Math.floor(Math.random() * 20000) + 5000,
        averageResponseTime: Math.floor(Math.random() * 300) + 50,
        successRate: 95 + Math.random() * 5,
        queueSize: Math.floor(Math.random() * 15),
        aiRecommendationsGenerated: Math.floor(Math.random() * 50) + 10,
        revenueToday: Math.floor(Math.random() * 5000) + 1000,
      };

      this.emit("metrics", {
        type: "metrics",
        action: "update",
        data: mockMetrics,
        timestamp: new Date(),
        source: "mock",
      });
    }, 10000);

    // Simulate workflow updates every 15 seconds
    const workflowInterval = setInterval(() => {
      const workflows = this.generateMockWorkflows();
      this.emit("workflow", {
        type: "workflow",
        action: "update",
        data: workflows,
        timestamp: new Date(),
        source: "mock",
      });
    }, 15000);

    // Simulate queue updates every 20 seconds
    const queueInterval = setInterval(() => {
      const queue = this.generateMockQueue();
      this.emit("queue", {
        type: "queue",
        action: "update",
        data: queue,
        timestamp: new Date(),
        source: "mock",
      });
    }, 20000);

    // Simulate random alerts every 30-60 seconds
    const alertInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const alert = this.generateMockAlert();
        this.emit("alert", {
          type: "alert",
          action: "create",
          data: alert,
          timestamp: new Date(),
          source: "mock",
        });
      }
    }, 45000);

    this.intervals.push(
      metricsInterval,
      workflowInterval,
      queueInterval,
      alertInterval
    );
  }

  private generateMockWorkflows(): WorkflowExecution[] {
    const workflows = [
      "Content Generation Pipeline",
      "Analytics Data Sync",
      "Social Media Scheduler",
      "Competitor Analysis",
      "Lead Generation Bot",
    ];

    return workflows
      .slice(0, Math.floor(Math.random() * 3) + 1)
      .map((name, index) => ({
        id: `wf-${Date.now()}-${index}`,
        workflowId: name.toLowerCase().replace(/\s+/g, "-"),
        workflowName: name,
        executionId: `exec-${Date.now()}-${index}`,
        status:
          Math.random() > 0.3
            ? "running"
            : Math.random() > 0.5
              ? "success"
              : "failed",
        startTime: new Date(Date.now() - Math.random() * 3600000),
        endTime: Math.random() > 0.5 ? new Date() : undefined,
        inputData: {},
        metadata: {
          triggeredBy: Math.random() > 0.5 ? "schedule" : "user",
          priority: Math.random() > 0.5 ? "high" : "medium",
          tags: [],
          retryCount: 0,
          maxRetries: 3,
        },
      }));
  }

  private generateMockQueue(): QueueItem[] {
    const platforms: Platform[] = [
      "instagram",
      "linkedin",
      "twitter",
      "facebook",
      "tiktok",
    ];
    const types = ["publish", "analyze", "optimize"];

    return Array.from(
      { length: Math.floor(Math.random() * 5) + 1 },
      (_, index) => ({
        id: `queue-${Date.now()}-${index}`,
        type: types[Math.floor(Math.random() * types.length)] as any,
        contentId: `content-${index}`,
        platform: platforms[Math.floor(Math.random() * platforms.length)],
        scheduledTime: new Date(Date.now() + Math.random() * 86400000),
        priority: Math.random() > 0.5 ? "high" : "medium",
        status: Math.random() > 0.7 ? "processing" : "waiting",
        retryCount: 0,
        estimatedDuration: Math.floor(Math.random() * 60000) + 30000,
      })
    );
  }

  private generateMockAlert(): Alert {
    const types = ["warning", "error", "info", "success"];
    const severities = ["low", "medium", "high"];
    const platforms: Platform[] = [
      "instagram",
      "linkedin",
      "twitter",
      "facebook",
    ];

    return {
      id: `alert-${Date.now()}`,
      type: types[Math.floor(Math.random() * types.length)] as any,
      severity: severities[
        Math.floor(Math.random() * severities.length)
      ] as any,
      title: "System Alert",
      message: "This is a mock alert for testing real-time updates",
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      actionRequired: Math.random() > 0.7,
      createdAt: new Date(),
    };
  }
}

// Development helper
export function getMockWebSocketManager(
  config?: WebSocketConfig
): MockWebSocketManager {
  return new MockWebSocketManager(config);
}
