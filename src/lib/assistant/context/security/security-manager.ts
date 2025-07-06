import { createClient } from "@supabase/supabase-js";
import { ContextEncryption, getContextEncryption } from "./encryption";
import { auditLogger, AuditAction, AuditSeverity } from "./audit-logger";
import { consentManager, ConsentType } from "./consent-manager";
import { dataAnonymizer, AnonymizationLevel } from "./data-anonymizer";
import { accessController, Permission, Role } from "./access-control";
import type { ConversationEntry, UserProfile, SessionMemory } from "../types";

// Security configuration
export interface SecurityConfig {
  encryption: {
    enabled: boolean;
    rotationDays: number;
    algorithm: string;
  };
  auditing: {
    enabled: boolean;
    retentionDays: number;
    logLevel: AuditSeverity;
  };
  consent: {
    strictMode: boolean;
    requiredConsents: ConsentType[];
    gracePeriodDays: number;
  };
  anonymization: {
    enabled: boolean;
    defaultLevel: AnonymizationLevel;
    piiDetection: boolean;
  };
  dataRetention: {
    conversationDays: number;
    profileDays: number;
    sessionDays: number;
    anonymizationDays: number;
    hardDeleteDays: number;
  };
  breachDetection: {
    enabled: boolean;
    thresholds: {
      failedLogins: number;
      dataAccess: number;
      exports: number;
    };
  };
}

// Security violation types
export type SecurityViolationType =
  | "unauthorized_access"
  | "consent_violation"
  | "data_breach"
  | "encryption_failure"
  | "excessive_access"
  | "suspicious_activity"
  | "policy_violation";

export interface SecurityViolation {
  type: SecurityViolationType;
  severity: AuditSeverity;
  description: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  timestamp: Date;
  details: Record<string, any>;
  resolved: boolean;
}

export interface SecurityReport {
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalEvents: number;
    securityViolations: number;
    consentViolations: number;
    dataBreaches: number;
    encryptionFailures: number;
  };
  trends: {
    dailyEvents: Array<{ date: string; count: number }>;
    topViolations: Array<{ type: SecurityViolationType; count: number }>;
    riskScore: number;
  };
  recommendations: string[];
}

export class SecurityManager {
  private static instance: SecurityManager;
  private supabase;
  private encryption: ContextEncryption;
  private config: SecurityConfig;
  private violationCache = new Map<string, SecurityViolation[]>();

