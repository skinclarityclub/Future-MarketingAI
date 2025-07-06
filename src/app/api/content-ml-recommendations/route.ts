import { NextRequest, NextResponse } from "next/server";
import { ContentRecommendationsEngine } from "@/lib/ml/content-recommendations-engine";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "insights";

    const mlEngine = new ContentRecommendationsEngine();

    switch (action) {
      case "insights":
        const insights = await mlEngine.getContentInsights();
        return NextResponse.json({
          success: true,
          data: insights,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action parameter",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in ML recommendations API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate ML recommendations",
      },
      { status: 500 }
    );
  }
}
