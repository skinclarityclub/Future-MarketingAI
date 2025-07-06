/**
 * A/B Testing Framework
 * Task 36.8: A/B Testing Framework
 * Multi-account A/B testing system with statistical significance tracking and winner selection
 */

import { createClient } from "@supabase/supabase-js";

export interface ABTestFrameworkConfig {
  name: string;
  description: string;
  testType:
    | "content"
    | "subject_line"
    | "creative"
    | "audience"
    | "timing"
    | "landing_page"
    | "email"
    | "social";
  platforms: string[];
  accounts: string[];
  hypothesis: string;
  successMetrics: string[];
  targetAudience: string;
  sampleSize: number;
  trafficSplit: "equal" | "weighted" | "adaptive";
  significanceThreshold: number;
  minimumDetectableEffect: number;
  maxDurationDays: number;
  autoWinnerDeclaration: boolean;
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  isControl: boolean;
  trafficPercentage: number;
  content: Record<string, any>;
  platforms: string[];
  accounts: string[];
  metrics: ABTestMetrics;
  status: "active" | "paused" | "stopped";
}

export interface ABTestMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  cost: number;
  engagement: number;
  shares: number;
  comments: number;
  likes: number;
  reach: number;
  clickThroughRate: number;
  conversionRate: number;
  costPerConversion: number;
  returnOnAdSpend: number;
  engagementRate: number;
  lastUpdated: Date;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  config: ABTestFrameworkConfig;
  status: "draft" | "running" | "paused" | "completed" | "cancelled";
  variants: ABTestVariant[];
  startDate: Date;
  endDate?: Date;
  duration: number;
  currentSignificance: number;
  confidenceLevel: number;
  winnerVariantId?: string;
  winnerDeclaredAt?: Date;
  statistical: {
    pValue: number;
    effectSize: number;
    powerAnalysis: number;
    sampleSizeReached: boolean;
    minimumSampleSize: number;
  };
  results?: ABTestResults;
  insights: ABTestInsight[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ABTestResults {
  testId: string;
  winnerVariantId: string;
  confidenceLevel: number;
  statisticalSignificance: number;
  improvementPercentage: number;
  pValue: number;
  effectSize: number;
  recommendation: string;
  insights: ABTestInsight[];
  performanceComparison: VariantComparison[];
  costAnalysis: {
    totalCost: number;
    costPerVariant: number;
    roi: number;
    costEfficiency: number;
  };
  platformPerformance: Array<{
    platform: string;
    performance: Record<string, number>;
    winnerVariant: string;
  }>;
  audienceSegments: Array<{
    segment: string;
    performance: Record<string, number>;
    winnerVariant: string;
  }>;
}

export interface VariantComparison {
  variantId: string;
  variantName: string;
  isWinner: boolean;
  isControl: boolean;
  metrics: ABTestMetrics;
  improvementOverControl: number;
  confidence: number;
  significance: number;
}

export interface ABTestInsight {
  type: "performance" | "statistical" | "cost" | "audience" | "platform";
  category: string;
  message: string;
  impact: "high" | "medium" | "low";
  actionable: boolean;
  recommendation?: string;
  confidence: number;
  metadata: Record<string, any>;
}

export interface TestingStrategy {
  timeline: Array<{
    week: number;
    tests: string[];
    focus: string;
    expectedResults: string;
  }>;
  prioritization: Array<{
    testType: string;
    priority: number;
    reasoning: string;
    expectedImpact: string;
  }>;
  resourceAllocation: {
    budget: number;
    teamMembers: number;
    timeInvestment: number;
  };
}

export class ABTestingFramework {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  private readonly CONFIG = {
    maxConcurrentTests: 10,
    minSampleSize: 100,
    maxSampleSize: 1000000,
    defaultSignificanceThreshold: 95,
    defaultConfidenceLevel: 95,
    defaultTrafficSplit: 50,
    statisticalPowerThreshold: 80,
    minimumTestDuration: 24, // hours
    maximumTestDuration: 30 * 24, // hours (30 days)
    earlyStoppingThreshold: 99, // significance level for early stopping
  };

  /**
   * Create a new A/B test
   */
  async createABTest(
    config: ABTestFrameworkConfig,
    variants: Omit<ABTestVariant, "id" | "metrics">[]
  ): Promise<ABTest> {
    console.log("Creating A/B test:", config.name);

    // Validate configuration
    this.validateTestConfiguration(config, variants);

    // Generate test ID
    const testId = `ab-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Calculate minimum sample size
    const minSampleSize = this.calculateMinimumSampleSize(
      config.minimumDetectableEffect,
      config.significanceThreshold
    );

    // Create variants with IDs and initialized metrics
    const testVariants: ABTestVariant[] = variants.map((variant, index) => ({
      ...variant,
      id: `variant-${testId}-${index}`,
      metrics: this.initializeMetrics(),
      status: "active",
    }));

    // Create the test
    const test: ABTest = {
      id: testId,
      name: config.name,
      description: config.description,
      config,
      status: "draft",
      variants: testVariants,
      startDate: new Date(),
      duration: config.maxDurationDays * 24,
      currentSignificance: 0,
      confidenceLevel: 0,
      statistical: {
        pValue: 1,
        effectSize: 0,
        powerAnalysis: 0,
        sampleSizeReached: false,
        minimumSampleSize: minSampleSize,
      },
      insights: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "system",
    };

    // Store in database
    await this.storeABTest(test);

    console.log(`A/B test created successfully: ${testId}`);
    return test;
  }

  /**
   * Start an A/B test
   */
  async startABTest(testId: string): Promise<ABTest> {
    console.log("Starting A/B test:", testId);

    const test = await this.getABTest(testId);
    if (!test) throw new Error("Test not found");

    if (test.status !== "draft") {
      throw new Error("Test can only be started from draft status");
    }

    test.status = "running";
    test.startDate = new Date();
    test.updatedAt = new Date();

    await this.updateABTest(test);

    // Initialize tracking for all platforms and accounts
    await this.initializeTestTracking(test);

    console.log(`A/B test started: ${testId}`);
    return test;
  }

  /**
   * Update test metrics from external sources
   */
  async updateTestMetrics(
    testId: string,
    variantId: string,
    metrics: Partial<ABTestMetrics>
  ): Promise<void> {
    const test = await this.getABTest(testId);
    if (!test) throw new Error("Test not found");

    const variant = test.variants.find(v => v.id === variantId);
    if (!variant) throw new Error("Variant not found");

    // Update metrics
    Object.assign(variant.metrics, metrics, { lastUpdated: new Date() });

    // Recalculate derived metrics
    this.calculateDerivedMetrics(variant);

    // Analyze statistical significance
    await this.analyzeStatisticalSignificance(test);

    // Check for auto winner declaration
    if (test.config.autoWinnerDeclaration) {
      await this.checkAutoWinnerDeclaration(test);
    }

    await this.updateABTest(test);
  }

  /**
   * Analyze A/B test results
   */
  async analyzeTestResults(testId: string): Promise<ABTestResults> {
    console.log("Analyzing A/B test results:", testId);

    const test = await this.getABTest(testId);
    if (!test) throw new Error("Test not found");

    const controlVariant = test.variants.find(v => v.isControl);
    if (!controlVariant) throw new Error("No control variant found");

    const testVariants = test.variants.filter(v => !v.isControl);

    let bestVariant = controlVariant;
    let maxImprovement = 0;
    let maxSignificance = 0;

    // Compare all variants against control
    const comparisons: VariantComparison[] = [];

    for (const variant of test.variants) {
      const significance = this.calculateStatisticalSignificance(
        controlVariant.metrics,
        variant.metrics
      );

      const improvement = variant.isControl
        ? 0
        : this.calculateImprovement(
            controlVariant.metrics.conversionRate,
            variant.metrics.conversionRate
          );

      comparisons.push({
        variantId: variant.id,
        variantName: variant.name,
        isWinner: false,
        isControl: variant.isControl,
        metrics: variant.metrics,
        improvementOverControl: improvement,
        confidence: Math.min(99.9, significance),
        significance,
      });

      if (
        !variant.isControl &&
        significance >= test.config.significanceThreshold &&
        improvement > maxImprovement
      ) {
        bestVariant = variant;
        maxImprovement = improvement;
        maxSignificance = significance;
      }
    }

    // Mark winner
    const winnerComparison = comparisons.find(
      c => c.variantId === bestVariant.id
    );
    if (winnerComparison) winnerComparison.isWinner = true;

    const pValue = this.calculatePValue(
      controlVariant.metrics,
      bestVariant.metrics
    );
    const effectSize = this.calculateEffectSize(
      controlVariant.metrics,
      bestVariant.metrics
    );

    // Analyze platform performance
    const platformPerformance = this.analyzePlatformPerformance(test);

    // Analyze audience segments
    const audienceSegments = this.analyzeAudienceSegments(test);

    // Calculate cost analysis
    const costAnalysis = this.calculateCostAnalysis(test);

    // Generate insights
    const insights = this.generateTestInsights(
      test,
      bestVariant,
      maxImprovement,
      maxSignificance
    );

    const results: ABTestResults = {
      testId,
      winnerVariantId: bestVariant.id,
      confidenceLevel: Math.min(99.9, maxSignificance),
      statisticalSignificance: maxSignificance,
      improvementPercentage: maxImprovement,
      pValue,
      effectSize,
      recommendation: this.generateRecommendation(
        test,
        bestVariant,
        maxImprovement,
        maxSignificance
      ),
      insights,
      performanceComparison: comparisons,
      costAnalysis,
      platformPerformance,
      audienceSegments,
    };

    // Update test with results
    test.results = results;
    test.winnerVariantId = bestVariant.id;
    test.currentSignificance = maxSignificance;
    test.confidenceLevel = Math.min(99.9, maxSignificance);
    test.statistical.pValue = pValue;
    test.statistical.effectSize = effectSize;
    test.insights = insights;

    await this.updateABTest(test);

    console.log(`A/B test analysis completed: ${testId}`);
    return results;
  }

  /**
   * Complete an A/B test
   */
  async completeABTest(testId: string): Promise<ABTest> {
    console.log("Completing A/B test:", testId);

    const test = await this.getABTest(testId);
    if (!test) throw new Error("Test not found");

    // Analyze final results
    const results = await this.analyzeTestResults(testId);

    test.status = "completed";
    test.endDate = new Date();
    test.winnerDeclaredAt = new Date();
    test.updatedAt = new Date();

    await this.updateABTest(test);

    console.log(`A/B test completed: ${testId}`);
    return test;
  }

  /**
   * Generate testing strategy recommendations
   */
  async generateTestingStrategy(
    objectives: string[],
    timeframe: "quarter" | "month" | "week",
    budget: number
  ): Promise<TestingStrategy> {
    console.log("Generating testing strategy...");

    const weeks = timeframe === "quarter" ? 12 : timeframe === "month" ? 4 : 1;
    const testsPerWeek = Math.min(3, Math.floor(budget / 5000)); // Estimated cost per test

    // Prioritize test types based on objectives
    const testPriorities = this.prioritizeTestTypes(objectives);

    // Create timeline
    const timeline = [];
    for (let week = 1; week <= weeks; week++) {
      const weekTests = testPriorities.slice(
        (week - 1) * testsPerWeek,
        week * testsPerWeek
      );
      timeline.push({
        week,
        tests: weekTests.map(t => t.testType),
        focus: this.getWeeklyFocus(week, objectives),
        expectedResults: this.getExpectedResults(weekTests),
      });
    }

    return {
      timeline,
      prioritization: testPriorities,
      resourceAllocation: {
        budget: budget,
        teamMembers: Math.ceil(testsPerWeek * 0.5),
        timeInvestment: testsPerWeek * 40, // hours per week
      },
    };
  }

  /**
   * Get comprehensive A/B testing analytics
   */
  async getTestingAnalytics(timeframe: "7d" | "30d" | "90d" = "30d") {
    console.log("Generating A/B testing analytics...");

    const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    try {
      const { data: tests, error } = await this.supabase
        .from("ab_tests")
        .select("*")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      const totalTests = tests?.length || 0;
      const runningTests =
        tests?.filter(t => t.status === "running").length || 0;
      const completedTests =
        tests?.filter(t => t.status === "completed").length || 0;
      const testsWithWinners =
        tests?.filter(t => t.winner_variant_id).length || 0;

      const avgImprovement =
        testsWithWinners > 0
          ? tests
              ?.filter(t => t.results?.improvementPercentage)
              .reduce(
                (sum, t) => sum + (t.results.improvementPercentage || 0),
                0
              ) / testsWithWinners || 0
          : 0;

      const successRate =
        completedTests > 0 ? (testsWithWinners / completedTests) * 100 : 0;

      return {
        summary: {
          totalTests,
          runningTests,
          completedTests,
          testsWithWinners,
          successRate,
          avgImprovement,
        },
        testTypes: this.categorizeTestsByType(tests || []),
        platformPerformance: this.categorizeTestsByPlatform(tests || []),
        trends: this.analyzeTestingTrends(tests || []),
        recommendations: this.generateAnalyticsRecommendations(tests || []),
      };
    } catch (error) {
      console.error("Error generating analytics:", error);
      throw error;
    }
  }

  // Private helper methods...

  private validateTestConfiguration(
    config: ABTestFrameworkConfig,
    variants: any[]
  ): void {
    if (variants.length < 2) {
      throw new Error("A/B test requires at least 2 variants");
    }

    const controlVariants = variants.filter(v => v.isControl);
    if (controlVariants.length !== 1) {
      throw new Error("A/B test requires exactly one control variant");
    }

    if (config.sampleSize < this.CONFIG.minSampleSize) {
      throw new Error(
        `Sample size too small. Minimum: ${this.CONFIG.minSampleSize}`
      );
    }

    if (
      config.significanceThreshold < 80 ||
      config.significanceThreshold > 99
    ) {
      throw new Error("Significance threshold must be between 80% and 99%");
    }
  }

  private calculateMinimumSampleSize(
    mde: number,
    significance: number
  ): number {
    // Simplified sample size calculation
    const alpha = (100 - significance) / 100;
    const beta = 0.2; // 80% power
    const zAlpha = this.getZScore(significance);
    const zBeta = this.getZScore(80);

    const p = 0.05; // Assumed baseline conversion rate
    const samplesPerVariant =
      (Math.pow(zAlpha + zBeta, 2) * 2 * p * (1 - p)) / Math.pow(mde / 100, 2);

    return Math.ceil(samplesPerVariant * 2); // Total for both variants
  }

  private initializeMetrics(): ABTestMetrics {
    return {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      cost: 0,
      engagement: 0,
      shares: 0,
      comments: 0,
      likes: 0,
      reach: 0,
      clickThroughRate: 0,
      conversionRate: 0,
      costPerConversion: 0,
      returnOnAdSpend: 0,
      engagementRate: 0,
      lastUpdated: new Date(),
    };
  }

  private calculateDerivedMetrics(variant: ABTestVariant): void {
    const m = variant.metrics;
    m.clickThroughRate =
      m.impressions > 0 ? (m.clicks / m.impressions) * 100 : 0;
    m.conversionRate = m.clicks > 0 ? (m.conversions / m.clicks) * 100 : 0;
    m.costPerConversion = m.conversions > 0 ? m.cost / m.conversions : 0;
    m.returnOnAdSpend = m.cost > 0 ? (m.revenue / m.cost) * 100 : 0;
    m.engagementRate =
      m.impressions > 0
        ? ((m.likes + m.comments + m.shares) / m.impressions) * 100
        : 0;
  }

  private calculateStatisticalSignificance(
    control: ABTestMetrics,
    variant: ABTestMetrics
  ): number {
    const p1 = control.conversions / control.impressions;
    const p2 = variant.conversions / variant.impressions;
    const n1 = control.impressions;
    const n2 = variant.impressions;

    if (n1 === 0 || n2 === 0) return 0;

    const pPooled = (control.conversions + variant.conversions) / (n1 + n2);
    const seDiff = Math.sqrt(pPooled * (1 - pPooled) * (1 / n1 + 1 / n2));

    if (seDiff === 0) return 0;

    const zScore = Math.abs(p2 - p1) / seDiff;
    return (1 - 2 * this.normalCDF(-Math.abs(zScore))) * 100;
  }

  private calculateImprovement(
    controlRate: number,
    variantRate: number
  ): number {
    return controlRate > 0
      ? ((variantRate - controlRate) / controlRate) * 100
      : 0;
  }

  private calculatePValue(
    control: ABTestMetrics,
    variant: ABTestMetrics
  ): number {
    const p1 = control.conversions / control.impressions;
    const p2 = variant.conversions / variant.impressions;
    const n1 = control.impressions;
    const n2 = variant.impressions;

    if (n1 === 0 || n2 === 0) return 1;

    const pPooled = (control.conversions + variant.conversions) / (n1 + n2);
    const seDiff = Math.sqrt(pPooled * (1 - pPooled) * (1 / n1 + 1 / n2));

    if (seDiff === 0) return 1;

    const zScore = Math.abs(p2 - p1) / seDiff;
    return 2 * this.normalCDF(-Math.abs(zScore));
  }

  private calculateEffectSize(
    control: ABTestMetrics,
    variant: ABTestMetrics
  ): number {
    const p1 = control.conversions / control.impressions;
    const p2 = variant.conversions / variant.impressions;
    const pPooled =
      (control.conversions + variant.conversions) /
      (control.impressions + variant.impressions);

    return Math.abs(p2 - p1) / Math.sqrt(pPooled * (1 - pPooled));
  }

  private normalCDF(x: number): number {
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  private erf(x: number): number {
    // Abramowitz and Stegun approximation
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

  private getZScore(confidenceLevel: number): number {
    const alpha = (100 - confidenceLevel) / 100;
    const lookup: { [key: number]: number } = {
      0.1: 1.645, // 90%
      0.05: 1.96, // 95%
      0.01: 2.576, // 99%
    };
    return lookup[alpha] || 1.96;
  }

  private async storeABTest(test: ABTest): Promise<void> {
    try {
      const { error } = await this.supabase.from("ab_tests").insert({
        id: test.id,
        name: test.name,
        description: test.description,
        config: test.config,
        status: test.status,
        variants: test.variants,
        start_date: test.startDate.toISOString(),
        duration: test.duration,
        current_significance: test.currentSignificance,
        confidence_level: test.confidenceLevel,
        statistical: test.statistical,
        insights: test.insights,
        created_at: test.createdAt.toISOString(),
        updated_at: test.updatedAt.toISOString(),
        created_by: test.createdBy,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Failed to store A/B test:", error);
      throw error;
    }
  }

  private async updateABTest(test: ABTest): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("ab_tests")
        .update({
          status: test.status,
          variants: test.variants,
          end_date: test.endDate?.toISOString(),
          winner_variant_id: test.winnerVariantId,
          winner_declared_at: test.winnerDeclaredAt?.toISOString(),
          current_significance: test.currentSignificance,
          confidence_level: test.confidenceLevel,
          statistical: test.statistical,
          results: test.results,
          insights: test.insights,
          updated_at: new Date().toISOString(),
        })
        .eq("id", test.id);

      if (error) throw error;
    } catch (error) {
      console.error("Failed to update A/B test:", error);
      throw error;
    }
  }

  private async getABTest(testId: string): Promise<ABTest | null> {
    try {
      const { data, error } = await this.supabase
        .from("ab_tests")
        .select("*")
        .eq("id", testId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Failed to get A/B test:", error);
      return null;
    }
  }

  private async initializeTestTracking(test: ABTest): Promise<void> {
    // Implementation would initialize tracking pixels, conversion tracking, etc.
    console.log(
      "Initializing test tracking for platforms:",
      test.config.platforms
    );
  }

  private async analyzeStatisticalSignificance(test: ABTest): Promise<void> {
    const controlVariant = test.variants.find(v => v.isControl);
    if (!controlVariant) return;

    let maxSignificance = 0;
    for (const variant of test.variants) {
      if (!variant.isControl) {
        const significance = this.calculateStatisticalSignificance(
          controlVariant.metrics,
          variant.metrics
        );
        maxSignificance = Math.max(maxSignificance, significance);
      }
    }

    test.currentSignificance = maxSignificance;
    test.confidenceLevel = Math.min(99.9, maxSignificance);
  }

  private async checkAutoWinnerDeclaration(test: ABTest): Promise<void> {
    if (test.currentSignificance >= this.CONFIG.earlyStoppingThreshold) {
      await this.completeABTest(test.id);
    }
  }

  private analyzePlatformPerformance(test: ABTest) {
    return test.config.platforms.map(platform => ({
      platform,
      performance: {
        impressions: test.variants.reduce(
          (sum, v) => sum + v.metrics.impressions,
          0
        ),
        conversions: test.variants.reduce(
          (sum, v) => sum + v.metrics.conversions,
          0
        ),
        cost: test.variants.reduce((sum, v) => sum + v.metrics.cost, 0),
      },
      winnerVariant: test.winnerVariantId || "",
    }));
  }

  private analyzeAudienceSegments(test: ABTest) {
    return [
      {
        segment: test.config.targetAudience,
        performance: {
          impressions: test.variants.reduce(
            (sum, v) => sum + v.metrics.impressions,
            0
          ),
          conversions: test.variants.reduce(
            (sum, v) => sum + v.metrics.conversions,
            0
          ),
        },
        winnerVariant: test.winnerVariantId || "",
      },
    ];
  }

  private calculateCostAnalysis(test: ABTest) {
    const totalCost = test.variants.reduce((sum, v) => sum + v.metrics.cost, 0);
    const totalRevenue = test.variants.reduce(
      (sum, v) => sum + v.metrics.revenue,
      0
    );

    return {
      totalCost,
      costPerVariant: totalCost / test.variants.length,
      roi: totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0,
      costEfficiency: totalCost > 0 ? totalRevenue / totalCost : 0,
    };
  }

  private generateTestInsights(
    test: ABTest,
    bestVariant: ABTestVariant,
    improvement: number,
    significance: number
  ): ABTestInsight[] {
    const insights: ABTestInsight[] = [];

    if (significance >= test.config.significanceThreshold) {
      insights.push({
        type: "statistical",
        category: "significance",
        message: `Test reached statistical significance with ${significance.toFixed(1)}% confidence`,
        impact: "high",
        actionable: true,
        recommendation: "Implement winning variant",
        confidence: significance / 100,
        metadata: {
          significance,
          threshold: test.config.significanceThreshold,
        },
      });
    }

    if (improvement > 20) {
      insights.push({
        type: "performance",
        category: "improvement",
        message: `Exceptional improvement of ${improvement.toFixed(1)}% detected`,
        impact: "high",
        actionable: true,
        recommendation: "Prioritize immediate implementation",
        confidence: 0.95,
        metadata: { improvement },
      });
    }

    return insights;
  }

  private generateRecommendation(
    test: ABTest,
    winner: ABTestVariant,
    improvement: number,
    significance: number
  ): string {
    if (significance < test.config.significanceThreshold) {
      return "Test has not reached statistical significance. Consider extending the test duration or increasing sample size.";
    }

    if (improvement < 5) {
      return "While statistically significant, the improvement is minimal. Consider testing more dramatic variations.";
    }

    if (improvement >= 20) {
      return `Excellent results! Implement ${winner.name} immediately. The ${improvement.toFixed(1)}% improvement is substantial and should be rolled out across all campaigns.`;
    }

    return `Good results! ${winner.name} shows a ${improvement.toFixed(1)}% improvement. Implement this variant and consider similar optimizations in future tests.`;
  }

  private prioritizeTestTypes(objectives: string[]) {
    const priorities = [
      {
        testType: "subject_line",
        priority: 1,
        reasoning: "High impact on open rates",
        expectedImpact: "10-30% improvement in open rates",
      },
      {
        testType: "creative",
        priority: 2,
        reasoning: "Visual elements drive engagement",
        expectedImpact: "5-25% improvement in CTR",
      },
      {
        testType: "content",
        priority: 3,
        reasoning: "Message optimization for conversions",
        expectedImpact: "5-20% improvement in conversion rate",
      },
      {
        testType: "audience",
        priority: 4,
        reasoning: "Targeting refinement",
        expectedImpact: "10-40% improvement in ROAS",
      },
      {
        testType: "timing",
        priority: 5,
        reasoning: "Optimization of send times",
        expectedImpact: "5-15% improvement in engagement",
      },
    ];

    return priorities.slice(0, 10); // Return top 10 priorities
  }

  private getWeeklyFocus(week: number, objectives: string[]): string {
    const focuses = [
      "Foundation Building",
      "Performance Optimization",
      "Conversion Enhancement",
      "Audience Refinement",
    ];
    return focuses[(week - 1) % focuses.length];
  }

  private getExpectedResults(tests: any[]): string {
    return `Expected 10-25% improvement across ${tests.length} test${tests.length > 1 ? "s" : ""}`;
  }

  private categorizeTestsByType(tests: any[]) {
    const types: Record<string, number> = {};
    tests.forEach(test => {
      const type = test.config?.testType || "unknown";
      types[type] = (types[type] || 0) + 1;
    });
    return Object.entries(types).map(([type, count]) => ({ type, count }));
  }

  private categorizeTestsByPlatform(tests: any[]) {
    const platforms: Record<string, number> = {};
    tests.forEach(test => {
      (test.config?.platforms || []).forEach((platform: string) => {
        platforms[platform] = (platforms[platform] || 0) + 1;
      });
    });
    return Object.entries(platforms).map(([platform, count]) => ({
      platform,
      count,
    }));
  }

  private analyzeTestingTrends(tests: any[]) {
    return {
      totalTests: tests.length,
      successRate:
        tests.length > 0
          ? (tests.filter(t => t.winner_variant_id).length / tests.length) * 100
          : 0,
      avgImprovement:
        tests.length > 0
          ? tests
              .filter(t => t.results?.improvementPercentage)
              .reduce(
                (sum, t) => sum + (t.results.improvementPercentage || 0),
                0
              ) / tests.length
          : 0,
    };
  }

  private generateAnalyticsRecommendations(tests: any[]): string[] {
    const recommendations = [];

    if (tests.length < 5) {
      recommendations.push(
        "Increase testing frequency to gather more insights"
      );
    }

    const successRate =
      tests.length > 0
        ? (tests.filter(t => t.winner_variant_id).length / tests.length) * 100
        : 0;
    if (successRate < 60) {
      recommendations.push(
        "Consider testing more dramatic variations to improve success rate"
      );
    }

    return recommendations;
  }
}

export default ABTestingFramework;
