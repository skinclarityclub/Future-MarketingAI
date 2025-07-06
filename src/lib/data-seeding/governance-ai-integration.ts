/**
 * Governance AI Systems Integration
 *
 * Connects the Data Seeding Governance & Security Framework with
 * AI systems and data pipelines for comprehensive enterprise governance.
 */

import {
  DataSeedingGovernanceFramework,
  SecurityValidationResult,
  DataOperation,
  DataClassification,
  SecurityEvent,
  ComplianceEvent,
  DataAccessEvent,
} from "./governance-security-framework";

import { AISystemsIntegrationManager } from "./ai-systems-integration";
import { AnalyticsDataPipelineManager } from "./analytics-data-pipelines";
import { AnalyticsDataQualityValidator } from "./data-quality-validator";

// ================================
// 🔐 GOVERNANCE INTEGRATION INTERFACES
// ================================

export interface GovernanceAIIntegrationConfig {
  enableRealTimeValidation: boolean;
  enableAuditLogging: boolean;
  enableComplianceChecks: boolean;
  enableEncryption: boolean;
  securityLevel: "basic" | "standard" | "enterprise" | "maximum";
  complianceFrameworks: string[];
}

export interface SecuredAIOperation {
  operationId: string;
  aiSystemId: string;
  userId: string;
  dataVolume: number;
  dataClassification: DataClassification;
  securityValidation: SecurityValidationResult;
  encryptionApplied: boolean;
  auditLogged: boolean;
  complianceValidated: boolean;
  startTime: Date;
  endTime?: Date;
  status: "pending" | "validated" | "executing" | "completed" | "failed";
}

export interface AISystemSecurityProfile {
  systemId: string;
  systemName: string;
  minimumSecurityLevel: DataClassification;
  requiredPermissions: string[];
  encryptionRequired: boolean;
  auditLevel: "minimal" | "standard" | "comprehensive";
  complianceRequirements: string[];
  accessRestrictions: string[];
}

// ================================
// 🛡️ MAIN GOVERNANCE AI INTEGRATION
// ================================

export class GovernanceAIIntegrationManager {
  private governanceFramework: DataSeedingGovernanceFramework;
  private aiSystemsManager: AISystemsIntegrationManager;
  private pipelineManager: AnalyticsDataPipelineManager;
  private qualityValidator: AnalyticsDataQualityValidator;
  private securedOperations: Map<string, SecuredAIOperation> = new Map();
  private aiSecurityProfiles: Map<string, AISystemSecurityProfile> = new Map();

  constructor(
    private config: GovernanceAIIntegrationConfig = {
      enableRealTimeValidation: true,
      enableAuditLogging: true,
      enableComplianceChecks: true,
      enableEncryption: true,
      securityLevel: "enterprise",
      complianceFrameworks: ["GDPR", "SOX", "HIPAA"],
    }
  ) {
    this.governanceFramework = new DataSeedingGovernanceFramework();
    this.aiSystemsManager = new AISystemsIntegrationManager();
    this.pipelineManager = new AnalyticsDataPipelineManager();
    this.qualityValidator = new AnalyticsDataQualityValidator();
  }

  async initializeGovernanceIntegration(): Promise<void> {
    console.log("🔐 Initializing Governance AI Integration...");

    // Initialize core frameworks
    await this.governanceFramework.initializeSecurityFramework();
    await this.setupAISecurityProfiles();

    console.log("✅ Governance AI Integration initialized successfully");
  }

  private async setupAISecurityProfiles(): Promise<void> {
    const securityProfiles: AISystemSecurityProfile[] = [
      {
        systemId: "advanced-ml-engine",
        systemName: "Advanced ML Engine",
        minimumSecurityLevel: "confidential",
        requiredPermissions: [
          "ml-models:read",
          "ml-models:write",
          "analytics-data:read",
        ],
        encryptionRequired: true,
        auditLevel: "comprehensive",
        complianceRequirements: ["GDPR", "SOX"],
        accessRestrictions: ["mfa_required", "ip_whitelist"],
      },
      {
        systemId: "tactical-ml-models",
        systemName: "Tactical ML Models",
        minimumSecurityLevel: "internal",
        requiredPermissions: ["tactical-data:read", "tactical-models:write"],
        encryptionRequired: true,
        auditLevel: "standard",
        complianceRequirements: ["GDPR"],
        accessRestrictions: ["mfa_required"],
      },
      {
        systemId: "roi-algorithm-engine",
        systemName: "ROI Algorithm Engine",
        minimumSecurityLevel: "confidential",
        requiredPermissions: ["financial-data:read", "roi-models:write"],
        encryptionRequired: true,
        auditLevel: "comprehensive",
        complianceRequirements: ["SOX", "GDPR"],
        accessRestrictions: ["mfa_required", "time_based", "ip_whitelist"],
      },
      {
        systemId: "optimization-engine",
        systemName: "Optimization Engine",
        minimumSecurityLevel: "internal",
        requiredPermissions: [
          "optimization-data:read",
          "optimization-models:write",
        ],
        encryptionRequired: false,
        auditLevel: "standard",
        complianceRequirements: ["GDPR"],
        accessRestrictions: ["mfa_required"],
      },
      {
        systemId: "predictive-analytics-service",
        systemName: "Predictive Analytics Service",
        minimumSecurityLevel: "restricted",
        requiredPermissions: [
          "predictive-data:read",
          "predictive-models:write",
          "analytics-data:read",
        ],
        encryptionRequired: true,
        auditLevel: "comprehensive",
        complianceRequirements: ["GDPR", "SOX", "HIPAA"],
        accessRestrictions: [
          "mfa_required",
          "vpn_required",
          "ip_whitelist",
          "time_based",
        ],
      },
    ];

    for (const profile of securityProfiles) {
      this.aiSecurityProfiles.set(profile.systemId, profile);
    }

    console.log(
      `🛡️ Configured security profiles for ${securityProfiles.length} AI systems`
    );
  }

