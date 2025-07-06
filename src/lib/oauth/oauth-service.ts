import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  OAuthToken,
  OAuthState,
  InsertOAuthToken,
  InsertOAuthState,
  OAuthProvider,
} from "@/lib/supabase/types";

export class OAuthService {
  private supabase;

  constructor() {
    const cookieStore = cookies();
    this.supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            const cookies = await cookieStore;
            return cookies.get(name)?.value;
          },
        },
      }
    );
  }

  /**
   * Generate a secure state parameter for OAuth flow
   */
  generateState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * Store OAuth state for validation
   */
  async storeOAuthState(
    state: string,
    provider: OAuthProvider,
    userId: string,
    redirectUri?: string
  ): Promise<void> {
    const stateData: InsertOAuthState = {
      state_value: state,
      provider,
      user_id: userId,
      redirect_uri: redirectUri,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    };

    const { error } = await this.supabase
      .from("oauth_states")
      .insert(stateData);

    if (error) {
      throw new Error(`Failed to store OAuth state: ${error.message}`);
    }
  }

  /**
   * Validate OAuth state parameter
   */
  async validateOAuthState(
    state: string,
    provider: OAuthProvider
  ): Promise<OAuthState | null> {
    const { data, error } = await this.supabase
      .from("oauth_states")
      .select("*")
      .eq("state_value", state)
      .eq("provider", provider)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error || !data) {
      return null;
    }

    // Clean up used state
    await this.supabase.from("oauth_states").delete().eq("id", data.id);

    return data;
  }

  /**
   * Store OAuth access token
   */
  async storeAccessToken(
    userId: string,
    provider: OAuthProvider,
    accessToken: string,
    refreshToken?: string,
    expiresIn?: number,
    scope?: string
  ): Promise<void> {
    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : undefined;

    const tokenData: InsertOAuthToken = {
      user_id: userId,
      provider,
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: "Bearer",
      expires_at: expiresAt,
      scope,
    };

    const { error } = await this.supabase
      .from("oauth_tokens")
      .upsert(tokenData, {
        onConflict: "user_id, provider",
      });

    if (error) {
      throw new Error(`Failed to store access token: ${error.message}`);
    }
  }

  /**
   * Get stored access token for a user and provider
   */
  async getAccessToken(
    userId: string,
    provider: OAuthProvider
  ): Promise<OAuthToken | null> {
    const { data, error } = await this.supabase
      .from("oauth_tokens")
      .select("*")
      .eq("user_id", userId)
      .eq("provider", provider)
      .single();

    if (error || !data) {
      return null;
    }

    // Check if token is expired
    if (data.expires_at && new Date(data.expires_at) <= new Date()) {
      // Try to refresh token if refresh token exists
      if (data.refresh_token) {
        return await this.refreshAccessToken(userId, provider);
      }
      // Token expired and no refresh token
      return null;
    }

    return data;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(
    userId: string,
    provider: OAuthProvider
  ): Promise<OAuthToken | null> {
    const token = await this.getAccessToken(userId, provider);
    if (!token?.refresh_token) {
      return null;
    }

    try {
      let refreshUrl: string;
      let refreshData: Record<string, string>;

      if (provider === "google_ads") {
        refreshUrl = "https://oauth2.googleapis.com/token";
        refreshData = {
          client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
          client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
          refresh_token: token.refresh_token,
          grant_type: "refresh_token",
        };
      } else if (provider === "meta_ads") {
        refreshUrl = "https://graph.facebook.com/v18.0/oauth/access_token";
        refreshData = {
          client_id: process.env.META_ADS_CLIENT_ID!,
          client_secret: process.env.META_ADS_CLIENT_SECRET!,
          refresh_token: token.refresh_token,
          grant_type: "refresh_token",
        };
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      const response = await fetch(refreshUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(refreshData),
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.statusText}`);
      }

      const refreshResponse = await response.json();

      // Update token in database
      await this.storeAccessToken(
        userId,
        provider,
        refreshResponse.access_token,
        refreshResponse.refresh_token || token.refresh_token,
        refreshResponse.expires_in,
        token.scope
      );

      return await this.getAccessToken(userId, provider);
    } catch (error) {
      console.error(`Failed to refresh ${provider} token:`, error);
      return null;
    }
  }

  /**
   * Revoke access token
   */
  async revokeAccessToken(
    userId: string,
    provider: OAuthProvider
  ): Promise<void> {
    const token = await this.getAccessToken(userId, provider);
    if (!token) {
      return;
    }

    try {
      let revokeUrl: string;

      if (provider === "google_ads") {
        revokeUrl = `https://oauth2.googleapis.com/revoke?token=${token.access_token}`;
      } else if (provider === "meta_ads") {
        revokeUrl = `https://graph.facebook.com/v18.0/me/permissions?access_token=${token.access_token}`;
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      await fetch(revokeUrl, {
        method: provider === "google_ads" ? "POST" : "DELETE",
      });
    } catch (error) {
      console.error(`Failed to revoke ${provider} token:`, error);
    }

    // Remove token from database
    await this.supabase
      .from("oauth_tokens")
      .delete()
      .eq("user_id", userId)
      .eq("provider", provider);
  }

  /**
   * Clean up expired states
   */
  async cleanupExpiredStates(): Promise<void> {
    await this.supabase
      .from("oauth_states")
      .delete()
      .lt("expires_at", new Date().toISOString());
  }

  /**
   * Get all OAuth connections for a user
   */
  async getUserConnections(userId: string): Promise<OAuthToken[]> {
    const { data, error } = await this.supabase
      .from("oauth_tokens")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to get user connections: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Check if user has valid connection for provider
   */
  async hasValidConnection(
    userId: string,
    provider: OAuthProvider
  ): Promise<boolean> {
    const token = await this.getAccessToken(userId, provider);
    return token !== null;
  }
}
