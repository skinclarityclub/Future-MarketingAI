/**
 * System Integration Wrappers
 * Task 37.15: Integrate Audit Logging System with Existing Systems
 *
 * Provides audit integration for all existing enterprise systems
 */

import { AuditLogger } from "@/lib/security/audit-logger";
import { RBACService } from "@/lib/rbac/rbac-service";

/**
 * Authentication System Integration
 */
export class AuthenticationAuditIntegration {
  private static auditLogger = AuditLogger.getInstance();

  static async logLoginAttempt(
    userId: string,
    success: boolean,
    method: string,
    ipAddress?: string,
    userAgent?: string,
    failureReason?: string
  ): Promise<void> {
    await this.auditLogger.log({
      eventCategory: "authentication",
      eventType: success ? "login_success" : "login_failure",
      eventName: "User Login Attempt",
      message: `User ${success ? "successfully logged in" : "failed to login"} using ${method}`,
      status: success ? "success" : "failure",
      severity: success ? "info" : "warning",
      userId,
      ipAddress,
      userAgent,
      resourceType: "user_session",
      resourceName: userId,
      details: {
        authenticationMethod: method,
        failureReason: success ? undefined : failureReason,
        system: "authentication",
      },
      complianceTags: ["authentication", "security", "access_control"],
      eventTimestamp: new Date(),
    });
  }

  static async logLogout(userId: string, sessionId?: string): Promise<void> {
    await this.auditLogger.log({
      eventCategory: "authentication",
      eventType: "logout",
      eventName: "User Logout",
      message: "User logged out",
      status: "success",
      severity: "info",
      userId,
      sessionId,
      resourceType: "user_session",
      resourceName: userId,
      details: { system: "authentication" },
      complianceTags: ["authentication", "session_management"],
      eventTimestamp: new Date(),
    });
  }

  static async logPasswordChange(
    userId: string,
    actorId?: string
  ): Promise<void> {
    await this.auditLogger.log({
      eventCategory: "authentication",
      eventType: "password_change",
      eventName: "Password Changed",
      message: `Password changed for user ${userId}`,
      status: "success",
      severity: "warning",
      userId,
      resourceType: "user_credential",
      resourceName: userId,
      details: {
        system: "authentication",
        changedBy: actorId || userId,
        selfChange: !actorId || actorId === userId,
      },
      complianceTags: ["authentication", "security", "credential_management"],
      eventTimestamp: new Date(),
    });
  }
}

/**
 * Financial System Integration
 */
export class FinancialAuditIntegration {
  private static auditLogger = AuditLogger.getInstance();

  static async logTransactionEvent(
    eventType:
      | "transaction_created"
      | "transaction_updated"
      | "transaction_deleted",
    transactionId: string,
    amount: number,
    currency: string,
    userId: string,
    oldValues?: any,
    newValues?: any
  ): Promise<void> {
    await this.auditLogger.log({
      eventCategory: "financial_transaction",
      eventType,
      eventName: `Transaction ${eventType.replace("_", " ")}`,
      message: `Transaction ${transactionId} ${eventType} for ${amount} ${currency}`,
      status: "success",
      severity: amount > 10000 ? "warning" : "info",
      userId,
      resourceType: "financial_transaction",
      resourceId: transactionId,
      resourceName: `Transaction ${transactionId}`,
      oldValues,
      newValues,
      details: {
        system: "financial",
        amount,
        currency,
        transactionId,
      },
      complianceTags: ["financial_compliance", "sox", "transaction_audit"],
      riskScore: amount > 50000 ? 8 : amount > 10000 ? 5 : 2,
      eventTimestamp: new Date(),
    });
  }

  static async logBudgetAccess(
    operation: "read" | "write" | "delete",
    budgetId: string,
    userId: string,
    budgetData?: any
  ): Promise<void> {
    await this.auditLogger.log({
      eventCategory: "data_access",
      eventType: `budget_${operation}`,
      eventName: `Budget ${operation} Operation`,
      message: `User ${operation} budget ${budgetId}`,
      status: "success",
      severity: operation === "delete" ? "warning" : "info",
      userId,
      resourceType: "budget",
      resourceId: budgetId,
      resourceName: `Budget ${budgetId}`,
      details: {
        system: "financial",
        operation,
        budgetId,
        budgetData: operation === "read" ? undefined : budgetData,
      },
      complianceTags: [
        "data_access",
        "financial_compliance",
        "budget_management",
      ],
      eventTimestamp: new Date(),
    });
  }
}

/**
 * Dashboard System Integration
 */
export class DashboardAuditIntegration {
  private static auditLogger = AuditLogger.getInstance();

