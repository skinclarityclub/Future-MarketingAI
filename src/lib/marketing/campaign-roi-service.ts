import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  AttributionModelService,
  AttributionAnalysis,
} from "./attribution-model-service";

export interface CampaignROI {
  campaign_id: string;
  campaign_name: string;
  marketing_channel: string;
  total_spend: number;
  attributed_revenue: number;
  roi: number; // (Revenue - Spend) / Spend * 100
  roas: number; // Revenue / Spend
  conversions: number;
  cost_per_conversion: number;
  attribution_model: string;
  date_range: {
    start_date: string;
    end_date: string;
  };
}

export interface ChannelROI {
  channel: string;
  total_spend: number;
  attributed_revenue: number;
  roi: number;
  roas: number;
  conversions: number;
  cost_per_conversion: number;
  campaigns: CampaignROI[];
}

export interface ROITrend {
  date: string;
  spend: number;
  revenue: number;
  roi: number;
  roas: number;
}

export interface BudgetOptimization {
  campaign_id: string;
  campaign_name: string;
  current_spend: number;
  recommended_spend: number;
  expected_roi_improvement: number;
  confidence_score: number;
  reason: string;
}

export class CampaignROIService {
  private supabase;
  private attributionService: AttributionModelService;

  constructor() {
    this.supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            const cookieStore = await cookies();
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    this.attributionService = new AttributionModelService();
  }

