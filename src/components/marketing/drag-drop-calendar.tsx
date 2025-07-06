"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
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
} from "lucide-react";

// Types for drag and drop calendar
interface CalendarEvent {
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

interface CalendarDay {
  date: Date;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
}

interface DragDropCalendarProps {
  events: CalendarEvent[];
  onEventMove: (eventId: string, newDate: Date) => void;
  onEventCreate: (date: Date) => void;
  onEventEdit: (event: CalendarEvent) => void;
  onEventDelete: (eventId: string) => void;
  className?: string;
}

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CONTENT_TYPE_COLORS = {
  post: "bg-blue-500",
  email: "bg-green-500",
  ad: "bg-purple-500",
  story: "bg-pink-500",
  video: "bg-red-500",
  campaign: "bg-orange-500",
};

const STATUS_COLORS = {
  draft: "border-gray-400 bg-gray-50",
  scheduled: "border-blue-400 bg-blue-50",
  published: "border-green-400 bg-green-50",
  failed: "border-red-400 bg-red-50",
};

export default function DragDropCalendar({
  events,
  onEventMove,
  onEventCreate,
  onEventEdit,
  onEventDelete,
  className = "",
}: DragDropCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  const dragCounter = useRef(0);

  // Generate calendar days for current month view
  const generateCalendarDays = useCallback((): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Start from Monday of the week containing the first day
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Make Monday = 0
    startDate.setDate(firstDay.getDate() - daysToSubtract);

    // End on Sunday of the week containing the last day
    const endDate = new Date(lastDay);
    const endDayOfWeek = lastDay.getDay();
    const daysToAdd = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek;
    endDate.setDate(lastDay.getDate() + daysToAdd);

    const days: CalendarDay[] = [];
    const currentDateObj = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (currentDateObj <= endDate) {
      const dateStr = currentDateObj.toISOString().split("T")[0];
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.scheduled_date);
        return eventDate.toISOString().split("T")[0] === dateStr;
      });

      const currentDateCopy = new Date(currentDateObj);
      currentDateCopy.setHours(0, 0, 0, 0);

