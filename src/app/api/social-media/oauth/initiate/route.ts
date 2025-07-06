import { NextRequest, NextResponse } from "next/server";

const OAUTH_CONFIGS = {
  facebook: {
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    clientId: process.env.FACEBOOK_APP_ID,
    scopes: "pages_manage_posts,pages_read_engagement,publish_to_groups",
  },
  instagram: {
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    clientId: process.env.FACEBOOK_APP_ID,
    scopes: "instagram_basic,instagram_content_publish,pages_read_engagement",
  },
  linkedin: {
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    clientId: process.env.LINKEDIN_CLIENT_ID,
    scopes: "w_member_social,r_basicprofile,r_organization_social",
  },
  twitter: {
    authUrl: "https://twitter.com/i/oauth2/authorize",
    clientId: process.env.TWITTER_CLIENT_ID,
    scopes: "tweet.read,tweet.write,users.read,offline.access",
  },
};

export async function POST(request: NextRequest) {
  try {
    const { platform, redirectUrl, scopes } = await request.json();

    if (!platform || !OAUTH_CONFIGS[platform as keyof typeof OAUTH_CONFIGS]) {
      return NextResponse.json(
        { success: false, error: "Invalid platform specified" },
        { status: 400 }
      );
    }

    const config = OAUTH_CONFIGS[platform as keyof typeof OAUTH_CONFIGS];

    // Genereer state parameter voor beveiliging
    const state = `skc_${platform}_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    // Bouw OAuth URL
    const params = new URLSearchParams({
      client_id: config.clientId || "",
      redirect_uri: redirectUrl,
      scope: scopes?.join(",") || config.scopes,
      response_type: "code",
      state: state,
    });

    const authUrl = `${config.authUrl}?${params.toString()}`;

    // In echte implementatie zou je de state opslaan in database/session
    console.log(`🔗 Generated OAuth URL for ${platform}:`, authUrl);
    console.log(`🔒 State token: ${state}`);

    return NextResponse.json({
      success: true,
      authUrl: authUrl,
      state: state,
      platform: platform,
    });
  } catch (error) {
    console.error("❌ OAuth initiation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initiate OAuth flow",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
