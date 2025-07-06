/**
 * ML A/B Testing Engine
 * Task 72.8: Implementeer continue data enrichment en performance benchmarking
 *
 * A/B testing framework speciaal ontworpen voor ML modellen en algoritmes
 * om de beste performende configuraties te identificeren
 */

import { createClient } from "@supabase/supabase-js";

export interface ABTestConfig {
  test_name: string;
  description: string;
  model_variants: {
    control_model: {
      name: string;
      version: string;
      configuration: any;
    };
    treatment_models: Array<{
      name: string;
      version: string;
      configuration: any;
      weight: number; // Traffic allocation percentage
    }>;
  };
  success_metrics: {
    primary_metric: string;
    secondary_metrics: string[];
    improvement_threshold: number; // Minimum improvement to declare winner
  };
  test_parameters: {
    traffic_split: number; // Percentage of traffic for testing
    min_sample_size: number;
    max_test_duration_days: number;
    confidence_level: number; // e.g., 0.95 for 95% confidence
  };
  targeting_criteria: {
    user_segments: string[];
    geographic_regions: string[];
    time_windows: string[];
  };
}

export interface ABTestResult {
  test_id: string;
  test_name: string;
  start_date: string;
  end_date: string;
  status: "running" | "completed" | "paused" | "failed";
  variants_performance: Array<{
    variant_name: string;
    sample_size: number;
    conversion_metrics: {
      primary_metric_value: number;
      secondary_metrics: { [key: string]: number };
      confidence_interval: {
        lower_bound: number;
        upper_bound: number;
      };
    };
    statistical_significance: {
      p_value: number;
      is_significant: boolean;
      confidence_level: number;
    };
  }>;
  winner_analysis: {
    winning_variant: string | null;
    improvement_percentage: number;
    recommendation: string;
    confidence_score: number;
  };
  business_impact: {
    estimated_impact: number;
    risk_assessment: "low" | "medium" | "high";
    rollout_recommendation: string;
  };
}

export interface ExperimentData {
  user_id: string;
  session_id: string;
  variant_assigned: string;
  timestamp: string;
  interaction_data: any;
  conversion_events: Array<{
    event_name: string;
    event_value: number;
    timestamp: string;
  }>;
  model_performance: {
    response_time_ms: number;
    accuracy_score: number;
    confidence_level: number;
  };
}

export class MLABTestingEngine {
  private supabase: any;
  private activeTests: Map<string, ABTestConfig>;
  private testResults: Map<string, ABTestResult>;
  private experimentData: Map<string, ExperimentData[]>;

  // Statistical calculation utilities
  private statisticalUtils: {
    calculateZScore: (
      mean1: number,
      mean2: number,
      std1: number,
      std2: number,
      n1: number,
      n2: number
    ) => number;
    calculatePValue: (zScore: number) => number;
    calculateConfidenceInterval: (
      mean: number,
      std: number,
      n: number,
      confidenceLevel: number
    ) => { lower: number; upper: number };
  };

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    this.activeTests = new Map();
    this.testResults = new Map();
    this.experimentData = new Map();

