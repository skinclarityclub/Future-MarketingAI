"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  CalendarDays,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Eye,
  Users,
  Target,
  TrendingUp,
  Shield,
  Zap,
  Bell,
} from "lucide-react";
import { toast } from "sonner";

// Types for Test Calendar
export interface TestEvent {
  id: string;
  title: string;
  description: string;
  testType: "content" | "timing" | "targeting" | "mixed";
  status: "scheduled" | "running" | "completed" | "cancelled" | "paused";
  startDate: Date;
  endDate: Date;
  platforms: string[];
  audience: string;
  priority: "low" | "medium" | "high" | "critical";
  estimatedSampleSize: number;
  conflictScore: number; // 0-100, higher = more conflicts
  qaStatus: "pending" | "in_review" | "approved" | "rejected";
  qaChecklist: QAChecklistItem[];
  tags: string[];
  assignee?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QAChecklistItem {
  id: string;
  category: "setup" | "content" | "technical" | "compliance" | "analytics";
  requirement: string;
  description: string;
  status: "pending" | "completed" | "failed" | "not_applicable";
  priority: "required" | "recommended" | "optional";
  completedBy?: string;
  completedAt?: Date;
  notes?: string;
}

export interface ConflictDetection {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  type:
    | "audience_overlap"
    | "platform_conflict"
    | "resource_contention"
    | "timing_collision";
  description: string;
  affectedTests: string[];
  resolution: string;
  autoResolvable: boolean;
}

interface TestCalendarProps {
  events?: TestEvent[];
  onEventCreate?: (event: Partial<TestEvent>) => void;
  onEventUpdate?: (id: string, updates: Partial<TestEvent>) => void;
  onEventDelete?: (id: string) => void;
  onConflictResolve?: (conflictId: string) => void;
}

export default function TestCalendar({
  events = [],
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  onConflictResolve,
}: TestCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TestEvent | null>(null);
  const [conflicts, setConflicts] = useState<ConflictDetection[]>([]);
  const [newEventForm, setNewEventForm] = useState({
    title: "",
    description: "",
    testType: "content",
    startDate: "",
    endDate: "",
    platforms: "",
    audience: "",
    priority: "medium",
    estimatedSampleSize: 1000,
    tags: "",
  });
  const [qaModalOpen, setQaModalOpen] = useState(false);
  const [selectedQAEvent, setSelectedQAEvent] = useState<TestEvent | null>(
    null
  );

  // Mock test events for demo
  const [testEvents, setTestEvents] = useState<TestEvent[]>([
    {
      id: "test_1",
      title: "Email Campaign A/B Test",
      description: "Testing subject line variations for newsletter",
      testType: "content",
      status: "scheduled",
      startDate: new Date(2024, 11, 25),
      endDate: new Date(2024, 11, 31),
      platforms: ["email"],
      audience: "newsletter_subscribers",
      priority: "high",
      estimatedSampleSize: 5000,
      conflictScore: 15,
      qaStatus: "approved",
      qaChecklist: [],
      tags: ["newsletter", "subject_line"],
      createdBy: "user_1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "test_2",
      title: "Website Banner Optimization",
      description: "Testing banner design variations",
      testType: "content",
      status: "running",
      startDate: new Date(2024, 11, 20),
      endDate: new Date(2024, 11, 27),
      platforms: ["web"],
      audience: "website_visitors",
      priority: "medium",
      estimatedSampleSize: 8000,
      conflictScore: 45,
      qaStatus: "approved",
      qaChecklist: [],
      tags: ["banner", "design"],
      createdBy: "user_2",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "test_3",
      title: "Social Media Timing Test",
      description: "Finding optimal posting times",
      testType: "timing",
      status: "scheduled",
      startDate: new Date(2024, 11, 28),
      endDate: new Date(2025, 0, 5),
      platforms: ["social"],
      audience: "social_followers",
      priority: "low",
      estimatedSampleSize: 3000,
      conflictScore: 75,
      qaStatus: "in_review",
      qaChecklist: [],
      tags: ["social", "timing"],
      createdBy: "user_3",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  useEffect(() => {
    generateMockConflicts();
  }, [testEvents]);

  const generateMockConflicts = () => {
    const mockConflicts: ConflictDetection[] = [
      {
        id: "conflict_1",
        severity: "medium",
        type: "audience_overlap",
        description:
          "Email campaign and website banner test have 35% audience overlap",
        affectedTests: ["test_1", "test_2"],
        resolution:
          "Consider staggering test periods or using audience exclusion",
        autoResolvable: false,
      },
      {
        id: "conflict_2",
        severity: "high",
        type: "platform_conflict",
        description: "Multiple social media tests scheduled simultaneously",
        affectedTests: ["test_3"],
        resolution: "Reschedule one test to avoid interference",
        autoResolvable: true,
      },
    ];
    setConflicts(mockConflicts);
  };

  const generateQAChecklist = (testType: string): QAChecklistItem[] => {
    const baseChecklist: QAChecklistItem[] = [
      {
        id: "qa_1",
        category: "setup",
        requirement: "Test Configuration Validation",
        description: "Verify all test parameters are correctly configured",
        status: "pending",
        priority: "required",
      },
      {
        id: "qa_2",
        category: "content",
        requirement: "Content Quality Review",
        description: "Review all variant content for quality and consistency",
        status: "pending",
        priority: "required",
      },
      {
        id: "qa_3",
        category: "technical",
        requirement: "Technical Implementation Check",
        description: "Verify tracking and implementation is working correctly",
        status: "pending",
        priority: "required",
      },
      {
        id: "qa_4",
        category: "compliance",
        requirement: "Privacy Compliance",
        description: "Ensure test complies with GDPR and privacy requirements",
        status: "pending",
        priority: "required",
      },
      {
        id: "qa_5",
        category: "analytics",
        requirement: "Analytics Setup",
        description: "Confirm tracking and analytics are properly configured",
        status: "pending",
        priority: "required",
      },
    ];

    // Add test-type specific checks
    if (testType === "content") {
      baseChecklist.push({
        id: "qa_content_1",
        category: "content",
        requirement: "Brand Guidelines Compliance",
        description: "Verify all content variants follow brand guidelines",
        status: "pending",
        priority: "required",
      });
    }

    if (testType === "timing") {
      baseChecklist.push({
        id: "qa_timing_1",
        category: "setup",
        requirement: "Timezone Configuration",
        description: "Verify timezone settings for all target regions",
        status: "pending",
        priority: "required",
      });
    }

    return baseChecklist;
  };

  const createNewEvent = () => {
    if (!newEventForm.title.trim()) {
      toast.error("Event title is required");
      return;
    }

    const newEvent: TestEvent = {
      id: `test_${Date.now()}`,
      title: newEventForm.title,
      description: newEventForm.description,
      testType: newEventForm.testType as any,
      status: "scheduled",
      startDate: new Date(newEventForm.startDate),
      endDate: new Date(newEventForm.endDate),
      platforms: newEventForm.platforms.split(",").map(p => p.trim()),
      audience: newEventForm.audience,
      priority: newEventForm.priority as any,
      estimatedSampleSize: newEventForm.estimatedSampleSize,
      conflictScore: Math.floor(Math.random() * 100),
      qaStatus: "pending",
      qaChecklist: generateQAChecklist(newEventForm.testType),
      tags: newEventForm.tags
        .split(",")
        .map(t => t.trim())
        .filter(Boolean),
      createdBy: "current_user",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTestEvents(prev => [...prev, newEvent]);
    onEventCreate?.(newEvent);
    setShowEventModal(false);
    setNewEventForm({
      title: "",
      description: "",
      testType: "content",
      startDate: "",
      endDate: "",
      platforms: "",
      audience: "",
      priority: "medium",
      estimatedSampleSize: 1000,
      tags: "",
    });
    toast.success("Test event created successfully");
  };

  const updateQAItem = (
    eventId: string,
    qaItemId: string,
    status: QAChecklistItem["status"],
    notes?: string
  ) => {
    setTestEvents(prev =>
      prev.map(event => {
        if (event.id === eventId) {
          const updatedChecklist = event.qaChecklist.map(item => {
            if (item.id === qaItemId) {
              return {
                ...item,
                status,
                notes,
                completedBy:
                  status === "completed" ? "current_user" : undefined,
                completedAt: status === "completed" ? new Date() : undefined,
              };
            }
            return item;
          });

          // Update overall QA status based on checklist completion
          const allRequired = updatedChecklist.filter(
            item => item.priority === "required"
          );
          const completedRequired = allRequired.filter(
            item => item.status === "completed"
          );
          const failedRequired = allRequired.filter(
            item => item.status === "failed"
          );

          let qaStatus: TestEvent["qaStatus"] = "pending";
          if (failedRequired.length > 0) {
            qaStatus = "rejected";
          } else if (completedRequired.length === allRequired.length) {
            qaStatus = "approved";
          } else {
            qaStatus = "in_review";
          }

          return {
            ...event,
            qaChecklist: updatedChecklist,
            qaStatus,
            updatedAt: new Date(),
          };
        }
        return event;
      })
    );

    toast.success("QA item updated");
  };

  const resolveConflict = (conflictId: string) => {
    setConflicts(prev => prev.filter(c => c.id !== conflictId));
    onConflictResolve?.(conflictId);
    toast.success("Conflict resolved");
  };

  const getStatusColor = (status: TestEvent["status"]) => {
    switch (status) {
      case "scheduled":
        return "outline";
      case "running":
        return "default";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
      case "paused":
        return "outline";
      default:
        return "outline";
    }
  };

  const getQAStatusColor = (status: TestEvent["qaStatus"]) => {
    switch (status) {
      case "approved":
        return "default";
      case "in_review":
        return "secondary";
      case "rejected":
        return "destructive";
      case "pending":
        return "outline";
      default:
        return "outline";
    }
  };

  const getConflictSeverityColor = (
    severity: ConflictDetection["severity"]
  ) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const getCurrentWeekEvents = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return testEvents.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      return eventStart <= endOfWeek && eventEnd >= startOfWeek;
    });
  };

  const getMonthEvents = () => {
    const startOfMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      0
    );

    return testEvents.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      return eventStart <= endOfMonth && eventEnd >= startOfMonth;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Test Calendar & QA Management</h2>
          <p className="text-muted-foreground">
            Schedule tests, detect conflicts, and manage enterprise QA processes
          </p>
        </div>
        <div className="flex gap-2">
          <NormalButton variant="outline" onClick={() => setViewMode("month")}>
            <CalendarDays className="h-4 w-4 mr-2" />
            Month
          </NormalButton>
          <NormalButton variant="outline" onClick={() => setViewMode("week")}>
            <Calendar className="h-4 w-4 mr-2" />
            Week
          </NormalButton>
          <NormalButton onClick={() => setShowEventModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Test
          </NormalButton>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium">Scheduled Tests</span>
          </div>
          <div className="text-2xl font-bold mt-1">
            {testEvents.filter(e => e.status === "scheduled").length}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium">Running Tests</span>
          </div>
          <div className="text-2xl font-bold mt-1">
            {testEvents.filter(e => e.status === "running").length}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium">Conflicts</span>
          </div>
          <div className="text-2xl font-bold mt-1">{conflicts.length}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium">QA Pending</span>
          </div>
          <div className="text-2xl font-bold mt-1">
            {
              testEvents.filter(
                e => e.qaStatus === "pending" || e.qaStatus === "in_review"
              ).length
            }
          </div>
        </Card>
      </div>

      {/* Conflict Alerts */}
      {conflicts.length > 0 && (
        <div className="space-y-2">
          {conflicts.map(conflict => (
            <Alert key={conflict.id} className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between w-full">
                <div>
                  <strong>
                    {conflict.type.replace("_", " ").toUpperCase()}:
                  </strong>{" "}
                  {conflict.description}
                  <div className="text-sm text-muted-foreground mt-1">
                    Resolution: {conflict.resolution}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={getConflictSeverityColor(conflict.severity)}>
                    {conflict.severity}
                  </Badge>
                  <NormalButton
                    size="sm"
                    onClick={() => resolveConflict(conflict.id)}
                  >
                    Resolve
                  </NormalButton>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="qa">QA Management</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          {/* Calendar Grid */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {selectedDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <div className="flex gap-2">
                <NormalButton
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelectedDate(
                      new Date(
                        selectedDate.setMonth(selectedDate.getMonth() - 1)
                      )
                    )
                  }
                >
                  Previous
                </NormalButton>
                <NormalButton
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Today
                </NormalButton>
                <NormalButton
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelectedDate(
                      new Date(
                        selectedDate.setMonth(selectedDate.getMonth() + 1)
                      )
                    )
                  }
                >
                  Next
                </NormalButton>
              </div>
            </div>

            {viewMode === "month" && (
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div
                    key={day}
                    className="p-2 text-center text-sm font-medium text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    i - 6
                  );
                  const dayEvents = testEvents.filter(event => {
                    const eventStart = new Date(event.startDate);
                    const eventEnd = new Date(event.endDate);
                    return date >= eventStart && date <= eventEnd;
                  });

                  return (
                    <div
                      key={i}
                      className={`p-2 min-h-[80px] border rounded ${
                        date.getMonth() !== selectedDate.getMonth()
                          ? "bg-gray-50 text-gray-400"
                          : "bg-white"
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className="text-xs p-1 rounded cursor-pointer hover:opacity-80"
                            style={{
                              backgroundColor:
                                event.status === "running"
                                  ? "#22c55e"
                                  : event.status === "scheduled"
                                    ? "#3b82f6"
                                    : "#6b7280",
                              color: "white",
                            }}
                            onClick={() => setSelectedEvent(event)}
                          >
                            {event.title.substring(0, 15)}...
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {viewMode === "week" && (
              <div className="space-y-4">
                {getCurrentWeekEvents().map(event => (
                  <Card
                    key={event.id}
                    className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                          <Badge variant={getQAStatusColor(event.qaStatus)}>
                            QA: {event.qaStatus}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>{event.startDate.toLocaleDateString()}</div>
                        <div>to {event.endDate.toLocaleDateString()}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              {testEvents.map(event => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <Badge variant={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                      <Badge variant={getQAStatusColor(event.qaStatus)}>
                        QA: {event.qaStatus}
                      </Badge>
                      {event.conflictScore > 50 && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Conflicts
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        📅 {event.startDate.toLocaleDateString()} -{" "}
                        {event.endDate.toLocaleDateString()}
                      </span>
                      <span>👥 {event.audience}</span>
                      <span>
                        📊 {event.estimatedSampleSize.toLocaleString()} samples
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <NormalButton
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <Eye className="h-4 w-4" />
                    </NormalButton>
                    <NormalButton
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedQAEvent(event);
                        setQaModalOpen(true);
                      }}
                    >
                      <Shield className="h-4 w-4" />
                    </NormalButton>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="qa" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QA Overview */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">QA Status Overview</h3>
              <div className="space-y-3">
                {testEvents.map(event => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={getQAStatusColor(event.qaStatus)}>
                          {event.qaStatus}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {
                            event.qaChecklist.filter(
                              item => item.status === "completed"
                            ).length
                          }
                          /
                          {
                            event.qaChecklist.filter(
                              item => item.priority === "required"
                            ).length
                          }{" "}
                          required checks
                        </span>
                      </div>
                    </div>
                    <NormalButton
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedQAEvent(event);
                        setQaModalOpen(true);
                      }}
                    >
                      Review
                    </NormalButton>
                  </div>
                ))}
              </div>
            </Card>

            {/* QA Statistics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">QA Metrics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Approval Rate</span>
                  <span className="font-semibold">
                    {Math.round(
                      (testEvents.filter(e => e.qaStatus === "approved")
                        .length /
                        testEvents.length) *
                        100
                    )}
                    %
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Average QA Time</span>
                  <span className="font-semibold">2.3 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Failed QA Items</span>
                  <span className="font-semibold text-red-600">
                    {testEvents.reduce(
                      (sum, event) =>
                        sum +
                        event.qaChecklist.filter(
                          item => item.status === "failed"
                        ).length,
                      0
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pending Reviews</span>
                  <span className="font-semibold text-amber-600">
                    {
                      testEvents.filter(
                        e =>
                          e.qaStatus === "pending" || e.qaStatus === "in_review"
                      ).length
                    }
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Event Creation Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl m-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Schedule New Test</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Test Title</Label>
                    <Input
                      id="title"
                      value={newEventForm.title}
                      onChange={e =>
                        setNewEventForm(prev => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Enter test title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="testType">Test Type</Label>
                    <Select
                      value={newEventForm.testType}
                      onValueChange={value =>
                        setNewEventForm(prev => ({ ...prev, testType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="content">Content</SelectItem>
                        <SelectItem value="timing">Timing</SelectItem>
                        <SelectItem value="targeting">Targeting</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEventForm.description}
                    onChange={e =>
                      setNewEventForm(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe the test"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newEventForm.startDate}
                      onChange={e =>
                        setNewEventForm(prev => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newEventForm.endDate}
                      onChange={e =>
                        setNewEventForm(prev => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="platforms">
                      Platforms (comma-separated)
                    </Label>
                    <Input
                      id="platforms"
                      value={newEventForm.platforms}
                      onChange={e =>
                        setNewEventForm(prev => ({
                          ...prev,
                          platforms: e.target.value,
                        }))
                      }
                      placeholder="email, web, social"
                    />
                  </div>
                  <div>
                    <Label htmlFor="audience">Target Audience</Label>
                    <Input
                      id="audience"
                      value={newEventForm.audience}
                      onChange={e =>
                        setNewEventForm(prev => ({
                          ...prev,
                          audience: e.target.value,
                        }))
                      }
                      placeholder="Define target audience"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newEventForm.priority}
                      onValueChange={value =>
                        setNewEventForm(prev => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sampleSize">Estimated Sample Size</Label>
                    <Input
                      id="sampleSize"
                      type="number"
                      value={newEventForm.estimatedSampleSize}
                      onChange={e =>
                        setNewEventForm(prev => ({
                          ...prev,
                          estimatedSampleSize: parseInt(e.target.value) || 1000,
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={newEventForm.tags}
                    onChange={e =>
                      setNewEventForm(prev => ({
                        ...prev,
                        tags: e.target.value,
                      }))
                    }
                    placeholder="campaign, optimization, newsletter"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <NormalButton
                    variant="outline"
                    onClick={() => setShowEventModal(false)}
                  >
                    Cancel
                  </NormalButton>
                  <NormalButton onClick={createNewEvent}>
                    Schedule Test
                  </NormalButton>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* QA Review Modal */}
      {qaModalOpen && selectedQAEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  QA Review: {selectedQAEvent.title}
                </h3>
                <NormalButton
                  variant="outline"
                  onClick={() => setQaModalOpen(false)}
                >
                  ✕
                </NormalButton>
              </div>

              <div className="space-y-6">
                {[
                  "setup",
                  "content",
                  "technical",
                  "compliance",
                  "analytics",
                ].map(category => {
                  const categoryItems = selectedQAEvent.qaChecklist.filter(
                    item => item.category === category
                  );
                  if (categoryItems.length === 0) return null;

                  return (
                    <div key={category} className="space-y-3">
                      <h4 className="font-medium capitalize">
                        {category} Checks
                      </h4>
                      <div className="space-y-2">
                        {categoryItems.map(item => (
                          <div key={item.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-medium">
                                    {item.requirement}
                                  </h5>
                                  <Badge
                                    variant={
                                      item.priority === "required"
                                        ? "destructive"
                                        : "outline"
                                    }
                                  >
                                    {item.priority}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {item.description}
                                </p>
                                {item.notes && (
                                  <p className="text-sm bg-gray-50 p-2 rounded">
                                    {item.notes}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2 ml-4">
                                <NormalButton
                                  variant={
                                    item.status === "completed"
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    updateQAItem(
                                      selectedQAEvent.id,
                                      item.id,
                                      "completed"
                                    )
                                  }
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </NormalButton>
                                <NormalButton
                                  variant={
                                    item.status === "failed"
                                      ? "destructive"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    updateQAItem(
                                      selectedQAEvent.id,
                                      item.id,
                                      "failed"
                                    )
                                  }
                                >
                                  <AlertTriangle className="h-4 w-4" />
                                </NormalButton>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      QA Status:
                    </span>
                    <Badge
                      variant={getQAStatusColor(selectedQAEvent.qaStatus)}
                      className="ml-2"
                    >
                      {selectedQAEvent.qaStatus}
                    </Badge>
                  </div>
                  <NormalButton onClick={() => setQaModalOpen(false)}>
                    Close Review
                  </NormalButton>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
