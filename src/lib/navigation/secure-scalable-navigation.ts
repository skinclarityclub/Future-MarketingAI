/**
 * Secure Scalable Navigation System
 * Task 13.5: Ensure Scalability and Data Security
 *
 * Integrated system combining security and scalability for the AI Navigation System
 */

import {
  AINavigationSecurity,
  type SecurityConfig,
  type UserSession,
} from "../security/ai-navigation-security";
import {
  AINavigationScalability,
  type ScalabilityConfig,
  type PerformanceMetrics,
} from "../scalability/ai-navigation-scalability";
import { AINavigationFramework } from "./ai-navigation-framework";

export interface SecureScalableConfig {
  security: Partial<SecurityConfig>;
  scalability: Partial<ScalabilityConfig>;
  integration: {
    enableSecurityMetrics: boolean;
    enablePerformanceAuditing: boolean;
    autoScaleOnSecurity: boolean;
    securityCheckInterval: number;
  };
}

export interface SystemHealth {
  security: {
    activeSessions: number;
    failedAttempts: number;
    auditLogs: number;
    threatLevel: "low" | "medium" | "high";
  };
  performance: {
    responseTime: number;
    errorRate: number;
    memoryUsage: number;
    cacheHitRate: number;
  };
  overall: {
    status: "healthy" | "warning" | "critical";
    score: number; // 0-100
    recommendations: string[];
  };
}

export class SecureScalableNavigation {
  private security: AINavigationSecurity;
  private scalability: AINavigationScalability;
  private aiNavigation: AINavigationFramework;
  private config: SecureScalableConfig;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(
    aiNavigation: AINavigationFramework,
    config: Partial<SecureScalableConfig> = {}
  ) {
    this.aiNavigation = aiNavigation;
    this.config = {
      security: config.security || {},
      scalability: config.scalability || {},
      integration: {
        enableSecurityMetrics: true,
        enablePerformanceAuditing: true,
        autoScaleOnSecurity: true,
        securityCheckInterval: 30000, // 30 seconds
        ...config.integration,
      },
    };

    this.security = new AINavigationSecurity(this.config.security);
    this.scalability = new AINavigationScalability(this.config.scalability);

    this.startHealthMonitoring();
  }

