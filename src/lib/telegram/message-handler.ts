import { TelegramApiClient } from "./api-client";
import { TelegramBotConfig, TelegramMessage } from "./bot-config";
import { TelegramAuthService, TelegramUserProfile } from "./auth-service";
import {
  TelegramAuthMiddleware,
  AuthenticatedContext,
} from "./auth-middleware";
import TelegramAIBridge, { type TelegramAIResponse } from "./ai-bridge";
import { TelegramAICommands } from "./ai-commands";
import {
  TelegramDataAccessController,
  DataAccessContext,
} from "./data-access-controller";
import { TelegramErrorHandler, ErrorContext } from "./error-handler";

interface UserSession {
  userId: string;
  chatId: number;
  context: string[];
  lastActivity: Date;
  isAuthenticated: boolean;
  authContext?: AuthenticatedContext;
  preferences: {
    language: string;
    timezone: string;
  };
}

export class TelegramMessageHandler {
  public apiClient: TelegramApiClient;
  private config: TelegramBotConfig;
  private sessions: Map<string, UserSession> = new Map();
  private authService: TelegramAuthService;
  private authMiddleware: TelegramAuthMiddleware;
  private aiBridge: TelegramAIBridge;
  private aiCommands: TelegramAICommands;
  private dataAccessController: TelegramDataAccessController;
  private errorHandler: TelegramErrorHandler;

  constructor(
    apiClient: TelegramApiClient,
    config: TelegramBotConfig,
    authService: TelegramAuthService,
    authMiddleware: TelegramAuthMiddleware,
    aiBridge: TelegramAIBridge,
    aiCommands: TelegramAICommands
  ) {
    this.apiClient = apiClient;
    this.config = config;
    this.authService = authService;
    this.authMiddleware = authMiddleware;
    this.aiBridge = aiBridge;
    this.aiCommands = aiCommands;
    this.dataAccessController = new TelegramDataAccessController();
    this.errorHandler = new TelegramErrorHandler(apiClient);
  }

  async handleCommand(message: TelegramMessage): Promise<void> {
    const chatId = message.chat.id;
    const userId = message.from?.id?.toString();
    const command = message.text?.split(" ")[0];

    const errorContext: ErrorContext = {
      userId,
      chatId,
      messageId: message.message_id,
      command,
      timestamp: new Date(),
    };

    try {
      // Authenticate user
      const authResult = await this.authService.authenticateUser(
        message.from,
        chatId
      );

      if (!authResult.success) {
        const errorResponse = await this.errorHandler.handleAuthenticationError(
          { message: authResult.error },
          errorContext
        );

        if (errorResponse.userMessage) {
          await this.sendMessageWithErrorHandling(
            chatId,
            errorResponse.userMessage,
            errorResponse.actionButtons
          );
        }
        return;
      }

      const user = authResult.user!;

      // Check command-specific access control
      const requiredPermission = this.authMiddleware.getCommandPermission(
        command!
      );

      if (requiredPermission) {
        const dataAccessContext: DataAccessContext = {
          user,
          resource: this.getResourceFromCommand(command!),
          action: "access",
          requestData: { command },
          timestamp: new Date(),
          clientInfo: {
            chatId,
            messageId: message.message_id,
          },
        };

        const accessResult =
          await this.dataAccessController.validateAccess(dataAccessContext);

        if (!accessResult.allowed) {
          const accessDeniedMessage =
            this.dataAccessController.createAccessDeniedMessage(
              dataAccessContext,
              accessResult
            );

          await this.sendMessageWithErrorHandling(chatId, accessDeniedMessage);
          return;
        }
      }

      // Process command based on type
      try {
        switch (command) {
          case "/start":
            await this.handleStartCommand(message, user);
            break;
          case "/help":
            await this.handleHelpCommand(message, user);
            break;
          case "/dashboard":
            await this.handleDashboardCommand(message, user);
            break;
          case "/financial":
            await this.handleFinancialCommand(message, user);
            break;
          case "/marketing":
            await this.handleMarketingCommand(message, user);
            break;
          case "/reports":
            await this.handleReportsCommand(message, user);
            break;
          case "/settings":
            await this.handleSettingsCommand(message, user);
            break;
          case "/status":
            await this.handleStatusCommand(message, user);
            break;
          case "/ask":
          case "/analyze":
          case "/preferences":
          case "/history":
            await this.aiCommands.handleCommand(message, user);
            break;
          default:
            await this.handleUnknownCommand(chatId, command!);
        }
      } catch (commandError: any) {
        const errorResponse = await this.errorHandler.handleError(
          commandError,
          {
            ...errorContext,
            resource: this.getResourceFromCommand(command!),
            action: "execute",
          }
        );

        if (errorResponse.userMessage) {
          await this.sendMessageWithErrorHandling(
            chatId,
            errorResponse.userMessage,
            errorResponse.actionButtons
          );
        }
      }
    } catch (error: any) {
      const errorResponse = await this.errorHandler.handleError(
        error,
        errorContext
      );

      if (errorResponse.userMessage) {
        await this.sendMessageWithErrorHandling(
          chatId,
          errorResponse.userMessage,
          errorResponse.actionButtons
        );
      }
    }
  }

