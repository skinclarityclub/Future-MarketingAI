import { logger } from "@/lib/logger";

export interface DataQualityDimension {
  name: string;
  weight: number;
  score: number;
  confidence: number;
  temporal_decay_factor: number;
  last_updated: Date;
  measurement_method: string;
  threshold_critical: number;
  threshold_warning: number;
}

export interface DataSourceReliability {
  source_id: string;
  historical_accuracy: number;
  uptime_percentage: number;
  data_consistency_score: number;
  update_frequency_score: number;
  validation_failures: number;
  reliability_coefficient: number;
  last_assessment: Date;
}

export interface ConfidenceFactors {
  data_volume_factor: number;
  data_freshness_factor: number;
  source_reliability_factor: number;
  validation_coverage_factor: number;
  cross_validation_factor: number;
  temporal_stability_factor: number;
}

export interface QualityScore {
  overall_score: number;
  confidence_level: number;
  dimension_scores: Record<string, DataQualityDimension>;
  confidence_factors: ConfidenceFactors;
  reliability_assessment: DataSourceReliability;
  quality_trend: {
    direction: "improving" | "stable" | "declining";
    rate_of_change: number;
    forecast_next_period: number;
  };
  recommendations: QualityRecommendation[];
  risk_assessment: RiskAssessment;
}

export interface QualityRecommendation {
  priority: "critical" | "high" | "medium" | "low";
  category: "data" | "process" | "governance" | "technical";
  description: string;
  impact_score: number;
  implementation_effort: number;
  expected_improvement: number;
}

export interface RiskAssessment {
  overall_risk_score: number;
  risk_factors: Array<{
    factor: string;
    impact: number;
    probability: number;
    mitigation_strategy: string;
  }>;
  compliance_risks: string[];
  business_impact_risks: string[];
}

export class AdvancedDataQualityScoring {
  private sourceReliabilityCache: Map<string, DataSourceReliability> =
    new Map();
  private qualityHistory: Map<string, QualityScore[]> = new Map();
  private temporalDecayConfig = {
    base_decay_rate: 0.95,
    decay_interval_hours: 24,
    minimum_confidence: 0.1,
  };

  /**
   * Calculate comprehensive quality score with confidence metrics
   */
  async calculateQualityScore(
    data: any[],
    sourceName: string,
    dataType: string,
    customWeights?: Record<string, number>
  ): Promise<QualityScore> {
    try {
      // Get or create source reliability profile
      const sourceReliability = await this.assessSourceReliability(sourceName);

      // Calculate dimension scores
      const dimensionScores = await this.calculateDimensionScores(
        data,
        sourceName,
        dataType,
        customWeights
      );

      // Calculate confidence factors
      const confidenceFactors = await this.calculateConfidenceFactors(
        data,
        sourceName,
        sourceReliability
      );

      // Calculate overall score with confidence weighting
      const overallScore = this.calculateWeightedOverallScore(
        dimensionScores,
        confidenceFactors,
        sourceReliability
      );

      // Assess quality trends
      const qualityTrend = await this.assessQualityTrend(
        sourceName,
        overallScore
      );

      // Generate recommendations
      const recommendations = this.generateQualityRecommendations(
        dimensionScores,
        confidenceFactors,
        sourceReliability
      );

      // Assess risks
      const riskAssessment = this.assessQualityRisks(
        dimensionScores,
        confidenceFactors,
        sourceReliability
      );

      const qualityScore: QualityScore = {
        overall_score: overallScore,
        confidence_level: this.calculateOverallConfidence(confidenceFactors),
        dimension_scores: dimensionScores,
        confidence_factors: confidenceFactors,
        reliability_assessment: sourceReliability,
        quality_trend: qualityTrend,
        recommendations,
        risk_assessment: riskAssessment,
      };

      // Store in history for trend analysis
      this.storeQualityHistory(sourceName, qualityScore);

      logger.info(`Quality score calculated for ${sourceName}`, {
        score: overallScore,
        confidence: qualityScore.confidence_level,
        trend: qualityTrend.direction,
      });

      return qualityScore;
    } catch (error) {
      logger.error(`Failed to calculate quality score for ${sourceName}`, {
        error,
      });
      throw error;
    }
  }

