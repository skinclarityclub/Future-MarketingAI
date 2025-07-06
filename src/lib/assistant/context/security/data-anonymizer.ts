import * as crypto from "crypto";
import { auditLogger } from "./audit-logger";

// Types for anonymization
export type AnonymizationLevel = "light" | "medium" | "heavy" | "complete";

export type DataType =
  | "email"
  | "phone"
  | "name"
  | "address"
  | "ssn"
  | "credit_card"
  | "ip_address"
  | "user_id"
  | "session_id"
  | "custom";

export interface AnonymizationRule {
  dataType: DataType;
  pattern?: RegExp;
  replacement: "hash" | "mask" | "redact" | "tokenize" | "generalize";
  preserveFormat?: boolean;
  customReplacer?: (value: string) => string;
}

export interface AnonymizationConfig {
  level: AnonymizationLevel;
  preserveUtility: boolean;
  salt: string;
  rules: AnonymizationRule[];
}

export interface AnonymizationResult {
  originalData: any;
  anonymizedData: any;
  anonymizationMap: Record<string, string>;
  level: AnonymizationLevel;
  timestamp: Date;
  reversible: boolean;
}

export class DataAnonymizer {
  private static instance: DataAnonymizer;
  private config: AnonymizationConfig;
  private anonymizationSalt: string;

