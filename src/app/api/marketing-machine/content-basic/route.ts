import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get all content posts with only the columns that exist
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
    console.error("Get content posts error:", error);
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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Create a basic post with only title (which should exist)
    const basicPost = {
      title: body.title || "Marketing Machine Content",
      // Don't include 'content' field since it doesn't exist yet
    };

    const { data, error } = await supabase
      .from("content_posts")
      .insert(basicPost)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: {
        created_post: data[0],
        message: "Basic content post created successfully",
      },
      message: "Content post created with current schema",
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
