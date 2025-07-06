/**
 * ⚡ PERFORMANCE OPTIMIZED Real-Time Data Service
 * Balances live data feel with performance optimization
 */

interface RealTimeDataSource {
  id: string;
  name: string;
  status: "connected" | "connecting" | "disconnected" | "error";
  lastUpdate: Date;
  data: any;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  network: number;
  uptime: number;
  activeConnections: number;
}

interface ROIMetrics {
  totalRevenue: number;
  marketingSpend: number;
  roi: number;
  conversionRate: number;
}

interface RealTimeDataState {
  dataSources: RealTimeDataSource[];
  systemMetrics: SystemMetrics;
  roiMetrics: ROIMetrics;
  alerts: Array<{
    id: string;
    type: "info" | "warning" | "error" | "critical";
    message: string;
    timestamp: Date;
    source: string;
  }>;
  isConnected: boolean;
  lastUpdated: Date;
}

// ⚡ PERFORMANCE: Throttling configuration
interface ThrottleConfig {
  highPriority: number; // Critical metrics: 1000ms
  mediumPriority: number; // Standard metrics: 3000ms
  lowPriority: number; // Background data: 10000ms
}

interface CacheConfig {
  maxAge: number; // Cache duration in ms
  maxSize: number; // Max cached items
}

class OptimizedRealTimeDataService {
  private state: RealTimeDataState;
  private listeners: Map<string, (state: RealTimeDataState) => void> =
    new Map();
  private updateTimers: Map<string, NodeJS.Timeout> = new Map();
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  // ⚡ PERFORMANCE: Configurable throttling
  private throttleConfig: ThrottleConfig = {
    highPriority: 1000, // Critical alerts, system health
    mediumPriority: 3000, // ROI metrics, data sources
    lowPriority: 10000, // Background data, logs
  };

  private cacheConfig: CacheConfig = {
    maxAge: 30000, // 30 seconds cache
    maxSize: 100, // Max 100 cached items
  };

  constructor() {
    this.state = this.initializeState();
    this.startOptimizedUpdates();
  }

  private initializeState(): RealTimeDataState {
    return {
      dataSources: [
        {
          id: "clickup",
          name: "ClickUp Integration",
          status: "connected",
          lastUpdate: new Date(),
          data: { tasks: 342, completed: 198 },
        },
        {
          id: "n8n",
          name: "n8n Workflows",
          status: "connected",
          lastUpdate: new Date(),
          data: { workflows: 45, active: 38 },
        },
      ],
      systemMetrics: {
        cpu: 45,
        memory: 62,
        network: 78,
        uptime: 99.9,
        activeConnections: 24,
      },
      roiMetrics: {
        totalRevenue: 2450000,
        marketingSpend: 245000,
        roi: 23.5,
        conversionRate: 4.2,
      },
      alerts: [],
      isConnected: true,
      lastUpdated: new Date(),
    };
  }

  // ⚡ PERFORMANCE: Optimized subscription
  public subscribe(
    id: string,
    listener: (state: RealTimeDataState) => void
  ): () => void {
    this.listeners.set(id, listener);
    listener(this.state);

    return () => {
      this.listeners.delete(id);
      if (this.listeners.size === 0) {
        this.stopAllUpdates();
      }
    };
  }

  // ⚡ PERFORMANCE: Smart caching system
  private getCachedState(): RealTimeDataState | null {
    const cached = this.cache.get("current_state");
    if (cached && Date.now() - cached.timestamp < this.cacheConfig.maxAge) {
      return cached.data;
    }
    return null;
  }

  private setCachedState(state: RealTimeDataState): void {
    this.cache.set("current_state", {
      data: { ...state },
      timestamp: Date.now(),
    });

    // ⚡ PERFORMANCE: Cache cleanup
    if (this.cache.size > this.cacheConfig.maxSize) {
      const oldest = Array.from(this.cache.entries()).sort(
        ([, a], [, b]) => a.timestamp - b.timestamp
      )[0];
      this.cache.delete(oldest[0]);
    }
  }

