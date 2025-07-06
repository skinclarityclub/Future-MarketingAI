import { NextRequest, NextResponse } from "next/server";
import { AudienceInsightsService } from "@/lib/marketing/audience-insights-service";

const audienceService = new AudienceInsightsService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const segmentId = searchParams.get("segmentId");
    const segmentType = searchParams.get("segmentType");
    const channel = searchParams.get("channel");
    const industry = searchParams.get("industry");
    const month = searchParams.get("month");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = searchParams.get("limit");
    const totalBudget = searchParams.get("totalBudget");

    switch (action) {
      case "segments":
        const segments = await audienceService.getAudienceSegments({
          segment_type: segmentType || undefined,
          is_active: true,
        });
        return NextResponse.json({ segments });

      case "top-performing":
        const topSegments = await audienceService.getTopPerformingSegments(
          limit ? parseInt(limit) : 10,
          startDate && endDate ? { start: startDate, end: endDate } : undefined
        );
        return NextResponse.json({ segments: topSegments });

      case "performance":
        if (!segmentId) {
          return NextResponse.json(
            { error: "Segment ID is required for performance data" },
            { status: 400 }
          );
        }
        const performance = await audienceService.getAudiencePerformance(
          segmentId,
          {
            start:
              startDate ||
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
            end: endDate || new Date().toISOString().split("T")[0],
          }
        );
        return NextResponse.json({ performance });

      case "insights":
        const insights = await audienceService.getComprehensiveAudienceInsights(
          segmentId || undefined
        );
        return NextResponse.json({ insights });

      case "budget-recommendations":
        if (!totalBudget || !startDate || !endDate) {
          return NextResponse.json(
            { error: "Total budget, start date, and end date are required" },
            { status: 400 }
          );
        }
        const recommendations = await audienceService.getBudgetRecommendations(
          parseFloat(totalBudget),
          { start: startDate, end: endDate }
        );
        return NextResponse.json({ recommendations });

      case "budget-scenarios":
        const scenarios = await audienceService.getBudgetScenarios({
          is_active: true,
        });
        return NextResponse.json({ scenarios });

      case "seasonal-trends":
        const trends = await audienceService.getSeasonalTrends({
          industry: industry || undefined,
          channel: channel || undefined,
          month: month ? parseInt(month) : undefined,
        });
        return NextResponse.json({ trends });

      case "ab-test-recommendations":
        const abTests = await audienceService.getABTestRecommendations({
          status: "pending",
        });
        return NextResponse.json({ recommendations: abTests });

      case "predictions":
        const predictions = await audienceService.getPerformancePredictions({
          target_entity_type: searchParams.get("entityType") || undefined,
          target_entity_id: searchParams.get("entityId") || undefined,
          prediction_type: searchParams.get("predictionType") || undefined,
          date_range:
            startDate && endDate
              ? { start: startDate, end: endDate }
              : undefined,
        });
        return NextResponse.json({ predictions });

      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Audience insights API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const body = await request.json();

    switch (action) {
      case "create-segment":
        const segment = await audienceService.createAudienceSegment(body);
        return NextResponse.json({ segment });

      case "create-budget-scenario":
        const scenario = await audienceService.createBudgetScenario(body);
        return NextResponse.json({ scenario });

      case "create-prediction":
        const prediction =
          await audienceService.createPerformancePrediction(body);
        return NextResponse.json({ prediction });

      case "create-ab-test":
        const abTest = await audienceService.createABTestRecommendation(body);
        return NextResponse.json({ recommendation: abTest });

      case "sync-data":
        await audienceService.syncAudienceData();
        return NextResponse.json({
          message: "Data sync completed successfully",
        });

      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Audience insights API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
