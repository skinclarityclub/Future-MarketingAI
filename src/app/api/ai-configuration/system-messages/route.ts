import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  SystemMessageConfig,
  // DEFAULT_SYSTEM_MESSAGES,  // Currently unused but reserved for future implementation
} from "@/lib/ai-configuration/types";

// Default system messages
const defaultSystemMessages = [
  {
    id: "general",
    name: "General Instructions",
    content:
      "You are a helpful AI assistant. Provide accurate, concise, and relevant responses to user queries.",
    category: "general",
    isActive: true,
    priority: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "safety",
    name: "Safety Guidelines",
    content:
      "Always prioritize user safety and privacy. Do not provide harmful, illegal, or inappropriate content.",
    category: "safety",
    isActive: true,
    priority: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "business",
    name: "Business Context",
    content:
      "This is a business intelligence dashboard. Focus on data-driven insights and professional communication.",
    category: "business",
    isActive: true,
    priority: 3,
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    // In a real implementation, you would fetch from database
    // For now, return the default system messages
    return NextResponse.json({
      success: true,
      data: defaultSystemMessages,
    });
  } catch (error) {
    console.error("Error fetching system messages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch system messages" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message || !message.name || !message.content) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid message data",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Create new system message
    const newMessage: SystemMessageConfig = {
      ...message,
      id: message.id || `message_${Date.now()}`,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      enabled: message.enabled !== undefined ? message.enabled : true,
      priority: message.priority || 0,
    };

    const { data, error } = await supabase
      .from("ai_system_messages")
      .insert([newMessage])
      .select()
      .single();

    if (error) {
      console.error("Error creating system message:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create message",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: data,
    });
  } catch (error) {
    console.error("Error in system messages POST:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message || !message.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid message data",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const updatedMessage = {
      ...message,
      updated: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("ai_system_messages")
      .update(updatedMessage)
      .eq("id", message.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating system message:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update message",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: data,
    });
  } catch (error) {
    console.error("Error in system messages PUT:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get("id");

    if (!messageId) {
      return NextResponse.json(
        {
          success: false,
          error: "Message ID required",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("ai_system_messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      console.error("Error deleting system message:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to delete message",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error in system messages DELETE:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Removed unused function createDefaultMessages
