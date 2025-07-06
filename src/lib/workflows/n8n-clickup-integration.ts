import { ClickUpClient } from "../apis/clickup-client";

// Types voor n8n workflow integration
export interface N8nWorkflow {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  tags: string[];
  nodes: N8nNode[];
  connections: Record<string, any>;
  settings: N8nWorkflowSettings;
  created_at: Date;
  updated_at: Date;
  last_execution?: Date;
  execution_count: number;
  success_rate: number;
}

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, string>;
}

export interface N8nWorkflowSettings {
  saveDataErrorExecution: string;
  saveDataSuccessExecution: string;
  saveManualExecutions: boolean;
  callerPolicy: string;
  errorWorkflow?: string;
  timezone: string;
}

export interface N8nExecution {
  id: string;
  workflow_id: string;
  mode: "manual" | "trigger" | "webhook" | "retry";
  status: "success" | "error" | "waiting" | "running";
  started_at: Date;
  finished_at?: Date;
  duration?: number;
  data: Record<string, any>;
  error?: string;
  trigger_data?: Record<string, any>;
}

export interface ClickUpWorkflowTrigger {
  id: string;
  workflow_id: string;
  event_type:
    | "task_created"
    | "task_updated"
    | "task_completed"
    | "task_deleted"
    | "comment_added"
    | "time_tracked"
    | "custom_field_updated";
  space_id?: string;
  list_id?: string;
  task_id?: string;
  conditions: WorkflowCondition[];
  active: boolean;
  created_at: Date;
  last_triggered?: Date;
  trigger_count: number;
}

export interface WorkflowCondition {
  field: string;
  operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "not_contains"
    | "greater_than"
    | "less_than"
    | "is_empty"
    | "is_not_empty";
  value: any;
}

export interface WorkflowAction {
  id: string;
  workflow_id: string;
  type:
    | "create_task"
    | "update_task"
    | "move_task"
    | "assign_task"
    | "add_comment"
    | "start_timer"
    | "send_notification"
    | "custom_webhook";
  parameters: Record<string, any>;
  order: number;
  condition?: WorkflowCondition[];
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category:
    | "productivity"
    | "automation"
    | "reporting"
    | "integration"
    | "notification";
  tags: string[];
  workflow_data: Partial<N8nWorkflow>;
  trigger_templates: Partial<ClickUpWorkflowTrigger>[];
  action_templates: Partial<WorkflowAction>[];
  variables: WorkflowVariable[];
  use_count: number;
  rating: number;
  created_by: string;
}

export interface WorkflowVariable {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "array" | "object";
  description: string;
  required: boolean;
  default_value?: any;
  options?: any[];
}

export interface WorkflowStats {
  total_workflows: number;
  active_workflows: number;
  total_executions_today: number;
  successful_executions_today: number;
  failed_executions_today: number;
  average_execution_time: number;
  most_used_template: string;
  execution_trend: Array<{
    date: string;
    executions: number;
    success_rate: number;
  }>;
}

export class N8nClickUpIntegrationService {
  private clickupClient: ClickUpClient;
  private n8nBaseUrl: string;
  private n8nApiKey: string;

  constructor(
    clickupApiKey: string,
    n8nBaseUrl: string = "http://localhost:5678",
    n8nApiKey: string
  ) {
    this.clickupClient = new ClickUpClient(clickupApiKey);
    this.n8nBaseUrl = n8nBaseUrl;
    this.n8nApiKey = n8nApiKey;
  }

