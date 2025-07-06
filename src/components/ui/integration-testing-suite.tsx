"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Database,
  Users,
  Mail,
  TestTube,
  Zap,
  Shield,
  Globe,
  BarChart3,
  Settings,
  PlayCircle,
  StopCircle,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Target,
} from "lucide-react";

// Types for testing and integration
interface TestResult {
  id: string;
  name: string;
  status: "pending" | "running" | "passed" | "failed" | "skipped";
  duration?: number;
  error?: string;
  details?: string;
  timestamp: Date;
}

interface IntegrationTest {
  id: string;
  name: string;
  type: "supabase" | "crm" | "email" | "api" | "ui" | "performance";
  endpoint?: string;
  method?: string;
  expectedStatus?: number;
  timeout?: number;
  dependencies?: string[];
}

interface CRMIntegration {
  id: string;
  name: string;
  type: "hubspot" | "salesforce" | "pipedrive" | "custom";
  status: "connected" | "disconnected" | "error";
  apiKey?: string;
  lastSync?: Date;
  totalLeads?: number;
  errorCount?: number;
}

interface LeadCaptureRule {
  id: string;
  name: string;
  trigger:
    | "form_submit"
    | "journey_complete"
    | "roi_calculated"
    | "demo_requested";
  action: "crm_create" | "email_send" | "webhook_call" | "database_store";
  config: Record<string, any>;
  enabled: boolean;
  lastTriggered?: Date;
  successCount: number;
  errorCount: number;
}

interface QATestCase {
  id: string;
  title: string;
  description: string;
  category:
    | "functional"
    | "usability"
    | "performance"
    | "security"
    | "accessibility";
  priority: "low" | "medium" | "high" | "critical";
  status: "draft" | "active" | "passed" | "failed" | "blocked";
  steps: string[];
  expected: string;
  actual?: string;
  assignee?: string;
  tags: string[];
}

const SAMPLE_TESTS: IntegrationTest[] = [
  {
    id: "supabase-auth",
    name: "Supabase Authentication",
    type: "supabase",
    endpoint: "/api/auth/supabase",
    method: "POST",
    expectedStatus: 200,
    timeout: 5000,
  },
  {
    id: "supabase-data",
    name: "Supabase Data Connection",
    type: "supabase",
    endpoint: "/api/data/journey",
    method: "GET",
    expectedStatus: 200,
    timeout: 3000,
  },
  {
    id: "crm-hubspot",
    name: "HubSpot CRM Integration",
    type: "crm",
    endpoint: "/api/crm/hubspot/contacts",
    method: "POST",
    expectedStatus: 201,
    timeout: 10000,
  },
  {
    id: "email-sendgrid",
    name: "SendGrid Email Service",
    type: "email",
    endpoint: "/api/email/send",
    method: "POST",
    expectedStatus: 202,
    timeout: 5000,
  },
  {
    id: "journey-performance",
    name: "Customer Journey Performance",
    type: "performance",
    timeout: 2000,
  },
  {
    id: "ui-responsiveness",
    name: "UI Responsiveness Test",
    type: "ui",
    timeout: 3000,
  },
];

const SAMPLE_CRM_INTEGRATIONS: CRMIntegration[] = [
  {
    id: "hubspot",
    name: "HubSpot",
    type: "hubspot",
    status: "connected",
    lastSync: new Date(Date.now() - 3600000),
    totalLeads: 1247,
    errorCount: 0,
  },
  {
    id: "salesforce",
    name: "Salesforce",
    type: "salesforce",
    status: "disconnected",
    errorCount: 3,
  },
  {
    id: "pipedrive",
    name: "Pipedrive",
    type: "pipedrive",
    status: "error",
    lastSync: new Date(Date.now() - 86400000),
    totalLeads: 892,
    errorCount: 12,
  },
];