  /**
   * Calculate dimension-specific quality scores
   */
  private async calculateDimensionScores(
    data: any[],
    sourceName: string,
    dataType: string,
    customWeights?: Record<string, number>
  ): Promise<Record<string, DataQualityDimension>> {
    const defaultWeights = {
      completeness: 0.25,
      accuracy: 0.25,
      consistency: 0.2,
      timeliness: 0.15,
      validity: 0.1,
      uniqueness: 0.05,
    };

    const weights = { ...defaultWeights, ...customWeights };
    const dimensions: Record<string, DataQualityDimension> = {};

    // Completeness dimension
    dimensions.completeness = {
      name: "completeness",
      weight: weights.completeness,
      score: this.measureCompleteness(data),
      confidence: this.calculateCompletenessConfidence(data),
      temporal_decay_factor: 0.98,
      last_updated: new Date(),
      measurement_method: "field_completeness_ratio",
      threshold_critical: 0.7,
      threshold_warning: 0.85,
    };

    // Accuracy dimension
    dimensions.accuracy = {
      name: "accuracy",
      weight: weights.accuracy,
      score: await this.measureAccuracy(data, dataType),
      confidence: this.calculateAccuracyConfidence(data),
      temporal_decay_factor: 0.95,
      last_updated: new Date(),
      measurement_method: "business_rule_validation",
      threshold_critical: 0.8,
      threshold_warning: 0.9,
    };

    // Consistency dimension
    dimensions.consistency = {
      name: "consistency",
      weight: weights.consistency,
      score: this.measureConsistency(data),
      confidence: this.calculateConsistencyConfidence(data),
      temporal_decay_factor: 0.96,
      last_updated: new Date(),
      measurement_method: "cross_field_consistency",
      threshold_critical: 0.75,
      threshold_warning: 0.85,
    };

    // Timeliness dimension
    dimensions.timeliness = {
      name: "timeliness",
      weight: weights.timeliness,
      score: this.measureTimeliness(data),
      confidence: this.calculateTimelinessConfidence(data),
      temporal_decay_factor: 0.9,
      last_updated: new Date(),
      measurement_method: "data_freshness_check",
      threshold_critical: 0.7,
      threshold_warning: 0.85,
    };

    // Validity dimension
    dimensions.validity = {
      name: "validity",
      weight: weights.validity,
      score: this.measureValidity(data, dataType),
      confidence: this.calculateValidityConfidence(data),
      temporal_decay_factor: 0.97,
      last_updated: new Date(),
      measurement_method: "format_pattern_validation",
      threshold_critical: 0.85,
      threshold_warning: 0.95,
    };

    // Uniqueness dimension
    dimensions.uniqueness = {
      name: "uniqueness",
      weight: weights.uniqueness,
      score: this.measureUniqueness(data),
      confidence: this.calculateUniquenessConfidence(data),
      temporal_decay_factor: 0.99,
      last_updated: new Date(),
      measurement_method: "duplicate_detection",
      threshold_critical: 0.9,
      threshold_warning: 0.95,
    };

    return dimensions;
  }

  /**
   * Calculate confidence factors
   */
  private async calculateConfidenceFactors(
    data: any[],
    sourceName: string,
    sourceReliability: DataSourceReliability
  ): Promise<ConfidenceFactors> {
    return {
      data_volume_factor: this.calculateDataVolumeFactor(data.length),
      data_freshness_factor: this.calculateDataFreshnessFactor(data),
      source_reliability_factor: sourceReliability.reliability_coefficient,
      validation_coverage_factor: this.calculateValidationCoverageFactor(data),
      cross_validation_factor:
        await this.calculateCrossValidationFactor(sourceName),
      temporal_stability_factor:
        this.calculateTemporalStabilityFactor(sourceName),
    };
  }