  // n8n API Integration
  private async n8nRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${this.n8nBaseUrl}/api/v1${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-N8N-API-KEY": this.n8nApiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(
        `n8n API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  // Workflow Management
  async getWorkflows(): Promise<N8nWorkflow[]> {
    try {
      const response = await this.n8nRequest("/workflows");
      return (
        response.data?.map((workflow: any) => this.formatWorkflow(workflow)) ||
        []
      );
    } catch (error) {
      console.error("Error fetching workflows:", error);
      return [];
    }
  }

  async getWorkflow(workflowId: string): Promise<N8nWorkflow | null> {
    try {
      const response = await this.n8nRequest(`/workflows/${workflowId}`);
      return this.formatWorkflow(response.data);
    } catch (error) {
      console.error("Error fetching workflow:", error);
      return null;
    }
  }

  async createWorkflow(
    workflowData: Partial<N8nWorkflow>
  ): Promise<N8nWorkflow> {
    try {
      const response = await this.n8nRequest("/workflows", {
        method: "POST",
        body: JSON.stringify(workflowData),
      });
      return this.formatWorkflow(response.data);
    } catch (error) {
      console.error("Error creating workflow:", error);
      throw error;
    }
  }

  async updateWorkflow(
    workflowId: string,
    updates: Partial<N8nWorkflow>
  ): Promise<N8nWorkflow> {
    try {
      const response = await this.n8nRequest(`/workflows/${workflowId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      return this.formatWorkflow(response.data);
    } catch (error) {
      console.error("Error updating workflow:", error);
      throw error;
    }
  }

  async deleteWorkflow(workflowId: string): Promise<boolean> {
    try {
      await this.n8nRequest(`/workflows/${workflowId}`, {
        method: "DELETE",
      });
      return true;
    } catch (error) {
      console.error("Error deleting workflow:", error);
      return false;
    }
  }

  async activateWorkflow(workflowId: string): Promise<boolean> {
    try {
      await this.n8nRequest(`/workflows/${workflowId}/activate`, {
        method: "POST",
      });
      return true;
    } catch (error) {
      console.error("Error activating workflow:", error);
      return false;
    }
  }

  async deactivateWorkflow(workflowId: string): Promise<boolean> {
    try {
      await this.n8nRequest(`/workflows/${workflowId}/deactivate`, {
        method: "POST",
      });
      return true;
    } catch (error) {
      console.error("Error deactivating workflow:", error);
      return false;
    }
  }

  // Workflow Execution
  async executeWorkflow(
    workflowId: string,
    inputData?: Record<string, any>
  ): Promise<N8nExecution> {
    try {
      const response = await this.n8nRequest(
        `/workflows/${workflowId}/execute`,
        {
          method: "POST",
          body: JSON.stringify({ data: inputData || {} }),
        }
      );
      return this.formatExecution(response.data);
    } catch (error) {
      console.error("Error executing workflow:", error);
      throw error;
    }
  }

  async getExecutions(
    workflowId?: string,
    limit: number = 50
  ): Promise<N8nExecution[]> {
    try {
      const params = new URLSearchParams();
      if (workflowId) params.append("workflowId", workflowId);
      params.append("limit", limit.toString());

      const response = await this.n8nRequest(
        `/executions?${params.toString()}`
      );
      return (
        response.data?.map((execution: any) =>
          this.formatExecution(execution)
        ) || []
      );
    } catch (error) {
      console.error("Error fetching executions:", error);
      return [];
    }
  }

  async getExecution(executionId: string): Promise<N8nExecution | null> {
    try {
      const response = await this.n8nRequest(`/executions/${executionId}`);
      return this.formatExecution(response.data);
    } catch (error) {
      console.error("Error fetching execution:", error);
      return null;
    }
  }

  async retryExecution(executionId: string): Promise<N8nExecution> {
    try {
      const response = await this.n8nRequest(
        `/executions/${executionId}/retry`,
        {
          method: "POST",
        }
      );
      return this.formatExecution(response.data);
    } catch (error) {
      console.error("Error retrying execution:", error);
      throw error;
    }
  }

