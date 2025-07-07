/**
 * Real-time KPI Updates Service - Task 61.10
 * Listens to workflow_executions table changes and provides real-time dashboard updates
 */

import { createClient } from "@/lib/supabase/client";
import { workflowKPIService } from "./workflow-kpi-service";

export interface KPIUpdateEvent {
  type: "workflow_execution" | "content_created" | "metrics_updated";
  data: {
    workflowName: string;
    executionId: string;
    status: string;
    metrics?: {
      totalExecutions: number;
      successRate: number;
      contentPieces: number;
      revenueImpact: number;
    };
  };
  timestamp: string;
}

export class RealTimeKPIService {
  private supabase;
  private subscriptions: Map<string, any> = new Map();
  private listeners: Map<string, ((event: KPIUpdateEvent) => void)[]> =
    new Map();

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Subscribe to real-time KPI updates
   */
  async subscribeToKPIUpdates(
    callback: (event: KPIUpdateEvent) => void
  ): Promise<string> {
    try {
      const channelId = `kpi-updates-${Date.now()}`;

      // Listen to workflow_executions table changes
      const channel = this.supabase
        .channel(channelId)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "workflow_executions",
          },
          async payload => {
            console.log("Workflow execution change detected:", payload);
            await this.handleWorkflowExecutionChange(payload, callback);
          }
        )
        .subscribe();

      this.subscriptions.set(channelId, channel);

      // Also store the callback for manual triggering
      if (!this.listeners.has(channelId)) {
        this.listeners.set(channelId, []);
      }
      this.listeners.get(channelId)!.push(callback);

      console.log(
        `[Real-time KPI] Subscribed to updates with channel: ${channelId}`
      );
      return channelId;
    } catch (error) {
      console.error("[Real-time KPI] Error subscribing to updates:", error);
      throw error;
    }
  }

  /**
   * Unsubscribe from real-time updates
   */
  async unsubscribe(channelId: string): Promise<void> {
    try {
      const channel = this.subscriptions.get(channelId);
      if (channel) {
        await this.supabase.removeChannel(channel);
        this.subscriptions.delete(channelId);
        this.listeners.delete(channelId);
        console.log(`[Real-time KPI] Unsubscribed from channel: ${channelId}`);
      }
    } catch (error) {
      console.error("[Real-time KPI] Error unsubscribing:", error);
    }
  }

  /**
   * Handle workflow execution changes and emit KPI updates
   */
  private async handleWorkflowExecutionChange(
    payload: any,
    callback: (event: KPIUpdateEvent) => void
  ): Promise<void> {
    try {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      // Determine the workflow data to use
      const workflowData = newRecord || oldRecord;

      if (!workflowData) {
        return;
      }

      // Create base event
      const baseEvent: Omit<KPIUpdateEvent, "metrics"> = {
        type: "workflow_execution",
        data: {
          workflowName: workflowData.workflow_name,
          executionId: workflowData.execution_id,
          status: workflowData.status,
        },
        timestamp: new Date().toISOString(),
      };

      // For INSERT and UPDATE events, fetch fresh metrics
      if (eventType === "INSERT" || eventType === "UPDATE") {
        // Check if this is a content creation workflow
        const isContentWorkflow = [
          "PostBuilder",
          "CarouselBuilder",
          "StoryBuilder",
          "ReelBuilder",
        ].includes(workflowData.workflow_name);

        if (isContentWorkflow && workflowData.status === "success") {
          const event: KPIUpdateEvent = {
            ...baseEvent,
            type: "content_created",
            data: {
              ...baseEvent.data,
              metrics: await this.getFreshMetrics(),
            },
          };
          callback(event);
        } else {
          // Regular workflow execution update
          const event: KPIUpdateEvent = {
            ...baseEvent,
            data: {
              ...baseEvent.data,
              metrics: await this.getFreshMetrics(),
            },
          };
          callback(event);
        }
      }

      // For any change, emit a general metrics update
      const metricsEvent: KPIUpdateEvent = {
        type: "metrics_updated",
        data: {
          workflowName: workflowData.workflow_name,
          executionId: workflowData.execution_id,
          status: workflowData.status,
          metrics: await this.getFreshMetrics(),
        },
        timestamp: new Date().toISOString(),
      };

      callback(metricsEvent);
    } catch (error) {
      console.error("[Real-time KPI] Error handling workflow change:", error);
    }
  }

  /**
   * Get fresh metrics from the workflow KPI service
   */
  private async getFreshMetrics() {
    try {
      const workflowMetrics =
        await workflowKPIService.getWorkflowKPIMetrics(30);
      const contentMetrics = await workflowKPIService.getContentMetrics(30);

      return {
        totalExecutions: workflowMetrics.totalExecutions,
        successRate: workflowMetrics.successRate,
        contentPieces: contentMetrics.totalContentPieces,
        revenueImpact: workflowMetrics.revenueImpact,
      };
    } catch (error) {
      console.error("[Real-time KPI] Error fetching fresh metrics:", error);
      return {
        totalExecutions: 0,
        successRate: 0,
        contentPieces: 0,
        revenueImpact: 0,
      };
    }
  }

  /**
   * Manually trigger a metrics update for all subscribers
   */
  async triggerMetricsUpdate(): Promise<void> {
    try {
      const metrics = await this.getFreshMetrics();

      for (const [channelId, callbacks] of this.listeners.entries()) {
        const event: KPIUpdateEvent = {
          type: "metrics_updated",
          data: {
            workflowName: "system",
            executionId: "manual-refresh",
            status: "success",
            metrics,
          },
          timestamp: new Date().toISOString(),
        };

        callbacks.forEach(callback => {
          try {
            callback(event);
          } catch (error) {
            console.error(
              `[Real-time KPI] Error in callback for ${channelId}:`,
              error
            );
          }
        });
      }
    } catch (error) {
      console.error("[Real-time KPI] Error triggering manual update:", error);
    }
  }

  /**
   * Get current subscription count
   */
  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Get list of active channel IDs
   */
  getActiveChannels(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Cleanup all subscriptions
   */
  async cleanup(): Promise<void> {
    try {
      const channelIds = Array.from(this.subscriptions.keys());

      for (const channelId of channelIds) {
        await this.unsubscribe(channelId);
      }

      console.log(
        `[Real-time KPI] Cleaned up ${channelIds.length} subscriptions`
      );
    } catch (error) {
      console.error("[Real-time KPI] Error during cleanup:", error);
    }
  }
}

// Singleton instance for the application
export const realTimeKPIService = new RealTimeKPIService();

// Browser-only hooks for React components
export function useRealTimeKPIUpdates(
  onUpdate: (event: KPIUpdateEvent) => void
): {
  subscribe: () => Promise<string>;
  unsubscribe: (channelId: string) => Promise<void>;
  isSubscribed: boolean;
} {
  let currentChannelId: string | null = null;

  const subscribe = async (): Promise<string> => {
    if (typeof window === "undefined") {
      throw new Error("Real-time updates only available in browser");
    }

    currentChannelId = await realTimeKPIService.subscribeToKPIUpdates(onUpdate);
    return currentChannelId;
  };

  const unsubscribe = async (channelId: string): Promise<void> => {
    await realTimeKPIService.unsubscribe(channelId);
    if (currentChannelId === channelId) {
      currentChannelId = null;
    }
  };

  return {
    subscribe,
    unsubscribe,
    isSubscribed: currentChannelId !== null,
  };
}
