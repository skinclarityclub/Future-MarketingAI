// Production-safe test file - removing @ts-nocheck for type safety
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mlModelRegistry } from "../ml/model-registry";
import { mlOrchestrator } from "../ml/ml-orchestrator";
import { getMLCapabilities, executeMLAnalysis } from "../assistant-service";

// Mock OpenAI
vi.mock("openai", () => ({
  OpenAI: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  intent: "business_analysis",
                  entities: { timeframe: "monthly" },
                }),
              },
            },
          ],
        }),
      },
    },
  })),
}));

// Mock the external dependencies
vi.mock("@/lib/customer-intelligence/churn-prediction", () => ({
  ChurnPredictionEngine: vi.fn().mockImplementation(() => ({
    predictChurn: vi.fn().mockResolvedValue({
      customerId: "test-customer",
      churnRiskScore: 0.65,
      riskLevel: "medium",
      confidence: 0.85,
      contributingFactors: [],
      recommendations: [],
      modelUsed: "Advanced Ensemble Model",
      lastUpdated: new Date().toISOString(),
    }),
  })),
}));

vi.mock("@/lib/analytics/roi-algorithms", () => ({
  ROIAlgorithmEngine: vi.fn().mockImplementation(() => ({
    calculateContentROI: vi.fn().mockReturnValue({
      content_id: "test-content",
      roi_percentage: 150,
      roi_score: 75,
      performance_grade: "B",
      revenue_score: 80,
      engagement_score: 70,
      conversion_score: 75,
      efficiency_score: 80,
      total_cost: 1000,
      net_profit: 1500,
      profit_margin: 60,
      payback_period_days: 30,
      cost_per_acquisition: 100,
      lifetime_value_ratio: 2.5,
      viral_coefficient: 1.2,
      optimization_opportunities: ["Increase engagement time"],
      risk_factors: ["Seasonal dependency"],
      suggested_actions: ["Focus on retention"],
    }),
    analyzeTrends: vi.fn().mockReturnValue([
      {
        content_id: "test-content",
        trend_direction: "increasing",
        trend_strength: 0.8,
        velocity: 0.15,
        momentum: 0.05,
        seasonal_pattern: false,
        prediction_confidence: 0.75,
      },
    ]),
  })),
}));

vi.mock("@/lib/analytics/optimization-engine", () => ({
  OptimizationEngine: vi.fn().mockImplementation(() => ({
    generateRecommendations: vi.fn().mockReturnValue({
      portfolio_health_score: 85,
      top_opportunities: [
        {
          title: "Content Optimization",
          description: "Optimize underperforming content",
          impact_score: 75,
          timeframe: "short-term",
        },
      ],
      quick_wins: [],
      strategic_initiatives: [],
      patterns: {
        high_performers_traits: ["High engagement"],
        underperformer_issues: ["Low conversion"],
        seasonal_trends: ["Q4 boost"],
        platform_preferences: { kajabi: 85, shopify: 75 },
      },
      predictions: {
        next_month_revenue_range: { min: 45000, max: 55000 },
        content_saturation_risk: 25,
        growth_trajectory: "steady",
      },
    }),
  })),
}));

describe("ML Model Registry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return available model capabilities", () => {
    const capabilities = mlModelRegistry.getCapabilities();

    expect(capabilities).toHaveLength(3);
    expect(capabilities[0]).toMatchObject({
      name: "Churn Prediction",
      description: expect.stringContaining("ensemble ML models"),
      confidence: 0.85,
    });
    expect(capabilities[1]).toMatchObject({
      name: "ROI Analytics",
      description: expect.stringContaining("content performance"),
      confidence: 0.78,
    });
    expect(capabilities[2]).toMatchObject({
      name: "Optimization Engine",
      description: expect.stringContaining("optimization recommendations"),
      confidence: 0.82,
    });
  });

  it("should execute churn prediction successfully", async () => {
    const result = await mlModelRegistry.predictChurn("test-customer", true);

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      customerId: "test-customer",
      churnRiskScore: 0.65,
      riskLevel: "medium",
      confidence: 0.85,
    });
    expect(result.modelUsed).toBe("Advanced Ensemble Model");
  });

  it("should execute ROI analysis successfully", async () => {
    const contentMetrics = [
      {
        content_id: "test-content",
        title: "Test Content",
        type: "course",
        platform: "kajabi",
        revenue: 2500,
        views: 1000,
        clicks: 100,
        conversions: 25,
        engagement_time: 12,
        bounce_rate: 0.4,
        production_cost: 800,
        marketing_spend: 400,
        operational_cost: 300,
        sales_count: 25,
        average_order_value: 100,
        created_date: "2024-01-01",
        period_start: "2024-01-01",
        period_end: "2024-12-31",
      },
    ];

    const result = await mlModelRegistry.analyzeROI(contentMetrics);

    expect(result.success).toBe(true);
    expect(result.data.roiResults).toHaveLength(1);
    expect(result.data.roiResults[0]).toMatchObject({
      content_id: "test-content",
      roi_percentage: 150,
      performance_grade: "B",
    });
    expect(result.data.summary).toMatchObject({
      totalContent: 1,
      averageROI: 150,
    });
  });

  it("should generate optimization recommendations", async () => {
    const contentMetrics = [
      {
        content_id: "test-content",
        revenue: 5000,
        views: 1000,
        production_cost: 1000,
      },
    ];
    const roiResults = [
      {
        content_id: "test-content",
        roi_percentage: 150,
      },
    ];

    const result = await mlModelRegistry.generateOptimizations(
      contentMetrics,
      roiResults
    );

    expect(result.success).toBe(true);
    expect(result.data.portfolio_health_score).toBe(85);
    expect(result.data.top_opportunities).toHaveLength(1);
    expect(result.data.predictions).toMatchObject({
      next_month_revenue_range: { min: 45000, max: 55000 },
      growth_trajectory: "steady",
    });
  });

  it("should generate strategic insights", async () => {
    const query = {
      type: "strategic_insights" as const,
      parameters: {},
    };

    const result = await mlModelRegistry.generateStrategicInsights(query);

    expect(result.success).toBe(true);
    expect(result.data).toBeInstanceOf(Array);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.modelUsed).toBe("Strategic Insights Generator");
  });
});

