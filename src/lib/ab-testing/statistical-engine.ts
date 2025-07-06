/**
 * Statistical Significance Engine for A/B Testing Framework
 * Handles real-time statistical calculations, confidence intervals, and significance testing
 */

export interface TestMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  bounceRate?: number;
  timeOnPage?: number;
  engagementRate?: number;
}

export interface VariantData {
  id: string;
  name: string;
  metrics: TestMetrics;
  trafficAllocation: number;
  isControl: boolean;
  startTime: Date;
}

export interface StatisticalResult {
  variant: string;
  conversionRate: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  standardError: number;
  zScore: number;
  pValue: number;
  isSignificant: boolean;
  improvement: number;
  improvementConfidenceInterval: {
    lower: number;
    upper: number;
  };
}

export interface TestAnalysis {
  testId: string;
  status: "insufficient_data" | "running" | "significant" | "inconclusive";
  overallSignificance: number;
  recommendedAction: "continue" | "stop" | "extend" | "investigate";
  winningVariant?: string;
  results: StatisticalResult[];
  sampleSizeAnalysis: {
    current: number;
    required: number;
    progress: number;
  };
  powerAnalysis: {
    currentPower: number;
    targetPower: number;
    minimumDetectableEffect: number;
  };
  qualityChecks: QualityCheck[];
  timeToSignificance?: number;
  confidence: number;
}

export interface QualityCheck {
  type:
    | "sample_ratio_mismatch"
    | "outlier_detection"
    | "data_completeness"
    | "traffic_allocation";
  status: "pass" | "warning" | "fail";
  message: string;
  impact: "low" | "medium" | "high";
  recommendation?: string;
}

export interface MonitoringAlert {
  id: string;
  testId: string;
  type:
    | "significance_achieved"
    | "quality_issue"
    | "performance_drop"
    | "sample_size_reached";
  severity: "info" | "warning" | "critical";
  message: string;
  timestamp: Date;
  data?: any;
}

/**
 * Core Statistical Engine
 */
export class StatisticalSignificanceEngine {
  private readonly MINIMUM_SAMPLE_SIZE = 1000;
  private readonly DEFAULT_CONFIDENCE_LEVEL = 0.95;
  private readonly DEFAULT_POWER = 0.8;
  private readonly OUTLIER_THRESHOLD = 3; // Standard deviations

  constructor(
    private confidenceLevel: number = 0.95,
    private power: number = 0.8
  ) {}

  /**
   * Analyze complete A/B test with all variants
   */
  async analyzeTest(
    testId: string,
    variants: VariantData[],
    targetConfidence?: number
  ): Promise<TestAnalysis> {
    const confidence = targetConfidence || this.confidenceLevel;

    // Perform quality checks
    const qualityChecks = this.performQualityChecks(variants);

    // Calculate statistical results for each variant
    const results = this.calculateVariantResults(variants, confidence);

    // Determine overall test status
    const status = this.determineTestStatus(results, qualityChecks);

    // Find winning variant if significant
    const winningVariant = this.findWinningVariant(results);

    // Calculate sample size requirements
    const sampleSizeAnalysis = this.analyzeSampleSize(variants);

    // Perform power analysis
    const powerAnalysis = this.analyzePower(variants);

    // Calculate overall significance
    const overallSignificance = this.calculateOverallSignificance(results);

    // Generate recommendation
    const recommendedAction = this.generateRecommendation(
      status,
      qualityChecks,
      sampleSizeAnalysis,
      powerAnalysis
    );

    // Estimate time to significance
    const timeToSignificance = this.estimateTimeToSignificance(
      variants,
      results
    );

    return {
      testId,
      status,
      overallSignificance,
      recommendedAction,
      winningVariant,
      results,
      sampleSizeAnalysis,
      powerAnalysis,
      qualityChecks,
      timeToSignificance,
      confidence,
    };
  }

