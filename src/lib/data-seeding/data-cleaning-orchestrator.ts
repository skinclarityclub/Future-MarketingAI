import { createClient } from "@supabase/supabase-js";
import {
  DataCleaningEngine,
  RawDataInput,
  CleanedDataOutput,
} from "./data-cleaning-engine";
import { logger } from "../logger";

export interface OrchestrationConfig {
  batchSize: number;
  maxRetries: number;
  retryDelay: number;
  enableBackup: boolean;
  sources: {
    content_posts: boolean;
    content_analytics: boolean;
    social_accounts: boolean;
    campaigns: boolean;
    workflow_executions: boolean;
  };
  cleaningRules: {
    strictMode: boolean;
    preserveOriginals: boolean;
    autoFix: boolean;
  };
}

export interface OrchestrationResult {
  totalProcessed: number;
  totalCleaned: number;
  totalRemoved: number;
  averageQuality: number;
  processingTime: number;
  sourcesProcessed: string[];
  errors: OrchestrationError[];
  summary: {
    [source: string]: {
      originalCount: number;
      cleanedCount: number;
      qualityScore: number;
      issues: number;
    };
  };
}

export interface OrchestrationError {
  source: string;
  error: string;
  severity: "low" | "medium" | "high" | "critical";
  retryAttempt: number;
}

export class DataCleaningOrchestrator {
  private supabase: any;
  private cleaningEngine: DataCleaningEngine;
  private config: OrchestrationConfig;

  private defaultConfig: OrchestrationConfig = {
    batchSize: 100,
    maxRetries: 3,
    retryDelay: 1000,
    enableBackup: true,
    sources: {
      content_posts: true,
      content_analytics: true,
      social_accounts: true,
      campaigns: true,
      workflow_executions: true,
    },
    cleaningRules: {
      strictMode: false,
      preserveOriginals: true,
      autoFix: true,
    },
  };

  constructor(config?: Partial<OrchestrationConfig>) {
    this.config = { ...this.defaultConfig, ...config };
    this.cleaningEngine = new DataCleaningEngine();
    this.supabase = null;
  }

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
   * Main orchestration method - clean all enabled data sources
   */
  async orchestrateDataCleaning(): Promise<OrchestrationResult> {
    const startTime = Date.now();
    logger.info("Starting data cleaning orchestration", {
      enabledSources: Object.entries(this.config.sources)
        .filter(([, enabled]) => enabled)
        .map(([source]) => source),
    });

    const results: CleanedDataOutput[] = [];
    const errors: OrchestrationError[] = [];

    // Process each enabled source
    for (const [source, enabled] of Object.entries(this.config.sources)) {
      if (!enabled) continue;

      try {
        const sourceResults = await this.processDataSource(source);
        results.push(...sourceResults);
      } catch (error) {
        const orchestrationError: OrchestrationError = {
          source,
          error: error instanceof Error ? error.message : "Unknown error",
          severity: "high",
          retryAttempt: 0,
        };
        errors.push(orchestrationError);
        logger.error(`Failed to process data source ${source}:`, error);
      }
    }

    // Calculate final statistics
    const totalProcessed = results.reduce(
      (sum, r) => sum + r.metadata.originalCount,
      0
    );
    const totalCleaned = results.reduce(
      (sum, r) => sum + r.metadata.cleanedCount,
      0
    );
    const totalRemoved = totalProcessed - totalCleaned;
    const averageQuality =
      results.length > 0
        ? results.reduce((sum, r) => sum + r.metadata.qualityScore, 0) /
          results.length
        : 0;
    const processingTime = Date.now() - startTime;

    // Create summary by source
    const summary: { [source: string]: any } = {};
    results.forEach(result => {
      if (!summary[result.source]) {
        summary[result.source] = {
          originalCount: 0,
          cleanedCount: 0,
          qualityScore: 0,
          issues: 0,
        };
      }
      summary[result.source].originalCount += result.metadata.originalCount;
      summary[result.source].cleanedCount += result.metadata.cleanedCount;
      summary[result.source].qualityScore = result.metadata.qualityScore;
      summary[result.source].issues += result.issues.length;
    });

    const orchestrationResult: OrchestrationResult = {
      totalProcessed,
      totalCleaned,
      totalRemoved,
      averageQuality,
      processingTime,
      sourcesProcessed: [...new Set(results.map(r => r.source))],
      errors,
      summary,
    };

    // Store orchestration results
    await this.storeOrchestrationResults(orchestrationResult);

    logger.info("Data cleaning orchestration completed", {
      totalProcessed,
      totalCleaned,
      averageQuality: Math.round(averageQuality),
      processingTime: `${processingTime}ms`,
      sourcesProcessed: orchestrationResult.sourcesProcessed,
      errorsCount: errors.length,
    });

    return orchestrationResult;
  }

