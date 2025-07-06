import { createClient } from "@supabase/supabase-js";
// Temporarily disable logger to avoid webpack issues in API routes
// import { logger } from '../logger';
const logger = {
  info: (msg: string, data?: any) => console.log(`[INFO] ${msg}`, data || ""),
  error: (msg: string, data?: any) =>
    console.error(`[ERROR] ${msg}`, data || ""),
  warn: (msg: string, data?: any) => console.warn(`[WARN] ${msg}`, data || ""),
  debug: (msg: string, data?: any) =>
    console.debug(`[DEBUG] ${msg}`, data || ""),
};

// Type definitions for data cleaning
export interface DataCleaningConfig {
  deduplication: {
    enabled: boolean;
    fields: string[];
    similarityThreshold: number;
    strategy: "strict" | "fuzzy" | "semantic";
  };
  outlierDetection: {
    enabled: boolean;
    method: "iqr" | "zscore" | "isolation";
    threshold: number;
    preserveOutliers: boolean;
  };
  formatHarmonization: {
    enabled: boolean;
    dateFormats: string[];
    numberFormats: string[];
    textNormalization: boolean;
  };
  dataValidation: {
    enabled: boolean;
    requiredFields: string[];
    dataTypes: { [key: string]: string };
    ranges: { [key: string]: { min: number; max: number } };
  };
  logging: {
    enabled: boolean;
    level: "info" | "debug" | "warning" | "error";
    preserveOriginal: boolean;
  };
}

export interface CleaningResult {
  originalCount: number;
  cleanedCount: number;
  removedCount: number;
  deduplicatedCount: number;
  outlierCount: number;
  normalizedCount: number;
  validationErrors: number;
  cleaningEfficiency: number;
  dataQualityScore: number;
  processingTime: number;
  issues: DataIssue[];
  statistics: CleaningStatistics;
}

export interface DataIssue {
  type: "duplicate" | "outlier" | "format" | "validation" | "missing";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  field?: string;
  value?: any;
  suggestion?: string;
  fixed: boolean;
}

export interface CleaningStatistics {
  duplicatesRemoved: { [key: string]: number };
  outliersDetected: { [key: string]: number };
  formatsNormalized: { [key: string]: number };
  validationFailures: { [key: string]: number };
  dataCompleteness: number;
  qualityMetrics: { [key: string]: number };
}

export interface RawDataInput {
  source:
    | "content_posts"
    | "content_analytics"
    | "social_accounts"
    | "campaigns"
    | "trending_hashtags"
    | "competitor_data";
  data: any[];
  timestamp: string;
  metadata: {
    platform?: string;
    type?: string;
    quality?: number;
    confidence?: number;
  };
}

export interface CleanedDataOutput {
  source: string;
  cleanedData: any[];
  metadata: {
    originalCount: number;
    cleanedCount: number;
    qualityScore: number;
    processingDate: string;
    cleaningVersion: string;
  };
  issues: DataIssue[];
  statistics: CleaningStatistics;
}

export class DataCleaningEngine {
  private supabase: any;
  private config: DataCleaningConfig;
  private defaultConfig: DataCleaningConfig = {
    deduplication: {
      enabled: true,
      fields: ["title", "content", "platform", "post_id"],
      similarityThreshold: 0.85,
      strategy: "fuzzy",
    },
    outlierDetection: {
      enabled: true,
      method: "zscore",
      threshold: 3.0,
      preserveOutliers: false,
    },
    formatHarmonization: {
      enabled: true,
      dateFormats: ["ISO8601", "YYYY-MM-DD", "MM/DD/YYYY"],
      numberFormats: ["decimal", "percentage", "currency"],
      textNormalization: true,
    },
    dataValidation: {
      enabled: true,
      requiredFields: ["id", "created_at"],
      dataTypes: {
        engagement_rate: "number",
        impressions: "number",
        reach: "number",
        created_at: "date",
      },
      ranges: {
        engagement_rate: { min: 0, max: 100 },
        sentiment_score: { min: 0, max: 100 },
        ai_quality_score: { min: 0, max: 10 },
      },
    },
    logging: {
      enabled: true,
      level: "info",
      preserveOriginal: true,
    },
  };

