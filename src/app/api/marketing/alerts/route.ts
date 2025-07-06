import { NextRequest, NextResponse } from "next/server";

// Marketing Alert Types
interface MarketingAlert {
  id: string;
  type: "critical" | "warning" | "opportunity" | "info";
  category: "roi" | "budget" | "conversion" | "campaign" | "trend" | "anomaly";
  title: string;
  description: string;
  metric_value: number;
  threshold_value: number;
  metric_name: string;
  severity: "low" | "medium" | "high" | "critical";
  triggered_at: string;
  campaign_id?: string;
  channel?: string;
  auto_resolve: boolean;
  status: "active" | "acknowledged" | "resolved";
  recommended_actions: string[];
  confidence_score: number;
}

interface AlertThresholds {
  roi_critical: number;
  roi_warning: number;
  roas_critical: number;
  conversion_drop: number;
  budget_utilization: number;
  cpa_spike: number;
  spend_anomaly: number;
  opportunity_roi: number;
}

interface AlertStatistics {
  total_alerts: number;
  critical_alerts: number;
  active_alerts: number;
  resolved_today: number;
  avg_resolution_time: number;
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  roi_critical: 50,
  roi_warning: 100,
  roas_critical: 2.0,
  conversion_drop: 25,
  budget_utilization: 85,
  cpa_spike: 50,
  spend_anomaly: 2.0,
  opportunity_roi: 300,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "get_active_alerts":
        return await getActiveAlerts();
      case "get_statistics":
        return await getAlertStatistics();
      case "get_thresholds":
        return await getAlertThresholds();
      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action parameter",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in marketing alerts API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "acknowledge_alert":
        return await acknowledgeAlert(body);
      case "resolve_alert":
        return await resolveAlert(body);
      case "create_alert":
        return await createAlert(body);
      case "update_thresholds":
        return await updateAlertThresholds(body);
      case "test_alert_system":
        return await testAlertSystem();
      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action parameter",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in marketing alerts POST API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function getActiveAlerts(): Promise<NextResponse> {
  try {
    // In a real implementation, this would query the database
    // For now, return comprehensive sample data
    const alerts = await generateMarketingAlerts();

    return NextResponse.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error("Error getting active alerts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get active alerts" },
      { status: 500 }
    );
  }
}

async function getAlertStatistics(): Promise<NextResponse> {
  try {
    const stats: AlertStatistics = {
      total_alerts: 247,
      critical_alerts: 3,
      active_alerts: 12,
      resolved_today: 8,
      avg_resolution_time: 45,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting alert statistics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get alert statistics" },
      { status: 500 }
    );
  }
}

async function getAlertThresholds(): Promise<NextResponse> {
  try {
    return NextResponse.json({
      success: true,
      data: DEFAULT_THRESHOLDS,
    });
  } catch (error) {
    console.error("Error getting alert thresholds:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get alert thresholds" },
      { status: 500 }
    );
  }
}

async function acknowledgeAlert(body: any): Promise<NextResponse> {
  try {
    const { alertId, acknowledgedBy } = body;

    // In a real implementation, update the database
    console.log(`Alert ${alertId} acknowledged by ${acknowledgedBy}`);

    return NextResponse.json({
      success: true,
      message: `Alert ${alertId} acknowledged successfully`,
    });
  } catch (error) {
    console.error("Error acknowledging alert:", error);
    return NextResponse.json(
      { success: false, error: "Failed to acknowledge alert" },
      { status: 500 }
    );
  }
}

async function resolveAlert(body: any): Promise<NextResponse> {
  try {
    const { alertId, resolvedBy } = body;

    // In a real implementation, update the database
    console.log(`Alert ${alertId} resolved by ${resolvedBy}`);

    return NextResponse.json({
      success: true,
      message: `Alert ${alertId} resolved successfully`,
    });
  } catch (error) {
    console.error("Error resolving alert:", error);
    return NextResponse.json(
      { success: false, error: "Failed to resolve alert" },
      { status: 500 }
    );
  }
}

async function createAlert(body: any): Promise<NextResponse> {
  try {
    const alert = body.alert;

    // In a real implementation, save to database and trigger notifications
    console.log("Creating new marketing alert:", alert);

    return NextResponse.json({
      success: true,
      message: "Alert created successfully",
      alertId: alert.id,
    });
  } catch (error) {
    console.error("Error creating alert:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create alert" },
      { status: 500 }
    );
  }
}

