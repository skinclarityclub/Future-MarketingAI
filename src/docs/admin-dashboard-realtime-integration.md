# Admin Dashboard Real-Time Data Integration Framework

**Document**: Real-Time Data Integration Architecture  
**Task**: 82.3 - Establish Real-Time Data Integration Framework  
**Created**: 2025-06-25

## Overview

The Admin Dashboard Real-Time Data Integration Framework provides a centralized, scalable system for collecting, aggregating, and distributing real-time data across all subsystems in the Master Command Center. This framework orchestrates multiple data sources and ensures consistent, secure, and performant real-time updates.

## Architecture Components

### 1. Core Data Aggregator (`AdminDashboardDataAggregator`)

**Location**: `src/lib/realtime/admin-dashboard-data-aggregator.ts`

The central orchestration engine that:

- Coordinates all real-time data sources
- Manages data buffering and aggregation
- Handles RBAC-based data filtering
- Provides unified API for data consumption
- Monitors system health and performance

**Key Features**:

- **Multi-Source Integration**: WebSocket, Supabase real-time, SSE, polling
- **Intelligent Buffering**: Configurable buffer sizes per data source
- **ML-Powered Forecasting**: Integration with existing ML engines
- **Alert Management**: Threshold-based alerting with acknowledgment
- **RBAC Integration**: Role-based data access control
- **Performance Monitoring**: Self-monitoring and optimization

### 2. Data Sources Integration

#### System Health Monitoring

- **Source**: `HealthMonitoringEngine`
- **Data**: CPU usage, memory, response time, uptime, service status
- **Update Frequency**: Every 30 seconds
- **Real-time Method**: Supabase subscriptions + WebSocket

#### Business Analytics

- **Source**: `TacticalPerformanceEngine`, `TacticalRealtimeEngine`
- **Data**: Revenue, conversions, customer metrics, growth rates
- **Update Frequency**: Every 5 minutes
- **Real-time Method**: Event-driven + ML forecasting

#### Workflow Performance

- **Source**: `WorkflowMonitor`, n8n webhooks
- **Data**: Execution status, success rates, queue sizes, throughput
- **Update Frequency**: Real-time (event-driven)
- **Real-time Method**: Supabase subscriptions + WebSocket

#### Customer Intelligence

- **Source**: User behavior tracking, support systems
- **Data**: Active users, engagement rates, support tickets, health scores
- **Update Frequency**: Real-time (event-driven)
- **Real-time Method**: Supabase subscriptions

#### Security & Compliance

- **Source**: Auth logs, audit trails, compliance monitoring
- **Data**: Failed auth attempts, API requests, compliance scores, incidents
- **Update Frequency**: Real-time (event-driven)
- **Real-time Method**: Supabase subscriptions

### 3. API Layer (`/api/admin-dashboard/realtime`)

**Location**: `src/app/api/admin-dashboard/realtime/route.ts`

Provides RESTful and SSE endpoints for:

#### GET Endpoints

```typescript
// Get dashboard snapshot
GET /api/admin-dashboard/realtime?action=snapshot

// Get system status
GET /api/admin-dashboard/realtime?action=system-status

// Get active alerts
GET /api/admin-dashboard/realtime?action=alerts

// SSE real-time stream
GET /api/admin-dashboard/realtime?action=sse&sources=system_health,workflows
```

#### POST Endpoints

```typescript
// Acknowledge alert
POST /api/admin-dashboard/realtime
{ "action": "acknowledge-alert", "alertId": "alert-123" }

// Force data aggregation
POST /api/admin-dashboard/realtime
{ "action": "force-aggregation" }

// Start/stop aggregator
POST /api/admin-dashboard/realtime
{ "action": "start-aggregator" | "stop-aggregator" }
```

### 4. React Integration (`useAdminDashboardRealtime`)

**Location**: `src/hooks/use-admin-dashboard-realtime.ts`

Comprehensive React hook providing:

#### Main Hook

