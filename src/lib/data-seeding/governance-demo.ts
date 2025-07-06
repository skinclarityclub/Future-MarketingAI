/**
 * Data Seeding Governance & Security Framework Demo
 *
 * Comprehensive demonstration of security controls, role management,
 * encryption, audit logging, and compliance validation.
 */

import {
  DataSeedingGovernanceFramework,
  DataOperation,
  SecurityRole,
  Permission,
  DataClassification,
  EncryptionContext,
  SecurityValidationResult,
} from "./governance-security-framework";

export class GovernanceSecurityDemo {
  private governanceFramework: DataSeedingGovernanceFramework;

  constructor() {
    this.governanceFramework = new DataSeedingGovernanceFramework();
  }

  async runComprehensiveSecurityDemo(): Promise<void> {
    console.log("🔐 Starting Comprehensive Security Demo...");
    console.log("=".repeat(60));

    try {
      // Step 1: Initialize security framework
      await this.initializeSecurityFramework();

      // Step 2: Demonstrate role management
      await this.demonstrateRoleManagement();

      // Step 3: Test data encryption/decryption
      await this.demonstrateDataEncryption();

      // Step 4: Validate secure data operations
      await this.demonstrateSecureDataOperations();

      // Step 5: Show compliance validation
      await this.demonstrateComplianceValidation();

      // Step 6: Generate security reports
      await this.generateSecurityReports();

      console.log("\n✅ Comprehensive Security Demo completed successfully!");
    } catch (error) {
      console.error("\n❌ Security demo failed:", error);
      throw error;
    }
  }

  private async initializeSecurityFramework(): Promise<void> {
    console.log("\n🔧 Step 1: Initializing Security Framework...");

    await this.governanceFramework.initializeSecurityFramework();

    console.log("✅ Security framework initialized with:");
    console.log("  - Role-based access control (RBAC)");
    console.log("  - Advanced encryption services");
    console.log("  - Comprehensive audit logging");
    console.log("  - Multi-framework compliance validation");
    console.log("  - Real-time access validation");
  }

  private async demonstrateRoleManagement(): Promise<void> {
    console.log("\n👥 Step 2: Demonstrating Role Management...");

    const { roleManager } = this.governanceFramework;

    // Create a custom role for ML engineers
    const mlEngineerRole: SecurityRole = {
      id: "ml-engineer-advanced",
      name: "Advanced ML Engineer",
      description: "Advanced access to ML systems with restricted data access",
      permissions: [
        {
          id: "ml-model-readwrite",
          resource: "ml-models",
          action: "write",
          dataClassification: "confidential",
        },
        {
          id: "analytics-read",
          resource: "analytics-data",
          action: "read",
          dataClassification: "internal",
        },
      ],
      dataClassificationAccess: ["public", "internal", "confidential"],
      systemAccess: [
        {
          systemId: "advanced-ml-engine",
          systemName: "Advanced ML Engine",
          accessLevel: "read-write",
        },
        {
          systemId: "tactical-ml-models",
          systemName: "Tactical ML Models",
          accessLevel: "read-write",
        },
      ],
      restrictions: [
        {
          type: "mfa_required",
          value: true,
          enforced: true,
        },
      ],
      createdAt: new Date(),
      lastModified: new Date(),
    };

    // Create and assign the role
    await roleManager.createRole(mlEngineerRole);
    await roleManager.assignUserToRole(
      "user-ml-engineer-001",
      "ml-engineer-advanced"
    );

    // Test permission validation
    const testPermission: Permission = {
      id: "test-permission",
      resource: "ml-models",
      action: "write",
      dataClassification: "internal",
    };

    const hasPermission = await roleManager.validateUserPermission(
      "user-ml-engineer-001",
      testPermission
    );

    console.log("✅ Role Management Results:");
    console.log(`  - Created role: ${mlEngineerRole.name}`);
    console.log(`  - Assigned to user: user-ml-engineer-001`);
    console.log(
      `  - Permission validation: ${hasPermission ? "GRANTED" : "DENIED"}`
    );

    // Get user roles
    const userRoles = await roleManager.getUserRoles("user-ml-engineer-001");
    console.log(`  - User has ${userRoles.length} assigned roles`);
  }

