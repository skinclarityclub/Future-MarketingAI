"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  Shield,
  Settings,
  Download,
  Flag,
  Wrench,
  Database,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Trash2,
  RefreshCw,
  Activity,
  Pause,
  Play,
  RotateCcw,
  Eye,
  EyeOff,
  AlertOctagon,
  Globe,
  Mail,
  MessageSquare,
  FileText,
  Save,
  X,
  Check,
  Info,
  Loader2,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Plus,
  Minus,
  Lock,
  UserCheck,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  FileCheck,
  AlertCircle,
  Monitor,
  Smartphone,
  Laptop,
  Zap,
  Upload,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface KillSwitch {
  id: string;
  name: string;
  description: string;
  category: "critical" | "warning" | "info";
  status: "active" | "inactive" | "triggered";
  lastTriggered?: string;
  triggeredBy?: string;
  systems: string[];
  confirmationRequired: boolean;
}

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  environment: "production" | "staging" | "development";
  category: "ui" | "api" | "workflow" | "analytics";
  lastModified: string;
  modifiedBy: string;
  conditions?: Record<string, any>;
}

interface MaintenanceMode {
  id: string;
  name: string;
  type: "system" | "module" | "service";
  status: "scheduled" | "active" | "completed";
  startTime?: string;
  endTime?: string;
  estimatedDuration: number;
  affectedSystems: string[];
  message: string;
  allowedUsers: string[];
}

interface BulkOperation {
  id: string;
  name: string;
  type: "user_management" | "data_cleanup" | "configuration" | "deployment";
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  startTime?: string;
  estimatedCompletion?: string;
  initiatedBy: string;
}

interface ExportOperation {
  id: string;
  name: string;
  type:
    | "dashboard_data"
    | "analytics"
    | "user_data"
    | "system_logs"
    | "audit_trail";
  format: "csv" | "pdf" | "excel" | "json";
  status: "pending" | "generating" | "ready" | "downloaded" | "expired";
  fileSize?: string;
  generatedAt?: string;
  expiresAt?: string;
  downloadUrl?: string;
}

interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "investigating" | "resolved" | "closed";
  type:
    | "authentication"
    | "data_breach"
    | "malware"
    | "phishing"
    | "unauthorized_access"
    | "ddos";
  detectedAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  affectedSystems: string[];
  evidence: string[];
  response: string;
}

interface LoginActivity {
  id: string;
  userId: string;
  userEmail: string;
  loginTime: string;
  ipAddress: string;
  userAgent: string;
  location: {
    country: string;
    city: string;
  };
  status: "success" | "failed" | "blocked";
  failureReason?: string;
  mfaUsed: boolean;
  deviceTrusted: boolean;
  riskScore: number;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  severity: "info" | "warning" | "error" | "critical";
  ipAddress: string;
  userAgent: string;
  status: "success" | "failure";
  complianceTags: string[];
}

interface ComplianceMetric {
  id: string;
  framework: "SOC2" | "GDPR" | "ISO27001" | "CCPA" | "PCI-DSS";
  score: number;
  status: "compliant" | "partial" | "non-compliant" | "pending";
  lastAudit: string;
  nextAudit: string;
  openIssues: number;
  criticalIssues: number;
}

interface SecurityAlert {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "high" | "medium" | "low";
  category:
    | "authentication"
    | "authorization"
    | "data_access"
    | "system"
    | "compliance";
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  source: string;
  metadata: Record<string, any>;
}

