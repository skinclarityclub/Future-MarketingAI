# Task 33.3: Real-Time Monitoring System

## Overview

The Real-Time Monitoring System provides comprehensive workflow execution tracking, logging, error handling, and performance monitoring capabilities for the n8n Workflow Integration Engine. This system enables real-time visibility into workflow operations with detailed analytics and alerting functionality.

## Architecture

### Core Components

1. **Workflow Monitor Service** (`src/lib/monitoring/workflow-monitor.ts`)

   - Real-time execution tracking
   - Performance metrics collection
   - Error detection and alerting
   - Live status monitoring

2. **Database Schema** (`migrations/022_workflow_monitoring.sql`)

   - Execution logs storage
   - Error tracking tables
   - Performance metrics
   - Alert management
   - Statistical aggregation

3. **RESTful API** (`src/app/api/workflows/monitoring/route.ts`)

   - CRUD operations for monitoring data
   - Real-time status endpoints
   - Dashboard summary APIs
   - Batch operations support

4. **Test Suite** (`scripts/test-workflow-monitoring.js`)
   - Comprehensive functionality testing
   - Performance stress testing
   - Real-time simulation

## Features

### 📊 Real-Time Logging

- **Multi-level logging**: Debug, Info, Warning, Error, Fatal
- **Node-level tracking**: Per-step execution details
- **Metadata support**: Custom data attachment
- **Performance timing**: Duration tracking per operation

### 🚨 Error Management

- **Categorized errors**: Network, Validation, Timeout, Permission, Data, System
- **Severity levels**: Low, Medium, High, Critical
- **Resolution tracking**: Status updates and notes
- **Stack trace capture**: Detailed error information

### 📈 Performance Monitoring

- **Resource utilization**: Memory and CPU tracking
- **Network metrics**: Request counts and data transfer
- **Bottleneck identification**: Performance optimization insights
- **Throughput analysis**: Processing rate calculations

### 🔔 Alert System

- **Multiple alert types**: Performance, Error, Timeout, Resource, Dependency
- **Severity classification**: Info, Warning, Critical
- **Acknowledgment workflow**: Team collaboration features
- **Resolution tracking**: Issue lifecycle management

### 📋 Dashboard Analytics

- **System health overview**: Real-time status indicators
- **Execution statistics**: Success rates and performance trends
- **Error summaries**: Issue tracking and resolution metrics
- **Historical analysis**: Time-based performance insights

## Database Schema

### Core Tables

#### workflow_execution_logs

```sql
- id: UUID (Primary Key)
- workflow_id: VARCHAR(255)
- execution_id: VARCHAR(255)
- log_level: ENUM (debug, info, warn, error, fatal)
- message: TEXT
- timestamp: TIMESTAMPTZ
- node_id: VARCHAR(255)
- node_name: VARCHAR(255)
- step_number: INTEGER
- duration: INTEGER (milliseconds)
- metadata: JSONB
```

#### workflow_errors

```sql
- id: UUID (Primary Key)
- workflow_id: VARCHAR(255)
- execution_id: VARCHAR(255)
- error_type: ENUM (validation, network, timeout, permission, data, system, unknown)
- error_code: VARCHAR(100)
- error_message: TEXT
- error_stack: TEXT
- severity: ENUM (low, medium, high, critical)
- resolved: BOOLEAN
- resolution_notes: TEXT
- resolved_at: TIMESTAMPTZ
- resolved_by: VARCHAR(255)
```

#### workflow_performance_metrics

```sql
- id: UUID (Primary Key)
- workflow_id: VARCHAR(255)
- execution_id: VARCHAR(255)
- total_duration: INTEGER
- node_count: INTEGER
- successful_nodes: INTEGER
- failed_nodes: INTEGER
- memory_peak: BIGINT (bytes)
- memory_average: BIGINT (bytes)
- cpu_peak: DECIMAL(5,2) (percentage)
- cpu_average: DECIMAL(5,2) (percentage)
- network_requests: INTEGER
- network_data_transferred: BIGINT (bytes)
- throughput: DECIMAL(10,2) (items/second)
- bottleneck_nodes: TEXT[]
```

#### monitoring_alerts

```sql
- id: UUID (Primary Key)
- workflow_id: VARCHAR(255)
- alert_type: ENUM (performance, error, timeout, resource, dependency)
- severity: ENUM (info, warning, critical)
- title: VARCHAR(255)
- description: TEXT
- acknowledged: BOOLEAN
- acknowledged_by: VARCHAR(255)
- acknowledged_at: TIMESTAMPTZ
- resolved: BOOLEAN
- resolved_at: TIMESTAMPTZ
- resolved_by: VARCHAR(255)
```

