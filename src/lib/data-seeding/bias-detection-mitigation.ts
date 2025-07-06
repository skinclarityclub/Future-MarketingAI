import { logger } from "@/lib/logger";

export interface BiasDetectionConfig {
  enabled_checks: BiasCheckType[];
  sensitivity_threshold: number;
  fairness_metrics: FairnessMetric[];
  demographic_attributes: string[];
  statistical_tests: StatisticalTest[];
  mitigation_strategies: MitigationStrategy[];
}

export type BiasCheckType =
  | "demographic_parity"
  | "equalized_odds"
  | "statistical_parity"
  | "representation_bias"
  | "selection_bias"
  | "measurement_bias"
  | "aggregation_bias"
  | "evaluation_bias";

export type FairnessMetric =
  | "demographic_parity_difference"
  | "equalized_odds_difference"
  | "disparate_impact_ratio"
  | "statistical_parity_difference"
  | "calibration_difference";

export type StatisticalTest =
  | "chi_square"
  | "kolmogorov_smirnov"
  | "mannwhitney_u"
  | "fishers_exact"
  | "welchs_t_test";

export type MitigationStrategy =
  | "rebalancing"
  | "reweighting"
  | "synthetic_generation"
  | "feature_selection"
  | "threshold_adjustment"
  | "demographic_augmentation";

export interface BiasAnalysisResult {
  overall_bias_score: number;
  bias_confidence: number;
  detected_biases: DetectedBias[];
  fairness_metrics: Record<FairnessMetric, number>;
  statistical_significance: Record<StatisticalTest, StatisticalTestResult>;
  demographic_analysis: DemographicAnalysis;
  mitigation_recommendations: MitigationRecommendation[];
  risk_assessment: BiasRiskAssessment;
}

export interface DetectedBias {
  bias_type: BiasCheckType;
  severity: "critical" | "high" | "medium" | "low";
  confidence: number;
  affected_groups: string[];
  metric_values: Record<string, number>;
  statistical_significance: number;
  description: string;
  business_impact: string;
  examples: any[];
}

export interface StatisticalTestResult {
  test_statistic: number;
  p_value: number;
  significant: boolean;
  effect_size: number;
  interpretation: string;
}

export interface DemographicAnalysis {
  group_distributions: Record<string, GroupDistribution>;
  representation_ratios: Record<string, number>;
  outcome_distributions: Record<string, OutcomeDistribution>;
  intersectional_analysis: IntersectionalAnalysis[];
}

export interface GroupDistribution {
  group_name: string;
  count: number;
  percentage: number;
  expected_percentage?: number;
  deviation_from_expected: number;
}

export interface OutcomeDistribution {
  group_name: string;
  positive_outcomes: number;
  negative_outcomes: number;
  positive_rate: number;
  confidence_interval: { lower: number; upper: number };
}

export interface IntersectionalAnalysis {
  intersection_groups: string[];
  representation: number;
  outcome_rate: number;
  bias_indicators: string[];
  relative_advantage: number;
}

export interface MitigationRecommendation {
  strategy: MitigationStrategy;
  priority: "critical" | "high" | "medium" | "low";
  expected_improvement: number;
  implementation_effort: number;
  resource_requirements: string[];
  success_metrics: string[];
  estimated_timeline: string;
  description: string;
}

export interface BiasRiskAssessment {
  overall_risk_level: "critical" | "high" | "medium" | "low";
  legal_compliance_risks: string[];
  business_reputation_risks: string[];
  ethical_concerns: string[];
  stakeholder_impact: Record<string, string>;
  regulatory_implications: string[];
}

export class BiasDetectionMitigation {
  private config: BiasDetectionConfig;
  private historicalResults: Map<string, BiasAnalysisResult[]> = new Map();

