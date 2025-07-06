import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
// AI Configuration types - currently unused but reserved for future implementation
// import {
//   PersonalityProfile,
//   SystemMessageConfig,
// } from "@/lib/ai-configuration/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { personalityProfiles, systemMessages, activeProfileId } = body;

    if (!personalityProfiles || !systemMessages || !activeProfileId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required data",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Start a transaction-like operation
    const updates = [];

    // Update personality profiles
    if (personalityProfiles && personalityProfiles.length > 0) {
      // Delete existing profiles and insert new ones
      const { error: deleteProfilesError } = await supabase
        .from("ai_personality_profiles")
        .delete()
        .neq("id", "dummy"); // Delete all

      if (deleteProfilesError) {
        console.warn(
          "Could not delete existing profiles:",
          deleteProfilesError
        );
      }

      // Insert new profiles
      const { error: insertProfilesError } = await supabase
        .from("ai_personality_profiles")
        .insert(personalityProfiles);

      if (insertProfilesError) {
        console.error(
          "Error inserting personality profiles:",
          insertProfilesError
        );
        updates.push({
          type: "profiles",
          success: false,
          error: insertProfilesError.message,
        });
      } else {
        updates.push({ type: "profiles", success: true });
      }
    }

    // Update system messages
    if (systemMessages && systemMessages.length > 0) {
      // Delete existing messages and insert new ones
      const { error: deleteMessagesError } = await supabase
        .from("ai_system_messages")
        .delete()
        .neq("id", "dummy"); // Delete all

      if (deleteMessagesError) {
        console.warn(
          "Could not delete existing messages:",
          deleteMessagesError
        );
      }

      // Insert new messages
      const { error: insertMessagesError } = await supabase
        .from("ai_system_messages")
        .insert(systemMessages);

      if (insertMessagesError) {
        console.error("Error inserting system messages:", insertMessagesError);
        updates.push({
          type: "messages",
          success: false,
          error: insertMessagesError.message,
        });
      } else {
        updates.push({ type: "messages", success: true });
      }
    }

    // Update active profile
    if (activeProfileId) {
      const { error: configError } = await supabase
        .from("ai_configuration")
        .upsert({
          id: "main",
          active_profile_id: activeProfileId,
          settings: {
            enablePersonalityAdaptation: true,
            enableContextAwareness: true,
            enableMLInsights: true,
            defaultLocale: "nl",
            fallbackProfile: "profile_1",
          },
          updated: new Date().toISOString(),
        });

      if (configError) {
        console.error("Error updating configuration:", configError);
        updates.push({
          type: "config",
          success: false,
          error: configError.message,
        });
      } else {
        updates.push({ type: "config", success: true });
      }
    }

    // Check if all updates were successful
    const allSuccessful = updates.every(update => update.success);

    return NextResponse.json({
      success: allSuccessful,
      updates,
      message: allSuccessful
        ? "All configurations saved successfully"
        : "Some configurations failed to save",
    });
  } catch (error) {
    console.error("Error in save configuration:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