      days.push({
        date: new Date(currentDateObj),
        events: dayEvents,
        isCurrentMonth: currentDateObj.getMonth() === month,
        isToday: currentDateCopy.getTime() === today.getTime(),
        isPast: currentDateCopy < today,
      });

      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }

    return days;
  }, [currentDate, events]);

  const calendarDays = generateCalendarDays();

  // Navigation functions
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget.outerHTML);

    // Add a custom drag image
    const dragElement = e.currentTarget.cloneNode(true) as HTMLElement;
    dragElement.style.transform = "rotate(5deg)";
    dragElement.style.opacity = "0.8";
    document.body.appendChild(dragElement);
    e.dataTransfer.setDragImage(dragElement, 0, 0);
    setTimeout(() => document.body.removeChild(dragElement), 0);
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
      onEventMove(draggedEvent.id, date);
      setDraggedEvent(null);
    }
  };

  const handleDayClick = (date: Date) => {
    if (!draggedEvent) {
      onEventCreate(date);
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
      case "email":
        return "📧";
      case "post":
        return "📝";
      case "ad":
        return "📢";
      case "story":
        return "📸";
      case "video":
        return "🎥";
      case "campaign":
        return "🚀";
      default:
        return "📄";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <NormalButton
                variant="secondary"
                size="sm"
                onClick={() => navigateMonth("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </NormalButton>

              <div className="text-center">
                <CardTitle className="text-xl">
                  {currentDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </CardTitle>
              </div>

              <NormalButton
                variant="secondary"
                size="sm"
                onClick={() => navigateMonth("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </NormalButton>
            </div>

            <div className="flex gap-2">
              <NormalButton variant="outline" size="sm" onClick={goToToday}>
                Today
              </NormalButton>
              <NormalButton size="sm" onClick={() => onEventCreate(new Date())}>
                <Plus className="h-4 w-4 mr-2" />
                Add Content
              </NormalButton>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7">
            {/* Day headers */}
            {DAYS_OF_WEEK.map(day => (
              <div
                key={day}
                className="p-3 text-center font-medium text-sm text-muted-foreground border-b"
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
                  ${day.isCurrentMonth ? "bg-background" : "bg-muted/30"}
                  ${day.isToday ? "bg-blue-50 border-blue-200" : ""}
                  ${day.isPast ? "opacity-60" : ""}
                  ${
                    dragOverDate &&
                    dragOverDate.toDateString() === day.date.toDateString()
                      ? "bg-green-100 border-green-300"
                      : ""
                  }
                  hover:bg-muted/50
                `}
                onClick={() => handleDayClick(day.date)}
                onDragOver={e => handleDragOver(e, day.date)}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, day.date)}
              >
                {/* Day number */}
                <div
                  className={`
                  text-sm font-medium mb-1
                  ${day.isToday ? "text-blue-600" : ""}
                  ${!day.isCurrentMonth ? "text-muted-foreground" : ""}
                `}
                >
                  {day.date.getDate()}
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {day.events.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      draggable
                      onDragStart={e => handleDragStart(e, event)}
                      className={`
                        text-xs p-1 rounded cursor-move border-l-3 
                        ${STATUS_COLORS[event.status]}
                        hover:shadow-sm transition-shadow
                        ${draggedEvent?.id === event.id ? "opacity-50" : ""}
                      `}
                      style={{
                        borderLeftColor:
                          CONTENT_TYPE_COLORS[
                            event.type as keyof typeof CONTENT_TYPE_COLORS
                          ],
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate flex-1">
                          {getEventTypeIcon(event.type)} {event.title}
                        </span>
                        <Badge variant="outline" className="text-xs ml-1">
                          {event.status}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground">
                        {formatTime(event.scheduled_time)}
                      </div>
                    </div>
                  ))}

                  {day.events.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      +{day.events.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Details Modal/Sidebar - simplified inline view for now */}
      {selectedEvent && (
        <Card
          className="border-l-4"
          style={{
            borderLeftColor:
              CONTENT_TYPE_COLORS[
                selectedEvent.type as keyof typeof CONTENT_TYPE_COLORS
              ],
          }}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getEventTypeIcon(selectedEvent.type)} {selectedEvent.title}
                </CardTitle>
                <CardDescription>
                  {selectedEvent.type.charAt(0).toUpperCase() +
                    selectedEvent.type.slice(1)}{" "}
                  •{selectedEvent.platform.join(", ")} •
                  {selectedEvent.scheduled_date.toLocaleDateString()} at{" "}
                  {formatTime(selectedEvent.scheduled_time)}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    selectedEvent.status === "published" ? "default" : "outline"
                  }
                >
                  {selectedEvent.status}
                </Badge>
                <NormalButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                >
                  ✕
                </NormalButton>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {selectedEvent.content_preview}
              </p>

              <div className="flex items-center gap-4 text-sm">
                <span>By {selectedEvent.author}</span>
                {selectedEvent.engagement_prediction && (
                  <span className="text-green-600">
                    {selectedEvent.engagement_prediction}% predicted engagement
                  </span>
                )}
                {selectedEvent.audience_size && (
                  <span className="text-blue-600">
                    {selectedEvent.audience_size.toLocaleString()} audience
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <NormalButton
                  size="sm"
                  variant="outline"
                  onClick={() => onEventEdit(selectedEvent)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </NormalButton>
                <NormalButton size="sm" variant="outline">
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </NormalButton>
                <NormalButton size="sm" variant="outline">
                  <Share2 className="h-3 w-3 mr-1" />
                  Share
                </NormalButton>
                <NormalButton
                  size="sm"
                  variant="outline"
                  onClick={() => onEventDelete(selectedEvent.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </NormalButton>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Content Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            {Object.entries(CONTENT_TYPE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${color}`} />
                <span className="capitalize">{type}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            💡 Drag and drop content to reschedule. Click a day to add new
            content.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
