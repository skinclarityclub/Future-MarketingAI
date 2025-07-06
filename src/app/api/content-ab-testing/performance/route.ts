import { NextRequest, NextResponse } from "next/server";
import { ContentABTestingService } from "@/lib/services/content-ab-testing-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "summary";
    const testId = searchParams.get("testId");

    const abTestingService = new ContentABTestingService();

    switch (action) {
      case "test_metrics":
        if (!testId) {
          return NextResponse.json(
            {
              success: false,
              error: "Test ID is required for test metrics",
            },
            { status: 400 }
          );
        }

        const testMetrics =
          await abTestingService.getTestPerformanceMetrics(testId);
        return NextResponse.json({
          success: true,
          data: testMetrics,
        });

      case "summary":
      default:
        const analyticsSummary =
          await abTestingService.getABTestingAnalyticsSummary();
        return NextResponse.json({
          success: true,
          data: analyticsSummary,
        });
    }
  } catch (error) {
    console.error("Content A/B Testing Performance API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch A/B testing performance data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