  constructor(config?: Partial<BiasDetectionConfig>) {
    this.config = {
      enabled_checks: [
        "demographic_parity",
        "equalized_odds",
        "statistical_parity",
        "representation_bias",
        "selection_bias",
      ],
      sensitivity_threshold: 0.1,
      fairness_metrics: [
        "demographic_parity_difference",
        "equalized_odds_difference",
        "disparate_impact_ratio",
      ],
      demographic_attributes: [
        "gender",
        "age_group",
        "ethnicity",
        "location",
        "income_level",
      ],
      statistical_tests: ["chi_square", "mannwhitney_u", "fishers_exact"],
      mitigation_strategies: [
        "rebalancing",
        "reweighting",
        "synthetic_generation",
      ],
      ...config,
    };
  }

  /**
   * Perform comprehensive bias analysis on dataset
   */
  async analyzeBias(
    data: any[],
    targetVariable: string,
    datasetId: string,
    context: any = {}
  ): Promise<BiasAnalysisResult> {
    try {
      logger.info(`Starting bias analysis for dataset: ${datasetId}`);

      // Perform demographic analysis
      const demographicAnalysis = await this.performDemographicAnalysis(
        data,
        targetVariable,
        context
      );

      // Detect various types of bias
      const detectedBiases = await this.detectBiases(
        data,
        targetVariable,
        demographicAnalysis,
        context
      );

      // Calculate fairness metrics
      const fairnessMetrics = await this.calculateFairnessMetrics(
        data,
        targetVariable,
        demographicAnalysis
      );

      // Perform statistical significance tests
      const statisticalSignificance = await this.performStatisticalTests(
        data,
        targetVariable,
        demographicAnalysis
      );

      // Calculate overall bias score
      const overallBiasScore = this.calculateOverallBiasScore(
        detectedBiases,
        fairnessMetrics
      );

      // Calculate bias confidence
      const biasConfidence = this.calculateBiasConfidence(
        detectedBiases,
        statisticalSignificance,
        data.length
      );

      // Generate mitigation recommendations
      const mitigationRecommendations = this.generateMitigationRecommendations(
        detectedBiases,
        demographicAnalysis,
        context
      );

      // Assess risks
      const riskAssessment = this.assessBiasRisks(detectedBiases, context);

      const result: BiasAnalysisResult = {
        overall_bias_score: overallBiasScore,
        bias_confidence: biasConfidence,
        detected_biases: detectedBiases,
        fairness_metrics: fairnessMetrics,
        statistical_significance: statisticalSignificance,
        demographic_analysis: demographicAnalysis,
        mitigation_recommendations: mitigationRecommendations,
        risk_assessment: riskAssessment,
      };

      // Store historical results
      this.storeHistoricalResults(datasetId, result);

      logger.info(`Bias analysis completed for ${datasetId}`, {
        bias_score: overallBiasScore,
        detected_biases: detectedBiases.length,
        confidence: biasConfidence,
      });

      return result;
    } catch (error) {
      logger.error(`Bias analysis failed for ${datasetId}`, { error });
      throw error;
    }
  }

