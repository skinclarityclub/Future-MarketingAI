// Conditional imports to prevent Next.js bundling issues
let NodeSDK: any;
let Resource: any;
let SemanticResourceAttributes: any;
let getNodeAutoInstrumentations: any;
let OTLPTraceExporter: any;
let OTLPMetricExporter: any;
let PeriodicExportingMetricReader: any;
let trace: any;
let context: any;
let SpanStatusCode: any;
let SpanKind: any;
let metrics: any;

// Only import OpenTelemetry modules in Node.js environment
if (typeof window === "undefined" && process.env.NODE_ENV !== "test") {
  try {
    const otelSdk = require("@opentelemetry/sdk-node");
    const otelResources = require("@opentelemetry/resources");
    const otelSemanticConventions = require("@opentelemetry/semantic-conventions");
    const otelAutoInstrumentations = require("@opentelemetry/auto-instrumentations-node");
    const otelOtlpTraceExporter = require("@opentelemetry/exporter-trace-otlp-grpc");
    const otelOtlpMetricExporter = require("@opentelemetry/exporter-metrics-otlp-grpc");
    const otelSdkMetrics = require("@opentelemetry/sdk-metrics");
    const otelApi = require("@opentelemetry/api");

    NodeSDK = otelSdk.NodeSDK;
    Resource = otelResources.Resource;
    SemanticResourceAttributes =
      otelSemanticConventions.SemanticResourceAttributes;
    getNodeAutoInstrumentations =
      otelAutoInstrumentations.getNodeAutoInstrumentations;
    OTLPTraceExporter = otelOtlpTraceExporter.OTLPTraceExporter;
    OTLPMetricExporter = otelOtlpMetricExporter.OTLPMetricExporter;
    PeriodicExportingMetricReader =
      otelSdkMetrics.PeriodicExportingMetricReader;
    trace = otelApi.trace;
    context = otelApi.context;
    SpanStatusCode = otelApi.SpanStatusCode;
    SpanKind = otelApi.SpanKind;
    metrics = otelApi.metrics;
  } catch (error) {
    console.warn("[Tracing] OpenTelemetry modules not available:", error);
  }
}

// Environment configuration
const serviceName = process.env.OTEL_SERVICE_NAME || "skc-bi-dashboard";
const serviceVersion = process.env.OTEL_SERVICE_VERSION || "1.0.0";
const environment = process.env.NODE_ENV || "development";
const otlpEndpoint =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4317";

let sdk: any = null;
let isTracingInitialized = false;

// Initialize the SDK
export function initializeTracing() {
  // Skip if already initialized or if modules are not available
  if (isTracingInitialized || !NodeSDK || typeof window !== "undefined") {
    return false;
  }

  try {
    // Create resource with service information
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: serviceVersion,
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: environment,
      [SemanticResourceAttributes.SERVICE_NAMESPACE]: "skc",
    });

    // Configure trace exporter
    const traceExporter = new OTLPTraceExporter({
      url: `${otlpEndpoint}/v1/traces`,
    });

    // Configure metric exporter
    const metricExporter = new OTLPMetricExporter({
      url: `${otlpEndpoint}/v1/metrics`,
    });

    // Configure metric reader
    const metricReader = new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 30000, // Export metrics every 30 seconds
    });

    // Create SDK
    sdk = new NodeSDK({
      resource,
      traceExporter,
      metricReader,
      instrumentations: [
        getNodeAutoInstrumentations({
          // Disable file system instrumentation for better performance
          "@opentelemetry/instrumentation-fs": {
            enabled: false,
          },
          // Disable unnecessary instrumentations
          "@opentelemetry/instrumentation-dns": {
            enabled: false,
          },
          // Configure HTTP instrumentation
          "@opentelemetry/instrumentation-http": {
            enabled: true,
            requestHook: (span: any, request: any) => {
              span.setAttribute(
                "http.request.header.user-agent",
                request.headers["user-agent"] || ""
              );
            },
            responseHook: (span: any, response: any) => {
              span.setAttribute(
                "http.response.status_code",
                response.statusCode || 0
              );
            },
          },
          // Configure Express instrumentation if used
          "@opentelemetry/instrumentation-express": {
            enabled: true,
          },
        }),
      ],
    });

    sdk.start();
    isTracingInitialized = true;
    console.log("✅ OpenTelemetry tracing initialized successfully");

    // Graceful shutdown
    process.on("SIGTERM", () => {
      sdk
        .shutdown()
        .then(() => console.log("✅ OpenTelemetry terminated"))
        .catch((error: any) =>
          console.error("❌ Error terminating OpenTelemetry", error)
        )
        .finally(() => process.exit(0));
    });

    return true;
  } catch (error) {
    console.error("❌ Error initializing OpenTelemetry:", error);
    return false;
  }
}

