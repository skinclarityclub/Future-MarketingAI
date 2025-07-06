"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Database,
  CheckCircle,
  AlertCircle,
  Clock,
  Settings,
  Zap,
  BarChart3,
  Share2,
  ExternalLink,
  Activity,
  RefreshCw,
  TrendingUp,
  Users,
  MessageSquare,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

// API Integration Status Types
interface ApiIntegration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  status: "connected" | "disconnected" | "error" | "syncing";
  lastSync?: Date;
  apiCalls24h: number;
  rateLimit: {
    current: number;
    max: number;
    resetTime?: Date;
  };
  features: string[];
  category: "social" | "productivity" | "analytics" | "automation" | "crm";
  tier: "free" | "professional" | "enterprise";
  documentation: string;
  isConfigured: boolean;
}

// Mock data for API integrations
const mockApiIntegrations: ApiIntegration[] = [
  {
    id: "clickup",
    name: "ClickUp",
    description: "Project management and task automation",
    icon: CheckCircle,
    status: "connected",
    lastSync: new Date(Date.now() - 5 * 60 * 1000),
    apiCalls24h: 1247,
    rateLimit: { current: 85, max: 100 },
    features: ["Task Management", "Webhooks", "Time Tracking", "Custom Fields"],
    category: "productivity",
    tier: "professional",
    documentation: "/docs/clickup",
    isConfigured: true,
  },
  {
    id: "blotato",
    name: "Blotato",
    description: "Multi-platform social media publishing",
    icon: Share2,
    status: "connected",
    lastSync: new Date(Date.now() - 2 * 60 * 1000),
    apiCalls24h: 834,
    rateLimit: { current: 45, max: 1000 },
    features: [
      "Multi-platform Publishing",
      "Media Upload",
      "Video Generation",
      "Scheduling",
    ],
    category: "social",
    tier: "enterprise",
    documentation: "/docs/blotato",
    isConfigured: true,
  },
  {
    id: "instagram",
    name: "Instagram Business API",
    description: "Instagram analytics and content management",
    icon: BarChart3,
    status: "connected",
    lastSync: new Date(Date.now() - 15 * 60 * 1000),
    apiCalls24h: 2156,
    rateLimit: { current: 78, max: 200 },
    features: [
      "Analytics",
      "Media Insights",
      "Story Analytics",
      "Audience Demographics",
    ],
    category: "social",
    tier: "professional",
    documentation: "/docs/instagram",
    isConfigured: true,
  },
  {
    id: "facebook",
    name: "Facebook Graph API",
    description: "Facebook page management and analytics",
    icon: TrendingUp,
    status: "connected",
    lastSync: new Date(Date.now() - 8 * 60 * 1000),
    apiCalls24h: 1876,
    rateLimit: { current: 92, max: 200 },
    features: [
      "Page Analytics",
      "Post Insights",
      "Video Analytics",
      "Audience Insights",
    ],
    category: "social",
    tier: "professional",
    documentation: "/docs/facebook",
    isConfigured: true,
  },
  {
    id: "linkedin",
    name: "LinkedIn Marketing API",
    description: "LinkedIn company page and marketing analytics",
    icon: Users,
    status: "syncing",
    lastSync: new Date(Date.now() - 1 * 60 * 1000),
    apiCalls24h: 567,
    rateLimit: { current: 23, max: 100 },
    features: [
      "Company Analytics",
      "Post Performance",
      "Follower Demographics",
      "Ad Analytics",
    ],
    category: "social",
    tier: "professional",
    documentation: "/docs/linkedin",
    isConfigured: true,
  },
  {
    id: "twitter",
    name: "Twitter/X API",
    description: "Twitter analytics and engagement tracking",
    icon: MessageSquare,
    status: "error",
    lastSync: new Date(Date.now() - 120 * 60 * 1000),
    apiCalls24h: 0,
    rateLimit: { current: 0, max: 300 },
    features: [
      "Tweet Analytics",
      "Engagement Metrics",
      "Audience Insights",
      "Trending Topics",
    ],
    category: "social",
    tier: "professional",
    documentation: "/docs/twitter",
    isConfigured: false,
  },
  {
    id: "tiktok",
    name: "TikTok Business API",
    description: "TikTok video analytics and creator insights",
    icon: Activity,
    status: "disconnected",
    lastSync: undefined,
    apiCalls24h: 0,
    rateLimit: { current: 0, max: 100 },
    features: [
      "Video Analytics",
      "Creator Insights",
      "Trending Content",
      "Hashtag Performance",
    ],
    category: "social",
    tier: "enterprise",
    documentation: "/docs/tiktok",
    isConfigured: false,
  },
];