  /**
   * Assess source reliability
   */
  private async assessSourceReliability(
    sourceName: string
  ): Promise<DataSourceReliability> {
    const cached = this.sourceReliabilityCache.get(sourceName);
    if (cached && this.isReliabilityAssessmentCurrent(cached)) {
      return cached;
    }

    // Calculate reliability metrics
    const reliability: DataSourceReliability = {
      source_id: sourceName,
      historical_accuracy: await this.calculateHistoricalAccuracy(sourceName),
      uptime_percentage: await this.calculateUptimePercentage(sourceName),
      data_consistency_score:
        await this.calculateDataConsistencyScore(sourceName),
      update_frequency_score:
        await this.calculateUpdateFrequencyScore(sourceName),
      validation_failures: await this.getValidationFailureCount(sourceName),
      reliability_coefficient: 0,
      last_assessment: new Date(),
    };

    // Calculate overall reliability coefficient
    reliability.reliability_coefficient =
      this.calculateReliabilityCoefficient(reliability);

    this.sourceReliabilityCache.set(sourceName, reliability);
    return reliability;
  }

  // Measurement methods
  private measureCompleteness(data: any[]): number {
    if (data.length === 0) return 0;

    let totalFields = 0;
    let completeFields = 0;

    data.forEach(record => {
      const fields = Object.keys(record);
      totalFields += fields.length;

      fields.forEach(field => {
        const value = record[field];
        if (value !== null && value !== undefined && value !== "") {
          completeFields++;
        }
      });
    });

    return totalFields > 0 ? completeFields / totalFields : 0;
  }

  private async measureAccuracy(
    data: any[],
    dataType: string
  ): Promise<number> {
    // Implement business rule validation based on data type
    let accurateRecords = 0;

    for (const record of data) {
      if (await this.validateBusinessRules(record, dataType)) {
        accurateRecords++;
      }
    }

    return data.length > 0 ? accurateRecords / data.length : 0;
  }

  private measureConsistency(data: any[]): number {
    if (data.length < 2) return 1;

    // Check format consistency across records
    const formatPatterns = new Map<string, Set<string>>();

    data.forEach(record => {
      Object.entries(record).forEach(([field, value]) => {
        if (!formatPatterns.has(field)) {
          formatPatterns.set(field, new Set());
        }
        formatPatterns.get(field)!.add(typeof value);
      });
    });

    // Calculate consistency score
    let consistentFields = 0;
    let totalFields = 0;

    formatPatterns.forEach((types, field) => {
      totalFields++;
      if (types.size === 1) {
        consistentFields++;
      }
    });

    return totalFields > 0 ? consistentFields / totalFields : 0;
  }

  private measureTimeliness(data: any[]): number {
    if (data.length === 0) return 0;

    const now = Date.now();
    let timelyRecords = 0;
    const timelinessThreshold = 24 * 60 * 60 * 1000; // 24 hours

    data.forEach(record => {
      const timestamps = this.extractTimestamps(record);
      const latestTimestamp = Math.max(...timestamps);

      if (now - latestTimestamp <= timelinessThreshold) {
        timelyRecords++;
      }
    });

    return timelyRecords / data.length;
  }

  private measureValidity(data: any[], dataType: string): number {
    if (data.length === 0) return 0;

    let validRecords = 0;

    data.forEach(record => {
      if (this.validateDataFormat(record, dataType)) {
        validRecords++;
      }
    });

    return validRecords / data.length;
  }

  private measureUniqueness(data: any[]): number {
    if (data.length === 0) return 1;

    const recordHashes = new Set();
    let uniqueRecords = 0;

    data.forEach(record => {
      const hash = this.generateRecordHash(record);
      if (!recordHashes.has(hash)) {
        recordHashes.add(hash);
        uniqueRecords++;
      }
    });

    return uniqueRecords / data.length;
  }

  // Helper methods for confidence calculation
  private calculateDataVolumeFactor(dataLength: number): number {
    // More data generally means higher confidence
    if (dataLength === 0) return 0;
    if (dataLength < 10) return 0.3;
    if (dataLength < 100) return 0.6;
    if (dataLength < 1000) return 0.8;
    return 0.95;
  }

  private calculateDataFreshnessFactor(data: any[]): number {
    if (data.length === 0) return 0;

    const now = Date.now();
    const timestamps = data.flatMap(record => this.extractTimestamps(record));

    if (timestamps.length === 0) return 0.5; // No timestamp data

    const avgAge =
      timestamps.reduce((sum, ts) => sum + (now - ts), 0) / timestamps.length;
    const maxFreshAge = 24 * 60 * 60 * 1000; // 24 hours

    return Math.max(0, Math.min(1, 1 - avgAge / maxFreshAge));
  }

