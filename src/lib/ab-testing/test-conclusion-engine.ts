/**
 * Test Conclusion Engine for A/B Testing Framework
 * Handles automatic test conclusion, winner selection, and implementation
 */

import {
  TestAnalysis,
  StatisticalResult,
  VariantData,
  MonitoringAlert,
  StatisticalSignificanceEngine,
  PerformanceMonitor,
} from "./statistical-engine";

export interface ConclusionRule {
  id: string;
  name: string;
  type:
    | "significance"
    | "sample_size"
    | "duration"
    | "performance"
    | "business";
  priority: number;
  conditions: ConclusionCondition[];
  action: "continue" | "conclude" | "extend" | "pause" | "stop";
  description: string;
  isActive: boolean;
}

export interface ConclusionCondition {
  metric:
    | "confidence"
    | "pValue"
    | "sampleSize"
    | "duration"
    | "improvement"
    | "revenue"
    | "risk";
  operator: "gt" | "gte" | "lt" | "lte" | "eq" | "between";
  value: number | [number, number];
  unit?: "percentage" | "days" | "hours" | "count" | "currency";
}

export interface WinnerSelectionCriteria {
  primaryMetric: "conversion_rate" | "revenue" | "engagement" | "composite";
  minimumConfidence: number;
  minimumImprovement: number; // percentage
  riskTolerance: "conservative" | "moderate" | "aggressive";
  businessConstraints: BusinessConstraint[];
  fallbackStrategy: "extend_test" | "select_control" | "manual_review";
}

export interface BusinessConstraint {
  type: "budget" | "timeline" | "audience" | "compliance" | "brand";
  weight: number; // 0-1
  threshold: number;
  description: string;
}

export interface TestConclusion {
  testId: string;
  conclusionTime: Date;
  conclusionReason: string;
  triggeredRules: ConclusionRule[];
  selectedWinner: WinnerSelection | null;
  implementationPlan: ImplementationPlan;
  confidence: number;
  riskAssessment: RiskAssessment;
  businessImpact: BusinessImpact;
  rollbackPlan: RollbackPlan;
}

export interface WinnerSelection {
  variantId: string;
  variantName: string;
  selectionReason: string;
  confidence: number;
  expectedImprovement: number;
  expectedRevenue: number;
  riskScore: number;
  implementationStrategy: "immediate" | "gradual" | "staged" | "delayed";
}

export interface ImplementationPlan {
  strategy: "immediate" | "gradual" | "staged" | "delayed";
  phases: ImplementationPhase[];
  timeline: {
    start: Date;
    phases: Date[];
    completion: Date;
  };
  rolloutPercentages: number[];
  monitoringPlan: MonitoringPlan;
  successCriteria: SuccessCriteria[];
}

export interface ImplementationPhase {
  id: string;
  name: string;
  description: string;
  rolloutPercentage: number;
  duration: number; // hours
  successCriteria: SuccessCriteria[];
  rollbackTriggers: RollbackTrigger[];
}

export interface MonitoringPlan {
  duration: number; // hours
  checkpoints: Date[];
  metrics: string[];
  alertThresholds: Record<string, number>;
  escalationPlan: EscalationStep[];
}

export interface SuccessCriteria {
  metric: string;
  target: number;
  tolerance: number;
  timeframe: number; // hours
}

export interface RollbackTrigger {
  metric: string;
  threshold: number;
  timeframe: number; // minutes
  action: "pause" | "rollback" | "alert";
}

export interface EscalationStep {
  level: number;
  condition: string;
  action: string;
  contacts: string[];
}

export interface RiskAssessment {
  overallRiskScore: number; // 0-100
  riskFactors: RiskFactor[];
  mitigationStrategies: string[];
  maxAcceptableRisk: number;
  recommendedApproach: string;
}

export interface RiskFactor {
  type: "statistical" | "business" | "technical" | "compliance";
  description: string;
  impact: number; // 0-10
  probability: number; // 0-1
  severity: "low" | "medium" | "high" | "critical";
  mitigation?: string;
}

export interface BusinessImpact {
  revenueImpact: number;
  revenueImpactRange: [number, number];
  audienceReach: number;
  strategicAlignment: number; // 0-10
  competitiveAdvantage: number; // 0-10
  brandRisk: number; // 0-10
  operationalComplexity: number; // 0-10
}

