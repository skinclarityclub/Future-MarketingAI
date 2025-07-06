import { OAuthService } from "@/lib/oauth/oauth-service";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

interface MetaAdsInsights {
  impressions: string;
  clicks: string;
  spend: string;
  reach: string;
  frequency: string;
  ctr: string;
  cpc: string;
  cpm: string;
  date_start: string;
  date_stop: string;
}

interface MetaAdsCampaign {
  id: string;
  name: string;
  status: string;
  insights?: {
    data: MetaAdsInsights[];
  };
}

interface MetaAdsAccount {
  id: string;
  name: string;
  account_status: number;
  currency: string;
}

export class MetaAdsService {
  private oauthService: OAuthService;
  private supabase;
  private readonly API_VERSION = "v18.0";
  private readonly BASE_URL = `https://graph.facebook.com/${this.API_VERSION}`;

  constructor() {
    this.oauthService = new OAuthService();
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
   * Get accessible ad accounts
   */
  async getAdAccounts(userId: string): Promise<MetaAdsAccount[]> {
    const token = await this.oauthService.getAccessToken(userId, "meta_ads");
    if (!token) {
      throw new Error("No valid Meta Ads access token found");
    }

    try {
      const response = await this.makeApiRequest(`/me/adaccounts`, {
        access_token: token.access_token,
        fields: "id,name,account_status,currency",
      });

      return response.data || [];
    } catch (error) {
      console.error("Error fetching Meta ad accounts:", error);
      throw error;
    }
  }

  /**
   * Fetch campaign data with insights
   */
  async fetchCampaignPerformance(
    userId: string,
    adAccountId: string,
    startDate: string,
    endDate: string,
    limit = 100
  ): Promise<MetaAdsCampaign[]> {
    const token = await this.oauthService.getAccessToken(userId, "meta_ads");
    if (!token) {
      throw new Error("No valid Meta Ads access token found");
    }

    try {
      // First, get campaigns
      const campaignsResponse = await this.makeApiRequest(
        `/${adAccountId}/campaigns`,
        {
          access_token: token.access_token,
          fields: "id,name,status",
          limit: limit.toString(),
        }
      );

      const campaigns = campaignsResponse.data || [];

      // Then, fetch insights for each campaign
      const campaignsWithInsights: MetaAdsCampaign[] = [];

      for (const campaign of campaigns) {
        try {
          const insights = await this.fetchCampaignInsights(
            token.access_token,
            campaign.id,
            startDate,
            endDate
          );

          campaignsWithInsights.push({
            ...campaign,
            insights: { data: insights },
          });
        } catch (error) {
          console.warn(
            `Failed to fetch insights for campaign ${campaign.id}:`,
            error
          );
          campaignsWithInsights.push(campaign);
        }
      }

      return campaignsWithInsights;
    } catch (error) {
      console.error("Error fetching Meta campaign performance:", error);
      throw error;
    }
  }

  /**
   * Fetch insights for a specific campaign
   */
  private async fetchCampaignInsights(
    accessToken: string,
    campaignId: string,
    startDate: string,
    endDate: string
  ): Promise<MetaAdsInsights[]> {
    const response = await this.makeApiRequest(`/${campaignId}/insights`, {
      access_token: accessToken,
      fields: "impressions,clicks,spend,reach,frequency,ctr,cpc,cpm",
      time_range: JSON.stringify({
        since: startDate,
        until: endDate,
      }),
      time_increment: "1",
      level: "campaign",
    });

    return response.data || [];
  }

  /**
   * Store campaign data in Supabase
   */
  async storeCampaignData(campaigns: MetaAdsCampaign[]): Promise<void> {
    const records: Array<{
      campaign_name: string;
      impressions: number;
      clicks: number;
      spend: number;
      date: string;
      created_at: string;
    }> = [];

    for (const campaign of campaigns) {
      if (campaign.insights?.data) {
        for (const insight of campaign.insights.data) {
          records.push({
            campaign_name: campaign.name,
            impressions: parseInt(insight.impressions) || 0,
            clicks: parseInt(insight.clicks) || 0,
            spend: parseFloat(insight.spend) || 0,
            date: insight.date_start,
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    if (records.length === 0) {
      console.log("No Meta Ads data to store");
      return;
    }

    const { error } = await this.supabase
      .from("meta_ads_performance")
      .upsert(records, {
        onConflict: "campaign_name,date",
        ignoreDuplicates: false,
      });

    if (error) {
      throw new Error(`Failed to store Meta Ads data: ${error.message}`);
    }
  }

  /**
   * Sync data for all accessible ad accounts
   */
  async syncAllAccountsData(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] as string[] };

    try {
      const adAccounts = await this.getAdAccounts(userId);

      for (const account of adAccounts) {
        // Only sync active accounts
        if (account.account_status !== 1) {
          continue;
        }

        try {
          const campaigns = await this.fetchCampaignPerformance(
            userId,
            account.id,
            startDate,
            endDate
          );

          await this.storeCampaignData(campaigns);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Account ${account.id}: ${error}`);
          console.error(
            `Failed to sync data for account ${account.id}:`,
            error
          );
        }
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`Failed to get ad accounts: ${error}`);
    }

    return results;
  }

  /**
   * Get campaign performance summary
   */
  async getCampaignSummary(
    userId: string,
    adAccountId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    totalImpressions: number;
    totalClicks: number;
    totalSpend: number;
    averageCtr: number;
    campaignCount: number;
  }> {
    const campaigns = await this.fetchCampaignPerformance(
      userId,
      adAccountId,
      startDate,
      endDate
    );

    const summary = {
      totalImpressions: 0,
      totalClicks: 0,
      totalSpend: 0,
      averageCtr: 0,
      campaignCount: campaigns.length,
    };

    for (const campaign of campaigns) {
      if (campaign.insights?.data) {
        for (const insight of campaign.insights.data) {
          summary.totalImpressions += parseInt(insight.impressions) || 0;
          summary.totalClicks += parseInt(insight.clicks) || 0;
          summary.totalSpend += parseFloat(insight.spend) || 0;
        }
      }
    }

    summary.averageCtr =
      summary.totalImpressions > 0
        ? (summary.totalClicks / summary.totalImpressions) * 100
        : 0;

    return summary;
  }

  /**
   * Make authenticated request to Meta API
   */
  private async makeApiRequest(
    endpoint: string,
    params: Record<string, string>,
    retryCount = 0
  ): Promise<any> {
    const url = new URL(`${this.BASE_URL}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429 && retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeApiRequest(endpoint, params, retryCount + 1);
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Meta API error: ${response.status} ${errorData.error?.message || response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Meta API request failed:", error);
      throw error;
    }
  }

  /**
   * Check if user has valid Meta Ads connection
   */
  async hasValidConnection(userId: string): Promise<boolean> {
    return this.oauthService.hasValidConnection(userId, "meta_ads");
  }

  /**
   * Test API connection
   */
  async testConnection(userId: string): Promise<boolean> {
    try {
      const accounts = await this.getAdAccounts(userId);
      return accounts.length > 0;
    } catch (error) {
      console.error("Meta Ads connection test failed:", error);
      return false;
    }
  }
}
