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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Play,
  Pause,
  Square,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Users,
  TrendingUp,
  RefreshCw,
  Plus,
  Search,
  Activity,
  Brain,
  Lightbulb,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ContentCalendarManager from "./content-calendar-manager";
import SocialMediaOversightDashboard from "./social-media-oversight-dashboard";

// Import live n8n integration instead of old service
import {
  n8nLiveIntegration,
  LiveWorkflowData,
} from "@/lib/marketing/n8n-live-integration";

// Types for the Marketing Automation Control Center
interface WorkflowStatus {
  id: string;
  name: string;
  status:
    | "running"
    | "paused"
    | "stopped"
    | "error"
    | "scheduled"
    | "active"
    | "inactive";
  type: "email" | "social" | "ad_campaign" | "content" | "lead_nurture";
  lastRun: Date;
  nextRun?: Date;
  success_rate: number;
  total_executions: number;
  error_count: number;
  description: string;
  execution_count?: number;
  last_execution?: string;
  created_at?: string;
  updated_at?: string;
  tags?: string[];
}

interface PredictiveInsight {
  workflow_id: string;
  prediction_type:
    | "performance"
    | "failure_risk"
    | "optimization"
    | "scheduling";
  confidence: number;
  insight: string;
  recommendation: string;
  predicted_value?: number;
  timeframe: "1h" | "24h" | "7d" | "30d";
  data_points: number;
}

interface N8nDashboardData {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  averageSuccessRate: number;
  topPerformingWorkflows: Array<{ id: string; name: string; score: number }>;
  recentExecutions: any[];
  systemHealth: "healthy" | "warning" | "critical";
}

interface ContentCalendarItem {
  id: string;
  title: string;
  type: "post" | "email" | "ad" | "story" | "video" | "campaign";
  platform: string[];
  scheduled_date: Date;
  scheduled_time: string;
  status: "draft" | "scheduled" | "published" | "failed";
  engagement_prediction?: number;
  author: string;
  content_preview: string;
  duration?: number; // in minutes for videos
  audience_size?: number;
}

interface SocialMediaAccount {
  id: string;
  platform:
    | "facebook"
    | "instagram"
    | "twitter"
    | "linkedin"
    | "youtube"
    | "tiktok";
  account_name: string;
  followers: number;
  engagement_rate: number;
  posts_today: number;
  status: "connected" | "disconnected" | "error";
  last_sync: Date;
}

interface CampaignPerformance {
  id: string;
  name: string;
  platform: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  roi: number;
  status: "active" | "paused" | "completed";
  start_date: Date;
  end_date?: Date;
}

// Mock data for demo
const mockWorkflows: WorkflowStatus[] = [
  {
    id: "wf-001",
    name: "Welcome Email Sequence",
    status: "running",
    type: "email",
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 4 * 60 * 60 * 1000),
    success_rate: 98.5,
    total_executions: 1247,
    error_count: 3,
    description: "Automated welcome email series for new subscribers",
  },
  {
    id: "wf-002",
    name: "Social Media Publishing",
    status: "running",
    type: "social",
    lastRun: new Date(Date.now() - 30 * 60 * 1000),
    nextRun: new Date(Date.now() + 90 * 60 * 1000),
    success_rate: 95.2,
    total_executions: 342,
    error_count: 8,
    description: "Automated posting to social media platforms",
  },
  {
    id: "wf-003",
    name: "Lead Scoring & Nurturing",
    status: "paused",
    type: "lead_nurture",
    lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
    success_rate: 89.7,
    total_executions: 876,
    error_count: 12,
    description: "Automated lead scoring and nurturing campaigns",
  },
  {
    id: "wf-004",
    name: "Retargeting Campaigns",
    status: "error",
    type: "ad_campaign",
    lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000),
    success_rate: 78.3,
    total_executions: 156,
    error_count: 23,
    description: "Automated retargeting ad campaigns",
  },
];