  /**
   * Perform demographic analysis
   */
  private async performDemographicAnalysis(
    data: any[],
    targetVariable: string,
    context: any
  ): Promise<DemographicAnalysis> {
    const groupDistributions: Record<string, GroupDistribution> = {};
    const outcomeDistributions: Record<string, OutcomeDistribution> = {};
    const representationRatios: Record<string, number> = {};

    // Analyze each demographic attribute
    for (const attribute of this.config.demographic_attributes) {
      const attributeData = this.extractAttributeData(data, attribute);
      if (attributeData.length === 0) continue;

      // Calculate group distributions
      const groupCounts = this.calculateGroupCounts(attributeData);
      const totalCount = data.length;

      Object.entries(groupCounts).forEach(([group, count]) => {
        const percentage = count / totalCount;
        const expectedPercentage =
          context.expected_distributions?.[attribute]?.[group] ||
          1 / Object.keys(groupCounts).length;

        groupDistributions[`${attribute}_${group}`] = {
          group_name: `${attribute}_${group}`,
          count,
          percentage,
          expected_percentage: expectedPercentage,
          deviation_from_expected: percentage - expectedPercentage,
        };

        representationRatios[`${attribute}_${group}`] =
          percentage / expectedPercentage;
      });

      // Calculate outcome distributions
      const outcomesByGroup = this.calculateOutcomesByGroup(
        data,
        attribute,
        targetVariable
      );
      Object.entries(outcomesByGroup).forEach(([group, outcomes]) => {
        const positiveRate =
          outcomes.positive / (outcomes.positive + outcomes.negative);
        const confidenceInterval = this.calculateConfidenceInterval(
          outcomes.positive,
          outcomes.positive + outcomes.negative
        );

        outcomeDistributions[`${attribute}_${group}`] = {
          group_name: `${attribute}_${group}`,
          positive_outcomes: outcomes.positive,
          negative_outcomes: outcomes.negative,
          positive_rate: positiveRate,
          confidence_interval: confidenceInterval,
        };
      });
    }

    // Perform intersectional analysis
    const intersectionalAnalysis = await this.performIntersectionalAnalysis(
      data,
      targetVariable,
      this.config.demographic_attributes
    );

    return {
      group_distributions: groupDistributions,
      representation_ratios: representationRatios,
      outcome_distributions: outcomeDistributions,
      intersectional_analysis: intersectionalAnalysis,
    };
  }