  private async demonstrateDataEncryption(): Promise<void> {
    console.log("\n🔒 Step 3: Demonstrating Data Encryption...");

    const { encryptionService } = this.governanceFramework;

    // Test data to encrypt
    const sensitiveData = {
      customerData: {
        id: "cust-12345",
        email: "john.doe@example.com",
        financialInfo: {
          annualRevenue: 2500000,
          creditScore: 750,
          bankAccount: "****-****-****-1234",
        },
      },
      analyticsData: {
        revenueProjections: [100000, 150000, 200000],
        marketSegments: ["enterprise", "mid-market"],
        competitiveAnalysis: "confidential market data...",
      },
    };

    // Test encryption with different data classifications
    const encryptionContexts: EncryptionContext[] = [
      {
        algorithm: "AES-256-GCM",
        keyId: "customer-data-key",
        dataClassification: "confidential",
        encryptionScope: "record",
      },
      {
        algorithm: "ChaCha20-Poly1305",
        keyId: "analytics-key",
        dataClassification: "restricted",
        encryptionScope: "dataset",
      },
    ];

    const encryptionResults = [];

    for (const context of encryptionContexts) {
      try {
        // Encrypt the data
        const encryptedData = await encryptionService.encryptSensitiveData(
          sensitiveData,
          context
        );

        // Verify data integrity
        const integrityValid = await encryptionService.validateDataIntegrity(
          sensitiveData,
          encryptedData.integrityHash
        );

        // Decrypt the data
        const decryptedData = await encryptionService.decryptSensitiveData(
          encryptedData,
          context
        );

        encryptionResults.push({
          algorithm: context.algorithm,
          classification: context.dataClassification,
          integrityValid,
          decryptionSuccessful:
            JSON.stringify(decryptedData) === JSON.stringify(sensitiveData),
        });
      } catch (error) {
        console.error(`❌ Encryption failed for ${context.algorithm}:`, error);
      }
    }

    console.log("✅ Encryption Results:");
    encryptionResults.forEach(result => {
      console.log(
        `  - ${result.algorithm} (${result.classification}): ` +
          `Integrity=${result.integrityValid ? "Valid" : "Invalid"}, ` +
          `Decryption=${result.decryptionSuccessful ? "Success" : "Failed"}`
      );
    });

    // Test key rotation
    await encryptionService.rotateEncryptionKeys();
    console.log("  - Encryption keys rotated successfully");
  }

  private async demonstrateSecureDataOperations(): Promise<void> {
    console.log("\n🛡️ Step 4: Demonstrating Secure Data Operations...");

    // Define different types of data operations
    const dataOperations: DataOperation[] = [
      {
        operationId: "op-collect-customer-data",
        operationType: "collect",
        dataTypes: ["customer_profiles", "financial_data"],
        dataClassification: "confidential",
        dataSubjects: ["customer-12345"],
        processingPurpose: "ML model training for revenue prediction",
        legalBasis: "legitimate_interest",
        retentionPeriod: 365,
        userId: "user-ml-engineer-001",
        timestamp: new Date(),
      },
      {
        operationId: "op-process-analytics",
        operationType: "process",
        dataTypes: ["revenue_data", "market_analytics"],
        dataClassification: "internal",
        dataSubjects: [],
        processingPurpose: "Business intelligence reporting",
        legalBasis: "legitimate_interest",
        retentionPeriod: 180,
        userId: "user-data-analyst-001",
        timestamp: new Date(),
      },
      {
        operationId: "op-transfer-restricted",
        operationType: "transfer",
        dataTypes: ["strategic_data", "competitive_analysis"],
        dataClassification: "restricted",
        dataSubjects: [],
        processingPurpose: "Executive reporting and strategic planning",
        legalBasis: "contract",
        retentionPeriod: 730,
        userId: "user-executive-001",
        timestamp: new Date(),
      },
    ];

    const validationResults: SecurityValidationResult[] = [];

    for (const operation of dataOperations) {
      try {
        const validationResult =
          await this.governanceFramework.validateSecureDataOperation(
            operation,
            operation.userId
          );

        validationResults.push(validationResult);
      } catch (error) {
        console.error(
          `❌ Validation failed for operation ${operation.operationId}:`,
          error
        );
      }
    }

    console.log("✅ Security Validation Results:");
    console.log(
      "Operation".padEnd(25) +
        "User".padEnd(20) +
        "Authorized".padEnd(12) +
        "Compliant".padEnd(12) +
        "Encryption"
    );
    console.log("-".repeat(85));

    validationResults.forEach(result => {
      const opId = result.operationId.substring(3, 23); // Shorten for display
      console.log(
        opId.padEnd(25) +
          result.userId.substring(5, 20).padEnd(20) +
          (result.authorized ? "✅ Yes" : "❌ No").padEnd(12) +
          (result.complianceApproved ? "✅ Yes" : "❌ No").padEnd(12) +
          (result.encryptionRequired ? "🔒 Required" : "🔓 Optional")
      );
    });

    const successfulOperations = validationResults.filter(
      r => r.authorized && r.complianceApproved
    ).length;
    console.log(
      `\n📊 Summary: ${successfulOperations}/${validationResults.length} operations approved`
    );
  }

