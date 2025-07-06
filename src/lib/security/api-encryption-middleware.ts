/**
 * API Encryption Middleware
 * Task 37.2: Implement Data Encryption Protocols
 *
 * End-to-end encryption for API requests/responses
 * Provides additional security layer beyond HTTPS/TLS
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getEnterpriseEncryption,
  EncryptedPayload,
} from "./enterprise-encryption";

// API encryption configuration
export interface ApiEncryptionConfig {
  enabled: boolean;
  requireEncryption: string[]; // Paths that require encryption
  optionalEncryption: string[]; // Paths that support encryption
  keyId: string;
  headerName: string;
  maxRequestSize: number; // bytes
  compressionEnabled: boolean;
  rateLimiting: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
}

// Default API encryption configuration
export const DEFAULT_API_ENCRYPTION_CONFIG: ApiEncryptionConfig = {
  enabled: true,
  requireEncryption: [
    "/api/customers",
    "/api/user-profiles",
    "/api/financial",
    "/api/ai-conversations",
    "/api/marketing-contacts",
  ],
  optionalEncryption: ["/api/dashboard", "/api/analytics", "/api/reports"],
  keyId: "api-encryption",
  headerName: "X-Encrypted-Request",
  maxRequestSize: 10 * 1024 * 1024, // 10MB
  compressionEnabled: true,
  rateLimiting: {
    enabled: true,
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
};

// Encrypted API request/response structure
export interface EncryptedApiPayload {
  encrypted: boolean;
  version: string;
  payload: EncryptedPayload;
  compression?: "gzip" | "deflate";
  integrity: string; // HMAC for integrity verification
}

// Request metadata for audit logging
export interface RequestMetadata {
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: number;
  endpoint: string;
  method: string;
}

export class ApiEncryptionMiddleware {
  private config: ApiEncryptionConfig;
  private encryptionService: ReturnType<typeof getEnterpriseEncryption>;
  private rateLimitStore: Map<string, { count: number; resetTime: number }> =
    new Map();

  constructor(config: Partial<ApiEncryptionConfig> = {}) {
    this.config = { ...DEFAULT_API_ENCRYPTION_CONFIG, ...config };
    this.encryptionService = getEnterpriseEncryption();
  }

  /**
   * Middleware function for Next.js API routes
   */
  public async middleware(
    request: NextRequest,
    handler: (
      req: NextRequest,
      metadata: RequestMetadata
    ) => Promise<NextResponse | Response>
  ): Promise<NextResponse | Response> {
    const metadata: RequestMetadata = {
      timestamp: Date.now(),
      endpoint: request.nextUrl.pathname,
      method: request.method,
      ipAddress: this.getClientIP(request),
      userAgent: request.headers.get("user-agent") || "Unknown",
      userId: request.headers.get("x-user-id") || undefined,
      sessionId: request.headers.get("x-session-id") || undefined,
    };

    try {
      // Rate limiting check
      if (this.config.rateLimiting.enabled) {
        const rateLimitResult = this.checkRateLimit(
          metadata.ipAddress || "unknown"
        );
        if (!rateLimitResult.allowed) {
          return NextResponse.json(
            {
              error: "Rate limit exceeded",
              retryAfter: rateLimitResult.retryAfter,
            },
            { status: 429 }
          );
        }
      }

      // Check if encryption is required or supported
      const encryptionRequired = this.isEncryptionRequired(metadata.endpoint);
      const encryptionSupported = this.isEncryptionSupported(metadata.endpoint);

      if (!encryptionRequired && !encryptionSupported) {
        // No encryption needed, proceed normally
        return handler(request, metadata);
      }

      // Check for encrypted request
      const isEncryptedRequest =
        request.headers.get(this.config.headerName) === "true";

      if (encryptionRequired && !isEncryptedRequest) {
        return NextResponse.json(
          { error: "Encrypted request required for this endpoint" },
          { status: 400 }
        );
      }

      // Decrypt request if encrypted
      let decryptedRequest = request;
      if (isEncryptedRequest) {
        decryptedRequest = await this.decryptRequest(request, metadata);
      }

      // Process the request
      const response = await handler(decryptedRequest, metadata);

      // Encrypt response if requested or required
      if (isEncryptedRequest || encryptionRequired) {
        return this.encryptResponse(response, metadata);
      }

      return response;
    } catch (error) {
      console.error("API Encryption Middleware Error:", error);

      return NextResponse.json(
        {
          error: "Request processing failed",
          details:
            process.env.NODE_ENV === "development"
              ? error instanceof Error
                ? error.message
                : "Unknown error"
              : "Internal server error",
        },
        { status: 500 }
      );
    }
  }

  /**
   * Decrypt incoming request
   */
  private async decryptRequest(
    request: NextRequest,
    metadata: RequestMetadata
  ): Promise<NextRequest> {
    try {
      const body = await request.text();

      if (!body) {
        throw new Error("Empty encrypted request body");
      }

      // Parse encrypted payload
      const encryptedApiPayload: EncryptedApiPayload = JSON.parse(body);

      // Verify integrity
      if (!this.verifyIntegrity(encryptedApiPayload)) {
        throw new Error("Request integrity verification failed");
      }

      // Decrypt the payload
      const decryptedBuffer = await this.encryptionService.decrypt(
        encryptedApiPayload.payload,
        { userId: metadata.userId }
      );

      let decryptedData = decryptedBuffer.toString("utf8");

      // Decompress if needed
      if (encryptedApiPayload.compression) {
        decryptedData = await this.decompress(
          decryptedData,
          encryptedApiPayload.compression
        );
      }

      // Create new request with decrypted body
      const newRequest = new NextRequest(request.url, {
        method: request.method,
        headers: request.headers,
        body: decryptedData,
      });

      return newRequest;
    } catch (error) {
      throw new Error(
        `Request decryption failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Encrypt outgoing response
   */
  private async encryptResponse(
    response: NextResponse | Response,
    metadata: RequestMetadata
  ): Promise<NextResponse> {
    try {
      const responseText = await response.text();
      let dataToEncrypt = responseText;

      // Compress if enabled and data is large enough
      if (this.config.compressionEnabled && dataToEncrypt.length > 1024) {
        dataToEncrypt = await this.compress(dataToEncrypt, "gzip");
      }

      // Encrypt the response
      const encryptedPayload = await this.encryptionService.encrypt(
        dataToEncrypt,
        {
          keyId: this.config.keyId,
          userId: metadata.userId,
          metadata: {
            endpoint: metadata.endpoint,
            method: metadata.method,
            responseTime: Date.now() - metadata.timestamp,
          },
        }
      );

      // Create encrypted API payload
      const encryptedApiPayload: EncryptedApiPayload = {
        encrypted: true,
        version: "1.0",
        payload: encryptedPayload,
        compression:
          this.config.compressionEnabled && dataToEncrypt !== responseText
            ? "gzip"
            : undefined,
        integrity: this.generateIntegrity(encryptedPayload),
      };

      // Create new response
      const newResponse = NextResponse.json(encryptedApiPayload, {
        status: response.status,
        statusText: response.statusText,
      });

      // Copy headers from original response
      response.headers.forEach((value, key) => {
        if (!key.toLowerCase().startsWith("content-")) {
          newResponse.headers.set(key, value);
        }
      });

      // Add encryption headers
      newResponse.headers.set(this.config.headerName, "true");
      newResponse.headers.set("Content-Type", "application/json");

      return newResponse;
    } catch (error) {
      throw new Error(
        `Response encryption failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Check if encryption is required for endpoint
   */
  private isEncryptionRequired(endpoint: string): boolean {
    return this.config.requireEncryption.some(
      pattern =>
        endpoint.startsWith(pattern) || new RegExp(pattern).test(endpoint)
    );
  }

  /**
   * Check if encryption is supported for endpoint
   */
  private isEncryptionSupported(endpoint: string): boolean {
    return (
      this.isEncryptionRequired(endpoint) ||
      this.config.optionalEncryption.some(
        pattern =>
          endpoint.startsWith(pattern) || new RegExp(pattern).test(endpoint)
      )
    );
  }

  /**
   * Rate limiting check
   */
  private checkRateLimit(identifier: string): {
    allowed: boolean;
    retryAfter?: number;
  } {
    const now = Date.now();
    const key = `rate_limit_${identifier}`;
    const existing = this.rateLimitStore.get(key);

    if (!existing || now > existing.resetTime) {
      // Reset or create new entry
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + this.config.rateLimiting.windowMs,
      });
      return { allowed: true };
    }

    if (existing.count >= this.config.rateLimiting.maxRequests) {
      return {
        allowed: false,
        retryAfter: Math.ceil((existing.resetTime - now) / 1000),
      };
    }

    // Increment counter
    existing.count++;
    this.rateLimitStore.set(key, existing);
    return { allowed: true };
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");
    const remoteAddr = request.headers.get("x-remote-addr");

    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }

    return realIP || remoteAddr || "unknown";
  }

  /**
   * Compress data
   */
  private async compress(
    data: string,
    algorithm: "gzip" | "deflate"
  ): Promise<string> {
    const { gzip, deflate } = await import("zlib");
    const { promisify } = await import("util");

    const buffer = Buffer.from(data, "utf8");

    if (algorithm === "gzip") {
      const gzipAsync = promisify(gzip);
      const compressed = await gzipAsync(buffer);
      return compressed.toString("base64");
    } else {
      const deflateAsync = promisify(deflate);
      const compressed = await deflateAsync(buffer);
      return compressed.toString("base64");
    }
  }

  /**
   * Decompress data
   */
  private async decompress(
    data: string,
    algorithm: "gzip" | "deflate"
  ): Promise<string> {
    const { gunzip, inflate } = await import("zlib");
    const { promisify } = await import("util");

    const buffer = Buffer.from(data, "base64");

    if (algorithm === "gzip") {
      const gunzipAsync = promisify(gunzip);
      const decompressed = await gunzipAsync(buffer);
      return decompressed.toString("utf8");
    } else {
      const inflateAsync = promisify(inflate);
      const decompressed = await inflateAsync(buffer);
      return decompressed.toString("utf8");
    }
  }

  /**
   * Generate integrity hash for payload
   */
  private generateIntegrity(payload: EncryptedPayload): string {
    const crypto = require("crypto");
    const data = JSON.stringify(payload);
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  /**
   * Verify payload integrity
   */
  private verifyIntegrity(encryptedApiPayload: EncryptedApiPayload): boolean {
    const expectedIntegrity = this.generateIntegrity(
      encryptedApiPayload.payload
    );
    return encryptedApiPayload.integrity === expectedIntegrity;
  }

  /**
   * Health check for API encryption
   */
  public async healthCheck(): Promise<{
    status: "healthy" | "warning" | "critical";
    details: Record<string, any>;
  }> {
    const encryptionHealth = await this.encryptionService.healthCheck();

    const details = {
      encryptionService: encryptionHealth,
      config: {
        enabled: this.config.enabled,
        requiredEndpoints: this.config.requireEncryption.length,
        optionalEndpoints: this.config.optionalEncryption.length,
        rateLimiting: this.config.rateLimiting.enabled,
      },
      rateLimitEntries: this.rateLimitStore.size,
    };

    if (encryptionHealth.status === "critical") {
      return { status: "critical", details };
    }

    if (encryptionHealth.status === "warning") {
      return { status: "warning", details };
    }

    return { status: "healthy", details };
  }
}

