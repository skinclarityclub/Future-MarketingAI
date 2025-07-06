/**
 * ClickUp API Integration Service
 * Handles authentication and data fetching from ClickUp workspaces
 */

export interface ClickUpConfig {
  apiToken: string;
  teamId?: string;
  baseUrl?: string;
}

export interface ClickUpWorkspace {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  members: ClickUpUser[];
}

export interface ClickUpUser {
  id: string;
  username: string;
  email: string;
  color?: string;
  profilePicture?: string;
}

export interface ClickUpSpace {
  id: string;
  name: string;
  color?: string;
  private: boolean;
  statuses: ClickUpStatus[];
  multiple_assignees: boolean;
  features: any;
}

export interface ClickUpList {
  id: string;
  name: string;
  orderindex: number;
  status?: ClickUpStatus;
  priority?: ClickUpPriority;
  assignee?: ClickUpUser;
  task_count?: number;
  due_date?: string;
  start_date?: string;
  folder: {
    id: string;
    name: string;
    hidden: boolean;
    access: boolean;
  };
  space: {
    id: string;
    name: string;
    access: boolean;
  };
  archived: boolean;
}

export interface ClickUpTask {
  id: string;
  custom_id?: string;
  name: string;
  text_content?: string;
  description?: string;
  status: ClickUpStatus;
  orderindex: string;
  date_created: string;
  date_updated: string;
  date_closed?: string;
  date_done?: string;
  assignees: ClickUpUser[];
  watchers: ClickUpUser[];
  checklists: any[];
  tags: ClickUpTag[];
  parent?: string;
  priority?: ClickUpPriority;
  due_date?: string;
  start_date?: string;
  points?: number;
  time_estimate?: number;
  time_spent?: number;
  custom_fields: ClickUpCustomField[];
  dependencies: any[];
  linked_tasks: any[];
  team_id: string;
  url: string;
  permission_level: string;
  list: {
    id: string;
    name: string;
    access: boolean;
  };
  project: {
    id: string;
    name: string;
    hidden: boolean;
    access: boolean;
  };
  folder: {
    id: string;
    name: string;
    hidden: boolean;
    access: boolean;
  };
  space: {
    id: string;
  };
}

export interface ClickUpStatus {
  id?: string;
  status: string;
  color: string;
  orderindex: number;
  type: "open" | "closed" | "custom";
}

export interface ClickUpPriority {
  id?: string;
  priority: string;
  color: string;
  orderindex: number;
}

export interface ClickUpTag {
  name: string;
  tag_fg: string;
  tag_bg: string;
  creator?: number;
}

export interface ClickUpCustomField {
  id: string;
  name: string;
  type: string;
  type_config: any;
  date_created: string;
  hide_from_guests: boolean;
  value?: any;
  required: boolean;
}

export interface ClickUpComment {
  id: string;
  comment: any[];
  comment_text: string;
  user: ClickUpUser;
  date: string;
  parent?: string;
  reactions: any[];
}

export interface ClickUpTimeTracking {
  id: string;
  task: {
    id: string;
    name: string;
    status: ClickUpStatus;
  };
  wid: string;
  user: ClickUpUser;
  billable: boolean;
  start: string;
  end?: string;
  duration: string;
  description: string;
  tags: ClickUpTag[];
  source: string;
  at: string;
  task_location: {
    list_id: string;
    folder_id: string;
    space_id: string;
  };
}

export interface ClickUpWebhook {
  id: string;
  userid: string;
  team_id: string;
  endpoint: string;
  client_id: string;
  events: string[];
  task_id?: string;
  list_id?: string;
  folder_id?: string;
  space_id?: string;
  health: {
    status: string;
    fail_count: number;
  };
}

export interface ClickUpProjectAnalytics {
  project_id: string;
  project_name: string;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  average_time_to_complete: number;
  team_productivity_score: number;
  period: string;
  last_updated: string;
}

export class ClickUpService {
  private config: ClickUpConfig;
  private baseUrl: string;