  // ⚡ PERFORMANCE: Throttled updates by priority
  private startOptimizedUpdates(): void {
    // High priority: Critical system metrics
    this.updateTimers.set(
      "high",
      setInterval(() => {
        this.updateSystemMetrics();
        this.notifyListeners();
      }, this.throttleConfig.highPriority)
    );

    // Medium priority: ROI metrics
    this.updateTimers.set(
      "medium",
      setInterval(() => {
        this.updateROIMetrics();
        this.notifyListeners();
      }, this.throttleConfig.mediumPriority)
    );

    // Low priority: Background data
    this.updateTimers.set(
      "low",
      setInterval(() => {
        this.updateBackgroundData();
        this.notifyListeners();
      }, this.throttleConfig.lowPriority)
    );
  }

  private stopAllUpdates(): void {
    this.updateTimers.forEach(timer => clearInterval(timer));
    this.updateTimers.clear();
  }

  private updateSystemMetrics(): void {
    const variance = 3;
    this.state.systemMetrics = {
      cpu: Math.max(
        0,
        Math.min(
          100,
          this.state.systemMetrics.cpu + (Math.random() - 0.5) * variance
        )
      ),
      memory: Math.max(
        0,
        Math.min(
          100,
          this.state.systemMetrics.memory + (Math.random() - 0.5) * variance
        )
      ),
      network: Math.max(
        0,
        Math.min(
          100,
          this.state.systemMetrics.network + (Math.random() - 0.5) * variance
        )
      ),
      uptime: Math.max(
        95,
        Math.min(
          100,
          this.state.systemMetrics.uptime + (Math.random() - 0.5) * 0.1
        )
      ),
      activeConnections: Math.max(
        0,
        this.state.systemMetrics.activeConnections +
          Math.floor((Math.random() - 0.5) * 2)
      ),
    };
  }

  private updateROIMetrics(): void {
    this.state.roiMetrics = {
      totalRevenue: Math.max(
        0,
        this.state.roiMetrics.totalRevenue +
          Math.floor((Math.random() - 0.4) * 30000)
      ),
      marketingSpend:
        this.state.roiMetrics.marketingSpend +
        Math.floor((Math.random() - 0.5) * 3000),
      roi: Math.max(0, this.state.roiMetrics.roi + (Math.random() - 0.5) * 1.5),
      conversionRate: Math.max(
        0,
        Math.min(
          10,
          this.state.roiMetrics.conversionRate + (Math.random() - 0.5) * 0.1
        )
      ),
    };
  }

  private updateBackgroundData(): void {
    this.state.lastUpdated = new Date();

    // ⚡ PERFORMANCE: Update cache with current state
    this.setCachedState(this.state);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        console.warn("Real-time listener error:", error);
      }
    });
  }

  public getState(): RealTimeDataState {
    const cached = this.getCachedState();
    return cached || this.state;
  }

  public getSystemHealth(): "operational" | "warning" | "critical" {
    const { cpu, memory } = this.state.systemMetrics;

    if (cpu > 90 || memory > 90) {
      return "critical";
    } else if (cpu > 75 || memory > 75) {
      return "warning";
    } else {
      return "operational";
    }
  }

  public getActiveAlertsCount(): number {
    return this.state.alerts.filter(
      alert =>
        alert.type === "warning" ||
        alert.type === "error" ||
        alert.type === "critical"
    ).length;
  }

  // ⚡ PERFORMANCE: Manual refresh for on-demand updates
  public forceRefresh(): void {
    this.updateSystemMetrics();
    this.updateROIMetrics();
    this.notifyListeners();
  }

  // ⚡ PERFORMANCE: Configuration updates
  public updateThrottleConfig(config: Partial<ThrottleConfig>): void {
    this.throttleConfig = { ...this.throttleConfig, ...config };

    // Restart timers with new configuration
    this.stopAllUpdates();
    this.startOptimizedUpdates();
  }
}

// ⚡ PERFORMANCE: Singleton with lazy initialization
let optimizedServiceInstance: OptimizedRealTimeDataService | null = null;

export const getOptimizedRealTimeService = (): OptimizedRealTimeDataService => {
  if (!optimizedServiceInstance) {
    optimizedServiceInstance = new OptimizedRealTimeDataService();
  }
  return optimizedServiceInstance;
};

export type {
  RealTimeDataState,
  SystemMetrics,
  ROIMetrics,
  ThrottleConfig,
  CacheConfig,
};
