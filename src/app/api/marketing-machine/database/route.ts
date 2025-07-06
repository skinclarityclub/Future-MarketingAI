import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "status";

    switch (action) {
      case "status":
        return await getDatabaseStatus(supabase);
      case "sample-data":
        return await generateSampleData(supabase);
      case "tables":
        return await getTableInfo(supabase);
      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Marketing Machine Database API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

async function getDatabaseStatus(supabase: any) {
  const tables = [
    "content_posts",
    "social_accounts",
    "content_calendar",
    "content_analytics",
    "content_research",
    "learning_patterns",
  ];

  const status = [];

  for (const table of tables) {
    try {
      const { count } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });

      status.push({
        table,
        exists: true,
        rowCount: count || 0,
      });
    } catch (error) {
      status.push({
        table,
        exists: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      tables: status,
      summary: {
        totalTables: tables.length,
        existingTables: status.filter(t => t.exists).length,
        totalRows: status.reduce((sum, t) => sum + (t.rowCount || 0), 0),
      },
    },
    message: "Database status retrieved successfully",
  });
}

async function generateSampleData(supabase: any) {
  try {
    // 1. Sample Social Accounts
    const { data: existingAccounts } = await supabase
      .from("social_accounts")
      .select("id")
      .limit(1);

    if (!existingAccounts || existingAccounts.length === 0) {
      const sampleAccounts = [
        {
          account_name: "SKC Business Facebook",
          platform: "facebook",
          platform_account_id: "fb_skc_business_2025",
          username: "skcbusiness",
          display_name: "SKC Business Intelligence",
          status: "connected",
          followers_count: 15420,
          engagement_rate: 4.8,
          posting_enabled: true,
          auto_posting_enabled: false,
          account_type: "business",
          business_category: "Technology",
          is_verified: true,
          country: "Netherlands",
          timezone: "Europe/Amsterdam",
        },
        {
          account_name: "SKC Business Instagram",
          platform: "instagram",
          platform_account_id: "ig_skc_business_2025",
          username: "@skcbusiness",
          display_name: "SKC Business Intelligence",
          status: "connected",
          followers_count: 8930,
          engagement_rate: 6.2,
          posting_enabled: true,
          auto_posting_enabled: true,
          account_type: "business",
          business_category: "Technology",
          is_verified: false,
          country: "Netherlands",
          timezone: "Europe/Amsterdam",
        },
        {
          account_name: "SKC Company LinkedIn",
          platform: "linkedin",
          platform_account_id: "li_skc_company_2025",
          username: "skc-company",
          display_name: "SKC - Business Intelligence Solutions",
          status: "connected",
          followers_count: 3450,
          engagement_rate: 3.9,
          posting_enabled: true,
          auto_posting_enabled: false,
          account_type: "business",
          business_category: "Software Development",
          is_verified: true,
          country: "Netherlands",
          timezone: "Europe/Amsterdam",
        },
      ];

      await supabase.from("social_accounts").insert(sampleAccounts);
    }

    // 2. Sample Content Posts
    const { data: existingPosts } = await supabase
      .from("content_posts")
      .select("id")
      .limit(1);

    if (!existingPosts || existingPosts.length === 0) {
      const samplePosts = [
        {
          title: "🚀 AI-Powered BI Dashboard Launch",
          content:
            "Excited to announce our new AI-powered Business Intelligence Dashboard! Transform your data into actionable insights with cutting-edge machine learning algorithms. #AI #BusinessIntelligence #DataAnalytics #Innovation",
          content_type: "post",
          status: "published",
          target_platforms: ["facebook", "instagram", "linkedin"],
          hashtags: [
            "#AI",
            "#BusinessIntelligence",
            "#DataAnalytics",
            "#Innovation",
          ],
          ai_generated: false,
          engagement_prediction: 92.5,
          target_audience: "Business executives and data professionals",
          content_category: "product_announcement",
          tone: "professional",
          is_ab_test: false,
          total_engagement: 1247,
          total_reach: 18650,
          total_impressions: 25430,
          performance_score: 88.7,
          published_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        },
        {
          title: "📊 Data Visualization Best Practices",
          content:
            "Creating effective data visualizations is an art and science. Here are our top 5 tips for making your dashboards more impactful:\n\n1. Choose the right chart type\n2. Use consistent color schemes\n3. Minimize cognitive load\n4. Tell a story with your data\n5. Make it interactive\n\nWhat's your favorite visualization technique? 💭",
          content_type: "post",
          status: "scheduled",
          target_platforms: ["linkedin", "twitter"],
          hashtags: [
            "#DataVisualization",
            "#Dashboard",
            "#BestPractices",
            "#DataScience",
          ],
          ai_generated: true,
          ai_prompt:
            "Create an educational post about data visualization best practices",
          engagement_prediction: 76.3,
          target_audience: "Data analysts and visualization specialists",
          content_category: "educational",
          tone: "educational",
          is_ab_test: false,
          scheduled_date: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        },
        {
          title: "🎯 Marketing ROI Calculator",
          content:
            "Struggling to measure your marketing ROI? Our new calculator helps you:\n\n✅ Track campaign performance\n✅ Calculate customer acquisition costs\n✅ Measure lifetime value\n✅ Optimize budget allocation\n\nTry it free: [link in bio] 🔗",
          content_type: "post",
          status: "draft",
          target_platforms: ["instagram", "facebook"],
          hashtags: [
            "#MarketingROI",
            "#Calculator",
            "#FreeTool",
            "#MarketingAnalytics",
          ],
          ai_generated: true,
          ai_prompt:
            "Create a promotional post for marketing ROI calculator tool",
          engagement_prediction: 84.1,
          target_audience: "Marketing managers and CMOs",
          content_category: "promotional",
          tone: "promotional",
          is_ab_test: true,
        },
      ];

      await supabase.from("content_posts").insert(samplePosts);
    }

    // 3. Sample Content Calendar
    const { data: existingCalendar } = await supabase
      .from("content_calendar")
      .select("id")
      .limit(1);

    if (!existingCalendar || existingCalendar.length === 0) {
      const sampleCalendarEntries = [
        {
          title: "Weekly Newsletter: BI Trends",
          description:
            "Curate and send weekly newsletter about latest BI trends",
          calendar_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          time_slot: "09:00:00",
          content_type: "email",
          target_platforms: ["email"],
          status: "planned",
          priority: "high",
          auto_generated: true,
          ai_suggestions: {
            content_themes: [
              "AI in BI",
              "Real-time analytics",
              "Data governance",
            ],
            optimal_time: "09:00 AM Tuesday",
            expected_open_rate: "24.5%",
          },
          is_recurring: true,
          expected_engagement: 850,
          target_audience: "BI professionals and executives",
          content_theme: "industry_trends",
          tags: ["newsletter", "weekly", "trends"],
        },
        {
          title: "Product Demo Video Recording",
          description:
            "Record comprehensive product demo for YouTube and LinkedIn",
          calendar_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          time_slot: "14:00:00",
          duration_minutes: 120,
          content_type: "video",
          target_platforms: ["youtube", "linkedin"],
          status: "planned",
          priority: "medium",
          auto_generated: false,
          expected_engagement: 2500,
          target_audience: "Potential customers and partners",
          content_theme: "product_demo",
          notes: "Include new AI features and Fortune 500 use cases",
          tags: ["demo", "video", "product"],
        },
      ];

      await supabase.from("content_calendar").insert(sampleCalendarEntries);
    }

    return NextResponse.json({
      success: true,
      data: {
        message: "Sample data generated successfully",
        generated: {
          social_accounts: 3,
          content_posts: 3,
          content_calendar: 2,
        },
      },
      message: "Marketing Machine sample data created",
    });
  } catch (error) {
    console.error("Sample data generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate sample data",
      },
      { status: 500 }
    );
  }
}

async function getTableInfo(supabase: any) {
  const tables = ["content_posts", "social_accounts", "content_calendar"];
  const tableInfo = [];

  for (const table of tables) {
    try {
      const { data, count } = await supabase
        .from(table)
        .select("*", { count: "exact" })
        .limit(5);

      tableInfo.push({
        table,
        rowCount: count || 0,
        sampleData: data || [],
        schema: "Available",
      });
    } catch (error) {
      tableInfo.push({
        table,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    success: true,
    data: tableInfo,
    message: "Table information retrieved successfully",
  });
}
