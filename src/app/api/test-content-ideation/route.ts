import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Test the Content Ideation Engine API
    const baseUrl = request.nextUrl.origin;

    // Test the demo endpoint
    const demoResponse = await fetch(
      `${baseUrl}/api/research-scraping/content-ideation?action=demo`
    );
    const demoData = await demoResponse.json();

    // Test stored ideas endpoint
    const ideasResponse = await fetch(
      `${baseUrl}/api/research-scraping/content-ideation?action=ideas&limit=5`
    );
    const ideasData = await ideasResponse.json();

    // Test strategy endpoint
    const strategyResponse = await fetch(
      `${baseUrl}/api/research-scraping/content-ideation?action=strategy&timeframe=month`
    );
    const strategyData = await strategyResponse.json();

    return NextResponse.json({
      success: true,
      message: "Content Ideation Engine test completed successfully",
      results: {
        demo: {
          success: demoData.success,
          ideasCount: demoData.data?.ideas?.length || 0,
          summary: demoData.data?.summary || null,
        },
        storedIdeas: {
          success: ideasData.success,
          count: ideasData.data?.length || 0,
        },
        strategy: {
          success: strategyData.success,
          totalIdeas: strategyData.data?.totalIdeas || 0,
          keyThemes: strategyData.data?.keyThemes?.length || 0,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Content Ideation test failed:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