```typescript
const {
  snapshot, // Latest dashboard snapshot
  alerts, // Active alerts
  dataPoints, // Real-time data stream
  systemStatus, // Aggregator system status
  connectionStatus, // Connection state
  lastUpdate, // Last update timestamp
  error, // Error state
  isLoading, // Loading state

  // Actions
  connect, // Start real-time connection
  disconnect, // Stop real-time connection
  acknowledgeAlert, // Acknowledge alert
  forceRefresh, // Force data refresh
  startAggregator, // Start aggregation system
  stopAggregator, // Stop aggregation system
} = useAdminDashboardRealtime({
  sources: ["system_health", "business_analytics"],
  categories: ["cpu_usage", "revenue"],
  enableSSE: true,
  pollingInterval: 30000,
  autoStart: true,
});
```

#### Specialized Hooks

```typescript
// System health monitoring
const healthData = useSystemHealthRealtime();

// Business metrics
const businessData = useBusinessMetricsRealtime();

// Workflow performance
const workflowData = useWorkflowPerformanceRealtime();

// Security monitoring
const securityData = useSecurityMonitoringRealtime();

// Customer intelligence
const customerData = useCustomerIntelligenceRealtime();
```

## Data Flow Architecture

### 1. Data Ingestion Pipeline

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Data Source   │───▶│   Data Buffer   │───▶│   Aggregator    │
│   (n8n, etc.)   │    │   (Per Source)  │    │   (Snapshot)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Real-time       │    │   API Layer     │
                       │ Subscriptions   │    │   (REST/SSE)    │
                       └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Dashboard       │    │ React Hooks     │
                       │ Components      │    │ (State Mgmt)    │
                       └─────────────────┘    └─────────────────┘
```

### 2. Data Types and Structure

#### AdminDashboardDataPoint

```typescript
interface AdminDashboardDataPoint {
  id: string; // Unique identifier
  timestamp: Date; // Data collection time
  source: DataSource; // Source system
  category: DataCategory; // Data category
  metric: string; // Specific metric name
  value: number; // Metric value
  status: "healthy" | "warning" | "critical";
  metadata?: Record<string, any>; // Additional context
  moduleAccess: string[]; // RBAC module access
}
```

#### AdminDashboardSnapshot

```typescript
interface AdminDashboardSnapshot {
  timestamp: Date;
  systemHealth: {
    overall_status: "healthy" | "warning" | "critical";
    cpu_usage: number;
    memory_usage: number;
    response_time: number;
    uptime_percentage: number;
    active_services: number;
    failed_services: number;
  };
  businessMetrics: {
    revenue_today: number;
    revenue_trend: number;
    active_customers: number;
    conversion_rate: number;
    churn_rate: number;
    mrr: number;
  };
  workflowPerformance: {
    active_executions: number;
    success_rate: number;
    average_execution_time: number;
    queue_size: number;
    failed_workflows: number;
    throughput_per_hour: number;
  };
  customerIntelligence: {
    active_users_now: number;
    user_growth_rate: number;
    support_tickets_open: number;
    average_health_score: number;
    user_engagement_rate: number;
    bounce_rate: number;
  };
  securityCompliance: {
    failed_auth_attempts: number;
    api_requests_per_minute: number;
    compliance_score: number;
    active_sessions: number;
    security_incidents: number;
    audit_events_today: number;
  };
  alerts: AdminDashboardAlert[];
  performance: {
    data_sources_active: number;
    aggregation_latency: number;
    total_data_points: number;
    memory_usage_mb: number;
  };
}
```

## Configuration Options

### DataAggregationConfig

```typescript
interface DataAggregationConfig {
  updateIntervalMs: number; // Aggregation frequency (default: 5000)
  bufferSizePerSource: number; // Buffer size per source (default: 1000)
  enableRealTimeStreaming: boolean; // Enable WebSocket/SSE (default: true)
  enableDataBuffering: boolean; // Enable data buffering (default: true)
  enableMLForecasting: boolean; // Enable ML predictions (default: true)
  retentionPeriodMs: number; // Data retention period (default: 24h)
  alertThresholds: Record<string, { warning: number; critical: number }>;
}
```

### Default Alert Thresholds

```typescript
{
  cpu_usage: { warning: 70, critical: 85 },
  memory_usage: { warning: 75, critical: 90 },
  response_time: { warning: 1000, critical: 3000 },
  error_rate: { warning: 5, critical: 10 },
  workflow_success_rate: { warning: 90, critical: 80 },
  active_users_now: { warning: 100, critical: 50 },
  failed_auth_attempts: { warning: 10, critical: 25 },
}
```

## Security & RBAC Integration

### Role-Based Data Access

The framework integrates with `AdminDashboardRBACService` to ensure:

- **Module Access Control**: Data is filtered based on user's module permissions
- **Real-time Subscriptions**: Only authorized users can subscribe to specific data sources
- **Alert Management**: Alert acknowledgment requires appropriate permissions
- **System Control**: Aggregator start/stop operations require admin roles

### Supported Admin Roles

- **master_admin**: Full access to all data and system controls
- **technical_admin**: System health, workflow, and security data access
- **business_admin**: Business metrics and customer intelligence access
- **compliance_admin**: Security and compliance data access
- **read_only_viewer**: Executive summary and basic metrics only
- **operations_admin**: Workflow and operational data access

## Performance Characteristics

### Latency Requirements

- **Real-time Updates**: < 500ms from event to dashboard
- **Snapshot Generation**: < 3s for complete dashboard refresh
- **API Response**: < 1s for REST endpoints
- **Alert Processing**: < 100ms for threshold violations

### Scalability Features

- **Horizontal Scaling**: Multiple aggregator instances (future)
- **Data Sharding**: Source-based data distribution
- **Connection Pooling**: Efficient resource utilization
- **Caching Strategy**: Multi-level caching implementation

### Memory Management

- **Buffer Limits**: Configurable per-source buffer sizes
- **Data Retention**: Automatic cleanup of old data points
- **Memory Monitoring**: Self-monitoring and alerts
- **Garbage Collection**: Optimized for real-time operations

## Integration Patterns

### 1. Existing Systems Integration

#### WebSocket Manager Integration

```typescript
// Existing WebSocket infrastructure reuse
this.webSocketManager.subscribeToWorkflows(workflows => {
  const dataPoints = workflows.map(workflow => ({
    // Transform to AdminDashboardDataPoint
  }));
  this.addDataPoints("workflow_performance", dataPoints);
});
```

#### Supabase Real-time Integration

```typescript
// Leverage existing Supabase subscriptions
this.supabase
  .channel("admin-dashboard-health")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "system_health_metrics",
    },
    payload => {
      this.handleSystemHealthUpdate(payload.new);
    }
  )
  .subscribe();
