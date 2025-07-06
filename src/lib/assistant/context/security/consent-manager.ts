import { createClient } from "@supabase/supabase-js";
import { auditLogger } from "./audit-logger";

// Consent types
export type ConsentType =
  | "data_collection"
  | "data_processing"
  | "data_storage"
  | "data_sharing"
  | "marketing"
  | "analytics"
  | "personalization"
  | "ai_training"
  | "context_retention"
  | "behavior_tracking";

export type ConsentStatus = "granted" | "denied" | "withdrawn" | "expired";

export interface ConsentRecord {
  id?: string;
  userId: string;
  consentType: ConsentType;
  status: ConsentStatus;
  version: string;
  grantedAt?: Date;
  withdrawnAt?: Date;
  expiresAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  purpose: string;
  legalBasis:
    | "consent"
    | "legitimate_interest"
    | "contract"
    | "legal_obligation";
  dataTypes: string[];
  retentionPeriod: number; // in days
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsentRequest {
  userId: string;
  consentType: ConsentType;
  purpose: string;
  legalBasis: ConsentRecord["legalBasis"];
  dataTypes: string[];
  retentionPeriod: number;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface ConsentSummary {
  userId: string;
  totalConsents: number;
  grantedConsents: number;
  deniedConsents: number;
  withdrawnConsents: number;
  expiredConsents: number;
  consentsByType: Record<ConsentType, ConsentStatus>;
  lastUpdated: Date;
}

export interface ConsentPolicy {
  type: ConsentType;
  required: boolean;
  description: string;
  purpose: string;
  legalBasis: ConsentRecord["legalBasis"];
  dataTypes: string[];
  defaultRetentionDays: number;
  version: string;
}

export class ConsentManager {
  private static instance: ConsentManager;
  private supabase;
  private policies: Map<ConsentType, ConsentPolicy>;

  private constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.policies = new Map();
    this.initializeDefaultPolicies();
  }

  public static getInstance(): ConsentManager {
    if (!ConsentManager.instance) {
      ConsentManager.instance = new ConsentManager();
    }
    return ConsentManager.instance;
  }

  /**
   * Initialize default consent policies
   */
  private initializeDefaultPolicies(): void {
    const defaultPolicies: ConsentPolicy[] = [
      {
        type: "data_collection",
        required: true,
        description: "Collection of personal data for service provision",
        purpose:
          "To provide AI assistant services and maintain conversation context",
        legalBasis: "consent",
        dataTypes: ["user_queries", "interaction_data", "preferences"],
        defaultRetentionDays: 365,
        version: "1.0",
      },
      {
        type: "data_processing",
        required: true,
        description: "Processing of personal data for AI responses",
        purpose: "To analyze queries and provide personalized responses",
        legalBasis: "consent",
        dataTypes: ["query_content", "context_data", "user_profile"],
        defaultRetentionDays: 365,
        version: "1.0",
      },
      {
        type: "context_retention",
        required: false,
        description: "Long-term retention of conversation context",
        purpose: "To maintain conversation history across sessions",
        legalBasis: "consent",
        dataTypes: ["conversation_history", "session_data", "user_preferences"],
        defaultRetentionDays: 90,
        version: "1.0",
      },
      {
        type: "behavior_tracking",
        required: false,
        description: "Tracking user behavior patterns for personalization",
        purpose: "To improve AI responses based on usage patterns",
        legalBasis: "consent",
        dataTypes: [
          "usage_patterns",
          "interaction_frequency",
          "preference_changes",
        ],
        defaultRetentionDays: 180,
        version: "1.0",
      },
      {
        type: "ai_training",
        required: false,
        description: "Use of anonymized data for AI model training",
        purpose: "To improve AI model performance and capabilities",
        legalBasis: "legitimate_interest",
        dataTypes: ["anonymized_queries", "response_quality_metrics"],
        defaultRetentionDays: 730,
        version: "1.0",
      },
      {
        type: "analytics",
        required: false,
        description: "Usage analytics for service improvement",
        purpose: "To understand usage patterns and improve service quality",
        legalBasis: "legitimate_interest",
        dataTypes: ["usage_statistics", "performance_metrics"],
        defaultRetentionDays: 365,
        version: "1.0",
      },
    ];

    defaultPolicies.forEach(policy => {
      this.policies.set(policy.type, policy);
    });
  }

  /**
   * Request consent from user
   */
  public async requestConsent(request: ConsentRequest): Promise<ConsentRecord> {
    try {
      const policy = this.policies.get(request.consentType);
      if (!policy) {
        throw new Error(`Unknown consent type: ${request.consentType}`);
      }

      // Check if consent already exists
      const existing = await this.getConsent(
        request.userId,
        request.consentType
      );
      if (
        existing &&
        existing.status === "granted" &&
        !this.isExpired(existing)
      ) {
        return existing;
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + request.retentionPeriod);

      const consentRecord: ConsentRecord = {
        userId: request.userId,
        consentType: request.consentType,
        status: "granted",
        version: request.version,
        grantedAt: new Date(),
        expiresAt,
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        purpose: request.purpose,
        legalBasis: request.legalBasis,
        dataTypes: request.dataTypes,
        retentionPeriod: request.retentionPeriod,
        metadata: request.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { data, error } = await this.supabase
        .from("consent_records")
        .upsert({
          user_id: consentRecord.userId,
          consent_type: consentRecord.consentType,
          status: consentRecord.status,
          version: consentRecord.version,
          granted_at: consentRecord.grantedAt?.toISOString(),
          withdrawn_at: consentRecord.withdrawnAt?.toISOString(),
          expires_at: consentRecord.expiresAt?.toISOString(),
          ip_address: consentRecord.ipAddress,
          user_agent: consentRecord.userAgent,
          purpose: consentRecord.purpose,
          legal_basis: consentRecord.legalBasis,
          data_types: consentRecord.dataTypes,
          retention_period: consentRecord.retentionPeriod,
          metadata: consentRecord.metadata,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const result = this.mapDbConsentRecord(data);

      // Audit log
      await auditLogger.logPrivacy(
        "consent",
        request.userId,
        {
          consentType: request.consentType,
          purpose: request.purpose,
          legalBasis: request.legalBasis,
        },
        {
          ipAddress: request.ipAddress,
          userAgent: request.userAgent,
        }
      );

      return result;
    } catch (error) {
      await auditLogger.logFailure("privacy.consent", error as Error, "high", {
        userId: request.userId,
        details: { consentType: request.consentType },
      });
      throw error;
    }
  }

  /**
   * Withdraw consent
   */
  public async withdrawConsent(
    userId: string,
    consentType: ConsentType,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ConsentRecord> {
    try {
      const existing = await this.getConsent(userId, consentType);
      if (!existing) {
        throw new Error(
          `No consent record found for user ${userId} and type ${consentType}`
        );
      }

      const { data, error } = await this.supabase
        .from("consent_records")
        .update({
          status: "withdrawn",
          withdrawn_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("consent_type", consentType)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const result = this.mapDbConsentRecord(data);

      // Audit log
      await auditLogger.logPrivacy(
        "withdraw",
        userId,
        {
          consentType,
          previousStatus: existing.status,
        },
        {
          ipAddress,
          userAgent,
        }
      );

      return result;
    } catch (error) {
      await auditLogger.logFailure("privacy.withdraw", error as Error, "high", {
        userId,
        details: { consentType },
      });
      throw error;
    }
  }

  /**
   * Get consent status for a specific type
   */
  public async getConsent(
    userId: string,
    consentType: ConsentType
  ): Promise<ConsentRecord | null> {
    try {
      const { data, error } = await this.supabase
        .from("consent_records")
        .select("*")
        .eq("user_id", userId)
        .eq("consent_type", consentType)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return data ? this.mapDbConsentRecord(data) : null;
    } catch (error) {
      console.error("Failed to get consent:", error);
      return null;
    }
  }

  /**
   * Get all consents for a user
   */
  public async getUserConsents(userId: string): Promise<ConsentRecord[]> {
    try {
      const { data, error } = await this.supabase
        .from("consent_records")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data.map(this.mapDbConsentRecord);
    } catch (error) {
      console.error("Failed to get user consents:", error);
      return [];
    }
  }

  /**
   * Get consent summary for a user
   */
  public async getConsentSummary(userId: string): Promise<ConsentSummary> {
    const consents = await this.getUserConsents(userId);

    // Get latest consent for each type
    const consentsByType: Record<string, ConsentRecord> = {};
    consents.forEach(consent => {
      const existing = consentsByType[consent.consentType];
      if (!existing || consent.createdAt > existing.createdAt) {
        consentsByType[consent.consentType] = consent;
      }
    });

    const totalConsents = Object.keys(consentsByType).length;
    const grantedConsents = Object.values(consentsByType).filter(
      c => c.status === "granted" && !this.isExpired(c)
    ).length;
    const deniedConsents = Object.values(consentsByType).filter(
      c => c.status === "denied"
    ).length;
    const withdrawnConsents = Object.values(consentsByType).filter(
      c => c.status === "withdrawn"
    ).length;
    const expiredConsents = Object.values(consentsByType).filter(c =>
      this.isExpired(c)
    ).length;

    const consentsByTypeStatus = Object.fromEntries(
      Object.entries(consentsByType).map(([type, consent]) => [
        type,
        this.isExpired(consent) ? "expired" : consent.status,
      ])
    ) as Record<ConsentType, ConsentStatus>;

    const lastUpdated =
      consents.length > 0
        ? consents.reduce(
            (latest, consent) =>
              consent.updatedAt > latest ? consent.updatedAt : latest,
            consents[0].updatedAt
          )
        : new Date();

    return {
      userId,
      totalConsents,
      grantedConsents,
      deniedConsents,
      withdrawnConsents,
      expiredConsents,
      consentsByType: consentsByTypeStatus,
      lastUpdated,
    };
  }

  /**
   * Check if user has valid consent for a specific operation
   */
  public async hasValidConsent(
    userId: string,
    consentType: ConsentType
  ): Promise<boolean> {
    const consent = await this.getConsent(userId, consentType);
    return (
      consent !== null &&
      consent.status === "granted" &&
      !this.isExpired(consent)
    );
  }

  /**
   * Check if user has valid consent for multiple operations
   */
  public async hasValidConsents(
    userId: string,
    consentTypes: ConsentType[]
  ): Promise<Record<ConsentType, boolean>> {
    const results: Record<ConsentType, boolean> = {} as Record<
      ConsentType,
      boolean
    >;

    for (const consentType of consentTypes) {
      results[consentType] = await this.hasValidConsent(userId, consentType);
    }

    return results;
  }

  /**
   * Get consent policy for a type
   */
  public getPolicy(consentType: ConsentType): ConsentPolicy | undefined {
    return this.policies.get(consentType);
  }

  /**
   * Get all available policies
   */
  public getAllPolicies(): ConsentPolicy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Check if required consents are granted
   */
  public async checkRequiredConsents(userId: string): Promise<{
    allRequired: boolean;
    missing: ConsentType[];
    summary: ConsentSummary;
  }> {
    const summary = await this.getConsentSummary(userId);
    const requiredPolicies = this.getAllPolicies().filter(p => p.required);
    const missing: ConsentType[] = [];

    for (const policy of requiredPolicies) {
      const status = summary.consentsByType[policy.type];
      if (!status || status !== "granted") {
        missing.push(policy.type);
      }
    }

    return {
      allRequired: missing.length === 0,
      missing,
      summary,
    };
  }

  /**
   * Export user consent data for portability
   */
  public async exportUserConsentData(userId: string): Promise<{
    consents: ConsentRecord[];
    summary: ConsentSummary;
    exportedAt: Date;
  }> {
    const consents = await this.getUserConsents(userId);
    const summary = await this.getConsentSummary(userId);

    // Audit log
    await auditLogger.logDataAccess(userId, "consent", userId, "export", {
      details: { recordCount: consents.length },
    });

    return {
      consents,
      summary,
      exportedAt: new Date(),
    };
  }

  /**
   * Delete all consent data for a user (for account deletion)
   */
  public async deleteUserConsentData(userId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from("consent_records")
        .delete()
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      const deletedCount = Array.isArray(data) ? data.length : 0;

      // Audit log
      await auditLogger.logDataAccess(userId, "consent", userId, "delete", {
        details: { deletedRecords: deletedCount },
      });

      return deletedCount;
    } catch (error) {
      await auditLogger.logFailure("user.delete", error as Error, "high", {
        userId,
        resource: "consent_records",
      });
      throw error;
    }
  }

  /**
   * Clean up expired consents
   */
  public async cleanupExpiredConsents(): Promise<number> {
    try {
      const now = new Date();
      const { data, error } = await this.supabase
        .from("consent_records")
        .update({
          status: "expired",
          updated_at: now.toISOString(),
        })
        .lt("expires_at", now.toISOString())
        .eq("status", "granted");

      if (error) {
        throw error;
      }

      const updatedCount = Array.isArray(data) ? data.length : 0;
      console.log(`Marked ${updatedCount} consent records as expired`);

      return updatedCount;
    } catch (error) {
      console.error("Failed to cleanup expired consents:", error);
      throw error;
    }
  }

  // Private helper methods
  private isExpired(consent: ConsentRecord): boolean {
    if (!consent.expiresAt) {
      return false;
    }
    return consent.expiresAt < new Date();
  }

  private mapDbConsentRecord(data: any): ConsentRecord {
    return {
      id: data.id,
      userId: data.user_id,
      consentType: data.consent_type,
      status: data.status,
      version: data.version,
      grantedAt: data.granted_at ? new Date(data.granted_at) : undefined,
      withdrawnAt: data.withdrawn_at ? new Date(data.withdrawn_at) : undefined,
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
      purpose: data.purpose,
      legalBasis: data.legal_basis,
      dataTypes: data.data_types || [],
      retentionPeriod: data.retention_period,
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

// Singleton instance
export const consentManager = ConsentManager.getInstance();

// Helper functions for common consent operations
export const consent = {
  /**
   * Check if user can collect data
   */
  canCollectData: (userId: string) =>
    consentManager.hasValidConsent(userId, "data_collection"),

  /**
   * Check if user can process data
   */
  canProcessData: (userId: string) =>
    consentManager.hasValidConsent(userId, "data_processing"),

  /**
   * Check if user can retain context
   */
  canRetainContext: (userId: string) =>
    consentManager.hasValidConsent(userId, "context_retention"),

  /**
   * Check if user can track behavior
   */
  canTrackBehavior: (userId: string) =>
    consentManager.hasValidConsent(userId, "behavior_tracking"),

  /**
   * Check if user data can be used for AI training
   */
  canUseForTraining: (userId: string) =>
    consentManager.hasValidConsent(userId, "ai_training"),

  /**
   * Check all required consents at once
   */
  checkRequired: (userId: string) =>
    consentManager.checkRequiredConsents(userId),

  /**
   * Get user consent summary
   */
  getSummary: (userId: string) => consentManager.getConsentSummary(userId),
};
