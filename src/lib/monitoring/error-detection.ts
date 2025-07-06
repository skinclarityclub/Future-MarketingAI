export interface ErrorThreshold {
  metric: string;
  warningThreshold: number;
  criticalThreshold: number;
  timeWindow: number; // minutes
}

export interface RecoveryAction {
  type: "restart" | "scale" | "alert" | "custom";
  target: string;
  parameters?: Record<string, any>;
  cooldown?: number; // minutes
}

export interface ErrorDetectionRule {
  id: string;
  name: string;
  description: string;
  threshold: ErrorThreshold;
  recoveryActions: RecoveryAction[];
  enabled: boolean;
  lastTriggered?: Date;
}

export interface AnomalyDetectionResult {
  isAnomaly: boolean;
  severity: "low" | "medium" | "high" | "critical";
  metric: string;
  currentValue: number;
  expectedRange: {
    min: number;
    max: number;
  };
  confidence: number;
  timestamp: Date;
}

export class ErrorDetectionService {
  private rules: Map<string, ErrorDetectionRule> = new Map();
  private recoveryHistory: Map<string, Date[]> = new Map();

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules() {
    const defaultRules: ErrorDetectionRule[] = [
      {
        id: "high-error-rate",
        name: "High Error Rate",
        description: "Detects when error rate exceeds normal thresholds",
        threshold: {
          metric: "error_rate",
          warningThreshold: 5, // 5%
          criticalThreshold: 10, // 10%
          timeWindow: 5,
        },
        recoveryActions: [
          {
            type: "alert",
            target: "admin",
            parameters: { priority: "high" },
          },
          {
            type: "scale",
            target: "api",
            parameters: { instances: 2 },
            cooldown: 15,
          },
        ],
        enabled: true,
      },
      {
        id: "data-quality-drop",
        name: "Data Quality Drop",
        description: "Detects significant drops in data quality scores",
        threshold: {
          metric: "data_quality_score",
          warningThreshold: 80,
          criticalThreshold: 70,
          timeWindow: 10,
        },
        recoveryActions: [
          {
            type: "custom",
            target: "data-pipeline",
            parameters: { action: "validate_and_clean" },
          },
          {
            type: "alert",
            target: "data-team",
            parameters: { priority: "medium" },
          },
        ],
        enabled: true,
      },
      {
        id: "system-overload",
        name: "System Overload",
        description: "Detects when system resources are under stress",
        threshold: {
          metric: "cpu_usage",
          warningThreshold: 80,
          criticalThreshold: 90,
          timeWindow: 3,
        },
        recoveryActions: [
          {
            type: "scale",
            target: "workers",
            parameters: { instances: 3 },
            cooldown: 10,
          },
          {
            type: "alert",
            target: "ops-team",
            parameters: { priority: "high" },
          },
        ],
        enabled: true,
      },
    ];

    defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
  }

  async detectAnomalies(
    metrics: Record<string, number>
  ): Promise<AnomalyDetectionResult[]> {
    const results: AnomalyDetectionResult[] = [];

    for (const [ruleId, rule] of this.rules) {
      if (!rule.enabled) continue;

      const metricValue = metrics[rule.threshold.metric];
      if (metricValue === undefined) continue;

      const anomaly = this.analyzeMetric(metricValue, rule);
      if (anomaly.isAnomaly) {
        results.push(anomaly);

        // Trigger recovery if threshold is breached
        if (anomaly.severity === "critical" || anomaly.severity === "high") {
          await this.triggerRecovery(rule, anomaly);
        }
      }
    }

    return results;
  }

  private analyzeMetric(
    value: number,
    rule: ErrorDetectionRule
  ): AnomalyDetectionResult {
    const { threshold } = rule;
    let severity: "low" | "medium" | "high" | "critical" = "low";
    let isAnomaly = false;

    // Determine severity based on threshold type
    if (rule.threshold.metric === "data_quality_score") {
      // Lower values are worse for quality scores
      if (value <= threshold.criticalThreshold) {
        severity = "critical";
        isAnomaly = true;
      } else if (value <= threshold.warningThreshold) {
        severity = "high";
        isAnomaly = true;
      }
    } else {
      // Higher values are worse for other metrics
      if (value >= threshold.criticalThreshold) {
        severity = "critical";
        isAnomaly = true;
      } else if (value >= threshold.warningThreshold) {
        severity = "high";
        isAnomaly = true;
      }
    }

    return {
      isAnomaly,
      severity,
      metric: threshold.metric,
      currentValue: value,
      expectedRange: {
        min: 0,
        max: threshold.warningThreshold,
      },
      confidence: isAnomaly ? 0.9 : 0.1,
      timestamp: new Date(),
    };
  }

