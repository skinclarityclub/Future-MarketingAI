import { NextRequest, NextResponse } from "next/server";
import TrendDetector from "@/lib/research-scraping/trend-detector";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action") || "summary";

    const detector = new TrendDetector();

    switch (action) {
      case "summary":
        const timeframe = (searchParams.get("timeframe") || "week") as
          | "day"
          | "week"
          | "month";

        const summary = await detector.getTrendingSummary(timeframe);

        return NextResponse.json({
          success: true,
          data: summary,
          message: `Trending summary for ${timeframe} retrieved successfully`,
        });

      case "results":
        const limit = parseInt(searchParams.get("limit") || "20");
        const category = searchParams.get("category");

        let query = supabase
          .from("content_research")
          .select("*")
          .eq("research_type", "trend_analysis")
          .order("created_at", { ascending: false })
          .limit(limit);

        if (category) {
          query = query.eq("content_data->trendAnalysis->category", category);
        }

        const { data: results, error } = await query;

        if (error) {
          throw new Error(`Failed to fetch trend analyses: ${error.message}`);
        }

        const trendAnalyses =
          results
            ?.map(item => item.content_data?.trendAnalysis)
            .filter(Boolean) || [];

        return NextResponse.json({
          success: true,
          data: trendAnalyses,
          message: `Retrieved ${trendAnalyses.length} trend analyses`,
        });

      case "demo":
        // Generate demo trend analysis with mock data
        const mockKeywords = [
          "artificial intelligence",
          "machine learning",
          "automation",
          "digital transformation",
        ];

        console.log("Running demo trend detection...");
        const demoAnalyses = await detector.detectTrends(mockKeywords);

        return NextResponse.json({
          success: true,
          data: demoAnalyses,
          message: `Demo trend detection completed: ${demoAnalyses.length} trends analyzed`,
        });

      case "alerts":
        // Get recent trend alerts
        const alertLimit = parseInt(searchParams.get("limit") || "10");

        try {
          // Get recent trend analyses to generate alerts
          const { data: recentAnalyses } = await supabase
            .from("content_research")
            .select("*")
            .eq("research_type", "trend_analysis")
            .order("created_at", { ascending: false })
            .limit(alertLimit);

          const analyses =
            recentAnalyses
              ?.map(item => item.content_data?.trendAnalysis)
              .filter(Boolean) || [];
          const alerts = await detector.generateTrendAlerts(analyses);

          return NextResponse.json({
            success: true,
            data: alerts,
            message: `Generated ${alerts.length} trend alerts`,
          });
        } catch (error) {
          console.error("Error generating alerts:", error);
          return NextResponse.json(
            {
              success: false,
              message: "Failed to generate trend alerts",
            },
            { status: 500 }
          );
        }

      case "trending-now":
        // Get currently trending topics
        const trendingTimeframe = searchParams.get("timeframe") || "day";
        const trendingLimit = parseInt(searchParams.get("limit") || "10");

        try {
          const trendingSummary = await detector.getTrendingSummary(
            trendingTimeframe as any
          );

          return NextResponse.json({
            success: true,
            data: {
              timeframe: trendingTimeframe,
              topTrends: trendingSummary.topTrends.slice(0, trendingLimit),
              emergingTrends: trendingSummary.emergingTrends,
              totalTrends: trendingSummary.totalTrends,
              insights: trendingSummary.insights,
            },
            message: `Retrieved top ${trendingLimit} trending topics for ${trendingTimeframe}`,
          });
        } catch (error) {
          console.error("Error fetching trending topics:", error);
          return NextResponse.json(
            {
              success: false,
              message: "Failed to fetch trending topics",
            },
            { status: 500 }
          );
        }

      default:
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid action. Supported actions: summary, results, demo, alerts, trending-now",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Trend detection API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        error: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, keywords, options } = body;

    const detector = new TrendDetector();

    switch (action) {
      case "detect":
        console.log(
          `Starting trend detection${keywords ? ` for keywords: ${keywords.join(", ")}` : " for all data"}`
        );

        const analyses = await detector.detectTrends(keywords);

        return NextResponse.json({
          success: true,
          data: analyses,
          message: `Trend detection completed: ${analyses.length} trends analyzed`,
        });

      case "analyze-keywords":
        if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
          return NextResponse.json(
            {
              success: false,
              message: "Keywords array is required for keyword analysis",
            },
            { status: 400 }
          );
        }

        console.log(
          `Analyzing trends for specific keywords: ${keywords.join(", ")}`
        );

        const keywordAnalyses = await detector.detectTrends(keywords);

        // Generate alerts for the analyzed trends
        const keywordAlerts =
          await detector.generateTrendAlerts(keywordAnalyses);

        return NextResponse.json({
          success: true,
          data: {
            analyses: keywordAnalyses,
            alerts: keywordAlerts,
            summary: {
              totalAnalyses: keywordAnalyses.length,
              emergingTrends: keywordAnalyses.filter(
                a => a.momentum === "emerging"
              ).length,
              highStrengthTrends: keywordAnalyses.filter(
                a => a.trendStrength > 70
              ).length,
              alertsGenerated: keywordAlerts.length,
            },
          },
          message: `Keyword trend analysis completed for ${keywords.length} keywords`,
        });

      case "bulk-detect":
        console.log("Starting bulk trend detection for all available data...");

        try {
          // Run detection without specific keywords to analyze all data
          const bulkAnalyses = await detector.detectTrends();

          // Generate comprehensive summary
          const bulkSummary = await detector.getTrendingSummary("week");

          // Generate alerts
          const bulkAlerts = await detector.generateTrendAlerts(bulkAnalyses);

          return NextResponse.json({
            success: true,
            data: {
              analyses: bulkAnalyses,
              summary: bulkSummary,
              alerts: bulkAlerts,
              stats: {
                totalTrendsAnalyzed: bulkAnalyses.length,
                emergingTrends: bulkAnalyses.filter(
                  a => a.momentum === "emerging"
                ).length,
                risingTrends: bulkAnalyses.filter(a => a.momentum === "rising")
                  .length,
                stableTrends: bulkAnalyses.filter(a => a.momentum === "stable")
                  .length,
                decliningTrends: bulkAnalyses.filter(
                  a => a.momentum === "declining"
                ).length,
                highConfidenceTrends: bulkAnalyses.filter(
                  a => a.confidenceScore > 0.8
                ).length,
                alertsGenerated: bulkAlerts.length,
              },
            },
            message: `Bulk trend detection completed: ${bulkAnalyses.length} trends analyzed`,
          });
        } catch (error) {
          console.error("Bulk detection error:", error);
          return NextResponse.json(
            {
              success: false,
              message: "Bulk trend detection failed",
            },
            { status: 500 }
          );
        }

      case "demo-full":
        // Comprehensive demo with mock data and full analysis pipeline
        const demoKeywords = [
          "artificial intelligence",
          "machine learning",
          "automation",
          "digital transformation",
          "blockchain",
          "cloud computing",
          "cybersecurity",
          "data analytics",
          "remote work",
          "sustainability",
        ];

        console.log("Running comprehensive demo trend detection...");

        try {
          const demoAnalyses = await detector.detectTrends(demoKeywords);
          const demoSummary = await detector.getTrendingSummary("week");
          const demoAlerts = await detector.generateTrendAlerts(demoAnalyses);

          return NextResponse.json({
            success: true,
            data: {
              analyses: demoAnalyses,
              summary: demoSummary,
              alerts: demoAlerts,
              demoStats: {
                keywordsAnalyzed: demoKeywords.length,
                trendsDetected: demoAnalyses.length,
                emergingTrends: demoAnalyses.filter(
                  a => a.momentum === "emerging"
                ).length,
                alertsTriggered: demoAlerts.length,
                avgConfidenceScore:
                  Math.round(
                    (demoAnalyses.reduce(
                      (sum, a) => sum + a.confidenceScore,
                      0
                    ) /
                      demoAnalyses.length) *
                      100
                  ) / 100,
                topTrendingKeyword:
                  demoAnalyses.sort(
                    (a, b) => b.trendStrength - a.trendStrength
                  )[0]?.keyword || "N/A",
              },
            },
            message: `Demo trend detection completed successfully with ${demoAnalyses.length} trends analyzed`,
          });
        } catch (error) {
          console.error("Demo detection error:", error);
          return NextResponse.json(
            {
              success: false,
              message: "Demo trend detection failed",
            },
            { status: 500 }
          );
        }

      default:
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid action. Supported actions: detect, analyze-keywords, bulk-detect, demo-full",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Trend detection POST error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        error: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