async function updateAlertThresholds(body: any): Promise<NextResponse> {
  try {
    const { thresholds } = body;

    // In a real implementation, save to database
    console.log("Updating alert thresholds:", thresholds);

    return NextResponse.json({
      success: true,
      message: "Alert thresholds updated successfully",
    });
  } catch (error) {
    console.error("Error updating alert thresholds:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update alert thresholds" },
      { status: 500 }
    );
  }
}

async function testAlertSystem(): Promise<NextResponse> {
  try {
    // Test the alert system by generating sample alerts
    const testAlerts = await generateMarketingAlerts();

    return NextResponse.json({
      success: true,
      message: "Alert system test completed",
      data: {
        test_alerts_generated: testAlerts.length,
        system_status: "operational",
        notification_channels: ["dashboard", "email", "slack", "telegram"],
        last_test_run: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error testing alert system:", error);
    return NextResponse.json(
      { success: false, error: "Failed to test alert system" },
      { status: 500 }
    );
  }
}

async function generateMarketingAlerts(): Promise<MarketingAlert[]> {
  const now = new Date();

  return [
    {
      id: "alert-001",
      type: "critical",
      category: "roi",
      title: "Kritiek lage ROI - Google Ads Campagne",
      description:
        'De "Summer Sale 2024" campagne heeft een ROI van slechts 45%, ver onder de 100% doelstelling. Directe actie vereist om budget verlies te voorkomen.',
      metric_value: 45,
      threshold_value: 100,
      metric_name: "ROI Percentage",
      severity: "critical",
      triggered_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      campaign_id: "camp-001",
      channel: "google_ads",
      auto_resolve: false,
      status: "active",
      recommended_actions: [
        "Pauzeer onderperformerende keywords onmiddellijk",
        "Optimaliseer ad copy en landing pages met urgentie",
        "Verhoog biedingen op high-performing keywords",
        "Review en verfijn doelgroep targeting parameters",
        "Implementeer negatieve keywords om irrelevante traffic te filteren",
      ],
      confidence_score: 0.92,
    },
    {
      id: "alert-002",
      type: "warning",
      category: "budget",
      title: "Budget bijna opgebruikt - Facebook Campagne",
      description:
        'De "Brand Awareness Q3" campagne heeft 88% van het budget gebruikt met nog 8 dagen te gaan. Budget reallocation kan nodig zijn.',
      metric_value: 88,
      threshold_value: 85,
      metric_name: "Budget Utilization Percentage",
      severity: "medium",
      triggered_at: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
      campaign_id: "camp-002",
      channel: "facebook_ads",
      auto_resolve: false,
      status: "active",
      recommended_actions: [
        "Verhoog dagelijks budget als performance targets worden behaald",
        "Evalueer campaign performance tegen KPI targets",
        "Overweeg budget reallocation van onderperformerende campagnes",
        "Monitor daily spend rate en pas indien nodig aan",
      ],
      confidence_score: 0.87,
    },
    {
      id: "alert-003",
      type: "opportunity",
      category: "roi",
      title: "Hoge Performance Opportunity - LinkedIn Ads",
      description:
        'De "B2B Lead Gen" campagne presteert exceptionally met 425% ROI - significante kans voor budget verhoging en scale-up.',
      metric_value: 425,
      threshold_value: 300,
      metric_name: "ROI Percentage",
      severity: "low",
      triggered_at: new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
      campaign_id: "camp-003",
      channel: "linkedin_ads",
      auto_resolve: true,
      status: "active",
      recommended_actions: [
        "Verhoog budget met 50-100% voor maximale ROI exploitatie",
        "Duplicate high-performing ad sets naar vergelijkbare doelgroepen",
        "Expand naar lookalike audiences gebaseerd op top converters",
        "Test verhoogde biedingen voor premium placements",
      ],
      confidence_score: 0.96,
    },
    {
      id: "alert-004",
      type: "warning",
      category: "conversion",
      title: "Significante Conversion Rate Daling - Email Campaign",
      description:
        "Email conversion rate is drastisch gedaald van 4.2% naar 2.8% (-33%) in de laatste 48 uur. Mogelijk deliverability of content issue.",
      metric_value: 2.8,
      threshold_value: 4.2,
      metric_name: "Email Conversion Rate",
      severity: "medium",
      triggered_at: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
      campaign_id: "camp-004",
      channel: "email",
      auto_resolve: false,
      status: "active",
      recommended_actions: [
        "Check email deliverability rates en sender reputation",
        "Review recente email content changes en A/B test resultaten",
        "Analyze recipient engagement patterns en segmentatie",
        "Test verschillende CTA buttons, subject lines en send times",
        "Verificeer email list hygiene en remove inactive subscribers",
      ],
      confidence_score: 0.84,
    },
    {
      id: "alert-005",
      type: "info",
      category: "trend",
      title: "Positieve Mobile Conversion Trend",
      description:
        "Mobile conversions zijn 15% gestegen week-over-week, mogelijk door verbeterde mobiele gebruikerservaring en snelere load times.",
      metric_value: 115,
      threshold_value: 110,
      metric_name: "Mobile Conversion Index",
      severity: "low",
      triggered_at: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
      auto_resolve: true,
      status: "active",
      recommended_actions: [
        "Monitor trend continuïteit over langere periode",
        "Verhoog mobile-specific ad spend als trend aanhoudt",
        "Optimaliseer desktop ervaring op basis van mobile learnings",
        "Implementeer mobile-first design principes verder",
      ],
      confidence_score: 0.78,
    },
    {
      id: "alert-006",
      type: "critical",
      category: "anomaly",
      title: "Abnormale CPA Stijging - TikTok Ads",
      description:
        "Cost per acquisition is gestegen van €45 naar €89 (+98%) binnen 24 uur. Mogelijk bid war of targeting issue.",
      metric_value: 89,
      threshold_value: 45,
      metric_name: "Cost Per Acquisition (CPA)",
      severity: "critical",
      triggered_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      campaign_id: "camp-005",
      channel: "tiktok_ads",
      auto_resolve: false,
      status: "active",
      recommended_actions: [
        "Onmiddellijk review van bid strategies en auction competition",
        "Analyseer doelgroep overlap met competitors",
        "Temporary bid reductie om costs te controleren",
        "Evalueer creative performance en refresh ad content",
        "Check voor platform algorithm changes of policy updates",
      ],
      confidence_score: 0.91,
    },
    {
      id: "alert-007",
      type: "opportunity",
      category: "trend",
      title: "Opkomende Keyword Opportunity - SEO",
      description:
        "Nieuwe trending keywords in ons segment tonen 340% volume groei. Early adoption kans voor organic traffic boost.",
      metric_value: 340,
      threshold_value: 200,
      metric_name: "Keyword Volume Growth",
      severity: "low",
      triggered_at: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
      auto_resolve: true,
      status: "active",
      recommended_actions: [
        "Ontwikkel content targeting deze trending keywords",
        "Update bestaande paginas met relevante keyword integratie",
        "Creëer dedicated landing pages voor top opportunities",
        "Monitor competitor content strategies voor deze keywords",
      ],
      confidence_score: 0.83,
    },
    {
      id: "alert-008",
      type: "warning",
      category: "campaign",
      title: "Ad Fatigue Detected - Instagram Campaign",
      description:
        "CTR van Instagram ads is gedaald van 2.8% naar 1.4% over 7 dagen. Mogelijke ad fatigue bij doelgroep.",
      metric_value: 1.4,
      threshold_value: 2.8,
      metric_name: "Click-Through Rate (CTR)",
      severity: "medium",
      triggered_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      campaign_id: "camp-006",
      channel: "instagram_ads",
      auto_resolve: false,
      status: "active",
      recommended_actions: [
        "Refresh ad creatives met nieuwe visuals en copy",
        "Expand doelgroep naar lookalike audiences",
        "Test nieuwe ad formats (Reels, Stories, Collections)",
        "Implementeer frequency capping om overexposure te voorkomen",
        "Roteer ad sets om audience fatigue te minimaliseren",
      ],
      confidence_score: 0.88,
    },
  ];
}

// Real-time alert monitoring function (would be called by cron job or webhook)
async function monitorMarketingMetrics(): Promise<MarketingAlert[]> {
  const alerts: MarketingAlert[] = [];
  const thresholds = DEFAULT_THRESHOLDS;

  try {
    // This would typically fetch real campaign data from various sources
    // For now, simulate monitoring logic

    // Example: Monitor ROI thresholds
    const campaigns = await fetchCampaignMetrics();

    for (const campaign of campaigns) {
      // ROI Critical Alert
      if (campaign.roi < thresholds.roi_critical) {
        alerts.push(await createROIAlert(campaign, "critical"));
      }
      // ROI Warning Alert
      else if (campaign.roi < thresholds.roi_warning) {
        alerts.push(await createROIAlert(campaign, "warning"));
      }
      // ROI Opportunity Alert
      else if (campaign.roi > thresholds.opportunity_roi) {
        alerts.push(await createROIAlert(campaign, "opportunity"));
      }

      // Budget Utilization Alert
      const budgetUtil = (campaign.spent / campaign.budget) * 100;
      if (budgetUtil > thresholds.budget_utilization) {
        alerts.push(await createBudgetAlert(campaign, budgetUtil));
      }

      // Conversion Rate Drop Alert
      if (campaign.conversion_rate_change < -thresholds.conversion_drop) {
        alerts.push(await createConversionAlert(campaign));
      }
    }

    return alerts;
  } catch (error) {
    console.error("Error monitoring marketing metrics:", error);
    return [];
  }
}

async function fetchCampaignMetrics(): Promise<any[]> {
  // Mock campaign data - in real implementation, fetch from multiple sources
  return [
    {
      id: "camp-001",
      name: "Summer Sale 2024",
      channel: "google_ads",
      roi: 45,
      budget: 50000,
      spent: 35420,
      conversion_rate: 4.05,
      conversion_rate_change: -15,
      cpa: 227.05,
    },
    // Add more campaigns...
  ];
}

async function createROIAlert(
  campaign: any,
  type: "critical" | "warning" | "opportunity"
): Promise<MarketingAlert> {
  return {
    id: `roi-alert-${campaign.id}-${Date.now()}`,
    type,
    category: "roi",
    title: `ROI ${type} - ${campaign.name}`,
    description: `Campaign ROI is ${campaign.roi}%`,
    metric_value: campaign.roi,
    threshold_value: type === "critical" ? 50 : type === "warning" ? 100 : 300,
    metric_name: "ROI Percentage",
    severity:
      type === "critical" ? "critical" : type === "warning" ? "medium" : "low",
    triggered_at: new Date().toISOString(),
    campaign_id: campaign.id,
    channel: campaign.channel,
    auto_resolve: type === "opportunity",
    status: "active",
    recommended_actions: generateROIRecommendations(campaign, type),
    confidence_score: 0.9,
  };
}

async function createBudgetAlert(
  campaign: any,
  utilization: number
): Promise<MarketingAlert> {
  return {
    id: `budget-alert-${campaign.id}-${Date.now()}`,
    type: "warning",
    category: "budget",
    title: `Budget Alert - ${campaign.name}`,
    description: `Budget utilization is ${utilization.toFixed(1)}%`,
    metric_value: utilization,
    threshold_value: 85,
    metric_name: "Budget Utilization",
    severity: "medium",
    triggered_at: new Date().toISOString(),
    campaign_id: campaign.id,
    channel: campaign.channel,
    auto_resolve: false,
    status: "active",
    recommended_actions: [
      "Review campaign performance vs targets",
      "Consider budget reallocation if performing well",
      "Monitor daily spend rate closely",
    ],
    confidence_score: 0.85,
  };
}

async function createConversionAlert(campaign: any): Promise<MarketingAlert> {
  return {
    id: `conversion-alert-${campaign.id}-${Date.now()}`,
    type: "warning",
    category: "conversion",
    title: `Conversion Rate Drop - ${campaign.name}`,
    description: `Conversion rate dropped ${Math.abs(campaign.conversion_rate_change)}%`,
    metric_value: campaign.conversion_rate,
    threshold_value:
      campaign.conversion_rate *
      (1 + Math.abs(campaign.conversion_rate_change) / 100),
    metric_name: "Conversion Rate",
    severity: "medium",
    triggered_at: new Date().toISOString(),
    campaign_id: campaign.id,
    channel: campaign.channel,
    auto_resolve: false,
    status: "active",
    recommended_actions: [
      "Analyze recent changes to landing pages or ad copy",
      "Check for technical issues affecting conversion tracking",
      "Review audience targeting and adjust if needed",
      "Test different CTA elements and page layouts",
    ],
    confidence_score: 0.82,
  };
}

function generateROIRecommendations(
  campaign: any,
  type: "critical" | "warning" | "opportunity"
): string[] {
  if (type === "critical") {
    return [
      "Immediate pause of underperforming keywords/ads",
      "Emergency optimization of ad copy and landing pages",
      "Increase bids on high-performing keywords only",
      "Tighten audience targeting to reduce waste",
    ];
  } else if (type === "warning") {
    return [
      "Optimize underperforming ad elements",
      "Review and refine targeting parameters",
      "Test new ad copy variations",
      "Analyze competitor strategies",
    ];
  } else {
    return [
      "Increase budget to scale successful performance",
      "Duplicate high-performing ad sets",
      "Expand to similar audience segments",
      "Test higher bid strategies for premium placements",
    ];
  }
}