    this.statisticalUtils = {
      calculateZScore: (mean1, mean2, std1, std2, n1, n2) => {
        const pooledStd = Math.sqrt((std1 * std1) / n1 + (std2 * std2) / n2);
        return (mean1 - mean2) / pooledStd;
      },
      calculatePValue: zScore => {
        // Simplified p-value calculation (2-tailed test)
        return 2 * (1 - this.normalCDF(Math.abs(zScore)));
      },
      calculateConfidenceInterval: (mean, std, n, confidenceLevel) => {
        const zValue = this.getZValue(confidenceLevel);
        const margin = zValue * (std / Math.sqrt(n));
        return {
          lower: mean - margin,
          upper: mean + margin,
        };
      },
    };
  }

  /**
   * Start a new A/B test for ML models
   */
  async startABTest(config: ABTestConfig): Promise<string> {
    const testId = `ab_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      console.log(`[MLABTestingEngine] Starting A/B test: ${config.test_name}`);

      // Validate configuration
      this.validateTestConfig(config);

      // Initialize test data structures
      this.activeTests.set(testId, config);
      this.experimentData.set(testId, []);

      // Initialize test result tracking
      const initialResult: ABTestResult = {
        test_id: testId,
        test_name: config.test_name,
        start_date: new Date().toISOString(),
        end_date: "",
        status: "running",
        variants_performance: this.initializeVariantPerformance(config),
        winner_analysis: {
          winning_variant: null,
          improvement_percentage: 0,
          recommendation: "Test in progress - insufficient data for analysis",
          confidence_score: 0,
        },
        business_impact: {
          estimated_impact: 0,
          risk_assessment: "medium",
          rollout_recommendation: "Continue testing",
        },
      };

      this.testResults.set(testId, initialResult);

      // Store test configuration in database
      await this.storeTestConfiguration(testId, config);

      console.log(
        `[MLABTestingEngine] A/B test started successfully: ${testId}`
      );
      return testId;
    } catch (error) {
      console.error(`[MLABTestingEngine] Error starting A/B test:`, error);
      throw error;
    }
  }

  /**
   * Assign a user to a test variant
   */
  async assignUserToVariant(
    testId: string,
    userId: string,
    sessionId: string
  ): Promise<string> {
    const testConfig = this.activeTests.get(testId);
    if (!testConfig) {
      throw new Error(`Test not found: ${testId}`);
    }

    try {
      // Determine variant assignment based on user hash and traffic split
      const variant = this.determineVariantAssignment(userId, testConfig);

      // Record assignment
      const assignmentData = {
        test_id: testId,
        user_id: userId,
        session_id: sessionId,
        variant_assigned: variant,
        assignment_timestamp: new Date().toISOString(),
      };

      await this.recordVariantAssignment(assignmentData);

      return variant;
    } catch (error) {
      console.error(
        `[MLABTestingEngine] Error assigning user to variant:`,
        error
      );
      throw error;
    }
  }

  /**
   * Record experiment interaction data
   */
  async recordExperimentData(
    testId: string,
    userId: string,
    sessionId: string,
    interactionData: any,
    modelPerformance: {
      response_time_ms: number;
      accuracy_score: number;
      confidence_level: number;
    }
  ): Promise<void> {
    try {
      const experimentRecord: ExperimentData = {
        user_id: userId,
        session_id: sessionId,
        variant_assigned: await this.getUserVariant(testId, userId),
        timestamp: new Date().toISOString(),
        interaction_data: interactionData,
        conversion_events: [], // Will be populated by recordConversionEvent
        model_performance: modelPerformance,
      };

      // Add to in-memory storage
      const testData = this.experimentData.get(testId) || [];
      testData.push(experimentRecord);
      this.experimentData.set(testId, testData);

      // Store in database
      await this.storeExperimentData(testId, experimentRecord);
    } catch (error) {
      console.error(
        `[MLABTestingEngine] Error recording experiment data:`,
        error
      );
      throw error;
    }
  }

  /**
   * Record conversion events
   */
  async recordConversionEvent(
    testId: string,
    userId: string,
    eventName: string,
    eventValue: number
  ): Promise<void> {
    try {
      const conversionEvent = {
        event_name: eventName,
        event_value: eventValue,
        timestamp: new Date().toISOString(),
      };

      // Update experiment data
      const testData = this.experimentData.get(testId) || [];
      const userRecord = testData.find(record => record.user_id === userId);

      if (userRecord) {
        userRecord.conversion_events.push(conversionEvent);
      }

      // Store conversion event
      await this.storeConversionEvent(testId, userId, conversionEvent);
    } catch (error) {
      console.error(
        `[MLABTestingEngine] Error recording conversion event:`,
        error
      );
      throw error;
    }
  }

  /**
   * Analyze test results and determine statistical significance
   */
  async analyzeTestResults(testId: string): Promise<ABTestResult> {
    const testConfig = this.activeTests.get(testId);
    const testData = this.experimentData.get(testId) || [];

    if (!testConfig) {
      throw new Error(`Test not found: ${testId}`);
    }

    try {
      console.log(`[MLABTestingEngine] Analyzing test results for: ${testId}`);

      // Group data by variant
      const variantData = this.groupDataByVariant(testData);

      // Calculate performance metrics for each variant
      const variantPerformance = await this.calculateVariantPerformance(
        variantData,
        testConfig
      );

      // Perform statistical analysis
      const statisticalAnalysis = this.performStatisticalAnalysis(
        variantPerformance,
        testConfig
      );

      // Determine winner and recommendations
      const winnerAnalysis = this.determineWinner(
        statisticalAnalysis,
        testConfig
      );

      // Calculate business impact
      const businessImpact = this.calculateBusinessImpact(
        winnerAnalysis,
        variantPerformance
      );

      // Update test results
      const testResult: ABTestResult = {
        test_id: testId,
        test_name: testConfig.test_name,
        start_date:
          this.testResults.get(testId)?.start_date || new Date().toISOString(),
        end_date: new Date().toISOString(),
        status: this.shouldEndTest(statisticalAnalysis, testConfig)
          ? "completed"
          : "running",
        variants_performance: variantPerformance,
        winner_analysis: winnerAnalysis,
        business_impact: businessImpact,
      };

      this.testResults.set(testId, testResult);
      await this.storeTestResults(testResult);

      console.log(`[MLABTestingEngine] Test analysis completed for: ${testId}`);
      return testResult;
    } catch (error) {
      console.error(`[MLABTestingEngine] Error analyzing test results:`, error);
      throw error;
    }
  }

  /**
   * Stop an A/B test
   */
  async stopABTest(
    testId: string,
    reason: string = "Manual stop"
  ): Promise<void> {
    try {
      console.log(
        `[MLABTestingEngine] Stopping A/B test: ${testId}, Reason: ${reason}`
      );

      // Perform final analysis
      const finalResults = await this.analyzeTestResults(testId);
      finalResults.status = "completed";
      finalResults.end_date = new Date().toISOString();

      // Update results
      this.testResults.set(testId, finalResults);
      await this.storeTestResults(finalResults);

      // Remove from active tests
      this.activeTests.delete(testId);

      console.log(`[MLABTestingEngine] A/B test stopped: ${testId}`);
    } catch (error) {
      console.error(`[MLABTestingEngine] Error stopping A/B test:`, error);
      throw error;
    }
  }

  /**
   * Private utility methods
   */
  private validateTestConfig(config: ABTestConfig): void {
    if (!config.test_name || !config.model_variants.control_model) {
      throw new Error("Invalid test configuration: missing required fields");
    }

    if (config.model_variants.treatment_models.length === 0) {
      throw new Error("At least one treatment model is required");
    }

    const totalWeight = config.model_variants.treatment_models.reduce(
      (sum, model) => sum + model.weight,
      0
    );
    if (totalWeight > 100) {
      throw new Error("Total traffic allocation cannot exceed 100%");
    }
  }

  private initializeVariantPerformance(
    config: ABTestConfig
  ): ABTestResult["variants_performance"] {
    const variants = [
      { name: config.model_variants.control_model.name, isControl: true },
      ...config.model_variants.treatment_models.map(model => ({
        name: model.name,
        isControl: false,
      })),
    ];

    return variants.map(variant => ({
      variant_name: variant.name,
      sample_size: 0,
      conversion_metrics: {
        primary_metric_value: 0,
        secondary_metrics: {},
        confidence_interval: { lower_bound: 0, upper_bound: 0 },
      },
      statistical_significance: {
        p_value: 1,
        is_significant: false,
        confidence_level: config.test_parameters.confidence_level,
      },
    }));
  }

  private determineVariantAssignment(
    userId: string,
    config: ABTestConfig
  ): string {
    // Simple hash-based assignment for consistent user experience
    const hash = this.hashString(userId);
    const hashValue = hash % 100; // 0-99

    // Check if user should be in test (traffic split)
    if (hashValue >= config.test_parameters.traffic_split) {
      return config.model_variants.control_model.name; // Default to control
    }

    // Assign to treatment variants based on weights
    let cumulativeWeight = 0;
    for (const model of config.model_variants.treatment_models) {
      cumulativeWeight += model.weight;
      if (hashValue < cumulativeWeight) {
        return model.name;
      }
    }

    return config.model_variants.control_model.name; // Fallback to control
  }

  private groupDataByVariant(testData: ExperimentData[]): {
    [variant: string]: ExperimentData[];
  } {
    return testData.reduce(
      (groups, record) => {
        const variant = record.variant_assigned;
        if (!groups[variant]) {
          groups[variant] = [];
        }
        groups[variant].push(record);
        return groups;
      },
      {} as { [variant: string]: ExperimentData[] }
    );
  }

  private async calculateVariantPerformance(
    variantData: { [variant: string]: ExperimentData[] },
    config: ABTestConfig
  ): Promise<ABTestResult["variants_performance"]> {
    const performance = [];

    for (const [variantName, data] of Object.entries(variantData)) {
      const sampleSize = data.length;

      // Calculate primary metric (mock calculation)
      const primaryMetricValues = data.map(record =>
        record.conversion_events.reduce(
          (sum, event) => sum + event.event_value,
          0
        )
      );
      const primaryMetricMean =
        primaryMetricValues.length > 0
          ? primaryMetricValues.reduce((sum, val) => sum + val, 0) /
            primaryMetricValues.length
          : 0;

      // Calculate secondary metrics
      const secondaryMetrics: { [key: string]: number } = {};
      for (const metric of config.success_metrics.secondary_metrics) {
        secondaryMetrics[metric] = Math.random() * 100; // Mock calculation
      }

      // Calculate confidence interval
      const std = this.calculateStandardDeviation(primaryMetricValues);
      const confidenceInterval =
        this.statisticalUtils.calculateConfidenceInterval(
          primaryMetricMean,
          std,
          sampleSize,
          config.test_parameters.confidence_level
        );

      performance.push({
        variant_name: variantName,
        sample_size: sampleSize,
        conversion_metrics: {
          primary_metric_value: primaryMetricMean,
          secondary_metrics: secondaryMetrics,
          confidence_interval: {
            lower_bound: confidenceInterval.lower,
            upper_bound: confidenceInterval.upper,
          },
        },
        statistical_significance: {
          p_value: 0.5, // Will be calculated in statistical analysis
          is_significant: false,
          confidence_level: config.test_parameters.confidence_level,
        },
      });
    }

    return performance;
  }

  private performStatisticalAnalysis(
    variantPerformance: ABTestResult["variants_performance"],
    config: ABTestConfig
  ): ABTestResult["variants_performance"] {
    const controlVariant = variantPerformance.find(
      v => v.variant_name === config.model_variants.control_model.name
    );

    if (!controlVariant) return variantPerformance;

    return variantPerformance.map(variant => {
      if (variant.variant_name === controlVariant.variant_name) {
        return variant; // Skip control variant
      }

      // Calculate statistical significance vs control
      const zScore = this.statisticalUtils.calculateZScore(
        variant.conversion_metrics.primary_metric_value,
        controlVariant.conversion_metrics.primary_metric_value,
        Math.abs(
          variant.conversion_metrics.confidence_interval.upper_bound -
            variant.conversion_metrics.confidence_interval.lower_bound
        ) / 2,
        Math.abs(
          controlVariant.conversion_metrics.confidence_interval.upper_bound -
            controlVariant.conversion_metrics.confidence_interval.lower_bound
        ) / 2,
        variant.sample_size,
        controlVariant.sample_size
      );

      const pValue = this.statisticalUtils.calculatePValue(zScore);
      const isSignificant =
        pValue < 1 - config.test_parameters.confidence_level;

      return {
        ...variant,
        statistical_significance: {
          p_value: pValue,
          is_significant: isSignificant,
          confidence_level: config.test_parameters.confidence_level,
        },
      };
    });
  }

  private determineWinner(
    variantPerformance: ABTestResult["variants_performance"],
    config: ABTestConfig
  ): ABTestResult["winner_analysis"] {
    const controlVariant = variantPerformance.find(
      v => v.variant_name === config.model_variants.control_model.name
    );

    if (!controlVariant) {
      return {
        winning_variant: null,
        improvement_percentage: 0,
        recommendation: "Unable to determine winner - no control variant found",
        confidence_score: 0,
      };
    }

    // Find best performing significant variant
    const significantVariants = variantPerformance.filter(
      v =>
        v.statistical_significance.is_significant &&
        v.variant_name !== controlVariant.variant_name
    );

    if (significantVariants.length === 0) {
      return {
        winning_variant: null,
        improvement_percentage: 0,
        recommendation:
          "No statistically significant improvement found - continue testing or stop",
        confidence_score: 0,
      };
    }

    const bestVariant = significantVariants.reduce((best, current) =>
      current.conversion_metrics.primary_metric_value >
      best.conversion_metrics.primary_metric_value
        ? current
        : best
    );

    const improvementPercentage =
      ((bestVariant.conversion_metrics.primary_metric_value -
        controlVariant.conversion_metrics.primary_metric_value) /
        controlVariant.conversion_metrics.primary_metric_value) *
      100;

    const meetsThreshold =
      improvementPercentage >= config.success_metrics.improvement_threshold;

    return {
      winning_variant: meetsThreshold ? bestVariant.variant_name : null,
      improvement_percentage: improvementPercentage,
      recommendation: meetsThreshold
        ? `Roll out ${bestVariant.variant_name} - shows ${improvementPercentage.toFixed(2)}% improvement`
        : "Improvement below threshold - consider longer test or different variants",
      confidence_score: 1 - bestVariant.statistical_significance.p_value,
    };
  }

  private calculateBusinessImpact(
    winnerAnalysis: ABTestResult["winner_analysis"],
    variantPerformance: ABTestResult["variants_performance"]
  ): ABTestResult["business_impact"] {
    if (!winnerAnalysis.winning_variant) {
      return {
        estimated_impact: 0,
        risk_assessment: "medium",
        rollout_recommendation: "Continue testing or redesign experiment",
      };
    }

    const estimatedImpact = winnerAnalysis.improvement_percentage * 1000; // Mock business value calculation

    let riskAssessment: "low" | "medium" | "high" = "medium";
    if (winnerAnalysis.confidence_score > 0.95) riskAssessment = "low";
    else if (winnerAnalysis.confidence_score < 0.8) riskAssessment = "high";

    const rolloutRecommendation =
      riskAssessment === "low"
        ? "Full rollout recommended"
        : riskAssessment === "medium"
          ? "Gradual rollout with monitoring"
          : "Additional testing recommended before rollout";

    return {
      estimated_impact: estimatedImpact,
      risk_assessment: riskAssessment,
      rollout_recommendation: rolloutRecommendation,
    };
  }

  private shouldEndTest(
    variantPerformance: ABTestResult["variants_performance"],
    config: ABTestConfig
  ): boolean {
    // Check if minimum sample size is reached
    const totalSamples = variantPerformance.reduce(
      (sum, variant) => sum + variant.sample_size,
      0
    );
    if (totalSamples < config.test_parameters.min_sample_size) {
      return false;
    }

    // Check if any variant shows significance
    const hasSignificantResult = variantPerformance.some(
      variant => variant.statistical_significance.is_significant
    );

    return hasSignificantResult;
  }

  /**
   * Utility functions
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  private calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff =
      squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;

    return Math.sqrt(avgSquaredDiff);
  }

  private normalCDF(x: number): number {
    // Approximation of normal cumulative distribution function
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  private erf(x: number): number {
    // Approximation of error function
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y =
      1.0 -
      ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  private getZValue(confidenceLevel: number): number {
    // Common z-values for confidence levels
    const zValues: { [key: number]: number } = {
      0.9: 1.645,
      0.95: 1.96,
      0.99: 2.576,
    };

    return zValues[confidenceLevel] || 1.96; // Default to 95%
  }

  /**
   * Database operations (mock implementation)
   */
  private async storeTestConfiguration(
    testId: string,
    config: ABTestConfig
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("ab_test_configurations")
        .insert({
          test_id: testId,
          test_name: config.test_name,
          description: config.description,
          configuration: config,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error(
          "[MLABTestingEngine] Error storing test configuration:",
          error
        );
      }
    } catch (error) {
      console.error(
        "[MLABTestingEngine] Error in storeTestConfiguration:",
        error
      );
    }
  }

  private async recordVariantAssignment(assignmentData: any): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("ab_test_assignments")
        .insert(assignmentData);

      if (error) {
        console.error(
          "[MLABTestingEngine] Error recording variant assignment:",
          error
        );
      }
    } catch (error) {
      console.error(
        "[MLABTestingEngine] Error in recordVariantAssignment:",
        error
      );
    }
  }

  private async storeExperimentData(
    testId: string,
    experimentData: ExperimentData
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("ab_test_experiment_data")
        .insert({
          test_id: testId,
          user_id: experimentData.user_id,
          session_id: experimentData.session_id,
          variant_assigned: experimentData.variant_assigned,
          timestamp: experimentData.timestamp,
          interaction_data: experimentData.interaction_data,
          model_performance: experimentData.model_performance,
        });

      if (error) {
        console.error(
          "[MLABTestingEngine] Error storing experiment data:",
          error
        );
      }
    } catch (error) {
      console.error("[MLABTestingEngine] Error in storeExperimentData:", error);
    }
  }

  private async storeConversionEvent(
    testId: string,
    userId: string,
    conversionEvent: any
  ): Promise<void> {
    try {
      const { error } = await this.supabase.from("ab_test_conversions").insert({
        test_id: testId,
        user_id: userId,
        event_name: conversionEvent.event_name,
        event_value: conversionEvent.event_value,
        timestamp: conversionEvent.timestamp,
      });

      if (error) {
        console.error(
          "[MLABTestingEngine] Error storing conversion event:",
          error
        );
      }
    } catch (error) {
      console.error(
        "[MLABTestingEngine] Error in storeConversionEvent:",
        error
      );
    }
  }

  private async storeTestResults(testResult: ABTestResult): Promise<void> {
    try {
      const { error } = await this.supabase.from("ab_test_results").upsert({
        test_id: testResult.test_id,
        test_name: testResult.test_name,
        start_date: testResult.start_date,
        end_date: testResult.end_date,
        status: testResult.status,
        variants_performance: testResult.variants_performance,
        winner_analysis: testResult.winner_analysis,
        business_impact: testResult.business_impact,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("[MLABTestingEngine] Error storing test results:", error);
      }
    } catch (error) {
      console.error("[MLABTestingEngine] Error in storeTestResults:", error);
    }
  }

  private async getUserVariant(
    testId: string,
    userId: string
  ): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from("ab_test_assignments")
        .select("variant_assigned")
        .eq("test_id", testId)
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        console.error("[MLABTestingEngine] Error getting user variant:", error);
        return "control"; // Default fallback
      }

      return data.variant_assigned;
    } catch (error) {
      console.error("[MLABTestingEngine] Error in getUserVariant:", error);
      return "control";
    }
  }

  /**
   * Public API methods
   */
  getActiveTests(): Array<{ testId: string; config: ABTestConfig }> {
    return Array.from(this.activeTests.entries()).map(([testId, config]) => ({
      testId,
      config,
    }));
  }

  getTestResults(testId?: string): ABTestResult[] {
    if (testId) {
      const result = this.testResults.get(testId);
      return result ? [result] : [];
    }

    return Array.from(this.testResults.values());
  }

  async pauseTest(testId: string): Promise<void> {
    const testResult = this.testResults.get(testId);
    if (testResult) {
      testResult.status = "paused";
      await this.storeTestResults(testResult);
    }
  }

  async resumeTest(testId: string): Promise<void> {
    const testResult = this.testResults.get(testId);
    if (testResult) {
      testResult.status = "running";
      await this.storeTestResults(testResult);
    }
  }
}