  constructor(config: ClickUpConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || "https://api.clickup.com/api/v2";
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: this.config.apiToken,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `ClickUp API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  }

  /**
   * Get authorized user information
   */
  async getUser(): Promise<ClickUpUser> {
    const response = await this.makeRequest<{ user: ClickUpUser }>("/user");
    return response.user;
  }

  /**
   * Get authorized workspaces/teams
   */
  async getWorkspaces(): Promise<ClickUpWorkspace[]> {
    const response = await this.makeRequest<{ teams: ClickUpWorkspace[] }>(
      "/team"
    );
    return response.teams;
  }

  /**
   * Get spaces in a workspace
   */
  async getSpaces(teamId: string): Promise<ClickUpSpace[]> {
    const response = await this.makeRequest<{ spaces: ClickUpSpace[] }>(
      `/team/${teamId}/space?archived=false`
    );
    return response.spaces;
  }

  /**
   * Get lists in a space
   */
  async getLists(spaceId: string, archived = false): Promise<ClickUpList[]> {
    const response = await this.makeRequest<{ lists: ClickUpList[] }>(
      `/space/${spaceId}/list?archived=${archived}`
    );
    return response.lists;
  }

  /**
   * Get tasks from a list
   */
  async getTasks(
    listId: string,
    params: {
      archived?: boolean;
      page?: number;
      order_by?: string;
      reverse?: boolean;
      subtasks?: boolean;
      statuses?: string[];
      include_closed?: boolean;
      assignees?: string[];
      tags?: string[];
      due_date_gt?: number;
      due_date_lt?: number;
      date_created_gt?: number;
      date_created_lt?: number;
      date_updated_gt?: number;
      date_updated_lt?: number;
      custom_fields?: any[];
    } = {}
  ): Promise<ClickUpTask[]> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          searchParams.append(key, value.join(","));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/list/${listId}/task${queryString ? `?${queryString}` : ""}`;

    const response = await this.makeRequest<{ tasks: ClickUpTask[] }>(endpoint);
    return response.tasks;
  }

  /**
   * Get a specific task by ID
   */
  async getTask(
    taskId: string,
    params: {
      custom_task_ids?: boolean;
      team_id?: string;
      include_subtasks?: boolean;
    } = {}
  ): Promise<ClickUpTask> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/task/${taskId}${queryString ? `?${queryString}` : ""}`;

    return this.makeRequest<ClickUpTask>(endpoint);
  }

  /**
   * Create a new task
   */
  async createTask(
    listId: string,
    taskData: {
      name: string;
      description?: string;
      assignees?: string[];
      tags?: string[];
      status?: string;
      priority?: number;
      due_date?: number;
      due_date_time?: boolean;
      time_estimate?: number;
      start_date?: number;
      start_date_time?: boolean;
      notify_all?: boolean;
      parent?: string;
      links_to?: string;
      check_required_custom_fields?: boolean;
      custom_fields?: any[];
    }
  ): Promise<ClickUpTask> {
    return this.makeRequest<ClickUpTask>(`/list/${listId}/task`, {
      method: "POST",
      body: JSON.stringify(taskData),
    });
  }

  /**
   * Update a task
   */
  async updateTask(
    taskId: string,
    taskData: {
      name?: string;
      description?: string;
      status?: string;
      priority?: number;
      due_date?: number;
      due_date_time?: boolean;
      time_estimate?: number;
      start_date?: number;
      start_date_time?: boolean;
      assignees?: {
        add?: string[];
        rem?: string[];
      };
      archived?: boolean;
    },
    params: {
      custom_task_ids?: boolean;
      team_id?: string;
    } = {}
  ): Promise<ClickUpTask> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/task/${taskId}${queryString ? `?${queryString}` : ""}`;

