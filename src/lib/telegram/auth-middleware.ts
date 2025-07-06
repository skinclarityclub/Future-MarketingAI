import {
  TelegramAuthService,
  TelegramUserProfile,
  TelegramSession,
} from "./auth-service";
import { TelegramMessage, TelegramBotConfig } from "./bot-config";
import { TelegramApiClient } from "./api-client";

export interface AuthenticatedContext {
  user: TelegramUserProfile;
  session: TelegramSession;
  hasPermission: (permission: string) => boolean;
}

export class TelegramAuthMiddleware {
  private authService: TelegramAuthService;
  private apiClient: TelegramApiClient;
  private config: TelegramBotConfig;

  constructor(
    authService: TelegramAuthService,
    apiClient: TelegramApiClient,
    config: TelegramBotConfig
  ) {
    this.authService = authService;
    this.apiClient = apiClient;
    this.config = config;
  }

  /**
   * Authenticate user and create context
   */
  async authenticate(message: TelegramMessage): Promise<{
    success: boolean;
    context?: AuthenticatedContext;
    error?: string;
  }> {
    try {
      const telegramUser = message.from;
      const chatId = message.chat.id;

      // Authenticate user
      const authResult = await this.authService.authenticateUser(
        telegramUser,
        chatId
      );

      if (!authResult.success) {
        return {
          success: false,
          error: authResult.error,
        };
      }

      if (!authResult.user || !authResult.session) {
        return {
          success: false,
          error: "Authentication failed",
        };
      }

      // Create authenticated context
      const context: AuthenticatedContext = {
        user: authResult.user,
        session: authResult.session,
        hasPermission: (permission: string) =>
          this.authService.hasPermission(authResult.user!, permission),
      };

      return {
        success: true,
        context,
      };
    } catch (error) {
      console.error("Authentication middleware error:", error);
      return {
        success: false,
        error: "Authentication system error",
      };
    }
  }

  /**
   * Validate existing session
   */
  async validateSession(sessionToken: string): Promise<{
    valid: boolean;
    context?: AuthenticatedContext;
    error?: string;
  }> {
    try {
      const sessionResult =
        await this.authService.validateSession(sessionToken);

      if (!sessionResult.valid) {
        return {
          valid: false,
          error: sessionResult.error,
        };
      }

      if (!sessionResult.user || !sessionResult.session) {
        return {
          valid: false,
          error: "Session validation failed",
        };
      }

      // Create authenticated context
      const context: AuthenticatedContext = {
        user: sessionResult.user,
        session: sessionResult.session,
        hasPermission: (permission: string) =>
          this.authService.hasPermission(sessionResult.user!, permission),
      };

      return {
        valid: true,
        context,
      };
    } catch (error) {
      console.error("Session validation error:", error);
      return {
        valid: false,
        error: "Session validation system error",
      };
    }
  }

  /**
   * Check if user has required permission
   */
  async requirePermission(
    context: AuthenticatedContext,
    permission: string,
    chatId: number
  ): Promise<boolean> {
    if (!context.hasPermission(permission)) {
      await this.sendPermissionDeniedMessage(chatId, permission);
      return false;
    }
    return true;
  }

  /**
   * Send permission denied message
   */
  private async sendPermissionDeniedMessage(
    chatId: number,
    permission: string
  ): Promise<void> {
    const message = `🚫 **Access Denied**\n\nYou don't have permission to perform this action.\n\nRequired permission: \`${permission}\`\n\nPlease contact an administrator if you believe this is an error.`;

    await this.apiClient.sendMessage({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
    });
  }

  /**
   * Send authentication failed message
   */
  async sendAuthenticationFailedMessage(
    chatId: number,
    error?: string
  ): Promise<void> {
    const message =
      error ||
      "🚫 Authentication failed. Please try again or contact an administrator.";

    await this.apiClient.sendMessage({
      chat_id: chatId,
      text: message,
    });
  }

