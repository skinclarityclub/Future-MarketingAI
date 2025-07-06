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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  MessageCircle,
  Video,
  Share2,
  Activity,
  TrendingUp,
  Clock,
  UserPlus,
  Plus,
  Settings,
  Eye,
  Edit,
  Play,
  Pause,
  MoreHorizontal,
  Calendar,
  BarChart3,
  Target,
  Zap,
  Globe,
  Lock,
  UserCheck,
  MessageSquare,
  FileText,
  Link,
  Download,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Share,
  PenTool,
  MousePointer,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department: string;
  status: "online" | "away" | "busy" | "offline";
  last_seen: string;
}

interface CollaborationSpace {
  id: string;
  name: string;
  description: string;
  type: string;
  owner_id: string;
  members: Array<{
    user_id: string;
    user_name: string;
    role: string;
    status: string;
  }>;
  created_at: string;
  updated_at: string;
  activity_feed: Array<{
    id: string;
    actor_name: string;
    action: string;
    description: string;
    timestamp: string;
  }>;
}

interface DashboardOverview {
  total_users: number;
  online_users: number;
  total_spaces: number;
  active_spaces: number;
  collaboration_score: number;
  weekly_sessions: number;
  avg_session_duration: number;
}

interface CollaborationAnalytics {
  engagement_metrics: {
    daily_active_users: number;
    weekly_active_users: number;
    retention_rate: number;
  };
  productivity_metrics: {
    documents_created: number;
    documents_edited: number;
    comments_added: number;
    decisions_made: number;
  };
  platform_usage: {
    most_active_spaces: Array<{
      space_id: string;
      space_name: string;
      activity_count: number;
    }>;
  };
}

