/**
 * Error Handling Master Control Configuration
 * Task 62: Implementeer Fout Behandeling Master Control
 */

export interface ErrorHandlingConfig {
  n8nConfig: {
    baseUrl: string;
    apiKey: string;
    webhookUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  errorCategories: {
    [key: string]: {
      severity: "low" | "medium" | "high" | "critical";
      autoRetry: boolean;
      maxRetries: number;
      escalate: boolean;
      alertChannels: string[];
    };
  };
  recovery: {
    automaticRecovery: boolean;
    recoveryStrategies: string[];
    fallbackEndpoints: string[];
  };
  monitoring: {
    healthCheckInterval: number;
    metricsCollection: boolean;
    alertThresholds: {
      errorRate: number;
      responseTime: number;
      uptime: number;
    };
  };
}

export const defaultErrorConfig: ErrorHandlingConfig = {
  n8nConfig: {
    baseUrl: process.env.N8N_BASE_URL || "https://localhost:5678/api/v1",
    apiKey: process.env.N8N_API_KEY || "fallback-key",
    webhookUrl: process.env.N8N_WEBHOOK_URL || "https://localhost:5678/webhook",
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  errorCategories: {
    API_ERROR: {
      severity: "high",
      autoRetry: true,
      maxRetries: 3,
      escalate: true,
      alertChannels: ["log", "email"],
    },
    NETWORK_ERROR: {
      severity: "medium",
      autoRetry: true,
      maxRetries: 5,
      escalate: false,
      alertChannels: ["log"],
    },
    VALIDATION_ERROR: {
      severity: "low",
      autoRetry: false,
      maxRetries: 0,
      escalate: false,
      alertChannels: ["log"],
    },
    SYSTEM_ERROR: {
      severity: "critical",
      autoRetry: true,
      maxRetries: 2,
      escalate: true,
      alertChannels: ["log", "email", "slack"],
    },
  },
  recovery: {
    automaticRecovery: true,
    recoveryStrategies: [
      "retry_with_backoff",
      "fallback_endpoint",
      "circuit_breaker",
      "graceful_degradation",
    ],
    fallbackEndpoints: ["/api/health", "/api/status"],
  },
  monitoring: {
    healthCheckInterval: 30000, // 30 seconds
    metricsCollection: true,
    alertThresholds: {
      errorRate: 0.05, // 5%
      responseTime: 5000, // 5 seconds
      uptime: 0.99, // 99%
    },
  },
};

/**
 * Check if N8N configuration is available
 */
export function isN8NConfigured(): boolean {
  const requiredVars = ["N8N_BASE_URL", "N8N_API_KEY"];
  return requiredVars.every(
    varName =>
      process.env[varName] &&
      process.env[varName] !== "" &&
      !process.env[varName]?.includes("localhost") &&
      !process.env[varName]?.includes("your_")
  );
}

/**
 * Get fallback response for missing N8N services
 */
export function getFallbackResponse(endpoint: string) {
  switch (true) {
    case endpoint.includes("workflows") && endpoint.includes("stats"):
      return {
        success: true,
        data: {
          totalExecutions: 0,
          successRate: 0,
          errorRate: 0,
          averageExecutionTime: 0,
          dailyStats: [],
        },
        fallback: true,
        message: "N8N service niet beschikbaar - fallback data gebruikt",
      };

    case endpoint.includes("workflows") && endpoint.includes("health"):
      return {
        success: false,
        data: {
          status: "unhealthy",
          message: "N8N service niet geconfigureerd of niet bereikbaar",
        },
        fallback: true,
        configurationNeeded: true,
      };

    case endpoint.includes("metrics/infrastructure"):
      return {
        success: true,
        data: {
          system: {
            cpu_usage: 0,
            memory_usage: 0,
            disk_usage: 0,
            load_average: [0, 0, 0],
            uptime: 0,
          },
          network: {
            bytes_in: 0,
            bytes_out: 0,
            packets_in: 0,
            packets_out: 0,
            connections_active: 0,
            connections_established: 0,
          },
          services: [],
        },
        fallback: true,
        message:
          "Infrastructure monitoring niet beschikbaar - fallback data gebruikt",
      };

    default:
      return {
        success: false,
        error: "Service niet beschikbaar",
        fallback: true,
        message: "De gevraagde service is momenteel niet beschikbaar",
      };
  }
}

/**
 * Enhanced error logger with categorization
 */
export function logError(
  error: any,
  context: string,
  category: string = "SYSTEM_ERROR"
) {
  const timestamp = new Date().toISOString();
  const errorData = {
    timestamp,
    context,
    category,
    severity:
      defaultErrorConfig.errorCategories[category]?.severity || "medium",
    error: {
      message: error?.message || "Unknown error",
      stack: error?.stack,
      name: error?.name,
    },
    recovery: {
      attempted: false,
      strategy: null,
      success: false,
    },
  };

  console.error(`[${timestamp}] [${category}] [${context}]:`, errorData);

  // Here you could add additional logging to database, external services, etc.
  return errorData;
}
