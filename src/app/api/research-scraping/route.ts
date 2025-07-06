import { NextRequest, NextResponse } from "next/server";
import WebScraper from "@/lib/research-scraping/web-scraper";
import {
  DEFAULT_SCRAPING_TARGETS,
  ScrapingTarget,
} from "@/lib/research-scraping/scraper-config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action") || "status";

    const scraper = new WebScraper();

    switch (action) {
      case "status":
        return NextResponse.json({
          success: true,
          data: scraper.getScrapingStats(),
          message: "Scraper status retrieved successfully",
        });

      case "targets":
        return NextResponse.json({
          success: true,
          data: {
            defaultTargets: DEFAULT_SCRAPING_TARGETS,
            totalTargets: DEFAULT_SCRAPING_TARGETS.length,
            enabledTargets: DEFAULT_SCRAPING_TARGETS.filter(t => t.enabled)
              .length,
          },
          message: "Scraping targets retrieved successfully",
        });

      case "results":
        const limit = parseInt(searchParams.get("limit") || "50");
        const { data: results, error } = await supabase
          .from("content_research")
          .select("*")
          .eq("research_type", "web_scraping")
          .order("created_at", { ascending: false })
          .limit(limit);

        if (error) {
          throw new Error(`Failed to fetch results: ${error.message}`);
        }

        return NextResponse.json({
          success: true,
          data: results || [],
          message: `Retrieved ${results?.length || 0} scraping results`,
        });

      default:
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid action. Supported actions: status, targets, results",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Research scraping API error:", error);
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
    const { action, targets, targetIds } = body;

    const scraper = new WebScraper();

    switch (action) {
      case "scrape":
        let targetsToScrape: ScrapingTarget[] = [];

        if (targets && Array.isArray(targets)) {
          targetsToScrape = targets;
        } else if (targetIds && Array.isArray(targetIds)) {
          targetsToScrape = DEFAULT_SCRAPING_TARGETS.filter(
            t => targetIds.includes(t.id) && t.enabled
          );
        } else {
          targetsToScrape = DEFAULT_SCRAPING_TARGETS.filter(t => t.enabled);
        }

        if (targetsToScrape.length === 0) {
          return NextResponse.json(
            {
              success: false,
              message: "No valid targets specified for scraping",
            },
            { status: 400 }
          );
        }

        console.log(
          `Starting scraping operation for ${targetsToScrape.length} targets`
        );

        const results = await scraper.scrapeMultipleTargets(targetsToScrape);

        const successCount = results.filter(r => r.success).length;
        const failureCount = results.length - successCount;

        return NextResponse.json({
          success: true,
          data: {
            results,
            summary: {
              total: results.length,
              successful: successCount,
              failed: failureCount,
              successRate: Math.round((successCount / results.length) * 100),
            },
          },
          message: `Scraping completed: ${successCount}/${results.length} successful`,
        });

      case "test":
        const testTarget: ScrapingTarget = {
          id: "test-target",
          name: "Test Target",
          url: "https://example.com",
          type: "website",
          category: "competitor",
          scrapeConfig: {
            selectors: {
              title: "h1",
              content: "main, .content, article",
            },
            rateLimit: 1000,
          },
          enabled: true,
          scrapeFrequency: "daily",
        };

        const testResult = await scraper.scrapeTarget(testTarget);

        return NextResponse.json({
          success: true,
          data: testResult,
          message: "Test scraping completed",
        });

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid action. Supported actions: scrape, test",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Research scraping POST error:", error);
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
