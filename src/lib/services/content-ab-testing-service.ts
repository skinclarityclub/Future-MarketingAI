// Content A/B Testing Service
export interface ContentABTest {
  id: string;
  name: string;
  content_id?: string;
  status: "draft" | "running" | "completed" | "paused";
  test_type: "text" | "subject_line" | "image" | "cta" | "timing" | "audience";
  variants: ContentVariant[];
  start_date: Date;
  end_date?: Date;
  duration_hours: number;
  target_audience: string;
  sample_size: number;
  traffic_split_type: "equal" | "weighted" | "adaptive";
  significance_threshold: number;
  current_significance?: number;
  confidence_level?: number;
  winner?: string;
  auto_declare_winner: boolean;
  created_at: Date;
  updated_at: Date;
  platform: string[];
  objectives: string[];
  hypothesis: string;
}

export interface ContentVariant {
  id: string;
  name: string;
  traffic_percentage: number;
  is_control: boolean;
  content: ContentVariantData;
  metrics: ContentVariantMetrics;
  performance_score: number;
  statistical_significance?: number;
}

export interface ContentVariantData {
  text?: string;
  subject_line?: string;
  image_url?: string;
  cta_text?: string;
  post_time?: string;
  headline?: string;
  description?: string;
  hashtags?: string[];
  tone?: string;
  length?: number;
}

export interface ContentVariantMetrics {
  impressions: number;
  clicks: number;
  shares: number;
  comments: number;
  likes: number;
  conversions: number;
  engagement_rate: number;
  click_through_rate: number;
  conversion_rate: number;
  cost_per_engagement: number;
  reach: number;
  saves?: number;
  video_completion_rate?: number;
  time_spent?: number;
}

export interface ABTestResult {
  test_id: string;
  winner_variant_id?: string;
  confidence_level: number;
  improvement_percentage: number;
  statistical_significance: number;
  p_value: number;
  effect_size: number;
  recommendation: string;
  insights: ABTestInsight[];
}

export interface ABTestInsight {
  type: "performance" | "audience" | "timing" | "content" | "platform";
  title: string;
  description: string;
  importance: "high" | "medium" | "low";
  actionable: boolean;
  recommendation?: string;
}

export interface ABTestConfiguration {
  name: string;
  test_type: ContentABTest["test_type"];
  target_audience: string;
  sample_size: number;
  duration_hours: number;
  significance_threshold: number;
  traffic_split_type: ContentABTest["traffic_split_type"];
  auto_declare_winner: boolean;
  platform: string[];
  objectives: string[];
  hypothesis: string;
  variants: Omit<ContentVariant, "id" | "metrics" | "performance_score">[];
}

class ContentABTestingService {
  private apiUrl = "/api/content-ab-testing";

