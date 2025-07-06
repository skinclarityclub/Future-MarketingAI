import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();

    // Try to insert a minimal record to see what columns are required/available
    const testRecord = {
      title: "Test Structure Check",
    };

    const { data, error } = await supabase
      .from("content_posts")
      .insert(testRecord)
      .select();

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: "Failed to insert minimal record",
        suggestion: "This shows which columns are required or missing",
      });
    }

    // If successful, let's see what was actually inserted
    return NextResponse.json({
      success: true,
      data: {
        inserted_record: data[0],
        available_columns: Object.keys(data[0] || {}),
        message: "Successfully inserted minimal record",
      },
      message: "Table structure test completed",
    });
  } catch (error) {
    console.error("Table structure test error:", error);
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
