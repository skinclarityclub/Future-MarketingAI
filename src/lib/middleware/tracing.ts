import { NextRequest, NextResponse } from "next/server";
import {
  safeTrace as trace,
  safeContext as context,
  safeSpanStatusCode as SpanStatusCode,
  safeSpanKind as SpanKind,
  createSpan,
  trackApiCall,
} from "../tracing";

export interface TracingOptions {
  spanName?: string;
  attributes?: Record<string, string | number>;
  skipPaths?: string[];
}

// Create a traced API handler wrapper
export function createTracedAPIHandler(
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
  options: TracingOptions = {}
) {
  return async function tracedHandler(req: NextRequest): Promise<NextResponse> {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Skip tracing for specified paths
    if (options.skipPaths?.some(path => pathname.includes(path))) {
      return handler(req);
    }

    const spanName = options.spanName || `${req.method} ${pathname}`;
    const startTime = Date.now();

    // Create a new span for this request
    const span = createSpan(spanName, {
      "http.method": req.method,
      "http.url": req.url,
      "http.route": pathname,
      "http.user_agent": req.headers.get("user-agent") || "",
      "http.client_ip": req.headers.get("x-forwarded-for") || req.ip || "",
      ...options.attributes,
    });

    span.setAttributes({
      [SpanKind.SERVER]: true,
    });

    try {
      // Execute the handler within the span context
      const response = await context.with(
        trace.setSpan(context.active(), span),
        () => handler(req)
      );

      const duration = Date.now() - startTime;
      const statusCode = response.status;

      // Set span status based on response
      if (statusCode >= 400) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: `HTTP ${statusCode}`,
        });
      } else {
        span.setStatus({ code: SpanStatusCode.OK });
      }

      // Add response attributes
      span.setAttributes({
        "http.status_code": statusCode,
        "http.response.size": response.headers.get("content-length") || "0",
        "http.response.duration_ms": duration,
      });

      // Track metrics
      trackApiCall(pathname, req.method, statusCode, duration);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Record the error
      span.recordException(error as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : "Unknown error",
      });

      // Track failed API call
      trackApiCall(pathname, req.method, 500, duration);

      throw error;
    } finally {
      // Always end the span
      span.end();
    }
  };
}

export function withTracing(
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
  options: TracingOptions = {}
) {
  return createTracedAPIHandler(handler, options);
}

// Utility to create child spans within API handlers
export function createChildSpan(
  name: string,
  attributes: Record<string, string | number> = {}
) {
  const activeSpan = trace.getActiveSpan();
  if (!activeSpan) {
    return createSpan(name, attributes);
  }

  try {
    const tracer = trace.getTracer("skc-bi-dashboard");
    return tracer.startSpan(
      name,
      {
        parent: activeSpan,
        attributes: {
          "service.name": "skc-bi-dashboard",
          ...attributes,
        },
      },
      context.active()
    );
  } catch (error) {
    return createSpan(name, attributes);
  }
}

// Utility to trace database operations
export async function traceDbOperation<T>(
  operation: string,
  table: string,
  fn: () => Promise<T>
): Promise<T> {
  const span = createChildSpan(`db.${operation}`, {
    "db.operation": operation,
    "db.table": table,
    "db.system": "postgresql",
  });

  const startTime = Date.now();

  try {
    const result = await context.with(
      trace.setSpan(context.active(), span),
      fn
    );

    const duration = Date.now() - startTime;
    span.setAttributes({
      "db.duration_ms": duration,
      "db.success": true,
    });
    span.setStatus({ code: SpanStatusCode.OK });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    span.recordException(error as Error);
    span.setAttributes({
      "db.duration_ms": duration,
      "db.success": false,
      "db.error": error instanceof Error ? error.message : "Unknown error",
    });
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : "Database error",
    });

    throw error;
  } finally {
    span.end();
  }
}

// Utility to trace external API calls
export async function traceExternalCall<T>(
  service: string,
  operation: string,
  url: string,
  fn: () => Promise<T>
): Promise<T> {
  const span = createChildSpan(`external.${service}`, {
    "external.service": service,
    "external.operation": operation,
    "external.url": url,
    "http.method": "GET", // Default, can be overridden
  });

  const startTime = Date.now();

  try {
    const result = await context.with(
      trace.setSpan(context.active(), span),
      fn
    );

    const duration = Date.now() - startTime;
    span.setAttributes({
      "external.duration_ms": duration,
      "external.success": true,
    });
    span.setStatus({ code: SpanStatusCode.OK });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    span.recordException(error as Error);
    span.setAttributes({
      "external.duration_ms": duration,
      "external.success": false,
      "external.error":
        error instanceof Error ? error.message : "Unknown error",
    });
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message:
        error instanceof Error ? error.message : "External service error",
    });

    throw error;
  } finally {
    span.end();
  }
}
