"use client";

import React, { useState, useCallback, useMemo } from "react";
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
  Users,
  FileText,
  PlayCircle,
  StopCircle,
  RefreshCw,
  Eye,
  Target,
  Calendar,
  User,
  TrendingUp,
  Download,
  Upload,
  Settings,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";

// Types for UAT
interface UATTestCase {
  id: string;
  title: string;
  description: string;
  category:
    | "functional"
    | "usability"
    | "performance"
    | "accessibility"
    | "business_logic";
  priority: "low" | "medium" | "high" | "critical";
  status:
    | "draft"
    | "ready"
    | "in_progress"
    | "passed"
    | "failed"
    | "blocked"
    | "cancelled";
  assignee: string;
  reviewer: string;
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  preconditions: string[];
  steps: UATStep[];
  expectedResult: string;
  actualResult?: string;
  defects: UATDefect[];
  environment: "staging" | "production" | "local";
  browser: string[];
  device: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  executedAt?: Date;
  notes?: string;
}

interface UATStep {
  id: string;
  stepNumber: number;
  action: string;
  expectedBehavior: string;
  status?: "pending" | "passed" | "failed";
  notes?: string;
}

interface UATDefect {
  id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  stepsToReproduce: string[];
  actualBehavior: string;
  expectedBehavior: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  assignee?: string;
  screenshots?: string[];
  createdAt: Date;
}

interface UATSession {
  id: string;
  name: string;
  description: string;
  tester: string;
  startTime: Date;
  endTime?: Date;
  status: "planned" | "active" | "completed" | "cancelled";
  testCases: string[];
  environment: "staging" | "production" | "local";
  browser: string;
  device: string;
  notes?: string;
}

interface UATReport {
  totalTestCases: number;
  passedTestCases: number;
  failedTestCases: number;
  blockedTestCases: number;
  pendingTestCases: number;
  passRate: number;
  averageExecutionTime: number;
  criticalDefects: number;
  totalDefects: number;
  testCoverage: {
    functional: number;
    usability: number;
    performance: number;
    accessibility: number;
    businessLogic: number;
  };
}