// Fallback implementations for when OpenTelemetry is not available
const fallbackTrace = {
  getTracer: () => ({
    startSpan: () => ({
      setAttribute: () => {},
      setAttributes: () => {},
      setStatus: () => {},
      recordException: () => {},
      end: () => {},
    }),
  }),
  getActiveSpan: () => null,
  setSpan: (ctx: any) => ctx,
};

const fallbackContext = {
  with: <T>(ctx: any, fn: () => T) => fn(),
  active: () => ({}),
};

const fallbackSpanStatusCode = {
  OK: 1,
  ERROR: 2,
};

const fallbackSpanKind = {
  SERVER: 1,
  CLIENT: 2,
};

const fallbackMetrics = {
  getMeter: () => ({
    createHistogram: () => ({
      record: () => {},
    }),
    createCounter: () => ({
      add: () => {},
    }),
  }),
};

// Export safe versions that work even without OpenTelemetry
export const safeTrace = trace || fallbackTrace;
export const safeContext = context || fallbackContext;
export const safeSpanStatusCode = SpanStatusCode || fallbackSpanStatusCode;
export const safeSpanKind = SpanKind || fallbackSpanKind;
export const safeMetrics = metrics || fallbackMetrics;

// Re-export for backward compatibility
export {
  safeTrace as trace,
  safeContext as context,
  safeSpanStatusCode as SpanStatusCode,
  safeSpanKind as SpanKind,
};

// Custom span creation helper
export function createSpan(
  name: string,
  attributes: Record<string, string | number> = {}
) {
  if (!isTracingInitialized || !trace) {
    return {
      setAttribute: () => {},
      setAttributes: () => {},
      setStatus: () => {},
      recordException: () => {},
      end: () => {},
    };
  }

  try {
    const tracer = trace.getTracer(serviceName, serviceVersion);
    return tracer.startSpan(name, {
      attributes: {
        "service.name": serviceName,
        "service.version": serviceVersion,
        ...attributes,
      },
    });
  } catch (error) {
    console.warn("[Tracing] Error creating span:", error);
    return {
      setAttribute: () => {},
      setAttributes: () => {},
      setStatus: () => {},
      recordException: () => {},
      end: () => {},
    };
  }
}

// Custom metrics utilities
export const meter = safeMetrics.getMeter(serviceName, serviceVersion);

export const apiRequestDuration = meter.createHistogram(
  "api_request_duration_ms",
  {
    description: "API request duration in milliseconds",
    unit: "ms",
  }
);

export const apiRequestCount = meter.createCounter("api_request_count", {
  description: "Total number of API requests",
});

export const userActionCount = meter.createCounter("user_action_count", {
  description: "Total number of user actions",
});

export const dbOperationDuration = meter.createHistogram(
  "db_operation_duration_ms",
  {
    description: "Database operation duration in milliseconds",
    unit: "ms",
  }
);

export const externalCallDuration = meter.createHistogram(
  "external_call_duration_ms",
  {
    description: "External API call duration in milliseconds",
    unit: "ms",
  }
);

// Utility functions for tracking metrics
export function trackApiCall(
  path: string,
  method: string,
  statusCode: number,
  duration: number
) {
  try {
    apiRequestDuration.record(duration, {
      "http.route": path,
      "http.method": method,
      "http.status_code": statusCode.toString(),
    });

    apiRequestCount.add(1, {
      "http.route": path,
      "http.method": method,
      "http.status_code": statusCode.toString(),
    });
  } catch (error) {
    // Silently fail if metrics are not available
  }
}

export function trackUserAction(
  action: string,
  userId: string,
  metadata: Record<string, any> = {}
) {
  try {
    userActionCount.add(1, {
      "user.action": action,
      "user.id": userId,
      ...Object.fromEntries(
        Object.entries(metadata).map(([k, v]) => [k, String(v)])
      ),
    });
  } catch (error) {
    // Silently fail if metrics are not available
  }
}

export function trackDbOperation(
  operation: string,
  table: string,
  duration: number,
  success: boolean
) {
  try {
    dbOperationDuration.record(duration, {
      "db.operation": operation,
      "db.table": table,
      "db.success": success.toString(),
    });
  } catch (error) {
    // Silently fail if metrics are not available
  }
}

export function trackExternalCall(
  service: string,
  operation: string,
  duration: number,
  success: boolean
) {
  try {
    externalCallDuration.record(duration, {
      "external.service": service,
      "external.operation": operation,
      "external.success": success.toString(),
    });
  } catch (error) {
    // Silently fail if metrics are not available
  }
}
