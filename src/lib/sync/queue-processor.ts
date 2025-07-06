/**
 * Sync Queue Processor
 * Handles background processing of webhook events and data synchronization
 */

import { createClient } from "@/lib/supabase/server";
import { customerDataIngestion } from "@/lib/customer-intelligence/data-ingestion";
import { customerSegmentation } from "@/lib/customer-intelligence/segmentation";

export interface SyncQueueItem {
  id: string;
  source: string;
  action: "create" | "update" | "delete" | "upsert";
  entity_type: "customer" | "order" | "purchase" | "social_profile";
  entity_id: string;
  payload: any;
  priority: number;
  status: "pending" | "processing" | "completed" | "failed";
  retry_count: number;
  max_retries: number;
  scheduled_for: string;
  error_message?: string;
  created_at: string;
}

export class SyncQueueProcessor {
  private supabase: any;
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly PROCESSING_INTERVAL = 5000; // 5 seconds

  constructor() {
    // Leave supabase as null, initialize on first use
    this.supabase = null;
  }

  private async ensureSupabaseReady() {
    if (!this.supabase) {
      this.supabase = await createClient();
    }
    return this.supabase;
  }

  /**
   * Start the queue processor
   */
  async startProcessor(): Promise<void> {
    if (this.isProcessing) {
      console.log("Sync queue processor is already running");
      return;
    }

    this.isProcessing = true;
    console.log("Starting sync queue processor...");

    this.processingInterval = setInterval(async () => {
      try {
        await this.processBatch();
      } catch (error) {
        console.error("Error in sync queue processor:", error);
      }
    }, this.PROCESSING_INTERVAL);
  }

  /**
   * Stop the queue processor
   */
  stopProcessor(): void {
    this.isProcessing = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    console.log("Sync queue processor stopped");
  }

  /**
   * Process a batch of queue items
   */
  private async processBatch(): Promise<void> {
    try {
      // Get pending items that are scheduled to run
      const { data: queueItems, error } = await this.supabase
        .from("sync_queue")
        .select("*")
        .eq("status", "pending")
        .lte("scheduled_for", new Date().toISOString())
        .order("priority", { ascending: true })
        .order("created_at", { ascending: true })
        .limit(this.BATCH_SIZE);

      if (error) {
        console.error("Error fetching sync queue items:", error);
        return;
      }

      if (!queueItems || queueItems.length === 0) {
        return; // No items to process
      }

      console.log(`Processing ${queueItems.length} sync queue items`);

      // Process each item
      const processPromises = queueItems.map(item =>
        this.processQueueItem(item)
      );

      await Promise.allSettled(processPromises);
    } catch (error) {
      console.error("Error in processBatch:", error);
    }
  }

  /**
   * Process a single queue item
   */
  private async processQueueItem(item: SyncQueueItem): Promise<void> {
    const startTime = Date.now();

    try {
      // Mark item as processing
      await this.updateQueueItemStatus(item.id, "processing");

      let result: { success: boolean; message?: string } = { success: false };

      // Route to appropriate processor based on source and entity type
      switch (item.source) {
        case "shopify":
          result = await this.processShopifyItem(item);
          break;
        case "kajabi":
          result = await this.processKajabiItem(item);
          break;
        case "facebook":
        case "instagram":
          result = await this.processSocialItem(item);
          break;
        default:
          result = {
            success: false,
            message: `Unsupported source: ${item.source}`,
          };
      }

      if (result.success) {
        // Mark as completed
        await this.updateQueueItemStatus(item.id, "completed");
        console.log(
          `Successfully processed ${item.source} ${item.entity_type} ${item.entity_id}`
        );
      } else {
        // Handle failure
        await this.handleFailedItem(item, result.message);
      }
    } catch (error) {
      console.error(`Error processing queue item ${item.id}:`, error);
      await this.handleFailedItem(
        item,
        error instanceof Error ? error.message : "Unknown error"
      );
    }

    const processingTime = Date.now() - startTime;
    console.log(`Processed queue item ${item.id} in ${processingTime}ms`);
  }

  /**
   * Process Shopify sync item
   */
  private async processShopifyItem(
    item: SyncQueueItem
  ): Promise<{ success: boolean; message?: string }> {
    try {
      switch (item.entity_type) {
        case "customer":
          if (item.action === "delete") {
            return await this.handleCustomerDeletion(item.entity_id, "shopify");
          } else {
            const customerId =
              await customerDataIngestion.ingestShopifyCustomer(item.payload);
            if (customerId) {
              await this.triggerResegmentation(customerId);
              return { success: true, message: "Shopify customer processed" };
            }
            return {
              success: false,
              message: "Failed to process Shopify customer",
            };
          }

        case "order":
          return await this.processShopifyOrder(item.payload);

        default:
          return {
            success: false,
            message: `Unsupported Shopify entity: ${item.entity_type}`,
          };
      }
    } catch (error) {
      return { success: false, message: `Shopify processing error: ${error}` };
    }
  }

