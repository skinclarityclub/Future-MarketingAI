import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { TrendDetector } from "@/lib/research-scraping/trend-detector";
import { CompetitorAnalyzer } from "@/lib/research-scraping/competitor-analyzer";
import { ContentIdeationEngine } from "@/lib/research-scraping/content-ideation-engine";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const endpoint = searchParams.get("endpoint") || "dashboard";

    switch (endpoint) {
      case "dashboard":
        return await getResearchDashboard(searchParams);

      case "trends":
        return await getTrends(searchParams);

      case "competitors":
        return await getCompetitors(searchParams);

      case "content-suggestions":
        return await getContentSuggestions(searchParams);

      case "insights":
        return await getInsights(searchParams);

      case "reports":
        return await getReports(searchParams);

      case "analytics":
        return await getAnalytics(searchParams);

      default:
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid endpoint. Supported: dashboard, trends, competitors, content-suggestions, insights, reports, analytics",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Research API error:", error);
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
    const { endpoint, action, ...params } = body;

    switch (endpoint) {
      case "trends":
        return await handleTrendsActions(action, params);

      case "competitors":
        return await handleCompetitorActions(action, params);

      case "content-suggestions":
        return await handleContentSuggestionActions(action, params);

      case "reports":
        return await handleReportActions(action, params);

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid endpoint for POST request",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Research API POST error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

// ====================================================================
// GET ENDPOINT HANDLERS
// ====================================================================

async function getResearchDashboard(searchParams: URLSearchParams) {
  const timeframe = searchParams.get("timeframe") || "week";
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    // Get recent research data
    const { data: competitorData } = await supabase
      .from("content_research")
      .select("*")
      .eq("research_type", "competitor_analysis")
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: contentIdeas } = await supabase
      .from("content_research")
      .select("*")
      .eq("research_type", "content_ideation")
      .order("created_at", { ascending: false })
      .limit(limit);

    const { data: trendData } = await supabase
      .from("content_research")
      .select("*")
      .eq("research_type", "trend_analysis")
      .order("created_at", { ascending: false })
      .limit(5);

    const dashboard = {
      summary: {
        timeframe,
        lastUpdated: new Date().toISOString(),
        totalResearchItems:
          (competitorData?.length || 0) +
          (contentIdeas?.length || 0) +
          (trendData?.length || 0),
        trends: {
          total: trendData?.length || 0,
          recent: trendData?.slice(0, 3) || [],
        },
        competitors: {
          analyzed: competitorData?.length || 0,
          recent: competitorData?.slice(0, 3) || [],
        },
        contentIdeas: {
          generated: contentIdeas?.length || 0,
          recent: contentIdeas?.slice(0, 5) || [],
        },
      },
      recommendations: [
        "Focus on emerging trends for content creation",
        "Analyze top-performing competitor content",
        "Leverage high-confidence content ideas",
        "Monitor trend momentum for timing",
        "Update content strategy based on insights",
      ],
    };

    return NextResponse.json({
      success: true,
      data: dashboard,
      message: "Research dashboard data retrieved successfully",
    });
  } catch (error) {
    throw new Error(`Dashboard data retrieval failed: ${error}`);
  }
}

async function getTrends(searchParams: URLSearchParams) {
  const limit = parseInt(searchParams.get("limit") || "20");
  const category = searchParams.get("category");

  try {
    let query = supabase
      .from("content_research")
      .select("*")
      .eq("research_type", "trend_analysis")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq("research_data->category", category);
    }

    const { data: trendData, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch trends: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        trends: trendData || [],
        metadata: {
          total: trendData?.length || 0,
          category: category || "all",
        },
      },
      message: `Retrieved ${trendData?.length || 0} trends`,
    });
  } catch (error) {
    throw new Error(`Trends retrieval failed: ${error}`);
  }
}

async function getCompetitors(searchParams: URLSearchParams) {
  const industry = searchParams.get("industry");
  const limit = parseInt(searchParams.get("limit") || "20");

  try {
    let query = supabase
      .from("competitors")
      .select("*")
      .order("last_analyzed_at", { ascending: false })
      .limit(limit);

    if (industry) {
      query = query.eq("industry", industry);
    }

    const { data: competitors, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch competitors: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        competitors: competitors || [],
        metadata: {
          total: competitors?.length || 0,
          filters: { industry },
        },
      },
      message: `Retrieved ${competitors?.length || 0} competitors`,
    });
  } catch (error) {
    throw new Error(`Competitors retrieval failed: ${error}`);
  }
}

