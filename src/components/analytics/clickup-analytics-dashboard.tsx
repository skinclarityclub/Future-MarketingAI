"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Target,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw,
  Calendar,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
} from "lucide-react";

// Types
interface TaskMetrics {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  avg_completion_time: number;
}

interface WorkflowMetrics {
  spaces: number;
  lists: number;
  active_workflows: number;
  total_time_tracked: number;
  team_productivity_score: number;
}

interface SyncMetrics {
  total_syncs: number;
  successful_syncs: number;
  failed_syncs: number;
  last_sync_time: string;
  sync_success_rate: number;
  avg_sync_time: number;
}

interface TimeSeriesData {
  date: string;
  tasks_created: number;
  tasks_completed: number;
  sync_events: number;
  webhook_events: number;
}

interface PriorityDistribution {
  priority: string;
  count: number;
  percentage: number;
  color: string;
}

interface TeamProductivity {
  user_id: string;
  user_name: string;
  tasks_completed: number;
  time_tracked: number;
  completion_rate: number;
  productivity_score: number;
}

const COLORS = {
  primary: "#3B82F6",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  purple: "#8B5CF6",
  indigo: "#6366F1",
  pink: "#EC4899",
  teal: "#14B8A6",
};

// Mock data generators
const generateMockTaskMetrics = (): TaskMetrics => ({
  total_tasks: 156,
  completed_tasks: 89,
  in_progress_tasks: 45,
  overdue_tasks: 22,
  completion_rate: 57.1,
  avg_completion_time: 4.2,
});

const generateMockWorkflowMetrics = (): WorkflowMetrics => ({
  spaces: 8,
  lists: 24,
  active_workflows: 12,
  total_time_tracked: 2847,
  team_productivity_score: 78.5,
});

const generateMockSyncMetrics = (): SyncMetrics => ({
  total_syncs: 1247,
  successful_syncs: 1198,
  failed_syncs: 49,
  last_sync_time: new Date().toISOString(),
  sync_success_rate: 96.1,
  avg_sync_time: 1.8,
});

const generateMockTimeSeriesData = (): TimeSeriesData[] => {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split("T")[0],
      tasks_created: Math.floor(Math.random() * 15) + 5,
      tasks_completed: Math.floor(Math.random() * 12) + 3,
      sync_events: Math.floor(Math.random() * 25) + 10,
      webhook_events: Math.floor(Math.random() * 30) + 15,
    });
  }
  return data;
};

const generateMockPriorityData = (): PriorityDistribution[] => [
  { priority: "High", count: 34, percentage: 21.8, color: COLORS.danger },
  { priority: "Normal", count: 89, percentage: 57.1, color: COLORS.primary },
  { priority: "Low", count: 33, percentage: 21.2, color: COLORS.success },
];

const generateMockTeamData = (): TeamProductivity[] => [
  {
    user_id: "1",
    user_name: "Alice Johnson",
    tasks_completed: 23,
    time_tracked: 184,
    completion_rate: 85.2,
    productivity_score: 92,
  },
  {
    user_id: "2",
    user_name: "Bob Wilson",
    tasks_completed: 19,
    time_tracked: 156,
    completion_rate: 78.9,
    productivity_score: 81,
  },
  {
    user_id: "3",
    user_name: "Carol Davis",
    tasks_completed: 31,
    time_tracked: 201,
    completion_rate: 91.3,
    productivity_score: 95,
  },
  {
    user_id: "4",
    user_name: "David Brown",
    tasks_completed: 16,
    time_tracked: 142,
    completion_rate: 72.1,
    productivity_score: 74,
  },
];

