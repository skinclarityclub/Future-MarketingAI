"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import ABTestingWidget from "./ab-testing-widget";
import ContentCalendarWidget from "./content-calendar-widget";
import ROIBudgetWidget from "./roi-budget-widget";
import CustomWidgetBuilder from "./custom-widget-builder";
import MarketingTeamCollaboration from "./marketing-team-collaboration";
import MarketingPerformanceForecasting from "./marketing-performance-forecasting";
import { MarketingAlertSystem } from "./marketing-alert-system";
import MarketingExportCapabilities from "./marketing-export-capabilities";
import {
  UltraPremiumGrid,
  UltraPremiumCard,
} from "@/components/layout/ultra-premium-dashboard-layout";
import {
  Target,
  Users,
  BarChart3,
  TrendingUp,
  TrendingDown,
  MousePointer,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Activity,
  Globe,
  PlayCircle,
  PauseCircle,
  Settings,
  RefreshCw,
  Crown,
} from "lucide-react";

// Types
interface MarketingKPI {
  id: string;
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down" | "stable";
  icon: React.ComponentType<any>;
  color: string;
  description?: string;
}

interface WorkflowStatus {
  id: string;
  name: string;
  status: "running" | "paused" | "error" | "completed";
  executions: number;
  successRate: number;
  lastRun: string;
}

interface SocialAccount {
  id: string;
  platform: string;
  handle: string;
  followers: number;
  engagement: number;
  postsToday: number;
  status: "active" | "inactive" | "error";
}

interface ContentPipeline {
  id: string;
  title: string;
  stage: "ideation" | "creation" | "review" | "scheduled" | "published";
  assignee: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
}

interface CampaignData {
  id: string;
  name: string;
  type: "content" | "social" | "automation";
  status: "active" | "paused" | "completed";
  performance: {
    executions: number;
    successRate: number;
    engagement: number;
    reach: number;
    revenue: number;
  };
}

