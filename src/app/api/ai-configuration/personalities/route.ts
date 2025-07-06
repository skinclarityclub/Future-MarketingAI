import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
// Personality management imports - currently unused but reserved for future implementation
// import {
//   PersonalityProfile,
//   PERSONALITY_TEMPLATES,
// } from "@/lib/ai-configuration/types";
// import {
//   DEFAULT_PERSONALITIES,
//   createDefaultProfiles,
// } from "@/lib/ai-configuration";

// Default personality profiles
const defaultPersonalityProfiles = [
  {
    id: "professional",
    name: "Professional Assistant",
    description: "Formal, precise, and business-focused communication style",
    systemPrompt:
      "You are a professional business assistant. Provide clear, concise, and formal responses. Focus on accuracy and efficiency.",
    traits: {
      formality: 8,
      creativity: 4,
      empathy: 6,
      technical: 7,
    },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "friendly",
    name: "Friendly Helper",
    description: "Warm, approachable, and conversational communication style",
    systemPrompt:
      "You are a friendly and helpful assistant. Be warm, approachable, and conversational while maintaining professionalism.",
    traits: {
      formality: 4,
      creativity: 7,
      empathy: 9,
      technical: 5,
    },
    isActive: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "technical",
    name: "Technical Expert",
    description: "Deep technical knowledge with precise, detailed explanations",
    systemPrompt:
      "You are a technical expert assistant. Provide detailed, accurate technical information with examples and best practices.",
    traits: {
      formality: 6,
      creativity: 5,
      empathy: 4,
      technical: 10,
    },
    isActive: false,
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    // In a real implementation, you would fetch from database
    // For now, return the default profiles
    return NextResponse.json({
      success: true,
      data: defaultPersonalityProfiles,
    });
  } catch (error) {
    console.error("Error fetching personality profiles:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch personality profiles" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profiles } = body;

    if (!profiles || !Array.isArray(profiles)) {
      return NextResponse.json(
        {
          success: false,
          error: "Profiles array required",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Delete existing profiles and insert new ones
    await supabase.from("ai_personality_profiles").delete().gt("id", 0);

    const { data, error } = await supabase
      .from("ai_personality_profiles")
      .insert(profiles)
      .select();

    if (error) {
      console.error("Error saving personality profiles:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to save profiles",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profiles: data,
      message: "Profiles saved successfully",
    });
  } catch (error) {
    console.error("Error in personalities POST:", error);
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
    const { profile } = body;

    if (!profile || !profile.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid profile data",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const updatedProfile = {
      ...profile,
      updated: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("ai_personality_profiles")
      .update(updatedProfile)
      .eq("id", profile.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating personality profile:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update profile",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: data,
    });
  } catch (error) {
    console.error("Error in personality profiles PUT:", error);
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
    const profileId = searchParams.get("id");

    if (!profileId) {
      return NextResponse.json(
        {
          success: false,
          error: "Profile ID required",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if this is the active profile
    const { data: config } = await supabase
      .from("ai_configuration")
      .select("active_profile_id")
      .single();

    if (config?.active_profile_id === profileId) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete active profile",
        },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("ai_personality_profiles")
      .delete()
      .eq("id", profileId);

    if (error) {
      console.error("Error deleting personality profile:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to delete profile",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error in personality profiles DELETE:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
