import { NextRequest, NextResponse } from "next/server";
import { AttributionModelService } from "@/lib/marketing/attribution-model-service";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action");

  try {
    const attributionService = new AttributionModelService();

    switch (action) {
      case "models":
        const models = await attributionService.getAttributionModels();
        return NextResponse.json({
          success: true,
          data: models,
        });

      case "analysis":
        const conversionId = searchParams.get("conversionId");
        const modelId = searchParams.get("modelId");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const limit = parseInt(searchParams.get("limit") || "100");

        const analysis = await attributionService.getAttributionAnalysis(
          conversionId || undefined,
          modelId || undefined,
          startDate || undefined,
          endDate || undefined,
          limit
        );

        return NextResponse.json({
          success: true,
          data: analysis,
        });

      case "channel-performance":
        const requiredModelId = searchParams.get("modelId");
        const requiredStartDate = searchParams.get("startDate");
        const requiredEndDate = searchParams.get("endDate");

        if (!requiredModelId || !requiredStartDate || !requiredEndDate) {
          return NextResponse.json(
            {
              success: false,
              error: "Missing required parameters: modelId, startDate, endDate",
            },
            { status: 400 }
          );
        }

        const channelPerformance =
          await attributionService.getChannelPerformanceSummary(
            requiredModelId,
            requiredStartDate,
            requiredEndDate
          );

        return NextResponse.json({
          success: true,
          data: channelPerformance,
        });

      case "compare-models":
        const compareStartDate = searchParams.get("startDate");
        const compareEndDate = searchParams.get("endDate");

        if (!compareStartDate || !compareEndDate) {
          return NextResponse.json(
            {
              success: false,
              error: "Missing required parameters: startDate, endDate",
            },
            { status: 400 }
          );
        }

        const comparison = await attributionService.compareAttributionModels(
          compareStartDate,
          compareEndDate
        );

        return NextResponse.json({
          success: true,
          data: comparison,
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid action. Available actions: models, analysis, channel-performance, compare-models",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Attribution API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    const attributionService = new AttributionModelService();

    switch (action) {
      case "create-conversion":
        const conversionEvent = await attributionService.createConversionEvent(
          body.event
        );
        return NextResponse.json({
          success: true,
          data: conversionEvent,
        });

      case "create-touchpoint":
        const touchpoint = await attributionService.createTouchpoint(
          body.touchpoint
        );
        return NextResponse.json({
          success: true,
          data: touchpoint,
        });

      case "calculate-attribution":
        const { conversionId } = body;
        if (!conversionId) {
          return NextResponse.json(
            {
              success: false,
              error: "Missing required parameter: conversionId",
            },
            { status: 400 }
          );
        }

        const attributionResults =
          await attributionService.calculateAttributionForConversion(
            conversionId
          );
        return NextResponse.json({
          success: true,
          data: attributionResults,
        });

      case "sync-marketing-data":
        const { startDate, endDate } = body;
        if (!startDate || !endDate) {
          return NextResponse.json(
            {
              success: false,
              error: "Missing required parameters: startDate, endDate",
            },
            { status: 400 }
          );
        }

        const syncResults =
          await attributionService.syncMarketingDataToTouchpoints(
            startDate,
            endDate
          );
        return NextResponse.json({
          success: true,
          data: syncResults,
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid action. Available actions: create-conversion, create-touchpoint, calculate-attribution, sync-marketing-data",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Attribution API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
