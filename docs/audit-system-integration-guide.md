# Audit System Integration Guide

**Task 37.15: Integrate Audit Logging System with Existing Systems**

This guide provides comprehensive instructions for integrating the centralized audit logging system with all existing enterprise systems in the SKC BI Dashboard.

## Overview

The audit integration system provides seamless logging capabilities across all enterprise systems including:

- Authentication & Authorization
- Financial Systems & Budgeting
- Dashboard & Analytics
- Customer Intelligence & ML
- Security & Compliance
- Workflows & Automation
- Marketing & Content Management

## Core Components

### 1. Audit Integration Service (`src/lib/audit/audit-integration.ts`)

Central service that manages audit logging for all systems with features:

- Automatic request/response logging
- Sensitive data encryption
- Real-time alerting
- Compliance tagging
- Risk scoring
- Performance monitoring

### 2. Audit Middleware (`src/lib/middleware/audit-middleware.ts`)

Next.js middleware wrapper that provides:

- Automatic API request auditing
- User context extraction
- Response time tracking
- Error monitoring
- IP and user agent logging

### 3. System Integration Wrappers (`src/lib/audit/system-integrations.ts`)

Pre-built integrations for specific systems:

- AuthenticationAuditIntegration
- FinancialAuditIntegration
- DashboardAuditIntegration
- CustomerIntelligenceAuditIntegration
- SecurityAuditIntegration
- WorkflowAuditIntegration

## Quick Start Integration

### 1. API Route Integration

```typescript
// src/app/api/financial/transactions/route.ts
import { AuditMiddleware } from "@/lib/middleware/audit-middleware";
import { FinancialAuditIntegration } from "@/lib/audit/system-integrations";

export async function POST(request: Request) {
  // Middleware automatically logs request/response
  const auditedMiddleware = AuditMiddleware.withAudit("financial");

  try {
    // Your existing logic here
    const transaction = await createTransaction(data);

    // Log specific business event
    await FinancialAuditIntegration.logTransactionEvent(
      "transaction_created",
      transaction.id,
      transaction.amount,
      transaction.currency,
      userId
    );

    return Response.json(transaction);
  } catch (error) {
    // Errors are automatically logged by middleware
    throw error;
  }
}
```

### 2. Authentication Integration

```typescript
// src/lib/auth/auth-service.ts
import { AuthenticationAuditIntegration } from "@/lib/audit/system-integrations";

export async function signIn(
  email: string,
  password: string,
  request: Request
) {
  const ipAddress = getClientIP(request);
  const userAgent = request.headers.get("user-agent");

  try {
    const user = await authenticateUser(email, password);

    // Log successful login
    await AuthenticationAuditIntegration.logLoginAttempt(
      user.id,
      true,
      "email_password",
      ipAddress,
      userAgent
    );

    return user;
  } catch (error) {
    // Log failed login
    await AuthenticationAuditIntegration.logLoginAttempt(
      email, // Use email as identifier for failed attempts
      false,
      "email_password",
      ipAddress,
      userAgent,
      error.message
    );

    throw error;
  }
}
```

### 3. Dashboard Integration

```typescript
// src/components/dashboard/financial-dashboard.tsx
import { DashboardAuditIntegration } from "@/lib/audit/system-integrations";

export function FinancialDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      const filters = { dateRange: "30d", department: "finance" };

      // Log dashboard access
      await DashboardAuditIntegration.logDashboardAccess(
        "financial_overview",
        userId,
        filters
      );

      const dashboardData = await fetchFinancialData(filters);
      setData(dashboardData);
    }

    loadDashboard();
  }, []);

  const handleExport = async () => {
    // Log export action
    await DashboardAuditIntegration.logDashboardAccess(
      "financial_overview",
      userId,
      currentFilters,
      true // exportAction = true
    );

    await exportDashboard();
  };

  return (
    <div>
      {/* Dashboard content */}
      <button onClick={handleExport}>Export</button>
    </div>
  );
}
```

### 4. Function Wrapper Integration

```typescript
// src/lib/analytics/data-processor.ts
import { IntegrationHelpers } from "@/lib/audit/system-integrations";

// Wrap existing functions with audit logging
const originalProcessData = async (data: any[]) => {
  // Your existing logic
  return processedData;
};

// Create audited version
export const processData = IntegrationHelpers.auditWrapper(
  "analytics",
  "data_processing",
  originalProcessData
);
```

## System-Specific Integration Patterns

### Financial Systems

**Required Audit Events:**

- Transaction creation/modification/deletion
- Budget access and modifications
- Financial report generation
- Payment processing events
- Expense approvals

**Compliance Requirements:**

- SOX compliance tagging
- High-value transaction alerts (>$10k)
- Risk scoring based on amounts
- Mandatory review flags for large transactions

### Customer Intelligence

**Required Audit Events:**

- PII data access
- Customer profile views
- Data exports
- ML model executions
- Behavioral analytics queries

