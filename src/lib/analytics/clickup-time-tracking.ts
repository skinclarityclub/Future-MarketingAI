import { ClickUpClient } from "../apis/clickup-client";

// Types voor time tracking
export interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  description?: string;
  start_time: Date;
  end_time?: Date;
  duration: number; // in milliseconds
  billable: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectProgress {
  project_id: string;
  project_name: string;
  total_estimated_time: number;
  total_tracked_time: number;
  completion_percentage: number;
  team_members: number;
  active_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  average_daily_hours: number;
  productivity_score: number;
  last_activity: Date;
}

export interface TeamProductivity {
  user_id: string;
  user_name: string;
  total_hours_today: number;
  total_hours_week: number;
  total_hours_month: number;
  productivity_score: number;
  tasks_completed_today: number;
  tasks_completed_week: number;
  average_task_time: number;
  billable_hours_percentage: number;
  last_activity: Date;
}

export interface TimeTrackingStats {
  total_tracked_time: number;
  billable_time: number;
  non_billable_time: number;
  active_timers: number;
  team_productivity_average: number;
  most_productive_hour: number;
  least_productive_hour: number;
  top_performer: string;
  projects_in_progress: number;
  overdue_projects: number;
}

export interface ActiveTimer {
  id: string;
  task_id: string;
  task_name: string;
  user_id: string;
  user_name: string;
  start_time: Date;
  current_duration: number;
  description?: string;
  project_name: string;
  billable: boolean;
}

export class ClickUpTimeTrackingService {
  private clickupClient: ClickUpClient;

  constructor(apiKey: string) {
    this.clickupClient = new ClickUpClient(apiKey);
  }

  // Time Entries Management
  async startTimeTracking(
    taskId: string,
    description?: string,
    billable: boolean = true
  ): Promise<TimeEntry> {
    try {
      const response = await this.clickupClient.request(
        `/task/${taskId}/time`,
        {
          method: "POST",
          body: JSON.stringify({
            description: description || "",
            billable: billable,
          }),
        }
      );

      return this.formatTimeEntry(response);
    } catch (error) {
      console.error("Error starting time tracking:", error);
      throw error;
    }
  }

  async stopTimeTracking(taskId: string, timerId: string): Promise<TimeEntry> {
    try {
      const response = await this.clickupClient.request(
        `/task/${taskId}/time/${timerId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            end: Date.now(),
          }),
        }
      );

      return this.formatTimeEntry(response);
    } catch (error) {
      console.error("Error stopping time tracking:", error);
      throw error;
    }
  }

  async getTimeEntries(
    taskId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<TimeEntry[]> {
    try {
      const params = new URLSearchParams();
      if (startDate)
        params.append("start_date", startDate.getTime().toString());
      if (endDate) params.append("end_date", endDate.getTime().toString());

      const response = await this.clickupClient.request(
        `/task/${taskId}/time?${params.toString()}`
      );

      return (
        response.data?.map((entry: any) => this.formatTimeEntry(entry)) || []
      );
    } catch (error) {
      console.error("Error fetching time entries:", error);
      return [];
    }
  }

  async updateTimeEntry(
    timerId: string,
    updates: Partial<TimeEntry>
  ): Promise<TimeEntry> {
    try {
      const response = await this.clickupClient.request(
        `/time_entries/${timerId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            description: updates.description,
            start: updates.start_time?.getTime(),
            end: updates.end_time?.getTime(),
            billable: updates.billable,
          }),
        }
      );

