import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "status";

    switch (action) {
      case "status":
        return await checkDatabaseStatus(supabase);
      case "populate":
        return await populateWithSampleData(supabase);
      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Marketing Machine Setup Error:", error);
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

async function checkDatabaseStatus(supabase: any) {
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
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });

      status.push({
        table,
        exists: !error,
        rowCount: count || 0,
        error: error?.message || null,
      });
    } catch (err) {
      status.push({
        table,
        exists: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  const allTablesExist = status.every(t => t.exists);
  const totalRows = status.reduce((sum, t) => sum + (t.rowCount || 0), 0);

  return NextResponse.json({
    success: true,
    data: {
      tables: status,
      summary: {
        allTablesExist,
        totalTables: tables.length,
        existingTables: status.filter(t => t.exists).length,
        totalRows,
        isSetupComplete: allTablesExist && totalRows > 0,
      },
    },
    message: "Marketing Machine database status checked",
  });
}

async function populateWithSampleData(supabase: any) {
  try {
    // First check if we already have data
    const { count: postsCount } = await supabase
      .from("content_posts")
      .select("*", { count: "exact", head: true });

    if (postsCount && postsCount > 0) {
      return NextResponse.json({
        success: true,
        message: "Sample data already exists",
        data: { existing_posts: postsCount },
      });
    }

    // Create basic sample content posts that should work with any schema
    const basicPosts = [
      {
        title: "🚀 Marketing Machine Platform Launch",
        content:
          "Introducing our revolutionary Marketing Machine platform! Automate your entire content workflow from ideation to publication. Perfect for scale-up companies looking to optimize their marketing operations. #MarketingAutomation #ContentCreation #ScaleUp",
      },
      {
        title: "📊 BI Dashboard Integration Success",
        content:
          "See how our integrated BI Dashboard + Marketing Machine helped a Fortune 500 company achieve 340% ROI improvement. Real-time analytics meet automated content creation for unprecedented marketing efficiency. #BusinessIntelligence #MarketingROI #Fortune500",
      },
      {
        title: "🎯 Content Strategy Automation",
        content:
          "From €300K to millions in revenue - our Marketing Machine scales with your business. AI-powered content ideation, multi-platform publishing, and performance optimization all in one platform. Book your demo today! #AIMarketing #ContentStrategy #BusinessGrowth",
      },
    ];

    const { data: insertedPosts, error: insertError } = await supabase
      .from("content_posts")
      .insert(basicPosts)
      .select();

    if (insertError) {
      throw new Error(`Failed to insert sample posts: ${insertError.message}`);
    }

    // Try to add some basic social accounts if the table structure allows
    try {
      const { count: accountsCount } = await supabase
        .from("social_accounts")
        .select("*", { count: "exact", head: true });

      if (!accountsCount || accountsCount === 0) {
        const basicAccounts = [
          {
            account_name: "SKC Business Facebook",
            platform: "facebook",
            account_handle: "skcbusiness",
          },
          {
            account_name: "SKC Business LinkedIn",
            platform: "linkedin",
            account_handle: "skc-company",
          },
        ];

        await supabase.from("social_accounts").insert(basicAccounts);
      }
    } catch (accountError) {
      // Ignore social accounts errors for now
      console.log("Social accounts setup skipped:", accountError);
    }

    return NextResponse.json({
      success: true,
      data: {
        created_posts: insertedPosts?.length || 0,
        posts: insertedPosts,
        message: "Sample data populated successfully",
      },
      message: "Marketing Machine sample data created",
    });
  } catch (error) {
    console.error("Populate sample data error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to populate sample data",
      },
      { status: 500 }
    );
  }
}
