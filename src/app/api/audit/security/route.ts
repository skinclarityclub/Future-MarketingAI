/**
 * Audit Security Management API
 * Task 37.14: Implement Security and Encryption for Audit Logs
 *
 * API endpoints for managing audit log security features
 */

import { NextRequest, NextResponse } from "next/server";
import { AuditSecurityService } from "@/lib/security/audit-security";
import { protectAPIRoute } from "@/lib/rbac/rbac-middleware";

/**
 * GET /api/audit/security
 * Get security status and metrics
 */
export async function GET(request: NextRequest) {
  try {
    // Protect route with RBAC
    const authResult = await protectAPIRoute(request, [
      "security_admin",
      "admin",
      "super_admin",
    ]);
    if (!authResult.allowed) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", message: authResult.reason },
        { status: 401 }
      );
    }

    const securityService = AuditSecurityService.getInstance();

    // Get security metrics and report
    const metrics = securityService.getSecurityMetrics();
    const report = securityService.generateSecurityReport();

    return NextResponse.json({
      success: true,
      security: {
        metrics,
        report,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error getting security status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get security status",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/audit/security/test
 * Test encryption and security features
 */
export async function POST(request: NextRequest) {
  try {
    // Protect route with RBAC
    const authResult = await protectAPIRoute(request, [
      "security_admin",
      "admin",
      "super_admin",
    ]);
    if (!authResult.allowed) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", message: authResult.reason },
        { status: 401 }
      );
    }

    const body = await request.json();
    const securityService = AuditSecurityService.getInstance();

    // Test data for encryption
    const testData = body.testData || {
      eventName: "Security Test",
      timestamp: new Date().toISOString(),
      message: "Testing encryption and security features",
      userId: authResult.user?.id,
      sensitive: true,
    };

    // Test encryption
    console.log("Testing audit log encryption...");
    const encrypted = securityService.encryptAuditData(testData);

    // Test decryption
    console.log("Testing audit log decryption...");
    const decrypted = securityService.decryptAuditData(encrypted);

    // Test digital signature
    console.log("Testing digital signature...");
    const signature = securityService.createDigitalSignature(testData);
    const signatureValid = securityService.verifyDigitalSignature(
      testData,
      signature
    );

    // Test secure transmission
    console.log("Testing secure transmission...");
    const transmission = securityService.prepareSecureTransmission(testData);
    const transmissionValid = securityService.verifySecureTransmission(
      transmission.payload,
      transmission.checksum
    );

    // Test access validation
    console.log("Testing access validation...");
    const accessTest = securityService.validateAuditAccess(
      authResult.user?.id || "test-user",
      "security_events",
      "read"
    );

    return NextResponse.json({
      success: true,
      tests: {
        encryption: {
          success: JSON.stringify(testData) === JSON.stringify(decrypted),
          originalSize: JSON.stringify(testData).length,
          encryptedSize: encrypted.data.length,
          compressionRatio:
            encrypted.data.length / JSON.stringify(testData).length,
        },
        digitalSignature: {
          success: signatureValid,
          signature: signature.substring(0, 16) + "...", // Show only first 16 chars
        },
        secureTransmission: {
          success: transmissionValid,
          checksum: transmission.checksum.substring(0, 16) + "...",
        },
        accessControl: {
          ...accessTest,
        },
      },
      metrics: securityService.getSecurityMetrics(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Security test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Security test failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
