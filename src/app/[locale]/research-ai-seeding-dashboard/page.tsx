/**
 * Research & Competitive Intelligence AI Engines - Seeding Dashboard
 * Task 75: Implementeer Data Seeding voor Research & Competitive Intelligence AI Systemen
 *
 * Dashboard voor het beheren en monitoren van data seeding operaties voor:
 * - Trend Detector
 * - Competitor Analyzer
 * - Web Scraper
 * - Content Ideation Engine
 */

"use client";

import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Play,
  Pause,
  RefreshCw,
  Database,
  TrendingUp,
  Users,
  Globe,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

interface SeedingStatus {
  status: "idle" | "running" | "completed" | "failed";
  lastSeeding?: {
    timestamp: string;
    success: boolean;
    totalRecords: number;
    qualityScore: number;
    executionTime: number;
  };
  engineStatuses: {
    [engineName: string]: {
      status: string;
      recordCount: number;
      lastUpdate: string;
      qualityScore: number;
    };
  };
  dataSourceStatuses: {
    [sourceName: string]: {
      status: "active" | "inactive" | "error";
      lastCheck: string;
      recordCount: number;
    };
  };
}

interface SeedingResult {
  success: boolean;
  data: any;
  timestamp: string;
}

const ENGINE_ICONS = {
  "Trend Detector": TrendingUp,
  "Competitor Analyzer": Users,
  "Web Scraper": Globe,
  "Content Ideation Engine": Lightbulb,
};

const ENGINE_COLORS = {
  "Trend Detector": "bg-blue-500",
  "Competitor Analyzer": "bg-green-500",
  "Web Scraper": "bg-orange-500",
  "Content Ideation Engine": "bg-purple-500",
};

