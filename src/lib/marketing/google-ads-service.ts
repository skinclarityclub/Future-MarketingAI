import { OAuthService } from "@/lib/oauth/oauth-service";
import { createServerClient } from "@supabase/ssr";

interface GoogleAdsMetrics {
  impressions: number;
  clicks: number;
  cost_micros: number;
  conversions: number;
  conversion_value_micros: number;
  ctr: number;
  average_cpc_micros: number;
  date: string;
}

interface GoogleAdsCampaign {
  campaign_id: string;
  campaign_name: string;
  campaign_status: string;
  metrics: GoogleAdsMetrics;
}

interface GoogleAdsApiResponse {
  results: Array<{
    campaign: {
      id: string;
      name: string;
      status: string;
    };
    metrics: GoogleAdsMetrics;
  }>;
  nextPageToken?: string;
}

export class GoogleAdsService {
  private oauthService: OAuthService;
  private supabase;
  private readonly API_VERSION = "v14";
  private readonly BASE_URL = `https://googleads.googleapis.com/${this.API_VERSION}`;

  constructor() {
    this.oauthService = new OAuthService();
    this.supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            const cookieStore = await import("next/headers").then(m =>
              m.cookies()
            );
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
  }

  /**
   * Fetch campaign performance data from Google Ads API
   */
  async fetchCampaignPerformance(
    userId: string,
    customerId: string,
    startDate: string,
    endDate: string,
    pageSize = 1000
  ): Promise<GoogleAdsCampaign[]> {
    const token = await this.oauthService.getAccessToken(userId, "google_ads");
    if (!token) {
      throw new Error("No valid Google Ads access token found");
    }

    const query = `
      SELECT 
        campaign.id,
        campaign.name,
        campaign.status,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversion_value_micros,
        metrics.ctr,
        metrics.average_cpc,
        segments.date
      FROM campaign 
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
        AND campaign.status != 'REMOVED'
      ORDER BY segments.date DESC
    `;

    const campaigns: GoogleAdsCampaign[] = [];
    let nextPageToken: string | undefined;

    do {
      const response = await this.makeApiRequest(
        token.access_token,
        customerId,
        query,
        pageSize,
        nextPageToken
      );

      const data = response as GoogleAdsApiResponse;

      for (const result of data.results) {
        campaigns.push({
          campaign_id: result.campaign.id,
          campaign_name: result.campaign.name,
          campaign_status: result.campaign.status,
          metrics: result.metrics,
        });
      }

      nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    return campaigns;
  }

  /**
   * Store campaign data in Supabase
   */
  async storeCampaignData(campaigns: GoogleAdsCampaign[]): Promise<void> {
    const records = campaigns.map(campaign => ({
      campaign_name: campaign.campaign_name,
      impressions: campaign.metrics.impressions,
      clicks: campaign.metrics.clicks,
      cost: campaign.metrics.cost_micros / 1_000_000, // Convert micros to currency
      date: campaign.metrics.date,
      created_at: new Date().toISOString(),
    }));

    const { error } = await this.supabase
      .from("google_ads_performance")
      .upsert(records, {
        onConflict: "campaign_name,date",
        ignoreDuplicates: false,
      });

    if (error) {
      throw new Error(`Failed to store Google Ads data: ${error.message}`);
    }
  }

  /**
   * Get list of accessible customer accounts
   */
  async getAccessibleCustomers(userId: string): Promise<string[]> {
    const token = await this.oauthService.getAccessToken(userId, "google_ads");
    if (!token) {
      throw new Error("No valid Google Ads access token found");
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}/customers:listAccessibleCustomers`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token.access_token}`,
            "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get customers: ${response.statusText}`);
      }

      const data = await response.json();
      return (
        data.resourceNames?.map((name: string) =>
          name.replace("customers/", "")
        ) || []
      );
    } catch (error) {
      console.error("Error fetching Google Ads customers:", error);
      throw error;
    }
  }

  /**
   * Sync data for all accessible customers
   */
  async syncAllCustomersData(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] as string[] };

    try {
      const customerIds = await this.getAccessibleCustomers(userId);

      for (const customerId of customerIds) {
        try {
          const campaigns = await this.fetchCampaignPerformance(
            userId,
            customerId,
            startDate,
            endDate
          );

          await this.storeCampaignData(campaigns);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Customer ${customerId}: ${error}`);
          console.error(
            `Failed to sync data for customer ${customerId}:`,
            error
          );
        }
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`Failed to get customers: ${error}`);
    }

    return results;
  }

  /**
   * Make authenticated request to Google Ads API
   */
  private async makeApiRequest(
    accessToken: string,
    customerId: string,
    query: string,
    pageSize = 1000,
    pageToken?: string,
    retryCount = 0
  ): Promise<unknown> {
    const requestBody: Record<string, unknown> = {
      query,
      pageSize,
    };

    if (pageToken) {
      requestBody.pageToken = pageToken;
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}/customers/${customerId}/googleAds:searchStream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429 && retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeApiRequest(
            accessToken,
            customerId,
            query,
            pageSize,
            pageToken,
            retryCount + 1
          );
        }

        const errorText = await response.text();
        throw new Error(
          `Google Ads API error: ${response.status} ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Google Ads API request failed:", error);
      throw error;
    }
  }

  /**
   * Get campaign performance summary
   */
  async getCampaignSummary(
    userId: string,
    customerId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    totalImpressions: number;
    totalClicks: number;
    totalCost: number;
    averageCtr: number;
    campaignCount: number;
  }> {
    const campaigns = await this.fetchCampaignPerformance(
      userId,
      customerId,
      startDate,
      endDate
    );

    const summary = campaigns.reduce(
      (acc, campaign) => {
        acc.totalImpressions += campaign.metrics.impressions;
        acc.totalClicks += campaign.metrics.clicks;
        acc.totalCost += campaign.metrics.cost_micros / 1_000_000;
        return acc;
      },
      {
        totalImpressions: 0,
        totalClicks: 0,
        totalCost: 0,
        averageCtr: 0,
        campaignCount: campaigns.length,
      }
    );

    summary.averageCtr =
      summary.totalImpressions > 0
        ? (summary.totalClicks / summary.totalImpressions) * 100
        : 0;

    return summary;
  }

  /**
   * Check if user has valid Google Ads connection
   */
  async hasValidConnection(userId: string): Promise<boolean> {
    return this.oauthService.hasValidConnection(userId, "google_ads");
  }
}
