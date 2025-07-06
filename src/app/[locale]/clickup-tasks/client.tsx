"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MarketingClickUpTasklist from "@/components/dashboard/marketing-clickup-tasklist";
import {
  Search,
  Filter,
  Plus,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  BarChart3,
  Download,
  Settings,
  TrendingUp,
  FileText,
} from "lucide-react";

interface ClickUpTasksClientProps {
  locale: string;
}

const translations = {
  en: {
    title: "ClickUp Content Workflow",
    subtitle: "Manage all content tasks through their complete lifecycle",
    overview: "Overview",
    tasks: "Tasks",
    team: "Team",
    analytics: "Analytics",
    searchPlaceholder: "Search tasks, team members, or content...",
    filterBy: "Filter by",
    allPhases: "All Phases",
    activeOnly: "Active Only",
    overdue: "Overdue",
    completed: "Completed",
    addTask: "Add Task",
    refresh: "Refresh",
    export: "Export",
    settings: "Settings",
    totalTasks: "Total Tasks",
    activeTasks: "Active Tasks",
    completedToday: "Completed Today",
    overdueItems: "Overdue Items",
    quickStats: "Quick Stats",
    recentActivity: "Recent Activity",
    upcomingDeadlines: "Upcoming Deadlines",
    teamPerformance: "Team Performance",
    phaseDistribution: "Phase Distribution",
    contentTypes: "Content Types",
    blog: "Blog Posts",
    social: "Social Media",
    email: "Email Campaigns",
    video: "Video Content",
    ideation: "Ideation",
    research: "Research",
    creation: "Creation",
    design: "Design",
    review: "Review",
    publish: "Publish",
    analysis: "Analysis",
  },
  nl: {
    title: "ClickUp Content Workflow",
    subtitle: "Beheer alle content taken door hun complete levenscyclus",
    overview: "Overzicht",
    tasks: "Taken",
    team: "Team",
    analytics: "Analytics",
    searchPlaceholder: "Zoek taken, teamleden, of content...",
    filterBy: "Filter op",
    allPhases: "Alle Fases",
    activeOnly: "Alleen Actief",
    overdue: "Achterstallig",
    completed: "Voltooid",
    addTask: "Taak Toevoegen",
    refresh: "Vernieuwen",
    export: "Exporteren",
    settings: "Instellingen",
    totalTasks: "Totaal Taken",
    activeTasks: "Actieve Taken",
    completedToday: "Vandaag Voltooid",
    overdueItems: "Achterstallige Items",
    quickStats: "Snelle Statistieken",
    recentActivity: "Recente Activiteit",
    upcomingDeadlines: "Aankomende Deadlines",
    teamPerformance: "Team Prestaties",
    phaseDistribution: "Fase Verdeling",
    contentTypes: "Content Types",
    blog: "Blog Posts",
    social: "Social Media",
    email: "Email Campagnes",
    video: "Video Content",
    ideation: "Idee Vorming",
    research: "Onderzoek",
    creation: "Creatie",
    design: "Design",
    review: "Review",
    publish: "Publiceren",
    analysis: "Analyse",
  },
};

export default function ClickUpTasksClient({
  locale,
}: ClickUpTasksClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);

  const t = translations[locale as keyof typeof translations];

  // Mock stats data
  const [stats] = useState({
    totalTasks: 156,
    activeTasks: 43,
    completedToday: 12,
    overdueItems: 7,
  });

  // Mock phase distribution data
  const phaseData = [
    { phase: t.ideation, count: 15, color: "bg-purple-500" },
    { phase: t.research, count: 23, color: "bg-blue-500" },
    { phase: t.creation, count: 31, color: "bg-green-500" },
    { phase: t.design, count: 18, color: "bg-yellow-500" },
    { phase: t.review, count: 12, color: "bg-orange-500" },
    { phase: t.publish, count: 8, color: "bg-red-500" },
    { phase: t.analysis, count: 5, color: "bg-pink-500" },
  ];

  // Mock content types data
  const contentTypes = [
    { type: t.blog, count: 45, icon: FileText },
    { type: t.social, count: 62, icon: Users },
    { type: t.email, count: 28, icon: Calendar },
    { type: t.video, count: 21, icon: BarChart3 },
  ];

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const tabs = [
    { id: "overview", label: t.overview, icon: BarChart3 },
    { id: "tasks", label: t.tasks, icon: CheckCircle },
    { id: "team", label: t.team, icon: Users },
    { id: "analytics", label: t.analytics, icon: TrendingUp },
  ];

  const filters = [
    { id: "all", label: t.allPhases },
    { id: "active", label: t.activeOnly },
    { id: "overdue", label: t.overdue },
    { id: "completed", label: t.completed },
  ];

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{t.title}</h1>
              <p className="text-white/70">{t.subtitle}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                {t.refresh}
              </Button>
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Download className="h-4 w-4 mr-2" />
                {t.export}
              </Button>
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Settings className="h-4 w-4 mr-2" />
                {t.settings}
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                {t.addTask}
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-black/20 backdrop-blur-lg border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">{t.totalTasks}</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalTasks}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-lg border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">{t.activeTasks}</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.activeTasks}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-lg border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">{t.completedToday}</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.completedToday}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-lg border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">{t.overdueItems}</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.overdueItems}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-white/70" />
              <span className="text-white/70 text-sm">{t.filterBy}:</span>
              {filters.map(filter => (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.id)}
                  className={
                    activeFilter === filter.id
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  }
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-2">
          <div className="flex flex-wrap gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Phase Distribution */}
              <Card className="bg-black/20 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">
                    {t.phaseDistribution}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {phaseData.map((phase, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white/70 text-sm">
                          {phase.phase}
                        </span>
                        <span className="text-white font-semibold">
                          {phase.count}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className={`${phase.color} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${(phase.count / 112) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Content Types */}
              <Card className="bg-black/20 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">{t.contentTypes}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contentTypes.map((type, index) => {
                    const Icon = type.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-white/70" />
                          <span className="text-white/70">{type.type}</span>
                        </div>
                        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                          {type.count}
                        </Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-black/20 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    New Blog Post
                  </Button>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                    <Users className="h-4 w-4 mr-2" />
                    Social Campaign
                  </Button>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <Calendar className="h-4 w-4 mr-2" />
                    Email Newsletter
                  </Button>
                </CardContent>
              </Card>

              {/* Main Task List - Full Width */}
              <div className="lg:col-span-3">
                <MarketingClickUpTasklist />
              </div>
            </div>
          )}

          {activeTab === "tasks" && <MarketingClickUpTasklist />}

          {activeTab === "team" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">
                    {t.teamPerformance}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70">
                    Team performance analytics coming soon...
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-black/20 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70">
                    Team member overview coming soon...
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70">
                    Performance metrics dashboard coming soon...
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-black/20 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Content ROI</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70">
                    Content ROI analytics coming soon...
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
