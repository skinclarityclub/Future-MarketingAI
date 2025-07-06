"use client";

/**
 * Cross-Platform Content Management Dashboard
 * Task 80.8: Implement Cross-Platform Content Management
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Instagram,
  Linkedin,
  MessageSquare,
  Play,
  Send,
  Settings,
  TrendingUp,
  Twitter,
  Users,
  Video,
  Zap,
  Facebook,
  Music,
} from "lucide-react";

// Types
interface CrossPlatformContent {
  id: string;
  title?: string;
  content: string;
  contentType:
    | "post"
    | "story"
    | "video"
    | "image"
    | "carousel"
    | "reel"
    | "thread";
  mediaUrls: string[];
  hashtags: string[];
  mentions: string[];
  link?: string;
  targetPlatforms: CrossPlatformType[];
  targetAudience: string[];
  campaignId?: string;
  brandVoice:
    | "professional"
    | "casual"
    | "friendly"
    | "authoritative"
    | "creative";
  publishingStrategy:
    | "immediate"
    | "scheduled"
    | "optimal-timing"
    | "cascade"
    | "synchronized";
  scheduledTime?: Date;
  status:
    | "draft"
    | "scheduled"
    | "publishing"
    | "published"
    | "failed"
    | "paused";
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  approvalRequired: boolean;
}

type CrossPlatformType =
  | "instagram"
  | "linkedin"
  | "facebook"
  | "twitter"
  | "tiktok";

interface PlatformAccount {
  id: string;
  platform: CrossPlatformType;
  username: string;
  displayName: string;
  isActive: boolean;
  isConnected: boolean;
  followersCount: number;
  engagementRate: number;
}

interface DashboardMetrics {
  totalContent: number;
  scheduledContent: number;
  publishedContent: number;
  failedContent: number;
  connectedPlatforms: number;
  totalAccounts: number;
  todayScheduled: number;
  weeklyEngagement: number;
}

const PLATFORM_ICONS = {
  instagram: <Instagram className="h-4 w-4" />,
  linkedin: <Linkedin className="h-4 w-4" />,
  facebook: <Facebook className="h-4 w-4" />,
  twitter: <Twitter className="h-4 w-4" />,
  tiktok: <Music className="h-4 w-4" />,
};

const PLATFORM_COLORS = {
  instagram: "bg-gradient-to-r from-purple-500 to-pink-500",
  linkedin: "bg-blue-600",
  facebook: "bg-blue-500",
  twitter: "bg-black",
  tiktok: "bg-black",
};

const STATUS_COLORS = {
  draft: "bg-gray-500",
  scheduled: "bg-blue-500",
  publishing: "bg-yellow-500",
  published: "bg-green-500",
  failed: "bg-red-500",
  paused: "bg-orange-500",
};

const CONTENT_TYPE_ICONS = {
  post: <MessageSquare className="h-4 w-4" />,
  story: <Eye className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  image: <Eye className="h-4 w-4" />,
  carousel: <Eye className="h-4 w-4" />,
  reel: <Video className="h-4 w-4" />,
  thread: <MessageSquare className="h-4 w-4" />,
};

export default function CrossPlatformContentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [contentList, setContentList] = useState<CrossPlatformContent[]>([]);
  const [accounts, setAccounts] = useState<
    Record<CrossPlatformType, PlatformAccount[]>
  >({});
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContent, setSelectedContent] =
    useState<CrossPlatformContent | null>(null);

  // New content form state
  const [newContentForm, setNewContentForm] = useState({
    title: "",
    content: "",
    contentType: "post" as const,
    targetPlatforms: [] as CrossPlatformType[],
    hashtags: "",
    mentions: "",
    link: "",
    brandVoice: "professional" as const,
    publishingStrategy: "scheduled" as const,
    scheduledTime: "",
    approvalRequired: true,
  });

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load metrics
      const metricsResponse = await fetch(
        "/api/cross-platform-content?action=metrics"
      );
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.data);
      }

      // Load content
      const contentResponse = await fetch(
        "/api/cross-platform-content?action=content"
      );
      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        setContentList(contentData.data);
      }

      // Load accounts
      const accountsResponse = await fetch(
        "/api/cross-platform-content?action=accounts"
      );
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        setAccounts(accountsData.data);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createContent = async () => {
    try {
      const response = await fetch("/api/cross-platform-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          ...newContentForm,
          targetPlatforms: newContentForm.targetPlatforms,
          hashtags: newContentForm.hashtags
            .split(",")
            .map(h => h.trim())
            .filter(Boolean),
          mentions: newContentForm.mentions
            .split(",")
            .map(m => m.trim())
            .filter(Boolean),
          scheduledTime: newContentForm.scheduledTime
            ? new Date(newContentForm.scheduledTime)
            : undefined,
          userId: "current-user", // Would come from auth context
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setContentList(prev => [...prev, result.data]);

        // Reset form
        setNewContentForm({
          title: "",
          content: "",
          contentType: "post",
          targetPlatforms: [],
          hashtags: "",
          mentions: "",
          link: "",
          brandVoice: "professional",
          publishingStrategy: "scheduled",
          scheduledTime: "",
          approvalRequired: true,
        });

        setActiveTab("content");
      }
    } catch (error) {
      console.error("Error creating content:", error);
    }
  };

  const publishContent = async (
    contentId: string,
    strategy: "immediate" | "scheduled" = "immediate"
  ) => {
    try {
      const response = await fetch("/api/cross-platform-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: strategy === "immediate" ? "publish-immediate" : "schedule",
          contentId,
          strategy,
        }),
      });

      if (response.ok) {
        // Update content list
        setContentList(prev =>
          prev.map(content =>
            content.id === contentId
              ? {
                  ...content,
                  status: strategy === "immediate" ? "publishing" : "scheduled",
                }
              : content
          )
        );
      }
    } catch (error) {
      console.error("Error publishing content:", error);
    }
  };

  const getEngagementPrediction = (platforms: CrossPlatformType[]): number => {
    // Simple prediction based on connected platforms
    const engagementRates = {
      instagram: 3.2,
      linkedin: 2.1,
      facebook: 1.8,
      twitter: 2.5,
      tiktok: 5.1,
    };

    return (
      platforms.reduce((sum, platform) => sum + engagementRates[platform], 0) /
      platforms.length
    );
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading cross-platform dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6 dark:bg-gray-900 dark:text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Cross-Platform Content Manager
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Unified scheduling, publishing, and analytics for Instagram, LinkedIn,
          Facebook, Twitter/X, and TikTok.
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 dark:bg-gray-800">
          <TabsTrigger
            value="overview"
            className="dark:data-[state=active]:bg-gray-700"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="content"
            className="dark:data-[state=active]:bg-gray-700"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger
            value="create"
            className="dark:data-[state=active]:bg-gray-700"
          >
            <Play className="h-4 w-4 mr-2" />
            Create
          </TabsTrigger>
          <TabsTrigger
            value="calendar"
            className="dark:data-[state=active]:bg-gray-700"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="dark:data-[state=active]:bg-gray-700"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium dark:text-gray-200">
                      Total Content
                    </CardTitle>
                    <MessageSquare className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold dark:text-white">
                      {metrics.totalContent}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {metrics.scheduledContent} scheduled
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium dark:text-gray-200">
                      Connected Platforms
                    </CardTitle>
                    <Zap className="h-4 w-4 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold dark:text-white">
                      {metrics.connectedPlatforms}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {metrics.totalAccounts} accounts
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium dark:text-gray-200">
                      Published Today
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold dark:text-white">
                      {metrics.publishedContent}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {metrics.todayScheduled} scheduled today
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium dark:text-gray-200">
                      Engagement Rate
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold dark:text-white">
                      {metrics.weeklyEngagement.toFixed(1)}%
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Weekly average
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}

          {/* Platform Status */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Platform Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {(
                  [
                    "instagram",
                    "linkedin",
                    "facebook",
                    "twitter",
                    "tiktok",
                  ] as CrossPlatformType[]
                ).map(platform => {
                  const platformAccounts = accounts[platform] || [];
                  const isConnected = platformAccounts.length > 0;

                  return (
                    <div
                      key={platform}
                      className={`p-4 rounded-lg ${PLATFORM_COLORS[platform]} text-white`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        {PLATFORM_ICONS[platform]}
                        <Badge variant={isConnected ? "default" : "secondary"}>
                          {isConnected ? "Connected" : "Not Connected"}
                        </Badge>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium capitalize">{platform}</p>
                        <p className="opacity-80">
                          {platformAccounts.length} account
                          {platformAccounts.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid gap-6">
            {contentList.length === 0 ? (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium dark:text-white mb-2">
                    No Content Yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Start creating cross-platform content to see it here.
                  </p>
                  <NormalButton
                    onClick={() => setActiveTab("create")}
                    className="dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    Create Content
                  </NormalButton>
                </CardContent>
              </Card>
            ) : (
              contentList.map(content => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  layout
                >
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${STATUS_COLORS[content.status]}`}
                          />
                          <div>
                            <CardTitle className="dark:text-white">
                              {content.title ||
                                content.content.substring(0, 50) + "..."}
                            </CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(content.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="dark:border-gray-600 dark:text-gray-300"
                          >
                            {CONTENT_TYPE_ICONS[content.contentType]}
                            <span className="ml-1 capitalize">
                              {content.contentType}
                            </span>
                          </Badge>
                          <Badge
                            variant="outline"
                            className="dark:border-gray-600 dark:text-gray-300"
                          >
                            {content.status}
                          </Badge>
                          <NormalButton
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedContent(content)}
                            className="dark:hover:bg-gray-700"
                          >
                            <Eye className="h-4 w-4" />
                          </NormalButton>
                          {content.status === "draft" && (
                            <NormalButton
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                publishContent(content.id, "immediate")
                              }
                              className="dark:hover:bg-gray-700"
                            >
                              <Send className="h-4 w-4" />
                            </NormalButton>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="dark:text-gray-300">
                            Target Platforms: {content.targetPlatforms.length}
                          </span>
                          <span className="dark:text-gray-300">
                            Predicted Engagement:{" "}
                            {getEngagementPrediction(
                              content.targetPlatforms
                            ).toFixed(1)}
                            %
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {content.targetPlatforms.map(platform => (
                            <div
                              key={platform}
                              className={`px-2 py-1 rounded text-xs text-white ${PLATFORM_COLORS[platform]}`}
                            >
                              {PLATFORM_ICONS[platform]}
                              <span className="ml-1 capitalize">
                                {platform}
                              </span>
                            </div>
                          ))}
                        </div>

                        {content.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {content.hashtags
                              .slice(0, 5)
                              .map((hashtag, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs dark:bg-gray-700 dark:text-gray-300"
                                >
                                  #{hashtag}
                                </Badge>
                              ))}
                            {content.hashtags.length > 5 && (
                              <Badge
                                variant="secondary"
                                className="text-xs dark:bg-gray-700 dark:text-gray-300"
                              >
                                +{content.hashtags.length - 5} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {content.scheduledTime && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="h-4 w-4" />
                            <span>
                              Scheduled for {formatDate(content.scheduledTime)}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">
                Create Cross-Platform Content
              </CardTitle>
              <p className="text-gray-500 dark:text-gray-400">
                Create content optimized for multiple social media platforms.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="dark:text-gray-200">
                      Title (Optional)
                    </Label>
                    <Input
                      id="title"
                      value={newContentForm.title}
                      onChange={e =>
                        setNewContentForm(prev => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Content title or campaign name"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content" className="dark:text-gray-200">
                      Content *
                    </Label>
                    <Textarea
                      id="content"
                      value={newContentForm.content}
                      onChange={e =>
                        setNewContentForm(prev => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      placeholder="Write your content here..."
                      rows={5}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {newContentForm.content.length} characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="contentType" className="dark:text-gray-200">
                      Content Type
                    </Label>
                    <Select
                      value={newContentForm.contentType}
                      onValueChange={(value: any) =>
                        setNewContentForm(prev => ({
                          ...prev,
                          contentType: value,
                        }))
                      }
                    >
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                        <SelectItem value="post">Social Post</SelectItem>
                        <SelectItem value="story">Story</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="carousel">Carousel</SelectItem>
                        <SelectItem value="reel">Reel</SelectItem>
                        <SelectItem value="thread">Thread</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="hashtags" className="dark:text-gray-200">
                      Hashtags
                    </Label>
                    <Input
                      id="hashtags"
                      value={newContentForm.hashtags}
                      onChange={e =>
                        setNewContentForm(prev => ({
                          ...prev,
                          hashtags: e.target.value,
                        }))
                      }
                      placeholder="marketing, socialmedia, content"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Separate with commas
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="dark:text-gray-200">
                      Target Platforms *
                    </Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {(
                        [
                          "instagram",
                          "linkedin",
                          "facebook",
                          "twitter",
                          "tiktok",
                        ] as CrossPlatformType[]
                      ).map(platform => (
                        <div
                          key={platform}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={platform}
                            checked={newContentForm.targetPlatforms.includes(
                              platform
                            )}
                            onChange={e => {
                              if (e.target.checked) {
                                setNewContentForm(prev => ({
                                  ...prev,
                                  targetPlatforms: [
                                    ...prev.targetPlatforms,
                                    platform,
                                  ],
                                }));
                              } else {
                                setNewContentForm(prev => ({
                                  ...prev,
                                  targetPlatforms: prev.targetPlatforms.filter(
                                    p => p !== platform
                                  ),
                                }));
                              }
                            }}
                            className="dark:bg-gray-700 dark:border-gray-600"
                          />
                          <Label
                            htmlFor={platform}
                            className="text-sm capitalize dark:text-gray-300 flex items-center gap-1"
                          >
                            {PLATFORM_ICONS[platform]}
                            {platform}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="brandVoice" className="dark:text-gray-200">
                      Brand Voice
                    </Label>
                    <Select
                      value={newContentForm.brandVoice}
                      onValueChange={(value: any) =>
                        setNewContentForm(prev => ({
                          ...prev,
                          brandVoice: value,
                        }))
                      }
                    >
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                        <SelectItem value="professional">
                          Professional
                        </SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="authoritative">
                          Authoritative
                        </SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor="publishingStrategy"
                      className="dark:text-gray-200"
                    >
                      Publishing Strategy
                    </Label>
                    <Select
                      value={newContentForm.publishingStrategy}
                      onValueChange={(value: any) =>
                        setNewContentForm(prev => ({
                          ...prev,
                          publishingStrategy: value,
                        }))
                      }
                    >
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                        <SelectItem value="immediate">
                          Publish Immediately
                        </SelectItem>
                        <SelectItem value="scheduled">
                          Custom Schedule
                        </SelectItem>
                        <SelectItem value="optimal-timing">
                          Optimal Timing
                        </SelectItem>
                        <SelectItem value="cascade">
                          Cascade (Staggered)
                        </SelectItem>
                        <SelectItem value="synchronized">
                          Synchronized
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newContentForm.publishingStrategy === "scheduled" && (
                    <div>
                      <Label
                        htmlFor="scheduledTime"
                        className="dark:text-gray-200"
                      >
                        Scheduled Time
                      </Label>
                      <Input
                        id="scheduledTime"
                        type="datetime-local"
                        value={newContentForm.scheduledTime}
                        onChange={e =>
                          setNewContentForm(prev => ({
                            ...prev,
                            scheduledTime: e.target.value,
                          }))
                        }
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="approvalRequired"
                      checked={newContentForm.approvalRequired}
                      onCheckedChange={checked =>
                        setNewContentForm(prev => ({
                          ...prev,
                          approvalRequired: checked,
                        }))
                      }
                    />
                    <Label
                      htmlFor="approvalRequired"
                      className="dark:text-gray-200"
                    >
                      Require Approval
                    </Label>
                  </div>
                </div>
              </div>

              <Separator className="dark:border-gray-700" />

              <div className="flex justify-end gap-3">
                <NormalButton
                  variant="outline"
                  onClick={() =>
                    setNewContentForm({
                      title: "",
                      content: "",
                      contentType: "post",
                      targetPlatforms: [],
                      hashtags: "",
                      mentions: "",
                      link: "",
                      brandVoice: "professional",
                      publishingStrategy: "scheduled",
                      scheduledTime: "",
                      approvalRequired: true,
                    })
                  }
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Reset
                </NormalButton>
                <NormalButton
                  onClick={createContent}
                  disabled={
                    !newContentForm.content ||
                    newContentForm.targetPlatforms.length === 0
                  }
                  className="dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Create Content
                </NormalButton>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">
                Content Calendar
              </CardTitle>
              <p className="text-gray-500 dark:text-gray-400">
                Upcoming scheduled publications across all platforms.
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium dark:text-white mb-2">
                  Calendar View Coming Soon
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Visual calendar interface for content scheduling and
                  management.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">
                Cross-Platform Analytics
              </CardTitle>
              <p className="text-gray-500 dark:text-gray-400">
                Performance insights and engagement metrics across all
                platforms.
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium dark:text-white mb-2">
                  Analytics Coming Soon
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Comprehensive analytics and reporting features are in
                  development.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Content Detail Modal */}
      <AnimatePresence>
        {selectedContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedContent(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold dark:text-white">
                    {selectedContent.title || "Content Details"}
                  </h2>
                  <NormalButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedContent(null)}
                    className="dark:hover:bg-gray-700"
                  >
                    ×
                  </NormalButton>
                </div>
              </div>

              <ScrollArea className="h-96 p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2 dark:text-white">
                      Content
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedContent.content}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2 dark:text-white">
                      Target Platforms
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedContent.targetPlatforms.map(platform => (
                        <div
                          key={platform}
                          className={`px-2 py-1 rounded text-xs text-white ${PLATFORM_COLORS[platform]}`}
                        >
                          {PLATFORM_ICONS[platform]}
                          <span className="ml-1 capitalize">{platform}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedContent.hashtags.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2 dark:text-white">
                        Hashtags
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {selectedContent.hashtags.map((hashtag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs dark:bg-gray-700 dark:text-gray-300"
                          >
                            #{hashtag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium dark:text-white">
                        Status:
                      </span>
                      <p className="text-gray-600 dark:text-gray-300 capitalize">
                        {selectedContent.status}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium dark:text-white">
                        Content Type:
                      </span>
                      <p className="text-gray-600 dark:text-gray-300 capitalize">
                        {selectedContent.contentType}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium dark:text-white">
                        Brand Voice:
                      </span>
                      <p className="text-gray-600 dark:text-gray-300 capitalize">
                        {selectedContent.brandVoice}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium dark:text-white">
                        Strategy:
                      </span>
                      <p className="text-gray-600 dark:text-gray-300">
                        {selectedContent.publishingStrategy}
                      </p>
                    </div>
                  </div>

                  {selectedContent.scheduledTime && (
                    <div>
                      <span className="font-medium dark:text-white">
                        Scheduled Time:
                      </span>
                      <p className="text-gray-600 dark:text-gray-300">
                        {formatDate(selectedContent.scheduledTime)}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
