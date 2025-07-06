/**
 * Database Field Encryption Service
 * Task 37.2: Implement Data Encryption Protocols
 *
 * Transparent field-level encryption for sensitive data in Supabase
 * Automatically encrypts/decrypts sensitive fields before/after database operations
 */

import {
  getEnterpriseEncryption,
  EncryptedPayload,
} from "./enterprise-encryption";
import { Database } from "../supabase/types";

// Field encryption configuration
export interface FieldEncryptionConfig {
  // Tables and their encrypted fields
  tables: {
    [tableName: string]: {
      encryptedFields: string[];
      searchableFields?: string[]; // Fields that need to remain searchable (hashed)
      auditLog?: boolean;
    };
  };
  // Default encryption settings
  defaultKeyId: string;
  hashAlgorithm: "sha256" | "sha512";
  preserveNulls: boolean;
}

// Default configuration for sensitive data
export const DEFAULT_FIELD_ENCRYPTION_CONFIG: FieldEncryptionConfig = {
  tables: {
    // Customer data
    customers: {
      encryptedFields: [
        "email",
        "phone",
        "address",
        "tax_id",
        "personal_notes",
      ],
      searchableFields: ["email"], // Keep email searchable via hash
      auditLog: true,
    },
    // User profiles
    user_profiles: {
      encryptedFields: [
        "phone",
        "address",
        "ssn",
        "date_of_birth",
        "emergency_contact",
      ],
      searchableFields: ["phone"],
      auditLog: true,
    },
    // Financial data
    financial_accounts: {
      encryptedFields: [
        "account_number",
        "routing_number",
        "iban",
        "swift_code",
      ],
      auditLog: true,
    },
    // Marketing data
    marketing_contacts: {
      encryptedFields: ["email", "phone", "personal_notes", "preferences"],
      searchableFields: ["email"],
      auditLog: true,
    },
    // AI conversation data
    ai_conversations: {
      encryptedFields: [
        "user_query",
        "assistant_response",
        "context_data",
        "user_metadata",
      ],
      auditLog: true,
    },
    // Audit logs (encrypt sensitive audit data)
    audit_logs: {
      encryptedFields: ["user_data", "request_data", "response_data"],
      auditLog: false, // Prevent recursive logging
    },
  },
  defaultKeyId: "database-encryption",
  hashAlgorithm: "sha256",
  preserveNulls: true,
};

// Encrypted field data structure for database storage
export interface EncryptedFieldData {
  encrypted_data: string; // JSON-serialized EncryptedPayload
  data_hash?: string; // For searchable fields
  encryption_version: string;
  created_at: string;
}

export class DatabaseEncryptionService {
  private config: FieldEncryptionConfig;
  private encryptionService: ReturnType<typeof getEnterpriseEncryption>;

  constructor(config: Partial<FieldEncryptionConfig> = {}) {
    this.config = { ...DEFAULT_FIELD_ENCRYPTION_CONFIG, ...config };
    this.encryptionService = getEnterpriseEncryption();
  }

