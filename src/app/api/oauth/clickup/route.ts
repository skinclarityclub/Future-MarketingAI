import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id") || "demo-user";

    // Get the base URL from the request
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    // Get ClickUp credentials from database via API
    const credentialsResponse = await fetch(
      `${baseUrl}/api/command-center/credentials?action=provider&providerId=clickup`,
      {
        method: "GET",
      }
    );

    if (!credentialsResponse.ok) {
      return NextResponse.json(
        { error: "ClickUp credentials not configured in settings" },
        { status: 400 }
      );
    }

    const credentialsData = await credentialsResponse.json();
    const provider = credentialsData.data;

    if (!provider) {
      return NextResponse.json(
        { error: "ClickUp provider not found" },
        { status: 400 }
      );
    }

    // Extract client_id from provider credentials
    const clientIdCredential = provider.credentials.find(
      (c: any) => c.id === "clickup_client_id"
    );

    console.log("ClickUp OAuth initiation:", {
      providerFound: !!provider,
      credentialsCount: provider.credentials?.length || 0,
      clientIdFound: !!clientIdCredential,
      clientIdValue: clientIdCredential?.value ? "present" : "missing",
    });

    if (!clientIdCredential?.value) {
      return NextResponse.json(
        { error: "Please configure Client ID in settings first" },
        { status: 400 }
      );
    }

    // Generate a random state for security
    const state =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    // Store state temporarily (in production, use Redis or database)
    // For now we'll just pass it through and verify in callback

    const redirectUri = `${baseUrl}/api/oauth/clickup/callback`;

    // ClickUp OAuth URL using user-provided Client ID
    const clickupOAuthUrl = new URL("https://app.clickup.com/api");
    clickupOAuthUrl.searchParams.set("client_id", clientIdCredential.value);
    clickupOAuthUrl.searchParams.set("redirect_uri", redirectUri);
    clickupOAuthUrl.searchParams.set("state", state);

    console.log("ClickUp OAuth initiation:", {
      client_id: process.env.CLICKUP_CLIENT_ID,
      redirect_uri: redirectUri,
      state,
      oauth_url: clickupOAuthUrl.toString(),
    });

    return NextResponse.redirect(clickupOAuthUrl.toString());
  } catch (error) {
    console.error("ClickUp OAuth initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate ClickUp OAuth" },
      { status: 500 }
    );
  }
}
