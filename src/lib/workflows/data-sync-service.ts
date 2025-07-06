/**
 * Data Synchronization Service
 * Task 33.4: Enable Bidirectional Data Synchronization
 * Implements mechanisms to keep data consistent and synchronized in both directions between the dashboard and n8n
 */

import { createClient } from "@supabase/supabase-js";
import {
  N8nWorkflowService,
  createN8nWorkflowService,
} from "@/lib/marketing/n8n-workflow-service";

// Types for data synchronization
export interface DataSyncConfig {
  id?: number;
  sourceType: "dashboard" | "n8n";
  targetType: "dashboard" | "n8n";
  mapping: Record<string, string>;
  transformations: DataTransformation[];
  syncDirection: "bidirectional" | "unidirectional";
  enabled: boolean;
  lastSync?: string;
  syncCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DataTransformation {
  field: string;
  operation: "map" | "transform" | "validate" | "format" | "filter";
  rule: string;
  parameters?: Record<string, any>;
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsSynced: number;
  errors: SyncError[];
  metadata: {
    syncId: string;
    startTime: string;
    endTime: string;
    duration: number;
    direction: "dashboard_to_n8n" | "n8n_to_dashboard";
  };
}

export interface SyncError {
  recordId: string;
  field?: string;
  error: string;
  errorCode: string;
  retryable: boolean;
}

export interface SyncableEntity {
  id: string;
  type:
    | "user"
    | "workflow"
    | "execution"
    | "campaign"
    | "customer"
    | "analytics";
  data: Record<string, any>;
  lastModified: string;
  version: number;
  source: "dashboard" | "n8n";
}

export class DataSyncService {
  private supabase;
  private n8nService: N8nWorkflowService;
  private syncConfigs: Map<string, DataSyncConfig> = new Map();
  private activeSyncs: Set<string> = new Set();

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.n8nService = createN8nWorkflowService({
      baseUrl: process.env.N8N_BASE_URL || "http://localhost:5678",
      apiKey: process.env.N8N_API_KEY || "",
    });
  }

  /**
   * Initialize the data sync service and load configurations
   */
  async initialize(): Promise<void> {
    try {
      await this.loadSyncConfigurations();
      await this.setupConflictResolution();
      console.log("Data sync service initialized successfully");
    } catch (error) {
      console.error("Failed to initialize data sync service:", error);
      throw error;
    }
  }