  /**
   * Send welcome message for new users
   */
  async sendWelcomeMessage(
    context: AuthenticatedContext,
    chatId: number
  ): Promise<void> {
    const { user } = context;

    const welcomeMessage = `🎉 **Welcome to SKC BI Dashboard Bot!**

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

**Your Permissions:**
${this.formatPermissions(user.permissions)}

Ready to explore your business intelligence data! 🚀`;

    await this.apiClient.sendMessage({
      chat_id: chatId,
      text: welcomeMessage,
      parse_mode: "Markdown",
    });
  }

  /**
   * Format permissions for display
   */
  private formatPermissions(permissions: string[]): string {
    const permissionGroups: { [key: string]: string[] } = {};

    permissions.forEach(permission => {
      const [group] = permission.split(".");
      if (!permissionGroups[group]) {
        permissionGroups[group] = [];
      }
      permissionGroups[group].push(permission);
    });

    let formatted = "";
    Object.entries(permissionGroups).forEach(([group, perms]) => {
      formatted += `• **${group.charAt(0).toUpperCase() + group.slice(1)}**: `;
      formatted += perms.map(p => p.split(".")[1]).join(", ");
      formatted += "\n";
    });

    return formatted;
  }

  /**
   * Log user activity
   */
  async logActivity(
    context: AuthenticatedContext,
    action: string,
    details?: any
  ): Promise<void> {
    try {
      // This could be extended to log to database
      console.log(
        `User Activity: ${context.user.telegram_id} - ${action}`,
        details
      );
    } catch (error) {
      console.error("Activity logging error:", error);
    }
  }

  /**
   * Get user session info for display
   */
  async getUserSessionInfo(context: AuthenticatedContext): Promise<string> {
    try {
      const metrics = await this.authService.getUserSecurityMetrics(
        context.user.telegram_id
      );

      return `**Session Information:**
• Session ID: ${context.session.id.substring(0, 8)}...
• Created: ${new Date(context.session.created_at).toLocaleString("nl-NL")}
• Last Activity: ${new Date(context.session.last_activity).toLocaleString("nl-NL")}
• Expires: ${new Date(context.session.expires_at).toLocaleString("nl-NL")}

**Security Metrics (Last 30 days):**
• Total Login Attempts: ${metrics.totalAttempts}
• Successful Logins: ${metrics.successfulAttempts}
• Failed Attempts: ${metrics.failedAttempts}
• Active Sessions: ${metrics.activeSessions}
• Last Login: ${metrics.lastLogin ? metrics.lastLogin.toLocaleString("nl-NL") : "Never"}`;
    } catch (error) {
      console.error("Get session info error:", error);
      return "Unable to retrieve session information";
    }
  }

  /**
   * Logout user
   */
  async logout(context: AuthenticatedContext, chatId: number): Promise<void> {
    try {
      await this.authService.invalidateSession(context.session.session_token);

      await this.apiClient.sendMessage({
        chat_id: chatId,
        text: "👋 **Logged Out Successfully**\n\nYour session has been terminated. Send /start to login again.",
        parse_mode: "Markdown",
      });
    } catch (error) {
      console.error("Logout error:", error);
      await this.apiClient.sendMessage({
        chat_id: chatId,
        text: "❌ Error during logout. Please try again.",
      });
    }
  }

  /**
   * Handle rate limiting
   */
  async handleRateLimit(chatId: number, retryAfter: number): Promise<void> {
    const message = `⏱️ **Rate Limit Exceeded**\n\nPlease slow down! You can try again in ${retryAfter} seconds.\n\nThis protection helps keep the bot responsive for everyone.`;

    await this.apiClient.sendMessage({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
    });
  }

  /**
   * Check if command requires authentication
   */
  commandRequiresAuth(command: string): boolean {
    const publicCommands = ["/start", "/help"];
    return !publicCommands.includes(command);
  }

  /**
   * Get required permission for command
   */
  getCommandPermission(command: string): string | null {
    const commandPermissions: { [key: string]: string } = {
      "/dashboard": "dashboard.view",
      "/financial": "financial.view",
      "/marketing": "marketing.view",
      "/reports": "reports.view",
      "/settings": "settings.view",
      "/status": "dashboard.view",
      "/export": "dashboard.export",
      "/admin": "users.manage",
    };

    return commandPermissions[command] || null;
  }
}
