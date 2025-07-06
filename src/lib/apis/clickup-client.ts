interface ClickUpConfig {
  apiKey: string;
  teamId: string;
  baseUrl?: string;
}

interface ClickUpSpace {
  id: string;
  name: string;
  private: boolean;
  statuses: Array<{
    id: string;
    status: string;
    color: string;
    type: string;
  }>;
}

interface ClickUpList {
  id: string;
  name: string;
  orderindex: number;
  status: {
    status: string;
    color: string;
  };
  priority: {
    priority: string;
    color: string;
  };
  assignee: {
    id: string;
    username: string;
    email: string;
  };
  task_count: string;
  due_date: string;
  start_date: string;
  folder: {
    id: string;
    name: string;
    hidden: boolean;
    access: boolean;
  };
  space: {
    id: string;
    name: string;
  };
  archived: boolean;
  permission_level: string;
}

interface ClickUpTask {
  id: string;
  custom_id: string;
  name: string;
  text_content: string;
  description: string;
  status: {
    status: string;
    color: string;
    id: string;
    type: string;
  };
  orderindex: string;
  date_created: string;
  date_updated: string;
  date_closed: string;
  creator: {
    id: number;
    username: string;
    color: string;
    email: string;
    profilePicture: string;
  };
  assignees: Array<{
    id: number;
    username: string;
    color: string;
    email: string;
    profilePicture: string;
  }>;
  watchers: Array<{
    id: number;
    username: string;
    color: string;
    email: string;
    profilePicture: string;
  }>;
  checklists: any[];
  tags: Array<{
    name: string;
    tag_fg: string;
    tag_bg: string;
  }>;
  parent: string;
  priority: {
    id: string;
    priority: string;
    color: string;
    orderindex: string;
  };
  due_date: string;
  start_date: string;
  points: number;
  time_estimate: number;
  custom_fields: Array<{
    id: string;
    name: string;
    type: string;
    value: any;
  }>;
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

export class ClickUpClient {
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
    const headers = {
      Authorization: this.config.apiKey,
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(
        `ClickUp API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  async getSpaces(): Promise<ClickUpSpace[]> {
    const data = await this.makeRequest<{ spaces: ClickUpSpace[] }>(
      `/team/${this.config.teamId}/space`
    );
    return data.spaces;
  }

  async getLists(spaceId: string): Promise<ClickUpList[]> {
    const data = await this.makeRequest<{ lists: ClickUpList[] }>(
      `/space/${spaceId}/list`
    );
    return data.lists;
  }

  async getTasks(
    listId: string,
    options: {
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
    } = {}
  ): Promise<ClickUpTask[]> {
    const params = new URLSearchParams();

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          params.append(key, value.join(","));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const queryString = params.toString();
    const endpoint = `/list/${listId}/task${queryString ? `?${queryString}` : ""}`;

    const data = await this.makeRequest<{ tasks: ClickUpTask[] }>(endpoint);
    return data.tasks;
  }

  async createTask(
    listId: string,
    task: {
      name: string;
      description?: string;
      assignees?: number[];
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
      custom_fields?: Array<{
        id: string;
        value: any;
      }>;
    }
  ): Promise<ClickUpTask> {
    return this.makeRequest<ClickUpTask>(`/list/${listId}/task`, {
      method: "POST",
      body: JSON.stringify(task),
    });
  }

  async updateTask(
    taskId: string,
    updates: {
      name?: string;
      description?: string;
      status?: string;
      priority?: number;
      due_date?: number;
      due_date_time?: boolean;
      parent?: string;
      time_estimate?: number;
      start_date?: number;
      start_date_time?: boolean;
      assignees?: {
        add?: number[];
        rem?: number[];
      };
    }
  ): Promise<ClickUpTask> {
    return this.makeRequest<ClickUpTask>(`/task/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.makeRequest(`/task/${taskId}`, {
      method: "DELETE",
    });
  }

  async getTask(
    taskId: string,
    options: {
      custom_task_ids?: boolean;
      team_id?: string;
      include_subtasks?: boolean;
    } = {}
  ): Promise<ClickUpTask> {
    const params = new URLSearchParams();

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/task/${taskId}${queryString ? `?${queryString}` : ""}`;

    return this.makeRequest<ClickUpTask>(endpoint);
  }

  // Time tracking methods
  async getTimeEntries(taskId: string): Promise<any[]> {
    const data = await this.makeRequest<{ data: any[] }>(
      `/task/${taskId}/time`
    );
    return data.data;
  }

  async createTimeEntry(
    taskId: string,
    entry: {
      description?: string;
      tags?: string[];
      start: number;
      billable?: boolean;
      duration: number;
      assignee: number;
      tid?: string;
    }
  ): Promise<any> {
    return this.makeRequest(`/task/${taskId}/time`, {
      method: "POST",
      body: JSON.stringify(entry),
    });
  }

  // Analytics methods
  async getTaskAnalytics(spaceId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueeTasks: number;
    avgCompletionTime: number;
  }> {
    // This would require multiple API calls to aggregate data
    const lists = await this.getLists(spaceId);
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let overdueTasks = 0;

    for (const list of lists) {
      const tasks = await this.getTasks(list.id, { include_closed: true });
      totalTasks += tasks.length;

      tasks.forEach(task => {
        if (task.status.type === "closed") {
          completedTasks++;
        } else if (task.status.type === "open") {
          inProgressTasks++;
          if (task.due_date && new Date(parseInt(task.due_date)) < new Date()) {
            overdueTasks++;
          }
        }
      });
    }

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueeTasks: overdueTasks,
      avgCompletionTime: 0, // Would need historical data calculation
    };
  }
}

// Export default instance
export default ClickUpClient;
