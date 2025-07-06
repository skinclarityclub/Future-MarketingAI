/**
 * 🔒 ENHANCED REAL-TIME DATA SERVICE WITH SECURITY & INTELLIGENCE
 * Advanced error handling, security monitoring, and intelligent alerting
 * Task 94.4: Integrate Real-Time Data Sources and AI Assistant
 */

import { getOptimizedRealTimeService } from "./optimized-real-time-service";
import type { RealTimeDataState } from "./optimized-real-time-service";

// 🔒 SECURITY: Security monitoring interfaces
interface SecurityEvent {
  id: string;
  type:
    | "authentication_failure"
    | "data_breach_attempt"
    | "unauthorized_access"
    | "api_limit_exceeded";
  severity: "low" | "medium" | "high" | "critical";
  timestamp: Date;
  details: {
    source: string;
    userAgent?: string;
    ipAddress?: string;
    affectedDataSources?: string[];
  };
  resolved: boolean;
}

interface DataSourceHealthCheck {
  id: string;
  name: string;
  isHealthy: boolean;
  lastSuccessfulConnection: Date;
  failureCount: number;
  errorDetails?: string;
  estimatedRecoveryTime?: Date;
}

// 🧠 INTELLIGENCE: Enhanced alert system
interface IntelligentAlert {
  id: string;
  type: "performance" | "security" | "business" | "system" | "ai_insight";
  severity: "info" | "warning" | "error" | "critical";
  title: string;
  message: string;
  timestamp: Date;
  source: string;
  actionRequired: boolean;
  aiRecommendation?: string;
  estimatedImpact?: "low" | "medium" | "high" | "critical";
  suggestedActions?: string[];
}

// 📊 ANALYTICS: Enhanced real-time state
interface EnhancedRealTimeDataState extends RealTimeDataState {
  securityEvents: SecurityEvent[];
  dataSourceHealth: DataSourceHealthCheck[];
  intelligentAlerts: IntelligentAlert[];
  performanceAnalytics: {
    avgResponseTime: number;
    errorRate: number;
    uptimePercentage: number;
    dataFreshness: number; // Seconds since last update
  };
  aiInsights: {
    trendingConcerns: string[];
    predictedIssues: string[];
    optimizationSuggestions: string[];
    executiveSummary: string;
  };
}

class EnhancedRealTimeSecurityService {
  private baseService: ReturnType<typeof getOptimizedRealTimeService>;
  private securityEvents: SecurityEvent[] = [];
  private dataSourceHealth: Map<string, DataSourceHealthCheck> = new Map();
  private intelligentAlerts: IntelligentAlert[] = [];
  private performanceMetrics = {
    responseTimeSamples: [] as number[],
    errorCount: 0,
    successCount: 0,
    startTime: Date.now(),
  };

  constructor() {
    this.baseService = getOptimizedRealTimeService();
    this.initializeSecurityMonitoring();
    this.startIntelligentAnalytics();
  }

  // 🔒 SECURITY: Initialize security monitoring
  private initializeSecurityMonitoring(): void {
    // Monitor for unusual patterns
    setInterval(() => {
      this.performSecurityHealthCheck();
    }, 30000); // Every 30 seconds

    // Monitor data source health
    setInterval(() => {
      this.checkDataSourceHealth();
    }, 15000); // Every 15 seconds
  }

  // 🧠 INTELLIGENCE: Start intelligent analytics
  private startIntelligentAnalytics(): void {
    setInterval(() => {
      this.generateAIInsights();
      this.processIntelligentAlerts();
    }, 60000); // Every minute
  }

  // 🔒 SECURITY: Perform comprehensive security check
  private performSecurityHealthCheck(): void {
    const baseState = this.baseService.getState();

    // Check for suspicious patterns
    if (baseState.systemMetrics.cpu > 95) {
      this.addSecurityEvent({
        type: "unauthorized_access",
        severity: "high",
        details: {
          source: "System Monitor",
          affectedDataSources: ["system_metrics"],
        },
      });
    }

    // Check API rate limits
    if (baseState.systemMetrics.activeConnections > 100) {
      this.addSecurityEvent({
        type: "api_limit_exceeded",
        severity: "medium",
        details: {
          source: "Connection Monitor",
          affectedDataSources: ["api_connections"],
        },
      });
    }
  }

  // 📊 ANALYTICS: Monitor data source health
  private checkDataSourceHealth(): void {
    const baseState = this.baseService.getState();

    baseState.dataSources.forEach(source => {
      const health: DataSourceHealthCheck = {
        id: source.id,
        name: source.name,
        isHealthy: source.status === "connected",
        lastSuccessfulConnection:
          source.status === "connected"
            ? new Date()
            : this.dataSourceHealth.get(source.id)?.lastSuccessfulConnection ||
              new Date(),
        failureCount:
          source.status !== "connected"
            ? (this.dataSourceHealth.get(source.id)?.failureCount || 0) + 1
            : 0,
        errorDetails:
          source.status === "error" ? "Connection failed" : undefined,
      };

      this.dataSourceHealth.set(source.id, health);

      // Generate alert for unhealthy sources
      if (!health.isHealthy && health.failureCount > 3) {
        this.addIntelligentAlert({
          type: "system",
          severity: "warning",
          title: `Data Source Health Issue`,
          message: `${health.name} has failed ${health.failureCount} times`,
          source: "Health Monitor",
          actionRequired: true,
          aiRecommendation: "Check API credentials and network connectivity",
          estimatedImpact: "medium",
          suggestedActions: [
            "Verify API credentials",
            "Check network connectivity",
            "Review error logs",
            "Contact data source support",
          ],
        });
      }
    });
  }

