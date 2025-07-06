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
import {
  PlayCircle,
  PauseCircle,
  Trophy,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  Activity,
  RefreshCw,
  Settings,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface ABTest {
  id: string;
  name: string;
  status: "running" | "concluded" | "implementing";
  startTime: Date;
  endTime?: Date;
  variants: TestVariant[];
  metrics: TestMetrics;
  winnerDeclared: boolean;
  winnerVariantId?: string;
  confidence?: number;
  improvement?: number;
  implementationProgress: number;
  autoWinnerEnabled: boolean;
}

interface TestVariant {
  id: string;
  name: string;
  isControl: boolean;
  trafficPercentage: number;
  conversions: number;
  visitors: number;
  conversionRate: number;
  improvement?: number;
  confidence?: number;
}

interface TestMetrics {
  totalVisitors: number;
  totalConversions: number;
  averageConversionRate: number;
  statisticalSignificance: number;
  pValue: number;
  effectSize: number;
}

export function ABTestingAutomaticWinnerDemo() {
  const [activeTest, setActiveTest] = useState<ABTest | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [showRealTimeUpdates, setShowRealTimeUpdates] = useState(true);
  const [performanceData, setPerformanceData] = useState<any[]>([]);

  // Initialize with demo test
  useEffect(() => {
    const demoTest: ABTest = {
      id: "demo-test-001",
      name: "Email Subject Line A/B Test",
      status: "running",
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // Started 2 hours ago
      variants: [
        {
          id: "control",
          name: "Control: Weekly Newsletter",
          isControl: true,
          trafficPercentage: 50,
          conversions: 125,
          visitors: 1200,
          conversionRate: 10.42,
        },
        {
          id: "variant-a",
          name: "🚀 This Week's Game-Changing Updates",
          isControl: false,
          trafficPercentage: 50,
          conversions: 165,
          visitors: 1250,
          conversionRate: 13.2,
          improvement: 26.67,
          confidence: 92.5,
        },
      ],
      metrics: {
        totalVisitors: 2450,
        totalConversions: 290,
        averageConversionRate: 11.84,
        statisticalSignificance: 92.5,
        pValue: 0.075,
        effectSize: 0.28,
      },
      winnerDeclared: false,
      implementationProgress: 0,
      autoWinnerEnabled: true,
    };

    setActiveTest(demoTest);
    generatePerformanceData(demoTest);
  }, []);

  // Simulation effect
  useEffect(() => {
    if (!isSimulating || !activeTest) return;

    const interval = setInterval(() => {
      setActiveTest(currentTest => {
        if (!currentTest) return null;

        const newTest = { ...currentTest };

        // Simulate new visitors and conversions
        const newVisitorsControl = Math.floor(Math.random() * 20) + 5;
        const newVisitorsVariant = Math.floor(Math.random() * 20) + 5;

        // Variant A performs better
        const controlConversionRate = 0.1 + Math.random() * 0.02;
        const variantConversionRate = 0.13 + Math.random() * 0.03;

        const newConversionsControl = Math.floor(
          newVisitorsControl * controlConversionRate
        );
        const newConversionsVariant = Math.floor(
          newVisitorsVariant * variantConversionRate
        );

        // Update control
        newTest.variants[0].visitors += newVisitorsControl;
        newTest.variants[0].conversions += newConversionsControl;
        newTest.variants[0].conversionRate =
          (newTest.variants[0].conversions / newTest.variants[0].visitors) *
          100;

        // Update variant
        newTest.variants[1].visitors += newVisitorsVariant;
        newTest.variants[1].conversions += newConversionsVariant;
        newTest.variants[1].conversionRate =
          (newTest.variants[1].conversions / newTest.variants[1].visitors) *
          100;

        // Calculate improvement
        const improvement =
          ((newTest.variants[1].conversionRate -
            newTest.variants[0].conversionRate) /
            newTest.variants[0].conversionRate) *
          100;
        newTest.variants[1].improvement = improvement;

        // Update metrics
        newTest.metrics.totalVisitors =
          newTest.variants[0].visitors + newTest.variants[1].visitors;
        newTest.metrics.totalConversions =
          newTest.variants[0].conversions + newTest.variants[1].conversions;
        newTest.metrics.averageConversionRate =
          (newTest.metrics.totalConversions / newTest.metrics.totalVisitors) *
          100;

        // Simulate increasing statistical significance
        if (newTest.metrics.totalVisitors > 500) {
          newTest.metrics.statisticalSignificance = Math.min(
            99.8,
            newTest.metrics.statisticalSignificance + 0.5
          );
          newTest.metrics.pValue = Math.max(
            0.001,
            newTest.metrics.pValue - 0.002
          );
          newTest.variants[1].confidence =
            newTest.metrics.statisticalSignificance;
        }

        // Auto declare winner when significance reaches 95%
        if (
          newTest.metrics.statisticalSignificance >= 95 &&
          !newTest.winnerDeclared &&
          newTest.autoWinnerEnabled
        ) {
          newTest.winnerDeclared = true;
          newTest.winnerVariantId = "variant-a";
          newTest.confidence = newTest.metrics.statisticalSignificance;
          newTest.improvement = improvement;
          newTest.status = "concluded";

          // Start implementation simulation
          setTimeout(() => {
            simulateImplementation(newTest.id);
          }, 2000);
        }

        return newTest;
      });

      // Update performance data
      if (activeTest) {
        generatePerformanceData(activeTest);
      }
    }, 2000 / simulationSpeed);

    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed, activeTest]);

  const simulateImplementation = (testId: string) => {
    setActiveTest(currentTest => {
      if (!currentTest || currentTest.id !== testId) return currentTest;
      return { ...currentTest, status: "implementing" };
    });

    // Simulate gradual implementation
    let progress = 0;
    const implementationInterval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(implementationInterval);
      }

      setActiveTest(currentTest => {
        if (!currentTest) return null;
        return { ...currentTest, implementationProgress: progress };
      });
    }, 1000);
  };

  const generatePerformanceData = (test: ABTest) => {
    const now = new Date();
    const data = [];

    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 5 * 60 * 1000); // Every 5 minutes
      data.push({
        time: time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        control: test.variants[0].conversionRate + (Math.random() - 0.5) * 2,
        variant: test.variants[1].conversionRate + (Math.random() - 0.5) * 2,
        visitors: Math.floor(Math.random() * 50) + 20,
      });
    }

    setPerformanceData(data);
  };

  const startSimulation = () => {
    setIsSimulating(true);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
  };

  const resetTest = () => {
    setIsSimulating(false);
    // Reset test to initial state
    setActiveTest(currentTest => {
      if (!currentTest) return null;
      return {
        ...currentTest,
        status: "running",
        variants: [
          {
            ...currentTest.variants[0],
            conversions: 125,
            visitors: 1200,
            conversionRate: 10.42,
          },
          {
            ...currentTest.variants[1],
            conversions: 165,
            visitors: 1250,
            conversionRate: 13.2,
            improvement: 26.67,
            confidence: 92.5,
          },
        ],
        metrics: {
          totalVisitors: 2450,
          totalConversions: 290,
          averageConversionRate: 11.84,
          statisticalSignificance: 92.5,
          pValue: 0.075,
          effectSize: 0.28,
        },
        winnerDeclared: false,
        implementationProgress: 0,
      };
    });
  };

  if (!activeTest) {
    return <div>Loading...</div>;
  }

  const getStatusBadge = (status: ABTest["status"]) => {
    switch (status) {
      case "running":
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      case "concluded":
        return (
          <Badge className="bg-green-100 text-green-800">Winner Declared</Badge>
        );
      case "implementing":
        return (
          <Badge className="bg-purple-100 text-purple-800">Implementing</Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{activeTest.name}</CardTitle>
              <CardDescription>
                Live demonstration of automatic winner selection
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(activeTest.status)}
              {activeTest.autoWinnerEnabled && (
                <Badge
                  variant="outline"
                  className="text-orange-600 border-orange-600"
                >
                  Auto Winner ON
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {!isSimulating ? (
                <NormalButton onClick={startSimulation}>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start Simulation
                </NormalButton>
              ) : (
                <NormalButton onClick={stopSimulation} variant="destructive">
                  <PauseCircle className="h-4 w-4 mr-2" />
                  Stop Simulation
                </NormalButton>
              )}
              <NormalButton onClick={resetTest} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Test
              </NormalButton>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Speed:</label>
              <select
                value={simulationSpeed}
                onChange={e => setSimulationSpeed(Number(e.target.value))}
                className="text-sm border rounded px-2 py-1"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={5}>5x</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Winner Declaration Alert */}
      {activeTest.winnerDeclared && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <Trophy className="h-4 w-4" />
          <AlertTitle>🎉 Winner Automatically Selected!</AlertTitle>
          <AlertDescription>
            <strong>
              {
                activeTest.variants.find(
                  v => v.id === activeTest.winnerVariantId
                )?.name
              }
            </strong>{" "}
            has been selected as the winner with{" "}
            <strong>{activeTest.confidence?.toFixed(1)}% confidence</strong> and{" "}
            <strong>{activeTest.improvement?.toFixed(1)}% improvement</strong>.
            {activeTest.status === "implementing" && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Implementation Progress:</span>
                  <span>{activeTest.implementationProgress.toFixed(0)}%</span>
                </div>
                <Progress
                  value={activeTest.implementationProgress}
                  className="mt-1"
                />
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="live-results" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="live-results">Live Results</TabsTrigger>
          <TabsTrigger value="statistical-analysis">
            Statistical Analysis
          </TabsTrigger>
          <TabsTrigger value="implementation">Implementation</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="live-results" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Variant Performance */}
            <div className="space-y-4">
              {activeTest.variants.map(variant => (
                <Card
                  key={variant.id}
                  className={
                    variant.id === activeTest.winnerVariantId
                      ? "ring-2 ring-green-500"
                      : ""
                  }
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{variant.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        {variant.isControl && (
                          <Badge variant="outline">Control</Badge>
                        )}
                        {variant.id === activeTest.winnerVariantId && (
                          <Badge className="bg-green-100 text-green-800">
                            Winner
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Visitors
                        </p>
                        <p className="text-2xl font-bold">
                          {variant.visitors.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Conversions
                        </p>
                        <p className="text-2xl font-bold">
                          {variant.conversions.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Conversion Rate
                        </p>
                        <p className="text-2xl font-bold">
                          {variant.conversionRate.toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {variant.isControl ? "Traffic" : "Improvement"}
                        </p>
                        <p
                          className={`text-2xl font-bold ${!variant.isControl && variant.improvement ? (variant.improvement > 0 ? "text-green-600" : "text-red-600") : ""}`}
                        >
                          {variant.isControl
                            ? `${variant.trafficPercentage}%`
                            : variant.improvement
                              ? `+${variant.improvement.toFixed(1)}%`
                              : "—"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Real-time Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Real-time Performance</CardTitle>
                <CardDescription>Conversion rate over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="control"
                      stroke="#6b7280"
                      strokeWidth={2}
                      name="Control"
                    />
                    <Line
                      type="monotone"
                      dataKey="variant"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Variant A"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="statistical-analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Statistical Significance</CardTitle>
                <CardDescription>
                  Progress towards automatic winner selection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Statistical Significance</span>
                      <span>
                        {activeTest.metrics.statisticalSignificance.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={activeTest.metrics.statisticalSignificance}
                      className="h-3"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Target: 95% (Auto winner selection threshold)
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        P-Value
                      </p>
                      <p className="text-lg font-bold">
                        {activeTest.metrics.pValue.toFixed(3)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Effect Size
                      </p>
                      <p className="text-lg font-bold">
                        {activeTest.metrics.effectSize.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Progress</CardTitle>
                <CardDescription>
                  Sample size and duration metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Sample Size
                    </p>
                    <p className="text-2xl font-bold">
                      {activeTest.metrics.totalVisitors.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Test Duration
                    </p>
                    <p className="text-lg font-bold">
                      {Math.floor(
                        (Date.now() - activeTest.startTime.getTime()) /
                          (1000 * 60 * 60)
                      )}{" "}
                      hours
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Overall Conversion Rate
                    </p>
                    <p className="text-lg font-bold">
                      {activeTest.metrics.averageConversionRate.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="implementation" className="space-y-4">
          <ImplementationTab test={activeTest} />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <MonitoringTab test={activeTest} isSimulating={isSimulating} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Sub-components
function ImplementationTab({ test }: { test: ABTest }) {
  const implementations = [
    { name: "Email Templates", status: "pending", progress: 0 },
    { name: "Landing Pages", status: "pending", progress: 0 },
    { name: "Social Media", status: "pending", progress: 0 },
    { name: "n8n Workflows", status: "pending", progress: 0 },
    { name: "Analytics Tracking", status: "pending", progress: 0 },
  ];

  if (test.status === "implementing") {
    implementations.forEach((impl, index) => {
      if (test.implementationProgress > index * 20) {
        impl.status = "completed";
        impl.progress = 100;
      } else if (test.implementationProgress > (index - 1) * 20) {
        impl.status = "in-progress";
        impl.progress = Math.min(
          100,
          (test.implementationProgress - (index - 1) * 20) * 5
        );
      }
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Implementation Strategy: Gradual Rollout</CardTitle>
          <CardDescription>
            Automatic implementation across all integrated systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {implementations.map((impl, index) => (
              <div
                key={impl.name}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {impl.status === "completed" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : impl.status === "in-progress" ? (
                    <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                  <span className="font-medium">{impl.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  {impl.status === "in-progress" && (
                    <div className="w-20">
                      <Progress value={impl.progress} className="h-2" />
                    </div>
                  )}
                  <Badge
                    variant={
                      impl.status === "completed"
                        ? "default"
                        : impl.status === "in-progress"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {impl.status === "completed"
                      ? "Done"
                      : impl.status === "in-progress"
                        ? "Running"
                        : "Pending"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MonitoringTab({
  test,
  isSimulating,
}: {
  test: ABTest;
  isSimulating: boolean;
}) {
  const events = [
    {
      time: "2 hours ago",
      type: "info",
      message: "A/B test started with automatic winner selection enabled",
    },
    {
      time: "1.5 hours ago",
      type: "success",
      message: "Statistical significance reached 90% threshold",
    },
    {
      time: "1 hour ago",
      type: "warning",
      message: "Variant A showing strong performance (+26% improvement)",
    },
    {
      time: "45 minutes ago",
      type: "success",
      message: "P-value dropped below 0.1 (statistical significance: 92%)",
    },
  ];

  if (test.winnerDeclared) {
    events.unshift({
      time: "Just now",
      type: "success",
      message: `Winner automatically selected: ${test.variants.find(v => v.id === test.winnerVariantId)?.name}`,
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Real-time monitoring status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Automatic Scheduler</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Statistical Engine</span>
                <Badge className="bg-green-100 text-green-800">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Integration Service</span>
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Data Collection</span>
                <Badge
                  className={
                    isSimulating
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  {isSimulating ? "Active" : "Paused"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Log</CardTitle>
            <CardDescription>
              Recent system events and decisions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {events.map((event, index) => (
                <div key={index} className="flex items-start space-x-3 text-sm">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      event.type === "success"
                        ? "bg-green-500"
                        : event.type === "warning"
                          ? "bg-yellow-500"
                          : event.type === "error"
                            ? "bg-red-500"
                            : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white">
                      {event.message}
                    </p>
                    <p className="text-gray-500 text-xs">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
