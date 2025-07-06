/**
 * Content Calendar Automation Dashboard (Simplified)
 * Task 36.3: Simple React interface for AI-powered content ideation and automatic calendar filling
 */

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// Types
interface ContentIdea {
  id: string;
  title: string;
  description: string;
  content_type: "post" | "story" | "video" | "email" | "ad" | "campaign";
  platforms: string[];
  priority_score: number;
  engagement_prediction: number;
  keywords: string[];
  hashtags: string[];
  content_theme: string;
  seasonal_relevance?: string;
  trending_score: number;
  best_posting_times: string[];
  target_audience: string;
  ai_confidence: number;
  created_at: Date;
}

interface CalendarEntry {
  id: string;
  title: string;
  description?: string;
  calendar_date: Date;
  time_slot: string;
  content_type: string;
  target_platforms: string[];
  status: "planned" | "ready" | "scheduled" | "published";
  priority: "low" | "medium" | "high" | "urgent";
  auto_generated: boolean;
  expected_engagement?: number;
  target_audience?: string;
  content_theme?: string;
}

const PLATFORMS = [
  { id: "facebook", name: "Facebook", icon: "📘" },
  { id: "instagram", name: "Instagram", icon: "📷" },
  { id: "twitter", name: "Twitter/X", icon: "🐦" },
  { id: "linkedin", name: "LinkedIn", icon: "💼" },
  { id: "youtube", name: "YouTube", icon: "🎥" },
  { id: "tiktok", name: "TikTok", icon: "🎵" },
];