describe("ML Orchestrator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should execute analysis workflow", async () => {
    const query = {
      type: "analysis" as const,
      domain: "content" as const,
      parameters: { timeframe: "monthly" },
      context: "Analyze content performance",
    };

    const result = await mlOrchestrator.executeQuery(query);

    expect(result.success).toBe(true);
    expect(result.insights).toBeInstanceOf(Array);
    expect(result.modelsUsed).toBeInstanceOf(Array);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.executionTime).toBeGreaterThanOrEqual(0);
  });

  it("should execute prediction workflow", async () => {
    const query = {
      type: "prediction" as const,
      domain: "revenue" as const,
      parameters: {},
    };

    const result = await mlOrchestrator.executeQuery(query);

    expect(result.success).toBe(true);
    expect(result.insights).toBeInstanceOf(Array);
    expect(result.recommendations).toBeInstanceOf(Array);
  });

  it("should execute optimization workflow", async () => {
    const query = {
      type: "optimization" as const,
      domain: "content" as const,
      parameters: {},
    };

    const result = await mlOrchestrator.executeQuery(query);

    expect(result.success).toBe(true);
    expect(result.insights).toBeInstanceOf(Array);
    expect(result.data).toBeDefined();
  });

  it("should execute comprehensive insights workflow", async () => {
    const query = {
      type: "insights" as const,
      domain: "general" as const,
      parameters: {},
    };

    const result = await mlOrchestrator.executeQuery(query);

    expect(result.success).toBe(true);
    expect(result.insights).toBeInstanceOf(Array);
    expect(result.modelsUsed.length).toBeGreaterThan(0);
  });

  it("should handle errors gracefully", async () => {
    // Mock an error in the ML registry
    vi.spyOn(mlModelRegistry, "analyzeROI").mockRejectedValueOnce(
      new Error("Test error")
    );

    const query = {
      type: "analysis" as const,
      domain: "content" as const,
      parameters: {},
    };

    const result = await mlOrchestrator.executeQuery(query);

    // Should handle errors gracefully and return a result
    expect(result).toBeDefined();
    expect(result.executionTime).toBeGreaterThanOrEqual(0);
    expect(result.insights).toBeInstanceOf(Array);
  });
});

describe("Assistant Service ML Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return ML capabilities", () => {
    const capabilities = getMLCapabilities();

    expect(capabilities).toHaveLength(3);
    expect(capabilities.every(cap => cap.name && cap.description)).toBe(true);
  });

  it("should execute ML analysis", async () => {
    const query = {
      type: "analysis" as const,
      domain: "content" as const,
      parameters: {},
    };

    const result = await executeMLAnalysis(query);

    expect(result.success).toBe(true);
    expect(result.insights).toBeInstanceOf(Array);
  });
});

describe("Strategic Insights Generation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should generate churn-specific insights", async () => {
    const query = {
      type: "churn_analysis" as const,
      parameters: {},
    };

    const result = await mlModelRegistry.generateStrategicInsights(query);

    expect(result.success).toBe(true);
    expect(result.data).toBeInstanceOf(Array);

    const riskInsights = result.data.filter(
      (insight: any) => insight.type === "risk"
    );
    expect(riskInsights.length).toBeGreaterThan(0);
  });

  it("should generate ROI-specific insights", async () => {
    const query = {
      type: "roi_optimization" as const,
      parameters: {},
    };

    const result = await mlModelRegistry.generateStrategicInsights(query);

    expect(result.success).toBe(true);
    expect(result.data).toBeInstanceOf(Array);

    const opportunityInsights = result.data.filter(
      (insight: any) => insight.type === "opportunity"
    );
    expect(opportunityInsights.length).toBeGreaterThan(0);
  });

  it("should filter insights by confidence threshold", async () => {
    const query = {
      type: "strategic_insights" as const,
      parameters: {},
      confidenceThreshold: 0.9,
    };

    const result = await mlModelRegistry.generateStrategicInsights(query);

    expect(result.success).toBe(true);
    expect(result.data).toBeInstanceOf(Array);

    // All insights should meet the confidence threshold
    const allMeetThreshold = result.data.every(
      (insight: any) => insight.confidence >= 0.9
    );
    expect(allMeetThreshold).toBe(true);
  });

  it("should generate cross-model insights", async () => {
    const query = {
      type: "strategic_insights" as const,
      parameters: {},
    };

    const result = await mlModelRegistry.generateStrategicInsights(query);

    expect(result.success).toBe(true);
    expect(result.data).toBeInstanceOf(Array);

    // Should include cross-model recommendations
    const recommendations = result.data.filter(
      (insight: any) => insight.type === "recommendation"
    );
    expect(recommendations.length).toBeGreaterThan(0);
  });
});
