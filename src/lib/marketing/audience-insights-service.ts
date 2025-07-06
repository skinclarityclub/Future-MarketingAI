import { createClient } from "@/lib/supabase/client";

// Types for audience insights
export interface AudienceSegment {
  id: string;
  segment_name: string;
  segment_description?: string;
  segment_criteria: Record<string, any>;
  segment_type:
    | "demographic"
    | "behavioral"
    | "geographic"
    | "psychographic"
    | "custom";
  total_customers: number;
  avg_clv: number;
  avg_conversion_rate: number;
  primary_channel?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface AudiencePerformance {
  id: string;
  segment_id: string;
  date_period: string;
  period_type: "daily" | "weekly" | "monthly";
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  total_spend: number;
  total_revenue: number;
  click_through_rate: number;
  conversion_rate: number;
  cost_per_click: number;
  cost_per_conversion: number;
  return_on_ad_spend: number;
  created_at: string;
}

export interface PerformancePrediction {
  id: string;
  prediction_type: "roi" | "conversions" | "revenue" | "cpa" | "roas";
  target_entity_type: "campaign" | "channel" | "audience_segment";
  target_entity_id: string;
  prediction_date: string;
  predicted_value: number;
  confidence_score: number;
  model_version: string;
  input_features?: Record<string, any>;
  created_at: string;
  expires_at?: string;
}

export interface BudgetScenario {
  id: string;
  scenario_name: string;
  scenario_description?: string;
  base_period_start: string;
  base_period_end: string;
  scenario_period_start: string;
  scenario_period_end: string;
  total_budget: number;
  budget_allocations: Record<string, number>;
  predicted_outcomes?: Record<string, any>;
  confidence_score?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface SeasonalTrend {
  id: string;
  trend_name: string;
  industry?: string;
  channel?: string;
  month_of_year?: number;
  week_of_year?: number;
  day_of_week?: number;
  hour_of_day?: number;
  performance_multiplier: number;
  confidence_level: number;
  historical_data_points: number;
  created_at: string;
  updated_at: string;
}

export interface ABTestRecommendation {
  id: string;
  test_name: string;
  test_type: "ad_copy" | "audience" | "bidding" | "creative" | "landing_page";
  campaign_id?: string;
  current_performance: Record<string, any>;
  recommended_variant: Record<string, any>;
  expected_improvement?: number;
  test_duration_days: number;
  minimum_sample_size?: number;
  priority_score: number;
  status: "pending" | "running" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface BudgetRecommendation {
  channel: string;
  current_allocation: number;
  recommended_allocation: number;
  expected_roi_improvement: number;
  reasoning: string;
}

export interface AudienceInsight {
  segment: AudienceSegment;
  performance: AudiencePerformance[];
  clv: number;
  growth_trend: number;
  top_channels: string[];
  recommendations: string[];
}

export interface AudiencePerformanceMetrics {
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  total_spend: number;
  total_revenue: number;
  click_through_rate: number;
  conversion_rate: number;
  cost_per_click: number;
  cost_per_conversion: number;
  return_on_ad_spend: number;
}

export interface CampaignOptimization {
  id: string;
  campaign_id: string;
  optimization_type: string;
  recommended_action: string;
  expected_improvement: number;
  priority: "low" | "medium" | "high";
  created_at: string;
}

export class AudienceInsightsService {
  private supabase = createClient();

