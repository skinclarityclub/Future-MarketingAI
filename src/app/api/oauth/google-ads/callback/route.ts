import { NextRequest, NextResponse } from "next/server";
import { OAuthService } from "@/lib/oauth/oauth-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.json(
        { error: `OAuth error: ${error}` },
        { status: 400 }
      );
    }

    if (!code || !state) {
      return NextResponse.json(
        { error: "Missing code or state parameter" },
        { status: 400 }
      );
    }

    const oauthService = new OAuthService();

    // Validate state parameter
    const stateData = await oauthService.validateOAuthState(
      state,
      "google_ads"
    );
    if (!stateData) {
      return NextResponse.json(
        { error: "Invalid or expired state parameter" },
        { status: 400 }
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/google-ads/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      return NextResponse.json(
        {
          error: `Token exchange failed: ${errorData.error_description || errorData.error}`,
        },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();

    // Store the access token
    await oauthService.storeAccessToken(
      stateData.user_id,
      "google_ads",
      tokenData.access_token,
      tokenData.refresh_token,
      tokenData.expires_in,
      tokenData.scope
    );

    // Redirect to success page or back to the application
    const redirectUrl =
      stateData.redirect_uri ||
      `${process.env.NEXT_PUBLIC_BASE_URL}/marketing-optimization?connected=google_ads`;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Google Ads OAuth callback error:", error);
    return NextResponse.json(
      { error: "Failed to complete Google Ads OAuth" },
      { status: 500 }
    );
  }
}