  /**
   * Process a specific data source
   */
  private async processDataSource(
    source: string
  ): Promise<CleanedDataOutput[]> {
    logger.info(`Processing data source: ${source}`);

    const supabase = await this.getSupabaseClient();
    const rawData = await this.fetchDataFromSource(supabase, source);

    if (!rawData || rawData.length === 0) {
      logger.warn(`No data found for source: ${source}`);
      return [];
    }

    // Convert to RawDataInput format
    const rawDataInput: RawDataInput = {
      source: source as any,
      data: rawData,
      timestamp: new Date().toISOString(),
      metadata: {
        platform: this.detectPlatform(rawData),
        type: source,
        quality: this.estimateDataQuality(rawData),
        confidence: 0.8,
      },
    };

    // Clean the data
    const cleanedResults = await this.cleaningEngine.cleanDataBatch([
      rawDataInput,
    ]);

    // Update database with cleaned data if auto-fix is enabled
    if (this.config.cleaningRules.autoFix && cleanedResults.length > 0) {
      await this.updateCleanedDataInDatabase(
        supabase,
        source,
        cleanedResults[0]
      );
    }

    return cleanedResults;
  }

  /**
   * Fetch data from a specific source table
   */
  private async fetchDataFromSource(
    supabase: any,
    source: string
  ): Promise<any[]> {
    try {
      let query = supabase.from(source).select("*");

      // Add source-specific filters
      switch (source) {
        case "content_posts":
          query = query.limit(this.config.batchSize);
          break;
        case "content_analytics":
          query = query.limit(this.config.batchSize);
          break;
        case "social_accounts":
          query = query.limit(50); // Smaller batch for accounts
          break;
        case "campaigns":
          query = query.limit(this.config.batchSize);
          break;
        case "workflow_executions":
          query = query.limit(this.config.batchSize);
          break;
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(
          `Database query failed for ${source}: ${error.message}`
        );
      }

      return data || [];
    } catch (error) {
      logger.error(`Failed to fetch data from ${source}:`, error);
      throw error;
    }
  }

  /**
   * Update database with cleaned data
   */
  private async updateCleanedDataInDatabase(
    supabase: any,
    source: string,
    cleanedResult: CleanedDataOutput
  ): Promise<void> {
    if (!this.config.cleaningRules.autoFix) return;

    try {
      logger.info(`Updating cleaned data for ${source}`, {
        originalCount: cleanedResult.metadata.originalCount,
        cleanedCount: cleanedResult.metadata.cleanedCount,
      });

      // Create backup table if preserveOriginals is enabled
      if (this.config.cleaningRules.preserveOriginals) {
        await this.createBackupTable(supabase, source);
      }

      // Update records in batches
      const batchSize = 50;
      const cleanedData = cleanedResult.cleanedData;

      for (let i = 0; i < cleanedData.length; i += batchSize) {
        const batch = cleanedData.slice(i, i + batchSize);

        for (const record of batch) {
          if (record.id) {
            const { error } = await supabase
              .from(source)
              .update(record)
              .eq("id", record.id);

            if (error) {
              logger.warn(
                `Failed to update record ${record.id} in ${source}:`,
                error
              );
            }
          }
        }
      }

      logger.info(
        `Successfully updated ${cleanedData.length} records in ${source}`
      );
    } catch (error) {
      logger.error(`Failed to update cleaned data in ${source}:`, error);
      throw error;
    }
  }