export function ClickUpAnalyticsDashboard() {
  const [taskMetrics, setTaskMetrics] = useState<TaskMetrics>(
    generateMockTaskMetrics()
  );
  const [workflowMetrics, setWorkflowMetrics] = useState<WorkflowMetrics>(
    generateMockWorkflowMetrics()
  );
  const [syncMetrics, setSyncMetrics] = useState<SyncMetrics>(
    generateMockSyncMetrics()
  );
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>(
    generateMockTimeSeriesData()
  );
  const [priorityData, setPriorityData] = useState<PriorityDistribution[]>(
    generateMockPriorityData()
  );
  const [teamData, setTeamData] = useState<TeamProductivity[]>(
    generateMockTeamData()
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      // In real implementation, fetch from API
      // const response = await fetch('/api/clickup/analytics');
      // if (response.ok) {
      //   const data = await response.json();
      //   setTaskMetrics(data.taskMetrics);
      //   setWorkflowMetrics(data.workflowMetrics);
      //   setSyncMetrics(data.syncMetrics);
      //   setTimeSeriesData(data.timeSeriesData);
      //   setPriorityData(data.priorityData);
      //   setTeamData(data.teamData);
      // }
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      month: "short",
      day: "numeric",
    });
  };

  const getPercentageChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0,
      isNegative: change < 0,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              ClickUp Analytics Dashboard
            </h1>
            <p className="text-slate-600 mt-2">
              Inzichten in taken, workflows en team prestaties
            </p>
          </div>
          <div className="flex gap-3">
            <NormalButton
              onClick={loadAnalyticsData}
              variant="outline"
              className="flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Vernieuwen
            </NormalButton>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Totaal Taken
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {taskMetrics.total_tasks}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                +12% deze maand
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voltooid</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {taskMetrics.completed_tasks}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {taskMetrics.completion_rate.toFixed(1)}% voltooiingsratio
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sync Successratio
              </CardTitle>
              <Zap className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {syncMetrics.sync_success_rate.toFixed(1)}%
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {syncMetrics.successful_syncs}/{syncMetrics.total_syncs} syncs
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Team Productiviteit
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {workflowMetrics.team_productivity_score}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                +5.2% deze week
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overzicht</TabsTrigger>
            <TabsTrigger value="tasks">Taken Analysis</TabsTrigger>
            <TabsTrigger value="sync">Sync Prestaties</TabsTrigger>
            <TabsTrigger value="team">Team Metrics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Task Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Taken Trends (30 dagen)</CardTitle>
                  <CardDescription>
                    Overzicht van taken creatie en voltooiing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatDate}
                        fontSize={12}
                      />
                      <YAxis fontSize={12} />
                      <Tooltip
                        labelFormatter={value => formatDate(value as string)}
                        formatter={(value: number, name: string) => [
                          value,
                          name === "tasks_created"
                            ? "Taken Aangemaakt"
                            : name === "tasks_completed"
                              ? "Taken Voltooid"
                              : name,
                        ]}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="tasks_created"
                        stackId="1"
                        stroke={COLORS.primary}
                        fill={COLORS.primary}
                        fillOpacity={0.6}
                        name="Taken Aangemaakt"
                      />
                      <Area
                        type="monotone"
                        dataKey="tasks_completed"
                        stackId="1"
                        stroke={COLORS.success}
                        fill={COLORS.success}
                        fillOpacity={0.6}
                        name="Taken Voltooid"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Priority Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Prioriteit Verdeling</CardTitle>
                  <CardDescription>
                    Verdeling van taken per prioriteit niveau
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <ResponsiveContainer width="60%" height={200}>
                      <PieChart>
                        <Pie
                          data={priorityData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          label={false}
                        >
                          {priorityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {priorityData.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <div>
                            <div className="font-medium">{item.priority}</div>
                            <div className="text-sm text-gray-500">
                              {item.count} taken ({item.percentage}%)
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Workflow Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Workflow Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Actieve Workflows</span>
                    <span className="font-bold">
                      {workflowMetrics.active_workflows}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Spaces</span>
                    <span className="font-bold">{workflowMetrics.spaces}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lists</span>
                    <span className="font-bold">{workflowMetrics.lists}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tijd Getrackt</span>
                    <span className="font-bold">
                      {formatTime(workflowMetrics.total_time_tracked)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Prestatie Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Voltooiingsratio</span>
                      <span className="font-bold">
                        {taskMetrics.completion_rate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={taskMetrics.completion_rate}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Team Productiviteit</span>
                      <span className="font-bold">
                        {workflowMetrics.team_productivity_score}%
                      </span>
                    </div>
                    <Progress
                      value={workflowMetrics.team_productivity_score}
                      className="h-2"
                    />
                  </div>
                  <div className="pt-2">
                    <div className="text-sm text-gray-600">
                      Gem. voltooiingstijd: {taskMetrics.avg_completion_time}{" "}
                      dagen
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Aandachtspunten
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-sm">
                      {taskMetrics.overdue_tasks} overtijd taken
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="text-sm">
                      {syncMetrics.failed_syncs} sync fouten
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm">
                      {taskMetrics.in_progress_tasks} taken in behandeling
                    </span>
                  </div>
                  <div className="pt-2">
                    <Badge variant="outline" className="text-xs">
                      Laatste sync:{" "}
                      {new Date(syncMetrics.last_sync_time).toLocaleTimeString(
                        "nl-NL"
                      )}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Taken Status Overzicht</CardTitle>
                  <CardDescription>
                    Huidige status van alle taken
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        {
                          name: "Voltooid",
                          value: taskMetrics.completed_tasks,
                          color: COLORS.success,
                        },
                        {
                          name: "In behandeling",
                          value: taskMetrics.in_progress_tasks,
                          color: COLORS.primary,
                        },
                        {
                          name: "Overtijd",
                          value: taskMetrics.overdue_tasks,
                          color: COLORS.danger,
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill={COLORS.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Wekelijkse Trends</CardTitle>
                  <CardDescription>Taken voltooiing per dag</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeSeriesData.slice(-7)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={formatDate} />
                      <YAxis />
                      <Tooltip
                        labelFormatter={value => formatDate(value as string)}
                      />
                      <Line
                        type="monotone"
                        dataKey="tasks_completed"
                        stroke={COLORS.success}
                        strokeWidth={3}
                        name="Voltooid"
                      />
                      <Line
                        type="monotone"
                        dataKey="tasks_created"
                        stroke={COLORS.primary}
                        strokeWidth={3}
                        name="Aangemaakt"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sync Tab */}
          <TabsContent value="sync" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sync & Webhook Events</CardTitle>
                  <CardDescription>
                    Real-time data synchronisatie statistieken
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={formatDate} />
                      <YAxis />
                      <Tooltip
                        labelFormatter={value => formatDate(value as string)}
                      />
                      <Area
                        type="monotone"
                        dataKey="sync_events"
                        stackId="1"
                        stroke={COLORS.indigo}
                        fill={COLORS.indigo}
                        fillOpacity={0.6}
                        name="Sync Events"
                      />
                      <Area
                        type="monotone"
                        dataKey="webhook_events"
                        stackId="1"
                        stroke={COLORS.purple}
                        fill={COLORS.purple}
                        fillOpacity={0.6}
                        name="Webhook Events"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sync Prestaties</CardTitle>
                  <CardDescription>
                    Synchronisatie betrouwbaarheid en snelheid
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Successratio</span>
                      <span className="font-bold">
                        {syncMetrics.sync_success_rate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={syncMetrics.sync_success_rate}
                      className="h-3"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {syncMetrics.successful_syncs}
                      </div>
                      <div className="text-sm text-green-700">Succesvol</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {syncMetrics.failed_syncs}
                      </div>
                      <div className="text-sm text-red-700">Gefaald</div>
                    </div>
                  </div>

                  <div className="pt-2 text-sm text-gray-600">
                    Gemiddelde sync tijd: {syncMetrics.avg_sync_time}s
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Productiviteit</CardTitle>
                <CardDescription>
                  Individuele prestaties en bijdragen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamData.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {member.user_name
                            .split(" ")
                            .map(n => n[0])
                            .join("")}
                        </div>
                        <div>
                          <div className="font-medium">{member.user_name}</div>
                          <div className="text-sm text-gray-500">
                            {member.tasks_completed} taken •{" "}
                            {formatTime(member.time_tracked)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={
                              member.productivity_score >= 85
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {member.productivity_score}% score
                          </Badge>
                        </div>
                        <Progress
                          value={member.completion_rate}
                          className="w-24 h-2"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {member.completion_rate.toFixed(1)}% voltooiing
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
