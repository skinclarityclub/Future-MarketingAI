import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action") || "list";

    switch (action) {
      case "list":
        return NextResponse.json({
          success: true,
          data: {
            tests: generateMockTests(),
            analytics: generateMockAnalytics(),
          },
          message: "A/B tests retrieved successfully",
        });

      case "analytics":
        const timeframe = searchParams.get("timeframe") || "30d";
        return NextResponse.json({
          success: true,
          data: generateMockAnalytics(),
          message: `A/B testing analytics for ${timeframe} retrieved successfully`,
        });

      case "demo":
        return NextResponse.json({
          success: true,
          data: generateComprehensiveDemo(),
          message: "Demo A/B test data generated successfully",
        });

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid action. Supported actions: list, analytics, demo",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("A/B testing API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "create":
        return NextResponse.json({
          success: true,
          data: generateMockTest(),
          message: "A/B test created successfully",
        });

      case "demo-create":
        return NextResponse.json({
          success: true,
          data: generateMockTest(),
          message: "Demo A/B test created successfully",
        });

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid action. Supported actions: create, demo-create",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("A/B testing POST error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

function generateMockTests() {
  return [
    {
      id: "ab-test-001",
      name: "Email Subject Line Test",
      type: "subject_line",
      status: "running",
      significance: 87.3,
      confidence: 92.1,
      improvement: 18.5,
      daysRunning: 3,
    },
    {
      id: "ab-test-002",
      name: "Landing Page CTA Color",
      type: "creative",
      status: "completed",
      significance: 95.8,
      confidence: 97.2,
      improvement: 24.6,
      daysRunning: 7,
    },
  ];
}

function generateMockAnalytics() {
  return {
    summary: {
      totalTests: 12,
      runningTests: 3,
      completedTests: 9,
      successRate: 75.0,
      avgImprovement: 18.5,
    },
    testTypes: [
      { type: "subject_line", count: 4, successRate: 75 },
      { type: "creative", count: 3, successRate: 66.7 },
      { type: "content", count: 2, successRate: 100 },
      { type: "timing", count: 2, successRate: 50 },
      { type: "audience", count: 1, successRate: 100 },
    ],
  };
}

function generateMockTest() {
  return {
    id: "ab-test-" + Date.now(),
    name: "Demo A/B Test",
    status: "draft",
    variants: [
      {
        id: "control",
        name: "Control",
        isControl: true,
        trafficPercentage: 50,
      },
      {
        id: "variant-a",
        name: "Variant A",
        isControl: false,
        trafficPercentage: 50,
      },
    ],
    createdAt: new Date().toISOString(),
  };
}

function generateComprehensiveDemo() {
  return {
    overview: {
      totalTests: 12,
      runningTests: 5,
      completedTests: 7,
      successRate: 71.4,
      avgImprovement: 18.5,
    },
    activeTests: [
      {
        id: "ab-demo-001",
        name: "Subject Line Emoji Test",
        type: "subject_line",
        status: "running",
        significance: 89.2,
        daysRunning: 3,
        estimatedCompletion: 2,
      },
      {
        id: "ab-demo-002",
        name: "Landing Page CTA Color",
        type: "creative",
        status: "running",
        significance: 67.8,
        daysRunning: 1,
        estimatedCompletion: 4,
      },
    ],
    performanceByType: [
      { type: "subject_line", tests: 4, successRate: 75, avgImprovement: 22.1 },
      { type: "creative", tests: 3, successRate: 66.7, avgImprovement: 18.3 },
      { type: "content", tests: 2, successRate: 100, avgImprovement: 12.4 },
    ],
    recommendations: [
      "Focus on email personalization - highest success rate and impact",
      "Expand creative testing - good potential for improvement",
      "Consider audience segmentation tests for higher impact",
    ],
  };
}