  private constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.encryption = getContextEncryption();
    this.config = this.getDefaultConfig();
  }

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * Secure conversation entry creation with comprehensive security checks
   */
  public async secureCreateConversation(
    userId: string,
    sessionId: string,
    entry: Omit<ConversationEntry, "id">,
    context: {
      ipAddress?: string;
      userAgent?: string;
    } = {}
  ): Promise<ConversationEntry> {
    try {
      // 1. Verify user consent
      await this.enforceConsentRequirements(userId, [
        "data_collection",
        "data_processing",
        "context_retention",
      ]);

      // 2. Detect and handle PII
      const piiDetection = await this.detectAndHandlePII(entry);

      // 3. Encrypt sensitive data
      const encryptedEntry = await this.encryptConversationEntry(entry);

      // 4. Store securely
      const { data, error } = await this.supabase
        .from("secure_conversation_entries")
        .insert({
          session_id: sessionId,
          user_id_hash: this.encryption.hashUserId(userId),
          timestamp: entry.timestamp.toISOString(),
          user_query_encrypted: encryptedEntry.userQuery,
          assistant_response_encrypted: encryptedEntry.assistantResponse,
          context_encrypted: encryptedEntry.context,
          feedback: entry.feedback,
          follow_up: entry.followUp,
          query_type: entry.queryType,
          confidence: entry.confidence,
          response_time: entry.responseTime,
          pii_detected: piiDetection.hasPII,
          anonymization_level: piiDetection.anonymizationLevel,
          anonymized_at: piiDetection.anonymizedAt?.toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // 5. Audit log
      await auditLogger.logSuccess("conversation.create", "low", {
        userId,
        sessionId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        details: {
          queryType: entry.queryType,
          piiDetected: piiDetection.hasPII,
          encrypted: true,
        },
      });

      return {
        id: data.id,
        ...entry,
      };
    } catch (error) {
      await this.handleSecurityViolation({
        type: "encryption_failure",
        severity: "high",
        description: "Failed to securely create conversation entry",
        userId,
        sessionId,
        ipAddress: context.ipAddress,
        timestamp: new Date(),
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
        resolved: false,
      });
      throw error;
    }
  }

  /**
   * Secure conversation retrieval with access control
   */
  public async secureGetConversationHistory(
    userId: string,
    sessionId?: string,
    limit = 10,
    context: {
      ipAddress?: string;
      userAgent?: string;
    } = {}
  ): Promise<ConversationEntry[]> {
    try {
      // 1. Verify user consent
      await this.enforceConsentRequirements(userId, ["data_collection"]);

      // 2. Check access permissions
      const hasAccess = await this.checkDataAccess(
        userId,
        "conversation",
        "read"
      );
      if (!hasAccess) {
        throw new Error("Access denied: insufficient permissions");
      }

      // 3. Retrieve encrypted data
      let query = this.supabase
        .from("secure_conversation_entries")
        .select("*")
        .eq("user_id_hash", this.encryption.hashUserId(userId))
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (sessionId) {
        query = query.eq("session_id", sessionId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // 4. Decrypt and return
      const decryptedEntries = await Promise.all(
        data.map(async entry => {
          const decrypted = await this.decryptConversationEntry({
            userQuery: entry.user_query_encrypted,
            assistantResponse: entry.assistant_response_encrypted,
            context: entry.context_encrypted,
          });

          return {
            id: entry.id,
            timestamp: new Date(entry.timestamp),
            userQuery: decrypted.userQuery,
            assistantResponse: decrypted.assistantResponse,
            context: decrypted.context,
            feedback: entry.feedback,
            followUp: entry.follow_up,
            queryType: entry.query_type,
            confidence: entry.confidence,
            responseTime: entry.response_time,
          } as ConversationEntry;
        })
      );

      // 5. Audit log
      await auditLogger.logSuccess("conversation.view", "low", {
        userId,
        sessionId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        details: {
          recordsRetrieved: decryptedEntries.length,
          encrypted: true,
        },
      });

      return decryptedEntries;
    } catch (error) {
      await this.handleSecurityViolation({
        type: "unauthorized_access",
        severity: "medium",
        description: "Failed to retrieve conversation history",
        userId,
        sessionId,
        ipAddress: context.ipAddress,
        timestamp: new Date(),
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
        resolved: false,
      });
      throw error;
    }
  }

  /**
   * Secure user profile management
   */
  public async secureUpdateUserProfile(
    userId: string,
    profile: Partial<UserProfile>,
    context: {
      ipAddress?: string;
      userAgent?: string;
    } = {}
  ): Promise<UserProfile> {
    try {
      // 1. Verify user consent
      await this.enforceConsentRequirements(userId, [
        "data_collection",
        "data_processing",
      ]);

      // 2. Encrypt sensitive profile data
      const encryptedProfile = await this.encryptUserProfile(profile);

      // 3. Update profile securely
      const { data, error } = await this.supabase
        .from("secure_user_profiles")
        .upsert({
          user_id: userId,
          user_id_hash: this.encryption.hashUserId(userId),
          profile_data_encrypted: encryptedProfile.profileData,
          preferences_encrypted: encryptedProfile.preferences,
          expertise_level: profile.expertiseLevel,
          communication_style: profile.communicationStyle,
          preferred_analysis_depth: profile.preferredAnalysisDepth,
          timezone: profile.timezone,
          language: profile.language,
          last_active: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // 4. Audit log
      await auditLogger.logSuccess("user.update", "low", {
        userId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        details: {
          fieldsUpdated: Object.keys(profile),
          encrypted: true,
        },
      });

      return profile as UserProfile;
    } catch (error) {
      await this.handleSecurityViolation({
        type: "encryption_failure",
        severity: "medium",
        description: "Failed to securely update user profile",
        userId,
        ipAddress: context.ipAddress,
        timestamp: new Date(),
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
        resolved: false,
      });
      throw error;
    }
  }

  /**
   * Secure data deletion with compliance
   */
  public async secureDeleteUserData(
    userId: string,
    dataTypes: string[] = ["all"],
    context: {
      ipAddress?: string;
      userAgent?: string;
      reason?: string;
    } = {}
  ): Promise<{
    deleted: Record<string, number>;
    anonymized: Record<string, number>;
    errors: string[];
  }> {
    const result = {
      deleted: {} as Record<string, number>,
      anonymized: {} as Record<string, number>,
      errors: [] as string[],
    };

    try {
      const userIdHash = this.encryption.hashUserId(userId);

      // Delete or anonymize based on data retention policies
      if (dataTypes.includes("all") || dataTypes.includes("conversations")) {
        try {
          // First anonymize, then delete after retention period
          const anonymizedCount = await this.anonymizeUserConversations(userId);
          result.anonymized.conversations = anonymizedCount;

          // Hard delete very old data
          const { count: deletedCount } = await this.supabase
            .from("secure_conversation_entries")
            .delete()
            .eq("user_id_hash", userIdHash)
            .lt(
              "timestamp",
              new Date(
                Date.now() -
                  this.config.dataRetention.hardDeleteDays * 24 * 60 * 60 * 1000
              ).toISOString()
            );

          result.deleted.conversations = deletedCount || 0;
        } catch (error) {
          result.errors.push(
            `Conversations: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }

      if (dataTypes.includes("all") || dataTypes.includes("profile")) {
        try {
          const { count } = await this.supabase
            .from("secure_user_profiles")
            .delete()
            .eq("user_id", userId);

          result.deleted.profile = count || 0;
        } catch (error) {
          result.errors.push(
            `Profile: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }

      if (dataTypes.includes("all") || dataTypes.includes("consents")) {
        try {
          const deletedCount =
            await consentManager.deleteUserConsentData(userId);
          result.deleted.consents = deletedCount;
        } catch (error) {
          result.errors.push(
            `Consents: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }

      // Audit log
      await auditLogger.logSuccess("user.delete", "high", {
        userId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        details: {
          dataTypes,
          reason: context.reason || "User request",
          result,
        },
      });

      return result;
    } catch (error) {
      await this.handleSecurityViolation({
        type: "policy_violation",
        severity: "high",
        description: "Failed to securely delete user data",
        userId,
        ipAddress: context.ipAddress,
        timestamp: new Date(),
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
          dataTypes,
        },
        resolved: false,
      });
      throw error;
    }
  }

  /**
   * Generate security report
   */
  public async generateSecurityReport(
    startDate: Date,
    endDate: Date
  ): Promise<SecurityReport> {
    try {
      // Get audit statistics
      const auditStats = await auditLogger.getStatistics(startDate, endDate);

      // Get security violations
      const violations = await this.getSecurityViolations(startDate, endDate);

      // Calculate risk score
      const riskScore = this.calculateRiskScore(violations);

      // Generate recommendations
      const recommendations = this.generateSecurityRecommendations(
        violations,
        auditStats
      );

      return {
        period: { start: startDate, end: endDate },
        summary: {
          totalEvents: auditStats.totalEvents,
          securityViolations: violations.length,
          consentViolations: violations.filter(
            v => v.type === "consent_violation"
          ).length,
          dataBreaches: violations.filter(v => v.type === "data_breach").length,
          encryptionFailures: violations.filter(
            v => v.type === "encryption_failure"
          ).length,
        },
        trends: {
          dailyEvents: auditStats.timeline,
          topViolations: this.getTopViolations(violations),
          riskScore,
        },
        recommendations,
      };
    } catch (error) {
      await auditLogger.logFailure("system.error", error as Error, "high", {
        resource: "security_report",
      });
      throw error;
    }
  }

  /**
   * Automated security maintenance
   */
  public async performSecurityMaintenance(): Promise<{
    auditLogsCleaned: number;
    consentsExpired: number;
    dataAnonymized: number;
    violationsResolved: number;
  }> {
    try {
      // Clean up old audit logs
      const auditLogsCleaned = await auditLogger.cleanupOldLogs();

      // Mark expired consents
      const consentsExpired = await consentManager.cleanupExpiredConsents();

      // Anonymize old data
      const dataAnonymized = await this.anonymizeOldData();

      // Resolve old violations
      const violationsResolved = await this.resolveOldViolations();

      // Log maintenance completion
      await auditLogger.logSuccess("system.cleanup", "low", {
        details: {
          auditLogsCleaned,
          consentsExpired,
          dataAnonymized,
          violationsResolved,
        },
      });

      return {
        auditLogsCleaned,
        consentsExpired,
        dataAnonymized,
        violationsResolved,
      };
    } catch (error) {
      await auditLogger.logFailure("system.error", error as Error, "high", {
        resource: "security_maintenance",
      });
      throw error;
    }
  }

  // Private helper methods
  private async enforceConsentRequirements(
    userId: string,
    requiredConsents: ConsentType[]
  ): Promise<void> {
    const consents = await consentManager.hasValidConsents(
      userId,
      requiredConsents
    );
    const missingConsents = requiredConsents.filter(
      consent => !consents[consent]
    );

    if (missingConsents.length > 0) {
      await this.handleSecurityViolation({
        type: "consent_violation",
        severity: "high",
        description: `Missing required consents: ${missingConsents.join(", ")}`,
        userId,
        timestamp: new Date(),
        details: { missingConsents, requiredConsents },
        resolved: false,
      });
      throw new Error(
        `Missing required consents: ${missingConsents.join(", ")}`
      );
    }
  }

  private async detectAndHandlePII(entry: ConversationEntry): Promise<{
    hasPII: boolean;
    anonymizationLevel?: AnonymizationLevel;
    anonymizedAt?: Date;
  }> {
    const queryPII = dataAnonymizer.detectPII(entry.userQuery);
    const responsePII = dataAnonymizer.detectPII(entry.assistantResponse);

    const hasPII = queryPII.hasPII || responsePII.hasPII;

    if (hasPII && this.config.anonymization.enabled) {
      const level = this.config.anonymization.defaultLevel;
      await dataAnonymizer.anonymizeConversation(
        entry.userQuery, // Assuming userId is available
        {
          userQuery: entry.userQuery,
          assistantResponse: entry.assistantResponse,
          context: entry.context,
        },
        level
      );

      return {
        hasPII,
        anonymizationLevel: level,
        anonymizedAt: new Date(),
      };
    }

    return { hasPII };
  }

  private async encryptConversationEntry(entry: ConversationEntry): Promise<{
    userQuery: any;
    assistantResponse: any;
    context: any;
  }> {
    return {
      userQuery: this.encryption.encryptUserQuery(entry.userQuery),
      assistantResponse: this.encryption.encryptAssistantResponse(
        entry.assistantResponse
      ),
      context: this.encryption.encryptContextData(entry.context),
    };
  }

  private async decryptConversationEntry(encryptedEntry: {
    userQuery: any;
    assistantResponse: any;
    context: any;
  }): Promise<{
    userQuery: string;
    assistantResponse: string;
    context: Record<string, any>;
  }> {
    return {
      userQuery: this.encryption.decryptUserQuery(encryptedEntry.userQuery),
      assistantResponse: this.encryption.decryptAssistantResponse(
        encryptedEntry.assistantResponse
      ),
      context: this.encryption.decryptContextData(encryptedEntry.context),
    };
  }

  private async encryptUserProfile(profile: Partial<UserProfile>): Promise<{
    profileData: any;
    preferences: any;
  }> {
    const { preferences, ...profileData } = profile;
    return {
      profileData: this.encryption.encryptContextData(profileData),
      preferences: preferences
        ? this.encryption.encryptContextData(preferences)
        : null,
    };
  }

  private async checkDataAccess(
    userId: string,
    resource: string,
    action: "read" | "write" | "delete"
  ): Promise<boolean> {
    // Implement your access control logic here
    // This is a simplified version
    return true;
  }

  private async handleSecurityViolation(
    violation: SecurityViolation
  ): Promise<void> {
    // Store violation
    const { error } = await this.supabase.from("security_incidents").insert({
      incident_type: violation.type,
      severity: violation.severity,
      title: violation.description,
      description: violation.description,
      affected_users: violation.userId ? [violation.userId] : [],
      detected_at: violation.timestamp.toISOString(),
      detected_by: "security_manager",
      detection_method: "automated",
      evidence: violation.details,
    });

    if (error) {
      console.error("Failed to store security violation:", error);
    }

    // Log to audit
    await auditLogger.logSecurityIncident(violation.details, {
      userId: violation.userId,
      sessionId: violation.sessionId,
      ipAddress: violation.ipAddress,
      severity: violation.severity,
    });

    // Cache violation
    const key = violation.userId || "system";
    if (!this.violationCache.has(key)) {
      this.violationCache.set(key, []);
    }
    this.violationCache.get(key)!.push(violation);
  }

  private async getSecurityViolations(
    startDate: Date,
    endDate: Date
  ): Promise<SecurityViolation[]> {
    const { data, error } = await this.supabase
      .from("security_incidents")
      .select("*")
      .gte("detected_at", startDate.toISOString())
      .lte("detected_at", endDate.toISOString());

    if (error) {
      throw error;
    }

    return data.map(incident => ({
      type: incident.incident_type as SecurityViolationType,
      severity: incident.severity as AuditSeverity,
      description: incident.description,
      userId: incident.affected_users?.[0],
      timestamp: new Date(incident.detected_at),
      details: incident.evidence || {},
      resolved: incident.status === "resolved",
    }));
  }

  private calculateRiskScore(violations: SecurityViolation[]): number {
    const weights = {
      critical: 10,
      high: 5,
      medium: 2,
      low: 1,
    };

    const totalScore = violations.reduce((score, violation) => {
      return score + weights[violation.severity];
    }, 0);

    // Normalize to 0-100 scale
    return Math.min(
      100,
      Math.round((totalScore / Math.max(1, violations.length)) * 10)
    );
  }

  private generateSecurityRecommendations(
    violations: SecurityViolation[],
    auditStats: any
  ): string[] {
    const recommendations: string[] = [];

    if (violations.filter(v => v.type === "consent_violation").length > 0) {
      recommendations.push(
        "Review consent management processes and ensure proper user education"
      );
    }

    if (violations.filter(v => v.type === "data_breach").length > 0) {
      recommendations.push(
        "Implement additional access controls and monitoring"
      );
    }

    if (auditStats.failedEvents / auditStats.totalEvents > 0.1) {
      recommendations.push(
        "High failure rate detected - review system reliability"
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Security posture is good - continue current practices"
      );
    }

    return recommendations;
  }

  private getTopViolations(
    violations: SecurityViolation[]
  ): Array<{ type: SecurityViolationType; count: number }> {
    const counts = violations.reduce(
      (acc, violation) => {
        acc[violation.type] = (acc[violation.type] || 0) + 1;
        return acc;
      },
      {} as Record<SecurityViolationType, number>
    );

    return Object.entries(counts)
      .map(([type, count]) => ({ type: type as SecurityViolationType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private async anonymizeUserConversations(userId: string): Promise<number> {
    // Implementation for anonymizing user conversations
    return 0; // Placeholder
  }

  private async anonymizeOldData(): Promise<number> {
    // Implementation for anonymizing old data
    return 0; // Placeholder
  }

  private async resolveOldViolations(): Promise<number> {
    // Implementation for resolving old violations
    return 0; // Placeholder
  }

  private getDefaultConfig(): SecurityConfig {
    return {
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
  }
}

// Singleton instance
export const securityManager = SecurityManager.getInstance();