export interface RollbackPlan {
  triggers: RollbackTrigger[];
  procedure: RollbackStep[];
  timeToRollback: number; // minutes
  fallbackVariant: string;
  communicationPlan: string[];
  dataPreservation: string[];
}

export interface RollbackStep {
  order: number;
  action: string;
  description: string;
  owner: string;
  estimatedTime: number; // minutes
  dependencies: string[];
}

/**
 * Test Conclusion Engine
 */
export class TestConclusionEngine {
  private defaultRules: ConclusionRule[] = [];
  private selectionCriteria: WinnerSelectionCriteria;

  constructor(
    private statisticalEngine: StatisticalSignificanceEngine,
    private performanceMonitor: PerformanceMonitor,
    criteria?: Partial<WinnerSelectionCriteria>
  ) {
    this.selectionCriteria = {
      primaryMetric: "conversion_rate",
      minimumConfidence: 95,
      minimumImprovement: 5, // 5% minimum improvement
      riskTolerance: "moderate",
      businessConstraints: [],
      fallbackStrategy: "extend_test",
      ...criteria,
    };

    this.initializeDefaultRules();
  }

  /**
   * Initialize default conclusion rules
   */
  private initializeDefaultRules(): void {
    this.defaultRules = [
      {
        id: "significance_achieved",
        name: "Statistical Significance Achieved",
        type: "significance",
        priority: 1,
        conditions: [
          {
            metric: "confidence",
            operator: "gte",
            value: 95,
            unit: "percentage",
          },
          {
            metric: "sampleSize",
            operator: "gte",
            value: 1000,
            unit: "count",
          },
        ],
        action: "conclude",
        description: "Conclude test when statistical significance is achieved",
        isActive: true,
      },
      {
        id: "early_winner",
        name: "Early Winner Detection",
        type: "significance",
        priority: 2,
        conditions: [
          {
            metric: "confidence",
            operator: "gte",
            value: 99,
            unit: "percentage",
          },
          {
            metric: "improvement",
            operator: "gte",
            value: 20,
            unit: "percentage",
          },
        ],
        action: "conclude",
        description: "Early conclusion for clear winners",
        isActive: true,
      },
      {
        id: "sample_size_reached",
        name: "Target Sample Size Reached",
        type: "sample_size",
        priority: 3,
        conditions: [
          {
            metric: "sampleSize",
            operator: "gte",
            value: 10000,
            unit: "count",
          },
        ],
        action: "conclude",
        description: "Conclude when target sample size is reached",
        isActive: true,
      },
      {
        id: "maximum_duration",
        name: "Maximum Test Duration",
        type: "duration",
        priority: 4,
        conditions: [
          {
            metric: "duration",
            operator: "gte",
            value: 30,
            unit: "days",
          },
        ],
        action: "conclude",
        description: "Force conclusion after maximum duration",
        isActive: true,
      },
      {
        id: "performance_degradation",
        name: "Significant Performance Drop",
        type: "performance",
        priority: 5,
        conditions: [
          {
            metric: "improvement",
            operator: "lt",
            value: -10,
            unit: "percentage",
          },
        ],
        action: "stop",
        description: "Stop test if performance degrades significantly",
        isActive: true,
      },
    ];
  }