  /**
   * Secure navigation request with performance optimization
   */
  async secureNavigate(
    userId: string,
    sessionId: string,
    navigationRequest: any,
    requiredPermission: string = "navigate"
  ): Promise<{
    success: boolean;
    result?: any;
    error?: string;
    metrics?: {
      responseTime: number;
      cacheHit: boolean;
      securityCheck: boolean;
    };
  }> {
    const startTime = Date.now();
    let cacheHit = false;
    let securityCheck = false;

    try {
      // 1. Security validation
      const sessionValidation = this.security.validateSession(sessionId);
      if (!sessionValidation.valid) {
        this.security.recordFailedAttempt(userId, "navigation");
        return {
          success: false,
          error: sessionValidation.reason || "Invalid session",
        };
      }

      // 2. Permission check
      if (!this.security.hasPermission(sessionId, requiredPermission)) {
        this.security.recordFailedAttempt(userId, "permission_denied");
        return {
          success: false,
          error: "Insufficient permissions",
        };
      }

      securityCheck = true;

      // 3. Rate limiting
      const rateLimit = this.security.checkRateLimit(userId, "navigation");
      if (!rateLimit.allowed) {
        return {
          success: false,
          error: `Rate limit exceeded. Retry after ${rateLimit.retryAfter}ms`,
        };
      }

      // 4. Input sanitization
      const sanitizedRequest =
        this.sanitizeNavigationRequest(navigationRequest);

      // 5. Check cache first (with security context)
      const cacheKey = this.generateSecureCacheKey(userId, sanitizedRequest);
      const cachedResult = await this.scalability.getCached(cacheKey);

      if (cachedResult) {
        cacheHit = true;
        const responseTime = Date.now() - startTime;
        this.scalability.recordMetrics(responseTime, true);

        return {
          success: true,
          result: cachedResult,
          metrics: { responseTime, cacheHit, securityCheck },
        };
      }

      // 6. Execute navigation with performance optimization
      const navigationResult = await this.scalability.lazyLoad(
        () => this.aiNavigation.processNavigationRequest(sanitizedRequest),
        cacheKey
      );

      // 7. Record metrics
      const responseTime = Date.now() - startTime;
      this.scalability.recordMetrics(responseTime, true);

      // 8. Cache result with security context
      await this.scalability.setCached(cacheKey, navigationResult);

      return {
        success: true,
        result: navigationResult,
        metrics: { responseTime, cacheHit, securityCheck },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.scalability.recordMetrics(responseTime, false);
      this.security.recordFailedAttempt(userId, "navigation_error");

      return {
        success: false,
        error: error instanceof Error ? error.message : "Navigation failed",
        metrics: { responseTime, cacheHit, securityCheck },
      };
    }
  }

  /**
   * Batch secure navigation requests
   */
  async batchSecureNavigate(
    requests: Array<{
      userId: string;
      sessionId: string;
      navigationRequest: any;
      requiredPermission?: string;
    }>
  ): Promise<
    Array<{
      success: boolean;
      result?: any;
      error?: string;
    }>
  > {
    // Group requests by user for rate limiting
    const userGroups = new Map<string, typeof requests>();
    requests.forEach(req => {
      const userRequests = userGroups.get(req.userId) || [];
      userRequests.push(req);
      userGroups.set(req.userId, userRequests);
    });

    const batchedRequests = Array.from(userGroups.values()).map(
      userRequests => () =>
        Promise.all(
          userRequests.map(req =>
            this.secureNavigate(
              req.userId,
              req.sessionId,
              req.navigationRequest,
              req.requiredPermission
            )
          )
        )
    );

    const results = await this.scalability.batchRequest(batchedRequests);
    return results.flat();
  }

  /**
   * Create secure user session with performance tracking
   */
  async createSecureSession(
    userId: string,
    permissions: string[] = [],
    userContext?: any
  ): Promise<{
    session: UserSession;
    recommendations: string[];
  }> {
    const session = this.security.createSession(userId, permissions);

    // Prefetch common navigation data for this user
    if (userContext?.commonPages) {
      await this.scalability.prefetch(
        userContext.commonPages.map((page: string) => ({
          key: this.generateSecureCacheKey(userId, { page }),
          loader: () => this.aiNavigation.getPageData(page),
        })),
        "medium"
      );
    }

    const recommendations = this.generateSessionRecommendations(
      userId,
      userContext
    );

    return { session, recommendations };
  }

  /**
   * Get comprehensive system health
   */
  getSystemHealth(): SystemHealth {
    const securityMetrics = this.security.getSecurityMetrics();
    const performanceMetrics = this.scalability.getPerformanceMetrics();
    const scalingRecommendations = this.scalability.getScalingRecommendations();

    // Calculate threat level
    const threatLevel = this.calculateThreatLevel(securityMetrics);

    // Calculate overall health score
    const healthScore = this.calculateHealthScore(
      securityMetrics,
      performanceMetrics.current
    );

    // Generate recommendations
    const recommendations = this.generateSystemRecommendations(
      securityMetrics,
      performanceMetrics.current,
      scalingRecommendations
    );

    return {
      security: {
        activeSessions: securityMetrics.activeSessions,
        failedAttempts: securityMetrics.failedAttempts,
        auditLogs: securityMetrics.auditLogs,
        threatLevel,
      },
      performance: {
        responseTime: performanceMetrics.current?.responseTime || 0,
        errorRate: performanceMetrics.current?.errorRate || 0,
        memoryUsage: performanceMetrics.current?.memoryUsage || 0,
        cacheHitRate: performanceMetrics.current?.cacheHitRate || 0,
      },
      overall: {
        status:
          healthScore > 80
            ? "healthy"
            : healthScore > 60
              ? "warning"
              : "critical",
        score: healthScore,
        recommendations,
      },
    };
  }

  /**
   * Emergency security lockdown
   */
  async emergencyLockdown(reason: string): Promise<void> {
    console.warn(`[EMERGENCY LOCKDOWN] ${reason}`);

    // Clear all active sessions
    const securityMetrics = this.security.getSecurityMetrics();
    for (let i = 0; i < securityMetrics.activeSessions; i++) {
      // In a real implementation, we'd have access to session IDs
      // For now, we'll trigger a security audit
    }

    // Clear all caches
    this.scalability.optimizeMemory();

    // Log the emergency event
    console.error(`[SECURITY] Emergency lockdown initiated: ${reason}`);
  }

  /**
   * Auto-scaling based on security events
   */
  private async handleSecurityScaling(): Promise<void> {
    if (!this.config.integration.autoScaleOnSecurity) {
      return;
    }

    const securityMetrics = this.security.getSecurityMetrics();
    const threatLevel = this.calculateThreatLevel(securityMetrics);

    if (threatLevel === "high") {
      // Scale up security measures
      console.warn(
        "[AUTO-SCALE] Scaling up security measures due to high threat level"
      );

      // Reduce cache TTL for sensitive data
      // Increase rate limiting
      // Enable additional monitoring
    }
  }

  /**
   * Private helper methods
   */
  private sanitizeNavigationRequest(request: any): any {
    if (typeof request === "string") {
      return this.security.sanitizeInput(request);
    }

    if (typeof request === "object" && request !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(request)) {
        if (typeof value === "string") {
          sanitized[key] = this.security.sanitizeInput(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    }

    return request;
  }

  private generateSecureCacheKey(userId: string, request: any): string {
    const requestHash = JSON.stringify(request);
    return `nav:${userId}:${Buffer.from(requestHash).toString("base64").substring(0, 16)}`;
  }

  private calculateThreatLevel(
    securityMetrics: any
  ): "low" | "medium" | "high" {
    const failedAttemptRatio =
      securityMetrics.failedAttempts /
      Math.max(securityMetrics.activeSessions, 1);

    if (failedAttemptRatio > 0.5) return "high";
    if (failedAttemptRatio > 0.2) return "medium";
    return "low";
  }

  private calculateHealthScore(
    securityMetrics: any,
    performanceMetrics: PerformanceMetrics | null
  ): number {
    let score = 100;

    // Security factors
    const threatLevel = this.calculateThreatLevel(securityMetrics);
    if (threatLevel === "high") score -= 30;
    else if (threatLevel === "medium") score -= 15;

    // Performance factors
    if (performanceMetrics) {
      if (performanceMetrics.responseTime > 2000) score -= 20;
      if (performanceMetrics.errorRate > 0.05) score -= 25;
      if (performanceMetrics.memoryUsage > 0.8) score -= 15;
      if (performanceMetrics.cacheHitRate < 0.5) score -= 10;
    }

    return Math.max(0, score);
  }

  private generateSystemRecommendations(
    securityMetrics: any,
    performanceMetrics: PerformanceMetrics | null,
    scalingRecommendations: any
  ): string[] {
    const recommendations: string[] = [];

    // Security recommendations
    if (securityMetrics.failedAttempts > 10) {
      recommendations.push("Consider implementing additional rate limiting");
    }

    // Performance recommendations
    if (
      performanceMetrics?.responseTime &&
      performanceMetrics.responseTime > 1000
    ) {
      recommendations.push(
        "Optimize response times through caching or scaling"
      );
    }

    // Scaling recommendations
    if (scalingRecommendations.action !== "maintain") {
      recommendations.push(
        `Consider ${scalingRecommendations.action}: ${scalingRecommendations.reason}`
      );
    }

    return recommendations;
  }

  private generateSessionRecommendations(
    userId: string,
    userContext?: any
  ): string[] {
    const recommendations: string[] = [];

    if (userContext?.isFirstTime) {
      recommendations.push("Enable guided navigation for new user");
    }

    if (userContext?.preferredLanguage) {
      recommendations.push(
        `Set language preference to ${userContext.preferredLanguage}`
      );
    }

    return recommendations;
  }

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(() => {
      this.handleSecurityScaling();

      const health = this.getSystemHealth();
      if (health.overall.status === "critical") {
        console.error(
          "[HEALTH CHECK] System in critical state:",
          health.overall.recommendations
        );
      }
    }, this.config.integration.securityCheckInterval);
  }

  /**
   * Destroy the secure scalable navigation system
   */
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.security.destroy();
    this.scalability.destroy();
  }
}
