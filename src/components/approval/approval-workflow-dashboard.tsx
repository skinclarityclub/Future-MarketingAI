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
import NormalButton from "@/components/ui/normal-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  FileText,
  MessageSquare,
  Calendar,
  Zap,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  AlertCircle,
  Bypass,
} from "lucide-react";

interface ApprovalWorkflowItem {
  id: string;
  title: string;
  content_type: string;
  content_preview: string;
  status: string;
  priority: "low" | "medium" | "high" | "urgent" | "emergency";
  submitted_by: string;
  submitted_at: string;
  due_date?: string;
  escalation_date?: string;
  current_level: number;
  total_levels: number;
  approval_history: ApprovalStep[];
  tags: string[];
  compliance_flags: string[];
}

interface ApprovalStep {
  id: string;
  level: number;
  approver_name: string;
  approver_role: string;
  status: "pending" | "approved" | "rejected";
  action_date?: string;
  feedback?: string;
  annotations: ApprovalAnnotation[];
}

interface ApprovalAnnotation {
  id: string;
  annotation_text: string;
  annotation_type: "comment" | "suggestion" | "correction";
  created_by: string;
  created_at: string;
  resolved: boolean;
}

interface ApprovalAnalytics {
  total_submissions: number;
  pending_approvals: number;
  approval_rate: number;
  average_approval_time_hours: number;
  escalation_rate: number;
  sla_compliance_rate: number;
  workflow_efficiency_score: number;
  bottleneck_analysis: BottleneckMetric[];
  approver_performance: ApproverMetric[];
}

interface BottleneckMetric {
  level: number;
  level_name: string;
  average_time_hours: number;
  pending_count: number;
  escalation_count: number;
  efficiency_score: number;
}

interface ApproverMetric {
  approver_id: string;
  approver_name: string;
  total_assigned: number;
  total_completed: number;
  average_response_time_hours: number;
  approval_rate: number;
  quality_score: number;
}

