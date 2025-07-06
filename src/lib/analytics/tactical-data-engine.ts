/**
 * Tactical Data Analysis Engine
 * Provides predictive insights and automated recommendations based on business data
 * Integrates with Shopify, Kajabi, and financial metrics for comprehensive analysis
 */

import { createClient } from "@/lib/supabase/server";
import { createShopifyService } from "@/lib/apis/shopify";
import { createKajabiService } from "@/lib/apis/kajabi";
import {
  createDemoShopifyService,
  createDemoKajabiService,
  shouldUseDemoMode,
} from "@/lib/apis/demo-services";

// Types for the tactical analysis engine
export interface TacticalDataPoint {
  timestamp: string;
  value: number;
  source: "shopify" | "kajabi" | "financial" | "marketing";
  category: string;
  metadata?: Record<string, unknown>;
}

export interface PredictiveInsight {
  id: string;
  title: string;
  description: string;
  confidence_score: number; // 0-100
  impact_score: number; // 0-100
  time_horizon: "1week" | "1month" | "3months" | "6months" | "1year";
  data_sources: string[];
  predictions: {
    metric: string;
    current_value: number;
    predicted_value: number;
    change_percentage: number;
    trend: "increasing" | "decreasing" | "stable";
  }[];
  recommendations: string[];
  risk_factors: string[];
  created_at: string;
}

export interface DataIntegrationResult {
  success: boolean;
  data_points: TacticalDataPoint[];
  errors: string[];
  processing_time: number;
  last_updated: string;
}

export interface TacticalEngineConfig {
  shopify_enabled: boolean;
  kajabi_enabled: boolean;
  financial_enabled: boolean;
  marketing_enabled: boolean;
  lookback_days: number;
  prediction_horizon_days: number;
  min_confidence_threshold: number;
}

export class TacticalDataAnalysisEngine {
  private supabase: any;
  private shopifyService: any;
  private kajabiService: any;
  private config: TacticalEngineConfig;

  constructor(config: Partial<TacticalEngineConfig> = {}) {
    this.supabase = createClient();

    // Initialize services based on demo mode
    if (shouldUseDemoMode()) {
      this.shopifyService = createDemoShopifyService();
      this.kajabiService = createDemoKajabiService();
    } else {
      this.shopifyService = createShopifyService();
      this.kajabiService = createKajabiService();
    }

    // Default configuration
    this.config = {
      shopify_enabled: true,
      kajabi_enabled: true,
      financial_enabled: true,
      marketing_enabled: true,
      lookback_days: 90,
      prediction_horizon_days: 30,
      min_confidence_threshold: 70,
      ...config,
    };
  }

  /**
   * Main method to integrate and preprocess data from all sources
   */
  async integrateData(dateRange?: {
    startDate: string;
    endDate: string;
  }): Promise<DataIntegrationResult> {
    const startTime = Date.now();
    const dataPoints: TacticalDataPoint[] = [];
    const errors: string[] = [];

    // Set default date range if not provided
    const endDate = dateRange?.endDate || new Date().toISOString();
    const startDate =
      dateRange?.startDate ||
      new Date(
        Date.now() - this.config.lookback_days * 24 * 60 * 60 * 1000
      ).toISOString();

    try {
      // Integrate Shopify data
      if (this.config.shopify_enabled) {
        try {
          const shopifyData = await this.integrateShopifyData(
            startDate,
            endDate
          );
          dataPoints.push(...shopifyData);
        } catch (error) {
          errors.push(`Shopify integration error: ${error}`);
        }
      }

      // Integrate Kajabi data
      if (this.config.kajabi_enabled) {
        try {
          const kajabiData = await this.integrateKajabiData(startDate, endDate);
          dataPoints.push(...kajabiData);
        } catch (error) {
          errors.push(`Kajabi integration error: ${error}`);
        }
      }

      // Integrate financial data
      if (this.config.financial_enabled) {
        try {
          const financialData = await this.integrateFinancialData(
            startDate,
            endDate
          );
          dataPoints.push(...financialData);
        } catch (error) {
          errors.push(`Financial integration error: ${error}`);
        }
      }

      // Integrate marketing data
      if (this.config.marketing_enabled) {
        try {
          const marketingData = await this.integrateMarketingData(
            startDate,
            endDate
          );
          dataPoints.push(...marketingData);
        } catch (error) {
          errors.push(`Marketing integration error: ${error}`);
        }
      }

      // Sort data points by timestamp
      dataPoints.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // Store processed data in Supabase for future analysis
      await this.storeTacticalData(dataPoints);

      const processingTime = Date.now() - startTime;

      return {
        success: errors.length === 0,
        data_points: dataPoints,
        errors,
        processing_time: processingTime,
        last_updated: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        data_points: [],
        errors: [`Critical error: ${error}`],
        processing_time: Date.now() - startTime,
        last_updated: new Date().toISOString(),
      };
    }
  }

