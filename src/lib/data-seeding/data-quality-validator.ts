/**
 * Analytics Data Quality Validator
 *
 * Comprehensive data validation and quality control system
 * for analytics data seeding pipelines.
 */

// ================================
// 🔍 VALIDATION INTERFACES
// ================================

export interface DataQualityValidator {
  validateDataset<T>(
    data: T[],
    config: ValidationConfig
  ): Promise<ValidationResult>;
  validateRecord<T>(
    record: T,
    rules: ValidationRule[]
  ): Promise<RecordValidationResult>;
  generateQualityReport(results: ValidationResult[]): Promise<QualityReport>;
}

export interface ValidationConfig {
  rules: ValidationRule[];
  thresholds: QualityThresholds;
  samplingRate: number;
  enableLogging: boolean;
  alerting: AlertingConfig;
}

export interface ValidationRule {
  id: string;
  name: string;
  type: ValidationRuleType;
  field?: string;
  condition: ValidationCondition;
  severity: "critical" | "high" | "medium" | "low";
  errorMessage: string;
  remediationSuggestion?: string;
}

export type ValidationRuleType =
  | "completeness"
  | "accuracy"
  | "consistency"
  | "validity"
  | "uniqueness"
  | "freshness"
  | "range"
  | "format"
  | "business";

export interface ValidationCondition {
  operator:
    | "eq"
    | "ne"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "in"
    | "nin"
    | "regex"
    | "custom";
  value?: any;
  customFunction?: (value: any, record?: any) => boolean;
}

export interface QualityThresholds {
  completeness: number;
  accuracy: number;
  consistency: number;
  validity: number;
  uniqueness: number;
  freshness: number;
}

export interface ValidationResult {
  datasetId: string;
  timestamp: Date;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  overallQualityScore: number;
  dimensionScores: QualityDimensionScores;
  violations: DataQualityViolation[];
  recommendations: string[];
  passed: boolean;
}

export interface QualityDimensionScores {
  completeness: number;
  accuracy: number;
  consistency: number;
  validity: number;
  uniqueness: number;
  freshness: number;
}

export interface DataQualityViolation {
  ruleId: string;
  ruleName: string;
  field: string;
  recordIndex?: number;
  violationType: ValidationRuleType;
  severity: string;
  actualValue: any;
  expectedValue?: any;
  message: string;
  remediation?: string;
}

export interface RecordValidationResult {
  recordIndex: number;
  isValid: boolean;
  violations: DataQualityViolation[];
  qualityScore: number;
}

export interface QualityReport {
  reportId: string;
  generatedAt: Date;
  timeRange: { start: Date; end: Date };
  summary: QualityReportSummary;
  trendAnalysis: QualityTrendAnalysis;
  recommendations: QualityRecommendation[];
  detailedFindings: DetailedFinding[];
}

export interface QualityReportSummary {
  totalDatasets: number;
  totalRecords: number;
  overallQualityScore: number;
  qualityTrend: "improving" | "stable" | "declining";
  criticalIssues: number;
  highPriorityIssues: number;
}

// ================================
// 🏭 ANALYTICS DATA QUALITY VALIDATOR
// ================================

export class AnalyticsDataQualityValidator implements DataQualityValidator {
  private config: ValidationConfig;
  private validationHistory: Map<string, ValidationResult[]> = new Map();

  constructor(config: ValidationConfig) {
    this.config = config;
  }

  async validateDataset<T>(
    data: T[],
    config: ValidationConfig
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    const datasetId = `dataset-${Date.now()}`;

    console.log(
      `🔍 Starting data quality validation for ${data.length} records`
    );

    // Sample data if configured
    const sampleData = this.sampleData(data, config.samplingRate);

    // Initialize validation result
    const result: ValidationResult = {
      datasetId,
      timestamp: new Date(),
      totalRecords: data.length,
      validRecords: 0,
      invalidRecords: 0,
      overallQualityScore: 0,
      dimensionScores: {
        completeness: 0,
        accuracy: 0,
        consistency: 0,
        validity: 0,
        uniqueness: 0,
        freshness: 0,
      },
      violations: [],
      recommendations: [],
      passed: false,
    };

    // Validate individual records
    const recordResults = await Promise.all(
      sampleData.map((record, index) =>
        this.validateRecord(record, config.rules, index)
      )
    );

    // Aggregate results
    result.validRecords = recordResults.filter(r => r.isValid).length;
    result.invalidRecords = recordResults.filter(r => !r.isValid).length;

    // Collect all violations
    result.violations = recordResults.flatMap(r => r.violations);

    // Calculate dimension scores
    result.dimensionScores = await this.calculateDimensionScores(
      sampleData,
      config.rules
    );

    // Calculate overall quality score
    result.overallQualityScore = this.calculateOverallQualityScore(
      result.dimensionScores
    );

    // Determine if validation passed
    result.passed = this.evaluateQualityThresholds(
      result.dimensionScores,
      config.thresholds
    );

    // Generate recommendations
    result.recommendations = this.generateRecommendations(result);

    // Store validation history
    this.storeValidationResult(datasetId, result);

    const processingTime = Date.now() - startTime;
    console.log(`✅ Data quality validation completed in ${processingTime}ms`);
    console.log(
      `📊 Quality Score: ${result.overallQualityScore.toFixed(2)}% (${result.validRecords}/${result.totalRecords} valid)`
    );

    return result;
  }