```

### 2. ML Engine Integration

```typescript
// Integration with TacticalRealtimeEngine for forecasting
await this.tacticalEngine.start();
await this.performanceEngine.startRealTimeProcessing(data => {
  this.handleTacticalData(data);
});
```

### 3. Monitoring Engine Integration

```typescript
// Reuse existing monitoring infrastructure
await this.healthMonitor.startMonitoring(30000);
await this.workflowMonitor.initialize();
```

## Usage Examples

### 1. Basic Dashboard Component

```typescript
import { useAdminDashboardRealtime } from "@/hooks/use-admin-dashboard-realtime";

export function AdminDashboard() {
  const {
    snapshot,
    alerts,
    connectionStatus,
    error,
    acknowledgeAlert,
    forceRefresh,
  } = useAdminDashboardRealtime();

  if (error) {
    return <ErrorDisplay error={error} onRetry={forceRefresh} />;
  }

  return (
    <div className="admin-dashboard">
      <ConnectionStatus status={connectionStatus} />
      <AlertsPanel alerts={alerts} onAcknowledge={acknowledgeAlert} />
      {snapshot && (
        <>
          <SystemHealthWidget data={snapshot.systemHealth} />
          <BusinessMetricsWidget data={snapshot.businessMetrics} />
          <WorkflowPerformanceWidget data={snapshot.workflowPerformance} />
        </>
      )}
    </div>
  );
}
```

### 2. Specialized Widget Component

```typescript
import { useSystemHealthRealtime } from "@/hooks/use-admin-dashboard-realtime";

