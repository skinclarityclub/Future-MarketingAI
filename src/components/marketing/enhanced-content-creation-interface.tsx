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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Copy,
  Share2,
  BarChart3,
  Target,
  Users,
  Eye,
  Check,
  X,
  AlertCircle,
  Zap,
  Save,
  Upload,
  Send,
  Settings,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  MessageSquare,
  Image,
  Video,
  Mail,
  Megaphone,
} from "lucide-react";

// Types
interface ContentPost {
  id: string;
  title: string;
  content: string;
  content_type:
    | "post"
    | "story"
    | "video"
    | "carousel"
    | "reel"
    | "email"
    | "ad"
    | "article"
    | "blog"
    | "newsletter";
  status:
    | "draft"
    | "scheduled"
    | "publishing"
    | "published"
    | "failed"
    | "archived"
    | "review_pending"
    | "approved"
    | "rejected";
  target_platforms: string[];
  hashtags: string[];
  target_audience?: string;
  engagement_prediction?: number;
  created_at: Date;
  updated_at: Date;
}

interface SocialAccount {
  id: string;
  account_name: string;
  platform: string;
  username?: string;
  status: string;
  posting_enabled: boolean;
  followers_count: number;
  engagement_rate: number;
}

const PLATFORMS = [
  { id: "facebook", name: "Facebook", icon: "📘", color: "bg-blue-500" },
  { id: "instagram", name: "Instagram", icon: "📷", color: "bg-pink-500" },
  { id: "twitter", name: "Twitter/X", icon: "🐦", color: "bg-black" },
  { id: "linkedin", name: "LinkedIn", icon: "💼", color: "bg-blue-600" },
  { id: "youtube", name: "YouTube", icon: "🎥", color: "bg-red-500" },
  { id: "tiktok", name: "TikTok", icon: "🎵", color: "bg-black" },
];

const CONTENT_TYPES = [
  { id: "post", name: "Social Post", icon: MessageSquare },
  { id: "story", name: "Story", icon: Image },
  { id: "video", name: "Video", icon: Video },
  { id: "email", name: "Email", icon: Mail },
  { id: "ad", name: "Advertisement", icon: Megaphone },
];

