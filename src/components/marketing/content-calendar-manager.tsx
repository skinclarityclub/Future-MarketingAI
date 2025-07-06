"use client";

import React, { useState, useCallback, useMemo } from "react";
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
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import DragDropCalendar from "./drag-drop-calendar";
import EnhancedVisualCalendar from "./enhanced-visual-calendar";

// Enhanced types for content calendar management
interface ContentItem {
  id: string;
  title: string;
  type: "post" | "email" | "ad" | "story" | "video" | "campaign";
  platform: string[];
  scheduled_date: Date;
  scheduled_time: string;
  status:
    | "draft"
    | "scheduled"
    | "published"
    | "failed"
    | "approved"
    | "pending_approval";
  engagement_prediction?: number;
  author: string;
  content_preview: string;
  content_full: string;
  images?: string[];
  hashtags?: string[];
  target_audience?: string;
  campaign_id?: string;
  approval_status?: "pending" | "approved" | "rejected";
  approver?: string;
  notes?: string;
  duration?: number; // for videos
  audience_size?: number;
  budget?: number; // for ads
  objective?: string; // campaign objective
}

interface ContentTemplate {
  id: string;
  name: string;
  type: "post" | "email" | "ad" | "story" | "video" | "campaign";
  content: string;
  hashtags: string[];
  suggested_platforms: string[];
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  budget: number;
  status: "planning" | "active" | "paused" | "completed";
  content_items: string[]; // content item IDs
}

interface ContentCalendarManagerProps {
  className?: string;
}

const PLATFORMS = [
  { id: "facebook", name: "Facebook", icon: "📘" },
  { id: "instagram", name: "Instagram", icon: "📷" },
  { id: "twitter", name: "Twitter", icon: "🐦" },
  { id: "linkedin", name: "LinkedIn", icon: "💼" },
  { id: "youtube", name: "YouTube", icon: "🎥" },
  { id: "tiktok", name: "TikTok", icon: "🎵" },
  { id: "email", name: "Email", icon: "📧" },
];

const CONTENT_TYPES = [
  { id: "post", name: "Social Post", icon: "📝" },
  { id: "story", name: "Story", icon: "📸" },
  { id: "video", name: "Video", icon: "🎥" },
  { id: "email", name: "Email", icon: "📧" },
  { id: "ad", name: "Advertisement", icon: "📢" },
  { id: "campaign", name: "Campaign", icon: "🚀" },
];

const CONTENT_TEMPLATES: ContentTemplate[] = [
  {
    id: "template-1",
    name: "Product Announcement",
    type: "post",
    content:
      "🚀 Exciting news! We're thrilled to announce our latest {PRODUCT_NAME}. {PRODUCT_DESCRIPTION} #ProductLaunch #Innovation",
    hashtags: ["#ProductLaunch", "#Innovation", "#NewProduct"],
    suggested_platforms: ["facebook", "twitter", "linkedin"],
  },
  {
    id: "template-2",
    name: "Behind the Scenes",
    type: "story",
    content:
      "Take a peek behind the scenes at {COMPANY_NAME}! Our team is working hard to bring you amazing {PRODUCT_TYPE}. What would you like to see more of?",
    hashtags: ["#BehindTheScenes", "#TeamWork", "#Company"],
    suggested_platforms: ["instagram", "facebook"],
  },
  {
    id: "template-3",
    name: "Weekly Newsletter",
    type: "email",
    content:
      "📬 Weekly Insights from {COMPANY_NAME}\n\nThis week's highlights:\n• {HIGHLIGHT_1}\n• {HIGHLIGHT_2}\n• {HIGHLIGHT_3}\n\nStay tuned for more updates!",
    hashtags: [],
    suggested_platforms: ["email"],
  },
];

