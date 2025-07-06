import { NextRequest, NextResponse } from "next/server";
import CompetitorAnalyzer, {
  CompetitorData,
} from "@/lib/research-scraping/competitor-analyzer";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action") || "results";

    switch (action) {
      case "results":
        const limit = parseInt(searchParams.get("limit") || "20");
        const competitorId = searchParams.get("competitor_id");

        let query = supabase
          .from("content_research")
          .select("*")
          .eq("research_type", "competitor_analysis")
          .order("created_at", { ascending: false })
          .limit(limit);

        if (competitorId) {
          query = query.eq("source_url", `competitor:${competitorId}`);
        }

        const { data: results, error } = await query;

        if (error) {
          throw new Error(
            `Failed to fetch competitor analyses: ${error.message}`
          );
        }

        return NextResponse.json({
          success: true,
          data: results || [],
          message: `Retrieved ${results?.length || 0} competitor analyses`,
        });

      case "demo":
        const mockCompetitor: CompetitorData = {
          id: "demo-competitor",
          name: "Demo Tech Company",
          domain: "demotech.com",
          industry: "Technology",
          contentData: [
            {
              title: "Revolutionary AI Solutions for Modern Business",
              content:
                "Our cutting-edge artificial intelligence solutions are transforming how businesses operate.",
              publishDate: new Date("2024-01-15"),
              url: "https://demotech.com/ai-solutions",
              contentType: "blog",
              engagement: {
                views: 2500,
                likes: 45,
                shares: 12,
                comments: 8,
              },
              seoMetrics: {
                keywords: [
                  "AI solutions",
                  "business automation",
                  "artificial intelligence",
                ],
                metaDescription:
                  "Transform your business with revolutionary AI solutions.",
                headings: ["AI Benefits", "Our Solutions", "Case Studies"],
              },
            },
          ],
        };

        const analyzer = new CompetitorAnalyzer();
        const demoAnalysis = await analyzer.analyzeCompetitor(mockCompetitor);

        return NextResponse.json({
          success: true,
          data: demoAnalysis,
          message: "Demo competitor analysis completed successfully",
        });

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid action. Supported actions: results, demo",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Competitor analysis API error:", error);
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
    const { action, competitorData, competitors } = body;

    const analyzer = new CompetitorAnalyzer();

    switch (action) {
      case "analyze":
        if (!competitorData) {
          return NextResponse.json(
            {
              success: false,
              message: "Competitor data is required for analysis",
            },
            { status: 400 }
          );
        }

        const analysis = await analyzer.analyzeCompetitor(
          competitorData as CompetitorData
        );

        return NextResponse.json({
          success: true,
          data: analysis,
          message: `Competitor analysis completed for ${competitorData.name}`,
        });

      case "demo":
        const mockCompetitor: CompetitorData = {
          id: "demo-competitor",
          name: "Demo Tech Company",
          domain: "demotech.com",
          industry: "Technology",
          contentData: [
            {
              title: "Revolutionary AI Solutions for Modern Business",
              content:
                "Our cutting-edge artificial intelligence solutions are transforming how businesses operate. From automated customer service to predictive analytics, we provide comprehensive AI tools that drive efficiency and innovation.",
              publishDate: new Date("2024-01-15"),
              url: "https://demotech.com/ai-solutions",
              contentType: "blog",
              engagement: {
                views: 2500,
                likes: 45,
                shares: 12,
                comments: 8,
              },
              seoMetrics: {
                keywords: [
                  "AI solutions",
                  "business automation",
                  "artificial intelligence",
                  "innovation",
                ],
                metaDescription:
                  "Transform your business with revolutionary AI solutions designed for modern enterprises.",
                headings: [
                  "AI Benefits",
                  "Our Solutions",
                  "Case Studies",
                  "Get Started",
                ],
              },
            },
            {
              title: "Digital Transformation Guide: Best Practices",
              content:
                "Digital transformation is essential for business success in today's market. This comprehensive guide covers proven strategies for successful digital transformation.",
              publishDate: new Date("2024-01-10"),
              url: "https://demotech.com/digital-transformation",
              contentType: "blog",
              engagement: {
                views: 1800,
                likes: 32,
                shares: 8,
                comments: 5,
              },
              seoMetrics: {
                keywords: [
                  "digital transformation",
                  "business strategy",
                  "technology adoption",
                ],
                metaDescription:
                  "Master digital transformation with our comprehensive guide to best practices.",
                headings: [
                  "Planning Phase",
                  "Implementation",
                  "Measuring Success",
                ],
              },
            },
          ],
        };

        const demoAnalysis = await analyzer.analyzeCompetitor(mockCompetitor);

        return NextResponse.json({
          success: true,
          data: demoAnalysis,
          message: "Demo competitor analysis completed successfully",
        });

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid action. Supported actions: analyze, demo",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Competitor analysis POST error:", error);
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
