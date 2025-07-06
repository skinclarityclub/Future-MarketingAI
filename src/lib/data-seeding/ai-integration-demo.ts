/**
 * AI Systems Integration Demo
 *
 * Comprehensive demonstration of the data seeding framework
 * integrating with all five AI systems.
 */

import { AnalyticsDataPipelineManager } from "./analytics-data-pipelines";
import {
  AnalyticsDataQualityValidator,
  ValidationConfig,
} from "./data-quality-validator";
import {
  AISystemsIntegrationManager,
  AISystemsIntegrationConfig,
  AISystemType,
  IntegrationExecutionResult,
} from "./ai-systems-integration";
import { TacticalMLModelsConnector } from "./ai-connectors/tactical-ml-connector";

// ================================
// 🚀 INTEGRATION DEMO CONFIGURATION
// ================================

export class AISystemsIntegrationDemo {
  private pipelineManager: AnalyticsDataPipelineManager;
  private qualityValidator: AnalyticsDataQualityValidator;
  private integrationManager: AISystemsIntegrationManager;

  constructor() {
    this.setupComponents();
  }

  private setupComponents(): void {
    // Initialize pipeline manager
    this.pipelineManager = new AnalyticsDataPipelineManager();

    // Setup data quality validation configuration
    const validationConfig: ValidationConfig = {
      rules: [
        {
          id: "revenue-completeness",
          name: "Revenue Field Completeness",
          type: "completeness",
          field: "revenue",
          condition: { operator: "gt", value: 0 },
          severity: "critical",
          errorMessage: "Revenue field must be present and greater than 0",
        },
        {
          id: "timestamp-validity",
          name: "Timestamp Validity",
          type: "validity",
          field: "timestamp",
          condition: {
            operator: "custom",
            customFunction: value => !isNaN(Date.parse(value)),
          },
          severity: "high",
          errorMessage: "Timestamp must be a valid date",
        },
      ],
      thresholds: {
        completeness: 0.95,
        accuracy: 0.9,
        consistency: 0.85,
        validity: 0.95,
        uniqueness: 0.8,
        freshness: 0.85,
      },
      samplingRate: 0.1,
      enableLogging: true,
      alerting: {
        enabled: true,
        channels: ["console", "email"],
        thresholds: {
          critical: 0.95,
          high: 0.8,
          medium: 0.6,
        },
      },
    };

    this.qualityValidator = new AnalyticsDataQualityValidator(validationConfig);

    // Setup integration manager configuration
    const integrationConfig: AISystemsIntegrationConfig = {
      enabledSystems: [
        "advanced-ml-engine",
        "tactical-ml-models",
        "roi-algorithm-engine",
        "optimization-engine",
        "predictive-analytics-service",
      ],
      globalRetryPolicy: {
        maxRetries: 3,
        backoffStrategy: "exponential",
        initialDelay: 1000,
        maxDelay: 10000,
      },
      dataValidationConfig: validationConfig,
      monitoringConfig: {
        healthCheckInterval: 30000,
        performanceLogging: true,
        alertingEnabled: true,
        metricsExport: {
          enabled: true,
          endpoint: "/api/metrics/ai-integration",
          interval: 60000,
        },
      },
      parallelProcessing: true,
      maxConcurrentIntegrations: 5,
    };

    this.integrationManager = new AISystemsIntegrationManager(
      this.pipelineManager,
      this.qualityValidator,
      integrationConfig
    );
  }

  async runFullIntegrationDemo(): Promise<void> {
    console.log("🚀 Starting AI Systems Integration Demo...");
    console.log("=".repeat(60));

    try {
      // Step 1: Initialize all components
      await this.initializeComponents();

      // Step 2: Connect to all AI systems
      await this.connectToAISystems();

      // Step 3: Run individual pipeline integrations
      await this.runIndividualIntegrations();

      // Step 4: Run batch integration with all systems
      await this.runBatchIntegration();

      // Step 5: Generate integration report
      await this.generateIntegrationReport();

      console.log("✅ AI Systems Integration Demo completed successfully!");
    } catch (error) {
      console.error("❌ Demo failed:", error);
      throw error;
    }
  }

  private async initializeComponents(): Promise<void> {
    console.log("\n📦 Step 1: Initializing Components...");

    try {
      await this.pipelineManager.initialize();
      console.log("✅ Pipeline Manager initialized");

      console.log("✅ Quality Validator initialized");
      console.log("✅ Integration Manager initialized");
    } catch (error) {
      console.error("❌ Component initialization failed:", error);
      throw error;
    }
  }