  // Audience Segments Management
  async getAudienceSegments(filters?: {
    segment_type?: string;
    is_active?: boolean;
  }): Promise<AudienceSegment[]> {
    try {
      let query = this.supabase
        .from("audience_segments")
        .select("*")
        .order("avg_clv", { ascending: false });

      if (filters?.segment_type) {
        query = query.eq("segment_type", filters.segment_type);
      }
      if (filters?.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching audience segments:", error);
      throw error;
    }
  }

  async createAudienceSegment(
    segment: Omit<AudienceSegment, "id" | "created_at" | "updated_at">
  ): Promise<AudienceSegment> {
    try {
      const { data, error } = await this.supabase
        .from("audience_segments")
        .insert([segment])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating audience segment:", error);
      throw error;
    }
  }

  // Performance Analytics
  async getAudiencePerformance(
    segmentId: string,
    dateRange: {
      start: string;
      end: string;
    }
  ): Promise<AudiencePerformance[]> {
    try {
      const { data, error } = await this.supabase
        .from("audience_performance")
        .select("*")
        .eq("segment_id", segmentId)
        .gte("date_period", dateRange.start)
        .lte("date_period", dateRange.end)
        .order("date_period", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching audience performance:", error);
      throw error;
    }
  }

  async getTopPerformingSegments(
    limit: number = 10,
    dateRange?: {
      start: string;
      end: string;
    }
  ): Promise<any[]> {
    try {
      const startDate =
        dateRange?.start ||
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
      const endDate = dateRange?.end || new Date().toISOString().split("T")[0];

      const { data, error } = await this.supabase.rpc(
        "get_top_performing_segments",
        {
          p_limit: limit,
          p_start_date: startDate,
          p_end_date: endDate,
        }
      );

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching top performing segments:", error);
      throw error;
    }
  }

  // Budget Optimization
  async getBudgetRecommendations(
    totalBudget: number,
    dateRange: {
      start: string;
      end: string;
    }
  ): Promise<BudgetRecommendation[]> {
    try {
      const { data, error } = await this.supabase.rpc(
        "generate_budget_recommendations",
        {
          p_total_budget: totalBudget,
          p_start_date: dateRange.start,
          p_end_date: dateRange.end,
        }
      );

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error generating budget recommendations:", error);
      throw error;
    }
  }

  async createBudgetScenario(
    scenario: Omit<BudgetScenario, "id" | "created_at" | "updated_at">
  ): Promise<BudgetScenario> {
    try {
      const { data, error } = await this.supabase
        .from("budget_scenarios")
        .insert([scenario])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating budget scenario:", error);
      throw error;
    }
  }

  async getBudgetScenarios(filters?: {
    is_active?: boolean;
    created_by?: string;
  }): Promise<BudgetScenario[]> {
    try {
      let query = this.supabase
        .from("budget_scenarios")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      }
      if (filters?.created_by) {
        query = query.eq("created_by", filters.created_by);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching budget scenarios:", error);
      throw error;
    }
  }

  // Predictive Analytics
  async createPerformancePrediction(
    prediction: Omit<PerformancePrediction, "id" | "created_at">
  ): Promise<PerformancePrediction> {
    try {
      const { data, error } = await this.supabase
        .from("performance_predictions")
        .insert([prediction])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating performance prediction:", error);
      throw error;
    }
  }

  async getPerformancePredictions(filters: {
    target_entity_type?: string;
    target_entity_id?: string;
    prediction_type?: string;
    date_range?: { start: string; end: string };
  }): Promise<PerformancePrediction[]> {
    try {
      let query = this.supabase
        .from("performance_predictions")
        .select("*")
        .order("prediction_date", { ascending: true });

      if (filters.target_entity_type) {
        query = query.eq("target_entity_type", filters.target_entity_type);
      }
      if (filters.target_entity_id) {
        query = query.eq("target_entity_id", filters.target_entity_id);
      }
      if (filters.prediction_type) {
        query = query.eq("prediction_type", filters.prediction_type);
      }
      if (filters.date_range) {
        query = query
          .gte("prediction_date", filters.date_range.start)
          .lte("prediction_date", filters.date_range.end);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching performance predictions:", error);
      throw error;
    }
  }

  // Seasonal Trends
  async getSeasonalTrends(filters?: {
    industry?: string;
    channel?: string;
    month?: number;
  }): Promise<SeasonalTrend[]> {
    try {
      let query = this.supabase
        .from("seasonal_trends")
        .select("*")
        .order("performance_multiplier", { ascending: false });

      if (filters?.industry) {
        query = query.eq("industry", filters.industry);
      }
      if (filters?.channel) {
        query = query.eq("channel", filters.channel);
      }
      if (filters?.month) {
        query = query.eq("month_of_year", filters.month);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching seasonal trends:", error);
      throw error;
    }
  }

  // A/B Testing Recommendations
  async getABTestRecommendations(filters?: {
    status?: string;
    test_type?: string;
    campaign_id?: string;
  }): Promise<ABTestRecommendation[]> {
    try {
      let query = this.supabase
        .from("ab_test_recommendations")
        .select("*")
        .order("priority_score", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.test_type) {
        query = query.eq("test_type", filters.test_type);
      }
      if (filters?.campaign_id) {
        query = query.eq("campaign_id", filters.campaign_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching A/B test recommendations:", error);
      throw error;
    }
  }

  async createABTestRecommendation(
    recommendation: Omit<
      ABTestRecommendation,
      "id" | "created_at" | "updated_at"
    >
  ): Promise<ABTestRecommendation> {
    try {
      const { data, error } = await this.supabase
        .from("ab_test_recommendations")
        .insert([recommendation])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating A/B test recommendation:", error);
      throw error;
    }
  }

  // Comprehensive Audience Insights
  async getComprehensiveAudienceInsights(
    segmentId?: string
  ): Promise<AudienceInsight[]> {
    try {
      const segments = segmentId
        ? [
            await this.getAudienceSegments({ is_active: true }).then(segments =>
              segments.find(s => s.id === segmentId)
            ),
          ]
        : await this.getAudienceSegments({ is_active: true });

      const insights: AudienceInsight[] = [];

      for (const segment of segments.filter(Boolean)) {
        const dateRange = {
          start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          end: new Date().toISOString().split("T")[0],
        };

        const performance = await this.getAudiencePerformance(
          segment!.id,
          dateRange
        );
        const clv = await this.calculateSegmentCLV(segment!.id, dateRange);

        // Calculate growth trend (simplified)
        const growthTrend = this.calculateGrowthTrend(performance);

        // Get top channels
        const topChannels = this.getTopChannelsForSegment(performance);

        // Generate recommendations
        const recommendations = this.generateSegmentRecommendations(
          segment!,
          performance
        );

        insights.push({
          segment: segment!,
          performance,
          clv,
          growth_trend: growthTrend,
          top_channels: topChannels,
          recommendations,
        });
      }

      return insights;
    } catch (error) {
      console.error("Error getting comprehensive audience insights:", error);
      throw error;
    }
  }

  // Helper methods
  private async calculateSegmentCLV(
    segmentId: string,
    dateRange: { start: string; end: string }
  ): Promise<number> {
    try {
      const { data, error } = await this.supabase.rpc("calculate_segment_clv", {
        p_segment_id: segmentId,
        p_start_date: dateRange.start,
        p_end_date: dateRange.end,
      });

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error("Error calculating segment CLV:", error);
      return 0;
    }
  }

  private calculateGrowthTrend(performance: AudiencePerformance[]): number {
    if (performance.length < 2) return 0;

    const recent = performance.slice(-7); // Last 7 periods
    const older = performance.slice(-14, -7); // Previous 7 periods

    const recentAvg =
      recent.reduce((sum, p) => sum + p.total_revenue, 0) / recent.length;
    const olderAvg =
      older.reduce((sum, p) => sum + p.total_revenue, 0) / older.length;

    return olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
  }

  private getTopChannelsForSegment(
    performance: AudiencePerformance[]
  ): string[] {
    // This would typically analyze which channels perform best for this segment
    // For now, return a simplified version
    return ["google_ads", "meta_ads", "email"].slice(0, 3);
  }

  private generateSegmentRecommendations(
    segment: AudienceSegment,
    performance: AudiencePerformance[]
  ): string[] {
    const recommendations: string[] = [];

    const avgROAS =
      performance.reduce((sum, p) => sum + p.return_on_ad_spend, 0) /
      performance.length;
    const avgCTR =
      performance.reduce((sum, p) => sum + p.click_through_rate, 0) /
      performance.length;

    if (avgROAS < 2.0) {
      recommendations.push("Consider optimizing ad creative for better ROAS");
    }
    if (avgCTR < 0.02) {
      recommendations.push("Improve targeting to increase click-through rates");
    }
    if (segment.avg_clv > 500) {
      recommendations.push(
        "Focus on retention campaigns for this high-value segment"
      );
    }

    return recommendations;
  }

  // Data Sync Methods
  async syncAudienceData(): Promise<void> {
    try {
      // This would sync data from various sources (Google Ads, Meta Ads, etc.)
      // For now, this is a placeholder for the sync logic
      console.log("Syncing audience data from external sources...");

      // Update segment metrics
      await this.updateSegmentMetrics();

      console.log("Audience data sync completed");
    } catch (error) {
      console.error("Error syncing audience data:", error);
      throw error;
    }
  }

  private async updateSegmentMetrics(): Promise<void> {
    try {
      const segments = await this.getAudienceSegments({ is_active: true });

      for (const segment of segments) {
        const dateRange = {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          end: new Date().toISOString().split("T")[0],
        };

        const performance = await this.getAudiencePerformance(
          segment.id,
          dateRange
        );
        const avgConversionRate =
          performance.length > 0
            ? performance.reduce((sum, p) => sum + p.conversion_rate, 0) /
              performance.length
            : 0;
        const clv = await this.calculateSegmentCLV(segment.id, dateRange);

        await this.supabase
          .from("audience_segments")
          .update({
            avg_conversion_rate: avgConversionRate || 0,
            avg_clv: clv,
            updated_at: new Date().toISOString(),
          })
          .eq("id", segment.id);
      }
    } catch (error) {
      console.error("Error updating segment metrics:", error);
      throw error;
    }
  }

  private generateCampaignOptimizations(
    _performance: AudiencePerformanceMetrics
  ): CampaignOptimization[] {
    // Implementation placeholder
    return [];
  }
}
