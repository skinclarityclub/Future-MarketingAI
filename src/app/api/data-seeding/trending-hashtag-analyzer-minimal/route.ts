import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

/**
 * POST - Execute minimal trending hashtag analysis for debugging
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    logger.info(
      "🧪 Minimal Trending Hashtag Analyzer API - POST request received"
    );

    const body = await request.json();
    const { platforms = ["instagram"], testMode = true } = body;

    logger.info("Minimal analyzer config created", { platforms, testMode });

    // Mock analysis results for now
    const results = {
      analysis_id: `analysis_${Date.now()}`,
      timestamp: new Date().toISOString(),
      trending_hashtags: [
        { hashtag: "#skc", count: 1250, engagement_rate: 0.085 },
        { hashtag: "#business", count: 980, engagement_rate: 0.072 },
        { hashtag: "#intelligence", count: 750, engagement_rate: 0.091 },
      ],
    };

    const executionTime = Date.now() - startTime;

    logger.info("✅ Minimal trending hashtag analysis completed successfully", {
      analysisId: results.analysis_id,
      hashtagsAnalyzed: results.trending_hashtags.length,
      executionTime: `${executionTime}ms`,
    });

    return NextResponse.json({
      success: true,
      message: "Minimal trending hashtag analysis completed successfully",
      results: {
        analysis_id: results.analysis_id,
        timestamp: results.timestamp,
        execution_time_ms: executionTime,
        hashtags_found: results.trending_hashtags.length,
        trending_hashtags: results.trending_hashtags,
      },
    });
  } catch (error) {
    const executionTime = Date.now() - startTime;
    logger.error(
      "❌ Minimal trending hashtag analysis failed",
      error instanceof Error ? error : new Error(String(error))
    );

    return NextResponse.json(
      {
        success: false,
        error: "Minimal trending hashtag analysis failed",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
        execution_time_ms: executionTime,
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Get status of minimal trending hashtag analyzer
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Minimal Trending Hashtag Analyzer API is operational",
    endpoints: {
      POST: "Trigger minimal trending hashtag analysis for debugging",
    },
  });
}