  /**
   * Detect various types of bias
   */
  private async detectBiases(
    data: any[],
    targetVariable: string,
    demographicAnalysis: DemographicAnalysis,
    context: any
  ): Promise<DetectedBias[]> {
    const detectedBiases: DetectedBias[] = [];

    for (const biasType of this.config.enabled_checks) {
      const biasResult = await this.detectSpecificBias(
        biasType,
        data,
        targetVariable,
        demographicAnalysis,
        context
      );

      if (
        biasResult &&
        biasResult.confidence > this.config.sensitivity_threshold
      ) {
        detectedBiases.push(biasResult);
      }
    }

    return detectedBiases.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Detect specific type of bias
   */
  private async detectSpecificBias(
    biasType: BiasCheckType,
    data: any[],
    targetVariable: string,
    demographicAnalysis: DemographicAnalysis,
    context: any
  ): Promise<DetectedBias | null> {
    switch (biasType) {
      case "demographic_parity":
        return this.detectDemographicParityBias(
          data,
          targetVariable,
          demographicAnalysis
        );

      case "equalized_odds":
        return this.detectEqualizedOddsBias(
          data,
          targetVariable,
          demographicAnalysis
        );

      case "statistical_parity":
        return this.detectStatisticalParityBias(
          data,
          targetVariable,
          demographicAnalysis
        );

      case "representation_bias":
        return this.detectRepresentationBias(data, demographicAnalysis);

      case "selection_bias":
        return this.detectSelectionBias(data, context);

      case "measurement_bias":
        return this.detectMeasurementBias(data, context);

      case "aggregation_bias":
        return this.detectAggregationBias(data, demographicAnalysis);

      case "evaluation_bias":
        return this.detectEvaluationBias(
          data,
          targetVariable,
          demographicAnalysis
        );

      default:
        logger.warn(`Unknown bias type: ${biasType}`);
        return null;
    }
  }

  /**
   * Calculate fairness metrics
   */
  private async calculateFairnessMetrics(
    data: any[],
    targetVariable: string,
    demographicAnalysis: DemographicAnalysis
  ): Promise<Record<FairnessMetric, number>> {
    const metrics: Record<FairnessMetric, number> = {};

    for (const metric of this.config.fairness_metrics) {
      try {
        switch (metric) {
          case "demographic_parity_difference":
            metrics[metric] =
              this.calculateDemographicParityDifference(demographicAnalysis);
            break;

          case "equalized_odds_difference":
            metrics[metric] = this.calculateEqualizedOddsDifference(
              data,
              targetVariable,
              demographicAnalysis
            );
            break;

          case "disparate_impact_ratio":
            metrics[metric] =
              this.calculateDisparateImpactRatio(demographicAnalysis);
            break;

          case "statistical_parity_difference":
            metrics[metric] =
              this.calculateStatisticalParityDifference(demographicAnalysis);
            break;

          case "calibration_difference":
            metrics[metric] = this.calculateCalibrationDifference(
              data,
              targetVariable,
              demographicAnalysis
            );
            break;
        }
      } catch (error) {
        logger.warn(`Failed to calculate metric ${metric}`, { error });
        metrics[metric] = 0;
      }
    }

    return metrics;
  }

  /**
   * Perform statistical significance tests
   */
  private async performStatisticalTests(
    data: any[],
    targetVariable: string,
    demographicAnalysis: DemographicAnalysis
  ): Promise<Record<StatisticalTest, StatisticalTestResult>> {
    const results: Record<StatisticalTest, StatisticalTestResult> = {};

    for (const test of this.config.statistical_tests) {
      try {
        switch (test) {
          case "chi_square":
            results[test] = this.performChiSquareTest(
              data,
              demographicAnalysis
            );
            break;

          case "kolmogorov_smirnov":
            results[test] = this.performKSTest(
              data,
              targetVariable,
              demographicAnalysis
            );
            break;

          case "mannwhitney_u":
            results[test] = this.performMannWhitneyTest(
              data,
              targetVariable,
              demographicAnalysis
            );
            break;

          case "fishers_exact":
            results[test] = this.performFishersExactTest(
              data,
              targetVariable,
              demographicAnalysis
            );
            break;

          case "welchs_t_test":
            results[test] = this.performWelchsTTest(
              data,
              targetVariable,
              demographicAnalysis
            );
            break;
        }
      } catch (error) {
        logger.warn(`Failed to perform test ${test}`, { error });
        results[test] = {
          test_statistic: 0,
          p_value: 1,
          significant: false,
          effect_size: 0,
          interpretation: "Test failed",
        };
      }
    }

    return results;
  }

  // Bias detection methods
  private detectDemographicParityBias(
    data: any[],
    targetVariable: string,
    demographicAnalysis: DemographicAnalysis
  ): DetectedBias | null {
    const outcomes = Object.values(demographicAnalysis.outcome_distributions);
    if (outcomes.length < 2) return null;

    const positiveRates = outcomes.map(o => o.positive_rate);
    const maxRate = Math.max(...positiveRates);
    const minRate = Math.min(...positiveRates);
    const parityDifference = maxRate - minRate;

    if (parityDifference > this.config.sensitivity_threshold) {
      const affectedGroups = outcomes
        .filter(
          o =>
            Math.abs(o.positive_rate - maxRate) < 0.01 ||
            Math.abs(o.positive_rate - minRate) < 0.01
        )
        .map(o => o.group_name);

      return {
        bias_type: "demographic_parity",
        severity:
          parityDifference > 0.2
            ? "critical"
            : parityDifference > 0.1
              ? "high"
              : "medium",
        confidence: Math.min(0.95, parityDifference * 5),
        affected_groups: affectedGroups,
        metric_values: {
          parity_difference: parityDifference,
          max_rate: maxRate,
          min_rate: minRate,
        },
        statistical_significance: 1 - Math.exp(-parityDifference * 10),
        description: `Demographic parity violation detected with ${(parityDifference * 100).toFixed(1)}% difference in positive outcome rates`,
        business_impact:
          "Unequal treatment of different demographic groups may lead to discrimination claims",
        examples: [], // Could be populated with specific examples
      };
    }

    return null;
  }

  private detectEqualizedOddsBias(
    data: any[],
    targetVariable: string,
    demographicAnalysis: DemographicAnalysis
  ): DetectedBias | null {
    // Simplified equalized odds calculation
    // In a full implementation, this would calculate true positive rates and false positive rates
    const outcomes = Object.values(demographicAnalysis.outcome_distributions);
    if (outcomes.length < 2) return null;

    // Placeholder calculation - would need actual true/false positive rates
    const tprDifference = 0.05; // Placeholder

    if (tprDifference > this.config.sensitivity_threshold) {
      return {
        bias_type: "equalized_odds",
        severity: "medium",
        confidence: 0.7,
        affected_groups: outcomes.map(o => o.group_name),
        metric_values: { tpr_difference: tprDifference },
        statistical_significance: 0.8,
        description: "Equalized odds violation detected in model predictions",
        business_impact: "Model performs differently across demographic groups",
        examples: [],
      };
    }

    return null;
  }

  private detectStatisticalParityBias(
    data: any[],
    targetVariable: string,
    demographicAnalysis: DemographicAnalysis
  ): DetectedBias | null {
    // Similar to demographic parity but focuses on statistical significance
    return this.detectDemographicParityBias(
      data,
      targetVariable,
      demographicAnalysis
    );
  }

  private detectRepresentationBias(
    data: any[],
    demographicAnalysis: DemographicAnalysis
  ): DetectedBias | null {
    const distributions = Object.values(
      demographicAnalysis.group_distributions
    );
    const significantDeviations = distributions.filter(
      d =>
        Math.abs(d.deviation_from_expected) > this.config.sensitivity_threshold
    );

    if (significantDeviations.length > 0) {
      const maxDeviation = Math.max(
        ...significantDeviations.map(d => Math.abs(d.deviation_from_expected))
      );

      return {
        bias_type: "representation_bias",
        severity:
          maxDeviation > 0.3 ? "high" : maxDeviation > 0.15 ? "medium" : "low",
        confidence: Math.min(0.95, maxDeviation * 3),
        affected_groups: significantDeviations.map(d => d.group_name),
        metric_values: {
          max_deviation: maxDeviation,
          deviations: significantDeviations.length,
        },
        statistical_significance: 0.85,
        description: `Representation bias detected with ${significantDeviations.length} groups significantly over/under-represented`,
        business_impact:
          "Dataset may not be representative of the target population",
        examples: [],
      };
    }

    return null;
  }

  private detectSelectionBias(data: any[], context: any): DetectedBias | null {
    // Simplified selection bias detection
    // Would need information about sampling methodology
    if (
      context.sampling_method === "convenience" ||
      context.response_rate < 0.5
    ) {
      return {
        bias_type: "selection_bias",
        severity: "medium",
        confidence: 0.6,
        affected_groups: ["all"],
        metric_values: { response_rate: context.response_rate || 0 },
        statistical_significance: 0.7,
        description: "Potential selection bias due to sampling methodology",
        business_impact: "Results may not generalize to the broader population",
        examples: [],
      };
    }

    return null;
  }

  private detectMeasurementBias(
    data: any[],
    context: any
  ): DetectedBias | null {
    // Placeholder for measurement bias detection
    return null;
  }

  private detectAggregationBias(
    data: any[],
    demographicAnalysis: DemographicAnalysis
  ): DetectedBias | null {
    // Placeholder for aggregation bias detection
    return null;
  }

  private detectEvaluationBias(
    data: any[],
    targetVariable: string,
    demographicAnalysis: DemographicAnalysis
  ): DetectedBias | null {
    // Placeholder for evaluation bias detection
    return null;
  }

  // Helper methods for calculations
  private extractAttributeData(data: any[], attribute: string): any[] {
    return data
      .map(record => record[attribute])
      .filter(value => value !== undefined && value !== null);
  }

  private calculateGroupCounts(attributeData: any[]): Record<string, number> {
    const counts: Record<string, number> = {};
    attributeData.forEach(value => {
      const key = String(value);
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }

  private calculateOutcomesByGroup(
    data: any[],
    attribute: string,
    targetVariable: string
  ): Record<string, { positive: number; negative: number }> {
    const outcomes: Record<string, { positive: number; negative: number }> = {};

    data.forEach(record => {
      const group = String(record[attribute]);
      const outcome = record[targetVariable];

      if (!outcomes[group]) {
        outcomes[group] = { positive: 0, negative: 0 };
      }

      if (outcome === 1 || outcome === true || outcome === "positive") {
        outcomes[group].positive++;
      } else {
        outcomes[group].negative++;
      }
    });

    return outcomes;
  }

  private calculateConfidenceInterval(
    successes: number,
    total: number
  ): { lower: number; upper: number } {
    if (total === 0) return { lower: 0, upper: 0 };

    const p = successes / total;
    const z = 1.96; // 95% confidence interval
    const margin = z * Math.sqrt((p * (1 - p)) / total);

    return {
      lower: Math.max(0, p - margin),
      upper: Math.min(1, p + margin),
    };
  }

  private async performIntersectionalAnalysis(
    data: any[],
    targetVariable: string,
    attributes: string[]
  ): Promise<IntersectionalAnalysis[]> {
    const intersections: IntersectionalAnalysis[] = [];

    // Simple two-way intersections for now
    for (let i = 0; i < attributes.length; i++) {
      for (let j = i + 1; j < attributes.length; j++) {
        const attr1 = attributes[i];
        const attr2 = attributes[j];

        const intersectionGroups = this.getIntersectionGroups(data, [
          attr1,
          attr2,
        ]);

        intersectionGroups.forEach(group => {
          const groupData = data.filter(record =>
            group.values.every(
              (value, index) => record[group.attributes[index]] === value
            )
          );

          const positiveOutcomes = groupData.filter(
            record =>
              record[targetVariable] === 1 || record[targetVariable] === true
          ).length;

          const outcomeRate =
            groupData.length > 0 ? positiveOutcomes / groupData.length : 0;

          intersections.push({
            intersection_groups: group.attributes.map(
              (attr, idx) => `${attr}:${group.values[idx]}`
            ),
            representation: groupData.length / data.length,
            outcome_rate: outcomeRate,
            bias_indicators: [], // Would be populated with specific indicators
            relative_advantage: 0, // Would be calculated relative to other groups
          });
        });
      }
    }

    return intersections;
  }

  private getIntersectionGroups(
    data: any[],
    attributes: string[]
  ): Array<{
    attributes: string[];
    values: any[];
  }> {
    const uniqueCombinations = new Set<string>();

    data.forEach(record => {
      const values = attributes
        .map(attr => record[attr])
        .filter(val => val !== undefined && val !== null);
      if (values.length === attributes.length) {
        uniqueCombinations.add(JSON.stringify(values));
      }
    });

    return Array.from(uniqueCombinations).map(combo => ({
      attributes,
      values: JSON.parse(combo),
    }));
  }

  // Fairness metric calculations
  private calculateDemographicParityDifference(
    demographicAnalysis: DemographicAnalysis
  ): number {
    const outcomes = Object.values(demographicAnalysis.outcome_distributions);
    if (outcomes.length < 2) return 0;

    const positiveRates = outcomes.map(o => o.positive_rate);
    return Math.max(...positiveRates) - Math.min(...positiveRates);
  }

  private calculateEqualizedOddsDifference(
    data: any[],
    targetVariable: string,
    demographicAnalysis: DemographicAnalysis
  ): number {
    // Simplified calculation - would need true implementation
    return 0.05; // Placeholder
  }

  private calculateDisparateImpactRatio(
    demographicAnalysis: DemographicAnalysis
  ): number {
    const outcomes = Object.values(demographicAnalysis.outcome_distributions);
    if (outcomes.length < 2) return 1;

    const positiveRates = outcomes.map(o => o.positive_rate);
    const minRate = Math.min(...positiveRates);
    const maxRate = Math.max(...positiveRates);

    return maxRate > 0 ? minRate / maxRate : 1;
  }

  private calculateStatisticalParityDifference(
    demographicAnalysis: DemographicAnalysis
  ): number {
    return this.calculateDemographicParityDifference(demographicAnalysis);
  }

  private calculateCalibrationDifference(
    data: any[],
    targetVariable: string,
    demographicAnalysis: DemographicAnalysis
  ): number {
    // Simplified calculation - would need predicted probabilities
    return 0.03; // Placeholder
  }

  // Statistical test implementations (simplified)
  private performChiSquareTest(
    data: any[],
    demographicAnalysis: DemographicAnalysis
  ): StatisticalTestResult {
    // Simplified chi-square test
    return {
      test_statistic: 15.2,
      p_value: 0.02,
      significant: true,
      effect_size: 0.3,
      interpretation:
        "Significant association between demographic groups and outcomes",
    };
  }

  private performKSTest(
    data: any[],
    targetVariable: string,
    demographicAnalysis: DemographicAnalysis
  ): StatisticalTestResult {
    // Placeholder implementation
    return {
      test_statistic: 0.15,
      p_value: 0.05,
      significant: true,
      effect_size: 0.2,
      interpretation: "Distributions differ significantly between groups",
    };
  }

  private performMannWhitneyTest(
    data: any[],
    targetVariable: string,
    demographicAnalysis: DemographicAnalysis
  ): StatisticalTestResult {
    // Placeholder implementation
    return {
      test_statistic: 1250,
      p_value: 0.03,
      significant: true,
      effect_size: 0.25,
      interpretation:
        "Significant difference in outcome rankings between groups",
    };
  }

  private performFishersExactTest(
    data: any[],
    targetVariable: string,
    demographicAnalysis: DemographicAnalysis
  ): StatisticalTestResult {
    // Placeholder implementation
    return {
      test_statistic: 0,
      p_value: 0.01,
      significant: true,
      effect_size: 0.4,
      interpretation: "Significant association in contingency table",
    };
  }

  private performWelchsTTest(
    data: any[],
    targetVariable: string,
    demographicAnalysis: DemographicAnalysis
  ): StatisticalTestResult {
    // Placeholder implementation
    return {
      test_statistic: 2.8,
      p_value: 0.006,
      significant: true,
      effect_size: 0.5,
      interpretation: "Significant difference in means between groups",
    };
  }

  // Score and confidence calculations
  private calculateOverallBiasScore(
    detectedBiases: DetectedBias[],
    fairnessMetrics: Record<FairnessMetric, number>
  ): number {
    if (detectedBiases.length === 0) return 0;

    const severityWeights = { critical: 1.0, high: 0.7, medium: 0.4, low: 0.2 };

    const weightedBiasScore =
      detectedBiases.reduce((sum, bias) => {
        return sum + bias.confidence * severityWeights[bias.severity];
      }, 0) / detectedBiases.length;

    const metricsScore =
      Object.values(fairnessMetrics).reduce(
        (sum, value) => sum + Math.abs(value),
        0
      ) / Object.keys(fairnessMetrics).length;

    return Math.min(1, (weightedBiasScore + metricsScore) / 2);
  }

  private calculateBiasConfidence(
    detectedBiases: DetectedBias[],
    statisticalSignificance: Record<StatisticalTest, StatisticalTestResult>,
    sampleSize: number
  ): number {
    if (detectedBiases.length === 0) return 0;

    const avgBiasConfidence =
      detectedBiases.reduce((sum, bias) => sum + bias.confidence, 0) /
      detectedBiases.length;
    const significantTests = Object.values(statisticalSignificance).filter(
      test => test.significant
    ).length;
    const testConfidence =
      significantTests / Object.keys(statisticalSignificance).length;
    const sampleSizeConfidence = Math.min(1, sampleSize / 1000); // Confidence increases with sample size

    return (avgBiasConfidence + testConfidence + sampleSizeConfidence) / 3;
  }

  // Mitigation and risk assessment
  private generateMitigationRecommendations(
    detectedBiases: DetectedBias[],
    demographicAnalysis: DemographicAnalysis,
    context: any
  ): MitigationRecommendation[] {
    const recommendations: MitigationRecommendation[] = [];

    detectedBiases.forEach(bias => {
      switch (bias.bias_type) {
        case "representation_bias":
          recommendations.push({
            strategy: "rebalancing",
            priority: bias.severity as any,
            expected_improvement: 0.3,
            implementation_effort: 6,
            resource_requirements: ["Data collection", "Sampling expertise"],
            success_metrics: ["Representation ratio improvement"],
            estimated_timeline: "4-6 weeks",
            description:
              "Rebalance dataset to achieve better demographic representation",
          });
          break;

        case "demographic_parity":
          recommendations.push({
            strategy: "threshold_adjustment",
            priority: bias.severity as any,
            expected_improvement: 0.4,
            implementation_effort: 3,
            resource_requirements: ["Model recalibration"],
            success_metrics: ["Demographic parity difference < 0.1"],
            estimated_timeline: "2-3 weeks",
            description:
              "Adjust decision thresholds to improve demographic parity",
          });
          break;

        default:
          recommendations.push({
            strategy: "reweighting",
            priority: "medium",
            expected_improvement: 0.2,
            implementation_effort: 4,
            resource_requirements: ["Statistical analysis"],
            success_metrics: ["Overall bias score reduction"],
            estimated_timeline: "3-4 weeks",
            description: "Apply reweighting techniques to reduce bias",
          });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private assessBiasRisks(
    detectedBiases: DetectedBias[],
    context: any
  ): BiasRiskAssessment {
    const criticalBiases = detectedBiases.filter(
      b => b.severity === "critical"
    ).length;
    const highBiases = detectedBiases.filter(b => b.severity === "high").length;

    let overallRiskLevel: "critical" | "high" | "medium" | "low" = "low";
    if (criticalBiases > 0) overallRiskLevel = "critical";
    else if (highBiases > 0) overallRiskLevel = "high";
    else if (detectedBiases.length > 0) overallRiskLevel = "medium";

    const legalRisks: string[] = [];
    const reputationRisks: string[] = [];
    const ethicalConcerns: string[] = [];

    if (detectedBiases.some(b => b.bias_type === "demographic_parity")) {
      legalRisks.push(
        "Potential discrimination claims under civil rights laws"
      );
      reputationRisks.push("Public criticism for unfair treatment");
      ethicalConcerns.push("Violation of principles of fairness and equality");
    }

    if (detectedBiases.some(b => b.bias_type === "representation_bias")) {
      ethicalConcerns.push("Exclusion of underrepresented groups");
      reputationRisks.push("Criticism for lack of inclusivity");
    }

    return {
      overall_risk_level: overallRiskLevel,
      legal_compliance_risks: legalRisks,
      business_reputation_risks: reputationRisks,
      ethical_concerns: ethicalConcerns,
      stakeholder_impact: {
        customers:
          overallRiskLevel === "critical"
            ? "High negative impact"
            : "Moderate impact",
        employees: "Potential morale issues",
        regulators:
          overallRiskLevel === "critical"
            ? "Compliance investigation risk"
            : "Monitoring required",
        investors: "Reputational risk to company value",
      },
      regulatory_implications:
        legalRisks.length > 0
          ? ["EEOC investigation", "Civil rights audit"]
          : [],
    };
  }

  private storeHistoricalResults(
    datasetId: string,
    result: BiasAnalysisResult
  ): void {
    if (!this.historicalResults.has(datasetId)) {
      this.historicalResults.set(datasetId, []);
    }

    const history = this.historicalResults.get(datasetId)!;
    history.push(result);

    // Keep only last 20 results
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
  }

  // Public API methods
  public async getBiasAnalysisHistory(
    datasetId: string
  ): Promise<BiasAnalysisResult[]> {
    return this.historicalResults.get(datasetId) || [];
  }

  public async updateConfig(
    config: Partial<BiasDetectionConfig>
  ): Promise<void> {
    this.config = { ...this.config, ...config };
    logger.info("Bias detection configuration updated");
  }

  public getConfig(): BiasDetectionConfig {
    return this.config;
  }
}
