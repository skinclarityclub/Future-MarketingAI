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
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Download,
  RefreshCw,
  Eye,
  Settings,
  Calendar,
  Award,
  XCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ComplianceFramework {
  id: string;
  name: string;
  fullName: string;
  description: string;
  status: "compliant" | "partial" | "non-compliant" | "pending";
  score: number;
  lastAudit: Date;
  nextAudit: Date;
  auditor: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  requirements: number;
  completedRequirements: number;
  openIssues: number;
  tags: string[];
}

interface ComplianceIssue {
  id: string;
  frameworkId: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "resolved" | "dismissed";
  assignee: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  category: string;
  affectedSystems: string[];
}

interface AuditEvent {
  id: string;
  timestamp: Date;
  event: string;
  user: string;
  component: string;
  action: string;
  result: "success" | "failure" | "warning";
  details: string;
  riskScore: number;
  ipAddress: string;
}

interface ComplianceMetrics {
  overallScore: number;
  totalFrameworks: number;
  compliantFrameworks: number;
  pendingIssues: number;
  criticalIssues: number;
  auditsPassed: number;
  auditsScheduled: number;
  lastIncident: Date | null;
  mttrHours: number;
  complianceTrend: number;
}

export function ComplianceDashboard() {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [issues, setIssues] = useState<ComplianceIssue[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFramework, setSelectedFramework] = useState<string | null>(
    null
  );
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadComplianceData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(loadComplianceData, 300000);
    return () => clearInterval(interval);
  }, []);

  const loadComplianceData = async () => {
    try {
      setIsLoading(true);

      // Mock data - in production, these would be real API calls
      const mockFrameworks: ComplianceFramework[] = [
        {
          id: "soc2",
          name: "SOC 2",
          fullName: "SOC 2 Type II",
          description: "System and Organization Controls for Trust Services",
          status: "compliant",
          score: 98.5,
          lastAudit: new Date("2024-01-10"),
          nextAudit: new Date("2024-07-10"),
          auditor: "Ernst & Young",
          riskLevel: "low",
          requirements: 64,
          completedRequirements: 63,
          openIssues: 0,
          tags: ["security", "availability", "processing"],
        },
        {
          id: "gdpr",
          name: "GDPR",
          fullName: "General Data Protection Regulation",
          description: "EU data protection and privacy regulation",
          status: "compliant",
          score: 96.2,
          lastAudit: new Date("2024-01-08"),
          nextAudit: new Date("2024-04-08"),
          auditor: "Internal Team",
          riskLevel: "low",
          requirements: 45,
          completedRequirements: 43,
          openIssues: 1,
          tags: ["privacy", "data-protection", "eu"],
        },
        {
          id: "iso27001",
          name: "ISO 27001",
          fullName: "ISO/IEC 27001:2022",
          description: "Information Security Management System",
          status: "partial",
          score: 89.7,
          lastAudit: new Date("2023-12-15"),
          nextAudit: new Date("2024-03-15"),
          auditor: "BSI Group",
          riskLevel: "medium",
          requirements: 114,
          completedRequirements: 102,
          openIssues: 3,
          tags: ["information-security", "risk-management"],
        },
        {
          id: "ccpa",
          name: "CCPA",
          fullName: "California Consumer Privacy Act",
          description: "California state privacy law",
          status: "compliant",
          score: 94.8,
          lastAudit: new Date("2024-01-12"),
          nextAudit: new Date("2024-06-12"),
          auditor: "Internal Team",
          riskLevel: "low",
          requirements: 28,
          completedRequirements: 27,
          openIssues: 0,
          tags: ["privacy", "california", "consumer-rights"],
        },
        {
          id: "pci-dss",
          name: "PCI DSS",
          fullName: "Payment Card Industry Data Security Standard",
          description: "Security standard for payment card data",
          status: "pending",
          score: 76.3,
          lastAudit: new Date("2023-11-20"),
          nextAudit: new Date("2024-02-20"),
          auditor: "QSA Assessor",
          riskLevel: "high",
          requirements: 78,
          completedRequirements: 59,
          openIssues: 7,
          tags: ["payments", "card-data", "security"],
        },
      ];

      const mockIssues: ComplianceIssue[] = [
        {
          id: "issue-1",
          frameworkId: "iso27001",
          title: "Encryption Key Rotation Policy",
          description:
            "Automated key rotation not implemented for customer data encryption",
          severity: "high",
          status: "in-progress",
          assignee: "Security Team",
          dueDate: new Date("2024-02-15"),
          createdAt: new Date("2024-01-08"),
          updatedAt: new Date("2024-01-10"),
          category: "Cryptography",
          affectedSystems: ["Customer Database", "API Gateway"],
        },
        {
          id: "issue-2",
          frameworkId: "gdpr",
          title: "Data Retention Policy Update",
          description:
            "Customer data retention periods exceed GDPR requirements",
          severity: "medium",
          status: "open",
          assignee: "Legal Team",
          dueDate: new Date("2024-02-28"),
          createdAt: new Date("2024-01-05"),
          updatedAt: new Date("2024-01-05"),
          category: "Data Protection",
          affectedSystems: ["CRM", "Analytics Platform"],
        },
        {
          id: "issue-3",
          frameworkId: "pci-dss",
          title: "Network Segmentation",
          description:
            "Card data environment not properly segmented from corporate network",
          severity: "critical",
          status: "open",
          assignee: "Infrastructure Team",
          dueDate: new Date("2024-02-10"),
          createdAt: new Date("2024-01-12"),
          updatedAt: new Date("2024-01-12"),
          category: "Network Security",
          affectedSystems: ["Payment Gateway", "Card Storage"],
        },
      ];

      const mockAuditEvents: AuditEvent[] = [
        {
          id: "audit-1",
          timestamp: new Date(Date.now() - 3600000),
          event: "User Access",
          user: "sarah.chen@company.com",
          component: "Financial Dashboard",
          action: "view_sensitive_data",
          result: "success",
          details: "Accessed quarterly revenue reports",
          riskScore: 3,
          ipAddress: "192.168.1.45",
        },
        {
          id: "audit-2",
          timestamp: new Date(Date.now() - 7200000),
          event: "System Configuration",
          user: "admin@company.com",
          component: "Security Settings",
          action: "modify_access_control",
          result: "success",
          details: "Updated role permissions for analyst group",
          riskScore: 7,
          ipAddress: "10.0.0.12",
        },
        {
          id: "audit-3",
          timestamp: new Date(Date.now() - 10800000),
          event: "Data Export",
          user: "marcus.johnson@company.com",
          component: "Customer Database",
          action: "export_customer_data",
          result: "success",
          details: "Exported customer list for marketing campaign",
          riskScore: 6,
          ipAddress: "192.168.1.78",
        },
      ];

      const mockMetrics: ComplianceMetrics = {
        overallScore: 91.2,
        totalFrameworks: 5,
        compliantFrameworks: 3,
        pendingIssues: 3,
        criticalIssues: 1,
        auditsPassed: 4,
        auditsScheduled: 2,
        lastIncident: new Date("2023-12-18"),
        mttrHours: 2.4,
        complianceTrend: 5.8,
      };

      setFrameworks(mockFrameworks);
      setIssues(mockIssues);
      setAuditEvents(mockAuditEvents);
      setMetrics(mockMetrics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load compliance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "partial":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "non-compliant":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "pending":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return "text-red-400";
      case "high":
        return "text-orange-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getComplianceScoreColor = (score: number) => {
    if (score >= 95) return "text-green-400";
    if (score >= 85) return "text-yellow-400";
    if (score >= 70) return "text-orange-400";
    return "text-red-400";
  };

  // Chart data for compliance trends
  const complianceTrendData = [
    { month: "Aug", score: 87.2, issues: 8 },
    { month: "Sep", score: 89.1, issues: 6 },
    { month: "Oct", score: 90.5, issues: 5 },
    { month: "Nov", score: 89.8, issues: 7 },
    { month: "Dec", score: 91.2, issues: 3 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 dark:bg-gray-900">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-gray-400">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Compliance Dashboard
            </h1>
            <p className="text-gray-400">
              Enterprise compliance monitoring and audit management
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>

            <Button
              onClick={loadComplianceData}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="border-gray-600 hover:border-blue-500 transition-colors"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <Button
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Overall Score
              </CardTitle>
              <Shield className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold mb-1 ${getComplianceScoreColor(metrics?.overallScore || 0)}`}
              >
                {metrics?.overallScore.toFixed(1)}%
              </div>
              <div className="flex items-center text-xs">
                {(metrics?.complianceTrend || 0) >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400 mr-1" />
                )}
                <span
                  className={
                    metrics?.complianceTrend && metrics.complianceTrend >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {Math.abs(metrics?.complianceTrend || 0).toFixed(1)}%
                </span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Frameworks
              </CardTitle>
              <Award className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {metrics?.compliantFrameworks}/{metrics?.totalFrameworks}
              </div>
              <div className="flex items-center text-xs">
                <CheckCircle className="h-3 w-3 text-green-400 mr-1" />
                <span className="text-green-400">Compliant</span>
                <span className="text-gray-500 ml-1">frameworks</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Open Issues
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {metrics?.pendingIssues}
              </div>
              <div className="flex items-center text-xs">
                <XCircle className="h-3 w-3 text-red-400 mr-1" />
                <span className="text-red-400">
                  {metrics?.criticalIssues} critical
                </span>
                <span className="text-gray-500 ml-1">issues</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Next Audit
              </CardTitle>
              <Calendar className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {Math.min(
                  ...frameworks.map(f =>
                    Math.ceil(
                      (f.nextAudit.getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24)
                    )
                  )
                )}
                d
              </div>
              <div className="flex items-center text-xs">
                <Clock className="h-3 w-3 text-purple-400 mr-1" />
                <span className="text-purple-400">ISO 27001</span>
                <span className="text-gray-500 ml-1">upcoming</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Critical Issues Alert */}
        {(metrics?.criticalIssues || 0) > 0 && (
          <Alert className="border-red-500/30 bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertTitle className="text-red-400">
              Critical Compliance Issues
            </AlertTitle>
            <AlertDescription className="text-gray-300">
              {metrics?.criticalIssues} critical compliance issue(s) require
              immediate attention. Review the issues tab for details and assign
              remediation tasks.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full lg:w-fit grid-cols-2 lg:grid-cols-4 bg-gray-800/50 border border-gray-700">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="frameworks"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Frameworks
            </TabsTrigger>
            <TabsTrigger
              value="issues"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Issues
            </TabsTrigger>
            <TabsTrigger
              value="audit"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Audit Trail
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compliance Trend */}
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Compliance Trend</CardTitle>
                  <CardDescription className="text-gray-400">
                    Overall compliance score over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={complianceTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#F9FAFB",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#10B981"
                        fill="url(#complianceGradient)"
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient
                          id="complianceGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10B981"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10B981"
                            stopOpacity={0.0}
                          />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Framework Status */}
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Framework Status</CardTitle>
                  <CardDescription className="text-gray-400">
                    Compliance status by framework
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {frameworks.map(framework => (
                      <div key={framework.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">
                            {framework.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(framework.status)}>
                              {framework.status}
                            </Badge>
                            <span
                              className={`text-sm font-medium ${getComplianceScoreColor(framework.score)}`}
                            >
                              {framework.score.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <Progress value={framework.score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <FileText className="h-6 w-6" />
                    Generate Report
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Calendar className="h-6 w-6" />
                    Schedule Audit
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Settings className="h-6 w-6" />
                    Configure Alerts
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Shield className="h-6 w-6" />
                    Security Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Frameworks Tab */}
          <TabsContent value="frameworks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {frameworks.map(framework => (
                <Card
                  key={framework.id}
                  className="bg-gray-800/50 border-gray-700 backdrop-blur-sm"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">
                        {framework.name}
                      </CardTitle>
                      <Badge className={getStatusColor(framework.status)}>
                        {framework.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-400">
                      {framework.fullName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">
                          Compliance Score
                        </span>
                        <span
                          className={`font-medium ${getComplianceScoreColor(framework.score)}`}
                        >
                          {framework.score.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={framework.score} className="h-2" />
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Requirements</span>
                        <span className="text-white">
                          {framework.completedRequirements}/
                          {framework.requirements}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Risk Level</span>
                        <span className={getRiskColor(framework.riskLevel)}>
                          {framework.riskLevel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Open Issues</span>
                        <span
                          className={
                            framework.openIssues > 0
                              ? "text-red-400"
                              : "text-green-400"
                          }
                        >
                          {framework.openIssues}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Next Audit</span>
                        <span className="text-white">
                          {formatDate(framework.nextAudit)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {framework.tags.map(tag => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs bg-gray-600/50"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setSelectedFramework(framework.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Issues Tab */}
          <TabsContent value="issues" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Compliance Issues</CardTitle>
                <CardDescription className="text-gray-400">
                  Track and manage compliance issues across all frameworks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {issues.map(issue => (
                      <div
                        key={issue.id}
                        className="p-4 rounded-lg bg-gray-700/30 border border-gray-600/30"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-white font-medium mb-1">
                              {issue.title}
                            </h4>
                            <p className="text-gray-400 text-sm mb-2">
                              {issue.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <Badge
                                className={getSeverityColor(issue.severity)}
                              >
                                {issue.severity}
                              </Badge>
                              <span className="text-gray-400">
                                Framework:{" "}
                                {
                                  frameworks.find(
                                    f => f.id === issue.frameworkId
                                  )?.name
                                }
                              </span>
                              <span className="text-gray-400">
                                Due: {formatDate(issue.dueDate)}
                              </span>
                            </div>
                          </div>
                          <Badge variant="secondary" className="ml-4">
                            {issue.status}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">
                            Assigned to: {issue.assignee}
                          </span>
                          <span className="text-gray-400">
                            Updated: {formatDate(issue.updatedAt)}
                          </span>
                        </div>

                        {issue.affectedSystems.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">
                              Affected Systems:{" "}
                            </span>
                            {issue.affectedSystems.map((system, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="mr-1 text-xs"
                              >
                                {system}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Trail Tab */}
          <TabsContent value="audit" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Audit Trail</CardTitle>
                <CardDescription className="text-gray-400">
                  Real-time audit log of system activities and compliance events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {auditEvents.map(event => (
                      <div
                        key={event.id}
                        className="flex gap-4 p-3 rounded-lg bg-gray-700/20"
                      >
                        <div className="flex-shrink-0">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${
                              event.result === "success"
                                ? "bg-green-400"
                                : event.result === "failure"
                                  ? "bg-red-400"
                                  : "bg-yellow-400"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium">
                              {event.event}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {event.result}
                            </Badge>
                            {event.riskScore >= 7 && (
                              <Badge className="bg-red-500/20 text-red-400 text-xs">
                                High Risk
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm mb-1">
                            {event.details}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>User: {event.user}</span>
                            <span>Component: {event.component}</span>
                            <span>IP: {event.ipAddress}</span>
                            <span>Risk: {event.riskScore}/10</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 text-right">
                          {event.timestamp.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