    return this.makeRequest<ClickUpTask>(endpoint, {
      method: "PUT",
      body: JSON.stringify(taskData),
    });
  }

  /**
   * Delete a task
   */
  async deleteTask(
    taskId: string,
    params: {
      custom_task_ids?: boolean;
      team_id?: string;
    } = {}
  ): Promise<void> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/task/${taskId}${queryString ? `?${queryString}` : ""}`;

    await this.makeRequest<void>(endpoint, {
      method: "DELETE",
    });
  }

  /**
   * Get task comments
   */
  async getTaskComments(taskId: string): Promise<ClickUpComment[]> {
    const response = await this.makeRequest<{ comments: ClickUpComment[] }>(
      `/task/${taskId}/comment`
    );
    return response.comments;
  }

  /**
   * Create a task comment
   */
  async createTaskComment(
    taskId: string,
    comment: string
  ): Promise<ClickUpComment> {
    return this.makeRequest<ClickUpComment>(`/task/${taskId}/comment`, {
      method: "POST",
      body: JSON.stringify({
        comment_text: comment,
        notify_all: false,
      }),
    });
  }

  /**
   * Get time tracking entries
   */
  async getTimeTracking(
    teamId: string,
    params: {
      start_date?: number;
      end_date?: number;
      assignee?: string;
      include_task_tags?: boolean;
      include_location_names?: boolean;
      space_id?: string;
      folder_id?: string;
      list_id?: string;
      task_id?: string;
    } = {}
  ): Promise<ClickUpTimeTracking[]> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/team/${teamId}/time_entries${queryString ? `?${queryString}` : ""}`;

    const response = await this.makeRequest<{ data: ClickUpTimeTracking[] }>(
      endpoint
    );
    return response.data;
  }

  /**
   * Create a webhook
   */
  async createWebhook(webhookData: {
    endpoint: string;
    events: string[];
    task_id?: string;
    list_id?: string;
    folder_id?: string;
    space_id?: string;
  }): Promise<ClickUpWebhook> {
    const teamId = this.config.teamId;
    if (!teamId) {
      throw new Error("Team ID is required for webhook creation");
    }

    return this.makeRequest<ClickUpWebhook>(`/team/${teamId}/webhook`, {
      method: "POST",
      body: JSON.stringify(webhookData),
    });
  }

  /**
   * Get webhooks
   */
  async getWebhooks(): Promise<ClickUpWebhook[]> {
    const teamId = this.config.teamId;
    if (!teamId) {
      throw new Error("Team ID is required for webhook retrieval");
    }

    const response = await this.makeRequest<{ webhooks: ClickUpWebhook[] }>(
      `/team/${teamId}/webhook`
    );
    return response.webhooks;
  }

  /**
   * Calculate project analytics
   */
  async getProjectAnalytics(
    spaceId: string,
    dateRange: {
      startDate: string;
      endDate: string;
    }
  ): Promise<ClickUpProjectAnalytics> {
    const lists = await this.getLists(spaceId);
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let overdueTasks = 0;
    const now = Date.now();

    const startTimestamp = new Date(dateRange.startDate).getTime();
    const endTimestamp = new Date(dateRange.endDate).getTime();

    for (const list of lists) {
      const tasks = await this.getTasks(list.id, {
        date_created_gt: startTimestamp,
        date_created_lt: endTimestamp,
        include_closed: true,
      });

      totalTasks += tasks.length;

      tasks.forEach(task => {
        if (task.status.type === "closed") {
          completedTasks++;
        } else if (task.status.type === "open") {
          inProgressTasks++;
        }

        if (
          task.due_date &&
          parseInt(task.due_date) < now &&
          task.status.type !== "closed"
        ) {
          overdueTasks++;
        }
      });
    }

    const completionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const teamProductivityScore = Math.max(
      0,
      100 - (overdueTasks / Math.max(totalTasks, 1)) * 100
    );

    return {
      project_id: spaceId,
      project_name: `Space ${spaceId}`,
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      in_progress_tasks: inProgressTasks,
      overdue_tasks: overdueTasks,
      completion_rate: completionRate,
      average_time_to_complete: 0, // Would need historical data to calculate
      team_productivity_score: teamProductivityScore,
      period: `${dateRange.startDate} - ${dateRange.endDate}`,
      last_updated: new Date().toISOString(),
    };
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getUser();
      return true;
    } catch (error) {
      console.error("ClickUp connection test failed:", error);
      return false;
    }
  }
}

/**
 * Create ClickUp service instance with environment configuration
 */
export function createClickUpService(): ClickUpService {
  const apiToken = process.env.CLICKUP_API_TOKEN;
  const teamId = process.env.CLICKUP_TEAM_ID;

  if (!apiToken) {
    throw new Error("CLICKUP_API_TOKEN environment variable is required");
  }

  return new ClickUpService({
    apiToken,
    teamId,
  });
}

/**
 * Create ClickUp service instance with custom configuration
 */
export function createClickUpServiceWithConfig(
  config: ClickUpConfig
): ClickUpService {
  return new ClickUpService(config);
}
