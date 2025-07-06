"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlayCircle,
  PauseCircle,
  Settings,
  Trophy,
  TrendingUp,
  AlertTriangle,
  Clock,
  Target,
  BarChart3,
  Activity,
  RefreshCw,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Timer,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  AutomaticWinnerScheduler,
  SchedulerConfig,
  SchedulerMetrics,
  TestEvaluationResult,
  getSchedulerInstance,
} from "@/lib/ab-testing/automatic-winner-scheduler";

interface ABTest {
  id: string;
  name: string;
  type: "content" | "workflow" | "campaign";
  status: "draft" | "running" | "paused" | "completed" | "cancelled";
  variants: ABTestVariant[];
  startDate: string;
  endDate?: string;
  autoWinnerEnabled: boolean;
  winnerVariantId?: string;
  confidence?: number;
  improvement?: number;
  targetAudience: string;
  sampleSize: number;
  significanceThreshold: number;
  implementationStrategy?: "immediate" | "gradual" | "staged" | "delayed";
}

interface ABTestVariant {
  id: string;
  name: string;
  isControl: boolean;
  trafficPercentage: number;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    conversionRate: number;
    improvement?: number;
  };
}

interface CentralControlCenterProps {
  className?: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function CentralControlCenter({ className }: CentralControlCenterProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [tests, setTests] = useState<ABTest[]>([]);
  const [schedulerMetrics, setSchedulerMetrics] =
    useState<SchedulerMetrics | null>(null);
  const [schedulerConfig, setSchedulerConfig] =
    useState<SchedulerConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  // Initialize scheduler instance
  const scheduler = React.useMemo(() => getSchedulerInstance(), []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadTests(), loadSchedulerMetrics()]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTests = async () => {
    try {
      // In a real implementation, this would fetch from API
      const mockTests: ABTest[] = [
        {
          id: "test-001",
          name: "Email Subject Line Test",
          type: "content",
          status: "running",
          startDate: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          autoWinnerEnabled: true,
          targetAudience: "Newsletter subscribers",
          sampleSize: 5000,
          significanceThreshold: 95,
          variants: [
            {
              id: "control",
              name: "Control",
              isControl: true,
              trafficPercentage: 50,
              metrics: {
                impressions: 2500,
                clicks: 125,
                conversions: 12,
                conversionRate: 9.6,
              },
            },
            {
              id: "variant-a",
              name: "Emoji Subject Line",
              isControl: false,
              trafficPercentage: 50,
              metrics: {
                impressions: 2500,
                clicks: 156,
                conversions: 18,
                conversionRate: 11.5,
                improvement: 19.8,
              },
            },
          ],
        },
        {
          id: "test-002",
          name: "Landing Page CTA Test",
          type: "content",
          status: "completed",
          startDate: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          autoWinnerEnabled: true,
          winnerVariantId: "variant-b",
          confidence: 99,
          improvement: 24.6,
          targetAudience: "Website visitors",
          sampleSize: 8000,
          significanceThreshold: 95,
          implementationStrategy: "gradual",
          variants: [
            {
              id: "control",
              name: "Control",
              isControl: true,
              trafficPercentage: 50,
              metrics: {
                impressions: 4000,
                clicks: 240,
                conversions: 28,
                conversionRate: 11.67,
              },
            },
            {
              id: "variant-b",
              name: "Action-Oriented CTA",
              isControl: false,
              trafficPercentage: 50,
              metrics: {
                impressions: 4000,
                clicks: 328,
                conversions: 45,
                conversionRate: 13.72,
                improvement: 24.6,
              },
            },
          ],
        },
        {
          id: "test-003",
          name: "Workflow Automation Test",
          type: "workflow",
          status: "running",
          startDate: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
          autoWinnerEnabled: false,
          targetAudience: "Active users",
          sampleSize: 3000,
          significanceThreshold: 95,
          variants: [
            {
              id: "control",
              name: "Manual Process",
              isControl: true,
              trafficPercentage: 50,
              metrics: {
                impressions: 1500,
                clicks: 85,
                conversions: 8,
                conversionRate: 9.4,
              },
            },
            {
              id: "variant-c",
              name: "Automated Process",
              isControl: false,
              trafficPercentage: 50,
              metrics: {
                impressions: 1500,
                clicks: 92,
                conversions: 12,
                conversionRate: 13.0,
                improvement: 38.3,
              },
            },
          ],
        },
      ];

      setTests(mockTests);
    } catch (error) {
      console.error("Error loading tests:", error);
    }
  };

  const loadSchedulerMetrics = async () => {
    try {
      const metrics = scheduler.getMetrics();
      setSchedulerMetrics(metrics);
    } catch (error) {
      console.error("Error loading scheduler metrics:", error);
    }
  };

  const toggleTest = async (
    testId: string,
    action: "start" | "pause" | "stop"
  ) => {
    try {
      setTests(
        tests.map(test =>
          test.id === testId
            ? {
                ...test,
                status:
                  action === "start"
                    ? "running"
                    : action === "pause"
                      ? "paused"
                      : "completed",
              }
            : test
        )
      );
    } catch (error) {
      console.error(`Error ${action}ing test:`, error);
    }
  };

  const forceEvaluation = async (testId: string) => {
    try {
      const response = await fetch(
        "/api/ab-testing/automatic-winner-selection",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            test_id: testId,
            force_evaluation: true,
          }),
        }
      );

