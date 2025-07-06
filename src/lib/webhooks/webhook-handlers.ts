/**
 * Webhook Handlers for Real-Time Data Synchronization
 * Processes webhooks from Shopify, Kajabi, and social media platforms
 */

import { createClient } from "@/lib/supabase/server";
import { CustomerDataIngestion } from "@/lib/customer-intelligence/data-ingestion";
import { CustomerSegmentation } from "@/lib/customer-intelligence/segmentation";
import { createHmac } from "crypto";
import { shopifyCustomerSchema, kajabiCustomerSchema } from "./schemas";

// Webhook event types
export type WebhookSource =
  | "shopify"
  | "kajabi"
  | "facebook"
  | "instagram"
  | "twitter";

export interface WebhookEvent {
  id: string;
  source: WebhookSource;
  event_type: string;
  data: Record<string, unknown>;
  webhook_id: string;
  timestamp: string;
}

// Webhook verification signatures
interface SignatureValidator {
  (payload: string, signature: string, secret: string): boolean;
}

// Signature validation functions for different platforms
const signatureValidators: Record<WebhookSource, SignatureValidator> = {
  shopify: (payload: string, signature: string, secret: string) => {
    const hmac = createHmac("sha256", secret)
      .update(payload, "utf8")
      .digest("base64");
    return signature === hmac;
  },
  kajabi: (payload: string, signature: string, secret: string) => {
    const hmac = createHmac("sha256", secret)
      .update(payload, "utf8")
      .digest("hex");
    return signature === hmac;
  },
  facebook: (payload: string, signature: string, secret: string) => {
    const hmac = createHmac("sha256", secret)
      .update(payload, "utf8")
      .digest("hex");
    return signature === `sha256=${hmac}`;
  },
  instagram: (payload: string, signature: string, secret: string) => {
    const hmac = createHmac("sha256", secret)
      .update(payload, "utf8")
      .digest("hex");
    return signature === `sha256=${hmac}`;
  },
  twitter: (payload: string, signature: string, secret: string) => {
    const hmac = createHmac("sha256", secret)
      .update(payload, "utf8")
      .digest("base64");
    return signature === hmac;
  },
};

// Local helper type aliases to avoid cross-file interface exports
type ShopifyCustomerData = Parameters<
  CustomerDataIngestion["ingestShopifyCustomer"]
>[0];
type KajabiCustomerData = Parameters<
  CustomerDataIngestion["ingestKajabiCustomer"]
>[0];

export class WebhookProcessor {
  private customerDataIngestion: CustomerDataIngestion;
  private customerSegmentation: CustomerSegmentation;

  constructor() {
    this.customerDataIngestion = new CustomerDataIngestion();
    this.customerSegmentation = new CustomerSegmentation();
  }

  /**
   * Validate webhook signature for security
   */
  validateSignature(
    payload: string,
    signature: string,
    secret: string,
    source: WebhookSource
  ): boolean {
    try {
      const validator = signatureValidators[source];
      if (!validator) {
        console.error(`No signature validator for source: ${source}`);
        return false;
      }
      return validator(payload, signature, secret);
    } catch (error) {
      console.error("Error validating webhook signature:", error);
      return false;
    }
  }

  /**
   * Backward-compatibility alias for older endpoint code.
   * Determines the correct secret based on platform and delegates to validateSignature.
   */
  verifyWebhookSignature(
    platform: WebhookSource,
    payload: string,
    signature: string
  ): boolean {
    // Retrieve secret from environment variables per platform
    let secret = "";
    switch (platform) {
      case "shopify":
        secret = process.env.SHOPIFY_WEBHOOK_SECRET || "";
        break;
      case "kajabi":
        secret = process.env.KAJABI_WEBHOOK_SECRET || "";
        break;
      case "facebook":
      case "instagram":
        secret =
          process.env.FACEBOOK_WEBHOOK_SECRET ||
          process.env.INSTAGRAM_WEBHOOK_SECRET ||
          "";
        break;
      case "twitter":
        secret = process.env.TWITTER_WEBHOOK_SECRET || "";
        break;
      default:
        secret = "";
    }

    return this.validateSignature(payload, signature, secret, platform);
  }

