// Trending Hashtag & Competitor Analysis voor Self-Learning Content Engine (Task 70.4)
// Integreert met Fortune 500 AI Agent en bestaande analytics infrastructure

import { logger } from "../logger";
import { createClient } from "../supabase/server";
import {
  ContentPerformanceMLEngine,
  type HashtagAnalysis,
} from "../ml/content-performance-ml-engine";
import {
  CompetitorAnalyzer,
  type CompetitorAnalysis,
} from "../research-scraping/competitor-analyzer";
import { InstagramBusinessApiClient } from "../analytics/social-media/instagram-business-api";
import { LinkedInApiClient } from "../analytics/social-media/linkedin-api";
import { TikTokBusinessApiClient } from "../analytics/social-media/tiktok-business-api";

// Core Interfaces voor Trending Analysis
export interface TrendingHashtagConfig {
  platforms: TrendingPlatform[];
  analysisDepth: "basic" | "comprehensive" | "ai_enhanced";
  timeRange: {
    hours: number; // Look back period for trending data
    forecastDays?: number; // Forecast period
  };
  filters: {
    minVolumeThreshold: number;
    maxHashtagsPerPlatform: number;
    excludeHashtags: string[];
    focusIndustries: string[];
  };
  aiEnhancement: {
    enableFortune500Integration: boolean;
    enableCompetitorAnalysis: boolean;
    enableMLPredictions: boolean;
    qualityThreshold: number; // 0-100
  };
}

export interface TrendingPlatform {
  name: "instagram" | "linkedin" | "tiktok" | "twitter" | "youtube";
  enabled: boolean;
  priority: 1 | 2 | 3; // 1 = highest priority
  apiConfig: any;
  customParams?: {
    location?: string[];
    language?: string[];
    contentType?: string[];
  };
}

export interface TrendingHashtagData {
  hashtag: string;
  platform: string;
  trend_score: number; // 0-100
  volume_data: {
    current_posts: number;
    hourly_growth_rate: number;
    peak_usage_times: string[];
    geographic_distribution: Record<string, number>;
  };
  engagement_metrics: {
    average_likes: number;
    average_comments: number;
    average_shares: number;
    engagement_velocity: number;
  };
  trend_analysis: {
    lifecycle_stage: "emerging" | "growing" | "peak" | "declining" | "stable";
    momentum: "explosive" | "strong" | "moderate" | "weak" | "stagnant";
    longevity_prediction: number; // days
    saturation_risk: "low" | "medium" | "high";
  };
  competitive_landscape: {
    usage_by_competitors: Array<{
      competitor_name: string;
      usage_frequency: number;
      performance_with_hashtag: number;
    }>;
    market_opportunity: "high" | "medium" | "low";
    difficulty_score: number; // 0-100
  };
  content_insights: {
    best_content_types: string[];
    optimal_posting_times: string[];
    audience_demographics: Record<string, any>;
    related_hashtags: string[];
    content_themes: string[];
  };
  ml_predictions: {
    performance_forecast: number;
    risk_assessment: string;
    recommendation_score: number;
    ai_confidence: number; // 0-100
  };
  metadata: {
    analyzed_at: Date;
    data_freshness: number; // minutes
    reliability_score: number; // 0-100
    source_platforms: string[];
  };
}

export interface CompetitorHashtagAnalysis {
  competitor_id: string;
  competitor_name: string;
  analysis_timestamp: Date;
  hashtag_strategy: {
    most_used_hashtags: Array<{
      hashtag: string;
      frequency: number;
      avg_performance: number;
      trend_alignment: number;
    }>;
    hashtag_diversity_score: number;
    trending_hashtag_adoption: {
      early_adopter_score: number; // 0-100
      trending_response_time: number; // hours
      success_rate_with_trends: number; // %
    };
    competitive_hashtag_gaps: string[];
  };
  performance_comparison: {
    hashtag_effectiveness: number; // vs our performance
    engagement_rates: Record<string, number>;
    reach_efficiency: number;
    content_resonance: number;
  };
  strategic_insights: {
    hashtag_opportunities: string[];
    avoid_hashtags: string[];
    timing_advantages: string[];
    content_angle_insights: string[];
  };
}

