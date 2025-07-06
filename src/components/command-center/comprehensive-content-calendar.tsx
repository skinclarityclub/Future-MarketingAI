"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Eye,
  Send,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Settings,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Zap,
  Upload,
  Download,
  Share2,
  BarChart3,
  Users,
  Megaphone,
  Play,
  Pause,
  RefreshCw,
  Grid3X3,
  List,
  TrendingUp,
} from "lucide-react";

// Enhanced interfaces for comprehensive calendar
interface ContentCalendarEntry {
  id: string;
  title: string;
  description?: string;
  calendar_date: Date;
  time_slot: string;
  content_type: "post" | "story" | "video" | "email" | "ad" | "campaign";
  target_platforms: string[];
  target_accounts: string[];
  status:
    | "planned"
    | "in_progress"
    | "ready"
    | "scheduled"
    | "published"
    | "cancelled"
    | "failed";
  priority: "low" | "medium" | "high" | "urgent";
  auto_generated: boolean;
  ai_suggestions: Record<string, any>;
  recurring_pattern?: Record<string, any>;
  is_recurring: boolean;
  parent_calendar_id?: string;
  campaign_id?: string;
  assigned_to?: string;
  expected_engagement?: number;
  target_audience?: string;
  content_theme?: string;
  seasonal_tag?: string;
  blotato_schedule_id?: string;
  conflicts?: string[];
  author: string;
  content_preview: string;
  media_urls?: string[];
  hashtags?: string[];
  approval_status?: "pending" | "approved" | "rejected";
  analytics_tracking_id?: string;
  budget?: number;
  duration?: number;
}

interface CalendarMetrics {
  total_scheduled: number;
  publishing_today: number;
  success_rate: number;
  avg_engagement: number;
  platform_distribution: Record<string, number>;
  content_type_distribution: Record<string, number>;
  upcoming_conflicts: number;
  auto_generated_percentage: number;
}

interface CalendarDay {
  date: Date;
  events: ContentCalendarEntry[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  hasConflicts: boolean;
  conflictCount: number;
}

type CalendarView = "month" | "week" | "day" | "agenda" | "campaign";

interface ComprehensiveContentCalendarProps {
  className?: string;
  commandCenterMode?: boolean;
  showHeader?: boolean;
  maxHeight?: string;
  enableBlotato?: boolean;
  enableAI?: boolean;
  enableRealTime?: boolean;
  onContentCreate?: (content: Partial<ContentCalendarEntry>) => void;
  onContentUpdate?: (
    id: string,
    updates: Partial<ContentCalendarEntry>
  ) => void;
  onContentDelete?: (id: string) => void;
  onBulkSchedule?: (entries: ContentCalendarEntry[]) => void;
}

const PLATFORM_COLORS = {
  facebook: "bg-blue-600",
  instagram: "bg-gradient-to-r from-purple-500 to-pink-500",
  twitter: "bg-blue-400",
  linkedin: "bg-blue-700",
  youtube: "bg-red-600",
  tiktok: "bg-gray-900",
  blotato: "bg-green-600",
};

const CONTENT_TYPE_ICONS = {
  post: "📝",
  story: "📖",
  video: "🎥",
  email: "📧",
  ad: "📢",
  campaign: "🎯",
};

const STATUS_COLORS = {
  planned: "border-gray-400 bg-gray-50 text-gray-700",
  in_progress: "border-yellow-400 bg-yellow-50 text-yellow-700",
  ready: "border-blue-400 bg-blue-50 text-blue-700",
  scheduled: "border-purple-400 bg-purple-50 text-purple-700",
  published: "border-green-400 bg-green-50 text-green-700",
  cancelled: "border-red-400 bg-red-50 text-red-700",
  failed: "border-red-600 bg-red-100 text-red-800",
};

const PRIORITY_COLORS = {
  low: "border-l-gray-400",
  medium: "border-l-yellow-400",
  high: "border-l-orange-400",
  urgent: "border-l-red-500",
};

export default function ComprehensiveContentCalendar({
  className = "",
  commandCenterMode = false,
  showHeader = true,
  maxHeight = "800px",
  enableBlotato = true,
  enableAI = true,
  enableRealTime = true,
  onContentCreate,
  onContentUpdate,
  onContentDelete,
  onBulkSchedule,
}: ComprehensiveContentCalendarProps) {
  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [entries, setEntries] = useState<ContentCalendarEntry[]>([]);
  const [metrics, setMetrics] = useState<CalendarMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(
    new Set()
  );
  const [draggedEntry, setDraggedEntry] = useState<ContentCalendarEntry | null>(
    null
  );
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);
  const [isRealTimeActive, setIsRealTimeActive] = useState(enableRealTime);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [showConflicts, setShowConflicts] = useState(true);
  const [showAI, setShowAI] = useState(true);