  private calculateValidationCoverageFactor(data: any[]): number {
    // Simplified validation coverage calculation
    return 0.8; // Placeholder - should be calculated based on validation rules coverage
  }

  private async calculateCrossValidationFactor(
    sourceName: string
  ): Promise<number> {
    // Check if data can be cross-validated with other sources
    return 0.7; // Placeholder
  }

  private calculateTemporalStabilityFactor(sourceName: string): number {
    const history = this.qualityHistory.get(sourceName) || [];
    if (history.length < 3) return 0.5;

    // Calculate coefficient of variation for quality scores
    const scores = history.slice(-10).map(h => h.overall_score);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance =
      scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
      scores.length;
    const stdDev = Math.sqrt(variance);

    const coefficientOfVariation = mean > 0 ? stdDev / mean : 1;
    return Math.max(0, 1 - coefficientOfVariation);
  }

  // Additional helper methods would be implemented here...
  private async validateBusinessRules(
    record: any,
    dataType: string
  ): Promise<boolean> {
    // Implement specific business rule validation
    return true; // Placeholder
  }

  private extractTimestamps(record: any): number[] {
    const timestamps: number[] = [];
    Object.entries(record).forEach(([key, value]) => {
      if (key.includes("date") || key.includes("time") || key.includes("_at")) {
        const timestamp = new Date(value as string).getTime();
        if (!isNaN(timestamp)) {
          timestamps.push(timestamp);
        }
      }
    });
    return timestamps.length > 0 ? timestamps : [Date.now()];
  }

  private validateDataFormat(record: any, dataType: string): boolean {
    // Implement format validation based on data type
    return true; // Placeholder
  }

  private generateRecordHash(record: any): string {
    return JSON.stringify(record);
  }