  /**
   * Integrate Shopify sales and product data
   */
  private async integrateShopifyData(
    startDate: string,
    endDate: string
  ): Promise<TacticalDataPoint[]> {
    const dataPoints: TacticalDataPoint[] = [];

    // Get Shopify sales data from database
    const supabaseClient = await this.supabase;
    const { data: shopifySales, error: shopifyError } = await supabaseClient
      .from("shopify_sales")
      .select("*")
      .gte("order_date", startDate)
      .lte("order_date", endDate)
      .order("order_date", { ascending: true });

    if (shopifyError) {
      throw new Error(`Shopify data fetch error: ${shopifyError.message}`);
    }

    // Convert Shopify sales to tactical data points
    if (shopifySales) {
      for (const sale of shopifySales) {
        dataPoints.push({
          timestamp: sale.order_date,
          value: sale.total_amount || 0,
          source: "shopify",
          category: "revenue",
          metadata: {
            order_id: sale.order_id,
            product_id: sale.product_id,
            product_title: sale.product_title,
            customer_id: sale.customer_id,
            currency: sale.currency,
          },
        });

        // Add quantity as separate data point
        if (sale.quantity) {
          dataPoints.push({
            timestamp: sale.order_date,
            value: sale.quantity,
            source: "shopify",
            category: "units_sold",
            metadata: {
              order_id: sale.order_id,
              product_id: sale.product_id,
              product_title: sale.product_title,
            },
          });
        }
      }
    }

    return dataPoints;
  }

  /**
   * Integrate Kajabi course and engagement data
   */
  private async integrateKajabiData(
    startDate: string,
    endDate: string
  ): Promise<TacticalDataPoint[]> {
    const dataPoints: TacticalDataPoint[] = [];

    // Get Kajabi sales data from database
    const supabaseClient = await this.supabase;
    const { data: kajabiSales, error: kajabiError } = await supabaseClient
      .from("kajabi_sales")
      .select("*")
      .gte("sale_date", startDate)
      .lte("sale_date", endDate)
      .order("sale_date", { ascending: true });

    if (kajabiError) {
      throw new Error(`Kajabi data fetch error: ${kajabiError.message}`);
    }

    // Convert Kajabi sales to tactical data points
    if (kajabiSales) {
      for (const sale of kajabiSales) {
        dataPoints.push({
          timestamp: sale.sale_date,
          value: sale.amount || 0,
          source: "kajabi",
          category: "revenue",
          metadata: {
            sale_id: sale.sale_id,
            product_id: sale.product_id,
            product_name: sale.product_name,
            customer_email: sale.customer_email,
            currency: sale.currency,
          },
        });
      }
    }

    return dataPoints;
  }