  async handleTextMessage(message: TelegramMessage): Promise<void> {
    const chatId = message.chat.id;
    const userId = message.from?.id?.toString();

    const errorContext: ErrorContext = {
      userId,
      chatId,
      messageId: message.message_id,
      timestamp: new Date(),
      ip: "webhook", // This would be populated from the request
    };

    try {
      // Authenticate user with comprehensive error handling
      const authResult = await this.authService.authenticateUser(
        message.from,
        chatId
      );

      if (!authResult.success) {
        const errorResponse = await this.errorHandler.handleAuthenticationError(
          { message: authResult.error },
          errorContext
        );

        if (errorResponse.userMessage) {
          await this.sendMessageWithErrorHandling(
            chatId,
            errorResponse.userMessage,
            errorResponse.actionButtons
          );
        }
        return;
      }

      const user = authResult.user!;
      const session = authResult.session!;

      // Create authenticated context for access control
      const authContext = {
        user,
        session,
        hasPermission: (permission: string) =>
          this.authService.hasPermission(user, permission),
      };

      // Check access for AI query processing
      const dataAccessContext: DataAccessContext = {
        user,
        resource: "ai_assistant",
        action: "query",
        requestData: { text: message.text },
        timestamp: new Date(),
        clientInfo: {
          chatId,
          messageId: message.message_id,
        },
      };

      const accessResult =
        await this.dataAccessController.validateAccess(dataAccessContext);

      if (!accessResult.allowed) {
        const accessDeniedMessage =
          this.dataAccessController.createAccessDeniedMessage(
            dataAccessContext,
            accessResult
          );

        await this.sendMessageWithErrorHandling(chatId, accessDeniedMessage);
        return;
      }

      // Process AI query with error handling
      try {
        const aiResponse = await this.aiBridge.processQuery(
          message.text!,
          user.id,
          user.role,
          { chatId, messageId: message.message_id }
        );

        await this.sendAIResponseWithErrorHandling(chatId, aiResponse);
      } catch (aiError: any) {
        const errorResponse = await this.errorHandler.handleAIServiceError(
          aiError,
          { ...errorContext, resource: "ai_assistant", action: "query" }
        );

        if (errorResponse.userMessage) {
          await this.sendMessageWithErrorHandling(
            chatId,
            errorResponse.userMessage,
            errorResponse.actionButtons
          );
        }
      }
    } catch (error: any) {
      const errorResponse = await this.errorHandler.handleError(
        error,
        errorContext
      );

      if (errorResponse.userMessage) {
        await this.sendMessageWithErrorHandling(
          chatId,
          errorResponse.userMessage,
          errorResponse.actionButtons
        );
      }
    }
  }

