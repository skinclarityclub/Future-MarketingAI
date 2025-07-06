import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "list";

    switch (action) {
      case "list":
        return await getContentPosts(supabase);
      case "create-samples":
        return await createSamplePosts(supabase);
      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Content Posts API Error:", error);
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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from("content_posts")
      .insert(body)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      message: "Content post created successfully",
    });
  } catch (error) {
    console.error("Create content post error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create content post",
      },
      { status: 500 }
    );
  }
}

async function getContentPosts(supabase: any) {
  try {
    const { data, error, count } = await supabase
      .from("content_posts")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: {
        posts: data || [],
        total: count || 0,
      },
      message: "Content posts retrieved successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve content posts",
      },
      { status: 500 }
    );
  }
}

async function createSamplePosts(supabase: any) {
  try {
    // Check if we already have posts
    const { count } = await supabase
      .from("content_posts")
      .select("*", { count: "exact", head: true });

    if (count && count > 0) {
      return NextResponse.json({
        success: true,
        message: "Sample posts already exist",
        data: { existing_posts: count },
      });
    }

    const samplePosts = [
      {
        title: "🚀 AI-Powered BI Dashboard Launch",
        content:
          "Excited to announce our new AI-powered Business Intelligence Dashboard! Transform your data into actionable insights with cutting-edge machine learning algorithms. Perfect for Fortune 500 companies looking to scale their analytics capabilities. #AI #BusinessIntelligence #DataAnalytics #Innovation #Fortune500",
        content_type: "post",
        status: "published",
        excerpt:
          "Introducing our revolutionary AI-powered BI Dashboard for enterprise clients",
        target_platforms: ["facebook", "instagram", "linkedin"],
        hashtags: [
          "#AI",
          "#BusinessIntelligence",
          "#DataAnalytics",
          "#Innovation",
          "#Fortune500",
        ],
        ai_generated: false,
        engagement_prediction: 92.5,
        target_audience: "Fortune 500 executives and data professionals",
        content_category: "product_announcement",
        tone: "professional",
        is_ab_test: false,
        total_engagement: 1247,
        total_reach: 18650,
        total_impressions: 25430,
        performance_score: 88.7,
        published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "📊 Marketing Machine: Content Creation Revolution",
        content:
          "The future of content marketing is here! Our Marketing Machine platform automates the entire content lifecycle:\n\n✅ AI-powered ideation\n✅ Multi-platform publishing\n✅ Real-time analytics\n✅ A/B testing automation\n✅ ROI optimization\n\nScale your content strategy from €300K to millions in revenue. Book a demo today! 🎯",
        content_type: "post",
        status: "scheduled",
        excerpt:
          "Revolutionary Marketing Machine platform for automated content creation",
        target_platforms: ["linkedin", "twitter", "facebook"],
        hashtags: [
          "#MarketingMachine",
          "#ContentAutomation",
          "#MarketingROI",
          "#ScaleUp",
          "#AIMarketing",
        ],
        ai_generated: true,
        ai_prompt:
          "Create a promotional post about Marketing Machine platform targeting scale-up companies",
        engagement_prediction: 85.3,
        target_audience: "Scale-up marketing managers and CMOs",
        content_category: "promotional",
        tone: "promotional",
        is_ab_test: true,
        scheduled_date: new Date(Date.now() + 2 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        scheduled_time: "14:00:00",
      },
      {
        title:
          "🎯 Fortune 500 Success Story: 10M+ Marketing Budget Optimization",
        content:
          "Case Study: How a Fortune 500 company achieved 340% ROI improvement using our integrated BI + Marketing Machine platform.\n\n📈 Results:\n• €10M+ marketing budget optimized\n• 340% ROI improvement\n• 85% reduction in manual work\n• Real-time decision making\n• Cross-platform attribution\n\nReady to transform your marketing operations? Let's talk. 💼",
        content_type: "post",
        status: "draft",
        excerpt: "Fortune 500 case study showing 340% ROI improvement",
        target_platforms: ["linkedin", "facebook"],
        hashtags: [
          "#Fortune500",
          "#CaseStudy",
          "#MarketingROI",
          "#Success",
          "#Enterprise",
        ],
        ai_generated: true,
        ai_prompt:
          "Create a case study post about Fortune 500 success with our platform",
        engagement_prediction: 94.7,
        target_audience: "Fortune 500 executives and procurement teams",
        content_category: "case_study",
        tone: "professional",
        is_ab_test: false,
      },
      {
        title: "🔥 Limited Time: Marketing Machine + BI Dashboard Bundle",
        content:
          "SPECIAL OFFER: Get both Marketing Machine (€15K/month) + BI Dashboard (€10K/month) for just €20K/month - save €5K monthly! 💰\n\n🎁 Bonus: Free 8-week onboarding + dedicated CSM\n\n⏰ Offer expires June 30th\n\nPerfect for companies with €300K-€5M revenue ready to scale. DM for details! 🚀",
        content_type: "post",
        status: "review_pending",
        excerpt: "Special bundle offer for Marketing Machine + BI Dashboard",
        target_platforms: ["instagram", "facebook", "linkedin"],
        hashtags: [
          "#SpecialOffer",
          "#MarketingBundle",
          "#LimitedTime",
          "#ScaleUp",
          "#BusinessGrowth",
        ],
        ai_generated: false,
        engagement_prediction: 78.9,
        target_audience: "Scale-up companies and growing businesses",
        content_category: "promotional",
        tone: "promotional",
        is_ab_test: true,
      },
      {
        title: "📚 Data Visualization Best Practices for Executives",
        content:
          "Creating executive-ready dashboards requires more than just charts. Here are our top 5 principles:\n\n1️⃣ Executive Summary First\n2️⃣ Actionable Insights Only\n3️⃣ Mobile-Responsive Design\n4️⃣ Real-Time Data Integration\n5️⃣ Drill-Down Capabilities\n\nWhat dashboard features do you find most valuable? Share your thoughts! 💭\n\n#DataVisualization #ExecutiveDashboards #BusinessIntelligence",
        content_type: "post",
        status: "published",
        excerpt: "Executive dashboard design best practices and principles",
        target_platforms: ["linkedin", "twitter"],
        hashtags: [
          "#DataVisualization",
          "#ExecutiveDashboards",
          "#BusinessIntelligence",
          "#BestPractices",
        ],
        ai_generated: true,
        ai_prompt:
          "Create an educational post about executive dashboard design best practices",
        engagement_prediction: 76.3,
        target_audience: "Business executives and data professionals",
        content_category: "educational",
        tone: "educational",
        is_ab_test: false,
        total_engagement: 892,
        total_reach: 12450,
        total_impressions: 18730,
        performance_score: 82.1,
        published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const { data, error } = await supabase
      .from("content_posts")
      .insert(samplePosts)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: {
        created_posts: data?.length || 0,
        posts: data,
      },
      message: "Sample content posts created successfully",
    });
  } catch (error) {
    console.error("Create sample posts error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create sample posts",
      },
      { status: 500 }
    );
  }
}