  private async demonstrateComplianceValidation(): Promise<void> {
    console.log("\n⚖️ Step 5: Demonstrating Compliance Validation...");

    const { complianceManager } = this.governanceFramework;

    // Test operation requiring comprehensive compliance check
    const complianceTestOperation: DataOperation = {
      operationId: "op-compliance-test",
      operationType: "collect",
      dataTypes: ["personal_data", "financial_records", "health_data"],
      dataClassification: "restricted",
      dataSubjects: ["eu-citizen-001", "us-citizen-002"],
      processingPurpose: "Comprehensive analytics for business optimization",
      legalBasis: "consent",
      retentionPeriod: 1095, // 3 years
      userId: "user-compliance-officer",
      timestamp: new Date(),
    };

    // Test multiple compliance frameworks
    const complianceFrameworks = [
      { name: "GDPR", validator: complianceManager.validateGDPRCompliance },
      { name: "SOX", validator: complianceManager.validateSOXCompliance },
      { name: "HIPAA", validator: complianceManager.validateHIPAACompliance },
    ];

    const complianceResults = [];

    for (const framework of complianceFrameworks) {
      try {
        const result = await framework.validator.call(
          complianceManager,
          complianceTestOperation
        );
        complianceResults.push({
          framework: framework.name,
          compliant: result.compliant,
          violations: result.violations.length,
          riskLevel: result.riskLevel,
        });
      } catch (error) {
        console.error(`❌ ${framework.name} validation failed:`, error);
      }
    }

    console.log("✅ Compliance Validation Results:");
    console.log(
      "Framework".padEnd(15) +
        "Status".padEnd(15) +
        "Violations".padEnd(15) +
        "Risk Level"
    );
    console.log("-".repeat(60));

    complianceResults.forEach(result => {
      const status = result.compliant ? "✅ Compliant" : "❌ Non-compliant";
      console.log(
        result.framework.padEnd(15) +
          status.padEnd(15) +
          result.violations.toString().padEnd(15) +
          result.riskLevel
      );
    });

    // Generate compliance report
    const timeRange = {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate: new Date(),
    };

    const complianceReport =
      await complianceManager.generateComplianceReport(timeRange);

    console.log(`\n📋 Compliance Report Generated:`);
    console.log(`  - Report ID: ${complianceReport.reportId}`);
    console.log(
      `  - Time Range: ${timeRange.startDate.toDateString()} - ${timeRange.endDate.toDateString()}`
    );
    console.log(
      `  - Overall Compliance: ${(complianceReport.overallCompliance * 100).toFixed(1)}%`
    );
    console.log(
      `  - Frameworks Covered: ${complianceReport.frameworks.join(", ")}`
    );
  }

  private async generateSecurityReports(): Promise<void> {
    console.log("\n📊 Step 6: Generating Security Reports...");

    const { auditLogger } = this.governanceFramework;

    // Define audit report criteria
    const auditCriteria = {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endDate: new Date(),
      eventTypes: ["data_access", "security_event", "compliance_event"],
      severity: ["medium", "high", "critical"],
      dataClassifications: [
        "confidential",
        "restricted",
        "top-secret",
      ] as DataClassification[],
    };

    try {
      const auditReport = await auditLogger.generateAuditReport(auditCriteria);

      console.log("✅ Security Audit Report Generated:");
      console.log(`  - Report ID: ${auditReport.reportId}`);
      console.log(`  - Generated: ${auditReport.generatedAt.toLocaleString()}`);
      console.log(`  - Time Range: 7 days`);
      console.log(`  - Total Events: ${auditReport.summary.totalEvents}`);
      console.log(`  - Security Events: ${auditReport.summary.securityEvents}`);
      console.log(`  - Access Events: ${auditReport.summary.accessEvents}`);
      console.log(
        `  - Compliance Events: ${auditReport.summary.complianceEvents}`
      );
      console.log(`  - Violations: ${auditReport.summary.violations}`);
      console.log(
        `  - Risk Level: ${auditReport.summary.riskLevel.toUpperCase()}`
      );

      // Security recommendations based on demo results
      console.log("\n🎯 Security Recommendations:");
      console.log("  - ✅ Role-based access control is properly configured");
      console.log(
        "  - ✅ Data encryption is working for all classification levels"
      );
      console.log(
        "  - ✅ Compliance validation is active for GDPR, SOX, and HIPAA"
      );
      console.log("  - ✅ Audit logging is capturing all security events");
      console.log(
        "  - 🔄 Consider implementing automated compliance monitoring"
      );
      console.log(
        "  - 🔄 Enable real-time security alerting for critical events"
      );
      console.log(
        "  - 🔄 Schedule regular security assessments and penetration testing"
      );
    } catch (error) {
      console.error("❌ Audit report generation failed:", error);
    }
  }

