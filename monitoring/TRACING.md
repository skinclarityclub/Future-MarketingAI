# Distributed Tracing with OpenTelemetry & Jaeger

This document explains the distributed tracing implementation for the SKC BI Dashboard using OpenTelemetry and Jaeger.

## Overview

The tracing system provides end-to-end observability for:

- API requests and responses
- Database operations
- External service calls
- User actions and interactions
- Performance metrics

## Architecture

```
Next.js App → OpenTelemetry SDK → OTLP Collector → Jaeger
                                ↓
                            Prometheus (metrics)
```

## Components

### 1. OpenTelemetry SDK (`src/lib/tracing.ts`)

- Configures automatic instrumentation
- Creates custom spans and metrics
- Exports traces to OTLP collector

### 2. OTLP Collector (`monitoring/otel/otel-collector-config.yaml`)

- Receives traces and metrics from application
- Processes and batches data
- Exports to Jaeger and Prometheus

### 3. Jaeger (`jaeger` service in docker-compose)

- Stores and visualizes distributed traces
- Provides search and analysis capabilities
- Available at http://localhost:16686

## Usage

### Starting the Monitoring Stack

```bash
# Start all monitoring services
docker-compose -f docker-compose.monitoring.yml up -d

# Check service status
docker-compose -f docker-compose.monitoring.yml ps
```

### Environment Variables

Add to your `.env.local`:

```env
# OpenTelemetry Configuration
OTEL_SERVICE_NAME=skc-bi-dashboard
OTEL_SERVICE_VERSION=1.0.0
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

### Automatic Tracing

The application automatically traces:

- HTTP requests to API routes
- Database queries (when using `traceDbOperation`)
- External API calls (when using `traceExternalCall`)

### Manual Tracing

#### API Routes

```typescript
import { createTracedAPIHandler } from "@/lib/middleware/tracing";

export const GET = createTracedAPIHandler(
  async req => {
    // Your handler logic
    return NextResponse.json({ data: "response" });
  },
  {
    spanName: "custom.operation",
    attributes: { "custom.attribute": "value" },
  }
);
```

#### Database Operations

```typescript
import { traceDbOperation } from "@/lib/middleware/tracing";

const result = await traceDbOperation("select", "users", async () => {
  return await supabase.from("users").select("*");
});
```

#### External API Calls

```typescript
import { traceExternalCall } from "@/lib/middleware/tracing";

const data = await traceExternalCall(
  "external-service",
  "get_data",
  "https://api.example.com/data",
  async () => {
    return await fetch("https://api.example.com/data");
  }
);
```

#### Custom Metrics

```typescript
import { trackApiCall, trackUserAction } from "@/lib/tracing";

// Track API performance
trackApiCall("/api/dashboard", "GET", 200, 150);

// Track user actions
trackUserAction("button_click", userId, { button: "export" });
```

## Accessing Traces

### Jaeger UI

- URL: http://localhost:16686
- Service: `skc-bi-dashboard`
- Search by operation, tags, or duration

### Key Traces to Monitor

- API response times
- Database query performance
- External service dependencies
- Error traces and exceptions

## Custom Attributes

The system adds these attributes to spans:

### HTTP Requests

- `http.method`: Request method
- `http.url`: Full URL
- `http.status_code`: Response status
- `http.user_agent`: Client user agent

### Database Operations

- `db.operation`: Query type (select, insert, etc.)
- `db.table`: Target table
- `db.duration_ms`: Query duration

### External Calls

- `external.service`: Service name
- `external.operation`: Operation type
- `external.url`: Target URL

## Performance Tuning

### Sampling

- Default: 50% sampling rate
- Configure in `monitoring/otel/otel-collector-config.yaml`

### Memory Limits

- OTLP Collector: 256MB limit
- Adjust based on traffic volume

### Batch Processing

- Traces batched every 1 second
- Max batch size: 2048 spans

## Troubleshooting

### No Traces Appearing

1. Check OTLP Collector logs: `docker logs otel-collector`
2. Verify Jaeger is running: `curl http://localhost:16686/api/services`
3. Check application logs for tracing errors

### High Memory Usage

1. Reduce sampling rate in collector config
2. Increase batch timeout
3. Monitor Prometheus metrics

### Missing Spans

1. Ensure `instrumentationHook: true` in `next.config.js`
2. Verify tracing middleware is applied
3. Check for unhandled exceptions

## Integration with Existing Monitoring

### Prometheus Metrics

- OTLP Collector exports metrics to Prometheus
- Available at http://localhost:8889/metrics

### Grafana Dashboards

- Import OpenTelemetry dashboard templates
- Correlate traces with metrics

### Log Correlation

- Trace IDs automatically added to structured logs
- Search logs by trace ID in Kibana

## Best Practices

1. **Use Semantic Naming**: Name spans by operation, not implementation
2. **Add Context**: Include relevant attributes for debugging
3. **Avoid Over-Instrumentation**: Don't trace every function call
4. **Handle Errors**: Always record exceptions in spans
5. **Monitor Performance**: Track the overhead of tracing itself

## Testing Tracing

Test the tracing setup:

```bash
# Test API endpoint
curl http://localhost:3000/api/dashboard/tracing-test

# Check Jaeger for traces
open http://localhost:16686
```

## Production Considerations

1. **Sampling**: Reduce to 1-10% in production
2. **Security**: Use authentication for Jaeger UI
3. **Storage**: Configure trace retention policies
4. **Network**: Consider using OTLP over HTTPS
5. **Monitoring**: Alert on collector and Jaeger health