  /**
   * Integrate financial metrics and KPIs
   */
  private async integrateFinancialData(
    startDate: string,
    endDate: string
  ): Promise<TacticalDataPoint[]> {
    const dataPoints: TacticalDataPoint[] = [];

    // Get financial metrics from various tables
    const supabaseClient = await this.supabase;
    const [{ data: expenses }, { data: investments }, { data: cashFlow }] =
      await Promise.all([
        supabaseClient
          .from("financial_expenses")
          .select("*")
          .gte("date", startDate)
          .lte("date", endDate),

        supabaseClient
          .from("financial_investments")
          .select("*")
          .gte("date", startDate)
          .lte("date", endDate),

        supabaseClient
          .from("cash_flow_metrics")
          .select("*")
          .gte("date", startDate)
          .lte("date", endDate),
      ]);

    // Process expenses
    if (expenses) {
      for (const expense of expenses) {
        dataPoints.push({
          timestamp: expense.date,
          value: expense.amount || 0,
          source: "financial",
          category: "expenses",
          metadata: {
            expense_id: expense.id,
            category: expense.category,
            description: expense.description,
            payment_method: expense.payment_method,
          },
        });
      }
    }

    // Process investments
    if (investments) {
      for (const investment of investments) {
        dataPoints.push({
          timestamp: investment.date,
          value: investment.amount || 0,
          source: "financial",
          category: "investments",
          metadata: {
            investment_id: investment.id,
            type: investment.investment_type,
            description: investment.description,
            expected_return: investment.expected_return,
          },
        });
      }
    }

    // Process cash flow
    if (cashFlow) {
      for (const flow of cashFlow) {
        dataPoints.push({
          timestamp: flow.date,
          value: flow.net_cash_flow || 0,
          source: "financial",
          category: "cash_flow",
          metadata: {
            cash_flow_id: flow.id,
            inflow: flow.cash_inflow,
            outflow: flow.cash_outflow,
            balance: flow.cash_balance,
          },
        });
      }
    }

    return dataPoints;
  }

  /**
   * Integrate marketing and advertising performance data
   */
  private async integrateMarketingData(
    startDate: string,
    endDate: string
  ): Promise<TacticalDataPoint[]> {
    const dataPoints: TacticalDataPoint[] = [];

    // Get marketing performance data
    const supabaseClient = await this.supabase;
    const { data: adPerformance, error: adError } = await supabaseClient
      .from("google_ads_performance")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (adError) {
      throw new Error(`Marketing data fetch error: ${adError.message}`);
    }

    // Convert ad performance to tactical data points
    if (adPerformance) {
      for (const ad of adPerformance) {
        // Add clicks as data point
        dataPoints.push({
          timestamp: ad.date,
          value: ad.clicks || 0,
          source: "marketing",
          category: "clicks",
          metadata: {
            campaign_id: ad.campaign_id,
            campaign_name: ad.campaign_name,
            impressions: ad.impressions,
            cost: ad.cost,
            ctr: ad.ctr,
          },
        });

        // Add cost as data point
        dataPoints.push({
          timestamp: ad.date,
          value: ad.cost || 0,
          source: "marketing",
          category: "ad_spend",
          metadata: {
            campaign_id: ad.campaign_id,
            campaign_name: ad.campaign_name,
            clicks: ad.clicks,
            impressions: ad.impressions,
            cpc: ad.cost / (ad.clicks || 1),
          },
        });

        // Add impressions as data point
        dataPoints.push({
          timestamp: ad.date,
          value: ad.impressions || 0,
          source: "marketing",
          category: "impressions",
          metadata: {
            campaign_id: ad.campaign_id,
            campaign_name: ad.campaign_name,
            clicks: ad.clicks,
            cost: ad.cost,
          },
        });
      }
    }

    return dataPoints;
  }

