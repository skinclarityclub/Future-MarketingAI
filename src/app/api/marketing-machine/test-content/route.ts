import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // First, let's see what columns exist in content_posts
    const { data: tableInfo, error: tableError } = await supabase
      .rpc("get_table_info", { table_name: "content_posts" })
      .single();

    if (tableError) {
      // Try a simple select to see the structure
      const { data, error, count } = await supabase
        .from("content_posts")
        .select("*", { count: "exact" })
        .limit(1);

      return NextResponse.json({
        success: true,
        data: {
          table_exists: !error,
          row_count: count || 0,
          sample_data: data || [],
          error: error?.message || null,
        },
        message: "Content posts table inspection completed",
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        table_info: tableInfo,
        structure_available: true,
      },
      message: "Table structure retrieved",
    });
  } catch (error) {
    console.error("Test content API error:", error);
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

    // Try to insert a very basic content post
    const basicPost = {
      title: "Test Marketing Machine Post",
      content: "This is a test post for the Marketing Machine platform. 🚀",
    };

    const { data, error } = await supabase
      .from("content_posts")
      .insert(basicPost)
      .select();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details:
            "Failed to insert basic post - table structure might be different",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        created_post: data[0],
        message: "Basic post created successfully",
      },
      message: "Test content post created",
    });
  } catch (error) {
    console.error("Create test content error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create test content",
      },
      { status: 500 }
    );
  }
}