      return this.formatTimeEntry(response);
    } catch (error) {
      console.error("Error updating time entry:", error);
      throw error;
    }
  }

  async deleteTimeEntry(timerId: string): Promise<boolean> {
    try {
      await this.clickupClient.request(`/time_entries/${timerId}`, {
        method: "DELETE",
      });
      return true;
    } catch (error) {
      console.error("Error deleting time entry:", error);
      return false;
    }
  }

  // Project Progress Analysis
  async getProjectProgress(projectId: string): Promise<ProjectProgress> {
    try {
      // Get project details
      const project = await this.clickupClient.request(`/space/${projectId}`);

      // Get all tasks in project
      const tasks = await this.clickupClient.request(
        `/space/${projectId}/task`
      );

      // Get time tracking data
      const timeEntries = await this.getProjectTimeEntries(projectId);

      return this.calculateProjectProgress(
        project,
        tasks.tasks || [],
        timeEntries
      );
    } catch (error) {
      console.error("Error fetching project progress:", error);
      throw error;
    }
  }

  async getTeamProductivity(
    teamId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TeamProductivity[]> {
    try {
      const members = await this.clickupClient.request(
        `/team/${teamId}/member`
      );
      const productivity: TeamProductivity[] = [];

      for (const member of members.members || []) {
        const userTimeEntries = await this.getUserTimeEntries(
          member.user.id,
          startDate,
          endDate
        );
        const userTasks = await this.getUserTasks(
          member.user.id,
          startDate,
          endDate
        );

        productivity.push(
          this.calculateUserProductivity(
            member.user,
            userTimeEntries,
            userTasks
          )
        );
      }

      return productivity.sort(
        (a, b) => b.productivity_score - a.productivity_score
      );
    } catch (error) {
      console.error("Error fetching team productivity:", error);
      return [];
    }
  }

  async getTimeTrackingStats(teamId?: string): Promise<TimeTrackingStats> {
    try {
      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      // Get active timers
      const activeTimers = await this.getActiveTimers(teamId);

      // Get today's time entries
      const todayEntries = await this.getTimeEntriesForPeriod(
        startOfDay,
        now,
        teamId
      );

      // Calculate productivity by hour
      const hourlyProductivity = this.calculateHourlyProductivity(todayEntries);

      return {
        total_tracked_time: todayEntries.reduce(
          (sum, entry) => sum + entry.duration,
          0
        ),
        billable_time: todayEntries
          .filter(e => e.billable)
          .reduce((sum, entry) => sum + entry.duration, 0),
        non_billable_time: todayEntries
          .filter(e => !e.billable)
          .reduce((sum, entry) => sum + entry.duration, 0),
        active_timers: activeTimers.length,
        team_productivity_average:
          this.calculateAverageProductivity(todayEntries),
        most_productive_hour: hourlyProductivity.most_productive,
        least_productive_hour: hourlyProductivity.least_productive,
        top_performer: this.getTopPerformer(todayEntries),
        projects_in_progress: await this.getActiveProjectsCount(teamId),
        overdue_projects: await this.getOverdueProjectsCount(teamId),
      };
    } catch (error) {
      console.error("Error fetching time tracking stats:", error);
      throw error;
    }
  }

  async getActiveTimers(teamId?: string): Promise<ActiveTimer[]> {
    try {
      const response = await this.clickupClient.request(
        `/team/${teamId || ""}/time_entries/current`
      );

      return (
        response.data?.map((timer: any) => ({
          id: timer.id,
          task_id: timer.task.id,
          task_name: timer.task.name,
          user_id: timer.user.id,
          user_name: timer.user.username,
          start_time: new Date(parseInt(timer.start)),
          current_duration: Date.now() - parseInt(timer.start),
          description: timer.description,
          project_name: timer.task.space?.name || "Unknown Project",
          billable: timer.billable,
        })) || []
      );
    } catch (error) {
      console.error("Error fetching active timers:", error);
      return [];
    }
  }

  // Bulk Operations
  async bulkUpdateTimeEntries(
    entries: Array<{ id: string; updates: Partial<TimeEntry> }>
  ): Promise<TimeEntry[]> {
    const results: TimeEntry[] = [];

    for (const entry of entries) {
      try {
        const updated = await this.updateTimeEntry(entry.id, entry.updates);
        results.push(updated);
      } catch (error) {
        console.error(`Error updating time entry ${entry.id}:`, error);
      }
    }

    return results;
  }

  async generateTimeReport(
    projectId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    summary: ProjectProgress;
    team_productivity: TeamProductivity[];
    time_entries: TimeEntry[];
    daily_breakdown: Array<{
      date: string;
      hours: number;
      billable_hours: number;
    }>;
  }> {
    try {
      const [summary, teamProductivity, timeEntries] = await Promise.all([
        this.getProjectProgress(projectId),
        this.getTeamProductivity(projectId, startDate, endDate),
        this.getProjectTimeEntries(projectId, startDate, endDate),
      ]);

      const dailyBreakdown = this.calculateDailyBreakdown(
        timeEntries,
        startDate,
        endDate
      );

      return {
        summary,
        team_productivity: teamProductivity,
        time_entries: timeEntries,
        daily_breakdown: dailyBreakdown,
      };
    } catch (error) {
      console.error("Error generating time report:", error);
      throw error;
    }
  }

  // Helper Methods
  private formatTimeEntry(data: any): TimeEntry {
    return {
      id: data.id,
      task_id: data.task?.id || data.task_id,
      user_id: data.user?.id || data.user_id,
      description: data.description || "",
      start_time: new Date(parseInt(data.start)),
      end_time: data.end ? new Date(parseInt(data.end)) : undefined,
      duration: parseInt(data.duration || "0"),
      billable: data.billable || false,
      created_at: new Date(data.created_at || Date.now()),
      updated_at: new Date(data.updated_at || Date.now()),
    };
  }

  private calculateProjectProgress(
    project: any,
    tasks: any[],
    timeEntries: TimeEntry[]
  ): ProjectProgress {
    const totalEstimated = tasks.reduce(
      (sum, task) => sum + parseInt(task.time_estimate || "0"),
      0
    );
    const totalTracked = timeEntries.reduce(
      (sum, entry) => sum + entry.duration,
      0
    );
    const completedTasks = tasks.filter(
      task => task.status?.status === "complete"
    ).length;
    const overdueTasks = tasks.filter(task => {
      const dueDate = task.due_date ? new Date(parseInt(task.due_date)) : null;
      return (
        dueDate && dueDate < new Date() && task.status?.status !== "complete"
      );
    }).length;

    const teamMembers = new Set(timeEntries.map(entry => entry.user_id)).size;
    const averageDailyHours = this.calculateAverageDailyHours(timeEntries);
    const productivityScore = this.calculateProductivityScore(
      totalEstimated,
      totalTracked,
      completedTasks,
      tasks.length
    );

    return {
      project_id: project.id,
      project_name: project.name,
      total_estimated_time: totalEstimated,
      total_tracked_time: totalTracked,
      completion_percentage:
        totalEstimated > 0 ? (totalTracked / totalEstimated) * 100 : 0,
      team_members: teamMembers,
      active_tasks: tasks.length - completedTasks - overdueTasks,
      completed_tasks: completedTasks,
      overdue_tasks: overdueTasks,
      average_daily_hours: averageDailyHours,
      productivity_score: productivityScore,
      last_activity: new Date(
        Math.max(...timeEntries.map(e => e.updated_at.getTime()))
      ),
    };
  }

  private calculateUserProductivity(
    user: any,
    timeEntries: TimeEntry[],
    tasks: any[]
  ): TeamProductivity {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfWeek = new Date(
      now.getTime() - now.getDay() * 24 * 60 * 60 * 1000
    );
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayEntries = timeEntries.filter(e => e.start_time >= startOfDay);
    const weekEntries = timeEntries.filter(e => e.start_time >= startOfWeek);
    const monthEntries = timeEntries.filter(e => e.start_time >= startOfMonth);

    const todayHours = this.millisecondsToHours(
      todayEntries.reduce((sum, e) => sum + e.duration, 0)
    );
    const weekHours = this.millisecondsToHours(
      weekEntries.reduce((sum, e) => sum + e.duration, 0)
    );
    const monthHours = this.millisecondsToHours(
      monthEntries.reduce((sum, e) => sum + e.duration, 0)
    );

    const completedToday = tasks.filter(task => {
      const completedDate = task.date_closed
        ? new Date(parseInt(task.date_closed))
        : null;
      return completedDate && completedDate >= startOfDay;
    }).length;

    const completedWeek = tasks.filter(task => {
      const completedDate = task.date_closed
        ? new Date(parseInt(task.date_closed))
        : null;
      return completedDate && completedDate >= startOfWeek;
    }).length;

    const billableEntries = timeEntries.filter(e => e.billable);
    const billablePercentage =
      timeEntries.length > 0
        ? (billableEntries.length / timeEntries.length) * 100
        : 0;

    const averageTaskTime =
      tasks.length > 0
        ? timeEntries.reduce((sum, e) => sum + e.duration, 0) / tasks.length
        : 0;

    const productivityScore = this.calculateUserProductivityScore(
      todayHours,
      completedToday,
      averageTaskTime,
      billablePercentage
    );

    return {
      user_id: user.id,
      user_name: user.username || user.email,
      total_hours_today: todayHours,
      total_hours_week: weekHours,
      total_hours_month: monthHours,
      productivity_score: productivityScore,
      tasks_completed_today: completedToday,
      tasks_completed_week: completedWeek,
      average_task_time: this.millisecondsToHours(averageTaskTime),
      billable_hours_percentage: billablePercentage,
      last_activity: new Date(
        Math.max(...timeEntries.map(e => e.updated_at.getTime()))
      ),
    };
  }

  private async getProjectTimeEntries(
    projectId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<TimeEntry[]> {
    // Implementation would fetch all time entries for tasks in the project
    // This is a simplified version
    return [];
  }

  private async getUserTimeEntries(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TimeEntry[]> {
    // Implementation would fetch time entries for specific user
    return [];
  }

  private async getUserTasks(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    // Implementation would fetch tasks assigned to user
    return [];
  }

  private async getTimeEntriesForPeriod(
    startDate: Date,
    endDate: Date,
    teamId?: string
  ): Promise<TimeEntry[]> {
    // Implementation would fetch time entries for period
    return [];
  }

  private async getActiveProjectsCount(teamId?: string): Promise<number> {
    // Implementation would count active projects
    return 0;
  }

  private async getOverdueProjectsCount(teamId?: string): Promise<number> {
    // Implementation would count overdue projects
    return 0;
  }

  private calculateHourlyProductivity(entries: TimeEntry[]): {
    most_productive: number;
    least_productive: number;
  } {
    const hourlyStats = new Array(24).fill(0);

    entries.forEach(entry => {
      const hour = entry.start_time.getHours();
      hourlyStats[hour] += entry.duration;
    });

    const maxHour = hourlyStats.indexOf(Math.max(...hourlyStats));
    const minHour = hourlyStats.indexOf(
      Math.min(...hourlyStats.filter(h => h > 0))
    );

    return {
      most_productive: maxHour,
      least_productive: minHour >= 0 ? minHour : 0,
    };
  }

  private calculateAverageProductivity(entries: TimeEntry[]): number {
    if (entries.length === 0) return 0;

    const totalHours = this.millisecondsToHours(
      entries.reduce((sum, e) => sum + e.duration, 0)
    );
    const uniqueUsers = new Set(entries.map(e => e.user_id)).size;

    return uniqueUsers > 0 ? totalHours / uniqueUsers : 0;
  }

  private getTopPerformer(entries: TimeEntry[]): string {
    const userHours = new Map<string, number>();

    entries.forEach(entry => {
      const current = userHours.get(entry.user_id) || 0;
      userHours.set(entry.user_id, current + entry.duration);
    });

    if (userHours.size === 0) return "N/A";

    const topUser = Array.from(userHours.entries()).reduce((max, current) =>
      current[1] > max[1] ? current : max
    );

    return topUser[0];
  }

  private calculateAverageDailyHours(entries: TimeEntry[]): number {
    if (entries.length === 0) return 0;

    const dayGroups = new Map<string, number>();

    entries.forEach(entry => {
      const day = entry.start_time.toDateString();
      const current = dayGroups.get(day) || 0;
      dayGroups.set(day, current + entry.duration);
    });

    const totalHours = Array.from(dayGroups.values()).reduce(
      (sum, hours) => sum + hours,
      0
    );
    return this.millisecondsToHours(totalHours / dayGroups.size);
  }

  private calculateProductivityScore(
    estimated: number,
    tracked: number,
    completed: number,
    total: number
  ): number {
    if (total === 0) return 0;

    const timeEfficiency =
      estimated > 0 ? Math.min((estimated / tracked) * 100, 100) : 50;
    const completionRate = (completed / total) * 100;

    return timeEfficiency * 0.4 + completionRate * 0.6;
  }

  private calculateUserProductivityScore(
    hours: number,
    completed: number,
    avgTaskTime: number,
    billablePerc: number
  ): number {
    const hoursScore = Math.min(hours / 8, 1) * 25; // Max 25 points for 8+ hours
    const completionScore = Math.min(completed * 10, 25); // Max 25 points
    const efficiencyScore =
      avgTaskTime > 0 ? Math.min(25 / (avgTaskTime / 3600000), 25) : 0; // Max 25 points
    const billableScore = (billablePerc / 100) * 25; // Max 25 points

    return hoursScore + completionScore + efficiencyScore + billableScore;
  }

  private calculateDailyBreakdown(
    entries: TimeEntry[],
    startDate: Date,
    endDate: Date
  ): Array<{ date: string; hours: number; billable_hours: number }> {
    const dayMap = new Map<string, { hours: number; billable_hours: number }>();

    entries.forEach(entry => {
      const date = entry.start_time.toISOString().split("T")[0];
      const current = dayMap.get(date) || { hours: 0, billable_hours: 0 };
      const hours = this.millisecondsToHours(entry.duration);

      current.hours += hours;
      if (entry.billable) {
        current.billable_hours += hours;
      }

      dayMap.set(date, current);
    });

    const result: Array<{
      date: string;
      hours: number;
      billable_hours: number;
    }> = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const data = dayMap.get(dateStr) || { hours: 0, billable_hours: 0 };

      result.push({
        date: dateStr,
        hours: data.hours,
        billable_hours: data.billable_hours,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }

  private millisecondsToHours(milliseconds: number): number {
    return milliseconds / (1000 * 60 * 60);
  }
}

export default ClickUpTimeTrackingService;
