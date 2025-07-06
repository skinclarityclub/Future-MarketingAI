"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Clock,
  Eye,
  Share2,
  Grid3X3,
  List,
  BarChart3,
  Users,
  Copy,
  MoreHorizontal,
  AlertTriangle,
  Zap,
  Target,
} from "lucide-react";

// Enhanced types for the improved calendar
interface EnhancedCalendarEvent {
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
  duration?: number;
  audience_size?: number;
  priority?: "low" | "medium" | "high";
  tags?: string[];
  assignee?: string;
  budget?: number;
  campaign_id?: string;
  conflicts?: string[];
  images?: string[];
  hashtags?: string[];
  target_audience?: string;
  approval_status?: "pending" | "approved" | "rejected";
  approver?: string;
  notes?: string;
}

interface CalendarDay {
  date: Date;
  events: EnhancedCalendarEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  hasConflicts: boolean;
}

interface EnhancedVisualCalendarProps {
  events: EnhancedCalendarEvent[];
  onEventMove: (eventId: string, newDate: Date) => void;
  onEventCreate: (date: Date) => void;
  onEventEdit: (event: EnhancedCalendarEvent) => void;
  onEventDelete: (eventId: string) => void;
  onEventDuplicate?: (event: EnhancedCalendarEvent) => void;
  onBulkMove?: (eventIds: string[], newDate: Date) => void;
  className?: string;
}

type CalendarView = "month" | "week" | "day" | "agenda";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CONTENT_TYPE_COLORS = {
  post: "bg-blue-500 text-white",
  email: "bg-green-500 text-white",
  ad: "bg-purple-500 text-white",
  story: "bg-pink-500 text-white",
  video: "bg-red-500 text-white",
  campaign: "bg-orange-500 text-white",
};

const STATUS_COLORS = {
  draft: "border-gray-400 bg-gray-50 text-gray-700",
  scheduled: "border-blue-400 bg-blue-50 text-blue-700",
  published: "border-green-400 bg-green-50 text-green-700",
  failed: "border-red-400 bg-red-50 text-red-700",
  approved: "border-emerald-400 bg-emerald-50 text-emerald-700",
  pending_approval: "border-yellow-400 bg-yellow-50 text-yellow-700",
};

const PRIORITY_COLORS = {
  low: "border-l-gray-400",
  medium: "border-l-yellow-400",
  high: "border-l-red-400",
};