// Mock data
const mockContentItems: ContentItem[] = [
  {
    id: "content-1",
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
    content_full:
      "🌞 Summer Sale is here! Get up to 50% off on all products. Limited time offer, shop now! #SummerSale #Discount #ShopNow",
    hashtags: ["#SummerSale", "#Discount", "#ShopNow"],
    target_audience: "All customers",
    approval_status: "approved",
    approver: "Sarah Johnson",
  },
  {
    id: "content-2",
    title: "Product Demo Video",
    type: "video",
    platform: ["youtube", "linkedin"],
    scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    scheduled_time: "14:00",
    status: "draft",
    engagement_prediction: 92,
    author: "Product Team",
    content_preview: "New product demo showcasing our latest features...",
    content_full:
      "Check out our latest product demo! See how our new features can transform your workflow. Subscribe for more updates!",
    duration: 180, // 3 minutes
    target_audience: "B2B customers",
    approval_status: "pending",
  },
];

export default function ContentCalendarManager({
  className = "",
}: ContentCalendarManagerProps) {
  const [contentItems, setContentItems] =
    useState<ContentItem[]>(mockContentItems);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("calendar");

  // Form state for creating/editing content
  const [formData, setFormData] = useState<Partial<ContentItem>>({});

  // Filtered content based on search and filters
  const filteredContent = useMemo(() => {
    return contentItems.filter(item => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content_preview.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlatform =
        filterPlatform === "all" || item.platform.includes(filterPlatform);
      const matchesStatus =
        filterStatus === "all" || item.status === filterStatus;

      return matchesSearch && matchesPlatform && matchesStatus;
    });
  }, [contentItems, searchTerm, filterPlatform, filterStatus]);

  // Calendar event handlers
  const handleEventMove = useCallback((eventId: string, newDate: Date) => {
    setContentItems(prev =>
      prev.map(item =>
        item.id === eventId ? { ...item, scheduled_date: newDate } : item
      )
    );
  }, []);

  const handleEventCreate = useCallback((date: Date) => {
    setFormData({
      scheduled_date: date,
      scheduled_time: "09:00",
      type: "post",
      platform: ["facebook"],
      status: "draft",
    });
    setIsCreateModalOpen(true);
  }, []);

  const handleEventEdit = useCallback((event: ContentItem) => {
    setSelectedContent(event);
    setFormData(event);
    setIsEditModalOpen(true);
  }, []);

  const handleEventDelete = useCallback((eventId: string) => {
    setContentItems(prev => prev.filter(item => item.id !== eventId));
  }, []);

  // Content management functions
  const createContentItem = () => {
    if (!formData.title || !formData.content_full) return;

    const newItem: ContentItem = {
      id: `content-${Date.now()}`,
      title: formData.title,
      type: formData.type || "post",
      platform: formData.platform || ["facebook"],
      scheduled_date: formData.scheduled_date || new Date(),
      scheduled_time: formData.scheduled_time || "09:00",
      status: "draft",
      author: "Current User", // In real app, get from auth
      content_preview: formData.content_full?.substring(0, 50) + "..." || "",
      content_full: formData.content_full,
      hashtags: formData.hashtags || [],
      target_audience: formData.target_audience || "",
      approval_status: "pending",
      ...formData,
    };

    setContentItems(prev => [...prev, newItem]);
    setFormData({});
    setIsCreateModalOpen(false);
  };

  const updateContentItem = () => {
    if (!selectedContent || !formData.title) return;

    setContentItems(prev =>
      prev.map(item =>
        item.id === selectedContent.id
          ? {
              ...item,
              ...formData,
              content_preview:
                formData.content_full?.substring(0, 50) + "..." ||
                item.content_preview,
            }
          : item
      )
    );

    setSelectedContent(null);
    setFormData({});
    setIsEditModalOpen(false);
  };

  const duplicateContent = (item: ContentItem) => {
    const duplicated: ContentItem = {
      ...item,
      id: `content-${Date.now()}`,
      title: `${item.title} (Copy)`,
      status: "draft",
      scheduled_date: new Date(
        item.scheduled_date.getTime() + 24 * 60 * 60 * 1000
      ), // Next day
    };
    setContentItems(prev => [...prev, duplicated]);
  };

  const approveContent = (contentId: string) => {
    setContentItems(prev =>
      prev.map(item =>
        item.id === contentId
          ? {
              ...item,
              approval_status: "approved",
              status: "scheduled",
              approver: "Current User",
            }
          : item
      )
    );
  };

  const rejectContent = (contentId: string) => {
    setContentItems(prev =>
      prev.map(item =>
        item.id === contentId
          ? { ...item, approval_status: "rejected", status: "draft" }
          : item
      )
    );
  };

  const applyTemplate = (template: ContentTemplate) => {
    setFormData(prev => ({
      ...prev,
      type: template.type,
      platform: template.suggested_platforms,
      content_full: template.content,
      hashtags: template.hashtags,
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "text-green-600";
      case "scheduled":
        return "text-blue-600";
      case "approved":
        return "text-green-600";
      case "pending_approval":
        return "text-yellow-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with filters and actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Content Calendar Management</CardTitle>
              <CardDescription>
                Schedule, manage, and track your marketing content across all
                platforms
              </CardDescription>
            </div>

            <div className="flex gap-2">
              <NormalButton
                onClick={() => setIsCreateModalOpen(true)}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Content
              </NormalButton>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />

            <Select value={filterPlatform} onValueChange={setFilterPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {PLATFORMS.map(platform => (
                  <SelectItem key={platform.id} value={platform.id}>
                    {platform.icon} {platform.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="pending_approval">
                  Pending Approval
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground">
              {filteredContent.length} items
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar">
          <DragDropCalendar
            events={filteredContent}
            onEventMove={handleEventMove}
            onEventCreate={handleEventCreate}
            onEventEdit={handleEventEdit}
            onEventDelete={handleEventDelete}
          />
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="space-y-4">
          <div className="grid gap-4">
            {filteredContent.map(item => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {CONTENT_TYPES.find(t => t.id === item.type)?.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <CardDescription>
                          {item.platform
                            .map(p => PLATFORMS.find(pl => pl.id === p)?.icon)
                            .join(" ")}{" "}
                          •{item.scheduled_date.toLocaleDateString()} at{" "}
                          {item.scheduled_time} • By {item.author}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={getStatusColor(item.status)}
                      >
                        {item.status}
                      </Badge>
                      {item.approval_status === "pending" && (
                        <Badge variant="secondary">Pending Approval</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {item.content_preview}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      {item.engagement_prediction && (
                        <span className="text-green-600">
                          📈 {item.engagement_prediction}% predicted engagement
                        </span>
                      )}
                      {item.target_audience && (
                        <span className="text-blue-600">
                          🎯 {item.target_audience}
                        </span>
                      )}
                      {item.budget && (
                        <span className="text-purple-600">
                          💰 €{item.budget}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {item.approval_status === "pending" && (
                        <>
                          <NormalButton
                            size="sm"
                            variant="secondary"
                            onClick={() => approveContent(item.id)}
                            className="text-green-600"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Approve
                          </NormalButton>
                          <NormalButton
                            size="sm"
                            variant="secondary"
                            onClick={() => rejectContent(item.id)}
                            className="text-red-600"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Reject
                          </NormalButton>
                        </>
                      )}
                      <NormalButton
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEventEdit(item)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </NormalButton>
                      <NormalButton
                        size="sm"
                        variant="secondary"
                        onClick={() => duplicateContent(item)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Duplicate
                      </NormalButton>
                      <NormalButton size="sm" variant="secondary">
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </NormalButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics View */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contentItems.length}</div>
                <p className="text-xs text-muted-foreground">
                  {contentItems.filter(i => i.status === "scheduled").length}{" "}
                  scheduled
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pending Approval</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {
                    contentItems.filter(i => i.approval_status === "pending")
                      .length
                  }
                </div>
                <p className="text-xs text-muted-foreground">Require review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Avg. Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(
                    contentItems
                      .filter(i => i.engagement_prediction)
                      .reduce(
                        (sum, i) => sum + (i.engagement_prediction || 0),
                        0
                      ) /
                      contentItems.filter(i => i.engagement_prediction).length
                  ) || 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  Predicted performance
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Content Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Content</DialogTitle>
            <DialogDescription>
              Schedule new marketing content across your platforms
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Content Templates */}
            <div>
              <Label className="text-sm font-medium">Quick Templates</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {CONTENT_TEMPLATES.map(template => (
                  <NormalButton
                    key={template.id}
                    variant="secondary"
                    size="sm"
                    onClick={() => applyTemplate(template)}
                    className="text-xs"
                  >
                    {template.name}
                  </NormalButton>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title || ""}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Content title"
                />
              </div>

              <div>
                <Label htmlFor="type">Content Type</Label>
                <Select
                  value={formData.type || "post"}
                  onValueChange={(value: any) =>
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.icon} {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content_full || ""}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    content_full: e.target.value,
                  }))
                }
                placeholder="Write your content here..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Scheduled Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={
                    formData.scheduled_date?.toISOString().split("T")[0] || ""
                  }
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      scheduled_date: new Date(e.target.value),
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="time">Scheduled Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.scheduled_time || "09:00"}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      scheduled_time: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <Label>Platforms</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {PLATFORMS.map(platform => (
                  <div
                    key={platform.id}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      id={platform.id}
                      checked={
                        formData.platform?.includes(platform.id) || false
                      }
                      onChange={e => {
                        const platforms = formData.platform || [];
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            platform: [...platforms, platform.id],
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            platform: platforms.filter(p => p !== platform.id),
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={platform.id} className="text-sm">
                      {platform.icon} {platform.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="audience">Target Audience</Label>
              <Input
                id="audience"
                value={formData.target_audience || ""}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    target_audience: e.target.value,
                  }))
                }
                placeholder="e.g., All customers, B2B prospects"
              />
            </div>
          </div>

          <DialogFooter>
            <NormalButton
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </NormalButton>
            <NormalButton onClick={createContentItem}>
              <Save className="h-4 w-4 mr-2" />
              Create Content
            </NormalButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Content Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>Update your marketing content</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title || ""}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Content title"
                />
              </div>

              <div>
                <Label htmlFor="edit-type">Content Type</Label>
                <Select
                  value={formData.type || "post"}
                  onValueChange={(value: any) =>
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.icon} {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-content">Content *</Label>
              <Textarea
                id="edit-content"
                value={formData.content_full || ""}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    content_full: e.target.value,
                  }))
                }
                placeholder="Write your content here..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-date">Scheduled Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={
                    formData.scheduled_date?.toISOString().split("T")[0] || ""
                  }
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      scheduled_date: new Date(e.target.value),
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="edit-time">Scheduled Time</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={formData.scheduled_time || "09:00"}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      scheduled_time: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <Label>Platforms</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {PLATFORMS.map(platform => (
                  <div
                    key={platform.id}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      id={`edit-${platform.id}`}
                      checked={
                        formData.platform?.includes(platform.id) || false
                      }
                      onChange={e => {
                        const platforms = formData.platform || [];
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            platform: [...platforms, platform.id],
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            platform: platforms.filter(p => p !== platform.id),
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={`edit-${platform.id}`} className="text-sm">
                      {platform.icon} {platform.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="edit-audience">Target Audience</Label>
              <Input
                id="edit-audience"
                value={formData.target_audience || ""}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    target_audience: e.target.value,
                  }))
                }
                placeholder="e.g., All customers, B2B prospects"
              />
            </div>

            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes || ""}
                onChange={e =>
                  setFormData(prev => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Add any additional notes..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <NormalButton
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </NormalButton>
            <NormalButton onClick={updateContentItem}>
              <Save className="h-4 w-4 mr-2" />
              Update Content
            </NormalButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
