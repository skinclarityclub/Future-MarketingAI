/**
 * Perplexity Research Test API
 * Test endpoint for Task 27: Test Perplexity Research Functionality
 */

import { NextRequest, NextResponse } from "next/server";
import { perplexityService } from "@/lib/services/perplexity-research-service";

export async function GET(request: NextRequest) {
  try {
    // Health check for Perplexity service
    const healthStatus = await perplexityService.healthCheck();

    return NextResponse.json({
      status: "success",
      message: "Perplexity Research Test API is operational",
      perplexityHealth: healthStatus,
      timestamp: new Date().toISOString(),
      endpoints: {
        health: "GET /api/perplexity-test",
        test: "POST /api/perplexity-test",
        research: "POST /api/perplexity-test?mode=research",
      },
    });
  } catch (error) {
    console.error("Perplexity test API error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to check Perplexity service health",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "test";

    // Improved JSON parsing with validation
    let body;
    try {
      const rawBody = await request.text();
      if (!rawBody || rawBody.trim() === "") {
        throw new Error("Empty request body");
      }
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error("Perplexity test JSON Parse Error:", parseError);
      return NextResponse.json(
        {
          error: "Invalid JSON format",
          message: "Request body contains invalid JSON data",
        },
        { status: 400 }
      );
    }

    const { question, context, language = "en" } = body;

    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    if (mode === "research") {
      // Full research mode with Perplexity
      console.log("Performing Perplexity research for:", question);

      const researchResult = await perplexityService.researchWithContext(
        question,
        {
          userRole: "admin",
          currentPage: "Dashboard",
          language: language as "en" | "nl",
        }
      );

      const totalTime = Date.now() - startTime;

      return NextResponse.json({
        mode: "research",
        question,
        result: researchResult,
        performance: {
          totalTime,
          perplexityTime: researchResult.processingTime,
        },
        status: "success",
      });
    } else {
      // Test mode - analyze query and check if it needs research
      const isResearchQuery = perplexityService.isResearchQuery(question);
      const isConfigured = perplexityService.isConfigured();

      let testResult = null;
      if (isResearchQuery && isConfigured) {
        try {
          // Perform actual research test
          testResult = await perplexityService.research({
            question,
            context,
            language: language as "en" | "nl",
            maxTokens: 200,
            temperature: 0.3,
          });
        } catch (error) {
          testResult = {
            error: error instanceof Error ? error.message : "Research failed",
          };
        }
      }

      const totalTime = Date.now() - startTime;

      return NextResponse.json({
        mode: "test",
        question,
        analysis: {
          isResearchQuery,
          isConfigured,
          shouldUsePerplexity: isResearchQuery && isConfigured,
        },
        testResult,
        performance: {
          totalTime,
          analysisTime: totalTime - (testResult?.processingTime || 0),
        },
        recommendations: {
          usePerplexity: isResearchQuery && isConfigured,
          reason: !isResearchQuery
            ? "Query doesn't require external research"
            : !isConfigured
              ? "Perplexity API not configured"
              : "Perfect for Perplexity research",
        },
        status: "success",
      });
    }
  } catch (error) {
    console.error("Perplexity test error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