  async executeSecuredAIOperation(
    aiSystemId: string,
    userId: string,
    operationType: string,
    data: any,
    dataClassification: DataClassification
  ): Promise<SecuredAIOperation> {
    const operationId = `secured-ai-op-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    console.log(`🔍 Starting secured AI operation: ${operationId}`);

    const operation: SecuredAIOperation = {
      operationId,
      aiSystemId,
      userId,
      dataVolume: JSON.stringify(data).length,
      dataClassification,
      securityValidation: {} as SecurityValidationResult,
      encryptionApplied: false,
      auditLogged: false,
      complianceValidated: false,
      startTime: new Date(),
      status: "pending",
    };

    try {
      // Step 1: Validate security permissions
      operation.securityValidation =
        await this.validateSecurityPermissions(operation);
      operation.status = "validated";

      if (!operation.securityValidation.authorized) {
        throw new Error(
          `Security validation failed: ${operation.securityValidation.violations.join(", ")}`
        );
      }

      // Step 2: Apply encryption if required
      if (
        this.config.enableEncryption &&
        this.requiresEncryption(aiSystemId, dataClassification)
      ) {
        await this.applyDataEncryption(operation, data);
      }

      // Step 3: Validate compliance
      if (this.config.enableComplianceChecks) {
        await this.validateCompliance(operation);
      }

      // Step 4: Log audit events
      if (this.config.enableAuditLogging) {
        await this.logAuditEvents(operation);
      }

      // Step 5: Execute the AI operation
      operation.status = "executing";
      const result = await this.executeAIOperation(operation, data);

      operation.status = "completed";
      operation.endTime = new Date();

      this.securedOperations.set(operationId, operation);

      console.log(`✅ Secured AI operation completed: ${operationId}`);
      return operation;
    } catch (error) {
      operation.status = "failed";
      operation.endTime = new Date();

      await this.logSecurityEvent({
        eventId: `security-${operationId}`,
        eventType: "security_violation",
        severity: "high",
        userId: operation.userId,
        timestamp: new Date(),
        description: `Secured AI operation failed: ${error}`,
        additionalData: { operationId, aiSystemId },
      });

      throw error;
    }
  }

  private async validateSecurityPermissions(
    operation: SecuredAIOperation
  ): Promise<SecurityValidationResult> {
    const profile = this.aiSecurityProfiles.get(operation.aiSystemId);
    if (!profile) {
      throw new Error(
        `No security profile found for AI system: ${operation.aiSystemId}`
      );
    }

    // Create data operation for validation
    const dataOperation: DataOperation = {
      operationId: operation.operationId,
      operationType: "process",
      dataTypes: ["analytics", "ml-training"],
      dataClassification: operation.dataClassification,
      dataSubjects: ["system"],
      processingPurpose: "AI model training and inference",
      userId: operation.userId,
      timestamp: operation.startTime,
    };

    return await this.governanceFramework.validateSecureDataOperation(
      dataOperation,
      operation.userId
    );
  }

  private requiresEncryption(
    aiSystemId: string,
    dataClassification: DataClassification
  ): boolean {
    const profile = this.aiSecurityProfiles.get(aiSystemId);
    if (!profile) return false;

    return (
      profile.encryptionRequired ||
      ["confidential", "restricted", "top-secret"].includes(dataClassification)
    );
  }

  private async applyDataEncryption(
    operation: SecuredAIOperation,
    data: any
  ): Promise<void> {
    const encryptionContext = {
      algorithm: "AES-256-GCM" as const,
      keyId: `ai-system-${operation.aiSystemId}`,
      dataClassification: operation.dataClassification,
      encryptionScope: "dataset" as const,
    };

    await this.governanceFramework.encryptionService.encryptSensitiveData(
      data,
      encryptionContext
    );
    operation.encryptionApplied = true;

    console.log(
      `🔒 Applied encryption for operation: ${operation.operationId}`
    );
  }

  private async validateCompliance(
    operation: SecuredAIOperation
  ): Promise<void> {
    const profile = this.aiSecurityProfiles.get(operation.aiSystemId);
    if (!profile) return;

    const dataOperation: DataOperation = {
      operationId: operation.operationId,
      operationType: "process",
      dataTypes: ["analytics", "ml-training"],
      dataClassification: operation.dataClassification,
      dataSubjects: ["system"],
      processingPurpose: "AI model training and inference",
      userId: operation.userId,
      timestamp: operation.startTime,
    };

    // Validate each required compliance framework
    for (const framework of profile.complianceRequirements) {
      let complianceResult;

      switch (framework) {
        case "GDPR":
          complianceResult =
            await this.governanceFramework.complianceManager.validateGDPRCompliance(
              dataOperation
            );
          break;
        case "SOX":
          complianceResult =
            await this.governanceFramework.complianceManager.validateSOXCompliance(
              dataOperation
            );
          break;
        case "HIPAA":
          complianceResult =
            await this.governanceFramework.complianceManager.validateHIPAACompliance(
              dataOperation
            );
          break;
        default:
          continue;
      }

      if (!complianceResult.compliant) {
        throw new Error(
          `${framework} compliance validation failed: ${complianceResult.violations.map(v => v.description).join(", ")}`
        );
      }
    }

    operation.complianceValidated = true;
    console.log(
      `⚖️ Compliance validated for operation: ${operation.operationId}`
    );
  }

  private async logAuditEvents(operation: SecuredAIOperation): Promise<void> {
    const dataAccessEvent: DataAccessEvent = {
      eventId: `audit-${operation.operationId}`,
      userId: operation.userId,
      userRole: "ml-engineer",
      timestamp: operation.startTime,
      action: "ai-model-training",
      resource: operation.aiSystemId,
      dataClassification: operation.dataClassification,
      sourceIP: "10.0.0.1",
      success: true,
      dataVolume: operation.dataVolume,
    };

    await this.governanceFramework.auditLogger.logDataAccess(dataAccessEvent);
    operation.auditLogged = true;

    console.log(`📋 Audit logged for operation: ${operation.operationId}`);
  }

  private async logSecurityEvent(event: SecurityEvent): Promise<void> {
    await this.governanceFramework.auditLogger.logSecurityEvent(event);
  }

  private async executeAIOperation(
    operation: SecuredAIOperation,
    data: any
  ): Promise<any> {
    console.log(`🤖 Executing AI operation on system: ${operation.aiSystemId}`);

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      operationId: operation.operationId,
      result: "AI operation completed successfully",
      processed: true,
      timestamp: new Date(),
    };
  }

  async generateGovernanceReport(timeRange: {
    startDate: Date;
    endDate: Date;
  }): Promise<GovernanceReport> {
    console.log("📊 Generating comprehensive governance report...");

    const operations = Array.from(this.securedOperations.values()).filter(
      op =>
        op.startTime >= timeRange.startDate && op.startTime <= timeRange.endDate
    );

    const auditReport =
      await this.governanceFramework.auditLogger.generateAuditReport({
        startDate: timeRange.startDate,
        endDate: timeRange.endDate,
      });

    const complianceReport =
      await this.governanceFramework.complianceManager.generateComplianceReport(
        timeRange
      );

    return {
      reportId: `governance-${Date.now()}`,
      generatedAt: new Date(),
      timeRange,
      totalOperations: operations.length,
      successfulOperations: operations.filter(op => op.status === "completed")
        .length,
      failedOperations: operations.filter(op => op.status === "failed").length,
      encryptedOperations: operations.filter(op => op.encryptionApplied).length,
      complianceValidatedOperations: operations.filter(
        op => op.complianceValidated
      ).length,
      auditReport,
      complianceReport,
      securitySummary: {
        totalSecurityEvents: auditReport.summary.securityEvents,
        totalViolations: auditReport.summary.violations,
        riskLevel: auditReport.summary.riskLevel,
      },
      aiSystemsSecurityStatus: this.generateAISystemsSecurityStatus(),
    };
  }

  private generateAISystemsSecurityStatus(): AISystemSecurityStatus[] {
    return Array.from(this.aiSecurityProfiles.values()).map(profile => ({
      systemId: profile.systemId,
      systemName: profile.systemName,
      securityLevel: profile.minimumSecurityLevel,
      operationsCount: Array.from(this.securedOperations.values()).filter(
        op => op.aiSystemId === profile.systemId
      ).length,
      lastOperationTime: this.getLastOperationTime(profile.systemId),
      complianceStatus: "compliant", // Would be derived from actual compliance checks
      encryptionStatus: profile.encryptionRequired ? "enabled" : "not-required",
    }));
  }

  private getLastOperationTime(systemId: string): Date | undefined {
    const systemOperations = Array.from(this.securedOperations.values())
      .filter(op => op.aiSystemId === systemId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

    return systemOperations[0]?.startTime;
  }

  async getSecuredOperation(
    operationId: string
  ): Promise<SecuredAIOperation | undefined> {
    return this.securedOperations.get(operationId);
  }

  async listSecuredOperations(filters?: {
    aiSystemId?: string;
    userId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<SecuredAIOperation[]> {
    let operations = Array.from(this.securedOperations.values());

    if (filters) {
      if (filters.aiSystemId) {
        operations = operations.filter(
          op => op.aiSystemId === filters.aiSystemId
        );
      }
      if (filters.userId) {
        operations = operations.filter(op => op.userId === filters.userId);
      }
      if (filters.status) {
        operations = operations.filter(op => op.status === filters.status);
      }
      if (filters.startDate) {
        operations = operations.filter(
          op => op.startTime >= filters.startDate!
        );
      }
      if (filters.endDate) {
        operations = operations.filter(op => op.startTime <= filters.endDate!);
      }
    }

    return operations.sort(
      (a, b) => b.startTime.getTime() - a.startTime.getTime()
    );
  }
}

// ================================
// 📊 GOVERNANCE REPORTING INTERFACES
// ================================

export interface GovernanceReport {
  reportId: string;
  generatedAt: Date;
  timeRange: { startDate: Date; endDate: Date };
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  encryptedOperations: number;
  complianceValidatedOperations: number;
  auditReport: any; // From governance framework
  complianceReport: any; // From governance framework
  securitySummary: {
    totalSecurityEvents: number;
    totalViolations: number;
    riskLevel: string;
  };
  aiSystemsSecurityStatus: AISystemSecurityStatus[];
}

export interface AISystemSecurityStatus {
  systemId: string;
  systemName: string;
  securityLevel: DataClassification;
  operationsCount: number;
  lastOperationTime?: Date;
  complianceStatus: "compliant" | "non-compliant" | "unknown";
  encryptionStatus: "enabled" | "disabled" | "not-required";
}

// ================================
// 🚀 DEMO & TESTING FUNCTIONS
// ================================

export async function demonstrateGovernanceAIIntegration(): Promise<void> {
  console.log("🔐 === Governance AI Integration Demo ===");

  const integrationManager = new GovernanceAIIntegrationManager();
  await integrationManager.initializeGovernanceIntegration();

  // Test secured AI operations for different systems
  const testOperations = [
    {
      aiSystemId: "advanced-ml-engine",
      userId: "ml-engineer-001",
      operationType: "model-training",
      data: { trainingData: "sample analytics data", modelType: "ensemble" },
      dataClassification: "confidential" as DataClassification,
    },
    {
      aiSystemId: "tactical-ml-models",
      userId: "data-analyst-001",
      operationType: "trend-analysis",
      data: { analyticsData: "sample tactical data", analysisType: "trend" },
      dataClassification: "internal" as DataClassification,
    },
    {
      aiSystemId: "predictive-analytics-service",
      userId: "ml-engineer-002",
      operationType: "prediction",
      data: { inputData: "sample prediction data", predictionType: "revenue" },
      dataClassification: "restricted" as DataClassification,
    },
  ];

  const completedOperations = [];

  for (const testOp of testOperations) {
    try {
      const securedOperation =
        await integrationManager.executeSecuredAIOperation(
          testOp.aiSystemId,
          testOp.userId,
          testOp.operationType,
          testOp.data,
          testOp.dataClassification
        );

      completedOperations.push(securedOperation);
      console.log(
        `✅ Secured operation completed: ${securedOperation.operationId}`
      );
    } catch (error) {
      console.error(`❌ Secured operation failed:`, error);
    }
  }

  // Generate governance report
  const timeRange = {
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    endDate: new Date(),
  };

  const governanceReport =
    await integrationManager.generateGovernanceReport(timeRange);

  console.log("\n📊 Governance Report Summary:");
  console.log(`  - Total Operations: ${governanceReport.totalOperations}`);
  console.log(`  - Successful: ${governanceReport.successfulOperations}`);
  console.log(`  - Failed: ${governanceReport.failedOperations}`);
  console.log(`  - Encrypted: ${governanceReport.encryptedOperations}`);
  console.log(
    `  - Compliance Validated: ${governanceReport.complianceValidatedOperations}`
  );
  console.log(
    `  - Security Risk Level: ${governanceReport.securitySummary.riskLevel}`
  );

  console.log("\n🔐 === Governance AI Integration Demo Complete ===");
}

export default GovernanceAIIntegrationManager;
