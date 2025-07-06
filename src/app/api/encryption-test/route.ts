/**
 * Working Encryption Test API
 * Task 37.2: Demonstrate Data Encryption Protocols
 */

import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";

// Simple encryption service using Node.js crypto
class SimpleEncryptionService {
  private algorithm = "aes-256-gcm";
  private keySize = 32;
  private ivSize = 12;
  private saltSize = 32;
  private iterations = 100000;
  private masterKey =
    process.env.ENTERPRISE_ENCRYPTION_KEY ||
    process.env.SUPABASE_JWT_SECRET ||
    "test-master-key-32-chars-long!!";

  private deriveKey(salt: Buffer, keyLength: number): Buffer {
    return crypto.pbkdf2Sync(
      this.masterKey,
      salt,
      this.iterations,
      keyLength,
      "sha512"
    );
  }

  async encrypt(plaintext: string, userId: string = "test-user") {
    const startTime = Date.now();

    try {
      // Convert input to buffer
      const data = Buffer.from(plaintext, "utf8");

      // Generate salt and IV
      const salt = crypto.randomBytes(this.saltSize);
      const iv = crypto.randomBytes(this.ivSize);

      // Derive encryption key
      const derivedKey = this.deriveKey(salt, this.keySize);

      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, derivedKey, iv);

      // Encrypt data
      const chunks = [];
      chunks.push(cipher.update(data));
      chunks.push(cipher.final());

      const encrypted = Buffer.concat(chunks);
      const tag = (cipher as any).getAuthTag();

      const payload = {
        version: "1.0",
        algorithm: this.algorithm,
        data: encrypted.toString("base64"),
        iv: iv.toString("base64"),
        tag: tag.toString("base64"),
        salt: salt.toString("base64"),
        keyId: "primary",
        timestamp: Date.now(),
        userId,
        encryptionTime: Date.now() - startTime,
      };

      return payload;
    } catch (error) {
      throw new Error(
        `Encryption failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async decrypt(payload: any, userId: string = "test-user") {
    const startTime = Date.now();

    try {
      const { algorithm, data, iv, tag, salt } = payload;

      // Decode components
      const encryptedData = Buffer.from(data, "base64");
      const ivBuffer = Buffer.from(iv, "base64");
      const saltBuffer = Buffer.from(salt, "base64");
      const tagBuffer = Buffer.from(tag, "base64");

      // Derive decryption key
      const derivedKey = this.deriveKey(saltBuffer, this.keySize);

      // Create decipher
      const decipher = crypto.createDecipheriv(algorithm, derivedKey, ivBuffer);
      decipher.setAuthTag(tagBuffer);

      // Decrypt data
      const chunks = [];
      chunks.push(decipher.update(encryptedData));
      chunks.push(decipher.final());

      const decrypted = Buffer.concat(chunks);
      const decryptionTime = Date.now() - startTime;

      return {
        data: decrypted,
        decryptionTime,
      };
    } catch (error) {
      throw new Error(
        `Decryption failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

// Simple database field encryption simulation
class SimpleDatabaseEncryption {
  private encryptionService = new SimpleEncryptionService();
  private hashAlgorithm = "sha256";

  async encryptCustomerRecord(record: any, userId: string = "test-user") {
    // Fields that should be encrypted
    const sensitiveFields = [
      "email",
      "phone",
      "address",
      "tax_id",
      "personal_notes",
    ];
    const searchableFields = ["email"]; // Fields that need to remain searchable

    const encryptedRecord = { ...record };

    for (const fieldName of sensitiveFields) {
      const fieldValue = record[fieldName];

      if (fieldValue != null) {
        try {
          const encryptedPayload = await this.encryptionService.encrypt(
            fieldValue,
            userId
          );

          const encryptedFieldData: any = {
            encrypted_data: JSON.stringify(encryptedPayload),
            encryption_version: "1.0",
            created_at: new Date().toISOString(),
          };

          // Add searchable hash if configured
          if (searchableFields.includes(fieldName)) {
            const hash = crypto.createHash(this.hashAlgorithm);
            hash.update(fieldValue.toLowerCase());
            encryptedFieldData.data_hash = hash.digest("hex");
          }

          encryptedRecord[fieldName] = encryptedFieldData;
        } catch (error) {
          throw new Error(
            `Failed to encrypt field ${fieldName}: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }
    }

    return encryptedRecord;
  }

  async decryptCustomerRecord(record: any, userId: string = "test-user") {
    const sensitiveFields = [
      "email",
      "phone",
      "address",
      "tax_id",
      "personal_notes",
    ];

    const decryptedRecord = { ...record };

    for (const fieldName of sensitiveFields) {
      const fieldData = record[fieldName];

      if (
        fieldData &&
        typeof fieldData === "object" &&
        "encrypted_data" in fieldData
      ) {
        try {
          const encryptedPayload = JSON.parse(fieldData.encrypted_data);
          const decryptResult = await this.encryptionService.decrypt(
            encryptedPayload,
            userId
          );
          decryptedRecord[fieldName] = decryptResult.data.toString("utf8");
        } catch (error) {
          throw new Error(
            `Failed to decrypt field ${fieldName}: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }
    }

    return decryptedRecord;
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get("test") || "all";
    const userId = searchParams.get("userId") || "test-user-123";

    const encryptionService = new SimpleEncryptionService();
    const dbEncryption = new SimpleDatabaseEncryption();

    const results: any = {
      success: true,
      message: "Encryption tests completed successfully",
      testType,
      userId,
      tests: {},
    };

    // Test 1: Basic Encryption/Decryption
    if (testType === "all" || testType === "basic") {
      const testData = "This is sensitive customer data that needs encryption";

      const encrypted = await encryptionService.encrypt(testData, userId);
      const decrypted = await encryptionService.decrypt(encrypted, userId);
      const decryptedText = decrypted.data.toString("utf8");

      results.tests.basicEncryption = {
        originalData: testData,
        encryptedSize: encrypted.data.length,
        algorithm: encrypted.algorithm,
        keyId: encrypted.keyId,
        decryptedData: decryptedText,
        isMatch: decryptedText === testData,
        encryptionTime: encrypted.encryptionTime,
        decryptionTime: decrypted.decryptionTime,
      };
    }

    // Test 2: Database Field Encryption
    if (testType === "all" || testType === "database") {
      const testCustomer = {
        id: "cust-123",
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1-555-123-4567",
        address: "123 Main St, Anytown, ST 12345",
        tax_id: "123-45-6789",
        personal_notes: "Premium customer, prefers email communication",
        created_at: new Date().toISOString(),
      };

      const encryptedCustomer = await dbEncryption.encryptCustomerRecord(
        testCustomer,
        userId
      );
      const decryptedCustomer = await dbEncryption.decryptCustomerRecord(
        encryptedCustomer,
        userId
      );

      const encryptedFields = Object.keys(encryptedCustomer).filter(
        key =>
          typeof encryptedCustomer[key] === "object" &&
          encryptedCustomer[key]?.encrypted_data
      );

      results.tests.databaseEncryption = {
        originalCustomer: testCustomer,
        encryptedFields,
        emailHashAvailable: !!encryptedCustomer.email?.data_hash,
        decryptedCustomer,
        isMatch:
          JSON.stringify(testCustomer) === JSON.stringify(decryptedCustomer),
      };
    }

    // Test 3: Performance Test
    if (testType === "performance") {
      const iterations = parseInt(searchParams.get("iterations") || "50");
      const testData = "Performance test data for encryption/decryption timing";

      const encryptionTimes = [];
      const decryptionTimes = [];

      for (let i = 0; i < iterations; i++) {
        const encrypted = await encryptionService.encrypt(
          `${testData} ${i}`,
          userId
        );
        const decrypted = await encryptionService.decrypt(encrypted, userId);

        encryptionTimes.push(encrypted.encryptionTime);
        decryptionTimes.push(decrypted.decryptionTime);
      }

      const avgEncryption =
        encryptionTimes.reduce((a, b) => a + b, 0) / iterations;
      const avgDecryption =
        decryptionTimes.reduce((a, b) => a + b, 0) / iterations;

      results.tests.performance = {
        iterations,
        averageEncryptionTime: Math.round(avgEncryption * 100) / 100,
        averageDecryptionTime: Math.round(avgDecryption * 100) / 100,
        totalThroughput:
          Math.round(
            (iterations / ((avgEncryption + avgDecryption) / 1000)) * 100
          ) / 100,
      };
    }

    results.totalTime = Date.now() - startTime;

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
