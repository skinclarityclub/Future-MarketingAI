"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Activity,
  BarChart3,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  Play,
  Pause,
  Plus,
  Settings,
  Target,
  TrendingUp,
  TrendingDown,
  Users,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  RefreshCw,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Download,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Types for Campaign Performance Tracking
interface ABTest {
  id: string;
  name: string;
  campaign_id: string;
  status: "draft" | "running" | "completed" | "paused";
  variants: ABVariant[];
  test_type: "subject_line" | "content" | "creative" | "audience" | "timing";
  start_date: Date;
  end_date?: Date;
  sample_size: number;
  significance_level: number;
  current_significance?: number;
  confidence_level?: number;
  winner?: string;
  created_at: Date;
  updated_at: Date;
}

interface ABVariant {
  id: string;
  name: string;
  traffic_split: number;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    conversion_rate: number;
    cost: number;
    revenue: number;
    roi: number;
  };
  content?: {
    subject_line?: string;
    headline?: string;
    description?: string;
    cta_text?: string;
    creative_url?: string;
  };
}

interface CampaignMetrics {
  id: string;
  name: string;
  status: "active" | "paused" | "completed" | "draft";
  platform: string;
  start_date: Date;
  end_date?: Date;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  conversion_rate: number;
  cpa: number;
  roas: number;
  roi: number;
  ab_tests: ABTest[];
  approval_status: "pending" | "approved" | "rejected" | "needs_review";
  last_updated: Date;
}

interface ContentApproval {
  id: string;
  campaign_id: string;
  content_type: "creative" | "copy" | "subject_line" | "landing_page";
  content_preview: string;
  status: "pending" | "approved" | "rejected" | "needs_revision";
  submitted_by: string;
  submitted_at: Date;
  reviewed_by?: string;
  reviewed_at?: Date;
  feedback?: string;
  revision_count: number;
  auto_approval_eligible: boolean;
  approval_rules_met: string[];
  approval_rules_failed: string[];
}

// Mock data
const mockCampaigns: CampaignMetrics[] = [
  {
    id: "camp-001",
    name: "Summer Sale 2024",
    status: "active",
    platform: "Google Ads",
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    budget: 50000,
    spent: 35420,
    impressions: 124580,
    clicks: 3847,
    conversions: 156,
    ctr: 3.09,
    conversion_rate: 4.05,
    cpa: 227.05,
    roas: 4.2,
    roi: 320,
    ab_tests: [],
    approval_status: "approved",
    last_updated: new Date(),
  },
  {
    id: "camp-002",
    name: "Brand Awareness Q3",
    status: "active",
    platform: "Facebook Ads",
    start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    budget: 25000,
    spent: 18340,
    impressions: 89230,
    clicks: 2156,
    conversions: 78,
    ctr: 2.42,
    conversion_rate: 3.62,
    cpa: 235.13,
    roas: 3.8,
    roi: 280,
    ab_tests: [],
    approval_status: "approved",
    last_updated: new Date(),
  },
];

const mockABTests: ABTest[] = [
  {
    id: "ab-001",
    name: "Subject Line Test - Summer Sale",
    campaign_id: "camp-001",
    status: "running",
    test_type: "subject_line",
    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    sample_size: 10000,
    significance_level: 95,
    current_significance: 87,
    confidence_level: 92,
    created_at: new Date(),
    updated_at: new Date(),
    variants: [
      {
        id: "var-001",
        name: "Control",
        traffic_split: 50,
        metrics: {
          impressions: 5000,
          clicks: 185,
          conversions: 12,
          ctr: 3.7,
          conversion_rate: 6.49,
          cost: 890,
          revenue: 2340,
          roi: 162.9,
        },
        content: {
          subject_line: "🌞 Summer Sale - Save up to 50%!",
        },
      },
      {
        id: "var-002",
        name: "Variant A",
        traffic_split: 50,
        metrics: {
          impressions: 5000,
          clicks: 202,
          conversions: 16,
          ctr: 4.04,
          conversion_rate: 7.92,
          cost: 870,
          revenue: 3120,
          roi: 258.6,
        },
        content: {
          subject_line: "Limited Time: 50% Off Everything!",
        },
      },
    ],
  },
];