  constructor(config?: Partial<DataCleaningConfig>) {
    this.config = this.mergeConfig(this.defaultConfig, config);
    this.supabase = null;
  }

  /**
   * Deep merge configuration objects
   */
  private mergeConfig(
    defaultConfig: DataCleaningConfig,
    customConfig?: Partial<DataCleaningConfig>
  ): DataCleaningConfig {
    if (!customConfig) return { ...defaultConfig };

    const result = { ...defaultConfig };

    // Merge each nested section properly
    if (customConfig.deduplication) {
      result.deduplication = {
        ...defaultConfig.deduplication,
        ...customConfig.deduplication,
      };
    }

    if (customConfig.outlierDetection) {
      result.outlierDetection = {
        ...defaultConfig.outlierDetection,
        ...customConfig.outlierDetection,
      };
    }

    if (customConfig.formatHarmonization) {
      result.formatHarmonization = {
        ...defaultConfig.formatHarmonization,
        ...customConfig.formatHarmonization,
      };
    }

    if (customConfig.dataValidation) {
      result.dataValidation = {
        ...defaultConfig.dataValidation,
        ...customConfig.dataValidation,
      };
    }

    if (customConfig.logging) {
      result.logging = { ...defaultConfig.logging, ...customConfig.logging };
    }

    return result;
  }