// Sample UAT test cases for Premium Customer Journey Demo
const SAMPLE_UAT_CASES: UATTestCase[] = [
  {
    id: "uat-001",
    title: "Complete Customer Journey Flow - Desktop",
    description:
      "Verify that users can successfully complete the entire 4-stage customer journey on desktop",
    category: "functional",
    priority: "critical",
    status: "passed",
    assignee: "John Doe",
    reviewer: "Jane Smith",
    estimatedDuration: 15,
    actualDuration: 12,
    preconditions: [
      "Browser is open",
      "Internet connection available",
      "Demo page loaded",
    ],
    steps: [
      {
        id: "step-1",
        stepNumber: 1,
        action: "Navigate to premium journey demo page",
        expectedBehavior:
          "Page loads within 3 seconds with hero section visible",
        status: "passed",
      },
      {
        id: "step-2",
        stepNumber: 2,
        action: 'Click "Start Journey" button',
        expectedBehavior:
          "Journey progresses to Awareness stage with smooth animation",
        status: "passed",
      },
      {
        id: "step-3",
        stepNumber: 3,
        action: "Progress through all 4 stages",
        expectedBehavior: "Each stage loads properly with interactive elements",
        status: "passed",
      },
      {
        id: "step-4",
        stepNumber: 4,
        action: "Complete ROI calculator",
        expectedBehavior:
          "Calculator shows accurate results with proper formatting",
        status: "passed",
      },
      {
        id: "step-5",
        stepNumber: 5,
        action: "Submit demo request form",
        expectedBehavior: "Form submits successfully with confirmation message",
        status: "passed",
      },
    ],
    expectedResult:
      "User successfully completes journey and lead is captured in CRM",
    actualResult:
      "Journey completed in 12 minutes, lead captured successfully in HubSpot",
    defects: [],
    environment: "staging",
    browser: ["Chrome", "Firefox", "Safari"],
    device: ["Desktop"],
    tags: ["critical-path", "smoke-test", "e2e"],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    executedAt: new Date("2024-01-15"),
    notes: "All animations smooth, no performance issues observed",
  },
  {
    id: "uat-002",
    title: "Mobile Responsiveness - iPhone",
    description: "Verify customer journey works correctly on iPhone devices",
    category: "usability",
    priority: "high",
    status: "failed",
    assignee: "Alice Johnson",
    reviewer: "Bob Wilson",
    estimatedDuration: 20,
    actualDuration: 25,
    preconditions: [
      "iPhone 13 or newer",
      "Safari browser",
      "Good network connection",
    ],
    steps: [
      {
        id: "step-1",
        stepNumber: 1,
        action: "Open demo on iPhone Safari",
        expectedBehavior: "Page loads and displays properly on mobile viewport",
        status: "passed",
      },
      {
        id: "step-2",
        stepNumber: 2,
        action: "Test touch interactions",
        expectedBehavior: "All buttons and swipe gestures work smoothly",
        status: "failed",
        notes: "Swipe gestures not working properly on stage transitions",
      },
      {
        id: "step-3",
        stepNumber: 3,
        action: "Fill out ROI calculator",
        expectedBehavior: "Form inputs work properly with mobile keyboard",
        status: "passed",
      },
    ],
    expectedResult: "Full functionality available on mobile with optimized UX",
    actualResult: "Most features work but swipe gestures need improvement",
    defects: [
      {
        id: "def-001",
        title: "Swipe gestures not working on mobile",
        severity: "medium",
        description:
          "Stage transitions via swipe gestures do not work properly on iPhone Safari",
        stepsToReproduce: [
          "Open demo on iPhone",
          "Try to swipe between stages",
        ],
        actualBehavior: "Swipe gesture is not recognized",
        expectedBehavior: "Smooth stage transition on swipe",
        status: "open",
        createdAt: new Date("2024-01-15"),
      },
    ],
    environment: "staging",
    browser: ["Safari"],
    device: ["iPhone"],
    tags: ["mobile", "responsive", "touch"],
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-15"),
    executedAt: new Date("2024-01-15"),
  },
  {
    id: "uat-003",
    title: "Performance Under Load",
    description: "Test journey performance with multiple concurrent users",
    category: "performance",
    priority: "high",
    status: "in_progress",
    assignee: "Charlie Brown",
    reviewer: "Diana Prince",
    estimatedDuration: 30,
    preconditions: ["Load testing tool setup", "Monitoring tools active"],
    steps: [
      {
        id: "step-1",
        stepNumber: 1,
        action: "Simulate 100 concurrent users",
        expectedBehavior: "System maintains response times under 2 seconds",
        status: "pending",
      },
      {
        id: "step-2",
        stepNumber: 2,
        action: "Monitor resource usage",
        expectedBehavior: "CPU and memory usage stay within acceptable limits",
        status: "pending",
      },
    ],
    expectedResult: "System performs well under concurrent load",
    defects: [],
    environment: "staging",
    browser: ["Chrome"],
    device: ["Desktop"],
    tags: ["performance", "load-test", "scalability"],
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-16"),
  },
  {
    id: "uat-004",
    title: "Accessibility Compliance - WCAG 2.1",
    description: "Verify the journey meets WCAG 2.1 AA accessibility standards",
    category: "accessibility",
    priority: "medium",
    status: "ready",
    assignee: "Eva Martinez",
    reviewer: "Frank Davis",
    estimatedDuration: 45,
    preconditions: [
      "Screen reader software installed",
      "Accessibility testing tools ready",
    ],
    steps: [
      {
        id: "step-1",
        stepNumber: 1,
        action: "Test with screen reader",
        expectedBehavior: "All content is properly announced",
        status: "pending",
      },
      {
        id: "step-2",
        stepNumber: 2,
        action: "Test keyboard navigation",
        expectedBehavior: "All interactive elements accessible via keyboard",
        status: "pending",
      },
      {
        id: "step-3",
        stepNumber: 3,
        action: "Check color contrast",
        expectedBehavior: "All text meets WCAG contrast requirements",
        status: "pending",
      },
    ],
    expectedResult: "Full WCAG 2.1 AA compliance achieved",
    defects: [],
    environment: "staging",
    browser: ["Chrome", "Firefox"],
    device: ["Desktop"],
    tags: ["accessibility", "wcag", "compliance"],
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-16"),
  },
];

