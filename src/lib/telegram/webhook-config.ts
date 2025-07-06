import { createHash } from "crypto";

export interface WebhookConfig {
  url: string;
  secret_token?: string;
  max_connections?: number;
  allowed_updates?: string[];
  drop_pending_updates?: boolean;
}

export interface WebhookStatus {
  url: string;
  has_custom_certificate: boolean;
  pending_update_count: number;
  last_error_date?: number;
  last_error_message?: string;
  max_connections?: number;
  allowed_updates?: string[];
}

export interface WebhookSecurityConfig {
  enableRateLimit: boolean;
  rateLimitWindow: number;
  rateLimitMaxRequests: number;
  enableSignatureVerification: boolean;
  maxBodySize: number;
  requireHttps: boolean;
  allowedIPs?: string[];
}

export const DEFAULT_WEBHOOK_SECURITY: WebhookSecurityConfig = {
  enableRateLimit: true,
  rateLimitWindow: 60000, // 1 minute
  rateLimitMaxRequests: 100,
  enableSignatureVerification: true,
  maxBodySize: 1024 * 1024, // 1MB
  requireHttps: true,
  allowedIPs: undefined, // Allow all by default
};

export class TelegramWebhookManager {
  private config: any;
  private securityConfig: WebhookSecurityConfig;

  constructor(
    config: any,
    securityConfig: WebhookSecurityConfig = DEFAULT_WEBHOOK_SECURITY
  ) {
    this.config = config;
    this.securityConfig = securityConfig;
  }

  /**
   * Set up the webhook with Telegram
   */
  async setupWebhook(
    webhookUrl: string,
    secretToken?: string
  ): Promise<boolean> {
    try {
      const webhookConfig: WebhookConfig = {
        url: webhookUrl,
        secret_token: secretToken,
        max_connections: 40,
        allowed_updates: [
          "message",
          "edited_message",
          "callback_query",
          "inline_query",
          "chosen_inline_result",
        ],
        drop_pending_updates: true,
      };

      const response = await fetch(
        `https://api.telegram.org/bot${this.config.token}/setWebhook`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(webhookConfig),
        }
      );

      const result = await response.json();

      if (result.ok) {
        console.log("Webhook set successfully:", result.description);
        return true;
      } else {
        console.error("Failed to set webhook:", result.description);
        return false;
      }
    } catch (error) {
      console.error("Error setting webhook:", error);
      return false;
    }
  }

  /**
   * Get current webhook info
   */
  async getWebhookInfo(): Promise<WebhookStatus | null> {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.config.token}/getWebhookInfo`
      );
      const result = await response.json();

      if (result.ok) {
        return result.result as WebhookStatus;
      } else {
        console.error("Failed to get webhook info:", result.description);
        return null;
      }
    } catch (error) {
      console.error("Error getting webhook info:", error);
      return null;
    }
  }

  /**
   * Delete the webhook
   */
  async deleteWebhook(): Promise<boolean> {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.config.token}/deleteWebhook`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ drop_pending_updates: true }),
        }
      );

      const result = await response.json();

      if (result.ok) {
        console.log("Webhook deleted successfully");
        return true;
      } else {
        console.error("Failed to delete webhook:", result.description);
        return false;
      }
    } catch (error) {
      console.error("Error deleting webhook:", error);
      return false;
    }
  }

  /**
   * Validate webhook URL format
   */
  validateWebhookUrl(url: string): boolean {
    try {
      const parsed = new URL(url);

      // Must be HTTPS in production
      if (this.securityConfig.requireHttps && parsed.protocol !== "https:") {
        return false;
      }

      // Must be a valid URL
      if (!parsed.hostname || !parsed.pathname) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate a secure secret token for webhook
   */
  generateSecretToken(): string {
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    return Array.from(randomBytes, byte =>
      byte.toString(16).padStart(2, "0")
    ).join("");
  }

  /**
   * Verify webhook signature
   */
  verifySignature(signature: string, body: string, secret: string): boolean {
    try {
      const hash = createHash("sha256")
        .update(body + secret)
        .digest("hex");
      const expectedSignature = `sha256=${hash}`;

      return signature === expectedSignature;
    } catch {
      return false;
    }
  }

  /**
   * Get webhook health status
   */
  async getHealthStatus(): Promise<{
    healthy: boolean;
    webhook: WebhookStatus | null;
    issues: string[];
  }> {
    const issues: string[] = [];
    const webhook = await this.getWebhookInfo();

    if (!webhook) {
      issues.push("Cannot retrieve webhook information");
      return { healthy: false, webhook: null, issues };
    }

    if (!webhook.url) {
      issues.push("No webhook URL configured");
    }

    if (webhook.last_error_date) {
      const lastError = new Date(webhook.last_error_date * 1000);
      const now = new Date();
      const hoursSinceError =
        (now.getTime() - lastError.getTime()) / (1000 * 60 * 60);

      if (hoursSinceError < 24) {
        issues.push(
          `Recent error: ${webhook.last_error_message} (${Math.round(hoursSinceError)}h ago)`
        );
      }
    }

    if (webhook.pending_update_count > 100) {
      issues.push(`High pending update count: ${webhook.pending_update_count}`);
    }

    return {
      healthy: issues.length === 0,
      webhook,
      issues,
    };
  }

  /**
   * Monitor webhook performance
   */
  getPerformanceMetrics() {
    return {
      securityConfig: this.securityConfig,
      features: {
        rateLimit: this.securityConfig.enableRateLimit,
        signatureVerification: this.securityConfig.enableSignatureVerification,
        httpsRequired: this.securityConfig.requireHttps,
        ipFiltering: !!this.securityConfig.allowedIPs,
      },
    };
  }
}

export default TelegramWebhookManager;
