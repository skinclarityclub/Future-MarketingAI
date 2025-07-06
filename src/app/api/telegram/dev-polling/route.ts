import { NextRequest, NextResponse } from "next/server";
import { TelegramPolling } from "@/lib/telegram/polling";

let pollingInstance: TelegramPolling | null = null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    console.log("Received body:", body);

    if (!body) {
      return NextResponse.json(
        {
          success: false,
          message: "Empty request body",
        },
        { status: 400 }
      );
    }

    const { action } = JSON.parse(body);

    switch (action) {
      case "start":
        if (pollingInstance) {
          return NextResponse.json({
            success: false,
            message: "Polling is already running",
          });
        }

        pollingInstance = new TelegramPolling();
        await pollingInstance.startPolling();

        return NextResponse.json({
          success: true,
          message:
            "Polling started successfully. You can now test the bot via Telegram!",
        });

      case "stop":
        if (!pollingInstance) {
          return NextResponse.json({
            success: false,
            message: "No polling instance is running",
          });
        }

        pollingInstance.stopPolling();
        pollingInstance = null;

        return NextResponse.json({
          success: true,
          message: "Polling stopped successfully",
        });

      case "status":
        return NextResponse.json({
          success: true,
          isRunning: pollingInstance !== null,
          message: pollingInstance
            ? "Polling is active"
            : "Polling is not running",
        });

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid action. Use: start, stop, or status",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Dev polling error:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!pollingInstance) {
      return NextResponse.json({
        success: true,
        isRunning: false,
        message: "Polling is not running",
        instructions:
          'Send POST request with {"action": "start"} to begin polling',
      });
    }

    const botInfo = await pollingInstance.getBotInfo();

    return NextResponse.json({
      success: true,
      isRunning: true,
      message: "Polling is active",
      botInfo: botInfo.result,
      instructions: "Bot is ready for testing via Telegram!",
    });
  } catch (error) {
    console.error("Dev polling status error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error checking polling status",
      },
      { status: 500 }
    );
  }
}
