"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Download,
  FileText,
  Mail,
  MessageSquare,
  Calendar,
  Send,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Trash2,
  RefreshCw,
  FileCheck,
  Database,
  Users,
  BarChart3,
  Shield,
  Activity,
  Bell,
  BellRing,
  BellOff,
  Globe,
  Smartphone,
  Laptop,
  Server,
  CloudDownload,
  Share2,
  Copy,
  ExternalLink,
  Zap,
  TrendingUp,
  Info,
  X,
  Check,
  Plus,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// ====================================================================
// TYPES & INTERFACES
// ====================================================================

interface ExportOperation {
  id: string;
  name: string;
  type:
    | "dashboard_analytics"
    | "system_health"
    | "revenue_reports"
    | "customer_intelligence"
    | "workflow_performance"
    | "security_audit"
    | "compliance_reports"
    | "full_dashboard";
  format: "csv" | "pdf" | "excel" | "json";
  status:
    | "pending"
    | "generating"
    | "ready"
    | "downloaded"
    | "expired"
    | "failed";
  fileSize?: string;
  generatedAt?: string;
  expiresAt?: string;
  downloadUrl?: string;
  progress: number;
  dataPoints: number;
  estimatedTime: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category:
    | "operational"
    | "business"
    | "security"
    | "compliance"
    | "technical";
  modules: string[];
  schedule?: {
    frequency: "daily" | "weekly" | "monthly" | "quarterly";
    time: string;
    enabled: boolean;
  };
  format: "pdf" | "excel" | "csv";
  recipients: string[];
  lastGenerated?: string;
  nextGeneration?: string;
}

interface NotificationChannel {
  id: string;
  type: "email" | "telegram" | "slack" | "webhook" | "sms";
  name: string;
  enabled: boolean;
  configuration: Record<string, any>;
  severityFilter: ("critical" | "high" | "medium" | "low")[];
  modules: string[];
  rateLimit: {
    maxPerHour: number;
    maxPerDay: number;
  };
  lastSent?: string;
  sentToday: number;
  sentThisHour: number;
}

interface NotificationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    event: string;
    conditions: Record<string, any>;
  };
  channels: string[];
  template: string;
  enabled: boolean;
  priority: "immediate" | "high" | "normal" | "low";
  cooldown: number; // minutes
  lastTriggered?: string;
}

interface AlertNotification {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "high" | "medium" | "low";
  category: "system" | "security" | "business" | "performance";
  timestamp: string;
  channels: string[];
  status: "pending" | "sent" | "failed" | "delivered";
  recipients: number;
  deliveryDetails: Record<string, any>;
  retryCount: number;
}

// ====================================================================
// MAIN COMPONENT
// ====================================================================