      if (response.ok) {
        await loadTests();
      }
    } catch (error) {
      console.error("Error forcing evaluation:", error);
    }
  };

  const toggleAutoWinner = async (testId: string, enabled: boolean) => {
    try {
      setTests(
        tests.map(test =>
          test.id === testId ? { ...test, autoWinnerEnabled: enabled } : test
        )
      );
    } catch (error) {
      console.error("Error toggling auto winner:", error);
    }
  };

  const updateSchedulerConfig = async (newConfig: Partial<SchedulerConfig>) => {
    try {
      scheduler.updateConfig(newConfig);
      setShowConfigDialog(false);
    } catch (error) {
      console.error("Error updating scheduler config:", error);
    }
  };

  const getStatusBadge = (status: ABTest["status"]) => {
    const statusConfig = {
      draft: { color: "gray", label: "Draft" },
      running: { color: "blue", label: "Running" },
      paused: { color: "yellow", label: "Paused" },
      completed: { color: "green", label: "Completed" },
      cancelled: { color: "red", label: "Cancelled" },
    };

    const config = statusConfig[status];
    return (
      <Badge
        variant="secondary"
        className={`bg-${config.color}-100 text-${config.color}-800`}
      >
        {config.label}
      </Badge>
    );
  };

  const getTestTypeIcon = (type: ABTest["type"]) => {
    switch (type) {
      case "content":
        return <Target className="h-4 w-4" />;
      case "workflow":
        return <Activity className="h-4 w-4" />;
      case "campaign":
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  // Calculate overview stats
  const overviewStats = {
    totalTests: tests.length,
    runningTests: tests.filter(t => t.status === "running").length,
    completedTests: tests.filter(t => t.status === "completed").length,
    autoWinnerEnabled: tests.filter(t => t.autoWinnerEnabled).length,
    recentWinners: tests.filter(t => t.winnerVariantId).slice(0, 5),
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            A/B Testing Control Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and monitor automatic winner selection across all A/B tests
          </p>
        </div>
        <div className="flex space-x-2">
          <NormalButton
            variant="outline"
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </NormalButton>
          <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
            <DialogTrigger asChild>
              <NormalButton variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </NormalButton>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Scheduler Configuration</DialogTitle>
                <DialogDescription>
                  Configure automatic winner selection settings
                </DialogDescription>
              </DialogHeader>
              <SchedulerConfigForm
                onSave={updateSchedulerConfig}
                currentConfig={schedulerConfig}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Tests
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {overviewStats.totalTests}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Running Tests
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {overviewStats.runningTests}
                </p>
              </div>
              <PlayCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Auto Winner Enabled
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {overviewStats.autoWinnerEnabled}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Winners Selected
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {schedulerMetrics?.winnersSelectedToday || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tests">Active Tests</TabsTrigger>
          <TabsTrigger value="scheduler">Scheduler</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Test Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Running",
                          value: overviewStats.runningTests,
                          color: COLORS[0],
                        },
                        {
                          name: "Completed",
                          value: overviewStats.completedTests,
                          color: COLORS[1],
                        },
                        {
                          name: "Other",
                          value:
                            overviewStats.totalTests -
                            overviewStats.runningTests -
                            overviewStats.completedTests,
                          color: COLORS[2],
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {tests.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Winners */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Winners</CardTitle>
                <CardDescription>
                  Recently concluded tests with automatic winner selection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overviewStats.recentWinners.map(test => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getTestTypeIcon(test.type)}
                        <div>
                          <p className="font-medium text-sm">{test.name}</p>
                          <p className="text-xs text-gray-500">
                            Winner:{" "}
                            {
                              test.variants.find(
                                v => v.id === test.winnerVariantId
                              )?.name
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">
                          +{test.improvement?.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">
                          {test.confidence}% confidence
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active A/B Tests</CardTitle>
              <CardDescription>
                Manage individual tests and their automatic winner selection
                settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Auto Winner</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map(test => (
                    <TableRow key={test.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{test.name}</p>
                          <p className="text-sm text-gray-500">
                            {test.targetAudience}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTestTypeIcon(test.type)}
                          <span className="capitalize">{test.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(test.status)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={test.autoWinnerEnabled}
                          onCheckedChange={checked =>
                            toggleAutoWinner(test.id, checked)
                          }
                          disabled={test.status === "completed"}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Sample Size</span>
                            <span>{test.sampleSize.toLocaleString()}</span>
                          </div>
                          <Progress
                            value={
                              (test.variants.reduce(
                                (sum, v) => sum + v.metrics.impressions,
                                0
                              ) /
                                test.sampleSize) *
                              100
                            }
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <NormalButton variant="ghost" size="sm">
                              <ChevronDown className="h-4 w-4" />
                            </NormalButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setSelectedTest(test)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {test.status === "running" && (
                              <DropdownMenuItem
                                onClick={() => forceEvaluation(test.id)}
                              >
                                <Timer className="h-4 w-4 mr-2" />
                                Force Evaluation
                              </DropdownMenuItem>
                            )}
                            {test.status === "running" ? (
                              <DropdownMenuItem
                                onClick={() => toggleTest(test.id, "pause")}
                              >
                                <PauseCircle className="h-4 w-4 mr-2" />
                                Pause Test
                              </DropdownMenuItem>
                            ) : test.status === "paused" ? (
                              <DropdownMenuItem
                                onClick={() => toggleTest(test.id, "start")}
                              >
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Resume Test
                              </DropdownMenuItem>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduler" className="space-y-4">
          <SchedulerDashboard
            scheduler={scheduler}
            metrics={schedulerMetrics}
            onConfigUpdate={updateSchedulerConfig}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsDashboard tests={tests} />
        </TabsContent>
      </Tabs>

      {/* Test Details Dialog */}
      {selectedTest && (
        <TestDetailsDialog
          test={selectedTest}
          open={!!selectedTest}
          onClose={() => setSelectedTest(null)}
        />
      )}
    </div>
  );
}

// Sub-components
function SchedulerConfigForm({
  onSave,
  currentConfig,
}: {
  onSave: (config: Partial<SchedulerConfig>) => void;
  currentConfig: SchedulerConfig | null;
}) {
  const [config, setConfig] = useState({
    enabled: currentConfig?.enabled ?? true,
    checkInterval: currentConfig?.checkInterval ?? 30,
    maxConcurrentEvaluations: currentConfig?.maxConcurrentEvaluations ?? 5,
    minimumConfidence: currentConfig?.defaultCriteria.minimumConfidence ?? 95,
    minimumImprovement: currentConfig?.defaultCriteria.minimumImprovement ?? 5,
    riskTolerance: currentConfig?.defaultCriteria.riskTolerance ?? "moderate",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="enabled"
          checked={config.enabled}
          onCheckedChange={checked =>
            setConfig({ ...config, enabled: checked })
          }
        />
        <Label htmlFor="enabled">Enable Automatic Scheduler</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="interval">Check Interval (minutes)</Label>
        <Input
          id="interval"
          type="number"
          value={config.checkInterval}
          onChange={e =>
            setConfig({ ...config, checkInterval: parseInt(e.target.value) })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="concurrent">Max Concurrent Evaluations</Label>
        <Input
          id="concurrent"
          type="number"
          value={config.maxConcurrentEvaluations}
          onChange={e =>
            setConfig({
              ...config,
              maxConcurrentEvaluations: parseInt(e.target.value),
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confidence">Minimum Confidence (%)</Label>
        <Input
          id="confidence"
          type="number"
          value={config.minimumConfidence}
          onChange={e =>
            setConfig({
              ...config,
              minimumConfidence: parseInt(e.target.value),
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="improvement">Minimum Improvement (%)</Label>
        <Input
          id="improvement"
          type="number"
          value={config.minimumImprovement}
          onChange={e =>
            setConfig({
              ...config,
              minimumImprovement: parseInt(e.target.value),
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="risk">Risk Tolerance</Label>
        <Select
          value={config.riskTolerance}
          onValueChange={value =>
            setConfig({ ...config, riskTolerance: value as any })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select risk tolerance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="conservative">Conservative</SelectItem>
            <SelectItem value="moderate">Moderate</SelectItem>
            <SelectItem value="aggressive">Aggressive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <NormalButton onClick={() => onSave(config)} className="w-full">
        Save Configuration
      </NormalButton>
    </div>
  );
}

function SchedulerDashboard({
  scheduler,
  metrics,
  onConfigUpdate,
}: {
  scheduler: AutomaticWinnerScheduler;
  metrics: SchedulerMetrics | null;
  onConfigUpdate: (config: Partial<SchedulerConfig>) => void;
}) {
  const [isSchedulerRunning, setIsSchedulerRunning] = useState(false);

  const toggleScheduler = () => {
    if (isSchedulerRunning) {
      scheduler.stop();
    } else {
      scheduler.start();
    }
    setIsSchedulerRunning(!isSchedulerRunning);
  };

  const forceRun = async () => {
    await scheduler.forceRun();
  };

  return (
    <div className="space-y-6">
      {/* Scheduler Control */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduler Control</CardTitle>
          <CardDescription>
            Manage the automatic winner selection scheduler
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <NormalButton
                onClick={toggleScheduler}
                variant={isSchedulerRunning ? "destructive" : "default"}
              >
                {isSchedulerRunning ? (
                  <>
                    <PauseCircle className="h-4 w-4 mr-2" />
                    Stop Scheduler
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Start Scheduler
                  </>
                )}
              </NormalButton>
              <NormalButton variant="outline" onClick={forceRun}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Force Run
              </NormalButton>
            </div>
            <Badge variant={isSchedulerRunning ? "default" : "secondary"}>
              {isSchedulerRunning ? "Running" : "Stopped"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Scheduler Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Tests Monitored
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metrics.totalTestsMonitored}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Evaluated Today
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {metrics.testsEvaluatedToday}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Winners Selected
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {metrics.winnersSelectedToday}
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Success Rate
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {metrics.successRate.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function AnalyticsDashboard({ tests }: { tests: ABTest[] }) {
  // Analytics implementation would go here
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Dashboard</CardTitle>
        <CardDescription>
          Performance insights and trends for A/B testing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">
          Analytics dashboard implementation coming soon...
        </p>
      </CardContent>
    </Card>
  );
}

function TestDetailsDialog({
  test,
  open,
  onClose,
}: {
  test: ABTest;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{test.name}</DialogTitle>
          <DialogDescription>
            Detailed test information and metrics
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Test details implementation would go here */}
          <p>Test details for {test.name}...</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
