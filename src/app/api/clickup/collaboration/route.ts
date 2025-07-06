import { NextRequest, NextResponse } from "next/server";
import { ClickUpService } from "@/lib/apis/clickup";

// Initialize ClickUp service
function createClickUpService() {
  const apiToken = process.env.CLICKUP_API_TOKEN;
  const teamId = process.env.CLICKUP_TEAM_ID;

  if (!apiToken) {
    throw new Error("ClickUp API token is required");
  }

  return new ClickUpService({
    apiToken,
    teamId,
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "spaces";
    const spaceId = searchParams.get("spaceId");
    const taskId = searchParams.get("taskId");

    console.log(`[ClickUp Collaboration API] Processing ${action} request`);

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
      case "spaces":
        const workspaces = await clickupService.getWorkspaces();
        const allSpaces = [];

        for (const workspace of workspaces) {
          const spaces = await clickupService.getSpaces(workspace.id);
          // Enhance spaces with member information
          for (const space of spaces) {
            // For now, use workspace members as space members
            // In a real implementation, you'd fetch space-specific members
            (space as any).members = workspace.members || [];
          }
          allSpaces.push(...spaces);
        }

        return NextResponse.json({
          data: allSpaces,
          status: "success",
          message: `Retrieved ${allSpaces.length} spaces`,
          lastUpdated: new Date().toISOString(),
          connected: true,
        });

      case "members":
        if (!spaceId) {
          return NextResponse.json(
            {
              data: null,
              status: "error",
              message: "Space ID is required for members",
              lastUpdated: new Date().toISOString(),
              connected: true,
            },
            { status: 400 }
          );
        }

        // Get workspace info to fetch members
        const workspacesForMembers = await clickupService.getWorkspaces();
        let spaceMembers: any[] = [];

        for (const workspace of workspacesForMembers) {
          const spaces = await clickupService.getSpaces(workspace.id);
          const targetSpace = spaces.find(s => s.id === spaceId);
          if (targetSpace) {
            spaceMembers = workspace.members || [];
            break;
          }
        }

        return NextResponse.json({
          data: spaceMembers,
          status: "success",
          message: `Retrieved ${spaceMembers.length} members`,
          lastUpdated: new Date().toISOString(),
          connected: true,
        });

      case "tasks":
        if (!spaceId) {
          return NextResponse.json(
            {
              data: null,
              status: "error",
              message: "Space ID is required for tasks",
              lastUpdated: new Date().toISOString(),
              connected: true,
            },
            { status: 400 }
          );
        }

        const lists = await clickupService.getLists(spaceId);
        const allTasks = [];

        for (const list of lists) {
          const tasks = await clickupService.getTasks(list.id, {
            include_closed: true,
            subtasks: true,
          });
          allTasks.push(...tasks);
        }

        return NextResponse.json({
          data: allTasks,
          status: "success",
          message: `Retrieved ${allTasks.length} tasks`,
          lastUpdated: new Date().toISOString(),
          connected: true,
        });

      case "comments":
        if (!taskId) {
          return NextResponse.json(
            {
              data: null,
              status: "error",
              message: "Task ID is required for comments",
              lastUpdated: new Date().toISOString(),
              connected: true,
            },
            { status: 400 }
          );
        }

        const comments = await clickupService.getTaskComments(taskId);

        return NextResponse.json({
          data: comments,
          status: "success",
          message: `Retrieved ${comments.length} comments`,
          lastUpdated: new Date().toISOString(),
          connected: true,
        });

      case "activity":
        if (!spaceId) {
          return NextResponse.json(
            {
              data: null,
              status: "error",
              message: "Space ID is required for activity",
              lastUpdated: new Date().toISOString(),
              connected: true,
            },
            { status: 400 }
          );
        }

        // Get recent activity by fetching tasks and their history
        const activityLists = await clickupService.getLists(spaceId);
        const activityData = [];

        for (const list of activityLists.slice(0, 3)) {
          // Limit to 3 lists for performance
          const tasks = await clickupService.getTasks(list.id, {
            include_closed: true,
            date_created_gt: Date.now() - 7 * 24 * 60 * 60 * 1000, // Last 7 days
          });

          for (const task of tasks.slice(0, 10)) {
            // Limit to 10 tasks per list
            // Create mock activity entries based on task data
            if (task.assignees.length > 0) {
              activityData.push({
                id: `activity_${task.id}_assignment`,
                type: "assignment",
                user: task.assignees[0],
                task: {
                  id: task.id,
                  name: task.name,
                  status: task.status,
                },
                timestamp: task.date_updated,
                details: `assigned to ${task.name}`,
              });
            }

            if (task.status.type === "closed" && task.date_done) {
              activityData.push({
                id: `activity_${task.id}_completion`,
                type: "status_change",
                user: task.assignees[0] || {
                  id: "system",
                  username: "System",
                  initials: "SY",
                  color: "#6b7280",
                },
                task: {
                  id: task.id,
                  name: task.name,
                  status: task.status,
                },
                timestamp: task.date_done,
                details: `completed ${task.name}`,
              });
            }
          }
        }

        // Sort by timestamp (most recent first)
        activityData.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        return NextResponse.json({
          data: activityData.slice(0, 50), // Limit to 50 most recent activities
          status: "success",
          message: `Retrieved ${activityData.length} activity items`,
          lastUpdated: new Date().toISOString(),
          connected: true,
        });

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
    console.error("[ClickUp Collaboration API] Error:", error);
    return NextResponse.json(
      {
        data: null,
        status: "error",
        message:
          error instanceof Error ? error.message : "Internal server error",
        lastUpdated: new Date().toISOString(),
        connected: false,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, taskId, comment } = body;

    console.log(
      `[ClickUp Collaboration API] Processing POST ${action} request`
    );

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
      case "post_comment":
        if (!taskId || !comment) {
          return NextResponse.json(
            {
              data: null,
              status: "error",
              message: "Task ID and comment are required",
              lastUpdated: new Date().toISOString(),
              connected: true,
            },
            { status: 400 }
          );
        }

        const newComment = await clickupService.createTaskComment(
          taskId,
          comment
        );

        return NextResponse.json({
          data: newComment,
          status: "success",
          message: "Comment posted successfully",
          lastUpdated: new Date().toISOString(),
          connected: true,
        });

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
    console.error("[ClickUp Collaboration API] POST Error:", error);
    return NextResponse.json(
      {
        data: null,
        status: "error",
        message:
          error instanceof Error ? error.message : "Internal server error",
        lastUpdated: new Date().toISOString(),
        connected: false,
      },
      { status: 500 }
    );
  }
}