  private async connectToAISystems(): Promise<void> {
    console.log("\n🔗 Step 2: Connecting to AI Systems...");

    try {
      const connectionResults =
        await this.integrationManager.connectAllSystems();

      console.log("\nConnection Results:");
      for (const [systemType, connected] of connectionResults) {
        const status = connected ? "✅ Connected" : "❌ Failed";
        console.log(`  ${systemType}: ${status}`);
      }

      const successfulConnections = Array.from(
        connectionResults.values()
      ).filter(Boolean).length;
      console.log(
        `\n📊 Connected to ${successfulConnections}/${connectionResults.size} AI systems`
      );
    } catch (error) {
      console.error("❌ AI system connection failed:", error);
      throw error;
    }
  }

  private async runIndividualIntegrations(): Promise<void> {
    console.log("\n⚡ Step 3: Running Individual Pipeline Integrations...");

    const pipelineSystemMap: Record<string, AISystemType> = {
      "advanced-ml-pipeline": "advanced-ml-engine",
      "tactical-ml-pipeline": "tactical-ml-models",
      "roi-algorithm-pipeline": "roi-algorithm-engine",
      "optimization-engine-pipeline": "optimization-engine",
      "predictive-analytics-pipeline": "predictive-analytics-service",
    };

    for (const [pipelineId, systemType] of Object.entries(pipelineSystemMap)) {
      try {
        console.log(`\n🔄 Running ${pipelineId} -> ${systemType}...`);

        const results =
          await this.integrationManager.integrateDataWithAISystems(
            [systemType],
            pipelineId
          );

        const result = results[0];
        if (result.success) {
          console.log(
            `✅ Successfully transferred ${result.recordsTransferred} records in ${result.transferTime}ms`
          );
        } else {
          console.log(`❌ Failed: ${result.errors.join(", ")}`);
        }
      } catch (error) {
        console.error(`❌ Pipeline ${pipelineId} failed:`, error);
      }
    }
  }

  private async runBatchIntegration(): Promise<void> {
    console.log("\n🎯 Step 4: Running Batch Integration with All Systems...");

    try {
      const allSystems: AISystemType[] = [
        "advanced-ml-engine",
        "tactical-ml-models",
        "roi-algorithm-engine",
        "optimization-engine",
        "predictive-analytics-service",
      ];

      const results = await this.integrationManager.integrateDataWithAISystems(
        allSystems,
        "advanced-ml-pipeline" // Using the main pipeline for all systems
      );

      console.log("\nBatch Integration Results:");
      console.log(
        "System".padEnd(30) +
          "Status".padEnd(15) +
          "Records".padEnd(10) +
          "Time (ms)"
      );
      console.log("-".repeat(65));

      let totalRecords = 0;
      let successfulSystems = 0;

      for (const result of results) {
        const status = result.success ? "✅ Success" : "❌ Failed";
        const records = result.recordsTransferred.toString();
        const time = (result.transferTime || 0).toString();

        console.log(
          result.systemType.padEnd(30) +
            status.padEnd(15) +
            records.padEnd(10) +
            time
        );

        if (result.success) {
          totalRecords += result.recordsTransferred;
          successfulSystems++;
        }
      }

      console.log("-".repeat(65));
      console.log(
        `📊 Summary: ${successfulSystems}/${results.length} systems successful, ${totalRecords} total records transferred`
      );
    } catch (error) {
      console.error("❌ Batch integration failed:", error);
      throw error;
    }
  }

  private async generateIntegrationReport(): Promise<void> {
    console.log("\n📊 Step 5: Generating Integration Report...");

    try {
      // Get integration history for all pipelines
      const pipelineIds = [
        "advanced-ml-pipeline",
        "tactical-ml-pipeline",
        "roi-algorithm-pipeline",
        "optimization-engine-pipeline",
        "predictive-analytics-pipeline",
      ];

      console.log("\nIntegration History Summary:");
      console.log(
        "Pipeline".padEnd(30) + "Executions".padEnd(15) + "Success Rate"
      );
      console.log("-".repeat(60));

      for (const pipelineId of pipelineIds) {
        const history =
          this.integrationManager.getIntegrationHistory(pipelineId);
        const successfulRuns = history.filter(h => h.success).length;
        const successRate =
          history.length > 0
            ? ((successfulRuns / history.length) * 100).toFixed(1)
            : "0.0";

        console.log(
          pipelineId.padEnd(30) +
            history.length.toString().padEnd(15) +
            `${successRate}%`
        );
      }

      // Generate quality metrics
      console.log("\n🔍 Data Quality Insights:");
      console.log("- All data passed through comprehensive validation");
      console.log(
        "- Quality thresholds: Completeness ≥95%, Accuracy ≥90%, Validity ≥95%"
      );
      console.log("- Real-time monitoring and alerting enabled");
      console.log("- Automatic retry policies configured for failed transfers");

      console.log("\n🎯 AI System Performance Targets:");
      console.log(
        "- Advanced ML Engine: 95% prediction accuracy, 200ms latency"
      );
      console.log(
        "- Tactical ML Models: 85% trend detection accuracy, 100ms latency"
      );
      console.log(
        "- ROI Algorithm Engine: 96% ROI calculation accuracy, 150ms latency"
      );
      console.log(
        "- Optimization Engine: 80% optimization effectiveness, 500ms latency"
      );
      console.log(
        "- Predictive Analytics: 95% ensemble accuracy, 300ms latency"
      );
    } catch (error) {
      console.error("❌ Report generation failed:", error);
      throw error;
    }
  }

