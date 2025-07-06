import { NextRequest, NextResponse } from "next/server";
import ContentIdeationEngine, {
  IdeationRequest,
} from "@/lib/research-scraping/content-ideation-engine";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action") || "ideas";
    const engine = new ContentIdeationEngine();

    switch (action) {
      case "ideas":
        const storedIdeas = await engine.getStoredContentIdeas({
          category: searchParams.get("category") || undefined,
          priority: searchParams.get("priority") || undefined,
          limit: parseInt(searchParams.get("limit") || "10"),
        });
        return NextResponse.json({
          success: true,
          data: storedIdeas,
          message: `Retrieved ${storedIdeas.length} content ideas`,
        });

      case "strategy":
        const timeframe = (searchParams.get("timeframe") || "month") as
          | "week"
          | "month"
          | "quarter";
        const strategy = await engine.generateContentStrategy(timeframe);
        return NextResponse.json({
          success: true,
          data: strategy,
          message: `Content strategy generated for ${timeframe}`,
        });

      case "demo":
        const demoRequest: IdeationRequest = {
          keywords: ["artificial intelligence", "digital transformation"],
          quantity: 6,
          includeCompetitorGaps: true,
          includeTrendingTopics: true,
        };
        const demoIdeas = await engine.generateContentIdeas(demoRequest);
        return NextResponse.json({
          success: true,
          data: {
            ideas: demoIdeas,
            summary: {
              totalIdeas: demoIdeas.length,
              highPriorityCount: demoIdeas.filter(
                idea => idea.priority === "high" || idea.priority === "critical"
              ).length,
              trendBasedCount: demoIdeas.filter(
                idea => idea.trendAlignment.timing === "immediate"
              ).length,
              avgConfidence:
                Math.round(
                  (demoIdeas.reduce((sum, idea) => sum + idea.confidence, 0) /
                    demoIdeas.length) *
                    100
                ) / 100,
            },
          },
          message: `Demo completed: ${demoIdeas.length} content ideas generated`,
        });

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid action. Supported: ideas, strategy, demo",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Content ideation API error:", error);
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, request: ideationRequest } = body;
    const engine = new ContentIdeationEngine();

    switch (action) {
      case "generate":
        if (!ideationRequest) {
          return NextResponse.json(
            {
              success: false,
              message: "Ideation request is required",
            },
            { status: 400 }
          );
        }

        const ideas = await engine.generateContentIdeas(
          ideationRequest as IdeationRequest
        );
        return NextResponse.json({
          success: true,
          data: {
            ideas,
            statistics: {
              totalGenerated: ideas.length,
              avgConfidence:
                ideas.reduce((sum, idea) => sum + idea.confidence, 0) /
                ideas.length,
              priorityBreakdown: {
                critical: ideas.filter(idea => idea.priority === "critical")
                  .length,
                high: ideas.filter(idea => idea.priority === "high").length,
                medium: ideas.filter(idea => idea.priority === "medium").length,
                low: ideas.filter(idea => idea.priority === "low").length,
              },
            },
          },
          message: `Successfully generated ${ideas.length} content ideas`,
        });

      case "keyword-focused":
        const keywords = body.keywords;
        if (!keywords || !Array.isArray(keywords)) {
          return NextResponse.json(
            {
              success: false,
              message: "Keywords array is required",
            },
            { status: 400 }
          );
        }

        const keywordRequest: IdeationRequest = {
          keywords,
          quantity: body.quantity || 10,
          includeCompetitorGaps: true,
          includeTrendingTopics: true,
        };

        const keywordIdeas = await engine.generateContentIdeas(keywordRequest);
        return NextResponse.json({
          success: true,
          data: {
            ideas: keywordIdeas,
            keywordAnalysis: {
              targetKeywords: keywords,
              ideasGenerated: keywordIdeas.length,
              seoOpportunities: keywordIdeas.filter(idea => idea.seoScore > 75)
                .length,
            },
          },
          message: `Generated ${keywordIdeas.length} ideas for ${keywords.length} keywords`,
        });

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid action. Supported: generate, keyword-focused",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Content ideation POST error:", error);
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