export default function EnhancedVisualCalendar({
  events,
  onEventMove,
  onEventCreate,
  onEventEdit,
  onEventDelete,
  onEventDuplicate,
  onBulkMove,
  className = "",
}: EnhancedVisualCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [draggedEvent, setDraggedEvent] =
    useState<EnhancedCalendarEvent | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] =
    useState<EnhancedCalendarEvent | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [showConflicts, setShowConflicts] = useState(true);
  const [filterAuthor, setFilterAuthor] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const dragCounter = useRef(0);

  // Get unique authors and statuses for filtering
  const uniqueAuthors = useMemo(() => {
    const authors = new Set(events.map(event => event.author));
    return Array.from(authors).sort();
  }, [events]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(events.map(event => event.status));
    return Array.from(statuses).sort();
  }, [events]);

  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const authorMatch =
        filterAuthor === "all" || event.author === filterAuthor;
      const statusMatch =
        filterStatus === "all" || event.status === filterStatus;
      return authorMatch && statusMatch;
    });
  }, [events, filterAuthor, filterStatus]);

  // Detect scheduling conflicts
  const detectConflicts = useCallback(
    (events: EnhancedCalendarEvent[]): EnhancedCalendarEvent[] => {
      return events.map(event => {
        const conflicts: string[] = [];

        events.forEach(otherEvent => {
          if (
            event.id !== otherEvent.id &&
            event.author === otherEvent.author &&
            event.scheduled_date.toDateString() ===
              otherEvent.scheduled_date.toDateString()
          ) {
            const eventTime = parseInt(event.scheduled_time.replace(":", ""));
            const otherTime = parseInt(
              otherEvent.scheduled_time.replace(":", "")
            );
            const timeDiff = Math.abs(eventTime - otherTime);

            // Flag as conflict if within 30 minutes
            if (timeDiff < 30) {
              conflicts.push(otherEvent.id);
            }
          }
        });

        return { ...event, conflicts };
      });
    },
    []
  );

  const eventsWithConflicts = useMemo(() => {
    return detectConflicts(filteredEvents);
  }, [filteredEvents, detectConflicts]);

  // Generate calendar days based on current view
  const generateCalendarDays = useCallback((): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    let startDate: Date;
    let endDate: Date;

    if (view === "month") {
      // First day of the month
      const firstDay = new Date(year, month, 1);
      // Last day of the month
      const lastDay = new Date(year, month + 1, 0);

      // Start from Monday of the week containing the first day
      startDate = new Date(firstDay);
      const dayOfWeek = firstDay.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate.setDate(firstDay.getDate() - daysToSubtract);

      // End on Sunday of the week containing the last day
      endDate = new Date(lastDay);
      const endDayOfWeek = lastDay.getDay();
      const daysToAdd = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek;
      endDate.setDate(lastDay.getDate() + daysToAdd);
    } else if (view === "week") {
      // Start from Monday of current week
      startDate = new Date(currentDate);
      const dayOfWeek = currentDate.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate.setDate(currentDate.getDate() - daysToSubtract);

      // End on Sunday of current week
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else {
      // Day view - just the current day
      startDate = new Date(currentDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(currentDate);
      endDate.setHours(23, 59, 59, 999);
    }

    const days: CalendarDay[] = [];
    const currentDateObj = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (currentDateObj <= endDate) {
      const dateStr = currentDateObj.toISOString().split("T")[0];
      const dayEvents = eventsWithConflicts.filter(event => {
        const eventDate = new Date(event.scheduled_date);
        return eventDate.toISOString().split("T")[0] === dateStr;
      });

      const currentDateCopy = new Date(currentDateObj);
      currentDateCopy.setHours(0, 0, 0, 0);

      const hasConflicts = dayEvents.some(
        event => event.conflicts && event.conflicts.length > 0
      );

      days.push({
        date: new Date(currentDateObj),
        events: dayEvents,
        isCurrentMonth:
          view === "month" ? currentDateObj.getMonth() === month : true,
        isToday: currentDateCopy.getTime() === today.getTime(),
        isPast: currentDateCopy < today,
        hasConflicts,
      });

      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }

    return days;
  }, [currentDate, view, eventsWithConflicts]);

  const calendarDays = generateCalendarDays();

  // Navigation functions
  const navigatePeriod = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (view === "month") {
        if (direction === "prev") {
          newDate.setMonth(prev.getMonth() - 1);
        } else {
          newDate.setMonth(prev.getMonth() + 1);
        }
      } else if (view === "week") {
        if (direction === "prev") {
          newDate.setDate(prev.getDate() - 7);
        } else {
          newDate.setDate(prev.getDate() + 7);
        }
      } else if (view === "day") {
        if (direction === "prev") {
          newDate.setDate(prev.getDate() - 1);
        } else {
          newDate.setDate(prev.getDate() + 1);
        }
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Multi-select functions
  const toggleEventSelection = (
    eventId: string,
    isCtrlClick: boolean = false
  ) => {
    if (!isMultiSelectMode && !isCtrlClick) {
      setSelectedEvents(new Set([eventId]));
      return;
    }

    setSelectedEvents(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(eventId)) {
        newSelection.delete(eventId);
      } else {
        newSelection.add(eventId);
      }
      return newSelection;
    });
  };

  const selectAllEventsInDay = (date: Date) => {
    if (!isMultiSelectMode) return;

    const dateStr = date.toISOString().split("T")[0];
    const dayEventIds = eventsWithConflicts
      .filter(
        event => event.scheduled_date.toISOString().split("T")[0] === dateStr
      )
      .map(event => event.id);

    setSelectedEvents(prev => {
      const newSelection = new Set(prev);
      dayEventIds.forEach(id => newSelection.add(id));
      return newSelection;
    });
  };

  const clearSelection = () => {
    setSelectedEvents(new Set());
  };

  // Drag and drop handlers with multi-select support
  const handleDragStart = (
    e: React.DragEvent,
    event: EnhancedCalendarEvent
  ) => {
    if (selectedEvents.has(event.id) && selectedEvents.size > 1) {
      // Multi-select drag
      setDraggedEvent(event);
    } else {
      // Single event drag
      setDraggedEvent(event);
      setSelectedEvents(new Set([event.id]));
    }

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget.outerHTML);
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverDate(date);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverDate(null);
    }
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragOverDate(null);

    if (draggedEvent) {
      if (selectedEvents.size > 1 && onBulkMove) {
        // Bulk move
        onBulkMove(Array.from(selectedEvents), date);
      } else {
        // Single move
        onEventMove(draggedEvent.id, date);
      }
      setDraggedEvent(null);
    }
  };

  const handleDayClick = (date: Date, isDoubleClick: boolean = false) => {
    if (isDoubleClick) {
      onEventCreate(date);
    } else if (isMultiSelectMode) {
      selectAllEventsInDay(date);
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "post":
        return "📝";
      case "email":
        return "📧";
      case "ad":
        return "📢";
      case "story":
        return "📖";
      case "video":
        return "🎥";
      case "campaign":
        return "🎯";
      default:
        return "📄";
    }
  };

  const getPriorityIcon = (priority?: string) => {
    if (!priority) return null;
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-3 w-3 text-red-500" />;
      case "medium":
        return <Clock className="h-3 w-3 text-yellow-500" />;
      case "low":
        return <Target className="h-3 w-3 text-gray-500" />;
      default:
        return null;
    }
  };

  const getConflictIndicator = (event: EnhancedCalendarEvent) => {
    if (showConflicts && event.conflicts && event.conflicts.length > 0) {
      return (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-bold">!</span>
        </div>
      );
    }
    return null;
  };

  const renderEvent = (event: EnhancedCalendarEvent, index: number) => {
    const isSelected = selectedEvents.has(event.id);
    const isDragged = draggedEvent?.id === event.id;

    return (
      <div
        key={event.id}
        className={`
          relative p-2 mb-1 rounded-md text-xs cursor-move transition-all duration-200
          ${CONTENT_TYPE_COLORS[event.type]}
          ${STATUS_COLORS[event.status]}
          ${event.priority ? PRIORITY_COLORS[event.priority] : ""}
          ${isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""}
          ${isDragged ? "opacity-50 scale-95" : ""}
          border-l-4 hover:shadow-md
        `}
        draggable
        onDragStart={e => handleDragStart(e, event)}
        onClick={e => toggleEventSelection(event.id, e.ctrlKey || e.metaKey)}
        onDoubleClick={() => onEventEdit(event)}
        style={{ zIndex: 10 + index }}
      >
        {getConflictIndicator(event)}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span>{getEventTypeIcon(event.type)}</span>
            {getPriorityIcon(event.priority)}
            <span className="font-medium truncate">{event.title}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs opacity-75">
              {formatTime(event.scheduled_time)}
            </span>
          </div>
        </div>

        <div className="mt-1 text-xs opacity-75">
          {event.platform.slice(0, 2).join(", ")}
          {event.platform.length > 2 && ` +${event.platform.length - 2}`}
        </div>

        {event.engagement_prediction && (
          <div className="mt-1 flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            <span className="text-xs">{event.engagement_prediction}%</span>
          </div>
        )}
      </div>
    );
  };

  const renderCalendarGrid = () => {
    const weeks: CalendarDay[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }

    return (
      <div className="border rounded-lg overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 bg-muted">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="p-3 text-center font-medium text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-t">
            {week.map((day, dayIndex) => {
              const isDragOver =
                dragOverDate &&
                day.date.toDateString() === dragOverDate.toDateString();

              return (
                <div
                  key={dayIndex}
                  className={`
                    min-h-[120px] p-2 border-r border-gray-200 relative
                    ${!day.isCurrentMonth ? "bg-gray-50 text-gray-400" : ""}
                    ${day.isToday ? "bg-blue-50 border-blue-200" : ""}
                    ${day.isPast ? "opacity-75" : ""}
                    ${isDragOver ? "bg-blue-100 border-blue-400" : ""}
                    ${day.hasConflicts && showConflicts ? "bg-red-50" : ""}
                    hover:bg-gray-50 cursor-pointer transition-colors
                  `}
                  onDragOver={e => handleDragOver(e, day.date)}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={e => handleDrop(e, day.date)}
                  onClick={() => handleDayClick(day.date)}
                  onDoubleClick={() => handleDayClick(day.date, true)}
                >
                  {/* Day number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`
                      text-sm font-medium
                      ${day.isToday ? "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center" : ""}
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
                    {day.events
                      .slice(0, 3)
                      .map((event, index) => renderEvent(event, index))}
                    {day.events.length > 3 && (
                      <div className="text-xs text-gray-500 text-center py-1">
                        +{day.events.length - 3} more
                      </div>
                    )}
                  </div>

                  {/* Add event button on hover */}
                  <NormalButton
                    size="sm"
                    variant="ghost"
                    className="absolute bottom-1 right-1 opacity-0 hover:opacity-100 transition-opacity w-6 h-6 p-0"
                    onClick={e => {
                      e.stopPropagation();
                      onEventCreate(day.date);
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </NormalButton>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Calendar Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Enhanced Visual Content Calendar
              </CardTitle>
              <CardDescription>
                Advanced scheduling with drag-and-drop, conflict detection, and
                multi-select
              </CardDescription>
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
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Switch
                  checked={isMultiSelectMode}
                  onCheckedChange={setIsMultiSelectMode}
                />
                <Label className="text-sm">Multi-select</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={showConflicts}
                  onCheckedChange={setShowConflicts}
                />
                <Label className="text-sm">Show conflicts</Label>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <NormalButton
                variant="secondary"
                size="sm"
                onClick={() => navigatePeriod("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </NormalButton>

              <div className="text-lg font-semibold min-w-[200px] text-center">
                {view === "month" &&
                  currentDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                {view === "week" &&
                  `Week of ${currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                {view === "day" &&
                  currentDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
              </div>

              <NormalButton
                variant="secondary"
                size="sm"
                onClick={() => navigatePeriod("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </NormalButton>

              <NormalButton variant="secondary" size="sm" onClick={goToToday}>
                Today
              </NormalButton>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <Select value={filterAuthor} onValueChange={setFilterAuthor}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by author" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Authors</SelectItem>
                  {uniqueAuthors.map(author => (
                    <SelectItem key={author} value={author}>
                      {author}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Multi-select actions */}
          {selectedEvents.size > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedEvents.size} event
                  {selectedEvents.size > 1 ? "s" : ""} selected
                </span>
                <div className="flex items-center gap-2">
                  <NormalButton
                    size="sm"
                    variant="secondary"
                    onClick={clearSelection}
                  >
                    Clear
                  </NormalButton>
                  <NormalButton size="sm" variant="secondary">
                    <Copy className="h-3 w-3 mr-1" />
                    Duplicate
                  </NormalButton>
                  <NormalButton size="sm" variant="secondary">
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </NormalButton>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      {renderCalendarGrid()}

      {/* Calendar Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Content Types */}
            <div>
              <h4 className="text-sm font-medium mb-2">Content Types</h4>
              <div className="space-y-1">
                {Object.entries(CONTENT_TYPE_COLORS).map(
                  ([type, colorClass]) => (
                    <div key={type} className="flex items-center gap-2 text-xs">
                      <div className={`w-3 h-3 rounded ${colorClass}`} />
                      <span className="capitalize">{type}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <h4 className="text-sm font-medium mb-2">Status</h4>
              <div className="space-y-1">
                {Object.entries(STATUS_COLORS).map(([status, colorClass]) => (
                  <div key={status} className="flex items-center gap-2 text-xs">
                    <div className={`w-3 h-3 rounded border ${colorClass}`} />
                    <span className="capitalize">
                      {status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <h4 className="text-sm font-medium mb-2">Priority</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  <span>High</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-3 w-3 text-yellow-500" />
                  <span>Medium</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Target className="h-3 w-3 text-gray-500" />
                  <span>Low</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <h4 className="text-sm font-medium mb-2">Instructions</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>• Drag events to reschedule</div>
                <div>• Double-click to create/edit</div>
                <div>• Ctrl+click for multi-select</div>
                <div>• Red alert = conflict detected</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
