/**
 * A/B Testing Engine for ML Models
 * Task 72.8: Implementeer continue data enrichment en performance benchmarking
 *
 * A/B testing framework voor ML modellen
 */

import { createClient } from "@supabase/supabase-js";

export interface ABTestConfig {
  test_name: string;
  description: string;
  model_variants: {
    control_model: string;
    treatment_models: string[];
  };
  traffic_split: number;
  success_metrics: string[];
  duration_days: number;
}

export interface ABTestResult {
  test_id: string;
  test_name: string;
  status: "running" | "completed" | "paused";
  start_date: string;
  variants_performance: Array<{
    variant_name: string;
    sample_size: number;
    conversion_rate: number;
    confidence_level: number;
  }>;
  winner: string | null;
  improvement_percentage: number;
}

export class ABTestingEngine {
  private supabase: any;
  private activeTests: Map<string, ABTestConfig>;
  private testResults: Map<string, ABTestResult>;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    this.activeTests = new Map();
    this.testResults = new Map();
  }

  async startTest(config: ABTestConfig): Promise<string> {
    const testId = `ab_test_${Date.now()}`;

    try {
      console.log(`[ABTestingEngine] Starting A/B test: ${config.test_name}`);

      this.activeTests.set(testId, config);

      const initialResult: ABTestResult = {
        test_id: testId,
        test_name: config.test_name,
        status: "running",
        start_date: new Date().toISOString(),
        variants_performance: [
          {
            variant_name: config.model_variants.control_model,
            sample_size: 0,
            conversion_rate: 0,
            confidence_level: 0,
          },
          ...config.model_variants.treatment_models.map(model => ({
            variant_name: model,
            sample_size: 0,
            conversion_rate: 0,
            confidence_level: 0,
          })),
        ],
        winner: null,
        improvement_percentage: 0,
      };

      this.testResults.set(testId, initialResult);

      await this.storeTestConfig(testId, config);

      console.log(`[ABTestingEngine] A/B test started: ${testId}`);
      return testId;
    } catch (error) {
      console.error(`[ABTestingEngine] Error starting test:`, error);
      throw error;
    }
  }

  async assignUserToVariant(testId: string, userId: string): Promise<string> {
    const config = this.activeTests.get(testId);
    if (!config) {
      throw new Error(`Test not found: ${testId}`);
    }

    // Simple hash-based assignment
    const hash = this.hashString(userId);
    const variants = [
      config.model_variants.control_model,
      ...config.model_variants.treatment_models,
    ];
    const variantIndex = hash % variants.length;

    return variants[variantIndex];
  }

  async recordConversion(
    testId: string,
    userId: string,
    variantName: string,
    conversionValue: number
  ): Promise<void> {
    try {
      await this.supabase.from("ab_test_conversions").insert({
        test_id: testId,
        user_id: userId,
        variant_name: variantName,
        conversion_value: conversionValue,
        timestamp: new Date().toISOString(),
      });

      // Update results
      await this.updateTestResults(testId);
    } catch (error) {
      console.error(`[ABTestingEngine] Error recording conversion:`, error);
      throw error;
    }
  }

  async analyzeResults(testId: string): Promise<ABTestResult> {
    const testResult = this.testResults.get(testId);
    if (!testResult) {
      throw new Error(`Test not found: ${testId}`);
    }

    try {
      // Mock analysis - in production this would analyze real data
      const updatedResult = { ...testResult };

      // Update performance metrics with mock data
      updatedResult.variants_performance =
        updatedResult.variants_performance.map(variant => ({
          ...variant,
          sample_size: Math.floor(Math.random() * 1000) + 100,
          conversion_rate: Math.random() * 0.3 + 0.1,
          confidence_level: Math.random() * 0.4 + 0.6,
        }));

      // Determine winner
      const bestVariant = updatedResult.variants_performance.reduce(
        (best, current) =>
          current.conversion_rate > best.conversion_rate ? current : best
      );

      const controlVariant = updatedResult.variants_performance.find(
        v =>
          v.variant_name ===
          this.activeTests.get(testId)?.model_variants.control_model
      );

      if (
        controlVariant &&
        bestVariant.variant_name !== controlVariant.variant_name
      ) {
        updatedResult.winner = bestVariant.variant_name;
        updatedResult.improvement_percentage =
          ((bestVariant.conversion_rate - controlVariant.conversion_rate) /
            controlVariant.conversion_rate) *
          100;
      }

      this.testResults.set(testId, updatedResult);
      await this.storeTestResults(updatedResult);

      return updatedResult;
    } catch (error) {
      console.error(`[ABTestingEngine] Error analyzing results:`, error);
      throw error;
    }
  }

  async stopTest(testId: string): Promise<void> {
    try {
      const testResult = this.testResults.get(testId);
      if (testResult) {
        testResult.status = "completed";
        await this.storeTestResults(testResult);
      }

      this.activeTests.delete(testId);
      console.log(`[ABTestingEngine] Test stopped: ${testId}`);
    } catch (error) {
      console.error(`[ABTestingEngine] Error stopping test:`, error);
      throw error;
    }
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private async updateTestResults(testId: string): Promise<void> {
    // Mock implementation - would calculate real metrics from database
    const testResult = this.testResults.get(testId);
    if (testResult) {
      await this.storeTestResults(testResult);
    }
  }

  private async storeTestConfig(
    testId: string,
    config: ABTestConfig
  ): Promise<void> {
    try {
      const { error } = await this.supabase.from("ab_test_configs").insert({
        test_id: testId,
        test_name: config.test_name,
        description: config.description,
        configuration: config,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("[ABTestingEngine] Error storing test config:", error);
      }
    } catch (error) {
      console.error("[ABTestingEngine] Error in storeTestConfig:", error);
    }
  }

  private async storeTestResults(result: ABTestResult): Promise<void> {
    try {
      const { error } = await this.supabase.from("ab_test_results").upsert({
        test_id: result.test_id,
        test_name: result.test_name,
        status: result.status,
        start_date: result.start_date,
        variants_performance: result.variants_performance,
        winner: result.winner,
        improvement_percentage: result.improvement_percentage,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("[ABTestingEngine] Error storing test results:", error);
      }
    } catch (error) {
      console.error("[ABTestingEngine] Error in storeTestResults:", error);
    }
  }

  getActiveTests(): ABTestConfig[] {
    return Array.from(this.activeTests.values());
  }

  getTestResults(testId?: string): ABTestResult[] {
    if (testId) {
      const result = this.testResults.get(testId);
      return result ? [result] : [];
    }
    return Array.from(this.testResults.values());
  }

  async getAllTestResults(): Promise<ABTestResult[]> {
    try {
      const { data, error } = await this.supabase
        .from("ab_test_results")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) {
        console.error("[ABTestingEngine] Error fetching test results:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("[ABTestingEngine] Error in getAllTestResults:", error);
      return [];
    }
  }
}
