import { createClient } from "@supabase/supabase-js";
import { randomBytes, createHash } from "crypto";
import { TelegramUser, TelegramBotConfig } from "./bot-config";

export interface TelegramUserProfile {
  id: string;
  telegram_id: string;
  username?: string;
  first_name: string;
  last_name?: string;
  email?: string;
  role: "admin" | "user" | "viewer" | "analyst";
  status: "active" | "inactive" | "suspended" | "pending";
  permissions: string[];
  created_at: Date;
  updated_at: Date;
  last_login: Date;
}

export interface TelegramSession {
  id: string;
  user_id: string;
  telegram_chat_id: string;
  session_token: string;
  expires_at: Date;
  created_at: Date;
  last_activity: Date;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
  auth_method: "telegram" | "password" | "token";
}

export interface AuthenticationAttempt {
  id: string;
  telegram_id: string;
  telegram_chat_id: string;
  attempt_type: "login" | "access" | "command";
  success: boolean;
  failure_reason?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface RolePermissions {
  admin: string[];
  user: string[];
  viewer: string[];
  analyst: string[];
}

export class TelegramAuthService {
  private config: TelegramBotConfig;
  private supabase: any;
  private readonly ROLE_PERMISSIONS: RolePermissions = {
    admin: [
      "dashboard.view",
      "dashboard.export",
      "financial.view",
      "financial.export",
      "marketing.view",
      "marketing.export",
      "reports.generate",
      "reports.view",
      "reports.export",
      "settings.view",
      "settings.modify",
      "users.manage",
      "audit.view",
    ],
    user: [
      "dashboard.view",
      "dashboard.export",
      "financial.view",
      "financial.export",
      "marketing.view",
      "marketing.export",
      "reports.generate",
      "reports.view",
      "reports.export",
    ],
    analyst: [
      "dashboard.view",
      "dashboard.export",
      "financial.view",
      "marketing.view",
      "reports.generate",
      "reports.view",
    ],
    viewer: [
      "dashboard.view",
      "financial.view",
      "marketing.view",
      "reports.view",
    ],
  };

