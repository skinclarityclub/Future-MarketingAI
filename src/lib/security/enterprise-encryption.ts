/**
 * Enterprise Data Encryption Service
 * Task 37.2: Implement Data Encryption Protocols
 *
 * Comprehensive encryption service for Fortune 500 compliance
 * Supporting SOC 2, GDPR, and enterprise security requirements
 */

import * as crypto from "crypto";
import { createHash, createHmac, timingSafeEqual } from "crypto";

// Encryption algorithms supported
export const EncryptionAlgorithm = {
  AES_256_GCM: "aes-256-gcm",
  AES_256_CBC: "aes-256-cbc",
  CHACHA20_POLY1305: "chacha20-poly1305",
} as const;

export type EncryptionAlgorithm =
  (typeof EncryptionAlgorithm)[keyof typeof EncryptionAlgorithm];

// Key derivation functions
export const KeyDerivationFunction = {
  PBKDF2: "pbkdf2",
  SCRYPT: "scrypt",
  ARGON2: "argon2",
} as const;

export type KeyDerivationFunction =
  (typeof KeyDerivationFunction)[keyof typeof KeyDerivationFunction];

// Encryption configuration
export interface EnterpriseEncryptionConfig {
  defaultAlgorithm: EncryptionAlgorithm;
  keyDerivation: KeyDerivationFunction;
  keySize: number;
  ivSize: number;
  tagSize: number;
  saltSize: number;
  iterations: number;
  memoryLimit?: number; // For scrypt/argon2
  parallelization?: number; // For scrypt/argon2
  auditLogging: boolean;
  keyRotationInterval: number; // days
  compliance: {
    gdpr: boolean;
    soc2: boolean;
    hipaa: boolean;
  };
}

// Default enterprise configuration
export const DEFAULT_ENTERPRISE_CONFIG: EnterpriseEncryptionConfig = {
  defaultAlgorithm: EncryptionAlgorithm.AES_256_GCM,
  keyDerivation: KeyDerivationFunction.PBKDF2,
  keySize: 32, // 256 bits
  ivSize: 12, // 96 bits for GCM
  tagSize: 16, // 128 bits
  saltSize: 32, // 256 bits
  iterations: 100000, // NIST recommended minimum
  auditLogging: true,
  keyRotationInterval: 90,
  compliance: {
    gdpr: true,
    soc2: true,
    hipaa: false,
  },
};

// Encrypted data structure
export interface EncryptedPayload {
  version: string;
  algorithm: EncryptionAlgorithm;
  data: string; // Base64 encoded
  iv: string; // Base64 encoded
  tag?: string; // Base64 encoded (for AEAD)
  salt: string; // Base64 encoded
  keyId?: string; // For key rotation
  timestamp: number;
  metadata?: Record<string, any>;
}

// Key management interface
export interface EncryptionKey {
  id: string;
  version: number;
  algorithm: EncryptionAlgorithm;
  created: Date;
  rotated?: Date;
  status: "active" | "rotating" | "deprecated" | "revoked";
  keyData: Buffer;
  derivedFrom?: string; // Master key reference
}