  /**
   * Process Kajabi sync item
   */
  private async processKajabiItem(
    item: SyncQueueItem
  ): Promise<{ success: boolean; message?: string }> {
    try {
      switch (item.entity_type) {
        case "customer":
          if (item.action === "delete") {
            return await this.handleCustomerDeletion(item.entity_id, "kajabi");
          } else {
            const customerId = await customerDataIngestion.ingestKajabiCustomer(
              item.payload
            );
            if (customerId) {
              await this.triggerResegmentation(customerId);
              return { success: true, message: "Kajabi customer processed" };
            }
            return {
              success: false,
              message: "Failed to process Kajabi customer",
            };
          }

        case "purchase":
          return await this.processKajabiPurchase(item.payload);

        default:
          return {
            success: false,
            message: `Unsupported Kajabi entity: ${item.entity_type}`,
          };
      }
    } catch (error) {
      return { success: false, message: `Kajabi processing error: ${error}` };
    }
  }

  /**
   * Process social media sync item
   */
  private async processSocialItem(
    item: SyncQueueItem
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // For social media, we need to find existing customers first
      // This is a simplified implementation
      console.log(
        `Processing social media item: ${item.source} ${item.entity_type}`
      );

      // Record social touchpoint if we can identify the customer
      return { success: true, message: "Social media event acknowledged" };
    } catch (error) {
      return {
        success: false,
        message: `Social media processing error: ${error}`,
      };
    }
  }

  /**
   * Process Shopify order
   */
  private async processShopifyOrder(
    orderData: any
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Find customer by email
      const customer = await customerDataIngestion.findExistingCustomer(
        orderData.email,
        orderData.customer?.id?.toString()
      );

      if (customer) {
        // Record purchase touchpoint
        await customerDataIngestion.recordTouchpoint({
          customer_id: customer.id,
          touchpoint_type: "purchase",
          touchpoint_source: "shopify",
          touchpoint_data: {
            order_id: orderData.id,
            order_total: orderData.total_price,
            line_items: orderData.line_items,
          },
          value: parseFloat(orderData.total_price),
          timestamp: orderData.created_at,
        });

        // Record purchase event
        await customerDataIngestion.recordCustomerEvent(customer.id, {
          event_type: "purchase",
          event_source: "shopify",
          event_data: {
            order_id: orderData.id,
            products: orderData.line_items?.map((item: any) => item.title),
          },
          event_value: parseFloat(orderData.total_price),
          event_date: orderData.created_at,
        });

        // Update customer metrics
        await this.updateCustomerMetrics(customer.id);
        await this.triggerResegmentation(customer.id);

        return { success: true, message: "Shopify order processed" };
      }

      return { success: false, message: "Customer not found for order" };
    } catch (error) {
      return { success: false, message: `Order processing error: ${error}` };
    }
  }

  /**
   * Process Kajabi purchase
   */
  private async processKajabiPurchase(
    purchaseData: any
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Similar to Shopify order processing but for Kajabi
      const customer = await customerDataIngestion.findExistingCustomer(
        purchaseData.email,
        purchaseData.person_id?.toString()
      );

      if (customer) {
        // Record purchase touchpoint
        await customerDataIngestion.recordTouchpoint({
          customer_id: customer.id,
          touchpoint_type: "purchase",
          touchpoint_source: "kajabi",
          touchpoint_data: {
            purchase_id: purchaseData.id,
            amount: purchaseData.amount,
            product: purchaseData.product,
          },
          value: parseFloat(purchaseData.amount || "0"),
          timestamp: purchaseData.created_at,
        });

        await this.updateCustomerMetrics(customer.id);
        await this.triggerResegmentation(customer.id);

        return { success: true, message: "Kajabi purchase processed" };
      }

      return { success: false, message: "Customer not found for purchase" };
    } catch (error) {
      return { success: false, message: `Purchase processing error: ${error}` };
    }
  }

  /**
   * Handle customer deletion
   */
  private async handleCustomerDeletion(
    externalId: string,
    source: "shopify" | "kajabi"
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const fieldName =
        source === "shopify" ? "shopify_customer_id" : "kajabi_customer_id";

      // Find customer by external ID
      const { data: customer } = await this.supabase
        .from("unified_customers")
        .select("id")
        .eq(fieldName, externalId)
        .single();

      if (customer) {
        // Mark as churned instead of deleting (for data retention)
        await this.supabase
          .from("unified_customers")
          .update({
            customer_status: "churned",
            [fieldName]: null, // Remove external ID link
            updated_at: new Date().toISOString(),
          })
          .eq("id", customer.id);

        // Record churn event
        await customerDataIngestion.recordCustomerEvent(customer.id, {
          event_type: "churn",
          event_source: source,
          event_data: { reason: "account_deleted" },
          event_date: new Date().toISOString(),
        });

        return {
          success: true,
          message: `Customer deletion processed for ${source}`,
        };
      }

      return {
        success: true,
        message: "Customer not found, deletion acknowledged",
      };
    } catch (error) {
      return { success: false, message: `Deletion processing error: ${error}` };
    }
  }

  /**
   * Update customer metrics after changes
   */
  private async updateCustomerMetrics(customerId: string): Promise<void> {
    try {
      // Recalculate churn risk
      await customerDataIngestion.calculateChurnRisk(customerId);

      // Update customer status and timestamps
      await this.supabase
        .from("unified_customers")
        .update({
          customer_status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", customerId);
    } catch (error) {
      console.error("Error updating customer metrics:", error);
    }
  }

  /**
   * Trigger customer re-segmentation
   */
  private async triggerResegmentation(_customerId: string): Promise<void> {
    try {
      // For now, we'll trigger a full re-segmentation
      // In production, this could be optimized to only re-evaluate relevant segments
      setTimeout(async () => {
        await customerSegmentation.applyAllSegments();
      }, 10000); // Delay to allow all updates to complete
    } catch (error) {
      console.error("Error triggering re-segmentation:", error);
    }
  }

  /**
   * Update queue item status
   */
  private async updateQueueItemStatus(
    itemId: string,
    status: "processing" | "completed" | "failed"
  ): Promise<void> {
    const updates: any = {
      status,
      processed_at: new Date().toISOString(),
    };

    await this.supabase.from("sync_queue").update(updates).eq("id", itemId);
  }

  /**
   * Handle failed queue item with retry logic
   */
  private async handleFailedItem(
    item: SyncQueueItem,
    errorMessage?: string
  ): Promise<void> {
    const newRetryCount = item.retry_count + 1;

    if (newRetryCount >= item.max_retries) {
      // Max retries reached, mark as failed
      await this.supabase
        .from("sync_queue")
        .update({
          status: "failed",
          retry_count: newRetryCount,
          error_message: errorMessage,
          processed_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      console.error(
        `Queue item ${item.id} failed permanently after ${newRetryCount} attempts: ${errorMessage}`
      );
    } else {
      // Schedule for retry with exponential backoff
      const delayMinutes = Math.pow(2, newRetryCount) * 5; // 5, 10, 20, 40 minutes
      const scheduledFor = new Date(Date.now() + delayMinutes * 60 * 1000);

      await this.supabase
        .from("sync_queue")
        .update({
          status: "pending",
          retry_count: newRetryCount,
          error_message: errorMessage,
          scheduled_for: scheduledFor.toISOString(),
        })
        .eq("id", item.id);

      console.log(
        `Queue item ${item.id} scheduled for retry ${newRetryCount} in ${delayMinutes} minutes`
      );
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<any> {
    try {
      const { data, error } = await this.supabase.rpc("get_sync_queue_stats");

      if (error) {
        console.error("Error getting queue stats:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getQueueStats:", error);
      return null;
    }
  }

  /**
   * Add item to sync queue
   */
  async addToQueue(
    item: Omit<
      SyncQueueItem,
      "id" | "created_at" | "status" | "retry_count" | "processed_at"
    >
  ): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from("sync_queue")
        .insert({
          ...item,
          status: "pending",
          retry_count: 0,
        })
        .select("id")
        .single();

      if (error) {
        console.error("Error adding item to sync queue:", error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error("Error in addToQueue:", error);
      return null;
    }
  }

  /**
   * Clear completed items older than specified days
   */
  async cleanupCompletedItems(daysOld: number = 7): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

      const { error } = await this.supabase
        .from("sync_queue")
        .delete()
        .eq("status", "completed")
        .lt("processed_at", cutoffDate.toISOString());

      if (error) {
        console.error("Error cleaning up completed items:", error);
      } else {
        console.log(
          `Cleaned up completed sync queue items older than ${daysOld} days`
        );
      }
    } catch (error) {
      console.error("Error in cleanupCompletedItems:", error);
    }
  }
}

// Export singleton instance
export const syncQueueProcessor = new SyncQueueProcessor();
