/**
 * n8n Webhook Orchestrator
 * Task 33.1: Setup Webhook Orchestration
 * Manages webhook endpoints and data flow between dashboard and n8n workflows
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { N8nWorkflowService } from "@/lib/marketing/n8n-workflow-service";

// Types for webhook handling
export interface WebhookEvent {
  id: string;
  workflowId: string;
  eventType:
    | "execution_started"
    | "execution_completed"
    | "execution_failed"
    | "workflow_updated";
  payload: Record<string, any>;
  timestamp: string;
  source: "n8n" | "dashboard";
  status: "pending" | "processed" | "failed";
  retryCount: number;
  metadata?: Record<string, any>;
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  isActive: boolean;
  security: {
    authentication: "none" | "bearer" | "basic" | "webhook_signature";
    token?: string;
    secretKey?: string;
  };
  triggers: string[];
  responseMapping: Record<string, string>;
  errorHandling: {
    retryAttempts: number;
    retryDelay: number;
    fallbackAction: "ignore" | "log" | "alert";
  };
}

export interface WorkflowTrigger {
  id: string;
  workflowId: string;
  triggerType: "webhook" | "schedule" | "manual" | "event";
  conditions: Record<string, any>;
  enabled: boolean;
  lastTriggered?: string;
  triggerCount: number;
}

export interface DataSyncConfig {
  sourceType: "dashboard" | "n8n";
  targetType: "dashboard" | "n8n";
  mapping: Record<string, string>;
  transformations: Array<{
    field: string;
    operation: "map" | "transform" | "validate";
    rule: string;
  }>;
  syncDirection: "bidirectional" | "unidirectional";
}

export class N8nWebhookOrchestrator {
  private supabase: ReturnType<typeof createClient>;
  private n8nService: N8nWorkflowService;
  private eventQueue: WebhookEvent[] = [];
  private processingQueue = false;
  private webhookEndpoints: Map<string, WebhookEndpoint> = new Map();
  private activeListeners: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    n8nService: N8nWorkflowService
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.n8nService = n8nService;
    this.initializeWebhookEndpoints();
  }

  /**
   * Initialize webhook endpoints and load configuration
   */
  private async initializeWebhookEndpoints(): Promise<void> {
    try {
      // Load webhook configurations from database
      const { data: endpoints, error } = await this.supabase
        .from("webhook_endpoints")
        .select("*")
        .eq("is_active", true);

      if (error) {
        console.error("Error loading webhook endpoints:", error);
        return;
      }

      // Register webhook endpoints
      endpoints?.forEach(endpoint => {
        this.webhookEndpoints.set(endpoint.id, {
          id: endpoint.id,
          name: endpoint.name,
          url: endpoint.url,
          method: endpoint.method,
          isActive: endpoint.is_active,
          security: endpoint.security,
          triggers: endpoint.triggers || [],
          responseMapping: endpoint.response_mapping || {},
          errorHandling: endpoint.error_handling || {
            retryAttempts: 3,
            retryDelay: 1000,
            fallbackAction: "log",
          },
        });
      });

      console.log(`Initialized ${endpoints?.length || 0} webhook endpoints`);
    } catch (error) {
      console.error("Failed to initialize webhook endpoints:", error);
    }
  }

  /**
   * Handle incoming webhook from n8n
   */
  async handleN8nWebhook(request: NextRequest): Promise<NextResponse> {
    try {
      // Check if request has content
      const contentType = request.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        return NextResponse.json(
          { error: "Content-Type must be application/json" },
          { status: 400 }
        );
      }

      // Get raw body text first
      const bodyText = await request.text();
      if (!bodyText || bodyText.trim() === "") {
        return NextResponse.json(
          { error: "Request body is empty" },
          { status: 400 }
        );
      }

      // Parse JSON safely
      let body: any;
      try {
        body = JSON.parse(bodyText);
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        console.error("Body text:", bodyText);
        return NextResponse.json(
          { error: "Invalid JSON in request body" },
          { status: 400 }
        );
      }

      const workflowId = body.workflowId || body.workflow?.id;
      const executionId = body.executionId || body.execution?.id;

      if (!workflowId) {
        return NextResponse.json(
          { error: "Missing workflowId in webhook payload" },
          { status: 400 }
        );
      }

      // Create webhook event
      const webhookEvent: WebhookEvent = {
        id: `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        workflowId,
        eventType: this.determineEventType(body),
        payload: body,
        timestamp: new Date().toISOString(),
        source: "n8n",
        status: "pending",
        retryCount: 0,
        metadata: {
          executionId,
          userAgent: request.headers.get("user-agent"),
          ipAddress:
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip"),
        },
      };

      // Add to processing queue
      this.eventQueue.push(webhookEvent);

      // Store in database for audit trail
      await this.storeWebhookEvent(webhookEvent);

      // Process the event
      await this.processWebhookEvent(webhookEvent);

      return NextResponse.json({
        success: true,
        eventId: webhookEvent.id,
        message: "Webhook received and queued for processing",
      });
    } catch (error) {
      console.error("Error handling n8n webhook:", error);
      return NextResponse.json(
        { error: "Failed to process webhook" },
        { status: 500 }
      );
    }
  }

  /**
   * Send webhook to n8n workflow
   */
  async sendWebhookToN8n(
    workflowId: string,
    data: Record<string, any>,
    triggerType: string = "webhook"
  ): Promise<boolean> {
    try {
      const webhookEvent: WebhookEvent = {
        id: `outgoing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        workflowId,
        eventType: "execution_started",
        payload: data,
        timestamp: new Date().toISOString(),
        source: "dashboard",
        status: "pending",
        retryCount: 0,
        metadata: {
          triggerType,
          initiatedBy: "dashboard",
        },
      };

      // Execute workflow via n8n service
      const execution = await this.n8nService.executeWorkflow(workflowId, data);

      // Update event status
      webhookEvent.status =
        execution.status === "error" ? "failed" : "processed";
      webhookEvent.metadata = {
        ...webhookEvent.metadata,
        executionId: execution.id,
        executionStatus: execution.status,
      };

      // Store event
      await this.storeWebhookEvent(webhookEvent);

      return execution.status !== "error";
    } catch (error) {
      console.error("Error sending webhook to n8n:", error);
      return false;
    }
  }

  /**
   * Register a new webhook endpoint
   */
  async registerWebhookEndpoint(
    endpoint: Omit<WebhookEndpoint, "id">
  ): Promise<string> {
    try {
      const endpointId = `endpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newEndpoint: WebhookEndpoint = {
        id: endpointId,
        ...endpoint,
      };

      // Store in database
      const { error } = await this.supabase.from("webhook_endpoints").insert({
        id: endpointId,
        name: endpoint.name,
        url: endpoint.url,
        method: endpoint.method,
        is_active: endpoint.isActive,
        security: endpoint.security,
        triggers: endpoint.triggers,
        response_mapping: endpoint.responseMapping,
        error_handling: endpoint.errorHandling,
      });

      if (error) {
        throw new Error(`Failed to store webhook endpoint: ${error.message}`);
      }

      // Register in memory
      this.webhookEndpoints.set(endpointId, newEndpoint);

      return endpointId;
    } catch (error) {
      console.error("Error registering webhook endpoint:", error);
      throw error;
    }
  }

  /**
   * Create workflow trigger
   */
  async createWorkflowTrigger(
    trigger: Omit<WorkflowTrigger, "id" | "triggerCount">
  ): Promise<string> {
    try {
      const triggerId = `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newTrigger: WorkflowTrigger = {
        id: triggerId,
        triggerCount: 0,
        ...trigger,
      };

      // Store in database
      const { error } = await this.supabase.from("workflow_triggers").insert({
        id: triggerId,
        workflow_id: trigger.workflowId,
        trigger_type: trigger.triggerType,
        conditions: trigger.conditions,
        enabled: trigger.enabled,
        last_triggered: trigger.lastTriggered,
        trigger_count: 0,
      });

      if (error) {
        throw new Error(`Failed to store workflow trigger: ${error.message}`);
      }

      return triggerId;
    } catch (error) {
      console.error("Error creating workflow trigger:", error);
      throw error;
    }
  }

  /**
   * Setup bidirectional data synchronization
   */
  async setupDataSync(config: DataSyncConfig): Promise<void> {
    try {
      // Store sync configuration
      await this.supabase.from("data_sync_configs").insert({
        source_type: config.sourceType,
        target_type: config.targetType,
        mapping: config.mapping,
        transformations: config.transformations,
        sync_direction: config.syncDirection,
        created_at: new Date().toISOString(),
      });

      // If bidirectional, setup reverse sync as well
      if (config.syncDirection === "bidirectional") {
        await this.supabase.from("data_sync_configs").insert({
          source_type: config.targetType,
          target_type: config.sourceType,
          mapping: this.reverseMapping(config.mapping),
          transformations: config.transformations,
          sync_direction: "unidirectional",
          created_at: new Date().toISOString(),
        });
      }

      console.log("Data synchronization setup completed");
    } catch (error) {
      console.error("Error setting up data sync:", error);
      throw error;
    }
  }

  /**
   * Get webhook orchestration status
   */
  async getOrchestrationStatus(): Promise<{
    activeEndpoints: number;
    queuedEvents: number;
    processedEvents: number;
    failedEvents: number;
    systemHealth: "healthy" | "warning" | "critical";
  }> {
    try {
      const { data: eventStats, error } = await this.supabase
        .from("webhook_events")
        .select("status")
        .gte(
          "created_at",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        );

      if (error) {
        throw error;
      }

      const processedEvents =
        eventStats?.filter(e => e.status === "processed").length || 0;
      const failedEvents =
        eventStats?.filter(e => e.status === "failed").length || 0;
      const queuedEvents = this.eventQueue.length;

      const totalEvents = eventStats?.length || 0;
      const successRate =
        totalEvents > 0 ? (processedEvents / totalEvents) * 100 : 100;

      const systemHealth =
        successRate > 95
          ? "healthy"
          : successRate > 80
            ? "warning"
            : "critical";

      return {
        activeEndpoints: this.webhookEndpoints.size,
        queuedEvents,
        processedEvents,
        failedEvents,
        systemHealth,
      };
    } catch (error) {
      console.error("Error getting orchestration status:", error);
      return {
        activeEndpoints: 0,
        queuedEvents: 0,
        processedEvents: 0,
        failedEvents: 0,
        systemHealth: "critical",
      };
    }
  }

  // Private helper methods

  private determineEventType(payload: any): WebhookEvent["eventType"] {
    if (payload.execution?.status === "running") {
      return "execution_started";
    } else if (payload.execution?.status === "success") {
      return "execution_completed";
    } else if (payload.execution?.status === "error") {
      return "execution_failed";
    } else if (payload.workflow) {
      return "workflow_updated";
    }
    return "execution_started";
  }

  private async processWebhookEvent(event: WebhookEvent): Promise<void> {
    try {
      // Start processing queue if not already running
      if (!this.processingQueue) {
        this.startEventProcessing();
      }

      // Apply any data transformations
      const transformedData = await this.transformWebhookData(event);

      // Route to appropriate handler based on event type
      switch (event.eventType) {
        case "execution_started":
          await this.handleExecutionStarted(transformedData);
          break;
        case "execution_completed":
          await this.handleExecutionCompleted(transformedData);
          break;
        case "execution_failed":
          await this.handleExecutionFailed(transformedData);
          break;
        case "workflow_updated":
          await this.handleWorkflowUpdated(transformedData);
          break;
      }

      // Update event status
      event.status = "processed";
      await this.updateWebhookEvent(event);
    } catch (error) {
      console.error("Error processing webhook event:", error);
      event.status = "failed";
      event.retryCount++;
      await this.updateWebhookEvent(event);

      // Retry if within limits
      if (event.retryCount < 3) {
        setTimeout(() => this.processWebhookEvent(event), 5000);
      }
    }
  }

  private async startEventProcessing(): Promise<void> {
    this.processingQueue = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event && event.status === "pending") {
        await this.processWebhookEvent(event);
      }
    }

    this.processingQueue = false;
  }

  private async transformWebhookData(
    event: WebhookEvent
  ): Promise<WebhookEvent> {
    // Apply any registered transformations
    const transformedPayload = { ...event.payload };

    // Basic data validation and sanitization
    if (transformedPayload.data) {
      transformedPayload.data = this.sanitizeData(transformedPayload.data);
    }

    return {
      ...event,
      payload: transformedPayload,
    };
  }

  private sanitizeData(data: any): any {
    if (typeof data === "object" && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Remove sensitive fields
        if (
          !["password", "secret", "token", "api_key"].includes(
            key.toLowerCase()
          )
        ) {
          sanitized[key] =
            typeof value === "object" ? this.sanitizeData(value) : value;
        }
      }
      return sanitized;
    }
    return data;
  }

  private async handleExecutionStarted(event: WebhookEvent): Promise<void> {
    // Update dashboard with execution start
    await this.supabase.from("workflow_executions").insert({
      workflow_id: event.workflowId,
      execution_id: event.metadata?.executionId,
      status: "running",
      started_at: event.timestamp,
      data: event.payload,
    });
  }

  private async handleExecutionCompleted(event: WebhookEvent): Promise<void> {
    // Update dashboard with execution completion
    await this.supabase
      .from("workflow_executions")
      .update({
        status: "completed",
        completed_at: event.timestamp,
        output_data: event.payload.data,
      })
      .eq("execution_id", event.metadata?.executionId);
  }

  private async handleExecutionFailed(event: WebhookEvent): Promise<void> {
    // Update dashboard with execution failure
    await this.supabase
      .from("workflow_executions")
      .update({
        status: "failed",
        completed_at: event.timestamp,
        error_message: event.payload.error?.message,
        error_details: event.payload.error,
      })
      .eq("execution_id", event.metadata?.executionId);
  }

  private async handleWorkflowUpdated(event: WebhookEvent): Promise<void> {
    // Update workflow cache in n8n service
    // This would trigger a refresh of the workflow data
    console.log("Workflow updated:", event.workflowId);
  }

  private async storeWebhookEvent(event: WebhookEvent): Promise<void> {
    try {
      const { error } = await this.supabase.from("webhook_events").insert({
        id: event.id,
        workflow_id: event.workflowId,
        event_type: event.eventType,
        payload: event.payload,
        timestamp: event.timestamp,
        source: event.source,
        status: event.status,
        retry_count: event.retryCount,
        metadata: event.metadata,
      });

      if (error) {
        console.error("Error storing webhook event:", error);
      }
    } catch (error) {
      console.error("Failed to store webhook event:", error);
    }
  }

  private async updateWebhookEvent(event: WebhookEvent): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("webhook_events")
        .update({
          status: event.status,
          retry_count: event.retryCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", event.id);

      if (error) {
        console.error("Error updating webhook event:", error);
      }
    } catch (error) {
      console.error("Failed to update webhook event:", error);
    }
  }

  private reverseMapping(
    mapping: Record<string, string>
  ): Record<string, string> {
    const reversed: Record<string, string> = {};
    for (const [key, value] of Object.entries(mapping)) {
      reversed[value] = key;
    }
    return reversed;
  }
}

// Export factory function
export const createN8nWebhookOrchestrator = (
  supabaseUrl: string,
  supabaseKey: string,
  n8nService: N8nWorkflowService
) => {
  return new N8nWebhookOrchestrator(supabaseUrl, supabaseKey, n8nService);
};

export default N8nWebhookOrchestrator;