  /**
   * Calculate statistical results for all variants compared to control
   */
  private calculateVariantResults(
    variants: VariantData[],
    confidence: number
  ): StatisticalResult[] {
    const control = variants.find(v => v.isControl);
    if (!control) {
      throw new Error("No control variant found");
    }

    return variants.map(variant => {
      if (variant.isControl) {
        return this.calculateControlResult(variant, confidence);
      } else {
        return this.calculateVariantVsControl(variant, control, confidence);
      }
    });
  }

  /**
   * Calculate results for control variant
   */
  private calculateControlResult(
    control: VariantData,
    confidence: number
  ): StatisticalResult {
    const conversionRate =
      control.metrics.conversions / control.metrics.impressions;
    const standardError = Math.sqrt(
      (conversionRate * (1 - conversionRate)) / control.metrics.impressions
    );

    const zCritical = this.getZCritical(confidence);
    const marginOfError = zCritical * standardError;

    return {
      variant: control.id,
      conversionRate,
      confidenceInterval: {
        lower: Math.max(0, conversionRate - marginOfError),
        upper: Math.min(1, conversionRate + marginOfError),
      },
      standardError,
      zScore: 0, // Control is baseline
      pValue: 1,
      isSignificant: false,
      improvement: 0,
      improvementConfidenceInterval: {
        lower: 0,
        upper: 0,
      },
    };
  }

