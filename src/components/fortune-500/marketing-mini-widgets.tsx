"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Eye,
  Heart,
  Play,
  Pause,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Cpu,
  Server,
  Database,
  Globe,
} from "lucide-react";

// Executive Dashboard Mini
export function ExecutiveDashboardMini() {
  const metrics = [
    {
      title: "Revenue",
      value: "$12.4M",
      change: 18.5,
      trend: "up",
      category: "revenue",
    },
    {
      title: "Market Share",
      value: "15.8%",
      change: 3.2,
      trend: "up",
      category: "growth",
    },
    {
      title: "Efficiency",
      value: "92.4%",
      change: 5.1,
      trend: "up",
      category: "efficiency",
    },
    {
      title: "Churn",
      value: "2.1%",
      change: -0.7,
      trend: "up",
      category: "risk",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Executive Overview</h3>
        <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">
          Live
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/40 backdrop-blur-xl border-slate-700/50 hover:border-cyan-500/30 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-green-400" />
                    <span className="text-xs font-medium text-green-400">
                      +{metric.change}%
                    </span>
                  </div>
                </div>
                <div className="text-xl font-bold text-white mb-1">
                  {metric.value}
                </div>
                <div className="text-xs text-slate-400">{metric.title}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Social Media Oversight Mini
export function SocialMediaOversightMini() {
  const platforms = [
    {
      name: "LinkedIn",
      followers: 45230,
      engagement: 4.8,
      posts: 3,
      icon: "💼",
      status: "active",
    },
    {
      name: "Instagram",
      followers: 89450,
      engagement: 6.2,
      posts: 5,
      icon: "📷",
      status: "active",
    },
    {
      name: "Twitter",
      followers: 32100,
      engagement: 3.4,
      posts: 8,
      icon: "🐦",
      status: "warning",
    },
    {
      name: "TikTok",
      followers: 156700,
      engagement: 8.9,
      posts: 2,
      icon: "🎵",
      status: "active",
    },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Social Media</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-400">4 Connected</span>
        </div>
      </div>

      <div className="space-y-3">
        {platforms.map((platform, index) => (
          <motion.div
            key={platform.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{platform.icon}</span>
              <div>
                <div className="font-medium text-white text-sm">
                  {platform.name}
                </div>
                <div className="text-xs text-slate-400">
                  {formatNumber(platform.followers)} followers
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-medium text-white">
                {platform.engagement}%
              </div>
              <div className="text-xs text-slate-400">
                {platform.posts} posts today
              </div>
            </div>

            <div
              className={cn(
                "w-2 h-2 rounded-full",
                platform.status === "active" ? "bg-green-500" : "bg-yellow-500"
              )}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Marketing Automation Mini
export function MarketingAutomationMini() {
  const workflows = [
    {
      name: "Lead Nurturing",
      status: "running",
      executions: 1240,
      successRate: 98.5,
      lastRun: "2 min ago",
    },
    {
      name: "Social Publishing",
      status: "running",
      executions: 89,
      successRate: 100,
      lastRun: "5 min ago",
    },
    {
      name: "Email Campaigns",
      status: "paused",
      executions: 567,
      successRate: 96.8,
      lastRun: "1 hour ago",
    },
    {
      name: "Data Sync",
      status: "error",
      executions: 234,
      successRate: 89.2,
      lastRun: "12 min ago",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Play className="w-3 h-3 text-green-400" />;
      case "paused":
        return <Pause className="w-3 h-3 text-yellow-400" />;
      case "error":
        return <AlertTriangle className="w-3 h-3 text-red-400" />;
      default:
        return <Play className="w-3 h-3 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Automation</h3>
        <Badge
          variant="outline"
          className="text-purple-400 border-purple-500/30"
        >
          {workflows.filter(w => w.status === "running").length} Active
        </Badge>
      </div>

      <div className="space-y-2">
        {workflows.map((workflow, index) => (
          <motion.div
            key={workflow.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(workflow.status)}
              <div>
                <div className="font-medium text-white text-sm">
                  {workflow.name}
                </div>
                <div className="text-xs text-slate-400">{workflow.lastRun}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-medium text-white">
                {workflow.successRate}%
              </div>
              <div className="text-xs text-slate-400">
                {workflow.executions} runs
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Competitor Monitoring Mini
export function CompetitorMonitoringMini() {
  const competitors = [
    {
      name: "Competitor A",
      change: 12.5,
      engagement: 4.2,
      threat: "medium",
      trend: "up",
    },
    {
      name: "Competitor B",
      change: -3.2,
      engagement: 3.8,
      threat: "low",
      trend: "down",
    },
    {
      name: "Competitor C",
      change: 8.7,
      engagement: 5.1,
      threat: "high",
      trend: "up",
    },
  ];

  const getThreatColor = (threat: string) => {
    switch (threat) {
      case "high":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "low":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Competitors</h3>
        <Badge
          variant="outline"
          className="text-orange-400 border-orange-500/30"
        >
          Real-time
        </Badge>
      </div>

      <div className="space-y-3">
        {competitors.map((competitor, index) => (
          <motion.div
            key={competitor.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-white text-sm">
                {competitor.name}
              </span>
              <Badge
                className={cn("text-xs", getThreatColor(competitor.threat))}
              >
                {competitor.threat}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {competitor.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-green-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}
                <span
                  className={cn(
                    "text-xs font-medium",
                    competitor.change > 0 ? "text-green-400" : "text-red-400"
                  )}
                >
                  {competitor.change > 0 ? "+" : ""}
                  {competitor.change}%
                </span>
              </div>

              <div className="text-xs text-slate-400">
                {competitor.engagement}% engagement
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Infrastructure Monitoring Mini
export function InfrastructureMonitoringMini() {
  const metrics = [
    { name: "CPU Usage", value: 45, status: "good", unit: "%", icon: Cpu },
    { name: "Memory", value: 62, status: "warning", unit: "%", icon: Server },
    {
      name: "Database",
      value: 78,
      status: "warning",
      unit: "%",
      icon: Database,
    },
    { name: "Network", value: 23, status: "good", unit: "Mbps", icon: Globe },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "critical":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Infrastructure</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-400">Healthy</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <IconComponent
                  className={cn("w-4 h-4", getStatusColor(metric.status))}
                />
                <span className="text-xs text-slate-400">{metric.name}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-white">
                  {metric.value}
                  {metric.unit}
                </span>
                <Progress value={metric.value} className="w-12 h-2" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Content Pipeline Mini
export function ContentPipelineMini() {
  const content = [
    {
      title: "Q2 Product Launch",
      stage: "review",
      platform: "LinkedIn",
      publishDate: "Today, 3:00 PM",
    },
    {
      title: "Industry Insights",
      stage: "creation",
      platform: "Instagram",
      publishDate: "Tomorrow, 10:00 AM",
    },
    {
      title: "Customer Success Story",
      stage: "scheduled",
      platform: "Twitter",
      publishDate: "Jun 25, 2:00 PM",
    },
  ];

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "planning":
        return "text-blue-400 bg-blue-500/10";
      case "creation":
        return "text-yellow-400 bg-yellow-500/10";
      case "review":
        return "text-orange-400 bg-orange-500/10";
      case "scheduled":
        return "text-purple-400 bg-purple-500/10";
      case "published":
        return "text-green-400 bg-green-500/10";
      default:
        return "text-gray-400 bg-gray-500/10";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Content Pipeline</h3>
        <Badge variant="outline" className="text-green-400 border-green-500/30">
          {content.length} Active
        </Badge>
      </div>

      <div className="space-y-2">
        {content.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-white text-sm">
                {item.title}
              </span>
              <Badge className={cn("text-xs", getStageColor(item.stage))}>
                {item.stage}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{item.platform}</span>
              <span>{item.publishDate}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Cross Platform Analytics Mini
export function CrossPlatformAnalyticsMini() {
  const analytics = {
    totalReach: 2456789,
    totalEngagement: 98234,
    avgEngagementRate: 4.2,
    topPerformingPlatform: "Instagram",
    weeklyGrowth: 12.5,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Cross-Platform Analytics
        </h3>
        <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">
          Weekly
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-400">Total Reach</span>
            </div>
            <div className="text-lg font-bold text-white">
              {(analytics.totalReach / 1000000).toFixed(2)}M
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-xs text-slate-400">Engagement</span>
            </div>
            <div className="text-lg font-bold text-white">
              {(analytics.totalEngagement / 1000).toFixed(0)}K
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-xs text-slate-400">Avg Rate</span>
            </div>
            <div className="text-lg font-bold text-white">
              {analytics.avgEngagementRate}%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-slate-400">Growth</span>
            </div>
            <div className="text-lg font-bold text-white">
              +{analytics.weeklyGrowth}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
        <div className="text-sm font-medium text-white mb-1">
          🏆 Top Platform: {analytics.topPerformingPlatform}
        </div>
        <div className="text-xs text-slate-400">
          Leading in engagement and reach this week
        </div>
      </div>
    </div>
  );
}
