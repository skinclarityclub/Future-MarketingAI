"use client";

import React, { use, useState } from "react";
import EnhancedVisualCalendar from "@/components/marketing/enhanced-visual-calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Sparkles,
  BarChart3,
  Users,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
}

// Mock data for demonstration with enhanced features
const mockEnhancedEvents = [
  {
    id: "enhanced-1",
    title: "Summer Sale Campaign Launch",
    type: "campaign" as const,
    platform: ["facebook", "instagram", "twitter", "linkedin"],
    scheduled_date: new Date(Date.now() + 2 * 60 * 60 * 1000),
    scheduled_time: "10:00",
    status: "scheduled" as const,
    engagement_prediction: 85,
    author: "Marketing Team",
    content_preview:
      "🌞 Summer Sale is here! Get up to 50% off on all products...",
    content_full:
      "🌞 Summer Sale is here! Get up to 50% off on all products. Limited time offer, shop now! #SummerSale #Discount #ShopNow",
    priority: "high" as const,
    hashtags: ["#SummerSale", "#Discount", "#ShopNow"],
    target_audience: "All customers",
    approval_status: "approved" as const,
    approver: "Sarah Johnson",
    campaign_id: "summer-2024",
    budget: 5000,
  },
  {
    id: "enhanced-2",
    title: "Product Demo Video",
    type: "video" as const,
    platform: ["youtube", "linkedin", "tiktok"],
    scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    scheduled_time: "14:00",
    status: "draft" as const,
    engagement_prediction: 92,
    author: "Product Team",
    content_preview: "New product demo showcasing our latest features...",
    content_full:
      "Check out our latest product demo! See how our new features can transform your workflow. Subscribe for more updates!",
    duration: 180,
    priority: "medium" as const,
    target_audience: "B2B customers",
    approval_status: "pending" as const,
    assignee: "John Doe",
  },
  {
    id: "enhanced-3",
    title: "Weekly Newsletter",
    type: "email" as const,
    platform: ["email"],
    scheduled_date: new Date(Date.now() + 48 * 60 * 60 * 1000),
    scheduled_time: "09:00",
    status: "scheduled" as const,
    engagement_prediction: 78,
    author: "Content Team",
    content_preview: "This week's top insights and industry trends...",
    content_full:
      "Dear subscribers, here are this week's top insights and industry trends that you shouldn't miss. Read our full analysis inside.",
    priority: "low" as const,
    target_audience: "Newsletter subscribers",
    approval_status: "approved" as const,
    approver: "Marketing Director",
  },
  {
    id: "enhanced-4",
    title: "Instagram Story Series",
    type: "story" as const,
    platform: ["instagram"],
    scheduled_date: new Date(Date.now() + 6 * 60 * 60 * 1000),
    scheduled_time: "16:00",
    status: "pending_approval" as const,
    engagement_prediction: 65,
    author: "Social Media Manager",
    content_preview: "Behind the scenes of our product development...",
    content_full:
      "Take a look behind the scenes of our product development process. See how our team works to bring you amazing features!",
    priority: "medium" as const,
    tags: ["BTS", "ProductDev", "Team"],
    assignee: "Creative Team",
  },
  {
    id: "enhanced-5",
    title: "LinkedIn Article",
    type: "post" as const,
    platform: ["linkedin"],
    scheduled_date: new Date(Date.now() + 72 * 60 * 60 * 1000),
    scheduled_time: "11:30",
    status: "failed" as const,
    engagement_prediction: 88,
    author: "CEO",
    content_preview: "Industry insights on digital transformation...",
    content_full:
      "The digital transformation landscape is evolving rapidly. Here are my thoughts on where the industry is heading and what it means for businesses.",
    priority: "high" as const,
    target_audience: "Industry professionals",
    notes: "Failed due to API error - retry scheduled",
  },
  // Add a conflicting event for demonstration
  {
    id: "enhanced-6",
    title: "Twitter Thread",
    type: "post" as const,
    platform: ["twitter"],
    scheduled_date: new Date(Date.now() + 2 * 60 * 60 * 1000),
    scheduled_time: "10:15", // Close to enhanced-1 for conflict demo
    status: "draft" as const,
    engagement_prediction: 45,
    author: "Marketing Team", // Same author as enhanced-1
    content_preview: "Thread about summer marketing strategies...",
    content_full:
      "🧵 Thread: 5 essential summer marketing strategies that actually work. Let's dive in... 1/5",
    priority: "low" as const,
    hashtags: ["#MarketingTips", "#Summer", "#Strategy"],
  },
];