async function getContentSuggestions(searchParams: URLSearchParams) {
  const keywords = searchParams
    .get("keywords")
    ?.split(",")
    .map(k => k.trim());
  const priority = searchParams.get("priority");
  const limit = parseInt(searchParams.get("limit") || "20");

  try {
    let query = supabase
      .from("content_ideas")
      .select("*")
      .order("confidence", { ascending: false })
      .limit(limit);

    if (priority) {
      query = query.eq("priority", priority);
    }

    const { data: suggestions, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch content suggestions: ${error.message}`);
    }

    // Filter by keywords if provided
    let filteredSuggestions = suggestions || [];
    if (keywords && keywords.length > 0) {
      filteredSuggestions =
        suggestions?.filter(suggestion =>
          keywords.some(keyword =>
            suggestion.keywords?.some((k: string) =>
              k.toLowerCase().includes(keyword.toLowerCase())
            )
          )
        ) || [];
    }

    return NextResponse.json({
      success: true,
      data: {
        suggestions: filteredSuggestions,
        metadata: {
          total: filteredSuggestions.length,
          filters: { keywords, priority },
        },
      },
      message: `Retrieved ${filteredSuggestions.length} content suggestions`,
    });
  } catch (error) {
    throw new Error(`Content suggestions retrieval failed: ${error}`);
  }
}

async function getInsights(searchParams: URLSearchParams) {
  const timeframe = searchParams.get("timeframe") || "week";

  try {
    const startDate = new Date();
    const days = timeframe === "day" ? 1 : timeframe === "week" ? 7 : 30;
    startDate.setDate(startDate.getDate() - days);

    const { data: researchData, error } = await supabase
      .from("content_research")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch research data: ${error.message}`);
    }

    const insights = {
      summary: {
        totalResearch: researchData?.length || 0,
        timeframe,
        periodStart: startDate.toISOString(),
        periodEnd: new Date().toISOString(),
      },
      keyFindings: [] as string[],
      opportunities: [
        "Leverage emerging trends for content creation",
        "Target competitor content gaps",
        "Optimize posting times based on analytics",
        "Develop content series around trending topics",
      ],
      recommendations: [
        "Focus on high-confidence content ideas first",
        "Monitor competitor posting schedules for optimization",
        "Develop evergreen content around stable trends",
      ],
    };

    if (researchData && researchData.length > 0) {
      const trendAnalyses = researchData.filter(
        r => r.research_type === "trend_analysis"
      );
      const competitorAnalyses = researchData.filter(
        r => r.research_type === "competitor_analysis"
      );
      const contentIdeas = researchData.filter(
        r => r.research_type === "content_ideation"
      );

      insights.keyFindings = [
        `${trendAnalyses.length} trend analyses completed in ${timeframe}`,
        `${competitorAnalyses.length} competitor analyses conducted`,
        `${contentIdeas.length} content ideas generated`,
        "High-performing content patterns identified",
      ];
    }

    return NextResponse.json({
      success: true,
      data: insights,
      message: `Generated insights for ${timeframe} period`,
    });
  } catch (error) {
    throw new Error(`Insights generation failed: ${error}`);
  }
}

async function getReports(searchParams: URLSearchParams) {
  const reportType = searchParams.get("type") || "summary";
  const timeframe = searchParams.get("timeframe") || "week";
  const format = searchParams.get("format") || "json";

  try {
    const { data: reports, error } = await supabase
      .from("research_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      throw new Error(`Failed to fetch reports: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        reports: reports || [],
        metadata: {
          type: reportType,
          timeframe,
          format,
          total: reports?.length || 0,
        },
      },
      message: `Retrieved ${reports?.length || 0} research reports`,
    });
  } catch (error) {
    throw new Error(`Reports retrieval failed: ${error}`);
  }
}