  /**
   * Evaluate if test should be concluded
   */
  async evaluateTestConclusion(
    testId: string,
    variants: VariantData[],
    customRules?: ConclusionRule[]
  ): Promise<TestConclusion | null> {
    try {
      // Get current test analysis
      const analysis = await this.statisticalEngine.analyzeTest(
        testId,
        variants
      );

      // Combine default and custom rules
      const allRules = [...this.defaultRules, ...(customRules || [])];
      const activeRules = allRules.filter(rule => rule.isActive);

      // Evaluate rules in priority order
      const triggeredRules = this.evaluateRules(
        activeRules,
        analysis,
        variants
      );

      if (triggeredRules.length === 0) {
        return null; // No conclusion criteria met
      }

      // Determine conclusion action
      const conclusionAction = this.determineConclusionAction(triggeredRules);

      if (conclusionAction === "continue" || conclusionAction === "extend") {
        return null; // Continue testing
      }

      // Select winner if concluding
      const winner =
        conclusionAction === "conclude"
          ? this.selectWinner(analysis, variants)
          : null;

      // Generate implementation plan
      const implementationPlan = winner
        ? this.generateImplementationPlan(winner, variants, analysis)
        : this.generateFallbackPlan();

      // Assess risks
      const riskAssessment = this.assessRisks(analysis, winner, variants);

      // Calculate business impact
      const businessImpact = this.calculateBusinessImpact(
        analysis,
        winner,
        variants
      );

      // Generate rollback plan
      const rollbackPlan = this.generateRollbackPlan(winner, variants);

      return {
        testId,
        conclusionTime: new Date(),
        conclusionReason: this.generateConclusionReason(triggeredRules),
        triggeredRules,
        selectedWinner: winner,
        implementationPlan,
        confidence: analysis.confidence,
        riskAssessment,
        businessImpact,
        rollbackPlan,
      };
    } catch (error) {
      console.error("Error evaluating test conclusion:", error);
      return null;
    }
  }

  /**
   * Evaluate conclusion rules against current analysis
   */
  private evaluateRules(
    rules: ConclusionRule[],
    analysis: TestAnalysis,
    variants: VariantData[]
  ): ConclusionRule[] {
    const triggered: ConclusionRule[] = [];

    // Sort rules by priority
    const sortedRules = rules.sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      if (this.evaluateRuleConditions(rule, analysis, variants)) {
        triggered.push(rule);
      }
    }

