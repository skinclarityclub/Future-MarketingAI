import { NextRequest, NextResponse } from "next/server";
import { OAuthService } from "@/lib/oauth/oauth-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id") || "demo-user";
    const redirectUri =
      searchParams.get("redirect_uri") ||
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/google-ads/callback`;

    const oauthService = new OAuthService();
    const state = oauthService.generateState();

    // Store state for validation
    await oauthService.storeOAuthState(
      state,
      "google_ads",
      userId,
      redirectUri
    );

    // Google Ads OAuth URL
    const googleAdsOAuthUrl = new URL(
      "https://accounts.google.com/o/oauth2/v2/auth"
    );
    googleAdsOAuthUrl.searchParams.set(
      "client_id",
      process.env.GOOGLE_ADS_CLIENT_ID!
    );
    googleAdsOAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAdsOAuthUrl.searchParams.set("response_type", "code");
    googleAdsOAuthUrl.searchParams.set(
      "scope",
      "https://www.googleapis.com/auth/adwords"
    );
    googleAdsOAuthUrl.searchParams.set("state", state);
    googleAdsOAuthUrl.searchParams.set("access_type", "offline");
    googleAdsOAuthUrl.searchParams.set("prompt", "consent");

    return NextResponse.redirect(googleAdsOAuthUrl.toString());
  } catch (error) {
    console.error("Google Ads OAuth initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Google Ads OAuth" },
      { status: 500 }
    );
  }
}
