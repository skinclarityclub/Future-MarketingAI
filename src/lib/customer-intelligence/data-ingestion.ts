/**
 * Customer Data Ingestion Service
 * Merges customer data from Shopify, Kajabi, and social media into unified profiles
 */

import { getSupabaseInstance } from "@/lib/supabase/instance";
import {
  UnifiedCustomer,
  InsertUnifiedCustomer,
  UpdateUnifiedCustomer,
  CustomerTouchpoint,
  CustomerEvent,
  AcquisitionSource,
  CustomerStatus,
} from "@/lib/supabase/types";

// Data source interfaces
interface ShopifyCustomerData {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  created_at: string;
  orders_count: number;
  total_spent: string;
  last_order_date?: string;
  addresses?: Array<{
    country?: string;
    province?: string;
    city?: string;
  }>;
  tags?: string;
}

interface KajabiCustomerData {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  created_at: string;
  purchases_count: number;
  total_spent: number;
  last_purchase_date?: string;
  tags?: string[];
}

interface SocialMediaProfile {
  platform: "facebook" | "instagram" | "twitter" | "linkedin" | "youtube";
  user_id?: string;
  username?: string;
  follower_count?: number;
  engagement_rate?: number;
  profile_data?: Record<string, any>;
  is_verified?: boolean;
}

// Customer data ingestion class
export class CustomerDataIngestion {
  private supabase;

  constructor() {
    this.supabase = getSupabaseInstance();
  }

  /**
   * Find existing customer by email or external IDs
   */
  async findExistingCustomer(
    email: string,
    shopifyId?: string,
    kajabiId?: string
  ): Promise<UnifiedCustomer | null> {
    const { data, error } = await this.supabase
      .from("unified_customers")
      .select("*")
      .or(
        `email.eq.${email},shopify_customer_id.eq.${shopifyId},kajabi_customer_id.eq.${kajabiId}`
      )
      .single();

    if (error && error.code !== "PGRST116") {
      if (process.env.NODE_ENV === "development") {
        console.error("Error finding existing customer:", error);
      }
      return null;
    }

    return data;
  }