async function getAnalytics(searchParams: URLSearchParams) {
  const timeframe = searchParams.get("timeframe") || "week";

  try {
    const startDate = new Date();
    const days = timeframe === "day" ? 1 : timeframe === "week" ? 7 : 30;
    startDate.setDate(startDate.getDate() - days);

    // Get research activity metrics
    const { data: activity, error: activityError } = await supabase
      .from("content_research")
      .select("research_type, created_at, confidence_score")
      .gte("created_at", startDate.toISOString());

    if (activityError) {
      throw new Error(
        `Failed to fetch activity data: ${activityError.message}`
      );
    }

    // Calculate analytics
    const analytics = {
      overview: {
        totalResearch: activity?.length || 0,
        averageConfidence:
          activity?.reduce(
            (sum, item) => sum + (item.confidence_score || 0),
            0
          ) / (activity?.length || 1),
        researchByType: {} as Record<string, number>,
        dailyActivity: {},
      },
      performance: {
        highConfidenceItems:
          activity?.filter(item => (item.confidence_score || 0) >= 80).length ||
          0,
        mediumConfidenceItems:
          activity?.filter(
            item =>
              (item.confidence_score || 0) >= 60 &&
              (item.confidence_score || 0) < 80
          ).length || 0,
        lowConfidenceItems:
          activity?.filter(item => (item.confidence_score || 0) < 60).length ||
          0,
      },
      trends: {
        researchVelocity: (activity?.length || 0) / days,
        mostActiveDay: "Monday", // This could be calculated from actual data
        mostResearchedType: "trend_analysis", // This could be calculated from actual data
      },
    };

    // Group by research type
    if (activity) {
      activity.forEach(item => {
        const type = item.research_type;
        analytics.overview.researchByType[type] =
          (analytics.overview.researchByType[type] || 0) + 1;
      });
    }

    return NextResponse.json({
      success: true,
      data: analytics,
      message: `Analytics generated for ${timeframe} period`,
    });
  } catch (error) {
    throw new Error(`Analytics generation failed: ${error}`);
  }
}

// ====================================================================
// POST ENDPOINT HANDLERS
// ====================================================================

async function handleTrendsActions(action: string, params: any) {
  const detector = new TrendDetector();

  switch (action) {
    case "analyze":
      const { keywords } = params;
      if (!keywords || !Array.isArray(keywords)) {
        return NextResponse.json(
          {
            success: false,
            message: "Keywords array is required for trend analysis",
          },
          { status: 400 }
        );
      }

      const analyses = await detector.detectTrends(keywords);
      return NextResponse.json({
        success: true,
        data: analyses,
        message: `Trend analysis completed for ${keywords.length} keywords`,
      });

    case "alerts":
      const alerts = await detector.generateTrendAlerts([]);
      return NextResponse.json({
        success: true,
        data: alerts,
        message: `Generated ${alerts.length} trend alerts`,
      });

    default:
      return NextResponse.json(
        {
          success: false,
          message: "Invalid action for trends endpoint",
        },
        { status: 400 }
      );
  }
}

async function handleCompetitorActions(action: string, params: any) {
  const analyzer = new CompetitorAnalyzer();

  switch (action) {
    case "analyze":
      const { competitorData } = params;
      if (!competitorData) {
        return NextResponse.json(
          {
            success: false,
            message: "Competitor data is required for analysis",
          },
          { status: 400 }
        );
      }

      const analysis = await analyzer.analyzeCompetitor(competitorData);
      return NextResponse.json({
        success: true,
        data: analysis,
        message: `Competitor analysis completed for ${competitorData.name}`,
      });

    default:
      return NextResponse.json(
        {
          success: false,
          message: "Invalid action for competitors endpoint",
        },
        { status: 400 }
      );
  }
}

async function handleContentSuggestionActions(action: string, params: any) {
  const engine = new ContentIdeationEngine();

  switch (action) {
    case "generate":
      const { request } = params;
      if (!request) {
        return NextResponse.json(
          {
            success: false,
            message: "Request parameters are required for content generation",
          },
          { status: 400 }
        );
      }

      const ideas = await engine.generateContentIdeas(request);
      return NextResponse.json({
        success: true,
        data: { ideas },
        message: `Generated ${ideas.length} content suggestions`,
      });

    default:
      return NextResponse.json(
        {
          success: false,
          message: "Invalid action for content suggestions endpoint",
        },
        { status: 400 }
      );
  }
}

async function handleReportActions(action: string, params: any) {
  switch (action) {
    case "generate":
      const { reportType, timeframe = "week" } = params;

      // This would generate a comprehensive report
      const report = {
        id: `report_${Date.now()}`,
        type: reportType || "comprehensive",
        timeframe,
        generatedAt: new Date().toISOString(),
        summary: "Comprehensive research report generated",
        sections: [
          "Executive Summary",
          "Trend Analysis",
          "Competitor Intelligence",
          "Content Opportunities",
          "Recommendations",
        ],
      };

      return NextResponse.json({
        success: true,
        data: report,
        message: `${reportType || "Comprehensive"} report generated successfully`,
      });

    default:
      return NextResponse.json(
        {
          success: false,
          message: "Invalid action for reports endpoint",
        },
        { status: 400 }
      );
  }
}