    return triggered;
  }

  /**
   * Evaluate individual rule conditions
   */
  private evaluateRuleConditions(
    rule: ConclusionRule,
    analysis: TestAnalysis,
    variants: VariantData[]
  ): boolean {
    return rule.conditions.every(condition => {
      const value = this.getMetricValue(condition.metric, analysis, variants);
      return this.evaluateCondition(condition, value);
    });
  }

  /**
   * Get metric value for condition evaluation
   */
  private getMetricValue(
    metric: ConclusionCondition["metric"],
    analysis: TestAnalysis,
    variants: VariantData[]
  ): number {
    const testDuration = Date.now() - variants[0]?.startTime.getTime();

    switch (metric) {
      case "confidence":
        return analysis.confidence * 100;
      case "pValue":
        const significantResults = analysis.results.filter(
          r => r.isSignificant
        );
        return significantResults.length > 0
          ? Math.min(...significantResults.map(r => r.pValue))
          : 1;
      case "sampleSize":
        return analysis.sampleSizeAnalysis.current;
      case "duration":
        return testDuration / (1000 * 60 * 60 * 24); // days
      case "improvement":
        const bestResult = analysis.results
          .filter(r => !r.variant.includes("control"))
          .sort((a, b) => b.improvement - a.improvement)[0];
        return bestResult ? bestResult.improvement * 100 : 0;
      case "revenue":
        return variants.reduce((sum, v) => sum + v.metrics.revenue, 0);
      case "risk":
        return this.calculateRiskScore(analysis, variants);
      default:
        return 0;
    }
  }

  /**
   * Evaluate single condition
   */
  private evaluateCondition(
    condition: ConclusionCondition,
    value: number
  ): boolean {
    switch (condition.operator) {
      case "gt":
        return value > (condition.value as number);
      case "gte":
        return value >= (condition.value as number);
      case "lt":
        return value < (condition.value as number);
      case "lte":
        return value <= (condition.value as number);
      case "eq":
        return value === (condition.value as number);
      case "between":
        const [min, max] = condition.value as [number, number];
        return value >= min && value <= max;
      default:
        return false;
    }
  }

  /**
   * Determine conclusion action based on triggered rules
   */
  private determineConclusionAction(
    rules: ConclusionRule[]
  ): ConclusionRule["action"] {
    // Priority order: stop > conclude > pause > extend > continue
    if (rules.some(r => r.action === "stop")) return "stop";
    if (rules.some(r => r.action === "conclude")) return "conclude";
    if (rules.some(r => r.action === "pause")) return "pause";
    if (rules.some(r => r.action === "extend")) return "extend";
    return "continue";
  }

  /**
   * Select winning variant based on criteria
   */
  private selectWinner(
    analysis: TestAnalysis,
    variants: VariantData[]
  ): WinnerSelection | null {
    // Filter candidates based on criteria
    const candidates = analysis.results.filter(result => {
      // Exclude control from winner selection
      if (result.variant.includes("control")) return false;

      // Check confidence threshold
      if ((1 - result.pValue) * 100 < this.selectionCriteria.minimumConfidence)
        return false;

      // Check improvement threshold
      if (result.improvement * 100 < this.selectionCriteria.minimumImprovement)
        return false;

      return true;
    });

    if (candidates.length === 0) {
      return null; // No suitable winner
    }

    // Score candidates based on multiple criteria
    const scoredCandidates = candidates.map(result => {
      const variant = variants.find(v => v.id === result.variant)!;
      const score = this.calculateWinnerScore(result, variant, analysis);

      return {
        result,
        variant,
        score,
        riskScore: this.calculateVariantRisk(result, variant),
      };
    });

    // Select best candidate
    const winner = scoredCandidates.sort((a, b) => b.score - a.score)[0];

    const expectedRevenue = this.calculateExpectedRevenue(
      winner.result,
      winner.variant
    );

    return {
      variantId: winner.variant.id,
      variantName: winner.variant.name,
      selectionReason: this.generateSelectionReason(
        winner.result,
        winner.score
      ),
      confidence: (1 - winner.result.pValue) * 100,
      expectedImprovement: winner.result.improvement * 100,
      expectedRevenue,
      riskScore: winner.riskScore,
      implementationStrategy: this.determineImplementationStrategy(
        winner.riskScore
      ),
    };
  }

  /**
   * Calculate winner score based on multiple criteria
   */
  private calculateWinnerScore(
    result: StatisticalResult,
    variant: VariantData,
    analysis: TestAnalysis
  ): number {
    let score = 0;

    // Statistical confidence (0-40 points)
    const confidence = (1 - result.pValue) * 100;
    score += Math.min(40, confidence * 0.4);

    // Improvement magnitude (0-30 points)
    const improvement = Math.abs(result.improvement) * 100;
    score += Math.min(30, improvement * 3);

    // Sample size adequacy (0-20 points)
    const sampleSizeRatio = analysis.sampleSizeAnalysis.progress / 100;
    score += Math.min(20, sampleSizeRatio * 20);

    // Business impact (0-10 points)
    const revenueImprovement =
      (variant.metrics.revenue / analysis.sampleSizeAnalysis.current) *
      result.improvement;
    score += Math.min(10, Math.max(0, revenueImprovement * 1000));

    return score;
  }

  /**
   * Calculate variant-specific risk
   */
  private calculateVariantRisk(
    result: StatisticalResult,
    variant: VariantData
  ): number {
    let risk = 0;

    // Statistical uncertainty
    const confidence = (1 - result.pValue) * 100;
    risk += (100 - confidence) * 0.3;

    // Improvement uncertainty (confidence interval width)
    const ciWidth =
      result.improvementConfidenceInterval.upper -
      result.improvementConfidenceInterval.lower;
    risk += ciWidth * 50; // Higher width = higher risk

    // Business metrics risk
    const conversionRate =
      variant.metrics.conversions / variant.metrics.impressions;
    if (conversionRate < 0.01) risk += 20; // Very low conversion rate

    return Math.min(100, Math.max(0, risk));
  }

  /**
   * Calculate expected revenue impact
   */
  private calculateExpectedRevenue(
    result: StatisticalResult,
    variant: VariantData
  ): number {
    const currentRevenue = variant.metrics.revenue;
    const expectedImprovement = result.improvement;
    return currentRevenue * (1 + expectedImprovement);
  }

  /**
   * Generate implementation plan
   */
  private generateImplementationPlan(
    winner: WinnerSelection,
    variants: VariantData[],
    analysis: TestAnalysis
  ): ImplementationPlan {
    const strategy = winner.implementationStrategy;
    const phases = this.createImplementationPhases(strategy, winner.riskScore);

    return {
      strategy,
      phases,
      timeline: this.calculateTimeline(phases),
      rolloutPercentages: phases.map(p => p.rolloutPercentage),
      monitoringPlan: this.createMonitoringPlan(winner, phases),
      successCriteria: this.createSuccessCriteria(winner, analysis),
    };
  }

  /**
   * Create implementation phases based on strategy
   */
  private createImplementationPhases(
    strategy: WinnerSelection["implementationStrategy"],
    riskScore: number
  ): ImplementationPhase[] {
    switch (strategy) {
      case "immediate":
        return [
          {
            id: "full_rollout",
            name: "Full Rollout",
            description: "Immediate implementation to 100% of traffic",
            rolloutPercentage: 100,
            duration: 1,
            successCriteria: [],
            rollbackTriggers: [],
          },
        ];

      case "gradual":
        return [
          {
            id: "phase_1",
            name: "Phase 1: 25% Rollout",
            description: "Initial rollout to 25% of traffic",
            rolloutPercentage: 25,
            duration: 24,
            successCriteria: [],
            rollbackTriggers: [],
          },
          {
            id: "phase_2",
            name: "Phase 2: 50% Rollout",
            description: "Expand to 50% of traffic",
            rolloutPercentage: 50,
            duration: 24,
            successCriteria: [],
            rollbackTriggers: [],
          },
          {
            id: "phase_3",
            name: "Phase 3: 100% Rollout",
            description: "Full implementation",
            rolloutPercentage: 100,
            duration: 24,
            successCriteria: [],
            rollbackTriggers: [],
          },
        ];

      case "staged":
        return [
          {
            id: "pilot",
            name: "Pilot Phase",
            description: "Limited pilot with 10% traffic",
            rolloutPercentage: 10,
            duration: 48,
            successCriteria: [],
            rollbackTriggers: [],
          },
          {
            id: "expanded",
            name: "Expanded Phase",
            description: "Expanded rollout to 50% traffic",
            rolloutPercentage: 50,
            duration: 72,
            successCriteria: [],
            rollbackTriggers: [],
          },
          {
            id: "full",
            name: "Full Implementation",
            description: "Complete rollout",
            rolloutPercentage: 100,
            duration: 24,
            successCriteria: [],
            rollbackTriggers: [],
          },
        ];

      default:
        return [];
    }
  }

  /**
   * Calculate implementation timeline
   */
  private calculateTimeline(
    phases: ImplementationPhase[]
  ): ImplementationPlan["timeline"] {
    const start = new Date();
    const phaseEndTimes: Date[] = [];
    let currentTime = start.getTime();

    for (const phase of phases) {
      currentTime += phase.duration * 60 * 60 * 1000; // Convert hours to milliseconds
      phaseEndTimes.push(new Date(currentTime));
    }

    return {
      start,
      phases: phaseEndTimes,
      completion: phaseEndTimes[phaseEndTimes.length - 1],
    };
  }

  /**
   * Create monitoring plan
   */
  private createMonitoringPlan(
    winner: WinnerSelection,
    phases: ImplementationPhase[]
  ): MonitoringPlan {
    const totalDuration = phases.reduce(
      (sum, phase) => sum + phase.duration,
      0
    );

    return {
      duration: totalDuration + 24, // Extra 24 hours post-implementation
      checkpoints: this.generateCheckpoints(phases),
      metrics: ["conversion_rate", "revenue", "bounce_rate", "error_rate"],
      alertThresholds: {
        conversion_rate_drop: 10, // 10% drop triggers alert
        revenue_drop: 15,
        error_rate_increase: 200, // 200% increase
        bounce_rate_increase: 25,
      },
      escalationPlan: [
        {
          level: 1,
          condition: "Minor metric deviation",
          action: "Send alert notification",
          contacts: ["team@company.com"],
        },
        {
          level: 2,
          condition: "Significant metric degradation",
          action: "Pause rollout and investigate",
          contacts: ["team@company.com", "manager@company.com"],
        },
        {
          level: 3,
          condition: "Critical performance issues",
          action: "Immediate rollback",
          contacts: [
            "team@company.com",
            "manager@company.com",
            "exec@company.com",
          ],
        },
      ],
    };
  }

  /**
   * Generate monitoring checkpoints
   */
  private generateCheckpoints(phases: ImplementationPhase[]): Date[] {
    const checkpoints: Date[] = [];
    let currentTime = Date.now();

    for (const phase of phases) {
      // Add checkpoints at 25%, 50%, 75%, and 100% of each phase
      const phaseDuration = phase.duration * 60 * 60 * 1000;
      for (let i = 1; i <= 4; i++) {
        checkpoints.push(new Date(currentTime + (phaseDuration * i) / 4));
      }
      currentTime += phaseDuration;
    }

    return checkpoints;
  }

  /**
   * Create success criteria
   */
  private createSuccessCriteria(
    winner: WinnerSelection,
    analysis: TestAnalysis
  ): SuccessCriteria[] {
    return [
      {
        metric: "conversion_rate",
        target: winner.expectedImprovement,
        tolerance: 2, // 2% tolerance
        timeframe: 24,
      },
      {
        metric: "revenue_per_user",
        target: winner.expectedRevenue / analysis.sampleSizeAnalysis.current,
        tolerance: 5, // 5% tolerance
        timeframe: 48,
      },
      {
        metric: "user_satisfaction",
        target: 4.5, // Out of 5
        tolerance: 0.2,
        timeframe: 72,
      },
    ];
  }

  /**
   * Generate fallback implementation plan
   */
  private generateFallbackPlan(): ImplementationPlan {
    return {
      strategy: "delayed",
      phases: [],
      timeline: {
        start: new Date(),
        phases: [],
        completion: new Date(),
      },
      rolloutPercentages: [],
      monitoringPlan: {
        duration: 0,
        checkpoints: [],
        metrics: [],
        alertThresholds: {},
        escalationPlan: [],
      },
      successCriteria: [],
    };
  }

  /**
   * Assess implementation risks
   */
  private assessRisks(
    analysis: TestAnalysis,
    winner: WinnerSelection | null,
    variants: VariantData[]
  ): RiskAssessment {
    const riskFactors: RiskFactor[] = [];

    // Statistical risks
    if (analysis.confidence < 0.95) {
      riskFactors.push({
        type: "statistical",
        description: "Below optimal confidence level",
        impact: 7,
        probability: 0.3,
        severity: "medium",
        mitigation: "Implement gradual rollout with monitoring",
      });
    }

    // Business risks
    if (winner && winner.expectedImprovement < 10) {
      riskFactors.push({
        type: "business",
        description: "Low expected improvement",
        impact: 5,
        probability: 0.4,
        severity: "low",
        mitigation: "Monitor closely and have rollback ready",
      });
    }

    // Technical risks
    const complexityScore = this.calculateTechnicalComplexity(variants);
    if (complexityScore > 7) {
      riskFactors.push({
        type: "technical",
        description: "High implementation complexity",
        impact: 8,
        probability: 0.6,
        severity: "high",
        mitigation: "Staged rollout with extensive testing",
      });
    }

    const overallRiskScore = this.calculateOverallRisk(riskFactors);

    return {
      overallRiskScore,
      riskFactors,
      mitigationStrategies: riskFactors
        .map(f => f.mitigation)
        .filter(Boolean) as string[],
      maxAcceptableRisk: 70,
      recommendedApproach:
        overallRiskScore > 70
          ? "staged"
          : overallRiskScore > 50
            ? "gradual"
            : "immediate",
    };
  }

  /**
   * Calculate business impact
   */
  private calculateBusinessImpact(
    analysis: TestAnalysis,
    winner: WinnerSelection | null,
    variants: VariantData[]
  ): BusinessImpact {
    const totalRevenue = variants.reduce(
      (sum, v) => sum + v.metrics.revenue,
      0
    );
    const totalAudience = analysis.sampleSizeAnalysis.current;

    const revenueImpact = winner ? winner.expectedRevenue - totalRevenue : 0;
    const revenueImpactRange: [number, number] = [
      revenueImpact * 0.7, // Conservative estimate
      revenueImpact * 1.3, // Optimistic estimate
    ];

    return {
      revenueImpact,
      revenueImpactRange,
      audienceReach: totalAudience,
      strategicAlignment: winner ? 8 : 5, // Scale of 0-10
      competitiveAdvantage: winner ? 7 : 5,
      brandRisk: winner ? 3 : 2,
      operationalComplexity: this.calculateOperationalComplexity(variants),
    };
  }

  /**
   * Generate rollback plan
   */
  private generateRollbackPlan(
    winner: WinnerSelection | null,
    variants: VariantData[]
  ): RollbackPlan {
    const controlVariant = variants.find(v => v.isControl);

    return {
      triggers: [
        {
          metric: "conversion_rate",
          threshold: -10, // 10% drop
          timeframe: 30, // 30 minutes
          action: "rollback",
        },
        {
          metric: "error_rate",
          threshold: 200, // 200% increase
          timeframe: 15,
          action: "pause",
        },
      ],
      procedure: [
        {
          order: 1,
          action: "pause_traffic",
          description: "Immediately pause traffic to new variant",
          owner: "DevOps Team",
          estimatedTime: 2,
          dependencies: [],
        },
        {
          order: 2,
          action: "restore_control",
          description: "Restore traffic to control variant",
          owner: "DevOps Team",
          estimatedTime: 5,
          dependencies: ["pause_traffic"],
        },
        {
          order: 3,
          action: "verify_restoration",
          description: "Verify metrics return to baseline",
          owner: "Analytics Team",
          estimatedTime: 15,
          dependencies: ["restore_control"],
        },
      ],
      timeToRollback: 10, // 10 minutes total
      fallbackVariant: controlVariant?.id || "control",
      communicationPlan: [
        "Notify development team",
        "Update status dashboard",
        "Inform stakeholders",
        "Document incident",
      ],
      dataPreservation: [
        "Backup current metrics",
        "Save rollback timestamp",
        "Preserve variant configurations",
        "Archive test results",
      ],
    };
  }

  // Helper methods
  private calculateRiskScore(
    analysis: TestAnalysis,
    variants: VariantData[]
  ): number {
    let risk = 0;

    // Low confidence increases risk
    risk += (100 - analysis.confidence * 100) * 0.5;

    // Small sample size increases risk
    const sampleRatio = analysis.sampleSizeAnalysis.progress / 100;
    risk += (1 - sampleRatio) * 30;

    // High variance in results increases risk
    const improvements = analysis.results.map(r => r.improvement * 100);
    const variance = this.calculateVariance(improvements);
    risk += Math.min(20, variance);

    return Math.min(100, Math.max(0, risk));
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  private calculateTechnicalComplexity(variants: VariantData[]): number {
    // Simplified complexity calculation
    return Math.min(
      10,
      variants.length * 2 +
        (variants.some(v => v.metrics.bounceRate && v.metrics.bounceRate > 0.5)
          ? 3
          : 0)
    );
  }

  private calculateOperationalComplexity(variants: VariantData[]): number {
    // Simplified complexity calculation
    return Math.min(10, variants.length + (variants.length > 2 ? 2 : 0));
  }

  private calculateOverallRisk(riskFactors: RiskFactor[]): number {
    if (riskFactors.length === 0) return 0;

    const weightedRisk = riskFactors.reduce((sum, factor) => {
      return sum + factor.impact * factor.probability * 10;
    }, 0);

    return Math.min(100, weightedRisk / riskFactors.length);
  }

  private determineImplementationStrategy(
    riskScore: number
  ): WinnerSelection["implementationStrategy"] {
    if (riskScore < 30) return "immediate";
    if (riskScore < 60) return "gradual";
    return "staged";
  }

  private generateConclusionReason(rules: ConclusionRule[]): string {
    const primaryRule = rules[0];
    return `Test concluded based on: ${primaryRule.name}. ${primaryRule.description}`;
  }

  private generateSelectionReason(
    result: StatisticalResult,
    score: number
  ): string {
    return `Selected based on ${(result.improvement * 100).toFixed(1)}% improvement with ${((1 - result.pValue) * 100).toFixed(1)}% confidence (score: ${score.toFixed(1)})`;
  }
}

/**
 * Factory function to create test conclusion engine
 */
export function createTestConclusionEngine(
  statisticalEngine: StatisticalSignificanceEngine,
  performanceMonitor: PerformanceMonitor,
  criteria?: Partial<WinnerSelectionCriteria>
): TestConclusionEngine {
  return new TestConclusionEngine(
    statisticalEngine,
    performanceMonitor,
    criteria
  );
}
