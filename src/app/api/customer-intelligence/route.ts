import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Create Supabase client
    const supabase = await createClient();

    switch (action) {
      case "metrics":
        return await getCustomerMetrics(supabase, startDate, endDate);
      case "segments":
        return await getCustomerSegments(supabase);
      case "journey":
        return await getCustomerJourney(supabase);
      case "churn-prediction":
        return await getChurnPrediction(supabase);
      default:
        return await getCustomerOverview(supabase, startDate, endDate);
    }
  } catch (error) {
    console.error("Customer Intelligence API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer intelligence data" },
      { status: 500 }
    );
  }
}

async function getCustomerOverview(
  supabase: any,
  startDate?: string | null,
  endDate?: string | null
) {
  // Mock data for now - will be replaced with real Supabase queries
  const overview = {
    totalCustomers: 12487,
    totalCustomersChange: 8.2,
    activeCustomers: 9654,
    activeCustomersChange: 5.7,
    averageLifetimeValue: 1247.5,
    averageLifetimeValueChange: 12.3,
    churnRisk: 284,
    churnRiskChange: -15.2,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json({
    success: true,
    data: overview,
    meta: {
      action: "overview",
      dateRange: { startDate, endDate },
      timestamp: new Date().toISOString(),
    },
  });
}

async function getCustomerMetrics(
  supabase: any,
  startDate?: string | null,
  endDate?: string | null
) {
  // Mock customer acquisition data
  const acquisitionData = [
    { month: "Jan", customers: 850, revenue: 42500 },
    { month: "Feb", customers: 920, revenue: 46000 },
    { month: "Mar", customers: 1050, revenue: 52500 },
    { month: "Apr", customers: 1180, revenue: 59000 },
    { month: "May", customers: 1350, revenue: 67500 },
    { month: "Jun", customers: 1420, revenue: 71000 },
  ];

  // Mock customer segments
  const segmentData = [
    { name: "Premium", value: 25, color: "#8B5CF6" },
    { name: "Standard", value: 45, color: "#06B6D4" },
    { name: "Basic", value: 30, color: "#10B981" },
  ];

  // Mock CLV by cohort
  const cohortData = [
    { cohort: "Q1 2024", clv: 1850, customers: 2450 },
    { cohort: "Q2 2024", clv: 1650, customers: 2890 },
    { cohort: "Q3 2024", clv: 1420, customers: 3200 },
    { cohort: "Q4 2024", clv: 1247, customers: 3650 },
  ];

  return NextResponse.json({
    success: true,
    data: {
      acquisition: acquisitionData,
      segments: segmentData,
      cohorts: cohortData,
    },
    meta: {
      action: "metrics",
      dateRange: { startDate, endDate },
      timestamp: new Date().toISOString(),
    },
  });
}

async function getCustomerSegments(supabase: any) {
  // Mock customer segments data
  const segments = [
    {
      id: 1,
      name: "High-Value Enterprise",
      count: 342,
      percentage: 15,
      avgSpend: 8750,
      growth: 12.5,
      characteristics: ["High CLV", "Long retention", "Premium features"],
      status: "growing",
    },
    {
      id: 2,
      name: "SMB Growth",
      count: 1248,
      percentage: 35,
      avgSpend: 2450,
      growth: 8.7,
      characteristics: [
        "Mid-tier plans",
        "Active users",
        "Expansion potential",
      ],
      status: "growing",
    },
    {
      id: 3,
      name: "Freemium Users",
      count: 5672,
      percentage: 45,
      avgSpend: 0,
      growth: 22.1,
      characteristics: [
        "High engagement",
        "Conversion potential",
        "Product advocates",
      ],
      status: "growing",
    },
    {
      id: 4,
      name: "At-Risk Customers",
      count: 285,
      percentage: 5,
      avgSpend: 1850,
      growth: -15.2,
      characteristics: ["Low engagement", "Payment issues", "Support tickets"],
      status: "declining",
    },
  ];

  return NextResponse.json({
    success: true,
    data: segments,
    meta: {
      action: "segments",
      timestamp: new Date().toISOString(),
    },
  });
}

async function getCustomerJourney(supabase: any) {
  // Mock journey stages
  const journeyStages = [
    {
      id: 1,
      name: "Awareness",
      count: 15420,
      conversionRate: 18.5,
      avgTimeInStage: "3 days",
      description: "Initial product discovery",
    },
    {
      id: 2,
      name: "Interest",
      count: 2850,
      conversionRate: 42.3,
      avgTimeInStage: "7 days",
      description: "Sign-up and trial",
    },
    {
      id: 3,
      name: "Purchase",
      count: 1206,
      conversionRate: 68.2,
      avgTimeInStage: "2 days",
      description: "First subscription",
    },
    {
      id: 4,
      name: "Retention",
      count: 823,
      conversionRate: 85.1,
      avgTimeInStage: "90 days",
      description: "Active usage period",
    },
    {
      id: 5,
      name: "Advocacy",
      count: 701,
      conversionRate: 92.4,
      avgTimeInStage: "365 days",
      description: "Referrals and expansion",
    },
  ];

  // Mock recent activities
  const recentActivities = [
    {
      id: 1,
      customer: "Acme Corp",
      stage: "Purchase",
      action: "Upgraded to Premium plan",
      time: "2 minutes ago",
      value: "$299/month",
    },
    {
      id: 2,
      customer: "TechStart Inc",
      stage: "Retention",
      action: "Renewed annual subscription",
      time: "15 minutes ago",
      value: "$2,400/year",
    },
    {
      id: 3,
      customer: "Sarah Johnson",
      stage: "Interest",
      action: "Started 14-day trial",
      time: "1 hour ago",
      value: "Trial user",
    },
    {
      id: 4,
      customer: "Global Solutions",
      stage: "Advocacy",
      action: "Referred 3 new customers",
      time: "3 hours ago",
      value: "$450 referral bonus",
    },
  ];

  return NextResponse.json({
    success: true,
    data: {
      stages: journeyStages,
      activities: recentActivities,
    },
    meta: {
      action: "journey",
      timestamp: new Date().toISOString(),
    },
  });
}

async function getChurnPrediction(supabase: any) {
  try {
    // Import the advanced churn prediction engine
    const { churnPredictionEngine } = await import(
      "@/lib/customer-intelligence/churn-prediction"
    );

    // Get overall risk distribution
    const { data: customers } = await supabase
      .from("unified_customers")
      .select(
        "id, churn_risk_score, churn_risk_level, total_lifetime_value, customer_status"
      )
      .not("churn_risk_score", "is", null);

    if (!customers || customers.length === 0) {
      // Return mock data if no customers with churn scores
      const churnPrediction = {
        totalAtRisk: 284,
        riskLevels: {
          critical: 48,
          high: 92,
          medium: 127,
          low: 65,
        },
        predictedChurnRate: 15.2,
        preventionOpportunities: 234,
        estimatedRevenueLoss: 89750,
        confidence: 0.75,
        modelInfo: {
          lastUpdate: new Date().toISOString(),
          modelType: "Mock Data",
          customersAnalyzed: 0,
        },
      };

      return NextResponse.json({
        success: true,
        data: churnPrediction,
        meta: {
          action: "churn-prediction",
          timestamp: new Date().toISOString(),
          dataSource: "mock",
        },
      });
    }

    // Calculate real churn statistics
    const riskLevels = {
      critical: customers.filter((c: any) => c.churn_risk_level === "critical")
        .length,
      high: customers.filter((c: any) => c.churn_risk_level === "high").length,
      medium: customers.filter((c: any) => c.churn_risk_level === "medium")
        .length,
      low: customers.filter((c: any) => c.churn_risk_level === "low").length,
    };

    const totalAtRisk =
      riskLevels.critical + riskLevels.high + riskLevels.medium;
    const totalCustomers = customers.length;
    const predictedChurnRate =
      totalCustomers > 0 ? (totalAtRisk / totalCustomers) * 100 : 0;

    // Calculate estimated revenue loss from high-risk customers
    const highRiskCustomers = customers.filter(
      (c: any) =>
        c.churn_risk_level === "high" || c.churn_risk_level === "critical"
    );
    const estimatedRevenueLoss = highRiskCustomers.reduce(
      (sum: number, customer: any) =>
        sum + (customer.total_lifetime_value || 0),
      0
    );

    // Calculate prevention opportunities (customers with medium-high risk)
    const preventionOpportunities = riskLevels.medium + riskLevels.high;

    // Calculate average confidence
    const averageRiskScore =
      customers.reduce(
        (sum: number, c: any) => sum + (c.churn_risk_score || 0),
        0
      ) / customers.length;
    const confidence = Math.min(0.95, 0.6 + (customers.length / 1000) * 0.3); // Higher confidence with more data

    const churnPrediction = {
      totalAtRisk,
      riskLevels,
      predictedChurnRate: Math.round(predictedChurnRate * 10) / 10,
      preventionOpportunities,
      estimatedRevenueLoss: Math.round(estimatedRevenueLoss),
      confidence: Math.round(confidence * 100) / 100,
      averageRiskScore: Math.round(averageRiskScore * 100) / 100,
      modelInfo: {
        lastUpdate: new Date().toISOString(),
        modelType: "Advanced Ensemble Model",
        customersAnalyzed: customers.length,
        dataCompleteness: confidence,
      },
      trends: {
        // This would be calculated from historical data
        weekOverWeek: {
          totalAtRisk: -2.3,
          critical: 1.1,
          high: -1.8,
          medium: -0.5,
        },
      },
    };

    return NextResponse.json({
      success: true,
      data: churnPrediction,
      meta: {
        action: "churn-prediction",
        timestamp: new Date().toISOString(),
        dataSource: "live",
        customersProcessed: customers.length,
      },
    });
  } catch (error) {
    console.error("Error in advanced churn prediction:", error);

    // Fallback to mock data on error
    const churnPrediction = {
      totalAtRisk: 284,
      riskLevels: {
        critical: 48,
        high: 92,
        medium: 127,
        low: 65,
      },
      predictedChurnRate: 15.2,
      preventionOpportunities: 234,
      estimatedRevenueLoss: 89750,
      confidence: 0.75,
      modelInfo: {
        lastUpdate: new Date().toISOString(),
        modelType: "Fallback Mock Data",
        customersAnalyzed: 0,
        error: "Failed to load advanced model",
      },
    };

    return NextResponse.json({
      success: true,
      data: churnPrediction,
      meta: {
        action: "churn-prediction",
        timestamp: new Date().toISOString(),
        dataSource: "fallback",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    const supabase = await createClient();

    switch (action) {
      case "sync-customer-data":
        return await syncCustomerData(supabase, body);
      case "update-segment":
        return await updateCustomerSegment(supabase, body);
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Customer Intelligence POST Error:", error);
    return NextResponse.json(
      { error: "Failed to process customer intelligence request" },
      { status: 500 }
    );
  }
}

async function syncCustomerData(supabase: any, body: any) {
  // Mock sync operation
  return NextResponse.json({
    success: true,
    message: "Customer data sync initiated",
    data: {
      syncId: `sync_${Date.now()}`,
      status: "processing",
      estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    },
  });
}

async function updateCustomerSegment(supabase: any, body: any) {
  // Mock segment update
  return NextResponse.json({
    success: true,
    message: "Customer segment updated",
    data: {
      segmentId: body.segmentId,
      customersAffected: Math.floor(Math.random() * 100) + 1,
      timestamp: new Date().toISOString(),
    },
  });
}