export default function ContentCalendarAutomationSimple() {
  // State management
  const [activeView, setActiveView] = useState("overview");
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([]);
  const [calendarEntries, setCalendarEntries] = useState<CalendarEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showIdeationForm, setShowIdeationForm] = useState(false);
  const [showAutoFillForm, setShowAutoFillForm] = useState(false);

  // Form states
  const [ideationForm, setIdeationForm] = useState({
    themes: "",
    target_audience: "",
    platforms: [] as string[],
    count: 10,
    include_trending: true,
  });

  const [autoFillForm, setAutoFillForm] = useState({
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    platforms: [] as string[],
    content_types: [] as string[],
    daily_posts: 2,
    content_themes: "",
    target_audiences: "",
    include_trending: true,
    include_seasonal: true,
    auto_approve: false,
  });

  // Load initial data
  useEffect(() => {
    loadCalendarData();
    loadAnalytics();
  }, []);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "/api/marketing/content-calendar-automation"
      );
      if (response.ok) {
        const data = await response.json();
        setCalendarEntries(data.data.calendar_entries || []);
      }
    } catch (error) {
      console.error("Error loading calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch(
        "/api/marketing/content-calendar-automation?calendar_analytics=true"
      );
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data.analytics);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

  const generateContentIdeas = async () => {
    try {
      setLoading(true);
      const themes = ideationForm.themes
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);

      const response = await fetch(
        "/api/marketing/content-calendar-automation",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "generate_ideas",
            themes,
            target_audience: ideationForm.target_audience,
            platforms: ideationForm.platforms,
            count: ideationForm.count,
            include_trending: ideationForm.include_trending,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setContentIdeas(data.data.ideas);
        setShowIdeationForm(false);
      }
    } catch (error) {
      console.error("Error generating content ideas:", error);
    } finally {
      setLoading(false);
    }
  };

  const autoFillCalendar = async () => {
    try {
      setLoading(true);
      const themes = autoFillForm.content_themes
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);
      const audiences = autoFillForm.target_audiences
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);

      const response = await fetch(
        "/api/marketing/content-calendar-automation",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "auto_fill_calendar",
            date_range: {
              start_date: autoFillForm.start_date,
              end_date: autoFillForm.end_date,
            },
            platforms: autoFillForm.platforms,
            content_types: autoFillForm.content_types,
            posting_frequency: {
              daily_posts: autoFillForm.daily_posts,
            },
            time_preferences: {
              preferred_times: ["09:00", "15:00"],
              timezone: "UTC",
            },
            content_themes: themes,
            target_audiences: audiences,
            include_trending: autoFillForm.include_trending,
            include_seasonal: autoFillForm.include_seasonal,
            auto_approve: autoFillForm.auto_approve,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCalendarEntries(prev => [...prev, ...data.data.calendar_entries]);
        setShowAutoFillForm(false);
        await loadAnalytics();
      }
    } catch (error) {
      console.error("Error auto-filling calendar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformToggle = (
    platformId: string,
    formType: "ideation" | "autofill"
  ) => {
    if (formType === "ideation") {
      setIdeationForm(prev => ({
        ...prev,
        platforms: prev.platforms.includes(platformId)
          ? prev.platforms.filter(p => p !== platformId)
          : [...prev.platforms, platformId],
      }));
    } else {
      setAutoFillForm(prev => ({
        ...prev,
        platforms: prev.platforms.includes(platformId)
          ? prev.platforms.filter(p => p !== platformId)
          : [...prev.platforms, platformId],
      }));
    }
  };

  const handleContentTypeToggle = (typeId: string) => {
    setAutoFillForm(prev => ({
      ...prev,
      content_types: prev.content_types.includes(typeId)
        ? prev.content_types.filter(t => t !== typeId)
        : [...prev.content_types, typeId],
    }));
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Calendar Automation</h1>
          <p className="text-gray-600">
            AI-powered content ideation and automatic calendar filling
          </p>
        </div>
        <div className="flex gap-2">
          <NormalButton
            variant="secondary"
            onClick={() => Promise.all([loadCalendarData(), loadAnalytics()])}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </NormalButton>
          <NormalButton
            onClick={() => setShowIdeationForm(true)}
            disabled={loading}
          >
            Generate Ideas
          </NormalButton>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Calendar Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calendarEntries.length}</div>
            <p className="text-xs text-gray-500">
              {calendarEntries.filter(e => e.auto_generated).length}{" "}
              auto-generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Content Ideas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentIdeas.length}</div>
            <p className="text-xs text-gray-500">
              Avg confidence:{" "}
              {contentIdeas.length > 0
                ? Math.round(
                    (contentIdeas.reduce(
                      (sum, idea) => sum + idea.ai_confidence,
                      0
                    ) /
                      contentIdeas.length) *
                      100
                  )
                : 0}
              %
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Expected Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.average_expected_engagement || 0}%
            </div>
            <p className="text-xs text-gray-500">Predicted performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Automation Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.auto_generated_percentage || 0}%
            </div>
            <p className="text-xs text-gray-500">Content automated</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex gap-2 border-b">
        {["overview", "ideas", "calendar", "analytics"].map(view => (
          <NormalButton
            key={view}
            variant={activeView === view ? "primary" : "ghost"}
            onClick={() => setActiveView(view)}
            className="capitalize"
          >
            {view}
          </NormalButton>
        ))}
      </div>

      {/* Overview */}
      {activeView === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Automate your content calendar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <NormalButton
                className="w-full"
                onClick={() => setShowIdeationForm(true)}
              >
                🧠 Generate Content Ideas
              </NormalButton>
              <NormalButton
                className="w-full"
                onClick={() => setShowAutoFillForm(true)}
              >
                ✨ Auto-Fill Calendar
              </NormalButton>
              <NormalButton className="w-full" variant="secondary">
                📊 Analyze Content Gaps
              </NormalButton>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest automated calendar entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {calendarEntries.slice(0, 5).map(entry => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="flex-1">
                      <p className="font-medium">{entry.title}</p>
                      <p className="text-sm text-gray-500">
                        {entry.calendar_date.toLocaleDateString()} at{" "}
                        {entry.time_slot}
                      </p>
                    </div>
                    <Badge
                      variant={entry.auto_generated ? "default" : "secondary"}
                    >
                      {entry.auto_generated ? "AI" : "Manual"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Ideas */}
      {activeView === "ideas" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              AI-Generated Content Ideas
            </h2>
            <NormalButton onClick={() => setShowIdeationForm(true)}>
              + Generate More Ideas
            </NormalButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentIdeas.map(idea => (
              <Card key={idea.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{idea.content_type}</Badge>
                    <span className="text-xs">
                      {Math.round(idea.ai_confidence * 100)}% confident
                    </span>
                  </div>
                  <CardTitle className="text-lg">{idea.title}</CardTitle>
                  <CardDescription>{idea.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Platforms</p>
                      <div className="flex flex-wrap gap-1">
                        {idea.platforms.map(platform => (
                          <Badge
                            key={platform}
                            variant="secondary"
                            className="text-xs"
                          >
                            {PLATFORMS.find(p => p.id === platform)?.icon}{" "}
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">Best Times</p>
                      <p className="text-sm text-gray-500">
                        {idea.best_posting_times.join(", ")}
                      </p>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Engagement</span>
                        <span className="font-medium">
                          {idea.engagement_prediction}%
                        </span>
                      </div>
                    </div>

                    <NormalButton className="w-full" size="sm">
                      Add to Calendar
                    </NormalButton>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {contentIdeas.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-lg font-medium mb-2">No content ideas yet</p>
                <p className="text-gray-500 mb-4">
                  Generate AI-powered content ideas to get started
                </p>
                <NormalButton onClick={() => setShowIdeationForm(true)}>
                  Generate Ideas
                </NormalButton>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Calendar View */}
      {activeView === "calendar" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Automated Calendar Entries
            </h2>
            <NormalButton onClick={() => setShowAutoFillForm(true)}>
              ✨ Auto-Fill Calendar
            </NormalButton>
          </div>

          <div className="space-y-4">
            {calendarEntries.map(entry => (
              <Card key={entry.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{entry.title}</h3>
                        <Badge
                          variant={
                            entry.auto_generated ? "default" : "secondary"
                          }
                        >
                          {entry.auto_generated ? "🤖 AI" : "👤 Manual"}
                        </Badge>
                        <Badge variant="outline">{entry.status}</Badge>
                      </div>

                      <p className="text-sm text-gray-500 mb-2">
                        {entry.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          📅 {entry.calendar_date.toLocaleDateString()}
                        </span>
                        <span>🕐 {entry.time_slot}</span>
                        <span>🎯 {entry.target_platforms.join(", ")}</span>
                        {entry.expected_engagement && (
                          <span>📈 {entry.expected_engagement}% expected</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          entry.priority === "urgent"
                            ? "destructive"
                            : entry.priority === "high"
                              ? "default"
                              : entry.priority === "medium"
                                ? "secondary"
                                : "outline"
                        }
                      >
                        {entry.priority}
                      </Badge>
                      <NormalButton variant="outline" size="sm">
                        Edit
                      </NormalButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Analytics View */}
      {activeView === "analytics" && analytics && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Calendar Analytics</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(analytics.status_distribution || {}).map(
                    ([status, count]) => (
                      <div key={status} className="flex justify-between">
                        <span className="capitalize">{status}</span>
                        <span className="font-medium">{count as number}</span>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(analytics.platform_distribution || {}).map(
                    ([platform, count]) => (
                      <div key={platform} className="flex justify-between">
                        <span className="capitalize">{platform}</span>
                        <span className="font-medium">{count as number}</span>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(
                    analytics.content_type_distribution || {}
                  ).map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <span className="capitalize">{type}</span>
                      <span className="font-medium">{count as number}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Ideation Form Modal */}
      {showIdeationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Generate Content Ideas</CardTitle>
              <CardDescription>
                Use AI to generate creative content ideas for your social media
                calendar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="themes">Content Themes (comma-separated)</Label>
                <Textarea
                  id="themes"
                  placeholder="e.g. product showcase, behind the scenes, industry insights"
                  value={ideationForm.themes}
                  onChange={e =>
                    setIdeationForm(prev => ({
                      ...prev,
                      themes: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="audience">Target Audience</Label>
                <Input
                  id="audience"
                  placeholder="e.g. Tech professionals, Small business owners"
                  value={ideationForm.target_audience}
                  onChange={e =>
                    setIdeationForm(prev => ({
                      ...prev,
                      target_audience: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label>Platforms</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {PLATFORMS.map(platform => (
                    <label
                      key={platform.id}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={ideationForm.platforms.includes(platform.id)}
                        onChange={() =>
                          handlePlatformToggle(platform.id, "ideation")
                        }
                      />
                      <span>
                        {platform.icon} {platform.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="count">Number of Ideas</Label>
                  <Input
                    id="count"
                    type="number"
                    min="1"
                    max="50"
                    value={ideationForm.count}
                    onChange={e =>
                      setIdeationForm(prev => ({
                        ...prev,
                        count: parseInt(e.target.value) || 10,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center space-x-2 mt-6">
                  <input
                    type="checkbox"
                    id="trending"
                    checked={ideationForm.include_trending}
                    onChange={e =>
                      setIdeationForm(prev => ({
                        ...prev,
                        include_trending: e.target.checked,
                      }))
                    }
                  />
                  <Label htmlFor="trending">Include trending topics</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <NormalButton
                  variant="outline"
                  onClick={() => setShowIdeationForm(false)}
                >
                  Cancel
                </NormalButton>
                <NormalButton onClick={generateContentIdeas} disabled={loading}>
                  {loading ? "Generating..." : "Generate Ideas"}
                </NormalButton>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Auto-Fill Form Modal */}
      {showAutoFillForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Auto-Fill Calendar</CardTitle>
              <CardDescription>
                Automatically fill your content calendar with AI-optimized posts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={autoFillForm.start_date}
                    onChange={e =>
                      setAutoFillForm(prev => ({
                        ...prev,
                        start_date: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={autoFillForm.end_date}
                    onChange={e =>
                      setAutoFillForm(prev => ({
                        ...prev,
                        end_date: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Platforms</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {PLATFORMS.map(platform => (
                    <label
                      key={platform.id}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={autoFillForm.platforms.includes(platform.id)}
                        onChange={() =>
                          handlePlatformToggle(platform.id, "autofill")
                        }
                      />
                      <span>
                        {platform.icon} {platform.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Content Types</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {["post", "story", "video", "email"].map(type => (
                    <label
                      key={type}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={autoFillForm.content_types.includes(type)}
                        onChange={() => handleContentTypeToggle(type)}
                      />
                      <span className="capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="daily_posts">Daily Posts</Label>
                <Input
                  id="daily_posts"
                  type="number"
                  min="1"
                  max="10"
                  value={autoFillForm.daily_posts}
                  onChange={e =>
                    setAutoFillForm(prev => ({
                      ...prev,
                      daily_posts: parseInt(e.target.value) || 2,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="themes_input">
                  Content Themes (comma-separated)
                </Label>
                <Textarea
                  id="themes_input"
                  placeholder="e.g. product updates, industry news, tips and tricks"
                  value={autoFillForm.content_themes}
                  onChange={e =>
                    setAutoFillForm(prev => ({
                      ...prev,
                      content_themes: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="audiences_input">
                  Target Audiences (comma-separated)
                </Label>
                <Input
                  id="audiences_input"
                  placeholder="e.g. developers, marketers, business owners"
                  value={autoFillForm.target_audiences}
                  onChange={e =>
                    setAutoFillForm(prev => ({
                      ...prev,
                      target_audiences: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoFillForm.include_trending}
                    onChange={e =>
                      setAutoFillForm(prev => ({
                        ...prev,
                        include_trending: e.target.checked,
                      }))
                    }
                  />
                  <span>Include trending topics</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoFillForm.include_seasonal}
                    onChange={e =>
                      setAutoFillForm(prev => ({
                        ...prev,
                        include_seasonal: e.target.checked,
                      }))
                    }
                  />
                  <span>Include seasonal content</span>
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <NormalButton
                  variant="outline"
                  onClick={() => setShowAutoFillForm(false)}
                >
                  Cancel
                </NormalButton>
                <NormalButton onClick={autoFillCalendar} disabled={loading}>
                  {loading ? "Filling Calendar..." : "Auto-Fill Calendar"}
                </NormalButton>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