const mockApprovals: ContentApproval[] = [
  {
    id: "app-001",
    campaign_id: "camp-001",
    content_type: "creative",
    content_preview: "Summer sale banner with bright colors and 50% off text",
    status: "pending",
    submitted_by: "Design Team",
    submitted_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
    revision_count: 0,
    auto_approval_eligible: false,
    approval_rules_met: ["Brand guidelines", "Size requirements"],
    approval_rules_failed: ["Legal disclaimer missing"],
  },
  {
    id: "app-002",
    campaign_id: "camp-002",
    content_type: "copy",
    content_preview: "Discover our premium products with exclusive features...",
    status: "approved",
    submitted_by: "Content Team",
    submitted_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
    reviewed_by: "Marketing Manager",
    reviewed_at: new Date(Date.now() - 20 * 60 * 60 * 1000),
    feedback: "Looks great! Approved for publication.",
    revision_count: 1,
    auto_approval_eligible: true,
    approval_rules_met: [
      "Brand voice",
      "Legal compliance",
      "Length requirements",
    ],
    approval_rules_failed: [],
  },
];

export default function CampaignPerformanceTracker() {
  const [campaigns, setCampaigns] = useState<CampaignMetrics[]>(mockCampaigns);
  const [abTests, setABTests] = useState<ABTest[]>(mockABTests);
  const [approvals, setApprovals] = useState<ContentApproval[]>(mockApprovals);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [isCreateABTestOpen, setIsCreateABTestOpen] = useState(false);
  const [isCreateApprovalOpen, setIsCreateApprovalOpen] = useState(false);

  // Filter data based on selected campaign
  const filteredABTests =
    selectedCampaign === "all"
      ? abTests
      : abTests.filter(test => test.campaign_id === selectedCampaign);

  const filteredApprovals =
    selectedCampaign === "all"
      ? approvals
      : approvals.filter(approval => approval.campaign_id === selectedCampaign);

  const handleApproveContent = (approvalId: string) => {
    setApprovals(prev =>
      prev.map(approval =>
        approval.id === approvalId
          ? {
              ...approval,
              status: "approved",
              reviewed_by: "Current User",
              reviewed_at: new Date(),
              feedback: "Approved",
            }
          : approval
      )
    );
  };

  const handleRejectContent = (approvalId: string, feedback: string) => {
    setApprovals(prev =>
      prev.map(approval =>
        approval.id === approvalId
          ? {
              ...approval,
              status: "rejected",
              reviewed_by: "Current User",
              reviewed_at: new Date(),
              feedback,
            }
          : approval
      )
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number, decimals = 1) => {
    return `${value.toFixed(decimals)}%`;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      running: "default",
      approved: "default",
      completed: "secondary",
      paused: "secondary",
      pending: "outline",
      draft: "outline",
      rejected: "destructive",
      needs_review: "destructive",
    };

    return variants[status as keyof typeof variants] || "outline";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: "text-green-600",
      running: "text-blue-600",
      approved: "text-green-600",
      completed: "text-gray-600",
      paused: "text-yellow-600",
      pending: "text-orange-600",
      draft: "text-gray-600",
      rejected: "text-red-600",
      needs_review: "text-red-600",
    };

    return colors[status as keyof typeof colors] || "text-gray-600";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Campaign Performance Tracking
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor campaigns, A/B tests, and content approvals
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select campaign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              {campaigns.map(campaign => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <NormalButton
            onClick={() => setLoading(!loading)}
            variant="secondary"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </NormalButton>
        </div>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="abtests">A/B Tests</TabsTrigger>
          <TabsTrigger value="approvals">Content Approvals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Active Campaigns
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {campaigns.filter(c => c.status === "active").length}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-green-600">12% vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Running A/B Tests
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {abTests.filter(t => t.status === "running").length}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-green-600">8% vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Pending Approvals
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {approvals.filter(a => a.status === "pending").length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-red-600">2% vs last week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Avg Campaign ROI
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPercentage(
                        campaigns.reduce((sum, c) => sum + c.roi, 0) /
                          campaigns.length
                      )}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-green-600">15% vs last month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Campaign Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">
                        Campaign
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        Budget
                      </th>
                      <th className="text-left py-3 px-4 font-medium">Spent</th>
                      <th className="text-left py-3 px-4 font-medium">ROAS</th>
                      <th className="text-left py-3 px-4 font-medium">ROI</th>
                      <th className="text-left py-3 px-4 font-medium">
                        Approval
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map(campaign => (
                      <tr
                        key={campaign.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{campaign.name}</div>
                            <div className="text-sm text-gray-600">
                              {campaign.platform}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={getStatusBadge(campaign.status) as any}
                          >
                            {campaign.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {formatCurrency(campaign.budget)}
                        </td>
                        <td className="py-3 px-4">
                          {formatCurrency(campaign.spent)}
                        </td>
                        <td className="py-3 px-4">
                          {campaign.roas.toFixed(1)}x
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={
                              campaign.roi > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {formatPercentage(campaign.roi)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              getStatusBadge(campaign.approval_status) as any
                            }
                          >
                            {campaign.approval_status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* A/B Tests Tab */}
        <TabsContent value="abtests" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">A/B Tests</h2>
            <NormalButton onClick={() => setIsCreateABTestOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create A/B Test
            </NormalButton>
          </div>

          <div className="grid gap-6">
            {filteredABTests.map(test => (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getStatusBadge(test.status) as any}>
                          {test.status}
                        </Badge>
                        <Badge variant="outline">{test.test_type}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        Confidence Level
                      </div>
                      <div className="text-lg font-semibold">
                        {test.confidence_level
                          ? `${test.confidence_level}%`
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {test.variants.map((variant, index) => (
                      <div key={variant.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium">{variant.name}</h4>
                          <Badge variant="outline">
                            {variant.traffic_split}%
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Impressions:</span>
                            <span>
                              {variant.metrics.impressions.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>CTR:</span>
                            <span>{formatPercentage(variant.metrics.ctr)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Conversion Rate:</span>
                            <span>
                              {formatPercentage(
                                variant.metrics.conversion_rate
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>ROI:</span>
                            <span
                              className={
                                variant.metrics.roi > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {formatPercentage(variant.metrics.roi)}
                            </span>
                          </div>
                        </div>

                        {variant.content && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                            <strong>Content:</strong>{" "}
                            {variant.content.subject_line ||
                              variant.content.headline ||
                              "N/A"}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {test.status === "running" && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          Test Progress
                        </span>
                        <span className="text-sm text-gray-600">
                          {test.current_significance}% significance
                        </span>
                      </div>
                      <Progress
                        value={test.current_significance}
                        className="h-2"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Content Approvals Tab */}
        <TabsContent value="approvals" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Content Approvals</h2>
            <NormalButton onClick={() => setIsCreateApprovalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Submit for Approval
            </NormalButton>
          </div>

          <div className="grid gap-4">
            {filteredApprovals.map(approval => (
              <Card key={approval.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{approval.content_type}</Badge>
                        <Badge variant={getStatusBadge(approval.status) as any}>
                          {approval.status}
                        </Badge>
                        {approval.auto_approval_eligible && (
                          <Badge variant="secondary">
                            Auto-approval eligible
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 mb-2">
                        Submitted by {approval.submitted_by} •{" "}
                        {approval.submitted_at.toLocaleDateString()}
                      </div>

                      <div className="bg-gray-50 p-3 rounded mb-3">
                        <div className="text-sm font-medium mb-1">
                          Content Preview:
                        </div>
                        <div className="text-sm">
                          {approval.content_preview}
                        </div>
                      </div>

                      {approval.feedback && (
                        <div className="bg-blue-50 p-3 rounded mb-3">
                          <div className="text-sm font-medium mb-1">
                            Feedback:
                          </div>
                          <div className="text-sm">{approval.feedback}</div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-green-600 mb-1">
                            Rules Met:
                          </div>
                          <ul className="space-y-1">
                            {approval.approval_rules_met.map((rule, index) => (
                              <li key={index} className="flex items-center">
                                <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                                {rule}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {approval.approval_rules_failed.length > 0 && (
                          <div>
                            <div className="font-medium text-red-600 mb-1">
                              Rules Failed:
                            </div>
                            <ul className="space-y-1">
                              {approval.approval_rules_failed.map(
                                (rule, index) => (
                                  <li key={index} className="flex items-center">
                                    <AlertCircle className="h-3 w-3 text-red-600 mr-1" />
                                    {rule}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {approval.status === "pending" && (
                      <div className="flex gap-2 ml-4">
                        <NormalButton
                          size="sm"
                          onClick={() => handleApproveContent(approval.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Approve
                        </NormalButton>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <NormalButton size="sm" variant="error">
                              <ThumbsDown className="h-4 w-4 mr-1" />
                              Reject
                            </NormalButton>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Reject Content
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Please provide feedback for rejection:
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <Textarea
                              placeholder="Enter rejection reason and feedback..."
                              id={`feedback-${approval.id}`}
                            />
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  const feedback =
                                    (
                                      document.getElementById(
                                        `feedback-${approval.id}`
                                      ) as HTMLTextAreaElement
                                    )?.value || "Content rejected";
                                  handleRejectContent(approval.id, feedback);
                                }}
                              >
                                Reject
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>A/B Test Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: "Email Subject Lines", tests: 12, winners: 8 },
                      { name: "Ad Creative", tests: 8, winners: 5 },
                      { name: "Landing Pages", tests: 6, winners: 4 },
                      { name: "Audience Targeting", tests: 4, winners: 3 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="tests" fill="#8884d8" name="Total Tests" />
                    <Bar
                      dataKey="winners"
                      fill="#82ca9d"
                      name="Winning Variants"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Approval Workflow</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Approved", value: 65, fill: "#22c55e" },
                        { name: "Pending", value: 20, fill: "#f59e0b" },
                        { name: "Rejected", value: 10, fill: "#ef4444" },
                        { name: "Needs Review", value: 5, fill: "#8b5cf6" },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Campaign ROI Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={[
                    { date: "2024-01", roi: 245 },
                    { date: "2024-02", roi: 280 },
                    { date: "2024-03", roi: 320 },
                    { date: "2024-04", roi: 290 },
                    { date: "2024-05", roi: 350 },
                    { date: "2024-06", roi: 380 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={value => [`${value}%`, "ROI"]} />
                  <Line
                    type="monotone"
                    dataKey="roi"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create A/B Test Dialog */}
      <Dialog open={isCreateABTestOpen} onOpenChange={setIsCreateABTestOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create A/B Test</DialogTitle>
            <DialogDescription>
              Set up a new A/B test for your campaign
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="test-name">Test Name</Label>
              <Input
                id="test-name"
                placeholder="e.g., Subject Line Test - Summer Sale"
              />
            </div>
            <div>
              <Label htmlFor="test-type">Test Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subject_line">Subject Line</SelectItem>
                  <SelectItem value="content">Content</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="audience">Audience</SelectItem>
                  <SelectItem value="timing">Timing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sample-size">Sample Size</Label>
                <Input id="sample-size" type="number" placeholder="10000" />
              </div>
              <div>
                <Label htmlFor="significance">Significance Level (%)</Label>
                <Input id="significance" type="number" placeholder="95" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <NormalButton
              variant="secondary"
              onClick={() => setIsCreateABTestOpen(false)}
            >
              Cancel
            </NormalButton>
            <NormalButton onClick={() => setIsCreateABTestOpen(false)}>
              Create Test
            </NormalButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Content for Approval Dialog */}
      <Dialog
        open={isCreateApprovalOpen}
        onOpenChange={setIsCreateApprovalOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Content for Approval</DialogTitle>
            <DialogDescription>
              Submit new content for review and approval
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="content-type">Content Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="copy">Copy</SelectItem>
                  <SelectItem value="subject_line">Subject Line</SelectItem>
                  <SelectItem value="landing_page">Landing Page</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="content-preview">Content Preview</Label>
              <Textarea
                id="content-preview"
                placeholder="Enter content or description..."
              />
            </div>
            <div>
              <Label htmlFor="campaign-select">Campaign</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map(campaign => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <NormalButton
              variant="secondary"
              onClick={() => setIsCreateApprovalOpen(false)}
            >
              Cancel
            </NormalButton>
            <NormalButton onClick={() => setIsCreateApprovalOpen(false)}>
              Submit for Approval
            </NormalButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
