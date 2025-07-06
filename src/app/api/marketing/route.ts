import { NextRequest, NextResponse } from "next/server";

interface MarketingChannel {
  id: string;
  name: string;
  spend: number;
  revenue: number;
  roi: number;
  conversions: number;
  cpa: number;
  budget: number;
  budgetUsed: number;
  performance: "excellent" | "good" | "average" | "poor";
  impressions?: number;
  clicks?: number;
  ctr?: number;
  date?: string;
}

interface MarketingResponse {
  data: MarketingChannel[];
  metadata: {
    count: number;
    total_spend: number;
    total_revenue: number;
    average_roi: number;
    timestamp: string;
  };
}

// Mock data - In real implementation, this would come from database/external APIs
const mockMarketingData: MarketingChannel[] = [
  {
    id: "1",
    name: "Google Ads",
    spend: 15000,
    revenue: 45000,
    roi: 200,
    conversions: 150,
    cpa: 100,
    budget: 20000,
    budgetUsed: 75,
    performance: "excellent",
    impressions: 250000,
    clicks: 2500,
    ctr: 1.0,
    date: new Date().toISOString().split("T")[0],
  },
  {
    id: "2",
    name: "Facebook Ads",
    spend: 8000,
    revenue: 16000,
    roi: 100,
    conversions: 80,
    cpa: 100,
    budget: 10000,
    budgetUsed: 80,
    performance: "good",
    impressions: 180000,
    clicks: 1800,
    ctr: 1.0,
    date: new Date().toISOString().split("T")[0],
  },
  {
    id: "3",
    name: "LinkedIn Ads",
    spend: 5000,
    revenue: 8000,
    roi: 60,
    conversions: 25,
    cpa: 200,
    budget: 6000,
    budgetUsed: 83,
    performance: "average",
    impressions: 50000,
    clicks: 400,
    ctr: 0.8,
    date: new Date().toISOString().split("T")[0],
  },
  {
    id: "4",
    name: "YouTube Ads",
    spend: 3000,
    revenue: 2400,
    roi: -20,
    conversions: 12,
    cpa: 250,
    budget: 4000,
    budgetUsed: 75,
    performance: "poor",
    impressions: 120000,
    clicks: 360,
    ctr: 0.3,
    date: new Date().toISOString().split("T")[0],
  },
  {
    id: "5",
    name: "Instagram Ads",
    spend: 6000,
    revenue: 12000,
    roi: 100,
    conversions: 60,
    cpa: 100,
    budget: 8000,
    budgetUsed: 75,
    performance: "good",
    impressions: 200000,
    clicks: 1200,
    ctr: 0.6,
    date: new Date().toISOString().split("T")[0],
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get("channel");
    const performance = searchParams.get("performance");
    const limit = parseInt(searchParams.get("limit") || "10");

    let filteredData = [...mockMarketingData];

    // Apply filters
    if (channel) {
      filteredData = filteredData.filter(item =>
        item.name.toLowerCase().includes(channel.toLowerCase())
      );
    }

    if (performance) {
      filteredData = filteredData.filter(
        item => item.performance === performance
      );
    }

    // Apply limit
    filteredData = filteredData.slice(0, limit);

    // Calculate metadata
    const totalSpend = filteredData.reduce((sum, item) => sum + item.spend, 0);
    const totalRevenue = filteredData.reduce(
      (sum, item) => sum + item.revenue,
      0
    );
    const averageROI =
      filteredData.length > 0
        ? filteredData.reduce((sum, item) => sum + item.roi, 0) /
          filteredData.length
        : 0;

    const response: MarketingResponse = {
      data: filteredData,
      metadata: {
        count: filteredData.length,
        total_spend: totalSpend,
        total_revenue: totalRevenue,
        average_roi: averageROI,
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Marketing API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch marketing data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channel_name, budget_adjustment, action } = body;

    // Mock budget optimization logic
    const result = {
      success: true,
      channel: channel_name,
      action_taken: action,
      budget_adjustment: budget_adjustment,
      estimated_roi_improvement: Math.floor(Math.random() * 20) + 5, // Mock improvement
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Marketing API] POST Error:", error);
    return NextResponse.json(
      {
        error: "Failed to process marketing optimization",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