  /**
   * Calculate ROI for all campaigns within a date range
   */
  async calculateCampaignROI(
    startDate: string,
    endDate: string,
    attributionModelId: string = "linear"
  ): Promise<CampaignROI[]> {
    try {
      // Get attribution data for the period
      const attributionData =
        await this.attributionService.getAttributionAnalysis(
          undefined, // conversion_id
          attributionModelId,
          startDate,
          endDate,
          1000 // limit
        );

      // Get campaign spend data
      const campaignSpend = await this.getCampaignSpendData(startDate, endDate);

      // Group by campaign and calculate ROI
      const campaignGroups = this.groupAttributionByCampaign(attributionData);
      const roiResults: CampaignROI[] = [];

      for (const [campaignKey, data] of campaignGroups.entries()) {
        const spend = campaignSpend.get(campaignKey) || 0;
        const revenue = data.reduce(
          (sum, item) => sum + item.attributed_value,
          0
        );
        const conversions = new Set(data.map(item => item.conversion_id)).size;

        const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : 0;
        const roas = spend > 0 ? revenue / spend : 0;
        const costPerConversion = conversions > 0 ? spend / conversions : 0;

        roiResults.push({
          campaign_id: data[0].campaign_name || "unknown",
          campaign_name: data[0].campaign_name || "Unknown Campaign",
          marketing_channel: data[0].marketing_channel,
          total_spend: spend,
          attributed_revenue: revenue,
          roi: roi,
          roas: roas,
          conversions: conversions,
          cost_per_conversion: costPerConversion,
          attribution_model: attributionModelId,
          date_range: {
            start_date: startDate,
            end_date: endDate,
          },
        });
      }

      return roiResults.sort((a, b) => b.roi - a.roi);
    } catch (error) {
      console.error("Error calculating campaign ROI:", error);
      throw new Error(
        `Failed to calculate campaign ROI: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Calculate ROI by marketing channel
   */
  async calculateChannelROI(
    startDate: string,
    endDate: string,
    attributionModelId: string = "linear"
  ): Promise<ChannelROI[]> {
    try {
      const campaignROIs = await this.calculateCampaignROI(
        startDate,
        endDate,
        attributionModelId
      );

      // Group by channel
      const channelGroups = new Map<string, CampaignROI[]>();
      campaignROIs.forEach(campaign => {
        const channel = campaign.marketing_channel;
        if (!channelGroups.has(channel)) {
          channelGroups.set(channel, []);
        }
        channelGroups.get(channel)!.push(campaign);
      });

      // Calculate channel-level ROI
      const channelROIs: ChannelROI[] = [];
      for (const [channel, campaigns] of channelGroups.entries()) {
        const totalSpend = campaigns.reduce((sum, c) => sum + c.total_spend, 0);
        const totalRevenue = campaigns.reduce(
          (sum, c) => sum + c.attributed_revenue,
          0
        );
        const totalConversions = campaigns.reduce(
          (sum, c) => sum + c.conversions,
          0
        );

        const roi =
          totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;
        const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
        const costPerConversion =
          totalConversions > 0 ? totalSpend / totalConversions : 0;

        channelROIs.push({
          channel,
          total_spend: totalSpend,
          attributed_revenue: totalRevenue,
          roi,
          roas,
          conversions: totalConversions,
          cost_per_conversion: costPerConversion,
          campaigns,
        });
      }

      return channelROIs.sort((a, b) => b.roi - a.roi);
    } catch (error) {
      console.error("Error calculating channel ROI:", error);
      throw new Error(
        `Failed to calculate channel ROI: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get ROI trends over time
   */
  async getROITrends(
    startDate: string,
    endDate: string,
    interval: "daily" | "weekly" | "monthly" = "daily",
    attributionModelId: string = "linear"
  ): Promise<ROITrend[]> {
    try {
      const { data, error } = await this.supabase.rpc("get_roi_trends", {
        p_start_date: startDate,
        p_end_date: endDate,
        p_interval: interval,
        p_attribution_model_id: attributionModelId,
      });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return data || [];
    } catch {
      // Fallback to manual calculation if stored procedure doesn't exist
      return this.calculateROITrendsManually(
        startDate,
        endDate,
        interval,
        attributionModelId
      );
    }
  }

  /**
   * Generate budget optimization recommendations
   */
  async getBudgetOptimizationRecommendations(
    startDate: string,
    endDate: string,
    attributionModelId: string = "linear"
  ): Promise<BudgetOptimization[]> {
    try {
      const campaignROIs = await this.calculateCampaignROI(
        startDate,
        endDate,
        attributionModelId
      );
      const recommendations: BudgetOptimization[] = [];

      // Simple recommendation logic based on ROI performance
      campaignROIs.forEach(campaign => {
        let recommendedSpend = campaign.total_spend;
        let expectedImprovement = 0;
        let reason = "";

        if (campaign.roi > 300) {
          // High-performing campaign - increase budget
          recommendedSpend = campaign.total_spend * 1.5;
          expectedImprovement = 25;
          reason = "High ROI campaign with growth potential";
        } else if (campaign.roi > 100) {
          // Good performing campaign - moderate increase
          recommendedSpend = campaign.total_spend * 1.2;
          expectedImprovement = 15;
          reason = "Profitable campaign suitable for scaling";
        } else if (campaign.roi < 0) {
          // Losing money - reduce budget
          recommendedSpend = campaign.total_spend * 0.5;
          expectedImprovement = Math.abs(campaign.roi) * 0.3;
          reason = "Underperforming campaign requiring optimization";
        } else {
          // Break-even or low profit - maintain
          recommendedSpend = campaign.total_spend;
          expectedImprovement = 5;
          reason = "Maintain current spend while optimizing";
        }

        recommendations.push({
          campaign_id: campaign.campaign_id,
          campaign_name: campaign.campaign_name,
          current_spend: campaign.total_spend,
          recommended_spend: recommendedSpend,
          expected_roi_improvement: expectedImprovement,
          confidence_score: this.calculateConfidenceScore(campaign),
          reason,
        });
      });

      return recommendations.sort(
        (a, b) => b.expected_roi_improvement - a.expected_roi_improvement
      );
    } catch (error) {
      console.error("Error generating budget recommendations:", error);
      throw new Error(
        `Failed to generate recommendations: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get campaign spend data from Google Ads and Meta Ads tables
   */
  private async getCampaignSpendData(
    startDate: string,
    endDate: string
  ): Promise<Map<string, number>> {
    const spendMap = new Map<string, number>();

    try {
      // Get Google Ads spend
      const { data: googleData, error: googleError } = await this.supabase
        .from("google_ads_performance")
        .select("campaign_name, cost")
        .gte("date", startDate)
        .lte("date", endDate);

      if (!googleError && googleData) {
        googleData.forEach(row => {
          const key = `google_ads:${row.campaign_name}`;
          spendMap.set(key, (spendMap.get(key) || 0) + (row.cost || 0));
        });
      }

      // Get Meta Ads spend
      const { data: metaData, error: metaError } = await this.supabase
        .from("meta_ads_performance")
        .select("campaign_name, spend")
        .gte("date_start", startDate)
        .lte("date_stop", endDate);

      if (!metaError && metaData) {
        metaData.forEach(row => {
          const key = `meta_ads:${row.campaign_name}`;
          spendMap.set(key, (spendMap.get(key) || 0) + (row.spend || 0));
        });
      }
    } catch (error) {
      console.error("Error fetching campaign spend data:", error);
    }

    return spendMap;
  }

  /**
   * Group attribution data by campaign
   */
  private groupAttributionByCampaign(
    data: AttributionAnalysis[]
  ): Map<string, AttributionAnalysis[]> {
    const groups = new Map<string, AttributionAnalysis[]>();

    data.forEach(item => {
      const key = `${item.marketing_channel}:${item.campaign_name || "unknown"}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    });

    return groups;
  }

  /**
   * Calculate ROI trends manually when stored procedure is not available
   */
  private async calculateROITrendsManually(
    _startDate: string,
    _endDate: string,
    _interval: "daily" | "weekly" | "monthly",
    _attributionModelId: string
  ): Promise<ROITrend[]> {
    // This would implement manual trend calculation
    // For now, return empty array as fallback
    return [];
  }

  /**
   * Calculate confidence score for budget recommendation
   */
  private calculateConfidenceScore(campaign: CampaignROI): number {
    let score = 0.5; // Base confidence

    // More conversions = higher confidence
    if (campaign.conversions > 50) score += 0.3;
    else if (campaign.conversions > 20) score += 0.2;
    else if (campaign.conversions > 10) score += 0.1;

    // Consistent performance = higher confidence
    if (Math.abs(campaign.roi) > 50) score += 0.2;

    return Math.min(1.0, Math.max(0.1, score));
  }
}
