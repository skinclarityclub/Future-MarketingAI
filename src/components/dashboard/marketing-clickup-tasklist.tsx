"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  Filter,
  Search,
  Plus,
  Eye,
  Edit,
  MessageCircle,
  FileText,
  Image,
  Video,
  Share2,
  TrendingUp,
  Target,
  RefreshCw,
  ArrowRight,
  Zap,
  Pause,
  Play,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";

// ====================================================================
// TYPES & INTERFACES
// ====================================================================

interface ContentPhase {
  id: string;
  name: string;
  color: string;
  icon: React.ComponentType<any>;
  description: string;
}

interface ClickUpTask {
  id: string;
  name: string;
  status: string;
  priority: "urgent" | "high" | "normal" | "low";
  assignees: ClickUpUser[];
  due_date?: string;
  description?: string;
  tags: string[];
  content_type?: "blog" | "social" | "email" | "video" | "image";
  phase: string;
  progress?: number;
  url?: string;
  custom_fields?: Record<string, any>;
  time_estimate?: number;
  time_spent?: number;
}

interface ClickUpUser {
  id: string;
  username: string;
  email: string;
  color: string;
  initials: string;
  profilePicture?: string;
}

interface ClickUpSpace {
  id: string;
  name: string;
  color?: string;
  tasks: ClickUpTask[];
}

interface MarketingClickUpTasklistProps {
  className?: string;
  compactMode?: boolean;
  showFilters?: boolean;
  maxHeight?: string;
  workspaceId?: string;
  spaceId?: string;
  commandCenterMode?: boolean;
}

// ====================================================================
// CONTENT PHASES CONFIGURATION
// ====================================================================

const CONTENT_PHASES: ContentPhase[] = [
  {
    id: "ideation",
    name: "Ideation",
    color: "bg-purple-500",
    icon: Target,
    description: "Content ideas and planning",
  },
  {
    id: "research",
    name: "Research",
    color: "bg-blue-500",
    icon: Search,
    description: "Research and fact-checking",
  },
  {
    id: "creation",
    name: "Creation",
    color: "bg-yellow-500",
    icon: Edit,
    description: "Content creation and writing",
  },
  {
    id: "design",
    name: "Design",
    color: "bg-green-500",
    icon: Image,
    description: "Visual design and graphics",
  },
  {
    id: "review",
    name: "Review",
    color: "bg-orange-500",
    icon: Eye,
    description: "Content review and approval",
  },
  {
    id: "publish",
    name: "Publish",
    color: "bg-cyan-500",
    icon: Share2,
    description: "Publishing and distribution",
  },
  {
    id: "analysis",
    name: "Analysis",
    color: "bg-indigo-500",
    icon: TrendingUp,
    description: "Performance analysis",
  },
];

// ====================================================================
// MOCK DATA (Replace with actual API calls)
// ====================================================================

const mockTasks: ClickUpTask[] = [
  {
    id: "1",
    name: "Q1 Marketing Campaign Blog Series",
    status: "in progress",
    priority: "high",
    assignees: [
      {
        id: "u1",
        username: "sarah",
        email: "sarah@company.com",
        color: "#ff6b6b",
        initials: "SM",
      },
    ],
    due_date: "2025-01-15",
    content_type: "blog",
    phase: "creation",
    progress: 65,
    tags: ["blog", "marketing", "Q1"],
    time_estimate: 16,
    time_spent: 10,
  },
  {
    id: "2",
    name: "Social Media Assets - Product Launch",
    status: "to do",
    priority: "urgent",
    assignees: [
      {
        id: "u2",
        username: "mike",
        email: "mike@company.com",
        color: "#4ecdc4",
        initials: "MD",
      },
    ],
    due_date: "2025-01-10",
    content_type: "social",
    phase: "design",
    progress: 20,
    tags: ["social", "launch", "design"],
    time_estimate: 8,
    time_spent: 2,
  },
  {
    id: "3",
    name: "Email Newsletter Template Redesign",
    status: "review",
    priority: "normal",
    assignees: [
      {
        id: "u3",
        username: "anna",
        email: "anna@company.com",
        color: "#45b7d1",
        initials: "AK",
      },
    ],
    due_date: "2025-01-20",
    content_type: "email",
    phase: "review",
    progress: 90,
    tags: ["email", "template", "redesign"],
    time_estimate: 12,
    time_spent: 11,
  },
];

