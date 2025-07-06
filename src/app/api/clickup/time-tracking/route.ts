import { NextRequest, NextResponse } from "next/server";
import { ClickUpTimeTrackingService } from "@/lib/analytics/clickup-time-tracking";

// Mock ClickUp API key - replace with actual implementation
const CLICKUP_API_KEY = process.env.CLICKUP_API_KEY || "mock_api_key";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const timeTrackingService = new ClickUpTimeTrackingService(CLICKUP_API_KEY);

    switch (action) {
      case "time_entries": {
        const taskId = searchParams.get("task_id");
        const startDate = searchParams.get("start_date");
        const endDate = searchParams.get("end_date");

        if (!taskId) {
          return NextResponse.json(
            { error: "task_id is required" },
            { status: 400 }
          );
        }

        const entries = await timeTrackingService.getTimeEntries(
          taskId,
          startDate ? new Date(startDate) : undefined,
          endDate ? new Date(endDate) : undefined
        );

        return NextResponse.json({
          success: true,
          data: entries,
          count: entries.length,
        });
      }

      case "project_progress": {
        const projectId = searchParams.get("project_id");
        if (!projectId) {
          return NextResponse.json(
            { error: "project_id is required" },
            { status: 400 }
          );
        }

        const progress =
          await timeTrackingService.getProjectProgress(projectId);
        return NextResponse.json({
          success: true,
          data: progress,
        });
      }

      case "team_productivity": {
        const teamId = searchParams.get("team_id");
        const startDate = searchParams.get("start_date");
        const endDate = searchParams.get("end_date");

        if (!teamId || !startDate || !endDate) {
          return NextResponse.json(
            {
              error: "team_id, start_date, and end_date are required",
            },
            { status: 400 }
          );
        }

        const productivity = await timeTrackingService.getTeamProductivity(
          teamId,
          new Date(startDate),
          new Date(endDate)
        );

        return NextResponse.json({
          success: true,
          data: productivity,
          count: productivity.length,
        });
      }

      case "time_stats": {
        const teamId = searchParams.get("team_id");
        const stats = await timeTrackingService.getTimeTrackingStats(
          teamId || undefined
        );

        return NextResponse.json({
          success: true,
          data: stats,
        });
      }

      case "active_timers": {
        const teamId = searchParams.get("team_id");
        const timers = await timeTrackingService.getActiveTimers(
          teamId || undefined
        );

        return NextResponse.json({
          success: true,
          data: timers,
          count: timers.length,
        });
      }

      case "time_report": {
        const projectId = searchParams.get("project_id");
        const startDate = searchParams.get("start_date");
        const endDate = searchParams.get("end_date");

        if (!projectId || !startDate || !endDate) {
          return NextResponse.json(
            {
              error: "project_id, start_date, and end_date are required",
            },
            { status: 400 }
          );
        }

        const report = await timeTrackingService.generateTimeReport(
          projectId,
          new Date(startDate),
          new Date(endDate)
        );

        return NextResponse.json({
          success: true,
          data: report,
        });
      }

      case "mock_data": {
        // Return comprehensive mock data for development/demo
        const mockStats = {
          total_tracked_time: 28800000, // 8 hours in ms
          billable_time: 25200000, // 7 hours in ms
          non_billable_time: 3600000, // 1 hour in ms
          active_timers: 3,
          team_productivity_average: 78.5,
          most_productive_hour: 10,
          least_productive_hour: 15,
          top_performer: "user_001",
          projects_in_progress: 5,
          overdue_projects: 2,
        };

        const mockProgress = {
          project_id: "proj_001",
          project_name: "ClickUp Integration",
          total_estimated_time: 144000000, // 40 hours
          total_tracked_time: 100800000, // 28 hours
          completion_percentage: 70.0,
          team_members: 4,
          active_tasks: 12,
          completed_tasks: 8,
          overdue_tasks: 2,
          average_daily_hours: 6.5,
          productivity_score: 82.5,
          last_activity: new Date(),
        };

        const mockProductivity = [
          {
            user_id: "user_001",
            user_name: "John Doe",
            total_hours_today: 7.5,
            total_hours_week: 38.0,
            total_hours_month: 152.0,
            productivity_score: 85.2,
            tasks_completed_today: 4,
            tasks_completed_week: 18,
            average_task_time: 2.1,
            billable_hours_percentage: 87.5,
            last_activity: new Date(),
          },
          {
            user_id: "user_002",
            user_name: "Jane Smith",
            total_hours_today: 6.8,
            total_hours_week: 35.5,
            total_hours_month: 145.0,
            productivity_score: 78.9,
            tasks_completed_today: 3,
            tasks_completed_week: 15,
            average_task_time: 2.3,
            billable_hours_percentage: 82.1,
            last_activity: new Date(),
          },
          {
            user_id: "user_003",
            user_name: "Mike Johnson",
            total_hours_today: 8.2,
            total_hours_week: 41.0,
            total_hours_month: 158.0,
            productivity_score: 91.3,
            tasks_completed_today: 5,
            tasks_completed_week: 22,
            average_task_time: 1.8,
            billable_hours_percentage: 93.2,
            last_activity: new Date(),
          },
        ];

        const mockActiveTimers = [
          {
            id: "timer_001",
            task_id: "task_123",
            task_name: "Implement time tracking dashboard",
            user_id: "user_001",
            user_name: "John Doe",
            start_time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            current_duration: 2 * 60 * 60 * 1000, // 2 hours
            description: "Working on React components",
            project_name: "ClickUp Integration",
            billable: true,
          },
          {
            id: "timer_002",
            task_id: "task_124",
            task_name: "API testing and debugging",
            user_id: "user_002",
            user_name: "Jane Smith",
            start_time: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
            current_duration: 45 * 60 * 1000, // 45 minutes
            description: "Testing ClickUp API endpoints",
            project_name: "ClickUp Integration",
            billable: true,
          },
        ];

        return NextResponse.json({
          success: true,
          data: {
            stats: mockStats,
            progress: mockProgress,
            productivity: mockProductivity,
            active_timers: mockActiveTimers,
          },
        });
      }

      default:
        return NextResponse.json(
          {
            error:
              "Invalid action. Supported actions: time_entries, project_progress, team_productivity, time_stats, active_timers, time_report, mock_data",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Time tracking API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const body = await request.json();
    const timeTrackingService = new ClickUpTimeTrackingService(CLICKUP_API_KEY);

    switch (action) {
      case "start_timer": {
        const { task_id, description, billable = true } = body;

        if (!task_id) {
          return NextResponse.json(
            { error: "task_id is required" },
            { status: 400 }
          );
        }

        const timeEntry = await timeTrackingService.startTimeTracking(
          task_id,
          description,
          billable
        );

        return NextResponse.json({
          success: true,
          data: timeEntry,
          message: "Time tracking started successfully",
        });
      }

      case "bulk_update_entries": {
        const { entries } = body;

        if (!entries || !Array.isArray(entries)) {
          return NextResponse.json(
            { error: "entries array is required" },
            { status: 400 }
          );
        }

        const results =
          await timeTrackingService.bulkUpdateTimeEntries(entries);

        return NextResponse.json({
          success: true,
          data: results,
          count: results.length,
          message: "Bulk update completed",
        });
      }

      case "generate_report": {
        const {
          project_id,
          start_date,
          end_date,
          report_type = "custom",
        } = body;

        if (!project_id || !start_date || !end_date) {
          return NextResponse.json(
            {
              error: "project_id, start_date, and end_date are required",
            },
            { status: 400 }
          );
        }

        const report = await timeTrackingService.generateTimeReport(
          project_id,
          new Date(start_date),
          new Date(end_date)
        );

        return NextResponse.json({
          success: true,
          data: report,
          report_type,
          generated_at: new Date().toISOString(),
          message: "Time report generated successfully",
        });
      }

      case "mock_start_timer": {
        // Mock timer start for demo purposes
        const { task_id, description, billable = true } = body;

        const mockTimer = {
          id: `timer_${Date.now()}`,
          task_id: task_id || "task_demo",
          task_name: "Demo Task",
          user_id: "user_demo",
          user_name: "Demo User",
          start_time: new Date(),
          current_duration: 0,
          description: description || "Demo timer",
          project_name: "Demo Project",
          billable: billable,
        };

        return NextResponse.json({
          success: true,
          data: mockTimer,
          message: "Demo timer started successfully",
        });
      }

      default:
        return NextResponse.json(
          {
            error:
              "Invalid action. Supported actions: start_timer, bulk_update_entries, generate_report, mock_start_timer",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Time tracking POST API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const body = await request.json();
    const timeTrackingService = new ClickUpTimeTrackingService(CLICKUP_API_KEY);

    switch (action) {
      case "stop_timer": {
        const { task_id, timer_id } = body;

        if (!task_id || !timer_id) {
          return NextResponse.json(
            { error: "task_id and timer_id are required" },
            { status: 400 }
          );
        }

        const timeEntry = await timeTrackingService.stopTimeTracking(
          task_id,
          timer_id
        );

        return NextResponse.json({
          success: true,
          data: timeEntry,
          message: "Time tracking stopped successfully",
        });
      }

      case "update_entry": {
        const { timer_id, updates } = body;

        if (!timer_id || !updates) {
          return NextResponse.json(
            { error: "timer_id and updates are required" },
            { status: 400 }
          );
        }

        const timeEntry = await timeTrackingService.updateTimeEntry(
          timer_id,
          updates
        );

        return NextResponse.json({
          success: true,
          data: timeEntry,
          message: "Time entry updated successfully",
        });
      }

      case "mock_stop_timer": {
        // Mock timer stop for demo purposes
        const { timer_id } = body;

        const mockEntry = {
          id: timer_id || `entry_${Date.now()}`,
          task_id: "task_demo",
          user_id: "user_demo",
          description: "Demo work completed",
          start_time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          end_time: new Date(),
          duration: 2 * 60 * 60 * 1000, // 2 hours in ms
          billable: true,
          created_at: new Date(),
          updated_at: new Date(),
        };

        return NextResponse.json({
          success: true,
          data: mockEntry,
          message: "Demo timer stopped successfully",
        });
      }

      default:
        return NextResponse.json(
          {
            error:
              "Invalid action. Supported actions: stop_timer, update_entry, mock_stop_timer",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Time tracking PUT API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const timeTrackingService = new ClickUpTimeTrackingService(CLICKUP_API_KEY);

    switch (action) {
      case "delete_entry": {
        const timerId = searchParams.get("timer_id");

        if (!timerId) {
          return NextResponse.json(
            { error: "timer_id is required" },
            { status: 400 }
          );
        }

        const success = await timeTrackingService.deleteTimeEntry(timerId);

        return NextResponse.json({
          success,
          message: success
            ? "Time entry deleted successfully"
            : "Failed to delete time entry",
        });
      }

      case "mock_delete_entry": {
        // Mock deletion for demo purposes
        return NextResponse.json({
          success: true,
          message: "Demo time entry deleted successfully",
        });
      }

      default:
        return NextResponse.json(
          {
            error:
              "Invalid action. Supported actions: delete_entry, mock_delete_entry",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Time tracking DELETE API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
