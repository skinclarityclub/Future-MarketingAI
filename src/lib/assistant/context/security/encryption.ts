import * as crypto from "crypto";

// Configuration for encryption
export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  tagLength: number;
  iterations: number;
  saltLength: number;
}

// Default encryption configuration using AES-256-GCM
export const DEFAULT_ENCRYPTION_CONFIG: EncryptionConfig = {
  algorithm: "aes-256-gcm",
  keyLength: 32,
  ivLength: 12,
  tagLength: 16,
  iterations: 100000,
  saltLength: 32,
};

// Encrypted data structure
export interface EncryptedData {
  data: string; // Base64 encoded encrypted data
  iv: string; // Base64 encoded initialization vector
  tag: string; // Base64 encoded authentication tag
  salt: string; // Base64 encoded salt for key derivation
}

export class FieldEncryption {
  private config: EncryptionConfig;
  private masterKey: string;

  constructor(
    masterKey: string,
    config: EncryptionConfig = DEFAULT_ENCRYPTION_CONFIG
  ) {
    if (!masterKey || masterKey.length < 32) {
      throw new Error("Master key must be at least 32 characters long");
    }
    this.masterKey = masterKey;
    this.config = config;
  }

  /**
   * Derive a key from the master key using PBKDF2
   */
  private deriveKey(salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(
      this.masterKey,
      salt,
      this.config.iterations,
      this.config.keyLength,
      "sha512"
    );
  }

  /**
   * Encrypt sensitive data
   */
  public encrypt(plaintext: string): EncryptedData {
    try {
      // Generate random salt and IV
      const salt = crypto.randomBytes(this.config.saltLength);
      const iv = crypto.randomBytes(this.config.ivLength);

      // Derive encryption key
      const key = this.deriveKey(salt);

      // Create cipher
      const cipher = crypto.createCipher(this.config.algorithm, key);
      cipher.setAutoPadding(true);

      // Encrypt data
      let encrypted = cipher.update(plaintext, "utf8", "base64");
      encrypted += cipher.final("base64");

      // For GCM mode, we'll simulate the tag with a hash
      const tag = crypto.createHmac("sha256", key).update(encrypted).digest();

      return {
        data: encrypted,
        iv: iv.toString("base64"),
        tag: tag.toString("base64"),
        salt: salt.toString("base64"),
      };
    } catch (error) {
      throw new Error(
        `Encryption failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Decrypt sensitive data
   */
  public decrypt(encryptedData: EncryptedData): string {
    try {
      // Decode components
      const iv = Buffer.from(encryptedData.iv, "base64");
      const tag = Buffer.from(encryptedData.tag, "base64");
      const salt = Buffer.from(encryptedData.salt, "base64");

      // Derive decryption key
      const key = this.deriveKey(salt);

      // Verify HMAC tag
      const expectedTag = crypto
        .createHmac("sha256", key)
        .update(encryptedData.data)
        .digest();
      if (!crypto.timingSafeEqual(tag, expectedTag)) {
        throw new Error(
          "Authentication failed - data may have been tampered with"
        );
      }

      // Create decipher
      const decipher = crypto.createDecipher(this.config.algorithm, key);
      decipher.setAutoPadding(true);

      // Decrypt data
      let decrypted = decipher.update(encryptedData.data, "base64", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      throw new Error(
        `Decryption failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Hash sensitive data for indexing (one-way)
   */
  public hash(data: string): string {
    const hash = crypto.createHash("sha256");
    hash.update(data);
    hash.update(this.masterKey); // Include master key for uniqueness
    return hash.digest("hex");
  }

  /**
   * Generate a secure random token
   */
  public static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString("hex");
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  public static secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }
}

// Utility functions for common encryption tasks
export class ContextEncryption {
  private fieldEncryption: FieldEncryption;

  constructor(masterKey?: string) {
    const key =
      masterKey ||
      process.env.CONTEXT_ENCRYPTION_KEY ||
      process.env.SUPABASE_JWT_SECRET;
    if (!key) {
      throw new Error(
        "Encryption key not provided. Set CONTEXT_ENCRYPTION_KEY or SUPABASE_JWT_SECRET environment variable."
      );
    }
    this.fieldEncryption = new FieldEncryption(key);
  }

  /**
   * Encrypt user query text
   */
  public encryptUserQuery(query: string): EncryptedData {
    return this.fieldEncryption.encrypt(query);
  }

  /**
   * Decrypt user query text
   */
  public decryptUserQuery(encryptedQuery: EncryptedData): string {
    return this.fieldEncryption.decrypt(encryptedQuery);
  }

  /**
   * Encrypt assistant response
   */
  public encryptAssistantResponse(response: string): EncryptedData {
    return this.fieldEncryption.encrypt(response);
  }

  /**
   * Decrypt assistant response
   */
  public decryptAssistantResponse(encryptedResponse: EncryptedData): string {
    return this.fieldEncryption.decrypt(encryptedResponse);
  }

  /**
   * Encrypt context data (JSON serializable)
   */
  public encryptContextData(contextData: Record<string, any>): EncryptedData {
    const jsonString = JSON.stringify(contextData);
    return this.fieldEncryption.encrypt(jsonString);
  }

  /**
   * Decrypt context data
   */
  public decryptContextData(encryptedData: EncryptedData): Record<string, any> {
    const jsonString = this.fieldEncryption.decrypt(encryptedData);
    return JSON.parse(jsonString);
  }

  /**
   * Hash user ID for privacy-preserving indexing
   */
  public hashUserId(userId: string): string {
    return this.fieldEncryption.hash(userId);
  }

  /**
   * Hash session ID
   */
  public hashSessionId(sessionId: string): string {
    return this.fieldEncryption.hash(sessionId);
  }

  /**
   * Generate secure session token
   */
  public generateSessionToken(): string {
    return FieldEncryption.generateToken(64);
  }

  /**
   * Generate secure API key
   */
  public generateApiKey(): string {
    return FieldEncryption.generateToken(32);
  }
}

// Singleton instance
let contextEncryptionInstance: ContextEncryption | null = null;

export function getContextEncryption(): ContextEncryption {
  if (!contextEncryptionInstance) {
    contextEncryptionInstance = new ContextEncryption();
  }
  return contextEncryptionInstance;
}
