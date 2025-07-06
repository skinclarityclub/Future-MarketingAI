import { NextRequest, NextResponse } from "next/server";
import { personalityExtensionRegistry } from "@/lib/ai-configuration/extensions/personality-extension-system";

// GET /api/ai-configuration/extensions - List all registered extensions
export async function GET() {
  try {
    const extensions = personalityExtensionRegistry.listExtensions();

    return NextResponse.json({
      success: true,
      data: {
        extensions: extensions.map(ext => ({
          id: ext.id,
          name: ext.name,
          version: ext.version,
          author: ext.author,
          description: ext.description,
          profileCount: ext.profiles.length,
          messageTypeCount: ext.messageTypes.length,
          adaptationRuleCount: ext.adaptationRules.length,
          contextProcessorCount: ext.contextProcessors.length,
        })),
        totalExtensions: extensions.length,
        availableProfiles:
          personalityExtensionRegistry.getAllPersonalityProfiles().length,
        availableMessageTypes:
          personalityExtensionRegistry.getAllMessageTypes().length,
      },
    });
  } catch (error) {
    console.error("Failed to list extensions:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve extensions",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// POST /api/ai-configuration/extensions - Register a new extension (for future use)
export async function POST(req: NextRequest) {
  try {
    const extensionData = await req.json();

    // For now, return info about how to register extensions
    // In the future, this could support dynamic extension loading

    return NextResponse.json({
      success: false,
      message: "Dynamic extension registration not yet implemented",
      info: "Extensions are currently registered via code imports. See /lib/ai-configuration/extensions/examples/ for examples.",
      receivedData: {
        id: extensionData.id || "unknown",
        name: extensionData.name || "Unknown Extension",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid extension data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 400 }
    );
  }
}

export const runtime = "edge";