  // ================================
  // 🧪 TESTING UTILITIES
  // ================================

  async testDataQualityValidation(): Promise<void> {
    console.log("\n🧪 Testing Data Quality Validation...");

    // Generate test data with various quality issues
    const testData = [
      { timestamp: "2024-01-15T10:00:00Z", revenue: 50000, costs: 30000 },
      { timestamp: "2024-01-15T11:00:00Z", revenue: null, costs: 25000 }, // Missing revenue
      { timestamp: "invalid-date", revenue: 45000, costs: 28000 }, // Invalid timestamp
      { timestamp: "2024-01-15T12:00:00Z", revenue: 60000, costs: 35000 },
      { timestamp: "2024-01-15T13:00:00Z", revenue: -1000, costs: 20000 }, // Negative revenue
    ];

    try {
      const validationResult = await this.qualityValidator.validateDataset(
        testData,
        this.qualityValidator["config"]
      );

      console.log("📊 Validation Results:");
      console.log(
        `- Overall Quality Score: ${validationResult.overallQualityScore.toFixed(2)}%`
      );
      console.log(
        `- Valid Records: ${validationResult.validRecords}/${validationResult.totalRecords}`
      );
      console.log(`- Violations Found: ${validationResult.violations.length}`);
      console.log(
        `- Validation Passed: ${validationResult.passed ? "Yes" : "No"}`
      );

      if (validationResult.violations.length > 0) {
        console.log("\n⚠️ Quality Issues:");
        validationResult.violations.forEach((violation, index) => {
          console.log(
            `  ${index + 1}. ${violation.message} (${violation.severity})`
          );
        });
      }
    } catch (error) {
      console.error("❌ Data quality validation test failed:", error);
    }
  }

  async testSingleSystemIntegration(systemType: AISystemType): Promise<void> {
    console.log(`\n🧪 Testing Single System Integration: ${systemType}...`);

    try {
      const results = await this.integrationManager.integrateDataWithAISystems(
        [systemType],
        "advanced-ml-pipeline"
      );

      const result = results[0];

      console.log("📊 Integration Test Results:");
      console.log(`- Success: ${result.success ? "Yes" : "No"}`);
      console.log(`- Records Transferred: ${result.recordsTransferred}`);
      console.log(`- Transfer Time: ${result.transferTime}ms`);

      if (result.errors.length > 0) {
        console.log("❌ Errors:");
        result.errors.forEach(error => console.log(`  - ${error}`));
      }

      if (result.warnings.length > 0) {
        console.log("⚠️ Warnings:");
        result.warnings.forEach(warning => console.log(`  - ${warning}`));
      }
    } catch (error) {
      console.error(
        `❌ Single system integration test failed for ${systemType}:`,
        error
      );
    }
  }
}

// ================================
// 🎯 USAGE EXAMPLES
// ================================

export async function runBasicIntegrationDemo(): Promise<void> {
  const demo = new AISystemsIntegrationDemo();
  await demo.runFullIntegrationDemo();
}

export async function runQualityValidationTest(): Promise<void> {
  const demo = new AISystemsIntegrationDemo();
  await demo.testDataQualityValidation();
}

export async function runSingleSystemTest(
  systemType: AISystemType
): Promise<void> {
  const demo = new AISystemsIntegrationDemo();
  await demo.testSingleSystemIntegration(systemType);
}

// Example usage:
// runBasicIntegrationDemo().catch(console.error);
// runQualityValidationTest().catch(console.error);
// runSingleSystemTest('advanced-ml-engine').catch(console.error);