// Helper function to create middleware instance
export function createApiEncryptionMiddleware(
  config: Partial<ApiEncryptionConfig> = {}
): ApiEncryptionMiddleware {
  return new ApiEncryptionMiddleware(config);
}

// Client-side encryption utilities
export class ApiEncryptionClient {
  private encryptionService: ReturnType<typeof getEnterpriseEncryption>;
  private config: Pick<
    ApiEncryptionConfig,
    "keyId" | "headerName" | "compressionEnabled"
  >;

  constructor(config: Partial<ApiEncryptionConfig> = {}) {
    this.encryptionService = getEnterpriseEncryption();
    this.config = {
      keyId: config.keyId || "api-encryption",
      headerName: config.headerName || "X-Encrypted-Request",
      compressionEnabled: config.compressionEnabled ?? true,
    };
  }

  /**
   * Encrypt request data
   */
  public async encryptRequest(
    data: any,
    metadata: RequestMetadata
  ): Promise<{
    body: string;
    headers: Record<string, string>;
  }> {
    let dataToEncrypt = typeof data === "string" ? data : JSON.stringify(data);

    // Compress if enabled and data is large enough
    let compression: "gzip" | undefined;
    if (this.config.compressionEnabled && dataToEncrypt.length > 1024) {
      const { gzip } = await import("zlib");
      const { promisify } = await import("util");
      const gzipAsync = promisify(gzip);

      const compressed = await gzipAsync(Buffer.from(dataToEncrypt, "utf8"));
      dataToEncrypt = compressed.toString("base64");
      compression = "gzip";
    }

    // Encrypt the data
    const encryptedPayload = await this.encryptionService.encrypt(
      dataToEncrypt,
      {
        keyId: this.config.keyId,
        userId: metadata.userId,
        metadata: {
          endpoint: metadata.endpoint,
          method: metadata.method,
          clientTimestamp: metadata.timestamp,
        },
      }
    );

    // Create encrypted API payload
    const encryptedApiPayload: EncryptedApiPayload = {
      encrypted: true,
      version: "1.0",
      payload: encryptedPayload,
      compression,
      integrity: this.generateIntegrity(encryptedPayload),
    };

    return {
      body: JSON.stringify(encryptedApiPayload),
      headers: {
        [this.config.headerName]: "true",
        "Content-Type": "application/json",
      },
    };
  }