export function SystemHealthWidget() {
  const { snapshot, connectionStatus } = useSystemHealthRealtime();

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
        <ConnectionIndicator status={connectionStatus} />
      </CardHeader>
      <CardContent>
        {snapshot?.systemHealth && (
          <HealthMetrics data={snapshot.systemHealth} />
        )}
      </CardContent>
    </Card>
  );
}
```

### 3. Administrative Control Panel

```typescript
export function AggregatorControlPanel() {
  const {
    systemStatus,
    startAggregator,
    stopAggregator,
    forceRefresh,
  } = useAdminDashboardRealtime({ autoStart: false });

  return (
    <div className="control-panel">
      <SystemStatus status={systemStatus} />
      <div className="controls">
        <Button
          onClick={startAggregator}
          disabled={systemStatus?.isRunning}
        >
          Start Aggregator
        </Button>
        <Button
          onClick={stopAggregator}
          disabled={!systemStatus?.isRunning}
        >
          Stop Aggregator
        </Button>
        <Button onClick={forceRefresh}>
          Force Refresh
        </Button>
      </div>
    </div>
  );
}
```

## Monitoring & Debugging

### System Status Monitoring

```typescript
const status = adminDashboardDataAggregator.getSystemStatus();
console.log({
  isRunning: status.isRunning,
  dataSourcesActive: status.dataSourcesActive,
  subscriptionsActive: status.subscriptionsActive,
  totalDataPoints: status.totalDataPoints,
  memoryUsageMB: status.memoryUsageMB,
  alertsActive: status.alertsActive,
});
```

### Performance Metrics

- **Aggregation Latency**: Time from data ingestion to snapshot update
- **Memory Usage**: Current memory consumption by data buffers
- **Connection Count**: Active real-time subscriptions
- **Data Throughput**: Data points processed per second
- **Error Rates**: Failed data ingestion attempts

### Debug Logging

```typescript
// Enable debug logging
const aggregator = createAdminDashboardDataAggregator({
  enableRealTimeStreaming: true,
  // Additional debug configuration
});
```

## Future Enhancements

### Planned Features

1. **Multi-Tenant Support**: Support for multiple organization contexts
2. **Data Export**: Historical data export capabilities
3. **Custom Alerts**: User-defined alert rules and thresholds
4. **Advanced Forecasting**: Enhanced ML-powered predictions
5. **Distributed Architecture**: Multi-instance deployment support
6. **Performance Analytics**: Detailed performance reporting
7. **Data Validation**: Enhanced data quality monitoring
8. **Audit Trails**: Comprehensive data access logging

### Scalability Roadmap

1. **Phase 1**: Single-instance optimization (current)
2. **Phase 2**: Database optimization and indexing
3. **Phase 3**: Caching layer implementation
4. **Phase 4**: Distributed deployment architecture
5. **Phase 5**: Edge computing integration

## Troubleshooting Guide

### Common Issues

#### 1. SSE Connection Failures

**Symptoms**: `connectionStatus` shows "error", no real-time updates
**Solutions**:

- Check authentication status
- Verify user permissions
- Check network connectivity
- Review server logs for SSE endpoint errors

#### 2. High Memory Usage

**Symptoms**: `memoryUsageMB` continuously increasing
**Solutions**:

- Reduce `bufferSizePerSource` configuration
- Decrease `retentionPeriodMs` setting
- Check for memory leaks in data processing

#### 3. Slow Snapshot Generation

**Symptoms**: `aggregationLatency` > 3000ms
**Solutions**:

- Check database performance
- Optimize data queries
- Review data source connection health
- Consider increasing `updateIntervalMs`

#### 4. Missing Data Sources

**Symptoms**: `dataSourcesActive` < expected count
**Solutions**:

- Verify source system connectivity
- Check authentication credentials
- Review source system health
- Restart aggregator if necessary

### Debug Commands

```typescript
// Force immediate aggregation for testing
const snapshot = await adminDashboardDataAggregator.forceAggregation();

// Get detailed system information
const status = adminDashboardDataAggregator.getSystemStatus();

// Check active alerts
const alerts = adminDashboardDataAggregator.getActiveAlerts();
```

---

**Document Version**: 1.0  
**Last Updated**: 2025-06-25  
**Next Review**: 2025-07-25
