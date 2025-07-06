import { TelegramApiClient } from "./api-client";
import { createInlineKeyboard } from "./bot-config";
import { type AuthenticatedContext } from "./auth-middleware";
import TelegramAIBridge, { type TelegramAIQuery } from "./ai-bridge";

export class TelegramAICommands {
  constructor(
    private apiClient: TelegramApiClient,
    private aiBridge: TelegramAIBridge
  ) {}

  async handleAskCommand(
    chatId: number,
    userId: string,
    context: AuthenticatedContext,
    args: string[]
  ): Promise<void> {
    if (args.length === 0) {
      await this.apiClient.sendMessage({
        chat_id: chatId,
        text: "❓ **Ask AI Assistant**\n\nUsage: `/ask <your question>`\n\nExample:\n`/ask What was our revenue last month?`\n`/ask Show me top performing marketing campaigns`",
        parse_mode: "Markdown",
      });
      return;
    }

    const question = args.join(" ");

    await this.apiClient.sendTypingAction(chatId);

    try {
      const aiQuery: TelegramAIQuery = {
        message: question,
        userId: userId,
        chatId: chatId,
        userRole: context.user.role,
        includeMLInsights: true,
        analysisType: "insights",
        explanationLevel: "detailed",
      };

      const aiResponse = await this.aiBridge.processQuery(aiQuery);

      await this.apiClient.sendMessage({
        chat_id: chatId,
        text: `🤖 **AI Assistant**\n\n${aiResponse.text}`,
        parse_mode: "Markdown",
      });

      // Send action buttons if available
      if (aiResponse.actionButtons && aiResponse.actionButtons.length > 0) {
        const keyboard = createInlineKeyboard(
          aiResponse.actionButtons.map(button => [
            {
              text: button.text,
              callback_data: button.callbackData,
              url: button.url,
            },
          ])
        );

        await this.apiClient.sendMessage({
          chat_id: chatId,
          text: "🔧 Available actions:",
          reply_markup: keyboard,
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("AI ask command error:", error);
      }
      await this.apiClient.sendMessage({
        chat_id: chatId,
        text: "❌ Sorry, I couldn't process your question. Please try again or contact support.",
      });
    }
  }

  async handleQuickAnalysisCommand(
    chatId: number,
    userId: string,
    context: AuthenticatedContext,
    analysisType: "sales" | "customers" | "revenue" | "performance"
  ): Promise<void> {
    await this.apiClient.sendTypingAction(chatId);

    try {
      const aiResponse = await this.aiBridge.handleQuickDataQuery(
        analysisType,
        userId,
        "month"
      );

      await this.apiClient.sendMessage({
        chat_id: chatId,
        text: `📊 **${analysisType.charAt(0).toUpperCase() + analysisType.slice(1)} Analysis**\n\n${aiResponse.text}`,
        parse_mode: "Markdown",
      });

      if (aiResponse.actionButtons && aiResponse.actionButtons.length > 0) {
        const keyboard = createInlineKeyboard(
          aiResponse.actionButtons.map(button => [
            {
              text: button.text,
              callback_data: button.callbackData,
              url: button.url,
            },
          ])
        );

        await this.apiClient.sendMessage({
          chat_id: chatId,
          text: "🔧 Available actions:",
          reply_markup: keyboard,
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Quick analysis error:", error);
      }
      await this.apiClient.sendMessage({
        chat_id: chatId,
        text: `❌ Sorry, I couldn't generate the ${analysisType} analysis. Please try again.`,
      });
    }
  }

  async handlePreferencesCommand(
    chatId: number,
    userId: string,
    context: AuthenticatedContext,
    args: string[]
  ): Promise<void> {
    if (args.length === 0) {
      // Show current preferences and options
      const keyboard = createInlineKeyboard([
        [
          {
            text: "🎓 Expertise: Beginner",
            callback_data: "pref_expertise_beginner",
          },
          {
            text: "🎓 Expertise: Advanced",
            callback_data: "pref_expertise_advanced",
          },
        ],
        [
          { text: "💬 Style: Concise", callback_data: "pref_style_concise" },
          { text: "💬 Style: Detailed", callback_data: "pref_style_detailed" },
        ],
        [
          { text: "📊 Analysis: Basic", callback_data: "pref_analysis_basic" },
          {
            text: "📊 Analysis: Comprehensive",
            callback_data: "pref_analysis_comprehensive",
          },
        ],
      ]);

      await this.apiClient.sendMessage({
        chat_id: chatId,
        text: `⚙️ **AI Assistant Preferences**\n\nCurrent settings for ${context.user.first_name}:\n\n• **Expertise Level**: Intermediate\n• **Communication Style**: Detailed\n• **Analysis Depth**: Comprehensive\n• **Language**: English\n\nSelect options below to update your preferences:`,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
      return;
    }

    // Handle preference updates via command arguments
    const [setting, value] = args;

    const preferences: any = {};

    switch (setting?.toLowerCase()) {
      case "expertise":
        if (
          ["beginner", "intermediate", "advanced", "expert"].includes(
            value?.toLowerCase()
          )
        ) {
          preferences.expertiseLevel = value.toLowerCase();
        }
        break;
      case "style":
        if (
          ["concise", "detailed", "visual", "technical"].includes(
            value?.toLowerCase()
          )
        ) {
          preferences.communicationStyle = value.toLowerCase();
        }
        break;
      case "analysis":
        if (
          ["basic", "detailed", "comprehensive"].includes(value?.toLowerCase())
        ) {
          preferences.preferredAnalysisDepth = value.toLowerCase();
        }
        break;
      case "language":
        if (["en", "nl", "de", "fr"].includes(value?.toLowerCase())) {
          preferences.language = value.toLowerCase();
        }
        break;
      default:
        await this.apiClient.sendMessage({
          chat_id: chatId,
          text: "❌ Invalid preference setting. Use: `/preferences [expertise|style|analysis|language] [value]`",
        });
        return;
    }

    if (Object.keys(preferences).length > 0) {
      const success = await this.aiBridge.updateUserPreferences(
        userId,
        preferences
      );

      if (success) {
        await this.apiClient.sendMessage({
          chat_id: chatId,
          text: `✅ AI preferences updated successfully!\n\n**${setting}** set to: **${value}**`,
          parse_mode: "Markdown",
        });
      } else {
        await this.apiClient.sendMessage({
          chat_id: chatId,
          text: "❌ Failed to update preferences. Please try again.",
        });
      }
    }
  }

  async handleHistoryCommand(
    chatId: number,
    userId: string,
    context: AuthenticatedContext
  ): Promise<void> {
    try {
      const history = await this.aiBridge.getConversationHistory(
        userId,
        undefined,
        5
      );

      if (history.length === 0) {
        await this.apiClient.sendMessage({
          chat_id: chatId,
          text: "📝 **Conversation History**\n\nNo recent conversations found. Start chatting with the AI assistant to see your history here!",
          parse_mode: "Markdown",
        });
        return;
      }

      const historyText = history
        .slice(0, 5)
        .map(
          (item, index) =>
            `**${index + 1}.** ${item.query}\n*AI: ${item.response.substring(0, 100)}...*`
        )
        .join("\n\n");

      const keyboard = createInlineKeyboard([
        [{ text: "🗑️ Clear History", callback_data: "clear_ai_history" }],
        [{ text: "📊 Export History", callback_data: "export_ai_history" }],
      ]);

      await this.apiClient.sendMessage({
        chat_id: chatId,
        text: `📝 **Recent Conversations**\n\n${historyText}`,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("History command error:", error);
      }
      await this.apiClient.sendMessage({
        chat_id: chatId,
        text: "❌ Could not retrieve conversation history. Please try again.",
      });
    }
  }

  async handleAnalyzeCommand(
    chatId: number,
    userId: string,
    context: AuthenticatedContext,
    args: string[]
  ): Promise<void> {
    if (args.length === 0) {
      const availableQueries = this.aiBridge.getAvailableQuickQueries(
        context.user.role
      );

      const keyboard = createInlineKeyboard(
        availableQueries.map(query => [
          {
            text: `📊 ${query.charAt(0).toUpperCase() + query.slice(1)}`,
            callback_data: `quick_${query}`,
          },
        ])
      );

      await this.apiClient.sendMessage({
        chat_id: chatId,
        text: `📊 **Data Analysis**\n\nChoose a quick analysis or specify what you'd like to analyze:\n\n**Usage:**\n\`/analyze sales\`\n\`/analyze customer churn\`\n\`/analyze marketing roi\`\n\n**Available Quick Analyses:**`,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
      return;
    }

    const analysisRequest = args.join(" ");
    await this.apiClient.sendTypingAction(chatId);

    try {
      const aiQuery: TelegramAIQuery = {
        message: `Analyze ${analysisRequest}`,
        userId: userId,
        chatId: chatId,
        userRole: context.user.role,
        includeMLInsights: true,
        analysisType: "analysis",
        explanationLevel: "detailed",
      };

      const aiResponse = await this.aiBridge.processQuery(aiQuery);

      await this.apiClient.sendMessage({
        chat_id: chatId,
        text: `📊 **Analysis Results**\n\n${aiResponse.text}`,
        parse_mode: "Markdown",
      });

      if (aiResponse.hasVisualizations) {
        await this.apiClient.sendMessage({
          chat_id: chatId,
          text: "📈 Charts and visualizations are available in the dashboard. Click the button below to view them.",
          reply_markup: createInlineKeyboard([
            [
              { text: "📊 View Charts", callback_data: "show_visualizations" },
              {
                text: "🖥️ Open Dashboard",
                url: process.env.NEXT_PUBLIC_DASHBOARD_URL || "/dashboard",
              },
            ],
          ]),
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Analyze command error:", error);
      }
      await this.apiClient.sendMessage({
        chat_id: chatId,
        text: "❌ Sorry, I couldn't complete the analysis. Please try again or rephrase your request.",
      });
    }
  }
}
