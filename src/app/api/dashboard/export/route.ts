import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

interface ExportRequestBody {
  format: "csv" | "json" | "pdf";
  metricsIds?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
  includeCharts?: boolean;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    // Parse request body
    const body: ExportRequestBody = await request.json();
    const { format, metricsIds, dateRange, includeCharts } = body;

    // Validate format
    if (!["csv", "json", "pdf"].includes(format)) {
      return NextResponse.json(
        { error: "Invalid export format" },
        { status: 400 }
      );
    }

    // Get current date range (default to last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const fromDate = dateRange?.from ? new Date(dateRange.from) : thirtyDaysAgo;
    const toDate = dateRange?.to ? new Date(dateRange.to) : today;

    // Fetch KPI data from various sources
    const [shopifyResult, kajabiResult, adDataResult] = await Promise.all([
      supabase
        .from("shopify_sales")
        .select("*")
        .gte("order_date", fromDate.toISOString())
        .lte("order_date", toDate.toISOString())
        .order("order_date", { ascending: false }),

      supabase
        .from("kajabi_sales")
        .select("*")
        .gte("sale_date", fromDate.toISOString())
        .lte("sale_date", toDate.toISOString())
        .order("sale_date", { ascending: false }),

      supabase
        .from("google_ads_performance")
        .select("*")
        .gte("date", fromDate.toISOString())
        .lte("date", toDate.toISOString())
        .order("date", { ascending: false }),
    ]);

    // Check for errors
    if (shopifyResult.error || kajabiResult.error || adDataResult.error) {
      console.error("Database query errors:", {
        shopify: shopifyResult.error,
        kajabi: kajabiResult.error,
        ads: adDataResult.error,
      });
      return NextResponse.json(
        { error: "Failed to fetch data from database" },
        { status: 500 }
      );
    }

    // Calculate metrics
    const shopifyData = shopifyResult.data || [];
    const kajabiData = kajabiResult.data || [];
    const adData = adDataResult.data || [];

    // Calculate total revenue
    const shopifyRevenue = shopifyData.reduce(
      (sum, sale) => sum + (sale.total_amount || 0),
      0
    );
    const kajabiRevenue = kajabiData.reduce(
      (sum, sale) => sum + (sale.amount || 0),
      0
    );
    const totalRevenue = shopifyRevenue + kajabiRevenue;

    // Calculate revenue change (compare with previous period)
    const previousFromDate = new Date(
      fromDate.getTime() - (toDate.getTime() - fromDate.getTime())
    );
    const [prevShopifyResult, prevKajabiResult] = await Promise.all([
      supabase
        .from("shopify_sales")
        .select("total_amount")
        .gte("order_date", previousFromDate.toISOString())
        .lt("order_date", fromDate.toISOString()),

      supabase
        .from("kajabi_sales")
        .select("amount")
        .gte("sale_date", previousFromDate.toISOString())
        .lt("sale_date", fromDate.toISOString()),
    ]);

    const prevShopifyRevenue = (prevShopifyResult.data || []).reduce(
      (sum, sale) => sum + (sale.total_amount || 0),
      0
    );
    const prevKajabiRevenue = (prevKajabiResult.data || []).reduce(
      (sum, sale) => sum + (sale.amount || 0),
      0
    );
    const prevTotalRevenue = prevShopifyRevenue + prevKajabiRevenue;
    const revenueChange =
      prevTotalRevenue > 0
        ? (totalRevenue - prevTotalRevenue) / prevTotalRevenue
        : 0;

    // Calculate other metrics
    const totalCustomers = new Set([
      ...shopifyData.map(s => s.customer_id || s.order_date),
      ...kajabiData.map(k => k.customer_email || k.sale_date),
    ]).size;

    const totalClicks = adData.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
    const totalImpressions = adData.reduce(
      (sum, ad) => sum + (ad.impressions || 0),
      0
    );
    const conversionRate =
      totalImpressions > 0 ? totalClicks / totalImpressions : 0;

    const totalOrders = shopifyData.length + kajabiData.length;
    const analyticsScore = Math.min(100, (totalOrders / 100) * 100); // Simplified score

    // Prepare export data
    const exportData = {
      exportMetadata: {
        format,
        exportedAt: new Date().toISOString(),
        dateRange: {
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
        },
        includeCharts: includeCharts || false,
        version: "1.0",
      },
      metrics: [
        {
          id: "total-revenue",
          title: "Total Revenue",
          value: totalRevenue,
          change: revenueChange,
          trend: revenueChange >= 0 ? "up" : "down",
          icon: "DollarSign",
          color: "text-green-600",
          bgColor: "bg-green-50",
          period: `${formatDate(fromDate)} - ${formatDate(toDate)}`,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "active-customers",
          title: "Active Customers",
          value: totalCustomers,
          change: 0.08, // Placeholder
          trend: "up",
          icon: "Users",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          period: `${formatDate(fromDate)} - ${formatDate(toDate)}`,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "conversion-rate",
          title: "Conversion Rate",
          value: conversionRate,
          change: -0.02, // Placeholder
          trend: "down",
          icon: "TrendingUp",
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          period: `${formatDate(fromDate)} - ${formatDate(toDate)}`,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "analytics-score",
          title: "Analytics Score",
          value: analyticsScore,
          change: 0.05, // Placeholder
          trend: "up",
          icon: "BarChart3",
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          period: `${formatDate(fromDate)} - ${formatDate(toDate)}`,
          lastUpdated: new Date().toISOString(),
        },
      ],
      rawData: {
        shopify: shopifyData,
        kajabi: kajabiData,
        googleAds: adData,
      },
      summary: {
        totalMetrics: 4,
        totalRevenue,
        totalCustomers,
        conversionRate,
        analyticsScore,
        dataPoints: shopifyData.length + kajabiData.length + adData.length,
      },
    };

    // Filter metrics if specific IDs requested
    if (metricsIds && metricsIds.length > 0) {
      exportData.metrics = exportData.metrics.filter(metric =>
        metricsIds.includes(metric.id)
      );
    }

    return NextResponse.json({
      success: true,
      data: exportData,
      message: `Export data prepared successfully for ${format} format`,
    });
  } catch (error) {
    console.error("Export API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper function to format dates
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}