  async handleCallbackQuery(callbackQuery: any): Promise<void> {
    const chatId = callbackQuery.message?.chat?.id;
    const userId = callbackQuery.from?.id?.toString();
    const data = callbackQuery.data;

    const errorContext: ErrorContext = {
      userId,
      chatId,
      messageId: callbackQuery.message?.message_id,
      timestamp: new Date(),
    };

    try {
      // Authenticate user
      const authResult = await this.authService.authenticateUser(
        callbackQuery.from,
        chatId
      );

      if (!authResult.success) {
        await this.apiClient.answerCallbackQuery(
          callbackQuery.id,
          "🚫 Authentication required"
        );
        return;
      }

      const user = authResult.user!;

      // Check access for callback action
      const action = this.getActionFromCallbackData(data);
      const resource = this.getResourceFromCallbackData(data);

      const dataAccessContext: DataAccessContext = {
        user,
        resource,
        action,
        requestData: { callbackData: data },
        timestamp: new Date(),
        clientInfo: {
          chatId,
          messageId: callbackQuery.message?.message_id,
        },
      };

      const accessResult =
        await this.dataAccessController.validateAccess(dataAccessContext);

      if (!accessResult.allowed) {
        await this.apiClient.answerCallbackQuery(
          callbackQuery.id,
          "🚫 Access denied"
        );
        return;
      }

      // Process callback based on data
      await this.processCallbackWithErrorHandling(callbackQuery, user);
    } catch (error: any) {
      const errorResponse = await this.errorHandler.handleError(
        error,
        errorContext
      );

      await this.apiClient.answerCallbackQuery(
        callbackQuery.id,
        "❌ An error occurred"
      );
    }
  }

  async sendUnauthorizedMessage(chatId: number): Promise<void> {
    const errorContext: ErrorContext = {
      chatId,
      timestamp: new Date(),
    };

    const errorResponse = await this.errorHandler.handleAuthenticationError(
      { message: "Unauthorized access" },
      errorContext
    );

    if (errorResponse.userMessage) {
      await this.sendMessageWithErrorHandling(
        chatId,
        errorResponse.userMessage,
        errorResponse.actionButtons
      );
    }
  }

  async handleUnsupportedMessage(chatId: number): Promise<void> {
    await this.sendMessageWithErrorHandling(
      chatId,
      "❌ Sorry, I only support text messages at the moment. Please send me a text message or use one of the available commands."
    );
  }

  private async handleUnknownCommand(
    chatId: number,
    command: string
  ): Promise<void> {
    await this.sendMessageWithErrorHandling(
      chatId,
      `❌ Unknown command: ${command}\n\nType /help to see available commands.`,
      [{ text: "📚 Show Help", callbackData: "show_help" }]
    );
  }