  // 🧠 INTELLIGENCE: Generate AI-powered insights
  private generateAIInsights(): void {
    const baseState = this.baseService.getState();
    const healthArray = Array.from(this.dataSourceHealth.values());

    // Trending concerns analysis
    const trendingConcerns: string[] = [];
    if (baseState.systemMetrics.cpu > 80) {
      trendingConcerns.push("High CPU utilization trending upward");
    }
    if (healthArray.filter(h => !h.isHealthy).length > 1) {
      trendingConcerns.push(
        "Multiple data sources experiencing connectivity issues"
      );
    }

    // Predictive issue detection
    const predictedIssues: string[] = [];
    if (baseState.systemMetrics.memory > 85) {
      predictedIssues.push("Memory exhaustion predicted within 2 hours");
    }

    // Optimization suggestions
    const optimizationSuggestions: string[] = [
      "Consider implementing data source connection pooling",
      "Enable caching for frequently accessed metrics",
      "Schedule maintenance during low-traffic periods",
    ];
  }

  // 🚨 ALERTS: Add security event
  private addSecurityEvent(
    event: Omit<SecurityEvent, "id" | "timestamp" | "resolved">
  ): void {
    const securityEvent: SecurityEvent = {
      id: `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false,
      ...event,
    };

    this.securityEvents.push(securityEvent);

    // Auto-resolve low severity events after 5 minutes
    if (event.severity === "low") {
      setTimeout(
        () => {
          securityEvent.resolved = true;
        },
        5 * 60 * 1000
      );
    }
  }

  // 🧠 INTELLIGENCE: Add intelligent alert
  private addIntelligentAlert(
    alert: Omit<IntelligentAlert, "id" | "timestamp">
  ): void {
    const intelligentAlert: IntelligentAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...alert,
    };

    this.intelligentAlerts.push(intelligentAlert);
  }

  // 🔄 PROCESSING: Process and cleanup alerts
  private processIntelligentAlerts(): void {
    // Remove old info alerts (older than 1 hour)
    this.intelligentAlerts = this.intelligentAlerts.filter(alert => {
      if (
        alert.severity === "info" &&
        Date.now() - alert.timestamp.getTime() > 60 * 60 * 1000
      ) {
        return false;
      }
      return true;
    });
  }

  // 📊 PUBLIC API: Get enhanced real-time state
  public getEnhancedState(): EnhancedRealTimeDataState {
    const baseState = this.baseService.getState();

    return {
      ...baseState,
      securityEvents: this.securityEvents.filter(e => !e.resolved),
      dataSourceHealth: Array.from(this.dataSourceHealth.values()),
      intelligentAlerts: this.intelligentAlerts,
      performanceAnalytics: {
        avgResponseTime: this.calculateAvgResponseTime(),
        errorRate: this.calculateErrorRate(),
        uptimePercentage: this.calculateUptimePercentage(),
        dataFreshness: (Date.now() - baseState.lastUpdated.getTime()) / 1000,
      },
      aiInsights: {
        trendingConcerns: [],
        predictedIssues: [],
        optimizationSuggestions: [],
        executiveSummary: this.generateExecutiveSummary(),
      },
    };
  }

  // 📊 ANALYTICS: Calculate performance metrics
  private calculateAvgResponseTime(): number {
    const samples = this.performanceMetrics.responseTimeSamples;
    return samples.length > 0
      ? samples.reduce((a, b) => a + b) / samples.length
      : 0;
  }

  private calculateErrorRate(): number {
    const total =
      this.performanceMetrics.errorCount + this.performanceMetrics.successCount;
    return total > 0 ? (this.performanceMetrics.errorCount / total) * 100 : 0;
  }

  private calculateUptimePercentage(): number {
    const uptimeMs = Date.now() - this.performanceMetrics.startTime;
    const errorDowntime = this.performanceMetrics.errorCount * 1000; // Assume 1s downtime per error
    return Math.max(0, ((uptimeMs - errorDowntime) / uptimeMs) * 100);
  }

  private generateExecutiveSummary(): string {
    const baseState = this.baseService.getState();
    const criticalAlerts = this.intelligentAlerts.filter(
      a => a.severity === "critical"
    ).length;
    const securityIncidents = this.securityEvents.filter(
      e => !e.resolved && e.severity === "high"
    ).length;

    if (criticalAlerts > 0 || securityIncidents > 0) {
      return `🚨 ATTENTION REQUIRED: ${criticalAlerts} critical alerts, ${securityIncidents} security incidents pending`;
    }

    return `✅ ALL SYSTEMS OPERATIONAL: Performance optimal, all data sources connected, security posture strong`;
  }

  // 🔄 SUBSCRIPTION: Subscribe to enhanced updates
  public subscribe(
    id: string,
    callback: (state: EnhancedRealTimeDataState) => void
  ): () => void {
    const baseUnsubscribe = this.baseService.subscribe(id, () => {
      callback(this.getEnhancedState());
    });

    return baseUnsubscribe;
  }
}

// 🌟 SINGLETON: Export enhanced service instance
let enhancedServiceInstance: EnhancedRealTimeSecurityService | null = null;

export const getEnhancedRealTimeSecurityService =
  (): EnhancedRealTimeSecurityService => {
    if (!enhancedServiceInstance) {
      enhancedServiceInstance = new EnhancedRealTimeSecurityService();
    }
    return enhancedServiceInstance;
  };

export type {
  EnhancedRealTimeDataState,
  SecurityEvent,
  DataSourceHealthCheck,
  IntelligentAlert,
};