  // ClickUp Integration
  async createClickUpWorkflowTrigger(
    trigger: Partial<ClickUpWorkflowTrigger>
  ): Promise<ClickUpWorkflowTrigger> {
    try {
      // This would typically involve setting up webhook endpoints and registering them with ClickUp
      const webhookUrl = `${this.n8nBaseUrl}/webhook/${trigger.workflow_id}/clickup-trigger`;

      // Register webhook with ClickUp if needed
      if (trigger.space_id) {
        await this.clickupClient.request(`/space/${trigger.space_id}/webhook`, {
          method: "POST",
          body: JSON.stringify({
            endpoint: webhookUrl,
            events: [trigger.event_type],
          }),
        });
      }

      // Store trigger configuration (this would be stored in database in real implementation)
      const newTrigger: ClickUpWorkflowTrigger = {
        id: `trigger_${Date.now()}`,
        workflow_id: trigger.workflow_id!,
        event_type: trigger.event_type!,
        space_id: trigger.space_id,
        list_id: trigger.list_id,
        task_id: trigger.task_id,
        conditions: trigger.conditions || [],
        active: true,
        created_at: new Date(),
        trigger_count: 0,
      };

      return newTrigger;
    } catch (error) {
      console.error("Error creating ClickUp workflow trigger:", error);
      throw error;
    }
  }

  async processClickUpEvent(eventType: string, eventData: any): Promise<void> {
    try {
      // Find matching triggers for this event
      const triggers = await this.getTriggersForEvent(eventType, eventData);

      for (const trigger of triggers) {
        if (this.evaluateConditions(trigger.conditions, eventData)) {
          // Execute the workflow
          await this.executeWorkflow(trigger.workflow_id, {
            clickup_event: eventType,
            clickup_data: eventData,
            trigger_id: trigger.id,
          });

          // Update trigger statistics
          await this.updateTriggerStats(trigger.id);
        }
      }
    } catch (error) {
      console.error("Error processing ClickUp event:", error);
    }
  }

