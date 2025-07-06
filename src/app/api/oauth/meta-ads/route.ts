import { NextRequest, NextResponse } from "next/server";
import { OAuthService } from "@/lib/oauth/oauth-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id") || "demo-user";
    const redirectUri =
      searchParams.get("redirect_uri") ||
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/meta-ads/callback`;

    const oauthService = new OAuthService();
    const state = oauthService.generateState();

    // Store state for validation
    await oauthService.storeOAuthState(state, "meta_ads", userId, redirectUri);

    // Meta (Facebook) Ads OAuth URL
    const metaAdsOAuthUrl = new URL(
      "https://www.facebook.com/v18.0/dialog/oauth"
    );
    metaAdsOAuthUrl.searchParams.set(
      "client_id",
      process.env.META_ADS_CLIENT_ID!
    );
    metaAdsOAuthUrl.searchParams.set("redirect_uri", redirectUri);
    metaAdsOAuthUrl.searchParams.set("response_type", "code");
    metaAdsOAuthUrl.searchParams.set(
      "scope",
      "ads_management,ads_read,read_insights"
    );
    metaAdsOAuthUrl.searchParams.set("state", state);

    return NextResponse.redirect(metaAdsOAuthUrl.toString());
  } catch (error) {
    console.error("Meta Ads OAuth initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Meta Ads OAuth" },
      { status: 500 }
    );
  }
}
