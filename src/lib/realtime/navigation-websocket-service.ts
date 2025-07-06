/**
 * Navigation WebSocket Service
 * Provides real-time navigation path updates based on user behavior changes
 */

import { NavigationRecommendation } from "@/lib/analytics/ml-navigation-types";

export interface NavigationUpdateEvent {
  type: "navigation_update";
  sessionId: string;
  userId?: string;
  currentPage: string;
  recommendations: NavigationRecommendation[];
  timestamp: string;
  trigger:
    | "behavior_change"
    | "page_change"
    | "time_threshold"
    | "manual_refresh";
}

export interface UserBehaviorEvent {
  type: "user_behavior";
  sessionId: string;
  userId?: string;
  currentPage: string;
  behaviorType: "click" | "scroll" | "form_interaction" | "search" | "idle";
  data: Record<string, any>;
  timestamp: string;
}

export interface WebSocketErrorEvent {
  type: string;
  target: {
    readyState: number;
    url: string;
  } | null;
  timestamp: string;
}

export interface WebSocketConfig {
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  behaviorThresholds: {
    significantScrollDepth: number;
    timeOnPageThreshold: number;
    clickCountThreshold: number;
    idleTimeout: number;
  };
}

interface ConnectionState {
  isConnected: boolean;
  reconnectAttempts: number;
  lastHeartbeat: number;
  connectionId?: string;
}

