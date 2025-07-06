import { NextRequest, NextResponse } from "next/server";
import {
  TrendingHashtagAnalyzer,
  createDefaultTrendingConfig,
  type TrendingHashtagConfig,
} from "@/lib/data-seeding/trending-hashtag-analyzer";
import { logger } from "@/lib/logger";

/**
 * GET - Get status of trending hashtag analyzer
 */
export async function GET(request: NextRequest) {
  try {
    logger.info("Trending Hashtag Analyzer API - GET request received");

    return NextResponse.json({
      success: true,
      message: "Trending Hashtag Analyzer API is operational",
      endpoints: {
        POST: "Trigger trending hashtag analysis",
        GET: "Get analyzer status",
      },
      capabilities: [
        "Multi-platform trending analysis (Instagram, TikTok, LinkedIn)",
        "Competitor hashtag strategy analysis",
        "Fortune 500 AI Agent integration",
        "ML-enhanced performance predictions",
        "Cross-platform trend migration tracking",
        "Strategic recommendation generation",
      ],
    });
  } catch (error) {
    logger.error("Error in Trending Hashtag Analyzer GET", { error });
    return NextResponse.json(
      { success: false, error: "Failed to get analyzer status" },
      { status: 500 }
    );
  }
}

/**
 * POST - Execute trending hashtag analysis
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    logger.info("🚀 Trending Hashtag Analyzer API - POST request received");

    const body = await request.json();
    const {
      platforms = ["instagram", "tiktok", "linkedin"],
      analysisDepth = "ai_enhanced",
      testMode = false,
      config: customConfig,
    } = body;

    // Create configuration
    const config: TrendingHashtagConfig =
      customConfig || createDefaultTrendingConfig(platforms, analysisDepth);

    if (testMode) {
      logger.info("🧪 Running in test mode - using mock data");
      config.aiEnhancement.enableFortune500Integration = false;
    }

    // Initialize analyzer
    const analyzer = new TrendingHashtagAnalyzer(config);
    logger.info("Analyzer initialized", {
      platforms: config.platforms.map(p => p.name),
      analysisDepth: config.analysisDepth,
      fortune500Integration: config.aiEnhancement.enableFortune500Integration,
    });

    // Execute analysis
    const results = await analyzer.analyzeTrendingHashtags();

    const executionTime = Date.now() - startTime;

    logger.info("✅ Trending hashtag analysis completed successfully", {
      analysisId: results.analysis_id,
      hashtagsAnalyzed: results.trending_hashtags.length,
      competitorsAnalyzed: results.competitor_insights.length,
      executionTime: `${executionTime}ms`,
      fortune500Integration:
        results.fortune500_integration.trending_intelligence_stored,
    });

    return NextResponse.json({
      success: true,
      message: "Trending hashtag analysis completed successfully",
      analysis_summary: {
        analysis_id: results.analysis_id,
        timestamp: results.timestamp,
        execution_time_ms: executionTime,
        platforms_analyzed: config.platforms.map(p => p.name),
        hashtags_found: results.trending_hashtags.length,
        competitors_analyzed: results.competitor_insights.length,
        quality_score: results.quality_metrics.analysis_confidence,
        fortune500_integration: {
          enabled: config.aiEnhancement.enableFortune500Integration,
          data_stored:
            results.fortune500_integration.trending_intelligence_stored,
          workflows_triggered:
            results.fortune500_integration.workflow_triggers_activated,
        },
      },
      trending_insights: {
        top_hashtags: results.trending_hashtags
          .sort((a, b) => b.trend_score - a.trend_score)
          .slice(0, 5)
          .map(hashtag => ({
            hashtag: hashtag.hashtag,
            platform: hashtag.platform,
            trend_score: hashtag.trend_score,
            lifecycle_stage: hashtag.trend_analysis.lifecycle_stage,
            momentum: hashtag.trend_analysis.momentum,
            market_opportunity:
              hashtag.competitive_landscape.market_opportunity,
          })),
        universal_trends: results.cross_platform_analysis.universal_trends,
        immediate_opportunities:
          results.strategic_recommendations.immediate_opportunities.slice(0, 3),
      },
      data: testMode
        ? results
        : {
            analysis_id: results.analysis_id,
            quality_metrics: results.quality_metrics,
            strategic_recommendations: results.strategic_recommendations,
          },
    });
  } catch (error) {
    const executionTime = Date.now() - startTime;
    logger.error("❌ Trending hashtag analysis failed", {
      error: error instanceof Error ? error.message : String(error),
      executionTime: `${executionTime}ms`,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Trending hashtag analysis failed",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
        execution_time_ms: executionTime,
      },
      { status: 500 }
    );
  }
}