  /**
   * Process incoming webhook
   */
  async processWebhook(
    source: WebhookSource,
    eventType: string,
    data: Record<string, unknown>,
    webhookId = "",
    validateOnly = false
  ): Promise<{ success: boolean; message?: string }> {
    try {
      if (validateOnly) {
        return { success: true, message: "Webhook validation successful" };
      }

      // Log the webhook event
      await this.logWebhookEvent({
        id: webhookId || `${Date.now()}-${Math.random()}`,
        source,
        event_type: eventType,
        data,
        webhook_id: webhookId,
        timestamp: new Date().toISOString(),
      });

      // Route to appropriate handler
      const handler = this.getEventHandler(source);
      return await handler(eventType, data);
    } catch (error) {
      console.error("Error processing webhook:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get event handler for source
   */
  private getEventHandler(source: WebhookSource) {
    const handlers = {
      shopify: this.handleShopifyEvent.bind(this),
      kajabi: this.handleKajabiEvent.bind(this),
      facebook: this.handleMetaEvent.bind(this),
      instagram: this.handleMetaEvent.bind(this),
      twitter: this.handleTwitterEvent.bind(this),
    };

    const handler = handlers[source];
    if (!handler) {
      throw new Error(`No handler found for source: ${source}`);
    }
    return handler;
  }

  /**
   * Handle Shopify webhook events
   */
  private async handleShopifyEvent(
    eventType: string,
    data: Record<string, unknown>
  ): Promise<{ success: boolean; message?: string }> {
    const eventHandlers = {
      "customers/create": this.syncShopifyCustomer.bind(this),
      "customers/update": this.syncShopifyCustomer.bind(this),
      "orders/create": this.syncShopifyOrder.bind(this),
      "orders/updated": this.syncShopifyOrder.bind(this),
      "customers/delete": (data: Record<string, unknown>) =>
        this.handleCustomerDeletion(data.id as string, "shopify"),
    };

    const handler = eventHandlers[eventType as keyof typeof eventHandlers];
    if (!handler) {
      return {
        success: false,
        message: `Unhandled Shopify event type: ${eventType}`,
      };
    }

    return await handler(data);
  }

  /**
   * Handle Kajabi webhook events
   */
  private async handleKajabiEvent(
    eventType: string,
    data: Record<string, unknown>
  ): Promise<{ success: boolean; message?: string }> {
    const eventHandlers = {
      "person.created": this.syncKajabiCustomer.bind(this),
      "person.updated": this.syncKajabiCustomer.bind(this),
      "purchase.created": this.syncKajabiPurchase.bind(this),
      "purchase.updated": this.syncKajabiPurchase.bind(this),
      "person.deleted": (data: Record<string, unknown>) =>
        this.handleCustomerDeletion(data.id as string, "kajabi"),
    };

    const handler = eventHandlers[eventType as keyof typeof eventHandlers];
    if (!handler) {
      return {
        success: false,
        message: `Unhandled Kajabi event type: ${eventType}`,
      };
    }

    return await handler(data);
  }

  /**
   * Handle Meta (Facebook/Instagram) webhook events
   */
  private async handleMetaEvent(
    eventType: string,
    data: Record<string, unknown>
  ): Promise<{ success: boolean; message?: string }> {
    const eventHandlers = {
      user: (data: Record<string, unknown>, source: "facebook" | "instagram") =>
        this.syncSocialProfile(data, source),
      page: () => ({ success: true, message: "Page event processed" }),
    };

    const handler = eventHandlers[eventType as keyof typeof eventHandlers];
    if (!handler) {
      return {
        success: false,
        message: `Unhandled Meta event type: ${eventType}`,
      };
    }

    return await handler(data, "facebook");
  }

  /**
   * Handle Twitter webhook events
   */
  private async handleTwitterEvent(
    eventType: string,
    _data: Record<string, unknown>
  ): Promise<{ success: boolean; message?: string }> {
    const eventHandlers = {
      follow_events: () => this.handleTwitterFollow(),
      tweet_create_events: () => this.handleTwitterMention(),
    };

    const handler = eventHandlers[eventType as keyof typeof eventHandlers];
    if (!handler) {
      return {
        success: false,
        message: `Unhandled Twitter event type: ${eventType}`,
      };
    }

    return await handler();
  }

  /**
   * Sync Shopify customer data
   */
  private async syncShopifyCustomer(
    data: Record<string, unknown>
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Validate payload
      const validation = shopifyCustomerSchema.safeParse(data);
      if (!validation.success) {
        return { success: false, message: "Invalid Shopify customer payload" };
      }
      const payload = validation.data;
      const externalId = payload.id.toString();

      const formattedData = {
        id: externalId,
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name,
        phone: payload.phone,
        created_at: payload.created_at,
        orders_count: payload.orders_count || 0,
        total_spent: payload.total_spent ? String(payload.total_spent) : "0",
        last_order_date: payload.updated_at,
        tags: payload.tags || "",
        addresses: [],
      } as any;

      await this.customerDataIngestion.ingestShopifyCustomer(
        formattedData as any
      );

      // Track customer touchpoint
      const customer = await this.findCustomerByExternalId(
        externalId,
        "shopify"
      );
      if (customer) {
        const customerId = (customer as any).id as string;
        await this.customerDataIngestion.trackCustomerTouchpoint(customerId, {
          type: "website_visit",
          source: "shopify",
          metadata: { sync_type: "webhook_sync", customer_updated: true },
          timestamp: new Date().toISOString(),
        });

        await this.updateCustomerMetrics(customerId);
        await this.triggerCustomerResegmentation(customerId);
      }

      return {
        success: true,
        message: "Shopify customer synced successfully",
      };
    } catch (error) {
      console.error("Error syncing Shopify customer:", error);
      throw error;
    }
  }

  /**
   * Sync Shopify order data
   */
  private async syncShopifyOrder(
    data: Record<string, unknown>
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const customer = data.customer as Record<string, unknown>;
      const customerId = customer?.id as number;

      if (!customerId) {
        throw new Error("No customer ID found in order data");
      }

      // Track purchase event
      const customerRecord = await this.findCustomerByExternalId(
        customerId.toString(),
        "shopify"
      );

      if (customerRecord) {
        const customerIdStr = (customerRecord as any).id as string;
        await this.customerDataIngestion.trackCustomerTouchpoint(
          customerIdStr,
          {
            type: "purchase",
            source: "shopify",
            metadata: {
              order_id: data.id as number,
              total_price: data.total_price as string,
              currency: data.currency as string,
            },
            timestamp: new Date().toISOString(),
          }
        );

        await this.updateCustomerMetrics(customerIdStr);
        await this.triggerCustomerResegmentation(customerIdStr);
      }

      return {
        success: true,
        message: "Shopify order synced successfully",
      };
    } catch (error) {
      console.error("Error syncing Shopify order:", error);
      throw error;
    }
  }

  /**
   * Sync Kajabi customer data
   */
  private async syncKajabiCustomer(
    data: Record<string, unknown>
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Validate payload
      const validationK = kajabiCustomerSchema.safeParse(data);
      if (!validationK.success) {
        return { success: false, message: "Invalid Kajabi customer payload" };
      }
      const payloadK = validationK.data;
      const externalIdK = payloadK.id.toString();

      const formattedData = {
        id: externalIdK,
        email: payloadK.email,
        first_name: payloadK.first_name,
        last_name: payloadK.last_name,
        phone: payloadK.phone,
        created_at: payloadK.created_at,
        purchases_count: payloadK.purchases_count || 0,
        total_spent: Number(payloadK.total_spent || 0),
        last_purchase_date: payloadK.updated_at,
        tags: payloadK.tags || [],
      } as any;

      await this.customerDataIngestion.ingestKajabiCustomer(
        formattedData as any
      );

      // Track customer touchpoint
      const customer = await this.findCustomerByExternalId(
        externalIdK,
        "kajabi"
      );

      if (customer) {
        const customerId = (customer as any).id as string;
        await this.customerDataIngestion.trackCustomerTouchpoint(customerId, {
          type: "website_visit",
          source: "kajabi",
          metadata: { sync_type: "webhook_sync", customer_updated: true },
          timestamp: new Date().toISOString(),
        });

        await this.updateCustomerMetrics(customerId);
        await this.triggerCustomerResegmentation(customerId);
      }

      return {
        success: true,
        message: "Kajabi customer synced successfully",
      };
    } catch (error) {
      console.error("Error syncing Kajabi customer:", error);
      throw error;
    }
  }

