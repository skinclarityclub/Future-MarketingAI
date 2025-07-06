import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Test database connection
    const { data: testData, error: testError } = await supabase
      .from("user_behavior_events")
      .select("count")
      .limit(1);

    // Check environment variables
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT || 3000,
    };

    // Check if tables exist
    let tablesExist = false;
    try {
      const { data: tables, error: tablesError } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .in("table_name", [
          "user_behavior_events",
          "user_sessions",
          "ai_personality_profiles",
        ]);

      tablesExist = !tablesError && tables && tables.length > 0;
    } catch {
      tablesExist = false;
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: {
        connected: !testError,
        error: testError?.message || null,
        tablesExist,
        testQuery: testData ? "success" : "failed",
      },
      urls: {
        requestUrl: req.url,
        nextUrl: req.nextUrl?.toString(),
        headers: Object.fromEntries(req.headers.entries()),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Debug endpoint failed",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