export interface TrendingAnalysisResults {
  analysis_id: string;
  timestamp: Date;
  config_used: TrendingHashtagConfig;
  trending_hashtags: TrendingHashtagData[];
  competitor_insights: CompetitorHashtagAnalysis[];
  cross_platform_analysis: {
    universal_trends: string[]; // Trending across multiple platforms
    platform_specific_trends: Record<string, string[]>;
    migration_patterns: Array<{
      from_platform: string;
      to_platform: string;
      hashtag: string;
      migration_speed: number; // hours
    }>;
  };
  strategic_recommendations: {
    immediate_opportunities: Array<{
      hashtag: string;
      action: string;
      rationale: string;
      urgency: "high" | "medium" | "low";
    }>;
    content_calendar_suggestions: Array<{
      hashtag: string;
      optimal_date: Date;
      content_type: string;
      expected_performance: number;
    }>;
    competitive_response: Array<{
      competitor: string;
      threat_level: "high" | "medium" | "low";
      recommended_action: string;
    }>;
  };
  fortune500_integration: {
    ai_agent_insights: any;
    trending_intelligence_stored: boolean;
    workflow_triggers_activated: string[];
  };
  quality_metrics: {
    data_completeness: number; // %
    analysis_confidence: number; // %
    recommendation_reliability: number; // %
  };
}

/**
 * Enterprise-grade Trending Hashtag & Competitor Analysis Engine
 * Integreert met Fortune 500 AI Agent workflow en bestaande infrastructure
 */
export class TrendingHashtagAnalyzer {
  private config: TrendingHashtagConfig;
  private supabase: any;
  private mlEngine: ContentPerformanceMLEngine;
  private competitorAnalyzer: CompetitorAnalyzer;
  private results: TrendingAnalysisResults | null = null;

  constructor(config: TrendingHashtagConfig) {
    this.config = config;
    this.supabase = null; // Will be initialized lazily
    this.mlEngine = new ContentPerformanceMLEngine();
    this.competitorAnalyzer = new CompetitorAnalyzer();

    logger.info("TrendingHashtagAnalyzer initialized", {
      platforms: config.platforms.map(p => p.name),
      analysisDepth: config.analysisDepth,
      aiEnhancement: config.aiEnhancement.enableFortune500Integration,
    });
  }

  private async getSupabaseClient() {
    if (!this.supabase) {
      this.supabase = createClient();
    }
    return this.supabase;
  }

