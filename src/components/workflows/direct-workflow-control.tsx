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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  RefreshCw,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  Zap,
  Search,
  Activity,
  Workflow,
  AlertCircle,
  Target,
} from "lucide-react";

interface WorkflowItem {
  id: string;
  name: string;
  status: "active" | "inactive" | "running" | "paused" | "error";
  type: string;
  execution_count: number;
  success_rate: number;
  last_execution: string;
  description?: string;
  error_count: number;
}

export default function DirectWorkflowControl() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "/api/marketing/n8n-workflows?action=list_workflows"
      );
      const result = await response.json();

      if (result.success && result.data) {
        setWorkflows(result.data.workflows || []);
      } else {
        throw new Error(result.error || "Failed to fetch workflows");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch workflows"
      );
    } finally {
      setLoading(false);
    }
  };

  const executeWorkflow = async (workflowId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/marketing/n8n-workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "execute_workflow",
          workflowId,
          inputData: {},
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`Workflow executed successfully`);
        fetchWorkflows();
      } else {
        throw new Error(result.error || "Failed to execute workflow");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to execute workflow"
      );
    } finally {
      setLoading(false);
    }
  };

  const setWorkflowStatus = async (workflowId: string, active: boolean) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/marketing/n8n-workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_workflow_status",
          workflowId,
          active,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`Workflow ${active ? "activated" : "deactivated"}`);
        setWorkflows(prev =>
          prev.map(wf =>
            wf.id === workflowId
              ? { ...wf, status: active ? "active" : "inactive" }
              : wf
          )
        );
      } else {
        throw new Error(result.error || "Failed to update workflow status");
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update workflow status"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timeout = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [error, success]);

  const filteredWorkflows = workflows.filter(wf => {
    const matchesSearch = wf.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || wf.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "running":
        return "bg-blue-500 animate-pulse";
      case "paused":
        return "bg-yellow-500";
      case "inactive":
        return "bg-gray-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Direct Workflow Control</h1>
          <p className="text-muted-foreground">
            Manage and control n8n workflows directly from the dashboard
          </p>
        </div>
        <NormalButton
          onClick={fetchWorkflows}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </NormalButton>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Workflows
            </CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflows.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {workflows.filter(w => w.status === "running").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {workflows.filter(w => w.status === "error").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {workflows.length > 0
                ? Math.round(
                    workflows.reduce((acc, w) => acc + w.success_rate, 0) /
                      workflows.length
                  )
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredWorkflows.map(workflow => (
          <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${getStatusColor(workflow.status)}`}
                  />
                  <div>
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <CardDescription>
                      {workflow.description || `${workflow.type} workflow`}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{workflow.status}</Badge>
                  <div className="flex gap-1">
                    <NormalButton
                      size="sm"
                      variant="outline"
                      onClick={() => executeWorkflow(workflow.id)}
                      disabled={loading}
                      title="Execute Workflow"
                    >
                      <Play className="h-3 w-3" />
                    </NormalButton>
                    <NormalButton
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setWorkflowStatus(
                          workflow.id,
                          workflow.status !== "active"
                        )
                      }
                      disabled={loading}
                      title={
                        workflow.status === "active" ? "Deactivate" : "Activate"
                      }
                    >
                      {workflow.status === "active" ? (
                        <Pause className="h-3 w-3" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </NormalButton>
                    <NormalButton
                      size="sm"
                      variant="outline"
                      onClick={() => executeWorkflow(workflow.id)}
                      disabled={loading}
                      title="Quick Execute"
                    >
                      <Zap className="h-3 w-3" />
                    </NormalButton>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={workflow.success_rate}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium">
                      {workflow.success_rate}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Executions</p>
                  <p className="text-lg font-medium">
                    {workflow.execution_count.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Last Execution
                  </p>
                  <p className="text-sm">
                    {workflow.last_execution
                      ? new Date(workflow.last_execution).toLocaleString()
                      : "Never"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="text-sm capitalize">{workflow.type}</p>
                </div>
              </div>
              {workflow.error_count > 0 && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  {workflow.error_count} errors in recent executions
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