  private async triggerRecovery(
    rule: ErrorDetectionRule,
    anomaly: AnomalyDetectionResult
  ): Promise<void> {
    const now = new Date();

    // Check cooldown periods
    for (const action of rule.recoveryActions) {
      if (action.cooldown) {
        const history =
          this.recoveryHistory.get(`${rule.id}-${action.type}`) || [];
        const lastTriggered = history[history.length - 1];

        if (lastTriggered) {
          const timeDiff =
            (now.getTime() - lastTriggered.getTime()) / (1000 * 60);
          if (timeDiff < action.cooldown) {
            console.log(
              `Recovery action ${action.type} for rule ${rule.id} is in cooldown`
            );
            continue;
          }
        }
      }

      await this.executeRecoveryAction(action, rule, anomaly);

      // Record execution time
      const historyKey = `${rule.id}-${action.type}`;
      const history = this.recoveryHistory.get(historyKey) || [];
      history.push(now);

      // Keep only last 10 executions
      if (history.length > 10) {
        history.shift();
      }

      this.recoveryHistory.set(historyKey, history);
    }

    // Update rule's last triggered time
    rule.lastTriggered = now;
  }

  private async executeRecoveryAction(
    action: RecoveryAction,
    rule: ErrorDetectionRule,
    anomaly: AnomalyDetectionResult
  ): Promise<void> {
    console.log(
      `Executing recovery action: ${action.type} for rule: ${rule.name}`
    );

    switch (action.type) {
      case "alert":
        await this.sendAlert(action, rule, anomaly);
        break;
      case "restart":
        await this.restartService(action);
        break;
      case "scale":
        await this.scaleResources(action);
        break;
      case "custom":
        await this.executeCustomAction(action, rule, anomaly);
        break;
    }
  }

  private async sendAlert(
    action: RecoveryAction,
    rule: ErrorDetectionRule,
    anomaly: AnomalyDetectionResult
  ): Promise<void> {
    // In a real implementation, this would send to actual alerting systems
    console.log(
      `ALERT [${action.parameters?.priority || "medium"}]: ${rule.name}`
    );
    console.log(`Target: ${action.target}`);
    console.log(
      `Anomaly: ${anomaly.metric} = ${anomaly.currentValue} (${anomaly.severity})`
    );

    // Could integrate with:
    // - Email notifications
    // - Slack/Teams webhooks
    // - PagerDuty
    // - SMS alerts
  }

  private async restartService(action: RecoveryAction): Promise<void> {
    console.log(`Restarting service: ${action.target}`);
    // In production, this would trigger actual service restart
    // Could use Docker API, Kubernetes API, PM2, etc.
  }

  private async scaleResources(action: RecoveryAction): Promise<void> {
    console.log(
      `Scaling ${action.target} to ${action.parameters?.instances || "default"} instances`
    );
    // In production, this would trigger auto-scaling
    // Could use Kubernetes HPA, AWS Auto Scaling, etc.
  }

  private async executeCustomAction(
    action: RecoveryAction,
    rule: ErrorDetectionRule,
    anomaly: AnomalyDetectionResult
  ): Promise<void> {
    console.log(
      `Executing custom action on ${action.target}:`,
      action.parameters
    );

    // Custom actions could include:
    // - Data pipeline re-runs
    // - Cache clearing
    // - Database optimization
    // - API rate limit adjustments

    if (
      action.target === "data-pipeline" &&
      action.parameters?.action === "validate_and_clean"
    ) {
      console.log("Triggering data validation and cleaning process...");
      // Would trigger actual data cleaning process
    }
  }

  // Management methods
  addRule(rule: ErrorDetectionRule): void {
    this.rules.set(rule.id, rule);
  }

  removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  updateRule(ruleId: string, updates: Partial<ErrorDetectionRule>): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    Object.assign(rule, updates);
    return true;
  }

  getRules(): ErrorDetectionRule[] {
    return Array.from(this.rules.values());
  }

  getRule(ruleId: string): ErrorDetectionRule | undefined {
    return this.rules.get(ruleId);
  }

  enableRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    rule.enabled = true;
    return true;
  }

  disableRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    rule.enabled = false;
    return true;
  }

  getRecoveryHistory(ruleId?: string): Map<string, Date[]> {
    if (ruleId) {
      const filtered = new Map<string, Date[]>();
      for (const [key, value] of this.recoveryHistory) {
        if (key.startsWith(ruleId)) {
          filtered.set(key, value);
        }
      }
      return filtered;
    }
    return this.recoveryHistory;
  }
}

export const errorDetectionService = new ErrorDetectionService();