  // Common patterns for PII detection
  private static readonly PII_PATTERNS = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
    credit_card: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    ip_address: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    name: /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g, // Simple name pattern
    address:
      /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)\b/g,
  };

  private constructor() {
    this.anonymizationSalt =
      process.env.ANONYMIZATION_SALT || this.generateSalt();
    this.config = this.getDefaultConfig();
  }

  public static getInstance(): DataAnonymizer {
    if (!DataAnonymizer.instance) {
      DataAnonymizer.instance = new DataAnonymizer();
    }
    return DataAnonymizer.instance;
  }

  /**
   * Anonymize data based on configuration
   */
  public async anonymize(
    data: any,
    level: AnonymizationLevel = "medium",
    customRules?: AnonymizationRule[]
  ): Promise<AnonymizationResult> {
    try {
      const config = {
        ...this.config,
        level,
        rules: customRules || this.config.rules,
      };
      const anonymizationMap: Record<string, string> = {};

      const anonymizedData = this.processData(data, config, anonymizationMap);

      const result: AnonymizationResult = {
        originalData: data,
        anonymizedData,
        anonymizationMap,
        level,
        timestamp: new Date(),
        reversible: level === "light" || level === "medium",
      };

      // Audit log
      await auditLogger.logSuccess("data.anonymize", "medium", {
        details: {
          level,
          dataSize: JSON.stringify(data).length,
          fieldsAnonymized: Object.keys(anonymizationMap).length,
        },
      });

      return result;
    } catch (error) {
      await auditLogger.logFailure("data.anonymize", error as Error, "high", {
        details: { level, dataType: typeof data },
      });
      throw error;
    }
  }

  /**
   * Anonymize user conversation data
   */
  public async anonymizeConversation(
    userId: string,
    conversationData: {
      userQuery: string;
      assistantResponse: string;
      context: Record<string, any>;
    },
    level: AnonymizationLevel = "medium"
  ): Promise<AnonymizationResult> {
    const rules: AnonymizationRule[] = [
      { dataType: "email", replacement: "tokenize", preserveFormat: true },
      { dataType: "phone", replacement: "mask", preserveFormat: true },
      { dataType: "name", replacement: "generalize" },
      { dataType: "address", replacement: "generalize" },
      { dataType: "ssn", replacement: "redact" },
      { dataType: "credit_card", replacement: "redact" },
      { dataType: "ip_address", replacement: "hash" },
    ];

    const result = await this.anonymize(conversationData, level, rules);

    // Additional audit for conversation anonymization
    await auditLogger.logDataAccess(
      userId,
      "conversation",
      "anonymized",
      "modify",
      {
        details: {
          level,
          queryLength: conversationData.userQuery.length,
          responseLength: conversationData.assistantResponse.length,
        },
      }
    );

    return result;
  }

  /**
   * Anonymize user profile data
   */
  public async anonymizeUserProfile(
    userId: string,
    profileData: Record<string, any>,
    level: AnonymizationLevel = "heavy"
  ): Promise<AnonymizationResult> {
    const rules: AnonymizationRule[] = [
      {
        dataType: "email",
        replacement: level === "complete" ? "redact" : "hash",
      },
      {
        dataType: "phone",
        replacement: level === "complete" ? "redact" : "mask",
      },
      {
        dataType: "name",
        replacement: level === "complete" ? "redact" : "generalize",
      },
      { dataType: "address", replacement: "redact" },
      { dataType: "user_id", replacement: "hash" },
    ];

    return await this.anonymize(profileData, level, rules);
  }

  /**
   * Create anonymized dataset for AI training
   */
  public async createTrainingDataset(
    data: any[],
    preservePatterns: boolean = true
  ): Promise<{
    anonymizedDataset: any[];
    metadata: {
      originalCount: number;
      anonymizedCount: number;
      preservedFields: string[];
      removedFields: string[];
      anonymizationLevel: AnonymizationLevel;
    };
  }> {
    const level: AnonymizationLevel = preservePatterns ? "medium" : "heavy";
    const anonymizedDataset: any[] = [];
    const preservedFields: Set<string> = new Set();
    const removedFields: Set<string> = new Set();

    for (const item of data) {
      const result = await this.anonymize(item, level);
      anonymizedDataset.push(result.anonymizedData);

      // Track field preservation
      Object.keys(item).forEach(key => {
        if (result.anonymizedData[key] !== undefined) {
          preservedFields.add(key);
        } else {
          removedFields.add(key);
        }
      });
    }

    // Audit log
    await auditLogger.logSuccess("data.anonymize", "high", {
      details: {
        operation: "training_dataset",
        originalCount: data.length,
        anonymizedCount: anonymizedDataset.length,
        level,
        preservePatterns,
      },
    });

    return {
      anonymizedDataset,
      metadata: {
        originalCount: data.length,
        anonymizedCount: anonymizedDataset.length,
        preservedFields: Array.from(preservedFields),
        removedFields: Array.from(removedFields),
        anonymizationLevel: level,
      },
    };
  }

  /**
   * Generate pseudonymized identifiers
   */
  public pseudonymizeIdentifier(
    identifier: string,
    category: string = "general"
  ): string {
    const hash = crypto.createHmac("sha256", this.anonymizationSalt);
    hash.update(`${category}:${identifier}`);
    return `pseudo_${hash.digest("hex").substring(0, 16)}`;
  }

  /**
   * Check if data contains PII
   */
  public detectPII(data: string): {
    hasPII: boolean;
    detectedTypes: DataType[];
    matches: Record<DataType, string[]>;
  } {
    const detectedTypes: DataType[] = [];
    const matches: Record<DataType, string[]> = {} as Record<
      DataType,
      string[]
    >;

    Object.entries(DataAnonymizer.PII_PATTERNS).forEach(([type, pattern]) => {
      const found = data.match(pattern);
      if (found && found.length > 0) {
        detectedTypes.push(type as DataType);
        matches[type as DataType] = found;
      }
    });

    return {
      hasPII: detectedTypes.length > 0,
      detectedTypes,
      matches,
    };
  }

  /**
   * Generate differential privacy noise
   */
  public addDifferentialPrivacyNoise(
    value: number,
    epsilon: number = 1.0,
    sensitivity: number = 1.0
  ): number {
    // Laplace mechanism for differential privacy
    const scale = sensitivity / epsilon;
    const u = Math.random() - 0.5;
    const noise = -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
    return value + noise;
  }

  /**
   * Generate k-anonymity groups
   */
  public async generateKAnonymityGroups(
    data: any[],
    k: number = 5,
    quasiIdentifiers: string[] = []
  ): Promise<{
    groups: any[][];
    totalGroups: number;
    averageGroupSize: number;
    kAnonymous: boolean;
  }> {
    // Group data by quasi-identifiers
    const groups: Map<string, any[]> = new Map();

    data.forEach(item => {
      const key = quasiIdentifiers.map(field => item[field] || "").join("|");
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    });

    // Filter groups that meet k-anonymity requirement
    const validGroups = Array.from(groups.values()).filter(
      group => group.length >= k
    );
    const kAnonymous = validGroups.length === groups.size;

    const totalGroups = validGroups.length;
    const averageGroupSize =
      totalGroups > 0
        ? validGroups.reduce((sum, group) => sum + group.length, 0) /
          totalGroups
        : 0;

    return {
      groups: validGroups,
      totalGroups,
      averageGroupSize,
      kAnonymous,
    };
  }

  // Private helper methods
  private processData(
    data: any,
    config: AnonymizationConfig,
    anonymizationMap: Record<string, string>
  ): any {
    if (typeof data === "string") {
      return this.anonymizeString(data, config, anonymizationMap);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.processData(item, config, anonymizationMap));
    }

    if (typeof data === "object" && data !== null) {
      const result: any = {};

      Object.entries(data).forEach(([key, value]) => {
        // Check if this field should be anonymized based on key name
        const shouldAnonymize = this.shouldAnonymizeField(key, config);

        if (shouldAnonymize) {
          result[key] = this.processData(value, config, anonymizationMap);
        } else if (config.level === "complete") {
          // In complete anonymization, skip non-essential fields
          if (this.isEssentialField(key)) {
            result[key] = this.processData(value, config, anonymizationMap);
          }
        } else {
          result[key] = this.processData(value, config, anonymizationMap);
        }
      });

      return result;
    }

    return data;
  }

  private anonymizeString(
    text: string,
    config: AnonymizationConfig,
    anonymizationMap: Record<string, string>
  ): string {
    let result = text;

    config.rules.forEach(rule => {
      const pattern =
        rule.pattern ||
        DataAnonymizer.PII_PATTERNS[
          rule.dataType as keyof typeof DataAnonymizer.PII_PATTERNS
        ];

      if (pattern) {
        result = result.replace(pattern, match => {
          const anonymized = this.applyAnonymizationRule(match, rule);
          anonymizationMap[match] = anonymized;
          return anonymized;
        });
      }
    });

    return result;
  }

  private applyAnonymizationRule(
    value: string,
    rule: AnonymizationRule
  ): string {
    if (rule.customReplacer) {
      return rule.customReplacer(value);
    }

    switch (rule.replacement) {
      case "hash":
        return this.hashValue(value);

      case "mask":
        return this.maskValue(value, rule.preserveFormat);

      case "redact":
        return "[REDACTED]";

      case "tokenize":
        return this.tokenizeValue(value, rule.dataType);

      case "generalize":
        return this.generalizeValue(value, rule.dataType);

      default:
        return value;
    }
  }

  private hashValue(value: string): string {
    const hash = crypto.createHmac("sha256", this.anonymizationSalt);
    hash.update(value);
    return `hash_${hash.digest("hex").substring(0, 12)}`;
  }

  private maskValue(value: string, preserveFormat: boolean = false): string {
    if (!preserveFormat) {
      return "*".repeat(Math.min(value.length, 8));
    }

    // Preserve format but mask sensitive parts
    if (value.includes("@")) {
      // Email masking
      const [local, domain] = value.split("@");
      const maskedLocal =
        local.substring(0, 2) + "*".repeat(Math.max(0, local.length - 2));
      return `${maskedLocal}@${domain}`;
    }

    if (value.match(/^\d+$/)) {
      // Numeric masking (phone, SSN, etc.)
      const visible = Math.min(4, Math.floor(value.length / 3));
      return value.substring(0, visible) + "*".repeat(value.length - visible);
    }

    // Default masking
    return value.substring(0, 2) + "*".repeat(Math.max(0, value.length - 2));
  }

  private tokenizeValue(value: string, dataType: DataType): string {
    const hash = crypto.createHmac("sha256", this.anonymizationSalt);
    hash.update(`${dataType}:${value}`);
    return `token_${dataType}_${hash.digest("hex").substring(0, 8)}`;
  }

  private generalizeValue(value: string, dataType: DataType): string {
    switch (dataType) {
      case "name":
        return "[PERSON]";
      case "address":
        return "[ADDRESS]";
      case "email":
        return "[EMAIL]";
      case "phone":
        return "[PHONE]";
      default:
        return `[${dataType.toUpperCase()}]`;
    }
  }

  private shouldAnonymizeField(
    fieldName: string,
    config: AnonymizationConfig
  ): boolean {
    const sensitiveFields = [
      "email",
      "phone",
      "name",
      "address",
      "ssn",
      "user_id",
      "session_id",
      "firstName",
      "lastName",
      "fullName",
      "phoneNumber",
      "emailAddress",
    ];

    return sensitiveFields.some(field =>
      fieldName.toLowerCase().includes(field.toLowerCase())
    );
  }

  private isEssentialField(fieldName: string): boolean {
    const essentialFields = [
      "id",
      "timestamp",
      "type",
      "status",
      "category",
      "action",
      "created_at",
      "updated_at",
      "version",
    ];

    return essentialFields.some(field =>
      fieldName.toLowerCase().includes(field.toLowerCase())
    );
  }

  private getDefaultConfig(): AnonymizationConfig {
    return {
      level: "medium",
      preserveUtility: true,
      salt: this.anonymizationSalt,
      rules: [
        { dataType: "email", replacement: "tokenize", preserveFormat: true },
        { dataType: "phone", replacement: "mask", preserveFormat: true },
        { dataType: "name", replacement: "generalize" },
        { dataType: "address", replacement: "generalize" },
        { dataType: "ssn", replacement: "redact" },
        { dataType: "credit_card", replacement: "redact" },
        { dataType: "ip_address", replacement: "hash" },
        { dataType: "user_id", replacement: "hash" },
        { dataType: "session_id", replacement: "hash" },
      ],
    };
  }

  private generateSalt(): string {
    return crypto.randomBytes(32).toString("hex");
  }
}

// Singleton instance
export const dataAnonymizer = DataAnonymizer.getInstance();

// Helper functions for common anonymization tasks
export const anonymize = {
  /**
   * Quick anonymization for logging
   */
  forLogging: (data: any) => dataAnonymizer.anonymize(data, "light"),

  /**
   * Anonymization for analytics
   */
  forAnalytics: (data: any) => dataAnonymizer.anonymize(data, "medium"),

  /**
   * Anonymization for data sharing
   */
  forSharing: (data: any) => dataAnonymizer.anonymize(data, "heavy"),

  /**
   * Complete anonymization for public datasets
   */
  forPublic: (data: any) => dataAnonymizer.anonymize(data, "complete"),

  /**
   * Detect PII in text
   */
  detectPII: (text: string) => dataAnonymizer.detectPII(text),

  /**
   * Generate pseudonymized ID
   */
  pseudonymize: (id: string, category?: string) =>
    dataAnonymizer.pseudonymizeIdentifier(id, category),

  /**
   * Add differential privacy noise to numeric values
   */
  addNoise: (value: number, epsilon?: number) =>
    dataAnonymizer.addDifferentialPrivacyNoise(value, epsilon),
};