  /**
   * Decrypt response data
   */
  public async decryptResponse(encryptedResponse: string): Promise<any> {
    const encryptedApiPayload: EncryptedApiPayload =
      JSON.parse(encryptedResponse);

    // Verify integrity
    if (!this.verifyIntegrity(encryptedApiPayload)) {
      throw new Error("Response integrity verification failed");
    }

    // Decrypt the payload
    const decryptedBuffer = await this.encryptionService.decrypt(
      encryptedApiPayload.payload
    );
    let decryptedData = decryptedBuffer.toString("utf8");

    // Decompress if needed
    if (encryptedApiPayload.compression === "gzip") {
      const { gunzip } = await import("zlib");
      const { promisify } = await import("util");
      const gunzipAsync = promisify(gunzip);

      const decompressed = await gunzipAsync(
        Buffer.from(decryptedData, "base64")
      );
      decryptedData = decompressed.toString("utf8");
    }

    // Try to parse as JSON, fallback to string
    try {
      return JSON.parse(decryptedData);
    } catch {
      return decryptedData;
    }
  }

  /**
   * Generate integrity hash for payload
   */
  private generateIntegrity(payload: EncryptedPayload): string {
    const crypto = require("crypto");
    const data = JSON.stringify(payload);
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  /**
   * Verify payload integrity
   */
  private verifyIntegrity(encryptedApiPayload: EncryptedApiPayload): boolean {
    const expectedIntegrity = this.generateIntegrity(
      encryptedApiPayload.payload
    );
    return encryptedApiPayload.integrity === expectedIntegrity;
  }
}

export default ApiEncryptionMiddleware;
