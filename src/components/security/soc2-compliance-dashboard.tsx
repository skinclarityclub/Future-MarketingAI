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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  BarChart3,
  Settings,
  Zap,
  Lock,
  Users,
  Database,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  Target,
} from "lucide-react";

// Types
interface SOC2Control {
  id: string;
  criteria:
    | "security"
    | "availability"
    | "processing_integrity"
    | "confidentiality"
    | "privacy";
  category: string;
  title: string;
  description: string;
  implementation: string;
  evidence_procedures: string[];
  responsible_party: string;
  frequency: string;
  last_tested: string;
  next_test_due: string;
  status: "implemented" | "in_progress" | "planned" | "exception";
  exceptions: string[];
  remediation_plan?: string;
}

interface ComplianceMetrics {
  total_controls: number;
  implemented_controls: number;
  in_progress_controls: number;
  exception_controls: number;
  compliance_percentage: number;
  last_assessment_date: string;
  next_assessment_date: string;
  critical_issues: string[];
  high_priority_actions: string[];
}

interface ReadinessReport {
  overall_readiness: "ready" | "needs_work" | "not_ready";
  readiness_score: number;
  criteria_scores: Record<string, number>;
  recommendations: string[];
  next_steps: string[];
}

interface DashboardData {
  criteria: string;
  total_controls: number;
  implemented: number;
  in_progress: number;
  exceptions: number;
  compliance_percentage: number;
}