// Audit log entry
export interface EncryptionAuditLog {
  timestamp: Date;
  operation: "encrypt" | "decrypt" | "key_rotation" | "key_access";
  keyId: string;
  dataSize: number;
  algorithm: EncryptionAlgorithm;
  success: boolean;
  error?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class EnterpriseEncryptionService {
  private config: EnterpriseEncryptionConfig;
  private masterKey: Buffer;
  private activeKeys: Map<string, EncryptionKey> = new Map();
  private auditLogs: EncryptionAuditLog[] = [];
  private keyRotationTimer?: NodeJS.Timeout;

  constructor(
    masterKey: string | Buffer,
    config: Partial<EnterpriseEncryptionConfig> = {}
  ) {
    this.config = { ...DEFAULT_ENTERPRISE_CONFIG, ...config };
    this.masterKey =
      typeof masterKey === "string" ? Buffer.from(masterKey, "hex") : masterKey;

    if (this.masterKey.length < 32) {
      throw new Error("Master key must be at least 256 bits (32 bytes)");
    }

    this.initializeKeyManagement();
  }

  /**
   * Initialize key management system
   */
  private initializeKeyManagement(): void {
    // Create initial active key
    const initialKey = this.generateKey("primary");
    this.activeKeys.set("primary", initialKey);

    // Set up automatic key rotation if enabled
    if (this.config.keyRotationInterval > 0) {
      this.scheduleKeyRotation();
    }
  }

  /**
   * Generate a new encryption key
   */
  private generateKey(keyId: string): EncryptionKey {
    const keyData = this.deriveKey(
      crypto.randomBytes(this.config.saltSize),
      this.config.keySize
    );

    return {
      id: keyId,
      version: 1,
      algorithm: this.config.defaultAlgorithm,
      created: new Date(),
      status: "active",
      keyData,
    };
  }

  /**
   * Derive key using configured KDF
   */
  private deriveKey(salt: Buffer, keyLength: number): Buffer {
    switch (this.config.keyDerivation) {
      case KeyDerivationFunction.PBKDF2:
        return crypto.pbkdf2Sync(
          this.masterKey,
          salt,
          this.config.iterations,
          keyLength,
          "sha512"
        );

      case KeyDerivationFunction.SCRYPT:
        return crypto.scryptSync(this.masterKey, salt, keyLength, {
          N: this.config.iterations,
          r: this.config.memoryLimit || 8,
          p: this.config.parallelization || 1,
          maxmem: 32 * 1024 * 1024, // 32MB
        });

      default:
        throw new Error(
          `Unsupported key derivation function: ${this.config.keyDerivation}`
        );
    }
  }

  /**
   * Encrypt data with enterprise-grade security
   */
  public async encrypt(
    plaintext: string | Buffer,
    options: {
      algorithm?: EncryptionAlgorithm;
      keyId?: string;
      metadata?: Record<string, any>;
      userId?: string;
    } = {}
  ): Promise<EncryptedPayload> {
    const startTime = Date.now();

    try {
      const {
        algorithm = this.config.defaultAlgorithm,
        keyId = "primary",
        metadata = {},
        userId,
      } = options;

      // Get encryption key
      const key = this.activeKeys.get(keyId);
      if (!key || key.status !== "active") {
        throw new Error(`Invalid or inactive key: ${keyId}`);
      }

      // Convert input to buffer
      const data =
        typeof plaintext === "string"
          ? Buffer.from(plaintext, "utf8")
          : plaintext;

      // Generate salt and IV
      const salt = crypto.randomBytes(this.config.saltSize);
      const iv = crypto.randomBytes(this.config.ivSize);

      // Derive encryption key
      const derivedKey = this.deriveKey(salt, this.config.keySize);

      // Encrypt based on algorithm
      let encrypted: Buffer;
      let tag: Buffer | undefined;

      if (algorithm === EncryptionAlgorithm.AES_256_GCM) {
        const cipher = crypto.createCipher(algorithm, derivedKey);
        cipher.setAAD(Buffer.from(JSON.stringify(metadata))); // Additional authenticated data

        const chunks: Buffer[] = [];
        chunks.push(cipher.update(data));
        chunks.push(cipher.final());

        encrypted = Buffer.concat(chunks);
        tag = cipher.getAuthTag();
      } else {
        const cipher = crypto.createCipher(algorithm, derivedKey);

        const chunks: Buffer[] = [];
        chunks.push(cipher.update(data));
        chunks.push(cipher.final());

        encrypted = Buffer.concat(chunks);
      }

      const payload: EncryptedPayload = {
        version: "1.0",
        algorithm,
        data: encrypted.toString("base64"),
        iv: iv.toString("base64"),
        tag: tag?.toString("base64"),
        salt: salt.toString("base64"),
        keyId,
        timestamp: Date.now(),
        metadata,
      };

      // Audit logging
      if (this.config.auditLogging) {
        this.logOperation(
          "encrypt",
          keyId,
          data.length,
          algorithm,
          true,
          userId
        );
      }

      return payload;
    } catch (error) {
      if (this.config.auditLogging) {
        this.logOperation(
          "encrypt",
          options.keyId || "primary",
          0,
          options.algorithm || this.config.defaultAlgorithm,
          false,
          options.userId,
          error instanceof Error ? error.message : "Unknown error"
        );
      }
      throw error;
    }
  }

  /**
   * Decrypt data with verification
   */
  public async decrypt(
    payload: EncryptedPayload,
    options: {
      userId?: string;
    } = {}
  ): Promise<Buffer> {
    try {
      const {
        keyId = "primary",
        algorithm,
        data,
        iv,
        tag,
        salt,
        metadata = {},
      } = payload;

      // Get decryption key
      const key = this.activeKeys.get(keyId);
      if (!key) {
        throw new Error(`Key not found: ${keyId}`);
      }

      // Decode components
      const encryptedData = Buffer.from(data, "base64");
      const ivBuffer = Buffer.from(iv, "base64");
      const saltBuffer = Buffer.from(salt, "base64");
      const tagBuffer = tag ? Buffer.from(tag, "base64") : undefined;

      // Derive decryption key
      const derivedKey = this.deriveKey(saltBuffer, this.config.keySize);

      // Decrypt based on algorithm
      let decrypted: Buffer;

      if (algorithm === EncryptionAlgorithm.AES_256_GCM) {
        if (!tagBuffer) {
          throw new Error("Authentication tag required for GCM mode");
        }

        const decipher = crypto.createDecipher(algorithm, derivedKey);
        decipher.setAuthTag(tagBuffer);
        decipher.setAAD(Buffer.from(JSON.stringify(metadata)));

        const chunks: Buffer[] = [];
        chunks.push(decipher.update(encryptedData));
        chunks.push(decipher.final());

        decrypted = Buffer.concat(chunks);
      } else {
        const decipher = crypto.createDecipher(algorithm, derivedKey);

        const chunks: Buffer[] = [];
        chunks.push(decipher.update(encryptedData));
        chunks.push(decipher.final());

        decrypted = Buffer.concat(chunks);
      }

      // Audit logging
      if (this.config.auditLogging) {
        this.logOperation(
          "decrypt",
          keyId,
          decrypted.length,
          algorithm,
          true,
          options.userId
        );
      }

      return decrypted;
    } catch (error) {
      if (this.config.auditLogging) {
        this.logOperation(
          "decrypt",
          payload.keyId || "primary",
          0,
          payload.algorithm,
          false,
          options.userId,
          error instanceof Error ? error.message : "Unknown error"
        );
      }
      throw error;
    }
  }

  /**
   * Rotate encryption keys
   */
  public async rotateKey(keyId: string): Promise<void> {
    const currentKey = this.activeKeys.get(keyId);
    if (!currentKey) {
      throw new Error(`Key not found: ${keyId}`);
    }

    // Mark current key as rotating
    currentKey.status = "rotating";
    currentKey.rotated = new Date();

    // Generate new key
    const newKey = this.generateKey(keyId);
    newKey.version = currentKey.version + 1;

    // Update active keys
    this.activeKeys.set(keyId, newKey);

    // Schedule deprecation of old key
    setTimeout(
      () => {
        if (currentKey.status === "rotating") {
          currentKey.status = "deprecated";
        }
      },
      24 * 60 * 60 * 1000
    ); // 24 hours

    // Audit log
    if (this.config.auditLogging) {
      this.logOperation("key_rotation", keyId, 0, newKey.algorithm, true);
    }
  }

  /**
   * Schedule automatic key rotation
   */
  private scheduleKeyRotation(): void {
    const rotationInterval =
      this.config.keyRotationInterval * 24 * 60 * 60 * 1000; // Convert days to ms

    this.keyRotationTimer = setInterval(async () => {
      for (const [keyId] of this.activeKeys) {
        try {
          await this.rotateKey(keyId);
        } catch (error) {
          console.error(`Failed to rotate key ${keyId}:`, error);
        }
      }
    }, rotationInterval);
  }

  /**
   * Log encryption operation for audit
   */
  private logOperation(
    operation: EncryptionAuditLog["operation"],
    keyId: string,
    dataSize: number,
    algorithm: EncryptionAlgorithm,
    success: boolean,
    userId?: string,
    error?: string
  ): void {
    const logEntry: EncryptionAuditLog = {
      timestamp: new Date(),
      operation,
      keyId,
      dataSize,
      algorithm,
      success,
      error,
      userId,
    };

    this.auditLogs.push(logEntry);

    // In production, this should be sent to a secure audit service
    if (process.env.NODE_ENV === "development") {
      console.log("Encryption Audit Log:", logEntry);
    }
  }

  /**
   * Get audit logs for compliance reporting
   */
  public getAuditLogs(
    startDate?: Date,
    endDate?: Date,
    operation?: EncryptionAuditLog["operation"]
  ): EncryptionAuditLog[] {
    let logs = this.auditLogs;

    if (startDate) {
      logs = logs.filter(log => log.timestamp >= startDate);
    }

    if (endDate) {
      logs = logs.filter(log => log.timestamp <= endDate);
    }

    if (operation) {
      logs = logs.filter(log => log.operation === operation);
    }

    return logs;
  }

  /**
   * Health check for encryption service
   */
  public async healthCheck(): Promise<{
    status: "healthy" | "warning" | "critical";
    details: Record<string, any>;
  }> {
    const details: Record<string, any> = {
      activeKeys: this.activeKeys.size,
      auditLogsCount: this.auditLogs.length,
      keyRotationEnabled: !!this.keyRotationTimer,
      config: {
        algorithm: this.config.defaultAlgorithm,
        keyDerivation: this.config.keyDerivation,
        auditLogging: this.config.auditLogging,
      },
    };

    // Check for deprecated keys
    const deprecatedKeys = Array.from(this.activeKeys.values()).filter(
      key => key.status === "deprecated"
    );

    if (deprecatedKeys.length > 0) {
      details.deprecatedKeys = deprecatedKeys.length;
    }

    // Check key age
    const oldKeys = Array.from(this.activeKeys.values()).filter(key => {
      const age = Date.now() - key.created.getTime();
      const maxAge = this.config.keyRotationInterval * 24 * 60 * 60 * 1000;
      return age > maxAge * 1.5; // 50% over rotation interval
    });

    if (oldKeys.length > 0) {
      details.oldKeys = oldKeys.length;
      return { status: "warning", details };
    }

    return { status: "healthy", details };
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.keyRotationTimer) {
      clearInterval(this.keyRotationTimer);
    }

    // Clear sensitive data
    this.activeKeys.clear();
    this.auditLogs.length = 0;
    this.masterKey.fill(0);
  }
}

