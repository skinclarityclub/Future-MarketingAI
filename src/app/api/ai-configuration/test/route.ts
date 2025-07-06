import { NextResponse } from "next/server";
import { runPersonalityEngineTest } from "@/lib/ai-configuration/personality-engine-test";

export async function GET() {
  try {
    const testResults = await runPersonalityEngineTest();

    return NextResponse.json({
      success: true,
      data: testResults,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Personality engine test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to run personality engine tests",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export const runtime = "edge";