export default function UnifiedMarketingDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Marketing KPIs State
  const [marketingKPIs, setMarketingKPIs] = useState<MarketingKPI[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowStatus[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [contentPipeline, setContentPipeline] = useState<ContentPipeline[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);

  // Fetch marketing data from multiple APIs
  const fetchMarketingData = async () => {
    try {
      setApiError(null);

      // Fetch basic marketing metrics
      const marketingResponse = await fetch("/api/marketing");
      if (!marketingResponse.ok) throw new Error("Marketing API failed");
      const marketingData = await marketingResponse.json();

      // Fetch campaign data
      const campaignsResponse = await fetch("/api/marketing/campaigns");
      if (!campaignsResponse.ok) throw new Error("Campaigns API failed");
      const campaignsData = await campaignsResponse.json();

      // Fetch social media data
      const socialResponse = await fetch("/api/marketing/social-media");
      if (!socialResponse.ok) throw new Error("Social Media API failed");
      const socialData = await socialResponse.json();

      // Transform marketing data to KPIs
      if (marketingData.data && Array.isArray(marketingData.data)) {
        const totalSpend = marketingData.data.reduce(
          (sum: number, channel: any) => sum + channel.spend,
          0
        );
        const totalRevenue = marketingData.data.reduce(
          (sum: number, channel: any) => sum + channel.revenue,
          0
        );
        const totalConversions = marketingData.data.reduce(
          (sum: number, channel: any) => sum + channel.conversions,
          0
        );
        const averageROI =
          marketingData.data.reduce(
            (sum: number, channel: any) => sum + channel.roi,
            0
          ) / marketingData.data.length;
        const averageCPA = totalSpend / totalConversions;

        const kpis: MarketingKPI[] = [
          {
            id: "roi",
            title: "Campaign ROI",
            value: `${averageROI.toFixed(1)}%`,
            change: "+18.5%",
            trend: "up",
            icon: Target,
            color: "text-green-600",
            description: "Return on marketing investment",
          },
          {
            id: "spend",
            title: "Marketing Spend",
            value: `€${(totalSpend / 1000).toFixed(1)}K`,
            change: "+12.1%",
            trend: "up",
            icon: DollarSign,
            color: "text-orange-600",
            description: "Total marketing investment this month",
          },
          {
            id: "revenue",
            title: "Generated Revenue",
            value: `€${(totalRevenue / 1000).toFixed(1)}K`,
            change: "+24.3%",
            trend: "up",
            icon: TrendingUp,
            color: "text-blue-600",
            description: "Revenue generated from marketing efforts",
          },
          {
            id: "conversion",
            title: "Total Conversions",
            value: totalConversions.toString(),
            change: "+15.2%",
            trend: "up",
            icon: MousePointer,
            color: "text-purple-600",
            description: "Total conversions across all channels",
          },
          {
            id: "cac",
            title: "Customer Acquisition Cost",
            value: `€${averageCPA.toFixed(2)}`,
            change: "-8.2%",
            trend: "down",
            icon: Users,
            color: "text-green-600",
            description: "Average cost to acquire a customer",
          },
          {
            id: "channels",
            title: "Active Channels",
            value: marketingData.data.length.toString(),
            change: "stable",
            trend: "stable",
            icon: Globe,
            color: "text-indigo-600",
            description: "Number of active marketing channels",
          },
        ];

        setMarketingKPIs(kpis);
      }

      // Transform campaign data to workflows
      if (campaignsData.campaigns && Array.isArray(campaignsData.campaigns)) {
        const workflowData: WorkflowStatus[] = campaignsData.campaigns.map(
          (campaign: any) => ({
            id: campaign.id,
            name: campaign.name,
            status:
              campaign.status === "active"
                ? "running"
                : campaign.status === "paused"
                  ? "paused"
                  : "completed",
            executions: campaign.performance.executions,
            successRate: campaign.performance.successRate,
            lastRun: new Date(campaign.lastUpdated).toLocaleString("nl-NL"),
          })
        );

        setWorkflows(workflowData);
        setCampaigns(campaignsData.campaigns);
      }

      // Transform social media data
      if (socialData.data && Array.isArray(socialData.data)) {
        const socialAccountData: SocialAccount[] = socialData.data.map(
          (account: any) => ({
            id: account.id,
            platform: account.platform,
            handle: account.account_name,
            followers: account.followers,
            engagement: account.engagement_rate,
            postsToday: account.posts_today,
            status:
              account.status === "connected"
                ? "active"
                : account.status === "error"
                  ? "error"
                  : "inactive",
          })
        );

        setSocialAccounts(socialAccountData);
      }

      // Mock content pipeline data (to be replaced with ClickUp API integration)
      const pipelineData: ContentPipeline[] = [
        {
          id: "1",
          title: "Q4 Marketing Strategy Blog",
          stage: "review",
          assignee: "Marketing Team",
          dueDate: "2024-01-15",
          priority: "high",
        },
        {
          id: "2",
          title: "Social Media Calendar",
          stage: "creation",
          assignee: "Content Creator",
          dueDate: "2024-01-10",
          priority: "medium",
        },
        {
          id: "3",
          title: "Product Launch Campaign",
          stage: "ideation",
          assignee: "Strategy Lead",
          dueDate: "2024-01-20",
          priority: "high",
        },
        {
          id: "4",
          title: "Customer Success Stories",
          stage: "scheduled",
          assignee: "Content Team",
          dueDate: "2024-01-08",
          priority: "low",
        },
      ];

      setContentPipeline(pipelineData);
    } catch (error) {
      console.error("Failed to fetch marketing data:", error);
      setApiError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );

      // Fallback to initial mock data on error
      const fallbackKPIs: MarketingKPI[] = [
        {
          id: "roi",
          title: "Campaign ROI",
          value: "342%",
          change: "+18.5%",
          trend: "up",
          icon: Target,
          color: "text-green-600",
          description: "Return on marketing investment",
        },
        {
          id: "leads",
          title: "Lead Generation",
          value: "1,247",
          change: "+24.3%",
          trend: "up",
          icon: Users,
          color: "text-blue-600",
          description: "New leads generated this month",
        },
        {
          id: "conversion",
          title: "Conversion Rate",
          value: "3.8%",
          change: "+0.5%",
          trend: "up",
          icon: MousePointer,
          color: "text-purple-600",
          description: "Average conversion across all channels",
        },
        {
          id: "spend",
          title: "Marketing Spend",
          value: "€45K",
          change: "+12.1%",
          trend: "up",
          icon: DollarSign,
          color: "text-orange-600",
          description: "Total marketing investment this month",
        },
      ];
      setMarketingKPIs(fallbackKPIs);
    }
  };

  // Real-time data refresh
  const refreshData = async () => {
    setRefreshing(true);
    try {
      await fetchMarketingData();
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
    setLastUpdated(new Date());
  }, []);

  // Initial data load and auto-refresh setup
  useEffect(() => {
    if (!mounted) return;

    fetchMarketingData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [mounted]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <PlayCircle className="h-4 w-4 text-green-500" />;
      case "paused":
        return <PauseCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "ideation":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "creation":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "review":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "scheduled":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "published":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 dark:text-red-400";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400";
      case "low":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Real-time Status */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">
              Marketing Command Center
            </h1>
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-none">
              <Crown className="w-3 h-3 mr-1" />
              PROFESSIONAL
            </Badge>
          </div>
          <p className="text-gray-300 mb-4">
            Complete oversight van alle marketing operations en performance
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${apiError ? "bg-red-500" : "bg-green-500 animate-pulse"}`}
              ></div>
              <span>
                {apiError ? "API connection error" : "Live data feed actief"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>
                Laatste update:{" "}
                {lastUpdated
                  ? lastUpdated.toLocaleTimeString("nl-NL")
                  : "--:--:--"}
              </span>
            </div>
          </div>
          {apiError && (
            <div className="mt-2 p-2 bg-red-900/20 border border-red-500/50 text-red-300 rounded text-sm">
              API Error: {apiError} - Fallback data wordt gebruikt
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <NormalButton
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Ververs Data
          </NormalButton>

          <NormalButton className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Upgrade Plan
          </NormalButton>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <UltraPremiumGrid variant="standard">
        {marketingKPIs.map(kpi => {
          const Icon = kpi.icon;
          return (
            <UltraPremiumCard
              key={kpi.id}
              title={kpi.title}
              description={kpi.description}
              variant="glass"
              colSpan={1}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {kpi.value}
                  </div>
                  <div
                    className={`text-sm flex items-center gap-1 ${
                      kpi.trend === "up"
                        ? "text-green-400"
                        : kpi.trend === "down"
                          ? "text-red-400"
                          : "text-yellow-400"
                    }`}
                  >
                    {kpi.trend === "up" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : kpi.trend === "down" ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : (
                      <Activity className="h-3 w-3" />
                    )}
                    {kpi.change}
                  </div>
                </div>
                <div
                  className={`p-3 rounded-lg bg-white/10 backdrop-blur-sm ${kpi.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </UltraPremiumCard>
          );
        })}
      </UltraPremiumGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow Status */}
        <UltraPremiumCard
          title="Campaign & Workflow Monitor"
          description="Real-time status van alle marketing campaigns en workflows"
          variant="glass"
          colSpan={1}
        >
          <div className="space-y-4">
            {workflows.length > 0 ? (
              workflows.map(workflow => (
                <div
                  key={workflow.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(workflow.status)}
                    <div>
                      <h4 className="font-medium text-white">
                        {workflow.name}
                      </h4>
                      <p className="text-sm text-gray-400">
                        {workflow.executions} executions •{" "}
                        {workflow.successRate.toFixed(1)}% success
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        workflow.status === "running"
                          ? "default"
                          : workflow.status === "error"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {workflow.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {workflow.lastRun}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Geen workflow data beschikbaar</p>
              </div>
            )}
          </div>
        </UltraPremiumCard>

        {/* Social Media Status */}
        <UltraPremiumCard
          title="Social Media Oversight"
          description="Multi-platform account status en performance"
          variant="glass"
          colSpan={1}
        >
          <div className="space-y-4">
            {socialAccounts.length > 0 ? (
              socialAccounts.map(account => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        account.status === "active"
                          ? "bg-green-500"
                          : account.status === "inactive"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    ></div>
                    <div>
                      <h4 className="font-medium text-white capitalize">
                        {account.platform}
                      </h4>
                      <p className="text-sm text-gray-400">{account.handle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {(account.followers / 1000).toFixed(1)}K followers
                    </p>
                    <p className="text-xs text-gray-400">
                      {account.engagement.toFixed(1)}% engagement •{" "}
                      {account.postsToday} posts vandaag
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">
                <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Geen social media accounts verbonden</p>
              </div>
            )}
          </div>
        </UltraPremiumCard>

        {/* A/B Testing Results */}
        <ABTestingWidget />
      </div>

      {/* Marketing Alert System */}
      <div className="grid grid-cols-1 gap-6">
        <MarketingAlertSystem />
      </div>

      {/* Content Calendar Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Calendar Widget */}
        <ContentCalendarWidget />

        {/* ROI & Budget Optimization */}
        <ROIBudgetWidget />
      </div>

      {/* Custom Widget Builder Section */}
      <div className="grid grid-cols-1 gap-6">
        <CustomWidgetBuilder />
      </div>

      {/* Team Collaboration Section */}
      <div className="grid grid-cols-1 gap-6">
        <MarketingTeamCollaboration />
      </div>

      {/* Predictive Analytics Section */}
      <div className="grid grid-cols-1 gap-6">
        <MarketingPerformanceForecasting />
      </div>

      {/* Executive Export Capabilities Section */}
      <div className="grid grid-cols-1 gap-6">
        <MarketingExportCapabilities />
      </div>

      {/* Content Pipeline Overview */}
      <UltraPremiumCard
        title="Content Pipeline & Approval Status"
        description="ClickUp project tracking en content workflow status"
        variant="glass"
        colSpan={4}
      >
        <div className="space-y-4">
          {contentPipeline.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg backdrop-blur-sm"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-3 h-3 rounded-full ${getPriorityColor(item.priority)}`}
                ></div>
                <div>
                  <h4 className="font-medium text-white">{item.title}</h4>
                  <p className="text-sm text-gray-400">
                    Toegewezen aan: {item.assignee}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge className={getStageColor(item.stage)}>
                  {item.stage}
                </Badge>
                <div className="text-right">
                  <p className="text-sm text-white">Deadline: {item.dueDate}</p>
                  <p className={`text-xs ${getPriorityColor(item.priority)}`}>
                    {item.priority} prioriteit
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </UltraPremiumCard>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <NormalButton variant="outline" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Dashboard Configuratie
        </NormalButton>
        <NormalButton variant="outline" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Uitgebreide Analytics
        </NormalButton>
        <NormalButton variant="outline" className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          Nieuwe Campagne
        </NormalButton>
        <NormalButton variant="outline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Content Kalender
        </NormalButton>
      </div>
    </div>
  );
}
