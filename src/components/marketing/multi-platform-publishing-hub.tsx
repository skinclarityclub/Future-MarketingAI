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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Image,
  Video,
  FileText,
  Calendar,
  Users,
  TrendingUp,
  Share2,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Play,
  Pause,
  StopCircle,
  RefreshCw,
  Eye,
  BarChart3,
  Target,
  Zap,
  Globe,
} from "lucide-react";

// Types
interface PlatformAccount {
  id: string;
  platform:
    | "facebook"
    | "instagram"
    | "twitter"
    | "linkedin"
    | "youtube"
    | "tiktok";
  account_name: string;
  username: string;
  status: "connected" | "disconnected" | "error";
  followers_count: number;
  engagement_rate: number;
  posting_enabled: boolean;
  last_sync: Date;
}

interface PublishingPost {
  id: string;
  title: string;
  content: string;
  media_urls: string[];
  platforms: string[];
  scheduled_date?: Date;
  status:
    | "draft"
    | "queued"
    | "publishing"
    | "published"
    | "failed"
    | "cancelled";
  created_at: Date;
  engagement_prediction?: number;
  hashtags: string[];
  target_audience?: string;
  campaign_id?: string;
}

interface QueueItem {
  id: string;
  post_id: string;
  platform: string;
  account_id: string;
  scheduled_for: Date;
  status: "waiting" | "processing" | "completed" | "failed" | "retrying";
  attempts: number;
  error_message?: string;
  estimated_time?: Date;
  priority: "low" | "medium" | "high" | "urgent";
}

interface PublishingStats {
  total_posts_today: number;
  successful_publishes: number;
  failed_publishes: number;
  queue_length: number;
  average_engagement: number;
  top_performing_platform: string;
}

const PLATFORMS = [
  {
    id: "facebook",
    name: "Facebook",
    icon: "📘",
    color: "#1877F2",
    max_chars: 63206,
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "📷",
    color: "#E4405F",
    max_chars: 2200,
  },
  {
    id: "twitter",
    name: "Twitter/X",
    icon: "🐦",
    color: "#1DA1F2",
    max_chars: 280,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "💼",
    color: "#0A66C2",
    max_chars: 3000,
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: "🎥",
    color: "#FF0000",
    max_chars: 5000,
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "🎵",
    color: "#000000",
    max_chars: 2200,
  },
];

