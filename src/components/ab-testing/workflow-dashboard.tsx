"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  CheckCircle,
  Clock,
  Users,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  Settings,
  MessageSquare,
  Link,
  ExternalLink,
  RefreshCw,
  Plus,
  Filter,
  BarChart3,
  Target,
  Zap,
  Bell,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import {
  WorkflowIntegration,
  TestWorkflowTask,
  ClickUpIntegrationService,
} from "@/lib/ab-testing/workflow-integration";

interface WorkflowDashboardProps {
  testId?: string;
  workflowIntegration?: WorkflowIntegration;
}

interface WorkflowAutomation {
  id: string;
  name: string;
  description: string;
  trigger: "test_start" | "significance_reached" | "test_complete" | "manual";
  actions: Array<{
    type:
      | "create_task"
      | "send_notification"
      | "update_status"
      | "generate_report";
    config: Record<string, any>;
  }>;
  isActive: boolean;
  lastRun?: Date;
  runCount: number;
}

export default function WorkflowDashboard({
  testId,
  workflowIntegration,
}: WorkflowDashboardProps) {
  const [workflowTasks, setWorkflowTasks] = useState<TestWorkflowTask[]>([]);
  const [automations, setAutomations] = useState<WorkflowAutomation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<TestWorkflowTask | null>(
    null
  );
  const [newTaskForm, setNewTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium" as TestWorkflowTask["priority"],
    assigneeId: "",
    dueDate: "",
    tags: "",
  });
  const [newCommentText, setNewCommentText] = useState("");
  const [automationForm, setAutomationForm] = useState({
    name: "",
    description: "",
    trigger: "test_start" as WorkflowAutomation["trigger"],
    actionType: "create_task",
    actionConfig: "",
  });

  useEffect(() => {
    loadWorkflowData();
  }, [testId, workflowIntegration]);

  const loadWorkflowData = async () => {
    setLoading(true);
    try {
      // Load mock workflow data for demo
      const mockTasks: TestWorkflowTask[] = [
        {
          id: "task_1",
          testId: testId || "test_1",
          title: "Setup A/B Test Campaign",
          description: "Configure test variants and targeting parameters",
          status: "completed",
          assigneeId: "user_1",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          priority: "high",
          tags: ["setup", "configuration"],
          customFields: { testPhase: "preparation" },
          progress: 100,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
        {
          id: "task_2",
          testId: testId || "test_1",
          title: "Monitor Test Performance",
          description: "Track key metrics and statistical significance",
          status: "in_progress",
          assigneeId: "user_2",
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          priority: "medium",
          tags: ["monitoring", "analytics"],
          customFields: { testPhase: "execution" },
          progress: 65,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 30 * 60 * 1000),
        },
        {
          id: "task_3",
          testId: testId || "test_1",
          title: "Analyze Results & Generate Report",
          description:
            "Create comprehensive analysis report with recommendations",
          status: "pending",
          priority: "high",
          tags: ["analysis", "reporting"],
          customFields: { testPhase: "completion" },
          progress: 0,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ];

      const mockAutomations: WorkflowAutomation[] = [
        {
          id: "auto_1",
          name: "Test Start Notification",
          description: "Automatically notify team when test begins",
          trigger: "test_start",
          actions: [
            {
              type: "send_notification",
              config: {
                channels: ["email", "slack"],
                message: "A/B Test has started",
              },
            },
            {
              type: "create_task",
              config: { title: "Monitor Test Progress", assignee: "team_lead" },
            },
          ],
          isActive: true,
          lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
          runCount: 15,
        },
        {
          id: "auto_2",
          name: "Significance Alert",
          description: "Alert when statistical significance is reached",
          trigger: "significance_reached",
          actions: [
            {
              type: "send_notification",
              config: {
                channels: ["email"],
                message: "Statistical significance reached",
              },
            },
            {
              type: "update_status",
              config: { newStatus: "ready_for_review" },
            },
          ],
          isActive: true,
          runCount: 8,
        },
        {
          id: "auto_3",
          name: "Test Completion Report",
          description: "Generate final report when test completes",
          trigger: "test_complete",
          actions: [
            {
              type: "generate_report",
              config: { format: "pdf", includeInsights: true },
            },
            {
              type: "create_task",
              config: { title: "Review Test Results", priority: "high" },
            },
          ],
          isActive: false,
          runCount: 3,
        },
      ];

      setWorkflowTasks(mockTasks);
      setAutomations(mockAutomations);
      setSelectedTask(mockTasks[0]);
    } catch (error) {
      console.error("Error loading workflow data:", error);
      toast.error("Failed to load workflow data");
    } finally {
      setLoading(false);
    }
  };

  const createNewTask = async () => {
    if (!newTaskForm.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    try {
      const newTask: TestWorkflowTask = {
        id: `task_${Date.now()}`,
        testId: testId || "test_1",
        title: newTaskForm.title,
        description: newTaskForm.description,
        status: "pending",
        assigneeId: newTaskForm.assigneeId || undefined,
        dueDate: newTaskForm.dueDate
          ? new Date(newTaskForm.dueDate)
          : undefined,
        priority: newTaskForm.priority,
        tags: newTaskForm.tags
          .split(",")
          .map(tag => tag.trim())
          .filter(Boolean),
        customFields: {},
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setWorkflowTasks(prev => [...prev, newTask]);
      setNewTaskForm({
        title: "",
        description: "",
        priority: "medium",
        assigneeId: "",
        dueDate: "",
        tags: "",
      });

      toast.success("Task created successfully");
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    }
  };

  const updateTaskStatus = async (
    taskId: string,
    newStatus: TestWorkflowTask["status"]
  ) => {
    try {
      setWorkflowTasks(prev =>
        prev.map(task =>
          task.id === taskId
            ? { ...task, status: newStatus, updatedAt: new Date() }
            : task
        )
      );

      if (selectedTask?.id === taskId) {
        setSelectedTask(prev => (prev ? { ...prev, status: newStatus } : null));
      }

      toast.success("Task status updated");
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status");
    }
  };

  const updateTaskProgress = async (taskId: string, progress: number) => {
    try {
      setWorkflowTasks(prev =>
        prev.map(task =>
          task.id === taskId
            ? { ...task, progress, updatedAt: new Date() }
            : task
        )
      );

      if (selectedTask?.id === taskId) {
        setSelectedTask(prev => (prev ? { ...prev, progress } : null));
      }

      toast.success("Task progress updated");
    } catch (error) {
      console.error("Error updating task progress:", error);
      toast.error("Failed to update task progress");
    }
  };

  const addComment = async () => {
    if (!newCommentText.trim() || !selectedTask) {
      return;
    }

    try {
      // In real implementation, this would call the ClickUp API
      toast.success("Comment added successfully");
      setNewCommentText("");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const createAutomation = async () => {
    if (!automationForm.name.trim()) {
      toast.error("Automation name is required");
      return;
    }

    try {
      const newAutomation: WorkflowAutomation = {
        id: `auto_${Date.now()}`,
        name: automationForm.name,
        description: automationForm.description,
        trigger: automationForm.trigger,
        actions: [
          {
            type: automationForm.actionType as any,
            config: JSON.parse(automationForm.actionConfig || "{}"),
          },
        ],
        isActive: true,
        runCount: 0,
      };

      setAutomations(prev => [...prev, newAutomation]);
      setAutomationForm({
        name: "",
        description: "",
        trigger: "test_start",
        actionType: "create_task",
        actionConfig: "",
      });

      toast.success("Automation created successfully");
    } catch (error) {
      console.error("Error creating automation:", error);
      toast.error("Failed to create automation");
    }
  };

  const toggleAutomation = (automationId: string) => {
    setAutomations(prev =>
      prev.map(automation =>
        automation.id === automationId
          ? { ...automation, isActive: !automation.isActive }
          : automation
      )
    );
    toast.success("Automation status updated");
  };

  const getStatusColor = (status: TestWorkflowTask["status"]) => {
    switch (status) {
      case "completed":
        return "default";
      case "in_progress":
        return "secondary";
      case "pending":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: TestWorkflowTask["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "in_progress":
        return <PlayCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "cancelled":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: TestWorkflowTask["priority"]) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const getTriggerIcon = (trigger: WorkflowAutomation["trigger"]) => {
    switch (trigger) {
      case "test_start":
        return <PlayCircle className="h-4 w-4" />;
      case "significance_reached":
        return <Target className="h-4 w-4" />;
      case "test_complete":
        return <CheckCircle className="h-4 w-4" />;
      case "manual":
        return <Settings className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading workflow...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Dashboard</h2>
          <p className="text-muted-foreground">
            Manage test workflows, tasks, and automations
          </p>
        </div>
        <div className="flex gap-2">
          <NormalButton variant="outline" onClick={loadWorkflowData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </NormalButton>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium">Active Tasks</span>
          </div>
          <div className="text-2xl font-bold mt-1">
            {
              workflowTasks.filter(
                t => t.status !== "completed" && t.status !== "cancelled"
              ).length
            }
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium">Completed</span>
          </div>
          <div className="text-2xl font-bold mt-1">
            {workflowTasks.filter(t => t.status === "completed").length}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium">Active Automations</span>
          </div>
          <div className="text-2xl font-bold mt-1">
            {automations.filter(a => a.isActive).length}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium">Avg Progress</span>
          </div>
          <div className="text-2xl font-bold mt-1">
            {Math.round(
              workflowTasks.reduce((sum, t) => sum + t.progress, 0) /
                workflowTasks.length
            )}
            %
          </div>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks">Task Management</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Workflow Tasks</h3>
                <NormalButton size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </NormalButton>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {workflowTasks.map(task => (
                  <Card
                    key={task.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedTask?.id === task.id ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(task.status)}
                            <h4 className="font-medium truncate">
                              {task.title}
                            </h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {task.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={getStatusColor(task.status)}>
                            {task.status.replace("_", " ")}
                          </Badge>
                          <Badge variant={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{task.progress}%</span>
                        </div>
                        <Progress value={task.progress} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex gap-1">
                          {task.tags.map(tag => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {task.dueDate.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Create New Task Form */}
              <Card className="p-4">
                <h4 className="font-medium mb-3">Create New Task</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="task-title">Title</Label>
                    <Input
                      id="task-title"
                      value={newTaskForm.title}
                      onChange={e =>
                        setNewTaskForm(prev => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Task title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="task-desc">Description</Label>
                    <Textarea
                      id="task-desc"
                      value={newTaskForm.description}
                      onChange={e =>
                        setNewTaskForm(prev => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Task description"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="task-priority">Priority</Label>
                      <Select
                        value={newTaskForm.priority}
                        onValueChange={(value: any) =>
                          setNewTaskForm(prev => ({ ...prev, priority: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="task-due">Due Date</Label>
                      <Input
                        id="task-due"
                        type="date"
                        value={newTaskForm.dueDate}
                        onChange={e =>
                          setNewTaskForm(prev => ({
                            ...prev,
                            dueDate: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="task-tags">Tags (comma-separated)</Label>
                    <Input
                      id="task-tags"
                      value={newTaskForm.tags}
                      onChange={e =>
                        setNewTaskForm(prev => ({
                          ...prev,
                          tags: e.target.value,
                        }))
                      }
                      placeholder="setup, monitoring, analysis"
                    />
                  </div>

                  <NormalButton onClick={createNewTask} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </NormalButton>
                </div>
              </Card>
            </div>

            {/* Task Detail */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Task Details</h3>

              {selectedTask ? (
                <div className="space-y-4">
                  <Card className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-semibold">
                            {selectedTask.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedTask.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={getStatusColor(selectedTask.status)}>
                            {selectedTask.status.replace("_", " ")}
                          </Badge>
                          <Badge
                            variant={getPriorityColor(selectedTask.priority)}
                          >
                            {selectedTask.priority}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">
                            Progress
                          </Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress
                              value={selectedTask.progress}
                              className="flex-1"
                            />
                            <span className="text-sm text-muted-foreground">
                              {selectedTask.progress}%
                            </span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <NormalButton
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateTaskProgress(
                                  selectedTask.id,
                                  Math.min(100, selectedTask.progress + 25)
                                )
                              }
                            >
                              +25%
                            </NormalButton>
                            <NormalButton
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateTaskProgress(selectedTask.id, 100)
                              }
                            >
                              Complete
                            </NormalButton>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">
                              Status
                            </Label>
                            <Select
                              value={selectedTask.status}
                              onValueChange={(value: any) =>
                                updateTaskStatus(selectedTask.id, value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">
                                  In Progress
                                </SelectItem>
                                <SelectItem value="completed">
                                  Completed
                                </SelectItem>
                                <SelectItem value="cancelled">
                                  Cancelled
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">
                              Due Date
                            </Label>
                            <div className="text-sm">
                              {selectedTask.dueDate
                                ? selectedTask.dueDate.toLocaleDateString()
                                : "Not set"}
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Tags</Label>
                          <div className="flex gap-1 mt-1">
                            {selectedTask.tags.map(tag => (
                              <Badge key={tag} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          <div>
                            Created: {selectedTask.createdAt.toLocaleString()}
                          </div>
                          <div>
                            Updated: {selectedTask.updatedAt.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* ClickUp Integration */}
                  <Card className="p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      ClickUp Integration
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <NormalButton variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in ClickUp
                        </NormalButton>
                        <NormalButton variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync Status
                        </NormalButton>
                      </div>

                      <div>
                        <Label htmlFor="comment">Add Comment</Label>
                        <div className="flex gap-2 mt-1">
                          <Textarea
                            id="comment"
                            value={newCommentText}
                            onChange={e => setNewCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            rows={2}
                            className="flex-1"
                          />
                          <NormalButton
                            onClick={addComment}
                            disabled={!newCommentText.trim()}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </NormalButton>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ) : (
                <Card className="p-6">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Select a task to view details</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="automations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Automations List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Workflow Automations</h3>

              <div className="space-y-3">
                {automations.map(automation => (
                  <Card key={automation.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getTriggerIcon(automation.trigger)}
                          <div>
                            <h4 className="font-medium">{automation.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {automation.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              automation.isActive ? "default" : "outline"
                            }
                          >
                            {automation.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <NormalButton
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAutomation(automation.id)}
                          >
                            {automation.isActive ? (
                              <PauseCircle className="h-4 w-4" />
                            ) : (
                              <PlayCircle className="h-4 w-4" />
                            )}
                          </NormalButton>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>
                            Trigger: {automation.trigger.replace("_", " ")}
                          </span>
                          <span>Runs: {automation.runCount}</span>
                        </div>
                        {automation.lastRun && (
                          <div>
                            Last run: {automation.lastRun.toLocaleString()}
                          </div>
                        )}
                      </div>

                      <div>
                        <Label className="text-xs font-medium">Actions</Label>
                        <div className="flex gap-1 mt-1">
                          {automation.actions.map((action, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {action.type.replace("_", " ")}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Create Automation */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Create Automation</h3>

              <Card className="p-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="auto-name">Name</Label>
                    <Input
                      id="auto-name"
                      value={automationForm.name}
                      onChange={e =>
                        setAutomationForm(prev => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Automation name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="auto-desc">Description</Label>
                    <Textarea
                      id="auto-desc"
                      value={automationForm.description}
                      onChange={e =>
                        setAutomationForm(prev => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="What does this automation do?"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="auto-trigger">Trigger</Label>
                    <Select
                      value={automationForm.trigger}
                      onValueChange={(value: any) =>
                        setAutomationForm(prev => ({ ...prev, trigger: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="test_start">Test Start</SelectItem>
                        <SelectItem value="significance_reached">
                          Significance Reached
                        </SelectItem>
                        <SelectItem value="test_complete">
                          Test Complete
                        </SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="auto-action">Action Type</Label>
                    <Select
                      value={automationForm.actionType}
                      onValueChange={(value: any) =>
                        setAutomationForm(prev => ({
                          ...prev,
                          actionType: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="create_task">Create Task</SelectItem>
                        <SelectItem value="send_notification">
                          Send Notification
                        </SelectItem>
                        <SelectItem value="update_status">
                          Update Status
                        </SelectItem>
                        <SelectItem value="generate_report">
                          Generate Report
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="auto-config">
                      Action Configuration (JSON)
                    </Label>
                    <Textarea
                      id="auto-config"
                      value={automationForm.actionConfig}
                      onChange={e =>
                        setAutomationForm(prev => ({
                          ...prev,
                          actionConfig: e.target.value,
                        }))
                      }
                      placeholder='{"title": "New Task", "priority": "high"}'
                      rows={3}
                    />
                  </div>

                  <NormalButton onClick={createAutomation} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Automation
                  </NormalButton>
                </div>
              </Card>

              {/* Automation Templates */}
              <Card className="p-4">
                <h4 className="font-medium mb-3">Templates</h4>
                <div className="space-y-2">
                  <NormalButton
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Test Start Notification
                  </NormalButton>
                  <NormalButton
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Significance Alert
                  </NormalButton>
                  <NormalButton
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completion Report
                  </NormalButton>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          {/* Integration Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                ClickUp Integration
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Connection Status</span>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span>API Rate Limit</span>
                  <span className="text-sm text-muted-foreground">
                    847/1000
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Last Sync</span>
                  <span className="text-sm text-muted-foreground">
                    2 minutes ago
                  </span>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex gap-2">
                    <NormalButton variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </NormalButton>
                    <NormalButton variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Test Connection
                    </NormalButton>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Available Integrations
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Slack</span>
                  </div>
                  <NormalButton size="sm" variant="outline">
                    Connect
                  </NormalButton>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span>Email Notifications</span>
                  </div>
                  <NormalButton size="sm" variant="outline">
                    Setup
                  </NormalButton>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Analytics Platform</span>
                  </div>
                  <NormalButton size="sm" variant="outline">
                    Integrate
                  </NormalButton>
                </div>
              </div>
            </Card>
          </div>

          {/* Integration Logs */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Integration Activity Log
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[
                {
                  time: "10:32 AM",
                  action: "Task created in ClickUp",
                  status: "success",
                },
                {
                  time: "10:28 AM",
                  action: "Notification sent to Slack",
                  status: "success",
                },
                {
                  time: "10:15 AM",
                  action: "Test status synchronized",
                  status: "success",
                },
                {
                  time: "09:45 AM",
                  action: "Automation trigger executed",
                  status: "success",
                },
                {
                  time: "09:30 AM",
                  action: "API rate limit warning",
                  status: "warning",
                },
                {
                  time: "09:15 AM",
                  action: "Connection test successful",
                  status: "success",
                },
              ].map((log, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 text-sm border-b"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        log.status === "success"
                          ? "bg-green-500"
                          : log.status === "warning"
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                    />
                    <span>{log.action}</span>
                  </div>
                  <span className="text-muted-foreground">{log.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