  constructor(config: TelegramBotConfig) {
    this.config = config;
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Authenticate user via Telegram
   */
  async authenticateUser(
    telegramUser: TelegramUser,
    chatId: number
  ): Promise<{
    success: boolean;
    user?: TelegramUserProfile;
    session?: TelegramSession;
    error?: string;
  }> {
    try {
      // Rate limiting check
      const rateLimitCheck = await this.checkRateLimit(
        telegramUser.id.toString()
      );
      if (!rateLimitCheck.allowed) {
        await this.logAuthAttempt(
          telegramUser.id.toString(),
          chatId.toString(),
          "login",
          false,
          "rate_limit_exceeded"
        );
        return {
          success: false,
          error: `Rate limit exceeded. Try again in ${Math.ceil(rateLimitCheck.retryAfterSeconds || 60)} seconds.`,
        };
      }

      // Check if user exists in database
      let userProfile = await this.getUserProfile(telegramUser.id.toString());

      if (!userProfile) {
        // Check if user is in allowed list
        if (!this.isUserAuthorized(telegramUser.id.toString())) {
          await this.logAuthAttempt(
            telegramUser.id.toString(),
            chatId.toString(),
            "login",
            false,
            "unauthorized"
          );
          return {
            success: false,
            error:
              "🚫 Access denied. Please contact an administrator to get access to the BI Dashboard bot.",
          };
        }

        // Create new user profile
        userProfile = await this.createUserProfile(telegramUser, chatId);
        if (!userProfile) {
          await this.logAuthAttempt(
            telegramUser.id.toString(),
            chatId.toString(),
            "login",
            false,
            "profile_creation_failed"
          );
          return {
            success: false,
            error: "❌ Failed to create user profile. Please try again later.",
          };
        }
      }

      // Check user status
      if (userProfile.status !== "active") {
        await this.logAuthAttempt(
          telegramUser.id.toString(),
          chatId.toString(),
          "login",
          false,
          `user_status_${userProfile.status}`
        );
        return {
          success: false,
          error: `🚫 Account is ${userProfile.status}. Please contact an administrator.`,
        };
      }

      // Create new session
      const session = await this.createSession(userProfile, chatId.toString());
      if (!session) {
        await this.logAuthAttempt(
          telegramUser.id.toString(),
          chatId.toString(),
          "login",
          false,
          "session_creation_failed"
        );
        return {
          success: false,
          error: "❌ Failed to create session. Please try again later.",
        };
      }

      // Update last login
      await this.updateLastLogin(userProfile.id);

      // Log successful authentication
      await this.logAuthAttempt(
        telegramUser.id.toString(),
        chatId.toString(),
        "login",
        true
      );

      return {
        success: true,
        user: userProfile,
        session,
      };
    } catch (error) {
      console.error("Authentication error:", error);
      await this.logAuthAttempt(
        telegramUser.id.toString(),
        chatId.toString(),
        "login",
        false,
        "system_error"
      );
      return {
        success: false,
        error: "❌ Authentication system error. Please try again later.",
      };
    }
  }

  /**
   * Validate existing session
   */
  async validateSession(sessionToken: string): Promise<{
    valid: boolean;
    user?: TelegramUserProfile;
    session?: TelegramSession;
    error?: string;
  }> {
    try {
      const { data: session, error } = await this.supabase
        .from("telegram_sessions")
        .select(
          `
          *,
          telegram_users (*)
        `
        )
        .eq("session_token", sessionToken)
        .eq("is_active", true)
        .single();

      if (error || !session) {
        return { valid: false, error: "Session not found" };
      }

      // Check if session is expired
      if (new Date() > new Date(session.expires_at)) {
        await this.invalidateSession(sessionToken);
        return { valid: false, error: "Session expired" };
      }

      // Update last activity
      await this.updateSessionActivity(sessionToken);

      return {
        valid: true,
        user: session.telegram_users,
        session,
      };
    } catch (error) {
      console.error("Session validation error:", error);
      return { valid: false, error: "System error" };
    }
  }

  /**
   * Check user permissions
   */
  hasPermission(user: TelegramUserProfile, permission: string): boolean {
    const rolePermissions = this.ROLE_PERMISSIONS[user.role] || [];
    return (
      rolePermissions.includes(permission) ||
      user.permissions.includes(permission)
    );
  }

  /**
   * Create user profile in database
   */
  private async createUserProfile(
    telegramUser: TelegramUser,
    chatId: number
  ): Promise<TelegramUserProfile | null> {
    try {
      const role = this.isAdminUser(telegramUser.id.toString())
        ? "admin"
        : "user";

      const { data, error } = await this.supabase
        .from("telegram_users")
        .insert({
          telegram_id: telegramUser.id.toString(),
          username: telegramUser.username,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          role,
          status: "active",
          permissions: this.ROLE_PERMISSIONS[role],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        })
        .select()
        .single();

      return error ? null : data;
    } catch (error) {
      console.error("Create user profile error:", error);
      return null;
    }
  }

  /**
   * Get user profile from database
   */
  private async getUserProfile(
    telegramId: string
  ): Promise<TelegramUserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from("telegram_users")
        .select("*")
        .eq("telegram_id", telegramId)
        .single();

      return error ? null : data;
    } catch (error) {
      console.error("Get user profile error:", error);
      return null;
    }
  }

  /**
   * Create secure session
   */
  private async createSession(
    user: TelegramUserProfile,
    chatId: string
  ): Promise<TelegramSession | null> {
    try {
      const sessionToken = this.generateSecureToken();
      const expiresAt = new Date();
      expiresAt.setMilliseconds(
        expiresAt.getMilliseconds() + this.config.sessionTimeout
      );

      const { data, error } = await this.supabase
        .from("telegram_sessions")
        .insert({
          user_id: user.id,
          telegram_chat_id: chatId,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          is_active: true,
          auth_method: "telegram",
        })
        .select()
        .single();

      return error ? null : data;
    } catch (error) {
      console.error("Create session error:", error);
      return null;
    }
  }

  /**
   * Generate secure session token
   */
  private generateSecureToken(): string {
    const timestamp = Date.now().toString();
    const randomPart = randomBytes(32).toString("hex");
    const combined = `${timestamp}.${randomPart}`;
    return createHash("sha256").update(combined).digest("hex");
  }

