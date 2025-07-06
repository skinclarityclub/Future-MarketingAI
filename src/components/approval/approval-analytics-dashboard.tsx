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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  FileText,
  Timer,
  Target,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  Filter,
  Search,
  Calendar,
  Globe,
  Shield,
  AlertTriangle,
  Info,
  RefreshCw,
  Settings,
  Eye,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Award,
  TrendingRight,
} from "lucide-react";

interface ApprovalMetrics {
  total_submissions: number;
  pending_approvals: number;
  approved_today: number;
  rejected_today: number;
  avg_approval_time_hours: number;
  approval_rate_percent: number;
  bottlenecks_detected: number;
  compliance_score: number;
  active_reviewers: number;
  overdue_approvals: number;
}

interface WorkflowPerformance {
  workflow_id: string;
  workflow_name: string;
  total_items: number;
  approved: number;
  rejected: number;
  pending: number;
  avg_time_hours: number;
  bottleneck_stage?: string;
  efficiency_score: number;
}

interface ApprovalTimelineData {
  date: string;
  submitted: number;
  approved: number;
  rejected: number;
  pending: number;
}

interface BottleneckAnalysis {
  stage_name: string;
  avg_wait_time_hours: number;
  pending_count: number;
  reviewer_workload: number;
  efficiency_rating: "excellent" | "good" | "fair" | "poor";
  recommendations: string[];
}

interface ReviewerPerformance {
  reviewer_id: string;
  reviewer_name: string;
  reviewer_avatar?: string;
  total_reviews: number;
  avg_response_time_hours: number;
  approval_rate: number;
  quality_score: number;
  workload_current: number;
  workload_capacity: number;
  specializations: string[];
  recent_activity: string;
}

interface ComplianceReport {
  report_id: string;
  report_type:
    | "audit_trail"
    | "sla_compliance"
    | "security_review"
    | "performance_review";
  period_start: string;
  period_end: string;
  compliance_score: number;
  total_violations: number;
  critical_issues: number;
  recommendations: string[];
  status: "compliant" | "non_compliant" | "warning";
}