const SAMPLE_LEAD_RULES: LeadCaptureRule[] = [
  {
    id: "journey-complete",
    name: "Journey Completion Lead",
    trigger: "journey_complete",
    action: "crm_create",
    config: { crm: "hubspot", pipeline: "marketing-qualified" },
    enabled: true,
    lastTriggered: new Date(Date.now() - 1800000),
    successCount: 156,
    errorCount: 2,
  },
  {
    id: "roi-calculation",
    name: "ROI Calculator Lead",
    trigger: "roi_calculated",
    action: "email_send",
    config: { template: "roi-follow-up", delay: 300 },
    enabled: true,
    lastTriggered: new Date(Date.now() - 900000),
    successCount: 89,
    errorCount: 1,
  },
  {
    id: "demo-request",
    name: "Demo Request Lead",
    trigger: "demo_requested",
    action: "webhook_call",
    config: { url: "https://hooks.zapier.com/demo-request", method: "POST" },
    enabled: true,
    lastTriggered: new Date(Date.now() - 300000),
    successCount: 34,
    errorCount: 0,
  },
];

const SAMPLE_QA_TESTS: QATestCase[] = [
  {
    id: "journey-flow",
    title: "Complete Customer Journey Flow",
    description: "Test the entire customer journey from awareness to action",
    category: "functional",
    priority: "critical",
    status: "passed",
    steps: [
      "Load premium journey demo page",
      "Progress through all 4 stages",
      "Fill out ROI calculator",
      "Submit demo request form",
      "Verify lead capture",
    ],
    expected: "User successfully completes journey and lead is captured",
    actual: "Journey completed in 3.2 minutes, lead captured successfully",
    tags: ["journey", "e2e", "conversion"],
  },
  {
    id: "mobile-responsive",
    title: "Mobile Responsiveness",
    description: "Verify customer journey works on mobile devices",
    category: "usability",
    priority: "high",
    status: "passed",
    steps: [
      "Load demo on mobile device (iPhone 13)",
      "Test touch interactions",
      "Verify text readability",
      "Test form submissions",
    ],
    expected: "All features work smoothly on mobile",
    actual: "All tests passed, touch interactions responsive",
    tags: ["mobile", "responsive", "usability"],
  },
  {
    id: "performance-load",
    title: "Page Load Performance",
    description: "Measure and verify page load times",
    category: "performance",
    priority: "high",
    status: "failed",
    steps: [
      "Load demo page with performance monitoring",
      "Measure First Contentful Paint",
      "Measure Largest Contentful Paint",
      "Check Core Web Vitals",
    ],
    expected: "LCP < 2.5s, FCP < 1.8s, CLS < 0.1",
    actual: "LCP: 3.2s (failed), FCP: 1.6s (passed), CLS: 0.08 (passed)",
    tags: ["performance", "core-web-vitals", "optimization"],
  },
];