**Privacy Requirements:**

- GDPR compliance tagging
- Data minimization logging
- Consent verification tracking
- Right to erasure requests

### Security Systems

**Required Audit Events:**

- Configuration changes
- Access control modifications
- Security incidents
- Threat detections
- Vulnerability scans

**Security Requirements:**

- Real-time alerting for critical events
- Encrypted audit data
- Tamper-proof logging
- Incident correlation

## Configuration Management

### System Configuration

Each system can be configured independently:

```typescript
// Configure audit behavior per system
const auditIntegration = AuditIntegrationService.getInstance();

auditIntegration.updateSystemConfig("financial", {
  logLevel: "detailed",
  encryptSensitiveData: true,
  realTimeAlerts: true,
  complianceMode: true,
});

auditIntegration.updateSystemConfig("dashboard", {
  logLevel: "standard",
  encryptSensitiveData: false,
  realTimeAlerts: false,
  complianceMode: true,
});
```

### Alert Configuration

Configure real-time alerts for critical events:

```typescript
// Financial system alerts
- High-value transactions (>$50k)
- Multiple failed authentication attempts
- Unusual data export activities
- Security configuration changes
- Critical system errors
```

## Compliance Mapping

### GDPR Compliance

- **Data Access**: All customer data access logged
- **Data Export**: Tracked with high risk scores
- **Consent Changes**: Authentication events logged
- **Right to Erasure**: Deletion events tracked

### SOX Compliance

- **Financial Transactions**: All financial events logged
- **Access Controls**: User role changes tracked
- **System Changes**: Configuration modifications logged
- **Reporting**: Automated compliance reports generated

### Security Compliance

- **Access Monitoring**: All system access logged
- **Threat Detection**: Security incidents tracked
- **Configuration Management**: Security changes logged
- **Incident Response**: Alert system integration

## Monitoring and Alerting

### Real-Time Monitoring

The system provides real-time monitoring through:

```typescript
// Get integration statistics
const stats = await IntegrationHelpers.getIntegrationStats();
console.log({
  totalEvents: stats.totalEvents,
  systemBreakdown: stats.eventsBySystem,
  criticalAlerts: stats.criticalEvents,
  systemHealth: stats.failureRate,
});
```

### Alert Thresholds

**Automatic Alerts Triggered For:**

- Failed login attempts (>5 in 1 hour)
- High-value transactions (>$50,000)
- Data exports containing PII
- Security configuration changes
- System errors with "critical" severity
- Unusual access patterns

### Dashboard Integration

Monitor audit system health through dedicated dashboards:

- Event volume trends
- System integration status
- Alert frequency
- Compliance coverage
- Performance metrics

## Troubleshooting

### Common Integration Issues

1. **Missing User Context**

   - Ensure user ID is passed in request headers or extracted from session
   - Use middleware to automatically extract user information

2. **Performance Impact**

   - Audit logging is asynchronous and shouldn't impact response times
   - Monitor audit system performance separately

3. **Data Encryption Failures**

   - Verify encryption keys are properly configured
   - Check that sensitive data detection is working correctly

4. **Alert Noise**
   - Tune alert thresholds based on normal system behavior
   - Implement alert correlation to reduce false positives

### Testing Integration

Test audit integration with:

```typescript
// Test audit logging
import { AuditLogger } from "@/lib/security/audit-logger";

const auditLogger = AuditLogger.getInstance();
await auditLogger.log({
  eventCategory: "system_configuration",
  eventType: "integration_test",
  eventName: "Audit Integration Test",
  message: "Testing audit system integration",
  status: "success",
  severity: "info",
  details: { test: true },
  eventTimestamp: new Date(),
});
```

## Best Practices

1. **Consistent Event Naming**: Use standardized event names across systems
2. **Appropriate Risk Scoring**: Score events based on business impact
3. **Compliance Tagging**: Always include relevant compliance tags
4. **Sensitive Data Handling**: Encrypt or redact sensitive information
5. **Performance Monitoring**: Track audit system performance impact
6. **Regular Reviews**: Periodically review audit logs for completeness

## Migration Guide

For existing systems without audit logging:

1. **Identify Critical Functions**: Start with high-risk operations
2. **Add Middleware**: Implement audit middleware for API routes
3. **Integrate Business Logic**: Add specific business event logging
4. **Configure Alerts**: Set up monitoring for new audit events
5. **Test Thoroughly**: Verify audit logging doesn't impact functionality
6. **Monitor Performance**: Ensure audit system scales with usage

## Support and Maintenance

- **Documentation**: Keep integration docs updated
- **Monitoring**: Regular health checks of audit system
- **Performance**: Monitor impact on system performance
- **Compliance**: Regular compliance audits and reports
- **Security**: Regular security reviews of audit system

This integration ensures comprehensive audit coverage across all enterprise systems while maintaining performance and compliance requirements.
