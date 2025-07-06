/**
 * Tactical ML Models Connector
 *
 * Specialized connector for integrating with the Tactical ML Models system
 * for operational metrics, KPI data, and trend analysis.
 */

import {
  AISystemConnector,
  AISystemType,
  AISystemConnectionConfig,
  AISystemDataRequirements,
  DataTransferMetadata,
  DataTransferResult,
  AISystemStatus,
  SystemPerformanceMetrics,
} from "../ai-systems-integration";

export class TacticalMLModelsConnector implements AISystemConnector {
  systemId = "tactical-ml-models";
  systemName = "Tactical ML Models";
  systemType: AISystemType = "tactical-ml-models";

  connectionConfig: AISystemConnectionConfig = {
    endpoint:
      process.env.TACTICAL_ML_ENDPOINT || "http://localhost:8002/api/v1",
    authType: "jwt",
    credentials: {
      username: process.env.TACTICAL_ML_USERNAME || "",
      password: process.env.TACTICAL_ML_PASSWORD || "",
    },
    timeout: 25000,
    retryConfig: {
      maxRetries: 2,
      backoffStrategy: "linear",
      initialDelay: 2000,
      maxDelay: 8000,
    },
    rateLimiting: {
      requestsPerSecond: 15,
      burstLimit: 30,
      concurrentConnections: 3,
    },
  };

  dataRequirements: AISystemDataRequirements = {
    expectedDataTypes: ["operational_metrics", "kpi_data", "trend_analysis"],
    requiredFields: [
      "timestamp",
      "metric_name",
      "metric_value",
      "department",
      "category",
    ],
    dataFormat: "json",
    batchSize: 7500,
    compressionEnabled: false,
    qualityThresholds: {
      completeness: 0.85,
      accuracy: 0.85,
      consistency: 0.9,
    },
  };

  private isConnected = false;
  private authToken?: string;

  async connect(): Promise<boolean> {
    try {
      console.log(`🔗 Connecting to ${this.systemName}...`);

      // Authenticate and get JWT token
      const authResponse = await fetch(
        `${this.connectionConfig.endpoint}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: this.connectionConfig.credentials.username,
            password: this.connectionConfig.credentials.password,
          }),
          signal: AbortSignal.timeout(this.connectionConfig.timeout),
        }
      );

      if (authResponse.ok) {
        const authData = await authResponse.json();
        this.authToken = authData.token;
        this.isConnected = true;
        console.log(`✅ Connected to ${this.systemName}`);
        return true;
      } else {
        console.error(
          `❌ Failed to authenticate with ${this.systemName}: ${authResponse.statusText}`
        );
        return false;
      }
    } catch (error) {
      console.error(`❌ Connection error to ${this.systemName}:`, error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.authToken) {
      try {
        await fetch(`${this.connectionConfig.endpoint}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        });
      } catch (error) {
        console.error("Error during logout:", error);
      }
    }

    this.isConnected = false;
    this.authToken = undefined;
    console.log(`🔌 Disconnected from ${this.systemName}`);
  }

  async pushData(
    data: any[],
    metadata: DataTransferMetadata
  ): Promise<DataTransferResult> {
    const startTime = Date.now();
    const transferId = `transfer-${this.systemId}-${Date.now()}`;

    try {
      if (!this.authToken) {
        throw new Error("Not authenticated");
      }

      console.log(`📤 Pushing ${data.length} records to ${this.systemName}...`);

      // Transform data for tactical ML models
      const transformedData = this.transformDataForTacticalML(data);

      const response = await fetch(
        `${this.connectionConfig.endpoint}/models/data/ingest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            "Content-Type": "application/json",
            "X-Transfer-ID": transferId,
          },
          body: JSON.stringify({
            tactical_data: transformedData,
            metadata: {
              ...metadata,
              transformation_type: "tactical_metrics_format",
            },
          }),
          signal: AbortSignal.timeout(this.connectionConfig.timeout),
        }
      );

      const responseData = await response.json();
      const transferTime = Date.now() - startTime;

      if (response.ok) {
        console.log(
          `✅ Successfully pushed data to ${this.systemName} in ${transferTime}ms`
        );
        return {
          success: true,
          transferId,
          recordsTransferred: data.length,
          transferTime,
          errors: [],
          warnings: responseData.warnings || [],
          systemResponse: responseData,
        };
      } else {
        return {
          success: false,
          transferId,
          recordsTransferred: 0,
          transferTime,
          errors: [responseData.error || "Unknown error"],
          warnings: [],
          systemResponse: responseData,
        };
      }
    } catch (error) {
      const transferTime = Date.now() - startTime;
      console.error(`❌ Error pushing data to ${this.systemName}:`, error);

      return {
        success: false,
        transferId,
        recordsTransferred: 0,
        transferTime,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        warnings: [],
      };
    }
  }

  async getSystemStatus(): Promise<AISystemStatus> {
    try {
      if (!this.authToken) {
        return this.getOfflineStatus();
      }

      const response = await fetch(
        `${this.connectionConfig.endpoint}/models/status`,
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        }
      );

      if (response.ok) {
        const statusData = await response.json();
        return {
          systemId: this.systemId,
          isOnline: true,
          lastDataSync: new Date(statusData.lastSync),
          dataRecordsCount: statusData.recordCount,
          systemHealth: statusData.health,
          performanceMetrics: statusData.metrics,
        };
      } else {
        return this.getOfflineStatus();
      }
    } catch (error) {
      return this.getOfflineStatus();
    }
  }

  async validateConnection(): Promise<boolean> {
    if (!this.isConnected || !this.authToken) {
      return await this.connect();
    }
    return true;
  }

  private transformDataForTacticalML(data: any[]): any[] {
    return data.map(record => ({
      timestamp: record.timestamp,
      metric_data: {
        primary_kpi: record.metric_value || record.revenue || 0,
        secondary_metrics: {
          efficiency_score: record.efficiency_score || 0.8,
          productivity_index: record.productivity_index || 1.0,
          quality_factor: record.quality_factor || 0.9,
        },
        dimensional_attributes: {
          department: record.department || "general",
          category: record.category || "operational",
          geographic_region: record.region || "unknown",
          business_unit: record.business_unit || "general",
        },
      },
      trend_indicators: {
        momentum: this.calculateMomentum(record),
        volatility: record.volatility || 0.1,
        anomaly_score: record.anomaly_score || 0.0,
      },
      contextual_data: {
        external_factors: record.external_factors || [],
        market_conditions: record.market_conditions || "stable",
        competitive_landscape: record.competitive_data || {},
      },
    }));
  }

  private calculateMomentum(record: any): number {
    // Simple momentum calculation - could be enhanced with historical data
    const currentValue = record.metric_value || record.revenue || 0;
    const previousValue = record.previous_value || currentValue;

    if (previousValue === 0) return 0;
    return (currentValue - previousValue) / previousValue;
  }

  private getOfflineStatus(): AISystemStatus {
    return {
      systemId: this.systemId,
      isOnline: false,
      lastDataSync: new Date(0),
      dataRecordsCount: 0,
      systemHealth: "offline",
      performanceMetrics: {
        avgResponseTime: 0,
        successRate: 0,
        errorRate: 1,
        lastErrorMessage: "System offline or not authenticated",
        systemLoad: 0,
      },
    };
  }
}
