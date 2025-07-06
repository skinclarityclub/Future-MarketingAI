import { TelegramBotConfig } from "./bot-config";

interface SendMessageOptions {
  chat_id: number | string;
  text: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  reply_markup?: any;
  disable_web_page_preview?: boolean;
  disable_notification?: boolean;
  reply_to_message_id?: number;
}

interface TelegramApiResponse<T = any> {
  ok: boolean;
  result?: T;
  error_code?: number;
  description?: string;
}

export class TelegramApiClient {
  private baseUrl: string;
  private config: TelegramBotConfig;

  constructor(config: TelegramBotConfig) {
    this.config = config;
    this.baseUrl = `https://api.telegram.org/bot${config.token}`;
  }

  async sendMessage(options: SendMessageOptions): Promise<TelegramApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error sending Telegram message:", error);
      }
      return {
        ok: false,
        error_code: 500,
        description: "Internal server error",
      };
    }
  }

  async sendTypingAction(chatId: number | string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/sendChatAction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          action: "typing",
        }),
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error sending typing action:", error);
      }
    }
  }

  async setWebhook(webhookUrl: string): Promise<TelegramApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/setWebhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message", "edited_message", "callback_query"],
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error setting webhook:", error);
      }
      return {
        ok: false,
        error_code: 500,
        description: "Failed to set webhook",
      };
    }
  }

  async deleteWebhook(): Promise<TelegramApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/deleteWebhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error deleting webhook:", error);
      }
      return {
        ok: false,
        error_code: 500,
        description: "Failed to delete webhook",
      };
    }
  }

  async getMe(): Promise<TelegramApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/getMe`);
      const data = await response.json();
      return data;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error getting bot info:", error);
      }
      return {
        ok: false,
        error_code: 500,
        description: "Failed to get bot info",
      };
    }
  }

  async answerCallbackQuery(
    callbackQueryId: string,
    text?: string
  ): Promise<TelegramApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/answerCallbackQuery`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text: text || "Processing...",
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error answering callback query:", error);
      }
      return {
        ok: false,
        error_code: 500,
        description: "Failed to answer callback query",
      };
    }
  }

  async editMessageText(
    chatId: number | string,
    messageId: number,
    text: string,
    replyMarkup?: any
  ): Promise<TelegramApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/editMessageText`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text: text,
          reply_markup: replyMarkup,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error editing message:", error);
      }
      return {
        ok: false,
        error_code: 500,
        description: "Failed to edit message",
      };
    }
  }

  async answerInlineQuery(
    inlineQueryId: string,
    results: any[],
    cacheTime = 300
  ): Promise<TelegramApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/answerInlineQuery`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inline_query_id: inlineQueryId,
          results: results,
          cache_time: cacheTime,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error answering inline query:", error);
      }
      return {
        ok: false,
        error_code: 500,
        description: "Failed to answer inline query",
      };
    }
  }

  async sendDocument(
    chatId: number | string,
    document: string | Buffer,
    caption?: string
  ): Promise<TelegramApiResponse> {
    try {
      const formData = new FormData();
      formData.append("chat_id", chatId.toString());

      if (typeof document === "string") {
        formData.append("document", document);
      } else {
        formData.append("document", new Blob([document]), "document.pdf");
      }

      if (caption) {
        formData.append("caption", caption);
      }

      const response = await fetch(`${this.baseUrl}/sendDocument`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error sending document:", error);
      }
      return {
        ok: false,
        error_code: 500,
        description: "Failed to send document",
      };
    }
  }
}

export type { SendMessageOptions, TelegramApiResponse };
