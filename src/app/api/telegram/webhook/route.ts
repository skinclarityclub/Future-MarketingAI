import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { getBotConfig } from "@/lib/telegram/bot-config";
import { TelegramApiClient } from "@/lib/telegram/api-client";
import { TelegramMessageHandler } from "@/lib/telegram/message-handler";
import { TelegramAuthService } from "@/lib/telegram/auth-service";
import { TelegramAuthMiddleware } from "@/lib/telegram/auth-middleware";
import TelegramAIBridge from "@/lib/telegram/ai-bridge";
import { TelegramAICommands } from "@/lib/telegram/ai-commands";

// Webhook security configuration
const WEBHOOK_CONFIG = {
  MAX_BODY_SIZE: 1024 * 1024, // 1MB max body size
  REQUEST_TIMEOUT: 10000, // 10 seconds timeout
  RATE_LIMIT_WINDOW: 60000, // 1 minute window
  RATE_LIMIT_MAX_REQUESTS: 100, // Max requests per window
};

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let webhookData = null;

  try {
    // 1. Security Headers Validation
    const userAgent = request.headers.get("user-agent");
    if (!userAgent || !userAgent.includes("TelegramBot")) {
      console.warn("Webhook: Invalid User-Agent:", userAgent);
      return NextResponse.json(
        { error: "Invalid request source" },
        { status: 403 }
      );
    }

    // 2. Content-Type Validation
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 }
      );
    }

    // 3. Body Size Check
    const contentLength = request.headers.get("content-length");
    if (
      contentLength &&
      parseInt(contentLength) > WEBHOOK_CONFIG.MAX_BODY_SIZE
    ) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }

    // 4. Rate Limiting
    const clientIP = getClientIP(request);
    if (!isRateLimitOk(clientIP)) {
      console.warn("Webhook: Rate limit exceeded for IP:", clientIP);
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // 5. Parse Request Body
    const rawBody = await request.text();
    if (!rawBody || rawBody.length === 0) {
      return NextResponse.json(
        { error: "Empty request body" },
        { status: 400 }
      );
    }

    // 6. Webhook Signature Verification (if secret token is configured)
    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = request.headers.get("x-telegram-bot-api-secret-token");
      if (!verifyWebhookSignature(signature, webhookSecret)) {
        console.warn("Webhook: Invalid signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    // 7. Parse JSON Data
    try {
      webhookData = JSON.parse(rawBody);
    } catch (jsonError) {
      console.error("Webhook: JSON parse error:", jsonError);
      return NextResponse.json({ error: "Invalid JSON data" }, { status: 400 });
    }

    // 8. Validate Webhook Structure
    if (!validateWebhookStructure(webhookData)) {
      console.warn("Webhook: Invalid structure:", webhookData);
      return NextResponse.json(
        { error: "Invalid webhook structure" },
        { status: 400 }
      );
    }

    // 9. Initialize Services
    const config = getBotConfig();
    const apiClient = new TelegramApiClient(config);
    const authService = new TelegramAuthService(config);
    const authMiddleware = new TelegramAuthMiddleware(
      authService,
      apiClient,
      config
    );

    // Initialize AI-related services
    const aiBridge = new TelegramAIBridge(authService);
    const aiCommands = new TelegramAICommands(apiClient, aiBridge);

    const messageHandler = new TelegramMessageHandler(
      apiClient,
      config,
      authService,
      authMiddleware,
      aiBridge,
      aiCommands
    );

    // 10. Process Update with Enterprise Authentication
    const processingResult = await processWebhookUpdate(
      webhookData,
      messageHandler,
      authMiddleware,
      config,
      clientIP
    );

    // 11. Log Success Metrics
    const processingTime = Date.now() - startTime;
    console.log(`Webhook processed successfully in ${processingTime}ms`, {
      updateId: webhookData.update_id,
      type: getUpdateType(webhookData),
      processingTime,
      ip: clientIP,
    });

    return NextResponse.json({
      ok: true,
      processingTime,
      updateId: webhookData.update_id,
    });
  } catch (error) {
    // 12. Comprehensive Error Handling
    const processingTime = Date.now() - startTime;
    console.error("Webhook error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      updateId: webhookData?.update_id,
      processingTime,
      ip: getClientIP(request),
    });

    // Don't expose internal errors to Telegram
    return NextResponse.json(
      {
        ok: false,
        error: "Internal processing error",
        processingTime,
      },
      { status: 500 }
    );
  }
}

