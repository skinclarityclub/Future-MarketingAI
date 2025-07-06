"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  RefreshCw,
  Activity,
} from "lucide-react";
import { liveAnalyticsService } from "@/lib/analytics/live-analytics-service";

interface ClickUpMetrics {
  projectMetrics: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    completionRate: number;
    avgCompletionTime: number;
  };
  recentActivity: Array<{
    id: string;
    name: string;
    status: string;
    assignee: string;
    updated_at: Date;
    priority: string;
  }>;
  teamPerformance: Array<{
    assignee: string;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    efficiency: number;
  }>;
}

const ClickUpAnalyticsWidget: React.FC = () => {
  const [metrics, setMetrics] = useState<ClickUpMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    loadClickUpData();

    // Set up real-time updates every 2 minutes
    const interval = setInterval(loadClickUpData, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadClickUpData = async () => {
    try {
      setLoading(true);
      const data = await liveAnalyticsService.getLiveClickUpData();
      setMetrics(data);
      setConnected(true);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load ClickUp data:", error);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "closed":
        return "text-green-500";
      case "in progress":
      case "in_progress":
        return "text-blue-500";
      case "to do":
      case "open":
        return "text-gray-500";
      default:
        return "text-gray-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  if (loading && !metrics) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            ClickUp Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            ClickUp Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-400">Failed to load ClickUp data</p>
            <Button
              onClick={loadClickUpData}
              variant="outline"
              className="mt-4 bg-gray-700 border-gray-600"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5" />
                ClickUp Analytics
              </CardTitle>
              <CardDescription className="text-gray-400">
                Live project and task data from ClickUp
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={connected ? "default" : "destructive"}>
                {connected ? "Connected" : "Disconnected"}
              </Badge>
              <Button
                onClick={loadClickUpData}
                variant="outline"
                size="sm"
                disabled={loading}
                className="bg-gray-700 border-gray-600"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Tasks</p>
                <p className="text-2xl font-bold text-white">
                  {metrics.projectMetrics.totalTasks}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-green-500">
                  {metrics.projectMetrics.completedTasks}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">In Progress</p>
                <p className="text-2xl font-bold text-blue-500">
                  {metrics.projectMetrics.inProgressTasks}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Overdue</p>
                <p className="text-2xl font-bold text-red-500">
                  {metrics.projectMetrics.overdueTasks}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completion Rate */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Project Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Completion Rate</span>
              <span className="text-white font-semibold">
                {metrics.projectMetrics.completionRate}%
              </span>
            </div>
            <Progress
              value={metrics.projectMetrics.completionRate}
              className="bg-gray-700"
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>
                Average completion: {metrics.projectMetrics.avgCompletionTime}{" "}
                days
              </span>
              <span>
                {metrics.projectMetrics.completedTasks} of{" "}
                {metrics.projectMetrics.totalTasks} tasks
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.recentActivity.slice(0, 5).map(activity => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm">
                    {activity.name}
                  </h4>
                  <p className="text-gray-400 text-xs">
                    {activity.assignee} • {activity.updated_at.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={getPriorityColor(activity.priority)}
                    className="text-xs"
                  >
                    {activity.priority}
                  </Badge>
                  <span
                    className={`text-xs font-medium ${getStatusColor(activity.status)}`}
                  >
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Performance */}
      {metrics.teamPerformance.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">
              Team Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.teamPerformance.slice(0, 5).map((member, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">
                      {member.assignee}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {member.efficiency.toFixed(1)}% efficiency
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-400">
                      ✓ {member.completedTasks} completed
                    </span>
                    <span className="text-blue-400">
                      ⚡ {member.inProgressTasks} in progress
                    </span>
                    <span className="text-red-400">
                      ⚠ {member.overdueTasks} overdue
                    </span>
                  </div>
                  <Progress
                    value={member.efficiency}
                    className="bg-gray-700 h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClickUpAnalyticsWidget;
