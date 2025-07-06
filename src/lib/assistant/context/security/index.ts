// Main security module exports for AI Context Retention System
// This module provides comprehensive security features including:
// - Field-level encryption
// - Audit logging
// - Consent management
// - Data anonymization
// - Access control
// - Security incident management

// Core security components
export {
  FieldEncryption,
  ContextEncryption,
  getContextEncryption,
  type EncryptionConfig,
  type EncryptedData,
  DEFAULT_ENCRYPTION_CONFIG,
} from "./encryption";

export {
  AuditLogger,
  auditLogger,
  audit,
  type AuditAction,
  type AuditSeverity,
  type AuditLogEntry,
  type AuditQueryFilter,
  type AuditStatistics,
} from "./audit-logger";

export {
  ConsentManager,
  consentManager,
  consent,
  type ConsentType,
  type ConsentStatus,
  type ConsentRecord,
  type ConsentRequest,
  type ConsentSummary,
  type ConsentPolicy,
} from "./consent-manager";

export {
  DataAnonymizer,
  dataAnonymizer,
  anonymize,
  type AnonymizationLevel,
  type DataType,
  type AnonymizationRule,
  type AnonymizationConfig,
  type AnonymizationResult,
} from "./data-anonymizer";

export {
  AccessController,
  accessController,
  access,
  accessConfigs,
  type Permission,
  type Role,
  type AccessControlConfig,
  type UserContext,
} from "./access-control";

export {
  SecurityManager,
  securityManager,
  type SecurityViolationType,
  type SecurityViolation,
  type SecurityReport,
} from "./security-manager";