async function processWebhookUpdate(
  update: any,
  messageHandler: TelegramMessageHandler,
  authMiddleware: TelegramAuthMiddleware,
  config: any,
  clientIP: string
): Promise<void> {
  // Handle different types of updates with authentication
  if (update.message) {
    await handleMessage(
      update.message,
      messageHandler,
      authMiddleware,
      clientIP
    );
  } else if (update.edited_message) {
    await handleEditedMessage(
      update.edited_message,
      messageHandler,
      authMiddleware,
      clientIP
    );
  } else if (update.callback_query) {
    await handleCallbackQuery(
      update.callback_query,
      messageHandler,
      authMiddleware,
      clientIP
    );
  } else if (update.inline_query) {
    await handleInlineQuery(
      update.inline_query,
      messageHandler,
      authMiddleware,
      clientIP
    );
  } else if (update.chosen_inline_result) {
    await handleChosenInlineResult(
      update.chosen_inline_result,
      messageHandler,
      authMiddleware,
      clientIP
    );
  } else {
    console.warn("Webhook: Unhandled update type:", Object.keys(update));
  }
}

async function handleMessage(
  message: any,
  handler: TelegramMessageHandler,
  authMiddleware: TelegramAuthMiddleware,
  clientIP: string
): Promise<void> {
  const chatId = message.chat.id;
  const userId = message.from?.id?.toString();

  try {
    // Log message attempt
    console.log("Processing message:", {
      userId,
      chatId,
      messageType: message.text ? "text" : "other",
      ip: clientIP,
    });

    // Handle different message types
    if (message.text) {
      if (message.text.startsWith("/")) {
        await handler.handleCommand(message);
      } else {
        await handler.handleTextMessage(message);
      }
    } else if (message.photo) {
      await handleUnsupportedMessage(
        chatId,
        handler,
        "Photo messages are not supported yet."
      );
    } else if (message.document) {
      await handleUnsupportedMessage(
        chatId,
        handler,
        "Document messages are not supported yet."
      );
    } else if (message.voice) {
      await handleUnsupportedMessage(
        chatId,
        handler,
        "Voice messages are not supported yet."
      );
    } else if (message.video) {
      await handleUnsupportedMessage(
        chatId,
        handler,
        "Video messages are not supported yet."
      );
    } else if (message.sticker) {
      await handleUnsupportedMessage(
        chatId,
        handler,
        "Sticker messages are not supported yet."
      );
    } else {
      await handleUnsupportedMessage(
        chatId,
        handler,
        "This message type is not supported."
      );
    }
  } catch (error) {
    console.error("Message handling error:", error);
    await sendErrorMessage(chatId, handler);
  }
}

async function handleEditedMessage(
  editedMessage: any,
  handler: TelegramMessageHandler,
  authMiddleware: TelegramAuthMiddleware,
  clientIP: string
): Promise<void> {
  // Log edited message
  console.log("Processing edited message:", {
    userId: editedMessage.from?.id,
    chatId: editedMessage.chat.id,
    ip: clientIP,
  });

  // For now, treat edited messages the same as new messages
  await handleMessage(editedMessage, handler, authMiddleware, clientIP);
}

async function handleCallbackQuery(
  callbackQuery: any,
  handler: TelegramMessageHandler,
  authMiddleware: TelegramAuthMiddleware,
  clientIP: string
): Promise<void> {
  const userId = callbackQuery.from?.id?.toString();
  const chatId = callbackQuery.message?.chat?.id;

  try {
    console.log("Processing callback query:", {
      userId,
      chatId,
      data: callbackQuery.data,
      ip: clientIP,
    });

    await handler.handleCallbackQuery(callbackQuery);
  } catch (error) {
    console.error("Callback query handling error:", error);

    // Answer the callback query with error
    await handler.apiClient.answerCallbackQuery(
      callbackQuery.id,
      "An error occurred while processing your request."
    );
  }
}

