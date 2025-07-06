import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, credentials } = body;

    if (!platform || !credentials) {
      return NextResponse.json(
        { success: false, message: "Platform and credentials are required" },
        { status: 400 }
      );
    }

    // Mock configuration for now
    return NextResponse.json({
      success: true,
      message: `${platform} configured successfully`,
      platform: platform,
      accountInfo: {
        id: "mock_account_id",
        name: "Mock Account Name",
        username: `@mock_${platform}`,
        verified: true,
      },
    });
  } catch (error) {
    console.error("Social media configuration error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Mock data for now
    const mockStatuses = [
      {
        platform: "instagram",
        isConfigured: true,
        status: "connected",
        lastValidated: new Date(),
        credentials: {},
        accountInfo: {
          id: "123456789",
          name: "SKC Business",
          username: "@skcbusiness",
          verified: true,
        },
      },
      {
        platform: "facebook",
        isConfigured: true,
        status: "connected",
        lastValidated: new Date(),
        credentials: {},
        accountInfo: {
          id: "987654321",
          name: "SKC Company Page",
          verified: true,
        },
      },
      {
        platform: "linkedin",
        isConfigured: false,
        status: "disconnected",
        credentials: {},
      },
      {
        platform: "twitter",
        isConfigured: true,
        status: "error",
        lastValidated: new Date(),
        credentials: {},
      },
      {
        platform: "tiktok",
        isConfigured: false,
        status: "disconnected",
        credentials: {},
      },
      {
        platform: "youtube",
        isConfigured: false,
        status: "disconnected",
        credentials: {},
      },
    ];

    const setupProgress = {
      configured: 3,
      total: 6,
      percentage: 50,
      missing: ["linkedin", "tiktok", "youtube"],
    };

    return NextResponse.json({
      success: true,
      data: {
        statuses: mockStatuses,
        setupProgress,
        connectedPlatforms: ["instagram", "facebook"],
        supportedPlatforms: [
          "instagram",
          "facebook",
          "linkedin",
          "twitter",
          "tiktok",
          "youtube",
        ],
      },
    });
  } catch (error) {
    console.error("Failed to get social media status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get platform statuses",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "health-check") {
      // Mock health check
      return NextResponse.json({
        success: true,
        message: "Health check completed",
        data: {
          healthStatus: {
            instagram: true,
            facebook: true,
            linkedin: false,
            twitter: false,
            tiktok: false,
            youtube: false,
          },
        },
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Social media operation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Operation failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