export default function MultiPlatformPublishingHub() {
  // State Management
  const [activeTab, setActiveTab] = useState("create");
  const [accounts, setAccounts] = useState<PlatformAccount[]>([]);
  const [posts, setPosts] = useState<PublishingPost[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<PublishingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  // Form State
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    platforms: [] as string[],
    scheduled_date: "",
    scheduled_time: "",
    hashtags: "",
    target_audience: "",
    media_files: [] as File[],
    campaign_id: "",
    publish_immediately: false,
  });

  // Load initial data
  useEffect(() => {
    loadPublishingData();
    const interval = setInterval(loadPublishingData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadPublishingData = async () => {
    try {
      setLoading(true);

      // Mock data for now - replace with actual API calls
      const mockAccounts: PlatformAccount[] = [
        {
          id: "acc-1",
          platform: "facebook",
          account_name: "SKC Business",
          username: "@skcbusiness",
          status: "connected",
          followers_count: 15420,
          engagement_rate: 4.8,
          posting_enabled: true,
          last_sync: new Date(Date.now() - 15 * 60 * 1000),
        },
        {
          id: "acc-2",
          platform: "instagram",
          account_name: "SKC Business",
          username: "@skcbusiness",
          status: "connected",
          followers_count: 8930,
          engagement_rate: 6.2,
          posting_enabled: true,
          last_sync: new Date(Date.now() - 20 * 60 * 1000),
        },
        {
          id: "acc-3",
          platform: "twitter",
          account_name: "SKC Business",
          username: "@skcbusiness",
          status: "connected",
          followers_count: 6780,
          engagement_rate: 2.1,
          posting_enabled: true,
          last_sync: new Date(Date.now() - 10 * 60 * 1000),
        },
        {
          id: "acc-4",
          platform: "linkedin",
          account_name: "SKC Company",
          username: "skc-company",
          status: "connected",
          followers_count: 3450,
          engagement_rate: 3.9,
          posting_enabled: true,
          last_sync: new Date(Date.now() - 45 * 60 * 1000),
        },
      ];

      const mockPosts: PublishingPost[] = [
        {
          id: "post-1",
          title: "Summer Sale Announcement",
          content:
            "🌞 Summer Sale is here! Get up to 50% off on all our BI Dashboard solutions...",
          media_urls: [],
          platforms: ["facebook", "instagram", "twitter"],
          status: "published",
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
          engagement_prediction: 85,
          hashtags: ["#SummerSale", "#BI", "#Analytics"],
          target_audience: "Business professionals",
        },
        {
          id: "post-2",
          title: "Product Demo Video",
          content:
            "Check out our latest BI Dashboard features in this comprehensive demo...",
          media_urls: [],
          platforms: ["youtube", "linkedin"],
          scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: "queued",
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000),
          engagement_prediction: 92,
          hashtags: ["#ProductDemo", "#BI", "#Technology"],
          target_audience: "Tech enthusiasts",
        },
      ];

      const mockQueue: QueueItem[] = [
        {
          id: "queue-1",
          post_id: "post-2",
          platform: "youtube",
          account_id: "acc-5",
          scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: "waiting",
          attempts: 0,
          priority: "medium",
        },
        {
          id: "queue-2",
          post_id: "post-2",
          platform: "linkedin",
          account_id: "acc-4",
          scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: "waiting",
          attempts: 0,
          priority: "medium",
        },
      ];

      const mockStats: PublishingStats = {
        total_posts_today: 12,
        successful_publishes: 10,
        failed_publishes: 2,
        queue_length: 8,
        average_engagement: 5.8,
        top_performing_platform: "instagram",
      };

      setAccounts(mockAccounts);
      setPosts(mockPosts);
      setQueue(mockQueue);
      setStats(mockStats);
    } catch (error) {
      console.error("Error loading publishing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishPost = async () => {
    if (!newPost.content.trim() || newPost.platforms.length === 0) {
      alert("Please add content and select at least one platform");
      return;
    }

    try {
      setPublishing(true);

      // Create the post
      const post: PublishingPost = {
        id: `post-${Date.now()}`,
        title: newPost.title || "Untitled Post",
        content: newPost.content,
        media_urls: [],
        platforms: newPost.platforms,
        scheduled_date: newPost.scheduled_date
          ? new Date(newPost.scheduled_date + "T" + newPost.scheduled_time)
          : undefined,
        status: newPost.publish_immediately ? "publishing" : "queued",
        created_at: new Date(),
        hashtags: newPost.hashtags
          .split(" ")
          .filter(tag => tag.startsWith("#")),
        target_audience: newPost.target_audience,
        campaign_id: newPost.campaign_id || undefined,
      };

      // Add to posts
      setPosts(prev => [post, ...prev]);

      // Add to queue for each platform
      const queueItems: QueueItem[] = newPost.platforms.map(platform => ({
        id: `queue-${Date.now()}-${platform}`,
        post_id: post.id,
        platform,
        account_id: accounts.find(acc => acc.platform === platform)?.id || "",
        scheduled_for: post.scheduled_date || new Date(),
        status: "waiting",
        attempts: 0,
        priority: "medium",
      }));

      setQueue(prev => [...prev, ...queueItems]);

      // Reset form
      setNewPost({
        title: "",
        content: "",
        platforms: [],
        scheduled_date: "",
        scheduled_time: "",
        hashtags: "",
        target_audience: "",
        media_files: [],
        campaign_id: "",
        publish_immediately: false,
      });

      alert("Post created successfully!");
    } catch (error) {
      console.error("Error publishing post:", error);
      alert("Error creating post");
    } finally {
      setPublishing(false);
    }
  };

  const getPlatformConfig = (platformId: string) => {
    return PLATFORMS.find(p => p.id === platformId);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: "bg-gray-500",
      queued: "bg-blue-500",
      publishing: "bg-purple-500",
      published: "bg-green-500",
      failed: "bg-red-500",
      cancelled: "bg-gray-400",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading publishing hub...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Multi-Platform Publishing Hub</h1>
          <p className="text-muted-foreground">
            Create, schedule, and publish content across all your social media
            platforms
          </p>
        </div>
        <NormalButton onClick={() => loadPublishingData()} variant="secondary">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </NormalButton>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Posts Today</p>
                  <p className="text-2xl font-bold">
                    {stats.total_posts_today}
                  </p>
                </div>
                <Send className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Successful</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.successful_publishes}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.failed_publishes}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Queue Length</p>
                  <p className="text-2xl font-bold">{stats.queue_length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Avg. Engagement
                  </p>
                  <p className="text-2xl font-bold">
                    {stats.average_engagement}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Top Platform</p>
                  <p className="text-lg font-bold capitalize">
                    {stats.top_performing_platform}
                  </p>
                </div>
                <Target className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">Create Post</TabsTrigger>
          <TabsTrigger value="queue">Publishing Queue</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Create Post Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Post</CardTitle>
              <CardDescription>
                Compose content and select platforms for publishing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Post Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Post Title (Optional)</Label>
                <Input
                  id="title"
                  value={newPost.title}
                  onChange={e =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                  placeholder="Enter post title..."
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={newPost.content}
                  onChange={e =>
                    setNewPost({ ...newPost, content: e.target.value })
                  }
                  placeholder="What would you like to share?"
                  rows={6}
                  className="resize-none"
                />
                <div className="text-sm text-muted-foreground">
                  {newPost.content.length} characters
                </div>
              </div>

              {/* Platform Selection */}
              <div className="space-y-4">
                <Label>Select Platforms *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {PLATFORMS.map(platform => {
                    const account = accounts.find(
                      acc => acc.platform === platform.id
                    );
                    const isSelected = newPost.platforms.includes(platform.id);
                    const isAvailable =
                      account?.status === "connected" &&
                      account?.posting_enabled;

                    return (
                      <div
                        key={platform.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : isAvailable
                              ? "border-gray-200 hover:border-gray-300"
                              : "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                        }`}
                        onClick={() => {
                          if (!isAvailable) return;

                          if (isSelected) {
                            setNewPost({
                              ...newPost,
                              platforms: newPost.platforms.filter(
                                p => p !== platform.id
                              ),
                            });
                          } else {
                            setNewPost({
                              ...newPost,
                              platforms: [...newPost.platforms, platform.id],
                            });
                          }
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{platform.icon}</div>
                          <div className="flex-1">
                            <p className="font-medium">{platform.name}</p>
                            {account && (
                              <p className="text-sm text-muted-foreground">
                                {account.followers_count.toLocaleString()}{" "}
                                followers
                              </p>
                            )}
                            {!isAvailable && (
                              <p className="text-sm text-red-500">
                                Not available
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="h-5 w-5 text-blue-500" />
                          )}
                        </div>

                        {/* Character limit indicator */}
                        {isSelected && newPost.content && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs">
                              <span>Character limit</span>
                              <span
                                className={
                                  newPost.content.length > platform.max_chars
                                    ? "text-red-500"
                                    : "text-green-500"
                                }
                              >
                                {newPost.content.length}/{platform.max_chars}
                              </span>
                            </div>
                            <Progress
                              value={
                                (newPost.content.length / platform.max_chars) *
                                100
                              }
                              className="h-1 mt-1"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hashtags */}
              <div className="space-y-2">
                <Label htmlFor="hashtags">Hashtags</Label>
                <Input
                  id="hashtags"
                  value={newPost.hashtags}
                  onChange={e =>
                    setNewPost({ ...newPost, hashtags: e.target.value })
                  }
                  placeholder="#marketing #socialmedia #business"
                />
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Input
                  id="audience"
                  value={newPost.target_audience}
                  onChange={e =>
                    setNewPost({ ...newPost, target_audience: e.target.value })
                  }
                  placeholder="e.g., Business professionals, Tech enthusiasts"
                />
              </div>

              {/* Scheduling */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Schedule Date (Optional)</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newPost.scheduled_date}
                    onChange={e =>
                      setNewPost({ ...newPost, scheduled_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Schedule Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newPost.scheduled_time}
                    onChange={e =>
                      setNewPost({ ...newPost, scheduled_time: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Publish Immediately Option */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="immediate"
                  checked={newPost.publish_immediately}
                  onCheckedChange={checked =>
                    setNewPost({
                      ...newPost,
                      publish_immediately: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="immediate">Publish immediately</Label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <NormalButton
                  variant="secondary"
                  onClick={() =>
                    setNewPost({
                      title: "",
                      content: "",
                      platforms: [],
                      scheduled_date: "",
                      scheduled_time: "",
                      hashtags: "",
                      target_audience: "",
                      media_files: [],
                      campaign_id: "",
                      publish_immediately: false,
                    })
                  }
                >
                  Clear
                </NormalButton>
                <NormalButton
                  onClick={handlePublishPost}
                  disabled={
                    publishing ||
                    !newPost.content.trim() ||
                    newPost.platforms.length === 0
                  }
                >
                  {publishing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : newPost.publish_immediately ? (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Publish Now
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      Schedule Post
                    </>
                  )}
                </NormalButton>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Publishing Queue Tab */}
        <TabsContent value="queue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publishing Queue</CardTitle>
              <CardDescription>
                Monitor scheduled posts and queue status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {queue.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No posts in queue</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {queue.map(item => {
                    const post = posts.find(p => p.id === item.post_id);
                    const platform = getPlatformConfig(item.platform);

                    return (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="text-xl">{platform?.icon}</div>
                            <div>
                              <p className="font-medium">
                                {post?.title || "Untitled Post"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {platform?.name} •{" "}
                                {item.scheduled_for.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              className={`${
                                item.status === "waiting"
                                  ? "bg-blue-500"
                                  : item.status === "processing"
                                    ? "bg-purple-500"
                                    : item.status === "completed"
                                      ? "bg-green-500"
                                      : item.status === "failed"
                                        ? "bg-red-500"
                                        : "bg-gray-500"
                              }`}
                            >
                              {item.status}
                            </Badge>
                            <Badge variant="outline">{item.priority}</Badge>
                          </div>
                        </div>

                        {post && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {post.content.slice(0, 100)}...
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Attempts: {item.attempts}</span>
                          <span>
                            Scheduled: {item.scheduled_for.toLocaleString()}
                          </span>
                        </div>

                        {item.error_message && (
                          <Alert className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              {item.error_message}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>
                Manage your social media accounts and connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accounts.map(account => {
                  const platform = getPlatformConfig(account.platform);

                  return (
                    <div key={account.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{platform?.icon}</div>
                          <div>
                            <p className="font-medium">
                              {account.account_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {account.username}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={`${
                            account.status === "connected"
                              ? "bg-green-500"
                              : account.status === "error"
                                ? "bg-red-500"
                                : "bg-gray-500"
                          }`}
                        >
                          {account.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Followers
                          </p>
                          <p className="font-medium">
                            {account.followers_count.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Engagement Rate
                          </p>
                          <p className="font-medium">
                            {account.engagement_rate}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          Last sync: {account.last_sync.toLocaleString()}
                        </span>
                        <div className="flex items-center space-x-2">
                          {account.posting_enabled ? (
                            <span className="text-green-600">
                              Posting enabled
                            </span>
                          ) : (
                            <span className="text-red-600">
                              Posting disabled
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publishing History</CardTitle>
              <CardDescription>
                View your recent posts and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts.map(post => (
                  <div key={post.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{post.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Created: {post.created_at.toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(post.status)}>
                        {post.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {post.content.slice(0, 150)}...
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          {post.platforms.map(platformId => {
                            const platform = getPlatformConfig(platformId);
                            return (
                              <span key={platformId} className="text-lg">
                                {platform?.icon}
                              </span>
                            );
                          })}
                        </div>
                        {post.engagement_prediction && (
                          <Badge variant="outline">
                            {post.engagement_prediction}% predicted engagement
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <NormalButton variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </NormalButton>
                        <NormalButton variant="ghost" size="sm">
                          <BarChart3 className="h-4 w-4" />
                        </NormalButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
