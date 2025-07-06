import { NextRequest, NextResponse } from "next/server";

// Default active profile
const defaultActiveProfile = {
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
};

export async function GET() {
  try {
    // In a real implementation, you would fetch from database
    // For now, return the default active profile
    return NextResponse.json({
      success: true,
      data: defaultActiveProfile,
    });
  } catch (error) {
    console.error("Error fetching active profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch active profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { activeProfileId } = body;

    if (!activeProfileId) {
      return NextResponse.json(
        { success: false, error: "activeProfileId is required" },
        { status: 400 }
      );
    }

    // In a real implementation, you would update the database
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: "Active profile updated successfully",
      activeProfileId,
    });
  } catch (error) {
    console.error("Error updating active profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update active profile" },
      { status: 500 }
    );
  }
}