export default function ResearchAISeedingDashboard() {
  const [seedingStatus, setSeedingStatus] = useState<SeedingStatus | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // Fetch seeding status
  const fetchSeedingStatus = async () => {
    try {
      const response = await fetch("/api/research-ai-seeding");
      const result: SeedingResult = await response.json();

      if (result.success) {
        // Parse the API response correctly
        const statusData = {
          status: result.data.status || "idle",
          engineStatuses: result.data.engineStatuses || {},
          dataSourceStatuses: result.data.dataSourceStatuses || {},
          lastSeeding: result.data.lastSeeding,
        };
        setSeedingStatus(statusData);
      } else {
        toast.error("Failed to fetch seeding status");
      }
    } catch (error) {
      console.error("Error fetching seeding status:", error);
      toast.error("Error fetching seeding status");
    } finally {
      setIsLoading(false);
    }
  };

  // Execute comprehensive seeding
  const executeComprehensiveSeeding = async () => {
    setIsSeeding(true);
    try {
      const response = await fetch("/api/research-ai-seeding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "comprehensive",
          options: {
            force: false,
            dryRun: false,
            qualityThreshold: 80,
          },
        }),
      });

      const result: SeedingResult = await response.json();

      if (result.success) {
        toast.success("Comprehensive seeding completed successfully!");
        await fetchSeedingStatus();
      } else {
        toast.error(
          "Seeding failed: " + (result.data?.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error executing seeding:", error);
      toast.error("Error executing seeding operation");
    } finally {
      setIsSeeding(false);
    }
  };

  // Execute individual engine seeding
  const executeIndividualSeeding = async (engineName: string) => {
    setIsSeeding(true);
    try {
      const response = await fetch("/api/research-ai-seeding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "individual",
          engineName,
          options: {
            force: false,
            dryRun: false,
            qualityThreshold: 80,
          },
        }),
      });

      const result: SeedingResult = await response.json();

      if (result.success) {
        toast.success(`${engineName} seeding completed successfully!`);
        await fetchSeedingStatus();
      } else {
        toast.error(
          `${engineName} seeding failed: ` +
            (result.data?.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error executing individual seeding:", error);
      toast.error("Error executing seeding operation");
    } finally {
      setIsSeeding(false);
    }
  };

  // Initialize and setup auto-refresh
  useEffect(() => {
    fetchSeedingStatus();

    // Setup auto-refresh every 30 seconds
    const interval = setInterval(fetchSeedingStatus, 30000);
    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
      case "completed":
        return "bg-green-500";
      case "running":
      case "in_progress":
        return "bg-blue-500";
      case "failed":
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "completed":
        return CheckCircle;
      case "running":
      case "in_progress":
        return RefreshCw;
      case "failed":
      case "error":
        return AlertCircle;
      default:
        return Clock;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Research AI Seeding Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage data seeding for competitive intelligence AI
            engines
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            onClick={fetchSeedingStatus}
            disabled={isSeeding}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isSeeding ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={executeComprehensiveSeeding}
            disabled={isSeeding || seedingStatus?.status === "running"}
          >
            <Play className="h-4 w-4 mr-2" />
            {isSeeding ? "Seeding..." : "Start Comprehensive Seeding"}
          </Button>
        </div>
      </div>

      {/* Overall Status Alert */}
      {seedingStatus?.status === "running" && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertTitle>Seeding In Progress</AlertTitle>
          <AlertDescription>
            Data seeding operation is currently running. Please wait for
            completion.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300 hover:text-white"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="engines"
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300 hover:text-white"
          >
            AI Engines
          </TabsTrigger>
          <TabsTrigger
            value="sources"
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300 hover:text-white"
          >
            Data Sources
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300 hover:text-white"
          >
            Seeding History
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Overall Status
                </CardTitle>
                <Database className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Badge
                    className={`text-white ${getStatusBadgeColor(seedingStatus?.status || "idle")}`}
                  >
                    {seedingStatus?.status || "Unknown"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Total Records
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {seedingStatus?.lastSeeding?.totalRecords?.toLocaleString() ||
                    "0"}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Quality Score
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {seedingStatus?.lastSeeding?.qualityScore || 0}%
                </div>
                <Progress
                  value={seedingStatus?.lastSeeding?.qualityScore || 0}
                  className="mt-2 bg-gray-700 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-green-500"
                />
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Last Seeding
                </CardTitle>
                <Clock className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-sm text-white">
                  {seedingStatus?.lastSeeding?.timestamp
                    ? new Date(
                        seedingStatus.lastSeeding.timestamp
                      ).toLocaleDateString()
                    : "Never"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Engines Quick Status */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">AI Engines Status</CardTitle>
              <CardDescription className="text-gray-300">
                Current status of all four AI engines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(seedingStatus?.engineStatuses || {}).map(
                  ([engineName, status]) => {
                    const IconComponent =
                      ENGINE_ICONS[engineName as keyof typeof ENGINE_ICONS];
                    const StatusIcon = getStatusIcon(status.status);

                    return (
                      <div
                        key={engineName}
                        className="flex items-center space-x-3 p-3 border border-gray-700 bg-gray-800/50 rounded-lg"
                      >
                        <div
                          className={`p-2 rounded-lg ${ENGINE_COLORS[engineName as keyof typeof ENGINE_COLORS]}`}
                        >
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {engineName}
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <StatusIcon className="h-3 w-3" />
                            <span>
                              {status.recordCount.toLocaleString()} records
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Engines Tab */}
        <TabsContent value="engines" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(seedingStatus?.engineStatuses || {}).map(
              ([engineName, status]) => {
                const IconComponent =
                  ENGINE_ICONS[engineName as keyof typeof ENGINE_ICONS];

                return (
                  <Card
                    key={engineName}
                    className="bg-gray-800/50 border-gray-700"
                  >
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`p-2 rounded-lg ${ENGINE_COLORS[engineName as keyof typeof ENGINE_COLORS]}`}
                        >
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-white">
                            {engineName}
                          </CardTitle>
                          <CardDescription className="text-gray-300">
                            Last updated:{" "}
                            {status.lastUpdate === "Never" || !status.lastUpdate
                              ? "Never"
                              : new Date(status.lastUpdate).toLocaleString()}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Records:</span>
                        <span className="text-lg font-bold">
                          {status.recordCount.toLocaleString()}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Quality Score:
                          </span>
                          <span className="text-sm">
                            {status.qualityScore}%
                          </span>
                        </div>
                        <Progress
                          value={status.qualityScore}
                          className="bg-gray-700 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-green-500"
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <Badge
                          className={`text-white ${getStatusBadgeColor(status.status)}`}
                        >
                          {status.status}
                        </Badge>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => executeIndividualSeeding(engineName)}
                          disabled={isSeeding}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Seed Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
            )}
          </div>
        </TabsContent>

        {/* Data Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Source Status</CardTitle>
              <CardDescription>
                Status of all connected data sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(seedingStatus?.dataSourceStatuses || {}).map(
                  ([sourceName, source]) => {
                    const StatusIcon = getStatusIcon(source.status);

                    return (
                      <div
                        key={sourceName}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <StatusIcon
                            className={`h-5 w-5 ${
                              source.status === "active"
                                ? "text-green-500"
                                : source.status === "error"
                                  ? "text-red-500"
                                  : "text-gray-500"
                            }`}
                          />
                          <div>
                            <div className="font-medium">{sourceName}</div>
                            <div className="text-sm text-muted-foreground">
                              {source.recordCount.toLocaleString()} records
                              available
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusBadgeColor(source.status)}>
                            {source.status}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            Last check:{" "}
                            {new Date(source.lastCheck).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seeding History</CardTitle>
              <CardDescription>
                Previous seeding operations and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {seedingStatus?.lastSeeding ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle
                        className={`h-5 w-5 ${
                          seedingStatus.lastSeeding.success
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      />
                      <div>
                        <div className="font-medium">
                          {seedingStatus.lastSeeding.success
                            ? "Success"
                            : "Failed"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(
                            seedingStatus.lastSeeding.timestamp
                          ).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {seedingStatus.lastSeeding.totalRecords.toLocaleString()}{" "}
                        records
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {(
                          seedingStatus.lastSeeding.executionTime /
                          1000 /
                          60
                        ).toFixed(1)}{" "}
                        minutes
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No seeding history available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