  /**
   * Initialize Supabase client
   */
  private async getSupabaseClient() {
    if (!this.supabase) {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.SUPABASE_SERVICE_ROLE_KEY || ""
      );
    }
    return this.supabase;
  }

  /**
   * Main data cleaning orchestration method
   */
  async cleanDataBatch(inputs: RawDataInput[]): Promise<CleanedDataOutput[]> {
    const startTime = Date.now();
    logger.info("Starting data cleaning batch process", {
      batchSize: inputs.length,
      sources: inputs.map(i => i.source),
    });

    const results: CleanedDataOutput[] = [];

    for (const input of inputs) {
      try {
        const cleanedOutput = await this.cleanSingleDataset(input);
        results.push(cleanedOutput);
      } catch (error) {
        logger.error(`Failed to clean dataset from ${input.source}:`, error);
        // Add error result
        results.push({
          source: input.source,
          cleanedData: [],
          metadata: {
            originalCount: input.data.length,
            cleanedCount: 0,
            qualityScore: 0,
            processingDate: new Date().toISOString(),
            cleaningVersion: "1.0.0",
          },
          issues: [
            {
              type: "validation",
              severity: "critical",
              description: `Processing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
              fixed: false,
            },
          ],
          statistics: this.initializeStatistics(),
        });
      }
    }

    const processingTime = Date.now() - startTime;
    logger.info("Data cleaning batch completed", {
      totalProcessed: results.length,
      processingTime: `${processingTime}ms`,
    });

    return results;
  }

  /**
   * Clean a single dataset
   */
  private async cleanSingleDataset(
    input: RawDataInput
  ): Promise<CleanedDataOutput> {
    const startTime = Date.now();
    const issues: DataIssue[] = [];
    const statistics = this.initializeStatistics();

    // Validate input data structure
    if (!input.data || !Array.isArray(input.data)) {
      return {
        source: input.source,
        cleanedData: [],
        metadata: {
          originalCount: 0,
          cleanedCount: 0,
          qualityScore: 0,
          processingDate: new Date().toISOString(),
          cleaningVersion: "1.0.0",
        },
        issues: [
          {
            type: "validation",
            severity: "critical",
            description: "Input data is not a valid array",
            fixed: false,
          },
        ],
        statistics: this.initializeStatistics(),
      };
    }

    let workingData = [...input.data];
    const originalCount = workingData.length;

    logger.info(`Starting data cleaning for ${input.source}`, {
      originalCount,
      source: input.source,
    });

    // Step 1: Data Validation
    if (this.config.dataValidation.enabled) {
      const validationResult = await this.validateData(
        workingData,
        input.source
      );
      workingData = validationResult.data;
      issues.push(...validationResult.issues);
      statistics.validationFailures = validationResult.statistics;
    }

    // Step 2: Format Harmonization
    if (this.config.formatHarmonization.enabled) {
      const harmonizationResult = await this.harmonizeFormats(
        workingData,
        input.source
      );
      workingData = harmonizationResult.data;
      issues.push(...harmonizationResult.issues);
      statistics.formatsNormalized = harmonizationResult.statistics;
    }

    // Step 3: Deduplication
    if (this.config.deduplication.enabled) {
      const deduplicationResult = await this.deduplicateData(
        workingData,
        input.source
      );
      workingData = deduplicationResult.data;
      issues.push(...deduplicationResult.issues);
      statistics.duplicatesRemoved = deduplicationResult.statistics;
    }

    // Step 4: Outlier Detection
    if (this.config.outlierDetection.enabled) {
      const outlierResult = await this.detectOutliers(
        workingData,
        input.source
      );
      workingData = outlierResult.data;
      issues.push(...outlierResult.issues);
      statistics.outliersDetected = outlierResult.statistics;
    }

    // Step 5: Calculate Final Statistics
    const cleanedCount = workingData.length;
    const cleaningEfficiency =
      originalCount > 0 ? (cleanedCount / originalCount) * 100 : 0;
    const qualityScore = this.calculateDataQualityScore(workingData, issues);
    const processingTime = Date.now() - startTime;

    // Step 6: Store Results (if needed)
    if (this.config.logging.preserveOriginal) {
      await this.storeCleaningResults({
        source: input.source,
        originalCount,
        cleanedCount,
        qualityScore,
        processingTime,
        issues,
      });
    }

    statistics.dataCompleteness = this.calculateDataCompleteness(workingData);

    return {
      source: input.source,
      cleanedData: workingData,
      metadata: {
        originalCount,
        cleanedCount,
        qualityScore,
        processingDate: new Date().toISOString(),
        cleaningVersion: "1.0.0",
      },
      issues,
      statistics,
    };
  }

  /**
   * Validate data types, required fields, and ranges
   */
  private async validateData(
    data: any[],
    source: string
  ): Promise<{
    data: any[];
    issues: DataIssue[];
    statistics: { [key: string]: number };
  }> {
    const issues: DataIssue[] = [];
    const statistics: { [key: string]: number } = {};
    const validData: any[] = [];

    for (const [index, item] of data.entries()) {
      // Skip null or undefined items
      if (!item || typeof item !== "object") {
        issues.push({
          type: "validation",
          severity: "critical",
          description: `Item at index ${index} is null or not an object`,
          fixed: false,
        });
        continue;
      }

      let isValid = true;
      const itemIssues: string[] = [];

      // Check required fields
      for (const field of this.config.dataValidation.requiredFields) {
        if (!item[field] || item[field] === null || item[field] === undefined) {
          itemIssues.push(`Missing required field: ${field}`);
          isValid = false;
        }
      }

      // Check data types
      for (const [field, expectedType] of Object.entries(
        this.config.dataValidation.dataTypes
      )) {
        if (item[field] !== undefined && item[field] !== null) {
          if (!this.validateDataType(item[field], expectedType)) {
            itemIssues.push(
              `Invalid data type for ${field}: expected ${expectedType}`
            );
            isValid = false;
          }
        }
      }

      // Check ranges
      for (const [field, range] of Object.entries(
        this.config.dataValidation.ranges
      )) {
        if (item[field] !== undefined && item[field] !== null) {
          const value = Number(item[field]);
          if (!isNaN(value) && (value < range.min || value > range.max)) {
            itemIssues.push(
              `Value out of range for ${field}: ${value} (expected ${range.min}-${range.max})`
            );

            // Auto-fix if possible
            if (value < range.min) item[field] = range.min;
            if (value > range.max) item[field] = range.max;
          }
        }
      }

      if (isValid) {
        validData.push(item);
      } else {
        issues.push({
          type: "validation",
          severity: "medium",
          description: `Data validation failed: ${itemIssues.join(", ")}`,
          fixed: false,
        });

        statistics[`validation_errors_${source}`] =
          (statistics[`validation_errors_${source}`] || 0) + 1;
      }
    }

    logger.info(`Data validation completed for ${source}`, {
      originalCount: data.length,
      validCount: validData.length,
      invalidCount: data.length - validData.length,
    });

    return { data: validData, issues, statistics };
  }

  /**
   * Harmonize date formats, number formats, and text normalization
   */
  private async harmonizeFormats(
    data: any[],
    source: string
  ): Promise<{
    data: any[];
    issues: DataIssue[];
    statistics: { [key: string]: number };
  }> {
    const issues: DataIssue[] = [];
    const statistics: { [key: string]: number } = {};
    const harmonizedData = [...data];

    for (const item of harmonizedData) {
      // Skip null or undefined items
      if (!item || typeof item !== "object") {
        continue;
      }

      // Normalize dates
      for (const [key, value] of Object.entries(item)) {
        if (this.isDateField(key) && value) {
          const normalizedDate = this.normalizeDateFormat(value);
          if (normalizedDate !== value) {
            item[key] = normalizedDate;
            statistics[`dates_normalized_${source}`] =
              (statistics[`dates_normalized_${source}`] || 0) + 1;
          }
        }

        // Normalize numbers
        if (this.isNumberField(key) && value !== null && value !== undefined) {
          const normalizedNumber = this.normalizeNumberFormat(value);
          if (normalizedNumber !== value) {
            item[key] = normalizedNumber;
            statistics[`numbers_normalized_${source}`] =
              (statistics[`numbers_normalized_${source}`] || 0) + 1;
          }
        }

        // Normalize text
        if (
          this.config.formatHarmonization.textNormalization &&
          this.isTextField(key) &&
          typeof value === "string"
        ) {
          const normalizedText = this.normalizeTextFormat(value);
          if (normalizedText !== value) {
            item[key] = normalizedText;
            statistics[`text_normalized_${source}`] =
              (statistics[`text_normalized_${source}`] || 0) + 1;
          }
        }
      }
    }

    logger.info(`Format harmonization completed for ${source}`, {
      dateNormalizations: statistics[`dates_normalized_${source}`] || 0,
      numberNormalizations: statistics[`numbers_normalized_${source}`] || 0,
      textNormalizations: statistics[`text_normalized_${source}`] || 0,
    });

    return { data: harmonizedData, issues, statistics };
  }

  /**
   * Remove duplicate records based on configured strategy
   */
  private async deduplicateData(
    data: any[],
    source: string
  ): Promise<{
    data: any[];
    issues: DataIssue[];
    statistics: { [key: string]: number };
  }> {
    const issues: DataIssue[] = [];
    const statistics: { [key: string]: number } = {};

    let deduplicatedData: any[] = [];
    const originalCount = data.length;

    switch (this.config.deduplication.strategy) {
      case "strict":
        deduplicatedData = this.strictDeduplication(data);
        break;
      case "fuzzy":
        deduplicatedData = this.fuzzyDeduplication(data);
        break;
      case "semantic":
        deduplicatedData = await this.semanticDeduplication(data);
        break;
    }

    const duplicatesRemoved = originalCount - deduplicatedData.length;
    statistics[`duplicates_removed_${source}`] = duplicatesRemoved;

    if (duplicatesRemoved > 0) {
      issues.push({
        type: "duplicate",
        severity: "low",
        description: `Removed ${duplicatesRemoved} duplicate records`,
        fixed: true,
      });
    }

    logger.info(`Deduplication completed for ${source}`, {
      originalCount,
      deduplicatedCount: deduplicatedData.length,
      duplicatesRemoved,
    });

    return { data: deduplicatedData, issues, statistics };
  }

  /**
   * Detect and handle outliers in numeric data
   */
  private async detectOutliers(
    data: any[],
    source: string
  ): Promise<{
    data: any[];
    issues: DataIssue[];
    statistics: { [key: string]: number };
  }> {
    const issues: DataIssue[] = [];
    const statistics: { [key: string]: number } = {};
    let cleanData = [...data];

    // Find numeric fields for outlier detection
    const sampleItem =
      data.find(item => item && typeof item === "object") || {};
    const numericFields = this.getNumericFields(sampleItem);

    for (const field of numericFields) {
      const values = data
        .map(item => item[field])
        .filter(val => val !== null && val !== undefined && !isNaN(Number(val)))
        .map(Number);

      if (values.length < 3) continue; // Need minimum data for outlier detection

      let outlierIndices: number[] = [];

      switch (this.config.outlierDetection.method) {
        case "zscore":
          outlierIndices = this.detectOutliersZScore(values);
          break;
        case "iqr":
          outlierIndices = this.detectOutliersIQR(values);
          break;
        case "isolation":
          outlierIndices = this.detectOutliersIsolation(values);
          break;
      }

      if (outlierIndices.length > 0) {
        statistics[`outliers_${field}_${source}`] = outlierIndices.length;

        if (!this.config.outlierDetection.preserveOutliers) {
          // Remove outliers - need to track original indices correctly
          const outlierValueSet = new Set(outlierIndices.map(i => values[i]));
          let valueIndex = 0;
          cleanData = cleanData.filter(item => {
            const value = Number(item[field]);
            if (value !== null && value !== undefined && !isNaN(value)) {
              const shouldRemove = outlierValueSet.has(value);
              valueIndex++;
              return !shouldRemove;
            }
            return true; // Keep non-numeric values
          });

          issues.push({
            type: "outlier",
            severity: "medium",
            description: `Removed ${outlierIndices.length} outliers from field ${field}`,
            field,
            fixed: true,
          });
        } else {
          // Flag outliers but keep them
          issues.push({
            type: "outlier",
            severity: "low",
            description: `Detected ${outlierIndices.length} outliers in field ${field} (preserved)`,
            field,
            fixed: false,
          });
        }
      }
    }

    logger.info(`Outlier detection completed for ${source}`, {
      fieldsAnalyzed: numericFields.length,
      totalOutliers: Object.values(statistics).reduce(
        (sum, count) => sum + count,
        0
      ),
    });

    return { data: cleanData, issues, statistics };
  }

  // Helper methods for data cleaning operations

  private validateDataType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case "number":
        return typeof value === "number" || !isNaN(Number(value));
      case "string":
        return typeof value === "string";
      case "date":
        return !isNaN(Date.parse(value));
      case "boolean":
        return typeof value === "boolean";
      default:
        return true;
    }
  }

  private isDateField(key: string): boolean {
    const dateFields = [
      "created_at",
      "updated_at",
      "published_at",
      "date",
      "timestamp",
    ];
    return dateFields.some(field => key.toLowerCase().includes(field));
  }

  private isNumberField(key: string): boolean {
    const numberFields = [
      "rate",
      "score",
      "count",
      "impressions",
      "reach",
      "engagement",
    ];
    return numberFields.some(field => key.toLowerCase().includes(field));
  }

  private isTextField(key: string): boolean {
    const textFields = [
      "title",
      "content",
      "description",
      "hashtags",
      "caption",
    ];
    return textFields.some(field => key.toLowerCase().includes(field));
  }

  private normalizeDateFormat(value: any): string {
    try {
      return new Date(value).toISOString();
    } catch {
      return value;
    }
  }

  private normalizeNumberFormat(value: any): number {
    const num = Number(value);
    return isNaN(num) ? value : num;
  }

  private normalizeTextFormat(value: string): string {
    return value
      .trim()
      .replace(/\s+/g, " ") // Multiple spaces to single space
      .replace(/[^\w\s@#]/g, "") // Remove special chars except @ and #
      .toLowerCase();
  }

  private strictDeduplication(data: any[]): any[] {
    const seen = new Set();
    return data.filter(item => {
      const key = this.config.deduplication.fields
        .map(field => String(item[field] || ""))
        .join("|");

      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private fuzzyDeduplication(data: any[]): any[] {
    const result: any[] = [];

    for (const item of data) {
      let isDuplicate = false;

      for (const existingItem of result) {
        const similarity = this.calculateSimilarity(item, existingItem);
        if (similarity >= this.config.deduplication.similarityThreshold) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        result.push(item);
      }
    }

    return result;
  }

  private async semanticDeduplication(data: any[]): Promise<any[]> {
    // For now, fallback to fuzzy deduplication
    // In future, could integrate with ML/NLP services for semantic similarity
    return this.fuzzyDeduplication(data);
  }

  private calculateSimilarity(item1: any, item2: any): number {
    let totalSimilarity = 0;
    let fieldsCompared = 0;

    for (const field of this.config.deduplication.fields) {
      if (item1[field] && item2[field]) {
        const similarity = this.stringSimilarity(
          String(item1[field]),
          String(item2[field])
        );
        totalSimilarity += similarity;
        fieldsCompared++;
      }
    }

    return fieldsCompared > 0 ? totalSimilarity / fieldsCompared : 0;
  }

  private stringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private getNumericFields(sampleItem: any): string[] {
    return Object.keys(sampleItem).filter(key => {
      const value = sampleItem[key];
      return typeof value === "number" || !isNaN(Number(value));
    });
  }

  private detectOutliersZScore(values: number[]): number[] {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    const stdDev = Math.sqrt(variance);

    const outliers: number[] = [];
    for (let i = 0; i < values.length; i++) {
      const zScore = Math.abs((values[i] - mean) / stdDev);
      if (zScore > this.config.outlierDetection.threshold) {
        outliers.push(i);
      }
    }

    return outliers;
  }

  private detectOutliersIQR(values: number[]): number[] {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const outliers: number[] = [];
    for (let i = 0; i < values.length; i++) {
      if (values[i] < lowerBound || values[i] > upperBound) {
        outliers.push(i);
      }
    }

    return outliers;
  }

  private detectOutliersIsolation(values: number[]): number[] {
    // Simplified isolation forest implementation
    // For production, consider using a proper ML library
    const outliers: number[] = [];
    const threshold = this.config.outlierDetection.threshold;

    for (let i = 0; i < values.length; i++) {
      let isolationScore = 0;
      const currentValue = values[i];

      // Calculate isolation score based on distance to other points
      for (const otherValue of values) {
        if (otherValue !== currentValue) {
          isolationScore += Math.abs(currentValue - otherValue);
        }
      }

      isolationScore /= values.length - 1;

      // If isolation score is high, it's likely an outlier
      const normalized = isolationScore / Math.max(...values);
      if (normalized > threshold) {
        outliers.push(i);
      }
    }

    return outliers;
  }

  private calculateDataQualityScore(data: any[], issues: DataIssue[]): number {
    let score = 100;

    // Deduct points for critical issues
    const criticalIssues = issues.filter(i => i.severity === "critical").length;
    score -= criticalIssues * 25;

    // Deduct points for high severity issues
    const highIssues = issues.filter(i => i.severity === "high").length;
    score -= highIssues * 15;

    // Deduct points for medium severity issues
    const mediumIssues = issues.filter(i => i.severity === "medium").length;
    score -= mediumIssues * 5;

    // Bonus for completeness
    const completeness = this.calculateDataCompleteness(data);
    score += (completeness - 50) * 0.5; // Bonus/penalty based on completeness

    return Math.max(0, Math.min(100, score));
  }

  private calculateDataCompleteness(data: any[]): number {
    if (!data.length) return 0;

    let totalFields = 0;
    let filledFields = 0;

    for (const item of data) {
      // Skip null or undefined items
      if (!item || typeof item !== "object") {
        continue;
      }

      for (const [key, value] of Object.entries(item)) {
        totalFields++;
        if (value !== null && value !== undefined && value !== "") {
          filledFields++;
        }
      }
    }

    return totalFields > 0 ? (filledFields / totalFields) * 100 : 0;
  }

  private async storeCleaningResults(results: {
    source: string;
    originalCount: number;
    cleanedCount: number;
    qualityScore: number;
    processingTime: number;
    issues: DataIssue[];
  }): Promise<void> {
    try {
      const supabase = await this.getSupabaseClient();

      // First check if the table exists by trying a simple select
      const { error: tableCheckError } = await supabase
        .from("data_cleaning_logs")
        .select("id")
        .limit(1);

      // If table doesn't exist, skip storage (development mode)
      if (
        tableCheckError &&
        tableCheckError.message?.includes("does not exist")
      ) {
        // Skip storage in development if table doesn't exist
        if (process.env.NODE_ENV === "development") {
          return;
        }
      }

      const { error } = await supabase.from("data_cleaning_logs").insert({
        source: results.source,
        original_count: results.originalCount,
        cleaned_count: results.cleanedCount,
        quality_score: results.qualityScore,
        processing_time: results.processingTime,
        issues_count: results.issues.length,
        critical_issues: results.issues.filter(i => i.severity === "critical")
          .length,
        created_at: new Date().toISOString(),
      });

      if (error) {
        // Only warn if it's not a table existence issue
        if (!error.message?.includes("does not exist")) {
          logger.warn("Failed to store cleaning results:", error);
        }
      }
    } catch (error) {
      // Only warn if it's not a connection/table issue in development
      if (process.env.NODE_ENV !== "development") {
        logger.warn("Failed to store cleaning results:", error);
      }
    }
  }

  private initializeStatistics(): CleaningStatistics {
    return {
      duplicatesRemoved: {},
      outliersDetected: {},
      formatsNormalized: {},
      validationFailures: {},
      dataCompleteness: 0,
      qualityMetrics: {},
    };
  }

  /**
   * Get the numeric fields from a sample data object
   */
  private getNumericFieldsFromData(data: any[]): string[] {
    if (!data || data.length === 0) return [];

    const sampleItem =
      data.find(item => item && typeof item === "object") || {};
    return Object.keys(sampleItem).filter(key => {
      const value = sampleItem[key];
      return (
        typeof value === "number" ||
        (!isNaN(Number(value)) && value !== null && value !== "")
      );
    });
  }

  /**
   * Public method to get cleaning summary
   */
  async getCleaningSummary(
    timeframe: "day" | "week" | "month" = "day"
  ): Promise<{
    totalProcessed: number;
    averageQuality: number;
    topIssues: string[];
    sources: string[];
  }> {
    try {
      const supabase = await this.getSupabaseClient();

      const dateFilter = new Date();
      switch (timeframe) {
        case "day":
          dateFilter.setDate(dateFilter.getDate() - 1);
          break;
        case "week":
          dateFilter.setDate(dateFilter.getDate() - 7);
          break;
        case "month":
          dateFilter.setMonth(dateFilter.getMonth() - 1);
          break;
      }

      const { data, error } = await supabase
        .from("data_cleaning_logs")
        .select("*")
        .gte("created_at", dateFilter.toISOString());

      if (error || !data) {
        return {
          totalProcessed: 0,
          averageQuality: 0,
          topIssues: [],
          sources: [],
        };
      }

      const totalProcessed = data.reduce(
        (sum, log) => sum + log.cleaned_count,
        0
      );
      const averageQuality =
        data.length > 0
          ? data.reduce((sum, log) => sum + log.quality_score, 0) / data.length
          : 0;
      const sources = [...new Set(data.map(log => log.source))];

      return {
        totalProcessed,
        averageQuality,
        topIssues: ["duplicates", "format_issues", "outliers"], // Simplified for now
        sources,
      };
    } catch (error) {
      logger.error("Failed to get cleaning summary:", error);
      return {
        totalProcessed: 0,
        averageQuality: 0,
        topIssues: [],
        sources: [],
      };
    }
  }
}

// Export default instance
export const dataCleaningEngine = new DataCleaningEngine();