  // Workflow Templates
  async getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    // In a real implementation, these would be stored in a database
    return this.getBuiltInTemplates();
  }

  async createWorkflowFromTemplate(
    templateId: string,
    variables: Record<string, any>
  ): Promise<N8nWorkflow> {
    try {
      const template = await this.getWorkflowTemplate(templateId);
      if (!template) {
        throw new Error("Template not found");
      }

      // Replace variables in template
      const workflowData = this.replaceTemplateVariables(
        template.workflow_data,
        variables
      );

      // Create workflow
      const workflow = await this.createWorkflow(workflowData);

      // Create triggers if specified
      for (const triggerTemplate of template.trigger_templates) {
        const triggerData = this.replaceTemplateVariables(
          triggerTemplate,
          variables
        );
        await this.createClickUpWorkflowTrigger({
          ...triggerData,
          workflow_id: workflow.id,
        });
      }

      return workflow;
    } catch (error) {
      console.error("Error creating workflow from template:", error);
      throw error;
    }
  }

  // Analytics and Monitoring
  async getWorkflowStats(): Promise<WorkflowStats> {
    try {
      const workflows = await this.getWorkflows();
      const executions = await this.getExecutions();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayExecutions = executions.filter(
        exec => exec.started_at >= today
      );
      const successfulToday = todayExecutions.filter(
        exec => exec.status === "success"
      );
      const failedToday = todayExecutions.filter(
        exec => exec.status === "error"
      );

      const avgExecutionTime =
        executions
          .filter(exec => exec.duration)
          .reduce((sum, exec) => sum + (exec.duration || 0), 0) /
          executions.length || 0;

      // Generate trend data (last 7 days)
      const executionTrend = this.generateExecutionTrend(executions, 7);

      return {
        total_workflows: workflows.length,
        active_workflows: workflows.filter(w => w.active).length,
        total_executions_today: todayExecutions.length,
        successful_executions_today: successfulToday.length,
        failed_executions_today: failedToday.length,
        average_execution_time: avgExecutionTime,
        most_used_template: "task-automation",
        execution_trend: executionTrend,
      };
    } catch (error) {
      console.error("Error getting workflow stats:", error);
      throw error;
    }
  }

  // Helper Methods
  private formatWorkflow(data: any): N8nWorkflow {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      active: data.active,
      tags: data.tags || [],
      nodes: data.nodes || [],
      connections: data.connections || {},
      settings: data.settings || {},
      created_at: new Date(data.createdAt || Date.now()),
      updated_at: new Date(data.updatedAt || Date.now()),
      last_execution: data.lastExecution
        ? new Date(data.lastExecution)
        : undefined,
      execution_count: data.executionCount || 0,
      success_rate: data.successRate || 100,
    };
  }

  private formatExecution(data: any): N8nExecution {
    return {
      id: data.id,
      workflow_id: data.workflowId,
      mode: data.mode || "manual",
      status: data.finished
        ? data.success
          ? "success"
          : "error"
        : data.status || "running",
      started_at: new Date(data.startedAt),
      finished_at: data.finishedAt ? new Date(data.finishedAt) : undefined,
      duration: data.finishedAt
        ? new Date(data.finishedAt).getTime() -
          new Date(data.startedAt).getTime()
        : undefined,
      data: data.data || {},
      error: data.error,
      trigger_data: data.triggerData,
    };
  }

  private async getTriggersForEvent(
    eventType: string,
    eventData: any
  ): Promise<ClickUpWorkflowTrigger[]> {
    // This would fetch from database in real implementation
    // For now, return mock triggers
    return [];
  }

  private evaluateConditions(
    conditions: WorkflowCondition[],
    data: any
  ): boolean {
    return conditions.every(condition => {
      const fieldValue = this.getNestedValue(data, condition.field);

      switch (condition.operator) {
        case "equals":
          return fieldValue === condition.value;
        case "not_equals":
          return fieldValue !== condition.value;
        case "contains":
          return String(fieldValue).includes(String(condition.value));
        case "not_contains":
          return !String(fieldValue).includes(String(condition.value));
        case "greater_than":
          return Number(fieldValue) > Number(condition.value);
        case "less_than":
          return Number(fieldValue) < Number(condition.value);
        case "is_empty":
          return !fieldValue || fieldValue === "";
        case "is_not_empty":
          return fieldValue && fieldValue !== "";
        default:
          return false;
      }
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  private async updateTriggerStats(triggerId: string): Promise<void> {
    // Update trigger statistics in database
    // This would be implemented with actual database operations
  }

  private async getWorkflowTemplate(
    templateId: string
  ): Promise<WorkflowTemplate | null> {
    const templates = this.getBuiltInTemplates();
    return templates.find(t => t.id === templateId) || null;
  }

  private replaceTemplateVariables(
    template: any,
    variables: Record<string, any>
  ): any {
    const templateStr = JSON.stringify(template);
    const replacedStr = templateStr.replace(
      /\{\{(\w+)\}\}/g,
      (match, varName) => {
        return variables[varName] !== undefined
          ? JSON.stringify(variables[varName])
          : match;
      }
    );
    return JSON.parse(replacedStr);
  }

  private generateExecutionTrend(
    executions: N8nExecution[],
    days: number
  ): Array<{ date: string; executions: number; success_rate: number }> {
    const trend = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayExecutions = executions.filter(exec => {
        const execDate = new Date(exec.started_at);
        execDate.setHours(0, 0, 0, 0);
        return execDate.getTime() === date.getTime();
      });

      const successful = dayExecutions.filter(
        exec => exec.status === "success"
      ).length;
      const successRate =
        dayExecutions.length > 0
          ? (successful / dayExecutions.length) * 100
          : 100;

      trend.push({
        date: date.toISOString().split("T")[0],
        executions: dayExecutions.length,
        success_rate: successRate,
      });
    }

    return trend;
  }

  private getBuiltInTemplates(): WorkflowTemplate[] {
    return [
      {
        id: "task-automation",
        name: "ClickUp Task Automation",
        description: "Automatisch taken verwerken en notificaties versturen",
        category: "automation",
        tags: ["clickup", "automation", "notifications"],
        workflow_data: {
          name: "ClickUp Task Automation",
          nodes: [
            {
              id: "webhook",
              name: "ClickUp Webhook",
              type: "n8n-nodes-base.webhook",
              position: [100, 100],
              parameters: {
                path: "clickup-task",
                httpMethod: "POST",
              },
            },
            {
              id: "condition",
              name: "Check Task Status",
              type: "n8n-nodes-base.if",
              position: [300, 100],
              parameters: {
                conditions: {
                  string: [
                    {
                      value1: "={{$json.event}}",
                      operation: "equal",
                      value2: "taskStatusUpdated",
                    },
                  ],
                },
              },
            },
          ],
          connections: {},
          settings: {
            saveDataErrorExecution: "all",
            saveDataSuccessExecution: "all",
            saveManualExecutions: false,
            callerPolicy: "workflowsFromSameOwner",
            timezone: "Europe/Amsterdam",
          },
        },
        trigger_templates: [
          {
            event_type: "task_updated",
            conditions: [
              {
                field: "status.status",
                operator: "equals",
                value: "complete",
              },
            ],
          },
        ],
        action_templates: [
          {
            type: "send_notification",
            parameters: {
              type: "slack",
              message: "Taak {{task.name}} is voltooid!",
            },
            order: 1,
          },
        ],
        variables: [
          {
            name: "slack_webhook_url",
            type: "string",
            description: "Slack webhook URL voor notificaties",
            required: true,
          },
          {
            name: "notification_channel",
            type: "string",
            description: "Slack kanaal voor notificaties",
            required: false,
            default_value: "#general",
          },
        ],
        use_count: 0,
        rating: 5,
        created_by: "system",
      },
      {
        id: "time-tracking-report",
        name: "Automatische Time Tracking Rapporten",
        description:
          "Wekelijkse time tracking rapporten genereren en versturen",
        category: "reporting",
        tags: ["clickup", "time-tracking", "reports"],
        workflow_data: {
          name: "Time Tracking Reports",
          nodes: [
            {
              id: "schedule",
              name: "Weekly Schedule",
              type: "n8n-nodes-base.cron",
              position: [100, 100],
              parameters: {
                expression: "0 9 * * 1",
              },
            },
          ],
          connections: {},
          settings: {
            saveDataErrorExecution: "all",
            saveDataSuccessExecution: "all",
            saveManualExecutions: false,
            callerPolicy: "workflowsFromSameOwner",
            timezone: "Europe/Amsterdam",
          },
        },
        trigger_templates: [],
        action_templates: [
          {
            type: "custom_webhook",
            parameters: {
              url: "/api/reports/time-tracking",
              method: "POST",
            },
            order: 1,
          },
        ],
        variables: [
          {
            name: "report_recipients",
            type: "array",
            description: "Email adressen voor rapport ontvangers",
            required: true,
          },
        ],
        use_count: 0,
        rating: 4.5,
        created_by: "system",
      },
    ];
  }

  // Utility methods for workflow management
  async duplicateWorkflow(
    workflowId: string,
    newName: string
  ): Promise<N8nWorkflow> {
    try {
      const originalWorkflow = await this.getWorkflow(workflowId);
      if (!originalWorkflow) {
        throw new Error("Workflow not found");
      }

      const duplicatedWorkflow = {
        ...originalWorkflow,
        id: undefined, // Let n8n assign new ID
        name: newName,
        active: false, // Start inactive
      };

      return await this.createWorkflow(duplicatedWorkflow);
    } catch (error) {
      console.error("Error duplicating workflow:", error);
      throw error;
    }
  }

  async exportWorkflow(workflowId: string): Promise<string> {
    try {
      const workflow = await this.getWorkflow(workflowId);
      if (!workflow) {
        throw new Error("Workflow not found");
      }

      return JSON.stringify(workflow, null, 2);
    } catch (error) {
      console.error("Error exporting workflow:", error);
      throw error;
    }
  }

  async importWorkflow(workflowJson: string): Promise<N8nWorkflow> {
    try {
      const workflowData = JSON.parse(workflowJson);
      workflowData.id = undefined; // Let n8n assign new ID
      workflowData.active = false; // Start inactive

      return await this.createWorkflow(workflowData);
    } catch (error) {
      console.error("Error importing workflow:", error);
      throw error;
    }
  }
}

export default N8nClickUpIntegrationService;