export function OperationalControlsInterface() {
  const [selectedTab, setSelectedTab] = useState("kill-switches");
  const [isConnected, setIsConnected] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Kill Switches State
  const [killSwitches, setKillSwitches] = useState<KillSwitch[]>([
    {
      id: "emergency_stop_all",
      name: "Emergency Stop All",
      description:
        "Immediately halt all active workflows and publishing operations",
      category: "critical",
      status: "active",
      systems: ["workflows", "publishing", "apis", "automation"],
      confirmationRequired: true,
    },
    {
      id: "stop_publishing",
      name: "Stop Publishing",
      description: "Halt all content publishing across platforms",
      category: "warning",
      status: "active",
      systems: ["publishing", "social_media", "content_distribution"],
      confirmationRequired: true,
    },
    {
      id: "disable_ai_processing",
      name: "Disable AI Processing",
      description: "Stop all AI-powered content generation and optimization",
      category: "warning",
      status: "active",
      systems: ["ai_engine", "content_optimization", "recommendations"],
      confirmationRequired: false,
    },
    {
      id: "maintenance_mode",
      name: "Maintenance Mode",
      description: "Put system in maintenance mode with limited functionality",
      category: "info",
      status: "inactive",
      systems: ["frontend", "api", "user_access"],
      confirmationRequired: true,
    },
  ]);

  // Feature Flags State
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([
    {
      id: "new_dashboard_ui",
      name: "New Dashboard UI",
      description: "Enable the redesigned dashboard interface",
      enabled: true,
      rolloutPercentage: 75,
      environment: "production",
      category: "ui",
      lastModified: "2025-01-25T10:30:00Z",
      modifiedBy: "admin@skc.com",
    },
    {
      id: "advanced_analytics",
      name: "Advanced Analytics",
      description: "Enable advanced analytics and reporting features",
      enabled: false,
      rolloutPercentage: 0,
      environment: "staging",
      category: "analytics",
      lastModified: "2025-01-24T15:45:00Z",
      modifiedBy: "tech@skc.com",
    },
    {
      id: "ai_content_optimization",
      name: "AI Content Optimization",
      description: "Enable AI-powered content optimization engine",
      enabled: true,
      rolloutPercentage: 100,
      environment: "production",
      category: "workflow",
      lastModified: "2025-01-25T09:15:00Z",
      modifiedBy: "admin@skc.com",
    },
    {
      id: "api_rate_limiting_v2",
      name: "API Rate Limiting v2",
      description:
        "Enable enhanced API rate limiting with intelligent throttling",
      enabled: false,
      rolloutPercentage: 25,
      environment: "staging",
      category: "api",
      lastModified: "2025-01-23T14:20:00Z",
      modifiedBy: "tech@skc.com",
    },
  ]);

  // Maintenance Modes State
  const [maintenanceModes, setMaintenanceModes] = useState<MaintenanceMode[]>([
    {
      id: "scheduled_maintenance_feb",
      name: "February System Update",
      type: "system",
      status: "scheduled",
      startTime: "2025-02-15T02:00:00Z",
      endTime: "2025-02-15T06:00:00Z",
      estimatedDuration: 240,
      affectedSystems: ["database", "api", "workflows", "analytics"],
      message:
        "Scheduled maintenance for system updates and performance improvements",
      allowedUsers: ["admin@skc.com", "tech@skc.com"],
    },
    {
      id: "analytics_maintenance",
      name: "Analytics Engine Maintenance",
      type: "module",
      status: "completed",
      startTime: "2025-01-20T01:00:00Z",
      endTime: "2025-01-20T03:30:00Z",
      estimatedDuration: 150,
      affectedSystems: ["analytics", "reporting", "dashboard"],
      message: "Analytics engine optimization and data migration",
      allowedUsers: ["admin@skc.com"],
    },
  ]);

  // Bulk Operations State
  const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([
    {
      id: "user_data_cleanup",
      name: "User Data Cleanup",
      type: "data_cleanup",
      status: "running",
      progress: 65,
      totalItems: 10000,
      processedItems: 6500,
      failedItems: 23,
      startTime: "2025-01-25T08:00:00Z",
      estimatedCompletion: "2025-01-25T12:30:00Z",
      initiatedBy: "admin@skc.com",
    },
    {
      id: "config_deployment",
      name: "Configuration Deployment",
      type: "deployment",
      status: "completed",
      progress: 100,
      totalItems: 156,
      processedItems: 156,
      failedItems: 0,
      startTime: "2025-01-24T16:00:00Z",
      estimatedCompletion: "2025-01-24T16:45:00Z",
      initiatedBy: "tech@skc.com",
    },
  ]);

  // Export Operations State
  const [exportOperations, setExportOperations] = useState<ExportOperation[]>([
    {
      id: "dashboard_analytics_export",
      name: "Dashboard Analytics Export",
      type: "analytics",
      format: "excel",
      status: "ready",
      fileSize: "2.4 MB",
      generatedAt: "2025-01-25T09:30:00Z",
      expiresAt: "2025-01-27T09:30:00Z",
      downloadUrl: "/api/exports/dashboard_analytics_export.xlsx",
    },
    {
      id: "user_activity_logs",
      name: "User Activity Logs",
      type: "audit_trail",
      format: "csv",
      status: "generating",
      generatedAt: "2025-01-25T10:15:00Z",
      expiresAt: "2025-01-27T10:15:00Z",
    },
  ]);

  // Security & Compliance State
  const [securityIncidents, setSecurityIncidents] = useState<
    SecurityIncident[]
  >([
    {
      id: "incident_001",
      title: "Multiple Failed Login Attempts",
      description:
        "Detected 15 failed login attempts from suspicious IP address",
      severity: "high",
      status: "investigating",
      type: "authentication",
      detectedAt: "2025-01-25T08:45:00Z",
      affectedSystems: ["authentication", "user_management"],
      evidence: ["auth_logs", "ip_analysis"],
      response: "Blocked IP address and initiated investigation",
    },
    {
      id: "incident_002",
      title: "GDPR Data Request Overdue",
      description: "Data subject request for personal data export is overdue",
      severity: "medium",
      status: "open",
      type: "unauthorized_access",
      detectedAt: "2025-01-24T14:30:00Z",
      affectedSystems: ["data_management", "compliance"],
      evidence: ["compliance_reports"],
      response: "Assigned to compliance team for immediate action",
    },
  ]);

  const [loginActivities, setLoginActivities] = useState<LoginActivity[]>([
    {
      id: "login_001",
      userId: "user_123",
      userEmail: "john.doe@company.com",
      loginTime: "2025-01-25T09:15:00Z",
      ipAddress: "192.168.1.45",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      location: { country: "Netherlands", city: "Amsterdam" },
      status: "success",
      mfaUsed: true,
      deviceTrusted: true,
      riskScore: 2,
    },
    {
      id: "login_002",
      userId: "user_456",
      userEmail: "jane.smith@company.com",
      loginTime: "2025-01-25T08:30:00Z",
      ipAddress: "203.0.113.12",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
      location: { country: "United States", city: "New York" },
      status: "failed",
      failureReason: "Invalid password",
      mfaUsed: false,
      deviceTrusted: false,
      riskScore: 7,
    },
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: "audit_001",
      timestamp: "2025-01-25T10:30:00Z",
      userId: "admin_001",
      userEmail: "admin@company.com",
      action: "user_data_export",
      resource: "customer_database",
      details: { recordCount: 1500, format: "csv" },
      severity: "warning",
      ipAddress: "10.0.0.15",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      status: "success",
      complianceTags: ["gdpr", "data_export"],
    },
  ]);

  const [complianceMetrics, setComplianceMetrics] = useState<
    ComplianceMetric[]
  >([
    {
      id: "soc2_compliance",
      framework: "SOC2",
      score: 98.5,
      status: "compliant",
      lastAudit: "2025-01-10T00:00:00Z",
      nextAudit: "2025-07-10T00:00:00Z",
      openIssues: 0,
      criticalIssues: 0,
    },
    {
      id: "gdpr_compliance",
      framework: "GDPR",
      score: 96.2,
      status: "compliant",
      lastAudit: "2025-01-08T00:00:00Z",
      nextAudit: "2025-04-08T00:00:00Z",
      openIssues: 1,
      criticalIssues: 0,
    },
  ]);

  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([
    {
      id: "alert_001",
      title: "Suspicious API Activity",
      message: "Unusual pattern of API requests detected from single source",
      severity: "medium",
      category: "system",
      timestamp: "2025-01-25T11:15:00Z",
      acknowledged: false,
      source: "api_monitoring",
      metadata: { requestCount: 150, sourceIP: "203.0.113.50" },
    },
  ]);

  const handleKillSwitchToggle = async (switchId: string) => {
    setLoading(true);
    try {
      setKillSwitches(prev =>
        prev.map(ks =>
          ks.id === switchId
            ? {
                ...ks,
                status: ks.status === "active" ? "triggered" : "active",
                lastTriggered:
                  ks.status === "active"
                    ? new Date().toISOString()
                    : ks.lastTriggered,
                triggeredBy:
                  ks.status === "active" ? "admin@skc.com" : ks.triggeredBy,
              }
            : ks
        )
      );

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error("Error toggling kill switch:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureFlagToggle = async (flagId: string, enabled: boolean) => {
    setFeatureFlags(prev =>
      prev.map(flag =>
        flag.id === flagId
          ? {
              ...flag,
              enabled,
              lastModified: new Date().toISOString(),
              modifiedBy: "admin@skc.com",
            }
          : flag
      )
    );
  };

  const handleFeatureFlagRollout = async (
    flagId: string,
    percentage: number
  ) => {
    setFeatureFlags(prev =>
      prev.map(flag =>
        flag.id === flagId
          ? {
              ...flag,
              rolloutPercentage: percentage,
              lastModified: new Date().toISOString(),
              modifiedBy: "admin@skc.com",
            }
          : flag
      )
    );
  };

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    switch (selectedTab) {
      case "kill-switches":
        return killSwitches.filter(
          item =>
            item.name.toLowerCase().includes(term) &&
            (filterCategory === "all" || item.category === filterCategory)
        );
      case "feature-flags":
        return featureFlags.filter(
          item =>
            item.name.toLowerCase().includes(term) &&
            (filterCategory === "all" || item.category === filterCategory)
        );
      case "maintenance":
        return maintenanceModes.filter(
          item =>
            item.name.toLowerCase().includes(term) &&
            (filterCategory === "all" || item.type === filterCategory)
        );
      case "bulk-operations":
        return bulkOperations.filter(
          item =>
            item.name.toLowerCase().includes(term) &&
            (filterCategory === "all" || item.type === filterCategory)
        );
      case "export":
        return exportOperations.filter(
          item =>
            item.name.toLowerCase().includes(term) &&
            (filterCategory === "all" || item.type === filterCategory)
        );
      case "security-compliance":
        return securityIncidents.filter(
          item =>
            item.title.toLowerCase().includes(term) &&
            (filterCategory === "all" || item.severity === filterCategory)
        );
      default:
        return [];
    }
  }, [
    selectedTab,
    searchTerm,
    filterCategory,
    killSwitches,
    featureFlags,
    maintenanceModes,
    bulkOperations,
    exportOperations,
    securityIncidents,
  ]);

  return (
    <div className="dark space-y-6 p-6 bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <Settings className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Operational Controls</h1>
            <p className="text-gray-400">
              Manage system operations, features, and maintenance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant={isConnected ? "default" : "destructive"}
            className="px-3 py-1"
          >
            <Activity className="w-3 h-3 mr-1" />
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className="bg-gray-800 border-gray-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 bg-gray-800/50 p-4 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search controls..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-700 border-gray-600 text-gray-100"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-32 bg-gray-700 border-gray-600">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Controls Interface */}
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-6 bg-gray-800">
          <TabsTrigger
            value="kill-switches"
            className="flex items-center gap-2"
          >
            <AlertOctagon className="w-4 h-4" />
            Kill Switches
          </TabsTrigger>
          <TabsTrigger
            value="feature-flags"
            className="flex items-center gap-2"
          >
            <Flag className="w-4 h-4" />
            Feature Flags
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger
            value="bulk-operations"
            className="flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            Bulk Ops
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export/Backup
          </TabsTrigger>
          <TabsTrigger
            value="security-compliance"
            className="flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Security & Compliance
          </TabsTrigger>
        </TabsList>

        {/* Kill Switches Tab */}
        <TabsContent value="kill-switches" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(filteredItems as KillSwitch[]).map(killSwitch => (
              <Card
                key={killSwitch.id}
                className="bg-gray-800/70 border-gray-700"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {killSwitch.category === "critical" && (
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      )}
                      {killSwitch.category === "warning" && (
                        <AlertOctagon className="w-5 h-5 text-yellow-400" />
                      )}
                      {killSwitch.category === "info" && (
                        <Info className="w-5 h-5 text-blue-400" />
                      )}
                      {killSwitch.name}
                    </CardTitle>
                    <Badge
                      variant={
                        killSwitch.status === "active"
                          ? "default"
                          : killSwitch.status === "triggered"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {killSwitch.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-400">
                    {killSwitch.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-400">
                      Affected Systems:
                    </Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {killSwitch.systems.map(system => (
                        <Badge
                          key={system}
                          variant="outline"
                          className="text-xs"
                        >
                          {system}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {killSwitch.lastTriggered && (
                    <div className="text-sm text-gray-400">
                      Last triggered:{" "}
                      {new Date(killSwitch.lastTriggered).toLocaleString()}
                      {killSwitch.triggeredBy &&
                        ` by ${killSwitch.triggeredBy}`}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    {killSwitch.confirmationRequired ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant={
                              killSwitch.status === "active"
                                ? "destructive"
                                : "default"
                            }
                            size="sm"
                            disabled={loading}
                          >
                            {loading && (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            {killSwitch.status === "active"
                              ? "Trigger"
                              : "Activate"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-800 border-gray-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to{" "}
                              {killSwitch.status === "active"
                                ? "trigger"
                                : "activate"}{" "}
                              "{killSwitch.name}"? This action will affect the
                              following systems: {killSwitch.systems.join(", ")}
                              .
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleKillSwitchToggle(killSwitch.id)
                              }
                              className={
                                killSwitch.status === "active"
                                  ? "bg-red-600 hover:bg-red-700"
                                  : ""
                              }
                            >
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <Button
                        variant={
                          killSwitch.status === "active"
                            ? "destructive"
                            : "default"
                        }
                        size="sm"
                        onClick={() => handleKillSwitchToggle(killSwitch.id)}
                        disabled={loading}
                      >
                        {loading && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        {killSwitch.status === "active"
                          ? "Trigger"
                          : "Activate"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Feature Flags Tab */}
        <TabsContent value="feature-flags" className="space-y-4">
          <div className="space-y-4">
            {(filteredItems as FeatureFlag[]).map(flag => (
              <Card key={flag.id} className="bg-gray-800/70 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{flag.name}</h3>
                        <Badge variant={flag.enabled ? "default" : "secondary"}>
                          {flag.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {flag.environment}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {flag.category}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">
                        {flag.description}
                      </p>
                      <div className="text-xs text-gray-500">
                        Last modified:{" "}
                        {new Date(flag.lastModified).toLocaleString()} by{" "}
                        {flag.modifiedBy}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          Rollout: {flag.rolloutPercentage}%
                        </div>
                        <Progress
                          value={flag.rolloutPercentage}
                          className="w-24 mt-1"
                        />
                      </div>
                      <Switch
                        checked={flag.enabled}
                        onCheckedChange={checked =>
                          handleFeatureFlagToggle(flag.id, checked)
                        }
                      />
                    </div>
                  </div>

                  {flag.enabled && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <Label className="text-sm">Rollout Percentage</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={flag.rolloutPercentage}
                          onChange={e =>
                            handleFeatureFlagRollout(
                              flag.id,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-20 bg-gray-700 border-gray-600"
                        />
                        <span className="text-sm text-gray-400">%</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <div className="space-y-4">
            {(filteredItems as MaintenanceMode[]).map(maintenance => (
              <Card
                key={maintenance.id}
                className="bg-gray-800/70 border-gray-700"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {maintenance.type === "system" && (
                        <Globe className="w-5 h-5 text-orange-400" />
                      )}
                      {maintenance.type === "module" && (
                        <Settings className="w-5 h-5 text-blue-400" />
                      )}
                      {maintenance.type === "service" && (
                        <Activity className="w-5 h-5 text-green-400" />
                      )}
                      {maintenance.name}
                    </CardTitle>
                    <Badge
                      variant={
                        maintenance.status === "active"
                          ? "destructive"
                          : maintenance.status === "scheduled"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {maintenance.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-400">{maintenance.message}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-gray-400">Type:</Label>
                      <div className="font-medium">{maintenance.type}</div>
                    </div>
                    <div>
                      <Label className="text-gray-400">Duration:</Label>
                      <div className="font-medium">
                        {maintenance.estimatedDuration} minutes
                      </div>
                    </div>
                    {maintenance.startTime && (
                      <div>
                        <Label className="text-gray-400">Start Time:</Label>
                        <div className="font-medium">
                          {new Date(maintenance.startTime).toLocaleString()}
                        </div>
                      </div>
                    )}
                    {maintenance.endTime && (
                      <div>
                        <Label className="text-gray-400">End Time:</Label>
                        <div className="font-medium">
                          {new Date(maintenance.endTime).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm text-gray-400">
                      Affected Systems:
                    </Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {maintenance.affectedSystems.map(system => (
                        <Badge
                          key={system}
                          variant="outline"
                          className="text-xs"
                        >
                          {system}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Allowed users: {maintenance.allowedUsers.join(", ")}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      {maintenance.status === "scheduled" && (
                        <Button variant="default" size="sm">
                          <Play className="w-4 h-4 mr-2" />
                          Start Now
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Bulk Operations Tab */}
        <TabsContent value="bulk-operations" className="space-y-4">
          <div className="space-y-4">
            {(filteredItems as BulkOperation[]).map(operation => (
              <Card
                key={operation.id}
                className="bg-gray-800/70 border-gray-700"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {operation.type === "user_management" && (
                        <Users className="w-5 h-5 text-blue-400" />
                      )}
                      {operation.type === "data_cleanup" && (
                        <Trash2 className="w-5 h-5 text-red-400" />
                      )}
                      {operation.type === "configuration" && (
                        <Settings className="w-5 h-5 text-purple-400" />
                      )}
                      {operation.type === "deployment" && (
                        <Upload className="w-5 h-5 text-green-400" />
                      )}
                      {operation.name}
                    </CardTitle>
                    <Badge
                      variant={
                        operation.status === "running"
                          ? "default"
                          : operation.status === "completed"
                            ? "secondary"
                            : operation.status === "failed"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {operation.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Label className="text-gray-400">Total Items:</Label>
                      <div className="font-medium">
                        {operation.totalItems.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-400">Processed:</Label>
                      <div className="font-medium text-green-400">
                        {operation.processedItems.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-400">Failed:</Label>
                      <div className="font-medium text-red-400">
                        {operation.failedItems.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-400">Progress:</Label>
                      <div className="font-medium">{operation.progress}%</div>
                    </div>
                  </div>

                  {operation.status === "running" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{operation.progress}%</span>
                      </div>
                      <Progress value={operation.progress} className="w-full" />
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <div>Initiated by: {operation.initiatedBy}</div>
                    <div>
                      {operation.startTime &&
                        `Started: ${new Date(operation.startTime).toLocaleString()}`}
                      {operation.estimatedCompletion &&
                        ` • ETA: ${new Date(operation.estimatedCompletion).toLocaleString()}`}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    {operation.status === "running" && (
                      <Button variant="outline" size="sm">
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </Button>
                    )}
                    {operation.status === "completed" && (
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                      </Button>
                    )}
                    {operation.status === "failed" && (
                      <Button variant="outline" size="sm">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Retry
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Export/Backup Tab */}
        <TabsContent value="export" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Operations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Operations
              </h3>
              {(filteredItems as ExportOperation[]).map(exportOp => (
                <Card
                  key={exportOp.id}
                  className="bg-gray-800/70 border-gray-700"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{exportOp.name}</h4>
                      <Badge
                        variant={
                          exportOp.status === "ready"
                            ? "default"
                            : exportOp.status === "generating"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {exportOp.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <Label className="text-gray-400">Type:</Label>
                        <div>{exportOp.type}</div>
                      </div>
                      <div>
                        <Label className="text-gray-400">Format:</Label>
                        <div className="uppercase">{exportOp.format}</div>
                      </div>
                      {exportOp.fileSize && (
                        <div>
                          <Label className="text-gray-400">Size:</Label>
                          <div>{exportOp.fileSize}</div>
                        </div>
                      )}
                      {exportOp.expiresAt && (
                        <div>
                          <Label className="text-gray-400">Expires:</Label>
                          <div>
                            {new Date(exportOp.expiresAt).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      {exportOp.status === "ready" ? (
                        <Button size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      ) : exportOp.status === "generating" ? (
                        <Button size="sm" disabled>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Export Tools */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Export Tools
              </h3>

              <Card className="bg-gray-800/70 border-gray-700">
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Export Dashboard Analytics
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Users className="w-4 h-4 mr-2" />
                      Export User Activity Report
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Activity className="w-4 h-4 mr-2" />
                      Export System Health Logs
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Shield className="w-4 h-4 mr-2" />
                      Export Audit Trail
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <h4 className="font-medium mb-3">Backup Options</h4>
                    <div className="space-y-2">
                      <Button
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <Database className="w-4 h-4 mr-2" />
                        Create Database Backup
                      </Button>
                      <Button
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Export Configuration
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Security & Compliance Tab */}
        <TabsContent value="security-compliance" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Security Overview Cards */}
            <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-800/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-400 text-sm font-medium">
                        Critical Incidents
                      </p>
                      <p className="text-2xl font-bold text-red-300">
                        {
                          securityIncidents.filter(
                            i => i.severity === "critical"
                          ).length
                        }
                      </p>
                    </div>
                    <div className="p-2 bg-red-600/20 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-yellow-800/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-400 text-sm font-medium">
                        Failed Logins (24h)
                      </p>
                      <p className="text-2xl font-bold text-yellow-300">
                        {
                          loginActivities.filter(l => l.status === "failed")
                            .length
                        }
                      </p>
                    </div>
                    <div className="p-2 bg-yellow-600/20 rounded-lg">
                      <Lock className="w-6 h-6 text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-800/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-400 text-sm font-medium">
                        Compliance Score
                      </p>
                      <p className="text-2xl font-bold text-green-300">
                        {Math.round(
                          complianceMetrics.reduce(
                            (acc, m) => acc + m.score,
                            0
                          ) / complianceMetrics.length
                        )}
                        %
                      </p>
                    </div>
                    <div className="p-2 bg-green-600/20 rounded-lg">
                      <Shield className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-800/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-400 text-sm font-medium">
                        Active Alerts
                      </p>
                      <p className="text-2xl font-bold text-blue-300">
                        {securityAlerts.filter(a => !a.acknowledged).length}
                      </p>
                    </div>
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Incidents */}
            <Card className="bg-gray-800/70 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Security Incidents
                </CardTitle>
                <CardDescription>
                  Recent security incidents requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {securityIncidents.map(incident => (
                  <div
                    key={incident.id}
                    className="p-4 bg-gray-900/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-100">
                        {incident.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            incident.severity === "critical"
                              ? "destructive"
                              : incident.severity === "high"
                                ? "default"
                                : incident.severity === "medium"
                                  ? "secondary"
                                  : "outline"
                          }
                        >
                          {incident.severity}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {incident.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      {incident.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                      <div>
                        <span className="text-gray-400">Detected:</span>{" "}
                        {new Date(incident.detectedAt).toLocaleString()}
                      </div>
                      <div>
                        <span className="text-gray-400">Type:</span>{" "}
                        {incident.type}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-sm text-gray-300">
                        {incident.response}
                      </p>
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Login Activity */}
            <Card className="bg-gray-800/70 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-400" />
                  Login Activity
                </CardTitle>
                <CardDescription>
                  Recent authentication events and risk assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loginActivities.map(login => (
                  <div
                    key={login.id}
                    className="p-4 bg-gray-900/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            login.status === "success"
                              ? "bg-green-400"
                              : login.status === "failed"
                                ? "bg-red-400"
                                : "bg-yellow-400"
                          }`}
                        />
                        <span className="font-medium text-gray-100">
                          {login.userEmail}
                        </span>
                      </div>
                      <Badge
                        variant={
                          login.riskScore > 7
                            ? "destructive"
                            : login.riskScore > 4
                              ? "default"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        Risk: {login.riskScore}/10
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mb-2">
                      <div>
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {login.location.city}, {login.location.country}
                      </div>
                      <div>
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {new Date(login.loginTime).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        {login.mfaUsed ? (
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-400" />
                        )}
                        <span
                          className={
                            login.mfaUsed ? "text-green-400" : "text-red-400"
                          }
                        >
                          MFA {login.mfaUsed ? "Used" : "Not Used"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {login.deviceTrusted ? (
                          <Smartphone className="w-3 h-3 text-green-400" />
                        ) : (
                          <Monitor className="w-3 h-3 text-yellow-400" />
                        )}
                        <span
                          className={
                            login.deviceTrusted
                              ? "text-green-400"
                              : "text-yellow-400"
                          }
                        >
                          {login.deviceTrusted
                            ? "Trusted Device"
                            : "New Device"}
                        </span>
                      </div>
                    </div>

                    {login.failureReason && (
                      <div className="mt-2 p-2 bg-red-900/20 border border-red-800/30 rounded text-xs text-red-300">
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        {login.failureReason}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Compliance Metrics */}
            <Card className="bg-gray-800/70 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-green-400" />
                  Compliance Status
                </CardTitle>
                <CardDescription>
                  Current compliance framework statuses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {complianceMetrics.map(metric => (
                  <div
                    key={metric.id}
                    className="p-4 bg-gray-900/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-100">
                        {metric.framework}
                      </h4>
                      <Badge
                        variant={
                          metric.status === "compliant"
                            ? "secondary"
                            : "outline"
                        }
                        className={
                          metric.status === "compliant"
                            ? "bg-green-600/20 text-green-400 border-green-600/30"
                            : ""
                        }
                      >
                        {metric.status}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Compliance Score</span>
                        <span className="text-gray-100 font-medium">
                          {metric.score}%
                        </span>
                      </div>
                      <Progress value={metric.score} className="w-full" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-3 text-xs text-gray-500">
                      <div>
                        <span className="text-gray-400">Last Audit:</span>
                        <br />
                        {new Date(metric.lastAudit).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="text-gray-400">Next Audit:</span>
                        <br />
                        {new Date(metric.nextAudit).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                      <div className="flex gap-4 text-xs">
                        <span className="text-yellow-400">
                          Open Issues: {metric.openIssues}
                        </span>
                        <span className="text-red-400">
                          Critical: {metric.criticalIssues}
                        </span>
                      </div>
                      <Button size="sm" variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        Report
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Security Alerts & Audit Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Alerts */}
            <Card className="bg-gray-800/70 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                  Security Alerts
                </CardTitle>
                <CardDescription>
                  Real-time security monitoring alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {securityAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className="p-3 bg-gray-900/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-100 text-sm">
                        {alert.title}
                      </h4>
                      <Badge
                        variant={
                          alert.severity === "critical"
                            ? "destructive"
                            : alert.severity === "high"
                              ? "default"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      {alert.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                      {!alert.acknowledged ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-6"
                        >
                          Acknowledge
                        </Button>
                      ) : (
                        <span className="text-xs text-green-400">
                          ✓ Acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Audit Logs */}
            <Card className="bg-gray-800/70 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Audit Trail
                </CardTitle>
                <CardDescription>
                  Recent security-relevant actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {auditLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-3 bg-gray-900/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-100 text-sm">
                          {log.action}
                        </h4>
                        <p className="text-xs text-gray-400">{log.userEmail}</p>
                      </div>
                      <Badge
                        variant={
                          log.severity === "critical"
                            ? "destructive"
                            : log.severity === "warning"
                              ? "default"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {log.severity}
                      </Badge>
                    </div>

                    <div className="text-xs text-gray-500 mb-2">
                      Resource:{" "}
                      <span className="text-gray-400">{log.resource}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <div className="flex gap-1">
                        {log.complianceTags.map(tag => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