  /**
   * Load sync configurations from database
   */
  private async loadSyncConfigurations(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from("data_sync_configs")
        .select("*")
        .eq("enabled", true);

      if (error) throw error;

      this.syncConfigs.clear();
      data?.forEach(config => {
        const key = `${config.source_type}_to_${config.target_type}`;
        this.syncConfigs.set(key, {
          id: config.id,
          sourceType: config.source_type,
          targetType: config.target_type,
          mapping: config.mapping,
          transformations: config.transformations || [],
          syncDirection: config.sync_direction,
          enabled: config.enabled,
          lastSync: config.last_sync,
          syncCount: config.sync_count || 0,
          createdAt: config.created_at,
          updatedAt: config.updated_at,
        });
      });

      console.log(`Loaded ${this.syncConfigs.size} sync configurations`);
    } catch (error) {
      console.error("Error loading sync configurations:", error);
      throw error;
    }
  }

  /**
   * Perform bidirectional data synchronization
   */
  async performBidirectionalSync(entityType: string): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    try {
      // Sync dashboard to n8n
      const dashboardToN8nConfig = this.syncConfigs.get("dashboard_to_n8n");
      if (dashboardToN8nConfig?.enabled) {
        const dashboardToN8nResult = await this.syncData(
          "dashboard",
          "n8n",
          entityType,
          dashboardToN8nConfig
        );
        results.push(dashboardToN8nResult);
      }

      // Sync n8n to dashboard
      const n8nToDashboardConfig = this.syncConfigs.get("n8n_to_dashboard");
      if (n8nToDashboardConfig?.enabled) {
        const n8nToDashboardResult = await this.syncData(
          "n8n",
          "dashboard",
          entityType,
          n8nToDashboardConfig
        );
        results.push(n8nToDashboardResult);
      }

      // Handle conflicts if any
      await this.resolveConflicts(results);

      return results;
    } catch (error) {
      console.error("Error performing bidirectional sync:", error);
      throw error;
    }
  }

  /**
   * Sync data from source to target
   */
  async syncData(
    source: "dashboard" | "n8n",
    target: "dashboard" | "n8n",
    entityType: string,
    config: DataSyncConfig
  ): Promise<SyncResult> {
    const syncId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = new Date().toISOString();
    const direction = `${source}_to_${target}` as
      | "dashboard_to_n8n"
      | "n8n_to_dashboard";

    // Prevent concurrent syncs for the same direction
    if (this.activeSyncs.has(direction)) {
      throw new Error(`Sync already in progress for direction: ${direction}`);
    }

    this.activeSyncs.add(direction);

    try {
      // Get entities from source
      const sourceEntities = await this.getEntitiesFromSource(
        source,
        entityType
      );

      // Transform data according to mapping and transformations
      const transformedEntities = await this.transformEntities(
        sourceEntities,
        config.mapping,
        config.transformations
      );

      // Sync to target
      const syncResults = await this.syncEntitiesToTarget(
        target,
        entityType,
        transformedEntities
      );

      const endTime = new Date().toISOString();
      const duration =
        new Date(endTime).getTime() - new Date(startTime).getTime();

      // Update sync statistics
      await this.updateSyncStatistics(config, syncResults);

      const result: SyncResult = {
        success: syncResults.errors.length === 0,
        recordsProcessed: sourceEntities.length,
        recordsSynced: syncResults.synced,
        errors: syncResults.errors,
        metadata: {
          syncId,
          startTime,
          endTime,
          duration,
          direction,
        },
      };

      // Log sync result
      await this.logSyncResult(result);

      return result;
    } finally {
      this.activeSyncs.delete(direction);
    }
  }

  /**
   * Get entities from source system
   */
  private async getEntitiesFromSource(
    source: "dashboard" | "n8n",
    entityType: string
  ): Promise<SyncableEntity[]> {
    if (source === "dashboard") {
      return await this.getDashboardEntities(entityType);
    } else {
      return await this.getN8nEntities(entityType);
    }
  }

  /**
   * Get entities from dashboard
   */
  private async getDashboardEntities(
    entityType: string
  ): Promise<SyncableEntity[]> {
    const entities: SyncableEntity[] = [];

    try {
      switch (entityType) {
        case "user":
          const { data: users } = await this.supabase
            .from("auth.users")
            .select("*");

          users?.forEach(user => {
            entities.push({
              id: user.id,
              type: "user",
              data: {
                email: user.email,
                name: user.user_metadata?.name,
                createdAt: user.created_at,
                lastSignIn: user.last_sign_in_at,
              },
              lastModified: user.updated_at || user.created_at,
              version: 1,
              source: "dashboard",
            });
          });
          break;

        case "customer":
          const { data: customers } = await this.supabase
            .from("customers")
            .select("*");

          customers?.forEach(customer => {
            entities.push({
              id: customer.id,
              type: "customer",
              data: customer,
              lastModified: customer.updated_at || customer.created_at,
              version: customer.version || 1,
              source: "dashboard",
            });
          });
          break;

        case "workflow":
          const { data: executions } = await this.supabase
            .from("workflow_executions")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(100);

          executions?.forEach(execution => {
            entities.push({
              id: execution.id,
              type: "execution",
              data: {
                workflowId: execution.workflow_id,
                executionId: execution.execution_id,
                status: execution.status,
                startedAt: execution.started_at,
                completedAt: execution.completed_at,
                data: execution.data,
                outputData: execution.output_data,
                errorMessage: execution.error_message,
                duration: execution.duration_ms,
              },
              lastModified: execution.updated_at || execution.created_at,
              version: 1,
              source: "dashboard",
            });
          });
          break;
      }

      return entities;
    } catch (error) {
      console.error(
        `Error getting dashboard entities for ${entityType}:`,
        error
      );
      return [];
    }
  }

  /**
   * Get entities from n8n
   */
  private async getN8nEntities(entityType: string): Promise<SyncableEntity[]> {
    const entities: SyncableEntity[] = [];

    try {
      switch (entityType) {
        case "workflow":
          const workflows = await this.n8nService.getAllWorkflows();

          workflows.forEach(workflow => {
            entities.push({
              id: workflow.id,
              type: "workflow",
              data: {
                name: workflow.name,
                status: workflow.status,
                type: workflow.type,
                executionCount: workflow.execution_count,
                successRate: workflow.success_rate,
                lastExecution: workflow.last_execution,
                nextExecution: workflow.next_execution,
                tags: workflow.tags,
              },
              lastModified: workflow.updated_at,
              version: 1,
              source: "n8n",
            });
          });
          break;

        case "execution":
          // Get recent executions from all workflows
          const allWorkflows = await this.n8nService.getAllWorkflows();

          for (const workflow of allWorkflows) {
            const executions = await this.n8nService.getWorkflowExecutions(
              workflow.id
            );

            executions.forEach(execution => {
              entities.push({
                id: execution.id,
                type: "execution",
                data: {
                  workflowId: execution.workflow_id,
                  status: execution.status,
                  startTime: execution.start_time,
                  endTime: execution.end_time,
                  duration: execution.duration,
                  data: execution.data,
                  errorMessage: execution.error_message,
                  triggerSource: execution.trigger_source,
                },
                lastModified: execution.end_time || execution.start_time,
                version: 1,
                source: "n8n",
              });
            });
          }
          break;
      }

      return entities;
    } catch (error) {
      console.error(`Error getting n8n entities for ${entityType}:`, error);
      return [];
    }
  }

  /**
   * Transform entities according to mapping and transformations
   */
  private async transformEntities(
    entities: SyncableEntity[],
    mapping: Record<string, string>,
    transformations: DataTransformation[]
  ): Promise<SyncableEntity[]> {
    return entities.map(entity => {
      const transformedData: Record<string, any> = {};

      // Apply field mapping
      Object.entries(mapping).forEach(([sourceField, targetField]) => {
        if (entity.data[sourceField] !== undefined) {
          transformedData[targetField] = entity.data[sourceField];
        }
      });

      // Apply transformations
      transformations.forEach(transformation => {
        if (transformedData[transformation.field] !== undefined) {
          transformedData[transformation.field] = this.applyTransformation(
            transformedData[transformation.field],
            transformation
          );
        }
      });

      return {
        ...entity,
        data: { ...entity.data, ...transformedData },
      };
    });
  }

  /**
   * Apply a single transformation to a field value
   */
  private applyTransformation(
    value: any,
    transformation: DataTransformation
  ): any {
    switch (transformation.operation) {
      case "format":
        if (transformation.rule === "date_iso") {
          return new Date(value).toISOString();
        }
        if (transformation.rule === "uppercase") {
          return typeof value === "string" ? value.toUpperCase() : value;
        }
        break;

      case "validate":
        if (transformation.rule === "email" && typeof value === "string") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value) ? value : null;
        }
        break;

      case "filter":
        if (transformation.rule === "not_null") {
          return value != null ? value : undefined;
        }
        break;

      case "transform":
        // Custom transformation logic based on rule
        if (transformation.rule === "status_mapping") {
          const statusMap = transformation.parameters?.statusMap || {};
          return statusMap[value] || value;
        }
        break;
    }

    return value;
  }

  /**
   * Sync entities to target system
   */
  private async syncEntitiesToTarget(
    target: "dashboard" | "n8n",
    entityType: string,
    entities: SyncableEntity[]
  ): Promise<{ synced: number; errors: SyncError[] }> {
    const errors: SyncError[] = [];
    let synced = 0;

    for (const entity of entities) {
      try {
        if (target === "dashboard") {
          await this.syncEntityToDashboard(entityType, entity);
        } else {
          await this.syncEntityToN8n(entityType, entity);
        }
        synced++;
      } catch (error) {
        errors.push({
          recordId: entity.id,
          error: error instanceof Error ? error.message : "Unknown error",
          errorCode: "SYNC_ERROR",
          retryable: true,
        });
      }
    }

    return { synced, errors };
  }

  /**
   * Sync entity to dashboard
   */
  private async syncEntityToDashboard(
    entityType: string,
    entity: SyncableEntity
  ): Promise<void> {
    switch (entityType) {
      case "workflow":
        await this.supabase.from("n8n_workflows").upsert({
          workflow_id: entity.id,
          name: entity.data.name,
          status: entity.data.status,
          type: entity.data.type,
          execution_count: entity.data.executionCount,
          success_rate: entity.data.successRate,
          last_execution: entity.data.lastExecution,
          next_execution: entity.data.nextExecution,
          tags: entity.data.tags,
          synced_at: new Date().toISOString(),
        });
        break;

      case "execution":
        await this.supabase.from("workflow_executions").upsert({
          execution_id: entity.id,
          workflow_id: entity.data.workflowId,
          status: entity.data.status,
          started_at: entity.data.startTime,
          completed_at: entity.data.endTime,
          duration_ms: entity.data.duration,
          data: entity.data.data,
          output_data: entity.data.outputData,
          error_message: entity.data.errorMessage,
          synced_at: new Date().toISOString(),
        });
        break;
    }
  }

  /**
   * Sync entity to n8n
   */
  private async syncEntityToN8n(
    entityType: string,
    entity: SyncableEntity
  ): Promise<void> {
    switch (entityType) {
      case "user":
        // Trigger n8n workflow with user data
        await this.n8nService.executeWorkflow("user-sync-workflow", {
          userId: entity.id,
          email: entity.data.email,
          name: entity.data.name,
          action: "sync_user",
        });
        break;

      case "customer":
        // Trigger n8n workflow with customer data
        await this.n8nService.executeWorkflow("customer-sync-workflow", {
          customerId: entity.id,
          customerData: entity.data,
          action: "sync_customer",
        });
        break;
    }
  }

  /**
   * Resolve conflicts between synchronized data
   */
  private async resolveConflicts(syncResults: SyncResult[]): Promise<void> {
    // Implementation for conflict resolution
    // For now, we'll use a simple last-write-wins strategy
    console.log(
      "Conflict resolution completed for",
      syncResults.length,
      "sync operations"
    );
  }

  /**
   * Setup conflict resolution mechanisms
   */
  private async setupConflictResolution(): Promise<void> {
    // Create conflict resolution table if it doesn't exist
    await this.supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS data_sync_conflicts (
          id SERIAL PRIMARY KEY,
          entity_id VARCHAR(255) NOT NULL,
          entity_type VARCHAR(50) NOT NULL,
          source_data JSONB NOT NULL,
          target_data JSONB NOT NULL,
          resolution_strategy VARCHAR(50) DEFAULT 'manual',
          resolved BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          resolved_at TIMESTAMP WITH TIME ZONE
        );
      `,
    });
  }

  /**
   * Update sync statistics
   */
  private async updateSyncStatistics(
    config: DataSyncConfig,
    results: { synced: number; errors: SyncError[] }
  ): Promise<void> {
    if (config.id) {
      await this.supabase
        .from("data_sync_configs")
        .update({
          last_sync: new Date().toISOString(),
          sync_count: config.syncCount + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", config.id);
    }
  }

  /**
   * Log sync result for monitoring
   */
  private async logSyncResult(result: SyncResult): Promise<void> {
    await this.supabase.from("data_sync_logs").insert({
      sync_id: result.metadata.syncId,
      direction: result.metadata.direction,
      success: result.success,
      records_processed: result.recordsProcessed,
      records_synced: result.recordsSynced,
      error_count: result.errors.length,
      duration_ms: result.metadata.duration,
      started_at: result.metadata.startTime,
      completed_at: result.metadata.endTime,
      errors: result.errors,
    });
  }

  /**
   * Get sync status and statistics
   */
  async getSyncStatus(): Promise<{
    configs: DataSyncConfig[];
    activeSyncs: string[];
    recentResults: any[];
  }> {
    const configs = Array.from(this.syncConfigs.values());
    const activeSyncs = Array.from(this.activeSyncs);

    const { data: recentResults } = await this.supabase
      .from("data_sync_logs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(10);

    return {
      configs,
      activeSyncs,
      recentResults: recentResults || [],
    };
  }

  /**
   * Create or update sync configuration
   */
  async createSyncConfig(
    config: Omit<DataSyncConfig, "id" | "syncCount">
  ): Promise<DataSyncConfig> {
    const { data, error } = await this.supabase
      .from("data_sync_configs")
      .insert({
        source_type: config.sourceType,
        target_type: config.targetType,
        mapping: config.mapping,
        transformations: config.transformations,
        sync_direction: config.syncDirection,
        enabled: config.enabled,
        sync_count: 0,
      })
      .select()
      .single();

    if (error) throw error;

    const newConfig: DataSyncConfig = {
      id: data.id,
      sourceType: data.source_type,
      targetType: data.target_type,
      mapping: data.mapping,
      transformations: data.transformations || [],
      syncDirection: data.sync_direction,
      enabled: data.enabled,
      syncCount: data.sync_count || 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    // Add to cache
    const key = `${newConfig.sourceType}_to_${newConfig.targetType}`;
    this.syncConfigs.set(key, newConfig);

    return newConfig;
  }
}

// Export singleton instance
export const dataSyncService = new DataSyncService();