  /**
   * Calculate statistical comparison between variant and control
   */
  private calculateVariantVsControl(
    variant: VariantData,
    control: VariantData,
    confidence: number
  ): StatisticalResult {
    // Calculate conversion rates
    const variantRate =
      variant.metrics.conversions / variant.metrics.impressions;
    const controlRate =
      control.metrics.conversions / control.metrics.impressions;

    // Calculate standard errors
    const variantSE = Math.sqrt(
      (variantRate * (1 - variantRate)) / variant.metrics.impressions
    );
    const controlSE = Math.sqrt(
      (controlRate * (1 - controlRate)) / control.metrics.impressions
    );

    // Combined standard error for difference
    const combinedSE = Math.sqrt(variantSE ** 2 + controlSE ** 2);

    // Calculate improvement
    const improvement = (variantRate - controlRate) / controlRate;

    // Z-score for difference
    const zScore = (variantRate - controlRate) / combinedSE;

    // Two-tailed p-value
    const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));

    // Significance test
    const alpha = 1 - confidence;
    const isSignificant = pValue < alpha;

    // Confidence interval for variant conversion rate
    const zCritical = this.getZCritical(confidence);
    const variantMarginOfError = zCritical * variantSE;

    // Confidence interval for improvement
    const improvementSE =
      Math.abs(improvement) *
      Math.sqrt(
        (variantSE / variantRate) ** 2 + (controlSE / controlRate) ** 2
      );
    const improvementMargin = zCritical * improvementSE;

    return {
      variant: variant.id,
      conversionRate: variantRate,
      confidenceInterval: {
        lower: Math.max(0, variantRate - variantMarginOfError),
        upper: Math.min(1, variantRate + variantMarginOfError),
      },
      standardError: variantSE,
      zScore,
      pValue,
      isSignificant,
      improvement,
      improvementConfidenceInterval: {
        lower: improvement - improvementMargin,
        upper: improvement + improvementMargin,
      },
    };
  }

  /**
   * Perform data quality checks
   */
  private performQualityChecks(variants: VariantData[]): QualityCheck[] {
    const checks: QualityCheck[] = [];

    // Sample Ratio Mismatch check
    checks.push(this.checkSampleRatioMismatch(variants));

    // Data completeness check
    checks.push(this.checkDataCompleteness(variants));

    // Traffic allocation check
    checks.push(this.checkTrafficAllocation(variants));

    // Outlier detection
    checks.push(...this.detectOutliers(variants));

    return checks.filter(check => check !== null);
  }

  /**
   * Check for Sample Ratio Mismatch (SRM)
   */
  private checkSampleRatioMismatch(variants: VariantData[]): QualityCheck {
    const totalImpressions = variants.reduce(
      (sum, v) => sum + v.metrics.impressions,
      0
    );
    const expectedRatios = variants.map(v => v.trafficAllocation / 100);
    const actualRatios = variants.map(
      v => v.metrics.impressions / totalImpressions
    );

    // Chi-square test for goodness of fit
    const chiSquare = variants.reduce((sum, variant, index) => {
      const expected = expectedRatios[index] * totalImpressions;
      const actual = variant.metrics.impressions;
      return sum + (actual - expected) ** 2 / expected;
    }, 0);

    const degreesOfFreedom = variants.length - 1;
    const criticalValue = this.getChiSquareCritical(degreesOfFreedom, 0.05);

    const hasSRM = chiSquare > criticalValue;

    return {
      type: "sample_ratio_mismatch",
      status: hasSRM ? "fail" : "pass",
      message: hasSRM
        ? `Sample ratio mismatch detected (χ² = ${chiSquare.toFixed(2)}, critical = ${criticalValue.toFixed(2)})`
        : "Sample ratios match expected allocation",
      impact: hasSRM ? "high" : "low",
      recommendation: hasSRM
        ? "Investigate traffic allocation issues before proceeding"
        : undefined,
    };
  }

  /**
   * Check data completeness
   */
  private checkDataCompleteness(variants: VariantData[]): QualityCheck {
    const issues = variants.filter(variant => {
      return (
        variant.metrics.impressions === 0 ||
        variant.metrics.clicks === undefined ||
        variant.metrics.conversions === undefined
      );
    });

    const completeness =
      ((variants.length - issues.length) / variants.length) * 100;

    return {
      type: "data_completeness",
      status:
        completeness === 100 ? "pass" : completeness > 90 ? "warning" : "fail",
      message: `Data completeness: ${completeness.toFixed(1)}%`,
      impact:
        completeness < 90 ? "high" : completeness < 100 ? "medium" : "low",
      recommendation:
        completeness < 100
          ? "Review data collection for missing metrics"
          : undefined,
    };
  }

  /**
   * Check traffic allocation consistency
   */
  private checkTrafficAllocation(variants: VariantData[]): QualityCheck {
    const totalAllocation = variants.reduce(
      (sum, v) => sum + v.trafficAllocation,
      0
    );
    const isValid = Math.abs(totalAllocation - 100) < 0.1;

    return {
      type: "traffic_allocation",
      status: isValid ? "pass" : "fail",
      message: `Traffic allocation sums to ${totalAllocation.toFixed(1)}%`,
      impact: isValid ? "low" : "high",
      recommendation: isValid
        ? undefined
        : "Adjust traffic allocation to sum to 100%",
    };
  }

  /**
   * Detect statistical outliers in conversion rates
   */
  private detectOutliers(variants: VariantData[]): QualityCheck[] {
    const conversionRates = variants.map(
      v => v.metrics.conversions / v.metrics.impressions
    );
    const mean =
      conversionRates.reduce((sum, rate) => sum + rate, 0) /
      conversionRates.length;
    const variance =
      conversionRates.reduce((sum, rate) => sum + (rate - mean) ** 2, 0) /
      conversionRates.length;
    const standardDeviation = Math.sqrt(variance);

    const outliers = variants.filter((variant, index) => {
      const rate = conversionRates[index];
      const zScore = Math.abs((rate - mean) / standardDeviation);
      return zScore > this.OUTLIER_THRESHOLD;
    });

    return outliers.map(variant => ({
      type: "outlier_detection" as const,
      status: "warning" as const,
      message: `Variant ${variant.name} has unusual conversion rate`,
      impact: "medium" as const,
      recommendation: "Investigate variant configuration and data quality",
    }));
  }

  /**
   * Analyze sample size requirements
   */
  private analyzeSampleSize(
    variants: VariantData[]
  ): TestAnalysis["sampleSizeAnalysis"] {
    const totalCurrent = variants.reduce(
      (sum, v) => sum + v.metrics.impressions,
      0
    );

    // Calculate required sample size using effect size estimation
    const control = variants.find(v => v.isControl);
    if (!control) throw new Error("No control variant found");

    const baselineRate =
      control.metrics.conversions / control.metrics.impressions;
    const minimumDetectableEffect = 0.1; // 10% relative improvement
    const effectSize = this.calculateEffectSize(
      baselineRate,
      minimumDetectableEffect
    );

    const requiredPerVariant = this.calculateRequiredSampleSize(
      effectSize,
      this.DEFAULT_POWER,
      1 - this.confidenceLevel
    );

    const required = requiredPerVariant * variants.length;
    const progress = Math.min(100, (totalCurrent / required) * 100);

    return {
      current: totalCurrent,
      required,
      progress,
    };
  }

  /**
   * Analyze statistical power
   */
  private analyzePower(variants: VariantData[]): TestAnalysis["powerAnalysis"] {
    const control = variants.find(v => v.isControl);
    if (!control) throw new Error("No control variant found");

    const baselineRate =
      control.metrics.conversions / control.metrics.impressions;
    const sampleSize = control.metrics.impressions;

    // Calculate current power for detecting 10% relative improvement
    const minimumDetectableEffect = 0.1;
    const effectSize = this.calculateEffectSize(
      baselineRate,
      minimumDetectableEffect
    );
    const currentPower = this.calculatePower(
      sampleSize,
      effectSize,
      1 - this.confidenceLevel
    );

    return {
      currentPower,
      targetPower: this.power,
      minimumDetectableEffect,
    };
  }

  /**
   * Calculate overall test significance
   */
  private calculateOverallSignificance(results: StatisticalResult[]): number {
    const significantResults = results.filter(
      r => r.isSignificant && !r.variant.includes("control")
    );
    if (significantResults.length === 0) return 0;

    // Use the highest confidence from significant results
    const maxConfidence = Math.max(
      ...significantResults.map(r => (1 - r.pValue) * 100)
    );
    return maxConfidence;
  }

  /**
   * Find winning variant based on statistical significance and improvement
   */
  private findWinningVariant(results: StatisticalResult[]): string | undefined {
    const significantVariants = results.filter(
      r =>
        r.isSignificant && r.improvement > 0 && !r.variant.includes("control")
    );

    if (significantVariants.length === 0) return undefined;

    // Return variant with highest improvement among significant ones
    return significantVariants.reduce((best, current) =>
      current.improvement > best.improvement ? current : best
    ).variant;
  }

  /**
   * Generate test recommendation
   */
  private generateRecommendation(
    status: TestAnalysis["status"],
    qualityChecks: QualityCheck[],
    sampleSizeAnalysis: TestAnalysis["sampleSizeAnalysis"],
    powerAnalysis: TestAnalysis["powerAnalysis"]
  ): TestAnalysis["recommendedAction"] {
    // Check for critical quality issues
    const criticalIssues = qualityChecks.filter(
      check => check.status === "fail" && check.impact === "high"
    );

    if (criticalIssues.length > 0) {
      return "investigate";
    }

    // Check test status
    if (status === "significant") {
      return "stop";
    }

    if (status === "insufficient_data") {
      return "continue";
    }

    // Check if we have enough power and sample size
    if (sampleSizeAnalysis.progress < 50 || powerAnalysis.currentPower < 0.6) {
      return "continue";
    }

    if (sampleSizeAnalysis.progress > 120) {
      return "stop"; // Collected enough data
    }

    return "extend";
  }

  /**
   * Estimate time to reach statistical significance
   */
  private estimateTimeToSignificance(
    variants: VariantData[],
    results: StatisticalResult[]
  ): number | undefined {
    const control = variants.find(v => v.isControl);
    if (!control) return undefined;

    const testDuration = Date.now() - control.startTime.getTime();
    const currentImpressions = control.metrics.impressions;
    const impressionsPerDay =
      currentImpressions / (testDuration / (1000 * 60 * 60 * 24));

    // Find the most promising variant
    const bestVariant = results
      .filter(r => !r.variant.includes("control") && r.improvement > 0)
      .sort((a, b) => b.improvement - a.improvement)[0];

    if (!bestVariant) return undefined;

    // Estimate required sample size for significance
    const effectSize = this.calculateEffectSize(
      control.metrics.conversions / control.metrics.impressions,
      bestVariant.improvement
    );

    const requiredSamplePerVariant = this.calculateRequiredSampleSize(
      effectSize,
      this.power,
      1 - this.confidenceLevel
    );

    const remainingImpressions = Math.max(
      0,
      requiredSamplePerVariant - currentImpressions
    );
    const daysRemaining = remainingImpressions / impressionsPerDay;

    return daysRemaining * 24 * 60 * 60 * 1000; // Convert to milliseconds
  }

  /**
   * Determine overall test status
   */
  private determineTestStatus(
    results: StatisticalResult[],
    qualityChecks: QualityCheck[]
  ): TestAnalysis["status"] {
    // Check for critical quality issues
    const criticalIssues = qualityChecks.filter(
      check => check.status === "fail" && check.impact === "high"
    );

    if (criticalIssues.length > 0) {
      return "inconclusive";
    }

    // Check for significant results
    const significantResults = results.filter(
      r => r.isSignificant && !r.variant.includes("control")
    );
    if (significantResults.length > 0) {
      return "significant";
    }

    // Check if we have minimum sample size
    const totalImpressions = results.reduce((sum, r) => {
      // This is a simplification - in practice you'd need access to original data
      return sum + this.MINIMUM_SAMPLE_SIZE; // Placeholder
    }, 0);

    if (totalImpressions < this.MINIMUM_SAMPLE_SIZE * results.length) {
      return "insufficient_data";
    }

    return "running";
  }

  // Statistical utility functions
  private normalCDF(x: number): number {
    // Approximation of the cumulative distribution function for standard normal distribution
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp((-x * x) / 2);
    const prob =
      d *
      t *
      (0.3193815 +
        t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - prob : prob;
  }

  private getZCritical(confidence: number): number {
    const alpha = 1 - confidence;
    // Two-tailed critical values for common confidence levels
    const criticalValues: Record<number, number> = {
      0.9: 1.645,
      0.95: 1.96,
      0.99: 2.576,
    };
    return criticalValues[confidence] || 1.96;
  }

  private getChiSquareCritical(df: number, alpha: number): number {
    // Simplified critical values for common degrees of freedom at α = 0.05
    const criticalValues: Record<number, number> = {
      1: 3.841,
      2: 5.991,
      3: 7.815,
      4: 9.488,
      5: 11.071,
    };
    return criticalValues[df] || 3.841;
  }

  private calculateEffectSize(
    baselineRate: number,
    relativeImprovement: number
  ): number {
    const newRate = baselineRate * (1 + relativeImprovement);
    return (
      (newRate - baselineRate) / Math.sqrt(baselineRate * (1 - baselineRate))
    );
  }

  private calculateRequiredSampleSize(
    effectSize: number,
    power: number,
    alpha: number
  ): number {
    const zAlpha = this.getZCritical(1 - alpha);
    const zBeta = this.getZCritical(power);
    return Math.ceil(2 * ((zAlpha + zBeta) / effectSize) ** 2);
  }

  private calculatePower(
    sampleSize: number,
    effectSize: number,
    alpha: number
  ): number {
    const zAlpha = this.getZCritical(1 - alpha);
    const zBeta = effectSize * Math.sqrt(sampleSize / 2) - zAlpha;
    return this.normalCDF(zBeta);
  }
}