### Performance Optimizations

- **Composite indexes** for efficient querying
- **Partial indexes** for common filter conditions
- **GIN indexes** for JSONB metadata searches
- **Automated cleanup** for data retention management
- **Aggregation functions** for dashboard performance

## API Reference

### Base URL

```
/api/workflows/monitoring
```

### GET Endpoints

#### Retrieve Logs

```http
GET /api/workflows/monitoring?type=logs&workflow_id={id}&log_levels=info,warn&limit=50
```

**Query Parameters:**

- `workflow_id`: Filter by workflow ID
- `execution_id`: Filter by execution ID
- `log_levels`: Comma-separated log levels
- `start_time`: ISO timestamp for range start
- `end_time`: ISO timestamp for range end
- `limit`: Maximum results (default: 50)
- `offset`: Pagination offset

#### Retrieve Errors

```http
GET /api/workflows/monitoring?type=errors&workflow_id={id}&severity=high,critical&resolved=false
```

**Query Parameters:**

- `workflow_id`: Filter by workflow ID
- `execution_id`: Filter by execution ID
- `severity`: Comma-separated severity levels
- `resolved`: Boolean filter for resolution status

#### Get Performance Metrics

```http
GET /api/workflows/monitoring?type=performance&workflow_id={id}&start_time={iso_date}
```

#### Get Alerts

```http
GET /api/workflows/monitoring?type=alerts&workflow_id={id}&acknowledged=false
```

#### Live Execution Status

```http
GET /api/workflows/monitoring?type=live-status&workflow_id={id}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "workflow_id": "wf-001",
    "execution_id": "exec-123",
    "current_state": "running",
    "progress_percentage": 65,
    "current_step": "Data Processing",
    "elapsed_time": 45000,
    "estimated_remaining_time": 25000,
    "error_count": 0,
    "warning_count": 2,
    "recent_logs": [...]
  }
}
```

#### Dashboard Summary

```http
GET /api/workflows/monitoring?type=dashboard&workflow_id={id}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total_executions": 150,
    "successful_executions": 142,
    "failed_executions": 8,
    "success_rate": 94.67,
    "total_errors": 12,
    "critical_errors": 2,
    "total_alerts": 5,
    "unresolved_alerts": 1,
    "average_execution_time": 32500,
    "system_health": "healthy",
    "recent_activity": {
      "logs": [...],
      "errors": [...],
      "alerts": [...]
    }
  }
}
```

### POST Endpoints

#### Create Log Entry

```http
POST /api/workflows/monitoring?type=log
Content-Type: application/json

{
  "workflow_id": "wf-001",
  "execution_id": "exec-123",
  "log_level": "info",
  "message": "Processing step completed",
  "node_name": "Data Processor",
  "step_number": 3,
  "duration": 1500,
  "metadata": {
    "records_processed": 1000,
    "memory_used": 64000000
  }
}
```

#### Create Error Entry

```http
POST /api/workflows/monitoring?type=error
Content-Type: application/json

{
  "workflow_id": "wf-001",
  "execution_id": "exec-123",
  "error_type": "network",
  "error_message": "Connection timeout to external API",
  "error_code": "TIMEOUT_001",
  "node_name": "API Connector",
  "severity": "high",
  "error_stack": "Error: Connection timeout...",
  "metadata": {
    "timeout_duration": 30000,
    "retry_count": 3
  }
}
```

#### Create Performance Metrics

```http
POST /api/workflows/monitoring?type=performance
Content-Type: application/json

{
  "workflow_id": "wf-001",
  "execution_id": "exec-123",
  "total_duration": 45000,
  "node_count": 6,
  "successful_nodes": 5,
  "failed_nodes": 1,
  "memory_peak": 134217728,
  "memory_average": 67108864,
  "cpu_peak": 85.5,
  "cpu_average": 45.2,
  "network_requests": 15,
  "network_data_transferred": 2048000,
  "throughput": 2.5,
  "bottleneck_nodes": ["API Node", "Database Node"]
}
```

#### Create Alert

```http
POST /api/workflows/monitoring?type=alert
Content-Type: application/json

{
  "workflow_id": "wf-001",
  "alert_type": "performance",
  "severity": "warning",
  "title": "High Execution Time",
  "description": "Workflow execution time exceeded recommended threshold",
  "metadata": {
    "actual_duration": 45000,
    "threshold": 30000,
    "recommendation": "Consider optimizing API calls"
  }
}
```