  /**
   * Store processed tactical data for future analysis
   */
  private async storeTacticalData(
    dataPoints: TacticalDataPoint[]
  ): Promise<void> {
    try {
      // Create tactical_data_points table structure if it doesn't exist
      const supabaseClient = await this.supabase;
      const { error: insertError } = await supabaseClient
        .from("tactical_data_points")
        .upsert(
          dataPoints.map(point => ({
            timestamp: point.timestamp,
            value: point.value,
            source: point.source,
            category: point.category,
            metadata: point.metadata || {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })),
          {
            onConflict: "timestamp,source,category",
            ignoreDuplicates: false,
          }
        );

      if (insertError) {
        console.error("Error storing tactical data:", insertError);
        // Don't throw here, just log the error as storage is optional
      }
    } catch (error) {
      console.error("Failed to store tactical data:", error);
      // Don't throw here, just log the error as storage is optional
    }
  }

  /**
   * Clean and normalize data for consistent analysis
   */
  cleanData(dataPoints: TacticalDataPoint[]): TacticalDataPoint[] {
    return dataPoints
      .filter(point => {
        // Remove invalid data points
        return (
          point.value !== null &&
          point.value !== undefined &&
          !isNaN(point.value) &&
          point.timestamp &&
          point.source &&
          point.category
        );
      })
      .map(point => ({
        ...point,
        // Normalize timestamps to ISO format
        timestamp: new Date(point.timestamp).toISOString(),
        // Ensure numeric values
        value: Number(point.value),
      }));
  }

  /**
   * Get data aggregation by category and time period
   */
  async getAggregatedData(params: {
    categories?: string[];
    sources?: string[];
    groupBy: "day" | "week" | "month";
    startDate: string;
    endDate: string;
  }): Promise<Record<string, any[]>> {
    const supabaseClient = await this.supabase;
    const { data, error } = await supabaseClient
      .from("tactical_data_points")
      .select("*")
      .gte("timestamp", params.startDate)
      .lte("timestamp", params.endDate)
      .in("category", params.categories || [])
      .in("source", params.sources || []);

    if (error) {
      throw new Error(`Failed to fetch aggregated data: ${error.message}`);
    }

    // Group data by the specified time period
    const grouped: Record<string, any[]> = {};

    if (data) {
      for (const point of data) {
        const key = this.getTimePeriodKey(point.timestamp, params.groupBy);
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(point);
      }
    }

    return grouped;
  }

  /**
   * Helper method to get time period key for grouping
   */
  private getTimePeriodKey(
    timestamp: string,
    groupBy: "day" | "week" | "month"
  ): string {
    const date = new Date(timestamp);

    switch (groupBy) {
      case "day":
        return date.toISOString().split("T")[0];
      case "week":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return weekStart.toISOString().split("T")[0];
      case "month":
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      default:
        return date.toISOString().split("T")[0];
    }
  }

  /**
   * Generate summary statistics for integrated data
   */
  generateDataSummary(
    dataPoints: TacticalDataPoint[]
  ): Record<string, unknown> {
    const summary: Record<string, any> = {
      total_points: dataPoints.length,
      date_range: {
        start: dataPoints.length > 0 ? dataPoints[0].timestamp : null,
        end:
          dataPoints.length > 0
            ? dataPoints[dataPoints.length - 1].timestamp
            : null,
      },
      sources: {},
      categories: {},
      value_stats: {},
    };

    // Group by source
    for (const point of dataPoints) {
      if (!summary.sources[point.source]) {
        summary.sources[point.source] = 0;
      }
      summary.sources[point.source]++;

      if (!summary.categories[point.category]) {
        summary.categories[point.category] = 0;
      }
      summary.categories[point.category]++;
    }

    // Calculate value statistics
    const values = dataPoints.map(p => p.value);
    if (values.length > 0) {
      summary.value_stats = {
        min: Math.min(...values),
        max: Math.max(...values),
        mean: values.reduce((a, b) => a + b, 0) / values.length,
        median: this.calculateMedian(values),
        total: values.reduce((a, b) => a + b, 0),
      };
    }

    return summary;
  }

  /**
   * Helper method to calculate median
   */
  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }
}

// Export singleton instance
export const tacticalDataEngine = new TacticalDataAnalysisEngine();
