import { getBotConfig, validateBotToken } from "./bot-config";
import { TelegramApiClient } from "./api-client";

export interface BotSetupResult {
  success: boolean;
  message: string;
  botInfo?: any;
  webhookInfo?: any;
}

export class TelegramBotSetup {
  private config = getBotConfig();
  private apiClient = new TelegramApiClient(this.config);

  async validateConfiguration(): Promise<BotSetupResult> {
    try {
      // Validate token format
      if (!validateBotToken(this.config.token)) {
        return {
          success: false,
          message:
            "Invalid bot token format. Expected format: <bot_id>:<bot_token>",
        };
      }

      // Test bot connection
      const botInfo = await this.apiClient.getMe();

      if (!botInfo.ok) {
        return {
          success: false,
          message: `Failed to connect to bot: ${botInfo.description}`,
        };
      }

      return {
        success: true,
        message: "Bot configuration is valid",
        botInfo: botInfo.result,
      };
    } catch (error) {
      return {
        success: false,
        message: `Configuration error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async setupWebhook(webhookUrl: string): Promise<BotSetupResult> {
    try {
      // First validate configuration
      const validation = await this.validateConfiguration();
      if (!validation.success) {
        return validation;
      }

      // Set webhook
      const webhookResult = await this.apiClient.setWebhook(webhookUrl);

      if (!webhookResult.ok) {
        return {
          success: false,
          message: `Failed to set webhook: ${webhookResult.description}`,
        };
      }

      return {
        success: true,
        message: `Webhook successfully set to: ${webhookUrl}`,
        webhookInfo: webhookResult.result,
      };
    } catch (error) {
      return {
        success: false,
        message: `Webhook setup error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async removeWebhook(): Promise<BotSetupResult> {
    try {
      const result = await this.apiClient.deleteWebhook();

      if (!result.ok) {
        return {
          success: false,
          message: `Failed to remove webhook: ${result.description}`,
        };
      }

      return {
        success: true,
        message: "Webhook successfully removed",
      };
    } catch (error) {
      return {
        success: false,
        message: `Error removing webhook: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async getBotInfo(): Promise<BotSetupResult> {
    try {
      const botInfo = await this.apiClient.getMe();

      if (!botInfo.ok) {
        return {
          success: false,
          message: `Failed to get bot info: ${botInfo.description}`,
        };
      }

      return {
        success: true,
        message: "Bot info retrieved successfully",
        botInfo: botInfo.result,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error getting bot info: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  generateWebhookUrl(baseUrl: string): string {
    // Remove trailing slash and add webhook path
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    return `${cleanBaseUrl}/api/telegram/webhook`;
  }

  getRequiredEnvironmentVariables(): string[] {
    return [
      "TELEGRAM_BOT_TOKEN",
      "TELEGRAM_WEBHOOK_URL (optional)",
      "TELEGRAM_ALLOWED_USERS (optional)",
      "TELEGRAM_ADMIN_USERS (optional)",
    ];
  }

  validateEnvironmentVariables(): { valid: boolean; missing: string[] } {
    const required = ["TELEGRAM_BOT_TOKEN"];
    const missing: string[] = [];

    for (const envVar of required) {
      if (!process.env[envVar]) {
        missing.push(envVar);
      }
    }

    return {
      valid: missing.length === 0,
      missing,
    };
  }
}
