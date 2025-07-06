/**
 * Task 71.8: Implementeer concurrentie monitoring en alerting workflows
 * API voor concurrentie monitoring, data scraping, performance vergelijking en alerting
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Types
interface CompetitorData {
  id: string;
  name: string;
  platform: string;
  url: string;
  metrics: {
    followers: number;
    engagement_rate: number;
    avg_likes: number;
    avg_comments: number;
    avg_shares: number;
    post_frequency: number;
    content_performance: number;
  };
  last_scraped: string;
  status: "active" | "inactive" | "error";
}

interface CompetitorAlert {
  id: string;
  competitor_id: string;
  alert_type:
    | "performance_drop"
    | "performance_spike"
    | "new_content"
    | "engagement_change";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  threshold_value: number;
  current_value: number;
  percentage_change: number;
  created_at: string;
  acknowledged: boolean;
}

interface ScrapingConfig {
  platform: string;
  scraping_interval: number; // minutes
  thresholds: {
    engagement_drop: number;
    engagement_spike: number;
    follower_change: number;
    performance_variance: number;
  };
  alert_settings: {
    email_notifications: boolean;
    dashboard_alerts: boolean;
    webhook_url?: string;
  };
}

// Helper function to create Supabase client
async function createSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

// GET: Retrieve competitor monitoring data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "competitors";
    const platform = searchParams.get("platform");
    const competitorId = searchParams.get("competitor_id");

    const supabase = await createSupabaseClient();

    switch (type) {
      case "competitors":
        return await getCompetitors(supabase, platform);

      case "alerts":
        return await getCompetitorAlerts(supabase, competitorId);

      case "analysis":
        return await getCompetitorAnalysis(supabase, competitorId, platform);

      case "trends":
        return await getCompetitorTrends(supabase, platform);

      case "dashboard":
        return await getCompetitorDashboard(supabase);

      default:
        return NextResponse.json(
          { error: "Invalid type parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in competitor monitoring GET:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST: Create or trigger competitor monitoring actions
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "scrape";
    const body = await request.json();

    const supabase = await createSupabaseClient();

    switch (action) {
      case "scrape":
        return await triggerCompetitorScraping(supabase, body);

      case "add_competitor":
        return await addCompetitor(supabase, body);

      case "create_alert":
        return await createCompetitorAlert(supabase, body);

      case "analyze":
        return await analyzeCompetitorPerformance(supabase, body);

      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in competitor monitoring POST:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Implementation functions
async function getCompetitors(supabase: any, platform?: string | null) {
  try {
    let query = supabase
      .from("competitor_data")
      .select("*")
      .order("last_scraped", { ascending: false });

    if (platform) {
      query = query.eq("platform", platform);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    throw error;
  }
}

async function getCompetitorAlerts(
  supabase: any,
  competitorId?: string | null
) {
  try {
    let query = supabase
      .from("competitor_alerts")
      .select(
        `
        *,
        competitor_data!inner(name, platform)
      `
      )
      .order("created_at", { ascending: false });

    if (competitorId) {
      query = query.eq("competitor_id", competitorId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    throw error;
  }
}

async function getCompetitorAnalysis(
  supabase: any,
  competitorId?: string | null,
  platform?: string | null
) {
  try {
    // Get competitor data with historical metrics
    const { data: competitorData, error: competitorError } = await supabase
      .from("competitor_data")
      .select("*")
      .eq("id", competitorId)
      .single();

    if (competitorError) throw competitorError;

    // Get our own performance data for comparison
    const { data: ownData, error: ownError } = await supabase
      .from("content_performance")
      .select("*")
      .eq("platform", platform)
      .order("created_at", { ascending: false })
      .limit(30);

    if (ownError) throw ownError;

    // Calculate performance comparison
    const analysis = {
      competitor: competitorData,
      own_performance: ownData,
      comparison: {
        engagement_rate_diff:
          competitorData.metrics.engagement_rate -
          (ownData[0]?.engagement_rate || 0),
        follower_growth_diff:
          competitorData.metrics.followers - (ownData[0]?.followers || 0),
        content_frequency_diff:
          competitorData.metrics.post_frequency -
          (ownData[0]?.post_frequency || 0),
        performance_gap: calculatePerformanceGap(
          competitorData.metrics,
          ownData[0] || {}
        ),
      },
      recommendations: generateRecommendations(
        competitorData.metrics,
        ownData[0] || {}
      ),
    };

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    throw error;
  }
}

async function getCompetitorTrends(supabase: any, platform?: string | null) {
  try {
    let query = supabase
      .from("competitor_data")
      .select("*")
      .order("last_scraped", { ascending: false });

    if (platform) {
      query = query.eq("platform", platform);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Calculate trends
    const trends = analyzeTrends(data || []);

    return NextResponse.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    throw error;
  }
}

async function getCompetitorDashboard(supabase: any) {
  try {
    // Get summary statistics
    const { data: competitors, error: competitorError } = await supabase
      .from("competitor_data")
      .select("*");

    const { data: alerts, error: alertError } = await supabase
      .from("competitor_alerts")
      .select("*")
      .eq("acknowledged", false);

    if (competitorError) throw competitorError;
    if (alertError) throw alertError;

    const dashboard = {
      summary: {
        total_competitors: competitors?.length || 0,
        active_competitors:
          competitors?.filter(c => c.status === "active").length || 0,
        pending_alerts: alerts?.length || 0,
        critical_alerts:
          alerts?.filter(a => a.severity === "critical").length || 0,
      },
      top_performers:
        competitors
          ?.sort(
            (a, b) => b.metrics.engagement_rate - a.metrics.engagement_rate
          )
          .slice(0, 5) || [],
      recent_alerts: alerts?.slice(0, 10) || [],
      platform_breakdown: calculatePlatformBreakdown(competitors || []),
    };

    return NextResponse.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    throw error;
  }
}

async function triggerCompetitorScraping(
  supabase: any,
  config: ScrapingConfig
) {
  try {
    // This would typically trigger an n8n workflow
    // For now, we'll simulate the scraping process

    const scrapingResults = await simulateDataScraping(config);

    // Update competitor data
    for (const result of scrapingResults) {
      const { error } = await supabase.from("competitor_data").upsert(result);

      if (error) throw error;
    }

    // Check for alerts
    const alerts = await checkForAlerts(scrapingResults, config.thresholds);

    // Create alerts if needed
    for (const alert of alerts) {
      await createCompetitorAlert(supabase, alert);
    }

    return NextResponse.json({
      success: true,
      message: "Competitor scraping completed",
      scraped_count: scrapingResults.length,
      alerts_generated: alerts.length,
    });
  } catch (error) {
    throw error;
  }
}

async function addCompetitor(
  supabase: any,
  competitorData: Partial<CompetitorData>
) {
  try {
    const { data, error } = await supabase
      .from("competitor_data")
      .insert(competitorData)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data[0],
      message: "Competitor added successfully",
    });
  } catch (error) {
    throw error;
  }
}

async function createCompetitorAlert(
  supabase: any,
  alertData: Partial<CompetitorAlert>
) {
  try {
    const { data, error } = await supabase
      .from("competitor_alerts")
      .insert(alertData)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data[0],
      message: "Alert created successfully",
    });
  } catch (error) {
    throw error;
  }
}

async function analyzeCompetitorPerformance(
  supabase: any,
  analysisRequest: any
) {
  try {
    const { competitor_id, metrics, timeframe } = analysisRequest;

    // Get competitor historical data
    const { data: historicalData, error } = await supabase
      .from("competitor_data")
      .select("*")
      .eq("id", competitor_id)
      .order("last_scraped", { ascending: false });

    if (error) throw error;

    // Perform analysis
    const analysis = {
      performance_trend: calculatePerformanceTrend(historicalData || []),
      engagement_analysis: analyzeEngagementPatterns(historicalData || []),
      content_strategy: analyzeContentStrategy(historicalData || []),
      recommendations: generateCompetitorRecommendations(historicalData || []),
    };

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    throw error;
  }
}

// Helper functions
function calculatePerformanceGap(competitorMetrics: any, ownMetrics: any) {
  const gaps = {
    engagement_rate:
      competitorMetrics.engagement_rate - (ownMetrics.engagement_rate || 0),
    avg_likes: competitorMetrics.avg_likes - (ownMetrics.avg_likes || 0),
    avg_comments:
      competitorMetrics.avg_comments - (ownMetrics.avg_comments || 0),
    post_frequency:
      competitorMetrics.post_frequency - (ownMetrics.post_frequency || 0),
  };

  return gaps;
}

function generateRecommendations(competitorMetrics: any, ownMetrics: any) {
  const recommendations = [];

  if (
    competitorMetrics.engagement_rate >
    (ownMetrics.engagement_rate || 0) * 1.2
  ) {
    recommendations.push({
      type: "engagement",
      priority: "high",
      message:
        "Competitor heeft significant hogere engagement rates. Analyseer hun content strategie.",
    });
  }

  if (
    competitorMetrics.post_frequency >
    (ownMetrics.post_frequency || 0) * 1.5
  ) {
    recommendations.push({
      type: "frequency",
      priority: "medium",
      message:
        "Competitor post veel vaker. Overweeg het verhogen van je posting frequentie.",
    });
  }

  return recommendations;
}

function analyzeTrends(data: CompetitorData[]) {
  // Group by platform and calculate trends
  const platforms = [...new Set(data.map(d => d.platform))];

  return platforms.map(platform => {
    const platformData = data.filter(d => d.platform === platform);
    return {
      platform,
      competitor_count: platformData.length,
      avg_engagement:
        platformData.reduce((sum, d) => sum + d.metrics.engagement_rate, 0) /
        platformData.length,
      top_performer: platformData.sort(
        (a, b) => b.metrics.engagement_rate - a.metrics.engagement_rate
      )[0],
    };
  });
}

function calculatePlatformBreakdown(competitors: CompetitorData[]) {
  const breakdown = competitors.reduce(
    (acc, competitor) => {
      acc[competitor.platform] = (acc[competitor.platform] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(breakdown).map(([platform, count]) => ({
    platform,
    count,
    percentage: (count / competitors.length) * 100,
  }));
}

async function simulateDataScraping(
  config: ScrapingConfig
): Promise<CompetitorData[]> {
  // This would integrate with actual scraping tools or APIs
  // For now, return mock data
  return [
    {
      id: "comp-1",
      name: "Competitor A",
      platform: config.platform,
      url: "https://example.com/competitor-a",
      metrics: {
        followers: Math.floor(Math.random() * 100000),
        engagement_rate: Math.random() * 10,
        avg_likes: Math.floor(Math.random() * 1000),
        avg_comments: Math.floor(Math.random() * 100),
        avg_shares: Math.floor(Math.random() * 50),
        post_frequency: Math.floor(Math.random() * 7),
        content_performance: Math.random() * 100,
      },
      last_scraped: new Date().toISOString(),
      status: "active",
    },
  ];
}

async function checkForAlerts(
  results: CompetitorData[],
  thresholds: any
): Promise<Partial<CompetitorAlert>[]> {
  const alerts = [];

  for (const result of results) {
    if (result.metrics.engagement_rate > thresholds.engagement_spike) {
      alerts.push({
        competitor_id: result.id,
        alert_type: "performance_spike",
        severity: "high",
        message: `${result.name} heeft een engagement spike van ${result.metrics.engagement_rate}%`,
        threshold_value: thresholds.engagement_spike,
        current_value: result.metrics.engagement_rate,
        percentage_change:
          ((result.metrics.engagement_rate - thresholds.engagement_spike) /
            thresholds.engagement_spike) *
          100,
        created_at: new Date().toISOString(),
        acknowledged: false,
      });
    }
  }

  return alerts;
}

function calculatePerformanceTrend(data: CompetitorData[]) {
  if (data.length < 2) return { trend: "insufficient_data", change: 0 };

  const latest = data[0];
  const previous = data[1];

  const change =
    ((latest.metrics.engagement_rate - previous.metrics.engagement_rate) /
      previous.metrics.engagement_rate) *
    100;

  return {
    trend: change > 0 ? "increasing" : change < 0 ? "decreasing" : "stable",
    change: Math.abs(change),
    direction: change > 0 ? "up" : change < 0 ? "down" : "stable",
  };
}

function analyzeEngagementPatterns(data: CompetitorData[]) {
  const patterns = {
    avg_engagement:
      data.reduce((sum, d) => sum + d.metrics.engagement_rate, 0) / data.length,
    peak_engagement: Math.max(...data.map(d => d.metrics.engagement_rate)),
    engagement_consistency: calculateConsistency(
      data.map(d => d.metrics.engagement_rate)
    ),
  };

  return patterns;
}

function analyzeContentStrategy(data: CompetitorData[]) {
  const strategy = {
    posting_frequency:
      data.reduce((sum, d) => sum + d.metrics.post_frequency, 0) / data.length,
    content_variety: calculateContentVariety(data),
    engagement_optimization: calculateEngagementOptimization(data),
  };

  return strategy;
}

function generateCompetitorRecommendations(data: CompetitorData[]) {
  const recommendations = [];

  const avgEngagement =
    data.reduce((sum, d) => sum + d.metrics.engagement_rate, 0) / data.length;

  if (avgEngagement > 5) {
    recommendations.push({
      type: "high_performer",
      message:
        "Deze concurrent toont consistente hoge engagement. Analyseer hun content types en timing.",
    });
  }

  return recommendations;
}

function calculateConsistency(values: number[]) {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function calculateContentVariety(data: CompetitorData[]) {
  // This would analyze content types, hashtags, etc.
  return Math.random() * 100; // Mock implementation
}

function calculateEngagementOptimization(data: CompetitorData[]) {
  // This would analyze posting times, content formats, etc.
  return Math.random() * 100; // Mock implementation
}
