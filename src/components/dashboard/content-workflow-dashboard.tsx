"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FileText,
  Clock,
  Plus,
  ArrowRight,
  Target,
  BarChart3,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

interface ContentItem {
  id: string;
  title: string;
  description?: string;
  content_type: string;
  workflow_phase: string;
  priority: "low" | "medium" | "high" | "urgent";
  created_by: string;
  assigned_to?: string;
  due_date?: string;
  clickup_task_id?: string;
  clickup_list_id?: string;
  created_at: string;
  updated_at: string;
}

export default function ContentWorkflowDashboard() {
  const [loading, setLoading] = useState(false);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<string>("all");

  useEffect(() => {
    loadContentData();
  }, []);

  const loadContentData = async () => {
    setLoading(true);
    try {
      const mockItems: ContentItem[] = [
        {
          id: "1",
          title: "Q4 Marketing Campaign Blog Post",
          description: "Create comprehensive blog post for Q4 campaign",
          content_type: "blog_post",
          workflow_phase: "creation",
          priority: "high",
          created_by: "user-1",
          assigned_to: "content-creator-1",
          due_date: "2025-01-15T10:00:00Z",
          clickup_task_id: "click-123",
          clickup_list_id: "list-456",
          created_at: "2025-01-10T09:00:00Z",
          updated_at: "2025-01-10T09:00:00Z",
        },
        {
          id: "2",
          title: "Social Media Content Pack",
          description: "Create 10 social media posts for weekly campaign",
          content_type: "social_media",
          workflow_phase: "review",
          priority: "medium",
          created_by: "user-2",
          assigned_to: "social-media-manager",
          due_date: "2025-01-20T15:00:00Z",
          created_at: "2025-01-08T14:00:00Z",
          updated_at: "2025-01-12T16:30:00Z",
        },
        {
          id: "3",
          title: "Product Demo Video",
          description: "Create product demonstration video for website",
          content_type: "video",
          workflow_phase: "planning",
          priority: "high",
          created_by: "user-3",
          assigned_to: "video-producer",
          due_date: "2025-01-25T12:00:00Z",
          created_at: "2025-01-11T11:00:00Z",
          updated_at: "2025-01-11T11:00:00Z",
        },
      ];

      setContentItems(mockItems);
      toast.success("Content workflow data loaded successfully");
    } catch (error) {
      console.error("Error loading content data:", error);
      toast.error("Failed to load content workflow data");
    } finally {
      setLoading(false);
    }
  };

  const getPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      planning: "bg-gray-100 text-gray-800",
      creation: "bg-blue-100 text-blue-800",
      review: "bg-yellow-100 text-yellow-800",
      approval: "bg-orange-100 text-orange-800",
      publication: "bg-purple-100 text-purple-800",
      published: "bg-green-100 text-green-800",
      archived: "bg-slate-100 text-slate-800",
    };
    return colors[phase] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "text-green-600",
      medium: "text-yellow-600",
      high: "text-orange-600",
      urgent: "text-red-600",
    };
    return colors[priority] || "text-gray-600";
  };

  const filteredItems = contentItems.filter(item => {
    return selectedPhase === "all" || item.workflow_phase === selectedPhase;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading content workflow data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Workflow Dashboard</h1>
          <p className="text-muted-foreground">
            Track content through workflow phases and manage assignments
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <NormalButton onClick={loadContentData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </NormalButton>
          <NormalButton variant="default" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Content
          </NormalButton>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Items</span>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-2xl font-bold">{contentItems.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">In Progress</span>
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {
                contentItems.filter(i =>
                  ["creation", "review"].includes(i.workflow_phase)
                ).length
              }
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Published</span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-600">
              {
                contentItems.filter(i => i.workflow_phase === "published")
                  .length
              }
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overdue</span>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <span className="text-2xl font-bold text-red-600">
              {
                contentItems.filter(
                  i =>
                    i.due_date &&
                    new Date(i.due_date) < new Date() &&
                    !["published", "archived"].includes(i.workflow_phase)
                ).length
              }
            </span>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pipeline" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pipeline">Content Pipeline</TabsTrigger>
          <TabsTrigger value="phases">By Phase</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filter by phase:</span>
            </div>
            <select
              value={selectedPhase}
              onChange={e => setSelectedPhase(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="all">All Phases</option>
              <option value="planning">Planning</option>
              <option value="creation">Creation</option>
              <option value="review">Review</option>
              <option value="approval">Approval</option>
              <option value="publication">Publication</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Content Items List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredItems.map(item => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4" />
                        <h3 className="font-medium">{item.title}</h3>
                        <Badge className={getPhaseColor(item.workflow_phase)}>
                          {item.workflow_phase.replace("_", " ")}
                        </Badge>
                        <div
                          className={`flex items-center space-x-1 ${getPriorityColor(item.priority)}`}
                        >
                          <Target className="h-4 w-4" />
                          <span className="text-sm capitalize">
                            {item.priority}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>

                      <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
                        <span>
                          Assigned to: {item.assigned_to || "Unassigned"}
                        </span>
                        {item.due_date && (
                          <span>
                            Due: {new Date(item.due_date).toLocaleDateString()}
                          </span>
                        )}
                        {item.clickup_task_id && (
                          <Badge variant="outline" className="text-xs">
                            ClickUp: {item.clickup_task_id}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <NormalButton
                        variant="outline"
                        size="sm"
                        disabled={item.workflow_phase === "published"}
                      >
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Next Phase
                      </NormalButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="phases" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "planning",
              "creation",
              "review",
              "approval",
              "publication",
              "published",
            ].map(phase => {
              const count = contentItems.filter(
                i => i.workflow_phase === phase
              ).length;
              return (
                <Card key={phase}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm capitalize">
                      {phase.replace("_", " ")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{count}</div>
                    <Progress
                      value={
                        contentItems.length > 0
                          ? (count / contentItems.length) * 100
                          : 0
                      }
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {contentItems.length > 0
                        ? ((count / contentItems.length) * 100).toFixed(1)
                        : 0}
                      % of total
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Detailed analytics coming soon
                </p>
                <p className="text-sm text-muted-foreground">
                  Track completion times, bottlenecks, and efficiency metrics
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