export default function EnhancedContentCreationInterface() {
  // State Management
  const [contentPosts, setContentPosts] = useState<ContentPost[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ContentPost | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [newContent, setNewContent] = useState({
    title: "",
    content: "",
    content_type: "post" as const,
    target_platforms: [] as string[],
    hashtags: "",
    target_audience: "",
    ai_generated: false,
    campaign_id: "",
  });

  // Publishing Options
  const [publishOptions, setPublishOptions] = useState({
    schedule_immediately: false,
    custom_timing: {} as Record<string, Date>,
    platform_customizations: {} as Record<string, any>,
  });

  // Load Data
  useEffect(() => {
    loadContentPosts();
    loadSocialAccounts();
  }, []);

  const loadContentPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "/api/marketing/enhanced-content-workflow?action=get_content"
      );
      const result = await response.json();

      if (result.success) {
        setContentPosts(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to load content posts");
    } finally {
      setLoading(false);
    }
  };

  const loadSocialAccounts = async () => {
    try {
      const response = await fetch(
        "/api/marketing/enhanced-content-workflow?action=get_accounts"
      );
      const result = await response.json();

      if (result.success) {
        setSocialAccounts(result.data);
      }
    } catch (err) {
      console.error("Failed to load social accounts:", err);
    }
  };

  // Create Content Post
  const handleCreateContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const contentData = {
        ...newContent,
        hashtags: newContent.hashtags
          .split(",")
          .map(tag => tag.trim())
          .filter(Boolean),
      };

      const response = await fetch("/api/marketing/enhanced-content-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_content",
          ...contentData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess("Content created successfully!");
        setIsCreateModalOpen(false);
        setNewContent({
          title: "",
          content: "",
          content_type: "post",
          target_platforms: [],
          hashtags: "",
          target_audience: "",
          ai_generated: false,
          campaign_id: "",
        });
        loadContentPosts();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to create content");
    } finally {
      setLoading(false);
    }
  };

  // Publish to Multiple Accounts
  const handlePublishToAccounts = async () => {
    if (!selectedPost || selectedAccounts.length === 0) {
      setError("Please select accounts to publish to");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/marketing/enhanced-content-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish_multi_account",
          postId: selectedPost.id,
          accountIds: selectedAccounts,
          publishOptions,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(
          `Published successfully to ${result.data.successful.length} accounts`
        );
        if (result.data.failed.length > 0) {
          setError(
            `Failed to publish to ${result.data.failed.length} accounts`
          );
        }
        setIsPublishModalOpen(false);
        loadContentPosts();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to publish content");
    } finally {
      setLoading(false);
    }
  };

  // Submit for Approval
  const handleSubmitForApproval = async (postId: string) => {
    try {
      setLoading(true);
      const response = await fetch("/api/marketing/enhanced-content-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_approval",
          postId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess("Content submitted for approval");
        loadContentPosts();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to submit for approval");
    } finally {
      setLoading(false);
    }
  };

  // Validate Content
  const handleValidateContent = async (
    content: ContentPost,
    platform: string
  ) => {
    try {
      const response = await fetch("/api/marketing/enhanced-content-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "validate_content",
          content,
          platform,
        }),
      });

      const result = await response.json();
      return result.data;
    } catch (err) {
      console.error("Validation failed:", err);
      return { valid: false, errors: ["Validation failed"], warnings: [] };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "scheduled":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "draft":
        return <Edit className="h-5 w-5 text-gray-500" />;
      case "review_pending":
        return <Eye className="h-5 w-5 text-yellow-500" />;
      case "approved":
        return <Check className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <X className="h-5 w-5 text-red-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getContentTypeIcon = (type: string) => {
    const typeConfig = CONTENT_TYPES.find(t => t.id === type);
    if (typeConfig) {
      const Icon = typeConfig.icon;
      return <Icon className="h-5 w-5" />;
    }
    return <MessageSquare className="h-5 w-5" />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Enhanced Content Creation Workflow
          </h1>
          <p className="text-muted-foreground">
            Multi-platform content creation with A/B testing and approval
            systems
          </p>
        </div>
        <NormalButton
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Content
        </NormalButton>
      </div>

      {/* Status Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="content-list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="content-list">Content Posts</TabsTrigger>
          <TabsTrigger value="social-accounts">Social Accounts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Content Posts Tab */}
        <TabsContent value="content-list" className="space-y-4">
          {loading && contentPosts.length === 0 ? (
            <div className="text-center py-8">Loading content posts...</div>
          ) : (
            <div className="grid gap-4">
              {contentPosts.map(post => (
                <Card
                  key={post.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getContentTypeIcon(post.content_type)}
                        <div>
                          <CardTitle className="text-lg">
                            {post.title}
                          </CardTitle>
                          <CardDescription>
                            {post.target_platforms.join(", ")} •{" "}
                            {post.target_audience}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(post.status)}
                        <Badge variant="outline">{post.status}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {post.content}
                      </p>

                      {/* Platform Badges */}
                      <div className="flex flex-wrap gap-2">
                        {post.target_platforms.map(platform => {
                          const platformConfig = PLATFORMS.find(
                            p => p.id === platform
                          );
                          return (
                            <Badge
                              key={platform}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <span>{platformConfig?.icon}</span>
                              {platformConfig?.name}
                            </Badge>
                          );
                        })}
                      </div>

                      {/* Hashtags */}
                      {post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.hashtags.slice(0, 5).map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {post.hashtags.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{post.hashtags.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Engagement Prediction */}
                      {post.engagement_prediction && (
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">
                            Predicted Engagement: {post.engagement_prediction}%
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <NormalButton
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPost(post);
                            setIsPublishModalOpen(true);
                          }}
                          disabled={post.status === "published"}
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Publish
                        </NormalButton>

                        {post.status === "draft" && (
                          <NormalButton
                            size="sm"
                            variant="outline"
                            onClick={() => handleSubmitForApproval(post.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Submit for Approval
                          </NormalButton>
                        )}

                        <NormalButton size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </NormalButton>

                        <NormalButton size="sm" variant="outline">
                          <Copy className="h-4 w-4 mr-1" />
                          Duplicate
                        </NormalButton>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Social Accounts Tab */}
        <TabsContent value="social-accounts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {socialAccounts.map(account => (
              <Card key={account.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          PLATFORMS.find(p => p.id === account.platform)
                            ?.color || "bg-gray-500"
                        }`}
                      >
                        {PLATFORMS.find(p => p.id === account.platform)?.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {account.account_name}
                        </CardTitle>
                        <CardDescription>@{account.username}</CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant={
                        account.status === "connected" ? "default" : "secondary"
                      }
                    >
                      {account.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Followers:</span>
                      <span className="font-medium">
                        {account.followers_count.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Engagement Rate:</span>
                      <span className="font-medium">
                        {account.engagement_rate}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Posting Enabled:</span>
                      <Switch checked={account.posting_enabled} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Posts
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contentPosts.length}</div>
                <p className="text-xs text-muted-foreground">
                  All content posts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {contentPosts.filter(p => p.status === "published").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Successfully published
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Approval
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    contentPosts.filter(p => p.status === "review_pending")
                      .length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting approval
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
                <div className="text-2xl font-bold">
                  {socialAccounts.filter(a => a.status === "connected").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active social accounts
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Content Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Content</DialogTitle>
            <DialogDescription>
              Create content for multiple platforms with approval workflow
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newContent.title}
                  onChange={e =>
                    setNewContent({ ...newContent, title: e.target.value })
                  }
                  placeholder="Content title"
                />
              </div>
              <div>
                <Label htmlFor="content_type">Content Type</Label>
                <Select
                  value={newContent.content_type}
                  onValueChange={(value: any) =>
                    setNewContent({ ...newContent, content_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={newContent.content}
                onChange={e =>
                  setNewContent({ ...newContent, content: e.target.value })
                }
                placeholder="Enter your content here..."
                rows={4}
              />
            </div>

            <div>
              <Label>Target Platforms</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {PLATFORMS.map(platform => (
                  <Badge
                    key={platform.id}
                    variant={
                      newContent.target_platforms.includes(platform.id)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => {
                      setNewContent(prev => ({
                        ...prev,
                        target_platforms: prev.target_platforms.includes(
                          platform.id
                        )
                          ? prev.target_platforms.filter(p => p !== platform.id)
                          : [...prev.target_platforms, platform.id],
                      }));
                    }}
                  >
                    <span className="mr-1">{platform.icon}</span>
                    {platform.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hashtags">Hashtags (comma separated)</Label>
                <Input
                  id="hashtags"
                  value={newContent.hashtags}
                  onChange={e =>
                    setNewContent({ ...newContent, hashtags: e.target.value })
                  }
                  placeholder="#marketing, #automation"
                />
              </div>
              <div>
                <Label htmlFor="target_audience">Target Audience</Label>
                <Input
                  id="target_audience"
                  value={newContent.target_audience}
                  onChange={e =>
                    setNewContent({
                      ...newContent,
                      target_audience: e.target.value,
                    })
                  }
                  placeholder="e.g., B2B professionals"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ai_generated"
                checked={newContent.ai_generated}
                onCheckedChange={checked =>
                  setNewContent({ ...newContent, ai_generated: checked })
                }
              />
              <Label htmlFor="ai_generated">AI Generated Content</Label>
            </div>
          </div>

          <DialogFooter>
            <NormalButton
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </NormalButton>
            <NormalButton onClick={handleCreateContent} disabled={loading}>
              {loading ? "Creating..." : "Create Content"}
            </NormalButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish Modal */}
      <Dialog open={isPublishModalOpen} onOpenChange={setIsPublishModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Publish to Multiple Accounts</DialogTitle>
            <DialogDescription>
              Select accounts and configure publishing options
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Select Social Accounts</Label>
              <div className="grid gap-2 mt-2 max-h-60 overflow-y-auto">
                {socialAccounts
                  .filter(
                    account =>
                      account.status === "connected" && account.posting_enabled
                  )
                  .map(account => (
                    <div
                      key={account.id}
                      className="flex items-center space-x-2 p-2 border rounded"
                    >
                      <input
                        type="checkbox"
                        id={account.id}
                        checked={selectedAccounts.includes(account.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedAccounts([
                              ...selectedAccounts,
                              account.id,
                            ]);
                          } else {
                            setSelectedAccounts(
                              selectedAccounts.filter(id => id !== account.id)
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor={account.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <span>
                          {PLATFORMS.find(p => p.id === account.platform)?.icon}
                        </span>
                        <span>{account.account_name}</span>
                        <Badge variant="outline">@{account.username}</Badge>
                      </label>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="schedule_immediately"
                checked={publishOptions.schedule_immediately}
                onCheckedChange={checked =>
                  setPublishOptions({
                    ...publishOptions,
                    schedule_immediately: checked,
                  })
                }
              />
              <Label htmlFor="schedule_immediately">Publish Immediately</Label>
            </div>
          </div>

          <DialogFooter>
            <NormalButton
              variant="outline"
              onClick={() => setIsPublishModalOpen(false)}
            >
              Cancel
            </NormalButton>
            <NormalButton
              onClick={handlePublishToAccounts}
              disabled={loading || selectedAccounts.length === 0}
            >
              {loading
                ? "Publishing..."
                : `Publish to ${selectedAccounts.length} account(s)`}
            </NormalButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
