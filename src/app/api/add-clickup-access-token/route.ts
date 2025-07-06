import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Add the access token credential to the database if it doesn't exist
    const { data: existing, error: checkError } = await supabase
      .from("api_credentials")
      .select("*")
      .eq("provider_id", "clickup")
      .eq("credential_id", "clickup_access_token")
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing credential:", checkError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!existing) {
      const { error: insertError } = await supabase
        .from("api_credentials")
        .insert({
          provider_id: "clickup",
          credential_id: "clickup_access_token",
          credential_type: "oauth2",
          name: "Access Token",
          description: "ClickUp OAuth Access Token (generated automatically)",
          is_required: false,
          status: "missing",
        });

      if (insertError) {
        console.error("Error inserting access token credential:", insertError);
        return NextResponse.json(
          { error: "Failed to add credential" },
          { status: 500 }
        );
      }

      console.log("✅ ClickUp access token credential added to database");
    } else {
      console.log("ℹ️ ClickUp access token credential already exists");
    }

    return NextResponse.json({
      success: true,
      message: "ClickUp access token credential ready",
      existed: !!existing,
    });
  } catch (error) {
    console.error("Error in add-clickup-access-token:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