// Utility functions for common security operations
export const security = {
  /**
   * Initialize security system with configuration
   */
  async initialize(config?: Partial<any>): Promise<void> {
    // Security system initialization logic would go here
    console.log("Security system initialized with config:", config);
  },

  /**
   * Quick security check for user operations
   */
  async checkUserAccess(
    userId: string,
    operation: string,
    resource?: string
  ): Promise<{
    allowed: boolean;
    reason?: string;
    requiredConsents?: ConsentType[];
  }> {
    try {
      // Check basic consent requirements
      const requiredConsents: ConsentType[] = ["data_collection"];

      if (operation.includes("write") || operation.includes("update")) {
        requiredConsents.push("data_processing");
      }

      if (operation.includes("retain") || operation.includes("store")) {
        requiredConsents.push("context_retention");
      }

      const consents = await consentManager.hasValidConsents(
        userId,
        requiredConsents
      );
      const missingConsents = requiredConsents.filter(
        consent => !consents[consent]
      );

      if (missingConsents.length > 0) {
        return {
          allowed: false,
          reason: `Missing required consents: ${missingConsents.join(", ")}`,
          requiredConsents: missingConsents,
        };
      }

      return { allowed: true };
    } catch (error) {
      return {
        allowed: false,
        reason: `Security check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },

  /**
   * Secure data processing pipeline
   */
  async processSecurely<T>(
    data: T,
    userId: string,
    operation: string,
    options: {
      encrypt?: boolean;
      anonymize?: boolean;
      audit?: boolean;
      checkConsent?: boolean;
    } = {}
  ): Promise<T> {
    const {
      encrypt = true,
      anonymize = false,
      audit = true,
      checkConsent = true,
    } = options;

    try {
      // 1. Check user access
      if (checkConsent) {
        const accessCheck = await security.checkUserAccess(userId, operation);
        if (!accessCheck.allowed) {
          throw new Error(accessCheck.reason);
        }
      }

      // 2. Anonymize if requested
      let processedData = data;
      if (anonymize) {
        const anonymizationResult = await dataAnonymizer.anonymize(
          data,
          "medium"
        );
        processedData = anonymizationResult.anonymizedData;
      }

      // 3. Encrypt if requested
      if (encrypt && typeof processedData === "string") {
        const encryption = getContextEncryption();
        const encrypted = encryption.encryptUserQuery(processedData);
        processedData = encrypted as T;
      }

      // 4. Audit log if requested
      if (audit) {
        await auditLogger.logSuccess(
          `data.${operation}` as AuditAction,
          "low",
          {
            userId,
            details: {
              operation,
              dataSize: JSON.stringify(data).length,
              encrypted,
              anonymized: anonymize,
            },
          }
        );
      }

      return processedData;
    } catch (error) {
      // Log security failure
      if (audit) {
        await auditLogger.logFailure("system.error", error as Error, "medium", {
          userId,
          details: {
            operation,
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });
      }
      throw error;
    }
  },

  /**
   * Validate security compliance
   */
  async validateCompliance(userId: string): Promise<{
    compliant: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check consent compliance
      const consentSummary = await consentManager.getConsentSummary(userId);
      const requiredConsents = consentManager
        .getAllPolicies()
        .filter(policy => policy.required)
        .map(policy => policy.type);

      const missingRequired = requiredConsents.filter(
        consent =>
          !consentSummary.consentsByType[consent] ||
          consentSummary.consentsByType[consent] !== "granted"
      );

      if (missingRequired.length > 0) {
        issues.push(`Missing required consents: ${missingRequired.join(", ")}`);
        recommendations.push("Obtain missing consent from user");
      }

      // Check data retention compliance
      if (consentSummary.expiredConsents > 0) {
        issues.push(`${consentSummary.expiredConsents} expired consents found`);
        recommendations.push("Update or renew expired consents");
      }

      return {
        compliant: issues.length === 0,
        issues,
        recommendations,
      };
    } catch (error) {
      return {
        compliant: false,
        issues: [
          `Compliance check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
        recommendations: ["Review security configuration and retry"],
      };
    }
  },

  /**
   * Emergency security lockdown
   */
  async emergencyLockdown(
    reason: string,
    userId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      // Log security incident
      await auditLogger.logSecurityIncident(
        {
          reason,
          lockdownInitiated: true,
          timestamp: new Date().toISOString(),
          ...details,
        },
        {
          userId,
          severity: "critical",
        }
      );

      // Disable processing (implementation specific)
      console.error("SECURITY LOCKDOWN INITIATED:", reason);

      // Additional lockdown procedures would go here
      // - Disable API endpoints
      // - Revoke active sessions
      // - Alert administrators
      // - etc.
    } catch (error) {
      console.error("Failed to initiate security lockdown:", error);
    }
  },

  /**
   * Generate security health check
   */
  async healthCheck(): Promise<{
    status: "healthy" | "warning" | "critical";
    components: Record<
      string,
      {
        status: "ok" | "warning" | "error";
        message?: string;
      }
    >;
    score: number;
  }> {
    const components: Record<
      string,
      { status: "ok" | "warning" | "error"; message?: string }
    > = {};
    let totalScore = 0;
    let maxScore = 0;

    try {
      // Check encryption
      try {
        const encryption = getContextEncryption();
        encryption.generateApiKey(); // Test encryption
        components.encryption = { status: "ok" };
        totalScore += 25;
      } catch (error) {
        components.encryption = {
          status: "error",
          message:
            error instanceof Error ? error.message : "Encryption system error",
        };
      }
      maxScore += 25;

      // Check audit logging
      try {
        await auditLogger.logSuccess("system.health_check", "low");
        components.audit = { status: "ok" };
        totalScore += 25;
      } catch (error) {
        components.audit = {
          status: "error",
          message:
            error instanceof Error ? error.message : "Audit system error",
        };
      }
      maxScore += 25;

      // Check consent manager
      try {
        consentManager.getAllPolicies(); // Test consent system
        components.consent = { status: "ok" };
        totalScore += 25;
      } catch (error) {
        components.consent = {
          status: "error",
          message:
            error instanceof Error ? error.message : "Consent system error",
        };
      }
      maxScore += 25;

      // Check data anonymizer
      try {
        dataAnonymizer.detectPII("test@example.com"); // Test anonymization
        components.anonymization = { status: "ok" };
        totalScore += 25;
      } catch (error) {
        components.anonymization = {
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Anonymization system error",
        };
      }
      maxScore += 25;

      const score = Math.round((totalScore / maxScore) * 100);
      let status: "healthy" | "warning" | "critical" = "healthy";

      if (score < 50) {
        status = "critical";
      } else if (score < 80) {
        status = "warning";
      }

      return { status, components, score };
    } catch (error) {
      return {
        status: "critical",
        components: {
          system: {
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "System health check failed",
          },
        },
        score: 0,
      };
    }
  },
};

// Default security configuration
export const defaultSecurityConfig: SecurityConfig = {
  encryption: {
    enabled: true,
    rotationDays: 90,
    algorithm: "aes-256-gcm",
  },
  auditing: {
    enabled: true,
    retentionDays: 365,
    logLevel: "low",
  },
  consent: {
    strictMode: true,
    requiredConsents: ["data_collection", "data_processing"],
    gracePeriodDays: 7,
  },
  anonymization: {
    enabled: true,
    defaultLevel: "medium",
    piiDetection: true,
  },
  dataRetention: {
    conversationDays: 90,
    profileDays: 365,
    sessionDays: 30,
    anonymizationDays: 365,
    hardDeleteDays: 1095,
  },
  breachDetection: {
    enabled: true,
    thresholds: {
      failedLogins: 10,
      dataAccess: 100,
      exports: 5,
    },
  },
};

// Export security configuration type
export type { SecurityConfig } from "./security-manager";