async function handleInlineQuery(
  inlineQuery: any,
  handler: TelegramMessageHandler,
  authMiddleware: TelegramAuthMiddleware,
  clientIP: string
): Promise<void> {
  console.log("Processing inline query:", {
    userId: inlineQuery.from?.id,
    query: inlineQuery.query,
    ip: clientIP,
  });

  // For now, return empty results for inline queries
  await handler.apiClient.answerInlineQuery(inlineQuery.id, []);
}

async function handleChosenInlineResult(
  chosenResult: any,
  handler: TelegramMessageHandler,
  authMiddleware: TelegramAuthMiddleware,
  clientIP: string
): Promise<void> {
  console.log("Processing chosen inline result:", {
    userId: chosenResult.from?.id,
    resultId: chosenResult.result_id,
    ip: clientIP,
  });

  // Log for analytics purposes
}

async function handleUnsupportedMessage(
  chatId: number,
  handler: TelegramMessageHandler,
  customMessage?: string
): Promise<void> {
  const message =
    customMessage ||
    "❌ Sorry, I only support text messages and commands at the moment. Please send me a text message or use one of the available commands like /help.";

  await handler.apiClient.sendMessage({
    chat_id: chatId,
    text: message,
  });
}

async function sendErrorMessage(
  chatId: number,
  handler: TelegramMessageHandler
): Promise<void> {
  try {
    await handler.apiClient.sendMessage({
      chat_id: chatId,
      text: "❌ Sorry, an error occurred while processing your message. Please try again later or contact support if the issue persists.",
    });
  } catch (error) {
    console.error("Failed to send error message:", error);
  }
}

function validateWebhookStructure(data: any): boolean {
  // Basic webhook structure validation
  if (!data || typeof data !== "object") {
    return false;
  }

  // Must have update_id
  if (!data.update_id || typeof data.update_id !== "number") {
    return false;
  }

  // Must have at least one update type
  const updateTypes = [
    "message",
    "edited_message",
    "channel_post",
    "edited_channel_post",
    "inline_query",
    "chosen_inline_result",
    "callback_query",
    "shipping_query",
    "pre_checkout_query",
    "poll",
    "poll_answer",
  ];

  const hasValidUpdate = updateTypes.some(type => data[type]);
  return hasValidUpdate;
}

function getUpdateType(update: any): string {
  if (update.message) return "message";
  if (update.edited_message) return "edited_message";
  if (update.callback_query) return "callback_query";
  if (update.inline_query) return "inline_query";
  if (update.chosen_inline_result) return "chosen_inline_result";
  return "unknown";
}

function verifyWebhookSignature(
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) {
    return false;
  }

  // Simple secret token comparison (for Telegram webhook secret)
  return timingSafeEqual(Buffer.from(signature), Buffer.from(secret));
}

function getClientIP(request: NextRequest): string {
  // Get client IP from various headers
  const forwarded = request.headers.get("x-forwarded-for");
  const real = request.headers.get("x-real-ip");
  const remote = request.headers.get("remote-addr");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (real) {
    return real;
  }
  if (remote) {
    return remote;
  }

  return "unknown";
}

function isRateLimitOk(clientIP: string): boolean {
  const now = Date.now();
  const key = `rate_limit_${clientIP}`;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + WEBHOOK_CONFIG.RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (record.count >= WEBHOOK_CONFIG.RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  // Increment count
  record.count++;
  return true;
}

// Cleanup rate limit store periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Cleanup every minute

// Health check endpoint
export async function GET() {
  try {
    const config = getBotConfig();
    const apiClient = new TelegramApiClient(config);

    // Test bot connection
    const botInfo = await apiClient.getMe();

    if (botInfo.ok) {
      return NextResponse.json({
        status: "healthy",
        webhook: {
          endpoint: "/api/telegram/webhook",
          features: [
            "enterprise_authentication",
            "rate_limiting",
            "signature_verification",
            "comprehensive_logging",
            "error_handling",
          ],
        },
        bot: {
          id: botInfo.result.id,
          username: botInfo.result.username,
          first_name: botInfo.result.first_name,
        },
        security: {
          webhook_secret_configured: !!process.env.TELEGRAM_WEBHOOK_SECRET,
          rate_limiting_enabled: true,
          max_requests_per_minute: WEBHOOK_CONFIG.RATE_LIMIT_MAX_REQUESTS,
        },
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          status: "unhealthy",
          error: botInfo.description,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Configuration or connection error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
