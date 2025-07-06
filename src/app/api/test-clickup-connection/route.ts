import { NextRequest, NextResponse } from "next/server";
import { credentialsDatabaseService } from "@/lib/command-center/credentials-database-service";

export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Testing ClickUp connection...");

    // Get ClickUp credentials from database
    const clickupProvider =
      await credentialsDatabaseService.getProvider("clickup");
    if (!clickupProvider) {
      return NextResponse.json(
        {
          success: false,
          error: "ClickUp provider not found",
        },
        { status: 404 }
      );
    }

    // Find access token
    const accessTokenCred = clickupProvider.credentials.find(
      c => c.id === "clickup_access_token"
    );
    if (!accessTokenCred || !accessTokenCred.value) {
      return NextResponse.json(
        {
          success: false,
          error: "ClickUp access token not configured",
          details: "Please complete OAuth flow first",
        },
        { status: 400 }
      );
    }

    const accessToken = accessTokenCred.value;
    console.log("🔑 Found access token:", accessToken.substring(0, 20) + "...");

    // Test 1: Get user info
    console.log("📱 Testing: Get user info...");
    const userResponse = await fetch("https://api.clickup.com/api/v2/user", {
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      return NextResponse.json(
        {
          success: false,
          error: "Failed to connect to ClickUp API",
          details: {
            status: userResponse.status,
            statusText: userResponse.statusText,
            response: errorText,
          },
        },
        { status: 400 }
      );
    }

    const userData = await userResponse.json();
    console.log("✅ User data received:", userData.user?.username);

    // Test 2: Get teams
    console.log("👥 Testing: Get teams...");
    const teamsResponse = await fetch("https://api.clickup.com/api/v2/team", {
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
    });

    const teamsData = teamsResponse.ok ? await teamsResponse.json() : null;
    console.log("📊 Teams data:", teamsData?.teams?.length || 0, "teams found");

    // Test 3: Get spaces for first team (if available)
    let spacesData = null;
    if (teamsData?.teams?.length > 0) {
      const firstTeamId = teamsData.teams[0].id;
      console.log("🏢 Testing: Get spaces for team", firstTeamId);

      const spacesResponse = await fetch(
        `https://api.clickup.com/api/v2/team/${firstTeamId}/space`,
        {
          headers: {
            Authorization: accessToken,
            "Content-Type": "application/json",
          },
        }
      );

      spacesData = spacesResponse.ok ? await spacesResponse.json() : null;
      console.log(
        "📁 Spaces data:",
        spacesData?.spaces?.length || 0,
        "spaces found"
      );
    }

    // Return comprehensive test results
    return NextResponse.json({
      success: true,
      message: "ClickUp connection test successful! 🎉",
      data: {
        connectionStatus: "active",
        user: {
          id: userData.user?.id,
          username: userData.user?.username,
          email: userData.user?.email,
          profile_picture: userData.user?.profile_picture,
        },
        teams: {
          count: teamsData?.teams?.length || 0,
          teams:
            teamsData?.teams?.map((team: any) => ({
              id: team.id,
              name: team.name,
              color: team.color,
            })) || [],
        },
        spaces: {
          count: spacesData?.spaces?.length || 0,
          spaces:
            spacesData?.spaces
              ?.map((space: any) => ({
                id: space.id,
                name: space.name,
                color: space.color,
                private: space.private,
              }))
              ?.slice(0, 5) || [], // Limit to first 5 spaces
        },
        apiInfo: {
          baseUrl: "https://api.clickup.com/api/v2",
          tokenPrefix: accessToken.substring(0, 15) + "...",
          lastTested: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("❌ ClickUp connection test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Connection test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