export default function ApprovalAnalyticsDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [selectedWorkflow, setSelectedWorkflow] = useState("all");
  const [metrics, setMetrics] = useState<ApprovalMetrics | null>(null);
  const [workflowPerformance, setWorkflowPerformance] = useState<
    WorkflowPerformance[]
  >([]);
  const [timelineData, setTimelineData] = useState<ApprovalTimelineData[]>([]);
  const [bottlenecks, setBottlenecks] = useState<BottleneckAnalysis[]>([]);
  const [reviewerPerformance, setReviewerPerformance] = useState<
    ReviewerPerformance[]
  >([]);
  const [complianceReports, setComplianceReports] = useState<
    ComplianceReport[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeRange, selectedWorkflow]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Mock data - in real app would fetch from analytics API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading

      // Mock metrics
      setMetrics({
        total_submissions: 1247,
        pending_approvals: 89,
        approved_today: 34,
        rejected_today: 8,
        avg_approval_time_hours: 18.5,
        approval_rate_percent: 82.3,
        bottlenecks_detected: 3,
        compliance_score: 94.7,
        active_reviewers: 12,
        overdue_approvals: 15,
      });

      // Mock workflow performance
      setWorkflowPerformance([
        {
          workflow_id: "wf-marketing",
          workflow_name: "Marketing Content",
          total_items: 456,
          approved: 378,
          rejected: 45,
          pending: 33,
          avg_time_hours: 16.2,
          bottleneck_stage: "Legal Review",
          efficiency_score: 85,
        },
        {
          workflow_id: "wf-product",
          workflow_name: "Product Documentation",
          total_items: 234,
          approved: 198,
          rejected: 18,
          pending: 18,
          avg_time_hours: 22.4,
          efficiency_score: 78,
        },
        {
          workflow_id: "wf-sales",
          workflow_name: "Sales Materials",
          total_items: 189,
          approved: 165,
          rejected: 12,
          pending: 12,
          avg_time_hours: 14.8,
          efficiency_score: 92,
        },
      ]);

      // Mock timeline data
      setTimelineData([
        {
          date: "2025-06-14",
          submitted: 45,
          approved: 32,
          rejected: 8,
          pending: 5,
        },
        {
          date: "2025-06-15",
          submitted: 52,
          approved: 38,
          rejected: 6,
          pending: 8,
        },
        {
          date: "2025-06-16",
          submitted: 38,
          approved: 29,
          rejected: 4,
          pending: 5,
        },
        {
          date: "2025-06-17",
          submitted: 61,
          approved: 45,
          rejected: 9,
          pending: 7,
        },
        {
          date: "2025-06-18",
          submitted: 47,
          approved: 34,
          rejected: 5,
          pending: 8,
        },
        {
          date: "2025-06-19",
          submitted: 55,
          approved: 41,
          rejected: 7,
          pending: 7,
        },
        {
          date: "2025-06-20",
          submitted: 49,
          approved: 36,
          rejected: 6,
          pending: 7,
        },
      ]);

      // Mock bottleneck analysis
      setBottlenecks([
        {
          stage_name: "Legal Review",
          avg_wait_time_hours: 45.2,
          pending_count: 23,
          reviewer_workload: 156,
          efficiency_rating: "poor",
          recommendations: [
            "Add 2 additional legal reviewers",
            "Implement content pre-screening",
            "Create legal review templates",
          ],
        },
        {
          stage_name: "Brand Compliance",
          avg_wait_time_hours: 28.7,
          pending_count: 15,
          reviewer_workload: 89,
          efficiency_rating: "fair",
          recommendations: [
            "Automated brand guideline checking",
            "Reviewer training program",
          ],
        },
        {
          stage_name: "Final Approval",
          avg_wait_time_hours: 12.3,
          pending_count: 8,
          reviewer_workload: 34,
          efficiency_rating: "good",
          recommendations: [
            "Delegate approval authority",
            "Set up approval escalation",
          ],
        },
      ]);

      // Mock reviewer performance
      setReviewerPerformance([
        {
          reviewer_id: "rev-001",
          reviewer_name: "Sarah Johnson",
          reviewer_avatar: "/avatars/sarah.jpg",
          total_reviews: 145,
          avg_response_time_hours: 12.5,
          approval_rate: 87.2,
          quality_score: 94.5,
          workload_current: 23,
          workload_capacity: 30,
          specializations: ["Marketing", "Brand"],
          recent_activity: "2 hours ago",
        },
        {
          reviewer_id: "rev-002",
          reviewer_name: "Mike Chen",
          reviewer_avatar: "/avatars/mike.jpg",
          total_reviews: 167,
          avg_response_time_hours: 8.9,
          approval_rate: 91.5,
          quality_score: 96.8,
          workload_current: 18,
          workload_capacity: 25,
          specializations: ["Technical", "Product"],
          recent_activity: "45 minutes ago",
        },
        {
          reviewer_id: "rev-003",
          reviewer_name: "Emma Wilson",
          reviewer_avatar: "/avatars/emma.jpg",
          total_reviews: 89,
          avg_response_time_hours: 28.3,
          approval_rate: 74.6,
          quality_score: 82.4,
          workload_current: 31,
          workload_capacity: 20,
          specializations: ["Legal", "Compliance"],
          recent_activity: "4 hours ago",
        },
      ]);

      // Mock compliance reports
      setComplianceReports([
        {
          report_id: "comp-001",
          report_type: "audit_trail",
          period_start: "2025-06-01",
          period_end: "2025-06-20",
          compliance_score: 94.7,
          total_violations: 12,
          critical_issues: 2,
          recommendations: [
            "Improve documentation standards",
            "Enhance audit logging",
            "Regular compliance training",
          ],
          status: "compliant",
        },
        {
          report_id: "comp-002",
          report_type: "sla_compliance",
          period_start: "2025-06-01",
          period_end: "2025-06-20",
          compliance_score: 89.3,
          total_violations: 23,
          critical_issues: 5,
          recommendations: [
            "Reduce approval bottlenecks",
            "Automate routine approvals",
            "Set realistic SLA targets",
          ],
          status: "warning",
        },
      ]);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (hours: number) => {
    if (hours < 24) return `${hours.toFixed(1)}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours.toFixed(0)}h`;
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getEfficiencyBgColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 80) return "bg-blue-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "text-green-600 bg-green-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "non_compliant":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Approval Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Enterprise workflow performance, compliance monitoring, and
              bottleneck analysis
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 lg:mt-0">
            <Select
              value={selectedTimeRange}
              onValueChange={setSelectedTimeRange}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedWorkflow}
              onValueChange={setSelectedWorkflow}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workflows</SelectItem>
                <SelectItem value="wf-marketing">Marketing Content</SelectItem>
                <SelectItem value="wf-product">
                  Product Documentation
                </SelectItem>
                <SelectItem value="wf-sales">Sales Materials</SelectItem>
              </SelectContent>
            </Select>

            <NormalButton variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </NormalButton>

            <NormalButton
              variant="outline"
              className="gap-2"
              onClick={loadAnalyticsData}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </NormalButton>
          </div>
        </div>

        {/* Key Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Submissions</p>
                    <p className="text-2xl font-bold">
                      {metrics.total_submissions.toLocaleString()}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-200" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">+12% from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Approval Rate</p>
                    <p className="text-2xl font-bold">
                      {metrics.approval_rate_percent}%
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-200" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">+5.2% improvement</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Avg Response Time</p>
                    <p className="text-2xl font-bold">
                      {formatTime(metrics.avg_approval_time_hours)}
                    </p>
                  </div>
                  <Timer className="h-8 w-8 text-orange-200" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm">-2.1h faster</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Active Reviewers</p>
                    <p className="text-2xl font-bold">
                      {metrics.active_reviewers}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-purple-200" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm">
                    {metrics.pending_approvals} pending
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Bottlenecks</p>
                    <p className="text-2xl font-bold">
                      {metrics.bottlenecks_detected}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-200" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    {metrics.overdue_approvals} overdue
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Analytics Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="bottlenecks">Bottlenecks</TabsTrigger>
            <TabsTrigger value="reviewers">Reviewers</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Approval Timeline Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Approval Timeline
                  </CardTitle>
                  <CardDescription>
                    Daily approval activity over the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="submitted"
                        fill="#3b82f6"
                        name="Submitted"
                      />
                      <Bar dataKey="approved" fill="#10b981" name="Approved" />
                      <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
                      <Line
                        type="monotone"
                        dataKey="pending"
                        stroke="#f59e0b"
                        name="Pending"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Workflow Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Workflow Distribution
                  </CardTitle>
                  <CardDescription>
                    Approval volume by workflow type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={workflowPerformance}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total_items"
                      >
                        {workflowPerformance.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest approval workflow activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      type: "approved",
                      user: "Sarah Johnson",
                      content: "Q4 Marketing Campaign",
                      time: "5 minutes ago",
                    },
                    {
                      type: "submitted",
                      user: "Mike Chen",
                      content: "Product Launch Guide",
                      time: "12 minutes ago",
                    },
                    {
                      type: "rejected",
                      user: "Emma Wilson",
                      content: "Legal Disclaimer Update",
                      time: "1 hour ago",
                    },
                    {
                      type: "approved",
                      user: "David Kim",
                      content: "Sales Presentation Template",
                      time: "2 hours ago",
                    },
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <div
                        className={`p-2 rounded-full ${
                          activity.type === "approved"
                            ? "bg-green-100 text-green-600"
                            : activity.type === "rejected"
                              ? "bg-red-100 text-red-600"
                              : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {activity.type === "approved" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : activity.type === "rejected" ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {activity.user} {activity.type} "{activity.content}"
                        </p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Workflow Performance Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Performance Analysis</CardTitle>
                  <CardDescription>
                    Detailed performance metrics for each approval workflow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Workflow</th>
                          <th className="text-left p-3">Total Items</th>
                          <th className="text-left p-3">Success Rate</th>
                          <th className="text-left p-3">Avg Time</th>
                          <th className="text-left p-3">Efficiency</th>
                          <th className="text-left p-3">Bottleneck</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workflowPerformance.map((workflow, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <div>
                                <p className="font-medium">
                                  {workflow.workflow_name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {workflow.workflow_id}
                                </p>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {workflow.total_items}
                                </span>
                                <div className="flex gap-1">
                                  <Badge variant="outline" className="text-xs">
                                    {workflow.approved} ✓
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {workflow.rejected} ✗
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {workflow.pending} ⏳
                                  </Badge>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={
                                    (workflow.approved / workflow.total_items) *
                                    100
                                  }
                                  className="w-20 h-2"
                                />
                                <span className="text-sm font-medium">
                                  {(
                                    (workflow.approved / workflow.total_items) *
                                    100
                                  ).toFixed(1)}
                                  %
                                </span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="font-medium">
                                {formatTime(workflow.avg_time_hours)}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${getEfficiencyBgColor(workflow.efficiency_score)}`}
                                />
                                <span
                                  className={`font-medium ${getEfficiencyColor(workflow.efficiency_score)}`}
                                >
                                  {workflow.efficiency_score}%
                                </span>
                              </div>
                            </td>
                            <td className="p-3">
                              {workflow.bottleneck_stage ? (
                                <Badge
                                  variant="outline"
                                  className="text-red-600 border-red-200"
                                >
                                  {workflow.bottleneck_stage}
                                </Badge>
                              ) : (
                                <span className="text-gray-400">
                                  None detected
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bottlenecks Tab */}
          <TabsContent value="bottlenecks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {bottlenecks.map((bottleneck, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        {bottleneck.stage_name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={
                          bottleneck.efficiency_rating === "excellent"
                            ? "text-green-600 border-green-200"
                            : bottleneck.efficiency_rating === "good"
                              ? "text-blue-600 border-blue-200"
                              : bottleneck.efficiency_rating === "fair"
                                ? "text-yellow-600 border-yellow-200"
                                : "text-red-600 border-red-200"
                        }
                      >
                        {bottleneck.efficiency_rating}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Avg Wait Time</p>
                        <p className="text-lg font-semibold text-red-600">
                          {formatTime(bottleneck.avg_wait_time_hours)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Pending Items</p>
                        <p className="text-lg font-semibold">
                          {bottleneck.pending_count}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-2">
                        Reviewer Workload
                      </p>
                      <Progress
                        value={(bottleneck.reviewer_workload / 200) * 100}
                        className="h-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {bottleneck.reviewer_workload} items
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">
                        Recommendations:
                      </p>
                      <ul className="space-y-1">
                        {bottleneck.recommendations.map((rec, recIndex) => (
                          <li
                            key={recIndex}
                            className="text-sm text-gray-600 flex items-start gap-2"
                          >
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reviewers Tab */}
          <TabsContent value="reviewers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {reviewerPerformance.map((reviewer, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={reviewer.reviewer_avatar} />
                        <AvatarFallback>
                          {reviewer.reviewer_name
                            .split(" ")
                            .map(n => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          {reviewer.reviewer_name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          Active {reviewer.recent_activity}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">
                          {reviewer.total_reviews}
                        </p>
                        <p className="text-xs text-gray-500">Total Reviews</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {reviewer.approval_rate}%
                        </p>
                        <p className="text-xs text-gray-500">Approval Rate</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Response Time</span>
                        <span className="font-medium">
                          {formatTime(reviewer.avg_response_time_hours)}
                        </span>
                      </div>
                      <Progress
                        value={Math.max(
                          0,
                          100 - (reviewer.avg_response_time_hours / 48) * 100
                        )}
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Current Workload</span>
                        <span className="font-medium">
                          {reviewer.workload_current}/
                          {reviewer.workload_capacity}
                        </span>
                      </div>
                      <Progress
                        value={
                          (reviewer.workload_current /
                            reviewer.workload_capacity) *
                          100
                        }
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Quality Score</span>
                        <span
                          className={`font-medium ${getEfficiencyColor(reviewer.quality_score)}`}
                        >
                          {reviewer.quality_score}%
                        </span>
                      </div>
                      <Progress
                        value={reviewer.quality_score}
                        className="h-2"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">
                        Specializations:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {reviewer.specializations.map((spec, specIndex) => (
                          <Badge
                            key={specIndex}
                            variant="outline"
                            className="text-xs"
                          >
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Compliance Score Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Compliance Overview
                  </CardTitle>
                  <CardDescription>
                    Overall compliance status and key metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {metrics?.compliance_score}%
                      </div>
                      <p className="text-sm text-gray-500">Overall Score</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {complianceReports.reduce(
                          (acc, r) => acc + r.total_violations,
                          0
                        )}
                      </div>
                      <p className="text-sm text-gray-500">Total Violations</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {complianceReports.reduce(
                          (acc, r) => acc + r.critical_issues,
                          0
                        )}
                      </div>
                      <p className="text-sm text-gray-500">Critical Issues</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">
                        {
                          complianceReports.filter(r => r.status === "warning")
                            .length
                        }
                      </div>
                      <p className="text-sm text-gray-500">Warnings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Reports */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {complianceReports.map((report, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="capitalize">
                          {report.report_type.replace("_", " ")} Report
                        </CardTitle>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        {report.period_start} to {report.period_end}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Compliance Score</span>
                          <span className="font-medium">
                            {report.compliance_score}%
                          </span>
                        </div>
                        <Progress
                          value={report.compliance_score}
                          className="h-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-lg font-semibold text-orange-600">
                            {report.total_violations}
                          </p>
                          <p className="text-xs text-gray-500">
                            Total Violations
                          </p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-red-600">
                            {report.critical_issues}
                          </p>
                          <p className="text-xs text-gray-500">
                            Critical Issues
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">
                          Key Recommendations:
                        </p>
                        <ul className="space-y-1">
                          {report.recommendations
                            .slice(0, 3)
                            .map((rec, recIndex) => (
                              <li
                                key={recIndex}
                                className="text-sm text-gray-600 flex items-start gap-2"
                              >
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                        </ul>
                      </div>

                      <NormalButton variant="outline" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Report
                      </NormalButton>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