export default function AdminDashboardExportReportingSystem() {
  const [activeTab, setActiveTab] = useState("exports");
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected"
  >("connected");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // State for exports
  const [exports, setExports] = useState<ExportOperation[]>([
    {
      id: "export_001",
      name: "Daily Dashboard Analytics",
      type: "dashboard_analytics",
      format: "pdf",
      status: "ready",
      fileSize: "2.4 MB",
      generatedAt: "2025-06-25T14:30:00Z",
      expiresAt: "2025-06-26T14:30:00Z",
      downloadUrl: "/api/exports/export_001.pdf",
      progress: 100,
      dataPoints: 15420,
      estimatedTime: "Completed",
    },
    {
      id: "export_002",
      name: "Weekly System Health Report",
      type: "system_health",
      format: "excel",
      status: "generating",
      progress: 73,
      dataPoints: 8900,
      estimatedTime: "2 minutes remaining",
    },
    {
      id: "export_003",
      name: "Revenue & Business Analytics",
      type: "revenue_reports",
      format: "csv",
      status: "ready",
      fileSize: "1.8 MB",
      generatedAt: "2025-06-25T12:15:00Z",
      expiresAt: "2025-06-26T12:15:00Z",
      downloadUrl: "/api/exports/export_003.csv",
      progress: 100,
      dataPoints: 12340,
      estimatedTime: "Completed",
    },
    {
      id: "export_004",
      name: "Security Compliance Audit",
      type: "security_audit",
      format: "pdf",
      status: "pending",
      progress: 0,
      dataPoints: 5670,
      estimatedTime: "5 minutes",
    },
  ]);

  // State for reports
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([
    {
      id: "template_001",
      name: "Executive Summary Report",
      description:
        "High-level overview of all business metrics and system health",
      category: "business",
      modules: ["revenue", "system_health", "customer_intelligence"],
      schedule: {
        frequency: "weekly",
        time: "09:00",
        enabled: true,
      },
      format: "pdf",
      recipients: ["executive@company.com", "management@company.com"],
      lastGenerated: "2025-06-23T09:00:00Z",
      nextGeneration: "2025-06-30T09:00:00Z",
    },
    {
      id: "template_002",
      name: "Daily Operations Report",
      description:
        "Operational metrics including workflow performance and system status",
      category: "operational",
      modules: ["workflow_performance", "system_health", "security"],
      schedule: {
        frequency: "daily",
        time: "08:00",
        enabled: true,
      },
      format: "excel",
      recipients: ["operations@company.com"],
      lastGenerated: "2025-06-25T08:00:00Z",
      nextGeneration: "2025-06-26T08:00:00Z",
    },
    {
      id: "template_003",
      name: "Security & Compliance Monthly",
      description: "Comprehensive security and compliance analysis",
      category: "security",
      modules: ["security", "compliance", "audit_logs"],
      schedule: {
        frequency: "monthly",
        time: "10:00",
        enabled: true,
      },
      format: "pdf",
      recipients: ["security@company.com", "compliance@company.com"],
      lastGenerated: "2025-06-01T10:00:00Z",
      nextGeneration: "2025-07-01T10:00:00Z",
    },
  ]);

  // State for notifications
  const [notificationChannels, setNotificationChannels] = useState<
    NotificationChannel[]
  >([
    {
      id: "channel_001",
      type: "email",
      name: "Critical Alerts Email",
      enabled: true,
      configuration: {
        recipients: ["admin@company.com", "ops@company.com"],
        subject_prefix: "[CRITICAL]",
      },
      severityFilter: ["critical", "high"],
      modules: ["system_health", "security", "revenue"],
      rateLimit: {
        maxPerHour: 10,
        maxPerDay: 50,
      },
      lastSent: "2025-06-25T14:20:00Z",
      sentToday: 3,
      sentThisHour: 1,
    },
    {
      id: "channel_002",
      type: "telegram",
      name: "Operations Telegram Channel",
      enabled: true,
      configuration: {
        chat_id: "-1001234567890",
        bot_token: "configured",
      },
      severityFilter: ["critical", "high", "medium"],
      modules: ["system_health", "workflow_performance", "security"],
      rateLimit: {
        maxPerHour: 20,
        maxPerDay: 100,
      },
      lastSent: "2025-06-25T15:45:00Z",
      sentToday: 12,
      sentThisHour: 4,
    },
    {
      id: "channel_003",
      type: "slack",
      name: "Development Team Slack",
      enabled: false,
      configuration: {
        webhook_url: "https://hooks.slack.com/...",
        channel: "#alerts",
      },
      severityFilter: ["medium", "low"],
      modules: ["workflow_performance", "system_health"],
      rateLimit: {
        maxPerHour: 15,
        maxPerDay: 60,
      },
      sentToday: 0,
      sentThisHour: 0,
    },
  ]);

  // State for recent notifications
  const [recentNotifications, setRecentNotifications] = useState<
    AlertNotification[]
  >([
    {
      id: "notif_001",
      title: "High Memory Usage Detected",
      message: "System memory usage has exceeded 85% threshold",
      severity: "high",
      category: "system",
      timestamp: "2025-06-25T15:45:00Z",
      channels: ["email", "telegram"],
      status: "delivered",
      recipients: 3,
      deliveryDetails: {
        email: "success",
        telegram: "success",
      },
      retryCount: 0,
    },
    {
      id: "notif_002",
      title: "Revenue Target Achievement",
      message: "Monthly revenue target of €50,000 has been reached",
      severity: "medium",
      category: "business",
      timestamp: "2025-06-25T14:20:00Z",
      channels: ["email"],
      status: "delivered",
      recipients: 2,
      deliveryDetails: {
        email: "success",
      },
      retryCount: 0,
    },
    {
      id: "notif_003",
      title: "Failed Login Attempts",
      message: "Multiple failed login attempts detected from IP 192.168.1.100",
      severity: "critical",
      category: "security",
      timestamp: "2025-06-25T13:10:00Z",
      channels: ["email", "telegram", "slack"],
      status: "failed",
      recipients: 5,
      deliveryDetails: {
        email: "success",
        telegram: "success",
        slack: "failed",
      },
      retryCount: 2,
    },
  ]);

  // Filtered data
  const filteredExports = useMemo(() => {
    return exports.filter(exp => {
      const matchesSearch =
        exp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === "all" || exp.status === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [exports, searchTerm, filterType]);

  // ====================================================================
  // EVENT HANDLERS
  // ====================================================================

  const handleExportGeneration = async (
    type: ExportOperation["type"],
    format: ExportOperation["format"]
  ) => {
    setLoading(true);

    const newExport: ExportOperation = {
      id: `export_${Date.now()}`,
      name: `${type.replace("_", " ").toUpperCase()} Export`,
      type,
      format,
      status: "generating",
      progress: 0,
      dataPoints: Math.floor(Math.random() * 20000) + 5000,
      estimatedTime: "Calculating...",
    };

    setExports(prev => [newExport, ...prev]);

    // Simulate export generation
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        setExports(prev =>
          prev.map(exp =>
            exp.id === newExport.id
              ? {
                  ...exp,
                  status: "ready",
                  progress: 100,
                  fileSize: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
                  generatedAt: new Date().toISOString(),
                  expiresAt: new Date(
                    Date.now() + 24 * 60 * 60 * 1000
                  ).toISOString(),
                  downloadUrl: `/api/exports/${newExport.id}.${format}`,
                  estimatedTime: "Completed",
                }
              : exp
          )
        );
        setLoading(false);
      } else {
        setExports(prev =>
          prev.map(exp =>
            exp.id === newExport.id
              ? {
                  ...exp,
                  progress,
                  estimatedTime: `${Math.ceil((100 - progress) / 10)} minutes remaining`,
                }
              : exp
          )
        );
      }
    }, 500);
  };

  const handleDownload = async (exportOp: ExportOperation) => {
    if (exportOp.downloadUrl) {
      // Simulate download
      console.log(`Downloading: ${exportOp.downloadUrl}`);

      // Update status to downloaded
      setExports(prev =>
        prev.map(exp =>
          exp.id === exportOp.id ? { ...exp, status: "downloaded" } : exp
        )
      );
    }
  };

  const handleChannelToggle = (channelId: string, enabled: boolean) => {
    setNotificationChannels(prev =>
      prev.map(channel =>
        channel.id === channelId ? { ...channel, enabled } : channel
      )
    );
  };

  const handleTestNotification = async (channelId: string) => {
    const channel = notificationChannels.find(c => c.id === channelId);
    if (!channel) return;

    const testNotification: AlertNotification = {
      id: `test_${Date.now()}`,
      title: "Test Notification",
      message: `Test message for ${channel.name}`,
      severity: "low",
      category: "system",
      timestamp: new Date().toISOString(),
      channels: [channel.type],
      status: "pending",
      recipients: 1,
      deliveryDetails: {},
      retryCount: 0,
    };

    setRecentNotifications(prev => [testNotification, ...prev]);

    // Simulate delivery
    setTimeout(() => {
      setRecentNotifications(prev =>
        prev.map(notif =>
          notif.id === testNotification.id
            ? {
                ...notif,
                status: "delivered",
                deliveryDetails: { [channel.type]: "success" },
              }
            : notif
        )
      );
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
      case "delivered":
      case "compliant":
        return "text-green-400";
      case "generating":
      case "pending":
      case "sent":
        return "text-blue-400";
      case "failed":
      case "expired":
      case "non-compliant":
        return "text-red-400";
      case "downloaded":
        return "text-purple-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "generating":
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "failed":
      case "expired":
        return <AlertTriangle className="h-4 w-4" />;
      case "downloaded":
        return <Download className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-400 border-red-500";
      case "high":
        return "text-orange-400 border-orange-500";
      case "medium":
        return "text-yellow-400 border-yellow-500";
      case "low":
        return "text-blue-400 border-blue-500";
      default:
        return "text-gray-400 border-gray-500";
    }
  };

  // ====================================================================
  // RENDER METHODS
  // ====================================================================

  const renderExportsTab = () => (
    <div className="space-y-6">
      {/* Export Controls */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudDownload className="h-5 w-5 text-blue-400" />
            Quick Export Actions
          </CardTitle>
          <CardDescription>
            Generate and download exports for different dashboard modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                type: "dashboard_analytics",
                label: "Dashboard Analytics",
                icon: BarChart3,
                color: "blue",
              },
              {
                type: "system_health",
                label: "System Health",
                icon: Activity,
                color: "green",
              },
              {
                type: "revenue_reports",
                label: "Revenue Reports",
                icon: TrendingUp,
                color: "purple",
              },
              {
                type: "security_audit",
                label: "Security Audit",
                icon: Shield,
                color: "red",
              },
            ].map(({ type, label, icon: Icon, color }) => (
              <Card
                key={type}
                className="bg-gray-900/50 border-gray-600 hover:border-gray-500 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-${color}-500/20`}>
                      <Icon className={`h-5 w-5 text-${color}-400`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{label}</h4>
                      <p className="text-xs text-gray-400">
                        Export module data
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {["csv", "pdf", "excel"].map(format => (
                      <Button
                        key={format}
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() =>
                          handleExportGeneration(type as any, format as any)
                        }
                        disabled={loading}
                      >
                        {format.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search exports..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800/50 border-gray-700"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px] bg-gray-800/50 border-gray-700">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="generating">Generating</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Exports List */}
      <div className="space-y-4">
        {filteredExports.map(exportOp => (
          <Card key={exportOp.id} className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${getStatusColor(exportOp.status)} bg-current/20`}
                  >
                    {getStatusIcon(exportOp.status)}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{exportOp.name}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {exportOp.type.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {exportOp.format.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {exportOp.dataPoints.toLocaleString()} data points
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {exportOp.status === "generating" && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">
                        {exportOp.progress}%
                      </div>
                      <Progress
                        value={exportOp.progress}
                        className="w-24 h-2"
                      />
                      <div className="text-xs text-gray-400 mt-1">
                        {exportOp.estimatedTime}
                      </div>
                    </div>
                  )}

                  {exportOp.status === "ready" && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">
                        {exportOp.fileSize}
                      </div>
                      <div className="text-xs text-gray-400">
                        Generated{" "}
                        {new Date(exportOp.generatedAt!).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {exportOp.status === "ready" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleDownload(exportOp)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-6">
      {/* Report Templates */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-400" />
            Scheduled Report Templates
          </CardTitle>
          <CardDescription>
            Automated report generation and distribution templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportTemplates.map(template => (
              <Card
                key={template.id}
                className="bg-gray-900/50 border-gray-600"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <FileText className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">
                          {template.name}
                        </h4>
                        <p className="text-sm text-gray-400 mb-2">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {template.format.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {template.schedule?.frequency}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {template.recipients.length} recipients
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-white">
                          Next:{" "}
                          {template.nextGeneration
                            ? new Date(
                                template.nextGeneration
                              ).toLocaleDateString()
                            : "Not scheduled"}
                        </div>
                        <div className="text-xs text-gray-400">
                          Last:{" "}
                          {template.lastGenerated
                            ? new Date(
                                template.lastGenerated
                              ).toLocaleDateString()
                            : "Never"}
                        </div>
                      </div>

                      <Switch
                        checked={template.schedule?.enabled || false}
                        onCheckedChange={enabled => {
                          setReportTemplates(prev =>
                            prev.map(t =>
                              t.id === template.id
                                ? {
                                    ...t,
                                    schedule: { ...t.schedule!, enabled },
                                  }
                                : t
                            )
                          );
                        }}
                      />

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Report Generation */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Quick Report Generation
          </CardTitle>
          <CardDescription>
            Generate ad-hoc reports for immediate use
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                label: "Executive Summary",
                modules: "All modules",
                icon: TrendingUp,
              },
              {
                label: "Technical Report",
                modules: "System + Security",
                icon: Server,
              },
              {
                label: "Business Intelligence",
                modules: "Revenue + Customer",
                icon: BarChart3,
              },
              {
                label: "Compliance Report",
                modules: "Security + Audit",
                icon: Shield,
              },
              {
                label: "Operations Report",
                modules: "Workflow + Health",
                icon: Activity,
              },
              {
                label: "Custom Report",
                modules: "Select modules",
                icon: Settings,
              },
            ].map(({ label, modules, icon: Icon }) => (
              <Card
                key={label}
                className="bg-gray-900/50 border-gray-600 hover:border-gray-500 transition-colors cursor-pointer"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-yellow-500/20">
                      <Icon className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{label}</h4>
                      <p className="text-xs text-gray-400">{modules}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      {/* Notification Channels */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-green-400" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Configure notification channels for alerts and reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificationChannels.map(channel => (
              <Card key={channel.id} className="bg-gray-900/50 border-gray-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-green-500/20">
                        {channel.type === "email" && (
                          <Mail className="h-5 w-5 text-green-400" />
                        )}
                        {channel.type === "telegram" && (
                          <MessageSquare className="h-5 w-5 text-green-400" />
                        )}
                        {channel.type === "slack" && (
                          <MessageSquare className="h-5 w-5 text-green-400" />
                        )}
                        {channel.type === "webhook" && (
                          <Globe className="h-5 w-5 text-green-400" />
                        )}
                        {channel.type === "sms" && (
                          <Smartphone className="h-5 w-5 text-green-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">
                          {channel.name}
                        </h4>
                        <div className="flex items-center gap-4 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {channel.type.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {channel.severityFilter.join(", ")}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {channel.sentToday}/{channel.rateLimit.maxPerDay}{" "}
                            today
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-white">
                          Rate Limit: {channel.rateLimit.maxPerHour}/hour
                        </div>
                        <div className="text-xs text-gray-400">
                          Last sent:{" "}
                          {channel.lastSent
                            ? new Date(channel.lastSent).toLocaleTimeString()
                            : "Never"}
                        </div>
                      </div>

                      <Switch
                        checked={channel.enabled}
                        onCheckedChange={enabled =>
                          handleChannelToggle(channel.id, enabled)
                        }
                      />

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestNotification(channel.id)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-orange-400" />
            Recent Notifications
          </CardTitle>
          <CardDescription>
            Latest alert notifications and delivery status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentNotifications.map(notification => (
              <Card
                key={notification.id}
                className={`bg-gray-900/50 border-l-4 ${getSeverityColor(notification.severity)}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-lg bg-current/20 ${getSeverityColor(notification.severity)}`}
                      >
                        {notification.severity === "critical" && (
                          <AlertTriangle className="h-5 w-5" />
                        )}
                        {notification.severity === "high" && (
                          <AlertCircle className="h-5 w-5" />
                        )}
                        {notification.severity === "medium" && (
                          <Info className="h-5 w-5" />
                        )}
                        {notification.severity === "low" && (
                          <CheckCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-400 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="text-xs">
                            {notification.severity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {notification.category}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {notification.recipients} recipients
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div
                          className={`text-sm font-medium ${getStatusColor(notification.status)}`}
                        >
                          {notification.status.toUpperCase()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {notification.channels.join(", ")}
                        </div>
                        {notification.retryCount > 0 && (
                          <div className="text-xs text-orange-400">
                            {notification.retryCount} retries
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {Object.entries(notification.deliveryDetails).map(
                          ([channel, status]) => (
                            <Badge
                              key={channel}
                              variant="outline"
                              className={`text-xs ${status === "success" ? "text-green-400" : "text-red-400"}`}
                            >
                              {channel}: {status}
                            </Badge>
                          )
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {notification.status === "failed" && (
                          <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ====================================================================
  // MAIN RENDER
  // ====================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
              Export, Reporting & Notifications
            </h1>
            <p className="text-xl text-gray-300 mt-2">
              Integrated data export, automated reporting, and notification
              management system
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                connectionStatus === "connected"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-400"
                    : "bg-red-400"
                }`}
              />
              {connectionStatus === "connected"
                ? "System Connected"
                : "System Disconnected"}
            </div>

            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-400" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-300">
                  📊 Export Features:
                </h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Multi-format exports (CSV, PDF, Excel, JSON)</li>
                  <li>• Real-time progress tracking</li>
                  <li>• Automatic file expiration</li>
                  <li>• Bulk data export capabilities</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-purple-300">
                  📝 Reporting System:
                </h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Automated scheduled reports</li>
                  <li>• Customizable templates</li>
                  <li>• Multi-recipient distribution</li>
                  <li>• Executive and operational reports</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-green-300">
                  🔔 Notifications:
                </h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Multi-channel alerts (Email, Telegram, Slack)</li>
                  <li>• Severity-based routing</li>
                  <li>• Rate limiting and throttling</li>
                  <li>• Delivery confirmation tracking</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-orange-300">
                  ⚡ Integration:
                </h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Real-time dashboard data</li>
                  <li>• Admin RBAC integration</li>
                  <li>• Automated backup systems</li>
                  <li>• Enterprise audit compliance</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full lg:w-[600px] grid-cols-3 bg-gray-800/50">
            <TabsTrigger value="exports" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Data Exports
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Scheduled Reports
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="exports" className="space-y-6">
            {renderExportsTab()}
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            {renderReportsTab()}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            {renderNotificationsTab()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