#### Batch Operations

```http
POST /api/workflows/monitoring?type=batch
Content-Type: application/json

{
  "logs": [...],
  "errors": [...],
  "performance": [...],
  "alerts": [...]
}
```

### PATCH Endpoints

#### Update Error Resolution

```http
PATCH /api/workflows/monitoring?type=error&id={error_id}
Content-Type: application/json

{
  "resolved": true,
  "resolution_notes": "Fixed by updating API timeout configuration",
  "resolved_by": "admin-user"
}
```

#### Update Alert Acknowledgment

```http
PATCH /api/workflows/monitoring?type=alert&id={alert_id}
Content-Type: application/json

{
  "acknowledged": true,
  "acknowledged_by": "team-lead",
  "resolved": false
}
```

### DELETE Endpoints

#### Data Cleanup

```http
DELETE /api/workflows/monitoring?retention_days=90
```

## Usage Examples

### Basic Logging

```typescript
import { workflowMonitor } from "@/lib/monitoring/workflow-monitor";

// Log workflow start
await workflowMonitor.logExecution("wf-001", "exec-123", {
  level: "info",
  message: "Workflow execution started",
  nodeName: "Start Node",
  metadata: { trigger: "webhook" },
});

// Log processing step
await workflowMonitor.logExecution("wf-001", "exec-123", {
  level: "info",
  message: "Processing 1000 records",
  nodeName: "Data Processor",
  stepNumber: 2,
  duration: 2500,
  metadata: { recordCount: 1000 },
});
```

### Error Tracking

```typescript
// Log an error
await workflowMonitor.logError("wf-001", "exec-123", {
  type: "network",
  message: "API connection failed",
  code: "CONN_001",
  nodeName: "API Node",
  severity: "high",
  stack: error.stack,
  metadata: { endpoint: "/api/data", retryCount: 3 },
});

// Resolve an error
await workflowMonitor.resolveError(errorId, {
  notes: "Fixed by updating API endpoint configuration",
  resolvedBy: "admin-user",
});
```

### Performance Monitoring

```typescript
// Record performance metrics
await workflowMonitor.recordPerformance("wf-001", "exec-123", {
  totalDuration: 45000,
  nodeCount: 6,
  successfulNodes: 5,
  failedNodes: 1,
  memoryPeak: 128 * 1024 * 1024, // 128MB
  memoryAverage: 64 * 1024 * 1024, // 64MB
  cpuPeak: 85.5,
  cpuAverage: 45.2,
  networkRequests: 15,
  networkDataTransferred: 2 * 1024 * 1024, // 2MB
  throughput: 2.5,
  bottleneckNodes: ["API Node"],
});
```

### Alert Management

```typescript
// Create an alert
await workflowMonitor.createAlert("wf-001", {
  type: "performance",
  severity: "warning",
  title: "High Memory Usage",
  description: "Workflow consuming excessive memory resources",
  metadata: {
    memoryUsed: 256 * 1024 * 1024,
    threshold: 128 * 1024 * 1024,
  },
});

// Acknowledge an alert
await workflowMonitor.acknowledgeAlert(alertId, "team-lead");
```

### Real-time Status Monitoring

```typescript
// Get live execution status
const status = await workflowMonitor.getLiveStatus("wf-001");

if (status) {
  console.log(`Workflow: ${status.workflowId}`);
  console.log(`State: ${status.currentState}`);
  console.log(`Progress: ${status.progressPercentage}%`);
  console.log(`Errors: ${status.errorCount}`);
  console.log(`Warnings: ${status.warningCount}`);
}
```

### Dashboard Integration

```typescript
// Get dashboard summary
const summary = await workflowMonitor.getDashboardSummary();

console.log(`System Health: ${summary.systemHealth}`);
console.log(`Success Rate: ${summary.successRate}%`);
console.log(`Active Alerts: ${summary.unresolved_alerts}`);
console.log(`Avg Execution Time: ${summary.average_execution_time}ms`);
```

## Real-time Capabilities

### WebSocket Integration

The monitoring system supports real-time updates through WebSocket connections:

```typescript
// Subscribe to workflow updates
const subscription = workflowMonitor.subscribeToWorkflow("wf-001", update => {
  console.log("Workflow update:", update);
  // Handle real-time state changes
});

// Unsubscribe when done
subscription.unsubscribe();
```

### Event Streaming

Real-time event streaming for live monitoring dashboards:

```typescript
// Stream execution logs
const logStream = workflowMonitor.streamLogs("wf-001");
logStream.on("log", logEntry => {
  console.log("New log:", logEntry);
});

// Stream errors
const errorStream = workflowMonitor.streamErrors("wf-001");
errorStream.on("error", errorEntry => {
  console.log("New error:", errorEntry);
});
```

## Performance Considerations

### Indexing Strategy

- Composite indexes on (workflow_id, timestamp)
- Partial indexes for unresolved errors/alerts
- GIN indexes for JSONB metadata searches
- Time-based partitioning for large datasets

### Data Retention

- Configurable retention policies
- Automated cleanup of old data
- Archival strategies for historical analysis
- Aggregated statistics for long-term storage

### Scalability Features

- Batch operations for high-volume logging
- Connection pooling for database efficiency
- Caching layer for frequently accessed data
- Horizontal scaling support

## Security Features

### Row Level Security (RLS)

- User-based access control
- Workflow-specific permissions
- Service role for automated processes
- Audit trail for all operations

### Data Protection

- Sensitive data masking in logs
- Encryption for metadata storage
- Secure API authentication
- Rate limiting for API endpoints

## Integration Points

### Task 33.1 Integration

- Uses webhook orchestration for event triggering
- Leverages existing workflow state management
- Builds upon established API patterns

### Task 33.2 Integration

- Extends workflow state management
- Provides detailed execution insights
- Enhances state transition tracking

### Future Task Preparation

- Foundation for Task 33.4 (Bidirectional Sync)
- Monitoring data for Task 33.5 (Workflow Control)
- Analytics support for optimization features

## Testing

### Test Coverage

- ✅ Log creation and retrieval
- ✅ Error tracking and resolution
- ✅ Performance metrics collection
- ✅ Alert management and acknowledgment
- ✅ Live execution status monitoring
- ✅ Dashboard summary generation
- ✅ Batch operations
- ✅ Real-time monitoring simulation
- ✅ Performance stress testing
- ✅ Data cleanup and retention

### Running Tests

```bash
# Run monitoring system tests
node scripts/test-workflow-monitoring.js

# Expected output: 16 test scenarios with comprehensive coverage
```

## Monitoring Best Practices

### Logging Guidelines

1. Use appropriate log levels (debug for development, info for production)
2. Include contextual metadata for troubleshooting
3. Log performance-critical operations with timing
4. Avoid logging sensitive information

### Error Handling

1. Categorize errors appropriately for better tracking
2. Include stack traces for debugging
3. Set severity levels based on business impact
4. Provide resolution notes for team knowledge sharing

### Performance Monitoring

1. Track resource utilization trends
2. Identify bottlenecks proactively
3. Monitor throughput and latency metrics
4. Set up alerts for performance degradation

### Alert Management

1. Configure appropriate severity levels
2. Ensure timely acknowledgment processes
3. Document resolution procedures
4. Review and tune alert thresholds regularly

## Troubleshooting

### Common Issues

#### High Memory Usage

- Check for memory leaks in workflow nodes
- Review batch processing sizes
- Monitor garbage collection patterns
- Consider implementing memory limits

#### Performance Degradation

- Analyze bottleneck nodes
- Review database query performance
- Check network latency issues
- Optimize resource allocation

#### Alert Fatigue

- Review alert thresholds
- Implement alert grouping
- Set up escalation procedures
- Regular alert policy reviews

### Debug Mode

Enable debug logging for detailed troubleshooting:

```typescript
// Enable debug mode
workflowMonitor.setLogLevel("debug");

// View detailed execution traces
const debugLogs = await workflowMonitor.getDebugLogs("wf-001");
```

## Future Enhancements

### Planned Features

- Machine learning-based anomaly detection
- Predictive performance analytics
- Advanced visualization dashboards
- Integration with external monitoring tools

### Extensibility

- Plugin architecture for custom monitors
- Webhook notifications for external systems
- Custom metric definitions
- Flexible alerting rules engine

---

## Summary

Task 33.3 delivers a comprehensive real-time monitoring system that provides:

- **Complete visibility** into workflow execution with detailed logging
- **Proactive error management** with categorization and resolution tracking
- **Performance optimization** through detailed metrics and bottleneck identification
- **Real-time alerting** with team collaboration features
- **Dashboard analytics** for system health and performance insights
- **Scalable architecture** with enterprise-grade security and performance
- **Comprehensive API** for integration with external systems
- **Extensive testing** ensuring reliability and performance

The system is fully integrated with the existing workflow infrastructure and provides the foundation for advanced workflow management capabilities in subsequent tasks.