const mockCalendarItems: ContentCalendarItem[] = [
  {
    id: "cal-001",
    title: "Summer Sale Announcement",
    type: "post",
    platform: ["facebook", "instagram", "twitter"],
    scheduled_date: new Date(Date.now() + 2 * 60 * 60 * 1000),
    scheduled_time: "10:00",
    status: "scheduled",
    engagement_prediction: 85,
    author: "Marketing Team",
    content_preview:
      "🌞 Summer Sale is here! Get up to 50% off on all products...",
  },
  {
    id: "cal-002",
    title: "Product Demo Video",
    type: "video",
    platform: ["youtube", "linkedin"],
    scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    scheduled_time: "14:00",
    status: "draft",
    engagement_prediction: 92,
    author: "Product Team",
    content_preview: "New product demo showcasing our latest features...",
  },
  {
    id: "cal-003",
    title: "Newsletter: Weekly Insights",
    type: "email",
    platform: ["email"],
    scheduled_date: new Date(Date.now() + 48 * 60 * 60 * 1000),
    scheduled_time: "09:00",
    status: "scheduled",
    engagement_prediction: 78,
    author: "Content Team",
    content_preview: "This week's top insights and industry trends...",
  },
];

const mockSocialAccounts: SocialMediaAccount[] = [
  {
    id: "acc-001",
    platform: "facebook",
    account_name: "SKC Business",
    followers: 15420,
    engagement_rate: 4.8,
    posts_today: 3,
    status: "connected",
    last_sync: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: "acc-002",
    platform: "instagram",
    account_name: "@skcbusiness",
    followers: 8930,
    engagement_rate: 6.2,
    posts_today: 2,
    status: "connected",
    last_sync: new Date(Date.now() - 20 * 60 * 1000),
  },
  {
    id: "acc-003",
    platform: "linkedin",
    account_name: "SKC Company",
    followers: 3450,
    engagement_rate: 3.9,
    posts_today: 1,
    status: "error",
    last_sync: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
];

const mockCampaigns: CampaignPerformance[] = [
  {
    id: "camp-001",
    name: "Summer Product Launch",
    platform: "Google Ads",
    budget: 5000,
    spent: 3420,
    impressions: 125000,
    clicks: 2150,
    conversions: 78,
    ctr: 1.72,
    roi: 285,
    status: "active",
    start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "camp-002",
    name: "Brand Awareness Campaign",
    platform: "Facebook Ads",
    budget: 3000,
    spent: 2890,
    impressions: 89500,
    clicks: 1340,
    conversions: 45,
    ctr: 1.5,
    roi: 156,
    status: "active",
    start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
  },
];

export default function MarketingAutomationControlCenter() {
  const [workflows, setWorkflows] = useState<LiveWorkflowData[]>([]);
  const [calendarItems, setCalendarItems] =
    useState<ContentCalendarItem[]>(mockCalendarItems);
  const [socialAccounts, setSocialAccounts] =
    useState<SocialMediaAccount[]>(mockSocialAccounts);
  const [campaigns, setCampaigns] =
    useState<CampaignPerformance[]>(mockCampaigns);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [predictiveInsights, setPredictiveInsights] = useState<
    PredictiveInsight[]
  >([]);
  const [dashboardData, setDashboardData] = useState<any | null>(null);

  // Load live n8n data from the new integration
  const loadLiveWorkflowData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "/api/marketing/n8n-live?action=get_live_status"
      );
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setWorkflows(result.data);
        }
      }
    } catch (error) {
      console.error("Failed to load live workflow data:", error);
      // Fallback to existing mock data if live integration fails
    } finally {
      setLoading(false);
    }
  };

  // Load live dashboard data
  const loadLiveDashboardData = async () => {
    try {
      const response = await fetch(
        "/api/marketing/n8n-live?action=get_dashboard_data"
      );
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDashboardData(result.data);
        }
      }
    } catch (error) {
      console.error("Failed to load live dashboard data:", error);
    }
  };

  // Handle workflow actions with live integration
  const handleWorkflowAction = async (workflowId: string, action: string) => {
    try {
      setLoading(true);

      const workflow = workflows.find(w => w.id === workflowId);
      if (!workflow) return;

      if (action === "start" || action === "trigger") {
        // Trigger the actual workflow
        const response = await fetch("/api/marketing/n8n-live", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "trigger_workflow",
            workflowName: workflow.name,
            inputData: {
              imageTitle: "Live triggered content",
              imagePrompt: "Enterprise marketing content",
            },
            chatId: "control_center_user",
            contentStrategy: "premium",
            priority: "high",
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Workflow triggered successfully:", result);

          // Refresh workflow data
          await loadLiveWorkflowData();
        }
      }

      // For other actions, you would implement pause/stop/etc
      console.log(`Action ${action} triggered for workflow ${workflowId}`);
    } catch (error) {
      console.error(`Error executing workflow action:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Load predictive insights
  const loadPredictiveInsights = async () => {
    try {
      const response = await fetch(
        "/api/marketing/n8n-workflows?action=get_predictive_insights"
      );
      if (response.ok) {
        const data = await response.json();
        setPredictiveInsights(data.data || []);
      }
    } catch (error) {
      console.error("Failed to load predictive insights:", error);
      // Fallback to mock insights
      setPredictiveInsights([
        {
          workflow_id: "wf-001",
          prediction_type: "performance",
          confidence: 85,
          insight:
            "This workflow is predicted to maintain 98%+ success rate over the next 7 days based on historical patterns.",
          recommendation:
            "Consider increasing execution frequency during peak hours (9-11 AM) for optimal engagement.",
          predicted_value: 98.7,
          timeframe: "7d",
          data_points: 1247,
        },
        {
          workflow_id: "wf-002",
          prediction_type: "failure_risk",
          confidence: 78,
          insight:
            "Social Media Publishing workflow shows increased error rate during weekend posting attempts.",
          recommendation:
            "Review API rate limits and consider implementing weekend-specific retry logic.",
          timeframe: "24h",
          data_points: 342,
        },
        {
          workflow_id: "wf-001",
          prediction_type: "optimization",
          confidence: 92,
          insight:
            "Email open rates are 23% higher when sent between 10-11 AM on weekdays.",
          recommendation:
            "Adjust scheduling to optimize for this time window to improve overall campaign performance.",
          timeframe: "30d",
          data_points: 856,
        },
      ]);
    }
  };

  // Auto refresh functionality with live data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadLiveWorkflowData();
      loadLiveDashboardData();
      if (selectedWorkflow) {
        // Load predictive insights for selected workflow
        loadPredictiveInsights();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, selectedWorkflow]);

  // Initial data fetch
  useEffect(() => {
    loadLiveWorkflowData();
    loadLiveDashboardData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
      case "active":
        return <Play className="h-4 w-4 text-green-600" />;
      case "paused":
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case "stopped":
      case "completed":
        return <Square className="h-4 w-4 text-gray-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (
    status: string
  ): "default" | "secondary" | "outline" | "destructive" => {
    const variants: Record<
      string,
      "default" | "secondary" | "outline" | "destructive"
    > = {
      running: "default",
      active: "default",
      paused: "secondary",
      stopped: "outline",
      error: "destructive",
      scheduled: "outline",
      draft: "secondary",
      published: "default",
      failed: "destructive",
      connected: "default",
      disconnected: "secondary",
      completed: "outline",
    };
    return variants[status] || "outline";
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const formatTimeUntil = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (date.getTime() - now.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `in ${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) {
      return `in ${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `in ${Math.floor(diffInMinutes / 1440)}d`;
    }
  };

  // Calendar event handlers
  const handleEventMove = (eventId: string, newDate: Date) => {
    setCalendarItems(prev =>
      prev.map(item =>
        item.id === eventId ? { ...item, scheduled_date: newDate } : item
      )
    );
  };

  const handleEventCreate = (date: Date) => {
    console.log("Create new event for", date);
    // In real implementation, this would open a create event modal
  };

  const handleEventEdit = (event: ContentCalendarItem) => {
    console.log("Edit event", event);
    // In real implementation, this would open an edit event modal
  };

  const handleEventDelete = (eventId: string) => {
    setCalendarItems(prev => prev.filter(item => item.id !== eventId));
  };

  const filteredWorkflows = workflows.filter(wf => {
    const matchesSearch = wf.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || wf.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Marketing Automation Control Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor workflows, manage content calendar, and oversee campaign
            performance
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh" className="text-sm text-gray-300">
              Auto-refresh
            </Label>
          </div>
          <NormalButton variant="secondary" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </NormalButton>
          <NormalButton size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </NormalButton>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Workflows
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {workflows.filter(wf => wf.status === "running").length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {workflows.length} total workflows
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Scheduled Content
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {calendarItems.filter(item => item.status === "scheduled").length}
            </div>
            <p className="text-xs text-muted-foreground">
              ready for publishing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Connected Accounts
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {socialAccounts.filter(acc => acc.status === "connected").length}
            </div>
            <p className="text-xs text-muted-foreground">
              social media platforms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaign ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(
                campaigns.reduce((sum, camp) => sum + camp.roi, 0) /
                  campaigns.length
              )}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              average across campaigns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="workflows">Workflow Monitor</TabsTrigger>
          <TabsTrigger value="calendar">Content Calendar</TabsTrigger>
          <TabsTrigger value="social">Social Accounts</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Performance</TabsTrigger>
          <TabsTrigger value="analytics">
            <Brain className="h-4 w-4 mr-2" />
            AI Analytics
          </TabsTrigger>
        </TabsList>

        {/* Workflow Monitor Tab */}
        <TabsContent value="workflows" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search workflows..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="max-w-sm pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredWorkflows.map(workflow => (
              <Card
                key={workflow.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(workflow.status)}
                      <div>
                        <CardTitle className="text-lg">
                          {workflow.name}
                        </CardTitle>
                        <CardDescription>
                          {workflow.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadge(workflow.status)}>
                        {workflow.status}
                      </Badge>
                      <div className="flex gap-1">
                        <NormalButton
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            handleWorkflowAction(workflow.id, "start")
                          }
                          disabled={workflow.status === "running"}
                        >
                          <Play className="h-3 w-3" />
                        </NormalButton>
                        <NormalButton
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            handleWorkflowAction(workflow.id, "pause")
                          }
                          disabled={workflow.status === "paused"}
                        >
                          <Pause className="h-3 w-3" />
                        </NormalButton>
                        <NormalButton
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            handleWorkflowAction(workflow.id, "stop")
                          }
                        >
                          <Square className="h-3 w-3" />
                        </NormalButton>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Success Rate
                      </p>
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
                      <p className="text-sm text-muted-foreground">
                        Total Executions
                      </p>
                      <p className="text-lg font-medium">
                        {workflow.total_executions.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Run</p>
                      <p className="text-sm">
                        {formatTimeAgo(workflow.lastRun)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Next Run</p>
                      <p className="text-sm">
                        {workflow.nextRun
                          ? formatTimeUntil(workflow.nextRun)
                          : "Not scheduled"}
                      </p>
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
        </TabsContent>

        {/* Content Calendar Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <ContentCalendarManager />
        </TabsContent>

        {/* Social Accounts Tab */}
        <TabsContent value="social" className="space-y-4">
          <SocialMediaOversightDashboard />
        </TabsContent>

        {/* Campaign Performance Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">
              Active Campaigns
            </h3>
            <NormalButton size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </NormalButton>
          </div>

          <div className="grid gap-4">
            {campaigns.map(campaign => (
              <Card
                key={campaign.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      <CardDescription>
                        {campaign.platform} •{" "}
                        {campaign.start_date.toLocaleDateString()} -
                        {campaign.end_date?.toLocaleDateString() || "Ongoing"}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusBadge(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Budget Usage
                      </p>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={(campaign.spent / campaign.budget) * 100}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium">
                          {Math.round((campaign.spent / campaign.budget) * 100)}
                          %
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        €{campaign.spent.toLocaleString()} / €
                        {campaign.budget.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Impressions
                      </p>
                      <p className="text-lg font-medium">
                        {campaign.impressions.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CTR</p>
                      <p className="text-lg font-medium">{campaign.ctr}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ROI</p>
                      <p
                        className={`text-lg font-medium ${campaign.roi > 100 ? "text-green-600" : "text-red-600"}`}
                      >
                        {campaign.roi}%
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {campaign.conversions} conversions from{" "}
                      {campaign.clicks.toLocaleString()} clicks
                    </span>
                    <div className="flex gap-2">
                      <NormalButton size="sm" variant="secondary">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        View Details
                      </NormalButton>
                      <NormalButton size="sm" variant="secondary">
                        <Settings className="h-3 w-3 mr-1" />
                        Settings
                      </NormalButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Analytics Tab - Predictive Insights */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-white">
                AI-Powered Predictive Analytics
              </h3>
              <p className="text-sm text-gray-300">
                Machine learning insights and optimization recommendations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <NormalButton
                size="sm"
                variant="secondary"
                onClick={loadPredictiveInsights}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Insights
              </NormalButton>
              <NormalButton size="sm">
                <Target className="h-4 w-4 mr-2" />
                Configure ML Models
              </NormalButton>
            </div>
          </div>

          {/* Predictive Insights Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Performance Predictions
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {
                    predictiveInsights.filter(
                      i => i.prediction_type === "performance"
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  active performance forecasts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Risk Assessments
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {
                    predictiveInsights.filter(
                      i => i.prediction_type === "failure_risk"
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  workflows at risk
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Optimization Opportunities
                </CardTitle>
                <Lightbulb className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {
                    predictiveInsights.filter(
                      i => i.prediction_type === "optimization"
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  improvement suggestions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Selection for Detailed Analytics */}
          <div className="flex gap-4">
            <Select
              value={selectedWorkflow || ""}
              onValueChange={setSelectedWorkflow}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select workflow for detailed analytics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Workflows</SelectItem>
                {workflows.map(workflow => (
                  <SelectItem key={workflow.id} value={workflow.id}>
                    {workflow.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Predictive Insights Cards */}
          <div className="grid gap-4">
            {predictiveInsights
              .filter(
                insight =>
                  !selectedWorkflow || insight.workflow_id === selectedWorkflow
              )
              .map((insight, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {insight.prediction_type === "performance" && (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        )}
                        {insight.prediction_type === "failure_risk" && (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        )}
                        {insight.prediction_type === "optimization" && (
                          <Lightbulb className="h-5 w-5 text-blue-500" />
                        )}
                        {insight.prediction_type === "scheduling" && (
                          <Clock className="h-5 w-5 text-purple-500" />
                        )}
                        <div>
                          <CardTitle className="text-lg capitalize">
                            {insight.prediction_type.replace("_", " ")} Insight
                          </CardTitle>
                          <CardDescription>
                            Workflow:{" "}
                            {workflows.find(w => w.id === insight.workflow_id)
                              ?.name || insight.workflow_id}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {insight.confidence}% confidence
                        </Badge>
                        <Badge variant="secondary">{insight.timeframe}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-white mb-2">
                          AI Insight
                        </h4>
                        <p className="text-sm text-gray-300">
                          {insight.insight}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-white mb-2">
                          Recommendation
                        </h4>
                        <p className="text-sm text-gray-300">
                          {insight.recommendation}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                        <span className="text-xs text-gray-400">
                          Based on {insight.data_points} data points
                        </span>
                        <div className="flex gap-2">
                          <NormalButton size="sm" variant="secondary">
                            <BarChart3 className="h-3 w-3 mr-1" />
                            View Details
                          </NormalButton>
                          <NormalButton size="sm" variant="secondary">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Apply Suggestion
                          </NormalButton>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Empty State */}
          {predictiveInsights.length === 0 && (
            <Card className="text-center py-8">
              <CardContent>
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  No Predictive Insights Available
                </h3>
                <p className="text-sm text-gray-300 mb-4">
                  AI insights will appear here as your workflows generate more
                  data
                </p>
                <NormalButton onClick={loadPredictiveInsights}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check for Insights
                </NormalButton>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