const SAMPLE_UAT_SESSIONS: UATSession[] = [
  {
    id: "session-001",
    name: "Sprint 1 UAT Session",
    description: "Initial testing of core journey functionality",
    tester: "QA Team Lead",
    startTime: new Date("2024-01-15T09:00:00"),
    endTime: new Date("2024-01-15T17:00:00"),
    status: "completed",
    testCases: ["uat-001", "uat-002"],
    environment: "staging",
    browser: "Chrome",
    device: "Desktop",
    notes: "Overall good progress, mobile issues identified",
  },
  {
    id: "session-002",
    name: "Performance Testing Session",
    description: "Load and performance validation",
    tester: "Performance Specialist",
    startTime: new Date("2024-01-16T10:00:00"),
    status: "active",
    testCases: ["uat-003"],
    environment: "staging",
    browser: "Chrome",
    device: "Desktop",
  },
];

export const UserAcceptanceTesting: React.FC = () => {
  const [testCases, setTestCases] = useState<UATTestCase[]>(SAMPLE_UAT_CASES);
  const [sessions, setSessions] = useState<UATSession[]>(SAMPLE_UAT_SESSIONS);
  const [selectedTestCase, setSelectedTestCase] = useState<UATTestCase | null>(
    null
  );
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Calculate UAT report
  const uatReport: UATReport = useMemo(() => {
    const total = testCases.length;
    const passed = testCases.filter(tc => tc.status === "passed").length;
    const failed = testCases.filter(tc => tc.status === "failed").length;
    const blocked = testCases.filter(tc => tc.status === "blocked").length;
    const pending = testCases.filter(tc =>
      ["draft", "ready", "in_progress"].includes(tc.status)
    ).length;

    const executedCases = testCases.filter(tc => tc.actualDuration);
    const avgExecutionTime =
      executedCases.reduce((acc, tc) => acc + (tc.actualDuration || 0), 0) /
        executedCases.length || 0;

    const allDefects = testCases.flatMap(tc => tc.defects);
    const criticalDefects = allDefects.filter(
      def => def.severity === "critical"
    ).length;

    const testCoverage = {
      functional: testCases.filter(tc => tc.category === "functional").length,
      usability: testCases.filter(tc => tc.category === "usability").length,
      performance: testCases.filter(tc => tc.category === "performance").length,
      accessibility: testCases.filter(tc => tc.category === "accessibility")
        .length,
      businessLogic: testCases.filter(tc => tc.category === "business_logic")
        .length,
    };

    return {
      totalTestCases: total,
      passedTestCases: passed,
      failedTestCases: failed,
      blockedTestCases: blocked,
      pendingTestCases: pending,
      passRate: total > 0 ? (passed / total) * 100 : 0,
      averageExecutionTime: avgExecutionTime,
      criticalDefects,
      totalDefects: allDefects.length,
      testCoverage,
    };
  }, [testCases]);

  // Filter test cases
  const filteredTestCases = useMemo(() => {
    return testCases.filter(tc => {
      const categoryMatch =
        filterCategory === "all" || tc.category === filterCategory;
      const statusMatch = filterStatus === "all" || tc.status === filterStatus;
      return categoryMatch && statusMatch;
    });
  }, [testCases, filterCategory, filterStatus]);

  // Execute test case
  const executeTestCase = useCallback((testCaseId: string) => {
    setTestCases(prev =>
      prev.map(tc =>
        tc.id === testCaseId
          ? { ...tc, status: "in_progress" as const, executedAt: new Date() }
          : tc
      )
    );
  }, []);

  // Update test case status
  const updateTestCaseStatus = useCallback(
    (testCaseId: string, status: UATTestCase["status"], notes?: string) => {
      setTestCases(prev =>
        prev.map(tc =>
          tc.id === testCaseId
            ? { ...tc, status, updatedAt: new Date(), notes }
            : tc
        )
      );
    },
    []
  );

  // Status icon component
  const StatusIcon: React.FC<{ status: UATTestCase["status"] }> = ({
    status,
  }) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "blocked":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "in_progress":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          User Acceptance Testing
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Comprehensive UAT framework for Premium Customer Journey Demo
          validation
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pass Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {uatReport.passRate.toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Cases</p>
                <p className="text-2xl font-bold text-blue-600">
                  {uatReport.totalTestCases}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Time</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(uatReport.averageExecutionTime)}m
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {uatReport.failedTestCases}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Defects</p>
                <p className="text-2xl font-bold text-orange-600">
                  {uatReport.totalDefects}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="test-cases" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="test-cases">Test Cases</TabsTrigger>
          <TabsTrigger value="sessions">Test Sessions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="defects">Defects</TabsTrigger>
        </TabsList>

        {/* Test Cases Tab */}
        <TabsContent value="test-cases" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Test Cases
                </CardTitle>
                <div className="flex gap-2">
                  <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    <option value="all">All Categories</option>
                    <option value="functional">Functional</option>
                    <option value="usability">Usability</option>
                    <option value="performance">Performance</option>
                    <option value="accessibility">Accessibility</option>
                    <option value="business_logic">Business Logic</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="ready">Ready</option>
                    <option value="in_progress">In Progress</option>
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                  <NormalButton
                    size="sm"
                    onClick={() => setShowCreateForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Test Case
                  </NormalButton>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTestCases.map(testCase => (
                  <div
                    key={testCase.id}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <StatusIcon status={testCase.status} />
                          <h3 className="font-medium">{testCase.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {testCase.category}
                          </Badge>
                          <Badge
                            className={
                              testCase.priority === "critical"
                                ? "bg-red-100 text-red-800"
                                : testCase.priority === "high"
                                  ? "bg-orange-100 text-orange-800"
                                  : testCase.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                            }
                          >
                            {testCase.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {testCase.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Assignee: {testCase.assignee}</span>
                          <span>Est. {testCase.estimatedDuration}min</span>
                          {testCase.actualDuration && (
                            <span>Actual: {testCase.actualDuration}min</span>
                          )}
                          <span>Steps: {testCase.steps.length}</span>
                          {testCase.defects.length > 0 && (
                            <span className="text-red-600">
                              {testCase.defects.length} defects
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <NormalButton
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTestCase(testCase)}
                        >
                          <Eye className="h-4 w-4" />
                        </NormalButton>
                        {testCase.status === "ready" && (
                          <NormalButton
                            size="sm"
                            onClick={() => executeTestCase(testCase.id)}
                          >
                            <PlayCircle className="h-4 w-4" />
                          </NormalButton>
                        )}
                      </div>
                    </div>

                    {testCase.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {testCase.tags.map(tag => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Test Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map(session => (
                  <div key={session.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{session.name}</h3>
                        <p className="text-sm text-gray-600">
                          {session.description}
                        </p>
                      </div>
                      <Badge
                        className={
                          session.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : session.status === "active"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }
                      >
                        {session.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Tester</p>
                        <p className="font-medium">{session.tester}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Environment</p>
                        <p className="font-medium capitalize">
                          {session.environment}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Test Cases</p>
                        <p className="font-medium">
                          {session.testCases.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Duration</p>
                        <p className="font-medium">
                          {session.endTime
                            ? `${Math.round((session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60 * 60))}h`
                            : "Ongoing"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Coverage by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(uatReport.testCoverage).map(
                    ([category, count]) => (
                      <div
                        key={category}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm capitalize">
                          {category.replace("_", " ")}
                        </span>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(count / uatReport.totalTestCases) * 100}
                            className="w-20 h-2"
                          />
                          <span className="text-sm font-medium w-8">
                            {count}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Execution Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Passed</span>
                    <span className="text-sm font-medium text-green-600">
                      {uatReport.passedTestCases}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Failed</span>
                    <span className="text-sm font-medium text-red-600">
                      {uatReport.failedTestCases}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Blocked</span>
                    <span className="text-sm font-medium text-orange-600">
                      {uatReport.blockedTestCases}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending</span>
                    <span className="text-sm font-medium text-gray-600">
                      {uatReport.pendingTestCases}
                    </span>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Overall Pass Rate
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {uatReport.passRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Defects Tab */}
        <TabsContent value="defects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Defects & Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testCases
                  .flatMap(tc =>
                    tc.defects.map(defect => ({
                      ...defect,
                      testCaseId: tc.id,
                      testCaseTitle: tc.title,
                    }))
                  )
                  .map(defect => (
                    <div key={defect.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{defect.title}</h3>
                          <p className="text-sm text-gray-600">
                            Test Case: {(defect as any).testCaseTitle}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              defect.severity === "critical"
                                ? "bg-red-100 text-red-800"
                                : defect.severity === "high"
                                  ? "bg-orange-100 text-orange-800"
                                  : defect.severity === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                            }
                          >
                            {defect.severity}
                          </Badge>
                          <Badge variant="outline">{defect.status}</Badge>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">
                            Description:
                          </p>
                          <p className="text-gray-600">{defect.description}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">
                            Expected vs Actual:
                          </p>
                          <p className="text-green-600">
                            Expected: {defect.expectedBehavior}
                          </p>
                          <p className="text-red-600">
                            Actual: {defect.actualBehavior}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">
                          Created: {defect.createdAt.toLocaleDateString()}
                          {defect.assignee &&
                            ` • Assigned to: ${defect.assignee}`}
                        </div>
                      </div>
                    </div>
                  ))}

                {testCases.every(tc => tc.defects.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No defects reported. Great job!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Case Detail Modal */}
      {selectedTestCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedTestCase.title}
                  </h2>
                  <p className="text-gray-600">
                    {selectedTestCase.description}
                  </p>
                </div>
                <NormalButton
                  variant="outline"
                  onClick={() => setSelectedTestCase(null)}
                >
                  ×
                </NormalButton>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <div className="flex items-center gap-2">
                      <StatusIcon status={selectedTestCase.status} />
                      <span className="capitalize">
                        {selectedTestCase.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <p className="font-medium capitalize">
                      {selectedTestCase.priority}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Assignee</p>
                    <p className="font-medium">{selectedTestCase.assignee}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estimated Duration</p>
                    <p className="font-medium">
                      {selectedTestCase.estimatedDuration} minutes
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Test Steps</h3>
                  <div className="space-y-2">
                    {selectedTestCase.steps.map(step => (
                      <div key={step.id} className="p-3 border rounded">
                        <div className="flex items-start gap-3">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {step.stepNumber}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium">{step.action}</p>
                            <p className="text-sm text-gray-600">
                              {step.expectedBehavior}
                            </p>
                            {step.status && (
                              <div className="flex items-center gap-2 mt-2">
                                <StatusIcon status={step.status as any} />
                                <span className="text-xs capitalize">
                                  {step.status}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Expected Result</h3>
                  <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
                    {selectedTestCase.expectedResult}
                  </p>
                </div>

                {selectedTestCase.actualResult && (
                  <div>
                    <h3 className="font-medium mb-2">Actual Result</h3>
                    <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
                      {selectedTestCase.actualResult}
                    </p>
                  </div>
                )}

                {selectedTestCase.status === "in_progress" && (
                  <div className="flex gap-2">
                    <NormalButton
                      onClick={() =>
                        updateTestCaseStatus(selectedTestCase.id, "passed")
                      }
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark as Passed
                    </NormalButton>
                    <NormalButton
                      onClick={() =>
                        updateTestCaseStatus(selectedTestCase.id, "failed")
                      }
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Mark as Failed
                    </NormalButton>
                    <NormalButton
                      onClick={() =>
                        updateTestCaseStatus(selectedTestCase.id, "blocked")
                      }
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Mark as Blocked
                    </NormalButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAcceptanceTesting;