export default function ApiIntegrationsManagement() {
  const [integrations, setIntegrations] =
    useState<ApiIntegration[]>(mockApiIntegrations);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter integrations based on category and search
  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory =
      selectedCategory === "all" || integration.category === selectedCategory;
    const matchesSearch =
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Statistics
  const stats = {
    total: integrations.length,
    connected: integrations.filter(i => i.status === "connected").length,
    errors: integrations.filter(i => i.status === "error").length,
    totalApiCalls: integrations.reduce((sum, i) => sum + i.apiCalls24h, 0),
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "syncing":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "disconnected":
        return <Database className="h-4 w-4 text-gray-500" />;
      default:
        return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      connected: "default",
      syncing: "outline",
      error: "destructive",
      disconnected: "secondary",
    } as const;
    return variants[status as keyof typeof variants] || "secondary";
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API refresh
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  const handleConnect = (integrationId: string) => {
    setIntegrations(prev =>
      prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, status: "syncing" as const }
          : integration
      )
    );

    // Simulate connection process
    setTimeout(() => {
      setIntegrations(prev =>
        prev.map(integration =>
          integration.id === integrationId
            ? {
                ...integration,
                status: "connected" as const,
                isConfigured: true,
                lastSync: new Date(),
              }
            : integration
        )
      );
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Database className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total APIs</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Connected</p>
                <p className="text-2xl font-bold text-white">
                  {stats.connected}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Errors</p>
                <p className="text-2xl font-bold text-white">{stats.errors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <BarChart3 className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">API Calls (24h)</p>
                <p className="text-2xl font-bold text-white">
                  {stats.totalApiCalls.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-4">
          <div className="w-64">
            <Input
              placeholder="Search integrations..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-400"
            />
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="bg-slate-900/50 border-slate-700/50">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="productivity">Productivity</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="automation">Automation</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <NormalButton
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          <RefreshCw
            className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")}
          />
          Refresh All
        </NormalButton>
      </div>

      {/* API Integrations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredIntegrations.map(integration => {
          const Icon = integration.icon;

          return (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-slate-900/50 border-slate-700/50 hover:border-slate-600/50 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-800/50">
                        <Icon className="h-5 w-5 text-slate-300" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">
                          {integration.name}
                        </CardTitle>
                        <p className="text-sm text-slate-400">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={getStatusBadge(integration.status)}
                      className="capitalize"
                    >
                      {getStatusIcon(integration.status)}
                      <span className="ml-1">{integration.status}</span>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Status Information */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">API Calls (24h)</p>
                      <p className="text-white font-medium">
                        {integration.apiCalls24h.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Rate Limit</p>
                      <p className="text-white font-medium">
                        {integration.rateLimit.current}% of{" "}
                        {integration.rateLimit.max}
                      </p>
                    </div>
                  </div>

                  {/* Last Sync */}
                  {integration.lastSync && (
                    <div className="text-sm">
                      <p className="text-slate-400">Last Sync</p>
                      <p className="text-white">
                        {integration.lastSync.toLocaleTimeString()}
                      </p>
                    </div>
                  )}

                  {/* Features */}
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Features</p>
                    <div className="flex flex-wrap gap-1">
                      {integration.features.slice(0, 3).map(feature => (
                        <Badge
                          key={feature}
                          variant="outline"
                          className="text-xs"
                        >
                          {feature}
                        </Badge>
                      ))}
                      {integration.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{integration.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {integration.status === "disconnected" ||
                    integration.status === "error" ? (
                      <NormalButton
                        onClick={() => handleConnect(integration.id)}
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Connect
                      </NormalButton>
                    ) : (
                      <NormalButton
                        size="sm"
                        variant="secondary"
                        className="flex-1"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </NormalButton>
                    )}

                    <NormalButton
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        window.open(integration.documentation, "_blank")
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
                    </NormalButton>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Documentation Section */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-cyan-400" />
            API Configuration & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">
                🔐 Security Best Practices
              </h4>
              <p className="text-slate-400 text-sm">
                All API keys are encrypted and stored securely. Rate limiting
                and monitoring are enabled.
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">
                📊 Usage Monitoring
              </h4>
              <p className="text-slate-400 text-sm">
                Real-time monitoring of API usage, rate limits, and performance
                metrics.
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">🔄 Auto-Sync</h4>
              <p className="text-slate-400 text-sm">
                Automatic synchronization ensures your data is always
                up-to-date.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