  /**
   * Check rate limiting
   */
  private async checkRateLimit(telegramId: string): Promise<{
    allowed: boolean;
    retryAfterSeconds?: number;
  }> {
    try {
      const oneMinuteAgo = new Date();
      oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);

      const { data, error } = await this.supabase
        .from("telegram_auth_attempts")
        .select("*")
        .eq("telegram_id", telegramId)
        .gte("created_at", oneMinuteAgo.toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        return { allowed: true }; // Allow on error, don't block users
      }

      const recentAttempts = data?.length || 0;
      if (recentAttempts >= this.config.rateLimitPerMinute) {
        return {
          allowed: false,
          retryAfterSeconds: 60,
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error("Rate limit check error:", error);
      return { allowed: true }; // Allow on error
    }
  }

  /**
   * Log authentication attempt
   */
  private async logAuthAttempt(
    telegramId: string,
    chatId: string,
    attemptType: "login" | "access" | "command",
    success: boolean,
    failureReason?: string
  ): Promise<void> {
    try {
      await this.supabase.from("telegram_auth_attempts").insert({
        telegram_id: telegramId,
        telegram_chat_id: chatId,
        attempt_type: attemptType,
        success,
        failure_reason: failureReason,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Log auth attempt error:", error);
    }
  }

  /**
   * Update session activity
   */
  private async updateSessionActivity(sessionToken: string): Promise<void> {
    try {
      await this.supabase
        .from("telegram_sessions")
        .update({
          last_activity: new Date().toISOString(),
        })
        .eq("session_token", sessionToken);
    } catch (error) {
      console.error("Update session activity error:", error);
    }
  }

  /**
   * Update last login time
   */
  private async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.supabase
        .from("telegram_users")
        .update({
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    } catch (error) {
      console.error("Update last login error:", error);
    }
  }

  /**
   * Invalidate session
   */
  async invalidateSession(sessionToken: string): Promise<void> {
    try {
      await this.supabase
        .from("telegram_sessions")
        .update({ is_active: false })
        .eq("session_token", sessionToken);
    } catch (error) {
      console.error("Invalidate session error:", error);
    }
  }

  /**
   * Check if user is authorized
   */
  private isUserAuthorized(telegramId: string): boolean {
    return (
      this.config.allowedUsers.length === 0 ||
      this.config.allowedUsers.includes(telegramId) ||
      this.config.adminUsers.includes(telegramId)
    );
  }

  /**
   * Check if user is admin
   */
  private isAdminUser(telegramId: string): boolean {
    return this.config.adminUsers.includes(telegramId);
  }

  /**
   * Cleanup expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    try {
      await this.supabase
        .from("telegram_sessions")
        .update({ is_active: false })
        .lt("expires_at", new Date().toISOString());
    } catch (error) {
      console.error("Cleanup sessions error:", error);
    }
  }

  /**
   * Get user security metrics
   */
  async getUserSecurityMetrics(telegramId: string): Promise<{
    totalAttempts: number;
    successfulAttempts: number;
    failedAttempts: number;
    activeSessions: number;
    lastLogin?: Date;
  }> {
    try {
      const [attemptsResult, sessionsResult, userResult] = await Promise.all([
        this.supabase
          .from("telegram_auth_attempts")
          .select("success")
          .eq("telegram_id", telegramId)
          .gte(
            "created_at",
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          ), // Last 30 days

        this.supabase
          .from("telegram_sessions")
          .select("id")
          .eq("telegram_chat_id", telegramId)
          .eq("is_active", true),

        this.supabase
          .from("telegram_users")
          .select("last_login")
          .eq("telegram_id", telegramId)
          .single(),
      ]).catch(() => [null, null, null]);

      const attempts = attemptsResult.data || [];
      const successfulAttempts = attempts.filter((a: any) => a.success).length;
      const failedAttempts = attempts.filter((a: any) => !a.success).length;

      return {
        totalAttempts: attempts.length,
        successfulAttempts,
        failedAttempts,
        activeSessions: sessionsResult.data?.length || 0,
        lastLogin: userResult.data?.last_login
          ? new Date(userResult.data.last_login)
          : undefined,
      };
    } catch (error) {
      console.error("Get security metrics error:", error);
      return {
        totalAttempts: 0,
        successfulAttempts: 0,
        failedAttempts: 0,
        activeSessions: 0,
      };
    }
  }
}