export class NavigationWebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private connectionState: ConnectionState;
  private eventListeners: Map<string, Set<(event: any) => void>>;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private behaviorBuffer: UserBehaviorEvent[] = [];
  private lastBehaviorFlush = Date.now();

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      behaviorThresholds: {
        significantScrollDepth: 50,
        timeOnPageThreshold: 30000,
        clickCountThreshold: 5,
        idleTimeout: 60000,
      },
      ...config,
    };

    this.connectionState = {
      isConnected: false,
      reconnectAttempts: 0,
      lastHeartbeat: 0,
    };

    this.eventListeners = new Map();
  }

  /**
   * Initialize WebSocket connection
   */
  async connect(sessionId: string, userId?: string): Promise<void> {
    if (this.ws && this.connectionState.isConnected) {
      return;
    }

    try {
      // First, check if WebSocket endpoint is available
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/ws/navigation?sessionId=${sessionId}${userId ? `&userId=${userId}` : ""}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);

      // Set up heartbeat
      this.startHeartbeat();

      // Set a timeout to fall back to polling if WebSocket doesn't connect
      setTimeout(() => {
        if (!this.connectionState.isConnected) {
          console.warn(
            "WebSocket connection timeout, falling back to polling mode"
          );
          this.enablePollingFallback(sessionId, userId);
        }
      }, 5000);
    } catch (error) {
      console.error(
        "Failed to initialize WebSocket connection, enabling polling fallback:",
        error
      );
      this.enablePollingFallback(sessionId, userId);
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.connectionState.isConnected = false;
  }

  /**
   * Subscribe to navigation updates
   */
  onNavigationUpdate(
    callback: (event: NavigationUpdateEvent) => void
  ): () => void {
    return this.addEventListener("navigation_update", callback);
  }

  /**
   * Subscribe to connection state changes
   */
  onConnectionStateChange(
    callback: (isConnected: boolean) => void
  ): () => void {
    return this.addEventListener("connection_state", callback);
  }

  /**
   * Subscribe to WebSocket errors
   */
  onWebSocketError(callback: (error: WebSocketErrorEvent) => void): () => void {
    return this.addEventListener("websocket_error", callback);
  }

  /**
   * Send user behavior event
   */
  sendBehaviorEvent(event: Omit<UserBehaviorEvent, "timestamp">): void {
    const behaviorEvent: UserBehaviorEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    // Buffer behavior events to avoid overwhelming the server
    this.behaviorBuffer.push(behaviorEvent);

    // Check if we should flush the buffer
    if (this.shouldFlushBehaviorBuffer()) {
      this.flushBehaviorBuffer();
    }
  }

  /**
   * Request immediate navigation update
   */
  requestNavigationUpdate(currentPage: string, force = false): void {
    if (!this.connectionState.isConnected) {
      console.warn("Cannot request navigation update: WebSocket not connected");
      return;
    }

    this.sendMessage({
      type: "request_navigation_update",
      currentPage,
      force,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get connection state
   */
  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  // Private methods

  private handleOpen(_event: Event): void {
    console.log("Navigation WebSocket connected");
    this.connectionState.isConnected = true;
    this.connectionState.reconnectAttempts = 0;
    this.connectionState.lastHeartbeat = Date.now();

    this.emit("connection_state", true);
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "navigation_update":
          this.emit("navigation_update", data as NavigationUpdateEvent);
          break;
        case "heartbeat_response":
          this.connectionState.lastHeartbeat = Date.now();
          break;
        case "connection_established":
          this.connectionState.connectionId = data.connectionId;
          break;
        default:
          console.log("Unknown WebSocket message type:", data.type);
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log("Navigation WebSocket disconnected:", event.code, event.reason);
    this.connectionState.isConnected = false;
    this.emit("connection_state", false);

    // Attempt reconnection if not a clean close
    if (
      event.code !== 1000 &&
      this.connectionState.reconnectAttempts < this.config.maxReconnectAttempts
    ) {
      this.scheduleReconnect();
    }
  }

  private handleError(_event: Event): void {
    // Handle WebSocket error events
    console.log("Event type:", _event.type);
    console.log("Event target:", _event.target);
    // Extract more detailed error information
    const errorDetails = {
      type: _event.type,
      target: _event.target
        ? {
            readyState: (_event.target as WebSocket).readyState,
            url: (_event.target as WebSocket).url,
          }
        : null,
      timestamp: new Date().toISOString(),
    };

    console.error("Navigation WebSocket error:", errorDetails);

    // Also emit this as an event for components to handle
    this.emit("websocket_error", errorDetails);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.connectionState.isConnected) {
        this.sendMessage({
          type: "heartbeat",
          timestamp: new Date().toISOString(),
        });

        // Check if we've missed heartbeats
        const timeSinceLastHeartbeat =
          Date.now() - this.connectionState.lastHeartbeat;
        if (timeSinceLastHeartbeat > this.config.heartbeatInterval * 2) {
          console.warn("Heartbeat timeout, reconnecting...");
          this.disconnect();
          this.scheduleReconnect();
        }
      }
    }, this.config.heartbeatInterval);
  }

  private scheduleReconnect(): void {
    if (
      this.connectionState.reconnectAttempts >= this.config.maxReconnectAttempts
    ) {
      console.error("Max reconnection attempts reached");
      return;
    }

    const delay =
      this.config.reconnectInterval *
      Math.pow(2, this.connectionState.reconnectAttempts);
    this.connectionState.reconnectAttempts++;

    console.log(
      `Scheduling reconnection attempt ${this.connectionState.reconnectAttempts} in ${delay}ms`
    );

    this.reconnectTimer = setTimeout(() => {
      if (!this.connectionState.isConnected) {
        // This would need the original connection parameters
        // In a real implementation, we'd store these
        console.log("Attempting to reconnect...");
      }
    }, delay);
  }

  private sendMessage(message: any): void {
    if (this.ws && this.connectionState.isConnected) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private shouldFlushBehaviorBuffer(): boolean {
    const bufferSize = this.behaviorBuffer.length;
    const timeSinceLastFlush = Date.now() - this.lastBehaviorFlush;

    return (
      bufferSize >= 10 || // Buffer size threshold
      timeSinceLastFlush >= 5000 || // Time threshold (5 seconds)
      this.behaviorBuffer.some(event => this.isSignificantBehavior(event))
    );
  }

  private flushBehaviorBuffer(): void {
    if (this.behaviorBuffer.length === 0) return;

    this.sendMessage({
      type: "behavior_batch",
      events: this.behaviorBuffer,
      timestamp: new Date().toISOString(),
    });

    this.behaviorBuffer = [];
    this.lastBehaviorFlush = Date.now();
  }

  private isSignificantBehavior(event: UserBehaviorEvent): boolean {
    switch (event.behaviorType) {
      case "scroll":
        return (
          event.data.scrollDepth >=
          this.config.behaviorThresholds.significantScrollDepth
        );
      case "click":
        return true; // All clicks are significant
      case "form_interaction":
        return true; // Form interactions are significant
      case "search":
        return true; // Search queries are significant
      default:
        return false;
    }
  }

  private addEventListener(
    eventType: string,
    callback: (event: any) => void
  ): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }

    const listeners = this.eventListeners.get(eventType)!;
    listeners.add(callback);

    // Return unsubscribe function
    return () => {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.eventListeners.delete(eventType);
      }
    };
  }

  private emit(eventType: string, data: any): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
    }
  }

  private enablePollingFallback(sessionId: string, userId?: string): void {
    console.log("Enabling polling fallback for navigation updates");
    this.connectionState.isConnected = true; // Mark as "connected" for fallback mode
    this.emit("connection_state", true);

    // Set up periodic polling instead of WebSocket
    this.heartbeatTimer = setInterval(() => {
      this.emit("navigation_update", {
        type: "navigation_update",
        sessionId,
        userId,
        currentPage: window.location.pathname,
        recommendations: [], // Empty for now, could fetch from API
        timestamp: new Date().toISOString(),
        trigger: "polling_fallback",
      });
    }, 10000); // Poll every 10 seconds
  }
}

// Singleton instance
export const navigationWebSocketService = new NavigationWebSocketService();
