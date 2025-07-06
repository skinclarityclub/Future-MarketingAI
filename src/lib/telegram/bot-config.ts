export interface TelegramBotConfig {
  token: string;
  webhookUrl?: string;
  allowedUsers?: string[];
  adminUsers?: string[];
  maxMessageLength: number;
  rateLimitPerMinute: number;
  sessionTimeout: number;
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_bot: boolean;
}

interface TelegramMessage {
  message_id: number;
  from: TelegramUser;
  chat: {
    id: number;
    type: string;
    title?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  date: number;
  text?: string;
  entities?: Array<{
    type: string;
    offset: number;
    length: number;
  }>;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  callback_query?: {
    id: string;
    from: TelegramUser;
    message?: TelegramMessage;
    data?: string;
  };
}

export const getBotConfig = (): TelegramBotConfig => {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN environment variable is required");
  }

  return {
    token,
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
    allowedUsers: process.env.TELEGRAM_ALLOWED_USERS?.split(",") || [],
    adminUsers: process.env.TELEGRAM_ADMIN_USERS?.split(",") || [],
    maxMessageLength: parseInt(
      process.env.TELEGRAM_MAX_MESSAGE_LENGTH || "4096"
    ),
    rateLimitPerMinute: parseInt(process.env.TELEGRAM_RATE_LIMIT || "20"),
    sessionTimeout: parseInt(process.env.TELEGRAM_SESSION_TIMEOUT || "3600000"), // 1 hour
  };
};

export const validateBotToken = (token: string): boolean => {
  // Telegram bot tokens follow the format: <bot_id>:<bot_token>
  const tokenRegex = /^\d+:[A-Za-z0-9_-]{35}$/;
  return tokenRegex.test(token);
};

export const isUserAuthorized = (
  userId: string,
  config: TelegramBotConfig
): boolean => {
  // If no allowed users specified, allow all users
  if (!config.allowedUsers || config.allowedUsers.length === 0) {
    return true;
  }

  return (
    config.allowedUsers.includes(userId) ||
    (config.adminUsers && config.adminUsers.includes(userId))
  );
};

export const isAdminUser = (
  userId: string,
  config: TelegramBotConfig
): boolean => {
  return config.adminUsers ? config.adminUsers.includes(userId) : false;
};

export const formatTelegramMessage = (
  text: string,
  maxLength: number = 4096
): string[] => {
  if (text.length <= maxLength) {
    return [text];
  }

  const messages: string[] = [];
  let currentMessage = "";

  const lines = text.split("\n");

  for (const line of lines) {
    if ((currentMessage + line + "\n").length > maxLength) {
      if (currentMessage) {
        messages.push(currentMessage.trim());
        currentMessage = "";
      }

      // If single line is too long, split it
      if (line.length > maxLength) {
        const chunks =
          line.match(new RegExp(`.{1,${maxLength - 3}}`, "g")) || [];
        for (let i = 0; i < chunks.length; i++) {
          messages.push(
            i === chunks.length - 1 ? chunks[i] : chunks[i] + "..."
          );
        }
      } else {
        currentMessage = line + "\n";
      }
    } else {
      currentMessage += line + "\n";
    }
  }

  if (currentMessage) {
    messages.push(currentMessage.trim());
  }

  return messages;
};

export const escapeMarkdown = (text: string): string => {
  // Escape special characters for Telegram MarkdownV2
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");
};

export const createInlineKeyboard = (
  buttons: Array<Array<{ text: string; callback_data: string }>>
) => {
  return {
    inline_keyboard: buttons,
  };
};

export type { TelegramUser, TelegramMessage, TelegramUpdate };