  private calculateWeightedOverallScore(
    dimensions: Record<string, DataQualityDimension>,
    confidenceFactors: ConfidenceFactors,
    sourceReliability: DataSourceReliability
  ): number {
    let weightedSum = 0;
    let totalWeight = 0;

    Object.values(dimensions).forEach(dimension => {
      const adjustedScore =
        dimension.score *
        dimension.confidence *
        sourceReliability.reliability_coefficient;
      weightedSum += adjustedScore * dimension.weight;
      totalWeight += dimension.weight;
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  private calculateOverallConfidence(
    confidenceFactors: ConfidenceFactors
  ): number {
    const factors = Object.values(confidenceFactors);
    return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
  }

  // Additional methods for reliability assessment, trend analysis, recommendations, etc.
  private calculateReliabilityCoefficient(
    reliability: DataSourceReliability
  ): number {
    const weights = {
      historical_accuracy: 0.3,
      uptime_percentage: 0.25,
      data_consistency_score: 0.25,
      update_frequency_score: 0.15,
      validation_failures: 0.05,
    };

    const failurePenalty = Math.max(
      0,
      1 - reliability.validation_failures * 0.01
    );

    return (
      (reliability.historical_accuracy * weights.historical_accuracy +
        reliability.uptime_percentage * weights.uptime_percentage +
        reliability.data_consistency_score * weights.data_consistency_score +
        reliability.update_frequency_score * weights.update_frequency_score) *
      failurePenalty
    );
  }

  private async calculateHistoricalAccuracy(
    sourceName: string
  ): Promise<number> {
    // Placeholder - should query historical accuracy data
    return 0.85;
  }

  private async calculateUptimePercentage(sourceName: string): Promise<number> {
    // Placeholder - should query uptime data
    return 0.99;
  }

  private async calculateDataConsistencyScore(
    sourceName: string
  ): Promise<number> {
    // Placeholder - should calculate consistency over time
    return 0.9;
  }

  private async calculateUpdateFrequencyScore(
    sourceName: string
  ): Promise<number> {
    // Placeholder - should assess update frequency patterns
    return 0.95;
  }

  private async getValidationFailureCount(sourceName: string): Promise<number> {
    // Placeholder - should query validation failure history
    return 2;
  }

  private isReliabilityAssessmentCurrent(
    reliability: DataSourceReliability
  ): boolean {
    const now = Date.now();
    const assessmentAge = now - reliability.last_assessment.getTime();
    const maxAge = 4 * 60 * 60 * 1000; // 4 hours
    return assessmentAge < maxAge;
  }

  private async assessQualityTrend(
    sourceName: string,
    currentScore: number
  ): Promise<{
    direction: "improving" | "stable" | "declining";
    rate_of_change: number;
    forecast_next_period: number;
  }> {
    const history = this.qualityHistory.get(sourceName) || [];
    if (history.length < 3) {
      return {
        direction: "stable",
        rate_of_change: 0,
        forecast_next_period: currentScore,
      };
    }

    const recentScores = history.slice(-5).map(h => h.overall_score);
    const avgRecentScore =
      recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;

    const rateOfChange = (currentScore - avgRecentScore) / avgRecentScore;

    let direction: "improving" | "stable" | "declining" = "stable";
    if (rateOfChange > 0.05) direction = "improving";
    else if (rateOfChange < -0.05) direction = "declining";

    const forecastNextPeriod = currentScore + rateOfChange * currentScore;

    return {
      direction,
      rate_of_change: rateOfChange,
      forecast_next_period: Math.max(0, Math.min(1, forecastNextPeriod)),
    };
  }

  private generateQualityRecommendations(
    dimensions: Record<string, DataQualityDimension>,
    confidenceFactors: ConfidenceFactors,
    sourceReliability: DataSourceReliability
  ): QualityRecommendation[] {
    const recommendations: QualityRecommendation[] = [];

    // Check low-scoring dimensions
    Object.values(dimensions).forEach(dimension => {
      if (dimension.score < dimension.threshold_critical) {
        recommendations.push({
          priority: "critical",
          category: "data",
          description: `Critical issue with ${dimension.name}: score ${(dimension.score * 100).toFixed(1)}% below threshold ${(dimension.threshold_critical * 100).toFixed(1)}%`,
          impact_score:
            (dimension.threshold_critical - dimension.score) *
            dimension.weight *
            100,
          implementation_effort: 8,
          expected_improvement:
            (dimension.threshold_critical - dimension.score) * 100,
        });
      } else if (dimension.score < dimension.threshold_warning) {
        recommendations.push({
          priority: "high",
          category: "data",
          description: `Warning for ${dimension.name}: score ${(dimension.score * 100).toFixed(1)}% below warning threshold ${(dimension.threshold_warning * 100).toFixed(1)}%`,
          impact_score:
            (dimension.threshold_warning - dimension.score) *
            dimension.weight *
            100,
          implementation_effort: 5,
          expected_improvement:
            (dimension.threshold_warning - dimension.score) * 100,
        });
      }
    });

    // Check confidence factors
    if (confidenceFactors.data_volume_factor < 0.5) {
      recommendations.push({
        priority: "medium",
        category: "data",
        description:
          "Low data volume affecting confidence. Consider increasing sample size.",
        impact_score: 30,
        implementation_effort: 3,
        expected_improvement: 25,
      });
    }

    // Check source reliability
    if (sourceReliability.reliability_coefficient < 0.7) {
      recommendations.push({
        priority: "high",
        category: "technical",
        description:
          "Source reliability below acceptable threshold. Review data source configuration and monitoring.",
        impact_score: 40,
        implementation_effort: 7,
        expected_improvement: 35,
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private assessQualityRisks(
    dimensions: Record<string, DataQualityDimension>,
    confidenceFactors: ConfidenceFactors,
    sourceReliability: DataSourceReliability
  ): RiskAssessment {
    const riskFactors: Array<{
      factor: string;
      impact: number;
      probability: number;
      mitigation_strategy: string;
    }> = [];

    // Data quality risks
    Object.values(dimensions).forEach(dimension => {
      if (dimension.score < 0.8) {
        riskFactors.push({
          factor: `Low ${dimension.name} score`,
          impact: dimension.weight * 10,
          probability: 1 - dimension.score,
          mitigation_strategy: `Implement ${dimension.name} improvement processes`,
        });
      }
    });

    // Source reliability risks
    if (sourceReliability.reliability_coefficient < 0.8) {
      riskFactors.push({
        factor: "Source reliability issues",
        impact: 8,
        probability: 1 - sourceReliability.reliability_coefficient,
        mitigation_strategy: "Implement redundant data sources and validation",
      });
    }

    // Confidence risks
    const avgConfidence = this.calculateOverallConfidence(confidenceFactors);
    if (avgConfidence < 0.7) {
      riskFactors.push({
        factor: "Low confidence in data quality assessment",
        impact: 6,
        probability: 1 - avgConfidence,
        mitigation_strategy:
          "Increase validation coverage and cross-validation",
      });
    }

    const overallRiskScore =
      riskFactors.reduce(
        (sum, risk) => sum + risk.impact * risk.probability,
        0
      ) / riskFactors.length;

    return {
      overall_risk_score: overallRiskScore,
      risk_factors: riskFactors,
      compliance_risks: this.assessComplianceRisks(dimensions),
      business_impact_risks: this.assessBusinessImpactRisks(
        dimensions,
        sourceReliability
      ),
    };
  }

  private assessComplianceRisks(
    dimensions: Record<string, DataQualityDimension>
  ): string[] {
    const risks: string[] = [];

    if (dimensions.completeness?.score < 0.9) {
      risks.push("GDPR compliance risk due to incomplete data");
    }

    if (dimensions.accuracy?.score < 0.85) {
      risks.push("Regulatory reporting accuracy compliance risk");
    }

    return risks;
  }

  private assessBusinessImpactRisks(
    dimensions: Record<string, DataQualityDimension>,
    sourceReliability: DataSourceReliability
  ): string[] {
    const risks: string[] = [];

    if (dimensions.timeliness?.score < 0.8) {
      risks.push("Delayed decision-making due to stale data");
    }

    if (sourceReliability.reliability_coefficient < 0.7) {
      risks.push("Business continuity risk from unreliable data sources");
    }

    return risks;
  }

  private storeQualityHistory(
    sourceName: string,
    qualityScore: QualityScore
  ): void {
    if (!this.qualityHistory.has(sourceName)) {
      this.qualityHistory.set(sourceName, []);
    }

    const history = this.qualityHistory.get(sourceName)!;
    history.push(qualityScore);

    // Keep only last 50 entries
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
  }

  // Confidence calculation methods for each dimension
  private calculateCompletenessConfidence(data: any[]): number {
    // Higher confidence with more data and consistent field presence
    const volumeFactor = this.calculateDataVolumeFactor(data.length);
    const consistencyFactor = this.calculateFieldConsistencyFactor(data);
    return (volumeFactor + consistencyFactor) / 2;
  }

  private calculateAccuracyConfidence(data: any[]): number {
    // Confidence based on validation rule coverage
    return 0.8; // Placeholder
  }

  private calculateConsistencyConfidence(data: any[]): number {
    // Higher confidence with more data points for comparison
    return Math.min(0.95, 0.5 + (data.length / 1000) * 0.45);
  }

  private calculateTimelinessConfidence(data: any[]): number {
    // Confidence based on timestamp availability and consistency
    const timestampCoverage = this.calculateTimestampCoverage(data);
    return timestampCoverage;
  }

  private calculateValidityConfidence(data: any[]): number {
    // Confidence based on validation rule coverage
    return 0.85; // Placeholder
  }

  private calculateUniquenessConfidence(data: any[]): number {
    // Higher confidence with complete data for uniqueness assessment
    return Math.min(0.95, 0.7 + (data.length / 500) * 0.25);
  }

  private calculateFieldConsistencyFactor(data: any[]): number {
    if (data.length === 0) return 0;

    const fieldCounts = new Map<string, number>();
    data.forEach(record => {
      Object.keys(record).forEach(field => {
        fieldCounts.set(field, (fieldCounts.get(field) || 0) + 1);
      });
    });

    const consistentFields = Array.from(fieldCounts.values()).filter(
      count => count === data.length
    ).length;
    const totalUniqueFields = fieldCounts.size;

    return totalUniqueFields > 0 ? consistentFields / totalUniqueFields : 0;
  }

  private calculateTimestampCoverage(data: any[]): number {
    if (data.length === 0) return 0;

    let recordsWithTimestamps = 0;
    data.forEach(record => {
      const timestamps = this.extractTimestamps(record);
      if (timestamps.length > 0) {
        recordsWithTimestamps++;
      }
    });

    return recordsWithTimestamps / data.length;
  }
}