  static async logDashboardAccess(
    dashboardType: string,
    userId: string,
    filters?: any,
    exportAction?: boolean
  ): Promise<void> {
    await this.auditLogger.log({
      eventCategory: "data_access",
      eventType: exportAction ? "dashboard_export" : "dashboard_view",
      eventName: `Dashboard ${exportAction ? "Export" : "Access"}`,
      message: `User accessed ${dashboardType} dashboard${exportAction ? " for export" : ""}`,
      status: "success",
      severity: exportAction ? "warning" : "info",
      userId,
      resourceType: "dashboard",
      resourceName: dashboardType,
      details: {
        system: "dashboard",
        dashboardType,
        filters,
        exportAction,
      },
      complianceTags: exportAction
        ? ["data_access", "data_export", "privacy"]
        : ["data_access", "dashboard_usage"],
      riskScore: exportAction ? 6 : 2,
      eventTimestamp: new Date(),
    });
  }

  static async logReportGeneration(
    reportType: string,
    userId: string,
    parameters: any,
    outputFormat: string
  ): Promise<void> {
    await this.auditLogger.log({
      eventCategory: "data_access",
      eventType: "report_generation",
      eventName: "Report Generated",
      message: `User generated ${reportType} report in ${outputFormat} format`,
      status: "success",
      severity: "warning",
      userId,
      resourceType: "report",
      resourceName: reportType,
      details: {
        system: "dashboard",
        reportType,
        parameters,
        outputFormat,
      },
      complianceTags: ["data_access", "report_generation", "data_export"],
      riskScore: 7,
      eventTimestamp: new Date(),
    });
  }
}

/**
 * Customer Intelligence System Integration
 */
export class CustomerIntelligenceAuditIntegration {
  private static auditLogger = AuditLogger.getInstance();

  static async logCustomerDataAccess(
    operation: "profile_view" | "data_export" | "analytics_query",
    customerId: string,
    userId: string,
    dataTypes: string[],
    query?: string
  ): Promise<void> {
    await this.auditLogger.log({
      eventCategory: "data_access",
      eventType: operation,
      eventName: `Customer Data ${operation.replace("_", " ")}`,
      message: `User accessed customer ${customerId} data for ${operation}`,
      status: "success",
      severity: operation === "data_export" ? "warning" : "info",
      userId,
      resourceType: "customer_data",
      resourceId: customerId,
      resourceName: `Customer ${customerId}`,
      details: {
        system: "customer-intelligence",
        customerId,
        dataTypes,
        operation,
        query,
      },
      complianceTags: ["data_access", "gdpr", "privacy", "customer_data"],
      riskScore:
        operation === "data_export" ? 8 : dataTypes.includes("pii") ? 6 : 3,
      requiresReview: operation === "data_export" || dataTypes.includes("pii"),
      eventTimestamp: new Date(),
    });
  }

  static async logMLModelExecution(
    modelName: string,
    customerId: string,
    userId: string,
    predictions: any
  ): Promise<void> {
    await this.auditLogger.log({
      eventCategory: "data_access",
      eventType: "ml_prediction",
      eventName: "ML Model Execution",
      message: `ML model ${modelName} executed for customer ${customerId}`,
      status: "success",
      severity: "info",
      userId,
      resourceType: "ml_model",
      resourceName: modelName,
      details: {
        system: "customer-intelligence",
        modelName,
        customerId,
        predictions: Object.keys(predictions), // Log prediction types, not values
      },
      complianceTags: [
        "data_processing",
        "ml_analytics",
        "customer_intelligence",
      ],
      riskScore: 4,
      eventTimestamp: new Date(),
    });
  }
}

/**
 * Security System Integration
 */
export class SecurityAuditIntegration {
  private static auditLogger = AuditLogger.getInstance();

  static async logSecurityConfigChange(
    configType: string,
    changeType: "create" | "update" | "delete",
    configId: string,
    userId: string,
    oldValues?: any,
    newValues?: any
  ): Promise<void> {
    await this.auditLogger.log({
      eventCategory: "system_configuration",
      eventType: `security_config_${changeType}`,
      eventName: `Security Configuration ${changeType}`,
      message: `Security configuration ${configType} ${changeType}d`,
      status: "success",
      severity: "warning",
      userId,
      resourceType: "security_config",
      resourceId: configId,
      resourceName: `${configType} Configuration`,
      oldValues,
      newValues,
      details: {
        system: "security",
        configType,
        changeType,
        configId,
      },
      complianceTags: [
        "security_configuration",
        "access_control",
        "compliance",
      ],
      riskScore: 7,
      requiresReview: true,
      eventTimestamp: new Date(),
    });
  }

