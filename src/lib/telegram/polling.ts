import { TelegramApiClient } from "./api-client";
import { TelegramMessageHandler } from "./message-handler";
import { getBotConfig } from "./bot-config";

export class TelegramPolling {
  private apiClient: TelegramApiClient;
  private messageHandler: TelegramMessageHandler;
  private config = getBotConfig();
  private isPolling = false;
  private lastUpdateId = 0;
  private pollingInterval = 1000; // 1 second

  constructor() {
    this.apiClient = new TelegramApiClient(this.config);
    this.messageHandler = new TelegramMessageHandler(
      this.apiClient,
      this.config
    );
  }

  async startPolling(): Promise<void> {
    if (this.isPolling) {
      if (process.env.NODE_ENV === "development") {
        console.log("Polling is already running");
      }
      return;
    }

    if (process.env.NODE_ENV === "development") {
      console.log("🚀 Starting Telegram bot polling for development...");
    }
    this.isPolling = true;

    // Remove webhook first
    await this.apiClient.deleteWebhook();
    if (process.env.NODE_ENV === "development") {
      console.log("✅ Webhook removed, switching to polling mode");
    }

    this.poll();
  }

  stopPolling(): void {
    if (process.env.NODE_ENV === "development") {
      console.log("🛑 Stopping Telegram bot polling");
    }
    this.isPolling = false;
  }

  private async poll(): Promise<void> {
    while (this.isPolling) {
      try {
        const updates = await this.getUpdates();

        if (updates && updates.length > 0) {
          for (const update of updates) {
            await this.processUpdate(update);
            this.lastUpdateId = update.update_id + 1;
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Polling error:", error);
        }
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, this.pollingInterval));
    }
  }

  private async getUpdates(): Promise<any[]> {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.config.token}/getUpdates?offset=${this.lastUpdateId}&timeout=10`
      );

      const data = await response.json();

      if (data.ok) {
        return data.result;
      } else {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to get updates:", data.description);
        }
        return [];
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error getting updates:", error);
      }
      return [];
    }
  }

  private async processUpdate(update: any): Promise<void> {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("📨 Processing update:", update.update_id);
      }

      if (update.message) {
        await this.handleMessage(update.message);
      } else if (update.edited_message) {
        await this.handleMessage(update.edited_message);
      } else if (update.callback_query) {
        await this.messageHandler.handleCallbackQuery(update.callback_query);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error processing update:", error);
      }
    }
  }

  private async handleMessage(message: any): Promise<void> {
    const userId = message.from.id.toString();
    const chatId = message.chat.id;

    // Check authorization
    if (!this.isUserAuthorized(userId)) {
      await this.messageHandler.sendUnauthorizedMessage(chatId);
      return;
    }

    // Handle different message types
    if (message.text) {
      if (message.text.startsWith("/")) {
        await this.messageHandler.handleCommand(message);
      } else {
        await this.messageHandler.handleTextMessage(message);
      }
    } else {
      await this.messageHandler.handleUnsupportedMessage(chatId);
    }
  }

  private isUserAuthorized(userId: string): boolean {
    // If no allowed users specified, allow all users
    if (this.config.allowedUsers.length === 0) {
      return true;
    }

    return (
      this.config.allowedUsers.includes(userId) ||
      this.config.adminUsers.includes(userId)
    );
  }

  async getBotInfo(): Promise<any> {
    const response = await this.apiClient.getMe();
    return response;
  }
}