export default function SOC2ComplianceDashboard() {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [readiness, setReadiness] = useState<ReadinessReport | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData[]>([]);
  const [controls, setControls] = useState<SOC2Control[]>([]);
  const [selectedCriteria, setSelectedCriteria] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch compliance data
  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch overview data
      const overviewResponse = await fetch("/api/security/soc2-compliance");
      const overviewData = await overviewResponse.json();

      if (!overviewData.success) {
        throw new Error(overviewData.error);
      }

      setMetrics(overviewData.data.metrics);
      setReadiness(overviewData.data.readiness);

      // Fetch dashboard data
      const dashboardResponse = await fetch(
        "/api/security/soc2-compliance?action=dashboard"
      );
      const dashboardResult = await dashboardResponse.json();

      if (dashboardResult.success) {
        setDashboardData(dashboardResult.data);
      }

      // Fetch controls
      const controlsResponse = await fetch(
        "/api/security/soc2-compliance?action=controls"
      );
      const controlsResult = await controlsResponse.json();

      if (controlsResult.success) {
        setControls(controlsResult.data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch compliance data"
      );
    } finally {
      setLoading(false);
    }
  };

  // Initialize SOC 2 controls
  const initializeControls = async () => {
    try {
      const response = await fetch("/api/security/soc2-compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "initialize-controls" }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchComplianceData();
      }
    } catch (err) {
      console.error("Failed to initialize controls:", err);
    }
  };

  // Run automated compliance check
  const runComplianceCheck = async () => {
    try {
      const response = await fetch("/api/security/soc2-compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run-compliance-check" }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchComplianceData();
      }
    } catch (err) {
      console.error("Failed to run compliance check:", err);
    }
  };

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "implemented":
        return "bg-green-500";
      case "in_progress":
        return "bg-yellow-500";
      case "planned":
        return "bg-blue-500";
      case "exception":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "implemented":
        return <CheckCircle className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "planned":
        return <Calendar className="h-4 w-4" />;
      case "exception":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getCriteriaIcon = (criteria: string) => {
    switch (criteria) {
      case "security":
        return <Shield className="h-5 w-5" />;
      case "availability":
        return <Zap className="h-5 w-5" />;
      case "processing_integrity":
        return <Target className="h-5 w-5" />;
      case "confidentiality":
        return <Lock className="h-5 w-5" />;
      case "privacy":
        return <Eye className="h-5 w-5" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  const getReadinessColor = (readiness: string) => {
    switch (readiness) {
      case "ready":
        return "text-green-600 bg-green-50 border-green-200";
      case "needs_work":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "not_ready":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const filteredControls =
    selectedCriteria === "all"
      ? controls
      : controls.filter(control => control.criteria === selectedCriteria);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading SOC 2 Compliance Data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Compliance Data</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">SOC 2 Compliance Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Enterprise security and compliance monitoring based on Trust Service
            Criteria
          </p>
        </div>
        <div className="flex gap-2">
          <NormalButton onClick={runComplianceCheck} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Run Check
          </NormalButton>
          <NormalButton onClick={initializeControls}>
            <Settings className="h-4 w-4 mr-2" />
            Initialize
          </NormalButton>
        </div>
      </div>

      {/* Readiness Overview */}
      {readiness && (
        <Card
          className={`border-2 ${getReadinessColor(readiness.overall_readiness)}`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              SOC 2 Readiness:{" "}
              {readiness.overall_readiness.replace("_", " ").toUpperCase()}
            </CardTitle>
            <CardDescription>
              Overall readiness score: {readiness.readiness_score}%
              {readiness.overall_readiness === "ready" && " - Ready for audit"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={readiness.readiness_score} className="mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.entries(readiness.criteria_scores).map(
                ([criteria, score]) => (
                  <div key={criteria} className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {getCriteriaIcon(criteria)}
                    </div>
                    <div className="text-2xl font-bold">{score}%</div>
                    <div className="text-sm text-gray-600 capitalize">
                      {criteria.replace("_", " ")}
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
          <TabsTrigger value="criteria">By Criteria</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Controls
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics.total_controls}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all criteria
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Implemented
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.implemented_controls}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.compliance_percentage}% complete
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    In Progress
                  </CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {metrics.in_progress_controls}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Under development
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Exceptions
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {metrics.exception_controls}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Require attention
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Critical Issues */}
          {metrics && metrics.critical_issues.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Critical Issues Requiring Attention</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 space-y-1">
                  {metrics.critical_issues.slice(0, 5).map((issue, index) => (
                    <li key={index} className="text-sm">
                      • {issue}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* High Priority Actions */}
          {metrics && metrics.high_priority_actions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>High Priority Actions</CardTitle>
                <CardDescription>
                  Next steps to improve compliance posture
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {metrics.high_priority_actions
                    .slice(0, 10)
                    .map((action, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{action}</span>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Controls Tab */}
        <TabsContent value="controls" className="space-y-6">
          <div className="flex gap-2 mb-4">
            <NormalButton
              variant={selectedCriteria === "all" ? "default" : "outline"}
              onClick={() => setSelectedCriteria("all")}
              size="sm"
            >
              All
            </NormalButton>
            {[
              "security",
              "availability",
              "processing_integrity",
              "confidentiality",
              "privacy",
            ].map(criteria => (
              <NormalButton
                key={criteria}
                variant={selectedCriteria === criteria ? "default" : "outline"}
                onClick={() => setSelectedCriteria(criteria)}
                size="sm"
                className="capitalize"
              >
                {criteria.replace("_", " ")}
              </NormalButton>
            ))}
          </div>

          <div className="grid gap-4">
            {filteredControls.map(control => (
              <Card key={control.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getCriteriaIcon(control.criteria)}
                        {control.id}: {control.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {control.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(control.status)}>
                        {getStatusIcon(control.status)}
                        <span className="ml-1 capitalize">
                          {control.status.replace("_", " ")}
                        </span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Implementation</h4>
                      <p className="text-sm text-gray-600">
                        {control.implementation}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Details</h4>
                      <div className="space-y-1 text-sm">
                        <div>
                          <strong>Category:</strong> {control.category}
                        </div>
                        <div>
                          <strong>Responsible:</strong>{" "}
                          {control.responsible_party}
                        </div>
                        <div>
                          <strong>Frequency:</strong> {control.frequency}
                        </div>
                        <div>
                          <strong>Next Test:</strong>{" "}
                          {new Date(control.next_test_due).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {control.exceptions.length > 0 && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                      <h5 className="font-medium text-red-800 mb-2">
                        Exceptions
                      </h5>
                      <ul className="text-sm text-red-600 space-y-1">
                        {control.exceptions.map((exception, index) => (
                          <li key={index}>• {exception}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {control.remediation_plan && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-blue-800 mb-2">
                        Remediation Plan
                      </h5>
                      <p className="text-sm text-blue-600">
                        {control.remediation_plan}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Criteria Tab */}
        <TabsContent value="criteria" className="space-y-6">
          <div className="grid gap-6">
            {dashboardData.map(criteria => (
              <Card key={criteria.criteria}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    {getCriteriaIcon(criteria.criteria)}
                    {criteria.criteria.replace("_", " ")} Criteria
                  </CardTitle>
                  <CardDescription>
                    {criteria.compliance_percentage}% compliance rate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress
                    value={criteria.compliance_percentage}
                    className="mb-4"
                  />
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {criteria.total_controls}
                      </div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {criteria.implemented}
                      </div>
                      <div className="text-sm text-gray-600">Implemented</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {criteria.in_progress}
                      </div>
                      <div className="text-sm text-gray-600">In Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {criteria.exceptions}
                      </div>
                      <div className="text-sm text-gray-600">Exceptions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Evidence Tab */}
        <TabsContent value="evidence" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evidence Management</CardTitle>
              <CardDescription>
                Documentation and evidence for SOC 2 controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Evidence management interface coming soon. This will include:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>• Evidence collection and upload</li>
                <li>• Review and approval workflows</li>
                <li>• Evidence mapping to controls</li>
                <li>• Automated evidence collection</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reports</CardTitle>
              <CardDescription>
                Generate and export compliance reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NormalButton className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Compliance Summary Report
              </NormalButton>
              <NormalButton className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Controls Detail Report
              </NormalButton>
              <NormalButton className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Readiness Assessment
              </NormalButton>
              <NormalButton className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Evidence Summary
              </NormalButton>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
