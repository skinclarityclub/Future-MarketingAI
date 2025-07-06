import { NextRequest, NextResponse } from "next/server";
import {
  DataCleaningEngine,
  RawDataInput,
  DataCleaningConfig,
} from "@/lib/data-seeding/data-cleaning-engine";
import { logger } from "@/lib/logger";

const dataCleaningEngine = new DataCleaningEngine();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const timeframe =
      (searchParams.get("timeframe") as "day" | "week" | "month") || "day";

    if (action === "summary") {
      const summary = await dataCleaningEngine.getCleaningSummary(timeframe);

      return NextResponse.json({
        success: true,
        data: summary,
        message: `Data cleaning summary for ${timeframe}`,
        timestamp: new Date().toISOString(),
      });
    }

    if (action === "test") {
      // Return test data for API verification
      const testData = {
        endpoint: "/api/data-seeding/data-cleaning",
        methods: ["GET", "POST"],
        parameters: {
          GET: {
            action: "summary | test",
            timeframe: "day | week | month",
          },
          POST: {
            inputs: "RawDataInput[]",
            config: "DataCleaningConfig (optional)",
          },
        },
        version: "1.0.0",
        status: "operational",
      };

      return NextResponse.json({
        success: true,
        data: testData,
        message: "Data Cleaning API test endpoint",
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action parameter. Use "summary" or "test"',
        availableActions: ["summary", "test"],
      },
      { status: 400 }
    );
  } catch (error) {
    logger.error("Data Cleaning API GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inputs, config, testMode = false } = body;

    if (!inputs || !Array.isArray(inputs)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
          message: 'Expected "inputs" array of RawDataInput objects',
        },
        { status: 400 }
      );
    }

    // Validate input structure
    const validationErrors = validateInputs(inputs);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Input validation failed",
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    let cleaningEngine = dataCleaningEngine;

    // Use custom config if provided
    if (config) {
      cleaningEngine = new DataCleaningEngine(config);
    }

    // Process data cleaning
    const startTime = Date.now();
    const results = await cleaningEngine.cleanDataBatch(
      inputs as RawDataInput[]
    );
    const processingTime = Date.now() - startTime;

    // Calculate summary statistics
    const summary = {
      totalInputs: inputs.length,
      totalOriginalRecords: results.reduce(
        (sum, r) => sum + r.metadata.originalCount,
        0
      ),
      totalCleanedRecords: results.reduce(
        (sum, r) => sum + r.metadata.cleanedCount,
        0
      ),
      totalRemovedRecords: results.reduce(
        (sum, r) => sum + (r.metadata.originalCount - r.metadata.cleanedCount),
        0
      ),
      averageQualityScore:
        results.length > 0
          ? results.reduce((sum, r) => sum + r.metadata.qualityScore, 0) /
            results.length
          : 0,
      processingTime: `${processingTime}ms`,
      sources: [...new Set(results.map(r => r.source))],
      totalIssues: results.reduce((sum, r) => sum + r.issues.length, 0),
      criticalIssues: results.reduce(
        (sum, r) =>
          sum + r.issues.filter(i => i.severity === "critical").length,
        0
      ),
    };

    logger.info("Data cleaning batch completed", {
      ...summary,
      testMode,
    });

    return NextResponse.json({
      success: true,
      data: {
        results,
        summary,
        testMode,
        processingTime: `${processingTime}ms`,
      },
      message: `Successfully cleaned ${summary.totalInputs} datasets`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Data Cleaning API POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process data cleaning request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function validateInputs(inputs: any[]): string[] {
  const errors: string[] = [];

  inputs.forEach((input, index) => {
    if (!input.source) {
      errors.push(`Input ${index}: Missing required "source" field`);
    }

    if (!input.data || !Array.isArray(input.data)) {
      errors.push(`Input ${index}: Missing or invalid "data" array`);
    }

    if (!input.timestamp) {
      errors.push(`Input ${index}: Missing required "timestamp" field`);
    }

    const validSources = [
      "content_posts",
      "content_analytics",
      "social_accounts",
      "campaigns",
      "trending_hashtags",
      "competitor_data",
    ];
    if (input.source && !validSources.includes(input.source)) {
      errors.push(
        `Input ${index}: Invalid source "${input.source}". Must be one of: ${validSources.join(", ")}`
      );
    }
  });

  return errors;
}