export default function ApprovalWorkflowDashboard() {
  const [workflowItems, setWorkflowItems] = useState<ApprovalWorkflowItem[]>(
    []
  );
  const [analytics, setAnalytics] = useState<ApprovalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchWorkflowData();
    fetchAnalytics();
  }, []);

  const fetchWorkflowData = async () => {
    try {
      const response = await fetch(
        "/api/approval-workflow?action=get_pending_approvals"
      );
      const data = await response.json();
      if (data.success) {
        setWorkflowItems(data.data.workflow_items || []);
      }
    } catch (error) {
      console.error("Error fetching workflow data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        "/api/approval-workflow?action=get_analytics"
      );
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const handleApprovalDecision = async (
    workflowItemId: string,
    decision: "approve" | "reject" | "request_revision",
    feedback?: string
  ) => {
    try {
      const response = await fetch("/api/approval-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "process_approval_decision",
          workflow_item_id: workflowItemId,
          approver_id: "current-user", // In real app, get from auth
          decision,
          feedback,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchWorkflowData();
        await fetchAnalytics();
      }
    } catch (error) {
      console.error("Error processing approval decision:", error);
    }
  };

  const handleBulkApproval = async (
    itemIds: string[],
    decision: "approve" | "reject"
  ) => {
    try {
      const response = await fetch("/api/approval-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: decision === "approve" ? "bulk_approve" : "bulk_reject",
          item_ids: itemIds,
          approver_id: "current-user",
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchWorkflowData();
        await fetchAnalytics();
      }
    } catch (error) {
      console.error("Error processing bulk operation:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "emergency":
        return "bg-red-500";
      case "urgent":
        return "bg-orange-500";
      case "high":
        return "bg-yellow-500";
      case "medium":
        return "bg-blue-500";
      case "low":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending_approval":
        return <Clock className="h-4 w-4 text-orange-500" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "escalated":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "needs_revision":
        return <RotateCcw className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const isOverdue = (dueDateString?: string) => {
    if (!dueDateString) return false;
    return new Date(dueDateString) < new Date();
  };

  const filteredItems = workflowItems.filter(item => {
    const matchesStatus =
      selectedStatus === "all" || item.status === selectedStatus;
    const matchesPriority =
      selectedPriority === "all" || item.priority === selectedPriority;
    const matchesSearch =
      searchTerm === "" ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content_preview.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Approval Workflow Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage content approvals and workflow processes
            </p>
          </div>
          <div className="flex space-x-3">
            <NormalButton
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </NormalButton>
            <NormalButton className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Bulk Actions</span>
            </NormalButton>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Submissions
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.total_submissions}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Approvals
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.pending_approvals}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requires attention
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Approval Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.approval_rate.toFixed(1)}%
                </div>
                <Progress value={analytics.approval_rate} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Response Time
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.average_approval_time_hours.toFixed(1)}h
                </div>
                <p className="text-xs text-muted-foreground">
                  -8% from last week
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            {/* Filters */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle>Filter & Search</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search content..."
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="in_review">In Review</option>
                    <option value="escalated">Escalated</option>
                    <option value="needs_revision">Needs Revision</option>
                  </select>
                  <select
                    value={selectedPriority}
                    onChange={e => setSelectedPriority(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Priority</option>
                    <option value="emergency">Emergency</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Workflow Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredItems.map(item => (
                <Card
                  key={item.id}
                  className="bg-white shadow-lg hover:shadow-xl transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {item.content_type} • Level {item.current_level}/
                          {item.total_levels}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={`${getPriorityColor(item.priority)} text-white`}
                        >
                          {item.priority}
                        </Badge>
                        {getStatusIcon(item.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.content_preview}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map(tag => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Compliance Flags */}
                    {item.compliance_flags.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-yellow-600">
                          {item.compliance_flags.join(", ")}
                        </span>
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Submitted {formatTimeAgo(item.submitted_at)}</span>
                      {item.due_date && (
                        <span
                          className={
                            isOverdue(item.due_date) ? "text-red-500" : ""
                          }
                        >
                          Due {formatTimeAgo(item.due_date)}
                        </span>
                      )}
                    </div>

                    {/* Approval History */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Approval Progress</h4>
                      <div className="space-y-1">
                        {item.approval_history.map((step, index) => (
                          <div
                            key={step.id}
                            className="flex items-center space-x-2"
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                step.status === "approved"
                                  ? "bg-green-500"
                                  : step.status === "rejected"
                                    ? "bg-red-500"
                                    : "bg-yellow-500"
                              }`}
                            />
                            <span className="text-sm">
                              {step.approver_name} ({step.approver_role})
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {step.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <Separator />
                    <div className="flex justify-between items-center">
                      <NormalButton
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </NormalButton>
                      <div className="flex space-x-2">
                        <NormalButton
                          size="sm"
                          onClick={() =>
                            handleApprovalDecision(item.id, "approve")
                          }
                          className="flex items-center space-x-1 bg-green-600 hover:bg-green-700"
                        >
                          <ThumbsUp className="h-3 w-3" />
                          <span>Approve</span>
                        </NormalButton>
                        <NormalButton
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleApprovalDecision(item.id, "request_revision")
                          }
                          className="flex items-center space-x-1"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Revise</span>
                        </NormalButton>
                        <NormalButton
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleApprovalDecision(item.id, "reject")
                          }
                          className="flex items-center space-x-1"
                        >
                          <ThumbsDown className="h-3 w-3" />
                          <span>Reject</span>
                        </NormalButton>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <Card className="bg-white shadow-lg">
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">
                    No items found
                  </h3>
                  <p className="text-gray-500 mt-2">
                    Try adjusting your filters or search terms
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bottleneck Analysis */}
                <Card className="bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle>Bottleneck Analysis</CardTitle>
                    <CardDescription>
                      Identify workflow bottlenecks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.bottleneck_analysis.map(bottleneck => (
                        <div key={bottleneck.level} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              {bottleneck.level_name}
                            </span>
                            <span className="text-sm text-gray-500">
                              {bottleneck.average_time_hours.toFixed(1)}h avg
                            </span>
                          </div>
                          <Progress
                            value={bottleneck.efficiency_score}
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{bottleneck.pending_count} pending</span>
                            <span>{bottleneck.escalation_count} escalated</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Approver Performance */}
                <Card className="bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle>Approver Performance</CardTitle>
                    <CardDescription>
                      Individual approver metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-4">
                        {analytics.approver_performance.map(approver => (
                          <div key={approver.approver_id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {approver.approver_name
                                      .split(" ")
                                      .map(n => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">
                                  {approver.approver_name}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">
                                  {approver.approval_rate.toFixed(1)}%
                                </div>
                                <div className="text-xs text-gray-500">
                                  {approver.average_response_time_hours.toFixed(
                                    1
                                  )}
                                  h avg
                                </div>
                              </div>
                            </div>
                            <Progress
                              value={approver.quality_score}
                              className="h-1"
                            />
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="workflows" className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle>Workflow Templates</CardTitle>
                <CardDescription>
                  Manage approval workflow templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  Workflow template management coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle>Workflow Settings</CardTitle>
                <CardDescription>
                  Configure approval workflow settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  Workflow settings coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
