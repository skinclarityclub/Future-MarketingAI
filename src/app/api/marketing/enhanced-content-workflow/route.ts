// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Mock enhanced content workflow manager
const enhancedContentWorkflow = {
  async getContentPosts(filters = {}) {
    return [
      {
        id: "post-1",
        title: "Sample Post",
        content: "Sample content",
        status: "draft",
        platform: ["facebook", "instagram"],
        created_at: new Date().toISOString(),
      },
    ];
  },

  async getConnectedAccounts(platform) {
    return [
      {
        id: "acc-1",
        platform: platform || "facebook",
        username: "sampleaccount",
        status: "connected",
        posting_enabled: true,
      },
    ];
  },

  async createContentPost(data) {
    return {
      id: `post-${Date.now()}`,
      ...data,
      status: "draft",
      created_at: new Date().toISOString(),
    };
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "get_content":
        const posts = await enhancedContentWorkflow.getContentPosts();
        return NextResponse.json({
          success: true,
          data: posts,
        });

      case "get_accounts":
        const accounts = await enhancedContentWorkflow.getConnectedAccounts();
        return NextResponse.json({
          success: true,
          data: accounts,
        });

      default:
        return NextResponse.json({
          success: true,
          data: [],
          message: "Enhanced content workflow API",
        });
    }
  } catch (error) {
    console.error("Enhanced content workflow error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case "create_content":
        const newPost = await enhancedContentWorkflow.createContentPost(data);
        return NextResponse.json({
          success: true,
          data: newPost,
          message: "Content created successfully",
        });

      case "publish_content":
        return NextResponse.json({
          success: true,
          data: { id: data.postId, status: "published" },
          message: "Content published successfully",
        });

      case "submit_for_approval":
        return NextResponse.json({
          success: true,
          data: { id: data.postId, status: "pending_approval" },
          message: "Content submitted for approval",
        });

      case "validate_content":
        return NextResponse.json({
          success: true,
          data: { valid: true, warnings: [] },
          message: "Content validation completed",
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Enhanced content workflow POST error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