  /**
   * Sync Kajabi purchase data
   */
  private async syncKajabiPurchase(
    data: Record<string, unknown>
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const customer = data.person as Record<string, unknown>;
      const customerId = customer?.id as number;

      if (!customerId) {
        throw new Error("No customer ID found in purchase data");
      }

      // Track purchase event
      const customerRecord = await this.findCustomerByExternalId(
        customerId.toString(),
        "kajabi"
      );

      if (customerRecord) {
        const customerIdStr = (customerRecord as any).id as string;
        await this.customerDataIngestion.trackCustomerTouchpoint(
          customerIdStr,
          {
            type: "purchase",
            source: "kajabi",
            metadata: {
              purchase_id: data.id as number,
              amount: data.amount as string,
            },
            timestamp: new Date().toISOString(),
          }
        );

        await this.updateCustomerMetrics(customerIdStr);
        await this.triggerCustomerResegmentation(customerIdStr);
      }

      return {
        success: true,
        message: "Kajabi purchase synced successfully",
      };
    } catch (error) {
      console.error("Error syncing Kajabi purchase:", error);
      throw error;
    }
  }

  /**
   * Sync social media profile data
   */
  private async syncSocialProfile(
    profileData: Record<string, unknown>,
    platform: "facebook" | "instagram"
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Find matching customer by email or other identifier
      const customer = await this.findCustomerForSocialProfile(profileData);

      if (customer) {
        const customerId = (customer as any).id as string;
        // Create or update social profile
        const socialProfile = {
          customer_id: customerId,
          platform,
          profile_id: profileData.id as string,
          username: profileData.username as string,
          display_name: profileData.name as string,
          follower_count: (profileData.followers_count as number) || 0,
          following_count: (profileData.following_count as number) || 0,
          profile_data: profileData,
        };

        await this.customerDataIngestion.updateSocialProfile(
          customerId,
          socialProfile
        );

        // Track social interaction
        await this.customerDataIngestion.trackCustomerTouchpoint(customerId, {
          type: "social_interaction",
          source: "social",
          metadata: { platform, action: "profile_updated" },
          timestamp: new Date().toISOString(),
        });
      }

      return {
        success: true,
        message: `${platform} profile synced successfully`,
      };
    } catch (error) {
      console.error(`Error syncing ${platform} profile:`, error);
      throw error;
    }
  }

  /**
   * Handle customer deletion from external platforms
   */
  private async handleCustomerDeletion(
    externalId: string,
    source: "shopify" | "kajabi"
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const customer = await this.findCustomerByExternalId(externalId, source);

      if (customer) {
        const supabase = await createClient();

        // Mark customer as churned
        await supabase
          .from("unified_customers")
          .update({
            status: "churned",
            updated_at: new Date().toISOString(),
          })
          .eq("id", customer.id);

        // Add churn event
        const customerId = (customer as any).id as string;
        await this.customerDataIngestion.trackCustomerTouchpoint(customerId, {
          type: "churn",
          source,
          metadata: { reason: "account_deleted" },
          timestamp: new Date().toISOString(),
        });
      }

      return {
        success: true,
        message: `Customer deletion processed for ${source}`,
      };
    } catch (error) {
      console.error("Error handling customer deletion:", error);
      throw error;
    }
  }

  /**
   * Handle Twitter follow events
   */
  private async handleTwitterFollow(): Promise<{
    success: boolean;
    message?: string;
  }> {
    // Implementation for Twitter follow tracking
    return {
      success: true,
      message: "Twitter follow event processed",
    };
  }

  /**
   * Handle Twitter mention events
   */
  private async handleTwitterMention(): Promise<{
    success: boolean;
    message?: string;
  }> {
    // Implementation for Twitter mention tracking
    return {
      success: true,
      message: "Twitter mention event processed",
    };
  }

  /**
   * Handle Twitter DM events
   */
  private async handleTwitterDM(): Promise<{
    success: boolean;
    message?: string;
  }> {
    // Implementation for Twitter DM tracking
    return {
      success: true,
      message: "Twitter DM event processed",
    };
  }

  /**
   * Update customer metrics after order/purchase
   */
  private async updateCustomerMetrics(customerId: string) {
    try {
      const supabase = await createClient();

      // Get customer with touchpoints for metric calculation
      const { data: customer } = await supabase
        .from("unified_customers")
        .select("*")
        .eq("id", customerId)
        .single();

      if (customer) {
        // Update customer status and metrics
        await supabase
          .from("unified_customers")
          .update({
            status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", customerId);
      }
    } catch (error) {
      console.error("Error updating customer metrics:", error);
    }
  }

  /**
   * Trigger customer re-segmentation after data update
   */
  private async triggerCustomerResegmentation(customerId: string) {
    try {
      // For now, trigger a full re-segmentation
      // In production, this could be optimized to only re-evaluate relevant segments
      await this.customerSegmentation.segmentAllCustomers();
    } catch (error) {
      console.error("Error triggering re-segmentation:", error);
    }
  }

  /**
   * Find customer by external ID
   */
  private async findCustomerByExternalId(
    externalId: string,
    source: "shopify" | "kajabi"
  ) {
    try {
      const supabase = await createClient();
      const field =
        source === "shopify" ? "shopify_customer_id" : "kajabi_customer_id";

      const { data: customer } = await supabase
        .from("unified_customers")
        .select("id")
        .eq(field, externalId)
        .single();

      return customer;
    } catch (error) {
      console.error("Error finding customer:", error);
      return null;
    }
  }

  /**
   * Find customer for social profile
   */
  private async findCustomerForSocialProfile(
    _profileData: Record<string, unknown>
  ) {
    // For now, return null. In practice, you'd match by email or other identifiers
    return null;
  }

  /**
   * Log webhook event for monitoring
   */
  private async logWebhookEvent(event: WebhookEvent) {
    try {
      const supabase = await createClient();

      await supabase.from("webhook_logs").insert({
        source: event.source,
        event_type: event.event_type,
        webhook_id: event.webhook_id,
        processed_at: new Date().toISOString(),
        data: event.data,
      });
    } catch (error) {
      console.error("Error logging webhook event:", error);
    }
  }
}

// Export singleton instance
export const webhookProcessor = new WebhookProcessor();