  // Load calendar data
  const loadCalendarData = useCallback(async () => {
    try {
      setLoading(true);

      // Load entries from API
      const entriesResponse = await fetch(
        "/api/marketing/content-calendar-automation"
      );
      if (entriesResponse.ok) {
        const entriesData = await entriesResponse.json();
        setEntries(entriesData.data?.calendar_entries || []);
      }

      // Load metrics
      const metricsResponse = await fetch(
        "/api/marketing/content-calendar-automation?calendar_analytics=true"
      );
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.data?.analytics || null);
      }
    } catch (error) {
      console.error("Error loading calendar data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time updates
  useEffect(() => {
    loadCalendarData();

    let interval: NodeJS.Timeout;
    if (isRealTimeActive) {
      interval = setInterval(loadCalendarData, 30000); // Update every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loadCalendarData, isRealTimeActive]);

  // Filter entries based on current filters
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch =
        searchTerm === "" ||
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content_preview?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || entry.status === filterStatus;
      const matchesPlatform =
        filterPlatform === "all" ||
        entry.target_platforms.includes(filterPlatform);

      return matchesSearch && matchesStatus && matchesPlatform;
    });
  }, [entries, searchTerm, filterStatus, filterPlatform]);

  // Generate calendar days for current view
  const generateCalendarDays = useCallback((): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days: CalendarDay[] = [];

    let startDate: Date;
    let endDate: Date;

    if (view === "month") {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      startDate = new Date(firstDay);
      const dayOfWeek = firstDay.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate.setDate(firstDay.getDate() - daysToSubtract);

      endDate = new Date(lastDay);
      const endDayOfWeek = lastDay.getDay();
      const daysToAdd = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek;
      endDate.setDate(lastDay.getDate() + daysToAdd);
    } else if (view === "week") {
      startDate = new Date(currentDate);
      const dayOfWeek = currentDate.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate.setDate(currentDate.getDate() - daysToSubtract);

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else {
      startDate = new Date(currentDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(currentDate);
      endDate.setHours(23, 59, 59, 999);
    }

    const currentDateObj = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (currentDateObj <= endDate) {
      const dateStr = currentDateObj.toISOString().split("T")[0];
      const dayEntries = filteredEntries.filter(entry => {
        const entryDate = new Date(entry.calendar_date);
        return entryDate.toISOString().split("T")[0] === dateStr;
      });

      const currentDateCopy = new Date(currentDateObj);
      currentDateCopy.setHours(0, 0, 0, 0);

      const conflicts = dayEntries.filter(
        entry => entry.conflicts && entry.conflicts.length > 0
      );

      days.push({
        date: new Date(currentDateObj),
        events: dayEntries,
        isCurrentMonth:
          view === "month" ? currentDateObj.getMonth() === month : true,
        isToday: currentDateCopy.getTime() === today.getTime(),
        isPast: currentDateCopy < today,
        hasConflicts: conflicts.length > 0,
        conflictCount: conflicts.length,
      });

      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }

    return days;
  }, [currentDate, view, filteredEntries]);

  const calendarDays = generateCalendarDays();

  // Navigation functions
  const navigatePeriod = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (view === "month") {
        newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      } else if (view === "week") {
        newDate.setDate(prev.getDate() + (direction === "next" ? 7 : -7));
      } else if (view === "day") {
        newDate.setDate(prev.getDate() + (direction === "next" ? 1 : -1));
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, entry: ContentCalendarEntry) => {
    setDraggedEntry(entry);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverDate(date);
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    setDragOverDate(null);

    if (draggedEntry && onContentUpdate) {
      onContentUpdate(draggedEntry.id, { calendar_date: date });
      setDraggedEntry(null);
    }
  };

  // Event handlers
  const handleCreateContent = (date: Date) => {
    if (onContentCreate) {
      onContentCreate({
        calendar_date: date,
        time_slot: "09:00",
        status: "planned",
        priority: "medium",
        target_platforms: ["facebook"],
        auto_generated: false,
      });
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = () => {
    if (view === "month") {
      return currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } else if (view === "week") {
      const startOfWeek = new Date(currentDate);
      const dayOfWeek = currentDate.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(currentDate.getDate() - daysToSubtract);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return `${startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    } else {
      return currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  if (loading) {
    return (
      <Card
        className={`${commandCenterMode ? "bg-black/20 backdrop-blur-lg border-white/10" : ""} ${className}`}
      >
        <CardHeader>
          <CardTitle className={commandCenterMode ? "text-white" : ""}>
            Loading Content Calendar...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className={`space-y-6 ${className}`}
      style={{ maxHeight, overflowY: "auto" }}
    >
      {/* Header */}
      {showHeader && (
        <Card
          className={
            commandCenterMode
              ? "bg-black/20 backdrop-blur-lg border-white/10"
              : ""
          }
        >
          <CardHeader>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <CardTitle
                  className={`flex items-center gap-2 ${commandCenterMode ? "text-white" : ""}`}
                >
                  <Calendar className="h-5 w-5" />
                  Comprehensive Content Calendar
                  {enableBlotato && (
                    <Badge className="bg-green-900/30 text-green-300 border-green-500/30">
                      Blotato Integrated
                    </Badge>
                  )}
                  {isRealTimeActive && (
                    <Badge className="bg-blue-900/30 text-blue-300 border-blue-500/30">
                      <Activity className="h-3 w-3 mr-1" />
                      Live
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription
                  className={commandCenterMode ? "text-white/70" : ""}
                >
                  Unified drag-and-drop calendar with Blotato integration and
                  AI-powered automation
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <NormalButton
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRealTimeActive(!isRealTimeActive)}
                  className={
                    commandCenterMode ? "border-white/20 text-white" : ""
                  }
                >
                  {isRealTimeActive ? (
                    <Pause className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </NormalButton>
                <NormalButton
                  variant="outline"
                  size="sm"
                  onClick={loadCalendarData}
                  className={
                    commandCenterMode ? "border-white/20 text-white" : ""
                  }
                >
                  <RefreshCw className="h-3 w-3" />
                </NormalButton>
                <NormalButton
                  variant="primary"
                  size="sm"
                  onClick={() => handleCreateContent(new Date())}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Create Content
                </NormalButton>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card
            className={
              commandCenterMode
                ? "bg-black/10 backdrop-blur-lg border-white/10"
                : ""
            }
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-sm ${commandCenterMode ? "text-white/70" : "text-muted-foreground"}`}
                  >
                    Total Scheduled
                  </p>
                  <p
                    className={`text-2xl font-bold ${commandCenterMode ? "text-white" : ""}`}
                  >
                    {metrics.total_scheduled}
                  </p>
                </div>
                <Calendar
                  className={`h-8 w-8 ${commandCenterMode ? "text-cyan-400" : "text-blue-500"}`}
                />
              </div>
            </CardContent>
          </Card>

          <Card
            className={
              commandCenterMode
                ? "bg-black/10 backdrop-blur-lg border-white/10"
                : ""
            }
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-sm ${commandCenterMode ? "text-white/70" : "text-muted-foreground"}`}
                  >
                    Publishing Today
                  </p>
                  <p
                    className={`text-2xl font-bold ${commandCenterMode ? "text-white" : ""}`}
                  >
                    {metrics.publishing_today}
                  </p>
                </div>
                <Send
                  className={`h-8 w-8 ${commandCenterMode ? "text-green-400" : "text-green-500"}`}
                />
              </div>
            </CardContent>
          </Card>

          <Card
            className={
              commandCenterMode
                ? "bg-black/10 backdrop-blur-lg border-white/10"
                : ""
            }
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-sm ${commandCenterMode ? "text-white/70" : "text-muted-foreground"}`}
                  >
                    Success Rate
                  </p>
                  <p
                    className={`text-2xl font-bold ${commandCenterMode ? "text-white" : ""}`}
                  >
                    {metrics.success_rate}%
                  </p>
                </div>
                <TrendingUp
                  className={`h-8 w-8 ${commandCenterMode ? "text-purple-400" : "text-purple-500"}`}
                />
              </div>
            </CardContent>
          </Card>

          <Card
            className={
              commandCenterMode
                ? "bg-black/10 backdrop-blur-lg border-white/10"
                : ""
            }
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-sm ${commandCenterMode ? "text-white/70" : "text-muted-foreground"}`}
                  >
                    Avg Engagement
                  </p>
                  <p
                    className={`text-2xl font-bold ${commandCenterMode ? "text-white" : ""}`}
                  >
                    {metrics.avg_engagement}%
                  </p>
                </div>
                <BarChart3
                  className={`h-8 w-8 ${commandCenterMode ? "text-orange-400" : "text-orange-500"}`}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation and Controls */}
      <Card
        className={
          commandCenterMode
            ? "bg-black/10 backdrop-blur-lg border-white/10"
            : ""
        }
      >
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* Date Navigation */}
            <div className="flex items-center gap-4">
              <NormalButton
                variant="outline"
                size="sm"
                onClick={() => navigatePeriod("prev")}
                className={
                  commandCenterMode ? "border-white/20 text-white" : ""
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </NormalButton>

              <div className="text-center">
                <h2
                  className={`text-xl font-semibold ${commandCenterMode ? "text-white" : ""}`}
                >
                  {formatDate()}
                </h2>
              </div>

              <NormalButton
                variant="outline"
                size="sm"
                onClick={() => navigatePeriod("next")}
                className={
                  commandCenterMode ? "border-white/20 text-white" : ""
                }
              >
                <ChevronRight className="h-4 w-4" />
              </NormalButton>

              <NormalButton
                variant="outline"
                size="sm"
                onClick={goToToday}
                className={
                  commandCenterMode ? "border-white/20 text-white" : ""
                }
              >
                Today
              </NormalButton>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-4">
              <Select
                value={view}
                onValueChange={value => setView(value as CalendarView)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="agenda">Agenda</SelectItem>
                  <SelectItem value="campaign">Campaign</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Switch
                  checked={showConflicts}
                  onCheckedChange={setShowConflicts}
                />
                <Label
                  className={`text-sm ${commandCenterMode ? "text-white/70" : ""}`}
                >
                  Show Conflicts
                </Label>
              </div>

              {enableAI && (
                <div className="flex items-center gap-2">
                  <Switch checked={showAI} onCheckedChange={setShowAI} />
                  <Label
                    className={`text-sm ${commandCenterMode ? "text-white/70" : ""}`}
                  >
                    AI Suggestions
                  </Label>
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Search
                className={`h-4 w-4 ${commandCenterMode ? "text-white/70" : "text-muted-foreground"}`}
              />
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`w-48 ${commandCenterMode ? "bg-white/10 border-white/20 text-white placeholder:text-white/50" : ""}`}
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPlatform} onValueChange={setFilterPlatform}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar View */}
      <Tabs
        value={view}
        onValueChange={value => setView(value as CalendarView)}
      >
        <TabsContent value="month" className="space-y-0">
          <Card
            className={
              commandCenterMode
                ? "bg-black/10 backdrop-blur-lg border-white/10"
                : ""
            }
          >
            <CardContent className="p-0">
              <div className="grid grid-cols-7">
                {/* Day headers */}
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                  <div
                    key={day}
                    className={`p-3 text-center font-medium text-sm border-b ${
                      commandCenterMode
                        ? "text-white/70 border-white/10"
                        : "text-muted-foreground"
                    }`}
                  >
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`
                      min-h-[120px] border-r border-b p-2 cursor-pointer transition-colors
                      ${commandCenterMode ? "border-white/10" : ""}
                      ${
                        day.isCurrentMonth
                          ? commandCenterMode
                            ? "bg-transparent"
                            : "bg-background"
                          : commandCenterMode
                            ? "bg-white/5"
                            : "bg-muted/30"
                      }
                      ${
                        day.isToday
                          ? commandCenterMode
                            ? "bg-blue-500/20 border-blue-400"
                            : "bg-blue-50 border-blue-200"
                          : ""
                      }
                      ${day.isPast ? "opacity-60" : ""}
                      ${
                        day.hasConflicts && showConflicts
                          ? commandCenterMode
                            ? "bg-red-500/10 border-red-400/20"
                            : "bg-red-50"
                          : ""
                      }
                      ${
                        dragOverDate &&
                        dragOverDate.toDateString() === day.date.toDateString()
                          ? commandCenterMode
                            ? "bg-green-500/20 border-green-400"
                            : "bg-green-100 border-green-300"
                          : ""
                      }
                      hover:bg-opacity-50
                    `}
                    onClick={() => handleCreateContent(day.date)}
                    onDragOver={e => handleDragOver(e, day.date)}
                    onDrop={e => handleDrop(e, day.date)}
                  >
                    {/* Day number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`
                          text-sm font-medium
                          ${
                            day.isToday
                              ? "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                              : commandCenterMode
                                ? day.isCurrentMonth
                                  ? "text-white"
                                  : "text-white/50"
                                : !day.isCurrentMonth
                                  ? "text-muted-foreground"
                                  : ""
                          }
                        `}
                      >
                        {day.date.getDate()}
                      </span>

                      {day.hasConflicts && showConflicts && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>

                    {/* Events */}
                    <div className="space-y-1">
                      {day.events.slice(0, 3).map(entry => (
                        <div
                          key={entry.id}
                          draggable
                          onDragStart={e => handleDragStart(e, entry)}
                          className={`
                            text-xs p-1 rounded cursor-move border-l-3 transition-shadow
                            ${STATUS_COLORS[entry.status]}
                            ${PRIORITY_COLORS[entry.priority]}
                            ${draggedEntry?.id === entry.id ? "opacity-50" : ""}
                            hover:shadow-sm
                          `}
                          onClick={e => {
                            e.stopPropagation();
                            if (onContentUpdate) {
                              // Could open edit modal here
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate flex-1">
                              {CONTENT_TYPE_ICONS[entry.content_type]}{" "}
                              {entry.title}
                            </span>
                            <Badge variant="outline" className="text-xs ml-1">
                              {entry.status}
                            </Badge>
                          </div>
                          <div className="text-muted-foreground">
                            {formatTime(entry.time_slot)}
                          </div>
                          {entry.target_platforms.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {entry.target_platforms
                                .slice(0, 3)
                                .map(platform => (
                                  <div
                                    key={platform}
                                    className={`w-2 h-2 rounded-full ${PLATFORM_COLORS[platform] || "bg-gray-400"}`}
                                    title={platform}
                                  />
                                ))}
                              {entry.target_platforms.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{entry.target_platforms.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}

                      {day.events.length > 3 && (
                        <div
                          className={`text-xs text-center py-1 ${
                            commandCenterMode
                              ? "text-white/50"
                              : "text-muted-foreground"
                          }`}
                        >
                          +{day.events.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other view tabs can be implemented similarly */}
        <TabsContent value="week">
          <Card
            className={
              commandCenterMode
                ? "bg-black/10 backdrop-blur-lg border-white/10"
                : ""
            }
          >
            <CardContent className="p-4">
              <div
                className={`text-center py-8 ${commandCenterMode ? "text-white/70" : "text-muted-foreground"}`}
              >
                Week view implementation coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="day">
          <Card
            className={
              commandCenterMode
                ? "bg-black/10 backdrop-blur-lg border-white/10"
                : ""
            }
          >
            <CardContent className="p-4">
              <div
                className={`text-center py-8 ${commandCenterMode ? "text-white/70" : "text-muted-foreground"}`}
              >
                Day view implementation coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agenda">
          <Card
            className={
              commandCenterMode
                ? "bg-black/10 backdrop-blur-lg border-white/10"
                : ""
            }
          >
            <CardContent className="p-4">
              <div className="space-y-4">
                {filteredEntries
                  .sort(
                    (a, b) =>
                      new Date(a.calendar_date).getTime() -
                      new Date(b.calendar_date).getTime()
                  )
                  .slice(0, 20)
                  .map(entry => (
                    <div
                      key={entry.id}
                      className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                        commandCenterMode
                          ? "bg-white/5 border-white/10 hover:bg-white/10"
                          : "bg-muted/30 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {CONTENT_TYPE_ICONS[entry.content_type]}
                          </span>
                          <div>
                            <h3
                              className={`font-semibold ${commandCenterMode ? "text-white" : ""}`}
                            >
                              {entry.title}
                            </h3>
                            <p
                              className={`text-sm ${
                                commandCenterMode
                                  ? "text-white/70"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {new Date(
                                entry.calendar_date
                              ).toLocaleDateString()}{" "}
                              at {formatTime(entry.time_slot)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{entry.status}</Badge>
                          <Badge variant="outline">{entry.priority}</Badge>
                        </div>
                      </div>

                      <p
                        className={`text-sm mb-3 ${
                          commandCenterMode
                            ? "text-white/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {entry.content_preview}
                      </p>

                      <div className="flex items-center gap-4 text-sm">
                        <span
                          className={
                            commandCenterMode
                              ? "text-white/60"
                              : "text-muted-foreground"
                          }
                        >
                          Platforms: {entry.target_platforms.join(", ")}
                        </span>
                        {entry.expected_engagement && (
                          <span className="text-green-600">
                            {entry.expected_engagement}% expected engagement
                          </span>
                        )}
                        {entry.auto_generated && (
                          <Badge className="bg-blue-900/30 text-blue-300 border-blue-500/30">
                            AI Generated
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaign">
          <Card
            className={
              commandCenterMode
                ? "bg-black/10 backdrop-blur-lg border-white/10"
                : ""
            }
          >
            <CardContent className="p-4">
              <div
                className={`text-center py-8 ${commandCenterMode ? "text-white/70" : "text-muted-foreground"}`}
              >
                Campaign view implementation coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Legend */}
      <Card
        className={
          commandCenterMode
            ? "bg-black/10 backdrop-blur-lg border-white/10"
            : ""
        }
      >
        <CardHeader>
          <CardTitle
            className={`text-sm ${commandCenterMode ? "text-white" : ""}`}
          >
            Quick Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4
                className={`font-semibold mb-2 ${commandCenterMode ? "text-white" : ""}`}
              >
                Content Types
              </h4>
              <div className="space-y-1">
                {Object.entries(CONTENT_TYPE_ICONS).map(([type, icon]) => (
                  <div key={type} className="flex items-center gap-2">
                    <span>{icon}</span>
                    <span
                      className={`capitalize ${commandCenterMode ? "text-white/70" : ""}`}
                    >
                      {type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4
                className={`font-semibold mb-2 ${commandCenterMode ? "text-white" : ""}`}
              >
                Status Colors
              </h4>
              <div className="space-y-1">
                {Object.entries(STATUS_COLORS).map(([status, color]) => (
                  <div key={status} className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded border ${color.split(" ")[0]} ${color.split(" ")[1]}`}
                    />
                    <span
                      className={`capitalize ${commandCenterMode ? "text-white/70" : ""}`}
                    >
                      {status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4
                className={`font-semibold mb-2 ${commandCenterMode ? "text-white" : ""}`}
              >
                Platform Colors
              </h4>
              <div className="space-y-1">
                {Object.entries(PLATFORM_COLORS)
                  .slice(0, 6)
                  .map(([platform, color]) => (
                    <div key={platform} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${color}`} />
                      <span
                        className={`capitalize ${commandCenterMode ? "text-white/70" : ""}`}
                      >
                        {platform}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div
            className={`mt-4 text-xs ${commandCenterMode ? "text-white/50" : "text-muted-foreground"}`}
          >
            💡 Drag and drop content to reschedule. Click a day to add new
            content.
            {enableBlotato &&
              " Blotato integration provides real-time multi-platform scheduling."}
            {enableAI &&
              " AI suggestions help optimize content timing and engagement."}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
