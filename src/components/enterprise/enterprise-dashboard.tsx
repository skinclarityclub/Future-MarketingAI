"use client";

/**
 * Enterprise Dashboard
 * Task 103.10: Enterprise Features and System Integration
 *
 * Features:
 * - Multi-user access control dashboard
 * - Team collaboration tools
 * - White-label management
 * - Advanced reporting and analytics
 * - API webhook management
 * - System integration controls
 * - n8n workflow integration
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Users,
  Shield,
  Settings,
  BarChart3,
  Webhook,
  Zap,
  Building,
  Globe,
  Lock,
  UserPlus,
  Activity,
  TrendingUp,
  Database,
  Cloud,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  Search,
  Filter,
  Calendar,
  Target,
  Layers,
} from "lucide-react";

interface EnterpriseUser {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  status: "active" | "inactive" | "pending";
  lastLogin: Date | null;
  permissions: string[];
}

interface TeamData {
  id: string;
  name: string;
  members: number;
  contentCreated: number;
  engagement: number;
  performance: number;
}

interface WhiteLabelConfig {
  brandName: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  domain: string;
  customCSS: string;
  emailTemplates: Record<string, string>;
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: "active" | "inactive";
  lastTriggered: Date | null;
  successRate: number;
}

export default function EnterpriseDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState<EnterpriseUser[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@company.com",
      role: "Admin",
      team: "Marketing",
      status: "active",
      lastLogin: new Date(),
      permissions: ["content:create", "analytics:read", "users:manage"],
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@company.com",
      role: "Content Creator",
      team: "Content",
      status: "active",
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
      permissions: ["content:create", "content:edit"],
    },
  ]);

  const [teams, setTeams] = useState<TeamData[]>([
    {
      id: "1",
      name: "Marketing Team",
      members: 8,
      contentCreated: 245,
      engagement: 87.3,
      performance: 94.2,
    },
    {
      id: "2",
      name: "Content Team",
      members: 5,
      contentCreated: 189,
      engagement: 91.7,
      performance: 89.1,
    },
  ]);

  const [whiteLabelConfig, setWhiteLabelConfig] = useState<WhiteLabelConfig>({
    brandName: "Your Brand",
    logo: "/logo.png",
    primaryColor: "#0066cc",
    secondaryColor: "#ff6600",
    domain: "yourbrand.com",
    customCSS: "",
    emailTemplates: {},
  });

  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: "1",
      name: "Content Published",
      url: "https://api.company.com/webhooks/content",
      events: ["content.published", "content.updated"],
      status: "active",
      lastTriggered: new Date(),
      successRate: 98.5,
    },
    {
      id: "2",
      name: "Analytics Update",
      url: "https://analytics.company.com/webhook",
      events: ["analytics.daily", "analytics.weekly"],
      status: "active",
      lastTriggered: new Date(Date.now() - 3600000),
      successRate: 96.2,
    },
  ]);

  const [stats, setStats] = useState({
    totalUsers: 23,
    activeUsers: 18,
    totalTeams: 4,
    contentCreated: 1847,
    totalEngagement: 89.4,
    systemUptime: 99.8,
    apiCalls: 45892,
    storageUsed: 67.3,
  });

  const [selectedUser, setSelectedUser] = useState<EnterpriseUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const roles = [
    "Super Admin",
    "Admin",
    "Manager",
    "Content Creator",
    "Viewer",
  ];
  const availableTeams = [
    "Marketing",
    "Content",
    "Sales",
    "Support",
    "Development",
  ];

  const handleUserAction = (action: string, userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    switch (action) {
      case "edit":
        setSelectedUser(user);
        setShowUserModal(true);
        break;
      case "deactivate":
        setUsers(prev =>
          prev.map(u =>
            u.id === userId ? { ...u, status: "inactive" as const } : u
          )
        );
        break;
      case "delete":
        setUsers(prev => prev.filter(u => u.id !== userId));
        break;
    }
  };

  const handleWebhookToggle = (webhookId: string) => {
    setWebhooks(prev =>
      prev.map(webhook =>
        webhook.id === webhookId
          ? {
              ...webhook,
              status: webhook.status === "active" ? "inactive" : "active",
            }
          : webhook
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600";
      case "inactive":
        return "text-red-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "inactive":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Enterprise Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive system management and team collaboration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            System Healthy
          </Badge>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.systemUptime}%
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.apiCalls.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Database className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.storageUsed}%</div>
            <p className="text-xs text-muted-foreground">of allocated space</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="whitelabel">White-label</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Content Production</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Team Collaboration</span>
                    <span className="font-medium">94%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>System Performance</span>
                    <span className="font-medium">98%</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-green-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <UserPlus className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">
                        New user added to Marketing team
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      2min ago
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Webhook className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">
                        Webhook triggered successfully
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      5min ago
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-green-600" />
                      <span className="text-sm">
                        Content performance goal reached
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      12min ago
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common enterprise management tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-4">
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <UserPlus className="h-6 w-6" />
                  <span className="text-sm">Add User</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Create Team</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Webhook className="h-6 w-6" />
                  <span className="text-sm">Add Webhook</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Download className="h-6 w-6" />
                  <span className="text-sm">Export Data</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users & Roles Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Input placeholder="Search users..." className="w-64" />
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-600" />
                Users & Access Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{user.role}</Badge>
                          <Badge variant="secondary">{user.team}</Badge>
                          {getStatusIcon(user.status)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {user.lastLogin
                          ? `Last login: ${user.lastLogin.toLocaleDateString()}`
                          : "Never logged in"}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUserAction("edit", user.id)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUserAction("deactivate", user.id)}
                      >
                        <Lock className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Team Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {teams.map(team => (
                  <Card key={team.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <Badge variant="secondary">
                          {team.members} members
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">
                            Content Created
                          </p>
                          <p className="font-bold text-2xl">
                            {team.contentCreated}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Engagement</p>
                          <p className="font-bold text-2xl text-green-600">
                            {team.engagement}%
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Performance Score</span>
                          <span className="font-medium">
                            {team.performance}%
                          </span>
                        </div>
                        <Progress value={team.performance} className="h-2" />
                      </div>
                      <Button variant="outline" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Webhook className="h-5 w-5 mr-2 text-purple-600" />
                API Webhooks Management
              </CardTitle>
              <CardDescription>
                Configure webhooks for system events and integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhooks.map(webhook => (
                  <div
                    key={webhook.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-3 h-3 rounded-full ${webhook.status === "active" ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <div>
                        <p className="font-medium">{webhook.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {webhook.url}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {webhook.events.map(event => (
                            <Badge
                              key={event}
                              variant="outline"
                              className="text-xs"
                            >
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">
                          {webhook.successRate}% success
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last:{" "}
                          {webhook.lastTriggered?.toLocaleString() || "Never"}
                        </p>
                      </div>
                      <Switch
                        checked={webhook.status === "active"}
                        onCheckedChange={() => handleWebhookToggle(webhook.id)}
                      />
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Webhook
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* White-label Tab */}
        <TabsContent value="whitelabel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-orange-600" />
                White-label Configuration
              </CardTitle>
              <CardDescription>
                Customize the platform with your brand identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="brandName">Brand Name</Label>
                  <Input
                    id="brandName"
                    value={whiteLabelConfig.brandName}
                    onChange={e =>
                      setWhiteLabelConfig(prev => ({
                        ...prev,
                        brandName: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Custom Domain</Label>
                  <Input
                    id="domain"
                    value={whiteLabelConfig.domain}
                    onChange={e =>
                      setWhiteLabelConfig(prev => ({
                        ...prev,
                        domain: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={whiteLabelConfig.primaryColor}
                      onChange={e =>
                        setWhiteLabelConfig(prev => ({
                          ...prev,
                          primaryColor: e.target.value,
                        }))
                      }
                      className="w-20"
                    />
                    <Input
                      value={whiteLabelConfig.primaryColor}
                      onChange={e =>
                        setWhiteLabelConfig(prev => ({
                          ...prev,
                          primaryColor: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={whiteLabelConfig.secondaryColor}
                      onChange={e =>
                        setWhiteLabelConfig(prev => ({
                          ...prev,
                          secondaryColor: e.target.value,
                        }))
                      }
                      className="w-20"
                    />
                    <Input
                      value={whiteLabelConfig.secondaryColor}
                      onChange={e =>
                        setWhiteLabelConfig(prev => ({
                          ...prev,
                          secondaryColor: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customCSS">Custom CSS</Label>
                <Textarea
                  id="customCSS"
                  placeholder="/* Add your custom CSS here */"
                  value={whiteLabelConfig.customCSS}
                  onChange={e =>
                    setWhiteLabelConfig(prev => ({
                      ...prev,
                      customCSS: e.target.value,
                    }))
                  }
                  className="min-h-32"
                />
              </div>

              <div className="flex space-x-2">
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Export Configuration
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Configuration
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layers className="h-5 w-5 mr-2 text-indigo-600" />
                System Integrations
              </CardTitle>
              <CardDescription>
                Connect with external systems and automation platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-orange-600" />
                      n8n Workflows
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Status</span>
                      <Badge variant="default">Connected</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Active Workflows</span>
                      <span className="font-medium">12</span>
                    </div>
                    <Button variant="outline" className="w-full">
                      Manage Workflows
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Cloud className="h-5 w-5 mr-2 text-blue-600" />
                      Cloud Storage
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Status</span>
                      <Badge variant="default">Synced</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Storage Used</span>
                      <span className="font-medium">67.3%</span>
                    </div>
                    <Button variant="outline" className="w-full">
                      Configure Storage
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Database className="h-5 w-5 mr-2 text-green-600" />
                      Database
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Status</span>
                      <Badge variant="default">Healthy</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Performance</span>
                      <span className="font-medium">98.2%</span>
                    </div>
                    <Button variant="outline" className="w-full">
                      Database Metrics
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
