"use client";

/**
 * Security & Scalability Dashboard
 * Task 13.5: Ensure Scalability and Data Security
 *
 * Admin dashboard for monitoring security and scalability metrics
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Lock,
  Unlock,
  Users,
  Clock,
  BarChart3,
  Zap,
  Database,
  Cpu,
  HardDrive,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SecurityMetrics {
  activeSessions: number;
  failedAttempts: number;
  auditLogs: number;
  threatLevel: "low" | "medium" | "high";
  sessionTimeouts: number;
}

interface PerformanceMetrics {
  responseTime: number;
  errorRate: number;
  memoryUsage: number;
  cacheHitRate: number;
  throughput: number;
  activeConnections: number;
}

interface SystemHealth {
  security: SecurityMetrics;
  performance: PerformanceMetrics;
  overall: {
    status: "healthy" | "warning" | "critical";
    score: number;
    recommendations: string[];
  };
}

interface SecurityScalabilityDashboardProps {
  className?: string;
  refreshInterval?: number;
}

export function SecurityScalabilityDashboard({
  className,
  refreshInterval = 30000, // 30 seconds
}: SecurityScalabilityDashboardProps) {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data for demonstration
  const mockSystemHealth: SystemHealth = {
    security: {
      activeSessions: 42,
      failedAttempts: 3,
      auditLogs: 1247,
      threatLevel: "low",
      sessionTimeouts: 2,
    },
    performance: {
      responseTime: 245,
      errorRate: 0.012,
      memoryUsage: 0.67,
      cacheHitRate: 0.89,
      throughput: 156.7,
      activeConnections: 28,
    },
    overall: {
      status: "healthy",
      score: 94,
      recommendations: [
        "Consider increasing cache size for better performance",
        "Monitor failed login attempts trend",
      ],
    },
  };

  useEffect(() => {
    const fetchSystemHealth = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would fetch from an API
        await new Promise(resolve => setTimeout(resolve, 500));
        setSystemHealth(mockSystemHealth);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Failed to fetch system health:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSystemHealth();

    if (autoRefresh) {
      const interval = setInterval(fetchSystemHealth, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const handleRefresh = () => {
    setSystemHealth(null);
    setIsLoading(true);
    // Trigger refresh
    setTimeout(() => {
      setSystemHealth(mockSystemHealth);
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 500);
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "critical":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatNumber = (num: number, decimals = 0) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(decimals);
  };

  const formatPercentage = (num: number) => `${(num * 100).toFixed(1)}%`;

  if (isLoading && !systemHealth) {
    return (
      <div className={cn("w-full", className)}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading system health...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!systemHealth) {
    return (
      <div className={cn("w-full", className)}>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              Failed to load system health data
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Security & Scalability Dashboard
          </h2>
          <p className="text-gray-600">
            Monitor system health, security metrics, and performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NormalButton
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(autoRefresh && "bg-green-50 border-green-200")}
          >
            {autoRefresh ? (
              <Unlock className="h-4 w-4" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            Auto Refresh
          </NormalButton>
          <NormalButton
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </NormalButton>
        </div>
      </div>

      {/* Overall Status */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getStatusIcon(systemHealth.overall.status)}
              <div>
                <h3 className="text-lg font-semibold capitalize">
                  System Status: {systemHealth.overall.status}
                </h3>
                <p className="text-gray-600">
                  Overall health score: {systemHealth.overall.score}/100
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {systemHealth.overall.score}
              </div>
              <Progress
                value={systemHealth.overall.score}
                className="w-24 mt-2"
              />
            </div>
          </div>

          {lastUpdated && (
            <div className="mt-4 text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metrics Tabs */}
      <Tabs defaultValue="security" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger
            value="recommendations"
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Sessions</p>
                    <p className="text-2xl font-bold">
                      {systemHealth.security.activeSessions}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Failed Attempts</p>
                    <p className="text-2xl font-bold text-red-600">
                      {systemHealth.security.failedAttempts}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Audit Logs</p>
                    <p className="text-2xl font-bold">
                      {formatNumber(systemHealth.security.auditLogs)}
                    </p>
                  </div>
                  <Database className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Threat Level</p>
                    <Badge
                      className={cn(
                        "mt-1",
                        getThreatLevelColor(systemHealth.security.threatLevel)
                      )}
                    >
                      {systemHealth.security.threatLevel.toUpperCase()}
                    </Badge>
                  </div>
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Session Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Session Timeouts
                  </span>
                  <span className="font-medium">
                    {systemHealth.security.sessionTimeouts}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Average Session Duration
                  </span>
                  <span className="font-medium">2h 34m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Peak Concurrent Sessions
                  </span>
                  <span className="font-medium">67</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Response Time</p>
                    <p className="text-2xl font-bold">
                      {systemHealth.performance.responseTime}ms
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-600" />
                </div>
                <Progress
                  value={(2000 - systemHealth.performance.responseTime) / 20}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Error Rate</p>
                    <p className="text-2xl font-bold">
                      {formatPercentage(systemHealth.performance.errorRate)}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <Progress
                  value={systemHealth.performance.errorRate * 2000}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Memory Usage</p>
                    <p className="text-2xl font-bold">
                      {formatPercentage(systemHealth.performance.memoryUsage)}
                    </p>
                  </div>
                  <Cpu className="h-8 w-8 text-blue-600" />
                </div>
                <Progress
                  value={systemHealth.performance.memoryUsage * 100}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Cache Hit Rate</p>
                    <p className="text-2xl font-bold">
                      {formatPercentage(systemHealth.performance.cacheHitRate)}
                    </p>
                  </div>
                  <HardDrive className="h-8 w-8 text-green-600" />
                </div>
                <Progress
                  value={systemHealth.performance.cacheHitRate * 100}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Throughput</p>
                    <p className="text-2xl font-bold">
                      {formatNumber(systemHealth.performance.throughput, 1)}/s
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Connections</p>
                    <p className="text-2xl font-bold">
                      {systemHealth.performance.activeConnections}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                System Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemHealth.overall.recommendations.map(
                  (recommendation, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800">{recommendation}</p>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Security Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Low threat level maintained</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">
                      Monitor failed attempts trend
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Session management optimal</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">
                      Response times within target
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">High cache efficiency</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">
                      Memory usage approaching threshold
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
