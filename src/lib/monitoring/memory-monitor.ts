import { totalmem } from "os";

interface MemoryMetrics {
  rss: number; // Resident Set Size - total memory allocated
  heapUsed: number; // Used heap memory
  heapTotal: number; // Total heap memory
  external: number; // External memory
  arrayBuffers: number; // ArrayBuffer memory
  timestamp: number;
  percentage: number;
}

interface MemoryAlert {
  level: "warning" | "critical";
  message: string;
  metrics: MemoryMetrics;
  timestamp: number;
}

class MemoryMonitor {
  private static instance: MemoryMonitor;
  private alerts: MemoryAlert[] = [];
  private isMonitoring = false;
  private interval: NodeJS.Timeout | null = null;
  private warningThreshold = 0.75; // 75%
  private criticalThreshold = 0.9; // 90%
  private onAlert?: (alert: MemoryAlert) => void;

  private constructor() {}

  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  // Get current memory metrics
  getCurrentMemory(): MemoryMetrics {
    const memUsage = process.memoryUsage();
    const totalMemory = totalmem();

    return {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
      arrayBuffers: Math.round(memUsage.arrayBuffers / 1024 / 1024), // MB
      timestamp: Date.now(),
      percentage: memUsage.rss / totalMemory,
    };
  }

  // Check if memory usage exceeds thresholds
  private checkMemoryThresholds(metrics: MemoryMetrics): void {
    if (metrics.percentage >= this.criticalThreshold) {
      this.createAlert(
        "critical",
        `Critical memory usage: ${(metrics.percentage * 100).toFixed(1)}%`,
        metrics
      );
    } else if (metrics.percentage >= this.warningThreshold) {
      this.createAlert(
        "warning",
        `High memory usage: ${(metrics.percentage * 100).toFixed(1)}%`,
        metrics
      );
    }
  }

  private createAlert(
    level: "warning" | "critical",
    message: string,
    metrics: MemoryMetrics
  ): void {
    const alert: MemoryAlert = {
      level,
      message,
      metrics,
      timestamp: Date.now(),
    };

    this.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Call alert callback if provided
    if (this.onAlert) {
      this.onAlert(alert);
    }

    console.warn(`[Memory Monitor] ${level.toUpperCase()}: ${message}`);
  }

  // Start monitoring memory usage
  startMonitoring(
    intervalMs = 5000,
    alertCallback?: (alert: MemoryAlert) => void
  ): void {
    if (this.isMonitoring) {
      console.warn("[Memory Monitor] Already monitoring");
      return;
    }

    this.onAlert = alertCallback;
    this.isMonitoring = true;

    this.interval = setInterval(() => {
      const metrics = this.getCurrentMemory();
      this.checkMemoryThresholds(metrics);
    }, intervalMs);

    console.log("[Memory Monitor] Started monitoring memory usage");
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isMonitoring = false;
    console.log("[Memory Monitor] Stopped monitoring memory usage");
  }

  // Force garbage collection if available
  forceGarbageCollection(): boolean {
    if (global.gc) {
      const beforeGC = this.getCurrentMemory();
      global.gc();
      const afterGC = this.getCurrentMemory();

      console.log(
        `[Memory Monitor] Forced GC: ${beforeGC.heapUsed}MB -> ${afterGC.heapUsed}MB (freed ${beforeGC.heapUsed - afterGC.heapUsed}MB)`
      );
      return true;
    }

    console.warn(
      "[Memory Monitor] Garbage collection not available. Start with --expose-gc flag."
    );
    return false;
  }

  // Get memory usage summary
  getMemorySummary(): {
    current: MemoryMetrics;
    status: "healthy" | "warning" | "critical";
    recentAlerts: MemoryAlert[];
  } {
    const current = this.getCurrentMemory();
    let status: "healthy" | "warning" | "critical" = "healthy";

    if (current.percentage >= this.criticalThreshold) {
      status = "critical";
    } else if (current.percentage >= this.warningThreshold) {
      status = "warning";
    }

    return {
      current,
      status,
      recentAlerts: this.alerts.slice(-10), // Last 10 alerts
    };
  }

  // Set thresholds
  setThresholds(warning: number, critical: number): void {
    this.warningThreshold = warning;
    this.criticalThreshold = critical;
    console.log(
      `[Memory Monitor] Thresholds updated: Warning ${warning * 100}%, Critical ${critical * 100}%`
    );
  }

  // Memory optimization utilities
  optimizeMemory(): void {
    // Clear require cache for modules that might be cached
    const moduleKeysToDelete = Object.keys(require.cache).filter(
      key => key.includes("node_modules") && !key.includes("essential")
    );

    moduleKeysToDelete.forEach(key => {
      delete require.cache[key];
    });

    // Force garbage collection if available
    this.forceGarbageCollection();

    console.log(
      `[Memory Monitor] Optimization complete. Cleared ${moduleKeysToDelete.length} cached modules.`
    );
  }
}

// Memory monitoring middleware for Express
export function memoryMonitorMiddleware() {
  const monitor = MemoryMonitor.getInstance();

  return (req: any, res: any, next: any) => {
    const startMemory = monitor.getCurrentMemory();

    res.on("finish", () => {
      const endMemory = monitor.getCurrentMemory();
      const memoryDiff = endMemory.heapUsed - startMemory.heapUsed;

      if (memoryDiff > 10) {
        // More than 10MB increase
        console.warn(
          `[Memory Monitor] Request ${req.method} ${req.path} increased memory by ${memoryDiff}MB`
        );
      }
    });

    next();
  };
}

// Export singleton instance
export const memoryMonitor = MemoryMonitor.getInstance();
export { MemoryMonitor, type MemoryMetrics, type MemoryAlert };