// ====================================================================
// UTILITY FUNCTIONS
// ====================================================================

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "bg-red-500 text-white";
    case "high":
      return "bg-orange-500 text-white";
    case "normal":
      return "bg-blue-500 text-white";
    case "low":
      return "bg-gray-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

const getContentTypeIcon = (type: string) => {
  switch (type) {
    case "blog":
      return <FileText className="h-4 w-4" />;
    case "social":
      return <Share2 className="h-4 w-4" />;
    case "email":
      return <MessageCircle className="h-4 w-4" />;
    case "video":
      return <Video className="h-4 w-4" />;
    case "image":
      return <Image className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const formatTimeEstimate = (hours?: number) => {
  if (!hours) return "";
  return hours > 1 ? `${hours}h` : `${hours * 60}m`;
};

// ====================================================================
// MAIN COMPONENT
// ====================================================================

export default function MarketingClickUpTasklist({
  className,
  compactMode = false,
  showFilters = true,
  maxHeight = "600px",
  workspaceId,
  spaceId,
  commandCenterMode = false,
}: MarketingClickUpTasklistProps) {
  const [tasks, setTasks] = useState<ClickUpTask[]>(mockTasks);
  const [filteredTasks, setFilteredTasks] = useState<ClickUpTask[]>(mockTasks);
  const [selectedPhase, setSelectedPhase] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter tasks based on phase and search
  useEffect(() => {
    let filtered = tasks;

    if (selectedPhase !== "all") {
      filtered = filtered.filter(task => task.phase === selectedPhase);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        task =>
          task.name.toLowerCase().includes(query) ||
          task.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, selectedPhase, searchQuery]);

  // Test ClickUp connection
  const testConnection = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConnected(true);
      toast.success("ClickUp connection established");
    } catch (error) {
      setConnected(false);
      toast.error("Failed to connect to ClickUp");
    } finally {
      setLoading(false);
    }
  };

  // Refresh tasks from ClickUp
  const refreshTasks = async () => {
    setIsRefreshing(true);
    try {
      // In real implementation, fetch from ClickUp API
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Tasks refreshed from ClickUp");
    } catch (error) {
      toast.error("Failed to refresh tasks");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      toast.success("Task status updated");
    } catch (error) {
      toast.error("Failed to update task status");
    }
  };

  // Get phase statistics
  const getPhaseStats = () => {
    const stats = CONTENT_PHASES.map(phase => ({
      ...phase,
      count: tasks.filter(task => task.phase === phase.id).length,
      completed: tasks.filter(
        task => task.phase === phase.id && task.status === "complete"
      ).length,
    }));
    return stats;
  };

  if (commandCenterMode) {
    // Special Command Center integration mode
    return (
      <div className={cn("space-y-6", className)}>
        {/* Content Phase Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {CONTENT_PHASES.map((phase, index) => {
            const phaseTasks = filteredTasks.filter(
              task => task.phase === phase.id
            );
            const Icon = phase.icon;

            return (
              <div key={phase.id} className="relative">
                <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn("p-2 rounded-lg", phase.color)}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-sm">
                        {phase.name}
                      </h3>
                      <p className="text-white/60 text-xs">
                        {phaseTasks.length} tasks
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {phaseTasks.slice(0, 3).map(task => (
                      <div key={task.id} className="bg-white/5 rounded-lg p-2">
                        <p className="text-white text-xs font-medium truncate">
                          {task.name}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full",
                              getPriorityColor(task.priority)
                            )}
                          />
                          <span className="text-white/60 text-xs">
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                    {phaseTasks.length > 3 && (
                      <div className="text-center">
                        <span className="text-white/60 text-xs">
                          +{phaseTasks.length - 3} more
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Connection line to next phase */}
                {index < CONTENT_PHASES.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-white/30 to-transparent transform -translate-y-1/2" />
                )}
              </div>
            );
          })}
        </div>

        {/* Active Tasks Quick View */}
        <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">Active Tasks</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshTasks}
                disabled={isRefreshing}
                className="text-white/70 hover:text-white"
              >
                <RefreshCw
                  className={cn("h-4 w-4", isRefreshing && "animate-spin")}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTasks
              .filter(
                task => task.status !== "completed" && task.status !== "closed"
              )
              .slice(0, 6)
              .map(task => (
                <div
                  key={task.id}
                  className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getContentTypeIcon(task.content_type || "blog")}
                      <span className="text-white font-medium text-sm">
                        {task.name}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {task.phase}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-xs",
                          getPriorityColor(task.priority)
                        )}
                      >
                        {task.priority}
                      </span>
                      {task.due_date && (
                        <span className="text-white/60 text-xs">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {task.progress && (
                      <div className="flex items-center gap-2">
                        <Progress value={task.progress} className="w-16 h-2" />
                        <span className="text-white/60 text-xs">
                          {task.progress}%
                        </span>
                      </div>
                    )}
                  </div>

                  {task.assignees.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      {task.assignees.slice(0, 3).map(assignee => (
                        <Avatar key={assignee.id} className="h-6 w-6">
                          <AvatarImage src={assignee.profilePicture} />
                          <AvatarFallback
                            className="text-xs"
                            style={{ backgroundColor: assignee.color }}
                          >
                            {assignee.initials}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {task.assignees.length > 3 && (
                        <span className="text-white/60 text-xs">
                          +{task.assignees.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  if (compactMode) {
    // Compact version for marketing command center
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Content Tasks</CardTitle>
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div
            className="space-y-2 px-6 pb-6 overflow-y-auto"
            style={{ maxHeight: maxHeight }}
          >
            {filteredTasks.slice(0, 5).map(task => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getContentTypeIcon(task.content_type || "blog")}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{task.name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded text-xs",
                          getPriorityColor(task.priority)
                        )}
                      >
                        {task.priority}
                      </span>
                      {task.due_date && (
                        <span>
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.assignees.slice(0, 2).map(assignee => (
                    <Avatar key={assignee.id} className="h-5 w-5">
                      <AvatarFallback
                        className="text-xs"
                        style={{ backgroundColor: assignee.color }}
                      >
                        {assignee.initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}

            {filteredTasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Geen taken gevonden</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full version
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Content Workflow</h2>
          <p className="text-gray-300">
            ClickUp integration voor content beheer
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={connected ? "default" : "secondary"}>
            {connected ? "Connected" : "Disconnected"}
          </Badge>
          <Button variant="outline" size="sm">
            <Zap className="h-4 w-4" />
            Connect ClickUp
          </Button>
        </div>
      </div>

      {/* Phase Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {CONTENT_PHASES.map(phase => {
          const Icon = phase.icon;
          const count = tasks.filter(task => task.phase === phase.id).length;
          return (
            <Card
              key={phase.id}
              className={cn(
                "cursor-pointer transition-all hover:scale-105",
                selectedPhase === phase.id && "ring-2 ring-primary"
              )}
              onClick={() =>
                setSelectedPhase(phase.id === selectedPhase ? "all" : phase.id)
              }
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={cn("p-2 rounded-full", phase.color)}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <Badge variant="outline">{count}</Badge>
                </div>
                <h3 className="font-medium text-sm">{phase.name}</h3>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map(task => (
          <Card
            key={task.id}
            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {getContentTypeIcon(task.content_type || "blog")}
                    <h3 className="font-medium">{task.name}</h3>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", getPriorityColor(task.priority))}
                    >
                      {task.priority}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {task.due_date &&
                        new Date(task.due_date).toLocaleDateString()}
                    </div>
                  </div>

                  {task.progress !== undefined && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-2" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
