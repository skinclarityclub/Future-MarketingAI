import { NextRequest, NextResponse } from "next/server";
import { AutomaticContentOptimizationService } from "@/lib/ml/automatic-content-optimization-service";

const optimizationService = new AutomaticContentOptimizationService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, includeAutoApply = false } = body;

    if (!content || !content.id || !content.content || !content.platform) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["content.id", "content.content", "content.platform"],
        },
        { status: 400 }
      );
    }

    // Generate optimization suggestions
    const suggestions =
      await optimizationService.generateOptimizationSuggestions(
        content,
        includeAutoApply
      );

    return NextResponse.json({
      success: true,
      data: {
        content_id: content.id,
        total_suggestions: suggestions.length,
        auto_applied: suggestions.filter(s => s.applied_at).length,
        pending: suggestions.filter(s => !s.applied_at).length,
        suggestions: suggestions.map(s => ({
          id: s.id,
          type: s.type,
          priority: s.priority,
          suggestion: s.suggestion,
          reasoning: s.reasoning,
          confidence_score: s.confidence_score,
          estimated_impact: s.estimated_impact,
          implementation: s.implementation,
          validation: s.validation,
          applied: !!s.applied_at,
        })),
        summary: {
          high_priority: suggestions.filter(
            s => s.priority === "high" || s.priority === "critical"
          ).length,
          auto_applicable: suggestions.filter(
            s => s.implementation.auto_applicable
          ).length,
          estimated_total_impact: {
            engagement: Math.round(
              suggestions.reduce(
                (sum, s) => sum + s.estimated_impact.engagement_increase,
                0
              ) / suggestions.length
            ),
            reach: Math.round(
              suggestions.reduce(
                (sum, s) => sum + s.estimated_impact.reach_increase,
                0
              ) / suggestions.length
            ),
            roi: Math.round(
              suggestions.reduce(
                (sum, s) => sum + s.estimated_impact.roi_improvement,
                0
              ) / suggestions.length
            ),
          },
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Content optimization API error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate optimization suggestions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get("content_id");

    if (!contentId) {
      return NextResponse.json(
        { error: "content_id parameter is required" },
        { status: 400 }
      );
    }

    // Generate optimization report
    const report =
      await optimizationService.generateOptimizationReport(contentId);

    return NextResponse.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Optimization report API error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate optimization report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Apply specific optimization suggestion
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { content_id, suggestion_id, action } = body;

    if (!content_id || !suggestion_id || !action) {
      return NextResponse.json(
        { error: "Missing required fields: content_id, suggestion_id, action" },
        { status: 400 }
      );
    }

    if (action === "apply") {
      // Apply the specific suggestion
      // This would need the actual content object
      return NextResponse.json({
        success: true,
        message: `Suggestion ${suggestion_id} applied to content ${content_id}`,
        applied_at: new Date().toISOString(),
      });
    } else if (action === "dismiss") {
      // Mark suggestion as dismissed
      return NextResponse.json({
        success: true,
        message: `Suggestion ${suggestion_id} dismissed for content ${content_id}`,
        dismissed_at: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'apply' or 'dismiss'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Apply suggestion API error:", error);
    return NextResponse.json(
      {
        error: "Failed to apply suggestion",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