  private async sendMessageWithErrorHandling(
    chatId: number,
    text: string,
    actionButtons?: Array<{ text: string; callbackData: string }>
  ): Promise<void> {
    try {
      const replyMarkup = actionButtons
        ? {
            inline_keyboard: [
              actionButtons.map(button => ({
                text: button.text,
                callback_data: button.callbackData,
              })),
            ],
          }
        : undefined;

      const response = await this.apiClient.sendMessage({
        chat_id: chatId,
        text,
        reply_markup: replyMarkup,
        parse_mode: "Markdown",
      });

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.description}`);
      }
    } catch (error: any) {
      // Handle message sending errors
      const errorContext: ErrorContext = {
        chatId,
        timestamp: new Date(),
      };

      const errorResponse = await this.errorHandler.handleError(
        error,
        errorContext
      );

      // Try to send a simple error message without formatting
      try {
        await this.apiClient.sendMessage({
          chat_id: chatId,
          text: "❌ Failed to send message. Please try again.",
        });
      } catch (fallbackError) {
        console.error("Failed to send fallback error message:", fallbackError);
      }
    }
  }

  private async sendAIResponseWithErrorHandling(
    chatId: number,
    aiResponse: any
  ): Promise<void> {
    try {
      // Send main response
      await this.sendMessageWithErrorHandling(
        chatId,
        aiResponse.text,
        aiResponse.actionButtons
      );

      // Send follow-up questions if available
      if (
        aiResponse.followUpQuestions &&
        aiResponse.followUpQuestions.length > 0
      ) {
        const followUpText =
          "💡 **Follow-up suggestions:**\n\n" +
          aiResponse.followUpQuestions
            .map((q: string, i: number) => `${i + 1}. ${q}`)
            .join("\n");

        await this.sendMessageWithErrorHandling(chatId, followUpText);
      }

      // Send dashboard links if available
      if (aiResponse.dashboardLinks && aiResponse.dashboardLinks.length > 0) {
        const linksText =
          "📊 **Related dashboards:**\n\n" +
          aiResponse.dashboardLinks
            .map((link: any) => `• [${link.title}](${link.url})`)
            .join("\n");

        await this.sendMessageWithErrorHandling(chatId, linksText);
      }
    } catch (error: any) {
      const errorContext: ErrorContext = {
        chatId,
        timestamp: new Date(),
        resource: "ai_response",
        action: "send",
      };

      await this.errorHandler.handleError(error, errorContext);
    }
  }

  private async processCallbackWithErrorHandling(
    callbackQuery: any,
    user: TelegramUserProfile
  ): Promise<void> {
    const data = callbackQuery.data;
    const chatId = callbackQuery.message?.chat?.id;

    try {
      // Handle different callback types
      if (data.startsWith("retry_")) {
        await this.handleRetryCallback(callbackQuery, user);
      } else if (data.startsWith("auth_")) {
        await this.handleAuthCallback(callbackQuery, user);
      } else if (data.startsWith("show_")) {
        await this.handleShowCallback(callbackQuery, user);
      } else if (data.startsWith("contact_")) {
        await this.handleContactCallback(callbackQuery, user);
      } else {
        // Default AI command handling
        await this.aiCommands.handleCallbackQuery(callbackQuery, user);
      }

      await this.apiClient.answerCallbackQuery(
        callbackQuery.id,
        "✅ Processed"
      );
    } catch (error: any) {
      console.error("Callback processing error:", error);
      await this.apiClient.answerCallbackQuery(
        callbackQuery.id,
        "❌ Error occurred"
      );
    }
  }

  private getResourceFromCommand(command: string): string {
    const commandResourceMap: { [key: string]: string } = {
      "/dashboard": "dashboard",
      "/financial": "financial_data",
      "/marketing": "marketing_data",
      "/reports": "reports",
      "/settings": "settings",
      "/ask": "ai_assistant",
      "/analyze": "ai_assistant",
      "/status": "system_status",
    };

    return commandResourceMap[command] || "general";
  }

  private getActionFromCallbackData(data: string): string {
    if (data.startsWith("retry_")) return "retry";
    if (data.startsWith("auth_")) return "authenticate";
    if (data.startsWith("show_")) return "view";
    if (data.startsWith("contact_")) return "contact";
    return "interact";
  }

  private getResourceFromCallbackData(data: string): string {
    if (data.includes("permissions")) return "permissions";
    if (data.includes("admin")) return "admin";
    if (data.includes("support")) return "support";
    if (data.includes("help")) return "help";
    if (data.includes("examples")) return "examples";
    return "general";
  }

  private async handleStartCommand(
    message: TelegramMessage,
    user: TelegramUserProfile
  ): Promise<void> {
    try {
      const welcomeText = `🎉 **Welcome to SKC BI Dashboard Bot!**

Hello ${user.first_name}! 👋

**Your Account Details:**
• Name: ${user.first_name} ${user.last_name || ""}
• Role: ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
• Status: ${user.status}

**Available Commands:**
• /dashboard - View dashboard overview
• /financial - Financial performance metrics
• /marketing - Marketing analytics and ROI
• /reports - Generate custom reports
• /settings - Your account settings
• /help - Show all commands

**Quick Actions:**`;

      const actionButtons = [
        { text: "📊 Dashboard", callbackData: "show_dashboard" },
        { text: "💰 Financial", callbackData: "show_financial" },
        { text: "📈 Marketing", callbackData: "show_marketing" },
        { text: "❓ Help", callbackData: "show_help" },
      ];

      await this.sendMessageWithErrorHandling(
        message.chat.id,
        welcomeText,
        actionButtons
      );
    } catch (error: any) {
      throw new Error(`Start command failed: ${error.message}`);
    }
  }

  private async handleHelpCommand(
    message: TelegramMessage,
    user: TelegramUserProfile
  ): Promise<void> {
    try {
      const accessibleResources =
        this.dataAccessController.getAccessibleResources(user);

      let helpText = `📚 **Help & Commands**\n\n**Your Role:** ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}\n\n`;

      helpText += `**Available Commands:**\n`;

      if (accessibleResources.includes("dashboard")) {
        helpText += `• /dashboard - View dashboard overview\n`;
      }

      if (accessibleResources.includes("financial_data")) {
        helpText += `• /financial - Financial performance metrics\n`;
      }

      if (accessibleResources.includes("marketing_data")) {
        helpText += `• /marketing - Marketing analytics and ROI\n`;
      }

      if (accessibleResources.includes("reports")) {
        helpText += `• /reports - Generate custom reports\n`;
      }

      helpText += `• /ask [question] - Ask the AI assistant\n`;
      helpText += `• /analyze [data] - Analyze specific data\n`;
      helpText += `• /settings - Your account settings\n`;
      helpText += `• /help - Show this help message\n\n`;

      helpText += `**Tips:**\n`;
      helpText += `• Use natural language to ask questions\n`;
      helpText += `• Commands are case-insensitive\n`;
      helpText += `• Type /ask followed by your question for AI assistance\n\n`;

      helpText += `**Need more help?** Contact your administrator.`;

      await this.sendMessageWithErrorHandling(message.chat.id, helpText);
    } catch (error: any) {
      throw new Error(`Help command failed: ${error.message}`);
    }
  }

  private async handleDashboardCommand(
    message: TelegramMessage,
    user: TelegramUserProfile
  ): Promise<void> {
    // Implementation for dashboard command
  }

  private async handleFinancialCommand(
    message: TelegramMessage,
    user: TelegramUserProfile
  ): Promise<void> {
    // Implementation for financial command
  }

  private async handleMarketingCommand(
    message: TelegramMessage,
    user: TelegramUserProfile
  ): Promise<void> {
    // Implementation for marketing command
  }

  private async handleReportsCommand(
    message: TelegramMessage,
    user: TelegramUserProfile
  ): Promise<void> {
    // Implementation for reports command
  }

  private async handleSettingsCommand(
    message: TelegramMessage,
    user: TelegramUserProfile
  ): Promise<void> {
    // Implementation for settings command
  }

  private async handleStatusCommand(
    message: TelegramMessage,
    user: TelegramUserProfile
  ): Promise<void> {
    // Implementation for status command
  }

  private async handleRetryCallback(
    callbackQuery: any,
    user: TelegramUserProfile
  ): Promise<void> {
    // Implementation for retry callbacks
  }

  private async handleAuthCallback(
    callbackQuery: any,
    user: TelegramUserProfile
  ): Promise<void> {
    // Implementation for auth callbacks
  }

  private async handleShowCallback(
    callbackQuery: any,
    user: TelegramUserProfile
  ): Promise<void> {
    // Implementation for show callbacks
  }

  private async handleContactCallback(
    callbackQuery: any,
    user: TelegramUserProfile
  ): Promise<void> {
    // Implementation for contact callbacks
  }
}
