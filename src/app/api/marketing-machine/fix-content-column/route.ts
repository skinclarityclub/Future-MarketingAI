import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient();

    // First check if content column exists
    const { error: testError } = await supabase
      .from("content_posts")
      .select("content")
      .limit(1);

    if (
      testError &&
      testError.message.includes('column "content" does not exist')
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Content column missing - please run database migration manually",
          suggestion:
            "The content_posts table needs the 'content' column. Please add it via database admin.",
        },
        { status: 400 }
      );
    }

    // If we get here, the column exists, let's test with sample data
    const samplePost = {
      title: "Marketing Machine Test Post",
      content:
        "This is a test post for the Marketing Machine platform. 🚀 #MarketingAutomation",
    };

    const { data, error } = await supabase
      .from("content_posts")
      .insert(samplePost)
      .select();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: "Failed to insert test post",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        test_post_created: true,
        post: data[0],
      },
      message: "Content column working correctly - test post created",
    });
  } catch (error) {
    console.error("Fix content column error:", error);
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
