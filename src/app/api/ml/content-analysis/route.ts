import { NextRequest, NextResponse } from "next/server";
import { ContentPerformanceMLEngine } from "@/lib/ml/content-performance-ml-engine";

const mlEngine = new ContentPerformanceMLEngine();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, platform, timestamp, action } = body;

    if (!content || !platform) {
      return NextResponse.json(
        { error: "Content and platform are required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "analyze":
        // Comprehensive content analysis
        const analysis = await mlEngine.analyzeContentElements({
          text: content.text || "",
          hashtags: content.hashtags || [],
          platform,
          timestamp: timestamp || new Date().toISOString(),
        });

        return NextResponse.json({
          success: true,
          analysis,
          timestamp: new Date().toISOString(),
        });

      case "hashtag-recommendations":
        // Generate hashtag recommendations
        const recommendations = await mlEngine.generateHashtagRecommendations(
          content.text || "",
          platform,
          content.targetAudience,
          content.existingHashtags || []
        );

        return NextResponse.json({
          success: true,
          recommendations,
          timestamp: new Date().toISOString(),
        });

      case "hashtag-analysis":
        // Analyze specific hashtags
        if (!content.hashtags || !Array.isArray(content.hashtags)) {
          return NextResponse.json(
            { error: "Hashtags array is required for hashtag analysis" },
            { status: 400 }
          );
        }

        const hashtagAnalysis = await mlEngine.analyzeHashtagEffectiveness(
          content.hashtags,
          platform
        );

        return NextResponse.json({
          success: true,
          hashtag_analysis: hashtagAnalysis,
          timestamp: new Date().toISOString(),
        });

      default:
        // Default: comprehensive analysis (backward compatibility)
        const defaultAnalysis = await mlEngine.analyzeContentElements({
          text: content.text || "",
          hashtags: content.hashtags || [],
          platform,
          timestamp: timestamp || new Date().toISOString(),
        });

        return NextResponse.json({
          success: true,
          analysis: defaultAnalysis,
          timestamp: new Date().toISOString(),
        });
    }
  } catch (error) {
    console.error("Content analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze content" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform") || "instagram";
    const contentType = searchParams.get("contentType") || "post";
    const audienceSegment = searchParams.get("audienceSegment") || "general";
    const hashtags = searchParams.get("hashtags")?.split(",") || [];

    // Get optimal posting times with hashtag consideration
    const optimalTimes = await mlEngine.predictOptimalPostingTimes(
      contentType,
      platform,
      audienceSegment,
      hashtags
    );

    return NextResponse.json({
      success: true,
      optimal_posting_times: optimalTimes,
      platform,
      content_type: contentType,
      audience_segment: audienceSegment,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Optimal posting times error:", error);
    return NextResponse.json(
      { error: "Failed to get optimal posting times" },
      { status: 500 }
    );
  }
}