  /**
   * Encrypt sensitive fields in a record before database insertion/update
   */
  public async encryptRecord<T extends Record<string, any>>(
    tableName: string,
    record: T,
    options: {
      userId?: string;
      operation?: "insert" | "update";
    } = {}
  ): Promise<T> {
    const tableConfig = this.config.tables[tableName];
    if (!tableConfig) {
      return record; // No encryption configured for this table
    }

    const encryptedRecord = { ...record };

    // Process each encrypted field
    for (const fieldName of tableConfig.encryptedFields) {
      const fieldValue = record[fieldName];

      // Skip null/undefined values if preserveNulls is true
      if (fieldValue == null && this.config.preserveNulls) {
        continue;
      }

      if (fieldValue != null) {
        try {
          // Encrypt the field value
          const encryptedPayload = await this.encryptionService.encrypt(
            typeof fieldValue === "string"
              ? fieldValue
              : JSON.stringify(fieldValue),
            {
              keyId: this.config.defaultKeyId,
              userId: options.userId,
              metadata: {
                table: tableName,
                field: fieldName,
                operation: options.operation || "encrypt",
              },
            }
          );

          // Create encrypted field data
          const encryptedFieldData: EncryptedFieldData = {
            encrypted_data: JSON.stringify(encryptedPayload),
            encryption_version: "1.0",
            created_at: new Date().toISOString(),
          };

          // Add searchable hash if configured
          if (tableConfig.searchableFields?.includes(fieldName)) {
            encryptedFieldData.data_hash =
              this.createSearchableHash(fieldValue);
          }

          // Replace field with encrypted data
          encryptedRecord[fieldName] = encryptedFieldData;
        } catch (error) {
          throw new Error(
            `Failed to encrypt field ${fieldName} in table ${tableName}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }
    }

    return encryptedRecord;
  }

  /**
   * Decrypt sensitive fields in a record after database retrieval
   */
  public async decryptRecord<T extends Record<string, any>>(
    tableName: string,
    record: T,
    options: {
      userId?: string;
    } = {}
  ): Promise<T> {
    const tableConfig = this.config.tables[tableName];
    if (!tableConfig) {
      return record; // No decryption configured for this table
    }

    const decryptedRecord = { ...record };

    // Process each encrypted field
    for (const fieldName of tableConfig.encryptedFields) {
      const fieldData = record[fieldName];

      if (
        fieldData &&
        typeof fieldData === "object" &&
        "encrypted_data" in fieldData
      ) {
        try {
          const encryptedFieldData = fieldData as EncryptedFieldData;
          const encryptedPayload: EncryptedPayload = JSON.parse(
            encryptedFieldData.encrypted_data
          );

          // Decrypt the field value
          const decryptedBuffer = await this.encryptionService.decrypt(
            encryptedPayload,
            {
              userId: options.userId,
            }
          );

          const decryptedValue = decryptedBuffer.toString("utf8");

          // Try to parse as JSON, fallback to string
          try {
            decryptedRecord[fieldName] = JSON.parse(decryptedValue);
          } catch {
            decryptedRecord[fieldName] = decryptedValue;
          }
        } catch (error) {
          throw new Error(
            `Failed to decrypt field ${fieldName} in table ${tableName}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }
    }

    return decryptedRecord;
  }

  /**
   * Decrypt multiple records
   */
  public async decryptRecords<T extends Record<string, any>>(
    tableName: string,
    records: T[],
    options: {
      userId?: string;
    } = {}
  ): Promise<T[]> {
    return Promise.all(
      records.map(record => this.decryptRecord(tableName, record, options))
    );
  }

  /**
   * Create searchable hash for encrypted fields
   */
  private createSearchableHash(value: any): string {
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value);
    const hash = require("crypto").createHash(this.config.hashAlgorithm);
    hash.update(stringValue.toLowerCase()); // Case-insensitive search
    return hash.digest("hex");
  }

  /**
   * Search encrypted records by searchable field
   */
  public createSearchHash(value: string): string {
    return this.createSearchableHash(value);
  }

  /**
   * Get encryption configuration for a table
   */
  public getTableConfig(
    tableName: string
  ): FieldEncryptionConfig["tables"][string] | null {
    return this.config.tables[tableName] || null;
  }

  /**
   * Check if a field is encrypted for a table
   */
  public isFieldEncrypted(tableName: string, fieldName: string): boolean {
    const tableConfig = this.config.tables[tableName];
    return tableConfig?.encryptedFields.includes(fieldName) || false;
  }

  /**
   * Check if a field is searchable for a table
   */
  public isFieldSearchable(tableName: string, fieldName: string): boolean {
    const tableConfig = this.config.tables[tableName];
    return tableConfig?.searchableFields?.includes(fieldName) || false;
  }

  /**
   * Migrate existing unencrypted data to encrypted format
   */
  public async migrateTableData(
    tableName: string,
    records: any[],
    options: {
      batchSize?: number;
      userId?: string;
    } = {}
  ): Promise<{
    processed: number;
    errors: Array<{ recordId: any; error: string }>;
  }> {
    const { batchSize = 100, userId } = options;
    let processed = 0;
    const errors: Array<{ recordId: any; error: string }> = [];

    // Process records in batches
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      for (const record of batch) {
        try {
          await this.encryptRecord(tableName, record, {
            userId,
            operation: "update",
          });
          processed++;
        } catch (error) {
          errors.push({
            recordId: record.id || record.uuid || i,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    }

    return { processed, errors };
  }

  /**
   * Health check for database encryption
   */
  public async healthCheck(): Promise<{
    status: "healthy" | "warning" | "critical";
    details: Record<string, any>;
  }> {
    const encryptionHealth = await this.encryptionService.healthCheck();

    const details = {
      encryptionService: encryptionHealth,
      configuredTables: Object.keys(this.config.tables).length,
      totalEncryptedFields: Object.values(this.config.tables).reduce(
        (total, config) => total + config.encryptedFields.length,
        0
      ),
      searchableFields: Object.values(this.config.tables).reduce(
        (total, config) => total + (config.searchableFields?.length || 0),
        0
      ),
    };

    // Check if encryption service is healthy
    if (encryptionHealth.status === "critical") {
      return { status: "critical", details };
    }

    if (encryptionHealth.status === "warning") {
      return { status: "warning", details };
    }

    return { status: "healthy", details };
  }
}

// Supabase client wrapper with automatic encryption/decryption
export class EncryptedSupabaseClient {
  private dbEncryption: DatabaseEncryptionService;

  constructor(
    private supabaseClient: any,
    config: Partial<FieldEncryptionConfig> = {}
  ) {
    this.dbEncryption = new DatabaseEncryptionService(config);
  }

  /**
   * Insert with automatic encryption
   */
  public async insert(
    tableName: string,
    data: Record<string, any>,
    options: { userId?: string } = {}
  ) {
    const encryptedData = await this.dbEncryption.encryptRecord(
      tableName,
      data,
      { ...options, operation: "insert" }
    );

    return this.supabaseClient.from(tableName).insert(encryptedData);
  }

  /**
   * Update with automatic encryption
   */
  public async update(
    tableName: string,
    data: Record<string, any>,
    match: Record<string, any>,
    options: { userId?: string } = {}
  ) {
    const encryptedData = await this.dbEncryption.encryptRecord(
      tableName,
      data,
      { ...options, operation: "update" }
    );

    return this.supabaseClient
      .from(tableName)
      .update(encryptedData)
      .match(match);
  }

  /**
   * Select with automatic decryption
   */
  public async select(
    tableName: string,
    columns: string = "*",
    options: { userId?: string } = {}
  ) {
    const result = await this.supabaseClient.from(tableName).select(columns);

    if (result.data) {
      result.data = await this.dbEncryption.decryptRecords(
        tableName,
        result.data,
        options
      );
    }

    return result;
  }

  /**
   * Search encrypted fields using hash
   */
  public async searchByEncryptedField(
    tableName: string,
    fieldName: string,
    searchValue: string,
    options: { userId?: string } = {}
  ) {
    if (!this.dbEncryption.isFieldSearchable(tableName, fieldName)) {
      throw new Error(
        `Field ${fieldName} is not configured for search in table ${tableName}`
      );
    }

    const searchHash = this.dbEncryption.createSearchHash(searchValue);

    const result = await this.supabaseClient
      .from(tableName)
      .select("*")
      .eq(`${fieldName}->data_hash`, searchHash);

    if (result.data) {
      result.data = await this.dbEncryption.decryptRecords(
        tableName,
        result.data,
        options
      );
    }

    return result;
  }

  /**
   * Get native Supabase client for non-encrypted operations
   */
  public getNativeClient() {
    return this.supabaseClient;
  }

  /**
   * Get database encryption service
   */
  public getEncryptionService(): DatabaseEncryptionService {
    return this.dbEncryption;
  }
}

// Singleton instance
let encryptedSupabaseClient: EncryptedSupabaseClient | null = null;

export function getEncryptedSupabaseClient(
  supabaseClient?: any
): EncryptedSupabaseClient {
  if (!encryptedSupabaseClient) {
    if (!supabaseClient) {
      throw new Error("Supabase client is required for initialization");
    }
    encryptedSupabaseClient = new EncryptedSupabaseClient(supabaseClient);
  }
  return encryptedSupabaseClient;
}

export default DatabaseEncryptionService;