  async validateRecord<T>(
    record: T,
    rules: ValidationRule[],
    recordIndex: number = 0
  ): Promise<RecordValidationResult> {
    const violations: DataQualityViolation[] = [];

    for (const rule of rules) {
      const violation = await this.evaluateRule(record, rule, recordIndex);
      if (violation) {
        violations.push(violation);
      }
    }

    const qualityScore = Math.max(0, 100 - violations.length * 10);

    return {
      recordIndex,
      isValid: violations.length === 0,
      violations,
      qualityScore,
    };
  }

  private async evaluateRule<T>(
    record: T,
    rule: ValidationRule,
    recordIndex: number
  ): Promise<DataQualityViolation | null> {
    const fieldValue = rule.field ? (record as any)[rule.field] : record;
    let isValid = false;

    switch (rule.condition.operator) {
      case "eq":
        isValid = fieldValue === rule.condition.value;
        break;
      case "ne":
        isValid = fieldValue !== rule.condition.value;
        break;
      case "gt":
        isValid = Number(fieldValue) > rule.condition.value;
        break;
      case "gte":
        isValid = Number(fieldValue) >= rule.condition.value;
        break;
      case "lt":
        isValid = Number(fieldValue) < rule.condition.value;
        break;
      case "lte":
        isValid = Number(fieldValue) <= rule.condition.value;
        break;
      case "in":
        isValid =
          Array.isArray(rule.condition.value) &&
          rule.condition.value.includes(fieldValue);
        break;
      case "nin":
        isValid =
          Array.isArray(rule.condition.value) &&
          !rule.condition.value.includes(fieldValue);
        break;
      case "regex":
        isValid = new RegExp(rule.condition.value).test(String(fieldValue));
        break;
      case "custom":
        isValid = rule.condition.customFunction
          ? rule.condition.customFunction(fieldValue, record)
          : false;
        break;
    }

    if (!isValid) {
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        field: rule.field || "record",
        recordIndex,
        violationType: rule.type,
        severity: rule.severity,
        actualValue: fieldValue,
        expectedValue: rule.condition.value,
        message: rule.errorMessage,
        remediation: rule.remediationSuggestion,
      };
    }