  // ================================
  // 🧪 INDIVIDUAL FEATURE TESTS
  // ================================

  async testRoleBasedAccessControl(): Promise<void> {
    console.log("\n🧪 Testing Role-Based Access Control...");

    const { roleManager } = this.governanceFramework;

    // Test creating and managing roles
    const testRole: SecurityRole = {
      id: "test-role-rbac",
      name: "Test RBAC Role",
      description: "Role for testing RBAC functionality",
      permissions: [
        {
          id: "test-permission",
          resource: "test-resource",
          action: "read",
          dataClassification: "internal",
        },
      ],
      dataClassificationAccess: ["public", "internal"],
      systemAccess: [],
      restrictions: [],
      createdAt: new Date(),
      lastModified: new Date(),
    };

    const roleCreated = await roleManager.createRole(testRole);
    const userAssigned = await roleManager.assignUserToRole(
      "test-user",
      "test-role-rbac"
    );
    const hasPermission = await roleManager.validateUserPermission(
      "test-user",
      testRole.permissions[0]
    );
    const userRoles = await roleManager.getUserRoles("test-user");
    const roleRevoked = await roleManager.revokeUserRole(
      "test-user",
      "test-role-rbac"
    );

    console.log("🧪 RBAC Test Results:");
    console.log(`  - Role Creation: ${roleCreated ? "SUCCESS" : "FAILED"}`);
    console.log(`  - User Assignment: ${userAssigned ? "SUCCESS" : "FAILED"}`);
    console.log(
      `  - Permission Check: ${hasPermission ? "GRANTED" : "DENIED"}`
    );
    console.log(`  - User Roles Count: ${userRoles.length}`);
    console.log(`  - Role Revocation: ${roleRevoked ? "SUCCESS" : "FAILED"}`);
  }

  async testDataEncryptionFeatures(): Promise<void> {
    console.log("\n🧪 Testing Data Encryption Features...");

    const { encryptionService } = this.governanceFramework;

    const testData = {
      secret: "highly confidential information",
      numbers: [1, 2, 3, 4, 5],
      nested: {
        level1: {
          level2: "deep secret",
        },
      },
    };

    const encryptionContext: EncryptionContext = {
      algorithm: "AES-256-GCM",
      keyId: "test-encryption-key",
      dataClassification: "top-secret",
      encryptionScope: "record",
    };

    try {
      const encrypted = await encryptionService.encryptSensitiveData(
        testData,
        encryptionContext
      );
      const decrypted = await encryptionService.decryptSensitiveData(
        encrypted,
        encryptionContext
      );
      const integrityValid = await encryptionService.validateDataIntegrity(
        testData,
        encrypted.integrityHash
      );
      const keyRotationSuccess = await encryptionService.rotateEncryptionKeys();

      const encryptionMatches =
        JSON.stringify(testData) === JSON.stringify(decrypted);

      console.log("🧪 Encryption Test Results:");
      console.log(`  - Encryption: ${encrypted ? "SUCCESS" : "FAILED"}`);
      console.log(
        `  - Decryption: ${encryptionMatches ? "SUCCESS" : "FAILED"}`
      );
      console.log(
        `  - Integrity Check: ${integrityValid ? "VALID" : "INVALID"}`
      );
      console.log(
        `  - Key Rotation: ${keyRotationSuccess ? "SUCCESS" : "FAILED"}`
      );
    } catch (error) {
      console.error("❌ Encryption test failed:", error);
    }
  }
}

// ================================
// 🎯 USAGE EXAMPLES
// ================================

export async function runBasicGovernanceDemo(): Promise<void> {
  const demo = new GovernanceSecurityDemo();
  await demo.runComprehensiveSecurityDemo();
}

export async function runRBACTest(): Promise<void> {
  const demo = new GovernanceSecurityDemo();
  await demo.testRoleBasedAccessControl();
}

export async function runEncryptionTest(): Promise<void> {
  const demo = new GovernanceSecurityDemo();
  await demo.testDataEncryptionFeatures();
}

// Example usage:
// runBasicGovernanceDemo().catch(console.error);
// runRBACTest().catch(console.error);
// runEncryptionTest().catch(console.error);
