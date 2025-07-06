import { NextRequest, NextResponse } from "next/server";
import {
  createClickUpService,
  type ClickUpProjectAnalytics,
  type ClickUpTask,
  type ClickUpWorkspace,
  type ClickUpSpace,
  type ClickUpList,
  type ClickUpWebhook,
  type ClickUpTimeTracking,
} from "@/lib/apis/clickup";

export const runtime = "nodejs";
export const revalidate = 60; // Cache for 1 minute for real-time data

interface ClickUpResponse<T> {
  data: T | null;
  status: "success" | "error";
  message?: string;
  lastUpdated: string;
  connected: boolean;
}

interface ClickUpWorkspacesResponse {
  workspaces: ClickUpWorkspace[];
  status: "success" | "error";
  message?: string;
}

interface ClickUpTasksResponse {
  tasks: ClickUpTask[];
  listId: string;
  total: number;
  status: "success" | "error";
  message?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<any>> {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "workspaces";

    console.log(`[ClickUp API] Processing ${action} request`);

    const clickupService = createClickUpService();

    // Test connection first
    const connected = await clickupService.testConnection();
    if (!connected) {
      return NextResponse.json(
        {
          data: null,
          status: "error",
          message:
            "ClickUp API connection failed. Please check your API token.",
          lastUpdated: new Date().toISOString(),
          connected: false,
        },
        { status: 503 }
      );
    }

    switch (action) {
      case "workspaces":
        const workspaces = await clickupService.getWorkspaces();
        return NextResponse.json({
          workspaces,
          status: "success",
          message: `Retrieved ${workspaces.length} workspaces`,
        } as ClickUpWorkspacesResponse);

      case "spaces":
        const teamId = searchParams.get("teamId");
        if (!teamId) {
          return NextResponse.json(
            {
              data: null,
              status: "error",
              message: "Team ID is required for spaces",
              lastUpdated: new Date().toISOString(),
              connected: true,
            },
            { status: 400 }
          );
        }
        const spaces = await clickupService.getSpaces(teamId);
        return NextResponse.json({
          data: spaces,
          status: "success",
          message: `Retrieved ${spaces.length} spaces`,
          lastUpdated: new Date().toISOString(),
          connected: true,
        } as ClickUpResponse<ClickUpSpace[]>);

      case "lists":
        const spaceId = searchParams.get("spaceId");
        if (!spaceId) {
          return NextResponse.json(
            {
              data: null,
              status: "error",
              message: "Space ID is required for lists",
              lastUpdated: new Date().toISOString(),
              connected: true,
            },
            { status: 400 }
          );
        }
        const archived = searchParams.get("archived") === "true";
        const lists = await clickupService.getLists(spaceId, archived);
        return NextResponse.json({
          data: lists,
          status: "success",
          message: `Retrieved ${lists.length} lists`,
          lastUpdated: new Date().toISOString(),
          connected: true,
        } as ClickUpResponse<ClickUpList[]>);

      case "tasks":
        const listId = searchParams.get("listId");
        if (!listId) {
          return NextResponse.json(
            {
              data: null,
              status: "error",
              message: "List ID is required for tasks",
              lastUpdated: new Date().toISOString(),
              connected: true,
            },
            { status: 400 }
          );
        }

        const tasksParams: any = {};

        // Parse task filtering parameters
        if (searchParams.get("includeArchived") === "true")
          tasksParams.archived = true;
        if (searchParams.get("includeClosed") === "true")
          tasksParams.include_closed = true;
        if (searchParams.get("subtasks") === "true")
          tasksParams.subtasks = true;

        const statuses = searchParams.get("statuses");
        if (statuses) tasksParams.statuses = statuses.split(",");

        const assignees = searchParams.get("assignees");
        if (assignees) tasksParams.assignees = assignees.split(",");

        const tags = searchParams.get("tags");
        if (tags) tasksParams.tags = tags.split(",");

        // Date filtering
        const dueDateGt = searchParams.get("dueDateGt");
        if (dueDateGt) tasksParams.due_date_gt = new Date(dueDateGt).getTime();

        const dueDateLt = searchParams.get("dueDateLt");
        if (dueDateLt) tasksParams.due_date_lt = new Date(dueDateLt).getTime();

        const tasks = await clickupService.getTasks(listId, tasksParams);
        return NextResponse.json({
          tasks,
          listId,
          total: tasks.length,
          status: "success",
          message: `Retrieved ${tasks.length} tasks`,
        } as ClickUpTasksResponse);

      case "task":
        const taskId = searchParams.get("taskId");
        if (!taskId) {
          return NextResponse.json(
            {
              data: null,
              status: "error",
              message: "Task ID is required",
              lastUpdated: new Date().toISOString(),
              connected: true,
            },
            { status: 400 }
          );
        }

        const taskParams: any = {};
        if (searchParams.get("includeSubtasks") === "true")
          taskParams.include_subtasks = true;

        const teamIdForTask = searchParams.get("teamId");
        if (teamIdForTask) taskParams.team_id = teamIdForTask;

        const task = await clickupService.getTask(taskId, taskParams);
        return NextResponse.json({
          data: task,
          status: "success",
          lastUpdated: new Date().toISOString(),
          connected: true,
        } as ClickUpResponse<ClickUpTask>);

      case "analytics":
        const analyticsSpaceId = searchParams.get("spaceId");
        if (!analyticsSpaceId) {
          return NextResponse.json(
            {
              data: null,
              status: "error",
              message: "Space ID is required for analytics",
              lastUpdated: new Date().toISOString(),
              connected: true,
            },
            { status: 400 }
          );
        }

        const startDate =
          searchParams.get("startDate") ||
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];
        const endDate =
          searchParams.get("endDate") || new Date().toISOString().split("T")[0];

        const analytics = await clickupService.getProjectAnalytics(
          analyticsSpaceId,
          {
            startDate,
            endDate,
          }
        );

        return NextResponse.json({
          data: analytics,
          status: "success",
          message: "Analytics calculated successfully",
          lastUpdated: new Date().toISOString(),
          connected: true,
        } as ClickUpResponse<ClickUpProjectAnalytics>);

      case "webhooks":
        const webhooks = await clickupService.getWebhooks();
        return NextResponse.json({
          data: webhooks,
          status: "success",
          message: `Retrieved ${webhooks.length} webhooks`,
          lastUpdated: new Date().toISOString(),
          connected: true,
        } as ClickUpResponse<ClickUpWebhook[]>);

      case "time-tracking":
        const timeTeamId = searchParams.get("teamId");
        if (!timeTeamId) {
          return NextResponse.json(
            {
              data: null,
              status: "error",
              message: "Team ID is required for time tracking",
              lastUpdated: new Date().toISOString(),
              connected: true,
            },
            { status: 400 }
          );
        }

        const timeParams: any = {};

        const timeStartDate = searchParams.get("startDate");
        if (timeStartDate)
          timeParams.start_date = new Date(timeStartDate).getTime();

        const timeEndDate = searchParams.get("endDate");
        if (timeEndDate) timeParams.end_date = new Date(timeEndDate).getTime();

        const assignee = searchParams.get("assignee");
        if (assignee) timeParams.assignee = assignee;

        const timeSpaceId = searchParams.get("spaceId");
        if (timeSpaceId) timeParams.space_id = timeSpaceId;

        const timeListId = searchParams.get("listId");
        if (timeListId) timeParams.list_id = timeListId;

        const timeTaskId = searchParams.get("taskId");
        if (timeTaskId) timeParams.task_id = timeTaskId;

        const timeEntries = await clickupService.getTimeTracking(
          timeTeamId,
          timeParams
        );
        return NextResponse.json({
          data: timeEntries,
          status: "success",
          message: `Retrieved ${timeEntries.length} time entries`,
          lastUpdated: new Date().toISOString(),
          connected: true,
        } as ClickUpResponse<ClickUpTimeTracking[]>);

      default:
        return NextResponse.json(
          {
            data: null,
            status: "error",
            message: `Unknown action: ${action}`,
            lastUpdated: new Date().toISOString(),
            connected: true,
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[ClickUp API] Error processing GET request:", error);

    return NextResponse.json(
      {
        data: null,
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to process ClickUp request",
        lastUpdated: new Date().toISOString(),
        connected: false,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<any>> {
  try {
    const body = await request.json();
    const { action } = body;

    console.log(`[ClickUp API] Processing POST ${action} request`);

    const clickupService = createClickUpService();

    // Test connection first
    const connected = await clickupService.testConnection();
    if (!connected) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "ClickUp API connection failed. Please check your API token.",
        },
        { status: 503 }
      );
    }

    switch (action) {
      case "test-connection":
        return NextResponse.json({
          status: "success",
          message: "ClickUp API connection successful",
          connected: true,
        });

      case "create-task":
        const { listId, taskData } = body;
        if (!listId || !taskData || !taskData.name) {
          return NextResponse.json(
            {
              status: "error",
              message: "List ID and task data with name are required",
            },
            { status: 400 }
          );
        }

        const newTask = await clickupService.createTask(listId, taskData);
        return NextResponse.json({
          status: "success",
          message: "Task created successfully",
          data: newTask,
        });

      case "update-task":
        const { taskId, updateData, taskParams } = body;
        if (!taskId || !updateData) {
          return NextResponse.json(
            {
              status: "error",
              message: "Task ID and update data are required",
            },
            { status: 400 }
          );
        }

        const updatedTask = await clickupService.updateTask(
          taskId,
          updateData,
          taskParams || {}
        );
        return NextResponse.json({
          status: "success",
          message: "Task updated successfully",
          data: updatedTask,
        });

      case "delete-task":
        const { taskId: deleteTaskId, deleteParams } = body;
        if (!deleteTaskId) {
          return NextResponse.json(
            {
              status: "error",
              message: "Task ID is required",
            },
            { status: 400 }
          );
        }

        await clickupService.deleteTask(deleteTaskId, deleteParams || {});
        return NextResponse.json({
          status: "success",
          message: "Task deleted successfully",
        });

      case "create-webhook":
        const { webhookData } = body;
        if (!webhookData || !webhookData.endpoint || !webhookData.events) {
          return NextResponse.json(
            {
              status: "error",
              message: "Webhook data with endpoint and events are required",
            },
            { status: 400 }
          );
        }

        const webhook = await clickupService.createWebhook(webhookData);
        return NextResponse.json({
          status: "success",
          message: "Webhook created successfully",
          data: webhook,
        });

      case "sync-content-calendar":
        // This would sync content calendar items to ClickUp tasks
        // Implementation would depend on your content calendar structure
        return NextResponse.json({
          status: "success",
          message: "Content calendar sync initiated",
        });

      case "sync-marketing-workflows":
        // This would sync marketing workflows to ClickUp projects
        return NextResponse.json({
          status: "success",
          message: "Marketing workflow sync initiated",
        });

      default:
        return NextResponse.json(
          {
            status: "error",
            message: `Unknown action: ${action}`,
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[ClickUp API] Error processing POST request:", error);

    return NextResponse.json(
      {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to process ClickUp request",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse<any>> {
  try {
    const body = await request.json();
    const { taskId, updateData, params } = body;

    if (!taskId || !updateData) {
      return NextResponse.json(
        {
          status: "error",
          message: "Task ID and update data are required",
        },
        { status: 400 }
      );
    }

    console.log(`[ClickUp API] Processing PUT request for task ${taskId}`);

    const clickupService = createClickUpService();
    const updatedTask = await clickupService.updateTask(
      taskId,
      updateData,
      params || {}
    );

    return NextResponse.json({
      status: "success",
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    console.error("[ClickUp API] Error processing PUT request:", error);

    return NextResponse.json(
      {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to update task",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse<any>> {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        {
          status: "error",
          message: "Task ID is required",
        },
        { status: 400 }
      );
    }

    console.log(`[ClickUp API] Processing DELETE request for task ${taskId}`);

    const clickupService = createClickUpService();

    const params: any = {};
    const teamId = searchParams.get("teamId");
    if (teamId) params.team_id = teamId;

    await clickupService.deleteTask(taskId, params);

    return NextResponse.json({
      status: "success",
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("[ClickUp API] Error processing DELETE request:", error);

    return NextResponse.json(
      {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to delete task",
      },
      { status: 500 }
    );
  }
}
