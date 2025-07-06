import { NextRequest, NextResponse } from "next/server";
import { TelegramBotSetup } from "@/lib/telegram/bot-setup";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    const botSetup = new TelegramBotSetup();

    switch (action) {
      case "validate":
        const validation = await botSetup.validateConfiguration();
        return NextResponse.json(validation);

      case "bot-info":
        const botInfo = await botSetup.getBotInfo();
        return NextResponse.json(botInfo);

      case "env-check":
        const envCheck = botSetup.validateEnvironmentVariables();
        return NextResponse.json({
          success: envCheck.valid,
          message: envCheck.valid
            ? "All required environment variables are set"
            : `Missing environment variables: ${envCheck.missing.join(", ")}`,
          missing: envCheck.missing,
          required: botSetup.getRequiredEnvironmentVariables(),
        });

      default:
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid action. Available actions: validate, bot-info, env-check",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Telegram admin API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, webhookUrl } = body;

    const botSetup = new TelegramBotSetup();

    switch (action) {
      case "setup-webhook":
        if (!webhookUrl) {
          return NextResponse.json(
            {
              success: false,
              message: "webhookUrl is required for setup-webhook action",
            },
            { status: 400 }
          );
        }

        const setupResult = await botSetup.setupWebhook(webhookUrl);
        return NextResponse.json(setupResult);

      case "remove-webhook":
        const removeResult = await botSetup.removeWebhook();
        return NextResponse.json(removeResult);

      case "generate-webhook-url":
        const baseUrl =
          body.baseUrl ||
          `${request.nextUrl.protocol}//${request.nextUrl.host}`;
        const generatedUrl = botSetup.generateWebhookUrl(baseUrl);

        return NextResponse.json({
          success: true,
          message: "Webhook URL generated",
          webhookUrl: generatedUrl,
        });

      default:
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid action. Available actions: setup-webhook, remove-webhook, generate-webhook-url",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Telegram admin API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