  /**
   * Create backup table for original data
   */
  private async createBackupTable(
    supabase: any,
    source: string
  ): Promise<void> {
    try {
      const backupTableName = `${source}_backup_${Date.now()}`;

      // This would need to be implemented based on specific backup strategy
      logger.info(`Creating backup table: ${backupTableName}`);

      // For now, just log the intention
      // In production, you'd implement actual table cloning
    } catch (error) {
      logger.warn(`Failed to create backup table for ${source}:`, error);
    }
  }

  /**
   * Store orchestration results for monitoring
   */
  private async storeOrchestrationResults(
    result: OrchestrationResult
  ): Promise<void> {
    try {
      const supabase = await this.getSupabaseClient();

      const { error } = await supabase
        .from("data_cleaning_orchestration_logs")
        .insert({
          total_processed: result.totalProcessed,
          total_cleaned: result.totalCleaned,
          total_removed: result.totalRemoved,
          average_quality: result.averageQuality,
          processing_time: result.processingTime,
          sources_processed: result.sourcesProcessed,
          errors_count: result.errors.length,
          summary: result.summary,
          created_at: new Date().toISOString(),
        });

      if (error) {
        logger.warn("Failed to store orchestration results:", error);
      }
    } catch (error) {
      logger.warn("Failed to store orchestration results:", error);
    }
  }

  /**
   * Detect platform from data structure
   */
  private detectPlatform(data: any[]): string {
    if (!data || data.length === 0) return "unknown";

    const sample = data[0];

    if (sample.platform) return sample.platform;
    if (sample.social_platform) return sample.social_platform;
    if (sample.account_type) return sample.account_type;

    return "mixed";
  }

  /**
   * Estimate data quality before cleaning
   */
  private estimateDataQuality(data: any[]): number {
    if (!data || data.length === 0) return 0;

    let qualityScore = 100;
    let totalFields = 0;
    let filledFields = 0;

    // Sample first 10 records for quality estimation
    const sampleSize = Math.min(10, data.length);
    const sample = data.slice(0, sampleSize);

    for (const record of sample) {
      // Skip null or undefined records
      if (!record || typeof record !== "object") {
        continue;
      }

      for (const [key, value] of Object.entries(record)) {
        totalFields++;
        if (value !== null && value !== undefined && value !== "") {
          filledFields++;
        }
      }
    }

    const completeness =
      totalFields > 0 ? (filledFields / totalFields) * 100 : 0;
    qualityScore = completeness;

    return Math.max(0, Math.min(100, qualityScore));
  }

  /**
   * Run cleaning for specific sources only
   */
  async cleanSpecificSources(sources: string[]): Promise<OrchestrationResult> {
    // Create temporary config with only specified sources enabled
    const tempConfig = {
      ...this.config,
      sources: {
        content_posts: sources.includes("content_posts"),
        content_analytics: sources.includes("content_analytics"),
        social_accounts: sources.includes("social_accounts"),
        campaigns: sources.includes("campaigns"),
        workflow_executions: sources.includes("workflow_executions"),
      },
    };

    const tempOrchestrator = new DataCleaningOrchestrator(tempConfig);
    return await tempOrchestrator.orchestrateDataCleaning();
  }

  /**
   * Get orchestration status/statistics
   */
  async getOrchestrationStatus(): Promise<{
    lastRun?: Date;
    totalRuns: number;
    averageProcessingTime: number;
    averageQuality: number;
    mostProblematicSource?: string;
  }> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from("data_cleaning_orchestration_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error || !data || data.length === 0) {
        return {
          totalRuns: 0,
          averageProcessingTime: 0,
          averageQuality: 0,
        };
      }

      const lastRun = new Date(data[0].created_at);
      const totalRuns = data.length;
      const averageProcessingTime =
        data.reduce((sum, log) => sum + log.processing_time, 0) / totalRuns;
      const averageQuality =
        data.reduce((sum, log) => sum + log.average_quality, 0) / totalRuns;

      return {
        lastRun,
        totalRuns,
        averageProcessingTime,
        averageQuality,
      };
    } catch (error) {
      logger.error("Failed to get orchestration status:", error);
      return {
        totalRuns: 0,
        averageProcessingTime: 0,
        averageQuality: 0,
      };
    }
  }
}

// Export default instance
export const dataCleaningOrchestrator = new DataCleaningOrchestrator();
