/**
 * Content ROI Adapter
 * Integrates ROI algorithms with Shopify/Kajabi data sources
 */

import {
  ROIAlgorithmEngine,
  type ContentMetrics as BaseContentMetrics,
  type ROIResult,
} from "./roi-algorithms";

// Extended ContentMetrics with additional fields for optimization engine
interface ExtendedContentMetrics extends BaseContentMetrics {
  conversion_rate: number;
}

export class ContentROIAdapter {
  private roiEngine: ROIAlgorithmEngine;

  constructor() {
    this.roiEngine = new ROIAlgorithmEngine();
  }

  /**
   * Fetch content metrics from all integrated platforms
   */
  async fetchContentMetrics(): Promise<ExtendedContentMetrics[]> {
    try {
      // Mock data for development - replace with actual API calls
      const mockContentMetrics: ExtendedContentMetrics[] = [
        {
          content_id: "shopify-course-1",
          title: "E-commerce Mastery Course",
          platform: "shopify",
          type: "course",
          created_date: "2024-01-15",
          revenue: 45000,
          sales_count: 450,
          average_order_value: 100,
          views: 25000,
          clicks: 3200,
          conversions: 450,
          engagement_time: 12.5,
          bounce_rate: 0.35,
          production_cost: 8000,
          conversion_rate: 0.14,
          marketing_spend: 12000,
          operational_cost: 3250,
          first_sale_date: "2024-01-18",
          period_start: "2024-01-01",
          period_end: "2024-03-31",
        },
        {
          content_id: "kajabi-webinar-1",
          title: "Digital Marketing Fundamentals",
          platform: "kajabi",
          type: "course",
          created_date: "2024-02-10",
          revenue: 28000,
          sales_count: 280,
          average_order_value: 100,
          views: 18000,
          clicks: 2400,
          conversions: 280,
          engagement_time: 6.8,
          bounce_rate: 0.42,
          production_cost: 3500,
          marketing_spend: 8500,
          operational_cost: 2000,
          conversion_rate: 0.12,
          first_sale_date: "2024-02-11",
          period_start: "2024-02-01",
          period_end: "2024-03-31",
        },
        {
          content_id: "shopify-ebook-1",
          title: "Conversion Optimization Guide",
          platform: "shopify",
          type: "product",
          created_date: "2024-03-05",
          revenue: 15000,
          sales_count: 300,
          average_order_value: 50,
          views: 12000,
          clicks: 1800,
          conversions: 300,
          engagement_time: 8.2,
          bounce_rate: 0.45,
          production_cost: 2000,
          marketing_spend: 5000,
          operational_cost: 1000,
          conversion_rate: 0.17,
          first_sale_date: "2024-03-07",
          period_start: "2024-03-01",
          period_end: "2024-03-31",
        },
        {
          content_id: "kajabi-course-2",
          title: "Advanced Analytics Mastery",
          platform: "kajabi",
          type: "course",
          created_date: "2024-01-20",
          revenue: 62000,
          sales_count: 620,
          average_order_value: 100,
          views: 35000,
          clicks: 4500,
          conversions: 620,
          engagement_time: 15.3,
          bounce_rate: 0.28,
          production_cost: 15000,
          marketing_spend: 18000,
          operational_cost: 5100,
          conversion_rate: 0.14,
          first_sale_date: "2024-01-24",
          period_start: "2024-01-01",
          period_end: "2024-03-31",
        },
        {
          content_id: "shopify-template-1",
          title: "Store Template Pack",
          platform: "shopify",
          type: "product",
          created_date: "2024-02-28",
          revenue: 8500,
          sales_count: 170,
          average_order_value: 50,
          views: 8000,
          clicks: 1200,
          conversions: 170,
          engagement_time: 4.5,
          bounce_rate: 0.65,
          production_cost: 1200,
          marketing_spend: 2500,
          operational_cost: 600,
          conversion_rate: 0.14,
          first_sale_date: "2024-03-01",
          period_start: "2024-02-01",
          period_end: "2024-03-31",
        },
      ];

      return mockContentMetrics;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching content metrics:", error);
      }
      throw new Error("Failed to fetch content metrics from platforms");
    }
  }

  /**
   * Calculate ROI results using the ROI algorithm engine
   */
  async calculateContentROI(): Promise<ROIResult[]> {
    try {
      const contentMetrics = await this.fetchContentMetrics();

      const roiResults = contentMetrics.map(metrics => {
        return this.roiEngine.calculateContentROI(metrics);
      });

      return roiResults;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error calculating content ROI:", error);
      }
      throw new Error("Failed to calculate content ROI");
    }
  }

  /**
   * Get comprehensive content performance analysis
   */
  async getContentPerformanceAnalysis() {
    try {
      const contentMetrics = await this.fetchContentMetrics();
      const roiResults = await this.calculateContentROI();

      // Aggregate statistics
      const totalRevenue = contentMetrics.reduce(
        (sum, m) => sum + m.revenue,
        0
      );
      const totalCosts = contentMetrics.reduce(
        (sum, m) =>
          sum + m.production_cost + m.marketing_spend + m.operational_cost,
        0
      );
      const averageROI =
        roiResults.reduce((sum, r) => sum + r.roi_percentage, 0) /
        roiResults.length;

      // Performance distribution
      const performanceGrades = roiResults.reduce(
        (acc, r) => {
          acc[r.performance_grade] = (acc[r.performance_grade] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      // Platform analysis
      const platformPerformance = contentMetrics.reduce(
        (acc, m) => {
          if (!acc[m.platform]) {
            acc[m.platform] = { revenue: 0, count: 0 };
          }
          acc[m.platform].revenue += m.revenue;
          acc[m.platform].count += 1;
          return acc;
        },
        {} as Record<string, { revenue: number; count: number }>
      );

      return {
        summary: {
          total_content_pieces: contentMetrics.length,
          total_revenue: totalRevenue,
          total_costs: totalCosts,
          average_roi: averageROI,
          net_profit: totalRevenue - totalCosts,
        },
        performance_distribution: performanceGrades,
        platform_performance: platformPerformance,
        content_metrics: contentMetrics,
        roi_results: roiResults,
      };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error getting content performance analysis:", error);
      }
      throw new Error("Failed to get content performance analysis");
    }
  }

  /**
   * Get trending performance insights
   */
  async getTrendingInsights() {
    try {
      const roiResults = await this.calculateContentROI();

      // Sort by ROI performance
      const topPerformers = roiResults
        .filter(r => r.performance_grade === "A")
        .sort((a, b) => b.roi_percentage - a.roi_percentage)
        .slice(0, 3);

      const underperformers = roiResults
        .filter(r => r.performance_grade === "D" || r.performance_grade === "F")
        .sort((a, b) => a.roi_percentage - b.roi_percentage)
        .slice(0, 3);

      // Content type analysis
      const contentMetrics = await this.fetchContentMetrics();
      const typePerformance = contentMetrics.reduce(
        (acc, m) => {
          const roi = roiResults.find(r => r.content_id === m.content_id);
          if (!acc[m.type]) {
            acc[m.type] = { total_roi: 0, count: 0 };
          }
          acc[m.type].total_roi += roi?.roi_percentage || 0;
          acc[m.type].count += 1;
          return acc;
        },
        {} as Record<string, { total_roi: number; count: number }>
      );

      // Calculate averages
      Object.keys(typePerformance).forEach(type => {
        typePerformance[type].total_roi /= typePerformance[type].count;
      });

      return {
        top_performers: topPerformers,
        underperformers: underperformers,
        content_type_performance: typePerformance,
        trending_up: topPerformers.length,
        needs_attention: underperformers.length,
      };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error getting trending insights:", error);
      }
      throw new Error("Failed to get trending insights");
    }
  }
}