export default function MultiUserCollaborationDashboard() {
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [spaces, setSpaces] = useState<CollaborationSpace[]>([]);
  const [analytics, setAnalytics] = useState<CollaborationAnalytics | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isCreateSpaceDialogOpen, setIsCreateSpaceDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "editor",
    department: "Marketing",
  });
  const [newSpace, setNewSpace] = useState({
    name: "",
    description: "",
    type: "project",
    owner_id: "user_1",
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load overview data
      const overviewResponse = await fetch(
        "/api/multi-user-collaboration?action=get_dashboard_overview"
      );
      const overviewData = await overviewResponse.json();

      if (overviewData.status === "success") {
        setOverview(overviewData.data.overview);
        setAnalytics({
          engagement_metrics: overviewData.data.user_engagement,
          productivity_metrics: overviewData.data.productivity,
          platform_usage: { most_active_spaces: overviewData.data.top_spaces },
        });
      }

      // Load users
      const usersResponse = await fetch(
        "/api/multi-user-collaboration?action=get_users"
      );
      const usersData = await usersResponse.json();

      if (usersData.status === "success") {
        setUsers(usersData.data.users);
      }

      // Load spaces
      const spacesResponse = await fetch(
        "/api/multi-user-collaboration?action=get_spaces"
      );
      const spacesData = await spacesResponse.json();

      if (spacesData.status === "success") {
        setSpaces(spacesData.data.spaces);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    if (!newUser.name || !newUser.email) return;

    try {
      const response = await fetch("/api/multi-user-collaboration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_user",
          ...newUser,
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        setUsers(prev => [...prev, data.data.user]);
        setNewUser({
          name: "",
          email: "",
          role: "editor",
          department: "Marketing",
        });
        setIsCreateUserDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const createSpace = async () => {
    if (!newSpace.name || !newSpace.type) return;

    try {
      const response = await fetch("/api/multi-user-collaboration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_space",
          ...newSpace,
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        setSpaces(prev => [...prev, data.data.space]);
        setNewSpace({
          name: "",
          description: "",
          type: "project",
          owner_id: "user_1",
        });
        setIsCreateSpaceDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating space:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500";
      case "manager":
        return "bg-purple-500";
      case "editor":
        return "bg-blue-500";
      case "contributor":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Nu";
    if (diffInMinutes < 60) return `${diffInMinutes}m geleden`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)}u geleden`;
    return `${Math.floor(diffInMinutes / 1440)}d geleden`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Collaboration systeem laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Multi-User Collaboration
            </h1>
            <p className="text-gray-400 mt-2">
              Real-time samenwerking en team productiviteit dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="bg-green-500/10 text-green-400 border-green-500/30"
            >
              <Zap className="h-3 w-3 mr-1" />
              Live Systeem
            </Badge>
            <NormalButton variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Instellingen
            </NormalButton>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-blue-600"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Overzicht
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-blue-600"
          >
            <Users className="h-4 w-4 mr-2" />
            Gebruikers
          </TabsTrigger>
          <TabsTrigger
            value="spaces"
            className="data-[state=active]:bg-blue-600"
          >
            <Globe className="h-4 w-4 mr-2" />
            Spaces
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-blue-600"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Totaal Gebruikers</p>
                    <p className="text-2xl font-bold text-white">
                      {overview?.total_users || 0}
                    </p>
                    <p className="text-xs text-green-400 mt-1">
                      {overview?.online_users || 0} online
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Actieve Spaces</p>
                    <p className="text-2xl font-bold text-white">
                      {overview?.active_spaces || 0}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      van {overview?.total_spaces || 0} totaal
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Globe className="h-6 w-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Collaboration Score</p>
                    <p className="text-2xl font-bold text-white">
                      {overview?.collaboration_score || 0}%
                    </p>
                    <p className="text-xs text-green-400 mt-1">
                      +12% deze week
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Avg. Sessie Duur</p>
                    <p className="text-2xl font-bold text-white">
                      {overview?.avg_session_duration || 0}m
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {overview?.weekly_sessions || 0} sessies deze week
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="h-5 w-5" />
                Recente Activiteit
              </CardTitle>
              <CardDescription className="text-gray-400">
                Live updates van team collaboratie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {spaces.flatMap(
                    space =>
                      space.activity_feed?.slice(0, 3).map(activity => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg"
                        >
                          <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {activity.actor_name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-white">
                              <span className="font-medium">
                                {activity.actor_name}
                              </span>{" "}
                              {activity.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {space.name}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {formatTimeAgo(activity.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )) || []
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Team Gebruikers
              </h2>
              <p className="text-gray-400">Beheer team leden en hun rollen</p>
            </div>
            <Dialog
              open={isCreateUserDialogOpen}
              onOpenChange={setIsCreateUserDialogOpen}
            >
              <DialogTrigger asChild>
                <NormalButton className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Nieuwe Gebruiker
                </NormalButton>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle>Nieuwe Gebruiker Toevoegen</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Voeg een nieuwe gebruiker toe aan het collaboration systeem
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300">
                      Naam
                    </label>
                    <Input
                      value={newUser.name}
                      onChange={e =>
                        setNewUser(prev => ({ ...prev, name: e.target.value }))
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Volledige naam"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={newUser.email}
                      onChange={e =>
                        setNewUser(prev => ({ ...prev, email: e.target.value }))
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="email@company.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">
                      Rol
                    </label>
                    <Select
                      value={newUser.role}
                      onValueChange={value =>
                        setNewUser(prev => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="contributor">Contributor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">
                      Afdeling
                    </label>
                    <Select
                      value={newUser.department}
                      onValueChange={value =>
                        setNewUser(prev => ({ ...prev, department: value }))
                      }
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Development">Development</SelectItem>
                        <SelectItem value="Analytics">Analytics</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <NormalButton
                    onClick={createUser}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Gebruiker Aanmaken
                  </NormalButton>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map(user => (
              <Card key={user.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-blue-600 text-white">
                          {user.name
                            .split(" ")
                            .map(n => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(user.status)} rounded-full border-2 border-gray-800`}
                      ></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{user.name}</h3>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Rol:</span>
                      <Badge
                        variant="outline"
                        className={`${getRoleColor(user.role)} text-white border-0`}
                      >
                        {user.role}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Afdeling:</span>
                      <span className="text-sm text-white">
                        {user.department}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Status:</span>
                      <span className="text-sm text-white capitalize">
                        {user.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        Laatst gezien:
                      </span>
                      <span className="text-sm text-gray-300">
                        {formatTimeAgo(user.last_seen)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Spaces Tab */}
        <TabsContent value="spaces" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Collaboration Spaces
              </h2>
              <p className="text-gray-400">
                Beheer team workspaces en projecten
              </p>
            </div>
            <Dialog
              open={isCreateSpaceDialogOpen}
              onOpenChange={setIsCreateSpaceDialogOpen}
            >
              <DialogTrigger asChild>
                <NormalButton className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nieuwe Space
                </NormalButton>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle>Nieuwe Collaboration Space</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Maak een nieuwe workspace voor team samenwerking
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300">
                      Space Naam
                    </label>
                    <Input
                      value={newSpace.name}
                      onChange={e =>
                        setNewSpace(prev => ({ ...prev, name: e.target.value }))
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Project naam"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">
                      Beschrijving
                    </label>
                    <Textarea
                      value={newSpace.description}
                      onChange={e =>
                        setNewSpace(prev => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Beschrijf het doel van deze space"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">
                      Type
                    </label>
                    <Select
                      value={newSpace.type}
                      onValueChange={value =>
                        setNewSpace(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="campaign">Campaign</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="dashboard">Dashboard</SelectItem>
                        <SelectItem value="analysis">Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <NormalButton
                    onClick={createSpace}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Space Aanmaken
                  </NormalButton>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {spaces.map(space => (
              <Card key={space.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">{space.name}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {space.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {space.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Members */}
                    <div>
                      <p className="text-sm font-medium text-gray-300 mb-2">
                        Team Leden ({space.members?.length || 0})
                      </p>
                      <div className="flex -space-x-2">
                        {space.members?.slice(0, 5).map((member, index) => (
                          <Avatar
                            key={index}
                            className="h-8 w-8 border-2 border-gray-800"
                          >
                            <AvatarFallback className="bg-blue-600 text-white text-xs">
                              {member.user_name
                                .split(" ")
                                .map(n => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {space.members && space.members.length > 5 && (
                          <div className="h-8 w-8 bg-gray-600 rounded-full border-2 border-gray-800 flex items-center justify-center">
                            <span className="text-xs text-white">
                              +{space.members.length - 5}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <p className="text-sm font-medium text-gray-300 mb-2">
                        Recente Activiteit
                      </p>
                      <div className="space-y-2">
                        {space.activity_feed?.slice(0, 3).map(activity => (
                          <div
                            key={activity.id}
                            className="text-sm text-gray-400"
                          >
                            <span className="font-medium text-white">
                              {activity.actor_name}
                            </span>{" "}
                            {activity.action} •{" "}
                            {formatTimeAgo(activity.timestamp)}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <NormalButton
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Bekijken
                      </NormalButton>
                      <NormalButton
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Sessie Starten
                      </NormalButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Metrics */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Team Engagement</CardTitle>
                <CardDescription className="text-gray-400">
                  Gebruiker activiteit en betrokkenheid metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Dagelijks Actief
                    </span>
                    <span className="text-lg font-semibold text-white">
                      {analytics?.engagement_metrics.daily_active_users || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Wekelijks Actief
                    </span>
                    <span className="text-lg font-semibold text-white">
                      {analytics?.engagement_metrics.weekly_active_users || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Retentie Rate</span>
                    <span className="text-lg font-semibold text-green-400">
                      {analytics?.engagement_metrics.retention_rate || 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Productivity Metrics */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Productiviteit</CardTitle>
                <CardDescription className="text-gray-400">
                  Team output en creatie metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Documenten Gemaakt
                    </span>
                    <span className="text-lg font-semibold text-white">
                      {analytics?.productivity_metrics.documents_created || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Documenten Bewerkt
                    </span>
                    <span className="text-lg font-semibold text-white">
                      {analytics?.productivity_metrics.documents_edited || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Comments Toegevoegd
                    </span>
                    <span className="text-lg font-semibold text-white">
                      {analytics?.productivity_metrics.comments_added || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Beslissingen Genomen
                    </span>
                    <span className="text-lg font-semibold text-purple-400">
                      {analytics?.productivity_metrics.decisions_made || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Spaces */}
            <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-white">
                  Meest Actieve Spaces
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Spaces met de hoogste activiteit en engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.platform_usage.most_active_spaces.map(
                    (space, index) => (
                      <div
                        key={space.space_id}
                        className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {space.space_name}
                            </p>
                            <p className="text-sm text-gray-400">
                              {space.activity_count} activiteiten
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Actief</Badge>
                          <NormalButton size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </NormalButton>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
