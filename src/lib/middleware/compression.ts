import { NextRequest, NextResponse } from "next/server";
import { gzip, deflate } from "zlib";
import { promisify } from "util";

const gzipAsync = promisify(gzip);
const deflateAsync = promisify(deflate);

interface CompressionOptions {
  threshold: number; // Minimum response size to compress (bytes)
  level: number; // Compression level (1-9)
  excludeContentTypes: string[];
  excludePaths: string[];
}

const defaultOptions: CompressionOptions = {
  threshold: 1024, // 1KB
  level: 6, // Balanced compression
  excludeContentTypes: [
    "image/",
    "video/",
    "audio/",
    "application/zip",
    "application/gzip",
    "application/x-rar-compressed",
  ],
  excludePaths: ["/api/ws", "/api/stream"],
};

// Check if content should be compressed
function shouldCompress(
  contentType: string | null,
  contentLength: number,
  path: string,
  options: CompressionOptions
): boolean {
  // Skip if content is too small
  if (contentLength < options.threshold) {
    return false;
  }

  // Skip excluded paths
  if (options.excludePaths.some(excludePath => path.startsWith(excludePath))) {
    return false;
  }

  // Skip excluded content types
  if (contentType) {
    if (
      options.excludeContentTypes.some(excluded =>
        contentType.startsWith(excluded)
      )
    ) {
      return false;
    }
  }

  return true;
}

// Get preferred encoding from Accept-Encoding header
function getPreferredEncoding(
  acceptEncoding: string | null
): "gzip" | "deflate" | null {
  if (!acceptEncoding) return null;

  const encodings = acceptEncoding.toLowerCase();

  // Prefer gzip over deflate
  if (encodings.includes("gzip")) return "gzip";
  if (encodings.includes("deflate")) return "deflate";

  return null;
}

// Compress data based on encoding
async function compressData(
  data: Buffer,
  encoding: "gzip" | "deflate",
  level: number
): Promise<Buffer> {
  if (encoding === "gzip") {
    return await gzipAsync(data, { level });
  } else {
    return await deflateAsync(data, { level });
  }
}

// Compression middleware for API routes
export function compressionMiddleware(
  customOptions?: Partial<CompressionOptions>
) {
  const options = { ...defaultOptions, ...customOptions };

  return async (req: any, res: any, next: any) => {
    const originalSend = res.send;
    const originalJson = res.json;

    // Override res.send
    res.send = function (data: any) {
      return handleCompression.call(
        this,
        data,
        originalSend,
        req,
        res,
        options,
        false
      );
    };

    // Override res.json
    res.json = function (data: any) {
      return handleCompression.call(
        this,
        data,
        originalJson,
        req,
        res,
        options,
        true
      );
    };

    next();
  };
}

async function handleCompression(
  data: any,
  originalMethod: Function,
  req: any,
  res: any,
  options: CompressionOptions,
  isJson: boolean
) {
  try {
    // Convert data to buffer
    let buffer: Buffer;
    if (isJson) {
      buffer = Buffer.from(JSON.stringify(data));
      res.setHeader("Content-Type", "application/json; charset=utf-8");
    } else {
      buffer = Buffer.isBuffer(data) ? data : Buffer.from(String(data));
    }

    const contentType = res.getHeader("Content-Type") as string;
    const path = req.originalUrl || req.url;

    // Check if we should compress
    if (!shouldCompress(contentType, buffer.length, path, options)) {
      return originalMethod.call(res, isJson ? data : buffer);
    }

    // Get preferred encoding
    const acceptEncoding = req.headers["accept-encoding"];
    const encoding = getPreferredEncoding(acceptEncoding);

    if (!encoding) {
      return originalMethod.call(res, isJson ? data : buffer);
    }

    // Compress the data
    const startTime = Date.now();
    const compressedBuffer = await compressData(
      buffer,
      encoding,
      options.level
    );
    const compressionTime = Date.now() - startTime;

    // Calculate compression ratio
    const originalSize = buffer.length;
    const compressedSize = compressedBuffer.length;
    const compressionRatio = (
      ((originalSize - compressedSize) / originalSize) *
      100
    ).toFixed(1);

    // Set compression headers
    res.setHeader("Content-Encoding", encoding);
    res.setHeader("Content-Length", compressedSize);
    res.setHeader("Vary", "Accept-Encoding");
    res.setHeader("X-Compression-Ratio", `${compressionRatio}%`);
    res.setHeader("X-Compression-Time", `${compressionTime}ms`);
    res.setHeader("X-Original-Size", originalSize);
    res.setHeader("X-Compressed-Size", compressedSize);

    console.log(
      `[Compression] ${req.method} ${path} - ${originalSize}B -> ${compressedSize}B (${compressionRatio}% reduction, ${compressionTime}ms)`
    );

    return originalMethod.call(res, compressedBuffer);
  } catch (error) {
    console.error("[Compression] Compression error:", error);
    // Fall back to uncompressed response
    return originalMethod.call(res, isJson ? data : Buffer.from(String(data)));
  }
}