  /**
   * Create or update unified customer from Shopify data
   */
  async ingestShopifyCustomer(
    shopifyData: ShopifyCustomerData
  ): Promise<string | null> {
    try {
      const existingCustomer = await this.findExistingCustomer(
        shopifyData.email,
        shopifyData.id
      );

      const customerData: InsertUnifiedCustomer | UpdateUnifiedCustomer = {
        email: shopifyData.email,
        first_name: shopifyData.first_name,
        last_name: shopifyData.last_name,
        phone: shopifyData.phone,
        shopify_customer_id: shopifyData.id,
        total_orders: shopifyData.orders_count,
        total_lifetime_value: parseFloat(shopifyData.total_spent) || 0,
        average_order_value:
          shopifyData.orders_count > 0
            ? (parseFloat(shopifyData.total_spent) || 0) /
              shopifyData.orders_count
            : 0,
        last_purchase_date: shopifyData.last_order_date,
        customer_status: this.determineCustomerStatus(
          shopifyData.orders_count,
          shopifyData.last_order_date
        ),
        tags: shopifyData.tags
          ? shopifyData.tags.split(",").map(tag => tag.trim())
          : [],
        acquisition_source: "shopify" as AcquisitionSource,
        acquisition_date: shopifyData.created_at,
      };

      // Add location data if available
      if (shopifyData.addresses && shopifyData.addresses.length > 0) {
        const primaryAddress = shopifyData.addresses[0];
        customerData.location_country = primaryAddress.country;
        customerData.location_state = primaryAddress.province;
        customerData.location_city = primaryAddress.city;
      }

      let customerId: string;

      if (existingCustomer) {
        // Update existing customer
        const { data, error } = await this.supabase
          .from("unified_customers")
          .update(customerData)
          .eq("id", existingCustomer.id)
          .select("id")
          .single();

        if (error) throw error;
        customerId = data.id;
      } else {
        // Create new customer
        const { data, error } = await this.supabase
          .from("unified_customers")
          .insert(customerData)
          .select("id")
          .single();

        if (error) throw error;
        customerId = data.id;
      }

      // Record the ingestion event
      await this.recordCustomerEvent(customerId, {
        event_type: "signup",
        event_source: "shopify",
        event_data: { source: "shopify_ingestion", shopify_id: shopifyData.id },
        event_date: shopifyData.created_at,
      });

      return customerId;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error ingesting Shopify customer:", error);
      }
      return null;
    }
  }

  /**
   * Create or update unified customer from Kajabi data
   */
  async ingestKajabiCustomer(
    kajabiData: KajabiCustomerData
  ): Promise<string | null> {
    try {
      const existingCustomer = await this.findExistingCustomer(
        kajabiData.email,
        undefined,
        kajabiData.id
      );

      const customerData: InsertUnifiedCustomer | UpdateUnifiedCustomer = {
        email: kajabiData.email,
        first_name: kajabiData.first_name,
        last_name: kajabiData.last_name,
        phone: kajabiData.phone,
        kajabi_customer_id: kajabiData.id,
        tags: kajabiData.tags || [],
        acquisition_source: "kajabi" as AcquisitionSource,
        acquisition_date: kajabiData.created_at,
      };

      // Merge Kajabi data with existing Shopify data if customer exists
      if (existingCustomer) {
        customerData.total_lifetime_value =
          (existingCustomer.total_lifetime_value || 0) + kajabiData.total_spent;
        customerData.total_orders =
          (existingCustomer.total_orders || 0) + kajabiData.purchases_count;
        customerData.average_order_value =
          customerData.total_orders > 0
            ? customerData.total_lifetime_value / customerData.total_orders
            : 0;

        // Keep most recent purchase date
        if (
          kajabiData.last_purchase_date &&
          (!existingCustomer.last_purchase_date ||
            new Date(kajabiData.last_purchase_date) >
              new Date(existingCustomer.last_purchase_date))
        ) {
          customerData.last_purchase_date = kajabiData.last_purchase_date;
        }

        // Merge tags
        const existingTags = existingCustomer.tags || [];
        const newTags = kajabiData.tags || [];
        customerData.tags = [...new Set([...existingTags, ...newTags])];
      } else {
        customerData.total_lifetime_value = kajabiData.total_spent;
        customerData.total_orders = kajabiData.purchases_count;
        customerData.average_order_value =
          kajabiData.purchases_count > 0
            ? kajabiData.total_spent / kajabiData.purchases_count
            : 0;
        customerData.last_purchase_date = kajabiData.last_purchase_date;
      }

      customerData.customer_status = this.determineCustomerStatus(
        customerData.total_orders || 0,
        customerData.last_purchase_date
      );

      let customerId: string;

      if (existingCustomer) {
        // Update existing customer
        const { data, error } = await this.supabase
          .from("unified_customers")
          .update(customerData)
          .eq("id", existingCustomer.id)
          .select("id")
          .single();

        if (error) throw error;
        customerId = data.id;
      } else {
        // Create new customer
        const { data, error } = await this.supabase
          .from("unified_customers")
          .insert(customerData)
          .select("id")
          .single();

        if (error) throw error;
        customerId = data.id;
      }

      // Record the ingestion event
      await this.recordCustomerEvent(customerId, {
        event_type: "signup",
        event_source: "kajabi",
        event_data: { source: "kajabi_ingestion", kajabi_id: kajabiData.id },
        event_date: kajabiData.created_at,
      });

      return customerId;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error ingesting Kajabi customer:", error);
      }
      return null;
    }
  }

  /**
   * Add social media profile to customer
   */
  async linkSocialProfile(
    customerId: string,
    socialProfile: SocialMediaProfile
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("customer_social_profiles")
        .upsert({
          customer_id: customerId,
          platform: socialProfile.platform,
          platform_user_id: socialProfile.user_id,
          username: socialProfile.username,
          follower_count: socialProfile.follower_count,
          engagement_rate: socialProfile.engagement_rate,
          profile_data: socialProfile.profile_data || {},
          is_verified: socialProfile.is_verified || false,
          last_interaction_date: new Date().toISOString(),
        });

      if (error) throw error;

      // Record social linking event
      await this.recordCustomerEvent(customerId, {
        event_type: "social_interaction",
        event_source: "social",
        event_data: {
          platform: socialProfile.platform,
          username: socialProfile.username,
          action: "profile_linked",
        },
        event_date: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error linking social profile:", error);
      }
      return false;
    }
  }

  /**
   * Update (upsert) a social profile – compatibility alias used by WebhookProcessor.
   */
  async updateSocialProfile(
    customerId: string,
    socialProfile: SocialMediaProfile
  ): Promise<boolean> {
    return this.linkSocialProfile(customerId, socialProfile);
  }

  /**
   * Track customer touchpoint – convenience wrapper expected by other modules.
   */
  async trackCustomerTouchpoint(
    customerId: string,
    touchpoint: {
      type: string;
      source: string;
      metadata?: Record<string, any>;
      value?: number;
      timestamp?: string;
    }
  ): Promise<boolean> {
    return this.recordTouchpoint({
      customer_id: customerId,
      touchpoint_type: touchpoint.type,
      touchpoint_source: touchpoint.source,
      touchpoint_data: touchpoint.metadata || {},
      value: touchpoint.value ?? 0,
      timestamp: touchpoint.timestamp ?? new Date().toISOString(),
    });
  }

  /**
   * Record customer touchpoint
   */
  async recordTouchpoint(
    touchpoint: Omit<CustomerTouchpoint, "id" | "created_at">
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("customer_touchpoints")
        .insert(touchpoint);

      if (error) throw error;
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error recording touchpoint:", error);
      }
      return false;
    }
  }

  /**
   * Record customer event
   */
  async recordCustomerEvent(
    customerId: string,
    event: Omit<CustomerEvent, "id" | "customer_id" | "created_at">
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("customer_events").insert({
        customer_id: customerId,
        ...event,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error recording customer event:", error);
      }
      return false;
    }
  }

  /**
   * Bulk import customers from multiple sources
   */
  async bulkImport(data: {
    shopifyCustomers?: ShopifyCustomerData[];
    kajabiCustomers?: KajabiCustomerData[];
  }): Promise<{
    shopifyProcessed: number;
    kajabiProcessed: number;
    errors: string[];
  }> {
    const results: {
      shopifyProcessed: number;
      kajabiProcessed: number;
      errors: string[];
    } = {
      shopifyProcessed: 0,
      kajabiProcessed: 0,
      errors: [],
    };

    // Process Shopify customers
    if (data.shopifyCustomers) {
      for (const customer of data.shopifyCustomers) {
        try {
          const customerId = await this.ingestShopifyCustomer(customer);
          if (customerId) {
            results.shopifyProcessed++;
          } else {
            results.errors.push(
              `Failed to process Shopify customer: ${customer.email}`
            );
          }
        } catch (error) {
          results.errors.push(
            `Error processing Shopify customer ${customer.email}: ${error}`
          );
        }
      }
    }

    // Process Kajabi customers
    if (data.kajabiCustomers) {
      for (const customer of data.kajabiCustomers) {
        try {
          const customerId = await this.ingestKajabiCustomer(customer);
          if (customerId) {
            results.kajabiProcessed++;
          } else {
            results.errors.push(
              `Failed to process Kajabi customer: ${customer.email}`
            );
          }
        } catch (error) {
          results.errors.push(
            `Error processing Kajabi customer ${customer.email}: ${error}`
          );
        }
      }
    }

    return results;
  }

  /**
   * Calculate churn risk score based on customer data
   */
  async calculateChurnRisk(customerId: string): Promise<number> {
    try {
      const { data: customer } = await this.supabase
        .from("unified_customers")
        .select("*")
        .eq("id", customerId)
        .single();

      if (!customer) return 0;

      let riskScore = 0;

      // Factor 1: Days since last purchase (40% weight)
      if (customer.last_purchase_date) {
        const daysSinceLastPurchase = Math.floor(
          (Date.now() - new Date(customer.last_purchase_date).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        riskScore += Math.min(daysSinceLastPurchase / 90, 1) * 0.4;
      } else {
        riskScore += 0.4; // No purchases = high risk
      }

      // Factor 2: Order frequency (30% weight)
      const daysSinceAcquisition = Math.floor(
        (Date.now() - new Date(customer.acquisition_date).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const expectedOrders = Math.max(daysSinceAcquisition / 60, 1); // Expected 1 order per 60 days
      const orderFrequencyRisk = Math.max(
        0,
        1 - customer.total_orders / expectedOrders
      );
      riskScore += orderFrequencyRisk * 0.3;

      // Factor 3: Average order value trend (20% weight)
      if (customer.average_order_value < 50) {
        riskScore += 0.2;
      } else if (customer.average_order_value < 100) {
        riskScore += 0.1;
      }

      // Factor 4: Engagement recency (10% weight)
      const { data: recentTouchpoints } = await this.supabase
        .from("customer_touchpoints")
        .select("timestamp")
        .eq("customer_id", customerId)
        .order("timestamp", { ascending: false })
        .limit(1);

      if (recentTouchpoints && recentTouchpoints.length > 0) {
        const daysSinceLastTouchpoint = Math.floor(
          (Date.now() - new Date(recentTouchpoints[0].timestamp).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        riskScore += Math.min(daysSinceLastTouchpoint / 30, 1) * 0.1;
      } else {
        riskScore += 0.1;
      }

      // Ensure score is between 0 and 1
      const finalScore = Math.min(Math.max(riskScore, 0), 1);

      // Update customer with calculated risk score
      await this.supabase
        .from("unified_customers")
        .update({ churn_risk_score: finalScore })
        .eq("id", customerId);

      return finalScore;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error calculating churn risk:", error);
      }
      return 0;
    }
  }

  /**
   * Determine customer status based on activity
   */
  private determineCustomerStatus(
    totalOrders: number,
    lastPurchaseDate?: string
  ): CustomerStatus {
    if (totalOrders === 0) return "prospect";

    if (!lastPurchaseDate) return "inactive";

    const daysSinceLastPurchase = Math.floor(
      (Date.now() - new Date(lastPurchaseDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastPurchase > 180) return "churned";
    if (daysSinceLastPurchase > 90) return "inactive";
    return "active";
  }
}

// Export singleton instance
export const customerDataIngestion = new CustomerDataIngestion();