  /**
   * Create a new A/B test for content
   */
  async createABTest(config: ABTestConfiguration): Promise<ContentABTest> {
    try {
      const response = await fetch(`${this.apiUrl}/tests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error("Failed to create A/B test");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating A/B test:", error);
      throw error;
    }
  }

  /**
   * Get all A/B tests with optional filtering
   */
  async getABTests(filters?: {
    status?: ContentABTest["status"];
    test_type?: ContentABTest["test_type"];
    platform?: string;
  }): Promise<ContentABTest[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
      }

      const response = await fetch(`${this.apiUrl}/tests?${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch A/B tests");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching A/B tests:", error);
      return this.getMockABTests();
    }
  }

  /**
   * Get a specific A/B test by ID
   */
  async getABTest(testId: string): Promise<ContentABTest> {
    try {
      const response = await fetch(`${this.apiUrl}/tests/${testId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch A/B test");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching A/B test:", error);
      throw error;
    }
  }

  /**
   * Update an A/B test
   */
  async updateABTest(
    testId: string,
    updates: Partial<ContentABTest>
  ): Promise<ContentABTest> {
    try {
      const response = await fetch(`${this.apiUrl}/tests/${testId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update A/B test");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating A/B test:", error);
      throw error;
    }
  }

  /**
   * Start an A/B test
   */
  async startABTest(testId: string): Promise<ContentABTest> {
    return this.updateABTest(testId, {
      status: "running",
      start_date: new Date(),
      updated_at: new Date(),
    });
  }

  /**
   * Pause an A/B test
   */
  async pauseABTest(testId: string): Promise<ContentABTest> {
    return this.updateABTest(testId, {
      status: "paused",
      updated_at: new Date(),
    });
  }

  /**
   * Complete an A/B test
   */
  async completeABTest(testId: string): Promise<ContentABTest> {
    const test = await this.getABTest(testId);
    const result = this.analyzeTestResults(test);

    return this.updateABTest(testId, {
      status: "completed",
      end_date: new Date(),
      winner: result.winner_variant_id,
      current_significance: result.statistical_significance,
      confidence_level: result.confidence_level,
      updated_at: new Date(),
    });
  }

  /**
   * Delete an A/B test
   */
  async deleteABTest(testId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/tests/${testId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete A/B test");
      }
    } catch (error) {
      console.error("Error deleting A/B test:", error);
      throw error;
    }
  }

  /**
   * Duplicate an A/B test
   */
  async duplicateABTest(
    testId: string,
    newName?: string
  ): Promise<ContentABTest> {
    try {
      const originalTest = await this.getABTest(testId);

      const duplicateConfig: ABTestConfiguration = {
        name: newName || `${originalTest.name} (Copy)`,
        test_type: originalTest.test_type,
        target_audience: originalTest.target_audience,
        sample_size: originalTest.sample_size,
        duration_hours: originalTest.duration_hours,
        significance_threshold: originalTest.significance_threshold,
        traffic_split_type: originalTest.traffic_split_type,
        auto_declare_winner: originalTest.auto_declare_winner,
        platform: originalTest.platform,
        objectives: originalTest.objectives,
        hypothesis: originalTest.hypothesis,
        variants: originalTest.variants.map(variant => ({
          name: variant.name,
          traffic_percentage: variant.traffic_percentage,
          is_control: variant.is_control,
          content: variant.content,
        })),
      };

      return this.createABTest(duplicateConfig);
    } catch (error) {
      console.error("Error duplicating A/B test:", error);
      throw error;
    }
  }

  /**
   * Analyze A/B test results and determine winner
   */
  analyzeTestResults(test: ContentABTest): ABTestResult {
    const controlVariant = test.variants.find(v => v.is_control);
    const testVariants = test.variants.filter(v => !v.is_control);

    if (!controlVariant || testVariants.length === 0) {
      throw new Error(
        "Invalid test configuration: missing control or test variants"
      );
    }

    let bestVariant = controlVariant;
    let maxImprovement = 0;
    let bestSignificance = 0;

    testVariants.forEach(variant => {
      const significance = this.calculateStatisticalSignificance(
        controlVariant.metrics,
        variant.metrics
      );

      const improvement = this.calculateImprovement(
        controlVariant.metrics.conversion_rate,
        variant.metrics.conversion_rate
      );

      if (
        significance >= test.significance_threshold &&
        improvement > maxImprovement
      ) {
        bestVariant = variant;
        maxImprovement = improvement;
        bestSignificance = significance;
      }
    });

    const pValue = this.calculatePValue(
      controlVariant.metrics,
      bestVariant.metrics
    );
    const effectSize = this.calculateEffectSize(
      controlVariant.metrics,
      bestVariant.metrics
    );

    return {
      test_id: test.id,
      winner_variant_id: bestVariant.id,
      confidence_level: Math.min(99, bestSignificance),
      improvement_percentage: maxImprovement,
      statistical_significance: bestSignificance,
      p_value: pValue,
      effect_size: effectSize,
      recommendation: this.generateRecommendation(
        test,
        bestVariant,
        maxImprovement,
        bestSignificance
      ),
      insights: this.generateInsights(test, bestVariant),
    };
  }

  /**
   * Calculate statistical significance between two variants
   */
  private calculateStatisticalSignificance(
    controlMetrics: ContentVariantMetrics,
    variantMetrics: ContentVariantMetrics
  ): number {
    const p1 = controlMetrics.conversions / controlMetrics.impressions;
    const p2 = variantMetrics.conversions / variantMetrics.impressions;

    const n1 = controlMetrics.impressions;
    const n2 = variantMetrics.impressions;

    const pPooled =
      (controlMetrics.conversions + variantMetrics.conversions) / (n1 + n2);
    const seDiff = Math.sqrt(pPooled * (1 - pPooled) * (1 / n1 + 1 / n2));

    if (seDiff === 0) return 0;

    const zScore = Math.abs(p2 - p1) / seDiff;

    // Convert z-score to confidence level (simplified)
    const confidence = (1 - 2 * this.normalCDF(-Math.abs(zScore))) * 100;
    return Math.max(0, Math.min(99.9, confidence));
  }

  /**
   * Calculate percentage improvement
   */
  private calculateImprovement(
    controlValue: number,
    variantValue: number
  ): number {
    if (controlValue === 0) return variantValue > 0 ? 100 : 0;
    return ((variantValue - controlValue) / controlValue) * 100;
  }

  /**
   * Calculate p-value (simplified approximation)
   */
  private calculatePValue(
    controlMetrics: ContentVariantMetrics,
    variantMetrics: ContentVariantMetrics
  ): number {
    const p1 = controlMetrics.conversions / controlMetrics.impressions;
    const p2 = variantMetrics.conversions / variantMetrics.impressions;

    const n1 = controlMetrics.impressions;
    const n2 = variantMetrics.impressions;

    const pPooled =
      (controlMetrics.conversions + variantMetrics.conversions) / (n1 + n2);
    const seDiff = Math.sqrt(pPooled * (1 - pPooled) * (1 / n1 + 1 / n2));

    if (seDiff === 0) return 1;

    const zScore = Math.abs(p2 - p1) / seDiff;
    return 2 * this.normalCDF(-Math.abs(zScore));
  }

  /**
   * Calculate effect size (Cohen's d approximation)
   */
  private calculateEffectSize(
    controlMetrics: ContentVariantMetrics,
    variantMetrics: ContentVariantMetrics
  ): number {
    const p1 = controlMetrics.conversions / controlMetrics.impressions;
    const p2 = variantMetrics.conversions / variantMetrics.impressions;

    const pooledP =
      (controlMetrics.conversions + variantMetrics.conversions) /
      (controlMetrics.impressions + variantMetrics.impressions);
    const pooledSD = Math.sqrt(pooledP * (1 - pooledP));

    if (pooledSD === 0) return 0;

    return Math.abs(p2 - p1) / pooledSD;
  }

  /**
   * Normal cumulative distribution function (approximation)
   */
  private normalCDF(x: number): number {
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  /**
   * Error function approximation
   */
  private erf(x: number): number {
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

  /**
   * Generate recommendation based on test results
   */
  private generateRecommendation(
    test: ContentABTest,
    winnerVariant: ContentVariant,
    improvement: number,
    significance: number
  ): string {
    if (significance < test.significance_threshold) {
      return "Test did not reach statistical significance. Consider running the test longer or increasing sample size.";
    }

    if (improvement < 5) {
      return "While statistically significant, the improvement is minimal. Consider testing more dramatic variations.";
    }

    if (improvement >= 20) {
      return `Excellent results! Implement the winning variant immediately. ${improvement.toFixed(1)}% improvement is substantial.`;
    }

    return `Good results! The winning variant shows a ${improvement.toFixed(1)}% improvement. Implement this change and consider similar optimizations.`;
  }

  /**
   * Generate insights from test results
   */
  private generateInsights(
    test: ContentABTest,
    winnerVariant: ContentVariant
  ): ABTestInsight[] {
    const insights: ABTestInsight[] = [];

    // Performance insight
    if (winnerVariant.metrics.engagement_rate > 5) {
      insights.push({
        type: "performance",
        title: "High Engagement Achieved",
        description: `The winning variant achieved ${winnerVariant.metrics.engagement_rate.toFixed(1)}% engagement rate.`,
        importance: "high",
        actionable: true,
        recommendation: "Apply similar content strategies to other campaigns.",
      });
    }

    // Content insight based on test type
    if (
      test.test_type === "subject_line" &&
      winnerVariant.content.subject_line
    ) {
      insights.push({
        type: "content",
        title: "Subject Line Strategy",
        description: `The winning subject line "${winnerVariant.content.subject_line}" outperformed the control.`,
        importance: "medium",
        actionable: true,
        recommendation:
          "Analyze the elements that made this subject line successful and apply to future emails.",
      });
    }

    // Timing insight
    if (test.test_type === "timing") {
      insights.push({
        type: "timing",
        title: "Optimal Posting Time Identified",
        description:
          "The winning variant's posting time showed better engagement.",
        importance: "medium",
        actionable: true,
        recommendation: "Schedule similar content at this optimal time.",
      });
    }

    // Platform insight
    if (test.platform.length > 1) {
      insights.push({
        type: "platform",
        title: "Cross-Platform Performance",
        description: "Test results may vary across different platforms.",
        importance: "medium",
        actionable: true,
        recommendation:
          "Consider platform-specific optimizations in future tests.",
      });
    }

    return insights;
  }

  /**
   * Get test recommendations based on content type and performance
   */
  async getTestRecommendations(contentId?: string): Promise<{
    recommended_tests: Array<{
      test_type: ContentABTest["test_type"];
      priority: "high" | "medium" | "low";
      reason: string;
      estimated_improvement: string;
    }>;
  }> {
    // This would typically analyze historical data and content performance
    return {
      recommended_tests: [
        {
          test_type: "subject_line",
          priority: "high",
          reason: "Subject lines significantly impact open rates",
          estimated_improvement: "15-30%",
        },
        {
          test_type: "cta",
          priority: "high",
          reason: "Call-to-action optimization can boost conversions",
          estimated_improvement: "20-40%",
        },
        {
          test_type: "text",
          priority: "medium",
          reason: "Content messaging affects engagement",
          estimated_improvement: "10-25%",
        },
        {
          test_type: "timing",
          priority: "medium",
          reason: "Posting time impacts reach and engagement",
          estimated_improvement: "5-15%",
        },
      ],
    };
  }

  /**
   * Get A/B testing analytics and summary
   */
  async getABTestAnalytics(): Promise<{
    summary: {
      total_tests: number;
      running_tests: number;
      completed_tests: number;
      success_rate: number;
      avg_improvement: number;
      total_sample_size: number;
    };
    performance_by_type: Array<{
      test_type: string;
      tests_count: number;
      success_rate: number;
      avg_improvement: number;
    }>;
    recent_winners: Array<{
      test_name: string;
      improvement: number;
      confidence: number;
      completed_date: string;
    }>;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/analytics`);
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching A/B test analytics:", error);
      return this.getMockAnalytics();
    }
  }

  /**
   * Mock data for development
   */
  private getMockABTests(): ContentABTest[] {
    return [
      {
        id: "content-ab-001",
        name: "Subject Line Test - Newsletter",
        content_id: "content-123",
        status: "running",
        test_type: "subject_line",
        start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        duration_hours: 72,
        target_audience: "Newsletter subscribers",
        sample_size: 5000,
        traffic_split_type: "equal",
        significance_threshold: 95,
        current_significance: 87,
        confidence_level: 92,
        auto_declare_winner: true,
        platform: ["email"],
        objectives: ["increase_open_rate", "improve_engagement"],
        hypothesis: "Subject lines with emojis will increase open rates",
        created_at: new Date(),
        updated_at: new Date(),
        variants: [
          {
            id: "var-001",
            name: "Control",
            traffic_percentage: 50,
            is_control: true,
            content: {
              subject_line: "Weekly Insights: Industry Trends",
            },
            metrics: {
              impressions: 2500,
              clicks: 125,
              shares: 8,
              comments: 3,
              likes: 45,
              conversions: 12,
              engagement_rate: 2.24,
              click_through_rate: 5.0,
              conversion_rate: 9.6,
              cost_per_engagement: 2.1,
              reach: 2300,
            },
            performance_score: 75,
          },
          {
            id: "var-002",
            name: "Variant A",
            traffic_percentage: 50,
            is_control: false,
            content: {
              subject_line: "🚀 This Week's Game-Changing Trends",
            },
            metrics: {
              impressions: 2500,
              clicks: 156,
              shares: 12,
              comments: 7,
              likes: 62,
              conversions: 18,
              engagement_rate: 3.24,
              click_through_rate: 6.24,
              conversion_rate: 11.5,
              cost_per_engagement: 1.8,
              reach: 2400,
            },
            performance_score: 89,
          },
        ],
      },
    ];
  }

  private getMockAnalytics() {
    return {
      summary: {
        total_tests: 16,
        running_tests: 3,
        completed_tests: 12,
        success_rate: 75,
        avg_improvement: 24.5,
        total_sample_size: 45200,
      },
      performance_by_type: [
        {
          test_type: "subject_line",
          tests_count: 5,
          success_rate: 80,
          avg_improvement: 28,
        },
        {
          test_type: "cta",
          tests_count: 3,
          success_rate: 67,
          avg_improvement: 35,
        },
        {
          test_type: "text",
          tests_count: 4,
          success_rate: 75,
          avg_improvement: 22,
        },
        {
          test_type: "image",
          tests_count: 2,
          success_rate: 50,
          avg_improvement: 18,
        },
        {
          test_type: "timing",
          tests_count: 2,
          success_rate: 100,
          avg_improvement: 31,
        },
      ],
      recent_winners: [
        {
          test_name: "CTA Button Test - Landing Page",
          improvement: 35.2,
          confidence: 99,
          completed_date: "2024-06-15",
        },
        {
          test_name: "Email Subject Line - Newsletter",
          improvement: 28.4,
          confidence: 95,
          completed_date: "2024-06-12",
        },
      ],
    };
  }

  /**
   * Performance Analytics Integration
   * Connects A/B testing results with content ROI analysis
   */

  /**
   * Get A/B test performance metrics for ROI analysis
   */
  getTestPerformanceMetrics(testId: string): Promise<{
    content_metrics: any;
    ab_test_impact: any;
    optimization_recommendations: any;
  }> {
    return new Promise(resolve => {
      setTimeout(() => {
        const mockTests = this.getMockABTests();
        const test = mockTests.find((t: ContentABTest) => t.id === testId);
        if (!test) {
          throw new Error("Test not found");
        }

        // Calculate aggregated metrics from all variants
        const totalImpressions = test.variants.reduce(
          (sum: number, v: ContentVariant) => sum + v.metrics.impressions,
          0
        );
        const totalClicks = test.variants.reduce(
          (sum: number, v: ContentVariant) => sum + v.metrics.clicks,
          0
        );
        const totalConversions = test.variants.reduce(
          (sum: number, v: ContentVariant) => sum + v.metrics.conversions,
          0
        );
        const totalEngagements = test.variants.reduce(
          (sum: number, v: ContentVariant) =>
            sum +
            v.metrics.clicks +
            v.metrics.shares +
            v.metrics.comments +
            v.metrics.likes,
          0
        );

        // Find winning variant performance
        const winningVariant = test.winner
          ? test.variants.find(v => v.id === test.winner)
          : test.variants.reduce((prev, current) =>
              current.performance_score > prev.performance_score
                ? current
                : prev
            );

        const controlVariant = test.variants.find(v => v.is_control);

        // Calculate improvement metrics
        const improvement =
          winningVariant && controlVariant
            ? {
                click_improvement:
                  ((winningVariant.metrics.click_through_rate -
                    controlVariant.metrics.click_through_rate) /
                    controlVariant.metrics.click_through_rate) *
                  100,
                conversion_improvement:
                  ((winningVariant.metrics.conversion_rate -
                    controlVariant.metrics.conversion_rate) /
                    controlVariant.metrics.conversion_rate) *
                  100,
                engagement_improvement:
                  ((winningVariant.metrics.engagement_rate -
                    controlVariant.metrics.engagement_rate) /
                    controlVariant.metrics.engagement_rate) *
                  100,
              }
            : null;

        const content_metrics = {
          content_id: test.content_id || test.id,
          title: test.name,
          platform: "ab_testing",
          type: test.test_type,
          created_date: test.created_at.toISOString().split("T")[0],
          revenue: totalConversions * 85, // Estimated revenue per conversion
          sales_count: totalConversions,
          average_order_value: 85,
          views: totalImpressions,
          clicks: totalClicks,
          conversions: totalConversions,
          engagement_time: winningVariant
            ? winningVariant.metrics.engagement_rate * 2.5
            : 5.0,
          bounce_rate: winningVariant
            ? 1 - winningVariant.metrics.click_through_rate / 100
            : 0.6,
          production_cost: 2500, // Estimated A/B test setup cost
          marketing_spend: totalImpressions * 0.02, // Estimated cost per impression
          operational_cost: 500, // A/B test monitoring cost
          conversion_rate:
            totalImpressions > 0 ? totalConversions / totalImpressions : 0,
          first_sale_date: test.start_date.toISOString().split("T")[0],
          period_start: test.start_date.toISOString().split("T")[0],
          period_end: test.end_date
            ? test.end_date.toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        };

        const ab_test_impact = {
          test_id: testId,
          test_name: test.name,
          test_type: test.test_type,
          status: test.status,
          significance: test.current_significance || 0,
          confidence_level: test.confidence_level || 0,
          sample_size: test.sample_size,
          variants_tested: test.variants.length,
          winner_declared: !!test.winner,
          improvement_metrics: improvement,
          cost_efficiency: {
            cost_per_impression:
              totalImpressions > 0
                ? content_metrics.marketing_spend / totalImpressions
                : 0,
            cost_per_click:
              totalClicks > 0
                ? content_metrics.marketing_spend / totalClicks
                : 0,
            cost_per_conversion:
              totalConversions > 0
                ? content_metrics.marketing_spend / totalConversions
                : 0,
          },
          performance_distribution: test.variants.map(v => ({
            variant_name: v.name,
            performance_score: v.performance_score,
            traffic_percentage: v.traffic_percentage,
            is_control: v.is_control,
            metrics: v.metrics,
          })),
        };

        const optimization_recommendations =
          this.generateOptimizationRecommendations(test, improvement);

        resolve({
          content_metrics,
          ab_test_impact,
          optimization_recommendations,
        });
      }, 200);
    });
  }

  /**
   * Generate optimization recommendations based on A/B test results
   */
  private generateOptimizationRecommendations(
    test: ContentABTest,
    improvement: any
  ) {
    const recommendations = [];

    if (test.status === "completed" && test.winner) {
      recommendations.push({
        type: "implementation",
        priority: "high",
        title: "Implement Winning Variant",
        description: `Apply the winning variant from ${test.name} to all future content of this type`,
        estimated_impact: improvement
          ? `${Math.max(improvement.click_improvement, improvement.conversion_improvement).toFixed(1)}% improvement`
          : "Significant improvement expected",
        action_items: [
          "Update content templates with winning variant",
          "Train team on successful patterns identified",
          "Monitor implementation performance",
        ],
      });
    }

    if (test.current_significance && test.current_significance < 95) {
      recommendations.push({
        type: "continuation",
        priority: "medium",
        title: "Extend Test Duration",
        description:
          "Current significance level is below threshold. Continue test to achieve statistical significance",
        estimated_impact: "Achieve reliable results",
        action_items: [
          "Extend test duration by 24-48 hours",
          "Monitor daily significance changes",
          "Ensure adequate sample size",
        ],
      });
    }

    if (
      test.test_type === "subject_line" &&
      improvement &&
      improvement.click_improvement > 20
    ) {
      recommendations.push({
        type: "scaling",
        priority: "high",
        title: "Scale Subject Line Strategy",
        description:
          "Significant improvement in click rates suggests broader application of this approach",
        estimated_impact: `${improvement.click_improvement.toFixed(1)}% CTR improvement across campaigns`,
        action_items: [
          "Apply winning subject line patterns to email campaigns",
          "Test similar approaches in other marketing channels",
          "Document successful formula for future use",
        ],
      });
    }

    if (test.variants.some(v => v.metrics.engagement_rate < 1.5)) {
      recommendations.push({
        type: "optimization",
        priority: "medium",
        title: "Improve Low-Performing Variants",
        description:
          "Some variants show low engagement. Consider testing more diverse approaches",
        estimated_impact: "Better test insights and optimization opportunities",
        action_items: [
          "Analyze low-performing variant characteristics",
          "Test more contrasting approaches in future tests",
          "Consider audience segmentation for different variants",
        ],
      });
    }

    return recommendations;
  }

  /**
   * Get comprehensive A/B testing analytics summary for ROI dashboard
   */
  getABTestingAnalyticsSummary(): Promise<{
    performance_overview: any;
    roi_impact: any;
    trending_insights: any;
    cost_analysis: any;
  }> {
    return new Promise(resolve => {
      setTimeout(() => {
        const mockTests = this.getMockABTests();
        const completedTests = mockTests.filter(
          (t: ContentABTest) => t.status === "completed"
        );
        const runningTests = mockTests.filter(
          (t: ContentABTest) => t.status === "running"
        );

        // Calculate aggregate metrics
        const totalSampleSize = mockTests.reduce(
          (sum: number, t: ContentABTest) => sum + t.sample_size,
          0
        );
        const totalImpressions = mockTests.reduce(
          (sum: number, test: ContentABTest) =>
            sum +
            test.variants.reduce(
              (vSum: number, v: ContentVariant) => vSum + v.metrics.impressions,
              0
            ),
          0
        );
        const totalConversions = mockTests.reduce(
          (sum: number, test: ContentABTest) =>
            sum +
            test.variants.reduce(
              (vSum: number, v: ContentVariant) => vSum + v.metrics.conversions,
              0
            ),
          0
        );

        // Calculate average improvements from winning tests
        const testsWithWinners = completedTests.filter(t => t.winner);
        const avgImprovement =
          testsWithWinners.length > 0
            ? testsWithWinners.reduce((sum, test) => {
                const winner = test.variants.find(v => v.id === test.winner);
                const control = test.variants.find(v => v.is_control);
                if (winner && control) {
                  return (
                    sum +
                    ((winner.performance_score - control.performance_score) /
                      control.performance_score) *
                      100
                  );
                }
                return sum;
              }, 0) / testsWithWinners.length
            : 0;

        // Performance by test type
        const performanceByType = mockTests.reduce(
          (acc: Record<string, any>, test: ContentABTest) => {
            if (!acc[test.test_type]) {
              acc[test.test_type] = {
                tests_count: 0,
                avg_improvement: 0,
                success_rate: 0,
                total_sample_size: 0,
              };
            }
            acc[test.test_type].tests_count++;
            acc[test.test_type].total_sample_size += test.sample_size;

            if (test.winner) {
              const winner = test.variants.find(
                (v: ContentVariant) => v.id === test.winner
              );
              const control = test.variants.find(
                (v: ContentVariant) => v.is_control
              );
              if (winner && control) {
                const improvement =
                  ((winner.performance_score - control.performance_score) /
                    control.performance_score) *
                  100;
                acc[test.test_type].avg_improvement += improvement;
                acc[test.test_type].success_rate++;
              }
            }
            return acc;
          },
          {} as Record<string, any>
        );

        // Calculate averages and success rates
        Object.keys(performanceByType).forEach(type => {
          const data = performanceByType[type];
          data.avg_improvement =
            data.success_rate > 0
              ? data.avg_improvement / data.success_rate
              : 0;
          data.success_rate = (data.success_rate / data.tests_count) * 100;
        });

        const performance_overview = {
          total_tests: mockTests.length,
          running_tests: runningTests.length,
          completed_tests: completedTests.length,
          tests_with_winners: testsWithWinners.length,
          average_improvement: avgImprovement,
          total_sample_size: totalSampleSize,
          success_rate:
            completedTests.length > 0
              ? (testsWithWinners.length / completedTests.length) * 100
              : 0,
          performance_by_type: performanceByType,
        };

        const roi_impact = {
          estimated_revenue_lift:
            totalConversions * 85 * (avgImprovement / 100),
          cost_per_test: 3000, // Average cost per A/B test
          total_testing_investment: mockTests.length * 3000,
          roi_from_testing:
            ((totalConversions * 85 * (avgImprovement / 100)) /
              (mockTests.length * 3000)) *
            100,
          conversion_optimization: {
            baseline_conversion_rate: 2.8,
            optimized_conversion_rate: 2.8 * (1 + avgImprovement / 100),
            additional_conversions:
              totalImpressions * (avgImprovement / 100) * 0.028,
          },
        };

        const trending_insights = {
          best_performing_test_type:
            Object.entries(performanceByType).sort(
              ([, a], [, b]) =>
                (b as any).avg_improvement - (a as any).avg_improvement
            )[0]?.[0] || "subject_line",
          recent_wins: testsWithWinners.slice(-3).map(test => ({
            test_name: test.name,
            test_type: test.test_type,
            improvement: Math.round(avgImprovement),
            completed_date: test.end_date || new Date(),
          })),
          optimization_opportunities: [
            "Scale successful subject line patterns to all email campaigns",
            "Apply high-performing CTA strategies across platforms",
            "Implement winning timing strategies for social media posts",
          ],
        };

        const cost_analysis = {
          average_cost_per_test: 3000,
          cost_per_conversion_improvement:
            testsWithWinners.length > 0
              ? (mockTests.length * 3000) /
                ((totalConversions * avgImprovement) / 100)
              : 0,
          budget_efficiency: {
            low_cost_high_impact: ["subject_line", "timing"],
            medium_cost_medium_impact: ["cta", "text"],
            high_cost_variable_impact: ["image", "audience"],
          },
          recommended_monthly_budget: 15000, // Based on optimal testing cadence
        };

        resolve({
          performance_overview,
          roi_impact,
          trending_insights,
          cost_analysis,
        });
      }, 300);
    });
  }
}

export { ContentABTestingService };
export default new ContentABTestingService();
