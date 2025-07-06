import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Test the connection by trying to get the current user
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.log(
        "Supabase connection test - no authenticated user (this is expected initially)"
      );
    }

    // Test database connection with actual business tables
    let databaseConnected = true;
    let connectionTest = "Connected successfully";
    let tableTests: any = {};

    try {
      // Test access to business tables
      const { data: kpiData, error: kpiError } = await supabase
        .from("business_kpi_daily")
        .select("*")
        .limit(1);

      const { data: contentData, error: contentError } = await supabase
        .from("content_posts")
        .select("*")
        .limit(1);

      const { data: salesData, error: salesError } = await supabase
        .from("kajabi_sales")
        .select("*")
        .limit(1);

      tableTests = {
        business_kpi_daily: {
          accessible: !kpiError,
          count: kpiData?.length || 0,
        },
        content_posts: {
          accessible: !contentError,
          count: contentData?.length || 0,
        },
        kajabi_sales: {
          accessible: !salesError,
          count: salesData?.length || 0,
        },
      };
    } catch (dbError) {
      databaseConnected = false;
      connectionTest = "Connection failed";
      console.error("Database connection test failed:", dbError);
    }

    return NextResponse.json({
      success: true,
      message: "Supabase connection successful",
      user: user ? { id: user.id, email: user.email } : null,
      databaseConnected,
      connectionTest,
      tableTests,
      availableTables: [
        "business_kpi_daily",
        "content_posts",
        "kajabi_sales",
        "shopify_sales",
        "google_ads_performance",
        "meta_ads_performance",
        "ai_business_insights",
        "content_calendar",
        "revenue_attribution",
        "unified_customer_profiles",
      ],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Supabase connection error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Supabase connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
