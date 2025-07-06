/**
 * Encryption Test API Endpoint
 * Task 37.2: Implement Data Encryption Protocols
 *
 * Test endpoint to demonstrate enterprise encryption capabilities
 */

import { NextRequest, NextResponse } from "next/server";
import { getEnterpriseEncryption } from "@/lib/security/enterprise-encryption";
import { DatabaseEncryptionService } from "@/lib/security/database-encryption";
import { createApiEncryptionMiddleware } from "@/lib/security/api-encryption-middleware";

// Initialize services
const encryptionService = getEnterpriseEncryption();
const dbEncryption = new DatabaseEncryptionService();
const apiEncryption = createApiEncryptionMiddleware();

// Test data structures
interface TestCustomerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  tax_id: string;
  personal_notes: string;
  created_at: string;
}

interface TestResponse {
  success: boolean;
  message: string;
  data?: any;
  encryption?: {
    fieldEncryption: any;
    apiEncryption: any;
    enterpriseEncryption: any;
  };
  performance?: {
    totalTime: number;
    encryptionTime: number;
    decryptionTime: number;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get("test") || "all";
    const userId = searchParams.get("userId") || "test-user-123";

    const response: TestResponse = {
      success: true,
      message: "Encryption test completed successfully",
      encryption: {
        fieldEncryption: {},
        apiEncryption: {},
        enterpriseEncryption: {},
      },
      performance: {
        totalTime: 0,
        encryptionTime: 0,
        decryptionTime: 0,
      },
    };

    // Test 1: Enterprise Encryption Service
    if (testType === "all" || testType === "enterprise") {
      const encryptStart = Date.now();

      // Test basic encryption/decryption
      const testData = "This is sensitive customer data that needs encryption";
      const encrypted = await encryptionService.encrypt(testData, {
        userId,
        metadata: { test: "enterprise-encryption" },
      });

      const decryptStart = Date.now();
      const decrypted = await encryptionService.decrypt(encrypted, { userId });
      const decryptEnd = Date.now();

      response.encryption!.enterpriseEncryption = {
        originalData: testData,
        encryptedPayload: {
          version: encrypted.version,
          algorithm: encrypted.algorithm,
          keyId: encrypted.keyId,
          timestamp: encrypted.timestamp,
          dataSize: encrypted.data.length,
        },
        decryptedData: decrypted.toString("utf8"),
        isMatch: decrypted.toString("utf8") === testData,
        encryptionTime: decryptStart - encryptStart,
        decryptionTime: decryptEnd - decryptStart,
      };

      response.performance!.encryptionTime += decryptStart - encryptStart;
      response.performance!.decryptionTime += decryptEnd - decryptStart;
    }

    // Test 2: Database Field Encryption
    if (testType === "all" || testType === "database") {
      const dbEncryptStart = Date.now();

      // Test customer data encryption
      const testCustomer: TestCustomerData = {
        id: "cust-123",
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1-555-123-4567",
        address: "123 Main St, Anytown, ST 12345",
        tax_id: "123-45-6789",
        personal_notes: "Premium customer, prefers email communication",
        created_at: new Date().toISOString(),
      };

      // Encrypt the record
      const encryptedRecord = await dbEncryption.encryptRecord(
        "customers",
        testCustomer,
        {
          userId,
          operation: "insert",
        }
      );

      const dbDecryptStart = Date.now();

      // Decrypt the record
      const decryptedRecord = await dbEncryption.decryptRecord(
        "customers",
        encryptedRecord,
        {
          userId,
        }
      );

      const dbDecryptEnd = Date.now();

      response.encryption!.fieldEncryption = {
        originalRecord: testCustomer,
        encryptedFields: Object.keys(encryptedRecord).filter(
          key =>
            typeof (encryptedRecord as any)[key] === "object" &&
            (encryptedRecord as any)[key]?.encrypted_data
        ),
        decryptedRecord,
        isMatch:
          JSON.stringify(testCustomer) === JSON.stringify(decryptedRecord),
        encryptionTime: dbDecryptStart - dbEncryptStart,
        decryptionTime: dbDecryptEnd - dbDecryptStart,
      };

      response.performance!.encryptionTime += dbDecryptStart - dbEncryptStart;
      response.performance!.decryptionTime += dbDecryptEnd - dbDecryptStart;
    }

    // Test 3: Health Checks
    if (testType === "all" || testType === "health") {
      const [enterpriseHealth, dbHealth, apiHealth] = await Promise.all([
        encryptionService.healthCheck(),
        dbEncryption.healthCheck(),
        apiEncryption.healthCheck(),
      ]);

      response.encryption!.enterpriseEncryption.health = enterpriseHealth;
      response.encryption!.fieldEncryption.health = dbHealth;
      response.encryption!.apiEncryption.health = apiHealth;
    }

    // Test 4: Performance Test
    if (testType === "performance") {
      const iterations = parseInt(searchParams.get("iterations") || "100");
      const dataSize = parseInt(searchParams.get("dataSize") || "1024");

      const testData = "x".repeat(dataSize);
      const performanceResults = {
        iterations,
        dataSize,
        encryptionTimes: [] as number[],
        decryptionTimes: [] as number[],
        averageEncryption: 0,
        averageDecryption: 0,
        throughput: 0,
      };

      for (let i = 0; i < iterations; i++) {
        const encStart = Date.now();
        const encrypted = await encryptionService.encrypt(testData, { userId });
        const encEnd = Date.now();

        const decStart = Date.now();
        await encryptionService.decrypt(encrypted, { userId });
        const decEnd = Date.now();

        performanceResults.encryptionTimes.push(encEnd - encStart);
        performanceResults.decryptionTimes.push(decEnd - decStart);
      }

      performanceResults.averageEncryption =
        performanceResults.encryptionTimes.reduce((a, b) => a + b, 0) /
        iterations;
      performanceResults.averageDecryption =
        performanceResults.decryptionTimes.reduce((a, b) => a + b, 0) /
        iterations;
      performanceResults.throughput =
        (dataSize * iterations) /
        (((performanceResults.averageEncryption +
          performanceResults.averageDecryption) *
          iterations) /
          1000);

      response.data = performanceResults;
    }

    response.performance!.totalTime = Date.now() - startTime;

    return NextResponse.json(response);
  } catch (error) {
    console.error("Encryption test error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Encryption test failed",
        error: error instanceof Error ? error.message : "Unknown error",
        performance: {
          totalTime: Date.now() - startTime,
          encryptionTime: 0,
          decryptionTime: 0,
        },
      } as TestResponse,
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { action, data, userId = "test-user-123" } = body;

    let result: any = {};

    switch (action) {
      case "encrypt-field":
        const encryptedField = await dbEncryption.encryptRecord(
          data.tableName,
          data.record,
          { userId, operation: "insert" }
        );
        result = { encryptedRecord: encryptedField };
        break;

      case "decrypt-field":
        const decryptedField = await dbEncryption.decryptRecord(
          data.tableName,
          data.record,
          { userId }
        );
        result = { decryptedRecord: decryptedField };
        break;

      case "search-encrypted":
        if (!dbEncryption.isFieldSearchable(data.tableName, data.fieldName)) {
          throw new Error(`Field ${data.fieldName} is not searchable`);
        }
        const searchHash = dbEncryption.createSearchHash(data.searchValue);
        result = {
          searchHash,
          tableName: data.tableName,
          fieldName: data.fieldName,
          searchValue: data.searchValue,
        };
        break;

      case "key-rotation":
        await encryptionService.rotateKey(data.keyId || "primary");
        result = {
          message: "Key rotation completed",
          keyId: data.keyId || "primary",
        };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return NextResponse.json({
      success: true,
      message: `Action '${action}' completed successfully`,
      data: result,
      performance: {
        totalTime: Date.now() - startTime,
      },
    });
  } catch (error) {
    console.error("Encryption action error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Encryption action failed",
        error: error instanceof Error ? error.message : "Unknown error",
        performance: {
          totalTime: Date.now() - startTime,
        },
      },
      { status: 500 }
    );
  }
}

// Admin endpoint for encryption service management
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { action, config } = body;

    // This would typically require admin authentication
    // For testing purposes, we'll allow it

    switch (action) {
      case "update-config":
        // In a real implementation, you'd update the configuration
        return NextResponse.json({
          success: true,
          message: "Configuration updated",
          config: config,
        });

      case "audit-logs":
        const auditLogs = encryptionService.getAuditLogs(
          config?.startDate ? new Date(config.startDate) : undefined,
          config?.endDate ? new Date(config.endDate) : undefined,
          config?.operation
        );

        return NextResponse.json({
          success: true,
          message: "Audit logs retrieved",
          data: {
            logs: auditLogs,
            count: auditLogs.length,
          },
        });

      default:
        throw new Error(`Unknown admin action: ${action}`);
    }
  } catch (error) {
    console.error("Encryption admin action error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Admin action failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