/**
 * Real-time Performance Monitor
 */
export class PerformanceMonitor {
  private alerts: MonitoringAlert[] = [];
  private listeners: ((alert: MonitoringAlert) => void)[] = [];

  constructor(private engine: StatisticalSignificanceEngine) {}

  /**
   * Monitor test performance and trigger alerts
   */
  async monitorTest(
    testId: string,
    variants: VariantData[]
  ): Promise<MonitoringAlert[]> {
    const newAlerts: MonitoringAlert[] = [];

    try {
      const analysis = await this.engine.analyzeTest(testId, variants);

      // Check for significance achievement
      if (analysis.status === "significant" && analysis.winningVariant) {
        newAlerts.push({
          id: this.generateAlertId(),
          testId,
          type: "significance_achieved",
          severity: "info",
          message: `Test reached statistical significance. Winner: ${analysis.winningVariant}`,
          timestamp: new Date(),
          data: {
            winningVariant: analysis.winningVariant,
            confidence: analysis.confidence,
          },
        });
      }

      // Check for quality issues
      const criticalQualityIssues = analysis.qualityChecks.filter(
        check => check.status === "fail" && check.impact === "high"
      );

      for (const issue of criticalQualityIssues) {
        newAlerts.push({
          id: this.generateAlertId(),
          testId,
          type: "quality_issue",
          severity: "critical",
          message: `Quality issue detected: ${issue.message}`,
          timestamp: new Date(),
          data: { qualityCheck: issue },
        });
      }

      // Check for performance drops
      const performanceDrops = this.detectPerformanceDrops(variants);
      for (const drop of performanceDrops) {
        newAlerts.push({
          id: this.generateAlertId(),
          testId,
          type: "performance_drop",
          severity: "warning",
          message: `Performance drop detected in variant ${drop.variantId}: ${drop.metric} decreased by ${drop.percentage}%`,
          timestamp: new Date(),
          data: drop,
        });
      }

      // Check sample size milestones
      if (analysis.sampleSizeAnalysis.progress >= 100) {
        newAlerts.push({
          id: this.generateAlertId(),
          testId,
          type: "sample_size_reached",
          severity: "info",
          message: "Target sample size reached",
          timestamp: new Date(),
          data: { progress: analysis.sampleSizeAnalysis.progress },
        });
      }
    } catch (error) {
      newAlerts.push({
        id: this.generateAlertId(),
        testId,
        type: "quality_issue",
        severity: "critical",
        message: `Analysis error: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date(),
        data: { error: error instanceof Error ? error.message : error },
      });
    }

    // Store new alerts
    this.alerts.push(...newAlerts);

    // Notify listeners
    newAlerts.forEach(alert => {
      this.listeners.forEach(listener => listener(alert));
    });

    return newAlerts;
  }

  /**
   * Detect performance drops in variants
   */
  private detectPerformanceDrops(variants: VariantData[]): Array<{
    variantId: string;
    metric: string;
    percentage: number;
  }> {
    // This is a simplified implementation
    // In practice, you'd compare against historical data
    const drops: Array<{
      variantId: string;
      metric: string;
      percentage: number;
    }> = [];

    for (const variant of variants) {
      const conversionRate =
        variant.metrics.conversions / variant.metrics.impressions;
      const clickThroughRate =
        variant.metrics.clicks / variant.metrics.impressions;

      // Simplified check - in practice you'd have baseline comparison
      if (conversionRate < 0.01) {
        // Less than 1% conversion rate
        drops.push({
          variantId: variant.id,
          metric: "conversion_rate",
          percentage: 50, // Simplified calculation
        });
      }

      if (clickThroughRate < 0.02) {
        // Less than 2% CTR
        drops.push({
          variantId: variant.id,
          metric: "click_through_rate",
          percentage: 30, // Simplified calculation
        });
      }
    }

    return drops;
  }

  /**
   * Subscribe to monitoring alerts
   */
  onAlert(listener: (alert: MonitoringAlert) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get all alerts for a test
   */
  getAlerts(testId?: string): MonitoringAlert[] {
    return testId
      ? this.alerts.filter(alert => alert.testId === testId)
      : [...this.alerts];
  }

  /**
   * Clear alerts
   */
  clearAlerts(testId?: string): void {
    if (testId) {
      this.alerts = this.alerts.filter(alert => alert.testId !== testId);
    } else {
      this.alerts = [];
    }
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Factory function to create configured statistical engine
 */
export function createStatisticalEngine(
  confidenceLevel: number = 0.95,
  power: number = 0.8
): StatisticalSignificanceEngine {
  return new StatisticalSignificanceEngine(confidenceLevel, power);
}

/**
 * Factory function to create performance monitor
 */
export function createPerformanceMonitor(
  engine?: StatisticalSignificanceEngine
): PerformanceMonitor {
  const statisticalEngine = engine || createStatisticalEngine();
  return new PerformanceMonitor(statisticalEngine);
}
