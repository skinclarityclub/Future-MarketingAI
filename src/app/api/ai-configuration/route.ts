import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  try {
    // Return current AI configuration
    const aiConfiguration = {
      activeProfile: {
        id: "default",
        name: "SKC BI Assistant",
        personality: "professional",
        systemPrompt: "You are a helpful BI dashboard assistant for SKC.",
        temperature: 0.7,
        maxTokens: 2048,
        model: "gpt-4",
      },

      availableModels: [
        {
          id: "gpt-4",
          name: "GPT-4",
          provider: "openai",
          status: "available",
          costPerToken: 0.00003,
        },
        {
          id: "gpt-3.5-turbo",
          name: "GPT-3.5 Turbo",
          provider: "openai",
          status: "available",
          costPerToken: 0.000002,
        },
        {
          id: "claude-3-sonnet",
          name: "Claude 3 Sonnet",
          provider: "anthropic",
          status: "available",
          costPerToken: 0.000015,
        },
      ],

      settings: {
        enabledFeatures: [
          "chat_assistant",
          "content_generation",
          "data_analysis",
          "predictive_insights",
        ],
        rateLimits: {
          requestsPerMinute: 60,
          tokensPerDay: 100000,
        },
        safety: {
          contentFiltering: true,
          piiDetection: true,
          moderationLevel: "standard",
        },
      },

      systemMessages: [
        {
          id: "1",
          role: "system",
          content: "You are an expert BI analyst assistant.",
          active: true,
        },
        {
          id: "2",
          role: "system",
          content: "Always provide data-driven insights.",
          active: true,
        },
      ],

      status: {
        lastUpdated: new Date().toISOString(),
        configVersion: "1.0.0",
        health: "operational",
      },
    };

    return NextResponse.json({
      success: true,
      data: aiConfiguration,
      timestamp: new Date().toISOString(),
      message: "AI configuration retrieved successfully",
    });
  } catch (error) {
    console.error("AI Configuration API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve AI configuration",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle AI configuration updates
    const updatedConfig = {
      ...body,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: updatedConfig,
      message: "AI configuration updated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update AI configuration",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle full AI configuration replacement
    return NextResponse.json({
      success: true,
      message: "AI configuration replaced successfully",
      timestamp: new Date().toISOString(),
      data: body,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to replace AI configuration",
      },
      { status: 500 }
    );
  }
}