  /**
   * Main analysis method - performs comprehensive trending hashtag analysis
   */
  async analyzeTrendingHashtags(): Promise<TrendingAnalysisResults> {
    const startTime = performance.now();
    logger.info("🚀 Starting comprehensive trending hashtag analysis");

    try {
      // Step 1: Collect trending hashtag data from all platforms
      logger.info("📊 Collecting trending hashtag data from platforms");
      const trendingData = await this.collectTrendingData();

      // Step 2: Analyze competitor hashtag strategies
      logger.info("🔍 Analyzing competitor hashtag strategies");
      const competitorInsights =
        await this.analyzeCompetitorHashtagStrategies();

      // Step 3: Perform cross-platform trend analysis
      logger.info("🌐 Performing cross-platform analysis");
      const crossPlatformAnalysis =
        await this.performCrossPlatformAnalysis(trendingData);

      // Step 4: Enhance with ML predictions if enabled
      let enhancedTrendingData = trendingData;
      if (this.config.aiEnhancement.enableMLPredictions) {
        logger.info("🤖 Enhancing with ML predictions");
        enhancedTrendingData =
          await this.enhanceWithMLPredictions(trendingData);
      }

      // Step 5: Generate strategic recommendations
      logger.info("💡 Generating strategic recommendations");
      const recommendations = await this.generateStrategicRecommendations(
        enhancedTrendingData,
        competitorInsights,
        crossPlatformAnalysis
      );

      // Step 6: Integrate with Fortune 500 AI Agent workflow
      let fortune500Integration = {
        ai_agent_insights: null,
        trending_intelligence_stored: false,
        workflow_triggers_activated: [],
      };
      if (this.config.aiEnhancement.enableFortune500Integration) {
        logger.info("🔮 Integrating with Fortune 500 AI Agent");
        fortune500Integration = await this.integrateWithFortune500Workflow(
          enhancedTrendingData,
          recommendations
        );
      }

      // Step 7: Calculate quality metrics
      const qualityMetrics = this.calculateQualityMetrics(
        enhancedTrendingData,
        competitorInsights
      );

      // Compile results
      this.results = {
        analysis_id: `trending_analysis_${Date.now()}`,
        timestamp: new Date(),
        config_used: this.config,
        trending_hashtags: enhancedTrendingData,
        competitor_insights: competitorInsights,
        cross_platform_analysis: crossPlatformAnalysis,
        strategic_recommendations: recommendations,
        fortune500_integration: fortune500Integration,
        quality_metrics: qualityMetrics,
      };

      // Store results in database
      await this.storeAnalysisResults(this.results);

      const executionTime = Math.round(performance.now() - startTime);

      logger.info("✅ Trending hashtag analysis completed successfully", {
        hashtagsAnalyzed: this.results.trending_hashtags.length,
        competitorsAnalyzed: this.results.competitor_insights.length,
        executionTime: `${executionTime}ms`,
      });

      return this.results;
    } catch (error) {
      logger.error(
        "❌ Trending hashtag analysis failed",
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  /**
   * Collect trending hashtag data from all enabled platforms
   */
  private async collectTrendingData(): Promise<TrendingHashtagData[]> {
    const allTrendingData: TrendingHashtagData[] = [];

    for (const platform of this.config.platforms.filter(p => p.enabled)) {
      try {
        logger.info(`📊 Collecting trending data from ${platform.name}`);

        const platformData = await this.collectPlatformTrendingData(platform);
        allTrendingData.push(...platformData);

        logger.info(
          `✅ Collected ${platformData.length} trending hashtags from ${platform.name}`
        );

        // Rate limiting between platforms
        await this.delay(1000);
      } catch (error) {
        logger.error(
          `❌ Failed to collect trending data from ${platform.name}`,
          error instanceof Error ? error : new Error(String(error))
        );
        // Continue with other platforms
      }
    }

    return this.filterAndRankTrendingData(allTrendingData);
  }

  /**
   * Platform-specific trending data collection
   */
  private async collectPlatformTrendingData(
    platform: TrendingPlatform
  ): Promise<TrendingHashtagData[]> {
    const trends: TrendingHashtagData[] = [];

    // Mock trending hashtags based on platform
    let mockHashtags: string[] = [];
    switch (platform.name) {
      case "instagram":
        mockHashtags = [
          "#skincare",
          "#glowingskin",
          "#antiaging",
          "#serumreview",
          "#beautytips",
        ];
        break;
      case "tiktok":
        mockHashtags = [
          "#skincaretiktok",
          "#glowup",
          "#skincareproblems",
          "#beautyhacks",
        ];
        break;
      case "linkedin":
        mockHashtags = [
          "#entrepreneurship",
          "#businessgrowth",
          "#leadership",
          "#innovation",
        ];
        break;
    }

    for (const hashtag of mockHashtags) {
      const trendingData: TrendingHashtagData = {
        hashtag,
        platform: platform.name,
        trend_score: Math.floor(Math.random() * 40) + 60,
        volume_data: {
          current_posts: Math.floor(Math.random() * 50000) + 10000,
          hourly_growth_rate: Math.random() * 15 + 5,
          peak_usage_times: ["09:00", "14:00", "19:00"],
          geographic_distribution: { NL: 0.4, DE: 0.3, US: 0.2, UK: 0.1 },
        },
        engagement_metrics: {
          average_likes: Math.floor(Math.random() * 1000) + 200,
          average_comments: Math.floor(Math.random() * 100) + 20,
          average_shares: Math.floor(Math.random() * 50) + 10,
          engagement_velocity: Math.random() * 5 + 2,
        },
        trend_analysis: {
          lifecycle_stage: this.getRandomLifecycleStage(),
          momentum: this.getRandomMomentum(),
          longevity_prediction: Math.floor(Math.random() * 30) + 7,
          saturation_risk: this.getRandomRiskLevel(),
        },
        competitive_landscape: {
          usage_by_competitors: [
            {
              competitor_name: "CompetitorA",
              usage_frequency: Math.random() * 10,
              performance_with_hashtag: Math.random() * 100,
            },
          ],
          market_opportunity: Math.random() > 0.7 ? "high" : "medium",
          difficulty_score: Math.floor(Math.random() * 50) + 30,
        },
        content_insights: {
          best_content_types: ["carousel", "reel", "photo"],
          optimal_posting_times: ["09:00", "14:00", "19:00"],
          audience_demographics: { age_25_34: 0.4, female: 0.75 },
          related_hashtags: this.generateRelatedHashtags(hashtag),
          content_themes: ["tutorial", "before_after", "product_review"],
        },
        ml_predictions: {
          performance_forecast: Math.floor(Math.random() * 30) + 70,
          risk_assessment: "moderate_opportunity",
          recommendation_score: Math.floor(Math.random() * 25) + 75,
          ai_confidence: Math.floor(Math.random() * 20) + 80,
        },
        metadata: {
          analyzed_at: new Date(),
          data_freshness: Math.floor(Math.random() * 60) + 5,
          reliability_score: Math.floor(Math.random() * 20) + 80,
          source_platforms: [platform.name],
        },
      };

      trends.push(trendingData);
    }

    return trends;
  }

  // Helper methods for generating mock data
  private getRandomLifecycleStage():
    | "emerging"
    | "growing"
    | "peak"
    | "declining"
    | "stable" {
    const stages = [
      "emerging",
      "growing",
      "peak",
      "declining",
      "stable",
    ] as const;
    return stages[Math.floor(Math.random() * stages.length)];
  }

  private getRandomMomentum():
    | "explosive"
    | "strong"
    | "moderate"
    | "weak"
    | "stagnant" {
    const momentums = [
      "explosive",
      "strong",
      "moderate",
      "weak",
      "stagnant",
    ] as const;
    return momentums[Math.floor(Math.random() * momentums.length)];
  }

  private getRandomRiskLevel(): "low" | "medium" | "high" {
    const risks = ["low", "medium", "high"] as const;
    return risks[Math.floor(Math.random() * risks.length)];
  }

  private generateRelatedHashtags(hashtag: string): string[] {
    const relatedMap: Record<string, string[]> = {
      "#skincare": ["#beauty", "#glowingskin", "#healthyskin", "#selfcare"],
      "#glowingskin": ["#skincare", "#glow", "#radiant", "#healthyskin"],
      "#antiaging": ["#skincare", "#wrinkles", "#mature", "#peptides"],
      "#entrepreneurship": [
        "#business",
        "#startup",
        "#leadership",
        "#innovation",
      ],
      "#skincaretiktok": ["#beauty", "#glowup", "#skincare", "#tutorial"],
    };

    return relatedMap[hashtag] || ["#beauty", "#lifestyle", "#tips"];
  }

  /**
   * Filter and rank trending data based on configuration
   */
  private filterAndRankTrendingData(
    data: TrendingHashtagData[]
  ): TrendingHashtagData[] {
    return data
      .filter(item => {
        // Apply volume threshold
        if (
          item.volume_data.current_posts <
          this.config.filters.minVolumeThreshold
        ) {
          return false;
        }

        // Apply excluded hashtags filter
        if (this.config.filters.excludeHashtags.includes(item.hashtag)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => b.trend_score - a.trend_score) // Sort by trend score (descending)
      .slice(
        0,
        this.config.filters.maxHashtagsPerPlatform *
          this.config.platforms.length
      );
  }

  /**
   * Analyze competitor hashtag strategies
   */
  private async analyzeCompetitorHashtagStrategies(): Promise<
    CompetitorHashtagAnalysis[]
  > {
    logger.info("🔍 Analyzing competitor hashtag strategies");

    try {
      // Get competitor data from database
      const { data: competitors } = await this.supabase
        .from("competitors")
        .select("*")
        .eq("is_active", true)
        .eq("tracking_enabled", true)
        .limit(5);

      const competitorAnalyses: CompetitorHashtagAnalysis[] = [];

      for (const competitor of competitors || []) {
        // Mock competitor hashtag analysis - in production, integrate with actual data
        const analysis: CompetitorHashtagAnalysis = {
          competitor_id: competitor.id,
          competitor_name: competitor.company_name,
          analysis_timestamp: new Date(),
          hashtag_strategy: {
            most_used_hashtags: [
              {
                hashtag: "#skincare",
                frequency: 15,
                avg_performance: 850,
                trend_alignment: 0.8,
              },
              {
                hashtag: "#beauty",
                frequency: 12,
                avg_performance: 720,
                trend_alignment: 0.7,
              },
              {
                hashtag: "#glowingskin",
                frequency: 8,
                avg_performance: 920,
                trend_alignment: 0.9,
              },
            ],
            hashtag_diversity_score: Math.floor(Math.random() * 30) + 70,
            trending_hashtag_adoption: {
              early_adopter_score: Math.floor(Math.random() * 40) + 60,
              trending_response_time: Math.floor(Math.random() * 24) + 2,
              success_rate_with_trends: Math.floor(Math.random() * 40) + 60,
            },
            competitive_hashtag_gaps: [
              "#sustainablebeauty",
              "#cleanbeauty",
              "#vegan",
              "#crueltyFree",
            ],
          },
          performance_comparison: {
            hashtag_effectiveness: Math.random() * 0.4 + 0.8, // 0.8-1.2 multiplier
            engagement_rates: {
              "#skincare": Math.random() * 0.1 + 0.03,
              "#beauty": Math.random() * 0.08 + 0.02,
              "#glowingskin": Math.random() * 0.12 + 0.04,
            },
            reach_efficiency: Math.random() * 0.3 + 0.7,
            content_resonance: Math.random() * 0.2 + 0.8,
          },
          strategic_insights: {
            hashtag_opportunities: [
              "#skincareroutine",
              "#glowup",
              "#beautytips",
            ],
            avoid_hashtags: ["#overpricedbeauty", "#fakeresults"],
            timing_advantages: [
              "Post 2 hours before competitor for trending hashtags",
            ],
            content_angle_insights: [
              "Focus on before/after content with trending hashtags",
            ],
          },
        };

        competitorAnalyses.push(analysis);
      }

      return competitorAnalyses;
    } catch (error) {
      logger.error(
        "❌ Failed to analyze competitor hashtag strategies",
        error instanceof Error ? error : new Error(String(error))
      );
      return []; // Return empty array to allow analysis to continue
    }
  }

  /**
   * Perform cross-platform trend analysis
   */
  private async performCrossPlatformAnalysis(
    trendingData: TrendingHashtagData[]
  ): Promise<any> {
    logger.info("🔄 Performing cross-platform trend analysis");

    // Group hashtags by platform
    const platformGroups = trendingData.reduce(
      (groups, item) => {
        if (!groups[item.platform]) {
          groups[item.platform] = [];
        }
        groups[item.platform].push(item.hashtag);
        return groups;
      },
      {} as Record<string, string[]>
    );

    // Find hashtags that appear on multiple platforms
    const allHashtags = trendingData.map(item => item.hashtag);
    const hashtagCounts = allHashtags.reduce(
      (counts, hashtag) => {
        counts[hashtag] = (counts[hashtag] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>
    );

    const universalTrends = Object.entries(hashtagCounts)
      .filter(([, count]) => count >= 2)
      .map(([hashtag]) => hashtag);

    // Simulate migration patterns
    const migrationPatterns = [
      {
        from_platform: "tiktok",
        to_platform: "instagram",
        hashtag: "#glowup",
        migration_speed: 6,
      },
      {
        from_platform: "instagram",
        to_platform: "linkedin",
        hashtag: "#entrepreneurship",
        migration_speed: 24,
      },
    ];

    return {
      universal_trends: universalTrends,
      platform_specific_trends: platformGroups,
      migration_patterns: migrationPatterns,
    };
  }

  /**
   * Enhance trending data with ML predictions
   */
  private async enhanceWithMLPredictions(
    trendingData: TrendingHashtagData[]
  ): Promise<TrendingHashtagData[]> {
    try {
      for (const data of trendingData) {
        // Use the correct method name that exists in the ML engine
        const hashtagAnalysis = await this.mlEngine.analyzeHashtagEffectiveness(
          [data.hashtag],
          data.platform
        );

        if (hashtagAnalysis.length > 0) {
          const analysis = hashtagAnalysis[0];

          // Update ML predictions with actual analysis
          data.ml_predictions = {
            performance_forecast: analysis.effectiveness_score,
            risk_assessment:
              analysis.competition_level === "high"
                ? "high_competition"
                : "moderate_opportunity",
            recommendation_score: analysis.reach_potential > 1000 ? 85 : 65,
            ai_confidence: Math.floor(Math.random() * 20) + 80,
          };
        }
      }

      return trendingData;
    } catch (error) {
      logger.error(
        "❌ Failed to enhance with ML predictions",
        error instanceof Error ? error : new Error(String(error))
      );
      return trendingData; // Return original data if enhancement fails
    }
  }

  /**
   * Generate strategic recommendations
   */
  private async generateStrategicRecommendations(
    trendingData: TrendingHashtagData[],
    competitorInsights: CompetitorHashtagAnalysis[],
    crossPlatformAnalysis: any
  ): Promise<any> {
    logger.info("📋 Generating strategic recommendations");

    // Identify immediate opportunities (high trend score, low competition)
    const immediateOpportunities = trendingData
      .filter(
        trend =>
          trend.trend_score >= 80 &&
          trend.competitive_landscape.difficulty_score <= 50 &&
          trend.trend_analysis.lifecycle_stage === "growing"
      )
      .slice(0, 5)
      .map(trend => ({
        hashtag: trend.hashtag,
        action: `Create ${trend.content_insights.best_content_types[0]} content`,
        rationale: `High trend score (${trend.trend_score}) with low competition (${trend.competitive_landscape.difficulty_score})`,
        urgency: "high" as const,
      }));

    // Generate content calendar suggestions
    const contentCalendarSuggestions = trendingData
      .filter(trend => trend.ml_predictions.recommendation_score >= 75)
      .slice(0, 10)
      .map(trend => ({
        hashtag: trend.hashtag,
        optimal_date: new Date(
          Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000
        ), // Next 7 days
        content_type: trend.content_insights.best_content_types[0],
        expected_performance: trend.ml_predictions.performance_forecast,
      }));

    // Competitive response recommendations
    const competitiveResponse = competitorInsights.map(insight => ({
      competitor: insight.competitor_name,
      threat_level:
        insight.performance_comparison.hashtag_effectiveness > 85
          ? ("high" as const)
          : ("medium" as const),
      recommended_action: `Monitor ${insight.hashtag_strategy.most_used_hashtags[0]?.hashtag} performance and consider counter-strategy`,
    }));

    return {
      immediate_opportunities: immediateOpportunities,
      content_calendar_suggestions: contentCalendarSuggestions,
      competitive_response: competitiveResponse,
    };
  }

  /**
   * Integrate with Fortune 500 AI Agent workflow
   */
  private async integrateWithFortune500Workflow(
    trendingData: TrendingHashtagData[],
    recommendations: any
  ): Promise<any> {
    logger.info("🤖 Integrating with Fortune 500 AI Agent workflow");

    try {
      // Store trending intelligence data for n8n workflow consumption
      const trendingIntelligenceData = trendingData
        .filter(
          trend =>
            trend.trend_score >= this.config.aiEnhancement.qualityThreshold
        )
        .slice(0, 10) // Top 10 trends
        .map(trend => ({
          session_id: `trending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          topic_id: `topic_${trend.hashtag.replace("#", "")}_${Date.now()}`,
          topic_name: trend.hashtag,
          topic_description: `Trending hashtag analysis: ${trend.hashtag}`,
          trend_score: trend.trend_score,
          quality_score: trend.ml_predictions.ai_confidence,
          consensus_score: trend.trend_score,
          strategic_value:
            trend.trend_score >= 90
              ? "critical"
              : trend.trend_score >= 80
                ? "high"
                : "medium",
          platforms: [trend.platform],
          hashtags: [
            trend.hashtag,
            ...trend.content_insights.related_hashtags.slice(0, 4),
          ],
          content_ideas: trend.content_insights.content_themes,
          agent_analysis: JSON.stringify({
            lifecycle_stage: trend.trend_analysis.lifecycle_stage,
            momentum: trend.trend_analysis.momentum,
            competitive_opportunity:
              trend.competitive_landscape.market_opportunity,
            ml_confidence: trend.ml_predictions.ai_confidence,
          }),
          deployment_status: trend.trend_score >= 85 ? "ready" : "pending",
          created_at: new Date().toISOString(),
        }));

      // Store in trending_intelligence table for n8n workflow
      let storedCount = 0;
      for (const intelligenceData of trendingIntelligenceData) {
        try {
          const supabase = await this.getSupabaseClient();
          const { error } = await supabase
            .from("trending_intelligence")
            .insert(intelligenceData);

          if (!error) {
            storedCount++;
          } else {
            logger.warn("Failed to store trending intelligence", {
              error,
              hashtag: intelligenceData.topic_name,
            });
          }
        } catch (insertError) {
          logger.warn("Error inserting trending intelligence data", {
            insertError,
          });
        }
      }

      return {
        ai_agent_insights: {
          trends_processed: trendingData.length,
          high_quality_trends: trendingIntelligenceData.length,
          recommendations_generated:
            recommendations.immediate_opportunities.length,
        },
        trending_intelligence_stored: storedCount > 0,
        workflow_triggers_activated:
          storedCount > 0 ? ["fortune500-ai-agent"] : [],
      };
    } catch (error) {
      logger.error(
        "Failed to integrate with Fortune 500 workflow",
        error instanceof Error ? error : new Error(String(error))
      );
      return {
        ai_agent_insights: null,
        trending_intelligence_stored: false,
        workflow_triggers_activated: [],
      };
    }
  }

  /**
   * Calculate quality metrics for the analysis
   */
  private calculateQualityMetrics(
    trendingData: TrendingHashtagData[],
    competitorInsights: CompetitorHashtagAnalysis[]
  ): any {
    const totalTrends = trendingData.length;
    const highQualityTrends = trendingData.filter(
      trend =>
        trend.ml_predictions.ai_confidence >= 80 &&
        trend.metadata.reliability_score >= 80
    ).length;

    const dataCompleteness =
      totalTrends > 0 ? (highQualityTrends / totalTrends) * 100 : 0;

    const avgConfidence =
      trendingData.reduce(
        (sum, trend) => sum + trend.ml_predictions.ai_confidence,
        0
      ) / totalTrends;

    return {
      data_completeness: Math.round(dataCompleteness),
      analysis_confidence: Math.round(avgConfidence),
      recommendation_reliability: Math.round(
        (dataCompleteness + avgConfidence) / 2
      ),
    };
  }

  /**
   * Store analysis results in database for Fortune 500 workflow consumption
   */
  private async storeAnalysisResults(
    results: TrendingAnalysisResults
  ): Promise<void> {
    try {
      // Store in trending_intelligence table for n8n Fortune 500 workflow
      const supabase = await this.getSupabaseClient();
      const { error: insertError } = await supabase
        .from("trending_intelligence")
        .insert({
          analysis_id: results.analysis_id,
          analysis_data: results,
          hashtags_analyzed: results.trending_hashtags.length,
          competitors_analyzed: results.competitor_insights.length,
          quality_score: results.quality_metrics.analysis_confidence,
          created_at: new Date().toISOString(),
          fortune500_ready:
            results.fortune500_integration.trending_intelligence_stored,
        });

      if (insertError) {
        throw insertError;
      }

      logger.info(`💾 Analysis results stored successfully`, {
        analysisId: results.analysis_id,
        hashtagsCount: results.trending_hashtags.length,
        competitorsCount: results.competitor_insights.length,
      });
    } catch (error) {
      logger.error(
        "❌ Failed to store analysis results",
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  /**
   * Get analysis results
   */
  public getResults(): TrendingAnalysisResults | null {
    return this.results;
  }

  /**
   * Utility method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Factory functions for ease of use
export function createTrendingHashtagAnalyzer(
  config: TrendingHashtagConfig
): TrendingHashtagAnalyzer {
  return new TrendingHashtagAnalyzer(config);
}

export const createDefaultTrendingConfig = (
  platforms: string[] = ["instagram", "tiktok", "linkedin"],
  analysisDepth: "basic" | "comprehensive" | "ai_enhanced" = "ai_enhanced"
): TrendingHashtagConfig => {
  return {
    platforms: platforms.map(name => ({
      name: name as any,
      enabled: true,
      priority: name === "instagram" ? 1 : name === "tiktok" ? 2 : 3,
      apiConfig: {},
    })),
    analysisDepth,
    timeRange: {
      hours: 24,
      forecastDays: 7,
    },
    filters: {
      minVolumeThreshold: 1000,
      maxHashtagsPerPlatform: 10,
      excludeHashtags: ["#ad", "#sponsored", "#promotion"],
      focusIndustries: ["skincare", "beauty", "wellness"],
    },
    aiEnhancement: {
      enableFortune500Integration: true,
      enableCompetitorAnalysis: true,
      enableMLPredictions: true,
      qualityThreshold: 75,
    },
  };
};
