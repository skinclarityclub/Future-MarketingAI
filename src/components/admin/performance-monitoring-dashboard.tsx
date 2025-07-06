"use client";

import React, { useState, useEffect } from "react";
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
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Cpu,
  HardDrive,
  Zap,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Play,
  Square,
  BarChart3,
  Download,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

interface PerformanceMetric {
  timestamp: string;
  responseTime: number;
  throughput: number;
  cpuUsage: number;
  memoryUsage: number;
  errorRate: number;
  activeUsers: number;
}

interface LoadTestResult {
  testName: string;
  duration: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  cpuUsageAverage: number;
  memoryUsageAverage: number;
  bottlenecks: string[];
  recommendations: string[];
  timestamp: string;
}

export default function PerformanceMonitoringDashboard() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isLoadTesting, setIsLoadTesting] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loadTestResults, setLoadTestResults] = useState<LoadTestResult[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetric>({
    timestamp: new Date().toISOString(),
    responseTime: 0,
    throughput: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    errorRate: 0,
    activeUsers: 0,
  });

  // Simulate real-time metrics collection
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isMonitoring) {
      interval = setInterval(() => {
        const newMetric: PerformanceMetric = {
          timestamp: new Date().toISOString(),
          responseTime: Math.random() * 800 + 200, // 200-1000ms
          throughput: Math.random() * 50 + 20, // 20-70 req/s
          cpuUsage: Math.random() * 30 + 20, // 20-50%
          memoryUsage: Math.random() * 25 + 40, // 40-65%
          errorRate: Math.random() * 2, // 0-2%
          activeUsers: Math.floor(Math.random() * 100 + 10), // 10-110 users
        };

        setCurrentMetrics(newMetric);
        setMetrics(prev => {
          const updated = [...prev, newMetric];
          return updated.slice(-50); // Keep last 50 data points
        });
      }, 2000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isMonitoring]);

  // Start/stop performance monitoring
  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    if (!isMonitoring) {
      setMetrics([]);
    }
  };

  // Run load test simulation
  const runLoadTest = async (testType: "basic" | "stress" | "spike") => {
    setIsLoadTesting(true);

    // Simulate test execution time
    await new Promise(resolve => setTimeout(resolve, 5000));

    const testConfigs = {
      basic: { users: 10, duration: 30, name: "Basic Load Test" },
      stress: { users: 50, duration: 60, name: "Stress Test" },
      spike: { users: 100, duration: 30, name: "Spike Test" },
    };

    const config = testConfigs[testType];

    // Simulate test results
    const mockResult: LoadTestResult = {
      testName: config.name,
      duration: config.duration,
      totalRequests: config.users * config.duration * (2 + Math.random()),
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: Math.random() * 500 + 300,
      minResponseTime: Math.random() * 100 + 50,
      maxResponseTime: Math.random() * 800 + 800,
      requestsPerSecond: config.users * (1.5 + Math.random()),
      errorRate: Math.random() * 5,
      cpuUsageAverage: Math.random() * 40 + 30,
      memoryUsageAverage: Math.random() * 30 + 50,
      bottlenecks: [],
      recommendations: [],
      timestamp: new Date().toISOString(),
    };

    mockResult.successfulRequests = Math.floor(
      mockResult.totalRequests * (1 - mockResult.errorRate / 100)
    );
    mockResult.failedRequests =
      mockResult.totalRequests - mockResult.successfulRequests;

    // Add bottlenecks based on metrics
    if (mockResult.averageResponseTime > 600) {
      mockResult.bottlenecks.push("High response times detected");
      mockResult.recommendations.push("Implement caching strategies");
    }
    if (mockResult.errorRate > 3) {
      mockResult.bottlenecks.push("High error rate detected");
      mockResult.recommendations.push("Improve error handling");
    }
    if (mockResult.cpuUsageAverage > 60) {
      mockResult.bottlenecks.push("High CPU usage detected");
      mockResult.recommendations.push("Optimize CPU-intensive operations");
    }

    // General recommendations
    mockResult.recommendations.push("Implement performance monitoring");
    mockResult.recommendations.push("Set up automated alerting");

    setLoadTestResults(prev => [mockResult, ...prev].slice(0, 10));
    setIsLoadTesting(false);
  };

  // Get status color based on value
  const getStatusColor = (
    value: number,
    thresholds: { good: number; warning: number }
  ) => {
    if (value <= thresholds.good) return "text-green-600";
    if (value <= thresholds.warning) return "text-yellow-600";
    return "text-red-600";
  };

  // Get metric status
  const getMetricStatus = (
    value: number,
    thresholds: { good: number; warning: number }
  ) => {
    if (value <= thresholds.good) return "good";
    if (value <= thresholds.warning) return "warning";
    return "critical";
  };

  // Export test results
  const exportResults = () => {
    const data = {
      metrics: metrics,
      loadTestResults: loadTestResults,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `performance-data-${new Date().toISOString().split("T")[0]}.json`;

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
            <Activity className="h-5 w-5" />
            Performance Monitoring Dashboard
          </CardTitle>
          <CardDescription>
            Real-time performance monitoring and load testing for the BI
            Dashboard system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <NormalButton
              onClick={toggleMonitoring}
              variant={isMonitoring ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {isMonitoring ? (
                <Square className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
            </NormalButton>

            <NormalButton
              onClick={() => runLoadTest("basic")}
              disabled={isLoadTesting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              {isLoadTesting ? "Running..." : "Basic Load Test"}
            </NormalButton>

            <NormalButton
              onClick={() => runLoadTest("stress")}
              disabled={isLoadTesting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              {isLoadTesting ? "Running..." : "Stress Test"}
            </NormalButton>

            <NormalButton
              onClick={() => runLoadTest("spike")}
              disabled={isLoadTesting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              {isLoadTesting ? "Running..." : "Spike Test"}
            </NormalButton>

            {(metrics.length > 0 || loadTestResults.length > 0) && (
              <NormalButton
                onClick={exportResults}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Data
              </NormalButton>
            )}
          </div>

          <Tabs defaultValue="realtime" className="space-y-4">
            <TabsList>
              <TabsTrigger value="realtime">Real-time Metrics</TabsTrigger>
              <TabsTrigger value="loadtest">Load Test Results</TabsTrigger>
              <TabsTrigger value="analysis">Performance Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="realtime" className="space-y-4">
              {/* Current Metrics Overview */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Response Time</p>
                        <p
                          className={`text-lg font-bold ${getStatusColor(currentMetrics.responseTime, { good: 500, warning: 1000 })}`}
                        >
                          {currentMetrics.responseTime.toFixed(0)}ms
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Throughput</p>
                        <p
                          className={`text-lg font-bold ${getStatusColor(70 - currentMetrics.throughput, { good: 20, warning: 40 })}`}
                        >
                          {currentMetrics.throughput.toFixed(1)} req/s
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">CPU Usage</p>
                        <p
                          className={`text-lg font-bold ${getStatusColor(currentMetrics.cpuUsage, { good: 50, warning: 80 })}`}
                        >
                          {currentMetrics.cpuUsage.toFixed(1)}%
                        </p>
                      </div>
                      <Cpu className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Memory Usage</p>
                        <p
                          className={`text-lg font-bold ${getStatusColor(currentMetrics.memoryUsage, { good: 60, warning: 80 })}`}
                        >
                          {currentMetrics.memoryUsage.toFixed(1)}%
                        </p>
                      </div>
                      <HardDrive className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Error Rate</p>
                        <p
                          className={`text-lg font-bold ${getStatusColor(currentMetrics.errorRate, { good: 1, warning: 3 })}`}
                        >
                          {currentMetrics.errorRate.toFixed(2)}%
                        </p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Active Users</p>
                        <p className="text-lg font-bold text-blue-600">
                          {currentMetrics.activeUsers}
                        </p>
                      </div>
                      <Activity className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Real-time Charts */}
              {metrics.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Response Time & Throughput</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={metrics}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="timestamp"
                            tickFormatter={time =>
                              new Date(time).toLocaleTimeString()
                            }
                          />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip
                            labelFormatter={time =>
                              new Date(time as string).toLocaleString()
                            }
                          />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="responseTime"
                            stroke="#8884d8"
                            name="Response Time (ms)"
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="throughput"
                            stroke="#82ca9d"
                            name="Throughput (req/s)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>System Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={metrics}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="timestamp"
                            tickFormatter={time =>
                              new Date(time).toLocaleTimeString()
                            }
                          />
                          <YAxis />
                          <Tooltip
                            labelFormatter={time =>
                              new Date(time as string).toLocaleString()
                            }
                          />
                          <Area
                            type="monotone"
                            dataKey="cpuUsage"
                            stackId="1"
                            stroke="#8884d8"
                            fill="#8884d8"
                            name="CPU Usage (%)"
                          />
                          <Area
                            type="monotone"
                            dataKey="memoryUsage"
                            stackId="1"
                            stroke="#82ca9d"
                            fill="#82ca9d"
                            name="Memory Usage (%)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              )}

              {!isMonitoring && metrics.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Monitoring Data
                    </h3>
                    <p className="text-muted-foreground">
                      Start monitoring to view real-time performance metrics
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="loadtest" className="space-y-4">
              {loadTestResults.length > 0 ? (
                <div className="space-y-4">
                  {loadTestResults.map((result, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{result.testName}</span>
                          <Badge variant="outline">
                            {new Date(result.timestamp).toLocaleString()}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Total Requests
                            </p>
                            <p className="text-lg font-semibold">
                              {result.totalRequests}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Success Rate
                            </p>
                            <p className="text-lg font-semibold text-green-600">
                              {(
                                (result.successfulRequests /
                                  result.totalRequests) *
                                100
                              ).toFixed(1)}
                              %
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Avg Response Time
                            </p>
                            <p className="text-lg font-semibold">
                              {result.averageResponseTime.toFixed(0)}ms
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Throughput
                            </p>
                            <p className="text-lg font-semibold">
                              {result.requestsPerSecond.toFixed(1)} req/s
                            </p>
                          </div>
                        </div>

                        {result.bottlenecks.length > 0 && (
                          <Alert className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Bottlenecks Identified</AlertTitle>
                            <AlertDescription>
                              <ul className="list-disc pl-4 mt-2">
                                {result.bottlenecks.map((bottleneck, i) => (
                                  <li key={i}>{bottleneck}</li>
                                ))}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}

                        {result.recommendations.length > 0 && (
                          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md">
                            <h4 className="font-medium mb-2">
                              💡 Recommendations:
                            </h4>
                            <ul className="text-sm space-y-1">
                              {result.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span>•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Load Test Results
                    </h3>
                    <p className="text-muted-foreground">
                      Run load tests to analyze system performance under
                      different conditions
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analysis</CardTitle>
                  <CardDescription>
                    System health overview and optimization recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">
                        System Health Status
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Response Time</span>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={Math.min(
                                (1000 - currentMetrics.responseTime) / 10,
                                100
                              )}
                              className="w-20"
                            />
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Throughput</span>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={Math.min(
                                currentMetrics.throughput * 2,
                                100
                              )}
                              className="w-20"
                            />
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Resource Usage</span>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={Math.min(
                                currentMetrics.cpuUsage +
                                  currentMetrics.memoryUsage,
                                100
                              )}
                              className="w-20"
                            />
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Error Rate</span>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={Math.max(
                                100 - currentMetrics.errorRate * 20,
                                0
                              )}
                              className="w-20"
                            />
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">
                        Optimization Recommendations
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span>•</span>
                          <span>
                            Implement Redis caching for frequently accessed data
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span>•</span>
                          <span>
                            Optimize database queries with proper indexing
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span>•</span>
                          <span>Enable compression for API responses</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span>•</span>
                          <span>
                            Implement connection pooling for database
                            connections
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span>•</span>
                          <span>Set up CDN for static assets</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span>•</span>
                          <span>
                            Monitor and alert on performance thresholds
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
