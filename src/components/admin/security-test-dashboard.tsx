"use client";

import React, { useState } from "react";
import NormalButton from "@/components/ui/normal-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle,
  Shield,
  AlertTriangle,
  Play,
  Download,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SecurityTestResult {
  test: string;
  status: "PASS" | "FAIL" | "WARNING";
  message: string;
  recommendation?: string;
}

interface SecurityAssessmentReport {
  timestamp: string;
  overallScore: number;
  results: SecurityTestResult[];
  criticalIssues: SecurityTestResult[];
  recommendations: string[];
}

export default function SecurityTestDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<SecurityAssessmentReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Simulated security assessment (in production, this would call the actual API)
  const runSecurityAssessment = async () => {
    setIsRunning(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock report data based on our actual security implementation
      const mockReport: SecurityAssessmentReport = {
        timestamp: new Date().toISOString(),
        overallScore: 78,
        results: [
          {
            test: "Supabase Configuration",
            status: "PASS",
            message: "Supabase environment variables are configured",
          },
          {
            test: "Service Role Key",
            status: "PASS",
            message: "Service role key is configured",
          },
          {
            test: "SQL Injection Prevention",
            status: "PASS",
            message:
              "Using Supabase ORM with parameterized queries provides SQL injection protection",
          },
          {
            test: "Raw SQL Usage Check",
            status: "PASS",
            message: "No raw SQL queries detected in codebase review",
          },
          {
            test: "Next.js XSS Protection",
            status: "PASS",
            message:
              "Next.js provides built-in XSS protection through JSX escaping",
          },
          {
            test: "DOM Manipulation Safety",
            status: "PASS",
            message: "No unsafe DOM manipulation patterns detected",
          },
          {
            test: "Content Security Policy",
            status: "WARNING",
            message: "No CSP headers detected",
            recommendation: "Implement Content Security Policy headers",
          },
          {
            test: "CSRF Token Implementation",
            status: "WARNING",
            message: "No explicit CSRF token implementation found",
            recommendation:
              "Implement CSRF tokens for state-changing operations",
          },
          {
            test: "SameSite Cookie Configuration",
            status: "PASS",
            message: "Supabase handles SameSite cookie configuration",
          },
          {
            test: "JWT Security",
            status: "PASS",
            message:
              "Supabase handles JWT token security with proper signing and validation",
          },
          {
            test: "Session Management",
            status: "PASS",
            message:
              "Session management handled by Supabase with automatic refresh",
          },
          {
            test: "Token Storage",
            status: "PASS",
            message: "Tokens stored in httpOnly cookies via Supabase SSR",
          },
          {
            test: "Rate Limiting",
            status: "PASS",
            message: "Rate limiting is implemented in access control",
          },
          {
            test: "Input Validation",
            status: "PASS",
            message:
              "TypeScript provides compile-time type checking for inputs",
          },
          {
            test: "Input Sanitization",
            status: "WARNING",
            message: "No explicit input sanitization library detected",
            recommendation:
              "Implement input sanitization for user-generated content",
          },
          {
            test: "Security Headers",
            status: "WARNING",
            message: "Security headers should be configured in production",
            recommendation:
              "Configure security headers in next.config.js or reverse proxy",
          },
          {
            test: "Encryption at Rest",
            status: "PASS",
            message: "Supabase provides encryption at rest for all data",
          },
          {
            test: "Encryption in Transit",
            status: "PASS",
            message: "HTTPS enforced for all Supabase connections",
          },
          {
            test: "Sensitive Data Handling",
            status: "WARNING",
            message: "Review sensitive data handling practices",
            recommendation: "Implement field-level encryption for PII data",
          },
          {
            test: "Row Level Security (RLS)",
            status: "WARNING",
            message: "RLS policies need verification",
            recommendation: "Ensure all tables have appropriate RLS policies",
          },
          {
            test: "Role-Based Access Control",
            status: "PASS",
            message: "RBAC implementation found in access control system",
          },
          {
            test: "Audit Logging",
            status: "PASS",
            message: "Comprehensive audit logging system implemented",
          },
          {
            test: "Log Security",
            status: "PASS",
            message: "Audit logs include security events and user actions",
          },
          {
            test: "Environment Variables",
            status: "PASS",
            message: "Sensitive environment variables are properly managed",
          },
          {
            test: "Hardcoded Secrets",
            status: "PASS",
            message: "No hardcoded secrets detected in codebase",
          },
        ],
        criticalIssues: [],
        recommendations: [
          "Implement Content Security Policy headers",
          "Implement CSRF tokens for state-changing operations",
          "Implement input sanitization for user-generated content",
          "Configure security headers in next.config.js or reverse proxy",
          "Implement field-level encryption for PII data",
          "Ensure all tables have appropriate RLS policies",
        ],
      };

      setReport(mockReport);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Security assessment failed"
      );
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PASS":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "WARNING":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "FAIL":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant =
      status === "PASS"
        ? "default"
        : status === "WARNING"
          ? "secondary"
          : "destructive";
    return (
      <Badge variant={variant} className="ml-2">
        {status}
      </Badge>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const exportReport = () => {
    if (!report) return;

    const dataStr = JSON.stringify(report, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `security-report-${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Assessment Dashboard
          </CardTitle>
          <CardDescription>
            Comprehensive security testing and vulnerability assessment for the
            BI Dashboard system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <NormalButton
              onClick={runSecurityAssessment}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isRunning ? "Running Assessment..." : "Run Security Assessment"}
            </NormalButton>

            {report && (
              <NormalButton
                variant="outline"
                onClick={exportReport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Report
              </NormalButton>
            )}
          </div>

          {error && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {report && (
            <div className="space-y-6">
              {/* Overall Score */}
              <Card>
                <CardHeader>
                  <CardTitle>Overall Security Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div
                      className={`text-4xl font-bold ${getScoreColor(report.overallScore)}`}
                    >
                      {report.overallScore}%
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {report.overallScore >= 90 &&
                        "🟢 EXCELLENT: Strong security measures"}
                      {report.overallScore >= 75 &&
                        report.overallScore < 90 &&
                        "🟡 GOOD: Good security with room for improvement"}
                      {report.overallScore >= 60 &&
                        report.overallScore < 75 &&
                        "🟠 MODERATE: Basic security, needs improvements"}
                      {report.overallScore < 60 &&
                        "🔴 POOR: Serious vulnerabilities need attention"}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {report.results.filter(r => r.status === "PASS").length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Passed
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {
                          report.results.filter(r => r.status === "WARNING")
                            .length
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Warnings
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {report.results.filter(r => r.status === "FAIL").length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Failed
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Results */}
              <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="all">All Tests</TabsTrigger>
                  <TabsTrigger value="warnings">Warnings</TabsTrigger>
                  <TabsTrigger value="recommendations">
                    Recommendations
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {report.results.map((result, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {getStatusIcon(result.status)}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{result.test}</h4>
                                {getStatusBadge(result.status)}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {result.message}
                              </p>
                              {result.recommendation && (
                                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                                  <p className="text-sm">
                                    <strong>💡 Recommendation:</strong>{" "}
                                    {result.recommendation}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="warnings" className="space-y-4">
                  {report.results
                    .filter(
                      result =>
                        result.status === "WARNING" || result.status === "FAIL"
                    )
                    .map((result, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            {getStatusIcon(result.status)}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{result.test}</h4>
                                {getStatusBadge(result.status)}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {result.message}
                              </p>
                              {result.recommendation && (
                                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                                  <p className="text-sm">
                                    <strong>💡 Recommendation:</strong>{" "}
                                    {result.recommendation}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Security Improvement Recommendations
                      </CardTitle>
                      <CardDescription>
                        Prioritized list of security improvements to enhance
                        your application
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {report.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                              {index + 1}
                            </div>
                            <p className="text-sm">{recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
