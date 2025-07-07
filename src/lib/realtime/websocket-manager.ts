// Stub version of WebSocket Manager (original temporarily disabled)
export interface WebSocketConfig {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  timeout?: number;
  debug?: boolean;
}

export interface RealTimeUpdate {
  type: string;
  data: any;
  timestamp: Date;
  source: string;
}

export type WebSocketEventHandler = (update: RealTimeUpdate) => void;

export class WebSocketManager {
  private config: Required<WebSocketConfig>;

  constructor(config?: WebSocketConfig) {
    this.config = {
      url: "ws://localhost:8080/ws",
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
      timeout: 10000,
      debug: false,
      ...config,
    };
  }

  public connect(): Promise<void> {
    return Promise.resolve();
  }

  public disconnect(): void {
    // No-op
  }

  public isConnected(): boolean {
    return false;
  }

  public on(eventType: string, handler: WebSocketEventHandler): void {
    // No-op
  }

  public off(eventType: string, handler: WebSocketEventHandler): void {
    // No-op
  }

  public subscribeToMetrics(handler: (metrics: any) => void): void {
    // No-op
  }
}

export class MockWebSocketManager extends WebSocketManager {
  constructor(config?: WebSocketConfig) {
    super(config);
  }

  public connect(): Promise<void> {
    return Promise.resolve();
  }

  public disconnect(): void {
    // No-op
  }
}

let wsManager: WebSocketManager | null = null;

export function getWebSocketManager(config?: WebSocketConfig): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager(config);
  }
  return wsManager;
}

export function getMockWebSocketManager(config?: WebSocketConfig): MockWebSocketManager {
  return new MockWebSocketManager(config);
} 