/**
 * Simple Crypto Demonstration API
 * Task 37.2: Working Encryption Demo
 */

import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";

// Simple encryption using AES-256-CBC (widely supported)
class WorkingEncryptionService {
  private algorithm = "aes-256-cbc";
  private keySize = 32;
  private ivSize = 16;
  private masterKey = "my-32-char-master-key-123456789!";

  encrypt(plaintext: string): any {
    try {
      const iv = crypto.randomBytes(this.ivSize);
      const key = Buffer.from(this.masterKey, "utf8");

      const cipher = crypto.createCipher(this.algorithm, key);
      let encrypted = cipher.update(plaintext, "utf8", "hex");
      encrypted += cipher.final("hex");

      return {
        algorithm: this.algorithm,
        data: encrypted,
        iv: iv.toString("hex"),
        timestamp: Date.now(),
      };
    } catch (error) {
      throw new Error(
        `Encryption failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  decrypt(payload: any): string {
    try {
      const key = Buffer.from(this.masterKey, "utf8");

      const decipher = crypto.createDecipher(this.algorithm, key);
      let decrypted = decipher.update(payload.data, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      throw new Error(
        `Decryption failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // Generate hash for searchable encrypted fields
  generateHash(data: string): string {
    return crypto.createHash("sha256").update(data.toLowerCase()).digest("hex");
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get("test") || "all";

    const encryptionService = new WorkingEncryptionService();
    const results: any = {
      success: true,
      message: "Encryption demonstration completed successfully",
      testType,
      tests: {},
    };

    // Test 1: Basic Encryption/Decryption
    if (testType === "all" || testType === "basic") {
      const startTime = Date.now();
      const testData = "This is sensitive customer data that needs encryption!";

      const encrypted = encryptionService.encrypt(testData);
      const decrypted = encryptionService.decrypt(encrypted);
      const encryptionTime = Date.now() - startTime;

      results.tests.basicEncryption = {
        originalData: testData,
        encryptedData: encrypted.data.substring(0, 32) + "...",
        algorithm: encrypted.algorithm,
        decryptedData: decrypted,
        isMatch: decrypted === testData,
        encryptionTime,
      };
    }

    // Test 2: Customer Data Simulation
    if (testType === "all" || testType === "customer") {
      const customer = {
        id: "cust-123",
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1-555-123-4567",
        address: "123 Main St, Anytown, ST 12345",
        personal_notes: "Premium customer, prefers email communication",
      };

      // Simulate encrypting sensitive fields
      const encryptedCustomer = { ...customer };
      const sensitiveFields = ["email", "phone", "address", "personal_notes"];

      for (const field of sensitiveFields) {
        const originalValue = customer[field as keyof typeof customer];
        if (originalValue) {
          const encrypted = encryptionService.encrypt(originalValue);
          const hash = encryptionService.generateHash(originalValue);

          encryptedCustomer[field as keyof typeof customer] = {
            encrypted_data: encrypted.data,
            data_hash: hash.substring(0, 16) + "...",
            created_at: new Date().toISOString(),
          } as any;
        }
      }

      // Simulate decrypting for display
      const decryptedCustomer = { ...encryptedCustomer };
      for (const field of sensitiveFields) {
        const fieldData = encryptedCustomer[
          field as keyof typeof encryptedCustomer
        ] as any;
        if (fieldData?.encrypted_data) {
          const decrypted = encryptionService.decrypt({
            data: fieldData.encrypted_data,
          });
          decryptedCustomer[field as keyof typeof decryptedCustomer] =
            decrypted as any;
        }
      }

      results.tests.customerEncryption = {
        originalCustomer: customer,
        encryptedFields: sensitiveFields,
        decryptedCustomer,
        isMatch: JSON.stringify(customer) === JSON.stringify(decryptedCustomer),
      };
    }

    // Test 3: Performance Test
    if (testType === "performance") {
      const iterations = 100;
      const testData = "Performance test data";
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        const encrypted = encryptionService.encrypt(`${testData} ${i}`);
        const decrypted = encryptionService.decrypt(encrypted);
        times.push(Date.now() - start);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / iterations;
      const throughput = iterations / (avgTime / 1000);

      results.tests.performance = {
        iterations,
        averageTime: Math.round(avgTime * 100) / 100,
        throughput: Math.round(throughput * 100) / 100,
      };
    }

    // Test 4: Hash Generation for Search
    if (testType === "all" || testType === "hash") {
      const emails = [
        "john.doe@example.com",
        "jane.smith@company.com",
        "admin@enterprise.com",
      ];

      const hashes = emails.map(email => ({
        email,
        hash: encryptionService.generateHash(email).substring(0, 16) + "...",
        searchable: true,
      }));

      results.tests.hashGeneration = {
        description:
          "Hashes allow searching encrypted fields without decryption",
        emails: hashes,
      };
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Encryption demonstration failed",
      },
      { status: 500 }
    );
  }
}