  static async logSecurityIncident(
    incidentType: string,
    severity: "info" | "warning" | "error" | "critical",
    description: string,
    affectedResources: string[],
    detectedBy?: string
  ): Promise<void> {
    await this.auditLogger.log({
      eventCategory: "security_event",
      eventType: "security_incident",
      eventName: `Security Incident: ${incidentType}`,
      message: description,
      status: "warning",
      severity,
      userId: detectedBy,
      resourceType: "security_incident",
      resourceName: incidentType,
      details: {
        system: "security",
        incidentType,
        affectedResources,
        detectedBy,
        autoGenerated: !detectedBy,
      },
      complianceTags: [
        "security_incident",
        "threat_detection",
        "incident_response",
      ],
      riskScore:
        severity === "critical"
          ? 10
          : severity === "error"
            ? 8
            : severity === "warning"
              ? 6
              : 3,
      requiresReview: true,
      eventTimestamp: new Date(),
    });
  }
}

/**
 * Workflow System Integration
 */
export class WorkflowAuditIntegration {
  private static auditLogger = AuditLogger.getInstance();

  static async logWorkflowExecution(
    workflowId: string,
    workflowName: string,
    status: "started" | "completed" | "failed" | "cancelled",
    userId?: string,
    executionTime?: number,
    errorMessage?: string
  ): Promise<void> {
    await this.auditLogger.log({
      eventCategory: "system_configuration",
      eventType: `workflow_${status}`,
      eventName: `Workflow ${status}`,
      message: `Workflow ${workflowName} ${status}${executionTime ? ` in ${executionTime}ms` : ""}`,
      status: status === "failed" ? "failure" : "success",
      severity: status === "failed" ? "error" : "info",
      userId,
      resourceType: "workflow",
      resourceId: workflowId,
      resourceName: workflowName,
      responseTimeMs: executionTime,
      details: {
        system: "workflows",
        workflowId,
        workflowName,
        status,
        executionTime,
        errorMessage,
      },
      complianceTags: [
        "workflow_execution",
        "automation",
        "process_management",
      ],
      riskScore: status === "failed" ? 5 : 2,
      eventTimestamp: new Date(),
    });
  }
}

/**
 * Integration Helper Functions
 */
export class IntegrationHelpers {
  /**
   * Create a wrapper function that adds audit logging to any async function
   */
  static auditWrapper<T extends any[], R>(
    systemName: string,
    operationName: string,
    originalFunction: (...args: T) => Promise<R>
  ) {
    return async (...args: T): Promise<R> => {
      const startTime = Date.now();
      const auditLogger = AuditLogger.getInstance();

      try {
        const result = await originalFunction(...args);
        const executionTime = Date.now() - startTime;

        await auditLogger.log({
          eventCategory: "system_configuration",
          eventType: "function_execution",
          eventName: `${systemName} ${operationName}`,
          message: `Successfully executed ${operationName} in ${systemName}`,
          status: "success",
          severity: "info",
          resourceType: "system_function",
          resourceName: operationName,
          responseTimeMs: executionTime,
          details: {
            system: systemName,
            operation: operationName,
            executionTime,
            argumentCount: args.length,
          },
          complianceTags: ["function_execution", "system_audit"],
          eventTimestamp: new Date(),
        });

        return result;
      } catch (error) {
        const executionTime = Date.now() - startTime;

        await auditLogger.log({
          eventCategory: "system_configuration",
          eventType: "function_error",
          eventName: `${systemName} ${operationName} Error`,
          message: `Failed to execute ${operationName} in ${systemName}: ${(error as Error).message}`,
          status: "failure",
          severity: "error",
          resourceType: "system_function",
          resourceName: operationName,
          responseTimeMs: executionTime,
          details: {
            system: systemName,
            operation: operationName,
            executionTime,
            error: (error as Error).message,
            argumentCount: args.length,
          },
          complianceTags: ["function_execution", "error_tracking"],
          eventTimestamp: new Date(),
        });

        throw error;
      }
    };
  }

  /**
   * Get audit statistics for integration monitoring
   */
  static async getIntegrationStats(): Promise<{
    totalEvents: number;
    eventsBySystem: Record<string, number>;
    criticalEvents: number;
    failureRate: number;
  }> {
    const auditLogger = AuditLogger.getInstance();
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

    const { data: logs } = await auditLogger.getAuditLogs({
      startDate,
      endDate,
      limit: 10000,
    });

    const eventsBySystem: Record<string, number> = {};
    let criticalEvents = 0;
    let failureCount = 0;

    logs.forEach((log: any) => {
      const system = log.details?.system || "unknown";
      eventsBySystem[system] = (eventsBySystem[system] || 0) + 1;

      if (log.severity === "critical") criticalEvents++;
      if (log.status === "failure") failureCount++;
    });

    return {
      totalEvents: logs.length,
      eventsBySystem,
      criticalEvents,
      failureRate: logs.length > 0 ? (failureCount / logs.length) * 100 : 0,
    };
  }
}