    return null;
  }

  private sampleData<T>(data: T[], samplingRate: number): T[] {
    if (samplingRate >= 1.0) return data;

    const sampleSize = Math.ceil(data.length * samplingRate);
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, sampleSize);
  }

  private async calculateDimensionScores<T>(
    data: T[],
    rules: ValidationRule[]
  ): Promise<QualityDimensionScores> {
    const dimensionResults = {
      completeness: await this.calculateCompletenessScore(data, rules),
      accuracy: await this.calculateAccuracyScore(data, rules),
      consistency: await this.calculateConsistencyScore(data, rules),
      validity: await this.calculateValidityScore(data, rules),
      uniqueness: await this.calculateUniquenessScore(data, rules),
      freshness: await this.calculateFreshnessScore(data, rules),
    };

    return dimensionResults;
  }

  private async calculateCompletenessScore<T>(
    data: T[],
    rules: ValidationRule[]
  ): Promise<number> {
    const completenessRules = rules.filter(
      rule => rule.type === "completeness"
    );
    if (completenessRules.length === 0) return 100;

    let totalScore = 0;
    for (const rule of completenessRules) {
      const fieldName = rule.field;
      if (!fieldName) continue;

      const nonNullCount = data.filter(record => {
        const value = (record as any)[fieldName];
        return value !== null && value !== undefined && value !== "";
      }).length;

      const score = (nonNullCount / data.length) * 100;
      totalScore += score;
    }

    return completenessRules.length > 0
      ? totalScore / completenessRules.length
      : 100;
  }

  private async calculateAccuracyScore<T>(
    data: T[],
    rules: ValidationRule[]
  ): Promise<number> {
    const accuracyRules = rules.filter(rule => rule.type === "accuracy");
    if (accuracyRules.length === 0) return 95; // Default high score

    let validCount = 0;
    let totalChecks = 0;

    for (const record of data) {
      for (const rule of accuracyRules) {
        totalChecks++;
        const violation = await this.evaluateRule(record, rule, 0);
        if (!violation) validCount++;
      }
    }

    return totalChecks > 0 ? (validCount / totalChecks) * 100 : 95;
  }

  private async calculateConsistencyScore<T>(
    data: T[],
    rules: ValidationRule[]
  ): Promise<number> {
    const consistencyRules = rules.filter(rule => rule.type === "consistency");
    if (consistencyRules.length === 0) return 90; // Default score

    // Simplified consistency check - check for data type consistency
    let consistentRecords = 0;

    for (const record of data) {
      let isConsistent = true;

      // Check if all numeric fields contain numbers
      Object.entries(record as any).forEach(([key, value]) => {
        if (
          key.includes("amount") ||
          key.includes("count") ||
          key.includes("score")
        ) {
          if (value !== null && value !== undefined && isNaN(Number(value))) {
            isConsistent = false;
          }
        }
      });

      if (isConsistent) consistentRecords++;
    }

    return (consistentRecords / data.length) * 100;
  }

  private async calculateValidityScore<T>(
    data: T[],
    rules: ValidationRule[]
  ): Promise<number> {
    const validityRules = rules.filter(rule => rule.type === "validity");
    if (validityRules.length === 0) return 92; // Default score

    let validCount = 0;
    let totalChecks = 0;

    for (const record of data) {
      for (const rule of validityRules) {
        totalChecks++;
        const violation = await this.evaluateRule(record, rule, 0);
        if (!violation) validCount++;
      }
    }

    return totalChecks > 0 ? (validCount / totalChecks) * 100 : 92;
  }

  private async calculateUniquenessScore<T>(
    data: T[],
    rules: ValidationRule[]
  ): Promise<number> {
    const uniquenessRules = rules.filter(rule => rule.type === "uniqueness");
    if (uniquenessRules.length === 0) return 98; // Default high score

    let totalUniqueScore = 0;

    for (const rule of uniquenessRules) {
      const fieldName = rule.field;
      if (!fieldName) continue;

      const values = data.map(record => (record as any)[fieldName]);
      const uniqueValues = new Set(values);
      const uniquenessRatio = uniqueValues.size / values.length;
      totalUniqueScore += uniquenessRatio * 100;
    }

    return uniquenessRules.length > 0
      ? totalUniqueScore / uniquenessRules.length
      : 98;
  }

  private async calculateFreshnessScore<T>(
    data: T[],
    rules: ValidationRule[]
  ): Promise<number> {
    const freshnessRules = rules.filter(rule => rule.type === "freshness");
    if (freshnessRules.length === 0) return 85; // Default score

    const now = new Date();
    let totalFreshnessScore = 0;

    for (const record of data) {
      // Look for timestamp fields
      const timestampFields = ["timestamp", "created_at", "updated_at", "date"];
      let recordFreshness = 0;

      for (const field of timestampFields) {
        if ((record as any)[field]) {
          const recordDate = new Date((record as any)[field]);
          const ageInHours =
            (now.getTime() - recordDate.getTime()) / (1000 * 60 * 60);

          // Freshness decreases with age (24 hours = 100%, 7 days = 50%, 30 days = 10%)
          if (ageInHours <= 24) recordFreshness = 100;
          else if (ageInHours <= 168)
            recordFreshness = 50; // 7 days
          else if (ageInHours <= 720)
            recordFreshness = 10; // 30 days
          else recordFreshness = 0;
          break;
        }
      }

      totalFreshnessScore += recordFreshness;
    }

    return data.length > 0 ? totalFreshnessScore / data.length : 85;
  }

  private calculateOverallQualityScore(
    dimensions: QualityDimensionScores
  ): number {
    const weights = {
      completeness: 0.25,
      accuracy: 0.25,
      consistency: 0.15,
      validity: 0.15,
      uniqueness: 0.1,
      freshness: 0.1,
    };

    return Object.entries(dimensions).reduce((total, [dimension, score]) => {
      const weight = weights[dimension as keyof typeof weights] || 0;
      return total + score * weight;
    }, 0);
  }

  private evaluateQualityThresholds(
    scores: QualityDimensionScores,
    thresholds: QualityThresholds
  ): boolean {
    return Object.entries(scores).every(([dimension, score]) => {
      const threshold = thresholds[dimension as keyof QualityThresholds];
      return score >= threshold * 100; // Convert to percentage
    });
  }

  private generateRecommendations(result: ValidationResult): string[] {
    const recommendations: string[] = [];

    // Check each dimension and provide specific recommendations
    if (result.dimensionScores.completeness < 95) {
      recommendations.push(
        "Improve data completeness by implementing required field validation"
      );
    }

    if (result.dimensionScores.accuracy < 95) {
      recommendations.push(
        "Enhance data accuracy through improved validation rules and data entry controls"
      );
    }

    if (result.dimensionScores.consistency < 90) {
      recommendations.push(
        "Standardize data formats and implement consistent data type validations"
      );
    }

    if (result.dimensionScores.validity < 90) {
      recommendations.push(
        "Strengthen business rule validation and data format checks"
      );
    }

    if (result.dimensionScores.uniqueness < 95) {
      recommendations.push(
        "Implement duplicate detection and prevention mechanisms"
      );
    }

    if (result.dimensionScores.freshness < 80) {
      recommendations.push(
        "Increase data refresh frequency and implement real-time updates"
      );
    }

    // Add specific recommendations based on violations
    const criticalViolations = result.violations.filter(
      v => v.severity === "critical"
    );
    if (criticalViolations.length > 0) {
      recommendations.push(
        `Address ${criticalViolations.length} critical data quality issues immediately`
      );
    }

    return recommendations;
  }

  private storeValidationResult(
    datasetId: string,
    result: ValidationResult
  ): void {
    if (!this.validationHistory.has(datasetId)) {
      this.validationHistory.set(datasetId, []);
    }

    const history = this.validationHistory.get(datasetId)!;
    history.push(result);

    // Keep only last 100 results
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }

  async generateQualityReport(
    results: ValidationResult[]
  ): Promise<QualityReport> {
    const reportId = `qr-${Date.now()}`;
    const now = new Date();

    // Calculate summary statistics
    const totalRecords = results.reduce((sum, r) => sum + r.totalRecords, 0);
    const totalDatasets = results.length;
    const averageQualityScore =
      results.reduce((sum, r) => sum + r.overallQualityScore, 0) /
      results.length;

    const criticalIssues = results.reduce(
      (sum, r) =>
        sum + r.violations.filter(v => v.severity === "critical").length,
      0
    );
    const highPriorityIssues = results.reduce(
      (sum, r) => sum + r.violations.filter(v => v.severity === "high").length,
      0
    );

    const report: QualityReport = {
      reportId,
      generatedAt: now,
      timeRange: {
        start: new Date(Math.min(...results.map(r => r.timestamp.getTime()))),
        end: new Date(Math.max(...results.map(r => r.timestamp.getTime()))),
      },
      summary: {
        totalDatasets,
        totalRecords,
        overallQualityScore: averageQualityScore,
        qualityTrend: this.calculateQualityTrend(results),
        criticalIssues,
        highPriorityIssues,
      },
      trendAnalysis: await this.generateTrendAnalysis(results),
      recommendations: await this.generateGlobalRecommendations(results),
      detailedFindings: await this.generateDetailedFindings(results),
    };

    console.log(
      `📋 Generated quality report ${reportId} covering ${totalDatasets} datasets`
    );
    return report;
  }

  private calculateQualityTrend(
    results: ValidationResult[]
  ): "improving" | "stable" | "declining" {
    if (results.length < 2) return "stable";

    const sortedResults = results.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    const firstHalf = sortedResults.slice(
      0,
      Math.floor(sortedResults.length / 2)
    );
    const secondHalf = sortedResults.slice(
      Math.floor(sortedResults.length / 2)
    );

    const firstAvg =
      firstHalf.reduce((sum, r) => sum + r.overallQualityScore, 0) /
      firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, r) => sum + r.overallQualityScore, 0) /
      secondHalf.length;

    const improvement = secondAvg - firstAvg;

    if (improvement > 2) return "improving";
    if (improvement < -2) return "declining";
    return "stable";
  }

  private async generateTrendAnalysis(
    results: ValidationResult[]
  ): Promise<QualityTrendAnalysis> {
    // Simplified trend analysis
    return {
      timeSeriesData: results.map(r => ({
        timestamp: r.timestamp,
        qualityScore: r.overallQualityScore,
      })),
      trendDirection: this.calculateQualityTrend(results),
      volatility: this.calculateQualityVolatility(results),
      seasonality: await this.detectSeasonality(results),
    };
  }

  private calculateQualityVolatility(results: ValidationResult[]): number {
    if (results.length < 2) return 0;

    const scores = results.map(r => r.overallQualityScore);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance =
      scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
      scores.length;

    return Math.sqrt(variance);
  }

  private async detectSeasonality(results: ValidationResult[]): Promise<any> {
    // Simplified seasonality detection
    return {
      hasSeasonality: false,
      period: null,
      strength: 0,
    };
  }

  private async generateGlobalRecommendations(
    results: ValidationResult[]
  ): Promise<QualityRecommendation[]> {
    const recommendations: QualityRecommendation[] = [];

    // Analyze common patterns across all results
    const allViolations = results.flatMap(r => r.violations);
    const violationsByType = this.groupViolationsByType(allViolations);

    Object.entries(violationsByType).forEach(([type, violations]) => {
      if (violations.length > 10) {
        // Threshold for common issues
        recommendations.push({
          priority: "high",
          category: type as ValidationRuleType,
          title: `Address Common ${type} Issues`,
          description: `${violations.length} violations of type ${type} detected across datasets`,
          actionItems: [
            `Review and strengthen ${type} validation rules`,
            `Implement preventive measures for ${type} issues`,
            `Monitor ${type} metrics more closely`,
          ],
          estimatedImpact: "high",
        });
      }
    });

    return recommendations;
  }

  private groupViolationsByType(
    violations: DataQualityViolation[]
  ): Record<string, DataQualityViolation[]> {
    return violations.reduce(
      (groups, violation) => {
        const type = violation.violationType;
        if (!groups[type]) {
          groups[type] = [];
        }
        groups[type].push(violation);
        return groups;
      },
      {} as Record<string, DataQualityViolation[]>
    );
  }

  private async generateDetailedFindings(
    results: ValidationResult[]
  ): Promise<DetailedFinding[]> {
    const findings: DetailedFinding[] = [];

    // Top violation types
    const allViolations = results.flatMap(r => r.violations);
    const violationsByType = this.groupViolationsByType(allViolations);

    Object.entries(violationsByType).forEach(([type, violations]) => {
      findings.push({
        category: type as ValidationRuleType,
        title: `${type} Violations Analysis`,
        description: `Analysis of ${violations.length} ${type} violations`,
        severity: violations.some(v => v.severity === "critical")
          ? "critical"
          : "high",
        occurrences: violations.length,
        affectedFields: [...new Set(violations.map(v => v.field))],
        examples: violations.slice(0, 3).map(v => v.message),
      });
    });

    return findings;
  }

  // Public utility methods
  getValidationHistory(datasetId: string): ValidationResult[] {
    return this.validationHistory.get(datasetId) || [];
  }

  async exportQualityMetrics(): Promise<any> {
    const allResults = Array.from(this.validationHistory.values()).flat();

    return {
      exportDate: new Date(),
      totalValidations: allResults.length,
      averageQualityScore:
        allResults.reduce((sum, r) => sum + r.overallQualityScore, 0) /
        allResults.length,
      validationHistory: allResults,
    };
  }
}

// ================================
// 📤 ADDITIONAL INTERFACES
// ================================

export interface AlertingConfig {
  enabled: boolean;
  channels: string[];
  thresholds: {
    critical: number;
    high: number;
    medium: number;
  };
}

export interface QualityTrendAnalysis {
  timeSeriesData: Array<{ timestamp: Date; qualityScore: number }>;
  trendDirection: "improving" | "stable" | "declining";
  volatility: number;
  seasonality: any;
}

export interface QualityRecommendation {
  priority: "critical" | "high" | "medium" | "low";
  category: ValidationRuleType;
  title: string;
  description: string;
  actionItems: string[];
  estimatedImpact: "high" | "medium" | "low";
}

export interface DetailedFinding {
  category: ValidationRuleType;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  occurrences: number;
  affectedFields: string[];
  examples: string[];
}

// ================================
// 📤 EXPORTS
// ================================

export default AnalyticsDataQualityValidator;

export {
  type ValidationConfig,
  type ValidationRule,
  type ValidationResult,
  type QualityReport,
  type DataQualityViolation,
};