// Next.js middleware for compression
export function nextCompressionMiddleware(
  customOptions?: Partial<CompressionOptions>
) {
  const options = { ...defaultOptions, ...customOptions };

  return async function middleware(request: NextRequest) {
    // This will be handled by the API route middleware
    return NextResponse.next();
  };
}

// Utility to manually compress response data
export async function compressResponse(
  data: any,
  acceptEncoding: string | null,
  customOptions?: Partial<CompressionOptions>
): Promise<{
  data: Buffer;
  encoding?: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}> {
  const options = { ...defaultOptions, ...customOptions };

  // Convert to buffer
  const buffer = Buffer.from(
    typeof data === "string" ? data : JSON.stringify(data)
  );
  const originalSize = buffer.length;

  // Check if we should compress
  if (originalSize < options.threshold) {
    return {
      data: buffer,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 0,
    };
  }

  // Get encoding
  const encoding = getPreferredEncoding(acceptEncoding);
  if (!encoding) {
    return {
      data: buffer,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 0,
    };
  }

  // Compress
  const compressedBuffer = await compressData(buffer, encoding, options.level);
  const compressedSize = compressedBuffer.length;
  const compressionRatio =
    ((originalSize - compressedSize) / originalSize) * 100;

  return {
    data: compressedBuffer,
    encoding,
    originalSize,
    compressedSize,
    compressionRatio,
  };
}

// Performance monitoring for compression
export class CompressionMonitor {
  private static instance: CompressionMonitor;
  private stats = {
    totalRequests: 0,
    compressedRequests: 0,
    totalOriginalBytes: 0,
    totalCompressedBytes: 0,
    totalCompressionTime: 0,
    averageCompressionRatio: 0,
  };

  static getInstance(): CompressionMonitor {
    if (!CompressionMonitor.instance) {
      CompressionMonitor.instance = new CompressionMonitor();
    }
    return CompressionMonitor.instance;
  }

  recordCompression(
    originalSize: number,
    compressedSize: number,
    compressionTime: number
  ): void {
    this.stats.totalRequests++;
    this.stats.compressedRequests++;
    this.stats.totalOriginalBytes += originalSize;
    this.stats.totalCompressedBytes += compressedSize;
    this.stats.totalCompressionTime += compressionTime;

    // Calculate average compression ratio
    this.stats.averageCompressionRatio =
      ((this.stats.totalOriginalBytes - this.stats.totalCompressedBytes) /
        this.stats.totalOriginalBytes) *
      100;
  }

  recordNonCompression(): void {
    this.stats.totalRequests++;
  }

  getStats() {
    return {
      ...this.stats,
      compressionRate:
        (this.stats.compressedRequests / this.stats.totalRequests) * 100,
      averageCompressionTime:
        this.stats.totalCompressionTime / this.stats.compressedRequests,
      totalBytesSaved:
        this.stats.totalOriginalBytes - this.stats.totalCompressedBytes,
    };
  }

  reset(): void {
    this.stats = {
      totalRequests: 0,
      compressedRequests: 0,
      totalOriginalBytes: 0,
      totalCompressedBytes: 0,
      totalCompressionTime: 0,
      averageCompressionRatio: 0,
    };
  }
}

export const compressionMonitor = CompressionMonitor.getInstance();