export const IntegrationTestingSuite: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [crmIntegrations, setCrmIntegrations] = useState<CRMIntegration[]>(
    SAMPLE_CRM_INTEGRATIONS
  );
  const [leadRules, setLeadRules] =
    useState<LeadCaptureRule[]>(SAMPLE_LEAD_RULES);
  const [qaTests, setQaTests] = useState<QATestCase[]>(SAMPLE_QA_TESTS);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [selectedTestSuite, setSelectedTestSuite] = useState<string>("all");
  const [testProgress, setTestProgress] = useState(0);

  // Simulate running integration tests
  const runIntegrationTests = useCallback(async (testSuite: string = "all") => {
    setIsTestRunning(true);
    setTestProgress(0);

    const testsToRun =
      testSuite === "all"
        ? SAMPLE_TESTS
        : SAMPLE_TESTS.filter(test => test.type === testSuite);

    const results: TestResult[] = [];

    for (let i = 0; i < testsToRun.length; i++) {
      const test = testsToRun[i];
      const startTime = Date.now();

      // Update progress
      setTestProgress((i / testsToRun.length) * 100);

      // Simulate test execution
      await new Promise(resolve =>
        setTimeout(resolve, Math.random() * 2000 + 500)
      );

      const duration = Date.now() - startTime;
      const success = Math.random() > 0.2; // 80% success rate

      const result: TestResult = {
        id: test.id,
        name: test.name,
        status: success ? "passed" : "failed",
        duration,
        error: success ? undefined : "Connection timeout or API error",
        details: success
          ? "Test completed successfully"
          : "Check network connection and API credentials",
        timestamp: new Date(),
      };

      results.push(result);
      setTestResults([...results]);
    }

    setTestProgress(100);
    setIsTestRunning(false);
  }, []);

  // Calculate test statistics
  const testStats = useMemo(() => {
    const total = testResults.length;
    const passed = testResults.filter(r => r.status === "passed").length;
    const failed = testResults.filter(r => r.status === "failed").length;
    const running = testResults.filter(r => r.status === "running").length;
    const avgDuration =
      testResults.reduce((acc, r) => acc + (r.duration || 0), 0) / total || 0;

    return {
      total,
      passed,
      failed,
      running,
      avgDuration,
      successRate: (passed / total) * 100 || 0,
    };
  }, [testResults]);

  // Calculate CRM health
  const crmHealth = useMemo(() => {
    const connected = crmIntegrations.filter(
      crm => crm.status === "connected"
    ).length;
    const total = crmIntegrations.length;
    const totalLeads = crmIntegrations.reduce(
      (acc, crm) => acc + (crm.totalLeads || 0),
      0
    );
    const totalErrors = crmIntegrations.reduce(
      (acc, crm) => acc + (crm.errorCount || 0),
      0
    );

    return {
      connected,
      total,
      totalLeads,
      totalErrors,
      healthScore: (connected / total) * 100,
    };
  }, [crmIntegrations]);

  // Calculate lead capture performance
  const leadPerformance = useMemo(() => {
    const activeRules = leadRules.filter(rule => rule.enabled).length;
    const totalSuccess = leadRules.reduce(
      (acc, rule) => acc + rule.successCount,
      0
    );
    const totalErrors = leadRules.reduce(
      (acc, rule) => acc + rule.errorCount,
      0
    );
    const successRate = (totalSuccess / (totalSuccess + totalErrors)) * 100;

    return { activeRules, totalSuccess, totalErrors, successRate };
  }, [leadRules]);

  // Test status icon component
  const TestStatusIcon: React.FC<{ status: TestResult["status"] }> = ({
    status,
  }) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Integration & Testing Suite
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Comprehensive testing and integration management for the Premium
          Customer Journey Demo
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Test Success Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {testStats.successRate.toFixed(1)}%
                </p>
              </div>
              <TestTube className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">CRM Health</p>
                <p className="text-2xl font-bold text-blue-600">
                  {crmHealth.healthScore.toFixed(0)}%
                </p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Leads Captured</p>
                <p className="text-2xl font-bold text-purple-600">
                  {crmHealth.totalLeads.toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Capture Rate</p>
                <p className="text-2xl font-bold text-orange-600">
                  {leadPerformance.successRate.toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="integration" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="integration">Integration Tests</TabsTrigger>
          <TabsTrigger value="crm">CRM Systems</TabsTrigger>
          <TabsTrigger value="leads">Lead Capture</TabsTrigger>
          <TabsTrigger value="qa">QA Testing</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* Integration Tests Tab */}
        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Integration Test Suite
                </CardTitle>
                <div className="flex gap-2">
                  <select
                    value={selectedTestSuite}
                    onChange={e => setSelectedTestSuite(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm"
                    disabled={isTestRunning}
                  >
                    <option value="all">All Tests</option>
                    <option value="supabase">Supabase Only</option>
                    <option value="crm">CRM Only</option>
                    <option value="email">Email Only</option>
                    <option value="performance">Performance Only</option>
                  </select>
                  <NormalButton
                    onClick={() => runIntegrationTests(selectedTestSuite)}
                    disabled={isTestRunning}
                    size="sm"
                  >
                    {isTestRunning ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Run Tests
                      </>
                    )}
                  </NormalButton>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isTestRunning && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Test Progress</span>
                    <span>{Math.round(testProgress)}%</span>
                  </div>
                  <Progress value={testProgress} className="w-full" />
                </div>
              )}

              <div className="space-y-2">
                {testResults.length > 0 ? (
                  testResults.map(result => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <TestStatusIcon status={result.status} />
                        <div>
                          <p className="font-medium">{result.name}</p>
                          {result.error && (
                            <p className="text-sm text-red-600">
                              {result.error}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        {result.duration && <p>{result.duration}ms</p>}
                        <p>{result.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tests run yet. Click "Run Tests" to start testing.</p>
                  </div>
                )}
              </div>

              {testResults.length > 0 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    {testStats.total} tests • {testStats.passed} passed •{" "}
                    {testStats.failed} failed
                  </div>
                  <div className="text-sm text-gray-600">
                    Avg duration: {Math.round(testStats.avgDuration)}ms
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CRM Systems Tab */}
        <TabsContent value="crm" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                CRM Integration Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {crmIntegrations.map(crm => (
                  <div
                    key={crm.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          crm.status === "connected"
                            ? "bg-green-500"
                            : crm.status === "error"
                              ? "bg-red-500"
                              : "bg-gray-400"
                        }`}
                      />
                      <div>
                        <p className="font-medium">{crm.name}</p>
                        <p className="text-sm text-gray-600 capitalize">
                          {crm.status}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      {crm.totalLeads && (
                        <p className="text-sm">
                          <strong>{crm.totalLeads.toLocaleString()}</strong>{" "}
                          leads
                        </p>
                      )}
                      {crm.lastSync && (
                        <p className="text-xs text-gray-500">
                          Last sync: {crm.lastSync.toLocaleString()}
                        </p>
                      )}
                      {crm.errorCount > 0 && (
                        <p className="text-xs text-red-500">
                          {crm.errorCount} errors
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lead Capture Tab */}
        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Lead Capture Automation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leadRules.map(rule => (
                  <div key={rule.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${rule.enabled ? "bg-green-500" : "bg-gray-400"}`}
                        />
                        <h3 className="font-medium">{rule.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {rule.trigger.replace("_", " ")}
                        </Badge>
                      </div>
                      <Badge
                        className={
                          rule.enabled
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }
                      >
                        {rule.enabled ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Success Rate</p>
                        <p className="font-medium text-green-600">
                          {(
                            (rule.successCount /
                              (rule.successCount + rule.errorCount)) *
                            100
                          ).toFixed(1)}
                          %
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Captures</p>
                        <p className="font-medium">{rule.successCount}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Last Triggered</p>
                        <p className="font-medium">
                          {rule.lastTriggered
                            ? rule.lastTriggered.toLocaleString()
                            : "Never"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* QA Testing Tab */}
        <TabsContent value="qa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Quality Assurance Testing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qaTests.map(test => (
                  <div key={test.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{test.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {test.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {test.category}
                        </Badge>
                        <Badge
                          className={
                            test.status === "passed"
                              ? "bg-green-100 text-green-800"
                              : test.status === "failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {test.status}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            test.priority === "critical"
                              ? "border-red-500 text-red-600"
                              : test.priority === "high"
                                ? "border-orange-500 text-orange-600"
                                : "border-gray-400 text-gray-600"
                          }
                        >
                          {test.priority}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">Expected:</p>
                        <p className="text-gray-600">{test.expected}</p>
                      </div>
                      {test.actual && (
                        <div>
                          <p className="font-medium text-gray-700">Actual:</p>
                          <p
                            className={`${test.status === "failed" ? "text-red-600" : "text-green-600"}`}
                          >
                            {test.actual}
                          </p>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {test.tags.map(tag => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Real-time Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">System Health</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Response Time</span>
                      <span className="text-sm font-medium text-green-600">
                        142ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database Connection</span>
                      <span className="text-sm font-medium text-green-600">
                        Healthy
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Memory Usage</span>
                      <span className="text-sm font-medium text-yellow-600">
                        72%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Uptime</span>
                      <span className="text-sm font-medium text-green-600">
                        99.8%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Recent Activity</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Lead captured via ROI calculator</span>
                      <span className="text-gray-500 ml-auto">2m ago</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>Journey stage completed</span>
                      <span className="text-gray-500 ml-auto">5m ago</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span>Demo request submitted</span>
                      <span className="text-gray-500 ml-auto">12m ago</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      <span>Email campaign triggered</span>
                      <span className="text-gray-500 ml-auto">18m ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationTestingSuite;