export default function EnhancedContentCalendarDemo({ params }: PageProps) {
  const { locale } = use(params);
  const [events, setEvents] = useState(mockEnhancedEvents);

  const handleEventMove = (eventId: string, newDate: Date) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === eventId ? { ...event, scheduled_date: newDate } : event
      )
    );
  };

  const handleEventCreate = (date: Date) => {
    const newEvent = {
      id: `enhanced-new-${Date.now()}`,
      title: "New Content",
      type: "post" as const,
      platform: ["facebook"],
      scheduled_date: date,
      scheduled_time: "09:00",
      status: "draft" as const,
      engagement_prediction: 75,
      author: "Current User",
      content_preview: "New content to be created...",
      content_full: "New content to be created...",
      priority: "medium" as const,
      hashtags: ["#new", "#content"],
    };
    setEvents(prev => [...prev, newEvent as any]);
  };

  const handleEventEdit = (event: any) => {
    console.log("Edit event:", event);
  };

  const handleEventDelete = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const handleEventDuplicate = (event: any) => {
    const duplicated = {
      ...event,
      id: `enhanced-copy-${Date.now()}`,
      title: `${event.title} (Copy)`,
      status: "draft" as const,
      scheduled_date: new Date(
        event.scheduled_date.getTime() + 24 * 60 * 60 * 1000
      ),
    };
    setEvents(prev => [...prev, duplicated]);
  };

  const handleBulkMove = (eventIds: string[], newDate: Date) => {
    setEvents(prev =>
      prev.map(event =>
        eventIds.includes(event.id)
          ? { ...event, scheduled_date: newDate }
          : event
      )
    );
  };

  const getStatusCount = (status: string) => {
    return events.filter(event => event.status === status).length;
  };

  const getConflictCount = () => {
    const conflictEvents = events.filter(event => {
      return events.some(
        otherEvent =>
          event.id !== otherEvent.id &&
          event.author === otherEvent.author &&
          event.scheduled_date.toDateString() ===
            otherEvent.scheduled_date.toDateString() &&
          Math.abs(
            parseInt(event.scheduled_time.replace(":", "")) -
              parseInt(otherEvent.scheduled_time.replace(":", ""))
          ) < 30
      );
    });
    return conflictEvents.length;
  };

  const translations = {
    en: {
      title: "Enhanced Visual Content Calendar Demo",
      description:
        "Experience the next-generation content calendar with advanced drag-and-drop, conflict detection, and multi-select capabilities",
      features: "Key Features",
      overview: "Demo Overview",
      feature1: "Advanced drag-and-drop with visual feedback",
      feature2: "Multi-select for bulk operations",
      feature3: "Conflict detection and resolution",
      feature4: "Multiple calendar views (month, week, day)",
      feature5: "Priority-based color coding",
      feature6: "Author and status filtering",
      stats: "Content Statistics",
      totalContent: "Total Content",
      scheduled: "Scheduled",
      drafts: "Drafts",
      conflicts: "Conflicts Detected",
      published: "Published",
      failed: "Failed",
      instructions: "How to Use",
      instruction1: "Drag and drop events to reschedule them",
      instruction2: "Enable multi-select mode for bulk operations",
      instruction3: "Double-click on any day to create new content",
      instruction4: "Use filters to focus on specific authors or statuses",
      instruction5: "Watch for conflict alerts (red warning icons)",
      instruction6: "Switch between month, week, and day views",
    },
    nl: {
      title: "Enhanced Visual Content Calendar Demo",
      description:
        "Ervaar de next-generation content kalender met geavanceerde drag-and-drop, conflict detectie en multi-select mogelijkheden",
      features: "Belangrijkste Functies",
      overview: "Demo Overzicht",
      feature1: "Geavanceerde drag-and-drop met visuele feedback",
      feature2: "Multi-select voor bulk bewerkingen",
      feature3: "Conflict detectie en oplossing",
      feature4: "Meerdere kalender weergaven (maand, week, dag)",
      feature5: "Prioriteit-gebaseerde kleurcodering",
      feature6: "Auteur en status filtering",
      stats: "Content Statistieken",
      totalContent: "Totale Content",
      scheduled: "Gepland",
      drafts: "Concepten",
      conflicts: "Conflicten Gedetecteerd",
      published: "Gepubliceerd",
      failed: "Mislukt",
      instructions: "Hoe te Gebruiken",
      instruction1: "Sleep en zet events neer om ze opnieuw in te plannen",
      instruction2: "Schakel multi-select modus in voor bulk bewerkingen",
      instruction3: "Dubbelklik op elke dag om nieuwe content te maken",
      instruction4:
        "Gebruik filters om te focussen op specifieke auteurs of statussen",
      instruction5:
        "Let op conflict waarschuwingen (rode waarschuwingspictogrammen)",
      instruction6: "Schakel tussen maand, week en dag weergaven",
    },
  };

  const t =
    translations[locale as keyof typeof translations] || translations.en;

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {t.title}
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              {t.description}
            </p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t.totalContent}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              {t.scheduled}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {getStatusCount("scheduled")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              {t.drafts}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {getStatusCount("draft")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              {t.conflicts}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {getConflictCount()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-green-500" />
              {t.published}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {getStatusCount("published")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              {t.failed}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {getStatusCount("failed")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {t.features}
          </CardTitle>
          <CardDescription>{t.overview}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-1">
                1
              </Badge>
              <span className="text-sm">{t.feature1}</span>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-1">
                2
              </Badge>
              <span className="text-sm">{t.feature2}</span>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-1">
                3
              </Badge>
              <span className="text-sm">{t.feature3}</span>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-1">
                4
              </Badge>
              <span className="text-sm">{t.feature4}</span>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-1">
                5
              </Badge>
              <span className="text-sm">{t.feature5}</span>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-1">
                6
              </Badge>
              <span className="text-sm">{t.feature6}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>{t.instructions}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">{t.instruction1}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm">{t.instruction2}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">{t.instruction3}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm">{t.instruction4}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm">{t.instruction5}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span className="text-sm">{t.instruction6}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Calendar */}
      <EnhancedVisualCalendar
        events={events}
        onEventMove={handleEventMove}
        onEventCreate={handleEventCreate}
        onEventEdit={handleEventEdit}
        onEventDelete={handleEventDelete}
        onEventDuplicate={handleEventDuplicate}
        onBulkMove={handleBulkMove}
      />
    </div>
  );
}
