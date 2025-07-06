import { NextRequest, NextResponse } from "next/server";
import { OAuthService } from "@/lib/oauth/oauth-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      return NextResponse.json(
        { error: `OAuth error: ${errorDescription || error}` },
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
    const stateData = await oauthService.validateOAuthState(state, "meta_ads");
    if (!stateData) {
      return NextResponse.json(
        { error: "Invalid or expired state parameter" },
        { status: 400 }
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch(
      "https://graph.facebook.com/v18.0/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.META_ADS_CLIENT_ID!,
          client_secret: process.env.META_ADS_CLIENT_SECRET!,
          code,
          redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/meta-ads/callback`,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      return NextResponse.json(
        {
          error: `Token exchange failed: ${errorData.error?.message || errorData.error}`,
        },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();

    // Get long-lived access token
    const longLivedTokenResponse = await fetch(
      "https://graph.facebook.com/v18.0/oauth/access_token",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const longLivedTokenUrl = new URL(
      "https://graph.facebook.com/v18.0/oauth/access_token"
    );
    longLivedTokenUrl.searchParams.set("grant_type", "fb_exchange_token");
    longLivedTokenUrl.searchParams.set(
      "client_id",
      process.env.META_ADS_CLIENT_ID!
    );
    longLivedTokenUrl.searchParams.set(
      "client_secret",
      process.env.META_ADS_CLIENT_SECRET!
    );
    longLivedTokenUrl.searchParams.set(
      "fb_exchange_token",
      tokenData.access_token
    );

    const longLivedResponse = await fetch(longLivedTokenUrl.toString());
    const longLivedData = await longLivedResponse.json();

    const finalAccessToken =
      longLivedData.access_token || tokenData.access_token;
    const expiresIn = longLivedData.expires_in || tokenData.expires_in;

    // Store the access token
    await oauthService.storeAccessToken(
      stateData.user_id,
      "meta_ads",
      finalAccessToken,
      undefined, // Meta doesn't provide refresh tokens
      expiresIn,
      "ads_management,ads_read,read_insights"
    );

    // Redirect to success page or back to the application
    const redirectUrl =
      stateData.redirect_uri ||
      `${process.env.NEXT_PUBLIC_BASE_URL}/marketing-optimization?connected=meta_ads`;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Meta Ads OAuth callback error:", error);
    return NextResponse.json(
      { error: "Failed to complete Meta Ads OAuth" },
      { status: 500 }
    );
  }
}
