// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";

// Mock data for content A/B tests
const mockContentABTests: any[] = [
  {
    id: "content-ab-001",
    name: "Subject Line Test - Newsletter",
    content_id: "content-123",
    status: "running",
    test_type: "subject_line",
    start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration_hours: 72,
    target_audience: "Newsletter subscribers",
    sample_size: 5000,
    traffic_split_type: "equal",
    significance_threshold: 95,
    current_significance: 87,
    confidence_level: 92,
    auto_declare_winner: true,
    platform: ["email"],
    objectives: ["increase_open_rate", "improve_engagement"],
    hypothesis: "Subject lines with emojis will increase open rates",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: [
      {
        id: "var-001",
        name: "Control",
        traffic_percentage: 50,
        is_control: true,
        content: {
          subject_line: "Weekly Insights: Industry Trends",
        },
        metrics: {
          impressions: 2500,
          clicks: 125,
          shares: 8,
          comments: 3,
          likes: 45,
          conversions: 12,
          engagement_rate: 2.24,
          click_through_rate: 5.0,
          conversion_rate: 9.6,
          cost_per_engagement: 2.1,
          reach: 2300,
        },
        performance_score: 75,
      },
      {
        id: "var-002",
        name: "Variant A",
        traffic_percentage: 50,
        is_control: false,
        content: {
          subject_line: "🚀 This Week's Game-Changing Trends",
        },
        metrics: {
          impressions: 2500,
          clicks: 156,
          shares: 12,
          comments: 7,
          likes: 62,
          conversions: 18,
          engagement_rate: 3.24,
          click_through_rate: 6.24,
          conversion_rate: 11.5,
          cost_per_engagement: 1.8,
          reach: 2400,
        },
        performance_score: 89,
      },
    ],
  },
  {
    id: "content-ab-002",
    name: "CTA Button Test - Landing Page",
    status: "completed",
    test_type: "cta",
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration_hours: 120,
    target_audience: "Website visitors",
    sample_size: 8000,
    traffic_split_type: "equal",
    significance_threshold: 95,
    current_significance: 98,
    confidence_level: 99,
    winner: "var-004",
    auto_declare_winner: true,
    platform: ["web", "mobile"],
    objectives: ["increase_conversions", "improve_ctr"],
    hypothesis: "Action-oriented CTAs will increase conversion rates",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: [
      {
        id: "var-003",
        name: "Control",
        traffic_percentage: 50,
        is_control: true,
        content: {
          cta_text: "Learn More",
        },
        metrics: {
          impressions: 4000,
          clicks: 240,
          shares: 15,
          comments: 8,
          likes: 89,
          conversions: 28,
          engagement_rate: 2.8,
          click_through_rate: 6.0,
          conversion_rate: 11.67,
          cost_per_engagement: 3.2,
          reach: 3800,
        },
        performance_score: 68,
      },
      {
        id: "var-004",
        name: "Variant B",
        traffic_percentage: 50,
        is_control: false,
        content: {
          cta_text: "Get Started Now",
        },
        metrics: {
          impressions: 4000,
          clicks: 328,
          shares: 24,
          comments: 15,
          likes: 142,
          conversions: 45,
          engagement_rate: 4.62,
          click_through_rate: 8.2,
          conversion_rate: 13.72,
          cost_per_engagement: 2.1,
          reach: 3900,
        },
        performance_score: 91,
      },
    ],
  },
  {
    id: "content-ab-003",
    name: "Image Test - Social Media Post",
    status: "running",
    test_type: "image",
    start_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    duration_hours: 96,
    target_audience: "Social media followers",
    sample_size: 12000,
    traffic_split_type: "equal",
    significance_threshold: 95,
    current_significance: 62,
    auto_declare_winner: true,
    platform: ["facebook", "instagram", "twitter"],
    objectives: ["increase_engagement", "boost_shares"],
    hypothesis: "Bright, colorful images will get more engagement",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: [
      {
        id: "var-005",
        name: "Control",
        traffic_percentage: 50,
        is_control: true,
        content: {
          image_url: "/images/product-neutral.jpg",
          text: "Check out our latest product features!",
        },
        metrics: {
          impressions: 6000,
          clicks: 180,
          shares: 25,
          comments: 12,
          likes: 156,
          conversions: 8,
          engagement_rate: 3.22,
          click_through_rate: 3.0,
          conversion_rate: 4.44,
          cost_per_engagement: 2.8,
          reach: 5800,
        },
        performance_score: 72,
      },
      {
        id: "var-006",
        name: "Variant C",
        traffic_percentage: 50,
        is_control: false,
        content: {
          image_url: "/images/product-colorful.jpg",
          text: "🎉 Discover amazing new features that will transform your workflow!",
        },
        metrics: {
          impressions: 6000,
          clicks: 234,
          shares: 38,
          comments: 21,
          likes: 203,
          conversions: 14,
          engagement_rate: 4.37,
          click_through_rate: 3.9,
          conversion_rate: 5.98,
          cost_per_engagement: 2.3,
          reach: 5950,
        },
        performance_score: 84,
      },
    ],
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const testType = searchParams.get("test_type");
    const platform = searchParams.get("platform");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    let filteredTests = [...mockContentABTests];

    if (status && status !== "all") {
      filteredTests = filteredTests.filter(test => test.status === status);
    }

    if (testType) {
      filteredTests = filteredTests.filter(test => test.test_type === testType);
    }

    if (platform) {
      filteredTests = filteredTests.filter(test =>
        test.platform.includes(platform)
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTests = filteredTests.slice(startIndex, endIndex);

    const summary = {
      total_tests: filteredTests.length,
      running_tests: filteredTests.filter(t => t.status === "running").length,
      completed_tests: filteredTests.filter(t => t.status === "completed")
        .length,
      paused_tests: filteredTests.filter(t => t.status === "paused").length,
      avg_significance:
        filteredTests.reduce(
          (sum, t) => sum + (t.current_significance || 0),
          0
        ) / filteredTests.length,
    };

    return NextResponse.json({
      success: true,
      data: paginatedTests,
      summary,
      pagination: {
        page,
        limit,
        total: filteredTests.length,
        pages: Math.ceil(filteredTests.length / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching A/B tests:", error);
    return NextResponse.json(
      { error: "Failed to fetch A/B tests" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = ["name", "test_type", "variants"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const newTest = {
      id: `content-ab-${Date.now()}`,
      ...body,
      status: "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockContentABTests.push(newTest);

    return NextResponse.json({
      success: true,
      data: newTest,
      message: "A/B test created successfully",
    });
  } catch (error) {
    console.error("Error creating A/B test:", error);
    return NextResponse.json(
      { error: "Failed to create A/B test" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Test ID is required" },
        { status: 400 }
      );
    }

    const testIndex = mockContentABTests.findIndex(test => test.id === id);
    if (testIndex === -1) {
      return NextResponse.json(
        { error: "A/B test not found" },
        { status: 404 }
      );
    }

    if (action === "start") {
      mockContentABTests[testIndex] = {
        ...mockContentABTests[testIndex],
        status: "running",
        start_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else if (action === "pause") {
      mockContentABTests[testIndex] = {
        ...mockContentABTests[testIndex],
        status: "paused",
        updated_at: new Date().toISOString(),
      };
    } else if (action === "complete") {
      const test = mockContentABTests[testIndex];
      const winnerVariant = test.variants.reduce((prev: any, current: any) =>
        current.performance_score > prev.performance_score ? current : prev
      );

      mockContentABTests[testIndex] = {
        ...mockContentABTests[testIndex],
        status: "completed",
        end_date: new Date().toISOString(),
        winner: winnerVariant.id,
        updated_at: new Date().toISOString(),
      };
    } else {
      mockContentABTests[testIndex] = {
        ...mockContentABTests[testIndex],
        ...updateData,
        updated_at: new Date().toISOString(),
      };
    }

    return NextResponse.json({
      success: true,
      data: mockContentABTests[testIndex],
      message: "A/B test updated successfully",
    });
  } catch (error) {
    console.error("Error updating A/B test:", error);
    return NextResponse.json(
      { error: "Failed to update A/B test" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Test ID is required" },
        { status: 400 }
      );
    }

    const testIndex = mockContentABTests.findIndex(test => test.id === id);
    if (testIndex === -1) {
      return NextResponse.json(
        { error: "A/B test not found" },
        { status: 404 }
      );
    }

    mockContentABTests.splice(testIndex, 1);

    return NextResponse.json({
      success: true,
      message: "A/B test deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting A/B test:", error);
    return NextResponse.json(
      { error: "Failed to delete A/B test" },
      { status: 500 }
    );
  }
}