// Utility functions for common encryption tasks
export class EnterpriseEncryptionUtils {
  /**
   * Generate cryptographically secure random string
   */
  static generateSecureRandom(length: number = 32): string {
    return crypto.randomBytes(length).toString("hex");
  }

  /**
   * Generate secure salt
   */
  static generateSalt(length: number = 32): Buffer {
    return crypto.randomBytes(length);
  }

  /**
   * Secure comparison to prevent timing attacks
   */
  static secureCompare(a: string | Buffer, b: string | Buffer): boolean {
    const bufferA = typeof a === "string" ? Buffer.from(a, "utf8") : a;
    const bufferB = typeof b === "string" ? Buffer.from(b, "utf8") : b;

    if (bufferA.length !== bufferB.length) {
      return false;
    }

    return timingSafeEqual(bufferA, bufferB);
  }

  /**
   * Generate secure hash with salt
   */
  static secureHash(
    data: string | Buffer,
    salt: Buffer,
    algorithm: string = "sha512"
  ): Buffer {
    const hash = createHash(algorithm);
    hash.update(typeof data === "string" ? Buffer.from(data, "utf8") : data);
    hash.update(salt);
    return hash.digest();
  }

  /**
   * Generate HMAC for data integrity
   */
  static generateHMAC(
    data: string | Buffer,
    key: Buffer,
    algorithm: string = "sha256"
  ): Buffer {
    const hmac = createHmac(algorithm, key);
    hmac.update(typeof data === "string" ? Buffer.from(data, "utf8") : data);
    return hmac.digest();
  }
}

// Singleton instance for application-wide use
let enterpriseEncryption: EnterpriseEncryptionService | null = null;

export function getEnterpriseEncryption(): EnterpriseEncryptionService {
  if (!enterpriseEncryption) {
    const masterKey =
      process.env.ENTERPRISE_ENCRYPTION_KEY ||
      process.env.SUPABASE_JWT_SECRET ||
      process.env.NEXTAUTH_SECRET;

    if (!masterKey) {
      throw new Error(
        "Encryption master key not found. Set ENTERPRISE_ENCRYPTION_KEY environment variable."
      );
    }

    enterpriseEncryption = new EnterpriseEncryptionService(masterKey);
  }

  return enterpriseEncryption;
}

export default EnterpriseEncryptionService;
